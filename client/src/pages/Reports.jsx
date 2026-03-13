import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, DollarSign, CalendarClock } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { ReportsPageSkeleton } from '../components/SkeletonLoader';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatCurrency = (n) => {
  if (n == null || n === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
};

const Reports = () => {
  const [period, setPeriod] = useState('6months');
  const [expiringDays, setExpiringDays] = useState(30);
  const [revenueData, setRevenueData] = useState([]);
  const [memberGrowthData, setMemberGrowthData] = useState([]);
  const [expiringMembers, setExpiringMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [rev, growth, expiring] = await Promise.all([
          dashboardService.getRevenueData(period),
          dashboardService.getMemberGrowth(period),
          dashboardService.getExpiringMembers(expiringDays)
        ]);
        if (!cancelled) {
          setRevenueData(rev.data || []);
          setMemberGrowthData(growth.data || []);
          setExpiringMembers(expiring.members || []);
        }
      } catch {
        if (!cancelled) {
          setRevenueData([]);
          setMemberGrowthData([]);
          setExpiringMembers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [period, expiringDays]);

  const revenueChartData = revenueData.map((d) => ({
    ...d,
    monthLabel: d.month ? `${String(d.month).slice(5)}` : d.month
  }));

  const growthChartData = memberGrowthData.map((d) => ({
    ...d,
    monthLabel: d.month ? `${String(d.month).slice(5)}` : d.month
  }));

  const expiringColumns = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email', render: (row) => row.email || '—' },
    { key: 'expiryDate', label: 'Expires', render: (row) => formatDate(row.expiryDate) }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 mt-1">Revenue, member growth, and expiring memberships</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Chart period</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white"
          >
            <option value="3months">3 months</option>
            <option value="6months">6 months</option>
            <option value="1year">1 year</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Expiring within</span>
          <select
            value={expiringDays}
            onChange={(e) => setExpiringDays(Number(e.target.value))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
          </select>
        </label>
      </div>

      {loading ? (
        <ReportsPageSkeleton />
      ) : (
        <>
          <ChartCard title="Monthly revenue" subtitle={`Last ${period}`}>
            <div className="h-72">
              {revenueChartData.length === 0 ? (
                <EmptyState
                  icon={DollarSign}
                  title="No revenue data"
                  description={`No payments recorded for the selected period (${period}). Add payments to see revenue trends.`}
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} labelFormatter={(l) => `Month: ${l}`} />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Member growth" subtitle={`Last ${period}`}>
            <div className="h-72">
              {growthChartData.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No member growth data"
                  description={`No new members in the selected period (${period}). New signups will appear here.`}
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip />
                    <Line type="monotone" dataKey="members" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>

          <ChartCard title={`Expiring memberships (next ${expiringDays} days)`}>
            <DataTable
              columns={expiringColumns}
              data={expiringMembers}
              keyField="_id"
              emptyState={
                <EmptyState
                  icon={CalendarClock}
                  title="No members expiring soon"
                  description={`No active memberships expire in the next ${expiringDays} days. You're all set.`}
                />
              }
              emptyMessage="No members expiring in this period"
            />
          </ChartCard>
        </>
      )}
    </div>
  );
};

export default Reports;
