-- Ultimate SQL to fix Admin Access, Restore Homepage, and prevent RLS Recursion

-- 1. Restore Site Settings Public Visibility (Fix Homepage)
DROP POLICY IF EXISTS "Public view" ON public.site_settings;
CREATE POLICY "site_settings_public_select" ON public.site_settings 
FOR SELECT USING (true);

-- 2. Create a SECURITY DEFINER function to check roles without recursion
-- This function runs with the privileges of the creator (postgres)
CREATE OR REPLACE FUNCTION public.check_is_staff(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND (is_admin = true OR role IN ('admin', 'waiter', 'cashier', 'barman', 'supervisor', 'manager', 'accountant'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fix Profiles RLS using the new function
DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_v7" ON public.profiles;
DROP POLICY IF EXISTS "MASTER_ADMIN_PROFILES_SELECT" ON public.profiles;

CREATE POLICY "profiles_select_v8" ON public.profiles
FOR SELECT TO authenticated
USING (
    id = auth.uid()
    OR
    (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
    OR
    public.check_is_staff(auth.uid())
);

-- 4. Fix Orders RLS
DROP POLICY IF EXISTS "orders_staff_select_v6" ON public.orders;
DROP POLICY IF EXISTS "orders_select_v7" ON public.orders;
DROP POLICY IF EXISTS "MASTER_ADMIN_ORDERS_SELECT" ON public.orders;

CREATE POLICY "orders_select_v8" ON public.orders
FOR SELECT TO authenticated
USING (
    user_id = auth.uid()
    OR
    customer_email = (auth.jwt() ->> 'email')
    OR
    (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
    OR
    public.check_is_staff(auth.uid())
);

-- 5. Fix Order Items RLS
DROP POLICY IF EXISTS "order_items_staff_select_v6" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_v7" ON public.order_items;
DROP POLICY IF EXISTS "MASTER_ADMIN_ITEMS_SELECT" ON public.order_items;

CREATE POLICY "order_items_select_v8" ON public.order_items
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_id 
        AND (
            orders.user_id = auth.uid() 
            OR 
            orders.customer_email = (auth.jwt() ->> 'email')
            OR
            (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
            OR
            public.check_is_staff(auth.uid())
        )
    )
);

-- 6. Grant everything to the admin user explicitly in auth.users
UPDATE auth.users 
SET raw_app_metadata = raw_app_metadata || '{"role": "admin"}',
    raw_user_metadata = raw_user_metadata || '{"is_admin": true}'
WHERE email = 'edamoke@gmail.com';

-- 7. Global permissions for authenticated role
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
