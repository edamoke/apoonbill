"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Bell, Loader2 } from "lucide-react";
import { getInventoryAlerts, resolveInventoryAlert } from "@/app/actions/reorder-actions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function LowStockAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAlerts = async () => {
    try {
      const data = await getInventoryAlerts();
      setAlerts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    // Refresh every 5 minutes
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await resolveInventoryAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
      toast({
        title: "Success",
        description: "Alert marked as resolved",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  if (alerts.length === 0) return null;

  return (
    <Card className="p-8 border-none bg-rose-500/5 backdrop-blur-xl shadow-2xl rounded-[32px] border-l-4 border-l-rose-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <Bell className="h-5 w-5 text-rose-500" />
          Low Stock Alerts
        </h2>
        <Badge variant="destructive" className="rounded-full">{alerts.length}</Badge>
      </div>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-rose-500/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${alert.type === 'urgent_reorder' ? 'text-rose-600' : 'text-amber-500'}`} />
                <span className="font-bold text-sm uppercase">{alert.inventory_items?.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{alert.message}</p>
              <div className="text-[10px] font-medium text-rose-600">
                Current: {alert.inventory_items?.current_stock} {alert.inventory_items?.unit}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-green-500/10 hover:text-green-600"
              onClick={() => handleResolve(alert.id)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
