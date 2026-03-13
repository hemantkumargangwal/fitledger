const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getDashboardStats,
  getMemberGrowthChart,
  getRevenueChart,
  getRecentMembers,
  getExpiringMembers,
  getPaymentDistribution,
  getRevenueSummary,
  getDailyRevenue,
  getExpiringAlerts,
  getGymActivity
} = require('../controllers/dashboardController');

router.use(auth); // All dashboard routes require authentication

router.get('/stats', getDashboardStats);
router.get('/member-growth', getMemberGrowthChart);
router.get('/revenue', getRevenueChart);
router.get('/recent-members', getRecentMembers);
router.get('/expiring-members', getExpiringMembers);
router.get('/payment-distribution', getPaymentDistribution);
router.get('/revenue-summary', getRevenueSummary);
router.get('/daily-revenue', getDailyRevenue);
router.get('/expiring-alerts', getExpiringAlerts);
router.get('/activity', getGymActivity);

module.exports = router;
