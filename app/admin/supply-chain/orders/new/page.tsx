"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { getSuppliers, getInventoryItems } from "@/app/actions/supplier-actions";
import { createManualSupplyOrder } from "@/app/actions/reorder-actions";
import { useToast } from "@/hooks/use-toast";

export default function NewSupplyOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [supplierId, setSupplierId] = useState("");
  const [orderItems, setOrderItems] = useState<{ inventory_item_id: string; quantity: number; unit_cost: number }[]>([
    { inventory_item_id: "", quantity: 1, unit_cost: 0 }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const [suppliersData, itemsData] = await Promise.all([
          getSuppliers(),
          getInventoryItems()
        ]);
        setSuppliers(suppliersData);
        setInventoryItems(itemsData);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load suppliers or inventory items",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  const addItem = () => {
    setOrderItems([...orderItems, { inventory_item_id: "", quantity: 1, unit_cost: 0 }]);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill unit cost if inventory item is selected
    if (field === "inventory_item_id") {
      const item = inventoryItems.find(ii => ii.id === value);
      if (item && item.last_unit_cost) {
        newItems[index].unit_cost = item.last_unit_cost;
      }
    }
    
    setOrderItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast({ title: "Error", description: "Please select a supplier", variant: "destructive" });
      return;
    }
    if (orderItems.some(item => !item.inventory_item_id || item.quantity <= 0)) {
      toast({ title: "Error", description: "Please fill in all item details correctly", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await createManualSupplyOrder(supplierId, orderItems);
      toast({ title: "Success", description: "Supply order created successfully" });
      router.push("/admin/supply-chain");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/supply-chain">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manual Purchase Order</h1>
          <p className="text-muted-foreground">Create a backup supply order manually</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Select supplier and add items to order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.category})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-end border p-4 rounded-lg relative">
                  <div className="flex-1 space-y-2">
                    <Label>Inventory Item</Label>
                    <Select 
                      value={item.inventory_item_id} 
                      onValueChange={(val) => updateItem(index, "inventory_item_id", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map(ii => (
                          <SelectItem key={ii.id} value={ii.id}>
                            {ii.name} ({ii.current_stock} {ii.unit} in stock)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-24 space-y-2">
                    <Label>Quantity</Label>
                    <Input 
                      type="number" 
                      min="0.01" 
                      step="0.01"
                      value={item.quantity} 
                      onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="w-32 space-y-2">
                    <Label>Unit Cost</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01"
                      value={item.unit_cost} 
                      onChange={(e) => updateItem(index, "unit_cost", parseFloat(e.target.value))}
                    />
                  </div>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => removeItem(index)}
                    disabled={orderItems.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-lg font-bold">
                Total Estimate: KES {orderItems.reduce((acc, item) => acc + (item.quantity * item.unit_cost), 0).toLocaleString()}
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Purchase Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
