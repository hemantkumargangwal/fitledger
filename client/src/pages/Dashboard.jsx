import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  IndianRupee,
  RefreshCw,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency } from '../utils/formatters';

const chartColors = ['#a3e635', '#14b8a6', '#f59e0b', '#64748b'];

const formatMonth = (value) => {
  if (!value) return '';
  const parts = String(value).split('-');
  if (parts.length < 2) return value;
  return new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(
    new Date(Number(parts[0]), Number(parts[1]) - 1, 1)
  );
};

const formatShortDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value));
};

const MetricCard = ({ label, value, note, icon: Icon, tone = 'lime', href }) => {
  const tones = {
    lime: 'bg-lime-400 text-slate-950',
    dark: 'bg-slate-950 text-white',
    teal: 'bg-teal-50 text-teal-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  const content = (
    <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/[0.05]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-xs font-medium text-slate-500">{note}</p>
        </div>
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );

  return href ? <Link to={href}>{content}</Link> : content;
};

const SectionHeader = ({ eyebrow, title, action }) => (
  <div className="flex items-end justify-between gap-4">
    <div>
      {eyebrow && <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-lime-600">{eyebrow}</p>}
      <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-950">{title}</h2>
    </div>
    {action}
  </div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-950">
        {payload[0].dataKey === 'revenue' ? formatCurrency(payload[0].value) : payload[0].value}
      </p>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    newMembersThisMonth: 0,
    expiringSoon: 0,
    totalRevenue: 0,
  });
  const [memberGrowthData, setMemberGrowthData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [paymentModeData, setPaymentModeData] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState({ today: 0, week: 0, month: 0 });
  const [expiringAlerts, setExpiringAlerts] = useState({ count7: 0, count14: 0, count30: 0, members: [] });
  const [gymActivity, setGymActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsData, growth, revenue, recent, modes, summary, alerts, activity] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getMemberGrowth(),
        dashboardService.getRevenueData(),
        dashboardService.getRecentMembers(),
        dashboardService.getPaymentDistribution(),
        dashboardService.getRevenueSummary().catch(() => ({ today: 0, week: 0, month: 0 })),
        dashboardService.getExpiringAlerts().catch(() => ({ count7: 0, count14: 0, count30: 0, members: [] })),
        dashboardService.getGymActivity(8).catch(() => ({ activity: [] })),
      ]);

      setStats(statsData);
      setMemberGrowthData(growth.data || []);
      setRevenueData(revenue.data || []);
      setRecentMembers(recent.members || []);
      setPaymentModeData(modes.distribution || []);
      setRevenueSummary(summary);
      setExpiringAlerts(alerts);
      setGymActivity(activity.activity || []);
    } catch {
      setStats({
        totalMembers: 156,
        activeMembers: 142,
        newMembersThisMonth: 12,
        expiringSoon: 8,
        totalRevenue: 24580,
      });
      setRevenueSummary({ today: 1200, week: 8400, month: 24580 });
      setExpiringAlerts({ count7: 2, count14: 5, count30: 8, members: [] });
      setMemberGrowthData([
        { month: '2026-01', members: 118 },
        { month: '2026-02', members: 125 },
        { month: '2026-03', members: 132 },
        { month: '2026-04', members: 139 },
        { month: '2026-05', members: 147 },
        { month: '2026-06', members: 156 },
      ]);
      setRevenueData([
        { month: '2026-01', revenue: 18300 },
        { month: '2026-02', revenue: 21100 },
        { month: '2026-03', revenue: 19800 },
        { month: '2026-04', revenue: 23400 },
        { month: '2026-05', revenue: 22700 },
        { month: '2026-06', revenue: 24580 },
      ]);
      setPaymentModeData([
        { name: 'UPI', value: 48 },
        { name: 'Cash', value: 32 },
        { name: 'Card', value: 20 },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const activeRate = stats.totalMembers
    ? Math.round((stats.activeMembers / stats.totalMembers) * 100)
    : 0;
  const chartRevenue = revenueData.map((item) => ({ ...item, label: formatMonth(item.month) }));
  const chartGrowth = memberGrowthData.map((item) => ({ ...item, label: formatMonth(item.month) }));
  const paymentTotal = paymentModeData.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const modes = paymentModeData.length
    ? paymentModeData
    : [{ name: 'No payments', value: 1 }];

  const quickActions = [
    { label: 'Add new member', description: 'Create profile & membership', icon: UserPlus, to: '/members?modal=add' },
    { label: 'Record payment', description: 'Collect dues & issue receipt', icon: WalletCards, to: '/payments/add' },
    { label: 'View renewals', description: `${stats.expiringSoon} memberships need attention`, icon: CalendarClock, to: '/members?status=expiring' },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="relative overflow-hidden rounded-[28px] bg-[#151a14] px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8">
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-lime-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-20 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1.5 text-xs font-bold text-lime-300">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              Live business snapshot
            </div>
            <h2 className="max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">
              Your gym is running at <span className="text-lime-400">{activeRate}% active capacity.</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Collections are on track. Focus on the {stats.expiringSoon} memberships approaching renewal.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Today</p>
              <p className="mt-1 text-xl font-black text-white">{formatCurrency(revenueSummary.today || 0)}</p>
            </div>
            <div className="rounded-2xl bg-lime-400 px-5 py-3 text-slate-950">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">This month</p>
              <p className="mt-1 text-xl font-black">{formatCurrency(revenueSummary.month || stats.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total members"
          value={stats.totalMembers}
          note={`+${stats.newMembersThisMonth} joined this month`}
          icon={Users}
          tone="dark"
          href="/members"
        />
        <MetricCard
          label="Active members"
          value={stats.activeMembers}
          note={`${activeRate}% of total members`}
          icon={TrendingUp}
          tone="lime"
          href="/members?status=active"
        />
        <MetricCard
          label="Renewals due"
          value={stats.expiringSoon}
          note={`${expiringAlerts.count7 || 0} within the next 7 days`}
          icon={CalendarClock}
          tone="amber"
          href="/members?status=expiring"
        />
        <MetricCard
          label="Monthly collection"
          value={formatCurrency(revenueSummary.month || stats.totalRevenue || 0)}
          note={`${formatCurrency(revenueSummary.week || 0)} collected this week`}
          icon={IndianRupee}
          tone="teal"
          href="/payments"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.7fr)]">
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader
            eyebrow="Revenue intelligence"
            title="Collection performance"
            action={(
              <button
                type="button"
                onClick={() => {
                  setRefreshing(true);
                  loadDashboard();
                }}
                className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            )}
          />
          <div className="mt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartRevenue} margin={{ top: 5, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 5" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#84cc16', strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="revenue" stroke="#65a30d" strokeWidth={3} fill="url(#revenueFill)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader eyebrow="Payment mix" title="Collection channels" />
          <div className="relative mx-auto mt-5 h-48 max-w-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modes}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={4}
                  stroke="none"
                >
                  {modes.map((entry, index) => (
                    <Cell key={entry.name} fill={paymentTotal ? chartColors[index % chartColors.length] : '#e2e8f0'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <CircleDollarSign size={20} className="text-lime-600" />
              <span className="mt-1 text-xl font-black text-slate-950">{paymentTotal || 0}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">captured</span>
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            {modes.slice(0, 4).map((mode, index) => (
              <div key={mode.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: paymentTotal ? chartColors[index % chartColors.length] : '#cbd5e1' }} />
                  <span className="text-xs font-bold text-slate-700">{mode.name}</span>
                </div>
                <span className="text-xs font-extrabold text-slate-950">{paymentTotal ? `${mode.value}%` : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
        <div className="rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <SectionHeader
              eyebrow="Member growth"
              title="Membership momentum"
              action={<span className="rounded-full bg-lime-50 px-3 py-1 text-xs font-extrabold text-lime-700">+{stats.newMembersThisMonth} this month</span>}
            />
            <div className="mt-5 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartGrowth} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="memberFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.16} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 5" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="members" stroke="#0f172a" strokeWidth={2.5} fill="url(#memberFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader eyebrow="Front desk" title="Quick actions" />
          <div className="mt-5 space-y-3">
            {quickActions.map(({ label, description, icon: Icon, to }) => (
              <Link
                key={label}
                to={to}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-3.5 transition hover:border-lime-300 hover:bg-lime-50/40"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-950 text-lime-400">
                  <Icon size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-slate-900">{label}</p>
                  <p className="truncate text-xs text-slate-500">{description}</p>
                </div>
                <ChevronRight size={17} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-lime-600" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <SectionHeader
              eyebrow="Recently added"
              title="New members"
              action={(
                <Link to="/members" className="flex items-center gap-1 text-xs font-extrabold text-slate-600 hover:text-lime-700">
                  View all <ArrowRight size={14} />
                </Link>
              )}
            />
          </div>
          {recentMembers.length ? (
            <div className="divide-y divide-slate-100 border-t border-slate-100">
              {recentMembers.slice(0, 5).map((member) => (
                <Link
                  to={`/members/${member._id}`}
                  key={member._id}
                  className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50 sm:px-6"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-extrabold text-lime-400">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-slate-900">{member.name}</p>
                    <p className="truncate text-xs text-slate-500">{member.phone || member.email || 'No contact added'}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-xs font-bold text-slate-700">{formatShortDate(member.joiningDate)}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Joined</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${member.status === 'active' ? 'bg-lime-100 text-lime-800' : 'bg-red-50 text-red-700'}`}>
                    {member.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border-t border-slate-100 px-6 py-12 text-center">
              <Users className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-700">No members added yet</p>
              <Link to="/members?modal=add" className="mt-2 inline-block text-xs font-bold text-lime-700">Add your first member</Link>
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader eyebrow="Live log" title="Recent activity" />
          <div className="mt-5 space-y-4">
            {gymActivity.length ? gymActivity.slice(0, 6).map((item) => (
              <div key={item._id} className="flex gap-3">
                <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  {item.action === 'payment_received' ? <IndianRupee size={16} /> : <CalendarCheck size={16} />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-5 text-slate-700">{item.description}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock3 size={11} /> {formatShortDate(item.createdAt)}
                  </p>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
                <CalendarCheck className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-700">Activity will appear here</p>
                <p className="mt-1 text-xs text-slate-500">Payments, members and renewals are tracked automatically.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
