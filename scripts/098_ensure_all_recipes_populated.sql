-- Script to ensure ALL products have recipes where possible

DO $$
DECLARE
    v_prod RECORD;
    v_count INTEGER := 0;
BEGIN
    -- Loop through all products that have NO recipes
    FOR v_prod IN 
        SELECT p.id, p.name 
        FROM public.products p
        LEFT JOIN public.recipes r ON r.product_id = p.id
        WHERE r.id IS NULL
    LOOP
        -- Attempt to auto-populate
        PERFORM public.populate_recipe_from_product_name(NULL, v_prod.name);
        
        -- We need to manually link the inserted recipes (which use menu_item_id in the function logic potentially) to this product_id
        -- Wait, the function populate_recipe_from_product_name takes (p_menu_item_id, p_product_name).
        -- It inserts using menu_item_id.
        -- I need to update the function to handle product_id or update the script to handle it.
        
        -- Let's fix the function first or handle it here.
        -- Actually, the function defined in 095 takes p_menu_item_id.
        -- I should update the function to take product_id too or just handle the logic here.
        
        -- Let's just refine the logic here inline for simplicity and robustness.
        
        -- Auto-Populate Logic for Product ID
        DECLARE
            v_inv_id UUID;
        BEGIN
            -- Logic matched from 095 but using v_prod.id as product_id
            
            -- Pasta
            IF v_prod.name ILIKE '%spaghetti%' THEN
                SELECT id INTO v_inv_id FROM public.inventory_items WHERE name ILIKE '%spaghetti%' LIMIT 1;
                IF v_inv_id IS NOT NULL THEN
                    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required) VALUES (v_prod.id, v_inv_id, 0.150) ON CONFLICT DO NOTHING;
                END IF;
            END IF;

            IF v_prod.name ILIKE '%penne%' THEN
                SELECT id INTO v_inv_id FROM public.inventory_items WHERE name ILIKE '%penne%' LIMIT 1;
                IF v_inv_id IS NOT NULL THEN
                    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required) VALUES (v_prod.id, v_inv_id, 0.150) ON CONFLICT DO NOTHING;
                END IF;
            END IF;
            
            IF v_prod.name ILIKE '%lasagna%' THEN
                SELECT id INTO v_inv_id FROM public.inventory_items WHERE name ILIKE '%lasagna sheets%' LIMIT 1;
                IF v_inv_id IS NOT NULL THEN
                    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required) VALUES (v_prod.id, v_inv_id, 0.150) ON CONFLICT DO NOTHING;
                END IF;
            END IF;
            
            IF v_prod.name ILIKE '%ravioli%' THEN
                SELECT id INTO v_inv_id FROM public.inventory_items WHERE name ILIKE '%ravioli%' LIMIT 1;
                IF v_inv_id IS NOT NULL THEN
                    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required) VALUES (v_prod.id, v_inv_id, 0.200) ON CONFLICT DO NOTHING;
                END IF;
            END IF;
            
            IF v_prod.name ILIKE '%gnocchi%' THEN
                SELECT id INTO v_inv_id FROM public.inventory_items WHERE name ILIKE '%gnocchi%' LIMIT 1;
                IF v_inv_id IS NOT NULL THEN
                    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required) VALUES (v_prod.id, v_inv_id, 0.200) ON CONFLICT DO NOTHING;
                END IF;
            END IF;

            -- Proteins
            IF v_prod.name ILIKE '%chicken%' THEN
                SELECT id INTO v_inv_id FROM public.inventory_items WHERE name ILIKE '%chicken breast%' LIMIT 1;
                IF v_inv_id IS NOT NULL THEN
                    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required) VALUES (v_prod.id, v_inv_id, 0.150) ON CONFLICT DO NOTHING;
                END IF;
            END IF;

            IF v_prod.name ILIKE '%beef%' OR v_prod.name ILIKE '%bolognese%' OR v_prod.name ILIKE '%steak%' OR v_prod.name ILIKE '%burger%' THEN
                SELECT id INTO v_inv_id FROM public.inventory_items WHERE name ILIKE '%ground beef%' OR name ILIKE '%prime beef%' LIMIT 1;
                IF v_inv_id IS NOT NULL THEN
                    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required) VALUES (v_prod.id, v_inv_id, 0.150) ON CONFLICT DO NOTHING;
                END IF;
            END IF;
            
            IF v_prod.name ILIKE '%fish%' OR v_prod.name ILIKE '%tilapia%' THEN
                 SELECT id INTO v_inv_id FROM public.inventory_items WHERE name ILIKE '%seafood mix%' OR name ILIKE '%fish%' LIMIT 1;
                 IF v_inv_id IS NOT NULL THEN
                    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required) VALUES (v_prod.id, v_inv_id, 0.200) ON CONFLICT DO NOTHING;
                 END IF;
            END IF;
            
            -- Sides (Rice, Ugali, Chips)
            IF v_prod.name ILIKE '%rice%' OR v_prod.name ILIKE '%pilau%' THEN
                 SELECT id INTO v_inv_id FROM public.inventory_items WHERE name ILIKE '%rice%' LIMIT 1;
                 IF v_inv_id IS NOT NULL THEN
                    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required) VALUES (v_prod.id, v_inv_id, 0.150) ON CONFLICT DO NOTHING;
                 END IF;
            END IF;
            
            IF v_prod.name ILIKE '%ugali%' THEN
                 SELECT id INTO v_inv_id FROM public.inventory_items WHERE name ILIKE '%maize flour%' LIMIT 1;
                 IF v_inv_id IS NOT NULL THEN
                    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required) VALUES (v_prod.id, v_inv_id, 0.200) ON CONFLICT DO NOTHING;
                 END IF;
            END IF;
            
            IF v_prod.name ILIKE '%chips%' OR v_prod.name ILIKE '%fries%' OR v_prod.name ILIKE '%potato%' THEN
                 SELECT id INTO v_inv_id FROM public.inventory_items WHERE name ILIKE '%potatoes%' LIMIT 1;
                 IF v_inv_id IS NOT NULL THEN
                    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required) VALUES (v_prod.id, v_inv_id, 0.300) ON CONFLICT DO NOTHING;
                 END IF;
            END IF;

        END;
        
        v_count := v_count + 1;
    END LOOP;
    
    -- Raise notice
    -- RAISE NOTICE 'Processed % products for recipe generation', v_count;
END $$;
