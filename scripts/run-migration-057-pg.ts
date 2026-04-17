import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import postgres from 'postgres'

// Load environment variables from .env
dotenv.config({ path: '.env' })

async function runMigration() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING

  if (!connectionString) {
    console.error('Missing POSTGRES_URL_NON_POOLING environment variable')
    return
  }

  const sqlPath = path.join(process.cwd(), 'scripts', '057_fix_accounting_trigger.sql')
  const sqlContent = fs.readFileSync(sqlPath, 'utf8')

  console.log('🚀 Executing fix for accounting trigger (Migration 057)...')
  
  const sqlClient = postgres(connectionString, {
    ssl: 'require'
  })

  try {
    await sqlClient.unsafe(sqlContent)
    console.log('✅ Migration 057 completed successfully!')
  } catch (error) {
    console.error('❌ Error executing migration 057:', error)
  } finally {
    await sqlClient.end()
  }
}

runMigration()
