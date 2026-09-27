/**
 * HoneyChain Centralized Navigation Registry
 *
 * Enforces: ONE NAVIGATION ITEM → ONE CANONICAL ROUTE
 * Prevents navigation duplicates, label drift, and phantom route aliases.
 */

import { ROUTE_REGISTRY } from './routeRegistry.js';

export const NAVIGATION_REGISTRY = {
  HOME: {
    id: 'home',
    label: 'Home',
    iconName: 'Home',
    routeId: 'home',
    routePath: ROUTE_REGISTRY.HOME.path,
    group: 'PRIMARY',
    mobilePriority: 100,
    desktopPriority: 100,
    requiredCapabilities: [],
    purpose: ROUTE_REGISTRY.HOME.primaryTask
  },
  HIVES: {
    id: 'hives',
    label: 'Hives',
    iconName: 'Layers',
    routeId: 'hives',
    routePath: ROUTE_REGISTRY.HIVES.path,
    group: 'FIELD',
    mobilePriority: 90,
    desktopPriority: 90,
    requiredCapabilities: ['HIVE_MANAGEMENT'],
    purpose: ROUTE_REGISTRY.HIVES.primaryTask
  },
  INSPECTIONS: {
    id: 'inspections',
    label: 'Inspections',
    iconName: 'ClipboardCheck',
    routeId: 'inspections',
    routePath: ROUTE_REGISTRY.INSPECTIONS.path,
    group: 'FIELD',
    mobilePriority: 85,
    desktopPriority: 85,
    requiredCapabilities: ['HIVE_INSPECTION'],
    purpose: ROUTE_REGISTRY.INSPECTIONS.primaryTask
  },
  HONEY: {
    id: 'honey',
    label: 'Honey',
    iconName: 'Droplet',
    routeId: 'honey',
    routePath: ROUTE_REGISTRY.HONEY.path,
    group: 'PRODUCTION',
    mobilePriority: 80,
    desktopPriority: 80,
    requiredCapabilities: ['HONEY_COLLECTION'],
    purpose: ROUTE_REGISTRY.HONEY.primaryTask
  },
  PROCESSING: {
    id: 'processing',
    label: 'Processing',
    iconName: 'Cpu',
    routeId: 'processing',
    routePath: ROUTE_REGISTRY.PROCESSING.path,
    group: 'PRODUCTION',
    mobilePriority: 88,
    desktopPriority: 88,
    requiredCapabilities: ['PROCESSING_MANAGEMENT'],
    purpose: ROUTE_REGISTRY.PROCESSING.primaryTask
  },
  SAMPLES: {
    id: 'samples',
    label: 'Samples',
    iconName: 'FlaskConical',
    routeId: 'samples',
    routePath: ROUTE_REGISTRY.SAMPLES.path,
    group: 'QUALITY',
    mobilePriority: 92,
    desktopPriority: 92,
    requiredCapabilities: ['SAMPLE_INTAKE', 'LAB_WORKSPACE'],
    purpose: ROUTE_REGISTRY.SAMPLES.primaryTask
  },
  TESTS: {
    id: 'tests',
    label: 'Tests',
    iconName: 'TestTube',
    routeId: 'tests',
    routePath: ROUTE_REGISTRY.TESTS.path,
    group: 'QUALITY',
    mobilePriority: 87,
    desktopPriority: 87,
    requiredCapabilities: ['TEST_EXECUTION'],
    purpose: ROUTE_REGISTRY.TESTS.primaryTask
  },
  REVIEW: {
    id: 'review',
    label: 'Review',
    iconName: 'ShieldCheck',
    routeId: 'review',
    routePath: ROUTE_REGISTRY.REVIEW.path,
    group: 'QUALITY',
    mobilePriority: 84,
    desktopPriority: 84,
    requiredCapabilities: ['RESULT_REVIEW'],
    purpose: ROUTE_REGISTRY.REVIEW.primaryTask
  },
  DISPATCH: {
    id: 'dispatch',
    label: 'Dispatch',
    iconName: 'Package',
    routeId: 'dispatch',
    routePath: ROUTE_REGISTRY.DISPATCH.path,
    group: 'FULFILLMENT',
    mobilePriority: 92,
    desktopPriority: 92,
    requiredCapabilities: ['DISPATCH_PLANNING'],
    purpose: ROUTE_REGISTRY.DISPATCH.primaryTask
  },
  ROUTES: {
    id: 'routes',
    label: 'Routes',
    iconName: 'MapPin',
    routeId: 'routes',
    routePath: ROUTE_REGISTRY.ROUTES.path,
    group: 'FULFILLMENT',
    mobilePriority: 86,
    desktopPriority: 86,
    requiredCapabilities: ['ROUTE_PLANNING'],
    purpose: ROUTE_REGISTRY.ROUTES.primaryTask
  },
  DELIVERIES: {
    id: 'deliveries',
    label: 'Deliveries',
    iconName: 'Truck',
    routeId: 'deliveries',
    routePath: ROUTE_REGISTRY.DELIVERIES.path,
    group: 'FULFILLMENT',
    mobilePriority: 88,
    desktopPriority: 88,
    requiredCapabilities: ['DELIVERY_TRACKING'],
    purpose: ROUTE_REGISTRY.DELIVERIES.primaryTask
  },
  TRACEABILITY: {
    id: 'traceability',
    label: 'Trace',
    iconName: 'QrCode',
    routeId: 'traceability',
    routePath: ROUTE_REGISTRY.TRACEABILITY.path,
    group: 'TRUST',
    mobilePriority: 70,
    desktopPriority: 75,
    requiredCapabilities: ['BATCH_TRACEABILITY'],
    purpose: ROUTE_REGISTRY.TRACEABILITY.primaryTask
  },
  MORE: {
    id: 'more',
    label: 'More',
    iconName: 'MoreHorizontal',
    routeId: 'more',
    routePath: ROUTE_REGISTRY.MORE.path,
    group: 'SETTINGS',
    mobilePriority: 10,
    desktopPriority: 10,
    requiredCapabilities: [],
    purpose: ROUTE_REGISTRY.MORE.primaryTask
  }
};

export const NavigationRegistry = {
  getItem(id) {
    const key = String(id).toUpperCase();
    return NAVIGATION_REGISTRY[key] || Object.values(NAVIGATION_REGISTRY).find(item => item.id === id) || null;
  },

  getAllItems() {
    return Object.values(NAVIGATION_REGISTRY);
  },

  getDesktopGroups(capabilities = []) {
    const items = Object.values(NAVIGATION_REGISTRY).filter(item => {
      if (item.id === 'home' || item.id === 'more') return false;
      if (!item.requiredCapabilities || item.requiredCapabilities.length === 0) return true;
      return item.requiredCapabilities.some(c => capabilities.includes(c));
    });

    const groups = {};
    items.forEach(item => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });

    return groups;
  }
};
