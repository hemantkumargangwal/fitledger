const validator = require('validator');

const fieldError = (field, message) => ({ field, message });
const normalizeEmail = (value = '') => value.trim().toLowerCase();

const validatePasswordStrength = (password, field = 'password') => {
  const errors = [];
  if (typeof password !== 'string' || password.length < 8) {
    errors.push(fieldError(field, 'Password must be at least 8 characters'));
  }
  if (typeof password === 'string' && !/[A-Za-z]/.test(password)) {
    errors.push(fieldError(field, 'Password must include at least one letter'));
  }
  if (typeof password === 'string' && !/\d/.test(password)) {
    errors.push(fieldError(field, 'Password must include at least one number'));
  }
  return errors;
};

const loginValidator = (body) => {
  const identifier = String(body.identifier || body.email || '').trim();
  const password = typeof body.password === 'string' ? body.password : '';
  const errors = [];
  if (!identifier) errors.push(fieldError('identifier', 'Email or phone number is required'));
  if (!password) errors.push(fieldError('password', 'Password is required'));
  return { errors, value: { identifier, password } };
};

const registerValidator = (body) => {
  const gymName = String(body.gymName || '').trim();
  const ownerName = String(body.ownerName || '').trim();
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const phone = String(body.phone || '').trim();
  const errors = [];
  if (gymName.length < 2 || gymName.length > 120) errors.push(fieldError('gymName', 'Gym name must be between 2 and 120 characters'));
  if (ownerName.length < 2 || ownerName.length > 100) errors.push(fieldError('ownerName', 'Owner name must be between 2 and 100 characters'));
  if (!email || !validator.isEmail(email)) errors.push(fieldError('email', 'Enter a valid email address'));
  errors.push(...validatePasswordStrength(password));
  if (phone && phone.replace(/\D/g, '').length < 10) errors.push(fieldError('phone', 'Enter a valid phone number'));
  return { errors, value: { gymName, ownerName, email, password, phone } };
};

const forgotPasswordValidator = (body) => {
  const email = normalizeEmail(body.email);
  const errors = !email || !validator.isEmail(email)
    ? [fieldError('email', 'Enter a valid email address')]
    : [];
  return { errors, value: { email } };
};

const resetPasswordValidator = (body) => {
  const email = normalizeEmail(body.email);
  const otp = String(body.otp || '').trim();
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
  const errors = [];
  if (!email || !validator.isEmail(email)) errors.push(fieldError('email', 'Enter a valid email address'));
  if (!/^\d{6}$/.test(otp)) errors.push(fieldError('otp', 'Enter the 6-digit OTP'));
  errors.push(...validatePasswordStrength(newPassword, 'newPassword'));
  return { errors, value: { email, otp, newPassword } };
};

const changePasswordValidator = (body) => {
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
  const errors = [];
  if (!currentPassword) errors.push(fieldError('currentPassword', 'Current password is required'));
  errors.push(...validatePasswordStrength(newPassword, 'newPassword'));
  if (currentPassword && currentPassword === newPassword) {
    errors.push(fieldError('newPassword', 'New password must be different from the current password'));
  }
  return { errors, value: { currentPassword, newPassword } };
};

module.exports = {
  changePasswordValidator,
  forgotPasswordValidator,
  loginValidator,
  normalizeEmail,
  registerValidator,
  resetPasswordValidator,
  validatePasswordStrength,
};
