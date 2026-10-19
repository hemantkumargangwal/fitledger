import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { memberService } from '../services/memberService';

const initialForm = { name: '', phone: '', email: '', gender: '', dateOfBirth: '', address: '', emergencyContactNumber: '' };

const EnrollmentForm = () => {
  const token = new URLSearchParams(window.location.search).get('token') || '';
  const [form, setForm] = useState(initialForm);
  const [gymName, setGymName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) { setError('This enrollment link is invalid or has expired.'); setLoading(false); return; }
    memberService.getEnrollmentDetails(token)
      .then((data) => setGymName(data.gymName))
      .catch((requestError) => setError(requestError.response?.data?.message || 'This enrollment link is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { setError('Full name and mobile number are required.'); return; }
    setSubmitting(true); setError('');
    try { await memberService.submitEnrollment({ ...form, token }); setSubmitted(true); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Enrollment could not be submitted. Please try again.'); }
    finally { setSubmitting(false); }
  };

  return <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-16"><div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    {loading ? <div className="flex min-h-64 items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading enrollment form…</div> : submitted ? <div className="py-16 text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-lime-600" /><h1 className="mt-5 text-2xl font-extrabold text-slate-900">Details submitted</h1><p className="mt-2 text-slate-600">Thank you. {gymName || 'The gym'} will review your enrollment details and approve your membership shortly.</p></div> : <>
      <p className="text-sm font-bold uppercase tracking-wider text-lime-700">{gymName || 'Gym'} enrollment</p><h1 className="mt-2 text-3xl font-extrabold text-slate-900">Tell us about yourself</h1><p className="mt-2 text-slate-600">Please fill in your details to complete your enrollment.</p>
      {error && <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
      {!error.includes('link is') && <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <EnrollmentField label="Full name *"><input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} /></EnrollmentField>
        <EnrollmentField label="Mobile number *"><input className="input" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></EnrollmentField>
        <EnrollmentField label="Email"><input className="input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></EnrollmentField>
        <EnrollmentField label="Gender"><select className="input" value={form.gender} onChange={(e) => update('gender', e.target.value)}><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></EnrollmentField>
        <EnrollmentField label="Date of birth"><input className="input" type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} /></EnrollmentField>
        <EnrollmentField label="Emergency contact"><input className="input" type="tel" value={form.emergencyContactNumber} onChange={(e) => update('emergencyContactNumber', e.target.value)} /></EnrollmentField>
        <div className="sm:col-span-2"><EnrollmentField label="Address"><textarea className="input min-h-24 resize-y" value={form.address} onChange={(e) => update('address', e.target.value)} /></EnrollmentField></div>
        <div className="sm:col-span-2 pt-2"><button className="btn-primary w-full" disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin" />}{submitting ? 'Submitting…' : 'Submit enrollment details'}</button></div>
      </form>}
    </>}
  </div></main>;
};

const EnrollmentField = ({ label, children }) => <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
export default EnrollmentForm;
