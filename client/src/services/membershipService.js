import api from './api';

export const membershipService = {
  getMemberships: async () => {
    const response = await api.get('/memberships');
    return response.data;
  },

  createMembership: async (membershipData) => {
    const response = await api.post('/memberships', membershipData);
    return response.data;
  },

  updateMembership: async (id, membershipData) => {
    const response = await api.put(`/memberships/${id}`, membershipData);
    return response.data;
  },

  deleteMembership: async (id) => {
    const response = await api.delete(`/memberships/${id}`);
    return response.data;
  },
};
