-- Migration to refine inventory deduction trigger for fractional weights

-- 1. Updated Function to deduct inventory based on recipes when an order is completed
-- Supports fractional weights and precise deduction
CREATE OR REPLACE FUNCTION public.deduct_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    recipe_item RECORD;
    deduction_amount DECIMAL(12, 3);
BEGIN
    -- Only deduct when order status changes to 'completed' or 'delivered' or 'served'
    IF (NEW.status = 'delivered' AND OLD.status != 'delivered') OR 
       (NEW.status = 'completed' AND OLD.status != 'completed') OR
       (NEW.status = 'served' AND OLD.status != 'served') THEN
       
        -- Loop through items in the order
        FOR item IN SELECT menu_item_id, quantity FROM public.order_items WHERE order_id = NEW.id LOOP
            -- For each menu item, find its recipe
            FOR recipe_item IN SELECT inventory_item_id, quantity_required FROM public.recipes WHERE menu_item_id = item.menu_item_id LOOP
                
                -- Calculate exact deduction amount (item quantity * recipe quantity per serving)
                deduction_amount := recipe_item.quantity_required * item.quantity;

                -- Deduct from inventory
                UPDATE public.inventory_items
                SET current_stock = current_stock - deduction_amount,
                    updated_at = NOW()
                WHERE id = recipe_item.inventory_item_id;
                
                -- Record transaction for audit trail
                INSERT INTO public.inventory_transactions (
                    inventory_item_id,
                    type,
                    quantity,
                    reference_id,
                    notes
                ) VALUES (
                    recipe_item.inventory_item_id,
                    'usage',
                    -deduction_amount,
                    NEW.id,
                    'Order ' || NEW.id || ' deduction: ' || deduction_amount || ' units'
                );
            END LOOP;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
