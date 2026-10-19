import api, { getApiError } from './api';

const unwrap = async (request) => {
  try { return (await request).data; } catch (error) { throw getApiError(error); }
};

export const mandateService = {
  getMandate: (memberId) => unwrap(api.get(`/members/${memberId}/mandate`)),
  initiateAutopay: (memberId, data) => unwrap(api.post(`/members/${memberId}/mandate/setup`, data)),
  pauseMandate: (memberId) => unwrap(api.post(`/members/${memberId}/mandate/pause`)),
  resumeMandate: (memberId) => unwrap(api.post(`/members/${memberId}/mandate/resume`)),
};
