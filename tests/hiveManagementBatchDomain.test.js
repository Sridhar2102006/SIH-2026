import assert from 'node:assert/strict';
import {
  HIVE_BATCH_STATUS,
  HIVE_CYCLE_STATUS,
  TELEMETRY_FRESHNESS,
  createHiveManagementBatch,
  createHarvestDocument,
  deriveHiveManagementBatchStatus,
  getInspectionSchedule,
  getTelemetryFreshness,
  validateHarvestSelection
} from '../src/services/hiveManagementBatchDomain.js';

const now = Date.parse('2026-09-27T10:00:00.000Z');

assert.equal(getTelemetryFreshness({ timestamp: '2026-09-27T09:57:00.000Z' }, now), TELEMETRY_FRESHNESS.LIVE);
assert.equal(getTelemetryFreshness({ timestamp: '2026-09-27T09:40:00.000Z' }, now), TELEMETRY_FRESHNESS.RECENT);
assert.equal(getTelemetryFreshness({ timestamp: '2026-09-27T09:00:00.000Z' }, now), TELEMETRY_FRESHNESS.STALE);
assert.equal(getTelemetryFreshness({ timestamp: '2026-09-27T09:57:00.000Z', connectionState: 'OFFLINE' }, now), TELEMETRY_FRESHNESS.OFFLINE);

const schedule = getInspectionSchedule({ lastInspectionAt: '2026-09-18T10:00:00.000Z', intervalDays: 7, now });
assert.equal(schedule.state, 'OVERDUE');
assert.throws(() => getInspectionSchedule({ intervalDays: 0 }), /between 1 and 90/);

const batch = createHiveManagementBatch({
  id: 'bk-batch-001', name: 'Autumn cycle', apiaryId: 'apiary-1', apiaryCode: 'AP1', hiveIds: ['hive-1', 'hive-2', 'hive-3', 'hive-4'], inspectionIntervalDays: 7
});
assert.equal(batch.kind, 'BEEKEEPER_HIVE_MANAGEMENT_BATCH');
assert.equal(batch.status, HIVE_BATCH_STATUS.ACTIVE);
assert.throws(() => createHiveManagementBatch({ name: 'Duplicate cycle', apiaryId: 'apiary-1', apiaryCode: 'AP1', hiveIds: ['hive-1'] }, [batch]), /already in an active/);

const partialMembers = batch.memberships.map(member => ['hive-1', 'hive-3'].includes(member.hiveId)
  ? { ...member, cycleStatus: HIVE_CYCLE_STATUS.HARVESTED }
  : member);
assert.equal(deriveHiveManagementBatchStatus(partialMembers), HIVE_BATCH_STATUS.PARTIALLY_HARVESTED);

const readyBatch = { ...batch, memberships: batch.memberships.map(member => ({ ...member, cycleStatus: HIVE_CYCLE_STATUS.HARVEST_READY })) };
assert.equal(validateHarvestSelection({ batch: readyBatch, hiveIds: ['hive-1', 'hive-3'], idempotencyKey: 'harvest-request-1' }), true);
assert.throws(() => validateHarvestSelection({ batch: readyBatch, hiveIds: ['hive-1'], idempotencyKey: 'harvest-request-1', existingHarvests: [{ idempotencyKey: 'harvest-request-1' }] }), /already been recorded/);
assert.throws(() => validateHarvestSelection({ batch, hiveIds: ['hive-1'], idempotencyKey: 'harvest-request-2' }), /harvest-ready/);

const document = createHarvestDocument({
  handover: { id: 'handover-1', documentNumber: 'HHD-2026-001', status: 'SENT_TO_PROCESSOR' },
  harvests: [{ id: 'harvest-1', hiveId: 'hive-1', quantityKg: 7.2 }, { id: 'harvest-2', hiveId: 'hive-3', quantityKg: 6.8 }],
  generatedAt: '2026-09-27T10:00:00.000Z'
});
assert.equal(document.totalQuantityKg, 14);
assert.deepEqual(document.sourceHiveIds, ['hive-1', 'hive-3']);

console.log('Hive management batch domain: 14 assertions passed');
