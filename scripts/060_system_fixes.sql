-- Migration 060: Fixes identified during system analysis
-- 1. Add 'source' column to orders to track origin (POS, Web, Mobile)
-- 2. Add 'manager_pin' to profiles for secure POS authorization

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS source text DEFAULT 'web';
COMMENT ON COLUMN public.orders.source IS 'The origin of the order: web, pos, mobile';

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS manager_pin text;
COMMENT ON COLUMN public.profiles.manager_pin IS '4-digit PIN for POS authorization';

-- Set a default PIN for existing admin/accountant users (for dev/migration)
UPDATE public.profiles SET manager_pin = '1234' WHERE role IN ('admin', 'accountant', 'manager', 'supervisor') AND manager_pin IS NULL;
