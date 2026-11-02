import { useEffect, useState } from 'react';
import { Dumbbell, Printer, Salad } from 'lucide-react';
import Spinner from '../components/Spinner';
import { planShareService } from '../services/planShareService';
import { useParams } from 'react-router-dom';

const SharedPlan = () => {
  const { shareToken } = useParams();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    document.title = 'Your Fitness Plan | FitSaarthi';
    const robots = document.querySelector('meta[name="robots"]') || document.head.appendChild(document.createElement('meta'));
    robots.name = 'robots'; robots.content = 'noindex, nofollow, noarchive';
    planShareService.getPublic(shareToken).then((response) => { setData(response); setState('ready'); }).catch((error) => {
      const code = error.response?.data?.error?.code || error.response?.data?.code;
      setState(code === 'LINK_EXPIRED' ? 'expired' : code === 'LINK_REVOKED' ? 'revoked' : 'invalid');
    });
  }, [shareToken]);

  if (state === 'loading') return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Spinner size="lg" /></div>;
  if (state !== 'ready') return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-extrabold text-slate-900">{state === 'expired' ? 'Link expired' : state === 'revoked' ? 'Link revoked' : 'Invalid link'}</h1><p className="mt-3 text-slate-600">{state === 'expired' ? 'Ask your gym for a new fitness-plan link.' : 'This plan is no longer available. Please contact your gym.'}</p></div></div>;
  return <main className="min-h-screen bg-slate-50 print:bg-white"><div className="mx-auto max-w-5xl p-4 sm:p-8"><header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-950 p-6 text-white print:bg-white print:text-slate-900 print:shadow-none"><div className="flex items-center gap-4">{data.gym.logoUrl ? <img src={data.gym.logoUrl} alt="Gym logo" className="h-14 w-14 rounded-2xl bg-white object-contain" /> : <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400 text-slate-950"><Dumbbell /></div>}<div><p className="text-sm font-bold text-lime-300 print:text-lime-700">{data.gym.name}</p><h1 className="text-2xl font-extrabold">Hi, {data.member.firstName}</h1><p className="mt-1 text-sm text-slate-300 print:text-slate-600">Your shared fitness plan</p></div></div><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 print:hidden"><Printer size={16} />Print</button></header><div className="grid gap-6 lg:grid-cols-2">{data.workoutPlan && <PlanCard plan={data.workoutPlan} type="workout" />}{data.dietPlan && <PlanCard plan={data.dietPlan} type="diet" />}</div><p className="mt-8 text-center text-xs text-slate-500 print:mt-4">For guidance only. Please follow your gym trainer’s advice and consult a qualified professional for medical or nutrition concerns.</p></div></main>;
};

const PlanCard = ({ plan, type }) => <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm print:break-inside-avoid print:shadow-none"><div className="border-b border-slate-100 p-5"><div className="flex items-center gap-2"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${type === 'workout' ? 'bg-lime-100 text-lime-700' : 'bg-teal-100 text-teal-700'}`}>{type === 'workout' ? <Dumbbell size={18} /> : <Salad size={18} />}</span><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{type === 'workout' ? 'Workout plan' : 'Diet plan'}</p><h2 className="font-extrabold text-slate-900">{plan.name}</h2></div></div>{plan.description && <p className="mt-3 text-sm text-slate-600">{plan.description}</p>}</div><div className="space-y-3 p-5">{plan.tableRows?.map((row, index) => <article key={index} className="rounded-2xl bg-slate-50 p-4"><p className="font-bold text-slate-900">{type === 'workout' ? `${row.day || 'Workout'} · ${row.exercise || ''}` : `${row.time || ''} · ${row.meal || ''}`}</p><p className="mt-1 text-sm text-slate-700">{type === 'workout' ? `${row.sets || '—'} sets × ${row.reps || '—'} · Rest ${row.rest || '—'}` : `${row.food || '—'}${row.quantity ? ` · ${row.quantity}` : ''}`}</p>{type === 'diet' && (row.calories || row.protein) && <p className="mt-1 text-xs font-semibold text-slate-500">{row.calories && `${row.calories} kcal`}{row.calories && row.protein && ' · '}{row.protein && `${row.protein} protein`}</p>}{row.instructions && <p className="mt-2 text-xs text-slate-500">{row.instructions}</p>}</article>)}</div></section>;

export default SharedPlan;
