/**
 * HoneyChain Centralized Authentication Service
 * 
 * Handles credential validation, password verification, social OAuth simulation,
 * and state-aware session determination. Isolates backend details from UI layer.
 */

// Standard client-side email format regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Please enter your email.';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return "That email address doesn't look right.";
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password || !password.trim()) {
    return 'Please enter your password.';
  }
  return null;
};

/**
 * Authenticates user credentials asynchronously.
 * Returns human-readable error messages without exposing backend/HTTP error codes.
 */
export const signInWithCredentials = async ({ email, password, isOnline = true }) => {
  // Check offline state
  if (!isOnline) {
    return {
      success: false,
      errorType: 'OFFLINE',
      message: "Couldn't connect. Check your internet connection and try again."
    };
  }

  // Pre-validation
  const emailError = validateEmail(email);
  if (emailError) {
    return { success: false, errorType: 'VALIDATION', field: 'email', message: emailError };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { success: false, errorType: 'VALIDATION', field: 'password', message: passwordError };
  }

  // Simulated network latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  const trimmedEmail = email.trim().toLowerCase();

  // Test case 1: unverified account simulation
  if (trimmedEmail === 'unverified@honeychain.org') {
    return {
      success: false,
      errorType: 'UNVERIFIED',
      message: 'Please verify your email before signing in.'
    };
  }

  // Test case 2: credentials mismatch (e.g. invalid test)
  if (password === 'wrongpassword') {
    return {
      success: false,
      errorType: 'INVALID_CREDENTIALS',
      message: "Your email or password doesn't match."
    };
  }

  // Test case 3: new apiarist pending onboarding
  if (trimmedEmail === 'new@honeychain.org') {
    return {
      success: true,
      session: {
        isAuthenticated: true,
        isOnboardingComplete: false,
        requiresVerification: false,
        email: trimmedEmail,
        operator: 'New Apiarist',
        role: 'Apiarist Apprentice'
      }
    };
  }

  // Default successful authentication (Master Apiarist)
  return {
    success: true,
    session: {
      isAuthenticated: true,
      isOnboardingComplete: true,
      requiresVerification: false,
      email: trimmedEmail,
      operator: 'Sarah Lindqvist',
      apiaryId: 'apiary-mb-01',
      role: 'Master Apiarist'
    }
  };
};

/**
 * Authenticates via Google provider
 */
export const signInWithGoogle = async ({ isOnline = true }) => {
  if (!isOnline) {
    return {
      success: false,
      errorType: 'OFFLINE',
      message: "Couldn't connect. Check your internet connection and try again."
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 750));

  return {
    success: true,
    session: {
      isAuthenticated: true,
      isOnboardingComplete: true,
      requiresVerification: false,
      email: 'sarah.lindqvist@gmail.com',
      operator: 'Sarah Lindqvist',
      apiaryId: 'apiary-mb-01',
      role: 'Master Apiarist',
      authProvider: 'google'
    }
  };
};

/**
 * Backend OTP configuration.
 * Configurable so the presentation layer does not hard-code digits.
 */
export const getOtpConfiguration = () => ({
  length: 6,
  resendCooldownSeconds: 30
});

/**
 * Mask an email for privacy if desired (e.g. sri***@example.com)
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const visible = local.slice(0, 3);
  return `${visible}***@${domain}`;
};

// Tracks client-side verification attempt count for security throttling
let attemptCount = 0;

export const resetVerificationAttempts = () => {
  attemptCount = 0;
};

/**
 * Verifies email OTP with the authentication provider.
 * Returns human-readable error messages without exposing backend internals.
 */
export const verifyEmailOtp = async ({ email, otp, isOnline = true }) => {
  if (!isOnline) {
    return {
      success: false,
      errorType: 'OFFLINE',
      message: "Couldn't verify the code. Check your connection and try again."
    };
  }

  // Throttling protection
  if (attemptCount >= 3) {
    return {
      success: false,
      errorType: 'TOO_MANY_ATTEMPTS',
      message: "Too many attempts. Please request a new code and try again."
    };
  }

  // Simulated backend latency
  await new Promise((resolve) => setTimeout(resolve, 700));

  // Test simulation: '999999' simulates expired OTP
  if (otp === '999999') {
    attemptCount += 1;
    return {
      success: false,
      errorType: 'EXPIRED_CODE',
      message: "This code has expired. Request a new one."
    };
  }

  // Test simulation: '000000' simulates code mismatch
  if (otp === '000000') {
    attemptCount += 1;
    return {
      success: false,
      errorType: 'INVALID_CODE',
      message: "That code doesn't match. Check the email and try again."
    };
  }

  // Reset attempts on success
  attemptCount = 0;

  return {
    success: true,
    message: "Email verified",
    session: {
      isAuthenticated: true,
      requiresVerification: false,
      email: email || ''
    }
  };
};

/**
 * Resends a verification OTP code with enforced cooldown.
 */
export const resendVerificationOtp = async ({ email, isOnline = true }) => {
  if (!isOnline) {
    return {
      success: false,
      errorType: 'OFFLINE',
      message: "Couldn't send a new code. Check your connection and try again."
    };
  }

  // Reset attempt count when a new code is requested
  attemptCount = 0;

  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    message: "New code sent.",
    cooldownSeconds: 30
  };
};
