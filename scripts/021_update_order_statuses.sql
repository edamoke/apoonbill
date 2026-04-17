-- Update orders_status_check constraint to include new statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN (
  'pending', 
  'received', 
  'processing', 
  'complete', 
  'on_transit', 
  'delivered', 
  'cancelled',
  'approved',
  'cooking',
  'ready',
  'out_for_delivery'
));

-- Add missing columns for tracking if they don't exist
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS accountant_approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cooking_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cooking_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS chef_notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rider_notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS assigned_accountant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
