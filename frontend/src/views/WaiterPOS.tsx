import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/Skeleton";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/Button";

export function WaiterPOS() {
  return (
    <AppShell title="Restaurant POS">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card className="p-6 bg-white border-0 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Menu Items</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium cursor-pointer border border-blue-100">All</span>
              <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium cursor-pointer hover:bg-gray-100 border border-transparent">Mains</span>
              <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium cursor-pointer hover:bg-gray-100 border border-transparent">Drinks</span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 flex-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer bg-gray-50/50 group flex flex-col">
                <div className="w-full h-24 bg-gray-200 rounded-xl mb-3 flex-shrink-0 group-hover:bg-blue-100 transition-colors"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Menu Item {i+1}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">Delicious description of this amazing dish.</p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="font-semibold text-gray-900 text-sm">$1{i}.99</span>
                  <button className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold hover:bg-blue-700">+</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6 bg-white border-0 shadow-sm flex flex-col h-[calc(100vh-12rem)] sticky top-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Current Order</h3>
            <span className="text-xs font-medium text-gray-500">Table 4</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-medium">1x</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Menu Item {i+1}</p>
                    <p className="text-xs text-gray-500">No onions</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">$1{i}.99</p>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>$42.97</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax (8%)</span>
              <span>$3.44</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>$46.41</span>
            </div>
            <Button className="w-full mt-4 h-12 text-base">Send to Kitchen</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

