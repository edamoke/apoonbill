"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts"
import { Clock, TrendingUp, DollarSign, ShoppingBag, CreditCard, Wallet, Download, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const shiftSalesData = [
  { name: "Food", value: 45000 },
  { name: "Drinks", value: 28000 },
  { name: "Desserts", value: 12000 },
  { name: "Other", value: 5000 },
]

export function ShiftReportDialog({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [isEndingShift, setIsEndingShift] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <>{children}</>

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center justify-between">
             Shift Report: Morning Session
             <Badge className="bg-emerald-500">ACTIVE</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
           {/* Shift Stats KPI */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-primary/5 border-none p-4">
                 <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Total Sales</p>
                 <h3 className="text-xl font-black">KES 90,000</h3>
              </Card>
              <Card className="bg-primary/5 border-none p-4">
                 <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Transactions</p>
                 <h3 className="text-xl font-black">42</h3>
              </Card>
              <Card className="bg-primary/5 border-none p-4">
                 <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Cash in Drawer</p>
                 <h3 className="text-xl font-black">KES 15,400</h3>
              </Card>
              <Card className="bg-primary/5 border-none p-4">
                 <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">M-Pesa/Card</p>
                 <h3 className="text-xl font-black">KES 74,600</h3>
              </Card>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Breakdown */}
              <Card className="p-6">
                 <h4 className="text-sm font-black uppercase mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Payment Methods
                 </h4>
                 <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                          { name: 'Cash', val: 15400 },
                          { name: 'M-Pesa', val: 58200 },
                          { name: 'Card', val: 16400 }
                       ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="val" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </Card>

              {/* Sales by Category */}
              <Card className="p-6">
                 <h4 className="text-sm font-black uppercase mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> Sales by Category
                 </h4>
                 <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                            data={shiftSalesData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                             {shiftSalesData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </Card>
           </div>

           {/* Top Items Table */}
           <Card className="overflow-hidden">
              <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                 <h4 className="text-xs font-black uppercase">Top Performing Items (This Shift)</h4>
                 <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold">View Full List</Button>
              </div>
              <Table>
                 <TableHeader>
                    <TableRow>
                       <TableHead className="text-[10px] uppercase font-bold">Item</TableHead>
                       <TableHead className="text-[10px] uppercase font-bold text-center">Qty</TableHead>
                       <TableHead className="text-[10px] uppercase font-bold text-right">Revenue</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {[
                       { name: "Signature Burger", qty: 12, rev: 14400 },
                       { name: "Cappuccino", qty: 25, rev: 8750 },
                       { name: "Fish Thali", qty: 8, rev: 10800 },
                    ].map((item, i) => (
                       <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{item.name}</TableCell>
                          <TableCell className="text-xs text-center">{item.qty}</TableCell>
                          <TableCell className="text-xs text-right font-bold">KES {item.rev.toLocaleString()}</TableCell>
                       </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </Card>

           <div className="flex gap-3 justify-end">
              <Button variant="outline" className="rounded-xl">
                 <Download className="h-4 w-4 mr-2" /> Print Shift X-Report
              </Button>
              <Button className="rounded-xl bg-rose-600 hover:bg-rose-700" onClick={() => setIsEndingShift(true)}>
                 <Clock className="h-4 w-4 mr-2" /> End Shift (Z-Report)
              </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
   return <span className={cn("px-2 py-0.5 rounded text-[10px] font-black text-white", className)}>{children}</span>
}
