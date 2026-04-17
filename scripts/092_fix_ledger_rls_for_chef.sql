-- Fix RLS for accounting_ledger to allow triggers (running with elevated privileges)
-- to insert income records when a chef or other role updates an order status.

DROP POLICY IF EXISTS "Admins and Accountants can manage ledger" ON public.accounting_ledger;

CREATE POLICY "Allow system triggers and admins to manage ledger"
    ON public.accounting_ledger FOR ALL
    USING (
        -- Admins and Accountants can see/manage everything
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    )
    WITH CHECK (
        -- This part is crucial: it allows the INSERT to proceed if it's coming from a trigger 
        -- or if the user is authorized. Since SECURITY DEFINER functions (triggers)
        -- run as the owner, they bypass policy 'USING' usually, but 'WITH CHECK' or certain
        -- configurations can still interfere if not careful.
        -- However, in Supabase, simple ALL policies often suffice if the trigger is DEFINER.
        -- If the error persists, we explicitly allow authenticated users to INSERT 
        -- but only if they are admins/accountants, OR we rely on the trigger being DEFINER.
        
        -- The specific error "new row violates row-level security policy" usually means 
        -- the user performing the update (the chef) doesn't have INSERT permission on the 
        -- accounting_ledger table for the row being created by the trigger.
        
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

-- Add a specific policy for INSERT that is more permissive if needed by triggers 
-- that might be executing in the context of the current user.
-- Actually, the best fix is ensuring the trigger function is SECURITY DEFINER.
-- Let's re-verify and re-apply the trigger with SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.log_order_income()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status IN ('delivered', 'completed', 'served') AND OLD.status NOT IN ('delivered', 'completed', 'served')) THEN
        INSERT INTO public.accounting_ledger (
            transaction_type,
            category,
            amount,
            reference_id,
            description
        ) VALUES (
            'income',
            'sales',
            NEW.total,
            NEW.id,
            'Sales income from order ' || NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- IMPORTANT: SECURITY DEFINER bypasses RLS for the trigger
