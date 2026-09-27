import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Check,
  Layers,
  Package,
  FlaskConical,
  Truck,
  ClipboardCheck,
  Compass,
  Sparkles
} from 'lucide-react';

/**
 * Human-facing designation titles & taglines.
 */
const HUMAN_DESIGNATION_META = {
  BEEKEEPER: {
    title: 'Beekeeper',
    tagline: 'Hive care & field operations'
  },
  PROCESSOR: {
    title: 'Processor',
    tagline: 'Honey handling & processing'
  },
  LAB_SPECIALIST: {
    title: 'Quality',
    tagline: 'Honey quality & verification'
  },
  DISTRIBUTOR: {
    title: 'Distributor',
    tagline: 'Products, inventory & delivery'
  },
  INSPECTOR: {
    title: 'Field Inspector',
    tagline: 'Regulatory audits & bio-security'
  },
  FACILITY_MANAGER: {
    title: 'Operations Lead',
    tagline: 'Operational oversight & coordination'
  }
};

/**
 * Returns the Home sections that will be prioritized for the user's workspace.
 * Structural names only — no fabricated live data.
 */
const getHomeFocusAreas = (designationIds = [], capabilities = []) => {
  const areas = [];
  const hasBeekeeper = designationIds.includes('BEEKEEPER');
  const hasProcessor = designationIds.includes('PROCESSOR');
  const hasQuality = designationIds.includes('LAB_SPECIALIST');
  const hasDistributor = designationIds.includes('DISTRIBUTOR');
  const hasInspector = designationIds.includes('INSPECTOR');
  const hasFacilityMgr = designationIds.includes('FACILITY_MANAGER');
  const hasHiveCaps = capabilities.some(c => c.includes('HIVE'));
  const hasHoneyCaps = capabilities.some(c => c.includes('HONEY') || c.includes('BATCH'));

  if (hasBeekeeper || hasHiveCaps) {
    areas.push({ id: 'hive_activity', label: 'Hive activity', icon: '🐝' });
  }
  if (hasProcessor || hasHoneyCaps) {
    areas.push({ id: 'honey_batches', label: 'Honey batches', icon: '🍯' });
  }
  if (hasBeekeeper) {
    areas.push({ id: 'inspections', label: 'Inspection records', icon: '📋' });
  }
  if (hasQuality) {
    areas.push({ id: 'quality_checks', label: 'Quality checks', icon: '🔬' });
  }
  if (hasDistributor) {
    areas.push({ id: 'inventory', label: 'Inventory & shipments', icon: '📦' });
  }
  if (hasInspector) {
    areas.push({ id: 'audits', label: 'Audit records', icon: '📝' });
  }
  if (hasFacilityMgr) {
    areas.push({ id: 'operations', label: 'Operations overview', icon: '⚙️' });
  }

  // Traceability is always present
  areas.push({ id: 'traceability', label: 'Traceability', icon: '🔗' });

  return areas.slice(0, 4); // Show max 4 focus areas
};

/**
 * Render designation icon
 */
const renderDesigIcon = (id, size = 14) => {
  switch (id) {
    case 'BEEKEEPER': return <Layers size={size} strokeWidth={2.2} />;
    case 'PROCESSOR': return <Package size={size} strokeWidth={2.2} />;
    case 'LAB_SPECIALIST': return <FlaskConical size={size} strokeWidth={2.2} />;
    case 'DISTRIBUTOR': return <Truck size={size} strokeWidth={2.2} />;
    case 'INSPECTOR': return <ClipboardCheck size={size} strokeWidth={2.2} />;
    case 'FACILITY_MANAGER': return <Compass size={size} strokeWidth={2.2} />;
    default: return <Sparkles size={size} strokeWidth={2.2} />;
  }
};

/**
 * Screen 13: "You're all set."
 *
 * Final onboarding transition before the user enters HoneyChain Home.
 * Provides a short, confident confirmation of the confirmed workspace,
 * a structural preview of the personalized Home experience, and a clear CTA.
 *
 * Core principles:
 * - Concise: not another information-heavy screen.
 * - Zero fake data: structural home preview only.
 * - Professional, warm confirmation — no confetti, cartoon bees, or gamification.
 * - Clear distinction between entering HoneyChain vs changing setup.
 *
 * @param {Object} props
 * @param {Array<string>} props.confirmedDesignations - Confirmed designation IDs
 * @param {Array<string>} props.selectedCapabilities - Declared capability IDs
 * @param {string} [props.operatorName='Sarah Lindqvist'] - Operator name
 * @param {string} [props.apiaryName='Meadowbrook Apiary'] - Apiary name
 * @param {Function} props.onEnterHoneyChain - Callback () => void — calls backend + navigates to Home
 * @param {Function} props.onChangeSetup - Callback () => void — returns to designation selection
 */
export const AllSetScreen = ({
  confirmedDesignations = [],
  selectedCapabilities = [],
  operatorName = 'Sarah Lindqvist',
  apiaryName = 'Meadowbrook Apiary',
  onEnterHoneyChain,
  onChangeSetup
}) => {
  const [revealed, setRevealed] = useState(false);

  // Trigger the subtle entrance animation
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Designation string e.g. "Beekeeper · Processor"
  const designationString = useMemo(() => {
    if (confirmedDesignations.length === 0) return 'Basic Workspace';
    return confirmedDesignations
      .map(id => HUMAN_DESIGNATION_META[id]?.title || id)
      .join(' · ');
  }, [confirmedDesignations]);

  // Structural home focus areas (no fabricated values)
  const homeFocusAreas = useMemo(
    () => getHomeFocusAreas(confirmedDesignations, selectedCapabilities),
    [confirmedDesignations, selectedCapabilities]
  );

  // First-name greeting
  const firstName = operatorName.split(' ')[0] || 'there';

  return (
    <section
      className="all-set-viewport"
      aria-labelledby="all-set-heading"
      role="region"
    >
      <div className={`all-set-inner ${revealed ? 'revealed' : ''}`}>

        {/* ── Confirmation Mark ────────────────────────────────── */}
        <div className="confirmation-mark" aria-hidden="true">
          {/* Minimal honeycomb SVG — professional, not cartoonish */}
          <svg
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="confirmation-svg"
            aria-hidden="true"
          >
            {/* Outer hexagon shell */}
            <polygon
              points="36,6 64,21 64,51 36,66 8,51 8,21"
              fill="#FFFDF8"
              stroke="#EDE2D1"
              strokeWidth="1.5"
            />
            {/* Inner honey-fill cell */}
            <polygon
              points="36,16 56,27 56,49 36,60 16,49 16,27"
              fill="#FAF2E2"
              stroke="#D99A24"
              strokeWidth="1.5"
            />
            {/* Check mark */}
            <polyline
              points="26,36 33,43 47,29"
              stroke="#B87316"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ── Primary Copy ─────────────────────────────────────── */}
        <div className="all-set-copy-block">
          <h1 id="all-set-heading" className="all-set-heading">
            You're all set.
          </h1>
          <p className="all-set-subtext">
            HoneyChain is ready for the way you work.
          </p>
          <span className="all-set-helper">
            Your workspace will adapt as your work changes.
          </span>
        </div>

        {/* ── Confirmed Setup Card ──────────────────────────────── */}
        <div className="confirmed-setup-card">
          <span className="setup-card-kicker">Your setup</span>
          <div className="setup-designations-headline" aria-label={`Confirmed designations: ${designationString}`}>
            {designationString}
          </div>
          <div className="setup-chips-row">
            {confirmedDesignations.map(id => {
              const meta = HUMAN_DESIGNATION_META[id] || { title: id };
              return (
                <span key={id} className="setup-chip">
                  <span className="chip-icon-wrap" aria-hidden="true">
                    {renderDesigIcon(id, 12)}
                  </span>
                  <span>{meta.title}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* ── Personalized Home Preview ────────────────────────── */}
        <div className="home-preview-card" aria-label="Structural preview of your personalized Home screen">
          {/* Mini nav bar (structural, decorative) */}
          <div className="preview-mini-nav" aria-hidden="true">
            <span className="nav-item active">Home</span>
            <span className="nav-item">Hives</span>
            <span className="nav-item">Honey</span>
            <span className="nav-item">More</span>
          </div>

          {/* "Your Home will focus on" */}
          <div className="preview-focus-section">
            <span className="preview-focus-label">Your Home will focus on</span>
            <div className="preview-focus-grid">
              {homeFocusAreas.map(area => (
                <div key={area.id} className="preview-focus-item">
                  <span className="focus-icon" aria-hidden="true">{area.icon}</span>
                  <span className="focus-label">{area.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Structural day preview — zero fake data */}
          <div className="preview-today-block">
            <span className="preview-today-kicker">Today</span>
            <div className="preview-today-rows">
              {confirmedDesignations.includes('BEEKEEPER') && (
                <div className="today-row">
                  <span className="today-row-dot" aria-hidden="true" />
                  <span className="today-row-text">Your hive activity will appear here.</span>
                </div>
              )}
              {(confirmedDesignations.includes('PROCESSOR') || selectedCapabilities.some(c => c.includes('HONEY'))) && (
                <div className="today-row">
                  <span className="today-row-dot" aria-hidden="true" />
                  <span className="today-row-text">Your active honey batches will appear here.</span>
                </div>
              )}
              {confirmedDesignations.includes('LAB_SPECIALIST') && (
                <div className="today-row">
                  <span className="today-row-dot" aria-hidden="true" />
                  <span className="today-row-text">Pending quality checks will appear here.</span>
                </div>
              )}
              <div className="today-row muted">
                <span className="today-row-dot muted" aria-hidden="true" />
                <span className="today-row-text">Field companion ready for offline logging.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Action Dock ────────────────────────────────── */}
        <div className="all-set-dock">
          <button
            type="button"
            className="btn-enter-honeychain"
            onClick={onEnterHoneyChain}
            aria-label="Enter HoneyChain and open your workspace"
          >
            <span>Enter HoneyChain</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            className="btn-change-setup-text"
            onClick={onChangeSetup}
          >
            Change my setup
          </button>
        </div>

      </div>

      {/* Scoped Styles — HoneyChain Visual System */}
      <style>{`
        .all-set-viewport {
          position: relative;
          height: 100%;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #FFF9EF;
          color: #34261B;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
          padding: 40px 20px 36px;
        }

        .all-set-inner {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }

        .all-set-inner.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .all-set-inner {
            transition: none;
            opacity: 1;
            transform: none;
          }
        }

        /* ── Confirmation Mark ── */
        .confirmation-mark {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }

        @media (prefers-reduced-motion: reduce) {
          .confirmation-mark { animation: none; }
        }

        @keyframes popIn {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        .confirmation-svg {
          width: 72px;
          height: 72px;
          filter: drop-shadow(0 4px 12px rgba(217, 154, 36, 0.18));
        }

        /* ── Copy Block ── */
        .all-set-copy-block {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .all-set-heading {
          font-size: 30px;
          font-weight: 800;
          line-height: 1.2;
          color: #34261B;
          margin: 0;
          letter-spacing: -0.4px;
        }

        .all-set-subtext {
          font-size: 15px;
          line-height: 1.45;
          color: #34261B;
          margin: 0;
        }

        .all-set-helper {
          font-size: 12.5px;
          color: #786D61;
        }

        /* ── Confirmed Setup Card ── */
        .confirmed-setup-card {
          width: 100%;
          background: #FFFDF8;
          border: 1.5px solid #D99A24;
          border-radius: 16px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 3px 12px rgba(217, 154, 36, 0.10);
        }

        .setup-card-kicker {
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.9px;
          color: #B87316;
        }

        .setup-designations-headline {
          font-size: 22px;
          font-weight: 750;
          color: #34261B;
          letter-spacing: -0.2px;
        }

        .setup-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .setup-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 10px;
          background: #FAF2E2;
          border: 1px solid #EDE2D1;
          color: #B87316;
          font-size: 12px;
          font-weight: 700;
        }

        .chip-icon-wrap {
          display: flex;
          align-items: center;
        }

        /* ── Home Preview Card ── */
        .home-preview-card {
          width: 100%;
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(52, 38, 27, 0.06);
          display: flex;
          flex-direction: column;
        }

        .preview-mini-nav {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 10px 16px;
          background: #FAF8F2;
          border-bottom: 1px solid #EDE2D1;
        }

        .nav-item {
          font-size: 11px;
          font-weight: 600;
          color: #786D61;
        }

        .nav-item.active {
          font-weight: 750;
          color: #B87316;
          border-bottom: 2px solid #D99A24;
          padding-bottom: 2px;
        }

        .preview-focus-section {
          padding: 14px 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-bottom: 1px solid #EDE2D1;
        }

        .preview-focus-label {
          font-size: 11.5px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #786D61;
        }

        .preview-focus-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .preview-focus-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border-radius: 8px;
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
        }

        .focus-icon {
          font-size: 13px;
        }

        .focus-label {
          font-size: 11.5px;
          font-weight: 600;
          color: #34261B;
          line-height: 1.2;
        }

        .preview-today-block {
          padding: 12px 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .preview-today-kicker {
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          color: #786D61;
        }

        .preview-today-rows {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .today-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .today-row-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #D99A24;
          flex-shrink: 0;
        }

        .today-row-dot.muted {
          background: #EDE2D1;
        }

        .today-row-text {
          font-size: 12px;
          color: #34261B;
          line-height: 1.35;
        }

        .today-row.muted .today-row-text {
          color: #786D61;
        }

        /* ── Bottom Dock ── */
        .all-set-dock {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 4px;
        }

        .btn-enter-honeychain {
          width: 100%;
          height: 52px;
          border-radius: 14px;
          background: #D99A24;
          border: none;
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 750;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(217, 154, 36, 0.30);
          transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
          letter-spacing: -0.1px;
        }

        .btn-enter-honeychain:hover {
          background: #C88A1A;
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(217, 154, 36, 0.35);
        }

        .btn-enter-honeychain:active {
          transform: translateY(0);
          box-shadow: 0 3px 10px rgba(217, 154, 36, 0.25);
        }

        .btn-change-setup-text {
          background: transparent;
          border: none;
          color: #786D61;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 6px;
          align-self: center;
          transition: color 0.15s ease;
        }

        .btn-change-setup-text:hover {
          color: #34261B;
          text-decoration: underline;
        }
      `}</style>
    </section>
  );
};

export default AllSetScreen;
