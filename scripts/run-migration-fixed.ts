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

  const sqlFileName = process.argv[2] || '035_add_json_menu_items.sql'
  const sqlPath = path.join(process.cwd(), 'scripts', sqlFileName)
  
  if (!fs.existsSync(sqlPath)) {
    console.error(`File not found: ${sqlPath}`)
    return
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf8')

  console.log(`Executing SQL migration from ${sqlFileName}...`)
  
  const sqlClient = postgres(connectionString)

  try {
    await sqlClient.unsafe(sqlContent)
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Error executing migration:', error)
  } finally {
    await sqlClient.end()
  }
}

runMigration()
