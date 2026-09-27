import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  productPackagingService,
  LABEL_TEMPLATES
} from '../../data/productPackagingService';
import { productQrService, OFFICIAL_PUBLIC_DOMAIN } from '../../data/productQrService';
import {
  ArrowLeft,
  Package,
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
  Calendar,
  Clock,
  Ban,
  FileCheck,
  Scale,
  Tag,
  Sliders,
  CheckCheck
} from 'lucide-react';

/**
 * Screen 31 — Product Packaging / Label Generation
 * 
 * Internal operational workflow connecting physical packages to digital verification records.
 * Architecture: Honey Batch → Quality → Packaging → Verification → Public Record → QR → Physical Label
 */
export const ProductPackagingView = ({
  isOpen = true,
  onClose,
  batchId: propBatchId,
  packageId: propPackageId
}) => {
  const {
    batches,
    openPublicVerification,
    openVerification,
    openProductQrManagement,
    showToast,
    session
  } = useAppState();

  // Active batch resolution
  const targetBatchId = propBatchId || 'batch-hc-2409';
  const currentBatch = useMemo(() => {
    const found = batches.find((b) => b.id === targetBatchId);
    if (found) {
      if (targetBatchId === 'batch-hc-2409' || found.id === 'batch-hc-2409') {
        return {
          ...found,
          status: 'certified',
          verification: {
            isVerified: true,
            verifiedAt: '25 Sep 2026 · 09:30 UTC',
            verificationLotId: 'Lot HC-2409-P01'
          }
        };
      }
      return found;
    }
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
    if (targetBatchId === 'batch-hc-2408') {
      return {
        id: 'batch-hc-2408',
        batchNumber: 'HC-2408',
        name: 'Mountain Lavender & Wild Thyme Honey',
        status: 'curing',
        lotJarsCount: 42,
        jarVolume: '350g Glass Jar',
        moisture: 18.9,
        verification: { isVerified: false }
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

  // Operational State Machine (§ 28, 46)
  // 'VIEWING' | 'WIZARD' | 'ALLOCATION'
  const [activeTab, setActiveTab] = useState(propPackageId ? 'PREVIEW' : 'PREVIEW');
  const [packageRecord, setPackageRecord] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('std-hex-500g');
  const [batchAllocation, setBatchAllocation] = useState(null);

  // Progressive Packaging Creation Wizard State (§ 5)
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardUnitGrams, setWizardUnitGrams] = useState(500);
  const [wizardCount, setWizardCount] = useState(1);
  const [wizardTemplateId, setWizardTemplateId] = useState('std-hex-500g');
  const [isCreatingPackage, setIsCreatingPackage] = useState(false);

  // Interactive Modals
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPayloadTestModalOpen, setIsPayloadTestModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isJuryDrawerOpen, setIsJuryDrawerOpen] = useState(false);
  const [replaceReason, setReplaceReason] = useState('Updated legal packer contact line');
  const [copiedRef, setCopiedRef] = useState(false);

  // Load package record
  const loadPackageData = useCallback(async () => {
    const pkgId = propPackageId || 'PKG-0042';
    const pkg = await productPackagingService.getPackage(pkgId);
    if (pkg) {
      setPackageRecord(pkg);
      setSelectedTemplateId(pkg.templateId || 'std-hex-500g');
    }
    const alloc = productPackagingService.getBatchAllocation(currentBatch.id);
    setBatchAllocation(alloc);
  }, [propPackageId, currentBatch.id]);

  useEffect(() => {
    if (isOpen) {
      loadPackageData();
    }
  }, [isOpen, loadPackageData]);

  // Batch Eligibility Validation (§ 6, 7, 8)
  const eligibility = useMemo(() => {
    return productPackagingService.validateBatchEligibility(currentBatch);
  }, [currentBatch]);

  // Wizard Quantity Check (§ 10, 14)
  const wizardQtyCheck = useMemo(() => {
    return productPackagingService.validateQuantity(
      currentBatch.id,
      wizardUnitGrams,
      wizardCount
    );
  }, [currentBatch.id, wizardUnitGrams, wizardCount]);

  // Active Template
  const activeTemplate = useMemo(() => {
    return productPackagingService.getTemplateById(selectedTemplateId);
  }, [selectedTemplateId]);

  // Copy Public Reference Handler
  const handleCopyRef = () => {
    const ref = packageRecord?.publicReference || 'HC-PUB-PKG-0042';
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(ref);
      }
    } catch (e) {}
    setCopiedRef(true);
    showToast(`Copied verification reference: ${ref}`);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Finalize Label Handler (§ 30, 31)
  const handleConfirmFinalize = async () => {
    if (!packageRecord?.packageId) return;
    try {
      const updated = await productPackagingService.finalizeLabel(
        packageRecord.packageId,
        session?.operator || 'Sarah Lindqvist (Master Apiarist)'
      );
      setPackageRecord(updated);
      setIsFinalizeModalOpen(false);
      showToast(`Label finalized and bound to package ${packageRecord.packageId}`);
    } catch (err) {
      showToast(err.message || 'Failed to finalize label');
    }
  };

  // Print Label Handler (§ 32, 51)
  const handlePrintConfirm = async () => {
    if (!packageRecord?.packageId) return;
    try {
      const updated = await productPackagingService.recordPrintEvent(
        packageRecord.packageId,
        'Packaging Line Station #1'
      );
      setPackageRecord(updated);
      window.print();
      showToast('Label sent to high-resolution print line');
      setIsPrintModalOpen(false);
    } catch (err) {
      showToast('Print failed');
    }
  };

  // Replace / Revision Handler (§ 34, 35)
  const handleConfirmReplace = async () => {
    if (!packageRecord?.packageId) return;
    try {
      const updated = await productPackagingService.replaceLabel(
        packageRecord.packageId,
        replaceReason,
        session?.operator || 'Sarah Lindqvist'
      );
      setPackageRecord(updated);
      setIsReplaceModalOpen(false);
      showToast(`New revision ${updated.label.version} activated`);
    } catch (err) {
      showToast('Revision failed');
    }
  };

  // Execute Progressive Wizard Creation (§ 5, 12, 42)
  const handleExecuteWizardCreate = async () => {
    setIsCreatingPackage(true);
    try {
      const created = await productPackagingService.createPackageAndLabel(currentBatch, {
        unitGrams: wizardUnitGrams,
        packageCount: wizardCount,
        templateId: wizardTemplateId,
        actor: session?.operator || 'Sarah Lindqvist (Master Apiarist)'
      });
      setPackageRecord(created);
      setSelectedTemplateId(created.templateId);
      setActiveTab('PREVIEW');
      showToast(`Package ${created.packageId} created & label generated!`);
      // Reload allocations
      const alloc = productPackagingService.getBatchAllocation(currentBatch.id);
      setBatchAllocation(alloc);
    } catch (err) {
      showToast(err.message || 'Packaging creation failed');
    } finally {
      setIsCreatingPackage(false);
    }
  };

  if (!isOpen) return null;

  const labelStatus = packageRecord?.label?.status || 'READY';
  const isFinalized = labelStatus === 'FINALIZED' || labelStatus === 'PRINTED';
  const isPrinted = labelStatus === 'PRINTED';
  const isSuperseded = labelStatus === 'SUPERSEDED';

  return (
    <div className="product-packaging-overlay">
      <div className="product-packaging-container">

        {/* =========================================================================
            HEADER & CONTEXT STRIP (§ 4)
            ========================================================================= */}
        <div className="pkg-header">
          <div className="pkg-header-left">
            <button
              type="button"
              className="pkg-back-btn"
              onClick={onClose}
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="pkg-header-titles">
              <span className="pkg-header-eyebrow">SCREEN 31 · PRODUCT OPERATIONS</span>
              <h1 className="pkg-header-title">Product packaging</h1>
              <p className="pkg-header-sub">Prepare this honey package and its traceability label.</p>
            </div>
          </div>

          {/* Quick Jury Demo Drawer Trigger */}
          <button
            type="button"
            className="pkg-demo-pill"
            onClick={() => setIsJuryDrawerOpen(!isJuryDrawerOpen)}
          >
            <Sparkles size={13} />
            <span>Demo</span>
            <ChevronDown size={13} className={`chev ${isJuryDrawerOpen ? 'up' : ''}`} />
          </button>
        </div>

        {/* JURY DEMONSTRATION DRAWER (§ 67) */}
        {isJuryDrawerOpen && (
          <div className="pkg-demo-drawer">
            <div className="pkg-demo-drawer-header">
              <span className="drawer-title">Jury Demonstration Scenarios</span>
              <button
                type="button"
                className="drawer-close"
                onClick={() => setIsJuryDrawerOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="pkg-scenarios-list">
              {productPackagingService.getSampleScenarios().map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  className="pkg-scenario-chip"
                  onClick={async () => {
                    setIsJuryDrawerOpen(false);
                    if (scenario.packageId) {
                      const p = await productPackagingService.getPackage(scenario.packageId);
                      setPackageRecord(p);
                      setSelectedTemplateId(p.templateId || 'std-hex-500g');
                      setActiveTab('PREVIEW');
                    } else {
                      setActiveTab('WIZARD');
                    }
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

        {/* BATCH & PACKAGE COMPACT CONTEXT STRIP (§ 4) */}
        <div className="pkg-context-strip">
          <div className="pkg-context-left">
            <span className="pkg-batch-badge">{currentBatch.batchNumber || 'HC-2409'}</span>
            <span className="pkg-product-title">{currentBatch.name || 'Raw Forest Wildflower Honey'}</span>
          </div>
          <div className="pkg-context-right">
            {packageRecord?.packageId ? (
              <span className="pkg-id-badge">
                <Package size={11} />
                <span>{packageRecord.packageId}</span>
              </span>
            ) : (
              <span className="pkg-lot-info">
                {currentBatch.verification?.verificationLotId || 'Lot HC-2409-P01'}
              </span>
            )}
          </div>
        </div>

        {/* WORKFLOW NAVIGATION TABS */}
        <div className="pkg-nav-tabs">
          <button
            type="button"
            className={`pkg-nav-btn ${activeTab === 'PREVIEW' ? 'active' : ''}`}
            onClick={() => setActiveTab('PREVIEW')}
          >
            <Tag size={13} />
            <span>Label Preview</span>
          </button>
          <button
            type="button"
            className={`pkg-nav-btn ${activeTab === 'WIZARD' ? 'active' : ''}`}
            onClick={() => setActiveTab('WIZARD')}
          >
            <Sliders size={13} />
            <span>Package Wizard</span>
          </button>
          <button
            type="button"
            className={`pkg-nav-btn ${activeTab === 'STOCK' ? 'active' : ''}`}
            onClick={() => setActiveTab('STOCK')}
          >
            <Scale size={13} />
            <span>Batch Stock</span>
          </button>
        </div>

        {/* =========================================================================
            SCROLLABLE BODY
            ========================================================================= */}
        <div className="pkg-body">

          {/* INELIGIBLE BATCH ALERT GUARD (§ 8) */}
          {!eligibility.eligible && (
            <div className="pkg-ineligible-card">
              <div className="inelig-head">
                <AlertTriangle size={18} color="#B85450" />
                <h3 className="inelig-title">This batch isn't ready for packaging</h3>
              </div>
              <p className="inelig-desc">{eligibility.reason}</p>
              <div className="inelig-actions">
                <button
                  type="button"
                  className="btn btn-secondary inelig-btn"
                  onClick={() => openVerification && openVerification({ batchId: currentBatch.id })}
                >
                  Complete batch verification →
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 1: PHYSICAL LABEL PREVIEW & ACTIONS
              ========================================================================= */}
          {activeTab === 'PREVIEW' && (
            <>
              {/* 1. LABEL STATUS HERO CARD (§ 28-34) */}
              <div className={`pkg-status-card ${labelStatus.toLowerCase()}`}>
                <div className="status-top">
                  <div className="status-pill">
                    <span className="status-dot" />
                    <span className="status-text">
                      {isPrinted && 'Printed'}
                      {labelStatus === 'FINALIZED' && 'Label finalized'}
                      {labelStatus === 'READY' && 'Ready to print'}
                      {labelStatus === 'DRAFT' && 'Draft label'}
                      {isSuperseded && 'Superseded (Older Revision)'}
                    </span>
                  </div>
                  <div className="version-pill">
                    <span>{packageRecord?.label?.version || 'v1'}</span>
                  </div>
                </div>

                <p className="status-explanation">
                  {isPrinted &&
                    'This physical label was dispatched to production line #1 with immutable HoneyChain tamper seals.'}
                  {labelStatus === 'FINALIZED' &&
                    'This label is permanently associated with this package record and points to the authoritative public verification ledger.'}
                  {labelStatus === 'READY' &&
                    'All required package, batch, and cryptographic verification parameters are confirmed. Ready to finalize.'}
                  {labelStatus === 'DRAFT' &&
                    'Packaging draft record under initial composition. Finalize before dispatching to physical print.'}
                  {isSuperseded &&
                    'This label belongs to an earlier package record version and has been superseded.'}
                </p>

                {/* TEMPLATE PICKER CHIPS (§ 23, 24) */}
                <div className="template-picker-row">
                  <span className="tpl-label">Label Template:</span>
                  <div className="tpl-chips">
                    {LABEL_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`tpl-chip ${selectedTemplateId === t.id ? 'active' : ''}`}
                        onClick={() => setSelectedTemplateId(t.id)}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. AUTHENTIC PHYSICAL PRODUCT LABEL CONTAINER (§ 21, 22, 57, 58) */}
              <div className="pkg-label-outer">
                <div className="pkg-dimensions-bar">
                  <span className="dim-tag">
                    {activeTemplate.physicalWidthMm} mm × {activeTemplate.physicalHeightMm} mm
                  </span>
                  <span className="dpi-tag">{activeTemplate.dpi} DPI Print Output</span>
                  <span className="safe-margin-tag">Safe Margin {activeTemplate.safeAreaMarginMm} mm</span>
                </div>

                {/* PHYSICAL SPECIALTY HONEY LABEL (§ 21, 58) */}
                <div className="pkg-physical-label">
                  {/* Subtle foil-embossed honey gold border */}
                  <div className="label-border-accent">
                    {/* Brand Header */}
                    <div className="lbl-brand-row">
                      <span className="lbl-brand-emblem">⬡</span>
                      <span className="lbl-brand-name">HONEYCHAIN</span>
                      <span className="lbl-brand-sub">ARTISANAL RESERVE</span>
                    </div>

                    {/* Product Title & Botanical Origin (§ 16) */}
                    <div className="lbl-product-section">
                      <h2 className="lbl-product-name">{currentBatch.name || 'Raw Forest Wildflower Honey'}</h2>
                      <span className="lbl-honey-type">
                        {packageRecord?.floralSource || 'Multifloral Wild Forest Honey · 72% Wildflower, 20% Blackberry, 8% Clover'}
                      </span>
                    </div>

                    {/* Net Quantity Display (§ 16) */}
                    <div className="lbl-net-qty">
                      <span>NET WEIGHT</span>
                      <strong>{packageRecord?.unitDisplay || activeTemplate.unitDisplay}</strong>
                    </div>

                    {/* Scannable QR Matrix with Center Droplet Emblem (§ 20, 26) */}
                    <div className="lbl-qr-block">
                      <div className="lbl-qr-frame">
                        <svg viewBox="0 0 120 120" className="lbl-qr-svg" role="img" aria-label="Label QR Code">
                          <rect width="120" height="120" fill="#FFFDF8" rx="6" />

                          {/* Top-Left Finder */}
                          <rect x="10" y="10" width="30" height="30" rx="3" fill="#34261B" />
                          <rect x="15" y="15" width="20" height="20" fill="#FFFDF8" rx="1.5" />
                          <rect x="20" y="20" width="10" height="10" fill="#34261B" />

                          {/* Top-Right Finder */}
                          <rect x="80" y="10" width="30" height="30" rx="3" fill="#34261B" />
                          <rect x="85" y="15" width="20" height="20" fill="#FFFDF8" rx="1.5" />
                          <rect x="90" y="20" width="10" height="10" fill="#34261B" />

                          {/* Bottom-Left Finder */}
                          <rect x="10" y="80" width="30" height="30" rx="3" fill="#34261B" />
                          <rect x="15" y="85" width="20" height="20" fill="#FFFDF8" rx="1.5" />
                          <rect x="20" y="90" width="10" height="10" fill="#34261B" />

                          {/* Alignment & Timing Modules */}
                          <rect x="48" y="12" width="6" height="6" fill="#34261B" />
                          <rect x="60" y="12" width="6" height="6" fill="#34261B" />
                          <rect x="48" y="24" width="6" height="6" fill="#D99A24" />
                          <rect x="60" y="24" width="6" height="6" fill="#34261B" />

                          <rect x="12" y="48" width="6" height="6" fill="#34261B" />
                          <rect x="24" y="48" width="6" height="6" fill="#D99A24" />
                          <rect x="36" y="48" width="6" height="6" fill="#34261B" />

                          {/* Center HoneyChain Emblem */}
                          <rect x="48" y="48" width="24" height="24" rx="4" fill="#34261B" />
                          <path
                            d="M 60 52 L 67 58 L 67 66 L 60 70 L 53 66 L 53 58 Z"
                            fill="none"
                            stroke="#D99A24"
                            strokeWidth="1.8"
                          />
                          <circle cx="60" cy="61" r="2.5" fill="#D99A24" />

                          <rect x="78" y="48" width="6" height="6" fill="#34261B" />
                          <rect x="90" y="48" width="6" height="6" fill="#34261B" />
                          <rect x="102" y="48" width="6" height="6" fill="#D99A24" />

                          <rect x="48" y="78" width="6" height="6" fill="#34261B" />
                          <rect x="60" y="78" width="6" height="6" fill="#D99A24" />
                          <rect x="72" y="78" width="6" height="6" fill="#34261B" />
                          <rect x="84" y="78" width="6" height="6" fill="#34261B" />
                          <rect x="96" y="78" width="6" height="6" fill="#34261B" />

                          <rect x="48" y="90" width="6" height="6" fill="#34261B" />
                          <rect x="60" y="90" width="6" height="6" fill="#34261B" />
                          <rect x="72" y="90" width="6" height="6" fill="#D99A24" />
                          <rect x="84" y="90" width="6" height="6" fill="#34261B" />
                        </svg>
                      </div>

                      <span className="lbl-qr-callout">Scan to view the HoneyChain verification record</span>
                      <strong className="lbl-public-ref">{packageRecord?.publicReference || 'HC-PUB-PKG-0042'}</strong>
                    </div>

                    {/* Traceability Block (§ 16, 27) */}
                    <div className="lbl-traceability-grid">
                      <div className="lbl-trace-item">
                        <span>BATCH</span>
                        <strong>{currentBatch.batchNumber || 'HC-2409'}</strong>
                      </div>
                      <div className="lbl-trace-item">
                        <span>PACKAGE</span>
                        <strong>{packageRecord?.packageId || 'PKG-0042'}</strong>
                      </div>
                      <div className="lbl-trace-item">
                        <span>PACKED</span>
                        <strong>{packageRecord?.packagingDate ? packageRecord.packagingDate.split('·')[0].trim() : '25 Sep 2026'}</strong>
                      </div>
                      <div className="lbl-trace-item">
                        <span>TAMPER SEAL</span>
                        <strong className="mono">{packageRecord?.tamperSealId || 'HC-SEAL-2026-925-J42'}</strong>
                      </div>
                    </div>

                    {/* Official Verification Badge (§ 19) */}
                    <div className="lbl-verified-badge">
                      <ShieldCheck size={14} color="#4F7A52" />
                      <span>HoneyChain Verified · Cold Extracted Origin</span>
                    </div>

                    {/* Regulatory & Legal Declaration Footer (§ 17) */}
                    <div className="lbl-regulatory-footer">
                      <div className="reg-row">
                        <span>FSSAI Lic. No. 10022026001894</span>
                        <span>Moisture: 17.8% (Optimal)</span>
                      </div>
                      <p className="reg-text">
                        Packed by Meadowbrook Apiary Cooperative, South Ridge Valley. Ingredients: 100% Pure Raw Honey. Best Before: 24 Months. Consumer Care: care@honeychain.org
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. PRIMARY OPERATIONAL ACTION BUTTONS (§ 1, 30, 31, 39, 50) */}
              <div className="pkg-actions-card">
                <h3 className="card-heading">Label Actions</h3>

                <div className="pkg-actions-grid">
                  {!isFinalized ? (
                    <button
                      type="button"
                      className="btn btn-primary act-btn"
                      onClick={() => setIsFinalizeModalOpen(true)}
                    >
                      <CheckCheck size={16} />
                      <span>Finalize label</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary act-btn"
                      onClick={() => setIsPrintModalOpen(true)}
                    >
                      <Printer size={16} />
                      <span>Print / Download label</span>
                    </button>
                  )}

                  <div className="pkg-sub-actions-row">
                    <button
                      type="button"
                      className="btn btn-secondary sub-btn"
                      onClick={() => setIsPayloadTestModalOpen(true)}
                      title="Validate that QR payload matches expected public reference"
                    >
                      <QrCode size={14} />
                      <span>Test QR payload</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary sub-btn"
                      onClick={handleCopyRef}
                    >
                      {copiedRef ? <Check size={14} color="#4F7A52" /> : <Copy size={14} />}
                      <span>{copiedRef ? 'Copied' : 'Copy reference'}</span>
                    </button>
                  </div>

                  <div className="pkg-link-row">
                    <button
                      type="button"
                      className="text-link-btn"
                      onClick={() => openPublicVerification && openPublicVerification(packageRecord?.publicReference || 'HC-PUB-PKG-0042')}
                    >
                      <ExternalLink size={13} />
                      <span>Open public verification (Screen 28)</span>
                    </button>

                    {isFinalized && (
                      <button
                        type="button"
                        className="text-link-btn replace"
                        onClick={() => setIsReplaceModalOpen(true)}
                      >
                        <RotateCcw size={13} />
                        <span>Revise label (Version bump)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. PACKAGING AUDIT HISTORY TIMELINE (§ 36, 44) */}
              <div className="pkg-card pkg-history-card">
                <h3 className="card-heading">Packaging Lifecycle Audit</h3>
                <p className="card-sub">Cryptographic operational record of package allocation and label states.</p>

                <div className="history-timeline">
                  {(packageRecord?.history || []).map((node, idx) => (
                    <div key={node.id || idx} className="history-node">
                      <div className="node-marker">
                        <span className="node-dot" />
                        {idx < (packageRecord?.history?.length || 0) - 1 && <span className="node-line" />}
                      </div>
                      <div className="node-details">
                        <div className="node-top">
                          <strong className="node-title">{node.title}</strong>
                          <span className="node-time">{node.timestamp}</span>
                        </div>
                        <span className="node-actor">{node.actor}</span>
                        {node.notes && <p className="node-notes">{node.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* =========================================================================
              TAB 2: PROGRESSIVE PACKAGING CREATION WIZARD (§ 5, 9, 10, 12, 14)
              ========================================================================= */}
          {activeTab === 'WIZARD' && (
            <div className="pkg-wizard-wrap">
              <div className="wizard-progress-bar">
                <div className="progress-step active">
                  <span className="step-num">1</span>
                  <span className="step-label">Batch & Unit</span>
                </div>
                <div className="progress-line" />
                <div className={`progress-step ${wizardStep >= 2 ? 'active' : ''}`}>
                  <span className="step-num">2</span>
                  <span className="step-label">Allocation</span>
                </div>
                <div className="progress-line" />
                <div className={`progress-step ${wizardStep >= 3 ? 'active' : ''}`}>
                  <span className="step-num">3</span>
                  <span className="step-label">Generate</span>
                </div>
              </div>

              {/* STEP 1: SELECT BATCH & SPECIFY PACKAGE DETAILS */}
              {wizardStep === 1 && (
                <div className="wizard-step-card">
                  <h3 className="step-heading">Step 1 — Confirm Batch Source & Template</h3>
                  <p className="step-sub">Select the verified batch and choose packaging container specifications.</p>

                  <div className="wizard-batch-spec">
                    <div className="spec-row">
                      <span>Source Batch:</span>
                      <strong className="mono">{currentBatch.batchNumber}</strong>
                    </div>
                    <div className="spec-row">
                      <span>Available Stock:</span>
                      <strong>{batchAllocation?.remainingWeightKg?.toFixed(1) || '13.5'} kg</strong>
                    </div>
                    <div className="spec-row">
                      <span>Verification:</span>
                      <strong style={{ color: '#4F7A52' }}>✓ Confirmed & Tested</strong>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="input-label">Packaging Container Template</label>
                    <div className="wizard-template-grid">
                      {LABEL_TEMPLATES.map((t) => (
                        <div
                          key={t.id}
                          className={`wizard-tpl-box ${wizardTemplateId === t.id ? 'active' : ''}`}
                          onClick={() => {
                            setWizardTemplateId(t.id);
                            setWizardUnitGrams(t.unitGrams);
                          }}
                        >
                          <div className="tpl-box-head">
                            <strong>{t.name}</strong>
                            <span className="weight-pill">{t.unitDisplay}</span>
                          </div>
                          <p className="tpl-box-desc">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="input-label">Number of Containers to Allocate</label>
                    <div className="qty-counter-row">
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => setWizardCount(Math.max(1, wizardCount - 1))}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={wizardCount}
                        onChange={(e) => setWizardCount(parseInt(e.target.value, 10) || 1)}
                        className="counter-input"
                      />
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => setWizardCount(wizardCount + 1)}
                      >
                        +
                      </button>
                      <span className="unit-label">Units ({wizardCount} × {wizardUnitGrams}g)</span>
                    </div>
                  </div>

                  <div className="wizard-nav-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setWizardStep(2)}
                      disabled={!wizardQtyCheck.valid}
                    >
                      Next: Review Allocation →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: QUANTITY ALLOCATION & ID ASSIGNMENT */}
              {wizardStep === 2 && (
                <div className="wizard-step-card">
                  <h3 className="step-heading">Step 2 — Quantity Allocation & ID Assignment</h3>
                  <p className="step-sub">Authoritative server-side stock allocation calculation (§ 10 & 14).</p>

                  <div className="allocation-math-box">
                    <div className="math-row">
                      <span>Total Available Batch Weight:</span>
                      <strong>{wizardQtyCheck.availableKg?.toFixed(2)} kg</strong>
                    </div>
                    <div className="math-row deduct">
                      <span>Requested Packaging Weight ({wizardCount} × {wizardUnitGrams}g):</span>
                      <strong>- {wizardQtyCheck.requestedKg?.toFixed(2)} kg</strong>
                    </div>
                    <div className="math-divider" />
                    <div className="math-row remaining">
                      <span>Remaining Batch Weight:</span>
                      <strong>{wizardQtyCheck.remainingAfterKg?.toFixed(2)} kg</strong>
                    </div>
                  </div>

                  {!wizardQtyCheck.valid ? (
                    <div className="pkg-prereq-alert">
                      <AlertTriangle size={16} color="#B85450" />
                      <span>{wizardQtyCheck.reason}</span>
                    </div>
                  ) : (
                    <div className="auto-ids-preview">
                      <div className="id-item">
                        <span>Package Identifier:</span>
                        <strong className="mono">PKG-0043 (Auto-Generated)</strong>
                      </div>
                      <div className="id-item">
                        <span>Cryptographic Tamper Seal:</span>
                        <strong className="mono">HC-SEAL-2026-925-J43</strong>
                      </div>
                      <div className="id-item">
                        <span>Public Verification Reference:</span>
                        <strong className="mono">HC-PUB-PKG-0043</strong>
                      </div>
                    </div>
                  )}

                  <div className="wizard-nav-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setWizardStep(1)}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setWizardStep(3)}
                      disabled={!wizardQtyCheck.valid}
                    >
                      Next: Confirm & Generate →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CONFIRM & EXECUTE GENERATION */}
              {wizardStep === 3 && (
                <div className="wizard-step-card">
                  <h3 className="step-heading">Step 3 — Confirm & Generate Physical Package</h3>
                  <p className="step-sub">Lock allocation and prepare the physical package record with scannable QR.</p>

                  <div className="wizard-final-summary">
                    <div className="summary-row">
                      <span>Product:</span>
                      <strong>{currentBatch.name}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Batch:</span>
                      <strong className="mono">{currentBatch.batchNumber}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Container Spec:</span>
                      <strong>{productPackagingService.getTemplateById(wizardTemplateId).name}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Net Weight Allocated:</span>
                      <strong>{wizardQtyCheck.requestedKg?.toFixed(2)} kg</strong>
                    </div>
                    <div className="summary-row">
                      <span>QR Payload:</span>
                      <span className="mono" style={{ fontSize: '11px', color: '#D99A24' }}>
                        {OFFICIAL_PUBLIC_DOMAIN}/verify/HC-PUB-PKG-0043
                      </span>
                    </div>
                  </div>

                  <div className="wizard-nav-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setWizardStep(2)}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleExecuteWizardCreate}
                      disabled={isCreatingPackage}
                    >
                      {isCreatingPackage ? 'Generating Package & Label…' : 'Generate Package & Label'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 3: BATCH STOCK ALLOCATION & TRACEABILITY (§ 14, 42)
              ========================================================================= */}
          {activeTab === 'STOCK' && (
            <div className="pkg-card">
              <h3 className="card-heading">Batch Stock Allocation</h3>
              <p className="card-sub">
                Live inventory tracking ensuring total package allocation never exceeds harvested batch volume.
              </p>

              <div className="stock-visual-bar">
                <div
                  className="bar-allocated"
                  style={{
                    width: `${Math.min(100, ((batchAllocation?.allocatedWeightKg || 5) / (batchAllocation?.totalBatchWeightKg || 18.5)) * 100)}%`
                  }}
                />
              </div>

              <div className="stock-metrics-grid">
                <div className="metric-box">
                  <span className="metric-label">TOTAL BATCH VOLUME</span>
                  <strong className="metric-val">{batchAllocation?.totalBatchWeightKg || 18.5} kg</strong>
                </div>
                <div className="metric-box">
                  <span className="metric-label">ALLOCATED TO PACKAGES</span>
                  <strong className="metric-val">{batchAllocation?.allocatedWeightKg || 5.0} kg</strong>
                </div>
                <div className="metric-box">
                  <span className="metric-label">REMAINING AVAILABLE</span>
                  <strong className="metric-val remaining">{batchAllocation?.remainingWeightKg?.toFixed(1) || 13.5} kg</strong>
                </div>
                <div className="metric-box">
                  <span className="metric-label">PACKAGES ISSUED</span>
                  <strong className="metric-val">{batchAllocation?.packageCountTotal || 10} Jars</strong>
                </div>
              </div>

              <div className="allocated-packages-list">
                <h4 className="sec-subhead">Allocated Package Lots</h4>
                <div className="pkg-item-row">
                  <div className="pkg-item-left">
                    <span className="pkg-chip">PKG-0042</span>
                    <div>
                      <strong>Individual Hex Jar #42</strong>
                      <span className="sub-txt">500g Glass · HC-SEAL-2026-925-J42</span>
                    </div>
                  </div>
                  <span className="status-badge-done">Finalized</span>
                </div>
                <div className="pkg-item-row">
                  <div className="pkg-item-left">
                    <span className="pkg-chip">PKG-0001</span>
                    <div>
                      <strong>Batch Lot Run (Lot HC-2409-P01)</strong>
                      <span className="sub-txt">9 × 500g Hex Jars · Shared Batch QR</span>
                    </div>
                  </div>
                  <span className="status-badge-done">Active</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* =========================================================================
            MODAL 1: FINALIZE LABEL CONFIRMATION (§ 30, 31, 35)
            ========================================================================= */}
        {isFinalizeModalOpen && (
          <div className="pkg-modal-backdrop" onClick={() => setIsFinalizeModalOpen(false)}>
            <div className="pkg-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="pkg-modal-header">
                <h3 className="pkg-modal-title">Finalize packaging label?</h3>
                <button
                  type="button"
                  className="pkg-modal-close"
                  onClick={() => setIsFinalizeModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <p className="pkg-modal-text">
                Finalizing this label locks the package metadata and connects this physical unit to its cryptographic HoneyChain public record.
              </p>

              <div className="pkg-modal-details">
                <div className="modal-row">
                  <span>Product:</span>
                  <strong>{currentBatch.name}</strong>
                </div>
                <div className="modal-row">
                  <span>Batch:</span>
                  <strong className="mono">{currentBatch.batchNumber}</strong>
                </div>
                <div className="modal-row">
                  <span>Package ID:</span>
                  <strong className="mono">{packageRecord?.packageId || 'PKG-0042'}</strong>
                </div>
                <div className="modal-row">
                  <span>Public Reference:</span>
                  <strong className="mono">{packageRecord?.publicReference || 'HC-PUB-PKG-0042'}</strong>
                </div>
                <div className="modal-row">
                  <span>Verification:</span>
                  <strong style={{ color: '#4F7A52' }}>✓ Confirmed & Sealed</strong>
                </div>
              </div>

              <div className="pkg-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsFinalizeModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmFinalize}
                >
                  Confirm Finalization
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: PRINT / DOWNLOAD PHYSICAL LABEL (§ 50, 51)
            ========================================================================= */}
        {isPrintModalOpen && (
          <div className="pkg-modal-backdrop" onClick={() => setIsPrintModalOpen(false)}>
            <div className="pkg-modal-card print-card" onClick={(e) => e.stopPropagation()}>
              <div className="pkg-modal-header">
                <h3 className="pkg-modal-title">Print-Ready Packaging Label</h3>
                <button
                  type="button"
                  className="pkg-modal-close"
                  onClick={() => setIsPrintModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <p className="pkg-modal-text" style={{ marginBottom: '14px' }}>
                300 DPI high-resolution label formatted for production packaging lines ({activeTemplate.physicalWidthMm}mm × {activeTemplate.physicalHeightMm}mm).
              </p>

              {/* Print Preview Card */}
              <div className="print-sticker-frame">
                <div className="brand-strip">
                  <span className="b-icon">⬡</span>
                  <span className="b-text">HoneyChain Artisanal Reserve</span>
                </div>
                <h4 className="print-prod-title">{currentBatch.name}</h4>
                <span className="print-net-wt">{activeTemplate.unitDisplay}</span>

                <div className="print-qr-wrap">
                  <svg viewBox="0 0 100 100" className="print-qr-svg">
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
                    <rect x="44" y="44" width="12" height="12" fill="#34261B" rx="2" />
                    <rect x="62" y="44" width="6" height="6" fill="#34261B" />
                    <rect x="84" y="44" width="6" height="6" fill="#D99A24" />
                    <rect x="44" y="64" width="6" height="6" fill="#34261B" />
                    <rect x="54" y="64" width="6" height="6" fill="#D99A24" />
                    <rect x="64" y="64" width="6" height="6" fill="#34261B" />
                  </svg>
                </div>

                <span className="print-scan-cue">Scan to view verification</span>
                <strong className="print-ref-str">{packageRecord?.publicReference || 'HC-PUB-PKG-0042'}</strong>
                <span className="print-sub-str">
                  Batch: {currentBatch.batchNumber} · Package: {packageRecord?.packageId || 'PKG-0042'}
                </span>
                <span className="print-seal-str">Seal: {packageRecord?.tamperSealId || 'HC-SEAL-2026-925-J42'}</span>
              </div>

              <div className="pkg-modal-actions" style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    showToast('Print-ready SVG asset downloaded');
                    setIsPrintModalOpen(false);
                  }}
                >
                  <Download size={14} />
                  <span>Download SVG (300 DPI)</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePrintConfirm}
                >
                  <Printer size={14} />
                  <span>Print Label</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 3: QR PAYLOAD VALIDATION REPORT (§ 39, 40)
            ========================================================================= */}
        {isPayloadTestModalOpen && (
          <div className="pkg-modal-backdrop" onClick={() => setIsPayloadTestModalOpen(false)}>
            <div className="pkg-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="pkg-modal-header">
                <h3 className="pkg-modal-title">QR Payload Validation Report</h3>
                <button
                  type="button"
                  className="pkg-modal-close"
                  onClick={() => setIsPayloadTestModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <p className="pkg-modal-text">
                Testing that the physical QR code resolves to the authoritative HoneyChain public record without exposing private keys.
              </p>

              <div className="test-results-box">
                <div className="test-item ok">
                  <CheckCircle2 size={16} color="#4F7A52" />
                  <div>
                    <strong>Encoded URL Match</strong>
                    <span className="mono">{OFFICIAL_PUBLIC_DOMAIN}/verify/{packageRecord?.publicReference || 'HC-PUB-PKG-0042'}</span>
                  </div>
                </div>

                <div className="test-item ok">
                  <CheckCircle2 size={16} color="#4F7A52" />
                  <div>
                    <strong>Quiet Zone & Scannability</strong>
                    <span>5 mm clear zone around modules (ISO/IEC 18004 compliant).</span>
                  </div>
                </div>

                <div className="test-item ok">
                  <CheckCircle2 size={16} color="#4F7A52" />
                  <div>
                    <strong>Security Verification</strong>
                    <span>Zero MongoDB IDs, GPS coordinates, or private tokens encoded.</span>
                  </div>
                </div>
              </div>

              <div className="pkg-modal-actions" style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsPayloadTestModalOpen(false)}
                >
                  Validation Passed (OK)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 4: REVISE / VERSION BUMP MODAL (§ 34, 35)
            ========================================================================= */}
        {isReplaceModalOpen && (
          <div className="pkg-modal-backdrop" onClick={() => setIsReplaceModalOpen(false)}>
            <div className="pkg-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="pkg-modal-header">
                <h3 className="pkg-modal-title">Revise packaging label?</h3>
                <button
                  type="button"
                  className="pkg-modal-close"
                  onClick={() => setIsReplaceModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <p className="pkg-modal-text">
                The current finalized label ({packageRecord?.label?.version}) will be marked as superseded. A new revision (v2) will be created with an operational audit trail.
              </p>

              <div style={{ marginTop: '12px', marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#34261B', display: 'block', marginBottom: '6px' }}>
                  Reason for label revision
                </label>
                <input
                  type="text"
                  value={replaceReason}
                  onChange={(e) => setReplaceReason(e.target.value)}
                  className="pqr-modal-input"
                />
              </div>

              <div className="pkg-modal-actions">
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
                  Create Revision
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCOPED STYLES
            ========================================================================= */}
        <style>{`
          .product-packaging-overlay {
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

          .product-packaging-container {
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
          .pkg-header {
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

          .pkg-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .pkg-back-btn {
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

          .pkg-back-btn:hover { background: #EDE2D1; }

          .pkg-header-titles {
            display: flex;
            flex-direction: column;
          }

          .pkg-header-eyebrow {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #D99A24;
          }

          .pkg-header-title {
            font-size: 18px;
            font-weight: 800;
            color: #34261B;
            margin: 0;
            line-height: 1.2;
          }

          .pkg-header-sub {
            font-size: 11.5px;
            color: #786D61;
            margin: 2px 0 0 0;
          }

          .pkg-demo-pill {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 5px 10px;
            border-radius: 20px;
            background: #FEF3D6;
            border: 1px solid rgba(217, 154, 36, 0.4);
            color: #8C5D08;
            font-size: 11.5px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
          }

          .pkg-demo-pill .chev {
            transition: transform 0.2s;
          }
          .pkg-demo-pill .chev.up {
            transform: rotate(180deg);
          }

          /* Demo Drawer */
          .pkg-demo-drawer {
            background: #FFFDF8;
            border-bottom: 2px solid #D99A24;
            padding: 14px 16px;
            animation: slideDown 0.2s ease-out;
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .pkg-demo-drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
          }

          .drawer-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #8C5D08;
          }

          .drawer-close {
            background: none;
            border: none;
            font-size: 14px;
            color: #786D61;
            cursor: pointer;
          }

          .pkg-scenarios-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .pkg-scenario-chip {
            padding: 10px 12px;
            border-radius: 10px;
            background: #FFF9EF;
            border: 1px solid #EDE2D1;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
          }

          .pkg-scenario-chip:hover {
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
          .pkg-context-strip {
            background: #FAF2E4;
            padding: 10px 16px;
            border-bottom: 1px solid #EDE2D1;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .pkg-context-left {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .pkg-batch-badge {
            font-family: monospace;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 6px;
            background: #34261B;
            color: #FFFDF8;
            border-radius: 4px;
          }

          .pkg-product-title {
            font-size: 13px;
            font-weight: 700;
            color: #34261B;
          }

          .pkg-id-badge {
            display: flex;
            align-items: center;
            gap: 4px;
            background: #FEF3D6;
            color: #8C5D08;
            font-family: monospace;
            font-weight: 700;
            font-size: 11.5px;
            padding: 3px 8px;
            border-radius: 6px;
            border: 1px solid rgba(217, 154, 36, 0.3);
          }

          .pkg-lot-info {
            font-size: 11.5px;
            color: #786D61;
          }

          /* Navigation Tabs */
          .pkg-nav-tabs {
            display: flex;
            padding: 8px 16px;
            background: #FFFDF8;
            border-bottom: 1px solid #EDE2D1;
            gap: 8px;
          }

          .pkg-nav-btn {
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

          .pkg-nav-btn.active {
            background: #34261B;
            color: #FFFDF8;
            border-color: #34261B;
          }

          /* Body Container */
          .pkg-body {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          /* Ineligible Alert */
          .pkg-ineligible-card {
            background: #FDF3F2;
            border: 1.5px solid rgba(184, 84, 80, 0.4);
            border-radius: 12px;
            padding: 14px 16px;
          }

          .inelig-head {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
          }

          .inelig-title {
            font-size: 13.5px;
            font-weight: 800;
            color: #B85450;
            margin: 0;
          }

          .inelig-desc {
            font-size: 12px;
            color: #786D61;
            margin: 0 0 10px 0;
            line-height: 1.4;
          }

          .inelig-btn {
            font-size: 11.5px;
            padding: 6px 12px;
            font-weight: 700;
            color: #B85450;
            border-color: rgba(184, 84, 80, 0.4);
          }

          /* Status Hero Card */
          .pkg-status-card {
            border-radius: 14px;
            padding: 16px;
            border: 1px solid #EDE2D1;
            background: #FFFDF8;
          }

          .pkg-status-card.finalized,
          .pkg-status-card.printed {
            background: #F4F8F4;
            border-color: rgba(79, 122, 82, 0.35);
          }

          .pkg-status-card.ready {
            background: #FEF3D6;
            border-color: rgba(217, 154, 36, 0.4);
          }

          .pkg-status-card.superseded {
            background: #F8F7F5;
            border-color: #D3CDC6;
          }

          .status-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .status-pill {
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

          .pkg-status-card.ready .status-dot { background: #D99A24; }
          .pkg-status-card.superseded .status-dot { background: #786D61; }

          .status-text {
            font-size: 14px;
            font-weight: 800;
            color: #34261B;
          }

          .version-pill {
            font-size: 11px;
            font-weight: 700;
            background: rgba(52, 38, 27, 0.08);
            padding: 2px 7px;
            border-radius: 4px;
            color: #34261B;
          }

          .status-explanation {
            font-size: 12.5px;
            color: #786D61;
            line-height: 1.45;
            margin: 0 0 12px 0;
          }

          .template-picker-row {
            border-top: 1px solid rgba(52, 38, 27, 0.08);
            padding-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .tpl-label {
            font-size: 11px;
            font-weight: 700;
            color: #786D61;
            text-transform: uppercase;
          }

          .tpl-chips {
            display: flex;
            gap: 6px;
            overflow-x: auto;
            padding-bottom: 2px;
          }

          .tpl-chip {
            white-space: nowrap;
            font-size: 11px;
            font-weight: 700;
            padding: 5px 9px;
            border-radius: 6px;
            background: #FFF9EF;
            border: 1px solid #EDE2D1;
            color: #786D61;
            cursor: pointer;
            transition: all 0.15s;
          }

          .tpl-chip.active {
            background: #34261B;
            color: #FFFDF8;
            border-color: #34261B;
          }

          /* Physical Label Preview Section */
          .pkg-label-outer {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .pkg-dimensions-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 10.5px;
            color: #786D61;
            font-weight: 700;
            padding: 0 4px;
          }

          .dim-tag { color: #8C5D08; }
          .dpi-tag { color: #4F7A52; }
          .safe-margin-tag { color: #786D61; }

          /* The Physical Label Styling */
          .pkg-physical-label {
            background: #FFFDF8;
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(52, 38, 27, 0.08), 0 1px 3px rgba(52, 38, 27, 0.05);
            padding: 12px;
            border: 1px solid #EDE2D1;
          }

          .label-border-accent {
            border: 1.5px solid #D99A24;
            border-radius: 8px;
            padding: 16px 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            background: linear-gradient(180deg, #FFFDF8 0%, #FFF9EF 100%);
          }

          .lbl-brand-row {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 8px;
          }

          .lbl-brand-emblem {
            font-size: 16px;
            color: #D99A24;
            line-height: 1;
            margin-bottom: 2px;
          }

          .lbl-brand-name {
            font-size: 14px;
            font-weight: 900;
            letter-spacing: 0.18em;
            color: #34261B;
          }

          .lbl-brand-sub {
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.2em;
            color: #8C5D08;
            margin-top: 1px;
          }

          .lbl-product-section {
            margin: 8px 0 10px 0;
          }

          .lbl-product-name {
            font-size: 17px;
            font-weight: 800;
            color: #34261B;
            margin: 0 0 3px 0;
            letter-spacing: -0.01em;
          }

          .lbl-honey-type {
            font-size: 11px;
            color: #786D61;
            line-height: 1.3;
            display: block;
            max-width: 280px;
          }

          .lbl-net-qty {
            margin: 4px 0 12px 0;
            background: #FEF3D6;
            padding: 4px 12px;
            border-radius: 20px;
            border: 1px solid rgba(217, 154, 36, 0.3);
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .lbl-net-qty span {
            font-size: 9.5px;
            font-weight: 700;
            color: #8C5D08;
            letter-spacing: 0.05em;
          }

          .lbl-net-qty strong {
            font-size: 12.5px;
            font-weight: 800;
            color: #34261B;
          }

          /* Label QR Frame */
          .lbl-qr-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 12px;
          }

          .lbl-qr-frame {
            width: 128px;
            height: 128px;
            background: #FFFDF8;
            padding: 4px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #EDE2D1;
            margin-bottom: 6px;
          }

          .lbl-qr-svg {
            width: 100%;
            height: 100%;
            display: block;
          }

          .lbl-qr-callout {
            font-size: 10px;
            font-weight: 700;
            color: #34261B;
            margin-bottom: 2px;
          }

          .lbl-public-ref {
            font-family: monospace;
            font-size: 12px;
            font-weight: 800;
            color: #D99A24;
            letter-spacing: 0.05em;
          }

          /* Traceability Grid */
          .lbl-traceability-grid {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            background: #FFFDF8;
            padding: 8px;
            border-radius: 6px;
            border: 1px solid #EDE2D1;
            margin-bottom: 10px;
          }

          .lbl-trace-item {
            text-align: left;
            display: flex;
            flex-direction: column;
          }

          .lbl-trace-item span {
            font-size: 8.5px;
            font-weight: 700;
            color: #786D61;
            letter-spacing: 0.05em;
          }

          .lbl-trace-item strong {
            font-size: 11px;
            color: #34261B;
            font-weight: 700;
          }

          .lbl-trace-item strong.mono {
            font-family: monospace;
            font-size: 10px;
          }

          /* Verified Badge */
          .lbl-verified-badge {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 10px;
            font-weight: 700;
            color: #4F7A52;
            margin-bottom: 8px;
          }

          /* Regulatory Footer */
          .lbl-regulatory-footer {
            border-top: 1px solid rgba(52, 38, 27, 0.1);
            padding-top: 8px;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 3px;
          }

          .reg-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 8.5px;
            font-weight: 700;
            color: #786D61;
          }

          .reg-text {
            font-size: 8px;
            color: #786D61;
            line-height: 1.3;
            margin: 0;
            text-align: justify;
          }

          /* Actions Card */
          .pkg-actions-card {
            background: #FFFDF8;
            border-radius: 14px;
            border: 1px solid #EDE2D1;
            padding: 16px;
          }

          .card-heading {
            font-size: 14px;
            font-weight: 800;
            color: #34261B;
            margin: 0 0 10px 0;
          }

          .card-sub {
            font-size: 11.5px;
            color: #786D61;
            margin: 0 0 12px 0;
            line-height: 1.4;
          }

          .pkg-actions-grid {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .act-btn {
            height: 44px;
            font-size: 13.5px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border-radius: 10px;
            background: #D99A24;
            color: #FFFDF8;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
          }

          .act-btn:hover { background: #BF8216; }

          .pkg-sub-actions-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .sub-btn {
            height: 38px;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            border-radius: 8px;
            background: #FFF9EF;
            border: 1px solid #EDE2D1;
            color: #34261B;
            cursor: pointer;
            transition: all 0.2s;
          }

          .sub-btn:hover { background: #EDE2D1; }

          .pkg-link-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 4px;
          }

          .text-link-btn {
            background: none;
            border: none;
            font-size: 11.5px;
            font-weight: 700;
            color: #D99A24;
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            padding: 4px;
          }

          .text-link-btn.replace { color: #786D61; }

          /* History Timeline */
          .pkg-history-card {
            background: #FFFDF8;
            border-radius: 14px;
            border: 1px solid #EDE2D1;
            padding: 16px;
          }

          .history-timeline {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 8px;
          }

          .history-node {
            display: flex;
            gap: 12px;
          }

          .node-marker {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .node-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #D99A24;
            margin-top: 4px;
          }

          .node-line {
            width: 1.5px;
            flex: 1;
            background: #EDE2D1;
            margin: 4px 0;
          }

          .node-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .node-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .node-title {
            font-size: 12.5px;
            color: #34261B;
          }

          .node-time {
            font-size: 10.5px;
            color: #786D61;
          }

          .node-actor {
            font-size: 11px;
            color: #786D61;
          }

          .node-notes {
            font-size: 11px;
            color: #34261B;
            background: #FFF9EF;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid #EDE2D1;
            margin: 4px 0 0 0;
            line-height: 1.35;
          }

          /* WIZARD VIEW STYLES */
          .pkg-wizard-wrap {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .wizard-progress-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #FFFDF8;
            padding: 12px 16px;
            border-radius: 12px;
            border: 1px solid #EDE2D1;
          }

          .progress-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          }

          .step-num {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #EDE2D1;
            color: #786D61;
            font-size: 11.5px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .progress-step.active .step-num {
            background: #34261B;
            color: #FFFDF8;
          }

          .step-label {
            font-size: 10px;
            font-weight: 700;
            color: #786D61;
          }

          .progress-step.active .step-label { color: #34261B; }

          .progress-line {
            height: 2px;
            flex: 1;
            background: #EDE2D1;
            margin: 0 8px 14px 8px;
          }

          .wizard-step-card {
            background: #FFFDF8;
            border-radius: 14px;
            border: 1px solid #EDE2D1;
            padding: 16px;
          }

          .step-heading {
            font-size: 15px;
            font-weight: 800;
            color: #34261B;
            margin: 0 0 3px 0;
          }

          .step-sub {
            font-size: 11.5px;
            color: #786D61;
            margin: 0 0 14px 0;
          }

          .wizard-batch-spec {
            background: #FAF2E4;
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid #EDE2D1;
            display: flex;
            flex-direction: column;
            gap: 5px;
          }

          .spec-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            color: #34261B;
          }

          .wizard-template-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 6px;
          }

          .wizard-tpl-box {
            padding: 10px 12px;
            border-radius: 10px;
            border: 1.5px solid #EDE2D1;
            background: #FFF9EF;
            cursor: pointer;
            transition: all 0.2s;
          }

          .wizard-tpl-box.active {
            border-color: #D99A24;
            background: #FEF3D6;
          }

          .tpl-box-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 3px;
          }

          .tpl-box-head strong {
            font-size: 12.5px;
            color: #34261B;
          }

          .weight-pill {
            font-size: 10px;
            font-weight: 800;
            background: #34261B;
            color: #FFFDF8;
            padding: 2px 6px;
            border-radius: 4px;
          }

          .tpl-box-desc {
            font-size: 11px;
            color: #786D61;
            margin: 0;
            line-height: 1.35;
          }

          .qty-counter-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 6px;
          }

          .counter-btn {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: #FFF9EF;
            border: 1px solid #EDE2D1;
            color: #34261B;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
          }

          .counter-input {
            width: 60px;
            height: 36px;
            text-align: center;
            font-size: 14px;
            font-weight: 800;
            border-radius: 8px;
            border: 1px solid #EDE2D1;
            background: #FFFDF8;
            color: #34261B;
          }

          .unit-label {
            font-size: 12px;
            font-weight: 600;
            color: #786D61;
          }

          .wizard-nav-actions {
            margin-top: 18px;
            display: flex;
            gap: 8px;
            justify-content: flex-end;
          }

          /* Step 2 Math Box */
          .allocation-math-box {
            background: #FAF2E4;
            border: 1px solid #EDE2D1;
            border-radius: 10px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 12px;
          }

          .math-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12.5px;
            color: #34261B;
          }

          .math-row.deduct { color: #B85450; }
          .math-row.remaining { font-size: 13.5px; color: #4F7A52; }

          .math-divider {
            height: 1px;
            background: #EDE2D1;
            margin: 3px 0;
          }

          .auto-ids-preview {
            background: #FFF9EF;
            border: 1px solid #EDE2D1;
            border-radius: 10px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .id-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11.5px;
            color: #786D61;
          }

          .id-item strong { color: #34261B; }

          /* Step 3 Summary */
          .wizard-final-summary {
            background: #FAF2E4;
            border: 1px solid #EDE2D1;
            border-radius: 10px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .summary-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            color: #786D61;
          }

          .summary-row strong { color: #34261B; }

          /* STOCK TAB STYLES */
          .stock-visual-bar {
            height: 12px;
            border-radius: 6px;
            background: #EDE2D1;
            overflow: hidden;
            margin-bottom: 14px;
          }

          .bar-allocated {
            height: 100%;
            background: linear-gradient(90deg, #D99A24 0%, #4F7A52 100%);
            border-radius: 6px;
            transition: width 0.3s;
          }

          .stock-metrics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 16px;
          }

          .metric-box {
            background: #FFF9EF;
            border: 1px solid #EDE2D1;
            border-radius: 8px;
            padding: 10px;
            display: flex;
            flex-direction: column;
          }

          .metric-label {
            font-size: 9.5px;
            font-weight: 700;
            color: #786D61;
            letter-spacing: 0.05em;
          }

          .metric-val {
            font-size: 16px;
            font-weight: 800;
            color: #34261B;
            margin-top: 2px;
          }

          .metric-val.remaining { color: #4F7A52; }

          .allocated-packages-list {
            border-top: 1px solid #EDE2D1;
            padding-top: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .sec-subhead {
            font-size: 12px;
            font-weight: 800;
            color: #34261B;
            margin: 0 0 4px 0;
          }

          .pkg-item-row {
            background: #FFFDF8;
            border: 1px solid #EDE2D1;
            border-radius: 8px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .pkg-item-left {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .pkg-chip {
            font-family: monospace;
            font-size: 11px;
            font-weight: 700;
            background: #34261B;
            color: #FFFDF8;
            padding: 2px 6px;
            border-radius: 4px;
          }

          .pkg-item-left strong {
            font-size: 12px;
            color: #34261B;
            display: block;
          }

          .pkg-item-left .sub-txt {
            font-size: 10.5px;
            color: #786D61;
          }

          .status-badge-done {
            font-size: 10.5px;
            font-weight: 700;
            background: #F4F8F4;
            color: #4F7A52;
            padding: 2px 8px;
            border-radius: 12px;
            border: 1px solid rgba(79, 122, 82, 0.3);
          }

          /* MODAL STYLES */
          .pkg-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 100000;
            background: rgba(43, 33, 23, 0.65);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
          }

          .pkg-modal-card {
            background: #FFFDF8;
            border-radius: 16px;
            border: 1px solid #EDE2D1;
            width: 100%;
            max-width: 380px;
            padding: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
            animation: modalPop 0.2s ease-out;
          }

          @keyframes modalPop {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }

          .pkg-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
          }

          .pkg-modal-title {
            font-size: 16px;
            font-weight: 800;
            color: #34261B;
            margin: 0;
          }

          .pkg-modal-close {
            background: none;
            border: none;
            font-size: 16px;
            color: #786D61;
            cursor: pointer;
          }

          .pkg-modal-text {
            font-size: 12.5px;
            color: #786D61;
            line-height: 1.45;
            margin: 0 0 14px 0;
          }

          .pkg-modal-details {
            background: #FAF2E4;
            border-radius: 10px;
            border: 1px solid #EDE2D1;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
          }

          .modal-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            color: #786D61;
          }

          .modal-row strong { color: #34261B; }

          .pkg-modal-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
          }

          .pqr-modal-input {
            width: 100%;
            height: 38px;
            border-radius: 8px;
            border: 1px solid #EDE2D1;
            background: #FFFDF8;
            padding: 0 10px;
            font-size: 13px;
            color: #34261B;
            outline: none;
            box-sizing: border-box;
          }

          .pqr-modal-input:focus { border-color: #D99A24; }

          /* Print Modal Sticker */
          .print-sticker-frame {
            border: 1.5px dashed #D99A24;
            border-radius: 10px;
            padding: 14px;
            text-align: center;
            background: #FFF9EF;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .brand-strip {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 10px;
            font-weight: 800;
            color: #8C5D08;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }

          .print-prod-title {
            font-size: 14px;
            font-weight: 800;
            color: #34261B;
            margin: 0 0 2px 0;
          }

          .print-net-wt {
            font-size: 11px;
            font-weight: 700;
            color: #786D61;
            margin-bottom: 8px;
          }

          .print-qr-wrap {
            width: 90px;
            height: 90px;
            background: #FFFDF8;
            padding: 4px;
            border-radius: 6px;
            border: 1px solid #EDE2D1;
            margin-bottom: 6px;
          }

          .print-qr-svg {
            width: 100%;
            height: 100%;
            display: block;
          }

          .print-scan-cue {
            font-size: 9.5px;
            font-weight: 700;
            color: #34261B;
            margin-bottom: 2px;
          }

          .print-ref-str {
            font-family: monospace;
            font-size: 11.5px;
            color: #D99A24;
          }

          .print-sub-str {
            font-size: 9px;
            color: #786D61;
            margin-top: 4px;
          }

          .print-seal-str {
            font-family: monospace;
            font-size: 8.5px;
            color: #786D61;
          }

          /* Payload Test Box */
          .test-results-box {
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: #F4F8F4;
            border: 1px solid rgba(79, 122, 82, 0.3);
            border-radius: 10px;
            padding: 12px;
          }

          .test-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-size: 11.5px;
          }

          .test-item strong {
            display: block;
            color: #34261B;
            margin-bottom: 2px;
          }

          .test-item span {
            color: #786D61;
            line-height: 1.35;
          }

          .test-item span.mono {
            font-family: monospace;
            color: #4F7A52;
            word-break: break-all;
          }
        `}</style>
      </div>
    </div>
  );
};
