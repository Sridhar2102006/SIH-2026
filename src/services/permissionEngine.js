/**
 * HoneyChain Enterprise Module & Action-Level Permission Engine
 *
 * Layered Authorization Model:
 * CAPABILITY -> DESIGNATION -> MODULE -> ACTION PERMISSION
 *
 * Enforces action-level permissions and strictly protects privileged actions
 * against self-granted escalation.
 */

import { CAPABILITY_MAP } from './capabilityTaxonomy.js';
import { DESIGNATION_MAP } from './designationEngine.js';
import { CAPABILITY_MAP as CANONICAL_CAPABILITY_MAP, CapabilityRegistry } from './capabilityRegistry.js';
import { migrateLegacyCapabilities } from './capabilityMigration.js';

// 1. Granular Action Permissions
export const ACTION_PERMISSIONS = {
  // Domain A: Hive Actions
  HIVE_VIEW: 'HIVE_VIEW',
  HIVE_CREATE: 'HIVE_CREATE',
  HIVE_EDIT: 'HIVE_EDIT',
  HIVE_INSPECT: 'HIVE_INSPECT',
  HIVE_OBSERVATION_CREATE: 'HIVE_OBSERVATION_CREATE',
  HIVE_HISTORY_VIEW: 'HIVE_HISTORY_VIEW',
  HIVE_PHOTO_CAPTURE: 'HIVE_PHOTO_CAPTURE',
  SENSOR_READ: 'SENSOR_READ',
  SENSOR_PROVISION: 'SENSOR_PROVISION',
  DEVICE_DIAGNOSTICS_VIEW: 'DEVICE_DIAGNOSTICS_VIEW',
  DEVICE_DIAGNOSTICS_EXECUTE: 'DEVICE_DIAGNOSTICS_EXECUTE',
  DEVICE_RESTART: 'DEVICE_RESTART',
  DEVICE_ASSIGNMENT_CHANGE: 'DEVICE_ASSIGNMENT_CHANGE',

  // Domain B: Bee Health Scan Actions
  BEE_HEALTH_SCAN: 'BEE_HEALTH_SCAN',
  HEALTH_SCAN_VIEW: 'HEALTH_SCAN_VIEW',
  HEALTH_SCAN_CREATE: 'HEALTH_SCAN_CREATE',
  HEALTH_SCAN_ANALYZE: 'HEALTH_SCAN_ANALYZE',
  HEALTH_SCAN_SAVE: 'HEALTH_SCAN_SAVE',
  HEALTH_HISTORY_VIEW: 'HEALTH_HISTORY_VIEW',

  // Domain C: Collection Actions
  COLLECTION_VIEW: 'COLLECTION_VIEW',
  COLLECTION_CREATE: 'COLLECTION_CREATE',
  COLLECTION_EDIT: 'COLLECTION_EDIT',
  COLLECTION_EVIDENCE_VIEW: 'COLLECTION_EVIDENCE_VIEW',
  COLLECTION_BATCH_LINK: 'COLLECTION_BATCH_LINK',

  // Domain D: Honey Batch Actions
  BATCH_VIEW: 'BATCH_VIEW',
  BATCH_CREATE: 'BATCH_CREATE',
  BATCH_EDIT: 'BATCH_EDIT',
  BATCH_DELETE: 'BATCH_DELETE', // Privileged
  BATCH_SPLIT: 'BATCH_SPLIT',
  BATCH_MERGE: 'BATCH_MERGE',
  BATCH_HISTORY_VIEW: 'BATCH_HISTORY_VIEW',

  // Domain E: Processing Actions
  PROCESSING_VIEW: 'PROCESSING_VIEW',
  PROCESSING_CREATE: 'PROCESSING_CREATE',
  PROCESSING_EDIT: 'PROCESSING_EDIT',
  PROCESSING_COMPLETE: 'PROCESSING_COMPLETE',
  PROCESSING_EVIDENCE_VIEW: 'PROCESSING_EVIDENCE_VIEW',
  HONEY_EXTRACT: 'HONEY_EXTRACT',
  HONEY_BOTTLE: 'HONEY_BOTTLE',

  // Domain F: Quality & Lab Actions
  QUALITY_VIEW: 'QUALITY_VIEW',
  QUALITY_CHECK_VIEW: 'QUALITY_CHECK_VIEW',
  QUALITY_CHECK_CREATE: 'QUALITY_CHECK_CREATE',
  QUALITY_RESULT_CREATE: 'QUALITY_RESULT_CREATE',
  QUALITY_RESULT_EDIT: 'QUALITY_RESULT_EDIT',
  QUALITY_RECORD: 'QUALITY_RECORD',
  QUALITY_REVIEW: 'QUALITY_REVIEW',
  QUALITY_DECISION: 'QUALITY_DECISION',
  QUALITY_HOLD_BATCH: 'QUALITY_HOLD_BATCH',
  QUALITY_EVIDENCE_UPLOAD: 'QUALITY_EVIDENCE_UPLOAD',
  QUALITY_APPROVE: 'QUALITY_APPROVE', // Privileged
  LAB_REPORT_CERTIFY: 'LAB_REPORT_CERTIFY', // Privileged

  // Domain G: Product Packaging & Label Generation Actions
  PACKAGING_VIEW: 'PACKAGING_VIEW',
  PACKAGE_CREATE: 'PACKAGE_CREATE',
  PACKAGE_VIEW: 'PACKAGE_VIEW',
  PACKAGE_EDIT: 'PACKAGE_EDIT',
  PACKAGE_FINALIZE: 'PACKAGE_FINALIZE', // Privileged
  LABEL_CREATE: 'LABEL_CREATE',
  LABEL_VIEW: 'LABEL_VIEW',
  LABEL_EDIT: 'LABEL_EDIT',
  LABEL_FINALIZE: 'LABEL_FINALIZE', // Privileged
  LABEL_PRINT: 'LABEL_PRINT',
  LABEL_REPLACE: 'LABEL_REPLACE', // Privileged

  // Domain H: Verification Actions
  VERIFICATION_VIEW: 'VERIFICATION_VIEW',
  VERIFICATION_REVIEW: 'VERIFICATION_REVIEW',
  BATCH_VERIFY: 'BATCH_VERIFY', // Privileged
  VERIFICATION_HISTORY_VIEW: 'VERIFICATION_HISTORY_VIEW',

  // Domain I: Technical Proof Actions
  PROOF_VIEW: 'PROOF_VIEW',
  PROOF_CREATE: 'PROOF_CREATE',
  PROOF_RETRY: 'PROOF_RETRY',
  PROOF_TECHNICAL_DETAILS: 'PROOF_TECHNICAL_DETAILS',

  // Domain J: Traceability & Ledger Actions
  TRACEABILITY_VIEW: 'TRACEABILITY_VIEW',
  TRACEABILITY_EVIDENCE_VIEW: 'TRACEABILITY_EVIDENCE_VIEW',
  TRACEABILITY_EXPORT: 'TRACEABILITY_EXPORT',
  LEDGER_AUDIT: 'LEDGER_AUDIT', // Privileged
  USER_MANAGE: 'USER_MANAGE', // Highly Privileged
  KEYS_REVOKE: 'KEYS_REVOKE', // Highly Privileged

  // Domain K: Product / Package QR Management Actions
  PUBLIC_QR_VIEW: 'PUBLIC_QR_VIEW',
  PUBLIC_QR_CREATE: 'PUBLIC_QR_CREATE',
  PUBLIC_QR_REGENERATE: 'PUBLIC_QR_REGENERATE',
  PUBLIC_QR_REVOKE: 'PUBLIC_QR_REVOKE', // Privileged
  PUBLIC_QR_DOWNLOAD: 'PUBLIC_QR_DOWNLOAD',
  PUBLIC_QR_SHARE: 'PUBLIC_QR_SHARE',

  // Domain L: Distribution & Logistics Actions
  DISTRIBUTION_VIEW: 'DISTRIBUTION_VIEW',
  DISTRIBUTION_CREATE: 'DISTRIBUTION_CREATE',
  DISTRIBUTION_EDIT: 'DISTRIBUTION_EDIT',
  SHIPMENT_CREATE: 'SHIPMENT_CREATE',
  SHIPMENT_UPDATE: 'SHIPMENT_UPDATE',
  DELIVERY_VIEW: 'DELIVERY_VIEW',
  INVENTORY_VIEW: 'INVENTORY_VIEW',
  INVENTORY_ADJUST: 'INVENTORY_ADJUST',
  SHIPMENT_DISPATCH: 'SHIPMENT_DISPATCH',
  SHIPMENT_RECEIVE: 'SHIPMENT_RECEIVE'
};

// 2. Privileged Actions that cannot be self-granted by capability onboarding
export const PRIVILEGED_ACTIONS = new Set([
  ACTION_PERMISSIONS.BATCH_DELETE,
  ACTION_PERMISSIONS.QUALITY_APPROVE,
  ACTION_PERMISSIONS.QUALITY_DECISION,
  ACTION_PERMISSIONS.LAB_REPORT_CERTIFY,
  ACTION_PERMISSIONS.BATCH_VERIFY,
  ACTION_PERMISSIONS.LEDGER_AUDIT,
  ACTION_PERMISSIONS.USER_MANAGE,
  ACTION_PERMISSIONS.KEYS_REVOKE,
  ACTION_PERMISSIONS.PUBLIC_QR_REVOKE,
  ACTION_PERMISSIONS.PACKAGE_FINALIZE,
  ACTION_PERMISSIONS.LABEL_FINALIZE,
  ACTION_PERMISSIONS.LABEL_REPLACE
]);

// 3. Human-purpose Workspace Modules with action mappings
export const WORKSPACE_MODULE_REGISTRY = [
  // -------------------------------------------------------------
  // Category: YOUR HIVES
  // -------------------------------------------------------------
  {
    id: 'hive_view',
    name: 'View hives & colonies',
    description: 'Inspect colony status, temperament and frame counts across yards',
    category: 'YOUR HIVES',
    requiredCapabilities: ['HIVE_MANAGEMENT'],
    supportedDesignations: ['BEEKEEPER', 'INSPECTOR', 'FACILITY_MANAGER'],
    dependencies: [],
    riskLevel: 'LOW',
    requiresVerification: false,
    active: true,
    actions: [
      ACTION_PERMISSIONS.HIVE_VIEW,
      ACTION_PERMISSIONS.SENSOR_READ,
      ACTION_PERMISSIONS.DEVICE_DIAGNOSTICS_VIEW
    ]
  },
  {
    id: 'hive_inspection',
    name: 'Capture inspections',
    description: 'Quick-log brood pattern, queen presence and Varroa assessments',
    category: 'YOUR HIVES',
    requiredCapabilities: ['HIVE_INSPECTION'],
    supportedDesignations: ['BEEKEEPER', 'INSPECTOR'],
    dependencies: ['hive_view'],
    riskLevel: 'MEDIUM',
    requiresVerification: false,
    active: true,
    actions: [
      ACTION_PERMISSIONS.HIVE_INSPECT,
      ACTION_PERMISSIONS.HEALTH_SCAN_VIEW,
      ACTION_PERMISSIONS.HEALTH_SCAN_CREATE,
      ACTION_PERMISSIONS.HEALTH_SCAN_ANALYZE,
      ACTION_PERMISSIONS.HEALTH_SCAN_SAVE
    ]
  },
  {
    id: 'sensor_monitoring',
    name: 'Monitor conditions & sensors',
    description: 'Live continuous scale weights, temperature and acoustic telemetry',
    category: 'YOUR HIVES',
    requiredCapabilities: ['CONNECTED_HIVE_MONITORING', 'HIVE_MANAGEMENT'],
    supportedDesignations: ['BEEKEEPER', 'FACILITY_MANAGER'],
    dependencies: ['hive_view'],
    riskLevel: 'LOW',
    requiresVerification: false,
    active: true,
    actions: [
      ACTION_PERMISSIONS.SENSOR_READ,
      ACTION_PERMISSIONS.SENSOR_PROVISION,
      ACTION_PERMISSIONS.DEVICE_DIAGNOSTICS_VIEW,
      ACTION_PERMISSIONS.DEVICE_DIAGNOSTICS_EXECUTE
    ]
  },
  {
    id: 'hive_images',
    name: 'Comb diagnostic photos',
    description: 'Visual library of frame observations linked to colony timeline',
    category: 'YOUR HIVES',
    requiredCapabilities: ['HIVE_IMAGE_CAPTURE'],
    supportedDesignations: ['BEEKEEPER', 'INSPECTOR'],
    dependencies: ['hive_view'],
    riskLevel: 'LOW',
    requiresVerification: false,
    active: true,
    actions: [
      ACTION_PERMISSIONS.HIVE_PHOTO_CAPTURE,
      ACTION_PERMISSIONS.HEALTH_SCAN_VIEW,
      ACTION_PERMISSIONS.HEALTH_SCAN_CREATE
    ]
  },

  // -------------------------------------------------------------
  // Category: YOUR HONEY
  // -------------------------------------------------------------
  {
    id: 'honey_batches',
    name: 'Create & track batches',
    description: 'Manage harvest identifiers, lot numbers and current curing state',
    category: 'YOUR HONEY',
    requiredCapabilities: ['BATCH_INTAKE', 'PROCESSING_MANAGEMENT'],
    supportedDesignations: ['PROCESSOR'],
    dependencies: [],
    riskLevel: 'MEDIUM',
    requiresVerification: false,
    active: true,
    actions: [
      ACTION_PERMISSIONS.BATCH_VIEW,
      ACTION_PERMISSIONS.BATCH_CREATE,
      ACTION_PERMISSIONS.BATCH_EDIT
    ]
  },
  {
    id: 'honey_collection',
    name: 'Record collection yields',
    description: 'Log supers removed, net harvest weights and source colony yards',
    category: 'YOUR HONEY',
    requiredCapabilities: ['HONEY_COLLECTION'],
    supportedDesignations: ['BEEKEEPER', 'PROCESSOR'],
    dependencies: [],
    riskLevel: 'LOW',
    requiresVerification: false,
    active: true,
    actions: [ACTION_PERMISSIONS.COLLECTION_VIEW, ACTION_PERMISSIONS.COLLECTION_CREATE, ACTION_PERMISSIONS.HONEY_EXTRACT]
  },
  {
    id: 'processing_records',
    name: 'Track processing stages',
    description: 'Record settling tank times, micro-filtration and clarifying progress',
    category: 'YOUR HONEY',
    requiredCapabilities: ['PROCESSING_MANAGEMENT', 'PROCESSING_STEP_RECORD'],
    supportedDesignations: ['PROCESSOR'],
    dependencies: ['honey_batches'],
    riskLevel: 'MEDIUM',
    requiresVerification: false,
    active: true,
    actions: [ACTION_PERMISSIONS.HONEY_EXTRACT, ACTION_PERMISSIONS.HONEY_BOTTLE]
  },

  // -------------------------------------------------------------
  // Category: QUALITY
  // -------------------------------------------------------------
  {
    id: 'quality_checks',
    name: 'Record quality checks',
    description: 'Enter refractometer moisture percentages and sensory profiles',
    category: 'QUALITY',
    requiredCapabilities: ['QUALITY_TESTING'],
    supportedDesignations: ['LAB_SPECIALIST', 'INSPECTOR'],
    dependencies: [],
    riskLevel: 'MEDIUM',
    requiresVerification: false,
    active: true,
    actions: [ACTION_PERMISSIONS.QUALITY_VIEW, ACTION_PERMISSIONS.QUALITY_RECORD]
  },
  {
    id: 'lab_records',
    name: 'Laboratory certificates',
    description: 'Certified analytical reports for HMF, diastase and pollen identity',
    category: 'QUALITY',
    requiredCapabilities: ['LAB_INSPECTION'],
    supportedDesignations: ['LAB_SPECIALIST'],
    dependencies: ['quality_checks'],
    riskLevel: 'HIGH',
    requiresVerification: true,
    active: true,
    actions: [
      ACTION_PERMISSIONS.QUALITY_VIEW,
      ACTION_PERMISSIONS.QUALITY_RECORD,
      ACTION_PERMISSIONS.LAB_REPORT_CERTIFY
    ]
  },

  // -------------------------------------------------------------
  // Category: TRACEABILITY
  // -------------------------------------------------------------
  {
    id: 'sample_intake',
    name: 'Receive laboratory samples',
    description: 'Register incoming samples and maintain their custody references',
    category: 'QUALITY',
    requiredCapabilities: ['LAB_WORKSPACE', 'SAMPLE_INTAKE'],
    supportedDesignations: [],
    dependencies: [],
    riskLevel: 'MEDIUM',
    requiresVerification: false,
    active: true,
    actions: [ACTION_PERMISSIONS.QUALITY_VIEW]
  },
  {
    id: 'lab_test_execution',
    name: 'Execute laboratory tests',
    description: 'Record execution of assigned laboratory tests',
    category: 'QUALITY',
    requiredCapabilities: ['TEST_EXECUTION'],
    supportedDesignations: [],
    dependencies: ['sample_intake'],
    riskLevel: 'MEDIUM',
    requiresVerification: false,
    active: true,
    actions: [ACTION_PERMISSIONS.QUALITY_VIEW, ACTION_PERMISSIONS.QUALITY_RESULT_CREATE]
  },
  {
    id: 'lab_result_review',
    name: 'Review laboratory results',
    description: 'Review results without granting approval or certification authority',
    category: 'QUALITY',
    requiredCapabilities: ['RESULT_REVIEW'],
    supportedDesignations: [],
    dependencies: [],
    riskLevel: 'MEDIUM',
    requiresVerification: false,
    active: true,
    actions: [ACTION_PERMISSIONS.QUALITY_VIEW]
  },
  {
    id: 'traceability_journeys',
    name: 'View honey journeys',
    description: 'Inspect immutable harvest-to-jar chain of custody records',
    category: 'TRACEABILITY',
    requiredCapabilities: [], // Baseline read access for all verified users
    supportedDesignations: ['BEEKEEPER', 'PROCESSOR', 'LAB_SPECIALIST', 'DISTRIBUTOR', 'INSPECTOR', 'FACILITY_MANAGER'],
    dependencies: [],
    riskLevel: 'LOW',
    requiresVerification: false,
    active: true,
    actions: [ACTION_PERMISSIONS.TRACEABILITY_VIEW]
  },
  {
    id: 'record_auditing',
    name: 'Verify immutable records',
    category: 'TRACEABILITY',
    description: 'Audit cryptographic timestamps and tamper-evident blockchain anchors',
    requiredCapabilities: ['RECORD_AUDITING'],
    supportedDesignations: ['INSPECTOR', 'LAB_SPECIALIST', 'FACILITY_MANAGER'],
    dependencies: ['traceability_journeys'],
    riskLevel: 'HIGH',
    requiresVerification: false,
    active: true,
    actions: [
      ACTION_PERMISSIONS.TRACEABILITY_VIEW,
      ACTION_PERMISSIONS.LEDGER_AUDIT,
      ACTION_PERMISSIONS.VERIFICATION_VIEW,
      ACTION_PERMISSIONS.VERIFICATION_REVIEW,
      ACTION_PERMISSIONS.BATCH_VERIFY
    ]
  },
  {
    id: 'product_qr_management',
    name: 'Product & Package QR Management',
    category: 'TRACEABILITY',
    description: 'Create, preview, print and manage public verification QR identities for honey batches and packages',
    requiredCapabilities: ['PACKAGE_HONEY', 'TRACEABILITY_VERIFICATION'],
    supportedDesignations: ['DISTRIBUTOR', 'FACILITY_MANAGER'],
    dependencies: [],
    riskLevel: 'MEDIUM',
    requiresVerification: false,
    active: true,
    actions: [
      ACTION_PERMISSIONS.PUBLIC_QR_VIEW,
      ACTION_PERMISSIONS.PUBLIC_QR_CREATE,
      ACTION_PERMISSIONS.PUBLIC_QR_REGENERATE,
      ACTION_PERMISSIONS.PUBLIC_QR_REVOKE,
      ACTION_PERMISSIONS.PUBLIC_QR_DOWNLOAD,
      ACTION_PERMISSIONS.PUBLIC_QR_SHARE
    ]
  },
  {
    id: 'product_packaging_label',
    name: 'Product Packaging & Label Generation',
    category: 'TRACEABILITY',
    description: 'Prepare physical honey packages, allocate batch weight, and generate print-ready traceability labels linked to HoneyChain records',
    requiredCapabilities: ['PACKAGE_HONEY'],
    supportedDesignations: ['DISTRIBUTOR', 'FACILITY_MANAGER'],
    dependencies: ['product_qr_management'],
    riskLevel: 'MEDIUM',
    requiresVerification: false,
    active: true,
    actions: [
      ACTION_PERMISSIONS.PACKAGING_VIEW,
      ACTION_PERMISSIONS.PACKAGE_CREATE,
      ACTION_PERMISSIONS.PACKAGE_VIEW,
      ACTION_PERMISSIONS.PACKAGE_EDIT,
      ACTION_PERMISSIONS.PACKAGE_FINALIZE,
      ACTION_PERMISSIONS.LABEL_CREATE,
      ACTION_PERMISSIONS.LABEL_VIEW,
      ACTION_PERMISSIONS.LABEL_EDIT,
      ACTION_PERMISSIONS.LABEL_FINALIZE,
      ACTION_PERMISSIONS.LABEL_PRINT,
      ACTION_PERMISSIONS.LABEL_REPLACE
    ]
  },

  // -------------------------------------------------------------
  // Category: OPERATIONS & DISTRIBUTION
  // -------------------------------------------------------------
  {
    id: 'inventory_stock',
    name: 'Manage inventory & stock',
    description: 'Current quantities in tanks, bottled jars and packed case reserves',
    category: 'OPERATIONS',
    requiredCapabilities: ['INVENTORY_MANAGEMENT'],
    supportedDesignations: ['DISTRIBUTOR', 'PROCESSOR'],
    dependencies: [],
    riskLevel: 'LOW',
    requiresVerification: false,
    active: true,
    actions: [ACTION_PERMISSIONS.INVENTORY_VIEW, ACTION_PERMISSIONS.INVENTORY_ADJUST]
  },
  {
    id: 'shipment_handling',
    name: 'Handle shipments & dispatch',
    description: 'Consignment tracking numbers, dispatch logs and route documentation',
    category: 'OPERATIONS',
    requiredCapabilities: ['DISPATCH_PLANNING'],
    supportedDesignations: ['DISTRIBUTOR'],
    dependencies: ['inventory_stock'],
    riskLevel: 'MEDIUM',
    requiresVerification: false,
    active: true,
    actions: [
      ACTION_PERMISSIONS.INVENTORY_VIEW,
      ACTION_PERMISSIONS.SHIPMENT_DISPATCH,
      ACTION_PERMISSIONS.SHIPMENT_RECEIVE
    ]
  },
  {
    id: 'retail_distribution',
    name: 'Retail & distributor channels',
    description: 'Manage wholesale orders, partner accounts and store delivery confirmations',
    category: 'OPERATIONS',
    requiredCapabilities: ['DISPATCH_PLANNING'],
    supportedDesignations: ['DISTRIBUTOR'],
    dependencies: ['shipment_handling'],
    riskLevel: 'LOW',
    requiresVerification: false,
    active: true,
    actions: [ACTION_PERMISSIONS.SHIPMENT_DISPATCH]
  },
  {
    id: 'route_planning',
    name: 'Plan delivery routes',
    description: 'Plan delivery sequences and route operations',
    category: 'OPERATIONS',
    requiredCapabilities: ['ROUTE_PLANNING'],
    supportedDesignations: [],
    dependencies: [],
    riskLevel: 'LOW',
    requiresVerification: false,
    active: true,
    actions: [ACTION_PERMISSIONS.DISTRIBUTION_VIEW]
  },
  {
    id: 'delivery_tracking',
    name: 'Track deliveries',
    description: 'Track shipment progress and delivery status',
    category: 'OPERATIONS',
    requiredCapabilities: ['DELIVERY_TRACKING'],
    supportedDesignations: [],
    dependencies: [],
    riskLevel: 'LOW',
    requiresVerification: false,
    active: true,
    actions: [ACTION_PERMISSIONS.DELIVERY_VIEW]
  },
  {
    id: 'team_oversight',
    name: 'Team workflow oversight',
    description: 'Coordinate daily task assignments and shift activity summaries',
    category: 'MANAGEMENT',
    requiredCapabilities: ['TEAM_SUPERVISION'],
    supportedDesignations: ['FACILITY_MANAGER'],
    dependencies: [],
    riskLevel: 'MEDIUM',
    requiresVerification: false,
    active: true,
    actions: [ACTION_PERMISSIONS.USER_MANAGE] // Subject to privileged gating
  }
];

export const MODULE_MAP = new Map(WORKSPACE_MODULE_REGISTRY.map(m => [m.id, m]));

/**
 * Resolves the complete set of unlocked modules and granular action permissions
 * based on confirmed capabilities, confirmed designations, and user credentials.
 *
 * @param {Object} params
 * @param {Array<string>} params.capabilities - Normalized capability IDs
 * @param {Array<string>} params.designations - Confirmed designation IDs
 * @param {boolean} params.isSystemAdmin - Whether user has cryptographic admin delegation
 * @returns {Object} Resolved modules, permissions, and explainable justifications
 */
export const resolvePermissionsAndModules = ({
  capabilities = [],
  designations = [],
  isSystemAdmin = false
} = {}) => {
  const migrated = migrateLegacyCapabilities(capabilities);
  const effectiveCapabilities = Array.from(new Set([...capabilities, ...migrated.capabilities]));
  const capsSet = new Set(effectiveCapabilities);
  const desigsSet = new Set(designations);

  const unlockedModulesSet = new Set();
  const unlockedActionsSet = new Set();
  const moduleJustifications = {};

  // Always grant baseline traceability read
  unlockedModulesSet.add('traceability_journeys');
  unlockedActionsSet.add(ACTION_PERMISSIONS.TRACEABILITY_VIEW);
  moduleJustifications['traceability_journeys'] = 'Standard verified read access to HoneyChain public ledger';

  // Evaluate each module in the registry
  WORKSPACE_MODULE_REGISTRY.forEach(module => {
    // SECURITY INVARIANT:
    // A module is unlocked ONLY if:
    // 1) It has no requirements (universal read-only access, e.g. baseline traceability read), OR
    // 2) The user holds ALL of its required capabilities.
    //
    // NOTE: module.supportedDesignations is DOCUMENTATION ONLY.
    // It describes which designations may use this module IF they have the capabilities.
    // It does NOT independently authorize module access. Removing it from the gate is intentional.
    //
    // FAIL-CLOSED: missing/unknown capabilities → module DENIED.
    const hasCapabilitySupport = module.requiredCapabilities.length > 0 &&
      module.requiredCapabilities.every(c => capsSet.has(c)); // ALL required caps must be held

    const isUniversal = module.requiredCapabilities.length === 0 &&
      module.supportedDesignations.length === 0;

    if (hasCapabilitySupport || isUniversal) {
      unlockedModulesSet.add(module.id);

      // Record explainable justification
      const matchedCap = module.requiredCapabilities.find(c => capsSet.has(c));

      if (matchedCap) {
        moduleJustifications[module.id] = `Unlocked by declared capability: ${CAPABILITY_MAP.get(matchedCap)?.name || matchedCap}.`;
      } else {
        moduleJustifications[module.id] = 'Standard read access for all verified users.';
      }

      // Add actions associated with module
      module.actions.forEach(action => {
        // Enforce Privileged Actions Boundary
        if (PRIVILEGED_ACTIONS.has(action)) {
          if (isSystemAdmin) {
            unlockedActionsSet.add(action);
          }
          // Non-admin onboarding never self-grants privileged action permissions
        } else {
          unlockedActionsSet.add(action);
        }
      });
    }
  });

  // Elevated System Administrator override: possess all privileged governance actions
  if (isSystemAdmin) {
    PRIVILEGED_ACTIONS.forEach(action => unlockedActionsSet.add(action));
  }

  // Group resolved modules by human category
  const resolvedModules = Array.from(unlockedModulesSet)
    .map(id => MODULE_MAP.get(id))
    .filter(Boolean);

  const groupedModules = {};
  resolvedModules.forEach(mod => {
    if (!groupedModules[mod.category]) {
      groupedModules[mod.category] = [];
    }
    groupedModules[mod.category].push(mod);
  });

  return {
    moduleIds: Array.from(unlockedModulesSet),
    resolvedModules,
    groupedModules,
    permissionIds: Array.from(unlockedActionsSet),
    moduleJustifications,
    privilegedActionsGranted: isSystemAdmin,
    resolvedAt: new Date().toISOString()
  };
};

export const resolveCanonicalPermissionsAndModules = ({
  confirmedCapabilities = [],
  verifiedCapabilities = [],
  isSystemAdmin = false
} = {}) => {
  const validation = CapabilityRegistry.validateCapabilities(confirmedCapabilities);
  const graph = CapabilityRegistry.resolveCapabilityDependencies(validation.valid);
  const verifiedSet = new Set(verifiedCapabilities.filter(id => CANONICAL_CAPABILITY_MAP.has(id)));
  const verificationPending = graph.resolved.filter(id => {
    const capability = CANONICAL_CAPABILITY_MAP.get(id);
    return capability?.verificationRequired && !verifiedSet.has(id);
  });
  const rejectedCapabilities = graph.resolved.filter(id => {
    const capabilityClass = CANONICAL_CAPABILITY_MAP.get(id)?.capabilityClass;
    return ['SYSTEM_ONLY', 'PRIVILEGED'].includes(capabilityClass) && !isSystemAdmin;
  });
  const denied = new Set([...verificationPending, ...rejectedCapabilities]);
  const authorizedCapabilities = graph.resolved.filter(id => !denied.has(id));
  const accessProfile = resolvePermissionsAndModules({
    capabilities: authorizedCapabilities,
    designations: [],
    isSystemAdmin
  });

  return {
    ...accessProfile,
    confirmedCapabilities: graph.explicit,
    effectiveCapabilities: authorizedCapabilities,
    verificationPending,
    rejectedCapabilities,
    unknownCapabilities: Array.from(new Set([...validation.unknown, ...graph.unknown]))
  };
};

const ACTION_ALIASES = {
  QUALITY_CHECK_VIEW: ['QUALITY_VIEW', 'QUALITY_CHECK_VIEW'],
  QUALITY_RESULT_CREATE: ['QUALITY_RECORD', 'QUALITY_RESULT_CREATE'],
  QUALITY_REVIEW: ['QUALITY_APPROVE', 'LAB_REPORT_CERTIFY', 'QUALITY_REVIEW'],
  QUALITY_DECISION: ['QUALITY_APPROVE', 'LAB_REPORT_CERTIFY', 'QUALITY_DECISION'],
  BATCH_VERIFY: ['BATCH_VERIFY', 'LEDGER_AUDIT'],
  VERIFICATION_VIEW: ['VERIFICATION_VIEW'],
  VERIFICATION_REVIEW: ['VERIFICATION_REVIEW', 'LEDGER_AUDIT', 'BATCH_VERIFY'],
  COLLECTION_CREATE: ['COLLECTION_CREATE'],
  COLLECTION_VIEW: ['COLLECTION_VIEW'],
  PROCESSING_CREATE: ['PROCESSING_CREATE'],
  PROCESSING_VIEW: ['PROCESSING_VIEW'],
  HIVE_CREATE: ['HIVE_CREATE', 'HIVE_INSPECT', 'HIVE_VIEW'],
  HIVE_INSPECT: ['HIVE_INSPECT', 'HIVE_VIEW'],
  HIVE_VIEW: ['HIVE_VIEW'],
  HEALTH_SCAN_CREATE: ['HEALTH_SCAN_CREATE', 'HIVE_PHOTO_CAPTURE'],
  HEALTH_SCAN_VIEW: ['HEALTH_SCAN_VIEW', 'HIVE_VIEW'],
  PACKAGING_VIEW: ['PACKAGING_VIEW', 'PACKAGE_VIEW'],
  PACKAGE_CREATE: ['PACKAGE_CREATE'],
  LABEL_CREATE: ['LABEL_CREATE'],
  DISTRIBUTION_VIEW: ['DISTRIBUTION_VIEW', 'INVENTORY_VIEW'],
  SHIPMENT_CREATE: ['SHIPMENT_CREATE', 'SHIPMENT_DISPATCH'],
  CERTIFICATE_GENERATION: ['LAB_REPORT_CERTIFY', 'REPORT_GENERATION'],
  PACKAGE_QR_VALIDATE: ['PACKAGE_VIEW', 'PUBLIC_QR_VIEW', 'SHIPMENT_DISPATCH']
};

/**
 * Checks if a specific action permission is granted in the given access profile.
 *
 * @param {Object} accessProfile
 * @param {string} actionId
 * @returns {boolean}
 */
export const canPerformAction = (accessProfile, actionId) => {
  if (!accessProfile || !Array.isArray(accessProfile.permissionIds)) {
    return false;
  }
  if (accessProfile.permissionIds.includes(actionId)) {
    return true;
  }
  const aliases = ACTION_ALIASES[actionId];
  if (aliases && aliases.some(alias => accessProfile.permissionIds.includes(alias))) {
    return true;
  }
  return false;
};

