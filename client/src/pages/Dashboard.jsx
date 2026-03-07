import { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import { Users, TrendingUp, CreditCard, AlertCircle, ArrowUpRight, ArrowDownRight, Calendar, DollarSign, Activity, PieChart as PieChartIcon, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import Alert from '../components/Alert';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency } from '../utils/formatters';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiringSoon: 0,
    totalRevenue: 0
  });
  const [memberGrowthData, setMemberGrowthData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [paymentModeData, setPaymentModeData] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
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
      
      const [statsData, growthData, revenueData, paymentData, recentMembersData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getMemberGrowth(),
        dashboardService.getRevenueData(),
        dashboardService.getPaymentModes(),
        dashboardService.getRecentMembers()
      ]);

      setStats(statsData);
      setMemberGrowthData(growthData.data);
      setRevenueData(revenueData.data);
      setPaymentModeData(paymentData.data);
      setRecentMembers(recentMembersData.members);
      
      // Show success toast on successful data fetch
      if (window.toast) {
        window.toast({
          type: 'success',
          title: 'Dashboard Updated',
          message: SUCCESS_MESSAGES.DASHBOARD_UPDATED || 'Latest data has been loaded successfully',
          duration: 3000
        });
      }
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
      expiringSoon: 8,
      totalRevenue: 24580
    });

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
        <div className="bg-white p-3 rounded-lg shadow-soft-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{label}</p>
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

  if (loading) {
    return (
      <Layout>
        <DashboardSkeleton />
      </Layout>
    );
  }

  // Calculate growth indicators (mock data for demo)
  const memberGrowth = getGrowthIndicator(stats.totalMembers, stats.totalMembers - 15);
  const revenueGrowth = getGrowthIndicator(stats.totalRevenue, stats.totalRevenue - 2000);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your gym today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              className={`btn-secondary group relative ${refreshing ? 'animate-spin' : ''}`}
              disabled={refreshing}
            >
              <RefreshCw className="w-4 h-4" />
              {refreshing ? 'Updating...' : 'Refresh'}
            </button>
            <button className="btn-secondary group">
              <Calendar className="w-4 h-4 group-hover:animate-bounce-soft" />
              Last 30 days
            </button>
            <button className="btn-primary group">
              <TrendingUp className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
              View Reports
            </button>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-gradient p-6 group hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                  <Users className="w-6 h-6 text-white group-hover:animate-bounce-soft" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 group-hover:scale-105 transition-transform">{stats.totalMembers}</p>
                  {memberGrowth && (
                    <div className={`flex items-center mt-2 text-sm ${
                      memberGrowth.isPositive ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      <memberGrowth.icon className="w-4 h-4 mr-1 group-hover:animate-bounce-soft" />
                      {memberGrowth.value}% from last month
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card-gradient p-6 group hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                  <Activity className="w-6 h-6 text-white group-hover:animate-pulse-soft" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Members</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 group-hover:scale-105 transition-transform">{stats.activeMembers}</p>
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

          <div className="card-gradient p-6 group hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                  <AlertCircle className="w-6 h-6 text-white group-hover:animate-wiggle" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 group-hover:scale-105 transition-transform">{stats.expiringSoon}</p>
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

          <div className="card-gradient p-6 group hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                  <DollarSign className="w-6 h-6 text-white group-hover:animate-bounce-soft" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue (30 days)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 group-hover:scale-105 transition-transform">{formatCurrency(stats.totalRevenue)}</p>
                  {revenueGrowth && (
                    <div className={`flex items-center mt-2 text-sm ${
                      revenueGrowth.isPositive ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      <revenueGrowth.icon className="w-4 h-4 mr-1 group-hover:animate-bounce-soft" />
                      {revenueGrowth.value}% from last month
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Member Growth Chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Member Growth</h3>
                <p className="text-sm text-gray-500">New members over time</p>
              </div>
              <div className="badge-primary">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={memberGrowthData}>
                <defs>
                  <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
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
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <p className="text-sm text-gray-500">Monthly revenue performance</p>
              </div>
              <div className="badge-success">
                <DollarSign className="w-3 h-3 mr-1" />
                +8.2%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Distribution</h3>
                <p className="text-sm text-gray-500">Payment modes breakdown</p>
              </div>
              <PieChartIcon className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentModeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomPieLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentModeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Percentage']}
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
                    ></div>
                    <span className="text-sm text-gray-600">{mode.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{mode.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-gradient p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Avg. Member Value</h4>
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalMembers > 0 ? stats.totalRevenue / stats.totalMembers : 0)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Per member revenue</p>
            </div>

            <div className="card-gradient p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Monthly Growth</h4>
                <TrendingUp className="w-5 h-5 text-success-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                +{memberGrowth ? memberGrowth.value : '0'}%
              </div>
              <p className="text-sm text-gray-500 mt-1">Member acquisition rate</p>
            </div>

            <div className="card-gradient p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Retention Rate</h4>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%
              </div>
              <p className="text-sm text-gray-500 mt-1">Active member ratio</p>
            </div>

            <div className="card-gradient p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Renewal Alert</h4>
                <AlertCircle className="w-5 h-5 text-warning-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</div>
              <p className="text-sm text-gray-500 mt-1">Members expiring soon</p>
            </div>
          </div>
        </div>

        {/* Recent Members */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Members</h3>
                <p className="text-sm text-gray-500">Latest additions to your gym</p>
              </div>
              <button className="btn-ghost text-sm">
                View all
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="divide-y divide-gray-100">
                  {recentMembers.map((member, index) => (
                    <div key={member._id} className="table-row py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-soft">
                              <span className="text-white font-semibold text-sm">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${
                              member.status === 'active' ? 'bg-success-500' : 'bg-danger-500'
                            }`}></div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
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
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                    <p className="text-gray-500 mb-4">Start by adding your first gym member</p>
                    <button className="btn-primary">
                      <Users className="w-4 h-4 mr-2" />
                      Add Member
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
