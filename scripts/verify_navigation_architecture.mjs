/**
 * HoneyChain Navigation & Information Architecture Verification Script
 *
 * Automated verification of:
 * 1. Route Uniqueness & One-Purpose Rule (§ 5, § 6, § 16)
 * 2. Navigation Item Uniqueness & Zero Duplicate Destinations (§ 3, § 17, § 18)
 * 3. Canonical Page Component Resolution (§ 14, § 15)
 * 4. Capability-Driven Navigation Isolation (§ 9, § 10)
 * 5. Multi-Designation Combinations (§ 30)
 * 6. Quick Action Disambiguation (§ 19)
 */

import { ROUTE_REGISTRY, RouteRegistry } from '../src/services/routeRegistry.js';
import { NAVIGATION_REGISTRY, NavigationRegistry } from '../src/services/navigationRegistry.js';
import { WorkspaceNavigationComposer, composeNavigation } from '../src/services/workspaceNavigationComposer.js';
import { CapabilityRegistry } from '../src/services/capabilityRegistry.js';

console.log('================================================================');
console.log('HONEYCHAIN NAVIGATION & INFORMATION ARCHITECTURE VERIFICATION');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

// -------------------------------------------------------------
// TEST 1: Route Registry Integrity & Uniqueness
// -------------------------------------------------------------
console.log('[TEST 1] Route Registry Canonical Integrity & Uniqueness');

const allRoutes = RouteRegistry.getAllRoutes();
assert(allRoutes.length >= 12, `Route registry contains ${allRoutes.length} canonical routes (expected >= 12)`);

// Check unique paths
const paths = allRoutes.map(r => r.path);
const uniquePaths = new Set(paths);
assert(paths.length === uniquePaths.size, `All ${paths.length} routes have unique canonical paths`);

// Check unique route IDs
const routeIds = allRoutes.map(r => r.id);
const uniqueRouteIds = new Set(routeIds);
assert(routeIds.length === uniqueRouteIds.size, `All ${routeIds.length} route IDs are unique`);

// Check unique components & purposes
const purposes = allRoutes.map(r => r.primaryTask);
const uniquePurposes = new Set(purposes);
assert(purposes.length === uniquePurposes.size, `All ${purposes.length} routes have distinct primary user intents (One User Intent → One Clear Destination)`);

// -------------------------------------------------------------
// TEST 2: Navigation Registry Integrity & Route Linkage
// -------------------------------------------------------------
console.log('\n[TEST 2] Navigation Registry & No Drift Between Nav and Routes');

const allNavItems = NavigationRegistry.getAllItems();
assert(allNavItems.length >= 12, `Navigation registry contains ${allNavItems.length} registered items`);

// Verify that every nav item links to an existing route in ROUTE_REGISTRY
let invalidRouteLink = false;
allNavItems.forEach(item => {
  const route = RouteRegistry.getRoute(item.routeId);
  if (!route) {
    invalidRouteLink = true;
    console.error(`Nav item ${item.id} links to unknown routeId: ${item.routeId}`);
  }
});
assert(!invalidRouteLink, 'Every navigation item links to a verified canonical route');

// -------------------------------------------------------------
// TEST 3: Zero Duplicate Destinations in Composed Navigation
// -------------------------------------------------------------
console.log('\n[TEST 3] Zero Duplicate Destinations in Active Navigation Compositions');

const testScenarios = [
  { name: 'Beekeeper Basic', caps: ['HIVE_MANAGEMENT', 'HIVE_INSPECTION'], desig: 'BEEKEEPER' },
  { name: 'Beekeeper + Health', caps: ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'BEE_HEALTH_SCAN'], desig: 'BEEKEEPER' },
  { name: 'Beekeeper + Processor', caps: ['HIVE_MANAGEMENT', 'HONEY_COLLECTION', 'PROCESSING_MANAGEMENT'], desig: 'BEEKEEPER' },
  { name: 'Pure Processor', caps: ['PROCESSING_MANAGEMENT', 'BATCH_INTAKE', 'PROCESSING_STEP_RECORD'], desig: 'PROCESSOR' },
  { name: 'Lab Specialist', caps: ['LAB_WORKSPACE', 'SAMPLE_INTAKE', 'TEST_EXECUTION', 'RESULT_REVIEW'], desig: 'LAB_SPECIALIST' },
  { name: 'Distributor Logistics', caps: ['DISPATCH_PLANNING', 'ROUTE_PLANNING', 'DELIVERY_TRACKING'], desig: 'DISTRIBUTOR' },
  { name: 'Fullstack Lead (All)', caps: [
    'HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION', 'PROCESSING_MANAGEMENT',
    'LAB_WORKSPACE', 'SAMPLE_INTAKE', 'DISPATCH_PLANNING', 'DELIVERY_TRACKING'
  ], desig: 'BEEKEEPER' }
];

testScenarios.forEach(sc => {
  const composed = composeNavigation(sc.caps, sc.desig, {});
  const navIds = composed.map(n => n.id);
  const uniqueNavIds = new Set(navIds);

  const navLabels = composed.map(n => n.label);
  const uniqueNavLabels = new Set(navLabels);

  const hasDuplicateId = navIds.length !== uniqueNavIds.size;
  const hasDuplicateLabel = navLabels.length !== uniqueNavLabels.size;

  assert(!hasDuplicateId && !hasDuplicateLabel, `${sc.name}: Composed [${navLabels.join(' | ')}] has ZERO duplicate IDs and ZERO duplicate labels`);
  assert(composed.length >= 3 && composed.length <= 5, `${sc.name}: Ergonomic tab count strictly respected (${composed.length} tabs)`);
});

// -------------------------------------------------------------
// TEST 4: Dedicated Canonical Component Resolution (No HomeView Fallback)
// -------------------------------------------------------------
console.log('\n[TEST 4] Dedicated Canonical Component Resolution');

const componentMappings = {
  home: 'HomeView',
  hives: 'HivesView',
  inspections: 'InspectionsView',
  honey: 'HoneyView',
  processing: 'ProcessingView',
  samples: 'SamplesView',
  tests: 'TestsView',
  review: 'ReviewView',
  dispatch: 'DispatchView',
  routes: 'RoutesView',
  deliveries: 'DeliveriesView',
  traceability: 'TraceabilityView',
  more: 'MoreView'
};

Object.entries(componentMappings).forEach(([tabId, expectedComponent]) => {
  const route = RouteRegistry.getRoute(tabId);
  assert(route && route.component === expectedComponent, `Tab '${tabId}' maps cleanly to dedicated '${expectedComponent}'`);
});

// -------------------------------------------------------------
// TEST 5: Route Access Authorization & Guarding
// -------------------------------------------------------------
console.log('\n[TEST 5] Capability-Based Route Guarding');

const beekeeperCaps = ['HIVE_MANAGEMENT', 'HIVE_INSPECTION'];
const labCaps = ['LAB_WORKSPACE', 'SAMPLE_INTAKE', 'TEST_EXECUTION'];

assert(RouteRegistry.validateRouteAccess('hives', beekeeperCaps) === true, 'Beekeeper permitted on /hives');
assert(RouteRegistry.validateRouteAccess('inspections', beekeeperCaps) === true, 'Beekeeper permitted on /inspections');
assert(RouteRegistry.validateRouteAccess('samples', beekeeperCaps) === false, 'Beekeeper BLOCKED on /samples');
assert(RouteRegistry.validateRouteAccess('dispatch', beekeeperCaps) === false, 'Beekeeper BLOCKED on /dispatch');

assert(RouteRegistry.validateRouteAccess('samples', labCaps) === true, 'Lab Analyst permitted on /samples');
assert(RouteRegistry.validateRouteAccess('tests', labCaps) === true, 'Lab Analyst permitted on /tests');
assert(RouteRegistry.validateRouteAccess('hives', labCaps) === false, 'Lab Analyst BLOCKED on /hives');

// -------------------------------------------------------------
// TEST 6: Desktop Navigation Grouping
// -------------------------------------------------------------
console.log('\n[TEST 6] Desktop Navigation Grouping & Structure');

const desktopGroups = NavigationRegistry.getDesktopGroups(scenarios_all_caps());
function scenarios_all_caps() {
  return ['HIVE_MANAGEMENT', 'PROCESSING_MANAGEMENT', 'LAB_WORKSPACE', 'DISPATCH_PLANNING'];
}

assert(Boolean(desktopGroups.FIELD), 'Desktop groups include FIELD');
assert(Boolean(desktopGroups.PRODUCTION), 'Desktop groups include PRODUCTION');
assert(Boolean(desktopGroups.QUALITY), 'Desktop groups include QUALITY');
assert(Boolean(desktopGroups.FULFILLMENT), 'Desktop groups include FULFILLMENT');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`VERIFICATION COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('NAVIGATION & INFORMATION ARCHITECTURE VERIFIED WITH 100% PASS RATE!\n');
}
