/**
 * HoneyChain Centralized Route Registry
 *
 * Single Source of Truth for all application routes, canonical paths,
 * component associations, required capabilities, and user intents.
 *
 * Core Principle: ONE USER INTENT → ONE CLEAR DESTINATION
 */

import { CAPABILITY_MAP } from './capabilityRegistry.js';
import { resolveCanonicalPermissionsAndModules } from './permissionEngine.js';
import { migrateLegacyCapabilities } from './capabilityMigration.js';

export const ROUTE_REGISTRY = {
  HOME: {
    id: 'home',
    path: '/home',
    label: 'Home',
    title: 'Operations Overview',
    component: 'HomeView',
    requiredCapabilities: [],
    primaryUser: 'All HoneyChain Operators',
    primaryTask: 'Review urgent attention items, daily progress and smart insights',
    primaryData: 'Attention cards, daily stats, operational queue alerts',
    primaryAction: 'Quick action dispatch',
    category: 'OVERVIEW'
  },
  HIVES: {
    id: 'hives',
    path: '/hives',
    label: 'Hives',
    title: 'Colony & Hive Management',
    component: 'HivesView',
    requiredCapabilities: ['HIVE_MANAGEMENT'],
    primaryUser: 'Beekeeper / Apiarist',
    primaryTask: 'Manage apiary yards, review hive conditions and queen status',
    primaryData: 'Hive list, telemetry sensors, temperament, brood health',
    primaryAction: 'Add Hive / Inspect Hive',
    category: 'FIELD'
  },
  INSPECTIONS: {
    id: 'inspections',
    path: '/inspections',
    label: 'Inspections',
    title: 'Field Inspection Workspace',
    component: 'InspectionsView',
    requiredCapabilities: ['HIVE_INSPECTION'],
    primaryUser: 'Field Inspector / Apiarist',
    primaryTask: 'Perform colony frame inspections, record observations and view health history',
    primaryData: 'Scheduled inspections, recent scans, Varroa/brood findings',
    primaryAction: 'Start Inspection / Scan Frame',
    category: 'FIELD'
  },
  HONEY: {
    id: 'honey',
    path: '/honey',
    label: 'Honey',
    title: 'Harvest & Batch Traceability',
    component: 'HoneyView',
    requiredCapabilities: ['HONEY_COLLECTION'],
    primaryUser: 'Apiary Lead / Honey Handler',
    primaryTask: 'Log super frame harvest collections and review honey batches',
    primaryData: 'Harvest collections, batch status, lot numbers, moisture',
    primaryAction: 'Log Collection / Create Batch',
    category: 'PRODUCTION'
  },
  HARVEST: {
    id: 'harvest',
    path: '/harvest',
    label: 'Harvest',
    title: 'Frame Harvest & Handover',
    component: 'BeekeeperHarvestView',
    requiredCapabilities: ['HONEY_COLLECTION'],
    primaryUser: 'Apiary Lead / Beekeeper',
    primaryTask: 'Harvest ripe super frames and submit honey units for processing',
    primaryData: 'Frame harvest records, floral types, net yield, custody seals',
    primaryAction: 'Record Harvest / Submit to Processor',
    category: 'PRODUCTION'
  },
  JOURNEY: {
    id: 'journey',
    path: '/journey',
    label: 'Journey',
    title: 'My Honey Journey Traceability',
    component: 'HoneyJourneyView',
    requiredCapabilities: ['HONEY_COLLECTION', 'BATCH_TRACEABILITY'],
    primaryUser: 'Beekeeper / Producer',
    primaryTask: 'Track downstream processing, quality testing, and dispatch of harvested honey',
    primaryData: 'Traceability status, settling progress, quality COA, dispatch ETA',
    primaryAction: 'Track Unit / Expand Stages',
    category: 'TRUST'
  },
  INTAKE: {
    id: 'intake',
    path: '/intake',
    label: 'Intake',
    title: 'Harvest Inflow & Intake Verification',
    component: 'ProcessingView',
    requiredCapabilities: ['PROCESSING_MANAGEMENT', 'BATCH_INTAKE'],
    primaryUser: 'Honey Processor',
    primaryTask: 'Inspect incoming harvested material, verify source QR, and accept or reject intake',
    primaryData: 'Incoming harvests, custody seals, net tare weight, floral origin',
    primaryAction: 'Verify & Accept Intake',
    category: 'PRODUCTION'
  },
  PROCESSING: {
    id: 'processing',
    path: '/processing',
    label: 'Processing',
    title: 'Extraction & Processing Workspace',
    component: 'ProcessingView',
    requiredCapabilities: ['PROCESSING_MANAGEMENT', 'PROCESSING_STEP_RECORD'],
    primaryUser: 'Honey Processor',
    primaryTask: 'Intake harvested honey, log settling tank steps and temperature parameters',
    primaryData: 'Active processing batches, settling tanks, filtration logs',
    primaryAction: 'Record Step / Complete Processing',
    category: 'PRODUCTION'
  },
  BATCHES: {
    id: 'batches',
    path: '/batches',
    label: 'Batches',
    title: 'Processing Batches & Lineage',
    component: 'ProcessingView',
    requiredCapabilities: ['PROCESSING_MANAGEMENT', 'BATCH_TRACEABILITY'],
    primaryUser: 'Honey Processor',
    primaryTask: 'Track processing batches, view many-to-one source lineage, and monitor hold status',
    primaryData: 'All processing batches, source harvests, step progress, Quality handoff status',
    primaryAction: 'View Batch Lineage',
    category: 'PRODUCTION'
  },
  HISTORY: {
    id: 'history',
    path: '/history',
    label: 'History',
    title: 'Processing Operational Audit Trail',
    component: 'ProcessingView',
    requiredCapabilities: ['PROCESSING_MANAGEMENT'],
    primaryUser: 'Honey Processor',
    primaryTask: 'Review complete immutable history of processing steps, intakes, and handoffs',
    primaryData: 'Chronological processing log, operator actions, timestamps',
    primaryAction: 'Audit Log Inspection',
    category: 'AUDIT'
  },
  SAMPLES: {
    id: 'samples',
    path: '/samples',
    label: 'Samples',
    title: 'Laboratory Sample Queue',
    component: 'SamplesView',
    requiredCapabilities: ['SAMPLE_INTAKE', 'LAB_WORKSPACE'],
    primaryUser: 'Laboratory Technician / Intake Specialist',
    primaryTask: 'Receive honey test samples, verify custody seals and assign test plans',
    primaryData: 'Sample queue, custody chain, batch origins, priority tags',
    primaryAction: 'Register Sample / Assign Test',
    category: 'QUALITY'
  },
  TESTS: {
    id: 'tests',
    path: '/tests',
    label: 'Tests',
    title: 'Analytical Testing Workspace',
    component: 'TestsView',
    requiredCapabilities: ['TEST_EXECUTION'],
    primaryUser: 'Laboratory Analyst',
    primaryTask: 'Execute laboratory assays (moisture, HMF, diastase, pollen, adulteration)',
    primaryData: 'Assay readings, spectrophotometer values, refractometer data',
    primaryAction: 'Record Reading / Complete Test',
    category: 'QUALITY'
  },
  REVIEW: {
    id: 'review',
    path: '/review',
    label: 'Review',
    title: 'Quality Review & Certification',
    component: 'ReviewView',
    requiredCapabilities: ['RESULT_REVIEW'],
    primaryUser: 'Senior Quality Reviewer / Certifier',
    primaryTask: 'Review analytical test findings, approve quality decisions and generate COAs',
    primaryData: 'Pending test reviews, compliance thresholds, audit records',
    primaryAction: 'Approve Quality / Issue COA',
    category: 'QUALITY'
  },
  DISPATCH: {
    id: 'dispatch',
    path: '/dispatch',
    label: 'Ready to Ship',
    title: 'Ready Packages & QR Validation',
    component: 'DispatchView',
    requiredCapabilities: ['DISPATCH_PLANNING'],
    primaryUser: 'Dispatch Coordinator / Fulfillment Lead',
    primaryTask: 'Inspect physical package identities, validate QR codes and verify batch lineage',
    primaryData: 'Ready-to-ship packages, QR cryptographic resolution, quality checks',
    primaryAction: 'Scan QR / Verify Package',
    category: 'FULFILLMENT'
  },
  SHIPMENTS: {
    id: 'shipments',
    path: '/shipments',
    label: 'Shipments',
    title: 'Shipment Consignments & Release',
    component: 'DispatchView',
    requiredCapabilities: ['DISPATCH_PLANNING'],
    primaryUser: 'Dispatch Coordinator / Distributor',
    primaryTask: 'Create, validate, release and dispatch packaged consignments',
    primaryData: 'Active shipments, package allocations, QR validation progress',
    primaryAction: 'Release Shipment / Print Manifest',
    category: 'FULFILLMENT'
  },
  ROUTES: {
    id: 'routes',
    path: '/routes',
    label: 'Routes',
    title: 'Delivery Route Optimization',
    component: 'RoutesView',
    requiredCapabilities: ['ROUTE_PLANNING'],
    primaryUser: 'Route Logistics Manager',
    primaryTask: 'Plan multi-stop delivery routes, optimize waypoints and assign transport drivers',
    primaryData: 'Active delivery routes, waypoint sequences, driver status',
    primaryAction: 'Optimize Route / Assign Driver',
    category: 'FULFILLMENT'
  },
  DELIVERIES: {
    id: 'deliveries',
    path: '/deliveries',
    label: 'Deliveries',
    title: 'Active Deliveries & Tracking',
    component: 'DeliveriesView',
    requiredCapabilities: ['DELIVERY_TRACKING'],
    primaryUser: 'Transport Driver / Logistics Operator',
    primaryTask: 'Track live shipments, confirm digital proof of delivery and manage exceptions',
    primaryData: 'Shipments in transit, POD signatures, delivery exceptions',
    primaryAction: 'Confirm Delivery / Report Exception',
    category: 'FULFILLMENT'
  },
  TRACEABILITY: {
    id: 'traceability',
    path: '/traceability',
    label: 'Traceability',
    title: 'Cryptographic Journey & Ledger Audit',
    component: 'TraceabilityView',
    requiredCapabilities: ['BATCH_TRACEABILITY'],
    primaryUser: 'Trust Officer / Auditor / Consumer Liaison',
    primaryTask: 'Inspect end-to-end provenance proofs, Merkle root anchors and QR identities',
    primaryData: 'Blockchain transaction hashes, cryptographic proofs, QR identities',
    primaryAction: 'Verify Proof / Scan QR',
    category: 'TRUST'
  },
  MORE: {
    id: 'more',
    path: '/more',
    label: 'More',
    title: 'Workspace Identity & Settings',
    component: 'MoreView',
    requiredCapabilities: [],
    primaryUser: 'All Authenticated Users',
    primaryTask: 'Configure work capabilities, review ESP32 telemetry, manage sync and security',
    primaryData: 'Declared capabilities, confirmed designations, device list, audit log',
    primaryAction: 'Edit Work Setup / Sync Ledger',
    category: 'SETTINGS'
  }
};

const ROUTE_MODULES = {
  hives: ['hive_view'],
  inspections: ['hive_inspection'],
  honey: ['honey_collection'],
  harvest: ['honey_collection'],
  journey: ['traceability_journeys'],
  intake: ['honey_batches'],
  processing: ['processing_records'],
  batches: ['honey_batches'],
  history: ['processing_records'],
  samples: ['sample_intake'],
  tests: ['lab_test_execution'],
  review: ['lab_result_review'],
  dispatch: ['shipment_handling'],
  shipments: ['shipment_handling'],
  routes: ['route_planning'],
  deliveries: ['delivery_tracking'],
  traceability: ['traceability_journeys']
};

/**
 * Route Lookup Helper
 */
export const RouteRegistry = {
  getRoute(id) {
    const key = String(id).toUpperCase();
    return ROUTE_REGISTRY[key] || Object.values(ROUTE_REGISTRY).find(r => r.id === id) || null;
  },

  getAllRoutes() {
    return Object.values(ROUTE_REGISTRY);
  },

  findByPath(path) {
    const cleanPath = (path || '').toLowerCase().trim();
    return Object.values(ROUTE_REGISTRY).find(r => r.path === cleanPath) || null;
  },

  validateRouteAccess(routeId, userCapabilities = []) {
    const route = this.getRoute(routeId);
    if (!route) return false;
    const canonicalInputs = (userCapabilities || []).map(capability => String(capability).toUpperCase());
    const direct = canonicalInputs.filter(capability => CAPABILITY_MAP.has(capability));
    const migrated = migrateLegacyCapabilities(canonicalInputs.filter(capability => !CAPABILITY_MAP.has(capability))).capabilities;
    const access = resolveCanonicalPermissionsAndModules({ confirmedCapabilities: [...direct, ...migrated] });
    const requirements = (route.requiredCapabilities || []).map(capability => String(capability).toUpperCase());
    const moduleIds = ROUTE_MODULES[route.id] || [];
    if (requirements.length === 0 && moduleIds.length === 0) return true;
    return requirements.every(capability => access.effectiveCapabilities.includes(capability)) &&
      moduleIds.every(moduleId => access.moduleIds.includes(moduleId));
  }
};
