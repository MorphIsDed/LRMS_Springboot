import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/Skeleton";

export function WaiterPOS() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="text-lg font-semibold">POS</div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-4">
          <div className="text-sm font-medium">Menu</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-md border p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium">Cart</div>
          <div className="mt-3 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

