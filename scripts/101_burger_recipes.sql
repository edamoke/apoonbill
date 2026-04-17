-- Population for Burger Ingredients and Recipes

DO $$
DECLARE
    -- Suppliers
    sup_local_id UUID;
    
    -- Inventory Items
    inv_mince_meat UUID;
    inv_burger_buns UUID;
    inv_onions UUID;
    inv_tomatoes UUID;
    inv_mayonnaise UUID;
    inv_lettuce UUID;
    inv_ketchup UUID;
    inv_bacon UUID;
    
    -- Product
    v_bacon_burger_id UUID;
BEGIN
    -- 1. Ensure a General Supplier exists
    INSERT INTO public.suppliers (name, contact_person, category, email)
    VALUES ('Fresh Mart Malindi', 'John Doe', 'General', 'orders@freshmart.com')
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO sup_local_id FROM public.suppliers WHERE name = 'Fresh Mart Malindi';

    -- 2. Populate Inventory Items for Burgers
    
    -- Mince Meat
    INSERT INTO public.inventory_items (name, category, unit, current_stock, reorder_level, unit_cost, auto_reorder)
    SELECT 'Minced Beef', 'Meat', 'g', 5000.0, 1000.0, 0.8, true
    WHERE NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE name = 'Minced Beef');
    SELECT id INTO inv_mince_meat FROM public.inventory_items WHERE name = 'Minced Beef';

    -- Burger Buns
    INSERT INTO public.inventory_items (name, category, unit, current_stock, reorder_level, unit_cost, auto_reorder)
    SELECT 'Burger Buns', 'Bakery', 'pcs', 50.0, 10.0, 30.0, true
    WHERE NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE name = 'Burger Buns');
    SELECT id INTO inv_burger_buns FROM public.inventory_items WHERE name = 'Burger Buns';

    -- Onions
    INSERT INTO public.inventory_items (name, category, unit, current_stock, reorder_level, unit_cost, auto_reorder)
    SELECT 'Onions', 'Vegetables', 'g', 2000.0, 500.0, 0.2, true
    WHERE NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE name = 'Onions');
    SELECT id INTO inv_onions FROM public.inventory_items WHERE name = 'Onions';

    -- Tomatoes
    INSERT INTO public.inventory_items (name, category, unit, current_stock, reorder_level, unit_cost, auto_reorder)
    SELECT 'Tomatoes', 'Vegetables', 'g', 2000.0, 500.0, 0.15, true
    WHERE NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE name = 'Tomatoes');
    SELECT id INTO inv_tomatoes FROM public.inventory_items WHERE name = 'Tomatoes';

    -- Mayonnaise
    INSERT INTO public.inventory_items (name, category, unit, current_stock, reorder_level, unit_cost, auto_reorder)
    SELECT 'Mayonnaise', 'Pantry', 'g', 1000.0, 200.0, 0.5, true
    WHERE NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE name = 'Mayonnaise');
    SELECT id INTO inv_mayonnaise FROM public.inventory_items WHERE name = 'Mayonnaise';

    -- Lettuce
    INSERT INTO public.inventory_items (name, category, unit, current_stock, reorder_level, unit_cost, auto_reorder)
    SELECT 'Lettuce', 'Vegetables', 'g', 1000.0, 300.0, 0.3, true
    WHERE NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE name = 'Lettuce');
    SELECT id INTO inv_lettuce FROM public.inventory_items WHERE name = 'Lettuce';

    -- Ketchup
    INSERT INTO public.inventory_items (name, category, unit, current_stock, reorder_level, unit_cost, auto_reorder)
    SELECT 'Ketchup', 'Pantry', 'g', 1000.0, 200.0, 0.4, true
    WHERE NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE name = 'Ketchup');
    SELECT id INTO inv_ketchup FROM public.inventory_items WHERE name = 'Ketchup';
    
    -- Bacon
    INSERT INTO public.inventory_items (name, category, unit, current_stock, reorder_level, unit_cost, auto_reorder)
    SELECT 'Bacon', 'Meat', 'g', 2000.0, 500.0, 1.2, true
    WHERE NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE name = 'Bacon');
    SELECT id INTO inv_bacon FROM public.inventory_items WHERE name = 'Bacon';

    -- 3. Link to Supplier
    INSERT INTO public.supplier_items (supplier_id, inventory_item_id, unit_cost)
    SELECT sup_local_id, id, unit_cost FROM public.inventory_items 
    WHERE id IN (inv_mince_meat, inv_burger_buns, inv_onions, inv_tomatoes, inv_mayonnaise, inv_lettuce, inv_ketchup, inv_bacon)
    ON CONFLICT DO NOTHING;

    -- 4. Recipe for Bacon Burger
    -- Find the Bacon Burger product
    SELECT id INTO v_bacon_burger_id FROM public.products WHERE name ILIKE '%Bacon Burger%' LIMIT 1;

    IF v_bacon_burger_id IS NOT NULL THEN
        -- Clear existing recipes for this product to avoid duplicates or mess
        DELETE FROM public.recipes WHERE product_id = v_bacon_burger_id;

        INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required) VALUES
        (v_bacon_burger_id, inv_mince_meat, 150.0), -- 150g
        (v_bacon_burger_id, inv_burger_buns, 1.0),   -- 1 bun
        (v_bacon_burger_id, inv_onions, 20.0),      -- 20g
        (v_bacon_burger_id, inv_tomatoes, 30.0),    -- 30g
        (v_bacon_burger_id, inv_mayonnaise, 15.0),  -- 15g
        (v_bacon_burger_id, inv_lettuce, 10.0),     -- 10g
        (v_bacon_burger_id, inv_ketchup, 15.0),     -- 15g
        (v_bacon_burger_id, inv_bacon, 40.0);       -- 40g
    END IF;

END $$;
