-- Migration: Update menu from PDF data
-- Description: Creates new categories and products, updates existing ones, and disables old placeholder products.

DO $$
DECLARE
    cat_record RECORD;
    prod_record RECORD;
    new_cat_id UUID;
    menu_data JSONB := '[
  {
    "category": "PIZZERIA",
    "description": "Authentic Italian Pizzas",
    "products": [
      { "name": "MARINARA", "description": "tomato, garlic and oregano", "price": 500 },
      { "name": "Margaherita", "description": "tomato, mozzarella and basil", "price": 700 },
      { "name": "Napoletana", "description": "tomato, mozzarella, anchovies", "price": 700 },
      { "name": "Romana", "description": "tomato, mozzarella, anchovies capers", "price": 1000 },
      { "name": "Cappresse Pizza", "description": "Fresh sliced tomato, mozzarella", "price": 500 },
      { "name": "Vegetariana", "description": "tomato, mozzarella, mixed vegetables", "price": 700 },
      { "name": "Diavola", "description": "tomato, mozzarella , spicy salmi", "price": 850 },
      { "name": "Proscuitto e Funghi", "description": "tomato, mozzarella, ham, mushroom", "price": 900 },
      { "name": "Chicken - Pollo", "description": "Tomato, Mozzarella, chicken strings", "price": 800 },
      { "name": "Capricciosa", "description": "tomato, mozzarella, cooked raw ham, mushrooms, artichokes", "price": 900 },
      { "name": "Bolognese", "description": "tomato, mozzarella, beef minced", "price": 800 },
      { "name": "Oceano - Sea Food", "description": "tomato, mozzarella and sea food variety", "price": 1200 },
      { "name": "Florentine", "description": "Ricotta cheese, tender roast chicken, spinach", "price": 600 },
      { "name": "Funghi", "description": "Mushrooms, tomato, Fresh Basil", "price": 600 },
      { "name": "Viennese", "description": "Tomato, mozzarella, beef wurstel", "price": 700 },
      { "name": "Zola", "description": "mozarella, gorgonzola cheese", "price": 800 },
      { "name": "Tuna", "description": "tomato, mozzarella, tuna fish", "price": 800 },
      { "name": "quarto formaggi", "description": "4 different kind of cheese", "price": 900 },
      { "name": "Mozzarella e Proscuitto", "description": "with Mozzarella, tomato and ham", "price": 800 },
      { "name": "Hawaiian", "description": "Ham, red onions, pineapple, mozzarella", "price": 900 },
      { "name": "Panzerotto", "description": "Ham and cheese panzerotto", "price": 600 }
    ]
  },
  {
    "category": "MAIN DISHES - CARNE",
    "description": "Premium Meat Selections",
    "products": [
      { "name": "Pollo alla Diavola", "description": "Spicy grilled chicken marinated with garlic, herbs and chilly saucy and Flavourful", "price": 800 },
      { "name": "Pollo Milanese", "description": "Chicken breast coated and deep fried to perfection", "price": 700 },
      { "name": "Cotoletta alla Milanese", "description": "Beef coated and deep fried to perfection", "price": 800 },
      { "name": "Petto di Pollo alla Calabrese", "description": "Grilled dunken breast salted eith spicy calabrian chilly, garlic, bell peppers, garlic and tomatoes", "price": 1000 },
      { "name": "Costolette d’agnello con polenta", "description": "Grilled lamb chops with polenta", "price": 1200 },
      { "name": "Filletto alla Griglia", "description": "Grilled tender fish fillet", "price": 800 },
      { "name": "Entrecote al pepe Verde", "description": "Tender beef sirloin steak in green pepper sauce", "price": 950 },
      { "name": "Tagliata di manzo alle Erbe aromatiche", "description": "Grilled beef fillet, sliced with ruccola & granna", "price": 950 },
      { "name": "Filetto di maiale in crosta", "description": "Grilled pork tenderloin in Bacon rind served with spinach and mush Potatoes", "price": 1200 },
      { "name": "Filleto di 2 pepi", "description": "pepper fillet", "price": 1000 },
      { "name": "Filleto al gorgonzola", "description": "Fillet with gorgonzola cheese", "price": 1000 },
      { "name": "Ossobuco con riso o pure", "description": "Meat ossobuco with rice or mashed potatoes", "price": 900 },
      { "name": "Spezzatino di manzo e verdure", "description": "Beef and vegetable stew", "price": 700 },
      { "name": "Stufato di pollo", "description": "Chicken stew", "price": 600 },
      { "name": "Pollo alla diavola (Oven)", "description": "Oven roasted chicken with vegetables", "price": 700 }
    ]
  },
  {
    "category": "SIDE DISHES",
    "description": "Perfect accompaniments",
    "products": [
      { "name": "insalata mista o di pomodoro", "description": "Mix or tomato salad", "price": 300 },
      { "name": "Patatine FRITE", "description": "French Fries", "price": 250 },
      { "name": "Spinaci o altre verdure", "description": "Spinach or other leafy vegetables", "price": 200 },
      { "name": "Pure di Patate", "description": "Mashed Potatoes", "price": 250 },
      { "name": "Verdure Bollite", "description": "Boiled vegetable", "price": 250 },
      { "name": "Verdure alla Griglia", "description": "Grilled vegetable", "price": 300 }
    ]
  },
  {
    "category": "SPECIAL BURGER",
    "description": "Handcrafted Burgers",
    "products": [
      { "name": "Cheese Burger", "description": "Juicy grilled beef patty topped with melted cheese, crisp lettuce, tomato, onion and our signature sauce served on a roasted bun", "price": 600 },
      { "name": "Cheese Chill burger", "description": "Grilled beef patty topped with spicy chilly sauce, melted cheddar, red onion, crisp lettuce", "price": 600 },
      { "name": "Becon Burger", "description": "Grilled beef patty layered with crispy pancetta melted provolore cheese fresh lettuce, tomato and alroh", "price": 650 },
      { "name": "Smashed Burger", "description": "Double smashed beef patties, seared to perfection layered with melted cheese, caramelized onions, crisp lettuce", "price": 700 },
      { "name": "Veggie Burger", "description": "A hearty vegetable zucchini, carrots and chrolepeas, topped with melted provolore cheese served on a toasted bun.", "price": 500 },
      { "name": "Chicken Burger", "description": "Grilled marinated chicken breast topped with melted provolore cheese", "price": 700 },
      { "name": "Pork Burger", "description": "Hamburger di maiale", "price": 800 },
      { "name": "Stars and Garter Burger", "description": "Our famous hand made 3 patty stuffed with shredded cheese, topped with bacon, sausage, mayo, shredded lettuce and onions.", "price": 1100 }
    ]
  },
  {
    "category": "PASTAS",
    "description": "Authentic Italian Pasta",
    "products": [
      { "name": "Spaghetti tomato sauce", "description": "Fresh tomato and basil sauce finished with extra virgin olive oil and a sprinkle of parmesan", "price": 600 },
      { "name": "Spaghetti garlic, oil", "description": "Traditional napolitan pasta dish with pasta sauteed in extra virgin oil, garlic and a touch of red chilly flakes", "price": 700 },
      { "name": "Spaghetti with bacon and tomato sauce", "description": "Roman favorite meal of al dente pasta in rich tomato sauce and crispy pancetta, onions and chilly", "price": 850 },
      { "name": "Spaghetti with bolognese sauce", "description": "Tossed in slow cooked beef and tomato ragu, finished with fresh herbs and parmesan cheese", "price": 800 },
      { "name": "Spaghetti baby clams", "description": "Traditional pasta dish with tender sauteed in garlic, olive oil and white wine finished with fresh parsely , chilly", "price": 900 },
      { "name": "Pasta penne with tomato and chilli sauce", "description": "Penne pasta tossed in a bold tomato sauce with garlic, oil and fresh chilly flakes", "price": 600 },
      { "name": "Riggaton Pomodoro & Basil", "description": "Tender Rigatoni tossed in fresh tomato sauce with garlic, olive oil and basil", "price": 500 },
      { "name": "Gnocchi with four kind of cheese", "description": "Soft potato gnocchi tossed in a creamy blend of four italian cheese, rich velvety and comforting", "price": 900 },
      { "name": "Gnocchi With Gorgonzola Cheese", "description": "Gnocchi al Gorgonzola", "price": 900 },
      { "name": "Bolognese Lasagna", "description": "Lasagne Classice", "price": 800 },
      { "name": "Ravioli di Pollo", "description": "A great ravioli with chicken soup", "price": 900 },
      { "name": "Spaghetti al cortoccio", "description": "Spaghetti sea food", "price": 1300 },
      { "name": "Lasagna Verdure", "description": "Lasagna Vegetable", "price": 900 },
      { "name": "Rissotto Mare", "description": "Rice with mixed sea food", "price": 800 },
      { "name": "Risotto verdure", "description": "Rice with mixed vegetable", "price": 900 }
    ]
  },
  {
    "category": "BITTINGS",
    "description": "Traditional Focaccia & Bites",
    "products": [
      { "name": "Focaccia Bruschetta", "description": "Focaccia with tomato cubes garlic and basil", "price": 300 },
      { "name": "Focaccia semplice", "description": "Traditional with rosemary", "price": 350 },
      { "name": "Focaccia burro Fuso ed aglio", "description": "Focaccia butter and garlic", "price": 300 },
      { "name": "Focaccia Mozzarella", "description": "Focaccia with mozzarella", "price": 500 },
      { "name": "Focaccia Pesce Vela", "description": "Focaccia with Sailfish", "price": 650 }
    ]
  },
  {
    "category": "SALADS",
    "description": "Fresh and healthy salads",
    "products": [
      { "name": "House salad - Insalata della casa", "description": "Oregan greens, crumbled gorgonzola, olives, house dressing", "price": 600 },
      { "name": "Caesar Salad", "description": "Lettuce, anchovies, Parmesan", "price": 700 },
      { "name": "Caprese Salad", "description": "Cherry, Tomato, mozzarella, fresh basil, balsamic vinaigrette", "price": 700 },
      { "name": "Greek Salad - insalata greca", "description": "lettuce, feta, Olives, cucumber, red onions", "price": 600 },
      { "name": "Tuna Salad", "description": "iinsalata di tonno", "price": 800 },
      { "name": "Chicken Salad", "description": "Insalata di Pollo", "price": 700 }
    ]
  },
  {
    "category": "PANINI - SANDWICHES",
    "description": "Grilled Panini & Sandwiches",
    "products": [
      { "name": "With Ham", "description": "Prosciutti cotto", "price": 400 },
      { "name": "With Salame", "description": "Salami sandwich", "price": 500 },
      { "name": "With Pana Ham", "description": "Con Prosciutti crudo", "price": 500 },
      { "name": "Mozzarella, tomato and oregano", "description": "Mozzarella, pomodoro, origano", "price": 400 },
      { "name": "Ham and Cheese", "description": "Prosciutto cotto e formaggio", "price": 500 },
      { "name": "Grilled Cheese", "description": "Mozzarella , Butter toasted bread", "price": 550 }
    ]
  },
  {
    "category": "SOUPS",
    "description": "Warm and comforting soups",
    "products": [
      { "name": "Pumpkin Ginger Soup", "description": "Zuppa di zucca con Ginger", "price": 500 },
      { "name": "Beans and Pasta", "description": "Pasta e Vagioli", "price": 500 },
      { "name": "Sea Food Soup", "description": "Rich seafood soup", "price": 700 },
      { "name": "Bone Soup", "description": "Traditional bone soup", "price": 250 },
      { "name": "Tomato Soup", "description": "Creamy tomato soup", "price": 400 },
      { "name": "Cream of Mushroom Soup", "description": "Smooth mushroom soup", "price": 450 },
      { "name": "Octopus soup", "description": "Exotic octopus soup", "price": 450 }
    ]
  },
  {
    "category": "DOLCE - DESSERT",
    "description": "Sweet treats",
    "products": [
      { "name": "Fruit Salad", "description": "Macedonia di Frutta", "price": 300 },
      { "name": "Ice Cream", "description": "Gellato", "price": 200 },
      { "name": "Crepe Nutella | Banana / Mango", "description": "Sweet crepes", "price": 300 },
      { "name": "Cake of the Day", "description": "Freshly baked cake", "price": 200 },
      { "name": "Tiramisu", "description": "Classic Italian tiramisu", "price": 500 },
      { "name": "Cream Caramel", "description": "Smooth caramel dessert", "price": 400 },
      { "name": "Fruit Salad with Ice Cream", "description": "Refreshing fruit salad with a scoop of ice cream", "price": 500 }
    ]
  },
  {
    "category": "STARTERS",
    "description": "Begin your meal here",
    "products": [
      { "name": "Insalata Di Mare", "description": "A seafood salad consisting pf praws, squid and the fish of the day", "price": 1000 },
      { "name": "Smoked Sail Fish", "description": "Sliced smoked sailfish", "price": 500 },
      { "name": "Samosa Dolce Vita", "description": "Mozzarella and tomato samosa, deep fried to perfection and a great starter for your taste", "price": 100 },
      { "name": "Bruschetta dolce vita", "description": "2 sliced toasted bread one topped with tomato, mozzarella cheese and oregano the other one with tomato,mozarella and mushrooms.", "price": 200 },
      { "name": "Mozzarella caprese", "description": "Home made sliced mozzarella with tomatoes and basil", "price": 500 },
      { "name": "Insalata Mista", "description": "Mixed salad", "price": 400 },
      { "name": "Mozzarella Vesuviana", "description": "Sliced mozzarella cheese coated with bread crumbs and deep fried with anchovies sauce", "price": 300 },
      { "name": "Marinated sliced raw fish", "description": "Carpaccio di tonno", "price": 400 },
      { "name": "Octopus Salad", "description": "Insalata di polpo", "price": 400 },
      { "name": "Prawns cocktail", "description": "Cocktail di gamberi", "price": 400 },
      { "name": "Prawns cocktail in avocado sauce", "description": "Prawns in avocado cream", "price": 450 }
    ]
  },
  {
    "category": "BREAKFAST MENU",
    "description": "Start your day right",
    "products": [
      { "name": "Half Classic", "description": "1 egg. bacon, 1 sausage, your choice of single coffee or tea", "price": 400 },
      { "name": "Classic Breakfast", "description": "2 eggs, bacon, toast, chips, baked beans, sausage served with your choice of coffee, tea or juice", "price": 700 },
      { "name": "Omelettes", "description": "Made with 2 eggs served with toast and home fries plain spanish mushroom, basil and cheese", "price": 350 },
      { "name": "Self made Omelettes", "description": "Plain ...200 + bacon 100/-, +cheese 100 /-, + sausage 100/-, tomatoes 50/-, onions+ capsicum 50/-", "price": 200 },
      { "name": "Health kick Breakfast", "description": "Spinach, chicken breast, sweet potato", "price": 500 },
      { "name": "Macchiato Espresso", "description": "Italian espresso macchiato", "price": 150 },
      { "name": "Cappuccino", "description": "Rich cappuccino", "price": 250 },
      { "name": "Black Coffee", "description": "Strong black coffee", "price": 250 },
      { "name": "White Coffee", "description": "Coffee with milk", "price": 250 },
      { "name": "Hot Chocolate", "description": "Warm hot chocolate", "price": 250 },
      { "name": "Mixed Tea", "description": "Traditional mixed tea", "price": 200 },
      { "name": "Lemon Tea", "description": "Refreshing lemon tea", "price": 150 },
      { "name": "Coffee Latte", "description": "Smooth coffee latte", "price": 200 },
      { "name": "Swahili breakfast", "description": "Viazi kerai, bhajia, mahambri, mbaazi, samosa, tea of your choice, signature ukwaju sauce", "price": 500 },
      { "name": "American Breakfast", "description": "Steak, eggs fried, cup of coffee of your choice, roasted potatoes", "price": 850 },
      { "name": "The scrambler", "description": "3 eggs scrambled with onions, green peppers, mushrooms", "price": 350 }
    ]
  },
  {
    "category": "MAIN DISHES - FISH",
    "description": "Fresh Seafood Selections",
    "products": [
      { "name": "Filletto di red snapper grigliato", "description": "Fillet of red snapper grilled and simply seasoned", "price": 1000 },
      { "name": "Red snapper alla Diavola", "description": "Fresh red snapper grilled to perfection and served with a spicy tomato and chilly sauce with garlic, herbs and olive oil", "price": 1300 },
      { "name": "Grigliata del pescatore", "description": "Traditional italian sea food grill featuring catch of the day ( prawns, calamari, fillet) seasoned with olive oil , lemon and herbs", "price": 2000 },
      { "name": "Fritura Mista", "description": "A classic italian seafood platter of light battered and golden fried calamari, shrimps and seasonal fish crispy delicate", "price": 1000 },
      { "name": "Gamberi Burro e aglio", "description": "Succulent prawns sauted iin butter, garlic and white win, finished with fresh parsley and a hint of lemon", "price": 2000 },
      { "name": "Melanzane alla parmigiana", "description": "Alayers of tender eggplant baked in rich tomato sauce, mozzarella and parmesan cheese. Timeless italian favorite", "price": 800 },
      { "name": "Filletto di pesce alla Mugnaia", "description": "Fresh fish fillet lightly flavoured and pan seared in butter, white wine and lemon sauce", "price": 900 },
      { "name": "Filletto di pesce alle erbe", "description": "Fresh fish filled grilled with aromatic italian hearbs, olive on and lemon, light , flavoured and perfectly balanced.", "price": 800 },
      { "name": "Bistecca di Tonno", "description": "Tuna fish Steak", "price": 1000 },
      { "name": "Grigliata di Mare", "description": "Mixed grilled seafood and vegetables", "price": 3000 },
      { "name": "Calamari", "description": "Squids", "price": 800 },
      { "name": "Lobster Thermidore", "description": "Succulent lobster meat cooked in a rich musturd and white wine sauce topped with cheese and baked until golden", "price": 2500 }
    ]
  },
  {
    "category": "COCKTAILS",
    "description": "Signature Cocktails & Spirits",
    "products": [
      { "name": "Tequila Metador", "description": "Tequila, pinapple, juice, lime juice", "price": 600 },
      { "name": "Tequila East Side", "description": "Cucumber Slice, fresh meant, lime juice, simple syrup, tequila", "price": 600 },
      { "name": "Tequila Sunrise", "description": "Ice Cubes, Orange juice, Tequila", "price": 600 },
      { "name": "Manhattan", "description": "Whisky, sweet vermouth, Angostura bitter", "price": 600 },
      { "name": "Pain Killer", "description": "Dark Rum, Pineapple juice, Orange juice, Coconut Cream.", "price": 600 },
      { "name": "Rum Punch", "description": "White Rum, Dark Rum, Pinnapple juice, Orange juice, Lime Juice, Granadine", "price": 650 },
      { "name": "Blood Mary", "description": "Vodka, Lemon Juice, Tomato juice, Pepper, Tobbacco", "price": 600 },
      { "name": "Negron", "description": "Gin, Campari, Sweet Vermouth, Ice cubes", "price": 650 },
      { "name": "Classic Mojitto", "description": "Lime juice, simply syrup, white rum, fresh mint, Ice Cubes.", "price": 600 },
      { "name": "Margharitta", "description": "Tequilla, lime juice, cointreau, Ice cubes", "price": 650 },
      { "name": "Long island iced tea", "description": "Ice cubes, Vodka, White Rum, Tequila, Gin, Tripple Sec, Simple syrup, lime juice, coca cola", "price": 1000 },
      { "name": "Caiprinha", "description": "Lime Wedges, Sugar, Vodka, Ice cubes, honey", "price": 600 },
      { "name": "Dawa", "description": "Lemon wedges, sugar, vodka ice cubes, honey", "price": 600 },
      { "name": "Pinha Colada", "description": "White rum, cream coconut, pinnapple juice, ice cube", "price": 650 },
      { "name": "Campary Spiritz", "description": "Ice Cubes, orange slices, campai , prosecco, soda", "price": 650 },
      { "name": "Aperol Spiritz", "description": "Aperol, prosecco, ice cubes, orange slices, soda water", "price": 650 },
      { "name": "Sex on the Beach", "description": "Ice Cubes, Vodka, peaach, schnapps, orange juice, cranberry juice, orange slice", "price": 700 },
      { "name": "Diaquiri", "description": "White rum, Lime juice, Simply syrup, Ice cube", "price": 600 },
      { "name": "Audio Mother Fucker", "description": "Vodka, gin, white rum, tequila, sweet & sour syrup, sprite soda, bue curacao, lemon slice.", "price": 800 },
      { "name": "Cosmopolitan", "description": "Vodka, triple sec, lime juice, cranberry juice, ice cubes", "price": 650 },
      { "name": "Whisky sour", "description": "Whisky , lemon, sugar syrup.", "price": 600 },
      { "name": "Americano", "description": "Campari, Red vermouth, Soda water", "price": 600 },
      { "name": "Gin Tonic", "description": "Gin, Tonic water, lemon, ice cubes.", "price": 600 },
      { "name": "High Ball", "description": "Whisky , Soda Water", "price": 550 },
      { "name": "Blue Hawai", "description": "Rum, Vodka, Blue Curacao, Pinnapple juice, sugar Syrup, Lemon juice", "price": 600 },
      { "name": "Cuba Libre", "description": "White rum, Coke, Lemon wedges, Coca Cola", "price": 600 },
      { "name": "Blue Lagoon", "description": "Vodka, blue Curacao, 7up , lemon wedges, ice cubes", "price": 600 }
    ]
  }
]';

BEGIN
    -- 1. Disable existing products that might not be in the new menu
    -- We'll do this carefully. Instead of deleting, we deactivate them.
    UPDATE products SET is_active = false;

    -- 2. Loop through categories and products from JSON
    FOR cat_record IN SELECT (jsonb_array_elements(menu_data)) AS data
    LOOP
        -- Insert or Update Category
        INSERT INTO categories (name, slug, description, image_url)
        VALUES (
            cat_record.data->>'category',
            lower(regexp_replace(cat_record.data->>'category', '[^a-zA-Z0-9]+', '-', 'g')),
            COALESCE(cat_record.data->>'description', 'Category description'),
            '/placeholder.svg?height=400&width=600&query=' || lower(regexp_replace(cat_record.data->>'category', '[^a-zA-Z0-9]+', '+', 'g'))
        )
        ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description
        RETURNING id INTO new_cat_id;

        -- Loop through products in this category
        FOR prod_record IN SELECT (jsonb_array_elements(cat_record.data->'products')) AS data
        LOOP
            -- Check if product exists by name
            IF EXISTS (SELECT 1 FROM products WHERE name = prod_record.data->>'name') THEN
                UPDATE products SET
                    description = COALESCE(prod_record.data->>'description', ''),
                    price = (prod_record.data->>'price')::NUMERIC,
                    category_id = new_cat_id,
                    is_active = true
                WHERE name = prod_record.data->>'name';
            ELSE
                INSERT INTO products (
                    name, 
                    slug, 
                    description, 
                    price, 
                    category_id, 
                    image_url, 
                    stock, 
                    is_active, 
                    preparation_time
                )
                VALUES (
                    prod_record.data->>'name',
                    lower(regexp_replace(prod_record.data->>'name', '[^a-zA-Z0-9]+', '-', 'g')) || '-' || floor(random()*1000)::text,
                    COALESCE(prod_record.data->>'description', ''),
                    (prod_record.data->>'price')::NUMERIC,
                    new_cat_id,
                    '/placeholder.svg?height=400&width=600&query=' || lower(regexp_replace(prod_record.data->>'name', '[^a-zA-Z0-9]+', '+', 'g')),
                    100,
                    true,
                    20
                );
            END IF;
        END LOOP;
    END LOOP;

    -- 3. Final cleanup of slugs for products (optional but good for consistency)
    -- We already used a semi-random slug to avoid collisions during the migration.

    RAISE NOTICE 'Menu synchronization complete.';
END $$;
