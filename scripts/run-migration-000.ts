import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const migrationFilePath = path.join(__dirname, '000_create_exec_sql.sql');
  const sql = fs.readFileSync(migrationFilePath, 'utf8');

  console.log('Executing SQL migration 000_create_exec_sql.sql...');
  
  // We use the postgres direct connection if available, but here we only have the client
  // Some environments have a REST endpoint for SQL, but standard Supabase uses RPC
  // If exec_sql doesn't exist, we can't create it via RPC because RPC needs an existing function.
  
  // Wait, I can use the supabase-js query builder to some extent, but not for DDL like CREATE POLICY.
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  console.log('Migration completed successfully!');
}

runMigration();
