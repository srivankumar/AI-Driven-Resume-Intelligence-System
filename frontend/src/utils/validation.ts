/**
 * Comprehensive validation utilities for all forms
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

// Email validation with detailed feedback
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long (max 254 characters)' };
  }

  return { isValid: true };
};

// Password validation with specific requirements
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long (max 128 characters)' };
  }

  // Check for at least one uppercase, one lowercase, and one number
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      isValid: true,
      warning: 'Stronger password: use uppercase, lowercase, and numbers',
    };
  }

  return { isValid: true };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: 'Full name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (name.trim().length > 100) {
    return { isValid: false, error: 'Name is too long (max 100 characters)' };
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

// Password confirmation validation
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

// Resume file validation
export const validateResumeFile = (file: File | null): ValidationResult => {
  if (!file) {
    return { isValid: false, error: 'Resume file is required' };
  }

  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only PDF and Word documents are allowed' };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: `File size must be less than 5MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)` };
  }

  if (file.size < 10 * 1024) { // 10KB
    return { isValid: false, error: 'File seems too small to be a valid resume' };
  }

  return { isValid: true };
};

// Check if email is already registered (requires API call)
export const checkEmailExists = async (email: string): Promise<ValidationResult> => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Network error');
    }

    const data = await response.json();
    
    if (data.exists) {
      return { isValid: false, error: 'This email is already registered. Try logging in instead.' };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Email check error:', error);
    // Don't block form if check fails, just warn
    return { isValid: true };
  }
};

// Job deadline validation
export const validateJobDeadline = (deadline: string): ValidationResult => {
  const deadlineDate = new Date(deadline);
  const now = new Date();

  if (deadlineDate < now) {
    return { isValid: false, error: 'Application deadline has passed' };
  }

  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDeadline === 0) {
    return { isValid: true, warning: 'Deadline is today!' };
  }

  if (daysUntilDeadline === 1) {
    return { isValid: true, warning: 'Deadline is tomorrow!' };
  }

  if (daysUntilDeadline < 3) {
    return { isValid: true, warning: `Only ${daysUntilDeadline} days until deadline` };
  }

  return { isValid: true };
};

// Combined form validation
export const validateLoginForm = (email: string, password: string) => {
  const errors: Record<string, string> = {};

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error || '';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegisterForm = (name: string, email: string, password: string, confirmPassword: string) => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error || '';
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error || '';
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error || '';
  } else if (passwordValidation.warning) {
    warnings.password = passwordValidation.warning;
  }

  const matchValidation = validatePasswordMatch(password, confirmPassword);
  if (!matchValidation.isValid) {
    errors.confirmPassword = matchValidation.error || '';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Format date for display
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Get deadline status with color
export const getDeadlineStatus = (deadline: string): { status: string; color: string; daysLeft: number } => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { status: 'Expired', color: 'text-red-600 bg-red-50', daysLeft: 0 };
  }
  if (daysLeft === 0) {
    return { status: 'Today', color: 'text-orange-600 bg-orange-50', daysLeft: 0 };
  }
  if (daysLeft <= 3) {
    return { status: `${daysLeft}d left`, color: 'text-orange-600 bg-orange-50', daysLeft };
  }
  if (daysLeft <= 7) {
    return { status: `${daysLeft}d left`, color: 'text-yellow-600 bg-yellow-50', daysLeft };
  }
  return { status: `${daysLeft}d left`, color: 'text-green-600 bg-green-50', daysLeft };
};
