const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { ownerOnly } = require('../middleware/authorize');
const {
  addPayment,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
  getRevenueSummary,
  getPaymentAnalytics,
  getPaymentModes,
  getRecentPayments,
  searchPayments,
  generateReceipt,
  exportPayments
} = require('../controllers/paymentController');

router.use(auth, ownerOnly);

router.post('/', addPayment);
router.get('/', getPayments);
router.get('/revenue', getRevenueSummary);
router.get('/analytics', getPaymentAnalytics);
router.get('/modes', getPaymentModes);
router.get('/recent', getRecentPayments);
router.get('/search', searchPayments);
router.get('/export', exportPayments);
router.get('/:id/receipt', generateReceipt);
router.get('/:id', getPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

module.exports = router;
