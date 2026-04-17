const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: ".env" })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function checkOrdersTable() {
  try {
    const { data: columns, error } = await supabase.rpc('inspect_table_columns', { table_name: 'orders' })
    
    if (error) {
      // Fallback: try manual query via exec_sql if available
      const { data, error: sqlError } = await supabase
        .from('orders')
        .select('*')
        .limit(1)
      
      if (sqlError) throw sqlError
      console.log("Sample order record keys:")
      console.log(Object.keys(data[0] || {}))
      return
    }

    console.log("Columns in 'orders' table:")
    console.table(columns)

  } catch (error) {
    console.error("Error:", error.message)
  }
}

checkOrdersTable()
