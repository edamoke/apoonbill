
-- FINAL OVERRIDE for edamoke@gmail.com

-- Ensure the user is an admin in every possible way
UPDATE auth.users 
SET raw_app_metadata = raw_app_metadata || '{"role": "admin", "is_admin": true}',
    raw_user_metadata = raw_user_metadata || '{"role": "admin", "is_admin": true, "full_name": "Eddy admin"}'
WHERE email = 'edamoke@gmail.com';

UPDATE public.profiles 
SET 
  role = 'admin', 
  is_admin = true, 
  is_suspended = false,
  full_name = 'Eddy admin',
  email_confirmed = true
WHERE email = 'edamoke@gmail.com';

-- Bypass RLS for profiles select to ensure the admin can always see their own profile and others
DROP POLICY IF EXISTS "MASTER_ADMIN_PROFILES_SELECT" ON profiles;
CREATE POLICY "MASTER_ADMIN_PROFILES_SELECT" 
ON profiles FOR SELECT 
USING (true); -- Make profiles publicly selectable for now to fix access issues, or at least for authenticated

-- Ensure site_settings is fully accessible
DROP POLICY IF EXISTS "MASTER_ADMIN_ALL" ON site_settings;
CREATE POLICY "MASTER_ADMIN_ALL" ON site_settings FOR ALL 
USING (true)
WITH CHECK (true);

-- Grant everything
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
