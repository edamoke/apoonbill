-- Migration to add cocktails products
-- Ensure "Cocktails" category exists
DO $$
DECLARE
    cocktails_id UUID;
BEGIN
    INSERT INTO public.categories (name, slug, description, is_active)
    VALUES ('Cocktails', 'cocktails', 'Our signature cocktails and refreshments', true)
    ON CONFLICT (slug) DO UPDATE SET is_active = true
    RETURNING id INTO cocktails_id;

    -- Insert products
    INSERT INTO public.products (name, description, price, category_id, is_active, slug)
    VALUES 
    ('Tequila Metador', 'Tequila, pineapple, juice, lime juice', 600, cocktails_id, true, 'tequila-metador'),
    ('Tequila East Side', 'Cucumber Slice, fresh mint, lime juice, simple syrup, tequila', 600, cocktails_id, true, 'tequila-east-side'),
    ('Tequila Sunrise', 'Ice Cubes, Orange juice, Tequila', 600, cocktails_id, true, 'tequila-sunrise'),
    ('Manhattan', 'Whisky, sweet vermouth, Angostura bitter', 600, cocktails_id, true, 'manhattan'),
    ('Pain Killer', 'Dark Rum, Pineapple juice, Orange juice, Coconut Cream', 600, cocktails_id, true, 'pain-killer'),
    ('Rum Punch', 'White Rum, Dark Rum, Pineapple juice, Orange juice, Lime Juice, Grenadine', 650, cocktails_id, true, 'rum-punch'),
    ('Blood Mary', 'Vodka, Lemon Juice, Tomato juice, Pepper, Tabasco', 600, cocktails_id, true, 'blood-mary'),
    ('Negron', 'Gin, Campari, Sweet Vermouth, Ice cubes', 650, cocktails_id, true, 'negron'),
    ('Classic Mojitto', 'Lime juice, simply syrup, white rum, fresh mint, Ice Cubes', 600, cocktails_id, true, 'classic-mojitto'),
    ('Margharitta', 'Tequilla, lime juice, cointreau, Ice cubes', 650, cocktails_id, true, 'margharitta'),
    ('Long island iced tea', 'Ice cubes, Vodka, White Rum, Tequila, Gin, Tripple Sec, Simple syrup, lime juice, coca cola', 1000, cocktails_id, true, 'long-island-iced-tea'),
    ('Caiprinha', 'Lime Wedges, Sugar, Vodka, Ice cubes, honey', 600, cocktails_id, true, 'caiprinha'),
    ('Dawa', 'Lemon wedges, sugar, vodka ice cubes, honey', 600, cocktails_id, true, 'dawa'),
    ('Pinha Colada', 'White rum, cream coconut, pineapple juice, ice cube', 650, cocktails_id, true, 'pinha-colada'),
    ('Campary Spiritz', 'Ice Cubes, orange slices, campari, prosecco, soda', 650, cocktails_id, true, 'campary-spiritz'),
    ('Aperol Spiritz', 'Aperol, prosecco, ice cubes, orange slices, soda water', 650, cocktails_id, true, 'aperol-spiritz'),
    ('Sex on the Beach', 'Ice Cubes, Vodka, peach, schnapps, orange juice, cranberry juice, orange slice', 700, cocktails_id, true, 'sex-on-the-beach'),
    ('Diaquiri', 'White rum, Lime juice, Simply syrup, Ice cube', 600, cocktails_id, true, 'diaquiri'),
    ('Audio Mother Fucker', 'Vodka, gin, white rum, tequila, sweet & sour syrup, sprite soda, blue curacao, lemon slice', 800, cocktails_id, true, 'audio-mother-fucker'),
    ('Cosmopolitan', 'Vodka, triple sec, lime juice, cranberry juice, ice cubes', 650, cocktails_id, true, 'cosmopolitan'),
    ('Whisky sour', 'Whisky, lemon, sugar syrup', 600, cocktails_id, true, 'whisky-sour'),
    ('Americano', 'Campari, Red vermouth, Soda water', 600, cocktails_id, true, 'americano'),
    ('Gin Tonic', 'Gin, Tonic water, lemon, ice cubes', 600, cocktails_id, true, 'gin-tonic'),
    ('High Ball', 'Whisky, Soda Water', 550, cocktails_id, true, 'high-ball'),
    ('Blue Hawai', 'Rum, Vodka, Blue Curacao, Pineapple juice, sugar Syrup, Lemon juice', 600, cocktails_id, true, 'blue-hawai'),
    ('Cuba Libre', 'White rum, Coke, Lemon wedges, Coca Cola', 600, cocktails_id, true, 'cuba-libre'),
    ('Blue Lagoon', 'Vodka, blue Curacao, 7up, lemon wedges, ice cubes', 600, cocktails_id, true, 'blue-lagoon')
    ON CONFLICT (slug) DO UPDATE SET 
        price = EXCLUDED.price,
        description = EXCLUDED.description,
        category_id = EXCLUDED.category_id,
        is_active = EXCLUDED.is_active;
END $$;
