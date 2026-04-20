import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const tables = [
  "profiles",
  "categories",
  "products",
  "orders",
  "order_items",
  "venue_bookings",
  "notifications",
  "wishlists",
  "product_ratings",
  "order_status_history",
  "menu_categories",
  "menu_items",
  "site_settings",
  "events",
  "accounting_ledger",
  "captain_orders",
  "chart_of_accounts",
  "employee_daily_reports",
  "general_ledger",
  "hrm_attendance",
  "hrm_departments",
  "hrm_leaves",
  "hrm_nhif_rates",
  "hrm_paye_brackets",
  "hrm_payroll",
  "hrm_payroll_items",
  "hrm_staff_details",
  "hrm_statutory_rates",
  "inventory_alerts",
  "inventory_items",
  "inventory_transactions",
  "iot_devices",
  "iot_weight_logs",
  "kra_etims_config",
  "kra_etims_logs",
  "ledger_entries",
  "loyalty_rewards",
  "loyalty_transactions",
  "modifier_groups",
  "modifiers",
  "outlets",
  "pos_audit_logs",
  "pos_sessions",
  "pos_shifts",
  "pos_tables",
  "pour_incidents",
  "product_discounts",
  "product_modifier_groups",
  "production_logs",
  "recipes",
  "staff_shifts",
  "stock_snapshot_items",
  "stock_snapshots",
  "supplier_price_history",
  "suppliers",
  "supply_order_items",
  "supply_orders",
  "utility_usage",
  "wastage_logs",
];

async function exportDatabase() {
  const exportDir = path.join(process.cwd(), "db_export");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  console.log(`Starting database export to ${exportDir}...`);

  for (const table of tables) {
    console.log(`Exporting table: ${table}...`);

    // Fetch in chunks to avoid limits
    let allData = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error(`Error exporting ${table}:`, error.message);
        break; // Skip to next table
      }

      if (data) {
        allData = [...allData, ...data];
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }

    const filePath = path.join(exportDir, `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));
    console.log(`Successfully exported ${allData.length} rows to ${table}.json`);
  }

  console.log("\nExport complete! All files are in the \'db_export\' directory.");
}

exportDatabase();
