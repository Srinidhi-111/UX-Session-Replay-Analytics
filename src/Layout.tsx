import { NavLink, Outlet } from 'react-router-dom';
import { Activity, List, Bell, Flame, Clock } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Sessions', icon: List, end: true },
  { to: '/alerts', label: 'Rage Click Alerts', icon: Bell, end: false },
  { to: '/heatmap', label: 'Heatmap', icon: Flame, end: false },
  { to: '/timeline', label: 'Timeline', icon: Clock, end: false },
];

export function Layout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-amber-500 text-black shadow-[0_0_20px_-6px_rgba(245,158,11,0.6)]'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <div className="h-screen flex flex-col bg-bg">
      <header className="h-14 border-b border-gray-800 flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <span className="text-white font-semibold text-lg">
            Session Replay Portal
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 border-r border-gray-800 p-4 flex flex-col gap-1 shrink-0 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </aside>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}