import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Spinner from '../components/Spinner';
import { paymentService } from '../services/paymentService';
import { memberService } from '../services/memberService';

const PAYMENT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' }
];

const AddPayment = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    memberId: '',
    amount: '',
    paymentType: 'cash',
    paymentDate: new Date().toISOString().slice(0, 10),
    description: ''
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await memberService.getMembers({ limit: 500 });
        if (!cancelled) setMembers(res.members || []);
      } catch {
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setLoadingMembers(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amount = parseFloat(form.amount);
    if (!form.memberId) {
      setError('Please select a member.');
      return;
    }
    if (!form.amount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    setSubmitting(true);
    try {
      await paymentService.createPayment({
        memberId: form.memberId,
        amount,
        paymentType: form.paymentType,
        paymentDate: form.paymentDate ? new Date(form.paymentDate).toISOString() : undefined,
        description: form.description.trim() || undefined
      });
      if (window.toast) {
        window.toast({
          type: 'success',
          title: 'Payment recorded',
          message: 'Payment has been added successfully.',
          duration: 3500
        });
      }
      navigate('/payments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link
          to="/payments"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-800">Add Payment</h1>
      <p className="text-slate-500 mt-1">Record a new payment from a member.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm" role="alert">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="memberId" className="block text-sm font-medium text-slate-700 mb-1">
            Member <span className="text-red-500">*</span>
          </label>
          <select
            id="memberId"
            required
            value={form.memberId}
            onChange={(e) => setForm((f) => ({ ...f, memberId: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 bg-white"
          >
            <option value="">Select member</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} {m.phone ? `(${m.phone})` : ''}
              </option>
            ))}
          </select>
          {loadingMembers && <p className="text-xs text-slate-500 mt-1">Loading members…</p>}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
            Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            required
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Payment mode <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            {PAYMENT_TYPES.map((t) => (
              <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentType"
                  value={t.value}
                  checked={form.paymentType === t.value}
                  onChange={(e) => setForm((f) => ({ ...f, paymentType: e.target.value }))}
                  className="rounded-full border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-slate-700">{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="paymentDate" className="block text-sm font-medium text-slate-700 mb-1">
            Payment date
          </label>
          <input
            id="paymentDate"
            type="date"
            value={form.paymentDate}
            onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            Note (optional)
          </label>
          <input
            id="description"
            type="text"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="e.g. Monthly fee"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors"
          >
            {submitting && <Spinner className="w-4 h-4" />}
            {submitting ? 'Saving…' : 'Add Payment'}
          </button>
          <Link
            to="/payments"
            className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AddPayment;
