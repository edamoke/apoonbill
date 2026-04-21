
-- Ensure roles are correctly updated and the admin has full permission
-- This migration ensures the is_admin function is robust and RLS policies use it

-- 1. Re-create the is_admin helper with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.is_admin_v2(user_id uuid)
RETURNS boolean AS $$
DECLARE
  is_adm boolean;
BEGIN
  SELECT (role = 'admin' OR is_admin = true) INTO is_adm
  FROM public.profiles
  WHERE id = user_id;
  RETURN COALESCE(is_adm, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Clean up existing policies on profiles
DROP POLICY IF EXISTS "Safe profiles update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy_v2" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 3. Create a clean, authoritative update policy
-- Allows users to update their own profile OR any user with admin status to update ANY profile
CREATE POLICY "profiles_update_authoritative"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id 
  OR 
  public.is_admin_v2(auth.uid())
)
WITH CHECK (
  auth.uid() = id 
  OR 
  public.is_admin_v2(auth.uid())
);

-- 4. Verify the current user (edamoke@gmail.com) has admin rights
UPDATE public.profiles 
SET role = 'admin', is_admin = true 
WHERE email = 'edamoke@gmail.com';

-- 5. Ensure the role check constraint is up to date (repeat for safety)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'chef', 'rider', 'cashier', 'waiter', 'barman', 'bartender', 'accountant', 'supervisor', 'manager'));
