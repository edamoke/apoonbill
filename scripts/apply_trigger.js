import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyTrigger() {
  try {
    console.log('--- Applying Trigger ---');

    // 1. Ensure exec_sql exists
    console.log('Ensuring exec_sql exists...');
    const execSqlDef = fs.readFileSync('scripts/000_create_exec_sql.sql', 'utf8');
    // We can't use rpc('exec_sql') to create exec_sql if it doesn't exist.
    // However, if we have the service role key, we might be able to run it if the API allows.
    // In many local setups, we use the postgres connection directly or a pre-existing RPC.
    
    // Attempting to apply the trigger directly via exec_sql
    const triggerSql = fs.readFileSync('scripts/043_supply_order_delivery_trigger.sql', 'utf8');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: triggerSql });
    
    if (error) {
      console.error('Failed to apply trigger via exec_sql:', error);
      console.log('Trying to create exec_sql first (this might fail if exec_sql is missing and no other way to run SQL)...');
      // If exec_sql is missing, this is a chicken-and-egg problem via API.
      // Usually, migrations are run via CLI or a setup script that has direct DB access.
    } else {
      console.log('Trigger applied successfully:', data);
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

applyTrigger();
