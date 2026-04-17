-- Population for all Menu Items using Smart Heuristics

DO $$
DECLARE
    v_item RECORD;
    v_count INTEGER := 0;
BEGIN
    -- Loop through all menu items
    FOR v_item IN SELECT id, name FROM public.menu_items LOOP
        -- Apply Smart Heuristics using the function from 095
        PERFORM public.populate_recipe_from_product_name(v_item.id, v_item.name);
        v_count := v_count + 1;
    END LOOP;
    
    -- Also loop through products and ensure they have recipes (handling those not in menu_items)
    -- Using the same heuristic but adapted for products table directly if needed
    -- (The function populate_recipe_from_product_name uses menu_item_id)
    -- Let's run the 098 script logic which handles products table.
END $$;
