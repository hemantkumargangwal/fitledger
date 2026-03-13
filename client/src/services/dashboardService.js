import api from './api';

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get member growth data (period: 3months | 6months | 1year)
  getMemberGrowth: async (period = '6months') => {
    const response = await api.get('/dashboard/member-growth', {
      params: { period }
    });
    return response.data;
  },

  // Get revenue data (period: 3months | 6months | 1year)
  getRevenueData: async (period = '6months') => {
    const response = await api.get('/dashboard/revenue', {
      params: { period }
    });
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

  // Get expiring members (for Reports)
  getExpiringMembers: async (days = 30) => {
    const response = await api.get('/dashboard/expiring-members', {
      params: { days }
    });
    return response.data;
  },

  // Get payment method distribution (last 30 days) for pie chart
  getPaymentDistribution: async () => {
    const response = await api.get('/dashboard/payment-distribution');
    return response.data;
  },

  // Revenue summary cards (today, week, month)
  getRevenueSummary: async () => {
    const response = await api.get('/dashboard/revenue-summary');
    return response.data;
  },

  // Daily revenue for last N days
  getDailyRevenue: async (days = 14) => {
    const response = await api.get('/dashboard/daily-revenue', { params: { days } });
    return response.data;
  },

  // Expiring membership alerts (counts + member list for widget)
  getExpiringAlerts: async () => {
    const response = await api.get('/dashboard/expiring-alerts');
    return response.data;
  },

  // Recent gym activity (for dashboard feed)
  getGymActivity: async (limit = 15) => {
    const response = await api.get('/dashboard/activity', { params: { limit } });
    return response.data;
  },
};
