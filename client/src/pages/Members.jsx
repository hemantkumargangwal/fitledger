import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Edit, Mail, MessageCircle, Plus, RefreshCw, Search, Send, Smartphone, Trash2, UserPlus, X } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import Spinner from '../components/Spinner';
import { memberService } from '../services/memberService';

const initialForm = {
  name: '',
  phone: '',
  gender: '',
  email: '',
  dateOfBirth: '',
  anniversaryDate: '',
  address: '',
  emergencyContactNumber: '',
  photo: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  documentId: '',
  bodyStats: {
    height: '',
    weight: '',
    bmi: '',
    bodyFat: '',
    shoulder: '',
    chest: '',
    hips: '',
    abs: '',
    waistHip: '',
    bloodMeasurementDate: '',
  },
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
};

const Members = () => {
  const [members, setMembers] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [membersToDelete, setMembersToDelete] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [nameSearch, setNameSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTab, setShareTab] = useState('email');
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  const fetchMembers = async ({ quiet = false } = {}) => {
    try {
      if (quiet) setRefreshing(true);
      else setLoading(true);
      const response = await memberService.getMembers({ limit: 100, sortBy: 'joiningDate', sortOrder: 'desc' });
      setMembers(response.members || []);
      setSelectedMemberIds([]);
    } catch (error) {
      console.error('Error fetching members:', error);
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Loading failed',
          message: 'Members could not be loaded.',
          duration: 3500
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPendingEnrollments = async () => {
    try {
      const response = await memberService.getPendingEnrollments();
      setPendingEnrollments(response.enrollments || []);
    } catch (error) {
      console.error('Error loading pending enrollments:', error);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchPendingEnrollments();
  }, []);

  const resetForm = () => {
    setEditingMember(null);
    setFormData(initialForm);
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      phone: member.phone || '',
      gender: member.gender || '',
      email: member.email || '',
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.slice(0, 10) : '',
      anniversaryDate: member.anniversaryDate ? member.anniversaryDate.slice(0, 10) : '',
      address: member.address || '',
      emergencyContactNumber: member.emergencyContactNumber || '',
      photo: member.photo || '',
      joiningDate: member.joiningDate ? member.joiningDate.slice(0, 10) : '',
      documentId: member.documentId || '',
      bodyStats: {
        height: member.bodyStats?.height || '',
        weight: member.bodyStats?.weight || '',
        bmi: member.bodyStats?.bmi || '',
        bodyFat: member.bodyStats?.bodyFat || '',
        shoulder: member.bodyStats?.shoulder || '',
        chest: member.bodyStats?.chest || '',
        hips: member.bodyStats?.hips || '',
        abs: member.bodyStats?.abs || '',
        waistHip: member.bodyStats?.waistHip || '',
        bloodMeasurementDate: member.bodyStats?.bloodMeasurementDate ? member.bodyStats.bloodMeasurementDate.slice(0, 10) : '',
      },
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const updateField = (field, value) => {
    setFormData((data) => ({ ...data, [field]: value }));
  };

  const updateBodyStat = (field, value) => {
    setFormData((data) => ({
      ...data,
      bodyStats: { ...data.bodyStats, [field]: value }
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.phone.trim()) errors.phone = 'Mobile is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      if (editingMember) {
        await memberService.updateMember(editingMember._id, formData);
      } else {
        await memberService.createMember(formData);
      }
      closeModal();
      fetchMembers({ quiet: true });
      if (window.toast) {
        window.toast({
          type: 'success',
          title: editingMember ? 'Member updated' : 'Member added',
          message: editingMember ? 'Member details saved successfully.' : 'Enrollment details saved successfully.',
          duration: 3500
        });
      }
    } catch (error) {
      console.error('Error saving member:', error);
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Save failed',
          message: error.response?.data?.message || 'Member could not be saved.',
          duration: 3500
        });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!membersToDelete.length) return;
    setDeleteLoading(true);
    try {
      if (membersToDelete.length === 1) await memberService.deleteMember(membersToDelete[0]._id);
      else await memberService.bulkDelete(membersToDelete.map((member) => member._id));
      setShowDeleteDialog(false);
      setMembersToDelete([]);
      fetchMembers({ quiet: true });
    } catch (error) {
      console.error('Error deleting member:', error);
      window.toast?.({ type: 'error', title: 'Delete failed', message: error.response?.data?.message || 'Members could not be deleted.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const reviewEnrollment = async (enrollment, action) => {
    try {
      if (action === 'approve') await memberService.approveEnrollment(enrollment._id);
      else await memberService.rejectEnrollment(enrollment._id);
      await fetchPendingEnrollments();
      if (action === 'approve') await fetchMembers({ quiet: true });
      window.toast?.({ type: 'success', title: action === 'approve' ? 'Enrollment approved' : 'Enrollment rejected', message: action === 'approve' ? `${enrollment.name} is now a member.` : `${enrollment.name}'s enrollment was rejected.` });
    } catch (error) {
      window.toast?.({ type: 'error', title: 'Action failed', message: error.response?.data?.message || 'Please try again.' });
    }
  };

  const visibleMembers = useMemo(() => {
    const query = nameSearch.trim().toLowerCase();
    return members.filter((member) => {
      const nameMatches = !query || member.name?.toLowerCase().includes(query);
      const statusMatches = statusFilter === 'all' || member.status === statusFilter;
      return nameMatches && statusMatches;
    });
  }, [members, nameSearch, statusFilter]);

  const allVisibleSelected = visibleMembers.length > 0 && visibleMembers.every((member) => selectedMemberIds.includes(member._id));
  const toggleMemberSelection = (memberId) => {
    setSelectedMemberIds((ids) => ids.includes(memberId) ? ids.filter((id) => id !== memberId) : [...ids, memberId]);
  };
  const toggleAllVisible = () => {
    const visibleIds = visibleMembers.map((member) => member._id);
    setSelectedMemberIds((ids) => allVisibleSelected ? ids.filter((id) => !visibleIds.includes(id)) : [...new Set([...ids, ...visibleIds])]);
  };
  const openDeleteDialog = (items) => {
    setMembersToDelete(items);
    setShowDeleteDialog(true);
  };

  const openShareModal = () => {
    setShareTab('email');
    setShareEmail('');
    setShareError('');
    setShowShareModal(true);
  };

  const shareEnrollmentForm = async (event) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(shareEmail.trim())) {
      setShareError('Please enter a valid email address.');
      return;
    }
    setShareLoading(true);
    try {
      await memberService.sendEnrollmentInvitation(shareEmail.trim());
      setShowShareModal(false);
      window.toast?.({ type: 'success', title: 'Enrollment form sent', message: `The form has been emailed to ${shareEmail.trim()}.`, duration: 3500 });
    } catch (error) {
      setShareError(error.response?.data?.message || 'The enrollment form could not be sent. Please try again.');
    } finally {
      setShareLoading(false);
    }
  };

  const columns = [
    {
      key: 'select',
      label: <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Select all visible members" className="h-4 w-4 rounded border-slate-300 text-lime-600 focus:ring-lime-500" />,
      className: 'w-12',
      headerClassName: 'w-12',
      render: (member) => <input type="checkbox" checked={selectedMemberIds.includes(member._id)} onChange={() => toggleMemberSelection(member._id)} aria-label={`Select ${member.name}`} className="h-4 w-4 rounded border-slate-300 text-lime-600 focus:ring-lime-500" />
    },
    {
      key: 'name',
      label: 'Fullname',
      render: (member) => (
        <Link to={`/members/${member._id}`} className="font-extrabold text-slate-950 hover:text-lime-700">
          <span>{member.name}</span>
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
            {member.memberCode || 'new'}
          </span>
        </Link>
      )
    },
    { key: 'phone', label: 'Mobile' },
    { key: 'email', label: 'Email', render: (member) => member.email || '-' },
    { key: 'joiningDate', label: 'Date of Joining', render: (member) => formatDate(member.joiningDate) },
    { key: 'expiryDate', label: 'Membership Expiry', render: (member) => formatDate(member.expiryDate) },
    {
      key: 'status',
      label: 'Membership Status',
      render: (member) => (
        <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${
          member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {member.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'action',
      label: 'Action',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (member) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => openEditModal(member)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700"
            aria-label={`Update ${member.name}`}
            title="Update"
          >
            <Edit size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              openDeleteDialog([member]);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${member.name}`}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Members</h1>
          <p className="mt-1 text-gray-600">Enrollment, profile details, and membership status.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => fetchMembers({ quiet: true })} className="btn-secondary !h-10 !w-10 !p-0" aria-label="Refresh members" title="Refresh members">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button type="button" onClick={openShareModal} className="btn-secondary">
            <Send className="h-4 w-4" />
            Share Enrollment Form
          </button>
          <button type="button" onClick={openAddModal} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add New Member
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" value={nameSearch} onChange={(event) => setNameSearch(event.target.value)} placeholder="Search by member name" />
        </label>
        <select className="input md:w-48" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by membership status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
        {selectedMemberIds.length > 0 && <button type="button" onClick={() => openDeleteDialog(members.filter((member) => selectedMemberIds.includes(member._id)))} className="btn-danger whitespace-nowrap"><Trash2 className="h-4 w-4" />Delete selected ({selectedMemberIds.length})</button>}
      </div>

      {pendingEnrollments.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/40 shadow-sm">
          <div className="flex flex-col gap-1 border-b border-amber-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900">Pending Enrollment Requests</h2>
              <p className="text-sm text-slate-600">Approve a request to create the member in your gym.</p>
            </div>
            <span className="w-fit rounded-full bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-800">{pendingEnrollments.length} pending</span>
          </div>
          <div className="divide-y divide-amber-100 bg-white">
            {pendingEnrollments.map((enrollment) => (
              <div key={enrollment._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-900">{enrollment.name}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{enrollment.phone}{enrollment.email ? ` · ${enrollment.email}` : ''}</p>
                  <p className="mt-1 text-xs text-slate-400">Submitted {formatDate(enrollment.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => reviewEnrollment(enrollment, 'reject')} className="btn-secondary !border-red-200 !text-red-700 hover:!bg-red-50"><X className="h-4 w-4" /> Reject</button>
                  <button type="button" onClick={() => reviewEnrollment(enrollment, 'approve')} className="btn-primary"><Check className="h-4 w-4" /> Approve</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <DataTable columns={columns} data={visibleMembers} keyField="_id" emptyMessage="No members found." />

      <ModalForm
        isOpen={showModal}
        onClose={closeModal}
        title={editingMember ? 'Update Member' : 'Add New Member'}
        className="sm:!max-w-6xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <div className="mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-lime-600" />
              <h3 className="text-base font-extrabold text-slate-900">Basic Details</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Full Name" error={formErrors.name}>
                <input className="input" value={formData.name} onChange={(e) => updateField('name', e.target.value)} />
              </Field>
              <Field label="Mobile" error={formErrors.phone}>
                <input className="input" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
              </Field>
              <Field label="Gender">
                <select className="input" value={formData.gender} onChange={(e) => updateField('gender', e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Email">
                <input className="input" type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
              </Field>
              <Field label="Date of Birth">
                <input className="input" type="date" value={formData.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
              </Field>
              <Field label="Anniversary Date">
                <input className="input" type="date" value={formData.anniversaryDate} onChange={(e) => updateField('anniversaryDate', e.target.value)} />
              </Field>
              <Field label="Emergency Contact Number">
                <input className="input" value={formData.emergencyContactNumber} onChange={(e) => updateField('emergencyContactNumber', e.target.value)} />
              </Field>
              <Field label="Photo">
                <input className="input" value={formData.photo} onChange={(e) => updateField('photo', e.target.value)} placeholder="Photo URL" />
              </Field>
              <Field label="Date of Joining">
                <input className="input" type="date" value={formData.joiningDate} onChange={(e) => updateField('joiningDate', e.target.value)} />
              </Field>
              <Field label="Document ID">
                <input className="input" value={formData.documentId} onChange={(e) => updateField('documentId', e.target.value)} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Address">
                  <textarea className="input min-h-24 resize-y" value={formData.address} onChange={(e) => updateField('address', e.target.value)} />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-base font-extrabold text-slate-900">Body Stats</h3>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ['height', 'Height'],
                ['weight', 'Weight'],
                ['bmi', 'BMI'],
                ['bodyFat', 'Body Fat'],
                ['shoulder', 'Shoulder'],
                ['chest', 'Chest'],
                ['hips', 'Hips'],
                ['abs', 'Abs'],
                ['waistHip', 'Waist Hip'],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <input className="input" value={formData.bodyStats[key]} onChange={(e) => updateBodyStat(key, e.target.value)} />
                </Field>
              ))}
              <Field label="Blood Measurement Date">
                <input className="input" type="date" value={formData.bodyStats.bloodMeasurementDate} onChange={(e) => updateBodyStat('bloodMeasurementDate', e.target.value)} />
              </Field>
            </div>
          </section>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button type="submit" disabled={submitLoading} className="btn-primary">
              {submitLoading ? <Spinner size="sm" /> : <Check className="h-4 w-4" />}
              {editingMember ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </ModalForm>

      <ModalForm
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Enrollment Form"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-600">Send a secure enrollment link so a new member can fill in their own details.</p>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Enrollment sharing method">
            {[
              ['email', 'Email', Mail],
              ['whatsapp', 'WhatsApp', MessageCircle],
              ['sms', 'SMS', Smartphone],
            ].map(([id, label, Icon]) => (
              <button key={id} type="button" role="tab" aria-selected={shareTab === id} onClick={() => { setShareTab(id); setShareError(''); }} className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-bold transition ${shareTab === id ? 'bg-white text-lime-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>

          {shareTab === 'email' ? (
            <form onSubmit={shareEnrollmentForm} className="space-y-4">
              <Field label="Member's email address" error={shareError}>
                <input className="input" type="email" value={shareEmail} onChange={(event) => { setShareEmail(event.target.value); setShareError(''); }} placeholder="member@example.com" autoFocus />
              </Field>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowShareModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={shareLoading} className="btn-primary">{shareLoading ? <Spinner size="sm" /> : <Send className="h-4 w-4" />} Send email</button>
              </div>
            </form>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                {shareTab === 'whatsapp' ? <MessageCircle className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
              </div>
              <p className="font-bold text-slate-800">Coming soon</p>
              <p className="mt-1 text-sm text-slate-500">Sharing enrollment forms by {shareTab === 'whatsapp' ? 'WhatsApp' : 'SMS'} will be available soon.</p>
            </div>
          )}
        </div>
      </ModalForm>

      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => {
          setShowDeleteDialog(false);
          setMembersToDelete([]);
        }}
        onConfirm={handleDeleteConfirm}
        title={membersToDelete.length > 1 ? 'Delete Members' : 'Delete Member'}
        message={membersToDelete.length > 1 ? `Delete ${membersToDelete.length} selected members? Their payments will also be deleted.` : `Delete ${membersToDelete[0]?.name || 'this member'}? Payments for this member may also be affected.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
        danger
      />
    </div>
  );
};

const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
    {children}
    {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
  </label>
);

export default Members;
