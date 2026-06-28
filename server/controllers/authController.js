const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Gym = require('../models/Gym');
const User = require('../models/User');
const validator = require('validator');
const { sendPasswordResetOtp } = require('../services/emailService');

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
const normalizePhone = (value = '') => value.replace(/\D/g, '');
const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');
const TRIAL_DURATION_DAYS = 90;
const getTrialInfo = (gym) => {
  const trialStartsAt = gym?.trialStartsAt || gym?.createdAt || new Date();
  const trialDurationDays = gym?.trialDurationDays || TRIAL_DURATION_DAYS;
  const trialEndsAt = gym?.trialEndsAt || new Date(new Date(trialStartsAt).getTime() + (trialDurationDays * 24 * 60 * 60 * 1000));

  return {
    trialStartsAt,
    trialEndsAt,
    trialDurationDays
  };
};

const register = async (req, res) => {
  try {
    const { gymName, ownerName, email, password, phone } = req.body;

    // Validation
    if (!gymName || !ownerName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if gym already exists
    const existingGym = await Gym.findOne({ email });
    if (existingGym) {
      return res.status(400).json({ message: 'Gym with this email already exists' });
    }

    // Create gym
    const trialStartsAt = new Date();
    const trialEndsAt = new Date(trialStartsAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DURATION_DAYS);

    const gym = new Gym({
      gymName,
      ownerName,
      email,
      phone: phone?.trim() || '',
      trialStartsAt,
      trialEndsAt,
      trialDurationDays: TRIAL_DURATION_DAYS
    });
    await gym.save();

    // Create user
    const user = new User({
      gymId: gym._id,
      name: ownerName,
      email,
      password
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    const trialInfo = getTrialInfo(gym);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gymId: gym._id,
        gymName: gym.gymName,
        ...trialInfo
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginId = (identifier || email || '').trim();

    // Validation
    if (!loginId || !password) {
      return res.status(400).json({ message: 'Email/phone and password are required' });
    }

    let user = null;

    if (validator.isEmail(loginId)) {
      user = await User.findOne({ email: loginId.toLowerCase() }).populate('gymId');
    } else {
      const exactPhoneGym = await Gym.findOne({ phone: loginId });

      if (exactPhoneGym) {
        user = await User.findOne({ gymId: exactPhoneGym._id }).populate('gymId');
      }

      if (!user) {
        const normalizedInput = normalizePhone(loginId);
        const gyms = await Gym.find({ phone: { $exists: true, $ne: '' } });
        const matchedGym = gyms.find((gym) => normalizePhone(gym.phone) === normalizedInput);
        if (matchedGym) {
          user = await User.findOne({ gymId: matchedGym._id }).populate('gymId');
        }
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    const trialInfo = getTrialInfo(user.gymId);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gymId: user.gymId._id,
        gymName: user.gymId.gymName,
        ...trialInfo
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('gymId');
    const trialInfo = getTrialInfo(user.gymId);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gymId: user.gymId._id,
        gymName: user.gymId.gymName,
        ownerName: user.gymId.ownerName,
        phone: user.gymId.phone || '',
        address: user.gymId.address || '',
        ...trialInfo
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, gymName, ownerName, phone, address, currentPassword, password } = req.body;
    const user = await User.findById(req.user.id).populate('gymId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const nextEmail = email?.trim().toLowerCase() || user.email;
    if (nextEmail !== user.email) {
      const existingUser = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const existingGym = await Gym.findOne({ email: nextEmail, _id: { $ne: user.gymId._id } });
      if (existingGym) {
        return res.status(400).json({ message: 'Gym email already in use' });
      }
    }

    if (name?.trim()) user.name = name.trim();
    if (email?.trim()) user.email = nextEmail;
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = password;
    }

    if (gymName?.trim()) user.gymId.gymName = gymName.trim();
    if (ownerName?.trim()) user.gymId.ownerName = ownerName.trim();
    user.gymId.email = nextEmail;
    user.gymId.phone = phone?.trim() || '';
    user.gymId.address = address?.trim() || '';

    await user.save();
    await user.gymId.save();

    const trialInfo = getTrialInfo(user.gymId);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gymId: user.gymId._id,
        gymName: user.gymId.gymName,
        ownerName: user.gymId.ownerName,
        phone: user.gymId.phone || '',
        address: user.gymId.address || '',
        ...trialInfo
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const user = await User.findOne({ email }).populate('gymId');
    if (!user) {
      return res.json({ message: 'If an account exists for this email, an OTP has been sent.' });
    }

    const otp = String(crypto.randomInt(100000, 999999));
    user.resetPasswordOtpHash = hashOtp(otp);
    user.resetPasswordOtpExpires = new Date(Date.now() + (10 * 60 * 1000));
    user.resetPasswordOtpAttempts = 0;
    await user.save();

    await sendPasswordResetOtp({
      toEmail: user.email,
      ownerName: user.name || user.gymId?.ownerName,
      otp
    });

    res.json({ message: 'If an account exists for this email, an OTP has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Unable to send OTP right now. Please try again later.' });
  }
};

const resetPasswordWithOtp = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();
    const newPassword = req.body.newPassword;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!otp || otp.length !== 6) {
      return res.status(400).json({ message: 'Please enter a valid 6-digit OTP.' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordOtpHash || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ message: 'OTP is invalid or has expired.' });
    }

    if (user.resetPasswordOtpExpires < new Date()) {
      user.resetPasswordOtpHash = null;
      user.resetPasswordOtpExpires = null;
      user.resetPasswordOtpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'OTP is invalid or has expired.' });
    }

    user.resetPasswordOtpAttempts = (user.resetPasswordOtpAttempts || 0) + 1;
    if (user.resetPasswordOtpAttempts > 5) {
      user.resetPasswordOtpHash = null;
      user.resetPasswordOtpExpires = null;
      user.resetPasswordOtpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'Too many invalid attempts. Please request a new OTP.' });
    }

    if (user.resetPasswordOtpHash !== hashOtp(otp)) {
      await user.save();
      return res.status(400).json({ message: 'OTP is invalid or has expired.' });
    }

    user.password = newPassword;
    user.resetPasswordOtpHash = null;
    user.resetPasswordOtpExpires = null;
    user.resetPasswordOtpAttempts = 0;
    await user.save();

    res.json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Unable to reset password right now. Please try again later.' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPasswordWithOtp
};
