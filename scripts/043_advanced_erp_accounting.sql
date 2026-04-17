-- Advanced ERP Accounting & Financial Management Schema

-- 1. Chart of Accounts
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g., '1000', '2000'
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense'
    parent_id UUID REFERENCES public.chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. General Ledger (Double Entry)
CREATE TABLE IF NOT EXISTS public.general_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    reference_id UUID, -- order_id, supply_order_id, invoice_id
    reference_type VARCHAR(50), -- 'order', 'purchase', 'payroll', 'expense'
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ledger Entries (Debits & Credits)
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ledger_id UUID REFERENCES public.general_ledger(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.chart_of_accounts(id),
    debit DECIMAL(12, 2) DEFAULT 0,
    credit DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT double_entry_check CHECK (debit >= 0 AND credit >= 0)
);

-- 4. Financial Reports View (P&L, Balance Sheet)
-- This will be handled via SQL queries in actions

-- 5. Seed Chart of Accounts
INSERT INTO public.chart_of_accounts (code, name, type) VALUES
('1000', 'Cash & Bank', 'asset'),
('1100', 'Accounts Receivable', 'asset'),
('1200', 'Inventory', 'asset'),
('2000', 'Accounts Payable', 'liability'),
('3000', 'Owner Equity', 'equity'),
('4000', 'Sales Revenue', 'revenue'),
('4100', 'Event Revenue', 'revenue'),
('5000', 'Cost of Goods Sold', 'expense'),
('5100', 'Staff Salaries', 'expense'),
('5200', 'Utilities', 'expense'),
('5300', 'Marketing', 'expense')
ON CONFLICT (code) DO NOTHING;

-- 6. Trigger to automate Double-Entry for Orders
CREATE OR REPLACE FUNCTION public.automate_order_double_entry()
RETURNS TRIGGER AS $$
DECLARE
    v_ledger_id UUID;
    v_cash_account UUID;
    v_sales_account UUID;
BEGIN
    IF (NEW.status IN ('delivered', 'completed', 'served') AND OLD.status NOT IN ('delivered', 'completed', 'served')) THEN
        -- Get Account IDs
        SELECT id INTO v_cash_account FROM public.chart_of_accounts WHERE code = '1000';
        SELECT id INTO v_sales_account FROM public.chart_of_accounts WHERE code = '4000';

        -- Create General Ledger Header
        INSERT INTO public.general_ledger (transaction_date, description, reference_id, reference_type)
        VALUES (NOW(), 'Sales income from order ' || NEW.id, NEW.id, 'order')
        RETURNING id INTO v_ledger_id;

        -- Debit Cash (Increase Asset)
        INSERT INTO public.ledger_entries (ledger_id, account_id, debit, credit)
        VALUES (v_ledger_id, v_cash_account, NEW.total_amount, 0);

        -- Credit Sales (Increase Revenue)
        INSERT INTO public.ledger_entries (ledger_id, account_id, debit, credit)
        VALUES (v_ledger_id, v_sales_account, 0, NEW.total_amount);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_automate_order_double_entry ON public.orders;
CREATE TRIGGER trigger_automate_order_double_entry
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.automate_order_double_entry();

-- 7. RLS
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Accountants can manage financial data"
    ON public.chart_of_accounts FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')));

CREATE POLICY "Admins and Accountants can manage general ledger"
    ON public.general_ledger FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')));

CREATE POLICY "Admins and Accountants can manage ledger entries"
    ON public.ledger_entries FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')));
