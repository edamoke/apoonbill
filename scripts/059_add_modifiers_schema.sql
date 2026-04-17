-- Migration to add Modifiers and linking to inventory

-- 1. Modifiers Groups Table
CREATE TABLE IF NOT EXISTS public.modifier_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_selection INT DEFAULT 0,
    max_selection INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Modifiers Table
CREATE TABLE IF NOT EXISTS public.modifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price_override DECIMAL(12, 2) DEFAULT 0,
    inventory_item_id UUID REFERENCES public.inventory_items(id), -- Optional: Link to inventory
    inventory_quantity DECIMAL(12, 3) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Product-Modifier Group Mapping
CREATE TABLE IF NOT EXISTS public.product_modifier_groups (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, group_id)
);

-- 4. Enable RLS
ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_modifier_groups ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Staff can view modifiers" ON public.modifier_groups FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can view modifier items" ON public.modifiers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can view product modifiers" ON public.product_modifier_groups FOR SELECT USING (auth.uid() IS NOT NULL);

-- 6. Seed some modifiers
-- Cooking Levels
INSERT INTO public.modifier_groups (id, name, description, min_selection, max_selection) 
VALUES ('c1b5f8d1-0000-0000-0000-000000000001', 'Cooking Level', 'How the meat should be cooked', 1, 1) ON CONFLICT DO NOTHING;

INSERT INTO public.modifiers (name, group_id, price_override) VALUES 
('Rare', 'c1b5f8d1-0000-0000-0000-000000000001', 0),
('Medium', 'c1b5f8d1-0000-0000-0000-000000000001', 0),
('Well Done', 'c1b5f8d1-0000-0000-0000-000000000001', 0)
ON CONFLICT DO NOTHING;

-- Add-ons
INSERT INTO public.modifier_groups (id, name, description, min_selection, max_selection) 
VALUES ('c1b5f8d1-0000-0000-0000-000000000002', 'Add-ons', 'Extra items', 0, 5) ON CONFLICT DO NOTHING;

INSERT INTO public.modifiers (name, group_id, price_override) VALUES 
('Extra Cheese', 'c1b5f8d1-0000-0000-0000-000000000002', 100),
('Bacon', 'c1b5f8d1-0000-0000-0000-000000000002', 200),
('Avocado', 'c1b5f8d1-0000-0000-0000-000000000002', 150)
ON CONFLICT DO NOTHING;

-- Link to some products (Steaks and Burgers)
INSERT INTO public.product_modifier_groups (product_id, group_id)
SELECT id, 'c1b5f8d1-0000-0000-0000-000000000001' FROM public.products WHERE name ILIKE '%steak%' OR name ILIKE '%burger%'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_modifier_groups (product_id, group_id)
SELECT id, 'c1b5f8d1-0000-0000-0000-000000000002' FROM public.products WHERE name ILIKE '%burger%' OR name ILIKE '%pizza%'
ON CONFLICT DO NOTHING;
