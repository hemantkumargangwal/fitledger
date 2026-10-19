const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { ownerOnly } = require('../middleware/authorize');
const {
  addMember,
  getMembers,
  getMemberStats,
  searchMembers,
  getExpiringMembers,
  getMember,
  updateMember,
  assignMembership,
  deleteMember,
  bulkUpdateMembers,
  bulkDeleteMembers,
  syncMemberStatus,
  sendEnrollmentInvitation,
  getEnrollmentDetails,
  submitEnrollment,
  getPendingEnrollments,
  approveEnrollment,
  rejectEnrollment
} = require('../controllers/memberController');
const { getMemberActivity } = require('../controllers/activityController');
const { getMandate, setupMandate, pauseMandate, resumeMandate } = require('../controllers/mandateController');

router.use(auth, ownerOnly);

router.post('/', addMember);
router.get('/', getMembers);
router.get('/stats', getMemberStats);
router.get('/search', searchMembers);
router.get('/expiring', getExpiringMembers);
router.put('/bulk', bulkUpdateMembers);
router.delete('/bulk', bulkDeleteMembers);
router.post('/sync-status', syncMemberStatus);
router.post('/enrollment-invitations', sendEnrollmentInvitation);
router.get('/enrollments/pending', getPendingEnrollments);
router.post('/enrollments/:id/approve', approveEnrollment);
router.post('/enrollments/:id/reject', rejectEnrollment);
router.get('/:id/activity', getMemberActivity);
router.get('/:id/mandate', getMandate);
router.post('/:id/mandate/setup', setupMandate);
router.post('/:id/mandate/pause', pauseMandate);
router.post('/:id/mandate/resume', resumeMandate);
router.get('/:id', getMember);
router.put('/:id', updateMember);
router.post('/:id/assign-membership', assignMembership);
router.delete('/:id', deleteMember);

module.exports = router;
