import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { useToastStore } from "../stores/toastStore";
import { apiClient } from "../api/apiClient";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

type Room = {
  id: number;
  roomNumber: string;
  type: string;
  capacity: number;
  pricePerNight: string;
  status: string;
};

export function GuestBookingPortal() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [type, setType] = useState("SINGLE");
  const [guests, setGuests] = useState("1");
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<number | null>(null);
  
  const toast = useToastStore();
  const { isLoggedIn, role, userId } = useAuth() as any;

  const searchRooms = async () => {
    if (!checkIn || !checkOut || !type || !guests) {
      toast.push({ type: "error", message: "Please fill all fields" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get<Room[]>(`/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}&type=${type}&guests=${guests}`);
      setRooms(res.data);
      if (res.data.length === 0) {
        toast.push({ type: "error", message: "No rooms available for these dates." });
      }
    } catch (err: any) {
      toast.push({ type: "error", message: err?.message || "Failed to fetch rooms" });
    } finally {
      setLoading(false);
    }
  };

  const bookRoom = async (roomId: number) => {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    
    setBookingLoading(roomId);
    try {
      await apiClient.post("/bookings", {
        guestId: userId,
        roomId: roomId,
        checkIn: checkIn,
        checkOut: checkOut
      });
      toast.push({ type: "success", message: "Room booked successfully!" });
      searchRooms(); // refresh availability
    } catch (err: any) {
      toast.push({ type: "error", message: err?.message || "Failed to book room" });
    } finally {
      setBookingLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden transition-colors">
      <header className="px-10 py-6 flex justify-between items-center relative z-10 border-b border-border bg-card">
        <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          LRMS <span className="font-light text-foreground/50">Guest Portal</span>
        </h1>
        <div className="flex gap-4">
          {isLoggedIn ? (
            <Button variant="ghost" onClick={() => window.location.href = '/dashboard'}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => window.location.href = '/login'}>Login</Button>
              <Button onClick={() => window.location.href = '/signup'}>Sign Up</Button>
            </>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12 relative z-10">
        <div className="text-3xl font-bold text-foreground mb-2 tracking-tight">Book Your Stay</div>
        <p className="text-muted-foreground mb-8">Experience luxury like never before.</p>
        
        <div className="mt-4 grid gap-6 md:grid-cols-[360px_1fr]">
          <Card className="p-6 bg-card border-border shadow-sm">
            <div className="text-lg font-semibold text-foreground mb-4">Search Availability</div>
            <div className="mt-3 space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Check-in</Label>
                <Input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Check-out</Label>
                <Input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Room Type</Label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  <option value="SINGLE">Single</option>
                  <option value="DOUBLE">Double</option>
                  <option value="SUITE">Suite</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Guests</Label>
                <Input type="number" min="1" value={guests} onChange={e => setGuests(e.target.value)} className="bg-input border-border text-foreground" />
              </div>
              <Button className="w-full mt-2 h-12" onClick={searchRooms} disabled={loading}>
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Check Availability"}
              </Button>
            </div>
          </Card>
          
          <Card className="p-6 bg-card border-border shadow-sm">
            <div className="text-lg font-semibold text-foreground mb-4">Available Rooms</div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.length === 0 && !loading && (
                <div className="col-span-full text-center text-muted-foreground py-10">
                  Select dates and room type to see available rooms.
                </div>
              )}
              {rooms.map((room) => (
                <div key={room.id} className="rounded-xl border border-border p-4 bg-background transition-colors flex flex-col justify-between">
                  <div>
                    <div className="w-full h-32 bg-muted rounded-lg mb-4 flex items-center justify-center text-muted-foreground">
                      {room.type}
                    </div>
                    <div className="font-semibold text-foreground">Room {room.roomNumber}</div>
                    <div className="text-sm text-muted-foreground">Capacity: {room.capacity} | ₹{room.pricePerNight}/night</div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => bookRoom(room.id)}
                    disabled={bookingLoading === room.id}
                  >
                    {bookingLoading === room.id ? <Loader2 className="animate-spin w-4 h-4" /> : "Book Now"}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

