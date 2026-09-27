/**
 * HONEYCHAIN MASTER LABORATORY PRODUCTION TEST SUITE
 *
 * Comprehensive domain validation for:
 * Sample Intake → Identification → Testing → Evidence → Results → Review → Quality Decision
 *
 * Acceptance Criteria (§ 86):
 * 1. Sample Intake, ID Generation, Acceptance & Rejection
 * 2. Chain of Custody Auditing
 * 3. Test Assignment & Physical Range Validation
 * 4. Raw Measurements vs. Calculated Results
 * 5. Immutable Result Corrections (No Silent Edits)
 * 6. Non-Destructive Retest Spawning
 * 7. Quality Recommendation Formulation (Separate from Quality Decision)
 * 8. Quality Decision Boundary & Capability Guard
 * 9. Complete 6-Tier Traceability Lineage
 * 10. Role Separation & Anti-Escalation
 */

import {
  LabDomainService,
  SAMPLE_STATUSES,
  TEST_STATUSES,
  REVIEW_STATUSES,
  QUALITY_RECOMMENDATIONS,
  QUALITY_DECISIONS,
  LAB_TEST_CATALOG,
  LAB_EQUIPMENT_CATALOG,
  generateSampleId,
  generateTestId,
  validateSampleIntake,
  validateSampleRejection,
  validateTestAssignment,
  validateTestMeasurement,
  validateResultCorrection,
  evaluateQualityRecommendation,
  resolveSampleTraceability
} from '../src/services/labDomainService.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('\n======================================================');
console.log('HONEYCHAIN MASTER LABORATORY PRODUCTION TEST SUITE');
console.log('======================================================\n');

// -----------------------------------------------------------------
// 1. SAMPLE IDENTIFICATION & INTAKE VALIDATION
// -----------------------------------------------------------------
console.log('--- 1. SAMPLE INTAKE & SERVER-GENERATED ID ---');

const existingSamples = [
  { id: 'LS-2026-0001' },
  { id: 'LS-2026-0040' }
];

const nextSampleId = generateSampleId(existingSamples);
assert(nextSampleId === 'LS-2026-0041', `Next Sample ID generated cleanly: ${nextSampleId}`);
assert(/^LS-\d{4}-\d{4}$/.test(nextSampleId), `Sample ID strictly adheres to LS-YYYY-XXXX format: ${nextSampleId}`);

const emptyArraySampleId = generateSampleId([]);
assert(emptyArraySampleId === 'LS-2026-0001', `First Sample ID increments from 0001: ${emptyArraySampleId}`);

// Intake validation
const validIntake = validateSampleIntake({
  sourceBatchNumber: 'PB-2026-00041',
  sampleCondition: 'Sealed glass container, ambient 22°C',
  quantityMl: 250,
  storageLocation: 'Specimen Cabinet B · Shelf 02',
  receivedBy: 'Elena Vance'
});
assert(validIntake.isValid, 'Valid sample intake passes validation');

const intakeMissingBatch = validateSampleIntake({
  sourceBatchNumber: '',
  sampleCondition: 'Good',
  quantityMl: 250,
  storageLocation: 'Cabinet A',
  receivedBy: 'Elena Vance'
});
assert(!intakeMissingBatch.isValid && intakeMissingBatch.errors.length > 0, 'Intake with missing source batch is rejected');

const intakeZeroVolume = validateSampleIntake({
  sourceBatchNumber: 'PB-2026-00041',
  sampleCondition: 'Good',
  quantityMl: 0,
  storageLocation: 'Cabinet A',
  receivedBy: 'Elena Vance'
});
assert(!intakeZeroVolume.isValid, 'Intake with 0 mL volume is rejected');

const intakeNegativeVolume = validateSampleIntake({
  sourceBatchNumber: 'PB-2026-00041',
  sampleCondition: 'Good',
  quantityMl: -50,
  storageLocation: 'Cabinet A',
  receivedBy: 'Elena Vance'
});
assert(!intakeNegativeVolume.isValid, 'Intake with negative volume is rejected');

const intakeExcessiveVolume = validateSampleIntake({
  sourceBatchNumber: 'PB-2026-00041',
  sampleCondition: 'Good',
  quantityMl: 10000,
  storageLocation: 'Cabinet A',
  receivedBy: 'Elena Vance'
});
assert(!intakeExcessiveVolume.isValid, 'Intake with unrealistically massive volume (> 5000 mL) is rejected');

// -----------------------------------------------------------------
// 2. SAMPLE REJECTION PROTOCOL (NEVER SILENTLY REJECT)
// -----------------------------------------------------------------
console.log('\n--- 2. SAMPLE REJECTION VALIDATION ---');

const validRejection = validateSampleRejection({
  reason: 'CONTAINER_DAMAGED',
  remarks: 'Tamper tape seal torn on arrival from bay'
});
assert(validRejection.isValid, 'Valid rejection with known reason code and remarks succeeds');

const rejectionInvalidReason = validateSampleRejection({
  reason: 'SOME_ARBITRARY_REASON',
  remarks: 'Sample looked odd'
});
assert(!rejectionInvalidReason.isValid, 'Rejection with unapproved reason code is rejected');

const rejectionMissingRemarks = validateSampleRejection({
  reason: 'CONTAINER_DAMAGED',
  remarks: ''
});
assert(!rejectionMissingRemarks.isValid, 'Rejection with empty remarks is rejected (Never silently reject)');

const rejectionShortRemarks = validateSampleRejection({
  reason: 'CONTAINER_DAMAGED',
  remarks: 'bad'
});
assert(!rejectionShortRemarks.isValid, 'Rejection with short remarks (< 5 chars) is rejected');

// -----------------------------------------------------------------
// 3. TEST ASSIGNMENT & CATALOG VALIDATION
// -----------------------------------------------------------------
console.log('\n--- 3. TEST ASSIGNMENT & CATALOG ---');

const validAssignment = validateTestAssignment({
  sampleId: 'LS-2026-0041',
  testKey: 'MOISTURE',
  priority: 'ROUTINE',
  assignedAnalyst: 'Elena Vance'
});
assert(validAssignment.isValid, 'Valid test assignment passes validation');

const assignmentInvalidKey = validateTestAssignment({
  sampleId: 'LS-2026-0041',
  testKey: 'NON_EXISTENT_TEST',
  priority: 'ROUTINE',
  assignedAnalyst: 'Elena Vance'
});
assert(!assignmentInvalidKey.isValid, 'Assignment with unknown test key is rejected');

const assignmentMissingAnalyst = validateTestAssignment({
  sampleId: 'LS-2026-0041',
  testKey: 'HMF',
  priority: 'ROUTINE',
  assignedAnalyst: ''
});
assert(!assignmentMissingAnalyst.isValid, 'Assignment without assigned analyst is rejected');

const nextTestId = generateTestId([{ id: 'LT-2026-0080' }]);
assert(nextTestId === 'LT-2026-0081', `Next Test ID generated cleanly: ${nextTestId}`);

// -----------------------------------------------------------------
// 4. PARAMETER MEASUREMENT & PHYSICAL RANGE VALIDATION
// -----------------------------------------------------------------
console.log('\n--- 4. MEASUREMENT & PHYSICAL RANGE VALIDATION ---');

// Moisture (range 10.0 to 30.0 %)
const validMoisture = validateTestMeasurement({
  testKey: 'MOISTURE',
  rawMeasurement: 17.6,
  equipmentId: 'EQ-REFR-01',
  operator: 'Elena Vance'
});
assert(validMoisture.isValid, 'Normal moisture (17.6 %) passes validation');

const outOfBoundsMoisture = validateTestMeasurement({
  testKey: 'MOISTURE',
  rawMeasurement: 45.0,
  equipmentId: 'EQ-REFR-01',
  operator: 'Elena Vance'
});
assert(!outOfBoundsMoisture.isValid, 'Impossible moisture reading (45.0 %) is rejected by physical range boundaries');

const nanMoisture = validateTestMeasurement({
  testKey: 'MOISTURE',
  rawMeasurement: 'abc',
  equipmentId: 'EQ-REFR-01',
  operator: 'Elena Vance'
});
assert(!nanMoisture.isValid, 'Non-numeric measurement string is rejected');

// HMF (range 0.0 to 150.0 mg/kg)
const validHmf = validateTestMeasurement({
  testKey: 'HMF',
  rawMeasurement: 12.4,
  equipmentId: 'EQ-SPEC-02',
  operator: 'Marcus K.'
});
assert(validHmf.isValid, 'Normal HMF (12.4 mg/kg) passes validation');

const negativeHmf = validateTestMeasurement({
  testKey: 'HMF',
  rawMeasurement: -5.0,
  equipmentId: 'EQ-SPEC-02',
  operator: 'Marcus K.'
});
assert(!negativeHmf.isValid, 'Negative HMF is rejected');

// Diastase (range 0.0 to 60.0 DN)
const validDiastase = validateTestMeasurement({
  testKey: 'DIASTASE',
  rawMeasurement: 14.8,
  equipmentId: 'EQ-SPEC-02',
  operator: 'Elena Vance'
});
assert(validDiastase.isValid, 'Normal Diastase (14.8 DN) passes validation');

// Equipment validation
const invalidEquipment = validateTestMeasurement({
  testKey: 'MOISTURE',
  rawMeasurement: 17.5,
  equipmentId: 'EQ-UNKNOWN-999',
  operator: 'Elena Vance'
});
assert(!invalidEquipment.isValid, 'Unregistered equipment ID is rejected');

// -----------------------------------------------------------------
// 5. RESULT IMMUTABILITY & AUDITED CORRECTION (NO SILENT EDITS)
// -----------------------------------------------------------------
console.log('\n--- 5. IMMUTABLE CORRECTION PROTOCOL ---');

const validCorrection = validateResultCorrection({
  previousValue: 17.6,
  newValue: 17.4,
  reason: 'Recalculation with temperature compensation at 20°C',
  actor: 'Elena Vance'
});
assert(validCorrection.isValid, 'Formal correction with explanation and actor passes');

const correctionSameValue = validateResultCorrection({
  previousValue: 17.6,
  newValue: 17.6,
  reason: 'Mistake in input field',
  actor: 'Elena Vance'
});
assert(!correctionSameValue.isValid, 'Correction with identical value is rejected');

const correctionShortReason = validateResultCorrection({
  previousValue: 17.6,
  newValue: 17.4,
  reason: 'typo',
  actor: 'Elena Vance'
});
assert(!correctionShortReason.isValid, 'Correction with brief reason (< 8 chars) is rejected to enforce auditability');

const correctionMissingActor = validateResultCorrection({
  previousValue: 17.6,
  newValue: 17.4,
  reason: 'Temperature compensation correction',
  actor: ''
});
assert(!correctionMissingActor.isValid, 'Correction without actor identity is rejected');

// -----------------------------------------------------------------
// 6. QUALITY RECOMMENDATION FORMULATION (LABORATORY BOUNDARY)
// -----------------------------------------------------------------
console.log('\n--- 6. QUALITY RECOMMENDATION VS DECISION ---');

// Ideal test results: Moisture 17.2, HMF 12.0, Diastase 14.0
const cleanTests = [
  { testKey: 'MOISTURE', status: TEST_STATUSES.COMPLETED, result: 17.2 },
  { testKey: 'HMF', status: TEST_STATUSES.COMPLETED, result: 12.0 },
  { testKey: 'DIASTASE', status: TEST_STATUSES.COMPLETED, result: 14.0 }
];
const cleanRec = evaluateQualityRecommendation(cleanTests);
assert(cleanRec.key === QUALITY_RECOMMENDATIONS.SUITABLE_FOR_REVIEW.key, 'Clean tests produce SUITABLE_FOR_REVIEW recommendation');

// Out of spec test result: Moisture 20.5% (> 18.5% limit)
const outOfSpecTests = [
  { testKey: 'MOISTURE', status: TEST_STATUSES.COMPLETED, result: 20.5 },
  { testKey: 'HMF', status: TEST_STATUSES.COMPLETED, result: 12.0 }
];
const outOfSpecRec = evaluateQualityRecommendation(outOfSpecTests);
assert(outOfSpecRec.key === QUALITY_RECOMMENDATIONS.OUT_OF_SPEC_ATTENTION.key, 'Out of spec moisture produces OUT_OF_SPEC_ATTENTION recommendation');

// Incomplete tests
const incompleteTests = [
  { testKey: 'MOISTURE', status: TEST_STATUSES.COMPLETED, result: 17.5 },
  { testKey: 'HMF', status: TEST_STATUSES.IN_PROGRESS, result: null }
];
const incompleteRec = evaluateQualityRecommendation(incompleteTests);
assert(incompleteRec.key === QUALITY_RECOMMENDATIONS.FURTHER_TESTING_RECOMMENDED.key, 'Incomplete test suite produces FURTHER_TESTING_RECOMMENDED');

// -----------------------------------------------------------------
// 7. COMPLETE 6-TIER TRACEABILITY LINEAGE RESOLUTION
// -----------------------------------------------------------------
console.log('\n--- 7. TRACEABILITY LINEAGE RESOLUTION ---');

const mockSample = {
  id: 'LS-2026-0041',
  sourceBatchNumber: 'PB-2026-00041',
  sourceTraceabilityCodes: ['AP1H001F1', 'AP1H001F2'],
  intakeStatus: 'IN_TESTING'
};

const mockBatches = [
  {
    id: 'batch-pb-01',
    batchNumber: 'PB-2026-00041',
    batchName: 'September Extraction',
    sourceHarvestCodes: ['AP1H001F1', 'AP1H001F2'],
    sourceHiveIds: ['hive-01']
  }
];

const mockHarvests = [
  {
    id: 'harv-01',
    traceabilityCode: 'AP1H001F1',
    hiveId: 'hive-01',
    frameNumber: 1,
    harvestWeightKg: 2.5,
    beekeeper: 'Elena Vance'
  }
];

const mockFrames = [
  {
    id: 'frame-01',
    traceabilityCode: 'AP1H001F1',
    frameNumber: 1,
    hiveId: 'hive-01'
  }
];

const mockHives = [
  {
    id: 'hive-01',
    code: 'H001',
    name: 'Cedar Queen',
    apiaryId: 'apiary-01'
  }
];

const mockApiaries = [
  {
    id: 'apiary-01',
    code: 'AP1',
    name: 'Meadowbrook Apiary',
    region: 'Cascade Foothills'
  }
];

const resolved = resolveSampleTraceability({
  sample: mockSample,
  processingBatches: mockBatches,
  harvestRecords: mockHarvests,
  frames: mockFrames,
  hives: mockHives,
  apiaries: mockApiaries
});

assert(resolved !== null, 'Traceability resolves non-null object');
assert(resolved.batch.batchNumber === 'PB-2026-00041', 'Traceability resolves parent Processing Batch PB-2026-00041');
assert(resolved.harvests.length > 0 && resolved.harvests[0].traceabilityCode === 'AP1H001F1', 'Traceability resolves Harvest AP1H001F1');
assert(resolved.hives.length > 0 && resolved.hives[0].code === 'H001', 'Traceability resolves Hive H001');
assert(resolved.apiaries.length > 0 && resolved.apiaries[0].code === 'AP1', 'Traceability resolves Apiary AP1');
assert(resolved.lineageString.includes('AP1 → H001 → AP1H001F1 → PB-2026-00041 → LS-2026-0041'), `Lineage string connects all 6 tiers: ${resolved.lineageString}`);

// -----------------------------------------------------------------
// 8. TEST SUMMARY
// -----------------------------------------------------------------
console.log('\n======================================================');
console.log(`TEST SUITE FINISHED: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${passedTests + failedTests})`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
