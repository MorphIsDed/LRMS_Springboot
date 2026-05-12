import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/Skeleton";

export function MyBookingsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="text-lg font-semibold">My Bookings</div>
      <Card className="mt-4 p-4">
        <div className="text-sm font-medium">Bookings</div>
        <div className="mt-3 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}

