-- Migration to add advanced accounting features, gas tracking, and wastage logs

-- 1. Wastage Logs Table
CREATE TABLE IF NOT EXISTS public.wastage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity DECIMAL(12, 3) NOT NULL,
    reason VARCHAR(100) NOT NULL, -- 'spoilt', 'dropped', 'contaminated', 'expired'
    recorded_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Utility Usage Table (specifically for Gas)
CREATE TABLE IF NOT EXISTS public.utility_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    utility_type VARCHAR(50) DEFAULT 'gas',
    quantity_used DECIMAL(12, 2) NOT NULL, -- e.g., in kg or units
    unit VARCHAR(20) DEFAULT 'kg',
    total_cost DECIMAL(12, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Outlets / Sections Table
CREATE TABLE IF NOT EXISTS public.outlets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL, -- 'Bar', 'Restaurant', 'Lounge', 'VIP'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Outlets
INSERT INTO public.outlets (name) VALUES 
('Bar'), ('Restaurant'), ('Lounge'), ('VIP')
ON CONFLICT (name) DO NOTHING;

-- 4. Add outlet_id to orders
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='outlet_id') THEN
        ALTER TABLE public.orders ADD COLUMN outlet_id UUID REFERENCES public.outlets(id);
    END IF;
END $$;

-- 5. RLS Policies
ALTER TABLE public.wastage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Accountants can manage wastage"
    ON public.wastage_logs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

CREATE POLICY "Admins and Accountants can manage utilities"
    ON public.utility_usage FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

CREATE POLICY "Everyone can view outlets"
    ON public.outlets FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- 6. Trigger to automatically log wastage to inventory_transactions
CREATE OR REPLACE FUNCTION log_wastage_transaction()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.inventory_transactions (
        inventory_item_id,
        type,
        quantity,
        unit_cost_at_time,
        notes,
        created_by
    ) VALUES (
        NEW.inventory_item_id,
        'waste',
        -NEW.quantity, -- Negative because it's stock reduction
        (SELECT unit_cost FROM public.inventory_items WHERE id = NEW.inventory_item_id),
        'Wastage logged: ' || NEW.reason || '. ' || COALESCE(NEW.notes, ''),
        NEW.recorded_by
    );

    -- Update current stock in inventory_items
    UPDATE public.inventory_items
    SET current_stock = current_stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.inventory_item_id;

    RETURN NEW;   
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_wastage_transaction ON public.wastage_logs;
CREATE TRIGGER trigger_log_wastage_transaction
    AFTER INSERT ON public.wastage_logs
    FOR EACH ROW
    EXECUTE FUNCTION log_wastage_transaction();
