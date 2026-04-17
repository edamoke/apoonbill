-- Consolidated RLS fixes for absolute Admin and Staff visibility
-- This ensures that Accounting, Inventory, and Supply Chain modules are fully accessible to personnel

-- 1. Orders table: Absolute visibility for admins and relevant staff
DROP POLICY IF EXISTS "orders_select_staff" ON public.orders;
DROP POLICY IF EXISTS "orders_select_v4" ON public.orders;
DROP POLICY IF EXISTS "orders_select_staff_v5" ON public.orders;

CREATE POLICY "orders_select_staff_v6"
ON public.orders FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() 
    OR customer_email = (auth.jwt() ->> 'email')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND (profiles.role IN ('admin', 'chef', 'rider', 'accountant', 'cashier', 'waitress') OR profiles.is_admin = true)
    )
);

-- 2. Order Items: Absolute visibility for admins and relevant staff
DROP POLICY IF EXISTS "order_items_select_v4" ON public.order_items;
DROP POLICY IF EXISTS "Staff can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_staff_v5" ON public.order_items;

CREATE POLICY "order_items_select_staff_v6"
ON public.order_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_id 
        AND (
            orders.user_id = auth.uid() 
            OR orders.customer_email = (auth.jwt() ->> 'email')
            OR EXISTS (
              SELECT 1 FROM public.profiles
              WHERE profiles.id = auth.uid() 
              AND (profiles.role IN ('admin', 'chef', 'rider', 'accountant', 'cashier', 'waitress') OR profiles.is_admin = true)
            )
        )
    )
);

-- 3. Inventory Items: Visibility for admins and staff (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventory_items') THEN
        DROP POLICY IF EXISTS "Admins and Staff can view inventory" ON public.inventory_items;
        DROP POLICY IF EXISTS "inventory_items_select_v5" ON public.inventory_items;
        
        CREATE POLICY "inventory_items_select_v6"
        ON public.inventory_items FOR SELECT
        TO authenticated
        USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE profiles.id = auth.uid() 
              AND (profiles.role IN ('admin', 'chef', 'accountant', 'cashier') OR profiles.is_admin = true)
            )
        );
    END IF;
END $$;

-- 4. Financial Transactions: Absolute visibility for admins and accountants (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'financial_transactions') THEN
        DROP POLICY IF EXISTS "Only admins and accountants can view financial records" ON public.financial_transactions;
        DROP POLICY IF EXISTS "financial_transactions_select_v5" ON public.financial_transactions;
        
        CREATE POLICY "financial_transactions_select_v6"
        ON public.financial_transactions FOR SELECT
        TO authenticated
        USING (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE profiles.id = auth.uid() 
              AND (profiles.role IN ('admin', 'accountant', 'cashier') OR profiles.is_admin = true)
            )
        );
    END IF;
END $$;

-- 5. Grant absolute permissions to ensure system-wide access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
