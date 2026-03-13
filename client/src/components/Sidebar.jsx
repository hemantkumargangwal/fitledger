import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, UserPlus, DollarSign, CreditCard, FileText, Settings, LogOut, Dumbbell } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/members/add', icon: UserPlus, label: 'Add Member' },
  { to: '/payments', icon: DollarSign, label: 'Payments' },
  { to: '/payments/add', icon: CreditCard, label: 'Add Payment' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-[260px] min-h-full flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800/80 shadow-xl transition-colors duration-200">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/80">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 group transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30 group-hover:scale-105 transition-all duration-300">
            <Dumbbell className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors duration-200">
            FitLedger
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 ease-out
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
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <Link
          to="/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 ease-out"
        >
          <LogOut size={20} strokeWidth={2} />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
