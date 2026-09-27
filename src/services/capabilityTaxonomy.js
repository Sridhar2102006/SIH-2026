/**
 * HoneyChain Enterprise Capability Taxonomy & Normalization Engine
 *
 * Centralized registry of normalized capabilities with structured metadata,
 * natural language aliases, classification weights, prerequisite/conflict rules,
 * and security risk levels.
 */

import { CAPABILITY_MAP as CANONICAL_CAPABILITY_MAP } from './capabilityRegistry.js';

export const CAPABILITY_CATEGORIES = {
  HIVES: 'YOUR HIVES',
  HONEY: 'YOUR HONEY',
  QUALITY: 'QUALITY',
  OPERATIONS: 'OPERATIONS',
  MANAGEMENT: 'MANAGEMENT'
};

export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export const CAPABILITY_TAXONOMY = [
  // -------------------------------------------------------------
  // Category: YOUR HIVES
  // -------------------------------------------------------------
  {
    id: 'HIVE_MONITORING',
    name: 'Monitor hive conditions',
    category: CAPABILITY_CATEGORIES.HIVES,
    description: 'Track colony weight, internal temperature, acoustics & flight activity',
    icon: 'Activity',
    aliases: [
      'check hives',
      'check hive',
      'check hive condition',
      'inspect hive condition',
      'monitor bees',
      'colony check',
      'hive telemetry',
      'bee monitoring',
      'hive observation',
      'monitor hive status'
    ],
    requiredForDesignations: ['BEEKEEPER'],
    coreForDesignations: ['INSPECTOR'],
    supportingForDesignations: ['FACILITY_MANAGER'],
    relatedCapabilities: ['HIVE_INSPECTION', 'SENSOR_MONITORING'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: [],
    applicableModules: ['hive_view', 'sensor_monitoring'],
    evidenceRequirements: ['Active apiary assignment or telemetry feed access'],
    riskLevel: RISK_LEVELS.LOW,
    verificationRequired: false,
    active: true
  },
  {
    id: 'HIVE_INSPECTION',
    name: 'Inspect hives',
    category: CAPABILITY_CATEGORIES.HIVES,
    description: 'Perform hands-on brood inspections, queen checks & colony health logs',
    icon: 'Search',
    aliases: [
      'inspect hives',
      'inspect hive',
      'hive inspection',
      'hive inspections',
      'check brood',
      'queen inspection',
      'varroa check',
      'frame inspection',
      'colony inspection',
      'apiary check'
    ],
    requiredForDesignations: ['INSPECTOR'],
    coreForDesignations: ['BEEKEEPER'],
    supportingForDesignations: ['FACILITY_MANAGER'],
    relatedCapabilities: ['HIVE_MONITORING', 'HIVE_IMAGE_CAPTURE'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: ['HIVE_MONITORING'],
    applicableModules: ['hive_view', 'hive_inspection'],
    evidenceRequirements: ['Certified apiarist training or field experience'],
    riskLevel: RISK_LEVELS.MEDIUM,
    verificationRequired: false,
    active: true
  },
  {
    id: 'HIVE_IMAGE_CAPTURE',
    name: 'Capture hive observations',
    category: CAPABILITY_CATEGORIES.HIVES,
    description: 'Log photographic comb observations & frame diagnostic shots',
    icon: 'Camera',
    aliases: [
      'comb photos',
      'hive photos',
      'capture comb',
      'take hive photos',
      'frame pictures',
      'visual observation',
      'comb diagnostic'
    ],
    requiredForDesignations: [],
    coreForDesignations: ['BEEKEEPER', 'INSPECTOR'],
    supportingForDesignations: ['FACILITY_MANAGER'],
    relatedCapabilities: ['HIVE_INSPECTION'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: [],
    applicableModules: ['hive_view', 'hive_images'],
    evidenceRequirements: [],
    riskLevel: RISK_LEVELS.LOW,
    verificationRequired: false,
    active: true
  },
  {
    id: 'SENSOR_MONITORING',
    name: 'Sensor scale & telemetry monitoring',
    category: CAPABILITY_CATEGORIES.HIVES,
    description: 'Inspect live ESP32 scale bars, ambient humidity and mesh gateways',
    icon: 'Cpu',
    aliases: [
      'esp32 monitoring',
      'scale bar telemetry',
      'hive telemetry',
      'mesh gateway',
      'acoustic monitoring',
      'sensor data',
      'iot scale'
    ],
    requiredForDesignations: [],
    coreForDesignations: [],
    supportingForDesignations: ['BEEKEEPER', 'FACILITY_MANAGER'],
    relatedCapabilities: ['HIVE_MONITORING'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: ['HIVE_MONITORING'],
    applicableModules: ['sensor_monitoring'],
    evidenceRequirements: [],
    riskLevel: RISK_LEVELS.LOW,
    verificationRequired: false,
    active: true
  },

  // -------------------------------------------------------------
  // Category: YOUR HONEY
  // -------------------------------------------------------------
  {
    id: 'HONEY_COLLECTION',
    name: 'Collect honey',
    category: CAPABILITY_CATEGORIES.HONEY,
    description: 'Pull supers, uncap ripe frames & record seasonal harvest yields',
    icon: 'Layers',
    aliases: [
      'pull supers',
      'harvest honey',
      'honey collection',
      'super harvesting',
      'gather comb',
      'honey harvest',
      'uncap frames'
    ],
    requiredForDesignations: [],
    coreForDesignations: ['BEEKEEPER'],
    supportingForDesignations: ['PROCESSOR'],
    relatedCapabilities: ['HONEY_PROCESSING', 'BATCH_MANAGEMENT'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: ['HIVE_MONITORING'],
    applicableModules: ['honey_batches', 'honey_collection'],
    evidenceRequirements: ['Harvest field equipment access'],
    riskLevel: RISK_LEVELS.LOW,
    verificationRequired: false,
    active: true
  },
  {
    id: 'HONEY_PROCESSING',
    name: 'Process & clarify honey',
    category: CAPABILITY_CATEGORIES.HONEY,
    description: 'Manage unheated cold-extraction, coarse filtration & settling tanks',
    icon: 'Filter',
    aliases: [
      'cold extraction',
      'extract honey',
      'honey processing',
      'settling tank',
      'filtering honey',
      'clarify honey',
      'honey filtration',
      'honey extraction'
    ],
    requiredForDesignations: ['PROCESSOR'],
    coreForDesignations: [],
    supportingForDesignations: ['BEEKEEPER', 'FACILITY_MANAGER'],
    relatedCapabilities: ['BATCH_MANAGEMENT', 'QUALITY_TESTING'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: [],
    applicableModules: ['honey_batches', 'processing_records'],
    evidenceRequirements: ['Food safety certified processing handler'],
    riskLevel: RISK_LEVELS.MEDIUM,
    verificationRequired: false,
    active: true
  },
  {
    id: 'BATCH_MANAGEMENT',
    name: 'Create & manage batches',
    category: CAPABILITY_CATEGORIES.HONEY,
    description: 'Register harvest batches, assign lot codes & initiate provenance records',
    icon: 'PlusCircle',
    aliases: [
      'create batches',
      'batch creation',
      'lot management',
      'lot code',
      'register batch',
      'batch tracking',
      'manage batches'
    ],
    requiredForDesignations: [],
    coreForDesignations: ['PROCESSOR'],
    supportingForDesignations: ['BEEKEEPER', 'DISTRIBUTOR'],
    relatedCapabilities: ['HONEY_PROCESSING', 'TRACEABILITY_VERIFICATION'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: [],
    applicableModules: ['honey_batches'],
    evidenceRequirements: [],
    riskLevel: RISK_LEVELS.LOW,
    verificationRequired: false,
    active: true
  },

  // -------------------------------------------------------------
  // Category: QUALITY
  // -------------------------------------------------------------
  {
    id: 'QUALITY_TESTING',
    name: 'Perform quality checks',
    category: CAPABILITY_CATEGORIES.QUALITY,
    description: 'Conduct field refractometer moisture readings and sensory assessments',
    icon: 'CheckCircle2',
    aliases: [
      'quality checks',
      'moisture test',
      'refractometer',
      'test quality',
      'sugar test',
      'quality inspection',
      'purity check'
    ],
    requiredForDesignations: ['LAB_SPECIALIST'],
    coreForDesignations: ['PROCESSOR'],
    supportingForDesignations: ['INSPECTOR'],
    relatedCapabilities: ['LAB_INSPECTION'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: [],
    applicableModules: ['quality_checks', 'honey_batches'],
    evidenceRequirements: ['Calibrated digital refractometer reading log'],
    riskLevel: RISK_LEVELS.MEDIUM,
    verificationRequired: false,
    active: true
  },
  {
    id: 'LAB_INSPECTION',
    name: 'Laboratory testing & analysis',
    category: CAPABILITY_CATEGORIES.QUALITY,
    description: 'Analyze HMF levels, diastase enzyme activity & pollen botanical spectrum',
    icon: 'FlaskConical',
    aliases: [
      'laboratory testing',
      'lab testing',
      'hmf analysis',
      'diastase enzyme',
      'pollen analysis',
      'certified lab',
      'spectrometry',
      'chemical analysis'
    ],
    requiredForDesignations: [],
    coreForDesignations: ['LAB_SPECIALIST'],
    supportingForDesignations: ['INSPECTOR'],
    relatedCapabilities: ['QUALITY_TESTING', 'TRACEABILITY_VERIFICATION'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: ['QUALITY_TESTING'],
    applicableModules: ['quality_checks', 'lab_records'],
    evidenceRequirements: ['Accredited laboratory analyst certification'],
    riskLevel: RISK_LEVELS.HIGH,
    verificationRequired: true,
    active: true
  },
  {
    id: 'TRACEABILITY_VERIFICATION',
    name: 'Traceability verification',
    category: CAPABILITY_CATEGORIES.QUALITY,
    description: 'Validate cryptographic proofs, tamper seals and origin journey milestones',
    icon: 'ShieldCheck',
    aliases: [
      'verify traceability',
      'traceability verification',
      'verify journey',
      'tamper seal verification',
      'blockchain proof',
      'notarization check',
      'audit chain of custody'
    ],
    requiredForDesignations: [],
    coreForDesignations: ['LAB_SPECIALIST', 'DISTRIBUTOR', 'INSPECTOR'],
    supportingForDesignations: ['PROCESSOR', 'BEEKEEPER'],
    relatedCapabilities: ['RECORD_AUDITING'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: [],
    applicableModules: ['traceability_journeys', 'record_auditing'],
    evidenceRequirements: [],
    riskLevel: RISK_LEVELS.LOW,
    verificationRequired: false,
    active: true
  },

  // -------------------------------------------------------------
  // Category: OPERATIONS
  // -------------------------------------------------------------
  {
    id: 'INVENTORY_MANAGEMENT',
    name: 'Manage inventory & reserves',
    category: CAPABILITY_CATEGORIES.OPERATIONS,
    description: 'Track cured honey stock, jar reserves, sealed crates and storage units',
    icon: 'Package',
    aliases: [
      'inventory management',
      'manage inventory',
      'track stock',
      'warehouse inventory',
      'jar reserves',
      'honey stock',
      'stock control'
    ],
    requiredForDesignations: [],
    coreForDesignations: ['DISTRIBUTOR'],
    supportingForDesignations: ['PROCESSOR', 'FACILITY_MANAGER'],
    relatedCapabilities: ['SHIPMENT_DISPATCH'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: [],
    applicableModules: ['inventory_stock'],
    evidenceRequirements: [],
    riskLevel: RISK_LEVELS.LOW,
    verificationRequired: false,
    active: true
  },
  {
    id: 'PACKAGE_HONEY',
    name: 'Package & seal honey',
    category: CAPABILITY_CATEGORIES.OPERATIONS,
    description: 'Bottle clarified honey and affix cryptographic tamper-evident seals',
    icon: 'Box',
    aliases: [
      'package honey',
      'bottle honey',
      'affix seals',
      'jar packaging',
      'bottling line',
      'tamper packaging'
    ],
    requiredForDesignations: [],
    coreForDesignations: ['PROCESSOR'],
    supportingForDesignations: ['DISTRIBUTOR'],
    relatedCapabilities: ['HONEY_PROCESSING', 'INVENTORY_MANAGEMENT'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: [],
    applicableModules: ['inventory_stock', 'processing_records'],
    evidenceRequirements: [],
    riskLevel: RISK_LEVELS.LOW,
    verificationRequired: false,
    active: true
  },
  {
    id: 'SHIPMENT_DISPATCH',
    name: 'Distribution & logistics dispatch',
    category: CAPABILITY_CATEGORIES.OPERATIONS,
    description: 'Coordinate wholesale dispatches, retailer shipments and transport logs',
    icon: 'Truck',
    aliases: [
      'handle distribution',
      'dispatch shipments',
      'logistics dispatch',
      'wholesale shipping',
      'distributor dispatch',
      'carrier logistics',
      'retail shipment'
    ],
    requiredForDesignations: ['DISTRIBUTOR'],
    coreForDesignations: [],
    supportingForDesignations: ['FACILITY_MANAGER'],
    relatedCapabilities: ['INVENTORY_MANAGEMENT', 'TRACEABILITY_VERIFICATION'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: ['INVENTORY_MANAGEMENT'],
    applicableModules: ['inventory_stock', 'shipment_handling', 'retail_distribution'],
    evidenceRequirements: ['Commercial transport / carrier authorization'],
    riskLevel: RISK_LEVELS.MEDIUM,
    verificationRequired: false,
    active: true
  },

  // -------------------------------------------------------------
  // Category: MANAGEMENT
  // -------------------------------------------------------------
  {
    id: 'TEAM_SUPERVISION',
    name: 'Supervise team members',
    category: CAPABILITY_CATEGORIES.MANAGEMENT,
    description: 'Coordinate apiary field hands, quality technicians and facility shifts',
    icon: 'Users',
    aliases: [
      'manage team',
      'supervise workers',
      'team supervision',
      'shift coordination',
      'operations management',
      'staff supervisor'
    ],
    requiredForDesignations: ['FACILITY_MANAGER'],
    coreForDesignations: [],
    supportingForDesignations: [],
    relatedCapabilities: ['RECORD_AUDITING'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: [],
    applicableModules: ['team_oversight'],
    evidenceRequirements: ['Facility operational manager appointment'],
    riskLevel: RISK_LEVELS.MEDIUM,
    verificationRequired: false,
    active: true
  },
  {
    id: 'RECORD_AUDITING',
    name: 'Audit records & compliance',
    category: CAPABILITY_CATEGORIES.MANAGEMENT,
    description: 'Audit complete extraction trails, compliance logs and regulatory filings',
    icon: 'FileText',
    aliases: [
      'audit records',
      'compliance review',
      'review records',
      'audit extraction',
      'regulatory compliance',
      'inspect records'
    ],
    requiredForDesignations: [],
    coreForDesignations: ['INSPECTOR', 'FACILITY_MANAGER'],
    supportingForDesignations: ['LAB_SPECIALIST'],
    relatedCapabilities: ['TRACEABILITY_VERIFICATION'],
    conflictingCapabilities: [],
    prerequisiteCapabilities: [],
    applicableModules: ['record_auditing', 'traceability_journeys'],
    evidenceRequirements: ['Auditor or compliance officer credentials'],
    riskLevel: RISK_LEVELS.HIGH,
    verificationRequired: true,
    active: true
  }
];

// Map lookup index for O(1) retrieval
export const CAPABILITY_MAP = new Map(CAPABILITY_TAXONOMY.map(c => [c.id, c]));

// Backward compatibility alias index for lowercase legacy IDs
const LEGACY_ID_MAP = {
  monitor_hives: 'HIVE_MONITORING',
  inspect_hives: 'HIVE_INSPECTION',
  capture_hive_images: 'HIVE_IMAGE_CAPTURE',
  sensor_monitoring: 'SENSOR_MONITORING',
  collect_honey: 'HONEY_COLLECTION',
  process_honey: 'HONEY_PROCESSING',
  create_batches: 'BATCH_MANAGEMENT',
  quality_testing: 'QUALITY_TESTING',
  lab_inspection: 'LAB_INSPECTION',
  sample_management: 'LAB_INSPECTION',
  traceability_verification: 'TRACEABILITY_VERIFICATION',
  manage_inventory: 'INVENTORY_MANAGEMENT',
  package_honey: 'PACKAGE_HONEY',
  handle_distribution: 'SHIPMENT_DISPATCH',
  manage_team: 'TEAM_SUPERVISION',
  review_records: 'RECORD_AUDITING'
};

/**
 * Normalizes a raw string or alias into a canonical capability ID.
 * Example:
 * "Check hives" -> "HIVE_MONITORING"
 * "inspect_hives" -> "HIVE_INSPECTION"
 *
 * @param {string} input - Raw text, alias, or ID
 * @returns {string|null} Canonical Capability ID, or null if unresolvable
 */
export const normalizeCapability = (input) => {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim();
  const upper = clean.toUpperCase();

  // 1. Direct canonical or legacy ID match
  if (CANONICAL_CAPABILITY_MAP && CANONICAL_CAPABILITY_MAP.has(upper)) {
    return upper;
  }
  if (CAPABILITY_MAP.has(upper)) {
    return upper;
  }

  // 2. Legacy snake_case map
  const lower = clean.toLowerCase();
  if (LEGACY_ID_MAP[lower]) {
    return LEGACY_ID_MAP[lower];
  }

  // 3. Normalized alias matching - Pass 1: Exact matches
  const target = lower.replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const cap of CAPABILITY_TAXONOMY) {
    if (cap.name.toLowerCase() === lower || cap.name.toLowerCase() === target) {
      return cap.id;
    }
    for (const alias of cap.aliases) {
      const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
      if (cleanAlias === target || alias.toLowerCase() === lower) {
        return cap.id;
      }
    }
  }

  // Pass 2: Substring / containment matching
  for (const cap of CAPABILITY_TAXONOMY) {
    for (const alias of cap.aliases) {
      const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
      if (target.includes(cleanAlias) || (target.length >= 6 && cleanAlias.includes(target))) {
        return cap.id;
      }
    }
  }

  return null;
};

/**
 * Normalizes an array of raw inputs, deduplicating and discarding unresolvable items.
 *
 * @param {Array<string>} inputs
 * @returns {Array<string>} Array of unique canonical capability IDs
 */
export const normalizeCapabilityList = (inputs = []) => {
  if (!Array.isArray(inputs)) return [];
  const normalizedSet = new Set();

  for (const item of inputs) {
    const canonical = normalizeCapability(item);
    if (canonical) {
      normalizedSet.add(canonical);
    }
  }

  return Array.from(normalizedSet);
};

/**
 * Search capabilities by keyword or phrase.
 *
 * @param {string} query
 * @returns {Array<Object>} List of matching capability objects
 */
export const searchCapabilities = (query) => {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return CAPABILITY_TAXONOMY;
  }
  const q = query.toLowerCase().trim();

  return CAPABILITY_TAXONOMY.filter(cap => {
    return (
      cap.name.toLowerCase().includes(q) ||
      cap.description.toLowerCase().includes(q) ||
      cap.category.toLowerCase().includes(q) ||
      cap.aliases.some(a => a.includes(q))
    );
  });
};

/**
 * Extensible Work Context Taxonomy
 * Defines normalized working environments and responsibility areas for capability discovery.
 */
export const WORK_CONTEXT_TAXONOMY = [
  {
    id: 'HIVE_OPERATIONS',
    key: 'hives',
    title: 'Hives',
    description: 'Bee colonies and hive operations',
    icon: 'Layers',
    microcopy: "You'll get hive-related tasks next.",
    associatedCapabilities: [
      'HIVE_MONITORING',
      'HIVE_INSPECTION',
      'HIVE_IMAGE_CAPTURE',
      'SENSOR_MONITORING',
      'HONEY_COLLECTION'
    ],
    active: true
  },
  {
    id: 'HONEY_OPERATIONS',
    key: 'honey',
    title: 'Honey',
    description: 'Collection, processing and batch handling',
    icon: 'Package',
    microcopy: "We'll show you the honey workflows that fit.",
    associatedCapabilities: [
      'HONEY_COLLECTION',
      'HONEY_PROCESSING',
      'BATCH_MANAGEMENT',
      'PACKAGE_HONEY'
    ],
    active: true
  },
  {
    id: 'QUALITY_OPERATIONS',
    key: 'quality',
    title: 'Quality',
    description: 'Testing, inspection and quality records',
    icon: 'FlaskConical',
    microcopy: "We'll focus on testing and lab tasks next.",
    associatedCapabilities: [
      'QUALITY_TESTING',
      'LAB_INSPECTION',
      'TRACEABILITY_VERIFICATION'
    ],
    active: true
  },
  {
    id: 'LOGISTICS_OPERATIONS',
    key: 'products_delivery',
    title: 'Products & delivery',
    description: 'Packaging, inventory and distribution',
    icon: 'Truck',
    microcopy: "We'll show you inventory and shipping workflows next.",
    associatedCapabilities: [
      'INVENTORY_MANAGEMENT',
      'PACKAGE_HONEY',
      'SHIPMENT_DISPATCH',
      'RECORD_AUDITING',
      'TEAM_SUPERVISION'
    ],
    active: true
  }
];

export const WORK_CONTEXT_MAP = new Map(WORK_CONTEXT_TAXONOMY.map(c => [c.id, c]));

/**
 * Returns deduplicated associated capability IDs for an array of normalized context IDs.
 *
 * @param {Array<string>} contextIds - Normalized context IDs
 * @returns {Array<string>} Deduplicated capability IDs
 */
export const getCapabilitiesForWorkContexts = (contextIds = []) => {
  // SECURITY: Fail-closed. No work contexts selected = no capability suggestions returned.
  // The caller must explicitly select contexts to receive associated capabilities.
  // Returning ALL capabilities for empty input would violate the principle of least privilege.
  if (!Array.isArray(contextIds) || contextIds.length === 0) {
    return [];
  }
  const capSet = new Set();
  contextIds.forEach(id => {
    const ctx = WORK_CONTEXT_MAP.get(id);
    if (ctx && Array.isArray(ctx.associatedCapabilities)) {
      ctx.associatedCapabilities.forEach(c => capSet.add(c));
    }
  });
  return Array.from(capSet);
};

