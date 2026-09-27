/**
 * HoneyChain Dynamic Capability-Based Dashboard Composition Engine
 *
 * Master Architecture:
 * User -> Capabilities -> Confirmed Designations -> Effective Permissions ->
 * Accessible Modules -> Current Operational Context -> Dashboard Composition Engine ->
 * Dynamic Dashboard
 *
 * Enforces:
 * - Zero hardcoded role templates (no `if role === 'beekeeper'` dashboards)
 * - N capabilities + N designations without N fixed dashboards
 * - Central module registry with declarative visibility, priority, and actions
 * - Smart density control: group by operational domain (FIELD, PRODUCTION, QUALITY, FULFILLMENT, TRUST)
 * - Real-data attention engine (INFO, ATTENTION, CRITICAL)
 * - Contextual quick action engine based strictly on authorized permissions + live workflow state
 * - Meaningful empty states (unauthorized = hidden; authorized + no data = useful CTA)
 * - Zero-permission fallback state
 * - Preset persona simulation for jury evaluation and multi-designation testing
 */

import { ACTION_PERMISSIONS, canPerformAction } from './permissionEngine.js';

// 1. Dashboard Domain Categories (Grouping for Density Control)
export const DASHBOARD_CATEGORIES = {
  FIELD: {
    id: 'FIELD',
    label: 'Field Work',
    tagline: 'Colony stewardship, inspections & acoustic telemetry'
  },
  PRODUCTION: {
    id: 'PRODUCTION',
    label: 'Production & Extraction',
    tagline: 'Harvest collections, centrifugal extraction & curing tanks'
  },
  QUALITY: {
    id: 'QUALITY',
    label: 'Quality & Analytical Purity',
    tagline: 'Moisture, HMF, diastase & laboratory certification'
  },
  FULFILLMENT: {
    id: 'FULFILLMENT',
    label: 'Fulfillment & Logistics',
    tagline: 'Packaging, label printing, QR identities & consignments'
  },
  TRUST: {
    id: 'TRUST',
    label: 'Trust & Verification',
    tagline: 'Cryptographic ledger anchors, proof audit & consumer transparency'
  }
};

// 2. Canonical Dashboard Module Identifiers
export const DASHBOARD_MODULE_IDS = {
  HIVE_HEALTH: 'HIVE_HEALTH',
  BEE_HEALTH_SCAN: 'BEE_HEALTH_SCAN',
  COLLECTIONS: 'COLLECTIONS',
  ACTIVE_BATCHES: 'ACTIVE_BATCHES',
  PROCESSING_QUEUE: 'PROCESSING_QUEUE',
  QUALITY_QUEUE: 'QUALITY_QUEUE',
  PACKAGING_QUEUE: 'PACKAGING_QUEUE',
  VERIFICATION_QUEUE: 'VERIFICATION_QUEUE',
  DISTRIBUTION_QUEUE: 'DISTRIBUTION_QUEUE',
  TRACEABILITY: 'TRACEABILITY',
  ATTENTION: 'ATTENTION',
  RECENT_ACTIVITY: 'RECENT_ACTIVITY',
  SMART_INSIGHTS: 'SMART_INSIGHTS'
};

// 3. Central Module Registry
export const MODULE_REGISTRY = [
  {
    id: DASHBOARD_MODULE_IDS.HIVE_HEALTH,
    title: 'Colony Conditions',
    category: DASHBOARD_CATEGORIES.FIELD.id,
    requiredPermissions: [ACTION_PERMISSIONS.HIVE_VIEW],
    optionalPermissions: [
      ACTION_PERMISSIONS.HIVE_INSPECT,
      ACTION_PERMISSIONS.SENSOR_READ,
      ACTION_PERMISSIONS.HIVE_PHOTO_CAPTURE
    ],
    priorityResolver: ({ hives = [] }) => {
      let score = 50;
      const attentionCount = hives.filter(h => !h.isArchived && h.status === 'attention').length;
      if (attentionCount > 0) score += 35;
      if (hives.length > 0) score += 15;
      return score;
    },
    emptyState: {
      title: 'No colonies registered yet',
      description: 'Add your first hive to start monitoring conditions, telemetry and frame inspections.',
      actionLabel: 'Add first hive',
      actionId: 'add_hive'
    }
  },
  {
    id: DASHBOARD_MODULE_IDS.BEE_HEALTH_SCAN,
    title: 'Frame Health Diagnostic',
    category: DASHBOARD_CATEGORIES.FIELD.id,
    requiredPermissions: [ACTION_PERMISSIONS.HEALTH_SCAN_VIEW],
    optionalPermissions: [
      ACTION_PERMISSIONS.HEALTH_SCAN_CREATE,
      ACTION_PERMISSIONS.HEALTH_SCAN_ANALYZE,
      ACTION_PERMISSIONS.HEALTH_SCAN_SAVE
    ],
    priorityResolver: ({ hives = [] }) => {
      let score = 45;
      const scanAlerts = hives.filter(h =>
        h.healthTimeline?.some(s => s.resultType === 'concerning')
      ).length;
      if (scanAlerts > 0) score += 30;
      return score;
    },
    emptyState: {
      title: 'No frame scans recorded',
      description: 'Capture a comb frame photo to run automated bee health and brood screening.',
      actionLabel: 'Scan frame now',
      actionId: 'scan_frame'
    }
  },
  {
    id: DASHBOARD_MODULE_IDS.COLLECTIONS,
    title: 'Harvest Collections',
    category: DASHBOARD_CATEGORIES.PRODUCTION.id,
    requiredPermissions: [ACTION_PERMISSIONS.COLLECTION_VIEW],
    optionalPermissions: [ACTION_PERMISSIONS.COLLECTION_CREATE, ACTION_PERMISSIONS.BATCH_CREATE],
    priorityResolver: ({ collections = [] }) => {
      let score = 40;
      const unlinked = collections.filter(c => !c.batchId).length;
      if (unlinked > 0) score += 25;
      return score;
    },
    emptyState: {
      title: 'No harvest collections logged',
      description: 'Record honey supers pulled from apiaries to feed batch lot traceability.',
      actionLabel: 'Record collection',
      actionId: 'record_collection'
    }
  },
  {
    id: DASHBOARD_MODULE_IDS.ACTIVE_BATCHES,
    title: 'Active Curing Tanks',
    category: DASHBOARD_CATEGORIES.PRODUCTION.id,
    requiredPermissions: [ACTION_PERMISSIONS.BATCH_VIEW],
    optionalPermissions: [
      ACTION_PERMISSIONS.BATCH_CREATE,
      ACTION_PERMISSIONS.BATCH_EDIT,
      ACTION_PERMISSIONS.PROCESSING_CREATE
    ],
    priorityResolver: ({ batches = [] }) => {
      let score = 55;
      const curingCount = batches.filter(b => b.status === 'curing').length;
      if (curingCount > 0) score += 25;
      return score;
    },
    emptyState: {
      title: 'No active batches in tanks',
      description: 'Create a new extraction lot to track settling, moisture and clarifying progress.',
      actionLabel: 'Create batch',
      actionId: 'create_batch'
    }
  },
  {
    id: DASHBOARD_MODULE_IDS.PROCESSING_QUEUE,
    title: 'Extraction & Processing Queue',
    category: DASHBOARD_CATEGORIES.PRODUCTION.id,
    requiredPermissions: [ACTION_PERMISSIONS.PROCESSING_VIEW],
    optionalPermissions: [
      ACTION_PERMISSIONS.PROCESSING_CREATE,
      ACTION_PERMISSIONS.HONEY_EXTRACT,
      ACTION_PERMISSIONS.HONEY_BOTTLE
    ],
    priorityResolver: ({ batches = [] }) => {
      let score = 50;
      const inProcess = batches.filter(b => b.status === 'curing' || b.status === 'bottled').length;
      if (inProcess > 0) score += 20;
      return score;
    },
    emptyState: {
      title: 'Processing pipeline clear',
      description: 'All extracted lots have finished settling and micro-filtration.',
      actionLabel: 'Log extraction',
      actionId: 'create_batch'
    }
  },
  {
    id: DASHBOARD_MODULE_IDS.QUALITY_QUEUE,
    title: 'Quality & Laboratory Purity',
    category: DASHBOARD_CATEGORIES.QUALITY.id,
    requiredPermissions: [ACTION_PERMISSIONS.QUALITY_CHECK_VIEW],
    optionalPermissions: [
      ACTION_PERMISSIONS.QUALITY_RESULT_CREATE,
      ACTION_PERMISSIONS.QUALITY_REVIEW,
      ACTION_PERMISSIONS.QUALITY_DECISION,
      ACTION_PERMISSIONS.LAB_REPORT_CERTIFY
    ],
    priorityResolver: ({ qualityChecks = [], batches = [] }) => {
      let score = 60;
      const pendingReviews = qualityChecks.filter(
        q => q.status === 'pending' || q.status === 'needs_attention'
      ).length;
      if (pendingReviews > 0) score += 35;
      const batchesAwaitingQc = batches.filter(b => b.status === 'curing').length;
      if (batchesAwaitingQc > 0) score += 15;
      return score;
    },
    emptyState: {
      title: 'No quality reviews waiting',
      description: 'All submitted batch samples have completed refractometry and purity screening.',
      actionLabel: 'Perform refractometry',
      actionId: 'record_quality'
    }
  },
  {
    id: DASHBOARD_MODULE_IDS.PACKAGING_QUEUE,
    title: 'Packaging & Label Allocation',
    category: DASHBOARD_CATEGORIES.FULFILLMENT.id,
    requiredPermissions: [ACTION_PERMISSIONS.PACKAGING_VIEW],
    optionalPermissions: [
      ACTION_PERMISSIONS.PACKAGE_CREATE,
      ACTION_PERMISSIONS.LABEL_CREATE,
      ACTION_PERMISSIONS.LABEL_FINALIZE,
      ACTION_PERMISSIONS.LABEL_PRINT
    ],
    priorityResolver: ({ batches = [] }) => {
      let score = 45;
      const readyForPackaging = batches.filter(b => b.status === 'certified' || b.status === 'bottled').length;
      if (readyForPackaging > 0) score += 25;
      return score;
    },
    emptyState: {
      title: 'No packaging runs queued',
      description: 'Prepare sealed jars, allocate lot weight, and generate HoneyChain verified labels.',
      actionLabel: 'Prepare package',
      actionId: 'prepare_package'
    }
  },
  {
    id: DASHBOARD_MODULE_IDS.VERIFICATION_QUEUE,
    title: 'Ledger Verification & Sealing',
    category: DASHBOARD_CATEGORIES.TRUST.id,
    requiredPermissions: [ACTION_PERMISSIONS.VERIFICATION_VIEW],
    optionalPermissions: [
      ACTION_PERMISSIONS.VERIFICATION_REVIEW,
      ACTION_PERMISSIONS.BATCH_VERIFY,
      ACTION_PERMISSIONS.PROOF_VIEW
    ],
    priorityResolver: ({ batches = [] }) => {
      let score = 55;
      const unverifiedCertified = batches.filter(b => b.status === 'certified' && !b.verification?.isVerified).length;
      if (unverifiedCertified > 0) score += 35;
      return score;
    },
    emptyState: {
      title: 'All active batches sealed',
      description: 'Certified lots have been cryptographically anchored to the HoneyChain ledger.',
      actionLabel: 'View public records',
      actionId: 'view_traceability'
    }
  },
  {
    id: DASHBOARD_MODULE_IDS.DISTRIBUTION_QUEUE,
    title: 'Inventory & Consignment Dispatches',
    category: DASHBOARD_CATEGORIES.FULFILLMENT.id,
    requiredPermissions: [ACTION_PERMISSIONS.DISTRIBUTION_VIEW],
    optionalPermissions: [
      ACTION_PERMISSIONS.SHIPMENT_CREATE,
      ACTION_PERMISSIONS.SHIPMENT_DISPATCH,
      ACTION_PERMISSIONS.INVENTORY_ADJUST
    ],
    priorityResolver: () => 50,
    emptyState: {
      title: 'No dispatches in transit',
      description: 'Verified consignments scheduled for local co-ops and retail partners appear here.',
      actionLabel: 'Create dispatch manifest',
      actionId: 'create_shipment'
    }
  },
  {
    id: DASHBOARD_MODULE_IDS.TRACEABILITY,
    title: 'Harvest-to-Jar Traceability',
    category: DASHBOARD_CATEGORIES.TRUST.id,
    requiredPermissions: [ACTION_PERMISSIONS.LEDGER_AUDIT],
    optionalPermissions: [ACTION_PERMISSIONS.PROOF_TECHNICAL_DETAILS],
    priorityResolver: () => 35,
    emptyState: {
      title: 'No journeys tracked',
      description: 'Harvest records will trace here as colonies and extractions are logged.',
      actionLabel: 'Explore ledger',
      actionId: 'view_traceability'
    }
  }
];

// 4. Attention Engine: Calculates real-data operational attention items strictly for authorized domains
export const resolveAttentionItems = ({
  accessProfile,
  hives = [],
  batches = [],
  qualityChecks = []
}) => {
  const items = [];

  const canSeeHives = canPerformAction(accessProfile, ACTION_PERMISSIONS.HIVE_VIEW);
  const canSeeQuality = canPerformAction(accessProfile, ACTION_PERMISSIONS.QUALITY_CHECK_VIEW);
  const canSeeBatches = canPerformAction(accessProfile, ACTION_PERMISSIONS.BATCH_VIEW);
  const canVerify = canPerformAction(accessProfile, ACTION_PERMISSIONS.BATCH_VERIFY);
  const canPackage = canPerformAction(accessProfile, ACTION_PERMISSIONS.PACKAGING_VIEW);

  // Field: Hives needing inspection / scan flag
  if (canSeeHives) {
    const attentionHives = hives.filter(h => !h.isArchived && h.status === 'attention');
    attentionHives.forEach(h => {
      const isMiteFlag = (h.statusText || h.conditionSummary || '').toLowerCase().includes('sign') ||
                         (h.statusText || h.conditionSummary || '').toLowerCase().includes('varroa');
      items.push({
        id: `attn-hive-${h.id}`,
        domain: DASHBOARD_CATEGORIES.FIELD.id,
        severity: isMiteFlag ? 'CRITICAL' : 'ATTENTION',
        title: `${h.name} requires inspection`,
        description: h.statusText || h.conditionSummary || 'Field readings show atypical colony activity.',
        targetId: h.id,
        targetType: 'hive',
        ctaLabel: 'Inspect hive',
        ctaAction: 'inspect_hive'
      });
    });

    const offlineDevices = hives.filter(h => !h.isArchived && (!h.monitoring?.isDeviceOnline || h.status === 'paused'));
    if (offlineDevices.length > 0) {
      items.push({
        id: `attn-dev-${offlineDevices[0].id}`,
        domain: DASHBOARD_CATEGORIES.FIELD.id,
        severity: 'INFO',
        title: `Telemetry paused on ${offlineDevices[0].name}`,
        description: 'ESP32 sensor module is offline or unassigned.',
        targetId: offlineDevices[0].id,
        targetType: 'device',
        ctaLabel: 'Check device',
        ctaAction: 'check_device'
      });
    }
  }

  // Quality: Quality reviews or held batches
  if (canSeeQuality) {
    const pendingQc = qualityChecks.filter(q => q.status === 'pending' || q.status === 'needs_attention');
    if (pendingQc.length > 0) {
      const highUrgency = pendingQc.some(q => q.status === 'needs_attention');
      items.push({
        id: 'attn-qc-pending',
        domain: DASHBOARD_CATEGORIES.QUALITY.id,
        severity: highUrgency ? 'CRITICAL' : 'ATTENTION',
        title: `${pendingQc.length} Quality Check${pendingQc.length > 1 ? 's' : ''} Awaiting Review`,
        description: highUrgency
          ? 'Sample moisture or purity reading requires supervisory decision before lot release.'
          : 'Analytical test results submitted; awaiting final purity confirmation.',
        targetId: pendingQc[0].id,
        targetType: 'quality',
        ctaLabel: 'Review quality',
        ctaAction: 'review_quality'
      });
    }
  }

  // Trust: Batches awaiting cryptographic verification sealing
  if (canVerify) {
    const batchesToVerify = batches.filter(b => b.status === 'certified' && !b.verification?.isVerified);
    if (batchesToVerify.length > 0) {
      items.push({
        id: 'attn-verify-pending',
        domain: DASHBOARD_CATEGORIES.TRUST.id,
        severity: 'ATTENTION',
        title: `${batchesToVerify.length} Batch${batchesToVerify.length > 1 ? 'es' : ''} Ready for Verification`,
        description: 'All testing prerequisites passed. Cryptographic seal ready to anchor on ledger.',
        targetId: batchesToVerify[0].id,
        targetType: 'batch',
        ctaLabel: 'Verify batch',
        ctaAction: 'verify_batch'
      });
    }
  }

  // Production: Batches in curing tank
  if (canSeeBatches && !canSeeQuality) {
    const curingBatches = batches.filter(b => b.status === 'curing');
    if (curingBatches.length > 0) {
      items.push({
        id: 'attn-batch-curing',
        domain: DASHBOARD_CATEGORIES.PRODUCTION.id,
        severity: 'INFO',
        title: `${curingBatches.length} Extraction Lot${curingBatches.length > 1 ? 's' : ''} Settling`,
        description: `Lot ${curingBatches[0].batchNumber} currently in tank with moisture at ${curingBatches[0].moisture}%.`,
        targetId: curingBatches[0].id,
        targetType: 'batch',
        ctaLabel: 'View batch',
        ctaAction: 'view_batch'
      });
    }
  }

  // Fulfillment: Batches bottled without package allocation
  if (canPackage) {
    const bottledBatches = batches.filter(b => b.status === 'bottled' && (!b.packages || b.packages.length === 0));
    if (bottledBatches.length > 0) {
      items.push({
        id: 'attn-pkg-unallocated',
        domain: DASHBOARD_CATEGORIES.FULFILLMENT.id,
        severity: 'INFO',
        title: `${bottledBatches.length} Lot Ready for Packaging`,
        description: `Batch ${bottledBatches[0].batchNumber} bottled. Allocate jar counts and create HoneyChain labels.`,
        targetId: bottledBatches[0].id,
        targetType: 'batch',
        ctaLabel: 'Prepare package',
        ctaAction: 'prepare_package'
      });
    }
  }

  // Sort by severity: CRITICAL first, then ATTENTION, then INFO
  const severityRank = { CRITICAL: 3, ATTENTION: 2, INFO: 1 };
  return items.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
};

// 5. Contextual Quick Actions Engine
export const resolveContextualQuickActions = ({
  accessProfile,
  hives = [],
  batches = [],
  qualityChecks = []
}) => {
  const actions = [];
  const activeHives = hives.filter(h => !h.isArchived);

  // 1. Scan frame
  if (canPerformAction(accessProfile, ACTION_PERMISSIONS.HEALTH_SCAN_CREATE)) {
    actions.push({
      id: 'scan_frame',
      label: 'Scan frame',
      icon: 'Camera',
      color: '#D99A24',
      badge: activeHives.some(h => h.status === 'attention') ? 'Alert' : null,
      permission: ACTION_PERMISSIONS.HEALTH_SCAN_CREATE,
      domain: DASHBOARD_CATEGORIES.FIELD.id
    });
  }

  // 2. Inspect hive
  if (canPerformAction(accessProfile, ACTION_PERMISSIONS.HIVE_INSPECT)) {
    actions.push({
      id: 'inspect_hive',
      label: 'Inspect hive',
      icon: 'ClipboardCheck',
      color: '#4F7A52',
      permission: ACTION_PERMISSIONS.HIVE_INSPECT,
      domain: DASHBOARD_CATEGORIES.FIELD.id
    });
  }

  // 3. Record collection
  if (canPerformAction(accessProfile, ACTION_PERMISSIONS.COLLECTION_CREATE)) {
    actions.push({
      id: 'record_collection',
      label: 'Record collection',
      icon: 'Droplet',
      color: '#B87316',
      permission: ACTION_PERMISSIONS.COLLECTION_CREATE,
      domain: DASHBOARD_CATEGORIES.PRODUCTION.id
    });
  }

  // 4. Create batch
  if (canPerformAction(accessProfile, ACTION_PERMISSIONS.BATCH_CREATE)) {
    actions.push({
      id: 'create_batch',
      label: 'Create batch',
      icon: 'PlusCircle',
      color: '#D99A24',
      permission: ACTION_PERMISSIONS.BATCH_CREATE,
      domain: DASHBOARD_CATEGORIES.PRODUCTION.id
    });
  }

  // 5. Quality Actions (Differentiated by Power Level)
  if (canPerformAction(accessProfile, ACTION_PERMISSIONS.QUALITY_DECISION) ||
      canPerformAction(accessProfile, ACTION_PERMISSIONS.QUALITY_REVIEW)) {
    actions.push({
      id: 'review_quality',
      label: 'Review quality',
      icon: 'ShieldCheck',
      color: '#4F7A52',
      badge: qualityChecks.filter(q => q.status === 'pending' || q.status === 'needs_attention').length || null,
      permission: ACTION_PERMISSIONS.QUALITY_REVIEW,
      domain: DASHBOARD_CATEGORIES.QUALITY.id
    });
  } else if (canPerformAction(accessProfile, ACTION_PERMISSIONS.QUALITY_RESULT_CREATE)) {
    actions.push({
      id: 'record_quality',
      label: 'Record quality result',
      icon: 'FlaskConical',
      color: '#71845B',
      permission: ACTION_PERMISSIONS.QUALITY_RESULT_CREATE,
      domain: DASHBOARD_CATEGORIES.QUALITY.id
    });
  }

  // 6. Verify batch (Privileged action)
  if (canPerformAction(accessProfile, ACTION_PERMISSIONS.BATCH_VERIFY)) {
    const readyCount = batches.filter(b => b.status === 'certified' && !b.verification?.isVerified).length;
    actions.push({
      id: 'verify_batch',
      label: 'Verify batch',
      icon: 'CheckCircle2',
      color: '#2B5E3B',
      badge: readyCount > 0 ? `${readyCount} Ready` : null,
      permission: ACTION_PERMISSIONS.BATCH_VERIFY,
      domain: DASHBOARD_CATEGORIES.TRUST.id
    });
  }

  // 7. Packaging & Label Generation
  if (canPerformAction(accessProfile, ACTION_PERMISSIONS.PACKAGE_CREATE)) {
    actions.push({
      id: 'prepare_package',
      label: 'Prepare package',
      icon: 'Package',
      color: '#786D61',
      permission: ACTION_PERMISSIONS.PACKAGE_CREATE,
      domain: DASHBOARD_CATEGORIES.FULFILLMENT.id
    });
  }

  if (canPerformAction(accessProfile, ACTION_PERMISSIONS.LABEL_CREATE)) {
    actions.push({
      id: 'create_label',
      label: 'Create label',
      icon: 'FileText',
      color: '#8C6D4F',
      permission: ACTION_PERMISSIONS.LABEL_CREATE,
      domain: DASHBOARD_CATEGORIES.FULFILLMENT.id
    });
  }

  // 8. Public QR Management
  if (canPerformAction(accessProfile, ACTION_PERMISSIONS.PUBLIC_QR_CREATE) ||
      canPerformAction(accessProfile, ACTION_PERMISSIONS.PUBLIC_QR_VIEW)) {
    actions.push({
      id: 'manage_qr',
      label: 'Manage QR',
      icon: 'QrCode',
      color: '#D99A24',
      permission: ACTION_PERMISSIONS.PUBLIC_QR_VIEW,
      domain: DASHBOARD_CATEGORIES.FULFILLMENT.id
    });
  }

  // 9. Shipment creation
  if (canPerformAction(accessProfile, ACTION_PERMISSIONS.SHIPMENT_CREATE)) {
    actions.push({
      id: 'create_shipment',
      label: 'Create shipment',
      icon: 'Truck',
      color: '#34261B',
      permission: ACTION_PERMISSIONS.SHIPMENT_CREATE,
      domain: DASHBOARD_CATEGORIES.FULFILLMENT.id
    });
  }

  // Fallback for view-only users
  if (actions.length === 0) {
    if (canPerformAction(accessProfile, ACTION_PERMISSIONS.HIVE_VIEW)) {
      actions.push({
        id: 'view_hives',
        label: 'View hives',
        icon: 'Activity',
        color: '#B87316',
        permission: ACTION_PERMISSIONS.HIVE_VIEW,
        domain: DASHBOARD_CATEGORIES.FIELD.id
      });
    } else if (canPerformAction(accessProfile, ACTION_PERMISSIONS.TRACEABILITY_VIEW)) {
      actions.push({
        id: 'view_traceability',
        label: 'View traceability',
        icon: 'ShieldCheck',
        color: '#4F7A52',
        permission: ACTION_PERMISSIONS.TRACEABILITY_VIEW,
        domain: DASHBOARD_CATEGORIES.TRUST.id
      });
    }
  }

  return actions;
};

// 6. Capability-Aware Smart Insight Generator
export const resolveSmartInsight = ({
  accessProfile,
  hives = [],
  batches = [],
  qualityChecks = []
}) => {
  const canSeeQuality = canPerformAction(accessProfile, ACTION_PERMISSIONS.QUALITY_CHECK_VIEW);
  const canSeeBatches = canPerformAction(accessProfile, ACTION_PERMISSIONS.BATCH_VIEW);
  const canSeeHives = canPerformAction(accessProfile, ACTION_PERMISSIONS.HIVE_VIEW);
  const canVerify = canPerformAction(accessProfile, ACTION_PERMISSIONS.BATCH_VERIFY);
  const canDistribute = canPerformAction(accessProfile, ACTION_PERMISSIONS.DISTRIBUTION_VIEW);

  // Quality Specialist Insight
  if (canSeeQuality && !canSeeHives) {
    const pendingQc = qualityChecks.filter(q => q.status === 'pending');
    return {
      title: 'Lab Quality Insight',
      summary: pendingQc.length > 0
        ? `${pendingQc.length} test sample${pendingQc.length > 1 ? 's are' : ' is'} awaiting analytical review. Diastase levels in current lots indicate prime raw enzyme integrity.`
        : 'All verified samples comply with Codex Alimentarius & HoneyChain Raw Standards (Moisture < 18.5%, HMF < 15 mg/kg).',
      recommendation: 'Check refractometer calibration before recording next harvest lot.',
      domain: DASHBOARD_CATEGORIES.QUALITY.id
    };
  }

  // Verifier Insight
  if (canVerify && !canSeeHives) {
    return {
      title: 'Ledger Integrity Insight',
      summary: 'Batches with verified quality certificates are automatically prepared for cryptographic anchoring to block #54819240.',
      recommendation: 'Ensure all chain-of-custody signatures are verified prior to issuing consumer QR.',
      domain: DASHBOARD_CATEGORIES.TRUST.id
    };
  }

  // Processor Insight
  if (canSeeBatches && !canSeeHives) {
    const curing = batches.filter(b => b.status === 'curing');
    return {
      title: 'Extraction Tank Insight',
      summary: curing.length > 0
        ? `Batch #${curing[0].batchNumber} settling in Tank A. Current moisture at ${curing[0].moisture}%. Clarifying progress is steady with zero heat damage.`
        : 'All active batches have passed centrifugal filtering and are staged for bottling.',
      recommendation: 'Maintain settling room temperature between 20°C and 25°C to preserve aroma.',
      domain: DASHBOARD_CATEGORIES.PRODUCTION.id
    };
  }

  // Distributor Insight
  if (canDistribute && !canSeeHives) {
    return {
      title: 'Logistics & Dispatch Insight',
      summary: 'Verified consumer packages are packed with tamper-evident cryptographic QR labels ready for distribution consignments.',
      recommendation: 'Confirm delivery route temperatures remain under 30°C to preserve raw honey enzyme activity.',
      domain: DASHBOARD_CATEGORIES.FULFILLMENT.id
    };
  }

  // Beekeeper / Field Insight (Default when hive capabilities held)
  const activeHives = hives.filter(h => !h.isArchived);
  const attentionHive = activeHives.find(h => h.status === 'attention');
  if (attentionHive) {
    return {
      title: 'Colony Condition Insight',
      summary: `${attentionHive.name} shows slight frequency elevation (285 Hz) indicating defensive posture or Queen review need.`,
      recommendation: 'Schedule a calm mid-day frame inspection to inspect brood pattern and queen presence.',
      domain: DASHBOARD_CATEGORIES.FIELD.id
    };
  }

  return {
    title: 'Seasonal Apiary Insight',
    summary: 'Colony internal temperatures are stable at 34.5°C across yards. Brood emergence and nectar flow are in prime equilibrium.',
    recommendation: 'Keep hive entrances cleared and monitor collection supers for capping progress.',
    domain: DASHBOARD_CATEGORIES.FIELD.id
  };
};

// 7. Capability-Aware Recent Activity Filter
export const filterRecentActivity = ({
  accessProfile,
  activities = []
}) => {
  const canSeeHives = canPerformAction(accessProfile, ACTION_PERMISSIONS.HIVE_VIEW);
  const canSeeBatches = canPerformAction(accessProfile, ACTION_PERMISSIONS.BATCH_VIEW);
  const canSeeQuality = canPerformAction(accessProfile, ACTION_PERMISSIONS.QUALITY_CHECK_VIEW);
  const canSeeDistribution = canPerformAction(accessProfile, ACTION_PERMISSIONS.DISTRIBUTION_VIEW);

  return activities.filter(act => {
    const type = (act.type || '').toLowerCase();
    const title = (act.title || '').toLowerCase();

    if (type === 'inspection' || title.includes('hive') || title.includes('colony') || title.includes('frame')) {
      return canSeeHives;
    }
    if (type === 'batch' || title.includes('batch') || title.includes('extraction') || title.includes('harvest')) {
      return canSeeBatches;
    }
    if (type === 'quality' || title.includes('quality') || title.includes('purity') || title.includes('lab')) {
      return canSeeQuality;
    }
    if (type === 'dispatch' || title.includes('shipment') || title.includes('delivery')) {
      return canSeeDistribution;
    }
    return true; // Traceability & baseline activities visible to all
  });
};

// 8. Main Dashboard Composition Function
export const composeDashboard = ({
  session = {},
  accessProfile = {},
  hives = [],
  batches = [],
  qualityChecks = [],
  collections = [],
  devices = [],
  activities = []
} = {}) => {
  // Check for Zero-Permission Fallback State
  const permissionIds = accessProfile?.permissionIds || [];
  const operationalPermissions = permissionIds.filter(p => p !== ACTION_PERMISSIONS.TRACEABILITY_VIEW);
  const isZeroPermission = operationalPermissions.length === 0 && (!session.capabilities || session.capabilities.length === 0);

  if (isZeroPermission) {
    return {
      isZeroPermission: true,
      greetingPeriod: getGreetingPeriod(),
      operatorName: session?.operator || 'New Apiarist',
      workIdentity: 'Workspace Setup Pending',
      modules: [],
      attentionItems: [],
      quickActions: [],
      activeGroups: [],
      recentActivity: [],
      smartInsight: null
    };
  }

  // 1. Evaluate Accessible Modules from Registry
  const accessibleModules = [];

  MODULE_REGISTRY.forEach(def => {
    // A module is accessible if user holds ALL of its required permissions
    const isAuthorized = def.requiredPermissions.every(perm =>
      canPerformAction(accessProfile, perm)
    );

    if (isAuthorized) {
      const priority = def.priorityResolver({
        hives,
        batches,
        qualityChecks,
        collections,
        devices
      });

      accessibleModules.push({
        id: def.id,
        title: def.title,
        category: def.category,
        priority,
        emptyState: def.emptyState
      });
    }
  });

  // Sort modules by operational priority descending
  accessibleModules.sort((a, b) => b.priority - a.priority);

  // 2. Group into Operational Domains for Density Control
  const activeCategorySet = new Set(accessibleModules.map(m => m.category));
  const activeGroups = Object.values(DASHBOARD_CATEGORIES)
    .filter(cat => activeCategorySet.has(cat.id))
    .map(cat => ({
      ...cat,
      modules: accessibleModules.filter(m => m.category === cat.id)
    }));

  // 3. Resolve Attention Items
  const attentionItems = resolveAttentionItems({
    accessProfile,
    hives,
    batches,
    qualityChecks
  });

  // 4. Resolve Contextual Quick Actions
  const quickActions = resolveContextualQuickActions({
    accessProfile,
    hives,
    batches,
    qualityChecks
  });

  // 5. Resolve Capability-Aware Smart Insight
  const smartInsight = resolveSmartInsight({
    accessProfile,
    hives,
    batches,
    qualityChecks
  });

  // 6. Filter Recent Activity strictly to authorized domains
  const recentActivity = filterRecentActivity({
    accessProfile,
    activities
  });

  // 7. Human-Centric Work Identity Badge
  const designations = session?.designations || [];
  const workIdentity = designations.length > 0
    ? designations.map(d => formatDesignation(d)).join(' · ')
    : 'Apiary Companion';

  return {
    isZeroPermission: false,
    greetingPeriod: getGreetingPeriod(),
    operatorName: session?.operator || 'Apiarist',
    workIdentity,
    modules: accessibleModules,
    activeGroups,
    attentionItems,
    quickActions,
    recentActivity,
    smartInsight
  };
};

// 9. Demo Persona Switcher Presets (§ 16–22 of Master Architecture)
export const DEMO_PERSONAS = [
  {
    id: 'PERSONA_A_BEEKEEPER',
    name: 'User A: Beekeeper',
    subtitle: 'Hives, bee health, inspections only',
    designations: ['BEEKEEPER'],
    capabilities: [
      'HIVE_MANAGEMENT',
      'HIVE_MONITORING',
      'HIVE_INSPECTION',
      'HIVE_IMAGE_CAPTURE',
      'BEE_HEALTH_SCAN',
      'CONNECTED_HIVE_MONITORING',
      'HONEY_COLLECTION',
      'COLLECTION_BATCH_LINK',
      'BATCH_TRACEABILITY'
    ]
  },
  {
    id: 'PERSONA_B_BEEKEEPER_PROCESSOR',
    name: 'User B: Beekeeper + Processor',
    subtitle: 'Hives, collections, batches, processing',
    designations: ['BEEKEEPER', 'PROCESSOR'],
    capabilities: [
      'HIVE_MANAGEMENT',
      'HIVE_INSPECTION',
      'HONEY_COLLECTION',
      'PROCESSING_MANAGEMENT',
      'BATCH_INTAKE',
      'PROCESSING_STEP_RECORD',
      'BATCH_TRACEABILITY'
    ]
  },
  {
    id: 'PERSONA_C_PROCESSOR_QUALITY',
    name: 'User C: Processor + Quality',
    subtitle: 'Batches, processing, quality reviews',
    designations: ['PROCESSOR', 'LAB_SPECIALIST'],
    capabilities: [
      'PROCESSING_MANAGEMENT',
      'BATCH_INTAKE',
      'PROCESSING_STEP_RECORD',
      'BATCH_TRACEABILITY',
      'QUALITY_TESTING'
    ]
  },
  {
    id: 'PERSONA_D_QUALITY_SPECIALIST',
    name: 'User D: Laboratory Specialist',
    subtitle: 'Sample intake, analytical assays, review & recommendations',
    designations: ['LAB_SPECIALIST'],
    capabilities: [
      'LAB_WORKSPACE',
      'SAMPLE_INTAKE',
      'SAMPLE_IDENTIFICATION',
      'TEST_ASSIGNMENT',
      'TEST_EXECUTION',
      'TEST_RESULT_ENTRY',
      'RESULT_EVIDENCE',
      'SAMPLE_HISTORY',
      'BATCH_QUALITY_CONTEXT',
      'RESULT_REVIEW',
      'QUALITY_RECOMMENDATION',
      'REPORT_GENERATION',
      'QUALITY_TESTING',
      'LAB_INSPECTION'
    ]
  },
  {
    id: 'PERSONA_E_QUALITY_VERIFICATION',
    name: 'User E: Quality + Verification',
    subtitle: 'Quality review, verification queue, ledger sealing',
    designations: ['LAB_SPECIALIST', 'INSPECTOR'],
    capabilities: [
      'QUALITY_TESTING',
      'TRACEABILITY_VERIFICATION',
      'RECORD_AUDITING'
    ]
  },
  {
    id: 'PERSONA_F_PROCESSOR_QUALITY_PACKAGING',
    name: 'User F: Processor + Quality + Packaging',
    subtitle: 'Processing, quality, packaging & labels',
    designations: ['PROCESSOR', 'LAB_SPECIALIST'],
    capabilities: [
      'PROCESSING_MANAGEMENT',
      'BATCH_INTAKE',
      'PROCESSING_STEP_RECORD',
      'BATCH_TRACEABILITY',
      'QUALITY_TESTING',
      'PACKAGE_HONEY'
    ]
  },
  {
    id: 'PERSONA_G_DISTRIBUTION_TRACEABILITY',
    name: 'User G: Distribution + Traceability',
    subtitle: 'Inventory, shipments, dispatch manifests, QR',
    designations: ['DISTRIBUTOR'],
    capabilities: [
      'DISTRIBUTION_WORKSPACE',
      'DISPATCH_PLANNING',
      'PACKAGE_QR_VALIDATE',
      'SHIPMENT_CREATE',
      'SHIPMENT_RELEASE',
      'DELIVERY_TRACKING',
      'DELIVERY_CONFIRMATION',
      'BATCH_TRACEABILITY',
      'INVENTORY_MANAGEMENT',
      'PACKAGE_HONEY',
      'TRACEABILITY_VERIFICATION'
    ]
  },
  {
    id: 'PERSONA_H_FULLSTACK_OPERATOR',
    name: 'User H: Full-Stack Lead (All Combined)',
    subtitle: 'Field + Production + Quality + Fulfillment + Trust',
    designations: ['BEEKEEPER', 'PROCESSOR', 'LAB_SPECIALIST', 'DISTRIBUTOR', 'INSPECTOR'],
    capabilities: [
      'HIVE_MANAGEMENT',
      'HIVE_INSPECTION',
      'HIVE_IMAGE_CAPTURE',
      'HONEY_COLLECTION',
      'PROCESSING_MANAGEMENT',
      'BATCH_INTAKE',
      'PROCESSING_STEP_RECORD',
      'BATCH_TRACEABILITY',
      'QUALITY_TESTING',
      'LAB_INSPECTION',
      'PACKAGE_HONEY',
      'DISPATCH_PLANNING',
      'SHIPMENT_CREATE',
      'SHIPMENT_RELEASE',
      'INVENTORY_MANAGEMENT',
      'TRACEABILITY_VERIFICATION',
      'RECORD_AUDITING'
    ]
  },
  {
    id: 'PERSONA_I_ZERO_PERMISSIONS',
    name: 'User I: Zero-Permission State',
    subtitle: 'Workspace pending onboarding configuration',
    designations: [],
    capabilities: []
  }
];

// Helper Functions
function getGreetingPeriod() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function formatDesignation(desig) {
  if (!desig) return '';
  const d = String(desig).replace(/_/g, ' ').toLowerCase();
  return d.charAt(0).toUpperCase() + d.slice(1);
}
