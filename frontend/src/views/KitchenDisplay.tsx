import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/Skeleton";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/Button";
import { CheckCircle2, Clock } from "lucide-react";

export function KitchenDisplay() {
  return (
    <AppShell title="Kitchen Display System">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className={`p-5 border-0 shadow-sm flex flex-col ${i === 0 ? 'bg-red-50/50' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${i === 0 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>T{i + 1}</span>
                <span className="text-sm font-medium text-gray-900">Order #{1042 + i}</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${i === 0 ? 'text-red-600' : 'text-gray-500'}`}>
                <Clock size={14} />
                <span>{i === 0 ? '14m ago' : `${2 + i}m ago`}</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4 mb-6">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700 flex-shrink-0">2x</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Wagyu Burger</p>
                  <p className="text-xs text-red-600 mt-1 font-medium bg-red-50 inline-block px-1.5 py-0.5 rounded">NO ONIONS</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700 flex-shrink-0">1x</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Truffle Fries</p>
                </div>
              </div>
            </div>
            
            <Button variant={i === 0 ? "destructive" : "primary"} className="w-full">
              <CheckCircle2 size={18} className="mr-2" />
              Mark Ready
            </Button>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

