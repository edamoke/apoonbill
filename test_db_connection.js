const { Client } = require('pg');

async function testDbConnection() {
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432, // Default PostgreSQL port
    ssl: { rejectUnauthorized: false } // For Supabase SSL
  });

  try {
    await client.connect();
    console.log('Database connection successful!');
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await client.end();
  }
}

// Load environment variables from .env file
require('dotenv').config();

testDbConnection();