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

  // Get SQL file from command line arguments
  const sqlFileName = process.argv[2]
  if (!sqlFileName) {
    console.error('Usage: npx ts-node scripts/run-migration-pg.ts <migration_file_name.sql>')
    return
  }

  const sqlPath = path.join(process.cwd(), 'scripts', sqlFileName)
  if (!fs.existsSync(sqlPath)) {
    console.error(`File not found: ${sqlPath}`)
    return
  }

  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log(`Executing SQL migration ${sqlFileName} with postgres-js...`)
  
  const sqlClient = postgres(connectionString)

  try {
    // Split the SQL into individual statements to handle errors better if needed,
    // but unsafe(sql) should work for multi-statement strings.
    await sqlClient.unsafe(sql)
    console.log(`Migration ${sqlFileName} completed successfully!`)
  } catch (error) {
    console.error(`Error executing migration ${sqlFileName}:`, error)
  } finally {
    await sqlClient.end()
  }
}

runMigration()
