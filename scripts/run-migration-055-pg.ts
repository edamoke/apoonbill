import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import postgres from 'postgres'

// Load environment variables from .env.local
dotenv.config({ path: '.env' })

async function runMigration() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING

  if (!connectionString) {
    console.error('Missing DATABASE_URL environment variable')
    return
  }

  const sqlPath = path.join(process.cwd(), 'scripts', '055_consolidated_staff_rls.sql')
  const sqlContent = fs.readFileSync(sqlPath, 'utf8')

  console.log('🚀 Executing consolidated staff RLS migration...')
  
  const sqlClient = postgres(connectionString, {
    ssl: 'require'
  })

  try {
    // Execute the whole script at once using unsafe
    await sqlClient.unsafe(sqlContent)
    console.log('✅ Consolidated staff RLS migration completed successfully!')
  } catch (error) {
    console.error('❌ Error executing consolidated staff RLS migration:', error)
  } finally {
    await sqlClient.end()
  }
}

runMigration()
