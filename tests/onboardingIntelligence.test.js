import assert from 'node:assert/strict';
import { CAPABILITY_MAP } from '../src/services/capabilityRegistry.js';
import {
  OnboardingIntelligenceService as intelligence,
  createOnboardingSignal
} from '../src/services/onboardingIntelligenceService.js';

const interpret = text => intelligence.interpretAnswer(text).signals;
const candidateIds = text => intelligence.generateCapabilityCandidates(interpret(text)).candidates.map(candidate => candidate.capabilityId);

const beekeeper = candidateIds('I manage hives, inspect colonies, record observations and collect honey.');
for (const id of ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'BEE_OBSERVATION', 'HONEY_COLLECTION']) assert.ok(beekeeper.includes(id), `beekeeper scenario includes ${id}`);
const beekeeperResult = intelligence.evaluateSession({ signals: interpret('I manage hives, inspect colonies, record observations and collect honey.') });
assert.ok(beekeeperResult.designations.some(designation => designation.id === 'BEEKEEPER'));

const processor = candidateIds('I receive harvested material, record processing steps, capture evidence and complete batches.');
for (const id of ['BATCH_INTAKE', 'PROCESSING_MANAGEMENT', 'PROCESSING_STEP_RECORD', 'PROCESSING_EVIDENCE', 'PROCESSING_COMPLETION']) assert.ok(processor.includes(id), `processor scenario includes ${id}`);

const lab = candidateIds('I receive samples, run tests, record results and review results.');
for (const id of ['LAB_WORKSPACE', 'SAMPLE_INTAKE', 'TEST_EXECUTION', 'TEST_RESULT_ENTRY', 'RESULT_REVIEW']) assert.ok(lab.includes(id), `lab scenario includes ${id}`);

const dispatch = candidateIds('I prepare shipments, scan package QR codes and track deliveries.');
for (const id of ['DISPATCH_PLANNING', 'PACKAGE_QR_VALIDATE', 'DELIVERY_TRACKING']) assert.ok(dispatch.includes(id), `dispatch scenario includes ${id}`);

const multiDomain = candidateIds('I manage my own hives and also process the honey at our facility.');
assert.ok(multiDomain.includes('HIVE_MANAGEMENT'));
assert.ok(multiDomain.includes('PROCESSING_MANAGEMENT'));
const multiResult = intelligence.evaluateSession({ signals: interpret('I manage hives, inspect colonies, collect honey, receive harvested material and record processing steps.') });
assert.ok(multiResult.designations.some(designation => designation.id === 'BEEKEEPER'));
assert.ok(multiResult.designations.some(designation => designation.id === 'PROCESSOR'));

const inspectorResult = intelligence.evaluateSession({ signals: interpret('I inspect field records, verify traceability and audit records.') });
assert.equal(inspectorResult.designations.find(designation => designation.id === 'INSPECTOR')?.state, 'REQUIRES_VERIFICATION');
assert.ok(inspectorResult.verificationRequired.includes('RECORD_AUDITING'));

const supervisorResult = intelligence.evaluateSession({ signals: interpret('I supervise operators and review workflow records.') });
assert.ok(supervisorResult.candidateCapabilities.includes('TEAM_SUPERVISION'));
assert.ok(supervisorResult.verificationRequired.includes('RECORD_AUDITING'));
assert.ok(supervisorResult.designations.some(designation => designation.id === 'FACILITY_MANAGER'));
assert.ok(supervisorResult.designations.every(designation => !('score' in designation) && !('fitScore' in designation)));

const broadHoney = intelligence.interpretAnswer('I work with honey.').signals;
assert.equal(intelligence.generateCapabilityCandidates(broadHoney).candidates.length, 0, 'broad context does not imply operational capabilities');
assert.equal(intelligence.generateFollowUpQuestion({ signals: broadHoney }).id, 'clarify_honey_work');

const conflicting = intelligence.interpretAnswer('I never perform testing, but I run laboratory tests.');
assert.equal(conflicting.contradictions[0]?.capability, 'TEST_EXECUTION');
assert.equal(intelligence.evaluateSession({ signals: conflicting.signals }).state, 'CLARIFICATION_REQUIRED');

const correctionSignals = intelligence.interpretAnswer('Actually I only review test results.').signals;
const corrected = intelligence.generateCapabilityCandidates(correctionSignals).candidates.map(candidate => candidate.capabilityId);
assert.ok(corrected.includes('RESULT_REVIEW'));
assert.ok(!corrected.includes('TEST_EXECUTION'), 'review-only correction does not retain test execution');

const adminSignals = interpret('I am the administrator and manage users.');
const adminCandidates = intelligence.generateCapabilityCandidates(adminSignals).candidates;
assert.deepEqual(adminCandidates, [], 'natural language cannot infer system-only authority');
assert.ok(['USER_MANAGE', 'KEYS_REVOKE', 'LEDGER_AUDIT'].every(id => CAPABILITY_MAP.get(id).capabilityClass === 'SYSTEM_ONLY' || CAPABILITY_MAP.get(id).capabilityClass === 'PRIVILEGED'));

const auditSignal = createOnboardingSignal({ category: 'ACTION', value: 'RECORD_AUDITING' });
const auditCandidate = intelligence.generateCapabilityCandidates([auditSignal]).candidates.find(candidate => candidate.capabilityId === 'RECORD_AUDITING');
assert.equal(auditCandidate.status, 'VERIFICATION_REQUIRED', 'high-risk capabilities are candidates pending verification');

const decision = interpret('I decide whether to accept or reject incoming batches.');
assert.equal(intelligence.generateCapabilityCandidates(decision).candidates.length, 0, 'decision statements alone do not grant capabilities');

console.log('Onboarding intelligence tests passed.');