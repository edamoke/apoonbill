-- Fix RLS for orders and order_items to allow proper creation by authenticated users
-- Drop policies that might be causing issues or are redundant
DROP POLICY IF EXISTS "orders_insert_authenticated" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "order_items_insert_own" ON public.order_items;

-- 1. Correct Policy for inserting orders
-- We use user_id = auth.uid() which is standard
CREATE POLICY "orders_insert_authenticated_v2" 
ON public.orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 2. Correct Policy for inserting order items
-- This needs to allow insertion if the associated order belongs to the user
CREATE POLICY "order_items_insert_authenticated_v2" 
ON public.order_items FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_id 
        AND orders.user_id = auth.uid()
    )
);

-- 3. Ensure SELECT policies are also robust
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own_v2" 
ON public.orders FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
CREATE POLICY "order_items_select_own_v2" 
ON public.order_items FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_id 
        AND (orders.user_id = auth.uid() OR orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
);

-- 4. Granting permissions again just in case
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;
