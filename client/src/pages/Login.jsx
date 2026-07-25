import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Dumbbell, Eye, EyeOff, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Seo from '../components/Seo';
import Spinner from '../components/Spinner';

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.identifier.trim()) {
      setError('Please enter your email or phone number.');
      return;
    }
    if (!formData.password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const result = await login(formData.identifier, formData.password);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f2] lg:grid lg:grid-cols-[minmax(460px,0.9fr)_minmax(560px,1.1fr)]">
      <Seo
        title="Login"
        description="Sign in to your FitLedger account to manage gym members, payments, renewals and reports."
        path="/login"
        robots="noindex, nofollow"
      />

      <section className="relative hidden overflow-hidden bg-[#11150f] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 text-slate-950 shadow-lg shadow-lime-400/20">
              <Dumbbell size={24} strokeWidth={2.7} />
            </span>
            <span>
              <span className="block text-xl font-black tracking-tight">FitLedger</span>
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.24em] text-lime-400">Gym OS</span>
            </span>
          </Link>
        </div>

        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1.5 text-xs font-bold text-lime-300">
            Built for modern gym owners
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight xl:text-5xl">
            Run your entire gym from <span className="text-lime-400">one focused workspace.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
            Members, collections, renewals and business performance—organized for faster front-desk decisions.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              [Users, 'Members', 'Always organized'],
              [BarChart3, 'Revenue', 'Clear visibility'],
              [ShieldCheck, 'Secure', 'Tenant protected'],
            ].map(([Icon, title, text]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                <Icon size={20} className="text-lime-400" />
                <p className="mt-4 text-sm font-extrabold">{title}</p>
                <p className="mt-1 text-xs text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">© {new Date().getFullYear()} FitLedger. Built for stronger gym businesses.</p>
      </section>

      <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[470px]">
          <Link to="/" className="mb-10 inline-flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400 text-slate-950">
              <Dumbbell size={22} strokeWidth={2.7} />
            </span>
            <span className="text-xl font-black tracking-tight text-slate-950">FitLedger</span>
          </Link>

          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-700">Owner workspace</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Welcome back</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Sign in to manage your gym and see today&apos;s priorities.
          </p>

          <form className="mt-9 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="mb-2 block text-sm font-bold text-slate-700">
                Email or phone number
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={formData.identifier}
                onChange={handleChange}
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-4 focus:ring-lime-400/15"
                placeholder="owner@yourgym.com"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label htmlFor="password" className="block text-sm font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-extrabold text-lime-700 hover:text-lime-800">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-4 focus:ring-lime-400/15"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-lime-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Spinner className="h-4 w-4" /> : <ArrowRight size={18} />}
              {loading ? 'Signing in…' : 'Sign in to dashboard'}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Setting up a new gym?{' '}
              <Link to="/register" className="font-extrabold text-slate-950 hover:text-lime-700">
                Create owner account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
