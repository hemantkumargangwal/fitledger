import api from './api';

export const planShareService = {
  getPublic: async (token) => (await api.get(`/public/shared-plans/${encodeURIComponent(token)}`)).data,
  getForMember: async (memberId) => (await api.get(`/members/${memberId}/plan-share`)).data,
  regenerate: async (memberId, expiresInDays) => (await api.post(`/members/${memberId}/plan-share`, { expiresInDays })).data,
  revoke: async (memberId) => (await api.delete(`/members/${memberId}/plan-share`)).data,
};
