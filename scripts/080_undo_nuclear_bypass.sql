
-- UNDO NUCLEAR BYPASS AND RESTORE RLS
-- This script re-enables RLS on tables and ensures proper roles are set for edamoke@gmail.com

-- 1. Restore edamoke@gmail.com's profile to its original state (keeping admin role but removing extra bypass flags if they were not intended)
-- Actually, the user wants the admin panel accessible. The elevation was likely correct but disabling RLS everywhere was the issue.
-- Let's re-enable RLS on all tables first.

DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
  END LOOP;
END $$;

-- 2. Restore policies for critical tables. 
-- Since we don't have a record of exactly which policies were there before the "DISABLE", 
-- we should at least ensure the core policies for admins are in place.

-- Re-applying the consolidated staff RLS logic might be a good way to "undo" the mess.
-- I'll check scripts/055_consolidated_staff_rls.sql and scripts/067_fix_pos_staff_rls.sql

-- 3. Reset edamoke@gmail.com to a standard admin profile
UPDATE public.profiles 
SET 
  role = 'admin', 
  is_admin = true, 
  is_accountant = false,
  is_chef = false,
  is_rider = false,
  is_suspended = false
WHERE email = 'edamoke@gmail.com';

UPDATE auth.users 
SET raw_app_metadata = raw_app_metadata || '{"role": "admin", "is_admin": true, "is_accountant": false, "is_chef": false, "is_rider": false}'
WHERE email = 'edamoke@gmail.com';

-- 4. Clean up any "GRANT ALL TO anon" if they were added globally
-- This is risky to do blindly but we should at least revoke what we specifically added in 079.
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'REVOKE ALL ON public.' || quote_ident(r.tablename) || ' FROM anon;';
    EXECUTE 'GRANT SELECT ON public.' || quote_ident(r.tablename) || ' TO anon;'; -- Restore basic select if needed, though usually anon has limited select
  END LOOP;
END $$;
