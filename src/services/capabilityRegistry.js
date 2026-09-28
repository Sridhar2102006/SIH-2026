/**
 * HoneyChain Normalized Capability Registry & Capability Graph
 *
 * Source of Truth: Derived from Excel Feature Matrices
 * (Beekeeper, Processor, Lab Part 1 & 2, Dispatch/Distributor)
 */

import capabilitiesData from '../data/matrices/capabilities.js';
import featuresData from '../data/matrices/features.js';
import policiesData from '../data/matrices/policies.js';

export const FEATURE_CATALOG = featuresData;
export const POLICY_CATALOG = policiesData;

const CAPABILITY_EXTENSIONS = [
  { id: 'HIVE_IMAGE_CAPTURE', designationFamily: 'BEEKEEPER', name: 'Hive Image Capture', type: 'Optional', purpose: 'Capture images of frames and hive observations', category: 'FIELD' },
  { id: 'QUALITY_TESTING', designationFamily: 'LAB', name: 'Quality Testing', type: 'Optional', purpose: 'Perform defined quality checks and record results', category: 'QUALITY' },
  { id: 'LAB_INSPECTION', designationFamily: 'LAB', name: 'Laboratory Inspection', type: 'Verification Required', purpose: 'Perform laboratory inspection under verified qualifications', category: 'QUALITY', riskLevel: 'HIGH', verificationRequired: true, evidenceRequirements: ['Verified laboratory qualification'] },
  { id: 'TRACEABILITY_VERIFICATION', designationFamily: 'QUALITY', name: 'Traceability Verification', type: 'Optional', purpose: 'Verify traceability evidence and provenance records', category: 'QUALITY' },
  { id: 'INVENTORY_MANAGEMENT', designationFamily: 'DISTRIBUTOR', name: 'Inventory Management', type: 'Optional', purpose: 'Manage approved inventory and reserves', category: 'FULFILLMENT' },
  { id: 'PACKAGE_HONEY', designationFamily: 'PROCESSOR', name: 'Package Honey', type: 'Optional', purpose: 'Package and seal honey products', category: 'PRODUCTION' },
  { id: 'TEAM_SUPERVISION', designationFamily: 'OPERATIONS', name: 'Team Supervision', type: 'Optional', purpose: 'Coordinate and supervise team work', category: 'MANAGEMENT' },
  { id: 'RECORD_AUDITING', designationFamily: 'COMPLIANCE', name: 'Record Auditing', type: 'Verification Required', purpose: 'Audit operational records and compliance evidence', category: 'MANAGEMENT', riskLevel: 'HIGH', verificationRequired: true, evidenceRequirements: ['Verified auditor or compliance appointment'] },
  { id: 'CERTIFICATE_GENERATION', designationFamily: 'LAB', name: 'Certificate Generation', type: 'Advanced', purpose: 'Generate certificates from approved laboratory reports', category: 'QUALITY' },
  { id: 'PACKAGE_QR_VALIDATE', designationFamily: 'DISTRIBUTOR', name: 'Package QR Validation', type: 'Optional', purpose: 'Validate package QR references before dispatch', category: 'FULFILLMENT' },
  { id: 'SHIPMENT_RELEASE', designationFamily: 'DISTRIBUTOR', name: 'Shipment Release', type: 'Core', purpose: 'Release validated package consignments for transport dispatch', category: 'FULFILLMENT' },
  { id: 'SENSOR_MONITORING', designationFamily: 'BEEKEEPER', name: 'Sensor Monitoring', type: 'Optional', purpose: 'Monitor IoT hive telemetry, temperature, humidity, and colony sensors', category: 'FIELD' },
  { id: 'SHIPMENT_DISPATCH', designationFamily: 'DISTRIBUTOR', name: 'Shipment Dispatch', type: 'Core', purpose: 'Dispatch validated honey shipments and manage carrier transit', category: 'FULFILLMENT' },
  { id: 'USER_MANAGE', designationFamily: 'SYSTEM', name: 'User Administration', type: 'System Only', purpose: 'System-only user administration capability', category: 'SYSTEM', riskLevel: 'CRITICAL' },
  { id: 'KEYS_REVOKE', designationFamily: 'SYSTEM', name: 'Key Revocation', type: 'System Only', purpose: 'System-only key revocation capability', category: 'SYSTEM', riskLevel: 'CRITICAL' },
  { id: 'LEDGER_AUDIT', designationFamily: 'SYSTEM', name: 'Ledger Audit', type: 'Privileged', purpose: 'Privileged ledger audit action', category: 'SYSTEM', riskLevel: 'CRITICAL' }
];

const SOURCE_CAPABILITY_CATALOG = [...capabilitiesData, ...CAPABILITY_EXTENSIONS];

const capabilityDomains = new Map();
SOURCE_CAPABILITY_CATALOG.forEach(capability => {
  const domains = capabilityDomains.get(capability.id) || new Set();
  if (capability.designationFamily) domains.add(capability.designationFamily);
  if (Array.isArray(capability.designationFamilies)) {
    capability.designationFamilies.forEach(f => domains.add(f));
  }
  capabilityDomains.set(capability.id, domains);
});

const capabilityById = new Map();
SOURCE_CAPABILITY_CATALOG.forEach(source => {
  const existing = capabilityById.get(source.id);
  if (existing) {
    existing.domains = Array.from(capabilityDomains.get(source.id));
    existing.featureIds = Array.from(new Set([...existing.featureIds, ...FEATURE_CATALOG
      .filter(feature => feature.requiredCapability === source.id)
      .map(feature => feature.id)]));
    existing.permissionIds = Array.from(new Set([...existing.permissionIds, ...FEATURE_CATALOG
      .filter(feature => feature.requiredCapability === source.id && feature.permissionId)
      .map(feature => feature.permissionId)]));
    return;
  }

  const linkedFeatures = FEATURE_CATALOG.filter(feature => feature.requiredCapability === source.id);
  capabilityById.set(source.id, {
    ...source,
    description: source.purpose,
    domain: source.designationFamily,
    domains: Array.from(capabilityDomains.get(source.id)),
    category: source.category,
    riskLevel: source.riskLevel || 'MEDIUM',
    verificationRequired: Boolean(source.verificationRequired),
    capabilityClass: source.verificationRequired ? 'VERIFICATION_REQUIRED' : String(source.type || 'OPTIONAL').toUpperCase().replaceAll(' ', '_'),
    prerequisites: source.prerequisites || [],
    implies: [],
    conflicts: [],
    relatedCapabilities: [],
    featureIds: linkedFeatures.map(feature => feature.id),
    permissionIds: linkedFeatures.map(feature => feature.permissionId).filter(Boolean),
    designationEligibility: source.designationFamily ? [source.designationFamily] : [],
    evidenceRequirements: [],
    questionSignals: []
  });
});

export const CAPABILITY_CATALOG = Array.from(capabilityById.values());
export const CAPABILITY_MAP = new Map(CAPABILITY_CATALOG.map(capability => [capability.id, capability]));

// Precomputed permissions per capability
const CAPABILITY_PERMISSIONS_MAP = new Map();
FEATURE_CATALOG.forEach(f => {
  if (f.requiredCapability && f.permissionId) {
    if (!CAPABILITY_PERMISSIONS_MAP.has(f.requiredCapability)) {
      CAPABILITY_PERMISSIONS_MAP.set(f.requiredCapability, new Set());
    }
    CAPABILITY_PERMISSIONS_MAP.get(f.requiredCapability).add(f.permissionId);
  }
});

// Precomputed features/tools per capability
const CAPABILITY_FEATURES_MAP = new Map();
FEATURE_CATALOG.forEach(f => {
  if (f.requiredCapability) {
    if (!CAPABILITY_FEATURES_MAP.has(f.requiredCapability)) {
      CAPABILITY_FEATURES_MAP.set(f.requiredCapability, []);
    }
    CAPABILITY_FEATURES_MAP.get(f.requiredCapability).push(f);
  }
});

// Canonical prerequisite edges; inference never grants permissions.
export const CAPABILITY_DEPENDENCIES = {
  // Field
  HIVE_INSPECTION: ['HIVE_MANAGEMENT'],
  BEE_HEALTH_SCAN: ['HIVE_INSPECTION'],
  CONNECTED_HIVE_MONITORING: ['HIVE_MANAGEMENT'],
  HIVE_DEVICE_MANAGEMENT: ['CONNECTED_HIVE_MONITORING'],
  COLLECTION_BATCH_LINK: ['HONEY_COLLECTION'],
  ADVANCED_HIVE_MANAGEMENT: ['HIVE_MANAGEMENT'],

  // Production
  PROCESSING_STEP_RECORD: ['PROCESSING_MANAGEMENT'],
  PROCESSING_PARAMETERS: ['PROCESSING_MANAGEMENT'],
  PROCESSING_EVIDENCE: ['PROCESSING_MANAGEMENT'],
  PROCESSING_COMPLETION: ['PROCESSING_MANAGEMENT'],
  BATCH_SPLIT_MERGE: ['PROCESSING_MANAGEMENT', 'BATCH_INTAKE'],
  QUALITY_HANDOFF: ['PROCESSING_MANAGEMENT'],
  PACKAGING_HANDOFF: ['PROCESSING_MANAGEMENT'],
  PROCESSING_DEVICE_MANAGEMENT: ['PROCESSING_MANAGEMENT'],

  // Quality / Lab
  TEST_ASSIGNMENT: ['LAB_WORKSPACE', 'SAMPLE_INTAKE'],
  TEST_EXECUTION: ['TEST_ASSIGNMENT'],
  TEST_RESULT_ENTRY: ['TEST_EXECUTION'],
  RESULT_EVIDENCE: ['TEST_RESULT_ENTRY'],
  RESULT_REVIEW: ['LAB_WORKSPACE'],
  QUALITY_RECOMMENDATION: ['TEST_RESULT_ENTRY'],
  CALIBRATION_RECORDING: ['LAB_DEVICE_RECORDING'],
  LAB_EQUIPMENT_MANAGEMENT: ['LAB_WORKSPACE'],
  MULTI_TEST_MANAGEMENT: ['TEST_ASSIGNMENT'],
  SAMPLE_PRIORITY_MANAGEMENT: ['SAMPLE_INTAKE'],
  CHAIN_OF_CUSTODY_MANAGEMENT: ['SAMPLE_INTAKE'],
  REPORT_GENERATION: ['TEST_RESULT_ENTRY'],
  RESULT_COMPARISON: ['TEST_RESULT_ENTRY'],
  METHOD_MANAGEMENT: ['LAB_WORKSPACE'],

  // Distribution
  PACKAGE_QR_VALIDATE: ['DISPATCH_PLANNING'],
  CERTIFICATE_GENERATION: ['REPORT_GENERATION'],
  SHIPMENT_CREATE: ['DISPATCH_PLANNING'],
  SHIPMENT_UPDATE: ['SHIPMENT_CREATE'],
  SHIPMENT_RELEASE: ['SHIPMENT_CREATE'],
  DELIVERY_TRACKING: ['SHIPMENT_CREATE'],
  DELIVERY_CONFIRMATION: ['DELIVERY_TRACKING'],
  ROUTE_PLANNING: ['DISPATCH_PLANNING'],
  MULTI_STOP_DISPATCH: ['DISPATCH_PLANNING'],
  DRIVER_ASSIGNMENT: ['TRANSPORT_MANAGEMENT'],
  PROOF_OF_DELIVERY: ['DELIVERY_CONFIRMATION'],
  RETURN_MANAGEMENT: ['DELIVERY_TRACKING'],
  DELIVERY_EXCEPTION_MANAGEMENT: ['DELIVERY_TRACKING'],
  PUBLIC_VERIFICATION_VIEW: ['BATCH_TRACEABILITY'],
  QR_REFERENCE_VIEW: ['BATCH_TRACEABILITY']
};

Object.entries(CAPABILITY_DEPENDENCIES).forEach(([capabilityId, prerequisiteIds]) => {
  const capability = CAPABILITY_MAP.get(capabilityId);
  if (capability) capability.prerequisites = prerequisiteIds.slice();
});

export const CAPABILITY_GRAPH = new Map(CAPABILITY_CATALOG.map(capability => [
  capability.id,
  {
    requires: capability.prerequisites,
    implies: capability.implies,
    enhances: capability.relatedCapabilities,
    conflictsWith: capability.conflicts
  }
]));

export const CapabilityRegistry = {
  getCapability(id) {
    return CAPABILITY_MAP.get(id) || null;
  },

  getAllCapabilities() {
    return CAPABILITY_CATALOG;
  },

  getCapabilitiesByFamily(family) {
    if (!family) return CAPABILITY_CATALOG;
    const fam = String(family).toUpperCase();
    return CAPABILITY_CATALOG.filter(capability => capability.domains.includes(fam));
  },

  getDependencies(id) {
    return CAPABILITY_DEPENDENCIES[id] || [];
  },

  getPermissionsForCapability(id) {
    const set = CAPABILITY_PERMISSIONS_MAP.get(id);
    return set ? Array.from(set) : [];
  },

  getFeaturesForCapability(id) {
    return CAPABILITY_FEATURES_MAP.get(id) || [];
  },

  resolveImpliedCapabilities(selectedCapabilityIds = []) {
    return this.resolveCapabilityDependencies(selectedCapabilityIds).resolved;
  },

  resolveCapabilityDependencies(selectedCapabilityIds = []) {
    const explicit = new Set(selectedCapabilityIds.filter(id => CAPABILITY_MAP.has(id)));
    const unknown = selectedCapabilityIds.filter(id => !CAPABILITY_MAP.has(id));
    const resolved = new Set(explicit);
    const dependencyAdded = new Set();
    const pending = Array.from(explicit);

    while (pending.length > 0) {
      const capabilityId = pending.pop();
      for (const prerequisiteId of CAPABILITY_DEPENDENCIES[capabilityId] || []) {
        if (!CAPABILITY_MAP.has(prerequisiteId)) {
          unknown.push(prerequisiteId);
          continue;
        }
        if (!resolved.has(prerequisiteId)) {
          resolved.add(prerequisiteId);
          dependencyAdded.add(prerequisiteId);
          pending.push(prerequisiteId);
        }
      }
    }

    return {
      explicit: Array.from(explicit),
      dependencies: Array.from(dependencyAdded),
      resolved: Array.from(resolved),
      unknown: Array.from(new Set(unknown))
    };
  },

  validateCapabilities(capabilityIds = []) {
    const valid = [];
    const unknown = [];
    capabilityIds.forEach(id => {
      if (CAPABILITY_MAP.has(id)) valid.push(id);
      else unknown.push(id);
    });
    return { valid, unknown };
  }
};
