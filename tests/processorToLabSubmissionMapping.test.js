import assert from 'node:assert/strict';
import { ProcessingEngine, STEP_STATUSES } from '../src/services/processingEngine.js';
import {
  SAMPLE_STATUSES,
  generateSampleId,
  resolveSampleTraceability
} from '../src/services/labDomainService.js';

console.log('Testing Processor to Laboratory Sample Submission & Traceability Mapping...');

// 1. Setup mock source handover
const mockHandovers = [
  {
    id: 'ho-test-01',
    traceabilityCode: 'AP1H001F1',
    quantityKg: 45.5,
    honeyType: 'Wild Forest',
    harvestDate: '2026-09-28',
    submittingBeekeeper: 'Kavita Rao',
    conditionOnArrival: 'Tamper tape sealed'
  }
];

// 2. Create batch
const batch = ProcessingEngine.createProcessingBatch({
  sourceHandovers: mockHandovers,
  batchCode: 'PB-2026-99999',
  batchName: 'Wild Forest Honey Batch 99999',
  facilityId: 'fac-central-01',
  facilityName: 'HoneyChain Co-op Hub 01',
  leadOperator: 'Marcus K.'
});

assert.equal(batch.batchNumber, 'PB-2026-99999');
assert.equal(batch.sourceHarvests.length, 1);
assert.equal(batch.sourceHarvests[0].traceabilityCode, 'AP1H001F1');

// 3. Complete mandatory plan steps
const planSteps = Array.isArray(batch.approvedPlan) ? batch.approvedPlan : (batch.approvedPlan?.steps || []);
let currentBatch = { ...batch };

planSteps.forEach(step => {
  if (step.requirement === 'MANDATORY') {
    const res = ProcessingEngine.recordStepExecution({
      batch: currentBatch,
      stepKey: step.stepKey,
      parameters: {
        rawMoisturePct: 18.2,
        durationMinutes: 45,
        targetTempC: 38,
        storageLocation: 'Tank A-01',
        netYieldKg: 44.2
      },
      operator: 'Marcus K.'
    });
    if (res.success) {
      currentBatch = res.batch;
    }
  }
});

// 4. Validate Quality Readiness
const readiness = ProcessingEngine.validateQualityReadiness(currentBatch);
assert.equal(readiness.allowed, true, `Expected readiness to be allowed, got: ${readiness.reasons.join(', ')}`);

// 5. Simulate Laboratory Sample Creation from Handoff
const labSamplesStore = [];
const newSampleId = generateSampleId(labSamplesStore);
const incomingLabSample = {
  id: newSampleId,
  sourceBatchId: currentBatch.id,
  sourceBatchNumber: currentBatch.batchNumber,
  sourceTraceabilityCodes: currentBatch.sourceHarvests.map(s => s.traceabilityCode).filter(Boolean),
  intakeStatus: SAMPLE_STATUSES.AWAITING_INTAKE,
  receivedAt: new Date().toISOString(),
  receivedBy: 'Marcus K.',
  acceptedAt: null,
  acceptedBy: null,
  quantityMl: 250,
  containerType: 'Food-Grade Amber Glass Jar (250 mL)',
  sealCondition: 'Tamper tape sealed from processing facility',
  storageLocation: 'Awaiting intake bench',
  ambientTempAtIntakeC: 22.0,
  remarks: `Auto-registered from batch handoff: ${currentBatch.name}.`,
  chainOfCustody: [
    {
      timestamp: new Date().toISOString(),
      action: 'Sample Dispatched to Lab',
      from: `Processing Facility (${currentBatch.facility})`,
      to: 'Lab Intake Station',
      actor: 'Marcus K.',
      reason: 'Submitted for Quality & Analytical certification',
      condition: 'Sealed container'
    }
  ]
};

labSamplesStore.push(incomingLabSample);

// 6. Verify Lab Sample Fields & Status
assert.equal(incomingLabSample.intakeStatus, 'AWAITING_INTAKE');
assert.equal(incomingLabSample.sourceBatchNumber, 'PB-2026-99999');
assert.deepEqual(incomingLabSample.sourceTraceabilityCodes, ['AP1H001F1']);
assert.equal(incomingLabSample.chainOfCustody.length, 1);
assert.equal(incomingLabSample.chainOfCustody[0].action, 'Sample Dispatched to Lab');

// 7. Verify LabHome intake filter
const awaitingIntakeList = labSamplesStore.filter(s => s.intakeStatus === 'AWAITING_INTAKE');
assert.equal(awaitingIntakeList.length, 1);
assert.equal(awaitingIntakeList[0].id, newSampleId);

// 8. Verify Traceability Resolution back to Beekeeper
const mockFrames = [{ id: 'frm-01', frameNumber: 'F1', traceabilityCode: 'AP1H001F1', hiveId: 'hive-01' }];
const mockHives = [{ id: 'hive-01', code: 'H001', name: 'Hive Alpha', apiaryId: 'ap-01' }];
const mockApiaries = [{ id: 'ap-01', code: 'AP1', name: 'Highland Forest Apiary' }];
const mockHarvestRecords = [{
  id: 'hrv-01',
  traceabilityCode: 'AP1H001F1',
  hiveId: 'hive-01',
  frameCode: 'F1',
  harvestWeightKg: 45.5,
  beekeeper: 'Kavita Rao'
}];

const lineage = resolveSampleTraceability({
  sample: incomingLabSample,
  processingBatches: [currentBatch],
  harvestRecords: mockHarvestRecords,
  frames: mockFrames,
  hives: mockHives,
  apiaries: mockApiaries
});

assert.ok(lineage, 'Lineage should be resolved');
assert.equal(lineage.sampleId, newSampleId);
assert.equal(lineage.batch.batchNumber, 'PB-2026-99999');
assert.equal(lineage.harvests.length, 1);
assert.equal(lineage.harvests[0].traceabilityCode, 'AP1H001F1');
assert.equal(lineage.hives.length, 1);
assert.equal(lineage.hives[0].code, 'H001');
assert.equal(lineage.apiaries.length, 1);
assert.equal(lineage.apiaries[0].code, 'AP1');

console.log('✓ Processor to Lab Submission & Traceability Mapping verified successfully!');
