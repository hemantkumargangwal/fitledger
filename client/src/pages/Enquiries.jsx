import { useEffect, useState } from 'react';
import { Check, Edit, Mail, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import Spinner from '../components/Spinner';
import { enquiryService } from '../services/enquiryService';

const makeInitialForm = () => ({
  name: '', email: '', mobile: '', address: '', sender: '', source: '', assignedTo: '',
  occupation: '', suitableTimeSlot: '', nextFollowUp: '', convertibilityNote: '',
  enquiryDate: new Date().toISOString().slice(0, 10),
});

const statuses = ['open', 'in-progress', 'closed', 'converted'];
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric'
}).format(new Date(value)) : '-';

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [formData, setFormData] = useState(makeInitialForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEnquiries = async ({ quiet = false } = {}) => {
    try {
      quiet ? setRefreshing(true) : setLoading(true);
      const response = await enquiryService.getEnquiries();
      setEnquiries(response.enquiries || []);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      window.toast?.({ type: 'error', title: 'Loading failed', message: 'Enquiries could not be loaded.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchEnquiries(); }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditingEnquiry(null);
    setFormData(makeInitialForm());
    setFormErrors({});
  };

  const openEditModal = (enquiry) => {
    setEditingEnquiry(enquiry);
    setFormData({
      name: enquiry.name || '', email: enquiry.email || '', mobile: enquiry.mobile || '',
      address: enquiry.address || '', sender: enquiry.sender || '', source: enquiry.source || '',
      assignedTo: enquiry.assignedTo || '', occupation: enquiry.occupation || '',
      suitableTimeSlot: enquiry.suitableTimeSlot || '',
      nextFollowUp: enquiry.nextFollowUp?.slice(0, 10) || '',
      convertibilityNote: enquiry.convertibilityNote || '',
      enquiryDate: enquiry.enquiryDate?.slice(0, 10) || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));
  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.mobile.trim()) errors.mobile = 'Mobile number is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitLoading(true);
    try {
      if (editingEnquiry) await enquiryService.updateEnquiry(editingEnquiry._id, formData);
      else await enquiryService.createEnquiry(formData);
      const message = editingEnquiry ? 'Enquiry details saved.' : 'New enquiry added.';
      closeModal();
      await fetchEnquiries({ quiet: true });
      window.toast?.({ type: 'success', title: 'Enquiry saved', message });
    } catch (error) {
      window.toast?.({ type: 'error', title: 'Save failed', message: error.response?.data?.message || 'Enquiry could not be saved.' });
    } finally { setSubmitLoading(false); }
  };

  const changeStatus = async (enquiry, status) => {
    try {
      const response = await enquiryService.updateStatus(enquiry._id, status);
      setEnquiries((items) => items.map((item) => item._id === enquiry._id ? response.enquiry : item));
    } catch (error) {
      window.toast?.({ type: 'error', title: 'Status update failed', message: error.response?.data?.message || 'Please try again.' });
    }
  };

  const sendFormEmail = async (enquiry) => {
    if (!enquiry.email) {
      window.toast?.({ type: 'info', title: 'Email required', message: 'Add an email address before sending the enquiry form.' });
      return;
    }
    try {
      await enquiryService.sendEmail(enquiry._id);
      window.toast?.({ type: 'success', title: 'Email sent', message: `Email sent to ${enquiry.email}.` });
    } catch (error) {
      window.toast?.({ type: 'error', title: 'Email failed', message: error.response?.data?.message || 'Enquiry email could not be sent.' });
    }
  };

  const deleteEnquiry = async () => {
    if (!enquiryToDelete) return;
    setDeleteLoading(true);
    try {
      await enquiryService.deleteEnquiry(enquiryToDelete._id);
      setEnquiries((items) => items.filter((item) => item._id !== enquiryToDelete._id));
      setEnquiryToDelete(null);
    } catch (error) {
      window.toast?.({ type: 'error', title: 'Delete failed', message: error.response?.data?.message || 'Please try again.' });
    } finally { setDeleteLoading(false); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (item) => <span className="font-bold text-slate-950">{item.name}</span> },
    { key: 'mobile', label: 'Number' },
    { key: 'email', label: 'Email', render: (item) => item.email || '-' },
    {
      key: 'status', label: 'Status', render: (item) => (
        <select className="input min-w-32 py-2 text-xs font-bold capitalize" value={item.status} onChange={(event) => changeStatus(item, event.target.value)}>
          {statuses.map((status) => <option key={status} value={status}>{status.replace('-', ' ')}</option>)}
        </select>
      )
    },
    { key: 'enquiryDate', label: 'Enquiry Date', render: (item) => formatDate(item.enquiryDate) },
    {
      key: 'action', label: 'Action', headerClassName: 'text-right', className: 'text-right', render: (item) => (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => sendFormEmail(item)} title="Send enquiry email" aria-label={`Send enquiry email to ${item.name}`} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700"><Mail size={16} /></button>
          <button type="button" onClick={() => openEditModal(item)} title="Edit enquiry" aria-label={`Edit ${item.name}`} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700"><Edit size={16} /></button>
          <button type="button" onClick={() => setEnquiryToDelete(item)} title="Delete enquiry" aria-label={`Delete ${item.name}`} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  if (loading) return <div className="flex min-h-[360px] items-center justify-center"><Spinner size="lg" /></div>;

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div><h1 className="text-3xl font-bold tracking-tight text-gray-900">Enquiries</h1><p className="mt-1 text-gray-600">Track prospects, follow-ups, and conversions.</p></div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => fetchEnquiries({ quiet: true })} className="btn-secondary"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />Refresh</button>
        <button type="button" onClick={() => { setEditingEnquiry(null); setFormData(makeInitialForm()); setFormErrors({}); setShowModal(true); }} className="btn-primary"><Plus className="h-4 w-4" />Add New Enquiry</button>
      </div>
    </div>
    <DataTable columns={columns} data={enquiries} keyField="_id" emptyMessage="No enquiries found. Add your first prospect to get started." />
    <ModalForm isOpen={showModal} onClose={closeModal} title={editingEnquiry ? 'Update Enquiry' : 'Add New Enquiry'} className="sm:max-w-5xl">
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Name" error={formErrors.name}><input className="input" value={formData.name} onChange={(e) => updateField('name', e.target.value)} /></Field>
          <Field label="Email"><input className="input" type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} /></Field>
          <Field label="Mobile" error={formErrors.mobile}><input className="input" value={formData.mobile} onChange={(e) => updateField('mobile', e.target.value)} /></Field>
          <Field label="Sender"><input className="input" value={formData.sender} onChange={(e) => updateField('sender', e.target.value)} placeholder="Who referred or submitted it?" /></Field>
          <Field label="Enquiry Source"><input className="input" value={formData.source} onChange={(e) => updateField('source', e.target.value)} placeholder="Walk-in, Instagram, referral..." /></Field>
          <Field label="Assign To"><input className="input" value={formData.assignedTo} onChange={(e) => updateField('assignedTo', e.target.value)} /></Field>
          <Field label="Occupation"><input className="input" value={formData.occupation} onChange={(e) => updateField('occupation', e.target.value)} /></Field>
          <Field label="Suitable Time Slot"><input className="input" value={formData.suitableTimeSlot} onChange={(e) => updateField('suitableTimeSlot', e.target.value)} placeholder="e.g. 6:00–7:00 PM" /></Field>
          <Field label="Next Follow-up"><input className="input" type="date" value={formData.nextFollowUp} onChange={(e) => updateField('nextFollowUp', e.target.value)} /></Field>
          <Field label="Enquiry Date"><input className="input" type="date" value={formData.enquiryDate} onChange={(e) => updateField('enquiryDate', e.target.value)} /></Field>
          <div className="md:col-span-2"><Field label="Address"><textarea className="input min-h-24 resize-y" value={formData.address} onChange={(e) => updateField('address', e.target.value)} /></Field></div>
          <div className="md:col-span-3"><Field label="Convertibility Note"><textarea className="input min-h-24 resize-y" value={formData.convertibilityNote} onChange={(e) => updateField('convertibilityNote', e.target.value)} placeholder="e.g. Asked for a discount" /></Field></div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={closeModal} className="btn-secondary"><X className="h-4 w-4" />Cancel</button><button type="submit" disabled={submitLoading} className="btn-primary">{submitLoading ? <Spinner size="sm" /> : <Check className="h-4 w-4" />}{editingEnquiry ? 'Update Enquiry' : 'Add Enquiry'}</button></div>
      </form>
    </ModalForm>
    <ConfirmDialog open={Boolean(enquiryToDelete)} onCancel={() => setEnquiryToDelete(null)} onConfirm={deleteEnquiry} title="Delete Enquiry" message={`Delete ${enquiryToDelete?.name || 'this enquiry'}?`} confirmLabel="Delete" cancelLabel="Cancel" loading={deleteLoading} danger />
  </div>;
};

const Field = ({ label, error, children }) => <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>{children}{error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}</label>;

export default Enquiries;
