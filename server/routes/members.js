const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  addMember,
  getMembers,
  getMember,
  updateMember,
  deleteMember
} = require('../controllers/memberController');

router.use(auth); // All member routes require authentication

router.post('/', addMember);
router.get('/', getMembers);
router.get('/:id', getMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

module.exports = router;
