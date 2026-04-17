-- Fix RLS policy for profile image uploads in user_content bucket

-- The previous policy used storage.foldername(name)[1] = auth.uid()::text
-- This requires the file to be uploaded into a folder named after the user ID.
-- However, sometimes client-side uploads or path concatenation can lead to issues.
-- Let's ensure the policies are robust.

-- Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('user_content', 'user_content', true)
ON CONFLICT (id) DO NOTHING;

-- 1. DROP EXISTING POLICIES
DROP POLICY IF EXISTS "User Content Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own content" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own content" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own content" ON storage.objects;

-- 2. CREATE NEW ROBUST POLICIES

-- SELECT: Public access (since public=true)
CREATE POLICY "User Content Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'user_content' );

-- INSERT: Users can upload to their own folder (folder name must match their UID)
CREATE POLICY "Users can upload own content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user_content' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: Users can update their own files
CREATE POLICY "Users can update own content"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user_content' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user_content' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: Users can delete their own files
CREATE POLICY "Users can delete own content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user_content' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. ADDITIONAL FAILSAFE: Allow authenticated users to upload to user_content if the folder logic fails 
-- (Not recommended for production without folder restriction, but good for debugging)
-- Let's keep the folder restriction as it is correct for Supabase standard.

-- 4. Ensure profiles table itself allows updating avatar_url
-- This policy was already created in 031 but let's re-verify/re-apply.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
