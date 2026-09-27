import React, { useState, useMemo } from 'react';
import {
  X,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  QrCode,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import {
  generateTraceabilityCode,
  isCodeUnique,
  HONEY_TYPES
} from '../../services/beekeeperDomainService';

export const RegisterFrameModal = ({ isOpen, onClose, initialHiveId = null }) => {
  const {
    apiaries = [],
    hives = [],
    frames = [],
    registerFrame,
    showToast
  } = useAppState();

  const [step, setStep] = useState(1);
  const [selectedApiaryCode, setSelectedApiaryCode] = useState(apiaries[0]?.apiaryCode || 'AP1');
  const [selectedHiveCode, setSelectedHiveCode] = useState(() => {
    if (initialHiveId) {
      const h = hives.find(hive => hive.id === initialHiveId);
      if (h) return h.code ? `H${h.code.padStart ? h.code.padStart(3, '0') : h.code}` : 'H001';
    }
    return 'H001';
  });
  const [frameNumber, setFrameNumber] = useState('F3');
  const [honeyType, setHoneyType] = useState('Wildflower');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Available hives for selected apiary
  const availableHives = useMemo(() => {
    return hives.filter(h => !h.isArchived);
  }, [hives]);

  // Next available frame calculation
  const existingFrameNumbersForHive = useMemo(() => {
    return frames
      .filter(f => f.hiveCode === selectedHiveCode)
      .map(f => f.frameNumber);
  }, [frames, selectedHiveCode]);

  // Deterministic Generated Code
  const generatedCode = useMemo(() => {
    return generateTraceabilityCode(selectedApiaryCode, selectedHiveCode, frameNumber);
  }, [selectedApiaryCode, selectedHiveCode, frameNumber]);

  // Code uniqueness check
  const codeAlreadyExists = useMemo(() => {
    return !isCodeUnique(generatedCode, frames);
  }, [generatedCode, frames]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    setErrorMessage(null);
    if (step === 3) {
      if (!frameNumber.trim()) {
        setErrorMessage('Please specify a frame number (e.g. F3 or 3).');
        return;
      }
      if (codeAlreadyExists) {
        setErrorMessage(`Traceability code ${generatedCode} already exists in your apiary. Duplicate frame registrations are not permitted.`);
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setStep(s => s - 1);
  };

  const handleRegister = async () => {
    if (codeAlreadyExists) {
      setErrorMessage(`Code collision: ${generatedCode} is already registered. Please choose another frame number.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await registerFrame({
        apiaryCode: selectedApiaryCode,
        hiveCode: selectedHiveCode,
        frameNumber,
        honeyType,
        notes
      });

      if (res && res.success) {
        setRegistrationSuccess(res.frame);
        showToast(`Frame ${generatedCode} registered successfully`);
      } else {
        setErrorMessage(res?.error || 'Failed to register frame.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error registering frame');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    setStep(1);
    setRegistrationSuccess(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="bk-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bk-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bk-modal-header">
          <div className="bk-header-title-wrap">
            <div className="bk-header-icon-badge">
              <Layers size={20} color="#D99A24" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="bk-modal-title">Register Hive Frame</h2>
              <p className="bk-modal-sub">
                Prepare and assign a deterministic traceability identity
              </p>
            </div>
          </div>
          <button className="bk-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Success Screen */}
        {registrationSuccess ? (
          <div className="bk-success-body">
            <div className="bk-success-icon-wrap">
              <CheckCircle2 size={44} color="#496B45" strokeWidth={2.3} />
            </div>
            <h3 className="bk-success-title">Frame Successfully Registered</h3>
            <p className="bk-success-desc">
              This frame unit has been assigned a unique, immutable traceability identity in HoneyChain.
            </p>

            <div className="bk-code-hero-card">
              <span className="bk-code-label">Traceability Identity</span>
              <div className="bk-code-row">
                <QrCode size={22} color="#D99A24" />
                <span className="bk-code-value">{registrationSuccess.traceabilityCode}</span>
              </div>
              <div className="bk-code-breakdown">
                <span>Apiary: <strong>{registrationSuccess.apiaryCode}</strong></span>
                <span>Hive: <strong>{registrationSuccess.hiveCode}</strong></span>
                <span>Frame: <strong>{registrationSuccess.frameNumber}</strong></span>
              </div>
            </div>

            <div className="bk-lifecycle-badge">
              Status: <strong>Placed in Hive (Ready for Brood & Nectar)</strong>
            </div>

            <button className="btn btn-primary btn-block bk-finish-btn" onClick={handleDone}>
              Done & Return to Hive
            </button>
          </div>
        ) : (
          <div className="bk-stepper-body">
            {/* Step Progress Indicators */}
            <div className="bk-step-progress" aria-label="Registration steps">
              <div className={`bk-step-pip ${step >= 1 ? 'active' : ''}`}>1. Apiary</div>
              <div className="bk-step-divider" />
              <div className={`bk-step-pip ${step >= 2 ? 'active' : ''}`}>2. Hive</div>
              <div className="bk-step-divider" />
              <div className={`bk-step-pip ${step >= 3 ? 'active' : ''}`}>3. Frame</div>
              <div className="bk-step-divider" />
              <div className={`bk-step-pip ${step >= 4 ? 'active' : ''}`}>4. Confirm</div>
            </div>

            {errorMessage && (
              <div className="bk-alert-error" role="alert">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Select Apiary */}
            {step === 1 && (
              <div className="bk-step-content">
                <label className="bk-field-label">Step 1 — Select Apiary Location</label>
                <p className="bk-field-hint">
                  The apiary code will form the prefix of this frame's global traceability identity.
                </p>
                <div className="bk-choice-list" role="radiogroup">
                  {apiaries.map(ap => {
                    const isSelected = selectedApiaryCode === ap.apiaryCode;
                    return (
                      <div
                        key={ap.id}
                        className={`bk-choice-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedApiaryCode(ap.apiaryCode)}
                        role="radio"
                        aria-checked={isSelected}
                      >
                        <div className="bk-choice-radio-pip" />
                        <div className="bk-choice-details">
                          <div className="bk-choice-title-row">
                            <span className="bk-choice-code-badge">{ap.apiaryCode}</span>
                            <strong className="bk-choice-title">{ap.name}</strong>
                          </div>
                          <span className="bk-choice-sub">{ap.location}</span>
                          <span className="bk-choice-meta">{ap.hiveBoxesCount} hive boxes · {ap.operator}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Select Hive */}
            {step === 2 && (
              <div className="bk-step-content">
                <label className="bk-field-label">Step 2 — Select Hive Box</label>
                <p className="bk-field-hint">
                  Choose the hive box in {selectedApiaryCode} where this frame is being placed.
                </p>
                <div className="bk-choice-list" role="radiogroup">
                  {availableHives.map(hive => {
                    const cleanCode = hive.code ? (hive.code.startsWith('H') ? hive.code : `H${hive.code.padStart(3, '0')}`) : 'H001';
                    const isSelected = selectedHiveCode === cleanCode;
                    return (
                      <div
                        key={hive.id}
                        className={`bk-choice-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedHiveCode(cleanCode)}
                        role="radio"
                        aria-checked={isSelected}
                      >
                        <div className="bk-choice-radio-pip" />
                        <div className="bk-choice-details">
                          <div className="bk-choice-title-row">
                            <span className="bk-choice-code-badge hive">{cleanCode}</span>
                            <strong className="bk-choice-title">{hive.name}</strong>
                          </div>
                          <span className="bk-choice-sub">{hive.location || 'Apiary yard'}</span>
                          <span className="bk-choice-meta">{hive.breed} · {hive.superFramesTotal || 10} frame capacity</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Frame Number & Botanical Expected Floral Source */}
            {step === 3 && (
              <div className="bk-step-content">
                <label className="bk-field-label">Step 3 — Frame Number</label>
                <p className="bk-field-hint">
                  Specify the frame position inside hive box {selectedHiveCode} (e.g. F1 through F10).
                </p>

                <div className="bk-quick-frame-pills">
                  {['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'].map(fNum => {
                    const isTaken = existingFrameNumbersForHive.includes(fNum);
                    const isSelected = frameNumber === fNum;
                    return (
                      <button
                        key={fNum}
                        type="button"
                        className={`bk-frame-pill ${isSelected ? 'selected' : ''} ${isTaken ? 'taken' : ''}`}
                        onClick={() => setFrameNumber(fNum)}
                        title={isTaken ? `${fNum} is currently registered in this hive` : `Select ${fNum}`}
                      >
                        <span>{fNum}</span>
                        {isTaken && <span className="bk-taken-label">In Use</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="bk-input-group" style={{ marginTop: '16px' }}>
                  <label className="bk-sub-label">Custom Frame Code (Optional override)</label>
                  <input
                    type="text"
                    className="bk-text-input"
                    value={frameNumber}
                    onChange={e => setFrameNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. F3"
                    maxLength={6}
                  />
                </div>

                <div className="bk-input-group" style={{ marginTop: '16px' }}>
                  <label className="bk-sub-label">Expected Floral Flow / Honey Type</label>
                  <select
                    className="bk-select-input"
                    value={honeyType}
                    onChange={e => setHoneyType(e.target.value)}
                  >
                    {HONEY_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Real-time Code Preview */}
                <div className="bk-preview-box">
                  <span className="bk-preview-label">Generated Traceability Identity:</span>
                  <strong className={`bk-preview-code ${codeAlreadyExists ? 'error' : ''}`}>
                    {generatedCode}
                  </strong>
                  {codeAlreadyExists && (
                    <span className="bk-preview-collision-warning">
                      ⚠️ This code already exists. Please choose a different frame number.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Final Confirmation */}
            {step === 4 && (
              <div className="bk-step-content">
                <label className="bk-field-label">Step 4 — Verify Frame Setup</label>
                <p className="bk-field-hint">
                  Ready to register this frame? HoneyChain will generate its immutable identity.
                </p>

                <div className="bk-confirmation-card">
                  <div className="bk-conf-hero">
                    <span className="bk-conf-id-label">Assigned Traceability Identity</span>
                    <strong className="bk-conf-id-val">{generatedCode}</strong>
                  </div>

                  <div className="bk-conf-rows">
                    <div className="bk-conf-row">
                      <span className="bk-conf-key">Apiary</span>
                      <span className="bk-conf-val">{selectedApiaryCode}</span>
                    </div>
                    <div className="bk-conf-row">
                      <span className="bk-conf-key">Hive Box</span>
                      <span className="bk-conf-val">{selectedHiveCode}</span>
                    </div>
                    <div className="bk-conf-row">
                      <span className="bk-conf-key">Frame Position</span>
                      <span className="bk-conf-val">{frameNumber}</span>
                    </div>
                    <div className="bk-conf-row">
                      <span className="bk-conf-key">Expected Floral Type</span>
                      <span className="bk-conf-val">{honeyType}</span>
                    </div>
                    <div className="bk-conf-row">
                      <span className="bk-conf-key">Initial Lifecycle State</span>
                      <span className="bk-conf-val green">Active in Hive</span>
                    </div>
                  </div>

                  <div className="bk-conf-notes">
                    <label className="bk-sub-label">Setup Notes (Optional)</label>
                    <input
                      type="text"
                      className="bk-text-input"
                      placeholder="e.g. New beeswax foundation installed. Wax drawn cleanly."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bk-field-guarantee">
                  <ShieldCheck size={18} color="#496B45" />
                  <span>
                    Deterministic code AP1H001F3 is unique and permanently traceable to this hive and frame.
                  </span>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="bk-modal-actions">
              {step > 1 ? (
                <button
                  type="button"
                  className="btn btn-secondary bk-back-btn"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary bk-back-btn"
                  onClick={onClose}
                >
                  Cancel
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  className="btn btn-primary bk-next-btn"
                  onClick={handleNextStep}
                  disabled={step === 3 && codeAlreadyExists}
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary bk-submit-btn"
                  onClick={handleRegister}
                  disabled={isSubmitting || codeAlreadyExists}
                >
                  {isSubmitting ? 'Registering Frame...' : 'Register Frame'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .bk-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(52, 38, 27, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 100;
        }
        @media (min-width: 480px) {
          .bk-modal-overlay {
            align-items: center;
          }
        }
        .bk-modal-card {
          width: 100%;
          max-width: 430px;
          background: var(--color-warm-cream);
          border-radius: 20px 20px 0 0;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 -8px 32px rgba(52, 38, 27, 0.2);
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 480px) {
          .bk-modal-card {
            border-radius: 20px;
          }
        }
        .bk-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px 14px;
          border-bottom: 1px solid var(--color-divider);
        }
        .bk-header-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bk-header-icon-badge {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(217, 154, 36, 0.14);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bk-modal-title {
          font-size: 17.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          margin: 0;
        }
        .bk-modal-sub {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          margin: 2px 0 0;
        }
        .bk-close-btn {
          background: none;
          border: none;
          padding: 8px;
          color: var(--color-warm-gray);
          cursor: pointer;
          border-radius: 50%;
        }
        .bk-stepper-body {
          padding: 18px 20px 24px;
        }
        .bk-step-progress {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          background: #F4EAD8;
          padding: 6px 12px;
          border-radius: 20px;
        }
        .bk-step-pip {
          font-size: 11.5px;
          font-weight: 600;
          color: #8C7E70;
        }
        .bk-step-pip.active {
          color: #34261B;
          font-weight: 700;
        }
        .bk-step-divider {
          flex: 1;
          height: 1px;
          background: #E5D5C1;
          margin: 0 6px;
        }
        .bk-field-label {
          display: block;
          font-size: 15px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          margin-bottom: 4px;
        }
        .bk-field-hint {
          font-size: 13px;
          color: var(--color-warm-gray);
          margin: 0 0 16px;
          line-height: 1.4;
        }
        .bk-sub-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
          margin-bottom: 6px;
        }
        .bk-choice-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bk-choice-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .bk-choice-card.selected {
          border-color: #D99A24;
          background: #FFFDF8;
          box-shadow: 0 2px 8px rgba(217, 154, 36, 0.12);
        }
        .bk-choice-radio-pip {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #C4B6A6;
          margin-top: 2px;
          position: relative;
        }
        .bk-choice-card.selected .bk-choice-radio-pip {
          border-color: #D99A24;
        }
        .bk-choice-card.selected .bk-choice-radio-pip::after {
          content: '';
          position: absolute;
          top: 3px; left: 3px; right: 3px; bottom: 3px;
          background: #D99A24;
          border-radius: 50%;
        }
        .bk-choice-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .bk-choice-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bk-choice-code-badge {
          background: #EDE2D1;
          color: #34261B;
          font-weight: 700;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .bk-choice-code-badge.hive {
          background: rgba(73, 107, 69, 0.15);
          color: #496B45;
        }
        .bk-choice-title {
          font-size: 14.5px;
          color: var(--color-deep-cocoa);
        }
        .bk-choice-sub {
          font-size: 12.5px;
          color: var(--color-warm-gray);
        }
        .bk-choice-meta {
          font-size: 11.5px;
          color: #8C7E70;
          margin-top: 2px;
        }
        .bk-quick-frame-pills {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }
        .bk-frame-pill {
          padding: 10px 4px;
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border);
          border-radius: 8px;
          font-weight: 700;
          font-size: 13.5px;
          color: var(--color-deep-cocoa);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .bk-frame-pill.selected {
          border-color: #D99A24;
          background: #FFFDF8;
          color: #B87316;
        }
        .bk-frame-pill.taken {
          background: #F2EDE4;
          color: #9E9182;
          border-color: #E2D7C8;
        }
        .bk-taken-label {
          font-size: 9px;
          font-weight: 500;
          color: #B87316;
        }
        .bk-text-input, .bk-select-input {
          width: 100%;
          height: 44px;
          padding: 0 12px;
          border: 1.5px solid var(--color-card-border);
          border-radius: 8px;
          background: #FFFFFF;
          font-size: 14.5px;
          color: var(--color-deep-cocoa);
          outline: none;
        }
        .bk-text-input:focus, .bk-select-input:focus {
          border-color: #D99A24;
        }
        .bk-preview-box {
          margin-top: 18px;
          padding: 12px 14px;
          background: #F5EDE0;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .bk-preview-label {
          font-size: 12px;
          color: var(--color-warm-gray);
        }
        .bk-preview-code {
          font-size: 20px;
          letter-spacing: 0.5px;
          color: #496B45;
          font-weight: 800;
        }
        .bk-preview-code.error {
          color: #B85450;
        }
        .bk-preview-collision-warning {
          font-size: 11.5px;
          color: #B85450;
          font-weight: 600;
        }
        .bk-confirmation-card {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 14px;
        }
        .bk-conf-hero {
          background: #496B45;
          color: #FFFFFF;
          padding: 16px;
          text-align: center;
        }
        .bk-conf-id-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.85;
          margin-bottom: 4px;
        }
        .bk-conf-id-val {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .bk-conf-rows {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bk-conf-row {
          display: flex;
          justify-content: space-between;
          font-size: 13.5px;
        }
        .bk-conf-key {
          color: var(--color-warm-gray);
        }
        .bk-conf-val {
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }
        .bk-conf-val.green {
          color: #496B45;
        }
        .bk-conf-notes {
          padding: 0 16px 16px;
        }
        .bk-field-guarantee {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12.5px;
          color: #496B45;
          background: rgba(73, 107, 69, 0.1);
          padding: 10px 12px;
          border-radius: 8px;
        }
        .bk-modal-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
        }
        .bk-back-btn {
          flex: 1;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .bk-next-btn, .bk-submit-btn {
          flex: 2;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .bk-alert-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(184, 84, 80, 0.12);
          border: 1px solid #B85450;
          color: #8C2B27;
          border-radius: 8px;
          font-size: 12.5px;
          margin-bottom: 14px;
        }
        .bk-success-body {
          padding: 32px 20px 24px;
          text-align: center;
        }
        .bk-success-icon-wrap {
          margin-bottom: 16px;
        }
        .bk-success-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          margin-bottom: 6px;
        }
        .bk-success-desc {
          font-size: 14px;
          color: var(--color-warm-gray);
          margin-bottom: 20px;
          line-height: 1.5;
        }
        .bk-code-hero-card {
          background: #FFFFFF;
          border: 1.5px solid #496B45;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 18px;
        }
        .bk-code-label {
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #71845B;
          display: block;
          margin-bottom: 6px;
        }
        .bk-code-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .bk-code-value {
          font-size: 24px;
          font-weight: 800;
          color: #496B45;
          letter-spacing: 1px;
        }
        .bk-code-breakdown {
          display: flex;
          justify-content: space-around;
          font-size: 12.5px;
          color: var(--color-warm-gray);
          border-top: 1px solid #EDE2D1;
          padding-top: 8px;
        }
        .bk-lifecycle-badge {
          display: inline-block;
          background: rgba(73, 107, 69, 0.12);
          color: #496B45;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};
