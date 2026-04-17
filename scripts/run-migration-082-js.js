
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
const envPath = fs.existsSync(path.resolve(process.cwd(), ".env")) 
  ? path.resolve(process.cwd(), ".env")
  : path.resolve(process.cwd(), ".env.local")

if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Supabase credentials are not set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    const sql = fs.readFileSync(path.resolve(process.cwd(), "scripts/082_stock_snapshots.sql"), "utf8");
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql });
    
    if (error) {
      console.error("Migration failed:", error);
    } else {
      console.log("Stock Analysis Migration (082) applied successfully!");
    }
  } catch (err) {
    console.error("Error reading or executing migration:", err);
  }
}

runMigration();
