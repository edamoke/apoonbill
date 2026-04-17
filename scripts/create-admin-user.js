import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    // Admin credentials
    const adminEmail = 'admin@mamajos.com';
    const adminPassword = 'Admin@123456';
    const adminName = 'Administrator';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Check if admin user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (existingUser) {
      console.log('Admin user already exists');
      console.log(`\n=== ADMIN CREDENTIALS ===`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`\nAdmin Link: http://localhost:3000/admin/sign-in`);
      process.exit(0);
    }
    
    // Insert admin user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: adminEmail,
          password_hash: hashedPassword,
          full_name: adminName,
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating admin user:', error);
      process.exit(1);
    }
    
    console.log('✓ Admin user created successfully!');
    console.log(`\n=== ADMIN CREDENTIALS ===`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`\nAdmin Link: http://localhost:3000/admin/sign-in`);
    console.log(`\n⚠️  Please change the password after your first login for security.`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdminUser();
