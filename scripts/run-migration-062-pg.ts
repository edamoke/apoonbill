import postgres from "postgres"
import * as dotenv from "dotenv"
import { readFileSync } from "fs"
import { join } from "path"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function runMigration() {
  const migrationPath = join(process.cwd(), "scripts", "062_profile_and_automation_fixes.sql")
  const migrationSql = readFileSync(migrationPath, "utf8")

  try {
    console.log("🚀 Running migration 062...")
    await sql.unsafe(migrationSql)
    console.log("✅ Migration 062 completed successfully!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
  } finally {
    await sql.end()
  }
}

runMigration()
