import { useEffect, useMemo, useState } from 'react';
import { Check, Edit, Plus, RefreshCw, Tags, Trash2, X } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import Spinner from '../components/Spinner';
import { membershipService } from '../services/membershipService';
import { formatCurrency } from '../utils/formatters';

const initialForm = {
  name: '',
  price: '',
  duration: '',
  ptIncluded: false,
};

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMembership, setEditingMembership] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMemberships = async ({ quiet = false } = {}) => {
    try {
      if (quiet) setRefreshing(true);
      else setLoading(true);
      const response = await membershipService.getMemberships();
      setMemberships(response.memberships || []);
    } catch (error) {
      console.error('Error loading memberships:', error);
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Loading failed',
          message: 'Membership list could not be loaded.',
          duration: 3500
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const totals = useMemo(() => ({
    plans: memberships.length,
    members: memberships.reduce((sum, item) => sum + Number(item.popularity || 0), 0),
    ptPlans: memberships.filter((item) => item.ptIncluded).length,
  }), [memberships]);

  const resetForm = () => {
    setEditingMembership(null);
    setFormData(initialForm);
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (membership) => {
    setEditingMembership(membership);
    setFormData({
      name: membership.name || '',
      price: membership.price ?? '',
      duration: membership.duration ?? '',
      ptIncluded: Boolean(membership.ptIncluded),
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const validateForm = () => {
    const errors = {};
    const price = Number(formData.price);
    const duration = Number(formData.duration);

    if (!formData.name.trim()) errors.name = 'Membership name is required';
    if (formData.price === '' || !Number.isFinite(price) || price < 0) errors.price = 'Price must be 0 or more';
    if (!Number.isInteger(duration) || duration < 1) errors.duration = 'Duration must be at least 1 month';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      duration: Number(formData.duration),
      ptIncluded: Boolean(formData.ptIncluded),
    };

    try {
      if (editingMembership) {
        await membershipService.updateMembership(editingMembership._id, payload);
      } else {
        await membershipService.createMembership(payload);
      }
      closeModal();
      fetchMemberships({ quiet: true });
      if (window.toast) {
        window.toast({
          type: 'success',
          title: editingMembership ? 'Membership updated' : 'Membership added',
          message: editingMembership ? 'Membership details saved successfully.' : 'New membership created successfully.',
          duration: 3500
        });
      }
    } catch (error) {
      console.error('Error saving membership:', error);
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Save failed',
          message: error.response?.data?.message || 'Membership could not be saved.',
          duration: 3500
        });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteClick = (membership) => {
    setMembershipToDelete(membership);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!membershipToDelete) return;
    setDeleteLoading(true);
    try {
      await membershipService.deleteMembership(membershipToDelete._id);
      setShowDeleteDialog(false);
      setMembershipToDelete(null);
      fetchMemberships({ quiet: true });
      if (window.toast) {
        window.toast({
          type: 'success',
          title: 'Membership deleted',
          message: 'Membership has been removed successfully.',
          duration: 3500
        });
      }
    } catch (error) {
      console.error('Error deleting membership:', error);
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Delete failed',
          message: 'Membership could not be deleted.',
          duration: 3500
        });
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (membership) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-lime-100 text-lime-700">
            <Tags size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-extrabold text-slate-900">{membership.name}</p>
            <p className="text-xs font-medium text-slate-500">{membership.ptIncluded ? 'PT included' : 'General plan'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (membership) => `${membership.duration} month${Number(membership.duration) > 1 ? 's' : ''}`
    },
    {
      key: 'popularity',
      label: 'Popularity',
      render: (membership) => (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
          {membership.popularity || 0} members
        </span>
      )
    },
    {
      key: 'price',
      label: 'Price',
      render: (membership) => <span className="font-extrabold text-slate-950">{formatCurrency(membership.price || 0)}</span>
    },
    {
      key: 'action',
      label: 'Action',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (membership) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => openEditModal(membership)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700"
            aria-label={`Update ${membership.name}`}
            title="Update"
          >
            <Edit size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteClick(membership)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${membership.name}`}
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Memberships</h1>
          <p className="mt-1 text-gray-600">Manage plan name, duration, price, PT inclusion, and popularity.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => fetchMemberships({ quiet: true })}
            className="btn-secondary"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button type="button" onClick={openAddModal} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add New Membership
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-gradient p-4">
          <p className="text-sm font-medium text-gray-600">Total Plans</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totals.plans}</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-sm font-medium text-gray-600">Members Using Plans</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totals.members}</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-sm font-medium text-gray-600">PT Included Plans</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totals.ptPlans}</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={memberships}
        keyField="_id"
        emptyMessage="No memberships found. Add your first membership plan."
      />

      <ModalForm
        isOpen={showModal}
        onClose={closeModal}
        title={editingMembership ? 'Update Membership' : 'Add Membership'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="membership-name">
              Membership Name
            </label>
            <input
              id="membership-name"
              type="text"
              value={formData.name}
              onChange={(event) => setFormData((data) => ({ ...data, name: event.target.value }))}
              className={`input ${formErrors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="Gold Plan"
            />
            {formErrors.name && <p className="mt-1 text-xs font-medium text-red-600">{formErrors.name}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="membership-price">
                Membership Price
              </label>
              <input
                id="membership-price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(event) => setFormData((data) => ({ ...data, price: event.target.value }))}
                className={`input ${formErrors.price ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="3000"
              />
              {formErrors.price && <p className="mt-1 text-xs font-medium text-red-600">{formErrors.price}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="membership-duration">
                Duration
              </label>
              <input
                id="membership-duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(event) => setFormData((data) => ({ ...data, duration: event.target.value }))}
                className={`input ${formErrors.duration ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="3"
              />
              {formErrors.duration && <p className="mt-1 text-xs font-medium text-red-600">{formErrors.duration}</p>}
            </div>
          </div>

          <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span>
              <span className="block text-sm font-extrabold text-slate-800">PT Include</span>
              <span className="block text-xs font-medium text-slate-500">Personal training is included in this plan.</span>
            </span>
            <input
              type="checkbox"
              checked={formData.ptIncluded}
              onChange={(event) => setFormData((data) => ({ ...data, ptIncluded: event.target.checked }))}
              className="h-5 w-5 rounded border-slate-300 text-lime-600 focus:ring-lime-500"
            />
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button type="submit" disabled={submitLoading} className="btn-primary">
              {submitLoading ? <Spinner size="sm" /> : <Check className="h-4 w-4" />}
              {editingMembership ? 'Update Membership' : 'Add Membership'}
            </button>
          </div>
        </form>
      </ModalForm>

      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => {
          setShowDeleteDialog(false);
          setMembershipToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Membership"
        message={`Delete ${membershipToDelete?.name || 'this membership'}? Existing members will not be deleted.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
        danger
      />
    </div>
  );
};

export default Memberships;
