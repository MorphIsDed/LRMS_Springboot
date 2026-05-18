import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login({ username, password });
      setToken(response.token);
      await fetchUser();
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md glass p-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <h2 className="text-3xl font-bold text-center mb-8 tracking-tight">LRMS Login</h2>
        {error && <p className="text-destructive text-sm mb-4 bg-destructive/10 p-3 rounded-md border border-destructive/20">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-mutedForeground">Username</label>
            <input
              type="text"
              className="block w-full px-4 py-2.5 bg-background/50 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-mutedForeground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="block w-full pl-4 pr-10 py-2.5 bg-background/50 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-mutedForeground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-md text-sm font-semibold text-primaryForeground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all mt-6"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};
