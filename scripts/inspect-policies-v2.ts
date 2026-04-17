
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function inspectPolicies() {
  const { default: postgres } = await import('postgres');
  
  if (!process.env.POSTGRES_URL_NON_POOLING) {
      console.error('Missing POSTGRES_URL_NON_POOLING');
      process.exit(1);
  }

  const sql = postgres(process.env.POSTGRES_URL_NON_POOLING, { ssl: 'require' });

  try {
    const policies = await sql`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies
      WHERE tablename = 'profiles'
    `;

    console.log('Policies on profiles table:');
    console.table(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
  } finally {
    await sql.end();
  }
}

inspectPolicies();
