import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import Spinner from '../components/Spinner';
import Seo from '../components/Seo';
import { authService } from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const [form, setForm] = useState({
    email: initialEmail,
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!form.otp.trim() || form.otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email: form.email.trim(),
        otp: form.otp.trim(),
        newPassword: form.newPassword
      });
      if (window.toast) {
        window.toast({
          type: 'success',
          title: 'Password reset',
          message: 'Your password has been reset successfully. Please log in.',
          duration: 3000
        });
      }
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Seo
        title="Reset Password"
        description="Verify OTP and set a new password for your FitLedger account."
        path="/reset-password"
        robots="noindex, nofollow"
      />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Dumbbell className="w-12 h-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Enter the OTP sent to your email and choose a new password.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{error}</div>}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className="input" />
              </div>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">6-digit OTP</label>
              <div className="mt-1">
                <input id="otp" name="otp" type="text" required maxLength={6} value={form.otp} onChange={handleChange} className="input tracking-[0.3em]" placeholder="123456" />
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New password</label>
              <div className="mt-1 relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.newPassword}
                  onChange={handleChange}
                  className="input pr-10"
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword((s) => !s)}>
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm password</label>
              <div className="mt-1">
                <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} required value={form.confirmPassword} onChange={handleChange} className="input" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-2 px-4 text-sm font-medium inline-flex items-center justify-center gap-2">
              {loading && <Spinner className="w-4 h-4" />}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">Resend OTP</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
