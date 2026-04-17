-- Migration: Convert Inventory to Grams and Update Recipes

DO $$
DECLARE
    item RECORD;
BEGIN
    -- 1. Update Inventory Items that are in 'kg' to 'g'
    -- And multiply stock/levels by 1000, divide unit_cost by 1000
    FOR item IN SELECT id, name, current_stock, reorder_level, unit_cost FROM public.inventory_items WHERE unit = 'kg' LOOP
        UPDATE public.inventory_items
        SET unit = 'g',
            current_stock = current_stock * 1000,
            reorder_level = reorder_level * 1000,
            unit_cost = unit_cost / 1000,
            reorder_quantity = COALESCE(reorder_quantity, 0) * 1000,
            updated_at = NOW()
        WHERE id = item.id;
    END LOOP;

    -- 2. Update Recipes
    -- If we converted kg -> g, existing recipes that assumed kg (like 0.150 for 150g)
    -- now need to be 150.0 since the inventory unit is now grams.
    -- We can identify these because quantity_required < 1 usually means kg representation.
    -- However, to be safe, we should only update recipes linked to items we just converted.
    -- But since we converted ALL 'kg' to 'g', any recipe using those items must be updated.
    
    UPDATE public.recipes r
    SET quantity_required = r.quantity_required * 1000
    FROM public.inventory_items i
    WHERE r.inventory_item_id = i.id
    AND i.unit = 'g' -- These were just converted
    AND r.quantity_required < 1.0; -- Heuristic: only scale if it looks like kg (e.g. 0.150)

    -- 3. Finetune Specific Items (Liters to Milliliters)
    FOR item IN SELECT id, name, current_stock, reorder_level, unit_cost FROM public.inventory_items WHERE unit = 'l' LOOP
        UPDATE public.inventory_items
        SET unit = 'ml',
            current_stock = current_stock * 1000,
            reorder_level = reorder_level * 1000,
            unit_cost = unit_cost / 1000,
            reorder_quantity = COALESCE(reorder_quantity, 0) * 1000,
            updated_at = NOW()
        WHERE id = item.id;
    END LOOP;

    UPDATE public.recipes r
    SET quantity_required = r.quantity_required * 1000
    FROM public.inventory_items i
    WHERE r.inventory_item_id = i.id
    AND i.unit = 'ml' -- These were just converted
    AND r.quantity_required < 1.0;

END $$;
