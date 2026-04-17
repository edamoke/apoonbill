-- Final Migration to add menu items and categories from all provided JSON sources

-- Create new categories if they don't exist
INSERT INTO categories (name, slug, description)
VALUES 
    ('Coffee & Tea', 'coffee-tea', 'Refreshing hot and cold beverages'),
    ('Breakfast', 'breakfast', 'Start your day right'),
    ('Main Dishes - Fish', 'main-dishes-fish', 'Fresh seafood and fish specialties'),
    ('Seafood', 'seafood', 'Fresh seafood and fish specialties'),
    ('Burgers', 'burgers', 'Juicy grilled burgers'),
    ('Special Burger', 'special-burger', 'Our signature premium burgers'),
    ('Main Dishes', 'main-dishes', 'Hearty main courses'),
    ('Side Dishes', 'side-dishes', 'Perfect accompaniments for your meal'),
    ('Pizzeria', 'pizzeria', 'Authentic Italian focaccias'),
    ('Salads', 'salads', 'Fresh and healthy salad options'),
    ('Desserts', 'desserts', 'Sweet treats and after-dinner delights')
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs
DO $$
DECLARE
    coffee_tea_id UUID;
    breakfast_id UUID;
    fish_id UUID;
    seafood_id UUID;
    burgers_id UUID;
    special_burger_id UUID;
    main_dishes_id UUID;
    side_dishes_id UUID;
    pizzeria_id UUID;
    salads_id UUID;
    desserts_id UUID;
BEGIN
    SELECT id INTO coffee_tea_id FROM categories WHERE slug = 'coffee-tea';
    SELECT id INTO breakfast_id FROM categories WHERE slug = 'breakfast';
    SELECT id INTO fish_id FROM categories WHERE slug = 'main-dishes-fish';
    SELECT id INTO seafood_id FROM categories WHERE slug = 'seafood';
    SELECT id INTO burgers_id FROM categories WHERE slug = 'burgers';
    SELECT id INTO special_burger_id FROM categories WHERE slug = 'special-burger';
    SELECT id INTO main_dishes_id FROM categories WHERE slug = 'main-dishes';
    SELECT id INTO side_dishes_id FROM categories WHERE slug = 'side-dishes';
    SELECT id INTO pizzeria_id FROM categories WHERE slug = 'pizzeria';
    SELECT id INTO salads_id FROM categories WHERE slug = 'salads';
    SELECT id INTO desserts_id FROM categories WHERE slug = 'desserts';

    -- Coffee & Tea
    INSERT INTO products (name, slug, description, price, category_id, stock_status, image_url) VALUES
    ('Mixed Tea', 'mixed-tea', 'Assorted tea blend', 200, coffee_tea_id, 'in_stock', '/placeholder.svg'),
    ('Lemon Tea', 'lemon-tea', 'Tea infused with lemon', 150, coffee_tea_id, 'in_stock', '/placeholder.svg'),
    ('Coffee Latte', 'coffee-latte', 'Espresso with steamed milk', 200, coffee_tea_id, 'in_stock', '/placeholder.svg')
    ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description, category_id = EXCLUDED.category_id;

    -- Breakfast
    INSERT INTO products (name, slug, description, price, category_id, stock_status, image_url) VALUES
    ('Swahili Breakfast', 'swahili-breakfast', 'Viazi kerai, bhajia, mahamri, mbaazi, samosa, tea of your choice, signature ukwaju sauce', 500, breakfast_id, 'in_stock', '/placeholder.svg'),
    ('American Breakfast', 'american-breakfast', 'Steak, fried eggs, coffee of your choice, roasted potatoes', 850, breakfast_id, 'in_stock', '/placeholder.svg'),
    ('The Scrambler', 'the-scrambler', '3 eggs scrambled with onions, green peppers, mushrooms', 350, breakfast_id, 'in_stock', '/placeholder.svg')
    ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description, category_id = EXCLUDED.category_id;

    -- Main Dishes - Fish / Seafood
    INSERT INTO products (name, slug, description, price, category_id, stock_status, image_url) VALUES
    ('Filetto di Red Snapper Grigliato', 'filetto-di-red-snapper-grigliato', 'Grilled red snapper, simply seasoned', 1000, seafood_id, 'in_stock', '/placeholder.svg'),
    ('Red Snapper alla Diavola', 'red-snapper-alla-diavola', 'Grilled red snapper with spicy tomato and chili sauce, garlic, herbs, olive oil', 1300, seafood_id, 'in_stock', '/placeholder.svg'),
    ('Grigliata del Pescatore', 'grigliata-del-pescatore', 'Italian seafood grill platter with prawns, calamari and fish fillet, seasoned with olive oil, lemon and herbs', 2000, seafood_id, 'in_stock', '/placeholder.svg'),
    ('Frittura Mista', 'frittura-mista', 'Light battered fried calamari, shrimps and seasonal fish', 1000, seafood_id, 'in_stock', '/placeholder.svg'),
    ('Gamberi Burro e Aglio', 'gamberi-burro-e-aglio', 'Prawns sauteed in butter, garlic, white wine, parsley and lemon', 2000, seafood_id, 'in_stock', '/placeholder.svg'),
    ('Melanzane alla Parmigiana', 'melanzane-alla-parmigiana', 'Baked eggplant layered with tomato sauce, mozzarella and parmesan cheese', 800, seafood_id, 'in_stock', '/placeholder.svg'),
    ('Filetto di Pesce alla Mugnaia', 'filetto-di-pesce-alla-mugnaia', 'Pan-seared fish fillet with butter, white wine and lemon sauce', 900, seafood_id, 'in_stock', '/placeholder.svg'),
    ('Filetto di Pesce alle Erbe', 'filetto-di-pesce-alla-erbe', 'Grilled fish fillet with Italian herbs, olive oil and lemon', 800, seafood_id, 'in_stock', '/placeholder.svg'),
    ('Bistecca di Tonno', 'bistecca-di-tonno', 'Grilled tuna steak (Tuna Fish Steak)', 1000, seafood_id, 'in_stock', '/placeholder.svg'),
    ('Grigliata di Mare', 'grigliata-di-mare', 'Assorted seafood and vegetables grilled together (Mixed Grilled Seafood and Vegetables)', 3000, seafood_id, 'in_stock', '/placeholder.svg'),
    ('Calamari', 'calamari', 'Squid, fried or grilled (Squids)', 800, seafood_id, 'in_stock', '/placeholder.svg'),
    ('Lobster Thermidore', 'lobster-thermidore', 'Succulent lobster meat cooked in a rich mustard and white wine sauce, topped with cheese and baked until golden', 2500, seafood_id, 'in_stock', '/placeholder.svg')
    ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description, category_id = EXCLUDED.category_id;

    -- Burgers
    INSERT INTO products (name, slug, description, price, category_id, stock_status, image_url) VALUES
    ('Cheese Burger', 'cheese-burger', 'Grilled beef patty, melted cheese, lettuce, tomato, onion and signature sauce on a roasted bun', 600, burgers_id, 'in_stock', '/placeholder.svg'),
    ('Cheese Chilli Burger', 'cheese-chilli-burger', 'Grilled beef patty with spicy chili sauce, cheddar cheese, red onion and crisp lettuce', 600, burgers_id, 'in_stock', '/placeholder.svg'),
    ('Bacon Burger', 'bacon-burger', 'Grilled beef patty with crispy pancetta, melted provolone cheese, lettuce and tomato', 650, burgers_id, 'in_stock', '/placeholder.svg'),
    ('Smashed Burger', 'smashed-burger', 'Double smashed beef patties layered with melted cheese, caramelized onions and crisp lettuce', 700, burgers_id, 'in_stock', '/placeholder.svg'),
    ('Veggie Burger', 'veggie-burger', 'Vegetable patty made from zucchini, carrots and chickpeas, topped with provolone cheese on a toasted bun', 500, burgers_id, 'in_stock', '/placeholder.svg'),
    ('Chicken Burger', 'chicken-burger', 'Grilled marinated chicken breast topped with melted provolone cheese', 700, burgers_id, 'in_stock', '/placeholder.svg'),
    ('Pork Burger', 'pork-burger', 'Pork hamburger', 800, burgers_id, 'in_stock', '/placeholder.svg')
    ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description, category_id = EXCLUDED.category_id;

    -- Special Burger
    INSERT INTO products (name, slug, description, price, category_id, stock_status, image_url) VALUES
    ('Stars and Garter Burger', 'stars-and-garter-burger', 'Hand-made triple beef patties stuffed with shredded cheese, topped with bacon, sausage, mayo, shredded lettuce and onions', 1100, special_burger_id, 'in_stock', '/placeholder.svg')
    ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description, category_id = EXCLUDED.category_id;

    -- Main Dishes
    INSERT INTO products (name, slug, description, price, category_id, stock_status, image_url) VALUES
    ('Ossobuco con riso o purè', 'ossobuco-riso-pure', 'Meat ossobuco served with rice or mashed potatoes', 900, main_dishes_id, 'in_stock', '/placeholder.svg'),
    ('Spezzatino di manzo e verdure', 'spezzatino-manzo-verdure', 'Beef and vegetable stew', 700, main_dishes_id, 'in_stock', '/placeholder.svg'),
    ('Stufato di pollo', 'stufato-pollo', 'Chicken stew', 600, main_dishes_id, 'in_stock', '/placeholder.svg'),
    ('Pollo alla diavola', 'pollo-alla-diavola', 'Oven roasted chicken with vegetables', 700, main_dishes_id, 'in_stock', '/placeholder.svg')
    ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description, category_id = EXCLUDED.category_id;

    -- Side Dishes
    INSERT INTO products (name, slug, description, price, category_id, stock_status, image_url) VALUES
    ('Insalata mista o di pomodoro', 'insalata-mista-pomodoro', 'Mixed salad or tomato salad', 300, side_dishes_id, 'in_stock', '/placeholder.svg'),
    ('Patatine Fritte', 'patatine-fritte', 'French fries', 250, side_dishes_id, 'in_stock', '/placeholder.svg'),
    ('Spinaci o altre verdure', 'spinaci-verdure', 'Spinach or other leafy vegetables', 200, side_dishes_id, 'in_stock', '/placeholder.svg'),
    ('Purè di patate', 'pure-di-patate', 'Mashed potatoes', 250, side_dishes_id, 'in_stock', '/placeholder.svg'),
    ('Verdure bollite', 'verdure-bollite', 'Boiled vegetables', 250, side_dishes_id, 'in_stock', '/placeholder.svg'),
    ('Verdure alla griglia', 'verdure-griglia', 'Grilled vegetables', 300, side_dishes_id, 'in_stock', '/placeholder.svg')
    ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description, category_id = EXCLUDED.category_id;

    -- Pizzeria
    INSERT INTO products (name, slug, description, price, category_id, stock_status, image_url) VALUES
    ('Focaccia Bruschetta', 'focaccia-bruschetta', 'Focaccia with tomato cubes, garlic and basil', 300, pizzeria_id, 'in_stock', '/placeholder.svg'),
    ('Focaccia semplice', 'focaccia-semplice', 'Traditional focaccia with rosemary', 350, pizzeria_id, 'in_stock', '/placeholder.svg'),
    ('Focaccia burro fuso ed aglio', 'focaccia-burro-fuso-aglio', 'Focaccia with melted butter and garlic', 300, pizzeria_id, 'in_stock', '/placeholder.svg'),
    ('Focaccia Mozzarella', 'focaccia-mozzarella', 'Focaccia with mozzarella', 500, pizzeria_id, 'in_stock', '/placeholder.svg'),
    ('Focaccia Pesce Vela', 'focaccia-pesce-vela', 'Focaccia with sailfish', 650, pizzeria_id, 'in_stock', '/placeholder.svg')
    ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description, category_id = EXCLUDED.category_id;

    -- Salads
    INSERT INTO products (name, slug, description, price, category_id, stock_status, image_url) VALUES
    ('Insalata della casa', 'insalata-casa', 'Oregano greens, gorgonzola, olives, house dressing', 600, salads_id, 'in_stock', '/placeholder.svg'),
    ('Caesar Salad', 'caesar-salad-new', 'Lettuce, anchovies, parmesan', 700, salads_id, 'in_stock', '/placeholder.svg'),
    ('Caprese Salad', 'caprese-salad-new', 'Tomato, mozzarella, basil, balsamic vinaigrette', 700, salads_id, 'in_stock', '/placeholder.svg'),
    ('Greek Salad', 'greek-salad-new', 'Lettuce, feta, olives, cucumber, red onions', 600, salads_id, 'in_stock', '/placeholder.svg'),
    ('Tuna Salad', 'tuna-salad-new', 'Tuna based salad', 800, salads_id, 'in_stock', '/placeholder.svg'),
    ('Chicken Salad', 'chicken-salad-new', 'Chicken salad', 700, salads_id, 'in_stock', '/placeholder.svg')
    ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description, category_id = EXCLUDED.category_id;

    -- Desserts
    INSERT INTO products (name, slug, description, price, category_id, stock_status, image_url) VALUES
    ('Fruit Salad', 'fruit-salad', 'Fresh mixed fruit (Macedonia di Frutta)', 300, desserts_id, 'in_stock', '/placeholder.svg'),
    ('Ice Cream', 'ice-cream', 'Ice cream scoop(s) (Gelato)', 200, desserts_id, 'in_stock', '/placeholder.svg'),
    ('Crepe Nutella / Banana / Mango', 'crepe-nutella-banana-mango', 'Crepe filled with Nutella and fruit', 300, desserts_id, 'in_stock', '/placeholder.svg'),
    ('Cake of the Day', 'cake-of-the-day', 'Chef’s daily cake selection', 200, desserts_id, 'in_stock', '/placeholder.svg'),
    ('Tiramisu', 'tiramisu', 'Classic Italian coffee-flavored dessert', 500, desserts_id, 'in_stock', '/placeholder.svg'),
    ('Cream Caramel', 'cream-caramel', 'Caramel custard pudding', 400, desserts_id, 'in_stock', '/placeholder.svg'),
    ('Fruit Salad with Ice Cream', 'fruit-salad-ice-cream', 'Fresh fruit salad topped with ice cream', 500, desserts_id, 'in_stock', '/placeholder.svg')
    ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description, category_id = EXCLUDED.category_id;

    -- Pasta (specifically from the last JSON)
    INSERT INTO products (name, slug, description, price, category_id, stock_status, image_url) VALUES
    ('Gnocchi with Gorgonzola Cheese', 'gnocchi-gorgonzola', 'Potato gnocchi in gorgonzola cheese sauce', 900, main_dishes_id, 'in_stock', '/placeholder.svg'),
    ('Bolognese Lasagna', 'bolognese-lasagna', 'Layered pasta with meat sauce', 800, main_dishes_id, 'in_stock', '/placeholder.svg'),
    ('Ravioli di Pollo', 'ravioli-di-pollo', 'Ravioli with chicken served in soup', 900, main_dishes_id, 'in_stock', '/placeholder.svg'),
    ('Spaghetti al Cortoccio', 'spaghetti-al-cortoccio', 'Spaghetti cooked with seafood', 1300, main_dishes_id, 'in_stock', '/placeholder.svg')
    ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description, category_id = EXCLUDED.category_id;

END $$;
