import api from './api';

export const enquiryService = {
  getEnquiries: async (params = {}) => (await api.get('/enquiries', { params })).data,
  createEnquiry: async (data) => (await api.post('/enquiries', data)).data,
  updateEnquiry: async (id, data) => (await api.put(`/enquiries/${id}`, data)).data,
  updateStatus: async (id, status) => (await api.patch(`/enquiries/${id}/status`, { status })).data,
  sendEmail: async (id, templateId) => (await api.post(`/enquiries/${id}/send-email`, templateId ? { templateId } : {})).data,
  deleteEnquiry: async (id) => (await api.delete(`/enquiries/${id}`)).data,
};
