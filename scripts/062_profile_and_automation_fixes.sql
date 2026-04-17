-- Migration 062: Profile Fixes and Storage Configuration
-- 1. Ensure 'profiles' bucket exists and is public
-- 2. Update storage policies to allow avatar uploads
-- 3. Fix favorite meal storage (ensure column exists and initialized)

-- 1. Ensure columns exist (Resilient)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='favorite_meals') THEN
        ALTER TABLE public.profiles ADD COLUMN favorite_meals TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='requested_cuisines') THEN
        ALTER TABLE public.profiles ADD COLUMN requested_cuisines TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='requested_meals') THEN
        ALTER TABLE public.profiles ADD COLUMN requested_meals TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='food_gallery') THEN
        ALTER TABLE public.profiles ADD COLUMN food_gallery JSONB DEFAULT '[]'::JSONB;
    END IF;
END $$;

-- 2. Storage Buckets Setup
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profiles', 'profiles', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif']),
  ('user_content', 'user_content', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Storage Policies for 'profiles' bucket
DROP POLICY IF EXISTS "Public Access Profiles" ON storage.objects;
CREATE POLICY "Public Access Profiles"
ON storage.objects FOR SELECT
USING ( bucket_id = 'profiles' );

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Favorite Meal Logic Fix
UPDATE public.profiles SET favorite_meals = '{}' WHERE favorite_meals IS NULL;

-- 5. Captain Order Automation Logic
CREATE OR REPLACE FUNCTION public.auto_approve_captain_order()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'sent_to_kitchen' AND OLD.status = 'pending') THEN
        -- Automated business logic here
        NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_approve_captain_order ON public.captain_orders;
CREATE TRIGGER trigger_auto_approve_captain_order
    AFTER UPDATE ON public.captain_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_approve_captain_order();
