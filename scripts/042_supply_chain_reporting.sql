-- Migration for advanced supply chain reporting

-- Function to get supplier performance metrics
CREATE OR REPLACE FUNCTION public.get_supplier_performance_stats()
RETURNS TABLE (
    supplier_id UUID,
    supplier_name VARCHAR,
    total_orders BIGINT,
    total_spent DECIMAL(12, 2),
    total_weight DECIMAL(12, 3),
    avg_discrepancy DECIMAL(12, 3),
    last_delivery TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as supplier_id,
        s.name as supplier_name,
        COUNT(so.id) as total_orders,
        COALESCE(SUM(so.total_amount), 0) as total_spent,
        COALESCE(SUM(so.delivery_weight), 0) as total_weight,
        COALESCE(AVG(so.weight_discrepancy), 0) as avg_discrepancy,
        MAX(so.delivered_at) as last_delivery
    FROM public.suppliers s
    LEFT JOIN public.supply_orders so ON s.id = so.supplier_id AND so.status = 'delivered'
    GROUP BY s.id, s.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get product supply reports by timeframe
CREATE OR REPLACE FUNCTION public.get_supply_report_by_timeframe(
    p_timeframe TEXT, -- 'hourly', 'daily', 'weekly', 'monthly', 'yearly'
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    period_start TIMESTAMP WITH TIME ZONE,
    total_orders BIGINT,
    total_spent DECIMAL(12, 2),
    total_weight DECIMAL(12, 3)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        date_trunc(
            CASE 
                WHEN p_timeframe = 'hourly' THEN 'hour'
                WHEN p_timeframe = 'daily' THEN 'day'
                WHEN p_timeframe = 'weekly' THEN 'week'
                WHEN p_timeframe = 'monthly' THEN 'month'
                WHEN p_timeframe = 'yearly' THEN 'year'
                ELSE 'day'
            END,
            delivered_at
        ) as period_start,
        COUNT(id) as total_orders,
        SUM(total_amount) as total_spent,
        SUM(delivery_weight) as total_weight
    FROM public.supply_orders
    WHERE status = 'delivered'
    AND (p_start_date IS NULL OR delivered_at >= p_start_date)
    AND (p_end_date IS NULL OR delivered_at <= p_end_date)
    GROUP BY 1
    ORDER BY 1 DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get specific product total weight by timeframe
CREATE OR REPLACE FUNCTION public.get_product_weight_report(
    p_inventory_item_id UUID,
    p_timeframe TEXT,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    period_start TIMESTAMP WITH TIME ZONE,
    total_weight DECIMAL(12, 3),
    total_cost DECIMAL(12, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        date_trunc(
            CASE 
                WHEN p_timeframe = 'hourly' THEN 'hour'
                WHEN p_timeframe = 'daily' THEN 'day'
                WHEN p_timeframe = 'weekly' THEN 'week'
                WHEN p_timeframe = 'monthly' THEN 'month'
                WHEN p_timeframe = 'yearly' THEN 'year'
                ELSE 'day'
            END,
            so.delivered_at
        ) as period_start,
        SUM(soi.quantity) as total_weight,
        SUM(soi.total_cost) as total_cost
    FROM public.supply_order_items soi
    JOIN public.supply_orders so ON soi.supply_order_id = so.id
    WHERE so.status = 'delivered'
    AND soi.inventory_item_id = p_inventory_item_id
    AND (p_start_date IS NULL OR so.delivered_at >= p_start_date)
    AND (p_end_date IS NULL OR so.delivered_at <= p_end_date)
    GROUP BY 1
    ORDER BY 1 DESC;
END;
$$ LANGUAGE plpgsql;
