const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  addPayment,
  getPayments,
  getPayment,
  getRevenueSummary
} = require('../controllers/paymentController');

router.use(auth); // All payment routes require authentication

router.post('/', addPayment);
router.get('/', getPayments);
router.get('/revenue', getRevenueSummary);
router.get('/:id', getPayment);

module.exports = router;
