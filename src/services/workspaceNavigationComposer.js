/**
 * HoneyChain Workspace Navigation Composer & Navigation Priority Engine
 *
 * Replaces static 4-tab navigation with dynamic, capability-composed navigation items.
 * Navigation is composed directly from active capabilities and workflow state urgency.
 */

import { CapabilityRegistry } from './capabilityRegistry.js';

/**
 * Standard Available Navigation Items
 */
export const NAVIGATION_ITEM_CATALOG = {
  HOME: {
    id: 'home',
    label: 'Home',
    iconName: 'Home',
    priority: 100,
    requiredCapabilities: []
  },
  HIVES: {
    id: 'hives',
    label: 'Hives',
    iconName: 'Layers',
    priority: 90,
    requiredCapabilities: ['HIVE_MANAGEMENT', 'HIVE_INSPECTION']
  },
  INSPECTIONS: {
    id: 'inspections',
    label: 'Inspections',
    iconName: 'ClipboardCheck',
    priority: 85,
    requiredCapabilities: ['HIVE_INSPECTION', 'BEE_HEALTH_SCAN']
  },
  HEALTH: {
    id: 'health',
    label: 'Health',
    iconName: 'Activity',
    priority: 80,
    requiredCapabilities: ['BEE_HEALTH_SCAN']
  },
  HONEY: {
    id: 'honey',
    label: 'Honey',
    iconName: 'Droplet',
    priority: 75,
    requiredCapabilities: ['HONEY_COLLECTION', 'COLLECTION_BATCH_LINK']
  },
  HARVEST: {
    id: 'harvest',
    label: 'Harvest',
    iconName: 'Droplet',
    priority: 80,
    requiredCapabilities: ['HONEY_COLLECTION']
  },
  JOURNEY: {
    id: 'journey',
    label: 'Journey',
    iconName: 'Compass',
    priority: 75,
    requiredCapabilities: ['HONEY_COLLECTION', 'BATCH_TRACEABILITY']
  },
  INTAKE: {
    id: 'intake',
    label: 'Intake',
    iconName: 'MessageSquare',
    priority: 89,
    requiredCapabilities: ['PROCESSING_MANAGEMENT', 'BATCH_INTAKE']
  },
  PROCESSING: {
    id: 'processing',
    label: 'Processing',
    iconName: 'Cpu',
    priority: 88,
    requiredCapabilities: ['PROCESSING_MANAGEMENT', 'PROCESSING_STEP_RECORD']
  },
  BATCHES: {
    id: 'batches',
    label: 'Batches',
    iconName: 'Workflow',
    priority: 86,
    requiredCapabilities: ['PROCESSING_MANAGEMENT', 'BATCH_TRACEABILITY']
  },
  HISTORY: {
    id: 'history',
    label: 'History',
    iconName: 'Activity',
    priority: 82,
    requiredCapabilities: ['PROCESSING_MANAGEMENT']
  },
  SAMPLES: {
    id: 'samples',
    label: 'Samples',
    iconName: 'FlaskConical',
    priority: 92,
    requiredCapabilities: ['SAMPLE_INTAKE', 'LAB_WORKSPACE']
  },
  TESTS: {
    id: 'tests',
    label: 'Tests',
    iconName: 'TestTube',
    priority: 87,
    requiredCapabilities: ['TEST_EXECUTION', 'TEST_ASSIGNMENT']
  },
  REVIEW: {
    id: 'review',
    label: 'Review',
    iconName: 'ShieldCheck',
    priority: 84,
    requiredCapabilities: ['RESULT_REVIEW', 'QUALITY_RECOMMENDATION']
  },
  DISPATCH: {
    id: 'dispatch',
    label: 'Dispatch',
    iconName: 'Package',
    priority: 92,
    requiredCapabilities: ['DISPATCH_PLANNING', 'SHIPMENT_CREATE', 'DISTRIBUTION_WORKSPACE', 'PACKAGE_QR_VALIDATE']
  },
  SHIPMENTS: {
    id: 'shipments',
    label: 'Shipments',
    iconName: 'PackageCheck',
    priority: 88,
    requiredCapabilities: ['SHIPMENT_CREATE', 'DISTRIBUTION_WORKSPACE', 'DISPATCH_PLANNING']
  },
  ROUTES: {
    id: 'routes',
    label: 'Routes',
    iconName: 'MapPin',
    priority: 86,
    requiredCapabilities: ['ROUTE_PLANNING', 'MULTI_STOP_DISPATCH']
  },
  ORDERS: {
    id: 'orders',
    label: 'Orders',
    iconName: 'ShoppingBag',
    priority: 83,
    requiredCapabilities: ['DISPATCH_PLANNING']
  },
  DELIVERIES: {
    id: 'deliveries',
    label: 'Deliveries',
    iconName: 'Truck',
    priority: 88,
    requiredCapabilities: ['DELIVERY_TRACKING', 'DELIVERY_CONFIRMATION', 'PROOF_OF_DELIVERY']
  },
  TRACEABILITY: {
    id: 'traceability',
    label: 'Trace',
    iconName: 'QrCode',
    priority: 70,
    requiredCapabilities: ['BATCH_TRACEABILITY', 'PUBLIC_VERIFICATION_VIEW']
  },
  MORE: {
    id: 'more',
    label: 'More',
    iconName: 'MoreHorizontal',
    priority: 10,
    requiredCapabilities: []
  }
};

/**
 * Composes dynamic navigation items based on active capabilities, primary designation,
 * and current operational queue data.
 *
 * @param {Array<string>} capabilities - List of active capability IDs
 * @param {string} primaryDesignation - Primary user designation
 * @param {Object} operationalData - Real operational state for urgent priority boosts
 * @returns {Array<Object>} List of 4-5 composed navigation tabs
 */
export function composeNavigation(capabilities = [], primaryDesignation = 'BEEKEEPER', operationalData = {}) {
  const capSet = new Set(capabilities || []);
  const desig = (primaryDesignation || '').toUpperCase();

  const candidateItems = [];

  // Home is always included
  candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.HOME, effectivePriority: 100 });

  // SECURITY: Navigation tabs are composed ONLY from capabilities.
  // Designation strings are NEVER used as navigation grants.
  // If a user's session has a designation but no matching capabilities,
  // they do NOT get that domain's navigation tab.
  // Fail-closed: missing capability → tab not shown.

  // Evaluate Beekeeper domain — capability-only
  const hasHives = capSet.has('HIVE_MANAGEMENT') || capSet.has('HIVE_INSPECTION');
  const hasInspections = capSet.has('HIVE_INSPECTION') || capSet.has('BEE_HEALTH_SCAN');
  const hasHealthOnly = capSet.has('BEE_HEALTH_SCAN') && !hasHives;
  const hasHoney = capSet.has('HONEY_COLLECTION') || capSet.has('COLLECTION_BATCH_LINK');

  // Evaluate Processing domain — capability-only
  const hasProcessing = capSet.has('PROCESSING_MANAGEMENT') || capSet.has('PROCESSING_STEP_RECORD');

  // Evaluate Lab domain — capability-only
  const hasLab = capSet.has('LAB_WORKSPACE') || capSet.has('SAMPLE_INTAKE');
  const hasTests = capSet.has('TEST_EXECUTION') || capSet.has('TEST_ASSIGNMENT');
  const hasReview = capSet.has('RESULT_REVIEW') || capSet.has('QUALITY_RECOMMENDATION');

  // Evaluate Dispatch / Distributor domain — capability-only
  const hasDispatch = capSet.has('DISTRIBUTION_WORKSPACE') || capSet.has('DISPATCH_PLANNING') || capSet.has('SHIPMENT_CREATE') || capSet.has('PACKAGE_QR_VALIDATE');
  const hasRoutes = capSet.has('ROUTE_PLANNING') || capSet.has('MULTI_STOP_DISPATCH');
  const hasDeliveries = capSet.has('DELIVERY_TRACKING') || capSet.has('DELIVERY_CONFIRMATION') || capSet.has('PROOF_OF_DELIVERY');

  // Multi-domain vs single domain synthesis
  // Route to navigation set based on primary designation first, validated against capabilities:
  const isLabRole = (desig === 'LAB_SPECIALIST' || desig === 'LAB') && hasLab;
  const isProcessorRole = (desig === 'PROCESSOR') && hasProcessing;
  const isDispatchRole = (desig === 'DISTRIBUTOR' || desig === 'DISPATCH') && hasDispatch;
  const isBeekeeperRole = (desig === 'BEEKEEPER') && (hasHives || hasHoney);

  if (isLabRole) {
    candidateItems.push({
      ...NAVIGATION_ITEM_CATALOG.SAMPLES,
      effectivePriority: 90,
      badge: operationalData.pendingSamplesCount > 0 ? operationalData.pendingSamplesCount : null
    });
    if (hasTests) {
      candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.TESTS, effectivePriority: 85 });
    }
    if (hasReview) {
      candidateItems.push({
        ...NAVIGATION_ITEM_CATALOG.REVIEW,
        effectivePriority: 80,
        badge: operationalData.pendingReviewCount > 0 ? operationalData.pendingReviewCount : null
      });
    }
  } else if (isProcessorRole) {
    candidateItems.push({
      ...NAVIGATION_ITEM_CATALOG.INTAKE,
      effectivePriority: 92,
      badge: operationalData.pendingIntakeCount > 0 ? operationalData.pendingIntakeCount : null
    });
    candidateItems.push({
      ...NAVIGATION_ITEM_CATALOG.PROCESSING,
      effectivePriority: 88,
      badge: operationalData.activeBatchesCount > 0 ? operationalData.activeBatchesCount : null
    });
    candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.BATCHES, effectivePriority: 86 });
    candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.HISTORY, effectivePriority: 82 });
  } else if (isDispatchRole) {
    candidateItems.push({
      ...NAVIGATION_ITEM_CATALOG.DISPATCH,
      label: 'Ready to Ship',
      effectivePriority: 92,
      badge: operationalData.pendingPackagesCount > 0 ? operationalData.pendingPackagesCount : null
    });
    candidateItems.push({
      ...NAVIGATION_ITEM_CATALOG.SHIPMENTS,
      label: 'Shipments',
      effectivePriority: 88,
      badge: operationalData.pendingShipmentsCount > 0 ? operationalData.pendingShipmentsCount : null
    });
    if (hasDeliveries) {
      const urgentBoost = (operationalData.deliveryExceptionsCount > 0 || operationalData.activeDeliveriesCount > 0) ? 95 : 84;
      candidateItems.push({
        ...NAVIGATION_ITEM_CATALOG.DELIVERIES,
        label: 'Tracking',
        effectivePriority: urgentBoost,
        badge: operationalData.deliveryExceptionsCount > 0 ? '!' : null
      });
    } else if (hasRoutes) {
      candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.ROUTES, effectivePriority: 85 });
    }
  } else if (isBeekeeperRole) {
    if (hasHives) candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.HIVES, effectivePriority: 90 });
    if (hasInspections) candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.INSPECTIONS, effectivePriority: 85 });
    if (hasHoney) {
      candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.HARVEST, effectivePriority: 80 });
      candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.JOURNEY, effectivePriority: 75 });
    }
  } else {
    // Capability-based fallback
    if (hasLab) {
      candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.SAMPLES, effectivePriority: 90 });
      if (hasTests) candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.TESTS, effectivePriority: 85 });
      if (hasReview) candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.REVIEW, effectivePriority: 80 });
    } else if (hasProcessing) {
      candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.INTAKE, effectivePriority: 92 });
      candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.PROCESSING, effectivePriority: 88 });
      candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.BATCHES, effectivePriority: 86 });
      candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.HISTORY, effectivePriority: 82 });
    } else if (hasDispatch) {
      candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.DISPATCH, effectivePriority: 92 });
      candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.SHIPMENTS, effectivePriority: 88 });
      if (hasDeliveries) candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.DELIVERIES, effectivePriority: 84 });
    } else {
      if (hasHives) candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.HIVES, effectivePriority: 90 });
      if (hasInspections) candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.INSPECTIONS, effectivePriority: 85 });
      if (hasHoney) {
        candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.HARVEST, effectivePriority: 80 });
        candidateItems.push({ ...NAVIGATION_ITEM_CATALOG.JOURNEY, effectivePriority: 75 });
      }
    }
  }

  // Sort candidate middle items by effective priority (descending)
  const middleItems = candidateItems
    .filter(item => item.id !== 'home')
    .sort((a, b) => b.effectivePriority - a.effectivePriority);

  // Take top 3-4 middle items
  const isPureBeekeeper = isBeekeeperRole || (hasHives && hasInspections && hasHoney && !hasProcessing && !hasLab && !hasDispatch);
  const isPureProcessor = isProcessorRole || (hasProcessing && !hasHives && !hasLab && !hasDispatch);
  const isPureLab = isLabRole || (hasLab && !hasHives && !hasProcessing && !hasDispatch);
  const isPureDistributor = isDispatchRole || (hasDispatch && !hasHives && !hasLab && !hasProcessing);
  const maxMiddle = (isPureBeekeeper || isPureProcessor || isPureLab || isPureDistributor) ? 4 : 3;
  const selectedMiddle = middleItems.slice(0, maxMiddle);

  // Re-sort selected middle items naturally: e.g. Hives -> Inspections -> Harvest -> Journey OR Intake -> Processing -> Batches -> History
  const sortOrder = ['hives', 'inspections', 'harvest', 'journey', 'intake', 'processing', 'batches', 'history', 'honey', 'samples', 'tests', 'review', 'dispatch', 'shipments', 'routes', 'orders', 'deliveries'];
  selectedMiddle.sort((a, b) => {
    const idxA = sortOrder.indexOf(a.id);
    const idxB = sortOrder.indexOf(b.id);
    return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
  });

  const effectiveMiddle = selectedMiddle.length > 0 ? selectedMiddle : [
    NAVIGATION_ITEM_CATALOG.HIVES,
    NAVIGATION_ITEM_CATALOG.HONEY
  ];

  const composed = [
    candidateItems[0], // Home
    ...effectiveMiddle,
    NAVIGATION_ITEM_CATALOG.MORE // More
  ];

  return composed;
}

export const WorkspaceNavigationComposer = {
  composeNavigation,
  NAVIGATION_ITEM_CATALOG
};
