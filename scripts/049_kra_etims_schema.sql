-- KRA eTIMS Integration Schema

-- 1. Orders Enhancement
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS etims_invoice_no VARCHAR(50),
ADD COLUMN IF NOT EXISTS etims_qr_code TEXT,
ADD COLUMN IF NOT EXISTS etims_status VARCHAR(20) DEFAULT 'pending', -- pending, synced, failed
ADD COLUMN IF NOT EXISTS etims_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS etims_error_message TEXT;

-- 2. Products Enhancement (KRA Classifications)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS kra_product_code VARCHAR(50), -- e.g., KRA specific item codes
ADD COLUMN IF NOT EXISTS hs_code VARCHAR(20), -- Harmonized System Code for imports/tax
ADD COLUMN IF NOT EXISTS vat_category VARCHAR(2) DEFAULT 'A'; -- A (16%), B (0%), C (Exempt), etc.

-- 3. eTIMS Device/Branch Configuration
CREATE TABLE IF NOT EXISTS public.kra_etims_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_name VARCHAR(100) NOT NULL,
    kra_pin VARCHAR(20) NOT NULL,
    device_id VARCHAR(50) NOT NULL,
    vscu_endpoint TEXT,
    app_key TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. eTIMS Sync Logs (Detailed audit trail)
CREATE TABLE IF NOT EXISTS public.kra_etims_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id),
    payload JSONB,
    response JSONB,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS
ALTER TABLE public.kra_etims_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kra_etims_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage eTIMS config"
    ON public.kra_etims_config FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "Admins can view eTIMS logs"
    ON public.kra_etims_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));
