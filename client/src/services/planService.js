import api from './api';

const createPlanService = (basePath, listKey) => ({
  getPlans: async () => {
    const response = await api.get(basePath);
    return response.data[listKey] || [];
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
