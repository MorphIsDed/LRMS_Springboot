import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/Skeleton";

export function KitchenDisplay() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="text-lg font-semibold">Kitchen</div>
      <Card className="mt-4 p-4">
        <div className="text-sm font-medium">Orders</div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-md border p-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-2 h-4 w-2/3" />
              <Skeleton className="mt-3 h-8 w-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

