const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { ownerOnly } = require('../middleware/authorize');
const {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getDefaultPlans,
  cloneDefaultPlan,
  duplicatePlan,
  updatePlanStatus
} = require('../controllers/dietPlanController');

router.use(auth, ownerOnly);

router.get('/', getPlans);
router.get('/defaults', getDefaultPlans);
router.post('/clone/:templateCode', cloneDefaultPlan);
router.post('/:id/duplicate', duplicatePlan);
router.patch('/:id/status', updatePlanStatus);
router.post('/', createPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;
