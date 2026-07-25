const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Gym = require('../models/Gym');
const PasswordResetChallenge = require('../models/PasswordResetChallenge');
const User = require('../models/User');
const { sendPasswordResetOtp } = require('../services/emailService');
const { AppError } = require('../utils/errorHandler');

const TRIAL_DURATION_DAYS = 90;
const RESET_TTL_MS = 10 * 60 * 1000;
const RESET_MAX_ATTEMPTS = 5;

const generateToken = (userId) => jwt.sign(
  { userId },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
);

const normalizePhone = (value = '') => value.replace(/\D/g, '');
const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');
const isOtpMatch = (candidate, expectedHash) => {
  const candidateHash = Buffer.from(hashOtp(candidate), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return candidateHash.length === expected.length && crypto.timingSafeEqual(candidateHash, expected);
};

const getTrialInfo = (gym) => {
  const trialStartsAt = gym?.trialStartsAt || gym?.createdAt || new Date();
  const trialDurationDays = gym?.trialDurationDays || TRIAL_DURATION_DAYS;
  const trialEndsAt = gym?.trialEndsAt || new Date(
    new Date(trialStartsAt).getTime() + (trialDurationDays * 24 * 60 * 60 * 1000)
  );
  return { trialStartsAt, trialEndsAt, trialDurationDays };
};

const publicUser = (user, gym = user.gymId) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  gymId: gym._id,
  gymName: gym.gymName,
  ownerName: gym.ownerName,
  phone: gym.phone || '',
  address: gym.address || '',
  ...getTrialInfo(gym),
});

const register = async (req, res) => {
  const { gymName, ownerName, email, password, phone } = req.body;
  const existingUser = await User.exists({ email });
  const existingGym = await Gym.exists({ email });
  if (existingUser || existingGym) {
    throw new AppError('An account with this email already exists', 409, 'ACCOUNT_EXISTS');
  }

  const trialStartsAt = new Date();
  const trialEndsAt = new Date(trialStartsAt);
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DURATION_DAYS);

  const gym = await Gym.create({
    gymName,
    ownerName,
    email,
    phone,
    phoneNormalized: normalizePhone(phone),
    trialStartsAt,
    trialEndsAt,
    trialDurationDays: TRIAL_DURATION_DAYS,
  });

  try {
    const user = await User.create({ gymId: gym._id, name: ownerName, email, password, role: 'owner' });
    return res.status(201).json({
      message: 'Registration successful',
      token: generateToken(user._id),
      user: publicUser(user, gym),
    });
  } catch (error) {
    await Gym.deleteOne({ _id: gym._id });
    throw error;
  }
};

const login = async (req, res) => {
  const { identifier, password } = req.body;
  let user;

  if (identifier.includes('@')) {
    user = await User.findOne({ email: identifier.toLowerCase() })
      .select('+password')
      .populate('gymId');
  } else {
    const normalizedPhone = normalizePhone(identifier);
    const gym = await Gym.findOne({
      $or: [{ phone: identifier }, { phoneNormalized: normalizedPhone }],
    });
    if (gym) {
      user = await User.findOne({ gymId: gym._id, role: 'owner' })
        .select('+password')
        .populate('gymId');
    }
  }

  if (!user || !user.gymId || !(await user.comparePassword(password))) {
    throw new AppError('Email/phone or password is incorrect', 401, 'INVALID_CREDENTIALS');
  }
  if (user.status !== 'active') {
    throw new AppError('This account is disabled. Contact support.', 403, 'ACCOUNT_DISABLED');
  }

  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
  return res.json({
    message: 'Login successful',
    token: generateToken(user._id),
    user: publicUser(user),
  });
};

const getProfile = async (req, res) => res.json({ user: publicUser(req.user) });

const updateProfile = async (req, res) => {
  const { name, email, gymName, ownerName, phone, address } = req.body;
  const user = await User.findById(req.user.id).populate('gymId');
  if (!user || !user.gymId) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  const nextEmail = email?.trim().toLowerCase() || user.email;
  if (nextEmail !== user.email) {
    const [existingUser, existingGym] = await Promise.all([
      User.exists({ email: nextEmail, _id: { $ne: user._id } }),
      Gym.exists({ email: nextEmail, _id: { $ne: user.gymId._id } }),
    ]);
    if (existingUser || existingGym) {
      throw new AppError('Email is already in use', 409, 'EMAIL_IN_USE');
    }
  }

  if (name?.trim()) user.name = name.trim();
  user.email = nextEmail;
  if (gymName?.trim()) user.gymId.gymName = gymName.trim();
  if (ownerName?.trim()) user.gymId.ownerName = ownerName.trim();
  user.gymId.email = nextEmail;
  user.gymId.phone = phone?.trim() || '';
  user.gymId.phoneNormalized = normalizePhone(phone);
  user.gymId.address = address?.trim() || '';

  await Promise.all([user.save(), user.gymId.save()]);
  return res.json({ message: 'Profile updated successfully', user: publicUser(user) });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 422, 'CURRENT_PASSWORD_INCORRECT', [
      { field: 'currentPassword', message: 'Current password is incorrect' },
    ]);
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();
  return res.json({ message: 'Password changed successfully. Please sign in again.' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const genericMessage = 'If an account exists for this email, an OTP has been sent.';
  const user = await User.findOne({ email });
  if (!user || user.status !== 'active') return res.json({ message: genericMessage });

  await PasswordResetChallenge.updateMany(
    { userId: user._id, consumedAt: null },
    { consumedAt: new Date() }
  );

  const otp = String(crypto.randomInt(100000, 1000000));
  await PasswordResetChallenge.create({
    userId: user._id,
    otpHash: hashOtp(otp),
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  });

  await sendPasswordResetOtp({ toEmail: user.email, ownerName: user.name, otp });
  return res.json({ message: genericMessage });
};

const resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new AppError('OTP is invalid or has expired', 422, 'INVALID_RESET_CHALLENGE');

  const challenge = await PasswordResetChallenge.findOne({
    userId: user._id,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 }).select('+otpHash');

  if (!challenge) {
    throw new AppError('OTP is invalid or has expired', 422, 'INVALID_RESET_CHALLENGE');
  }

  if (!isOtpMatch(otp, challenge.otpHash)) {
    challenge.attempts += 1;
    if (challenge.attempts >= RESET_MAX_ATTEMPTS) challenge.consumedAt = new Date();
    await challenge.save();
    throw new AppError(
      challenge.consumedAt ? 'Too many invalid attempts. Request a new OTP.' : 'OTP is invalid or has expired',
      422,
      challenge.consumedAt ? 'RESET_ATTEMPTS_EXCEEDED' : 'INVALID_RESET_CHALLENGE'
    );
  }

  challenge.consumedAt = new Date();
  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await Promise.all([challenge.save(), user.save()]);
  return res.json({ message: 'Password reset successfully. Please sign in with your new password.' });
};

module.exports = {
  changePassword,
  forgotPassword,
  generateToken,
  getProfile,
  getTrialInfo,
  hashOtp,
  isOtpMatch,
  login,
  register,
  resetPasswordWithOtp,
  updateProfile,
};
