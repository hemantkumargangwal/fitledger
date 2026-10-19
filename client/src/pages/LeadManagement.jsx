import { useEffect, useMemo, useState } from 'react';
import { BarChart3, KanbanSquare, List, Loader2, Plus, Search, Users } from 'lucide-react';
import ModalForm from '../components/ModalForm';
import Spinner from '../components/Spinner';
import { crmService } from '../services/crmService';

const stages = ['Inquiry', 'Follow-up', 'Trial', 'Converted', 'Lost'];
const stageStyle = {
  Inquiry: 'border-blue-200 bg-blue-50 text-blue-700', 'Follow-up': 'border-amber-200 bg-amber-50 text-amber-700',
  Trial: 'border-violet-200 bg-violet-50 text-violet-700', Converted: 'border-emerald-200 bg-emerald-50 text-emerald-700', Lost: 'border-slate-200 bg-slate-100 text-slate-600',
};
const blankLead = { name: '', phone: '', email: '', status: 'Inquiry', notes: '' };

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('kanban');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState(blankLead);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await crmService.getLeads();
      setLeads(data.leads || data || []);
    } catch (error) {
      window.toast?.({ type: 'error', title: 'Could not load leads', message: error.message });
    } finally { setLoading(false); }
  };
  useEffect(() => { loadLeads(); }, []);

  const changeStage = async (lead, status) => {
    if (lead.status === status) return;
    const previous = leads;
    setLeads((items) => items.map((item) => item._id === lead._id ? { ...item, status } : item));
    try {
      await crmService.updateLeadStatus(lead._id, status);
      window.toast?.({ type: 'success', title: 'Pipeline updated', message: `${lead.name} moved to ${status}.` });
    } catch (error) {
      setLeads(previous);
      window.toast?.({ type: 'error', title: 'Stage update failed', message: error.message });
    }
  };

  const createLead = async (event) => {
    event.preventDefault();
    if (!leadForm.name.trim() || !leadForm.phone.trim()) {
      window.toast?.({ type: 'warning', title: 'Missing details', message: 'Name and phone are required.' }); return;
    }
    setSaving(true);
    try {
      const data = await crmService.createLead(leadForm);
      setLeads((items) => [data.lead || data, ...items]);
      setModalOpen(false); setLeadForm(blankLead);
      window.toast?.({ type: 'success', title: 'Lead added', message: 'The prospect is now in your pipeline.' });
    } catch (error) { window.toast?.({ type: 'error', title: 'Lead not created', message: error.message }); }
    finally { setSaving(false); }
  };

  const metrics = useMemo(() => {
    const converted = leads.filter((lead) => lead.status === 'Converted');
    const monthly = converted.filter((lead) => new Date(lead.convertedAt || lead.updatedAt || 0).getMonth() === new Date().getMonth()).length;
    return [{ label: 'Total inquiries', value: leads.length, icon: Users }, { label: 'Active trials', value: leads.filter((lead) => lead.status === 'Trial').length, icon: BarChart3 }, { label: 'Converted this month', value: monthly, icon: Users }, { label: 'Win rate', value: `${leads.length ? Math.round((converted.length / leads.length) * 100) : 0}%`, icon: BarChart3 }];
  }, [leads]);
  const shown = leads.filter((lead) => (filter === 'All' || lead.status === filter) && `${lead.name} ${lead.phone} ${lead.email || ''}`.toLowerCase().includes(query.toLowerCase()));

  if (loading) return <div className="flex min-h-[360px] items-center justify-center"><Spinner size="lg" /></div>;
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-sm font-bold uppercase tracking-widest text-lime-700">Sales workspace</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Lead management</h1><p className="mt-1 text-slate-600">Move every inquiry from first touch to membership.</p></div><button type="button" className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={17} />Add new lead</button></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex justify-between"><p className="text-sm font-semibold text-slate-500">{label}</p><Icon className="h-5 w-5 text-lime-600" /></div><p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p></div>)}</div>
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex rounded-xl bg-slate-100 p-1"><button onClick={() => setView('kanban')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${view === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><KanbanSquare size={16} />Board</button><button onClick={() => setView('list')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><List size={16} />List</button></div><div className="flex flex-1 flex-col gap-2 sm:flex-row md:max-w-xl"><label className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input className="input pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone or email" /></label><select className="input sm:w-40" value={filter} onChange={(e) => setFilter(e.target.value)}><option>All</option>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></div></div></section>
    {view === 'kanban' ? <div className="grid min-w-max grid-cols-5 gap-4 overflow-x-auto pb-3">{stages.map((stage) => <KanbanColumn key={stage} stage={stage} leads={shown.filter((lead) => lead.status === stage)} onMove={changeStage} />)}</div> : <LeadTable leads={shown} onMove={changeStage} />}
    <ModalForm isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add new lead"><form className="space-y-4" onSubmit={createLead}>{[['name', 'Full name', 'text'], ['phone', 'Phone number', 'tel'], ['email', 'Email address', 'email']].map(([key, label, type]) => <label className="block" key={key}><span className="mb-1.5 block text-sm font-bold text-slate-700">{label}{key !== 'email' && ' *'}</span><input type={type} className="input" value={leadForm[key]} onChange={(e) => setLeadForm({ ...leadForm, [key]: e.target.value })} /></label>)}<label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Initial stage</span><select className="input" value={leadForm.status} onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Last note</span><textarea className="input min-h-24 resize-y" value={leadForm.notes} onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })} /></label><div className="flex justify-end gap-3 border-t pt-4"><button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Create lead</button></div></form></ModalForm>
  </div>;
};

const KanbanColumn = ({ stage, leads, onMove }) => <section onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const lead = JSON.parse(e.dataTransfer.getData('lead')); onMove(lead, stage); }} className="w-72 rounded-2xl border border-slate-200 bg-slate-100/80 p-3"><div className="mb-3 flex items-center justify-between px-1"><span className={`rounded-full border px-2.5 py-1 text-xs font-extrabold ${stageStyle[stage]}`}>{stage}</span><span className="text-sm font-bold text-slate-500">{leads.length}</span></div><div className="space-y-3">{leads.map((lead) => <article draggable onDragStart={(e) => e.dataTransfer.setData('lead', JSON.stringify(lead))} key={lead._id} className="cursor-grab rounded-xl border border-slate-200 bg-white p-4 shadow-sm active:cursor-grabbing"><p className="font-bold text-slate-900">{lead.name}</p><p className="mt-0.5 text-sm text-slate-500">{lead.phone}</p>{lead.notes && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{lead.notes}</p>}<select aria-label={`Move ${lead.name}`} className="mt-4 w-full rounded-lg border-slate-200 py-2 text-xs font-bold text-slate-600" value={lead.status} onChange={(e) => onMove(lead, e.target.value)}>{stages.map((item) => <option key={item}>{item}</option>)}</select></article>)}</div></section>;
const LeadTable = ({ leads, onMove }) => <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Lead</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">Last note</th><th className="px-5 py-4">Stage</th></tr></thead><tbody>{leads.map((lead) => <tr className="border-b last:border-0" key={lead._id}><td className="px-5 py-4 font-bold text-slate-900">{lead.name}<span className="mt-1 block font-normal text-slate-500">{lead.email || 'No email'}</span></td><td className="px-5 py-4 text-slate-600">{lead.phone}</td><td className="max-w-xs px-5 py-4 text-slate-600">{lead.notes || '—'}</td><td className="px-5 py-4"><select className="rounded-lg border-slate-200 py-2 text-xs font-bold" value={lead.status} onChange={(e) => onMove(lead, e.target.value)}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></td></tr>)}</tbody></table>{!leads.length && <p className="p-10 text-center text-sm text-slate-500">No leads match these filters.</p>}</div>;
export default LeadManagement;
