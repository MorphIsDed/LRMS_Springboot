import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/Skeleton";
import { AppShell } from "../components/AppShell";

export function AdminDashboard() {
  return (
    <AppShell title="Admin Dashboard">
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <MetricCard title="Total Revenue" value="$12,450" trend="+8% this week" />
        <MetricCard title="Occupancy Rate" value="84%" trend="+2% today" />
        <MetricCard title="Active Staff" value="24" trend="All shifts covered" />
      </div>
      <Card className="p-8 shadow-sm bg-white border-0">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Revenue Overview</h3>
        <div className="h-64 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
          <p className="text-sm text-gray-400">Revenue Chart Visualization Placeholder</p>
        </div>
      </Card>
    </AppShell>
  );
}

const MetricCard = ({ title, value, trend }: { title: string; value: string; trend: string }) => (
  <Card className="p-6 bg-white border-0 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
    <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
    <h4 className="text-3xl font-semibold text-gray-900 tracking-tight">{value}</h4>
    <p className="text-xs font-medium text-emerald-600 mt-2 bg-emerald-50 inline-block px-2 py-1 rounded-md">{trend}</p>
  </Card>
);

