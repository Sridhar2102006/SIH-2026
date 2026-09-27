import React from 'react';
import { Terminal, X } from 'lucide-react';
import { CAPABILITY_MAP } from '../../services/capabilityRegistry';

export const OnboardingDiagnosticDrawer = ({
  isOpen,
  onClose,
  state = 'STARTED',
  signals = [],
  candidateCapabilities = [],
  designationEvaluation = {},
  workspacePreview = {},
  policyVersion = 12,
  engineVersion = '13.0.0'
}) => {
  if (!isOpen) return null;

  return (
    <div className="diagnostic-drawer">
      <div className="diagnostic-drawer-header">
        <div className="diag-header-title-row">
          <Terminal size={18} color="var(--color-primary-honey, #D97706)" />
          <h3 className="diag-title">Intelligence Engine Trace</h3>
        </div>
        <button
          type="button"
          className="diag-close-btn"
          onClick={onClose}
          aria-label="Close diagnostic trace"
        >
          <X size={16} />
        </button>
      </div>

      <div className="diagnostic-drawer-content">
        <div className="diag-section">
          <span className="diag-section-label">State Machine State</span>
          <div className="diag-value-pill">{state}</div>
          <span className="diag-micro">Policy v{policyVersion}  ·  Engine v{engineVersion}</span>
        </div>

        <div className="diag-section">
          <span className="diag-section-label">Extracted Signals ({signals.length})</span>
          <div className="diag-table-wrap">
            <table className="diag-table">
              <thead>
                <tr>
                  <th>Cat</th>
                  <th>Value</th>
                  <th>Pol</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {signals.map(s => (
                  <tr key={s.signalId}>
                    <td>{s.category}</td>
                    <td><strong>{s.value}</strong></td>
                    <td>{s.polarity}</td>
                    <td>{s.source}</td>
                  </tr>
                ))}
                {signals.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', opacity: 0.6 }}>No signals recorded yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="diag-section">
          <span className="diag-section-label">Inferred Candidates ({candidateCapabilities.length})</span>
          <div className="diag-caps-list">
            {candidateCapabilities.map(id => {
              const cap = CAPABILITY_MAP.get(id);
              return (
                <div key={id} className="diag-cap-row">
                  <span className="diag-cap-code">{id}</span>
                  <span className="diag-cap-name">{cap ? cap.name : id}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="diag-section">
          <span className="diag-section-label">Designation Eligibility</span>
          <div className="diag-desig-list">
            {designationEvaluation.suggestions?.map(s => (
              <div key={s.designationId} className="diag-desig-item">
                <strong>{s.name}</strong>
                <span className="diag-badge">{s.eligibilityState}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="diag-section">
          <span className="diag-section-label">Resolved Modules ({workspacePreview.moduleIds?.length || 0})</span>
          <div className="diag-modules-row">
            {workspacePreview.moduleIds?.map(m => (
              <span key={m} className="diag-mod-tag">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
