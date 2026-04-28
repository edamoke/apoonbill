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

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with a single hyphen
    .trim();
}

async function fixSlugs() {
  console.log('Fetching all products...');
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug');

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Checking ${products.length} products for invalid slugs...`);
  
  for (const product of products) {
    const expectedSlug = generateSlug(product.name);
    
    // Check if current slug is invalid (contains characters other than lowercase letters, numbers, and hyphens)
    const isInvalid = /[^a-z0-9-]/.test(product.slug) || product.slug !== expectedSlug;

    if (isInvalid) {
      console.log(`Fixing slug for "${product.name}":`);
      console.log(`  Old: ${product.slug}`);
      console.log(`  New: ${expectedSlug}`);
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ slug: expectedSlug })
        .eq('id', product.id);

      if (updateError) {
        console.error(`  Error updating slug for ${product.id}:`, updateError);
      } else {
        console.log('  Successfully updated.');
      }
    }
  }
  
  console.log('Finished checking slugs.');
}

fixSlugs();
