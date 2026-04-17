import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import postgres from 'postgres'

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function runMigration() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING

  if (!connectionString) {
    console.error('Missing POSTGRES_URL_NON_POOLING environment variable')
    return
  }

  const sqlPath = path.join(process.cwd(), 'scripts', '025_fix_bookings_schema.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log('Executing SQL migration: 025_fix_bookings_schema.sql')
  
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
