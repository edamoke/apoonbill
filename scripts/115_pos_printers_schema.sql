-- Migration to create pos_printers table
CREATE TABLE IF NOT EXISTS pos_printers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('receipt', 'kitchen', 'bar', 'other')),
    connection_type TEXT NOT NULL CHECK (connection_type IN ('network', 'usb', 'bluetooth')),
    interface_address TEXT NOT NULL, -- IP address or port name
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add categories filter to printers (which categories should print here)
ALTER TABLE pos_printers ADD COLUMN IF NOT EXISTS target_categories UUID[] DEFAULT '{}';

-- Enable RLS
ALTER TABLE pos_printers ENABLE ROW LEVEL SECURITY;

-- Admin bypass for everything
CREATE POLICY "Admin full access on pos_printers" ON pos_printers
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)));

-- Staff read access
CREATE POLICY "Staff read access on pos_printers" ON pos_printers
    FOR SELECT TO authenticated
    USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_pos_printers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pos_printers_updated_at
    BEFORE UPDATE ON pos_printers
    FOR EACH ROW
    EXECUTE FUNCTION update_pos_printers_updated_at();
