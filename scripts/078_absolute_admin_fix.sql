
-- FINAL OVERRIDE for edamoke@gmail.com - ABSOLUTE ADMIN

-- 1. Ensure the user is an admin in every possible way in auth.users
UPDATE auth.users 
SET raw_app_metadata = raw_app_metadata || '{"role": "admin", "is_admin": true, "is_accountant": true, "is_chef": true, "is_rider": true}',
    raw_user_metadata = raw_user_metadata || '{"role": "admin", "is_admin": true, "full_name": "Eddy admin"}'
WHERE email = 'edamoke@gmail.com';

-- 2. Ensure public.profiles reflects this absolute status
UPDATE public.profiles 
SET 
  role = 'admin', 
  is_admin = true, 
  is_accountant = true,
  is_chef = true,
  is_rider = true,
  is_suspended = false,
  full_name = 'Eddy admin',
  email_confirmed = true
WHERE email = 'edamoke@gmail.com';

-- 3. Reset and create FLAT, NON-RECURSIVE RLS policies for profiles
-- DROP ALL potentially conflicting policies first
DROP POLICY IF EXISTS "Safe profiles access" ON profiles;
DROP POLICY IF EXISTS "Safe profiles update" ON profiles;
DROP POLICY IF EXISTS "Profiles view policy" ON profiles;
DROP POLICY IF EXISTS "MASTER_ADMIN_PROFILES_SELECT" ON profiles;
DROP POLICY IF EXISTS "profiles_select_v8" ON profiles;
DROP POLICY IF EXISTS "NUCLEAR_ADMIN_PROFILES_SELECT" ON profiles;
DROP POLICY IF EXISTS "FLAT_BYPASS_SELECT" ON profiles;

-- Create simple, direct policies using auth.jwt() to avoid recursion
-- Everyone can see their own profile
CREATE POLICY "profiles_self_select" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

-- Admin bypass based on email or metadata (FLAT check)
CREATE POLICY "profiles_admin_bypass" ON public.profiles
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

-- Everyone can update their own profile
CREATE POLICY "profiles_self_update" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin can update anything
CREATE POLICY "profiles_admin_update" ON public.profiles
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
  OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
)
WITH CHECK (true);

-- 4. Grant schema permissions to avoid "permission denied"
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
