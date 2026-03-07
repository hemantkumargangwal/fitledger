import api from './api';

export const memberService = {
  // Get all members with pagination and filters
  getMembers: async (params = {}) => {
    const response = await api.get('/members', { params });
    return response.data;
  },

  // Get member by ID
  getMemberById: async (id) => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },

  // Create new member
  createMember: async (memberData) => {
    const response = await api.post('/members', memberData);
    return response.data;
  },

  // Update member
  updateMember: async (id, memberData) => {
    const response = await api.put(`/members/${id}`, memberData);
    return response.data;
  },

  // Delete member
  deleteMember: async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  },

  // Get member statistics
  getMemberStats: async () => {
    const response = await api.get('/members/stats');
    return response.data;
  },

  // Search members
  searchMembers: async (query, filters = {}) => {
    const response = await api.get('/members/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  // Get expiring members
  getExpiringMembers: async (days = 30) => {
    const response = await api.get('/members/expiring', {
      params: { days }
    });
    return response.data;
  },

  // Bulk operations
  bulkUpdate: async (memberIds, updateData) => {
    const response = await api.put('/members/bulk', {
      memberIds,
      updateData
    });
    return response.data;
  },

  bulkDelete: async (memberIds) => {
    const response = await api.delete('/members/bulk', {
      data: { memberIds }
    });
    return response.data;
  },
};
