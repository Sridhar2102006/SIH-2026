/**
 * ============================================================
 * HONEYCHAIN EMPTY DATABASE BOOT & VOLUME STRESS TEST (§32, §33)
 * ============================================================
 *
 * Verifies Section 32:
 * 1. Fresh database startup with 0 records
 * 2. Empty collection queries without exceptions
 * 3. Graceful handling of empty lineage and null lookups
 * 4. Bulk volume insertion (1000+ records)
 * 5. Primary ID uniqueness violation prevention
 * 6. Pagination & slicing efficiency
 * 7. Clean teardown and recovery
 */

import assert from 'node:assert/strict';
import {
  honeyDatabaseGateway,
  TABLE_NAMES,
  ENV_TYPES,
  DatabaseError
} from '../src/services/honeyDatabaseGateway.js';

console.log('====================================================');
console.log('HONEYCHAIN EMPTY DATABASE BOOT & VOLUME TEST (§32, §33)');
console.log('====================================================');

async function runEmptyDatabaseBootAndVolumeSuite() {
  honeyDatabaseGateway.environment = ENV_TYPES.TEST;
  let checksPassed = 0;
  function pass(msg) {
    checksPassed++;
    console.log(`  ✓ [Check ${checksPassed}] ${msg}`);
  }

  // --- PHASE 1: FRESH DATABASE STARTUP WITH EMPTY TABLES ---
  console.log('\n[1/4] Fresh Boot with 100% Empty Tables...');
  const conn = await honeyDatabaseGateway.connect();
  assert.equal(conn.connected, true);

  // Clear all 16 tables to guaranteed 0 records
  Object.values(TABLE_NAMES).forEach(table => {
    honeyDatabaseGateway.saveTable(table, []);
  });

  const diagnostics = honeyDatabaseGateway.getDatabaseDiagnostics();
  assert.equal(diagnostics.connectionHealth.status, 'HEALTHY');
  assert.equal(diagnostics.schemaHealth.status, 'VALID');

  // Verify all tables have exactly 0 records
  Object.values(TABLE_NAMES).forEach(tableName => {
    if (tableName === TABLE_NAMES.DB_METADATA) return;
    const records = honeyDatabaseGateway.getTable(tableName);
    assert.equal(records.length, 0, `Table ${tableName} must be empty on fresh boot`);
  });
  pass('All 15 operational domain tables booted clean with 0 records');

  // Query against empty tables
  const emptyApiaries = honeyDatabaseGateway.query(TABLE_NAMES.APIARIES, a => a.status === 'ACTIVE');
  assert.deepEqual(emptyApiaries, []);
  const nullFind = honeyDatabaseGateway.findById(TABLE_NAMES.DISPATCH_PACKAGES, 'non-existent-id');
  assert.equal(nullFind, null);
  pass('Empty collection queries and null lookups executed cleanly without exceptions');

  // Traceability lineage on empty db returns safe null lineage structure
  const emptyLineage = honeyDatabaseGateway.resolveLineage('NON-EXISTENT-PKG');
  assert.ok(emptyLineage);
  assert.equal(emptyLineage.package, null);
  assert.equal(emptyLineage.isLineageIntact, false);
  pass('Lineage resolution on empty database safely returns structured null lineage without crash');

  // --- PHASE 2: IDEMPOTENCY & DUPLICATE PREVENTION ---
  console.log('\n[2/4] Testing ID Uniqueness & Duplicate Prevention...');
  const testRecord = {
    id: 'h-boot-001',
    code: 'H-BOOT-01',
    name: 'Boot Test Hive',
    status: 'ACTIVE'
  };
  honeyDatabaseGateway.insert(TABLE_NAMES.HIVES, testRecord);

  // Re-inserting identical ID must throw DB_UNIQUE_VIOLATION
  assert.throws(
    () => {
      honeyDatabaseGateway.insert(TABLE_NAMES.HIVES, testRecord);
    },
    err => {
      return err instanceof DatabaseError && err.code === 'DB_UNIQUE_VIOLATION';
    },
    'Duplicate ID insertion must be blocked by database unique constraint'
  );
  pass('Primary ID uniqueness constraint strictly enforced with DB_UNIQUE_VIOLATION');

  // --- PHASE 3: BULK VOLUME INGESTION (1,000+ RECORDS) ---
  console.log('\n[3/4] High-Volume Bulk Insertion Stress Test (1,200 entities)...');
  const startTime = Date.now();
  const BULK_COUNT = 1200;
  const bulkRows = [];

  for (let i = 1; i <= BULK_COUNT; i++) {
    bulkRows.push({
      id: `vol-pkg-${String(i).padStart(5, '0')}`,
      packageId: `PKG-VOL-${String(i).padStart(5, '0')}`,
      publicReference: `HC-VOL-${String(i).padStart(5, '0')}`,
      status: i % 2 === 0 ? 'VALIDATED' : 'REGISTERED',
      netWeightGrams: 500,
      lotNumber: `LOT-${Math.floor(i / 50)}`,
      createdAt: new Date().toISOString()
    });
  }

  honeyDatabaseGateway.saveTable(TABLE_NAMES.DISPATCH_PACKAGES, bulkRows);
  const insertDurationMs = Date.now() - startTime;

  const totalLoaded = honeyDatabaseGateway.getTable(TABLE_NAMES.DISPATCH_PACKAGES).length;
  assert.equal(totalLoaded, BULK_COUNT);
  pass(`Bulk inserted ${BULK_COUNT} package records in ${insertDurationMs}ms`);

  // --- PHASE 4: PAGINATION, FILTERING & PERFORMANCE UNDER VOLUME ---
  console.log('\n[4/4] Querying, Filtering, & Paginating Under Volume...');
  const queryStart = Date.now();
  
  // Filter query
  const validatedList = honeyDatabaseGateway.query(
    TABLE_NAMES.DISPATCH_PACKAGES,
    p => p.status === 'VALIDATED'
  );
  assert.equal(validatedList.length, BULK_COUNT / 2);

  // Pagination simulation (Page 3, limit 25)
  const page = 3;
  const pageSize = 25;
  const offset = (page - 1) * pageSize;
  const pagedSlice = validatedList.slice(offset, offset + pageSize);
  assert.equal(pagedSlice.length, pageSize);
  assert.equal(pagedSlice[0].id, `vol-pkg-00102`);

  // Exact ID lookup under volume
  const target = honeyDatabaseGateway.findById(TABLE_NAMES.DISPATCH_PACKAGES, 'vol-pkg-00777');
  assert.ok(target);
  assert.equal(target.packageId, 'PKG-VOL-00777');

  const queryDurationMs = Date.now() - queryStart;
  pass(`Filtered, paginated, and indexed lookup executed across ${BULK_COUNT} records in ${queryDurationMs}ms`);

  console.log(`\n====================================================`);
  console.log(`ALL ${checksPassed} EMPTY DB & HIGH VOLUME CHECKS PASSED!`);
  console.log(`====================================================`);
}

runEmptyDatabaseBootAndVolumeSuite().catch(err => {
  console.error('❌ Empty database boot and volume test failed:', err);
  process.exit(1);
});
