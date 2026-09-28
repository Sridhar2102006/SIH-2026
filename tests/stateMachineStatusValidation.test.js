/**
 * ============================================================
 * HONEYCHAIN ENTERPRISE STATE MACHINE & STATUS VALIDATION TEST
 * ============================================================
 *
 * Implements Section 5:
 * "Define legal transitions. Reject illegal transitions server-side.
 *  Example: COMPLETED -> CREATED must NOT silently succeed."
 */

import assert from 'node:assert/strict';
import {
  honeyDatabaseGateway,
  TABLE_NAMES,
  ENV_TYPES,
  IllegalStateTransitionError,
  ENTITY_LIFECYCLES
} from '../src/services/honeyDatabaseGateway.js';

console.log('====================================================');
console.log('HONEYCHAIN ENTERPRISE STATE MACHINE AUDIT & TEST (§5)');
console.log('====================================================');

async function runStateMachineSuite() {
  honeyDatabaseGateway.environment = ENV_TYPES.TEST;
  await honeyDatabaseGateway.connect();

  let checksPassed = 0;
  function pass(msg) {
    checksPassed++;
    console.log(`  ✓ [Check ${checksPassed}] ${msg}`);
  }

  // 1. PROCESSING_BATCH TRANSITIONS
  console.log('\n[1/5] Testing Processing Batch Lifecycle Transitions...');
  const batch = honeyDatabaseGateway.insert(TABLE_NAMES.PROCESSING_BATCHES, {
    id: 'pb-state-test-01',
    batchNumber: 'PB-2026-99001',
    status: 'CREATED'
  });

  // Legal forward transition: CREATED -> IN_PROCESSING
  const moved1 = honeyDatabaseGateway.update(TABLE_NAMES.PROCESSING_BATCHES, batch.id, {
    status: 'IN_PROCESSING'
  });
  assert.equal(moved1.status, 'IN_PROCESSING');
  pass('Legal forward transition CREATED -> IN_PROCESSING accepted');

  // Legal forward transition: IN_PROCESSING -> PROCESSING_COMPLETE
  const moved2 = honeyDatabaseGateway.update(TABLE_NAMES.PROCESSING_BATCHES, batch.id, {
    status: 'PROCESSING_COMPLETE'
  });
  assert.equal(moved2.status, 'PROCESSING_COMPLETE');
  pass('Legal forward transition IN_PROCESSING -> PROCESSING_COMPLETE accepted');

  // ILLEGAL backward transition: PROCESSING_COMPLETE -> CREATED
  assert.throws(
    () => {
      honeyDatabaseGateway.update(TABLE_NAMES.PROCESSING_BATCHES, batch.id, {
        status: 'CREATED'
      });
    },
    IllegalStateTransitionError,
    'Server must reject PROCESSING_COMPLETE -> CREATED'
  );
  pass('Illegal backward transition PROCESSING_COMPLETE -> CREATED strictly rejected with IllegalStateTransitionError');

  // 2. DISPATCH_PACKAGE TRANSITIONS
  console.log('\n[2/5] Testing Dispatch Package Lifecycle Transitions...');
  const pkg = honeyDatabaseGateway.insert(TABLE_NAMES.DISPATCH_PACKAGES, {
    id: 'pkg-state-test-01',
    packageId: 'PKG-ST-001',
    publicReference: 'HC-STATE-001',
    status: 'REGISTERED'
  });

  // Legal: REGISTERED -> VALIDATED
  honeyDatabaseGateway.update(TABLE_NAMES.DISPATCH_PACKAGES, pkg.id, {
    status: 'VALIDATED'
  });
  // Legal: VALIDATED -> RELEASED
  honeyDatabaseGateway.update(TABLE_NAMES.DISPATCH_PACKAGES, pkg.id, {
    status: 'RELEASED'
  });
  // Legal: RELEASED -> IN_TRANSIT
  honeyDatabaseGateway.update(TABLE_NAMES.DISPATCH_PACKAGES, pkg.id, {
    status: 'IN_TRANSIT'
  });
  // Legal: IN_TRANSIT -> DELIVERED
  honeyDatabaseGateway.update(TABLE_NAMES.DISPATCH_PACKAGES, pkg.id, {
    status: 'DELIVERED'
  });
  pass('Legal package progression REGISTERED -> VALIDATED -> RELEASED -> IN_TRANSIT -> DELIVERED succeeded');

  // ILLEGAL: DELIVERED -> REGISTERED
  assert.throws(
    () => {
      honeyDatabaseGateway.update(TABLE_NAMES.DISPATCH_PACKAGES, pkg.id, {
        status: 'REGISTERED'
      });
    },
    IllegalStateTransitionError,
    'Server must reject DELIVERED -> REGISTERED'
  );
  pass('Illegal transition DELIVERED -> REGISTERED strictly rejected');

  // 3. LAB_SAMPLE TRANSITIONS
  console.log('\n[3/5] Testing Lab Sample Lifecycle Transitions...');
  const sample = honeyDatabaseGateway.insert(TABLE_NAMES.LAB_SAMPLES, {
    id: 'sample-state-test-01',
    sampleId: 'SMP-ST-001',
    status: 'SAMPLE_REGISTERED'
  });

  // Legal: SAMPLE_REGISTERED -> RECEIVED -> IN_TESTING -> CERTIFIED
  honeyDatabaseGateway.update(TABLE_NAMES.LAB_SAMPLES, sample.id, { status: 'RECEIVED' });
  honeyDatabaseGateway.update(TABLE_NAMES.LAB_SAMPLES, sample.id, { status: 'IN_TESTING' });
  honeyDatabaseGateway.update(TABLE_NAMES.LAB_SAMPLES, sample.id, { status: 'CERTIFIED' });
  pass('Legal sample progression SAMPLE_REGISTERED -> RECEIVED -> IN_TESTING -> CERTIFIED succeeded');

  // ILLEGAL: CERTIFIED -> RECEIVED
  assert.throws(
    () => {
      honeyDatabaseGateway.update(TABLE_NAMES.LAB_SAMPLES, sample.id, {
        status: 'RECEIVED'
      });
    },
    IllegalStateTransitionError,
    'Server must reject CERTIFIED -> RECEIVED'
  );
  pass('Illegal transition CERTIFIED -> RECEIVED strictly rejected');

  // 4. HARVEST_RECORD TRANSITIONS
  console.log('\n[4/5] Testing Harvest Record Lifecycle Transitions...');
  const harvest = honeyDatabaseGateway.insert(TABLE_NAMES.HARVEST_RECORDS, {
    id: 'hr-state-test-01',
    harvestNumber: 'HR-ST-001',
    status: 'HARVESTED'
  });

  honeyDatabaseGateway.update(TABLE_NAMES.HARVEST_RECORDS, harvest.id, { status: 'READY_FOR_INTAKE' });
  honeyDatabaseGateway.update(TABLE_NAMES.HARVEST_RECORDS, harvest.id, { status: 'SUBMITTED_TO_PROCESSOR' });
  honeyDatabaseGateway.update(TABLE_NAMES.HARVEST_RECORDS, harvest.id, { status: 'INTAKE_VERIFIED' });
  honeyDatabaseGateway.update(TABLE_NAMES.HARVEST_RECORDS, harvest.id, { status: 'EXTRACTED' });
  pass('Legal harvest progression HARVESTED -> READY_FOR_INTAKE -> SUBMITTED_TO_PROCESSOR -> INTAKE_VERIFIED -> EXTRACTED succeeded');

  // ILLEGAL: EXTRACTED -> HARVESTED
  assert.throws(
    () => {
      honeyDatabaseGateway.update(TABLE_NAMES.HARVEST_RECORDS, harvest.id, {
        status: 'HARVESTED'
      });
    },
    IllegalStateTransitionError,
    'Server must reject EXTRACTED -> HARVESTED'
  );
  pass('Illegal transition EXTRACTED -> HARVESTED strictly rejected');

  // 5. HELPER VALIDATOR QUERY TESTS
  console.log('\n[5/5] Testing validateStateTransition helper predicate...');
  assert.equal(
    honeyDatabaseGateway.validateStateTransition(TABLE_NAMES.PROCESSING_BATCHES, 'CREATED', 'IN_PROCESSING'),
    true
  );
  assert.equal(
    honeyDatabaseGateway.validateStateTransition(TABLE_NAMES.PROCESSING_BATCHES, 'PROCESSING_COMPLETE', 'CREATED'),
    false
  );
  assert.equal(
    honeyDatabaseGateway.validateStateTransition(TABLE_NAMES.DISPATCH_PACKAGES, 'DELIVERED', 'REGISTERED'),
    false
  );
  assert.equal(
    honeyDatabaseGateway.validateStateTransition(TABLE_NAMES.DISPATCH_PACKAGES, 'REGISTERED', 'VALIDATED'),
    true
  );
  pass('State machine helper predicate correctly predicts valid and invalid transitions');

  console.log(`\n====================================================`);
  console.log(`ALL ${checksPassed} STATE MACHINE TRANSITION CHECKS PASSED!`);
  console.log(`====================================================`);
}

runStateMachineSuite().catch(err => {
  console.error('❌ State Machine test failed:', err);
  process.exit(1);
});
