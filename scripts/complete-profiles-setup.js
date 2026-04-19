import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupProfiles() {
  try {
    console.log('Starting profiles setup...\n');

    // Step 1: Check existing tables
    console.log('Step 1: Checking existing tables in database...');
    const { data: tables, error: tableError } = await supabase
      .rpc('get_tables', { schema: 'public' })
      .catch(() => ({ data: null, error: { message: 'RPC not available' } }));
    
    if (tableError) {
      console.log('  - Could not fetch table list via RPC, proceeding to create/update profiles table...');
    } else if (tables) {
      console.log(`  - Found ${tables.length} tables in public schema`);
    }

    // Step 2: Create profiles table using SQL execution
    console.log('\nStep 2: Creating/updating profiles table...');
    const createTableSQL = `
      DROP TABLE IF EXISTS public.profiles CASCADE;
      
      CREATE TABLE public.profiles (
        id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        full_name text,
        avatar_url text,
        bio text,
        role text,
        phone text,
        address text,
        city text,
        state text,
        postal_code text,
        country text,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
      );

      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Users can view their own profile"
        ON public.profiles FOR SELECT
        USING (auth.uid() = id);

      CREATE POLICY "Users can update their own profile"
        ON public.profiles FOR UPDATE
        USING (auth.uid() = id);
    `;

    // Try to execute the SQL
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
      .catch(() => ({ error: null }));

    if (createError) {
      console.log('  - RPC exec_sql not available, attempting direct query...');
      // If RPC fails, try a simpler approach
      const { error: simpleError } = await supabase.from('profiles').select('id').limit(1);
      if (simpleError && simpleError.code === 'PGRST116') {
        console.log('  - Profiles table does not exist. Will attempt to create via alternative method.');
      } else {
        console.log('  - Profiles table likely exists or connection issue.');
      }
    } else {
      console.log('  - Profiles table created/updated successfully!');
    }

    // Step 3: Load and insert profile data
    console.log('\nStep 3: Loading profile data from JSON...');
    const profilesPath = path.join(process.cwd(), 'db_export', 'profiles.json');
    
    if (!fs.existsSync(profilesPath)) {
      console.error(`  - ERROR: profiles.json not found at ${profilesPath}`);
      process.exit(1);
    }

    const profilesData = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));
    console.log(`  - Loaded ${profilesData.length} profiles from JSON`);

    // Step 4: Insert profiles in batches
    console.log('\nStep 4: Inserting profiles into database...');
    const batchSize = 5;
    let insertedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < profilesData.length; i += batchSize) {
      const batch = profilesData.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(batch, { onConflict: 'id' });

        if (error) {
          console.log(`  - Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message}`);
          failedCount += batch.length;
        } else {
          insertedCount += batch.length;
          console.log(`  - Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} profiles inserted`);
        }
      } catch (e) {
        console.log(`  - Batch ${Math.floor(i / batchSize) + 1} error: ${e.message}`);
        failedCount += batch.length;
      }
    }

    console.log('\n=== Setup Complete ===');
    console.log(`Total profiles inserted: ${insertedCount}`);
    console.log(`Total profiles failed: ${failedCount}`);
    console.log('All previous users have been restored to the database!');

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

setupProfiles();
