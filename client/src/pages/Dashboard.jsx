import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, CreditCard, AlertCircle, ArrowUpRight, ArrowDownRight, Calendar, IndianRupee, Activity, PieChart as PieChartIcon, RefreshCw, UserPlus, CalendarClock, AlertTriangle, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency } from '../utils/formatters';
import { ERROR_MESSAGES } from '../utils/constants';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    newMembersThisMonth: 0,
    expiringSoon: 0,
    totalRevenue: 0
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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, growthData, revenueData, recentMembersData, paymentDist, revSummary, alerts, activity] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getMemberGrowth(),
        dashboardService.getRevenueData(),
        dashboardService.getRecentMembers(),
        dashboardService.getPaymentDistribution(),
        dashboardService.getRevenueSummary().catch(() => ({ today: 0, week: 0, month: 0 })),
        dashboardService.getExpiringAlerts().catch(() => ({ count7: 0, count14: 0, count30: 0, members: [] })),
        dashboardService.getGymActivity(15).catch(() => ({ activity: [] }))
      ]);

      setStats(statsData);
      setMemberGrowthData(growthData.data || []);
      setRevenueData(revenueData.data || []);
      setRevenueSummary(revSummary);
      setExpiringAlerts(alerts);
      setGymActivity(activity.activity || []);
      setPaymentModeData(
        (paymentDist.distribution && paymentDist.distribution.length > 0)
          ? paymentDist.distribution
          : [{ name: 'No payments yet', value: 100, color: '#e2e8f0' }]
      );
      setRecentMembers(recentMembersData.members);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(ERROR_MESSAGES.NETWORK_ERROR);
      
      // Show error toast
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Loading Error',
          message: ERROR_MESSAGES.NETWORK_ERROR,
          duration: 5000
        });
      }
      
      // Set mock data for demo purposes if API fails
      setMockData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const setMockData = () => {
    // Mock data for demonstration
    setStats({
      totalMembers: 156,
      activeMembers: 142,
      newMembersThisMonth: 12,
      expiringSoon: 8,
      totalRevenue: 24580
    });
    setRevenueSummary({ today: 1200, week: 8400, month: 24580 });
    setExpiringAlerts({ count7: 2, count14: 5, count30: 8, members: [] });
    setGymActivity([]);

    setMemberGrowthData([
      { month: 'Jan', members: 120 },
      { month: 'Feb', members: 128 },
      { month: 'Mar', members: 135 },
      { month: 'Apr', members: 142 },
      { month: 'May', members: 148 },
      { month: 'Jun', members: 156 }
    ]);

    setRevenueData([
      { month: 'Jan', revenue: 3800 },
      { month: 'Feb', revenue: 4100 },
      { month: 'Mar', revenue: 3900 },
      { month: 'Apr', revenue: 4200 },
      { month: 'May', revenue: 4300 },
      { month: 'Jun', revenue: 4280 }
    ]);

    setPaymentModeData([
      { name: 'Cash', value: 45, color: '#10b981' },
      { name: 'Card', value: 30, color: '#3b82f6' },
      { name: 'UPI', value: 25, color: '#8b5cf6' }
    ]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'badge-success' : 'badge-danger';
  };

  const getGrowthIndicator = (current, previous) => {
    if (!previous) return null;
    const growth = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive: growth >= 0,
      icon: growth >= 0 ? ArrowUpRight : ArrowDownRight
    };
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Format chart month for display (e.g. "2024-01" -> "Jan")
  const formatChartMonth = (monthStr) => {
    if (!monthStr) return '';
    const parts = String(monthStr).split('-');
    if (parts.length >= 2) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const m = parseInt(parts[1], 10);
      return monthNames[m - 1] || monthStr;
    }
    return monthStr;
  };
  const memberGrowthChartData = memberGrowthData.map((d) => ({ ...d, monthLabel: formatChartMonth(d.month) }));
  const revenueChartData = revenueData.map((d) => ({ ...d, monthLabel: formatChartMonth(d.month) }));

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Calculate growth indicators (mock data for demo)
  const memberGrowth = getGrowthIndicator(stats.totalMembers, stats.totalMembers - 15);
  const revenueGrowth = getGrowthIndicator(stats.totalRevenue, stats.totalRevenue - 2000);
  const hasPaymentDistribution = paymentModeData.some((d) => d.value > 0 && d.name !== 'No payments yet');

  return (
    <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back! Here&apos;s what&apos;s happening with your gym today.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating...' : 'Refresh'}
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
              <Calendar className="w-4 h-4" />
              Last 30 days
            </button>
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              View Reports
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 animate-slide-down">
            <Alert
              type="error"
              title="Data Loading Issue"
              message={error}
              dismissible
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Analytics Widgets: New members, Expiring, Revenue summary */}
        <section className="mb-8" aria-labelledby="analytics-widgets-heading">
          <h2 id="analytics-widgets-heading" className="sr-only">Analytics overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform duration-300">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">New members this month</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.newMembersThisMonth ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                    <CalendarClock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Expiring memberships</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.expiringSoon ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Revenue (this month)</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(revenueSummary.month ?? 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Revenue summary cards: Today, This week, This month */}
        <section className="mb-8" aria-labelledby="revenue-summary-heading">
          <h2 id="revenue-summary-heading" className="text-lg font-semibold text-slate-800 mb-4">Daily &amp; period revenue</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <p className="text-sm font-medium text-slate-500">Today</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(revenueSummary.today ?? 0)}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <p className="text-sm font-medium text-slate-500">This week</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(revenueSummary.week ?? 0)}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <p className="text-sm font-medium text-slate-500">This month</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(revenueSummary.month ?? 0)}</p>
            </div>
          </div>
        </section>

        {/* Expiring membership alerts banner */}
        {(expiringAlerts.count7 > 0 || expiringAlerts.count14 > 0) && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-4" role="alert">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">Expiring membership alerts</p>
                <p className="text-sm text-amber-800">
                  {expiringAlerts.count7 > 0 && `${expiringAlerts.count7} in next 7 days`}
                  {expiringAlerts.count7 > 0 && expiringAlerts.count14 > 0 && ' • '}
                  {expiringAlerts.count14 > 0 && `${expiringAlerts.count14} in next 14 days`}
                </p>
              </div>
            </div>
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-sm font-medium transition-colors"
            >
              View expiring list
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 ease-out animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-500">Total Members</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalMembers}</p>
                  {memberGrowth && (() => {
                    const GrowthIcon = memberGrowth.icon;
                    return (
                      <div className={`flex items-center mt-2 text-sm ${
                        memberGrowth.isPositive ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        <GrowthIcon className="w-4 h-4 mr-1 group-hover:animate-bounce-soft" />
                        {memberGrowth.value}% from last month
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 ease-out animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-500">Active Members</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats.activeMembers}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Activity rate</span>
                      <span>{stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-gradient-to-r from-success-500 to-success-600 group-hover:shadow-glow transition-all duration-300"
                        style={{ width: `${stats.totalMembers > 0 ? (stats.activeMembers / stats.totalMembers) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 ease-out animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-500">Expiring Soon</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats.expiringSoon}</p>
                  <div className="mt-2">
                    <span className={`badge-warning group-hover:animate-pulse-soft ${
                      stats.expiringSoon > 0 ? 'animate-shake' : ''
                    }`}>
                      {stats.expiringSoon > 0 ? 'Action needed' : 'All good'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 ease-out animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
                  <IndianRupee className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-500">Revenue (30 days)</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(stats.totalRevenue)}</p>
                  {revenueGrowth && (() => {
                    const GrowthIcon = revenueGrowth.icon;
                    return (
                      <div className={`flex items-center mt-2 text-sm ${
                        revenueGrowth.isPositive ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        <GrowthIcon className="w-4 h-4 mr-1 group-hover:animate-bounce-soft" />
                        {revenueGrowth.value}% from last month
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Member Growth Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 ease-out">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Member Growth</h3>
                <p className="text-sm text-slate-500">New members over time</p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={memberGrowthChartData}>
                <defs>
                  <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="monthLabel"
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="members" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#memberGradient)"
                  name="Members"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 ease-out">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Revenue Trend</h3>
                <p className="text-sm text-slate-500">Monthly revenue performance</p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <IndianRupee className="w-3 h-3 mr-1" />
                +8.2%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="monthLabel"
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Mode Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 ease-out">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Payment method distribution</h3>
                <p className="text-sm text-slate-500">Last 30 days by mode</p>
              </div>
              <PieChartIcon className="w-5 h-5 text-slate-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentModeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={hasPaymentDistribution ? CustomPieLabel : ({ name }) => (name === 'No payments yet' ? name : null)}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentModeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value}%${props.payload.amount != null ? ` (${formatCurrency(props.payload.amount)})` : ''}`,
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {paymentModeData.map((mode, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: mode.color }}
                      aria-hidden
                    />
                    <span className="text-sm text-slate-600">{mode.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{mode.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800">Avg. Member Value</h4>
                <IndianRupee className="w-5 h-5 text-violet-500" />
              </div>
              <div className="text-xl font-bold text-slate-800">
                {formatCurrency(stats.totalMembers > 0 ? stats.totalRevenue / stats.totalMembers : 0)}
              </div>
              <p className="text-sm text-slate-500 mt-1">Per member revenue</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800">Monthly Growth</h4>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-slate-800">
                +{memberGrowth ? memberGrowth.value : '0'}%
              </div>
              <p className="text-sm text-slate-500 mt-1">Member acquisition rate</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800">Retention Rate</h4>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-slate-800">
                {stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%
              </div>
              <p className="text-sm text-slate-500 mt-1">Active member ratio</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800">Renewal Alert</h4>
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-slate-800">{stats.expiringSoon}</div>
              <p className="text-sm text-slate-500 mt-1">Members expiring soon</p>
            </div>
          </div>
        </div>

        {/* Recent Members */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 ease-out">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Recent Members</h3>
                <p className="text-sm text-slate-500">Latest additions to your gym</p>
              </div>
              <Link to="/members" className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200">
                View all
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="divide-y divide-gray-100">
                  {recentMembers.map((member, index) => (
                    <div key={member._id} className="py-4 hover:bg-slate-50/80 transition-colors duration-150 ease-out rounded-xl px-3 -mx-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-slate-900 font-semibold text-sm">
                              <span>
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${
                              member.status === 'active' ? 'bg-success-500' : 'bg-danger-500'
                            }`}></div>
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">{member.name}</div>
                            <div className="text-sm text-slate-500">{member.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{member.phone}</div>
                            <div className="text-xs text-gray-500">Contact</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{formatDate(member.joiningDate)}</div>
                            <div className="text-xs text-gray-500">Joined</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              new Date(member.expiryDate) < new Date() ? 'text-danger-600' : 'text-gray-900'
                            }`}>
                              {formatDate(member.expiryDate)}
                            </div>
                            <div className="text-xs text-gray-500">Expires</div>
                          </div>
                          <div>
                            <span className={getStatusColor(member.status)}>
                              {member.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {recentMembers.length === 0 && (
                  <EmptyState
                    icon={Users}
                    title="No members yet"
                    description="Start by adding your first gym member to see them here."
                    action={
                      <Link
                        to="/members?modal=add"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <Users className="w-4 h-4" />
                        Add Member
                      </Link>
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expiring member list widget + Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Expiring soon</h3>
                <Link to="/reports" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</Link>
              </div>
              <p className="text-sm text-slate-500 mb-4">Memberships expiring in the next 30 days</p>
              {expiringAlerts.members && expiringAlerts.members.length > 0 ? (
                <ul className="space-y-3">
                  {expiringAlerts.members.slice(0, 5).map((m) => (
                    <li key={m._id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <Link to={`/members/${m._id}`} className="font-medium text-slate-800 hover:text-primary-600">
                        {m.name}
                      </Link>
                      <span className="text-sm text-slate-500">{formatDate(m.expiryDate)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 py-4">No members expiring in the next 30 days.</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-slate-500" />
                <h3 className="text-lg font-semibold text-slate-800">Recent activity</h3>
              </div>
              {gymActivity.length > 0 ? (
                <ul className="space-y-3 max-h-64 overflow-y-auto">
                  {gymActivity.slice(0, 10).map((log) => (
                    <li key={log._id} className="flex gap-3 py-2 border-b border-slate-100 last:border-0 text-sm">
                      <span className="text-slate-400 flex-shrink-0">{formatDate(log.createdAt)}</span>
                      <span className="text-slate-700">
                        {log.memberId ? log.memberId.name : 'Member'}: {log.description || log.action}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 py-4">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
