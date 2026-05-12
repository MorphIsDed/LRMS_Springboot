import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { PrivacyOverlay } from '../components/PrivacyOverlay';
import { LayoutDashboard, Users, Coffee, Receipt, LogOut } from 'lucide-react';
import { IsometricMap } from '../components/IsometricMap';

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <PrivacyOverlay>
      <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <div className="p-6">
            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-500">
              LUXE<span className="font-light text-gray-400">RMS</span>
            </h1>
          </div>
          
          <nav className="flex-1 px-4 space-y-1 mt-4">
            <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active />
            <NavItem icon={<Users size={18} />} label="Guests & Bookings" />
            <NavItem icon={<Coffee size={18} />} label="Restaurant POS" />
            <NavItem icon={<Receipt size={18} />} label="Folios & Billing" />
          </nav>

          <div className="p-4 border-t border-gray-50">
            <div className="flex items-center gap-3 px-2 py-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200/50">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.username || 'Staff Member'}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user?.role?.toLowerCase() || 'Guest'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
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
              <p className="text-sm font-medium text-blue-600 mb-1 tracking-wide uppercase">{getGreeting()}</p>
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Property Overview</h2>
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
            <div className="grid grid-cols-3 gap-6 mb-8 mt-2">
              <MetricCard title="Occupancy" value="84%" trend="+2% vs last week" />
              <MetricCard title="Pending Orders" value="12" alert />
              <MetricCard title="Today's RevPAR" value="$245.00" />
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 h-[600px] flex flex-col">
               <div className="flex justify-between items-center mb-8">
                 <h3 className="text-lg font-medium text-gray-900">Live Spatial Map</h3>
                 <div className="flex gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-gray-600"><span className="w-2 h-2 rounded-full bg-gray-200"></span> Available</span>
                    <span className="flex items-center gap-1.5 text-gray-600"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span> Occupied</span>
                    <span className="flex items-center gap-1.5 text-gray-600"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Service</span>
                 </div>
               </div>
               <div className="flex-1 relative bg-gray-50/50 rounded-2xl overflow-hidden inset-ring inset-ring-gray-100/50">
                  <IsometricMap />
               </div>
            </div>
          </div>
        </main>
      </div>
    </PrivacyOverlay>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) => (
  <button
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-gray-900 text-white shadow-md' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <div className={`${active ? 'text-blue-400' : 'text-gray-400'}`}>{icon}</div>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const MetricCard = ({ title, value, trend, alert }: { title: string; value: string; trend?: string; alert?: boolean }) => (
  <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow duration-300">
    {alert && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500 rounded-bl-full -mr-8 -mt-8 opacity-20 group-hover:opacity-30 transition-opacity"></div>}
    <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
    <h4 className="text-3xl font-semibold text-gray-900 tracking-tight">{value}</h4>
    {trend && <p className="text-xs font-medium text-emerald-600 mt-2 bg-emerald-50 inline-block px-2 py-1 rounded-md">{trend}</p>}
  </div>
);
