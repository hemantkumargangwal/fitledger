import { useEffect, useState } from 'react';
import { Building2, Lock, Save, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const Settings = () => {
  const { user, updateUser, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    gymName: '',
    ownerName: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      gymName: user.gymName || '',
      ownerName: user.ownerName || user.name || '',
      phone: user.phone || '',
      address: user.address || ''
    }));
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        gymName: form.gymName,
        ownerName: form.ownerName,
        phone: form.phone,
        address: form.address,
        ...(form.password ? { password: form.password } : {})
      };
      const response = await authService.updateProfile(payload);
      updateUser(response.user);
      await refreshProfile();
      setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));

      if (window.toast) {
        window.toast({
          type: 'success',
          title: 'Settings saved',
          message: 'Profile and gym settings updated successfully.',
          duration: 3000
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Update your profile, gym details, and password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <UserCircle className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="input" required />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Gym Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gym Name</label>
              <input name="gymName" value={form.gymName} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Owner Name</label>
              <input name="ownerName" value={form.ownerName} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
              <input name="address" value={form.address} onChange={handleChange} className="input" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="input" />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
