/**
 * Input validation and sanitization utilities for authentication and registration
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates registration input fields
 * @param {Object} data - { name, email, password, confirmPassword }
 * @returns {Object} - { isValid: boolean, error: string|null, sanitized: Object }
 */
function validateRegistrationInput({ name, email, password, confirmPassword }) {
  // 1. Name validation
  if (!name || typeof name !== "string") {
    return { isValid: false, error: "Please provide a valid name." };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long." };
  }
  if (trimmedName.length > 100) {
    return { isValid: false, error: "Name cannot exceed 100 characters." };
  }

  // Reject control characters or malformed scripts
  if (/[\u0000-\u001F\u007F]/.test(trimmedName)) {
    return { isValid: false, error: "Name contains invalid characters." };
  }

  // 2. Email validation
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Please provide a valid email address." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > 254) {
    return { isValid: false, error: "Email address is too long." };
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { isValid: false, error: "Please provide a valid email address." };
  }

  // 3. Password validation
  if (!password || typeof password !== "string") {
    return { isValid: false, error: "Please provide a password." };
  }

  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long." };
  }

  if (password.length > 128) {
    return { isValid: false, error: "Password cannot exceed 128 characters." };
  }

  if (password.trim().length === 0) {
    return { isValid: false, error: "Password cannot consist solely of whitespace." };
  }

  // 4. Confirm Password validation
  if (confirmPassword === undefined || confirmPassword === null || typeof confirmPassword !== "string") {
    return { isValid: false, error: "Please confirm your password." };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match." };
  }

  return {
    isValid: true,
    error: null,
    sanitized: {
      name: trimmedName,
      email: normalizedEmail,
      password
    }
  };
}

/**
 * Validates login input fields
 * @param {Object} data - { email, password }
 * @returns {Object} - { isValid: boolean, error: string|null, sanitized: Object }
 */
function validateLoginInput({ email, password }) {
  if (!email || typeof email !== "string" || !password || typeof password !== "string") {
    return { isValid: false, error: "Please provide both email and password." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { isValid: false, error: "Invalid email or password." };
  }

  if (password.length > 128) {
    return { isValid: false, error: "Invalid email or password." };
  }

  return {
    isValid: true,
    error: null,
    sanitized: {
      email: normalizedEmail,
      password
    }
  };
}

module.exports = {
  validateRegistrationInput,
  validateLoginInput,
  EMAIL_REGEX
};
