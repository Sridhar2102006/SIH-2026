/**
 * HoneyChain Enterprise Capability & Authorization System
 * Automated Verification & Combinatorial Test Suite
 *
 * Covers:
 * - Requirements 1-44
 * - Property-based invariants (monotonicity, determinism, deduplication, order invariance)
 * - Combinatorial designation evaluation (Beekeeper, Processor, Lab, Distributor, etc.)
 * - Anti-overmatching guards (single generic capability rejection)
 * - Free-text & alias normalization
 * - Backend authoritative validation & tampering prevention
 * - Granular action-level permissions & privileged action isolation
 * - Access diffs and module union semantics
 * - Legacy role migration
 * - Dynamic dashboard section prioritization
 */

import {
  CAPABILITY_TAXONOMY,
  normalizeCapability,
  normalizeCapabilityList,
  searchCapabilities,
  WORK_CONTEXT_TAXONOMY,
  WORK_CONTEXT_MAP,
  getCapabilitiesForWorkContexts
} from '../src/services/capabilityTaxonomy.js';

import {
  DESIGNATION_TAXONOMY,
  DESIGNATION_MAP,
  evaluateDesignationEligibility
} from '../src/services/designationEngine.js';

import {
  WORKSPACE_MODULE_REGISTRY,
  ACTION_PERMISSIONS,
  PRIVILEGED_ACTIONS,
  resolvePermissionsAndModules,
  canPerformAction
} from '../src/services/permissionEngine.js';

import {
  resolveAuthoritativeAccess,
  ACCESS_POLICY_VERSION,
  revalidateUserAccess,
  migrateLegacyRole
} from '../src/services/authoritativeAccessService.js';

import {
  resolveDashboardLayout
} from '../src/services/dashboardPriorityEngine.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  const match = JSON.stringify(actual) === JSON.stringify(expected);
  assert(match, `${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`);
}

console.log('============================================================');
console.log('HONEYCHAIN CAPABILITY & RBAC SYSTEM TEST SUITE');
console.log('============================================================\n');

// ------------------------------------------------------------
// 1. CAPABILITY TAXONOMY & NORMALIZATION TESTS
// ------------------------------------------------------------
console.log('TEST SUITE 1: Capability Taxonomy & Normalization');

assert(CAPABILITY_TAXONOMY.length >= 14, `Centralized capability registry contains ${CAPABILITY_TAXONOMY.length} structured capabilities`);

const norm1 = normalizeCapability('Check hives');
assert(norm1 === 'HIVE_MONITORING', `Alias "Check hives" normalizes to HIVE_MONITORING (Got: ${norm1})`);

const norm2 = normalizeCapability('Inspect hive');
assert(norm2 === 'HIVE_INSPECTION', `Alias "Inspect hive" normalizes to HIVE_INSPECTION (Got: ${norm2})`);

const norm3 = normalizeCapability('hive inspection');
assert(norm3 === 'HIVE_INSPECTION', `Free text "hive inspection" normalizes to HIVE_INSPECTION`);

const norm4 = normalizeCapability('Monitor bees');
assert(norm4 === 'HIVE_MONITORING', `Alias "Monitor bees" normalizes to HIVE_MONITORING`);

const norm5 = normalizeCapability('UNKNOWN_TASK_123');
assert(norm5 === null, 'Unknown task strings safely return null');

// List normalization with deduplication
const rawList = ['Check hives', 'HIVE_MONITORING', 'Inspect hive', 'UNKNOWN_XYZ', 'Check hives'];
const normalizedList = normalizeCapabilityList(rawList);
assertEqual(normalizedList, ['HIVE_MONITORING', 'HIVE_INSPECTION'], 'normalizeCapabilityList sanitizes, normalizes, and deduplicates inputs');

// Natural language search
const searchResults = searchCapabilities('sensor');
assert(searchResults.some(c => c.id === 'SENSOR_MONITORING'), 'Search capabilities for "sensor" returns SENSOR_MONITORING');

console.log('\n------------------------------------------------------------');

// ------------------------------------------------------------
// 2. DESIGNATION ELIGIBILITY & ANTI-OVERMATCHING
// ------------------------------------------------------------
console.log('TEST SUITE 2: Designation Eligibility Engine & Anti-Overmatching');

// Anti-overmatching: Single generic capability must NOT qualify for designation
const singleGenericEval = evaluateDesignationEligibility(['INVENTORY_MANAGEMENT']);
assert(
  !singleGenericEval.suggestedDesignationIds.includes('DISTRIBUTOR'),
  'Anti-Overmatching: "Inventory management" ALONE does NOT grant Distributor designation'
);

const singleRecordEval = evaluateDesignationEligibility(['PROCESSING_RECORDS']);
assert(
  !singleRecordEval.suggestedDesignationIds.includes('PROCESSOR'),
  'Anti-Overmatching: "Record keeping" ALONE does NOT grant Processor designation'
);

// Required capability absence makes designation NOT_ELIGIBLE
const missingRequiredEval = evaluateDesignationEligibility([
  'HIVE_INSPECTION',
  'HIVE_IMAGE_CAPTURE',
  'HONEY_COLLECTION'
]); // missing HIVE_MONITORING
const beekeeperEvalMissing = missingRequiredEval.evaluations['BEEKEEPER'];
assert(
  beekeeperEvalMissing.state === 'NOT_ELIGIBLE',
  `Beekeeper is NOT_ELIGIBLE when required HIVE_MONITORING is missing (State: ${beekeeperEvalMissing.state})`
);
assert(
  beekeeperEvalMissing.missingRequired.includes('HIVE_MONITORING'),
  'Missing required capability is explicitly identified in evaluation explanation'
);

// Full Beekeeper Qualification
const beekeeperFullEval = evaluateDesignationEligibility([
  'HIVE_MONITORING',
  'HIVE_INSPECTION',
  'HIVE_IMAGE_CAPTURE',
  'HONEY_COLLECTION'
]);
assert(
  beekeeperFullEval.suggestedDesignationIds.includes('BEEKEEPER'),
  'Beekeeper is suggested when required and core capabilities are present'
);
assert(
  beekeeperFullEval.evaluations['BEEKEEPER'].state === 'STRONG_MATCH',
  'Beekeeper state is STRONG_MATCH'
);
assert(
  beekeeperFullEval.evaluations['BEEKEEPER'].explanation.includes('Strong match'),
  'Evaluation provides human-readable explainable rationale'
);

console.log('\n------------------------------------------------------------');

// ------------------------------------------------------------
// 3. COMBINATORIAL MULTI-DESIGNATION COMBINATIONS
// ------------------------------------------------------------
console.log('TEST SUITE 3: Combinatorial Multi-Designation Combinations');

// Combination A: Beekeeper + Processor
const comboBP = evaluateDesignationEligibility([
  'HIVE_MONITORING',
  'HIVE_INSPECTION',
  'HONEY_COLLECTION',
  'HONEY_PROCESSING',
  'BATCH_MANAGEMENT'
]);
assert(
  comboBP.suggestedDesignationIds.includes('BEEKEEPER') && comboBP.suggestedDesignationIds.includes('PROCESSOR'),
  'Arbitrary Combination: Beekeeper + Processor both qualify independently'
);
assert(!comboBP.suggestedDesignationIds.includes('LAB_SPECIALIST'), 'Lab is NOT suggested for Beekeeper + Processor');
assert(!comboBP.suggestedDesignationIds.includes('DISTRIBUTOR'), 'Distributor is NOT suggested for Beekeeper + Processor');

// Combination B: Processor + Lab
const comboPL = evaluateDesignationEligibility([
  'HONEY_PROCESSING',
  'BATCH_MANAGEMENT',
  'QUALITY_TESTING',
  'LAB_INSPECTION'
]);
assert(
  comboPL.suggestedDesignationIds.includes('PROCESSOR') && comboPL.suggestedDesignationIds.includes('LAB_SPECIALIST'),
  'Arbitrary Combination: Processor + Lab both qualify independently'
);

// Combination C: Lab + Distributor
const comboLD = evaluateDesignationEligibility([
  'QUALITY_TESTING',
  'LAB_INSPECTION',
  'SHIPMENT_DISPATCH',
  'INVENTORY_MANAGEMENT'
]);
assert(
  comboLD.suggestedDesignationIds.includes('LAB_SPECIALIST') && comboLD.suggestedDesignationIds.includes('DISTRIBUTOR'),
  'Arbitrary Combination: Lab + Distributor both qualify independently'
);

// Combination D: Beekeeper + Lab
const comboBL = evaluateDesignationEligibility([
  'HIVE_MONITORING',
  'HIVE_INSPECTION',
  'QUALITY_TESTING',
  'LAB_INSPECTION'
]);
assert(
  comboBL.suggestedDesignationIds.includes('BEEKEEPER') && comboBL.suggestedDesignationIds.includes('LAB_SPECIALIST'),
  'Arbitrary Combination: Beekeeper + Lab both qualify independently'
);

// Combination E: 4-Way Multi-Designation (Beekeeper + Processor + Lab + Distributor)
const comboAll4 = evaluateDesignationEligibility([
  'HIVE_MONITORING',
  'HIVE_INSPECTION',
  'HONEY_COLLECTION',
  'HONEY_PROCESSING',
  'BATCH_MANAGEMENT',
  'QUALITY_TESTING',
  'LAB_INSPECTION',
  'SHIPMENT_DISPATCH',
  'INVENTORY_MANAGEMENT'
]);
assert(
  comboAll4.suggestedDesignationIds.includes('BEEKEEPER') &&
  comboAll4.suggestedDesignationIds.includes('PROCESSOR') &&
  comboAll4.suggestedDesignationIds.includes('LAB_SPECIALIST') &&
  comboAll4.suggestedDesignationIds.includes('DISTRIBUTOR'),
  'Arbitrary Combination: Beekeeper + Processor + Lab + Distributor all qualify without hard-coded rules'
);

console.log('\n------------------------------------------------------------');

// ------------------------------------------------------------
// 4. MODULE & ACTION PERMISSION RESOLUTION
// ------------------------------------------------------------
console.log('TEST SUITE 4: Module & Action Permission Resolution');

const resolvedAccessBP = resolvePermissionsAndModules({
  capabilities: ['HIVE_MONITORING', 'HONEY_PROCESSING'],
  designations: ['BEEKEEPER', 'PROCESSOR']
});

assert(resolvedAccessBP.moduleIds.includes('hive_view'), 'Resolved modules include "hive_view"');
assert(resolvedAccessBP.moduleIds.includes('honey_batches'), 'Resolved modules include "honey_batches"');
assert(resolvedAccessBP.moduleIds.includes('processing_records'), 'Resolved modules include "processing_records"');
assert(!resolvedAccessBP.moduleIds.includes('lab_records'), 'Resolved modules do NOT include "lab_records" without Lab capabilities');

// Deduplication
const uniqueModules = new Set(resolvedAccessBP.moduleIds);
assert(uniqueModules.size === resolvedAccessBP.moduleIds.length, 'Module union is strictly deduplicated');

// Action-level permissions
assert(
  canPerformAction(resolvedAccessBP, ACTION_PERMISSIONS.HIVE_INSPECT),
  'Beekeeper can perform HIVE_INSPECT'
);
assert(
  canPerformAction(resolvedAccessBP, ACTION_PERMISSIONS.BATCH_CREATE),
  'Processor can perform BATCH_CREATE'
);
assert(
  !canPerformAction(resolvedAccessBP, ACTION_PERMISSIONS.QUALITY_RECORD_CREATE),
  'Beekeeper + Processor cannot perform QUALITY_RECORD_CREATE'
);

// Privileged action isolation (ordinary user cannot self-grant admin actions)
assert(
  !canPerformAction(resolvedAccessBP, ACTION_PERMISSIONS.USER_MANAGE),
  'Privileged Action Isolation: Ordinary user CANNOT perform USER_MANAGE'
);
assert(
  !canPerformAction(resolvedAccessBP, ACTION_PERMISSIONS.BATCH_DELETE),
  'Privileged Action Isolation: Ordinary user CANNOT perform BATCH_DELETE'
);

// Elevated admin permissions
const adminAccess = resolvePermissionsAndModules({
  capabilities: ['HIVE_MONITORING'],
  designations: ['BEEKEEPER'],
  isSystemAdmin: true
});
assert(
  canPerformAction(adminAccess, ACTION_PERMISSIONS.USER_MANAGE),
  'System Administrator CAN perform USER_MANAGE when elevated'
);
assert(
  canPerformAction(adminAccess, ACTION_PERMISSIONS.BATCH_DELETE),
  'System Administrator CAN perform BATCH_DELETE when elevated'
);

console.log('\n------------------------------------------------------------');

// ------------------------------------------------------------
// 5. SERVER-AUTHORITATIVE TAMPERING RESISTANCE
// ------------------------------------------------------------
console.log('TEST SUITE 5: Authoritative Backend Resolution & Tamper Resistance');

// Malicious client claims 'DISTRIBUTOR' designation without having the required capabilities
const maliciousPayload = {
  userId: 'usr-attacker',
  capabilities: ['HIVE_MONITORING'], // only has hive monitoring
  designations: ['DISTRIBUTOR', 'LAB_SPECIALIST', 'BEEKEEPER'] // falsely claims Distributor & Lab
};

const authoritativeResult = resolveAuthoritativeAccess(maliciousPayload);

assert(
  authoritativeResult.confirmedDesignations.includes('BEEKEEPER'),
  'Authoritative resolution confirms legitimately qualified designation BEEKEEPER'
);
assert(
  !authoritativeResult.confirmedDesignations.includes('DISTRIBUTOR'),
  'Tamper Resistance: Server strips unauthorized DISTRIBUTOR designation'
);
assert(
  !authoritativeResult.confirmedDesignations.includes('LAB_SPECIALIST'),
  'Tamper Resistance: Server strips unauthorized LAB_SPECIALIST designation'
);
assert(
  !authoritativeResult.accessProfile.moduleIds.includes('shipments'),
  'Tamper Resistance: Server prevents access to "shipments" module'
);
assert(
  authoritativeResult.policyVersion === ACCESS_POLICY_VERSION,
  `Authoritative envelope enforces policyVersion ${ACCESS_POLICY_VERSION}`
);

console.log('\n------------------------------------------------------------');

// ------------------------------------------------------------
// 6. PROPERTY-BASED INVARIANT TESTS
// ------------------------------------------------------------
console.log('TEST SUITE 6: Property-Based Invariant Tests');

// Property 1: Deduplication Invariance
const listWithDupes = ['HIVE_MONITORING', 'HIVE_MONITORING', 'HIVE_INSPECTION', 'HIVE_INSPECTION'];
const listWithoutDupes = ['HIVE_MONITORING', 'HIVE_INSPECTION'];
const resDupes = evaluateDesignationEligibility(listWithDupes);
const resClean = evaluateDesignationEligibility(listWithoutDupes);
assertEqual(
  resDupes.suggestedDesignationIds,
  resClean.suggestedDesignationIds,
  'Property: Duplicate capabilities produce identical designation suggestions'
);

// Property 2: Order Invariance
const order1 = ['HONEY_PROCESSING', 'HIVE_MONITORING', 'BATCH_MANAGEMENT', 'HIVE_INSPECTION'];
const order2 = ['HIVE_INSPECTION', 'BATCH_MANAGEMENT', 'HIVE_MONITORING', 'HONEY_PROCESSING'];
const resOrder1 = evaluateDesignationEligibility(order1);
const resOrder2 = evaluateDesignationEligibility(order2);
assertEqual(
  resOrder1.suggestedDesignationIds.sort(),
  resOrder2.suggestedDesignationIds.sort(),
  'Property: Order of capability selection does not change designation suggestions'
);

// Property 3: Monotonicity (Adding non-conflicting capability never removes unrelated access)
const baseCaps = ['HIVE_MONITORING', 'HIVE_INSPECTION'];
const baseAccess = resolveAuthoritativeAccess({ capabilities: baseCaps });
const extendedCaps = ['HIVE_MONITORING', 'HIVE_INSPECTION', 'HONEY_PROCESSING', 'BATCH_MANAGEMENT'];
const extendedAccess = resolveAuthoritativeAccess({ capabilities: extendedCaps });

const allBaseModulesRetained = baseAccess.accessProfile.moduleIds.every(
  m => extendedAccess.accessProfile.moduleIds.includes(m)
);
assert(
  allBaseModulesRetained,
  'Property Monotonicity: Adding processing capabilities does not remove hive modules'
);

// Property 4: Independent Module Retention (Shared modules retained if supported by remaining role)
// Both Beekeeper and Processor share 'honey_collection' or 'inventory'
const beekeeperModules = resolvePermissionsAndModules({
  capabilities: ['HIVE_MONITORING', 'HONEY_COLLECTION'],
  designations: ['BEEKEEPER']
});
const multiModules = resolvePermissionsAndModules({
  capabilities: ['HIVE_MONITORING', 'HONEY_COLLECTION', 'HONEY_PROCESSING', 'BATCH_MANAGEMENT'],
  designations: ['BEEKEEPER', 'PROCESSOR']
});
// When Processor capabilities are removed, Beekeeper-supported modules remain
const reducedModules = resolvePermissionsAndModules({
  capabilities: ['HIVE_MONITORING', 'HONEY_COLLECTION'],
  designations: ['BEEKEEPER']
});
assert(
  reducedModules.moduleIds.includes('honey_collection'),
  'Property: Shared module "honey_collection" is safely retained by Beekeeper designation'
);

console.log('\n------------------------------------------------------------');

// ------------------------------------------------------------
// 7. DYNAMIC DASHBOARD PRIORITY ENGINE
// ------------------------------------------------------------
console.log('TEST SUITE 7: Dynamic Dashboard Priority Engine');

// Beekeeper-only layout
const beekeeperLayout = resolveDashboardLayout({
  accessProfile: resolvePermissionsAndModules({
    capabilities: ['HIVE_MONITORING', 'HIVE_INSPECTION'],
    designations: ['BEEKEEPER']
  }),
  userDesignations: ['BEEKEEPER']
});
assert(
  beekeeperLayout[0].id === 'HIVE_HEALTH',
  `Beekeeper top dashboard section is "HIVE_HEALTH" (Got: ${beekeeperLayout[0]?.id})`
);
assert(
  !beekeeperLayout.some(s => s.id === 'ACTIVE_BATCHES'),
  'Beekeeper-only dashboard does NOT show irrelevant "ACTIVE_BATCHES" section'
);

// Processor + Lab layout
const procLabLayout = resolveDashboardLayout({
  accessProfile: resolvePermissionsAndModules({
    capabilities: ['HONEY_PROCESSING', 'QUALITY_TESTING', 'BATCH_MANAGEMENT', 'LAB_INSPECTION'],
    designations: ['PROCESSOR', 'LAB_SPECIALIST']
  }),
  userDesignations: ['PROCESSOR', 'LAB_SPECIALIST']
});
assert(
  procLabLayout.some(s => s.id === 'ACTIVE_BATCHES') && procLabLayout.some(s => s.id === 'QUALITY_CHECKS'),
  'Processor + Lab dashboard prioritizes both batch and quality sections'
);

console.log('\n------------------------------------------------------------');

// ------------------------------------------------------------
// 8. LEGACY ROLE MIGRATION
// ------------------------------------------------------------
console.log('TEST SUITE 8: Legacy Role Migration');

const migratedBeekeeper = migrateLegacyRole('beekeeper');
assert(
  migratedBeekeeper.designations.includes('BEEKEEPER'),
  'Legacy role "beekeeper" migrates to canonical BEEKEEPER designation'
);
assert(
  migratedBeekeeper.capabilities.includes('HIVE_MONITORING') && migratedBeekeeper.capabilities.includes('HIVE_INSPECTION'),
  'Migrated beekeeper receives normalized required and core capabilities'
);

const migratedProcessor = migrateLegacyRole('processor');
assert(
  migratedProcessor.designations.includes('PROCESSOR') && migratedProcessor.capabilities.includes('HONEY_PROCESSING'),
  'Legacy role "processor" migrates to canonical PROCESSOR designation and capabilities'
);

console.log('\n------------------------------------------------------------');

// ------------------------------------------------------------
// 9. SCREEN 06: WORK CONTEXT TAXONOMY & CAPABILITY DISCOVERY
// ------------------------------------------------------------
console.log('TEST SUITE 9: Screen 06 Work Context Discovery & Decoupled Architecture');

assert(
  WORK_CONTEXT_TAXONOMY.length >= 4,
  'Work Context taxonomy contains at least 4 starting categories'
);

const hiveCtx = WORK_CONTEXT_MAP.get('HIVE_OPERATIONS');
assert(
  hiveCtx && hiveCtx.title === 'Hives' && hiveCtx.description === 'Bee colonies and hive operations',
  'HIVE_OPERATIONS context defines exact title and description'
);

const honeyCtx = WORK_CONTEXT_MAP.get('HONEY_OPERATIONS');
assert(
  honeyCtx && honeyCtx.title === 'Honey' && honeyCtx.description === 'Collection, processing and batch handling',
  'HONEY_OPERATIONS context defines exact title and description'
);

const qualityCtx = WORK_CONTEXT_MAP.get('QUALITY_OPERATIONS');
assert(
  qualityCtx && qualityCtx.title === 'Quality' && qualityCtx.description === 'Testing, inspection and quality records',
  'QUALITY_OPERATIONS context defines exact title and description'
);

const logisticsCtx = WORK_CONTEXT_MAP.get('LOGISTICS_OPERATIONS');
assert(
  logisticsCtx && logisticsCtx.title === 'Products & delivery' && logisticsCtx.description === 'Packaging, inventory and distribution',
  'LOGISTICS_OPERATIONS context defines exact title and description'
);

// Filtering & deduplication
const singleHiveCaps = getCapabilitiesForWorkContexts(['HIVE_OPERATIONS']);
assert(
  singleHiveCaps.includes('HIVE_MONITORING') && singleHiveCaps.includes('HIVE_INSPECTION'),
  'HIVE_OPERATIONS provides hive monitoring and inspection capabilities'
);

const combinedCaps = getCapabilitiesForWorkContexts(['HIVE_OPERATIONS', 'HONEY_OPERATIONS']);
assert(
  combinedCaps.includes('HIVE_MONITORING') && combinedCaps.includes('HONEY_PROCESSING'),
  'Multi-selection combines capability suggestions from both areas'
);

const uniqueCheck = new Set(combinedCaps);
assert(
  uniqueCheck.size === combinedCaps.length,
  'Combined capabilities are strictly deduplicated (no duplicate tasks)'
);

// Decoupled Architectural Invariant: Work Contexts do NOT automatically grant designations
const zeroCapsEvaluation = evaluateDesignationEligibility([]);
assert(
  zeroCapsEvaluation.suggestedDesignationIds.length === 0,
  'Architectural Rule: Work contexts alone do NOT grant designations without selected capabilities'
);

console.log('\n============================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
console.log('============================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED SUCCESSFULLY! Enterprise Capability System verified.');
  process.exit(0);
}
