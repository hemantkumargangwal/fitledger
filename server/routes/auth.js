const express = require('express');
const auth = require('../middleware/auth');
const { ownerOnly } = require('../middleware/authorize');
const { createRateLimit } = require('../middleware/rateLimit');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/errorHandler');
const {
  changePassword,
  forgotPassword,
  getProfile,
  login,
  register,
  resetPasswordWithOtp,
  updateProfile,
} = require('../controllers/authController');
const {
  changePasswordValidator,
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
} = require('../validators/authValidators');

const router = express.Router();

const keyedLimit = (windowMs, max) => createRateLimit({
  windowMs,
  max,
  key: (req) => `${req.path}:${req.ip}:${req.body?.identifier || req.body?.email || ''}`,
});

router.post('/register', keyedLimit(60 * 60 * 1000, 5), validate(registerValidator), asyncHandler(register));
router.post('/login', keyedLimit(15 * 60 * 1000, 10), validate(loginValidator), asyncHandler(login));
router.post('/forgot-password', keyedLimit(15 * 60 * 1000, 5), validate(forgotPasswordValidator), asyncHandler(forgotPassword));
router.post('/reset-password', keyedLimit(15 * 60 * 1000, 10), validate(resetPasswordValidator), asyncHandler(resetPasswordWithOtp));
router.get('/profile', auth, ownerOnly, asyncHandler(getProfile));
router.put('/profile', auth, ownerOnly, asyncHandler(updateProfile));
router.post('/change-password', auth, ownerOnly, validate(changePasswordValidator), asyncHandler(changePassword));

module.exports = router;
