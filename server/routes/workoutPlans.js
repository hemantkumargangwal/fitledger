const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { ownerOnly } = require('../middleware/authorize');
const {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan
} = require('../controllers/workoutPlanController');

router.use(auth, ownerOnly);

router.get('/', getPlans);
router.post('/', createPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;
