const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, getProfile, updateProfile, forgotPassword, resetPasswordWithOtp } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordWithOtp);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
