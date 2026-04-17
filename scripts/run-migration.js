import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const migrationPath = process.argv[2];
  if (!migrationPath) {
    console.error("Please provide a migration file path");
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, "utf8");

  console.log(`Running migration from ${migrationPath}...`);
  
  const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql });

  if (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  console.log("Migration successful!");
}

runMigration();
