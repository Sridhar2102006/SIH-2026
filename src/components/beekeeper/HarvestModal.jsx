import React, { useState, useMemo } from 'react';
import {
  X,
  Droplet,
  CheckCircle2,
  Calendar,
  Clock,
  QrCode,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Camera,
  AlertCircle
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { HONEY_TYPES } from '../../services/beekeeperDomainService';

export const HarvestModal = ({
  isOpen,
  onClose,
  initialFrameId = null,
  onHarvestSuccess
}) => {
  const {
    frames = [],
    hives = [],
    apiaries = [],
    recordHarvest,
    showToast
  } = useAppState();

  const [step, setStep] = useState(1); // 1 = Frame Selection & Verify, 2 = Record Details, 3 = Confirmation, 4 = Success
  const [selectedFrameId, setSelectedFrameId] = useState(initialFrameId || '');
  const [harvestDate, setHarvestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [harvestTime, setHarvestTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [honeyType, setHoneyType] = useState('Wildflower');
  const [quantityKg, setQuantityKg] = useState('2.4');
  const [beeActivity, setBeeActivity] = useState('Calm and steady foraging');
  const [remarks, setRemarks] = useState('');
  const [evidencePhoto, setEvidencePhoto] = useState('/hive-inspection-sample.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedHarvest, setSavedHarvest] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Available frames eligible for harvest (ACTIVE or READY_FOR_HARVEST)
  const eligibleFrames = useMemo(() => {
    return frames.filter(f => f.status !== 'HARVESTED' && f.status !== 'SUBMITTED_TO_PROCESSOR');
  }, [frames]);

  const selectedFrame = useMemo(() => {
    return frames.find(f => f.id === selectedFrameId || f.traceabilityCode === selectedFrameId) || eligibleFrames[0];
  }, [frames, selectedFrameId, eligibleFrames]);

  const hive = useMemo(() => {
    return hives.find(h => h.id === selectedFrame?.hiveId || (h.code && `H${h.code.padStart ? h.code.padStart(3, '0') : h.code}` === selectedFrame?.hiveCode));
  }, [hives, selectedFrame]);

  if (!isOpen) return null;

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 2) {
      if (!quantityKg || isNaN(parseFloat(quantityKg)) || parseFloat(quantityKg) <= 0) {
        setErrorMsg('Please specify a valid harvest quantity in kg.');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep(s => s - 1);
  };

  const handleConfirmHarvest = async () => {
    if (!selectedFrame) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await recordHarvest({
        frameId: selectedFrame.id,
        traceabilityCode: selectedFrame.traceabilityCode,
        hiveId: selectedFrame.hiveId,
        hiveCode: selectedFrame.hiveCode,
        apiaryCode: selectedFrame.apiaryCode,
        honeyType,
        quantityKg: parseFloat(quantityKg),
        harvestDate,
        harvestTime,
        beeActivity,
        remarks,
        evidencePhoto
      });

      if (res && res.success) {
        setSavedHarvest(res.harvest);
        setStep(4);
        showToast(`Harvest recorded for ${selectedFrame.traceabilityCode}`);
        onHarvestSuccess?.(res.harvest);
      } else {
        setErrorMsg(res?.error || 'Failed to record harvest.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error recording harvest.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSavedHarvest(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="bk-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bk-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bk-modal-header">
          <div className="bk-header-title-wrap">
            <div className="bk-header-icon-badge">
              <Droplet size={20} color="#D99A24" />
            </div>
            <div>
              <h2 className="bk-modal-title">Record Frame Harvest</h2>
              <p className="bk-modal-sub">
                Capture harvest yield and preserve immutable frame provenance
              </p>
            </div>
          </div>
          <button className="bk-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="bk-stepper-body">
          {errorMsg && (
            <div className="bk-alert-error" role="alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Select Hive & Frame (Verify Identity) */}
          {step === 1 && (
            <div className="bk-step-content">
              <label className="bk-field-label">Step 1 — Verify Frame Identity</label>
              <p className="bk-field-hint">
                Select the specific capped frame being harvested. Verify the deterministic traceability code.
              </p>

              <div className="bk-choice-list">
                {eligibleFrames.map(f => {
                  const isSelected = selectedFrame?.id === f.id;
                  return (
                    <div
                      key={f.id}
                      className={`bk-choice-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedFrameId(f.id)}
                      role="radio"
                      aria-checked={isSelected}
                    >
                      <div className="bk-choice-radio-pip" />
                      <div className="bk-choice-details">
                        <div className="bk-choice-title-row">
                          <span className="bk-choice-code-badge">{f.traceabilityCode}</span>
                          <strong className="bk-choice-title">Frame {f.frameNumber} ({f.hiveCode})</strong>
                        </div>
                        <span className="bk-choice-sub">
                          {f.cappedPercentage || 90}% capped · {f.honeyType || 'Wildflower'}
                        </span>
                        <span className="bk-choice-meta">Last checked: {f.lastInspectedAt || 'Recent'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedFrame && (
                <div className="bk-code-verify-box">
                  <span className="bk-code-v-lbl">Verified Traceability Code</span>
                  <div className="bk-code-v-row">
                    <QrCode size={20} color="#496B45" />
                    <strong className="bk-code-v-val">{selectedFrame.traceabilityCode}</strong>
                  </div>
                </div>
              )}

              <div className="bk-modal-actions">
                <button type="button" className="btn btn-secondary bk-back-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary bk-next-btn" onClick={handleNext}>
                  <span>Proceed to Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Record Harvest Details */}
          {step === 2 && (
            <div className="bk-step-content">
              <label className="bk-field-label">Step 2 — Record Harvest Details</label>
              <p className="bk-field-hint">
                Logging harvest parameters for frame <strong>{selectedFrame?.traceabilityCode}</strong>.
              </p>

              <div className="bk-input-group">
                <label className="bk-sub-label">Floral Source / Honey Type</label>
                <select
                  className="bk-select-input"
                  value={honeyType}
                  onChange={e => setHoneyType(e.target.value)}
                >
                  {HONEY_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span className="bk-input-hint">If exact botanical source cannot be confirmed, select "Unknown / Not recorded".</span>
              </div>

              <div className="bk-input-group" style={{ marginTop: '14px' }}>
                <label className="bk-sub-label">Harvested Net Quantity (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="bk-text-input"
                  value={quantityKg}
                  onChange={e => setQuantityKg(e.target.value)}
                  placeholder="e.g. 2.4"
                />
              </div>

              <div className="bk-grid-2" style={{ marginTop: '14px' }}>
                <div>
                  <label className="bk-sub-label">Harvest Date</label>
                  <input
                    type="date"
                    className="bk-text-input"
                    value={harvestDate}
                    onChange={e => setHarvestDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="bk-sub-label">Harvest Time</label>
                  <input
                    type="time"
                    className="bk-text-input"
                    value={harvestTime}
                    onChange={e => setHarvestTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="bk-input-group" style={{ marginTop: '14px' }}>
                <label className="bk-sub-label">Bee Activity Observation</label>
                <input
                  type="text"
                  className="bk-text-input"
                  value={beeActivity}
                  onChange={e => setBeeActivity(e.target.value)}
                  placeholder="e.g. Calm, gentle foraging during harvest"
                />
              </div>

              <div className="bk-input-group" style={{ marginTop: '14px' }}>
                <label className="bk-sub-label">Harvest Remarks / Method</label>
                <input
                  type="text"
                  className="bk-text-input"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Cold uncapped with warm knife. No smoke residue."
                />
              </div>

              <div className="bk-modal-actions">
                <button type="button" className="btn btn-secondary bk-back-btn" onClick={handleBack}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="button" className="btn btn-primary bk-next-btn" onClick={handleNext}>
                  <span>Review & Confirm</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Harvest Confirmation (Section 22) */}
          {step === 3 && (
            <div className="bk-step-content">
              <label className="bk-field-label">Step 3 — You're recording a harvest</label>
              <p className="bk-field-hint">
                Review the harvest record before committing it to HoneyChain's immutable history.
              </p>

              <div className="bk-confirmation-card">
                <div className="bk-conf-hero harvest">
                  <span className="bk-conf-id-label">Harvesting Traceability Unit</span>
                  <strong className="bk-conf-id-val">{selectedFrame?.traceabilityCode}</strong>
                </div>

                <div className="bk-conf-rows">
                  <div className="bk-conf-row">
                    <span className="bk-conf-key">Hive Box</span>
                    <span className="bk-conf-val">{selectedFrame?.hiveCode} ({hive?.name || 'Cedar Queen'})</span>
                  </div>
                  <div className="bk-conf-row">
                    <span className="bk-conf-key">Frame</span>
                    <span className="bk-conf-val">{selectedFrame?.frameNumber}</span>
                  </div>
                  <div className="bk-conf-row">
                    <span className="bk-conf-key">Harvested</span>
                    <span className="bk-conf-val">{harvestDate} · {harvestTime}</span>
                  </div>
                  <div className="bk-conf-row">
                    <span className="bk-conf-key">Honey Floral Type</span>
                    <span className="bk-conf-val">{honeyType}</span>
                  </div>
                  <div className="bk-conf-row">
                    <span className="bk-conf-key">Harvest Quantity</span>
                    <span className="bk-conf-val bold">{quantityKg} kg</span>
                  </div>
                  {remarks && (
                    <div className="bk-conf-row">
                      <span className="bk-conf-key">Remarks</span>
                      <span className="bk-conf-val">{remarks}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bk-field-guarantee">
                <ShieldCheck size={18} color="#496B45" />
                <span>
                  Confirming will update frame {selectedFrame?.traceabilityCode} to HARVESTED and generate a verifiable harvest record.
                </span>
              </div>

              <div className="bk-modal-actions">
                <button type="button" className="btn btn-secondary bk-back-btn" onClick={handleBack} disabled={isSubmitting}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary bk-submit-btn"
                  onClick={handleConfirmHarvest}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Recording Harvest...' : 'Confirm Harvest'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Harvest Success */}
          {step === 4 && (
            <div className="bk-success-body">
              <div className="bk-success-icon-wrap">
                <CheckCircle2 size={44} color="#496B45" strokeWidth={2.3} />
              </div>
              <h3 className="bk-success-title">Harvest Recorded</h3>
              <p className="bk-success-desc">
                Frame {savedHarvest?.traceabilityCode || selectedFrame?.traceabilityCode} has been successfully logged.
              </p>

              <div className="bk-code-hero-card">
                <span className="bk-code-label">Traceability Identity</span>
                <div className="bk-code-row">
                  <QrCode size={22} color="#D99A24" />
                  <span className="bk-code-value">{savedHarvest?.traceabilityCode}</span>
                </div>
                <div className="bk-code-breakdown">
                  <span>Quantity: <strong>{savedHarvest?.quantityKg} kg</strong></span>
                  <span>Type: <strong>{savedHarvest?.honeyType}</strong></span>
                  <span>Status: <strong>Harvested</strong></span>
                </div>
              </div>

              <p className="bk-next-step-hint">
                You can now submit this harvested honey to the Processor for extraction and settling.
              </p>

              <button className="btn btn-primary btn-block bk-finish-btn" onClick={handleClose}>
                Done & Return
              </button>
            </div>
          )}
        </div>
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
          max-width: 440px;
          background: var(--color-warm-cream, #FFFDF8);
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
          border-bottom: 1px solid var(--color-divider, #EDE2D1);
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
          color: var(--color-deep-cocoa, #34261B);
          margin: 0;
        }
        .bk-modal-sub {
          font-size: 12.5px;
          color: var(--color-warm-gray, #6C5D4B);
          margin: 2px 0 0;
        }
        .bk-close-btn {
          background: none;
          border: none;
          padding: 8px;
          color: var(--color-warm-gray, #6C5D4B);
          cursor: pointer;
          border-radius: 50%;
        }
        .bk-stepper-body {
          padding: 18px 20px 24px;
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
        .bk-step-content {
          display: flex;
          flex-direction: column;
        }
        .bk-field-label {
          display: block;
          font-size: 15px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          margin-bottom: 4px;
        }
        .bk-field-hint {
          font-size: 13px;
          color: var(--color-warm-gray, #6C5D4B);
          margin: 0 0 16px;
          line-height: 1.4;
        }
        .bk-sub-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
          margin-bottom: 6px;
        }
        .bk-choice-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 12px;
        }
        .bk-choice-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border, #E4D8C7);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .bk-choice-card:hover {
          border-color: #D99A24;
          background: #FFFDF8;
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
          flex-shrink: 0;
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
          gap: 3px;
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
        .bk-choice-title {
          font-size: 14.5px;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-choice-sub {
          font-size: 12.5px;
          color: var(--color-warm-gray, #6C5D4B);
        }
        .bk-choice-meta {
          font-size: 11.5px;
          color: #8C7E70;
          margin-top: 2px;
        }
        .bk-text-input, .bk-select-input {
          width: 100%;
          height: 44px;
          padding: 0 12px;
          border: 1.5px solid var(--color-card-border, #E4D8C7);
          border-radius: 8px;
          background: #FFFFFF;
          font-size: 14.5px;
          color: var(--color-deep-cocoa, #34261B);
          outline: none;
          box-sizing: border-box;
        }
        .bk-text-input:focus, .bk-select-input:focus {
          border-color: #D99A24;
        }
        .bk-input-group {
          display: flex;
          flex-direction: column;
        }
        .bk-code-verify-box {
          margin-top: 14px;
          background: #EAF0E7;
          border: 1px solid #496B45;
          padding: 12px 14px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .bk-code-v-lbl {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #496B45;
          font-weight: 700;
        }
        .bk-code-v-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bk-code-v-val {
          font-size: 18px;
          color: #34261B;
          letter-spacing: 0.5px;
        }
        .bk-input-hint {
          display: block;
          font-size: 11.5px;
          color: var(--color-warm-gray, #6C5D4B);
          margin-top: 4px;
        }
        .bk-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .bk-confirmation-card {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border, #E4D8C7);
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
        .bk-conf-hero.harvest {
          background: #D99A24;
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
          color: var(--color-warm-gray, #6C5D4B);
        }
        .bk-conf-val {
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-conf-val.bold {
          font-weight: 800;
          color: #496B45;
          font-size: 15px;
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
          color: var(--color-deep-cocoa, #34261B);
          margin-bottom: 6px;
        }
        .bk-success-desc {
          font-size: 14px;
          color: var(--color-warm-gray, #6C5D4B);
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
          color: var(--color-warm-gray, #6C5D4B);
          border-top: 1px solid #EDE2D1;
          padding-top: 8px;
        }
        .bk-next-step-hint {
          font-size: 13px;
          color: var(--color-warm-gray, #6C5D4B);
          margin-bottom: 20px;
          line-height: 1.45;
        }
        .bk-finish-btn {
          height: 48px;
        }
      `}</style>
    </div>
  );
};
