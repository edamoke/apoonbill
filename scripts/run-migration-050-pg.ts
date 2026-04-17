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

  const migrationFile = process.argv[2] || '050_advanced_accounting_schema.sql'
  const sqlPath = path.join(process.cwd(), 'scripts', migrationFile)
  
  if (!fs.existsSync(sqlPath)) {
    console.error(`Migration file not found: ${sqlPath}`)
    return
  }

  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log(`Executing SQL migration ${migrationFile} using postgres-js...`)
  
  const sqlClient = postgres(connectionString)

  try {
    await sqlClient.unsafe(sql)
    console.log(`Migration ${migrationFile} completed successfully!`)
  } catch (error) {
    console.error('Error executing migration:', error)
    process.exit(1)
  } finally {
    await sqlClient.end()
  }
}

runMigration()
