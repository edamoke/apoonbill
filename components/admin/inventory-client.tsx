"use client";

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Scale, 
  TrendingDown, 
  TrendingUp, 
  Warehouse,
  History,
  ArrowRightLeft,
  Filter,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function formatInventoryValue(val: number, unit: string) {
  const v = Number(val);
  if (unit === 'g' && v >= 1000) {
    return `${(v / 1000).toFixed(2)} kg`;
  }
  if (unit === 'ml' && v >= 1000) {
    return `${(v / 1000).toFixed(2)} l`;
  }
  return `${v.toFixed(2)} ${unit}`;
}

export default function InventoryClient({ 
  user, 
  profile, 
  initialInventoryItems 
}: { 
  user: any, 
  profile: any, 
  initialInventoryItems: any[] 
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockStatusFilter, setStockStatusFilter] = useState("all")
  const [prepStatusFilter, setPrepStatusFilter] = useState("all")
  const [unitFilter, setUnitFilter] = useState("all")
  const [valueRangeFilter, setValueRangeFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("name-asc")
  const [items, setItems] = useState(initialInventoryItems)

  const categories = Array.from(new Set(initialInventoryItems.map(i => i.category))).filter(Boolean)
  const units = Array.from(new Set(initialInventoryItems.map(i => i.unit))).filter(Boolean)

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesUnit = unitFilter === "all" || item.unit === unitFilter
    
    const isLow = (item.current_stock || 0) <= (item.reorder_level || 0)
    const matchesStockStatus = stockStatusFilter === "all" || 
      (stockStatusFilter === "low" && isLow) || 
      (stockStatusFilter === "healthy" && !isLow)
    
    const matchesPrepStatus = prepStatusFilter === "all" || 
      (prepStatusFilter === "prep" && item.is_prepared_item) || 
      (prepStatusFilter === "raw" && !item.is_prepared_item)

    const itemValue = (item.current_stock || 0) * (item.unit_cost || 0)
    const matchesValueRange = valueRangeFilter === "all" ||
      (valueRangeFilter === "high" && itemValue > 10000) ||
      (valueRangeFilter === "medium" && itemValue <= 10000 && itemValue > 1000) ||
      (valueRangeFilter === "low" && itemValue <= 1000)

    return matchesSearch && matchesCategory && matchesStockStatus && matchesPrepStatus && matchesUnit && matchesValueRange
  }).sort((a, b) => {
    switch(sortOrder) {
      case "name-asc": return a.name.localeCompare(b.name)
      case "name-desc": return b.name.localeCompare(a.name)
      case "stock-asc": return (a.current_stock || 0) - (b.current_stock || 0)
      case "stock-desc": return (b.current_stock || 0) - (a.current_stock || 0)
      case "value-desc": return ((b.current_stock || 0) * (b.unit_cost || 0)) - ((a.current_stock || 0) * (a.unit_cost || 0))
      default: return 0
    }
  })

  const lowStockItems = items.filter(item => (item.current_stock || 0) <= (item.reorder_level || 0))
  const totalValue = items.reduce((acc, item) => acc + (Number(item.current_stock) * Number(item.unit_cost)), 0)

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <div className="p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Warehouse className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">Stock & Inventory</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Enterprise-grade real-time resource tracking
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="lg" className="border-2">
              <Link href="/admin/inventory/recipes">
                <ArrowRightLeft className="mr-2 h-5 w-5 text-blue-600" />
                Manage Recipes
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2">
              <Link href="/admin/suppliers/orders">
                <Scale className="mr-2 h-5 w-5 text-purple-600" />
                Receive Stock
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">
              <Link href="/admin/inventory/new">
                <Plus className="mr-2 h-5 w-5" />
                Add New Ingredient
              </Link>
            </Button>
          </div>
        </div>

        {/* World-Class Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                Total Ingredients
                <Package className="h-4 w-4 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{items.length}</div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">Active items in catalog</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-white to-red-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                Critical Alerts
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-red-600">{lowStockItems.length}</div>
              <Progress value={(lowStockItems.length / (items.length || 1)) * 100} className="h-1.5 mt-2 bg-slate-100" />
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                Prepared Bases
                <History className="h-4 w-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-blue-700">
                {items.filter(i => i.is_prepared_item).length}
              </div>
              <p className="text-[10px] text-blue-600/80 mt-1 font-bold">In-house prep items</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                Asset Value
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-green-700">
                {totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-green-600/80 mt-1 font-bold uppercase tracking-wider">KSH Total Valuation</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters Section */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search name..." 
                    className="pl-8 h-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stock Status</label>
                <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="healthy">Healthy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Type</label>
                <Select value={prepStatusFilter} onValueChange={setPrepStatusFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="prep">Prepared</SelectItem>
                    <SelectItem value="raw">Raw Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Unit</label>
                <Select value={unitFilter} onValueChange={setUnitFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    {units.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Value</label>
                <Select value={valueRangeFilter} onValueChange={setValueRangeFilter}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Any Value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Value</SelectItem>
                    <SelectItem value="high">{"High (>10k)"}</SelectItem>
                    <SelectItem value="medium">Medium (1k-10k)</SelectItem>
                    <SelectItem value="low">{"Low (<1k)"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{filteredItems.length} items found</span>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sort By:</span>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="h-8 w-[150px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="stock-asc">Stock (Low-High)</SelectItem>
                      <SelectItem value="stock-desc">Stock (High-Low)</SelectItem>
                      <SelectItem value="value-desc">Value (High-Low)</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory List */}
        <Card className="border-none shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b">
                    <th className="px-8 py-4 w-1/3">Item Details</th>
                    <th className="px-6 py-4">Stock Level</th>
                    <th className="px-6 py-4">Safety Buffer</th>
                    <th className="px-6 py-4">Last Cost (KSH)</th>
                    <th className="px-6 py-4">Financial Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const stockPercent = Math.min(100, (Number(item.current_stock) / (Number(item.reorder_level) * 3)) * 100)
                    const isLow = (item.current_stock || 0) <= (item.reorder_level || 0)

                    return (
                      <tr key={item.id} className="group hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg",
                              isLow ? "bg-red-100 text-red-700 shadow-sm" : "bg-slate-100 text-slate-700"
                            )}>
                              {item.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                                  {item.category}
                                </span>
                                {item.is_prepared_item && (
                                  <Badge variant="secondary" className="text-[9px] h-4 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">PREP</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1.5">
                            <p className={cn("text-sm font-black font-mono", isLow ? "text-red-600" : "text-slate-800")}>
                              {formatInventoryValue(item.current_stock, item.unit)}
                            </p>
                            <Progress value={stockPercent} className={cn(
                              "h-1.5 w-24", 
                              isLow ? "bg-red-100 text-red-600" : "bg-slate-100"
                            )} />
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                            {formatInventoryValue(item.reorder_level, item.unit)}
                          </div>
                        </td>
                        <td className="px-6 py-5 font-mono text-sm font-bold text-slate-700">
                          {Number(item.unit_cost).toLocaleString()}
                        </td>
                        <td className="px-6 py-5">
                          {isLow ? (
                            <div className="flex items-center gap-1.5 text-red-600">
                              <TrendingDown className="h-4 w-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Buy Now</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <TrendingUp className="h-4 w-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Healthy</span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Button asChild variant="outline" size="sm" className="h-8 gap-2 px-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                            <Link href={`/admin/inventory/${item.id}`}>
                              <Eye className="h-3.5 w-3.5" />
                              Details
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredItems.length === 0 && (
                <div className="px-8 py-20 text-center">
                  <Warehouse className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No inventory items matching your filters.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
