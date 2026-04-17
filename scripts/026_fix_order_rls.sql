-- Drop all existing policies on orders to start fresh
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Chefs can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Chefs can update orders" ON public.orders;
DROP POLICY IF EXISTS "Riders can view assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Riders can update assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- Drop our previously created policies to allow clean re-run
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_select_staff" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_authenticated" ON public.orders;
DROP POLICY IF EXISTS "orders_all_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_update_chef" ON public.orders;
DROP POLICY IF EXISTS "orders_update_rider" ON public.orders;
DROP POLICY IF EXISTS "orders_update_accountant" ON public.orders;

-- 1. Everyone (authenticated) can view their own orders
-- We allow viewing by user_id OR by customer_email matching the auth user's email
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 2. Staff (admin, chef, rider, accountant) can view all orders
CREATE POLICY "orders_select_staff"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (role IN ('admin', 'chef', 'rider', 'accountant') OR is_admin = true)
    )
  );

-- 3. Authenticated users can create orders
CREATE POLICY "orders_insert_authenticated"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Admins have full access
CREATE POLICY "orders_all_admin"
  ON public.orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR is_admin = true)
    )
  );

-- 5. Chefs can update orders (for status updates and assignment)
CREATE POLICY "orders_update_chef"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role = 'chef'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role = 'chef'
    )
  );

-- 6. Riders can update orders assigned to them or if they are riders (for picking up orders)
CREATE POLICY "orders_update_rider"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role = 'rider'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role = 'rider'
    )
  );

-- 7. Accountants can update orders
CREATE POLICY "orders_update_accountant"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role = 'accountant'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role = 'accountant'
    )
  );

-- Fix RLS for tracking: ensure users can see their own order history and items
-- Drop and recreate to be sure
DROP POLICY IF EXISTS "Users can view their order history" ON public.order_status_history;
DROP POLICY IF EXISTS "Staff can view all order history" ON public.order_status_history;

CREATE POLICY "Users can view their order history"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id 
      AND (orders.user_id = auth.uid() OR orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Staff can view all order history"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('chef', 'rider', 'admin', 'accountant') OR is_admin = true)
    )
  );

DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Staff can view all order items" ON public.order_items;

CREATE POLICY "Users can view their order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Staff can view all order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role IN ('chef', 'rider', 'admin', 'accountant') OR is_admin = true)
    )
  );
