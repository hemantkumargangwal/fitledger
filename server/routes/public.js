const express = require('express');
const { createRateLimit } = require('../middleware/rateLimit');
const { asyncHandler } = require('../utils/errorHandler');
const { getPublicSharedPlan } = require('../controllers/planShareController');

const router = express.Router();
router.get('/shared-plans/:shareToken', createRateLimit({ windowMs: 15 * 60 * 1000, max: 60 }), asyncHandler(getPublicSharedPlan));
module.exports = router;
