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
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type LoginResponse = { token: string, role: string, userId: string };

function validateUsername(v: string) {
  if (!v.trim()) return "Username is required.";
  if (v.trim().length < VALIDATION_RULES.username.min) return "Username is too short.";
  return null;
}

function validatePassword(v: string) {
  if (!v) return "Password is required.";
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
  const [touched, setTouched] = useState({ username: false, password: false });

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
    <div className="flex min-h-screen bg-neutral-900 bg-[url('https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&q=80')] bg-cover bg-center">
      <div className="flex w-full min-h-screen bg-black/60 backdrop-blur-sm">
        {/* Branding panel */}
        <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl text-center"
          >
            <h1 className="text-6xl font-black mb-6 tracking-tight">LRMS</h1>
            <p className="text-xl text-white/80 leading-relaxed font-light">
              Experience the next generation of lodging and restaurant management. 
              Seamless, powerful, and intuitive.
            </p>
          </motion.div>
        </div>
        
        {/* Form panel */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md p-8 sm:p-10 bg-background/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 dark:border-white/5"
          >
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">Welcome Back</h2>
              <p className="text-muted-foreground mt-2 text-sm">Sign in to continue to your dashboard</p>
            </div>
            
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground font-medium ml-1">Username</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setTouched(s => ({ ...s, username: true }));
                  }}
                  onBlur={() => setTouched((s) => ({ ...s, username: true }))}
                  hasError={!!fieldErrors.username}
                  placeholder="username"
                  className="bg-background/50 border-border text-foreground focus-visible:ring-primary h-12 rounded-xl transition-all"
                />
                <AnimatePresence>
                  {fieldErrors.username && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="flex items-center gap-1.5 text-xs text-destructive mt-2 ml-1"
                    >
                      <AlertCircle size={14} />
                      <span>{fieldErrors.username}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                  <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">Forgot password?</a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setTouched(s => ({ ...s, password: true }));
                    }}
                    onBlur={() => setTouched((s) => ({ ...s, password: true }))}
                    hasError={!!fieldErrors.password}
                    placeholder="password"
                    className="pr-12 bg-background/50 border-border text-foreground focus-visible:ring-primary h-12 rounded-xl transition-all"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <AnimatePresence>
                  {fieldErrors.password && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="flex items-center gap-1.5 text-xs text-destructive mt-2 ml-1"
                    >
                      <AlertCircle size={14} />
                      <span>{fieldErrors.password}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <Button
                className="w-full h-14 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 mt-8"
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
            
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button type="button" onClick={() => nav("/signup")} className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Create one now
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
