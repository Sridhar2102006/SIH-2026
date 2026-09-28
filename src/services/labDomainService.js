/**
 * HoneyChain Master Laboratory Domain Service & Testing Engine
 *
 * Implements the complete Laboratory lifecycle:
 * PROCESSING BATCH -> SAMPLE INTAKE -> IDENTIFICATION (LS-2026-0041)
 * -> VERIFY CUSTODY -> ACCEPT / REJECT -> TEST ASSIGNMENT -> TEST EXECUTION (Method, Equipment)
 * -> MEASUREMENT ENTRY -> EVIDENCE ATTACHMENT -> RESULT REVIEW -> QUALITY RECOMMENDATION
 * -> (Authorized Quality Role Only: FINAL QUALITY DECISION)
 * -> FORMAL REPORT BUILDER (LAB-RPT-2026-00421 v1) -> DIGITAL SIGNATURE RELEASE
 * -> FSSAI InFoLNeT REGULATORY SUBMISSION ADAPTER -> OFFICIAL AUTHORITY RESPONSE TRACKING
 *
 * Core Epistemological & Legal Principles:
 * 1. The Lab owns the testing, measurement, and evidence lifecycle.
 * 2. TEST_RESULT !== QUALITY_DECISION (Analytical finding !== business release).
 * 3. LAB_REPORT !== FSSAI_APPROVAL (Certificates never claim false government endorsement).
 * 4. FSSAI_SUBMISSION !== FSSAI_ACCEPTANCE (Submissions require authoritative verification).
 * 5. Sample identity (LS-YYYY-XXXX) is unique, server-generated, and immutable.
 * 6. Equipment must be calibrated and active; uncalibrated equipment blocks test recording.
 * 7. Results are immutable once finalized; corrections create formal AMENDED events.
 * 8. Retests create separate linked test instances; originals are permanently preserved.
 * 9. Every sample maintains full 6-tier traceability back to its origin apiary/hive.
 */

import { RegulatoryRulesEngine } from './regulatoryRulesEngine.js';

// ─── 1. Controlled Sample Statuses ──────────────────────────────────────────

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

// ─── 2. Chain of Custody Event Types ────────────────────────────────────────

export const CUSTODY_ACTIONS = {
  COLLECTED: 'COLLECTED',
  TRANSFERRED: 'TRANSFERRED',
  RECEIVED: 'RECEIVED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  STORED: 'STORED',
  TESTING: 'TESTING',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  DISPOSED_ARCHIVED: 'DISPOSED_ARCHIVED'
};

export const CUSTODY_ACTION_LABELS = {
  COLLECTED: 'Sample Collected at Facility',
  TRANSFERRED: 'Transferred under Custody Seal',
  RECEIVED: 'Received at Laboratory Intake',
  ACCEPTED: 'Custody Verified & Accepted',
  REJECTED: 'Rejected at Intake Verification',
  STORED: 'Placed in Controlled Storage',
  TESTING: 'Transferred to Analytical Bench',
  ON_HOLD: 'Placed under Quarantine Hold',
  COMPLETED: 'Testing Complete & Retained',
  DISPOSED_ARCHIVED: 'Archived in Sample Library'
};

// ─── 3. Rejection & Hold Reasons ────────────────────────────────────────────

export const SAMPLE_REJECTION_REASONS = [
  { id: 'INSUFFICIENT_SAMPLE', label: 'Insufficient sample volume (< 100 mL)' },
  { id: 'CONTAINER_DAMAGED', label: 'Container damaged / Tamper seal compromised' },
  { id: 'TRACEABILITY_MISMATCH', label: 'Traceability label does not match processing batch' },
  { id: 'CONTAMINATION_CONCERN', label: 'Visible foreign particulate or fermentation odor' },
  { id: 'INCORRECT_LABELING', label: 'Incorrect labeling / Missing custody documentation' },
  { id: 'OTHER', label: 'Other protocol deviation (specified in remarks)' }
];

export const SAMPLE_HOLD_REASONS = [
  { id: 'SUSPECTED_TAMPERING', label: 'Suspected seal tampering or container anomaly' },
  { id: 'TEMPERATURE_EXCURSION', label: 'Sample transit temperature outside acceptable range' },
  { id: 'AWAITING_ORIGIN_VERIFICATION', label: 'Awaiting upstream processing batch documentation' },
  { id: 'OTHER', label: 'Other analytical hold' }
];

// ─── 4. Equipment Statuses (§13, §14) ───────────────────────────────────────

export const EQUIPMENT_STATUSES = {
  ACTIVE: 'ACTIVE',
  UNDER_CALIBRATION: 'UNDER_CALIBRATION',
  CALIBRATION_DUE: 'CALIBRATION_DUE',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
  MAINTENANCE: 'MAINTENANCE',
  RETIRED: 'RETIRED'
};

export const EQUIPMENT_STATUS_LABELS = {
  ACTIVE: 'Active & Calibrated',
  UNDER_CALIBRATION: 'Under Calibration',
  CALIBRATION_DUE: 'Calibration Due (Urgent)',
  OUT_OF_SERVICE: 'Out of Service',
  MAINTENANCE: 'Under Maintenance',
  RETIRED: 'Retired'
};

// ─── 5. Controlled Test Statuses & Priorities ───────────────────────────────

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

export const TEST_PRIORITIES = {
  ROUTINE: 'ROUTINE',
  PRIORITY: 'PRIORITY',
  URGENT: 'URGENT'
};

export const TEST_PRIORITY_LABELS = {
  ROUTINE: 'Routine (5-7 Days)',
  PRIORITY: 'Priority (48 Hours)',
  URGENT: 'Urgent (24 Hours)'
};

// ─── 6. Result Review Statuses ──────────────────────────────────────────────

export const REVIEW_STATUSES = {
  DRAFT: 'DRAFT',
  AWAITING_REVIEW: 'AWAITING_REVIEW',
  REVIEWED: 'REVIEWED',
  CORRECTION_REQUESTED: 'CORRECTION_REQUESTED',
  RETEST_REQUIRED: 'RETEST_REQUIRED',
  FINALIZED: 'FINALIZED'
};

export const REVIEW_STATUS_LABELS = {
  DRAFT: 'Draft Measurement',
  AWAITING_REVIEW: 'Awaiting Quality Review',
  REVIEWED: 'Reviewed by Senior Analyst',
  CORRECTION_REQUESTED: 'Correction Requested',
  RETEST_REQUIRED: 'Retest Required',
  FINALIZED: 'Finalized & Locked'
};

// ─── 7. Formal Laboratory Report Statuses (§25, §26) ────────────────────────

export const REPORT_STATUSES = {
  DRAFT: 'DRAFT',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED_FOR_RELEASE: 'APPROVED_FOR_RELEASE',
  RELEASED: 'RELEASED',
  AMENDED: 'AMENDED',
  VOID: 'VOID',
  SUBMITTED_TO_AUTHORITY: 'SUBMITTED_TO_AUTHORITY',
  RESPONSE_RECEIVED: 'RESPONSE_RECEIVED'
};

export const REPORT_STATUS_LABELS = {
  DRAFT: 'Draft Report',
  UNDER_REVIEW: 'Under Technical Review',
  APPROVED_FOR_RELEASE: 'Approved for Sign-off',
  RELEASED: 'Released & Digitally Signed',
  AMENDED: 'Amended (New Version Issued)',
  VOID: 'Voided',
  SUBMITTED_TO_AUTHORITY: 'Submitted to InFoLNeT / FSSAI',
  RESPONSE_RECEIVED: 'Authority Response Received'
};

// ─── 8. Quality Recommendation & Decision Vocabulary (§22) ───────────────────

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
    label: 'Out of Specification — Attention Required',
    description: 'One or more analytical parameters deviate from reference limits. Requires Quality review.',
    tone: 'critical'
  }
};

export const QUALITY_DECISIONS = {
  RELEASED_FOR_BOTTLING: {
    key: 'RELEASED_FOR_BOTTLING',
    label: 'Approved & Released for Bottling',
    tone: 'positive'
  },
  REJECTED_NON_COMPLIANT: {
    key: 'REJECTED_NON_COMPLIANT',
    label: 'Rejected — Non-Compliant',
    tone: 'critical'
  },
  CONDITIONAL_RELEASE: {
    key: 'CONDITIONAL_RELEASE',
    label: 'Conditional Release (Industrial / Bakery Use Only)',
    tone: 'warning'
  }
};

// ─── 9. Versioned Laboratory Test Catalog (§15, §16) ────────────────────────

export const LAB_TEST_CATALOG = {
  MOISTURE: {
    key: 'MOISTURE',
    name: 'Refractometric Moisture Content',
    shortName: 'Moisture',
    category: 'PHYSICAL',
    standardMethod: 'AOAC 969.38 / ISO 2173 Digital Refractometry',
    methodVersion: '2026.1',
    unit: '%',
    minAllowedInput: 10.0,
    maxAllowedInput: 30.0,
    standardMin: 14.0,
    standardMax: 18.5,
    precision: 1,
    description: 'Direct optical refractive index converted to water content percentage. Standard requires ≤ 18.5% for grade A raw honey.',
    referenceLimitText: '14.0% – 18.5% (Max 20.0% Codex limit)',
    recommendedEquipment: 'EQ-REFR-01',
    isAccreditedInScope: true
  },
  HMF: {
    key: 'HMF',
    name: 'Hydroxymethylfurfural (HMF) Spectrophotometry',
    shortName: 'HMF',
    category: 'CHEMICAL',
    standardMethod: 'Winkler Photometric Method / IHC Harmonised',
    methodVersion: '2026.1',
    unit: 'mg/kg',
    minAllowedInput: 0.0,
    maxAllowedInput: 150.0,
    standardMin: 0.0,
    standardMax: 40.0,
    precision: 1,
    description: 'Freshness and thermal history biomarker. Levels above 40 mg/kg indicate excessive heating, age, or poor storage.',
    referenceLimitText: '< 40.0 mg/kg (Raw unprocessed honey standard)',
    recommendedEquipment: 'EQ-SPEC-02',
    isAccreditedInScope: true
  },
  DIASTASE: {
    key: 'DIASTASE',
    name: 'Diastase Enzyme Activity (Schade Units)',
    shortName: 'Diastase',
    category: 'CHEMICAL',
    standardMethod: 'Phadebas Spectrophotometric Assay / Schade',
    methodVersion: '2026.1',
    unit: 'DN',
    minAllowedInput: 0.0,
    maxAllowedInput: 60.0,
    standardMin: 8.0,
    standardMax: 50.0,
    precision: 1,
    description: 'Alpha-amylase enzyme activity ensuring raw preservation. Standard requires > 8.0 DN (Schade units).',
    referenceLimitText: '> 8.0 DN (Active unpasteurized enzymes)',
    recommendedEquipment: 'EQ-SPEC-02',
    isAccreditedInScope: true
  },
  ELECTRICAL_CONDUCTIVITY: {
    key: 'ELECTRICAL_CONDUCTIVITY',
    name: 'Electrical Conductivity',
    shortName: 'Conductivity',
    category: 'PHYSICAL',
    standardMethod: 'IHC Harmonised Conductivity Cell at 20°C',
    methodVersion: '2026.1',
    unit: 'mS/cm',
    minAllowedInput: 0.05,
    maxAllowedInput: 2.5,
    standardMin: 0.1,
    standardMax: 0.8,
    precision: 2,
    description: 'Mineral content measurement separating floral honey (≤ 0.8 mS/cm) from honeydew honey.',
    referenceLimitText: '≤ 0.80 mS/cm (Blossom honey standard)',
    recommendedEquipment: 'EQ-COND-01',
    isAccreditedInScope: true
  },
  POLLEN: {
    key: 'POLLEN',
    name: 'Melissopalynology (Pollen Spectrum & Botanical Origin)',
    shortName: 'Pollen Spectrum',
    category: 'MICROSCOPICAL',
    standardMethod: 'Louveaux Microscopic Centrifugation Standard',
    methodVersion: '2026.1',
    unit: '%',
    minAllowedInput: 0.0,
    maxAllowedInput: 100.0,
    standardMin: 45.0,
    standardMax: 100.0,
    precision: 1,
    description: 'Relative frequency of dominant botanical pollen taxa to verify floral designation authenticity.',
    referenceLimitText: '≥ 45.0% dominant taxon for monofloral claim',
    recommendedEquipment: 'EQ-MICR-03',
    isAccreditedInScope: true
  },
  C4_SUGARS: {
    key: 'C4_SUGARS',
    name: 'C4 Sugar Carbon Isotope Ratio Mass Spectrometry (EA-IRMS)',
    shortName: 'C4 Sugars (EA-IRMS)',
    category: 'ADULTERATION_RESIDUE',
    standardMethod: 'AOAC 998.12 / FSSAI Honey Manual 03',
    methodVersion: '2026.1',
    unit: '%',
    minAllowedInput: 0.0,
    maxAllowedInput: 50.0,
    standardMin: 0.0,
    standardMax: 7.0,
    precision: 1,
    description: 'Quantification of C4 cane/corn syrup adulteration via stable carbon isotope ratio deviation.',
    referenceLimitText: '< 7.0% C4 sugar apparent addition (Negative)',
    recommendedEquipment: 'EQ-IRMS-01',
    isAccreditedInScope: false // Demonstrates non-accredited scope boundary (§9)
  }
};

// ─── 10. Laboratory Calibrated Equipment Inventory (§13, §14) ───────────────

export const LAB_EQUIPMENT_CATALOG = [
  {
    id: 'EQ-REFR-01',
    name: 'Atago PAL-22S Digital Honey Refractometer',
    type: 'Refractometer',
    serialNumber: 'SN-ATG-98412',
    status: EQUIPMENT_STATUSES.ACTIVE,
    lastCalibrationDate: '2026-09-20',
    nextCalibrationDate: '2026-10-20',
    calibrationCertificate: 'CAL-2026-09-ATG',
    location: 'Physical Testing Bench 01',
    operatorEligibility: ['Dr. Elena Vance', 'Marcus K.', 'Sarah Lindqvist']
  },
  {
    id: 'EQ-SPEC-02',
    name: 'Shimadzu UV-1800 Dual-Beam Spectrophotometer',
    type: 'Spectrophotometer',
    serialNumber: 'SN-SHM-44109',
    status: EQUIPMENT_STATUSES.ACTIVE,
    lastCalibrationDate: '2026-09-18',
    nextCalibrationDate: '2026-10-18',
    calibrationCertificate: 'CAL-2026-09-SHM',
    location: 'Spectrophotometry Room B',
    operatorEligibility: ['Dr. Elena Vance', 'Marcus K.']
  },
  {
    id: 'EQ-COND-01',
    name: 'Hanna HI-98311 DiST 5 EC/TDS Precision Tester',
    type: 'Conductivity Meter',
    serialNumber: 'SN-HNA-10293',
    status: EQUIPMENT_STATUSES.ACTIVE,
    lastCalibrationDate: '2026-09-22',
    nextCalibrationDate: '2026-10-22',
    calibrationCertificate: 'CAL-2026-09-HNA',
    location: 'Physical Testing Bench 01',
    operatorEligibility: ['Dr. Elena Vance', 'Marcus K.', 'Sarah Lindqvist']
  },
  {
    id: 'EQ-MICR-03',
    name: 'Olympus CX33 Trinocular Biological Microscope',
    type: 'Microscope',
    serialNumber: 'SN-OLY-88320',
    status: EQUIPMENT_STATUSES.ACTIVE,
    lastCalibrationDate: '2026-09-15',
    nextCalibrationDate: '2026-10-15',
    calibrationCertificate: 'CAL-2026-09-OLY',
    location: 'Melissopalynology Room A',
    operatorEligibility: ['Dr. Elena Vance', 'Sarah Lindqvist']
  },
  {
    id: 'EQ-IRMS-01',
    name: 'Thermo Scientific Delta V Isotope Ratio MS',
    type: 'EA-IRMS',
    serialNumber: 'SN-THM-55201',
    status: EQUIPMENT_STATUSES.CALIBRATION_DUE, // Example for testing calibration due alerts
    lastCalibrationDate: '2026-08-10',
    nextCalibrationDate: '2026-09-10',
    calibrationCertificate: 'CAL-2026-08-THM',
    location: 'Advanced Trace Lab 03',
    operatorEligibility: ['Dr. Elena Vance']
  }
];

// ─── 11. Unique ID Generators ────────────────────────────────────────────────

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
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
}

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
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
}

export function generateReportId(existingReports = [], year = 2026) {
  const prefix = `LAB-RPT-${year}-`;
  let maxSeq = 0;
  for (const r of existingReports) {
    if (r.id && r.id.startsWith(prefix)) {
      const numPart = parseInt(r.id.slice(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }
  return `${prefix}${String(maxSeq + 1).padStart(5, '0')}`;
}

export function generateSubmissionId(existingSubmissions = [], year = 2026) {
  const prefix = `FSSAI-SUB-${year}-`;
  let maxSeq = 0;
  for (const s of existingSubmissions) {
    if (s.id && s.id.startsWith(prefix)) {
      const numPart = parseInt(s.id.slice(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }
  return `${prefix}${String(maxSeq + 1).padStart(5, '0')}`;
}

export function generateCustodyEventId(existingEvents = [], year = 2026) {
  const prefix = `COC-${year}-`;
  let maxSeq = 0;
  for (const e of existingEvents) {
    if (e.id && e.id.startsWith(prefix)) {
      const numPart = parseInt(e.id.slice(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }
  return `${prefix}${String(maxSeq + 1).padStart(5, '0')}`;
}

// ─── 12. Validators ──────────────────────────────────────────────────────────

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

/**
 * Validates Test Measurement with Equipment Calibration Status Check (§13, §14)
 */
export function validateTestMeasurement({
  testKey,
  rawMeasurement,
  equipmentId,
  operator,
  equipmentCatalog = LAB_EQUIPMENT_CATALOG
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
        `Measurement ${numVal} ${testDef.unit} is outside configured physical boundaries (${testDef.minAllowedInput} – ${testDef.maxAllowedInput} ${testDef.unit}).`
      );
    }
  }

  // Equipment Calibration & Status Check (§14)
  if (equipmentId) {
    const equip = equipmentCatalog.find(e => e.id === equipmentId);
    if (!equip) {
      errors.push(`Equipment ID '${equipmentId}' is not registered in laboratory inventory.`);
    } else {
      if (equip.status === EQUIPMENT_STATUSES.OUT_OF_SERVICE) {
        errors.push(`Equipment ${equip.name} (${equip.id}) is OUT OF SERVICE. Test cannot proceed.`);
      } else if (equip.status === EQUIPMENT_STATUSES.CALIBRATION_DUE) {
        errors.push(`Equipment ${equip.name} (${equip.id}) has expired calibration (Due: ${equip.nextCalibrationDate}). Recalibration required.`);
      } else if (equip.status === EQUIPMENT_STATUSES.UNDER_CALIBRATION) {
        errors.push(`Equipment ${equip.name} is currently undergoing calibration.`);
      } else if (equip.status === EQUIPMENT_STATUSES.MAINTENANCE) {
        errors.push(`Equipment ${equip.name} is currently under maintenance.`);
      }
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

/**
 * Creates an amended analytical result record preserving full audit linkage (§20)
 */
export function createAmendedResult({
  originalResult,
  newReading,
  actor,
  justification
}) {
  const validation = validateResultCorrection({
    previousValue: originalResult?.rawReading ?? originalResult?.result,
    newValue: newReading,
    reason: justification,
    actor
  });

  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors
    };
  }

  const amendedResult = {
    ...originalResult,
    resultId: `${originalResult.resultId || originalResult.id}-AMEND-${Date.now().toString().slice(-4)}`,
    rawReading: newReading,
    result: newReading,
    isAmended: true,
    previousResultRef: originalResult.resultId || originalResult.id,
    amendmentReason: justification,
    amendedBy: actor,
    amendedAt: new Date().toISOString()
  };

  return {
    isValid: true,
    amendedResult
  };
}

/**
 * Creates a distinct retest record linked to original test without overwriting (§21)
 */
export function createRetestRecord({
  originalResult,
  reason,
  analyst
}) {
  return {
    ...originalResult,
    resultId: `${originalResult.resultId || originalResult.id}-RETEST-${Date.now().toString().slice(-4)}`,
    originalResultId: originalResult.resultId || originalResult.id,
    isRetest: true,
    retestReason: reason,
    analyst: analyst || 'Assigned Analyst',
    status: TEST_STATUSES.ASSIGNED,
    rawReading: null,
    result: null,
    createdAt: new Date().toISOString()
  };
}

/**
 * Validates formal 4-eyes report sign-off and digital PIN authorization (§27, §35)
 */
export function validateReportSignOff({
  report,
  signerRole,
  pinCode
}) {
  const errors = [];
  const authorizedRoles = ['QUALITY_MANAGER', 'AUTHORIZED_SIGNATORY', 'LAB_DIRECTOR', 'TECHNICAL_MANAGER'];
  
  if (!authorizedRoles.includes(signerRole)) {
    errors.push(`Role ${signerRole} is not authorized to release laboratory reports.`);
  }

  if (!pinCode || String(pinCode).length !== 4) {
    errors.push('A valid 4-digit digital signing PIN is required.');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    updatedReport: {
      ...report,
      status: REPORT_STATUSES.RELEASED,
      releasedBy: signerRole,
      releasedAt: new Date().toISOString()
    }
  };
}

// ─── 13. Quality Recommendation Formulation ─────────────────────────────────

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
    } else if (t.testKey === 'C4_SUGARS') {
      if (val >= 7.0) hasOutOfSpec = true;
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

// ─── 14. 6-Tier Traceability Lineage Resolver (§53) ──────────────────────────

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
    lineageString: `${resolvedApiaries[0]?.code || 'AP1'} → ${resolvedHives[0]?.code || 'H001'} → ${contributingHarvestCodes[0] || 'AP1H001F1'} → ${sample.sourceBatchNumber || 'PB-2026-00041'} → ${sample.id}`
  };
}

// ─── 15. Initial State Stores ───────────────────────────────────────────────

export const initialLabSamples = [];
export const initialLabTests = [];
export const initialLabAuditLog = [];
export const initialLabReports = [];
export const initialRegulatorySubmissions = [];

export const LabDomainService = {
  SAMPLE_STATUSES,
  SAMPLE_STATUS_LABELS,
  CUSTODY_ACTIONS,
  CUSTODY_ACTION_LABELS,
  SAMPLE_REJECTION_REASONS,
  SAMPLE_HOLD_REASONS,
  EQUIPMENT_STATUSES,
  EQUIPMENT_STATUS_LABELS,
  TEST_STATUSES,
  TEST_STATUS_LABELS,
  TEST_PRIORITIES,
  TEST_PRIORITY_LABELS,
  REVIEW_STATUSES,
  REVIEW_STATUS_LABELS,
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  QUALITY_RECOMMENDATIONS,
  QUALITY_DECISIONS,
  LAB_TEST_CATALOG,
  LAB_EQUIPMENT_CATALOG,
  generateSampleId,
  generateTestId,
  generateReportId,
  generateSubmissionId,
  generateCustodyEventId,
  validateSampleIntake,
  validateSampleRejection,
  validateTestAssignment,
  validateTestMeasurement,
  validateResultCorrection,
  evaluateQualityRecommendation,
  resolveSampleTraceability,
  initialLabSamples,
  initialLabTests,
  initialLabAuditLog,
  initialLabReports,
  initialRegulatorySubmissions
};
