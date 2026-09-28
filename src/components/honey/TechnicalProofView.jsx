import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  HelpCircle,
  QrCode,
  Award,
  Layers,
  FileText,
  Lock,
  X,
  RotateCcw
} from 'lucide-react';

/**
 * SCREEN 27 — TECHNICAL PROOF
 * Technical Evidence Layer for HoneyChain Batches
 *
 * Core Mental Model:
 * "Can I see the technical proof associated with this verification record?"
 * Clearly separates Business Verification from Technical Proof.
 * Warm HoneyChain visual language, NOT a dark crypto dashboard.
 */
export const TechnicalProofView = ({
  isOpen,
  onClose,
  batch: propBatch,
  initialScenario = 'confirmed'
}) => {
  const {
    batches,
    activeTechnicalProof,
    closeTechnicalProof,
    openBatchJourney,
    openVerification,
    setSelectedHiveId,
    setActiveTab,
    showToast
  } = useAppState();

  // Active batch fallback resolution
  const targetBatchId = activeTechnicalProof?.batchId || propBatch?.id || 'batch-hc-2409';
  const currentBatch = batches.find((b) => b.id === targetBatchId) || propBatch || batches[0] || {
    id: 'batch-hc-2409',
    batchNumber: 'Batch HC-2409',
    name: 'September Harvest',
    sourceHives: ['Hive 01'],
    harvestDate: '2026-09-25',
    weightKg: 18.5,
    collectionId: 'col-2026-0925-01',
    status: 'certified',
    statusLabel: 'Tested & Certified',
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

  // Proof Scenarios:
  // 'confirmed' -> Verified + Proof Confirmed
  // 'pending'   -> Verified + Proof Pending (checking status)
  // 'submitted' -> Verified + Proof Submitted (in mempool)
  // 'failed'    -> Verified + Proof Failed (network timeout, retryable)
  // 'not_created' -> Verified + Proof Not Created (create proof action)
  // 'stale'     -> Verification Needs Review + Stale Proof
  const [scenario, setScenario] = useState(initialScenario);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isJuryDrawerOpen, setIsJuryDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFullHashModalOpen, setIsFullHashModalOpen] = useState(null); // { title, label, value }
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    const next = activeTechnicalProof?.scenario || initialScenario;
    if (next) {
      setScenario(next);
    }
  }, [activeTechnicalProof, initialScenario]);

  // Scenario apply
  const applyScenario = (newScenario) => {
    setScenario(newScenario);
    setIsJuryDrawerOpen(false);
    setIsRefreshing(false);
    setIsRetrying(false);
    setIsCreateModalOpen(false);
    setIsFullHashModalOpen(null);
    showToast(`Switched scenario to: ${getScenarioTitle(newScenario)}`);
  };

  useEffect(() => {
    window.__setTechnicalProofScenario = applyScenario;
  });

  const isViewOpen = isOpen || Boolean(activeTechnicalProof);
  if (!isViewOpen) return null;

  const handleClose = () => {
    if (closeTechnicalProof) closeTechnicalProof();
    if (onClose) onClose();
  };

  // Safe clipboard helper
  const handleCopy = (text, key) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
    } catch (e) {}
    setCopiedKey(key);
    showToast('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getScenarioTitle = (s) => {
    switch (s) {
      case 'confirmed':
        return 'Confirmed & Anchored (Default)';
      case 'pending':
        return 'Proof Pending (Asynchronous Confirmation)';
      case 'submitted':
        return 'Proof Submitted (Awaiting Inclusion)';
      case 'failed':
        return 'Proof Failed (Retry Supported)';
      case 'not_created':
        return 'Proof Not Created (Issuance Flow)';
      case 'stale':
        return 'Verification Needs Review (Stale Proof)';
      default:
        return s;
    }
  };

  // Refresh status simulator
  const handleRefreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setScenario('confirmed');
      showToast('Proof confirmed on HoneyChain Ledger block #54819240');
    }, 1200);
  };

  // Retry proof submission simulator
  const handleRetryProof = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      setScenario('confirmed');
      showToast('Technical proof re-submitted and successfully anchored');
    }, 1400);
  };

  // Create proof action
  const handleCreateProof = () => {
    setIsCreateModalOpen(false);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setScenario('confirmed');
      showToast('Technical proof created & anchored to block #54819240');
    }, 1500);
  };

  // Determine business and proof status combinations (§ 7 & 8)
  const businessStatus = scenario === 'stale' ? 'NEEDS_REVIEW' : 'VERIFIED';
  const proofStatus =
    scenario === 'confirmed'
      ? 'CONFIRMED'
      : scenario === 'pending'
      ? 'PENDING'
      : scenario === 'submitted'
      ? 'SUBMITTED'
      : scenario === 'failed'
      ? 'FAILED'
      : scenario === 'not_created'
      ? 'NOT_CREATED'
      : 'INVALIDATED';

  return (
    <div className="tech-screen-overlay" role="dialog" aria-modal="true">
      <div className="tech-screen-container">
        {/* =========================================================================
            HEADER (§ 3)
            ========================================================================= */}
        <header className="tech-header">
          <div className="tech-header-left">
            <button
              type="button"
              className="tech-back-btn"
              onClick={handleClose}
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="tech-header-titles">
              <span className="tech-header-eyebrow">Screen 27 · Technical Evidence</span>
              <h1 className="tech-header-title">Technical proof</h1>
              <p className="tech-header-sub">
                {currentBatch.name || 'September Harvest'} ·{' '}
                <strong className="mono">{currentBatch.batchNumber || 'HC-2409'}</strong> ·{' '}
                <span>Verified 25 Sep · 13:45 UTC</span>
              </p>
            </div>
          </div>

          <div className="tech-header-right">
            <button
              type="button"
              className="tech-demo-pill"
              onClick={() => setIsJuryDrawerOpen(true)}
              title="Open Jury Demonstration Scenarios"
            >
              <Sparkles size={13} />
              <span>Demo</span>
            </button>
          </div>
        </header>

        {/* =========================================================================
            BODY CONTENT
            ========================================================================= */}
        <div className="tech-body">
          {/* =========================================================================
              PROOF STATUS HERO CARD (§ 6 & 8)
              ========================================================================= */}
          <div className={`tech-hero-card ${proofStatus.toLowerCase()}`}>
            {/* DUAL-STATUS SEPARATION BANNER (§ 7 & 8) */}
            <div className="tech-dual-status-strip">
              <div className="tech-status-chip">
                <span className="chip-label">Business Verification</span>
                <span className={`chip-val ${businessStatus === 'VERIFIED' ? 'green' : 'orange'}`}>
                  {businessStatus === 'VERIFIED' ? '✓ Verified' : '⚠ Needs Review'}
                </span>
              </div>
              <div className="tech-status-divider" />
              <div className="tech-status-chip">
                <span className="chip-label">Technical Proof</span>
                <span
                  className={`chip-val ${
                    proofStatus === 'CONFIRMED'
                      ? 'green'
                      : proofStatus === 'PENDING' || proofStatus === 'SUBMITTED'
                      ? 'honey'
                      : proofStatus === 'FAILED'
                      ? 'red'
                      : 'gray'
                  }`}
                >
                  {proofStatus === 'CONFIRMED'
                    ? '✓ Confirmed'
                    : proofStatus === 'PENDING'
                    ? '◌ Pending'
                    : proofStatus === 'SUBMITTED'
                    ? '◌ Submitted'
                    : proofStatus === 'FAILED'
                    ? '✕ Could Not Confirm'
                    : proofStatus === 'NOT_CREATED'
                    ? '○ Not Created'
                    : '⚠ Stale / Outdated'}
                </span>
              </div>
            </div>

            {/* HERO BODY */}
            <div className="tech-hero-main">
              <div
                className={`tech-hero-icon-bubble ${
                  proofStatus === 'CONFIRMED'
                    ? 'green'
                    : proofStatus === 'PENDING' || proofStatus === 'SUBMITTED'
                    ? 'honey'
                    : proofStatus === 'FAILED'
                    ? 'red'
                    : 'orange'
                }`}
              >
                {proofStatus === 'CONFIRMED' && <CheckCircle2 size={28} />}
                {(proofStatus === 'PENDING' || proofStatus === 'SUBMITTED') && (
                  <Clock size={28} className={isRefreshing ? 'spin' : ''} />
                )}
                {proofStatus === 'FAILED' && <AlertTriangle size={28} />}
                {proofStatus === 'NOT_CREATED' && <ShieldCheck size={28} />}
                {proofStatus === 'INVALIDATED' && <AlertTriangle size={28} />}
              </div>

              <div className="tech-hero-text">
                <h2 className="tech-hero-title">
                  {proofStatus === 'CONFIRMED' && 'Technical proof confirmed'}
                  {proofStatus === 'PENDING' && 'Technical proof pending'}
                  {proofStatus === 'SUBMITTED' && 'Proof submitted'}
                  {proofStatus === 'FAILED' && 'Technical proof could not be confirmed'}
                  {proofStatus === 'NOT_CREATED' && 'Technical proof not created'}
                  {proofStatus === 'INVALIDATED' && 'Verification needs review'}
                </h2>

                <p className="tech-hero-explanation">
                  {proofStatus === 'CONFIRMED' &&
                    'This verification record has been successfully anchored to the HoneyChain proof system.'}
                  {proofStatus === 'PENDING' &&
                    'The verification record has been submitted for technical anchoring. Awaiting block inclusion.'}
                  {proofStatus === 'SUBMITTED' &&
                    'The verification record has been broadcast to the consortium mempool and is awaiting confirmation.'}
                  {proofStatus === 'FAILED' &&
                    'The verification record exists, but technical anchoring could not be confirmed due to a network timeout.'}
                  {proofStatus === 'NOT_CREATED' &&
                    'The verification record exists, but no technical proof has been created yet.'}
                  {proofStatus === 'INVALIDATED' &&
                    'Evidence associated with this verification record changed after sealing. The technical proof may no longer represent the current state.'}
                </p>

                {/* CONTEXTUAL ACTION BUTTON */}
                <div className="tech-hero-cta-wrap">
                  {proofStatus === 'CONFIRMED' && (
                    <div className="tech-hero-meta-row">
                      <span>Anchored on <strong>Block #54819240</strong></span>
                      <span className="meta-bullet">•</span>
                      <span>12 Confirmations</span>
                    </div>
                  )}

                  {proofStatus === 'PENDING' && (
                    <button
                      type="button"
                      className="btn btn-secondary tech-action-btn"
                      onClick={handleRefreshStatus}
                      disabled={isRefreshing}
                    >
                      <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
                      <span>{isRefreshing ? 'Checking proof status…' : 'Refresh proof status'}</span>
                    </button>
                  )}

                  {proofStatus === 'SUBMITTED' && (
                    <button
                      type="button"
                      className="btn btn-secondary tech-action-btn"
                      onClick={handleRefreshStatus}
                      disabled={isRefreshing}
                    >
                      <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
                      <span>Check block inclusion</span>
                    </button>
                  )}

                  {proofStatus === 'FAILED' && (
                    <button
                      type="button"
                      className="btn btn-primary tech-action-btn"
                      onClick={handleRetryProof}
                      disabled={isRetrying}
                    >
                      <RotateCcw size={14} className={isRetrying ? 'spin' : ''} />
                      <span>{isRetrying ? 'Retrying anchoring…' : 'Try again'}</span>
                    </button>
                  )}

                  {proofStatus === 'NOT_CREATED' && (
                    <button
                      type="button"
                      className="btn btn-primary tech-action-btn"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <ShieldCheck size={14} />
                      <span>Create technical proof</span>
                    </button>
                  )}

                  {proofStatus === 'INVALIDATED' && (
                    <button
                      type="button"
                      className="btn btn-primary tech-action-btn"
                      onClick={() => {
                        openVerification({ batchId: currentBatch.id });
                        handleClose();
                      }}
                    >
                      <FileText size={14} />
                      <span>Review verification</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              VERIFICATION RECORD SUMMARY (§ 9)
              ========================================================================= */}
          <section className="tech-card">
            <div className="tech-card-header">
              <div>
                <span className="tech-card-eyebrow">Authoritative Source</span>
                <h3 className="tech-card-title">Verification record</h3>
              </div>
              <span className="tech-version-pill">Version v3</span>
            </div>

            <div className="tech-grid-2col">
              <div className="tech-kv-item">
                <span className="tech-kv-label">HONEY BATCH</span>
                <strong className="tech-kv-val mono">{currentBatch.batchNumber || 'HC-2409'}</strong>
              </div>
              <div className="tech-kv-item">
                <span className="tech-kv-label">VERIFICATION ID</span>
                <strong className="tech-kv-val mono">VR-HC-2026-0925-V1</strong>
              </div>
              <div className="tech-kv-item">
                <span className="tech-kv-label">WORKFLOW DECISION</span>
                <span className="tech-kv-val green">
                  {businessStatus === 'VERIFIED' ? 'Quality Verified' : 'Needs Review'}
                </span>
              </div>
              <div className="tech-kv-item">
                <span className="tech-kv-label">VERIFIED TIMESTAMP</span>
                <span className="tech-kv-val">25 Sep 2026 · 13:45 UTC</span>
              </div>
              <div className="tech-kv-item">
                <span className="tech-kv-label">RECORD VERSION</span>
                <span className="tech-kv-val mono">v3 (Payload ev-2409.3)</span>
              </div>
              <div className="tech-kv-item">
                <span className="tech-kv-label">VERIFIED BY</span>
                <span className="tech-kv-val">Elena Vance (Lead Quality Inspector)</span>
              </div>
            </div>
          </section>

          {/* =========================================================================
              TECHNICAL PROOF DETAILS (§ 10, § 30 & 31)
              ========================================================================= */}
          <section className="tech-card">
            <div className="tech-card-header">
              <div>
                <span className="tech-card-eyebrow">Cryptographic Record</span>
                <h3 className="tech-card-title">Technical proof details</h3>
              </div>
              <span className="tech-network-tag">Proof of Origin</span>
            </div>

            <div className="tech-proof-rows">
              {/* Ledger Network */}
              <div className="tech-proof-row">
                <div className="tproof-meta">
                  <span className="tproof-label">LEDGER NETWORK</span>
                  <span className="tproof-desc">The consortium network used to anchor this proof</span>
                </div>
                <strong className="tproof-val">HoneyChain Consortium Ledger</strong>
              </div>

              {/* Block Number */}
              <div className="tech-proof-row">
                <div className="tproof-meta">
                  <span className="tproof-label">BLOCK NUMBER</span>
                  <span className="tproof-desc">The immutable block containing this transaction</span>
                </div>
                <strong className="tproof-val mono">
                  {proofStatus === 'CONFIRMED' || proofStatus === 'INVALIDATED'
                    ? '#54819240'
                    : proofStatus === 'PENDING' || proofStatus === 'SUBMITTED'
                    ? 'Awaiting block assignment'
                    : 'Not assigned'}
                </strong>
              </div>

              {/* Block Timestamp */}
              <div className="tech-proof-row">
                <div className="tproof-meta">
                  <span className="tproof-label">ANCHOR TIMESTAMP</span>
                  <span className="tproof-desc">Precise UTC time this block achieved finality</span>
                </div>
                <span className="tproof-val">
                  {proofStatus === 'CONFIRMED' || proofStatus === 'INVALIDATED'
                    ? '2026-09-25 13:45:10 UTC'
                    : 'Pending notarization'}
                </span>
              </div>

              {/* Transaction Hash */}
              <div className="tech-proof-row full-width">
                <div className="tproof-header-inline">
                  <div className="tproof-meta">
                    <span className="tproof-label">TRANSACTION REFERENCE</span>
                    <span className="tproof-desc">Unique cryptographic reference for this notarization</span>
                  </div>
                  <div className="tproof-actions">
                    <button
                      type="button"
                      className="tproof-mini-btn"
                      onClick={() =>
                        handleCopy('0xd942b87f619e083a21dc49019b841e2a537f', 'txHash')
                      }
                      title="Copy full transaction reference"
                    >
                      {copiedKey === 'txHash' ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedKey === 'txHash' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      className="tproof-mini-btn"
                      onClick={() =>
                        setIsFullHashModalOpen({
                          title: 'Transaction Reference',
                          label: 'Transaction Hash (Keccak-256)',
                          value: '0xd942b87f619e083a21dc49019b841e2a537f'
                        })
                      }
                      title="Expand complete transaction reference"
                    >
                      View
                    </button>
                  </div>
                </div>
                <div className="tproof-code-box">
                  <span className="mono tproof-hash-snippet">0xd942b87f619e083a21dc49019b841e2a537f</span>
                </div>
              </div>

              {/* Merkle Root */}
              <div className="tech-proof-row full-width">
                <div className="tproof-header-inline">
                  <div className="tproof-meta">
                    <span className="tproof-label">MERKLE RECORD ROOT</span>
                    <span className="tproof-desc">Combines harvest, extraction, lab test & jar lot hashes</span>
                  </div>
                  <button
                    type="button"
                    className="tproof-mini-btn"
                    onClick={() =>
                      handleCopy('0x3f9801a4e5bc1209e86d23fb482b9a710255', 'merkle')
                    }
                  >
                    {copiedKey === 'merkle' ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedKey === 'merkle' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="tproof-code-box">
                  <span className="mono tproof-hash-snippet">0x3f9801a4e5bc1209e86d23fb482b9a710255</span>
                </div>
              </div>

              {/* Tamper Seal Hash */}
              <div className="tech-proof-row full-width">
                <div className="tproof-header-inline">
                  <div className="tproof-meta">
                    <span className="tproof-label">TAMPER-EVIDENT JAR SEAL</span>
                    <span className="tproof-desc">Encoded onto retail jars of Lot HC-2409-P01</span>
                  </div>
                  <button
                    type="button"
                    className="tproof-mini-btn"
                    onClick={() =>
                      handleCopy('0x8b3f912c4189e49120bc98319fca448912e', 'seal')
                    }
                  >
                    {copiedKey === 'seal' ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedKey === 'seal' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="tproof-code-box">
                  <span className="mono tproof-hash-snippet">0x8b3f912c4189e49120bc98319fca448912e</span>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              HUMAN-READABLE EXPLANATION (§ 11 & 12)
              ========================================================================= */}
          <section className="tech-card tech-explainer-card">
            <div className="tech-explainer-top">
              <div className="tech-explainer-icon">
                <HelpCircle size={18} color="var(--color-deep-honey)" />
              </div>
              <h3 className="tech-explainer-title">What does this proof mean?</h3>
            </div>

            <p className="tech-explainer-p">
              Technical proof helps show that this verification record was anchored to the
              HoneyChain proof system at a particular point in time.
            </p>

            <div className="tech-explainer-callout">
              <strong>Important distinction:</strong>
              <p>
                It proves the digital integrity and timestamping of the records. It does not by itself
                prove that the physical honey is pure, safe, or free from contamination—that trust comes
                from the physical hive inspections, cold processing logs, and accredited laboratory tests.
              </p>
            </div>

            {/* PLAIN-ENGLISH GLOSSARY (§ 12) */}
            <div className="tech-glossary-grid">
              <div className="tech-glossary-item">
                <span className="tg-term">Transaction reference</span>
                <p className="tg-def">A unique cryptographic reference for the technical transaction.</p>
              </div>
              <div className="tech-glossary-item">
                <span className="tg-term">Audit record</span>
                <p className="tg-def">The authoritative record containing this notarized batch consignment.</p>
              </div>
              <div className="tech-glossary-item">
                <span className="tg-term">Authoritative gateway</span>
                <p className="tg-def">The verified multi-party gateway maintained by regional apiary associations.</p>
              </div>
              <div className="tech-glossary-item">
                <span className="tg-term">Validation rules engine</span>
                <p className="tg-def">The application logic that enforces required evidence before verification.</p>
              </div>
            </div>
          </section>

          {/* =========================================================================
              TECHNICAL AUDIT TIMELINE (§ 20)
              ========================================================================= */}
          <section className="tech-card">
            <div className="tech-card-header">
              <div>
                <span className="tech-card-eyebrow">Milestone Sequence</span>
                <h3 className="tech-card-title">Proof activity</h3>
              </div>
              <span className="tech-audit-tag">4 Events</span>
            </div>

            <div className="tech-timeline">
              {proofStatus === 'CONFIRMED' && (
                <div className="tech-tl-entry done">
                  <div className="tech-tl-dot green" />
                  <div className="tech-tl-line" />
                  <div className="tech-tl-content">
                    <div className="tech-tl-top">
                      <strong className="tech-tl-heading">Proof confirmed</strong>
                      <span className="tech-tl-time">25 Sep · 13:45 UTC</span>
                    </div>
                    <p className="tech-tl-desc">
                      Transaction verified on-chain in Block #54819240 with 12 network confirmations.
                    </p>
                  </div>
                </div>
              )}

              {(proofStatus === 'CONFIRMED' || proofStatus === 'SUBMITTED' || proofStatus === 'PENDING') && (
                <div className="tech-tl-entry done">
                  <div className="tech-tl-dot honey" />
                  <div className="tech-tl-line" />
                  <div className="tech-tl-content">
                    <div className="tech-tl-top">
                      <strong className="tech-tl-heading">Proof submitted</strong>
                      <span className="tech-tl-time">25 Sep · 13:43 UTC</span>
                    </div>
                    <p className="tech-tl-desc">
                      Payload broadcast to HoneyChain Ledger consensus pool.
                    </p>
                  </div>
                </div>
              )}

              {proofStatus === 'FAILED' && (
                <div className="tech-tl-entry failed">
                  <div className="tech-tl-dot red" />
                  <div className="tech-tl-line" />
                  <div className="tech-tl-content">
                    <div className="tech-tl-top">
                      <strong className="tech-tl-heading">Anchoring confirmation timed out</strong>
                      <span className="tech-tl-time">25 Sep · 13:44 UTC</span>
                    </div>
                    <p className="tech-tl-desc">
                      Network response delayed beyond 60s timeout. Verification record remains preserved.
                    </p>
                  </div>
                </div>
              )}

              <div className="tech-tl-entry done">
                <div className="tech-tl-dot normal" />
                <div className="tech-tl-line" />
                <div className="tech-tl-content">
                  <div className="tech-tl-top">
                    <strong className="tech-tl-heading">Technical proof requested</strong>
                    <span className="tech-tl-time">25 Sep · 13:43 UTC</span>
                  </div>
                  <p className="tech-tl-desc">
                    Evidence serialized: Source Hive 01, Harvest 18.5kg, Processed 17.9kg, Quality ISO passed.
                  </p>
                </div>
              </div>

              <div className="tech-tl-entry done">
                <div className="tech-tl-dot normal" />
                <div className="tech-tl-content">
                  <div className="tech-tl-top">
                    <strong className="tech-tl-heading">Verification completed</strong>
                    <span className="tech-tl-time">25 Sep · 13:42 UTC</span>
                  </div>
                  <p className="tech-tl-desc">
                    Signed by Elena Vance (Lead Quality Inspector). Version v3 established.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              PUBLIC VERIFICATION (§ 21 & 22)
              ========================================================================= */}
          <section className="tech-card">
            <div className="tech-card-header">
              <div>
                <span className="tech-card-eyebrow">External Consumer Audit</span>
                <h3 className="tech-card-title">Public verification</h3>
              </div>
              <span className="tech-public-tag">Safe Public Link</span>
            </div>

            <p className="tech-card-intro">
              Share a public reference that allows retail consumers, distributors, or regulators to
              verify this honey batch's digital provenance. Private beekeeper telemetry and internal
              staff notes are omitted.
            </p>

            <div className="tech-public-box">
              <div className="tech-public-url-row">
                <span className="tech-public-url mono">
                  https://verify.honeychain.org/b/HC-2409
                </span>
                <button
                  type="button"
                  className="btn btn-secondary tech-public-copy-btn"
                  onClick={() =>
                    handleCopy('https://verify.honeychain.org/b/HC-2409', 'publicUrl')
                  }
                >
                  {copiedKey === 'publicUrl' ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedKey === 'publicUrl' ? 'Copied' : 'Copy link'}</span>
                </button>
              </div>

              <div className="tech-public-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, height: '40px', fontSize: '12px' }}
                  onClick={() => {
                    if (window.__openPublicVerification) {
                      window.__openPublicVerification('HC-2409');
                    } else {
                      window.open('https://verify.honeychain.org/b/HC-2409', '_blank');
                    }
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Open public portal</span>
                </button>
              </div>
            </div>
          </section>

          {/* =========================================================================
              ADVANCED TECHNICAL DETAILS COLLAPSIBLE (§ 23 & 24)
              ========================================================================= */}
          <section className="tech-advanced-wrapper">
            <button
              type="button"
              className="tech-advanced-toggle-btn"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            >
              <div className="tadv-btn-left">
                <Lock size={15} color="var(--color-warm-gray)" />
                <span>
                  {isAdvancedOpen ? 'Hide advanced technical details' : 'View advanced technical details'}
                </span>
              </div>
              <ChevronDown
                size={16}
                style={{
                  transform: isAdvancedOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {isAdvancedOpen && (
              <div className="tech-advanced-panel">
                <div className="tech-advanced-grid">
                  <div className="tech-adv-item">
                    <span className="adv-label">NETWORK IDENTIFIER</span>
                    <span className="adv-val mono">honeychain-consortium-mainnet</span>
                  </div>
                  <div className="tech-adv-item">
                    <span className="adv-label">CHAIN ID</span>
                    <span className="adv-val mono">137 (Polygon POS Notarization)</span>
                  </div>
                  <div className="tech-adv-item">
                    <span className="adv-label">SMART REGISTRY CONTRACT</span>
                    <span className="adv-val mono">0x1f89c4892c90ad7b2c019481</span>
                  </div>
                  <div className="tech-adv-item">
                    <span className="adv-label">PROOF PAYLOAD FORMAT</span>
                    <span className="adv-val mono">EIP-712 Typed Structured Evidence</span>
                  </div>
                  <div className="tech-adv-item">
                    <span className="adv-label">CONSENSUS FINALITY</span>
                    <span className="adv-val">12 Proof-of-Authority Confirmations</span>
                  </div>
                  <div className="tech-adv-item">
                    <span className="adv-label">GAS / ENERGY CONSUMED</span>
                    <span className="adv-val">42,190 units (Zero-carbon certified)</span>
                  </div>
                  <div className="tech-adv-item full-width">
                    <span className="adv-label">PAYLOAD SHA-256 INTEGRITY DIGEST</span>
                    <span className="adv-val mono break-all">
                      sha256:4a8b79e190bc1209e86d23fb482b9a710255c28e401
                    </span>
                  </div>
                </div>

                <div className="tech-adv-security-note">
                  <ShieldCheck size={14} color="#4F7A52" />
                  <p>
                    Strict Security Protocol: Private cryptographic signing keys, internal API tokens,
                    and node credentials remain locked in hardware security modules and never reach
                    client interfaces.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* =========================================================================
            BOTTOM ACTION BAR (§ 30)
            ========================================================================= */}
        <footer className="tech-footer">
          <div className="tech-footer-row">
            <button
              type="button"
              className="btn btn-secondary tech-fbtn"
              onClick={() => {
                openVerification({ batchId: currentBatch.id });
                handleClose();
              }}
            >
              <Award size={14} />
              <span>Verification</span>
            </button>

            <button
              type="button"
              className="btn btn-primary tech-fbtn tech-fbtn-hero"
              onClick={() => {
                openBatchJourney({ batchId: currentBatch.id });
                handleClose();
              }}
            >
              <Layers size={14} />
              <span>Return to honey journey</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>

        {/* =========================================================================
            FULL HASH / REFERENCE MODAL (§ 30 & 31)
            ========================================================================= */}
        {isFullHashModalOpen && (
          <div className="tech-modal-overlay" onClick={() => setIsFullHashModalOpen(null)}>
            <div className="tech-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="tech-modal-top">
                <div className="tech-modal-title-group">
                  <span className="tech-modal-eyebrow">Cryptographic Reference</span>
                  <h4>{isFullHashModalOpen.title}</h4>
                </div>
                <button
                  type="button"
                  className="tech-modal-close-btn"
                  onClick={() => setIsFullHashModalOpen(null)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="tech-hash-detail-box">
                <span className="tech-hash-label">{isFullHashModalOpen.label}</span>
                <p className="tech-hash-value mono">{isFullHashModalOpen.value}</p>
              </div>

              <div className="tech-modal-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    handleCopy(isFullHashModalOpen.value, 'modalHash');
                    setIsFullHashModalOpen(null);
                  }}
                >
                  Copy Complete Hash
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            CREATE TECHNICAL PROOF MODAL (§ 14)
            ========================================================================= */}
        {isCreateModalOpen && (
          <div className="tech-modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
            <div className="tech-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="tech-modal-top">
                <div className="tech-modal-title-group">
                  <span className="tech-modal-eyebrow">Immutable Notarization (§ 14)</span>
                  <h4>Create technical proof?</h4>
                </div>
                <button
                  type="button"
                  className="tech-modal-close-btn"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <p className="tech-create-p">
                HoneyChain will compile an immutable proof payload for{' '}
                <strong>{currentBatch.batchNumber} (v3)</strong> and anchor it to the HoneyChain
                Consortium Ledger.
              </p>

              <div className="tech-create-meta-box">
                <div className="tech-create-row">
                  <span>Batch Identifier:</span>
                  <strong className="mono">{currentBatch.batchNumber}</strong>
                </div>
                <div className="tech-create-row">
                  <span>Verification Record:</span>
                  <span className="mono">VR-HC-2026-0925-V1</span>
                </div>
                <div className="tech-create-row">
                  <span>Included Evidence:</span>
                  <span>Hive 01 · 18.5kg Harvest · Cold Extract · ISO Lab Pass</span>
                </div>
              </div>

              <div className="tech-modal-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '44px' }}
                  onClick={handleCreateProof}
                >
                  <ShieldCheck size={15} />
                  <span>Create proof</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', height: '44px', marginTop: '6px' }}
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            JURY DEMONSTRATION DRAWER (§ 36)
            ========================================================================= */}
        {isJuryDrawerOpen && (
          <div className="tech-drawer-overlay" onClick={() => setIsJuryDrawerOpen(false)}>
            <div className="tech-drawer-content" onClick={(e) => e.stopPropagation()}>
              <div className="tech-drawer-header">
                <div className="tech-drawer-title-group">
                  <span className="tech-drawer-eyebrow">Jury Evaluation (§ 36)</span>
                  <h4>Technical Proof Scenarios</h4>
                </div>
                <button
                  type="button"
                  className="tech-modal-close-btn"
                  onClick={() => setIsJuryDrawerOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <p className="tech-drawer-desc">
                Select a scenario to demonstrate how HoneyChain independently decouples Business
                Verification from Technical Proof:
              </p>

              <div className="tech-drawer-presets">
                <button
                  type="button"
                  className={`tech-preset-card ${scenario === 'confirmed' ? 'active' : ''}`}
                  onClick={() => applyScenario('confirmed')}
                >
                  <div className="tech-preset-icon green">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="tech-preset-text">
                    <strong>1. Verified + Proof Confirmed (Default)</strong>
                    <p>
                      Happy path: Workflow complete and verification record confirmed on HoneyChain
                      Ledger block #54819240.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className={`tech-preset-card ${scenario === 'pending' ? 'active' : ''}`}
                  onClick={() => applyScenario('pending')}
                >
                  <div className="tech-preset-icon honey">
                    <Clock size={16} />
                  </div>
                  <div className="tech-preset-text">
                    <strong>2. Verified + Proof Pending</strong>
                    <p>
                      Asynchronous proof anchoring: Business workflow verified, technical proof in
                      progress. Test "Refresh proof status" button.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className={`tech-preset-card ${scenario === 'failed' ? 'active' : ''}`}
                  onClick={() => applyScenario('failed')}
                >
                  <div className="tech-preset-icon red">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="tech-preset-text">
                    <strong>3. Verified + Proof Failed</strong>
                    <p>
                      Network timeout on verification gateway: Business verification remains valid, with an
                      idempotent "Try again" retry CTA.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className={`tech-preset-card ${scenario === 'not_created' ? 'active' : ''}`}
                  onClick={() => applyScenario('not_created')}
                >
                  <div className="tech-preset-icon gray">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="tech-preset-text">
                    <strong>4. Proof Not Created</strong>
                    <p>
                      Demonstrates the explicit confirmation modal to create an immutable proof payload.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className={`tech-preset-card ${scenario === 'stale' ? 'active' : ''}`}
                  onClick={() => applyScenario('stale')}
                >
                  <div className="tech-preset-icon orange">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="tech-preset-text">
                    <strong>5. Verification Needs Review (Stale Proof)</strong>
                    <p>
                      Underlying harvest evidence was amended after sealing: flags technical proof as
                      outdated and routes to verification review.
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
          .tech-screen-overlay {
            position: fixed;
            inset: 0;
            z-index: 1060;
            background-color: var(--color-warm-cream);
            display: flex;
            justify-content: center;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          .tech-screen-container {
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
          .tech-header {
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

          .tech-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .tech-back-btn {
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

          .tech-back-btn:hover {
            background: #F5EADB;
          }

          .tech-header-eyebrow {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--color-deep-honey);
            font-weight: 700;
            display: block;
          }

          .tech-header-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            margin: 0;
            line-height: 1.2;
          }

          .tech-header-sub {
            font-size: 12px;
            color: var(--color-warm-gray);
            margin: 2px 0 0;
          }

          .tech-demo-pill {
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
          .tech-body {
            flex: 1;
            padding: 16px 16px 100px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          /* HERO CARD (§ 6 & 8) */
          .tech-hero-card {
            background: var(--color-soft-ivory);
            border: 1.5px solid var(--color-card-border);
            border-radius: var(--radius-card);
            padding: 16px;
            box-shadow: var(--shadow-card);
          }

          .tech-hero-card.confirmed {
            border-color: #C4D9C0;
          }

          .tech-hero-card.pending,
          .tech-hero-card.submitted {
            border-color: #EAD3B3;
          }

          .tech-hero-card.failed {
            border-color: #E6B5B3;
          }

          .tech-hero-card.invalidated {
            border-color: #F0C4A4;
          }

          /* DUAL STATUS STRIP */
          .tech-dual-status-strip {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #F9F4EB;
            border-radius: 10px;
            padding: 8px 12px;
            margin-bottom: 14px;
          }

          .tech-status-chip {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .chip-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-warm-gray);
            font-weight: 700;
          }

          .chip-val {
            font-size: 12px;
            font-weight: 700;
          }

          .chip-val.green {
            color: #4F7A52;
          }

          .chip-val.honey {
            color: var(--color-deep-honey);
          }

          .chip-val.red {
            color: #B85450;
          }

          .chip-val.orange {
            color: #D9822B;
          }

          .chip-val.gray {
            color: var(--color-warm-gray);
          }

          .tech-status-divider {
            width: 1px;
            height: 24px;
            background: var(--color-divider);
          }

          /* Hero Main */
          .tech-hero-main {
            display: flex;
            gap: 14px;
          }

          .tech-hero-icon-bubble {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .tech-hero-icon-bubble.green {
            background: rgba(79, 122, 82, 0.12);
            color: #4F7A52;
          }

          .tech-hero-icon-bubble.honey {
            background: rgba(217, 154, 36, 0.12);
            color: var(--color-deep-honey);
          }

          .tech-hero-icon-bubble.red {
            background: rgba(184, 84, 80, 0.12);
            color: #B85450;
          }

          .tech-hero-icon-bubble.orange {
            background: rgba(217, 130, 43, 0.12);
            color: #D9822B;
          }

          .tech-hero-text {
            flex: 1;
          }

          .tech-hero-title {
            font-size: 17px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            margin: 0 0 4px;
          }

          .tech-hero-explanation {
            font-size: 13px;
            color: var(--color-warm-gray);
            line-height: 1.45;
            margin: 0 0 12px;
          }

          .tech-hero-meta-row {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--color-deep-cocoa);
          }

          .meta-bullet {
            color: var(--color-warm-gray);
          }

          .tech-action-btn {
            height: 38px;
            font-size: 12px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 0 14px;
          }

          /* STANDARD CARD */
          .tech-card {
            background: var(--color-soft-ivory);
            border: 1px solid var(--color-divider);
            border-radius: var(--radius-card);
            padding: 16px;
            box-shadow: var(--shadow-sm);
          }

          .tech-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 14px;
          }

          .tech-card-eyebrow {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-deep-honey);
            font-weight: 700;
            display: block;
          }

          .tech-card-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            margin: 2px 0 0;
          }

          .tech-card-intro {
            font-size: 12px;
            color: var(--color-warm-gray);
            line-height: 1.45;
            margin: 0 0 12px;
          }

          .tech-version-pill,
          .tech-network-tag,
          .tech-audit-tag,
          .tech-public-tag {
            font-size: 10px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 6px;
            background: rgba(120, 109, 97, 0.1);
            color: var(--color-deep-cocoa);
          }

          .tech-grid-2col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 14px;
          }

          .tech-kv-item {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .tech-kv-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-warm-gray);
            font-weight: 700;
          }

          .tech-kv-val {
            font-size: 13px;
            color: var(--color-deep-cocoa);
          }

          .tech-kv-val.green {
            color: #4F7A52;
            font-weight: 600;
          }

          /* PROOF DETAILS ROWS */
          .tech-proof-rows {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .tech-proof-row {
            border-bottom: 1px solid var(--color-divider);
            padding-bottom: 10px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
          }

          .tech-proof-row.full-width {
            flex-direction: column;
          }

          .tech-proof-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }

          .tproof-meta {
            display: flex;
            flex-direction: column;
            gap: 1px;
          }

          .tproof-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-warm-gray);
            font-weight: 700;
          }

          .tproof-desc {
            font-size: 11px;
            color: var(--color-warm-gray);
          }

          .tproof-val {
            font-size: 13px;
            color: var(--color-deep-cocoa);
            text-align: right;
          }

          .tproof-header-inline {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 6px;
          }

          .tproof-actions {
            display: flex;
            gap: 6px;
          }

          .tproof-mini-btn {
            background: #F5EADB;
            border: 1px solid #E0D3C1;
            border-radius: 6px;
            color: var(--color-deep-cocoa);
            font-size: 11px;
            font-weight: 600;
            padding: 2px 8px;
            display: flex;
            align-items: center;
            gap: 3px;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .tproof-mini-btn:hover {
            background: var(--color-primary-honey);
            color: #fff;
          }

          .tproof-code-box {
            width: 100%;
            background: #F9F5EC;
            border: 1px solid var(--color-divider);
            border-radius: 8px;
            padding: 8px 10px;
          }

          .tproof-hash-snippet {
            font-size: 11px;
            color: var(--color-deep-cocoa);
            word-break: break-all;
            display: block;
          }

          /* EXPLAINER CARD (§ 11 & 12) */
          .tech-explainer-card {
            background: #FDF9F0;
            border: 1.5px solid #E8DEC9;
          }

          .tech-explainer-top {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .tech-explainer-title {
            font-size: 15px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            margin: 0;
          }

          .tech-explainer-p {
            font-size: 13px;
            color: var(--color-deep-cocoa);
            line-height: 1.45;
            margin: 0 0 10px;
          }

          .tech-explainer-callout {
            background: #FFFDF8;
            border: 1px solid #E6D9C0;
            border-left: 3px solid var(--color-primary-honey);
            border-radius: 6px;
            padding: 10px 12px;
            margin-bottom: 14px;
          }

          .tech-explainer-callout strong {
            font-size: 12px;
            color: var(--color-deep-cocoa);
            display: block;
            margin-bottom: 2px;
          }

          .tech-explainer-callout p {
            font-size: 11.5px;
            color: var(--color-warm-gray);
            line-height: 1.4;
            margin: 0;
          }

          .tech-glossary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            border-top: 1px solid #EADBBE;
            padding-top: 12px;
          }

          .tech-glossary-item {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .tg-term {
            font-size: 11px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
          }

          .tg-def {
            font-size: 10.5px;
            color: var(--color-warm-gray);
            line-height: 1.35;
            margin: 0;
          }

          /* TIMELINE */
          .tech-timeline {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .tech-tl-entry {
            display: flex;
            gap: 12px;
            position: relative;
          }

          .tech-tl-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-top: 4px;
            flex-shrink: 0;
          }

          .tech-tl-dot.green {
            background: #4F7A52;
            box-shadow: 0 0 0 3px rgba(79, 122, 82, 0.2);
          }

          .tech-tl-dot.honey {
            background: var(--color-primary-honey);
          }

          .tech-tl-dot.red {
            background: #B85450;
          }

          .tech-tl-dot.normal {
            background: #786D61;
          }

          .tech-tl-line {
            position: absolute;
            top: 14px;
            bottom: -16px;
            left: 4px;
            width: 2px;
            background: var(--color-divider);
          }

          .tech-tl-content {
            flex: 1;
          }

          .tech-tl-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2px;
          }

          .tech-tl-heading {
            font-size: 13px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
          }

          .tech-tl-time {
            font-size: 11px;
            color: var(--color-warm-gray);
          }

          .tech-tl-desc {
            font-size: 11px;
            color: var(--color-warm-gray);
            line-height: 1.35;
            margin: 0;
          }

          /* PUBLIC VERIFICATION */
          .tech-public-box {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .tech-public-url-row {
            background: #F9F5EC;
            border: 1px solid var(--color-divider);
            border-radius: 8px;
            padding: 8px 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .tech-public-url {
            font-size: 11px;
            color: var(--color-deep-cocoa);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .tech-public-copy-btn {
            height: 30px;
            padding: 0 10px;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 4px;
            flex-shrink: 0;
          }

          .tech-public-actions {
            display: flex;
            gap: 8px;
          }

          /* ADVANCED COLLAPSIBLE */
          .tech-advanced-wrapper {
            margin-top: 4px;
          }

          .tech-advanced-toggle-btn {
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

          .tech-advanced-toggle-btn:hover {
            border-color: var(--color-primary-honey);
            background: #F9F5EC;
          }

          .tadv-btn-left {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .tech-advanced-panel {
            background: var(--color-soft-ivory);
            border: 1px solid var(--color-divider);
            border-top: none;
            border-radius: 0 0 var(--radius-card) var(--radius-card);
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .tech-advanced-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .tech-adv-item {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .tech-adv-item.full-width {
            grid-column: 1 / -1;
          }

          .adv-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-warm-gray);
            font-weight: 700;
          }

          .adv-val {
            font-size: 11px;
            color: var(--color-deep-cocoa);
            word-break: break-all;
          }

          .tech-adv-security-note {
            display: flex;
            gap: 8px;
            background: #F0F6EF;
            border: 1px solid #D1E4CF;
            border-radius: 8px;
            padding: 8px 10px;
          }

          .tech-adv-security-note p {
            font-size: 10.5px;
            color: #37533A;
            line-height: 1.35;
            margin: 0;
          }

          /* FOOTER */
          .tech-footer {
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

          .tech-footer-row {
            width: 100%;
            max-width: 480px;
            display: flex;
            gap: 10px;
          }

          .tech-fbtn {
            height: 46px;
            font-size: 14px;
            font-weight: 600;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }

          .tech-fbtn-hero {
            flex: 1.6;
          }

          /* MODALS */
          .tech-modal-overlay {
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

          .tech-modal-card {
            width: 100%;
            max-width: 400px;
            background: var(--color-soft-ivory);
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            animation: techFadeUp 0.2s ease-out;
          }

          @keyframes techFadeUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .tech-modal-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 12px;
          }

          .tech-modal-eyebrow {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-deep-honey);
            font-weight: 700;
            display: block;
          }

          .tech-modal-title-group h4 {
            font-size: 16px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            margin: 2px 0 0;
          }

          .tech-modal-close-btn {
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

          .tech-hash-detail-box {
            background: #F9F5EC;
            border: 1px solid var(--color-divider);
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 16px;
          }

          .tech-hash-label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 700;
            color: var(--color-warm-gray);
            display: block;
            margin-bottom: 4px;
          }

          .tech-hash-value {
            font-size: 12px;
            color: var(--color-deep-cocoa);
            word-break: break-all;
            margin: 0;
            line-height: 1.4;
          }

          .tech-create-p {
            font-size: 13px;
            color: var(--color-deep-cocoa);
            line-height: 1.45;
            margin: 0 0 12px;
          }

          .tech-create-meta-box {
            background: #FDF9F0;
            border: 1px solid #EADBBE;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 16px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: 12px;
          }

          .tech-create-row {
            display: flex;
            justify-content: space-between;
            color: var(--color-deep-cocoa);
          }

          /* DRAWER */
          .tech-drawer-overlay {
            position: fixed;
            inset: 0;
            z-index: 1200;
            background: rgba(52, 38, 27, 0.5);
            display: flex;
            justify-content: flex-end;
          }

          .tech-drawer-content {
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

          .tech-drawer-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 10px;
          }

          .tech-drawer-eyebrow {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-deep-honey);
            font-weight: 700;
            display: block;
          }

          .tech-drawer-title-group h4 {
            font-size: 16px;
            font-weight: 700;
            color: var(--color-deep-cocoa);
            margin: 2px 0 0;
          }

          .tech-drawer-desc {
            font-size: 12px;
            color: var(--color-warm-gray);
            line-height: 1.4;
            margin: 0 0 14px;
          }

          .tech-drawer-presets {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .tech-preset-card {
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

          .tech-preset-card:hover {
            border-color: var(--color-primary-honey);
            background: #FAF2E3;
          }

          .tech-preset-card.active {
            border-color: var(--color-primary-honey);
            background: #FDF3DF;
            box-shadow: 0 0 0 1.5px var(--color-primary-honey);
          }

          .tech-preset-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .tech-preset-icon.green {
            background: rgba(79, 122, 82, 0.12);
            color: #4F7A52;
          }

          .tech-preset-icon.honey {
            background: rgba(217, 154, 36, 0.12);
            color: var(--color-deep-honey);
          }

          .tech-preset-icon.red {
            background: rgba(184, 84, 80, 0.12);
            color: #B85450;
          }

          .tech-preset-icon.orange {
            background: rgba(217, 130, 43, 0.12);
            color: #D9822B;
          }

          .tech-preset-icon.gray {
            background: rgba(120, 109, 97, 0.12);
            color: var(--color-warm-gray);
          }

          .tech-preset-text strong {
            display: block;
            font-size: 12px;
            color: var(--color-deep-cocoa);
            margin-bottom: 2px;
          }

          .tech-preset-text p {
            font-size: 11px;
            color: var(--color-warm-gray);
            line-height: 1.35;
            margin: 0;
          }

          .mono {
            font-family: 'SF Mono', Consolas, Monaco, monospace;
          }

          .break-all {
            word-break: break-all;
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

export default TechnicalProofView;
