import postgres from "postgres";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env" });

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Missing database connection string (POSTGRES_URL_NON_POOLING or DATABASE_URL)");
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: "require",
  max: 1, // Use single connection to ensure session variables work
});

// Same list as export, order doesn't strictly matter with replica role but good to keep consistent
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

async function importDatabase() {
  const exportDir = path.join(process.cwd(), "db_export");
  if (!fs.existsSync(exportDir)) {
    console.error("Export directory \'db_export\' not found. Run export_db.ts first.");
    process.exit(1);
  }

  console.log("Starting database import...");
  console.log("WARNING: This will insert data into the configured database.");
  console.log("Make sure .env points to the NEW database.");
  
  try {
    // Disable triggers and foreign key checks for this session
    await sql`SET session_replication_role = \'replica\';`;
    console.log("Session replication role set to \'replica\' (bypassing triggers and FKs)");

    for (const table of tables) {
      const filePath = path.join(exportDir, `${table}.json`);
      if (!fs.existsSync(filePath)) {
        console.warn(`Skipping ${table}: File not found`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContent);

      if (!Array.isArray(data) || data.length === 0) {
        console.log(`Skipping ${table}: No data to import`);
        continue;
      }

      console.log(`Importing ${data.length} rows into ${table}...`);

      // Insert in chunks
      const chunkSize = 500;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        try {
          await sql`
            INSERT INTO ${sql(table)} ${sql(chunk)}
            ON CONFLICT DO NOTHING
          `;
        } catch (err) {
           console.error(`Error inserting chunk into ${table}:`, err.message);
        }
      }
      console.log(`Finished ${table}`);
    }

    // Reset replication role (optional as connection closes, but good practice)
    await sql`SET session_replication_role = \'origin\';`;
    console.log("\nImport complete!");

  } catch (error) {
    console.error("Fatal error during import:", error);
  } finally {
    await sql.end();
  }
}

importDatabase();
