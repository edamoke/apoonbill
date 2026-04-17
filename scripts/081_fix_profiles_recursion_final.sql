
-- FIX RECURSIVE PROFILES RLS
-- This script replaces all conflicting profiles policies with a clean, non-recursive set.

-- 1. Drop ALL existing policies on profiles to clear the mess
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view staff profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_email_manage" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_email_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_v7" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- 2. Create simplified, non-recursive policies

-- A. SELECT: Users can see themselves
CREATE POLICY "profiles_select_self" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- B. SELECT: Admins can see everyone (using JWT to avoid recursion)
-- We trust the 'is_admin' claim in the JWT or the specific email
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'email' = 'edamoke@gmail.com') OR
    (auth.jwt() ->> 'role' = 'service_role') OR
    ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true) OR
    ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true)
  );

-- C. UPDATE: Users can update themselves
CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- D. UPDATE: Admins can update everyone
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'email' = 'edamoke@gmail.com') OR
    ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true)
  );

-- E. INSERT: Allow users to insert their own profile (for sign up)
CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Grant permissions to ensure basic access
GRANT SELECT, UPDATE, INSERT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon; -- For public profiles if needed, restricted by RLS

-- 4. Verify RLS is ENABLED
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
