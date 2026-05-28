import { type FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

function validateUsername(v: string) {
  if (!v.trim()) return "Username is required.";
  if (v.trim().length < VALIDATION_RULES.username.min) return "Username must be at least 3 characters.";
  return null;
}

function validateEmail(v: string) {
  if (!v.trim()) return "Email is required.";
  if (!/^\S+@\S+\.\S+$/.test(v)) return "Email is invalid.";
  return null;
}

function validatePassword(v: string) {
  if (!v) return "Password is required.";
  if (v.length < VALIDATION_RULES.password.min) return "Password must be at least 8 characters.";
  return null;
}

function validateConfirmPassword(password: string, confirm: string) {
  if (!confirm) return "Please confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

export function SignupPage() {
  const nav = useNavigate();
  const toast = useToastStore();
  const { isLoggedIn } = useAuth();
  const clearError = useErrorStore((s) => s.clearError);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const fieldErrors = useMemo(() => {
    return {
      username: touched.username ? validateUsername(username) : null,
      email: touched.email ? validateEmail(email) : null,
      password: touched.password ? validatePassword(password) : null,
      confirmPassword: touched.confirmPassword ? validateConfirmPassword(password, confirmPassword) : null
    };
  }, [username, email, password, confirmPassword, touched]);

  const canSubmit = !validateUsername(username) && !validateEmail(email) && !validatePassword(password) && !validateConfirmPassword(password, confirmPassword);

  if (isLoggedIn) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    setTouched({ username: true, email: true, password: true, confirmPassword: true });
    if (!canSubmit) return;

    setLoading(true);
    try {
      await apiClient.post("/auth/register", { 
        username, 
        email, 
        password,
        role: "GUEST" // default role for self-signup
      });
      toast.push({ type: "success", message: "Account created successfully. Please sign in." });
      nav("/login", { replace: true });
    } catch (err: any) {
      if (err?.type === "NETWORK_ERROR") {
        toast.push({ type: "error", message: "Offline." });
      } else {
        toast.push({ type: "error", message: err?.message || "Failed to create account." });
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
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">Create an Account</h2>
              <p className="text-muted-foreground mt-2 text-sm">Join us and experience the difference</p>
            </div>
            
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-1.5">
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
                      className="flex items-center gap-1.5 text-xs text-destructive mt-1 ml-1"
                    >
                      <AlertCircle size={14} />
                      <span>{fieldErrors.username}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground font-medium ml-1">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setTouched(s => ({ ...s, email: true }));
                  }}
                  onBlur={() => setTouched((s) => ({ ...s, email: true }))}
                  hasError={!!fieldErrors.email}
                  placeholder="email"
                  className="bg-background/50 border-border text-foreground focus-visible:ring-primary h-12 rounded-xl transition-all"
                />
                <AnimatePresence>
                  {fieldErrors.email && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="flex items-center gap-1.5 text-xs text-destructive mt-1 ml-1"
                    >
                      <AlertCircle size={14} />
                      <span>{fieldErrors.email}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-foreground font-medium ml-1">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
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
                      className="flex items-center gap-1.5 text-xs text-destructive mt-1 ml-1"
                    >
                      <AlertCircle size={14} />
                      <span>{fieldErrors.password}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium ml-1">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setTouched(s => ({ ...s, confirmPassword: true }));
                    }}
                    onBlur={() => setTouched((s) => ({ ...s, confirmPassword: true }))}
                    hasError={!!fieldErrors.confirmPassword}
                    placeholder="confirm password"
                    className="pr-12 bg-background/50 border-border text-foreground focus-visible:ring-primary h-12 rounded-xl transition-all"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <AnimatePresence>
                  {fieldErrors.confirmPassword && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="flex items-center gap-1.5 text-xs text-destructive mt-1 ml-1"
                    >
                      <AlertCircle size={14} />
                      <span>{fieldErrors.confirmPassword}</span>
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
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
            
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button type="button" onClick={() => nav("/login")} className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Sign in
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
