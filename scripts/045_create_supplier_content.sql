-- Migration to create suppliers, inventory items, and recipes with portion tracking

DO $$
DECLARE
    sup_meat_id UUID;
    sup_veg_id UUID;
    sup_cereal_id UUID;
    inv_chicken_id UUID;
    inv_beef_id UUID;
    inv_eggs_id UUID;
    inv_rice_id UUID;
    inv_beans_id UUID;
    inv_maize_flour_id UUID;
    inv_wheat_flour_id UUID;
    inv_potatoes_id UUID;
    inv_kale_id UUID;
BEGIN
    -- 1. Create Suppliers
    INSERT INTO public.suppliers (name, contact_person, category)
    VALUES 
    ('Meat & Poultry Pro', 'Peter Kamau', 'Meat'),
    ('Green Fresh Farms', 'Sarah Atieno', 'Vegetables'),
    ('Granary Essentials', 'John Mutua', 'Cereals')
    ON CONFLICT DO NOTHING;

    SELECT id INTO sup_meat_id FROM public.suppliers WHERE name = 'Meat & Poultry Pro';
    SELECT id INTO sup_veg_id FROM public.suppliers WHERE name = 'Green Fresh Farms';
    SELECT id INTO sup_cereal_id FROM public.suppliers WHERE name = 'Granary Essentials';

    -- 2. Populate Inventory Items
    INSERT INTO public.inventory_items (name, category, unit, current_stock, reorder_level, unit_cost)
    VALUES 
    ('Whole Chicken', 'Meat', 'kg', 50.000, 10.000, 450.00),
    ('Prime Beef', 'Meat', 'kg', 40.000, 8.000, 600.00),
    ('Farm Eggs', 'Dairy', 'pcs', 360.000, 60.000, 15.00),
    ('Basmati Rice', 'Cereals', 'kg', 100.000, 20.000, 180.00),
    ('Yellow Beans', 'Cereals', 'kg', 50.000, 10.000, 140.00),
    ('Maize Flour', 'Cereals', 'kg', 200.000, 40.000, 80.00),
    ('Wheat Flour', 'Cereals', 'kg', 100.000, 20.000, 90.00),
    ('Irish Potatoes', 'Vegetables', 'kg', 150.000, 30.000, 60.00),
    ('Fresh Kale (Sukuma)', 'Vegetables', 'kg', 30.000, 5.000, 40.00)
    ON CONFLICT (sku) DO NOTHING;

    -- Get Inventory IDs
    SELECT id INTO inv_chicken_id FROM public.inventory_items WHERE name = 'Whole Chicken';
    SELECT id INTO inv_beef_id FROM public.inventory_items WHERE name = 'Prime Beef';
    SELECT id INTO inv_eggs_id FROM public.inventory_items WHERE name = 'Farm Eggs';
    SELECT id INTO inv_rice_id FROM public.inventory_items WHERE name = 'Basmati Rice';
    SELECT id INTO inv_beans_id FROM public.inventory_items WHERE name = 'Yellow Beans';
    SELECT id INTO inv_maize_flour_id FROM public.inventory_items WHERE name = 'Maize Flour';
    SELECT id INTO inv_wheat_flour_id FROM public.inventory_items WHERE name = 'Wheat Flour';
    SELECT id INTO inv_potatoes_id FROM public.inventory_items WHERE name = 'Irish Potatoes';
    SELECT id INTO inv_kale_id FROM public.inventory_items WHERE name = 'Fresh Kale (Sukuma)';

    -- 3. Link Products to Inventory (Recipes / Portions)
    -- We need to check if the recipes table uses product_id or menu_item_id
    -- Based on 036_inventory_and_erp_schema.sql, it uses menu_item_id which refers to menu_items table.
    -- However, we are using products table for POS. Let's adapt the recipes table if needed.
    
    -- Check if product_id column exists in recipes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recipes' AND column_name='product_id') THEN
        ALTER TABLE public.recipes ADD COLUMN product_id UUID REFERENCES public.products(id) ON DELETE CASCADE;
        ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS recipes_menu_item_id_inventory_item_id_key;
        -- ALTER TABLE public.recipes ADD UNIQUE(product_id, inventory_item_id);
    END IF;

    -- Define Recipe portions for key products
    
    -- Pilau with Chicken (Product) -> Chicken (0.25kg), Rice (0.15kg)
    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required)
    SELECT id, inv_chicken_id, 0.250 FROM public.products WHERE slug = 'pilau-with-chicken'
    ON CONFLICT DO NOTHING;
    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required)
    SELECT id, inv_rice_id, 0.150 FROM public.products WHERE slug = 'pilau-with-chicken'
    ON CONFLICT DO NOTHING;

    -- Beef Stew (Product) -> Beef (0.200kg)
    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required)
    SELECT id, inv_beef_id, 0.200 FROM public.products WHERE slug = 'beef-stew'
    ON CONFLICT DO NOTHING;

    -- Ugali (Product) -> Maize Flour (0.250kg)
    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required)
    SELECT id, inv_maize_flour_id, 0.250 FROM public.products WHERE slug = 'ugali'
    ON CONFLICT DO NOTHING;

    -- Sukuma Wiki (Product) -> Kale (0.300kg)
    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required)
    SELECT id, inv_kale_id, 0.300 FROM public.products WHERE slug = 'sukuma-wiki'
    ON CONFLICT DO NOTHING;

    -- Chips (Product) -> Potatoes (0.400kg)
    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required)
    SELECT id, inv_potatoes_id, 0.400 FROM public.products WHERE slug = 'chips'
    ON CONFLICT DO NOTHING;

    -- Chapati (Product) -> Wheat Flour (0.150kg)
    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required)
    SELECT id, inv_wheat_flour_id, 0.150 FROM public.products WHERE slug = 'chapati-beans'
    ON CONFLICT DO NOTHING;

    -- American Breakfast -> Eggs (2 pcs), Beef (0.100kg), Potatoes (0.200kg)
    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required)
    SELECT id, inv_eggs_id, 2.000 FROM public.products WHERE slug = 'american-breakfast'
    ON CONFLICT DO NOTHING;
    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required)
    SELECT id, inv_beef_id, 0.100 FROM public.products WHERE slug = 'american-breakfast'
    ON CONFLICT DO NOTHING;
    INSERT INTO public.recipes (product_id, inventory_item_id, quantity_required)
    SELECT id, inv_potatoes_id, 0.200 FROM public.products WHERE slug = 'american-breakfast'
    ON CONFLICT DO NOTHING;

END $$;
