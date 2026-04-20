import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false, // Do not persist session for server-side operations
  },
});

async function seedProfiles() {
  try {
    // Create a test user if they don't exist (assuming email/password auth)
    const { data: authSignUpData, error: authSignUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User',
          role: 'admin',
        },
      },
    });

    if (authSignUpError) {
      if (authSignUpError.message.includes('duplicate key value violates unique constraint "users_email_key"')) {
        console.log('Test user already exists in auth.users.');
      } else {
        console.error('Error signing up test user:', authSignUpError.message);
        return;
      }
    }

    let userId = authSignUpData?.user?.id;

    if (!userId) {
      // If user already exists, retrieve their ID
      const { data: users, error: fetchUserError } = await supabase.from('auth.users').select('id').eq('email', 'test@example.com');
      if (fetchUserError || !users || users.length === 0) {
        console.error('Error fetching existing user:', fetchUserError?.message || 'User not found');
        return;
      }
      userId = users[0].id;
      console.log('Fetched existing user ID:', userId);
    }

    // Insert or update profile for the test user
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          full_name: 'Test User',
          role: 'admin',
          avatar_url: 'https://placehold.co/400/png',
          email: 'test@example.com',
        },
        { onConflict: 'id' }
      )
      .select();

    if (profileError) {
      console.error('Error upserting profile:', profileError.message);
    } else {
      console.log('Profile seeded successfully:', profileData);
    }
  } catch (error: any) {
    console.error('An unexpected error occurred:', error.message);
  }
}

seedProfiles();