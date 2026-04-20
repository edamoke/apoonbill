-- Optional: Update profile to ensure it exists or is correctly configured
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
  'Edamoke',
  '+254712345678',
  'admin',
  true,
  false,
  false,
  false
FROM auth.users
WHERE email = 'edamoke@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  email_confirmed_at = NOW(),
  full_name = 'Edamoke',
  phone = '+254712345678',
  role = 'admin',
  is_admin = true;
