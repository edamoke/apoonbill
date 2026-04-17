-- Ensure venue_bookings columns are correct
DO $$ 
BEGIN
    -- Check if 'venue_name' exists, if not, rename 'area' or add it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_bookings' AND column_name = 'area') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_bookings' AND column_name = 'venue_name') THEN
            ALTER TABLE venue_bookings RENAME COLUMN area TO venue_name;
        END IF;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_bookings' AND column_name = 'venue_name') THEN
        ALTER TABLE venue_bookings ADD COLUMN venue_name TEXT NOT NULL DEFAULT 'lounge';
    END IF;

    -- Ensure 'guest_count' is NOT NULL if needed, or has default
    ALTER TABLE venue_bookings ALTER COLUMN guest_count SET DEFAULT 1;

    -- Ensure 'status' column exists (already in 023 but being safe)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_bookings' AND column_name = 'status') THEN
        ALTER TABLE venue_bookings ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Fix profiles relation if necessary (ensure foreign key exists to profiles table if it's separate from auth.users)
-- In this app, profiles table exists and links to auth.users.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'venue_bookings' AND constraint_type = 'FOREIGN KEY' AND constraint_name = 'venue_bookings_user_id_fkey'
    ) THEN
        ALTER TABLE venue_bookings DROP CONSTRAINT IF EXISTS venue_bookings_user_id_fkey;
        ALTER TABLE venue_bookings ADD CONSTRAINT venue_bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;
