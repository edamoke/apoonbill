-- Fix RLS for orders to ensure authenticated users can ALWAYS see their own orders
-- even if they were created before they logged in (matched by email)

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;

CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.email = orders.customer_email)
    )
  );

-- Ensure order items are also visible
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;

CREATE POLICY "Users can view their order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id 
      AND (
        orders.user_id = auth.uid() 
        OR 
        orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );
