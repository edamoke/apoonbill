import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function runMenuMigration() {
  const { default: postgres } = await import('postgres');
  
  if (!process.env.POSTGRES_URL_NON_POOLING) {
      console.error('Missing POSTGRES_URL_NON_POOLING');
      process.exit(1);
  }

  const sql = postgres(process.env.POSTGRES_URL_NON_POOLING, { ssl: 'require' });

  const migrationPath = path.join(process.cwd(), 'scripts', '126_update_menu_from_pdf.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  const cleanupPath = path.join(process.cwd(), 'scripts', '127_cleanup_old_categories.sql');
  const cleanupSql = fs.readFileSync(cleanupPath, 'utf8');

  try {
    console.log('Running Menu synchronization migration...');
    await sql.unsafe(migrationSql);
    console.log('Running Category cleanup...');
    await sql.unsafe(cleanupSql);
    console.log('Menu synchronization and cleanup completed successfully.');
    
    const categories = await sql`SELECT name, slug FROM public.categories`;
    console.log('Categories:');
    console.table(categories);

    const productsCount = await sql`SELECT count(*) FROM public.products WHERE is_active = true`;
    console.log('Active Products Count:', productsCount[0].count);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

runMenuMigration();
