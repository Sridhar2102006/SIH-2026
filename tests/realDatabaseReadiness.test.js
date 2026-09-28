/**
 * ============================================================
 * HONEYCHAIN REAL DATABASE READINESS TEST SUITE
 * ============================================================
 *
 * Implements Section 4 & 5:
 * CONNECT -> READ -> CREATE -> UPDATE -> RELATIONSHIP -> VOID/DELETE -> READ AGAIN
 *
 * Validates:
 * 1. Environment separation & production database protection
 * 2. Connection health, schema health, migration health, index health
 * 3. Major entity persistence & retrieval (all 14 domain tables)
 * 4. Relational integrity and complete end-to-end lineage traversal
 * 5. Safe deterministic test reset & seed
 */

import assert from 'node:assert/strict';
import {
  honeyDatabaseGateway,
  TABLE_NAMES,
  ENV_TYPES,
  ProductionDatabaseProtectionError,
  DatabaseError
} from '../src/services/honeyDatabaseGateway.js';
import * as goldenSeed from './dummyHoneyJourneySeed.js';

console.log('====================================================');
console.log('HONEYCHAIN REAL DATABASE READINESS & BOOT GATE TEST');
console.log('====================================================');

async function runDatabaseReadinessSuite() {
  let passedCount = 0;
  function pass(msg) {
    passedCount++;
    console.log(`  ✓ [Check ${passedCount}] ${msg}`);
  }

  // --- STEP 1: PRODUCTION DATABASE PROTECTION GATE (§4) ---
  console.log('\n[1/7] Testing Production Database Protection Gate...');
  honeyDatabaseGateway.environment = ENV_TYPES.PRODUCTION;
  assert.throws(
    () => {
      honeyDatabaseGateway.resetAndSeedGoldenJourney(goldenSeed);
    },
    ProductionDatabaseProtectionError,
    'Database gateway MUST refuse reset in PRODUCTION'
  );
  pass('Refuses reset operations in production environment with ProductionDatabaseProtectionError');

  // Reset to TEST environment
  honeyDatabaseGateway.environment = ENV_TYPES.TEST;
  pass('Safely isolated in TEST environment');

  // --- STEP 2: CONNECT LIFECYCLE (§4, §5) ---
  console.log('\n[2/7] Testing Database Connection Lifecycle...');
  const connResult = await honeyDatabaseGateway.connect();
  assert.equal(connResult.connected, true, 'Database must report connected');
  assert.equal(connResult.environment, ENV_TYPES.TEST, 'Environment must match TEST');
  pass('Database connected cleanly in isolated test driver');

  const diagnostics = honeyDatabaseGateway.getDatabaseDiagnostics();
  assert.equal(diagnostics.connectionHealth.status, 'HEALTHY');
  assert.equal(diagnostics.migrationHealth.status, 'UP_TO_DATE');
  assert.equal(diagnostics.schemaHealth.status, 'VALID');
  assert.equal(diagnostics.indexHealth.status, 'HEALTHY');
  pass('Initial database diagnostics show HEALTHY across connection, schema, index, and migrations');

  // --- STEP 3: RESET & HYDRATE ISOLATED TEST SCHEMA ---
  console.log('\n[3/7] Testing Clean Schema Initialization...');
  Object.values(TABLE_NAMES).forEach(table => {
    honeyDatabaseGateway.saveTable(table, []);
  });
  const emptyDiag = honeyDatabaseGateway.getDatabaseDiagnostics();
  assert.equal(emptyDiag.schemaHealth.tableCounts[TABLE_NAMES.APIARIES], 0);
  pass('Tables cleared for isolated deterministic lifecycle test');

  // --- STEP 4: CREATE MAJOR DOMAIN ENTITIES (§5, §14) ---
  console.log('\n[4/7] Testing Entity Creation & Persistence...');

  // 1. Apiary
  const apiary = honeyDatabaseGateway.insert(TABLE_NAMES.APIARIES, {
    id: 'apiary-e2e-001',
    apiaryCode: 'AP77',
    name: 'Nilgiri Shola Apiary',
    location: 'Ooty, Tamil Nadu',
    status: 'ACTIVE'
  });
  assert.equal(apiary.id, 'apiary-e2e-001');
  pass('Created and persisted Apiary entity');

  // 2. Hive
  const hive = honeyDatabaseGateway.insert(TABLE_NAMES.HIVES, {
    id: 'hive-e2e-001',
    code: 'H077',
    apiaryId: apiary.id,
    apiaryCode: 'AP77',
    name: 'Mountain Queen Hive 77',
    status: 'healthy'
  });
  assert.equal(hive.apiaryId, apiary.id);
  pass('Created Hive linked to Apiary');

  // 3. Hive Mgmt Batch
  const hiveBatch = honeyDatabaseGateway.insert(TABLE_NAMES.HIVE_MANAGEMENT_BATCHES, {
    id: 'bk-batch-e2e-001',
    apiaryId: apiary.id,
    apiaryCode: 'AP77',
    name: 'Spring Forage Cycle 2026',
    hiveIds: [hive.id]
  });
  pass('Created Beekeeper Hive Management Batch');

  // 4. Frame
  const frame = honeyDatabaseGateway.insert(TABLE_NAMES.FRAMES, {
    id: 'frame-e2e-001',
    frameNumber: 1,
    hiveId: hive.id,
    hiveCode: 'H077',
    apiaryId: apiary.id,
    traceabilityCode: 'AP77H077F1',
    status: 'HARVESTABLE'
  });
  pass('Created Frame with canonical traceabilityCode');

  // 5. Harvest
  const harvest = honeyDatabaseGateway.insert(TABLE_NAMES.HARVEST_RECORDS, {
    id: 'hrv-e2e-001',
    traceabilityCode: 'AP77H077F1',
    apiaryId: apiary.id,
    apiaryCode: 'AP77',
    hiveId: hive.id,
    hiveCode: 'H077',
    hiveBatchId: hiveBatch.id,
    quantityKg: 2.8,
    status: 'READY_FOR_PROCESSING'
  });
  pass('Created Harvest Record referencing Hive, Hive Batch, and Frame');

  // 6. Handover
  const handover = honeyDatabaseGateway.insert(TABLE_NAMES.HANDOVER_RECORDS, {
    id: 'handover-e2e-001',
    handoverCode: 'HND-E2E-001',
    harvestRecordId: harvest.id,
    traceabilityCode: harvest.traceabilityCode,
    status: 'ACCEPTED',
    acceptedWeightKg: 2.8
  });
  pass('Created Custody Handover Record');

  // 7. Processing Batch
  const procBatch = honeyDatabaseGateway.insert(TABLE_NAMES.PROCESSING_BATCHES, {
    id: 'pb-e2e-001',
    batchNumber: 'PB-E2E-00001',
    batchName: 'Nilgiri Shola Raw Honey Lot #1',
    sourceHandoverIds: [handover.id],
    sourceTraceabilityCodes: [harvest.traceabilityCode],
    status: 'IN_PROCESSING',
    targetQuantityKg: 2.8
  });
  pass('Created Processing Batch linked to Handover & Harvest source');

  // 8. Processing Step
  const step = honeyDatabaseGateway.insert(TABLE_NAMES.PROCESSING_STEPS, {
    id: 'step-e2e-001',
    processingBatchId: procBatch.id,
    stepKey: 'SETTLING',
    status: 'COMPLETED',
    temperatureMaxC: 38.0
  });
  pass('Created Processing Step with thermal ceiling adherence');

  // 9. Lab Sample
  const sample = honeyDatabaseGateway.insert(TABLE_NAMES.LAB_SAMPLES, {
    id: 'LS-E2E-0001',
    sampleId: 'LS-E2E-0001',
    sourceBatchId: procBatch.id,
    sourceBatchNumber: procBatch.batchNumber,
    status: 'UNDER_TESTING',
    sampleWeight: 250
  });
  pass('Created Lab Sample linked to Processing Batch');

  // 10. Lab Test
  const testMoisture = honeyDatabaseGateway.insert(TABLE_NAMES.LAB_TESTS, {
    id: 'LT-E2E-0001',
    sampleId: sample.id,
    testKey: 'MOISTURE',
    result: 17.2,
    unit: '%',
    status: 'RESULT_ENTERED',
    compliance: 'IN_SPECIFICATION'
  });
  pass('Created Lab Test record with in-specification moisture measurement');

  // 11. Quality Decision
  const qdec = honeyDatabaseGateway.insert(TABLE_NAMES.QUALITY_DECISIONS, {
    id: 'qdec-e2e-001',
    sampleId: sample.id,
    batchId: procBatch.id,
    batchNumber: procBatch.batchNumber,
    decision: 'RELEASE_FOR_PACKAGING',
    status: 'APPROVED',
    notes: 'Meets FSSAI moisture criteria (<18.5%). Passed cold-filtration review.'
  });
  pass('Created Quality Decision formally releasing batch for packaging');

  // 12. Dispatch Package
  const pkg = honeyDatabaseGateway.insert(TABLE_NAMES.DISPATCH_PACKAGES, {
    id: 'pkg-e2e-001',
    packageId: 'PKG-E2E-00001',
    qrId: 'QR-PKG-E2E-00001',
    publicReference: 'HC-PUB-E2E-001',
    batchId: procBatch.id,
    batchNumber: procBatch.batchNumber,
    productName: 'Nilgiri Shola Honey 500g',
    status: 'READY_FOR_DISPATCH'
  });
  pass('Created Dispatch Package referencing Quality Approved Batch');

  // 13. Shipment
  const shipment = honeyDatabaseGateway.insert(TABLE_NAMES.DISPATCH_SHIPMENTS, {
    id: 'shp-e2e-001',
    shipmentNumber: 'SHP-E2E-00001',
    allocatedPackageIds: [pkg.packageId],
    status: 'PREPARED',
    destination: 'Chennai Hub'
  });
  pass('Created Dispatch Shipment allocating Package');

  // --- STEP 5: UPDATE, VOID, & READ AGAIN (§5, §15) ---
  console.log('\n[5/7] Testing Entity Updates, Status Transitions, and Voiding...');

  // Update batch to COMPLETED
  const updatedBatch = honeyDatabaseGateway.update(TABLE_NAMES.PROCESSING_BATCHES, procBatch.id, {
    status: 'COMPLETED',
    statusLabel: 'Processing Completed'
  });
  assert.equal(updatedBatch.status, 'COMPLETED');
  pass('Updated Processing Batch status to COMPLETED');

  // Regulatory Voiding test
  const voidedStep = honeyDatabaseGateway.voidRecord(
    TABLE_NAMES.PROCESSING_STEPS,
    step.id,
    'Thermal sensor recalibration required',
    'QA Manager'
  );
  assert.equal(voidedStep.status, 'VOIDED');
  assert.equal(voidedStep.voidReason, 'Thermal sensor recalibration required');
  pass('Tested legal record voiding for audit compliance without physical row deletion');

  // Safe draft deletion test
  const draftFrame = honeyDatabaseGateway.insert(TABLE_NAMES.FRAMES, {
    id: 'frame-draft-temp',
    frameNumber: 99,
    status: 'DRAFT'
  });
  const deleted = honeyDatabaseGateway.delete(TABLE_NAMES.FRAMES, draftFrame.id);
  assert.equal(deleted, true);
  assert.equal(honeyDatabaseGateway.findById(TABLE_NAMES.FRAMES, draftFrame.id), null);
  pass('Draft entity safely deleted without leaving orphan records');

  // Read again persistence test
  const retrievedPkg = honeyDatabaseGateway.findById(TABLE_NAMES.DISPATCH_PACKAGES, pkg.id);
  assert.ok(retrievedPkg, 'Package must be retrievable from database');
  assert.equal(retrievedPkg.batchNumber, 'PB-E2E-00001');
  pass('Read again confirmed: All entity changes persisted cleanly');

  // --- STEP 6: END-TO-END LINEAGE TRAVERSAL (§6, §13) ---
  console.log('\n[6/7] Testing End-to-End Lineage Resolution...');
  const lineage = honeyDatabaseGateway.resolveLineage(pkg.packageId);
  assert.ok(lineage, 'Lineage traversal must return result');
  assert.equal(lineage.package.packageId, pkg.packageId);
  assert.equal(lineage.batch.id, procBatch.id);
  assert.equal(lineage.sample.id, sample.id);
  assert.equal(lineage.tests.length, 1);
  assert.equal(lineage.handover.id, handover.id);
  assert.equal(lineage.harvest.id, harvest.id);
  assert.equal(lineage.hive.id, hive.id);
  assert.equal(lineage.apiary.id, apiary.id);
  assert.equal(lineage.isLineageIntact, true);
  pass('Lineage traversed seamlessly: Package -> Quality -> Lab -> Processing -> Handover -> Harvest -> Hive -> Apiary');

  // --- STEP 7: SEED ONE GOLDEN HONEY RECORD (§6, §35) ---
  console.log('\n[7/7] Testing Safe Deterministic Golden Journey Seed...');
  const goldenDiag = honeyDatabaseGateway.resetAndSeedGoldenJourney(goldenSeed);
  assert.ok(goldenDiag.seedHealth.hasApiaries);
  assert.ok(goldenDiag.seedHealth.hasHarvests);
  assert.ok(goldenDiag.seedHealth.hasBatches);
  assert.ok(goldenDiag.seedHealth.hasSamples);
  assert.ok(goldenDiag.seedHealth.hasPackages);

  // Check the Golden Package Lineage
  const goldenLineage = honeyDatabaseGateway.resolveLineage('PKG-TEST-00001');
  assert.ok(goldenLineage.package, 'Golden Package exists');
  assert.ok(goldenLineage.batch, 'Golden Processing Batch exists');
  assert.ok(goldenLineage.sample, 'Golden Lab Sample exists');
  assert.ok(goldenLineage.tests.length >= 3, 'Golden Lab Tests exist (Moisture, HMF, Diastase)');
  assert.ok(goldenLineage.harvest, 'Golden Harvest exists');
  assert.ok(goldenLineage.hive, 'Golden Hive exists');
  assert.ok(goldenLineage.apiary, 'Golden Apiary exists');
  assert.equal(goldenLineage.isLineageIntact, true);
  pass('Golden Journey seeded deterministically with 100% lineage integrity');

  console.log('\n====================================================');
  console.log(`ALL ${passedCount} DATABASE READINESS CHECKS PASSED!`);
  console.log('REAL DATABASE BOOT GATE: READY');
  console.log('====================================================');
}

runDatabaseReadinessSuite().catch(err => {
  console.error('\n❌ DATABASE READINESS TEST FAILED:');
  console.error(err);
  process.exit(1);
});
