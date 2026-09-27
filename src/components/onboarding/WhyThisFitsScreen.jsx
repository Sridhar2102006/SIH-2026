import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  X,
  Layers,
  Package,
  FlaskConical,
  Truck,
  ClipboardCheck,
  Compass,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  RotateCcw,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import {
  DESIGNATION_TAXONOMY,
  CAPABILITY_MAP,
  CANONICAL_CAPABILITY_MAP,
  evaluateDesignationEligibility
} from '../../services/capabilityEngine';

/**
 * Cohesive icon renderer for designation cards and sheets.
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
 * Human-facing designation titles & descriptions.
 */
const HUMAN_DESIGNATION_META = {
  BEEKEEPER: {
    title: 'Beekeeper',
    tagline: 'Hive care & field operations',
    naturalExplanation:
      'These tasks are closely connected to hive care, field observation, and colony health monitoring, which are central to this workspace.'
  },
  PROCESSOR: {
    title: 'Processor',
    tagline: 'Honey handling & processing',
    naturalExplanation:
      'Your selected tasks focus on honey collection, settling, extraction, and batch handling, which are central to this workspace.'
  },
  LAB_SPECIALIST: {
    title: 'Quality',
    tagline: 'Honey quality & verification',
    naturalExplanation:
      'Your selected tasks include sampling, refractometer moisture checks, and test records, which are central to quality workflows.'
  },
  DISTRIBUTOR: {
    title: 'Distributor',
    tagline: 'Products, inventory & delivery',
    naturalExplanation:
      'Your selected tasks focus on packaged inventory, storage tracking, and shipment manifests for retail delivery.'
  },
  INSPECTOR: {
    title: 'Field Inspector',
    tagline: 'Regulatory audits & bio-security',
    naturalExplanation:
      'Your work involves independent hive health assessments, disease compliance, and biosecurity audit reports.'
  },
  FACILITY_MANAGER: {
    title: 'Operations Lead',
    tagline: 'Operational oversight & coordination',
    naturalExplanation:
      'Your tasks center on coordinating apiary teams, monitoring throughput, and auditing facility logs.'
  }
};

/**
 * Workspace tools mapping for each designation.
 * Human-centered tool descriptions (no technical module or RBAC jargon).
 */
const DESIGNATION_WORKSPACE_TOOLS = {
  BEEKEEPER: [
    'Hive monitoring & colony telemetry',
    'Field inspection logs & queen sightings',
    'Colony observation records',
    'Seasonal super & harvest tallies'
  ],
  PROCESSOR: [
    'Honey batch creation & lot codes',
    'Settling tank & curing logs',
    'Extraction & coarse filtration records',
    'Packaging & harvest traceability'
  ],
  LAB_SPECIALIST: [
    'Refractometry, moisture & HMF logs',
    'Certified laboratory purity reports',
    'Tamper seal approvals & blockchain anchors',
    'Compliance verification workflows'
  ],
  DISTRIBUTOR: [
    'Product inventory & stock management',
    'Shipment dispatch & transport logging',
    'Retailer handover manifests',
    'Batch provenance verification'
  ],
  INSPECTOR: [
    'Biosecurity audit records',
    'Disease inspection logs & photo evidence',
    'Official regulatory attestations',
    'Ledger verification trails'
  ],
  FACILITY_MANAGER: [
    'Cross-functional team coordination',
    'Operations dashboard & logs audit',
    'Facility throughput monitoring',
    'Batch movement approvals'
  ]
};

/**
 * Human-friendly summaries for setup combinations.
 */
const getSetupSummaryText = (designationIds = []) => {
  if (designationIds.length === 0) return 'No designation selected yet';
  const hasBeekeeper = designationIds.includes('BEEKEEPER');
  const hasProcessor = designationIds.includes('PROCESSOR');
  const hasQuality = designationIds.includes('LAB_SPECIALIST');
  const hasDistributor = designationIds.includes('DISTRIBUTOR');

  if (hasBeekeeper && hasProcessor && hasQuality) {
    return 'Hive operations, honey processing, and certified quality tools';
  }
  if (hasBeekeeper && hasProcessor) {
    return 'Hive operations and honey processing tools';
  }
  if (hasProcessor && hasQuality) {
    return 'Honey processing and quality verification tools';
  }
  if (hasQuality && hasDistributor) {
    return 'Quality assurance and product distribution tools';
  }
  if (hasBeekeeper && hasQuality) {
    return 'Hive management and purity testing tools';
  }
  if (hasBeekeeper) {
    return 'Hive operations and colony field management tools';
  }
  if (hasProcessor) {
    return 'Honey extraction, settling, and batch handling tools';
  }
  if (hasQuality) {
    return 'Certified quality testing and purity assurance tools';
  }
  if (hasDistributor) {
    return 'Storage inventory, packaging, and dispatch tools';
  }

  const titles = designationIds.map(id => HUMAN_DESIGNATION_META[id]?.title || id);
  return `${titles.join(' & ')} workspace tools`;
};

/**
 * Screen 11: "Why this fits"
 *
 * Fifth capability-discovery screen in HoneyChain's onboarding flow.
 * Transparently explains why each selected designation fits the user's declared tasks,
 * displays supporting evidence chips, human work context, resulting workspace tools,
 * and maintains complete user control over confirmation or adjustment.
 *
 * @param {Object} props
 * @param {Array<string>} props.selectedCapabilities - Array of canonical capability IDs
 * @param {Array<string>} props.selectedDesignations - Currently selected designation IDs
 * @param {Object} [props.workProfile={}] - Declared work style and environment from Screen 08
 * @param {Array<string>} [props.selectedContexts=[]] - Declared work contexts from Screen 06
 * @param {Function} props.onToggleDesignation - Callback (designationId: string) => void
 * @param {Function} props.onConfirmSetup - Callback () => void (advances to Screen 12 / Workspace)
 * @param {Function} props.onChangeSetup - Callback () => void (returns to Screen 10 / Suggestions)
 * @param {Function} props.onBackToAnswers - Callback () => void (returns to Screen 08 / Answers)
 * @param {string} [props.progress='5/5'] - Step progress label
 */
export const WhyThisFitsScreen = ({
  selectedCapabilities = [],
  selectedDesignations = [],
  workProfile = {},
  selectedContexts = [],
  onToggleDesignation,
  onConfirmSetup,
  onChangeSetup,
  onBackToAnswers,
  progress = '5/5'
}) => {
  const [activeSheetId, setActiveSheetId] = useState(null);

  // Evaluate designations dynamically in real time
  const evaluation = useMemo(() => {
    return evaluateDesignationEligibility(selectedCapabilities);
  }, [selectedCapabilities]);

  // Enriched selected designations list
  const selectedList = useMemo(() => {
    return selectedDesignations
      .map(id => {
        const desig = DESIGNATION_TAXONOMY.find(d => d.id === id);
        if (!desig) return null;

        const evalObj = evaluation.evaluations?.[id] || evaluation.evaluationsList?.find(e => e.designationId === id);

        // Match user's selected capabilities to this designation's required, core, and supporting tasks
        const matchedRequired = evalObj?.satisfiedRequired || desig.requiredCapabilities.filter(c => selectedCapabilities.includes(c));
        const matchedCore = evalObj?.satisfiedCore || desig.coreCapabilities.filter(c => selectedCapabilities.includes(c));
        const matchedSupporting = evalObj?.satisfiedSupporting || desig.supportingCapabilities.filter(c => selectedCapabilities.includes(c));

        const matchedIds = evalObj?.allMatchedCapabilities || [...matchedRequired, ...matchedCore, ...matchedSupporting];
        const matchedNames = matchedIds.map(cid => CANONICAL_CAPABILITY_MAP?.get(cid)?.name || CAPABILITY_MAP.get(cid)?.name || cid);

        const tools = DESIGNATION_WORKSPACE_TOOLS[id] || [];
        const meta = HUMAN_DESIGNATION_META[id] || {
          title: desig.name,
          tagline: desig.tagline,
          naturalExplanation: 'This workspace matches the tasks you selected.'
        };

        const requiresVerification = id === 'LAB_SPECIALIST' || id === 'INSPECTOR';

        return {
          id,
          desig,
          title: meta.title,
          tagline: meta.tagline,
          naturalExplanation: meta.naturalExplanation,
          matchedNames,
          tools,
          requiresVerification
        };
      })
      .filter(Boolean);
  }, [selectedDesignations, selectedCapabilities]);

  // Active designation for bottom sheet
  const activeExplainingItem = useMemo(() => {
    if (!activeSheetId) return null;
    return selectedList.find(item => item.id === activeSheetId) || null;
  }, [activeSheetId, selectedList]);

  // Human work context chips
  const workContextChips = useMemo(() => {
    const chips = [];
    if (selectedContexts.includes('HIVE_OPERATIONS')) chips.push('Hives');
    if (selectedContexts.includes('HONEY_OPERATIONS')) chips.push('Honey batches');
    if (selectedContexts.includes('QUALITY_OPERATIONS')) chips.push('Purity & quality');
    if (selectedContexts.includes('DISTRIBUTION_OPERATIONS')) chips.push('Distribution');

    if (workProfile.workStyle?.includes('INDEPENDENT')) chips.push('Independent work');
    if (workProfile.workStyle?.includes('COLLABORATIVE')) chips.push('Team collaboration');
    if (workProfile.workLocations?.includes('APIARY')) chips.push('Apiary');
    if (workProfile.workLocations?.includes('PROCESSING')) chips.push('Processing facility');
    if (workProfile.workLocations?.includes('LAB')) chips.push('Laboratory');

    return chips.length > 0 ? chips : ['Apiary & field work'];
  }, [selectedContexts, workProfile]);

  const hasSelection = selectedList.length > 0;
  const isSingle = selectedList.length === 1;
  const anyRequiresVerification = selectedList.some(item => item.requiresVerification);
  const setupSummary = useMemo(() => getSetupSummaryText(selectedDesignations), [selectedDesignations]);

  return (
    <section
      className="why-fits-viewport"
      aria-labelledby="why-fits-heading"
      role="region"
    >
      {/* Top Header & Navigation */}
      <header className="why-fits-nav-header">
        <button
          type="button"
          className="why-fits-back-btn"
          onClick={onChangeSetup}
          aria-label="Return to designation selection"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="why-fits-progress-wrap" aria-label={`Step progress: ${progress}`}>
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
          <span className="why-fits-progress-text">{progress}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="why-fits-main-content">
        {/* Screen Copy Header */}
        <div className="why-fits-copy-block">
          <span className="micro-badge-lead">Workspace Alignment</span>
          <h1 id="why-fits-heading" className="why-fits-heading">
            {isSingle ? `Why ${selectedList[0].title} fits` : 'Why this fits your work'}
          </h1>
          <p className="why-fits-supporting-text">
            {isSingle
              ? `You selected work that centers on ${selectedList[0].tagline.toLowerCase()}.`
              : 'HoneyChain connected your declared tasks and environment directly to your workspace setup.'}
          </p>

          {/* Context Tag Chips */}
          <div className="context-chips-block">
            <span className="context-chips-label">Your work context:</span>
            <div className="context-chips-row">
              {workContextChips.map((chip, idx) => (
                <span key={idx} className="context-chip">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            EDGE CASE: NO VALID DESIGNATION SELECTED
           ======================================================== */}
        {!hasSelection && (
          <div className="no-selection-card animate-fade-slide">
            <div className="no-selection-icon-wrap">
              <SlidersHorizontal size={24} color="#B87316" />
            </div>
            <h2 className="no-selection-title">Let's refine your setup.</h2>
            <p className="no-selection-body">
              Your current answers don't map cleanly to a workspace yet. Choose at least one designation or review your tasks.
            </p>
            <div className="no-selection-actions">
              <button
                type="button"
                className="btn-refine-primary"
                onClick={onChangeSetup}
              >
                Return to suggestions
              </button>
              <button
                type="button"
                className="btn-refine-secondary"
                onClick={onBackToAnswers}
              >
                Review my answers
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            PRIMARY CONTENT: SELECTED DESIGNATIONS EXPLANATION
           ======================================================== */}
        {hasSelection && (
          <div className="why-fits-stack">
            <div className="section-title-row">
              <span className="section-title">Your setup</span>
              <span className="section-badge">
                {selectedList.length} {selectedList.length === 1 ? 'identity' : 'identities'}
              </span>
            </div>

            <div className="designations-breakdown-list">
              {selectedList.map((item) => (
                <article
                  key={item.id}
                  className="designation-explanation-card"
                  aria-labelledby={`card-title-${item.id}`}
                >
                  {/* Card Header */}
                  <div className="card-top-row">
                    <div className="card-icon-pill" aria-hidden="true">
                      {renderDesignationIcon(item.id, 18)}
                    </div>
                    <div className="card-title-col">
                      <div className="card-title-badge-wrap">
                        <h2 id={`card-title-${item.id}`} className="card-title">
                          {item.title}
                        </h2>
                        <span className="card-confirmed-pill">
                          <Check size={11} strokeWidth={3} />
                          <span>Selected</span>
                        </span>
                      </div>
                      <span className="card-tagline">{item.tagline}</span>
                    </div>
                  </div>

                  {/* Natural Why Fits Explanation */}
                  <p className="card-natural-why">
                    {item.naturalExplanation}
                  </p>

                  {/* Evidence Section: Based on what you told us */}
                  <div className="evidence-section">
                    <span className="sub-heading">Based on what you told us</span>
                    {item.matchedNames.length > 0 ? (
                      <div className="evidence-chips-wrap">
                        {item.matchedNames.map((taskName, idx) => (
                          <div key={idx} className="evidence-chip">
                            <Check size={12} color="#D99A24" strokeWidth={2.6} />
                            <span>{taskName}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="fallback-evidence">
                        Aligned with foundational operational tasks.
                      </p>
                    )}
                  </div>

                  {/* What This Setup Gives You */}
                  <div className="tools-section">
                    <span className="sub-heading">With this setup you'll have</span>
                    <ul className="tools-list">
                      {item.tools.slice(0, 3).map((tool, idx) => (
                        <li key={idx} className="tool-row">
                          <span className="tool-bullet">•</span>
                          <span>{tool}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Verification Notice if applicable */}
                  {item.requiresVerification && (
                    <div className="verification-inline-box">
                      <ShieldCheck size={14} color="#B87316" />
                      <div className="verification-text-wrap">
                        <strong>Some activities may require verification</strong>
                        <p>Certain quality or regulated actions will become available after policy verification.</p>
                      </div>
                    </div>
                  )}

                  {/* Card Footer: Detail Sheet Trigger */}
                  <div className="card-footer-row">
                    <button
                      type="button"
                      className="btn-why-it-fits"
                      onClick={() => setActiveSheetId(item.id)}
                      aria-label={`Open detailed breakdown for ${item.title}`}
                    >
                      <span>Why it fits</span>
                      <ChevronRight size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Reassuring Global Verification Notice if any item needs verification */}
            {anyRequiresVerification && (
              <div className="global-verification-banner">
                <Info size={16} color="#786D61" />
                <p>
                  You can explore your workspace immediately. Sensitive compliance actions remain safeguarded by HoneyChain access policies.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          STICKY BOTTOM ACTION DOCK
         ======================================================== */}
      <footer className="why-fits-bottom-dock">
        {/* Setup Summary Microcopy */}
        <div className="dock-summary-block" aria-live="polite">
          <div className="dock-summary-lead">
            <strong>Your setup</strong>
            <span className="dock-names-highlight">
              {selectedList.map(item => item.title).join(' + ')}
            </span>
          </div>
          <span className="dock-summary-tools">{setupSummary}</span>
        </div>

        {/* Primary CTA and Secondary Change Setup */}
        <div className="dock-actions-row">
          <button
            type="button"
            className={`btn-use-setup-cta ${!hasSelection ? 'disabled' : ''}`}
            onClick={onConfirmSetup}
            disabled={!hasSelection}
            aria-disabled={!hasSelection}
          >
            <span>Use this setup</span>
            <ArrowRight size={18} />
          </button>
        </div>

        <button
          type="button"
          className="btn-change-setup"
          onClick={onChangeSetup}
          aria-label="Change selected designations"
        >
          <span>Change setup</span>
        </button>
      </footer>

      {/* ========================================================
          DESIGNATION EXPLANATION BOTTOM SHEET
         ======================================================== */}
      {activeExplainingItem && (
        <div
          className="modal-sheet-backdrop"
          onClick={() => setActiveSheetId(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sheet-designation-title"
        >
          <div
            className="modal-sheet-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-drag-handle" />

            <div className="sheet-header">
              <div className="sheet-title-wrap">
                <span className="sheet-kicker">Designation Breakdown</span>
                <h2 id="sheet-designation-title" className="sheet-title">
                  Why {activeExplainingItem.title} fits
                </h2>
              </div>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={() => setActiveSheetId(null)}
                aria-label="Close sheet"
              >
                <X size={18} />
              </button>
            </div>

            <p className="sheet-supporting-text">
              {activeExplainingItem.naturalExplanation}
            </p>

            {/* Evidence: You Selected */}
            <div className="sheet-content-section">
              <span className="section-label">You selected</span>
              <div className="sheet-chips-wrap">
                {activeExplainingItem.matchedNames.map((task, i) => (
                  <div key={i} className="sheet-evidence-chip">
                    <Check size={12} color="#D99A24" strokeWidth={2.8} />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* This Workspace Includes */}
            <div className="sheet-content-section">
              <span className="section-label">This workspace includes</span>
              <div className="sheet-tools-list">
                {activeExplainingItem.tools.map((tool, i) => (
                  <div key={i} className="sheet-tool-row">
                    <span className="bullet">•</span>
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Note */}
            {activeExplainingItem.requiresVerification && (
              <div className="sheet-verification-box">
                <ShieldCheck size={15} color="#B87316" />
                <span>
                  Certain quality or regulated actions will become available after policy verification.
                </span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="sheet-actions-stack">
              <button
                type="button"
                className="btn-sheet-primary"
                onClick={() => {
                  setActiveSheetId(null);
                }}
              >
                Keep in setup
              </button>
              <button
                type="button"
                className="btn-sheet-secondary"
                onClick={() => {
                  onToggleDesignation?.(activeExplainingItem.id);
                  setActiveSheetId(null);
                }}
              >
                Remove from setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS Styles adhering strictly to HoneyChain Visual System */}
      <style>{`
        .why-fits-viewport {
          position: relative;
          height: 100%;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          background: #FFF9EF;
          color: #34261B;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
          box-sizing: border-box;
        }

        .why-fits-nav-header {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px 12px 20px;
          border-bottom: 1px solid #EDE2D1;
          background: #FFFDF8;
          z-index: 10;
        }

        .why-fits-back-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid #EDE2D1;
          background: #FFFDF8;
          color: #34261B;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .why-fits-back-btn:hover {
          background: #FAF4E8;
          border-color: #D99A24;
        }

        .why-fits-progress-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-dots-track {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .p-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #EDE2D1;
        }

        .p-dot.completed {
          background: #71845B;
        }

        .p-dot.active {
          background: #D99A24;
          box-shadow: 0 0 0 2px rgba(217, 154, 36, 0.2);
        }

        .p-line {
          width: 8px;
          height: 2px;
          background: #EDE2D1;
        }

        .p-line.completed {
          background: #71845B;
        }

        .why-fits-progress-text {
          font-size: 12px;
          font-weight: 700;
          color: #786D61;
          letter-spacing: 0.5px;
        }

        .why-fits-main-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 24px 20px 160px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .why-fits-copy-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .micro-badge-lead {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #B87316;
        }

        .why-fits-heading {
          font-size: 26px;
          font-weight: 750;
          line-height: 1.25;
          color: #34261B;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .why-fits-supporting-text {
          font-size: 14.5px;
          line-height: 1.45;
          color: #786D61;
          margin: 0;
        }

        .context-chips-block {
          margin-top: 4px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .context-chips-label {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #786D61;
        }

        .context-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .context-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 12px;
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          font-size: 12px;
          font-weight: 600;
          color: #34261B;
        }

        .why-fits-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 4px;
          border-bottom: 1px solid #EDE2D1;
        }

        .section-title {
          font-size: 14px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #34261B;
        }

        .section-badge {
          font-size: 11px;
          font-weight: 700;
          color: #B87316;
          background: #FAF2E2;
          padding: 2px 8px;
          border-radius: 10px;
          border: 1px solid #EDE2D1;
        }

        .designations-breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .designation-explanation-card {
          background: #FFFDF8;
          border: 1.5px solid #EDE2D1;
          border-radius: 16px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 2px 8px rgba(52, 38, 27, 0.04);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .designation-explanation-card:hover {
          border-color: #D99A24;
          box-shadow: 0 4px 12px rgba(217, 154, 36, 0.08);
        }

        .card-top-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .card-icon-pill {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #FAF2E2;
          border: 1px solid #EDE2D1;
          color: #B87316;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-title-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .card-title-badge-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 750;
          color: #34261B;
          margin: 0;
        }

        .card-confirmed-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 10px;
          background: #FAF2E2;
          border: 1px solid #D99A24;
          color: #B87316;
          font-size: 11px;
          font-weight: 700;
        }

        .card-tagline {
          font-size: 13px;
          color: #786D61;
        }

        .card-natural-why {
          font-size: 13.5px;
          line-height: 1.45;
          color: #34261B;
          margin: 0;
          background: #FAF8F2;
          padding: 10px 12px;
          border-radius: 10px;
          border-left: 3px solid #D99A24;
        }

        .evidence-section,
        .tools-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sub-heading {
          font-size: 12px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #786D61;
        }

        .evidence-chips-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .evidence-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 8px;
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          font-size: 12px;
          font-weight: 600;
          color: #34261B;
        }

        .fallback-evidence {
          font-size: 12px;
          color: #786D61;
          font-style: italic;
          margin: 0;
        }

        .tools-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tool-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: #34261B;
        }

        .tool-bullet {
          color: #D99A24;
          font-weight: bold;
        }

        .verification-inline-box {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 10px;
          background: #FCF5EA;
          border: 1px solid #EDE2D1;
        }

        .verification-text-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .verification-text-wrap strong {
          font-size: 12px;
          color: #B87316;
        }

        .verification-text-wrap p {
          font-size: 11.5px;
          color: #786D61;
          margin: 0;
          line-height: 1.35;
        }

        .card-footer-row {
          display: flex;
          justify-content: flex-end;
          padding-top: 4px;
          border-top: 1px dashed #EDE2D1;
        }

        .btn-why-it-fits {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          font-size: 12.5px;
          font-weight: 700;
          color: #B87316;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 6px;
          transition: background 0.15s ease;
        }

        .btn-why-it-fits:hover {
          background: #FAF2E2;
          color: #D99A24;
        }

        .global-verification-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #FAF8F2;
          border: 1px solid #EDE2D1;
          font-size: 12px;
          color: #786D61;
          line-height: 1.4;
        }

        .global-verification-banner p {
          margin: 0;
        }

        .no-selection-card {
          background: #FFFDF8;
          border: 1.5px solid #EDE2D1;
          border-radius: 16px;
          padding: 28px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .no-selection-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #FAF2E2;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .no-selection-title {
          font-size: 18px;
          font-weight: 750;
          color: #34261B;
          margin: 0;
        }

        .no-selection-body {
          font-size: 13.5px;
          line-height: 1.45;
          color: #786D61;
          margin: 0;
          max-width: 320px;
        }

        .no-selection-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          max-width: 260px;
          margin-top: 8px;
        }

        .btn-refine-primary {
          height: 42px;
          border-radius: 10px;
          background: #D99A24;
          color: #FFFFFF;
          border: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-refine-secondary {
          height: 40px;
          border-radius: 10px;
          background: transparent;
          color: #786D61;
          border: 1px solid #EDE2D1;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
        }

        .why-fits-bottom-dock {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 253, 248, 0.96);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-top: 1px solid #EDE2D1;
          padding: 12px 20px 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 30;
          box-shadow: 0 -4px 16px rgba(52, 38, 27, 0.05);
        }

        .dock-summary-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dock-summary-lead {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #34261B;
        }

        .dock-names-highlight {
          font-weight: 750;
          color: #B87316;
        }

        .dock-summary-tools {
          font-size: 11.5px;
          color: #786D61;
          line-height: 1.35;
        }

        .dock-actions-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-use-setup-cta {
          flex: 1;
          height: 48px;
          border-radius: 12px;
          background: #D99A24;
          border: none;
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(217, 154, 36, 0.25);
          transition: all 0.15s ease;
        }

        .btn-use-setup-cta:hover:not(.disabled) {
          background: #C88A1A;
          transform: translateY(-1px);
        }

        .btn-use-setup-cta.disabled {
          background: #EDE2D1;
          color: #A4988B;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-change-setup {
          background: transparent;
          border: none;
          color: #786D61;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px;
          align-self: center;
          transition: color 0.15s ease;
        }

        .btn-change-setup:hover {
          color: #34261B;
          text-decoration: underline;
        }

        /* Bottom Sheet Styles */
        .modal-sheet-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(52, 38, 27, 0.45);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          animation: backdropFade 0.2s ease-out;
        }

        .modal-sheet-card {
          width: 100%;
          max-width: 480px;
          background: #FFFDF8;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
          padding: 12px 20px 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 -8px 30px rgba(52, 38, 27, 0.15);
          max-height: 85vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          animation: sheetSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sheet-drag-handle {
          width: 36px;
          height: 4px;
          background: #EDE2D1;
          border-radius: 2px;
          align-self: center;
          margin-bottom: 4px;
        }

        .sheet-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .sheet-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sheet-kicker {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #B87316;
        }

        .sheet-title {
          font-size: 20px;
          font-weight: 750;
          color: #34261B;
          margin: 0;
        }

        .sheet-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #EDE2D1;
          background: #FFF9EF;
          color: #786D61;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .sheet-supporting-text {
          font-size: 13.5px;
          line-height: 1.45;
          color: #786D61;
          margin: 0;
        }

        .sheet-content-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-label {
          font-size: 12px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #786D61;
        }

        .sheet-chips-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .sheet-evidence-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 8px;
          background: #FAF8F2;
          border: 1px solid #EDE2D1;
          font-size: 12px;
          font-weight: 600;
          color: #34261B;
        }

        .sheet-tools-list {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .sheet-tool-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #34261B;
        }

        .sheet-tool-row .bullet {
          color: #D99A24;
          font-weight: bold;
        }

        .sheet-verification-box {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 10px;
          background: #FCF5EA;
          border: 1px solid #EDE2D1;
          font-size: 12px;
          color: #786D61;
          line-height: 1.35;
        }

        .sheet-actions-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 6px;
        }

        .btn-sheet-primary {
          height: 44px;
          border-radius: 12px;
          background: #D99A24;
          border: none;
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-sheet-secondary {
          height: 40px;
          border-radius: 12px;
          background: transparent;
          border: 1px solid #EDE2D1;
          color: #786D61;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
        }

        @keyframes backdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes sheetSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .animate-fade-slide {
          animation: fadeSlide 0.25s ease-out;
        }

        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default WhyThisFitsScreen;
