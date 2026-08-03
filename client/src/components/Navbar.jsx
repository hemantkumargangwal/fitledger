import { CalendarDays, Menu, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const pageMeta = {
  '/dashboard': ['Overview', 'A live view of your gym business'],
  '/preview/dashboard': ['Overview', 'A live view of your gym business'],
  '/members': ['Members', 'Manage members and memberships'],
  '/memberships': ['Memberships', 'Manage plans, price, duration and PT'],
  '/workout-plans': ['Workout Plans', 'Manage workout templates and details'],
  '/diet-plans': ['Diet Plans', 'Manage diet templates and meal details'],
  '/payments': ['Payments', 'Track collections and outstanding dues'],
  '/payments/add': ['Record payment', 'Create a payment and receipt'],
  '/reports': ['Reports', 'Understand performance and cash flow'],
  '/settings': ['Settings', 'Manage your gym profile and account'],
};

const getPageMeta = (pathname) => {
  if (pageMeta[pathname]) return pageMeta[pathname];
  if (pathname.startsWith('/members/')) return ['Member profile', 'Membership, payment and activity details'];
  return ['FitLedger', 'Gym management workspace'];
};

const Navbar = ({ onOpenMobile = () => {} }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [title, subtitle] = getPageMeta(location.pathname);
  const today = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">{title}</h1>
          <p className="hidden truncate text-xs text-slate-500 sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 lg:flex">
          <CalendarDays size={15} className="text-lime-600" />
          {today}
        </div>
        <Link
          to="/payments/add"
          className="hidden min-h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 sm:inline-flex"
        >
          <Plus size={17} />
          Record payment
        </Link>
        {user && (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-sm font-extrabold text-slate-950">
              {user.name?.charAt(0).toUpperCase() ?? 'O'}
            </div>
            <div className="hidden max-w-36 text-left lg:block">
              <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
              <p className="truncate text-[11px] text-slate-500">{user.gymName ?? 'Gym owner'}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
