-- Migration to add products and categories from JSON
-- Categories to add:
-- Coffee & Tea, Breakfast, Main Dishes - Fish, Burgers, Special Burger, Main Dishes, Side Dishes, Pizzeria, Salads, Seafood, Dessert, Pasta

DO $$
DECLARE
    cat_id UUID;
BEGIN
    -- Coffee & Tea
    INSERT INTO public.categories (name, slug, description)
    VALUES ('Coffee & Tea', 'coffee-tea', 'Assorted coffee and tea blends')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    INSERT INTO public.products (name, slug, description, price, category_id, preparation_time)
    VALUES 
    ('Mixed Tea', 'mixed-tea', 'Assorted tea blend', 200, cat_id, 5),
    ('Lemon Tea', 'lemon-tea', 'Tea infused with lemon', 150, cat_id, 5),
    ('Coffee Latte', 'coffee-latte', 'Espresso with steamed milk', 200, cat_id, 6)
    ON CONFLICT (slug) DO NOTHING;

    -- Breakfast
    INSERT INTO public.categories (name, slug, description)
    VALUES ('Breakfast', 'breakfast', 'Start your day with our breakfast selection')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    INSERT INTO public.products (name, slug, description, price, category_id, preparation_time)
    VALUES 
    ('Swahili Breakfast', 'swahili-breakfast', 'Viazi kerai, bhajia, mahamri, mbaazi, samosa, tea of your choice, signature ukwaju sauce', 500, cat_id, 20),
    ('American Breakfast', 'american-breakfast', 'Steak, fried eggs, coffee of your choice, roasted potatoes', 850, cat_id, 25),
    ('The Scrambler', 'the-scrambler', '3 eggs scrambled with onions, green peppers, mushrooms', 350, cat_id, 10)
    ON CONFLICT (slug) DO NOTHING;

    -- Main Dishes - Fish
    INSERT INTO public.categories (name, slug, description)
    VALUES ('Main Dishes - Fish', 'main-dishes-fish', 'Fresh fish selection')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    INSERT INTO public.products (name, slug, description, price, category_id, preparation_time)
    VALUES 
    ('Filetto di Red Snapper Grigliato', 'filetto-di-red-snapper-grigliato', 'Grilled red snapper, simply seasoned', 1000, cat_id, 20),
    ('Red Snapper alla Diavola', 'red-snapper-alla-diavola', 'Grilled red snapper with spicy tomato and chili sauce, garlic, herbs, olive oil', 1300, cat_id, 25),
    ('Grigliata del Pescatore', 'grigliata-del-pescatore', 'Italian seafood grill platter with prawns, calamari and fish fillet, seasoned with olive oil, lemon and herbs', 2000, cat_id, 30),
    ('Frittura Mista', 'frittura-mista', 'Light battered fried calamari, shrimps and seasonal fish', 1000, cat_id, 20),
    ('Gamberi Burro e Aglio', 'gamberi-burro-e-aglio', 'Prawns sauteed in butter, garlic, white wine, parsley and lemon', 2000, cat_id, 20),
    ('Melanzane alla Parmigiana', 'melanzane-alla-parmigiana', 'Baked eggplant layered with tomato sauce, mozzarella and parmesan cheese', 800, cat_id, 25),
    ('Filetto di Pesce alla Mugnaia', 'filetto-di-pesce-alla-mugnaia', 'Pan-seared fish fillet with butter, white wine and lemon sauce', 900, cat_id, 18),
    ('Filetto di Pesce alle Erbe', 'filetto-di-pesce-alle-erbe', 'Grilled fish fillet with Italian herbs, olive oil and lemon', 800, cat_id, 18)
    ON CONFLICT (slug) DO NOTHING;

    -- Burgers
    INSERT INTO public.categories (name, slug, description)
    VALUES ('Burgers', 'burgers', 'Juicy burgers with various toppings')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    INSERT INTO public.products (name, slug, description, price, category_id, preparation_time)
    VALUES 
    ('Cheese Burger', 'cheese-burger', 'Grilled beef patty, melted cheese, lettuce, tomato, onion and signature sauce on a roasted bun', 600, cat_id, 15),
    ('Cheese Chilli Burger', 'cheese-chilli-burger', 'Grilled beef patty with spicy chili sauce, cheddar cheese, red onion and crisp lettuce', 600, cat_id, 15),
    ('Bacon Burger', 'bacon-burger', 'Grilled beef patty with crispy pancetta, melted provolone cheese, lettuce and tomato', 650, cat_id, 18),
    ('Smashed Burger', 'smashed-burger', 'Double smashed beef patties layered with melted cheese, caramelized onions and crisp lettuce', 700, cat_id, 18),
    ('Veggie Burger', 'veggie-burger', 'Vegetable patty made from zucchini, carrots and chickpeas, topped with provolone cheese on a toasted bun', 500, cat_id, 15),
    ('Chicken Burger', 'chicken-burger', 'Grilled marinated chicken breast topped with melted provolone cheese', 700, cat_id, 18),
    ('Pork Burger', 'pork-burger', 'Pork hamburger', 800, cat_id, 20)
    ON CONFLICT (slug) DO NOTHING;

    -- Special Burger
    INSERT INTO public.categories (name, slug, description)
    VALUES ('Special Burger', 'special-burger', 'Our signature special burgers')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    INSERT INTO public.products (name, slug, description, price, category_id, preparation_time)
    VALUES 
    ('Stars and Garter Burger', 'stars-and-garter-burger', 'Hand-made triple beef patties stuffed with shredded cheese, topped with bacon, sausage, mayo, shredded lettuce and onions', 1100, cat_id, 30)
    ON CONFLICT (slug) DO NOTHING;

    -- Main Dishes (Meat/Chicken)
    INSERT INTO public.categories (name, slug, description)
    VALUES ('Main Dishes', 'main-dishes', 'Authentic Italian main courses')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    INSERT INTO public.products (name, slug, description, price, category_id, preparation_time)
    VALUES 
    ('Ossobuco con riso o purè', 'ossobuco-con-riso-o-pure', 'Meat ossobuco served with rice or mashed potatoes', 900, cat_id, 45),
    ('Spezzatino di manzo e verdure', 'spezzatino-di-manzo-e-verdure', 'Beef and vegetable stew', 700, cat_id, 40),
    ('Stufato di pollo', 'stufato-di-pollo', 'Chicken stew', 600, cat_id, 30),
    ('Pollo alla diavola', 'pollo-alla-diavola', 'Oven roasted chicken with vegetables', 700, cat_id, 35)
    ON CONFLICT (slug) DO NOTHING;

    -- Side Dishes
    INSERT INTO public.categories (name, slug, description)
    VALUES ('Side Dishes', 'side-dishes', 'Complementary side dishes')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    INSERT INTO public.products (name, slug, description, price, category_id, preparation_time)
    VALUES 
    ('Insalata mista o di pomodoro', 'insalata-mista-o-di-pomodoro', 'Mixed salad or tomato salad', 300, cat_id, 10),
    ('Patatine Fritte', 'patatine-fritte', 'French fries', 250, cat_id, 12),
    ('Spinaci o altre verdure', 'spinaci-o-altre-verdure', 'Spinach or other leafy vegetables', 200, cat_id, 10),
    ('Purè di patate', 'pure-di-patate', 'Mashed potatoes', 250, cat_id, 15),
    ('Verdure bollite', 'verdure-bollite', 'Boiled vegetables', 250, cat_id, 10),
    ('Verdure alla griglia', 'verdure-alla-griglia', 'Grilled vegetables', 300, cat_id, 15)
    ON CONFLICT (slug) DO NOTHING;

    -- Pizzeria
    INSERT INTO public.categories (name, slug, description)
    VALUES ('Pizzeria', 'pizzeria', 'Freshly baked focaccia and pizzas')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    INSERT INTO public.products (name, slug, description, price, category_id, preparation_time)
    VALUES 
    ('Focaccia Bruschetta', 'focaccia-bruschetta', 'Focaccia with tomato cubes, garlic and basil', 300, cat_id, 12),
    ('Focaccia semplice', 'focaccia-semplice', 'Traditional focaccia with rosemary', 350, cat_id, 10),
    ('Focaccia burro fuso ed aglio', 'focaccia-burro-fuso-ed-aglio', 'Focaccia with melted butter and garlic', 300, cat_id, 10),
    ('Focaccia Mozzarella', 'focaccia-mozzarella', 'Focaccia with mozzarella', 500, cat_id, 12),
    ('Focaccia Pesce Vela', 'focaccia-pesce-vela', 'Focaccia with sailfish', 650, cat_id, 15)
    ON CONFLICT (slug) DO NOTHING;

    -- Salads
    INSERT INTO public.categories (name, slug, description)
    VALUES ('Salads', 'salads', 'Fresh and healthy salads')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    INSERT INTO public.products (name, slug, description, price, category_id, preparation_time)
    VALUES 
    ('Insalata della casa', 'insalata-della-casa', 'Oregano greens, gorgonzola, olives, house dressing', 600, cat_id, 10),
    ('Caesar Salad', 'caesar-salad', 'Lettuce, anchovies, parmesan', 700, cat_id, 10),
    ('Caprese Salad', 'caprese-salad', 'Tomato, mozzarella, basil, balsamic vinaigrette', 700, cat_id, 8),
    ('Greek Salad', 'greek-salad', 'Lettuce, feta, olives, cucumber, red onions', 600, cat_id, 10),
    ('Tuna Salad', 'tuna-salad', 'Tuna based salad', 800, cat_id, 10),
    ('Chicken Salad', 'chicken-salad', 'Chicken salad', 700, cat_id, 12)
    ON CONFLICT (slug) DO NOTHING;

    -- Seafood
    INSERT INTO public.categories (name, slug, description)
    VALUES ('Seafood', 'seafood', 'Premium seafood selection')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    INSERT INTO public.products (name, slug, description, price, category_id, preparation_time)
    VALUES 
    ('Bistecca di Tonno', 'bistecca-di-tonno', 'Grilled tuna steak', 1000, cat_id, 20),
    ('Grigliata di Mare', 'grigliata-di-mare', 'Assorted seafood and vegetables grilled together', 3000, cat_id, 30),
    ('Calamari', 'calamari', 'Squid, fried or grilled', 800, cat_id, 15),
    ('Lobster Thermidore', 'lobster-thermidore', 'Succulent lobster meat cooked in a rich mustard and white wine sauce, topped with cheese and baked until golden', 2500, cat_id, 40)
    ON CONFLICT (slug) DO NOTHING;

    -- Dessert
    INSERT INTO public.categories (name, slug, description)
    VALUES ('Dessert', 'dessert', 'Sweet treats and desserts')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    INSERT INTO public.products (name, slug, description, price, category_id, preparation_time)
    VALUES 
    ('Fruit Salad', 'fruit-salad', 'Fresh mixed fruit', 300, cat_id, 10),
    ('Ice Cream', 'ice-cream', 'Ice cream scoop(s)', 200, cat_id, 3),
    ('Crepe Nutella / Banana / Mango', 'crepe-nutella-banana-mango', 'Crepe filled with Nutella and fruit', 300, cat_id, 10),
    ('Cake of the Day', 'cake-of-the-day', 'Chef’s daily cake selection', 200, cat_id, 5),
    ('Tiramisu', 'tiramisu', 'Classic Italian coffee-flavored dessert', 500, cat_id, 5)
    ON CONFLICT (slug) DO NOTHING;

    -- Pasta
    INSERT INTO public.categories (name, slug, description)
    VALUES ('Pasta', 'pasta', 'Traditional Italian pasta dishes')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    INSERT INTO public.products (name, slug, description, price, category_id, preparation_time)
    VALUES 
    ('Gnocchi with Gorgonzola Cheese', 'gnocchi-with-gorgonzola-cheese', 'Potato gnocchi in gorgonzola cheese sauce', 900, cat_id, 18),
    ('Bolognese Lasagna', 'bolognese-lasagna', 'Layered pasta with meat sauce', 800, cat_id, 25),
    ('Ravioli di Pollo', 'ravioli-di-pollo', 'Ravioli with chicken served in soup', 900, cat_id, 20),
    ('Spaghetti al Cortoccio', 'spaghetti-al-cortoccio', 'Spaghetti cooked with seafood', 1300, cat_id, 22)
    ON CONFLICT (slug) DO NOTHING;

END $$;
