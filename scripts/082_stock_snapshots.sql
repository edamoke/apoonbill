-- Migration to add Stock Snapshots for Day Start/Day End Analysis

CREATE TABLE IF NOT EXISTS public.stock_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('day_start', 'day_end', 'manual')),
    snapshot_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    UNIQUE(snapshot_date, snapshot_type)
);

CREATE TABLE IF NOT EXISTS public.stock_snapshot_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID REFERENCES public.stock_snapshots(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity DECIMAL(12, 3) NOT NULL,
    unit_cost DECIMAL(12, 2),
    UNIQUE(snapshot_id, inventory_item_id)
);

-- RLS for stock snapshots
ALTER TABLE public.stock_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_snapshot_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins/accountants to manage snapshots"
    ON public.stock_snapshots FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

CREATE POLICY "Allow admins/accountants to manage snapshot items"
    ON public.stock_snapshot_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

-- View for Stock Variance Analysis
CREATE OR REPLACE VIEW public.stock_variance_analysis AS
WITH day_data AS (
    SELECT 
        s.snapshot_date,
        si.inventory_item_id,
        si.quantity as start_qty,
        (
            SELECT si2.quantity 
            FROM public.stock_snapshot_items si2
            JOIN public.stock_snapshots s2 ON si2.snapshot_id = s2.id
            WHERE s2.snapshot_date = s.snapshot_date 
            AND s2.snapshot_type = 'day_end'
            AND si2.inventory_item_id = si.inventory_item_id
        ) as end_qty
    FROM public.stock_snapshots s
    JOIN public.stock_snapshot_items si ON s.id = si.snapshot_id
    WHERE s.snapshot_type = 'day_start'
)
SELECT 
    dd.*,
    ii.name as item_name,
    ii.unit,
    (dd.start_qty - COALESCE(dd.end_qty, 0)) as actual_usage,
    (
        SELECT COALESCE(SUM(ABS(it.quantity)), 0)
        FROM public.inventory_transactions it
        WHERE it.inventory_item_id = dd.inventory_item_id
        AND it.type = 'usage'
        AND it.created_at::date = dd.snapshot_date
    ) as recorded_usage
FROM day_data dd
JOIN public.inventory_items ii ON dd.inventory_item_id = ii.id;
