"use server"

import { transmitToEtims as transmitToEtimsInternal } from "@/lib/kra/etims-service"

export async function transmitToEtimsAction(orderId: string) {
  return await transmitToEtimsInternal(orderId)
}
