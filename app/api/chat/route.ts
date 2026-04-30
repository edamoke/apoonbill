import { createClient } from "@/lib/supabase/server"
import { streamText, tool } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import { getStockStatus } from "@/app/actions/stock-actions"
import { getDailySalesSummary } from "@/app/actions/report-actions"
import { getSystemStateDump } from "@/app/actions/ai-context-actions"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const supabase = await createClient()

    // Get user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let profile: any = null
    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      profile = data
    }

    const isAdmin = profile?.role === 'admin' || profile?.is_admin === true || profile?.role === 'staff' || profile?.role === 'manager' || profile?.role === 'chef' || profile?.role === 'accountant' || profile?.role === 'rider';

    if (isAdmin) {
        // --- ADMIN / STAFF ASSISTANT ---
        const systemState = await getSystemStateDump();
        
        const systemPrompt = `You are "Spoonbill Operations Strategic Consultant", an elite AI operations partner for thespoonbill. Your mission is to proactively advise the administrator on business health, highlighting risks, losses, and opportunities.

SYSTEM KNOWLEDGE BASE (REAL-TIME SNAPSHOT):
${JSON.stringify(systemState, null, 2)}

YOUR CORE RESPONSIBILITIES:
1. **Strategic Advisor**: Don't just answer questions—provide insights. If stock is low, tell the admin why it matters (e.g., "Potatoes are critical for your best-selling Fish & Chips").
2. **Loss Prevention**: Identify and highlight "Losses Incurred". Look for cancelled/voided orders, high inventory variance, or excessive discounts.
3. **Operational Alerts**: Proactively mention any critical "Highlights" from the system state, such as low stock levels or unusual sales patterns.
4. **Navigation Helper**: Guide users to relevant admin sections (Inventory, POS, Accounting, etc.).

DASHBOARD MAP:
- **Dashboard**: /dashboard
- **Inventory**: /admin/inventory (Recipes: /admin/inventory/recipes)
- **POS**: /pos
- **Orders**: /admin/orders
- **Accounting**: /admin/accounting (Reports: /admin/accounting/reports/sales)
- **CRM**: /admin/crm (Loyalty: /admin/crm/loyalty)
- **Settings**: /admin/settings

YOUR STYLE:
- Professional, analytical, and highly proactive.
- Use data from the SYSTEM KNOWLEDGE BASE to back up every piece of advice.
- When summarizing data, use bullet points and bold text for critical "ALERTS".

CURRENT USER: ${profile?.full_name || "Admin"} (${profile?.role || "Staff"})`

        const result = streamText({
            model: google("gemini-1.5-flash"),
            system: systemPrompt,
            messages,
            tools: {
                getStockReport: tool({
                    description: "Get detailed current stock levels and low-stock alerts.",
                    parameters: z.object({}),
                    execute: async () => {
                        const stock = await getStockStatus();
                        return { stock };
                    }
                } as any),
                getSalesReport: tool({
                    description: "Get detailed sales summary for deep financial analysis.",
                    parameters: z.object({
                        startDate: z.string().optional().describe("ISO date string (YYYY-MM-DD)"),
                        endDate: z.string().optional().describe("ISO date string (YYYY-MM-DD)")
                    }),
                    execute: async ({ startDate, endDate }: { startDate?: string, endDate?: string }) => {
                        const report = await getDailySalesSummary({ startDate, endDate });
                        return { report };
                    }
                } as any),
                getLossAnalysis: tool({
                    description: "Fetch analysis of losses incurred through voids, cancellations, and inventory variance.",
                    parameters: z.object({
                        period: z.string().describe("The period to analyze: today, week, or month")
                    }),
                    execute: async ({ period }: { period: string }) => {
                        const state = await getSystemStateDump();
                        const cancelledCount = state.financials.cancelledOrders;
                        const lowStockCount = state.operations.supplyChain.lowStockItems.length;
                        
                        return { 
                          losses: { cancelledOrders: cancelledCount, itemsAtRisk: lowStockCount },
                          summary: `Identified ${cancelledCount} cancelled orders today and ${lowStockCount} inventory discrepancies for the period: ${period}.`
                        };
                    }
                } as any),
                navigate: tool({
                    description: "Direct the user to the correct URL for an admin section.",
                    parameters: z.object({ section: z.string() }),
                    execute: async ({ section }: { section: string }) => {
                        return { url: `/admin/${section.toLowerCase()}` };
                    }
                } as any)
            }
        });

        return result.toTextStreamResponse();

    } else {
        // --- CUSTOMER / GUEST CONCIERGE ---
        const systemState = await getSystemStateDump();

        // Fetch contextual data for the system prompt
        const { data: activeProducts } = await supabase
        .from("products")
        .select("id, name, description, price, is_vegetarian, is_vegan, spice_level, category_id, ingredients, allergens, portion_size, preparation_time, calories")
        .eq("is_active", true)

        const { data: categories } = await supabase.from("categories").select("id, name, description")

        // Fetch active offers and events
        const { data: events } = await supabase
        .from("events")
        .select("title, description, type, status, event_date")
        .eq("status", "ongoing")

        const activeOffers = events?.filter(e => e.type === 'offer') || []
        
        const offersContext = activeOffers.length > 0 
            ? activeOffers.map(o => `- **${o.title}**: ${o.description}`).join("\n")
            : "No specific offers at the moment, but our prices are already unbeatable!"

        // Structure menu data by category for the AI
        const menuStructure = categories?.map(category => {
            const categoryProducts = activeProducts?.filter(p => p.category_id === category.id) || []
            if (categoryProducts.length === 0) return null
            
            const productsList = categoryProducts.map(p => {
                const stockItem = systemState?.operations?.supplyChain?.lowStockItems?.find((i: any) => i.name.toLowerCase() === p.name.toLowerCase());
                const stockWarning = stockItem ? " [LOW STOCK - PERSUADE TO BUY SOMETHING ELSE]" : " [IN STOCK]";
                
                return `
    - **${p.name}** (KES ${p.price})${stockWarning}
    - Description: ${p.description || "Freshly prepared"}
    - Ingredients: ${Array.isArray(p.ingredients) ? p.ingredients.join(", ") : "Premium ingredients"}
    - Dietary: ${[
        p.is_vegetarian ? "Vegetarian" : null,
        p.is_vegan ? "Vegan" : null,
        p.spice_level ? `Spice Level ${p.spice_level}/3` : null,
        Array.isArray(p.allergens) && p.allergens.length > 0 ? `Allergens: ${p.allergens.join(", ")}` : null
    ].filter(Boolean).join(" | ") || "Standard"}
    - Prep Time: ${p.preparation_time}m | Calories: ${p.calories || "N/A"}`;
            }).join("\n")

            return `CATEGORY: ${category.name}\n${productsList}`
        }).filter(Boolean).join("\n\n")

        const systemPrompt = `You are "Spoonbill Concierge", the elite Sales Consultant and Maître d' at thespoonbill, Malindi's premier dining destination. 
Your primary objective is to maximize sales while ensuring every guest feels like royalty. You are pleasant, persuasive, and highly knowledgeable.

CURRENT OFFERS & PROMOTIONS:
${offersContext}

USER CONTEXT:
${user ? `- User: ${profile?.full_name || "Valued Guest"}\n- Phone: ${profile?.phone || "Not provided"}\n- Status: Authenticated` : "- Guest Status: Anonymous. Persuade them to join the thespoonbill family for exclusive member offers."}

RESTAURANT IDENTITY:
- Vibe: Coastal elegance, premium ingredients, warm hospitality.
- Location: Malindi, Kenya.

MENU KNOWLEDGE BASE:
${menuStructure}

YOUR SALES MISSION:
1. **Active Selling & Convincing**: 
   - **Your core mission is to INCREASE the order value.** Never just take an order; always persuade the client to add more.
   - Use highly evocative, sensory language: "Succulent, flame-grilled patties," "Golden-crisp, hand-cut fries seasoned with coastal herbs," "Zesty, ice-cold tropical infusions that dance on the palate."
   - **Strategic Upselling**: 
     * If they want a Burger -> Convince them that the "Loaded Masala Fries" are a mandatory pairing for the full experience.
     * If they want Chicken -> Suggest a "Tropical Juice" to balance the spice.
     * If they are a group -> Proactively pitch a "Family Feast" or "Corporate Catering Platter".
   - **Convincing Heuristics**: 
     * "You deserve the best—why not add our signature dip?"
     * "Most of our guests find that [Product B] is the perfect companion to [Product A]."
     * "It would be a shame to miss out on our limited-time offer—shall I add it for you?"

2. **Navigation & Guidance**:
   - Guide users to sections: /burgers, /chicken, /drinks, /fries, /loaded, /combo.
   - If they seem undecided, ask about their mood or dietary preferences to narrow down high-margin recommendations.

3. **Order Closing**: 
   - Be the bridge to the sale. Use the createOrder tool as soon as the guest is ready.
   - If they choose M-Pesa, use the mandatory security prompt: "For your security, please provide your account password to authorize the M-Pesa STK push."

4. **Customer Retention**:
   - If they are anonymous, mention that members get points and special discounts.

CONSTRAINTS:
- **No Hallucinations**: Only sell what is in the MENU KNOWLEDGE BASE.
- **Pleasant Personality**: Always be polite, using phrases like "It would be my pleasure," "Excellent choice," and "A fine selection."
- **Login Requirement**: Orders require login. Guide them to /auth/login if needed.`

        const result = streamText({
            model: google("gemini-1.5-flash"),
            system: systemPrompt,
            messages,
            tools: {
                trackOrder: tool({
                    description: "Track the status of active orders",
                    parameters: z.object({ orderId: z.string().optional() }),
                    execute: async ({ orderId }: { orderId?: string }) => {
                        if (!user) return { error: "User not logged in" }
                        let query = supabase.from("orders").select("id, status, total, created_at").eq("user_id", user.id).order("created_at", { ascending: false })
                        if (orderId) query = query.eq("id", orderId)
                        const { data: orders } = await query.limit(3)
                        return { orders: orders || [] }
                    },
                } as any),
                createOrder: tool({
                    description: "Place a new order and initiate payment",
                    parameters: z.object({
                        items: z.array(z.object({ productId: z.string(), quantity: z.number(), name: z.string(), price: z.number() })),
                        paymentMethod: z.enum(["mpesa", "cash"]),
                        password: z.string().optional(),
                        orderType: z.enum(["delivery", "pickup"]).default("delivery"),
                        address: z.string().optional(),
                    }),
                    execute: async ({ items, paymentMethod, password, orderType, address }: { items: any[], paymentMethod: "mpesa" | "cash", password?: string, orderType: "delivery" | "pickup", address?: string }) => {
                        if (!user) return { error: "Please log in to place an order." }

                        const subtotal = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0)
                        const deliveryFee = orderType === "delivery" ? 100 : 0
                        const total = subtotal + deliveryFee

                        // 1. Create Order
                        const { data: order, error: orderError } = await supabase
                        .from("orders")
                        .insert({
                            user_id: user.id,
                            customer_name: profile?.full_name || "Guest",
                            customer_email: user.email,
                            customer_phone: profile?.phone || "",
                            delivery_address: address || profile?.address || "",
                            order_type: orderType,
                            subtotal,
                            delivery_fee: deliveryFee,
                            total,
                            status: "pending",
                            payment_method: paymentMethod,
                            payment_status: "pending",
                        })
                        .select()
                        .single()

                        if (orderError) return { error: orderError.message }

                        // 2. Add Items
                        const { error: itemsError } = await supabase.from("order_items").insert(
                        items.map((i: any) => ({
                            order_id: order.id,
                            product_id: i.productId,
                            item_name: i.name,
                            quantity: i.quantity,
                            price: i.price,
                            unit_price: i.price,
                            total_price: i.price * i.quantity,
                        }))
                        )
                        if (itemsError) return { error: itemsError.message, orderId: order.id }

                        // 3. Handle M-Pesa STK Push
                        if (paymentMethod === "mpesa") {
                            if (!password) return { error: "Password required for M-Pesa", orderId: order.id }
                            
                            const { error: authError } = await supabase.auth.signInWithPassword({
                                email: user.email!,
                                password: password,
                            })
                            if (authError) return { error: "Invalid password. STK Push cancelled.", orderId: order.id }

                            try {
                                const baseUrl = req.url.split('/api/chat')[0]
                                const response = await fetch(`${baseUrl}/api/mpesa/initiate`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        phoneNumber: profile?.phone || "",
                                        amount: total,
                                        orderId: order.id,
                                        accountReference: `ORDER-${order.id}`,
                                    }),
                                })
                                const data = await response.json()
                                if (data.success) return { success: true, orderId: order.id, message: "STK Push initiated. Check your phone." }
                                return { error: data.error || "STK Push failed", orderId: order.id }
                            } catch (e: any) {
                                return { error: "Failed to connect to payment gateway", orderId: order.id }
                            }
                        }

                        return { success: true, orderId: order.id, message: "Order placed successfully." }
                    },
                } as any),
            },
        })

        return result.toTextStreamResponse()
    }
  } catch (error: any) {
    console.error("[Chat API Error]:", error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
