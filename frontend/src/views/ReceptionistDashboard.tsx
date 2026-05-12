import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/Skeleton";

export function ReceptionistDashboard() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="text-lg font-semibold">Reception</div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-4">
          <div className="text-sm font-medium">Bookings</div>
          <div className="mt-3 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium">Occupancy</div>
          <div className="mt-3">
            <Skeleton className="h-56 w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}

