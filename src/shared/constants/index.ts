// Base URL for API requests
export const API_BASE_URL = '/api/v1';

// Key used to store authentication token in local storage
export const AUTH_TOKEN_KEY = 'pollen8_auth_token';

// Maximum number of industries a user can select
export const MAX_INDUSTRIES = 3;

// Maximum number of interests a user can select
export const MAX_INTERESTS = 3;

// Length of generated invite codes
export const INVITE_CODE_LENGTH = 8;

// Common error messages used throughout the application
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid phone number or verification code',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  INVALID_INPUT: 'Please check your input and try again'
};

// Thresholds for different network value levels
export const NETWORK_VALUE_THRESHOLDS = {
  LOW: 10,
  MEDIUM: 50,
  HIGH: 100
};

// Duration values for various animations in milliseconds
export const ANIMATION_DURATIONS = {
  FADE: 300,
  SLIDE: 500,
  PULSE: 1000
};