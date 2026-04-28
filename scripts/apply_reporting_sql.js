import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySql(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Applying SQL from ${filePath}...`);
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      throw error;
    } else {
      console.log(`Successfully applied SQL from ${filePath}.`);
    }
  } catch (err) {
    console.error(`Failed to apply SQL from ${filePath}:`, err.message);
    throw err;
  }
}

async function run() {
  try {
    // Try to apply reporting SQL directly
    await applySql('scripts/042_supply_chain_reporting.sql');
  } catch (err) {
    if (err.message.includes('function "exec_sql" does not exist')) {
      console.log('"exec_sql" not found. Attempting to create it...');
      // This is a chicken-and-egg problem if we can't run SQL without exec_sql
      // But usually, some environments might allow certain types of queries or have other ways.
      // If this fails, the user will need to manually apply 000_create_exec_sql.sql in Supabase Dashboard.
      console.error('CRITICAL: Cannot apply SQL because "exec_sql" helper function is missing from the database.');
      console.error('Please manually run the content of "scripts/000_create_exec_sql.sql" in your Supabase SQL Editor.');
    }
  }
}

run();
