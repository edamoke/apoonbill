"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminHeader } from "@/components/admin/admin-header"
import { MenuMigrationDialog } from "@/components/admin/menu-migration-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Search, AlertTriangle, Package, Info, LayoutGrid, List, Trash2, CheckSquare, Square } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [stockStatus, setStockStatus] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(profile)
      }

      const { data: catData } = await supabase.from("categories").select("*").order("name")
      setCategories(catData || [])

      fetchProducts()
    }
    init()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  async function handleBulkDelete() {
    if (!selectedProductIds.length) return
    if (!confirm(`Are you sure you want to delete ${selectedProductIds.length} products?`)) return

    setLoading(true)
    const { error } = await supabase
      .from("products")
      .delete()
      .in("id", selectedProductIds)

    if (error) {
      alert("Error deleting products: " + error.message)
    } else {
      setSelectedProductIds([])
      await fetchProducts()
    }
    setLoading(false)
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([])
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id))
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory
    const matchesStatus = selectedStatus === "all" || (selectedStatus === "active" ? product.is_active : !product.is_active)
    
    let matchesPrice = true
    if (priceRange === "under-500") matchesPrice = Number(product.price) < 500
    if (priceRange === "500-1500") matchesPrice = Number(product.price) >= 500 && Number(product.price) <= 1500
    if (priceRange === "over-1500") matchesPrice = Number(product.price) > 1500

    let matchesStock = true
    if (stockStatus === "out") matchesStock = Number(product.stock) <= 0
    if (stockStatus === "low") matchesStock = Number(product.stock) > 0 && Number(product.stock) <= 10
    if (stockStatus === "healthy") matchesStock = Number(product.stock) > 10

    return matchesSearch && matchesCategory && matchesStatus && matchesPrice && matchesStock
  })

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {user && <AdminHeader user={user} profile={profile} />}

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Product Management</h1>
            <p className="text-muted-foreground font-medium mt-1">Configure your menu and retail catalog</p>
          </div>
          <div className="flex items-center gap-3">
            <MenuMigrationDialog />
            {selectedProductIds.length > 0 && (
              <Button 
                onClick={handleBulkDelete}
                variant="destructive"
                className="rounded-full px-6 font-bold uppercase tracking-widest text-xs h-12"
              >
                <Trash2 className="mr-2 h-5 w-5" />
                Delete Selected ({selectedProductIds.length})
              </Button>
            )}
            <div className="flex bg-slate-100 p-1 rounded-full mr-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={cn("rounded-full h-10 w-10", viewMode === "grid" && "bg-white shadow-sm text-primary hover:bg-white")}
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={cn("rounded-full h-10 w-10", viewMode === "list" && "bg-white shadow-sm text-primary hover:bg-white")}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
            <Button asChild className="rounded-full px-8 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100 h-12 font-bold uppercase tracking-widest text-xs">
              <Link href="/admin/products/new">
                <Plus className="mr-2 h-5 w-5" />
                Add New Product
              </Link>
            </Button>
          </div>
        </div>

        {/* World Class Filter Section */}
        <Card className="border-none shadow-xl bg-slate-50/50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 bg-white border-none shadow-sm rounded-xl h-11 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white border-none shadow-sm rounded-xl h-11 font-bold text-xs uppercase tracking-wider">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-white border-none shadow-sm rounded-xl h-11 font-bold text-xs uppercase tracking-wider">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="bg-white border-none shadow-sm rounded-xl h-11 font-bold text-xs uppercase tracking-wider">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="under-500">Under 500</SelectItem>
                <SelectItem value="500-1500">500 - 1500</SelectItem>
                <SelectItem value="over-1500">Above 1500</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stockStatus} onValueChange={setStockStatus}>
              <SelectTrigger className="bg-white border-none shadow-sm rounded-xl h-11 font-bold text-xs uppercase tracking-wider">
                <SelectValue placeholder="Stock Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Global Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
                <SelectItem value="low">Low Stock (≤10)</SelectItem>
                <SelectItem value="healthy">Healthy Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* View Content */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card key={product.id} className="border-none shadow-md hover:shadow-2xl transition-all duration-300 group overflow-hidden rounded-[24px] bg-card relative">
                  <div 
                    className="absolute top-3 right-3 z-20 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleProductSelection(product.id);
                    }}
                  >
                    {selectedProductIds.includes(product.id) ? (
                      <CheckSquare className="h-6 w-6 text-red-600 fill-white" />
                    ) : (
                      <Square className="h-6 w-6 text-white/50 hover:text-white" />
                    )}
                  </div>
                <div className="aspect-[4/5] relative overflow-hidden">
                   {/* Product Image with Hover Zoom */}
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <Package className="h-12 w-12" />
                    </div>
                  )}
                  
                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3">
                    <Badge className={cn(
                      "font-black text-[9px] uppercase tracking-widest px-2 py-0.5 border-none",
                      product.is_active ? "bg-green-500 text-white" : "bg-slate-500 text-white"
                    )}>
                      {product.is_active ? "Live" : "Draft"}
                    </Badge>
                  </div>

                  {/* Stock Alert Overlay */}
                  {product.stock <= 5 && (
                    <div className="absolute top-3 right-3">
                       <div className="bg-red-600 text-white p-1 rounded-full shadow-lg">
                          <AlertTriangle className="h-3 w-3" />
                       </div>
                    </div>
                  )}
                </div>

                <CardContent className="p-5 space-y-3">
                  <div className="min-h-[40px]">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter mb-1">
                      {product.categories?.name || "Uncategorized"}
                    </p>
                    <h3 className="font-bold text-sm leading-tight text-slate-900 line-clamp-2 uppercase">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price</p>
                      <p className="text-sm font-black text-red-600">KES {product.price}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inv</p>
                      <p className={cn("text-sm font-black", product.stock <= 0 ? "text-red-500" : "text-slate-800")}>
                        {product.stock}
                      </p>
                    </div>
                  </div>

                  <Button asChild variant="secondary" size="sm" className="w-full rounded-xl font-bold uppercase text-[10px] h-9 tracking-widest group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <Link href={`/admin/products/${product.id}`}>Edit Entry</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-muted-foreground">
               <Info className="h-12 w-12 mb-4 opacity-20" />
               <p className="font-bold uppercase tracking-widest text-sm">No products match your deep analysis</p>
               <Button variant="link" onClick={() => {
                 setSearchTerm("");
                 setSelectedCategory("all");
                 setSelectedStatus("all");
                 setPriceRange("all");
                 setStockStatus("all");
               }}>Clear all filters</Button>
            </div>
          )}
          </div>
        ) : (
          /* Detailed List View */
          <Card className="border-none shadow-xl overflow-hidden rounded-[24px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 w-10">
                      <div className="cursor-pointer" onClick={toggleSelectAll}>
                        {selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                          <CheckSquare className="h-5 w-5 text-red-600" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-300" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 font-black text-[10px] uppercase tracking-widest text-slate-500">Product</th>
                    <th className="p-4 font-black text-[10px] uppercase tracking-widest text-slate-500">Category</th>
                    <th className="p-4 font-black text-[10px] uppercase tracking-widest text-slate-500 text-right">Price</th>
                    <th className="p-4 font-black text-[10px] uppercase tracking-widest text-slate-500 text-center">Stock</th>
                    <th className="p-4 font-black text-[10px] uppercase tracking-widest text-slate-500">Status</th>
                    <th className="p-4 font-black text-[10px] uppercase tracking-widest text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className={cn(
                        "hover:bg-slate-50/50 transition-colors",
                        selectedProductIds.includes(product.id) && "bg-red-50/30"
                      )}>
                        <td className="p-4">
                          <div className="cursor-pointer" onClick={() => toggleProductSelection(product.id)}>
                            {selectedProductIds.includes(product.id) ? (
                              <CheckSquare className="h-5 w-5 text-red-600" />
                            ) : (
                              <Square className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                  <Package className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 uppercase line-clamp-1">{product.name}</p>
                              <p className="text-[10px] text-muted-foreground font-medium">ID: {product.id.slice(0,8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-widest bg-slate-100 text-slate-600 border-none">
                            {product.categories?.name || "Uncategorized"}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <p className="font-black text-sm text-red-600">KES {product.price}</p>
                        </td>
                        <td className="p-4 text-center">
                          <p className={cn(
                            "font-black text-sm",
                            product.stock <= 0 ? "text-red-500" : 
                            product.stock <= 10 ? "text-orange-500" : "text-slate-700"
                          )}>
                            {product.stock}
                          </p>
                        </td>
                        <td className="p-4">
                          <Badge className={cn(
                            "font-black text-[9px] uppercase tracking-widest px-2 py-0.5 border-none",
                            product.is_active ? "bg-green-500 text-white" : "bg-slate-500 text-white"
                          )}>
                            {product.is_active ? "Live" : "Draft"}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button asChild variant="ghost" size="sm" className="rounded-lg font-bold uppercase text-[10px] tracking-widest hover:text-red-600">
                            <Link href={`/admin/products/${product.id}`}>Edit</Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-sm">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
