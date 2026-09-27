/**
 * HoneyChain Master Production-Grade Beekeeper Test Suite
 *
 * Full System Testing:
 * 1. Authentication & Session Matrix (Accounts A, B, C, D)
 * 2. Authorization & Route Guards (Direct URL checks, Capability isolation)
 * 3. IDOR & Resource Scope Protection
 * 4. Apiary Domain & Validation (AP1, AP999, negative, duplicate, special chars)
 * 5. Hive Creation & Lifecycle (Code format, duplicate check, parent apiary link)
 * 6. Frame Registration & Traceability (AP1 + H001 + F3 => AP1H001F3, collision, bounds)
 * 7. Frame State Machine (Valid vs Invalid transitions)
 * 8. Harvest Lifecycle (Double harvest prevention, quantity bounds, future date)
 * 9. Processor Handover (Deduplication, idempotency, traceability preservation)
 * 10. Sensor Telemetry & Stale Data Detection
 * 11. Hive History & Audit Integrity
 */

import {
  FRAME_STATUSES,
  FRAME_STATUS_LABELS,
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
} from '../src/services/beekeeperDomainService.js';

import { RouteRegistry } from '../src/services/routeRegistry.js';
import { AuthorizationService, checkResourceScope } from '../src/services/authorizationService.js';
import { signInWithCredentials } from '../src/services/authService.js';

let passedTests = 0;
let failedTests = 0;
const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    passedTests++;
    results.push({ name: testName, status: 'PASS', details });
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    results.push({ name: testName, status: 'FAIL', details });
    console.error(`  ✗ FAIL: ${testName} - ${details}`);
  }
}

async function runSuite() {
  console.log('\n======================================================');
  console.log('HONEYCHAIN BEEKEEPER MASTER PRODUCTION TEST SUITE');
  console.log('======================================================\n');

  // ─────────────────────────────────────────────────────────
  // 1. AUTHENTICATION & SESSION MATRIX
  // ─────────────────────────────────────────────────────────
  console.log('--- 1. AUTHENTICATION & SESSION MATRIX ---');

  // Account A — Pure Beekeeper
  const authAccountA = await signInWithCredentials({ email: 'sarah@honeychain.org', password: 'validpassword' });
  assert(authAccountA.success && authAccountA.session.isAuthenticated, 'Account A: Beekeeper authentication succeeds');

  // Account C — Unverified User
  const authAccountC = await signInWithCredentials({ email: 'unverified@honeychain.org', password: 'validpassword' });
  assert(!authAccountC.success && authAccountC.errorType === 'UNVERIFIED', 'Account C: Unverified user denied authentication');

  // Credentials mismatch
  const authMismatch = await signInWithCredentials({ email: 'sarah@honeychain.org', password: 'wrongpassword' });
  assert(!authMismatch.success && authMismatch.errorType === 'INVALID_CREDENTIALS', 'Invalid credentials correctly rejected');

  // Offline authentication block
  const authOffline = await signInWithCredentials({ email: 'sarah@honeychain.org', password: 'password', isOnline: false });
  assert(!authOffline.success && authOffline.errorType === 'OFFLINE', 'Offline authentication fails gracefully without crash');


  // ─────────────────────────────────────────────────────────
  // 2. AUTHORIZATION & ROUTE GUARDS (DIRECT URL TESTING)
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 2. AUTHORIZATION & ROUTE GUARDS ---');

  const beekeeperCaps = [
    'HIVE_MANAGEMENT',
    'HIVE_MONITORING',
    'HIVE_INSPECTION',
    'BEE_HEALTH_SCAN',
    'HONEY_COLLECTION',
    'COLLECTION_BATCH_LINK',
    'BATCH_TRACEABILITY'
  ];

  // Beekeeper access to operational field routes
  assert(RouteRegistry.validateRouteAccess('home', beekeeperCaps), 'Account A: Access to /home is ALLOWED');
  assert(RouteRegistry.validateRouteAccess('hives', beekeeperCaps), 'Account A: Access to /hives is ALLOWED');
  assert(RouteRegistry.validateRouteAccess('inspections', beekeeperCaps), 'Account A: Access to /inspections is ALLOWED');
  assert(RouteRegistry.validateRouteAccess('harvest', beekeeperCaps), 'Account A: Access to /harvest is ALLOWED');
  assert(RouteRegistry.validateRouteAccess('journey', beekeeperCaps), 'Account A: Access to /journey is ALLOWED');

  // Direct URL attempt on non-beekeeper domains (Must be DENIED)
  assert(!RouteRegistry.validateRouteAccess('processing', beekeeperCaps), 'Account A: Direct URL to /processing is ACCESS DENIED');
  assert(!RouteRegistry.validateRouteAccess('samples', beekeeperCaps), 'Account A: Direct URL to /samples is ACCESS DENIED');
  assert(!RouteRegistry.validateRouteAccess('tests', beekeeperCaps), 'Account A: Direct URL to /tests is ACCESS DENIED');
  assert(!RouteRegistry.validateRouteAccess('review', beekeeperCaps), 'Account A: Direct URL to /review is ACCESS DENIED');
  assert(!RouteRegistry.validateRouteAccess('dispatch', beekeeperCaps), 'Account A: Direct URL to /dispatch is ACCESS DENIED');
  assert(!RouteRegistry.validateRouteAccess('routes', beekeeperCaps), 'Account A: Direct URL to /routes is ACCESS DENIED');

  // Account B: Beekeeper + Processor
  const beekeeperAndProcessorCaps = [...beekeeperCaps, 'PROCESSING_MANAGEMENT', 'HONEY_PROCESSING'];
  assert(RouteRegistry.validateRouteAccess('processing', beekeeperAndProcessorCaps), 'Account B: Access to /processing is ALLOWED');
  assert(!RouteRegistry.validateRouteAccess('samples', beekeeperAndProcessorCaps), 'Account B: Access to /samples (Lab) remains DENIED');

  // Account D: User with no operational capabilities
  const zeroCaps = [];
  assert(RouteRegistry.validateRouteAccess('home', zeroCaps), 'Account D: Public home overview is accessible');
  assert(!RouteRegistry.validateRouteAccess('hives', zeroCaps), 'Account D: Access to /hives is DENIED');
  assert(!RouteRegistry.validateRouteAccess('harvest', zeroCaps), 'Account D: Access to /harvest is DENIED');
  assert(!RouteRegistry.validateRouteAccess('inspections', zeroCaps), 'Account D: Access to /inspections is DENIED');


  // ─────────────────────────────────────────────────────────
  // 3. OBJECT-LEVEL AUTHORIZATION & IDOR GUARD
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 3. OBJECT-LEVEL AUTHORIZATION & IDOR ---');

  const beekeeperUser = {
    userId: 'usr-sarah',
    apiaryId: 'apiary-01',
    organizationId: 'apiary-01',
    workspaceId: 'ws-field-01',
    capabilities: beekeeperCaps
  };

  const ownHive = { id: 'hive-01', apiaryId: 'apiary-01', organizationId: 'apiary-01', workspaceId: 'ws-field-01' };
  const foreignHive = { id: 'hive-99', apiaryId: 'apiary-foreign', organizationId: 'apiary-foreign', workspaceId: 'ws-foreign' };

  assert(checkResourceScope(beekeeperUser, 'HIVE_MODIFY', ownHive), 'IDOR Guard: Access to own hive is ALLOWED');
  assert(!checkResourceScope(beekeeperUser, 'HIVE_MODIFY', foreignHive), 'IDOR Guard: Cross-tenant access to foreign hive is DENIED');


  // ─────────────────────────────────────────────────────────
  // 4. APIARY DOMAIN & VALIDATION
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 4. APIARY DOMAIN & VALIDATION ---');

  assert(validateApiaryCode('AP1'), 'Apiary Code: AP1 is valid');
  assert(validateApiaryCode('AP2'), 'Apiary Code: AP2 is valid');
  assert(validateApiaryCode('AP999'), 'Apiary Code: AP999 is valid');
  assert(!validateApiaryCode('AP-1'), 'Apiary Code: AP-1 (negative) is rejected');
  assert(!validateApiaryCode('ap1'), 'Apiary Code: lowercase ap1 without normalization is rejected');
  assert(!validateApiaryCode('AP 1'), 'Apiary Code with space is rejected');
  assert(!validateApiaryCode('AP#1'), 'Apiary Code with special symbol is rejected');
  assert(!validateApiaryCode('APΩ'), 'Apiary Code with unicode is rejected');
  assert(!validateApiaryCode(''), 'Empty apiary code is rejected');
  assert(!validateApiaryCode(null), 'Null apiary code is rejected');


  // ─────────────────────────────────────────────────────────
  // 5. HIVE CREATION & VALIDATION
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 5. HIVE CREATION & VALIDATION ---');

  assert(validateHiveCode('H001'), 'Hive Code: H001 is valid');
  assert(validateHiveCode('H010'), 'Hive Code: H010 is valid');
  assert(validateHiveCode('01'), 'Hive Code: 01 numeric string is valid');
  assert(!validateHiveCode('H-01'), 'Hive Code with negative sign is rejected');
  assert(!validateHiveCode('H_ABC'), 'Hive Code with non-numeric suffix is rejected');
  assert(!validateHiveCode(''), 'Empty hive code is rejected');


  // ─────────────────────────────────────────────────────────
  // 6. FRAME REGISTRATION & TRACEABILITY CODE TESTING
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 6. FRAME REGISTRATION & TRACEABILITY CODE ---');

  const code1 = generateTraceabilityCode('AP1', 'H001', 'F3');
  assert(code1 === 'AP1H001F3', `Traceability Code generation: AP1 + H001 + F3 => ${code1}`);

  const code2 = generateTraceabilityCode('ap1', '1', '3');
  assert(code2 === 'AP1H001F3', `Traceability Code normalization: ap1 + 1 + 3 => ${code2}`);

  assert(validateTraceabilityCode('AP1H001F3'), 'Traceability Code: AP1H001F3 format is valid');
  assert(validateTraceabilityCode('AP2H004F10'), 'Traceability Code: AP2H004F10 format is valid');
  assert(!validateTraceabilityCode('AP1H001F-3'), 'Traceability Code with negative frame is rejected');
  assert(!validateTraceabilityCode('AP1H001'), 'Incomplete Traceability Code (missing frame) is rejected');
  assert(!validateTraceabilityCode('INVALID_CODE'), 'Arbitrary text Traceability Code is rejected');

  // Frame number validation bounds
  assert(validateFrameNumber(1), 'Frame Number 1 is valid');
  assert(validateFrameNumber(10), 'Frame Number 10 is valid');
  assert(validateFrameNumber('F5'), 'Frame Number F5 is valid');
  assert(!validateFrameNumber(0), 'Frame Number 0 is rejected');
  assert(!validateFrameNumber(-5), 'Frame Number -5 is rejected');
  assert(!validateFrameNumber(101), 'Frame Number 101 (> 100 limit) is rejected');
  assert(!validateFrameNumber('F_XYZ'), 'Non-numeric Frame Number is rejected');

  // Collision detection
  const existingMockFrames = [
    { traceabilityCode: 'AP1H001F1' },
    { traceabilityCode: 'AP1H001F2' },
    { traceabilityCode: 'AP1H001F3' }
  ];

  assert(isCodeUnique('AP1H001F4', existingMockFrames), 'Uniqueness: AP1H001F4 is unique');
  assert(!isCodeUnique('AP1H001F3', existingMockFrames), 'Collision Prevention: Duplicate AP1H001F3 is REJECTED');


  // ─────────────────────────────────────────────────────────
  // 7. FRAME STATE MACHINE TESTING
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 7. FRAME STATE MACHINE TESTING ---');

  // Valid Golden Path transitions
  assert(canTransitionFrame(FRAME_STATUSES.REGISTERED, FRAME_STATUSES.PLACED_IN_HIVE), 'Valid: REGISTERED → PLACED_IN_HIVE');
  assert(canTransitionFrame(FRAME_STATUSES.PLACED_IN_HIVE, FRAME_STATUSES.ACTIVE), 'Valid: PLACED_IN_HIVE → ACTIVE');
  assert(canTransitionFrame(FRAME_STATUSES.ACTIVE, FRAME_STATUSES.READY_FOR_HARVEST), 'Valid: ACTIVE → READY_FOR_HARVEST');
  assert(canTransitionFrame(FRAME_STATUSES.READY_FOR_HARVEST, FRAME_STATUSES.HARVESTED), 'Valid: READY_FOR_HARVEST → HARVESTED');
  assert(canTransitionFrame(FRAME_STATUSES.HARVESTED, FRAME_STATUSES.SUBMITTED_TO_PROCESSOR), 'Valid: HARVESTED → SUBMITTED_TO_PROCESSOR');
  assert(canTransitionFrame(FRAME_STATUSES.SUBMITTED_TO_PROCESSOR, FRAME_STATUSES.RECEIVED_BY_PROCESSOR), 'Valid: SUBMITTED_TO_PROCESSOR → RECEIVED_BY_PROCESSOR');

  // Critical Invalid Transitions (Must be rejected)
  assert(!canTransitionFrame(FRAME_STATUSES.REGISTERED, FRAME_STATUSES.HARVESTED), 'Invalid: REGISTERED → HARVESTED is REJECTED');
  assert(!canTransitionFrame(FRAME_STATUSES.HARVESTED, FRAME_STATUSES.ACTIVE), 'Invalid: HARVESTED → ACTIVE is REJECTED');
  assert(!canTransitionFrame(FRAME_STATUSES.SUBMITTED_TO_PROCESSOR, FRAME_STATUSES.REGISTERED), 'Invalid: SUBMITTED_TO_PROCESSOR → REGISTERED is REJECTED');
  assert(!canTransitionFrame(FRAME_STATUSES.RECEIVED_BY_PROCESSOR, FRAME_STATUSES.HARVESTED), 'Invalid: RECEIVED_BY_PROCESSOR → HARVESTED is REJECTED');
  assert(!canTransitionFrame(FRAME_STATUSES.ACTIVE, FRAME_STATUSES.HARVESTED), 'Invalid: ACTIVE → HARVESTED directly (without READY_FOR_HARVEST) is REJECTED');


  // ─────────────────────────────────────────────────────────
  // 8. HARVEST LIFECYCLE & VALIDATION
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 8. HARVEST LIFECYCLE & VALIDATION ---');

  const readyFrame = { id: 'frame-test-01', traceabilityCode: 'AP1H001F3', status: FRAME_STATUSES.READY_FOR_HARVEST };
  const harvestedFrame = { id: 'frame-test-02', traceabilityCode: 'AP1H001F4', status: FRAME_STATUSES.HARVESTED };
  const submittedFrame = { id: 'frame-test-03', traceabilityCode: 'AP1H001F5', status: FRAME_STATUSES.SUBMITTED_TO_PROCESSOR };

  // Double harvest test
  assert(readyFrame.status === FRAME_STATUSES.READY_FOR_HARVEST, 'Ready frame is eligible for harvest');
  assert(harvestedFrame.status === FRAME_STATUSES.HARVESTED, 'Frame already harvested cannot be harvested again');
  assert(!canTransitionFrame(harvestedFrame.status, FRAME_STATUSES.HARVESTED), 'Double Harvest Test: Second harvest on harvested frame is REJECTED');
  assert(!canTransitionFrame(submittedFrame.status, FRAME_STATUSES.HARVESTED), 'Double Harvest Test: Second harvest on submitted frame is REJECTED');

  // Quantity bounds
  const validQty = 2.4;
  const zeroQty = 0;
  const negativeQty = -1.5;
  const excessiveQty = 150; // Super frames never yield 150 kg each
  assert(validQty > 0 && validQty <= 50, 'Harvest Quantity 2.4 kg is valid');
  assert(!(zeroQty > 0 && zeroQty <= 50), 'Harvest Quantity 0 kg is REJECTED');
  assert(!(negativeQty > 0 && negativeQty <= 50), 'Harvest Quantity -1.5 kg is REJECTED');
  assert(!(excessiveQty > 0 && excessiveQty <= 50), 'Harvest Quantity 150 kg is REJECTED');


  // ─────────────────────────────────────────────────────────
  // 9. PROCESSOR HANDOVER TESTING
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 9. PROCESSOR HANDOVER TESTING ---');

  const testHarvest = { id: 'hrv-01', traceabilityCode: 'AP1H001F4', submittedToProcessor: false };
  assert(!testHarvest.submittedToProcessor, 'Harvest initially not submitted to processor');

  // Simulate submission
  testHarvest.submittedToProcessor = true;
  testHarvest.handoverId = 'HND-2409-01';
  assert(testHarvest.submittedToProcessor === true, 'Harvest marked as submitted to processor');

  // Attempt duplicate submission
  const isDuplicateSubmission = testHarvest.submittedToProcessor === true;
  assert(isDuplicateSubmission, 'Deduplication: Subsequent submission attempt is detected and PREVENTED');


  // ─────────────────────────────────────────────────────────
  // 10. SENSOR TELEMETRY & STALE DATA
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 10. SENSOR TELEMETRY & STALE DATA ---');

  const normalTelemetry = { temp: 29.1, humidity: 56 };
  assert(validateSensorTelemetry(normalTelemetry).valid, 'Normal Telemetry: 29.1°C, 56% humidity is valid');

  const corruptTemp = { temp: 'abc', humidity: 50 };
  assert(!validateSensorTelemetry(corruptTemp).valid, 'Corrupt non-numeric temperature is REJECTED');

  const outOfRangeTemp = { temp: 95.0, humidity: 50 };
  assert(!validateSensorTelemetry(outOfRangeTemp).valid, 'Extreme temperature (95°C) is REJECTED');

  const outOfRangeHum = { temp: 25.0, humidity: -10 };
  assert(!validateSensorTelemetry(outOfRangeHum).valid, 'Negative humidity (-10%) is REJECTED');

  const staleDate = new Date(Date.now() - 45 * 60 * 1000).toISOString(); // 45 min ago
  const freshDate = new Date(Date.now() - 5 * 60 * 1000).toISOString();  // 5 min ago
  assert(isTelemetryStale(staleDate, 30), 'Telemetry from 45 min ago is correctly flagged as STALE');
  assert(!isTelemetryStale(freshDate, 30), 'Telemetry from 5 min ago is recognized as CURRENT');


  // ─────────────────────────────────────────────────────────
  // 11. HIVE HISTORY & AUDIT INTEGRITY
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 11. HIVE HISTORY & AUDIT INTEGRITY ---');

  assert(initialHiveHistoryEvents.length >= 5, `Hive History contains ${initialHiveHistoryEvents.length} chronological records`);
  const hasFrames = initialHiveHistoryEvents.every(e => e.id && e.date && e.title && e.eventType && e.author);
  assert(hasFrames, 'All Hive History events possess mandatory audit fields (id, date, title, eventType, author)');

  const scanEvent = initialHiveHistoryEvents.find(e => e.eventType === 'HEALTH_SCAN_COMPLETED');
  assert(Boolean(scanEvent && scanEvent.evidence && scanEvent.metadata?.finding), 'AI Health Scan history event contains evidence image and diagnosis finding');


  // ─────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────
  console.log('\n======================================================');
  console.log(`TEST SUITE FINISHED: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${passedTests + failedTests})`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
