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

  const sqlPath = path.join(process.cwd(), 'scripts', '021_update_order_statuses.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log('Executing SQL migration...')
  
  const sqlClient = postgres(connectionString)

  try {
    // We need to execute the SQL commands. Since postgres-js handles one command at a time 
    // or we can use the raw string if it's formatted correctly, but let's split by semicolon 
    // to be safer or just try executing the whole thing.
    
    // Most postgres clients can handle multiple statements if separated by semicolons.
    await sqlClient.unsafe(sql)
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Error executing migration:', error)
  } finally {
    await sqlClient.end()
  }
}

runMigration()
