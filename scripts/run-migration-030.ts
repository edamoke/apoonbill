import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import postgres from 'postgres'

// Load environment variables from .env
dotenv.config()

async function runMigration() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING

  if (!connectionString) {
    console.error('Missing POSTGRES_URL_NON_POOLING environment variable')
    return
  }

  const migrationFile = '030_fix_profile_visibility_rls.sql'
  const sqlPath = path.join(process.cwd(), 'scripts', migrationFile)
  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log(`Executing SQL migration ${migrationFile}...`)
  
  const sqlClient = postgres(connectionString)

  try {
    await sqlClient.unsafe(sql)
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Error executing migration:', error)
    process.exit(1)
  } finally {
    await sqlClient.end()
  }
}

runMigration()
