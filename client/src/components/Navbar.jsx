import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/members/add': 'Add Member',
  '/payments': 'Payments',
  '/payments/add': 'Add Payment',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const title = pageTitles[location.pathname] ?? 'FitLedger';

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {location.pathname === '/dashboard' && (
          <p className="text-sm text-slate-500 mt-0.5">Here&apos;s what&apos;s happening today</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-semibold text-sm">
              {user.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.gymName ?? 'Gym'}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
