-- Production and Intermediate Inventory Management

-- 1. Enhance Recipes table to support Inventory-to-Inventory relationships
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS target_inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE;

-- Update constraint to allow either menu_item or target_inventory_item
ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS recipes_menu_item_id_inventory_item_id_key;
ALTER TABLE public.recipes ADD CONSTRAINT recipes_unique_mapping 
    UNIQUE NULLS NOT DISTINCT (menu_item_id, target_inventory_item_id, inventory_item_id);

-- 2. Production Logs Table
CREATE TABLE IF NOT EXISTS public.production_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID REFERENCES public.inventory_items(id) NOT NULL,
    quantity_produced DECIMAL(12, 3) NOT NULL,
    batch_number VARCHAR(50),
    produced_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Trigger to automate ingredient deduction on production
CREATE OR REPLACE FUNCTION public.process_production_entry()
RETURNS TRIGGER AS $$
DECLARE
    v_recipe_row RECORD;
BEGIN
    -- 1. Increase the stock of the produced item
    UPDATE public.inventory_items
    SET current_stock = current_stock + NEW.quantity_produced,
        updated_at = NOW()
    WHERE id = NEW.inventory_item_id;

    -- 2. Log the transaction for the produced item
    INSERT INTO public.inventory_transactions (inventory_item_id, type, quantity, notes, created_by)
    VALUES (NEW.inventory_item_id, 'adjustment', NEW.quantity_produced, 'Production Batch: ' || COALESCE(NEW.batch_number, 'N/A'), NEW.produced_by);

    -- 3. Deduct ingredients based on the recipe
    FOR v_recipe_row IN 
        SELECT inventory_item_id, quantity_required 
        FROM public.recipes 
        WHERE target_inventory_item_id = NEW.inventory_item_id
    LOOP
        -- Deduct ingredient stock
        UPDATE public.inventory_items
        SET current_stock = current_stock - (v_recipe_row.quantity_required * NEW.quantity_produced),
            updated_at = NOW()
        WHERE id = v_recipe_row.inventory_item_id;

        -- Log transaction for ingredient usage
        INSERT INTO public.inventory_transactions (inventory_item_id, type, quantity, notes, created_by)
        VALUES (
            v_recipe_row.inventory_item_id, 
            'usage', 
            -(v_recipe_row.quantity_required * NEW.quantity_produced), 
            'Used in production of ' || NEW.quantity_produced || ' units of item ' || NEW.inventory_item_id, 
            NEW.produced_by
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_process_production ON public.production_logs;
CREATE TRIGGER tr_process_production
AFTER INSERT ON public.production_logs
FOR EACH ROW EXECUTE PROCEDURE public.process_production_entry();

-- 4. RLS for Production Logs
ALTER TABLE public.production_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view production logs"
    ON public.production_logs FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Production staff can record logs"
    ON public.production_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'chef', 'accountant'))
        )
    );
