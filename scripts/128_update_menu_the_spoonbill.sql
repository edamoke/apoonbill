-- Fix site_settings table schema
-- Current table uses 'id' and 'content'
-- Application expects 'key' and 'value' for some features (like Receipt Configuration)

-- 1. Check if 'key' column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'key') THEN
        ALTER TABLE public.site_settings ADD COLUMN "key" TEXT;
    END IF;
END $$;

-- 2. Check if 'value' column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'value') THEN
        ALTER TABLE public.site_settings ADD COLUMN "value" JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 3. Sync data from id/content to key/value for existing rows
UPDATE public.site_settings 
SET "key" = id, "value" = content
WHERE "key" IS NULL;

-- 4. Update the menu and site details for The Spoonbill
-- Clear existing products and categories
TRUNCATE public.products CASCADE;
TRUNCATE public.categories CASCADE;

-- Insert new categories
INSERT INTO public.categories (id, name, slug, description, is_active) VALUES
  (uuid_generate_v4(), 'Burgers', 'burgers', 'Mouth-watering fast food burgers', true),
  (uuid_generate_v4(), 'Hotdogs', 'hotdogs', 'Choma sausage special hotdogs', true),
  (uuid_generate_v4(), 'Sandwiches', 'sandwiches', 'Grilled and cold sandwiches', true),
  (uuid_generate_v4(), 'Combo Meals', 'combo-meals', 'Complete meals with fries and juice', true),
  (uuid_generate_v4(), 'Shakes', 'shakes', 'Delicious 500ml milkshakes', true),
  (uuid_generate_v4(), 'Appetizers', 'appetizers', 'Asian and continental starters', true),
  (uuid_generate_v4(), 'Main Meals', 'main-meals', 'Authentic Asian cuisine mains', true),
  (uuid_generate_v4(), 'Soups', 'soups', 'Warm and comforting soups', true),
  (uuid_generate_v4(), 'Combo Meals - Asian', 'asian-combo-meals', 'Asian cuisine combo plates', true),
  (uuid_generate_v4(), 'Noodles & Rice', 'noodles-rice', 'Stir-fried noodles and rice options', true),
  (uuid_generate_v4(), 'Fruit Salads', 'fruit-salads', 'Fresh and healthy fruit bowls', true);

-- Insert products for each category
-- BURGERS
INSERT INTO public.products (name, slug, price, category_id, description, is_active) VALUES
  ('Classic Beef Burger', 'classic-beef-burger', 400, (SELECT id FROM public.categories WHERE slug = 'burgers'), 'Juicy beef patty with fresh toppings', true),
  ('Classic Chicken Burger', 'classic-chicken-burger', 500, (SELECT id FROM public.categories WHERE slug = 'burgers'), 'Crispy chicken fillet with fresh toppings', true),
  ('Classic Cheese Burger', 'classic-cheese-burger', 500, (SELECT id FROM public.categories WHERE slug = 'burgers'), 'Beef patty topped with melted cheese', true),
  ('Cream Cheese Deluxe Burger', 'cream-cheese-deluxe', 600, (SELECT id FROM public.categories WHERE slug = 'burgers'), 'Premium burger with rich cream cheese', true),
  ('Beef & Vienna Deluxe', 'beef-vienna-deluxe', 700, (SELECT id FROM public.categories WHERE slug = 'burgers'), 'Beef patty with vienna sausage', true),
  ('Beef & Nuggets Deluxe', 'beef-nuggets-deluxe', 700, (SELECT id FROM public.categories WHERE slug = 'burgers'), 'Beef patty served with nuggets', true),
  ('Vegan Boss Supremo', 'vegan-boss-supremo', 550, (SELECT id FROM public.categories WHERE slug = 'burgers'), 'Plant-based patty with vegan toppings', true),
  ('Vegetarian Black Bean & Snow Pea Supremo', 'vegetarian-black-bean', 1000, (SELECT id FROM public.categories WHERE slug = 'burgers'), 'Healthy black bean and snow pea patty', true),
  ('Vegetarian Guacamole Supremo', 'vegetarian-guacamole', 650, (SELECT id FROM public.categories WHERE slug = 'burgers'), 'Veggie patty with fresh guacamole', true);

-- HOTDOGS
INSERT INTO public.products (name, slug, price, category_id, description, is_active) VALUES
  ('Choma Sausage - Fried Onions & Veggies', 'hotdog-fried-onions', 350, (SELECT id FROM public.categories WHERE slug = 'hotdogs'), 'Choma sausage with fried onions and sliced veggies', true),
  ('Choma Sausage - Stir Fried Veggies', 'hotdog-stir-fried', 350, (SELECT id FROM public.categories WHERE slug = 'hotdogs'), 'Choma sausage with stir fried veggies', true),
  ('Choma Sausage - Coleslaw & Avocado', 'hotdog-coleslaw-avocado', 400, (SELECT id FROM public.categories WHERE slug = 'hotdogs'), 'Choma sausage with creamy coleslaw and avocado', true);

-- COMBO MEALS (Fast Food)
INSERT INTO public.products (name, slug, price, category_id, description, is_active) VALUES
  ('Cream Cheese Deluxe Combo', 'cream-cheese-combo', 950, (SELECT id FROM public.categories WHERE slug = 'combo-meals'), 'Cream Cheese Deluxe + Fries & Fresh Juice', true),
  ('2 Piece Chicken & Fries', '2pc-chicken-fries', 600, (SELECT id FROM public.categories WHERE slug = 'combo-meals'), '2 pieces of crispy chicken with fries', true),
  ('Beef & Nuggets Deluxe Combo', 'beef-nuggets-combo', 1550, (SELECT id FROM public.categories WHERE slug = 'combo-meals'), 'Beef & Nuggets Deluxe + Fries, 2pc Chicken & Fresh Juice', true),
  ('2 Piece Chicken, Beef Burger & Fries', '2pc-chicken-beef-burger-fries', 950, (SELECT id FROM public.categories WHERE slug = 'combo-meals'), '2pc chicken, classic beef burger and fries', true),
  ('Cream Cheese Deluxe Mega Combo', 'cream-cheese-mega-combo', 1600, (SELECT id FROM public.categories WHERE slug = 'combo-meals'), 'Cream Cheese Deluxe + Fries, 2pc Chicken & Fresh Juice', true),
  ('2 Piece Chicken, Beef Burger, Cheese Burger & Fries', 'mega-meat-combo', 1400, (SELECT id FROM public.categories WHERE slug = 'combo-meals'), '2pc chicken, beef burger, cheese burger and fries', true);

-- SHAKES (500ml)
INSERT INTO public.products (name, slug, price, category_id, description, is_active) VALUES
  ('Strawberry Vanilla Beetroot Shake', 'strawberry-beetroot-shake', 500, (SELECT id FROM public.categories WHERE slug = 'shakes'), 'Fresh strawberry, vanilla and beetroot blend', true),
  ('Chocolate Vanilla Mint Choc Shake', 'chocolate-mint-shake', 500, (SELECT id FROM public.categories WHERE slug = 'shakes'), 'Rich chocolate, vanilla and mint chocolate', true),
  ('Vanilla Mango Shake', 'vanilla-mango-shake', 500, (SELECT id FROM public.categories WHERE slug = 'shakes'), 'Creamy vanilla and fresh mango', true),
  ('Coffee Vanilla Choc Shake', 'coffee-choc-shake', 500, (SELECT id FROM public.categories WHERE slug = 'shakes'), 'Energizing coffee, vanilla and chocolate', true);

-- APPETIZERS (Asian)
INSERT INTO public.products (name, slug, price, category_id, description, is_active) VALUES
  ('Spring Rolls Veg/Chicken (3 Pcs)', 'spring-rolls-3pc', 200, (SELECT id FROM public.categories WHERE slug = 'appetizers'), 'Crispy spring rolls with your choice of filling', true),
  ('Sweet Plantain Bites (12 Pcs)', 'plantain-bites-12pc', 550, (SELECT id FROM public.categories WHERE slug = 'appetizers'), 'Sweet and crispy fried plantain bites', true),
  ('Crispy Sweet & Sour Pieces - Korean (8 Pcs)', 'korean-sweet-sour-8pc', 600, (SELECT id FROM public.categories WHERE slug = 'appetizers'), 'Korean style sweet and sour crispy chicken', true),
  ('Amazing Chicken Lollipop (8 Pcs)', 'chicken-lollipop-8pc', 800, (SELECT id FROM public.categories WHERE slug = 'appetizers'), 'Flavorful chicken lollipops served with sauce', true),
  ('Samosas + Sauce (3 Pcs)', 'samosas-3pc', 200, (SELECT id FROM public.categories WHERE slug = 'appetizers'), 'Crispy samosas served with dipping sauce', true),
  ('Fish Fingers with Garlic Sauce (5 Pcs)', 'fish-fingers-5pc', 600, (SELECT id FROM public.categories WHERE slug = 'appetizers'), 'Golden fish fingers with creamy garlic sauce', true);

-- MAIN MEALS (Asian)
INSERT INTO public.products (name, slug, price, category_id, description, is_active) VALUES
  ('Full Portion Schezuan Beef', 'schezuan-beef-full', 850, (SELECT id FROM public.categories WHERE slug = 'main-meals'), 'Tender crispy beef in bold sweet & sour spicy sauce', true),
  ('Lemon Chicken', 'lemon-chicken-main', 850, (SELECT id FROM public.categories WHERE slug = 'main-meals'), 'Battered chicken breast in sweet and tangy lemon sauce', true),
  ('Nasi Goreng Ayam - Malaysia', 'nasi-goreng-ayam', 800, (SELECT id FROM public.categories WHERE slug = 'main-meals'), 'Full course meal with chicken soup, fillet, fried egg & veggies', true),
  ('Full Portion Schezuan Lamb', 'schezuan-lamb-full', 800, (SELECT id FROM public.categories WHERE slug = 'main-meals'), 'Tender lamb chunks in natural herbs and spices', true),
  ('Full Portion Chicken Cashewnut', 'chicken-cashewnut-full', 800, (SELECT id FROM public.categories WHERE slug = 'main-meals'), 'Stir-fried chicken with roasted cashewnuts in garlic sauce', true);

-- SOUPS
INSERT INTO public.products (name, slug, price, category_id, description, is_active) VALUES
  ('Mushroom Plain Soup', 'mushroom-plain-soup', 300, (SELECT id FROM public.categories WHERE slug = 'soups'), 'Creamy mushroom soup', true),
  ('Hot and Sour Veg Soup', 'hot-sour-veg-soup', 250, (SELECT id FROM public.categories WHERE slug = 'soups'), 'Spicy and tangy vegetable soup', true),
  ('Sweet Corn Veg Soup', 'sweet-corn-veg-soup', 300, (SELECT id FROM public.categories WHERE slug = 'soups'), 'Classic sweet corn soup with veggies', true),
  ('Mushroom Chicken Soup', 'mushroom-chicken-soup', 350, (SELECT id FROM public.categories WHERE slug = 'soups'), 'Creamy mushroom soup with chicken pieces', true),
  ('Wonton Veg Soup with Spinach', 'wonton-veg-soup', 400, (SELECT id FROM public.categories WHERE slug = 'soups'), 'Clear soup with wontons and fresh spinach', true),
  ('Fish N Sweet Corn Soup', 'fish-sweet-corn-soup', 400, (SELECT id FROM public.categories WHERE slug = 'soups'), 'Hearty sweet corn soup with fish', true);

-- COMBO MEALS (Asian)
INSERT INTO public.products (name, slug, price, category_id, description, is_active) VALUES
  ('Beef Cashew Nut Combo', 'beef-cashew-combo', 800, (SELECT id FROM public.categories WHERE slug = 'asian-combo-meals'), 'Beef with cashewnuts served with rice', true),
  ('Sweet and Sour Combo', 'sweet-sour-combo', 750, (SELECT id FROM public.categories WHERE slug = 'asian-combo-meals'), 'Classic sweet and sour protein with rice', true),
  ('Beef Hot Garlic Combo', 'beef-hot-garlic-combo', 800, (SELECT id FROM public.categories WHERE slug = 'asian-combo-meals'), 'Spicy hot garlic beef served with rice', true),
  ('Chicken Cashewnut Combo', 'chicken-cashew-combo', 750, (SELECT id FROM public.categories WHERE slug = 'asian-combo-meals'), 'Chicken with cashewnuts served with rice', true),
  ('Schezuan Beef Combo', 'schezuan-beef-combo', 800, (SELECT id FROM public.categories WHERE slug = 'asian-combo-meals'), 'Spicy Schezuan beef served with rice', true),
  ('Lemon Chicken Combo', 'lemon-chicken-combo', 800, (SELECT id FROM public.categories WHERE slug = 'asian-combo-meals'), 'Tangy lemon chicken served with rice', true);

-- NOODLES & RICE
INSERT INTO public.products (name, slug, price, category_id, description, is_active) VALUES
  ('Schezuan Noodles', 'schezuan-noodles', 500, (SELECT id FROM public.categories WHERE slug = 'noodles-rice'), 'Spicy Schezuan style noodles', true),
  ('Shrimp Noodles', 'shrimp-noodles', 700, (SELECT id FROM public.categories WHERE slug = 'noodles-rice'), 'Stir-fried noodles with fresh shrimp', true),
  ('Beef Noodles', 'beef-noodles', 650, (SELECT id FROM public.categories WHERE slug = 'noodles-rice'), 'Savory noodles with beef strips', true),
  ('Chicken Noodles', 'chicken-noodles', 650, (SELECT id FROM public.categories WHERE slug = 'noodles-rice'), 'Stir-fried noodles with chicken', true),
  ('Vegetable Noodles', 'veg-noodles', 500, (SELECT id FROM public.categories WHERE slug = 'noodles-rice'), 'Fresh vegetable stir-fry noodles', true),
  ('Fried Rice Veg/Chicken/Beef', 'fried-rice-variety', 650, (SELECT id FROM public.categories WHERE slug = 'noodles-rice'), 'Classic fried rice with your choice of protein', true);

-- FRUIT SALADS
INSERT INTO public.products (name, slug, price, category_id, description, is_active) VALUES
  ('Mango/Pineapple/Watermelon/Banana/Papaya Bowl', 'basic-fruit-bowl', 200, (SELECT id FROM public.categories WHERE slug = 'fruit-salads'), 'Mixed fresh fruit bowl', true),
  ('Akurwa Berry Blast Fruit Salad', 'berry-blast-salad', 450, (SELECT id FROM public.categories WHERE slug = 'fruit-salads'), 'Kiwi, strawberry, orange, mangoe, grapes', true),
  ('Akurwa Kiwi Fiesta Fruit Salad', 'kiwi-fiesta-salad', 400, (SELECT id FROM public.categories WHERE slug = 'fruit-salads'), 'Kiwi, papaya, lime, mangoe, banana', true);

-- Update Site Settings for Hero and Footer
-- Using both sets of columns for compatibility
UPDATE public.site_settings 
SET 
  content = '{
    "title": "thespoonbill",
    "subtitle": "MALINDI",
    "logoUrl": "/placeholder-logo.svg",
    "slides": [
      {
        "mainHeading": "Deliciously Fast, <br />Authentically Asian",
        "buttonText": "ORDER TO-GO",
        "backgroundImage": "/images/hero-new.png",
        "excellenceText": "HALAL Certified",
        "choiceText": "To-Go Specialists"
      }
    ]
  }'::JSONB,
  "key" = 'hero',
  "value" = '{
    "title": "thespoonbill",
    "subtitle": "MALINDI",
    "logoUrl": "/placeholder-logo.svg",
    "slides": [
      {
        "mainHeading": "Deliciously Fast, <br />Authentically Asian",
        "buttonText": "ORDER TO-GO",
        "backgroundImage": "/images/hero-new.png",
        "excellenceText": "HALAL Certified",
        "choiceText": "To-Go Specialists"
      }
    ]
  }'::JSONB
WHERE id = 'hero';

UPDATE public.site_settings 
SET 
  content = '{
    "location": {
      "title": "LOCATION",
      "lines": ["Next to ACK Church after Barbar,", "Malindi Lamu Road,", "Malindi"]
    },
    "contact": {
      "title": "CALL US",
      "phone": "0748 422 994"
    },
    "copyright": "© 2026 thespoonbill. All Rights Reserved"
  }'::JSONB,
  "key" = 'footer',
  "value" = '{
    "location": {
      "title": "LOCATION",
      "lines": ["Next to ACK Church after Barbar,", "Malindi Lamu Road,", "Malindi"]
    },
    "contact": {
      "title": "CALL US",
      "phone": "0748 422 994"
    },
    "copyright": "© 2026 thespoonbill. All Rights Reserved"
  }'::JSONB
WHERE id = 'footer';
