import { type FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../api/apiClient";
import { useAuth } from "../hooks/useAuth";
import { useToastStore } from "../stores/toastStore";
import { useErrorStore } from "../stores/errorStore";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { VALIDATION_RULES } from "../constants/validation";

type LoginResponse = { token: string };

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
      setToken(res.data.token);
      toast.push({ type: "success", message: "Logged in." });
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
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
      <Card className="w-full p-6">
        <div className="text-lg font-semibold">Login</div>
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setTouched((s) => ({ ...s, username: true }))}
              hasError={!!fieldErrors.username}
              placeholder="Enter username"
            />
            {fieldErrors.username ? <div className="text-sm text-red-600">{fieldErrors.username}</div> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((s) => ({ ...s, password: true }))}
              hasError={!!fieldErrors.password}
              placeholder="Enter password"
            />
            {fieldErrors.password ? <div className="text-sm text-red-600">{fieldErrors.password}</div> : null}
          </div>
          <Button className="w-full" disabled={!canSubmit || loading} type="submit">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
