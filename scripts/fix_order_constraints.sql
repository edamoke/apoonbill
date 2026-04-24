
-- Fix for orders_order_type_check constraint
-- Update allowed order types to include dine_in and takeaway

-- First, drop the existing constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_order_type_check;

-- Add the new constraint with updated types
ALTER TABLE public.orders ADD CONSTRAINT orders_order_type_check 
CHECK (order_type IN ('delivery', 'pickup', 'dine_in', 'takeaway'));

-- Also check for order status constraint as it might need 'received' if not already there 
-- (it was present in the sql file but good to be sure)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'received', 'processing', 'complete', 'on_transit', 'delivered', 'cancelled'));

-- Update default if needed
ALTER TABLE public.orders ALTER COLUMN order_type SET DEFAULT 'dine_in';
