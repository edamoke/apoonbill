-- Roles and Permissions Schema for dynamic RBAC

-- 1. Modules Table
CREATE TABLE IF NOT EXISTS public.app_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL, -- 'accounting', 'hrm', 'pos_settings', 'inventory'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Custom Roles Table (Extending beyond the hardcoded ones)
CREATE TABLE IF NOT EXISTS public.custom_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'Accountant', 'HR Manager', 'Store Keeper'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Role Permissions Mapping
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES public.custom_roles(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.app_modules(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, module_id)
);

-- 4. Assign Custom Roles to Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_role_id UUID REFERENCES public.custom_roles(id);

-- 5. Seed Initial Modules
INSERT INTO public.app_modules (slug, name, description) VALUES
('accounting', 'Accounting & Financials', 'Access to general ledger, P&L, and financial reports'),
('hrm', 'HRM & Payroll', 'Staff management, attendance, and payroll processing'),
('pos_settings', 'POS Settings', 'Operational configuration for POS terminals'),
('inventory', 'Inventory Management', 'Stock levels, variance, and supplier orders'),
('orders', 'Order Management', 'Viewing and managing customer orders'),
('products', 'Product Management', 'Menu items and categories'),
('users', 'User Management', 'Managing profiles and permissions')
ON CONFLICT (slug) DO NOTHING;

-- 6. Seed Default Accountant Role
DO $$
DECLARE
    v_role_id UUID;
BEGIN
    INSERT INTO public.custom_roles (name, description) 
    VALUES ('Accountant', 'Default finance role with access to accounting and HRM')
    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
    RETURNING id INTO v_role_id;

    -- Accountant Permissions
    INSERT INTO public.role_permissions (role_id, module_id, can_view, can_edit)
    SELECT v_role_id, id, true, true FROM public.app_modules WHERE slug IN ('accounting', 'hrm', 'pos_settings', 'inventory')
    ON CONFLICT (role_id, module_id) DO NOTHING;
END $$;

-- 7. RLS
ALTER TABLE public.app_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage RBAC"
    ON public.app_modules FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "Admins can manage roles"
    ON public.custom_roles FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "Admins can manage permissions"
    ON public.role_permissions FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "Users can view their own permissions"
    ON public.role_permissions FOR SELECT
    USING (role_id = (SELECT custom_role_id FROM public.profiles WHERE id = auth.uid()));
