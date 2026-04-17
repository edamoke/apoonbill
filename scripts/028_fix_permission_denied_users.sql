-- Fix order_items and orders RLS to avoid querying auth.users directly which causes permission denied
-- Instead, we should use auth.jwt() or auth.uid() directly or a helper function that has security definer

-- Update orders_select_own
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR customer_email = auth.jwt()->>'email');

-- Update Users can view their order history
DROP POLICY IF EXISTS "Users can view their order history" ON public.order_status_history;
CREATE POLICY "Users can view their order history"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id 
      AND (orders.user_id = auth.uid() OR orders.customer_email = auth.jwt()->>'email')
    )
  );

-- Update Users can view their order items
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;
CREATE POLICY "Users can view their order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.customer_email = auth.jwt()->>'email')
    )
  );

-- Update Users can insert their order items
DROP POLICY IF EXISTS "Users can insert their order items" ON public.order_items;
CREATE POLICY "Users can insert their order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.customer_email = auth.jwt()->>'email')
    )
  );
