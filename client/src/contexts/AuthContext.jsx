/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

// A token is the source of truth for a persisted session. This lightweight
// fallback lets the protected app render after a browser refresh even when the
// profile endpoint is temporarily unavailable.
const getSessionUser = () => getStoredUser() || (localStorage.getItem(TOKEN_KEY) ? { persistedSession: true } : null);

const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSessionUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        } catch {
          // Keep the saved token/session alive. A network interruption or a
          // stale profile response must not force the gym manager to log in again.
          setUser(getSessionUser());
        }
      } else {
        localStorage.removeItem(USER_KEY);
        setUser(null);
      }
      setLoading(false);
    };

    bootstrap();
  }, []);

  const refreshProfile = async () => {
    const response = await api.get('/auth/profile');
    setUser(response.data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    return response.data.user;
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const login = async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      const { token, user } = response.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (gymName, ownerName, email, password, phone = '') => {
    try {
      const response = await api.post('/auth/register', {
        gymName,
        ownerName,
        email,
        password,
        phone
      });
      const { token, user } = response.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: Boolean(localStorage.getItem(TOKEN_KEY)),
    login,
    register,
    logout,
    refreshProfile,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
