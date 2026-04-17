-- THE NUCLEAR OPTION: Absolute Bypass for edamoke@gmail.com on critical tables

-- 1. Restore Site Settings Public Visibility (Fix Homepage)
DROP POLICY IF EXISTS "site_settings_public_select" ON public.site_settings;
CREATE POLICY "MASTER_PUBLIC_VIEW" ON public.site_settings FOR SELECT USING (true);

-- 2. Profiles: Absolute Bypass for edamoke@gmail.com
DROP POLICY IF EXISTS "profiles_select_v8" ON public.profiles;
CREATE POLICY "NUCLEAR_ADMIN_PROFILES_SELECT" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
    (auth.jwt() ->> 'email') = 'edamoke@gmail.com' 
    OR id = auth.uid()
);

-- 3. Orders: Absolute Bypass for edamoke@gmail.com
DROP POLICY IF EXISTS "orders_select_v8" ON public.orders;
CREATE POLICY "NUCLEAR_ADMIN_ORDERS_SELECT" 
ON public.orders FOR SELECT 
TO authenticated 
USING (
    (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
    OR user_id = auth.uid()
);

-- 4. Order Items: Absolute Bypass for edamoke@gmail.com
DROP POLICY IF EXISTS "order_items_select_v8" ON public.order_items;
CREATE POLICY "NUCLEAR_ADMIN_ITEMS_SELECT" 
ON public.order_items FOR SELECT 
TO authenticated 
USING (
    (auth.jwt() ->> 'email') = 'edamoke@gmail.com'
    OR EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);

-- 5. Force update the Admin's JWT metadata directly in the database
UPDATE auth.users 
SET raw_app_metadata = raw_app_metadata || '{"role": "admin", "is_admin": true}',
    raw_user_metadata = raw_user_metadata || '{"role": "admin", "is_admin": true}'
WHERE email = 'edamoke@gmail.com';

-- 6. Update the public profile as a final sync
UPDATE public.profiles 
SET role = 'admin', is_admin = true 
WHERE email = 'edamoke@gmail.com';

-- 7. Grant all possible schema privileges
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
