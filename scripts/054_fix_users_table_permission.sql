-- Fix "permission denied for table users" by avoiding direct joins with auth.users
-- This migration updates ALL policies that might be querying auth.users

-- 1. Orders table policies
DROP POLICY IF EXISTS "orders_select_own_v2" ON public.orders;
DROP POLICY IF EXISTS "orders_select_own_v3" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_authenticated" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_authenticated_v2" ON public.orders;

CREATE POLICY "orders_insert_v4" 
ON public.orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_select_v4" 
ON public.orders FOR SELECT 
TO authenticated 
USING (
    auth.uid() = user_id 
    OR 
    customer_email = (auth.jwt() ->> 'email')
);

-- 2. Order Items table policies
DROP POLICY IF EXISTS "order_items_select_own_v2" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_own_v3" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_own" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_authenticated_v2" ON public.order_items;

CREATE POLICY "order_items_insert_v4" 
ON public.order_items FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_id 
        AND orders.user_id = auth.uid()
    )
);

CREATE POLICY "order_items_select_v4" 
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
        )
    )
);

-- 3. Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "profiles_select_v4"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 4. Order tracking policies (from script 029)
DROP POLICY IF EXISTS "Users can view their own order tracking" ON public.orders;
-- Already covered by orders_select_v4

-- 5. Granting permissions
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;
GRANT ALL ON public.profiles TO service_role;
