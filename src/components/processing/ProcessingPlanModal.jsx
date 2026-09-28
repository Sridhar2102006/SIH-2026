import React, { useState } from 'react';
import {
  X,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Cpu,
  Layers,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { STEP_STATUSES } from '../../services/processingEngine';

export const ProcessingPlanModal = ({
  isOpen,
  onClose,
  batch,
  onUpdateApprovedPlan
}) => {
  if (!isOpen || !batch) return null;

  const [steps, setSteps] = useState(batch.approvedPlan || batch.suggestedPlan || []);
  const [expandedStepIndex, setExpandedStepIndex] = useState(0);

  const toggleExpand = (index) => {
    setExpandedStepIndex(expandedStepIndex === index ? -1 : index);
  };

  const handleToggleRequirement = (index) => {
    // Only optional or conditional steps can be toggled by operator
    const target = steps[index];
    if (target.requirement === 'MANDATORY') return;

    const updated = steps.map((s, i) => {
      if (i === index) {
        const nextReq = s.requirement === 'OPTIONAL' ? 'MANDATORY' : 'OPTIONAL';
        return { ...s, requirement: nextReq };
      }
      return s;
    });
    setSteps(updated);
  };

  const handleSavePlan = () => {
    if (onUpdateApprovedPlan) {
      onUpdateApprovedPlan({ batchId: batch.id, approvedPlan: steps });
    }
    onClose();
  };

  return (
    <div className="proc-modal-backdrop" onClick={onClose}>
      <div className="proc-modal-sheet proc-modal-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="proc-modal-header">
          <div>
            <div className="proc-badge-row">
              <span className="proc-badge-tag">Processing Operating Plan</span>
              <span className="proc-badge-code">{batch.batchNumber}</span>
              <span className="proc-badge-sop">{batch.sopCode || 'SOP-HNY-001'} (v{batch.sopVersion || '3.2'})</span>
            </div>
            <h2 className="proc-modal-title">Review & Approve Processing Plan</h2>
          </div>
          <button className="proc-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Plan Header Info */}
        <div className="proc-plan-summary-bar">
          <div className="proc-psb-col">
            <span className="proc-psb-lbl">Profile</span>
            <strong className="proc-psb-val">{batch.profileName || 'Commercial Retail Line'}</strong>
          </div>
          <div className="proc-psb-col">
            <span className="proc-psb-lbl">Total Steps</span>
            <strong className="proc-psb-val">{steps.length} Steps</strong>
          </div>
          <div className="proc-psb-col">
            <span className="proc-psb-lbl">Facility Asset</span>
            <strong className="proc-psb-val">{batch.facility || 'Plant Line #2'}</strong>
          </div>
          <div className="proc-psb-col">
            <span className="proc-psb-lbl">SOP Snapshot</span>
            <strong className="proc-psb-val">{batch.sopVersion || 'v3.2'} (Immutable)</strong>
          </div>
        </div>

        <div className="proc-modal-body">
          <div className="proc-plan-instruction">
            <Info size={16} color="#D97706" />
            <span>
              HoneyChain generated this <strong>Suggested Processing Plan</strong> based on your facility equipment and active SOP. Review parameter gates and equipment assignments before proceeding.
            </span>
          </div>

          {/* Steps List */}
          <div className="proc-plan-steps-list">
            {steps.map((step, idx) => {
              const isExpanded = expandedStepIndex === idx;
              const isMandatory = step.requirement === 'MANDATORY';
              const isConditional = step.requirement === 'CONDITIONAL';

              return (
                <div key={step.id || idx} className={`proc-plan-step-card ${isExpanded ? 'expanded' : ''}`}>
                  <div className="proc-psc-header" onClick={() => toggleExpand(idx)}>
                    <div className="proc-psc-num-title">
                      <span className="proc-psc-idx">{idx + 1}</span>
                      <div>
                        <strong className="proc-psc-name">{step.name}</strong>
                        <div className="proc-psc-meta">
                          <span className={`proc-req-pill ${step.requirement.toLowerCase()}`}>
                            {step.requirement}
                          </span>
                          <span className="proc-eq-lbl">Eq: {step.assignedEquipment || 'Standard'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="proc-psc-header-right">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="proc-psc-details">
                      <p className="proc-psc-desc">{step.description}</p>

                      {/* Expected Parameters */}
                      {step.parameterDefs && step.parameterDefs.length > 0 && (
                        <div className="proc-psc-params-block">
                          <span className="proc-psc-section-lbl">Configured Parameters:</span>
                          <div className="proc-psc-params-grid">
                            {step.parameterDefs.map(p => (
                              <div key={p.key} className="proc-psc-param-chip">
                                <span>{p.label}:</span>
                                <strong>
                                  {step.parameters?.[p.key] !== undefined ? `${step.parameters[p.key]} ${p.unit || ''}` : p.target ? `${p.target} ${p.unit || ''}` : p.unit || 'Configured'}
                                </strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Safety & Quality Gate Notes */}
                      {step.safetyNotes && (
                        <div className="proc-psc-safety-note">
                          <ShieldCheck size={14} color="#059669" />
                          <span>{step.safetyNotes}</span>
                        </div>
                      )}

                      {isConditional && step.conditionRule && (
                        <div className="proc-psc-cond-note">
                          <AlertTriangle size={14} color="#D97706" />
                          <span>Conditional Trigger: {step.conditionRule} (Condition Met: {step.conditionMet ? 'YES' : 'NO'})</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="proc-modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSavePlan}>
            <CheckCircle2 size={16} />
            <span>Approve & Lock Plan for Execution</span>
          </button>
        </div>
      </div>

      <style>{`
        .proc-badge-sop {
          background: #FEF3C7;
          color: #92400E;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .proc-plan-summary-bar {
          display: flex;
          background: linear-gradient(135deg, #FFFDF9 0%, #FAF5EB 100%);
          padding: 14px 24px;
          border-bottom: 1px solid rgba(217, 119, 6, 0.14);
          gap: 20px;
          flex-wrap: wrap;
        }

        .proc-psb-col {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .proc-psb-lbl {
          font-size: 10.5px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #8C7355;
        }

        .proc-psb-val {
          font-size: 13.5px;
          font-weight: 750;
          color: #2E1F14;
        }

        .proc-plan-instruction {
          display: flex;
          gap: 10px;
          background: #FFFBEB;
          border: 1.5px solid #FCD34D;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 12.5px;
          color: #92400E;
          margin-bottom: 16px;
        }

        .proc-plan-steps-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .proc-plan-step-card {
          border: 1.5px solid #E5DCCB;
          border-radius: 12px;
          background: #FFFFFF;
          overflow: hidden;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 3px rgba(52, 38, 27, 0.04);
        }

        .proc-plan-step-card:hover {
          border-color: #D97706;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.08);
        }

        .proc-plan-step-card.expanded {
          border-color: #D97706;
          box-shadow: 0 4px 16px rgba(217, 119, 6, 0.12);
        }

        .proc-psc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          cursor: pointer;
        }

        .proc-psc-num-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .proc-psc-idx {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #FAF6ED;
          border: 1px solid #D1C7B7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #5C4033;
        }

        .proc-psc-name {
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #2E1F14);
          display: block;
        }

        .proc-psc-meta {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 3px;
        }

        .proc-req-pill {
          font-size: 10px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .proc-req-pill.mandatory {
          background: #FEE2E2;
          color: #B91C1C;
        }

        .proc-req-pill.optional {
          background: #E0F2FE;
          color: #0369A1;
        }

        .proc-req-pill.conditional {
          background: #FEF3C7;
          color: #B45309;
        }

        .proc-eq-lbl {
          font-size: 11px;
          color: var(--color-warm-gray, #6B5B4E);
        }

        .proc-psc-details {
          padding: 0 14px 14px 50px;
          border-top: 1px solid #F3EDE2;
          background: #FFFDF8;
        }

        .proc-psc-desc {
          font-size: 12.5px;
          color: var(--color-warm-gray, #6B5B4E);
          line-height: 1.4;
          margin: 8px 0;
        }

        .proc-psc-params-block {
          margin-top: 8px;
        }

        .proc-psc-section-lbl {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2E1F14);
          display: block;
          margin-bottom: 4px;
        }

        .proc-psc-params-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .proc-psc-param-chip {
          background: #FFF;
          border: 1px solid #E5DCCB;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11.5px;
          display: flex;
          gap: 4px;
        }

        .proc-psc-param-chip span {
          color: var(--color-warm-gray, #6B5B4E);
        }

        .proc-psc-safety-note {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ECFDF5;
          padding: 6px 10px;
          border-radius: 6px;
          margin-top: 8px;
          font-size: 11.5px;
          color: #065F46;
        }

        .proc-psc-cond-note {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #FFFBEB;
          padding: 6px 10px;
          border-radius: 6px;
          margin-top: 6px;
          font-size: 11.5px;
          color: #92400E;
        }
      `}</style>
    </div>
  );
};
