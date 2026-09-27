import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  X,
  Layers,
  Package,
  FlaskConical,
  Truck,
  ClipboardCheck,
  Compass,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import {
  DESIGNATION_TAXONOMY,
  evaluateDesignationEligibility,
  CAPABILITY_MAP
} from '../../services/capabilityEngine';

/**
 * Cohesive icon renderer for designation cards.
 */
const renderDesignationIcon = (id, size = 18) => {
  switch (id) {
    case 'BEEKEEPER':
      return <Layers size={size} strokeWidth={2.2} />;
    case 'PROCESSOR':
      return <Package size={size} strokeWidth={2.2} />;
    case 'LAB_SPECIALIST':
      return <FlaskConical size={size} strokeWidth={2.2} />;
    case 'DISTRIBUTOR':
      return <Truck size={size} strokeWidth={2.2} />;
    case 'INSPECTOR':
      return <ClipboardCheck size={size} strokeWidth={2.2} />;
    case 'FACILITY_MANAGER':
      return <Compass size={size} strokeWidth={2.2} />;
    default:
      return <Sparkles size={size} strokeWidth={2.2} />;
  }
};

/**
 * Workspace tools mapping for each designation explainability sheet.
 */
const DESIGNATION_WORKSPACE_TOOLS = {
  BEEKEEPER: [
    'Hive monitoring & colony telemetry',
    'Field inspection logs & queen sightings',
    'Seasonal harvest & super tallies'
  ],
  PROCESSOR: [
    'Honey batch creation & lot codes',
    'Settling tank & curing logs',
    'Packaging & extraction records'
  ],
  LAB_SPECIALIST: [
    'Refractometry, moisture & HMF logs',
    'Certified lab purity verification',
    'Tamper seal approvals & blockchain anchors'
  ],
  DISTRIBUTOR: [
    'Product inventory & stock management',
    'Courier & dispatch shipment manifests',
    'Retail delivery & receipt handovers'
  ],
  INSPECTOR: [
    'Independent biosecurity inspection logs',
    'Disease compliance checks & audits',
    'Ledger verification trails'
  ],
  FACILITY_MANAGER: [
    'Cross-functional team coordination',
    'Comprehensive operations auditing',
    'Facility throughput monitoring'
  ]
};

/**
 * Human-facing designation titles & descriptions.
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
 * Screen 10: "Here’s what fits your work."
 *
 * Fourth capability-discovery screen in HoneyChain's onboarding flow.
 * Presents explainable designation suggestions based on normalized capabilities and work context.
 *
 * Core principles:
 * - MULTIPLE DESIGNATIONS ARE FIRST-CLASS: Any combination can be selected.
 * - Zero algorithmic scores, rankings, or percentages.
 * - User remains in complete control with "Why this fits →" explainability bottom sheet.
 * - Frontend selection does NOT grant authorization; backend access engine remains authoritative.
 *
 * @param {Object} props
 * @param {Array<string>} props.selectedCapabilities - Array of canonical capability IDs
 * @param {Array<string>} props.selectedDesignations - Currently selected designation IDs
 * @param {Function} props.onToggleDesignation - Callback (designationId: string) => void
 * @param {Function} props.onContinue - Callback () => void
 * @param {Function} props.onBack - Callback () => void
 * @param {string} [props.progress='5/5'] - Step progress label
 */
export const SuggestedDesignationsScreen = ({
  selectedCapabilities = [],
  selectedDesignations = [],
  onToggleDesignation,
  onContinue,
  onBack,
  progress = '5/5'
}) => {
  const [explanationSheetId, setExplanationSheetId] = useState(null);
  const [showNotSureSheet, setShowNotSureSheet] = useState(false);
  const [showOtherOptions, setShowOtherOptions] = useState(false);

  // Evaluate designations dynamically through the capability intelligence engine
  const evaluation = useMemo(() => {
    return evaluateDesignationEligibility(selectedCapabilities);
  }, [selectedCapabilities]);

  // Group designations into "Suggested for you" and "Other options"
  const { suggestedList, otherList } = useMemo(() => {
    const suggestedIds = new Set(evaluation.suggestedDesignationIds || []);

    const suggested = [];
    const others = [];

    DESIGNATION_TAXONOMY.forEach((desig) => {
      // Safely access evaluation object whether it's keyed as a map or in an array
      const evalObj =
        evaluation.evaluations?.[desig.id] ||
        (Array.isArray(evaluation.evaluationsList)
          ? evaluation.evaluationsList.find((e) => e.designationId === desig.id)
          : Array.isArray(evaluation.evaluations)
          ? evaluation.evaluations.find((e) => e.designationId === desig.id)
          : null);

      const hasMatchedTasks = evalObj?.allMatchedCapabilities && evalObj.allMatchedCapabilities.length > 0;
      const isSuggested =
        suggestedIds.has(desig.id) ||
        selectedDesignations.includes(desig.id) ||
        (hasMatchedTasks && (evalObj?.isStrongMatch || evalObj?.isEligible));

      const enriched = {
        ...desig,
        humanTitle: HUMAN_DESIGNATION_META[desig.id]?.title || desig.name,
        humanTagline: HUMAN_DESIGNATION_META[desig.id]?.tagline || desig.tagline,
        evalObj,
        isSuggested
      };

      if (isSuggested) {
        suggested.push(enriched);
      } else {
        others.push(enriched);
      }
    });

    return {
      suggestedList: suggested.length > 0 ? suggested : others.slice(0, 2),
      otherList: suggested.length > 0 ? others : others.slice(2)
    };
  }, [evaluation, selectedDesignations]);

  const selectedCount = selectedDesignations.length;
  const hasSelection = selectedCount > 0;

  // Active designation for explainability bottom sheet
  const activeExplainingDesignation = useMemo(() => {
    if (!explanationSheetId) return null;
    const desig = DESIGNATION_TAXONOMY.find((d) => d.id === explanationSheetId);
    if (!desig) return null;

    const matchedRequired = desig.requiredCapabilities.filter((c) =>
      selectedCapabilities.includes(c)
    );
    const matchedCore = desig.coreCapabilities.filter((c) =>
      selectedCapabilities.includes(c)
    );
    const matchedSupporting = desig.supportingCapabilities.filter((c) =>
      selectedCapabilities.includes(c)
    );

    const allMatchedIds = [...matchedRequired, ...matchedCore, ...matchedSupporting];
    const allMatchedNames = allMatchedIds.map(
      (id) => CAPABILITY_MAP.get(id)?.name || id
    );

    const tools = DESIGNATION_WORKSPACE_TOOLS[desig.id] || [];

    return {
      desig,
      humanTitle: HUMAN_DESIGNATION_META[desig.id]?.title || desig.name,
      humanTagline: HUMAN_DESIGNATION_META[desig.id]?.tagline || desig.tagline,
      allMatchedNames,
      tools,
      isSelected: selectedDesignations.includes(desig.id),
      requiresVerification: desig.id === 'LAB_SPECIALIST' || desig.id === 'INSPECTOR'
    };
  }, [explanationSheetId, selectedCapabilities, selectedDesignations]);

  // Bottom dock summary microcopy
  const selectionSummaryText = useMemo(() => {
    if (selectedCount === 0) {
      return 'Select at least one designation to continue';
    }
    const names = selectedDesignations
      .map((id) => HUMAN_DESIGNATION_META[id]?.title || id)
      .join(', ');
    return `${selectedCount} ${selectedCount === 1 ? 'designation' : 'designations'} selected: ${names}`;
  }, [selectedCount, selectedDesignations]);

  const handleCardToggle = (id) => {
    onToggleDesignation?.(id);
  };

  const handleSheetAction = (id) => {
    onToggleDesignation?.(id);
    setExplanationSheetId(null);
  };

  return (
    <section
      className="suggested-designations-viewport"
      aria-labelledby="designations-heading"
      role="region"
    >
      {/* Top Navigation & Minimal Progress Indicator (5/5) */}
      <header className="designations-nav-header">
        <button
          type="button"
          className="designations-back-btn"
          onClick={onBack}
          aria-label="Return to previous step"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="designations-progress-wrap" aria-label={`Step progress: ${progress}`}>
          <div className="progress-dots-track" aria-hidden="true">
            <span className="p-dot completed" />
            <span className="p-line completed" />
            <span className="p-dot completed" />
            <span className="p-line completed" />
            <span className="p-dot completed" />
            <span className="p-line completed" />
            <span className="p-dot completed" />
            <span className="p-line completed" />
            <span className="p-dot active" />
          </div>
          <span className="designations-progress-text">{progress}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="designations-main-content">
        {/* Screen Copy Header */}
        <div className="designations-copy-block">
          <span className="micro-badge-lead">Workspace Recommendations</span>
          <h1 id="designations-heading" className="designations-heading">
            Here’s what fits your work.
          </h1>
          <p className="designations-supporting-text">
            Based on what you told us, these designations match the work you do.
          </p>

          <div className="designations-helper-row">
            <span className="designations-contextual-helper">
              You can choose more than one. HoneyChain workspaces adapt to multiple roles.
            </span>
            <button
              type="button"
              className="btn-helper-link"
              onClick={() => setShowNotSureSheet(true)}
              aria-label="Not sure what to choose? Open guidance sheet"
            >
              <HelpCircle size={13} />
              <span>Not sure what to choose?</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            SECTION 1: SUGGESTED FOR YOU
           ======================================================== */}
        <div className="designations-group-block">
          <div className="group-title-row">
            <span className="group-title">Suggested for you</span>
            <span className="group-badge">Based on your tasks</span>
          </div>

          <div
            className="designations-list"
            role="group"
            aria-label="Suggested designations"
          >
            {suggestedList.map((desig) => {
              const isSelected = selectedDesignations.includes(desig.id);
              const matchedCapabilities = desig.evalObj?.allMatchedCapabilities || [];
              const displayReasons = matchedCapabilities
                .slice(0, 3)
                .map((id) => CAPABILITY_MAP.get(id)?.name || id);

              const requiresVerification =
                desig.id === 'LAB_SPECIALIST' || desig.id === 'INSPECTOR';

              return (
                <div
                  key={desig.id}
                  className={`tactile-designation-card ${isSelected ? 'selected' : ''}`}
                >
                  <div
                    className="card-main-tap"
                    role="checkbox"
                    tabIndex={0}
                    aria-checked={isSelected}
                    aria-label={`${desig.humanTitle}. ${desig.humanTagline}. ${isSelected ? 'Selected' : 'Not selected'}`}
                    onClick={() => handleCardToggle(desig.id)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleCardToggle(desig.id);
                      }
                    }}
                  >
                    {/* Header Row: Icon, Title, Check */}
                    <div className="card-header-row">
                      <div className={`card-icon-pill ${isSelected ? 'selected' : ''}`} aria-hidden="true">
                        {renderDesignationIcon(desig.id, 18)}
                      </div>

                      <div className="card-title-col">
                        <strong className="card-title">{desig.humanTitle}</strong>
                        <span className="card-tagline">{desig.humanTagline}</span>
                      </div>

                      <div className={`card-check-pill ${isSelected ? 'checked' : ''}`} aria-hidden="true">
                        <Check size={12} strokeWidth={2.8} />
                      </div>
                    </div>

                    {/* Representative Reasons List */}
                    {displayReasons.length > 0 && (
                      <div className="card-reasons-list">
                        {displayReasons.map((reason, idx) => (
                          <div key={idx} className="reason-item">
                            <span className="reason-check">✓</span>
                            <span className="reason-text">{reason}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Verification Notice if applicable */}
                    {requiresVerification && (
                      <div className="card-verification-note">
                        <ShieldCheck size={12} />
                        <span>Some activities may require verification</span>
                      </div>
                    )}
                  </div>

                  {/* "Why this fits →" link action */}
                  <div className="card-explain-row">
                    <button
                      type="button"
                      className="btn-why-fits"
                      onClick={() => setExplanationSheetId(desig.id)}
                      aria-label={`Why ${desig.humanTitle} fits`}
                    >
                      <span>Why this fits</span>
                      <ChevronRight size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            SECTION 2: OTHER OPTIONS (Progressive Disclosure)
           ======================================================== */}
        {otherList.length > 0 && (
          <div className="other-options-section">
            {!showOtherOptions ? (
              <button
                type="button"
                className="btn-toggle-other-options"
                onClick={() => setShowOtherOptions(true)}
                aria-expanded={false}
              >
                <span>Other available designations ({otherList.length})</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <div className="designations-group-block animate-fade-slide">
                <div className="group-title-row">
                  <span className="group-title">Other options</span>
                  <span className="group-subtitle">Requires additional tasks or verification</span>
                </div>

                <div
                  className="designations-list"
                  role="group"
                  aria-label="Other designations"
                >
                  {otherList.map((desig) => {
                    const isSelected = selectedDesignations.includes(desig.id);

                    return (
                      <div
                        key={desig.id}
                        className={`tactile-designation-card other ${isSelected ? 'selected' : ''}`}
                      >
                        <div
                          className="card-main-tap"
                          role="checkbox"
                          tabIndex={0}
                          aria-checked={isSelected}
                          aria-label={`${desig.humanTitle}. ${desig.humanTagline}. ${isSelected ? 'Selected' : 'Not selected'}`}
                          onClick={() => handleCardToggle(desig.id)}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              handleCardToggle(desig.id);
                            }
                          }}
                        >
                          <div className="card-header-row">
                            <div className={`card-icon-pill ${isSelected ? 'selected' : ''}`} aria-hidden="true">
                              {renderDesignationIcon(desig.id, 18)}
                            </div>

                            <div className="card-title-col">
                              <strong className="card-title">{desig.humanTitle}</strong>
                              <span className="card-tagline">{desig.humanTagline}</span>
                            </div>

                            <div className={`card-check-pill ${isSelected ? 'checked' : ''}`} aria-hidden="true">
                              <Check size={12} strokeWidth={2.8} />
                            </div>
                          </div>
                        </div>

                        <div className="card-explain-row">
                          <button
                            type="button"
                            className="btn-why-fits"
                            onClick={() => setExplanationSheetId(desig.id)}
                            aria-label={`Why ${desig.humanTitle} fits`}
                          >
                            <span>Why this fits</span>
                            <ChevronRight size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          STICKY BOTTOM ACTION DOCK
         ======================================================== */}
      <footer className="designations-bottom-dock">
        {/* Dynamic Selection Summary Feedback */}
        <div className="dock-feedback-bar" aria-live="polite">
          <span className={`summary-feedback-text ${!hasSelection ? 'warning' : ''}`}>
            {selectionSummaryText}
          </span>
        </div>

        {/* Primary CTA and Secondary Review Action */}
        <div className="dock-actions-row">
          <button
            type="button"
            className={`btn-continue-cta ${!hasSelection ? 'disabled' : ''}`}
            onClick={onContinue}
            disabled={!hasSelection}
            aria-disabled={!hasSelection}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </div>

        <button
          type="button"
          className="btn-review-answers"
          onClick={onBack}
        >
          <span>Review my answers</span>
        </button>
      </footer>

      {/* ========================================================
          BOTTOM SHEET 1: "WHY THIS FITS" EXPLAINABILITY
         ======================================================== */}
      {activeExplainingDesignation && (
        <div
          className="modal-sheet-backdrop"
          onClick={() => setExplanationSheetId(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="explain-sheet-title"
        >
          <div
            className="modal-sheet-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-drag-handle" />

            <div className="sheet-header">
              <div className="sheet-title-wrap">
                <span className="sheet-kicker">Designation Details</span>
                <h2 id="explain-sheet-title" className="sheet-title">
                  Why {activeExplainingDesignation.humanTitle} fits
                </h2>
              </div>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={() => setExplanationSheetId(null)}
                aria-label="Close explanation"
              >
                <X size={18} />
              </button>
            </div>

            <p className="sheet-supporting-text">
              {activeExplainingDesignation.humanTagline}. We match this to the specific tasks and working context you declared.
            </p>

            {/* Section: Your Selected Work */}
            <div className="sheet-content-section">
              <span className="section-label">Your selected work</span>
              {activeExplainingDesignation.allMatchedNames.length > 0 ? (
                <div className="evidence-chips-list">
                  {activeExplainingDesignation.allMatchedNames.map((taskName, i) => (
                    <div key={i} className="evidence-chip">
                      <Check size={12} color="var(--color-primary-honey, #D99A24)" />
                      <span>{taskName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="fallback-note">
                  Matches default apiary and colony management activities.
                </p>
              )}
            </div>

            {/* Section: What This Gives You */}
            <div className="sheet-content-section">
              <span className="section-label">What this gives you</span>
              <div className="tools-bullets-list">
                {activeExplainingDesignation.tools.map((tool, i) => (
                  <div key={i} className="tool-bullet-row">
                    <span className="bullet-point">•</span>
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Note if applicable */}
            {activeExplainingDesignation.requiresVerification && (
              <div className="sheet-verification-box">
                <ShieldCheck size={15} color="#B87316" />
                <span>Verification may be required for certain sensitive compliance logs before public attestation.</span>
              </div>
            )}

            {/* Sheet Actions */}
            <div className="sheet-actions-stack">
              <button
                type="button"
                className="btn-sheet-primary"
                onClick={() => handleSheetAction(activeExplainingDesignation.desig.id)}
              >
                {activeExplainingDesignation.isSelected
                  ? `Deselect ${activeExplainingDesignation.humanTitle}`
                  : `Choose ${activeExplainingDesignation.humanTitle}`}
              </button>
              <button
                type="button"
                className="btn-sheet-secondary"
                onClick={() => setExplanationSheetId(null)}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          BOTTOM SHEET 2: "NOT SURE?" GUIDANCE
         ======================================================== */}
      {showNotSureSheet && (
        <div
          className="modal-sheet-backdrop"
          onClick={() => setShowNotSureSheet(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="not-sure-title"
        >
          <div
            className="modal-sheet-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-drag-handle" />

            <div className="sheet-header">
              <h2 id="not-sure-title" className="sheet-title">
                Not sure what to choose?
              </h2>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={() => setShowNotSureSheet(false)}
                aria-label="Close guidance"
              >
                <X size={18} />
              </button>
            </div>

            <p className="sheet-supporting-text">
              You can start with the workspace that matches your current work and adjust your designations anytime later in <strong>More → Work Setup</strong>.
            </p>

            <div className="not-sure-features-list">
              <div className="feature-item">
                <span className="feature-bullet">🐝</span>
                <div>
                  <strong>Start simple</strong>
                  <p>You can choose one designation now and add more as your operation grows.</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">⚙️</span>
                <div>
                  <strong>Full control</strong>
                  <p>Designations never lock you out of viewing basic apiary or batch data.</p>
                </div>
              </div>
            </div>

            <div className="sheet-actions-stack">
              <button
                type="button"
                className="btn-sheet-primary"
                onClick={() => {
                  setShowNotSureSheet(false);
                  onContinue?.();
                }}
              >
                Continue with suggested setup
              </button>
              <button
                type="button"
                className="btn-sheet-secondary"
                onClick={() => {
                  setShowNotSureSheet(false);
                  onBack?.();
                }}
              >
                Review my answers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS Styles adhering strictly to HoneyChain Visual System */}
      <style>{`
        .suggested-designations-viewport {
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
        .designations-nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: calc(var(--safe-top, 0px) + 12px) var(--mobile-pad, 20px) 12px;
          background-color: var(--color-warm-cream, #FFF9EF);
          flex-shrink: 0;
          border-bottom: 1px solid rgba(237, 226, 209, 0.45);
          z-index: 10;
        }

        .designations-back-btn {
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

        .designations-back-btn:active {
          transform: scale(0.96);
          background-color: #FAF4E8;
        }

        .designations-progress-wrap {
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

        .designations-progress-text {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--color-deep-honey, #B87316);
          letter-spacing: 0.02em;
        }

        /* -------------------------------------------------------------
           Main Content Area
           ------------------------------------------------------------- */
        .designations-main-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 16px var(--mobile-pad, 20px) 150px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .micro-badge-lead {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-deep-honey, #B87316);
          margin-bottom: 6px;
        }

        .designations-heading {
          font-size: 26px;
          line-height: 1.22;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0 0 6px 0;
          letter-spacing: -0.015em;
        }

        .designations-supporting-text {
          font-size: 14.5px;
          line-height: 1.45;
          color: var(--color-warm-gray, #786D61);
          margin: 0 0 10px 0;
        }

        .designations-helper-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px;
          background-color: rgba(255, 253, 248, 0.7);
          border: 1px dashed var(--color-border-warm, #EDE2D1);
          border-radius: 10px;
        }

        .designations-contextual-helper {
          font-size: 12.5px;
          color: var(--color-warm-gray, #786D61);
          line-height: 1.4;
        }

        .btn-helper-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          padding: 0;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-deep-honey, #B87316);
          cursor: pointer;
          align-self: flex-start;
        }

        .btn-helper-link:hover {
          text-decoration: underline;
        }

        /* -------------------------------------------------------------
           Group Blocks & Designation Cards
           ------------------------------------------------------------- */
        .designations-group-block {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .group-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2px;
        }

        .group-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          letter-spacing: 0.02em;
        }

        .group-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-deep-honey, #B87316);
          background-color: #FAF4E8;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .group-subtitle {
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
        }

        .designations-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tactile-designation-card {
          background-color: var(--color-cream-white, #FFFDF8);
          border: 1.5px solid var(--color-border-warm, #EDE2D1);
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(52, 38, 27, 0.03);
          transition: all 0.18s ease;
          overflow: hidden;
        }

        .tactile-designation-card:hover {
          border-color: #DCCBB0;
        }

        .tactile-designation-card.selected {
          border-color: var(--color-primary-honey, #D99A24);
          background-color: #FAF3E3;
          box-shadow: 0 2px 8px rgba(217, 154, 36, 0.1);
        }

        .card-main-tap {
          padding: 14px 14px 10px 14px;
          cursor: pointer;
          user-select: none;
        }

        .card-main-tap:active {
          opacity: 0.92;
        }

        .card-header-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .card-icon-pill {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background-color: #FAF4E8;
          color: var(--color-deep-cocoa, #34261B);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background-color 0.18s ease, color 0.18s ease;
        }

        .card-icon-pill.selected {
          background-color: var(--color-primary-honey, #D99A24);
          color: #FFFDF8;
        }

        .card-title-col {
          flex: 1;
          min-width: 0;
        }

        .card-title {
          display: block;
          font-size: 15px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          line-height: 1.25;
        }

        .card-tagline {
          display: block;
          font-size: 12.5px;
          color: var(--color-warm-gray, #786D61);
          margin-top: 2px;
          line-height: 1.35;
        }

        .card-check-pill {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 1.5px solid var(--color-border-warm, #EDE2D1);
          background-color: #FFFDF8;
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          flex-shrink: 0;
          transition: all 0.18s ease;
        }

        .card-check-pill.checked {
          border-color: var(--color-primary-honey, #D99A24);
          background-color: var(--color-primary-honey, #D99A24);
          color: #FFFDF8;
        }

        /* Representative Reasons */
        .card-reasons-list {
          margin-top: 10px;
          padding-left: 48px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .reason-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #5A4E42;
        }

        .reason-check {
          color: var(--color-primary-honey, #D99A24);
          font-weight: 700;
          font-size: 11px;
        }

        .reason-text {
          line-height: 1.3;
        }

        /* Verification Note */
        .card-verification-note {
          margin-top: 8px;
          margin-left: 48px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: #B87316;
          background-color: rgba(217, 154, 36, 0.08);
          padding: 3px 8px;
          border-radius: 6px;
        }

        /* "Why this fits →" Row */
        .card-explain-row {
          padding: 8px 14px 10px;
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid rgba(237, 226, 209, 0.5);
        }

        .btn-why-fits {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--color-deep-honey, #B87316);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          padding: 2px 4px;
          transition: color 0.15s ease;
        }

        .btn-why-fits:hover {
          color: #8C550E;
          text-decoration: underline;
        }

        /* -------------------------------------------------------------
           Other Options Toggle
           ------------------------------------------------------------- */
        .other-options-section {
          margin-top: 4px;
        }

        .btn-toggle-other-options {
          width: 100%;
          min-height: 44px;
          background-color: rgba(255, 253, 248, 0.7);
          border: 1px dashed var(--color-border-warm, #EDE2D1);
          border-radius: 12px;
          color: var(--color-deep-cocoa, #34261B);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .btn-toggle-other-options:hover {
          background-color: #FAF4E8;
        }

        .animate-fade-slide {
          animation: fadeSlide 0.25s ease-out;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* -------------------------------------------------------------
           Sticky Bottom Action Dock
           ------------------------------------------------------------- */
        .designations-bottom-dock {
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

        .dock-feedback-bar {
          min-height: 18px;
          display: flex;
          align-items: center;
        }

        .summary-feedback-text {
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
          line-height: 1.35;
        }

        .summary-feedback-text.warning {
          color: #B23B2A;
          font-weight: 600;
        }

        .dock-actions-row {
          display: flex;
          gap: 10px;
        }

        .btn-continue-cta {
          flex: 1;
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

        .btn-continue-cta:active:not(.disabled) {
          transform: scale(0.98);
          background-color: var(--color-deep-honey, #B87316);
        }

        .btn-continue-cta.disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-review-answers {
          background: none;
          border: none;
          color: var(--color-warm-gray, #786D61);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 6px;
          transition: color 0.15s ease;
        }

        .btn-review-answers:hover {
          color: var(--color-deep-cocoa, #34261B);
          text-decoration: underline;
        }

        /* -------------------------------------------------------------
           Bottom Sheet Modals (Why this fits & Not sure)
           ------------------------------------------------------------- */
        .modal-sheet-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(52, 38, 27, 0.4);
          display: flex;
          align-items: flex-end;
          z-index: 100;
          animation: backdropFade 0.2s ease-out;
        }

        @keyframes backdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-sheet-card {
          width: 100%;
          max-height: 85vh;
          overflow-y: auto;
          background-color: var(--color-cream-white, #FFFDF8);
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
          padding: 12px var(--mobile-pad, 20px) calc(var(--safe-bottom, 0px) + 20px);
          box-shadow: 0 -4px 20px rgba(52, 38, 27, 0.15);
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: sheetSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes sheetSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .sheet-drag-handle {
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background-color: var(--color-border-warm, #EDE2D1);
          align-self: center;
          margin-bottom: 2px;
        }

        .sheet-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .sheet-title-wrap {
          flex: 1;
        }

        .sheet-kicker {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-deep-honey, #B87316);
          margin-bottom: 2px;
        }

        .sheet-title {
          font-size: 19px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0;
          line-height: 1.25;
        }

        .sheet-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--color-border-warm, #EDE2D1);
          background-color: #FFFDF8;
          color: var(--color-warm-gray, #786D61);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .sheet-supporting-text {
          font-size: 13.5px;
          color: var(--color-warm-gray, #786D61);
          line-height: 1.45;
          margin: 0;
        }

        .sheet-content-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .section-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-deep-cocoa, #34261B);
        }

        .evidence-chips-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .evidence-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          background-color: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-radius: 8px;
          font-size: 12px;
          color: var(--color-deep-cocoa, #34261B);
        }

        .tools-bullets-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 8px 12px;
          background-color: #FAF4E8;
          border-radius: 10px;
        }

        .tool-bullet-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12.5px;
          color: var(--color-deep-cocoa, #34261B);
          line-height: 1.35;
        }

        .bullet-point {
          color: var(--color-primary-honey, #D99A24);
          font-weight: 700;
        }

        .fallback-note {
          font-size: 12.5px;
          color: var(--color-warm-gray, #786D61);
          font-style: italic;
          margin: 0;
        }

        .sheet-verification-box {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 9px 12px;
          background-color: rgba(217, 154, 36, 0.08);
          border: 1px solid rgba(217, 154, 36, 0.25);
          border-radius: 10px;
          font-size: 12px;
          color: #B87316;
          line-height: 1.4;
        }

        .sheet-actions-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 6px;
        }

        .btn-sheet-primary {
          width: 100%;
          height: 46px;
          border-radius: 11px;
          background-color: var(--color-deep-cocoa, #34261B);
          color: #FFFDF8;
          border: none;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-sheet-secondary {
          width: 100%;
          height: 40px;
          border-radius: 10px;
          background-color: transparent;
          color: var(--color-warm-gray, #786D61);
          border: none;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-sheet-secondary:hover {
          color: var(--color-deep-cocoa, #34261B);
        }

        .not-sure-features-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .feature-bullet {
          font-size: 18px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .feature-item strong {
          display: block;
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #34261B);
        }

        .feature-item p {
          font-size: 12.5px;
          color: var(--color-warm-gray, #786D61);
          margin: 2px 0 0 0;
          line-height: 1.35;
        }

        /* -------------------------------------------------------------
           Reduced Motion Support
           ------------------------------------------------------------- */
        @media (prefers-reduced-motion: reduce) {
          .modal-sheet-card,
          .modal-sheet-backdrop,
          .animate-fade-slide {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};
