import { Dumbbell, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthShell = ({ eyebrow, title, description, children }) => (
  <div className="min-h-screen bg-[#f4f6f2] lg:grid lg:grid-cols-[minmax(380px,0.72fr)_minmax(560px,1.28fr)]">
    <aside className="relative hidden overflow-hidden bg-[#11150f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -left-28 top-28 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />
      <Link to="/" className="relative inline-flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 text-slate-950">
          <Dumbbell size={24} strokeWidth={2.7} />
        </span>
        <span>
          <span className="block text-xl font-black tracking-tight">FitLedger</span>
          <span className="block text-[10px] font-extrabold uppercase tracking-[0.24em] text-lime-400">Gym OS</span>
        </span>
      </Link>

      <div className="relative max-w-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/10 text-lime-400">
          <ShieldCheck size={23} />
        </div>
        <h2 className="mt-6 text-3xl font-black leading-tight tracking-tight">Secure access to your gym workspace.</h2>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Password recovery is protected with a time-limited, single-use verification code.
        </p>
      </div>

      <p className="relative text-xs text-slate-600">Private owner access • Rate-limited recovery • Encrypted passwords</p>
    </aside>

    <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
      <div className="w-full max-w-[470px]">
        <Link to="/" className="mb-10 inline-flex items-center gap-3 lg:hidden">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400 text-slate-950">
            <Dumbbell size={22} strokeWidth={2.7} />
          </span>
          <span className="text-xl font-black tracking-tight text-slate-950">FitLedger</span>
        </Link>
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lime-700">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  </div>
);

export default AuthShell;
