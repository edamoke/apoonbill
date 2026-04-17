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
  const migrationFilePath = path.join(__dirname, '031_update_profiles_and_storage.sql');
  const sql = fs.readFileSync(migrationFilePath, 'utf8');

  console.log('Executing SQL migration 031_update_profiles_and_storage.sql...');
  
  // We'll try to run the migration parts separately if exec_sql doesn't work, 
  // but for now let's hope the user can run this in Supabase SQL editor if this fails.
  // Actually, let's try a different approach. We can't easily run arbitrary SQL without exec_sql.
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('Migration failed:', error);
    console.log('\n--- IMPORTANT ---');
    console.log('If you see a "Could not find the function public.exec_sql" error,');
    console.log('please run the following SQL manually in your Supabase SQL Editor:');
    console.log('\n' + sql);
    console.log('\n-----------------');
    process.exit(1);
  }

  console.log('Migration completed successfully!');
}

runMigration();
