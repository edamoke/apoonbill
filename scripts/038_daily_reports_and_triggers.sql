-- Migration to add Employee Daily Reports and Inventory Deduction Triggers

-- 1. Employee Daily Reports Table
CREATE TABLE IF NOT EXISTS public.employee_daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES public.staff_shifts(id) ON DELETE SET NULL,
    tasks_completed TEXT,
    issues_encountered TEXT,
    customer_feedback TEXT,
    cash_reported DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Function to deduct inventory based on recipes when an order is completed
CREATE OR REPLACE FUNCTION public.deduct_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    recipe_item RECORD;
BEGIN
    -- Only deduct when order status changes to 'completed' or 'delivered' or 'served'
    -- Depending on how 'served' is handled for POS/Captain orders
    IF (NEW.status = 'delivered' AND OLD.status != 'delivered') OR 
       (NEW.status = 'completed' AND OLD.status != 'completed') OR
       (NEW.status = 'served' AND OLD.status != 'served') THEN
       
        -- Loop through items in the order
        FOR item IN SELECT menu_item_id, quantity FROM public.order_items WHERE order_id = NEW.id LOOP
            -- For each menu item, find its recipe
            FOR recipe_item IN SELECT inventory_item_id, quantity_required FROM public.recipes WHERE menu_item_id = item.menu_item_id LOOP
                -- Deduct from inventory
                UPDATE public.inventory_items
                SET current_stock = current_stock - (recipe_item.quantity_required * item.quantity),
                    updated_at = NOW()
                WHERE id = recipe_item.inventory_item_id;
                
                -- Record transaction
                INSERT INTO public.inventory_transactions (
                    inventory_item_id,
                    type,
                    quantity,
                    reference_id,
                    notes
                ) VALUES (
                    recipe_item.inventory_item_id,
                    'usage',
                    -(recipe_item.quantity_required * item.quantity),
                    NEW.id,
                    'Automated deduction for order ' || NEW.id
                );
            END LOOP;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger for inventory deduction
DROP TRIGGER IF EXISTS trigger_deduct_inventory_on_order ON public.orders;
CREATE TRIGGER trigger_deduct_inventory_on_order
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.deduct_inventory_on_order();

-- 4. RLS Policies for Daily Reports
ALTER TABLE public.employee_daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own reports"
    ON public.employee_daily_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports"
    ON public.employee_daily_reports FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
    ));

CREATE POLICY "Admins and Accountants can manage all reports"
    ON public.employee_daily_reports FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );
