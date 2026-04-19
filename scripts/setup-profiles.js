import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupProfiles() {
  try {
    // Read profiles data from JSON file
    const profilesPath = path.join(process.cwd(), 'db_export', 'profiles.json');
    const profilesData = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));

    console.log(`Found ${profilesData.length} profiles to restore`);

    // Create profiles table using SQL
    console.log('Creating profiles table...');
    try {
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.profiles (
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

          CREATE POLICY IF NOT EXISTS "Users can view their own profile"
            ON public.profiles FOR SELECT
            USING (auth.uid() = id);

          CREATE POLICY IF NOT EXISTS "Users can update their own profile"
            ON public.profiles FOR UPDATE
            USING (auth.uid() = id);
        `
      });

      if (createError) {
        console.error('Error creating profiles table:', createError);
      } else {
        console.log('Profiles table created successfully');
      }
    } catch (tableCreateError) {
      console.log('RPC method not available, proceeding with direct insert...');
    }

    // Insert profiles data
    console.log('Inserting profile data...');
    
    const batchSize = 50;
    for (let i = 0; i < profilesData.length; i += batchSize) {
      const batch = profilesData.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert(batch, { onConflict: 'id' });
      
      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError.message);
      } else {
        console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} profiles)`);
      }
    }

    console.log('Profile restoration complete!');

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

setupProfiles();
