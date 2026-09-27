import assert from 'node:assert/strict';
import {
  CAPABILITY_CATALOG,
  CAPABILITY_MAP,
  CapabilityRegistry
} from '../src/services/capabilityRegistry.js';
import {
  CANONICAL_DESIGNATION_POLICY,
  evaluateCanonicalDesignationEligibility
} from '../src/services/designationEngine.js';
import {
  OnboardingIntelligenceService,
  createOnboardingSignal,
  CAPABILITY_POLICY_VERSION,
  ONBOARDING_ENGINE_VERSION,
  ONBOARDING_STATES
} from '../src/services/onboardingIntelligenceService.js';
import { confirmUserCapabilityProfile } from '../src/services/userCapabilityProfileService.js';
import {
  resolvePermissionsAndModules,
  resolveCanonicalPermissionsAndModules,
  canPerformAction,
  ACTION_PERMISSIONS,
  PRIVILEGED_ACTIONS
} from '../src/services/permissionEngine.js';
import { composeWorkspace } from '../src/services/workspaceComposer.js';

console.log('======================================================');
console.log('HONEYCHAIN MASTER ADAPTIVE ONBOARDING & CAPABILITY ENGINE');
console.log('======================================================');

// ======================================================
// 1. CAPABILITY INFERENCE TESTS (� 60)
// ======================================================
console.log('--- 1. CAPABILITY INFERENCE TESTS ---');

// 1.1 Direct Capability
const sigDirect = createOnboardingSignal({
  category: 'ACTION',
  value: 'HIVE_MANAGEMENT',
  source: 'DIRECT_USER_SIGNAL'
});
const candDirect = OnboardingIntelligenceService.generateCapabilityCandidates([sigDirect]);
assert.ok(candDirect.candidates.some(c => c.capabilityId === 'HIVE_MANAGEMENT'));
assert.equal(candDirect.candidates.find(c => c.capabilityId === 'HIVE_MANAGEMENT').source, 'DIRECT_USER_SIGNAL');
console.log('  ? PASS: Direct Capability inferred cleanly with DIRECT_USER_SIGNAL');

// 1.2 Implied / Dependency Capability
const sigScan = createOnboardingSignal({
  category: 'ACTION',
  value: 'BEE_HEALTH_SCAN',
  source: 'DIRECT_USER_SIGNAL'
});
const candScan = OnboardingIntelligenceService.generateCapabilityCandidates([sigScan]);
assert.ok(candScan.candidates.some(c => c.capabilityId === 'BEE_HEALTH_SCAN'));
assert.ok(candScan.candidates.some(c => c.capabilityId === 'HIVE_INSPECTION'));
assert.ok(candScan.candidates.some(c => c.capabilityId === 'HIVE_MANAGEMENT'));
const depCand = candScan.candidates.find(c => c.capabilityId === 'HIVE_MANAGEMENT');
assert.equal(depCand.source, 'DEPENDENCY');
console.log('  ? PASS: Implied Capability resolved transitively via Dependency Graph');

// 1.3 Contradiction Detection
const interpContradiction = OnboardingIntelligenceService.interpretAnswer(
  'I never perform laboratory testing. I execute laboratory tests on samples.'
);
assert.ok(interpContradiction.contradictions.length > 0);
assert.equal(interpContradiction.contradictions[0].capability, 'TEST_EXECUTION');
const clarificationQ = OnboardingIntelligenceService.generateFollowUpQuestion({
  signals: interpContradiction.signals,
  contradictions: interpContradiction.contradictions
});
assert.ok(clarificationQ);
assert.ok(clarificationQ.title.includes('Just to clarify'));
console.log('  ? PASS: Contradiction detected and clarification follow-up generated');

// 1.4 Ambiguity Detection
const sigVagueHoney = createOnboardingSignal({
  category: 'WORK_DOMAIN',
  value: 'HONEY',
  source: 'DIRECT_USER_SIGNAL'
});
const ambiguities = OnboardingIntelligenceService.detectAmbiguity([sigVagueHoney]);
assert.ok(ambiguities.includes('HONEY'));
const ambQ = OnboardingIntelligenceService.generateFollowUpQuestion({
  signals: [sigVagueHoney]
});
assert.ok(ambQ);
assert.equal(ambQ.id, 'clarify_honey_work');
console.log('  ? PASS: Ambiguous domain detected and targeted question generated');

// 1.5 Multi-Capability Natural Language
const interpMulti = OnboardingIntelligenceService.interpretAnswer(
  'I inspect hives, record observations, and collect honey.'
);
const multiActions = interpMulti.signals.filter(s => s.category === 'ACTION').map(s => s.value);
assert.ok(multiActions.includes('HIVE_INSPECTION'));
assert.ok(multiActions.includes('BEE_OBSERVATION'));
assert.ok(multiActions.includes('HONEY_COLLECTION'));
console.log('  ? PASS: Multi-capability natural language parsed into granular action signals');

// 1.6 User Correction
const initialSignals = OnboardingIntelligenceService.interpretAnswer('I run laboratory tests').signals;
const correctionSignals = OnboardingIntelligenceService.interpretAnswer('Actually I only review test results.').signals;
const mergedSignals = [...initialSignals, ...correctionSignals];
const evalAfterCorrection = OnboardingIntelligenceService.evaluateSession({ signals: mergedSignals });
assert.ok(evalAfterCorrection.candidateCapabilities.includes('RESULT_REVIEW'));
assert.ok(!evalAfterCorrection.candidateCapabilities.includes('TEST_EXECUTION'));
console.log('  ? PASS: User correction removes negated action and recalculates candidates');

// ======================================================
// 2. DESIGNATION INFERENCE & MULTI-DESIGNATION (� 60)
// ======================================================
console.log('');
console.log('--- 2. DESIGNATION INFERENCE & ELIGIBILITY ---');

// 2.1 Beekeeper
const desigBeekeeper = evaluateCanonicalDesignationEligibility(['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION']);
assert.ok(desigBeekeeper.suggestions.some(s => s.designationId === 'BEEKEEPER' && s.eligibilityState === 'STRONG_MATCH'));
console.log('  ? PASS: Beekeeper designation inferred cleanly as STRONG_MATCH');

// 2.2 Processor
const desigProcessor = evaluateCanonicalDesignationEligibility(['PROCESSING_MANAGEMENT', 'BATCH_INTAKE', 'PROCESSING_STEP_RECORD']);
assert.ok(desigProcessor.suggestions.some(s => s.designationId === 'PROCESSOR' && s.eligibilityState === 'STRONG_MATCH'));
console.log('  ? PASS: Processor designation inferred cleanly as STRONG_MATCH');

// 2.3 Lab Specialist
const desigLab = evaluateCanonicalDesignationEligibility(['LAB_WORKSPACE', 'SAMPLE_INTAKE', 'TEST_EXECUTION', 'RESULT_REVIEW']);
assert.ok(desigLab.suggestions.some(s => s.designationId === 'LAB_SPECIALIST' && s.eligibilityState === 'STRONG_MATCH'));
console.log('  ? PASS: Lab Specialist designation inferred cleanly as STRONG_MATCH');

// 2.4 Distributor
const desigDist = evaluateCanonicalDesignationEligibility(['DISPATCH_PLANNING', 'PACKAGE_QR_VALIDATE', 'DELIVERY_TRACKING', 'SHIPMENT_CREATE']);
assert.ok(desigDist.suggestions.some(s => s.designationId === 'DISTRIBUTOR' && s.eligibilityState === 'STRONG_MATCH'));
console.log('  ? PASS: Distributor designation inferred cleanly as STRONG_MATCH');

// 2.5 Field Inspector (Verification Required)
const desigInsp = evaluateCanonicalDesignationEligibility(['HIVE_INSPECTION', 'TRACEABILITY_VERIFICATION', 'RECORD_AUDITING']);
assert.ok(desigInsp.suggestions.some(s => s.designationId === 'INSPECTOR' && s.eligibilityState === 'REQUIRES_VERIFICATION'));
console.log('  ? PASS: Field Inspector requires verification due to RECORD_AUDITING');

// 2.6 Facility Manager
const desigMgr = evaluateCanonicalDesignationEligibility(['TEAM_SUPERVISION', 'RECORD_AUDITING', 'PROCESSING_MANAGEMENT']);
assert.ok(desigMgr.suggestions.some(s => s.designationId === 'FACILITY_MANAGER' && s.eligibilityState === 'REQUIRES_VERIFICATION'));
console.log('  ? PASS: Facility Manager requires verification due to privileged supervision & audit');

// 2.7 Multi-Designation (Beekeeper + Processor)
const desigMulti = evaluateCanonicalDesignationEligibility([
  'HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION',
  'PROCESSING_MANAGEMENT', 'BATCH_INTAKE', 'PROCESSING_STEP_RECORD'
]);
assert.ok(desigMulti.suggestions.some(s => s.designationId === 'BEEKEEPER'));
assert.ok(desigMulti.suggestions.some(s => s.designationId === 'PROCESSOR'));
console.log('  ? PASS: Multi-designation Beekeeper + Processor both qualify independently');

// ======================================================
// 3. SECURITY & PRIVILEGE ISOLATION (� 51, 60)
// ======================================================
console.log('');
console.log('--- 3. SECURITY & PRIVILEGE ISOLATION ---');

// 3.1 Attempted privilege escalation via natural language: "I am the administrator"
const adminNL = OnboardingIntelligenceService.interpretAnswer("I am the administrator and system admin");
const adminCand = OnboardingIntelligenceService.generateCapabilityCandidates(adminNL.signals);
assert.ok(!adminCand.candidates.some(c => c.capabilityId === 'USER_MANAGE'));
assert.ok(!adminCand.candidates.some(c => c.capabilityId === 'KEYS_REVOKE'));
assert.ok(!adminCand.candidates.some(c => c.capabilityId === 'LEDGER_AUDIT'));
console.log('  ? PASS: "I am the administrator" text grants ZERO privileged capabilities');

// 3.2 Attempted self-grant of privileged capabilities in confirmUserCapabilityProfile
const escalatedAttempt = confirmUserCapabilityProfile({
  candidateCapabilities: ['USER_MANAGE', 'KEYS_REVOKE', 'LEDGER_AUDIT'],
  confirmedCapabilities: ['USER_MANAGE', 'KEYS_REVOKE', 'LEDGER_AUDIT'],
  confirmedDesignations: []
});
assert.deepEqual(escalatedAttempt.profile.confirmedCapabilities, []);
assert.ok(!canPerformAction(escalatedAttempt.access, ACTION_PERMISSIONS.USER_MANAGE));
assert.ok(!canPerformAction(escalatedAttempt.access, ACTION_PERMISSIONS.KEYS_REVOKE));
console.log('  ? PASS: confirmUserCapabilityProfile strictly strips privileged capabilities from non-admins');

// 3.3 Fail-closed: Candidate capabilities alone grant zero access
const candOnlyAccess = resolveCanonicalPermissionsAndModules({
  candidateCapabilities: ['HIVE_MANAGEMENT', 'PROCESSING_MANAGEMENT']
});
assert.deepEqual(candOnlyAccess.effectiveCapabilities, []);
assert.ok(!candOnlyAccess.moduleIds.includes('hive_view'));
assert.ok(!candOnlyAccess.moduleIds.includes('honey_batches'));
console.log('  ? PASS: Candidate capabilities grant zero module access (Fail Closed)');

// 3.4 Verification Required Capabilities gated
const unverifiedLabAccess = resolveCanonicalPermissionsAndModules({
  confirmedCapabilities: ['LAB_INSPECTION']
});
assert.ok(unverifiedLabAccess.verificationPending.includes('LAB_INSPECTION'));
assert.ok(!unverifiedLabAccess.moduleIds.includes('lab_records'));
console.log('  ? PASS: Unverified LAB_INSPECTION remains pending and blocks module activation');

// ======================================================
// 4. GOLDEN PATH SCENARIOS A - G (� 61)
// ======================================================
console.log('');
console.log('--- 4. GOLDEN PATH END-TO-END SCENARIOS (A-G) ---');

// Scenario A � Beekeeper
const scA_text = "I manage around 30 hives and inspect them weekly. I write field observations and collect honey.";
const scA_interp = OnboardingIntelligenceService.interpretAnswer(scA_text);
const scA_cands = OnboardingIntelligenceService.generateCapabilityCandidates(scA_interp.signals).candidates.map(c => c.capabilityId);
assert.ok(scA_cands.includes('HIVE_MANAGEMENT'));
assert.ok(scA_cands.includes('HIVE_INSPECTION'));
assert.ok(scA_cands.includes('BEE_OBSERVATION'));
assert.ok(scA_cands.includes('HONEY_COLLECTION'));
const scA_desigs = evaluateCanonicalDesignationEligibility(scA_cands);
assert.ok(scA_desigs.suggestions.some(s => s.designationId === 'BEEKEEPER'));
const scA_confirm = confirmUserCapabilityProfile({
  candidateCapabilities: scA_cands,
  confirmedCapabilities: scA_cands,
  candidateDesignations: ['BEEKEEPER'],
  confirmedDesignations: ['BEEKEEPER'],
  sources: scA_cands.map(id => ({ capabilityId: id, source: 'DIRECT_USER_SIGNAL' }))
});
assert.ok(scA_confirm.access.moduleIds.includes('hive_view'));
assert.ok(scA_confirm.access.moduleIds.includes('hive_inspection'));
assert.ok(scA_confirm.access.moduleIds.includes('honey_collection'));
console.log('  ? PASS: Scenario A (Beekeeper) completes full chain to authoritative access');

// Scenario B � Processor
const scB_text = "I receive harvested material, record processing steps, capture evidence and complete batches.";
const scB_interp = OnboardingIntelligenceService.interpretAnswer(scB_text);
const scB_cands = OnboardingIntelligenceService.generateCapabilityCandidates(scB_interp.signals).candidates.map(c => c.capabilityId);
assert.ok(scB_cands.includes('BATCH_INTAKE'));
assert.ok(scB_cands.includes('PROCESSING_STEP_RECORD'));
assert.ok(scB_cands.includes('PROCESSING_EVIDENCE'));
assert.ok(scB_cands.includes('PROCESSING_COMPLETION'));
assert.ok(scB_cands.includes('PROCESSING_MANAGEMENT')); // Implied dependency
const scB_desigs = evaluateCanonicalDesignationEligibility(scB_cands);
assert.ok(scB_desigs.suggestions.some(s => s.designationId === 'PROCESSOR'));
const scB_confirm = confirmUserCapabilityProfile({
  candidateCapabilities: scB_cands,
  confirmedCapabilities: scB_cands,
  candidateDesignations: ['PROCESSOR'],
  confirmedDesignations: ['PROCESSOR'],
  sources: scB_cands.map(id => ({ capabilityId: id, source: 'DIRECT_USER_SIGNAL' }))
});
assert.ok(scB_confirm.access.moduleIds.includes('honey_batches'));
assert.ok(scB_confirm.access.moduleIds.includes('processing_records'));
console.log('  ? PASS: Scenario B (Processor) completes full chain to authoritative access');

// Scenario C � Laboratory
const scC_text = "I receive samples, run tests, record results and review them.";
const scC_interp = OnboardingIntelligenceService.interpretAnswer(scC_text);
const scC_cands = OnboardingIntelligenceService.generateCapabilityCandidates(scC_interp.signals).candidates.map(c => c.capabilityId);
assert.ok(scC_cands.includes('SAMPLE_INTAKE'));
assert.ok(scC_cands.includes('TEST_EXECUTION'));
assert.ok(scC_cands.includes('TEST_RESULT_ENTRY'));
assert.ok(scC_cands.includes('RESULT_REVIEW'));
assert.ok(scC_cands.includes('LAB_WORKSPACE')); // Implied dependency
const scC_desigs = evaluateCanonicalDesignationEligibility(scC_cands);
assert.ok(scC_desigs.suggestions.some(s => s.designationId === 'LAB_SPECIALIST'));
console.log('  ? PASS: Scenario C (Laboratory) resolves lab workspace and analytical chain');

// Scenario D � Dispatch
const scD_text = "I prepare shipments, scan package QR codes and track deliveries.";
const scD_interp = OnboardingIntelligenceService.interpretAnswer(scD_text);
const scD_cands = OnboardingIntelligenceService.generateCapabilityCandidates(scD_interp.signals).candidates.map(c => c.capabilityId);
assert.ok(scD_cands.includes('DISPATCH_PLANNING'));
assert.ok(scD_cands.includes('PACKAGE_QR_VALIDATE'));
assert.ok(scD_cands.includes('DELIVERY_TRACKING'));
const scD_desigs = evaluateCanonicalDesignationEligibility(scD_cands);
assert.ok(scD_desigs.suggestions.some(s => s.designationId === 'DISTRIBUTOR'));
console.log('  ? PASS: Scenario D (Dispatch) resolves fulfillment capabilities');

// Scenario E � Beekeeper + Processor
const scE_text = "I manage my own hives and also process the honey at our facility.";
const scE_interp = OnboardingIntelligenceService.interpretAnswer(scE_text);
const scE_cands = OnboardingIntelligenceService.generateCapabilityCandidates(scE_interp.signals).candidates.map(c => c.capabilityId);
assert.ok(scE_cands.includes('HIVE_MANAGEMENT'));
assert.ok(scE_cands.includes('PROCESSING_MANAGEMENT'));
const scE_desigs = evaluateCanonicalDesignationEligibility(scE_cands);
assert.ok(scE_desigs.suggestions.some(s => s.designationId === 'BEEKEEPER'));
assert.ok(scE_desigs.suggestions.some(s => s.designationId === 'PROCESSOR'));
const scE_workspace = composeWorkspace({
  capabilities: scE_cands,
  designations: ['BEEKEEPER', 'PROCESSOR']
});
assert.ok(Array.isArray(scE_workspace.navigation) && scE_workspace.navigation.length >= 3);
assert.ok(scE_workspace.dashboard.modules.some(m => m.category === 'FIELD'));
assert.ok(scE_workspace.dashboard.modules.some(m => m.category === 'PRODUCTION'));
console.log('  ? PASS: Scenario E (Multi-Domain) composes a unified workspace across both domains');

// Scenario F � Inspector
const scF_text = "I inspect field records, verify traceability and audit records.";
const scF_interp = OnboardingIntelligenceService.interpretAnswer(scF_text);
const scF_cands = OnboardingIntelligenceService.generateCapabilityCandidates(scF_interp.signals).candidates.map(c => c.capabilityId);
assert.ok(scF_cands.includes('TRACEABILITY_VERIFICATION'));
assert.ok(scF_cands.includes('RECORD_AUDITING'));
const scF_desigs = evaluateCanonicalDesignationEligibility(scF_cands);
assert.ok(scF_desigs.suggestions.some(s => s.designationId === 'INSPECTOR'));
console.log('  ? PASS: Scenario F (Inspector) converges to Field Inspector with verification guard');

// Scenario G � Supervisor
const scG_text = "I supervise operators and review workflow records.";
const scG_interp = OnboardingIntelligenceService.interpretAnswer(scG_text);
const scG_cands = OnboardingIntelligenceService.generateCapabilityCandidates(scG_interp.signals).candidates.map(c => c.capabilityId);
assert.ok(scG_cands.includes('TEAM_SUPERVISION'));
assert.ok(scG_cands.includes('RECORD_AUDITING'));
const scG_desigs = evaluateCanonicalDesignationEligibility(scG_cands);
assert.ok(scG_desigs.suggestions.some(s => s.designationId === 'FACILITY_MANAGER'));
console.log('  ? PASS: Scenario G (Supervisor) detects supervision & converges to Facility Manager');

console.log('');
console.log('======================================================');
console.log('ALL MASTER ADAPTIVE TESTS PASSED SUCCESSFULLY!');
console.log('======================================================');
