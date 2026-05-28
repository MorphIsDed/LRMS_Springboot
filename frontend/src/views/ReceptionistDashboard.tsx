import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/Button";
import { apiClient } from "../api/apiClient";
import { useToastStore } from "../stores/toastStore";
import { Loader2, Check, LogOut as CheckOutIcon } from "lucide-react";
import { Skeleton } from "../components/Skeleton";

type Booking = {
  id: number;
  guest: { username: string; email: string };
  room: { roomNumber: string; type: string };
  checkIn: string;
  checkOut: string;
  status: string;
  totalRoomCharges: string;
};

export function ReceptionistDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const toast = useToastStore();

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get<any>("/bookings?page=0&size=50");
      setBookings(res.data.content);
    } catch (err: any) {
      toast.push({ type: "error", message: err?.message || "Failed to load bookings" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (id: number, action: 'check-in' | 'checkout') => {
    setActionLoading(id);
    try {
      await apiClient.patch(`/bookings/${id}/${action}`);
      toast.push({ type: "success", message: `Successfully ${action === 'check-in' ? 'checked in' : 'checked out'}` });
      fetchBookings();
    } catch (err: any) {
      toast.push({ type: "error", message: err?.message || `Failed to ${action}` });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AppShell title="Front Desk">
      <div className="mx-auto max-w-5xl">
        <Card className="p-6 bg-card border-border shadow-sm">
          <h3 className="text-lg font-medium text-foreground mb-4">Today's Bookings</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
              No bookings found.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-4 border border-border rounded-xl bg-background hover:bg-muted/50 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-foreground text-lg">{booking.guest.username}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${booking.status === 'RESERVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          booking.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                      >
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Room {booking.room.roomNumber} ({booking.room.type})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.checkIn} to {booking.checkOut}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    {booking.status === 'RESERVED' && (
                      <Button 
                        onClick={() => handleAction(booking.id, 'check-in')}
                        disabled={actionLoading === booking.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {actionLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                        Check In
                      </Button>
                    )}
                    {booking.status === 'CHECKED_IN' && (
                      <Button 
                        onClick={() => handleAction(booking.id, 'checkout')}
                        disabled={actionLoading === booking.id}
                        variant="secondary"
                      >
                        {actionLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckOutIcon className="w-4 h-4 mr-2" />}
                        Check Out
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
