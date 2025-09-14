/**
 * Utility functions for handling profile pictures
 */

/**
 * Get the full URL for a profile picture
 * @param {string} photoPath - The photo path from the database
 * @param {string} fallbackPath - Fallback image path
 * @returns {string} Full URL to the profile picture
 */
export const getProfilePictureUrl = (photoPath, fallbackPath = '/uploads/defaults/default-user.png') => {
  if (!photoPath) {
    return fallbackPath;
  }
  
  // If it's already a full URL, return as is
  if (photoPath.startsWith('http')) {
    return photoPath;
  }
  
  // If it's a relative path, prepend the server URL
  if (photoPath.startsWith('/')) {
    return `http://localhost:8888${photoPath}`;
  }
  
  // If it's a relative path without leading slash, add it
  return `http://localhost:8888/${photoPath}`;
};

/**
 * Get the best available profile picture from user data
 * @param {Object} user - User object with photo fields
 * @param {string} fallbackPath - Fallback image path
 * @returns {string} Full URL to the profile picture
 */
export const getUserProfilePicture = (user, fallbackPath = '/uploads/defaults/default-user.png') => {
  // Try new field first
  if (user.profile_picture_url) {
    return getProfilePictureUrl(user.profile_picture_url, fallbackPath);
  }
  
  // Fall back to old field
  if (user.photo) {
    return getProfilePictureUrl(user.photo, fallbackPath);
  }
  
  // Return fallback
  return fallbackPath;
};

/**
 * Check if a profile picture exists and is valid
 * @param {string} photoPath - The photo path to check
 * @returns {boolean} True if the photo path is valid
 */
export const isValidProfilePicture = (photoPath) => {
  if (!photoPath) return false;
  
  // Check if it's a valid image file extension
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const hasValidExtension = validExtensions.some(ext => 
    photoPath.toLowerCase().includes(ext)
  );
  
  return hasValidExtension;
};
