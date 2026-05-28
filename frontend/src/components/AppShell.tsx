import React from "react";
import { useAuth } from "../hooks/useAuth";
import { LogOut, LayoutDashboard, Users, Coffee, Receipt, ChefHat, Key, Bell, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../stores/themeStore";
import { AiAssistantWidget } from "./AiAssistantWidget";

type Props = {
  children: React.ReactNode;
  title: string;
};

export function AppShell({ children, title }: Props) {
  const { role, logout } = useAuth() as any;
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  const displayRole = role ? role.charAt(0) + role.slice(1).toLowerCase() : "Staff";

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} />, roles: ["ADMIN", "RECEPTIONIST", "WAITER", "CHEF"] },
    { label: "Rooms", path: "/rooms", icon: <Key size={18} />, roles: ["ADMIN", "RECEPTIONIST"] },
    { label: "Bookings", path: "/bookings", icon: <Receipt size={18} />, roles: ["ADMIN", "RECEPTIONIST", "WAITER"] },
    { label: "Menu", path: "/menu", icon: <Coffee size={18} />, roles: ["ADMIN", "WAITER", "CHEF"] },
    { label: "Users", path: "/admin/users", icon: <Users size={18} />, roles: ["ADMIN"] },
    { label: "Partner API", path: "/admin/partner-api", icon: <Key size={18} />, roles: ["ADMIN"] },
    { label: "Settings", path: "/settings", icon: <LayoutDashboard size={18} />, roles: ["ADMIN"] }
  ];

  const filteredNav = navItems.filter(item => !item.roles || item.roles.includes(role));

  const greeting = `Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${displayRole}`;

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shadow-md">
        <div className="p-6 flex items-center justify-center">
          <h1 className="text-2xl font-black text-primary">LRMS</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">Main</p>
          {filteredNav.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-colors duration-200 ${title === item.label ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <div className={title === item.label ? "text-primary-foreground" : "text-muted-foreground"}>{item.icon}</div>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {displayRole.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayRole} Member</p>
              <p className="text-xs text-muted-foreground truncate">{displayRole}</p>
            </div>
            <button
              onClick={() => { logout(); window.location.href = "/login"; }}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl px-2 py-1"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background relative">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-card">
          <div>
            <p className="text-sm text-primary font-medium uppercase">Property System</p>
            <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-lg font-light text-muted-foreground">{greeting}</p>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
        
        {/* Floating AI Assistant Concierge */}
        <AiAssistantWidget />
      </main>
    </div>
  );
}
