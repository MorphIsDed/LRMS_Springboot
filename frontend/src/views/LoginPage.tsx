import { type FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../api/apiClient";
import { useAuth } from "../hooks/useAuth";
import { useToastStore } from "../stores/toastStore";
import { useErrorStore } from "../stores/errorStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { VALIDATION_RULES } from "../constants/validation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type LoginResponse = { token: string, role: string, userId: string };

function validateUsername(v: string) {
  if (!v.trim()) return "Username is required.";
  if (v.trim().length < VALIDATION_RULES.username.min) return "Username is too short.";
  return null;
}

function validatePassword(v: string) {
  if (!v) return "Password is required.";
  if (v.length < VALIDATION_RULES.password.min) return "Password is too short.";
  return null;
}

export function LoginPage() {
  const nav = useNavigate();
  const location = useLocation() as any;
  const toast = useToastStore();
  const { isLoggedIn, setToken } = useAuth();
  const clearError = useErrorStore((s) => s.clearError);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ username: boolean; password: boolean }>({
    username: false,
    password: false
  });

  const fieldErrors = useMemo(() => {
    return {
      username: touched.username ? validateUsername(username) : null,
      password: touched.password ? validatePassword(password) : null
    };
  }, [password, touched.password, touched.username, username]);

  const canSubmit = !validateUsername(username) && !validatePassword(password);

  if (isLoggedIn) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    setTouched({ username: true, password: true });
    if (!canSubmit) return;

    setLoading(true);
    try {
      const res = await apiClient.post<LoginResponse>("/auth/login", { username, password });
      setToken(res.data.token, res.data.role, res.data.userId);
      toast.push({ type: "success", message: "Successfully logged in." });
      const to = location.state?.from ?? "/dashboard";
      nav(to, { replace: true });
    } catch (err: any) {
      if (err?.type === "AUTH_ERROR" && err.status === 401) {
        toast.push({ type: "error", message: "Invalid credentials." });
      } else if (err?.type === "NETWORK_ERROR") {
        toast.push({ type: "error", message: "Offline." });
      } else {
        toast.push({ type: "error", message: "Server error." });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0B]">
      {/* Decorative background blurs */}
      <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none mix-blend-screen" />
      
      <div className="relative w-full max-w-md px-6 py-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25 mb-6">
            <span className="text-2xl font-black text-white tracking-tighter">L</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-mutedForeground">Enter your credentials to access LRMS</p>
        </div>

        <div className="glass p-8">
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-mutedForeground">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched((s) => ({ ...s, username: true }))}
                hasError={!!fieldErrors.username}
                placeholder="admin"
                className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus-visible:border-blue-500/50"
              />
              {fieldErrors.username ? <div className="text-xs text-destructive mt-1">{fieldErrors.username}</div> : null}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-mutedForeground">Password</Label>
                <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((s) => ({ ...s, password: true }))}
                  hasError={!!fieldErrors.password}
                  placeholder="••••••••"
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus-visible:border-blue-500/50 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white/80 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password ? <div className="text-xs text-destructive mt-1">{fieldErrors.password}</div> : null}
            </div>

            <Button 
              className="w-full mt-2 h-12 text-base shadow-lg shadow-blue-500/20" 
              disabled={!canSubmit || loading} 
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
