import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/Spinner';
import ToastContainer from './components/Toast';
import './services/api'; // Initialize API interceptors

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Members = lazy(() => import('./pages/Members'));
const Memberships = lazy(() => import('./pages/Memberships'));
const WorkoutPlans = lazy(() => import('./pages/WorkoutPlans'));
const DietPlans = lazy(() => import('./pages/DietPlans'));
const Payments = lazy(() => import('./pages/Payments'));
const AddPayment = lazy(() => import('./pages/AddPayment'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const MemberProfile = lazy(() => import('./pages/MemberProfile'));
const Enquiries = lazy(() => import('./pages/Enquiries'));

const AppFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600" role="status">
    <Spinner className="h-7 w-7" />
    <span className="sr-only">Loading page</span>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<AppFallback />}>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {import.meta.env.DEV && (
            <Route element={<DashboardLayout />}>
              <Route path="preview/dashboard" element={<Dashboard />} />
            </Route>
          )}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="members/:id" element={<MemberProfile />} />
            <Route path="memberships" element={<Memberships />} />
            <Route path="workout-plans" element={<WorkoutPlans />} />
            <Route path="diet-plans" element={<DietPlans />} />
            <Route path="payments" element={<Payments />} />
            <Route path="payments/add" element={<AddPayment />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="enquiries" element={<Enquiries />} />
          </Route>
          <Route path="/logout" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}

export default App;
