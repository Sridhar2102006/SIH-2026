import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Camera,
  History,
  Clock,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Check,
  ChevronRight,
  WifiOff,
  CloudOff,
  RotateCcw,
  Layers,
  Thermometer,
  Droplets,
  Activity
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

/**
 * SCREEN 20 — INSPECTION SAVED / HIVE HISTORY UPDATE
 * 
 * Master UI/UX + Data Persistence + Hive Timeline Component
 * Completes: Hive → Capture → Analyze → Result → Save → Hive History
 *
 * Trust + continuity screen: Reassures the beekeeper:
 * "My inspection was successfully recorded and I can find it again later."
 */

export const InspectionSavedView = ({
  isOpen = true,
  onClose,
  savedData
}) => {
  const {
    hives,
    setSelectedHiveId,
    setActiveTab,
    openScanModal,
    openInspectionResult,
    isOnline,
    showToast
  } = useAppState();

  // Resolve associated hive
  const currentHive = useMemo(() => {
    if (!savedData?.hiveId && !savedData?.hive) {
      return hives[0] || {
        id: 'hive-02',
        name: 'Meadow Sweet',
        code: '02',
        status: 'attention',
        temp: 33.9,
        humidity: 62
      };
    }
    return (
      savedData.hive ||
      hives.find((h) => h.id === savedData.hiveId) ||
      hives[0]
    );
  }, [savedData, hives]);

  // Saved Inspection Attributes
  const [activeImage, setActiveImage] = useState(
    savedData?.imageUrl ||
    savedData?.activeImage ||
    currentHive?.inspectionImage ||
    '/hive-inspection-sample.jpg'
  );

  const [activePreset, setActivePreset] = useState(
    savedData?.preset ||
    (savedData?.isConcerning ? 'ATTENTION' : 'HEALTHY')
  );

  const [observerNote, setObserverNote] = useState(
    savedData?.observerNote ||
    savedData?.observerNotes ||
    'Observed slight brood irregularity in frame center. Queen is active and marked with green dot.'
  );

  const [isOfflineMode, setIsOfflineMode] = useState(!isOnline || Boolean(savedData?.isOffline));
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [showJuryDrawer, setShowJuryDrawer] = useState(false);

  // Derived condition and status details
  const isAttention = activePreset === 'ATTENTION';
  const isUnclear = activePreset === 'UNCLEAR';
  const isHealthy = activePreset === 'HEALTHY';

  const conditionTitle = isAttention
    ? 'Possible American foulbrood signs'
    : isUnclear
    ? 'Insufficient focal clarity or lighting'
    : 'Healthy brood pattern';

  const resultTag = isAttention
    ? 'Possible signs detected'
    : isUnclear
    ? 'Image needs another look'
    : 'No concerning signs detected';

  const savedTime = savedData?.savedAt || 'Just now';
  const capturedTime = savedData?.capturedAt || 'Today · 08:52';

  // Navigation Handlers (Section 14 & 15)
  const handleViewHiveHistory = () => {
    if (onClose) onClose();
    if (setSelectedHiveId) setSelectedHiveId(currentHive.id);
    if (setActiveTab) setActiveTab('hives');
  };

  const handleBackToHome = () => {
    if (onClose) onClose();
    if (setSelectedHiveId) setSelectedHiveId(null);
    if (setActiveTab) setActiveTab('home');
  };

  const handleScanAnother = () => {
    if (onClose) onClose();
    if (openScanModal) openScanModal(currentHive.id);
  };

  const handleReviewInspection = () => {
    if (onClose) onClose();
    if (openInspectionResult) {
      openInspectionResult({
        hiveId: currentHive.id,
        hive: currentHive,
        imageUrl: activeImage,
        presetKey: isAttention
          ? 'STATE_A_POSSIBLE_AFB'
          : isUnclear
          ? 'STATE_C_UNCLEAR'
          : 'STATE_B_NO_CONCERNING_SIGNS',
        observerNotes: observerNote
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="is-screen-overlay animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="is-success-heading"
    >
      <div className="is-screen-container">
        {/* ─────────────────────────────────────────────────────────────
            1. HEADER BAR
        ───────────────────────────────────────────────────────────── */}
        <header className="is-header">
          <button
            type="button"
            className="is-back-btn"
            onClick={handleViewHiveHistory}
            aria-label="Return to hive"
          >
            <ArrowLeft size={18} />
            <span>Hive {currentHive.code || 'A-03'}</span>
          </button>

          <div className="is-header-titles">
            <span className="is-header-title">Inspection confirmed</span>
          </div>

          <button
            type="button"
            className="is-demo-btn"
            onClick={() => setShowJuryDrawer(!showJuryDrawer)}
            title="Demonstrate Screen 20 states"
          >
            <Sliders size={14} />
            <span>Demo</span>
          </button>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            MAIN SCROLLABLE BODY
        ───────────────────────────────────────────────────────────── */}
        <main className="is-content-body">
          {/* ───────────────────────────────────────────────────────────
              2. SUCCESS / TRUST CARD (Section 3, 15, 16)
          ─────────────────────────────────────────────────────────── */}
          <section className="is-trust-card">
            <div className="is-trust-icon-ring">
              {isOfflineMode ? (
                <WifiOff size={26} color="var(--color-attention, #D9822B)" strokeWidth={2.2} />
              ) : (
                <CheckCircle2 size={28} color="var(--color-healthy, #4F7A52)" strokeWidth={2.2} />
              )}
            </div>

            <div className="is-trust-headings">
              <h1 id="is-success-heading" className="is-success-title">
                {isOfflineMode ? 'Saved offline' : 'Inspection saved'}
              </h1>
              <p className="is-success-sub">
                {isOfflineMode
                  ? `Hive ${currentHive.code || 'A-03'} updated locally. Will sync when back online.`
                  : `Hive ${currentHive.code || 'A-03'} has been updated.`}
              </p>
            </div>

            <div className="is-sync-indicator-bar">
              <span className={`is-sync-dot ${isOfflineMode ? 'offline' : 'synced'}`} />
              <span className="is-sync-label">
                {isOfflineMode ? 'Offline queue active • Waiting to sync' : 'Synced to apiary ledger'}
              </span>
            </div>

            <p className="is-trust-caveat">
              This confirms the inspection record was safely committed. It does not certify the colony is disease-free.
            </p>
          </section>

          {/* ───────────────────────────────────────────────────────────
              3. RESULT SUMMARY CARD (Section 4 & 8)
          ─────────────────────────────────────────────────────────── */}
          <section className="is-section">
            <div className="is-card is-result-summary-card">
              <div className="is-card-head-row">
                <span className="is-kicker">Bee Health Scan</span>
                <span className={`is-pill ${isAttention ? 'attention' : isHealthy ? 'healthy' : 'neutral'}`}>
                  <span className={`is-pill-dot ${isAttention ? 'attention' : isHealthy ? 'healthy' : 'neutral'}`} />
                  {resultTag}
                </span>
              </div>

              <strong className="is-condition-title">{conditionTitle}</strong>

              <div className="is-metadata-grid">
                <div className="is-meta-col">
                  <span className="is-meta-lbl">Hive</span>
                  <span className="is-meta-val">{currentHive.code || 'A-03'} · {currentHive.name}</span>
                </div>
                <div className="is-meta-col">
                  <span className="is-meta-lbl">Inspection</span>
                  <span className="is-meta-val">Optical brood scan</span>
                </div>
                <div className="is-meta-col">
                  <span className="is-meta-lbl">Captured</span>
                  <span className="is-meta-val">{capturedTime}</span>
                </div>
                <div className="is-meta-col">
                  <span className="is-meta-lbl">Saved</span>
                  <span className="is-meta-val">{savedTime}</span>
                </div>
              </div>

              {/* Beekeeper Observation (Section 18 & user notes) */}
              {observerNote && (
                <div className="is-user-obs-preview">
                  <span className="is-obs-lbl">Your recorded observation:</span>
                  <p className="is-obs-text">"{observerNote}"</p>
                </div>
              )}
            </div>
          </section>

          {/* ───────────────────────────────────────────────────────────
              4. EVIDENCE THUMBNAIL (Section 7)
          ─────────────────────────────────────────────────────────── */}
          <section className="is-section">
            <div className="is-card is-thumbnail-card">
              <div className="is-thumb-header">
                <div>
                  <h3 className="is-card-title">Captured frame evidence</h3>
                  <p className="is-card-sub">Permanently attached to Hive {currentHive.code || 'A-03'} history.</p>
                </div>
                <button
                  type="button"
                  className="is-view-img-link"
                  onClick={() => setIsFullscreenImage(true)}
                  aria-label="View full inspection image"
                >
                  <Maximize2 size={13} />
                  <span>View image</span>
                </button>
              </div>

              <div
                className="is-thumb-frame"
                onClick={() => setIsFullscreenImage(true)}
                role="button"
                tabIndex={0}
                aria-label="Tap to enlarge captured frame"
              >
                <img
                  src={activeImage}
                  alt={`Saved inspection image for Hive ${currentHive.name}`}
                  className="is-thumb-img"
                />
                <div className="is-thumb-overlay">
                  <Camera size={13} />
                  <span>Original frame • Tap to enlarge</span>
                </div>
              </div>
            </div>
          </section>

          {/* ───────────────────────────────────────────────────────────
              5. ATTENTION / OPERATIONAL STATE (Section 5, 6, 17)
          ─────────────────────────────────────────────────────────── */}
          <section className="is-section">
            {isAttention ? (
              <div className="is-attention-card">
                <div className="is-attn-top">
                  <div className="is-attn-badge">
                    <AlertTriangle size={15} color="#D9822B" />
                    <span>Attention required</span>
                  </div>
                  <button
                    type="button"
                    className="is-attn-link"
                    onClick={handleReviewInspection}
                  >
                    <span>Review inspection</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                <h3 className="is-attn-title">Hive {currentHive.code || 'A-03'} needs attention</h3>
                <p className="is-attn-sub">
                  Possible signs were found in the latest frame. A closer inspection of surrounding brood cells is recommended before taking management action.
                </p>
              </div>
            ) : (
              <div className="is-no-attn-card">
                <div className="is-no-attn-top">
                  <div className="is-no-attn-badge">
                    <CheckCircle2 size={15} color="#4F7A52" />
                    <span>No new attention needed</span>
                  </div>
                </div>
                <h3 className="is-no-attn-title">Routine conditions recorded</h3>
                <p className="is-no-attn-sub">
                  The latest frame did not show concerning visual signs. Continue normal seasonal monitoring.
                </p>
              </div>
            )}
          </section>

          {/* ───────────────────────────────────────────────────────────
              6. THREE-DIMENSION STATE SEPARATION (Section 11 & 12)
          ─────────────────────────────────────────────────────────── */}
          <section className="is-section">
            <div className="is-card is-diagnostics-card">
              <div className="is-diag-head">
                <span className="is-kicker">Hive dimensions</span>
                <span className="is-diag-caption">Independent state separation</span>
              </div>

              <div className="is-diag-grid">
                {/* 1. Hive Health / Screening State */}
                <div className="is-diag-item">
                  <span className="is-diag-type">Colony state</span>
                  <strong className={`is-diag-val ${isAttention ? 'attention' : 'healthy'}`}>
                    {isAttention ? 'Needs attention' : 'Stable'}
                  </strong>
                  <span className="is-diag-sub">Based on scan observations</span>
                </div>

                {/* 2. Device Connectivity State */}
                <div className="is-diag-item">
                  <span className="is-diag-type">Device state</span>
                  <strong className="is-diag-val healthy">
                    Connected
                  </strong>
                  <span className="is-diag-sub">ESP32-HC-02 reporting</span>
                </div>

                {/* 3. Data Sync State */}
                <div className="is-diag-item">
                  <span className="is-diag-type">Data state</span>
                  <strong className={`is-diag-val ${isOfflineMode ? 'attention' : 'healthy'}`}>
                    {isOfflineMode ? 'Queued offline' : 'Synced'}
                  </strong>
                  <span className="is-diag-sub">
                    {isOfflineMode ? 'Local storage only' : 'Verified in cloud'}
                  </span>
                </div>
              </div>

              <small className="is-diag-note">
                Telemetry, connectivity, and optical screening are evaluated independently to prevent false hardware-disease correlations.
              </small>
            </div>
          </section>

          {/* ───────────────────────────────────────────────────────────
              7. HIVE TIMELINE PREVIEW (Section 9 & 10)
          ─────────────────────────────────────────────────────────── */}
          <section className="is-section">
            <div className="is-card is-timeline-preview-card">
              <div className="is-card-head-row">
                <h3 className="is-card-title">Added to hive history</h3>
                <History size={15} color="var(--color-primary-honey, #D99A24)" />
              </div>

              <div className="is-preview-timeline-box">
                <div className="is-tl-track-col">
                  <span className={`is-tl-dot ${isAttention ? 'attention' : 'healthy'}`} />
                  <span className="is-tl-line" />
                </div>

                <div className="is-tl-body-col">
                  <div className="is-tl-meta-row">
                    <span className="is-tl-time">Today · {savedTime}</span>
                    <span className="is-tl-badge">Bee Health Scan</span>
                  </div>

                  <strong className="is-tl-item-title">{conditionTitle}</strong>
                  <p className="is-tl-item-finding">
                    {isAttention
                      ? 'Visual indicators flagged for closer inspection of brood comb.'
                      : 'Uniform worker brood pattern recorded.'}
                  </p>

                  <button
                    type="button"
                    className="is-tl-cta-link"
                    onClick={handleReviewInspection}
                  >
                    <span>View inspection</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ───────────────────────────────────────────────────────────
              8. PRIMARY NAVIGATION ACTIONS (Section 14 & 15)
          ─────────────────────────────────────────────────────────── */}
          <section className="is-actions-section">
            <button
              type="button"
              className="btn btn-primary btn-block is-primary-action-btn"
              onClick={handleViewHiveHistory}
            >
              <span>View hive</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-block is-secondary-action-btn"
              onClick={handleBackToHome}
            >
              Back to Home
            </button>

            <button
              type="button"
              className="btn-tertiary-link"
              onClick={handleScanAnother}
            >
              Scan another frame
            </button>
          </section>
        </main>

        {/* ─────────────────────────────────────────────────────────────
            FULLSCREEN ZOOM MODAL
        ───────────────────────────────────────────────────────────── */}
        {isFullscreenImage && (
          <div
            className="is-fullscreen-modal animate-fade-in"
            onClick={() => setIsFullscreenImage(false)}
          >
            <div className="is-fs-header">
              <span>Inspection Evidence · Hive {currentHive.code || 'A-03'}</span>
              <button
                type="button"
                className="is-fs-close-btn"
                onClick={() => setIsFullscreenImage(false)}
                aria-label="Close fullscreen"
              >
                <Minimize2 size={18} />
              </button>
            </div>
            <div className="is-fs-image-wrap">
              <img
                src={activeImage}
                alt={`Full resolution frame from Hive ${currentHive.name}`}
                className="is-fs-img"
              />
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            JURY DEMO DRAWER (Section 33)
        ───────────────────────────────────────────────────────────── */}
        {showJuryDrawer && (
          <div className="is-jury-drawer animate-fade-in">
            <div className="is-jury-head">
              <strong>Jury / Screen 20 State Demonstrator</strong>
              <button
                type="button"
                className="is-jury-close-btn"
                onClick={() => setShowJuryDrawer(false)}
              >
                ✕
              </button>
            </div>

            <p className="is-jury-desc">
              Demonstrate closed-loop persistence and continuity states:
            </p>

            <div className="is-jury-grid">
              <button
                type="button"
                data-demo-state="ATTENTION"
                className={`is-jury-chip ${activePreset === 'ATTENTION' && !isOfflineMode ? 'active' : ''}`}
                onClick={() => {
                  setActivePreset('ATTENTION');
                  setIsOfflineMode(false);
                  setShowJuryDrawer(false);
                }}
              >
                <span>State 1: Saved with Attention (AFB signs)</span>
              </button>

              <button
                type="button"
                data-demo-state="HEALTHY"
                className={`is-jury-chip ${activePreset === 'HEALTHY' && !isOfflineMode ? 'active' : ''}`}
                onClick={() => {
                  setActivePreset('HEALTHY');
                  setIsOfflineMode(false);
                  setShowJuryDrawer(false);
                }}
              >
                <span>State 2: Saved with No Concerning Signs</span>
              </button>

              <button
                type="button"
                data-demo-state="OFFLINE"
                className={`is-jury-chip ${isOfflineMode ? 'active' : ''}`}
                onClick={() => {
                  setIsOfflineMode(true);
                  setShowJuryDrawer(false);
                }}
              >
                <span>State 3: Saved Offline (Waiting to sync)</span>
              </button>

              <button
                type="button"
                data-demo-state="WITH_NOTE"
                className={`is-jury-chip ${observerNote ? 'active' : ''}`}
                onClick={() => {
                  setObserverNote('Noticed unusual drone clustering near lower left corner. Queen cell checked.');
                  setShowJuryDrawer(false);
                }}
              >
                <span>State 4: Custom Beekeeper Observation</span>
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STYLES
        ───────────────────────────────────────────────────────────── */}
        <style>{`
          .is-screen-overlay {
            position: fixed;
            inset: 0;
            background-color: rgba(52, 38, 27, 0.65);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 12px;
          }

          .is-screen-container {
            background-color: var(--color-background, #FFF9EF);
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 20px;
            width: 100%;
            max-width: 440px;
            height: 94vh;
            max-height: 860px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 16px 40px rgba(52, 38, 27, 0.25);
            color: var(--color-deep-cocoa, #34261B);
            position: relative;
          }

          .is-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            background-color: var(--color-soft-ivory, #FFFDF8);
            border-bottom: 1px solid var(--color-divider, #EDE2D1);
            flex-shrink: 0;
          }

          .is-back-btn {
            background: none;
            border: none;
            padding: 6px;
            color: var(--color-deep-cocoa, #34261B);
            cursor: pointer;
            min-height: 44px;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13.5px;
            font-weight: 500;
          }

          .is-header-titles {
            text-align: center;
            flex: 1;
          }

          .is-header-title {
            font-size: 14.5px;
            font-weight: 700;
            color: var(--color-deep-cocoa, #34261B);
          }

          .is-demo-btn {
            background: none;
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 8px;
            padding: 6px 10px;
            font-size: 11.5px;
            font-weight: 600;
            color: var(--color-warm-gray, #786D61);
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            min-height: 44px;
          }

          .is-content-body {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          /* Trust Card */
          .is-trust-card {
            background-color: var(--color-soft-ivory, #FFFDF8);
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 16px;
            padding: 20px 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 8px;
          }

          .is-trust-icon-ring {
            width: 54px;
            height: 54px;
            border-radius: 50%;
            background-color: #FAF4E9;
            border: 1px solid var(--color-divider, #EDE2D1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 4px;
          }

          .is-success-title {
            font-size: 19px;
            font-weight: 800;
            color: var(--color-deep-cocoa, #34261B);
            margin: 0;
            letter-spacing: -0.01em;
          }

          .is-success-sub {
            font-size: 13.5px;
            color: var(--color-warm-gray, #786D61);
            margin: 0;
            line-height: 1.4;
          }

          .is-sync-indicator-bar {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background-color: #FAF4E9;
            padding: 4px 10px;
            border-radius: 20px;
            margin-top: 4px;
          }

          .is-sync-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
          }

          .is-sync-dot.synced { background-color: var(--color-healthy, #4F7A52); }
          .is-sync-dot.offline { background-color: var(--color-attention, #D9822B); }

          .is-sync-label {
            font-size: 11px;
            font-weight: 600;
            color: var(--color-deep-cocoa, #34261B);
          }

          .is-trust-caveat {
            font-size: 11px;
            color: var(--color-warm-gray, #786D61);
            line-height: 1.35;
            margin: 6px 0 0 0;
            font-style: italic;
          }

          /* General Cards */
          .is-section {
            display: flex;
            flex-direction: column;
          }

          .is-card {
            background-color: var(--color-soft-ivory, #FFFDF8);
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 14px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .is-card-head-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .is-kicker {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--color-primary-honey, #D99A24);
          }

          .is-pill {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 11.5px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 20px;
          }

          .is-pill.attention {
            background-color: #FDF3E7;
            color: var(--color-attention, #D9822B);
            border: 1px solid rgba(217, 130, 43, 0.25);
          }

          .is-pill.healthy {
            background-color: #EFF5ED;
            color: var(--color-healthy, #4F7A52);
            border: 1px solid rgba(79, 122, 82, 0.25);
          }

          .is-pill.neutral {
            background-color: #FAF4E9;
            color: var(--color-warm-gray, #786D61);
            border: 1px solid var(--color-divider, #EDE2D1);
          }

          .is-pill-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
          }

          .is-pill-dot.attention { background-color: var(--color-attention, #D9822B); }
          .is-pill-dot.healthy { background-color: var(--color-healthy, #4F7A52); }
          .is-pill-dot.neutral { background-color: var(--color-warm-gray, #786D61); }

          .is-condition-title {
            font-size: 16px;
            font-weight: 750;
            color: var(--color-deep-cocoa, #34261B);
            margin: 0;
          }

          .is-metadata-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            background-color: #FAF4E9;
            padding: 12px;
            border-radius: 10px;
          }

          .is-meta-col {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .is-meta-lbl {
            font-size: 11px;
            color: var(--color-warm-gray, #786D61);
          }

          .is-meta-val {
            font-size: 12.5px;
            font-weight: 600;
            color: var(--color-deep-cocoa, #34261B);
          }

          .is-user-obs-preview {
            background-color: #FFF;
            border: 1px dashed var(--color-divider, #EDE2D1);
            border-radius: 10px;
            padding: 10px 12px;
          }

          .is-obs-lbl {
            font-size: 11px;
            font-weight: 600;
            color: var(--color-warm-gray, #786D61);
            display: block;
            margin-bottom: 2px;
          }

          .is-obs-text {
            font-size: 12.5px;
            color: var(--color-deep-cocoa, #34261B);
            margin: 0;
            font-style: italic;
            line-height: 1.4;
          }

          /* Thumbnail Card */
          .is-thumb-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
          }

          .is-card-title {
            font-size: 14.5px;
            font-weight: 700;
            margin: 0 0 2px 0;
          }

          .is-card-sub {
            font-size: 12px;
            color: var(--color-warm-gray, #786D61);
            margin: 0;
          }

          .is-view-img-link {
            background: none;
            border: none;
            color: var(--color-primary-honey, #D99A24);
            font-size: 12.5px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            padding: 4px 0;
          }

          .is-thumb-frame {
            position: relative;
            width: 100%;
            height: 120px;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid var(--color-divider, #EDE2D1);
            cursor: pointer;
          }

          .is-thumb-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .is-thumb-overlay {
            position: absolute;
            bottom: 0;
            inset-inline: 0;
            background: linear-gradient(to top, rgba(52, 38, 27, 0.75), transparent);
            color: #FFF;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          /* Attention Cards */
          .is-attention-card {
            background-color: #FFFDF8;
            border-left: 4px solid var(--color-attention, #D9822B);
            border-top: 1px solid var(--color-divider, #EDE2D1);
            border-right: 1px solid var(--color-divider, #EDE2D1);
            border-bottom: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 14px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .is-attn-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .is-attn-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11.5px;
            font-weight: 700;
            color: var(--color-attention, #D9822B);
          }

          .is-attn-link {
            background: none;
            border: none;
            color: var(--color-primary-honey, #D99A24);
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 3px;
            cursor: pointer;
          }

          .is-attn-title {
            font-size: 15px;
            font-weight: 750;
            color: var(--color-deep-cocoa, #34261B);
            margin: 0;
          }

          .is-attn-sub {
            font-size: 12.5px;
            color: var(--color-warm-gray, #786D61);
            margin: 0;
            line-height: 1.45;
          }

          .is-no-attn-card {
            background-color: #FFFDF8;
            border-left: 4px solid var(--color-healthy, #4F7A52);
            border-top: 1px solid var(--color-divider, #EDE2D1);
            border-right: 1px solid var(--color-divider, #EDE2D1);
            border-bottom: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 14px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .is-no-attn-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11.5px;
            font-weight: 700;
            color: var(--color-healthy, #4F7A52);
          }

          .is-no-attn-title {
            font-size: 15px;
            font-weight: 750;
            color: var(--color-deep-cocoa, #34261B);
            margin: 0;
          }

          .is-no-attn-sub {
            font-size: 12.5px;
            color: var(--color-warm-gray, #786D61);
            margin: 0;
            line-height: 1.45;
          }

          /* Three-dimension Diagnostics */
          .is-diag-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .is-diag-caption {
            font-size: 11px;
            color: var(--color-warm-gray, #786D61);
          }

          .is-diag-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }

          .is-diag-item {
            background-color: #FAF4E9;
            border-radius: 10px;
            padding: 10px 8px;
            display: flex;
            flex-direction: column;
            gap: 2px;
            text-align: center;
          }

          .is-diag-type {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--color-warm-gray, #786D61);
          }

          .is-diag-val {
            font-size: 12.5px;
            font-weight: 700;
          }

          .is-diag-val.attention { color: var(--color-attention, #D9822B); }
          .is-diag-val.healthy { color: var(--color-healthy, #4F7A52); }

          .is-diag-sub {
            font-size: 10px;
            color: var(--color-warm-gray, #786D61);
            line-height: 1.2;
          }

          .is-diag-note {
            font-size: 10.5px;
            color: var(--color-warm-gray, #786D61);
            line-height: 1.35;
          }

          /* Timeline Preview */
          .is-preview-timeline-box {
            display: flex;
            gap: 12px;
            background-color: #FAF4E9;
            padding: 12px;
            border-radius: 10px;
          }

          .is-tl-track-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 14px;
          }

          .is-tl-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-top: 2px;
          }

          .is-tl-dot.attention { background-color: var(--color-attention, #D9822B); }
          .is-tl-dot.healthy { background-color: var(--color-healthy, #4F7A52); }

          .is-tl-line {
            width: 2px;
            flex: 1;
            background-color: var(--color-divider, #EDE2D1);
            margin-top: 4px;
          }

          .is-tl-body-col {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .is-tl-meta-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .is-tl-time {
            font-size: 11px;
            color: var(--color-warm-gray, #786D61);
          }

          .is-tl-badge {
            font-size: 10.5px;
            font-weight: 600;
            background-color: #FFF;
            padding: 1px 6px;
            border-radius: 4px;
            color: var(--color-deep-cocoa, #34261B);
            border: 1px solid var(--color-divider, #EDE2D1);
          }

          .is-tl-item-title {
            font-size: 13.5px;
            font-weight: 700;
            color: var(--color-deep-cocoa, #34261B);
          }

          .is-tl-item-finding {
            font-size: 12px;
            color: var(--color-warm-gray, #786D61);
            margin: 0;
            line-height: 1.35;
          }

          .is-tl-cta-link {
            background: none;
            border: none;
            color: var(--color-primary-honey, #D99A24);
            font-size: 11.5px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 0 0 0;
            cursor: pointer;
          }

          /* Actions */
          .is-actions-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 8px;
          }

          .is-primary-action-btn {
            height: 48px;
            font-size: 14.5px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .is-secondary-action-btn {
            height: 44px;
            font-size: 13.5px;
            font-weight: 600;
          }

          /* Fullscreen Modal */
          .is-fullscreen-modal {
            position: fixed;
            inset: 0;
            background-color: rgba(20, 14, 10, 0.94);
            z-index: 10001;
            display: flex;
            flex-direction: column;
          }

          .is-fs-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            color: #FFF;
            font-size: 13.5px;
            font-weight: 600;
          }

          .is-fs-close-btn {
            background: rgba(255, 255, 255, 0.15);
            border: none;
            color: #FFF;
            border-radius: 50%;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .is-fs-image-wrap {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
          }

          .is-fs-img {
            max-width: 100%;
            max-height: 85vh;
            object-fit: contain;
            border-radius: 8px;
          }

          /* Jury Drawer */
          .is-jury-drawer {
            position: absolute;
            bottom: 0;
            inset-inline: 0;
            background-color: var(--color-deep-cocoa, #34261B);
            color: #FFF;
            border-top-left-radius: 18px;
            border-top-right-radius: 18px;
            padding: 18px;
            z-index: 20;
            box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.35);
          }

          .is-jury-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .is-jury-head strong {
            font-size: 13.5px;
            color: var(--color-primary-honey, #D99A24);
          }

          .is-jury-close-btn {
            background: none;
            border: none;
            color: #FFF;
            font-size: 16px;
            cursor: pointer;
          }

          .is-jury-desc {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.75);
            margin: 0 0 12px 0;
          }

          .is-jury-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .is-jury-chip {
            background-color: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            color: #FFF;
            padding: 10px 12px;
            text-align: left;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .is-jury-chip.active {
            background-color: var(--color-primary-honey, #D99A24);
            border-color: var(--color-primary-honey, #D99A24);
            color: var(--color-deep-cocoa, #34261B);
            font-weight: 700;
          }
        `}</style>
      </div>
    </div>
  );
};
