import clsx from 'clsx';

const tones = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  expired: 'bg-red-50 text-red-700 ring-red-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  frozen: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  warning: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  inactive: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-500/20',
};

const StatusBadge = ({ tone = 'neutral', children, className }) => (
  <span className={clsx(
    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset',
    tones[tone] || tones.neutral,
    className
  )}>
    {children}
  </span>
);

export default StatusBadge;
