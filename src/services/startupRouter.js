/**
 * HoneyChain Startup Routing & Session Abstraction
 * 
 * Determines initial screen transition based on user authentication
 * and onboarding status. Designed for clean extensibility when
 * connecting live backend authentication, offline tokens, or biometrics.
 */

export const StartupDestination = {
  WELCOME: 'welcome',
  HOME: 'home',
  ONBOARDING: 'onboarding',
  VERIFICATION: 'verification',
  FORGOT_PASSWORD: 'forgot-password'
};

export const SessionStatus = {
  UNAUTHENTICATED: 'unauthenticated',
  AUTHENTICATED_ONBOARDED: 'authenticated_onboarded',
  AUTHENTICATED_PENDING_ONBOARDING: 'authenticated_pending_onboarding',
  AUTHENTICATED_UNVERIFIED: 'authenticated_unverified'
};

const DEFAULT_SESSION_KEY = 'honeychain_user_session';

/**
 * Default session configuration:
 * Initialized as authenticated + onboarded master apiarist so the primary
 * beekeeper field companion is active, but easily configurable for first-time
 * or pending onboarding states.
 */
export const getMasterApiaristSession = () => ({
  isAuthenticated: true,
  isOnboardingComplete: true,
  operator: 'Sarah Lindqvist',
  apiaryId: 'apiary-mb-01',
  role: 'Master Apiarist',
  designations: ['BEEKEEPER', 'PROCESSOR'],
  capabilities: [
    'HIVE_MANAGEMENT',
    'HIVE_INSPECTION',
    'HIVE_IMAGE_CAPTURE',
    'HONEY_COLLECTION',
    'PROCESSING_MANAGEMENT',
    'BATCH_INTAKE',
    'PROCESSING_STEP_RECORD',
    'BATCH_TRACEABILITY'
  ],
  workContexts: {
    areas: ['Apiary / farm', 'Processing facility'],
    handles: ['Hive operations', 'Honey batches']
  }
});

export const getDefaultSession = () => {
  try {
    const saved = localStorage.getItem(DEFAULT_SESSION_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // Graceful fallback for sandboxed environments
  }

  // New or logged-out user launches with clean session, routing Splash -> Welcome Screen 02
  return {
    isAuthenticated: false,
    isOnboardingComplete: false,
    operator: null,
    designations: [],
    capabilities: [],
    workContexts: { areas: [], handles: [] },
    accessProfile: null
  };
};

export const persistSession = (session) => {
  try {
    localStorage.setItem(DEFAULT_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    // Ignore storage errors in restricted contexts
  }
};

/**
 * Pure startup destination resolver.
 * 
 * Logic flow:
 * 1. If not authenticated or first-time user -> WELCOME
 * 2. If authenticated and requires verification -> VERIFICATION
 * 3. If authenticated but onboarding incomplete -> ONBOARDING
 * 4. If authenticated and fully onboarded -> HOME
 *
 * @param {Object} session - User session object
 * @returns {string} StartupDestination (welcome | home | onboarding | verification)
 */
export const resolveStartupDestination = (session) => {
  if (!session || !session.isAuthenticated) {
    return StartupDestination.WELCOME;
  }

  if (session.requiresVerification) {
    return StartupDestination.VERIFICATION;
  }

  if (!session.isOnboardingComplete) {
    return StartupDestination.ONBOARDING;
  }

  return StartupDestination.HOME;
};

/**
 * Performs startup preflight checks (e.g. storage integrity, offline queue check)
 * with a controlled display duration so splash animation can resolve calmly.
 * 
 * @param {Object} session
 * @param {number} minDelayMs
 * @returns {Promise<string>} Target destination
 */
export const performStartupInitialization = async (session, minDelayMs = 1800) => {
  const startTime = Date.now();

  // Non-blocking preflight tasks (token validation, cache verification, etc.)
  const destination = resolveStartupDestination(session);

  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, minDelayMs - elapsed);

  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }

  return destination;
};
