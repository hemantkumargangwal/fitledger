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
    <aside className="w-[260px] min-h-full flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800/80 shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/80">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-shadow">
            <Dumbbell className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
            FitLedger
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-l-2
                ${isActive
                  ? 'bg-amber-500/15 text-amber-400 border-l-amber-500 shadow-sm'
                  : 'border-l-transparent text-slate-400 hover:text-white hover:bg-slate-800/80'
                }
              `}
            >
              <Icon
                className="flex-shrink-0"
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
        >
          <LogOut size={20} strokeWidth={2} />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
