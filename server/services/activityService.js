const ActivityLog = require('../models/ActivityLog');

/**
 * Create an activity log entry. Used by member and payment controllers.
 * @param {ObjectId} gymId
 * @param {ObjectId} [memberId]
 * @param {string} action - member_joined | member_updated | member_renewed | payment_received | member_deleted
 * @param {string} [description]
 * @param {Object} [metadata]
 */
const createLog = async (gymId, memberId, action, description = '', metadata = {}) => {
  const log = new ActivityLog({
    gymId,
    memberId: memberId || undefined,
    action,
    description,
    metadata
  });
  await log.save();
  return log;
};

module.exports = {
  createLog
};
