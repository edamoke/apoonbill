"use client"

import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Printer, 
  Plus, 
  Trash2, 
  Wifi, 
  RefreshCw, 
  Settings2,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getPrinters, savePrinter, deletePrinter } from "@/app/actions/pos-actions"
import { getCategories } from "@/app/actions/category-actions"

export function PrinterManager() {
  const { toast } = useToast()
  const [printers, setPrinters] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPrinter, setEditingPrinter] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const emptyPrinter = {
    name: "",
    type: "receipt",
    connection_type: "network",
    interface_address: "",
    is_active: true,
    target_categories: []
  }

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [printersRes, categoriesRes] = await Promise.all([
      getPrinters(),
      getCategories()
    ])
    
    if (printersRes.success) setPrinters(printersRes.printers || [])
    if (categoriesRes.success) setCategories(categoriesRes.categories || [])
    setLoading(false)
  }

  const handleEdit = (printer: any) => {
    setEditingPrinter(printer)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingPrinter(emptyPrinter)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingPrinter.name || !editingPrinter.interface_address) {
      toast({ title: "Error", description: "Name and Address are required", variant: "destructive" })
      return
    }

    setSaving(true)
    const res = await savePrinter(editingPrinter)
    if (res.success) {
      toast({ title: "Success", description: "Printer saved successfully" })
      setIsDialogOpen(false)
      loadData()
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" })
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this printer?")) return
    
    const res = await deletePrinter(id)
    if (res.success) {
      toast({ title: "Success", description: "Printer deleted" })
      loadData()
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           <Printer className="h-5 w-5 text-primary" />
           <h3 className="text-lg font-bold uppercase tracking-tight">Connected Printers</h3>
        </div>
        <Button size="sm" onClick={handleAdd} className="rounded-xl">
           <Plus className="h-4 w-4 mr-2" /> Add Printer
        </Button>
      </div>

      <div className="border rounded-2xl overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-black text-[10px] uppercase">Name</TableHead>
              <TableHead className="font-black text-[10px] uppercase">Type</TableHead>
              <TableHead className="font-black text-[10px] uppercase">Connection</TableHead>
              <TableHead className="font-black text-[10px] uppercase">Address</TableHead>
              <TableHead className="font-black text-[10px] uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : printers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                   No printers configured.
                </TableCell>
              </TableRow>
            ) : printers.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-bold">{p.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize font-bold text-[10px]">
                    {p.type}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize text-xs">{p.connection_type}</TableCell>
                <TableCell className="font-mono text-[10px]">{p.interface_address}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="h-8 w-8 rounded-lg">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-8 w-8 rounded-lg text-rose-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic">{editingPrinter?.id ? 'Edit Printer' : 'New Printer'}</DialogTitle>
            <DialogDescription>Configure connection settings and print rules.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>Printer Name</Label>
                   <Input 
                      placeholder="e.g. Main Receipt" 
                      value={editingPrinter?.name}
                      onChange={e => setEditingPrinter({...editingPrinter, name: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <Label>Role</Label>
                   <Select 
                      value={editingPrinter?.type} 
                      onValueChange={v => setEditingPrinter({...editingPrinter, type: v})}
                   >
                      <SelectTrigger>
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="receipt">Receipt (Customer)</SelectItem>
                         <SelectItem value="kitchen">Kitchen (Food)</SelectItem>
                         <SelectItem value="bar">Bar (Drinks)</SelectItem>
                         <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>Connection</Label>
                   <Select 
                      value={editingPrinter?.connection_type} 
                      onValueChange={v => setEditingPrinter({...editingPrinter, connection_type: v})}
                   >
                      <SelectTrigger>
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="network">Network (IP)</SelectItem>
                         <SelectItem value="usb">USB</SelectItem>
                         <SelectItem value="bluetooth">Bluetooth</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <Label>Interface/Address</Label>
                   <Input 
                      placeholder="192.168.1.100" 
                      value={editingPrinter?.interface_address}
                      onChange={e => setEditingPrinter({...editingPrinter, interface_address: e.target.value})}
                   />
                </div>
             </div>

             {editingPrinter?.type !== 'receipt' && (
                <div className="space-y-2 p-4 border rounded-2xl bg-muted/20">
                   <Label className="text-xs font-black uppercase">Auto-Route Categories</Label>
                   <p className="text-[10px] text-muted-foreground mb-2">Selected categories will automatically print to this printer.</p>
                   <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                      {categories.map(cat => (
                         <div key={cat.id} className="flex items-center gap-2">
                            <input 
                               type="checkbox" 
                               id={`cat-${cat.id}`}
                               className="rounded border-gray-300"
                               checked={editingPrinter?.target_categories?.includes(cat.id)}
                               onChange={e => {
                                  const current = editingPrinter.target_categories || []
                                  const updated = e.target.checked 
                                     ? [...current, cat.id]
                                     : current.filter((id: string) => id !== cat.id)
                                  setEditingPrinter({...editingPrinter, target_categories: updated})
                               }}
                            />
                            <Label htmlFor={`cat-${cat.id}`} className="text-[11px] cursor-pointer truncate">{cat.name}</Label>
                         </div>
                      ))}
                   </div>
                </div>
             )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">CANCEL</Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-xl font-black px-8">
               {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Printer className="h-4 w-4 mr-2" />}
               SAVE PRINTER
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
