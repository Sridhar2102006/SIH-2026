/**
 * HONEYCHAIN — INDIA REGULATORY STANDARDS & PARAMETER RULES LAYER
 *
 * Authoritative Indian Food Safety & Honey Quality Regulations:
 * 1. FSSAI: Food Safety and Standards (Food Products Standards and Food Additives)
 *    Regulations, 2011 (as amended 2020 for Honey & Apiculture Products, F. No. Stds/SP(Water & Beverages)/Misc/2018).
 * 2. AGMARK: Honey Grading and Marking Rules, 2008 (Ministry of Agriculture & Farmers Welfare, DMI).
 * 3. BIS: Bureau of Indian Standards IS 4941:1994 (Extracted Honey — Specification).
 * 4. EIC: Export Inspection Council of India (Residue Monitoring Plan & Quality Directives).
 *
 * Epistemological Classification:
 * - REGULATORY_REQUIREMENT: Enforceable legal mandate by national authority.
 * - TECHNICAL_GUIDANCE: Empirically verified processing best practice from ICAR/KVIC.
 * - ORGANIZATION_CONFIGURED: Processor-specific SOP tolerance.
 * - ACTUAL_PROCESS_EVENT: Measured execution record.
 * - UNKNOWN: Pending verification or unmeasured.
 */

export const RULE_AUTHORITIES = {
  FSSAI: {
    id: 'FSSAI',
    name: 'Food Safety and Standards Authority of India',
    jurisdiction: 'National Mandate (All Food Business Operators)',
    currentRegulationVersion: 'FSSAI Honey Standards (Amended 2020)',
    legalStatus: 'MANDATORY_LEGAL_COMPLIANCE'
  },
  AGMARK: {
    id: 'AGMARK',
    name: 'Directorate of Marketing and Inspection (DMI)',
    jurisdiction: 'Agricultural Grading & Certification (Agmark Seal)',
    currentRegulationVersion: 'Honey Grading and Marking Rules (2008 Revision)',
    legalStatus: 'VOLUNTARY_GRADING_MARKET_STANDARD'
  },
  BIS: {
    id: 'BIS',
    name: 'Bureau of Indian Standards',
    jurisdiction: 'National Standards Body of India',
    currentRegulationVersion: 'IS 4941:1994 (Reaffirmed 2019)',
    legalStatus: 'TECHNICAL_SPECIFICATION'
  },
  EIC: {
    id: 'EIC',
    name: 'Export Inspection Council of India',
    jurisdiction: 'Honey Consignments Destined for Export',
    currentRegulationVersion: 'EIC Honey Quality Directive 2022/Export RMP',
    legalStatus: 'EXPORT_MANDATE'
  }
};

export const RULE_ORIGIN_TYPES = {
  REGULATORY_REQUIREMENT: 'REGULATORY_REQUIREMENT',
  TECHNICAL_GUIDANCE: 'TECHNICAL_GUIDANCE',
  ORGANIZATION_CONFIGURED: 'ORGANIZATION_CONFIGURED',
  ACTUAL_PROCESS_EVENT: 'ACTUAL_PROCESS_EVENT',
  UNKNOWN: 'UNKNOWN'
};

export const REGULATORY_STANDARDS = [
  {
    id: 'FSSAI-HONEY-MOISTURE',
    authority: 'FSSAI',
    parameterKey: 'moisturePercent',
    parameterName: 'Moisture Content',
    unit: '%',
    operator: '<=',
    threshold: 20.0,
    tropicalThreshold: 20.0,
    specialExceptions: [
      { condition: 'Rubber / Carvi (Karvi) honey', threshold: 25.0, requiresSpecificDeclaration: true }
    ],
    testMethod: 'AOAC 969.38 / Refractometry at 20°C',
    effectiveFrom: '2020-07-01',
    version: '2020.1',
    originType: RULE_ORIGIN_TYPES.REGULATORY_REQUIREMENT,
    citation: 'FSSAI Gazette F. No. Stds/SP(Water & Beverages)/Misc/2018 (Cl. 2.8.2(1))',
    significance: 'Prevents natural fermentation by osmophilic yeasts (Zygosaccharomyces).'
  },
  {
    id: 'FSSAI-HONEY-HMF',
    authority: 'FSSAI',
    parameterKey: 'hmfMgPerKg',
    parameterName: 'Hydroxymethylfurfural (HMF)',
    unit: 'mg/kg',
    operator: '<=',
    threshold: 80.0, // Standard India tropical allowance
    temperateThreshold: 40.0,
    testMethod: 'HPLC / White Spectrophotometric / Winkler Method',
    effectiveFrom: '2020-07-01',
    version: '2020.1',
    originType: RULE_ORIGIN_TYPES.REGULATORY_REQUIREMENT,
    citation: 'FSSAI Cl. 2.8.2 Table 1; Indian tropical origin threshold',
    significance: 'Key freshness and heat degradation indicator; elevated by excessive overheating or old honey.'
  },
  {
    id: 'FSSAI-HONEY-DIASTASE',
    authority: 'FSSAI',
    parameterKey: 'diastaseNumber',
    parameterName: 'Diastase Activity (Amylase)',
    unit: 'Schade units (DN)',
    operator: '>=',
    threshold: 8.0,
    lowHmfException: { ifHmfBelowMg: 15.0, minDiastase: 3.0 },
    testMethod: 'Schade / Phadebas Amylase Assay',
    effectiveFrom: '2020-07-01',
    version: '2020.1',
    originType: RULE_ORIGIN_TYPES.REGULATORY_REQUIREMENT,
    citation: 'FSSAI Gazette Cl. 2.8.2; min 8 DN, or 3 DN if naturally low enzyme honey with HMF < 15',
    significance: 'Validates that honey enzyme structure has not been destroyed by industrial boiling.'
  },
  {
    id: 'FSSAI-HONEY-REDUCING-SUGARS',
    authority: 'FSSAI',
    parameterKey: 'reducingSugarsPercent',
    parameterName: 'Total Reducing Sugars (Fructose + Glucose)',
    unit: '%',
    operator: '>=',
    threshold: 65.0,
    honeydewThreshold: 60.0,
    testMethod: 'Lane and Eynon Titration / HPLC',
    effectiveFrom: '2020-07-01',
    version: '2020.1',
    originType: RULE_ORIGIN_TYPES.REGULATORY_REQUIREMENT,
    citation: 'FSSAI Table 1 (Row 2)',
    significance: 'Confirms natural nectar honey carbohydrate constitution.'
  },
  {
    id: 'FSSAI-HONEY-SUCROSE',
    authority: 'FSSAI',
    parameterKey: 'sucrosePercent',
    parameterName: 'Apparent Sucrose Content',
    unit: '%',
    operator: '<=',
    threshold: 5.0,
    exceptions: [
      { flora: 'Lavender / Neem / Borage', maxSucrose: 10.0 },
      { flora: 'Red Gum / Citrus', maxSucrose: 15.0 }
    ],
    testMethod: 'HPLC / AOAC 979.22',
    effectiveFrom: '2020-07-01',
    version: '2020.1',
    originType: RULE_ORIGIN_TYPES.REGULATORY_REQUIREMENT,
    citation: 'FSSAI Table 1 (Row 3)',
    significance: 'Protects against artificial cane/beet sugar adulteration.'
  },
  {
    id: 'FSSAI-HONEY-FG-RATIO',
    authority: 'FSSAI',
    parameterKey: 'fructoseGlucoseRatio',
    parameterName: 'Fructose to Glucose Ratio (F/G)',
    unit: 'ratio',
    operator: '>=',
    threshold: 0.95,
    testMethod: 'HPLC / Ion Chromatography',
    effectiveFrom: '2020-07-01',
    version: '2020.1',
    originType: RULE_ORIGIN_TYPES.REGULATORY_REQUIREMENT,
    citation: 'FSSAI Table 1 (Row 4)',
    significance: 'Critical indicator against glucose-syrup spiking and crystallization dynamics.'
  },
  {
    id: 'FSSAI-HONEY-INSOLUBLE-SOLIDS',
    authority: 'FSSAI',
    parameterKey: 'waterInsolubleSolidsPercent',
    parameterName: 'Water Insoluble Solids',
    unit: '%',
    operator: '<=',
    threshold: 0.1,
    pressedHoneyThreshold: 0.5,
    testMethod: 'Gravimetric Filtration Method',
    effectiveFrom: '2020-07-01',
    version: '2020.1',
    originType: RULE_ORIGIN_TYPES.REGULATORY_REQUIREMENT,
    citation: 'FSSAI Cl. 2.8.2(1)(d)',
    significance: 'Limits excessive wax residue, comb fragments, or debris in extracted honey.'
  },
  {
    id: 'AGMARK-SPECIAL-GRADE-MOISTURE',
    authority: 'AGMARK',
    parameterKey: 'moisturePercent',
    parameterName: 'Agmark Special Grade Moisture',
    unit: '%',
    operator: '<=',
    threshold: 20.0,
    grade: 'SPECIAL',
    testMethod: 'Refractometer at 20°C',
    effectiveFrom: '2008-01-01',
    version: '2008.1',
    originType: RULE_ORIGIN_TYPES.REGULATORY_REQUIREMENT,
    citation: 'Agmark Honey Rules 2008, Schedule II (Special Grade)',
    significance: 'Criteria for Agmark Special Red Seal.'
  },
  {
    id: 'AGMARK-GRADE-A-MOISTURE',
    authority: 'AGMARK',
    parameterKey: 'moisturePercent',
    parameterName: 'Agmark Grade A Moisture',
    unit: '%',
    operator: '<=',
    threshold: 22.0,
    grade: 'GRADE_A',
    testMethod: 'Refractometer at 20°C',
    effectiveFrom: '2008-01-01',
    version: '2008.1',
    originType: RULE_ORIGIN_TYPES.REGULATORY_REQUIREMENT,
    citation: 'Agmark Honey Rules 2008, Schedule II (Grade A)',
    significance: 'Criteria for Agmark Grade A Green Seal.'
  },
  {
    id: 'TECH-GUIDANCE-WARMING-TEMP',
    authority: 'BIS',
    parameterKey: 'warmingTempC',
    parameterName: 'Gentle Warming Temperature Limit',
    unit: '°C',
    operator: '<=',
    threshold: 45.0,
    testMethod: 'Calibrated Tank Thermal Sensor',
    effectiveFrom: '2024-01-01',
    version: '2024.1',
    originType: RULE_ORIGIN_TYPES.TECHNICAL_GUIDANCE,
    citation: 'ICAR-AICRP Apiculture & KVIC Technical Processing Manual',
    significance: 'Heating above 45°C denatures invertase and diastase enzymes and spikes HMF.'
  },
  {
    id: 'TECH-GUIDANCE-SETTLING-TIME',
    authority: 'BIS',
    parameterKey: 'settlingDurationHours',
    parameterName: 'Minimum Clarification Settling Duration',
    unit: 'hrs',
    operator: '>=',
    threshold: 24.0,
    targetValue: 48.0,
    testMethod: 'Digital Tank Log',
    effectiveFrom: '2024-01-01',
    version: '2024.1',
    originType: RULE_ORIGIN_TYPES.TECHNICAL_GUIDANCE,
    citation: 'KVIC Honey Processing Plant Operations Handbook',
    significance: 'Allows micro-bubbles and wax froth to rise to the top surface for clean skimming.'
  }
];

/**
 * Validates a measurement against applicable standards
 */
export function evaluateParameterCompliance(parameterKey, measuredValue, context = {}) {
  const ALIAS_MAP = {
    'MOISTURE': 'moisturePercent',
    'moisture': 'moisturePercent',
    'moisturePercent': 'moisturePercent',
    'initialMoisturePercent': 'moisturePercent',
    'postMoisturePercent': 'moisturePercent',
    'finalMoisturePercent': 'moisturePercent',
    'refractometerMoisture': 'moisturePercent',
    'HMF': 'hmfMgPerKg',
    'hmf': 'hmfMgPerKg',
    'hmfMgPerKg': 'hmfMgPerKg',
    'DIASTASE': 'diastaseNumber',
    'DIASTASE_ACTIVITY': 'diastaseNumber',
    'diastase': 'diastaseNumber',
    'diastaseNumber': 'diastaseNumber',
    'REDUCING_SUGARS': 'reducingSugarsPercent',
    'SUCROSE': 'sucrosePercent',
    'warmingTempC': 'warmingTempC',
    'targetHoneyTempC': 'warmingTempC',
    'honeyCoreTempC': 'warmingTempC',
    'tankTempC': 'warmingTempC',
    'honeyTempC': 'warmingTempC',
    'warmWaterBathTempC': 'warmingTempC',
    'liquefactionTempC': 'warmingTempC'
  };
  const canonicalKey = ALIAS_MAP[parameterKey] || parameterKey;

  let matchingRules = REGULATORY_STANDARDS.filter(r => r.parameterKey === canonicalKey);

  if (context.authority) {
    matchingRules = matchingRules.filter(r => r.authority === context.authority);
  }

  if (context.grade) {
    matchingRules = matchingRules.filter(r => !r.grade || r.grade === context.grade);
  }

  if (!matchingRules || matchingRules.length === 0) {
    return {
      isCompliant: true,
      status: 'NOT_EVALUATED',
      origin: RULE_ORIGIN_TYPES.UNKNOWN,
      rulesChecked: 0,
      violations: []
    };
  }

  const val = Number(measuredValue);
  if (isNaN(val)) {
    return {
      isCompliant: false,
      status: 'INVALID_VALUE',
      origin: RULE_ORIGIN_TYPES.UNKNOWN,
      error: 'Measured value is not a valid number.'
    };
  }

  const violations = [];
  matchingRules.forEach(rule => {
    let limit = rule.threshold;
    if (rule.operator === '<=' && val > limit) {
      violations.push({
        ruleId: rule.id,
        authority: rule.authority,
        ruleName: rule.parameterName,
        expected: `${rule.operator} ${limit} ${rule.unit}`,
        actual: `${val} ${rule.unit}`,
        citation: rule.citation,
        originType: rule.originType
      });
    } else if (rule.operator === '>=' && val < limit) {
      violations.push({
        ruleId: rule.id,
        authority: rule.authority,
        ruleName: rule.parameterName,
        expected: `${rule.operator} ${limit} ${rule.unit}`,
        actual: `${val} ${rule.unit}`,
        citation: rule.citation,
        originType: rule.originType
      });
    }
  });

  const isCompliant = violations.length === 0;

  return {
    isCompliant,
    status: isCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
    message: isCompliant
      ? 'Complies with Indian standards'
      : violations.map(v => `${v.ruleName} measured ${v.actual} exceeds maximum threshold (${v.expected}) per ${v.authority}`).join('; '),
    rulesChecked: matchingRules.length,
    violations,
    authoritativeRules: matchingRules
  };
}
