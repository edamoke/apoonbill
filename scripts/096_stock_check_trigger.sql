-- Migration: Real-Time Stock Check Trigger & Recipe Link Fix

-- 1. Sync Recipes to Products (Ensure recipes linked to menu_items also link to products)
DO $$
BEGIN
    -- Update recipes with product_id where names match between menu_items and products
    UPDATE public.recipes r
    SET product_id = p.id
    FROM public.menu_items m
    JOIN public.products p ON p.name = m.name OR p.slug = m.slug
    WHERE r.menu_item_id = m.id
    AND r.product_id IS NULL;
    
    -- Also try to link by name directly if menu_item_id is null? (Not needed for now)
END $$;

-- 2. Create Stock Check Function
CREATE OR REPLACE FUNCTION public.check_recipe_availability()
RETURNS TRIGGER AS $$
DECLARE
    v_recipe_record RECORD;
    v_missing_items TEXT := '';
    v_product_name VARCHAR;
BEGIN
    -- Determine Product Name for error message
    IF NEW.product_id IS NOT NULL THEN
        SELECT name INTO v_product_name FROM public.products WHERE id = NEW.product_id;
    ELSIF NEW.menu_item_id IS NOT NULL THEN
        SELECT name INTO v_product_name FROM public.menu_items WHERE id = NEW.menu_item_id;
    ELSE
        v_product_name := 'Unknown Item';
    END IF;

    -- Check all ingredients required for this order item
    FOR v_recipe_record IN
        SELECT 
            i.name AS ingredient_name,
            i.current_stock,
            i.unit,
            (r.quantity_required * NEW.quantity) AS required_amount
        FROM public.recipes r
        JOIN public.inventory_items i ON r.inventory_item_id = i.id
        WHERE 
            (r.product_id = NEW.product_id OR r.menu_item_id = NEW.menu_item_id)
    LOOP
        -- Check if stock is sufficient
        IF v_recipe_record.current_stock < v_recipe_record.required_amount THEN
            -- Add to missing list
            v_missing_items := v_missing_items || v_recipe_record.ingredient_name || 
                               ' (Need: ' || v_recipe_record.required_amount || ' ' || v_recipe_record.unit || 
                               ', Have: ' || v_recipe_record.current_stock || ' ' || v_recipe_record.unit || '); ';
        END IF;
        
        -- We deduct stock here or in a separate 'After Insert' trigger?
        -- Usually stock is deducted when order is *Confirmed* or *Paid*.
        -- If this is just a check, we don't deduct.
        -- But for 'Real-time alert', we just want to warn.
        
    END LOOP;

    -- If ingredients are missing, generate notification
    IF v_missing_items <> '' THEN
        -- Insert Notification
        INSERT INTO public.notifications (user_id, title, message, type, order_id)
        SELECT 
            auth.uid(), -- Current user (Staff/Admin)
            '⚠️ Low Stock Alert: ' || v_product_name,
            'Insufficient ingredients for order: ' || v_missing_items,
            'stock_alert',
            NEW.order_id
        WHERE auth.uid() IS NOT NULL; -- Only if user is logged in
        
        -- Optionally insert into inventory_alerts
        -- (This might be redundant if the low-stock trigger handles it, 
        -- but that trigger runs on UPDATE of stock. This runs on ATTEMPTED usage.)
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Apply Trigger to order_items
DROP TRIGGER IF EXISTS tr_check_stock_availability ON public.order_items;
CREATE TRIGGER tr_check_stock_availability
BEFORE INSERT ON public.order_items
FOR EACH ROW EXECUTE PROCEDURE public.check_recipe_availability();

-- 4. Deduct Stock Trigger (Ensure stock IS deducted when ordered)
-- This logic might already exist in scripts/041 or scripts/089.
-- Let's reinforce it safely.
CREATE OR REPLACE FUNCTION public.deduct_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Deduct ingredients based on recipe
    UPDATE public.inventory_items i
    SET current_stock = i.current_stock - (r.quantity_required * NEW.quantity),
        updated_at = NOW()
    FROM public.recipes r
    WHERE r.inventory_item_id = i.id
    AND (r.product_id = NEW.product_id OR r.menu_item_id = NEW.menu_item_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_deduct_inventory ON public.order_items;
CREATE TRIGGER tr_deduct_inventory
AFTER INSERT ON public.order_items
FOR EACH ROW EXECUTE PROCEDURE public.deduct_inventory_on_order();
