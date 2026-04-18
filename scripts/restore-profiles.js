const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreProfiles() {
  try {
    // Read profiles.json
    const profilesPath = path.join(__dirname, '../db_export/profiles.json');
    const profilesData = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));

    console.log(`Found ${profilesData.length} profiles to restore`);

    if (profilesData.length === 0) {
      console.log('No profiles to restore');
      return;
    }

    // Note: profiles table should have been created by migration scripts
    console.log('Proceeding with profile data insertion...');

    // Insert profiles in batches
    const batchSize = 10;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < profilesData.length; i += batchSize) {
      const batch = profilesData.slice(i, i + batchSize);

      try {
        const { error } = await supabase
          .from('profiles')
          .upsert(batch, { onConflict: 'id' });

        if (error) {
          console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
          failCount += batch.length;
        } else {
          console.log(`✓ Batch ${Math.floor(i / batchSize) + 1} inserted: ${batch.length} profiles`);
          successCount += batch.length;
        }
      } catch (err) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} exception:`, err.message);
        failCount += batch.length;
      }
    }

    console.log(`\n✓ Profile restoration complete!`);
    console.log(`  - Successfully restored: ${successCount} profiles`);
    console.log(`  - Failed: ${failCount} profiles`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

restoreProfiles();
