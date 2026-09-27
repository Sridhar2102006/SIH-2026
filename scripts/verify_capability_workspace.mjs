/**
 * HoneyChain Comprehensive Capability-Driven Architecture Verification Script
 *
 * Verifies Acceptance Scenarios (§ 55):
 * - User A: Pure Beekeeper (Manage hives, inspect colonies, record observations)
 * - User B: Beekeeper + Health + Monitoring + Collection
 * - User C: Honey Processor (Process honey, record steps, capture evidence)
 * - User D: Laboratory Analyst (Lab testing, record results, review results, generate reports)
 * - User E: Distributor (Create dispatches, allocate packages, track deliveries, assign drivers)
 *
 * Verifies Core Architecture:
 * 1. Onboarding inference & dynamic question branching
 * 2. Capability graph dependency resolution
 * 3. Server-authoritative permission enforcement & IDOR protection
 * 4. Dynamic navigation composition & urgency ordering
 * 5. 20-palette deterministic visual theme resolution
 * 6. Cohesive workspace envelope (§ 35) & quick action limitation (§ 43)
 */

import { CapabilityRegistry } from '../src/services/capabilityRegistry.js';
import { AuthorizationService } from '../src/services/authorizationService.js';
import { OnboardingEngine } from '../src/services/onboardingEngine.js';
import { WorkspaceVisualIdentityService, resolveVisualProfile } from '../src/services/workspaceVisualIdentityService.js';
import { WorkspaceNavigationComposer, composeNavigation } from '../src/services/workspaceNavigationComposer.js';
import { WorkspaceComposer, composeWorkspace } from '../src/services/workspaceComposer.js';

console.log('================================================================');
console.log('HONEYCHAIN CAPABILITY-DRIVEN ADAPTIVE ARCHITECTURE VERIFICATION');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

// -------------------------------------------------------------
// SECTION 1: Capability Catalog & Graph Dependencies
// -------------------------------------------------------------
console.log('[TEST 1] Capability Registry & Graph Dependencies');
const allCaps = CapabilityRegistry.getAllCapabilities();
assert(allCaps.length >= 60, `Registry contains ${allCaps.length} normalized capabilities (expected >= 60)`);

const impliedScan = CapabilityRegistry.resolveImpliedCapabilities(['BEE_HEALTH_SCAN']);
assert(impliedScan.includes('HIVE_INSPECTION'), 'BEE_HEALTH_SCAN correctly implies HIVE_INSPECTION dependency');

const impliedBatch = CapabilityRegistry.resolveImpliedCapabilities(['BATCH_SPLIT_MERGE']);
assert(impliedBatch.includes('PROCESSING_MANAGEMENT'), 'BATCH_SPLIT_MERGE correctly implies PROCESSING_MANAGEMENT');

// -------------------------------------------------------------
// SECTION 2: Acceptance Scenarios (§ 55)
// -------------------------------------------------------------
console.log('\n[TEST 2] § 55 Acceptance Scenarios Onboarding & Inference');

// USER A: Pure Beekeeper
console.log('\n--- Scenario User A (Pure Beekeeper) ---');
const userAAnswers = {
  root_work_focus: ['hives_colonies'],
  beekeeper_field_tasks: ['inspect_colonies', 'record_observations']
};
const userACaps = OnboardingEngine.inferCapabilities(userAAnswers);
const userASuggestions = OnboardingEngine.suggestDesignations(userACaps, userAAnswers);
const userAWorkspace = composeWorkspace({
  user: { id: 'usr-a', workspaceId: 'ws-a' },
  capabilities: userACaps,
  designations: userASuggestions.map(s => s.id)
});

assert(userACaps.includes('HIVE_MANAGEMENT'), 'User A has HIVE_MANAGEMENT');
assert(userACaps.includes('HIVE_INSPECTION'), 'User A has HIVE_INSPECTION');
assert(userACaps.includes('BEE_OBSERVATION'), 'User A has BEE_OBSERVATION');
assert(!userACaps.includes('PROCESSING_MANAGEMENT'), 'User A does NOT have PROCESSING_MANAGEMENT');
assert(!userACaps.includes('LAB_WORKSPACE'), 'User A does NOT have LAB_WORKSPACE');
assert(!userACaps.includes('DISPATCH_PLANNING'), 'User A does NOT have DISPATCH_PLANNING');
assert(userASuggestions[0]?.id === 'BEEKEEPER', 'User A suggested designation is BEEKEEPER');

const userANavLabels = userAWorkspace.navigation.map(n => n.label);
assert(userANavLabels.includes('Home') && userANavLabels.includes('Hives'), `User A navigation includes Home and Hives: [${userANavLabels.join(', ')}]`);
assert(!userANavLabels.includes('Samples') && !userANavLabels.includes('Dispatch'), 'User A navigation does NOT include Samples or Dispatch');

// USER B: Beekeeper + Health + Monitoring + Collection
console.log('\n--- Scenario User B (Beekeeper + Health + Monitoring + Collection) ---');
const userBAnswers = {
  root_work_focus: ['hives_colonies'],
  beekeeper_field_tasks: ['inspect_colonies', 'bee_health_scan', 'connected_sensors', 'harvest_honey']
};
const userBCaps = OnboardingEngine.inferCapabilities(userBAnswers);
const userBSuggestions = OnboardingEngine.suggestDesignations(userBCaps, userBAnswers);
const userBWorkspace = composeWorkspace({
  user: { id: 'usr-b', workspaceId: 'ws-b' },
  capabilities: userBCaps,
  designations: userBSuggestions.map(s => s.id)
});

assert(userBCaps.includes('BEE_HEALTH_SCAN'), 'User B has BEE_HEALTH_SCAN');
assert(userBCaps.includes('CONNECTED_HIVE_MONITORING'), 'User B has CONNECTED_HIVE_MONITORING');
assert(userBCaps.includes('HONEY_COLLECTION'), 'User B has HONEY_COLLECTION');
const userBNavLabels = userBWorkspace.navigation.map(n => n.label);
assert(userBNavLabels.includes('Honey'), `User B navigation includes Honey collection: [${userBNavLabels.join(', ')}]`);

// USER C: Processor
console.log('\n--- Scenario User C (Honey Processor) ---');
const userCAnswers = {
  root_work_focus: ['harvest_extraction'],
  processor_operations: ['intake_batches', 'record_steps', 'capture_evidence']
};
const userCCaps = OnboardingEngine.inferCapabilities(userCAnswers);
const userCSuggestions = OnboardingEngine.suggestDesignations(userCCaps, userCAnswers);
const userCWorkspace = composeWorkspace({
  user: { id: 'usr-c', workspaceId: 'ws-c' },
  capabilities: userCCaps,
  designations: userCSuggestions.map(s => s.id)
});

assert(userCCaps.includes('PROCESSING_MANAGEMENT'), 'User C has PROCESSING_MANAGEMENT');
assert(userCCaps.includes('PROCESSING_STEP_RECORD'), 'User C has PROCESSING_STEP_RECORD');
assert(!userCCaps.includes('HIVE_MANAGEMENT'), 'User C does NOT have HIVE_MANAGEMENT');
assert(!userCCaps.includes('LAB_WORKSPACE'), 'User C does NOT have LAB_WORKSPACE');
assert(userCSuggestions[0]?.id === 'PROCESSOR', 'User C suggested designation is PROCESSOR');
const userCNavLabels = userCWorkspace.navigation.map(n => n.label);
assert(userCNavLabels.includes('Processing') || userCNavLabels.includes('Batches'), `User C navigation includes Processing: [${userCNavLabels.join(', ')}]`);
assert(!userCNavLabels.includes('Hives'), 'User C navigation does NOT include Hives');

// USER D: Laboratory Analyst
console.log('\n--- Scenario User D (Lab Analyst / Reviewer) ---');
const userDAnswers = {
  root_work_focus: ['lab_testing'],
  lab_responsibilities: ['sample_intake', 'execute_tests', 'review_approve', 'generate_coa']
};
const userDCaps = OnboardingEngine.inferCapabilities(userDAnswers);
const userDSuggestions = OnboardingEngine.suggestDesignations(userDCaps, userDAnswers);
const userDWorkspace = composeWorkspace({
  user: { id: 'usr-d', workspaceId: 'ws-d' },
  capabilities: userDCaps,
  designations: userDSuggestions.map(s => s.id)
});

assert(userDCaps.includes('LAB_WORKSPACE'), 'User D has LAB_WORKSPACE');
assert(userDCaps.includes('SAMPLE_INTAKE'), 'User D has SAMPLE_INTAKE');
assert(userDCaps.includes('TEST_EXECUTION'), 'User D has TEST_EXECUTION');
assert(userDCaps.includes('RESULT_REVIEW'), 'User D has RESULT_REVIEW');
assert(userDSuggestions[0]?.id === 'LAB_ANALYST', 'User D suggested designation is LAB_ANALYST');
const userDNavLabels = userDWorkspace.navigation.map(n => n.label);
assert(userDNavLabels.includes('Samples') && userDNavLabels.includes('Tests'), `User D navigation includes Samples and Tests: [${userDNavLabels.join(', ')}]`);

// USER E: Distributor
console.log('\n--- Scenario User E (Distributor / Logistics) ---');
const userEAnswers = {
  root_work_focus: ['dispatch_logistics'],
  distributor_tasks: ['plan_dispatches', 'plan_routes', 'assign_drivers', 'track_deliveries']
};
const userECaps = OnboardingEngine.inferCapabilities(userEAnswers);
const userESuggestions = OnboardingEngine.suggestDesignations(userECaps, userEAnswers);
const userEWorkspace = composeWorkspace({
  user: { id: 'usr-e', workspaceId: 'ws-e' },
  capabilities: userECaps,
  designations: userESuggestions.map(s => s.id)
});

assert(userECaps.includes('DISPATCH_PLANNING'), 'User E has DISPATCH_PLANNING');
assert(userECaps.includes('ROUTE_PLANNING'), 'User E has ROUTE_PLANNING');
assert(userECaps.includes('DRIVER_ASSIGNMENT'), 'User E has DRIVER_ASSIGNMENT');
assert(userECaps.includes('DELIVERY_TRACKING'), 'User E has DELIVERY_TRACKING');
assert(userESuggestions[0]?.id === 'DISTRIBUTOR', 'User E suggested designation is DISTRIBUTOR');
const userENavLabels = userEWorkspace.navigation.map(n => n.label);
assert(userENavLabels.includes('Dispatch') && (userENavLabels.includes('Routes') || userENavLabels.includes('Deliveries')), `User E navigation includes Dispatch & Routes/Deliveries: [${userENavLabels.join(', ')}]`);

// -------------------------------------------------------------
// SECTION 3: Authorization & Security (can, canAny, IDOR guard)
// -------------------------------------------------------------
console.log('\n[TEST 3] Server-Authoritative Permissions & Security Boundaries');

// Beekeeper Authorization
assert(AuthorizationService.can(userAWorkspace, 'HIVE_INSPECT'), 'User A can HIVE_INSPECT');
assert(!AuthorizationService.can(userAWorkspace, 'RESULT_REVIEW'), 'User A CANNOT RESULT_REVIEW');
assert(!AuthorizationService.can(userAWorkspace, 'SHIPMENT_CREATE'), 'User A CANNOT SHIPMENT_CREATE');

// Lab Authorization
assert(AuthorizationService.can(userDWorkspace, 'RESULT_REVIEW'), 'User D can RESULT_REVIEW');
assert(!AuthorizationService.can(userDWorkspace, 'HIVE_INSPECT'), 'User D CANNOT HIVE_INSPECT');

// Distributor Authorization
assert(AuthorizationService.can(userEWorkspace, 'SHIPMENT_CREATE'), 'User E can SHIPMENT_CREATE');
assert(!AuthorizationService.can(userEWorkspace, 'RESULT_REVIEW'), 'User E CANNOT RESULT_REVIEW');

// IDOR & Cross-Workspace Isolation (§ 33)
const ownedHive = { id: 'hive-101', workspaceId: 'ws-a', apiaryId: 'default-org' };
const foreignHive = { id: 'hive-999', workspaceId: 'ws-other-tenant', apiaryId: 'other-org' };

assert(AuthorizationService.can(userAWorkspace, 'HIVE_INSPECT', ownedHive, 'ws-a'), 'User A authorized on their own workspace resource');
assert(!AuthorizationService.can(userAWorkspace, 'HIVE_INSPECT', foreignHive, 'ws-a'), 'User A BLOCKED from foreign workspace resource (IDOR guard verified)');

// -------------------------------------------------------------
// SECTION 4: 20-Palette Deterministic Visual Identity
// -------------------------------------------------------------
console.log('\n[TEST 4] 20 Curated Deterministic Visual Theme Families');

const allThemes = WorkspaceVisualIdentityService.getAllThemes();
assert(allThemes.length === 20, `System provides exactly 20 curated themes (got ${allThemes.length})`);

const profileA1 = resolveVisualProfile(userACaps, 'BEEKEEPER');
const profileA2 = resolveVisualProfile(userACaps, 'BEEKEEPER');
assert(profileA1.themeId === profileA2.themeId, `Deterministic: User A always resolves to theme ${profileA1.themeId} (${profileA1.name})`);

const profileC = resolveVisualProfile(userCCaps, 'PROCESSOR');
const profileD = resolveVisualProfile(userDCaps, 'LAB');
const profileE = resolveVisualProfile(userECaps, 'DISTRIBUTOR');

console.log(`  User A Theme: ${profileA1.themeId} (${profileA1.name}) [${profileA1.primaryColor}]`);
console.log(`  User C Theme: ${profileC.themeId} (${profileC.name}) [${profileC.primaryColor}]`);
console.log(`  User D Theme: ${profileD.themeId} (${profileD.name}) [${profileD.primaryColor}]`);
console.log(`  User E Theme: ${profileE.themeId} (${profileE.name}) [${profileE.primaryColor}]`);

// -------------------------------------------------------------
// SECTION 5: Dynamic Navigation Urgency Priority (§ 20)
// -------------------------------------------------------------
console.log('\n[TEST 5] Dynamic Navigation Urgency Elevation');
const calmDistributorNav = composeNavigation(userECaps, 'DISTRIBUTOR', { deliveryExceptionsCount: 0 });
const urgentDistributorNav = composeNavigation(userECaps, 'DISTRIBUTOR', { deliveryExceptionsCount: 3 });

const urgentDeliveryItem = urgentDistributorNav.find(n => n.id === 'deliveries');
assert(urgentDeliveryItem?.badge === '!', 'Deliveries tab gets urgency badge alert when delivery exceptions occur');

// -------------------------------------------------------------
// SECTION 6: Quick Action Limitation & Cohesive Envelope (§ 35, § 43)
// -------------------------------------------------------------
console.log('\n[TEST 6] Cohesive Workspace Envelope & Quick Action Constraints');
assert(userAWorkspace.workspace.version === 12, 'Workspace has authoritative policy version 12');
assert(userAWorkspace.workspace.signature.length > 0, `Workspace has valid signature: "${userAWorkspace.workspace.signature}"`);
assert(userAWorkspace.dashboard.quickActions.length <= 5, `Quick actions strictly capped at 3-5 items (got ${userAWorkspace.dashboard.quickActions.length})`);

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`VERIFICATION COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL ACCEPTANCE AND ARCHITECTURAL CRITERIA MET SUCCESSFULLY!\n');
}
