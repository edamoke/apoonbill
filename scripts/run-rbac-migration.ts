
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function runRbacMigration() {
  const { default: postgres } = await import('postgres');
  
  if (!process.env.POSTGRES_URL_NON_POOLING) {
      console.error('Missing POSTGRES_URL_NON_POOLING');
      process.exit(1);
  }

  const sql = postgres(process.env.POSTGRES_URL_NON_POOLING, { ssl: 'require' });

  const migrationPath = path.join(process.cwd(), 'scripts', '122_rbac_system.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  try {
    console.log('Running RBAC migration...');
    await sql.unsafe(migrationSql);
    console.log('RBAC Migration completed successfully.');
    
    const modules = await sql`SELECT slug, name FROM public.app_modules`;
    console.log('Available Modules:');
    console.table(modules);

    const roles = await sql`SELECT name FROM public.custom_roles`;
    console.log('Available Roles:');
    console.table(roles);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

runRbacMigration();
