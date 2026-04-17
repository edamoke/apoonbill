-- POS Shift and Cash Drawer Management

-- 1. POS Shifts Table
CREATE TABLE IF NOT EXISTS public.pos_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES public.profiles(id) NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    opening_float DECIMAL(12, 2) DEFAULT 0,
    expected_cash DECIMAL(12, 2) DEFAULT 0,
    actual_cash DECIMAL(12, 2),
    variance DECIMAL(12, 2),
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed', 'reconciled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Link orders to shifts
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shift_id') THEN
        ALTER TABLE public.orders ADD COLUMN shift_id UUID REFERENCES public.pos_shifts(id);
    END IF;
END $$;

-- 3. Trigger to update expected_cash in shift when a cash order is completed
CREATE OR REPLACE FUNCTION public.update_shift_expected_cash()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.shift_id IS NOT NULL AND NEW.status = 'completed' AND NEW.payment_method = 'cash') THEN
        UPDATE public.pos_shifts
        SET expected_cash = expected_cash + NEW.total_amount,
            updated_at = NOW()
        WHERE id = NEW.shift_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_shift_cash ON public.orders;
CREATE TRIGGER tr_update_shift_cash
AFTER UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE PROCEDURE public.update_shift_expected_cash();

-- 4. RLS for POS Shifts
ALTER TABLE public.pos_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view their own shifts"
    ON public.pos_shifts FOR SELECT
    USING (auth.uid() = staff_id OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
    ));

CREATE POLICY "Staff can open shifts"
    ON public.pos_shifts FOR INSERT
    WITH CHECK (auth.uid() = staff_id);

CREATE POLICY "Managers can manage all shifts"
    ON public.pos_shifts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

-- 5. Automation: Close shift function
CREATE OR REPLACE FUNCTION public.close_pos_shift(
    p_shift_id UUID,
    p_actual_cash DECIMAL,
    p_notes TEXT
) RETURNS VOID AS $$
DECLARE
    v_expected DECIMAL;
BEGIN
    SELECT expected_cash INTO v_expected FROM public.pos_shifts WHERE id = p_shift_id;
    
    UPDATE public.pos_shifts
    SET actual_cash = p_actual_cash,
        variance = p_actual_cash - v_expected,
        closed_at = NOW(),
        status = 'closed',
        notes = p_notes,
        updated_at = NOW()
    WHERE id = p_shift_id;
    
    -- If there is a variance, we could trigger an accounting entry here
END;
$$ LANGUAGE plpgsql;
