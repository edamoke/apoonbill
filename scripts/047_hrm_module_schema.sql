-- Human Resource Management Module Schema

-- 1. Departments
CREATE TABLE IF NOT EXISTS public.hrm_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Staff Profiles (Extended details)
CREATE TABLE IF NOT EXISTS public.hrm_staff_details (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.hrm_departments(id) ON DELETE SET NULL,
    job_title VARCHAR(100),
    employment_type VARCHAR(50) DEFAULT 'full-time', -- full-time, part-time, casual, contract
    date_joined DATE DEFAULT CURRENT_DATE,
    salary_amount DECIMAL(12, 2) DEFAULT 0,
    salary_frequency VARCHAR(20) DEFAULT 'monthly', -- daily, weekly, monthly
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Attendance Logs (More detailed than basic shifts)
CREATE TABLE IF NOT EXISTS public.hrm_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_in TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_out TIMESTAMP WITH TIME ZONE,
    location_coords TEXT, -- GPS if mobile
    status VARCHAR(20) DEFAULT 'present', -- present, late, absent
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Leave Management
CREATE TABLE IF NOT EXISTS public.hrm_leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- sick, vacation, emergency, maternity
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    approved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Payroll Records
CREATE TABLE IF NOT EXISTS public.hrm_payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    gross_pay DECIMAL(12, 2) NOT NULL,
    deductions DECIMAL(12, 2) DEFAULT 0,
    net_pay DECIMAL(12, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid
    transaction_id UUID, -- reference to accounting_ledger
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. RLS Policies
ALTER TABLE public.hrm_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_staff_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_payroll ENABLE ROW LEVEL SECURITY;

-- Admins, Accountants, and HRM roles can see everything
CREATE POLICY "Managers can view all HRM data"
    ON public.hrm_departments FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'accountant', 'hrm'))
    ));

CREATE POLICY "Staff can view their own details"
    ON public.hrm_staff_details FOR SELECT
    USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'accountant', 'hrm'))
    ));

CREATE POLICY "Managers can manage staff details"
    ON public.hrm_staff_details FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'accountant', 'hrm'))
    ));

-- Attendance
CREATE POLICY "Staff can check-in"
    ON public.hrm_attendance FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view their own attendance"
    ON public.hrm_attendance FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'accountant', 'hrm'))
    ));

-- Leaves
CREATE POLICY "Staff can request leaves"
    ON public.hrm_leaves FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view their own leaves"
    ON public.hrm_leaves FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'accountant', 'hrm'))
    ));

-- Payroll
CREATE POLICY "Staff can view their own payroll"
    ON public.hrm_payroll FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'accountant', 'hrm'))
    ));

-- Initial Data
INSERT INTO public.hrm_departments (name, description) VALUES
('Management', 'Executive and overall venue management'),
('Kitchen', 'Chefs and kitchen staff'),
('Service', 'Waiters, captains, and floor staff'),
('Bar', 'Bartenders and baristas'),
('Logistics', 'Riders and delivery staff'),
('Security', 'Venue security personnel')
ON CONFLICT (name) DO NOTHING;
