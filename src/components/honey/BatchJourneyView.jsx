import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppState } from '../../context/AppStateContext';
import {
  ArrowLeft,
  X,
  Droplets,
  Calendar,
  Scale,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  Info,
  Clock,
  User,
  Layers,
  Edit3,
  Check,
  CheckCircle2,
  FileText,
  Sliders,
  Sparkles,
  FlaskConical,
  FileCheck,
  AlertCircle,
  HelpCircle,
  PauseCircle,
  ChevronDown,
  ChevronUp,
  QrCode,
  Package,
  Activity,
  Compass
} from 'lucide-react';

/**
 * SCREEN 25 — HONEY JOURNEY / BATCH TRACEABILITY
 * 
 * Master UI/UX + End-to-End Traceability + Evidence Timeline
 * Story: Hive → Collection → Processing → Quality → Packaging → Verified
 * Answers: "Can I follow this honey from the hive where it came from to the final verified product?"
 * Digital journey record — human workflow first.
 */

export const BatchJourneyView = ({ isOpen, onClose, payload }) => {
  const {
    batches,
    setSelectedBatchId,
    setSelectedHiveId,
    setActiveTab,
    openCollectionDetails,
    openQualityCheck,
    openSheet,
    showToast,
    apiary,
    openTechnicalProof,
    openProductQrManagement
  } = useAppState();

  // Active Batch Resolution
  const [activeBatchId, setActiveBatchId] = useState(
    payload?.batchId || payload?.id || 'batch-hc-2409'
  );

  const batch = useMemo(() => {
    return batches.find((b) => b.id === activeBatchId) || batches[0];
  }, [batches, activeBatchId]);

  // Demo Override State for Simulation (§ 55)
  const [demoPreset, setDemoPreset] = useState('quality_passed'); // 'quality_passed' | 'in_processing' | 'verified' | 'quality_pending'
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);
  const [isTechProofOpen, setIsTechProofOpen] = useState(false);
  const [expandedStage, setExpandedStage] = useState('quality'); // 'hive' | 'collection' | 'processing' | 'quality' | 'packaging' | 'verified'

  // Resolve Stage Metrics according to Preset / Batch
  const journeyConfig = useMemo(() => {
    if (demoPreset === 'in_processing') {
      return {
        currentStageKey: 'processing',
        currentStageIndex: 2, // 0: Hive, 1: Collect, 2: Process, 3: Quality, 4: Package, 5: Verify
        statusLabel: 'Processing (In Settling Tank)',
        statusType: 'processing',
        statusKicker: 'In progress',
        primaryActionText: 'View processing log',
        primaryActionType: 'processing'
      };
    }
    if (demoPreset === 'quality_pending') {
      return {
        currentStageKey: 'quality',
        currentStageIndex: 3,
        statusLabel: 'Quality check in progress',
        statusType: 'quality',
        statusKicker: 'Testing active',
        primaryActionText: 'Continue quality check',
        primaryActionType: 'quality'
      };
    }
    if (demoPreset === 'verified') {
      return {
        currentStageKey: 'verified',
        currentStageIndex: 5,
        statusLabel: 'Tested & Origin Certified',
        statusType: 'verified',
        statusKicker: 'Complete',
        primaryActionText: 'View verification certificate',
        primaryActionType: 'verify'
      };
    }
    // Default: 'quality_passed' (Stage 4: Packaging)
    return {
      currentStageKey: 'packaging',
      currentStageIndex: 4,
      statusLabel: 'Quality passed · Ready for packaging',
      statusType: 'packaging',
      statusKicker: 'Ready for packaging',
      primaryActionText: 'Continue to packaging',
      primaryActionType: 'packaging'
    };
  }, [demoPreset]);

  // Handle Current Stage Action Click
  const handlePrimaryAction = () => {
    if (journeyConfig.primaryActionType === 'quality') {
      if (openQualityCheck) {
        openQualityCheck({ batchId: batch.id });
      }
    } else if (journeyConfig.primaryActionType === 'verify') {
      if (openSheet) {
        openSheet('verify-batch', { batch });
      }
    } else if (journeyConfig.primaryActionType === 'packaging') {
      showToast('Packaging workflow initiated — preparing jar lots');
    } else {
      showToast('Viewing processing log for maturation tank #2');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="bj-view-overlay" role="dialog" aria-modal="true">
      <div className="bj-view-container">
        {/* ─────────────────────────────────────────────────────────────
            1. HEADER (Section 4 & 5)
        ───────────────────────────────────────────────────────────── */}
        <header className="bj-header">
          <div className="bj-header-top-row">
            <button
              type="button"
              className="bj-back-btn"
              onClick={onClose}
              aria-label="Back to batches"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className="bj-header-right-actions">
              <button
                type="button"
                className="bj-demo-btn"
                onClick={() => setIsDemoDrawerOpen(true)}
                title="Jury Simulation Presets"
              >
                <Sliders size={13} />
                <span>Demo</span>
              </button>
              <button
                type="button"
                className="bj-close-btn"
                onClick={onClose}
                aria-label="Close honey journey"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="bj-header-title-row">
            <div>
              <h1 className="bj-title">Honey journey</h1>
              <p className="bj-subtitle">
                {batch.name}
              </p>
              <span className="bj-batch-code-tag">
                {batch.batchNumber} · {batch.weightKg} kg net yield
              </span>
            </div>

            <div className={`bj-status-badge ${journeyConfig.statusType}`}>
              <span className="bj-status-dot" />
              <span>{journeyConfig.statusLabel}</span>
            </div>
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            SCROLLABLE MAIN CONTENT BODY
        ───────────────────────────────────────────────────────────── */}
        <div className="bj-body-scroll">
          {/* VERIFIED SUMMARY BANNER IF COMPLETE (§ 22 & 23) */}
          {journeyConfig.currentStageIndex >= 5 && (
            <div className="bj-verified-banner">
              <div className="bj-verified-icon">
                <ShieldCheck size={22} color="#4F7A52" />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '14px', color: '#1B331D', display: 'block' }}>
                  Verified Honey Origin
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#4F7A52', lineHeight: 1.4 }}>
                  This batch has completed the configured traceability and quality workflow. Cryptographic seal permanently secured.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary bj-qr-pill-btn"
                onClick={() => {
                  if (openProductQrManagement) {
                    openProductQrManagement({ batchId: batch.id });
                  } else {
                    openSheet('verify-batch', { batch });
                  }
                }}
              >
                <QrCode size={14} />
                <span>Product QR</span>
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              2. VISUAL JOURNEY HERO TIMELINE (Section 6 & 7)
          ───────────────────────────────────────────────────────────── */}
          <section className="bj-hero-card">
            <div className="bj-hero-head">
              <span className="bj-hero-kicker">END-TO-END TRACEABILITY STORY</span>
              <span className="bj-hero-stage-chip">
                Stage {journeyConfig.currentStageIndex + 1} of 6
              </span>
            </div>

            {/* Vertical Journey Progression Stepper */}
            <div className="bj-vertical-journey">
              {/* STAGE 1: HIVE */}
              <div className="bj-vstep completed">
                <div className="bj-vmarker">
                  <div className="bj-vnode done"><Check size={12} strokeWidth={3} /></div>
                  <div className="bj-vline done" />
                </div>
                <div
                  className={`bj-vcontent ${expandedStage === 'hive' ? 'expanded' : ''}`}
                  onClick={() => setExpandedStage(expandedStage === 'hive' ? '' : 'hive')}
                >
                  <div className="bj-vhead">
                    <div>
                      <strong className="bj-vtitle">1. Source Colony</strong>
                      <span className="bj-vmeta">Hive 01 (Cedar Queen) · Meadowbrook Apiary</span>
                    </div>
                    <span className="bj-vtoggle">{expandedStage === 'hive' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
                  </div>

                  {expandedStage === 'hive' && (
                    <div className="bj-vdetails animate-fade-in">
                      <p className="bj-vdesc">
                        Colony in healthy laying pattern. Last morning inspection noted calm temperament and 8 capped super frames.
                      </p>
                      <div className="bj-vaction-row">
                        <button
                          type="button"
                          className="btn btn-secondary bj-vsub-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHiveId('hive-01');
                            setActiveTab('hives');
                            onClose();
                          }}
                        >
                          <span>View hive detail</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* STAGE 2: COLLECTION */}
              <div className="bj-vstep completed">
                <div className="bj-vmarker">
                  <div className="bj-vnode done"><Check size={12} strokeWidth={3} /></div>
                  <div className="bj-vline done" />
                </div>
                <div
                  className={`bj-vcontent ${expandedStage === 'collection' ? 'expanded' : ''}`}
                  onClick={() => setExpandedStage(expandedStage === 'collection' ? '' : 'collection')}
                >
                  <div className="bj-vhead">
                    <div>
                      <strong className="bj-vtitle">2. Apiary Collection</strong>
                      <span className="bj-vmeta">25 Sep 2026 · 08:35 AM · 18.5 kg harvested</span>
                    </div>
                    <span className="bj-vtoggle">{expandedStage === 'collection' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
                  </div>

                  {expandedStage === 'collection' && (
                    <div className="bj-vdetails animate-fade-in">
                      <p className="bj-vdesc">
                        Cold extracted from capped frames by Sarah Lindqvist. Amber body with rich wildflower floral bouquet.
                      </p>
                      <div className="bj-vaction-row">
                        <button
                          type="button"
                          className="btn btn-secondary bj-vsub-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openCollectionDetails) {
                              openCollectionDetails({ collectionId: batch.collectionId || 'col-2026-0925-01' });
                            }
                          }}
                        >
                          <FileText size={13} />
                          <span>View collection record</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* STAGE 3: PROCESSING */}
              <div className={`bj-vstep ${journeyConfig.currentStageIndex >= 2 ? 'completed' : 'active'}`}>
                <div className="bj-vmarker">
                  <div className={`bj-vnode ${journeyConfig.currentStageIndex > 2 ? 'done' : 'active'}`}>
                    {journeyConfig.currentStageIndex > 2 ? <Check size={12} strokeWidth={3} /> : '●'}
                  </div>
                  <div className={`bj-vline ${journeyConfig.currentStageIndex > 2 ? 'done' : ''}`} />
                </div>
                <div
                  className={`bj-vcontent ${expandedStage === 'processing' ? 'expanded' : ''}`}
                  onClick={() => setExpandedStage(expandedStage === 'processing' ? '' : 'processing')}
                >
                  <div className="bj-vhead">
                    <div>
                      <strong className="bj-vtitle">3. Extraction & Filtering</strong>
                      <span className="bj-vmeta">Settled at 20°C in Tank #2 · Net 18.2 kg</span>
                    </div>
                    <span className="bj-vtoggle">{expandedStage === 'processing' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
                  </div>

                  {expandedStage === 'processing' && (
                    <div className="bj-vdetails animate-fade-in">
                      <div className="bj-vkv-grid">
                        <div>
                          <span className="bj-vkicker">PROCESSING METHOD</span>
                          <span className="bj-vval">Centrifugal cold extraction</span>
                        </div>
                        <div>
                          <span className="bj-vkicker">FILTER MESH</span>
                          <span className="bj-vval">300 µm stainless steel</span>
                        </div>
                        <div>
                          <span className="bj-vkicker">LOCATION</span>
                          <span className="bj-vval">Honey House #2</span>
                        </div>
                        <div>
                          <span className="bj-vkicker">OPERATOR</span>
                          <span className="bj-vval">Marcus K.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* STAGE 4: QUALITY */}
              <div className={`bj-vstep ${journeyConfig.currentStageIndex > 3 ? 'completed' : journeyConfig.currentStageIndex === 3 ? 'active' : 'upcoming'}`}>
                <div className="bj-vmarker">
                  <div className={`bj-vnode ${journeyConfig.currentStageIndex > 3 ? 'done' : journeyConfig.currentStageIndex === 3 ? 'active' : 'upcoming'}`}>
                    {journeyConfig.currentStageIndex > 3 ? <Check size={12} strokeWidth={3} /> : journeyConfig.currentStageIndex === 3 ? '●' : '○'}
                  </div>
                  <div className={`bj-vline ${journeyConfig.currentStageIndex > 3 ? 'done' : ''}`} />
                </div>
                <div
                  className={`bj-vcontent ${expandedStage === 'quality' ? 'expanded' : ''}`}
                  onClick={() => setExpandedStage(expandedStage === 'quality' ? '' : 'quality')}
                >
                  <div className="bj-vhead">
                    <div>
                      <strong className="bj-vtitle">4. Certified Quality Analysis</strong>
                      <span className="bj-vmeta">
                        {journeyConfig.currentStageIndex > 3
                          ? '✓ Passed · Moisture 17.8% · HMF 12.4 mg/kg'
                          : journeyConfig.currentStageIndex === 3
                          ? 'Testing in progress · Refractometry active'
                          : 'Awaiting lab testing'}
                      </span>
                    </div>
                    <span className="bj-vtoggle">{expandedStage === 'quality' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
                  </div>

                  {expandedStage === 'quality' && (
                    <div className="bj-vdetails animate-fade-in">
                      <div className="bj-quality-micro-summary">
                        <div className="bj-qpill passed">
                          <Check size={11} />
                          <span>Moisture: 17.8% (Pass)</span>
                        </div>
                        <div className="bj-qpill passed">
                          <Check size={11} />
                          <span>Purity: Clean Amber (Pass)</span>
                        </div>
                        <div className="bj-qpill passed">
                          <Check size={11} />
                          <span>HMF: 12.4 mg/kg (Pass)</span>
                        </div>
                        <div className="bj-qpill passed">
                          <Check size={11} />
                          <span>Diastase: 14.8 DN (Pass)</span>
                        </div>
                      </div>

                      <div className="bj-vaction-row" style={{ marginTop: '10px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary bj-vsub-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openQualityCheck) {
                              openQualityCheck({ batchId: batch.id });
                            }
                          }}
                        >
                          <FileCheck size={13} />
                          <span>View full quality workflow</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* STAGE 5: PACKAGING */}
              <div className={`bj-vstep ${journeyConfig.currentStageIndex > 4 ? 'completed' : journeyConfig.currentStageIndex === 4 ? 'active' : 'upcoming'}`}>
                <div className="bj-vmarker">
                  <div className={`bj-vnode ${journeyConfig.currentStageIndex > 4 ? 'done' : journeyConfig.currentStageIndex === 4 ? 'active' : 'upcoming'}`}>
                    {journeyConfig.currentStageIndex > 4 ? <Check size={12} strokeWidth={3} /> : journeyConfig.currentStageIndex === 4 ? '●' : '○'}
                  </div>
                  <div className={`bj-vline ${journeyConfig.currentStageIndex > 4 ? 'done' : ''}`} />
                </div>
                <div
                  className={`bj-vcontent ${expandedStage === 'packaging' ? 'expanded' : ''}`}
                  onClick={() => setExpandedStage(expandedStage === 'packaging' ? '' : 'packaging')}
                >
                  <div className="bj-vhead">
                    <div>
                      <strong className="bj-vtitle">5. Packaging & Tamper Sealing</strong>
                      <span className="bj-vmeta">
                        {journeyConfig.currentStageIndex >= 4
                          ? '37 jars (500g Glass) · Lot HC-2409-P01'
                          : 'Pending quality sign-off'}
                      </span>
                    </div>
                    <span className="bj-vtoggle">{expandedStage === 'packaging' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
                  </div>

                  {expandedStage === 'packaging' && (
                    <div className="bj-vdetails animate-fade-in">
                      <div className="bj-vkv-grid">
                        <div>
                          <span className="bj-vkicker">CONTAINER</span>
                          <span className="bj-vval">500g Glass Hexagonal</span>
                        </div>
                        <div>
                          <span className="bj-vkicker">TOTAL LOT SIZE</span>
                          <span className="bj-vval">37 Units</span>
                        </div>
                        <div>
                          <span className="bj-vkicker">LOT IDENTIFIER</span>
                          <span className="bj-vval mono">Lot HC-2409-P01</span>
                        </div>
                        <div>
                          <span className="bj-vkicker">TAMPER SEAL</span>
                          <span className="bj-vval">NFC / QR Seal Applied</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* STAGE 6: VERIFIED */}
              <div className={`bj-vstep ${journeyConfig.currentStageIndex >= 5 ? 'completed' : 'upcoming'}`}>
                <div className="bj-vmarker">
                  <div className={`bj-vnode ${journeyConfig.currentStageIndex >= 5 ? 'done' : 'upcoming'}`}>
                    {journeyConfig.currentStageIndex >= 5 ? <Check size={12} strokeWidth={3} /> : '○'}
                  </div>
                </div>
                <div
                  className={`bj-vcontent ${expandedStage === 'verified' ? 'expanded' : ''}`}
                  onClick={() => setExpandedStage(expandedStage === 'verified' ? '' : 'verified')}
                >
                  <div className="bj-vhead">
                    <div>
                      <strong className="bj-vtitle">6. Origin Verified & Sealed</strong>
                      <span className="bj-vmeta">
                        {journeyConfig.currentStageIndex >= 5
                          ? 'Certified on HoneyChain immutable ledger'
                          : 'Pending final packaging'}
                      </span>
                    </div>
                    <span className="bj-vtoggle">{expandedStage === 'verified' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
                  </div>

                  {expandedStage === 'verified' && (
                    <div className="bj-vdetails animate-fade-in">
                      <p className="bj-vdesc">
                        This batch has completed the configured traceability and quality workflow. Consumers can verify harvest origin via the tamper-evident QR seal.
                      </p>
                      <div className="bj-vaction-row">
                        <button
                          type="button"
                          className="btn btn-secondary bj-vsub-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSheet('verify-batch', { batch });
                          }}
                        >
                          <QrCode size={13} />
                          <span>View consumer verification preview</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              3. "WHAT HAPPENED?" HUMAN ACTIVITY TIMELINE (§ 25 - 28)
          ───────────────────────────────────────────────────────────── */}
          <section className="bj-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Activity size={16} color="#B87316" />
              <strong style={{ fontSize: '14px', color: '#34261B' }}>Activity history</strong>
            </div>

            <div className="bj-activity-list">
              <div className="bj-act-item">
                <div className="bj-act-dot" />
                <div>
                  <div className="bj-act-head">
                    <strong>Quality review completed</strong>
                    <span>Today · 11:30 AM</span>
                  </div>
                  <p className="bj-act-sub">Passed refractometer moisture & Winkler HMF criteria</p>
                  <span className="bj-act-author">By Elena Vance (Quality Lead)</span>
                </div>
              </div>

              <div className="bj-act-item">
                <div className="bj-act-dot" />
                <div>
                  <div className="bj-act-head">
                    <strong>Sample Q-1042 registered</strong>
                    <span>Today · 09:40 AM</span>
                  </div>
                  <p className="bj-act-sub">250 ml composite sample drawn from maturation tank #2</p>
                  <span className="bj-act-author">By Elena Vance</span>
                </div>
              </div>

              <div className="bj-act-item">
                <div className="bj-act-dot" />
                <div>
                  <div className="bj-act-head">
                    <strong>Centrifugal extraction started</strong>
                    <span>Today · 09:15 AM</span>
                  </div>
                  <p className="bj-act-sub">Unheated cold centrifugation & dual 300 µm filtration</p>
                  <span className="bj-act-author">By Marcus K.</span>
                </div>
              </div>

              <div className="bj-act-item">
                <div className="bj-act-dot" />
                <div>
                  <div className="bj-act-head">
                    <strong>Honey collected</strong>
                    <span>Today · 08:35 AM</span>
                  </div>
                  <p className="bj-act-sub">18.5 kg harvested from Hive 01 (Cedar Queen)</p>
                  <span className="bj-act-author">By Sarah Lindqvist</span>
                </div>
              </div>

              <div className="bj-act-item">
                <div className="bj-act-dot" />
                <div>
                  <div className="bj-act-head">
                    <strong>Morning brood inspection</strong>
                    <span>Today · 08:30 AM</span>
                  </div>
                  <p className="bj-act-sub">Brood concentric, calm worker activity, 8 capped frames</p>
                  <span className="bj-act-author">By Sarah Lindqvist</span>
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              4. TRACEABILITY & PROGRESSIVE BLOCKCHAIN PROOF (§ 31 - 34)
          ───────────────────────────────────────────────────────────── */}
          <div className="bj-tech-accordion">
            <button
              type="button"
              className="bj-tech-toggle-btn"
              onClick={() => setIsTechProofOpen(!isTechProofOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={15} color="#786D61" />
                <span>{isTechProofOpen ? 'Hide technical proof' : 'View technical proof'}</span>
              </div>
              <ChevronRight
                size={14}
                style={{
                  transform: isTechProofOpen ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.15s ease'
                }}
              />
            </button>

            {isTechProofOpen && (
              <div className="bj-card bj-tech-card animate-fade-in">
                <div className="bj-tech-row">
                  <span className="bj-tlabel">PROOF STATUS</span>
                  <span className="bj-tval" style={{ color: '#4F7A52', fontWeight: 700 }}>
                    Cryptographically Anchored
                  </span>
                </div>
                <div className="bj-tech-row">
                  <span className="bj-tlabel">LEDGER NETWORK</span>
                  <span className="bj-tval">{batch.blockchain?.network || 'HoneyChain Ledger'}</span>
                </div>
                <div className="bj-tech-row">
                  <span className="bj-tlabel">MERKLE ROOT HASH</span>
                  <span className="bj-tval mono truncate">
                    {batch.blockchain?.merkleRoot || '0x3f9801a4e5bc1209e86d23fb482b9a710255'}
                  </span>
                </div>
                <div className="bj-tech-row">
                  <span className="bj-tlabel">TRANSACTION HASH</span>
                  <span className="bj-tval mono truncate">
                    {batch.blockchain?.txHash || '0xd942b87f619e083a21dc49019b841e2a537f'}
                  </span>
                </div>
                <div className="bj-tech-row">
                  <span className="bj-tlabel">ORIGIN SEAL</span>
                  <span className="bj-tval mono">{batch.sealHash || '0x8b3f912c4189e49120bc...'}</span>
                </div>
                <div className="bj-tech-row">
                  <span className="bj-tlabel">BLOCK NUMBER</span>
                  <span className="bj-tval mono">#54819240</span>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-divider)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      height: '38px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      borderColor: 'var(--color-primary-honey)',
                      color: 'var(--color-deep-cocoa)'
                    }}
                    onClick={() => {
                      openTechnicalProof({
                        batchId: batch.id,
                        scenario: batch.status === 'certified' ? 'confirmed' : 'pending'
                      });
                    }}
                  >
                    <ShieldCheck size={14} color="var(--color-primary-honey)" />
                    <span>View full technical proof screen</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            5. STICKY CURRENT STAGE ACTION BAR (Section 24)
        ───────────────────────────────────────────────────────────── */}
        <footer className="bj-bottom-bar">
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1, height: '46px' }}
            onClick={() => {
              setSelectedBatchId(batch.id);
              setActiveTab('honey');
              onClose();
            }}
          >
            All batches
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{
              flex: 1.6,
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onClick={handlePrimaryAction}
          >
            <span>{journeyConfig.primaryActionText}</span>
            <ChevronRight size={15} />
          </button>
        </footer>

        {/* ─────────────────────────────────────────────────────────────
            6. JURY DEMONSTRATION DRAWER (Section 55)
        ───────────────────────────────────────────────────────────── */}
        {isDemoDrawerOpen && (
          <div className="bj-submodal-overlay" role="dialog" aria-modal="true">
            <div className="bj-submodal-card">
              <div className="bj-submodal-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#B87316" />
                  <strong style={{ fontSize: '15px' }}>Jury Journey Scenarios</strong>
                </div>
                <button
                  type="button"
                  className="bj-close-btn"
                  onClick={() => setIsDemoDrawerOpen(false)}
                >
                  <X size={15} />
                </button>
              </div>

              <p style={{ fontSize: '12.5px', color: '#786D61', margin: '4px 0 12px' }}>
                Demonstrate the progression of honey from hive to verified consumer seal:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  className={`btn btn-secondary ${demoPreset === 'quality_passed' ? 'active-preset' : ''}`}
                  style={{ textAlign: 'left', padding: '10px 12px', height: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}
                  onClick={() => {
                    setDemoPreset('quality_passed');
                    setExpandedStage('packaging');
                    setIsDemoDrawerOpen(false);
                    showToast('Preset: Quality Passed (Stage 4 → Packaging)');
                  }}
                >
                  <strong style={{ fontSize: '13px', color: '#4F7A52' }}>
                    Scenario 1: Quality Passed (Ready for Packaging)
                  </strong>
                  <span style={{ fontSize: '11.5px', color: '#786D61' }}>
                    Hive ✓, Collection ✓, Processing ✓, Quality ✓, Packaging ●.
                  </span>
                </button>

                <button
                  type="button"
                  className={`btn btn-secondary ${demoPreset === 'quality_pending' ? 'active-preset' : ''}`}
                  style={{ textAlign: 'left', padding: '10px 12px', height: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}
                  onClick={() => {
                    setDemoPreset('quality_pending');
                    setExpandedStage('quality');
                    setIsDemoDrawerOpen(false);
                    showToast('Preset: Quality Check in Progress');
                  }}
                >
                  <strong style={{ fontSize: '13px', color: '#1A73E8' }}>
                    Scenario 2: Quality Testing Active
                  </strong>
                  <span style={{ fontSize: '11.5px', color: '#786D61' }}>
                    Hive ✓, Collection ✓, Processing ✓, Quality ●. Direct link to Screen 24.
                  </span>
                </button>

                <button
                  type="button"
                  className={`btn btn-secondary ${demoPreset === 'in_processing' ? 'active-preset' : ''}`}
                  style={{ textAlign: 'left', padding: '10px 12px', height: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}
                  onClick={() => {
                    setDemoPreset('in_processing');
                    setExpandedStage('processing');
                    setIsDemoDrawerOpen(false);
                    showToast('Preset: In Processing (Tank #2)');
                  }}
                >
                  <strong style={{ fontSize: '13px', color: '#B87316' }}>
                    Scenario 3: Active Processing
                  </strong>
                  <span style={{ fontSize: '11.5px', color: '#786D61' }}>
                    Hive ✓, Collection ✓, Processing ● (Settling in maturation tank).
                  </span>
                </button>

                <button
                  type="button"
                  className={`btn btn-secondary ${demoPreset === 'verified' ? 'active-preset' : ''}`}
                  style={{ textAlign: 'left', padding: '10px 12px', height: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}
                  onClick={() => {
                    setDemoPreset('verified');
                    setExpandedStage('verified');
                    setIsDemoDrawerOpen(false);
                    showToast('Preset: Certified & Origin Verified');
                  }}
                >
                  <strong style={{ fontSize: '13px', color: '#4F7A52' }}>
                    Scenario 4: Fully Certified & Consumer QR
                  </strong>
                  <span style={{ fontSize: '11.5px', color: '#786D61' }}>
                    All 6 stages verified and sealed with cryptographic origin certificate.
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          COMPONENT SCOPED CSS STYLING
      ───────────────────────────────────────────────────────────── */}
      <style>{`
        .bj-view-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(52, 38, 27, 0.55);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          animation: bjFadeIn 0.2s ease-out;
        }

        @keyframes bjFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .bj-view-container {
          width: 100%;
          max-width: 520px;
          height: 94vh;
          max-height: 860px;
          background: #FFF9EF;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 -8px 32px rgba(52, 38, 27, 0.16);
          overflow: hidden;
          box-sizing: border-box;
          position: relative;
          animation: bjSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes bjSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        /* Header */
        .bj-header {
          padding: 16px 20px 14px;
          background: #FFFDF8;
          border-bottom: 1px solid #EDE2D1;
          flex-shrink: 0;
        }

        .bj-header-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .bj-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #786D61;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
        }

        .bj-back-btn:hover {
          background: rgba(120, 109, 97, 0.08);
          color: #34261B;
        }

        .bj-header-right-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bj-demo-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(217, 154, 36, 0.1);
          border: 1px solid rgba(217, 154, 36, 0.3);
          color: #B87316;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
        }

        .bj-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(120, 109, 97, 0.08);
          border: none;
          color: #786D61;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .bj-header-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .bj-title {
          font-size: 20px;
          font-weight: 800;
          color: #34261B;
          margin: 0 0 2px 0;
          line-height: 1.25;
        }

        .bj-subtitle {
          font-size: 13px;
          font-weight: 600;
          color: #B87316;
          margin: 0;
          line-height: 1.4;
        }

        .bj-batch-code-tag {
          display: block;
          font-size: 11.5px;
          color: #786D61;
          margin-top: 2px;
        }

        .bj-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }

        .bj-status-badge.verified {
          background-color: #EBF3EA;
          color: #4F7A52;
        }

        .bj-status-badge.packaging {
          background-color: #FEF3D6;
          color: #B87316;
        }

        .bj-status-badge.quality {
          background-color: #E8F0FE;
          color: #1A73E8;
        }

        .bj-status-badge.processing {
          background-color: #FEF3D6;
          color: #D9822B;
        }

        .bj-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Body Scroll */
        .bj-body-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          box-sizing: border-box;
          -webkit-overflow-scrolling: touch;
        }

        .bj-verified-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background-color: #F0F7EF;
          border: 1px solid #C8E3C5;
          border-radius: 14px;
          margin-bottom: 14px;
        }

        .bj-qr-pill-btn {
          height: 32px;
          padding: 0 10px;
          font-size: 11.5px;
          gap: 4px;
          flex-shrink: 0;
          background: #FFFFFF;
          border-color: #A3D4A0;
          color: #2F6333;
        }

        /* Hero Card */
        .bj-hero-card {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 14px;
        }

        .bj-hero-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 1px solid #EDE2D1;
        }

        .bj-hero-kicker {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #786D61;
        }

        .bj-hero-stage-chip {
          font-size: 11px;
          font-weight: 700;
          color: #B87316;
          background: rgba(217, 154, 36, 0.12);
          padding: 2px 8px;
          border-radius: 4px;
        }

        /* Vertical Stepper Timeline */
        .bj-vertical-journey {
          display: flex;
          flex-direction: column;
        }

        .bj-vstep {
          display: flex;
          align-items: flex-start;
          position: relative;
        }

        .bj-vmarker {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-right: 12px;
          width: 22px;
          flex-shrink: 0;
        }

        .bj-vnode {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          background: #EFECE6;
          color: #786D61;
          z-index: 2;
        }

        .bj-vnode.done {
          background-color: #EBF3EA;
          color: #4F7A52;
        }

        .bj-vnode.active {
          background-color: #FEF3D6;
          color: #B87316;
          box-shadow: 0 0 0 2px rgba(217, 154, 36, 0.25);
        }

        .bj-vline {
          width: 2px;
          height: 100%;
          min-height: 38px;
          background: #EDE2D1;
          margin: 2px 0;
        }

        .bj-vline.done {
          background-color: #4F7A52;
        }

        .bj-vcontent {
          flex: 1;
          background: #FAF6ED;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 10px 12px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .bj-vcontent:hover {
          background: #F5EFE3;
        }

        .bj-vcontent.expanded {
          background: #FFFDF8;
          border-color: #D99A24;
        }

        .bj-vhead {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 6px;
        }

        .bj-vtitle {
          font-size: 13px;
          color: #34261B;
          display: block;
        }

        .bj-vmeta {
          font-size: 11.5px;
          color: #786D61;
          display: block;
          margin-top: 1px;
        }

        .bj-vtoggle {
          color: #786D61;
          margin-top: 2px;
        }

        .bj-vdetails {
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px dashed #EDE2D1;
        }

        .bj-vdesc {
          font-size: 12px;
          color: #34261B;
          line-height: 1.4;
          margin: 0 0 8px 0;
        }

        .bj-vaction-row {
          display: flex;
          gap: 8px;
        }

        .bj-vsub-btn {
          height: 30px;
          font-size: 11.5px;
          padding: 0 10px;
          gap: 4px;
        }

        .bj-vkv-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px 10px;
          margin-bottom: 8px;
        }

        .bj-vkicker {
          font-size: 9.5px;
          text-transform: uppercase;
          color: #786D61;
          display: block;
        }

        .bj-vval {
          font-size: 12px;
          font-weight: 700;
          color: #34261B;
          display: block;
        }

        .bj-vval.mono {
          font-family: monospace;
          font-size: 11px;
        }

        .bj-quality-micro-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .bj-qpill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .bj-qpill.passed {
          background-color: #EBF3EA;
          color: #4F7A52;
          font-weight: 600;
        }

        /* Generic Card */
        .bj-card {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 14px;
        }

        /* Activity List */
        .bj-activity-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .bj-act-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding-bottom: 8px;
          border-bottom: 1px dashed #EDE2D1;
        }

        .bj-act-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .bj-act-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #D99A24;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .bj-act-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 12.5px;
          color: #34261B;
        }

        .bj-act-head span {
          font-size: 11px;
          color: #786D61;
        }

        .bj-act-sub {
          font-size: 11.5px;
          color: #786D61;
          margin: 1px 0 2px 0;
        }

        .bj-act-author {
          font-size: 10.5px;
          color: #B87316;
          display: block;
        }

        /* Technical Proof Accordion */
        .bj-tech-accordion {
          margin-bottom: 14px;
        }

        .bj-tech-toggle-btn {
          width: 100%;
          background: transparent;
          border: 1px dashed #EDE2D1;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 12.5px;
          font-weight: 700;
          color: #786D61;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        .bj-tech-toggle-btn:hover {
          border-color: #D99A24;
          color: #34261B;
        }

        .bj-tech-card {
          margin-top: 8px;
          font-size: 11.5px;
        }

        .bj-tech-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #EDE2D1;
        }

        .bj-tech-row:last-child {
          border-bottom: none;
        }

        .bj-tlabel {
          color: #786D61;
        }

        .bj-tval {
          font-weight: 600;
          color: #34261B;
        }

        .bj-tval.mono {
          font-family: monospace;
          font-size: 11px;
        }

        .bj-tval.truncate {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Footer */
        .bj-bottom-bar {
          padding: 14px 20px 18px;
          background: #FFFDF8;
          border-top: 1px solid #EDE2D1;
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        /* Submodal styles */
        .bj-submodal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(52, 38, 27, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 10;
        }

        .bj-submodal-card {
          width: 100%;
          max-width: 440px;
          background: #FFFDF8;
          border-radius: 16px;
          padding: 18px 20px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
        }

        .bj-submodal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 15px;
          color: #34261B;
          margin-bottom: 10px;
        }

        .active-preset {
          border-color: #D99A24 !important;
          background-color: #FEF3D6 !important;
        }
      `}</style>
    </div>,
    document.querySelector('.app-viewport') || document.body
  );
};
