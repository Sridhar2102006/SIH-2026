import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { CANONICAL_DESIGNATION_POLICY } from '../../services/designationEngine';

export const AdaptiveConfirmationScreen = ({
  confirmedDesignations = [],
  workspacePreview = {},
  operatorName = 'Sarah Lindqvist',
  apiaryName = 'Meadowbrook Apiary',
  onComplete,
  onChangeSetup
}) => {
  return (
    <div className="screen-container final-confirmation-screen">
      <div className="screen-header text-center">
        <div className="final-check-bubble">
          <Check size={36} color="var(--color-healthy, #10B981)" strokeWidth={2.6} />
        </div>
        <h1 className="screen-title">You're all set.</h1>
        <p className="screen-subtitle">
          Your workspace is ready. HoneyChain will adapt as your responsibilities evolve.
        </p>
      </div>

      <div className="final-summary-card">
        <div className="summary-section">
          <span className="summary-label">Confirmed Identities</span>
          <div className="summary-chips-row">
            {confirmedDesignations.map(id => {
              const d = CANONICAL_DESIGNATION_POLICY.find(item => item.id === id);
              return (
                <span key={id} className="final-desig-chip">
                  <strong>{d ? d.name : id}</strong>
                </span>
              );
            })}
          </div>
        </div>

        <div className="summary-divider" />

        <div className="summary-section">
          <span className="summary-label">Workspace Tools</span>
          <div className="summary-modules-pills">
            {workspacePreview.resolvedModules?.slice(0, 6).map(m => (
              <span key={m.id} className="module-pill-tag">
                {m.name}
              </span>
            ))}
            {workspacePreview.resolvedModules?.length > 6 && (
              <span className="module-pill-tag more">
                +{workspacePreview.resolvedModules.length - 6} more tools
              </span>
            )}
          </div>
        </div>

        <div className="summary-divider" />

        <div className="summary-section">
          <span className="summary-label">Apiary & Operator</span>
          <span className="summary-apiary-name">{apiaryName} · {operatorName}</span>
        </div>
      </div>

      <div className="screen-bottom-dock">
        <button
          type="button"
          className="btn-primary-action"
          onClick={onComplete}
        >
          <span>Enter HoneyChain</span>
          <ArrowRight size={18} />
        </button>
        <button
          type="button"
          className="btn-tertiary-link"
          onClick={onChangeSetup}
        >
          Change setup
        </button>
      </div>
    </div>
  );
};
