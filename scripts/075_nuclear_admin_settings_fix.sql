
-- NUCLEAR FIX for site_settings and admin panel access

-- 1. DROP and RE-CREATE site_settings policies to be absolutely sure
DROP POLICY IF EXISTS "Allow public read access on site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow admin write access on site_settings" ON site_settings;
DROP POLICY IF EXISTS "site_settings_public_select" ON site_settings;
DROP POLICY IF EXISTS "MASTER_PUBLIC_VIEW" ON site_settings;

-- Public read access (essential for HomePage)
CREATE POLICY "MASTER_PUBLIC_VIEW" ON site_settings FOR SELECT USING (true);

-- Admin full access (specifically targeting edamoke@gmail.com by email bypass if needed, but profiles should work too)
CREATE POLICY "MASTER_ADMIN_ALL" ON site_settings FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.is_admin = true)
  )
  OR (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
);

-- 2. Profiles: Ensure edamoke@gmail.com can see all profiles (essential for admin panel)
DROP POLICY IF EXISTS "NUCLEAR_ADMIN_PROFILES_SELECT" ON profiles;
CREATE POLICY "MASTER_ADMIN_PROFILES_SELECT" 
ON profiles FOR SELECT 
USING (
    (auth.jwt() ->> 'email') = 'edamoke@gmail.com' 
    OR id = auth.uid()
    OR (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.role = 'admin' OR p.is_admin = true)
        )
    )
);

-- 3. Force edamoke@gmail.com to be admin in both auth and profiles
UPDATE auth.users 
SET raw_app_metadata = raw_app_metadata || '{"role": "admin", "is_admin": true}',
    raw_user_metadata = raw_user_metadata || '{"role": "admin", "is_admin": true}'
WHERE email = 'edamoke@gmail.com';

UPDATE profiles 
SET role = 'admin', is_admin = true, is_suspended = false 
WHERE email = 'edamoke@gmail.com';

-- 4. Grant schema permissions just in case
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
