import { useEffect, useState, useMemo } from "react";
import { Card } from "../components/ui/Card";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { apiClient } from "../api/apiClient";
import { useToastStore } from "../stores/toastStore";
import { Loader2 } from "lucide-react";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
};

type OrderItem = {
  menuItem: MenuItem;
  quantity: number;
};

export function WaiterPOS() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [submitting, setSubmitting] = useState(false);
  
  const toast = useToastStore();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const res = await apiClient.get<MenuItem[]>("/menu-items?available=true");
        setMenuItems(res.data);
      } catch (err: any) {
        toast.push({ type: "error", message: "Failed to load menu items" });
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, [toast]);

  const filteredMenu = useMemo(() => {
    if (categoryFilter === "ALL") return menuItems;
    return menuItems.filter(m => m.category === categoryFilter);
  }, [menuItems, categoryFilter]);

  const categories = ["ALL", ...Array.from(new Set(menuItems.map(m => m.category)))];

  const addToOrder = (item: MenuItem) => {
    setOrderItems(prev => {
      const existing = prev.find(p => p.menuItem.id === item.id);
      if (existing) {
        return prev.map(p => p.menuItem.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromOrder = (itemId: number) => {
    setOrderItems(prev => {
      const existing = prev.find(p => p.menuItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(p => p.menuItem.id === itemId ? { ...p, quantity: p.quantity - 1 } : p);
      }
      return prev.filter(p => p.menuItem.id !== itemId);
    });
  };

  const subtotal = orderItems.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const submitOrder = async () => {
    if (orderItems.length === 0) {
      toast.push({ type: "error", message: "Order is empty" });
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post("/orders", {
        bookingId: bookingId ? parseInt(bookingId) : null,
        tableNumber: tableNumber || null,
        paymentMode: paymentMode,
        items: orderItems.map(item => ({
          itemId: item.menuItem.id,
          quantity: item.quantity
        }))
      });
      toast.push({ type: "success", message: "Order placed successfully!" });
      setOrderItems([]);
      setTableNumber("");
      setBookingId("");
    } catch (err: any) {
      toast.push({ type: "error", message: err?.message || "Failed to place order" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Restaurant POS">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card className="p-6 bg-card border-border shadow-sm flex flex-col min-h-[500px]">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h3 className="text-lg font-medium text-foreground">Menu Items</h3>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <span 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer border transition-colors
                    ${categoryFilter === cat 
                      ? 'bg-primary/10 text-primary border-primary/20' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 border-transparent'}`}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 flex-1 auto-rows-max">
              {filteredMenu.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => addToOrder(item)}
                  className="rounded-2xl border border-border p-4 hover:shadow-md transition-shadow cursor-pointer bg-background hover:bg-muted/50 flex flex-col group"
                >
                  <div className="w-full h-24 bg-muted rounded-xl mb-3 flex-shrink-0 flex items-center justify-center text-muted-foreground">
                    {item.category}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                    <span className="font-semibold text-foreground text-sm">₹{item.price}</span>
                    <button className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold group-hover:bg-primary/90">+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        
        <Card className="p-6 bg-card border-border shadow-sm flex flex-col h-[calc(100vh-12rem)] sticky top-6">
          <div className="mb-4 space-y-3">
            <div className="flex gap-3">
              <Input 
                placeholder="Table #" 
                value={tableNumber} 
                onChange={e => setTableNumber(e.target.value)}
                className="bg-input border-border text-foreground"
              />
              <Input 
                placeholder="Booking ID (Room Charge)" 
                value={bookingId} 
                onChange={e => setBookingId(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <select 
              value={paymentMode} 
              onChange={e => setPaymentMode(e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <option value="CASH">Cash</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="ROOM_CHARGE">Room Charge</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
            <h3 className="text-lg font-medium text-foreground">Current Order</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
            {orderItems.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-10">Select items to add to order</div>
            )}
            {orderItems.map((item) => (
              <div key={item.menuItem.id} className="flex justify-between items-start">
                <div className="flex gap-3">
                  <button 
                    onClick={() => removeFromOrder(item.menuItem.id)}
                    className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    -
                  </button>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.quantity}x {item.menuItem.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.menuItem.price}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground">₹{item.menuItem.price * item.quantity}</p>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax (8%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-foreground pt-2 border-t border-border">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full mt-4 h-12 text-base" 
              onClick={submitOrder}
              disabled={orderItems.length === 0 || submitting}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Send Order
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

