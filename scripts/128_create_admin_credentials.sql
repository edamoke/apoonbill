-- Create default admin user for Mamajos
-- This script sets up the initial admin account with full access

-- 1. Insert the admin user into auth.users (if not exists)
-- Note: In production, use Supabase Auth UI or API to create users
-- This assumes the user admin@mamajos.com will be created via Supabase Auth dashboard

-- 2. Create/update the admin profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  is_admin,
  is_chef,
  is_accountant,
  is_rider,
  is_suspended,
  email_confirmed,
  created_at,
  updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin@mamajos.com',
  'System Administrator',
  'admin',
  true,
  true,
  true,
  true,
  false,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_admin = true,
  is_chef = true,
  is_accountant = true,
  is_rider = true,
  is_suspended = false,
  email_confirmed = true,
  updated_at = NOW();

-- 3. Grant all necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
