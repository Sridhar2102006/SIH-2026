/**
 * HONEYCHAIN — CENTRALIZED VERIFICATION SERVICE
 *
 * VERIFICATION_PROFILE: the authoritative record of what has been
 * submitted, reviewed, and confirmed for a user and their primary role.
 *
 * KEY RULES (§50–§62):
 *  - Verification CANNOT be self-granted. It requires admin/system action.
 *  - Test Result ≠ Quality Decision (Lab only)
 *  - VALID QR ≠ QUALITY CERTIFIED (Dispatch only)
 *  - HoneyChain report ≠ Official FSSAI certificate
 *  - Sensitive documents are NEVER shown in normal profile views
 *  - Every verification action creates an AUDIT_ENTRY
 */

import {
  IDENTITY_STATUS,
  VERIFICATION_LEVEL,
  ACCESS_STATE,
  DOCUMENT_TYPE
} from './identityService.js';

export const VERIFICATION_STORAGE_KEY = 'honeychain_verification_v1';

// ─── Verification Step States ─────────────────────────────────────────────────

export const VERIFICATION_STEP_STATE = Object.freeze({
  NOT_APPLICABLE: 'NOT_APPLICABLE',
  NOT_STARTED: 'NOT_STARTED',
  PENDING_UPLOAD: 'PENDING_UPLOAD',
  UPLOADED: 'UPLOADED',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  WAIVED: 'WAIVED'
});

// ─── Verification Phases ──────────────────────────────────────────────────────

export const VERIFICATION_PHASE = Object.freeze({
  IDENTITY: 'IDENTITY',
  ROLE: 'ROLE',
  ORGANIZATION: 'ORGANIZATION',
  REGULATORY: 'REGULATORY'
});

// ─── QR Validation Levels (Dispatch §74–§79) ──────────────────────────────────

export const QR_VALIDATION_LEVEL = Object.freeze({
  UNSCANNED: 'UNSCANNED',
  VALID_FORMAT: 'VALID_FORMAT',      // Format is parseable
  VALID_QR: 'VALID_QR',              // QR is system-registered (≠ quality certified)
  REVOKED: 'REVOKED',                // QR has been explicitly revoked
  QUALITY_CERTIFIED: 'QUALITY_CERTIFIED',  // Lab has attached certification
  RELEASED: 'RELEASED'               // Dispatch has released for transport
});

// ─── Verification Profile Factory ────────────────────────────────────────────

export const createVerificationProfile = (partial = {}) => ({
  profileId: partial.profileId || null,
  userId: partial.userId || null,
  primaryRole: partial.primaryRole || null,

  // IDENTITY VERIFICATION (same for all roles)
  identityVerification: {
    phase: VERIFICATION_PHASE.IDENTITY,
    status: partial.identityVerification?.status || VERIFICATION_STEP_STATE.NOT_STARTED,
    documentType: partial.identityVerification?.documentType || null,
    documentReference: partial.identityVerification?.documentReference || null, // masked ref only
    submittedAt: partial.identityVerification?.submittedAt || null,
    verifiedAt: partial.identityVerification?.verifiedAt || null,
    rejectionReason: partial.identityVerification?.rejectionReason || null,
    verifiedBy: partial.identityVerification?.verifiedBy || null
  },

  // ROLE VERIFICATION (role-specific)
  roleVerification: {
    phase: VERIFICATION_PHASE.ROLE,
    status: partial.roleVerification?.status || VERIFICATION_STEP_STATE.NOT_STARTED,
    documents: partial.roleVerification?.documents || [],
    submittedAt: partial.roleVerification?.submittedAt || null,
    verifiedAt: partial.roleVerification?.verifiedAt || null,
    rejectionReason: partial.roleVerification?.rejectionReason || null,
    verifiedBy: partial.roleVerification?.verifiedBy || null
  },

  // ORGANIZATION VERIFICATION (optional, for business roles)
  organizationVerification: {
    phase: VERIFICATION_PHASE.ORGANIZATION,
    status: partial.organizationVerification?.status || VERIFICATION_STEP_STATE.NOT_APPLICABLE,
    documents: partial.organizationVerification?.documents || [],
    submittedAt: partial.organizationVerification?.submittedAt || null,
    verifiedAt: partial.organizationVerification?.verifiedAt || null,
    verifiedBy: partial.organizationVerification?.verifiedBy || null
  },

  // REGULATORY VERIFICATION (Lab + Processor specific)
  regulatoryVerification: {
    phase: VERIFICATION_PHASE.REGULATORY,
    status: partial.regulatoryVerification?.status || VERIFICATION_STEP_STATE.NOT_APPLICABLE,
    fssaiSubmissions: partial.regulatoryVerification?.fssaiSubmissions || [],
    lastSubmissionAt: partial.regulatoryVerification?.lastSubmissionAt || null,
    verifiedAt: partial.regulatoryVerification?.verifiedAt || null,
    verifiedBy: partial.regulatoryVerification?.verifiedBy || null
  },

  // Computed overall verification level
  verifiedLevels: partial.verifiedLevels || [],
  accessState: partial.accessState || ACCESS_STATE.UNVERIFIED,
  createdAt: partial.createdAt || null,
  updatedAt: partial.updatedAt || null
});

// ─── Document Reference (metadata only, never content) ───────────────────────

export const createDocumentReference = (partial = {}) => ({
  documentId: partial.documentId || null,
  documentType: partial.documentType || DOCUMENT_TYPE.SUPPORTING_DOCUMENT,
  displayName: partial.displayName || '',
  maskedNumber: partial.maskedNumber || '',  // E.g. "••••1234"
  issuingAuthority: partial.issuingAuthority || '',
  uploadedAt: partial.uploadedAt || null,
  status: partial.status || VERIFICATION_STEP_STATE.UPLOADED,
  verifiedAt: partial.verifiedAt || null,
  expiresAt: partial.expiresAt || null,
  rejectionReason: partial.rejectionReason || null,
  // NEVER store: fileContent, fileUrl, rawDocument, blob
});

// ─── Audit Entry ──────────────────────────────────────────────────────────────

export const createAuditEntry = (action, actor, details = {}) => ({
  entryId: Date.now().toString(36),
  action,
  actor,
  timestamp: new Date().toISOString(),
  details
});

// ─── Verification Service ─────────────────────────────────────────────────────

export const VerificationService = {
  /**
   * Load verification profile from storage.
   */
  loadProfile() {
    try {
      const saved = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      if (saved) return createVerificationProfile(JSON.parse(saved));
    } catch (_) {}
    return createVerificationProfile();
  },

  /**
   * Save verification profile (metadata only).
   */
  saveProfile(profile) {
    try {
      localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(profile));
    } catch (_) {}
    return profile;
  },

  /**
   * Get the set of verification phases required for a given role.
   * Returns ordered array of VERIFICATION_PHASE values.
   */
  getRequiredPhasesForRole(role) {
    const phaseMap = {
      BEEKEEPER: [VERIFICATION_PHASE.IDENTITY, VERIFICATION_PHASE.ROLE],
      PROCESSOR: [VERIFICATION_PHASE.IDENTITY, VERIFICATION_PHASE.ROLE, VERIFICATION_PHASE.ORGANIZATION],
      LAB_SPECIALIST: [VERIFICATION_PHASE.IDENTITY, VERIFICATION_PHASE.ROLE, VERIFICATION_PHASE.ORGANIZATION, VERIFICATION_PHASE.REGULATORY],
      DISTRIBUTOR: [VERIFICATION_PHASE.IDENTITY, VERIFICATION_PHASE.ROLE, VERIFICATION_PHASE.ORGANIZATION]
    };
    return phaseMap[role] || [VERIFICATION_PHASE.IDENTITY];
  },

  /**
   * Compute overall verification state from profile.
   * CRITICAL: never self-verifies. Only flips VERIFIED when system sets it.
   */
  computeOverallState(profile) {
    if (!profile) return { level: 'NONE', accessState: ACCESS_STATE.UNVERIFIED };

    const idStatus = profile.identityVerification?.status;
    const roleStatus = profile.roleVerification?.status;

    if (idStatus === VERIFICATION_STEP_STATE.NOT_STARTED) {
      return { level: 'NONE', accessState: ACCESS_STATE.UNVERIFIED };
    }
    if ([VERIFICATION_STEP_STATE.UPLOADED, VERIFICATION_STEP_STATE.SUBMITTED, VERIFICATION_STEP_STATE.UNDER_REVIEW].includes(idStatus)) {
      return { level: 'IDENTITY_PENDING', accessState: ACCESS_STATE.IDENTITY_PENDING };
    }
    if (idStatus === VERIFICATION_STEP_STATE.REJECTED) {
      return { level: 'REJECTED', accessState: ACCESS_STATE.RESTRICTED };
    }
    if (idStatus === VERIFICATION_STEP_STATE.VERIFIED) {
      if (!roleStatus || roleStatus === VERIFICATION_STEP_STATE.NOT_STARTED) {
        return { level: VERIFICATION_LEVEL.IDENTITY_VERIFIED, accessState: ACCESS_STATE.IDENTITY_VERIFIED };
      }
      if ([VERIFICATION_STEP_STATE.UPLOADED, VERIFICATION_STEP_STATE.SUBMITTED, VERIFICATION_STEP_STATE.UNDER_REVIEW].includes(roleStatus)) {
        return { level: VERIFICATION_LEVEL.IDENTITY_VERIFIED, accessState: ACCESS_STATE.ROLE_VERIFICATION_PENDING };
      }
      if (roleStatus === VERIFICATION_STEP_STATE.VERIFIED) {
        return { level: VERIFICATION_LEVEL.ROLE_VERIFIED, accessState: ACCESS_STATE.ROLE_VERIFIED };
      }
    }
    return { level: 'NONE', accessState: ACCESS_STATE.UNVERIFIED };
  },

  /**
   * Get display label for a verification phase step status.
   */
  getStepStatusLabel(status) {
    const labels = {
      [VERIFICATION_STEP_STATE.NOT_APPLICABLE]: 'Not Required',
      [VERIFICATION_STEP_STATE.NOT_STARTED]: 'Not Started',
      [VERIFICATION_STEP_STATE.PENDING_UPLOAD]: 'Upload Required',
      [VERIFICATION_STEP_STATE.UPLOADED]: 'Uploaded',
      [VERIFICATION_STEP_STATE.SUBMITTED]: 'Submitted for Review',
      [VERIFICATION_STEP_STATE.UNDER_REVIEW]: 'Under Review',
      [VERIFICATION_STEP_STATE.VERIFIED]: 'Verified',
      [VERIFICATION_STEP_STATE.REJECTED]: 'Rejected',
      [VERIFICATION_STEP_STATE.EXPIRED]: 'Expired',
      [VERIFICATION_STEP_STATE.WAIVED]: 'Waived'
    };
    return labels[status] || status;
  },

  /**
   * Get display color class for a verification step status.
   */
  getStepStatusColor(status) {
    const colors = {
      [VERIFICATION_STEP_STATE.NOT_APPLICABLE]: 'neutral',
      [VERIFICATION_STEP_STATE.NOT_STARTED]: 'muted',
      [VERIFICATION_STEP_STATE.PENDING_UPLOAD]: 'warning',
      [VERIFICATION_STEP_STATE.UPLOADED]: 'info',
      [VERIFICATION_STEP_STATE.SUBMITTED]: 'info',
      [VERIFICATION_STEP_STATE.UNDER_REVIEW]: 'warning',
      [VERIFICATION_STEP_STATE.VERIFIED]: 'success',
      [VERIFICATION_STEP_STATE.REJECTED]: 'danger',
      [VERIFICATION_STEP_STATE.EXPIRED]: 'danger',
      [VERIFICATION_STEP_STATE.WAIVED]: 'neutral'
    };
    return colors[status] || 'neutral';
  },

  /**
   * Validate QR code at the appropriate level.
   * VALID QR ≠ QUALITY CERTIFIED — §74.
   */
  validateQrPackage(qrData, revokedQrs = []) {
    if (!qrData) return { level: QR_VALIDATION_LEVEL.UNSCANNED, isValid: false, message: 'No QR data.' };
    if (revokedQrs.includes(qrData.qrCode)) {
      return {
        level: QR_VALIDATION_LEVEL.REVOKED,
        isValid: false,
        canRelease: false,
        message: 'This QR code has been revoked and cannot be used.'
      };
    }
    if (qrData.isSystemRegistered) {
      const level = qrData.hasLabCertification
        ? QR_VALIDATION_LEVEL.QUALITY_CERTIFIED
        : QR_VALIDATION_LEVEL.VALID_QR;
      return {
        level,
        isValid: true,
        canRelease: true,
        isQualityCertified: qrData.hasLabCertification === true,
        message: level === QR_VALIDATION_LEVEL.QUALITY_CERTIFIED
          ? 'Valid QR — Quality certification attached.'
          : 'Valid QR — Not quality certified (certification is optional).',
        warning: level === QR_VALIDATION_LEVEL.VALID_QR
          ? 'This package has not been quality certified by a lab.'
          : null
      };
    }
    return {
      level: QR_VALIDATION_LEVEL.VALID_FORMAT,
      isValid: false,
      canRelease: false,
      message: 'QR code is not registered in the HoneyChain system.'
    };
  }
};

export { VERIFICATION_STEP_STATE, QR_VALIDATION_LEVEL };
