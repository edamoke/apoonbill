-- Migration to add delivery_type and cancel_reason to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'pickup';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
