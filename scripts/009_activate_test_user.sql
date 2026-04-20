-- Activate test user macpczone by confirming email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'macpczone@test.local';

-- Create or update the profile for the test user
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  phone,
  role,
  is_admin,
  is_chef,
  is_rider,
  is_accountant
)
SELECT
  id,
  email,
  'Mac PC Zone',
  '+254712345678',
  'customer',
  false,
  false,
  false,
  false
FROM auth.users
WHERE email = 'macpczone@test.local'
ON CONFLICT (id) DO UPDATE SET
  email_confirmed_at = NOW(),
  full_name = 'Mac PC Zone',
  phone = '+254712345678',
  role = 'customer';
