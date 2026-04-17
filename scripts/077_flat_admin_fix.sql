
-- NUCLEAR RECURSION FIX for Profiles and Admin Panel Access

-- 1. DROP EVERYTHING that could be causing issues
DROP POLICY IF EXISTS "Safe profiles access" ON profiles;
DROP POLICY IF EXISTS "Safe profiles update" ON profiles;
DROP POLICY IF EXISTS "Profiles view policy" ON profiles;
DROP POLICY IF EXISTS "MASTER_ADMIN_PROFILES_SELECT" ON profiles;
DROP POLICY IF EXISTS "profiles_select_v8" ON profiles;
DROP POLICY IF EXISTS "NUCLEAR_ADMIN_PROFILES_SELECT" ON profiles;

-- 2. CREATE A COMPLETELY FLAT BYPASS POLICY
-- No subqueries to profiles. Use auth.uid() or hardcoded values.
CREATE POLICY "FLAT_BYPASS_SELECT" 
ON public.profiles FOR SELECT 
USING (
  id = auth.uid() 
  OR 
  (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

-- 3. ENSURE SETTINGS IS ALSO ACCESSIBLE
DROP POLICY IF EXISTS "MASTER_ADMIN_ALL" ON site_settings;
CREATE POLICY "SITE_SETTINGS_FLAT_BYPASS" 
ON public.site_settings FOR ALL 
USING (
  (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

-- 4. ENSURE USER IS SET UP CORRECTLY IN AUTH
UPDATE auth.users 
SET raw_app_metadata = raw_app_metadata || '{"role": "admin", "is_admin": true}',
    raw_user_metadata = raw_user_metadata || '{"role": "admin", "is_admin": true}'
WHERE email = 'edamoke@gmail.com';

-- 5. FINAL TABLE UPDATE
UPDATE public.profiles 
SET role = 'admin', is_admin = true, is_suspended = false 
WHERE email = 'edamoke@gmail.com';

-- 6. Grant everything
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
