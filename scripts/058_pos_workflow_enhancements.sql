-- Migration to add Supervisor and Manager roles and fix POS workflow

-- 1. Update profiles role check to include supervisor and manager
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'chef', 'rider', 'cashier', 'waiter', 'barman', 'accountant', 'supervisor', 'manager'));

-- 2. Add POS-specific tables for better control if not exists

-- Tables Table (For physical floor management)
CREATE TABLE IF NOT EXISTS public.pos_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(10) UNIQUE NOT NULL,
    capacity INT DEFAULT 4,
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'occupied', 'reserved', 'cleaning'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active POS Sessions (Shifts)
CREATE TABLE IF NOT EXISTS public.pos_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed'
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    opening_cash DECIMAL(12, 2) DEFAULT 0,
    closing_cash DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Voids/Discounts Log (For Audit)
CREATE TABLE IF NOT EXISTS public.pos_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id),
    action_type VARCHAR(50) NOT NULL, -- 'void', 'discount', 'refund'
    reason TEXT NOT NULL,
    performed_by UUID REFERENCES public.profiles(id), -- staff who requested
    authorized_by UUID REFERENCES public.profiles(id), -- supervisor/manager who approved
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.pos_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Staff can view tables" ON public.pos_tables FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage tables" ON public.pos_tables FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "Users can manage own sessions" ON public.pos_sessions FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR role = 'manager')));

CREATE POLICY "Managers can view audit logs" ON public.pos_audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR role = 'manager' OR role = 'supervisor')));

-- 5. Seed some tables
INSERT INTO public.pos_tables (number) VALUES ('T1'), ('T2'), ('T3'), ('T4'), ('T5'), ('B1'), ('B2') ON CONFLICT DO NOTHING;
