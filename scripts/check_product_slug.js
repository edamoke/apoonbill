import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProduct() {
  const slug = '2-piece-chicken-beef-burger-&-fries';
  const namePattern = '2 Piece Chicken, Beef Burger & Fries';
  
  console.log(`Searching for product with name like "${namePattern}"...`);
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name', `%${namePattern}%`);

  if (error) {
    console.error('Error searching product:', error);
    return;
  }

  if (products.length === 0) {
    console.log('No products found with that name.');
    return;
  }

  products.forEach(p => {
    console.log('--- PRODUCT FOUND ---');
    console.log(`ID: ${p.id}`);
    console.log(`Name: ${p.name}`);
    console.log(`Slug: ${p.slug}`);
    console.log(`Price: ${p.price}`);
    console.log(`Image URL: ${p.image_url}`);
    console.log('---------------------');
  });
}

checkProduct();
