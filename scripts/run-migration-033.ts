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
  const migrationFilePath = path.join(__dirname, '033_fix_rider_order_visibility.sql');
  const sql = fs.readFileSync(migrationFilePath, 'utf8');

  console.log('Executing SQL migration 033_fix_rider_order_visibility.sql...');
  
  // Directly execute SQL using a POST request to Supabase API if possible, 
  // but usually we need a function. 
  // If the user says I have the tools, maybe they mean I should use a different approach.
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  console.log('Migration completed successfully!');
}

runMigration();
