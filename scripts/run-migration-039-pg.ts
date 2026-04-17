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

  const sqlPath = path.join(process.cwd(), 'scripts', '039_accounting_automation.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log('Executing SQL migration 039 with postgres-js...')
  
  const sqlClient = postgres(connectionString)

  try {
    await sqlClient.unsafe(sql)
    console.log('Migration 039 completed successfully!')
  } catch (error) {
    console.error('Error executing migration 039:', error)
    process.exit(1)
  } finally {
    await sqlClient.end()
  }
}

runMigration()
