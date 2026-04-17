-- Create business_leads table
CREATE TABLE IF NOT EXISTS business_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    event_date DATE,
    event_location TEXT,
    lead_status TEXT DEFAULT 'pending', -- pending, quotation_sent, invoice_sent, paid, cancelled
    is_linked_to_system BOOLEAN DEFAULT FALSE,
    link_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    document_number TEXT UNIQUE
);

-- Create business_lead_items table
CREATE TABLE IF NOT EXISTS business_lead_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES business_leads(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) DEFAULT 0,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL -- Optional link to system product
);

-- RLS Policies
ALTER TABLE business_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_lead_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on business_leads" ON business_leads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'accountant')
        )
    );

CREATE POLICY "Admins can do everything on business_lead_items" ON business_lead_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'accountant')
        )
    );

-- Trigger for document numbers (Simplified for now)
CREATE OR REPLACE FUNCTION generate_business_lead_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT := 'BL-';
    new_number TEXT;
BEGIN
    new_number := prefix || LPAD(nextval('business_lead_seq')::TEXT, 6, '0');
    NEW.document_number := new_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence for document numbers
CREATE SEQUENCE IF NOT EXISTS business_lead_seq START 1;

CREATE TRIGGER tr_generate_business_lead_number
BEFORE INSERT ON business_leads
FOR EACH ROW
WHEN (NEW.document_number IS NULL)
EXECUTE FUNCTION generate_business_lead_number();
