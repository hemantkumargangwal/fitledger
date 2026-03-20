import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import Spinner from '../components/Spinner';
import Seo from '../components/Seo';
import { authService } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
      if (window.toast) {
        window.toast({
          type: 'success',
          title: 'OTP sent',
          message: 'If your account exists, an OTP has been sent to your email.',
          duration: 3000
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send OTP right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Seo
        title="Forgot Password"
        description="Request an OTP to reset your FitLedger account password."
        path="/forgot-password"
        robots="noindex, nofollow"
      />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Dumbbell className="w-12 h-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Forgot password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">We&apos;ll send a 6-digit OTP to your registered email.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{error}</div>}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="Enter your registered email"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-2 px-4 text-sm font-medium inline-flex items-center justify-center gap-2">
              {loading && <Spinner className="w-4 h-4" />}
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
