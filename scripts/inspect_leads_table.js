const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectTable() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      SELECT 
        column_name, 
        data_type 
      FROM 
        information_schema.columns 
      WHERE 
        table_name = 'business_leads';
    `
  });

  if (error) {
    console.error('Error fetching columns:', error);
  } else {
    console.log('Columns:', JSON.stringify(data, null, 2));
  }

  const { data: policies, error: policyError } = await supabase.rpc('exec_sql', {
    sql_query: `
      SELECT 
        policyname, 
        permissive, 
        roles, 
        cmd, 
        qual, 
        with_check 
      FROM 
        pg_policies 
      WHERE 
        tablename = 'business_leads';
    `
  });

  if (policyError) {
    console.error('Error fetching policies:', policyError);
  } else {
    console.log('Policies:', JSON.stringify(policies, null, 2));
  }
}

inspectTable();
