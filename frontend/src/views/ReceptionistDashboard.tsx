import { Card } from "../components/ui/Card";
import { AppShell } from "../components/AppShell";
import { Users, Check, Clock } from "lucide-react";

// Sample guest data
const guests = [
  { name: "James Wilson", room: "204", status: "Checking In", statusColor: "bg-green-100 text-green-800" },
  { name: "Priya Sharma", room: "210", status: "Checked Out", statusColor: "bg-gray-100 text-gray-800" },
  { name: "Liam Chen", room: "312", status: "Reserved", statusColor: "bg-blue-100 text-blue-800" },
  { name: "Olivia Martinez", room: "418", status: "No Show", statusColor: "bg-rose-100 text-rose-800" },
  { name: "Noah Patel", room: "523", status: "Checking In", statusColor: "bg-green-100 text-green-800" }
];

export function ReceptionistDashboard() {
  return (
    <AppShell title="Front Desk">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Map placeholder */}
        <Card className="p-8 bg-white border-0 h-[600px] flex flex-col">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Live Spatial Map</h3>
          <div className="flex-1 bg-gray-50/50 rounded-2xl" />
        </Card>
        {/* Recent Bookings */}
        <div className="space-y-6">
          <Card className="p-6 bg-white border-0 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h3>
            <ul className="space-y-2">
              {guests.map((guest, i) => (
                <li key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{guest.name}</p>
                    <p className="text-xs text-gray-500">Room {guest.room}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${guest.statusColor}`}> {guest.status} </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
