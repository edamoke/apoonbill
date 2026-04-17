"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Search, Filter, Download, PieChart as PieIcon, BarChart3, LineChart as LineIcon, FileText, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

const mockStockData = [
  { id: 1, name: "Basmati Rice", category: "Dry Goods", supplier: "Kenya Grains", stock: 150, unit: "kg", value: 12000, lastUpdated: "2025-12-30" },
  { id: 2, name: "Olive Oil", category: "Pantry", supplier: "Global Foods", stock: 45, unit: "L", value: 45000, lastUpdated: "2025-12-29" },
  { id: 3, name: "Chicken Breast", category: "Meat", supplier: "Farmer Choice", stock: 22, unit: "kg", value: 18000, lastUpdated: "2025-12-30" },
  { id: 4, name: "Fresh Milk", category: "Dairy", supplier: "Brookside", stock: 60, unit: "L", value: 6000, lastUpdated: "2025-12-30" },
  { id: 5, name: "Tomatoes", category: "Produce", supplier: "Local Market", stock: 15, unit: "kg", value: 3000, lastUpdated: "2025-12-30" },
]

export function StockCountDialog({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<'table' | 'graph'>('table')
  const [graphType, setGraphType] = useState<'bar' | 'pie' | 'line'>('bar')
  const [isMaximized, setIsMaximized] = useState(false)
  
  // Resizable state
  const [width, setWidth] = useState(1152) // max-w-6xl (72rem)
  const [height, setHeight] = useState(800)
  const [isResizing, setIsResizing] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || isMaximized) return
      
      const newWidth = Math.max(400, e.clientX - (dialogRef.current?.getBoundingClientRect().left || 0))
      const newHeight = Math.max(300, e.clientY - (dialogRef.current?.getBoundingClientRect().top || 0))
      
      setWidth(newWidth)
      setHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, isMaximized])

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent 
        ref={dialogRef}
        className={cn(
          "bg-card text-foreground overflow-y-auto transition-all duration-300 group",
          isMaximized ? "max-w-[100vw] w-screen h-screen max-h-screen rounded-none" : "rounded-3xl"
        )}
        style={!isMaximized ? { width: `${width}px`, height: `${height}px`, maxWidth: '95vw', maxHeight: '95vh' } : {}}
      >
        {!isMaximized && (
          <>
            {/* Resize Handles */}
            <div 
              className="absolute right-0 top-0 w-2 h-full cursor-ew-resize hover:bg-primary/20 transition-colors z-50"
              onMouseDown={startResizing}
            />
            <div 
              className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-primary/20 transition-colors z-50"
              onMouseDown={startResizing}
            />
            <div 
              className="absolute right-0 bottom-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1 z-50"
              onMouseDown={startResizing}
            >
               <div className="w-2 h-2 border-r-2 border-b-2 border-primary/40 rounded-br-sm" />
            </div>
          </>
        )}
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center justify-between">
             <div className="flex items-center gap-4">
                Advanced Stock Count & Inventory Analytics
                <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary"
                   onClick={() => setIsMaximized(!isMaximized)}
                >
                   {isMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>
             </div>
             <div className="flex items-center gap-2 px-4">
                <Button variant={view === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setView('table')}>
                   <FileText className="h-4 w-4 mr-2" /> Report View
                </Button>
                <Button variant={view === 'graph' ? 'default' : 'outline'} size="sm" onClick={() => setView('graph')}>
                   <BarChart3 className="h-4 w-4 mr-2" /> Graph View
                </Button>
             </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Filters Bar - 8 Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 bg-muted/30 p-4 rounded-2xl border">
             <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black">Search Item</Label>
                <Input placeholder="Name..." className="h-8 text-xs" />
             </div>
             <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black">Category</Label>
                <Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Categories</SelectItem></SelectContent></Select>
             </div>
             <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black">Supplier</Label>
                <Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Suppliers</SelectItem></SelectContent></Select>
             </div>
             <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black">Stock Level</Label>
                <Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent><SelectItem value="low">Low Stock</SelectItem><SelectItem value="ok">In Stock</SelectItem></SelectContent></Select>
             </div>
             <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black">Date From</Label>
                <Input type="date" className="h-8 text-xs" />
             </div>
             <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black">Date To</Label>
                <Input type="date" className="h-8 text-xs" />
             </div>
             <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black">Storage</Label>
                <Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Zone" /></SelectTrigger>
                <SelectContent><SelectItem value="main">Main Store</SelectItem><SelectItem value="kitchen">Kitchen</SelectItem></SelectContent></Select>
             </div>
             <div className="flex items-end">
                <Button size="sm" className="w-full h-8 bg-primary/20 text-primary hover:bg-primary/30">
                   <Filter className="h-3 w-3 mr-1" /> Apply
                </Button>
             </div>
          </div>

          {view === 'table' ? (
            <div className="border rounded-2xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-black uppercase text-[10px]">Item Name</TableHead>
                    <TableHead className="font-black uppercase text-[10px]">Category</TableHead>
                    <TableHead className="font-black uppercase text-[10px]">Supplier</TableHead>
                    <TableHead className="font-black uppercase text-[10px]">Current Stock</TableHead>
                    <TableHead className="font-black uppercase text-[10px]">Unit Value</TableHead>
                    <TableHead className="font-black uppercase text-[10px]">Total Value</TableHead>
                    <TableHead className="font-black uppercase text-[10px]">Last Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStockData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-bold">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell className="font-mono">{item.stock} {item.unit}</TableCell>
                      <TableCell>KES {(item.value / item.stock).toFixed(2)}</TableCell>
                      <TableCell className="font-black">KES {item.value.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="flex gap-2">
                  <Button variant={graphType === 'bar' ? 'default' : 'outline'} size="sm" onClick={() => setGraphType('bar')}><BarChart3 className="h-4 w-4 mr-1" /> Bars</Button>
                  <Button variant={graphType === 'pie' ? 'default' : 'outline'} size="sm" onClick={() => setGraphType('pie')}><PieIcon className="h-4 w-4 mr-1" /> Pie</Button>
                  <Button variant={graphType === 'line' ? 'default' : 'outline'} size="sm" onClick={() => setGraphType('line')}><LineIcon className="h-4 w-4 mr-1" /> Trend</Button>
               </div>

               <Card className="p-6 h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                     {graphType === 'bar' ? (
                       <BarChart data={mockStockData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="stock" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                       </BarChart>
                     ) : graphType === 'pie' ? (
                        <PieChart>
                           <Pie
                             data={mockStockData}
                             innerRadius={60}
                             outerRadius={120}
                             paddingAngle={5}
                             dataKey="value"
                             nameKey="name"
                             label
                           >
                             {mockStockData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <Tooltip />
                        </PieChart>
                     ) : (
                        <LineChart data={mockStockData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} />
                        </LineChart>
                     )}
                  </ResponsiveContainer>
               </Card>
            </div>
          )}

          <div className="flex justify-between items-center">
             <div className="text-sm font-medium">
                Showing <span className="font-bold">5</span> of 128 items tracked in inventory.
             </div>
             <Button variant="outline" className="rounded-xl border-2 font-bold px-6">
                <Download className="h-4 w-4 mr-2" /> Export to PDF/Excel
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
