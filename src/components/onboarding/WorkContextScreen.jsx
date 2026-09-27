import React, { useState } from 'react';
import { WORK_CONTEXT_TAXONOMY } from '../../services/capabilityTaxonomy';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  Package,
  FlaskConical,
  Truck,
  Sparkles
} from 'lucide-react';

/**
 * Modern, cohesive icon renderer for work context cards.
 */
const renderContextIcon = (iconName, size = 20) => {
  switch (iconName) {
    case 'Layers':
      return <Layers size={size} strokeWidth={2} />;
    case 'Package':
      return <Package size={size} strokeWidth={2} />;
    case 'FlaskConical':
      return <FlaskConical size={size} strokeWidth={2} />;
    case 'Truck':
      return <Truck size={size} strokeWidth={2} />;
    default:
      return <Sparkles size={size} strokeWidth={2} />;
  }
};

/**
 * Screen 06 / Discovery Screen: "What do you work with?"
 *
 * First interactive capability-discovery screen in HoneyChain's modern onboarding flow.
 * Collects normalized working environment context to tailor subsequent task suggestions.
 * Strictly decoupled from designation decisions.
 *
 * @param {Object} props
 * @param {Array<string>} props.selectedContexts - Normalized context IDs (e.g. ['HIVE_OPERATIONS'])
 * @param {Function} props.onToggleContext - Callback (contextId: string) => void
 * @param {Function} props.onContinue - Callback () => void
 * @param {Function} props.onBack - Callback () => void
 * @param {string} [props.progress='1/5'] - Step progress label
 */
export const WorkContextScreen = ({
  selectedContexts = [],
  onToggleContext,
  onContinue,
  onBack,
  progress = '1/5'
}) => {
  const [attemptedWithoutSelection, setAttemptedWithoutSelection] = useState(false);

  const selectedCount = selectedContexts.length;
  const hasSelection = selectedCount > 0;

  // Dynamic contextual microcopy tailored to current selections
  const getContextualFeedback = () => {
    if (selectedCount === 0) return null;

    if (selectedCount === 1) {
      const activeId = selectedContexts[0];
      const found = WORK_CONTEXT_TAXONOMY.find(c => c.id === activeId);
      return found?.microcopy || "We'll show you tasks that fit.";
    }

    return "We'll combine these areas when setting up your workspace.";
  };

  const handleContinueClick = (e) => {
    e.preventDefault();
    if (!hasSelection) {
      setAttemptedWithoutSelection(true);
      return;
    }
    setAttemptedWithoutSelection(false);
    onContinue?.();
  };

  const handleCardToggle = (contextId) => {
    setAttemptedWithoutSelection(false);
    onToggleContext?.(contextId);
  };

  const handleKeyDown = (e, contextId) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleCardToggle(contextId);
    }
  };

  return (
    <section
      className="work-context-viewport"
      aria-labelledby="context-heading"
      role="region"
    >
      {/* Top Navigation & Minimal Progress Indicator */}
      <header className="context-nav-header">
        <button
          type="button"
          className="context-back-btn"
          onClick={onBack}
          aria-label="Return to onboarding introduction"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="context-progress-wrap" aria-label={`Step progress: ${progress}`}>
          <div className="progress-dots-track" aria-hidden="true">
            <span className="p-dot active" />
            <span className="p-line" />
            <span className="p-dot" />
            <span className="p-line" />
            <span className="p-dot" />
            <span className="p-line" />
            <span className="p-dot" />
            <span className="p-line" />
            <span className="p-dot" />
          </div>
          <span className="context-progress-text">{progress}</span>
        </div>
      </header>

      {/* Main Form Content Area */}
      <div className="context-main-content">
        <div className="context-copy-block">
          <h1 id="context-heading" className="context-heading">
            What do you work with?
          </h1>
          <p className="context-supporting-text">
            Choose everything that applies. We'll use this to tailor the next step.
          </p>
        </div>

        {/* Tactile Multi-Selection Cards */}
        <div
          className="context-cards-list"
          role="group"
          aria-label="Areas of responsibility"
        >
          {WORK_CONTEXT_TAXONOMY.filter(item => item.active).map((item) => {
            const isSelected = selectedContexts.includes(item.id);

            return (
              <div
                key={item.id}
                role="checkbox"
                tabIndex={0}
                aria-checked={isSelected}
                aria-label={`${item.title}. ${item.description}. ${isSelected ? 'Selected' : 'Not selected'}`}
                className={`context-tactile-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleCardToggle(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
              >
                {/* Modern Organic Icon Container */}
                <div className={`context-icon-badge ${isSelected ? 'selected' : ''}`} aria-hidden="true">
                  {renderContextIcon(item.icon, 20)}
                </div>

                {/* Card Title & Description */}
                <div className="context-text-col">
                  <strong className="context-card-title">{item.title}</strong>
                  <p className="context-card-desc">{item.description}</p>
                </div>

                {/* Checkmark Indicator */}
                <div
                  className={`context-check-indicator ${isSelected ? 'checked' : ''}`}
                  aria-hidden="true"
                >
                  <Check size={13} strokeWidth={2.6} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Action Area with Selection Feedback */}
      <footer className="context-bottom-dock">
        {/* Selection Feedback & Microcopy */}
        <div className="context-feedback-bar" aria-live="polite">
          {hasSelection && (
            <div className="feedback-message-wrap">
              <span className="selected-count-tag">
                {selectedCount} {selectedCount === 1 ? 'area' : 'areas'} selected
              </span>
              <span className="contextual-microcopy">
                {getContextualFeedback()}
              </span>
            </div>
          )}

          {attemptedWithoutSelection && !hasSelection && (
            <div className="validation-inline-error" role="alert">
              <span>Choose at least one area to continue.</span>
            </div>
          )}
        </div>

        {/* Primary CTA Button */}
        <button
          type="button"
          className={`btn-continue-cta ${!hasSelection ? 'disabled' : ''}`}
          onClick={handleContinueClick}
          aria-disabled={!hasSelection}
        >
          <span>Continue</span>
          <ArrowRight size={18} />
        </button>
      </footer>

      {/* Component Styles */}
      <style>{`
        .work-context-viewport {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          height: 100%;
          background-color: var(--color-warm-cream, #FFF9EF);
          color: var(--color-deep-cocoa, #34261B);
          font-family: var(--font-family, sans-serif);
          position: relative;
          overflow: hidden;
        }

        /* Nav Header */
        .context-nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background-color: var(--color-warm-cream, #FFF9EF);
          border-bottom: 1px solid var(--color-divider, #EDE2D1);
          flex-shrink: 0;
          z-index: 10;
        }

        .context-back-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #FAF4E9;
          border: 1px solid var(--color-divider, #EDE2D1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-deep-cocoa, #34261B);
          cursor: pointer;
          transition: background-color 0.15s ease, transform 0.1s ease;
        }

        .context-back-btn:hover {
          background-color: #F4EAD7;
        }

        .context-back-btn:active {
          transform: scale(0.96);
        }

        .context-progress-wrap {
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
          background-color: #DEC8A8;
          transition: all 0.2s ease;
        }

        .p-dot.active {
          width: 8px;
          height: 8px;
          background-color: var(--color-primary-honey, #D99A24);
        }

        .p-line {
          width: 10px;
          height: 1.5px;
          background-color: #EADBC5;
        }

        .context-progress-text {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-warm-gray, #786D61);
          letter-spacing: 0.04em;
        }

        /* Main Content */
        .context-main-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 22px 20px 140px 20px;
          max-width: 440px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }

        .context-copy-block {
          margin-bottom: 20px;
        }

        .context-heading {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          line-height: 1.25;
          margin: 0 0 6px 0;
          letter-spacing: -0.01em;
        }

        .context-supporting-text {
          font-size: 14px;
          color: var(--color-warm-gray, #786D61);
          line-height: 1.45;
          margin: 0;
        }

        /* Tactile Cards List */
        .context-cards-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .context-tactile-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px solid var(--color-card-border, #E8DDCC);
          border-radius: 14px;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          min-height: 76px;
          user-select: none;
          transition: background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
          outline: none;
        }

        .context-tactile-card:focus-visible {
          box-shadow: 0 0 0 2px var(--color-primary-honey, #D99A24);
        }

        .context-tactile-card:hover:not(.selected) {
          border-color: #D6C7B2;
          background-color: #FFFDF9;
        }

        .context-tactile-card.selected {
          border: 1.5px solid var(--color-primary-honey, #D99A24);
          background-color: #FAF4E8;
          box-shadow: 0 2px 8px rgba(217, 154, 36, 0.08);
        }

        /* Icon Badge */
        .context-icon-badge {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background-color: #FAF0DE;
          color: var(--color-deep-honey, #B87316);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background-color 150ms ease, color 150ms ease;
        }

        .context-tactile-card.selected .context-icon-badge {
          background-color: #F7E7C8;
          color: var(--color-deep-cocoa, #34261B);
        }

        /* Card Text */
        .context-text-col {
          flex: 1;
        }

        .context-card-title {
          font-size: 15.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          display: block;
          margin-bottom: 3px;
        }

        .context-card-desc {
          font-size: 12.5px;
          color: var(--color-warm-gray, #786D61);
          margin: 0;
          line-height: 1.35;
        }

        /* Check Indicator */
        .context-check-indicator {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1.5px solid #D6C7B4;
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          flex-shrink: 0;
          background-color: #FFFFFF;
          transition: all 150ms ease;
        }

        .context-check-indicator.checked {
          background-color: var(--color-primary-honey, #D99A24);
          border-color: var(--color-primary-honey, #D99A24);
          color: #FFFFFF;
        }

        /* Bottom Sticky Dock */
        .context-bottom-dock {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 12px 20px calc(var(--safe-bottom, 0px) + 16px) 20px;
          background: linear-gradient(180deg, rgba(255, 249, 239, 0.88) 0%, rgba(255, 249, 239, 0.98) 25%, #FFF9EF 100%);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-top: 1px solid rgba(237, 226, 209, 0.6);
          max-width: 440px;
          width: 100%;
          margin-left: auto;
          margin-right: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 20;
        }

        .context-feedback-bar {
          min-height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feedback-message-wrap {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--color-deep-cocoa, #34261B);
        }

        .selected-count-tag {
          font-weight: 700;
          color: var(--color-primary-honey, #D99A24);
          background-color: #FAF0DC;
          padding: 2px 7px;
          border-radius: 4px;
          font-size: 11px;
        }

        .contextual-microcopy {
          color: var(--color-warm-gray, #786D61);
        }

        .validation-inline-error {
          font-size: 12.5px;
          color: var(--color-critical, #B85450);
          font-weight: 600;
        }

        /* Primary CTA Button */
        .btn-continue-cta {
          width: 100%;
          height: 52px;
          min-height: 52px;
          border-radius: 11px;
          background-color: var(--color-primary-honey, #D99A24);
          color: #FFFFFF;
          border: none;
          font-family: inherit;
          font-size: 15.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: background-color 0.15s ease, opacity 0.15s ease, transform 0.1s ease;
        }

        .btn-continue-cta:hover:not(.disabled) {
          background-color: var(--color-deep-honey, #B87316);
        }

        .btn-continue-cta:active:not(.disabled) {
          transform: scale(0.99);
        }

        .btn-continue-cta.disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
};
