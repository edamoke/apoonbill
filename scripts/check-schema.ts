import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
  console.log('Checking recipes table columns...');
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: "SELECT jsonb_agg(information_schema.columns) FROM information_schema.columns WHERE table_name = 'recipes'"
  });

  if (error) {
    console.error('Error checking recipes schema:', error);
  } else {
    console.log('Recipes columns:', data);
  }

  console.log('Checking order_items table columns...');
  const { data: orderItems, error: orderItemsError } = await supabase.rpc('exec_sql', {
    sql_query: "SELECT jsonb_agg(information_schema.columns) FROM information_schema.columns WHERE table_name = 'order_items'"
  });

  if (orderItemsError) {
    console.error('Error checking order_items schema:', orderItemsError);
  } else {
    console.log('Order Items columns:', orderItems);
  }
}

checkSchema();
