import api from './api';

const createPlanService = (basePath, listKey) => ({
  getPlans: async () => {
    const response = await api.get(basePath);
    return response.data[listKey] || [];
  },

  getDefaultPlans: async () => {
    const response = await api.get(`${basePath}/defaults`);
    return response.data.templates || [];
  },

  cloneDefaultPlan: async (templateCode) => {
    const response = await api.post(`${basePath}/clone/${templateCode}`);
    return response.data;
  },

  duplicatePlan: async (id) => {
    const response = await api.post(`${basePath}/${id}/duplicate`);
    return response.data;
  },

  updatePlanStatus: async (id, isActive) => {
    const response = await api.patch(`${basePath}/${id}/status`, { isActive });
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await api.post(basePath, planData);
    return response.data;
  },

  updatePlan: async (id, planData) => {
    const response = await api.put(`${basePath}/${id}`, planData);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await api.delete(`${basePath}/${id}`);
    return response.data;
  },
});

export const workoutPlanService = createPlanService('/workout-plans', 'workoutPlans');
export const dietPlanService = createPlanService('/diet-plans', 'dietPlans');
