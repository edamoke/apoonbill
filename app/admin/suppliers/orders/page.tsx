"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getSupplyOrders, updateSupplyOrderStatus, getSupplyOrderWithItems } from "@/app/actions/supplier-actions";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Scale, PackageCheck, AlertCircle } from "lucide-react";

export default function SupplyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deliveryWeight, setDeliveryWeight] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const data = await getSupplyOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReceive(order: any) {
    try {
      const fullOrder = await getSupplyOrderWithItems(order.id);
      setSelectedOrder(fullOrder);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  async function confirmDelivery() {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      await updateSupplyOrderStatus(
        selectedOrder.id, 
        'delivered', 
        undefined, 
        deliveryWeight ? parseFloat(deliveryWeight) : undefined,
        invoiceNumber
      );
      toast({ title: "Success", description: "Delivery recorded and stock updated" });
      fetchOrders();
      setSelectedOrder(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Supply Orders</h1>
          <p className="text-muted-foreground">Track purchases and receive deliveries</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expected Weight</TableHead>
                <TableHead>Actual Weight</TableHead>
                <TableHead>Discrepancy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">Loading...</TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">No supply orders found</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{format(new Date(order.created_at), "PPP")}</TableCell>
                    <TableCell className="font-medium">{order.suppliers?.name}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.ordered_weight || 0} kg</TableCell>
                    <TableCell>{order.delivery_weight || '-'} kg</TableCell>
                    <TableCell>
                      {order.weight_discrepancy ? (
                        <span className={order.weight_discrepancy < 0 ? "text-destructive" : "text-green-600"}>
                          {order.weight_discrepancy > 0 ? "+" : ""}{order.weight_discrepancy} kg
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status === 'pending' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => handleReceive(order)}>
                              <PackageCheck className="mr-2 h-4 w-4" />
                              Receive
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-xl">
                            <DialogHeader>
                              <DialogTitle>Receive Delivery - {order.suppliers?.name}</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4 py-4">
                                <div className="border rounded-md p-4 bg-muted/50">
                                  <h4 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Ordered Items</h4>
                                  <ul className="space-y-2">
                                    {selectedOrder.supply_order_items?.map((item: any) => (
                                      <li key={item.id} className="flex justify-between text-sm">
                                        <span>{item.inventory_items?.name}</span>
                                        <span className="font-medium">{item.quantity} {item.inventory_items?.unit}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Expected Weight (Total kg)</Label>
                                    <Input value={selectedOrder.ordered_weight || 0} disabled />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Actual Delivered Weight (kg)</Label>
                                    <div className="relative">
                                      <Scale className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                      <Input 
                                        placeholder="Enter weight" 
                                        className="pl-9"
                                        type="number"
                                        step="0.001"
                                        value={deliveryWeight}
                                        onChange={(e) => setDeliveryWeight(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Invoice / Delivery Note Number</Label>
                                  <Input 
                                    placeholder="Enter reference number"
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                  />
                                </div>
                                {deliveryWeight && selectedOrder.ordered_weight && (
                                  <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 text-amber-800 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>
                                      Discrepancy: {(parseFloat(deliveryWeight) - selectedOrder.ordered_weight).toFixed(3)} kg
                                    </span>
                                  </div>
                                )}
                                <Button className="w-full" onClick={confirmDelivery} disabled={isUpdating}>
                                  {isUpdating ? "Processing..." : "Confirm & Update Stock"}
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
