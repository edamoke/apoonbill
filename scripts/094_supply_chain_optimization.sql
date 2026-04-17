-- Migration for Supply Chain Optimization

-- 1. Create Supplier Items Table (Link Suppliers to Inventory Items with Price)
CREATE TABLE IF NOT EXISTS public.supplier_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    unit_cost DECIMAL(12, 2) NOT NULL,
    lead_time_days INTEGER DEFAULT 1,
    is_preferred BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(supplier_id, inventory_item_id)
);

-- 2. Add Auto-Reorder flag to Inventory Items
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS auto_reorder BOOLEAN DEFAULT false;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS reorder_quantity DECIMAL(12, 3) DEFAULT 0; -- Explicit reorder quantity

-- 3. Add Supply Order ID to Notifications for deep linking
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS supply_order_id UUID REFERENCES public.supply_orders(id) ON DELETE CASCADE;

-- 4. Enable RLS for supplier_items
ALTER TABLE public.supplier_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Accountants can manage supplier items"
    ON public.supplier_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR is_accountant = true OR role = 'accountant')
        )
    );

-- 5. Trigger for updated_at
CREATE TRIGGER update_supplier_items_updated_at BEFORE UPDATE ON public.supplier_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
