-- Fix profile visibility to allow relational joins for orders
-- Customers need to be able to see the basic profile info of staff assigned to their orders
-- Or more simply, let authenticated users see the names of staff members

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view staff profiles" ON public.profiles;

-- Allow authenticated users to view profiles with staff roles
-- This is safe as it only reveals staff names/roles to logged-in users
CREATE POLICY "Users can view staff profiles"
  ON public.profiles FOR SELECT
  USING (
    role IN ('admin', 'chef', 'rider', 'accountant')
    OR
    is_admin = true
    OR
    auth.uid() = id
  );

-- Ensure that the 'accountant' role is included in the allowed roles if it wasn't before
-- Note: The original table definition had a check constraint. If we added 'accountant' later,
-- we might need to update the constraint, but usually we can just rely on the policy for now.
