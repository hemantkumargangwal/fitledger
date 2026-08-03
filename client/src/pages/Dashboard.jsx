import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarClock,
  IndianRupee,
  PieChart as PieChartIcon,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Legend,
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

const palette = ['#65a30d', '#0891b2', '#f59e0b', '#475569', '#dc2626', '#7c3aed'];

const emptyOverview = {
  cards: {
    visits: { today: 0, yesterday: 0, last7Days: 0 },
    popularMembership: { name: 'No membership assigned', durationMonths: 0, members: 0 },
    expenses: { today: 0, thisMonth: 0, lastMonth: 0 },
    members: { total: 0, newThisMonth: 0, newLastMonth: 0 },
    memberLost: { thisMonth: 0, lastMonth: 0, total: 0 },
    profit: { today: 0, thisMonth: 0, lastMonth: 0 },
  },
  charts: {
    expense: [],
    income: [],
    enquiry: [],
    paymentDue: [],
    genderDistribution: [],
    memberLost: [],
    newMembers: [],
    renewals: [],
  },
};

const money = (value) => formatCurrency(Number(value || 0));
const number = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0));

const StatBlock = ({ label, value, isMoney = false, suffix = '' }) => (
  <div className="min-w-0 rounded-2xl bg-slate-50 px-4 py-3">
    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    <p className="mt-1 break-words text-xl font-black tracking-tight text-slate-950" title={String(value || '')}>
      {isMoney ? money(value) : typeof value === 'number' ? `${number(value)}${suffix}` : value || '-'}
    </p>
  </div>
);

const OwnerCard = ({ title, icon: Icon, tone = 'bg-slate-950 text-white', children }) => (
  <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
    <div className="mb-4 flex items-center gap-3">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={18} strokeWidth={2.4} />
      </div>
      <h2 className="text-sm font-black tracking-tight text-slate-950">{title}</h2>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">{children}</div>
  </article>
);

const ChartShell = ({ title, icon: Icon, children }) => (
  <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
    <div className="mb-4 flex items-center gap-2">
      <Icon size={17} className="text-slate-500" />
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
    </div>
    <div className="h-64">{children}</div>
  </section>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      {payload.map((item) => {
        const isMoney = /income|expense|due/i.test(item.name || '');
        return <p key={item.dataKey || item.name} className="mt-1 text-sm font-extrabold text-slate-950">
          {item.name}: {isMoney ? money(item.value) : number(item.value)}
        </p>;
      })}
    </div>
  );
};

const lineChart = (data, color, name) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
      <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 5" vertical={false} />
      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} />
      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
      <Tooltip content={<ChartTooltip />} />
      <Line type="monotone" dataKey="value" name={name} stroke={color} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
    </LineChart>
  </ResponsiveContainer>
);

const Dashboard = () => {
  const [overview, setOverview] = useState(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getOwnerOverview();
      setOverview({
        cards: { ...emptyOverview.cards, ...(data.cards || {}) },
        charts: { ...emptyOverview.charts, ...(data.charts || {}) },
      });
    } catch {
      setOverview(emptyOverview);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const cards = overview.cards;
  const charts = overview.charts;
  const incomeExpenseTrend = useMemo(() => {
    const expenses = new Map((charts.expense || []).map((item) => [item.month, item.value]));
    return (charts.income || []).map((item) => ({
      ...item,
      income: item.value,
      expense: expenses.get(item.month) || 0,
    }));
  }, [charts.expense, charts.income]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl bg-[#11140f] px-5 py-5 text-white shadow-xl shadow-slate-950/10 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-lime-400">Owner dashboard</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Gym business overview</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Visits, memberships, expenses, members, lost members, profit, and trend charts in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRefreshing(true);
            loadDashboard();
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 text-sm font-extrabold text-slate-950 transition hover:bg-lime-300"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <OwnerCard title="Visits" icon={Activity} tone="bg-lime-400 text-slate-950">
          <StatBlock label="Today" value={cards.visits.today} />
          <StatBlock label="Yesterday" value={cards.visits.yesterday} />
          <StatBlock label="7 days" value={cards.visits.last7Days} />
        </OwnerCard>

        <OwnerCard title="Popular Membership" icon={CalendarClock} tone="bg-cyan-50 text-cyan-700">
          <StatBlock label="Name" value={cards.popularMembership.name} />
          <StatBlock label="Duration" value={cards.popularMembership.durationMonths} suffix=" mo" />
          <StatBlock label="Used by members" value={cards.popularMembership.members} />
        </OwnerCard>

        <OwnerCard title="Expenses" icon={TrendingDown} tone="bg-red-50 text-red-700">
          <StatBlock label="Today" value={cards.expenses.today} isMoney />
          <StatBlock label="This month" value={cards.expenses.thisMonth} isMoney />
          <StatBlock label="Last month" value={cards.expenses.lastMonth} isMoney />
        </OwnerCard>

        <OwnerCard title="Members" icon={Users} tone="bg-slate-950 text-white">
          <StatBlock label="Total" value={cards.members.total} />
          <StatBlock label="New month" value={cards.members.newThisMonth} />
          <StatBlock label="Last month" value={cards.members.newLastMonth} />
        </OwnerCard>

        <OwnerCard title="Member Lost" icon={UserMinus} tone="bg-amber-50 text-amber-700">
          <StatBlock label="This month" value={cards.memberLost.thisMonth} />
          <StatBlock label="Last month" value={cards.memberLost.lastMonth} />
          <StatBlock label="Total not renewed" value={cards.memberLost.total} />
        </OwnerCard>

        <OwnerCard title="Profit" icon={IndianRupee} tone="bg-teal-50 text-teal-700">
          <StatBlock label="Today" value={cards.profit.today} isMoney />
          <StatBlock label="This month" value={cards.profit.thisMonth} isMoney />
          <StatBlock label="Last month" value={cards.profit.lastMonth} isMoney />
        </OwnerCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartShell title="Income and Expense Trend" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={incomeExpenseTrend} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#65a30d" stopOpacity={0.26} />
                  <stop offset="95%" stopColor="#65a30d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 5" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#65a30d" strokeWidth={3} fill="url(#incomeFill)" />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#dc2626" strokeWidth={2.5} fill="url(#expenseFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartShell>

        <ChartShell title="Enquiry Trend" icon={Activity}>
          {lineChart(charts.enquiry, '#0891b2', 'Enquiries')}
        </ChartShell>

        <ChartShell title="Payment Due Trend" icon={CalendarClock}>
          {lineChart(charts.paymentDue, '#f59e0b', 'Due')}
        </ChartShell>

        <ChartShell title="Gender Distribution" icon={PieChartIcon}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={charts.genderDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={4}>
                {charts.genderDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartShell>

        <ChartShell title="Member Lost Trend" icon={UserMinus}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.memberLost} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 5" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Lost" fill="#dc2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>

        <ChartShell title="New Members and Renewals" icon={UserPlus}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={(charts.newMembers || []).map((item, index) => ({
                ...item,
                newMembers: item.value,
                renewals: charts.renewals?.[index]?.value || 0,
              }))}
              margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
            >
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 5" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="newMembers" name="New" fill="#65a30d" radius={[6, 6, 0, 0]} />
              <Bar dataKey="renewals" name="Renew" fill="#0891b2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>
      </section>
    </div>
  );
};

export default Dashboard;
