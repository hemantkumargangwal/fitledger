import api from './api';

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get member growth data
  getMemberGrowth: async (period = '30d') => {
    const response = await api.get('/dashboard/member-growth', {
      params: { period }
    });
    return response.data;
  },

  // Get revenue data
  getRevenueData: async (period = '30d') => {
    const response = await api.get('/dashboard/revenue', {
      params: { period }
    });
    return response.data;
  },

  // Get payment modes data
  getPaymentModes: async () => {
    const response = await api.get('/dashboard/payment-modes');
    return response.data;
  },

  // Get recent members
  getRecentMembers: async (limit = 5) => {
    const response = await api.get('/dashboard/recent-members', {
      params: { limit }
    });
    return response.data;
  },

  // Get recent payments
  getRecentPayments: async (limit = 5) => {
    const response = await api.get('/dashboard/recent-payments', {
      params: { limit }
    });
    return response.data;
  },

  // Get activity feed
  getActivityFeed: async (limit = 10) => {
    const response = await api.get('/dashboard/activity', {
      params: { limit }
    });
    return response.data;
  },

  // Get membership trends
  getMembershipTrends: async (period = '90d') => {
    const response = await api.get('/dashboard/membership-trends', {
      params: { period }
    });
    return response.data;
  },

  // Get financial overview
  getFinancialOverview: async (period = '30d') => {
    const response = await api.get('/dashboard/financial-overview', {
      params: { period }
    });
    return response.data;
  },

  // Get upcoming renewals
  getUpcomingRenewals: async (days = 30) => {
    const response = await api.get('/dashboard/upcoming-renewals', {
      params: { days }
    });
    return response.data;
  },
};
