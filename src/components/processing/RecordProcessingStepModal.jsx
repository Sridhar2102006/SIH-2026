import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Cpu,
  Layers,
  Thermometer,
  Clock,
  Filter,
  Camera,
  Scale,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Info
} from 'lucide-react';
import { CANONICAL_PROCESSING_STEPS, getStepDefinition } from '../../data/processor/processingStepCatalog';
import { evaluateParameterCompliance } from '../../data/processor/regulatoryStandards';
import { INITIAL_EQUIPMENT_REGISTRY } from '../../data/processor/processorSeedData';

export const RecordProcessingStepModal = ({
  isOpen,
  onClose,
  batch,
  onRecordStep
}) => {
  if (!isOpen || !batch) return null;

  // Use the batch's approved plan or fallback to canonical steps
  const planSteps = batch.approvedPlan?.length > 0
    ? batch.approvedPlan
    : CANONICAL_PROCESSING_STEPS.slice(0, 5).map(s => ({
        stepKey: s.key,
        name: s.name,
        shortLabel: s.shortLabel,
        requirement: s.defaultRequirement
      }));

  const completedKeys = (batch.steps || []).map(s => s.stepKey);
  const nextPendingStep = planSteps.find(s => !completedKeys.includes(s.stepKey)) || planSteps[0];

  const [selectedStepKey, setSelectedStepKey] = useState(nextPendingStep.stepKey);
  const canonicalDef = getStepDefinition(selectedStepKey) || CANONICAL_PROCESSING_STEPS[0];

  // Parameters state mapping from canonical definition defaults or current values
  const [params, setParams] = useState(() => {
    const init = {};
    canonicalDef.parameterDefs?.forEach(p => {
      init[p.key] = p.default ?? p.target ?? '';
    });
    // For net yield, default to batch initial weight if empty
    if ((selectedStepKey === 'PACKAGING_PREPARATION' || selectedStepKey === 'FINAL_PROCESSING') && batch.weightKg) {
      init.netYieldKg = (batch.weightKg * 0.985).toFixed(1);
      init.processLossKg = (batch.weightKg * 0.015).toFixed(2);
    }
    return init;
  });

  const [equipment, setEquipment] = useState(canonicalDef.allowedEquipmentTypes?.[0] || 'Standard Line');
  const [remarks, setRemarks] = useState('');
  const [evidencePhoto, setEvidencePhoto] = useState('/hive-inspection-sample.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [complianceWarnings, setComplianceWarnings] = useState([]);

  // When step changes, update parameters defaults
  const handleStepChange = (key) => {
    setSelectedStepKey(key);
    const def = getStepDefinition(key) || CANONICAL_PROCESSING_STEPS[0];
    const newParams = {};
    def.parameterDefs?.forEach(p => {
      newParams[p.key] = p.default ?? p.target ?? '';
    });
    if ((key === 'PACKAGING_PREPARATION' || key === 'FINAL_PROCESSING') && batch.weightKg) {
      newParams.netYieldKg = (batch.weightKg * 0.985).toFixed(1);
      newParams.processLossKg = (batch.weightKg * 0.015).toFixed(2);
    }
    setParams(newParams);
    setEquipment(def.allowedEquipmentTypes?.[0] || 'Standard Line');
    setValidationErrors([]);
    setComplianceWarnings([]);
  };

  const handleParamChange = (key, val) => {
    const updated = { ...params, [key]: val };
    setParams(updated);
    setValidationErrors([]);

    // Real-time compliance check for known sensitive parameters
    const warnings = [];
    if (key === 'initialMoisturePercent' || key === 'postMoisturePercent' || key === 'finalMoisturePercent' || key === 'moisturePercent') {
      const num = Number(val);
      if (!isNaN(num) && num > 20.0) {
        warnings.push(`Warning: ${num}% moisture exceeds FSSAI standard (Max 20.0%). Requires moisture stabilization or disposition.`);
      }
    } else if (key === 'targetHoneyTempC' || key === 'tankTempC' || key === 'temperatureC') {
      const num = Number(val);
      if (!isNaN(num) && num > 45.0) {
        warnings.push(`Warning: ${num}°C process temperature exceeds the 45.0°C thermal threshold. Risk of HMF surge.`);
      }
    }
    setComplianceWarnings(warnings);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Required fields check
    const errors = [];
    canonicalDef.parameterDefs?.forEach(p => {
      if (p.required && (params[p.key] === undefined || params[p.key] === null || params[p.key] === '')) {
        errors.push(`Field "${p.label}" is required.`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const res = onRecordStep({
      batchId: batch.id,
      stepKey: selectedStepKey,
      parameters: params,
      equipment,
      evidence: evidencePhoto,
      remarks,
      operator: batch.leadOperator || 'Marcus K.'
    });
    setIsSubmitting(false);

    if (res?.success) {
      onClose();
    }
  };

  return (
    <div className="proc-modal-backdrop" onClick={onClose}>
      <div className="proc-modal-sheet proc-modal-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="proc-modal-header">
          <div>
            <div className="proc-badge-row">
              <span className="proc-badge-tag">Processing Operation</span>
              <span className="proc-badge-code">{batch.batchNumber}</span>
              <span className="proc-badge-sop">{batch.sopCode || 'SOP-HNY-001'}</span>
            </div>
            <h2 className="proc-modal-title">Record Processing Step Execution</h2>
          </div>
          <button className="proc-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="proc-modal-body">
          {/* Step Selector Ribbon */}
          <div className="proc-form-group">
            <label className="proc-label">Select Processing Operation from Approved Plan *</label>
            <div className="proc-step-selector-row">
              {planSteps.map((s, idx) => {
                const isCompleted = completedKeys.includes(s.stepKey);
                const isSelected = selectedStepKey === s.stepKey;
                return (
                  <button
                    key={s.stepKey}
                    type="button"
                    className={`proc-step-pill-btn ${isSelected ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => handleStepChange(s.stepKey)}
                  >
                    <span className="proc-pill-num">{idx + 1}</span>
                    <span className="proc-pill-txt">{s.shortLabel || s.stepKey}</span>
                    {isCompleted && <CheckCircle2 size={12} className="proc-pill-check" />}
                  </button>
                );
              })}
            </div>
            <p className="proc-step-desc">{canonicalDef.description}</p>
          </div>

          {/* Validation Errors Box */}
          {validationErrors.length > 0 && (
            <div className="proc-err-box">
              <AlertCircle size={16} />
              <div>
                <strong>Required Parameter Input Missing</strong>
                <ul>
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Real-Time Compliance Warnings */}
          {complianceWarnings.length > 0 && (
            <div className="proc-warn-box">
              <AlertTriangle size={16} color="#D97706" />
              <div>
                <strong>Regulatory & Thermal Boundary Alert</strong>
                <ul>
                  {complianceWarnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Dynamic Step Parameters Form */}
          <div className="proc-dynamic-params-container">
            <div className="proc-dpc-header">
              <span className="proc-dpc-title">Configured Operating Parameters ({canonicalDef.parameterDefs?.length || 0})</span>
              <span className="proc-dpc-sub">Values logged immutably into batch execution record</span>
            </div>

            <div className="proc-dynamic-fields-grid">
              {canonicalDef.parameterDefs?.map(p => {
                const val = params[p.key] ?? '';
                const isBoolean = p.type === 'boolean';
                const isSelect = p.type === 'select';

                return (
                  <div key={p.key} className="proc-d-field">
                    <label className="proc-d-label">
                      <span>{p.label}</span>
                      {p.required && <span className="text-red">*</span>}
                      {p.unit && !p.label.toLowerCase().includes(p.unit.toLowerCase()) && (
                        <span className="proc-d-unit">({p.unit})</span>
                      )}
                    </label>

                    {isBoolean ? (
                      <div className="proc-bool-toggle">
                        <button
                          type="button"
                          className={`proc-bool-btn ${val === true ? 'active' : ''}`}
                          onClick={() => handleParamChange(p.key, true)}
                        >
                          Yes / Verified
                        </button>
                        <button
                          type="button"
                          className={`proc-bool-btn ${val === false ? 'active' : ''}`}
                          onClick={() => handleParamChange(p.key, false)}
                        >
                          No / Discrepancy
                        </button>
                      </div>
                    ) : isSelect ? (
                      <select
                        className="proc-select"
                        value={val}
                        onChange={e => handleParamChange(p.key, e.target.value)}
                      >
                        {p.options.map(opt => (
                          <option key={opt} value={opt}>
                            {opt.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="proc-input-unit-wrap">
                        <input
                          type={p.type === 'number' ? 'number' : 'text'}
                          step={p.unit === '%' ? '0.1' : p.unit === 'kg' ? '0.01' : '1'}
                          className="proc-input"
                          value={val}
                          onChange={e => handleParamChange(p.key, e.target.value)}
                          placeholder={p.target ? `Target: ${p.target} ${p.unit || ''}` : ''}
                        />
                        {p.unit && <span className="proc-unit-addon">{p.unit}</span>}
                      </div>
                    )}

                    {p.validationRule && (
                      <span className="proc-field-hint">{p.validationRule}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="proc-form-group">
            <label className="proc-label">
              <Cpu size={14} />
              <span>Assigned Facility Asset / Line Equipment *</span>
            </label>
            <select
              className="proc-select"
              value={equipment}
              onChange={e => setEquipment(e.target.value)}
            >
              {canonicalDef.allowedEquipmentTypes?.map(eq => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
              <option value="Radial Extractor #1 (TechnoBee 24-Frame)">Radial Extractor #1 (TechnoBee 24-Frame)</option>
              <option value="Settling Tank #2 (500L Jacketed)">Settling Tank #2 (500L Jacketed)</option>
              <option value="Double Stainless Sieve #1 (400/200 µm)">Double Stainless Sieve #1 (400/200 µm)</option>
              <option value="Atago PAL-22S Digital Refractometer">Atago PAL-22S Digital Refractometer</option>
            </select>
          </div>

          {/* Evidence Capture */}
          <div className="proc-form-group">
            <label className="proc-label">
              <Camera size={14} />
              <span>Process Photographic / Document Evidence</span>
            </label>
            <div className="proc-evidence-row">
              <div className="proc-evidence-preview">
                <img src={evidencePhoto} alt="Process Evidence Preview" />
              </div>
              <div className="proc-evidence-info">
                <strong>Photo Attached</strong>
                <span>Ref: PROC-EVID-{selectedStepKey}-0927.jpg</span>
                <span className="proc-evid-ts">Timestamp: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Operator Remarks */}
          <div className="proc-form-group">
            <label className="proc-label">Operator Notes & Observations</label>
            <textarea
              className="proc-textarea"
              rows={2}
              placeholder="e.g. Honey flowing clear, aroma clean, wax froth skimming underway..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="proc-modal-actions-single">
            <button
              type="submit"
              className="btn btn-primary proc-submit-btn"
              disabled={isSubmitting}
            >
              <CheckCircle2 size={16} />
              <span>Log Step Execution ({canonicalDef.shortLabel})</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .proc-step-selector-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 4px 2px 8px;
          scrollbar-width: thin;
        }

        .proc-step-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 9999px;
          background: #FFFFFF;
          border: 1.5px solid #E5DCCB;
          color: #5C4B3C;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(52, 38, 27, 0.04);
        }

        .proc-step-pill-btn:hover {
          border-color: #D97706;
          background: #FFFDF8;
          transform: translateY(-1px);
        }

        .proc-step-pill-btn.active {
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
          border-color: #D97706;
          color: #B45309;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.18);
        }

        .proc-step-pill-btn.completed {
          border-color: #A7F3D0;
          background: #F0FDF4;
          color: #065F46;
        }

        .proc-pill-num {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(120, 109, 97, 0.12);
          font-size: 11px;
          font-weight: 800;
        }

        .proc-step-pill-btn.active .proc-pill-num {
          background: #D97706;
          color: #FFFFFF;
        }

        .proc-step-pill-btn.completed .proc-pill-num {
          background: #059669;
          color: #FFFFFF;
        }

        .proc-pill-check {
          color: #059669;
        }

        .proc-step-desc {
          font-size: 12.5px;
          color: #786D61;
          margin: 6px 0 0;
          line-height: 1.4;
        }

        .proc-err-box {
          display: flex;
          gap: 10px;
          background: #FEF2F2;
          border: 1.5px solid #F87171;
          border-radius: 12px;
          padding: 12px 16px;
          color: #991B1B;
          font-size: 13px;
        }

        .proc-err-box ul {
          margin: 4px 0 0;
          padding-left: 18px;
        }

        .proc-warn-box {
          display: flex;
          gap: 10px;
          background: #FFFBEB;
          border: 1.5px solid #F59E0B;
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 14px;
        }

        .proc-warn-box strong {
          font-size: 13px;
          color: #B45309;
          display: block;
          margin-bottom: 2px;
        }

        .proc-warn-box ul {
          margin: 0;
          padding-left: 16px;
          font-size: 12px;
          color: #92400E;
        }

        .proc-dynamic-params-container {
          background: linear-gradient(135deg, #FFFDF9 0%, #FAF6EE 100%);
          border: 1.5px solid rgba(217, 119, 6, 0.2);
          border-radius: 16px;
          padding: 18px 20px;
          margin-bottom: 14px;
          box-shadow: 0 4px 16px rgba(52, 38, 27, 0.04);
        }

        .proc-dpc-header {
          margin-bottom: 14px;
        }

        .proc-dpc-title {
          font-size: 14px;
          font-weight: 800;
          color: #2E1F14;
          display: block;
          letter-spacing: -0.2px;
        }

        .proc-dpc-sub {
          font-size: 12px;
          color: #786D61;
        }

        .proc-dynamic-fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          align-items: start;
        }

        .proc-d-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .proc-d-label {
          font-size: 12.5px;
          font-weight: 700;
          color: #2E1F14;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .proc-d-unit {
          color: #786D61;
          font-weight: 500;
          font-size: 11.5px;
        }

        .proc-input-unit-wrap {
          display: flex;
          align-items: center;
          position: relative;
          width: 100%;
        }

        .proc-input-unit-wrap .proc-input {
          width: 100%;
          height: 44px;
          padding: 10px 48px 10px 14px;
          border-radius: 10px;
          border: 1.5px solid #D1C7B7;
          background: #FFFFFF;
          font-size: 14px;
          font-weight: 600;
          color: #2E1F14;
          box-sizing: border-box;
          transition: all 0.18s ease;
        }

        .proc-input-unit-wrap .proc-input:focus {
          outline: none;
          border-color: #D97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.18);
          background: #FFFDF9;
        }

        .proc-unit-addon {
          position: absolute;
          right: 14px;
          font-size: 12px;
          font-weight: 750;
          color: #8C7355;
          pointer-events: none;
          text-transform: uppercase;
        }

        .proc-field-hint {
          font-size: 11px;
          color: #92400E;
          line-height: 1.35;
        }

        .proc-bool-toggle {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        .proc-bool-btn {
          flex: 1;
          height: 44px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1.5px solid #D1C7B7;
          background: #FFFFFF;
          font-size: 13px;
          font-weight: 700;
          color: #5C4B3C;
          cursor: pointer;
          transition: all 0.18s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(52, 38, 27, 0.04);
        }

        .proc-bool-btn:hover {
          border-color: #D97706;
          background: #FFFDF9;
        }

        .proc-bool-btn.active {
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
          border-color: #B45309;
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.25);
        }

        .proc-evidence-row {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #FFF;
          border: 1px solid #E5DCCB;
          border-radius: 8px;
          padding: 8px 12px;
        }

        .proc-evidence-preview {
          width: 50px;
          height: 50px;
          border-radius: 6px;
          overflow: hidden;
          background: #E5DCCB;
          flex-shrink: 0;
        }

        .proc-evidence-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .proc-evidence-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .proc-evidence-info strong {
          font-size: 12.5px;
          color: var(--color-deep-cocoa, #2E1F14);
        }

        .proc-evidence-info span {
          font-size: 11px;
          color: var(--color-warm-gray, #6B5B4E);
        }

        .proc-evid-ts {
          font-size: 10px;
          color: #059669;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
