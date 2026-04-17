-- Add M-Pesa tracking columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS mpesa_checkout_request_id TEXT,
ADD COLUMN IF NOT EXISTS mpesa_receipt_number TEXT,
ADD COLUMN IF NOT EXISTS mpesa_transaction_date TEXT,
ADD COLUMN IF NOT EXISTS mpesa_phone_number TEXT,
ADD COLUMN IF NOT EXISTS mpesa_error_message TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_mpesa_checkout_request 
ON public.orders(mpesa_checkout_request_id);
