require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  console.error('Missing connection string environment variable');
  process.exit(1);
}

const sql_conn = postgres(connectionString);

async function runMigration() {
  const migrationPath = path.join(process.cwd(), 'scripts', '052_fix_ai_rls_and_schema.sql');
  const sqlContent = fs.readFileSync(migrationPath, 'utf8');

  console.log('Running migration: 052_fix_ai_rls_and_schema.sql via postgres-js');
  
  try {
    await sql_conn.unsafe(sqlContent);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql_conn.end();
  }
}

runMigration();
