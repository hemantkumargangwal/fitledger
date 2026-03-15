import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Download, FileText, Filter, IndianRupee, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { PaymentsPageSkeleton } from '../components/SkeletonLoader';
import ModalForm from '../components/ModalForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';

const PAYMENT_TYPE_LABELS = { cash: 'Cash', upi: 'UPI', card: 'Card' };

const formatCurrency = (n) => {
  if (n == null || n === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const defaultForm = {
  amount: '',
  paymentType: 'cash',
  paymentDate: '',
  description: ''
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
    endDate: '',
    search: ''
  });
  const [editingPayment, setEditingPayment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState('');

  const limit = 10;

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        paymentType: filters.paymentType,
        search: filters.search
      };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await paymentService.getPayments(params);
      setPayments(res.payments || []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 0);
    } catch {
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
  }, [currentPage, filters.paymentType, filters.startDate, filters.endDate, filters.search]);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const resetModal = () => {
    setEditingPayment(null);
    setShowEditModal(false);
    setForm(defaultForm);
  };

  const openEditModal = (payment) => {
    setEditingPayment(payment);
    setForm({
      amount: String(payment.amount ?? ''),
      paymentType: payment.paymentType || 'cash',
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().slice(0, 10) : '',
      description: payment.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    if (!editingPayment) return;

    setSubmitting(true);
    try {
      await paymentService.updatePayment(editingPayment._id, {
        amount: Number(form.amount),
        paymentType: form.paymentType,
        paymentDate: form.paymentDate ? new Date(form.paymentDate).toISOString() : undefined,
        description: form.description.trim()
      });
      resetModal();
      await Promise.all([fetchPayments(), fetchRevenue()]);
      if (window.toast) {
        window.toast({
          type: 'success',
          title: 'Payment updated',
          message: 'Payment details saved successfully.',
          duration: 3000
        });
      }
    } catch (err) {
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Update failed',
          message: err.response?.data?.message || 'Failed to update payment.',
          duration: 3500
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    setDeleting(true);
    try {
      await paymentService.deletePayment(paymentToDelete._id);
      setShowDeleteDialog(false);
      setPaymentToDelete(null);
      await Promise.all([fetchPayments(), fetchRevenue()]);
      if (window.toast) {
        window.toast({
          type: 'success',
          title: 'Payment deleted',
          message: 'Payment removed successfully.',
          duration: 3000
        });
      }
    } catch (err) {
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Delete failed',
          message: err.response?.data?.message || 'Failed to delete payment.',
          duration: 3500
        });
      }
    } finally {
      setDeleting(false);
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await paymentService.exportPayments({
        paymentType: filters.paymentType,
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      downloadBlob(blob, 'payments-export.csv');
    } catch {
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Export failed',
          message: 'Could not export payments right now.',
          duration: 3000
        });
      }
    } finally {
      setExporting(false);
    }
  };

  const handleReceipt = async (payment) => {
    setDownloadingReceiptId(payment._id);
    try {
      const blob = await paymentService.generateReceipt(payment._id);
      downloadBlob(blob, `receipt-${payment._id}.txt`);
    } catch {
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Receipt failed',
          message: 'Could not download the receipt.',
          duration: 3000
        });
      }
    } finally {
      setDownloadingReceiptId('');
    }
  };

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
      render: (row) => row.memberId ? (row.memberId.name || '—') : '—'
    },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
    {
      key: 'paymentType',
      label: 'Mode',
      render: (row) => PAYMENT_TYPE_LABELS[row.paymentType] || row.paymentType
    },
    { key: 'description', label: 'Note', render: (row) => row.description || '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => openEditModal(row)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
            <Pencil className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => handleReceipt(row)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" disabled={downloadingReceiptId === row._id}>
            <FileText className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentToDelete(row);
              setShowDeleteDialog(true);
            }}
            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading && payments.length === 0) {
    return <PaymentsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
          <p className="text-slate-500 mt-1">Payment history, receipts, and revenue summary</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <Link
            to="/payments/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Payment
          </Link>
        </div>
      </div>

      <StatCard
        title="Revenue (this month)"
        value={formatCurrency(revenueSummary.totalRevenue)}
        icon={IndianRupee}
        iconBg="from-violet-500 to-violet-600"
        subtitle={`${revenueSummary.totalPayments} payments`}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col xl:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => {
                setCurrentPage(1);
                setFilters((f) => ({ ...f, search: e.target.value }));
              }}
              placeholder="Search by member, amount, or note"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-700 bg-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filters.paymentType}
              onChange={(e) => {
                setCurrentPage(1);
                setFilters((f) => ({ ...f, paymentType: e.target.value }));
              }}
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
              onChange={(e) => {
                setCurrentPage(1);
                setFilters((f) => ({ ...f, startDate: e.target.value }));
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setCurrentPage(1);
                setFilters((f) => ({ ...f, endDate: e.target.value }));
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="h-12 bg-slate-50 border-b border-slate-200 animate-pulse" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 border-b border-slate-100 flex items-center px-6 gap-4">
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded flex-1 max-w-[120px]" />
                <div className="h-4 bg-slate-200 rounded w-16" />
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

      <ModalForm isOpen={showEditModal} onClose={resetModal} title="Edit Payment">
        <form onSubmit={handleUpdatePayment} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
            <input
              type="number"
              min="1"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment mode</label>
            <select
              value={form.paymentType}
              onChange={(e) => setForm((prev) => ({ ...prev, paymentType: e.target.value }))}
              className="input"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment date</label>
            <input
              type="date"
              value={form.paymentDate}
              onChange={(e) => setForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Note</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="input"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={resetModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary inline-flex items-center gap-2">
              {submitting && <Spinner className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </ModalForm>

      <ConfirmDialog
        open={showDeleteDialog && !!paymentToDelete}
        title="Delete payment"
        message={paymentToDelete ? `Delete payment of ${formatCurrency(paymentToDelete.amount)} from ${paymentToDelete.memberId?.name || 'this member'}?` : ''}
        confirmLabel="Delete payment"
        loading={deleting}
        danger
        onConfirm={handleDeletePayment}
        onCancel={() => {
          setShowDeleteDialog(false);
          setPaymentToDelete(null);
        }}
      />
    </div>
  );
};

export default Payments;
