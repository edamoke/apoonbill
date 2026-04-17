"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * IoT DEVICE MANAGEMENT
 */

export async function getIoTDevices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("iot_devices")
    .select("*")
    .order("name")
  
  if (error) throw error
  return data
}

/**
 * SYNC SERVICE
 * In a production environment, this would be a background job.
 * For this portal, we can trigger it when the manager opens the IoT dashboard.
 */
export async function syncIoTData(deviceId: string) {
  const supabase = await createClient()
  
  // 1. Get device details
  const { data: device, error: devError } = await supabase
    .from("iot_devices")
    .select("*")
    .eq("id", deviceId)
    .single()
    
  if (devError || !device.local_ip) return { success: false, message: "Device not found or no IP" }

  try {
    // 2. Fetch data from ESP32 local REST endpoint
    // Note: This requires the server running this code to have network access to the ESP32's local IP.
    const response = await fetch(`http://${device.local_ip}/data`, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new Error("ESP32 unreachable")
    
    const espData = await response.json() // { weight: 14.2, liters: 14.2, percent: 28 }
    
    // 3. Log the current state
    const { error: logError } = await supabase.from("iot_weight_logs").insert({
      device_id: device.id,
      weight_grams: espData.weight * 1000,
      liters_remaining: espData.liters,
    })

    if (logError) throw logError

    // 4. Update device status
    await supabase.from("iot_devices").update({
      status: 'online',
      last_seen_at: new Date().toISOString()
    }).eq("id", deviceId)

    return { success: true, data: espData }

  } catch (error: any) {
    await supabase.from("iot_devices").update({ status: 'offline' }).eq("id", deviceId)
    return { success: false, error: error.message }
  }
}

/**
 * VARIANCE & THEFT DETECTION
 */
export async function getInventoryVarianceReport() {
  const supabase = await createClient()
  
  // Get all inventory items linked to IoT
  const { data: items, error } = await supabase
    .from("inventory_items")
    .select(`
      id,
      name,
      current_stock,
      unit,
      iot_device_id,
      iot_devices(status, local_ip)
    `)
    .not("iot_device_id", "is", null)

  if (error) throw error

  const report = await Promise.all(items.map(async (item: any) => {
    // Get last 24h weight logs
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: logs } = await supabase
      .from("iot_weight_logs")
      .select("weight_grams, created_at")
      .eq("device_id", item.iot_device_id)
      .gte("created_at", dayAgo)
      .order("created_at", { ascending: true })

    // Calculate physical usage from weights
    let physicalUsage = 0
    if (logs && logs.length > 1) {
       physicalUsage = Number(logs[0].weight_grams) - Number(logs[logs.length-1].weight_grams)
    }

    // Get POS sales for same period
    // This is simplified; real logic would map menu items to these inventory items
    const { data: sales } = await supabase
      .from("order_items")
      .select("quantity")
      .eq("inventory_item_id", item.id) // Assuming direct link for simplicity
      .gte("created_at", dayAgo)

    const posUsage = sales?.reduce((sum, s) => sum + Number(s.quantity), 0) || 0

    return {
      name: item.name,
      physicalUsageGrams: physicalUsage,
      posUsageUnits: posUsage,
      variance: physicalUsage - (posUsage * 30), // Assume 30g per unit/tot
      status: item.iot_devices?.status
    }
  }))

  return report
}
