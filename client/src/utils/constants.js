// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
  },
  MEMBERS: {
    LIST: '/members',
    CREATE: '/members',
    UPDATE: '/members/:id',
    DELETE: '/members/:id',
    STATS: '/members/stats',
    SEARCH: '/members/search',
    EXPIRING: '/members/expiring',
    BULK_UPDATE: '/members/bulk',
    BULK_DELETE: '/members/bulk',
  },
  PAYMENTS: {
    LIST: '/payments',
    CREATE: '/payments',
    UPDATE: '/payments/:id',
    DELETE: '/payments/:id',
    REVENUE: '/payments/revenue',
    ANALYTICS: '/payments/analytics',
    MODES: '/payments/modes',
    RECENT: '/payments/recent',
    SEARCH: '/payments/search',
    RECEIPT: '/payments/:id/receipt',
    EXPORT: '/payments/export',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    MEMBER_GROWTH: '/dashboard/member-growth',
    REVENUE: '/dashboard/revenue',
    PAYMENT_MODES: '/dashboard/payment-modes',
    RECENT_MEMBERS: '/dashboard/recent-members',
    RECENT_PAYMENTS: '/dashboard/recent-payments',
    ACTIVITY: '/dashboard/activity',
    MEMBERSHIP_TRENDS: '/dashboard/membership-trends',
    FINANCIAL_OVERVIEW: '/dashboard/financial-overview',
    UPCOMING_RENEWALS: '/dashboard/upcoming-renewals',
  },
};

// Payment types
export const PAYMENT_TYPES = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  BANK_TRANSFER: 'bank_transfer',
  CHEQUE: 'cheque',
};

// Payment type labels
export const PAYMENT_TYPE_LABELS = {
  [PAYMENT_TYPES.CASH]: 'Cash',
  [PAYMENT_TYPES.CARD]: 'Card',
  [PAYMENT_TYPES.UPI]: 'UPI',
  [PAYMENT_TYPES.BANK_TRANSFER]: 'Bank Transfer',
  [PAYMENT_TYPES.CHEQUE]: 'Cheque',
};

// Member status
export const MEMBER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  EXPIRING: 'expiring',
  SUSPENDED: 'suspended',
};

// Member status labels
export const MEMBER_STATUS_LABELS = {
  [MEMBER_STATUS.ACTIVE]: 'Active',
  [MEMBER_STATUS.INACTIVE]: 'Inactive',
  [MEMBER_STATUS.EXPIRED]: 'Expired',
  [MEMBER_STATUS.EXPIRING]: 'Expiring Soon',
  [MEMBER_STATUS.SUSPENDED]: 'Suspended',
};

// Membership plans (in months)
export const MEMBERSHIP_PLANS = {
  MONTHLY: 1,
  QUARTERLY: 3,
  SEMI_ANNUAL: 6,
  ANNUAL: 12,
};

// Membership plan labels
export const MEMBERSHIP_PLAN_LABELS = {
  [MEMBERSHIP_PLANS.MONTHLY]: 'Monthly',
  [MEMBERSHIP_PLANS.QUARTERLY]: 'Quarterly',
  [MEMBERSHIP_PLANS.SEMI_ANNUAL]: 'Semi-Annual',
  [MEMBERSHIP_PLANS.ANNUAL]: 'Annual',
};

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Alert types
export const ALERT_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Sort options
export const SORT_OPTIONS = {
  ASC: 'asc',
  DESC: 'desc',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'preferences',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access forbidden. You don\'t have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  MEMBER_CREATED: 'Member created successfully',
  MEMBER_UPDATED: 'Member updated successfully',
  MEMBER_DELETED: 'Member deleted successfully',
  PAYMENT_CREATED: 'Payment recorded successfully',
  PAYMENT_UPDATED: 'Payment updated successfully',
  PAYMENT_DELETED: 'Payment deleted successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
};

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Chart colors
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  PURPLE: '#8b5cf6',
  PINK: '#ec4899',
  INDIGO: '#6366f1',
  GRAY: '#6b7280',
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Debounce delays (in milliseconds)
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
  BUTTON_CLICK: 300,
  SCROLL: 100,
};
