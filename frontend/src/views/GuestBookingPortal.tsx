import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/Skeleton";

export function GuestBookingPortal() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="text-lg font-semibold">Booking Portal</div>
      <div className="mt-4 grid gap-4 md:grid-cols-[360px_1fr]">
        <Card className="p-4">
          <div className="text-sm font-medium">Search Availability</div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium">Available Rooms</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-md border p-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

