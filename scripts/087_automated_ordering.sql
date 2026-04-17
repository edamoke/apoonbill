-- Automated Inventory Ordering System

-- 1. Notifications Table for Inventory Alerts
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'low_stock', 'urgent_reorder'
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. View for Daily Reorder Report
CREATE OR REPLACE VIEW public.daily_reorder_report AS
SELECT 
    ii.id AS inventory_item_id,
    ii.name AS item_name,
    ii.sku,
    ii.category,
    ii.current_stock,
    ii.reorder_level,
    ii.unit,
    s.id AS supplier_id,
    s.name AS supplier_name,
    s.email AS supplier_email,
    s.phone AS supplier_phone,
    (ii.reorder_level * 2 - ii.current_stock) AS suggested_order_quantity -- Simple logic: order up to twice the reorder level
FROM 
    public.inventory_items ii
LEFT JOIN 
    public.suppliers s ON ii.category = s.category -- Assuming matching by category for now
WHERE 
    ii.current_stock <= ii.reorder_level;

-- 3. Trigger Function to alert on Low Stock
CREATE OR REPLACE FUNCTION public.check_low_stock_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_stock <= NEW.reorder_level THEN
        -- Insert alert if one doesn't already exist for this item that is unresolved
        IF NOT EXISTS (
            SELECT 1 FROM public.inventory_alerts 
            WHERE inventory_item_id = NEW.id AND is_resolved = false
        ) THEN
            INSERT INTO public.inventory_alerts (inventory_item_id, type, message)
            VALUES (
                NEW.id, 
                CASE 
                    WHEN NEW.current_stock <= (NEW.reorder_level * 0.5) THEN 'urgent_reorder'
                    ELSE 'low_stock'
                END,
                'Stock level for ' || NEW.name || ' is low (' || NEW.current_stock || ' ' || NEW.unit || '). Reorder level is ' || NEW.reorder_level || '.'
            );
        END IF;
    ELSIF NEW.current_stock > NEW.reorder_level THEN
        -- Auto-resolve alert if stock is replenished
        UPDATE public.inventory_alerts 
        SET is_resolved = true 
        WHERE inventory_item_id = NEW.id AND is_resolved = false;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Apply Trigger to inventory_items
DROP TRIGGER IF EXISTS tr_check_low_stock ON public.inventory_items;
CREATE TRIGGER tr_check_low_stock
AFTER UPDATE OF current_stock ON public.inventory_items
FOR EACH ROW EXECUTE PROCEDURE public.check_low_stock_trigger();

-- 5. RLS for Inventory Alerts
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Accountants can manage inventory alerts"
    ON public.inventory_alerts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

-- 6. Function to manually create a Supply Order from the report
CREATE OR REPLACE FUNCTION public.create_supply_order_from_item(
    p_inventory_item_id UUID,
    p_quantity DECIMAL,
    p_unit_cost DECIMAL,
    p_supplier_id UUID,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
BEGIN
    -- 1. Create the Supply Order
    INSERT INTO public.supply_orders (supplier_id, created_by, total_amount, status)
    VALUES (p_supplier_id, p_user_id, (p_quantity * p_unit_cost), 'pending')
    RETURNING id INTO v_order_id;

    -- 2. Create the Supply Order Item
    INSERT INTO public.supply_order_items (supply_order_id, inventory_item_id, quantity, unit_cost)
    VALUES (v_order_id, p_inventory_item_id, p_quantity, p_unit_cost);

    -- 3. Mark alert as resolved
    UPDATE public.inventory_alerts 
    SET is_resolved = true 
    WHERE inventory_item_id = p_inventory_item_id AND is_resolved = false;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;
