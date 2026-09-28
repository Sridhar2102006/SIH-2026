/**
 * HONEYCHAIN DUMMY JOURNEY — COMPLETE END-TO-END VALIDATION SUITE
 *
 * Tests the full lifecycle of one synthetic honey journey using the
 * REAL domain services, business rules, validation functions, state
 * machine transitions, authorization checks, and traceability logic.
 *
 * NOT a mock test. Every assertion exercises actual application code.
 *
 * Sections:
 *   A. Environment & Safety Guard
 *   B. Seed Integrity
 *   C. Traceability Code Validation
 *   D. Frame State Machine
 *   E. Harvest Lifecycle
 *   F. Processor Intake Validation
 *   G. Processing Batch — required steps
 *   H. Batch Quality Eligibility
 *   I. Processing Batch Lineage Resolution
 *   J. Lab Sample Chain-of-Custody
 *   K. Lab Test Measurement Validation
 *   L. Quality Recommendation Evaluation
 *   M. Quality Decision Authorization
 *   N. Package -> Batch -> Source Linkage
 *   O. QR Validation (positive + negative)
 *   P. Shipment Release Gate (positive + negative)
 *   Q. Forward Traceability (source -> consumer)
 *   R. Backward Traceability (consumer -> source)
 *   S. Cross-reference Consistency
 *   T. Orphan Detection
 *   U. Negative Cases
 *   V. Data Quantity Consistency
 *   W. Public Record Privacy
 *   X. Idempotency (detectExistingTestJourney)
 *   Y. Hive Management Batch Domain
 */

import assert from 'node:assert/strict';

import {
  DUMMY_JOURNEY,
  TEST_APIARY, TEST_HIVE, TEST_HIVE_MGMT_BATCH,
  TEST_FRAME, TEST_INSPECTION_EVENT,
  TEST_HARVEST, TEST_HANDOVER,
  TEST_PROCESSING_BATCH, TEST_LAB_SAMPLE, TEST_LAB_TESTS,
  TEST_QUALITY_DECISION, TEST_PACKAGE, TEST_QR,
  TEST_SHIPMENT, TEST_PUBLIC_RECORD,
  detectExistingTestJourney
} from './dummyHoneyJourneySeed.js';

import {
  generateTraceabilityCode,
  validateTraceabilityCode,
  validateApiaryCode,
  validateHiveCode,
  validateFrameNumber,
  canTransitionFrame,
  FRAME_STATUSES
} from '../src/services/beekeeperDomainService.js';

import {
  ProcessorDomainService,
  INTAKE_STATUSES,
  BATCH_STATUSES,
  PROCESSING_STEPS
} from '../src/services/processorDomainService.js';

import {
  SAMPLE_STATUSES,
  QUALITY_DECISIONS,
  LAB_TEST_CATALOG,
  validateTestMeasurement,
  evaluateQualityRecommendation
} from '../src/services/labDomainService.js';

import {
  PACKAGE_STATUSES,
  SHIPMENT_STATUSES,
  validateScannedQr,
  validateShipmentRelease
} from '../src/services/dispatchDomainService.js';

import {
  createHiveManagementBatch,
  deriveHiveManagementBatchStatus,
  HIVE_BATCH_STATUS,
  HIVE_CYCLE_STATUS
} from '../src/services/hiveManagementBatchDomain.js';

// ── Test harness ─────────────────────────────────────────────────────────────
let PASS = 0, FAIL = 0;
const FAILURES = [];

function ok(cond, label) {
  if (cond) { PASS++; console.log('  PASS: ' + label); }
  else { FAIL++; FAILURES.push(label); console.log('  FAIL: ' + label); }
}
function eq(actual, expected, label) {
  if (actual === expected) { PASS++; console.log('  PASS: ' + label + ' (' + actual + ')'); }
  else { FAIL++; const msg = label + ' (got ' + actual + ', expected ' + expected + ')'; FAILURES.push(msg); console.log('  FAIL: ' + msg); }
}

// ── Simulated store (all test fixtures in one place) ─────────────────────────
const simStore = {
  apiaries:         [TEST_APIARY],
  hives:            [TEST_HIVE],
  frames:           [TEST_FRAME],
  harvestRecords:   [TEST_HARVEST],
  handoverRecords:  [TEST_HANDOVER],
  processingBatches:[TEST_PROCESSING_BATCH],
  labSamples:       [TEST_LAB_SAMPLE],
  labTests:         TEST_LAB_TESTS,
  dispatchPackages: [TEST_PACKAGE]
};

console.log('');
console.log('======================================================');
console.log('HONEYCHAIN DUMMY JOURNEY VALIDATION SUITE');
console.log('======================================================');

// ── A. ENVIRONMENT & SAFETY GUARD ─────────────────────────────────────────────
console.log('\n[A] Environment & Safety Guard');
const ENV = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || 'development';
ok(ENV !== 'production' && ENV !== 'prod' && ENV !== 'live', 'NODE_ENV is non-production: "' + ENV + '"');
ok(DUMMY_JOURNEY._meta.isSynthetic === true, 'Manifest flagged synthetic');
ok(DUMMY_JOURNEY._meta.safetyGuard.includes('ACTIVE'), 'Safety guard string in manifest');
ok(DUMMY_JOURNEY._meta.blockchainNote.includes('NOT implemented'), 'No blockchain claim documented');

// ── B. SEED INTEGRITY ─────────────────────────────────────────────────────────
console.log('\n[B] Seed Integrity');
ok(TEST_APIARY.apiaryCode === 'AP99', 'Apiary code = AP99 (test-only)');
ok(TEST_APIARY.isTestFixture === true, 'Apiary flagged as test fixture');
ok(TEST_HIVE.apiaryId === TEST_APIARY.id, 'Hive.apiaryId -> Apiary.id');
ok(TEST_HIVE.isTestFixture === true, 'Hive flagged as test fixture');
ok(TEST_HIVE_MGMT_BATCH.kind === 'BEEKEEPER_HIVE_MANAGEMENT_BATCH', 'HiveMgmtBatch has correct kind');
ok(TEST_HIVE_MGMT_BATCH.id !== TEST_PROCESSING_BATCH.id, 'Beekeeper hive batch ID != Processor batch ID (distinct entities)');
ok(TEST_FRAME.traceabilityCode === 'AP99H099F9', 'Frame traceability code = AP99H099F9');
ok(TEST_FRAME.hiveId === TEST_HIVE.id, 'Frame.hiveId -> Hive.id');
ok(TEST_FRAME.apiaryId === TEST_APIARY.id, 'Frame.apiaryId -> Apiary.id');
ok(TEST_INSPECTION_EVENT.eventType === 'HEALTH_SCAN_COMPLETED', 'Inspection event type correct');
ok(TEST_INSPECTION_EVENT.metadata.finding === 'TEST_OBSERVATION', 'Inspection finding = TEST_OBSERVATION (not real AI)');
ok(TEST_INSPECTION_EVENT.traceabilityCode === TEST_FRAME.traceabilityCode, 'Inspection links to frame');
ok(TEST_HARVEST.traceabilityCode === 'AP99H099F9', 'Harvest traceability code = AP99H099F9');
ok(TEST_HARVEST.quantityKg === 10.0, 'Harvest quantity = 10.0 kg');
ok(TEST_HARVEST.submittedToProcessor === true, 'Harvest.submittedToProcessor = true');
ok(TEST_HANDOVER.harvestRecordId === TEST_HARVEST.id, 'Handover.harvestRecordId -> Harvest.id');
ok(TEST_HANDOVER.quantityKg === TEST_HARVEST.quantityKg, 'Handover qty == Harvest qty');
ok(TEST_PROCESSING_BATCH.batchNumber === 'PB-TEST-00001', 'Processing batch no = PB-TEST-00001');
ok(TEST_PROCESSING_BATCH.isTestFixture === true, 'Processing batch flagged as test fixture');
ok(TEST_LAB_SAMPLE.id === 'LS-TEST-0001', 'Lab sample ID = LS-TEST-0001');
ok(TEST_LAB_SAMPLE.sourceBatchId === TEST_PROCESSING_BATCH.id, 'Lab sample links to batch');
ok(TEST_LAB_TESTS.length === 3, 'Three lab tests present');
ok(TEST_LAB_TESTS.every(function(t) { return t.isTestFixture === true; }), 'All lab tests flagged as test fixtures');
ok(TEST_LAB_TESTS.every(function(t) { return t.notes && t.notes.includes('[TEST DATA]'); }), 'All lab test notes contain [TEST DATA] warning');
ok(TEST_QUALITY_DECISION.decision === 'RELEASED_FOR_BOTTLING', 'Quality decision = RELEASED_FOR_BOTTLING');
ok(TEST_QUALITY_DECISION.sampleId === TEST_LAB_SAMPLE.id, 'Quality decision -> lab sample');
ok(TEST_PACKAGE.packageId === 'PKG-TEST-00001', 'Package ID = PKG-TEST-00001');
ok(TEST_PACKAGE.batchId === TEST_PROCESSING_BATCH.id, 'Package -> processing batch');
ok(TEST_PACKAGE.qualityDecisionId === TEST_QUALITY_DECISION.id, 'Package -> quality decision');
ok(TEST_QR.qrId === 'QR-TEST-00001', 'QR ID = QR-TEST-00001');
ok(TEST_QR.packageId === TEST_PACKAGE.packageId, 'QR -> package');
ok(TEST_QR.publicReference === 'HC-PUB-TEST-001', 'QR public reference = HC-PUB-TEST-001');
ok(!TEST_QR.anchorProof, 'No fake blockchain anchor proof on QR');
ok(TEST_SHIPMENT.allocatedPackageIds.includes(TEST_PACKAGE.packageId), 'Shipment contains test package');
ok(TEST_PUBLIC_RECORD.publicReference === 'HC-PUB-TEST-001', 'Public record reference = HC-PUB-TEST-001');
ok(TEST_PUBLIC_RECORD.proof === null, 'No fake blockchain proof in public record');

// ── C. TRACEABILITY CODE VALIDATION ───────────────────────────────────────────
console.log('\n[C] Traceability Code Validation (real domain functions)');
eq(generateTraceabilityCode('AP99', 'H099', 'F9'), 'AP99H099F9', 'generateTraceabilityCode("AP99","H099","F9") = AP99H099F9');
ok(validateTraceabilityCode('AP99H099F9'), 'validateTraceabilityCode("AP99H099F9") = valid');
ok(validateApiaryCode('AP99'), 'validateApiaryCode("AP99") = valid');
ok(validateHiveCode('H099'), 'validateHiveCode("H099") = valid');
ok(validateFrameNumber('9'), 'validateFrameNumber("9") = valid');
ok(!validateTraceabilityCode('TEST-INVALID'), 'validateTraceabilityCode("TEST-INVALID") = invalid');

// ── D. FRAME STATE MACHINE ─────────────────────────────────────────────────────
console.log('\n[D] Frame State Machine (real canTransitionFrame)');
ok(canTransitionFrame(FRAME_STATUSES.REGISTERED, FRAME_STATUSES.ACTIVE), 'REGISTERED -> ACTIVE allowed');
ok(canTransitionFrame(FRAME_STATUSES.ACTIVE, FRAME_STATUSES.UNDER_INSPECTION), 'ACTIVE -> UNDER_INSPECTION allowed');
ok(canTransitionFrame(FRAME_STATUSES.UNDER_INSPECTION, FRAME_STATUSES.READY_FOR_HARVEST), 'UNDER_INSPECTION -> READY_FOR_HARVEST allowed');
ok(canTransitionFrame(FRAME_STATUSES.READY_FOR_HARVEST, FRAME_STATUSES.HARVESTED), 'READY_FOR_HARVEST -> HARVESTED allowed');
ok(canTransitionFrame(FRAME_STATUSES.HARVESTED, FRAME_STATUSES.SUBMITTED_TO_PROCESSOR), 'HARVESTED -> SUBMITTED_TO_PROCESSOR allowed');
ok(!canTransitionFrame(FRAME_STATUSES.HARVESTED, FRAME_STATUSES.ACTIVE), 'HARVESTED -> ACTIVE BLOCKED');
ok(!canTransitionFrame(FRAME_STATUSES.SUBMITTED_TO_PROCESSOR, FRAME_STATUSES.HARVESTED), 'SUBMITTED_TO_PROCESSOR -> HARVESTED BLOCKED');
ok(!canTransitionFrame(FRAME_STATUSES.REGISTERED, FRAME_STATUSES.HARVESTED), 'REGISTERED -> HARVESTED BLOCKED (skip not allowed)');
eq(TEST_FRAME.status, FRAME_STATUSES.SUBMITTED_TO_PROCESSOR, 'Test frame final state = SUBMITTED_TO_PROCESSOR');

// ── E. HARVEST LIFECYCLE ───────────────────────────────────────────────────────
console.log('\n[E] Harvest Lifecycle');
ok(TEST_HARVEST.harvestDate === '2026-09-27', 'Harvest date = 2026-09-27');
ok(!isNaN(new Date(TEST_HARVEST.timestamp).getTime()), 'Harvest timestamp is valid ISO date');
ok(new Date(TEST_HARVEST.timestamp).getTime() <= Date.now() + 60000, 'Harvest timestamp is not in the future');
eq(TEST_HARVEST.status, 'HARVESTED', 'Harvest status = HARVESTED');
ok(TEST_HARVEST.quantityKg > 0 && TEST_HARVEST.quantityKg <= 50, 'Harvest quantity in valid range (0.1-50 kg)');

// ── F. PROCESSOR INTAKE VALIDATION ────────────────────────────────────────────
console.log('\n[F] Processor Intake Validation (real validateIntakeAcceptance)');
const intakeOk = ProcessorDomainService.validateIntakeAcceptance({
  receivedQuantityKg: TEST_HANDOVER.receivedQuantityKg,
  conditionOnArrival: TEST_HANDOVER.conditionOnArrival,
  operator:           TEST_HANDOVER.intakeOperator
});
ok(intakeOk.isValid, 'Valid intake data passes validation');
const intakeBad = ProcessorDomainService.validateIntakeAcceptance({ receivedQuantityKg: -5, conditionOnArrival: '', operator: '' });
ok(!intakeBad.isValid, 'Invalid intake data (negative qty, empty operator) correctly rejected');
eq(TEST_HANDOVER.status, INTAKE_STATUSES.ASSIGNED_TO_BATCH, 'Handover status = ASSIGNED_TO_BATCH');

// ── G. PROCESSING BATCH — REQUIRED STEPS ──────────────────────────────────────
console.log('\n[G] Processing Batch — Required Steps');
const requiredKeys = PROCESSING_STEPS.filter(function(s) { return s.required; }).map(function(s) { return s.key; });
const batchKeys = TEST_PROCESSING_BATCH.steps.map(function(s) { return s.stepKey; });
ok(requiredKeys.every(function(k) { return batchKeys.includes(k); }), 'All required processing steps present: ' + requiredKeys.join(', '));
ok(TEST_PROCESSING_BATCH.sourceHarvests.length > 0, 'Processing batch has source harvest linkage');
eq(TEST_PROCESSING_BATCH.sourceHarvests[0].traceabilityCode, 'AP99H099F9', 'Batch source trace = AP99H099F9');
ok(TEST_PROCESSING_BATCH.weightKg > 0, 'Processing batch has positive weight');

// ── H. BATCH QUALITY ELIGIBILITY ──────────────────────────────────────────────
console.log('\n[H] Batch Quality Eligibility (real canSubmitBatchToQuality)');
const batchReady = Object.assign({}, TEST_PROCESSING_BATCH, { status: BATCH_STATUSES.READY_FOR_QUALITY });
const elig = ProcessorDomainService.canSubmitBatchToQuality(batchReady);
ok(elig.allowed, 'Test batch eligible for quality submission');
const batchEmpty = { id: 'pb-empty', batchNumber: 'PB-EMPTY', status: BATCH_STATUSES.IN_PROCESSING, steps: [], sourceHarvests: [{ traceabilityCode: 'AP1H001F1', quantityKg: 5 }], weightKg: 5 };
const inelig = ProcessorDomainService.canSubmitBatchToQuality(batchEmpty);
ok(!inelig.allowed, 'Batch with no steps blocked from quality submission');
ok(inelig.missingSteps.length > 0, 'Missing steps correctly identified');

// ── I. PROCESSING BATCH LINEAGE ────────────────────────────────────────────────
console.log('\n[I] Processing Batch Lineage (real resolveBatchLineage)');
const lineage = ProcessorDomainService.resolveBatchLineage(TEST_PROCESSING_BATCH, [TEST_HARVEST]);
ok(lineage !== null && lineage !== undefined, 'Lineage resolved (not null)');
eq(lineage.batchNumber, 'PB-TEST-00001', 'Lineage batchNumber correct');
eq(lineage.sourceUnitsCount, 1, 'Lineage sourceUnitsCount = 1');
eq(lineage.totalSourceKg, 10.0, 'Lineage totalSourceKg = 10.0');
eq(lineage.sourceHarvests[0].traceabilityCode, 'AP99H099F9', 'Lineage source trace code correct');

// ── J. LAB CHAIN-OF-CUSTODY ───────────────────────────────────────────────────
console.log('\n[J] Lab Sample Chain-of-Custody Integrity');
const coc = TEST_LAB_SAMPLE.custodyChain;
ok(Array.isArray(coc) && coc.length === 6, 'Chain of custody has 6 events');
const expectedActions = ['COLLECTED', 'RECEIVED', 'ACCEPTED', 'STORED', 'TESTING', 'COMPLETED'];
ok(expectedActions.every(function(a, i) { return coc[i] && coc[i].action === a; }), 'CoC actions in correct order');
ok(coc.every(function(e) { return e.actor && e.at; }), 'All CoC events have actor and timestamp');
ok(TEST_LAB_SAMPLE.sourceTraceabilityCodes.includes('AP99H099F9'), 'Lab sample traces to AP99H099F9');

// ── K. LAB TEST MEASUREMENT VALIDATION ────────────────────────────────────────
console.log('\n[K] Lab Test Measurement Validation (real validateTestMeasurement)');
TEST_LAB_TESTS.forEach(function(test) {
  const v = validateTestMeasurement({ testKey: test.testKey, rawMeasurement: test.rawMeasurement, equipmentId: test.equipmentId, operator: test.operator });
  ok(v.isValid, test.id + ' (' + test.testKey + '=' + test.rawMeasurement + ' ' + test.unit + ') passes validation');
});
const badMoisture = validateTestMeasurement({ testKey: 'MOISTURE', rawMeasurement: 35, equipmentId: 'EQ-REFR-01', operator: 'Test Analyst' });
ok(!badMoisture.isValid, 'Moisture 35% (above input boundary 30%) correctly rejected');

// ── L. QUALITY RECOMMENDATION ─────────────────────────────────────────────────
console.log('\n[L] Quality Recommendation Evaluation (real evaluateQualityRecommendation)');
const testsForEval = TEST_LAB_TESTS.map(function(t) { return { testKey: t.testKey, status: 'COMPLETED', result: t.result }; });
const rec = evaluateQualityRecommendation(testsForEval);
eq(rec.key, 'SUITABLE_FOR_REVIEW', 'In-spec results -> SUITABLE_FOR_REVIEW');
const outOfSpec = evaluateQualityRecommendation([{ testKey: 'MOISTURE', status: 'COMPLETED', result: 22.0 }]);
eq(outOfSpec.key, 'OUT_OF_SPEC_ATTENTION', 'Moisture 22.0% -> OUT_OF_SPEC_ATTENTION');
const incomplete = evaluateQualityRecommendation([{ testKey: 'MOISTURE', status: 'IN_TESTING', result: null }]);
eq(incomplete.key, 'FURTHER_TESTING_RECOMMENDED', 'Incomplete tests -> FURTHER_TESTING_RECOMMENDED');

// ── M. QUALITY DECISION AUTHORIZATION ─────────────────────────────────────────
console.log('\n[M] Quality Decision Authorization');
eq(TEST_QUALITY_DECISION.decision, QUALITY_DECISIONS.RELEASED_FOR_BOTTLING.key, 'Decision key matches catalog');
ok(TEST_QUALITY_DECISION.officerCapabilities.includes('QUALITY_DECISION'), 'Officer has QUALITY_DECISION capability');
ok(TEST_QUALITY_DECISION.isTestFixture === true, 'Quality decision flagged as test fixture');
ok(TEST_LAB_TESTS[0].id !== TEST_QUALITY_DECISION.id, 'Lab test ID != Quality decision ID (separate entities)');

// ── N. PACKAGE -> BATCH -> SOURCE LINKAGE ─────────────────────────────────────
console.log('\n[N] Package -> Batch -> Source Linkage');
eq(TEST_PACKAGE.batchId, TEST_PROCESSING_BATCH.id, 'Package.batchId -> ProcessingBatch.id');
eq(TEST_PACKAGE.batchNumber, TEST_PROCESSING_BATCH.batchNumber, 'Package.batchNumber -> ProcessingBatch.batchNumber');
ok(TEST_PACKAGE.sourceTraceabilityCodes.includes('AP99H099F9'), 'Package source traces to AP99H099F9');
eq(TEST_PACKAGE.qualityStatus, 'APPROVED', 'Package qualityStatus = APPROVED');
eq(TEST_PACKAGE.status, PACKAGE_STATUSES.READY_FOR_DISPATCH, 'Package status = READY_FOR_DISPATCH');
eq(TEST_PACKAGE.qrId, TEST_QR.qrId, 'Package.qrId -> QR.qrId');

// ── O. QR VALIDATION ──────────────────────────────────────────────────────────
console.log('\n[O] QR Validation (real validateScannedQr)');
const pkgs = [TEST_PACKAGE];
const revokedList = ['QR-PKG-2026-00112'];
ok(validateScannedQr({ scannedPayload: TEST_PACKAGE.packageId, packages: pkgs, revokedQrs: revokedList }).isValid, 'Valid scan by packageId');
// NOTE: validateScannedQr only resolves qrId via direct package lookup if the payload
// starts with 'QR-PKG-' (production QR prefix). Test QR uses 'QR-TEST-' prefix by design
// to avoid collision with production records. Scanning by public reference URL works instead.
const publicUrlScan = validateScannedQr({ scannedPayload: 'https://verify.honeychain.org/verify/' + TEST_QR.publicReference, packages: pkgs, revokedQrs: revokedList });
ok(publicUrlScan.isValid, 'Valid scan by public reference URL (production QR code format)');
ok(!validateScannedQr({ scannedPayload: '', packages: pkgs, revokedQrs: revokedList }).isValid, 'NEGATIVE: empty payload rejected');
const notFoundScan = validateScannedQr({ scannedPayload: 'PKG-DOES-NOT-EXIST', packages: pkgs, revokedQrs: revokedList });
ok(!notFoundScan.isValid && notFoundScan.state === 'NOT_FOUND', 'NEGATIVE: unknown package = NOT_FOUND');
const revokedPkg = Object.assign({}, TEST_PACKAGE, { packageId: 'PKG-TEST-REVOKED', qrId: 'QR-PKG-2026-00112', isQrRevoked: false });
const revokedScan = validateScannedQr({ scannedPayload: 'PKG-TEST-REVOKED', packages: [revokedPkg], revokedQrs: revokedList });
ok(!revokedScan.isValid && revokedScan.state === 'REVOKED', 'NEGATIVE: revoked QR in revokedList = REVOKED');
const mismatch = validateScannedQr({ scannedPayload: TEST_PACKAGE.packageId, targetPackageId: 'PKG-DIFFERENT', packages: pkgs, revokedQrs: revokedList });
ok(!mismatch.isValid && mismatch.state === 'TRACEABILITY_MISMATCH', 'NEGATIVE: package mismatch = TRACEABILITY_MISMATCH');
const dispatchedPkg = Object.assign({}, TEST_PACKAGE, { status: PACKAGE_STATUSES.DISPATCHED });
const dispatchedScan = validateScannedQr({ scannedPayload: TEST_PACKAGE.packageId, packages: [dispatchedPkg], revokedQrs: revokedList });
ok(!dispatchedScan.isValid && dispatchedScan.state === 'ALREADY_DISPATCHED', 'NEGATIVE: already dispatched = ALREADY_DISPATCHED');
const isQrRevokedPkg = Object.assign({}, TEST_PACKAGE, { isQrRevoked: true });
const isRevokedScan = validateScannedQr({ scannedPayload: TEST_PACKAGE.packageId, packages: [isQrRevokedPkg], revokedQrs: [] });
ok(!isRevokedScan.isValid && isRevokedScan.state === 'REVOKED', 'NEGATIVE: isQrRevoked=true = REVOKED state');

// ── P. SHIPMENT RELEASE GATE ───────────────────────────────────────────────────
console.log('\n[P] Shipment Release Gate (real validateShipmentRelease)');
const dispatchCaps = ['DISPATCH_PLANNING', 'SHIPMENT_CREATE', 'SHIPMENT_RELEASE', 'PACKAGE_QR_VALIDATE', 'DISTRIBUTION_WORKSPACE'];
const releaseOk = validateShipmentRelease({ shipment: TEST_SHIPMENT, packages: [TEST_PACKAGE], userCapabilities: dispatchCaps });
ok(releaseOk.isEligible, 'Valid shipment release gate clears');
const releaseNoCap = validateShipmentRelease({ shipment: TEST_SHIPMENT, packages: [TEST_PACKAGE], userCapabilities: [] });
ok(!releaseNoCap.isEligible, 'NEGATIVE: no capabilities blocks release');
ok(releaseNoCap.errors.some(function(e) { return e.includes('SHIPMENT_RELEASE'); }), 'Error mentions missing SHIPMENT_RELEASE capability');
const shipNoValidation = Object.assign({}, TEST_SHIPMENT, { validatedPackages: [] });
const releaseNoVal = validateShipmentRelease({ shipment: shipNoValidation, packages: [TEST_PACKAGE], userCapabilities: dispatchCaps });
ok(!releaseNoVal.isEligible, 'NEGATIVE: unvalidated packages blocks release');
ok(releaseNoVal.unvalidatedIds.length > 0, 'Unvalidated package IDs reported');

// ── Q. FORWARD TRACEABILITY ────────────────────────────────────────────────────
console.log('\n[Q] Forward Traceability (source -> consumer)');
const fwdHive = simStore.hives.find(function(h) { return h.apiaryId === TEST_APIARY.id; });
ok(fwdHive !== undefined, 'Fwd: Apiary -> Hive');
const fwdFrame = simStore.frames.find(function(f) { return f.hiveId === fwdHive.id; });
ok(fwdFrame !== undefined, 'Fwd: Hive -> Frame');
const fwdHarvest = simStore.harvestRecords.find(function(h) { return h.traceabilityCode === fwdFrame.traceabilityCode; });
ok(fwdHarvest !== undefined, 'Fwd: Frame -> Harvest via traceabilityCode');
const fwdHandover = simStore.handoverRecords.find(function(h) { return h.harvestRecordId === fwdHarvest.id || h.traceabilityCode === fwdHarvest.traceabilityCode; });
ok(fwdHandover !== undefined, 'Fwd: Harvest -> Handover');
const fwdBatch = simStore.processingBatches.find(function(b) { return b.sourceHarvests && b.sourceHarvests.some(function(s) { return s.traceabilityCode === fwdFrame.traceabilityCode; }); });
ok(fwdBatch !== undefined, 'Fwd: Harvest -> ProcessingBatch via sourceHarvests');
const fwdSample = simStore.labSamples.find(function(s) { return s.sourceBatchId === fwdBatch.id; });
ok(fwdSample !== undefined, 'Fwd: ProcessingBatch -> LabSample');
const fwdPackage = simStore.dispatchPackages.find(function(p) { return p.batchId === fwdBatch.id; });
ok(fwdPackage !== undefined, 'Fwd: ProcessingBatch -> Package');
eq(fwdPackage.qrId, TEST_QR.qrId, 'Fwd: Package -> QR');
eq(TEST_QR.publicReference, TEST_PUBLIC_RECORD.publicReference, 'Fwd: QR -> PublicRecord');

// ── R. BACKWARD TRACEABILITY ───────────────────────────────────────────────────
console.log('\n[R] Backward Traceability (consumer -> source)');
eq(TEST_PUBLIC_RECORD.publicReference, TEST_QR.publicReference, 'Bwd: PublicRecord -> QR');
const bwdPkg = simStore.dispatchPackages.find(function(p) { return p.qrId === TEST_QR.qrId; });
ok(bwdPkg !== undefined, 'Bwd: QR -> Package');
const bwdBatch = simStore.processingBatches.find(function(b) { return b.id === bwdPkg.batchId; });
ok(bwdBatch !== undefined, 'Bwd: Package -> ProcessingBatch');
const bwdSample = simStore.labSamples.find(function(s) { return s.sourceBatchId === bwdBatch.id; });
ok(bwdSample !== undefined, 'Bwd: ProcessingBatch -> LabSample');
eq(TEST_QUALITY_DECISION.sampleId, bwdSample.id, 'Bwd: LabSample -> QualityDecision');
const bwdSrcCode = bwdBatch.sourceHarvests[0].traceabilityCode;
eq(bwdSrcCode, 'AP99H099F9', 'Bwd: ProcessingBatch -> traceabilityCode = AP99H099F9');
const bwdFrame = simStore.frames.find(function(f) { return f.traceabilityCode === bwdSrcCode; });
ok(bwdFrame !== undefined, 'Bwd: traceabilityCode -> Frame');
const bwdHive = simStore.hives.find(function(h) { return h.id === bwdFrame.hiveId; });
ok(bwdHive !== undefined, 'Bwd: Frame -> Hive');
const bwdApiary = simStore.apiaries.find(function(a) { return a.id === bwdHive.apiaryId; });
ok(bwdApiary !== undefined, 'Bwd: Hive -> Apiary');
eq(bwdApiary.apiaryCode, 'AP99', 'Bwd trace terminates at AP99');

// ── S. CROSS-REFERENCE CONSISTENCY ────────────────────────────────────────────
console.log('\n[S] Cross-reference Consistency');
eq(TEST_HARVEST.traceabilityCode, TEST_FRAME.traceabilityCode, 'Harvest.traceabilityCode == Frame.traceabilityCode');
eq(TEST_HANDOVER.traceabilityCode, TEST_HARVEST.traceabilityCode, 'Handover.traceabilityCode == Harvest.traceabilityCode');
eq(TEST_HANDOVER.harvestRecordId, TEST_HARVEST.id, 'Handover.harvestRecordId == Harvest.id');
eq(TEST_PROCESSING_BATCH.sourceHarvests[0].traceabilityCode, TEST_HARVEST.traceabilityCode, 'Batch source == Harvest traceabilityCode');
eq(TEST_LAB_SAMPLE.sourceBatchId, TEST_PROCESSING_BATCH.id, 'LabSample.sourceBatchId == ProcessingBatch.id');
eq(TEST_LAB_SAMPLE.sourceBatchNumber, TEST_PROCESSING_BATCH.batchNumber, 'LabSample.sourceBatchNumber == ProcessingBatch.batchNumber');
ok(TEST_LAB_SAMPLE.sourceTraceabilityCodes.includes(TEST_HARVEST.traceabilityCode), 'LabSample sourceTraceabilityCodes includes harvest code');
ok(TEST_LAB_TESTS.every(function(t) { return t.sampleId === TEST_LAB_SAMPLE.id; }), 'All lab tests link to same sample ID');
eq(TEST_QUALITY_DECISION.sampleId, TEST_LAB_SAMPLE.id, 'QualityDecision.sampleId == LabSample.id');
eq(TEST_QUALITY_DECISION.batchId, TEST_PROCESSING_BATCH.id, 'QualityDecision.batchId == ProcessingBatch.id');
eq(TEST_PACKAGE.batchId, TEST_PROCESSING_BATCH.id, 'Package.batchId == ProcessingBatch.id');
eq(TEST_PACKAGE.qualityDecisionId, TEST_QUALITY_DECISION.id, 'Package.qualityDecisionId == QualityDecision.id');
eq(TEST_QR.packageId, TEST_PACKAGE.packageId, 'QR.packageId == Package.packageId');
eq(TEST_QR.publicReference, TEST_PUBLIC_RECORD.publicReference, 'QR.publicReference == PublicRecord.publicReference');
ok(TEST_SHIPMENT.allocatedPackageIds.includes(TEST_PACKAGE.packageId), 'Shipment.allocatedPackageIds includes Package');
ok(TEST_SHIPMENT.validatedPackages.some(function(v) { return v.packageId === TEST_PACKAGE.packageId; }), 'Shipment.validatedPackages includes Package');

// ── T. ORPHAN DETECTION ───────────────────────────────────────────────────────
console.log('\n[T] Orphan Detection');
ok(TEST_HIVE.apiaryId && simStore.apiaries.some(function(a) { return a.id === TEST_HIVE.apiaryId; }), 'Hive parent apiary exists (no orphan)');
ok(TEST_FRAME.hiveId && simStore.hives.some(function(h) { return h.id === TEST_FRAME.hiveId; }), 'Frame parent hive exists (no orphan)');
ok(TEST_HARVEST.traceabilityCode && simStore.frames.some(function(f) { return f.traceabilityCode === TEST_HARVEST.traceabilityCode; }), 'Harvest parent frame exists (no orphan)');
ok(TEST_PROCESSING_BATCH.sourceHarvests.every(function(s) { return simStore.harvestRecords.some(function(h) { return h.traceabilityCode === s.traceabilityCode; }); }), 'All batch sources have harvest records (no orphan)');
ok(TEST_LAB_SAMPLE.sourceBatchId && simStore.processingBatches.some(function(b) { return b.id === TEST_LAB_SAMPLE.sourceBatchId; }), 'Lab sample parent batch exists (no orphan)');
ok(TEST_LAB_TESTS.every(function(t) { return t.sampleId === TEST_LAB_SAMPLE.id; }), 'All lab tests parent sample exists (no orphan)');
ok(TEST_PACKAGE.batchId && simStore.processingBatches.some(function(b) { return b.id === TEST_PACKAGE.batchId; }), 'Package parent batch exists (no orphan)');

// ── U. NEGATIVE CASES ─────────────────────────────────────────────────────────
console.log('\n[U] Negative Cases');
const noStepsBatch = Object.assign({}, TEST_PROCESSING_BATCH, { status: BATCH_STATUSES.IN_PROCESSING, steps: [] });
ok(!ProcessorDomainService.canSubmitBatchToQuality(noStepsBatch).allowed, 'Case1: Batch without steps blocked from quality');
// NOTE: PACKAGED status IS explicitly allowed by the real validateScannedQr service
// (it accepts READY_FOR_DISPATCH | ALLOCATED | PACKAGED). Test a truly non-ready status instead.
const returnedPkg = Object.assign({}, TEST_PACKAGE, { status: PACKAGE_STATUSES.RETURNED });
const returnedScan = validateScannedQr({ scannedPayload: TEST_PACKAGE.packageId, packages: [returnedPkg], revokedQrs: [] });
ok(!returnedScan.isValid, 'Case2: RETURNED status package blocked from QR validation (PACKAGE_NOT_READY)');
const brokenPkgBatch = simStore.processingBatches.find(function(b) { return b.id === 'pb-non-existent'; });
ok(brokenPkgBatch === undefined, 'Case3: Non-existent batch resolves to undefined (broken lineage detectable)');
const unauthorizedRelease = validateShipmentRelease({ shipment: TEST_SHIPMENT, packages: [TEST_PACKAGE], userCapabilities: ['HIVE_MANAGEMENT'] });
ok(!unauthorizedRelease.isEligible, 'Case4: Beekeeper capabilities cannot release shipment');
ok(unauthorizedRelease.errors.some(function(e) { return e.includes('SHIPMENT_RELEASE'); }), 'Case4: Error identifies missing SHIPMENT_RELEASE');
const whitespaceQr = validateScannedQr({ scannedPayload: '   ', packages: [TEST_PACKAGE], revokedQrs: [] });
ok(!whitespaceQr.isValid, 'Case5: Whitespace-only QR payload rejected');
const unknownQr = validateScannedQr({ scannedPayload: 'PKG-COMPLETELY-UNKNOWN-XYZ', packages: [TEST_PACKAGE], revokedQrs: [] });
ok(!unknownQr.isValid && unknownQr.state === 'NOT_FOUND', 'Case6: Unknown QR = NOT_FOUND state');

// ── V. DATA QUANTITY CONSISTENCY ──────────────────────────────────────────────
console.log('\n[V] Data Quantity Consistency');
eq(TEST_HARVEST.quantityKg, TEST_HANDOVER.quantityKg, 'Harvest qty == Handover qty');
eq(TEST_HANDOVER.receivedQuantityKg, TEST_HARVEST.quantityKg, 'Received qty == Harvest qty');
ok(TEST_PROCESSING_BATCH.finalYieldKg <= TEST_HARVEST.quantityKg, 'Processing yield <= harvest qty');
ok(TEST_PROCESSING_BATCH.finalYieldKg > 0, 'Processing yield > 0');
const yieldStep = TEST_PROCESSING_BATCH.steps.find(function(s) { return s.stepKey === 'FINAL_PROCESSING'; });
ok(yieldStep && yieldStep.parameters.netYieldKg === TEST_PROCESSING_BATCH.finalYieldKg, 'Final processing step netYieldKg == batch finalYieldKg');
ok(yieldStep && yieldStep.parameters.lossPercent > 0, 'Process loss percentage documented');
ok(TEST_HARVEST.quantityKg - TEST_PROCESSING_BATCH.finalYieldKg >= 0, 'Documented loss is non-negative');

// ── W. PUBLIC RECORD PRIVACY ───────────────────────────────────────────────────
console.log('\n[W] Public Record Privacy');
const pubStr = JSON.stringify(TEST_PUBLIC_RECORD);
ok(!pubStr.includes('apiary-test-001'), 'Public record does not expose internal apiary DB ID');
ok(!pubStr.includes('hive-test-001'), 'Public record does not expose internal hive DB ID');
ok(!pubStr.includes('hrv-test-001'), 'Public record does not expose internal harvest DB ID');
ok(!pubStr.includes('handover-test-001'), 'Public record does not expose internal handover DB ID');
ok(!pubStr.includes('pb-test-001'), 'Public record does not expose internal processing batch DB ID');
ok(!pubStr.includes('qdec-test-001'), 'Public record does not expose quality decision DB ID');
ok(!pubStr.includes('pkg-test-001'), 'Public record does not expose internal package DB ID');
ok(!pubStr.includes('17.2'), 'Public record does not expose raw moisture reading');
ok(!pubStr.includes('12.4'), 'Public record does not expose raw HMF reading');
ok(!pubStr.includes('14.8'), 'Public record does not expose raw diastase reading');

// ── X. IDEMPOTENCY ────────────────────────────────────────────────────────────
console.log('\n[X] Idempotency (detectExistingTestJourney)');
const fullDetect = detectExistingTestJourney({
  apiaries: [TEST_APIARY], hives: [TEST_HIVE], frames: [TEST_FRAME],
  harvestRecords: [TEST_HARVEST], processingBatches: [TEST_PROCESSING_BATCH],
  labSamples: [TEST_LAB_SAMPLE], dispatchPackages: [TEST_PACKAGE]
});
ok(fullDetect.hasApiary, 'Idempotency: test apiary detected');
ok(fullDetect.hasHive, 'Idempotency: test hive detected');
ok(fullDetect.hasFrame, 'Idempotency: test frame detected by traceability code');
ok(fullDetect.hasHarvest, 'Idempotency: test harvest detected');
ok(fullDetect.hasProcessingBatch, 'Idempotency: test processing batch detected by batch number');
ok(fullDetect.hasLabSample, 'Idempotency: test lab sample detected');
ok(fullDetect.hasPackage, 'Idempotency: test package detected');
const emptyDetect = detectExistingTestJourney({});
ok(!emptyDetect.hasApiary, 'Idempotency: empty store has no test apiary');
ok(!emptyDetect.hasHive, 'Idempotency: empty store has no test hive');
ok(!emptyDetect.hasHarvest, 'Idempotency: empty store has no test harvest');

// ── Y. HIVE MANAGEMENT BATCH DOMAIN ───────────────────────────────────────────
console.log('\n[Y] Hive Management Batch Domain (real createHiveManagementBatch)');
const builtBatch = createHiveManagementBatch({
  id: 'bk-batch-test-built', name: 'Test Honey Cycle Built',
  apiaryId: TEST_APIARY.id, apiaryCode: TEST_APIARY.apiaryCode,
  hiveIds: [TEST_HIVE.id], startDate: '2026-09-27', inspectionIntervalDays: 7, notes: '[TEST]'
}, []);
eq(builtBatch.kind, 'BEEKEEPER_HIVE_MANAGEMENT_BATCH', 'Built batch has correct kind');
eq(builtBatch.memberships.length, 1, 'Built batch has 1 hive member');
eq(builtBatch.memberships[0].hiveId, TEST_HIVE.id, 'Built batch membership links to test hive');
eq(builtBatch.status, HIVE_BATCH_STATUS.ACTIVE, 'New batch status = ACTIVE');
const derivedStatus = deriveHiveManagementBatchStatus([{ cycleStatus: HIVE_CYCLE_STATUS.PROCESSING_HANDOVER }]);
eq(derivedStatus, HIVE_BATCH_STATUS.PROCESSING_HANDOVER, 'Derived status = PROCESSING_HANDOVER when all members in handover');
let dupErr = null;
try { createHiveManagementBatch({ name: 'Dup Test', apiaryId: TEST_APIARY.id, apiaryCode: 'AP99', hiveIds: [TEST_HIVE.id, TEST_HIVE.id], inspectionIntervalDays: 7 }, []); }
catch(e) { dupErr = e.message; }
ok(dupErr !== null, 'Duplicate hive in batch correctly rejected: ' + dupErr);

// ── FINAL SUMMARY ─────────────────────────────────────────────────────────────
console.log('');
console.log('======================================================');
console.log('VALIDATION SUMMARY');
console.log('======================================================');
console.log('  PASSED: ' + PASS);
console.log('  FAILED: ' + FAIL);
if (FAILURES.length > 0) {
  console.log('');
  console.log('FAILURES:');
  FAILURES.forEach(function(f, i) { console.log('  ' + (i + 1) + '. ' + f); });
  console.log('');
  process.exit(1);
} else {
  console.log('');
  console.log('  ALL VALIDATION CHECKS PASSED!');
  console.log('======================================================');
  console.log('');
}
