/**
 * HONEYCHAIN — REGULATORY RULES & LABORATORY STANDARDS ENGINE
 *
 * Centralized, versioned validation engine evaluating honey processing and analytical
 * laboratory parameters against national and international standards:
 * - FSSAI (Food Safety and Standards Authority of India) Honey Testing Manual 03 (v2026.1)
 * - NABL (National Accreditation Board for Testing and Calibration Laboratories) ISO/IEC 17025
 * - InFoLNeT (Indian Food Laboratories Network) Regulatory Framework
 * - Codex Alimentarius Standard for Honey (CXS 12-1981, Rev. 2022)
 * - BIS IS 4941 & Agmark Apiculture Standards
 *
 * Strict Architectural Separation (§1, §2, §22, §54):
 * - REGULATORY_SOURCE !== LAB_CREDENTIAL
 * - LAB_ACCREDITATION !== FSSAI_RECOGNITION
 * - TEST_RESULT !== QUALITY_DECISION
 * - TEST_REPORT !== FSSAI_APPROVAL
 * - REGULATORY_SUBMISSION !== OFFICIAL_ACCEPTANCE
 */

import {
  REGULATORY_STANDARDS,
  RULE_AUTHORITIES,
  RULE_ORIGIN_TYPES,
  evaluateParameterCompliance
} from '../data/processor/regulatoryStandards.js';

export { REGULATORY_STANDARDS, RULE_AUTHORITIES, RULE_ORIGIN_TYPES };

// ─── 1. Controlled Regulatory Statuses ───────────────────────────────────────

export const REGULATORY_SUBMISSION_STATUSES = Object.freeze({
  PREPARING: 'PREPARING',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ACTION_REQUIRED: 'ACTION_REQUIRED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
});

export const INFOLNET_SUBMISSION_STATUSES = REGULATORY_SUBMISSION_STATUSES;

export const REGULATORY_SUBMISSION_STATUS_LABELS = Object.freeze({
  PREPARING: 'Preparing Dossier',
  SUBMITTED: 'Submitted to Authority',
  UNDER_REVIEW: 'Under Authority Review',
  ACTION_REQUIRED: 'Clarification / Action Required',
  ACCEPTED: 'Accepted & Verified by Authority',
  REJECTED: 'Rejected / Non-Compliant',
  COMPLETED: 'Lifecycle Finalized & Archived'
});

export const ACCREDITATION_STATUSES = Object.freeze({
  NOT_YET: 'NOT_YET',
  APPLICATION_IN_PROGRESS: 'APPLICATION_IN_PROGRESS',
  ACCREDITED: 'ACCREDITED',
  OTHER_RECOGNIZED: 'OTHER_RECOGNIZED'
});

export const ACCREDITATION_STATUS_LABELS = Object.freeze({
  NOT_YET: 'Not Accredited',
  APPLICATION_IN_PROGRESS: 'Application in Progress',
  ACCREDITED: 'NABL ISO/IEC 17025 Accredited',
  OTHER_RECOGNIZED: 'Other Authority Recognized'
});

// ─── 2. Versioned Regulatory Standards & Honey Test Catalogs ─────────────────

export const REGULATORY_RULE_VERSIONS = [
  {
    versionId: 'FSSAI-HONEY-2026.1',
    authority: 'FSSAI',
    title: 'FSSAI Honey & Beehive Products Manual of Methods (Version 2026.1)',
    effectiveDate: '2026-09-01',
    description: 'Updated September 2026 laboratory testing guidelines with enhanced foreign sugar screening & SMR/TMR markers.',
    isCurrent: true,
    parameters: {
      MOISTURE: {
        maxLimit: 18.5,
        minLimit: 14.0,
        unit: '%',
        method: 'AOAC 969.38 / ISO 2173 Digital Refractometry',
        citation: 'FSSAI Manual 03, Section 2.1'
      },
      HMF: {
        maxLimit: 40.0,
        unit: 'mg/kg',
        method: 'Winkler Photometric Method / IHC Harmonised',
        citation: 'FSSAI Manual 03, Section 4.2'
      },
      DIASTASE: {
        minLimit: 8.0,
        unit: 'DN',
        method: 'Phadebas Spectrophotometric Assay / Schade',
        citation: 'FSSAI Manual 03, Section 5.1'
      },
      ELECTRICAL_CONDUCTIVITY: {
        maxLimit: 0.80,
        unit: 'mS/cm',
        method: 'IHC Harmonised Conductivity Cell at 20°C',
        citation: 'FSSAI Manual 03, Section 3.4'
      },
      POLLEN: {
        minLimit: 45.0,
        unit: '%',
        method: 'Louveaux Microscopic Centrifugation Standard',
        citation: 'FSSAI Manual 03, Section 7.2'
      },
      C4_SUGARS: {
        maxLimit: 7.0,
        unit: '%',
        method: 'EA-IRMS (Elemental Analyzer - Isotope Ratio Mass Spectrometry)',
        citation: 'FSSAI Gazette Amendment 2026 / Section 9'
      }
    }
  },
  {
    versionId: 'CODEX-STAN-12-REV2022',
    authority: 'CODEX',
    title: 'Codex Alimentarius Standard for Honey (CXS 12-1981, Rev. 2022)',
    effectiveDate: '2022-11-15',
    description: 'International food standard adopted by the Codex Alimentarius Commission.',
    isCurrent: false,
    parameters: {
      MOISTURE: { maxLimit: 20.0, minLimit: 13.0, unit: '%', method: 'AOAC 969.38' },
      HMF: { maxLimit: 40.0, unit: 'mg/kg', method: 'Winkler / HPLC' },
      DIASTASE: { minLimit: 8.0, unit: 'DN', method: 'Schade' },
      ELECTRICAL_CONDUCTIVITY: { maxLimit: 0.80, unit: 'mS/cm', method: 'Conductivity Cell' }
    }
  }
];

// ─── 3. Regulatory Rules Engine ──────────────────────────────────────────────

export const RegulatoryRulesEngine = {
  /**
   * Get active regulatory version
   */
  getCurrentStandardVersion() {
    return REGULATORY_RULE_VERSIONS.find(v => v.isCurrent) || REGULATORY_RULE_VERSIONS[0];
  },

  /**
   * Get all available standard versions
   */
  getAllStandardVersions() {
    return REGULATORY_RULE_VERSIONS;
  },

  /**
   * Get all active processor rules
   */
  getRules(authority = null) {
    if (!authority) return REGULATORY_STANDARDS;
    return REGULATORY_STANDARDS.filter(r => r.authority === authority);
  },

  /**
   * Evaluates a single measurement against processor standards
   */
  evaluateMeasurement(parameterKey, value, context = {}) {
    return evaluateParameterCompliance(parameterKey, value, context);
  },

  /**
   * Evaluates an analytical laboratory test reading against active FSSAI standards
   */
  evaluateLabTestCompliance(testKey, rawMeasurement, versionId = 'FSSAI-HONEY-2026.1') {
    const version = REGULATORY_RULE_VERSIONS.find(v => v.versionId === versionId) || this.getCurrentStandardVersion();
    const paramRule = version.parameters[testKey];

    if (!paramRule) {
      return {
        isEvaluated: false,
        status: 'UNKNOWN_PARAMETER',
        message: `Parameter '${testKey}' is not configured in ${version.title}.`
      };
    }

    const val = Number(rawMeasurement);
    if (isNaN(val)) {
      return {
        isEvaluated: false,
        status: 'INVALID_NUMERIC',
        message: 'Non-numeric analytical measurement provided.'
      };
    }

    const violations = [];
    if (paramRule.maxLimit !== undefined && val > paramRule.maxLimit) {
      violations.push(`Value ${val} ${paramRule.unit} exceeds allowable ceiling of ${paramRule.maxLimit} ${paramRule.unit}`);
    }
    if (paramRule.minLimit !== undefined && val < paramRule.minLimit) {
      violations.push(`Value ${val} ${paramRule.unit} is below mandatory minimum of ${paramRule.minLimit} ${paramRule.unit}`);
    }

    const isPassing = violations.length === 0;

    return {
      isEvaluated: true,
      testKey,
      measuredValue: val,
      unit: paramRule.unit,
      standardVersion: version.versionId,
      citation: paramRule.citation || version.title,
      isCompliant: isPassing,
      status: isPassing ? 'IN_SPECIFICATION' : 'OUT_OF_SPECIFICATION',
      violations,
      evaluationTimestamp: new Date().toISOString()
    };
  },

  /**
   * Enforces Accreditation Scope (§8, §9)
   * Prevents a lab from claiming an unaccredited method/test as accredited.
   */
  validateAccreditationScope(accreditationScope = [], testKey) {
    if (!accreditationScope || accreditationScope.length === 0) {
      return {
        isAccreditedForTest: false,
        scopeRecord: null,
        message: 'Laboratory has no registered ISO/IEC 17025 accreditation scope for this test.'
      };
    }

    const matched = accreditationScope.find(
      s => (s.testKey === testKey || s.parameter === testKey) && s.isAccredited
    );

    if (matched) {
      return {
        isAccreditedForTest: true,
        scopeRecord: matched,
        message: `Accredited under NABL ISO/IEC 17025 Scope (Method: ${matched.approvedMethod || matched.method}).`
      };
    }

    return {
      isAccreditedForTest: false,
      scopeRecord: null,
      message: `Test '${testKey}' is outside registered NABL accreditation scope. Results cannot be issued as NABL-accredited.`
    };
  },

  /**
   * Enforces Separation of Analytical Finding vs Quality Decision (§22, §54)
   * Analytical findings may pass, but only an authorized Quality role can make a business release.
   */
  validateQualityDecisionSeparation({
    tests = [],
    qualityRecommendation = null,
    actorRole = null,
    decisionType = null
  }) {
    const errors = [];

    // Ensure all assigned tests are completed
    const incomplete = tests.filter(t => t.status !== 'COMPLETED');
    if (incomplete.length > 0) {
      errors.push(`Cannot formulate Quality Decision: ${incomplete.length} assigned test(s) are still in progress.`);
    }

    // Role check: Only Quality Manager / Certifier can issue final decision
    const authorizedRoles = ['QUALITY_MANAGER', 'CERTIFIER', 'LEAD_ANALYST', 'FACILITY_MANAGER'];
    if (actorRole && !authorizedRoles.includes(actorRole.toUpperCase())) {
      errors.push(`Role '${actorRole}' is not authorized to make final Quality Decisions. Laboratory analysts may only submit Recommendations.`);
    }

    // Flag non-compliant tests if trying to release for bottling
    if (decisionType === 'RELEASED_FOR_BOTTLING') {
      const failingTests = tests.filter(t => t.evaluation && !t.evaluation.isCompliant);
      if (failingTests.length > 0) {
        errors.push(`Cannot release for bottling: ${failingTests.length} test(s) are Out of Specification (${failingTests.map(t => t.testKey).join(', ')}).`);
      }
    }

    return {
      isEligible: errors.length === 0,
      errors
    };
  },

  /**
   * Evaluates an entire processing batch against regulatory and SOP thresholds
   */
  evaluateBatchCompliance(batch, sop = null) {
    if (!batch) return { isCompliant: false, issues: ['Batch is null'] };

    const issues = [];
    const evaluatedParameters = [];

    // Extract parameters from completed steps
    const stepParameters = {};
    (batch.steps || []).forEach(step => {
      if (step.parameters) {
        Object.entries(step.parameters).forEach(([k, v]) => {
          stepParameters[k] = v;
        });
      }
    });

    // 1. Moisture Check
    const moisture = stepParameters.finalMoisturePercent || stepParameters.moisturePercent || stepParameters.postMoisturePercent || stepParameters.initialMoisturePercent;
    if (moisture !== undefined && moisture !== null) {
      const evalResult = evaluateParameterCompliance('moisturePercent', moisture);
      evaluatedParameters.push({
        parameter: 'Moisture Content',
        value: `${moisture}%`,
        status: evalResult.status,
        authority: 'FSSAI Cl. 2.8.2',
        originType: RULE_ORIGIN_TYPES.REGULATORY_REQUIREMENT
      });
      if (evalResult.status === 'NON_COMPLIANT') {
        evalResult.violations.forEach(v => {
          issues.push({
            severity: 'CRITICAL',
            title: 'Excess Moisture Level Exceeds Regulatory Threshold',
            detail: `Measured ${v.actual} exceeds allowable limit of ${v.expected}.`,
            authority: v.authority,
            citation: v.citation
          });
        });
      }
    }

    // 2. Temperature Limits Check (Heating/Warming)
    const warmingTemp = stepParameters.targetHoneyTempC || stepParameters.decrystallizationTempC || stepParameters.tankTempC || stepParameters.temperatureC;
    if (warmingTemp !== undefined && warmingTemp !== null) {
      const evalResult = evaluateParameterCompliance('warmingTempC', warmingTemp);
      evaluatedParameters.push({
        parameter: 'Honey Process Temperature',
        value: `${warmingTemp}°C`,
        status: evalResult.status,
        authority: 'BIS IS 4941 / ICAR Guidance',
        originType: RULE_ORIGIN_TYPES.TECHNICAL_GUIDANCE
      });
      if (evalResult.status === 'NON_COMPLIANT') {
        issues.push({
          severity: 'HIGH',
          title: 'Thermal Exposure Warning',
          detail: `Process temperature ${warmingTemp}°C exceeds the 45.0°C limit. May elevate HMF and denature diastase enzymes.`,
          authority: 'BIS / ICAR',
          citation: 'ICAR-AICRP Apiculture Technical Bulletin'
        });
      }
    }

    // 3. Settling Duration Check
    const settlingHours = stepParameters.settlingDurationHours || stepParameters.settlingHours;
    if (settlingHours !== undefined && settlingHours !== null) {
      const evalResult = evaluateParameterCompliance('settlingDurationHours', settlingHours);
      evaluatedParameters.push({
        parameter: 'Clarification Settling Time',
        value: `${settlingHours} hrs`,
        status: evalResult.status,
        authority: 'KVIC Technical Operations',
        originType: RULE_ORIGIN_TYPES.TECHNICAL_GUIDANCE
      });
      if (evalResult.status === 'NON_COMPLIANT') {
        issues.push({
          severity: 'MEDIUM',
          title: 'Settling Duration Below Technical Recommendation',
          detail: `Settling duration of ${settlingHours} hrs is under the 24-hour minimum for thorough bubble/wax froth separation.`,
          authority: 'KVIC',
          citation: 'KVIC Plant Operations Handbook'
        });
      }
    }

    // 4. SOP Specific Limits
    if (sop?.parameters) {
      if (sop.parameters.maxAllowableTempC && warmingTemp > sop.parameters.maxAllowableTempC) {
        issues.push({
          severity: 'HIGH',
          title: `Exceeds Organization SOP Thermal Limit (${sop.code})`,
          detail: `Measured temp ${warmingTemp}°C exceeds SOP limit of ${sop.parameters.maxAllowableTempC}°C.`,
          authority: 'ORGANIZATION_SOP',
          originType: RULE_ORIGIN_TYPES.ORGANIZATION_CONFIGURED
        });
      }
    }

    return {
      isCompliant: issues.filter(i => i.severity === 'CRITICAL').length === 0,
      hasWarnings: issues.length > 0,
      issues,
      evaluatedParameters,
      evaluationTimestamp: new Date().toISOString()
    };
  }
};

/**
 * Convenience named exports for unit tests and direct functional imports
 */
export const evaluateTestCompliance = ({ parameter, value }) => {
  const res = RegulatoryRulesEngine.evaluateLabTestCompliance(parameter, value);
  return {
    ...res,
    varianceNotes: res.violations?.join('; ') || (res.violations?.length ? 'statutory ceiling variance' : '')
  };
};

export const validateAccreditationScope = ({ parameter, methodId, scopeMatrix }) => {
  const scopeItem = (scopeMatrix || []).find(s => s.parameter === parameter || s.testKey === parameter);
  const isAcc = Boolean(scopeItem && scopeItem.isAccredited);
  return {
    isCoveredByScope: isAcc,
    canClaimAccreditationOnCoA: isAcc,
    scopeCategory: isAcc ? 'ACCREDITED' : 'RESEARCH_ONLY'
  };
};

export const validateQualityDecisionSeparation = (args) => {
  return RegulatoryRulesEngine.validateQualityDecisionSeparation(args);
};
