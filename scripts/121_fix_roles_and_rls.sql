
-- Ensure bartenter is allowed in profiles table role check constraint
-- Also fix bartenter vs barman mismatch in the application

-- 1. Drop existing constraint if any
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Add updated constraint with all necessary roles including 'bartender'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'chef', 'rider', 'cashier', 'waiter', 'barman', 'bartender', 'accountant', 'supervisor', 'manager'));

-- 3. Fix the RLS update policy for admins to be more robust
DROP POLICY IF EXISTS "profiles_update_policy_v2" ON public.profiles;

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
