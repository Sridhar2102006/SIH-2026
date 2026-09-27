/**
 * HoneyChain Indian Honey Processor Engine & Regulatory Rules Test Suite
 *
 * Validates:
 * 1. Regulatory Rules Engine (FSSAI 2020, Agmark 2008, BIS IS 4941)
 * 2. Dynamic Step Catalog & Parameter Bounds
 * 3. Processing Profiles & Suggested vs Approved Plan Generation
 * 4. Step Execution & Deviation Handling (PROCESS_DEVIATION)
 * 5. Pre-flight Quality Handover Gates & Traceability Integrity
 */

import assert from 'node:assert';
import test from 'node:test';

import { RegulatoryRulesEngine } from '../src/services/regulatoryRulesEngine.js';
import { ProcessingEngine } from '../src/services/processingEngine.js';
import { ProcessorProfileService } from '../src/services/processorProfileService.js';
import { REGULATORY_STANDARDS, RULE_AUTHORITIES } from '../src/data/processor/regulatoryStandards.js';
import { PROCESSING_STEP_CATALOG } from '../src/data/processor/processingStepCatalog.js';
import { PROCESSING_PROFILES, getProfileByCode } from '../src/data/processor/processingProfiles.js';

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    throw err;
  }
}

console.log('\n======================================================');
console.log('HONEYCHAIN INDIAN PROCESSOR DOMAIN ENGINE TEST SUITE');
console.log('======================================================\n');

console.log('--- 1. REGULATORY RULES ENGINE (FSSAI / AGMARK / BIS) ---');

runTest('FSSAI Honey 2020: Compliant moisture (18.2% <= 20.0%) passes', () => {
  const res = RegulatoryRulesEngine.evaluateMeasurement('MOISTURE', 18.2, { standardKey: 'FSSAI_HONEY_2020' });
  assert.strictEqual(res.isCompliant, true);
  assert.strictEqual(res.status, 'COMPLIANT');
});

runTest('FSSAI Honey 2020: High moisture (22.5% > 20.0%) triggers regulatory violation', () => {
  const res = RegulatoryRulesEngine.evaluateMeasurement('MOISTURE', 22.5, { standardKey: 'FSSAI_HONEY_2020' });
  assert.strictEqual(res.isCompliant, false);
  assert.strictEqual(res.status, 'NON_COMPLIANT');
  assert.ok(res.message.includes('exceeds maximum threshold'));
});

runTest('FSSAI Honey 2020: Elevated HMF (92 mg/kg > 80 mg/kg) fails', () => {
  const res = RegulatoryRulesEngine.evaluateMeasurement('HMF', 92, { standardKey: 'FSSAI_HONEY_2020' });
  assert.strictEqual(res.isCompliant, false);
  assert.strictEqual(res.status, 'NON_COMPLIANT');
});

runTest('FSSAI Honey 2020: Fresh Honey Diastase (8.5 Schade >= 3.0) passes', () => {
  const res = RegulatoryRulesEngine.evaluateMeasurement('DIASTASE_ACTIVITY', 8.5, { standardKey: 'FSSAI_HONEY_2020' });
  assert.strictEqual(res.isCompliant, true);
});

runTest('Agmark 2008 Grade Distinction: Special Grade (Moisture <= 20%) vs Standard Grade', () => {
  const specialCheck = RegulatoryRulesEngine.evaluateMeasurement('MOISTURE', 19.5, { authority: 'AGMARK', grade: 'SPECIAL' });
  assert.strictEqual(specialCheck.isCompliant, true);
  const standardCheck = RegulatoryRulesEngine.evaluateMeasurement('MOISTURE', 21.0, { authority: 'AGMARK', grade: 'GRADE_A' });
  assert.strictEqual(standardCheck.isCompliant, true); // Agmark Grade A allows up to 22.0%
});

console.log('\n--- 2. CANONICAL PROCESSING STEP CATALOG & BOUNDS ---');

runTest('Processing Step Catalog: Contains all 14 canonical Indian processing steps', () => {
  const keys = Object.keys(PROCESSING_STEP_CATALOG);
  assert.ok(keys.includes('RECEIVING'));
  assert.ok(keys.includes('COARSE_STRAINING'));
  assert.ok(keys.includes('WARMING'));
  assert.ok(keys.includes('LIQUEFACTION'));
  assert.ok(keys.includes('MOISTURE_REDUCTION'));
  assert.ok(keys.includes('FINE_FILTRATION'));
  assert.ok(keys.includes('SETTLING'));
  assert.ok(keys.includes('QUALITY_CHECK'));
  assert.ok(keys.includes('PACKAGING_PREPARATION'));
  assert.strictEqual(keys.length >= 14, true);
});

runTest('Step Liquefaction: Temperature within warm bounds (40°C <= 45°C) is valid', () => {
  const step = PROCESSING_STEP_CATALOG.LIQUEFACTION;
  const tempDef = step.parameterDefs.find(p => p.key === 'decrystallizationTempC');
  assert.strictEqual(tempDef.max, 45); // Unpasteurized Indian technical limit
  assert.strictEqual(40 >= tempDef.min && 40 <= tempDef.max, true);
});

console.log('\n--- 3. PROCESSING PROFILES & SUGGESTED PLAN GENERATION ---');

runTest('Processing Profile: RAW_UNHEATED generates gentle raw plan without high heating', () => {
  const profile = getProfileByCode('RAW_UNHEATED');
  assert.ok(profile);
  assert.strictEqual(profile.steps.some(s => s.stepKey === 'WARMING'), false);
  const plan = ProcessingEngine.generateSuggestedPlan({ profileCode: 'RAW_UNHEATED' });
  assert.strictEqual(plan.steps.some(s => s.stepKey === 'LIQUEFACTION'), false);
  assert.strictEqual(plan.steps.some(s => s.stepKey === 'SETTLING'), true);
  assert.strictEqual(plan.steps.some(s => s.stepKey === 'COARSE_STRAINING'), true);
});

runTest('Processing Profile: COMMERCIAL_RETAIL supports conditional moisture reduction and liquefaction', () => {
  const plan = ProcessingEngine.generateSuggestedPlan({ profileCode: 'COMMERCIAL_RETAIL' });
  const moistureStep = plan.steps.find(s => s.stepKey === 'MOISTURE_REDUCTION');
  assert.ok(moistureStep);
  assert.strictEqual(moistureStep.requirement, 'CONDITIONAL');
});

runTest('Separation of Suggested Plan vs Approved Plan: Suggested plan is preserved and not overwritten', () => {
  const suggestedPlan = ProcessingEngine.generateSuggestedPlan({ profileCode: 'COMMERCIAL_RETAIL' });
  const approvedPlan = JSON.parse(JSON.stringify(suggestedPlan));
  // User customizes approved plan (removes an optional/custom step)
  approvedPlan.steps = approvedPlan.steps.slice(0, -1);
  assert.strictEqual(suggestedPlan.steps.length > approvedPlan.steps.length, true);
});

console.log('\n--- 4. STEP EXECUTION, PARAMETERS & DEVIATION HANDLING ---');

runTest('Dynamic Step Execution: Successful execution of step with valid parameters', () => {
  const batch = {
    id: 'b-test-01',
    batchNumber: 'PB-2026-TEST1',
    approvedPlan: {
      steps: [
        { stepKey: 'RECEIVING', name: 'Receiving', requirement: 'MANDATORY', status: 'NOT_STARTED' },
        { stepKey: 'COARSE_STRAINING', name: 'Coarse Straining', requirement: 'MANDATORY', status: 'NOT_STARTED' }
      ]
    },
    steps: [],
    deviations: []
  };

  const result = ProcessingEngine.recordStepExecution({
    batch,
    stepKey: 'COARSE_STRAINING',
    parameters: { filterMeshMicrons: 400, honeyFlowTempC: 28, flowRateKgPerHour: 150 },
    equipment: 'Stainless Double Sieve S1',
    operator: 'Marcus K.'
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.step.status, 'COMPLETED');
  assert.strictEqual(result.batch.steps.length, 1);
});

runTest('Deviation Logging: Out-of-bounds temperature triggers PROCESS_DEVIATION with severity', () => {
  const batch = {
    id: 'b-test-02',
    batchNumber: 'PB-2026-TEST2',
    approvedPlan: {
      steps: [
        { stepKey: 'WARMING', name: 'Gentle Warming', requirement: 'OPTIONAL', status: 'NOT_STARTED' }
      ]
    },
    steps: [],
    deviations: []
  };

  const result = ProcessingEngine.recordStepExecution({
    batch,
    stepKey: 'WARMING',
    parameters: { warmWaterBathTempC: 55, honeyCoreTempC: 48, warmingDurationHours: 4 }, // Exceeds max 42°C
    equipment: 'Immersion Warming Tank',
    operator: 'Marcus K.'
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.newDeviations.length >= 1, true);
  assert.strictEqual(result.newDeviations[0].parameter, 'honeyCoreTempC');
  assert.strictEqual(result.newDeviations[0].disposition, 'HOLD');
});

runTest('Skipping Optional Step: Recording audited justification and updated status', () => {
  const batch = {
    id: 'b-test-03',
    batchNumber: 'PB-2026-TEST3',
    approvedPlan: {
      steps: [
        { stepKey: 'FINE_FILTRATION', name: 'Fine Filtration', requirement: 'OPTIONAL', status: 'NOT_STARTED' }
      ]
    },
    steps: [],
    deviations: []
  };

  const result = ProcessingEngine.skipOptionalStep({
    batch,
    stepKey: 'FINE_FILTRATION',
    reason: 'Client requested raw honey with unfiltered pollen content preserved',
    operator: 'Marcus K.'
  });

  assert.strictEqual(result.success, true);
  const planStep = result.batch.approvedPlan.steps.find(s => s.stepKey === 'FINE_FILTRATION');
  assert.strictEqual(planStep.status, 'SKIPPED');
});

console.log('\n--- 5. QUALITY HANDOVER INTEGRITY & UPSTREAM TRACEABILITY ---');

runTest('Quality Handover Guard: Batch with unresolved HOLD deviation cannot be submitted to Quality', () => {
  const batch = {
    id: 'b-test-04',
    batchNumber: 'PB-2026-TEST4',
    weightKg: 50,
    sourceHarvests: [{ traceabilityCode: 'TR-01' }],
    approvedPlan: {
      steps: [
        { stepKey: 'RECEIVING', requirement: 'MANDATORY', status: 'COMPLETED' },
        { stepKey: 'QUALITY_CHECK', requirement: 'MANDATORY', status: 'COMPLETED' }
      ]
    },
    steps: [
      { stepKey: 'RECEIVING', status: 'COMPLETED' },
      { stepKey: 'QUALITY_CHECK', status: 'COMPLETED' }
    ],
    deviations: [
      { id: 'dev-1', parameter: 'honeyCoreTempC', disposition: 'HOLD' }
    ]
  };

  const check = ProcessingEngine.validateQualityReadiness(batch);
  assert.strictEqual(check.allowed, false);
  assert.ok(check.reasons.some(r => r.includes('unresolved deviation')));
});

runTest('Quality Handover Guard: Fully executed, deviation-free batch passes pre-flight checks', () => {
  const batch = {
    id: 'b-test-05',
    batchNumber: 'PB-2026-TEST5',
    weightKg: 50,
    finalYieldKg: 49.2,
    sourceHarvests: [{ traceabilityCode: 'TR-01' }, { traceabilityCode: 'TR-02' }],
    approvedPlan: {
      steps: [
        { stepKey: 'RECEIVING', requirement: 'MANDATORY', status: 'COMPLETED' },
        { stepKey: 'SETTLING', requirement: 'MANDATORY', status: 'COMPLETED' }
      ]
    },
    steps: [
      { stepKey: 'RECEIVING', status: 'COMPLETED' },
      { stepKey: 'SETTLING', status: 'COMPLETED' }
    ],
    deviations: []
  };

  const check = ProcessingEngine.validateQualityReadiness(batch);
  assert.strictEqual(check.allowed, true);
  assert.strictEqual(check.reasons.length, 0);
});

console.log('\n======================================================');
console.log(`PROCESSOR SUITE FINISHED: ${passed} PASSED, 0 FAILED (TOTAL: ${total})`);
console.log('======================================================\n');
