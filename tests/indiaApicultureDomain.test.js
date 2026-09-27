/**
 * HoneyChain India-First Apiculture Domain Master Test Suite
 *
 * Verifies all 14 phases of the India-First apiculture transformation:
 * 1. Bee Species Taxonomy (Cerana, Mellifera, Dorsata, Florea, Stingless)
 * 2. Agro-Climatic Regions & Multi-Dimensional Seasonal Engine
 * 3. Colony (Biological) vs Hive (Physical Housing) Separation
 * 4. Apiary as First-Class Entity & Site Assessment
 * 5. Strict Unmistakable Hive Code Uniqueness
 * 6. Frame / Comb Traceability Lifecycle
 * 7. Health Observations & Biosecurity Finding Levels
 * 8. Hygiene & Sanitation Operational Records
 * 9. Pesticide Exposure Risk Monitoring
 * 10. Pollination Service Context
 * 11. Unbroken Source Lineage (Harvest -> Collection Lot -> Processing Batch)
 * 12. Multiple Harvest Source Lineage Preservation
 * 13. Quality Standards Compliance (FSSAI & AGMARK)
 * 14. Offline Synchronization & i18n Domain Dictionary
 */

import assert from 'assert';
import {
  BEE_SPECIES,
  INDIA_AGRO_CLIMATIC_REGIONS,
  resolveAgroClimaticRegion,
  evaluateSeasonalContext,
  COLONY_LIFECYCLE_STATES,
  QUEEN_LAYING_STATUSES,
  createColonyEntity,
  createApiaryEntity,
  validateHiveCodeUniqueness,
  createHiveEntity,
  createFrameEntity,
  THREAT_CATEGORIES,
  HEALTH_FINDING_LEVELS,
  COMMON_INDIAN_APICULTURE_THREATS,
  createHealthObservation,
  createHygieneObservation,
  createPesticideExposureObservation,
  createPollinationContext,
  createHarvestRecord,
  createCollectionLot,
  createProcessingBatch,
  evaluateHoneyQualityCompliance,
  OfflineSyncManager,
  SYNC_STATES,
  getDomainTerm
} from '../src/domain/indiaApicultureDomain.js';

console.log('Running HoneyChain India-First Apiculture Domain Test Suite...');

// ---------------------------------------------------------------------------
// 1. BEE SPECIES & TAXONOMY
// ---------------------------------------------------------------------------
console.log('-> 1. Validating Bee Species Taxonomy...');
assert.ok(BEE_SPECIES.APIS_CERANA_INDICA, 'Apis cerana indica must exist');
assert.strictEqual(BEE_SPECIES.APIS_CERANA_INDICA.origin, 'INDIGENOUS');
assert.strictEqual(BEE_SPECIES.APIS_CERANA_INDICA.isDomesticated, true);
assert.ok(BEE_SPECIES.APIS_CERANA_INDICA.recommendedHiveStandard.includes('BIS Type A'));

assert.ok(BEE_SPECIES.APIS_MELLIFERA, 'Apis mellifera must exist');
assert.strictEqual(BEE_SPECIES.APIS_MELLIFERA.origin, 'EXOTIC_ESTABLISHED');
assert.ok(BEE_SPECIES.APIS_MELLIFERA.recommendedHiveStandard.includes('Langstroth'));

assert.ok(BEE_SPECIES.TETRAGONULA_IRIDIPENNIS, 'Dammer stingless bee must exist');
assert.strictEqual(BEE_SPECIES.TETRAGONULA_IRIDIPENNIS.isDomesticated, true);

// ---------------------------------------------------------------------------
// 2. AGRO-CLIMATIC REGIONS & SEASONAL CONTEXT ENGINE
// ---------------------------------------------------------------------------
console.log('-> 2. Validating Agro-Climatic Regions & Seasonal Engine...');
const punjabReg = resolveAgroClimaticRegion('Punjab');
assert.strictEqual(punjabReg.code, 'INDO_GANGETIC_PLAINS');

const kashmirReg = resolveAgroClimaticRegion('Jammu and Kashmir');
assert.strictEqual(kashmirReg.code, 'HIMALAYAN_TEMPERATE');

const keralaReg = resolveAgroClimaticRegion('Kerala');
assert.strictEqual(keralaReg.code, 'WESTERN_GHATS_SOUTHERN');

// Punjab in December (Mustard Honey Flow)
const punjabWinter = evaluateSeasonalContext({ state: 'Punjab', district: 'Hoshiarpur', month: 12 });
assert.ok(punjabWinter.seasonName.includes('Mustard'));
assert.strictEqual(punjabWinter.activityState, 'SURPLUS_NECTAR_STORAGE');
assert.strictEqual(punjabWinter.isHoneyFlowSeason, true);
assert.ok(punjabWinter.recommendations.some(r => r.includes('supers')));
assert.ok(punjabWinter.keyRisks.some(r => r.includes('Pesticide')));

// Kerala in July (Heavy South-West Monsoon Dearth)
const keralaMonsoon = evaluateSeasonalContext({ state: 'Kerala', district: 'Wayanad', month: 7 });
assert.ok(keralaMonsoon.seasonName.includes('Monsoon'));
assert.strictEqual(keralaMonsoon.activityState, 'SEVERE_DEARTH_SURVIVAL');
assert.strictEqual(keralaMonsoon.isHoneyFlowSeason, false);
assert.ok(keralaMonsoon.recommendations.some(r => r.includes('feeding')));

// ---------------------------------------------------------------------------
// 3. COLONY BIOLOGICAL ENTITY (Strictly Distinct from Physical Hive)
// ---------------------------------------------------------------------------
console.log('-> 3. Validating Colony Entity (Biological Separation)...');
const colony = createColonyEntity({
  colonyCode: 'COL-PUNJAB-402',
  beeSpecies: 'APIS_CERANA_INDICA',
  queen: {
    markedColor: 'GREEN_2025',
    layingStatus: QUEEN_LAYING_STATUSES.MATED_PROLIFIC,
    origin: 'NATURAL_EMERGENCY_CELL'
  },
  strength: {
    adultBeeCoveragePercent: 85,
    broodFramesCount: 7,
    overallRating: 'STRONG'
  },
  status: COLONY_LIFECYCLE_STATES.ESTABLISHED
});

assert.strictEqual(colony.beeSpecies, 'APIS_CERANA_INDICA');
assert.strictEqual(colony.queen.markedColor, 'GREEN_2025');
assert.strictEqual(colony.status, 'ESTABLISHED');
assert.strictEqual(colony.strength.broodFramesCount, 7);
assert.ok(colony.biologicalEvents.length >= 1);

// ---------------------------------------------------------------------------
// 4. APIARY AS A FIRST-CLASS ENTITY
// ---------------------------------------------------------------------------
console.log('-> 4. Validating Apiary Entity & Site Assessment...');
const apiary = createApiaryEntity({
  apiaryCode: 'AP-HOSH-01',
  name: 'Dasuya Mustard Apiary',
  operatorName: 'Harpreet Singh',
  location: {
    state: 'Punjab',
    district: 'Hoshiarpur',
    taluk: 'Dasuya',
    village: 'Bodal',
    latitude: 31.815,
    longitude: 75.658,
    elevationMeters: 240
  },
  siteAssessment: {
    waterAvailability: 'EXCELLENT_WITHIN_50M',
    waterDistanceMeters: 30,
    forageContext: 'Brassica mustard and eucalyptus groves',
    nearbyAgriculture: ['Mustard', 'Wheat'],
    observationStatus: 'OBSERVED'
  },
  nbhmRegistrationNumber: 'NBHM-PB-2024-8921',
  hiveCount: 20,
  activeHiveCount: 18
});

assert.strictEqual(apiary.apiaryCode, 'AP-HOSH-01');
assert.strictEqual(apiary.location.state, 'Punjab');
assert.strictEqual(apiary.location.district, 'Hoshiarpur');
assert.strictEqual(apiary.nbhmRegistrationNumber, 'NBHM-PB-2024-8921');
assert.strictEqual(apiary.siteAssessment.waterDistanceMeters, 30);
assert.strictEqual(apiary.activeHiveCount, 18);

// Empty apiary code throws error
assert.throws(() => {
  createApiaryEntity({ apiaryCode: '  ' });
}, /unique apiaryCode/);

// ---------------------------------------------------------------------------
// 5. STRICT HIVE UNMISTAKABLE IDENTIFIER & UNIQUENESS
// ---------------------------------------------------------------------------
console.log('-> 5. Validating Strict Unmistakable Hive Identification...');
const existingHives = [
  { hiveId: 'h-1', hiveCode: 'H001', apiaryId: 'ap-1', status: 'OCCUPIED' },
  { hiveId: 'h-2', hiveCode: 'H002', apiaryId: 'ap-1', status: 'OCCUPIED' }
];

// Valid new hive in ap-1
const validHive = createHiveEntity({
  hiveCode: 'H003',
  apiaryId: 'ap-1',
  hiveType: 'LANGSTROTH_STANDARD',
  beeSpecies: 'APIS_MELLIFERA'
}, existingHives);
assert.strictEqual(validHive.hiveCode, 'H003');

// Duplicate hiveCode 'H001' in same apiary 'ap-1' must fail
assert.throws(() => {
  createHiveEntity({ hiveCode: 'H001', apiaryId: 'ap-1' }, existingHives);
}, /already registered and active/);

// Same hiveCode 'H001' in DIFFERENT apiary 'ap-2' is valid
const validDifferentApiaryHive = createHiveEntity({
  hiveCode: 'H001',
  apiaryId: 'ap-2'
}, existingHives);
assert.strictEqual(validDifferentApiaryHive.hiveCode, 'H001');

// ---------------------------------------------------------------------------
// 6. FRAME / COMB TRACKING
// ---------------------------------------------------------------------------
console.log('-> 6. Validating Frame Traceability...');
const frame = createFrameEntity({
  frameNumber: 'F04',
  hiveId: 'hive-01',
  hiveCode: 'H001',
  apiaryId: 'apiary-01',
  apiaryCode: 'AP1',
  frameType: 'SUPER_HONEY_FRAME',
  cappingPercent: 85
});

assert.strictEqual(frame.traceabilityCode, 'AP1H001F04');
assert.strictEqual(frame.frameType, 'SUPER_HONEY_FRAME');
assert.strictEqual(frame.cappingPercent, 85);

// ---------------------------------------------------------------------------
// 7. HEALTH OBSERVATION, PESTS & BIOSECURITY FINDING LEVELS
// ---------------------------------------------------------------------------
console.log('-> 7. Validating Health Observations & Biosecurity...');
const aiObservation = createHealthObservation({
  hiveId: 'hive-01',
  category: THREAT_CATEGORIES.PARASITE,
  threatId: 'VARROA_MITE',
  threatName: 'Varroa Mite',
  findingLevel: HEALTH_FINDING_LEVELS.AI_ASSISTED_FINDING,
  observedSymptoms: ['Mites visible on worker thorax', 'Irregular cappings'],
  aiVisionConfidence: 0.88
});

assert.strictEqual(aiObservation.findingLevel, 'AI_ASSISTED_FINDING');
assert.ok(aiObservation.presentationTitle.includes('Possible concern detected'));
assert.strictEqual(aiObservation.presentationBadge, 'AI-Assisted Screening (Check Recommended)');

// Confirmed diagnosis without evidence must fail
assert.throws(() => {
  createHealthObservation({
    threatName: 'Thai Sacbrood Disease',
    findingLevel: HEALTH_FINDING_LEVELS.CONFIRMED_DIAGNOSIS,
    evidence: []
  });
}, /CONFIRMED_DIAGNOSIS requires formal diagnostic lab evidence/);

// Confirmed diagnosis WITH evidence succeeds
const confirmedObservation = createHealthObservation({
  threatName: 'Thai Sacbrood Disease',
  findingLevel: HEALTH_FINDING_LEVELS.CONFIRMED_DIAGNOSIS,
  evidence: [{ type: 'LAB_PCR_CERTIFICATE', uri: '/certs/tsbv-test-401.pdf' }]
});
assert.strictEqual(confirmedObservation.findingLevel, 'CONFIRMED_DIAGNOSIS');
assert.ok(confirmedObservation.presentationTitle.includes('Confirmed:'));

// ---------------------------------------------------------------------------
// 8. HYGIENE & SANITATION OPERATIONAL WORKFLOW
// ---------------------------------------------------------------------------
console.log('-> 8. Validating Hygiene Operational Records...');
const hygiene = createHygieneObservation({
  apiaryId: 'ap-1',
  hiveId: 'h-1',
  operationType: 'HIVE_TOOL_DISINFECTION',
  performedBy: 'Harpreet Singh',
  methodUsed: 'Blowlamp flame sterilization & washing in 5% washing soda'
});

assert.strictEqual(hygiene.operationType, 'HIVE_TOOL_DISINFECTION');
assert.ok(hygiene.operationDescription.includes('flaming'));

// ---------------------------------------------------------------------------
// 9. PESTICIDE EXPOSURE RISK MONITORING
// ---------------------------------------------------------------------------
console.log('-> 9. Validating Pesticide Exposure Risk Monitoring...');
const pestExposure = createPesticideExposureObservation({
  apiaryId: 'ap-1',
  nearbyCrop: 'Mustard',
  suspectedChemicalClass: 'Neonicotinoid (Imidacloprid spray on aphid)',
  symptomSeverity: 'MODERATE_FIELD_LOSS',
  observedSigns: ['Carpet of dead bees with extended tongues (proboscis protrusion) at entrance'],
  actionTaken: 'Shifted hives 3 km away and fed 1:1 sugar syrup'
});

assert.strictEqual(pestExposure.nearbyCrop, 'Mustard');
assert.strictEqual(pestExposure.status, 'REPORTED_EXPOSURE');
assert.strictEqual(pestExposure.symptomSeverity, 'MODERATE_FIELD_LOSS');

// ---------------------------------------------------------------------------
// 10. POLLINATION SERVICE CONTEXT
// ---------------------------------------------------------------------------
console.log('-> 10. Validating Pollination Context...');
const pollination = createPollinationContext({
  apiaryId: 'ap-1',
  cropName: 'Apple',
  orchardistFarmerName: 'Vijay Thakur',
  locationDescription: 'Kotkhai Apple Orchard, Shimla',
  hivesDeployedCount: 15
});

assert.strictEqual(pollination.cropName, 'Apple');
assert.strictEqual(pollination.hivesDeployedCount, 15);

// ---------------------------------------------------------------------------
// 11. UNBROKEN SOURCE LINEAGE (Harvest -> Collection -> Processing)
// ---------------------------------------------------------------------------
console.log('-> 11. Validating Harvest Collection ≠ Downstream Processing...');
const harvest1 = createHarvestRecord({
  harvestCode: 'HAR-AP1-1001',
  apiaryId: 'ap-1',
  apiaryCode: 'AP1',
  hiveId: 'hive-01',
  hiveCode: 'H001',
  frameIds: ['frame-01', 'frame-02'],
  grossWeightKg: 16.5,
  tareWeightKg: 1.5,
  fieldRefractometerMoisture: 18.2,
  floralSource: 'Mustard'
});

assert.strictEqual(harvest1.netHoneyKg, 15.0);
assert.strictEqual(harvest1.isMoistureCompliant, true);
assert.strictEqual(harvest1.status, 'HARVESTED_AT_APIARY');

const harvest2 = createHarvestRecord({
  harvestCode: 'HAR-AP1-1002',
  apiaryId: 'ap-1',
  apiaryCode: 'AP1',
  hiveId: 'hive-02',
  hiveCode: 'H002',
  frameIds: ['frame-03'],
  grossWeightKg: 11.0,
  tareWeightKg: 1.0,
  fieldRefractometerMoisture: 19.1,
  floralSource: 'Mustard'
});

assert.strictEqual(harvest2.netHoneyKg, 10.0);

// Aggregation at FPO collection depot
const collectionLot = createCollectionLot({
  lotCode: 'LOT-FPO-8821',
  collectionCenterName: 'Dasuya FPO Primary Hub',
  sourceHarvests: [harvest1, harvest2]
});

assert.strictEqual(collectionLot.totalWeightKg, 25.0);
assert.ok(collectionLot.sourceApiaries.includes('AP1'));
assert.ok(collectionLot.sourceHives.includes('H001'));
assert.ok(collectionLot.sourceHives.includes('H002'));

// Downstream processing batch preserving MULTIPLE source harvests
console.log('-> 12. Validating Multiple Source Lineage Preservation...');
const processingBatch = createProcessingBatch({
  batchCode: 'PB-2026-MUSTARD-01',
  facilityId: 'proc-fac-01',
  facilityName: 'Punjab Agro Honey Processing Center',
  sourceCollectionLots: [collectionLot]
});

assert.strictEqual(processingBatch.lineageSources.sourceCount, 2);
assert.ok(processingBatch.lineageSources.sourceHarvestCodes.includes('HAR-AP1-1001'));
assert.ok(processingBatch.lineageSources.sourceHarvestCodes.includes('HAR-AP1-1002'));
assert.ok(processingBatch.lineageSources.apiaryCodes.includes('AP1'));
assert.ok(processingBatch.lineageSources.hiveCodes.includes('H001'));
assert.ok(processingBatch.lineageSources.hiveCodes.includes('H002'));

// ---------------------------------------------------------------------------
// 13. QUALITY COMPLIANCE (FSSAI & AGMARK STANDARDS)
// ---------------------------------------------------------------------------
console.log('-> 13. Validating FSSAI / AGMARK Quality Standards...');
// Compliant Raw Honey
const compliantQuality = evaluateHoneyQualityCompliance({
  moisture: 17.5,
  hmf: 22.0,
  fructoseGlucoseRatio: 1.05,
  sucrose: 3.1,
  c4Sugars: 2.0
});

assert.strictEqual(compliantQuality.isCompliant, true);
assert.strictEqual(compliantQuality.agmarkGrade, 'SPECIAL_GRADE_A');
assert.strictEqual(compliantQuality.violations.length, 0);

// Non-compliant honey (High moisture and C4 adulteration)
const nonCompliantQuality = evaluateHoneyQualityCompliance({
  moisture: 22.5,
  hmf: 85.0,
  fructoseGlucoseRatio: 0.88,
  sucrose: 7.2,
  c4Sugars: 12.0
});

assert.strictEqual(nonCompliantQuality.isCompliant, false);
assert.strictEqual(nonCompliantQuality.agmarkGrade, 'NON_COMPLIANT');
assert.ok(nonCompliantQuality.violations.length >= 4);

// ---------------------------------------------------------------------------
// 14. OFFLINE SYNCHRONIZATION & LOCAL LANGUAGE DICTIONARY
// ---------------------------------------------------------------------------
console.log('-> 14. Validating Offline Sync & Local Language Dictionary...');
const syncMgr = new OfflineSyncManager('test_offline_queue');
syncMgr.clearQueue();

const op1 = syncMgr.enqueue({
  entityType: 'INSPECTION',
  entityId: 'insp-101',
  payload: { hiveId: 'H001', broodFrames: 8 }
});

assert.strictEqual(op1.syncState, SYNC_STATES.PENDING_SYNC);
assert.strictEqual(syncMgr.getPendingCount(), 1);

syncMgr.markSynced(op1.queueId);
assert.strictEqual(syncMgr.getPendingCount(), 0);

// Local Language dictionary verification (English, Hindi, Tamil)
assert.strictEqual(getDomainTerm('apiary', 'en'), 'Apiary (Bee Farm)');
assert.ok(getDomainTerm('apiary', 'hi').includes('मधुमक्खी शाला'));
assert.ok(getDomainTerm('apiary', 'ta').includes('தேனீப் பண்ணை'));

assert.ok(getDomainTerm('harvest', 'hi').includes('शहद की कटाई'));
assert.ok(getDomainTerm('harvest', 'ta').includes('தேன் அறுவடை'));

console.log('====================================================');
console.log('ALL INDIA-FIRST APICULTURE DOMAIN TESTS PASSED!');
console.log('====================================================');
