import { CAPABILITY_MAP } from './capabilityRegistry.js';

export const LEGACY_CAPABILITY_MIGRATION = [
  { oldId: 'HIVE_MONITORING', canonicalCapabilityIds: ['HIVE_MANAGEMENT'], status: 'REPLACED', reason: 'The canonical field capability covers hive records, identity, and history; telemetry-specific access remains a distinct capability.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/authoritativeAccessService.js', 'src/services/permissionEngine.js', 'src/services/routeRegistry.js', 'src/services/startupRouter.js', 'src/services/dashboardCompositionEngine.js', 'src/App.jsx', 'src/context/AppStateContext.jsx'] },
  { oldId: 'HIVE_INSPECTION', canonicalCapabilityIds: ['HIVE_INSPECTION'], status: 'EXACT', reason: 'The canonical registry contains the same inspection capability.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/authoritativeAccessService.js', 'src/services/permissionEngine.js', 'src/services/routeRegistry.js'] },
  { oldId: 'HIVE_IMAGE_CAPTURE', canonicalCapabilityIds: ['HIVE_IMAGE_CAPTURE'], status: 'EXACT', reason: 'A canonical hive-image capability now preserves the legacy image-capture scope.', filesUsingOldId: ['src/services/capabilityTaxonomy.js'] },
  { oldId: 'SENSOR_MONITORING', canonicalCapabilityIds: ['CONNECTED_HIVE_MONITORING'], status: 'REPLACED', reason: 'The canonical field registry names the connected-hive monitoring capability explicitly.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/permissionEngine.js', 'src/services/dashboardCompositionEngine.js'] },
  { oldId: 'HONEY_COLLECTION', canonicalCapabilityIds: ['HONEY_COLLECTION'], status: 'EXACT', reason: 'The canonical registry contains the same collection capability.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/onboardingEngine.js', 'src/services/routeRegistry.js', 'src/services/workspaceNavigationComposer.js'] },
  { oldId: 'HONEY_PROCESSING', canonicalCapabilityIds: ['PROCESSING_MANAGEMENT', 'BATCH_INTAKE', 'PROCESSING_STEP_RECORD'], status: 'SPLIT', reason: 'The legacy umbrella covered the operational processing workspace: intake, processing management and step recording. These targets are recorded as an explicit migration split so old sessions retain their documented workspace scope without a route/module mismatch.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/authoritativeAccessService.js', 'src/services/permissionEngine.js', 'src/services/routeRegistry.js', 'src/services/dashboardCompositionEngine.js'] },
  { oldId: 'BATCH_MANAGEMENT', canonicalCapabilityIds: [], status: 'UNRESOLVED', reason: 'The legacy umbrella spans intake, processing, and traceability; selecting one canonical capability would silently narrow or broaden access.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/authoritativeAccessService.js', 'src/services/permissionEngine.js', 'src/services/dashboardCompositionEngine.js'] },
  { oldId: 'QUALITY_TESTING', canonicalCapabilityIds: ['QUALITY_TESTING'], status: 'EXACT', reason: 'The canonical quality-check capability preserves the legacy testing scope.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/authoritativeAccessService.js', 'src/services/permissionEngine.js', 'src/services/dashboardCompositionEngine.js'] },
  { oldId: 'LAB_INSPECTION', canonicalCapabilityIds: ['LAB_INSPECTION'], status: 'EXACT', reason: 'The canonical laboratory inspection capability retains the original scope and adds an explicit verification requirement.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/authoritativeAccessService.js', 'src/services/permissionEngine.js'] },
  { oldId: 'TRACEABILITY_VERIFICATION', canonicalCapabilityIds: ['TRACEABILITY_VERIFICATION'], status: 'EXACT', reason: 'The canonical verification capability preserves cryptographic provenance verification, distinct from lineage viewing.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/authoritativeAccessService.js'] },
  { oldId: 'INVENTORY_MANAGEMENT', canonicalCapabilityIds: ['INVENTORY_MANAGEMENT'], status: 'EXACT', reason: 'The canonical inventory management capability preserves the legacy operational scope.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/authoritativeAccessService.js', 'src/services/permissionEngine.js', 'src/services/dashboardCompositionEngine.js'] },
  { oldId: 'PACKAGE_HONEY', canonicalCapabilityIds: ['PACKAGE_HONEY'], status: 'EXACT', reason: 'The canonical packaging capability preserves the legacy packaging scope.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/authoritativeAccessService.js', 'src/services/permissionEngine.js', 'src/services/dashboardCompositionEngine.js'] },
  { oldId: 'SHIPMENT_DISPATCH', canonicalCapabilityIds: ['DISPATCH_PLANNING'], status: 'REPLACED', reason: 'The canonical dispatch-planning capability covers planning; shipment execution remains separately modeled.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/authoritativeAccessService.js', 'src/services/permissionEngine.js', 'src/services/dashboardCompositionEngine.js'] },
  { oldId: 'TEAM_SUPERVISION', canonicalCapabilityIds: ['TEAM_SUPERVISION'], status: 'EXACT', reason: 'The canonical supervision capability preserves the legacy team-coordination scope.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/authoritativeAccessService.js'] },
  { oldId: 'RECORD_AUDITING', canonicalCapabilityIds: ['RECORD_AUDITING'], status: 'EXACT', reason: 'The canonical auditing capability preserves the legacy scope and requires verification.', filesUsingOldId: ['src/services/capabilityTaxonomy.js', 'src/services/authoritativeAccessService.js'] }
];

export const migrateLegacyCapability = oldId => {
  const entry = LEGACY_CAPABILITY_MIGRATION.find(item => item.oldId === oldId);
  if (!entry) return { oldId, canonicalCapabilityIds: [], status: 'UNRESOLVED', reason: 'No migration record exists.' };
  const missingTargets = entry.canonicalCapabilityIds.filter(id => !CAPABILITY_MAP.has(id));
  if (missingTargets.length > 0) {
    return { ...entry, canonicalCapabilityIds: [], status: 'UNRESOLVED', reason: `Canonical target is missing: ${missingTargets.join(', ')}.` };
  }
  return { ...entry, canonicalCapabilityIds: entry.canonicalCapabilityIds.slice() };
};

export const migrateLegacyCapabilities = legacyIds => {
  const migrations = legacyIds.map(migrateLegacyCapability);
  return {
    capabilities: Array.from(new Set(migrations.flatMap(entry => entry.canonicalCapabilityIds))),
    unresolved: migrations.filter(entry => entry.status === 'UNRESOLVED'),
    migrations
  };
};
