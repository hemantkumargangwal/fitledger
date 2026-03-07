// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// Required field validation
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Minimum length validation
export const minLength = (value, min) => {
  return value && value.length >= min;
};

// Maximum length validation
export const maxLength = (value, max) => {
  return !value || value.length <= max;
};

// Number validation
export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Positive number validation
export const isPositiveNumber = (value) => {
  return isNumber(value) && parseFloat(value) > 0;
};

// Date validation
export const isValidDate = (date) => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

// Future date validation
export const isFutureDate = (date) => {
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj >= today;
};

// Past date validation
export const isPastDate = (date) => {
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj <= today;
};

// Age validation (must be between minAge and maxAge)
export const isValidAge = (birthDate, minAge = 18, maxAge = 100) => {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age >= minAge && age <= maxAge;
};

// Password strength validation
export const isStrongPassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Credit card validation (basic Luhn algorithm)
export const isValidCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return cleaned.length >= 13 && cleaned.length <= 19 && sum % 10 === 0;
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach((field) => {
    const value = formData[field];
    const rules = validationRules[field];
    
    rules.forEach((rule) => {
      const { validator, message, condition = () => true } = rule;
      
      if (condition(formData) && !validator(value)) {
        errors[field] = message;
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Common validation rules
export const commonRules = {
  required: (message = 'This field is required') => ({
    validator: isRequired,
    message,
  }),
  
  email: (message = 'Please enter a valid email address') => ({
    validator: isValidEmail,
    message,
  }),
  
  phone: (message = 'Please enter a valid phone number') => ({
    validator: isValidPhone,
    message,
  }),
  
  minLength: (min, message) => ({
    validator: (value) => minLength(value, min),
    message: message || `Must be at least ${min} characters`,
  }),
  
  maxLength: (max, message) => ({
    validator: (value) => maxLength(value, max),
    message: message || `Must be no more than ${max} characters`,
  }),
  
  positiveNumber: (message = 'Must be a positive number') => ({
    validator: isPositiveNumber,
    message,
  }),
  
  futureDate: (message = 'Must be a future date') => ({
    validator: isFutureDate,
    message,
  }),
  
  strongPassword: (message = 'Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters') => ({
    validator: isStrongPassword,
    message,
  }),
};
