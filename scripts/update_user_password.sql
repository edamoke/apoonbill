-- Fix duplicate and update password script
DO $$
DECLARE
    target_email TEXT := 'edamoke@gmail.com';
    new_password TEXT := 'HobbitKing@20132';
    user_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id FROM auth.users WHERE email = target_email LIMIT 1;
    
    IF user_id IS NOT NULL THEN
        -- Update password in auth.users
        -- Update password in auth.users table using the crypt() function
        UPDATE auth.users
        SET encrypted_password = crypt(new_password, gen_salt('bf'))
        WHERE id = user_id;

        RAISE NOTICE 'Password updated for user: %', target_email;
    ELSE
        RAISE NOTICE 'User not found: %', target_email;
    END IF;
END $$;
