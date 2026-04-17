-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    type TEXT DEFAULT 'event', -- 'event' or 'offer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create venue_bookings table
CREATE TABLE IF NOT EXISTS venue_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    area TEXT NOT NULL, -- 'lounge', 'open_area', 'party_office'
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    guest_count INTEGER,
    occasion TEXT, -- 'birthday', 'office_party', 'other'
    special_requests TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_bookings ENABLE ROW LEVEL SECURITY;

-- Policies for events (drop if exists to avoid errors)
DROP POLICY IF EXISTS "Public can view active events" ON events;
CREATE POLICY "Public can view active events" ON events
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events" ON events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Policies for venue_bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON venue_bookings;
CREATE POLICY "Users can view their own bookings" ON venue_bookings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create bookings" ON venue_bookings;
CREATE POLICY "Users can create bookings" ON venue_bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Admins can manage all bookings" ON venue_bookings;
CREATE POLICY "Admins can manage all bookings" ON venue_bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Storage bucket for events
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies with unique names
DROP POLICY IF EXISTS "Events Public Access" ON storage.objects;
CREATE POLICY "Events Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'events' );

DROP POLICY IF EXISTS "Events Admin Upload" ON storage.objects;
CREATE POLICY "Events Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'events' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Events Admin Update" ON storage.objects;
CREATE POLICY "Events Admin Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'events' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Events Admin Delete" ON storage.objects;
CREATE POLICY "Events Admin Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'events' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
