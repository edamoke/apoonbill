-- Update profiles table with additional fields for default users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS favorite_meals TEXT[],
ADD COLUMN IF NOT EXISTS requested_cuisines TEXT[],
ADD COLUMN IF NOT EXISTS requested_meals TEXT[],
ADD COLUMN IF NOT EXISTS food_gallery JSONB DEFAULT '[]'::JSONB;

-- Ensure RLS allows users to update their own profile fields
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Storage bucket for user avatars and food gallery
INSERT INTO storage.buckets (id, name, public)
VALUES ('user_content', 'user_content', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user_content
DROP POLICY IF EXISTS "User Content Public Access" ON storage.objects;
CREATE POLICY "User Content Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'user_content' );

DROP POLICY IF EXISTS "Users can upload own content" ON storage.objects;
CREATE POLICY "Users can upload own content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user_content' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update own content" ON storage.objects;
CREATE POLICY "Users can update own content"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user_content' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own content" ON storage.objects;
CREATE POLICY "Users can delete own content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user_content' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
