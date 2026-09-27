import React from 'react';
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
        <h1 className="screen-title">Based on what you do, these work identities match.</h1>
        <p className="screen-subtitle">
          Choose the identities that accurately represent your work. Multiple identities compose seamlessly.
        </p>
      </div>

      <div className="designations-cards-stack">
        {CANONICAL_DESIGNATION_POLICY.map(desig => {
          const evalObj = Array.isArray(designationEvaluation.evaluations)
            ? designationEvaluation.evaluations.find(e => e.designationId === desig.id)
            : (designationEvaluation.evaluationsMap?.[desig.id] || designationEvaluation.evaluations?.[desig.id] || null);
          const isSuggested = designationEvaluation.suggestions?.some(s => s.designationId === desig.id);
          const isSelected = confirmedDesignations.includes(desig.id);

          if (!isSuggested && !isSelected && (!evalObj || evalObj.eligibilityState === 'NOT_ELIGIBLE')) {
            return null;
          }

          const stateLabel = evalObj?.eligibilityState === 'REQUIRES_VERIFICATION'
            ? 'Verification Needed'
            : evalObj?.eligibilityState === 'STRONG_MATCH'
              ? 'Eligible Match'
              : evalObj?.eligibilityState === 'POSSIBLE_MATCH'
                ? 'Possible Match'
                : 'Eligible Match';

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
                  <span className={"desig-state-pill " + (evalObj?.eligibilityState?.toLowerCase() || '')}>
                    {stateLabel}
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
                  {evalObj?.matchedSupporting?.map(sup => (
                    <li key={sup}>• You use {CAPABILITY_MAP.get(sup)?.name || sup}</li>
                  ))}
                  {(!evalObj?.matchedRequired?.length && !evalObj?.matchedCore?.length && !evalObj?.matchedSupporting?.length) && (
                    evalObj?.explanations?.length > 0
                      ? evalObj.explanations.map((exp, i) => <li key={i}>• {exp}</li>)
                      : <li>• Matches your selected work focus</li>
                  )}
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
