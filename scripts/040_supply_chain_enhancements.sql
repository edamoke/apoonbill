-- Migration to enhance supply chain with weight tracking and supplier performance

-- 1. Update Supply Orders to track precise weight and discrepancies
ALTER TABLE public.supply_orders 
ADD COLUMN IF NOT EXISTS ordered_weight DECIMAL(12, 3),
ADD COLUMN IF NOT EXISTS weight_discrepancy DECIMAL(12, 3) GENERATED ALWAYS AS (delivery_weight - ordered_weight) STORED,
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100);

-- 2. Add Prepared Items flag to Inventory
ALTER TABLE public.inventory_items
ADD COLUMN IF NOT EXISTS is_prepared_item BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Update Recipe Logic to support fractional weights (already DECIMAL(12,3) in 036, but ensure consistency)
-- No changes needed to recipes table structure as it already uses DECIMAL(12,3)

-- 4. Supplier Price Tracking (to track price fluctuations)
CREATE TABLE IF NOT EXISTS public.supplier_price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    unit_cost DECIMAL(12, 2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Trigger to update unit_cost in inventory_items and track price history
CREATE OR REPLACE FUNCTION public.update_inventory_cost_and_history()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    IF (NEW.status = 'delivered' AND OLD.status != 'delivered') THEN
        -- Update inventory items from supply order items
        FOR item IN SELECT inventory_item_id, unit_cost, quantity FROM public.supply_order_items WHERE supply_order_id = NEW.id LOOP
            -- Update current stock and last unit cost
            UPDATE public.inventory_items
            SET current_stock = current_stock + item.quantity,
                unit_cost = item.unit_cost,
                last_purchased_at = NOW(),
                updated_at = NOW()
            WHERE id = item.inventory_item_id;

            -- Record transaction
            INSERT INTO public.inventory_transactions (
                inventory_item_id,
                type,
                quantity,
                unit_cost_at_time,
                reference_id,
                notes
            ) VALUES (
                item.inventory_item_id,
                'purchase',
                item.quantity,
                item.unit_cost,
                NEW.id,
                'Purchase from supplier ' || NEW.supplier_id
            );

            -- Record price history
            INSERT INTO public.supplier_price_history (
                supplier_id,
                inventory_item_id,
                unit_cost
            ) VALUES (
                NEW.supplier_id,
                item.inventory_item_id,
                item.unit_cost
            );
        END LOOP;
        
        -- Set delivered_at if not already set
        NEW.delivered_at = COALESCE(NEW.delivered_at, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inventory_on_delivery ON public.supply_orders;
CREATE TRIGGER trigger_update_inventory_on_delivery
    BEFORE UPDATE ON public.supply_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_inventory_cost_and_history();

-- 6. RLS for price history
ALTER TABLE public.supplier_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and Accountants can view price history"
    ON public.supplier_price_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );
