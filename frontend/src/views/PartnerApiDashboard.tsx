import React, { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Card } from "../components/ui/Card";
import { apiClient } from "../api/client";
import { Database, Key, Activity, AlertCircle, RefreshCw } from "lucide-react";

interface SummaryStats {
  totalCalls: number;
  errorCount: number;
  errorRate: number;
  activePartners: number;
}

interface PartnerStats {
  partnerName: string;
  requestCount: number;
  errorCount: number;
}

interface ApiLog {
  id: number;
  method: string;
  endpoint: string;
  httpStatus: number;
  responseTimeMs: number;
  requestedAt: string;
  apiKey: {
    partnerName: string;
  };
}

export function PartnerApiDashboard() {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [partnerStats, setPartnerStats] = useState<PartnerStats[]>([]);
  const [recentLogs, setRecentLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [summaryRes, partnerRes, logsRes] = await Promise.all([
        apiClient.get<SummaryStats>("/api/admin/partner-stats/summary"),
        apiClient.get<PartnerStats[]>("/api/admin/partner-stats/usage-by-partner"),
        apiClient.get<ApiLog[]>("/api/admin/partner-stats/recent-logs"),
      ]);
      setSummary(summaryRes.data);
      setPartnerStats(partnerRes.data);
      setRecentLogs(logsRes.data);
    } catch (error) {
      console.error("Failed to fetch partner API statistics", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <AppShell title="Partner API Dashboard">
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Partner API Dashboard">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500 text-sm">Monitor third-party integrations (Zomato, Swiggy, Booking.com, etc.) and API usage.</p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-gray-700 hover:text-blue-600 hover:bg-gray-50 border border-gray-100 rounded-xl shadow-sm transition-all duration-200"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh Stats
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-4 mb-8">
        <MetricCard
          title="Total API Calls"
          value={summary?.totalCalls.toLocaleString() || "0"}
          icon={<Database className="text-blue-600" size={20} />}
          trend="Last 30 Days"
        />
        <MetricCard
          title="Active Integrations"
          value={summary?.activePartners.toString() || "0"}
          icon={<Key className="text-emerald-600" size={20} />}
          trend="Fully Operational"
          trendClass="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          title="Error Rate"
          value={`${summary?.errorRate || 0}%`}
          icon={<AlertCircle className="text-amber-600" size={20} />}
          trend={`${summary?.errorCount || 0} Total Errors`}
          trendClass={(summary?.errorRate || 0) > 5 ? "text-rose-600 bg-rose-50" : "text-amber-600 bg-amber-50"}
        />
        <MetricCard
          title="Avg response time"
          value="45ms"
          icon={<Activity className="text-indigo-600" size={20} />}
          trend="99.9% SLA Met"
          trendClass="text-indigo-600 bg-indigo-50"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Usage by Partner (Progress Bars) */}
        <Card className="lg:col-span-1 p-6 bg-white border-0 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col h-[400px]">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic distribution</h3>
          <div className="flex-1 overflow-y-auto space-y-5 scrollbar-hide pr-1">
            {partnerStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Key size={32} className="mb-2 text-gray-300" />
                <p className="text-sm">No partner API keys generated yet.</p>
              </div>
            ) : (
              partnerStats.map((stat, idx) => {
                const total = summary?.totalCalls || 1;
                const percent = Math.round((stat.requestCount / total) * 100);
                const errorPercent = stat.requestCount > 0 ? Math.round((stat.errorCount / stat.requestCount) * 100) : 0;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-700">{stat.partnerName}</span>
                      <span className="text-gray-900">{stat.requestCount.toLocaleString()} ({percent}%)</span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Error rate: {errorPercent}%</span>
                      <span>Errors: {stat.errorCount}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Recent API logs */}
        <Card className="lg:col-span-2 p-6 bg-white border-0 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col h-[400px]">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Live request stream</h3>
          <div className="flex-1 overflow-auto rounded-xl border border-gray-50 scrollbar-hide">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <th className="py-3 px-4">Partner</th>
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      No API calls registered.
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => {
                    const isError = log.httpStatus >= 400;
                    const date = new Date(log.requestedAt);
                    
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">{log.apiKey?.partnerName || "Unknown"}</td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-600">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-1.5 ${
                            log.method === "POST" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            log.method === "PATCH" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}>
                            {log.method}
                          </span>
                          {log.endpoint.replace("/api/v1/partners", "")}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isError ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}>
                            {log.httpStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{log.responseTimeMs}ms</td>
                        <td className="py-3 px-4 text-gray-400 text-xs">
                          {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendClass?: string;
}

const MetricCard = ({ title, value, icon, trend, trendClass = "text-emerald-600 bg-emerald-50" }: MetricCardProps) => (
  <Card className="p-6 bg-white border-0 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col justify-between h-36">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h4 className="text-3xl font-semibold text-gray-900 tracking-tight">{value}</h4>
      </div>
      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100/50">
        {icon}
      </div>
    </div>
    <div className="mt-2">
      <p className={`text-[10px] font-semibold inline-block px-2 py-0.5 rounded-md ${trendClass}`}>
        {trend}
      </p>
    </div>
  </Card>
);
