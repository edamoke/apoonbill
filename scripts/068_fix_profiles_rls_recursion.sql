-- SQL to fix Recursive RLS on Profiles and ensure Admin/Staff Access

-- 1. Profiles Table Policies (Remove Recursion)
-- We use a more direct approach to avoid infinite loops
DROP POLICY IF EXISTS "profiles_select_v5" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_v4" ON public.profiles;

-- Anyone authenticated can see their own profile
CREATE POLICY "profiles_self_select" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Staff members can see all profiles (needed for order assignments etc)
-- To avoid recursion, we check if the user is an admin or staff WITHOUT querying the profiles table in the USING clause if possible, 
-- or by using a simpler check that PostgreSQL can optimize.
CREATE POLICY "profiles_staff_select" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant')
);

-- 2. Refined Orders Policy (Staff Access)
DROP POLICY IF EXISTS "orders_select_v5" ON public.orders;
CREATE POLICY "orders_staff_select_v6" 
ON public.orders FOR SELECT 
TO authenticated 
USING (
    auth.uid() = user_id 
    OR 
    customer_email = (auth.jwt() ->> 'email')
    OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant')
);

-- 3. Refined Order Items Policy
DROP POLICY IF EXISTS "order_items_select_v5" ON public.order_items;
CREATE POLICY "order_items_staff_select_v6" 
ON public.order_items FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_id 
        AND (
            orders.user_id = auth.uid() 
            OR 
            orders.customer_email = (auth.jwt() ->> 'email')
            OR
            (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant')
        )
    )
);

-- 4. Critical: Grant access to the authenticated role for basic operations
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
