import { useMemo, useState } from 'react';
import { ArrowRight, Eye, EyeOff, KeyRound, Mail } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import Seo from '../components/Seo';
import Spinner from '../components/Spinner';
import { getApiError } from '../services/api';
import { authService } from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const [form, setForm] = useState({ email: initialEmail, otp: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'otp' ? value.replace(/\D/g, '').slice(0, 6) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Enter a valid email address.');
    if (!/^\d{6}$/.test(form.otp)) return setError('Enter the complete 6-digit verification code.');
    if (form.newPassword.length < 8 || !/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword)) {
      return setError('Password must be at least 8 characters and include a letter and number.');
    }
    if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await authService.resetPassword({
        email: form.email.trim().toLowerCase(),
        otp: form.otp,
        newPassword: form.newPassword,
      });
      window.toast?.({ type: 'success', title: 'Password reset', message: 'Sign in with your new password.', duration: 3500 });
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to reset your password right now.').message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Verify your identity"
      title="Choose a new password"
      description="Use the 6-digit code from your email. The code expires in 10 minutes and works only once."
    >
      <Seo title="Reset Password" description="Verify OTP and set a new password for your FitLedger account." path="/reset-password" robots="noindex, nofollow" />
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</div>}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">Registered email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-400/15" required />
          </div>
        </div>

        <div>
          <label htmlFor="otp" className="mb-2 block text-sm font-bold text-slate-700">6-digit verification code</label>
          <div className="relative">
            <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="otp" name="otp" inputMode="numeric" autoComplete="one-time-code" value={form.otp} onChange={handleChange} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-center font-mono text-lg font-bold tracking-[0.45em] outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-400/15" placeholder="000000" required />
          </div>
        </div>

        <div>
          <label htmlFor="newPassword" className="mb-2 block text-sm font-bold text-slate-700">New password</label>
          <div className="relative">
            <input id="newPassword" name="newPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.newPassword} onChange={handleChange} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-sm outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-400/15" required />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400" aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}>
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">At least 8 characters with a letter and number.</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-slate-700">Confirm new password</label>
          <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-400/15" required />
        </div>

        <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-60">
          {loading ? <Spinner className="h-4 w-4" /> : <ArrowRight size={18} />}
          {loading ? 'Securing account…' : 'Set new password'}
        </button>
      </form>
      <p className="mt-7 text-sm text-slate-500">
        Didn&apos;t receive the code? <Link to="/forgot-password" className="font-extrabold text-slate-950 hover:text-lime-700">Request another OTP</Link>
      </p>
    </AuthShell>
  );
};

export default ResetPassword;
