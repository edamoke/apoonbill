-- Fix RLS for orders to allow staff to see all orders and update them
-- Specifically ensure riders can see orders that are ready for pickup

-- 1. Staff (admin, chef, rider, accountant) can view all orders
DROP POLICY IF EXISTS "orders_select_staff" ON public.orders;
CREATE POLICY "orders_select_staff"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (role IN ('admin', 'chef', 'rider', 'accountant') OR is_admin = true)
    )
  );

-- 2. Staff can update orders
-- Riders need to update orders to mark them as 'on_transit' or 'out_for_delivery'
DROP POLICY IF EXISTS "orders_update_rider" ON public.orders;
CREATE POLICY "orders_update_rider"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (role = 'rider' OR role = 'admin' OR is_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (role = 'rider' OR role = 'admin' OR is_admin = true)
    )
  );

-- 3. Ensure order items are visible to staff
DROP POLICY IF EXISTS "Staff can view all order items" ON public.order_items;
CREATE POLICY "Staff can view all order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('chef', 'rider', 'admin', 'accountant') OR is_admin = true)
    )
  );
