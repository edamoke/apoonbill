FROM node:20-slim AS base

# Install dependencies and build the application
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
# We are not copying .env files directly as they are handled by docker-compose.yml env_file
# For node:slim, we might need some build essentials if there were native modules to compile,
# but usually lightningcss provides prebuilt binaries for glibc (debian) more reliably than musl (alpine).
RUN apt-get update && apt-get install -y libc6 && rm -rf /var/lib/apt/lists/*
RUN npm install
COPY . .

# Set environment variables for the build process
# Set environment variables for the build process
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# No build-time variables are directly passed for pnpm run build, relying on runtime environment variables.
RUN npm run build

# Run the application
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Suppress Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
