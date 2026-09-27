import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  X,
  Check,
  Shield,
  User,
  Info
} from 'lucide-react';
import { DEMO_PERSONAS } from '../../services/dashboardCompositionEngine';

export const PersonaSwitcherPill = ({
  currentPersonaId = null,
  workIdentity = '',
  onSelectPersona
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Match current persona by matching designations/capabilities or fallback to currentPersonaId
  const activePersona = DEMO_PERSONAS.find(p => p.id === currentPersonaId) || DEMO_PERSONAS[0];

  return (
    <>
      <div className="hv-persona-bar">
        <button
          className="hv-persona-pill"
          onClick={() => setIsOpen(true)}
          aria-label="Switch operational work profile"
        >
          <div className="hv-persona-pill-left">
            <span className="hv-pp-dot" />
            <span className="hv-pp-title">{workIdentity || activePersona.name}</span>
          </div>
          <div className="hv-persona-pill-right">
            <span className="hv-pp-switch-hint">Switch Profile</span>
            <ChevronDown size={13} strokeWidth={2.2} />
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="hv-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="hv-modal-card hv-persona-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="hv-modal-header">
              <div className="hv-modal-title-row">
                <Layers size={18} color="var(--color-deep-honey)" />
                <h3 className="hv-modal-title">Work Profiles & Responsibilities</h3>
              </div>
              <button
                className="hv-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="hv-persona-sheet-intro">
              Select a work profile to switch active duties, authorized tools, and relevant field data:
            </p>

            <div className="hv-persona-list">
              {DEMO_PERSONAS.map((persona) => {
                const isSelected = persona.id === currentPersonaId;
                const isZero = persona.id === 'PERSONA_I_ZERO_PERMISSIONS';

                return (
                  <button
                    key={persona.id}
                    className={`hv-persona-option ${isSelected ? 'selected' : ''} ${isZero ? 'zero' : ''}`}
                    onClick={() => {
                      onSelectPersona(persona.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="hv-po-left">
                      <div className="hv-po-header">
                        <strong className="hv-po-name">{persona.name}</strong>
                        {isSelected && (
                          <span className="hv-po-active-tag">
                            <Check size={11} strokeWidth={3} /> Active
                          </span>
                        )}
                      </div>
                      <span className="hv-po-sub">{persona.subtitle}</span>

                      {persona.designations.length > 0 && (
                        <div className="hv-po-badges">
                          {persona.designations.map((d) => (
                            <span key={d} className="hv-po-badge">
                              {d.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button className="hv-modal-btn" onClick={() => setIsOpen(false)}>
              Close Switcher
            </button>
          </div>
        </div>
      )}

      <style>{`
        .hv-persona-bar {
          padding: 8px 18px 0;
        }
        .hv-persona-pill {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 7px 12px;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .hv-persona-pill:hover {
          background: #FFFDF8;
          border-color: #D99A24;
        }
        .hv-persona-pill-left {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .hv-pp-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4F7A52;
        }
        .hv-pp-title {
          font-size: 12.5px;
          font-weight: 750;
          color: #34261B;
        }
        .hv-persona-pill-right {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #B87316;
          font-size: 11px;
          font-weight: 700;
        }
        .hv-pp-switch-hint {
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .hv-persona-sheet {
          max-height: 88vh;
        }
        .hv-persona-sheet-intro {
          font-size: 12.5px;
          color: #786D61;
          margin: 0 0 10px;
          line-height: 1.4;
        }
        .hv-persona-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          max-height: 52vh;
          padding-right: 4px;
        }
        .hv-persona-option {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 10px 12px;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .hv-persona-option:hover {
          border-color: #D99A24;
          background: #FAF4E8;
        }
        .hv-persona-option.selected {
          border: 1.5px solid #D99A24;
          background: #FFF9EF;
        }
        .hv-persona-option.zero {
          border-style: dashed;
        }
        .hv-po-left {
          display: flex;
          flex-direction: column;
          gap: 3px;
          width: 100%;
        }
        .hv-po-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hv-po-name {
          font-size: 13.5px;
          font-weight: 750;
          color: #34261B;
        }
        .hv-po-active-tag {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10.5px;
          font-weight: 800;
          color: #4F7A52;
          background: rgba(79, 122, 82, 0.12);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .hv-po-sub {
          font-size: 11.5px;
          color: #786D61;
          line-height: 1.35;
        }
        .hv-po-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 4px;
        }
        .hv-po-badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: capitalize;
          background: #EDE2D1;
          color: #786D61;
          padding: 2px 6px;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};
