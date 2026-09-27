const fs = require('fs');

// 6. AdaptiveDesignationsScreen.jsx
const desigsCode = `import React from 'react';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';
import { CANONICAL_DESIGNATION_POLICY } from '../../services/designationEngine';
import { CAPABILITY_MAP } from '../../services/capabilityRegistry';

export const AdaptiveDesignationsScreen = ({
  designationEvaluation = {},
  confirmedDesignations = [],
  onToggleDesignation,
  onContinue
}) => {
  return (
    <div className="screen-container">
      <div className="screen-header">
        <span className="micro-badge-step">06 • Work Identities</span>
        <h1 className="screen-title">Based on what you do, these work identities match.</h1>
        <p className="screen-subtitle">
          Choose the identities that accurately represent your work. Multiple identities compose seamlessly.
        </p>
      </div>

      <div className="designations-cards-stack">
        {CANONICAL_DESIGNATION_POLICY.map(desig => {
          const evalObj = designationEvaluation.evaluations ? designationEvaluation.evaluations[desig.id] : null;
          const isSuggested = designationEvaluation.suggestions?.some(s => s.designationId === desig.id);
          const isSelected = confirmedDesignations.includes(desig.id);

          if (!isSuggested && !isSelected && (!evalObj || evalObj.eligibilityState === 'NOT_ELIGIBLE')) {
            return null;
          }

          return (
            <div
              key={desig.id}
              className={"designation-match-card " + (isSelected ? 'selected' : '')}
              onClick={() => onToggleDesignation(desig.id)}
              role="button"
              tabIndex={0}
            >
              <div className="desig-card-header">
                <div className="desig-title-col">
                  <h3 className="desig-name">{desig.name}</h3>
                  <span className="desig-state-pill">
                    {evalObj?.eligibilityState === 'REQUIRES_VERIFICATION' ? 'Verification Needed' : 'Eligible Match'}
                  </span>
                </div>
                <div className={"desig-checkbox " + (isSelected ? 'checked' : '')}>
                  {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
                </div>
              </div>

              <div className="desig-reasons-block">
                <span className="reasons-label">Why this appears:</span>
                <ul className="reasons-list">
                  {evalObj?.matchedRequired?.map(req => (
                    <li key={req}>• You handle {CAPABILITY_MAP.get(req)?.name || req}</li>
                  ))}
                  {evalObj?.matchedCore?.map(core => (
                    <li key={core}>• You perform {CAPABILITY_MAP.get(core)?.name || core}</li>
                  ))}
                </ul>
              </div>

              {evalObj?.verificationRequirements?.length > 0 && (
                <div className="desig-verification-alert">
                  <AlertCircle size={14} color="#C47D15" />
                  <span>Requires administrative verification before executing certified quality or audit releases.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="screen-bottom-dock">
        <button
          type="button"
          className="btn-primary-action"
          onClick={onContinue}
        >
          <span>Preview Your Workspace</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
`;
fs.writeFileSync('D:/SIH-2026/src/components/onboarding/AdaptiveDesignationsScreen.jsx', desigsCode, 'utf8');
console.log('Wrote AdaptiveDesignationsScreen.jsx');

// 7. AdaptiveWorkspacePreviewScreen.jsx
const previewCode = `import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const AdaptiveWorkspacePreviewScreen = ({
  workspacePreview = {},
  onContinue
}) => {
  return (
    <div className="screen-container">
      <div className="screen-header">
        <span className="micro-badge-step">07 • Workspace Preview</span>
        <h1 className="screen-title">Your HoneyChain workspace</h1>
        <p className="screen-subtitle">
          We've composed your navigation, dashboard, and tools around your confirmed capabilities.
        </p>
      </div>

      <div className="workspace-tools-accordion">
        {Object.entries(workspacePreview.groupedModules || {}).map(([category, modules]) => (
          <div key={category} className="workspace-group-card">
            <span className="workspace-cat-label">{category}</span>
            <div className="workspace-modules-list">
              {modules.map(mod => (
                <div key={mod.id} className="workspace-mod-row">
                  <div className="mod-left">
                    <CheckCircle2 size={16} color="var(--color-healthy, #10B981)" />
                    <div className="mod-details">
                      <span className="mod-title">{mod.name}</span>
                      <span className="mod-desc">{mod.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="screen-bottom-dock">
        <button
          type="button"
          className="btn-primary-action"
          onClick={onContinue}
        >
          <span>Final Review</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
`;
fs.writeFileSync('D:/SIH-2026/src/components/onboarding/AdaptiveWorkspacePreviewScreen.jsx', previewCode, 'utf8');
console.log('Wrote AdaptiveWorkspacePreviewScreen.jsx');

// 8. AdaptiveConfirmationScreen.jsx
const confirmCode = `import React from 'react';
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
                  ? <strong>{d ? d.name : id}</strong>
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
                ? {m.name}
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
          <span className="summary-apiary-name">{apiaryName} • {operatorName}</span>
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
`;
fs.writeFileSync('D:/SIH-2026/src/components/onboarding/AdaptiveConfirmationScreen.jsx', confirmCode, 'utf8');
console.log('Wrote AdaptiveConfirmationScreen.jsx');
