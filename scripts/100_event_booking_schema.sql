-- Add price and capacity to events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 100;

-- Add event_id and total_amount to venue_bookings
ALTER TABLE venue_bookings
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tickets INTEGER DEFAULT 1;

-- Add booking_id to orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES venue_bookings(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_venue_bookings_event_id ON venue_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_booking_id ON orders(booking_id);
