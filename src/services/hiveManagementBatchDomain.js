/**
 * Beekeeper production-cycle domain. This is intentionally separate from a
 * processor-side honey batch: it groups hives for field management only.
 */
export const HIVE_BATCH_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  MONITORING: 'MONITORING',
  HARVEST_READY: 'HARVEST_READY',
  PARTIALLY_HARVESTED: 'PARTIALLY_HARVESTED',
  HARVESTED: 'HARVESTED',
  PROCESSING_HANDOVER: 'PROCESSING_HANDOVER',
  COMPLETED: 'COMPLETED'
});

export const HIVE_CYCLE_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  MONITORING: 'MONITORING',
  ATTENTION: 'ATTENTION',
  HARVEST_READY: 'HARVEST_READY',
  HARVESTED: 'HARVESTED',
  PROCESSING_HANDOVER: 'PROCESSING_HANDOVER'
});

export const TELEMETRY_FRESHNESS = Object.freeze({
  LIVE: 'LIVE',
  RECENT: 'RECENT',
  STALE: 'STALE',
  OFFLINE: 'OFFLINE',
  NO_DATA: 'NO_DATA'
});

const dayMs = 24 * 60 * 60 * 1000;

export function getTelemetryFreshness(reading, now = Date.now()) {
  if (!reading?.timestamp) return TELEMETRY_FRESHNESS.NO_DATA;
  if (reading.connectionState === 'OFFLINE') return TELEMETRY_FRESHNESS.OFFLINE;
  const timestamp = new Date(reading.timestamp).getTime();
  if (Number.isNaN(timestamp)) return TELEMETRY_FRESHNESS.STALE;
  const ageMinutes = Math.max(0, (now - timestamp) / 60000);
  if (ageMinutes <= 5) return TELEMETRY_FRESHNESS.LIVE;
  if (ageMinutes <= 30) return TELEMETRY_FRESHNESS.RECENT;
  return TELEMETRY_FRESHNESS.STALE;
}

export function getInspectionSchedule({ lastInspectionAt, intervalDays, now = Date.now() }) {
  const interval = Number(intervalDays);
  if (!Number.isFinite(interval) || interval < 1 || interval > 90) {
    throw new Error('Inspection interval must be between 1 and 90 days.');
  }
  const last = lastInspectionAt ? new Date(lastInspectionAt).getTime() : null;
  if (!last || Number.isNaN(last)) {
    return { dueAt: null, state: 'DUE', daysUntilDue: 0 };
  }
  const dueAt = new Date(last + interval * dayMs).toISOString();
  const daysUntilDue = Math.ceil((new Date(dueAt).getTime() - now) / dayMs);
  return {
    dueAt,
    daysUntilDue,
    state: daysUntilDue < 0 ? 'OVERDUE' : daysUntilDue === 0 ? 'DUE' : 'UPCOMING'
  };
}

export function deriveHiveManagementBatchStatus(memberships = []) {
  const states = memberships.map(member => member.cycleStatus);
  if (!states.length) return HIVE_BATCH_STATUS.DRAFT;
  if (states.every(state => state === HIVE_CYCLE_STATUS.PROCESSING_HANDOVER)) return HIVE_BATCH_STATUS.PROCESSING_HANDOVER;
  if (states.every(state => [HIVE_CYCLE_STATUS.HARVESTED, HIVE_CYCLE_STATUS.PROCESSING_HANDOVER].includes(state))) return HIVE_BATCH_STATUS.HARVESTED;
  if (states.some(state => [HIVE_CYCLE_STATUS.HARVESTED, HIVE_CYCLE_STATUS.PROCESSING_HANDOVER].includes(state))) return HIVE_BATCH_STATUS.PARTIALLY_HARVESTED;
  if (states.some(state => state === HIVE_CYCLE_STATUS.HARVEST_READY)) return HIVE_BATCH_STATUS.HARVEST_READY;
  if (states.some(state => state === HIVE_CYCLE_STATUS.MONITORING || state === HIVE_CYCLE_STATUS.ATTENTION)) return HIVE_BATCH_STATUS.MONITORING;
  return HIVE_BATCH_STATUS.ACTIVE;
}

export function createHiveManagementBatch({ id, name, apiaryId, apiaryCode, hiveIds, startDate, inspectionIntervalDays = 7, notes = '', actor = 'Beekeeper' }, existingBatches = []) {
  if (!name?.trim()) throw new Error('Batch name is required.');
  if (!apiaryId || !apiaryCode) throw new Error('An apiary is required.');
  if (!Array.isArray(hiveIds) || hiveIds.length === 0) throw new Error('Select at least one hive.');
  if (new Set(hiveIds).size !== hiveIds.length) throw new Error('A hive can be included only once in a batch.');
  const activeHiveIds = new Set(
    existingBatches
      .filter(batch => ![HIVE_BATCH_STATUS.COMPLETED, HIVE_BATCH_STATUS.HARVESTED].includes(batch.status))
      .flatMap(batch => batch.memberships || [])
      .map(member => member.hiveId)
  );
  if (hiveIds.some(hiveId => activeHiveIds.has(hiveId))) {
    throw new Error('A selected hive is already in an active management cycle.');
  }
  const interval = Number(inspectionIntervalDays);
  if (!Number.isFinite(interval) || interval < 1 || interval > 90) throw new Error('Inspection interval must be between 1 and 90 days.');
  const createdAt = new Date().toISOString();
  const memberships = hiveIds.map(hiveId => ({ hiveId, cycleStatus: HIVE_CYCLE_STATUS.ACTIVE, inspectionIntervalDays: interval, joinedAt: createdAt }));
  return {
    id: id || `bk-batch-${Date.now()}`,
    kind: 'BEEKEEPER_HIVE_MANAGEMENT_BATCH',
    name: name.trim(),
    apiaryId,
    apiaryCode,
    startDate: startDate || createdAt.slice(0, 10),
    inspectionIntervalDays: interval,
    notes: notes.trim(),
    memberships,
    status: deriveHiveManagementBatchStatus(memberships),
    activityLog: [{ id: `batch-log-${Date.now()}`, at: createdAt, actor, eventType: 'BATCH_CREATED', status: HIVE_BATCH_STATUS.ACTIVE }]
  };
}

export function validateHarvestSelection({ batch, hiveIds, existingHarvests = [], idempotencyKey }) {
  if (!batch || batch.kind !== 'BEEKEEPER_HIVE_MANAGEMENT_BATCH') throw new Error('A beekeeper hive-management batch is required.');
  if (!Array.isArray(hiveIds) || !hiveIds.length) throw new Error('Select at least one hive to harvest.');
  const memberByHive = new Map((batch.memberships || []).map(member => [member.hiveId, member]));
  for (const hiveId of hiveIds) {
    const member = memberByHive.get(hiveId);
    if (!member) throw new Error('Every harvested hive must belong to the selected batch.');
    if (member.cycleStatus !== HIVE_CYCLE_STATUS.HARVEST_READY) throw new Error('Only harvest-ready hives can be harvested.');
  }
  if (!idempotencyKey?.trim()) throw new Error('An idempotency key is required for harvest recording.');
  if (existingHarvests.some(harvest => harvest.idempotencyKey === idempotencyKey)) throw new Error('This harvest request has already been recorded.');
  return true;
}

export function createHarvestDocument({ handover, harvests, generatedAt = new Date().toISOString() }) {
  if (!handover?.id || !Array.isArray(harvests) || !harvests.length) throw new Error('A persisted handover with at least one harvest is required.');
  return {
    id: `harvest-doc-${handover.id}`,
    kind: 'HARVEST_PROCESSING_HANDOVER_DOCUMENT',
    handoverId: handover.id,
    documentNumber: handover.documentNumber || `HHD-${handover.id}`,
    generatedAt,
    sourceHarvestIds: harvests.map(harvest => harvest.id),
    sourceHiveIds: [...new Set(harvests.map(harvest => harvest.hiveId))],
    totalQuantityKg: harvests.reduce((total, harvest) => total + Number(harvest.quantityKg || 0), 0),
    status: handover.status
  };
}
