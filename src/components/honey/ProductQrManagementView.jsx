import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { productQrService, OFFICIAL_PUBLIC_DOMAIN } from '../../data/productQrService';
import {
  ArrowLeft,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Share2,
  Printer,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  X,
  Lock,
  Eye,
  Info,
  Package,
  Calendar,
  Clock,
  Ban,
  FileCheck
} from 'lucide-react';

/**
 * Screen 30 — Product / Package QR Management
 * 
 * Internal operational workflow connecting physical packages to digital verification records.
 * Architecture: Batch → Packaging → Verification → Public Reference → QR → Consumer Scan → Public Verification
 */
export const ProductQrManagementView = ({
  isOpen = true,
  onClose,
  batchId: propBatchId,
  packageId: propPackageId
}) => {
  const {
    batches,
    activePublicVerification,
    openPublicVerification,
    openVerification,
    openProductPackaging,
    showToast,
    session
  } = useAppState();

  // Active batch resolution
  const targetBatchId = propBatchId || 'batch-hc-2409';
  const currentBatch = useMemo(() => {
    const found = batches.find((b) => b.id === targetBatchId);
    if (found) return found;
    if (targetBatchId === 'batch-hc-draft') {
      return {
        id: 'batch-hc-draft',
        batchNumber: 'HC-DRAFT-01',
        name: 'Unverified Summer Honey',
        status: 'draft',
        lotJarsCount: 50,
        jarVolume: '500g Glass Jar',
        verification: { isVerified: false }
      };
    }
    if (targetBatchId === 'batch-certified-uncreated') {
      return {
        id: 'batch-certified-uncreated',
        batchNumber: 'HC-2410',
        name: 'Pure Acacia Spring Blossom',
        status: 'certified',
        lotJarsCount: 45,
        jarVolume: '500g Hexagonal Jar',
        sealHash: '0x4f819a2c1089e',
        verification: {
          isVerified: true,
          verificationLotId: 'Lot HC-2410-P01'
        }
      };
    }
    return batches[0] || {
      id: 'batch-hc-2409',
      batchNumber: 'HC-2409',
      name: 'Raw Forest Wildflower Honey',
      status: 'certified',
      lotJarsCount: 37,
      jarVolume: '500g Glass Hexagonal',
      sealHash: '0x8b3f912c4189e49120bc'
    };
  }, [batches, targetBatchId]);

  // Operational State Machine (§ 46)
  // 'LOADING' | 'READY' | 'CREATING' | 'REVOKING' | 'REPLACING'
  const [viewState, setViewState] = useState('LOADING');
  const [qrRecord, setQrRecord] = useState(null);
  const [activeScope, setActiveScope] = useState(propPackageId ? 'PACKAGE' : 'BATCH'); // 'BATCH' | 'PACKAGE'
  const [selectedPackageId, setSelectedPackageId] = useState(propPackageId || 'PKG-0042');

  // Interactive Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isJuryDrawerOpen, setIsJuryDrawerOpen] = useState(false);
  const [isTechnicalExpanded, setIsTechnicalExpanded] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [revokeReason, setRevokeReason] = useState('Damaged packaging label during storage');
  const [replaceReason, setReplaceReason] = useState('Reprinting with updated regional seals');

  // Load QR record from service (§ 20)
  const loadQrData = useCallback(async () => {
    setViewState('LOADING');
    try {
      const record = await productQrService.getQrForBatch(
        currentBatch.id,
        activeScope === 'PACKAGE' ? selectedPackageId : null
      );
      setQrRecord(record);
      setViewState('READY');
    } catch (err) {
      console.error('Failed to load QR record:', err);
      setViewState('READY');
    }
  }, [currentBatch.id, activeScope, selectedPackageId]);

  useEffect(() => {
    if (isOpen) {
      loadQrData();
    }
  }, [isOpen, loadQrData]);

  // Check verification eligibility (§ 8 & 9)
  const prereqCheck = useMemo(() => {
    return productQrService.validateCreationPrerequisites(currentBatch);
  }, [currentBatch]);

  // Handle Create QR (§ 10, 11)
  const handleConfirmCreate = async () => {
    setIsCreateModalOpen(false);
    setViewState('CREATING');
    try {
      const newRecord = await productQrService.createQr(currentBatch, {
        scope: activeScope,
        packageId: activeScope === 'PACKAGE' ? selectedPackageId : null,
        actor: session?.operator || 'Sarah Lindqvist (Master Apiarist)'
      });
      setQrRecord(newRecord);
      setViewState('READY');
      showToast('Product QR created successfully');
    } catch (err) {
      showToast(err.message || 'Could not create QR');
      setViewState('READY');
    }
  };

  // Handle Revoke QR (§ 22, 23)
  const handleConfirmRevoke = async () => {
    setIsRevokeModalOpen(false);
    setViewState('REVOKING');
    try {
      const updated = await productQrService.revokeQr(
        currentBatch.id,
        revokeReason,
        session?.operator || 'Sarah Lindqvist'
      );
      setQrRecord(updated);
      setViewState('READY');
      showToast('QR revoked. Batch verification preserved in ledger.');
    } catch (err) {
      showToast('Failed to revoke QR');
      setViewState('READY');
    }
  };

  // Handle Replace QR (§ 24, 25)
  const handleConfirmReplace = async () => {
    setIsReplaceModalOpen(false);
    setViewState('REPLACING');
    try {
      const updated = await productQrService.replaceQr(
        currentBatch.id,
        currentBatch,
        replaceReason,
        session?.operator || 'Sarah Lindqvist'
      );
      setQrRecord(updated);
      setViewState('READY');
      showToast('Replacement QR generated and activated');
    } catch (err) {
      showToast('Failed to replace QR');
      setViewState('READY');
    }
  };

  // Copy reference with feedback (§ 31)
  const handleCopyReference = () => {
    if (!qrRecord?.publicReference) return;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(qrRecord.publicReference);
      }
    } catch (e) {}
    setCopiedToken(true);
    showToast(`Copied reference: ${qrRecord.publicReference}`);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Native share or fallback URL copy (§ 32)
  const handleShare = () => {
    if (!qrRecord?.publicUrl) return;
    if (navigator.share) {
      navigator
        .share({
          title: `${currentBatch.name} — HoneyChain Public Verification`,
          text: `Verify the authenticity and origin journey for ${currentBatch.name} (${currentBatch.batchNumber}) on HoneyChain.`,
          url: qrRecord.publicUrl
        })
        .catch(() => {});
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(qrRecord.publicUrl);
      }
      showToast('Public verification link copied');
    }
  };

  // Open Screen 28 Public Verification (§ 30)
  const handleOpenPublicView = () => {
    if (openPublicVerification) {
      openPublicVerification(qrRecord?.publicReference || 'HC-2409');
    }
  };

  // Package serialization list (§ 27)
  const packageList = useMemo(() => {
    return productQrService.getPackagesForBatch(currentBatch.id);
  }, [currentBatch.id]);

  if (!isOpen) return null;

  const isQrActive = qrRecord?.status === 'ACTIVE';
  const isQrNotCreated = !qrRecord || qrRecord.status === 'NOT_CREATED';
  const isQrSuspended = qrRecord?.status === 'SUSPENDED';
  const isQrRevoked = qrRecord?.status === 'REVOKED';
  const isQrReplaced = qrRecord?.status === 'REPLACED';

  return (
    <div className="product-qr-overlay" role="dialog" aria-modal="true">
      <div className="product-qr-container">
        
        {/* =========================================================================
            HEADER BAR (§ 4)
            ========================================================================= */}
        <header className="pqr-header">
          <div className="pqr-header-left">
            <button
              type="button"
              className="pqr-back-btn"
              onClick={onClose}
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="pqr-header-titles">
              <span className="pqr-header-eyebrow">Screen 30 · Product Operations</span>
              <h1 className="pqr-header-title">Product QR</h1>
              <p className="pqr-header-sub">
                Manage the QR linked to this honey product.
              </p>
            </div>
          </div>

          <div className="pqr-header-right">
            <button
              type="button"
              className="pqr-demo-pill"
              onClick={() => setIsJuryDrawerOpen(true)}
              title="Open Jury Demonstration Scenarios"
            >
              <Sparkles size={13} />
              <span>Demo</span>
            </button>
          </div>
        </header>

        {/* =========================================================================
            JURY DEMO DRAWER (§ 56)
            ========================================================================= */}
        {isJuryDrawerOpen && (
          <div className="pqr-drawer-card">
            <div className="pqr-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#D99A24" />
                <h3 className="pqr-drawer-title">Jury Demonstration Scenarios</h3>
              </div>
              <button
                type="button"
                className="pqr-drawer-close"
                onClick={() => setIsJuryDrawerOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="pqr-drawer-subtitle">
              Evaluate end-to-end QR lifecycle, prerequisite guards, and batch vs package serialization:
            </p>
            <div className="pqr-demo-grid">
              {productQrService.getSampleScenarios().map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  className={`pqr-scenario-chip ${
                    targetBatchId === scenario.batchId && (!scenario.packageId || selectedPackageId === scenario.packageId)
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => {
                    setIsJuryDrawerOpen(false);
                    if (scenario.packageId) {
                      setActiveScope('PACKAGE');
                      setSelectedPackageId(scenario.packageId);
                    } else {
                      setActiveScope('BATCH');
                    }
                    loadQrData();
                  }}
                >
                  <div className="chip-top">
                    <span className="chip-badge">{scenario.badge}</span>
                    <span className="chip-name">{scenario.label}</span>
                  </div>
                  <p className="chip-desc">{scenario.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            PRODUCT & BATCH COMPACT CONTEXT (§ 4 & 27)
            ========================================================================= */}
        <div className="pqr-context-strip">
          <div className="pqr-context-left">
            <span className="pqr-batch-pill">{currentBatch.batchNumber || 'HC-2409'}</span>
            <span className="pqr-product-title">{currentBatch.name || 'Raw Forest Honey'}</span>
          </div>
          <span className="pqr-lot-sub">
            {currentBatch.verification?.verificationLotId || 'Lot HC-2409-P01'} · 37 Jars
          </span>
        </div>

        {/* SCOPE SELECTION TABS: BATCH LEVEL vs INDIVIDUAL PACKAGE LEVEL (§ 27, 28) */}
        <div className="pqr-scope-tabs">
          <button
            type="button"
            className={`pqr-tab-btn ${activeScope === 'BATCH' ? 'active' : ''}`}
            onClick={() => {
              setActiveScope('BATCH');
              setSelectedPackageId(null);
            }}
          >
            <Layers size={13} />
            <span>Batch QR (Default)</span>
          </button>
          <button
            type="button"
            className={`pqr-tab-btn ${activeScope === 'PACKAGE' ? 'active' : ''}`}
            onClick={() => {
              setActiveScope('PACKAGE');
              setSelectedPackageId('PKG-0042');
            }}
          >
            <Package size={13} />
            <span>Package Serialized (PKG-0042)</span>
          </button>
        </div>

        {/* =========================================================================
            SCROLLABLE BODY
            ========================================================================= */}
        <div className="pqr-body">

          {/* 1. PRIMARY QR STATUS HERO CARD (§ 5, 6, 7, 21) */}
          <div className={`pqr-status-card ${qrRecord?.status?.toLowerCase() || 'not_created'}`}>
            <div className="pqr-status-header">
              <div className="pqr-status-pill">
                <span className="status-dot" />
                <span className="status-title-text">
                  {isQrActive && 'QR active'}
                  {isQrNotCreated && 'No product QR yet'}
                  {isQrSuspended && 'QR suspended'}
                  {isQrRevoked && 'QR revoked'}
                  {isQrReplaced && 'QR replaced'}
                </span>
              </div>
              <span className="pqr-scope-indicator">
                {activeScope === 'BATCH' ? 'Batch Scope' : 'Package Serialization'}
              </span>
            </div>

            <p className="pqr-status-desc">
              {isQrActive &&
                'This QR currently points to the public HoneyChain verification record. Consumers scanning this code will see the verified honey journey.'}
              {isQrNotCreated &&
                'Connect this physical product to its cryptographic HoneyChain verification record by generating an official registry QR.'}
              {isQrSuspended &&
                'This QR is temporarily unavailable. Scans will display an administrative hold state while the verified ledger record is preserved.'}
              {isQrRevoked &&
                'This QR has been revoked. Scans will indicate that this access point is no longer current. The underlying verification record remains safely anchored.'}
              {isQrReplaced &&
                `This QR has been replaced by a newer QR (${qrRecord.replacementQrId || 'QR-2026-Replacement'}). Old scans will redirect to the current verification.`}
            </p>

            {/* NOT CREATED CTA (§ 7, 8, 9) */}
            {isQrNotCreated && (
              <div className="pqr-create-block">
                {!prereqCheck.eligible ? (
                  <div className="pqr-prereq-alert">
                    <AlertTriangle size={16} color="#B85450" />
                    <div>
                      <strong>Verification Required</strong>
                      <p>{prereqCheck.reason}</p>
                      <button
                        type="button"
                        className="btn-link-prereq"
                        onClick={() => openVerification && openVerification({ batchId: currentBatch.id })}
                      >
                        Complete batch verification →
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary pqr-btn-create"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <QrCode size={16} />
                    <span>Create Product QR</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2. SCANNABLE QR DISPLAY & PREVIEW CARD (§ 15, 16, 17, 18, 19) */}
          {!isQrNotCreated && (
            <div className="pqr-preview-card">
              <div className="pqr-preview-header">
                <span className="pqr-preview-label">Official Registry QR</span>
                <span className="pqr-preview-badge">Scannable · ISO/IEC 18004</span>
              </div>

              {/* HIGH-CONTRAST SCANNABLE QR CODE MATRIX (§ 16) */}
              <div className="pqr-qr-frame">
                <div className="pqr-qr-matrix">
                  <svg
                    viewBox="0 0 160 160"
                    className="pqr-svg-qr"
                    role="img"
                    aria-label={`Official QR code for ${qrRecord?.publicReference || 'HoneyChain Product'}`}
                  >
                    {/* Quiet Zone Light Background */}
                    <rect width="160" height="160" fill="#FFFDF8" rx="8" />

                    {/* Top-Left Position Detection Pattern */}
                    <rect x="14" y="14" width="38" height="38" rx="4" fill="#34261B" />
                    <rect x="20" y="20" width="26" height="26" fill="#FFFDF8" rx="2" />
                    <rect x="26" y="26" width="14" height="14" rx="2" fill="#34261B" />

                    {/* Top-Right Position Detection Pattern */}
                    <rect x="108" y="14" width="38" height="38" rx="4" fill="#34261B" />
                    <rect x="114" y="20" width="26" height="26" fill="#FFFDF8" rx="2" />
                    <rect x="120" y="26" width="14" height="14" rx="2" fill="#34261B" />

                    {/* Bottom-Left Position Detection Pattern */}
                    <rect x="14" y="108" width="38" height="38" rx="4" fill="#34261B" />
                    <rect x="20" y="114" width="26" height="26" fill="#FFFDF8" rx="2" />
                    <rect x="26" y="120" width="14" height="14" rx="2" fill="#34261B" />

                    {/* Timing & Alignment Patterns */}
                    <rect x="62" y="16" width="8" height="8" fill="#34261B" />
                    <rect x="76" y="16" width="8" height="8" fill="#34261B" />
                    <rect x="90" y="16" width="8" height="8" fill="#34261B" />

                    <rect x="62" y="32" width="8" height="8" fill="#D99A24" />
                    <rect x="76" y="32" width="8" height="8" fill="#34261B" />
                    <rect x="90" y="32" width="8" height="8" fill="#D99A24" />

                    <rect x="16" y="62" width="8" height="8" fill="#34261B" />
                    <rect x="32" y="62" width="8" height="8" fill="#D99A24" />
                    <rect x="48" y="62" width="8" height="8" fill="#34261B" />
                    <rect x="62" y="62" width="8" height="8" fill="#34261B" />
                    <rect x="76" y="62" width="8" height="8" fill="#34261B" />
                    <rect x="90" y="62" width="8" height="8" fill="#34261B" />
                    <rect x="104" y="62" width="8" height="8" fill="#D99A24" />
                    <rect x="120" y="62" width="8" height="8" fill="#34261B" />
                    <rect x="136" y="62" width="8" height="8" fill="#34261B" />

                    {/* Data Payload Matrix Cells */}
                    <rect x="16" y="76" width="8" height="8" fill="#34261B" />
                    <rect x="32" y="76" width="8" height="8" fill="#34261B" />
                    <rect x="48" y="76" width="8" height="8" fill="#34261B" />
                    <rect x="104" y="76" width="8" height="8" fill="#34261B" />
                    <rect x="120" y="76" width="8" height="8" fill="#34261B" />
                    <rect x="136" y="76" width="8" height="8" fill="#D99A24" />

                    <rect x="16" y="90" width="8" height="8" fill="#D99A24" />
                    <rect x="32" y="90" width="8" height="8" fill="#34261B" />
                    <rect x="48" y="90" width="8" height="8" fill="#34261B" />
                    <rect x="104" y="90" width="8" height="8" fill="#34261B" />
                    <rect x="120" y="90" width="8" height="8" fill="#34261B" />
                    <rect x="136" y="90" width="8" height="8" fill="#34261B" />

                    <rect x="62" y="104" width="8" height="8" fill="#34261B" />
                    <rect x="76" y="104" width="8" height="8" fill="#D99A24" />
                    <rect x="90" y="104" width="8" height="8" fill="#34261B" />
                    <rect x="104" y="104" width="8" height="8" fill="#34261B" />
                    <rect x="120" y="104" width="8" height="8" fill="#34261B" />
                    <rect x="136" y="104" width="8" height="8" fill="#34261B" />

                    <rect x="62" y="120" width="8" height="8" fill="#34261B" />
                    <rect x="76" y="120" width="8" height="8" fill="#34261B" />
                    <rect x="90" y="120" width="8" height="8" fill="#34261B" />
                    <rect x="108" y="120" width="16" height="8" fill="#34261B" />
                    <rect x="130" y="120" width="16" height="8" fill="#D99A24" />

                    <rect x="62" y="136" width="12" height="8" fill="#34261B" />
                    <rect x="80" y="136" width="16" height="8" fill="#34261B" />
                    <rect x="102" y="136" width="20" height="8" fill="#34261B" />
                    <rect x="128" y="136" width="18" height="8" fill="#34261B" />

                    {/* HoneyChain Center Brandmark Seal (§ 16) */}
                    <rect x="66" y="66" width="28" height="28" rx="6" fill="#FFFDF8" stroke="#D99A24" strokeWidth="2" />
                    <path
                      d="M80 72L89 77V87L80 92L71 87V77L80 72Z"
                      fill="#FEF3D6"
                      stroke="#D99A24"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M80 77C77.5 80.5 76 83 76 84.5C76 86.8 77.8 88.5 80 88.5C82.2 88.5 84 86.8 84 84.5C84 83 82.5 80.5 80 77Z"
                      fill="#D99A24"
                    />
                  </svg>
                </div>

                <div className="pqr-live-check">
                  <CheckCircle2 size={13} color="#4F7A52" />
                  <span>Payload verified · Resolves to HoneyChain Public Registry</span>
                </div>
              </div>

              {/* PUBLIC VERIFICATION REFERENCE BADGE (§ 14 & 15) */}
              <div className="pqr-ref-container">
                <span className="pqr-ref-label">Public Verification Reference</span>
                <div className="pqr-ref-pill">
                  <span className="pqr-ref-text">{qrRecord?.publicReference || 'HC-PUB-7F82K9'}</span>
                  <button
                    type="button"
                    className="pqr-btn-copy"
                    onClick={handleCopyReference}
                    title="Copy verification reference"
                  >
                    {copiedToken ? <Check size={14} color="#4F7A52" /> : <Copy size={14} />}
                    <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <span className="pqr-ref-helper">
                  Non-sequential identifier. Safe for public marketing, jar labels, and cartons.
                </span>
              </div>

              {/* PRIMARY ACTION BUTTONS (§ 15, 30, 31, 32, 33) */}
              <div className="pqr-actions-grid">
                <button
                  type="button"
                  className="btn btn-primary pqr-act-btn"
                  onClick={handleOpenPublicView}
                >
                  <ExternalLink size={15} />
                  <span>Open public verification</span>
                </button>

                <div className="pqr-actions-row">
                  <button
                    type="button"
                    className="btn btn-secondary pqr-row-btn"
                    onClick={() => setIsPrintModalOpen(true)}
                  >
                    <Printer size={15} />
                    <span>Print label</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary pqr-row-btn"
                    onClick={handleShare}
                  >
                    <Share2 size={15} />
                    <span>Share</span>
                  </button>
                </div>

                {/* OPERATIONAL MANAGEMENT ACTIONS (§ 22, 24) */}
                <div className="pqr-mgmt-actions">
                  {isQrActive && (
                    <>
                      <button
                        type="button"
                        className="pqr-sub-btn"
                        onClick={() => setIsReplaceModalOpen(true)}
                      >
                        <RotateCcw size={13} />
                        <span>Create replacement QR</span>
                      </button>
                      <button
                        type="button"
                        className="pqr-sub-btn revoke"
                        onClick={() => setIsRevokeModalOpen(true)}
                      >
                        <Ban size={13} />
                        <span>Revoke QR</span>
                      </button>
                    </>
                  )}
                  {isQrSuspended && (
                    <button
                      type="button"
                      className="pqr-sub-btn reactivate"
                      onClick={async () => {
                        await productQrService.toggleSuspendQr(currentBatch.id);
                        loadQrData();
                        showToast('QR reactivated');
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Reactivate QR</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. BATCH & PACKAGING SPECIFICATION CARD (§ 27, 28) */}
          <div className="pqr-card pqr-spec-card">
            <h3 className="pqr-card-title">Packaging & Traceability Details</h3>
            <p className="pqr-card-subtitle">
              {activeScope === 'BATCH'
                ? 'This QR identifies the HoneyChain verification record for the entire batch lot.'
                : `Serialized Package QR bound to individual physical container ${selectedPackageId}.`}
            </p>

            <div className="pqr-spec-grid">
              <div className="pqr-spec-item">
                <span className="spec-label">HONEY BATCH</span>
                <span className="spec-value mono">{currentBatch.batchNumber || 'HC-2409'}</span>
              </div>
              <div className="pqr-spec-item">
                <span className="spec-label">PACKAGING LOT</span>
                <span className="spec-value mono">{currentBatch.verification?.verificationLotId || 'Lot HC-2409-P01'}</span>
              </div>
              <div className="pqr-spec-item">
                <span className="spec-label">CONTAINER SPEC</span>
                <span className="spec-value">{currentBatch.jarVolume || '500g Glass Hexagonal'}</span>
              </div>
              <div className="pqr-spec-item">
                <span className="spec-label">TAMPER SEAL</span>
                <span className="spec-value mono">
                  {activeScope === 'PACKAGE' ? 'HC-SEAL-2026-925-J42' : 'HC-SEAL-2026-925'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '11.5px', height: '32px', gap: '5px' }}
                onClick={() => openProductPackaging && openProductPackaging({ batchId: currentBatch.id, packageId: selectedPackageId || 'PKG-0042' })}
              >
                <Package size={13} />
                <span>Prepare Package Label (Screen 31) →</span>
              </button>
            </div>
          </div>

          {/* 4. SERIALIZED PACKAGE LIST (IF IN PACKAGE SCOPE) (§ 27) */}
          {activeScope === 'PACKAGE' && (
            <div className="pqr-card pqr-package-card">
              <div className="pqr-package-header">
                <div>
                  <h3 className="pqr-card-title">Lot Packages Serialization</h3>
                  <span className="pqr-card-subtitle">37 individual units derived from Batch HC-2409</span>
                </div>
                <span className="pqr-pkg-count-badge">37 Jars</span>
              </div>

              <div className="pqr-pkg-scroll">
                {packageList.slice(0, 8).map((pkg) => (
                  <div
                    key={pkg.packageId}
                    className={`pqr-pkg-item ${selectedPackageId === pkg.packageId ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedPackageId(pkg.packageId);
                      loadQrData();
                    }}
                  >
                    <div className="pkg-item-left">
                      <span className="pkg-id-badge">{pkg.packageId}</span>
                      <span className="pkg-seal-text">{pkg.sealNumber}</span>
                    </div>
                    <div className="pkg-item-right">
                      <span className={`pkg-qr-status ${pkg.hasSpecificQr ? 'active' : 'batch-shared'}`}>
                        {pkg.hasSpecificQr ? 'Unique QR' : 'Shared Batch QR'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <span className="pqr-pkg-footer-note">
                Showing first 8 of 37 serialized jars. Batch ≠ Package hierarchy maintained.
              </span>
            </div>
          )}

          {/* 5. QR LIFECYCLE HISTORY TIMELINE (§ 36, 37) */}
          {!isQrNotCreated && qrRecord?.history && (
            <div className="pqr-card pqr-history-card">
              <h3 className="pqr-card-title">QR Lifecycle History</h3>
              <p className="pqr-card-subtitle">
                Operational audit trail of QR issuance, print events, and status transitions.
              </p>

              <div className="pqr-history-timeline">
                {qrRecord.history.map((item, idx) => (
                  <div key={item.id || idx} className="pqr-history-node">
                    <div className="history-dot-track">
                      <span className="history-dot" />
                      {idx < qrRecord.history.length - 1 && <span className="history-line" />}
                    </div>
                    <div className="history-content">
                      <div className="history-meta">
                        <span className="history-title">{item.title}</span>
                        <span className="history-time">{item.timestamp}</span>
                      </div>
                      <span className="history-actor">{item.actor}</span>
                      {item.notes && <p className="history-notes">{item.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. TECHNICAL DETAILS ACCORDION (§ 51, 52) */}
          {!isQrNotCreated && (
            <div className="pqr-card pqr-tech-card">
              <button
                type="button"
                className="pqr-tech-toggle"
                onClick={() => setIsTechnicalExpanded(!isTechnicalExpanded)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#D99A24" />
                  <span className="tech-toggle-title">Technical specifications</span>
                </div>
                {isTechnicalExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isTechnicalExpanded && (
                <div className="pqr-tech-body">
                  <div className="tech-kv">
                    <span className="kv-label">QR RECORD ID</span>
                    <span className="kv-val mono">{qrRecord.qrId}</span>
                  </div>
                  <div className="tech-kv">
                    <span className="kv-label">TARGET PUBLIC ENDPOINT</span>
                    <span className="kv-val mono">{qrRecord.publicUrl}</span>
                  </div>
                  <div className="tech-kv">
                    <span className="kv-label">ERROR CORRECTION LEVEL</span>
                    <span className="kv-val">{qrRecord.eccLevel}</span>
                  </div>
                  <div className="tech-kv">
                    <span className="kv-label">SPECIFICATION VERSION</span>
                    <span className="kv-val">HoneyChain QR Standard {qrRecord.version}</span>
                  </div>
                  <div className="tech-kv">
                    <span className="kv-label">ANCHOR MERKLE ROOT</span>
                    <span className="kv-val mono break-all">
                      {qrRecord.anchorProof?.merkleRoot || '0x3f9801a4e5bc1209e86d23fb482b9a710255'}
                    </span>
                  </div>
                  <div className="tech-kv">
                    <span className="kv-label">BLOCKCHAIN TX ANCHOR</span>
                    <span className="kv-val mono break-all">
                      {qrRecord.anchorProof?.txHash || '0xd942b87f619e083a21dc49019b841e2a537f'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            MODAL 1: CREATE PRODUCT QR CONFIRMATION (§ 10, 11)
            ========================================================================= */}
        {isCreateModalOpen && (
          <div className="pqr-modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
            <div className="pqr-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="pqr-modal-header">
                <h3 className="pqr-modal-title">Create product QR?</h3>
                <button
                  type="button"
                  className="pqr-modal-close"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <p className="pqr-modal-text">
                This QR will connect this honey product to its public HoneyChain verification record.
                Consumers scanning this code will see the verified origin journey.
              </p>

              <div className="pqr-modal-details">
                <div className="modal-row">
                  <span>Product:</span>
                  <strong>{currentBatch.name}</strong>
                </div>
                <div className="modal-row">
                  <span>Batch:</span>
                  <strong className="mono">{currentBatch.batchNumber}</strong>
                </div>
                <div className="modal-row">
                  <span>Packaging:</span>
                  <span>{currentBatch.verification?.verificationLotId || 'Lot HC-2409-P01'}</span>
                </div>
                <div className="modal-row">
                  <span>Verification:</span>
                  <strong style={{ color: '#4F7A52' }}>✓ Confirmed & Signed</strong>
                </div>
              </div>

              <div className="pqr-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmCreate}
                >
                  Create QR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: REVOKE QR CONFIRMATION (§ 22, 23)
            ========================================================================= */}
        {isRevokeModalOpen && (
          <div className="pqr-modal-backdrop" onClick={() => setIsRevokeModalOpen(false)}>
            <div className="pqr-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="pqr-modal-header">
                <h3 className="pqr-modal-title">Revoke this QR?</h3>
                <button
                  type="button"
                  className="pqr-modal-close"
                  onClick={() => setIsRevokeModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <p className="pqr-modal-text">
                This QR will no longer open the active product verification record. Future scans will display a revoked status notice.
              </p>

              <div className="pqr-modal-alert">
                <Info size={16} color="#786D61" />
                <p>
                  <strong>Important:</strong> Revoking the QR does <em>not</em> unverify the batch. The business verification record and cryptographic technical proof remain intact.
                </p>
              </div>

              <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#34261B', display: 'block', marginBottom: '6px' }}>
                  Reason for revocation
                </label>
                <input
                  type="text"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="pqr-modal-input"
                />
              </div>

              <div className="pqr-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsRevokeModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-danger"
                  onClick={handleConfirmRevoke}
                >
                  Confirm Revocation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 3: REPLACE QR CONFIRMATION (§ 24, 25)
            ========================================================================= */}
        {isReplaceModalOpen && (
          <div className="pqr-modal-backdrop" onClick={() => setIsReplaceModalOpen(false)}>
            <div className="pqr-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="pqr-modal-header">
                <h3 className="pqr-modal-title">Create a replacement QR?</h3>
                <button
                  type="button"
                  className="pqr-modal-close"
                  onClick={() => setIsReplaceModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <p className="pqr-modal-text">
                A new replacement QR will be issued with a fresh public reference. The current QR ({qrRecord?.qrId}) will be marked as replaced and linked to the new identity.
              </p>

              <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#34261B', display: 'block', marginBottom: '6px' }}>
                  Reason for replacement
                </label>
                <input
                  type="text"
                  value={replaceReason}
                  onChange={(e) => setReplaceReason(e.target.value)}
                  className="pqr-modal-input"
                />
              </div>

              <div className="pqr-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsReplaceModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmReplace}
                >
                  Create replacement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 4: PRINT / DOWNLOAD PRODUCT LABEL (§ 33, 34, 35)
            ========================================================================= */}
        {isPrintModalOpen && (
          <div className="pqr-modal-backdrop" onClick={() => setIsPrintModalOpen(false)}>
            <div className="pqr-modal-card print-card" onClick={(e) => e.stopPropagation()}>
              <div className="pqr-modal-header">
                <h3 className="pqr-modal-title">Printable Product Label</h3>
                <button
                  type="button"
                  className="pqr-modal-close"
                  onClick={() => setIsPrintModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <p className="pqr-modal-text" style={{ marginBottom: '16px' }}>
                Production-ready tamper-evident label sticker (2" × 2" Standard Packaging Format).
              </p>

              {/* AUTHENTIC PRINTABLE STICKER PREVIEW (§ 33) */}
              <div className="pqr-printable-sticker">
                <div className="sticker-brand">
                  <span className="brand-hex">⬡</span>
                  <span className="brand-title">HoneyChain</span>
                </div>

                <div className="sticker-qr-wrap">
                  <svg viewBox="0 0 100 100" className="sticker-svg">
                    <rect width="100" height="100" fill="#FFFDF8" />
                    <rect x="8" y="8" width="26" height="26" fill="#34261B" rx="2" />
                    <rect x="12" y="12" width="18" height="18" fill="#FFFDF8" />
                    <rect x="16" y="16" width="10" height="10" fill="#34261B" />

                    <rect x="66" y="8" width="26" height="26" fill="#34261B" rx="2" />
                    <rect x="70" y="12" width="18" height="18" fill="#FFFDF8" />
                    <rect x="74" y="16" width="10" height="10" fill="#34261B" />

                    <rect x="8" y="66" width="26" height="26" fill="#34261B" rx="2" />
                    <rect x="12" y="70" width="18" height="18" fill="#FFFDF8" />
                    <rect x="16" y="74" width="10" height="10" fill="#34261B" />

                    <rect x="42" y="12" width="6" height="6" fill="#34261B" />
                    <rect x="52" y="12" width="6" height="6" fill="#34261B" />
                    <rect x="42" y="24" width="6" height="6" fill="#D99A24" />
                    <rect x="52" y="34" width="6" height="6" fill="#34261B" />
                    <rect x="14" y="44" width="6" height="6" fill="#34261B" />
                    <rect x="24" y="44" width="6" height="6" fill="#34261B" />
                    <rect x="34" y="44" width="6" height="6" fill="#D99A24" />
                    <rect x="44" y="44" width="12" height="12" fill="#34261B" rx="2" />
                    <rect x="62" y="44" width="6" height="6" fill="#34261B" />
                    <rect x="74" y="44" width="6" height="6" fill="#34261B" />
                    <rect x="84" y="44" width="6" height="6" fill="#D99A24" />
                    <rect x="44" y="64" width="6" height="6" fill="#34261B" />
                    <rect x="54" y="64" width="6" height="6" fill="#D99A24" />
                    <rect x="64" y="64" width="6" height="6" fill="#34261B" />
                    <rect x="74" y="64" width="6" height="6" fill="#34261B" />
                    <rect x="84" y="64" width="6" height="6" fill="#34261B" />
                    <rect x="44" y="78" width="6" height="6" fill="#34261B" />
                    <rect x="64" y="78" width="16" height="6" fill="#34261B" />
                  </svg>
                </div>

                <div className="sticker-meta">
                  <span className="sticker-tagline">Scan to verify</span>
                  <span className="sticker-sub">Verified honey journey</span>
                  <strong className="sticker-ref">{qrRecord?.publicReference || 'HC-PUB-7F82K9'}</strong>
                  <span className="sticker-lot">
                    {currentBatch.batchNumber} · {currentBatch.verification?.verificationLotId || 'Lot P01'}
                  </span>
                </div>
              </div>

              <div className="pqr-modal-actions" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    showToast('Label SVG downloaded');
                    setIsPrintModalOpen(false);
                  }}
                >
                  <Download size={14} />
                  <span>Download SVG</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    window.print();
                    showToast('Print dialog triggered');
                    setIsPrintModalOpen(false);
                  }}
                >
                  <Printer size={14} />
                  <span>Print Sticker</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCOPED STYLES
            ========================================================================= */}
        <style>{`
          .product-qr-overlay {
            position: fixed;
            inset: 0;
            z-index: 99999;
            background-color: #2B2117;
            display: flex;
            justify-content: center;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          }

          .product-qr-container {
            width: 100%;
            max-width: 440px;
            min-height: 100vh;
            background-color: #FFF9EF;
            display: flex;
            flex-direction: column;
            position: relative;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.35);
            color: #34261B;
            padding-bottom: 40px;
          }

          /* Header */
          .pqr-header {
            position: sticky;
            top: 0;
            z-index: 20;
            background: #FFFDF8;
            border-bottom: 1px solid #EDE2D1;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .pqr-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .pqr-back-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #FFF9EF;
            border: 1px solid #EDE2D1;
            color: #34261B;
            cursor: pointer;
            transition: all 0.2s;
          }

          .pqr-back-btn:hover {
            background: #EDE2D1;
          }

          .pqr-header-titles {
            display: flex;
            flex-direction: column;
          }

          .pqr-header-eyebrow {
            font-size: 10.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #D99A24;
          }

          .pqr-header-title {
            font-size: 18px;
            font-weight: 800;
            color: #34261B;
            margin: 0;
            line-height: 1.2;
          }

          .pqr-header-sub {
            font-size: 11.5px;
            color: #786D61;
            margin: 2px 0 0;
          }

          .pqr-demo-pill {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 5px 10px;
            border-radius: 12px;
            background: #FEF3D6;
            border: 1px solid rgba(217, 154, 36, 0.4);
            color: #B87316;
            font-size: 11.5px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
          }

          .pqr-demo-pill:hover {
            background: #FDE8B5;
          }

          /* Jury Drawer */
          .pqr-drawer-card {
            background: #FFFDF8;
            border-bottom: 2px solid #D99A24;
            padding: 16px;
            animation: pqrSlideDown 0.25s ease-out;
          }

          @keyframes pqrSlideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .pqr-drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .pqr-drawer-title {
            font-size: 14px;
            font-weight: 800;
            color: #34261B;
            margin: 0;
          }

          .pqr-drawer-close {
            background: none;
            border: none;
            font-size: 15px;
            color: #786D61;
            cursor: pointer;
          }

          .pqr-drawer-subtitle {
            font-size: 11.5px;
            color: #786D61;
            margin: 6px 0 12px;
          }

          .pqr-demo-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .pqr-scenario-chip {
            padding: 10px 12px;
            border-radius: 10px;
            background: #FFF9EF;
            border: 1px solid #EDE2D1;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
          }

          .pqr-scenario-chip.active {
            border-color: #D99A24;
            background: #FEF3D6;
          }

          .chip-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 3px;
          }

          .chip-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(52, 38, 27, 0.08);
            color: #34261B;
          }

          .chip-name {
            font-size: 12.5px;
            font-weight: 700;
            color: #34261B;
          }

          .chip-desc {
            font-size: 11px;
            color: #786D61;
            margin: 0;
            line-height: 1.35;
          }

          /* Context Strip */
          .pqr-context-strip {
            background: #FAF2E4;
            padding: 10px 16px;
            border-bottom: 1px solid #EDE2D1;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .pqr-context-left {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .pqr-batch-pill {
            font-family: monospace;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 6px;
            background: #34261B;
            color: #FFFDF8;
            border-radius: 4px;
          }

          .pqr-product-title {
            font-size: 13px;
            font-weight: 700;
            color: #34261B;
          }

          .pqr-lot-sub {
            font-size: 11.5px;
            color: #786D61;
          }

          /* Scope Tabs */
          .pqr-scope-tabs {
            display: flex;
            padding: 8px 16px;
            background: #FFFDF8;
            border-bottom: 1px solid #EDE2D1;
            gap: 8px;
          }

          .pqr-tab-btn {
            flex: 1;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            border-radius: 8px;
            font-size: 11.5px;
            font-weight: 700;
            background: #FFF9EF;
            border: 1px solid #EDE2D1;
            color: #786D61;
            cursor: pointer;
            transition: all 0.2s;
          }

          .pqr-tab-btn.active {
            background: #34261B;
            color: #FFFDF8;
            border-color: #34261B;
          }

          /* Body Container */
          .pqr-body {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          /* 1. Status Hero Card */
          .pqr-status-card {
            border-radius: 14px;
            padding: 16px;
            border: 1px solid #EDE2D1;
            background: #FFFDF8;
          }

          .pqr-status-card.active {
            background: #F4F8F4;
            border-color: rgba(79, 122, 82, 0.35);
          }

          .pqr-status-card.not_created {
            background: #FFFDF8;
            border: 1.5px dashed #D99A24;
          }

          .pqr-status-card.suspended {
            background: #FFF7EE;
            border-color: rgba(217, 130, 43, 0.35);
          }

          .pqr-status-card.revoked {
            background: #FDF3F2;
            border-color: rgba(184, 84, 80, 0.35);
          }

          .pqr-status-card.replaced {
            background: #F8F7F5;
            border-color: #D3CDC6;
          }

          .pqr-status-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .pqr-status-pill {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4F7A52;
          }

          .pqr-status-card.not_created .status-dot { background: #D99A24; }
          .pqr-status-card.suspended .status-dot { background: #D9822B; }
          .pqr-status-card.revoked .status-dot { background: #B85450; }
          .pqr-status-card.replaced .status-dot { background: #786D61; }

          .status-title-text {
            font-size: 14px;
            font-weight: 800;
            color: #34261B;
          }

          .pqr-scope-indicator {
            font-size: 11px;
            color: #786D61;
            font-weight: 600;
          }

          .pqr-status-desc {
            font-size: 12.5px;
            color: #786D61;
            line-height: 1.45;
            margin: 0;
          }

          .pqr-create-block {
            margin-top: 14px;
          }

          .pqr-btn-create {
            width: 100%;
            height: 44px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 13.5px;
            font-weight: 700;
          }

          .pqr-prereq-alert {
            display: flex;
            gap: 10px;
            padding: 12px;
            border-radius: 8px;
            background: #FDF3F2;
            border: 1px solid rgba(184, 84, 80, 0.25);
            font-size: 12px;
            color: #8C3E3A;
          }

          .pqr-prereq-alert strong {
            display: block;
            margin-bottom: 2px;
          }

          .pqr-prereq-alert p {
            margin: 0 0 6px;
            line-height: 1.35;
          }

          .btn-link-prereq {
            background: none;
            border: none;
            padding: 0;
            font-size: 11.5px;
            font-weight: 700;
            color: #B85450;
            text-decoration: underline;
            cursor: pointer;
          }

          /* 2. Scannable QR Card */
          .pqr-preview-card {
            background: #FFFDF8;
            border-radius: 16px;
            border: 1px solid #EDE2D1;
            padding: 18px;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 4px 20px rgba(52, 38, 27, 0.05);
          }

          .pqr-preview-header {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 14px;
          }

          .pqr-preview-label {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #34261B;
          }

          .pqr-preview-badge {
            font-size: 10.5px;
            font-weight: 700;
            color: #4F7A52;
            background: #EDF5EE;
            padding: 2px 7px;
            border-radius: 4px;
          }

          .pqr-qr-frame {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
          }

          .pqr-qr-matrix {
            padding: 12px;
            background: #FFFDF8;
            border-radius: 14px;
            border: 2px solid #EDE2D1;
            box-shadow: 0 8px 24px rgba(52, 38, 27, 0.08);
          }

          .pqr-svg-qr {
            width: 190px;
            height: 190px;
            display: block;
          }

          .pqr-live-check {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            font-weight: 600;
            color: #4F7A52;
          }

          /* Reference Badge */
          .pqr-ref-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 18px;
          }

          .pqr-ref-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #786D61;
            margin-bottom: 6px;
          }

          .pqr-ref-pill {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #FEF3D6;
            border: 1px solid rgba(217, 154, 36, 0.4);
            padding: 6px 14px;
            border-radius: 10px;
          }

          .pqr-ref-text {
            font-family: monospace;
            font-size: 16px;
            font-weight: 800;
            color: #34261B;
            letter-spacing: 0.05em;
          }

          .pqr-btn-copy {
            display: flex;
            align-items: center;
            gap: 4px;
            background: #FFFDF8;
            border: 1px solid rgba(217, 154, 36, 0.4);
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            color: #B87316;
            cursor: pointer;
          }

          .pqr-ref-helper {
            font-size: 11px;
            color: #786D61;
            margin-top: 6px;
            text-align: center;
          }

          /* Action Buttons */
          .pqr-actions-grid {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .pqr-act-btn {
            width: 100%;
            height: 44px;
            border-radius: 10px;
            font-size: 13.5px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .pqr-actions-row {
            display: flex;
            gap: 8px;
          }

          .pqr-row-btn {
            flex: 1;
            height: 40px;
            border-radius: 10px;
            font-size: 12.5px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }

          .pqr-mgmt-actions {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-top: 8px;
            padding-top: 10px;
            border-top: 1px solid #EDE2D1;
          }

          .pqr-sub-btn {
            background: none;
            border: none;
            font-size: 12px;
            font-weight: 700;
            color: #786D61;
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            transition: color 0.2s;
          }

          .pqr-sub-btn:hover { color: #34261B; }
          .pqr-sub-btn.revoke { color: #B85450; }
          .pqr-sub-btn.reactivate { color: #4F7A52; }

          /* Cards */
          .pqr-card {
            background: #FFFDF8;
            border-radius: 14px;
            border: 1px solid #EDE2D1;
            padding: 16px;
          }

          .pqr-card-title {
            font-size: 14px;
            font-weight: 800;
            color: #34261B;
            margin: 0 0 3px;
          }

          .pqr-card-subtitle {
            font-size: 11.5px;
            color: #786D61;
            margin: 0 0 12px;
            display: block;
            line-height: 1.35;
          }

          /* Specs Grid */
          .pqr-spec-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .pqr-spec-item {
            display: flex;
            flex-direction: column;
            background: #FFF9EF;
            border: 1px solid #EDE2D1;
            padding: 8px 10px;
            border-radius: 8px;
          }

          .spec-label {
            font-size: 9.5px;
            font-weight: 700;
            color: #786D61;
            letter-spacing: 0.04em;
          }

          .spec-value {
            font-size: 12.5px;
            font-weight: 700;
            color: #34261B;
            margin-top: 2px;
          }

          .spec-value.mono { font-family: monospace; }

          /* Package Serialization List */
          .pqr-package-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
          }

          .pqr-pkg-count-badge {
            font-size: 11px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 12px;
            background: #34261B;
            color: #FFFDF8;
          }

          .pqr-pkg-scroll {
            display: flex;
            flex-direction: column;
            gap: 6px;
            max-height: 190px;
            overflow-y: auto;
            margin-bottom: 8px;
          }

          .pqr-pkg-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            border-radius: 8px;
            background: #FFF9EF;
            border: 1px solid #EDE2D1;
            cursor: pointer;
            transition: all 0.2s;
          }

          .pqr-pkg-item.selected {
            background: #FEF3D6;
            border-color: #D99A24;
          }

          .pkg-item-left {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .pkg-id-badge {
            font-family: monospace;
            font-size: 11px;
            font-weight: 700;
            color: #34261B;
          }

          .pkg-seal-text {
            font-size: 11px;
            color: #786D61;
          }

          .pkg-qr-status {
            font-size: 10.5px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
          }

          .pkg-qr-status.active {
            background: #EDF5EE;
            color: #4F7A52;
          }

          .pkg-qr-status.batch-shared {
            background: #FFFDF8;
            color: #786D61;
            border: 1px solid #EDE2D1;
          }

          .pqr-pkg-footer-note {
            font-size: 10.5px;
            color: #786D61;
            display: block;
            text-align: center;
          }

          /* History Timeline */
          .pqr-history-timeline {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .pqr-history-node {
            display: flex;
            gap: 10px;
          }

          .history-dot-track {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 14px;
          }

          .history-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #D99A24;
            margin-top: 4px;
          }

          .history-line {
            width: 1.5px;
            flex: 1;
            background: #EDE2D1;
            margin-top: 4px;
          }

          .history-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .history-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .history-title {
            font-size: 12.5px;
            font-weight: 700;
            color: #34261B;
          }

          .history-time {
            font-size: 10.5px;
            color: #786D61;
          }

          .history-actor {
            font-size: 11px;
            color: #786D61;
          }

          .history-notes {
            font-size: 11.5px;
            color: #34261B;
            margin: 2px 0 0;
            background: #FFF9EF;
            padding: 4px 8px;
            border-radius: 6px;
            border: 1px solid #EDE2D1;
          }

          /* Tech Accordion */
          .pqr-tech-toggle {
            width: 100%;
            background: none;
            border: none;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
          }

          .tech-toggle-title {
            font-size: 13.5px;
            font-weight: 800;
            color: #34261B;
          }

          .pqr-tech-body {
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid #EDE2D1;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .tech-kv {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .kv-label {
            font-size: 9.5px;
            font-weight: 700;
            color: #786D61;
            letter-spacing: 0.05em;
          }

          .kv-val {
            font-size: 11.5px;
            color: #34261B;
          }

          .kv-val.mono {
            font-family: monospace;
          }

          .break-all {
            word-break: break-all;
          }

          /* Modals */
          .pqr-modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(52, 38, 27, 0.65);
            backdrop-filter: blur(4px);
            z-index: 100060;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .pqr-modal-card {
            width: 100%;
            max-width: 400px;
            background: #FFFDF8;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
            border: 1px solid #EDE2D1;
          }

          .pqr-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
          }

          .pqr-modal-title {
            font-size: 16px;
            font-weight: 800;
            color: #34261B;
            margin: 0;
          }

          .pqr-modal-close {
            background: none;
            border: none;
            font-size: 16px;
            color: #786D61;
            cursor: pointer;
          }

          .pqr-modal-text {
            font-size: 12.5px;
            color: #786D61;
            line-height: 1.45;
            margin: 0 0 14px;
          }

          .pqr-modal-details {
            background: #FFF9EF;
            border: 1px solid #EDE2D1;
            border-radius: 10px;
            padding: 10px 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: 12px;
            margin-bottom: 16px;
          }

          .modal-row {
            display: flex;
            justify-content: space-between;
          }

          .pqr-modal-alert {
            display: flex;
            gap: 8px;
            padding: 10px;
            background: #FFF9EF;
            border-radius: 8px;
            border: 1px solid #EDE2D1;
            font-size: 11.5px;
            color: #786D61;
            line-height: 1.35;
          }

          .pqr-modal-alert p { margin: 0; }

          .pqr-modal-input {
            width: 100%;
            height: 38px;
            padding: 0 10px;
            border-radius: 8px;
            border: 1px solid #EDE2D1;
            font-size: 12.5px;
            color: #34261B;
            background: #FFFDF8;
            box-sizing: border-box;
          }

          .pqr-modal-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
          }

          .btn-danger {
            background: #B85450 !important;
            border-color: #B85450 !important;
          }

          /* Print Sticker Preview (§ 33) */
          .print-card {
            max-width: 360px;
          }

          .pqr-printable-sticker {
            background: #FFFDF8;
            border: 2px dashed #D99A24;
            border-radius: 12px;
            padding: 18px 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .sticker-brand {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 800;
            font-size: 14px;
            color: #34261B;
            margin-bottom: 12px;
          }

          .brand-hex {
            color: #D99A24;
          }

          .sticker-qr-wrap {
            padding: 8px;
            background: #FFFDF8;
            border: 1.5px solid #34261B;
            border-radius: 8px;
            margin-bottom: 10px;
          }

          .sticker-svg {
            width: 130px;
            height: 130px;
            display: block;
          }

          .sticker-meta {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .sticker-tagline {
            font-size: 13px;
            font-weight: 800;
            color: #34261B;
          }

          .sticker-sub {
            font-size: 11px;
            color: #786D61;
          }

          .sticker-ref {
            font-family: monospace;
            font-size: 14px;
            font-weight: 800;
            color: #B87316;
            margin: 4px 0 2px;
          }

          .sticker-lot {
            font-size: 10.5px;
            color: #786D61;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ProductQrManagementView;
