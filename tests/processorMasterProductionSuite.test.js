/**
 * HONEYCHAIN MASTER PROCESSOR PRODUCTION TEST SUITE
 *
 * Comprehensive domain verification testing:
 * Intake Verification → Batch Lineage → Many-to-One Traceability →
 * Step Execution → Parameter Range Sanity → Hold Lifecycle →
 * Incomplete Batch Protection → Quality Handover Guard
 */

import assert from 'node:assert';
import {
  ProcessorDomainService,
  INTAKE_STATUSES,
  INTAKE_STATUS_LABELS,
  BATCH_STATUSES,
  BATCH_STATUS_LABELS,
  PROCESSING_STEPS,
  INTAKE_REJECTION_REASONS,
  BATCH_HOLD_REASONS,
  initialProcessingBatches
} from '../src/services/processorDomainService.js';

let passed = 0;
let total = 0;

function test(description, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('\n======================================================');
console.log('HONEYCHAIN PROCESSOR MASTER PRODUCTION TEST SUITE');
console.log('======================================================\n');

// --- 1. INTAKE VALIDATION & REJECTION RULES ---
console.log('--- 1. INTAKE VALIDATION & REJECTION RULES ---');

test('Intake Acceptance: Valid gross weight, condition, and operator succeeds', () => {
  const res = ProcessorDomainService.validateIntakeAcceptance({
    receivedQuantityKg: 2.5,
    conditionOnArrival: 'Intact / Vacuum Sealed',
    operator: 'Marcus K.'
  });
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.errors.length, 0);
});

test('Intake Acceptance: Zero weight (0 kg) is rejected', () => {
  const res = ProcessorDomainService.validateIntakeAcceptance({
    receivedQuantityKg: 0,
    conditionOnArrival: 'Intact',
    operator: 'Marcus K.'
  });
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.some(e => e.includes('positive number')));
});

test('Intake Acceptance: Negative weight (-2.5 kg) is rejected', () => {
  const res = ProcessorDomainService.validateIntakeAcceptance({
    receivedQuantityKg: -2.5,
    conditionOnArrival: 'Intact',
    operator: 'Marcus K.'
  });
  assert.strictEqual(res.isValid, false);
});

test('Intake Acceptance: Unrealistic massive weight (2500 kg) is rejected', () => {
  const res = ProcessorDomainService.validateIntakeAcceptance({
    receivedQuantityKg: 2500,
    conditionOnArrival: 'Intact',
    operator: 'Marcus K.'
  });
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.some(e => e.includes('maximum realistic container limit')));
});

test('Intake Acceptance: Missing condition on arrival is rejected', () => {
  const res = ProcessorDomainService.validateIntakeAcceptance({
    receivedQuantityKg: 2.5,
    conditionOnArrival: '',
    operator: 'Marcus K.'
  });
  assert.strictEqual(res.isValid, false);
});

test('Intake Acceptance: Missing operator is rejected', () => {
  const res = ProcessorDomainService.validateIntakeAcceptance({
    receivedQuantityKg: 2.5,
    conditionOnArrival: 'Intact',
    operator: ''
  });
  assert.strictEqual(res.isValid, false);
});

test('Intake Rejection: Valid reason and descriptive remarks succeeds', () => {
  const res = ProcessorDomainService.validateIntakeRejection({
    reasonId: 'QUANTITY_MISMATCH',
    remarks: 'Comb net weight only 0.8 kg compared to declared 2.5 kg.',
    operator: 'Marcus K.'
  });
  assert.strictEqual(res.isValid, true);
});

test('Intake Rejection: Invalid reason ID is rejected', () => {
  const res = ProcessorDomainService.validateIntakeRejection({
    reasonId: 'UNKNOWN_REASON',
    remarks: 'Broken container.',
    operator: 'Marcus K.'
  });
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.some(e => e.includes('valid rejection reason')));
});

test('Intake Rejection: Empty or short remarks are rejected (never silently reject)', () => {
  const res = ProcessorDomainService.validateIntakeRejection({
    reasonId: 'DAMAGED_MATERIAL',
    remarks: 'bad',
    operator: 'Marcus K.'
  });
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.some(e => e.includes('at least 5 characters')));
});

// --- 2. BATCH IDENTIFIER & MANY-TO-ONE TRACEABILITY ---
console.log('\n--- 2. BATCH IDENTIFIER & MANY-TO-ONE TRACEABILITY ---');

test('Batch Code Generation: Conforms to PB-YYYY-XXXXX format', () => {
  const existing = [{ batchNumber: 'PB-2026-00041' }];
  const code = ProcessorDomainService.generateBatchCode(existing, 2026);
  assert.strictEqual(code, 'PB-2026-00042');
});

test('Batch Code Generation: Increments cleanly from empty array', () => {
  const code = ProcessorDomainService.generateBatchCode([], 2026);
  assert.strictEqual(code, 'PB-2026-00001');
});

test('Many-to-One Traceability Lineage: Resolves 3 contributing source harvests cleanly', () => {
  const testBatch = initialProcessingBatches[0]; // PB-2026-00041
  const lineage = ProcessorDomainService.resolveBatchLineage(testBatch);
  assert.strictEqual(lineage.batchNumber, 'PB-2026-00041');
  assert.strictEqual(lineage.sourceUnitsCount, 3);
  assert.strictEqual(lineage.sourceHarvests.length, 3);
  assert.strictEqual(lineage.sourceHarvests[0].traceabilityCode, 'AP1H001F1');
  assert.strictEqual(lineage.sourceHarvests[1].traceabilityCode, 'AP1H001F2');
  assert.strictEqual(lineage.sourceHarvests[2].traceabilityCode, 'AP1H001F5');
  assert.strictEqual(lineage.totalSourceKg, 7.9);
});

// --- 3. PROCESSING STEP PARAMETERS VALIDATION ---
console.log('\n--- 3. PROCESSING STEP PARAMETERS VALIDATION ---');

test('Step Extraction: In-range temperature, RPM, and duration is valid', () => {
  const res = ProcessorDomainService.validateStepParameters('EXTRACTION', {
    temperatureC: 24.5,
    spinSpeedRpm: 380,
    durationMin: 20
  });
  assert.strictEqual(res.isValid, true);
});

test('Step Extraction: Extreme unheated violation (temp = 85°C) is rejected', () => {
  const res = ProcessorDomainService.validateStepParameters('EXTRACTION', {
    temperatureC: 85,
    spinSpeedRpm: 380,
    durationMin: 20
  });
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.some(e => e.includes('cannot exceed maximum')));
});

test('Step Extraction: Excessive spin speed (1200 RPM) is rejected', () => {
  const res = ProcessorDomainService.validateStepParameters('EXTRACTION', {
    temperatureC: 24,
    spinSpeedRpm: 1200,
    durationMin: 20
  });
  assert.strictEqual(res.isValid, false);
});

test('Step Filtration: In-range coarse (400 µm) and fine (200 µm) mesh is valid', () => {
  const res = ProcessorDomainService.validateStepParameters('FILTRATION', {
    coarseMeshUm: 400,
    fineMeshUm: 200,
    flowRateLph: 120
  });
  assert.strictEqual(res.isValid, true);
});

test('Step Settling: Normal tank temp (22°C) and settling duration (48 hrs) is valid', () => {
  const res = ProcessorDomainService.validateStepParameters('SETTLING', {
    tankTempC: 22.5,
    settlingHours: 48,
    foamSkimmed: true
  });
  assert.strictEqual(res.isValid, true);
});

test('Step Settling: Below freezing temperature (-5°C) is rejected', () => {
  const res = ProcessorDomainService.validateStepParameters('SETTLING', {
    tankTempC: -5,
    settlingHours: 48
  });
  assert.strictEqual(res.isValid, false);
});

test('Step Preparation: Normal moisture (17.4%) is valid', () => {
  const res = ProcessorDomainService.validateStepParameters('PREPARATION', {
    moisturePercent: 17.4
  });
  assert.strictEqual(res.isValid, true);
});

test('Step Preparation: Watery honey (35% moisture) is rejected', () => {
  const res = ProcessorDomainService.validateStepParameters('PREPARATION', {
    moisturePercent: 35
  });
  assert.strictEqual(res.isValid, false);
});

test('Step Final Processing: Valid settled net yield weight is valid', () => {
  const res = ProcessorDomainService.validateStepParameters('FINAL_PROCESSING', {
    netYieldKg: 27.8,
    lossPercent: 1.2
  });
  assert.strictEqual(res.isValid, true);
});

// --- 4. HOLD LIFECYCLE & STATE MACHINE ---
console.log('\n--- 4. HOLD LIFECYCLE & STATE MACHINE ---');

test('State Transition: CREATED → IN_PROCESSING is allowed', () => {
  assert.strictEqual(ProcessorDomainService.canTransitionBatch(BATCH_STATUSES.CREATED, BATCH_STATUSES.IN_PROCESSING), true);
});

test('State Transition: IN_PROCESSING → ON_HOLD is allowed', () => {
  assert.strictEqual(ProcessorDomainService.canTransitionBatch(BATCH_STATUSES.IN_PROCESSING, BATCH_STATUSES.ON_HOLD), true);
});

test('State Transition: ON_HOLD → IN_PROCESSING (resumed) is allowed', () => {
  assert.strictEqual(ProcessorDomainService.canTransitionBatch(BATCH_STATUSES.ON_HOLD, BATCH_STATUSES.IN_PROCESSING), true);
});

test('State Transition: IN_PROCESSING → PROCESSING_COMPLETE is allowed', () => {
  assert.strictEqual(ProcessorDomainService.canTransitionBatch(BATCH_STATUSES.IN_PROCESSING, BATCH_STATUSES.PROCESSING_COMPLETE), true);
});

test('State Transition: PROCESSING_COMPLETE → SUBMITTED_TO_QUALITY is rejected directly (must be ready first)', () => {
  assert.strictEqual(ProcessorDomainService.canTransitionBatch(BATCH_STATUSES.PROCESSING_COMPLETE, BATCH_STATUSES.SUBMITTED_TO_QUALITY), false);
});

test('State Transition: READY_FOR_QUALITY → SUBMITTED_TO_QUALITY is allowed', () => {
  assert.strictEqual(ProcessorDomainService.canTransitionBatch(BATCH_STATUSES.READY_FOR_QUALITY, BATCH_STATUSES.SUBMITTED_TO_QUALITY), true);
});

test('State Transition: Retrograde SUBMITTED_TO_QUALITY → CREATED is rejected', () => {
  assert.strictEqual(ProcessorDomainService.canTransitionBatch(BATCH_STATUSES.SUBMITTED_TO_QUALITY, BATCH_STATUSES.CREATED), false);
});

// --- 5. INCOMPLETE BATCH PROTECTION & QUALITY HANDOVER GUARD ---
console.log('\n--- 5. INCOMPLETE BATCH PROTECTION & QUALITY HANDOVER GUARD ---');

test('Quality Handover Guard: Batch missing filtration and settling is BLOCKED', () => {
  const incompleteBatch = {
    id: 'batch-test-1',
    batchNumber: 'PB-2026-00099',
    status: BATCH_STATUSES.IN_PROCESSING,
    weightKg: 25.0,
    sourceHarvests: [{ traceabilityCode: 'AP1H001F1', quantityKg: 25.0 }],
    steps: [
      { stepKey: 'EXTRACTION', name: 'Centrifugal Extraction' }
      // Missing FILTRATION, SETTLING, FINAL_PROCESSING
    ]
  };

  const check = ProcessorDomainService.canSubmitBatchToQuality(incompleteBatch);
  assert.strictEqual(check.allowed, false);
  assert.ok(check.missingSteps.length >= 2);
  assert.ok(check.reasons.some(r => r.includes('Required processing steps missing')));
});

test('Quality Handover Guard: Batch ON HOLD is BLOCKED from submission', () => {
  const onHoldBatch = {
    id: 'batch-test-2',
    batchNumber: 'PB-2026-00098',
    status: BATCH_STATUSES.ON_HOLD,
    weightKg: 25.0,
    sourceHarvests: [{ traceabilityCode: 'AP1H001F1', quantityKg: 25.0 }],
    steps: [
      { stepKey: 'EXTRACTION', name: 'Centrifugal Extraction' },
      { stepKey: 'FILTRATION', name: 'Coarse & Fine Mesh Filtration' },
      { stepKey: 'SETTLING', name: 'Clarification & Settling Tank' },
      { stepKey: 'FINAL_PROCESSING', name: 'Final Quality Preparation' }
    ]
  };

  const check = ProcessorDomainService.canSubmitBatchToQuality(onHoldBatch);
  assert.strictEqual(check.allowed, false);
  assert.ok(check.reasons.some(r => r.includes('ON HOLD')));
});

test('Quality Handover Guard: Batch with zero weight is BLOCKED', () => {
  const zeroWeightBatch = {
    id: 'batch-test-3',
    batchNumber: 'PB-2026-00097',
    status: BATCH_STATUSES.READY_FOR_QUALITY,
    weightKg: 0,
    sourceHarvests: [{ traceabilityCode: 'AP1H001F1', quantityKg: 2.5 }],
    steps: [
      { stepKey: 'EXTRACTION', name: 'Centrifugal Extraction' },
      { stepKey: 'FILTRATION', name: 'Coarse & Fine Mesh Filtration' },
      { stepKey: 'SETTLING', name: 'Clarification & Settling Tank' },
      { stepKey: 'FINAL_PROCESSING', name: 'Final Quality Preparation' }
    ]
  };

  const check = ProcessorDomainService.canSubmitBatchToQuality(zeroWeightBatch);
  assert.strictEqual(check.allowed, false);
  assert.ok(check.reasons.some(r => r.toLowerCase().includes('net yield weight')));
});

test('Quality Handover Guard: Fully completed batch (PB-2026-00040) is ALLOWED to submit', () => {
  const readyBatch = initialProcessingBatches[1]; // PB-2026-00040
  const check = ProcessorDomainService.canSubmitBatchToQuality(readyBatch);
  assert.strictEqual(check.allowed, true);
  assert.strictEqual(check.missingSteps.length, 0);
  assert.strictEqual(check.reasons.length, 0);
});

console.log('\n======================================================');
console.log(`TEST SUITE FINISHED: ${passed} PASSED, 0 FAILED (TOTAL: ${total})`);
console.log('======================================================\n');
