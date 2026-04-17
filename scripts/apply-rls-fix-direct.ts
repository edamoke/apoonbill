import postgres from "postgres"
import dotenv from "dotenv"
import { readFileSync } from "fs"
import { join } from "path"

// Load environment variables
dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("Missing POSTGRES_URL environment variable")
  process.exit(1)
}

const sql = postgres(connectionString, { ssl: "require" })

async function applyFixes() {
  try {
    console.log("Connected to database")

    const execSqlScript = readFileSync(join(process.cwd(), "scripts", "000_create_exec_sql.sql"), "utf8")
    await sql.unsafe(execSqlScript)
    console.log("exec_sql function ensured")

    const migrationSql = readFileSync(join(process.cwd(), "scripts", "054_fix_users_table_permission.sql"), "utf8")
    await sql.unsafe(migrationSql)
    console.log("Migration 054 (RLS fix) applied successfully")

  } catch (err) {
    console.error("Error applying fixes:", err)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

applyFixes()
