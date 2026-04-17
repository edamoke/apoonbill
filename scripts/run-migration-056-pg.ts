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

  const sqlPath = path.join(process.cwd(), 'scripts', '056_fix_rls_email_case.sql')
  const sqlContent = fs.readFileSync(sqlPath, 'utf8')

  console.log('🚀 Executing case-insensitive email RLS fix (Migration 056)...')
  
  const sqlClient = postgres(connectionString, {
    ssl: 'require'
  })

  try {
    await sqlClient.unsafe(sqlContent)
    console.log('✅ Migration 056 completed successfully!')
  } catch (error) {
    console.error('❌ Error executing migration 056:', error)
  } finally {
    await sqlClient.end()
  }
}

runMigration()
