const { AppError } = require('./errorHandler');

const requireTenantId = (gymId) => {
  if (!gymId) {
    throw new AppError('Tenant context is required', 500, 'TENANT_CONTEXT_MISSING');
  }
  return gymId;
};

const tenantFilter = (gymId, filter = {}) => ({
  ...filter,
  gymId: requireTenantId(gymId),
});

const tenantCreateData = (gymId, data = {}) => ({
  ...data,
  gymId: requireTenantId(gymId),
});

module.exports = { requireTenantId, tenantFilter, tenantCreateData };
