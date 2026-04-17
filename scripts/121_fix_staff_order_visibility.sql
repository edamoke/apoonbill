-- Fix RLS for orders to ensure staff (including riders and waiters) can see relevant orders
-- This script relaxes the staff check to include 'waiter' role and ensures case-insensitive role checking

-- 1. Drop existing staff select policy
DROP POLICY IF EXISTS "orders_select_staff" ON public.orders;
DROP POLICY IF EXISTS "orders_select_staff_v6" ON public.orders;
DROP POLICY IF EXISTS "orders_select_staff_v7" ON public.orders;

-- 2. Create updated staff select policy
CREATE POLICY "orders_select_staff_v8"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (
        lower(role) IN ('admin', 'chef', 'rider', 'accountant', 'waiter', 'hrm') 
        OR is_admin = true
        OR is_chef = true
        OR is_rider = true
        OR is_accountant = true
      )
    )
  );

-- 3. Update staff update policy
DROP POLICY IF EXISTS "orders_update_rider" ON public.orders;
CREATE POLICY "orders_update_staff"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (
        lower(role) IN ('admin', 'chef', 'rider', 'waiter') 
        OR is_admin = true
        OR is_chef = true
        OR is_rider = true
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (
        lower(role) IN ('admin', 'chef', 'rider', 'waiter') 
        OR is_admin = true
        OR is_chef = true
        OR is_rider = true
      )
    )
  );

-- 4. Update order items select policy
DROP POLICY IF EXISTS "Staff can view all order items" ON public.order_items;
CREATE POLICY "staff_select_order_items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (
        lower(role) IN ('admin', 'chef', 'rider', 'accountant', 'waiter', 'hrm') 
        OR is_admin = true
        OR is_chef = true
        OR is_rider = true
        OR is_accountant = true
      )
    )
  );
