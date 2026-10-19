import api, { getApiError } from './api';

const unwrap = async (request) => {
  try { return (await request).data; } catch (error) { throw getApiError(error); }
};

export const crmService = {
  getLeads: (params = {}) => unwrap(api.get('/leads', { params })),
  createLead: (data) => unwrap(api.post('/leads', data)),
  updateLeadStatus: (id, status) => unwrap(api.patch(`/leads/${id}/status`, { status })),
};

export const getLeads = crmService.getLeads;
export const updateLeadStatus = crmService.updateLeadStatus;
