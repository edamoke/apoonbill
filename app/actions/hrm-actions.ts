"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * KENYA STATUTORY CALCULATION LOGIC (KRA Guidelines 2024)
 */

export async function calculateStatutoryDeductions(grossSalary: number) {
  const supabase = await createClient()
  
  // 1. Fetch current rates
  const { data: rates } = await supabase.from("hrm_statutory_rates").select("*")
  const { data: payeBrackets } = await supabase.from("hrm_paye_brackets").select("*").order("lower_limit")
  const { data: nhifRates } = await supabase.from("hrm_nhif_rates").select("*").order("lower_limit")

  const getRate = (name: string) => rates?.find(r => r.name === name)?.value || 0

  // 2. NSSF Calculation (Tiered)
  const nssfRate = getRate("NSSF_RATE") / 100
  const nssfTier1Limit = getRate("NSSF_TIER_1_LIMIT")
  const nssfTier2Limit = getRate("NSSF_TIER_2_LIMIT")
  
  const nssfTier1 = Math.min(grossSalary, nssfTier1Limit) * nssfRate
  const nssfTier2 = Math.max(0, Math.min(grossSalary, nssfTier2Limit) - nssfTier1Limit) * nssfRate
  const totalNssf = nssfTier1 + nssfTier2

  // 3. NHIF Calculation (Bracket based)
  const nhif = nhifRates?.find(r => 
    grossSalary >= Number(r.lower_limit) && 
    (r.upper_limit === null || grossSalary <= Number(r.upper_limit))
  )?.amount || 0

  // 4. Housing Levy
  const housingLevyRate = getRate("HOUSING_LEVY_RATE") / 100
  const housingLevy = grossSalary * housingLevyRate

  // 5. PAYE Calculation
  // Taxable Income = Gross - NSSF
  const taxableIncome = grossSalary - totalNssf
  let payeBeforeRelief = 0
  
  payeBrackets?.forEach(bracket => {
    const lower = Number(bracket.lower_limit)
    const upper = bracket.upper_limit ? Number(bracket.upper_limit) : Infinity
    const rate = Number(bracket.rate_percentage) / 100
    
    const taxableInThisBracket = Math.max(0, Math.min(taxableIncome, upper) - lower + 1)
    if (taxableIncome >= lower) {
        payeBeforeRelief += taxableInThisBracket * rate
    }
  })

  const personalRelief = getRate("PERSONAL_RELIEF")
  const insuranceRelief = Number(nhif) * 0.15 // 15% of NHIF
  const totalRelief = personalRelief + insuranceRelief
  
  const netPaye = Math.max(0, payeBeforeRelief - totalRelief)

  const totalDeductions = totalNssf + Number(nhif) + housingLevy + netPaye
  const netSalary = grossSalary - totalDeductions

  return {
    grossSalary,
    nssf: totalNssf,
    nhif: Number(nhif),
    housingLevy,
    paye: netPaye,
    personalRelief,
    insuranceRelief,
    totalDeductions,
    netSalary
  }
}

/**
 * DEPARTMENTS
 */

export async function getDepartments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hrm_departments")
    .select(`
      *,
      profiles:manager_id (full_name)
    `)
    .order("name")
  
  if (error) throw error
  return data
}

/**
 * STAFF DETAILS
 */

export async function getStaffDetails() {
  const supabase = await createClient()
  
  const { data: profiles, error: pError } = await supabase
    .from("profiles")
    .select("id, full_name, role, email")
    .not("role", "eq", "user")

  if (pError) throw pError

  const { data: details, error: dError } = await supabase
    .from("hrm_staff_details")
    .select(`
      *,
      hrm_departments (name)
    `)
  
  if (dError) throw dError

  return profiles.map(p => {
    const d = details?.find(detail => detail.id === p.id)
    return {
      id: p.id,
      profiles: p,
      hrm_departments: d?.hrm_departments,
      department_id: d?.department_id,
      job_title: d?.job_title || p.role,
      date_joined: d?.date_joined || new Date().toISOString(),
      salary_amount: Number(d?.salary_amount || 0),
      employment_type: d?.employment_type || 'full-time',
      kra_pin: d?.kra_pin,
      nhif_number: d?.nhif_number,
      nssf_number: d?.nssf_number,
      id_number: d?.id_number
    }
  })
}

export async function updateStaffDetail(userId: string, updates: any) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("hrm_staff_details")
    .upsert({ 
        id: userId, 
        ...updates, 
        updated_at: new Date().toISOString() 
    })
  
  if (error) throw error
  revalidatePath("/admin/hrm")
  return { success: true }
}

/**
 * PAYROLL
 */

export async function generatePayroll(userId: string, month: number, year: number) {
  const supabase = await createClient()
  
  // 1. Get staff details
  const { data: staff } = await supabase
    .from("hrm_staff_details")
    .select("*")
    .eq("id", userId)
    .single()

  if (!staff) throw new Error("Staff not found")

  // 2. Calculate
  const calcs = await calculateStatutoryDeductions(Number(staff.salary_amount))

  // 3. Save Payroll Record
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const { data: payroll, error: pError } = await supabase
    .from("hrm_payroll")
    .insert({
      user_id: userId,
      pay_period_start: startDate,
      pay_period_end: endDate,
      gross_pay: calcs.grossSalary,
      deductions: calcs.totalDeductions,
      net_pay: calcs.netSalary,
      payment_status: 'pending'
    })
    .select()
    .single()

  if (pError) throw pError

  // 4. Save detailed items
  const items = [
    { payroll_id: payroll.id, item_name: 'Basic Salary', item_type: 'earnings', amount: calcs.grossSalary },
    { payroll_id: payroll.id, item_name: 'PAYE', item_type: 'deduction', amount: calcs.paye },
    { payroll_id: payroll.id, item_name: 'NHIF', item_type: 'deduction', amount: calcs.nhif },
    { payroll_id: payroll.id, item_name: 'NSSF', item_type: 'deduction', amount: calcs.nssf },
    { payroll_id: payroll.id, item_name: 'Housing Levy', item_type: 'deduction', amount: calcs.housingLevy }
  ]

  await supabase.from("hrm_payroll_items").insert(items)

  revalidatePath("/admin/hrm")
  return { success: true, data: calcs }
}

/**
 * ATTENDANCE & LEAVES (Simplified for now)
 */
export async function getAttendanceToday() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from("hrm_attendance")
    .select(`*, profiles:user_id (full_name)`)
    .gte("check_in", today)
  if (error) throw error
  return data
}

export async function getLeaveRequests() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hrm_leaves")
    .select(`*, profiles:user_id (full_name)`)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}
