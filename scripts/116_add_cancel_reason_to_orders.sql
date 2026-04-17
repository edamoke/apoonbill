-- Migration to add cancel_reason to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
