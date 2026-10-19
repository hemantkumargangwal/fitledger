import axios from 'axios';

// Normalize base URL - remove trailing slash if present
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Remove trailing slash to avoid double slashes in URLs
  return envURL.endsWith('/') ? envURL.slice(0, -1) : envURL;
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getApiError = (error, fallback = 'Something went wrong. Please try again.') => ({
  code: error.response?.data?.error?.code || 'REQUEST_FAILED',
  message: error.response?.data?.error?.message || error.response?.data?.message || error.message || fallback,
  fields: error.response?.data?.error?.fields || [],
  requestId: error.response?.data?.requestId || error.response?.headers?.['x-request-id'],
  status: error.response?.status,
});

export const createIdempotencyKey = () => (
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    let gymId;
    try {
      gymId = JSON.parse(localStorage.getItem('user') || '{}').gymId;
    } catch {
      gymId = null;
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Tenant context is read at request time so switching workspaces never leaves a stale header.
    if (gymId) config.headers['x-gym-id'] = gymId;
    config.headers['x-request-id'] = globalThis.crypto?.randomUUID?.() || Date.now().toString();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor deliberately leaves persisted credentials intact. The
// auth provider treats a saved token as a valid session until the user logs out.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
