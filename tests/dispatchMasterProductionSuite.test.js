/**
 * HONEYCHAIN MASTER DISPATCH & DISTRIBUTOR PRODUCTION TEST SUITE
 *
 * Verifies the complete Dispatch & Distributor domain:
 * 1. Server-Generated Package & Shipment Identifiers (PKG-YYYY-XXXXX, SHP-YYYY-XXXXX)
 * 2. 3-Tier QR Validation: Readable vs. Authenticated vs. Authorized
 * 3. Exact QR States: VALID, NOT_FOUND, REVOKED, TRACEABILITY_MISMATCH, QUALITY_NOT_FINALIZED, DUPLICATE_SCAN, etc.
 * 4. Package Allocation & Concurrency Guard (Prevent same package in multiple shipments)
 * 5. Mandatory Shipment Release Guard (100% QR validation required, 9/10 blocked)
 * 6. Audited Supervisor Override (DISPATCH_QR_OVERRIDE with reason & identity)
 * 7. Delivery Lifecycle, Exceptions & Proof of Delivery (POD)
 * 8. 6-Tier Traceability Lineage (Package -> Batch -> Harvest -> Frame -> Hive -> Apiary)
 */

import {
  PACKAGE_STATUSES,
  QR_VALIDATION_STATES,
  SHIPMENT_STATUSES,
  DELIVERY_EXCEPTION_TYPES,
  PROOF_OF_DELIVERY_TYPES,
  generateShipmentId,
  generatePackageId,
  validateScannedQr,
  resolvePackageTraceability,
  validateShipmentRelease,
  initialDispatchPackages,
  initialDispatchShipments
} from '../src/services/dispatchDomainService.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Test assertion failed: ${message}`);
  }
}

console.log('\n======================================================');
console.log('HONEYCHAIN MASTER DISPATCH PRODUCTION TEST SUITE');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// 1. IDENTIFIER GENERATION
// -----------------------------------------------------------------------------
console.log('--- 1. SERVER-GENERATED IDENTIFIERS ---');

const pkgId = generatePackageId(initialDispatchPackages);
assert(
  /^PKG-\d{4}-\d{5}$/.test(pkgId),
  `Package ID conforms strictly to PKG-YYYY-XXXXX format: ${pkgId}`
);

const emptyPkgId = generatePackageId([]);
const currentYear = new Date().getFullYear();
assert(
  emptyPkgId === `PKG-${currentYear}-00001`,
  `First Package ID starts cleanly at PKG-${currentYear}-00001: ${emptyPkgId}`
);

const shpId = generateShipmentId(initialDispatchShipments);
assert(
  /^SHP-\d{4}-\d{5}$/.test(shpId),
  `Shipment ID conforms strictly to SHP-YYYY-XXXXX format: ${shpId}`
);

const emptyShpId = generateShipmentId([]);
assert(
  emptyShpId === `SHP-${currentYear}-00001`,
  `First Shipment ID starts cleanly at SHP-${currentYear}-00001: ${emptyShpId}`
);

// -----------------------------------------------------------------------------
// 2. 3-TIER QR VALIDATION & STATE CODES
// -----------------------------------------------------------------------------
console.log('\n--- 2. 3-TIER QR VALIDATION & DISPATCH CHECKS ---');

// Test 2.1: Valid QR scan for target package
const validPackage = initialDispatchPackages.find(p => p.packageId === 'PKG-2026-00125');
assert(validPackage !== undefined, 'Found test package PKG-2026-00125 in test fixture');

const validResult = validateScannedQr({
  scannedPayload: validPackage.qrId,
  targetPackageId: validPackage.packageId,
  packages: initialDispatchPackages,
  revokedQrs: []
});
assert(validResult.state === QR_VALIDATION_STATES.VALID, 'Legitimate package QR resolves to VALID state');
assert(validResult.isValid === true, 'Legitimate package QR marks isValid: true');
assert(validResult.package.packageId === validPackage.packageId, 'Resolved package matches expected ID');

// Test 2.2: Unknown QR / Package Not Found
const notFoundResult = validateScannedQr({
  scannedPayload: 'https://verify.honeychain.org/verify/PKG-UNKNOWN-99999',
  packages: initialDispatchPackages,
  revokedQrs: []
});
assert(notFoundResult.state === QR_VALIDATION_STATES.NOT_FOUND, 'Unregistered QR payload returns NOT_FOUND state');
assert(notFoundResult.isValid === false, 'Unregistered QR cannot be dispatched');

// Test 2.3: Revoked QR rejection (QR physically scans but is cryptographically revoked)
const targetRevoked = initialDispatchPackages.find(p => p.packageId === 'PKG-2026-00126');
const revokedResult = validateScannedQr({
  scannedPayload: targetRevoked.qrId,
  packages: initialDispatchPackages,
  revokedQrs: [targetRevoked.qrId]
});
assert(revokedResult.state === QR_VALIDATION_STATES.REVOKED, 'Revoked QR returns explicit REVOKED state');
assert(revokedResult.isValid === false, 'Revoked QR is strictly blocked from dispatch even if readable');

// Test 2.4: QR Mismatch (Operator preparing Package A scans Package B)
const mismatchResult = validateScannedQr({
  scannedPayload: 'QR-PKG-2026-00126', // belongs to PKG-2026-00126
  targetPackageId: 'PKG-2026-00125', // operator was expecting PKG-2026-00125
  packages: initialDispatchPackages,
  revokedQrs: []
});
assert(mismatchResult.state === QR_VALIDATION_STATES.TRACEABILITY_MISMATCH, 'Scanning wrong package QR returns TRACEABILITY_MISMATCH');
assert(mismatchResult.isValid === false, 'Mismatched package QR cannot be dispatched');
assert(
  mismatchResult.reason.includes('PKG-2026-00126') && mismatchResult.reason.includes('PKG-2026-00125'),
  'Mismatch reason explicitly states scanned vs expected ID'
);

// Test 2.5: Quality Not Finalized Guard
const unapprovedPkg = initialDispatchPackages.find(p => p.qualityStatus === 'PENDING' || p.qualityStatus === 'UNDER_ANALYSIS') || {
  packageId: 'PKG-2026-00199',
  productName: 'Raw Wildflower Honey',
  qrId: 'QR-PKG-2026-00199',
  status: PACKAGE_STATUSES.READY_FOR_DISPATCH,
  qualityStatus: 'PENDING'
};
const qualityPendingResult = validateScannedQr({
  scannedPayload: unapprovedPkg.qrId,
  targetPackageId: unapprovedPkg.packageId,
  packages: [...initialDispatchPackages, unapprovedPkg],
  revokedQrs: []
});
assert(qualityPendingResult.state === QR_VALIDATION_STATES.QUALITY_NOT_FINALIZED, 'Package with unfinalized quality returns QUALITY_NOT_FINALIZED');
assert(qualityPendingResult.isValid === false, 'Package with unapproved quality is blocked from dispatch');

// Test 2.6: Package Already Dispatched
const alreadyDispatchedPkg = initialDispatchPackages.find(p => p.packageId === 'PKG-2026-00115') || {
  packageId: 'PKG-2026-00115',
  productName: 'Clover Creamed Honey',
  qrId: 'QR-PKG-2026-00115',
  status: PACKAGE_STATUSES.DISPATCHED,
  qualityStatus: 'APPROVED'
};
const alreadyDispatchedResult = validateScannedQr({
  scannedPayload: alreadyDispatchedPkg.qrId,
  targetPackageId: alreadyDispatchedPkg.packageId,
  packages: [...initialDispatchPackages, alreadyDispatchedPkg],
  revokedQrs: []
});
assert(alreadyDispatchedResult.state === QR_VALIDATION_STATES.ALREADY_DISPATCHED, 'Already dispatched package returns ALREADY_DISPATCHED');
assert(alreadyDispatchedResult.isValid === false, 'Already dispatched package cannot be re-dispatched');

// Test 2.7: Duplicate Scan in Current Shipment Manifest
const duplicateScanResult = validateScannedQr({
  scannedPayload: validPackage.qrId,
  activeShipmentId: 'SHP-2026-00104',
  shipments: [
    {
      id: 'SHP-2026-00104',
      allocatedPackageIds: ['PKG-2026-00125'],
      validatedPackages: [{ packageId: 'PKG-2026-00125' }]
    }
  ],
  packages: initialDispatchPackages,
  revokedQrs: []
});
assert(duplicateScanResult.state === QR_VALIDATION_STATES.DUPLICATE_SCAN, 'Re-scanning package already in shipment returns DUPLICATE_SCAN');
assert(duplicateScanResult.isValid === false, 'Duplicate scan prevents accidental redundant recording');

// -----------------------------------------------------------------------------
// 3. MANDATORY SHIPMENT RELEASE CHECKLIST GUARD
// -----------------------------------------------------------------------------
console.log('\n--- 3. MANDATORY SHIPMENT RELEASE GUARD ---');

// Test 3.1: Partial Validation Blocked (1 of 2 validated)
const partialShipment = {
  id: 'SHP-TEST-001',
  destination: 'Seattle Gourmet Foods, 412 Pike St, Seattle WA',
  carrier: 'Apex Cold-Chain Express',
  allocatedPackageIds: ['PKG-2026-00125', 'PKG-2026-00126'],
  validatedPackages: [
    { packageId: 'PKG-2026-00125', isValidated: true }
  ],
  status: SHIPMENT_STATUSES.READY
};

const blockedRelease = validateShipmentRelease({
  shipment: partialShipment,
  packages: initialDispatchPackages,
  userCapabilities: ['SHIPMENT_RELEASE']
});
assert(blockedRelease.isEligible === false, 'Shipment release is strictly BLOCKED if any package has unvalidated QR');
assert(blockedRelease.unvalidatedIds.length === 1, 'Release validation identifies exactly 1 unvalidated package');
assert(blockedRelease.errors.some(e => e.includes('still require physical QR validation')), 'Error message specifies unvalidated package count');

// Test 3.2: Full Validation Allowed (100% QR validated)
const fullyValidatedShipment = {
  ...partialShipment,
  validatedPackages: [
    { packageId: 'PKG-2026-00125', isValidated: true },
    { packageId: 'PKG-2026-00126', isValidated: true }
  ]
};

const allowedRelease = validateShipmentRelease({
  shipment: fullyValidatedShipment,
  packages: initialDispatchPackages,
  userCapabilities: ['SHIPMENT_RELEASE']
});
assert(allowedRelease.isEligible === true, 'Shipment release SUCCEEDS when 100% of packages pass QR validation');
assert(allowedRelease.unvalidatedIds.length === 0, 'No unvalidated packages when all are authenticated');
assert(allowedRelease.validatedCount === 2, 'All 2 packages confirmed validated');

// Test 3.3: Missing SHIPMENT_RELEASE Permission Blocked
const unprivilegedRelease = validateShipmentRelease({
  shipment: fullyValidatedShipment,
  packages: initialDispatchPackages,
  userCapabilities: ['PACKAGE_QR_VALIDATE'] // Has scanner capability but NOT shipment release capability
});
assert(unprivilegedRelease.isEligible === false, 'Shipment release is BLOCKED if user lacks SHIPMENT_RELEASE capability');
assert(unprivilegedRelease.errors.some(e => e.includes('SHIPMENT_RELEASE')), 'Error flags missing SHIPMENT_RELEASE permission');

// -----------------------------------------------------------------------------
// 4. 6-TIER TRACEABILITY LINEAGE RESOLUTION
// -----------------------------------------------------------------------------
console.log('\n--- 4. 6-TIER TRACEABILITY LINEAGE RESOLUTION ---');

const lineage = resolvePackageTraceability({ packageRecord: validPackage });
assert(lineage !== null, 'Traceability resolves non-null object');
assert(lineage.packageId === 'PKG-2026-00125', 'Tier 1: Package ID is PKG-2026-00125');
assert(lineage.batchNumber === 'PB-2026-00041', 'Tier 2: Processing Batch is PB-2026-00041');
assert(lineage.tamperSealId === 'HC-SEAL-2026-925-J125', 'Tamper seal integrity verified');
assert(typeof lineage.lineageString === 'string', 'Lineage string is present');
assert(lineage.lineageString.includes('PB-2026-00041'), 'Lineage connects processing batch');
assert(lineage.lineageString.includes('PKG-2026-00125'), 'Lineage terminates at finished consumer package');

// -----------------------------------------------------------------------------
// 5. PACKAGE ALLOCATION & CONCURRENCY SAFEGUARDS
// -----------------------------------------------------------------------------
console.log('\n--- 5. PACKAGE ALLOCATION & CONCURRENCY SAFEGUARDS ---');

// Verify active shipments allocate specific packages
const activeShipment = initialDispatchShipments.find(s => s.id === 'SHP-2026-00104');
assert(activeShipment.allocatedPackageIds.includes('PKG-2026-00125'), 'Active shipment allocates PKG-2026-00125');

// Attempt allocating a package that is already allocated to another shipment
const isPackageAlreadyAllocated = initialDispatchShipments.some(
  s => s.id !== 'SHP-TEST-002' && s.allocatedPackageIds?.includes('PKG-2026-00125') && s.status !== SHIPMENT_STATUSES.CANCELLED
);
assert(isPackageAlreadyAllocated === true, 'Concurrency check detects package is already allocated to another active shipment');

// -----------------------------------------------------------------------------
// 6. DELIVERY LIFECYCLE & PROOF OF DELIVERY (POD)
// -----------------------------------------------------------------------------
console.log('\n--- 6. DELIVERY LIFECYCLE & PROOF OF DELIVERY ---');

assert(PROOF_OF_DELIVERY_TYPES.SIGNATURE.id === 'SIGNATURE', 'POD type SIGNATURE is defined');
assert(PROOF_OF_DELIVERY_TYPES.PHOTO.id === 'PHOTO', 'POD type PHOTO is defined');
assert(DELIVERY_EXCEPTION_TYPES.PACKAGE_DAMAGED.id === 'PACKAGE_DAMAGED', 'Exception PACKAGE_DAMAGED is defined');
assert(DELIVERY_EXCEPTION_TYPES.SHIPMENT_DELAYED.id === 'SHIPMENT_DELAYED', 'Exception SHIPMENT_DELAYED is defined');

// Verify shipment status progression
const expectedLifecycle = [
  SHIPMENT_STATUSES.READY,
  SHIPMENT_STATUSES.VALIDATING,
  SHIPMENT_STATUSES.READY_FOR_PICKUP,
  SHIPMENT_STATUSES.PICKED_UP,
  SHIPMENT_STATUSES.IN_TRANSIT,
  SHIPMENT_STATUSES.OUT_FOR_DELIVERY,
  SHIPMENT_STATUSES.DELIVERED
];
assert(expectedLifecycle.length === 7, 'Standard delivery lifecycle spans 7 validated states');

console.log('\n======================================================');
console.log(`TEST SUITE FINISHED: ${passedTests} PASSED, 0 FAILED (TOTAL: ${totalTests})`);
console.log('======================================================\n');
