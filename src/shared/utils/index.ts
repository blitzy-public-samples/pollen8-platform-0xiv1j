import { ApiResponse } from 'src/shared/types/index';
import { ERROR_MESSAGES, INVITE_CODE_LENGTH } from 'src/shared/constants/index';

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Remove non-digit characters
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  
  // Check if the number has a valid length (assuming 10 digits for US numbers)
  if (cleanedNumber.length !== 10) {
    return false;
  }
  
  // Optional: Use regex to validate format (e.g., for US numbers)
  const phoneRegex = /^(\+1|1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
  return phoneRegex.test(cleanedNumber);
};

export const formatDate = (date: Date, format: string): string => {
  const options: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case 'short':
      options.dateStyle = 'short';
      break;
    case 'long':
      options.dateStyle = 'long';
      break;
    // Add more custom formats as needed
    default:
      options.dateStyle = 'medium';
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const generateInviteCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const calculateNetworkValue = (userData: any): number => {
  const { connections, activity } = userData;
  let value = 0;
  
  // Basic calculation based on connection count
  value += connections.length * 10;
  
  // Factor in connection quality (assuming a quality score from 0 to 1)
  const qualityScore = connections.reduce((sum, conn) => sum + conn.quality, 0) / connections.length;
  value *= (1 + qualityScore);
  
  // Factor in user activity (assuming an activity score from 0 to 100)
  value *= (1 + (activity / 100));
  
  return Math.round(value);
};

export const handleApiResponse = <T>(response: ApiResponse<T>): T => {
  if (response.success) {
    return response.data as T;
  } else {
    throw new Error(response.error || ERROR_MESSAGES.UNKNOWN_ERROR);
  }
};

export const debounce = (func: Function, wait: number): Function => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
};

export const throttle = (func: Function, wait: number): Function => {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      func(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = now;
        func(...args);
        timeoutId = null;
      }, wait - (now - lastCall));
    }
  };
};