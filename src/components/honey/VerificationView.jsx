import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  QrCode,
  Award,
  ChevronRight,
  ChevronDown,
  Layers,
  FileCheck2,
  Package,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  X,
  RefreshCw,
  Eye,
  Sliders,
  FlaskConical,
  Beaker
} from 'lucide-react';

/**
 * SCREEN 26 — VERIFICATION
 * Master UI/UX + Final Verification + Evidence Review + Trust Layer
 *
 * Core Mental Model:
 * "Has this batch completed the required checks and can it now be presented as verified?"
 * A trust checkpoint, NOT a blockchain dashboard.
 */
export const VerificationView = ({ isOpen, onClose, batch: propBatch, initialScenario = 'ready' }) => {
  const {
    batches,
    activeVerification,
    closeVerification,
    openBatchJourney,
    openQualityCheck,
    openCollectionDetails,
    setSelectedHiveId,
    setActiveTab,
    showToast,
    verifyBatch: contextVerifyBatch,
    openTechnicalProof
  } = useAppState();

  // Active batch fallback resolution
  const targetBatchId = activeVerification?.batchId || propBatch?.id || 'batch-hc-2409';
  const currentBatch = batches.find((b) => b.id === targetBatchId) || propBatch || batches[0] || {
    id: 'batch-hc-2409',
    batchNumber: 'Batch HC-2409',
    name: 'September Harvest',
    sourceHives: ['Hive 01'],
    harvestDate: '2026-09-25',
    weightKg: 18.5,
    collectionId: 'col-2026-0925-01',
    status: 'curing',
    statusLabel: 'Quality Passed (Packaging)',
    moisture: 17.8,
    hmfLevel: '12.4 mg/kg',
    diastase: '14.8 DN',
    pollenAnalysis: '72% Wildflower, 20% Blackberry, 8% Clover',
    lotJarsCount: 37,
    jarVolume: '500g Glass Hexagonal',
    sealHash: '0x8b3f912c4189e49120bc98319fca448912e',
    blockchain: {
      network: 'HoneyChain Consortium Ledger (Proof of Origin)',
      blockNumber: 54819240,
      blockTime: '2026-09-25 13:45:10 UTC',
      merkleRoot: '0x3f9801a4e5bc1209e86d23fb482b9a710255',
      txHash: '0xd942b87f619e083a21dc49019b841e2a537f',
      verificationUrl: 'https://verify.honeychain.org/b/HC-2409'
    }
  };

  // State management
  const [scenario, setScenario] = useState(initialScenario); // 'ready', 'not_ready', 'needs_attention', 'verified'
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(currentBatch.status === 'certified' || scenario === 'verified');
  const [isTechProofOpen, setIsTechProofOpen] = useState(false);
  const [isConsumerQROpen, setIsConsumerQROpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isJuryDrawerOpen, setIsJuryDrawerOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const lastScenarioRef = React.useRef(activeVerification?.scenario);

  // Sync only when incoming activeVerification.scenario actually changes externally
  useEffect(() => {
    if (activeVerification?.scenario && activeVerification.scenario !== lastScenarioRef.current) {
      lastScenarioRef.current = activeVerification.scenario;
      setScenario(activeVerification.scenario);
      setIsVerified(activeVerification.scenario === 'verified');
    } else if (currentBatch.status === 'certified' && !isVerified) {
      setScenario('verified');
      setIsVerified(true);
    }
  }, [activeVerification?.scenario, currentBatch.status]);

  if (!isOpen && !activeVerification) return null;

  const handleClose = () => {
    if (closeVerification) closeVerification();
    if (onClose) onClose();
  };

  // Copy hash helper
  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedHash(true);
    showToast('Transaction hash copied to clipboard');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Scenario switch helper
  const applyScenario = (newScenario) => {
    setScenario(newScenario);
    setIsVerified(newScenario === 'verified');
    setIsConfirmModalOpen(false);
    setIsVerifying(false);
    setIsJuryDrawerOpen(false);
    showToast(`Switched to: ${getScenarioLabel(newScenario)}`);
  };

  const getScenarioLabel = (s) => {
    switch (s) {
      case 'ready':
        return 'Ready for Verification (All 5 Prerequisites Passed)';
      case 'not_ready':
        return 'Not Ready (Packaging Missing)';
      case 'needs_attention':
        return 'Needs Attention (Moisture Re-test Flagged)';
      case 'verified':
        return 'Batch Verified (Cryptographically Sealed)';
      default:
        return s;
    }
  };

  // Execute Authoritative Verification
  const handleConfirmVerification = () => {
    setIsConfirmModalOpen(false);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setScenario('verified');
      if (contextVerifyBatch) {
        contextVerifyBatch(currentBatch.id, {
          verifiedAt: '25 Sep 2026 · 13:45 UTC',
          verifierName: 'Elena Vance (Lead Quality Inspector)',
          verificationLotId: 'Lot HC-2409-P01'
        });
      }
      showToast('Batch successfully verified & origin sealed');
    }, 1200);
  };

  // Prerequisites definition based on current scenario
  const prerequisites = [
    {
      id: 'source',
      title: 'Source colony recorded',
      detail: 'Hive 01 (Cedar Queen) · Meadowbrook Apiary',
      isComplete: true,
      onClick: () => {
        setSelectedHiveId('hive-01');
        setActiveTab('hives');
        handleClose();
      }
    },
    {
      id: 'collection',
      title: 'Collection recorded',
      detail: '25 Sep 2026 · 18.5 kg raw comb honey',
      isComplete: true,
      onClick: () => {
        openCollectionDetails({ collectionId: currentBatch.collectionId || 'col-2026-0925-01' });
        handleClose();
      }
    },
    {
      id: 'processing',
      title: 'Processing completed',
      detail: 'Cold extraction & settling · 17.9 kg recorded net yield',
      isComplete: true,
      onClick: () => {
        openBatchJourney({ batchId: currentBatch.id });
        handleClose();
      }
    },
    {
      id: 'quality',
      title: 'Quality checks completed',
      detail:
        scenario === 'needs_attention'
          ? 'Attention: Moisture re-test flagged by BioAgro Lab'
          : 'Passed: Moisture 17.8%, HMF 12.4 mg/kg, Diastase 14.8 DN',
      isComplete: scenario !== 'needs_attention',
      isAttention: scenario === 'needs_attention',
      onClick: () => {
        openQualityCheck({ batchId: currentBatch.id });
        handleClose();
      }
    },
    {
      id: 'packaging',
      title: 'Packaging recorded',
      detail:
        scenario === 'not_ready'
          ? 'Pending packaging record & jar lot assignment'
          : 'Completed: Lot HC-2409-P01 (37 jars, 500g Glass Hexagonal)',
      isComplete: scenario !== 'not_ready',
      onClick: () => {
        if (scenario === 'not_ready') {
          showToast('Navigating to packaging log workflow');
        } else {
          showToast('Viewing Lot HC-2409-P01 details');
        }
      }
    }
  ];

  const allPrereqsPassed = prerequisites.every((p) => p.isComplete && !p.isAttention);

  return (
    <div className="verif-screen-overlay" role="dialog" aria-modal="true">
      <div className="verif-screen-container">
        {/* =========================================================================
            HEADER (§ 4)
            ========================================================================= */}
        <header className="verif-header">
          <div className="verif-header-left">
            <button
              type="button"
              className="verif-back-btn"
              onClick={handleClose}
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="verif-header-titles">
              <span className="verif-header-eyebrow">Screen 26 · Trust Checkpoint</span>
              <h1 className="verif-header-title">Verification</h1>
              <p className="verif-header-sub">
                {currentBatch.name || 'September Harvest'} ·{' '}
                <span className="mono">{currentBatch.batchNumber || 'Batch HC-2409'}</span> ·{' '}
                <strong>17.9 kg recorded</strong>
              </p>
            </div>
          </div>

          <div className="verif-header-right">
            <button
              type="button"
              className="verif-demo-pill"
              onClick={() => setIsJuryDrawerOpen(true)}
              title="Open Jury Demonstration Scenarios"
            >
              <Sparkles size={13} />
              <span>Demo</span>
            </button>
          </div>
        </header>

        {/* =========================================================================
            SCROLLABLE CONTENT BODY
            ========================================================================= */}
        <div className="verif-body">
          {/* STATE A: VERIFIED HERO (§ 23–25, § 46) */}
          {isVerified ? (
            <div className="verif-verified-hero-card">
              <div className="verif-hero-badge-wrap">
                <div className="verif-hero-icon-circle">
                  <CheckCircle2 size={32} color="#4F7A52" />
                </div>
              </div>

              <div className="verif-hero-text">
                <span className="verif-hero-eyebrow">Workflow Complete</span>
                <h2 className="verif-hero-title">Batch verified</h2>
                <p className="verif-hero-batch">
                  {currentBatch.name} · <strong className="mono">{currentBatch.batchNumber}</strong>
                </p>
                <p className="verif-hero-desc">
                  All required HoneyChain workflow records have been validated and cryptographically
                  sealed. Traceable to <strong>Hive 01 (Cedar Queen)</strong>.
                </p>
              </div>

              {/* 6-STAGE COMPLETED PROGRESSION (§ 32) */}
              <div className="verif-hero-stages-strip">
                <div className="verif-stage-step done">
                  <Check size={11} className="step-check" />
                  <span>Hive</span>
                </div>
                <div className="step-line done" />
                <div className="verif-stage-step done">
                  <Check size={11} className="step-check" />
                  <span>Harvest</span>
                </div>
                <div className="step-line done" />
                <div className="verif-stage-step done">
                  <Check size={11} className="step-check" />
                  <span>Process</span>
                </div>
                <div className="step-line done" />
                <div className="verif-stage-step done">
                  <Check size={11} className="step-check" />
                  <span>Quality</span>
                </div>
                <div className="step-line done" />
                <div className="verif-stage-step done">
                  <Check size={11} className="step-check" />
                  <span>Package</span>
                </div>
                <div className="step-line done" />
                <div className="verif-stage-step done verified-badge">
                  <Check size={11} className="step-check" />
                  <span>Verified</span>
                </div>
              </div>

              {/* ACTION BUTTONS (§ 47) */}
              <div className="verif-hero-actions">
                <button
                  type="button"
                  className="btn btn-primary verif-cta-btn"
                  onClick={() => {
                    openBatchJourney({ batchId: currentBatch.id });
                    handleClose();
                  }}
                >
                  <Layers size={15} />
                  <span>View honey journey</span>
                  <ChevronRight size={14} />
                </button>

                <div className="verif-hero-sub-actions">
                  <button
                    type="button"
                    className="btn btn-secondary verif-sub-btn"
                    onClick={() => setIsCertModalOpen(true)}
                  >
                    <Award size={15} color="var(--color-deep-honey)" />
                    <span>View certificate</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary verif-sub-btn"
                    onClick={() => setIsConsumerQROpen(true)}
                  >
                    <QrCode size={15} color="var(--color-deep-cocoa)" />
                    <span>View product QR</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary verif-sub-btn"
                    onClick={() => {
                      openTechnicalProof({
                        batchId: currentBatch.id,
                        scenario: 'confirmed'
                      });
                    }}
                  >
                    <ShieldCheck size={15} color="var(--color-primary-honey)" />
                    <span>View technical proof</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STATE B: VERIFICATION READINESS CHECKLIST (§ 6–8) */
            <section className="verif-section verif-readiness-card">
              <div className="verif-readiness-top">
                <div>
                  <span className="verif-sec-eyebrow">Prerequisites Evaluation</span>
                  <h2 className="verif-sec-title">Verification readiness</h2>
                </div>
                <span
                  className={`verif-status-pill ${
                    allPrereqsPassed ? 'ready' : scenario === 'needs_attention' ? 'attention' : 'pending'
                  }`}
                >
                  {allPrereqsPassed
                    ? 'Ready for verification'
                    : scenario === 'needs_attention'
                    ? 'Needs attention'
                    : 'Verification not ready'}
                </span>
              </div>

              <p className="verif-readiness-desc">
                Verification confirms that each physical operation in the honey journey has an
                authoritative digital record before final seal issuance.
              </p>

              {/* INCOMPLETE WARNING IF APPLICABLE (§ 7 & 40) */}
              {!allPrereqsPassed && (
                <div
                  className={`verif-blocker-callout ${
                    scenario === 'needs_attention' ? 'attention' : 'info'
                  }`}
                >
                  <div className="verif-blocker-icon">
                    {scenario === 'needs_attention' ? (
                      <AlertTriangle size={18} color="#D9822B" />
                    ) : (
                      <Clock size={18} color="#786D61" />
                    )}
                  </div>
                  <div className="verif-blocker-content">
                    <strong>
                      {scenario === 'needs_attention'
                        ? 'Quality review requires attention'
                        : 'Packaging information is still missing'}
                    </strong>
                    <p>
                      {scenario === 'needs_attention'
                        ? 'Sample Q-1042 recorded moisture variance. Resolve before certifying.'
                        : 'Retail jar lot allocation must be recorded before final verification.'}
                    </p>
                    <button
                      type="button"
                      className="verif-blocker-cta"
                      onClick={() => {
                        if (scenario === 'needs_attention') {
                          openQualityCheck({ batchId: currentBatch.id });
                          handleClose();
                        } else {
                          showToast('Simulating packaging completion for demo');
                          applyScenario('ready');
                        }
                      }}
                    >
                      {scenario === 'needs_attention' ? 'Review quality check →' : 'Complete packaging now →'}
                    </button>
                  </div>
                </div>
              )}

              {/* CHECKLIST ROWS */}
              <div className="verif-checklist">
                {prerequisites.map((p) => (
                  <div
                    key={p.id}
                    className={`verif-check-row ${
                      p.isComplete ? 'completed' : p.isAttention ? 'attention' : 'pending'
                    }`}
                    onClick={p.onClick}
                  >
                    <div className="verif-check-icon">
                      {p.isComplete ? (
                        <CheckCircle2 size={18} color="#4F7A52" />
                      ) : p.isAttention ? (
                        <AlertTriangle size={18} color="#D9822B" />
                      ) : (
                        <div className="verif-pending-dot" />
                      )}
                    </div>
                    <div className="verif-check-info">
                      <strong className="verif-check-title">{p.title}</strong>
                      <span className="verif-check-sub">{p.detail}</span>
                    </div>
                    <ChevronRight size={15} color="#786D61" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* =========================================================================
              REVIEW BEFORE VERIFYING — EVIDENCE SUMMARY (§ 9–14)
              ========================================================================= */}
          <section className="verif-section">
            <div className="verif-section-header">
              <div>
                <span className="verif-sec-eyebrow">Traceability Audit</span>
                <h3 className="verif-sec-title">Review before verifying</h3>
              </div>
              <span className="verif-count-tag">5 Verified Records</span>
            </div>

            <div className="verif-evidence-cards">
              {/* STAGE 1: SOURCE (§ 9) */}
              <div className="verif-ev-card">
                <div className="verif-ev-icon">
                  <Award size={18} color="var(--color-deep-honey)" />
                </div>
                <div className="verif-ev-main">
                  <div className="verif-ev-topline">
                    <span className="verif-ev-label">Source colony</span>
                    <span className="verif-ev-badge green">Verified Hive</span>
                  </div>
                  <strong className="verif-ev-title">Hive 01 (Cedar Queen)</strong>
                  <p className="verif-ev-sub">
                    Meadowbrook Apiary North · Last inspection: Today, 08:00 AM (Healthy)
                  </p>
                </div>
                <button
                  type="button"
                  className="verif-ev-btn"
                  onClick={() => {
                    setSelectedHiveId('hive-01');
                    setActiveTab('hives');
                    handleClose();
                  }}
                  title="View hive details"
                >
                  <ExternalLink size={14} />
                </button>
              </div>

              {/* STAGE 2: COLLECTION (§ 10) */}
              <div className="verif-ev-card">
                <div className="verif-ev-icon">
                  <Clock size={18} color="var(--color-deep-cocoa)" />
                </div>
                <div className="verif-ev-main">
                  <div className="verif-ev-topline">
                    <span className="verif-ev-label">Harvest collection</span>
                    <span className="verif-ev-badge green">18.5 kg Comb</span>
                  </div>
                  <strong className="verif-ev-title">25 Sep 2026 · 08:35 AM</strong>
                  <p className="verif-ev-sub">
                    Recorded by Sarah Lindqvist · 3 supers harvested unheated at 24.5°C
                  </p>
                </div>
                <button
                  type="button"
                  className="verif-ev-btn"
                  onClick={() => {
                    openCollectionDetails({ collectionId: currentBatch.collectionId || 'col-2026-0925-01' });
                    handleClose();
                  }}
                  title="View collection record"
                >
                  <ExternalLink size={14} />
                </button>
              </div>

              {/* STAGE 3: PROCESSING (§ 11) */}
              <div className="verif-ev-card">
                <div className="verif-ev-icon">
                  <Sliders size={18} color="var(--color-deep-cocoa)" />
                </div>
                <div className="verif-ev-main">
                  <div className="verif-ev-topline">
                    <span className="verif-ev-label">Cold processing</span>
                    <span className="verif-ev-badge green">17.9 kg Settled</span>
                  </div>
                  <strong className="verif-ev-title">Settling Tank #2 (Extraction Complete)</strong>
                  <p className="verif-ev-sub">
                    Unheated centrifugal extraction ≤ 36°C · Dual 300 µm stainless filtration
                  </p>
                </div>
                <button
                  type="button"
                  className="verif-ev-btn"
                  onClick={() => {
                    openBatchJourney({ batchId: currentBatch.id });
                    handleClose();
                  }}
                  title="View processing in Honey Journey"
                >
                  <ExternalLink size={14} />
                </button>
              </div>

              {/* STAGE 4: QUALITY (§ 12) */}
              <div className="verif-ev-card">
                <div className="verif-ev-icon">
                  <FlaskConical size={18} color="var(--color-healthy)" />
                </div>
                <div className="verif-ev-main">
                  <div className="verif-ev-topline">
                    <span className="verif-ev-label">Laboratory quality</span>
                    <span className="verif-ev-badge green">Passed Standard</span>
                  </div>
                  <strong className="verif-ev-title">All Required Tests Completed</strong>
                  <p className="verif-ev-sub">
                    Moisture: <strong>17.8%</strong> (Max 18.5%) · HMF: <strong>12.4 mg/kg</strong> · Purity: Passed
                  </p>
                </div>
                <button
                  type="button"
                  className="verif-ev-btn"
                  onClick={() => {
                    openQualityCheck({ batchId: currentBatch.id });
                    handleClose();
                  }}
                  title="View quality review"
                >
                  <ExternalLink size={14} />
                </button>
              </div>

              {/* STAGE 5: PACKAGING (§ 13) */}
              <div className="verif-ev-card">
                <div className="verif-ev-icon">
                  <Package size={18} color="var(--color-deep-cocoa)" />
                </div>
                <div className="verif-ev-main">
                  <div className="verif-ev-topline">
                    <span className="verif-ev-label">Packaging allocation</span>
                    <span className="verif-ev-badge green">Lot HC-2409-P01</span>
                  </div>
                  <strong className="verif-ev-title">37 Jars · 500g Glass Hexagonal</strong>
                  <p className="verif-ev-sub">
                    Tamper-evident seals assigned · Ready for retail distribution
                  </p>
                </div>
                <button
                  type="button"
                  className="verif-ev-btn"
                  onClick={() => setIsConsumerQROpen(true)}
                  title="View packaging QR"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </section>

          {/* =========================================================================
              AUDIT TIMELINE / VERIFICATION HISTORY (§ 33 & 34)
              ========================================================================= */}
          <section className="verif-section">
            <div className="verif-section-header">
              <div>
                <span className="verif-sec-eyebrow">Human-Readable Audit Trail</span>
                <h3 className="verif-sec-title">Verification history</h3>
              </div>
            </div>

            <div className="verif-timeline-card">
              {isVerified && (
                <div className="verif-time-entry active">
                  <div className="verif-dot-col">
                    <div className="verif-time-dot green" />
                    <div className="verif-time-line" />
                  </div>
                  <div className="verif-time-content">
                    <div className="verif-time-meta">
                      <span className="verif-time-stamp">Today · 13:45 UTC</span>
                      <span className="verif-time-tag">Ledger Sealed</span>
                    </div>
                    <strong className="verif-time-title">Batch verified</strong>
                    <p className="verif-time-actor">
                      Verified by <strong>Elena Vance (Lead Quality Inspector)</strong>. Cryptographic
                      origin proof anchored to block #54819240.
                    </p>
                  </div>
                </div>
              )}

              <div className="verif-time-entry">
                <div className="verif-dot-col">
                  <div className="verif-time-dot done" />
                  <div className="verif-time-line" />
                </div>
                <div className="verif-time-content">
                  <div className="verif-time-meta">
                    <span className="verif-time-stamp">25 Sep 2026 · 12:15 PM</span>
                    <span className="verif-time-tag">Quality Passed</span>
                  </div>
                  <strong className="verif-time-title">Quality review completed</strong>
                  <p className="verif-time-actor">
                    Tested by BioAgro Analysis Lab. All 4 physicochemical tests satisfied raw honey criteria.
                  </p>
                </div>
              </div>

              <div className="verif-time-entry">
                <div className="verif-dot-col">
                  <div className="verif-time-dot done" />
                  <div className="verif-time-line" />
                </div>
                <div className="verif-time-content">
                  <div className="verif-time-meta">
                    <span className="verif-time-stamp">25 Sep 2026 · 10:20 AM</span>
                    <span className="verif-time-tag">Processing</span>
                  </div>
                  <strong className="verif-time-title">Processing completed</strong>
                  <p className="verif-time-actor">
                    Recorded by Marcus K. Net settled yield of 17.9 kg transferred to packaging line.
                  </p>
                </div>
              </div>

              <div className="verif-time-entry">
                <div className="verif-dot-col">
                  <div className="verif-time-dot done" />
                </div>
                <div className="verif-time-content">
                  <div className="verif-time-meta">
                    <span className="verif-time-stamp">25 Sep 2026 · 08:35 AM</span>
                    <span className="verif-time-tag">Harvest</span>
                  </div>
                  <strong className="verif-time-title">Honey collected</strong>
                  <p className="verif-time-actor">
                    Recorded by Sarah Lindqvist. 18.5 kg raw comb uncapped from Hive 01 (Cedar Queen).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              PROGRESSIVE DISCLOSURE: TECHNICAL BLOCKCHAIN PROOF (§ 28–32)
              ========================================================================= */}
          <section className="verif-tech-section">
            <button
              type="button"
              className="verif-tech-toggle-btn"
              onClick={() => setIsTechProofOpen(!isTechProofOpen)}
            >
              <div className="verif-tech-btn-left">
                <ShieldCheck size={16} color="var(--color-primary-honey)" />
                <span>
                  {isTechProofOpen ? 'Hide cryptographic proof' : 'View cryptographic technical proof'}
                </span>
              </div>
              <ChevronDown
                size={16}
                style={{
                  transform: isTechProofOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {isTechProofOpen && (
              <div className="verif-tech-panel">
                <div className="verif-tech-header-callout">
                  <p>
                    This technical layer cryptographically anchors physical evidence from the source hive,
                    harvest scale, laboratory test results, and retail package lot IDs.
                  </p>
                </div>

                <div className="verif-tech-grid">
                  <div className="verif-tech-cell">
                    <span className="verif-tlabel">PROOF STATUS</span>
                    <span className="verif-tval green">
                      {isVerified ? 'Confirmed & Anchored' : 'Draft / Ready for Notarization'}
                    </span>
                  </div>

                  <div className="verif-tech-cell">
                    <span className="verif-tlabel">LEDGER NETWORK</span>
                    <span className="verif-tval">HoneyChain Consortium Ledger (Proof of Origin)</span>
                  </div>

                  <div className="verif-tech-cell">
                    <span className="verif-tlabel">BLOCK NUMBER</span>
                    <span className="verif-tval mono">
                      {isVerified ? '#54819240' : 'Pending Verification'}
                    </span>
                  </div>

                  <div className="verif-tech-cell">
                    <span className="verif-tlabel">TIMESTAMP</span>
                    <span className="verif-tval">
                      {isVerified ? '2026-09-25 13:45:10 UTC' : 'Not yet notarized'}
                    </span>
                  </div>

                  <div className="verif-tech-cell full-width">
                    <div className="verif-tlabel-line">
                      <span className="verif-tlabel">TRANSACTION HASH</span>
                      <button
                        type="button"
                        className="verif-copy-mini-btn"
                        onClick={() =>
                          handleCopy(
                            currentBatch.blockchain?.txHash || '0xd942b87f619e083a21dc49019b841e2a537f'
                          )
                        }
                      >
                        {copiedHash ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <span className="verif-tval mono break-all">
                      {currentBatch.blockchain?.txHash || '0xd942b87f619e083a21dc49019b841e2a537f'}
                    </span>
                  </div>

                  <div className="verif-tech-cell full-width">
                    <span className="verif-tlabel">MERKLE ROOT</span>
                    <span className="verif-tval mono break-all">
                      {currentBatch.blockchain?.merkleRoot ||
                        '0x3f9801a4e5bc1209e86d23fb482b9a710255'}
                    </span>
                  </div>

                  <div className="verif-tech-cell full-width">
                    <span className="verif-tlabel">TAMPER-EVIDENT SEAL HASH</span>
                    <span className="verif-tval mono break-all">
                      {currentBatch.sealHash || '0x8b3f912c4189e49120bc98319fca448912e'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      height: '38px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderColor: 'var(--color-primary-honey)',
                      color: 'var(--color-deep-cocoa)'
                    }}
                    onClick={() => {
                      openTechnicalProof({
                        batchId: currentBatch.id,
                        scenario: isVerified ? 'confirmed' : 'not_created'
                      });
                    }}
                  >
                    <ShieldCheck size={14} color="var(--color-primary-honey)" />
                    <span>View technical proof screen</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* =========================================================================
            BOTTOM ACTION BAR (§ 15, 24)
            ========================================================================= */}
        <footer className="verif-footer">
          {isVerified ? (
            <div className="verif-footer-row">
              <button
                type="button"
                className="btn btn-secondary verif-fbtn"
                onClick={() => {
                  setSelectedHiveId('hive-01');
                  setActiveTab('hives');
                  handleClose();
                }}
              >
                View source hive
              </button>
              <button
                type="button"
                className="btn btn-primary verif-fbtn verif-fbtn-hero"
                onClick={() => {
                  openBatchJourney({ batchId: currentBatch.id });
                  handleClose();
                }}
              >
                <span>Follow honey journey</span>
                <ChevronRight size={15} />
              </button>
            </div>
          ) : (
            <div className="verif-footer-row">
              <button
                type="button"
                className="btn btn-secondary verif-fbtn"
                onClick={() => {
                  openBatchJourney({ batchId: currentBatch.id });
                  handleClose();
                }}
              >
                Review journey
              </button>

              <button
                type="button"
                className="btn btn-primary verif-fbtn verif-fbtn-verify"
                disabled={!allPrereqsPassed || isVerifying}
                onClick={() => setIsConfirmModalOpen(true)}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    <span>Securing record…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Verify batch</span>
                  </>
                )}
              </button>
            </div>
          )}
        </footer>

        {/* =========================================================================
            CONFIRMATION BEFORE VERIFYING SHEET (§ 16 & 17)
            ========================================================================= */}
        {isConfirmModalOpen && (
          <div className="verif-modal-overlay" onClick={() => setIsConfirmModalOpen(false)}>
            <div className="verif-confirm-card" onClick={(e) => e.stopPropagation()}>
              <div className="verif-confirm-header">
                <div className="verif-confirm-icon">
                  <ShieldCheck size={28} color="var(--color-primary-honey)" />
                </div>
                <h3>Verify this batch?</h3>
                <p>
                  You're about to mark <strong>{currentBatch.batchNumber}</strong> as verified based on
                  the completed workflow records.
                </p>
              </div>

              {/* IMPORTANT CLAIM LIMITATION BOX (§ 17) */}
              <div className="verif-claim-notice">
                <div className="verif-notice-title">
                  <HelpCircle size={14} color="#B87316" />
                  <strong>What verification means</strong>
                </div>
                <p>
                  Verification confirms that the configured HoneyChain workflow has been completed and
                  the required harvest, processing, lab, and packaging records are present. It does not
                  fabricate universal claims beyond verified evidence.
                </p>
              </div>

              <div className="verif-confirm-actions">
                <button
                  type="button"
                  className="btn btn-primary verif-cbtn"
                  onClick={handleConfirmVerification}
                >
                  <ShieldCheck size={15} />
                  <span>Confirm & verify batch</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary verif-cbtn"
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  Review again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            CONSUMER VERIFICATION EXPERIENCE MODAL (§ 26 & 27)
            ========================================================================= */}
        {isConsumerQROpen && (
          <div className="verif-modal-overlay" onClick={() => setIsConsumerQROpen(false)}>
            <div className="verif-qr-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="verif-modal-top">
                <div className="verif-modal-title-group">
                  <span className="verif-modal-eyebrow">Consumer Experience (§ 26–27)</span>
                  <h4>Product Verification</h4>
                </div>
                <button
                  type="button"
                  className="verif-modal-close-btn"
                  onClick={() => setIsConsumerQROpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <p className="verif-qr-explainer">
                This is the public verification page consumers see when scanning the QR seal affixed to
                each jar of <strong>Lot HC-2409-P01</strong>. Internal user names, private hive
                coordinates, and raw telemetry are safely omitted.
              </p>

              {/* CONSUMER SEAL CARD */}
              <div className="verif-consumer-preview-box">
                <div className="verif-qr-svg-wrap">
                  <svg viewBox="0 0 100 100" className="verif-qr-svg">
                    <rect width="100" height="100" fill="#FFFDF8" rx="8" />
                    <rect x="10" y="10" width="26" height="26" rx="4" fill="#34261B" />
                    <rect x="14" y="14" width="18" height="18" fill="#FFFDF8" rx="2" />
                    <rect x="18" y="18" width="10" height="10" fill="#34261B" />

                    <rect x="64" y="10" width="26" height="26" rx="4" fill="#34261B" />
                    <rect x="68" y="14" width="18" height="18" fill="#FFFDF8" rx="2" />
                    <rect x="72" y="18" width="10" height="10" fill="#34261B" />

                    <rect x="10" y="64" width="26" height="26" rx="4" fill="#34261B" />
                    <rect x="14" y="68" width="18" height="18" fill="#FFFDF8" rx="2" />
                    <rect x="18" y="72" width="10" height="10" fill="#34261B" />

                    <rect x="42" y="14" width="6" height="6" fill="#34261B" />
                    <rect x="52" y="14" width="6" height="6" fill="#34261B" />
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

                <div className="verif-consumer-meta">
                  <span className="verif-cbadge">HoneyChain Authenticity Seal</span>
                  <h5>Raw Clover & Wildflower Honey</h5>
                  <p className="verif-csub">
                    Meadowbrook Apiary · Cold Extracted · Batch HC-2409
                  </p>
                  <div className="verif-cstats">
                    <span>Moisture: 17.8% (Raw Standard)</span>
                    <span>Purity: Tested Pure & Certified</span>
                  </div>
                </div>
              </div>

              <div className="verif-modal-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    try {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText('https://verify.honeychain.org/b/HC-2409');
                      }
                    } catch (e) {}
                    showToast('Public consumer URL copied');
                    setIsConsumerQROpen(false);
                  }}
                >
                  Copy Consumer Verification Link
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={() => {
                    setIsConsumerQROpen(false);
                    if (window.__openProductQrManagement) {
                      window.__openProductQrManagement({ batchId: currentBatch.id });
                    }
                  }}
                >
                  Manage Product QR Identity →
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={() => {
                    setIsConsumerQROpen(false);
                    if (window.__openPublicVerification) {
                      window.__openPublicVerification('HC-2409');
                    }
                  }}
                >
                  Open public verification view
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            AUTHENTICITY CERTIFICATE MODAL (§ 31)
            ========================================================================= */}
        {isCertModalOpen && (
          <div className="verif-modal-overlay" onClick={() => setIsCertModalOpen(false)}>
            <div className="verif-cert-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="verif-modal-top">
                <div className="verif-modal-title-group">
                  <span className="verif-modal-eyebrow">Official Provenance Record (§ 31)</span>
                  <h4>Certificate of Authenticity</h4>
                </div>
                <button
                  type="button"
                  className="verif-modal-close-btn"
                  onClick={() => setIsCertModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="verif-certificate-body">
                <div className="verif-cert-stamp">
                  <Award size={36} color="var(--color-deep-honey)" />
                  <div>
                    <span className="cert-status-tag">Cryptographically Sealed</span>
                    <span className="cert-id-tag">CERT-HC-2026-0925-V1</span>
                  </div>
                </div>

                <div className="verif-cert-details">
                  <h3>September Harvest Raw Comb Honey</h3>
                  <p className="cert-origin">
                    Origin: <strong>Meadowbrook Apiary</strong>, Apiary North · Hive 01 (Cedar Queen)
                  </p>

                  <div className="cert-data-grid">
                    <div className="cert-data-cell">
                      <span className="cd-label">FLORAL COMPOSITION</span>
                      <span className="cd-val">72% Wildflower, 20% Blackberry, 8% Clover</span>
                    </div>
                    <div className="cert-data-cell">
                      <span className="cd-label">LAB PURITY RESULT</span>
                      <span className="cd-val green">17.8% Moisture (Passed ISO)</span>
                    </div>
                    <div className="cert-data-cell">
                      <span className="cd-label">COLD EXTRACTION</span>
                      <span className="cd-val">Unheated ≤ 36°C · 300 µm filtered</span>
                    </div>
                    <div className="cert-data-cell">
                      <span className="cd-label">RETAIL LOT</span>
                      <span className="cd-val mono">Lot HC-2409-P01 (37 Jars)</span>
                    </div>
                  </div>

                  <div className="cert-footer-meta">
                    <span>Verified by: Elena Vance (Lead Quality Inspector)</span>
                    <span>Date: 25 Sep 2026 · HoneyChain Ledger Notarized</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '12px' }}
                onClick={() => setIsCertModalOpen(false)}
              >
                Close Certificate
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            JURY DEMONSTRATION DRAWER (§ 54 & 55)
            ========================================================================= */}
        {isJuryDrawerOpen && (
          <div className="verif-drawer-overlay" onClick={() => setIsJuryDrawerOpen(false)}>
            <div className="verif-drawer-content" onClick={(e) => e.stopPropagation()}>
              <div className="verif-drawer-header">
                <div className="verif-drawer-title-group">
                  <span className="verif-drawer-eyebrow">Jury Evaluation (§ 54–55)</span>
                  <h4>Demonstration Scenarios</h4>
                </div>
                <button
                  type="button"
                  className="verif-modal-close-btn"
                  onClick={() => setIsJuryDrawerOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <p className="verif-drawer-desc">
                Select a scenario to demonstrate how HoneyChain enforces evidence-backed verification:
              </p>

              <div className="verif-drawer-presets">
                <button
                  type="button"
                  className={`verif-preset-card ${scenario === 'ready' && !isVerified ? 'active' : ''}`}
                  onClick={() => applyScenario('ready')}
                >
                  <div className="verif-preset-icon green">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="verif-preset-text">
                    <strong>1. Ready for Verification (All 5 Passed)</strong>
                    <p>
                      All physical evidence (Hive, Harvest, Process, Quality, Packaging) is confirmed.
                      Allows the jury to click "Verify batch" and witness the verification dialog.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className={`verif-preset-card ${scenario === 'not_ready' ? 'active' : ''}`}
                  onClick={() => applyScenario('not_ready')}
                >
                  <div className="verif-preset-icon orange">
                    <Clock size={16} />
                  </div>
                  <div className="verif-preset-text">
                    <strong>2. Incomplete (Packaging Missing)</strong>
                    <p>
                      Demonstrates that HoneyChain never marks a batch verified prematurely. Shows
                      missing packaging requirement and remediation CTA.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className={`verif-preset-card ${scenario === 'needs_attention' ? 'active' : ''}`}
                  onClick={() => applyScenario('needs_attention')}
                >
                  <div className="verif-preset-icon red">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="verif-preset-text">
                    <strong>3. Needs Attention (Moisture Flagged)</strong>
                    <p>
                      Simulates a quality test variance requiring re-testing before verification can
                      proceed.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className={`verif-preset-card ${isVerified ? 'active' : ''}`}
                  onClick={() => applyScenario('verified')}
                >
                  <div className="verif-preset-icon blue">
                    <Award size={16} />
                  </div>
                  <div className="verif-preset-text">
                    <strong>4. Batch Verified & Sealed</strong>
                    <p>
                      Demonstrates the calm verified hero, official authenticity certificate, and
                      consumer-facing QR transparency view.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCOPED STYLES
            ========================================================================= */}
        <style>{`
          .verif-screen-overlay {
            position: fixed;
            inset: 0;
            z-index: 1050;
            background-color: var(--color-warm-cream);
            display: flex;
            justify-content: center;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          .verif-screen-container {
            width: 100%;
            max-width: 480px;
            min-height: 100vh;
            background-color: var(--color-warm-cream);
            display: flex;
            flex-direction: column;
            position: relative;
            box-shadow: 0 0 30px rgba(52, 38, 27, 0.08);
          }

          /* Header */
          .verif-header {
            position: sticky;
            top: 0;
            z-index: 20;
            background: rgba(255, 249, 239, 0.96);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--color-divider);
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .verif-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .verif-back-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 1px solid var(--color-divider);
            background: var(--color-soft-ivory);
            color: var(--color-deep-cocoa);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .verif-back-btn:hover {
            background: #F5EADB;
          }

          .verif-header-eyebrow {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--color-deep-honey);
            font-weight: 700;
            display: block;
          }

          .verif-header-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            margin: 0;
            line-height: 1.2;
          }

          .verif-header-sub {
            font-size: 12px;
            color: var(--color-warm-gray);
            margin: 2px 0 0;
          }

          .verif-demo-pill {
            display: flex;
            align-items: center;
            gap: 5px;
            background: var(--color-soft-ivory);
            border: 1px solid var(--color-primary-honey);
            color: var(--color-deep-honey);
            padding: 6px 10px;
            border-radius: var(--radius-badge);
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: var(--shadow-sm);
          }

          /* Body */
          .verif-body {
            flex: 1;
            padding: 16px 16px 100px;
            display: flex;
            flex-direction: column;
            gap: 18px;
          }

          /* VERIFIED HERO CARD */
          .verif-verified-hero-card {
            background: var(--color-soft-ivory);
            border: 1.5px solid #C4D9C0;
            border-radius: var(--radius-card);
            padding: 20px 16px;
            text-align: center;
            box-shadow: var(--shadow-card);
          }

          .verif-hero-badge-wrap {
            display: flex;
            justify-content: center;
            margin-bottom: 12px;
          }

          .verif-hero-icon-circle {
            width: 58px;
            height: 58px;
            border-radius: 50%;
            background: rgba(79, 122, 82, 0.12);
            border: 1.5px solid #4F7A52;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .verif-hero-eyebrow {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #4F7A52;
            font-weight: 700;
            display: block;
            margin-bottom: 3px;
          }

          .verif-hero-title {
            font-size: 22px;
            font-weight: 800;
            color: var(--color-deep-cocoa);
            margin: 0 0 4px;
          }

          .verif-hero-batch {
            font-size: 14px;
            color: var(--color-deep-cocoa);
            margin: 0 0 8px;
          }

          .verif-hero-desc {
            font-size: 13px;
            line-height: 1.45;
            color: var(--color-warm-gray);
            margin: 0 auto 16px;
            max-width: 380px;
          }

          /* 6-Stage Completed Stepper */
          .verif-hero-stages-strip {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            background: #F9F5EC;
            border-radius: 10px;
            padding: 10px 8px;
            margin-bottom: 18px;
          }

          .verif-stage-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            font-size: 10px;
            font-weight: 600;
            color: var(--color-deep-cocoa);
          }

          .step-check {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #4F7A52;
            color: #fff;
            padding: 2px;
          }

          .step-line {
            width: 14px;
            height: 2px;
            background: #4F7A52;
            margin-bottom: 12px;
          }

          .verif-hero-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .verif-cta-btn {
            height: 46px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-weight: 700;
            font-size: 14px;
          }

          .verif-hero-sub-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .verif-sub-btn {
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 600;
          }

          /* READINESS SECTION */
          .verif-readiness-card {
            background: var(--color-soft-ivory);
            border: 1px solid var(--color-divider);
            border-radius: var(--radius-card);
            padding: 16px;
            box-shadow: var(--shadow-sm);
          }

          .verif-readiness-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 8px;
          }

          .verif-sec-eyebrow {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-deep-honey);
            font-weight: 700;
            display: block;
          }

          .verif-sec-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            margin: 2px 0 0;
          }

          .verif-status-pill {
            font-size: 11px;
            font-weight: 700;
            padding: 4px 9px;
            border-radius: var(--radius-badge);
          }

          .verif-status-pill.ready {
            background: rgba(79, 122, 82, 0.12);
            color: #4F7A52;
            border: 1px solid #4F7A52;
          }

          .verif-status-pill.attention {
            background: rgba(217, 130, 43, 0.12);
            color: #D9822B;
            border: 1px solid #D9822B;
          }

          .verif-status-pill.pending {
            background: rgba(120, 109, 97, 0.1);
            color: var(--color-warm-gray);
            border: 1px solid var(--color-divider);
          }

          .verif-readiness-desc {
            font-size: 12px;
            color: var(--color-warm-gray);
            line-height: 1.45;
            margin: 0 0 14px;
          }

          /* Blockers Callout */
          .verif-blocker-callout {
            display: flex;
            gap: 10px;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 14px;
          }

          .verif-blocker-callout.info {
            background: #FDF4E7;
            border: 1px solid #E8D5B8;
          }

          .verif-blocker-callout.attention {
            background: #FDF0E6;
            border: 1px solid #F0C4A4;
          }

          .verif-blocker-content strong {
            display: block;
            font-size: 13px;
            color: var(--color-deep-cocoa);
            margin-bottom: 2px;
          }

          .verif-blocker-content p {
            font-size: 12px;
            color: var(--color-warm-gray);
            line-height: 1.35;
            margin: 0 0 8px;
          }

          .verif-blocker-cta {
            background: none;
            border: none;
            color: var(--color-deep-honey);
            font-size: 12px;
            font-weight: 700;
            padding: 0;
            cursor: pointer;
          }

          /* Checklist Rows */
          .verif-checklist {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .verif-check-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: 8px;
            background: #FAF5EB;
            border: 1px solid var(--color-divider);
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .verif-check-row:hover {
            border-color: var(--color-primary-honey);
            background: #F5EEE0;
          }

          .verif-pending-dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px dashed #786D61;
          }

          .verif-check-info {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .verif-check-title {
            font-size: 13px;
            font-weight: 600;
            color: var(--color-deep-cocoa);
          }

          .verif-check-sub {
            font-size: 11px;
            color: var(--color-warm-gray);
            margin-top: 1px;
          }

          /* EVIDENCE SUMMARY SECTION */
          .verif-section {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .verif-section-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
          }

          .verif-count-tag {
            font-size: 11px;
            font-weight: 700;
            color: var(--color-warm-gray);
            background: rgba(120, 109, 97, 0.1);
            padding: 2px 7px;
            border-radius: 6px;
          }

          .verif-evidence-cards {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .verif-ev-card {
            background: var(--color-soft-ivory);
            border: 1px solid var(--color-divider);
            border-radius: var(--radius-card);
            padding: 12px 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: var(--shadow-sm);
          }

          .verif-ev-icon {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: #F5EADB;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .verif-ev-main {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .verif-ev-topline {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2px;
          }

          .verif-ev-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-warm-gray);
            font-weight: 700;
          }

          .verif-ev-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
          }

          .verif-ev-badge.green {
            background: rgba(79, 122, 82, 0.1);
            color: #4F7A52;
          }

          .verif-ev-title {
            font-size: 13px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
          }

          .verif-ev-sub {
            font-size: 11px;
            color: var(--color-warm-gray);
            margin: 2px 0 0;
            line-height: 1.35;
          }

          .verif-ev-btn {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: #F9F5EC;
            border: 1px solid var(--color-divider);
            color: var(--color-deep-cocoa);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .verif-ev-btn:hover {
            background: var(--color-primary-honey);
            color: #fff;
          }

          /* AUDIT TIMELINE */
          .verif-timeline-card {
            background: var(--color-soft-ivory);
            border: 1px solid var(--color-divider);
            border-radius: var(--radius-card);
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .verif-time-entry {
            display: flex;
            gap: 12px;
          }

          .verif-dot-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 16px;
          }

          .verif-time-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #786D61;
          }

          .verif-time-dot.done {
            background: var(--color-primary-honey);
          }

          .verif-time-dot.green {
            background: #4F7A52;
            box-shadow: 0 0 0 3px rgba(79, 122, 82, 0.2);
          }

          .verif-time-line {
            width: 2px;
            flex: 1;
            background: var(--color-divider);
            margin-top: 4px;
            min-height: 24px;
          }

          .verif-time-content {
            flex: 1;
          }

          .verif-time-meta {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 2px;
          }

          .verif-time-stamp {
            font-size: 11px;
            color: var(--color-warm-gray);
          }

          .verif-time-tag {
            font-size: 9px;
            text-transform: uppercase;
            font-weight: 700;
            background: #F0E6D5;
            color: var(--color-deep-cocoa);
            padding: 1px 5px;
            border-radius: 4px;
          }

          .verif-time-title {
            font-size: 13px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            display: block;
          }

          .verif-time-actor {
            font-size: 11px;
            color: var(--color-warm-gray);
            margin: 2px 0 0;
            line-height: 1.35;
          }

          /* TECHNICAL PROOF PROGRESSIVE DISCLOSURE */
          .verif-tech-section {
            margin-top: 4px;
          }

          .verif-tech-toggle-btn {
            width: 100%;
            background: var(--color-soft-ivory);
            border: 1px dashed var(--color-card-border);
            border-radius: var(--radius-card);
            padding: 12px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: var(--color-deep-cocoa);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .verif-tech-toggle-btn:hover {
            border-color: var(--color-primary-honey);
            background: #F9F5EC;
          }

          .verif-tech-btn-left {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .verif-tech-panel {
            background: var(--color-soft-ivory);
            border: 1px solid var(--color-divider);
            border-top: none;
            border-radius: 0 0 var(--radius-card) var(--radius-card);
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .verif-tech-header-callout p {
            font-size: 12px;
            color: var(--color-warm-gray);
            line-height: 1.4;
            margin: 0;
          }

          .verif-tech-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .verif-tech-cell {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .verif-tech-cell.full-width {
            grid-column: 1 / -1;
          }

          .verif-tlabel {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-warm-gray);
            font-weight: 700;
          }

          .verif-tlabel-line {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .verif-copy-mini-btn {
            background: none;
            border: none;
            color: var(--color-deep-honey);
            font-size: 11px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 3px;
            cursor: pointer;
            padding: 0;
          }

          .verif-tval {
            font-size: 12px;
            font-weight: 600;
            color: var(--color-deep-cocoa);
          }

          .verif-tval.green {
            color: #4F7A52;
          }

          .mono {
            font-family: 'SF Mono', Consolas, Monaco, monospace;
          }

          .break-all {
            word-break: break-all;
          }

          /* STICKY FOOTER */
          .verif-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 30;
            background: rgba(255, 249, 239, 0.96);
            backdrop-filter: blur(10px);
            border-top: 1px solid var(--color-divider);
            padding: 12px 16px max(12px, var(--safe-bottom));
            display: flex;
            justify-content: center;
          }

          .verif-footer-row {
            width: 100%;
            max-width: 480px;
            display: flex;
            gap: 10px;
          }

          .verif-fbtn {
            height: 46px;
            font-size: 14px;
            font-weight: 600;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }

          .verif-fbtn-verify {
            flex: 1.5;
            background-color: var(--color-primary-honey);
            color: #fff;
          }

          .verif-fbtn-hero {
            flex: 1.6;
          }

          /* MODALS & OVERLAYS */
          .verif-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 1100;
            background: rgba(52, 38, 27, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
          }

          .verif-confirm-card,
          .verif-qr-modal-card,
          .verif-cert-modal-card {
            width: 100%;
            max-width: 400px;
            background: var(--color-soft-ivory);
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            animation: verifFadeUp 0.2s ease-out;
          }

          @keyframes verifFadeUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .verif-confirm-header {
            text-align: center;
            margin-bottom: 14px;
          }

          .verif-confirm-icon {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: rgba(217, 154, 36, 0.12);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
          }

          .verif-confirm-header h3 {
            font-size: 18px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            margin: 0 0 6px;
          }

          .verif-confirm-header p {
            font-size: 13px;
            color: var(--color-warm-gray);
            margin: 0;
            line-height: 1.4;
          }

          .verif-claim-notice {
            background: #FDF7EB;
            border: 1px solid #EADBBE;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 18px;
          }

          .verif-notice-title {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--color-deep-cocoa);
            margin-bottom: 4px;
          }

          .verif-claim-notice p {
            font-size: 11px;
            color: var(--color-warm-gray);
            line-height: 1.4;
            margin: 0;
          }

          .verif-confirm-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .verif-cbtn {
            height: 44px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-weight: 600;
            font-size: 14px;
          }

          /* QR & CERTIFICATE MODAL DETAILS */
          .verif-modal-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 12px;
          }

          .verif-modal-eyebrow {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-deep-honey);
            font-weight: 700;
            display: block;
          }

          .verif-modal-title-group h4 {
            font-size: 16px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            margin: 2px 0 0;
          }

          .verif-modal-close-btn {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #F5EADB;
            border: none;
            color: var(--color-deep-cocoa);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .verif-qr-explainer {
            font-size: 12px;
            color: var(--color-warm-gray);
            line-height: 1.4;
            margin: 0 0 14px;
          }

          .verif-consumer-preview-box {
            display: flex;
            gap: 14px;
            background: #FAF4E9;
            border: 1px solid #E2D3BE;
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 16px;
          }

          .verif-qr-svg-wrap {
            width: 80px;
            height: 80px;
            background: #FFFDF8;
            border-radius: 8px;
            padding: 4px;
            border: 1px solid var(--color-divider);
            flex-shrink: 0;
          }

          .verif-qr-svg {
            width: 100%;
            height: 100%;
          }

          .verif-consumer-meta {
            flex: 1;
          }

          .verif-cbadge {
            font-size: 9px;
            text-transform: uppercase;
            font-weight: 700;
            background: rgba(79, 122, 82, 0.12);
            color: #4F7A52;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 3px;
          }

          .verif-consumer-meta h5 {
            font-size: 13px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            margin: 0 0 2px;
          }

          .verif-csub {
            font-size: 11px;
            color: var(--color-warm-gray);
            margin: 0 0 6px;
          }

          .verif-cstats {
            display: flex;
            flex-direction: column;
            gap: 2px;
            font-size: 11px;
            font-weight: 600;
            color: var(--color-deep-cocoa);
          }

          /* CERTIFICATE BODY */
          .verif-certificate-body {
            background: #FAF4E9;
            border: 1.5px solid #DECDB8;
            border-radius: 12px;
            padding: 14px;
          }

          .verif-cert-stamp {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          }

          .cert-status-tag {
            font-size: 10px;
            font-weight: 700;
            color: #4F7A52;
            background: rgba(79, 122, 82, 0.12);
            padding: 2px 6px;
            border-radius: 4px;
            display: block;
            text-align: right;
          }

          .cert-id-tag {
            font-size: 10px;
            font-family: monospace;
            color: var(--color-warm-gray);
            display: block;
            margin-top: 2px;
            text-align: right;
          }

          .verif-cert-details h3 {
            font-size: 15px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            margin: 0 0 2px;
          }

          .cert-origin {
            font-size: 11px;
            color: var(--color-warm-gray);
            margin: 0 0 10px;
          }

          .cert-data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            border-top: 1px solid var(--color-divider);
            padding-top: 8px;
            margin-bottom: 10px;
          }

          .cert-data-cell {
            display: flex;
            flex-direction: column;
          }

          .cd-label {
            font-size: 9px;
            text-transform: uppercase;
            font-weight: 700;
            color: var(--color-warm-gray);
          }

          .cd-val {
            font-size: 11px;
            font-weight: 600;
            color: var(--color-deep-cocoa);
          }

          .cd-val.green {
            color: #4F7A52;
          }

          .cert-footer-meta {
            border-top: 1px solid var(--color-divider);
            padding-top: 8px;
            display: flex;
            flex-direction: column;
            gap: 2px;
            font-size: 10px;
            color: var(--color-warm-gray);
          }

          /* JURY DRAWER (§ 54–55) */
          .verif-drawer-overlay {
            position: fixed;
            inset: 0;
            z-index: 1200;
            background: rgba(52, 38, 27, 0.5);
            display: flex;
            justify-content: flex-end;
          }

          .verif-drawer-content {
            width: 100%;
            max-width: 360px;
            background: var(--color-soft-ivory);
            height: 100%;
            padding: 20px 16px;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            animation: slideInDrawer 0.2s ease-out;
          }

          @keyframes slideInDrawer {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }

          .verif-drawer-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 10px;
          }

          .verif-drawer-eyebrow {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-deep-honey);
            font-weight: 700;
            display: block;
          }

          .verif-drawer-title-group h4 {
            font-size: 16px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            margin: 2px 0 0;
          }

          .verif-drawer-desc {
            font-size: 12px;
            color: var(--color-warm-gray);
            line-height: 1.4;
            margin: 0 0 14px;
          }

          .verif-drawer-presets {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .verif-preset-card {
            background: var(--color-warm-cream);
            border: 1px solid var(--color-divider);
            border-radius: 12px;
            padding: 12px;
            display: flex;
            gap: 10px;
            text-align: left;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .verif-preset-card:hover {
            border-color: var(--color-primary-honey);
            background: #FAF2E3;
          }

          .verif-preset-card.active {
            border-color: var(--color-primary-honey);
            background: #FDF3DF;
            box-shadow: 0 0 0 1.5px var(--color-primary-honey);
          }

          .verif-preset-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .verif-preset-icon.green {
            background: rgba(79, 122, 82, 0.12);
            color: #4F7A52;
          }

          .verif-preset-icon.orange {
            background: rgba(217, 130, 43, 0.12);
            color: #D9822B;
          }

          .verif-preset-icon.red {
            background: rgba(184, 84, 80, 0.12);
            color: #B85450;
          }

          .verif-preset-icon.blue {
            background: rgba(43, 114, 186, 0.12);
            color: #2B72BA;
          }

          .verif-preset-text strong {
            display: block;
            font-size: 12px;
            color: var(--color-deep-cocoa);
            margin-bottom: 2px;
          }

          .verif-preset-text p {
            font-size: 11px;
            color: var(--color-warm-gray);
            line-height: 1.35;
            margin: 0;
          }

          .spin {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default VerificationView;
