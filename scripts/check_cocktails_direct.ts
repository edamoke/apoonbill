import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

async function checkProducts() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', 'cocktails')
        .single();
    
    console.log("Cocktails Category:", category);

    if (category) {
        const { data: products } = await supabase
            .from('products')
            .select('name, slug, category_id, is_active')
            .eq('category_id', category.id);
        
        console.log(`Found ${products?.length || 0} products in cocktails category:`);
        products?.forEach(p => console.log(`- ${p.name} (Active: ${p.is_active})`));
    } else {
        console.log("Category 'cocktails' not found!");
    }
}

checkProducts();
