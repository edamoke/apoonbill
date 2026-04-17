
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = fs.existsSync(path.resolve(process.cwd(), ".env")) 
  ? path.resolve(process.cwd(), ".env")
  : path.resolve(process.cwd(), ".env.local")

if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // 1. Schema
  const sql1 = fs.readFileSync(path.resolve(process.cwd(), "scripts/084_crm_loyalty_schema.sql"), "utf8");
  const res1 = await supabase.rpc("exec_sql", { sql_query: sql1 });
  if (res1.error) console.error("084 Error:", res1.error);
  else console.log("CRM Schema applied.");

  // 2. Trigger
  const sql2 = fs.readFileSync(path.resolve(process.cwd(), "scripts/085_loyalty_trigger.sql"), "utf8");
  const res2 = await supabase.rpc("exec_sql", { sql_query: sql2 });
  if (res2.error) console.error("085 Error:", res2.error);
  else console.log("Loyalty trigger applied.");
}

run();
