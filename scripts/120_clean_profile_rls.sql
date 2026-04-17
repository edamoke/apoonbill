
-- Reset all SELECT policies on profiles table to ensure consistent access for dashboards
-- This resolves issues where accountants/chefs are redirected because they can't read their own profiles

-- 1. Disable RLS temporarily to ensure we can clean up
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop all known SELECT policies on profiles
DROP POLICY IF EXISTS "profiles_select_v5" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_v6" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles (Final)" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles (JWT)" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_self" ON public.profiles;
DROP POLICY IF EXISTS "Profiles view policy" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.profiles;

-- 3. Create ONE single, authoritative, permissive SELECT policy for authenticated users
-- This allows any logged in user to see profile data (needed for role checks and UI)
CREATE POLICY "profiles_select_authenticated"
ON public.profiles FOR SELECT
TO authenticated
USING ( true );

-- 4. Clean up UPDATE policies and create a clear one
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;

CREATE POLICY "profiles_update_policy_v2"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id 
  OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)))
)
WITH CHECK (
  auth.uid() = id 
  OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)))
);

-- 5. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Verify and force accountant flags for macpczone@gmail.com
UPDATE public.profiles 
SET role = 'accountant', is_accountant = true 
WHERE LOWER(email) = LOWER('macpczone@gmail.com');
