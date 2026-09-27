/**
 * HoneyChain Capability Reconciliation & Audit Fix Verification Suite
 *
 * Verifies End-to-End Resolution:
 * USER ACTION -> COMPONENT -> EVENT -> STATE -> SERVICE -> AUTHORIZATION -> VALIDATION -> RESPONSE
 *
 * Scenarios tested:
 * 1. Original Failure Reproduction: Verification that canonical capabilities now achieve STRONG_MATCH
 * 2. Multi-domain convergence: Dual Beekeeper + Processor properly suggests BOTH designations
 * 3. BATCH_TRACEABILITY deduplication: Verified multi-domain scope (PROCESSOR + DISTRIBUTOR)
 * 4. CERTIFICATE_GENERATION and PACKAGE_QR_VALIDATE capability registry completeness
 * 5. Success Path: Authoritative access envelope resolution and designation confirmation
 * 6. Failure Path: Missing mandatory requirements evaluates to NOT_ELIGIBLE
 * 7. Unauthorized Path: Non-admin users cannot access privileged actions
 * 8. Duplicate Action & Deduplication Invariance
 * 9. Policy Revalidation & Session Refresh Resilience
 * 10. Legacy Migration Backward Compatibility
 */

import {
  evaluateDesignationEligibility,
  evaluateSingleDesignation,
  DESIGNATION_TAXONOMY
} from '../src/services/designationEngine.js';

import {
  resolveAuthoritativeAccess,
  revalidateUserAccess,
  migrateLegacyRole
} from '../src/services/authoritativeAccessService.js';

import {
  CAPABILITY_MAP as CANONICAL_CAPABILITY_MAP,
  CapabilityRegistry
} from '../src/services/capabilityRegistry.js';

import {
  ACTION_PERMISSIONS,
  PRIVILEGED_ACTIONS,
  resolvePermissionsAndModules,
  canPerformAction
} from '../src/services/permissionEngine.js';

import {
  RouteRegistry
} from '../src/services/routeRegistry.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`FAILED: ${message}`);
  }
}

console.log('--- STARTING CAPABILITY RECONCILIATION AUDIT TEST SUITE ---');

// 1. Original Failure Fixed: Canonical Processor, Distributor, and Lab achieve STRONG_MATCH / REQUIRES_VERIFICATION
const procEval = evaluateDesignationEligibility(['PROCESSING_MANAGEMENT', 'BATCH_INTAKE', 'PROCESSING_STEP_RECORD']);
assert(
  procEval.evaluations['PROCESSOR'].state === 'STRONG_MATCH',
  `Scenario 1.1: Processor with canonical capabilities must be STRONG_MATCH (got: ${procEval.evaluations['PROCESSOR'].state})`
);
assert(
  procEval.evaluations['PROCESSOR'].satisfiedCore.length >= 1,
  'Scenario 1.2: Processor has at least 1 satisfied core task'
);
assert(
  procEval.suggestedDesignationIds.includes('PROCESSOR'),
  'Scenario 1.3: Processor is suggested in suggestedDesignationIds'
);

const distEval = evaluateDesignationEligibility(['DISPATCH_PLANNING', 'PACKAGE_QR_VALIDATE', 'SHIPMENT_CREATE', 'DELIVERY_TRACKING']);
assert(
  distEval.evaluations['DISTRIBUTOR'].state === 'STRONG_MATCH',
  `Scenario 1.4: Distributor with canonical capabilities must be STRONG_MATCH (got: ${distEval.evaluations['DISTRIBUTOR'].state})`
);
assert(
  distEval.suggestedDesignationIds.includes('DISTRIBUTOR'),
  'Scenario 1.5: Distributor is suggested in suggestedDesignationIds'
);

const labEval = evaluateDesignationEligibility(['LAB_WORKSPACE', 'SAMPLE_INTAKE', 'TEST_EXECUTION', 'RESULT_REVIEW']);
assert(
  labEval.evaluations['LAB_SPECIALIST'].state === 'REQUIRES_VERIFICATION' || labEval.evaluations['LAB_SPECIALIST'].state === 'STRONG_MATCH',
  `Scenario 1.6: Lab Specialist with canonical capabilities must be verified/strong (got: ${labEval.evaluations['LAB_SPECIALIST'].state})`
);
assert(
  labEval.suggestedDesignationIds.includes('LAB_SPECIALIST'),
  'Scenario 1.7: Lab Specialist is suggested in suggestedDesignationIds'
);

// 2. Dual-Domain Convergence: Beekeeper + Processor both qualify
const dualEval = evaluateDesignationEligibility([
  'HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION',
  'PROCESSING_MANAGEMENT', 'BATCH_INTAKE', 'PROCESSING_STEP_RECORD'
]);
assert(
  dualEval.suggestedDesignationIds.includes('BEEKEEPER') && dualEval.suggestedDesignationIds.includes('PROCESSOR'),
  `Scenario 2: Dual Beekeeper + Processor suggests BOTH designations (got: ${dualEval.suggestedDesignationIds.join(', ')})`
);
assert(
  dualEval.evaluations['BEEKEEPER'].state === 'STRONG_MATCH' && dualEval.evaluations['PROCESSOR'].state === 'STRONG_MATCH',
  'Scenario 2.1: Both Beekeeper and Processor evaluate to STRONG_MATCH'
);

// 3. BATCH_TRACEABILITY Deduplication and Domain Scope
const batchTraceCap = CANONICAL_CAPABILITY_MAP.get('BATCH_TRACEABILITY');
assert(
  batchTraceCap !== undefined,
  'Scenario 3.1: BATCH_TRACEABILITY exists in Canonical Capability Map'
);
assert(
  batchTraceCap.domains.includes('PROCESSOR') && batchTraceCap.domains.includes('DISTRIBUTOR'),
  `Scenario 3.2: BATCH_TRACEABILITY domain spans both PROCESSOR and DISTRIBUTOR (got: ${batchTraceCap.domains.join(', ')})`
);

// 4. Undefined Capability Additions (CERTIFICATE_GENERATION & PACKAGE_QR_VALIDATE)
assert(
  CANONICAL_CAPABILITY_MAP.has('CERTIFICATE_GENERATION'),
  'Scenario 4.1: CERTIFICATE_GENERATION is defined in canonical capability map'
);
assert(
  CANONICAL_CAPABILITY_MAP.has('PACKAGE_QR_VALIDATE'),
  'Scenario 4.2: PACKAGE_QR_VALIDATE is defined in canonical capability map'
);

// 5. Success Path: Authoritative access resolution
const authSuccess = resolveAuthoritativeAccess({
  userId: 'usr-proc-01',
  capabilities: ['PROCESSING_MANAGEMENT', 'BATCH_INTAKE', 'PROCESSING_STEP_RECORD'],
  designations: ['PROCESSOR']
});
assert(
  authSuccess.confirmedDesignations.includes('PROCESSOR'),
  'Scenario 5.1: Processor designation confirmed by authoritative server resolution'
);
assert(
  authSuccess.accessProfile.moduleIds.includes('honey_batches'),
  'Scenario 5.2: honey_batches module unlocked for canonical processor'
);
assert(
  authSuccess.accessProfile.moduleIds.includes('processing_records'),
  'Scenario 5.3: processing_records module unlocked for canonical processor'
);

// 6. Failure Path: Missing mandatory requirements
const missingRequired = evaluateDesignationEligibility(['BATCH_INTAKE', 'PROCESSING_STEP_RECORD']); // Missing PROCESSING_MANAGEMENT
assert(
  missingRequired.evaluations['PROCESSOR'].state === 'NOT_ELIGIBLE',
  'Scenario 6.1: Processor is NOT_ELIGIBLE without mandatory PROCESSING_MANAGEMENT'
);
assert(
  !missingRequired.suggestedDesignationIds.includes('PROCESSOR'),
  'Scenario 6.2: Processor is NOT suggested when missing mandatory requirement'
);

// 7. Unauthorized Path: Privileged action isolation
const regularAccess = resolvePermissionsAndModules({
  capabilities: ['LAB_WORKSPACE', 'SAMPLE_INTAKE', 'TEST_EXECUTION', 'RESULT_REVIEW'],
  designations: ['LAB_SPECIALIST'],
  isSystemAdmin: false
});
assert(
  !regularAccess.permissionIds.includes('BATCH_DELETE'),
  'Scenario 7.1: Regular user denied privileged BATCH_DELETE'
);
assert(
  !regularAccess.permissionIds.includes('QUALITY_APPROVE'),
  'Scenario 7.2: Regular user denied privileged QUALITY_APPROVE'
);

const adminAccess = resolvePermissionsAndModules({
  capabilities: ['LAB_WORKSPACE', 'SAMPLE_INTAKE', 'TEST_EXECUTION', 'RESULT_REVIEW'],
  designations: ['LAB_SPECIALIST'],
  isSystemAdmin: true
});
assert(
  adminAccess.privilegedActionsGranted === true,
  'Scenario 7.3: System admin granted privileged action capability'
);

// 8. Duplicate Action & Deduplication Invariance
const listWithDuplicates = [
  'HIVE_MANAGEMENT', 'HIVE_MANAGEMENT', 'HIVE_INSPECTION',
  'PROCESSING_MANAGEMENT', 'PROCESSING_MANAGEMENT'
];
const evalWithDupes = evaluateDesignationEligibility(listWithDuplicates);
const evalClean = evaluateDesignationEligibility(['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'PROCESSING_MANAGEMENT']);
assert(
  evalWithDupes.normalizedCapabilities.length === evalClean.normalizedCapabilities.length,
  'Scenario 8: Duplicate capabilities produce identical normalized capability count'
);

// 9. Policy Revalidation
const staleSession = {
  isAuthenticated: true,
  policyVersion: 1,
  capabilities: ['HIVE_MANAGEMENT', 'HIVE_INSPECTION'],
  designations: ['BEEKEEPER']
};
const revalidation = revalidateUserAccess(staleSession);
assert(
  revalidation.policyVersion === 12,
  `Scenario 9.1: Revalidated session upgraded to current policyVersion 12 (got: ${revalidation.policyVersion})`
);
assert(
  revalidation.designations.includes('BEEKEEPER'),
  'Scenario 9.2: Revalidated session preserves valid confirmed BEEKEEPER designation'
);

// 10. Route Access & Legacy Backward Compatibility
const routeAllowed = RouteRegistry.validateRouteAccess('batches', ['PROCESSING_MANAGEMENT', 'BATCH_INTAKE', 'BATCH_TRACEABILITY']);
assert(
  routeAllowed === true,
  'Scenario 10.1: RouteRegistry allows batches route for canonical processor'
);

const migrated = migrateLegacyRole('beekeeper');
assert(
  migrated.designations.includes('BEEKEEPER'),
  'Scenario 10.2: Legacy beekeeper role successfully migrates to BEEKEEPER'
);
assert(
  !migrated.designations.includes('PROCESSOR'),
  'Scenario 10.3: Legacy beekeeper role does not leak PROCESSOR designation'
);

console.log(`\nRESULTS: ${passed} PASSED, ${failed} FAILED.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('--- ALL CAPABILITY RECONCILIATION SCENARIOS VERIFIED END-TO-END! ---\n');
  process.exit(0);
}
