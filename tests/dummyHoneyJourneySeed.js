/**
 * ============================================================
 * HONEYCHAIN DUMMY DATABASE SEED — SINGLE HONEY JOURNEY
 * ============================================================
 *
 * PURPOSE:
 *   Creates exactly ONE synthetic honey journey for end-to-end
 *   validation of HoneyChain real data flow.
 *
 * ARCHITECTURE CONTEXT:
 *   HoneyChain is a pure frontend React/Vite application. There is
 *   no backend server and no persistent database. All state is held
 *   in React context (AppStateContext) seeded from in-memory JS
 *   constants exported by service modules.
 *
 *   "Database" = React in-memory state initialized from service constants.
 *   "Seed"     = Deterministic construction of initial state objects.
 *
 * SAFETY RULE:
 *   All IDs use the prefix "TEST-" or code "AP99/H099" to ensure
 *   zero collision with real/demo data. This seed is deterministic
 *   and idempotent (running it twice produces the same IDs).
 *
 * JOURNEY ID MAP:
 *   User/Beekeeper:       user-test-beekeeper-001
 *   Apiary:               apiary-test-001  (code: AP99)
 *   Hive:                 hive-test-001    (code: H099)
 *   HiveMgmtBatch:        bk-batch-test-001
 *   Frame:                frame-test-001   (traceability: AP99H099F9)
 *   Harvest:              hrv-test-001
 *   Handover:             handover-test-001
 *   ProcessingBatch:      pb-test-001      (code: PB-TEST-00001)
 *   LabSample:            LS-TEST-0001
 *   LabTest (Moisture):   LT-TEST-0001
 *   LabTest (HMF):        LT-TEST-0002
 *   LabTest (Diastase):   LT-TEST-0003
 *   QualityDecision:      qdec-test-001
 *   Package:              PKG-TEST-00001
 *   QR:                   QR-TEST-00001
 *   Shipment:             SHP-TEST-001
 *   PublicRef:            HC-PUB-TEST-001
 */

// SAFETY GUARD: refuse to execute in production
const ENV = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || 'development';
if (ENV === 'production' || ENV === 'prod' || ENV === 'live') {
  throw new Error(
    '[SAFETY GUARD] dummyHoneyJourneySeed.js: Refusing to execute in production environment. ' +
    'Current NODE_ENV="' + ENV + '". Set NODE_ENV=test or NODE_ENV=development.'
  );
}

const HARVEST_DATE    = '2026-09-27';
const HARVEST_TIME    = '08:30';
const PROCESSING_DATE = '2026-09-27';
const LAB_DATE        = '2026-09-27';
const QUALITY_DATE    = '2026-09-27';
const PACKAGE_DATE    = '2026-09-27';
const DISPATCH_DATE   = '2026-09-27';
const SEALED_AT       = '27 Sep 2026 14:00 UTC';

export const TEST_USER = {
  id:           'user-test-beekeeper-001',
  email:        'test.beekeeper@honeychain.local',
  name:         'HoneyChain Test Beekeeper',
  organisation: 'HoneyChain Dummy Apiary',
  role:         'Test Beekeeper',
  designations: ['BEEKEEPER'],
  capabilities: ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'BEE_HEALTH_SCAN', 'HONEY_COLLECTION', 'COLLECTION_BATCH_LINK', 'BATCH_TRACEABILITY'],
  isTestFixture: true
};

export const TEST_APIARY = {
  id:               'apiary-test-001',
  apiaryCode:       'AP99',
  name:             'HoneyChain Test Apiary',
  location:         'Coimbatore, Tamil Nadu, India',
  hiveBoxesCount:   1,
  activeFramesCount: 1,
  registrationDate: '27 Sep 2026',
  status:           'active',
  operator:         'HoneyChain Test Beekeeper',
  notes:            '[TEST FIXTURE] Synthetic apiary for end-to-end validation. Not a real apiary.',
  weather: { temp: '32.0C', condition: 'TEST Synthetic weather data', humidity: '68%', wind: '5 km/h SW' },
  isTestFixture: true
};

export const TEST_HIVE = {
  id:               'hive-test-001',
  code:             '099',
  name:             'Test Hive 001',
  location:         'HoneyChain Test Apiary',
  apiaryCode:       'AP99',
  apiaryId:         'apiary-test-001',
  type:             'Langstroth',
  breed:            'Indian (Apis cerana indica)',
  status:           'healthy',
  statusText:       '[TEST] Colony healthy during test fixture.',
  conditionSummary: '[TEST] Conditions look stable. TEST DATA.',
  temperament:      'Calm',
  queenStatus:      'Test colony queen status synthetic',
  broodPattern:     'Test brood pattern synthetic reading',
  weight:           38.5,
  weightDelta:      '+0.0 kg',
  temp:             32.4,
  humidity:         68,
  vibrationText:    'TEST Synthetic vibration reading 0.12',
  lastUpdate:       HARVEST_DATE,
  lastInspected:    HARVEST_DATE,
  inspectionImage:  null,
  monitoring:       { enabled: true, isDeviceOnline: true, lastUpdate: HARVEST_DATE },
  notes:            '[TEST FIXTURE] Synthetic hive. Device status: ONLINE (synthetic).',
  superFramesCapped: 1,
  superFramesTotal:  10,
  linkedHoneyBatches: [],
  isArchived:        false,
  esp32: { deviceId: 'ESP32-TEST-H099', firmware: 'v2.4.3-test', protocol: 'BLE Mesh / MQTT-SN', rssi: '-62 dBm (TEST)', battery: 95, lastTelemetry: HARVEST_DATE, macAddress: '70:B8:F6:00:00:99' },
  isTestFixture:     true
};

export const TEST_HIVE_MGMT_BATCH = {
  id:                    'bk-batch-test-001',
  kind:                  'BEEKEEPER_HIVE_MANAGEMENT_BATCH',
  name:                  'Test Honey Cycle 001',
  apiaryId:              'apiary-test-001',
  apiaryCode:            'AP99',
  startDate:             HARVEST_DATE,
  inspectionIntervalDays: 7,
  notes:                 '[TEST FIXTURE] Synthetic hive management cycle for test journey.',
  memberships: [{ hiveId: 'hive-test-001', cycleStatus: 'PROCESSING_HANDOVER', inspectionIntervalDays: 7, joinedAt: HARVEST_DATE + 'T08:00:00.000Z' }],
  status:      'PROCESSING_HANDOVER',
  activityLog: [
    { id: 'batch-log-test-001', at: HARVEST_DATE + 'T08:00:00.000Z', actor: 'HoneyChain Test Beekeeper', eventType: 'BATCH_CREATED', status: 'ACTIVE' },
    { id: 'batch-log-test-002', at: HARVEST_DATE + 'T10:30:00.000Z', actor: 'HoneyChain Test Beekeeper', eventType: 'HIVE_MEMBER_UPDATED', hiveId: 'hive-test-001', status: 'PROCESSING_HANDOVER' }
  ],
  isTestFixture: true
};

export const TEST_FRAME = {
  id:                'frame-test-001',
  frameNumber:       'F9',
  hiveId:            'hive-test-001',
  hiveCode:          'H099',
  apiaryId:          'apiary-test-001',
  apiaryCode:        'AP99',
  traceabilityCode:  'AP99H099F9',
  status:            'SUBMITTED_TO_PROCESSOR',
  statusLabel:       'Submitted to Processor',
  registeredAt:      HARVEST_DATE + 'T07:00:00.000Z',
  placedAt:          HARVEST_DATE + 'T07:00:00.000Z',
  harvestedAt:       HARVEST_DATE + 'T10:00:00.000Z',
  harvestQuantityKg: 10.0,
  honeyType:         'TEST_HONEY Wildflower (Synthetic)',
  cappedPercentage:  100,
  observationsCount: 2,
  healthCondition:   '[TEST] Healthy colony synthetic test fixture',
  notes:             '[TEST FIXTURE] Synthetic frame for end-to-end validation.',
  submittedAt:       HARVEST_DATE + 'T11:00:00.000Z',
  handoverId:        'handover-test-001',
  history: [
    { timestamp: HARVEST_DATE + 'T07:00:00.000Z', event: 'FRAME_REGISTERED', details: 'Frame registered with unique identity AP99H099F9 (TEST FIXTURE)' },
    { timestamp: HARVEST_DATE + 'T08:00:00.000Z', event: 'STATUS_ACTIVE', details: 'Frame placed in hive super (TEST)' },
    { timestamp: HARVEST_DATE + 'T09:00:00.000Z', event: 'HEALTH_SCAN_COMPLETED', details: 'AI scan: TEST_OBSERVATION. No real diagnosis.' },
    { timestamp: HARVEST_DATE + 'T10:00:00.000Z', event: 'STATUS_READY_FOR_HARVEST', details: 'Frame marked ready for harvest (TEST)' },
    { timestamp: HARVEST_DATE + 'T10:05:00.000Z', event: 'HARVEST_RECORDED', details: '10.0 kg TEST_HONEY harvested from frame AP99H099F9' },
    { timestamp: HARVEST_DATE + 'T11:00:00.000Z', event: 'HARVEST_SUBMITTED', details: 'Submitted to HoneyChain Test Processing Facility (TEST)' }
  ],
  isTestFixture: true
};

export const TEST_INSPECTION_EVENT = {
  id:               'hist-test-inspection-001',
  hiveCode:         'H099',
  apiaryCode:       'AP99',
  traceabilityCode: 'AP99H099F9',
  date:             '27 Sep 2026',
  time:             '09:00',
  eventType:        'HEALTH_SCAN_COMPLETED',
  title:            '[TEST] AI-assisted health inspection test fixture',
  summary:          '[TEST FIXTURE] Healthy colony observed during test inspection. This is TEST DATA, not a real AI diagnosis.',
  author:           'HoneyChain Test Beekeeper',
  evidence:         '/hive-inspection-sample.jpg',
  metadata: { finding: 'TEST_OBSERVATION', confidence: 'NA Synthetic fixture', actionTaken: 'No action required (TEST)', captureSource: 'TEST_FIXTURE', observationStatus: 'OBSERVED', inspectionType: 'AI_HEALTH_INSPECTION' },
  isTestFixture: true
};

export const TEST_HARVEST = {
  id:                  'hrv-test-001',
  traceabilityCode:    'AP99H099F9',
  apiaryCode:          'AP99',
  apiaryName:          'HoneyChain Test Apiary',
  hiveCode:            'H099',
  hiveName:            'Test Hive 001',
  frameNumber:         'F9',
  harvestDate:         HARVEST_DATE,
  harvestTime:         HARVEST_TIME,
  honeyType:           'TEST_HONEY Wildflower (Synthetic)',
  quantityKg:          10.0,
  condition:           '[TEST] Harvested from capped super frame SYNTHETIC DATA',
  beeActivity:         '[TEST] Calm foraging during test harvest',
  remarks:             '[TEST FIXTURE] This harvest record is synthetic test data.',
  evidencePhoto:       '/hive-inspection-sample.jpg',
  submittingBeekeeper: 'HoneyChain Test Beekeeper',
  status:              'HARVESTED',
  submittedToProcessor: true,
  handoverId:          'handover-test-001',
  timestamp:           HARVEST_DATE + 'T10:00:00.000Z',
  isTestFixture:       true
};

export const TEST_HANDOVER = {
  id:                  'handover-test-001',
  handoverCode:        'HND-TEST-001',
  traceabilityCode:    'AP99H099F9',
  harvestRecordId:     'hrv-test-001',
  apiaryCode:          'AP99',
  hiveCode:            'H099',
  frameNumber:         'F9',
  quantityKg:          10.0,
  honeyType:           'TEST_HONEY Wildflower (Synthetic)',
  submissionTimestamp: SEALED_AT,
  submittingBeekeeper: 'HoneyChain Test Beekeeper',
  receivingFacility:   'HoneyChain Test Processing Facility',
  status:              'ASSIGNED_TO_BATCH',
  statusLabel:         'Assigned to Batch',
  receivedAt:          PROCESSING_DATE + 'T11:30:00.000Z',
  receivedQuantityKg:  10.0,
  conditionOnArrival:  '[TEST] Good / Sealed synthetic condition assessment',
  storageLocation:     'TEST Intake Bay #1',
  intakeOperator:      'Test Processor Operator',
  intakeRemarks:       '[TEST] Received and verified. SYNTHETIC DATA.',
  downstreamJourney: {
    harvest:    { completed: true, timestamp: HARVEST_DATE + 'T10:00:00.000Z', handler: 'HoneyChain Test Beekeeper' },
    submission: { completed: true, timestamp: HARVEST_DATE + 'T11:00:00.000Z', handler: 'HoneyChain Test Beekeeper' },
    intake:     { completed: true, timestamp: PROCESSING_DATE + 'T11:30:00.000Z', handler: 'Test Processor Operator', receivedKg: 10.0 },
    processing: { status: 'completed', facility: 'HoneyChain Test Processing Facility', startedAt: PROCESSING_DATE + 'T12:00:00.000Z' },
    quality:    { status: 'completed', eta: QUALITY_DATE },
    packaging:  { status: 'completed', eta: PACKAGE_DATE },
    dispatch:   { status: 'completed', eta: DISPATCH_DATE }
  },
  isTestFixture: true
};

export const TEST_PROCESSING_BATCH = {
  id:          'pb-test-001',
  batchNumber: 'PB-TEST-00001',
  batchName:   'Test Processing Batch 001 [SYNTHETIC]',
  status:      'QUALITY_PASSED',
  statusLabel: 'Quality Certified',
  weightKg:    10.0,
  finalYieldKg: 9.8,
  sourceHarvests: [
    { traceabilityCode: 'AP99H099F9', harvestRecordId: 'hrv-test-001', handoverId: 'handover-test-001', apiaryCode: 'AP99', hiveCode: 'H099', frameNumber: 'F9', quantityKg: 10.0, honeyType: 'TEST_HONEY Wildflower (Synthetic)', harvestDate: HARVEST_DATE, beekeeper: 'HoneyChain Test Beekeeper' }
  ],
  steps: [
    { stepKey: 'EXTRACTION',       name: 'Centrifugal Extraction',         order: 1, status: 'COMPLETED', operator: 'Test Processor Operator', startedAt: PROCESSING_DATE + 'T12:00:00.000Z', completedAt: PROCESSING_DATE + 'T12:30:00.000Z', parameters: { temperatureC: 32.4, spinSpeedRpm: 350, durationMin: 18 }, remarks: '[TEST] Extraction completed. SYNTHETIC DATA.', evidence: null },
    { stepKey: 'FILTRATION',       name: 'Coarse and Fine Mesh Filtration', order: 2, status: 'COMPLETED', operator: 'Test Processor Operator', startedAt: PROCESSING_DATE + 'T12:30:00.000Z', completedAt: PROCESSING_DATE + 'T13:00:00.000Z', parameters: { coarseMeshUm: 400, fineMeshUm: 200, flowRateLph: 120 }, remarks: '[TEST] Filtration completed. SYNTHETIC DATA.', evidence: null },
    { stepKey: 'SETTLING',         name: 'Clarification and Settling Tank',  order: 3, status: 'COMPLETED', operator: 'Test Processor Operator', startedAt: PROCESSING_DATE + 'T13:00:00.000Z', completedAt: PROCESSING_DATE + 'T13:30:00.000Z', parameters: { tankTempC: 22.5, settlingHours: 48, foamSkimmed: true }, remarks: '[TEST] Settling tank SYNTHETIC DATA. 48-hour cycle recorded for test.', evidence: null },
    { stepKey: 'FINAL_PROCESSING', name: 'Final Quality Preparation',        order: 5, status: 'COMPLETED', operator: 'Test Processor Operator', startedAt: PROCESSING_DATE + 'T13:30:00.000Z', completedAt: PROCESSING_DATE + 'T14:00:00.000Z', parameters: { netYieldKg: 9.8, lossPercent: 2.0 }, remarks: '[TEST] Final yield: 9.8 kg. Process loss: 0.2 kg (2%). SYNTHETIC DATA.', evidence: null }
  ],
  qualityStatus:       'CERTIFIED_PASSED',
  qualityDecisionId:   'qdec-test-001',
  processedAt:         PROCESSING_DATE + 'T14:00:00.000Z',
  submittedToQualityAt: PROCESSING_DATE + 'T14:05:00.000Z',
  isTestFixture:       true
};

export const TEST_LAB_SAMPLE = {
  id:                   'LS-TEST-0001',
  sourceBatchId:        'pb-test-001',
  sourceBatchNumber:    'PB-TEST-00001',
  sourceTraceabilityCodes: ['AP99H099F9'],
  sampleWeight:         0.25,
  intakeStatus:         'COMPLETED',
  custodyChain: [
    { id: 'coc-test-001', action: 'COLLECTED',  actor: 'Test Processor Operator', at: LAB_DATE + 'T14:05:00.000Z', notes: '[TEST] Sample collected from PB-TEST-00001' },
    { id: 'coc-test-002', action: 'RECEIVED',   actor: 'Test Lab Technician',     at: LAB_DATE + 'T14:10:00.000Z', notes: '[TEST] Received at lab intake' },
    { id: 'coc-test-003', action: 'ACCEPTED',   actor: 'Test Lab Technician',     at: LAB_DATE + 'T14:15:00.000Z', notes: '[TEST] Accepted seal intact, volume sufficient' },
    { id: 'coc-test-004', action: 'STORED',     actor: 'Test Lab Technician',     at: LAB_DATE + 'T14:20:00.000Z', notes: '[TEST] Stored in controlled conditions at 20C' },
    { id: 'coc-test-005', action: 'TESTING',    actor: 'Test Analyst',            at: LAB_DATE + 'T14:30:00.000Z', notes: '[TEST] Transferred to analytical bench' },
    { id: 'coc-test-006', action: 'COMPLETED',  actor: 'Test Analyst',            at: LAB_DATE + 'T15:30:00.000Z', notes: '[TEST] All assigned tests completed' }
  ],
  isTestFixture: true
};

export const TEST_LAB_TESTS = [
  { id: 'LT-TEST-0001', sampleId: 'LS-TEST-0001', testKey: 'MOISTURE', testName: 'Refractometric Moisture Content', priority: 'ROUTINE', assignedAnalyst: 'Test Analyst', assignedAt: LAB_DATE + 'T14:30:00.000Z', startedAt: LAB_DATE + 'T14:35:00.000Z', completedAt: LAB_DATE + 'T14:45:00.000Z', equipmentId: 'EQ-REFR-01', operator: 'Test Analyst', status: 'COMPLETED', rawMeasurement: 17.2, result: 17.2, unit: '%', isWithinSpec: true, notes: '[TEST DATA] Synthetic moisture measurement. Not a real laboratory result.', isTestFixture: true },
  { id: 'LT-TEST-0002', sampleId: 'LS-TEST-0001', testKey: 'HMF',      testName: 'HMF Spectrophotometry',           priority: 'ROUTINE', assignedAnalyst: 'Test Analyst', assignedAt: LAB_DATE + 'T14:30:00.000Z', startedAt: LAB_DATE + 'T14:50:00.000Z', completedAt: LAB_DATE + 'T15:05:00.000Z', equipmentId: 'EQ-SPEC-02', operator: 'Test Analyst', status: 'COMPLETED', rawMeasurement: 12.4, result: 12.4, unit: 'mg/kg', isWithinSpec: true, notes: '[TEST DATA] Synthetic HMF measurement. Not a real laboratory result.', isTestFixture: true },
  { id: 'LT-TEST-0003', sampleId: 'LS-TEST-0001', testKey: 'DIASTASE', testName: 'Diastase Enzyme Activity',         priority: 'ROUTINE', assignedAnalyst: 'Test Analyst', assignedAt: LAB_DATE + 'T14:30:00.000Z', startedAt: LAB_DATE + 'T15:10:00.000Z', completedAt: LAB_DATE + 'T15:25:00.000Z', equipmentId: 'EQ-REFR-01', operator: 'Test Analyst', status: 'COMPLETED', rawMeasurement: 14.8, result: 14.8, unit: 'DN', isWithinSpec: true, notes: '[TEST DATA] Synthetic diastase measurement. Not a real laboratory result.', isTestFixture: true }
];

export const TEST_QUALITY_DECISION = {
  id:               'qdec-test-001',
  sampleId:         'LS-TEST-0001',
  batchId:          'pb-test-001',
  batchNumber:      'PB-TEST-00001',
  decision:         'RELEASED_FOR_BOTTLING',
  decisionLabel:    'Approved and Released for Bottling [TEST]',
  qualityRecommendation: 'SUITABLE_FOR_REVIEW',
  officer:          'Test Quality Officer',
  officerCapabilities: ['LAB_WORKSPACE', 'QUALITY_DECISION', 'CERTIFICATE_GENERATION'],
  decidedAt:        QUALITY_DATE + 'T15:30:00.000Z',
  notes:            '[TEST FIXTURE] This quality decision is SYNTHETIC TEST DATA. Not a real regulatory approval.',
  certificateRef:   'COA-TEST-2026-001',
  isTestFixture:    true
};

export const TEST_PACKAGE = {
  id:                     'pkg-test-001',
  packageId:              'PKG-TEST-00001',
  productName:            'Test Honey [SYNTHETIC]',
  unitGrams:              500,
  unitDisplay:            '500 g',
  qrId:                   'QR-TEST-00001',
  publicReference:        'HC-PUB-TEST-001',
  status:                 'READY_FOR_DISPATCH',
  qualityStatus:          'APPROVED',
  qualityDecision:        'RELEASED_FOR_BOTTLING',
  qualityDecisionId:      'qdec-test-001',
  batchId:                'pb-test-001',
  batchNumber:            'PB-TEST-00001',
  sourceTraceabilityCodes: ['AP99H099F9'],
  tamperSealId:           'HC-SEAL-TEST-001',
  packagedAt:             PACKAGE_DATE + 'T16:00:00.000Z',
  packagedBy:             'Test Packaging Operator',
  labelVersion:           'v1-TEST',
  notes:                  '[TEST FIXTURE] Synthetic package. Not a real product.',
  isQrRevoked:            false,
  isTestFixture:          true
};

export const TEST_QR = {
  qrId:            'QR-TEST-00001',
  batchId:         'pb-test-001',
  batchNumber:     'PB-TEST-00001',
  packageId:       'PKG-TEST-00001',
  productName:     'Test Honey [SYNTHETIC]',
  publicReference: 'HC-PUB-TEST-001',
  publicUrl:       'https://verify.honeychain.org/verify/HC-PUB-TEST-001',
  scope:           'PACKAGE',
  status:          'ACTIVE',
  statusLabel:     'QR active [TEST]',
  statusExplanation: '[TEST FIXTURE] This QR points to the synthetic test verification record.',
  eccLevel:        'Level M (15% Redundancy)',
  version:         'v1-TEST',
  createdAt:       PACKAGE_DATE + 'T16:05:00.000Z',
  activatedAt:     PACKAGE_DATE + 'T16:07:00.000Z',
  revokedAt:       null,
  replacedQrId:    null,
  replacementQrId: null,
  operator:        'Test Packaging Operator',
  tamperSeal:      'HC-SEAL-TEST-001',
  history: [
    { id: 'qrh-test-001', event: 'QR_CREATED', title: 'Test QR Created [SYNTHETIC]', timestamp: PACKAGE_DATE + 'T16:05:00.000Z', actor: 'Test Packaging Operator', notes: '[TEST] QR generated for synthetic package PKG-TEST-00001.' },
    { id: 'qrh-test-002', event: 'QR_ACTIVATED', title: 'Activated on Test Registry [SYNTHETIC]', timestamp: PACKAGE_DATE + 'T16:07:00.000Z', actor: 'HoneyChain Trust Network Engine', notes: '[TEST] Route mapped to https://verify.honeychain.org/verify/HC-PUB-TEST-001' }
  ],
  isTestFixture: true
};

export const TEST_SHIPMENT = {
  id:                  'SHP-TEST-001',
  status:              'READY',
  destination:         'HoneyChain Test Delivery Hub Coimbatore',
  carrier:             'Test Carrier [SYNTHETIC]',
  allocatedPackageIds: ['PKG-TEST-00001'],
  validatedPackages:   [{ packageId: 'PKG-TEST-00001', validatedAt: DISPATCH_DATE + 'T16:30:00.000Z', validatedBy: 'Test Dispatch Operator' }],
  createdAt:           DISPATCH_DATE + 'T16:15:00.000Z',
  createdBy:           'Test Dispatch Operator',
  isTestFixture:       true
};

export const TEST_PUBLIC_RECORD = {
  publicReference:   'HC-PUB-TEST-001',
  batchReference:    'PB-TEST-00001 [SYNTHETIC]',
  productName:       'Test Honey [SYNTHETIC Not for sale]',
  honeyType:         'Wildflower (Test Fixture)',
  status:            'VERIFIED',
  statusLabel:       'Verification confirmed [TEST]',
  statusExplanation: '[TEST FIXTURE] This is a synthetic verification record. Not real honey.',
  verifiedAt:        QUALITY_DATE + 'T15:30:00.000Z',
  recordVersion:     'v1-TEST',
  sourceArea:        'Coimbatore, Tamil Nadu, India [TEST]',
  producerGuild:     'HoneyChain Dummy Apiary [TEST]',
  packagingDetails:  '500g Test Jar 1 Unit [SYNTHETIC]',
  tamperSeal:        'HC-SEAL-TEST-001',
  journey: [
    { id: 'pj-test-1', stage: 'Source Apiary', stepNumber: 1, status: 'COMPLETED', date: '27 Sep 2026', title: 'Test Apiary Source [SYNTHETIC]', summary: '[TEST] Recorded in HoneyChain test apiary registry. Coimbatore, Tamil Nadu.' },
    { id: 'pj-test-2', stage: 'Harvest',        stepNumber: 2, status: 'COMPLETED', date: '27 Sep 2026', title: 'Test Harvest [SYNTHETIC]', summary: '[TEST] 10 kg harvested from test hive H099 on 27 Sep 2026.' },
    { id: 'pj-test-3', stage: 'Processing',      stepNumber: 3, status: 'COMPLETED', date: '27 Sep 2026', title: 'Test Processing [SYNTHETIC]', summary: '[TEST] Extraction, filtration, and settling completed at HoneyChain Test Processing Facility.' },
    { id: 'pj-test-4', stage: 'Quality Checks',  stepNumber: 4, status: 'COMPLETED', date: '27 Sep 2026', title: 'Test Quality Review [SYNTHETIC]', summary: '[TEST DATA NOT REAL] Synthetic test measurements recorded. Not a regulatory laboratory result.' },
    { id: 'pj-test-5', stage: 'Packaging',        stepNumber: 5, status: 'COMPLETED', date: '27 Sep 2026', title: 'Test Packaging [SYNTHETIC]', summary: '[TEST] Packaged into test unit. Tamper seal HC-SEAL-TEST-001 applied.' },
    { id: 'pj-test-6', stage: 'Verification',     stepNumber: 6, status: 'VERIFIED',  date: '27 Sep 2026', title: 'HoneyChain Test Record Verified [SYNTHETIC]', summary: '[TEST FIXTURE] All required procedural evidence validated for test journey.' }
  ],
  proof: null,
  isTestFixture: true
};

export const DUMMY_JOURNEY = {
  _meta: {
    journeyId:      'TEST-JOURNEY-001',
    environment:    ENV,
    isSynthetic:    true,
    safetyGuard:    'ACTIVE will abort if NODE_ENV=production',
    createdAt:      new Date().toISOString(),
    description:    'Single synthetic honey journey for end-to-end validation of HoneyChain data flow.',
    seedVersion:    '1.0.0',
    idPrefix:       'TEST / AP99 / H099',
    blockchainNote: 'Blockchain NOT implemented. No fake hashes generated.',
    dataWarning:    'ALL DATA IS SYNTHETIC TEST FIXTURES. No real honey, beekeeper, lab, or regulatory data.'
  },
  ids: {
    user:              'user-test-beekeeper-001',
    apiary:            'apiary-test-001',
    apiaryCode:        'AP99',
    hive:              'hive-test-001',
    hiveCode:          'H099',
    hiveMgmtBatch:     'bk-batch-test-001',
    frame:             'frame-test-001',
    traceabilityCode:  'AP99H099F9',
    harvest:           'hrv-test-001',
    handover:          'handover-test-001',
    processingBatch:   'pb-test-001',
    processingBatchNo: 'PB-TEST-00001',
    labSample:         'LS-TEST-0001',
    labTests:          ['LT-TEST-0001', 'LT-TEST-0002', 'LT-TEST-0003'],
    qualityDecision:   'qdec-test-001',
    package:           'PKG-TEST-00001',
    qr:                'QR-TEST-00001',
    publicRef:         'HC-PUB-TEST-001',
    shipment:          'SHP-TEST-001'
  },
  user:            TEST_USER,
  apiary:          TEST_APIARY,
  hive:            TEST_HIVE,
  hiveMgmtBatch:   TEST_HIVE_MGMT_BATCH,
  frame:           TEST_FRAME,
  inspection:      TEST_INSPECTION_EVENT,
  harvest:         TEST_HARVEST,
  handover:        TEST_HANDOVER,
  processingBatch: TEST_PROCESSING_BATCH,
  labSample:       TEST_LAB_SAMPLE,
  labTests:        TEST_LAB_TESTS,
  qualityDecision: TEST_QUALITY_DECISION,
  package:         TEST_PACKAGE,
  qr:              TEST_QR,
  shipment:        TEST_SHIPMENT,
  publicRecord:    TEST_PUBLIC_RECORD,
  traceabilityChain: {
    forward:  ['AP99 (Apiary)', 'H099 (Hive)', 'bk-batch-test-001 (Hive Mgmt Batch)', 'AP99H099F9 (Frame Traceability Code)', 'hrv-test-001 (Harvest)', 'handover-test-001 (Handover)', 'PB-TEST-00001 (Processing Batch)', 'LS-TEST-0001 (Lab Sample)', 'LT-TEST-0001/0002/0003 (Lab Tests)', 'qdec-test-001 (Quality Decision)', 'PKG-TEST-00001 (Package)', 'QR-TEST-00001 (QR)', 'HC-PUB-TEST-001 (Public Reference)'],
    backward: ['HC-PUB-TEST-001 (Public Reference)', 'QR-TEST-00001 (QR)', 'PKG-TEST-00001 (Package)', 'qdec-test-001 (Quality Decision)', 'LT-TEST-0001/0002/0003 (Lab Tests)', 'LS-TEST-0001 (Lab Sample)', 'PB-TEST-00001 (Processing Batch)', 'handover-test-001 (Handover)', 'hrv-test-001 (Harvest)', 'AP99H099F9 (Frame Traceability Code)', 'bk-batch-test-001 (Hive Mgmt Batch)', 'H099 (Hive)', 'AP99 (Apiary)']
  }
};

export function detectExistingTestJourney(store) {
  const { apiaries = [], hives = [], frames = [], harvestRecords = [], processingBatches = [], labSamples = [], dispatchPackages = [] } = store || {};
  return {
    hasApiary:          apiaries.some(function(a) { return a.id === 'apiary-test-001'; }),
    hasHive:            hives.some(function(h) { return h.id === 'hive-test-001'; }),
    hasFrame:           frames.some(function(f) { return f.traceabilityCode === 'AP99H099F9'; }),
    hasHarvest:         harvestRecords.some(function(h) { return h.id === 'hrv-test-001'; }),
    hasProcessingBatch: processingBatches.some(function(b) { return b.batchNumber === 'PB-TEST-00001'; }),
    hasLabSample:       labSamples.some(function(s) { return s.id === 'LS-TEST-0001'; }),
    hasPackage:         dispatchPackages.some(function(p) { return p.packageId === 'PKG-TEST-00001'; })
  };
}
