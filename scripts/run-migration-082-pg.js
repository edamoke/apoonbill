
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = fs.existsSync(path.resolve(process.cwd(), ".env")) 
  ? path.resolve(process.cwd(), ".env")
  : path.resolve(process.cwd(), ".env.local")

if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(connectionString);

async function runMigration() {
  try {
    const migrationSql = fs.readFileSync(path.resolve(process.cwd(), "scripts/082_stock_snapshots.sql"), "utf8");
    console.log("Running migration 082...");
    await sql.unsafe(migrationSql);
    console.log("Stock Analysis Migration (082) applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

runMigration();
