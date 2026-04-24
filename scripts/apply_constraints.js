
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyConstraints() {
  const sqlPath = path.join(process.cwd(), 'scripts', 'fix_order_constraints.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Applying order constraints fix...');

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.log('Public RPC failed, trying postgres scheme...');
    const { data: data2, error: error2 } = await supabase.rpc('exec_sql', { sql_query: sql }, { head: false });
    if (error2) {
      console.error('Error applying fix (v2):', error2);
      return;
    }
    console.log('Successfully applied (v2)');
    return;
  } else if (data && !data.success) {
    console.error('Error applying fix:', error);
  } else if (data && !data.success) {
    console.error('SQL execution failed:', data.error);
  } else {
    console.log('Successfully applied order constraints fix!');
  }
}

applyConstraints().catch(console.error);
