-- Analytics Enhancement: Labor vs Sales

-- 1. View for Daily Labor Cost (Approximate based on payroll records)
CREATE OR REPLACE VIEW public.daily_labor_cost AS
SELECT 
    gs.date::DATE as report_date,
    COALESCE(SUM(p.gross_pay / (p.pay_period_end - p.pay_period_start + 1)), 0) as estimated_labor_cost
FROM 
    GENERATE_SERIES(
        (SELECT MIN(pay_period_start) FROM public.hrm_payroll),
        (SELECT MAX(pay_period_end) FROM public.hrm_payroll),
        '1 day'::interval
    ) gs(date)
LEFT JOIN 
    public.hrm_payroll p ON gs.date::DATE >= p.pay_period_start AND gs.date::DATE <= p.pay_period_end
GROUP BY 
    gs.date::DATE;

-- 2. Unified Performance View
CREATE OR REPLACE VIEW public.venue_performance_report AS
SELECT 
    s.report_date,
    s.total_sales,
    s.order_count,
    l.estimated_labor_cost,
    CASE 
        WHEN s.total_sales > 0 THEN (l.estimated_labor_cost / s.total_sales) * 100 
        ELSE 0 
    END as labor_cost_percentage
FROM (
    SELECT 
        created_at::DATE as report_date,
        SUM(total_amount) as total_sales,
        COUNT(id) as order_count
    FROM 
        public.orders
    WHERE 
        status IN ('completed', 'delivered', 'served')
    GROUP BY 
        created_at::DATE
) s
LEFT JOIN 
    public.daily_labor_cost l ON s.report_date = l.report_date;

-- 3. RLS for Analytics Views
-- Since views don't have RLS themselves in the same way, we rely on the underlying tables
-- or we can wrap them in a function.

-- Grant access to specific roles
GRANT SELECT ON public.daily_labor_cost TO authenticated;
GRANT SELECT ON public.venue_performance_report TO authenticated;
