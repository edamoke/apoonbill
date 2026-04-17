-- Migration: Add Complete Cocktail Menu to Products
-- Category: Cocktails

-- 1. Ensure "Cocktails" category exists in menu_categories
INSERT INTO public.menu_categories (name, description, slug)
VALUES ('Cocktails', 'Handcrafted cocktails and refreshments', 'cocktails')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 2. Define Cocktail Menu Items in products table
-- We use products table as it's the primary table used for ordering in this project

INSERT INTO public.products (name, description, price, category, image_url, stock_quantity, is_active)
VALUES 
    ('Tequila Metador', 'Tequila, pineapple juice, lime juice', 600, 'Cocktails', '/images/cocktails/metador.jpg', 999, true),
    ('Tequila East Side', 'Tequila, cucumber, fresh mint, lime juice, simple syrup', 600, 'Cocktails', '/images/cocktails/east-side.jpg', 999, true),
    ('Tequila Sunrise', 'Tequila, orange juice, grenadine, ice cubes', 600, 'Cocktails', '/images/cocktails/sunrise.jpg', 999, true),
    ('Manhattan', 'Whisky, sweet vermouth, Angostura bitters', 600, 'Cocktails', '/images/cocktails/manhattan.jpg', 999, true),
    ('Pain Killer', 'Dark Rum, pineapple juice, orange juice, coconut cream', 600, 'Cocktails', '/images/cocktails/pain-killer.jpg', 999, true),
    ('Rum Punch', 'White Rum, Dark Rum, pineapple juice, orange juice, lime juice, grenadine', 650, 'Cocktails', '/images/cocktails/rum-punch.jpg', 999, true),
    ('Bloody Mary', 'Vodka, lemon juice, tomato juice, pepper, tabasco', 600, 'Cocktails', '/images/cocktails/bloody-mary.jpg', 999, true),
    ('Negroni', 'Gin, Campari, Sweet Vermouth, ice cubes', 650, 'Cocktails', '/images/cocktails/negroni.jpg', 999, true),
    ('Classic Mojito', 'White Rum, lime juice, simple syrup, fresh mint, soda water', 600, 'Cocktails', '/images/cocktails/mojito.jpg', 999, true),
    ('Margarita', 'Tequila, lime juice, Cointreau/Triple Sec, ice cubes', 650, 'Cocktails', '/images/cocktails/margarita.jpg', 999, true),
    ('Long Island Iced Tea', 'Vodka, White Rum, Tequila, Gin, Triple Sec, simple syrup, lime juice, cola', 1000, 'Cocktails', '/images/cocktails/long-island.jpg', 999, true),
    ('Caipirinha', 'Vodka (or Cachaça), lime wedges, sugar, ice cubes, honey', 600, 'Cocktails', '/images/cocktails/caipirinha.jpg', 999, true),
    ('Dawa', 'Vodka, lemon wedges, sugar, ice cubes, honey', 600, 'Cocktails', '/images/cocktails/dawa.jpg', 999, true),
    ('Pina Colada', 'White Rum, cream coconut, pineapple juice, ice cubes', 650, 'Cocktails', '/images/cocktails/pina-colada.jpg', 999, true),
    ('Campari Spritz', 'Campari, prosecco, soda, orange slices, ice cubes', 650, 'Cocktails', '/images/cocktails/campari-spritz.jpg', 999, true),
    ('Aperol Spritz', 'Aperol, prosecco, soda water, orange slices, ice cubes', 650, 'Cocktails', '/images/cocktails/aperol-spritz.jpg', 999, true),
    ('Sex on the Beach', 'Vodka, peach schnapps, orange juice, cranberry juice, orange slice, ice cubes', 700, 'Cocktails', '/images/cocktails/sex-on-the-beach.jpg', 999, true),
    ('Daiquiri', 'White Rum, lime juice, simple syrup, ice cubes', 600, 'Cocktails', '/images/cocktails/daiquiri.jpg', 999, true),
    ('Adios Mother Fucker', 'Vodka, Gin, White Rum, Tequila, sweet & sour syrup, sprite, blue curacao, lemon slice', 800, 'Cocktails', '/images/cocktails/amf.jpg', 999, true),
    ('Cosmopolitan', 'Vodka, triple sec, lime juice, cranberry juice, ice cubes', 650, 'Cocktails', '/images/cocktails/cosmopolitan.jpg', 999, true),
    ('Whisky Sour', 'Whisky, lemon juice, sugar syrup', 600, 'Cocktails', '/images/cocktails/whisky-sour.jpg', 999, true),
    ('Americano', 'Campari, Red Vermouth, soda water', 600, 'Cocktails', '/images/cocktails/americano.jpg', 999, true),
    ('Gin Tonic', 'Gin, tonic water, lemon, ice cubes', 600, 'Cocktails', '/images/cocktails/gin-tonic.jpg', 999, true),
    ('High Ball', 'Whisky, soda water', 550, 'Cocktails', '/images/cocktails/highball.jpg', 999, true),
    ('Blue Hawaii', 'White Rum, Vodka, Blue Curacao, pineapple juice, sugar syrup, lemon juice', 600, 'Cocktails', '/images/cocktails/blue-hawaii.jpg', 999, true),
    ('Cuba Libre', 'White Rum, cola, lemon wedges', 600, 'Cocktails', '/images/cocktails/cuba-libre.jpg', 999, true),
    ('Blue Lagoon', 'Vodka, blue curacao, 7up, lemon wedges, ice cubes', 600, 'Cocktails', '/images/cocktails/blue-lagoon.jpg', 999, true)
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active;
