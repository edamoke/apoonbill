import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function runMigration() {
  const migrationPath = process.argv[2];
  if (!migrationPath) {
    console.error('Please provide a migration file path');
    process.exit(1);
  }

  try {
    const sql = fs.readFileSync(path.resolve(migrationPath), 'utf8');
    console.log(`Running migration: ${migrationPath}`);

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }

    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Error reading migration file:', err);
    process.exit(1);
  }
}

runMigration();
