-- Migration to fix payment_status check constraint and ensure compatibility with POS
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'processing'));

-- Also ensure POS specific payment methods are allowed if there's a constraint
-- Check if orders_payment_method_check exists and update it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_method_check') THEN
        ALTER TABLE public.orders DROP CONSTRAINT orders_payment_method_check;
    END IF;
    ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('mpesa', 'card', 'cash', 'pay_later', 'complimentary'));
EXCEPTION
    WHEN OTHERS THEN
        -- If it doesn't exist, we just add it
        ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('mpesa', 'card', 'cash', 'pay_later', 'complimentary'));
END $$;
