import { useEffect, useState } from 'react';
import { Building2 } from "lucide-react";
 import { Lock } from "lucide-react";
import { ShieldCheck } from "lucide-react";
import { UserCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiError } from '../services/api';
import { authService } from '../services/authService';

const inputClass = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-4 focus:ring-lime-400/15';

const Settings = () => {
  const { user, updateUser, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', email: '', gymName: '', ownerName: '', phone: '', address: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name || '',
      email: user.email || '',
      gymName: user.gymName || '',
      ownerName: user.ownerName || user.name || '',
      phone: user.phone || '',
      address: user.address || '',
    });
  }, [user]);

  const handleProfileChange = (event) => {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileError('');
    setSavingProfile(true);
    try {
      const response = await authService.updateProfile(profile);
      updateUser(response.user);
      await refreshProfile();
      window.toast?.({ type: 'success', title: 'Settings saved', message: 'Owner and gym details updated.', duration: 3000 });
    } catch (error) {
      setProfileError(getApiError(error, 'Unable to save settings.').message);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');
    if (passwords.newPassword.length < 8 || !/[A-Za-z]/.test(passwords.newPassword) || !/\d/.test(passwords.newPassword)) {
      setPasswordError('New password must be at least 8 characters and include a letter and number.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      logout();
      navigate('/login', { replace: true });
      window.toast?.({ type: 'success', title: 'Password changed', message: 'Please sign in again with your new password.', duration: 4000 });
    } catch (error) {
      setPasswordError(getApiError(error, 'Unable to change password.').message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lime-400"><UserCircle size={21} /></div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-950">Owner profile</h2>
              <p className="text-xs text-slate-500">Account identity used across FitLedger.</p>
            </div>
          </div>
        </div>
        <form onSubmit={saveProfile} className="space-y-6 p-6">
          {profileError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{profileError}</div>}
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Your name<input name="name" value={profile.name} onChange={handleProfileChange} className={`${inputClass} mt-2`} required /></label>
            <label className="text-sm font-bold text-slate-700">Account email<input name="email" type="email" value={profile.email} onChange={handleProfileChange} className={`${inputClass} mt-2`} required /></label>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="mb-5 flex items-center gap-2"><Building2 size={18} className="text-lime-700" /><h3 className="font-extrabold text-slate-900">Gym information</h3></div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">Gym name<input name="gymName" value={profile.gymName} onChange={handleProfileChange} className={`${inputClass} mt-2`} required /></label>
              <label className="text-sm font-bold text-slate-700">Owner name<input name="ownerName" value={profile.ownerName} onChange={handleProfileChange} className={`${inputClass} mt-2`} required /></label>
              <label className="text-sm font-bold text-slate-700">Phone<input name="phone" value={profile.phone} onChange={handleProfileChange} className={`${inputClass} mt-2`} placeholder="+91 98765 43210" /></label>
              <label className="text-sm font-bold text-slate-700">Address<input name="address" value={profile.address} onChange={handleProfileChange} className={`${inputClass} mt-2`} placeholder="Gym address" /></label>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button type="submit" disabled={savingProfile} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-60">
              <Save size={17} /> {savingProfile ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
          <div className="bg-[#151a14] p-6 text-white sm:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400 text-slate-950"><ShieldCheck size={21} /></div>
            <h2 className="mt-5 text-xl font-black">Account security</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Changing your password immediately signs out existing access tokens, including this session.</p>
          </div>

          <form onSubmit={changePassword} className="space-y-5 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2"><Lock size={19} className="text-lime-700" /><h3 className="font-extrabold text-slate-950">Change password</h3></div>
              <button type="button" onClick={() => setShowPasswords((value) => !value)} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-lime-700">
                {showPasswords ? <EyeOff size={15} /> : <Eye size={15} />} {showPasswords ? 'Hide' : 'Show'}
              </button>
            </div>
            {passwordError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{passwordError}</div>}
            <label className="block text-sm font-bold text-slate-700">Current password<input name="currentPassword" type={showPasswords ? 'text' : 'password'} autoComplete="current-password" value={passwords.currentPassword} onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))} className={`${inputClass} mt-2`} required /></label>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">New password<input name="newPassword" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} className={`${inputClass} mt-2`} required /></label>
              <label className="text-sm font-bold text-slate-700">Confirm password<input name="confirmPassword" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" value={passwords.confirmPassword} onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))} className={`${inputClass} mt-2`} required /></label>
            </div>
            <p className="text-xs text-slate-500">Use at least 8 characters with a letter and number.</p>
            <button type="submit" disabled={savingPassword} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-lime-400 px-5 text-sm font-extrabold text-slate-950 transition hover:bg-lime-300 disabled:opacity-60">
              <Lock size={17} /> {savingPassword ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Settings;
