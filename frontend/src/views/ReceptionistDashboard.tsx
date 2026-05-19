import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/Skeleton";
import { AppShell } from "../components/AppShell";
import { IsometricMap } from "../components/IsometricMap";

export function ReceptionistDashboard() {
  return (
    <AppShell title="Front Desk">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card className="p-8 shadow-sm bg-white border-0 h-[600px] flex flex-col">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Live Spatial Map</h3>
          <div className="flex-1 relative bg-gray-50/50 rounded-2xl overflow-hidden inset-ring inset-ring-gray-100/50">
             <IsometricMap />
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="p-6 bg-white border-0 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h3>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Guest Name {i+1}</p>
                    <p className="text-xs text-gray-500">Room 10{i}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-md">Checking In</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

