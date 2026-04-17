-- SQL to explicitly grant access to edamoke@gmail.com and fix any remaining RLS issues

-- 1. Explicitly grant Admin role and bypass is_admin checks
UPDATE public.profiles 
SET role = 'admin', is_admin = true 
WHERE email = 'edamoke@gmail.com';

-- 2. Create a fail-safe Admin Access Policy for Profiles
-- Using email check avoids recursion because auth.jwt() ->> 'email' is a static string
DROP POLICY IF EXISTS "profiles_staff_select" ON public.profiles;
CREATE POLICY "profiles_admin_email_select" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
    auth.jwt() ->> 'email' = 'edamoke@gmail.com'
    OR
    id = auth.uid()
);

-- 3. Apply same fail-safe to Orders
DROP POLICY IF EXISTS "orders_staff_select_v6" ON public.orders;
CREATE POLICY "orders_admin_email_select" 
ON public.orders FOR SELECT 
TO authenticated 
USING (
    auth.jwt() ->> 'email' = 'edamoke@gmail.com'
    OR
    user_id = auth.uid()
);

-- 4. Apply same fail-safe to Order Items
DROP POLICY IF EXISTS "order_items_staff_select_v6" ON public.order_items;
CREATE POLICY "order_items_admin_email_select" 
ON public.order_items FOR SELECT 
TO authenticated 
USING (
    auth.jwt() ->> 'email' = 'edamoke@gmail.com'
    OR
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
);

-- 5. Grant Update/Delete access to the admin email
CREATE POLICY "profiles_admin_email_manage" ON public.profiles FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'edamoke@gmail.com');

CREATE POLICY "orders_admin_email_manage" ON public.orders FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'edamoke@gmail.com');

-- 6. Ensure the user exists in profiles if they are in auth.users
-- (Safety check in case they were deleted from public.profiles but remain in auth.users)
INSERT INTO public.profiles (id, email, role, is_admin)
SELECT id, email, 'admin', true
FROM auth.users
WHERE email = 'edamoke@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', is_admin = true;
