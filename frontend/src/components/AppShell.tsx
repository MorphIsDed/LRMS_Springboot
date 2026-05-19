import React from "react";
import { useAuth } from "../hooks/useAuth";
import { LogOut, LayoutDashboard, Users, Coffee, Receipt, ChefHat, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  title: string;
};

export function AppShell({ children, title }: Props) {
  const { user, role, logout } = useAuth() as any; // authStore returns user details via jwt decode now implicitly handled by role/userId but we will display generic if missing.
  const navigate = useNavigate();
  
  // A quick way to get display values
  const displayRole = role ? role.charAt(0) + role.slice(1).toLowerCase() : "Staff";
  const displayUsername = "User"; // We'd ideally have this in the store, but role is enough for now.

  const getIcon = () => {
    switch (role) {
      case "ADMIN": return <LayoutDashboard size={18} />;
      case "RECEPTIONIST": return <Users size={18} />;
      case "WAITER": return <Coffee size={18} />;
      case "CHEF": return <ChefHat size={18} />;
      default: return <Receipt size={18} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-500">
            LUXE<span className="font-light text-gray-400">RMS</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {role === "ADMIN" ? (
            <>
              <button
                onClick={() => navigate("/admin")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  title === "Admin Dashboard"
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className={title === "Admin Dashboard" ? "text-blue-400" : "text-gray-400"}>
                  <LayoutDashboard size={18} />
                </div>
                <span className="text-sm font-medium">Overview</span>
              </button>

              <button
                onClick={() => navigate("/admin/partner-api")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  title === "Partner API Dashboard"
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className={title === "Partner API Dashboard" ? "text-blue-400" : "text-gray-400"}>
                  <Key size={18} />
                </div>
                <span className="text-sm font-medium">Partner API</span>
              </button>
            </>
          ) : (
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 bg-gray-900 text-white shadow-md">
              <div className="text-blue-400">{getIcon()}</div>
              <span className="text-sm font-medium">{title}</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center gap-3 px-2 py-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200/50">
              {displayRole.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{displayRole} Member</p>
              <p className="text-xs text-gray-500 truncate capitalize">{displayRole}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8f9fa] relative">
        {/* Subtle Parallax Background Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-multiply opacity-40">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-b from-blue-50 to-transparent blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-t from-indigo-50 to-transparent blur-3xl" />
        </div>

        <header className="px-10 pt-10 pb-4 flex justify-between items-end relative z-10">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1 tracking-wide uppercase">Property System</p>
            <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">{title}</h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-light text-gray-500 font-mono tracking-tighter">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm text-gray-400 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-10 relative z-10 scrollbar-hide">
          {children}
        </div>
      </main>
    </div>
  );
}
