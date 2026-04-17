-- Loyalty Points Automation Trigger

CREATE OR REPLACE FUNCTION public.handle_loyalty_on_order()
RETURNS TRIGGER AS $$
DECLARE
    earned_points INTEGER;
BEGIN
    -- Award points when order status changes to 'completed', 'delivered', 'served' 
    -- OR if payment becomes 'completed'/'paid'
    IF ((NEW.status IN ('completed', 'delivered', 'served') AND (OLD.status IS NULL OR OLD.status NOT IN ('completed', 'delivered', 'served')))
        OR (NEW.payment_status IN ('completed', 'paid') AND (OLD.payment_status IS NULL OR OLD.payment_status NOT IN ('completed', 'paid')))) THEN
       
       -- Logic: 1 Point for every 100 KES spent (excluding delivery fee)
       earned_points := FLOOR(NEW.total / 100);
       
       IF earned_points > 0 AND NEW.user_id IS NOT NULL THEN
          -- Check if points were already awarded for this order to prevent double counting
          IF NOT EXISTS (SELECT 1 FROM public.loyalty_transactions WHERE order_id = NEW.id AND type = 'earn') THEN
              -- 1. Create transaction record
              INSERT INTO public.loyalty_transactions (
                  user_id,
                  order_id,
                  points_change,
                  type,
                  notes
              ) VALUES (
                  NEW.user_id,
                  NEW.id,
                  earned_points,
                  'earn',
                  'Points earned for order #' || NEW.id
              );
              
              -- 2. Update profile points and stats
              UPDATE public.profiles
              SET loyalty_points = loyalty_points + earned_points,
                  lifetime_spend = lifetime_spend + NEW.total,
                  total_orders = total_orders + 1
              WHERE id = NEW.user_id;
          END IF;
       END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for loyalty points
DROP TRIGGER IF EXISTS trigger_loyalty_on_order ON public.orders;
CREATE TRIGGER trigger_loyalty_on_order
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_loyalty_on_order();
