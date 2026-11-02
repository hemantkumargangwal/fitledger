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
  sendBulkMemberMessage,
  syncMemberStatus,
  sendEnrollmentInvitation,
  getEnrollmentDetails,
  submitEnrollment,
  getPendingEnrollments,
  approveEnrollment,
  rejectEnrollment,
  previewMemberImport,
  reviewMemberImport,
  commitMemberImport
} = require('../controllers/memberController');
const { getMemberPlanShare, regenerateMemberPlanShare, revokeMemberPlanShare } = require('../controllers/planShareController');
const { getMemberActivity } = require('../controllers/activityController');
const { getMandate, setupMandate, pauseMandate, resumeMandate } = require('../controllers/mandateController');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const multer = require('multer');

const importUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
const uploadImportFile = (req, res, next) => importUpload.single('file')(req, res, (error) => {
  if (error) return next(new AppError(error.code === 'LIMIT_FILE_SIZE' ? 'Import files must be 5 MB or smaller.' : 'The import upload is invalid.', 400, 'IMPORT_UPLOAD_INVALID'));
  return next();
});

router.use(auth, ownerOnly);

router.post('/', addMember);
router.get('/', getMembers);
router.get('/stats', getMemberStats);
router.get('/search', searchMembers);
router.get('/expiring', getExpiringMembers);
router.put('/bulk', bulkUpdateMembers);
router.delete('/bulk', bulkDeleteMembers);
router.post('/bulk-message', sendBulkMemberMessage);
router.post('/sync-status', syncMemberStatus);
router.post('/enrollment-invitations', sendEnrollmentInvitation);
router.get('/enrollments/pending', getPendingEnrollments);
router.post('/enrollments/:id/approve', approveEnrollment);
router.post('/enrollments/:id/reject', rejectEnrollment);
router.post('/import/preview', uploadImportFile, asyncHandler(previewMemberImport));
router.post('/import/review', asyncHandler(reviewMemberImport));
router.post('/import/commit', asyncHandler(commitMemberImport));
router.get('/:id/plan-share', asyncHandler(getMemberPlanShare));
router.post('/:id/plan-share', asyncHandler(regenerateMemberPlanShare));
router.delete('/:id/plan-share', asyncHandler(revokeMemberPlanShare));
router.get('/:id/activity', getMemberActivity);
router.get('/:id/mandate', asyncHandler(getMandate));
router.post('/:id/mandate/setup', asyncHandler(setupMandate));
router.post('/:id/mandate/pause', asyncHandler(pauseMandate));
router.post('/:id/mandate/resume', asyncHandler(resumeMandate));
router.get('/:id', getMember);
router.put('/:id', updateMember);
router.post('/:id/assign-membership', assignMembership);
router.delete('/:id', deleteMember);

module.exports = router;
