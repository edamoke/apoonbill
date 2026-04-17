import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import postgres from 'postgres'

// Load environment variables from .env
dotenv.config({ path: '.env' })

async function runMigration() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL

  if (!connectionString) {
    console.error('Missing POSTGRES_URL_NON_POOLING or DATABASE_URL environment variable')
    return
  }

  const sqlPath = path.join(process.cwd(), 'scripts', '042_supply_chain_reporting.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log('Executing SQL migration 042 (Postgres)...')
  
  const sqlClient = postgres(connectionString)

  try {
    await sqlClient.unsafe(sql)
    console.log('Migration 042 completed successfully!')
  } catch (error) {
    console.error('Error executing migration:', error)
  } finally {
    await sqlClient.end()
  }
}

runMigration()
