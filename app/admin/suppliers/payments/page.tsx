"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  getSupplierPayments, 
  processSupplierPayment 
} from "@/app/actions/supplier-actions";
import { 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  DollarSign, 
  Filter,
  MoreVertical,
  Receipt,
  Search
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { hasPermission } from "@/app/actions/rbac-check";

export default function SupplierPaymentsPage() {
  const supabase = createClient();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Payment Processing State
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getSupplierPayments();
      setPayments(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        redirect("/admin/sign-in");
        return;
      }
      
      const canView = await hasPermission('accounting', 'view');
      if (!canView) {
        redirect("/dashboard");
        return;
      }
      fetchPayments();
    }
    checkAccess();
  }, []);

  const handleProcessPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const paymentData = {
        status: 'paid',
        payment_method: formData.get("payment_method") as string,
        payment_reference: formData.get("payment_reference") as string,
        notes: formData.get("notes") as string,
      };

      await processSupplierPayment(selectedPayment.id, paymentData);
      
      toast({
        title: "Payment Confirmed",
        description: "Payment has been recorded and synced with accounting."
      });
      setIsProcessDialogOpen(false);
      fetchPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive"
      });
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Payments</h1>
          <p className="text-muted-foreground">Manage payables and sync with accounting</p>
        </div>
        <div className="flex gap-4">
           <Card className="flex items-center px-4 py-2 bg-blue-50 border-blue-100 shadow-none">
              <div className="mr-4 p-2 bg-blue-100 rounded-full">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-blue-600">Pending</p>
                <p className="text-xl font-black text-blue-700">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
              </div>
           </Card>
           <Card className="flex items-center px-4 py-2 bg-green-50 border-green-100 shadow-none">
              <div className="mr-4 p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-green-600">Paid (Total)</p>
                <p className="text-xl font-black text-green-700">
                  KSH {payments
                    .filter(p => p.status === 'paid')
                    .reduce((acc, p) => acc + Number(p.amount), 0)
                    .toLocaleString()}
                </p>
              </div>
           </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by supplier name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Requested</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">Loading...</TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">No payment requests found</TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm">
                      {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-bold">{payment.suppliers?.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.supply_order_id.substring(0, 8)}
                    </TableCell>
                    <TableCell className="font-black">
                      KSH {Number(payment.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          payment.status === 'paid' ? 'default' : 
                          payment.status === 'approved' ? 'secondary' : 
                          'outline'
                        }
                        className={
                          payment.status === 'pending' ? "uppercase text-[10px] text-amber-600 border-amber-200 bg-amber-50" : "uppercase text-[10px]"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status !== 'paid' ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-blue-600 text-white hover:bg-blue-700 border-none"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsProcessDialogOpen(true);
                          }}
                        >
                          Process Payment
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="text-green-600 bg-green-50 border-green-100">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Ledger Synced
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Processing Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Supplier Payment</DialogTitle>
            <DialogDescription>
              Record a payment to <strong>{selectedPayment?.suppliers?.name}</strong>. This will automatically update the accounting ledger.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Reference:</span>
                    <span className="font-mono">{selectedPayment.supply_order_id}</span>
                 </div>
                 <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">KSH {Number(selectedPayment.amount).toLocaleString()}</span>
                 </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select name="payment_method" defaultValue="mpesa">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa Business</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Petty Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transaction Reference / Invoice #</label>
                  <Input name="payment_reference" placeholder="e.g. QXJ82910" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Internal Notes</label>
                  <Input name="notes" placeholder="Optional notes for accounting" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Mark as Paid
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
