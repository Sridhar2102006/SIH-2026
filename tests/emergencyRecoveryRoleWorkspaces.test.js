/**
 * EMERGENCY RECOVERY VERIFICATION TEST SUITE
 * 
 * Verifies:
 * 1. All 4 Onboarding Modes (Beekeeper, Processor, Lab Specialist, Distributor)
 * 2. Deterministic Capability & Designation Resolution
 * 3. Exact Role Workspace & Navigation Generation
 * 4. Route Access Validation per Role
 * 5. Blank State Resiliency (No mock data crashes)
 * 6. Privilege Escalation & Tampering Protection
 */

import assert from 'node:assert';
import { resolveAuthoritativeAccess } from '../src/services/authoritativeAccessService.js';
import { composeWorkspace } from '../src/services/workspaceComposer.js';
import { RouteRegistry } from '../src/services/routeRegistry.js';
import { canPerformAction, ACTION_PERMISSIONS, PRIVILEGED_ACTIONS } from '../src/services/permissionEngine.js';
import { CommonProcessorOnboardingService } from '../src/services/commonProcessorOnboardingService.js';

console.log('====================================================');
console.log('HONEYCHAIN EMERGENCY RECOVERY VERIFICATION SUITE');
console.log('====================================================');

// ── TEST 1: BEEKEEPER ONBOARDING & WORKSPACE ───────────────────
console.log('\n--- 1. BEEKEEPER ONBOARDING & WORKSPACE ---');
const beekeeperOnboardingPayload = {
  userId: 'usr-beekeeper-01',
  role: 'BEEKEEPER',
  designations: ['BEEKEEPER'],
  capabilities: [
    'HIVE_MANAGEMENT',
    'HIVE_INSPECTION',
    'HONEY_COLLECTION',
    'BEE_OBSERVATION',
    'HIVE_IMAGE_CAPTURE',
    'BEE_HEALTH_SCAN',
    'CONNECTED_HIVE_MONITORING',
    'BATCH_TRACEABILITY',
    'COLLECTION_BATCH_LINK'
  ]
};

const bkAccess = resolveAuthoritativeAccess(beekeeperOnboardingPayload);
assert.strictEqual(bkAccess.confirmedDesignations.includes('BEEKEEPER'), true, 'Beekeeper designation authoritatively preserved');
assert.strictEqual(bkAccess.confirmedDesignations.includes('PROCESSOR'), false, 'Beekeeper does not possess Processor designation');

const bkWs = composeWorkspace({
  user: { userId: 'usr-beekeeper-01', designations: ['BEEKEEPER'] },
  capabilities: bkAccess.normalizedCapabilities,
  designations: bkAccess.confirmedDesignations,
  operationalData: {}
});

assert.strictEqual(bkWs.primaryDesignation, 'BEEKEEPER', 'Primary designation resolves to BEEKEEPER');
const bkNavIds = bkWs.navigation.map(n => n.id);
assert.strictEqual(bkNavIds[0], 'home', 'First tab is Home');
assert.strictEqual(bkNavIds.includes('hives'), true, 'Beekeeper navigation includes Hives');
assert.strictEqual(bkNavIds.includes('inspections'), true, 'Beekeeper navigation includes Inspections');
assert.strictEqual(bkNavIds.includes('harvest'), true, 'Beekeeper navigation includes Harvest');
assert.strictEqual(bkNavIds.includes('journey'), true, 'Beekeeper navigation includes Journey');
assert.strictEqual(bkNavIds.includes('samples'), false, 'Beekeeper navigation does NOT leak Lab Samples');
assert.strictEqual(bkNavIds.includes('dispatch'), false, 'Beekeeper navigation does NOT leak Dispatch');

// Route checks
assert.strictEqual(RouteRegistry.validateRouteAccess('hives', bkAccess.normalizedCapabilities), true, 'Beekeeper can access /hives');
assert.strictEqual(RouteRegistry.validateRouteAccess('inspections', bkAccess.normalizedCapabilities), true, 'Beekeeper can access /inspections');
assert.strictEqual(RouteRegistry.validateRouteAccess('harvest', bkAccess.normalizedCapabilities), true, 'Beekeeper can access /harvest');
assert.strictEqual(RouteRegistry.validateRouteAccess('journey', bkAccess.normalizedCapabilities), true, 'Beekeeper can access /journey');
assert.strictEqual(RouteRegistry.validateRouteAccess('samples', bkAccess.normalizedCapabilities), false, 'Beekeeper is blocked from /samples');
assert.strictEqual(RouteRegistry.validateRouteAccess('dispatch', bkAccess.normalizedCapabilities), false, 'Beekeeper is blocked from /dispatch');
console.log('✓ PASS: Beekeeper Onboarding & Workspace verified');


// ── TEST 2: PROCESSOR ONBOARDING & WORKSPACE ───────────────────
console.log('\n--- 2. PROCESSOR ONBOARDING & WORKSPACE ---');
const processorAnswers = {
  activity: 'PROCESS',
  workPlace: 'PROCESSING_UNIT',
  location: { state: 'Karnataka', district: 'Kodagu', town: 'Madikeri' },
  sources: ['LOCAL_BEEKEEPERS'],
  scale: 'MEDIUM',
  honeyTypes: ['MULTIFLORAL', 'FOREST'],
  processActions: ['CHECK', 'FILTER', 'SETTLE', 'PACK'],
  equipment: ['FILTER', 'SETTLING_TANK', 'MOISTURE_DEVICE'],
  regularMethod: 'OWN_METHOD',
  qualityCheck: 'OWN_CHECKS',
  packaging: ['GLASS_JARS'],
  market: 'DOMESTIC'
};

const procAuthoritative = CommonProcessorOnboardingService.confirmAndSave(processorAnswers);
assert.strictEqual(procAuthoritative.confirmedCapabilities.includes('PROCESSING_MANAGEMENT'), true, 'Processor has PROCESSING_MANAGEMENT');
assert.strictEqual(procAuthoritative.confirmedCapabilities.includes('BATCH_INTAKE'), true, 'Processor has BATCH_INTAKE');
assert.strictEqual(procAuthoritative.confirmedCapabilities.includes('DISPATCH_PLANNING'), false, 'Processor does NOT erroneously get DISPATCH_PLANNING');

const procAccess = resolveAuthoritativeAccess({
  userId: 'usr-proc-01',
  role: 'PROCESSOR',
  designations: ['PROCESSOR'],
  capabilities: procAuthoritative.confirmedCapabilities
});

assert.strictEqual(procAccess.confirmedDesignations.includes('PROCESSOR'), true, 'Processor designation authoritatively confirmed');

const procWs = composeWorkspace({
  user: { userId: 'usr-proc-01', designations: ['PROCESSOR'] },
  capabilities: procAccess.normalizedCapabilities,
  designations: procAccess.confirmedDesignations,
  operationalData: {}
});

assert.strictEqual(procWs.primaryDesignation, 'PROCESSOR', 'Primary designation resolves to PROCESSOR');
const procNavIds = procWs.navigation.map(n => n.id);
assert.strictEqual(procNavIds[0], 'home', 'First tab is Home');
assert.strictEqual(procNavIds.includes('intake'), true, 'Processor navigation includes Intake');
assert.strictEqual(procNavIds.includes('processing'), true, 'Processor navigation includes Processing');
assert.strictEqual(procNavIds.includes('batches'), true, 'Processor navigation includes Batches');
assert.strictEqual(procNavIds.includes('history'), true, 'Processor navigation includes History');
assert.strictEqual(procNavIds.includes('hives'), false, 'Processor navigation does NOT include Hives');
assert.strictEqual(procNavIds.includes('dispatch'), false, 'Processor navigation does NOT include Dispatch');

// Route checks
assert.strictEqual(RouteRegistry.validateRouteAccess('intake', procAccess.normalizedCapabilities), true, 'Processor can access /intake');
assert.strictEqual(RouteRegistry.validateRouteAccess('processing', procAccess.normalizedCapabilities), true, 'Processor can access /processing');
assert.strictEqual(RouteRegistry.validateRouteAccess('batches', procAccess.normalizedCapabilities), true, 'Processor can access /batches');
assert.strictEqual(RouteRegistry.validateRouteAccess('hives', procAccess.normalizedCapabilities), false, 'Processor blocked from /hives');
console.log('✓ PASS: Processor Onboarding & Workspace verified');


// ── TEST 3: LAB SPECIALIST ONBOARDING & WORKSPACE ──────────────
console.log('\n--- 3. LAB SPECIALIST ONBOARDING & WORKSPACE ---');
const labPayload = {
  userId: 'usr-lab-01',
  role: 'LAB_SPECIALIST',
  designations: ['LAB_SPECIALIST'],
  capabilities: [
    'LAB_WORKSPACE',
    'SAMPLE_INTAKE',
    'TEST_EXECUTION',
    'TEST_ASSIGNMENT',
    'TEST_RESULT_ENTRY',
    'RESULT_REVIEW',
    'QUALITY_RECOMMENDATION',
    'TRACEABILITY_VERIFICATION',
    'CERTIFICATE_GENERATION'
  ]
};

const labAccess = resolveAuthoritativeAccess(labPayload);
assert.strictEqual(labAccess.confirmedDesignations.includes('LAB_SPECIALIST'), true, 'Lab Specialist designation confirmed');

const labWs = composeWorkspace({
  user: { userId: 'usr-lab-01', designations: ['LAB_SPECIALIST'] },
  capabilities: labAccess.normalizedCapabilities,
  designations: labAccess.confirmedDesignations,
  operationalData: {}
});

assert.strictEqual(labWs.primaryDesignation, 'LAB_SPECIALIST', 'Primary designation resolves to LAB_SPECIALIST');
const labNavIds = labWs.navigation.map(n => n.id);
assert.strictEqual(labNavIds[0], 'home', 'First tab is Home');
assert.strictEqual(labNavIds.includes('samples'), true, 'Lab navigation includes Samples');
assert.strictEqual(labNavIds.includes('tests'), true, 'Lab navigation includes Tests');
assert.strictEqual(labNavIds.includes('review'), true, 'Lab navigation includes Review');
assert.strictEqual(labNavIds.includes('hives'), false, 'Lab navigation does NOT include Hives');
assert.strictEqual(labNavIds.includes('intake'), false, 'Lab navigation does NOT include Intake');

// Route checks
assert.strictEqual(RouteRegistry.validateRouteAccess('samples', labAccess.normalizedCapabilities), true, 'Lab can access /samples');
assert.strictEqual(RouteRegistry.validateRouteAccess('tests', labAccess.normalizedCapabilities), true, 'Lab can access /tests');
assert.strictEqual(RouteRegistry.validateRouteAccess('review', labAccess.normalizedCapabilities), true, 'Lab can access /review');
assert.strictEqual(RouteRegistry.validateRouteAccess('intake', labAccess.normalizedCapabilities), false, 'Lab blocked from /intake');
console.log('✓ PASS: Lab Specialist Onboarding & Workspace verified');


// ── TEST 4: DISTRIBUTOR ONBOARDING & WORKSPACE ─────────────────
console.log('\n--- 4. DISTRIBUTOR ONBOARDING & WORKSPACE ---');
const dispatchPayload = {
  userId: 'usr-dispatch-01',
  role: 'DISTRIBUTOR',
  designations: ['DISTRIBUTOR'],
  capabilities: [
    'DISPATCH_PLANNING',
    'DISTRIBUTION_WORKSPACE',
    'PACKAGE_QR_VALIDATE',
    'SHIPMENT_CREATE',
    'SHIPMENT_RELEASE',
    'SHIPMENT_DISPATCH',
    'DELIVERY_TRACKING',
    'DELIVERY_CONFIRMATION',
    'PROOF_OF_DELIVERY',
    'ROUTE_PLANNING',
    'BATCH_TRACEABILITY'
  ]
};

const dispatchAccess = resolveAuthoritativeAccess(dispatchPayload);
assert.strictEqual(dispatchAccess.confirmedDesignations.includes('DISTRIBUTOR'), true, 'Distributor designation confirmed');

const dispatchWs = composeWorkspace({
  user: { userId: 'usr-dispatch-01', designations: ['DISTRIBUTOR'] },
  capabilities: dispatchAccess.normalizedCapabilities,
  designations: dispatchAccess.confirmedDesignations,
  operationalData: {}
});

assert.strictEqual(dispatchWs.primaryDesignation, 'DISTRIBUTOR', 'Primary designation resolves to DISTRIBUTOR');
const dispatchNavIds = dispatchWs.navigation.map(n => n.id);
assert.strictEqual(dispatchNavIds[0], 'home', 'First tab is Home');
assert.strictEqual(dispatchNavIds.includes('dispatch'), true, 'Distributor navigation includes Dispatch / Ready to Ship');
assert.strictEqual(dispatchNavIds.includes('shipments'), true, 'Distributor navigation includes Shipments');
assert.strictEqual(dispatchNavIds.includes('deliveries'), true, 'Distributor navigation includes Tracking/Deliveries');
assert.strictEqual(dispatchNavIds.includes('hives'), false, 'Distributor navigation does NOT include Hives');

// Route checks
assert.strictEqual(RouteRegistry.validateRouteAccess('dispatch', dispatchAccess.normalizedCapabilities), true, 'Distributor can access /dispatch');
assert.strictEqual(RouteRegistry.validateRouteAccess('shipments', dispatchAccess.normalizedCapabilities), true, 'Distributor can access /shipments');
assert.strictEqual(RouteRegistry.validateRouteAccess('deliveries', dispatchAccess.normalizedCapabilities), true, 'Distributor can access /deliveries');
assert.strictEqual(RouteRegistry.validateRouteAccess('samples', dispatchAccess.normalizedCapabilities), false, 'Distributor blocked from /samples');
console.log('✓ PASS: Distributor Onboarding & Workspace verified');


// ── TEST 5: BLANK STATE RESILIENCE ─────────────────────────────
console.log('\n--- 5. BLANK STATE RESILIENCE ---');
const emptyWs = composeWorkspace({
  user: { userId: 'usr-empty', designations: [] },
  capabilities: [],
  designations: [],
  operationalData: {
    hives: [],
    batches: [],
    samples: [],
    packages: [],
    shipments: []
  },
  workflowState: {}
});

assert.strictEqual(typeof emptyWs, 'object', 'Workspace gracefully composes from completely empty state');
assert.strictEqual(Array.isArray(emptyWs.navigation), true, 'Navigation is valid array');
assert.strictEqual(emptyWs.navigation.length >= 4, true, 'At least 4 navigation items provided');
console.log('✓ PASS: Blank state resilience verified');


// ── TEST 6: PRIVILEGE ESCALATION PREVENTION ────────────────────
console.log('\n--- 6. PRIVILEGE ESCALATION PREVENTION ---');
// Attacker tries to self-grant USER_MANAGE and BATCH_DELETE
const attackerPayload = {
  userId: 'usr-attacker',
  capabilities: ['HIVE_MANAGEMENT', 'USER_MANAGE', 'BATCH_DELETE'],
  designations: ['BEEKEEPER', 'ADMIN'],
  isSystemAdmin: false
};

const attackerAccess = resolveAuthoritativeAccess(attackerPayload);
const perms = attackerAccess.accessProfile?.permissionIds || [];
assert.strictEqual(perms.includes(ACTION_PERMISSIONS.USER_MANAGE), false, 'USER_MANAGE action permission denied to non-admin');
assert.strictEqual(perms.includes(ACTION_PERMISSIONS.BATCH_DELETE), false, 'BATCH_DELETE action permission denied to non-admin');
console.log('✓ PASS: Privilege escalation prevention verified');

console.log('\n====================================================');
console.log('ALL EMERGENCY RECOVERY ROLE TESTS PASSED CLEANLY!');
console.log('====================================================\n');
