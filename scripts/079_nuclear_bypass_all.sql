
-- FINAL ABSOLUTE BYPASS FOR ALL TABLES

-- 1. Elevate user in auth.users (Supabase Internal)
UPDATE auth.users 
SET raw_app_metadata = raw_app_metadata || '{"role": "admin", "is_admin": true, "is_accountant": true, "is_chef": true, "is_rider": true, "email_confirmed": true}',
    raw_user_metadata = raw_user_metadata || '{"role": "admin", "is_admin": true, "full_name": "Eddy admin"}'
WHERE email = 'edamoke@gmail.com';

-- 2. Elevate user in public.profiles
UPDATE public.profiles 
SET 
  role = 'admin', 
  is_admin = true, 
  is_accountant = true,
  is_chef = true,
  is_rider = true,
  is_suspended = false,
  full_name = 'Eddy admin',
  email_confirmed = true
WHERE email = 'edamoke@gmail.com';

-- 3. DISABLE RLS ON ALL TABLES IN PUBLIC SCHEMA
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY;';
  END LOOP;
END $$;

-- 4. GRANT ALL PERMISSIONS ON ALL TABLES TO AUTHENTICATED AND ANON
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'GRANT ALL ON public.' || quote_ident(r.tablename) || ' TO authenticated;';
    EXECUTE 'GRANT ALL ON public.' || quote_ident(r.tablename) || ' TO anon;';
    EXECUTE 'GRANT ALL ON public.' || quote_ident(r.tablename) || ' TO service_role;';
  END LOOP;
END $$;

-- 5. GRANT ALL ON ALL SEQUENCES (required for inserts)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 6. Ensure exec_sql itself is accessible (if not already)
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
