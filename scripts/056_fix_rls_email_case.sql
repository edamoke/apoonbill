-- Fix RLS email matching to be case-insensitive
-- This ensures that users see their orders regardless of how they typed their email during checkout

-- 1. Orders table: Case-insensitive email matching
DROP POLICY IF EXISTS "orders_select_staff_v6" ON public.orders;

CREATE POLICY "orders_select_staff_v7"
ON public.orders FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() 
    OR lower(customer_email) = lower(auth.jwt() ->> 'email')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND (profiles.role IN ('admin', 'chef', 'rider', 'accountant', 'cashier', 'waitress') OR profiles.is_admin = true)
    )
);

-- 2. Order Items: Case-insensitive email matching via joined order
DROP POLICY IF EXISTS "order_items_select_staff_v6" ON public.order_items;

CREATE POLICY "order_items_select_staff_v7"
ON public.order_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_id 
        AND (
            orders.user_id = auth.uid() 
            OR lower(orders.customer_email) = lower(auth.jwt() ->> 'email')
            OR EXISTS (
              SELECT 1 FROM public.profiles
              WHERE profiles.id = auth.uid() 
              AND (profiles.role IN ('admin', 'chef', 'rider', 'accountant', 'cashier', 'waitress') OR profiles.is_admin = true)
            )
        )
    )
);

-- 3. Grant absolute permissions again for good measure
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
