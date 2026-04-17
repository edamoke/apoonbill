-- Add email_confirmed column to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT FALSE;

-- Add missing role columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_chef BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_rider BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_accountant BOOLEAN DEFAULT FALSE;

-- Update profiles to mark test accounts and existing admins as confirmed
UPDATE public.profiles 
SET email_confirmed = TRUE 
WHERE email LIKE '%@test.local%' OR is_admin = TRUE OR role = 'admin';

-- Create an index for email confirmation status
CREATE INDEX IF NOT EXISTS idx_profiles_email_confirmed ON public.profiles(email_confirmed);
