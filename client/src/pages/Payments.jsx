import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Plus, Filter, CreditCard } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { PaymentsPageSkeleton } from '../components/SkeletonLoader';

const PAYMENT_TYPE_LABELS = { cash: 'Cash', upi: 'UPI', card: 'Card' };

const formatCurrency = (n) => {
  if (n == null || n === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [revenueSummary, setRevenueSummary] = useState({ totalRevenue: 0, totalPayments: 0, revenueByType: [] });
  const [filters, setFilters] = useState({
    paymentType: 'all',
    startDate: '',
    endDate: ''
  });

  const limit = 10;

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit, paymentType: filters.paymentType };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await paymentService.getPayments(params);
      setPayments(res.payments || []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 0);
    } catch (e) {
      setPayments([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenue = async () => {
    try {
      const res = await paymentService.getRevenueSummary('month');
      setRevenueSummary({
        totalRevenue: res.totalRevenue ?? 0,
        totalPayments: res.totalPayments ?? 0,
        revenueByType: res.revenueByType ?? []
      });
    } catch {
      setRevenueSummary({ totalRevenue: 0, totalPayments: 0, revenueByType: [] });
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, filters.paymentType, filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const emptyPaymentsState = (
    <EmptyState
      icon={CreditCard}
      title="No payments yet"
      description="Record a payment to see it here. Payments help you track revenue and member history."
      action={
        <Link
          to="/payments/add"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Payment
        </Link>
      }
    />
  );

  const columns = [
    { key: 'paymentDate', label: 'Date', render: (row) => formatDate(row.paymentDate || row.createdAt) },
    {
      key: 'memberId',
      label: 'Member',
      render: (row) => {
        const m = row.memberId;
        return m ? (m.name || '—') : '—';
      }
    },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
    {
      key: 'paymentType',
      label: 'Mode',
      render: (row) => PAYMENT_TYPE_LABELS[row.paymentType] || row.paymentType
    },
    { key: 'description', label: 'Note', render: (row) => row.description || '—' }
  ];

  if (loading && payments.length === 0) {
    return <PaymentsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
          <p className="text-slate-500 mt-1">Payment history and revenue summary</p>
        </div>
        <Link
          to="/payments/add"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Payment
        </Link>
      </div>

      <StatCard
        title="Revenue (this month)"
        value={formatCurrency(revenueSummary.totalRevenue)}
        icon={DollarSign}
        iconBg="from-violet-500 to-violet-600"
        subtitle={`${revenueSummary.totalPayments} payments`}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filters.paymentType}
              onChange={(e) => setFilters((f) => ({ ...f, paymentType: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white"
            >
              <option value="all">All modes</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="h-12 bg-slate-50 border-b border-slate-200 animate-pulse" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 border-b border-slate-100 flex items-center px-6 gap-4">
                <div className="h-4 bg-slate-200 rounded w-24 shimmer relative overflow-hidden" />
                <div className="h-4 bg-slate-200 rounded flex-1 max-w-[120px] shimmer relative overflow-hidden" />
                <div className="h-4 bg-slate-200 rounded w-16 shimmer relative overflow-hidden" />
                <div className="h-4 bg-slate-200 rounded w-14 shimmer relative overflow-hidden" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={payments}
              keyField="_id"
              emptyState={emptyPaymentsState}
              emptyMessage="No payments found"
            />
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages} ({total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Payments;
