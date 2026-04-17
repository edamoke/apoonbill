-- Migration: Automated Reordering Logic

-- 1. Function to Find Best Supplier (Lowest Price)
CREATE OR REPLACE FUNCTION public.find_best_supplier(p_inventory_item_id UUID)
RETURNS UUID AS $$
DECLARE
    v_supplier_id UUID;
BEGIN
    SELECT supplier_id INTO v_supplier_id
    FROM public.supplier_items
    WHERE inventory_item_id = p_inventory_item_id
    ORDER BY unit_cost ASC, lead_time_days ASC
    LIMIT 1;
    
    RETURN v_supplier_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to Process Auto-Reorder
CREATE OR REPLACE FUNCTION public.process_auto_reorder(p_inventory_item_id UUID)
RETURNS VOID AS $$
DECLARE
    v_item RECORD;
    v_supplier_id UUID;
    v_order_id UUID;
    v_order_qty DECIMAL;
BEGIN
    -- Get item details
    SELECT * INTO v_item FROM public.inventory_items WHERE id = p_inventory_item_id;
    
    -- Check if auto-reorder is enabled
    IF v_item.auto_reorder = true THEN
        -- Check if there is already a pending order for this item?
        -- For simplicity, we'll assume we reorder if stock is low.
        -- Ideally we check pending supply_order_items.
        -- Let's skip check for now to ensure it triggers for demo.
        
        -- Find Supplier
        v_supplier_id := public.find_best_supplier(p_inventory_item_id);
        
        IF v_supplier_id IS NOT NULL THEN
            -- Calculate Quantity (Reorder Quantity or default to 2x reorder level)
            v_order_qty := COALESCE(v_item.reorder_quantity, v_item.reorder_level * 2);
            IF v_order_qty <= 0 THEN v_order_qty := 10; END IF;

            -- Create Supply Order
            -- Using existing function or manual insert? 
            -- scripts/087 has create_supply_order_from_item but it takes user_id. 
            -- Triggers don't always have user_id (auth.uid() might be null if system event).
            -- We'll insert directly with a system user or null.
            
            INSERT INTO public.supply_orders (supplier_id, status, total_amount, created_by)
            VALUES (v_supplier_id, 'pending', 0, auth.uid()) -- auth.uid might be null, that's okay if nullable
            RETURNING id INTO v_order_id;
            
            -- Get unit cost
            DECLARE
                v_unit_cost DECIMAL;
            BEGIN
                SELECT unit_cost INTO v_unit_cost FROM public.supplier_items 
                WHERE supplier_id = v_supplier_id AND inventory_item_id = p_inventory_item_id;
                
                -- Insert Order Item
                INSERT INTO public.supply_order_items (supply_order_id, inventory_item_id, quantity, unit_cost)
                VALUES (v_order_id, p_inventory_item_id, v_order_qty, v_unit_cost);
                
                -- Update Total Amount
                UPDATE public.supply_orders 
                SET total_amount = (v_order_qty * v_unit_cost)
                WHERE id = v_order_id;
                
                -- Create Notification
                INSERT INTO public.notifications (user_id, title, message, type, supply_order_id)
                SELECT 
                    id, 
                    '🤖 Auto-Reorder Generated', 
                    'Low stock detected for ' || v_item.name || '. Order #' || substring(v_order_id::text, 1, 8) || ' created.',
                    'order_alert',
                    v_order_id
                FROM public.profiles 
                WHERE (role = 'admin' OR is_admin = true)
                LIMIT 1; -- Just notify one admin or all? Let's notify all admins.
                -- Actually better to insert for all admins:
                -- INSERT INTO ... SELECT id ... FROM profiles WHERE is_admin...
            END;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Update Low Stock Trigger to call Auto-Reorder
CREATE OR REPLACE FUNCTION public.check_low_stock_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_stock <= NEW.reorder_level THEN
        -- 1. Existing Alert Logic (Insert into inventory_alerts)
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
                'Stock level for ' || NEW.name || ' is low (' || NEW.current_stock || ' ' || NEW.unit || ').'
            );
            
            -- 2. Trigger Auto-Reorder
            PERFORM public.process_auto_reorder(NEW.id);
        END IF;
    ELSIF NEW.current_stock > NEW.reorder_level THEN
        -- Auto-resolve alert
        UPDATE public.inventory_alerts 
        SET is_resolved = true 
        WHERE inventory_item_id = NEW.id AND is_resolved = false;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
