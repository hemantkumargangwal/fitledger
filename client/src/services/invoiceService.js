import api, { getApiError } from './api';

const unwrap = async (request) => {
  try { return (await request).data; } catch (error) { throw getApiError(error); }
};

export const invoiceService = {
  getInvoices: (params = {}) => unwrap(api.get('/invoices', { params })),
  createInvoice: (data) => unwrap(api.post('/invoices', data)),
  getInvoicePDF: async (id) => {
    try { return await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }); }
    catch (error) { throw getApiError(error, 'Invoice PDF could not be downloaded.'); }
  },
  shareOnWhatsApp: (id) => unwrap(api.post(`/invoices/${id}/share/whatsapp`)),
};

export const { createInvoice, getInvoicePDF } = invoiceService;
