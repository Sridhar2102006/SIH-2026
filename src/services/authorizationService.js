/**
 * HoneyChain Authoritative Authorization Service
 *
 * Server-authoritative permission and access boundary enforcement.
 * Replaces static role-based UI checks with granular capability & permission evaluation.
 *
 * Core rule: Frontend hide/show is presentation only.
 * Every sensitive operation must be verified with AuthorizationService.can().
 */

import { CapabilityRegistry } from './capabilityRegistry.js';
import { logAccessEvent } from './authoritativeAccessService.js';

// Pre-compiled capability permissions lookup
const CAPABILITY_PERMISSIONS_CACHE = new Map();

/**
 * Derives effective permissions directly from an array of validated capability IDs.
 * Does NOT rely on untrusted client role strings.
 */
export function getEffectivePermissions(capabilities = []) {
  const permSet = new Set();
  const validCaps = CapabilityRegistry.resolveImpliedCapabilities(capabilities);

  for (const capId of validCaps) {
    let perms = CAPABILITY_PERMISSIONS_CACHE.get(capId);
    if (!perms) {
      perms = CapabilityRegistry.getPermissionsForCapability(capId);
      CAPABILITY_PERMISSIONS_CACHE.set(capId, perms);
    }
    for (const p of perms) {
      permSet.add(p);
    }
  }

  return Array.from(permSet);
}

/**
 * Derives effective capabilities resolving all graph dependencies.
 */
export function getEffectiveCapabilities(capabilities = []) {
  return CapabilityRegistry.resolveImpliedCapabilities(capabilities);
}

/**
 * Resource-Level Authorization & IDOR Guard
 * Verifies that the user has tenant/ownership rights over the target resource.
 *
 * @param {Object} userOrProfile - Current authenticated user / capability envelope
 * @param {string} permissionId - Required action permission
 * @param {Object} resource - Target resource (e.g. Hive, Batch, Sample, Shipment)
 * @param {string} workspaceId - Authorized workspace / organization context
 * @returns {boolean} Whether access is permitted
 */
export function checkResourceScope(userOrProfile, permissionId, resource, workspaceId) {
  if (!resource) return true; // General action without specific entity

  const userId = userOrProfile?.userId || userOrProfile?.id || 'usr-current';
  const userOrg = userOrProfile?.organizationId || userOrProfile?.apiaryId || 'default-org';
  const targetWorkspace = workspaceId || userOrProfile?.workspaceId || 'ws-default';

  // Cross-workspace isolation
  if (resource.workspaceId && resource.workspaceId !== targetWorkspace) {
    console.warn(`[SECURITY] IDOR blocked: Resource workspace '${resource.workspaceId}' mismatch with '${targetWorkspace}'`);
    return false;
  }

  // Cross-organization isolation
  if (resource.organizationId && resource.organizationId !== userOrg) {
    console.warn(`[SECURITY] IDOR blocked: Resource org '${resource.organizationId}' mismatch with '${userOrg}'`);
    return false;
  }

  // Ownership scope for Beekeeper hive modifications
  if (permissionId.startsWith('HIVE_') && resource.apiaryId && resource.apiaryId !== userOrg) {
    return false;
  }

  // Facility scope for Processing
  if (permissionId.startsWith('PROCESSING_') && resource.facilityId && userOrProfile.facilityId && resource.facilityId !== userOrProfile.facilityId) {
    return false;
  }

  // Lab assigned sample scope
  if (permissionId.startsWith('TEST_') && resource.assignedLabId && userOrProfile.labId && resource.assignedLabId !== userOrProfile.labId) {
    return false;
  }

  // Dispatch/Shipment scope
  if (permissionId.startsWith('SHIPMENT_') && resource.distributorId && userOrProfile.distributorId && resource.distributorId !== userOrProfile.distributorId) {
    return false;
  }

  return true;
}

export const AuthorizationService = {
  /**
   * Primary authorization check.
   * can(userOrProfile, permissionId, resource, workspaceId)
   */
  can(userOrProfile, permissionId, resource = null, workspaceId = null) {
    if (!userOrProfile || !permissionId) return false;

    // Admin override if explicitly flagged in authoritative profile
    if (userOrProfile.isSystemAdmin || userOrProfile.accessProfile?.isSystemAdmin) {
      return true;
    }

    // Extract capabilities from user or session object
    const rawCaps = Array.isArray(userOrProfile)
      ? userOrProfile
      : (userOrProfile.capabilities || userOrProfile.effectiveCapabilities || []);

    const effectivePerms = getEffectivePermissions(rawCaps);
    const hasPermission = effectivePerms.includes(permissionId);

    if (!hasPermission) {
      return false;
    }

    // Evaluate resource-level ownership / tenant boundaries
    return checkResourceScope(userOrProfile, permissionId, resource, workspaceId);
  },

  /**
   * canAny(userOrProfile, permissionIds, resource, workspaceId)
   */
  canAny(userOrProfile, permissionIds = [], resource = null, workspaceId = null) {
    if (!permissionIds || permissionIds.length === 0) return true;
    return permissionIds.some(perm => this.can(userOrProfile, perm, resource, workspaceId));
  },

  /**
   * canAll(userOrProfile, permissionIds, resource, workspaceId)
   */
  canAll(userOrProfile, permissionIds = [], resource = null, workspaceId = null) {
    if (!permissionIds || permissionIds.length === 0) return true;
    return permissionIds.every(perm => this.can(userOrProfile, perm, resource, workspaceId));
  },

  /**
   * Retrieves effective permissions list.
   */
  getEffectivePermissions(userOrProfile) {
    const rawCaps = Array.isArray(userOrProfile)
      ? userOrProfile
      : (userOrProfile?.capabilities || userOrProfile?.effectiveCapabilities || []);
    return getEffectivePermissions(rawCaps);
  },

  /**
   * Retrieves effective capabilities list.
   */
  getEffectiveCapabilities(userOrProfile) {
    const rawCaps = Array.isArray(userOrProfile)
      ? userOrProfile
      : (userOrProfile?.capabilities || userOrProfile?.effectiveCapabilities || []);
    return getEffectiveCapabilities(rawCaps);
  },

  /**
   * Checks whether user can access a specific feature or tool.
   */
  canAccessFeature(userOrProfile, featureId) {
    const feature = CapabilityRegistry.getAllCapabilities(); // fallback or check feature catalog
    const effectiveCaps = this.getEffectiveCapabilities(userOrProfile);
    // Find if feature's required capability is in effective capabilities
    const feat = CapabilityRegistry.getFeaturesForCapability ? null : null;
    return effectiveCaps.includes(featureId);
  }
};
