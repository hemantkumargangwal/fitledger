import { ChevronLeft, ChevronRight, Dumbbell, FileText, Home, IndianRupee, LogOut, Settings, ShieldCheck, Users, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', icon: Home, label: 'Overview' },
      { to: '/members', icon: Users, label: 'Members' },
      { to: '/payments', icon: IndianRupee, label: 'Payments' },
    ],
  },
  {
    label: 'Business',
    items: [
      { to: '/reports', icon: FileText, label: 'Reports' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

const Sidebar = ({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile = () => {},
  onToggleCollapsed = () => {},
}) => {
  const location = useLocation();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          aria-label="Close navigation"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-white/10
          bg-[#10130f] text-slate-300 shadow-2xl shadow-slate-950/30 transition-all duration-300
          md:static md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'w-[84px]' : 'w-[276px]'}
        `}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5">
          <Link to="/dashboard" className="flex min-w-0 items-center gap-3" onClick={onCloseMobile}>
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-lime-400 text-slate-950 shadow-lg shadow-lime-400/15">
              <Dumbbell size={22} strokeWidth={2.6} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold tracking-tight text-white">FitLedger</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-lime-400">Gym OS</p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6" aria-label="Main navigation">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(({ to, icon: Icon, label }) => {
                  const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(`${to}/`));
                  return (
                    <Link
                      key={to}
                      to={to}
                      title={collapsed ? label : undefined}
                      onClick={onCloseMobile}
                      aria-current={isActive ? 'page' : undefined}
                      className={`
                        group relative flex min-h-11 items-center rounded-xl border px-3 text-sm font-semibold transition-all
                        ${collapsed ? 'justify-center' : 'gap-3'}
                        ${isActive
                          ? 'border-lime-400/20 bg-lime-400 text-slate-950 shadow-lg shadow-lime-400/10'
                          : 'border-transparent text-slate-400 hover:bg-white/[0.06] hover:text-white'
                        }
                      `}
                    >
                      <Icon size={19} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                      {!collapsed && <span>{label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={15} className="text-lime-400" />
              <span className="text-xs font-semibold text-white">Owner workspace</span>
            </div>
            <p className="text-xs leading-5 text-slate-500">Your gym data stays private to this workspace.</p>
          </div>
        )}

        <div className="space-y-1 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={`hidden min-h-10 w-full items-center rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-white/[0.06] hover:text-white md:flex ${collapsed ? 'justify-center' : 'gap-3'}`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
            {!collapsed && <span>Collapse menu</span>}
          </button>
          <Link
            to="/logout"
            className={`flex min-h-10 items-center rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-red-500/10 hover:text-red-300 ${collapsed ? 'justify-center' : 'gap-3'}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={19} />
            {!collapsed && <span>Logout</span>}
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
