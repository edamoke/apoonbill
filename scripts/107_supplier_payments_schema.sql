-- 107_supplier_payments_schema.sql
-- Pipeline for supplier payments and accounting integration

CREATE TABLE IF NOT EXISTS public.supplier_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supply_order_id UUID REFERENCES public.supply_orders(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'cancelled'
    payment_method VARCHAR(50), -- 'mpesa', 'bank_transfer', 'cash', 'cheque'
    payment_reference VARCHAR(100),
    paid_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Accountants can manage supplier payments"
    ON public.supplier_payments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (is_admin = true OR role IN ('admin', 'accountant'))
        )
    );

-- 1. Trigger to automatically create a pending payment when a supply order is marked 'delivered'
CREATE OR REPLACE FUNCTION public.generate_supplier_payment_on_delivery()
RETURNS TRIGGER AS $$
DECLARE
    v_total_amount DECIMAL(12, 2);
BEGIN
    -- Only trigger when status changes to 'delivered'
    IF (NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered')) THEN
        
        -- Calculate total amount from supply_order_items
        SELECT SUM(quantity * unit_cost) INTO v_total_amount
        FROM public.supply_order_items
        WHERE supply_order_id = NEW.id;

        -- Create pending payment record
        INSERT INTO public.supplier_payments (
            supply_order_id,
            supplier_id,
            amount,
            status,
            notes
        ) VALUES (
            NEW.id,
            NEW.supplier_id,
            COALESCE(v_total_amount, 0),
            'pending',
            'Automated payment request for Order #' || NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_supplier_payment
AFTER UPDATE ON public.supply_orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_supplier_payment_on_delivery();

-- 2. Trigger to automatically sync with accounting ledger when payment is marked 'paid'
CREATE OR REPLACE FUNCTION public.sync_supplier_payment_to_ledger()
RETURNS TRIGGER AS $$
DECLARE
    v_supplier_name TEXT;
BEGIN
    -- Only trigger when status changes to 'paid'
    IF (NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid')) THEN
        
        SELECT name INTO v_supplier_name FROM public.suppliers WHERE id = NEW.supplier_id;

        -- Insert into accounting_ledger as an expenditure (debit)
        INSERT INTO public.accounting_ledger (
            transaction_type,
            category,
            amount,
            description,
            reference_id,
            metadata
        ) VALUES (
            'expenditure',
            'Supplier Payment',
            NEW.amount,
            'Payment to ' || v_supplier_name || ' for Order Reference: ' || COALESCE(NEW.payment_reference, NEW.supply_order_id::text),
            NEW.id,
            jsonb_build_object(
                'supplier_id', NEW.supplier_id,
                'supply_order_id', NEW.supply_order_id,
                'payment_method', NEW.payment_method,
                'payment_reference', NEW.payment_reference
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_sync_supplier_payment_ledger
AFTER UPDATE ON public.supplier_payments
FOR EACH ROW
EXECUTE FUNCTION public.sync_supplier_payment_to_ledger();

-- Add updated_at trigger
CREATE TRIGGER update_supplier_payments_updated_at 
BEFORE UPDATE ON public.supplier_payments 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
