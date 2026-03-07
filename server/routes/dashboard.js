const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getDashboardStats,
  getMemberGrowthChart,
  getRevenueChart,
  getRecentMembers
} = require('../controllers/dashboardController');

router.use(auth); // All dashboard routes require authentication

router.get('/stats', getDashboardStats);
router.get('/member-growth', getMemberGrowthChart);
router.get('/revenue', getRevenueChart);
router.get('/recent-members', getRecentMembers);

module.exports = router;
