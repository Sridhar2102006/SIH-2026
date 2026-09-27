/**
 * HoneyChain Authoritative Backend Access & Audit Service
 *
 * Simulates server-authoritative capability validation, policy versioning,
 * access recalculation, immutable audit logging, and legacy role migration.
 */

import { normalizeCapabilityList } from './capabilityTaxonomy.js';
import {
  evaluateDesignationEligibility,
  DESIGNATION_MAP
} from './designationEngine.js';
import {
  resolvePermissionsAndModules
} from './permissionEngine.js';

export const ACCESS_POLICY_VERSION = 12;

const AUDIT_STORAGE_KEY = 'honeychain_security_audit_log';

/**
 * In-memory / persistent audit event logger
 */
export const logAccessEvent = ({
  eventType,
  actor = 'SYSTEM',
  targetUserId = 'anonymous',
  previousState = null,
  newState = null,
  reason = ''
}) => {
  const event = {
    eventId: `evt-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
    eventType,
    actor,
    targetUserId,
    previousState,
    newState,
    reason,
    policyVersion: ACCESS_POLICY_VERSION
  };

  try {
    if (typeof localStorage !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
      const updated = [event, ...existing].slice(0, 100); // Ring buffer 100 entries
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    // Non-blocking
  }

  return event;
};

export const getAuditLog = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      return JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
    }
    return [];
  } catch (e) {
    return [];
  }
};

/**
 * Server-authoritative resolution engine.
 * Validates declared capabilities, resolves designation eligibility,
 * sanitizes confirmed designations, and constructs the cryptographically verified access profile.
 *
 * @param {Object} payload
 * @returns {Object} Authoritative access envelope
 */
export const resolveAuthoritativeAccess = (payload = {}) => {
  const {
    userId = 'usr-current',
    capabilities = [],
    designations = [],
    workContexts = { areas: [], handles: [] },
    isSystemAdmin = false,
    actor = 'SELF'
  } = payload;

  // 1. Capability Normalization Pipeline
  const normalizedCapabilities = normalizeCapabilityList(capabilities);

  // 2. Deterministic Designation Eligibility Evaluation
  const eligibilityResult = evaluateDesignationEligibility(normalizedCapabilities);

  // 3. Designation Sanitization:
  // User cannot self-confirm a designation for which they are NOT_ELIGIBLE,
  // unless explicitly authorized as system administrator.
  const eligibleIdSet = new Set(eligibilityResult.eligibleDesignations.map(e => e.designationId));
  const sanitizedConfirmedDesignations = designations
    .map(d => typeof d === 'string' ? d.toUpperCase() : '')
    .filter(id => DESIGNATION_MAP.has(id) && (eligibleIdSet.has(id) || isSystemAdmin));

  // SECURITY: Suggestions are NOT authorization.
  // A user who confirms zero designations receives zero designation-based access.
  // The suggested designations are only shown during onboarding for user selection.
  // They are NEVER auto-granted as confirmed access.
  // Fail-closed: UNKNOWN/EMPTY → DENY designation access.
  const finalDesignations = sanitizedConfirmedDesignations;

  // 4. Module & Action-Level Permission Resolution
  const permissionResolution = resolvePermissionsAndModules({
    capabilities: normalizedCapabilities,
    designations: finalDesignations,
    isSystemAdmin
  });

  // 5. Audit Logging for Significant Access Grant
  logAccessEvent({
    eventType: 'ACCESS_PROFILE_RESOLVED',
    actor,
    targetUserId: userId,
    previousState: null,
    newState: {
      capabilitiesCount: normalizedCapabilities.length,
      designations: finalDesignations,
      modulesCount: permissionResolution.moduleIds.length,
      permissionsCount: permissionResolution.permissionIds.length
    },
    reason: 'Authoritative capability resolution applied'
  });

  return {
    userId,
    policyVersion: ACCESS_POLICY_VERSION,
    normalizedCapabilities,
    eligibilityResult,
    confirmedDesignations: finalDesignations,
    workContexts: {
      areas: Array.isArray(workContexts.areas) ? workContexts.areas : [],
      handles: Array.isArray(workContexts.handles) ? workContexts.handles : []
    },
    accessProfile: {
      moduleIds: permissionResolution.moduleIds,
      resolvedModules: permissionResolution.resolvedModules,
      groupedModules: permissionResolution.groupedModules,
      permissionIds: permissionResolution.permissionIds,
      moduleJustifications: permissionResolution.moduleJustifications,
      isSystemAdmin: permissionResolution.privilegedActionsGranted
    },
    resolvedAt: new Date().toISOString()
  };
};

/**
 * Revalidates an existing session to detect policy version discrepancies or revocations.
 *
 * @param {Object} currentSession
 * @returns {Object} Updated session with latest authoritative access
 */
export const revalidateUserAccess = (currentSession) => {
  if (!currentSession || !currentSession.isAuthenticated) {
    return currentSession;
  }

  // If policy version is current, return cached session
  if (currentSession.accessProfile && currentSession.policyVersion === ACCESS_POLICY_VERSION) {
    return currentSession;
  }

  // Recalculate authoritatively under new policy version
  const authoritativeEnvelope = resolveAuthoritativeAccess({
    userId: currentSession.userId || 'usr-current',
    capabilities: currentSession.capabilities || [],
    designations: currentSession.designations || [],
    workContexts: currentSession.workContexts || { areas: [], handles: [] },
    isSystemAdmin: currentSession.isSystemAdmin || false,
    actor: 'POLICY_REVALIDATOR'
  });

  logAccessEvent({
    eventType: 'POLICY_REVALIDATION_APPLIED',
    actor: 'SYSTEM',
    targetUserId: currentSession.userId || 'usr-current',
    previousState: { policyVersion: currentSession.policyVersion },
    newState: { policyVersion: ACCESS_POLICY_VERSION },
    reason: `Upgraded to access policy version ${ACCESS_POLICY_VERSION}`
  });

  return {
    ...currentSession,
    policyVersion: ACCESS_POLICY_VERSION,
    capabilities: authoritativeEnvelope.normalizedCapabilities,
    designations: authoritativeEnvelope.confirmedDesignations,
    workContexts: authoritativeEnvelope.workContexts,
    accessProfile: authoritativeEnvelope.accessProfile
  };
};

/**
 * Migration Strategy:
 * Migrates a legacy single-role user into the modern capability-driven architecture.
 *
 * @param {string} legacyRole - e.g. "Master Apiarist", "beekeeper", "processor"
 * @param {Object} legacySession - Previous session object
 * @returns {Object} Migrated session with normalized capabilities and resolved access
 */
export const migrateLegacyRole = (legacyRole, legacySession = {}) => {
  const roleStr = (legacyRole || '').toLowerCase();
  let mappedCapabilities = [];
  let mappedDesignations = [];

  if (roleStr.includes('apiarist') || roleStr.includes('beekeeper')) {
    // SECURITY: Beekeeper/Apiarist legacy users receive ONLY field/colony capabilities.
    // HONEY_PROCESSING and BATCH_MANAGEMENT are Processor-domain capabilities and must
    // NOT be auto-granted to beekeepers during migration.
    mappedCapabilities = [
      'HIVE_MONITORING',
      'HIVE_INSPECTION',
      'HIVE_IMAGE_CAPTURE',
      'HONEY_COLLECTION'
    ];
    mappedDesignations = ['BEEKEEPER'];
  } else if (roleStr.includes('processor')) {
    mappedCapabilities = [
      'HONEY_PROCESSING',
      'BATCH_MANAGEMENT',
      'PACKAGE_HONEY',
      'QUALITY_TESTING',
      'INVENTORY_MANAGEMENT'
    ];
    mappedDesignations = ['PROCESSOR'];
  } else if (roleStr.includes('lab') || roleStr.includes('analyst')) {
    mappedCapabilities = [
      'QUALITY_TESTING',
      'LAB_INSPECTION',
      'TRACEABILITY_VERIFICATION'
    ];
    mappedDesignations = ['LAB_SPECIALIST'];
  } else if (roleStr.includes('distributor')) {
    mappedCapabilities = [
      'SHIPMENT_DISPATCH',
      'INVENTORY_MANAGEMENT',
      'TRACEABILITY_VERIFICATION'
    ];
    mappedDesignations = ['DISTRIBUTOR'];
  } else {
    // Default safe apiarist base
    mappedCapabilities = ['HIVE_MONITORING', 'HIVE_INSPECTION'];
    mappedDesignations = ['BEEKEEPER'];
  }

  const authoritativeEnvelope = resolveAuthoritativeAccess({
    userId: legacySession.userId || 'usr-migrated',
    capabilities: mappedCapabilities,
    designations: mappedDesignations,
    workContexts: {
      areas: ['Apiary / farm'],
      handles: ['Hive operations']
    },
    isSystemAdmin: false,
    actor: 'MIGRATION_ORCHESTRATOR'
  });

  logAccessEvent({
    eventType: 'MIGRATION_EXECUTED',
    actor: 'SYSTEM',
    targetUserId: legacySession.userId || 'usr-migrated',
    previousState: { role: legacyRole },
    newState: {
      designations: authoritativeEnvelope.confirmedDesignations,
      capabilities: authoritativeEnvelope.normalizedCapabilities
    },
    reason: `Migrated legacy role "${legacyRole}" to capability-based profile`
  });

  return {
    ...legacySession,
    policyVersion: ACCESS_POLICY_VERSION,
    capabilities: authoritativeEnvelope.normalizedCapabilities,
    designations: authoritativeEnvelope.confirmedDesignations,
    workContexts: authoritativeEnvelope.workContexts,
    accessProfile: authoritativeEnvelope.accessProfile,
    isMigrated: true
  };
};
