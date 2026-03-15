const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  addMember,
  getMembers,
  getMemberStats,
  searchMembers,
  getExpiringMembers,
  getMember,
  updateMember,
  deleteMember,
  bulkUpdateMembers,
  bulkDeleteMembers,
  syncMemberStatus
} = require('../controllers/memberController');
const { getMemberActivity } = require('../controllers/activityController');

router.use(auth); // All member routes require authentication

router.post('/', addMember);
router.get('/', getMembers);
router.get('/stats', getMemberStats);
router.get('/search', searchMembers);
router.get('/expiring', getExpiringMembers);
router.put('/bulk', bulkUpdateMembers);
router.delete('/bulk', bulkDeleteMembers);
router.post('/sync-status', syncMemberStatus);
router.get('/:id/activity', getMemberActivity);
router.get('/:id', getMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

module.exports = router;
