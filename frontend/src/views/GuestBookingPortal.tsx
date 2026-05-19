import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/Skeleton";
import { Button } from "../components/ui/Button";

export function GuestBookingPortal() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      
      <header className="px-10 py-6 flex justify-between items-center relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
          LUXE<span className="font-light text-white/50">RMS</span>
        </h1>
        <Button variant="ghost" className="text-white/70 hover:text-white" onClick={() => window.location.href = '/login'}>
          Staff Login
        </Button>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12 relative z-10">
        <div className="text-3xl font-bold text-white mb-2 tracking-tight">Book Your Stay</div>
        <p className="text-mutedForeground mb-8">Experience luxury like never before.</p>
        
        <div className="mt-4 grid gap-6 md:grid-cols-[360px_1fr]">
          <Card className="p-6">
            <div className="text-lg font-semibold text-white mb-4">Search Availability</div>
            <div className="mt-3 space-y-4">
              <Skeleton className="h-12 w-full rounded-xl opacity-20" />
              <Skeleton className="h-12 w-full rounded-xl opacity-20" />
              <Skeleton className="h-12 w-full rounded-xl opacity-20" />
              <Button className="w-full mt-2 h-12">Check Availability</Button>
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-lg font-semibold text-white mb-4">Available Rooms</div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="w-full h-32 bg-white/5 rounded-lg mb-4 group-hover:bg-blue-500/20 transition-colors"></div>
                  <Skeleton className="h-5 w-2/3 opacity-30" />
                  <Skeleton className="mt-3 h-4 w-1/2 opacity-20" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

