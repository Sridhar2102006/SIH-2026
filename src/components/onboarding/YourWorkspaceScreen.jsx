import React, { useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Package,
  FlaskConical,
  Truck,
  ClipboardCheck,
  Compass,
  Sparkles,
  ShieldCheck,
  Check,
  ChevronRight,
  GitBranch,
  SlidersHorizontal,
  Home
} from 'lucide-react';
import {
  DESIGNATION_TAXONOMY,
  resolveAccessProfile
} from '../../services/capabilityEngine';

/**
 * Cohesive icon renderer for designation and workspace cards.
 */
const renderIcon = (type, size = 18) => {
  switch (type) {
    case 'hives':
    case 'BEEKEEPER':
      return <Layers size={size} strokeWidth={2.2} />;
    case 'honey':
    case 'PROCESSOR':
      return <Package size={size} strokeWidth={2.2} />;
    case 'quality':
    case 'LAB_SPECIALIST':
      return <FlaskConical size={size} strokeWidth={2.2} />;
    case 'products':
    case 'DISTRIBUTOR':
      return <Truck size={size} strokeWidth={2.2} />;
    case 'INSPECTOR':
      return <ClipboardCheck size={size} strokeWidth={2.2} />;
    case 'FACILITY_MANAGER':
      return <Compass size={size} strokeWidth={2.2} />;
    case 'traceability':
      return <GitBranch size={size} strokeWidth={2.2} />;
    case 'insights':
      return <Sparkles size={size} strokeWidth={2.2} />;
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
 * Full Honey Traceability Lifecycle Stages.
 */
const ALL_JOURNEY_STAGES = [
  { id: 'HIVE', label: 'Hive', icon: '🐝' },
  { id: 'COLLECTION', label: 'Collection', icon: '🍯' },
  { id: 'PROCESSING', label: 'Processing', icon: '⚙️' },
  { id: 'QUALITY', label: 'Quality', icon: '🔬' },
  { id: 'PACKAGING', label: 'Packaging', icon: '📦' },
  { id: 'VERIFIED', label: 'Verified', icon: '✓' }
];

/**
 * Screen 12: "Your workspace"
 *
 * Sixth screen in HoneyChain's capability-driven onboarding flow.
 * Translates confirmed designations and normalized capabilities into a
 * human-readable, personalized workspace preview.
 *
 * Core principles:
 * - Shows actual working areas (Hives, Honey, Quality, Traceability, Smart insights).
 * - Highlights the user's specific honey journey without complex blockchain jargon.
 * - Explains how the Home screen prioritizes their primary activities.
 * - Zero fake statistics or fabricated device sensor values.
 * - User can return to "Change my setup" anytime.
 *
 * @param {Object} props
 * @param {Array<string>} props.confirmedDesignations - Confirmed designation IDs (e.g. ['BEEKEEPER', 'PROCESSOR'])
 * @param {Array<string>} props.selectedCapabilities - Declared capability IDs
 * @param {Object} [props.workProfile={}] - Work organization profile from Screen 08
 * @param {Array<string>} [props.selectedContexts=[]] - Declared work contexts from Screen 06
 * @param {string} [props.operatorName='Sarah Lindqvist'] - Operator name
 * @param {string} [props.apiaryName='Meadowbrook Apiary'] - Apiary name
 * @param {Function} props.onEnterHoneyChain - Callback () => void (advances to Screen 13 / Dashboard Confirmation)
 * @param {Function} props.onChangeSetup - Callback () => void (returns to Screen 10 / Designation Selection)
 * @param {Function} props.onBack - Callback () => void (returns to Screen 11 / Why This Fits)
 * @param {string} [props.progress='5/5'] - Step progress label
 */
export const YourWorkspaceScreen = ({
  confirmedDesignations = [],
  selectedCapabilities = [],
  workProfile = {},
  selectedContexts = [],
  operatorName = 'Sarah Lindqvist',
  apiaryName = 'Meadowbrook Apiary',
  onEnterHoneyChain,
  onChangeSetup,
  onBack,
  progress = '5/5'
}) => {
  // Authoritatively derive access profile
  const authoritativeAccess = useMemo(() => {
    return resolveAccessProfile({
      capabilities: selectedCapabilities,
      designations: confirmedDesignations,
      workContexts: {
        areas: workProfile.workLocations || ['APIARY'],
        handles: selectedContexts
      }
    });
  }, [selectedCapabilities, confirmedDesignations, workProfile, selectedContexts]);

  // Designation titles string (e.g. "Beekeeper · Processor")
  const designationsTitleString = useMemo(() => {
    if (confirmedDesignations.length === 0) return 'Basic Workspace';
    return confirmedDesignations
      .map(id => HUMAN_DESIGNATION_META[id]?.title || id)
      .join(' · ');
  }, [confirmedDesignations]);

  // Determine active workspace areas based on confirmed designations & capabilities
  const workspaceAreas = useMemo(() => {
    const areas = [];
    const hasBeekeeper = confirmedDesignations.includes('BEEKEEPER') || confirmedDesignations.includes('INSPECTOR');
    const hasHiveCaps = selectedCapabilities.some(c => c.includes('HIVE'));

    const hasProcessor = confirmedDesignations.includes('PROCESSOR');
    const hasHoneyCaps = selectedCapabilities.some(c => c.includes('HONEY') || c.includes('BATCH'));

    const hasQuality = confirmedDesignations.includes('LAB_SPECIALIST') || selectedCapabilities.includes('QUALITY_TESTING');
    const hasDistributor = confirmedDesignations.includes('DISTRIBUTOR') || selectedCapabilities.includes('SHIPMENT_DISPATCH') || selectedCapabilities.includes('INVENTORY_MANAGEMENT');

    // 1. Hives Area
    if (hasBeekeeper || hasHiveCaps) {
      areas.push({
        id: 'hives',
        title: 'Hives',
        description: 'Monitor hive health, track colonies and record field inspections.',
        icon: 'hives',
        accent: '#D99A24'
      });
    }

    // 2. Honey Area
    if (hasProcessor || (hasHoneyCaps && hasBeekeeper)) {
      areas.push({
        id: 'honey',
        title: 'Honey',
        description: 'Follow honey collection, processing records and active batches.',
        icon: 'honey',
        accent: '#B87316'
      });
    }

    // 3. Quality Area
    if (hasQuality) {
      areas.push({
        id: 'quality',
        title: 'Quality',
        description: 'Manage moisture checks, lab test samples and verified purity records.',
        icon: 'quality',
        accent: '#71845B'
      });
    }

    // 4. Products / Distribution Area
    if (hasDistributor) {
      areas.push({
        id: 'products',
        title: 'Products',
        description: 'Manage packaged inventory, storage locations and delivery dispatches.',
        icon: 'products',
        accent: '#B87316'
      });
    }

    // 5. Traceability Area (Central HoneyChain pillar, always present)
    areas.push({
      id: 'traceability',
      title: 'Traceability',
      description: 'Follow the journey of your honey from hive to verified bottle.',
      icon: 'traceability',
      accent: '#D99A24'
    });

    // 6. Smart Insights
    areas.push({
      id: 'insights',
      title: 'Smart insights',
      description: 'Helpful observations and anomaly trends from your hive, honey and quality records.',
      icon: 'insights',
      accent: '#71845B'
    });

    return areas;
  }, [confirmedDesignations, selectedCapabilities]);

  // Determine which honey journey stages are highlighted for the user
  const activeJourneyStageIds = useMemo(() => {
    const active = new Set();
    const hasBeekeeper = confirmedDesignations.includes('BEEKEEPER');
    const hasProcessor = confirmedDesignations.includes('PROCESSOR');
    const hasQuality = confirmedDesignations.includes('LAB_SPECIALIST');
    const hasDistributor = confirmedDesignations.includes('DISTRIBUTOR');

    if (hasBeekeeper) {
      active.add('HIVE');
      active.add('COLLECTION');
    }
    if (hasProcessor) {
      active.add('COLLECTION');
      active.add('PROCESSING');
      active.add('PACKAGING');
    }
    if (hasQuality) {
      active.add('PROCESSING');
      active.add('QUALITY');
      active.add('VERIFIED');
    }
    if (hasDistributor) {
      active.add('PACKAGING');
      active.add('VERIFIED');
    }

    // Default fallback
    if (active.size === 0) {
      active.add('HIVE');
      active.add('COLLECTION');
    }

    // If both beekeeper and processor, add verified
    if (hasBeekeeper && hasProcessor) {
      active.add('VERIFIED');
    }

    return active;
  }, [confirmedDesignations]);

  // Home screen personalization highlight explanation
  const homePriorityExplanation = useMemo(() => {
    const hasBeekeeper = confirmedDesignations.includes('BEEKEEPER');
    const hasProcessor = confirmedDesignations.includes('PROCESSOR');
    const hasQuality = confirmedDesignations.includes('LAB_SPECIALIST');

    if (hasBeekeeper && hasProcessor && hasQuality) {
      return 'Hive colony health, active honey batches, and pending quality checks will appear first.';
    }
    if (hasBeekeeper && hasProcessor) {
      return 'Hive health, inspection reminders, and active honey batches will appear first.';
    }
    if (hasProcessor && hasQuality) {
      return 'Active extraction settling and pending quality tests will appear first.';
    }
    if (hasBeekeeper) {
      return 'Hive activity and seasonal colony health will appear first.';
    }
    if (hasProcessor) {
      return 'Active honey batches and extraction logs will appear first.';
    }
    if (hasQuality) {
      return 'Pending lab samples and refractometry checks will appear first.';
    }
    return 'Your selected operational tasks will be prioritized on your Home view.';
  }, [confirmedDesignations]);

  return (
    <section
      className="workspace-preview-viewport"
      aria-labelledby="workspace-preview-heading"
      role="region"
    >
      {/* Top Header & Navigation */}
      <header className="workspace-nav-header">
        <button
          type="button"
          className="workspace-back-btn"
          onClick={onBack}
          aria-label="Return to explanation screen"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="workspace-progress-wrap" aria-label={`Step progress: ${progress}`}>
          <span className="workspace-progress-badge">Workspace Preview</span>
          <span className="workspace-progress-text">{progress}</span>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="workspace-main-content">
        {/* Screen Title & Lead Copy */}
        <div className="workspace-copy-block">
          <span className="micro-badge-lead">Personalized Setup</span>
          <h1 id="workspace-preview-heading" className="workspace-heading">
            Your workspace
          </h1>
          <p className="workspace-supporting-text">
            We've shaped HoneyChain around the work you do.
          </p>
          <span className="workspace-helper-note">
            You can change your setup later as your work changes.
          </span>
        </div>

        {/* Confirmed Designations Section ("Your work") */}
        <div className="confirmed-work-block">
          <span className="section-kicker">Your work</span>
          <div className="confirmed-designations-row">
            <span className="designations-headline">
              {designationsTitleString}
            </span>
            <div className="designation-chips-stack">
              {confirmedDesignations.map(id => {
                const meta = HUMAN_DESIGNATION_META[id] || { title: id, tagline: '' };
                return (
                  <div key={id} className="confirmed-desig-chip">
                    <span className="chip-icon">{renderIcon(id, 14)}</span>
                    <strong className="chip-name">{meta.title}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Workspace Areas Section ("Your workspace includes") */}
        <div className="workspace-areas-block">
          <div className="areas-header-row">
            <h2 className="areas-heading">Your workspace includes</h2>
            <span className="areas-count-badge">
              {workspaceAreas.length} {workspaceAreas.length === 1 ? 'area' : 'areas'}
            </span>
          </div>

          <div className="areas-cards-stack">
            {workspaceAreas.map((area) => (
              <div
                key={area.id}
                className="workspace-editorial-card"
                role="article"
                aria-label={`${area.title}: ${area.description}`}
              >
                <div className="card-icon-pill" style={{ color: area.accent }} aria-hidden="true">
                  {renderIcon(area.icon, 20)}
                </div>

                <div className="card-text-col">
                  <div className="card-title-row">
                    <strong className="card-title">{area.title}</strong>
                    <span className="card-arrow" aria-hidden="true">→</span>
                  </div>
                  <p className="card-description">{area.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traceability Journey Section */}
        <div className="honey-journey-card">
          <div className="journey-header">
            <div className="journey-title-wrap">
              <span className="journey-kicker">Traceable Batch History</span>
              <h3 className="journey-title">Your honey journey</h3>
            </div>
            <span className="journey-status-badge">
              Verified journey
            </span>
          </div>

          <p className="journey-description">
            HoneyChain anchors every batch from field apiaries through processing, certified testing, and packaging.
          </p>

          {/* Stepped Journey Visual */}
          <div className="journey-steps-track" role="list" aria-label="Honey Traceability Stages">
            {ALL_JOURNEY_STAGES.map((stage, idx) => {
              const isRelevant = activeJourneyStageIds.has(stage.id);
              return (
                <React.Fragment key={stage.id}>
                  <div
                    className={`journey-step-node ${isRelevant ? 'active' : 'neutral'}`}
                    role="listitem"
                    aria-label={`${stage.label} stage ${isRelevant ? '(active for your workspace)' : ''}`}
                  >
                    <span className="node-icon" aria-hidden="true">{stage.icon}</span>
                    <span className="node-label">{stage.label}</span>
                  </div>
                  {idx < ALL_JOURNEY_STAGES.length - 1 && (
                    <div
                      className={`journey-connector-line ${isRelevant && activeJourneyStageIds.has(ALL_JOURNEY_STAGES[idx + 1].id) ? 'active' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* "What Changes for You" / Priority Note */}
        <div className="home-priority-card">
          <div className="priority-header">
            <Home size={16} color="#B87316" />
            <h3 className="priority-title">Your HoneyChain Home</h3>
          </div>
          <p className="priority-body">
            <strong>{homePriorityExplanation}</strong>
          </p>
          <span className="priority-subtext">
            Navigation remains stable across Home, Hives, Honey, and More, while cards adapt to your setup.
          </span>
        </div>

        {/* Structural Dashboard Preview (No Fake Numbers) */}
        <div className="structural-preview-box">
          <div className="preview-label-row">
            <span className="preview-label">Home Screen Preview</span>
            <span className="preview-tag">Structural Layout</span>
          </div>

          <div className="structural-cards-list">
            {confirmedDesignations.includes('BEEKEEPER') && (
              <div className="structural-card-item">
                <span className="item-icon">🐝</span>
                <div className="item-text">
                  <strong>Colony status & inspection reminders</strong>
                  <p>Your live hive activity will appear here.</p>
                </div>
              </div>
            )}

            {confirmedDesignations.includes('PROCESSOR') && (
              <div className="structural-card-item">
                <span className="item-icon">🍯</span>
                <div className="item-text">
                  <strong>Active extraction & settling tanks</strong>
                  <p>Your current honey batches will appear here.</p>
                </div>
              </div>
            )}

            {confirmedDesignations.includes('LAB_SPECIALIST') && (
              <div className="structural-card-item">
                <span className="item-icon">🔬</span>
                <div className="item-text">
                  <strong>Quality assurance & moisture readings</strong>
                  <p>Pending test results and verification logs will appear here.</p>
                </div>
              </div>
            )}

            <div className="structural-card-item neutral">
              <span className="item-icon">📋</span>
              <div className="item-text">
                <strong>Field companion</strong>
                <p>Offline logs automatically sync when connection is restored.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Dock */}
      <footer className="workspace-bottom-dock">
        <button
          type="button"
          className="btn-enter-honeychain"
          onClick={onEnterHoneyChain}
          aria-label="Enter HoneyChain and view your workspace"
        >
          <span>Enter HoneyChain</span>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          className="btn-change-setup-link"
          onClick={onChangeSetup}
          aria-label="Change your designation setup"
        >
          <span>Change my setup</span>
        </button>
      </footer>

      {/* Scoped CSS Styles adhering strictly to HoneyChain Visual System */}
      <style>{`
        .workspace-preview-viewport {
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

        .workspace-nav-header {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px 12px 20px;
          border-bottom: 1px solid #EDE2D1;
          background: #FFFDF8;
          z-index: 10;
        }

        .workspace-back-btn {
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

        .workspace-back-btn:hover {
          background: #FAF4E8;
          border-color: #D99A24;
        }

        .workspace-progress-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .workspace-progress-badge {
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #B87316;
          background: #FAF2E2;
          padding: 3px 8px;
          border-radius: 10px;
          border: 1px solid #EDE2D1;
        }

        .workspace-progress-text {
          font-size: 12px;
          font-weight: 700;
          color: #786D61;
        }

        .workspace-main-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 24px 20px 160px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .workspace-copy-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .micro-badge-lead {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #B87316;
        }

        .workspace-heading {
          font-size: 28px;
          font-weight: 750;
          line-height: 1.25;
          color: #34261B;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .workspace-supporting-text {
          font-size: 15px;
          line-height: 1.45;
          color: #34261B;
          margin: 0;
        }

        .workspace-helper-note {
          font-size: 12.5px;
          color: #786D61;
          margin-top: 2px;
        }

        /* Confirmed Work Block */
        .confirmed-work-block {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-kicker {
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #786D61;
        }

        .confirmed-designations-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .designations-headline {
          font-size: 20px;
          font-weight: 750;
          color: #34261B;
        }

        .designation-chips-stack {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .confirmed-desig-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 10px;
          background: #FAF2E2;
          border: 1px solid #D99A24;
          color: #B87316;
          font-size: 12.5px;
        }

        .chip-icon {
          display: flex;
          align-items: center;
        }

        /* Workspace Areas Block */
        .workspace-areas-block {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .areas-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #EDE2D1;
          padding-bottom: 6px;
        }

        .areas-heading {
          font-size: 15px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #34261B;
          margin: 0;
        }

        .areas-count-badge {
          font-size: 11.5px;
          font-weight: 700;
          color: #B87316;
          background: #FAF4E8;
          padding: 2px 8px;
          border-radius: 8px;
          border: 1px solid #EDE2D1;
        }

        .areas-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .workspace-editorial-card {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 2px 6px rgba(52, 38, 27, 0.03);
          transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }

        .workspace-editorial-card:hover {
          border-color: #D99A24;
          box-shadow: 0 4px 12px rgba(217, 154, 36, 0.08);
          transform: translateY(-1px);
        }

        .card-icon-pill {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #FAF8F2;
          border: 1px solid #EDE2D1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-text-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .card-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-title {
          font-size: 16px;
          font-weight: 750;
          color: #34261B;
        }

        .card-arrow {
          font-size: 16px;
          color: #786D61;
          font-weight: 600;
        }

        .card-description {
          font-size: 13px;
          line-height: 1.4;
          color: #786D61;
          margin: 0;
        }

        /* Honey Journey Card */
        .honey-journey-card {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(52, 38, 27, 0.04);
        }

        .journey-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }

        .journey-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .journey-kicker {
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #B87316;
        }

        .journey-title {
          font-size: 18px;
          font-weight: 750;
          color: #34261B;
          margin: 0;
        }

        .journey-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #4F7A52;
          background: #F0F6F1;
          border: 1px solid #C8DEC9;
          padding: 3px 8px;
          border-radius: 10px;
        }

        .journey-description {
          font-size: 13px;
          line-height: 1.45;
          color: #786D61;
          margin: 0;
        }

        .journey-steps-track {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 4px 4px 4px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .journey-step-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 48px;
        }

        .journey-step-node.active .node-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #FAF2E2;
          border: 1.5px solid #D99A24;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 2px 6px rgba(217, 154, 36, 0.2);
        }

        .journey-step-node.active .node-label {
          font-size: 10.5px;
          font-weight: 750;
          color: #B87316;
        }

        .journey-step-node.neutral .node-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #FAF8F2;
          border: 1px solid #EDE2D1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          opacity: 0.6;
        }

        .journey-step-node.neutral .node-label {
          font-size: 10px;
          font-weight: 500;
          color: #786D61;
          opacity: 0.7;
        }

        .journey-connector-line {
          flex: 1;
          height: 2px;
          background: #EDE2D1;
          margin: 0 4px;
          margin-bottom: 16px;
        }

        .journey-connector-line.active {
          background: #D99A24;
        }

        /* Home Priority Card */
        .home-priority-card {
          background: #FAF8F2;
          border: 1px solid #EDE2D1;
          border-left: 3.5px solid #D99A24;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .priority-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .priority-title {
          font-size: 13.5px;
          font-weight: 750;
          color: #34261B;
          margin: 0;
        }

        .priority-body {
          font-size: 13px;
          line-height: 1.45;
          color: #34261B;
          margin: 0;
        }

        .priority-subtext {
          font-size: 11.5px;
          color: #786D61;
          line-height: 1.35;
        }

        /* Structural Preview Box */
        .structural-preview-box {
          background: #FFFDF8;
          border: 1px dashed #EDE2D1;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .preview-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .preview-label {
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #786D61;
        }

        .preview-tag {
          font-size: 10px;
          font-weight: 700;
          color: #786D61;
          background: #FAF8F2;
          padding: 2px 6px;
          border-radius: 6px;
          border: 1px solid #EDE2D1;
        }

        .structural-cards-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .structural-card-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          background: #FAF8F2;
        }

        .structural-card-item.neutral {
          background: transparent;
          border: 1px solid #EDE2D1;
        }

        .item-icon {
          font-size: 14px;
          margin-top: 1px;
        }

        .item-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .item-text strong {
          font-size: 12px;
          color: #34261B;
        }

        .item-text p {
          font-size: 11.5px;
          color: #786D61;
          margin: 0;
          line-height: 1.35;
        }

        /* Bottom Dock */
        .workspace-bottom-dock {
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

        .btn-enter-honeychain {
          width: 100%;
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

        .btn-enter-honeychain:hover {
          background: #C88A1A;
          transform: translateY(-1px);
        }

        .btn-change-setup-link {
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

        .btn-change-setup-link:hover {
          color: #34261B;
          text-decoration: underline;
        }
      `}</style>
    </section>
  );
};

export default YourWorkspaceScreen;
