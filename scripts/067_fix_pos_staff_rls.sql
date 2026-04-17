-- SQL to fix POS staff permissions and relax restrictive RLS

-- 1. Relax Orders RLS to allow staff visibility
DROP POLICY IF EXISTS "orders_select_v4" ON public.orders;
CREATE POLICY "orders_select_v5" 
ON public.orders FOR SELECT 
TO authenticated 
USING (
    auth.uid() = user_id 
    OR 
    customer_email = (auth.jwt() ->> 'email')
    OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant')
    )
);

-- 2. Relax Order Items RLS to allow staff visibility
DROP POLICY IF EXISTS "order_items_select_v4" ON public.order_items;
CREATE POLICY "order_items_select_v5" 
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
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant')
            )
        )
    )
);

-- 3. Ensure profiles are visible to staff (for joining)
DROP POLICY IF EXISTS "profiles_select_v4" ON public.profiles;
CREATE POLICY "profiles_select_v5"
ON public.profiles FOR SELECT
TO authenticated
USING (
    auth.uid() = id
    OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant')
    )
);

-- 4. Grant full access to staff for POS operations
CREATE POLICY "orders_update_staff" ON public.orders FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant')
    )
);

CREATE POLICY "order_items_all_staff" ON public.order_items FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant')
    )
);
