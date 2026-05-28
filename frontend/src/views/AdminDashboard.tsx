import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { AppShell } from "../components/AppShell";
import { Skeleton } from "../components/Skeleton";
import { apiClient } from "../api/client";
import {
  Activity,
  BedDouble,
  DollarSign,
  PackageSearch,
  RefreshCw,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type OpsSummary = {
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  activeBookings: number;
  checkInsToday: number;
  checkOutsToday: number;
  openOrders: number;
  revenueToday: string; // BigDecimal serialized as string
  lowStockItems: number;
};

type CountPoint = { date: string; value: number };
type AmountPoint = { date: string; value: string };
type TopMenuItem = { name: string; quantity: number; revenue: string };
type AiSummary = { generatedAt: string; usedLlm: boolean; summaryMarkdown: string };

function money(v: string | number) {
  const n = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(n)) return "₹0.00";
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

export function AdminDashboard() {
  const [summary, setSummary] = useState<OpsSummary | null>(null);
  const [bookingsTrend, setBookingsTrend] = useState<CountPoint[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<AmountPoint[]>([]);
  const [topItems, setTopItems] = useState<TopMenuItem[]>([]);
  const [ai, setAi] = useState<AiSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const days = 14;

  const charts = useMemo(() => {
    const revenue = revenueTrend.map((p) => ({ date: p.date.slice(5), value: Number(p.value) || 0 }));
    const bookings = bookingsTrend.map((p) => ({ date: p.date.slice(5), value: p.value }));
    return { revenue, bookings };
  }, [bookingsTrend, revenueTrend]);

  const fetchAll = async () => {
    try {
      const [s, b, r, t] = await Promise.all([
        apiClient.get<OpsSummary>("/api/admin/ops-dashboard/summary"),
        apiClient.get<CountPoint[]>(`/api/admin/ops-dashboard/bookings-trend?days=${days}`),
        apiClient.get<AmountPoint[]>(`/api/admin/ops-dashboard/revenue-trend?days=${days}`),
        apiClient.get<TopMenuItem[]>("/api/admin/ops-dashboard/top-menu-items?days=30&limit=5"),
      ]);

      setSummary(s.data);
      setBookingsTrend(b.data);
      setRevenueTrend(r.data);
      setTopItems(t.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const generateAi = async () => {
    try {
      setAiLoading(true);
      const res = await apiClient.get<AiSummary>(`/api/admin/ops-dashboard/ai-summary?days=${days}`);
      setAi(res.data);
    } catch (e) {
      // keep UI stable; errors can be inspected in devtools
      console.error("Failed to generate AI summary", e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <AppShell title="Dashboard">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-500 text-sm">
            Today’s operational view across rooms, bookings, orders, and inventory.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-gray-700 hover:text-blue-600 hover:bg-gray-50 border border-gray-100 rounded-xl shadow-sm transition-all duration-200"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Metrics */}
      <div className="grid gap-6 lg:grid-cols-4 mb-8">
        <MetricCard
          title="Revenue (Today)"
          value={summary ? money(summary.revenueToday) : ""}
          icon={<DollarSign className="text-emerald-600" size={20} />}
          bg="bg-emerald-50"
          loading={loading}
        />
        <MetricCard
          title="Occupancy"
          value={summary ? `${summary.occupancyRate}%` : ""}
          subtitle={summary ? `${summary.occupiedRooms}/${summary.totalRooms} rooms` : ""}
          icon={<BedDouble className="text-blue-600" size={20} />}
          bg="bg-blue-50"
          loading={loading}
        />
        <MetricCard
          title="Open Orders"
          value={summary ? String(summary.openOrders) : ""}
          subtitle={summary ? `Check-ins: ${summary.checkInsToday} • Check-outs: ${summary.checkOutsToday}` : ""}
          icon={<UtensilsCrossed className="text-indigo-600" size={20} />}
          bg="bg-indigo-50"
          loading={loading}
        />
        <MetricCard
          title="Low Stock Items"
          value={summary ? String(summary.lowStockItems) : ""}
          subtitle={summary ? `${summary.activeBookings} active bookings` : ""}
          icon={<PackageSearch className="text-amber-600" size={20} />}
          bg="bg-amber-50"
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2 p-6 bg-white border-0 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Revenue trend (paid orders)</h3>
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-100">
              Last {days} days
            </span>
          </div>

          <div className="h-64">
            {loading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.revenue} margin={{ left: 6, right: 6, top: 6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    formatter={(v) => money(Number(v))}
                    labelClassName="text-gray-600"
                    contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#revFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Bookings Trend */}
        <Card className="lg:col-span-1 p-6 bg-white border-0 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Bookings created</h3>
            <Activity size={18} className="text-gray-400" />
          </div>
          <div className="h-64">
            {loading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.bookings} margin={{ left: 6, right: 6, top: 6, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    formatter={(v) => `${v} bookings`}
                    labelClassName="text-gray-600"
                    contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Items */}
        <Card className="lg:col-span-1 p-6 bg-white border-0 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top menu items</h3>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : topItems.length === 0 ? (
            <div className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-4">
              No sales data yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="py-2.5 px-3 text-left font-medium">Item</th>
                    <th className="py-2.5 px-3 text-right font-medium">Qty</th>
                    <th className="py-2.5 px-3 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topItems.map((i) => (
                    <tr key={i.name} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-medium text-gray-900">{i.name}</td>
                      <td className="py-2.5 px-3 text-right text-gray-600">{i.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-gray-900">{money(i.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* AI Summary */}
        <Card className="lg:col-span-2 p-6 bg-white border-0 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600" />
              <h3 className="text-lg font-medium text-gray-900">AI ops summary</h3>
              {ai?.usedLlm ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Live LLM
                </span>
              ) : ai ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 border border-gray-100">
                  Local fallback
                </span>
              ) : null}
            </div>

            <button
              onClick={generateAi}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 border border-gray-100 rounded-xl shadow-sm transition-all duration-200"
            >
              <RefreshCw size={16} className={aiLoading ? "animate-spin" : ""} />
              Generate
            </button>
          </div>

          {!ai && !aiLoading ? (
            <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 flex items-center justify-center">
              Generate a summary to highlight trends and action items.
            </div>
          ) : aiLoading ? (
            <Skeleton className="flex-1 w-full rounded-xl" />
          ) : (
            <div className="flex-1 rounded-xl border border-gray-100 bg-white p-4 overflow-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {ai?.summaryMarkdown}
              </pre>
              <p className="text-[11px] text-gray-400 mt-3">
                Generated at {ai?.generatedAt}
              </p>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bg?: string;
  subtitle?: string;
  loading?: boolean;
}

const MetricCard = ({ title, value, icon, bg, subtitle, loading }: MetricCardProps) => (
  <Card className={`p-6 ${bg ?? "bg-white"} border-0 shadow-sm hover:shadow-md transition-all`}>
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {icon}
    </div>
    {loading ? (
      <div className="space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
    ) : (
      <>
        <h4 className="text-3xl font-semibold text-gray-900 tracking-tight">{value}</h4>
        {subtitle ? <p className="text-xs text-gray-600 mt-1">{subtitle}</p> : null}
      </>
    )}
  </Card>
);
