-- SECURE SYSTEM: UNDO NUCLEAR BYPASS AND REMOVE EMAIL-BASED PERMISSIONS
-- This script removes all explicit bypasses for edamoke@gmail.com and restores standard RBAC.

DO $$
DECLARE
    pol_name TEXT;
    tab_name TEXT;
    sch_name TEXT;
BEGIN
    -- 1. DROP ALL POLICIES THAT REFERENCE THE HARDCODED EMAIL OR "NUCLEAR" BYPASSES
    FOR pol_name, tab_name, sch_name IN 
        SELECT policyname, tablename, schemaname
        FROM pg_policies 
        WHERE (definition ILIKE '%edamoke@gmail.com%' 
               OR policyname ILIKE '%nuclear%' 
               OR policyname ILIKE '%bypass%' 
               OR policyname ILIKE '%emergency%'
               OR policyname ILIKE '%master_admin%')
          AND schemaname IN ('public', 'auth', 'storage')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol_name, sch_name, tab_name);
        RAISE NOTICE 'Dropped policy % on table %.%', pol_name, sch_name, tab_name;
    END LOOP;

    -- 2. RESTORE STANDARD POLICIES
    -- Profiles: Ensure standard access based on UID or Admin role
    DROP POLICY IF EXISTS "profiles_select_standard" ON public.profiles;
    CREATE POLICY "profiles_select_standard" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        id = auth.uid() 
        OR (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin'
    );

    -- Orders: Ensure standard access
    DROP POLICY IF EXISTS "orders_select_standard" ON public.orders;
    CREATE POLICY "orders_select_standard" ON public.orders
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() 
        OR (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        OR (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) IN ('admin', 'accountant', 'chef', 'rider')
    );

    -- 3. ENSURE ADMIN PROFILE IS CORRECTLY SET (WITHOUT BYPASSES)
    -- We keep edamoke@gmail.com as admin, but only via standard role flags
    UPDATE public.profiles
    SET role = 'admin', 
        is_admin = true, 
        is_suspended = false,
        email_confirmed = true
    WHERE email = 'edamoke@gmail.com';

    -- 4. CLEANUP ANY PROFILES WITH ILLEGITIMATE ADMIN FLAGS
    -- Remove is_admin from anyone who isn't explicitly an admin or the primary dev account
    UPDATE public.profiles
    SET is_admin = false, role = 'customer'
    WHERE is_admin = true 
      AND role != 'admin' 
      AND email != 'edamoke@gmail.com';

    -- 5. Final check on verification requirements
    RAISE NOTICE 'Security cleanup complete. RBAC is now the sole source of truth.';

END $$;
