-- SQL to add modifiers column to order_items

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS modifiers JSONB DEFAULT '[]';

-- Update RLS to ensure staff can manage these items
DROP POLICY IF EXISTS "order_items_all_staff" ON public.order_items;
CREATE POLICY "order_items_all_staff_v2" 
ON public.order_items FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant')
    )
);
