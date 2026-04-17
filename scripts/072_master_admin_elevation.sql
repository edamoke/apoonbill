-- Master SQL to grant edamoke@gmail.com absolute system authority and bypass RLS hurdles

-- 1. Ensure user has 'admin' metadata in auth.users (This helps with some Supabase native checks)
UPDATE auth.users 
SET raw_app_metadata = raw_app_metadata || '{"role": "admin"}',
    raw_user_metadata = raw_user_metadata || '{"is_admin": true}'
WHERE email = 'edamoke@gmail.com';

-- 2. Ensure profile exists and is correctly elevated
INSERT INTO public.profiles (id, email, role, is_admin)
SELECT id, email, 'admin', true
FROM auth.users
WHERE email = 'edamoke@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', is_admin = true;

-- 3. Absolute SELECT policy for Admin on critical tables
-- Using email from JWT is the most reliable way to bypass recursion
DROP POLICY IF EXISTS "profiles_admin_email_select" ON public.profiles;
CREATE POLICY "MASTER_ADMIN_PROFILES_SELECT" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
    (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
    OR
    id = auth.uid()
);

DROP POLICY IF EXISTS "orders_admin_email_select" ON public.orders;
CREATE POLICY "MASTER_ADMIN_ORDERS_SELECT" 
ON public.orders FOR SELECT 
TO authenticated 
USING (
    (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
    OR
    user_id = auth.uid()
);

DROP POLICY IF EXISTS "order_items_admin_email_select" ON public.order_items;
CREATE POLICY "MASTER_ADMIN_ITEMS_SELECT" 
ON public.order_items FOR SELECT 
TO authenticated 
USING (
    (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
    OR
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);

-- 4. Absolute UPDATE/INSERT/DELETE for Admin
DROP POLICY IF EXISTS "profiles_admin_email_manage" ON public.profiles;
CREATE POLICY "MASTER_ADMIN_PROFILES_ALL" 
ON public.profiles FOR ALL 
TO authenticated 
USING ((auth.jwt() ->> 'email') = 'edamoke@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'edamoke@gmail.com');

DROP POLICY IF EXISTS "orders_admin_email_manage" ON public.orders;
CREATE POLICY "MASTER_ADMIN_ORDERS_ALL" 
ON public.orders FOR ALL 
TO authenticated 
USING ((auth.jwt() ->> 'email') = 'edamoke@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'edamoke@gmail.com');

CREATE POLICY "MASTER_ADMIN_ITEMS_ALL" 
ON public.order_items FOR ALL 
TO authenticated 
USING ((auth.jwt() ->> 'email') = 'edamoke@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'edamoke@gmail.com');

-- 5. Grant absolute permission on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
