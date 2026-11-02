import { useEffect, useMemo, useState } from 'react';
import { Check, ClipboardList, Copy, Edit, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import Spinner from '../components/Spinner';

const createEmptyRow = (fields) => fields.reduce((row, field) => ({ ...row, [field.key]: '' }), {});

const initialForm = (fields) => ({
  name: '',
  description: '',
  note: '',
  details: '',
  category: '',
  goal: '',
  difficulty: '',
  dietPreference: '',
  tableRows: [createEmptyRow(fields)],
});

const formatDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
};

const PlanManager = ({ config }) => {
  const [plans, setPlans] = useState([]);
  const [defaultPlans, setDefaultPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('defaults');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState(() => initialForm(config.rowFields));
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPlans = async ({ quiet = false } = {}) => {
    try {
      if (quiet) setRefreshing(true);
      else setLoading(true);
      const [data, templates] = await Promise.all([config.service.getPlans(), config.service.getDefaultPlans()]);
      setPlans(data);
      setDefaultPlans(templates);
    } catch (error) {
      console.error(`Error loading ${config.pluralLabel}:`, error);
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Loading failed',
          message: `${config.pluralLabel} could not be loaded.`,
          duration: 3500
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.route]);

  const totals = useMemo(() => ({
    plans: plans.length,
    popularity: plans.reduce((sum, plan) => sum + Number(plan.popularity || 0), 0),
    rows: plans.reduce((sum, plan) => sum + (plan.tableRows?.length || 0), 0),
  }), [plans]);

  const resetForm = () => {
    setEditingPlan(null);
    setFormData(initialForm(config.rowFields));
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      note: plan.note || '',
      details: plan.details || '',
      category: plan.category || '',
      goal: plan.goal || '',
      difficulty: plan.difficulty || '',
      dietPreference: plan.dietPreference || '',
      tableRows: plan.tableRows?.length ? plan.tableRows : [createEmptyRow(config.rowFields)],
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const updateRow = (index, key, value) => {
    setFormData((data) => ({
      ...data,
      tableRows: data.tableRows.map((row, rowIndex) => (
        rowIndex === index ? { ...row, [key]: value } : row
      ))
    }));
  };

  const addRow = () => {
    setFormData((data) => ({
      ...data,
      tableRows: [...data.tableRows, createEmptyRow(config.rowFields)]
    }));
  };

  const removeRow = (index) => {
    setFormData((data) => ({
      ...data,
      tableRows: data.tableRows.length > 1
        ? data.tableRows.filter((_, rowIndex) => rowIndex !== index)
        : [createEmptyRow(config.rowFields)]
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Plan name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      note: formData.note.trim(),
      details: formData.details.trim(),
      category: formData.category.trim(),
      goal: formData.goal.trim(),
      difficulty: formData.difficulty.trim(),
      dietPreference: formData.dietPreference.trim(),
      tableRows: formData.tableRows,
    };

    try {
      if (editingPlan) {
        await config.service.updatePlan(editingPlan._id, payload);
      } else {
        await config.service.createPlan(payload);
      }
      closeModal();
      fetchPlans({ quiet: true });
      if (window.toast) {
        window.toast({
          type: 'success',
          title: editingPlan ? `${config.singularLabel} updated` : `${config.singularLabel} added`,
          message: editingPlan ? 'Plan details saved successfully.' : 'New plan created successfully.',
          duration: 3500
        });
      }
    } catch (error) {
      console.error(`Error saving ${config.singularLabel}:`, error);
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Save failed',
          message: error.response?.data?.message || `${config.singularLabel} could not be saved.`,
          duration: 3500
        });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const cloneTemplate = async (template, customize = false) => {
    try {
      const response = await config.service.cloneDefaultPlan(template.templateCode);
      await fetchPlans({ quiet: true });
      window.toast?.({ type: 'success', title: response.existing ? 'Existing plan opened' : 'Plan added', message: `${template.name} is now in My Gym Plans.` });
      if (customize) openEditModal(response.plan);
      else setActiveTab('my-plans');
    } catch (error) {
      window.toast?.({ type: 'error', title: 'Could not add plan', message: error.response?.data?.message || 'Please try again.' });
    }
  };

  const duplicatePlan = async (plan) => {
    try { await config.service.duplicatePlan(plan._id); await fetchPlans({ quiet: true }); window.toast?.({ type: 'success', title: 'Plan duplicated', message: 'A separate editable copy was created.' }); }
    catch (error) { window.toast?.({ type: 'error', title: 'Duplicate failed', message: error.response?.data?.message || 'Please try again.' }); }
  };

  const togglePlanStatus = async (plan) => {
    try { await config.service.updatePlanStatus(plan._id, plan.isActive === false); await fetchPlans({ quiet: true }); }
    catch (error) { window.toast?.({ type: 'error', title: 'Status update failed', message: error.response?.data?.message || 'Please try again.' }); }
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;
    setDeleteLoading(true);
    try {
      await config.service.deletePlan(planToDelete._id);
      setShowDeleteDialog(false);
      setPlanToDelete(null);
      fetchPlans({ quiet: true });
      if (window.toast) {
        window.toast({
          type: 'success',
          title: `${config.singularLabel} deleted`,
          message: 'Plan has been removed successfully.',
          duration: 3500
        });
      }
    } catch (error) {
      console.error(`Error deleting ${config.singularLabel}:`, error);
      if (window.toast) {
        window.toast({
          type: 'error',
          title: 'Delete failed',
          message: `${config.singularLabel} could not be deleted.`,
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
      render: (plan) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}>
            <config.icon size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-extrabold text-slate-900">{plan.name}</p>
            <p className="text-xs font-medium text-slate-500">{plan.tableRows?.length || 0} rows</p>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (plan) => <span className="line-clamp-2 text-slate-600">{plan.description || 'No description'}</span>
    },
    {
      key: 'popularity',
      label: 'Popularity',
      render: (plan) => (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
          {plan.popularity || 0} members
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Date Added',
      render: (plan) => formatDate(plan.createdAt)
    },
    {
      key: 'action',
      label: 'Action',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (plan) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => openEditModal(plan)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700"
            aria-label={`Update ${plan.name}`}
            title="Update"
          >
            <Edit size={16} />
          </button>
          <button type="button" onClick={() => duplicatePlan(plan)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700" aria-label={`Duplicate ${plan.name}`} title="Duplicate"><Copy size={16} /></button>
          <button type="button" onClick={() => togglePlanStatus(plan)} className={`rounded-xl border px-2 text-xs font-bold ${plan.isActive === false ? 'border-slate-200 text-slate-500' : 'border-emerald-200 text-emerald-700'}`} title="Activate or deactivate">{plan.isActive === false ? 'Inactive' : 'Active'}</button>
          <button
            type="button"
            onClick={() => {
              setPlanToDelete(plan);
              setShowDeleteDialog(true);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${plan.name}`}
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

  const categories = [...new Set(defaultPlans.map((plan) => plan.category).filter(Boolean))];
  const shownDefaults = defaultPlans.filter((plan) => (category === 'all' || plan.category === category) && `${plan.name} ${plan.description} ${plan.difficulty || ''} ${plan.dietPreference || ''}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{config.pluralLabel}</h1>
          <p className="mt-1 text-gray-600">{config.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => fetchPlans({ quiet: true })} className="btn-secondary !h-10 !w-10 !p-0" aria-label={`Refresh ${config.pluralLabel.toLowerCase()}`} title={`Refresh ${config.pluralLabel}`}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button type="button" onClick={openAddModal} className="btn-primary">
            <Plus className="h-4 w-4" />
            {config.addButtonLabel}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => setActiveTab('defaults')} className={`rounded-lg px-4 py-2 text-sm font-bold ${activeTab === 'defaults' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Default Plans</button>
          <button type="button" onClick={() => setActiveTab('my-plans')} className={`rounded-lg px-4 py-2 text-sm font-bold ${activeTab === 'my-plans' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>My Gym Plans</button>
        </div>
        {activeTab === 'defaults' && <div className="flex flex-1 flex-col gap-2 sm:flex-row md:max-w-xl"><label className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input className="input pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search default plans" /></label><select className="input sm:w-44" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-gradient p-4">
          <p className="text-sm font-medium text-gray-600">Total Plans</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totals.plans}</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-sm font-medium text-gray-600">Assigned Members</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totals.popularity}</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-sm font-medium text-gray-600">Detail Rows</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totals.rows}</p>
        </div>
      </div>

      {activeTab === 'defaults' ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{shownDefaults.map((plan) => {
        const saved = plans.find((item) => item.templateCode === plan.templateCode);
        return <article key={plan.templateCode} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-wider text-lime-700">Default Template</p><h2 className="mt-1 font-extrabold text-slate-900">{plan.name}</h2></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{plan.difficulty || plan.dietPreference}</span></div><p className="mt-3 text-sm text-slate-600">{plan.description}</p><div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500"><span>{plan.category}</span><span>•</span><span>{plan.tableRows?.length || 0} {config.route === 'diet-plans' ? 'meals' : 'exercises'}</span></div><div className="mt-5 flex gap-2"><button type="button" onClick={() => cloneTemplate(plan, true)} className="btn-secondary flex-1">{saved ? 'Customize' : 'Customize'}</button><button type="button" onClick={() => cloneTemplate(plan)} className="btn-primary flex-1">{saved ? 'Open My Plan' : 'Add to My Plans'}</button></div></article>;
      })}{!shownDefaults.length && <p className="col-span-full py-10 text-center text-sm text-slate-500">No default plans match these filters.</p>}</div> : <DataTable
        columns={columns}
        data={plans}
        keyField="_id"
        emptyMessage={`No ${config.pluralLabel.toLowerCase()} found. Add your first plan.`}
      />}

      <ModalForm
        isOpen={showModal}
        onClose={closeModal}
        title={editingPlan ? `Update ${config.singularLabel}` : `Add ${config.singularLabel}`}
        className={config.route === 'workout-plans' ? 'sm:!max-w-6xl' : 'sm:max-w-5xl'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor={`${config.route}-name`}>
                  Plan Name
                </label>
                <input
                  id={`${config.route}-name`}
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData((data) => ({ ...data, name: event.target.value }))}
                  className={`input ${formErrors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder={config.namePlaceholder}
                />
                {formErrors.name && <p className="mt-1 text-xs font-medium text-red-600">{formErrors.name}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Category</label><input className="input" value={formData.category || ''} onChange={(event) => setFormData((data) => ({ ...data, category: event.target.value }))} placeholder="General Fitness" /></div>
                <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Goal</label><input className="input" value={formData.goal || ''} onChange={(event) => setFormData((data) => ({ ...data, goal: event.target.value }))} placeholder="Member goal" /></div>
                {config.route === 'workout-plans' ? <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Difficulty</label><select className="input" value={formData.difficulty || ''} onChange={(event) => setFormData((data) => ({ ...data, difficulty: event.target.value }))}><option value="">Select difficulty</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div> : <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Diet preference</label><select className="input" value={formData.dietPreference || ''} onChange={(event) => setFormData((data) => ({ ...data, dietPreference: event.target.value }))}><option value="">Select preference</option><option>Vegetarian</option><option>Non-Vegetarian</option><option>Vegan</option></select></div>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor={`${config.route}-description`}>
                  Description
                </label>
                <textarea
                  id={`${config.route}-description`}
                  value={formData.description}
                  onChange={(event) => setFormData((data) => ({ ...data, description: event.target.value }))}
                  className="input min-h-24 resize-y"
                  placeholder={config.descriptionPlaceholder}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor={`${config.route}-note`}>
                  Note
                </label>
                <textarea
                  id={`${config.route}-note`}
                  value={formData.note}
                  onChange={(event) => setFormData((data) => ({ ...data, note: event.target.value }))}
                  className="input min-h-24 resize-y"
                  placeholder="Trainer instructions, precautions, or follow-up notes"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor={`${config.route}-details`}>
                  {config.detailsLabel}
                </label>
                <textarea
                  id={`${config.route}-details`}
                  value={formData.details}
                  onChange={(event) => setFormData((data) => ({ ...data, details: event.target.value }))}
                  className="input min-h-32 resize-y"
                  placeholder={config.detailsPlaceholder}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{config.tableTitle}</h3>
                  <p className="text-xs text-slate-500">Add rows in table format.</p>
                </div>
                <button type="button" onClick={addRow} className="btn-secondary">
                  <Plus className="h-4 w-4" />
                  Row
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="min-w-[720px] w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {config.rowFields.map((field) => (
                        <th key={field.key} className="px-3 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">
                          {field.label}
                        </th>
                      ))}
                      <th className="w-12 px-3 py-3" aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.tableRows.map((row, index) => (
                      <tr key={index}>
                        {config.rowFields.map((field) => (
                          <td key={field.key} className="p-2">
                            <input
                              type="text"
                              value={row[field.key] || ''}
                              onChange={(event) => updateRow(index, field.key, event.target.value)}
                              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
                              placeholder={field.placeholder}
                            />
                          </td>
                        ))}
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeRow(index)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            aria-label="Remove row"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button type="submit" disabled={submitLoading} className="btn-primary">
              {submitLoading ? <Spinner size="sm" /> : <Check className="h-4 w-4" />}
              {editingPlan ? `Update ${config.singularLabel}` : `Add ${config.singularLabel}`}
            </button>
          </div>
        </form>
      </ModalForm>

      <ConfirmDialog
        open={showDeleteDialog}
        onCancel={() => {
          setShowDeleteDialog(false);
          setPlanToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${config.singularLabel}`}
        message={`Delete ${planToDelete?.name || 'this plan'}? Existing members will not be deleted.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
        danger
      />
    </div>
  );
};

PlanManager.defaultProps = {
  config: {
    icon: ClipboardList,
    iconClass: 'bg-lime-100 text-lime-700',
  }
};

export default PlanManager;
