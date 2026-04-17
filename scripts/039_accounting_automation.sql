-- Migration to add Accounting Ledger and automate transaction logging

-- 1. Accounting Ledger Table
CREATE TABLE IF NOT EXISTS public.accounting_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type VARCHAR(20) NOT NULL, -- 'income', 'expense'
    category VARCHAR(100), -- 'sales', 'supply_purchase', 'salary', 'utilities', etc.
    amount DECIMAL(12, 2) NOT NULL,
    reference_id UUID, -- order_id or supply_order_id
    description TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Function to log income from orders
CREATE OR REPLACE FUNCTION public.log_order_income()
RETURNS TRIGGER AS $$
BEGIN
    -- Log income when order is completed/delivered/served
    IF (NEW.status IN ('delivered', 'completed', 'served') AND OLD.status NOT IN ('delivered', 'completed', 'served')) THEN
        INSERT INTO public.accounting_ledger (
            transaction_type,
            category,
            amount,
            reference_id,
            description
        ) VALUES (
            'income',
            'sales',
            NEW.total_amount,
            NEW.id,
            'Sales income from order ' || NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger for order income
DROP TRIGGER IF EXISTS trigger_log_order_income ON public.orders;
CREATE TRIGGER trigger_log_order_income
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.log_order_income();

-- 4. Function to log expense from supply orders
CREATE OR REPLACE FUNCTION public.log_supply_expense()
RETURNS TRIGGER AS $$
BEGIN
    -- Log expense when supply order is marked 'delivered' (assuming that's when payment is finalized)
    IF (NEW.status = 'delivered' AND OLD.status != 'delivered') THEN
        INSERT INTO public.accounting_ledger (
            transaction_type,
            category,
            amount,
            reference_id,
            description
        ) VALUES (
            'expense',
            'supply_purchase',
            NEW.total_amount,
            NEW.id,
            'Expense for supply order ' || NEW.id
        );
        
        -- Also update inventory stock when supply order is delivered
        -- (This part might already be handled by another mechanism, but adding it here ensures consistency)
        -- We loop through supply_order_items and increase current_stock
        UPDATE public.inventory_items
        SET current_stock = current_stock + (
            SELECT SUM(quantity) 
            FROM public.supply_order_items 
            WHERE supply_order_id = NEW.id AND inventory_item_id = public.inventory_items.id
        ),
        updated_at = NOW()
        WHERE id IN (
            SELECT inventory_item_id 
            FROM public.supply_order_items 
            WHERE supply_order_id = NEW.id
        );
        
        -- Log inventory transactions for the increase
        INSERT INTO public.inventory_transactions (
            inventory_item_id,
            type,
            quantity,
            unit_cost_at_time,
            reference_id,
            notes
        )
        SELECT 
            inventory_item_id,
            'purchase',
            quantity,
            unit_cost,
            NEW.id,
            'Stock increase from supply order ' || NEW.id
        FROM public.supply_order_items
        WHERE supply_order_id = NEW.id;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger for supply expense
DROP TRIGGER IF EXISTS trigger_log_supply_expense ON public.supply_orders;
CREATE TRIGGER trigger_log_supply_expense
    AFTER UPDATE ON public.supply_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.log_supply_expense();

-- 6. RLS Policies for Ledger
ALTER TABLE public.accounting_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Accountants can manage ledger"
    ON public.accounting_ledger FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );
