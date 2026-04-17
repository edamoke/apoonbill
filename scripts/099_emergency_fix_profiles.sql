-- Emergency Fix for Profiles Recursion

-- Drop the recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Ensure the safe JWT-based policy exists (it seems to exist as 'profiles_select_admin', but let's reinforce)
-- If it doesn't exist, we create a simple one.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles (JWT)'
    ) THEN
        CREATE POLICY "Admins can view all profiles (JWT)"
            ON public.profiles FOR SELECT
            USING (
                (auth.jwt() ->> 'email' = 'edamoke@gmail.com') OR
                ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true) OR
                ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true) OR
                (auth.jwt() ->> 'role' = 'service_role')
            );
    END IF;
END $$;

-- Drop potentially conflicting policies if they exist (clean up)
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles; -- We'll replace/consolidate
-- Wait, if I drop it and the above one didn't create because of name mismatch...
-- Let's just create a definitive "Final Admin Policy" and drop others.

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

CREATE POLICY "Admins can view all profiles (Final)"
    ON public.profiles FOR SELECT
    USING (
        (auth.uid() = id) OR -- Users view themselves
        (auth.jwt() ->> 'email' = 'edamoke@gmail.com') OR
        ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true) OR
        ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true) OR
        (auth.jwt() ->> 'role' = 'service_role')
    );

-- Ensure users can always view themselves (redundant with above OR, but good for clarity if split)
-- Actually, the above covers it. 
-- But existing "Users can view their own profile" might still be there.
-- Let's leave "Users can view their own profile" if it's just (auth.uid() = id).
-- It's policy index 2 in the output.

-- IMPORTANT: Make sure no other SELECT policies exist that query 'profiles' table recursively.
-- The inspect output showed:
-- 0: Admins can view all profiles (RECURSIVE - DROPPED ABOVE)
-- 2: Users can view their own profile (SAFE)
-- 4: profiles_select_admin (SAFE - DROPPED/REPLACED ABOVE)
-- 5: profiles_select_self (SAFE)

-- So we are good.
