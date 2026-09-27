export * from '../domain/indiaApicultureDomain.js';

/**
 * HoneyChain Beekeeper Domain Service & Field Traceability Engine
 *
 * Implements the core domain lifecycle:
 * APIARY (AP1) â†’ HIVE BOX (H001) â†’ FRAME (F3) â†’ TRACEABILITY CODE (AP1H001F3)
 * â†’ AI DISEASE INSPECTION â†’ HARVEST â†’ PROCESSOR HANDOVER â†’ JOURNEY TRACEABILITY
 */

export const FRAME_STATUSES = {
  REGISTERED: 'REGISTERED',
  PLACED_IN_HIVE: 'PLACED_IN_HIVE',
  ACTIVE: 'ACTIVE',
  UNDER_INSPECTION: 'UNDER_INSPECTION',
  READY_FOR_HARVEST: 'READY_FOR_HARVEST',
  HARVESTED: 'HARVESTED',
  SUBMITTED_TO_PROCESSOR: 'SUBMITTED_TO_PROCESSOR',
  RECEIVED_BY_PROCESSOR: 'RECEIVED_BY_PROCESSOR'
};

export const FRAME_STATUS_LABELS = {
  REGISTERED: 'Registered',
  PLACED_IN_HIVE: 'Placed in Hive',
  ACTIVE: 'Active in Brood/Super',
  UNDER_INSPECTION: 'Under Inspection',
  READY_FOR_HARVEST: 'Ready for Harvest',
  HARVESTED: 'Harvested',
  SUBMITTED_TO_PROCESSOR: 'Submitted to Processor',
  RECEIVED_BY_PROCESSOR: 'Received at Facility'
};

export const HONEY_TYPES = [
  'Wildflower',
  'Sweet Clover',
  'Acacia',
  'Highland Lavender & Sage',
  'Blackberry Blossom',
  'Forest Blossom',
  'Other',
  'Unknown / Not recorded'
];

/**
 * Valid Frame Lifecycle Transitions (Strict Business Domain Rule)
 */
export const ALLOWED_FRAME_TRANSITIONS = {
  REGISTERED: ['PLACED_IN_HIVE', 'ACTIVE'],
  PLACED_IN_HIVE: ['ACTIVE', 'UNDER_INSPECTION'],
  ACTIVE: ['UNDER_INSPECTION', 'READY_FOR_HARVEST'],
  UNDER_INSPECTION: ['ACTIVE', 'READY_FOR_HARVEST'],
  READY_FOR_HARVEST: ['HARVESTED', 'ACTIVE'],
  HARVESTED: ['SUBMITTED_TO_PROCESSOR'],
  SUBMITTED_TO_PROCESSOR: ['RECEIVED_BY_PROCESSOR'],
  RECEIVED_BY_PROCESSOR: []
};

/**
 * Deterministic Traceability Code Generator
 * Format: [APIARY CODE][HIVE CODE][FRAME CODE]
 * Example: AP1 + H001 + F3 -> AP1H001F3
 */
export function generateTraceabilityCode(apiaryCode, hiveCode, frameNumber) {
  const cleanApiary = String(apiaryCode || '').toUpperCase().trim();
  let cleanHive = String(hiveCode || '').toUpperCase().trim();
  if (!cleanHive.startsWith('H')) {
    cleanHive = `H${cleanHive.padStart(3, '0')}`;
  }
  let cleanFrame = String(frameNumber || '').toUpperCase().trim();
  if (!cleanFrame.startsWith('F')) {
    cleanFrame = `F${cleanFrame}`;
  }
  return `${cleanApiary}${cleanHive}${cleanFrame}`;
}

/**
 * Validates Traceability Code Format
 * Strict format: AP<digits>H<digits>F<digits>
 * Rejects negative numbers, unicode, symbols, lowercase spaces
 */
export function validateTraceabilityCode(code) {
  if (!code || typeof code !== 'string') return false;
  const trimmed = code.trim().toUpperCase();
  const regex = /^AP[1-9][0-9]*H[0-9]{2,4}F[1-9][0-9]*$/;
  return regex.test(trimmed);
}

/**
 * Validates Apiary Code
 * e.g. AP1, AP2, AP999. Rejects negative numbers, lowercase, special chars, unicode, empty.
 */
export function validateApiaryCode(code) {
  if (!code || typeof code !== 'string') return false;
  const trimmed = code.trim();
  const regex = /^AP[1-9][0-9]*$/;
  return regex.test(trimmed);
}

/**
 * Validates Hive Code
 * e.g. H001, H002, 01, 10
 */
export function validateHiveCode(code) {
  if (!code) return false;
  const str = String(code).trim().toUpperCase();
  const regex = /^(H[0-9]{2,4}|[0-9]{1,4})$/;
  return regex.test(str);
}

/**
 * Validates Frame Number
 * e.g. 1, 2, 10, F1, F10. Rejects <= 0, > 100, non-numeric, special characters.
 */
export function validateFrameNumber(frameNumber) {
  if (!frameNumber) return false;
  let str = String(frameNumber).trim().toUpperCase();
  if (str.startsWith('F')) str = str.slice(1);
  const num = parseInt(str, 10);
  if (isNaN(num) || String(num) !== str) return false;
  return num >= 1 && num <= 100;
}

/**
 * Enforces Collision Prevention: UNIQUE(traceability_code)
 */
export function isCodeUnique(code, existingFrames = []) {
  if (!code) return false;
  const target = code.toUpperCase().trim();
  return !existingFrames.some(f => (f.traceabilityCode || '').toUpperCase() === target);
}

/**
 * Validate Frame Transition
 */
export function canTransitionFrame(currentStatus, nextStatus) {
  if (!currentStatus || !nextStatus) return false;
  const allowed = ALLOWED_FRAME_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

/**
 * Sensor Telemetry Validation
 * Rejects corrupt, impossible, or NaN values from ESP32 nodes
 */
export function validateSensorTelemetry(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Telemetry payload must be an object' };
  }
  const { temp, humidity } = data;

  if (temp !== undefined && temp !== null) {
    const t = parseFloat(temp);
    if (isNaN(t) || t < -25 || t > 65) {
      return { valid: false, error: `Invalid temperature telemetry: ${temp}Â°C` };
    }
  }

  if (humidity !== undefined && humidity !== null) {
    const h = parseFloat(humidity);
    if (isNaN(h) || h < 0 || h > 100) {
      return { valid: false, error: `Invalid humidity telemetry: ${humidity}%` };
    }
  }

  return { valid: true };
}

/**
 * Stale Sensor Data Detection
 */
export function isTelemetryStale(lastUpdateTimestamp, maxMinutes = 30) {
  if (!lastUpdateTimestamp) return true;
  const lastTime = new Date(lastUpdateTimestamp).getTime();
  if (isNaN(lastTime)) return false; // If relative string like "8 min ago", handled by UI
  const now = Date.now();
  const diffMinutes = (now - lastTime) / (1000 * 60);
  return diffMinutes > maxMinutes;
}

/**
 * Initial Apiaries Data
 */

export const initialApiaries = [];

export const initialFrames = [];

export const initialHarvestRecords = [];

export const initialHandoverRecords = [];

export const initialHiveHistoryEvents = [];

export const BeekeeperDomainService = {
  FRAME_STATUSES,
  FRAME_STATUS_LABELS,
  HONEY_TYPES,
  ALLOWED_FRAME_TRANSITIONS,
  generateTraceabilityCode,
  validateTraceabilityCode,
  validateApiaryCode,
  validateHiveCode,
  validateFrameNumber,
  validateSensorTelemetry,
  isTelemetryStale,
  isCodeUnique,
  canTransitionFrame,
  initialApiaries,
  initialFrames,
  initialHarvestRecords,
  initialHandoverRecords,
  initialHiveHistoryEvents
};
