// Validation utilities for the backend

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const sanitizeString = (str) => {
  return str.trim().replace(/[<>]/g, '');
};

const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

const validateLength = (value, min, max, fieldName) => {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  if (value.length > max) {
    return `${fieldName} must be no more than ${max} characters`;
  }
  return null;
};

const validateNumber = (value, fieldName, min = null, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (min !== null && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (max !== null && num > max) {
    return `${fieldName} must be no more than ${max}`;
  }
  return null;
};

const validateDate = (value, fieldName, future = false, past = false) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  
  const now = new Date();
  if (future && date <= now) {
    return `${fieldName} must be a future date`;
  }
  if (past && date >= now) {
    return `${fieldName} must be a past date`;
  }
  
  return null;
};

// Member validation
const validateMember = (data) => {
  const errors = [];

  // Name validation
  const nameError = validateRequired(data.name, 'Name');
  if (nameError) errors.push(nameError);
  else {
    const nameLengthError = validateLength(data.name, 2, 50, 'Name');
    if (nameLengthError) errors.push(nameLengthError);
  }

  // Email validation
  if (data.email) {
    if (!isValidEmail(data.email)) {
      errors.push('Please provide a valid email address');
    }
  }

  // Phone validation
  const phoneError = validateRequired(data.phone, 'Phone number');
  if (phoneError) errors.push(phoneError);
  else if (!isValidPhone(data.phone)) {
    errors.push('Please provide a valid phone number');
  }

  // Plan duration validation
  const planError = validateRequired(data.planDuration, 'Plan duration');
  if (planError) errors.push(planError);
  else {
    const planNumError = validateNumber(data.planDuration, 'Plan duration', 1, 12);
    if (planNumError) errors.push(planNumError);
  }

  return errors;
};

// Payment validation
const validatePayment = (data) => {
  const errors = [];

  // Member ID validation
  const memberIdError = validateRequired(data.memberId, 'Member ID');
  if (memberIdError) errors.push(memberIdError);
  else if (!isValidObjectId(data.memberId)) {
    errors.push('Invalid member ID format');
  }

  // Amount validation
  const amountError = validateRequired(data.amount, 'Amount');
  if (amountError) errors.push(amountError);
  else {
    const amountNumError = validateNumber(data.amount, 'Amount', 0.01);
    if (amountNumError) errors.push(amountNumError);
  }

  // Payment type validation
  const validPaymentTypes = ['cash', 'card', 'upi', 'bank_transfer', 'cheque'];
  if (!data.paymentType || !validPaymentTypes.includes(data.paymentType)) {
    errors.push('Invalid payment type');
  }

  return errors;
};

// User validation
const validateUser = (data) => {
  const errors = [];

  // Name validation
  const nameError = validateRequired(data.name, 'Name');
  if (nameError) errors.push(nameError);
  else {
    const nameLengthError = validateLength(data.name, 2, 50, 'Name');
    if (nameLengthError) errors.push(nameLengthError);
  }

  // Email validation
  const emailError = validateRequired(data.email, 'Email');
  if (emailError) errors.push(emailError);
  else if (!isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation (for registration)
  if (data.password) {
    const passwordLengthError = validateLength(data.password, 6, 100, 'Password');
    if (passwordLengthError) errors.push(passwordLengthError);
  }

  return errors;
};

// Pagination validation
const validatePagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder || 'desc';

  // Validate page
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }

  // Validate limit
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  // Validate sort order
  if (!['asc', 'desc'].includes(sortOrder)) {
    throw new Error('Sort order must be either asc or desc');
  }

  return { page, limit, sortBy, sortOrder };
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidObjectId,
  sanitizeString,
  validateRequired,
  validateLength,
  validateNumber,
  validateDate,
  validateMember,
  validatePayment,
  validateUser,
  validatePagination,
};
