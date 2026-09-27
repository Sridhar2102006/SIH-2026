import React from 'react';
import {
  ArrowRight,
  Check,
  Layers,
  Package,
  FlaskConical,
  Truck,
  Factory
} from 'lucide-react';

const WORK_OPTIONS = [
  {
    id: 'HONEY_OPERATIONS',
    intent: 'PROCESS',
    icon: Package,
    emoji: '🍯',
    title: 'I process honey',
    desc: 'Extraction, settling tanks, filtering, batch processing & bottling'
  },
  {
    id: 'HIVE_OPERATIONS',
    intent: 'COLLECT',
    icon: Layers,
    emoji: '🌱',
    title: 'I collect honey / manage hives',
    desc: 'Bee colonies, apiary yards, hive inspections & seasonal harvests'
  },
  {
    id: 'PACKAGING_OPERATIONS',
    intent: 'PACK',
    icon: Package,
    emoji: '📦',
    title: 'I pack honey',
    desc: 'Bottling, retail labeling, jar filling & batch sealing'
  },
  {
    id: 'QUALITY_OPERATIONS',
    intent: 'TEST',
    icon: FlaskConical,
    emoji: '🔬',
    title: 'I test honey',
    desc: 'Laboratory testing, moisture, refractometry & purity checks'
  },
  {
    id: 'LOGISTICS_OPERATIONS',
    intent: 'DISTRIBUTE',
    icon: Truck,
    emoji: '🚚',
    title: 'I distribute honey',
    desc: 'Wholesale supply, carton inventory & delivery tracking'
  },
  {
    id: 'MANAGEMENT_OPERATIONS',
    intent: 'MANAGE',
    icon: Factory,
    emoji: '👥',
    title: 'I manage a honey business',
    desc: 'Operations lead, cooperative coordination & enterprise oversight'
  }
];

export const AdaptiveWelcomeScreen = ({
  selectedDomains = [],
  onToggleDomain,
  naturalText = '',
  onContinue
}) => {
  const isProcessorSelected = selectedDomains.includes('HONEY_OPERATIONS') || selectedDomains.includes('PACKAGING_OPERATIONS');

  return (
    <div className="screen-container welcome-screen">
      <div className="screen-header text-center">
        <h1 className="screen-title">What do you do with honey?</h1>
        <p className="screen-subtitle">
          Tell us how you work with honey so HoneyChain can set up your workspace.
        </p>
      </div>

      {/* Visual Work Focus Selection Cards (§5) */}
      <div className="work-areas-grid">
        {WORK_OPTIONS.map(area => {
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
                <div className="card-emoji-box" style={{ fontSize: '20px' }}>
                  {area.emoji}
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

      <div className="screen-bottom-dock">
        <button
          type="button"
          className="btn-primary-action"
          disabled={selectedDomains.length === 0 && !naturalText.trim()}
          style={{
            opacity: (selectedDomains.length === 0 && !naturalText.trim()) ? 0.55 : 1,
            cursor: (selectedDomains.length === 0 && !naturalText.trim()) ? 'not-allowed' : 'pointer'
          }}
          onClick={() => {
            if (selectedDomains.length > 0 || naturalText.trim()) {
              if (isProcessorSelected) {
                onContinue('PROCESS');
              } else {
                onContinue();
              }
            }
          }}
        >
          <span>
            {selectedDomains.length === 0 && !naturalText.trim()
              ? "Select an option to continue"
              : isProcessorSelected
                ? "Start Processor Setup"
                : "Continue to Setup"}
          </span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default AdaptiveWelcomeScreen;
