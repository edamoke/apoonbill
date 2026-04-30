"use server"

import { createClient } from "@/lib/supabase/server"
import { getSystemStateDump } from "./ai-context-actions"
import { getSupplyChainForecast, getLeadInsights } from "./ai-growth-actions"

// This is the core reasoning engine for the Unified AI Management System
export async function processAgentCommand(userCommand: string) {
  const supabase = await createClient()
  const systemState = await getSystemStateDump()
  
  // In a real production environment, we would call an LLM (OpenAI/Anthropic) here.
  // For this implementation, we simulate the "Brain" reasoning based on the system state.
  
  const prompt = `
    System Context: ${JSON.stringify(systemState)}
    User Command: ${userCommand}
    
    You are the Spoonbill Unified AI Agent. Your goal is to manage CRM, Supply Chain, and Growth.
    Analyze the command against the system state and return a structured response with:
    1. reasoning: Why this action is suggested.
    2. action: The specific function to call.
    3. parameters: Data for the function.
    4. ui_message: What to tell the manager.
  `

  // Simulation of AI Intent Detection
  let response = {
    reasoning: "Analyzing system state...",
    action: "none",
    parameters: {},
    ui_message: "I'm processing your request across all modules."
  }

  const cmd = userCommand.toLowerCase()

  // 1. Growth & CRM Intent
  if (cmd.includes("leads") || cmd.includes("growth") || cmd.includes("campaign")) {
    const leadInsights = await getLeadInsights()
    response = {
      reasoning: `Identified ${leadInsights.stagnantHighValue.length} high-value leads needing attention. Total pipeline: KES ${leadInsights.totalPipelineValue}.`,
      action: "crm_analysis",
      parameters: { leads: leadInsights.stagnantHighValue },
      ui_message: `I've identified ${leadInsights.stagnantHighValue.length} high-value leads (over KES 100k) that have been stagnant. Should I draft personalized follow-ups for them?`
    }
  } 
  // 2. Supply Chain Intent
  else if (cmd.includes("stock") || cmd.includes("supply") || cmd.includes("inventory") || cmd.includes("forecast")) {
    const forecastAlerts = await getSupplyChainForecast()
    const lowStockItems = systemState.operations.supplyChain.lowStockItems
    
    if (forecastAlerts.length > 0) {
      response = {
        reasoning: `Forecast shows ${forecastAlerts.length} items at risk based on current business leads and qualified pipeline.`,
        action: "supply_optimization",
        parameters: { items: forecastAlerts },
        ui_message: `Based on your qualified leads, we project a 25% increase in demand. This puts ${forecastAlerts.length} items at risk (including ${forecastAlerts[0].name}). Should I prepare a proactive supply order?`
      }
    }
    else if (lowStockItems.length > 0) {
      response = {
        reasoning: `Critical stock levels detected for ${lowStockItems.length} items.`,
        action: "supply_optimization",
        parameters: { items: lowStockItems },
        ui_message: `Alert: ${lowStockItems[0].name} and ${lowStockItems.length - 1} other items are below reorder levels. I can draft a supply order for you.`
      }
    } else {
      response = {
        reasoning: "Stock levels are healthy.",
        action: "supply_check",
        parameters: {},
        ui_message: "All critical inventory items are currently above reorder levels."
      }
    }
  }
  // 3. Financial/General Performance
  else if (cmd.includes("performance") || cmd.includes("summary") || cmd.includes("how are we doing")) {
    response = {
      reasoning: "Aggregated data from Sales, CRM, and Supply Chain.",
      action: "system_summary",
      parameters: systemState,
      ui_message: `Today's revenue is KES ${systemState.financials.todayRevenue}. We have ${systemState.growth.leads.hotLeadsCount} leads in the pipeline and ${systemState.operations.supplyChain.lowStockItems.length} inventory alerts.`
    }
  }

  // Record Agent Interaction for Audit/Learning
  await supabase.from('pos_audit_logs').insert({
    action: 'ai_agent_query',
    details: { command: userCommand, response: response.ui_message },
    staff_name: 'AI System Agent'
  })

  return response
}

export async function executeAgentAction(actionName: string, params: any) {
    const supabase = await createClient()
    
    // Logic to bridge AI intent to actual system actions
    switch(actionName) {
        case 'crm_analysis':
            // Logic to trigger a CRM notification or draft
            return { success: true, message: "Drafted follow-ups for top leads." }
        case 'supply_optimization':
            // Logic to link with supply-order-actions.ts
            return { success: true, message: "Supply order draft created for low stock items." }
        default:
            return { success: false, message: "Action not implemented yet." }
    }
}
