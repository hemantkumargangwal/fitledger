import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Check, History, Mail, Phone, RefreshCw, User, X } from 'lucide-react';
import ModalForm from '../components/ModalForm';
import Spinner from '../components/Spinner';
import { memberService } from '../services/memberService';
import { membershipService } from '../services/membershipService';
import { dietPlanService, workoutPlanService } from '../services/planService';
import { formatCurrency } from '../utils/formatters';

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
};

const emptyRenewal = {
  membershipName: '',
  membershipId: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  plan: '',
  diet: '',
  trainer: '',
  trainerSlot: '',
  membershipPrice: '',
  extras: '',
  discount: '',
  totalAmountPayable: '',
  invoiceDate: new Date().toISOString().slice(0, 10),
  salesManager: '',
  note: '',
  invoiceSendEmail: false,
  amountPaid: '',
  mode: 'cash',
  paymentDueDate: '',
};

const ACTION_LABELS = {
  member_joined: 'Joined gym',
  member_updated: 'Details updated',
  member_renewed: 'Membership assigned',
  payment_received: 'Payment received',
  member_deleted: 'Removed'
};

const MemberProfile = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [activity, setActivity] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRenewal, setShowRenewal] = useState(false);
  const [renewalData, setRenewalData] = useState(emptyRenewal);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [memberRes, activityRes, membershipRes, workoutRes, dietRes] = await Promise.all([
        memberService.getMemberById(id),
        memberService.getMemberActivity(id).catch(() => ({ activity: [] })),
        membershipService.getMemberships().catch(() => ({ memberships: [] })),
        workoutPlanService.getPlans().catch(() => []),
        dietPlanService.getPlans().catch(() => []),
      ]);
      setMember(memberRes.member);
      setActivity(activityRes.activity || []);
      setMemberships(membershipRes.memberships || []);
      setWorkoutPlans(workoutRes || []);
      setDietPlans(dietRes || []);
    } catch {
      setError('Member not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const assignment = member?.membershipAssignment;
  const totalAmount = useMemo(() => {
    const price = Number(renewalData.membershipPrice || 0);
    const extras = Number(renewalData.extras || 0);
    const discount = Number(renewalData.discount || 0);
    return Math.max(price + extras - discount, 0);
  }, [renewalData.membershipPrice, renewalData.extras, renewalData.discount]);

  useEffect(() => {
    setRenewalData((data) => ({ ...data, totalAmountPayable: String(totalAmount) }));
  }, [totalAmount]);

  const openRenewal = () => {
    setRenewalData({
      ...emptyRenewal,
      membershipName: assignment?.membershipName || '',
      membershipId: assignment?.membershipId || '',
      startDate: assignment?.startDate ? assignment.startDate.slice(0, 10) : emptyRenewal.startDate,
      endDate: assignment?.endDate ? assignment.endDate.slice(0, 10) : '',
      plan: assignment?.plan || '',
      diet: assignment?.diet || '',
      trainer: assignment?.trainer || '',
      trainerSlot: assignment?.trainerSlot || '',
      membershipPrice: assignment?.membershipPrice ?? '',
      extras: assignment?.extras ?? '',
      discount: assignment?.discount ?? '',
      totalAmountPayable: assignment?.totalAmountPayable ?? '',
      invoiceDate: assignment?.invoiceDate ? assignment.invoiceDate.slice(0, 10) : emptyRenewal.invoiceDate,
      salesManager: assignment?.salesManager || '',
      note: assignment?.note || '',
      invoiceSendEmail: Boolean(assignment?.invoiceSendEmail),
      amountPaid: assignment?.amountPaid ?? '',
      mode: assignment?.mode || 'cash',
      paymentDueDate: assignment?.paymentDueDate ? assignment.paymentDueDate.slice(0, 10) : '',
    });
    setShowRenewal(true);
  };

  const updateRenewal = (field, value) => {
    setRenewalData((data) => ({ ...data, [field]: value }));
  };

  const handleMembershipSelect = (membershipId) => {
    const selected = memberships.find((item) => item._id === membershipId);
    setRenewalData((data) => ({
      ...data,
      membershipId,
      membershipName: selected?.name || data.membershipName,
      membershipPrice: selected?.price ?? data.membershipPrice,
    }));
  };

  const saveRenewal = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await memberService.assignMembership(id, renewalData);
      setShowRenewal(false);
      await loadProfile();
    } catch (saveError) {
      console.error('Error assigning membership:', saveError);
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Assignment failed',
          message: saveError.response?.data?.message || 'Membership could not be assigned.',
          duration: 3500
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="space-y-6">
        <BackLink />
        <div className="py-12 text-center text-slate-600">{error || 'Member not found.'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <BackLink />
        <div className="flex gap-2">
          <Link to={`/members?edit=${member._id}`} className="btn-secondary">Edit Profile</Link>
          <button type="button" onClick={openRenewal} className="btn-primary">
            <RefreshCw className="h-4 w-4" />
            {assignment ? 'Renew Membership' : 'Assign Membership'}
          </button>
        </div>
      </div>

      {!assignment && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Membership assign nahi hai. Assign Membership button se renewal form open karein.
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-lime-400 to-lime-600">
              {member.photo ? <img src={member.photo} alt={member.name} className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-slate-950" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-800">{member.name}</h1>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold uppercase text-slate-500">
                  {member.memberCode || 'No ID'}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${
                  member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {member.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Info icon={Phone} label="Mobile" value={member.phone} />
                <Info icon={Mail} label="Email" value={member.email || '-'} />
                <Info icon={AlertCircle} label="Document ID" value={member.documentId || '-'} />
                <Info label="Date of Joining" value={formatDate(member.joiningDate)} />
                <Info label="Date of Birth" value={formatDate(member.dateOfBirth)} />
                <Info label="Emergency Contact" value={member.emergencyContactNumber || '-'} />
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Membership</h2>
          {assignment ? (
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="Membership Name" value={assignment.membershipName || '-'} />
              <Info label="Start Date" value={formatDate(assignment.startDate)} />
              <Info label="End Date" value={formatDate(assignment.endDate)} />
              <Info label="Trainer" value={assignment.trainer || '-'} />
              <Info label="Trainer Slot" value={assignment.trainerSlot || '-'} />
              <Info label="Total Payable" value={formatCurrency(assignment.totalAmountPayable || 0)} />
              <Info label="Amount Paid" value={formatCurrency(assignment.amountPaid || 0)} />
              <Info label="Payment Due Date" value={formatDate(assignment.paymentDueDate)} />
            </dl>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No membership assigned yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Body Stats</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries({
              Height: member.bodyStats?.height,
              Weight: member.bodyStats?.weight,
              BMI: member.bodyStats?.bmi,
              'Body Fat': member.bodyStats?.bodyFat,
              Shoulder: member.bodyStats?.shoulder,
              Chest: member.bodyStats?.chest,
              Hips: member.bodyStats?.hips,
              Abs: member.bodyStats?.abs,
              'Waist Hip': member.bodyStats?.waistHip,
              'Blood Measurement Date': formatDate(member.bodyStats?.bloodMeasurementDate),
            }).map(([label, value]) => <Info key={label} label={label} value={value || '-'} />)}
          </dl>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Activity log</h2>
          </div>
        </div>
        <div className="p-6">
          {activity.length ? (
            <ul className="space-y-4">
              {activity.map((log) => (
                <li key={log._id} className="flex gap-4 border-b border-slate-100 py-3 last:border-0">
                  <span className="w-28 flex-shrink-0 text-sm text-slate-400">{formatDate(log.createdAt)}</span>
                  <div>
                    <span className="font-medium text-slate-700">{ACTION_LABELS[log.action] || log.action}</span>
                    {log.description && <p className="mt-0.5 text-sm text-slate-500">{log.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No activity recorded yet.</p>
          )}
        </div>
      </section>

      <ModalForm isOpen={showRenewal} onClose={() => setShowRenewal(false)} title="Membership Renewal" className="sm:max-w-5xl">
        <form onSubmit={saveRenewal} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Membership Name">
              <select className="input" value={renewalData.membershipId} onChange={(e) => handleMembershipSelect(e.target.value)}>
                <option value="">Select membership</option>
                {memberships.map((membership) => (
                  <option key={membership._id} value={membership._id}>{membership.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Start Date">
              <input className="input" type="date" value={renewalData.startDate} onChange={(e) => updateRenewal('startDate', e.target.value)} />
            </Field>
            <Field label="End Date">
              <input className="input" type="date" value={renewalData.endDate} onChange={(e) => updateRenewal('endDate', e.target.value)} />
            </Field>
            <Field label="Plan">
              <select className="input" value={renewalData.plan} onChange={(e) => updateRenewal('plan', e.target.value)}>
                <option value="">Select workout plan</option>
                {workoutPlans.map((plan) => <option key={plan._id} value={plan.name}>{plan.name}</option>)}
              </select>
            </Field>
            <Field label="Diet">
              <select className="input" value={renewalData.diet} onChange={(e) => updateRenewal('diet', e.target.value)}>
                <option value="">Select diet plan</option>
                {dietPlans.map((plan) => <option key={plan._id} value={plan.name}>{plan.name}</option>)}
              </select>
            </Field>
            <Field label="Trainer">
              <input className="input" value={renewalData.trainer} onChange={(e) => updateRenewal('trainer', e.target.value)} />
            </Field>
            <Field label="Trainer Slot">
              <input className="input" value={renewalData.trainerSlot} onChange={(e) => updateRenewal('trainerSlot', e.target.value)} />
            </Field>
            <Field label="Membership Price">
              <input className="input" type="number" min="0" value={renewalData.membershipPrice} onChange={(e) => updateRenewal('membershipPrice', e.target.value)} />
            </Field>
            <Field label="Extras">
              <input className="input" type="number" min="0" value={renewalData.extras} onChange={(e) => updateRenewal('extras', e.target.value)} />
            </Field>
            <Field label="Discount">
              <input className="input" type="number" min="0" value={renewalData.discount} onChange={(e) => updateRenewal('discount', e.target.value)} />
            </Field>
            <Field label="Total Amount Payable">
              <input className="input" type="number" min="0" value={renewalData.totalAmountPayable} onChange={(e) => updateRenewal('totalAmountPayable', e.target.value)} />
            </Field>
            <Field label="Invoice Date">
              <input className="input" type="date" value={renewalData.invoiceDate} onChange={(e) => updateRenewal('invoiceDate', e.target.value)} />
            </Field>
            <Field label="Sales Manager">
              <input className="input" value={renewalData.salesManager} onChange={(e) => updateRenewal('salesManager', e.target.value)} />
            </Field>
            <Field label="Amount Paid">
              <input className="input" type="number" min="0" value={renewalData.amountPaid} onChange={(e) => updateRenewal('amountPaid', e.target.value)} />
            </Field>
            <Field label="Mode">
              <select className="input" value={renewalData.mode} onChange={(e) => updateRenewal('mode', e.target.value)}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
            </Field>
            <Field label="Payment Due Date">
              <input className="input" type="date" value={renewalData.paymentDueDate} onChange={(e) => updateRenewal('paymentDueDate', e.target.value)} />
            </Field>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input type="checkbox" checked={renewalData.invoiceSendEmail} onChange={(e) => updateRenewal('invoiceSendEmail', e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-lime-600 focus:ring-lime-500" />
              <span className="text-sm font-bold text-slate-700">Invoice Send Email</span>
            </label>
            <div className="md:col-span-3">
              <Field label="Note">
                <textarea className="input min-h-24 resize-y" value={renewalData.note} onChange={(e) => updateRenewal('note', e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setShowRenewal(false)} className="btn-secondary">
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size="sm" /> : <Check className="h-4 w-4" />}
              Save Membership
            </button>
          </div>
        </form>
      </ModalForm>
    </div>
  );
};

const BackLink = () => (
  <Link to="/members" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800">
    <ArrowLeft className="h-4 w-4" />
    Back to Members
  </Link>
);

const Info = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    {Icon && <Icon className="mt-0.5 h-5 w-5 text-slate-400" />}
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-sm font-semibold text-slate-800">{value || '-'}</dd>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
    {children}
  </label>
);

export default MemberProfile;
