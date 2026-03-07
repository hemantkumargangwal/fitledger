import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/Toast';
import './services/api'; // Initialize API interceptors

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/members" element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          } />
        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}

export default App;
