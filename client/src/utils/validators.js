// Required field validation
export const required = (value) => (value ? true : 'This field is required');

// Minimum length validation
export const minLength = (min) => (value) =>
  value.length >= min ? true : `Must be at least ${min} characters`;

// Email validation
export const emailValidator = (value) =>
  /.+@.+\..+/.test(value) ? true : 'Please enter a valid email address';

// Confirm password validation
export const confirmed = (value, target) =>
  value === target ? true : "Passwords don't match";
