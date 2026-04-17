
import dotenv from 'dotenv';

dotenv.config();

async function checkUserIds() {
  const { default: postgres } = await import('postgres');
  
  if (!process.env.POSTGRES_URL_NON_POOLING) {
      console.error('Missing POSTGRES_URL_NON_POOLING');
      process.exit(1);
  }

  const sql = postgres(process.env.POSTGRES_URL_NON_POOLING, { ssl: 'require' });

  try {
    const users = await sql`
      SELECT 
        au.id as auth_id, 
        au.email, 
        p.id as profile_id,
        p.role,
        p.is_accountant
      FROM auth.users au
      FULL OUTER JOIN public.profiles p ON au.id = p.id
      WHERE au.email = 'macpczone@gmail.com' OR p.email = 'macpczone@gmail.com'
    `;

    console.log('User ID Check for macpczone@gmail.com:');
    console.table(users);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await sql.end();
  }
}

checkUserIds();
