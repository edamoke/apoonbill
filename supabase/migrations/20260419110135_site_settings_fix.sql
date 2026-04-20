-- Add missing RLS policy for site_settings table if it doesn't exist
DO $$
BEGIN
    -- Check if the site_settings table exists
    IF EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'site_settings'
    ) THEN
        -- Check if the RLS policy already exists
        IF NOT EXISTS (
            SELECT 1
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'Allow admin write access on site_settings'
        ) THEN
            CREATE POLICY "Allow admin write access on site_settings"
                ON public.site_settings FOR ALL
                USING (
                    EXISTS (
                        SELECT 1 FROM public.profiles
                        WHERE profiles.id = auth.uid()
                        AND (profiles.role = 'admin' OR profiles.is_admin = true)
                    )
                );
        END IF;
    END IF;
END
$$;