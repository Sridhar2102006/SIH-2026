const fs = require('fs');

const welcomeCode = `import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  ArrowRight,
  Check,
  Layers,
  Package,
  FlaskConical,
  Truck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const WORK_AREAS = [
  {
    id: 'HIVE_OPERATIONS',
    icon: Layers,
    emoji: '??',
    title: 'Hives & Colonies',
    desc: 'Apiary yards, hive inspections, brood checks, colony health',
    defaultCaps: ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION']
  },
  {
    id: 'HONEY_OPERATIONS',
    icon: Package,
    emoji: '??',
    title: 'Honey & Processing',
    desc: 'Harvest extraction, settling tanks, batch lots, processing steps',
    defaultCaps: ['PROCESSING_MANAGEMENT', 'BATCH_INTAKE', 'PROCESSING_STEP_RECORD']
  },
  {
    id: 'QUALITY_OPERATIONS',
    icon: FlaskConical,
    emoji: '??',
    title: 'Laboratory & Quality',
    desc: 'Refractometry, enzyme tests, sample intake, purity review',
    defaultCaps: ['SAMPLE_INTAKE', 'TEST_EXECUTION', 'TEST_RESULT_ENTRY', 'RESULT_REVIEW']
  },
  {
    id: 'LOGISTICS_OPERATIONS',
    icon: Truck,
    emoji: '??',
    title: 'Packaging & Dispatch',
    desc: 'Carton inventory, package QR validation, shipments, delivery tracking',
    defaultCaps: ['INVENTORY_MANAGEMENT', 'DISPATCH_PLANNING', 'PACKAGE_QR_VALIDATE', 'DELIVERY_TRACKING']
  }
];

const PRESETS = [
  { label: 'Beekeeper', areas: ['HIVE_OPERATIONS'] },
  { label: 'Honey Processor', areas: ['HONEY_OPERATIONS'] },
  { label: 'Lab Analyst', areas: ['QUALITY_OPERATIONS'] },
  { label: 'Dispatch', areas: ['LOGISTICS_OPERATIONS'] },
  { label: 'Beekeeper + Processor', areas: ['HIVE_OPERATIONS', 'HONEY_OPERATIONS'] }
];

export const AdaptiveWelcomeScreen = ({
  selectedDomains = ['HIVE_OPERATIONS'],
  onToggleDomain,
  onApplyPreset,
  naturalText = '',
  onChangeNaturalText,
  onSubmitNatural,
  onContinue
}) => {
  const [showNaturalInput, setShowNaturalInput] = useState(false);

  return (
    <div className="screen-container welcome-screen">
      <div className="welcome-hero-art">
        <div className="hero-icon-bubble">
          <Sparkles size={36} color="#D97706" />
        </div>
      </div>

      <div className="screen-header text-center">
        <span className="micro-badge-step">HoneyChain Setup</span>
        <h1 className="screen-title">What do you mainly work with?</h1>
        <p className="screen-subtitle">
          Tap the areas that match what you do every day. We'll automatically configure your companion to fit.
        </p>
      </div>

      {/* Quick 1-Tap Preset Chips */}
      <div className="quick-presets-row">
        <span className="presets-label">Quick select:</span>
        <div className="presets-scroll">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-chip-btn"
              onClick={() => {
                if (onApplyPreset) {
                  onApplyPreset(p.areas);
                } else if (onToggleDomain) {
                  p.areas.forEach(a => {
                    if (!selectedDomains.includes(a)) onToggleDomain(a);
                  });
                }
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Work Focus Selection Cards */}
      <div className="work-areas-grid">
        {WORK_AREAS.map(area => {
          const isSelected = selectedDomains.includes(area.id);
          const Icon = area.icon;
          return (
            <div
              key={area.id}
              className={"work-area-card " + (isSelected ? "selected" : "")}
              onClick={() => onToggleDomain && onToggleDomain(area.id)}
              role="button"
              tabIndex={0}
            >
              <div className="card-top-row">
                <div className="card-emoji-box">
                  <span className="card-emoji">{area.emoji}</span>
                </div>
                <div className={"card-checkbox " + (isSelected ? "checked" : "")}>
                  {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
                </div>
              </div>
              <h3 className="card-title">{area.title}</h3>
              <p className="card-desc">{area.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Optional Collapsed Natural Language Assistant */}
      <div className="optional-natural-wrapper">
        <button
          type="button"
          className="toggle-natural-btn"
          onClick={() => setShowNaturalInput(prev => !prev)}
        >
          <MessageSquare size={14} color="#D97706" />
          <span>{showNaturalInput ? "Hide text description" : "Or describe your work in your own words (optional)"}</span>
          {showNaturalInput ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showNaturalInput && (
          <div className="natural-drawer-content">
            <textarea
              className="natural-textarea"
              rows={2}
              placeholder="e.g. I manage 30 hives, inspect them weekly and collect honey..."
              value={naturalText}
              onChange={(e) => onChangeNaturalText && onChangeNaturalText(e.target.value)}
            />
            {naturalText.trim() && (
              <button
                type="button"
                className="btn-interpret-text"
                onClick={() => onSubmitNatural && onSubmitNatural(naturalText)}
              >
                <Sparkles size={14} />
                <span>Parse my description</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="screen-bottom-dock">
        <button
          type="button"
          className="btn-primary-action"
          onClick={onContinue}
        >
          <span>Continue to Daily Tasks</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('D:/SIH-2026/src/components/onboarding/AdaptiveWelcomeScreen.jsx', welcomeCode, 'utf8');
console.log('Successfully wrote user-friendly AdaptiveWelcomeScreen.jsx');
