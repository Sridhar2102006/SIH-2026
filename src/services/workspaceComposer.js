/**
 * HoneyChain Master Workspace Composer
 *
 * Implements the core architectural pipeline:
 * User -> Onboarding Signals -> Capability Inference -> Capability Confirmation ->
 * Designation Suggestions -> Capability Profile -> Permission Resolution ->
 * Workspace Composition:
 *   ├── Dashboard (Data-Aware, Contextual Attention, Smart Insights)
 *   ├── Navigation (Dynamic 4-5 items composed from capabilities + urgency)
 *   ├── Features & Tools (Granular authority)
 *   ├── Quick Actions (Prioritized 3-5 actions)
 *   ├── Data Scope & Boundary Protection
 *   ├── Visual Identity (20 Curated Deterministic Palettes)
 *   └── Workflow
 */

import { CapabilityRegistry } from './capabilityRegistry.js';
import { AuthorizationService, getEffectivePermissions, getEffectiveCapabilities } from './authorizationService.js';
import { WorkspaceVisualIdentityService, resolveVisualProfile } from './workspaceVisualIdentityService.js';
import { WorkspaceNavigationComposer, composeNavigation } from './workspaceNavigationComposer.js';
import { composeDashboard } from './dashboardCompositionEngine.js';
import { resolveCanonicalPermissionsAndModules } from './permissionEngine.js';

export const WORKSPACE_VERSION = 12;

/**
 * Capability Signature Service (§ 51)
 * Computes canonical sorted capability signature string and hash.
 */
export const CapabilitySignatureService = {
  getSignature(capabilities = []) {
    return Array.from(new Set(capabilities || [])).sort().join('|');
  },

  getSignatureHash(capabilities = []) {
    const sig = this.getSignature(capabilities);
    return WorkspaceVisualIdentityService.hashString(sig);
  }
};

/**
 * Composes the complete personalized application workspace.
 *
 * @param {Object} params
 * @param {Object} params.user - User session / credentials
 * @param {Array<string>} params.capabilities - Declared or inferred capability IDs
 * @param {Array<string>} params.designations - Confirmed designations
 * @param {Object} params.operationalData - Real entities (hives, batches, samples, shipments)
 * @param {Object} params.workflowState - Active work state (in-progress inspections, offline sync)
 * @returns {Object} Complete unified workspace envelope
 */
export function composeWorkspace({
  user = {},
  capabilities = [],
  designations = [],
  operationalData = {},
  workflowState = {}
}) {
  const userId = user.userId || user.id || 'usr-current';
  const workspaceId = user.workspaceId || 'ws-default';

  // 1. Resolve Effective Capabilities through the Capability Graph
  const effectiveCapabilities = getEffectiveCapabilities(capabilities);

  // 2. Resolve Server-Authoritative Effective Permissions
  const effectivePermissions = getEffectivePermissions(effectiveCapabilities);

  // 3. Compute Stable Capability Signature
  const capabilitySignature = CapabilitySignatureService.getSignature(effectiveCapabilities);
  const signatureHash = CapabilitySignatureService.getSignatureHash(effectiveCapabilities);

  // 4. Primary Designation Resolution
  const primaryDesignation = user.activeDesignation || designations[0] || (
    effectiveCapabilities.includes('LAB_WORKSPACE') ? 'LAB_SPECIALIST' :
    effectiveCapabilities.includes('DISPATCH_PLANNING') ? 'DISTRIBUTOR' :
    effectiveCapabilities.includes('PROCESSING_MANAGEMENT') ? 'PROCESSOR' :
    'BEEKEEPER'
  );

  // 5. Compose Dynamic Navigation (§ 19, § 20)
  const navigation = composeNavigation(effectiveCapabilities, primaryDesignation, operationalData);

  // 6. Resolve Deterministic Visual Profile from 20 Curated Palettes (§ 21, § 22, § 23)
  const visualProfile = resolveVisualProfile(effectiveCapabilities, primaryDesignation);

  // 7. Compose Data-Aware Dynamic Dashboard (§ 16, § 17, § 18)
  const accessProfile = user.accessProfile || {
    capabilities: effectiveCapabilities,
    designations: designations.length > 0 ? designations : [primaryDesignation],
    permissionIds: effectivePermissions
  };

  const dashboard = composeDashboard({
    session: { ...user, capabilities: effectiveCapabilities, designations },
    accessProfile,
    hives: operationalData.hives || [],
    batches: operationalData.batches || [],
    qualityChecks: operationalData.qualityChecks || [],
    collections: operationalData.collections || [],
    devices: operationalData.devices || [],
    activities: operationalData.activities || []
  });

  // 8. Generate Prioritized Contextual Quick Actions (Strict limit: 3-5 items, § 43)
  const quickActions = (dashboard.quickActions || []).slice(0, 5);

  // 9. Derive Smart Insights strictly from authorized operational data (§ 26)
  const insights = (dashboard.insights || []);

  // 10. Construct Final Cohesive Workspace Envelope (§ 35)
  return {
    primaryDesignation,
    workspace: {
      id: workspaceId,
      version: WORKSPACE_VERSION,
      primaryDesignation,
      designations: designations.length > 0 ? designations : [primaryDesignation],
      signature: capabilitySignature,
      signatureHash,
      createdAt: user.createdAt || new Date().toISOString()
    },
    capabilities: effectiveCapabilities,
    permissions: effectivePermissions,
    navigation,
    dashboard: {
      categories: dashboard.categories || [],
      modules: dashboard.modules || [],
      quickActions,
      insights,
      attentionItems: dashboard.attentionItems || [],
      stats: dashboard.stats || {}
    },
    visualProfile
  };
}

export function composeConfirmedWorkspace({
  user = {},
  profile,
  operationalData = {},
  workflowState = {}
} = {}) {
  if (!profile || !Array.isArray(profile.confirmedCapabilities)) {
    return composeWorkspace({ user, capabilities: [], designations: [], operationalData, workflowState });
  }

  const access = resolveCanonicalPermissionsAndModules({
    confirmedCapabilities: profile.confirmedCapabilities,
    verifiedCapabilities: profile.verifiedCapabilities || []
  });
  const authorizedUser = {
    ...user,
    userId: profile.userId || user.userId || user.id,
    workspaceId: profile.workspaceId || user.workspaceId,
    capabilities: access.effectiveCapabilities,
    designations: profile.confirmedDesignations || [],
    accessProfile: access
  };

  return {
    ...composeWorkspace({
      user: authorizedUser,
      capabilities: access.effectiveCapabilities,
      designations: profile.confirmedDesignations || [],
      operationalData,
      workflowState
    }),
    authorizedModules: access.moduleIds,
    verificationPending: access.verificationPending
  };
}

export const WorkspaceComposer = {
  composeWorkspace,
  composeConfirmedWorkspace,
  CapabilitySignatureService
};
