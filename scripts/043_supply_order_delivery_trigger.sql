-- Function to update inventory when a supply order is marked as delivered
CREATE OR REPLACE FUNCTION public.handle_supply_order_delivered()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if status changed to 'delivered'
    IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
        -- Update current_stock in inventory_items for each item in the supply order
        UPDATE public.inventory_items
        SET current_stock = current_stock + soi.quantity,
            updated_at = NOW()
        FROM public.supply_order_items soi
        WHERE soi.supply_order_id = NEW.id
          AND inventory_items.id = soi.inventory_item_id;

        -- Record transactions for the stock increase
        INSERT INTO public.inventory_transactions (
            inventory_item_id,
            transaction_type,
            quantity,
            reference_id,
            notes
        )
        SELECT 
            soi.inventory_item_id,
            'restock',
            soi.quantity,
            NEW.id,
            'Restock from supply order ' || NEW.id
        FROM public.supply_order_items soi
        WHERE soi.supply_order_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on supply_orders
DROP TRIGGER IF EXISTS tr_supply_order_delivered ON public.supply_orders;
CREATE TRIGGER tr_supply_order_delivered
AFTER UPDATE ON public.supply_orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_supply_order_delivered();
