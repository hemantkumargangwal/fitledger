import { useState } from 'react';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import Seo from '../components/Seo';
import Spinner from '../components/Spinner';
import { authService } from '../services/authService';
import { getApiError } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(normalizedEmail);
      navigate(`/reset-password?email=${encodeURIComponent(normalizedEmail)}`);
      window.toast?.({
        type: 'success',
        title: 'Check your inbox',
        message: 'If the account exists, a 6-digit OTP has been sent.',
        duration: 4000,
      });
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to send the OTP right now.').message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter the email registered with your owner account. We’ll send a verification code if the account exists."
    >
      <Seo title="Forgot Password" description="Request an OTP to reset your FitLedger account password." path="/forgot-password" robots="noindex, nofollow" />
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</div>}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">Registered email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-4 focus:ring-lime-400/15"
              placeholder="owner@yourgym.com"
              required
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-60">
          {loading ? <Spinner className="h-4 w-4" /> : <ArrowRight size={18} />}
          {loading ? 'Sending secure code…' : 'Send verification code'}
        </button>
      </form>
      <Link to="/login" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-lime-700">
        <ArrowLeft size={16} /> Back to sign in
      </Link>
    </AuthShell>
  );
};

export default ForgotPassword;
