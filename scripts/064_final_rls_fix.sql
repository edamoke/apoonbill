-- Migration 064: Final RLS Fix for Profiles Access
-- 1. Allow all authenticated users to read profiles (needed for headers/checks)
-- 2. Maintain strict update policies
-- 3. Fix potential email case issues for admin recovery

-- Remove old restrictive policies
DROP POLICY IF EXISTS "Safe profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles view policy" ON public.profiles;

-- 1. Allow any authenticated user to view profiles
-- This is necessary for the app to function (role checks, full name lookups in orders, etc.)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING ( true );

-- 2. Keep update restricted
DROP POLICY IF EXISTS "Safe profiles update" ON public.profiles;
CREATE POLICY "Profiles update policy"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id 
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
-- Note: The above subquery is now safe because the SELECT policy is 'true' 
-- and doesn't depend on the UPDATE policy.

-- 3. Force Admin Access for edamoke@gmail.com (Resilient update)
DO $$
BEGIN
    UPDATE public.profiles 
    SET role = 'admin', is_admin = true 
    WHERE LOWER(email) = LOWER('edamoke@gmail.com');
END $$;

-- 4. Re-enable site_settings for everyone to read
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings"
ON public.site_settings FOR SELECT
USING ( true );
