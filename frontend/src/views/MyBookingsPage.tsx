import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/Skeleton";
import { apiClient } from "../api/apiClient";
import { useToastStore } from "../stores/toastStore";
import { AppShell } from "../components/AppShell";

type Booking = {
  id: number;
  room: { roomNumber: string; type: string };
  checkIn: string;
  checkOut: string;
  status: string;
  totalRoomCharges: string;
};

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToastStore();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await apiClient.get<Booking[]>("/bookings/me");
        setBookings(res.data);
      } catch (err: any) {
        toast.push({ type: "error", message: err?.message || "Failed to load bookings" });
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [toast]);

  return (
    <AppShell title="My Bookings">
      <div className="mx-auto max-w-6xl">
        <Card className="p-6">
          <div className="text-lg font-semibold mb-4">Your Reservations</div>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
              You have no active bookings.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-4 border border-border rounded-xl flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">Room {booking.room.roomNumber} ({booking.room.type})</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {booking.checkIn} to {booking.checkOut}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${booking.status === 'RESERVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        booking.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                    <p className="mt-2 text-sm font-semibold text-foreground">₹{booking.totalRoomCharges}</p>
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

