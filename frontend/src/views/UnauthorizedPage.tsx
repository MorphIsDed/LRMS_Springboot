import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ShieldAlert } from "lucide-react";

export function UnauthorizedPage() {
  const nav = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0B]">
      {/* Decorative background blurs */}
      <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      
      <div className="glass p-8 max-w-md w-full mx-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/20 text-destructive mb-6 shadow-lg shadow-destructive/10">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Access Denied</h1>
        <p className="text-sm text-mutedForeground mb-8">
          You don't have permission to view this page. Please contact your system administrator if you believe this is a mistake.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => nav(-1)}>Go Back</Button>
          <Button onClick={() => nav("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    </div>
  );
}
