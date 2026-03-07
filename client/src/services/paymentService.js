import api from './api';

export const paymentService = {
  // Get all payments with pagination and filters
  getPayments: async (params = {}) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Create new payment
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // Update payment
  updatePayment: async (id, paymentData) => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  },

  // Delete payment
  deletePayment: async (id) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },

  // Get revenue summary
  getRevenueSummary: async (period = 'month') => {
    const response = await api.get('/payments/revenue', {
      params: { period }
    });
    return response.data;
  },

  // Get payment analytics
  getPaymentAnalytics: async (params = {}) => {
    const response = await api.get('/payments/analytics', { params });
    return response.data;
  },

  // Get payment modes distribution
  getPaymentModes: async () => {
    const response = await api.get('/payments/modes');
    return response.data;
  },

  // Get recent payments
  getRecentPayments: async (limit = 10) => {
    const response = await api.get('/payments/recent', {
      params: { limit }
    });
    return response.data;
  },

  // Search payments
  searchPayments: async (query, filters = {}) => {
    const response = await api.get('/payments/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  // Generate receipt
  generateReceipt: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Export payments
  exportPayments: async (filters = {}) => {
    const response = await api.get('/payments/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },
};
