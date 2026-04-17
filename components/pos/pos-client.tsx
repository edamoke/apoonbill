"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { 
  LayoutGrid, 
  ShoppingCart, 
  Search, 
  Utensils, 
  Beer, 
  Plus, 
  Minus, 
  Trash2, 
  Coffee, 
  Pizza, 
  Fish, 
  Beef, 
  Sandwich,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronRight,
  UserPlus,
  Loader2,
  Lock,
  User,
  Hash,
  ArrowRight,
  Send,
  Ban,
  Tag,
  Receipt,
  ShoppingBag,
  Activity,
  Split, 
  Merge, 
  Move, 
  Edit3, 
  Save, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { POSTerminalActions } from "@/components/navigation/pos-terminal-actions"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  authorizeAction, 
  logAuditAction, 
  updateTableStatus, 
  getActiveOrderForTable,
  changeTable,
  mergeBills,
  splitBillEqual,
  updatePOSOrder
} from "@/app/actions/pos-actions"
import { ReceiptPrinterDialog } from "./receipt-printer-dialog"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
  category_id: string
}

interface Modifier {
  id: string
  name: string
  price_override: number
  group_id: string
}

interface ModifierGroup {
  id: string
  name: string
  modifiers: Modifier[]
  min_selection: number
  max_selection: number
}

interface CartItem extends Product {
  cartId: string // Unique for items with different modifiers
  quantity: number
  notes?: string
  selectedModifiers: Modifier[]
  discountedPrice?: number
  is_beverage?: boolean
}

interface POSTable {
  id: string
  number: string
  status: string
}

interface POSClientProps {
  categories: Category[]
  menuItems: Product[]
  tables: POSTable[]
  userProfile: any
  modifierGroups: ModifierGroup[]
  productModifiers: { product_id: string, group_id: string }[]
}

type PaymentMethod = 'mpesa' | 'card' | 'cash' | 'pay_later' | 'complimentary'

export function POSClient({ categories, menuItems, tables, userProfile, modifierGroups, productModifiers }: POSClientProps) {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  
  // Shift State
  const [activeShift, setActiveShift] = useState<any>(null)
  const [checkingShift, setCheckingShift] = useState(true)

  // App State
  const [cart, setCart] = useState<CartItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [isEditingExisting, setIsEditingExisting] = useState(false)
  const [activeDiscounts, setActiveDiscounts] = useState<any[]>([])
  
  // Client/Loyalty State
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [clientSearch, setClientSearch] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearchingClient, setIsSearchingClient] = useState(false)

  // Context Selection
  const [selectedTable, setSelectedTable] = useState<POSTable | null>(null)
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in')
  
  // Dialog States
  const [showCheckout, setShowCheckout] = useState(false)
  const [showSplitDialog, setShowSplitDialog] = useState(false)
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [transferTargetTable, setTransferTargetTable] = useState<string | null>(null)
  const [mergeSourceTable, setMergeSourceTable] = useState<string | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authAction, setAuthAction] = useState<{type: string, data?: any} | null>(null)
  const [managerPin, setManagerPin] = useState("")
  const [authError, setAuthError] = useState("")
  
  // Modifier Dialog State
  const [showModifiers, setShowModifiers] = useState(false)
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null)
  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>([])

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [mpesaPhone, setMpesaPhone] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)

  // Printer State
  const [showPrinter, setShowPrinter] = useState(false)
  const [lastCompletedOrder, setLastCompletedOrder] = useState<any>(null)

  // Load Discounts & Shift Status
  useEffect(() => {
    async function loadInitialData() {
      const { data: discounts } = await supabase.from("active_discounts").select("*")
      setActiveDiscounts(discounts || [])

      // Check shift status
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: shift } = await supabase
          .from('pos_shifts')
          .select('*')
          .eq('staff_id', user.id)
          .eq('status', 'open')
          .single()
        setActiveShift(shift)
      }
      setCheckingShift(false)
    }
    loadInitialData()
  }, [])

  // Client Search Handler
  useEffect(() => {
    const searchClients = async () => {
      if (clientSearch.length < 2) {
        setSearchResults([])
        return
      }
      setIsSearchingClient(true)
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .or(`full_name.ilike.%${clientSearch}%,email.ilike.%${clientSearch}%,phone.ilike.%${clientSearch}%`)
        .limit(5)
      setSearchResults(data || [])
      setIsSearchingClient(false)
    }
    const timer = setTimeout(searchClients, 500)
    return () => clearTimeout(timer)
  }, [clientSearch])

  const getDiscountedPrice = (product: Product) => {
    const discount = activeDiscounts.find(d => d.menu_item_id === product.id)
    if (discount) {
      return product.price * (1 - Number(discount.discount_percentage) / 100)
    }
    return product.price
  }

  // UI Derived State
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory ? item.category_id === selectedCategory : true
      return matchesSearch && matchesCategory
    })
  }, [menuItems, searchQuery, selectedCategory])

  const subtotal = cart.reduce((acc, item) => {
    const modifiersTotal = item.selectedModifiers ? item.selectedModifiers.reduce((mAcc, m) => mAcc + Number(m.price_override), 0) : 0
    const priceToUse = item.discountedPrice || item.price
    return acc + ((priceToUse + modifiersTotal) * item.quantity)
  }, 0)
  
  const calculatedDiscount = (subtotal * discountAmount / 100)
  const taxBase = subtotal - calculatedDiscount
  const tax = taxBase * 0.16
  const total = taxBase + tax

  // Calculate points to earn (e.g., 1 point per 100 KES)
  const pointsToEarn = Math.floor(total / 100)

  // Handlers
  const addToCart = (product: Product) => {
    if (!activeShift) {
      toast({ 
        title: "Shift Required", 
        description: "You must start your shift in POS Settings before taking orders.", 
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/settings/pos')}>
            Go to Settings
          </Button>
        )
      })
      return
    }

    if (!selectedTable && orderType === 'dine_in') {
      toast({ title: "Select Context", description: "Please select a table first.", variant: "destructive" })
      return
    }

    if (selectedTable?.status === 'occupied' && !activeOrderId) {
      handleTableClick(selectedTable)
    }

    const relevantGroups = modifierGroups.filter(group => 
      productModifiers.some(pm => pm.product_id === product.id && pm.group_id === group.id)
    )
    
    if (relevantGroups.length > 0) {
      setPendingProduct(product)
      setSelectedModifiers([])
      setShowModifiers(true)
    } else {
      executeAddToCart(product, [])
    }
  }

  const executeAddToCart = (product: Product, modifiers: Modifier[]) => {
    const priceWithDiscount = getDiscountedPrice(product)
    const cartId = `${product.id}-${modifiers.map(m => m.id).sort().join('-') || 'none'}`
    
    // Check if category is Beverage/Drink
    const category = categories.find(c => c.id === product.category_id)
    const isBeverage = category?.slug?.includes('drink') || category?.slug?.includes('beverage') || category?.name?.toLowerCase().includes('drink')

    setCart(prev => {
      const existing = prev.find(item => item.cartId === cartId)
      if (existing) {
        return prev.map(item => 
          item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { 
        ...product, 
        cartId, 
        quantity: 1, 
        selectedModifiers: modifiers, 
        discountedPrice: priceWithDiscount,
        is_beverage: isBeverage
      }]
    })
    setShowModifiers(false)
    
    if (selectedTable?.status === 'occupied') {
      setIsEditingExisting(true)
    }
  }

  const handleTableClick = async (table: POSTable) => {
    setSelectedTable(table)
    setOrderType('dine_in')
    setCart([])
    setActiveOrderId(null)
    setIsEditingExisting(false)
    
    if (table.status === 'occupied') {
      setIsSubmitting(true)
      try {
        const result = await getActiveOrderForTable(table.id)
        if (result.success && result.order) {
          const order = result.order
          setActiveOrderId(order.id)
          setIsEditingExisting(true)
          setDiscountAmount(Number(order.discount_percent || 0))
          
          if (order.order_items && order.order_items.length > 0) {
            const loadedCart: CartItem[] = order.order_items.map((item: any) => {
               const originalProduct = menuItems.find(mi => mi.id === item.product_id)
               return {
                  id: item.product_id,
                  cartId: `${item.product_id}-${(item.modifiers as Modifier[] || []).map((m: any) => m.id).sort().join('-') || 'none'}`,
                  name: item.item_name || item.name,
                  price: originalProduct?.price || Number(item.price), 
                  discountedPrice: Number(item.price), // In POS orders, price stored IS the final price
                  quantity: item.quantity,
                  selectedModifiers: item.modifiers || [],
                  image_url: originalProduct?.image_url || null
                }
            })
            setCart(loadedCart)
            toast({ title: `Table ${table.number}`, description: `${loadedCart.length} items loaded.` })
          }
        }
      } catch (error: any) {
        toast({ title: "Access Denied", description: "Check permissions or server status.", variant: "destructive" })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleUpdateExistingOrder = async () => {
    if (!activeOrderId) return
    setIsSubmitting(true)
    try {
      const result = await updatePOSOrder(activeOrderId, cart, subtotal, total, discountAmount)
      if (result.success) {
        toast({ title: "Order Updated", description: "Changes have been saved." })
        setIsEditingExisting(false)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVoidItem = (cartId: string) => {
    setAuthAction({ type: 'void_item', data: cartId })
    setShowAuthDialog(true)
  }

  const [pendingDiscount, setPendingDiscount] = useState(0)

  const handleApplyDiscount = (percent: number) => {
    setPendingDiscount(percent)
    setAuthAction({ type: 'apply_discount' })
    setShowAuthDialog(true)
  }

  const executeAuthAction = async () => {
    setAuthError("")
    const result = await authorizeAction(managerPin, ['supervisor', 'manager'])
    if (result.success) {
      if (authAction?.type === 'void_item') {
        setCart(prev => prev.filter(item => item.cartId !== authAction.data))
        toast({ title: "Item Voided", description: "Manager authorized item removal." })
      } else if (authAction?.type === 'apply_discount') {
        setDiscountAmount(pendingDiscount)
        toast({ title: "Discount Applied", description: `${pendingDiscount}% discount authorized.` })
      }
      setShowAuthDialog(false)
      setManagerPin("")
      setAuthAction(null)
    } else {
      setAuthError(result.error)
    }
  }

  const handleSendToKitchen = async () => {
    if (cart.length === 0) return
    setIsSubmitting(true)
    try {
      const { createOnlineOrder } = await import("@/app/actions/online-order-actions")
      
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          name: item.name,
          price: (item.discountedPrice || item.price) + item.selectedModifiers.reduce((a, b) => a + Number(b.price_override), 0),
          modifiers: item.selectedModifiers,
          is_beverage: item.is_beverage
        })),
        formData: {
          customerName: selectedClient?.full_name || "POS Customer",
          customerEmail: selectedClient?.email || "pos@starsgarters.com",
          customerPhone: mpesaPhone || selectedClient?.phone || "0000000000",
          deliveryAddress: selectedTable ? `Table ${selectedTable.number}` : "Takeaway",
          orderType: orderType,
          paymentMethod: 'pay_later', 
          specialInstructions: `POS Order | Sent to Kitchen`,
        },
        discount_percent: discountAmount,
        subtotal: subtotal,
        deliveryFee: 0,
        total: total,
        source: 'pos',
        user_id: selectedClient?.id,
        status: 'approved' 
      }

      if (activeOrderId && isEditingExisting) {
        const result = await updatePOSOrder(activeOrderId, cart, subtotal, total, discountAmount)
        if (!result.success) throw new Error(result.error)
      } else {
        const result = await createOnlineOrder(orderData)
        if (result.success) {
          setActiveOrderId(result.orderId)
          if (selectedTable) {
            const supabase = createClient()
            await supabase
              .from("pos_tables")
              .update({ active_order_id: result.orderId, status: 'occupied' })
              .eq("id", selectedTable.id)
          }
        } else {
          throw new Error(result.error)
        }
      }
      toast({ title: "Order Sent", description: "Sent to Chef. Kitchen tickets generated." })
      setIsEditingExisting(true)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const processCheckout = async () => {
    setIsSubmitting(true)
    try {
      const { createOnlineOrder } = await import("@/app/actions/online-order-actions")
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          name: item.name,
          price: (item.discountedPrice || item.price) + item.selectedModifiers.reduce((a, b) => a + Number(b.price_override), 0),
          modifiers: item.selectedModifiers
        })),
        formData: {
          customerName: selectedClient?.full_name || "POS Customer",
          customerEmail: selectedClient?.email || "pos@starsgarters.com",
          customerPhone: mpesaPhone || selectedClient?.phone || "0000000000",
          deliveryAddress: selectedTable ? `Table ${selectedTable.number}` : "Takeaway",
          orderType: orderType,
          paymentMethod: paymentMethod,
          specialInstructions: `POS Order | Discount: ${calculatedDiscount}`,
        },
        discount_percent: discountAmount,
        subtotal: subtotal,
        deliveryFee: 0,
        total: total,
        source: 'pos',
        user_id: selectedClient?.id
      }

      const result = await createOnlineOrder(orderData)
      if (result.success) {
        if (selectedTable && orderType === 'dine_in') {
          const supabase = createClient()
          await supabase
            .from("pos_tables")
            .update({ active_order_id: result.orderId, status: 'occupied' })
            .eq("id", selectedTable.id)
        } else if (selectedTable) {
          await updateTableStatus(selectedTable.id, 'cleaning')
        }
        setLastCompletedOrder(orderData)
        setShowCheckout(false)
        setShowPrinter(true)
        setCart([])
        setSelectedTable(null)
        setSelectedClient(null)
        router.refresh()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleModifier = (modifier: Modifier, group: ModifierGroup) => {
     setSelectedModifiers(prev => {
        const isSelected = prev.find(m => m.id === modifier.id)
        if (isSelected) {
           return prev.filter(m => m.id !== modifier.id)
        } else {
           const groupSelections = prev.filter(m => m.group_id === group.id)
           if (group.max_selection === 1) {
              return [...prev.filter(m => m.group_id !== group.id), modifier]
           } else if (groupSelections.length < group.max_selection) {
              return [...prev, modifier]
           }
           return prev
        }
     })
  }

  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'tables'>('menu')

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden text-foreground font-sans touch-none">
      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-around p-2 bg-card border-b z-50">
        <Button 
          variant={activeTab === 'tables' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setActiveTab('tables')}
          className="flex-1 rounded-none h-12"
        >
          <LayoutGrid className="h-5 w-5" />
        </Button>
        <Button 
          variant={activeTab === 'menu' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setActiveTab('menu')}
          className="flex-1 rounded-none h-12"
        >
          <Utensils className="h-5 w-5" />
        </Button>
        <Button 
          variant={activeTab === 'cart' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setActiveTab('cart')}
          className="flex-1 rounded-none h-12 relative"
        >
          <ShoppingCart className="h-5 w-5" />
          {cart.length > 0 && (
            <Badge className="absolute top-1 right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </Badge>
          )}
        </Button>
      </div>

      {/* Zone 1 & 4: Tables / Staff Info */}
      <div className={cn(
        "w-full md:w-64 border-r bg-card flex flex-col transition-all",
        activeTab !== 'tables' ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b bg-muted/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 font-bold">
              {userProfile?.full_name?.charAt(0) || userProfile?.email?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <p className="text-sm font-bold truncate w-32">{userProfile?.full_name || userProfile?.email}</p>
              <Badge variant="outline" className="text-[10px] uppercase border-primary/20 text-primary px-1 h-4">
                {userProfile?.role}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
             <Button 
               variant={orderType === 'dine_in' ? 'default' : 'ghost'} 
               size="sm" 
               className="w-full justify-start rounded-lg h-9"
               onClick={() => setOrderType('dine_in')}
             >
               <Utensils className="mr-2 h-4 w-4" /> Dine In
             </Button>
             <Button 
               variant={orderType === 'takeaway' ? 'default' : 'ghost'} 
               size="sm" 
               className="w-full justify-start rounded-lg h-9"
               onClick={() => {setOrderType('takeaway'); setSelectedTable(null)}}
             >
               <ShoppingBag className="mr-2 h-4 w-4" /> Takeaway
             </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-3 overscroll-contain">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Floor Map</p>
          <div className="grid grid-cols-2 gap-2">
            {tables.map(table => {
              const isSelected = selectedTable?.id === table.id
              return (
                <Button
                  key={table.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-16 flex flex-col rounded-xl transition-all ${
                    isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-95 shadow-lg shadow-primary/20' : ''
                  } ${
                    table.status === 'occupied' ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-500' : 
                    table.status === 'cleaning' ? 'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-500' : 
                    'bg-muted/30 text-muted-foreground'
                  }`}
                  onClick={() => handleTableClick(table)}
                >
                  <span className="text-lg font-black">{table.number}</span>
                  <span className="text-[9px] uppercase font-bold">{table.status}</span>
                </Button>
              )
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background space-y-2">
           <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                <Clock className="h-3 w-3 text-emerald-500" /> System Live
              </span>
              {activeShift ? (
                <Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-600 bg-emerald-500/5 h-5">
                   SHIFT ACTIVE
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[9px] border-rose-500/50 text-rose-600 bg-rose-500/5 h-5">
                   NO SHIFT
                </Badge>
              )}
           </div>
           
           {!activeShift && !checkingShift && (
             <Button variant="destructive" size="sm" className="w-full rounded-lg h-8 text-[10px] font-black" onClick={() => router.push('/admin/settings/pos')}>
                <Activity className="mr-1.5 h-3 w-3" /> START SHIFT
             </Button>
           )}

           <Button variant="outline" size="sm" className="w-full rounded-lg" asChild>
             <a href="/admin">Dashboard</a>
           </Button>
        </div>
      </div>

      {/* Zone 2: Menu / Products */}
      <div className={cn(
        "flex-1 flex flex-col bg-background transition-all",
        activeTab !== 'menu' ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 bg-muted/30 border-b flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Quick Search..." 
              className="bg-card pl-10 h-11 rounded-xl focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[400px]">
            <Button 
              variant={selectedCategory === null ? 'default' : 'outline'} 
              size="sm" 
              className={`rounded-lg h-11 px-4 ${selectedCategory === null ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card text-foreground hover:bg-muted'}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'} 
                size="sm" 
                className={`rounded-lg h-11 px-4 whitespace-nowrap ${selectedCategory === cat.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card text-foreground hover:bg-muted'}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 overscroll-contain">
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredItems.map(item => {
                const discountedPrice = getDiscountedPrice(item)
                const hasDiscount = discountedPrice < item.price

                return (
                  <Card 
                    key={item.id}
                    className="bg-card p-2 cursor-pointer hover:border-primary transition-all active:scale-95 touch-manipulation group rounded-xl shadow-lg relative"
                    onClick={() => addToCart(item)}
                  >
                    {hasDiscount && (
                      <div className="absolute -top-1 -right-1 z-10">
                         <Badge className="bg-red-600 text-white text-[8px] font-black h-5 px-1.5 shadow-md animate-pulse">OFFER</Badge>
                      </div>
                    )}
                    <div className="aspect-square rounded-lg mb-2 overflow-hidden bg-muted relative">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <Utensils className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1">
                         <div className="flex flex-col items-end">
                            {hasDiscount && <span className="text-[8px] line-through text-white bg-black/50 px-1 rounded">KES {item.price}</span>}
                            <Badge className="bg-primary text-primary-foreground text-[10px] h-5 font-black">KES {discountedPrice}</Badge>
                         </div>
                      </div>
                    </div>
                    <h3 className="text-[11px] font-bold line-clamp-2 h-7 leading-tight uppercase">{item.name}</h3>
                  </Card>
                )
              })}
           </div>
        </ScrollArea>

        {/* Zone 5 (Partial): Bottom Actions */}
        <div className="p-4 bg-card border-t flex gap-3">
           <Button variant="secondary" className="flex-1 h-14 rounded-2xl text-lg font-black bg-muted hover:bg-muted/80">
              <Ban className="mr-2 h-5 w-5" /> HOLD
           </Button>
           {activeOrderId && isEditingExisting ? (
             <Button 
               className="flex-1 h-14 rounded-2xl text-lg font-black shadow-lg bg-amber-600 hover:bg-amber-700"
               onClick={handleUpdateExistingOrder}
               disabled={isSubmitting}
             >
                <Save className="mr-2 h-5 w-5" /> UPDATE
             </Button>
           ) : (
             <Button 
               className="flex-1 h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20"
               onClick={handleSendToKitchen}
               disabled={cart.length === 0 || isSubmitting}
             >
                <Send className="mr-2 h-5 w-5" /> SEND
             </Button>
           )}
        </div>
      </div>

      {/* Zone 3: Order Summary */}
      <div className={cn(
        "w-full md:w-96 border-l bg-card flex flex-col shadow-2xl transition-all",
        activeTab !== 'cart' ? "hidden md:flex" : "flex"
      )}>
        {/* Client Selector Area */}
        <div className="p-4 border-b bg-primary/5">
           {selectedClient ? (
             <div className="flex items-center justify-between bg-white dark:bg-muted p-2 rounded-xl border border-primary/20 shadow-sm">
                <div className="flex items-center gap-2">
                   <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                   </div>
                   <div>
                      <p className="text-xs font-bold truncate w-32">{selectedClient.full_name}</p>
                      <p className="text-[10px] text-primary font-black uppercase">{selectedClient.loyalty_points || 0} PTS</p>
                   </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedClient(null)}>
                   <XCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
             </div>
           ) : (
             <div className="space-y-2 relative">
                <div className="relative">
                   <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                   <Input 
                      placeholder="Search Client / Loyalty..." 
                      className="pl-8 h-9 text-xs rounded-lg bg-white dark:bg-muted"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                   />
                   {isSearchingClient && <Loader2 className="absolute right-2.5 top-2.5 h-3.5 w-3.5 animate-spin text-primary" />}
                </div>
                {searchResults.length > 0 && (
                   <div className="absolute z-50 w-full mt-1 bg-card border rounded-xl shadow-2xl p-1">
                      {searchResults.map(client => (
                         <div 
                            key={client.id}
                            className="p-2 hover:bg-muted cursor-pointer rounded-lg flex items-center justify-between"
                            onClick={() => {
                               setSelectedClient(client)
                               setSearchResults([])
                               setClientSearch("")
                            }}
                         >
                            <div>
                               <p className="text-xs font-bold">{client.full_name}</p>
                               <p className="text-[10px] text-muted-foreground">{client.email || client.phone}</p>
                            </div>
                            <Badge variant="secondary" className="text-[9px]">{client.loyalty_points || 0} pts</Badge>
                         </div>
                      ))}
                   </div>
                )}
             </div>
           )}
        </div>

        <div className="p-4 border-b bg-background flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
               <Receipt className="h-5 w-5" />
             </div>
             <div>
               <h2 className="text-sm font-black uppercase tracking-wider">Order Summary</h2>
               <p className="text-[10px] text-muted-foreground font-bold">
                 {selectedTable ? `TABLE ${selectedTable.number}` : 'TAKEAWAY'}
               </p>
             </div>
           </div>
           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setCart([])}>
             <Trash2 className="h-4 w-4" />
           </Button>
        </div>

        {/* Table Management Actions */}
        <div className="px-4 py-2 bg-muted/20 border-b grid grid-cols-3 gap-2 min-h-[52px]">
          {selectedTable ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-[10px] font-bold px-1"
                onClick={() => setShowTransferDialog(true)}
              >
                <Move className="mr-1 h-3 w-3" /> MOVE
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-[10px] font-bold px-1"
                onClick={() => setShowSplitDialog(true)}
                disabled={cart.length === 0}
              >
                <Split className="mr-1 h-3 w-3" /> SPLIT
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-[10px] font-bold px-1"
                onClick={() => setShowMergeDialog(true)}
              >
                <Merge className="mr-1 h-3 w-3" /> MERGE
              </Button>
            </>
          ) : (
            <div className="col-span-3 flex items-center justify-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic">
              Table actions available in Dine-In mode
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 p-4 overscroll-contain">
           <div className="space-y-3">
              {cart.map(item => (
                <div key={item.cartId} className="bg-muted/30 p-3 rounded-xl border flex flex-col gap-2 group">
                   <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 rounded-full bg-background" 
                          onClick={() => {
                            setCart(prev => prev.map(i => i.cartId === item.cartId ? {...i, quantity: i.quantity + 1} : i))
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">
                          {item.quantity}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 rounded-full bg-background"
                          disabled={item.quantity <= 1}
                          onClick={() => {
                            setCart(prev => prev.map(i => i.cartId === item.cartId ? {...i, quantity: i.quantity - 1} : i))
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-1 mb-1">
                            <p className="text-[11px] font-bold truncate leading-none uppercase">{item.name}</p>
                         </div>
                         <div className="flex items-center gap-2">
                            {item.discountedPrice && item.discountedPrice < item.price ? (
                              <>
                                <p className="text-[9px] text-red-600 font-black">Ksh {item.discountedPrice}</p>
                                <p className="text-[8px] text-muted-foreground line-through">Ksh {item.price}</p>
                              </>
                            ) : (
                              <p className="text-[9px] text-muted-foreground font-bold">Ksh {item.price}</p>
                            )}
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[11px] font-black mb-1">
                           {((item.discountedPrice || item.price + (item.selectedModifiers ? item.selectedModifiers.reduce((a, b) => a + Number(b.price_override), 0) : 0)) * item.quantity).toLocaleString()}
                         </p>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-6 w-6 text-red-500/50 hover:text-red-500 transition-colors"
                           onClick={() => handleVoidItem(item.cartId)}
                         >
                             <Trash2 className="h-3.5 w-3.5" />
                         </Button>
                      </div>
                   </div>
                   {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                     <div className="flex flex-wrap gap-1 ml-8">
                        {item.selectedModifiers.map(m => (
                          <Badge key={m.id} variant="secondary" className="text-[8px] h-4 bg-background/50 text-muted-foreground border-border">
                             {m.name} (+{m.price_override})
                          </Badge>
                        ))}
                     </div>
                   )}
                </div>
              ))}
           </div>
        </ScrollArea>

        {/* Totals & Pay */}
        <div className="p-4 bg-background border-t space-y-3">
           <div className="space-y-1.5 px-1">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Subtotal</span>
                <span>Ksh {subtotal.toLocaleString()}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                   <span className="text-sm font-black uppercase text-muted-foreground block">Total</span>
                   {selectedClient && (
                     <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black">
                        + {pointsToEarn} POINTS
                     </Badge>
                   )}
                </div>
                <span className="text-3xl font-black text-primary leading-none tracking-tighter">Ksh {total.toLocaleString()}</span>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-2 pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl font-bold h-12">
                    <Tag className="mr-2 h-4 w-4" /> DISCOUNT
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card text-foreground max-w-xs">
                  <DialogHeader><DialogTitle>Apply Ad-hoc Discount (%)</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-2 gap-2 py-4">
                    {[5, 10, 15, 20, 50].map(p => (
                      <Button key={p} onClick={() => handleApplyDiscount(p)} variant="outline" className="h-12 text-lg font-bold">{p}%</Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                className="rounded-xl h-12 text-lg font-black shadow-xl"
                disabled={cart.length === 0}
                onClick={() => setShowCheckout(true)}
              >
                 <CreditCard className="mr-2 h-5 w-5" /> PAY
              </Button>
           </div>
        </div>
      </div>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md bg-card text-foreground">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Total Amount: <span className="font-bold text-primary">KES {total.toLocaleString()}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-2">
                {['cash', 'mpesa', 'card', 'pay_later', 'complimentary'].map((method) => (
                  <Button
                    key={method}
                    variant={paymentMethod === method ? "default" : "outline"}
                    className={cn(
                      "h-20 flex flex-col items-center justify-center gap-2",
                      paymentMethod === method ? "border-primary bg-primary/10 text-primary hover:bg-primary/20" : ""
                    )}
                    onClick={() => setPaymentMethod(method as PaymentMethod)}
                  >
                    {method === 'cash' && <Banknote className="h-6 w-6" />}
                    {method === 'mpesa' && <Smartphone className="h-6 w-6" />}
                    {method === 'card' && <CreditCard className="h-6 w-6" />}
                    {method === 'pay_later' && <Clock className="h-6 w-6" />}
                    {method === 'complimentary' && <Tag className="h-6 w-6" />}
                    <span className="capitalize text-xs">{method.replace('_', ' ')}</span>
                  </Button>
                ))}
              </div>
            </div>

            {paymentMethod === 'mpesa' && (
              <div className="space-y-2">
                <Label>M-Pesa Phone Number</Label>
                <Input 
                  placeholder="254..." 
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>Cancel</Button>
            <Button onClick={processCheckout} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showModifiers} onOpenChange={setShowModifiers}>
        <DialogContent className="max-w-2xl bg-card text-foreground">
          <DialogHeader>
            <DialogTitle>Select Options</DialogTitle>
            <DialogDescription>
              Customize {pendingProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
             {pendingProduct && modifierGroups
                .filter(group => productModifiers.some(pm => pm.product_id === pendingProduct.id && pm.group_id === group.id))
                .map(group => (
                   <div key={group.id} className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                         <h3 className="font-bold">{group.name}</h3>
                         <span className="text-xs text-muted-foreground">
                            {group.min_selection > 0 ? `Required (Min ${group.min_selection})` : 'Optional'} 
                            {group.max_selection > 0 ? ` - Max ${group.max_selection}` : ''}
                         </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                         {group.modifiers.map(mod => {
                            const isSelected = selectedModifiers.some(m => m.id === mod.id)
                            return (
                               <Button
                                  key={mod.id}
                                  variant={isSelected ? "default" : "outline"}
                                  className={cn(
                                     "justify-between h-auto py-3",
                                     isSelected ? "border-primary bg-primary/10 text-primary" : ""
                                  )}
                                  onClick={() => toggleModifier(mod, group)}
                               >
                                  <span>{mod.name}</span>
                                  <span className="text-xs opacity-70">+{mod.price_override}</span>
                               </Button>
                            )
                         })}
                      </div>
                   </div>
                ))
             }
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModifiers(false)}>Cancel</Button>
            <Button 
               onClick={() => pendingProduct && executeAddToCart(pendingProduct, selectedModifiers)}
               disabled={(() => {
                  if (!pendingProduct) return true
                  const groups = modifierGroups.filter(group => productModifiers.some(pm => pm.product_id === pendingProduct.id && pm.group_id === group.id))
                  for (const group of groups) {
                     const selectionCount = selectedModifiers.filter(m => m.group_id === group.id).length
                     if (selectionCount < group.min_selection) return true
                  }
                  return false
               })()}
            >
              Add to Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
         <DialogContent className="max-w-sm bg-card text-foreground">
            <DialogHeader>
               <DialogTitle>Manager Authorization</DialogTitle>
               <DialogDescription>Enter PIN to authorize action</DialogDescription>
            </DialogHeader>
            <div className="py-4">
               <Input 
                  type="password" 
                  placeholder="Enter PIN" 
                  value={managerPin}
                  onChange={(e) => setManagerPin(e.target.value)}
                  className="text-center text-2xl tracking-widest"
               />
               {authError && <p className="text-red-500 text-sm mt-2 text-center">{authError}</p>}
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setShowAuthDialog(false)}>Cancel</Button>
               <Button onClick={executeAuthAction}>Authorize</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <ReceiptPrinterDialog 
         isOpen={showPrinter} 
         onClose={() => setShowPrinter(false)} 
         orderData={lastCompletedOrder} 
      />

      {/* Split Bill Dialog */}
      <Dialog open={showSplitDialog} onOpenChange={setShowSplitDialog}>
        <DialogContent className="bg-card text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle>Split Bill Equally</DialogTitle>
            <DialogDescription>Divide the total amount among multiple people</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2 py-4">
            {[2, 3, 4, 5, 6, 7, 8].map(num => (
              <Button 
                key={num} 
                variant="outline" 
                className="h-12 font-bold"
                onClick={async () => {
                  if (!activeOrderId) return
                  const result = await splitBillEqual(activeOrderId, num)
                  if (result.success) {
                    toast({ title: "Bill Split", description: `Created ${num} equal split payments.` })
                    setShowSplitDialog(false)
                  }
                }}
              >
                {num}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Table Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="bg-card text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Move Table</DialogTitle>
            <DialogDescription>Transfer current order to another table</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid grid-cols-3 gap-2">
              {tables.filter(t => t.status === 'available' && t.id !== selectedTable?.id).map(t => (
                <Button 
                  key={t.id} 
                  variant="outline" 
                  className="h-16 flex flex-col"
                  onClick={async () => {
                    if (!selectedTable || !activeOrderId) return
                    const result = await changeTable(activeOrderId, selectedTable.id, t.id)
                    if (result.success) {
                      toast({ title: "Table Moved", description: `Transferred to Table ${t.number}` })
                      setShowTransferDialog(false)
                      setSelectedTable(t)
                    }
                  }}
                >
                  <span className="text-lg font-black">{t.number}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Merge Bill Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="bg-card text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Merge Bills</DialogTitle>
            <DialogDescription>Combine another table's bill into this one</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            <div className="grid grid-cols-3 gap-2">
              {tables.filter(t => t.status === 'occupied' && t.id !== selectedTable?.id).map(t => (
                <Button 
                  key={t.id} 
                  variant="outline" 
                  className="h-16 flex flex-col border-amber-500/50 bg-amber-500/5"
                  onClick={async () => {
                    if (!selectedTable) return
                    setIsSubmitting(true)
                    try {
                      const result = await mergeBills(t.id, selectedTable.id)
                      if (result.success) {
                        toast({ title: "Bills Merged", description: `Merged Table ${t.number} into this bill.` })
                        setShowMergeDialog(false)
                        handleTableClick(selectedTable) // Reload current table
                      }
                    } finally {
                      setIsSubmitting(false)
                    }
                  }}
                >
                  <span className="text-lg font-black">{t.number}</span>
                  <span className="text-[8px] font-bold">OCCUPIED</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
