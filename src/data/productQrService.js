/**
 * Screen 30 — Product & Package QR Management Service
 * 
 * CORE ARCHITECTURE (§ 2 & 20):
 * Honey Batch → Package → Public Verification Reference → QR Code → Consumer
 * 
 * The QR is an operational bridge between the physical package and the digital verification record.
 * A QR is an entry point to verification, NOT the verification itself.
 * 
 * Security & Integrity Principles (§ 10, 13, 23, 26, 40, 44):
 * - Server-side prerequisite validation (cannot generate verified QR for draft/unverified batches)
 * - Safe payloads (only public URL / public non-sequential reference, zero private MongoDB IDs, GPS, or secrets)
 * - Idempotency protection to prevent repeated taps from spawning duplicate QR records
 * - Revoking a physical QR does NOT unverify the underlying batch (§ 23)
 * - Traceable lifecycle history & replacement linkages (replacedQrId / replacementQrId)
 */

import { publicVerificationService } from './publicVerificationService';

// Default official public verification domain (§ 13, 45)
export const OFFICIAL_PUBLIC_DOMAIN = 'https://verify.honeychain.org';

// In-memory operational store for Product QR identities
let QR_STORE = {
  // Batch HC-2409: Active Verified Master Batch QR
  'batch-hc-2409': {
    qrId: 'QR-2026-8819',
    batchId: 'batch-hc-2409',
    batchNumber: 'HC-2409',
    productName: 'Raw Forest Wildflower Honey',
    honeyType: 'Multifloral Wild Forest Honey',
    packageLotId: 'Lot HC-2409-P01',
    packageCount: 37,
    packageUnit: '500g Hexagonal Food-Grade Glass Jar',
    scope: 'BATCH', // 'BATCH' | 'PACKAGE'
    packageId: null,
    status: 'ACTIVE', // 'NOT_CREATED' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'REPLACED'
    statusLabel: 'QR active',
    statusExplanation: 'This QR currently points to the public HoneyChain verification record.',
    publicReference: 'HC-PUB-7F82K9',
    publicUrl: `${OFFICIAL_PUBLIC_DOMAIN}/verify/HC-PUB-7F82K9`,
    eccLevel: 'Level M (15% Redundancy)',
    version: 'v1.4',
    createdAt: '25 Sep 2026 · 09:30 UTC',
    activatedAt: '25 Sep 2026 · 09:32 UTC',
    revokedAt: null,
    replacedQrId: null,
    replacementQrId: null,
    operator: 'Sarah Lindqvist (Master Apiarist)',
    tamperSeal: 'HC-SEAL-2026-925',
    anchorProof: {
      blockNumber: 54819240,
      txHash: '0xd942b87f619e083a21dc49019b841e2a537f',
      merkleRoot: '0x3f9801a4e5bc1209e86d23fb482b9a710255'
    },
    history: [
      {
        id: 'qrh-01',
        event: 'QR_CREATED',
        title: 'Product QR Created',
        timestamp: '25 Sep 2026 · 09:30 UTC',
        actor: 'Sarah Lindqvist (Master Apiarist)',
        notes: 'Generated after verification sign-off for Lot HC-2409-P01.'
      },
      {
        id: 'qrh-02',
        event: 'QR_ACTIVATED',
        title: 'Activated on Public Registry',
        timestamp: '25 Sep 2026 · 09:32 UTC',
        actor: 'HoneyChain Trust Network Engine',
        notes: `Route mapped to ${OFFICIAL_PUBLIC_DOMAIN}/verify/HC-PUB-7F82K9.`
      },
      {
        id: 'qrh-03',
        event: 'LABEL_PRINTED',
        title: 'Production Labels Printed',
        timestamp: '25 Sep 2026 · 10:15 UTC',
        actor: 'Packaging Line Station #1',
        notes: '37 tamper-evident hexagonal jar labels printed (Label Spec HC-LBL-500).'
      }
    ]
  },

  // Batch HB-2026-08: Certified Production Batch
  'batch-hb-2026-08': {
    qrId: 'QR-2026-7241',
    batchId: 'batch-hb-2026-08',
    batchNumber: 'HB-2026-08',
    productName: 'Wild Blackberry & Sweet Clover',
    honeyType: 'Wild Blackberry & Clover Honey',
    packageLotId: 'Lot HB-2026-08-L1',
    packageCount: 260,
    packageUnit: '500g Glass Hexagonal',
    scope: 'BATCH',
    packageId: null,
    status: 'ACTIVE',
    statusLabel: 'QR active',
    statusExplanation: 'This QR currently points to the public HoneyChain verification record.',
    publicReference: 'HC-PUB-2608W',
    publicUrl: `${OFFICIAL_PUBLIC_DOMAIN}/verify/HC-PUB-2608W`,
    eccLevel: 'Level M (15% Redundancy)',
    version: 'v1.2',
    createdAt: '18 Sep 2026 · 14:20 UTC',
    activatedAt: '18 Sep 2026 · 14:25 UTC',
    revokedAt: null,
    replacedQrId: null,
    replacementQrId: null,
    operator: 'Marcus K. (Lead Processor)',
    tamperSeal: 'HC-SEAL-2026-818',
    anchorProof: {
      blockNumber: 54790112,
      txHash: '0x8b3f912c4189e49120bc98319fca448912e',
      merkleRoot: '0x7a8f3b92c4e190ad6f51cb7e4281'
    },
    history: [
      {
        id: 'qrh-08-1',
        event: 'QR_CREATED',
        title: 'Product QR Created',
        timestamp: '18 Sep 2026 · 14:20 UTC',
        actor: 'Marcus K. (Lead Processor)',
        notes: 'Created for 260-jar certified production run.'
      },
      {
        id: 'qrh-08-2',
        event: 'QR_ACTIVATED',
        title: 'Activated on Public Registry',
        timestamp: '18 Sep 2026 · 14:25 UTC',
        actor: 'HoneyChain Trust Network Engine',
        notes: 'Public routing active.'
      }
    ]
  },

  // Batch HC-2408: Needs Review / Suspended QR Scenario
  'batch-hc-2408': {
    qrId: 'QR-2026-6102',
    batchId: 'batch-hc-2408',
    batchNumber: 'HC-2408',
    productName: 'Mountain Lavender & Wild Thyme Honey',
    honeyType: 'Lavender & Wild Thyme Blend',
    packageLotId: 'Lot HC-2408-P02',
    packageCount: 42,
    packageUnit: '350g Glass Jar',
    scope: 'BATCH',
    packageId: null,
    status: 'SUSPENDED',
    statusLabel: 'QR suspended',
    statusExplanation: 'This QR is temporarily suspended pending additional laboratory verification.',
    publicReference: 'HC-PUB-3M91QX',
    publicUrl: `${OFFICIAL_PUBLIC_DOMAIN}/verify/HC-PUB-3M91QX`,
    eccLevel: 'Level M (15% Redundancy)',
    version: 'v1.1',
    createdAt: '14 Sep 2026 · 11:10 UTC',
    activatedAt: '14 Sep 2026 · 11:15 UTC',
    revokedAt: null,
    replacedQrId: null,
    replacementQrId: null,
    operator: 'Elena Vance (Lead Quality Inspector)',
    tamperSeal: 'HC-SEAL-2026-781',
    anchorProof: {
      blockNumber: 54721090,
      txHash: '0x3f12a89c44e9812bc0912da74e190',
      merkleRoot: '0x99a21b44e019'
    },
    history: [
      {
        id: 'qrh-08-s1',
        event: 'QR_CREATED',
        title: 'Product QR Created',
        timestamp: '14 Sep 2026 · 11:10 UTC',
        actor: 'Elena Vance',
        notes: 'Generated during packaging inspection.'
      },
      {
        id: 'qrh-08-s2',
        event: 'QR_SUSPENDED',
        title: 'QR Access Suspended',
        timestamp: '22 Sep 2026 · 16:40 UTC',
        actor: 'Quality Assurance Board',
        notes: 'Hold placed due to seasonal moisture re-verification requirement.'
      }
    ]
  },

  // Package-Specific Serialized Demonstration Record (PKG-0042)
  'package-pkg-0042': {
    qrId: 'QR-PKG-2026-0042',
    batchId: 'batch-hc-2409',
    batchNumber: 'HC-2409',
    productName: 'Raw Forest Wildflower Honey (Single Jar)',
    honeyType: 'Multifloral Wild Forest Honey',
    packageLotId: 'Lot HC-2409-P01',
    packageCount: 1,
    packageUnit: 'Individual 500g Jar #42 of 37',
    scope: 'PACKAGE',
    packageId: 'PKG-0042',
    status: 'ACTIVE',
    statusLabel: 'Package QR active',
    statusExplanation: 'This QR uniquely identifies individual Jar #PKG-0042 from Batch HC-2409.',
    publicReference: 'HC-PUB-PKG-0042',
    publicUrl: `${OFFICIAL_PUBLIC_DOMAIN}/verify/HC-PUB-PKG-0042`,
    eccLevel: 'Level H (30% Redundancy)',
    version: 'v1.4-pkg',
    createdAt: '25 Sep 2026 · 10:15 UTC',
    activatedAt: '25 Sep 2026 · 10:16 UTC',
    revokedAt: null,
    replacedQrId: null,
    replacementQrId: null,
    operator: 'Sarah Lindqvist (Master Apiarist)',
    tamperSeal: 'HC-SEAL-2026-925-J42',
    anchorProof: {
      blockNumber: 54819240,
      txHash: '0xd942b87f619e083a21dc49019b841e2a537f',
      merkleRoot: '0x3f9801a4e5bc1209e86d23fb482b9a710255'
    },
    history: [
      {
        id: 'qrh-p42-1',
        event: 'QR_CREATED',
        title: 'Serialized Package QR Created',
        timestamp: '25 Sep 2026 · 10:15 UTC',
        actor: 'Sarah Lindqvist',
        notes: 'Serialized package QR bound to tamper-evident seal HC-SEAL-2026-925-J42.'
      }
    ]
  }
};

// Serialized package items derived from Lot HC-2409-P01
const LOT_PACKAGES_HC2409 = Array.from({ length: 37 }, (_, i) => {
  const num = String(i + 1).padStart(4, '0');
  const pkgId = `PKG-${num}`;
  return {
    packageId: pkgId,
    batchId: 'batch-hc-2409',
    batchNumber: 'HC-2409',
    serialNumber: `HC-2409-J${num}`,
    label: `Jar #${i + 1} (${pkgId})`,
    volume: '500g Glass Hexagonal',
    sealNumber: `HC-SEAL-2026-925-J${i + 1}`,
    hasSpecificQr: pkgId === 'PKG-0042' || i === 0,
    publicReference: pkgId === 'PKG-0042' ? 'HC-PUB-PKG-0042' : 'HC-PUB-7F82K9'
  };
});

export const productQrService = {
  /**
   * Retrieve QR record by batchId or packageId (§ 20)
   */
  async getQrForBatch(batchId, packageId = null) {
    // Artificial slight latency to reflect authentic state lookup
    await new Promise((r) => setTimeout(r, 60));

    if (packageId) {
      const pkgKey = `package-${packageId.toLowerCase()}`;
      if (QR_STORE[pkgKey]) return { ...QR_STORE[pkgKey] };
    }

    if (QR_STORE[batchId]) {
      return { ...QR_STORE[batchId] };
    }

    // Return clean NOT_CREATED state if no record exists
    return {
      qrId: null,
      batchId,
      batchNumber: batchId.replace('batch-', '').toUpperCase(),
      productName: 'Honey Product',
      scope: packageId ? 'PACKAGE' : 'BATCH',
      packageId,
      status: 'NOT_CREATED',
      statusLabel: 'No product QR yet',
      statusExplanation: 'Create a QR that connects this product to its HoneyChain verification record.',
      publicReference: null,
      publicUrl: null,
      createdAt: null,
      history: []
    };
  },

  /**
   * Prerequisite Validation (§ 8 & 9)
   * Before QR creation, backend must verify that required verification exists.
   */
  validateCreationPrerequisites(batch) {
    if (!batch) {
      return {
        eligible: false,
        code: 'BATCH_NOT_FOUND',
        reason: 'Selected batch does not exist.'
      };
    }

    const isVerified =
      batch.status === 'certified' ||
      batch.verification?.isVerified === true ||
      batch.journey?.some(
        (j) => j.stage === 'Verification' || j.title === 'Batch Verified & Sealed'
      );

    if (!isVerified) {
      return {
        eligible: false,
        code: 'BATCH_NOT_VERIFIED',
        reason: 'This product isn\'t ready for QR creation yet. Complete quality inspection and verification first.',
        requiredStep: 'Verification'
      };
    }

    return {
      eligible: true,
      code: 'READY',
      reason: 'Batch meets all verification prerequisites for product QR issuance.'
    };
  },

  /**
   * Create Product QR (§ 10, 11, 26)
   * Idempotent: returns existing active QR if already created.
   */
  async createQr(batch, options = {}) {
    await new Promise((r) => setTimeout(r, 450)); // Simulated cryptographic issuance latency

    const prereq = this.validateCreationPrerequisites(batch);
    if (!prereq.eligible) {
      throw new Error(prereq.reason);
    }

    const batchId = batch.id;
    const existing = QR_STORE[batchId];

    // Idempotency protection (§ 26)
    if (existing && existing.status === 'ACTIVE' && !options.forceReplace) {
      return { ...existing, isExisting: true };
    }

    // Generate unique, non-sequential reference (§ 14)
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const publicRef = options.publicReference || `HC-PUB-${randomHex}`;
    const qrId = `QR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const actor = options.actor || 'Sarah Lindqvist (Master Apiarist)';

    const newRecord = {
      qrId,
      batchId,
      batchNumber: batch.batchNumber || batchId.replace('batch-', '').toUpperCase(),
      productName: batch.name || 'Raw Forest Wildflower Honey',
      honeyType: batch.pollenAnalysis || 'Multifloral Wild Forest Honey',
      packageLotId: batch.verification?.verificationLotId || `Lot ${batch.batchNumber || 'HC-2409'}-P01`,
      packageCount: batch.lotJarsCount || 37,
      packageUnit: batch.jarVolume || '500g Hexagonal Food-Grade Glass Jar',
      scope: options.scope || 'BATCH',
      packageId: options.packageId || null,
      status: 'ACTIVE',
      statusLabel: 'QR active',
      statusExplanation: 'This QR currently points to the public HoneyChain verification record.',
      publicReference: publicRef,
      publicUrl: `${OFFICIAL_PUBLIC_DOMAIN}/verify/${publicRef}`,
      eccLevel: 'Level M (15% Redundancy)',
      version: 'v1.4',
      createdAt: nowStr,
      activatedAt: nowStr,
      revokedAt: null,
      replacedQrId: null,
      replacementQrId: null,
      operator: actor,
      tamperSeal: batch.sealHash ? `HC-SEAL-${batch.sealHash.slice(2, 9)}` : 'HC-SEAL-2026-925',
      anchorProof: {
        blockNumber: batch.verification?.blockNumber || 54819240,
        txHash: batch.verification?.txHash || '0xd942b87f619e083a21dc49019b841e2a537f',
        merkleRoot: batch.verification?.merkleRoot || '0x3f9801a4e5bc1209e86d23fb482b9a710255'
      },
      history: [
        {
          id: `qrh-${Date.now()}-1`,
          event: 'QR_CREATED',
          title: 'Product QR Created',
          timestamp: nowStr,
          actor,
          notes: 'Issued and mapped to verified batch digital record.'
        },
        {
          id: `qrh-${Date.now()}-2`,
          event: 'QR_ACTIVATED',
          title: 'Activated on Public Registry',
          timestamp: nowStr,
          actor: 'HoneyChain Trust Network Engine',
          notes: `Public verification URL live: ${OFFICIAL_PUBLIC_DOMAIN}/verify/${publicRef}`
        }
      ]
    };

    QR_STORE[batchId] = newRecord;
    return { ...newRecord };
  },

  /**
   * Revoke QR Record (§ 22 & 23)
   * IMPORTANT: Revoking the QR does NOT unverify the underlying batch!
   */
  async revokeQr(batchId, reason = 'Product seal packaging recalled or damaged', actor = 'Sarah Lindqvist') {
    await new Promise((r) => setTimeout(r, 350));
    const current = QR_STORE[batchId];
    if (!current) throw new Error('No QR record found to revoke.');

    const nowStr = new Date().toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    current.status = 'REVOKED';
    current.statusLabel = 'QR revoked';
    current.statusExplanation = 'This QR is no longer valid. The batch verification record remains intact in the ledger, but this physical QR access point has been revoked.';
    current.revokedAt = nowStr;

    current.history.unshift({
      id: `qrh-rev-${Date.now()}`,
      event: 'QR_REVOKED',
      title: 'QR Code Revoked',
      timestamp: nowStr,
      actor,
      notes: reason
    });

    QR_STORE[batchId] = { ...current };
    return { ...current };
  },

  /**
   * Replace QR Record (§ 24 & 25)
   * Generates a new replacement QR and marks previous QR as REPLACED.
   */
  async replaceQr(batchId, batch, reason = 'Packaging label reprinted with updated seal', actor = 'Sarah Lindqvist') {
    await new Promise((r) => setTimeout(r, 450));
    const old = QR_STORE[batchId];
    if (!old) throw new Error('No existing QR record found to replace.');

    const oldQrId = old.qrId;
    const oldPublicRef = old.publicReference;
    const newRandomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newPublicRef = `HC-PUB-${newRandomHex}`;
    const newQrId = `QR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const nowStr = new Date().toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // New active QR record
    const updatedRecord = {
      ...old,
      qrId: newQrId,
      status: 'ACTIVE',
      statusLabel: 'QR active (Replacement)',
      statusExplanation: 'This QR currently points to the public HoneyChain verification record.',
      publicReference: newPublicRef,
      publicUrl: `${OFFICIAL_PUBLIC_DOMAIN}/verify/${newPublicRef}`,
      createdAt: nowStr,
      activatedAt: nowStr,
      revokedAt: null,
      replacedQrId: oldQrId,
      replacementQrId: null,
      history: [
        {
          id: `qrh-rep-${Date.now()}`,
          event: 'QR_REPLACED',
          title: 'Replacement QR Activated',
          timestamp: nowStr,
          actor,
          notes: `Replaced previous ${oldQrId} (${oldPublicRef}). Reason: ${reason}`
        },
        ...old.history
      ]
    };

    QR_STORE[batchId] = updatedRecord;
    return { ...updatedRecord };
  },

  /**
   * Suspend / Reactivate QR
   */
  async toggleSuspendQr(batchId, actor = 'Sarah Lindqvist') {
    await new Promise((r) => setTimeout(r, 250));
    const current = QR_STORE[batchId];
    if (!current) throw new Error('No QR record found.');

    const nowStr = new Date().toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    if (current.status === 'SUSPENDED') {
      current.status = 'ACTIVE';
      current.statusLabel = 'QR active';
      current.statusExplanation = 'This QR currently points to the public HoneyChain verification record.';
      current.history.unshift({
        id: `qrh-react-${Date.now()}`,
        event: 'QR_REACTIVATED',
        title: 'QR Reactivated',
        timestamp: nowStr,
        actor,
        notes: 'Administrative suspension lifted.'
      });
    } else {
      current.status = 'SUSPENDED';
      current.statusLabel = 'QR suspended';
      current.statusExplanation = 'This QR is temporarily unavailable.';
      current.history.unshift({
        id: `qrh-susp-${Date.now()}`,
        event: 'QR_SUSPENDED',
        title: 'QR Suspended',
        timestamp: nowStr,
        actor,
        notes: 'Temporary operational hold.'
      });
    }

    QR_STORE[batchId] = { ...current };
    return { ...current };
  },

  /**
   * Get serialized packages for a batch (§ 27 & 38)
   */
  getPackagesForBatch(batchId) {
    if (batchId === 'batch-hc-2409') {
      return LOT_PACKAGES_HC2409;
    }
    return [];
  },

  /**
   * Demo Scenarios for Jury & Evaluation (§ 56)
   */
  getSampleScenarios() {
    return [
      {
        id: 'scenario-active',
        batchId: 'batch-hc-2409',
        label: 'Batch HC-2409 · Active QR',
        badge: 'Active Verified',
        description: 'Standard active batch QR linking directly to verified public journey.'
      },
      {
        id: 'scenario-ready-create',
        batchId: 'batch-certified-uncreated',
        label: 'Batch HC-2410 · Ready to Issue',
        badge: 'Prerequisites Met',
        description: 'Certified batch meeting all prerequisites, ready to create initial product QR.'
      },
      {
        id: 'scenario-unverified',
        batchId: 'batch-hc-draft',
        label: 'Draft Batch · Not Created',
        badge: 'Prerequisite Guard',
        description: 'Draft unverified batch demonstrating server-side creation restriction.'
      },
      {
        id: 'scenario-suspended',
        batchId: 'batch-hc-2408',
        label: 'Batch HC-2408 · Suspended QR',
        badge: 'Suspended',
        description: 'Operational hold state while retaining immutable record.'
      },
      {
        id: 'scenario-package',
        batchId: 'batch-hc-2409',
        packageId: 'PKG-0042',
        label: 'Package PKG-0042 · Serialized QR',
        badge: 'Package Level',
        description: 'Individual jar serialization demonstrating Batch ≠ Package architecture.'
      }
    ];
  },

  /**
   * Truncate and wipe all existing QR store records for clean manual testing
   */
  truncateQrStore() {
    QR_STORE = {};
  }
};
