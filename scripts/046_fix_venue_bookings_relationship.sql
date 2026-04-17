-- Fix venue_bookings relationship with profiles
-- Instead of referencing auth.users, it should ideally reference profiles for PostgREST joins to work seamlessly
-- Or we just ensure there's a FK to profiles if we want to join with profiles.

ALTER TABLE venue_bookings 
DROP CONSTRAINT IF EXISTS venue_bookings_user_id_fkey;

ALTER TABLE venue_bookings
ADD CONSTRAINT venue_bookings_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id)
ON DELETE SET NULL;
