import assert from 'node:assert/strict';
import {
  CAPABILITY_CATALOG,
  CAPABILITY_DEPENDENCIES,
  CAPABILITY_MAP,
  CapabilityRegistry,
  FEATURE_CATALOG
} from '../src/services/capabilityRegistry.js';
import {
  LEGACY_CAPABILITY_MIGRATION,
  migrateLegacyCapabilities
} from '../src/services/capabilityMigration.js';

assert.equal(CAPABILITY_MAP.size, CAPABILITY_CATALOG.length, 'canonical capability IDs are unique');
assert.equal(CAPABILITY_MAP.get('BATCH_TRACEABILITY').domains.length, 2, 'duplicate traceability definitions combine into one cross-domain capability');
assert.ok(CAPABILITY_CATALOG.every(capability =>
  ['id', 'name', 'description', 'domain', 'category', 'riskLevel', 'verificationRequired', 'prerequisites', 'implies', 'conflicts', 'relatedCapabilities', 'featureIds', 'permissionIds', 'designationEligibility', 'evidenceRequirements', 'questionSignals'].every(key => key in capability)
), 'canonical entries expose the required metadata contract');

for (const capability of CAPABILITY_CATALOG) {
  for (const featureId of capability.featureIds) {
    assert.ok(FEATURE_CATALOG.some(feature => feature.id === featureId), `${capability.id} references registered feature ${featureId}`);
  }
  for (const prerequisite of CAPABILITY_DEPENDENCIES[capability.id] || []) {
    assert.ok(CAPABILITY_MAP.has(prerequisite), `${capability.id} prerequisite ${prerequisite} exists`);
  }
}

const resolved = CapabilityRegistry.resolveCapabilityDependencies(['BEE_HEALTH_SCAN']);
assert.deepEqual(resolved.resolved, ['BEE_HEALTH_SCAN', 'HIVE_INSPECTION', 'HIVE_MANAGEMENT']);
assert.deepEqual(resolved.dependencies, ['HIVE_INSPECTION', 'HIVE_MANAGEMENT']);
assert.deepEqual(resolved.unknown, []);

const crossDomain = CapabilityRegistry.getCapability('BATCH_TRACEABILITY');
assert.ok(crossDomain.domains.includes('PROCESSOR'));
assert.ok(crossDomain.domains.includes('DISTRIBUTOR'));

const migrations = migrateLegacyCapabilities(['HIVE_INSPECTION', 'BATCH_MANAGEMENT', 'UNKNOWN_OLD_ID']);
assert.deepEqual(migrations.capabilities, ['HIVE_INSPECTION']);
assert.equal(migrations.unresolved.length, 2, 'uncertain or missing legacy mappings fail closed');
assert.equal(LEGACY_CAPABILITY_MIGRATION.length, 15, 'each legacy taxonomy capability has a migration record');

console.log('Canonical capability foundation tests passed.');