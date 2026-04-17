-- Migration to create inventory and recipe management tables for restaurant ERP

-- 1. Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    unit VARCHAR(20) NOT NULL, -- e.g., 'kg', 'g', 'l', 'ml', 'pcs'
    unit_cost DECIMAL(12, 2) DEFAULT 0,
    current_stock DECIMAL(12, 3) DEFAULT 0,
    reorder_level DECIMAL(12, 3) DEFAULT 0,
    last_purchased_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Recipes / Meal Content Table (Links Menu Items to Inventory Items)
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity_required DECIMAL(12, 3) NOT NULL, -- quantity of inventory item used for 1 serving of menu item
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(menu_item_id, inventory_item_id)
);

-- 3. Inventory Transactions Table (For tracking stock movements)
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'purchase', 'usage', 'waste', 'return', 'adjustment'
    quantity DECIMAL(12, 3) NOT NULL, -- Positive for increase, negative for decrease
    unit_cost_at_time DECIMAL(12, 2),
    reference_id UUID, -- Can be order_id for usage, or purchase_order_id
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 4. Captain Orders Table (Floor staff order tracking)
CREATE TABLE IF NOT EXISTS public.captain_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_number VARCHAR(20),
    captain_id UUID REFERENCES public.profiles(id),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent_to_kitchen', 'served', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add captain_order_id to existing orders table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='captain_order_id') THEN
        ALTER TABLE public.orders ADD COLUMN captain_order_id UUID REFERENCES public.captain_orders(id);
    END IF;
END $$;

-- 5. RLS Policies

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captain_orders ENABLE ROW LEVEL SECURITY;

-- Admins and Accountants can manage inventory
CREATE POLICY "Admins and Accountants can manage inventory"
    ON public.inventory_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

-- Everyone (Staff) can view recipes but only admin/accountant can manage
CREATE POLICY "Staff can view recipes"
    ON public.recipes FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and Accountants can manage recipes"
    ON public.recipes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

-- Transaction history management
CREATE POLICY "Admins and Accountants can manage transactions"
    ON public.inventory_transactions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

-- Captain Orders management
CREATE POLICY "Staff can manage captain orders"
    ON public.captain_orders FOR ALL
    USING (auth.uid() IS NOT NULL);

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_captain_orders_updated_at BEFORE UPDATE ON public.captain_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
