/**
 * HoneyChain Enterprise Designation Eligibility Engine
 *
 * Deterministic multi-tier capability evaluation:
 * - REQUIRED capabilities (mandatory prerequisite: 100% required)
 * - CORE capabilities (strong match qualification threshold)
 * - SUPPORTING capabilities (affinity & confidence boosters)
 * - Anti-over-matching rules (single generic skill never sufficient)
 * - Explainable recommendation reasons
 */

import {
  CAPABILITY_MAP,
  normalizeCapabilityList,
  RISK_LEVELS
} from './capabilityTaxonomy.js';
import { CAPABILITY_MAP as CANONICAL_CAPABILITY_MAP } from './capabilityRegistry.js';
import { migrateLegacyCapabilities } from './capabilityMigration.js';

export const CANONICAL_DESIGNATION_POLICY = [
  { id: 'BEEKEEPER', name: 'Beekeeper', requiredCapabilities: [], coreCapabilities: ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION'], supportingCapabilities: ['BEE_OBSERVATION', 'CONNECTED_HIVE_MONITORING'], minCoreCount: 2 },
  { id: 'PROCESSOR', name: 'Processor', requiredCapabilities: ['PROCESSING_MANAGEMENT'], coreCapabilities: ['BATCH_INTAKE', 'PROCESSING_STEP_RECORD', 'PROCESSING_COMPLETION'], supportingCapabilities: ['PROCESSING_EVIDENCE', 'PACKAGING_HANDOFF'], minCoreCount: 1 },
  { id: 'LAB_SPECIALIST', name: 'Lab Specialist', requiredCapabilities: ['LAB_WORKSPACE'], coreCapabilities: ['SAMPLE_INTAKE', 'TEST_EXECUTION', 'RESULT_REVIEW'], supportingCapabilities: ['TEST_RESULT_ENTRY', 'CERTIFICATE_GENERATION'], minCoreCount: 1 },
  { id: 'DISTRIBUTOR', name: 'Distributor', requiredCapabilities: ['DISPATCH_PLANNING'], coreCapabilities: ['PACKAGE_QR_VALIDATE', 'DELIVERY_TRACKING', 'SHIPMENT_CREATE'], supportingCapabilities: ['ROUTE_PLANNING', 'DELIVERY_CONFIRMATION'], minCoreCount: 1 },
  { id: 'INSPECTOR', name: 'Field Inspector', requiredCapabilities: [], coreCapabilities: ['HIVE_INSPECTION', 'TRACEABILITY_VERIFICATION', 'RECORD_AUDITING'], supportingCapabilities: ['BATCH_TRACEABILITY', 'BEE_OBSERVATION'], minCoreCount: 2 },
  { id: 'FACILITY_MANAGER', name: 'Facility Manager', requiredCapabilities: ['TEAM_SUPERVISION'], coreCapabilities: ['RECORD_AUDITING', 'PROCESSING_MANAGEMENT'], supportingCapabilities: ['BATCH_TRACEABILITY', 'INVENTORY_MANAGEMENT'], minCoreCount: 1 }
];

export const evaluateCanonicalDesignationEligibility = (capabilityIds = []) => {
  const selected = new Set(capabilityIds.filter(id => CANONICAL_CAPABILITY_MAP.has(id)));
  const evaluations = CANONICAL_DESIGNATION_POLICY.map(designation => {
    const matchedRequired = designation.requiredCapabilities.filter(id => selected.has(id));
    const matchedCore = designation.coreCapabilities.filter(id => selected.has(id));
    const matchedSupporting = designation.supportingCapabilities.filter(id => selected.has(id));
    const missingCapabilities = designation.requiredCapabilities.filter(id => !selected.has(id));
    const verificationRequirements = [...matchedRequired, ...matchedCore, ...matchedSupporting]
      .filter(id => CANONICAL_CAPABILITY_MAP.get(id)?.verificationRequired);
    const requiredSatisfied = missingCapabilities.length === 0;
    const enoughCore = matchedCore.length >= designation.minCoreCount;
    const hasSubstantiveWork = matchedRequired.length > 0 || matchedCore.length > 0;
    const hasRelevantWork = hasSubstantiveWork && (matchedRequired.length + matchedCore.length + matchedSupporting.length > 0);
    const eligibilityState = !hasRelevantWork ? ELIGIBILITY_STATES.NOT_ELIGIBLE
      : verificationRequirements.length > 0 && requiredSatisfied && enoughCore ? ELIGIBILITY_STATES.REQUIRES_VERIFICATION
        : requiredSatisfied && enoughCore ? ELIGIBILITY_STATES.STRONG_MATCH
          : requiredSatisfied ? ELIGIBILITY_STATES.POSSIBLE_MATCH
            : ELIGIBILITY_STATES.NOT_ELIGIBLE;
    const matchedCapabilities = [...matchedRequired, ...matchedCore, ...matchedSupporting];
    return {
      designationId: designation.id,
      name: designation.name,
      requiredCapabilities: designation.requiredCapabilities,
      coreCapabilities: designation.coreCapabilities,
      supportingCapabilities: designation.supportingCapabilities,
      matchedRequired,
      matchedCore,
      matchedSupporting,
      verificationRequirements,
      eligibilityState,
      missingCapabilities,
      matchedCapabilities,
      explanations: matchedCapabilities.map(id => `You described work that includes ${CANONICAL_CAPABILITY_MAP.get(id)?.name || id.toLowerCase()}.`)
    };
  });

  return {
    evaluations,
    suggestions: evaluations.filter(result => result.eligibilityState !== ELIGIBILITY_STATES.NOT_ELIGIBLE),
    strongSuggestions: evaluations.filter(result => result.eligibilityState === ELIGIBILITY_STATES.STRONG_MATCH || result.eligibilityState === ELIGIBILITY_STATES.REQUIRES_VERIFICATION),
    evaluationsMap: Object.fromEntries(evaluations.map(e => [e.designationId, e])),
    policyVersion: 12
  };
};

export const ELIGIBILITY_STATES = {
  NOT_ELIGIBLE: 'NOT_ELIGIBLE',
  POSSIBLE_MATCH: 'POSSIBLE_MATCH',
  STRONG_MATCH: 'STRONG_MATCH',
  CONFIRMED: 'CONFIRMED',
  REQUIRES_VERIFICATION: 'REQUIRES_VERIFICATION'
};

export const DESIGNATION_TAXONOMY = [
  {
    id: 'BEEKEEPER',
    name: 'Beekeeper',
    badge: 'Field Apiary',
    icon: '🐝',
    tagline: 'Colony stewardship & field management',
    taskDescriptions: [
      'Hive monitoring & brood health inspections',
      'Seasonal honey supers collection',
      'Field observations and acoustic telemetry'
    ],
    requiredCapabilities: ['HIVE_MONITORING'],
    coreCapabilities: ['HIVE_INSPECTION', 'HIVE_IMAGE_CAPTURE', 'HONEY_COLLECTION'],
    supportingCapabilities: ['SENSOR_MONITORING'],
    optionalCapabilities: ['BATCH_MANAGEMENT'],
    conflictingCapabilities: [],
    minCoreCount: 1,
    defaultSelected: true
  },
  {
    id: 'PROCESSOR',
    name: 'Processor',
    badge: 'Facility Production',
    icon: '🍯',
    tagline: 'Cold extraction, filtration & batching',
    taskDescriptions: [
      'Centrifugal extraction & settling tank logs',
      'Batch creation & lot code assignment',
      'Packaging & initial moisture checks'
    ],
    requiredCapabilities: ['HONEY_PROCESSING'],
    coreCapabilities: ['BATCH_MANAGEMENT', 'PACKAGE_HONEY', 'QUALITY_TESTING'],
    supportingCapabilities: ['HONEY_COLLECTION', 'INVENTORY_MANAGEMENT'],
    optionalCapabilities: [],
    conflictingCapabilities: [],
    minCoreCount: 1,
    defaultSelected: false
  },
  {
    id: 'LAB_SPECIALIST',
    name: 'Lab / Quality',
    badge: 'Analytical Assurance',
    icon: '🔬',
    tagline: 'Purity verification & scientific analysis',
    taskDescriptions: [
      'Refractometry, HMF and enzyme analysis',
      'Certified lab report generation',
      'Tamper seal and provenance validation'
    ],
    requiredCapabilities: ['QUALITY_TESTING'],
    coreCapabilities: ['LAB_INSPECTION', 'TRACEABILITY_VERIFICATION'],
    supportingCapabilities: ['RECORD_AUDITING'],
    optionalCapabilities: [],
    conflictingCapabilities: [],
    minCoreCount: 1,
    defaultSelected: false
  },
  {
    id: 'DISTRIBUTOR',
    name: 'Distributor',
    badge: 'Logistics & Supply',
    icon: '📦',
    tagline: 'Storage, inventory & supply chain dispatch',
    taskDescriptions: [
      'Stock control & lot consignment tracking',
      'Shipment dispatch and transport logging',
      'Retailer handover verification'
    ],
    requiredCapabilities: ['SHIPMENT_DISPATCH'],
    coreCapabilities: ['INVENTORY_MANAGEMENT', 'TRACEABILITY_VERIFICATION'],
    supportingCapabilities: ['PACKAGE_HONEY', 'BATCH_MANAGEMENT'],
    optionalCapabilities: [],
    conflictingCapabilities: [],
    minCoreCount: 1,
    defaultSelected: false
  },
  {
    id: 'INSPECTOR',
    name: 'Field Inspector',
    badge: 'Audit & Compliance',
    icon: '📋',
    tagline: 'Regulatory audits & colony bio-security',
    taskDescriptions: [
      'Independent health inspection audits',
      'Disease & Varroa compliance checks',
      'Ledger audit trail review'
    ],
    requiredCapabilities: ['HIVE_INSPECTION'],
    coreCapabilities: ['RECORD_AUDITING', 'TRACEABILITY_VERIFICATION', 'HIVE_IMAGE_CAPTURE'],
    supportingCapabilities: ['HIVE_MONITORING', 'QUALITY_TESTING'],
    optionalCapabilities: [],
    conflictingCapabilities: [],
    minCoreCount: 1,
    defaultSelected: false
  },
  {
    id: 'FACILITY_MANAGER',
    name: 'Operations Lead',
    badge: 'Oversight & Admin',
    icon: '🧭',
    tagline: 'Operational coordination & workflow supervision',
    taskDescriptions: [
      'Cross-functional team coordination',
      'Comprehensive record auditing',
      'Facility throughput monitoring'
    ],
    requiredCapabilities: ['TEAM_SUPERVISION'],
    coreCapabilities: ['RECORD_AUDITING', 'BATCH_MANAGEMENT'],
    supportingCapabilities: ['HIVE_MONITORING', 'HONEY_PROCESSING', 'INVENTORY_MANAGEMENT'],
    optionalCapabilities: [],
    conflictingCapabilities: [],
    minCoreCount: 1,
    defaultSelected: false
  }
];

export const DESIGNATION_MAP = new Map(DESIGNATION_TAXONOMY.map(d => [d.id, d]));

/**
 * Evaluates a single designation against declared normalized capabilities.
 *
 * @param {Object} designation - Designation taxonomy object
 * @param {Set<string>} selectedCapsSet - Set of selected capability IDs
 * @returns {Object} Evaluation details and eligibility state
 */
export const evaluateSingleDesignation = (designation, selectedCapsSet) => {
  const satisfiedRequired = designation.requiredCapabilities.filter(id => selectedCapsSet.has(id));
  const missingRequired = designation.requiredCapabilities.filter(id => !selectedCapsSet.has(id));

  const satisfiedCore = designation.coreCapabilities.filter(id => selectedCapsSet.has(id));
  const satisfiedSupporting = designation.supportingCapabilities.filter(id => selectedCapsSet.has(id));

  const hasAllRequired = missingRequired.length === 0;
  const coreCoverage = designation.coreCapabilities.length > 0
    ? satisfiedCore.length / designation.coreCapabilities.length
    : 1;

  // Check for verification requirements on satisfied capabilities
  const requiresVerification = Array.from(selectedCapsSet).some(id => {
    const canonicalCap = CANONICAL_CAPABILITY_MAP?.get(id);
    if (canonicalCap && (canonicalCap.verificationRequired || canonicalCap.riskLevel === 'HIGH' || canonicalCap.riskLevel === 'CRITICAL')) {
      return true;
    }
    const cap = CAPABILITY_MAP.get(id);
    return cap && (cap.verificationRequired || cap.riskLevel === RISK_LEVELS.HIGH || cap.riskLevel === RISK_LEVELS.CRITICAL);
  });

  // Determine eligibility state
  let state = ELIGIBILITY_STATES.NOT_ELIGIBLE;
  let explanation = '';

  if (hasAllRequired && satisfiedCore.length >= designation.minCoreCount) {
    state = requiresVerification
      ? ELIGIBILITY_STATES.REQUIRES_VERIFICATION
      : ELIGIBILITY_STATES.STRONG_MATCH;

    const getCapName = (id) => CANONICAL_CAPABILITY_MAP.get(id)?.name || CAPABILITY_MAP.get(id)?.name || id;
    const matchedNames = [...satisfiedRequired, ...satisfiedCore].map(getCapName);
    explanation = `Strong match because you handle required ${getCapName(designation.requiredCapabilities[0]) || 'task'} and core tasks (${matchedNames.slice(0, 3).join(', ')}).`;
  } else if (hasAllRequired && satisfiedCore.length < designation.minCoreCount) {
    const getCapName = (id) => CANONICAL_CAPABILITY_MAP.get(id)?.name || CAPABILITY_MAP.get(id)?.name || id;
    state = ELIGIBILITY_STATES.POSSIBLE_MATCH;
    explanation = `Possible match: You have ${getCapName(satisfiedRequired[0]) || 'required task'}, but selecting at least ${designation.minCoreCount} core task (e.g. ${designation.coreCapabilities.map(getCapName).join(' or ')}) strengthens this designation.`;
  } else if (!hasAllRequired && (satisfiedCore.length > 0 || satisfiedSupporting.length > 0)) {
    state = ELIGIBILITY_STATES.NOT_ELIGIBLE;
    const getCapName = (id) => CANONICAL_CAPABILITY_MAP.get(id)?.name || CAPABILITY_MAP.get(id)?.name || id;
    const missingNames = missingRequired.map(getCapName).join(', ');
    explanation = `Not eligible: Requires mandatory capability: ${missingNames}.`;
  } else {
    state = ELIGIBILITY_STATES.NOT_ELIGIBLE;
    explanation = `No overlapping tasks for ${designation.name}.`;
  }

  // Calculate internal fit score [0-100] for UI sorting (not exposed as factual score)
  let fitScore = 0;
  if (hasAllRequired) fitScore += 50;
  fitScore += (coreCoverage * 35);
  fitScore += Math.min(15, satisfiedSupporting.length * 7.5);

  return {
    designationId: designation.id,
    name: designation.name,
    badge: designation.badge,
    icon: designation.icon,
    tagline: designation.tagline,
    state,
    isEligible: state === ELIGIBILITY_STATES.STRONG_MATCH || state === ELIGIBILITY_STATES.REQUIRES_VERIFICATION || state === ELIGIBILITY_STATES.POSSIBLE_MATCH,
    isStrongMatch: state === ELIGIBILITY_STATES.STRONG_MATCH || state === ELIGIBILITY_STATES.REQUIRES_VERIFICATION,
    satisfiedRequired,
    missingRequired,
    satisfiedCore,
    satisfiedSupporting,
    allMatchedCapabilities: [...satisfiedRequired, ...satisfiedCore, ...satisfiedSupporting],
    fitScore: Math.round(fitScore),
    explanation
  };
};

/**
 * Multi-Designation Eligibility Evaluator.
 * Evaluates all designations independently and calculates dynamic insights.
 *
 * @param {Array<string>} rawCapabilities - Array of raw or normalized capability IDs
 * @returns {Object} Comprehensive evaluation result
 */
export const evaluateDesignationEligibility = (rawCapabilities = []) => {
  const normalizedCapabilities = normalizeCapabilityList(rawCapabilities);
  const migrated = migrateLegacyCapabilities(normalizedCapabilities);
  const selectedCapsSet = new Set([...normalizedCapabilities, ...migrated.capabilities]);

  // Comprehensive bidirectional bridge between canonical and legacy capabilities
  const capabilityBridges = [
    // Hives
    ['HIVE_MONITORING', 'HIVE_MANAGEMENT'],
    ['SENSOR_MONITORING', 'CONNECTED_HIVE_MONITORING'],
    // Production / Processing
    ['HONEY_PROCESSING', 'PROCESSING_MANAGEMENT'],
    ['BATCH_MANAGEMENT', 'BATCH_INTAKE'],
    ['BATCH_MANAGEMENT', 'PROCESSING_STEP_RECORD'],
    ['BATCH_MANAGEMENT', 'PROCESSING_COMPLETION'],
    ['PACKAGE_HONEY', 'PACKAGING_HANDOFF'],
    // Quality / Lab
    ['QUALITY_TESTING', 'LAB_WORKSPACE'],
    ['QUALITY_TESTING', 'TEST_EXECUTION'],
    ['LAB_INSPECTION', 'SAMPLE_INTAKE'],
    ['TRACEABILITY_VERIFICATION', 'RESULT_REVIEW'],
    // Distribution
    ['SHIPMENT_DISPATCH', 'DISPATCH_PLANNING'],
    ['SHIPMENT_DISPATCH', 'SHIPMENT_CREATE'],
    ['INVENTORY_MANAGEMENT', 'DELIVERY_TRACKING'],
    ['TRACEABILITY_VERIFICATION', 'PACKAGE_QR_VALIDATE']
  ];
  capabilityBridges.forEach(([legacy, canonical]) => {
    if (selectedCapsSet.has(canonical)) selectedCapsSet.add(legacy);
    if (selectedCapsSet.has(legacy)) selectedCapsSet.add(canonical);
  });

  // 1. Evaluate each designation
  const evaluations = DESIGNATION_TAXONOMY.map(desig =>
    evaluateSingleDesignation(desig, selectedCapsSet)
  );

  // 2. Sort suggestions by internal fitScore
  const sortedEvaluations = [...evaluations].sort((a, b) => b.fitScore - a.fitScore);

  const strongMatches = sortedEvaluations.filter(e => e.isStrongMatch);
  const possibleMatches = sortedEvaluations.filter(e => e.state === ELIGIBILITY_STATES.POSSIBLE_MATCH);
  const eligibleDesignations = sortedEvaluations.filter(e => e.isEligible);
  const suggestedDesignationIds = (strongMatches.length > 0 ? strongMatches : eligibleDesignations).map(e => e.designationId);

  // 3. Dynamic Human-Centered Context Message
  let contextMessage = 'Select the tasks you do to see your personalized workspace.';

  if (normalizedCapabilities.length > 0) {
    const categories = new Set(normalizedCapabilities.map(id => CANONICAL_CAPABILITY_MAP.get(id)?.category || CAPABILITY_MAP.get(id)?.category).filter(Boolean));
    const hasHives = categories.has('YOUR HIVES');
    const hasHoney = categories.has('YOUR HONEY');
    const hasQuality = categories.has('QUALITY');
    const hasOps = categories.has('OPERATIONS');
    const hasMgmt = categories.has('MANAGEMENT');

    if (hasHives && hasHoney && hasQuality && hasOps) {
      contextMessage = 'You oversee the complete journey from colony care to packaged distribution.';
    } else if (hasHives && hasHoney && hasQuality) {
      contextMessage = 'You operate seamlessly across field apiaries, extraction and purity testing.';
    } else if (hasHives && hasHoney) {
      contextMessage = 'You work across hive operations and honey processing.';
    } else if (hasHoney && hasQuality && hasOps) {
      contextMessage = 'You manage honey processing, certified quality standards and order distribution.';
    } else if (hasHoney && hasQuality) {
      contextMessage = 'You focus on honey batches, extraction standards and purity verification.';
    } else if (hasQuality && hasOps) {
      contextMessage = 'You span laboratory quality assurance and supply chain distribution.';
    } else if (hasHives && hasQuality) {
      contextMessage = 'You combine hands-on colony stewardship with rigorous quality analysis.';
    } else if (hasHives && !hasHoney && !hasQuality && !hasOps) {
      contextMessage = 'That looks like field-based hive work.';
    } else if (hasHoney && !hasHives && !hasQuality && !hasOps) {
      contextMessage = 'Focused on honey harvesting, extraction, and batch handling.';
    } else if (hasQuality && !hasHives && !hasHoney && !hasOps) {
      contextMessage = 'Specialized in honey purity analysis and certified laboratory testing.';
    } else if (hasOps && !hasHives && !hasHoney && !hasQuality) {
      contextMessage = 'Concentrated on stock inventory, packaging, and logistics dispatch.';
    } else if (hasMgmt) {
      contextMessage = 'Includes team leadership, compliance audits, and operations oversight.';
    } else {
      contextMessage = 'Your setup reflects a specialized, multidisciplinary workflow.';
    }
  }

  // 4. Conflict Analysis
  const detectedConflicts = [];
  normalizedCapabilities.forEach(capId => {
    const cap = CAPABILITY_MAP.get(capId);
    if (cap && cap.conflictingCapabilities) {
      cap.conflictingCapabilities.forEach(confId => {
        if (selectedCapsSet.has(confId)) {
          detectedConflicts.push({
            capabilityA: capId,
            capabilityB: confId,
            message: `Capability "${cap.name}" has special regulatory considerations when combined with "${CAPABILITY_MAP.get(confId)?.name}".`
          });
        }
      });
    }
  });

  const evaluationsMap = Object.fromEntries(evaluations.map(e => [e.designationId, e]));

  return {
    normalizedCapabilities,
    evaluations: evaluationsMap,
    evaluationsMap,
    evaluationsList: sortedEvaluations,
    eligibleDesignations,
    strongMatches,
    possibleMatches,
    suggestedDesignationIds,
    contextMessage,
    detectedConflicts,
    evaluatedAt: new Date().toISOString()
  };
};
