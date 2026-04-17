import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const adminEmail = 'admin@mamajos.com';
const adminPassword = 'Admin@123456';
const adminUsername = 'admin';

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');
    
    // Create hash of password using crypto
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(adminPassword, salt, 100000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;
    
    // First, create the user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth error:', authError);
      // Continue anyway, user might already exist
    } else {
      console.log('✓ Auth user created:', authData.user.id);
    }

    // Now insert into users table with admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert([
        {
          id: authData?.user?.id || crypto.randomUUID(),
          email: adminEmail,
          username: adminUsername,
          full_name: 'Admin User',
          role: 'admin',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ], { onConflict: 'email' });

    if (userError) {
      console.error('User creation error:', userError);
    } else {
      console.log('✓ Admin user created in database');
    }

    // Log credentials
    console.log('\n' + '='.repeat(60));
    console.log('ADMIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Admin Link: ${supabaseUrl.replace('https://', 'https://').split('.')[0]}/admin/sign-in`);
    console.log('='.repeat(60));
    console.log('\n✓ Admin setup complete!');

  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
}

setupAdmin();
