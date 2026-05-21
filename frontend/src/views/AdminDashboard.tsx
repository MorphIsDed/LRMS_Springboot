import { Card } from "../components/ui/Card";
import { AppShell } from "../components/AppShell";
import { LayoutDashboard, Users, Receipt, TrendingUp, Calendar, DollarSign } from "lucide-react";

// Mock recent activity data
const recentActivities = [
  { id: 1, desc: "Room 204 checked in", time: "2 mins ago" },
  { id: 2, desc: "New booking created for John Doe", time: "15 mins ago" },
  { id: 3, desc: "Inventory restocked: 20 bottles of wine", time: "30 mins ago" },
];

export function AdminDashboard() {
  return (
    <AppShell title="Admin Dashboard">
      {/* Metric Cards */}
      <div className="grid gap-6 lg:grid-cols-4 mb-8">
        <MetricCard
          title="Total Revenue"
          value="$12,450"
          icon={<DollarSign className="text-emerald-600" size={20} />}
          bg="bg-emerald-50"
        />
        <MetricCard
          title="Occupancy Rate"
          value="84%"
          icon={<LayoutDashboard className="text-blue-600" size={20} />}
          bg="bg-blue-50"
        />
        <MetricCard
          title="Active Staff"
          value="24"
          icon={<Users className="text-indigo-600" size={20} />}
          bg="bg-indigo-50"
        />
        <MetricCard
          title="Upcoming Events"
          value="5"
          icon={<Calendar className="text-amber-600" size={20} />}
          bg="bg-amber-50"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <button className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center">
          <TrendingUp className="mr-2" size={18} /> New Booking
        </button>
        <button className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors flex items-center justify-center">
          <Receipt className="mr-2" size={18} /> View Reports
        </button>
      </div>

      {/* Revenue Overview Card */}
      <Card className="p-6 bg-white border-0 shadow-sm mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
        {/* Simple sparkline placeholder */}
        <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center">
          <p className="text-sm text-gray-400">Revenue Chart Placeholder</p>
        </div>
      </Card>

      {/* Recent Activity Feed */}
      <Card className="p-6 bg-white border-0 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <ul className="space-y-3">
          {recentActivities.map(act => (
            <li key={act.id} className="flex justify-between text-sm text-gray-700">
              <span>{act.desc}</span>
              <span className="text-gray-500">{act.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </AppShell>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bg?: string;
}

const MetricCard = ({ title, value, icon, bg }: MetricCardProps) => (
  <Card className={`p-6 ${bg ?? "bg-white"} border-0 shadow-sm hover:shadow-md transition-all`}>
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {icon}
    </div>
    <h4 className="text-3xl font-semibold text-gray-900 tracking-tight">{value}</h4>
  </Card>
);
