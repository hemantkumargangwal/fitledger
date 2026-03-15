import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, IndianRupee, CreditCard, FileText, Settings, LogOut, Dumbbell, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/payments', icon: IndianRupee, label: 'Payments' },
  { to: '/payments/add', icon: CreditCard, label: 'Add Payment' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ collapsed = false, onToggleCollapsed = () => {} }) => {
  const location = useLocation();

  return (
    <aside
      className={`
        min-h-full flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800/80 shadow-xl
        transition-[width] duration-300 ease-out
        w-20 max-md:w-20
        ${collapsed ? 'md:w-20' : 'md:w-[260px]'}
      `}
    >
      {/* Logo */}
      <div className="p-4 md:p-6 border-b border-slate-800/80 flex-shrink-0">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 group transition-all duration-200 overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30 group-hover:scale-105 transition-all duration-300 flex-shrink-0">
            <Dumbbell className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
          </div>
          <span
            className={`text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-all duration-200 whitespace-nowrap overflow-hidden max-md:hidden ${collapsed ? 'md:hidden' : 'md:inline'}`}
          >
            FitLedger
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 md:p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              title={label}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 ease-out
                justify-center md:justify-start
                ${isActive
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                  : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/80'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className="flex-shrink-0 transition-transform duration-200"
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`whitespace-nowrap overflow-hidden max-md:hidden ${collapsed ? 'md:hidden' : 'md:inline'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Toggle + Logout */}
      <div className="p-2 md:p-4 border-t border-slate-800/80 space-y-1 flex-shrink-0">
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="hidden md:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent transition-all duration-200 ease-out"
          aria-label={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={20} strokeWidth={2} className="flex-shrink-0" />
          ) : (
            <ChevronLeft size={20} strokeWidth={2} className="flex-shrink-0" />
          )}
          <span className={`whitespace-nowrap overflow-hidden ${collapsed ? 'hidden' : 'inline'}`}>
            {collapsed ? 'Expand' : 'Minimize'}
          </span>
        </button>
        <Link
          to="/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 ease-out justify-center md:justify-start"
          title="Logout"
        >
          <LogOut size={20} strokeWidth={2} className="flex-shrink-0" />
          <span className={`whitespace-nowrap overflow-hidden max-md:hidden ${collapsed ? 'md:hidden' : 'md:inline'}`}>
            Logout
          </span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
