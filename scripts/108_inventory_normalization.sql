-- 108_inventory_normalization.sql
-- Normalize inventory units to Grams and Milliliters for precision tracking

-- 1. Convert existing Stock and Reorder Levels to high-precision base units (Grams/ML)
-- We only target mass (kg -> g) and volume (l -> ml) units.
-- Items like 'pcs', 'bags', 'bundles' remain unchanged.

-- Mass conversion
UPDATE public.inventory_items
SET current_stock = current_stock * 1000,
    reorder_level = reorder_level * 1000,
    unit_cost = unit_cost / 1000,
    unit = 'g'
WHERE unit ILIKE 'kg';

-- Volume conversion
UPDATE public.inventory_items
SET current_stock = current_stock * 1000,
    reorder_level = reorder_level * 1000,
    unit_cost = unit_cost / 1000,
    unit = 'ml'
WHERE unit ILIKE 'l' OR unit ILIKE 'liter' OR unit ILIKE 'litre';

-- 2. Update Recipes to ensure requirements match the new base units
UPDATE public.recipe_items ri
SET quantity_required = ri.quantity_required * 1000
FROM public.inventory_items ii
WHERE ri.inventory_item_id = ii.id
AND ii.unit IN ('g', 'ml');

-- 3. Enhance inventory_transactions to track Order/Menu context
ALTER TABLE public.inventory_transactions 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id),
ADD COLUMN IF NOT EXISTS menu_item_id UUID REFERENCES public.menu_items(id),
ADD COLUMN IF NOT EXISTS batch_id UUID; -- For production tracking

-- 4. Update the trigger that deducts stock on order fulfillment
-- Note: Assuming the project uses 'deduct_inventory_on_order' or similar.
-- We ensure it deducts based on the recipe_items.quantity_required which is now in base units.

CREATE OR REPLACE FUNCTION public.deduct_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    recipe_row RECORD;
BEGIN
    -- For each item in the order
    FOR item IN 
        SELECT product_id, quantity 
        FROM public.order_items 
        WHERE order_id = NEW.id
    LOOP
        -- Find the recipes associated with the product (menu item)
        -- Products table likely links to menu_items or is a menu item itself
        -- Here we look for recipe mapping
        FOR recipe_row IN
            SELECT ri.inventory_item_id, ri.quantity_required, ii.name, ii.unit
            FROM public.recipe_items ri
            JOIN public.inventory_items ii ON ri.inventory_item_id = ii.id
            -- Products might have a 1:1 or 1:N relationship with recipes
            -- We assume products.id or a linked field is used.
            -- Using a common pattern from previous files:
            WHERE ri.menu_item_id IN (SELECT id FROM public.menu_items WHERE id = item.product_id)
        LOOP
            -- 1. Deduct from inventory
            UPDATE public.inventory_items
            SET current_stock = current_stock - (recipe_row.quantity_required * item.quantity),
                updated_at = NOW()
            WHERE id = recipe_row.inventory_item_id;

            -- 2. Log high-precision transaction
            INSERT INTO public.inventory_transactions (
                inventory_item_id,
                order_id,
                menu_item_id,
                type,
                quantity,
                notes
            ) VALUES (
                recipe_row.inventory_item_id,
                NEW.id,
                item.product_id,
                'usage',
                -(recipe_row.quantity_required * item.quantity),
                'Deduction for ' || item.quantity || ' portions of order item.'
            );
        END LOOP;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Add a helper function to format units nicely in the UI (SQL side if needed for reports)
CREATE OR REPLACE FUNCTION public.format_inventory_value(p_val DECIMAL, p_unit TEXT)
RETURNS TEXT AS $$
BEGIN
    IF p_unit = 'g' AND p_val >= 1000 THEN
        RETURN (p_val / 1000)::DECIMAL(12,2) || ' kg';
    ELSIF p_unit = 'ml' AND p_val >= 1000 THEN
        RETURN (p_val / 1000)::DECIMAL(12,2) || ' l';
    ELSE
        RETURN p_val::DECIMAL(12,2) || ' ' || p_unit;
    END IF;
END;
$$ LANGUAGE plpgsql;
