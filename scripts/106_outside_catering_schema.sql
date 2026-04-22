-- Cook outs Schema
CREATE TYPE catering_request_status AS ENUM ('pending', 'quoted', 'confirmed', 'cancelled', 'completed');

CREATE TABLE IF NOT EXISTS catering_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location TEXT NOT NULL,
    total_people INTEGER NOT NULL CHECK (total_people > 0),
    meal_types TEXT[] NOT NULL, -- e.g., ['Breakfast', 'Lunch']
    meal_details TEXT,
    drink_details TEXT,
    
    -- Automatically calculated fields (suggested)
    suggested_tents INTEGER DEFAULT 0,
    suggested_chairs INTEGER DEFAULT 0,
    suggested_tables INTEGER DEFAULT 0,
    suggested_plates INTEGER DEFAULT 0,
    suggested_spoons INTEGER DEFAULT 0,
    suggested_knives INTEGER DEFAULT 0,
    suggested_forks INTEGER DEFAULT 0,
    
    status catering_request_status DEFAULT 'pending',
    
    -- Admin response fields
    quoted_price DECIMAL(10, 2),
    admin_notes TEXT,
    responded_by UUID REFERENCES auth.users(id),
    responded_at TIMESTAMP WITH TIME ZONE,
    is_ai_responded BOOLEAN DEFAULT FALSE,
    raw_ai_response JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE catering_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own requests
CREATE POLICY "Users can view their own catering requests"
    ON catering_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own requests
CREATE POLICY "Users can insert their own catering requests"
    ON catering_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow admins to see all requests
CREATE POLICY "Admins can view all catering requests"
    ON catering_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin', 'manager')
        )
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_catering_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_catering_requests_updated_at
    BEFORE UPDATE ON catering_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_catering_requests_updated_at();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_catering_requests_user_id ON catering_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_catering_requests_status ON catering_requests(status);
CREATE INDEX IF NOT EXISTS idx_catering_requests_event_date ON catering_requests(event_date);
