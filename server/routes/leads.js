const router = require('express').Router();
const auth = require('../middleware/auth');
const { ownerOnly } = require('../middleware/authorize');
const { asyncHandler } = require('../utils/errorHandler');
const { getLeads, createLead, updateLeadStatus } = require('../controllers/leadController');

router.use(auth, ownerOnly);
router.get('/', asyncHandler(getLeads));
router.post('/', asyncHandler(createLead));
router.patch('/:id/status', asyncHandler(updateLeadStatus));
module.exports = router;
