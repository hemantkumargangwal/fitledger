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
  syncMemberStatus
} = require('../controllers/memberController');
const { getMemberActivity } = require('../controllers/activityController');

router.use(auth, ownerOnly);

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
router.post('/:id/assign-membership', assignMembership);
router.delete('/:id', deleteMember);

module.exports = router;
