-- Migration to add Cocktails category and products

-- 1. Ensure Cocktails Category exists
INSERT INTO public.categories (name, description, slug)
VALUES ('Cocktails', 'Crafted cocktails and mixed drinks', 'cocktails')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. Add Products
-- Prices and descriptions as requested
INSERT INTO public.products (name, description, price, category_id, image_url, is_available)
VALUES 
('Tequila Metador', 'Tequila, pineapple, juice, lime juice', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/matador.jpg', true),
('Tequila East Side', 'Cucumber Slice, fresh mint, lime juice, simple syrup, tequila', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/eastside.jpg', true),
('Tequila Sunrise', 'Ice Cubes, Orange juice, Tequila', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/sunrise.jpg', true),
('Manhattan', 'Whisky, sweet vermouth, Angostura bitter', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/manhattan.jpg', true),
('Pain Killer', 'Dark Rum, Pineapple juice, Orange juice, Coconut Cream', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/painkiller.jpg', true),
('Rum Punch', 'White Rum, Dark Rum, Pineapple juice, Orange juice, Lime Juice, Grenadine', 650, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/rumpunch.jpg', true),
('Bloody Mary', 'Vodka, Lemon Juice, Tomato juice, Pepper, Tabasco', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/bloodymary.jpg', true),
('Negroni', 'Gin, Campari, Sweet Vermouth, Ice cubes', 650, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/negroni.jpg', true),
('Classic Mojito', 'Lime juice, simple syrup, white rum, fresh mint, Ice Cubes', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/mojito.jpg', true),
('Margarita', 'Tequila, lime juice, cointreau, Ice cubes', 650, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/margarita.jpg', true),
('Long Island Iced Tea', 'Ice cubes, Vodka, White Rum, Tequila, Gin, Triple Sec, Simple syrup, lime juice, coca cola', 1000, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/liit.jpg', true),
('Caipirinha', 'Lime Wedges, Sugar, Vodka, Ice cubes, honey', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/caipirinha.jpg', true),
('Dawa', 'Lemon wedges, sugar, vodka ice cubes, honey', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/dawa.jpg', true),
('Pina Colada', 'White rum, cream coconut, pineapple juice, ice cube', 650, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/pinacolada.jpg', true),
('Campari Spritz', 'Ice Cubes, orange slices, campari, prosecco, soda', 650, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/camparispritz.jpg', true),
('Aperol Spritz', 'Aperol, prosecco, ice cubes, orange slices, soda water', 650, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/aperolspritz.jpg', true),
('Sex on the Beach', 'Ice Cubes, Vodka, peach, schnapps, orange juice, cranberry juice, orange slice', 700, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/sotb.jpg', true),
('Daiquiri', 'White rum, Lime juice, Simple syrup, Ice cube', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/daiquiri.jpg', true),
('Adios Mother Fucker', 'Vodka, gin, white rum, tequila, sweet & sour syrup, sprite soda, blue curacao, lemon slice', 800, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/amf.jpg', true),
('Cosmopolitan', 'Vodka, triple sec, lime juice, cranberry juice, ice cubes', 650, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/cosmo.jpg', true),
('Whisky Sour', 'Whisky, lemon, sugar syrup', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/whiskysour.jpg', true),
('Americano', 'Campari, Red vermouth, Soda water', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/americano.jpg', true),
('Gin Tonic', 'Gin, Tonic water, lemon, ice cubes', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/gintonic.jpg', true),
('High Ball', 'Whisky, Soda Water', 550, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/highball.jpg', true),
('Blue Hawaii', 'Rum, Vodka, Blue Curacao, Pineapple juice, sugar Syrup, Lemon juice', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/bluehawaii.jpg', true),
('Cuba Libre', 'White rum, Coke, Lemon wedges, Coca Cola', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/cubalibre.jpg', true),
('Blue Lagoon', 'Vodka, blue Curacao, 7up, lemon wedges, ice cubes', 600, (SELECT id FROM public.categories WHERE slug = 'cocktails'), '/images/cocktails/bluelagoon.jpg', true)
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description, 
    price = EXCLUDED.price, 
    category_id = EXCLUDED.category_id,
    image_url = EXCLUDED.image_url;
