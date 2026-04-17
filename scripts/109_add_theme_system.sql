-- Migration: Add Theme System to Site Settings
-- Description: Adds theme_id and active_theme_config to site_settings table

-- Check if columns already exist to make it idempotent
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'theme_id') THEN
        ALTER TABLE site_settings ADD COLUMN theme_id TEXT DEFAULT 'default';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'theme_config') THEN
        ALTER TABLE site_settings ADD COLUMN theme_config JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Ensure the 'styles' setting entry exists and has the default theme
INSERT INTO site_settings (id, content, theme_id)
VALUES ('styles', '{"primaryColor": "#d62828", "secondaryColor": "#0A2D4A", "backgroundColor": "black", "fontSize": "base"}', 'default')
ON CONFLICT (id) DO UPDATE SET theme_id = EXCLUDED.theme_id;
