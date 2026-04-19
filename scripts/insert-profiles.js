const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Read profiles from JSON
    const profilesPath = path.join(__dirname, '../db_export/profiles.json');
    const profilesData = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));

    console.log(`Found ${profilesData.length} profiles to restore`);

    // Insert profiles in batches
    const batchSize = 10;
    let insertedCount = 0;

    for (let i = 0; i < profilesData.length; i += batchSize) {
      const batch = profilesData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(batch, { returning: 'minimal' });

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message);
        // Continue with next batch
      } else {
        insertedCount += batch.length;
        console.log(`✓ Inserted batch: ${insertedCount} / ${profilesData.length}`);
      }
    }

    console.log(`\n✓ Successfully restored ${insertedCount} profiles`);

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
