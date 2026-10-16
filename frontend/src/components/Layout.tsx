import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, LogOut, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-col border-r border-slate-200 bg-slate-900 p-4 dark:border-slate-700 md:flex">
        <p className="mb-6 px-3 text-sm font-bold text-white">SaaSPanel</p>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <l.icon size={16} aria-hidden />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2 border-t border-slate-700 pt-4">
          <button onClick={toggleTheme} className="sidebar-link w-full">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:bg-red-900/20">
            <LogOut size={16} aria-hidden />
            Sign out
          </button>
          <p className="px-3 pt-2 text-xs text-slate-500">{user?.username} · {user?.role}</p>
        </div>
      </aside>

      {/* Mobile top bar — the sidebar is hidden below md, so nav lives here */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-700 bg-slate-900 md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-bold text-white">SaaSPanel</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{user?.username} · {user?.role}</span>
              <button onClick={toggleTheme} className="sidebar-link px-2 py-1.5" aria-label="Toggle color theme">
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={handleLogout} className="sidebar-link px-2 py-1.5 text-red-400 hover:bg-red-900/20" aria-label="Sign out">
                <LogOut size={16} aria-hidden />
              </button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `sidebar-link shrink-0 text-xs ${isActive ? 'active' : ''}`}
              >
                <l.icon size={14} aria-hidden />
                {l.label}
              </NavLink>
            ))}
          </nav>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
