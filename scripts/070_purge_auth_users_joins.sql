-- SQL to purge ALL auth.users joins and fix the systemic "Permission Denied" errors

-- 1. Orders table: Replace users subqueries with JWT metadata
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "orders_select_v7" 
ON public.orders FOR SELECT 
TO authenticated 
USING (
    auth.uid() = user_id 
    OR 
    customer_email = (auth.jwt() ->> 'email')
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant'))
);

-- 2. Order Items: Replace users subqueries
DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
CREATE POLICY "order_items_select_v7" 
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
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant'))
        )
    )
);

-- 3. Profile Access: Use JWT email for Admin bypass to avoid recursion
DROP POLICY IF EXISTS "profiles_select_v5" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "profiles_select_v7"
ON public.profiles FOR SELECT
TO authenticated
USING (
    auth.uid() = id
    OR
    (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant'))
);

-- 4. Global Grant
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT ALL ON public.pos_tables TO authenticated;
