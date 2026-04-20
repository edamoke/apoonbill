import pkg from 'pg';
const { Client } = pkg;
import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

// Bypass SSL verification for self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("Missing DATABASE_URL environment variable");
  process.exit(1);
}

async function runMigration() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
      console.error("Please provide a migration file path");
      process.exit(1);
  }
  const migrationFile = args[0];
  
  const client = new Client({
    connectionString: dbUrl,
  });

  try {
    await client.connect();
    const migrationPath = join(process.cwd(), migrationFile);
    const sql = readFileSync(migrationPath, "utf8");

    console.log(`Running migration from ${migrationFile} via Direct Postgres...`);
    
    await client.query(sql);

    console.log(`Migration ${migrationFile} completed successfully`);
  } catch (error) {
    console.error("Error running migration:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
