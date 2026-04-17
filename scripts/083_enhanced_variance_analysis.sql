-- Upgrade Stock Analysis with Financial Impact and Automated Audit Logic

CREATE OR REPLACE VIEW public.stock_variance_analysis AS
WITH day_data AS (
    SELECT 
        s.snapshot_date,
        si.inventory_item_id,
        si.quantity as start_qty,
        si.unit_cost as start_unit_cost,
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
    ) as recorded_usage,
    -- Calculate Financial Impact
    ((SELECT COALESCE(SUM(ABS(it.quantity)), 0)
      FROM public.inventory_transactions it
      WHERE it.inventory_item_id = dd.inventory_item_id
      AND it.type = 'usage'
      AND it.created_at::date = dd.snapshot_date) - (dd.start_qty - COALESCE(dd.end_qty, 0))) as variance_qty,
    -- Revenue Loss Estimate (based on avg menu item price linked to this inventory item)
    -- Simplified: Variance Qty * Unit Cost * 3 (standard markup)
    (( (SELECT COALESCE(SUM(ABS(it.quantity)), 0)
        FROM public.inventory_transactions it
        WHERE it.inventory_item_id = dd.inventory_item_id
        AND it.type = 'usage'
        AND it.created_at::date = dd.snapshot_date) - (dd.start_qty - COALESCE(dd.end_qty, 0)) ) * dd.start_unit_cost) as cost_variance_impact
FROM day_data dd
JOIN public.inventory_items ii ON dd.inventory_item_id = ii.id;
