import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreUsers() {
  try {
    console.log('Starting user restoration from profiles.json...\n');

    // Read the profiles.json file
    const profilesPath = path.join(__dirname, '../db_export/profiles.json');
    const profilesData = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));

    let successCount = 0;
    let errorCount = 0;

    for (const profile of profilesData) {
      try {
        // First, create the user in Supabase Auth if not exists
        const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserById(profile.id);

        if (!existingUser && !checkError) {
          // User exists, just update the profile
          console.log(`✓ User ${profile.email} already exists in auth`);
        } else {
          // Create user with a default password
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: profile.email,
            password: 'DefaultPassword123!',
            email_confirm: true,
            user_metadata: {
              full_name: profile.full_name,
              role: profile.role,
            },
          });

          if (createError) {
            console.log(`⚠ Auth user exists or could not create: ${profile.email}`);
          } else {
            console.log(`✓ Created auth user: ${profile.email}`);
          }
        }

        // Now insert or update the profile record
        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              phone: profile.phone,
              address: profile.address,
              is_admin: profile.is_admin,
              role: profile.role,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
              avatar_url: profile.avatar_url,
              is_chef: profile.is_chef,
              is_rider: profile.is_rider,
              is_accountant: profile.is_accountant,
              email_confirmed: profile.email_confirmed,
            },
            { onConflict: 'id' }
          );

        if (insertError) {
          console.error(`✗ Error restoring profile ${profile.email}:`, insertError.message);
          errorCount++;
        } else {
          console.log(`✓ Restored profile: ${profile.email} (${profile.role})`);
          successCount++;
        }
      } catch (error) {
        console.error(`✗ Error processing user ${profile.email}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n✓ User restoration completed!`);
    console.log(`✓ Successfully restored: ${successCount} profiles`);
    if (errorCount > 0) {
      console.log(`✗ Failed to restore: ${errorCount} profiles`);
    }

    // Print summary
    console.log('\nRestored users:');
    for (const profile of profilesData) {
      console.log(`  - ${profile.email} (${profile.role})`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error during restoration:', error.message);
    process.exit(1);
  }
}

restoreUsers();
