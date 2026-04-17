-- Fix faulty accounting trigger that uses non-existent 'total_amount' field
-- The 'orders' table uses 'total' for the final order amount

CREATE OR REPLACE FUNCTION public.automate_order_double_entry()
RETURNS TRIGGER AS $$
DECLARE
    v_ledger_id UUID;
    v_cash_account UUID;
    v_sales_account UUID;
BEGIN
    -- Check if the status has transitioned to a 'completed' state
    IF (NEW.status IN ('delivered', 'completed', 'served') AND OLD.status NOT IN ('delivered', 'completed', 'served')) THEN
        -- Get Account IDs
        SELECT id INTO v_cash_account FROM public.chart_of_accounts WHERE code = '1000';
        SELECT id INTO v_sales_account FROM public.chart_of_accounts WHERE code = '4000';

        -- Create General Ledger Header
        INSERT INTO public.general_ledger (transaction_date, description, reference_id, reference_type)
        VALUES (NOW(), 'Sales income from order ' || NEW.id, NEW.id, 'order')
        RETURNING id INTO v_ledger_id;

        -- Debit Cash (Increase Asset) - Fix: use NEW.total instead of NEW.total_amount
        INSERT INTO public.ledger_entries (ledger_id, account_id, debit, credit)
        VALUES (v_ledger_id, v_cash_account, COALESCE(NEW.total, 0), 0);

        -- Credit Sales (Increase Revenue) - Fix: use NEW.total instead of NEW.total_amount
        INSERT INTO public.ledger_entries (ledger_id, account_id, debit, credit)
        VALUES (v_ledger_id, v_sales_account, 0, COALESCE(NEW.total, 0));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-apply trigger just in case
DROP TRIGGER IF EXISTS trigger_automate_order_double_entry ON public.orders;
CREATE TRIGGER trigger_automate_order_double_entry
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.automate_order_double_entry();
