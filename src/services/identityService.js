/**
 * HONEYCHAIN — CENTRALIZED IDENTITY SERVICE
 *
 * Canonical USER_IDENTITY model. One source of truth for all roles.
 * Government ID documents are NEVER stored in localStorage/public state.
 * Only status and masked references are held client-side.
 *
 * Architecture: §4, §6, §50, §54
 */

export const IDENTITY_STORAGE_KEY = 'honeychain_identity_v1';

// ─── Identity Status ─────────────────────────────────────────────────────────

export const IDENTITY_STATUS = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  REVERIFICATION_REQUIRED: 'REVERIFICATION_REQUIRED'
});

// ─── Access States ────────────────────────────────────────────────────────────

export const ACCESS_STATE = Object.freeze({
  UNVERIFIED: 'UNVERIFIED',
  IDENTITY_PENDING: 'IDENTITY_PENDING',
  IDENTITY_VERIFIED: 'IDENTITY_VERIFIED',
  ROLE_VERIFICATION_PENDING: 'ROLE_VERIFICATION_PENDING',
  ROLE_VERIFIED: 'ROLE_VERIFIED',
  RESTRICTED: 'RESTRICTED',
  SUSPENDED: 'SUSPENDED',
  EXPIRED: 'EXPIRED'
});

// ─── Verification Levels ──────────────────────────────────────────────────────

export const VERIFICATION_LEVEL = Object.freeze({
  IDENTITY_VERIFIED: 'IDENTITY_VERIFIED',
  ROLE_VERIFIED: 'ROLE_VERIFIED',
  ORGANIZATION_VERIFIED: 'ORGANIZATION_VERIFIED',
  REGULATORY_VERIFIED: 'REGULATORY_VERIFIED'
});

// ─── Document Types ───────────────────────────────────────────────────────────

export const DOCUMENT_TYPE = Object.freeze({
  // Identity Documents (government-issued)
  GOVERNMENT_ID: 'GOVERNMENT_ID',
  AADHAAR: 'AADHAAR',
  PAN: 'PAN',
  VOTER_ID: 'VOTER_ID',
  PASSPORT: 'PASSPORT',
  DRIVING_LICENSE: 'DRIVING_LICENSE',

  // Business Registration
  GSTIN: 'GSTIN',
  BUSINESS_REGISTRATION: 'BUSINESS_REGISTRATION',
  FSSAI_LICENSE: 'FSSAI_LICENSE',
  FSSAI_REGISTRATION: 'FSSAI_REGISTRATION',

  // Agricultural / Apiculture
  KVIC_REGISTRATION: 'KVIC_REGISTRATION',
  APICULTURE_REGISTRATION: 'APICULTURE_REGISTRATION',

  // Professional Credentials
  PROFESSIONAL_QUALIFICATION: 'PROFESSIONAL_QUALIFICATION',
  LAB_AUTHORIZATION: 'LAB_AUTHORIZATION',
  ACCREDITATION_CERTIFICATE: 'ACCREDITATION_CERTIFICATE',
  NABL_ACCREDITATION: 'NABL_ACCREDITATION',

  // Facility
  FACILITY_REGISTRATION: 'FACILITY_REGISTRATION',
  TRANSPORT_LICENSE: 'TRANSPORT_LICENSE',

  // Supporting
  SUPPORTING_DOCUMENT: 'SUPPORTING_DOCUMENT',
  CALIBRATION_CERTIFICATE: 'CALIBRATION_CERTIFICATE'
});

// ─── Role-to-Required Documents Mapping ──────────────────────────────────────
// Only CORE required docs. Optional docs are configurable.

export const ROLE_DOCUMENT_REQUIREMENTS = Object.freeze({
  BEEKEEPER: {
    required: [DOCUMENT_TYPE.GOVERNMENT_ID],
    optional: [DOCUMENT_TYPE.KVIC_REGISTRATION, DOCUMENT_TYPE.APICULTURE_REGISTRATION],
    recommended: [DOCUMENT_TYPE.KVIC_REGISTRATION]
  },
  PROCESSOR: {
    required: [DOCUMENT_TYPE.GOVERNMENT_ID],
    optional: [
      DOCUMENT_TYPE.BUSINESS_REGISTRATION,
      DOCUMENT_TYPE.FSSAI_LICENSE,
      DOCUMENT_TYPE.FSSAI_REGISTRATION,
      DOCUMENT_TYPE.GSTIN
    ],
    recommended: [DOCUMENT_TYPE.FSSAI_REGISTRATION, DOCUMENT_TYPE.BUSINESS_REGISTRATION]
  },
  LAB_SPECIALIST: {
    required: [DOCUMENT_TYPE.GOVERNMENT_ID, DOCUMENT_TYPE.LAB_AUTHORIZATION],
    optional: [
      DOCUMENT_TYPE.NABL_ACCREDITATION,
      DOCUMENT_TYPE.ACCREDITATION_CERTIFICATE,
      DOCUMENT_TYPE.PROFESSIONAL_QUALIFICATION
    ],
    recommended: [DOCUMENT_TYPE.PROFESSIONAL_QUALIFICATION]
  },
  DISTRIBUTOR: {
    required: [DOCUMENT_TYPE.GOVERNMENT_ID],
    optional: [
      DOCUMENT_TYPE.BUSINESS_REGISTRATION,
      DOCUMENT_TYPE.GSTIN,
      DOCUMENT_TYPE.FSSAI_LICENSE,
      DOCUMENT_TYPE.TRANSPORT_LICENSE
    ],
    recommended: [DOCUMENT_TYPE.BUSINESS_REGISTRATION, DOCUMENT_TYPE.GSTIN]
  }
});

// ─── Default Identity Object ──────────────────────────────────────────────────

export const createDefaultIdentity = (partial = {}) => ({
  identityId: partial.identityId || null,
  userId: partial.userId || null,
  legalName: partial.legalName || '',
  displayName: partial.displayName || '',
  mobile: partial.mobile || '',
  email: partial.email || '',
  address: partial.address || '',
  location: partial.location || { state: '', district: '', town: '' },
  identityStatus: partial.identityStatus || IDENTITY_STATUS.NOT_STARTED,
  accessState: partial.accessState || ACCESS_STATE.UNVERIFIED,
  verifiedLevels: partial.verifiedLevels || [],
  primaryRole: partial.primaryRole || null,  // 'BEEKEEPER' | 'PROCESSOR' | 'LAB_SPECIALIST' | 'DISTRIBUTOR'
  createdAt: partial.createdAt || null,
  updatedAt: partial.updatedAt || null
});

// ─── Identity Service ─────────────────────────────────────────────────────────

export const IdentityService = {
  /**
   * Load identity from local storage (status only, never document data).
   */
  loadIdentity() {
    try {
      const saved = localStorage.getItem(IDENTITY_STORAGE_KEY);
      if (saved) return { ...createDefaultIdentity(), ...JSON.parse(saved) };
    } catch (_) {}
    return createDefaultIdentity();
  },

  /**
   * Save identity status (not document contents).
   */
  saveIdentity(identity) {
    try {
      // Strip any accidentally included document blobs
      const safe = { ...identity };
      delete safe.documentBlobs;
      delete safe.rawDocuments;
      localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(safe));
    } catch (_) {}
    return identity;
  },

  /**
   * Compute access state from verification levels.
   * Never self-grants — requires explicit verification submission.
   */
  computeAccessState(identity, verificationProfile) {
    if (!identity || identity.identityStatus === IDENTITY_STATUS.NOT_STARTED) {
      return ACCESS_STATE.UNVERIFIED;
    }
    if (identity.identityStatus === IDENTITY_STATUS.DRAFT || identity.identityStatus === IDENTITY_STATUS.SUBMITTED) {
      return ACCESS_STATE.IDENTITY_PENDING;
    }
    if (identity.identityStatus === IDENTITY_STATUS.REJECTED) {
      return ACCESS_STATE.RESTRICTED;
    }
    if (identity.identityStatus === IDENTITY_STATUS.VERIFIED) {
      const levels = identity.verifiedLevels || [];
      if (levels.includes(VERIFICATION_LEVEL.ROLE_VERIFIED)) return ACCESS_STATE.ROLE_VERIFIED;
      if (levels.includes(VERIFICATION_LEVEL.IDENTITY_VERIFIED)) return ACCESS_STATE.ROLE_VERIFICATION_PENDING;
      return ACCESS_STATE.IDENTITY_VERIFIED;
    }
    return ACCESS_STATE.UNVERIFIED;
  },

  /**
   * Mask an identity document number for display.
   * Keeps last 4 characters visible.
   */
  maskDocumentNumber(number = '') {
    if (!number || number.length < 4) return '••••';
    const visible = number.slice(-4);
    const masked = '•'.repeat(Math.max(0, number.length - 4));
    return masked + visible;
  },

  /**
   * Get human-readable identity status.
   */
  getStatusLabel(status) {
    const labels = {
      [IDENTITY_STATUS.NOT_STARTED]: 'Not Started',
      [IDENTITY_STATUS.DRAFT]: 'Draft',
      [IDENTITY_STATUS.SUBMITTED]: 'Submitted — Awaiting Review',
      [IDENTITY_STATUS.UNDER_REVIEW]: 'Under Review',
      [IDENTITY_STATUS.VERIFIED]: 'Verified',
      [IDENTITY_STATUS.REJECTED]: 'Rejected',
      [IDENTITY_STATUS.EXPIRED]: 'Expired',
      [IDENTITY_STATUS.REVERIFICATION_REQUIRED]: 'Re-verification Required'
    };
    return labels[status] || status;
  },

  /**
   * Check if a role has sufficient verification to access sensitive features.
   * Verification ≠ All Permissions — see §59.
   */
  canAccessSensitiveFeature(identity, featureClass = 'STANDARD') {
    if (!identity) return false;
    const state = identity.accessState || ACCESS_STATE.UNVERIFIED;
    if (featureClass === 'STANDARD') {
      return [ACCESS_STATE.IDENTITY_VERIFIED, ACCESS_STATE.ROLE_VERIFICATION_PENDING, ACCESS_STATE.ROLE_VERIFIED].includes(state);
    }
    if (featureClass === 'ROLE_SENSITIVE') {
      return state === ACCESS_STATE.ROLE_VERIFIED;
    }
    return false;
  }
};
