import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSql(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.error('Error executing SQL:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception:', err.message);
    return false;
  }
}

async function setupDatabase() {
  const scriptsDir = path.join(process.cwd(), 'scripts');
  
  // Get all SQL files, sorted numerically
  const files = fs.readdirSync(scriptsDir)
    .filter(f => f.match(/^\d{3}_.*\.sql$/))
    .sort();

  console.log(`Found ${files.length} migration scripts`);
  
  let executed = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(scriptsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    if (sql.trim().length === 0) {
      console.log(`⊘ ${file} - Empty file, skipping`);
      continue;
    }

    console.log(`Executing: ${file}`);
    const success = await executeSql(sql);
    
    if (success) {
      console.log(`✓ ${file}`);
      executed++;
    } else {
      console.error(`✗ ${file}`);
      failed++;
    }
  }

  console.log(`\nDatabase setup complete!`);
  console.log(`✓ Successfully executed: ${executed} migrations`);
  if (failed > 0) {
    console.log(`✗ Failed: ${failed} migrations`);
    process.exit(1);
  }
}

setupDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
