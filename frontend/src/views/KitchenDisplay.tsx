import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/Button";
import { CheckCircle2, Clock, ChefHat } from "lucide-react";
import { apiClient } from "../api/apiClient";
import { useToastStore } from "../stores/toastStore";
import { Skeleton } from "../components/Skeleton";

type OrderItem = {
  id: number;
  menuItem: { name: string; category: string };
  quantity: number;
};

type Order = {
  id: number;
  tableNumber: string | null;
  status: string;
  items: OrderItem[];
  createdAt: string;
};

export function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const toast = useToastStore();

  const fetchOrders = async () => {
    try {
      const pendingRes = await apiClient.get<Order[]>("/orders?status=PENDING");
      const preparingRes = await apiClient.get<Order[]>("/orders?status=PREPARING");
      // Combine and sort by createdAt
      const combined = [...pendingRes.data, ...preparingRes.data];
      combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setOrders(combined);
    } catch (err: any) {
      toast.push({ type: "error", message: err?.message || "Failed to load orders" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // refresh every 10s
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'PENDING' ? 'PREPARING' : 'READY';
    setUpdatingId(id);
    try {
      await apiClient.patch(`/orders/${id}/status?status=${nextStatus}`);
      toast.push({ type: "success", message: `Order marked as ${nextStatus}` });
      fetchOrders();
    } catch (err: any) {
      toast.push({ type: "error", message: err?.message || "Failed to update order" });
    } finally {
      setUpdatingId(null);
    }
  };

  const getWaitTime = (createdAt: string) => {
    const mins = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / 60000);
    return `${mins}m`;
  };

  return (
    <AppShell title="Kitchen Display System">
      <div className="mx-auto">
        {loading && orders.length === 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl">No active orders</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
            {orders.map((order) => {
              const waitMins = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
              const isUrgent = waitMins >= 15;
              
              return (
                <Card key={order.id} className={`p-5 border shadow-sm flex flex-col 
                  ${order.status === 'PREPARING' ? 'border-blue-500/30 shadow-blue-500/10' : ''}
                  ${isUrgent ? 'border-red-500/50 bg-red-50 dark:bg-red-950/20' : 'bg-card border-border'}`}>
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded 
                        ${order.tableNumber ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {order.tableNumber ? `T${order.tableNumber}` : 'ROOM'}
                      </span>
                      <span className="text-sm font-medium text-foreground">Order #{order.id}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-medium 
                      ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                      <Clock size={14} />
                      <span>{getWaitTime(order.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4 mb-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium text-foreground flex-shrink-0">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-tight">{item.menuItem.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant={order.status === 'PENDING' ? 'secondary' : isUrgent ? "destructive" : "primary"} 
                    className={`w-full ${order.status === 'PENDING' ? 'bg-background hover:bg-muted' : ''}`}
                    onClick={() => updateStatus(order.id, order.status)}
                    disabled={updatingId === order.id}
                  >
                    {updatingId === order.id ? (
                      <span className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</span>
                    ) : (
                      <span className="flex items-center">
                        <CheckCircle2 size={18} className="mr-2" />
                        {order.status === 'PENDING' ? 'Start Preparing' : 'Mark Ready'}
                      </span>
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

