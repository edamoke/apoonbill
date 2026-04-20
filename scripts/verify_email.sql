-- Verify the email for edamoke@gmail.com
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'edamoke@gmail.com';
