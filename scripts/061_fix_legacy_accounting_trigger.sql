-- Fix faulty legacy accounting trigger that uses non-existent 'total_amount' field
-- The 'orders' table uses 'total' for the final order amount

CREATE OR REPLACE FUNCTION public.log_order_income()
RETURNS TRIGGER AS $$
BEGIN
    -- Log income when order is completed/delivered/served
    IF (NEW.status IN ('delivered', 'completed', 'served', 'complete') AND (OLD.status IS NULL OR OLD.status NOT IN ('delivered', 'completed', 'served', 'complete'))) THEN
        INSERT INTO public.accounting_ledger (
            transaction_type,
            category,
            amount,
            reference_id,
            description
        ) VALUES (
            'income',
            'sales',
            COALESCE(NEW.total, 0),
            NEW.id,
            'Sales income from order ' || NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-apply trigger
DROP TRIGGER IF EXISTS trigger_log_order_income ON public.orders;
CREATE TRIGGER trigger_log_order_income
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.log_order_income();
