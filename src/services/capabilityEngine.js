/**
 * HoneyChain Enterprise Capability Engine Gateway
 *
 * Facade aggregating:
 * - Capability Taxonomy & Normalization
 * - Designation Eligibility Reasoning
 * - Module & Action-Level Permissions
 * - Authoritative Backend Resolution & Audit
 * - Dashboard Priority Engine
 */

export * from './capabilityTaxonomy.js';
export * from './designationEngine.js';
export * from './permissionEngine.js';
export * from './authoritativeAccessService.js';
export * from './dashboardPriorityEngine.js';
// The legacy taxonomy still powers a few presentation-only onboarding cards and
// exports CAPABILITY_MAP.  Do not star-export the canonical registry here: two
// competing CAPABILITY_MAP exports make the public facade ambiguous at build
// time.  Canonical consumers import the registry directly (or these explicit
// aliases) while legacy UI can migrate independently.
export {
  CapabilityRegistry,
  CAPABILITY_CATALOG as CANONICAL_CAPABILITY_CATALOG,
  CAPABILITY_MAP as CANONICAL_CAPABILITY_MAP,
  CAPABILITY_GRAPH,
  CAPABILITY_DEPENDENCIES
} from './capabilityRegistry.js';
export * from './capabilityMigration.js';
export * from './onboardingIntelligenceService.js';

import {
  CAPABILITY_TAXONOMY,
  normalizeCapabilityList,
  searchCapabilities
} from './capabilityTaxonomy.js';
import {
  DESIGNATION_TAXONOMY,
  evaluateDesignationEligibility
} from './designationEngine.js';
import {
  WORKSPACE_MODULE_REGISTRY,
  resolvePermissionsAndModules,
  canPerformAction,
  ACTION_PERMISSIONS
} from './permissionEngine.js';
import {
  resolveAuthoritativeAccess,
  ACCESS_POLICY_VERSION,
  logAccessEvent,
  revalidateUserAccess,
  migrateLegacyRole
} from './authoritativeAccessService.js';
import {
  resolveDashboardLayout
} from './dashboardPriorityEngine.js';

// Aliases for unified backward-compatibility
export const CAPABILITIES = CAPABILITY_TAXONOMY;
export const DESIGNATIONS = DESIGNATION_TAXONOMY;
export const WORKSPACE_MODULES = WORKSPACE_MODULE_REGISTRY;

export const WORK_AREAS_OPTIONS = [
  'Apiary / farm',
  'Processing facility',
  'Laboratory',
  'Warehouse',
  'Distribution',
  'Multiple locations'
];

export const WORK_HANDLES_OPTIONS = [
  'Hive operations',
  'Honey batches',
  'Quality & purity',
  'Packaging & bottling',
  'Distribution & logistics',
  'Records & compliance'
];

export const INITIAL_WORK_DESCRIPTIONS = [
  'Beekeeping',
  'Honey processing',
  'Quality / laboratory',
  'Distribution',
  'Farm / apiary management',
  'Collection',
  'Packaging',
  'Inspection',
  'Other'
];

/**
 * High-level capability evaluation facade.
 */
export const evaluateCapabilities = (rawCapabilities = []) => {
  const result = evaluateDesignationEligibility(rawCapabilities);
  return {
    contextMessage: result.contextMessage,
    suggestedDesignations: result.strongMatches.length > 0 ? result.strongMatches : result.eligibleDesignations,
    suggestedDesignationIds: result.suggestedDesignationIds,
    evaluations: result.evaluations,
    conflicts: result.detectedConflicts,
    normalizedCapabilities: result.normalizedCapabilities
  };
};

/**
 * High-level access profile resolution facade.
 */
export const resolveAccessProfile = ({
  capabilities = [],
  designations = [],
  workContexts = { areas: [], handles: [] },
  isSystemAdmin = false
} = {}) => {
  const authoritative = resolveAuthoritativeAccess({
    capabilities,
    designations,
    workContexts,
    isSystemAdmin
  });

  return {
    capabilities: authoritative.normalizedCapabilities,
    designations: authoritative.confirmedDesignations,
    workContexts: authoritative.workContexts,
    moduleIds: authoritative.accessProfile.moduleIds,
    resolvedModules: authoritative.accessProfile.resolvedModules,
    groupedModules: authoritative.accessProfile.groupedModules,
    permissionIds: authoritative.accessProfile.permissionIds,
    moduleJustifications: authoritative.accessProfile.moduleJustifications,
    policyVersion: authoritative.policyVersion,
    isSystemAdmin: authoritative.accessProfile.isSystemAdmin,
    resolvedAt: authoritative.resolvedAt
  };
};

/**
 * Backend Authoritative Validator facade.
 */
export const validateAndResolveProfile = (payload = {}) => {
  return resolveAccessProfile(payload);
};
