import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const migrationPath = path.join(process.cwd(), "scripts", "042_supply_chain_reporting.sql");
  const sql = fs.readFileSync(migrationPath, "utf8");

  console.log("Running migration 042...");

  const { error } = await supabase.rpc("exec_sql", { sql_query: sql });

  if (error) {
    console.error("Error running migration:", error);
    process.exit(1);
  }

  console.log("Migration 042 completed successfully!");
}

runMigration();
