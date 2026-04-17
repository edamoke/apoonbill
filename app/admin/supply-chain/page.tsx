"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getSupplierPerformanceStats, 
  getSupplyReportByTimeframe, 
  getInventoryItems, 
  getProductWeightReport 
} from "@/app/actions/supplier-actions";
import { 
  Truck, 
  BarChart3, 
  Search, 
  Calendar, 
  Weight, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Clock,
  LayoutDashboard,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminHeader } from "@/components/admin/admin-header";
import { createClient } from "@/lib/supabase/client";

export default function SupplyChainDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [timeframeReport, setTimeframeReport] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [productWeightReport, setProductWeightReport] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<string>("daily");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(profile);
      }
    }
    getUser();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, reportData, itemsData] = await Promise.all([
          getSupplierPerformanceStats(),
          getSupplyReportByTimeframe(timeframe),
          getInventoryItems()
        ]);
        setStats(statsData);
        setTimeframeReport(reportData);
        setInventoryItems(itemsData);
        if (itemsData.length > 0) {
          setSelectedProductId(itemsData[0].id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [timeframe]);

  useEffect(() => {
    if (selectedProductId) {
      async function fetchProductReport() {
        const data = await getProductWeightReport(selectedProductId, timeframe);
        setProductWeightReport(data);
      }
      fetchProductReport();
    }
  }, [selectedProductId, timeframe]);

  const filteredStats = stats.filter(s => 
    s.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const highestSupplier = stats.length > 0 ? [...stats].sort((a, b) => b.total_spent - a.total_spent)[0] : null;
  const mostWeightSupplier = stats.length > 0 ? [...stats].sort((a, b) => b.total_weight - a.total_weight)[0] : null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {user && <AdminHeader user={user} profile={profile} />}
      
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Supply Chain Dashboard</h1>
            <p className="text-muted-foreground">Monitor supplier performance and logistics</p>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/inventory">
                <Package className="mr-2 h-4 w-4" />
                Inventory
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/suppliers/orders">
                <Package className="mr-2 h-4 w-4" />
                Manage Orders
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/suppliers">
                <Truck className="mr-2 h-4 w-4" />
                Suppliers
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/supply-chain/orders/new">
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Highest Supplier (Paid)</CardTitle>
            </CardHeader>
            <CardContent>
              {highestSupplier ? (
                <>
                  <div className="text-2xl font-bold text-primary">{highestSupplier.supplier_name}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    KES {highestSupplier.total_spent.toLocaleString()} total spent
                  </p>
                </>
              ) : (
                <div className="text-2xl font-bold">-</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Supplier (Weight)</CardTitle>
            </CardHeader>
            <CardContent>
              {mostWeightSupplier ? (
                <>
                  <div className="text-2xl font-bold text-secondary">{mostWeightSupplier.supplier_name}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mostWeightSupplier.total_weight.toLocaleString()} Kg total delivered
                  </p>
                </>
              ) : (
                <div className="text-2xl font-bold">-</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered partners</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Weight Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.length > 0 ? (stats.reduce((acc, curr) => acc + Number(curr.avg_discrepancy), 0) / stats.length).toFixed(2) : 0} Kg
              </div>
              <p className="text-xs text-muted-foreground mt-1">Deviation from ordered</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="suppliers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="suppliers">
              <Truck className="h-4 w-4 mr-2" />
              Supplier Performance
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              Brought-in Reports
            </TabsTrigger>
            <TabsTrigger value="products">
              <Weight className="h-4 w-4 mr-2" />
              Product Weight Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Supplier Performance Rankings</CardTitle>
                    <CardDescription>Search and compare suppliers by spend and weight</CardDescription>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by name..." 
                      className="pl-8" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier Name</TableHead>
                      <TableHead>Deliveries</TableHead>
                      <TableHead>Total Weight (Kg)</TableHead>
                      <TableHead>Total Paid (KES)</TableHead>
                      <TableHead>Avg Discrepancy (Kg)</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
                    ) : filteredStats.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center">No data available</TableCell></TableRow>
                    ) : (
                      filteredStats.map((s) => (
                        <TableRow key={s.supplier_id}>
                          <TableCell className="font-medium">{s.supplier_name}</TableCell>
                          <TableCell>{s.total_orders}</TableCell>
                          <TableCell>{Number(s.total_weight).toFixed(2)}</TableCell>
                          <TableCell>{Number(s.total_spent).toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={Number(s.avg_discrepancy) < 0 ? "text-red-500" : "text-green-500"}>
                              {Number(s.avg_discrepancy).toFixed(3)}
                            </span>
                          </TableCell>
                          <TableCell>{s.last_delivery ? new Date(s.last_delivery).toLocaleDateString() : 'Never'}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/admin/suppliers/${s.supplier_id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Brought-in Activity Log</CardTitle>
                    <CardDescription>Aggregate view of supplies received</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period Start</TableHead>
                      <TableHead>Orders Received</TableHead>
                      <TableHead>Total Weight (Kg)</TableHead>
                      <TableHead>Total Cost (KES)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeframeReport.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {new Date(row.period_start).toLocaleString([], { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric', 
                            hour: timeframe === 'hourly' ? '2-digit' : undefined,
                            minute: timeframe === 'hourly' ? '2-digit' : undefined
                          })}
                        </TableCell>
                        <TableCell>{row.total_orders}</TableCell>
                        <TableCell>{Number(row.total_weight).toFixed(2)}</TableCell>
                        <TableCell>{Number(row.total_spent).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {timeframeReport.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center">No reports found for this timeframe</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Specific Product Intake</CardTitle>
                    <CardDescription>Track weight trends for individual inventory items</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map(item => (
                          <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Total Weight Received</TableHead>
                      <TableHead>Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productWeightReport.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {new Date(row.period_start).toLocaleString([], { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: timeframe === 'hourly' ? '2-digit' : undefined
                          })}
                        </TableCell>
                        <TableCell className="text-primary font-bold">
                          {Number(row.total_weight).toFixed(3)} {inventoryItems.find(i => i.id === selectedProductId)?.unit || 'Kg'}
                        </TableCell>
                        <TableCell>KES {Number(row.total_cost).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {productWeightReport.length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center">No intake records for this product</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
