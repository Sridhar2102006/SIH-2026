/**
 * HoneyChain Master Processor Domain Service & Traceability Engine
 *
 * Implements the core processing lifecycle:
 * HARVEST INTAKE (AP1H001F3) â†’ VERIFICATION â†’ ACCEPT/REJECT â†’ PROCESSING BATCH (PB-2026-00041)
 * â†’ EXTRACTION â†’ FILTRATION â†’ SETTLING â†’ PREPARATION â†’ FINAL PROCESSING â†’ QUALITY HANDOVER
 *
 * Golden Principles:
 * 1. The Processor does NOT own hives or bee disease.
 * 2. Source identity (AP1H001F3) is preserved immutably.
 * 3. Batch code (PB-2026-XXXXX) is distinct from source codes.
 * 4. Many-to-one traceability lineage is fully queryable.
 * 5. Incomplete batches can NEVER be submitted to Quality.
 * 6. Downstream Quality/Packaging/Dispatch is read-only unless authorized.
 */

// Operational Intake Statuses
export const INTAKE_STATUSES = {
  SUBMITTED_BY_BEEKEEPER: 'SUBMITTED_BY_BEEKEEPER',
  SUBMITTED_TO_PROCESSOR: 'SUBMITTED_TO_PROCESSOR',
  AWAITING_INTAKE: 'AWAITING_INTAKE',
  RECEIVED: 'RECEIVED',
  ON_HOLD: 'ON_HOLD',
  ASSIGNED_TO_BATCH: 'ASSIGNED_TO_BATCH',
  REJECTED: 'REJECTED'
};

export const INTAKE_STATUS_LABELS = {
  SUBMITTED_BY_BEEKEEPER: 'Submitted by Beekeeper',
  SUBMITTED_TO_PROCESSOR: 'Submitted for Processing',
  AWAITING_INTAKE: 'Awaiting Intake',
  RECEIVED: 'Received & Verified',
  ON_HOLD: 'Intake On Hold',
  ASSIGNED_TO_BATCH: 'Assigned to Batch',
  REJECTED: 'Rejected at Intake'
};

// Processing Batch Statuses
export const BATCH_STATUSES = {
  CREATED: 'CREATED',
  AWAITING_INTAKE: 'AWAITING_INTAKE',
  IN_PROCESSING: 'IN_PROCESSING',
  ON_HOLD: 'ON_HOLD',
  PROCESSING_COMPLETE: 'PROCESSING_COMPLETE',
  READY_FOR_QUALITY: 'READY_FOR_QUALITY',
  SUBMITTED_TO_QUALITY: 'SUBMITTED_TO_QUALITY',
  QUALITY_PASSED: 'QUALITY_PASSED',
  QUALITY_FAILED: 'QUALITY_FAILED'
};

export const BATCH_STATUS_LABELS = {
  CREATED: 'Batch Created',
  AWAITING_INTAKE: 'Awaiting Intake',
  IN_PROCESSING: 'In Processing',
  ON_HOLD: 'On Hold',
  PROCESSING_COMPLETE: 'Processing Complete',
  READY_FOR_QUALITY: 'Ready for Quality',
  SUBMITTED_TO_QUALITY: 'Submitted to Quality',
  QUALITY_PASSED: 'Quality Certified',
  QUALITY_FAILED: 'Quality Rejected'
};

// Approved Honey Processing Step Sequence
export const PROCESSING_STEPS = [
  {
    key: 'EXTRACTION',
    name: 'Centrifugal Extraction',
    shortLabel: 'Extraction',
    order: 1,
    required: true,
    description: 'Uncapping of comb wax and variable-speed centrifugal extraction of raw honey.',
    equipmentTypes: ['Radial Extractor #1', 'Radial Extractor #2', 'Manual Spin Tank'],
    parameterDefs: [
      { key: 'temperatureC', label: 'Ambient / Honey Temp (Â°C)', min: 18, max: 36, unit: 'Â°C', default: 24 },
      { key: 'spinSpeedRpm', label: 'Centrifuge Speed (RPM)', min: 100, max: 800, unit: 'RPM', default: 350 },
      { key: 'durationMin', label: 'Spin Duration (minutes)', min: 5, max: 60, unit: 'min', default: 18 }
    ]
  },
  {
    key: 'FILTRATION',
    name: 'Coarse & Fine Mesh Filtration',
    shortLabel: 'Filtration',
    order: 2,
    required: true,
    description: 'Cold gravity or gentle pump dual-mesh stainless steel filtration removing wax particles.',
    equipmentTypes: ['Double Stainless Sieve #1 (400/200 Âµm)', 'Rotary Strainer #2', 'Gravity Sieve System'],
    parameterDefs: [
      { key: 'coarseMeshUm', label: 'Coarse Sieve (microns)', min: 300, max: 1000, unit: 'Âµm', default: 400 },
      { key: 'fineMeshUm', label: 'Fine Sieve (microns)', min: 100, max: 300, unit: 'Âµm', default: 200 },
      { key: 'flowRateLph', label: 'Flow Rate (L/hr)', min: 20, max: 500, unit: 'L/h', default: 120 }
    ]
  },
  {
    key: 'SETTLING',
    name: 'Clarification & Settling Tank',
    shortLabel: 'Settling',
    order: 3,
    required: true,
    description: 'Holding in food-grade settling tank for 24â€“72 hours to allow micro air bubbles and foam to surface.',
    equipmentTypes: ['Settling Tank #1 (300L)', 'Settling Tank #2 (500L Jacketed)', 'Holding Cistern A'],
    parameterDefs: [
      { key: 'tankTempC', label: 'Tank Holding Temp (Â°C)', min: 18, max: 32, unit: 'Â°C', default: 22.5 },
      { key: 'settlingHours', label: 'Settling Duration (hours)', min: 12, max: 120, unit: 'hrs', default: 48 },
      { key: 'foamSkimmed', label: 'Surface Foam Skimmed', type: 'boolean', default: true }
    ]
  },
  {
    key: 'PREPARATION',
    name: 'Moisture & Clarity Stabilization',
    shortLabel: 'Preparation',
    order: 4,
    required: false,
    description: 'Gentle temperature stabilization and refractometer moisture verification.',
    equipmentTypes: ['Thermal Dehumidifier Cabinet', 'Digital Refractometer Atago #4'],
    parameterDefs: [
      { key: 'moisturePercent', label: 'Measured Moisture (%)', min: 13.0, max: 21.0, unit: '%', default: 17.4 },
      { key: 'refractometerModel', label: 'Device Model', default: 'Atago PAL-22S' }
    ]
  },
  {
    key: 'FINAL_PROCESSING',
    name: 'Final Quality Preparation',
    shortLabel: 'Final Prep',
    order: 5,
    required: true,
    description: 'Final tank draw, tare weight reconciliation, and lot prep for Quality handover.',
    equipmentTypes: ['Digital Platform Scale 500kg', 'Transfer Valve #3'],
    parameterDefs: [
      { key: 'netYieldKg', label: 'Net Settled Yield (kg)', min: 0.5, max: 2000, unit: 'kg' },
      { key: 'lossPercent', label: 'Estimated Process Loss (%)', min: 0, max: 10, unit: '%', default: 1.2 }
    ]
  }
];

// Valid Reasons for Rejecting Incoming Harvest Material
export const INTAKE_REJECTION_REASONS = [
  { id: 'QUANTITY_MISMATCH', label: 'Quantity Mismatch', description: 'Net weight significantly diverges from beekeeper record.' },
  { id: 'DAMAGED_MATERIAL', label: 'Damaged / Fermented Material', description: 'Comb crushed, early fermentation, or insect contamination.' },
  { id: 'TRACEABILITY_ISSUE', label: 'Traceability / Seal Issue', description: 'Container seal missing, broken, or unreadable source QR code.' },
  { id: 'QUALITY_CONCERN', label: 'Visual Quality Concern', description: 'Excess unripened honey, high water content, or smoke soot aroma.' },
  { id: 'OTHER', label: 'Other Operational Reason', description: 'Specific irregularity described in remarks.' }
];

// Valid Reasons for Putting a Processing Batch On Hold
export const BATCH_HOLD_REASONS = [
  { id: 'EQUIPMENT_ISSUE', label: 'Equipment Malfunction', description: 'Centrifuge motor, pump, or tank valve requires maintenance.' },
  { id: 'PROCESS_DEVIATION', label: 'Process / Temp Deviation', description: 'Settling room temperature out of bounds.' },
  { id: 'MISSING_INFORMATION', label: 'Awaiting Beekeeper Documentation', description: 'Floral origin confirmation or yard log requested.' },
  { id: 'MATERIAL_ISSUE', label: 'Suspected High Moisture', description: 'Material requires moisture re-test before moving to settling.' },
  { id: 'OTHER', label: 'Other Process Hold', description: 'Specific reason documented by processing operator.' }
];

// State Machine for Processing Batches
export const ALLOWED_BATCH_TRANSITIONS = {
  CREATED: ['AWAITING_INTAKE', 'IN_PROCESSING'],
  AWAITING_INTAKE: ['IN_PROCESSING', 'ON_HOLD'],
  IN_PROCESSING: ['ON_HOLD', 'PROCESSING_COMPLETE'],
  ON_HOLD: ['IN_PROCESSING'],
  PROCESSING_COMPLETE: ['READY_FOR_QUALITY', 'IN_PROCESSING'],
  READY_FOR_QUALITY: ['SUBMITTED_TO_QUALITY', 'IN_PROCESSING'],
  SUBMITTED_TO_QUALITY: ['QUALITY_PASSED', 'QUALITY_FAILED'],
  QUALITY_PASSED: [],
  QUALITY_FAILED: ['IN_PROCESSING']
};

export const ProcessorDomainService = {
  /**
   * Generates a unique, standardized Processing Batch Identifier
   * Format: PB-YYYY-XXXXX (e.g. PB-2026-00041)
   */
  generateBatchCode(existingBatches = [], year = new Date().getFullYear()) {
    const prefix = `PB-${year}-`;
    let highestNum = 0;

    existingBatches.forEach(b => {
      const code = b.batchNumber || b.code || '';
      if (code.startsWith(prefix)) {
        const numPart = parseInt(code.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > highestNum) {
          highestNum = numPart;
        }
      }
    });

    const nextNum = highestNum + 1;
    return `${prefix}${String(nextNum).padStart(5, '0')}`;
  },

  /**
   * Validates if a batch state transition is allowed
   */
  canTransitionBatch(currentStatus, nextStatus) {
    if (!currentStatus || !nextStatus) return false;
    if (currentStatus === nextStatus) return false;
    const allowed = ALLOWED_BATCH_TRANSITIONS[currentStatus] || [];
    return allowed.includes(nextStatus);
  },

  /**
   * Validates Intake Acceptance Data
   */
  validateIntakeAcceptance({ receivedQuantityKg, conditionOnArrival, operator }) {
    const errors = [];
    const qty = Number(receivedQuantityKg);

    if (isNaN(qty) || qty <= 0) {
      errors.push('Received quantity must be a positive number greater than 0 kg.');
    }
    if (qty > 1000) {
      errors.push('Single intake quantity exceeds maximum realistic container limit (1000 kg).');
    }
    if (!conditionOnArrival || conditionOnArrival.trim().length === 0) {
      errors.push('Condition on arrival must be documented.');
    }
    if (!operator || operator.trim().length === 0) {
      errors.push('Receiving processor operator name is required.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validates Intake Rejection
   */
  validateIntakeRejection({ reasonId, remarks, operator }) {
    const errors = [];
    const validReason = INTAKE_REJECTION_REASONS.some(r => r.id === reasonId);

    if (!validReason) {
      errors.push('A valid rejection reason must be selected.');
    }
    if (!remarks || remarks.trim().length < 5) {
      errors.push('Detailed rejection remarks (at least 5 characters) are required.');
    }
    if (!operator || operator.trim().length === 0) {
      errors.push('Rejecting processor operator name is required.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validates Step Execution Parameters
   */
  validateStepParameters(stepKey, parameters = {}) {
    const stepDef = PROCESSING_STEPS.find(s => s.key === stepKey);
    if (!stepDef) {
      return { isValid: false, errors: [`Unknown processing step: ${stepKey}`] };
    }

    const errors = [];

    stepDef.parameterDefs?.forEach(def => {
      const val = parameters[def.key];
      if (val !== undefined && val !== null && val !== '') {
        const num = Number(val);
        if (def.type !== 'boolean') {
          if (isNaN(num)) {
            errors.push(`${def.label} must be a valid number.`);
          } else {
            if (def.min !== undefined && num < def.min) {
              errors.push(`${def.label} cannot be below minimum allowed value of ${def.min} ${def.unit || ''}.`);
            }
            if (def.max !== undefined && num > def.max) {
              errors.push(`${def.label} cannot exceed maximum allowed value of ${def.max} ${def.unit || ''}.`);
            }
          }
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validates if a batch is eligible for submission to Quality
   * Incomplete Batch Protection (Section 29, 30)
   */
  canSubmitBatchToQuality(batch) {
    const missingSteps = [];
    const reasons = [];

    if (!batch) {
      return { allowed: false, missingSteps: ['Batch not found'], reasons: ['Batch does not exist'] };
    }

    if (batch.status === BATCH_STATUSES.ON_HOLD) {
      reasons.push('Batch is currently ON HOLD. Resolve the hold condition before submitting.');
    }

    if (batch.status === BATCH_STATUSES.SUBMITTED_TO_QUALITY) {
      reasons.push('Batch has already been submitted to Quality.');
    }

    // Check all required steps have been recorded
    const completedStepKeys = (batch.steps || []).map(s => s.stepKey);
    const requiredSteps = PROCESSING_STEPS.filter(s => s.required);

    requiredSteps.forEach(req => {
      if (!completedStepKeys.includes(req.key)) {
        missingSteps.push(req.name);
      }
    });

    if (missingSteps.length > 0) {
      reasons.push(`Required processing steps missing: ${missingSteps.join(', ')}.`);
    }

    // Check source material linkage
    if (!batch.sourceHarvests || batch.sourceHarvests.length === 0) {
      reasons.push('Batch has no linked source harvest material.');
    }

    // Check final quantity
    const weight = Number(batch.weightKg || batch.finalYieldKg || 0);
    if (isNaN(weight) || weight <= 0) {
      reasons.push('Valid net yield weight must be established before Quality handoff.');
    }

    return {
      allowed: reasons.length === 0 && missingSteps.length === 0,
      missingSteps,
      reasons
    };
  },

  /**
   * Resolves Many-to-One Traceability Lineage for a batch
   */
  resolveBatchLineage(batch, allHarvests = []) {
    if (!batch) return null;

    const sourceHarvests = (batch.sourceHarvests || []).map(src => {
      const fullRecord = allHarvests.find(h => h.traceabilityCode === src.traceabilityCode || h.id === src.harvestRecordId);
      return {
        traceabilityCode: src.traceabilityCode,
        apiaryCode: src.apiaryCode || fullRecord?.apiaryCode || 'AP1',
        hiveCode: src.hiveCode || fullRecord?.hiveCode || 'H001',
        frameNumber: src.frameNumber || fullRecord?.frameNumber || 'F1',
        quantityKg: src.quantityKg || fullRecord?.quantityKg || 0,
        honeyType: src.honeyType || fullRecord?.honeyType || 'Wildflower',
        harvestDate: src.harvestDate || fullRecord?.harvestDate || fullRecord?.date || 'Recent',
        beekeeper: src.beekeeper || fullRecord?.beekeeper || 'Apiary Lead'
      };
    });

    return {
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      sourceUnitsCount: sourceHarvests.length,
      totalSourceKg: Math.round(sourceHarvests.reduce((acc, h) => acc + (Number(h.quantityKg) || 0), 0) * 100) / 100,
      sourceHarvests,
      stepsCount: (batch.steps || []).length,
      status: batch.status,
      statusLabel: batch.statusLabel
    };
  }
};


const completedSteps = PROCESSING_STEPS.filter(step => step.required).map(step => ({ stepKey: step.key, name: step.name }));

// Coherent, read-only demonstration batches. They intentionally retain source
// records so lineage, quality handoff and downstream dispatch can be exercised.
export const initialProcessingBatches = [
  {
    id: 'pb-demo-41', batchNumber: 'PB-2026-00041', batchName: 'September Wildflower Extraction', status: BATCH_STATUSES.IN_PROCESSING, statusLabel: BATCH_STATUS_LABELS.IN_PROCESSING, weightKg: 31.4,
    sourceHarvests: [
      { traceabilityCode: 'AP1H001F1', quantityKg: 2.5, apiaryCode: 'AP1', hiveCode: 'H001', frameNumber: 'F1' },
      { traceabilityCode: 'AP1H001F2', quantityKg: 2.6, apiaryCode: 'AP1', hiveCode: 'H001', frameNumber: 'F2' },
      { traceabilityCode: 'AP1H001F5', quantityKg: 2.8, apiaryCode: 'AP1', hiveCode: 'H001', frameNumber: 'F5' }
    ],
    steps: [{ stepKey: 'EXTRACTION', name: 'Centrifugal Extraction' }]
  },
  {
    id: 'pb-demo-40', batchNumber: 'PB-2026-00040', batchName: 'August Clover Extraction', status: BATCH_STATUSES.READY_FOR_QUALITY, statusLabel: BATCH_STATUS_LABELS.READY_FOR_QUALITY, weightKg: 27.8,
    sourceHarvests: [{ traceabilityCode: 'AP1H001F3', quantityKg: 28.1, apiaryCode: 'AP1', hiveCode: 'H001', frameNumber: 'F3' }],
    steps: completedSteps
  }
];

export const initialProcessingAuditLog = [];
