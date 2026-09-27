import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  Package,
  FlaskConical,
  Truck,
  RotateCcw,
  WifiOff,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import {
  WORK_CONTEXT_TAXONOMY,
  evaluateCapabilities,
  resolveAccessProfile
} from '../../services/capabilityEngine';

/**
 * Screen 09: "HoneyChain understands."
 *
 * Polished human-centered transition experience following Screens 06, 07, and 08.
 * Reassures the user that HoneyChain has understood their working context and is
 * shaping a tailored workspace, prior to presenting suggested designations (Screen 10).
 *
 * Strictly avoids:
 * - Premature role assignments or scores (no "87% Beekeeper")
 * - Artificial AI loading delays or futuristic robotic graphics
 * - Technical jargon or raw IDs
 *
 * @param {Object} props
 * @param {Array<string>} props.selectedContexts - Selected context IDs from Screen 06
 * @param {Array<string>} props.selectedCapabilities - Selected capability IDs from Screen 07
 * @param {Object} props.workProfile - Normalized work organization profile from Screen 08
 * @param {Function} props.onContinue - Callback () => void (proceeds to Screen 10)
 * @param {Function} props.onBack - Callback () => void (returns to Screen 08)
 * @param {string} [props.progress='4/5'] - Step progress label
 * @param {boolean} [props.isOnline=true] - Connectivity status
 */
export const HoneyChainUnderstandsScreen = ({
  selectedContexts = [],
  selectedCapabilities = [],
  workProfile = {},
  onContinue,
  onBack,
  progress = '4/5',
  isOnline = true
}) => {
  // Processing lifecycle state: 'evaluating' | 'ready' | 'offline' | 'error'
  const [processingState, setProcessingState] = useState('evaluating');
  const [errorMessage, setErrorMessage] = useState(null);

  // Normalize summary areas in calm, human terminology
  const summaryAreas = useMemo(() => {
    const areas = [];
    const contexts = selectedContexts.length > 0
      ? selectedContexts
      : ['HIVE_OPERATIONS', 'HONEY_OPERATIONS'];

    contexts.forEach((ctxId) => {
      switch (ctxId) {
        case 'HIVE_OPERATIONS':
          areas.push({
            id: 'HIVE_OPERATIONS',
            title: 'Hive operations',
            detail: 'Colony care, inspections, and monitoring',
            icon: 'Layers'
          });
          break;
        case 'HONEY_OPERATIONS':
          areas.push({
            id: 'HONEY_OPERATIONS',
            title: 'Honey handling',
            detail: 'Extraction, processing, and batch records',
            icon: 'Package'
          });
          break;
        case 'QUALITY_OPERATIONS':
          areas.push({
            id: 'QUALITY_OPERATIONS',
            title: 'Quality checks',
            detail: 'Sampling, moisture testing, and purity records',
            icon: 'FlaskConical'
          });
          break;
        case 'LOGISTICS_OPERATIONS':
          areas.push({
            id: 'LOGISTICS_OPERATIONS',
            title: 'Products & delivery',
            detail: 'Packaging, inventory, and dispatch',
            icon: 'Truck'
          });
          break;
        default:
          break;
      }
    });

    return areas.slice(0, 4);
  }, [selectedContexts]);

  // Contextual collaboration line
  const collaborationNote = useMemo(() => {
    const styles = workProfile?.workStyle || [];
    if (styles.includes('TEAM') && styles.includes('PARTNERS')) {
      return 'Configured for shared team operations & external partners.';
    }
    if (styles.includes('TEAM')) {
      return 'Configured for shared team operations & collaborative logs.';
    }
    if (styles.includes('ORGANIZATION')) {
      return 'Structured for organizational records & multi-stage custody.';
    }
    return 'Organized for focused solo management & lightweight mobile logs.';
  }, [workProfile]);

  // Execute authoritative capability evaluation
  useEffect(() => {
    let isMounted = true;

    if (!isOnline) {
      setProcessingState('offline');
      return;
    }

    setProcessingState('evaluating');

    try {
      // Authoritative evaluation through capability & access engines
      evaluateCapabilities(selectedCapabilities);
      resolveAccessProfile({
        capabilities: selectedCapabilities,
        workContexts: {
          areas: workProfile?.workLocations || ['apiary'],
          handles: selectedContexts
        }
      });

      // Calm, seamless micro-transition (approx 450ms) to allow entry choreography
      const timer = setTimeout(() => {
        if (isMounted) {
          setProcessingState('ready');
        }
      }, 450);

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    } catch (err) {
      if (isMounted) {
        setProcessingState('error');
        setErrorMessage("We couldn't prepare your setup yet.");
      }
    }
  }, [selectedCapabilities, selectedContexts, workProfile, isOnline]);

  const handleRetry = () => {
    setProcessingState('evaluating');
    setTimeout(() => {
      setProcessingState(isOnline ? 'ready' : 'offline');
    }, 400);
  };

  const renderAreaIcon = (iconName) => {
    switch (iconName) {
      case 'Layers': return <Layers size={16} strokeWidth={2.2} />;
      case 'Package': return <Package size={16} strokeWidth={2.2} />;
      case 'FlaskConical': return <FlaskConical size={16} strokeWidth={2.2} />;
      case 'Truck': return <Truck size={16} strokeWidth={2.2} />;
      default: return <Sparkles size={16} strokeWidth={2.2} />;
    }
  };

  return (
    <section
      className="understands-viewport"
      aria-labelledby="understands-heading"
      role="region"
    >
      {/* Top Navigation & Minimal Progress Indicator (4/5) */}
      <header className="understands-nav-header">
        <button
          type="button"
          className="understands-back-btn"
          onClick={onBack}
          aria-label="Return to working style"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="understands-progress-wrap" aria-label={`Step progress: ${progress}`}>
          <div className="progress-dots-track" aria-hidden="true">
            <span className="p-dot completed" />
            <span className="p-line completed" />
            <span className="p-dot completed" />
            <span className="p-line completed" />
            <span className="p-dot completed" />
            <span className="p-line completed" />
            <span className="p-dot active" />
            <span className="p-line" />
            <span className="p-dot" />
          </div>
          <span className="understands-progress-text">{progress}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="understands-main-content">
        {/* ========================================================
            CENTRAL VISUAL: Subtle Abstract Honeycomb Illumination
           ======================================================== */}
        <div className="understands-visual-wrap" aria-hidden="true">
          <svg
            className="abstract-honeycomb-svg"
            viewBox="0 0 160 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="hexAmbient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FAF2E2" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#FFF9EF" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="softAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E8A62F" />
                <stop offset="100%" stopColor="#B87316" />
              </linearGradient>
            </defs>

            {/* Ambient Background Aura */}
            <circle cx="80" cy="70" r="62" fill="url(#hexAmbient)" />

            {/* Left Top Cell */}
            <polygon
              points="52,28 72,39 72,62 52,73 32,62 32,39"
              fill="#FFFDF8"
              stroke="#EDE2D1"
              strokeWidth="1.5"
              className="hex-cell cell-1"
            />

            {/* Center Core Cell (Soft Amber Tint) */}
            <polygon
              points="80,45 100,56 100,79 80,90 60,79 60,56"
              fill="#FAF3E3"
              stroke="#D99A24"
              strokeWidth="1.75"
              className="hex-cell cell-center"
            />

            {/* Right Top Cell */}
            <polygon
              points="108,28 128,39 128,62 108,73 88,62 88,39"
              fill="#FFFDF8"
              stroke="#EDE2D1"
              strokeWidth="1.5"
              className="hex-cell cell-2"
            />

            {/* Bottom Left Cell */}
            <polygon
              points="52,79 72,90 72,113 52,124 32,113 32,90"
              fill="#FFFDF8"
              stroke="#EDE2D1"
              strokeWidth="1.5"
              className="hex-cell cell-3"
            />

            {/* Bottom Right Cell */}
            <polygon
              points="108,79 128,90 128,113 108,124 88,113 88,90"
              fill="#FFFDF8"
              stroke="#EDE2D1"
              strokeWidth="1.5"
              className="hex-cell cell-4"
            />

            {/* Minimal Botanical Sage Leaf Accents */}
            <path
              d="M74 68 C76 60 84 57 86 64 C86 70 78 72 74 68 Z"
              fill="#71845B"
              opacity="0.85"
            />
            <circle cx="80" cy="67.5" r="2.2" fill="#D99A24" />
          </svg>
        </div>

        {/* ========================================================
            HEADLINE & PRIMARY NARRATIVE
           ======================================================== */}
        <div className="understands-text-block">
          <h1 id="understands-heading" className="understands-heading">
            HoneyChain understands.
          </h1>

          <p className="understands-supporting-text">
            We’ve got a good picture of how you work.
          </p>

          <p className="understands-secondary-text">
            We’re using your answers to shape a workspace around your day-to-day tasks.
          </p>
        </div>

        {/* ========================================================
            HUMAN-CENTERED SUMMARY OF WORK AREAS
           ======================================================== */}
        {processingState === 'ready' && (
          <div className="understands-summary-card">
            <span className="summary-kicker">Your work includes</span>

            <div className="summary-areas-list" role="list">
              {summaryAreas.map((area) => (
                <div key={area.id} className="summary-area-row" role="listitem">
                  <div className="area-icon-pill" aria-hidden="true">
                    {renderAreaIcon(area.icon)}
                  </div>
                  <div className="area-text-wrap">
                    <strong className="area-title">{area.title}</strong>
                    <span className="area-detail">{area.detail}</span>
                  </div>
                  <div className="area-check-mark" aria-hidden="true">
                    <Check size={13} strokeWidth={2.8} />
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-footer-meta">
              <span className="summary-meta-note">{collaborationNote}</span>
            </div>
          </div>
        )}

        {/* ========================================================
            EVALUATING / PROCESSING STATE
           ======================================================== */}
        {processingState === 'evaluating' && (
          <div className="processing-feedback-card" role="status">
            <div className="processing-spinner" aria-hidden="true" />
            <div className="processing-text-col">
              <strong className="processing-title">Preparing your setup…</strong>
              <p className="processing-desc">
                We’re organizing the tools that match your work.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================
            OFFLINE STATE
           ======================================================== */}
        {processingState === 'offline' && (
          <div className="state-card offline-card" role="alert">
            <div className="state-icon-wrap offline">
              <WifiOff size={20} />
            </div>
            <div className="state-text-col">
              <strong className="state-title">You're offline</strong>
              <p className="state-desc">
                Your answers are saved on this device. Reconnect to finish preparing your workspace.
              </p>
            </div>
            <div className="state-actions-row">
              <button type="button" className="btn-state-action" onClick={handleRetry}>
                Try again
              </button>
              <button type="button" className="btn-state-secondary" onClick={onBack}>
                Review my answers
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            ERROR STATE
           ======================================================== */}
        {processingState === 'error' && (
          <div className="state-card error-card" role="alert">
            <div className="state-icon-wrap error">
              <AlertCircle size={20} />
            </div>
            <div className="state-text-col">
              <strong className="state-title">We couldn't prepare your setup yet.</strong>
              <p className="state-desc">
                {errorMessage || "Your answers are safe. Let's try again."}
              </p>
            </div>
            <div className="state-actions-row">
              <button type="button" className="btn-state-action" onClick={handleRetry}>
                Try again
              </button>
              <button type="button" className="btn-state-secondary" onClick={onBack}>
                Review my answers
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          STICKY BOTTOM ACTIONS DOCK
         ======================================================== */}
      <footer className="understands-bottom-dock">
        <button
          type="button"
          className={`btn-see-setup ${processingState !== 'ready' ? 'disabled' : ''}`}
          onClick={onContinue}
          disabled={processingState !== 'ready'}
          aria-label="See your setup and view suggested designations"
        >
          <span>See your setup</span>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          className="btn-change-answers"
          onClick={onBack}
          aria-label="Change my answers and return to previous step"
        >
          <span>Change my answers</span>
        </button>
      </footer>

      {/* Scoped CSS Styles adhering strictly to HoneyChain Visual System */}
      <style>{`
        .understands-viewport {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          height: 100%;
          background-color: var(--color-warm-cream, #FFF9EF);
          color: var(--color-deep-cocoa, #34261B);
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
          font-family: inherit;
        }

        /* -------------------------------------------------------------
           Header & Progress Indicator
           ------------------------------------------------------------- */
        .understands-nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: calc(var(--safe-top, 0px) + 12px) var(--mobile-pad, 20px) 12px;
          background-color: var(--color-warm-cream, #FFF9EF);
          flex-shrink: 0;
          border-bottom: 1px solid rgba(237, 226, 209, 0.45);
          z-index: 10;
        }

        .understands-back-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-cream-white, #FFFDF8);
          border: 1px solid var(--color-border-warm, #EDE2D1);
          color: var(--color-deep-cocoa, #34261B);
          cursor: pointer;
          transition: background-color 0.15s ease, transform 0.1s ease;
          box-shadow: 0 1px 2px rgba(52, 38, 27, 0.04);
        }

        .understands-back-btn:active {
          transform: scale(0.96);
          background-color: #FAF4E8;
        }

        .understands-progress-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-dots-track {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .p-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--color-border-warm, #EDE2D1);
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .p-dot.completed {
          background-color: var(--color-deep-honey, #B87316);
        }

        .p-dot.active {
          background-color: var(--color-primary-honey, #D99A24);
          transform: scale(1.25);
        }

        .p-line {
          width: 8px;
          height: 2px;
          background-color: var(--color-border-warm, #EDE2D1);
          border-radius: 1px;
        }

        .p-line.completed {
          background-color: var(--color-deep-honey, #B87316);
        }

        .understands-progress-text {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--color-deep-honey, #B87316);
          letter-spacing: 0.02em;
        }

        /* -------------------------------------------------------------
           Main Content Area
           ------------------------------------------------------------- */
        .understands-main-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 20px var(--mobile-pad, 20px) 130px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 18px;
          animation: mainFadeIn 0.35s ease-out;
        }

        @keyframes mainFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* -------------------------------------------------------------
           Central Abstract Honeycomb Visual
           ------------------------------------------------------------- */
        .understands-visual-wrap {
          width: 140px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 4px;
        }

        .abstract-honeycomb-svg {
          width: 100%;
          height: 100%;
        }

        .hex-cell {
          transition: all 0.35s ease;
        }

        .cell-center {
          animation: corePulse 3s ease-in-out infinite alternate;
        }

        @keyframes corePulse {
          0% { transform: scale(1); transform-origin: 80px 67px; }
          100% { transform: scale(1.03); transform-origin: 80px 67px; stroke: #B87316; }
        }

        /* -------------------------------------------------------------
           Text Block
           ------------------------------------------------------------- */
        .understands-text-block {
          max-width: 340px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .understands-heading {
          font-size: 27px;
          line-height: 1.2;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0;
          letter-spacing: -0.015em;
        }

        .understands-supporting-text {
          font-size: 15.5px;
          line-height: 1.4;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0;
        }

        .understands-secondary-text {
          font-size: 13.5px;
          line-height: 1.45;
          color: var(--color-warm-gray, #786D61);
          margin: 0;
        }

        /* -------------------------------------------------------------
           Human-Centered Summary Card
           ------------------------------------------------------------- */
        .understands-summary-card {
          width: 100%;
          max-width: 360px;
          background-color: var(--color-cream-white, #FFFDF8);
          border: 1.5px solid var(--color-border-warm, #EDE2D1);
          border-radius: 14px;
          padding: 14px 16px;
          box-shadow: 0 1px 3px rgba(52, 38, 27, 0.03);
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: cardSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .summary-kicker {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-deep-honey, #B87316);
        }

        .summary-areas-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .summary-area-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          background-color: rgba(250, 244, 232, 0.5);
          border: 1px solid rgba(237, 226, 209, 0.6);
          border-radius: 10px;
        }

        .area-icon-pill {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background-color: #FAF4E8;
          color: var(--color-deep-cocoa, #34261B);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .area-text-wrap {
          flex: 1;
          min-width: 0;
        }

        .area-title {
          display: block;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          line-height: 1.25;
        }

        .area-detail {
          display: block;
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
          margin-top: 1px;
          line-height: 1.3;
        }

        .area-check-mark {
          color: var(--color-primary-honey, #D99A24);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .summary-footer-meta {
          padding-top: 4px;
          border-top: 1px solid rgba(237, 226, 209, 0.4);
        }

        .summary-meta-note {
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
          line-height: 1.35;
          font-style: italic;
        }

        /* -------------------------------------------------------------
           Processing / Evaluating State
           ------------------------------------------------------------- */
        .processing-feedback-card {
          width: 100%;
          max-width: 360px;
          background-color: var(--color-cream-white, #FFFDF8);
          border: 1.5px dashed var(--color-border-warm, #EDE2D1);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          text-align: left;
        }

        .processing-spinner {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2.5px solid #EDE2D1;
          border-top-color: var(--color-primary-honey, #D99A24);
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .processing-title {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
        }

        .processing-desc {
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
          margin: 2px 0 0 0;
          line-height: 1.35;
        }

        /* -------------------------------------------------------------
           Offline / Error States
           ------------------------------------------------------------- */
        .state-card {
          width: 100%;
          max-width: 360px;
          background-color: var(--color-cream-white, #FFFDF8);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          text-align: left;
        }

        .state-card.offline-card {
          border: 1.5px solid #E5D6C0;
        }

        .state-card.error-card {
          border: 1.5px solid #F0C4BC;
        }

        .state-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .state-icon-wrap.offline {
          background-color: #FAF4E8;
          color: var(--color-deep-honey, #B87316);
        }

        .state-icon-wrap.error {
          background-color: #FDF0ED;
          color: #B23B2A;
        }

        .state-title {
          display: block;
          font-size: 14.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
        }

        .state-desc {
          font-size: 12.5px;
          color: var(--color-warm-gray, #786D61);
          margin: 2px 0 0 0;
          line-height: 1.4;
        }

        .state-actions-row {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }

        .btn-state-action {
          flex: 1;
          height: 38px;
          border-radius: 8px;
          background-color: var(--color-deep-cocoa, #34261B);
          color: #FFFDF8;
          border: none;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-state-secondary {
          flex: 1;
          height: 38px;
          border-radius: 8px;
          background-color: transparent;
          color: var(--color-deep-cocoa, #34261B);
          border: 1px solid var(--color-border-warm, #EDE2D1);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        /* -------------------------------------------------------------
           Sticky Bottom Dock
           ------------------------------------------------------------- */
        .understands-bottom-dock {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(180deg, rgba(255, 249, 239, 0.88) 0%, rgba(255, 249, 239, 0.98) 25%, #FFF9EF 100%);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 10px var(--mobile-pad, 20px) calc(var(--safe-bottom, 0px) + 14px);
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid rgba(237, 226, 209, 0.6);
          z-index: 20;
        }

        .btn-see-setup {
          width: 100%;
          height: 48px;
          border-radius: 12px;
          background-color: var(--color-primary-honey, #D99A24);
          color: #FFFDF8;
          border: none;
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(217, 154, 36, 0.25);
          transition: background-color 0.18s ease, transform 0.12s ease, opacity 0.18s ease;
        }

        .btn-see-setup:active:not(.disabled) {
          transform: scale(0.98);
          background-color: var(--color-deep-honey, #B87316);
        }

        .btn-see-setup.disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-change-answers {
          background: none;
          border: none;
          color: var(--color-warm-gray, #786D61);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 6px;
          transition: color 0.15s ease;
        }

        .btn-change-answers:hover {
          color: var(--color-deep-cocoa, #34261B);
          text-decoration: underline;
        }

        /* -------------------------------------------------------------
           Reduced Motion Support
           ------------------------------------------------------------- */
        @media (prefers-reduced-motion: reduce) {
          .cell-center,
          .processing-spinner,
          .understands-main-content,
          .understands-summary-card {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};
