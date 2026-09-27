import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  X,
  User,
  Users,
  Building2,
  Network,
  Layers,
  MapPin,
  Search,
  Activity,
  Package,
  Filter,
  FileText,
  Truck,
  FlaskConical,
  ClipboardCheck,
  FileCheck,
  ShieldCheck,
  Boxes,
  Tag,
  ShoppingBag,
  Sun,
  Home,
  Compass,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import {
  resolveRelevantWorkQuestions,
  normalizeWorkOrganizationProfile
} from '../../services/workOrganizationTaxonomy';

/**
 * Cohesive icon renderer for tactile work organization cards.
 */
const renderWorkIcon = (iconName, size = 18) => {
  switch (iconName) {
    case 'User': return <User size={size} />;
    case 'Users': return <Users size={size} />;
    case 'Building2': return <Building2 size={size} />;
    case 'Network': return <Network size={size} />;
    case 'Layers': return <Layers size={size} />;
    case 'MapPin': return <MapPin size={size} />;
    case 'Search': return <Search size={size} />;
    case 'Activity': return <Activity size={size} />;
    case 'Package': return <Package size={size} />;
    case 'Filter': return <Filter size={size} />;
    case 'FileText': return <FileText size={size} />;
    case 'Truck': return <Truck size={size} />;
    case 'FlaskConical': return <FlaskConical size={size} />;
    case 'ClipboardCheck': return <ClipboardCheck size={size} />;
    case 'FileCheck': return <FileCheck size={size} />;
    case 'ShieldCheck': return <ShieldCheck size={size} />;
    case 'Boxes': return <Boxes size={size} />;
    case 'Tag': return <Tag size={size} />;
    case 'ShoppingBag': return <ShoppingBag size={size} />;
    case 'Sun': return <Sun size={size} />;
    case 'Home': return <Home size={size} />;
    case 'Compass': return <Compass size={size} />;
    default: return <Sparkles size={size} />;
  }
};

/**
 * Screen 08: "How do you work?"
 *
 * Third interactive capability-discovery screen in HoneyChain's onboarding flow.
 * Collects human operational context (collaboration, scope of items handled,
 * work scale, and physical work environments).
 *
 * Progressively discloses questions so the user is never faced with a daunting form.
 * Strictly decoupled from designation decisions (no role assignment).
 *
 * @param {Object} props
 * @param {Array<string>} props.selectedContexts - Selected context IDs from Screen 06
 * @param {Array<string>} props.selectedCapabilities - Selected capability IDs from Screen 07
 * @param {Object} props.workProfile - Current work organization profile
 * @param {Function} props.onUpdateWorkProfile - Callback (profile: Object) => void
 * @param {Function} props.onContinue - Callback () => void
 * @param {Function} props.onBack - Callback () => void
 * @param {string} [props.progress='3/5'] - Step progress label
 */
export const WorkOrganizationScreen = ({
  selectedContexts = [],
  selectedCapabilities = [],
  workProfile = {},
  onUpdateWorkProfile,
  onContinue,
  onBack,
  progress = '3/5'
}) => {
  // Normalize initial work profile state
  const normalized = useMemo(() => {
    return normalizeWorkOrganizationProfile(workProfile);
  }, [workProfile]);

  const [workStyle, setWorkStyle] = useState(normalized.workStyle || []);
  const [handledItems, setHandledItems] = useState(normalized.handledItems || []);
  const [operationalScale, setOperationalScale] = useState(normalized.operationalScale || null);
  const [workLocations, setWorkLocations] = useState(normalized.workLocations || []);

  const [showHelperSheet, setShowHelperSheet] = useState(false);
  const [attemptedWithoutSelection, setAttemptedWithoutSelection] = useState(false);

  // Dynamic question relevance rules based on Screen 06 & 07 selections
  const relevance = useMemo(() => {
    return resolveRelevantWorkQuestions({
      selectedContexts,
      selectedCapabilities
    });
  }, [selectedContexts, selectedCapabilities]);

  // Questions answered states for progressive disclosure
  const isQ1Answered = workStyle.length > 0;
  const isQ2Answered = handledItems.length > 0;
  const isQ3Answered = !relevance.hasScaleQuestion || operationalScale !== null;
  const isQ4Answered = workLocations.length > 0;

  // Minimum required contextual information to proceed
  const isReadyToContinue = isQ1Answered && isQ2Answered;

  // Sync state upward when answers change
  useEffect(() => {
    onUpdateWorkProfile?.({
      workStyle,
      collaborationContext: workStyle,
      handledItems,
      operationalScale,
      workLocations
    });
  }, [workStyle, handledItems, operationalScale, workLocations, onUpdateWorkProfile]);

  // Progressive scroll refs
  const q2Ref = useRef(null);
  const q3Ref = useRef(null);
  const q4Ref = useRef(null);

  // Handlers for Question 1: Who do you work with?
  const toggleWorkStyle = (styleId) => {
    setAttemptedWithoutSelection(false);
    setWorkStyle((prev) => {
      const next = prev.includes(styleId)
        ? prev.filter((id) => id !== styleId)
        : [...prev, styleId];
      return next;
    });
  };

  // Handlers for Question 2: What do you usually handle?
  const toggleHandledItem = (itemId) => {
    setAttemptedWithoutSelection(false);
    setHandledItems((prev) => {
      const next = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      return next;
    });
  };

  // Handlers for Question 3: Scale
  const selectScale = (scaleId) => {
    setAttemptedWithoutSelection(false);
    setOperationalScale((prev) => (prev === scaleId ? null : scaleId));
  };

  // Handlers for Question 4: Where do you work?
  const toggleWorkLocation = (locationId) => {
    setAttemptedWithoutSelection(false);
    setWorkLocations((prev) => {
      const next = prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId];
      return next;
    });
  };

  // CTA continue handler
  const handleContinueClick = (e) => {
    e.preventDefault();
    if (!isReadyToContinue) {
      setAttemptedWithoutSelection(true);
      return;
    }
    setAttemptedWithoutSelection(false);
    onContinue?.();
  };

  // Microcopy generation for feedback bar
  const getFeedbackMicrocopy = () => {
    if (!isQ1Answered) {
      return 'Tell us who you work with to begin.';
    }
    if (!isQ2Answered) {
      return 'Select what you usually handle.';
    }
    if (relevance.hasScaleQuestion && operationalScale === null) {
      return 'Choose an approximate scale or continue.';
    }
    if (!isQ4Answered) {
      return 'Select your primary work locations or continue.';
    }
    return 'Great! HoneyChain has a clear picture of how your work is organized.';
  };

  return (
    <section
      className="work-organization-viewport"
      aria-labelledby="organization-heading"
      role="region"
    >
      {/* Top Navigation & Minimal Progress Indicator (3/5) */}
      <header className="organization-nav-header">
        <button
          type="button"
          className="organization-back-btn"
          onClick={onBack}
          aria-label="Return to task discovery"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="organization-progress-wrap" aria-label={`Step progress: ${progress}`}>
          <div className="progress-dots-track" aria-hidden="true">
            <span className="p-dot completed" />
            <span className="p-line completed" />
            <span className="p-dot completed" />
            <span className="p-line completed" />
            <span className="p-dot active" />
            <span className="p-line" />
            <span className="p-dot" />
            <span className="p-line" />
            <span className="p-dot" />
          </div>
          <span className="organization-progress-text">{progress}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="organization-main-content">
        {/* Screen Copy Header */}
        <div className="organization-copy-block">
          <span className="micro-badge-lead">Operational Context</span>
          <h1 id="organization-heading" className="organization-heading">
            How do you work?
          </h1>
          <p className="organization-supporting-text">
            Tell us a little about how your work is organized.
          </p>

          <div className="organization-helper-row">
            <span className="organization-contextual-helper">
              This helps us shape your workspace around the way you actually work.
            </span>
            <button
              type="button"
              className="btn-helper-link"
              onClick={() => setShowHelperSheet(true)}
              aria-label="Not sure what to choose? Open guidance sheet"
            >
              <HelpCircle size={13} />
              <span>Not sure what to choose?</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            QUESTION 1 — WHO DO YOU USUALLY WORK WITH?
           ======================================================== */}
        <div className="progressive-question-section q1-section">
          <div className="question-header-row">
            <div className="question-number-badge">1</div>
            <div className="question-meta">
              <h2 className="question-title">Who do you usually work with?</h2>
              <p className="question-subtitle">
                Choose one or more that describe your day-to-day setup.
              </p>
            </div>
          </div>

          <div
            className="cards-grid"
            role="group"
            aria-label="Who do you usually work with options"
          >
            {relevance.collaborationOptions.map((opt) => {
              const isSelected = workStyle.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  role="checkbox"
                  tabIndex={0}
                  aria-checked={isSelected}
                  aria-label={`${opt.title}. ${opt.description}. ${isSelected ? 'Selected' : 'Not selected'}`}
                  className={`tactile-choice-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleWorkStyle(opt.id)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      toggleWorkStyle(opt.id);
                    }
                  }}
                >
                  <div className={`card-icon-wrap ${isSelected ? 'selected' : ''}`} aria-hidden="true">
                    {renderWorkIcon(opt.icon, 16)}
                  </div>

                  <div className="card-body-wrap">
                    <strong className="card-title">{opt.title}</strong>
                    <p className="card-description">{opt.description}</p>
                  </div>

                  <div className={`card-check-pill ${isSelected ? 'checked' : ''}`} aria-hidden="true">
                    <Check size={12} strokeWidth={2.8} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            QUESTION 2 — WHAT DO YOU USUALLY HANDLE? (Progressive Reveal)
           ======================================================== */}
        {isQ1Answered && relevance.hasHandledItems && (
          <div ref={q2Ref} className="progressive-question-section q2-section animate-fade-slide">
            <div className="question-header-row">
              <div className="question-number-badge">2</div>
              <div className="question-meta">
                <h2 className="question-title">What do you usually handle?</h2>
                <p className="question-subtitle">
                  Tailored to the work areas you selected earlier.
                </p>
              </div>
            </div>

            {relevance.handledGroups.map((group) => {
              return (
                <div key={group.contextId} className="handled-subgroup-block">
                  <div className="subgroup-title-row">
                    <span className="subgroup-title">{group.groupLabel}</span>
                  </div>

                  <div
                    className="cards-grid"
                    role="group"
                    aria-label={`${group.groupLabel} handled items`}
                  >
                    {group.items.map((item) => {
                      const isSelected = handledItems.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          role="checkbox"
                          tabIndex={0}
                          aria-checked={isSelected}
                          aria-label={`${item.title}. ${item.description}. ${isSelected ? 'Selected' : 'Not selected'}`}
                          className={`tactile-choice-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleHandledItem(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              toggleHandledItem(item.id);
                            }
                          }}
                        >
                          <div className={`card-icon-wrap ${isSelected ? 'selected' : ''}`} aria-hidden="true">
                            {renderWorkIcon(item.icon, 16)}
                          </div>

                          <div className="card-body-wrap">
                            <strong className="card-title">{item.title}</strong>
                            <p className="card-description">{item.description}</p>
                          </div>

                          <div className={`card-check-pill ${isSelected ? 'checked' : ''}`} aria-hidden="true">
                            <Check size={12} strokeWidth={2.8} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================
            QUESTION 3 — WORK SCALE (Contextual & Progressive Reveal)
           ======================================================== */}
        {isQ2Answered && relevance.hasScaleQuestion && (
          <div ref={q3Ref} className="progressive-question-section q3-section animate-fade-slide">
            <div className="question-header-row">
              <div className="question-number-badge">3</div>
              <div className="question-meta">
                <h2 className="question-title">
                  {relevance.scaleQuestion.title}
                </h2>
                <p className="question-subtitle">
                  {relevance.scaleQuestion.subtitle}
                </p>
              </div>
            </div>

            <div
              className="cards-grid"
              role="radiogroup"
              aria-label="Work scale options"
            >
              {relevance.scaleQuestion.options.map((opt) => {
                const isSelected = operationalScale === opt.id;
                return (
                  <div
                    key={opt.id}
                    role="radio"
                    tabIndex={0}
                    aria-checked={isSelected}
                    aria-label={`${opt.title}. ${opt.description}. ${isSelected ? 'Selected' : 'Not selected'}`}
                    className={`tactile-choice-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => selectScale(opt.id)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        selectScale(opt.id);
                      }
                    }}
                  >
                    <div className={`card-icon-wrap ${isSelected ? 'selected' : ''}`} aria-hidden="true">
                      <Sparkles size={16} />
                    </div>

                    <div className="card-body-wrap">
                      <strong className="card-title">{opt.title}</strong>
                      <p className="card-description">{opt.description}</p>
                    </div>

                    <div className={`card-check-pill ${isSelected ? 'checked' : ''}`} aria-hidden="true">
                      <Check size={12} strokeWidth={2.8} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="scale-optional-action">
              <button
                type="button"
                className="btn-opt-skip"
                onClick={() => setOperationalScale('SCALE_DECIDE_LATER')}
              >
                I'll decide later
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            QUESTION 4 — WHERE DOES YOUR WORK HAPPEN? (Progressive Reveal)
           ======================================================== */}
        {isQ2Answered && (
          <div ref={q4Ref} className="progressive-question-section q4-section animate-fade-slide">
            <div className="question-header-row">
              <div className="question-number-badge">
                {relevance.hasScaleQuestion ? '4' : '3'}
              </div>
              <div className="question-meta">
                <h2 className="question-title">Where does most of your work happen?</h2>
                <p className="question-subtitle">
                  Select the primary environments where you spend your time.
                </p>
              </div>
            </div>

            <div
              className="cards-grid"
              role="group"
              aria-label="Work location options"
            >
              {relevance.locationOptions.map((opt) => {
                const isSelected = workLocations.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    role="checkbox"
                    tabIndex={0}
                    aria-checked={isSelected}
                    aria-label={`${opt.title}. ${opt.description}. ${isSelected ? 'Selected' : 'Not selected'}`}
                    className={`tactile-choice-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleWorkLocation(opt.id)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        toggleWorkLocation(opt.id);
                      }
                    }}
                  >
                    <div className={`card-icon-wrap ${isSelected ? 'selected' : ''}`} aria-hidden="true">
                      {renderWorkIcon(opt.icon, 16)}
                    </div>

                    <div className="card-body-wrap">
                      <strong className="card-title">{opt.title}</strong>
                      <p className="card-description">{opt.description}</p>
                    </div>

                    <div className={`card-check-pill ${isSelected ? 'checked' : ''}`} aria-hidden="true">
                      <Check size={12} strokeWidth={2.8} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="location-disclaimer-note">
              <span>This helps organize your tools and maps, without restricting what you can access.</span>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Area */}
      <footer className="organization-bottom-dock">
        {/* Dynamic Microcopy / Validation Feedback */}
        <div className="organization-feedback-bar" aria-live="polite">
          {attemptedWithoutSelection && !isReadyToContinue && (
            <div className="validation-inline-error" role="alert">
              <span>Please answer who you work with and what you handle to continue.</span>
            </div>
          )}

          {(!attemptedWithoutSelection || isReadyToContinue) && (
            <div className="feedback-message-wrap">
              <span className="contextual-microcopy">
                {getFeedbackMicrocopy()}
              </span>
            </div>
          )}
        </div>

        {/* Primary CTA */}
        <div className="dock-actions-row">
          <button
            type="button"
            className={`btn-continue-cta ${!isReadyToContinue ? 'disabled' : ''}`}
            onClick={handleContinueClick}
            aria-disabled={!isReadyToContinue}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </footer>

      {/* Guidance Bottom Sheet */}
      {showHelperSheet && (
        <div
          className="helper-modal-backdrop"
          onClick={() => setShowHelperSheet(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="helper-sheet-title"
        >
          <div
            className="helper-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="helper-drag-handle" />

            <div className="helper-sheet-header">
              <h2 id="helper-sheet-title" className="helper-title">
                How HoneyChain uses this
              </h2>
              <button
                type="button"
                className="helper-close-btn"
                onClick={() => setShowHelperSheet(false)}
                aria-label="Close guidance"
              >
                <X size={18} />
              </button>
            </div>

            <p className="helper-body-text">
              We use your working environment to organize your field tools, yard maps, and batch lists so you don't have to wade through irrelevant screens.
            </p>

            <div className="helper-examples-list">
              <div className="helper-example-item">
                <span className="helper-bullet">👤</span>
                <span><strong>Solo apiarists</strong> get compact quick-logging for single-hand mobile use.</span>
              </div>
              <div className="helper-example-item">
                <span className="helper-bullet">👥</span>
                <span><strong>Teams</strong> get shared yard activity feeds and handoff records.</span>
              </div>
              <div className="helper-example-item">
                <span className="helper-bullet">🏢</span>
                <span><strong>Enterprises & labs</strong> get lot traceability and multi-site views.</span>
              </div>
            </div>

            <div className="helper-actions-bar">
              <button
                type="button"
                className="btn-helper-dismiss"
                onClick={() => setShowHelperSheet(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS Styles adhering strictly to HoneyChain Visual System */}
      <style>{`
        .work-organization-viewport {
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
        .organization-nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: calc(var(--safe-top, 0px) + 12px) var(--mobile-pad, 20px) 12px;
          background-color: var(--color-warm-cream, #FFF9EF);
          flex-shrink: 0;
          border-bottom: 1px solid rgba(237, 226, 209, 0.45);
          z-index: 10;
        }

        .organization-back-btn {
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

        .organization-back-btn:active {
          transform: scale(0.96);
          background-color: #FAF4E8;
        }

        .organization-progress-wrap {
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

        .organization-progress-text {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--color-deep-honey, #B87316);
          letter-spacing: 0.02em;
        }

        /* -------------------------------------------------------------
           Main Content Area
           ------------------------------------------------------------- */
        .organization-main-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 16px var(--mobile-pad, 20px) 140px;
          display: flex;
          flex-direction: column;
          gap: 22px;
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

        .organization-heading {
          font-size: 26px;
          line-height: 1.22;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0 0 6px 0;
          letter-spacing: -0.015em;
        }

        .organization-supporting-text {
          font-size: 14.5px;
          line-height: 1.45;
          color: var(--color-warm-gray, #786D61);
          margin: 0 0 10px 0;
        }

        .organization-helper-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px;
          background-color: rgba(255, 253, 248, 0.7);
          border: 1px dashed var(--color-border-warm, #EDE2D1);
          border-radius: 10px;
        }

        .organization-contextual-helper {
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
           Progressive Question Sections
           ------------------------------------------------------------- */
        .progressive-question-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background-color: rgba(255, 253, 248, 0.9);
          border: 1.5px solid var(--color-border-warm, #EDE2D1);
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(52, 38, 27, 0.03);
          transition: all 0.25s ease;
        }

        .animate-fade-slide {
          animation: fadeSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .question-header-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .question-number-badge {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background-color: var(--color-primary-honey, #D99A24);
          color: #FFFDF8;
          font-size: 11.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .question-meta {
          flex: 1;
        }

        .question-title {
          font-size: 16.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0 0 3px 0;
          line-height: 1.3;
        }

        .question-subtitle {
          font-size: 12.5px;
          color: var(--color-warm-gray, #786D61);
          margin: 0;
          line-height: 1.4;
        }

        /* -------------------------------------------------------------
           Tactile Choice Cards
           ------------------------------------------------------------- */
        .cards-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tactile-choice-card {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 48px;
          padding: 11px 13px;
          background-color: var(--color-cream-white, #FFFDF8);
          border: 1.5px solid var(--color-border-warm, #EDE2D1);
          border-radius: 12px;
          cursor: pointer;
          user-select: none;
          transition: border-color 0.18s ease, background-color 0.18s ease, transform 0.12s ease;
        }

        .tactile-choice-card:hover {
          border-color: #DCCBB0;
        }

        .tactile-choice-card:active {
          transform: scale(0.985);
        }

        .tactile-choice-card.selected {
          border-color: var(--color-primary-honey, #D99A24);
          background-color: #FAF3E3;
        }

        .card-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background-color: #FAF4E8;
          color: var(--color-deep-cocoa, #34261B);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background-color 0.18s ease, color 0.18s ease;
        }

        .card-icon-wrap.selected {
          background-color: var(--color-primary-honey, #D99A24);
          color: #FFFDF8;
        }

        .card-body-wrap {
          flex: 1;
          min-width: 0;
        }

        .card-title {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
          line-height: 1.25;
        }

        .tactile-choice-card.selected .card-title {
          font-weight: 700;
          color: #261B12;
        }

        .card-description {
          display: block;
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
          margin: 2px 0 0 0;
          line-height: 1.35;
        }

        .tactile-choice-card.selected .card-description {
          color: #5A4E42;
        }

        .card-check-pill {
          width: 20px;
          height: 20px;
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

        /* Handled Subgroups */
        .handled-subgroup-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
        }

        .subgroup-title-row {
          padding-left: 2px;
        }

        .subgroup-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-deep-honey, #B87316);
        }

        .scale-optional-action {
          display: flex;
          justify-content: flex-end;
          padding-top: 2px;
        }

        .btn-opt-skip {
          background: none;
          border: none;
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
          text-decoration: underline;
          cursor: pointer;
          padding: 4px 6px;
        }

        .btn-opt-skip:hover {
          color: var(--color-deep-cocoa, #34261B);
        }

        .location-disclaimer-note {
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
          line-height: 1.4;
          padding: 4px 2px 0;
          font-style: italic;
        }

        /* -------------------------------------------------------------
           Sticky Bottom Dock
           ------------------------------------------------------------- */
        .organization-bottom-dock {
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

        .organization-feedback-bar {
          min-height: 20px;
          display: flex;
          align-items: center;
        }

        .contextual-microcopy {
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
          line-height: 1.35;
        }

        .validation-inline-error {
          font-size: 12.5px;
          font-weight: 600;
          color: #B23B2A;
          animation: fadeSlideIn 0.2s ease;
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

        /* -------------------------------------------------------------
           Guidance Modal Sheet
           ------------------------------------------------------------- */
        .helper-modal-backdrop {
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

        .helper-modal-card {
          width: 100%;
          background-color: var(--color-cream-white, #FFFDF8);
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
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

        .helper-drag-handle {
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background-color: var(--color-border-warm, #EDE2D1);
          align-self: center;
          margin-bottom: 2px;
        }

        .helper-sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .helper-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0;
        }

        .helper-close-btn {
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

        .helper-body-text {
          font-size: 13.5px;
          color: var(--color-warm-gray, #786D61);
          line-height: 1.45;
          margin: 0;
        }

        .helper-examples-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px;
          background-color: #FAF4E8;
          border-radius: 12px;
          font-size: 13px;
          color: var(--color-deep-cocoa, #34261B);
        }

        .helper-example-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.4;
        }

        .helper-bullet {
          font-size: 15px;
          flex-shrink: 0;
        }

        .helper-actions-bar {
          margin-top: 4px;
        }

        .btn-helper-dismiss {
          width: 100%;
          height: 44px;
          border-radius: 10px;
          background-color: var(--color-deep-cocoa, #34261B);
          color: #FFFDF8;
          border: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>
    </section>
  );
};
