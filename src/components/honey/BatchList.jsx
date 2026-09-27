import React, { useState, useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Droplets,
  PlusCircle,
  Search,
  Sliders,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  FileText,
  ShieldCheck,
  Check,
  X,
  FileCheck,
  Eye,
  Filter,
  WifiOff,
  RefreshCw,
  QrCode
} from 'lucide-react';

/**
 * SCREEN 21 — HONEY HOME
 * 
 * Master UI/UX + Honey Journey + Batch Traceability
 * The entry point for the complete honey journey:
 * Hive → Collection → Processing → Quality → Packaging → Verified
 * 
 * Answers: "What is happening with my honey right now?"
 * Human workflow first — no raw blockchain or technical clutter.
 */

// Standard Honey Journey Stages (Section 8, 9, 42)
export const HONEY_JOURNEY_STAGES = [
  { key: 'hive', label: 'Hive', short: 'Hive' },
  { key: 'collection', label: 'Collection', short: 'Collect' },
  { key: 'processing', label: 'Processing', short: 'Process' },
  { key: 'quality', label: 'Quality', short: 'Quality' },
  { key: 'packaging', label: 'Packaging', short: 'Package' },
  { key: 'verified', label: 'Verified', short: 'Verified' }
];

export const BatchList = () => {
  const {
    batches,
    setSelectedBatchId,
    openSheet,
    accessProfile,
    canPerform,
    ACTION_PERMISSIONS,
    isOnline,
    showToast,
    openBatchJourney
  } = useAppState();

  // Permission check for creating a honey batch (Section 6 & 37)
  const canCreateBatch = canPerform
    ? canPerform(ACTION_PERMISSIONS?.BATCH_CREATE || 'BATCH_CREATE')
    : accessProfile?.moduleIds?.includes('honey_batches') || true;

  // Search & Filter State (Section 20)
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStageFilter, setActiveStageFilter] = useState('ALL'); // 'ALL' | 'COLLECTED' | 'PROCESSING' | 'QUALITY' | 'PACKAGING' | 'VERIFIED' | 'ATTENTION'
  const [activeRoleView, setActiveRoleView] = useState('ALL'); // 'ALL' | 'BEEKEEPER' | 'PROCESSOR' | 'QUALITY'
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);
  const [forceEmptyState, setForceEmptyState] = useState(false);

  // Helper to map batch status to journey progress (Section 13 & 14)
  const resolveBatchProgress = (batch) => {
    // Determine current stage index (0 to 5)
    // 0: hive, 1: collection, 2: processing, 3: quality, 4: packaging, 5: verified
    if (batch.status === 'certified' || batch.status === 'verified') return 5;
    if (batch.status === 'bottled' || batch.status === 'packaging') return 4;
    if (batch.status === 'quality' || batch.statusLabel?.toLowerCase().includes('quality')) return 3;
    if (batch.status === 'curing' || batch.status === 'processing') return 2;
    if (batch.status === 'collected' || batch.status === 'harvest') return 1;
    return 2;
  };

  const resolveStageDetails = (batch) => {
    const step = resolveBatchProgress(batch);
    if (step >= 5) {
      return {
        stageName: 'Verified',
        pillClass: 'verified',
        desc: 'Certified on immutable ledger',
        isComplete: true
      };
    }
    if (step === 4) {
      return {
        stageName: 'Packaging',
        pillClass: 'packaging',
        desc: 'Tamper-evident bottling in progress',
        isComplete: false
      };
    }
    if (step === 3) {
      return {
        stageName: 'Quality check',
        pillClass: 'quality',
        desc: 'Digital refractometry & purity check',
        isComplete: false
      };
    }
    if (step === 2) {
      return {
        stageName: 'Processing',
        pillClass: 'processing',
        desc: batch.statusLabel || 'Centrifugal settling & clarification',
        isComplete: false
      };
    }
    return {
      stageName: 'Collection',
      pillClass: 'collection',
      desc: 'Harvested from apiary supers',
      isComplete: false
    };
  };

  // Enriched batches with stage properties
  const enrichedBatches = useMemo(() => {
    if (forceEmptyState) return [];

    return batches.map((b) => {
      const step = resolveBatchProgress(b);
      const stageInfo = resolveStageDetails(b);
      // Mark HB-2026-09 as needing attention for demo / testing if in curing
      const needsAttn = b.id === 'batch-hb-2026-09' || b.needsAttention;
      const attnReason = needsAttn
        ? 'Refractometer moisture verification is waiting for review.'
        : null;

      return {
        ...b,
        progressStep: step,
        stageName: stageInfo.stageName,
        pillClass: stageInfo.pillClass,
        stageDesc: stageInfo.desc,
        isVerified: step >= 5,
        needsAttention: needsAttn,
        attentionReason: attnReason,
        updatedText: b.id === 'batch-hb-2026-09' ? 'Updated today · 10:15 am' : 'Updated 18 Sep 2026'
      };
    });
  }, [batches, forceEmptyState]);

  // Stage Counts for horizontal summary (Section 7)
  const stageCounts = useMemo(() => {
    const counts = {
      ALL: enrichedBatches.length,
      COLLECTION: 0,
      PROCESSING: 0,
      QUALITY: 0,
      PACKAGING: 0,
      VERIFIED: 0,
      ATTENTION: 0
    };

    enrichedBatches.forEach((b) => {
      if (b.needsAttention) counts.ATTENTION++;
      if (b.progressStep === 1) counts.COLLECTION++;
      if (b.progressStep === 2) counts.PROCESSING++;
      if (b.progressStep === 3) counts.QUALITY++;
      if (b.progressStep === 4) counts.PACKAGING++;
      if (b.progressStep >= 5) counts.VERIFIED++;
    });

    return counts;
  }, [enrichedBatches]);

  // Filtered batches
  const filteredBatches = useMemo(() => {
    return enrichedBatches.filter((b) => {
      // Role View filtering (Section 4 & 37)
      if (activeRoleView === 'BEEKEEPER') {
        // Beekeeper focuses on harvest collection and origin
        if (b.progressStep > 3 && !b.sourceHives.length) return false;
      } else if (activeRoleView === 'PROCESSOR') {
        // Processor focuses on processing and settling
        if (b.progressStep < 2 || b.progressStep >= 5) return false;
      } else if (activeRoleView === 'QUALITY') {
        // Quality focuses on testing and verification
        if (b.progressStep !== 3 && !b.needsAttention) return false;
      }

      // Stage Filter
      if (activeStageFilter === 'COLLECTION' && b.progressStep !== 1) return false;
      if (activeStageFilter === 'PROCESSING' && b.progressStep !== 2) return false;
      if (activeStageFilter === 'QUALITY' && b.progressStep !== 3) return false;
      if (activeStageFilter === 'PACKAGING' && b.progressStep !== 4) return false;
      if (activeStageFilter === 'VERIFIED' && b.progressStep < 5) return false;
      if (activeStageFilter === 'ATTENTION' && !b.needsAttention) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.name?.toLowerCase().includes(q);
        const matchesNumber = b.batchNumber?.toLowerCase().includes(q);
        const matchesSources = b.sourceHives?.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesNumber && !matchesSources) return false;
      }

      return true;
    });
  }, [enrichedBatches, activeStageFilter, activeRoleView, searchQuery]);

  // Distinct groups: In-Progress / Active vs Recently Verified (Section 10 & 19)
  const activeBatches = useMemo(() => {
    return filteredBatches.filter((b) => !b.isVerified);
  }, [filteredBatches]);

  const verifiedBatches = useMemo(() => {
    return filteredBatches.filter((b) => b.isVerified);
  }, [filteredBatches]);

  // Priority "Continue where you left off" batch (Section 15)
  const continueBatch = useMemo(() => {
    return enrichedBatches.find((b) => !b.isVerified && !b.needsAttention) || null;
  }, [enrichedBatches]);

  // Priority "Needs attention" batch (Section 16)
  const attentionBatch = useMemo(() => {
    return enrichedBatches.find((b) => b.needsAttention) || null;
  }, [enrichedBatches]);

  return (
    <div className="honey-home-view animate-fade-in">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER (Section 5)
      ───────────────────────────────────────────────────────────── */}
      <header className="hh-header">
        <div className="hh-header-left">
          <h1 className="hh-title">Your honey</h1>
          <p className="hh-subtitle">
            Follow each batch from collection to verified product.
          </p>
          <div className="hh-context-row">
            <span className="hh-badge-count">{enrichedBatches.length} total batches</span>
            <span className="hh-dot-sep">•</span>
            <span className="hh-stale-time">Updated 5 min ago</span>
          </div>
        </div>

        <button
          type="button"
          className="hh-demo-toggle-btn"
          onClick={() => setIsDemoDrawerOpen(!isDemoDrawerOpen)}
          title="Open Screen 21 demonstration drawer"
        >
          <Sliders size={15} />
          <span>Demo</span>
        </button>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. PRIMARY ACTION (Section 6 & 22)
          "Create honey batch" placed prominently near the top
      ───────────────────────────────────────────────────────────── */}
      {canCreateBatch && (
        <section className="hh-primary-action-wrap">
          <button
            type="button"
            className="btn btn-honey hh-create-batch-btn"
            onClick={() => openSheet('create-batch')}
          >
            <PlusCircle size={18} strokeWidth={2.2} />
            <span>Create honey batch</span>
          </button>
        </section>
      )}

      {/* Offline sync note if disconnected (Section 43) */}
      {!isOnline && (
        <div className="hh-offline-bar">
          <WifiOff size={14} />
          <span>Showing latest saved records • Offline queue active</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH & QUICK STAGE FILTER (Section 7 & 20)
      ───────────────────────────────────────────────────────────── */}
      {enrichedBatches.length > 0 && (
        <section className="hh-search-filters-wrap">
          <div className="hh-search-box">
            <Search size={15} color="var(--color-warm-gray, #786D61)" />
            <input
              type="text"
              className="hh-search-input"
              placeholder="Search batches, IDs, or hives…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="hh-clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Compact Horizontal Quick Status Pills (Section 7) */}
          <div className="hh-filter-pills-row" role="tablist">
            <button
              type="button"
              className={`hh-pill ${activeStageFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveStageFilter('ALL')}
            >
              <span>All</span>
              <span className="hh-pill-num">{stageCounts.ALL}</span>
            </button>

            {stageCounts.ATTENTION > 0 && (
              <button
                type="button"
                className={`hh-pill attention ${activeStageFilter === 'ATTENTION' ? 'active' : ''}`}
                onClick={() => setActiveStageFilter('ATTENTION')}
              >
                <span>Needs attention</span>
                <span className="hh-pill-num">{stageCounts.ATTENTION}</span>
              </button>
            )}

            <button
              type="button"
              className={`hh-pill ${activeStageFilter === 'PROCESSING' ? 'active' : ''}`}
              onClick={() => setActiveStageFilter('PROCESSING')}
            >
              <span>Processing</span>
              <span className="hh-pill-num">{stageCounts.PROCESSING}</span>
            </button>

            <button
              type="button"
              className={`hh-pill ${activeStageFilter === 'QUALITY' ? 'active' : ''}`}
              onClick={() => setActiveStageFilter('QUALITY')}
            >
              <span>Quality check</span>
              <span className="hh-pill-num">{stageCounts.QUALITY}</span>
            </button>

            <button
              type="button"
              className={`hh-pill ${activeStageFilter === 'VERIFIED' ? 'active' : ''}`}
              onClick={() => setActiveStageFilter('VERIFIED')}
            >
              <span>Verified</span>
              <span className="hh-pill-num">{stageCounts.VERIFIED}</span>
            </button>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. NEEDS ATTENTION CARD (Section 16)
          Only displayed when real operational review is required
      ───────────────────────────────────────────────────────────── */}
      {enrichedBatches.length > 0 && attentionBatch && activeStageFilter !== 'VERIFIED' && (
        <section className="hh-section">
          <div className="hh-card hh-attention-card">
            <div className="hh-attn-header">
              <div className="hh-attn-badge">
                <AlertTriangle size={15} color="#D9822B" />
                <span>Needs attention</span>
              </div>
              <span className="hh-attn-id">{attentionBatch.batchNumber}</span>
            </div>

            <strong className="hh-attn-title">{attentionBatch.name}</strong>
            <p className="hh-attn-desc">{attentionBatch.attentionReason}</p>

            <button
              type="button"
              className="hh-attn-cta-btn"
              onClick={() => setSelectedBatchId(attentionBatch.id)}
            >
              <span>Review batch</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. "CONTINUE WHERE YOU LEFT OFF" (Section 15)
          Prominent but compact card to reduce workflow friction
      ───────────────────────────────────────────────────────────── */}
      {enrichedBatches.length > 0 && continueBatch && !attentionBatch && activeStageFilter === 'ALL' && (
        <section className="hh-section">
          <div className="hh-card hh-continue-card">
            <div className="hh-continue-head">
              <span className="hh-section-kicker">Continue your batch</span>
              <span className="hh-continue-id">{continueBatch.batchNumber}</span>
            </div>

            <div className="hh-continue-body">
              <div>
                <strong className="hh-continue-name">{continueBatch.name}</strong>
                <p className="hh-continue-sub">
                  Current stage: <strong>{continueBatch.stageName}</strong> · Settling in tank #3
                </p>
              </div>

              <button
                type="button"
                className="btn btn-secondary hh-continue-btn"
                onClick={() => setSelectedBatchId(continueBatch.id)}
              >
                <span>View batch details</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. OPERATIONAL OBSERVATION (Section 36)
          Quiet, factual observation callout without technical jargon
      ───────────────────────────────────────────────────────────── */}
      {enrichedBatches.length > 0 && stageCounts.PROCESSING > 0 && activeStageFilter === 'ALL' && (
        <section className="hh-section">
          <div className="hh-insight-box">
            <div className="hh-insight-icon-wrap">
              <FileText size={15} color="var(--color-primary-honey, #D99A24)" />
            </div>
            <div className="hh-insight-content">
              <p className="hh-insight-text">
                <strong>Operational observation:</strong> 1 batch is currently settling and ready for digital refractometer moisture testing before bottling.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. ACTIVE BATCHES LIST (Section 10, 11, 12, 13, 14)
          Primary operational workspace for honey
      ───────────────────────────────────────────────────────────── */}
      {enrichedBatches.length > 0 && (
        <section className="hh-section">
          <div className="hh-section-header">
            <h2 className="hh-section-title">Your active batches</h2>
            <span className="hh-section-count">({activeBatches.length})</span>
          </div>

          {activeBatches.length > 0 ? (
            <div className="hh-batch-stack">
              {activeBatches.map((batch) => {
                const currentStep = batch.progressStep;
                return (
                  <div
                    key={batch.id}
                    className={`hh-card hh-batch-card ${batch.needsAttention ? 'attn' : ''}`}
                    onClick={() => setSelectedBatchId(batch.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open batch ${batch.batchNumber} ${batch.name}`}
                  >
                    {/* Level 1 & Level 2: Name, ID, Stage Badge */}
                    <div className="hh-bcard-top">
                      <div>
                        <span className="hh-batch-id-tag">{batch.batchNumber}</span>
                        <h3 className="hh-batch-name">{batch.name}</h3>
                      </div>

                      <span className={`hh-stage-badge ${batch.pillClass}`}>
                        <span className={`hh-stage-dot ${batch.pillClass}`} />
                        {batch.stageName}
                      </span>
                    </div>

                    {/* Level 3: Source Traceability (Section 12) */}
                    <div className="hh-bcard-source-row">
                      <span className="hh-source-label">Source:</span>
                      <span className="hh-source-val">
                        {batch.sourceHives && batch.sourceHives.length > 0
                          ? batch.sourceHives.join(', ')
                          : 'Hive 01'}
                      </span>
                      <span className="hh-traceable-pill">Traceable</span>
                    </div>

                    {/* Physical metrics row (Section 28) */}
                    <div className="hh-bcard-stats-strip">
                      <div className="hh-stat-col">
                        <span className="hh-stat-kicker">Harvest Yield</span>
                        <strong className="hh-stat-num">{batch.weightKg} kg</strong>
                      </div>
                      <div className="hh-stat-col">
                        <span className="hh-stat-kicker">Moisture</span>
                        <strong className="hh-stat-num" style={{ color: 'var(--color-healthy, #4F7A52)' }}>
                          {batch.moisture}%
                        </strong>
                      </div>
                      <div className="hh-stat-col">
                        <span className="hh-stat-kicker">Packaging</span>
                        <strong className="hh-stat-num">{batch.jarVolume || '500g Glass'}</strong>
                      </div>
                    </div>

                    {/* Level 4: Visual Honey Journey Progression Bar (Section 13 & 14) */}
                    <div className="hh-journey-track-wrap">
                      <span className="hh-journey-track-label">Journey stage:</span>
                      <div className="hh-journey-stepper" aria-label="Honey journey progress">
                        {HONEY_JOURNEY_STAGES.map((stg, sIdx) => {
                          const isDone = sIdx <= currentStep;
                          const isCurrent = sIdx === currentStep;
                          return (
                            <div
                              key={stg.key}
                              className={`hh-step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                              title={`${stg.label}: ${isDone ? 'Completed' : isCurrent ? 'In progress' : 'Upcoming'}`}
                            >
                              <div className="hh-step-node">
                                {isDone && !isCurrent ? (
                                  <Check size={11} strokeWidth={3} />
                                ) : (
                                  <span className="hh-step-dot" />
                                )}
                              </div>
                              <span className="hh-step-text">{stg.short}</span>
                              {sIdx < HONEY_JOURNEY_STAGES.length - 1 && (
                                <div className={`hh-step-line ${sIdx < currentStep ? 'done' : ''}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Level 5: Footer with Last Updated */}
                    <div className="hh-bcard-footer">
                      <span className="hh-bcard-update-time">
                        <Clock size={12} />
                        <span>{batch.updatedText}</span>
                      </span>

                      <button
                        type="button"
                        className="hh-bcard-cta-link"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openBatchJourney) {
                            openBatchJourney({ batchId: batch.id });
                          } else {
                            setSelectedBatchId(batch.id);
                          }
                        }}
                      >
                        <span>View journey</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="hh-empty-card">
              <Droplets size={26} color="var(--color-warm-gray, #786D61)" />
              <h3 className="hh-empty-title">
                {searchQuery ? 'No matching honey batches' : 'No active batches in this filter'}
              </h3>
              <p className="hh-empty-sub">
                {searchQuery
                  ? 'Try searching with another hive code, harvest batch ID, or clear your query.'
                  : 'All honey batches have completed their certified journey or are in other stages.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. RECENTLY VERIFIED SECTION (Section 19)
          Completed batches that achieved verified product status
      ───────────────────────────────────────────────────────────── */}
      {enrichedBatches.length > 0 && verifiedBatches.length > 0 && activeStageFilter !== 'PROCESSING' && activeStageFilter !== 'ATTENTION' && (
        <section className="hh-section">
          <div className="hh-section-header">
            <div>
              <h2 className="hh-section-title">Recently verified</h2>
              <p className="hh-section-sub">Completed batches with immutable origin certificate</p>
            </div>
            <span className="hh-section-count">({verifiedBatches.length})</span>
          </div>

          <div className="hh-verified-stack">
            {verifiedBatches.map((batch) => (
              <div
                key={batch.id}
                className="hh-card hh-verified-card"
                onClick={() => setSelectedBatchId(batch.id)}
                role="button"
                tabIndex={0}
              >
                <div className="hh-vcard-left">
                  <div className="hh-vcard-icon">
                    <ShieldCheck size={20} color="var(--color-healthy, #4F7A52)" />
                  </div>
                  <div>
                    <div className="hh-vcard-head">
                      <span className="hh-batch-id-tag">{batch.batchNumber}</span>
                      <span className="hh-verified-tag">Origin Verified</span>
                    </div>
                    <strong className="hh-vcard-name">{batch.name}</strong>
                    <span className="hh-vcard-meta">
                      {batch.lotJarsCount} sealed jars · Harvested {batch.harvestDate}
                    </span>
                  </div>
                </div>

                <div className="hh-vcard-right">
                  <ChevronRight size={16} color="var(--color-warm-gray, #786D61)" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          EMPTY FIRST-RUN STATE (Section 17 & 18)
      ───────────────────────────────────────────────────────────── */}
      {enrichedBatches.length === 0 && (
        <div className="hh-first-run-empty-card">
          <div className="hh-fre-icon">
            <Droplets size={32} color="var(--color-primary-honey, #D99A24)" />
          </div>
          <h2 className="hh-fre-title">
            {activeRoleView === 'PROCESSOR'
              ? 'Nothing is waiting for processing'
              : 'No batches yet'}
          </h2>
          <p className="hh-fre-sub">
            {activeRoleView === 'PROCESSOR'
              ? 'New batches will appear here when collection is completed.'
              : 'Create your first honey batch to begin tracking its journey from collection to verified product.'}
          </p>
          {canCreateBatch && activeRoleView !== 'PROCESSOR' && (
            <button
              type="button"
              className="btn btn-honey"
              onClick={() => openSheet('create-batch')}
            >
              <PlusCircle size={16} />
              <span>Create honey batch</span>
            </button>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          JURY DEMO DRAWER (Section 48)
      ───────────────────────────────────────────────────────────── */}
      {isDemoDrawerOpen && (
        <div className="hh-demo-drawer animate-fade-in">
          <div className="hh-demo-head">
            <strong>Screen 21 — Honey Home Demonstrator</strong>
            <button
              type="button"
              className="hh-demo-close-btn"
              onClick={() => setIsDemoDrawerOpen(false)}
            >
              ✕
            </button>
          </div>

          <p className="hh-demo-desc">
            Demonstrate role-aware honey workflow perspectives:
          </p>

          <div className="hh-demo-grid">
            <div className="hh-demo-group">
              <span className="hh-demo-group-label">Role Workspace Perspectives:</span>
              <div className="hh-demo-chips">
                <button
                  type="button"
                  data-role-view="ALL"
                  className={`hh-demo-chip ${activeRoleView === 'ALL' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveRoleView('ALL');
                    setForceEmptyState(false);
                    setIsDemoDrawerOpen(false);
                  }}
                >
                  All Operations
                </button>
                <button
                  type="button"
                  data-role-view="PROCESSOR"
                  className={`hh-demo-chip ${activeRoleView === 'PROCESSOR' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveRoleView('PROCESSOR');
                    setForceEmptyState(false);
                    setIsDemoDrawerOpen(false);
                  }}
                >
                  Processor View (Settling)
                </button>
                <button
                  type="button"
                  data-role-view="QUALITY"
                  className={`hh-demo-chip ${activeRoleView === 'QUALITY' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveRoleView('QUALITY');
                    setForceEmptyState(false);
                    setIsDemoDrawerOpen(false);
                  }}
                >
                  Quality Testing View
                </button>
                <button
                  type="button"
                  data-role-view="BEEKEEPER"
                  className={`hh-demo-chip ${activeRoleView === 'BEEKEEPER' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveRoleView('BEEKEEPER');
                    setForceEmptyState(false);
                    setIsDemoDrawerOpen(false);
                  }}
                >
                  Beekeeper View (Harvests)
                </button>
              </div>
            </div>

            <div className="hh-demo-group">
              <span className="hh-demo-group-label">State Simulation:</span>
              <div className="hh-demo-chips">
                <button
                  type="button"
                  className={`hh-demo-chip ${forceEmptyState ? 'active' : ''}`}
                  onClick={() => {
                    setForceEmptyState(!forceEmptyState);
                    setIsDemoDrawerOpen(false);
                  }}
                >
                  {forceEmptyState ? 'Restore Active Batches' : 'Simulate Empty State'}
                </button>
                <button
                  type="button"
                  className="hh-demo-chip"
                  onClick={() => {
                    openSheet('create-batch');
                    setIsDemoDrawerOpen(false);
                  }}
                >
                  Open Create Batch Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STYLES (Strictly conforming to Section 41 color system)
      ───────────────────────────────────────────────────────────── */}
      <style>{`
        .honey-home-view {
          padding: 16px var(--mobile-pad, 16px) 96px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 600px;
          margin: 0 auto;
          color: var(--color-deep-cocoa, #34261B);
        }

        /* Header (Section 5) */
        .hh-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .hh-title {
          font-size: 26px;
          font-weight: 800;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
        }

        .hh-subtitle {
          font-size: 13.5px;
          color: var(--color-warm-gray, #786D61);
          margin: 0 0 6px 0;
          line-height: 1.4;
        }

        .hh-context-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
        }

        .hh-badge-count {
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
        }

        .hh-demo-toggle-btn {
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-warm-gray, #786D61);
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          min-height: 40px;
          flex-shrink: 0;
        }

        /* Primary Action (Section 6) */
        .hh-primary-action-wrap {
          display: flex;
          flex-direction: column;
        }

        .hh-create-batch-btn {
          height: 48px;
          font-size: 14.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(217, 154, 36, 0.2);
        }

        .hh-offline-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #FDF3E7;
          border: 1px solid rgba(217, 130, 43, 0.3);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          color: var(--color-attention, #D9822B);
          font-weight: 500;
        }

        /* Search & Filter (Section 7 & 20) */
        .hh-search-filters-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hh-search-box {
          position: relative;
          display: flex;
          align-items: center;
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 12px;
          padding: 0 12px;
          height: 42px;
        }

        .hh-search-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #34261B);
          margin-left: 8px;
        }

        .hh-search-input::placeholder {
          color: var(--color-warm-gray, #786D61);
          opacity: 0.7;
        }

        .hh-clear-search-btn {
          background: none;
          border: none;
          color: var(--color-warm-gray, #786D61);
          cursor: pointer;
          padding: 4px;
        }

        .hh-filter-pills-row {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .hh-filter-pills-row::-webkit-scrollbar {
          display: none;
        }

        .hh-pill {
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 20px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-warm-gray, #786D61);
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
          min-height: 34px;
        }

        .hh-pill.active {
          background-color: var(--color-deep-cocoa, #34261B);
          border-color: var(--color-deep-cocoa, #34261B);
          color: #FFF;
        }

        .hh-pill.attention {
          color: var(--color-attention, #D9822B);
          border-color: rgba(217, 130, 43, 0.3);
          background-color: #FDF3E7;
        }

        .hh-pill.attention.active {
          background-color: var(--color-attention, #D9822B);
          border-color: var(--color-attention, #D9822B);
          color: #FFF;
        }

        .hh-pill-num {
          font-size: 11px;
          opacity: 0.85;
        }

        /* Generic Cards */
        .hh-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hh-section-header {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .hh-section-title {
          font-size: 16px;
          font-weight: 750;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .hh-section-sub {
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
          margin: 1px 0 0 0;
        }

        .hh-section-count {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-warm-gray, #786D61);
        }

        .hh-card {
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        /* Attention Card (Section 16) */
        .hh-attention-card {
          border-left: 4px solid var(--color-attention, #D9822B);
          gap: 8px;
        }

        .hh-attn-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hh-attn-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-attention, #D9822B);
          letter-spacing: 0.5px;
        }

        .hh-attn-id {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-warm-gray, #786D61);
        }

        .hh-attn-title {
          font-size: 15.5px;
          font-weight: 750;
          margin: 0;
        }

        .hh-attn-desc {
          font-size: 12.5px;
          color: var(--color-warm-gray, #786D61);
          margin: 0;
          line-height: 1.4;
        }

        .hh-attn-cta-btn {
          align-self: flex-start;
          background: none;
          border: none;
          color: var(--color-primary-honey, #D99A24);
          font-size: 12.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          padding: 4px 0;
        }

        /* Continue Card (Section 15) */
        .hh-continue-card {
          background: #FFFDF8;
          border-left: 4px solid var(--color-primary-honey, #D99A24);
          gap: 8px;
        }

        .hh-continue-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hh-section-kicker {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-primary-honey, #D99A24);
        }

        .hh-continue-id {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-warm-gray, #786D61);
        }

        .hh-continue-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .hh-continue-name {
          font-size: 14.5px;
          font-weight: 750;
          display: block;
        }

        .hh-continue-sub {
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
          margin: 2px 0 0 0;
        }

        .hh-continue-btn {
          height: 38px;
          padding: 6px 12px;
          font-size: 12.5px;
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Smart Insight (Section 36) */
        .hh-insight-box {
          background-color: #FAF4E9;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          border: 1px solid var(--color-divider, #EDE2D1);
        }

        .hh-insight-icon-wrap {
          margin-top: 1px;
        }

        .hh-insight-text {
          font-size: 12px;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0;
          line-height: 1.45;
        }

        /* Batch Stack & Card (Section 10 & 11) */
        .hh-batch-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hh-batch-card {
          cursor: pointer;
        }

        .hh-batch-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(52, 38, 27, 0.06);
        }

        .hh-batch-card.attn {
          border-left: 3.5px solid var(--color-attention, #D9822B);
        }

        .hh-bcard-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .hh-batch-id-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          color: var(--color-deep-honey, #B87316);
          background-color: #F8EFE0;
          padding: 2px 7px;
          border-radius: 5px;
          margin-bottom: 4px;
        }

        .hh-batch-name {
          font-size: 16px;
          font-weight: 750;
          margin: 0;
          line-height: 1.3;
        }

        .hh-stage-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 20px;
          flex-shrink: 0;
        }

        .hh-stage-badge.processing {
          background-color: #FDF3E7;
          color: var(--color-deep-honey, #B87316);
          border: 1px solid rgba(217, 154, 36, 0.3);
        }

        .hh-stage-badge.quality {
          background-color: #EFF5ED;
          color: var(--color-sage, #71845B);
          border: 1px solid rgba(113, 132, 91, 0.3);
        }

        .hh-stage-badge.verified {
          background-color: #EBF3EA;
          color: var(--color-healthy, #4F7A52);
          border: 1px solid rgba(79, 122, 82, 0.3);
        }

        .hh-stage-badge.packaging {
          background-color: #FAF4E9;
          color: var(--color-warm-gray, #786D61);
          border: 1px solid var(--color-divider, #EDE2D1);
        }

        .hh-stage-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .hh-stage-dot.processing { background-color: var(--color-primary-honey, #D99A24); }
        .hh-stage-dot.quality { background-color: var(--color-sage, #71845B); }
        .hh-stage-dot.verified { background-color: var(--color-healthy, #4F7A52); }
        .hh-stage-dot.packaging { background-color: var(--color-warm-gray, #786D61); }

        .hh-bcard-source-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
        }

        .hh-source-label {
          font-weight: 500;
        }

        .hh-source-val {
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
        }

        .hh-traceable-pill {
          margin-left: auto;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-healthy, #4F7A52);
          background-color: #EFF5ED;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .hh-bcard-stats-strip {
          display: flex;
          align-items: center;
          background-color: #FAF4E9;
          border-radius: 10px;
          padding: 8px 12px;
          gap: 16px;
        }

        .hh-stat-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .hh-stat-kicker {
          font-size: 9.5px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: var(--color-warm-gray, #786D61);
          font-weight: 600;
        }

        .hh-stat-num {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
        }

        /* Visual Honey Journey Stepper (Section 13 & 14 & 42) */
        .hh-journey-track-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background-color: #FFF;
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 10px;
          padding: 10px 12px;
        }

        .hh-journey-track-label {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: var(--color-warm-gray, #786D61);
        }

        .hh-journey-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .hh-step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          position: relative;
          flex: 1;
        }

        .hh-step-node {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: #FAF4E9;
          border: 1.5px solid var(--color-divider, #EDE2D1);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          color: #FFF;
          transition: all 0.2s ease;
        }

        .hh-step-item.done .hh-step-node {
          background-color: var(--color-healthy, #4F7A52);
          border-color: var(--color-healthy, #4F7A52);
        }

        .hh-step-item.current .hh-step-node {
          background-color: var(--color-primary-honey, #D99A24);
          border-color: var(--color-primary-honey, #D99A24);
          box-shadow: 0 0 0 3px rgba(217, 154, 36, 0.2);
        }

        .hh-step-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #FFF;
        }

        .hh-step-text {
          font-size: 10px;
          font-weight: 600;
          color: var(--color-warm-gray, #786D61);
        }

        .hh-step-item.done .hh-step-text {
          color: var(--color-deep-cocoa, #34261B);
        }

        .hh-step-item.current .hh-step-text {
          color: var(--color-deep-honey, #B87316);
          font-weight: 700;
        }

        .hh-step-line {
          position: absolute;
          top: 9px;
          left: 50%;
          width: 100%;
          height: 2px;
          background-color: var(--color-divider, #EDE2D1);
          z-index: 1;
        }

        .hh-step-line.done {
          background-color: var(--color-healthy, #4F7A52);
        }

        .hh-bcard-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
        }

        .hh-bcard-update-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
        }

        .hh-bcard-cta-link {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 12px;
          font-weight: 700;
          color: var(--color-primary-honey, #D99A24);
        }

        /* Recently Verified (Section 19) */
        .hh-verified-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hh-verified-card {
          padding: 12px 14px;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        .hh-vcard-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hh-vcard-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background-color: #EFF5ED;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hh-vcard-head {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
        }

        .hh-verified-tag {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--color-healthy, #4F7A52);
        }

        .hh-vcard-name {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          display: block;
        }

        .hh-vcard-meta {
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
        }

        /* Empty States (Section 17) */
        .hh-empty-card {
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px dashed var(--color-divider, #EDE2D1);
          border-radius: 14px;
          padding: 28px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .hh-empty-title {
          font-size: 15px;
          font-weight: 700;
          margin: 0;
        }

        .hh-empty-sub {
          font-size: 12.5px;
          color: var(--color-warm-gray, #786D61);
          margin: 0;
          max-width: 320px;
          line-height: 1.4;
        }

        .hh-first-run-empty-card {
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 16px;
          padding: 36px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .hh-fre-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #FAF4E9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hh-fre-title {
          font-size: 18px;
          font-weight: 800;
          margin: 0;
        }

        .hh-fre-sub {
          font-size: 13.5px;
          color: var(--color-warm-gray, #786D61);
          margin: 0 0 8px 0;
          max-width: 320px;
          line-height: 1.45;
        }

        /* Jury Demo Drawer (Section 48) */
        .hh-demo-drawer {
          position: fixed;
          bottom: 60px;
          inset-inline: 16px;
          max-width: 480px;
          margin: 0 auto;
          background-color: var(--color-deep-cocoa, #34261B);
          color: #FFF;
          border-radius: 16px;
          padding: 16px;
          z-index: 1000;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        }

        .hh-demo-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .hh-demo-head strong {
          font-size: 13.5px;
          color: var(--color-primary-honey, #D99A24);
        }

        .hh-demo-close-btn {
          background: none;
          border: none;
          color: #FFF;
          font-size: 15px;
          cursor: pointer;
        }

        .hh-demo-desc {
          font-size: 11.5px;
          color: rgba(255, 255, 255, 0.75);
          margin: 0 0 10px 0;
        }

        .hh-demo-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hh-demo-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .hh-demo-group-label {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: rgba(255, 255, 255, 0.6);
        }

        .hh-demo-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .hh-demo-chip {
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 8px;
          color: #FFF;
          padding: 6px 10px;
          font-size: 11.5px;
          cursor: pointer;
        }

        .hh-demo-chip.active {
          background-color: var(--color-primary-honey, #D99A24);
          border-color: var(--color-primary-honey, #D99A24);
          color: var(--color-deep-cocoa, #34261B);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};
