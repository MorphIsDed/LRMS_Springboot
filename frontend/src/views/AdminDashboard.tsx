import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/Skeleton";

export function AdminDashboard() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="text-lg font-semibold">Admin</div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-3 h-10 w-1/2" />
          </Card>
        ))}
      </div>
      <Card className="mt-4 p-4">
        <div className="text-sm font-medium">Revenue</div>
        <div className="mt-3">
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    </div>
  );
}

