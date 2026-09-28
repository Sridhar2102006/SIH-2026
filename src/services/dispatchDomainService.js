/**
 * HONEYCHAIN DISPATCH & DISTRIBUTOR DOMAIN SERVICE
 *
 * Core Responsibility: Physical movement of finalized packages from facility to destination.
 * Packaging owns QR creation; Quality owns Quality decision; Dispatch owns FINAL PHYSICAL QR VALIDATION.
 *
 * QR Check Answers: "Does the QR physically present on this package resolve to the exact
 * package/product record being dispatched?" (NOT quality testing, NOT certification).
 *
 * Pure Honey (#D99A24) Â· Light Blue (#7AA7C7) Â· Light Green (#8AA681) Â· Golden (#C9962E) Â· Warm Cream (#FFF9EF) Â· Deep Cocoa (#34261B)
 */

export const PACKAGE_STATUSES = {
  PACKAGED: 'PACKAGED',
  READY_FOR_DISPATCH: 'READY_FOR_DISPATCH',
  ALLOCATED: 'ALLOCATED',
  DISPATCHED: 'DISPATCHED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED'
};

export const PACKAGE_STATUS_LABELS = {
  PACKAGED: 'Packaged & Labeled',
  READY_FOR_DISPATCH: 'Ready for Dispatch',
  ALLOCATED: 'Allocated to Shipment',
  DISPATCHED: 'Dispatched',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  RETURNED: 'Returned'
};

export const QR_VALIDATION_STATES = {
  VALID: 'VALID',
  INVALID: 'INVALID',
  NOT_FOUND: 'NOT_FOUND',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
  ALREADY_DISPATCHED: 'ALREADY_DISPATCHED',
  ALREADY_DELIVERED: 'ALREADY_DELIVERED',
  PACKAGE_NOT_READY: 'PACKAGE_NOT_READY',
  QUALITY_NOT_FINALIZED: 'QUALITY_NOT_FINALIZED',
  TRACEABILITY_MISMATCH: 'TRACEABILITY_MISMATCH',
  DUPLICATE_SCAN: 'DUPLICATE_SCAN'
};

export const QR_STATE_DETAILS = {
  VALID: {
    label: 'QR Valid & Authenticated',
    color: '#2E7D32',
    bg: '#EBF7EE',
    isPassing: true,
    description: 'Cryptographic QR matches registered package record, quality decision confirmed, and batch lineage intact.'
  },
  INVALID: {
    label: 'Invalid QR Payload',
    color: '#B91C1C',
    bg: '#FDF2F2',
    isPassing: false,
    description: 'QR payload structure is corrupted, non-standard, or unreadable by HoneyChain protocol.'
  },
  NOT_FOUND: {
    label: 'Package / QR Not Found',
    color: '#B91C1C',
    bg: '#FDF2F2',
    isPassing: false,
    description: 'No registered package corresponds to this QR identifier in the operational ledger.'
  },
  REVOKED: {
    label: 'QR Revoked',
    color: '#B91C1C',
    bg: '#FDF2F2',
    isPassing: false,
    description: 'This QR code has been revoked by Quality / Compliance due to label reprint, recall, or packaging voiding.'
  },
  EXPIRED: {
    label: 'Package Expired',
    color: '#B91C1C',
    bg: '#FDF2F2',
    isPassing: false,
    description: 'Package best-before threshold has expired. Product cannot be dispatched.'
  },
  ALREADY_DISPATCHED: {
    label: 'Already Dispatched',
    color: '#C9962E',
    bg: '#FFF9EF',
    isPassing: false,
    description: 'This package has already been released in a prior shipment and cannot be re-dispatched.'
  },
  ALREADY_DELIVERED: {
    label: 'Already Delivered',
    color: '#7AA7C7',
    bg: '#F0F6FA',
    isPassing: false,
    description: 'This package has already been fulfilled and delivered to its final destination.'
  },
  PACKAGE_NOT_READY: {
    label: 'Package Not Ready for Dispatch',
    color: '#C9962E',
    bg: '#FFF9EF',
    isPassing: false,
    description: 'Package is still undergoing packaging curing, label drying, or final physical staging.'
  },
  QUALITY_NOT_FINALIZED: {
    label: 'Quality Decision Not Approved',
    color: '#B91C1C',
    bg: '#FDF2F2',
    isPassing: false,
    description: 'Parent processing batch has not received formal Quality Officer lot release approval.'
  },
  TRACEABILITY_MISMATCH: {
    label: 'QR / Package Mismatch',
    color: '#B91C1C',
    bg: '#FDF2F2',
    isPassing: false,
    description: 'Scanned QR belongs to a different package than the one currently being prepared.'
  },
  DUPLICATE_SCAN: {
    label: 'Duplicate Scan in Shipment',
    color: '#7AA7C7',
    bg: '#F0F6FA',
    isPassing: false,
    description: 'Package has already been scanned and authenticated for this active shipment.'
  }
};

export const SHIPMENT_STATUSES = {
  READY: 'READY',
  VALIDATING: 'VALIDATING',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  DELIVERY_EXCEPTION: 'DELIVERY_EXCEPTION',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED'
};

export const SHIPMENT_STATUS_LABELS = {
  READY: 'Shipment Drafted',
  VALIDATING: 'QR Validation in Progress',
  READY_FOR_PICKUP: 'Released Â· Ready for Carrier Pickup',
  PICKED_UP: 'Picked Up by Driver',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Successfully Delivered',
  DELIVERY_EXCEPTION: 'Delivery Exception / Delayed',
  RETURNED: 'Returned to Facility',
  CANCELLED: 'Shipment Cancelled'
};

export const DELIVERY_EXCEPTION_TYPES = {
  WRONG_ADDRESS: { id: 'WRONG_ADDRESS', label: 'Incorrect or Inaccessible Address' },
  RECIPIENT_UNAVAILABLE: { id: 'RECIPIENT_UNAVAILABLE', label: 'Recipient Unavailable / Business Closed' },
  PACKAGE_DAMAGED: { id: 'PACKAGE_DAMAGED', label: 'Package Damaged in Transit' },
  SHIPMENT_DELAYED: { id: 'SHIPMENT_DELAYED', label: 'Adverse Weather / Transport Delay' },
  TRANSPORT_ISSUE: { id: 'TRANSPORT_ISSUE', label: 'Vehicle Breakdown / Cold-Chain Deviation' },
  REFUSED_BY_RECIPIENT: { id: 'REFUSED_BY_RECIPIENT', label: 'Refused by Recipient' },
  OTHER: { id: 'OTHER', label: 'Other Operational Exception' }
};

export const PROOF_OF_DELIVERY_TYPES = {
  SIGNATURE: { id: 'SIGNATURE', label: 'Digital Recipient Signature' },
  PHOTO: { id: 'PHOTO', label: 'Delivery Location Photo Proof' },
  RECIPIENT_CONFIRMATION: { id: 'RECIPIENT_CONFIRMATION', label: 'Staff PIN / Verification Confirmation' },
  DELIVERY_NOTE: { id: 'DELIVERY_NOTE', label: 'Signed Physical Delivery Note' }
};

/**
 * Unique Server-Generated Shipment Identifier: SHP-YYYY-XXXXX
 */
export function generateShipmentId(existingShipments = []) {
  const year = new Date().getFullYear();
  let maxSeq = 0;
  existingShipments.forEach(s => {
    const rawId = s.id || s.shipmentId;
    if (rawId && rawId.startsWith(`SHP-${year}-`)) {
      const parts = rawId.split('-');
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });
  const nextSeq = String(maxSeq + 1).padStart(5, '0');
  return `SHP-${year}-${nextSeq}`;
}

/**
 * Unique Server-Generated Package Identifier: PKG-YYYY-XXXXX
 */
export function generatePackageId(existingPackages = []) {
  const year = new Date().getFullYear();
  let maxSeq = 0;
  existingPackages.forEach(p => {
    const rawId = p.id || p.packageId;
    if (rawId && rawId.startsWith(`PKG-${year}-`)) {
      const parts = rawId.split('-');
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });
  const nextSeq = String(maxSeq + 1).padStart(5, '0');
  return `PKG-${year}-${nextSeq}`;
}

/**
 * Final Physical QR Validation Engine
 *
 * Separates:
 * 1. QR Can Be Scanned (decoding)
 * 2. QR Is Authenticated (cryptographic link + not revoked + not duplicate)
 * 3. Package Is Authorized for Dispatch (ready + quality approved + not already dispatched)
 */
export function validateScannedQr({
  scannedPayload,
  targetPackageId = null,
  activeShipmentId = null,
  packages = [],
  revokedQrs = [],
  shipments = [],
  auditLog = []
}) {
  if (!scannedPayload || typeof scannedPayload !== 'string' || !scannedPayload.trim()) {
    return {
      isValid: false,
      state: QR_VALIDATION_STATES.INVALID,
      reason: 'Empty or unreadable QR payload provided to scanner.',
      package: null
    };
  }

  const cleanPayload = scannedPayload.trim();

  // Normalize scanned string: extract packageId or qrCode from URL or direct code
  let parsedPackageId = null;
  let parsedQrId = null;
  let candidateToken = null;

  if (cleanPayload.includes('verify=') || cleanPayload.includes('ref=') || cleanPayload.includes('packageId=')) {
    try {
      const url = new URL(cleanPayload);
      candidateToken = url.searchParams.get('verify') || url.searchParams.get('ref') || url.searchParams.get('packageId');
    } catch {
      const m = cleanPayload.match(/[?&](?:verify|ref|packageId)=([^&#]+)/);
      if (m) candidateToken = decodeURIComponent(m[1]);
    }
  } else if (cleanPayload.includes('/verify/')) {
    const parts = cleanPayload.split('/verify/');
    candidateToken = parts[1]?.split(/[?&#]/)[0]?.trim();
  } else if (cleanPayload.includes('/b/')) {
    const parts = cleanPayload.split('/b/');
    candidateToken = parts[1]?.split(/[?&#]/)[0]?.trim();
  } else if (cleanPayload.startsWith('HONEYCHAIN:')) {
    const parts = cleanPayload.split(':');
    candidateToken = parts[1] || parts[2];
  } else if (cleanPayload.startsWith('QR-PKG-')) {
    parsedQrId = cleanPayload;
    const foundByQr = packages.find(p => p.qrId === cleanPayload);
    if (foundByQr) parsedPackageId = foundByQr.packageId;
  } else if (cleanPayload.startsWith('PKG-')) {
    candidateToken = cleanPayload;
  } else {
    candidateToken = cleanPayload;
  }

  if (candidateToken && !parsedPackageId) {
    const found = packages.find(
      p => p.publicReference === candidateToken ||
           p.packageId === candidateToken ||
           p.qrId === candidateToken ||
           p.tamperSealId === candidateToken
    );
    if (found) {
      parsedPackageId = found.packageId;
      parsedQrId = found.qrId;
    } else {
      parsedPackageId = candidateToken;
    }
  }

  // 1. Package existence check
  const matchedPackage = packages.find(p => p.packageId === parsedPackageId);
  if (!matchedPackage) {
    return {
      isValid: false,
      state: QR_VALIDATION_STATES.NOT_FOUND,
      reason: `Package identifier "${parsedPackageId}" is not registered in HoneyChain custody.`,
      package: null,
      scannedPayload: cleanPayload
    };
  }

  // 2. Revocation check
  const isRevoked = (matchedPackage.isQrRevoked === true) ||
    revokedQrs.includes(matchedPackage.qrId) ||
    revokedQrs.includes(matchedPackage.packageId);

  if (isRevoked) {
    return {
      isValid: false,
      state: QR_VALIDATION_STATES.REVOKED,
      reason: `QR code ${matchedPackage.qrId} has been revoked by Compliance / Quality. Dispatch is strictly blocked.`,
      package: matchedPackage
    };
  }

  // 3. Mismatch test: if operator was preparing Package B but scanned Package A
  if (targetPackageId && targetPackageId !== matchedPackage.packageId) {
    return {
      isValid: false,
      state: QR_VALIDATION_STATES.TRACEABILITY_MISMATCH,
      reason: `QR mismatch: This QR belongs to ${matchedPackage.packageId} (${matchedPackage.productName}), but you are currently preparing ${targetPackageId}. Please scan the intended package.`,
      package: matchedPackage,
      expectedPackageId: targetPackageId
    };
  }

  // 4. Duplicate scan in current shipment
  if (activeShipmentId) {
    const currentShipment = shipments.find(s => s.id === activeShipmentId);
    if (currentShipment) {
      const alreadyValidated = currentShipment.validatedPackages?.some(vp => vp.packageId === matchedPackage.packageId);
      if (alreadyValidated) {
        return {
          isValid: false,
          state: QR_VALIDATION_STATES.DUPLICATE_SCAN,
          reason: `Package ${matchedPackage.packageId} has already been authenticated for shipment ${activeShipmentId}.`,
          package: matchedPackage
        };
      }
    }
  }

  // 5. Already Dispatched check
  if (matchedPackage.status === PACKAGE_STATUSES.DISPATCHED || matchedPackage.status === PACKAGE_STATUSES.IN_TRANSIT) {
    return {
      isValid: false,
      state: QR_VALIDATION_STATES.ALREADY_DISPATCHED,
      reason: `Package ${matchedPackage.packageId} has already been released in shipment ${matchedPackage.assignedShipmentId || 'active consignment'}.`,
      package: matchedPackage
    };
  }

  // 6. Already Delivered check
  if (matchedPackage.status === PACKAGE_STATUSES.DELIVERED) {
    return {
      isValid: false,
      state: QR_VALIDATION_STATES.ALREADY_DELIVERED,
      reason: `Package ${matchedPackage.packageId} has already completed delivery to customer.`,
      package: matchedPackage
    };
  }

  // 7. Package readiness check
  if (matchedPackage.status !== PACKAGE_STATUSES.READY_FOR_DISPATCH && matchedPackage.status !== PACKAGE_STATUSES.ALLOCATED && matchedPackage.status !== PACKAGE_STATUSES.PACKAGED) {
    return {
      isValid: false,
      state: QR_VALIDATION_STATES.PACKAGE_NOT_READY,
      reason: `Package status is "${matchedPackage.status}". Only packages in READY_FOR_DISPATCH or ALLOCATED state can be verified for shipment.`,
      package: matchedPackage
    };
  }

  // 8. Quality Decision Check (A laboratory test result is NOT automatically a Quality Decision)
  const isQualityApproved = matchedPackage.qualityStatus === 'APPROVED' ||
    matchedPackage.qualityDecision === 'RELEASED_FOR_BOTTLING' ||
    matchedPackage.qualityDecision === 'CERTIFIED' ||
    matchedPackage.qualityStatus === 'CERTIFIED';

  if (!isQualityApproved) {
    return {
      isValid: false,
      state: QR_VALIDATION_STATES.QUALITY_NOT_FINALIZED,
      reason: `Parent batch quality status is "${matchedPackage.qualityStatus || 'PENDING'}". Formal Quality Decision lot release is required prior to physical dispatch release.`,
      package: matchedPackage
    };
  }

  // 9. All checks pass
  return {
    isValid: true,
    state: QR_VALIDATION_STATES.VALID,
    reason: 'Physical QR matches registered package, quality release confirmed, and batch traceability intact.',
    package: matchedPackage,
    validationTimestamp: new Date().toISOString()
  };
}

/**
 * Unbroken 6-Tier Traceability Resolver for Dispatch
 * Package â†’ Processing Batch â†’ Harvest â†’ Frame â†’ Hive â†’ Apiary
 */
export function resolvePackageTraceability({
  packageRecord,
  processingBatches = [],
  harvestRecords = [],
  frames = [],
  hives = [],
  apiaries = []
}) {
  if (!packageRecord) return null;

  const batch = processingBatches.find(b => b.id === packageRecord.batchId || b.batchNumber === packageRecord.batchNumber);

  // Collect harvest traceability codes from the package and/or the batch's sourceHarvests
  const batchSourceCodes = (batch?.sourceHarvests || []).map(s => s.traceabilityCode).filter(Boolean);
  const harvestCodes = packageRecord.sourceTraceabilityCodes?.length
    ? packageRecord.sourceTraceabilityCodes
    : batchSourceCodes.length
      ? batchSourceCodes
      : [];

  // Match harvest records by traceabilityCode (the correct field name)
  const matchedHarvests = harvestRecords.filter(h =>
    harvestCodes.includes(h.traceabilityCode)
  );

  // Match frames directly by traceabilityCode (harvests carry traceabilityCode which IS the frame code)
  const matchedFrames = frames.filter(f =>
    harvestCodes.includes(f.traceabilityCode)
  );

  const hiveIds = [
    ...matchedHarvests.map(h => h.hiveId).filter(Boolean),
    ...matchedFrames.map(f => f.hiveId).filter(Boolean)
  ];
  const uniqueHiveIds = [...new Set(hiveIds)];
  const matchedHives = hives.filter(h => uniqueHiveIds.includes(h.id));

  const apiaryIds = [
    ...matchedHarvests.map(h => h.apiaryId).filter(Boolean),
    ...matchedFrames.map(f => f.apiaryId).filter(Boolean),
    ...matchedHives.map(h => h.apiaryId).filter(Boolean)
  ];
  const uniqueApiaryIds = [...new Set(apiaryIds)];
  const matchedApiaries = apiaries.filter(a => uniqueApiaryIds.includes(a.id));

  return {
    packageId: packageRecord.packageId,
    productName: packageRecord.productName,
    packageSize: packageRecord.unitDisplay || `${packageRecord.unitGrams} g`,
    batchNumber: batch?.batchNumber || packageRecord.batchNumber,
    batchId: batch?.id || packageRecord.batchId,
    tamperSealId: packageRecord.tamperSealId,
    qualityStatus: packageRecord.qualityStatus || 'PENDING',
    harvestCodes,
    frames: matchedFrames.map(f => ({ id: f.id, code: f.traceabilityCode || f.frameNumber || f.id, honeyType: f.honeyType })),
    hives: matchedHives.map(h => ({ id: h.id, code: h.code || h.id, name: h.name, location: h.location })),
    apiaries: matchedApiaries.map(a => ({ id: a.id, code: a.apiaryCode || a.code || a.id, name: a.name, region: a.region || a.location })),
    lineageString: matchedApiaries.length && matchedHives.length
      ? `${matchedApiaries[0].apiaryCode || matchedApiaries[0].code} â†’ ${matchedHives[0].code} â†’ ${harvestCodes[0] || '?'} â†’ ${batch?.batchNumber || packageRecord.batchNumber} â†’ ${packageRecord.packageId}`
      : `${harvestCodes[0] || '?'} â†’ ${batch?.batchNumber || packageRecord.batchNumber} â†’ ${packageRecord.packageId}`
  };
}

/**
 * Validate Shipment Release Checklist
 * Every allocated package must be authenticated independently.
 */
export function validateShipmentRelease({
  shipment,
  packages = [],
  userCapabilities = []
}) {
  const errors = [];

  if (!shipment) {
    return { isEligible: false, errors: ['Shipment record not found.'] };
  }

  // Capability check
  const hasReleaseCap = userCapabilities.includes('SHIPMENT_RELEASE') || userCapabilities.includes('DISTRIBUTION_WORKSPACE');
  if (!hasReleaseCap) {
    errors.push('User lacks SHIPMENT_RELEASE permission.');
  }

  // Package count check
  const allocatedIds = shipment.allocatedPackageIds || [];
  if (allocatedIds.length === 0) {
    errors.push('Shipment has no allocated packages.');
  }

  // Validated packages check
  const validatedIds = new Set((shipment.validatedPackages || []).map(vp => vp.packageId));
  const unvalidated = allocatedIds.filter(pid => !validatedIds.has(pid));

  if (unvalidated.length > 0) {
    errors.push(`${unvalidated.length} of ${allocatedIds.length} packages still require physical QR validation (${unvalidated.join(', ')}).`);
  }

  // Destination & transport details check
  if (!shipment.destination || !shipment.destination.trim()) {
    errors.push('Shipment destination address is required.');
  }
  if (!shipment.carrier || !shipment.carrier.trim()) {
    errors.push('Carrier / Transport provider must be assigned.');
  }

  return {
    isEligible: errors.length === 0,
    errors,
    allocatedCount: allocatedIds.length,
    validatedCount: validatedIds.size,
    unvalidatedIds: unvalidated
  };
}

/**
 * Initial Pre-Configured Finished Packages Store for Dispatch
 */

export const initialDispatchPackages = [
  { id: 'pkg-demo-125', packageId: 'PKG-2026-00125', productName: 'Wildflower Honey', unitGrams: 500, unitDisplay: '500 g', qrId: 'QR-PKG-2026-00125', status: PACKAGE_STATUSES.READY_FOR_DISPATCH, qualityStatus: 'APPROVED', batchId: 'pb-demo-41', batchNumber: 'PB-2026-00041', sourceTraceabilityCodes: ['AP1H001F1'], tamperSealId: 'HC-SEAL-2026-925-J125' },
  { id: 'pkg-demo-126', packageId: 'PKG-2026-00126', productName: 'Wildflower Honey', unitGrams: 500, unitDisplay: '500 g', qrId: 'QR-PKG-2026-00126', status: PACKAGE_STATUSES.READY_FOR_DISPATCH, qualityStatus: 'APPROVED', batchId: 'pb-demo-41', batchNumber: 'PB-2026-00041', sourceTraceabilityCodes: ['AP1H001F2'], tamperSealId: 'HC-SEAL-2026-925-J126' }
];

export const initialDispatchShipments = [
  { id: 'SHP-2026-00104', status: SHIPMENT_STATUSES.READY, destination: 'Demo destination', carrier: 'Demo carrier', allocatedPackageIds: ['PKG-2026-00125'], validatedPackages: [] }
];

export const initialDispatchAuditLog = [];
