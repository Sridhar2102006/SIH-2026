/**
 * HONEYCHAIN — MASTER PROCESSING WORKFLOW ENGINE
 *
 * Implements configuration-driven Indian honey processing:
 * 1. Plan Generation (Suggested vs Approved)
 * 2. Dynamic Step Resolution (Mandatory / Optional / Conditional)
 * 3. Multi-Source Traceability Lineage
 * 4. Dynamic Parameter Validation & Evidence Logging
 * 5. Process Deviation & Disposition Management
 * 6. Yield & Process Loss Reconciliation
 * 7. Incomplete Batch & Quality Handover Protection
 */

import { CANONICAL_PROCESSING_STEPS, getStepDefinition } from '../data/processor/processingStepCatalog.js';
import { PROCESSING_PROFILES, INITIAL_SOPS, getProfileByCode, getSopById } from '../data/processor/processingProfiles.js';
import { evaluateParameterCompliance } from '../data/processor/regulatoryStandards.js';
import { BATCH_STATUSES, BATCH_STATUS_LABELS } from './processorDomainService.js';

export const STEP_STATUSES = {
  NOT_STARTED: 'NOT_STARTED',
  READY: 'READY',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
  BLOCKED: 'BLOCKED',
  DEVIATION: 'DEVIATION'
};

export const DEVIATION_SEVERITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export const DEVIATION_DISPOSITIONS = {
  ACCEPT: 'ACCEPT (Documented Concession)',
  REWORK: 'REWORK (Additional Settling/Filtration)',
  HOLD: 'HOLD (Awaiting Quality Lab Testing)',
  REJECT: 'REJECT (Batch Diverted / Non-Compliant)',
  OTHER: 'OTHER (Audited Operational Action)'
};

export const ProcessingEngine = {
  /**
   * Generates a Suggested Processing Plan tailored to product, facility, and SOP
   */
  generateSuggestedPlan({
    facilityId = 'fac-pune-01',
    profileCode = 'COMMERCIAL_RETAIL',
    sopId = null,
    sourceHarvests = [],
    availableEquipment = [],
    product = null,
    market = null
  }) {
    const profile = getProfileByCode(profileCode);
    const selectedSopId = sopId || profile.defaultSopId;
    const sop = getSopById(selectedSopId);

    // Analyze incoming material characteristics for conditional steps
    let maxIncomingMoisture = 0;
    let hasHighMoisture = false;

    sourceHarvests.forEach(h => {
      const m = Number(h.moisture || h.receivedMoisture || 0);
      if (m > maxIncomingMoisture) maxIncomingMoisture = m;
      if (m > 20.0) hasHighMoisture = true;
    });

    const plannedSteps = (profile.steps || []).map((stepConfig, index) => {
      const canonical = getStepDefinition(stepConfig.stepKey);
      if (!canonical) return null;

      // Determine requirement: Mandatory, Optional, or Conditional
      let requirement = stepConfig.requirement || canonical.defaultRequirement;
      let conditionMet = true;

      if (requirement === 'CONDITIONAL') {
        if (canonical.conditionRule === 'incomingMoisture > 20.0') {
          conditionMet = hasHighMoisture || maxIncomingMoisture > 20.0;
        }
      }

      // Match available equipment in facility
      const matchingEq = availableEquipment.filter(eq =>
        canonical.allowedEquipmentTypes.some(type =>
          eq.name.toLowerCase().includes(type.toLowerCase()) ||
          eq.type.toLowerCase().includes(type.toLowerCase())
        )
      );

      const assignedEquipment = matchingEq[0]?.name || canonical.allowedEquipmentTypes[0] || 'Standard Line';

      // Parameter initial targets
      const parameterValues = {};
      canonical.parameterDefs.forEach(p => {
        if (p.default !== undefined) parameterValues[p.key] = p.default;
        else if (p.target !== undefined) parameterValues[p.key] = p.target;
      });

      return {
        id: `plan-step-${index + 1}-${canonical.key.toLowerCase()}`,
        stepKey: canonical.key,
        order: stepConfig.order || index + 1,
        name: canonical.name,
        shortLabel: canonical.shortLabel,
        category: canonical.category,
        description: canonical.description,
        requirement, // 'MANDATORY' | 'OPTIONAL' | 'CONDITIONAL'
        conditionRule: canonical.conditionRule || null,
        conditionMet,
        status: index === 0 ? STEP_STATUSES.READY : STEP_STATUSES.NOT_STARTED,
        assignedEquipment,
        allowedEquipmentTypes: canonical.allowedEquipmentTypes,
        evidenceRequired: canonical.evidenceRequired,
        safetyNotes: canonical.safetyNotes,
        parameterDefs: canonical.parameterDefs,
        parameters: parameterValues,
        operator: null,
        startedAt: null,
        completedAt: null,
        evidencePhoto: null,
        remarks: ''
      };
    }).filter(Boolean);

    return {
      profileCode: profile.code,
      profileName: profile.name,
      sopId: sop.id,
      sopCode: sop.code,
      sopVersion: sop.version,
      facilityId,
      plannedSteps,
      steps: plannedSteps,
      generatedAt: new Date().toISOString()
    };
  },

  /**
   * Initializes a new Processing Batch with dual-plan architecture (Suggested vs Approved)
   */
  createProcessingBatch({
    batchCode,
    batchName,
    facilityId = 'fac-pune-01',
    facilityName = 'HoneyHouse Central Processing #2',
    organizationId = 'org-sahyadri-01',
    profileCode = 'COMMERCIAL_RETAIL',
    sopId = null,
    sourceHandovers = [],
    leadOperator = 'Marcus K.',
    product = null,
    market = null,
    availableEquipment = []
  }) {
    const totalWeight = sourceHandovers.reduce((sum, h) => sum + (Number(h.receivedQuantityKg || h.quantityKg) || 0), 0);
    const dominantHoneyType = sourceHandovers[0]?.honeyType || 'Wildflower & Blackberry';

    // Map source harvests preserving full lineage down to Frame/Hive/Apiary
    const sourceHarvests = sourceHandovers.map(h => ({
      handoverId: h.id,
      traceabilityCode: h.traceabilityCode,
      apiaryCode: h.apiaryCode || 'AP1',
      apiaryName: h.apiaryName || 'Meadowbrook Apiary',
      hiveCode: h.hiveCode || 'H001',
      frameNumber: h.frameNumber || 'F1',
      quantityKg: Number(h.receivedQuantityKg || h.quantityKg) || 0,
      honeyType: h.honeyType || dominantHoneyType,
      harvestDate: h.submissionTimestamp || h.harvestDate || 'Recent',
      beekeeper: h.submittingBeekeeper || 'Sarah Lindqvist',
      intakeCondition: h.conditionOnArrival || 'Verified & Sealed'
    }));

    // Generate Suggested Plan
    const planResult = this.generateSuggestedPlan({
      facilityId,
      profileCode,
      sopId,
      sourceHarvests,
      availableEquipment,
      product,
      market
    });

    const sop = getSopById(planResult.sopId);

    const newBatch = {
      id: `batch-${batchCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      batchNumber: batchCode,
      name: batchName || `${dominantHoneyType} Batch ${batchCode.split('-').pop()}`,
      status: BATCH_STATUSES.IN_PROCESSING,
      statusLabel: 'In Processing (Intake Verified)',
      honeyType: dominantHoneyType,
      weightKg: Number(totalWeight.toFixed(2)),
      finalYieldKg: null,
      processLossKg: null,
      yieldPercent: null,
      facilityId,
      facility: facilityName,
      organizationId,
      leadOperator,
      profileCode: planResult.profileCode,
      profileName: planResult.profileName,
      sopId: planResult.sopId,
      sopCode: planResult.sopCode,
      sopVersion: planResult.sopVersion,
      productId: product?.id || 'prod-wild-01',
      targetMarket: market?.id || 'DOMESTIC_RETAIL',
      startedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastUpdated: 'Just now',
      
      // Dual Plan Architecture: Store both Suggested and Approved
      suggestedPlan: planResult.plannedSteps,
      approvedPlan: JSON.parse(JSON.stringify(planResult.plannedSteps)),
      
      // Actual execution steps
      steps: [],
      deviations: [],
      holds: [],
      sourceHarvests,
      qualityHandoff: null
    };

    return newBatch;
  },

  /**
   * Records a processing step execution, validating parameters and detecting deviations
   */
  recordStepExecution({
    batch,
    stepKey,
    parameters = {},
    equipment = '',
    operator = null,
    remarks = '',
    evidence = null
  }) {
    if (!batch) return { success: false, error: 'Batch not found.' };

    const activeOperator = operator || batch.leadOperator || 'Marcus K.';
    const canonical = getStepDefinition(stepKey);
    const existingStepIndex = (batch.steps || []).findIndex(s => s.stepKey === stepKey);

    // Validate parameters against definitions and standards
    const detectedDeviations = [];
    const checkedKeys = new Set();

    if (canonical?.parameterDefs) {
      canonical.parameterDefs.forEach(def => {
        const candidateKeys = [
          def.key,
          ...(def.key === 'targetHoneyTempC' ? ['honeyCoreTempC', 'honeyTempC', 'targetTempC'] : []),
          ...(def.key === 'waterJacketTempC' ? ['warmWaterBathTempC', 'waterBathTempC', 'jacketTempC'] : []),
          ...(def.key === 'initialMoisturePercent' ? ['moisturePercent', 'refractometerMoisture', 'moisture'] : []),
          ...(def.key === 'postMoisturePercent' ? ['finalMoisturePercent', 'postMoisture'] : [])
        ];

        let foundKey = candidateKeys.find(k => parameters[k] !== undefined && parameters[k] !== null && parameters[k] !== '');
        if (foundKey) {
          checkedKeys.add(foundKey);
          const val = parameters[foundKey];
          const num = Number(val);
          if (!isNaN(num)) {
            // Check regulatory compliance first
            const comp = evaluateParameterCompliance(foundKey, num);
            if (comp.status === 'NON_COMPLIANT' && comp.violations?.length > 0) {
              const v = comp.violations[0];
              detectedDeviations.push({
                parameterKey: foundKey,
                parameterName: def.label || foundKey,
                expected: v.expected,
                actual: v.actual,
                severity: num > 50.0 || num > 22.0 ? DEVIATION_SEVERITIES.CRITICAL : DEVIATION_SEVERITIES.HIGH,
                reason: `${v.ruleName} per ${v.authority}: ${v.citation || 'regulatory threshold exceeded'}`
              });
            } else if (def.max !== undefined && num > def.max) {
              detectedDeviations.push({
                parameterKey: foundKey,
                parameterName: def.label || foundKey,
                expected: `<= ${def.max} ${def.unit || ''}`,
                actual: `${num} ${def.unit || ''}`,
                severity: num > (def.max * 1.15) ? DEVIATION_SEVERITIES.CRITICAL : DEVIATION_SEVERITIES.MEDIUM,
                reason: def.validationRule || `Parameter exceeded maximum configured limit of ${def.max} ${def.unit || ''}.`
              });
            } else if (def.min !== undefined && num < def.min) {
              detectedDeviations.push({
                parameterKey: foundKey,
                parameterName: def.label || foundKey,
                expected: `>= ${def.min} ${def.unit || ''}`,
                actual: `${num} ${def.unit || ''}`,
                severity: DEVIATION_SEVERITIES.MEDIUM,
                reason: def.validationRule || `Parameter below minimum configured limit of ${def.min} ${def.unit || ''}.`
              });
            }
          }
        }
      });
    }

    // Also check any extra parameters passed in parameters object that were not checked yet
    Object.entries(parameters).forEach(([paramKey, val]) => {
      if (!checkedKeys.has(paramKey) && val !== undefined && val !== null && val !== '') {
        const num = Number(val);
        if (!isNaN(num)) {
          const comp = evaluateParameterCompliance(paramKey, num);
          if (comp.status === 'NON_COMPLIANT' && comp.violations?.length > 0) {
            const v = comp.violations[0];
            detectedDeviations.push({
              parameterKey: paramKey,
              parameterName: paramKey,
              expected: v.expected,
              actual: v.actual,
              severity: DEVIATION_SEVERITIES.HIGH,
              reason: `${v.ruleName} per ${v.authority}: ${v.citation || 'regulatory threshold exceeded'}`
            });
          }
        }
      }
    });

    const stepExecutionRecord = {
      id: `step-${Date.now()}`,
      stepKey,
      name: canonical?.name || stepKey,
      shortLabel: canonical?.shortLabel || stepKey,
      status: STEP_STATUSES.COMPLETED,
      startedAt: batch.lastUpdated || 'Earlier today',
      completedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      operator: activeOperator,
      equipment: equipment || 'Standard Line',
      parameters,
      remarks,
      evidence,
      hasDeviations: detectedDeviations.length > 0
    };

    let updatedSteps = [...(batch.steps || [])];
    if (existingStepIndex >= 0) {
      updatedSteps[existingStepIndex] = stepExecutionRecord;
    } else {
      updatedSteps.push(stepExecutionRecord);
    }

    // Append any newly discovered process deviations
    const newDeviations = detectedDeviations.map(d => ({
      id: `dev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      batchId: batch.id,
      stepKey,
      stepName: canonical?.name || stepKey,
      parameter: d.parameterKey || d.parameterName,
      parameterKey: d.parameterKey,
      parameterName: d.parameterName,
      expected: d.expected,
      actual: d.actual,
      severity: d.severity,
      reason: d.reason,
      operator: activeOperator,
      disposition: 'HOLD', // default to hold until reviewed
      dispositionNotes: 'Awaiting supervisor disposition review',
      recordedAt: new Date().toISOString(),
      resolvedAt: null,
      reviewedBy: null
    }));

    // Update batch status and yield if final prep step
    let updatedStatus = batch.status;
    let updatedStatusLabel = batch.statusLabel;

    let finalYield = batch.finalYieldKg;
    let lossKg = batch.processLossKg;
    let yieldPct = batch.yieldPercent;

    if (stepKey === 'PACKAGING_PREPARATION' || stepKey === 'FINAL_PROCESSING') {
      updatedStatus = BATCH_STATUSES.PROCESSING_COMPLETE;
      updatedStatusLabel = 'Processing Complete (Ready for QC Handoff)';
      if (parameters.netYieldKg) {
        finalYield = Number(parameters.netYieldKg);
        lossKg = Number(parameters.processLossKg || (batch.weightKg - finalYield).toFixed(2));
        yieldPct = Number(((finalYield / batch.weightKg) * 100).toFixed(1));
      }
    } else {
      updatedStatusLabel = `In Processing (${canonical?.shortLabel || stepKey})`;
    }

    // Update approved plan step statuses (supporting both array and { steps: [...] } formats)
    const planStepList = Array.isArray(batch.approvedPlan)
      ? batch.approvedPlan
      : (batch.approvedPlan?.steps || []);

    const updatedPlanSteps = planStepList.map(pStep => {
      if (pStep.stepKey === stepKey) {
        return { ...pStep, status: STEP_STATUSES.COMPLETED, completedAt: stepExecutionRecord.completedAt };
      }
      return pStep;
    });

    const updatedApprovedPlan = Array.isArray(batch.approvedPlan)
      ? updatedPlanSteps
      : (batch.approvedPlan ? { ...batch.approvedPlan, steps: updatedPlanSteps } : updatedPlanSteps);

    const updatedBatch = {
      ...batch,
      status: updatedStatus,
      statusLabel: updatedStatusLabel,
      lastUpdated: 'Just now',
      finalYieldKg: finalYield,
      processLossKg: lossKg,
      yieldPercent: yieldPct,
      steps: updatedSteps,
      approvedPlan: updatedApprovedPlan,
      deviations: [...newDeviations, ...(batch.deviations || [])]
    };

    return {
      success: true,
      batch: updatedBatch,
      step: stepExecutionRecord,
      newDeviations
    };
  },

  /**
   * Skips an allowed optional step with mandatory audited justification
   */
  skipOptionalStep({ batch, stepKey, reason, operator }) {
    const activeOperator = operator || batch?.leadOperator || 'Marcus K.';
    const canonical = getStepDefinition(stepKey);

    const planStepList = Array.isArray(batch.approvedPlan)
      ? batch.approvedPlan
      : (batch.approvedPlan?.steps || []);

    const updatedPlanSteps = planStepList.map(pStep => {
      if (pStep.stepKey === stepKey) {
        return {
          ...pStep,
          status: STEP_STATUSES.SKIPPED,
          skipReason: reason,
          skippedBy: activeOperator,
          completedAt: new Date().toISOString()
        };
      }
      return pStep;
    });

    const updatedApprovedPlan = Array.isArray(batch.approvedPlan)
      ? updatedPlanSteps
      : (batch.approvedPlan ? { ...batch.approvedPlan, steps: updatedPlanSteps } : updatedPlanSteps);

    const updatedBatch = {
      ...batch,
      approvedPlan: updatedApprovedPlan,
      lastUpdated: 'Just now'
    };

    return { success: true, batch: updatedBatch };
  },

  /**
   * Resolves a Process Deviation with an authorized disposition
   */
  resolveDeviation({ batch, deviationId, disposition, notes, reviewerName }) {
    const updatedDeviations = (batch.deviations || []).map(d => {
      if (d.id === deviationId) {
        return {
          ...d,
          disposition,
          dispositionNotes: notes,
          reviewedBy: reviewerName,
          resolvedAt: new Date().toISOString()
        };
      }
      return d;
    });

    const updatedBatch = {
      ...batch,
      deviations: updatedDeviations,
      lastUpdated: 'Just now'
    };

    return { success: true, batch: updatedBatch };
  },

  /**
   * Evaluates if a batch can be submitted to Quality (Incomplete Batch Protection)
   */
  validateQualityReadiness(batch) {
    if (!batch) {
      return { allowed: false, reasons: ['Batch does not exist'] };
    }

    const reasons = [];
    const missingSteps = [];

    // Check for Hold
    if (batch.status === BATCH_STATUSES.ON_HOLD) {
      reasons.push(`Batch ${batch.batchNumber} is currently ON HOLD. Resolve hold before quality submission.`);
    }

    // Check for already submitted
    if (batch.status === BATCH_STATUSES.SUBMITTED_TO_QUALITY) {
      reasons.push('Batch has already been submitted to Quality.');
    }

    // Check mandatory plan steps
    const completedOrSkippedKeys = (batch.steps || []).map(s => s.stepKey);
    const planSteps = Array.isArray(batch.approvedPlan)
      ? batch.approvedPlan
      : (batch.approvedPlan?.steps || []);

    planSteps.forEach(pStep => {
      if (pStep.requirement === 'MANDATORY' && !completedOrSkippedKeys.includes(pStep.stepKey)) {
        missingSteps.push(pStep.name || pStep.stepKey);
      }
    });

    if (missingSteps.length > 0) {
      reasons.push(`Required processing steps incomplete: ${missingSteps.join(', ')}.`);
    }

    // Check unresolved deviations (any deviation on HOLD or without resolution)
    const unresolvedDeviations = (batch.deviations || []).filter(d =>
      !d.resolvedAt || d.disposition === 'HOLD'
    );

    if (unresolvedDeviations.length > 0) {
      reasons.push(`${unresolvedDeviations.length} unresolved deviation(s) require supervisor disposition.`);
    }

    // Check source material linkage
    if (!batch.sourceHarvests || batch.sourceHarvests.length === 0) {
      reasons.push('Batch must have at least one verified source harvest unit linked.');
    }

    return {
      allowed: reasons.length === 0,
      missingSteps,
      unresolvedDeviations,
      reasons
    };
  }
};
