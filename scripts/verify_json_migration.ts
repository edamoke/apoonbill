import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('Verifying migration...');

  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('name, slug');

  if (catError) {
    console.error('Error fetching categories:', catError);
  } else {
    console.log(`Total categories: ${categories.length}`);
    const slugs = [
      'coffee-tea', 'breakfast', 'main-dishes-fish', 'burgers', 
      'special-burger', 'main-dishes', 'side-dishes', 'pizzeria', 
      'salads', 'seafood', 'dessert', 'pasta'
    ];
    const found = categories.filter(c => slugs.includes(c.slug));
    console.log(`Found ${found.length} of ${slugs.length} expected categories.`);
    if (found.length < slugs.length) {
      const missing = slugs.filter(s => !categories.find(c => c.slug === s));
      console.log('Missing slugs:', missing);
    }
  }

  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('name, preparation_time')
    .order('created_at', { ascending: false })
    .limit(10);

  if (prodError) {
    console.error('Error fetching products:', prodError);
  } else {
    console.log('Sample products with preparation time:');
    products.forEach(p => console.log(`- ${p.name}: ${p.preparation_time} mins`));
  }
}

verifyMigration();
