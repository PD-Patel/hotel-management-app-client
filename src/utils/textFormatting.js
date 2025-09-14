/**
 * Format text with first letter capitalized and rest lowercase
 * @param {string} text - Text to format
 * @returns {string} - Formatted text
 */
export const formatName = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  // Handle multiple words (e.g., "john doe" -> "John doe")
  const words = text.trim().split(/\s+/);
  const formattedWords = words.map((word, index) => {
    if (index === 0) {
      // First word: capitalize first letter, lowercase rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    } else {
      // Other words: keep as is (allows for proper nouns, etc.)
      return word;
    }
  });
  
  return formattedWords.join(' ');
};

/**
 * Format multiple name fields in an object
 * @param {Object} data - Object containing name fields
 * @param {Array} fields - Array of field names to format
 * @returns {Object} - Object with formatted fields
 */
export const formatNameFields = (data, fields = ['firstName', 'lastName', 'position', 'department']) => {
  const formatted = { ...data };
  
  fields.forEach(field => {
    if (formatted[field]) {
      formatted[field] = formatName(formatted[field]);
    }
  });
  
  return formatted;
};

/**
 * Format text for display (capitalize first letter of each word)
 * @param {string} text - Text to format
 * @returns {string} - Formatted text
 */
export const formatDisplayText = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  return text
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format input value as user types (for real-time formatting)
 * @param {string} value - Current input value
 * @param {string} previousValue - Previous input value
 * @returns {string} - Formatted value
 */
export const formatInputValue = (value, previousValue) => {
  if (!value || typeof value !== 'string') {
    return value;
  }

  // If user is deleting characters, don't format
  if (value.length < previousValue.length) {
    return value;
  }

  // If user is adding characters at the beginning, capitalize first letter
  if (value.length === 1) {
    return value.toUpperCase();
  }

  // If user is adding characters in the middle or end, don't change case
  return value;
};

/**
 * Validate and format PIN input
 * @param {string} value - PIN input value
 * @returns {string} - Formatted PIN
 */
export const formatPinInput = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }
  
  // Only allow digits
  const digitsOnly = value.replace(/\D/g, '');
  
  // Limit to 4 digits
  return digitsOnly.slice(0, 4);
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number string
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return phone;
  }
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone;
};

/**
 * Format currency amount
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined || amount === '') {
    return '';
  }
  
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return amount;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(numAmount);
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} format - Format style ('short', 'long', 'relative')
 * @returns {string} - Formatted date
 */
export const formatDate = (date, format = 'short') => {
  if (!date) {
    return '';
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return date;
  }
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'relative':
      return getRelativeTimeString(dateObj);
    default:
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
  }
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date} date - Date to compare
 * @returns {string} - Relative time string
 */
const getRelativeTimeString = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  return date.toLocaleDateString();
};
