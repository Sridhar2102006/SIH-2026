/**
 * HONEYCHAIN — REGULATORY RULES ENGINE
 *
 * Centralized, versioned validation engine evaluating honey processing parameters
 * against national standards (FSSAI, Agmark, BIS, EIC).
 *
 * Maintains strict epistemological separation:
 * - REGULATORY_REQUIREMENT
 * - TECHNICAL_GUIDANCE
 * - ORGANIZATION_CONFIGURED
 * - ACTUAL_PROCESS_EVENT
 */

import {
  REGULATORY_STANDARDS,
  RULE_AUTHORITIES,
  RULE_ORIGIN_TYPES,
  evaluateParameterCompliance
} from '../data/processor/regulatoryStandards.js';

export const RegulatoryRulesEngine = {
  /**
   * Get all active regulatory rules
   */
  getRules(authority = null) {
    if (!authority) return REGULATORY_STANDARDS;
    return REGULATORY_STANDARDS.filter(r => r.authority === authority);
  },

  /**
   * Evaluates a single measurement against all applicable standards
   */
  evaluateMeasurement(parameterKey, value, context = {}) {
    return evaluateParameterCompliance(parameterKey, value, context);
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
