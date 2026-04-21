import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function testDbConnection() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // CRITICAL: This must be set before any connection is attempted

  const client = new Client({
    connectionString: process.env.POSTGRES_PRISMA_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Database connection successful using POSTGRES_PRISMA_URL!');
    
    // Check for profiles table
    const res = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')");
    console.log('Profiles table exists:', res.rows[0].exists);
    
    if (res.rows[0].exists) {
        const columns = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles'");
        console.log('Profiles columns:', columns.rows);
        
        // Also check if the trigger function exists
        const triggers = await client.query("SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'handle_new_user'");
        console.log('Trigger function handle_new_user exists:', triggers.rowCount > 0);
    }

  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await client.end();
  }
}

testDbConnection();
