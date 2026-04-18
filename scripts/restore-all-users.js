import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const usersData = [
  {
    id: "d2713215-0c73-4e25-a6d8-9bc52ec28454",
    email: "edamoke@gmail.com",
    full_name: "Eddy admin",
    is_admin: true,
    role: "admin",
    is_chef: false,
    is_rider: false,
    is_accountant: false,
  },
  {
    id: "0c3f90da-e0bb-4374-92ab-6744e34b450f",
    email: "macpczone@gmail.com",
    full_name: "mac",
    is_admin: false,
    role: "accountant",
    is_chef: false,
    is_rider: false,
    is_accountant: true,
  },
  {
    id: "f0806913-5b2e-453e-a429-a6e2fab2d995",
    email: "admin@testuser.com",
    full_name: "admin",
    is_admin: false,
    role: "user",
    is_chef: false,
    is_rider: false,
    is_accountant: false,
  },
  {
    id: "999a2061-1b06-400f-a3f1-d6e4ad7618fa",
    email: "joshualakta@gmail.com",
    full_name: "Joshua",
    is_admin: false,
    role: "user",
    is_chef: false,
    is_rider: false,
    is_accountant: false,
  },
  {
    id: "0b71abb9-3ab1-426d-9703-6459dc35cfff",
    email: "akurwaokore@gmail.com",
    full_name: "texter",
    is_admin: false,
    role: "chef",
    is_chef: true,
    is_rider: false,
    is_accountant: false,
  },
  {
    id: "6235b14d-1e70-43c1-b5e8-9aefd49c4481",
    email: "eamy16@hotmail.com",
    full_name: "peter",
    is_admin: false,
    role: "user",
    is_chef: false,
    is_rider: false,
    is_accountant: false,
  },
  {
    id: "9e06ba85-fd3f-49fd-9539-0f2d0696006e",
    email: "kenan@popnetwork.africa",
    full_name: "rider",
    is_admin: false,
    role: "rider",
    is_chef: false,
    is_rider: true,
    is_accountant: false,
  },
];

async function restoreUsers() {
  try {
    console.log('Starting user restoration...');

    for (const user of usersData) {
      try {
        // Insert user profile
        const { error } = await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              is_admin: user.is_admin,
              role: user.role,
              is_chef: user.is_chef,
              is_rider: user.is_rider,
              is_accountant: user.is_accountant,
              email_confirmed: true,
            },
            { onConflict: 'id' }
          );

        if (error) {
          console.error(`Error restoring user ${user.email}:`, error);
        } else {
          console.log(`✓ Restored user: ${user.email} (${user.role})`);
        }
      } catch (err) {
        console.error(`Failed to restore user ${user.email}:`, err);
      }
    }

    console.log('\n✓ User restoration completed!');
    console.log(`\nRestored ${usersData.length} users:`);
    usersData.forEach((u) => {
      console.log(`  - ${u.email} (${u.role})`);
    });

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

restoreUsers();
