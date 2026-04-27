import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING, {
  ssl: 'require',
});

async function exportProducts() {
  try {
    const products = await sql`
      SELECT p.id, p.name, p.price, c.name as category_name 
      FROM public.products p
      LEFT JOIN public.categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    console.log(JSON.stringify(products, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await sql.end();
  }
}

exportProducts();
