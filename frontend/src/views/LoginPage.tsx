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
    <div className="flex min-h-screen">
      {/* Branding panel */}
      <div className="w-2/5 bg-gradient-to-br from-primary to-primaryForeground flex flex-col items-center justify-center p-8 text-white">
        <h1 className="text-4xl font-black">LRMS</h1>
        <p className="mt-4 text-lg text-white/90">Your lodging & restaurant management system.</p>
      </div>
      {/* Form panel */}
      <div className="w-3/5 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched((s) => ({ ...s, username: true }))}
                hasError={!!fieldErrors.username}
                placeholder="admin"
                className="border border-gray-300 focus-visible:border-primary focus-visible:ring-primary/20"
              />
              {fieldErrors.username && <div className="text-xs text-red-600 mt-1">{fieldErrors.username}</div>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
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
                  className="pr-10 border border-gray-300 focus-visible:border-primary focus-visible:ring-primary/20"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <div className="text-xs text-red-600 mt-1">{fieldErrors.password}</div>}
            </div>
            <Button
              className="w-full mt-2 h-12 flex items-center justify-center"
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
