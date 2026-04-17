-- Migration to enhance POS orders and table management
-- Add 'dine_in' and 'takeaway' to order_type if not already there
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_order_type_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_order_type_check CHECK (order_type IN ('delivery', 'pickup', 'dine_in', 'takeaway'));

-- Add order_id to pos_tables to track current active order
ALTER TABLE public.pos_tables ADD COLUMN IF NOT EXISTS active_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;

-- Add parent_order_id for bill splitting and merging
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS parent_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;

-- Add split_type to track how a bill was split
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS split_type VARCHAR(20); -- 'equal', 'by_item', 'none'

-- Add discount_percent to orders to track persistent discounts
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5, 2) DEFAULT 0;
