-- Fix events table schema
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'status') THEN
        ALTER TABLE events ADD COLUMN status TEXT DEFAULT 'upcoming';
    END IF;
END $$;

-- Update existing records if any
UPDATE events SET status = 'upcoming' WHERE status IS NULL;
