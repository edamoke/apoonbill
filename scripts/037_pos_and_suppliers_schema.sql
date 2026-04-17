-- Migration to add POS and Supplier management tables

-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email TEXT,
    phone VARCHAR(20),
    address TEXT,
    category VARCHAR(100), -- e.g., 'Meat', 'Vegetables', 'Beverages'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Supply Orders Table
CREATE TABLE IF NOT EXISTS public.supply_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'delivered', 'failed', 'cancelled'
    total_amount DECIMAL(12, 2) DEFAULT 0,
    delivery_weight DECIMAL(12, 3), -- weight recorded at delivery
    failure_reason TEXT, -- if status is 'failed'
    expected_delivery_date DATE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 3. Supply Order Items Table
CREATE TABLE IF NOT EXISTS public.supply_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supply_order_id UUID REFERENCES public.supply_orders(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity DECIMAL(12, 3) NOT NULL,
    unit_cost DECIMAL(12, 2) NOT NULL,
    total_cost DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_cost) STORED
);

-- 4. Staff Shifts Table
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'waiter', 'barman', 'cashier'
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    total_sales DECIMAL(12, 2) DEFAULT 0, -- automatically calculated on logout
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS Policies

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;

-- Suppliers: Admins and Accountants
CREATE POLICY "Admins and Accountants can manage suppliers"
    ON public.suppliers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

-- Supply Orders: Admins and Accountants
CREATE POLICY "Admins and Accountants can manage supply orders"
    ON public.supply_orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

-- Shifts: Users can manage their own shifts, Admins/Accountants can see all
CREATE POLICY "Users can manage own shifts"
    ON public.staff_shifts FOR ALL
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
    ));

-- 6. Functions & Triggers

-- Trigger for updated_at on suppliers and supply_orders
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_supply_orders_updated_at BEFORE UPDATE ON public.supply_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Update profiles role check (Add cashier, waiter, barman, accountant)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'chef', 'rider', 'cashier', 'waiter', 'barman', 'accountant'));

-- Add is_accountant column to profiles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_accountant') THEN
        ALTER TABLE public.profiles ADD COLUMN is_accountant BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
