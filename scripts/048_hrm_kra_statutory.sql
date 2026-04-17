-- Advanced HRM & Statutory Compliance (KRA, NHIF, NSSF)

-- 1. Enhanced Staff Details
ALTER TABLE public.hrm_staff_details 
ADD COLUMN IF NOT EXISTS kra_pin VARCHAR(20),
ADD COLUMN IF NOT EXISTS nhif_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS nssf_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS id_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS housing_levy_applicable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS personal_relief_applicable BOOLEAN DEFAULT true;

-- 2. Statutory Deduction Configuration (Current Kenya Rates)
CREATE TABLE IF NOT EXISTS public.hrm_statutory_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'NSSF_TIER_1', 'NHIF_MAX', etc.
    rate_type VARCHAR(20) NOT NULL, -- 'fixed', 'percentage'
    value DECIMAL(12, 2) NOT NULL,
    effective_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed with some current rates (approximation, should be verified by accountant)
INSERT INTO public.hrm_statutory_rates (name, rate_type, value) VALUES
('NSSF_TIER_1_LIMIT', 'fixed', 7000),
('NSSF_TIER_2_LIMIT', 'fixed', 36000),
('NSSF_RATE', 'percentage', 6.0),
('HOUSING_LEVY_RATE', 'percentage', 1.5),
('PERSONAL_RELIEF', 'fixed', 2400)
ON CONFLICT (name) DO NOTHING;

-- 3. PAYE Brackets (KRA Guidelines 2024)
CREATE TABLE IF NOT EXISTS public.hrm_paye_brackets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lower_limit DECIMAL(12, 2) NOT NULL,
    upper_limit DECIMAL(12, 2), -- NULL for the top bracket
    rate_percentage DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.hrm_paye_brackets (lower_limit, upper_limit, rate_percentage) VALUES
(0, 24000, 10.0),
(24001, 32333, 25.0),
(32334, 500000, 30.0),
(500001, 800000, 32.5),
(800001, NULL, 35.0)
ON CONFLICT DO NOTHING;

-- 4. NHIF Brackets (New SHIF logic pending, using current NHIF for now)
CREATE TABLE IF NOT EXISTS public.hrm_nhif_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lower_limit DECIMAL(12, 2) NOT NULL,
    upper_limit DECIMAL(12, 2),
    amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.hrm_nhif_rates (lower_limit, upper_limit, amount) VALUES
(0, 5999, 150),
(6000, 7999, 300),
(8000, 11999, 400),
(12000, 14999, 500),
(15000, 19999, 600),
(20000, 24999, 750),
(25000, 29999, 850),
(30000, 34999, 900),
(35000, 39999, 950),
(40000, 44999, 1000),
(45000, 49999, 1100),
(50000, 59999, 1200),
(60000, 69999, 1300),
(70000, 79999, 1400),
(80000, 89999, 1500),
(90000, 99999, 1600),
(100000, NULL, 1700)
ON CONFLICT DO NOTHING;

-- 5. Payroll Items (Deductions/Allowances breakdown)
CREATE TABLE IF NOT EXISTS public.hrm_payroll_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_id UUID REFERENCES public.hrm_payroll(id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL, -- 'Basic Salary', 'House Allowance', 'PAYE', 'NSSF', 'NHIF'
    item_type VARCHAR(20) NOT NULL, -- 'earnings', 'deduction'
    amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
