import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

async function runMigration() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log("Ensuring Cocktails category exists...");
    const { data: category, error: catError } = await supabase
        .from('categories')
        .upsert({ 
            name: 'Cocktails', 
            slug: 'cocktails', 
            description: 'Our signature cocktails and refreshments'
        }, { onConflict: 'slug' })
        .select()
        .single();
    
    if (catError) {
        console.error("Error with category:", catError);
        return;
    }

    const cocktails_id = category.id;
    console.log("Cocktails Category ID:", cocktails_id);

    const products = [
        { name: 'Tequila Metador', description: 'Tequila, pineapple, juice, lime juice', price: 600, category_id: cocktails_id, is_active: true, slug: 'tequila-metador' },
        { name: 'Tequila East Side', description: 'Cucumber Slice, fresh mint, lime juice, simple syrup, tequila', price: 600, category_id: cocktails_id, is_active: true, slug: 'tequila-east-side' },
        { name: 'Tequila Sunrise', description: 'Ice Cubes, Orange juice, Tequila', price: 600, category_id: cocktails_id, is_active: true, slug: 'tequila-sunrise' },
        { name: 'Manhattan', description: 'Whisky, sweet vermouth, Angostura bitter', price: 600, category_id: cocktails_id, is_active: true, slug: 'manhattan' },
        { name: 'Pain Killer', description: 'Dark Rum, Pineapple juice, Orange juice, Coconut Cream', price: 600, category_id: cocktails_id, is_active: true, slug: 'pain-killer' },
        { name: 'Rum Punch', description: 'White Rum, Dark Rum, Pineapple juice, Orange juice, Lime Juice, Grenadine', price: 650, category_id: cocktails_id, is_active: true, slug: 'rum-punch' },
        { name: 'Blood Mary', description: 'Vodka, Lemon Juice, Tomato juice, Pepper, Tabasco', price: 600, category_id: cocktails_id, is_active: true, slug: 'blood-mary' },
        { name: 'Negron', description: 'Gin, Campari, Sweet Vermouth, Ice cubes', price: 650, category_id: cocktails_id, is_active: true, slug: 'negron' },
        { name: 'Classic Mojitto', description: 'Lime juice, simply syrup, white rum, fresh mint, Ice Cubes', price: 600, category_id: cocktails_id, is_active: true, slug: 'classic-mojitto' },
        { name: 'Margharitta', description: 'Tequilla, lime juice, cointreau, Ice cubes', price: 650, category_id: cocktails_id, is_active: true, slug: 'margharitta' },
        { name: 'Long island iced tea', description: 'Ice cubes, Vodka, White Rum, Tequila, Gin, Tripple Sec, Simple syrup, lime juice, coca cola', price: 1000, category_id: cocktails_id, is_active: true, slug: 'long-island-iced-tea' },
        { name: 'Caiprinha', description: 'Lime Wedges, Sugar, Vodka, Ice cubes, honey', price: 600, category_id: cocktails_id, is_active: true, slug: 'caiprinha' },
        { name: 'Dawa', description: 'Lemon wedges, sugar, vodka ice cubes, honey', price: 600, category_id: cocktails_id, is_active: true, slug: 'dawa' },
        { name: 'Pinha Colada', description: 'White rum, cream coconut, pineapple juice, ice cube', price: 650, category_id: cocktails_id, is_active: true, slug: 'pinha-colada' },
        { name: 'Campary Spiritz', description: 'Ice Cubes, orange slices, campari, prosecco, soda', price: 650, category_id: cocktails_id, is_active: true, slug: 'campary-spiritz' },
        { name: 'Aperol Spiritz', description: 'Aperol, prosecco, ice cubes, orange slices, soda water', price: 650, category_id: cocktails_id, is_active: true, slug: 'aperol-spiritz' },
        { name: 'Sex on the Beach', description: 'Ice Cubes, Vodka, peach, schnapps, orange juice, cranberry juice, orange slice', price: 700, category_id: cocktails_id, is_active: true, slug: 'sex-on-the-beach' },
        { name: 'Diaquiri', description: 'White rum, Lime juice, Simply syrup, Ice cube', price: 600, category_id: cocktails_id, is_active: true, slug: 'diaquiri' },
        { name: 'Audio Mother Fucker', description: 'Vodka, gin, white rum, tequila, sweet & sour syrup, sprite soda, bue curacao, lemon slice', price: 800, category_id: cocktails_id, is_active: true, slug: 'audio-mother-fucker' },
        { name: 'Cosmopolitan', description: 'Vodka, triple sec, lime juice, cranberry juice, ice cubes', price: 650, category_id: cocktails_id, is_active: true, slug: 'cosmopolitan' },
        { name: 'Whisky sour', description: 'Whisky, lemon, sugar syrup', price: 600, category_id: cocktails_id, is_active: true, slug: 'whisky-sour' },
        { name: 'Americano', description: 'Campari, Red vermouth, Soda water', price: 600, category_id: cocktails_id, is_active: true, slug: 'americano' },
        { name: 'Gin Tonic', description: 'Gin, Tonic water, lemon, ice cubes', price: 600, category_id: cocktails_id, is_active: true, slug: 'gin-tonic' },
        { name: 'High Ball', description: 'Whisky, Soda Water', price: 550, category_id: cocktails_id, is_active: true, slug: 'high-ball' },
        { name: 'Blue Hawai', description: 'Rum, Vodka, Blue Curacao, Pineapple juice, sugar Syrup, Lemon juice', price: 600, category_id: cocktails_id, is_active: true, slug: 'blue-hawai' },
        { name: 'Cuba Libre', description: 'White rum, Coke, Lemon wedges, Coca Cola', price: 600, category_id: cocktails_id, is_active: true, slug: 'cuba-libre' },
        { name: 'Blue Lagoon', description: 'Vodka, blue Curacao, 7up, lemon wedges, ice cubes', price: 600, category_id: cocktails_id, is_active: true, slug: 'blue-lagoon' }
    ];

    console.log(`Inserting ${products.length} cocktails...`);
    const { error: prodError } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'slug' });
    
    if (prodError) {
        console.error("Error inserting products:", prodError);
    } else {
        console.log("Successfully added all cocktails!");
    }

    // Refresh the materialized view or schema cache if needed?
    // In Supabase, standard tables should reflect immediately.
    // Let's verify the count again.
    const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cocktails_id);
    
    console.log(`Verification: Total products in Cocktails category: ${count}`);
}

runMigration();
