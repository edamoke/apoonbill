import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const migrationPath = path.join(__dirname, '032_create_site_settings.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Running migration 032...');

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    if (error.message.includes('function "exec_sql" does not exist')) {
      // If exec_sql doesn't exist, we try to run the SQL directly using the REST API if possible, 
      // but usually for migrations we use the CLI or a dedicated helper.
      // Alternatively, we can split the SQL and run it.
      console.log('exec_sql function not found, attempting to split and run...');
      const statements = sql.split(';').filter(s => s.trim().length > 0);
      for (const statement of statements) {
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: statement });
          if (stmtError) {
              console.error('Error executing statement:', statement);
              console.error(stmtError);
          }
      }
    } else {
      console.error('Migration error:', error);
    }
  } else {
    console.log('Migration 032 completed successfully');
  }
}

runMigration();
