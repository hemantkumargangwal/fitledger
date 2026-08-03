const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { ownerOnly } = require('../middleware/authorize');
const {
  getMemberships,
  createMembership,
  updateMembership,
  deleteMembership
} = require('../controllers/membershipController');

router.use(auth, ownerOnly);

router.get('/', getMemberships);
router.post('/', createMembership);
router.put('/:id', updateMembership);
router.delete('/:id', deleteMembership);

module.exports = router;
