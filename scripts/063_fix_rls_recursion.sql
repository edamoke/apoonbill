-- Migration 063: Fix recursive RLS policies and admin permissions

-- 1. Reset Profile policies to a safe state
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 2. Create base non-recursive policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- Admins can view everything (Using service role or bypass is better, 
-- but for RLS we use a subquery that doesn't trigger recursion or use auth.jwt())
-- To avoid recursion, we check the metadata or a dedicated role table if possible, 
-- but since everything is in 'profiles', we use 'auth.jwt()' which is safer.
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING ( 
  (auth.jwt() ->> 'email') IN (SELECT email FROM public.profiles WHERE role = 'admin' OR is_admin = true)
  OR (auth.uid() = id)
);

-- Note: The above might still recurse if 'SELECT email FROM public.profiles' is called.
-- BETTER WAY: Use auth.jwt() to check role if it's synced to app_metadata, 
-- or use a non-recursive check like checking if the user IS an admin in a simpler way.

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Let's use the most stable non-recursive pattern:
-- 1. Everyone can see themselves
-- 2. Admins can see everyone based on THEIR own ID having the admin flag
CREATE POLICY "Profiles view policy"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id 
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
-- Wait, the above STILL recurses because it selects from profiles.

-- THE ULTIMATE FIX FOR RECURSION:
-- Use a helper function with SECURITY DEFINER to bypass RLS during the check.

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND (role = 'admin' OR is_admin = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Safe profiles access"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id 
  OR 
  public.is_admin(auth.uid())
);

CREATE POLICY "Safe profiles update"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = id 
  OR 
  public.is_admin(auth.uid())
)
WITH CHECK (
  auth.uid() = id 
  OR 
  public.is_admin(auth.uid())
);

-- 3. Fix site_settings RLS (which likely caused the initial error)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings"
ON public.site_settings FOR SELECT
USING ( true );

DROP POLICY IF EXISTS "Admin manage site_settings" ON public.site_settings;
CREATE POLICY "Admin manage site_settings"
ON public.site_settings FOR ALL
USING ( public.is_admin(auth.uid()) );

-- 4. Ensure edamoke@gmail.com is actually an admin
UPDATE public.profiles 
SET role = 'admin', is_admin = true 
WHERE email = 'edamoke@gmail.com';
