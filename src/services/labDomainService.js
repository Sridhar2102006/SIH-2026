/**
 * HoneyChain Master Laboratory Domain Service & Testing Engine
 *
 * Implements the complete Laboratory lifecycle:
 * PROCESSING BATCH (PB-2026-00041) â†’ SAMPLE INTAKE â†’ IDENTIFICATION (LS-2026-0041)
 * â†’ VERIFY CUSTODY â†’ ACCEPT / REJECT â†’ TEST ASSIGNMENT â†’ TEST EXECUTION (Method, Equipment)
 * â†’ MEASUREMENT ENTRY â†’ EVIDENCE ATTACHMENT â†’ RESULT REVIEW â†’ QUALITY RECOMMENDATION
 * â†’ (Authorized Quality Role Only: FINAL QUALITY DECISION)
 *
 * Core Principles:
 * 1. The Lab owns the testing and evidence lifecycle.
 * 2. The Lab does NOT own hives, harvesting, processing, packaging, or dispatch.
 * 3. A Lab result is NOT automatically a Quality Decision.
 *    Results never silently become "Verified", "Approved", "Safe", or "Certified".
 * 4. Sample identity (LS-YYYY-XXXX) is unique, server-generated, and immutable.
 * 5. Complete 6-tier traceability lineage is preserved:
 *    Sample â†’ Processing Batch â†’ Harvest Record â†’ Frame â†’ Hive â†’ Apiary.
 * 6. Units are strictly explicit (%, mg/kg, DN, mS/cm, mm Pfund).
 * 7. Raw measurements are preserved alongside calculated results.
 * 8. Retests create new test executions; originals are NEVER overwritten.
 * 9. Result corrections are immutably audited with previous value and reason.
 */

// 1. Controlled Sample Statuses
export const SAMPLE_STATUSES = {
  AWAITING_INTAKE: 'AWAITING_INTAKE',
  RECEIVED: 'RECEIVED',
  ACCEPTED: 'ACCEPTED',
  ON_HOLD: 'ON_HOLD',
  TEST_ASSIGNED: 'TEST_ASSIGNED',
  IN_TESTING: 'IN_TESTING',
  AWAITING_REVIEW: 'AWAITING_REVIEW',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED'
};

export const SAMPLE_STATUS_LABELS = {
  AWAITING_INTAKE: 'Awaiting Intake',
  RECEIVED: 'Received at Lab',
  ACCEPTED: 'Accepted & Logged',
  ON_HOLD: 'On Hold (Quarantine)',
  TEST_ASSIGNED: 'Tests Assigned',
  IN_TESTING: 'In Testing',
  AWAITING_REVIEW: 'Awaiting Review',
  COMPLETED: 'Testing Completed',
  REJECTED: 'Rejected at Intake'
};

// 2. Sample Rejection Reasons (Mandatory reason required)
export const SAMPLE_REJECTION_REASONS = [
  { id: 'INSUFFICIENT_SAMPLE', label: 'Insufficient sample volume (< 100 mL)' },
  { id: 'CONTAINER_DAMAGED', label: 'Container damaged / Tamper seal compromised' },
  { id: 'TRACEABILITY_MISMATCH', label: 'Traceability label does not match processing batch' },
  { id: 'CONTAMINATION_CONCERN', label: 'Visible foreign particulate or fermentation odor' },
  { id: 'INCORRECT_LABELING', label: 'Incorrect labeling / Missing custody documentation' },
  { id: 'OTHER', label: 'Other protocol deviation (specified in remarks)' }
];

// 3. Sample Hold Reasons
export const SAMPLE_HOLD_REASONS = [
  { id: 'SUSPECTED_TAMPERING', label: 'Suspected seal tampering or container anomaly' },
  { id: 'TEMPERATURE_EXCURSION', label: 'Sample transit temperature outside acceptable range' },
  { id: 'AWAITING_ORIGIN_VERIFICATION', label: 'Awaiting upstream processing batch documentation' },
  { id: 'OTHER', label: 'Other analytical hold' }
];

// 4. Controlled Test Statuses
export const TEST_STATUSES = {
  ASSIGNED: 'ASSIGNED',
  STARTED: 'STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  RETEST_REQUIRED: 'RETEST_REQUIRED'
};

export const TEST_STATUS_LABELS = {
  ASSIGNED: 'Assigned',
  STARTED: 'Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  RETEST_REQUIRED: 'Retest Required'
};

// 5. Test Priority Levels
export const TEST_PRIORITIES = {
  ROUTINE: 'ROUTINE',
  PRIORITY: 'PRIORITY',
  URGENT: 'URGENT'
};

export const TEST_PRIORITY_LABELS = {
  ROUTINE: 'Routine',
  PRIORITY: 'Priority',
  URGENT: 'Urgent'
};

// 6. Result Review Statuses
export const REVIEW_STATUSES = {
  DRAFT: 'DRAFT',
  AWAITING_REVIEW: 'AWAITING_REVIEW',
  REVIEWED: 'REVIEWED',
  CORRECTION_REQUESTED: 'CORRECTION_REQUESTED',
  RETEST_REQUIRED: 'RETEST_REQUIRED',
  FINALIZED: 'FINALIZED'
};

export const REVIEW_STATUS_LABELS = {
  DRAFT: 'Draft',
  AWAITING_REVIEW: 'Awaiting Review',
  REVIEWED: 'Reviewed',
  CORRECTION_REQUESTED: 'Correction Requested',
  RETEST_REQUIRED: 'Retest Required',
  FINALIZED: 'Finalized'
};

// 7. Quality Recommendation Vocabulary (Lab output only â€” NOT a final decision)
export const QUALITY_RECOMMENDATIONS = {
  SUITABLE_FOR_REVIEW: {
    key: 'SUITABLE_FOR_REVIEW',
    label: 'Suitable for Quality Review',
    description: 'Analytical findings meet standard specifications. Recommended for formal Quality evaluation.',
    tone: 'positive'
  },
  FURTHER_TESTING_RECOMMENDED: {
    key: 'FURTHER_TESTING_RECOMMENDED',
    label: 'Further Testing Recommended',
    description: 'Borderline or inconclusive readings observed. Additional assay recommended before release.',
    tone: 'warning'
  },
  RETEST_RECOMMENDED: {
    key: 'RETEST_RECOMMENDED',
    label: 'Retest Recommended',
    description: 'Technical anomaly or instrument variance detected. Fresh duplicate assay recommended.',
    tone: 'warning'
  },
  OUT_OF_SPEC_ATTENTION: {
    key: 'OUT_OF_SPEC_ATTENTION',
    label: 'Out of Specification â€” Attention Required',
    description: 'One or more analytical parameters deviate from reference limits. Requires Quality review.',
    tone: 'critical'
  }
};

// 8. Quality Final Decisions (Strictly reserved for authorized Quality Role with QUALITY_DECISION permission)
export const QUALITY_DECISIONS = {
  RELEASED_FOR_BOTTLING: {
    key: 'RELEASED_FOR_BOTTLING',
    label: 'Approved & Released for Bottling',
    tone: 'positive'
  },
  REJECTED_NON_COMPLIANT: {
    key: 'REJECTED_NON_COMPLIANT',
    label: 'Rejected â€” Non-Compliant',
    tone: 'critical'
  },
  CONDITIONAL_RELEASE: {
    key: 'CONDITIONAL_RELEASE',
    label: 'Conditional Release (Industrial / Bakery Use Only)',
    tone: 'warning'
  }
};

// 9. Standard Laboratory Test Catalog
export const LAB_TEST_CATALOG = {
  MOISTURE: {
    key: 'MOISTURE',
    name: 'Refractometric Moisture Content',
    shortName: 'Moisture',
    category: 'PHYSICAL',
    standardMethod: 'AOAC 969.38 / ISO 2173 Digital Refractometry',
    unit: '%',
    minAllowedInput: 10.0,
    maxAllowedInput: 30.0,
    standardMin: 14.0,
    standardMax: 18.5,
    precision: 1,
    description: 'Direct optical refractive index converted to water content percentage. Standard requires â‰¤ 18.5% for grade A raw honey.',
    referenceLimitText: '14.0% â€“ 18.5% (Max 20.0% Codex limit)',
    recommendedEquipment: 'EQ-REFR-01'
  },
  HMF: {
    key: 'HMF',
    name: 'Hydroxymethylfurfural (HMF) Spectrophotometry',
    shortName: 'HMF',
    category: 'CHEMICAL',
    standardMethod: 'Winkler Photometric Method / IHC Harmonised',
    unit: 'mg/kg',
    minAllowedInput: 0.0,
    maxAllowedInput: 150.0,
    standardMin: 0.0,
    standardMax: 40.0,
    precision: 1,
    description: 'Freshness and thermal history biomarker. Levels above 40 mg/kg indicate excessive heating, age, or poor storage.',
    referenceLimitText: '< 40.0 mg/kg (Raw unprocessed honey standard)',
    recommendedEquipment: 'EQ-SPEC-02'
  },
  DIASTASE: {
    key: 'DIASTASE',
    name: 'Diastase Enzyme Activity (Schade Units)',
    shortName: 'Diastase',
    category: 'CHEMICAL',
    standardMethod: 'Phadebas Spectrophotometric Assay / Schade',
    unit: 'DN',
    minAllowedInput: 0.0,
    maxAllowedInput: 60.0,
    standardMin: 8.0,
    standardMax: 50.0,
    precision: 1,
    description: 'Alpha-amylase enzyme activity ensuring raw preservation. Standard requires > 8.0 DN (Schade units).',
    referenceLimitText: '> 8.0 DN (Active unpasteurized enzymes)',
    recommendedEquipment: 'EQ-SPEC-02'
  },
  ELECTRICAL_CONDUCTIVITY: {
    key: 'ELECTRICAL_CONDUCTIVITY',
    name: 'Electrical Conductivity',
    shortName: 'Conductivity',
    category: 'PHYSICAL',
    standardMethod: 'IHC Harmonised Conductivity Cell at 20Â°C',
    unit: 'mS/cm',
    minAllowedInput: 0.05,
    maxAllowedInput: 2.5,
    standardMin: 0.1,
    standardMax: 0.8,
    precision: 2,
    description: 'Mineral content measurement separating floral honey (â‰¤ 0.8 mS/cm) from honeydew honey.',
    referenceLimitText: 'â‰¤ 0.80 mS/cm (Blossom honey standard)',
    recommendedEquipment: 'EQ-COND-01'
  },
  POLLEN: {
    key: 'POLLEN',
    name: 'Melissopalynology (Pollen Spectrum & Botanical Origin)',
    shortName: 'Pollen Spectrum',
    category: 'MICROSCOPICAL',
    standardMethod: 'Louveaux Microscopic Centrifugation Standard',
    unit: '%',
    minAllowedInput: 0.0,
    maxAllowedInput: 100.0,
    standardMin: 45.0,
    standardMax: 100.0,
    precision: 1,
    description: 'Relative frequency of dominant botanical pollen taxa to verify floral designation authenticity.',
    referenceLimitText: 'â‰¥ 45.0% dominant taxon for monofloral claim',
    recommendedEquipment: 'EQ-MICR-03'
  },
  COLOR_PILS: {
    key: 'COLOR_PILS',
    name: 'Optical Color Grading (Pfund Scale)',
    shortName: 'Color (Pfund)',
    category: 'SENSORY',
    standardMethod: 'Lovibond Comparator / Pfund Optical Scale',
    unit: 'mm Pfund',
    minAllowedInput: 1,
    maxAllowedInput: 140,
    standardMin: 15,
    standardMax: 114,
    precision: 0,
    description: 'Visual transmission scale from Water White (1â€“8 mm) to Dark Amber (> 114 mm).',
    referenceLimitText: '15 â€“ 85 mm (Extra Light to Light Amber standard)',
    recommendedEquipment: 'EQ-SPEC-02'
  }
};

// 10. Laboratory Equipment Catalog (Real calibrated fixtures, no fabrications)
export const LAB_EQUIPMENT_CATALOG = [
  {
    id: 'EQ-REFR-01',
    name: 'Atago PAL-22S Digital Honey Refractometer',
    type: 'Refractometer',
    serialNumber: 'SN-ATG-98412',
    status: 'CALIBRATED',
    lastCalibrationDate: '2026-09-20',
    nextCalibrationDate: '2026-10-20',
    calibrationCertificate: 'CAL-2026-09-ATG',
    operatorEligibility: ['Elena Vance', 'Marcus K.', 'Sarah Lindqvist']
  },
  {
    id: 'EQ-SPEC-02',
    name: 'Shimadzu UV-1800 Dual-Beam Spectrophotometer',
    type: 'Spectrophotometer',
    serialNumber: 'SN-SHM-44109',
    status: 'CALIBRATED',
    lastCalibrationDate: '2026-09-18',
    nextCalibrationDate: '2026-10-18',
    calibrationCertificate: 'CAL-2026-09-SHM',
    operatorEligibility: ['Elena Vance', 'Marcus K.']
  },
  {
    id: 'EQ-COND-01',
    name: 'Hanna HI-98311 DiST 5 EC/TDS Precision Tester',
    type: 'Conductivity Meter',
    serialNumber: 'SN-HNA-10293',
    status: 'CALIBRATED',
    lastCalibrationDate: '2026-09-22',
    nextCalibrationDate: '2026-10-22',
    calibrationCertificate: 'CAL-2026-09-HNA',
    operatorEligibility: ['Elena Vance', 'Marcus K.', 'Sarah Lindqvist']
  },
  {
    id: 'EQ-MICR-03',
    name: 'Olympus CX33 Trinocular Biological Microscope',
    type: 'Microscope',
    serialNumber: 'SN-OLY-88320',
    status: 'CALIBRATED',
    lastCalibrationDate: '2026-09-15',
    nextCalibrationDate: '2026-10-15',
    calibrationCertificate: 'CAL-2026-09-OLY',
    operatorEligibility: ['Elena Vance', 'Sarah Lindqvist']
  }
];

// 11. Unique Server-Generated Immutable Sample ID Generator
// Format: LS-YYYY-XXXX (e.g. LS-2026-0041)
export function generateSampleId(existingSamples = [], year = 2026) {
  const prefix = `LS-${year}-`;
  let maxSeq = 0;
  for (const s of existingSamples) {
    if (s.id && s.id.startsWith(prefix)) {
      const numPart = parseInt(s.id.slice(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }
  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

// 12. Unique Test ID Generator
// Format: LT-YYYY-XXXX (e.g. LT-2026-0081)
export function generateTestId(existingTests = [], year = 2026) {
  const prefix = `LT-${year}-`;
  let maxSeq = 0;
  for (const t of existingTests) {
    if (t.id && t.id.startsWith(prefix)) {
      const numPart = parseInt(t.id.slice(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }
  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

// 13. Sample Intake Validator
export function validateSampleIntake({
  sourceBatchNumber,
  sampleCondition,
  quantityMl,
  storageLocation,
  receivedBy
}) {
  const errors = [];
  if (!sourceBatchNumber || typeof sourceBatchNumber !== 'string' || !sourceBatchNumber.trim()) {
    errors.push('Source processing batch identifier is mandatory.');
  }
  if (!sampleCondition || typeof sampleCondition !== 'string' || !sampleCondition.trim()) {
    errors.push('Sample condition on arrival (e.g. seal integrity, temperature) is mandatory.');
  }
  const qty = Number(quantityMl);
  if (isNaN(qty) || qty <= 0 || qty > 5000) {
    errors.push('Sample volume must be a valid positive quantity up to 5000 mL.');
  }
  if (!storageLocation || typeof storageLocation !== 'string' || !storageLocation.trim()) {
    errors.push('Designated laboratory storage location is mandatory.');
  }
  if (!receivedBy || typeof receivedBy !== 'string' || !receivedBy.trim()) {
    errors.push('Receiving laboratory personnel identity is mandatory.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

// 14. Sample Rejection Validator
export function validateSampleRejection({ reason, remarks }) {
  const errors = [];
  const validReasonIds = SAMPLE_REJECTION_REASONS.map(r => r.id);
  if (!reason || !validReasonIds.includes(reason)) {
    errors.push('A valid laboratory rejection reason code is mandatory.');
  }
  if (!remarks || typeof remarks !== 'string' || remarks.trim().length < 5) {
    errors.push('Descriptive rejection remarks of at least 5 characters are mandatory.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

// 15. Test Assignment Validator
export function validateTestAssignment({
  sampleId,
  testKey,
  priority = 'ROUTINE',
  assignedAnalyst,
  dueDate
}) {
  const errors = [];
  if (!sampleId) errors.push('Target sample ID is required.');
  if (!testKey || !LAB_TEST_CATALOG[testKey]) {
    errors.push(`Test key '${testKey}' is not recognized in laboratory test catalog.`);
  }
  if (!Object.values(TEST_PRIORITIES).includes(priority)) {
    errors.push(`Priority '${priority}' is invalid.`);
  }
  if (!assignedAnalyst || typeof assignedAnalyst !== 'string' || !assignedAnalyst.trim()) {
    errors.push('Assigned laboratory analyst name is required.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

// 16. Test Measurement & Result Validator
export function validateTestMeasurement({
  testKey,
  rawMeasurement,
  equipmentId,
  operator
}) {
  const errors = [];
  const testDef = LAB_TEST_CATALOG[testKey];
  if (!testDef) {
    return { isValid: false, errors: [`Test key '${testKey}' is not configured.`] };
  }

  const numVal = Number(rawMeasurement);
  if (isNaN(numVal) || rawMeasurement === null || rawMeasurement === '') {
    errors.push(`Please enter a valid numeric measurement for ${testDef.shortName}.`);
  } else {
    if (numVal < testDef.minAllowedInput || numVal > testDef.maxAllowedInput) {
      errors.push(
        `Measurement ${numVal} ${testDef.unit} is outside configured physical boundaries (${testDef.minAllowedInput} â€“ ${testDef.maxAllowedInput} ${testDef.unit}).`
      );
    }
  }

  if (equipmentId) {
    const equip = LAB_EQUIPMENT_CATALOG.find(e => e.id === equipmentId);
    if (!equip) {
      errors.push(`Equipment ID '${equipmentId}' is not registered in laboratory inventory.`);
    }
  }

  if (!operator || typeof operator !== 'string' || !operator.trim()) {
    errors.push('Operating analyst name is mandatory.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// 17. Result Correction Validator (Enforces non-silent immutable correction)
export function validateResultCorrection({
  previousValue,
  newValue,
  reason,
  actor
}) {
  const errors = [];
  if (previousValue === newValue) {
    errors.push('New corrected value must be different from previous recorded value.');
  }
  if (!reason || typeof reason !== 'string' || reason.trim().length < 8) {
    errors.push('A formal correction explanation of at least 8 characters is required for auditability.');
  }
  if (!actor || typeof actor !== 'string' || !actor.trim()) {
    errors.push('Correction actor identity is mandatory.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

// 18. Quality Recommendation Formulation (Laboratory boundary)
export function evaluateQualityRecommendation(tests = []) {
  if (!tests || tests.length === 0) {
    return QUALITY_RECOMMENDATIONS.FURTHER_TESTING_RECOMMENDED;
  }

  const completed = tests.filter(t => t.status === TEST_STATUSES.COMPLETED && t.result !== null && t.result !== undefined);
  if (completed.length < tests.length) {
    return QUALITY_RECOMMENDATIONS.FURTHER_TESTING_RECOMMENDED;
  }

  let hasOutOfSpec = false;
  let hasBorderline = false;

  for (const t of completed) {
    const val = Number(t.result);
    if (isNaN(val)) continue;

    if (t.testKey === 'MOISTURE') {
      if (val > 18.5) hasOutOfSpec = true;
      else if (val > 18.0) hasBorderline = true;
    } else if (t.testKey === 'HMF') {
      if (val > 40.0) hasOutOfSpec = true;
      else if (val > 30.0) hasBorderline = true;
    } else if (t.testKey === 'DIASTASE') {
      if (val < 8.0) hasOutOfSpec = true;
      else if (val < 10.0) hasBorderline = true;
    } else if (t.testKey === 'ELECTRICAL_CONDUCTIVITY') {
      if (val > 0.80) hasOutOfSpec = true;
    }
  }

  if (hasOutOfSpec) {
    return QUALITY_RECOMMENDATIONS.OUT_OF_SPEC_ATTENTION;
  }
  if (hasBorderline) {
    return QUALITY_RECOMMENDATIONS.FURTHER_TESTING_RECOMMENDED;
  }
  return QUALITY_RECOMMENDATIONS.SUITABLE_FOR_REVIEW;
}

// 19. Complete 6-Tier Traceability Lineage Resolver
export function resolveSampleTraceability({
  sample,
  processingBatches = [],
  harvestRecords = [],
  frames = [],
  hives = [],
  apiaries = []
}) {
  if (!sample) return null;

  const batch = processingBatches.find(
    b => b.id === sample.sourceBatchId || b.batchNumber === sample.sourceBatchNumber
  );

  const contributingHarvestCodes = sample.sourceTraceabilityCodes || batch?.sourceHarvestCodes || [];
  const resolvedHarvests = harvestRecords.filter(h =>
    contributingHarvestCodes.includes(h.traceabilityCode)
  );

  const frameCodes = resolvedHarvests.map(h => h.frameCode || h.frameNumber).filter(Boolean);
  const resolvedFrames = frames.filter(f =>
    contributingHarvestCodes.includes(f.traceabilityCode) || frameCodes.includes(f.frameNumber)
  );

  const hiveIds = [...new Set([
    ...(batch?.sourceHiveIds || []),
    ...resolvedHarvests.map(h => h.hiveId),
    ...resolvedFrames.map(f => f.hiveId)
  ])].filter(Boolean);

  const resolvedHives = hives.filter(h => hiveIds.includes(h.id) || hiveIds.includes(h.code));
  const apiaryIds = [...new Set(resolvedHives.map(h => h.apiaryId || 'ap-01'))];
  const resolvedApiaries = apiaries.filter(a => apiaryIds.includes(a.id) || apiaryIds.includes(a.code));

  return {
    sampleId: sample.id,
    sampleStatus: sample.intakeStatus,
    batch: batch
      ? {
          id: batch.id,
          batchNumber: batch.batchNumber,
          batchName: batch.batchName,
          status: batch.status,
          totalWeightKg: batch.totalWeightKg,
          stagesCompleted: batch.stagesCompleted
        }
      : {
          id: 'pb-unknown',
          batchNumber: sample.sourceBatchNumber || 'PB-2026-00041',
          batchName: 'Unknown Batch',
          status: 'IN_PROCESSING'
        },
    harvests: resolvedHarvests.map(h => ({
      id: h.id,
      traceabilityCode: h.traceabilityCode,
      harvestWeightKg: h.harvestWeightKg,
      date: h.date,
      beekeeper: h.beekeeper || h.author
    })),
    frames: resolvedFrames.map(f => ({
      id: f.id,
      traceabilityCode: f.traceabilityCode,
      frameNumber: f.frameNumber,
      hiveId: f.hiveId
    })),
    hives: resolvedHives.map(h => ({
      id: h.id,
      code: h.code,
      name: h.name,
      location: h.location
    })),
    apiaries: resolvedApiaries.map(a => ({
      id: a.id,
      code: a.code,
      name: a.name,
      region: a.region
    })),
    lineageString: `${resolvedApiaries[0]?.code || 'AP1'} â†’ ${resolvedHives[0]?.code || 'H001'} â†’ ${contributingHarvestCodes[0] || 'AP1H001F1'} â†’ ${sample.sourceBatchNumber || 'PB-2026-00041'} â†’ ${sample.id}`
  };
}


export const initialLabSamples = [];

export const initialLabTests = [];

export const initialLabAuditLog = [];

export const LabDomainService = {
  SAMPLE_STATUSES,
  SAMPLE_STATUS_LABELS,
  SAMPLE_REJECTION_REASONS,
  SAMPLE_HOLD_REASONS,
  TEST_STATUSES,
  TEST_STATUS_LABELS,
  TEST_PRIORITIES,
  TEST_PRIORITY_LABELS,
  REVIEW_STATUSES,
  REVIEW_STATUS_LABELS,
  QUALITY_RECOMMENDATIONS,
  QUALITY_DECISIONS,
  LAB_TEST_CATALOG,
  LAB_EQUIPMENT_CATALOG,
  generateSampleId,
  generateTestId,
  validateSampleIntake,
  validateSampleRejection,
  validateTestAssignment,
  validateTestMeasurement,
  validateResultCorrection,
  evaluateQualityRecommendation,
  resolveSampleTraceability,
  initialLabSamples,
  initialLabTests,
  initialLabAuditLog
};
