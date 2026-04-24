
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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
    console.error('Error applying fix:', error);
  } else if (data && !data.success) {
    console.error('SQL execution failed:', data.error);
  } else {
    console.log('Successfully applied order constraints fix!');
  }
}

applyConstraints().catch(console.error);
