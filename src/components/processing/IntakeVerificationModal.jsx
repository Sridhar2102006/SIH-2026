import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Droplet,
  ShieldCheck,
  Calendar,
  User,
  Package,
  FileText,
  MapPin,
  Scale
} from 'lucide-react';
import { INTAKE_REJECTION_REASONS } from '../../services/processorDomainService';

export const IntakeVerificationModal = ({
  isOpen,
  onClose,
  handover,
  onAccept,
  onHold,
  onReject
}) => {
  if (!isOpen || !handover) return null;

  // Dispositions: 'ACCEPT' | 'HOLD' | 'REJECT'
  const [mode, setMode] = useState('ACCEPT');
  const [receivedQty, setReceivedQty] = useState(handover.quantityKg || 2.5);
  const [condition, setCondition] = useState('Intact / Vacuum Sealed');
  const [storageBay, setStorageBay] = useState('Intake Bay #1');
  const [remarks, setRemarks] = useState('');

  // Configurable Observational Fields (§24)
  const [foreignMaterialObs, setForeignMaterialObs] = useState('NOT_OBSERVED');
  const [odourObs, setOdourObs] = useState('NORMAL_HONEY');
  const [fermentationObs, setFermentationObs] = useState('NOT_OBSERVED');
  const [moistureObs, setMoistureObs] = useState('');

  // Hold State (§26)
  const [holdReason, setHoldReason] = useState('MOISTURE_VERIFICATION_PENDING');
  const [holdRemarks, setHoldRemarks] = useState('');

  // Rejection State
  const [selectedReason, setSelectedReason] = useState('QUANTITY_MISMATCH');
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAcceptSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = onAccept({
      handoverId: handover.id,
      traceabilityCode: handover.traceabilityCode,
      receivedQuantityKg: Number(receivedQty),
      conditionOnArrival: condition,
      storageLocation: storageBay,
      observations: {
        foreignMaterial: foreignMaterialObs,
        odour: odourObs,
        fermentationSigns: fermentationObs,
        refractometerMoisture: moistureObs ? Number(moistureObs) : null
      },
      remarks
    });
    setIsSubmitting(false);
    if (res?.success) {
      onClose();
    }
  };

  const handleHoldSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (onHold) {
      const res = onHold({
        handoverId: handover.id,
        traceabilityCode: handover.traceabilityCode,
        reason: holdReason,
        remarks: holdRemarks
      });
      setIsSubmitting(false);
      if (res?.success) {
        onClose();
      }
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionRemarks || rejectionRemarks.trim().length < 5) return;
    setIsSubmitting(true);
    const res = onReject({
      handoverId: handover.id,
      traceabilityCode: handover.traceabilityCode,
      reasonId: selectedReason,
      remarks: rejectionRemarks
    });
    setIsSubmitting(false);
    if (res?.success) {
      onClose();
    }
  };

  return (
    <div className="proc-modal-backdrop" onClick={onClose}>
      <div className="proc-modal-sheet card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="proc-modal-header">
          <div>
            <div className="proc-badge-row">
              <span className="proc-badge-tag">Harvest Intake Verification</span>
              <span className="proc-badge-code">{handover.traceabilityCode}</span>
            </div>
            <h2 className="proc-modal-title">
              {mode === 'ACCEPT' ? 'Verify & Accept Harvest' : mode === 'HOLD' ? 'Place Intake On Hold' : 'Reject Harvest Material'}
            </h2>
          </div>
          <button className="proc-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Disposition Tabs (§26) */}
        <div className="proc-disp-tabs">
          <button
            type="button"
            className={`proc-disp-tab ${mode === 'ACCEPT' ? 'active accept' : ''}`}
            onClick={() => setMode('ACCEPT')}
          >
            <CheckCircle2 size={15} />
            <span>Accept Intake</span>
          </button>
          <button
            type="button"
            className={`proc-disp-tab ${mode === 'HOLD' ? 'active hold' : ''}`}
            onClick={() => setMode('HOLD')}
          >
            <AlertTriangle size={15} />
            <span>Place on Hold</span>
          </button>
          <button
            type="button"
            className={`proc-disp-tab ${mode === 'REJECT' ? 'active reject' : ''}`}
            onClick={() => setMode('REJECT')}
          >
            <XCircle size={15} />
            <span>Reject Intake</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="proc-modal-body">
          {/* Source Provenance Card (Always visible) */}
          <div className="proc-source-card">
            <div className="proc-source-header">
              <ShieldCheck size={16} color="var(--color-primary-honey, #D97706)" />
              <span className="proc-source-title">Authentic Source Provenance</span>
            </div>
            <div className="proc-source-grid">
              <div className="proc-source-item">
                <span className="proc-s-lbl">Apiary Yard</span>
                <span className="proc-s-val">{handover.apiaryCode || 'AP1'}</span>
              </div>
              <div className="proc-source-item">
                <span className="proc-s-lbl">Hive Colony</span>
                <span className="proc-s-val">{handover.hiveCode || 'H001'}</span>
              </div>
              <div className="proc-source-item">
                <span className="proc-s-lbl">Frame Code</span>
                <span className="proc-s-val">{handover.frameNumber || 'F3'}</span>
              </div>
              <div className="proc-source-item">
                <span className="proc-s-lbl">Declared Yield</span>
                <span className="proc-s-val">{handover.quantityKg} kg</span>
              </div>
            </div>
            <div className="proc-source-sub">
              <span><strong>Floral Variety:</strong> {handover.honeyType || 'Wildflower'}</span>
              <span><strong>Submitted by:</strong> {handover.submittingBeekeeper || 'Apiarist'}</span>
              <span><strong>Timestamp:</strong> {handover.submissionTimestamp}</span>
              {handover.evidence?.containerSeal && (
                <span className="proc-seal-tag">
                  Seal: {handover.evidence.containerSeal}
                </span>
              )}
            </div>
          </div>

          {mode === 'ACCEPT' && (
            <form onSubmit={handleAcceptSubmit} className="proc-form">
              <div className="proc-form-group">
                <label className="proc-label">
                  <Scale size={14} />
                  <span>Verified Net Weight (kg) *</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1000"
                  required
                  className="proc-input"
                  value={receivedQty}
                  onChange={e => setReceivedQty(e.target.value)}
                />
                <span className="proc-helper-text">
                  Verified net honey weight on facility scale. Beekeeper declared: {handover.quantityKg} kg.
                </span>
              </div>

              {/* Physical Condition & Observational Inspection (§24) */}
              <div className="proc-inspection-section">
                <span className="proc-insp-header">Incoming Physical Observations</span>

                <div className="proc-grid-2col">
                  <div className="proc-form-group">
                    <label className="proc-label">Foreign Material</label>
                    <select
                      className="proc-select"
                      value={foreignMaterialObs}
                      onChange={e => setForeignMaterialObs(e.target.value)}
                    >
                      <option value="NOT_OBSERVED">Not Observed (Clear)</option>
                      <option value="OBSERVED">Observed (Wax / Debris)</option>
                      <option value="UNKNOWN">Unknown / Indeterminate</option>
                    </select>
                  </div>

                  <div className="proc-form-group">
                    <label className="proc-label">Odour Observation</label>
                    <select
                      className="proc-select"
                      value={odourObs}
                      onChange={e => setOdourObs(e.target.value)}
                    >
                      <option value="NORMAL_HONEY">Characteristic Honey Floral</option>
                      <option value="OFF_ODOUR_OBSERVED">Off-Odour Observed</option>
                      <option value="FERMENTED_ODOUR_OBSERVED">Fermented / Sour Odour</option>
                    </select>
                  </div>
                </div>

                <div className="proc-grid-2col">
                  <div className="proc-form-group">
                    <label className="proc-label">Fermentation / Gas Signs</label>
                    <select
                      className="proc-select"
                      value={fermentationObs}
                      onChange={e => setFermentationObs(e.target.value)}
                    >
                      <option value="NOT_OBSERVED">None (Normal Liquid/Comb)</option>
                      <option value="OBSERVED">Frothing / Gas Observed</option>
                      <option value="UNKNOWN">Unknown</option>
                    </select>
                  </div>

                  <div className="proc-form-group">
                    <label className="proc-label">Spot Moisture (% Refractometer)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="10"
                      max="30"
                      className="proc-input"
                      placeholder="e.g. 17.6 (Optional spot check)"
                      value={moistureObs}
                      onChange={e => setMoistureObs(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="proc-form-group">
                <label className="proc-label">
                  <Package size={14} />
                  <span>Physical Container Condition *</span>
                </label>
                <select
                  className="proc-select"
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                >
                  <option value="Intact / Vacuum Sealed">Intact / Vacuum Sealed (Optimal)</option>
                  <option value="Minor Cappings Leakage / Sealed">Minor Cappings Leakage (Acceptable)</option>
                  <option value="Clean Food-Grade Frame Box">Clean Food-Grade Frame Box</option>
                  <option value="Unsealed Transport Container">Unsealed Transport Container (Requires Note)</option>
                </select>
              </div>

              <div className="proc-form-group">
                <label className="proc-label">
                  <MapPin size={14} />
                  <span>Assigned Cold Holding Bay</span>
                </label>
                <select
                  className="proc-select"
                  value={storageBay}
                  onChange={e => setStorageBay(e.target.value)}
                >
                  <option value="Intake Bay #1">Intake Bay #1 (Immediate Extraction)</option>
                  <option value="Cold Room Holding A (16°C)">Cold Room Holding A (16°C)</option>
                  <option value="Pre-Extraction Rack #2">Pre-Extraction Rack #2</option>
                </select>
              </div>

              <div className="proc-form-group">
                <label className="proc-label">
                  <FileText size={14} />
                  <span>Intake Verification Remarks (Optional)</span>
                </label>
                <input
                  type="text"
                  className="proc-input"
                  placeholder="e.g. Visually clean cappings, batch ready for extraction"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>

              <div className="proc-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary proc-btn-accept"
                  disabled={isSubmitting}
                >
                  <CheckCircle2 size={16} />
                  <span>Accept Intake</span>
                </button>
              </div>
            </form>
          )}

          {mode === 'HOLD' && (
            <form onSubmit={handleHoldSubmit} className="proc-form">
              <div className="proc-hold-notice">
                <AlertTriangle size={18} color="#D97706" />
                <div>
                  <strong>Intake Quarantine & Review</strong>
                  <p>Placing an intake on hold pauses batch assignment while preserving custody chain.</p>
                </div>
              </div>

              <div className="proc-form-group">
                <label className="proc-label">Reason for Hold Disposition *</label>
                <select
                  className="proc-select"
                  value={holdReason}
                  onChange={e => setHoldReason(e.target.value)}
                >
                  <option value="MOISTURE_VERIFICATION_PENDING">High Moisture Observation — Verification Needed</option>
                  <option value="SUSPECT_FOREIGN_MATTER">Suspected Foreign Matter — Re-examination Required</option>
                  <option value="SEAL_DISCREPANCY">Container Seal Discrepancy — Beekeeper Clarification</option>
                  <option value="SUPERVISOR_REVIEW_REQUIRED">Quality Supervisor Review Required</option>
                  <option value="TEMPERATURE_ABNORMAL">Temperature on Arrival Outside SOP Limits</option>
                </select>
              </div>

              <div className="proc-form-group">
                <label className="proc-label">Quarantine Notes & Instructions *</label>
                <textarea
                  className="proc-textarea"
                  rows={3}
                  required
                  placeholder="Specify inspection findings, quarantine location, or actions required before release..."
                  value={holdRemarks}
                  onChange={e => setHoldRemarks(e.target.value)}
                />
              </div>

              <div className="proc-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMode('ACCEPT')}
                >
                  Back to Review
                </button>
                <button
                  type="submit"
                  className="btn proc-btn-confirm-hold"
                  disabled={isSubmitting}
                >
                  Confirm Hold
                </button>
              </div>
            </form>
          )}

          {mode === 'REJECT' && (
            <form onSubmit={handleRejectSubmit} className="proc-form">
              <div className="proc-reject-warning">
                <AlertTriangle size={18} color="#B85450" />
                <div>
                  <strong>Mandatory Rejection Documentation</strong>
                  <p>Rejecting harvest material notifies the beekeeper and flags the custody chain in the audit ledger.</p>
                </div>
              </div>

              <div className="proc-form-group">
                <label className="proc-label">Reason for Rejection *</label>
                <div className="proc-radio-list">
                  {INTAKE_REJECTION_REASONS.map(r => (
                    <label
                      key={r.id}
                      className={`proc-radio-card ${selectedReason === r.id ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="rejectionReason"
                        value={r.id}
                        checked={selectedReason === r.id}
                        onChange={() => setSelectedReason(r.id)}
                      />
                      <div>
                        <strong>{r.label}</strong>
                        <p>{r.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="proc-form-group">
                <label className="proc-label">Detailed Operational Remarks *</label>
                <textarea
                  className="proc-textarea"
                  rows={3}
                  required
                  placeholder="Describe observed defect, physical variance, or seal compromise..."
                  value={rejectionRemarks}
                  onChange={e => setRejectionRemarks(e.target.value)}
                />
              </div>

              <div className="proc-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMode('ACCEPT')}
                >
                  Back to Review
                </button>
                <button
                  type="submit"
                  className="proc-btn-confirm-reject"
                  disabled={isSubmitting || rejectionRemarks.trim().length < 5}
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .proc-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(44, 24, 16, 0.65);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        @media (min-width: 600px) {
          .proc-modal-backdrop {
            align-items: center;
            padding: 20px;
          }
        }

        .proc-modal-sheet {
          width: 100%;
          max-width: 540px;
          max-height: 90vh;
          background: #FFFFFF;
          border-radius: 20px 20px 0 0;
          display: flex;
          flex-direction: column;
          box-shadow: 0 -8px 32px rgba(44, 24, 16, 0.2);
          overflow: hidden;
        }

        @media (min-width: 600px) {
          .proc-modal-sheet {
            border-radius: 16px;
          }
        }

        .proc-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 18px 20px;
          border-bottom: 1px solid var(--color-divider, #E5DCCB);
          background: #FFFDF8;
        }

        .proc-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .proc-badge-tag {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #8C5311;
          background: #FEF3C7;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .proc-badge-code {
          font-family: monospace;
          font-size: 12px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-modal-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
          margin: 0;
        }

        .proc-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-warm-gray, #736961);
          padding: 6px;
          border-radius: 8px;
        }

        .proc-close-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .proc-modal-body {
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .proc-source-card {
          background: #FFF9EF;
          border: 1px solid #EAD8B8;
          border-radius: 12px;
          padding: 14px;
        }

        .proc-source-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }

        .proc-source-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #8C5311;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .proc-source-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          background: #FFFFFF;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #EFE4D2;
        }

        .proc-source-item {
          display: flex;
          flex-direction: column;
          text-align: center;
        }

        .proc-s-lbl {
          font-size: 10px;
          color: var(--color-warm-gray, #736961);
          text-transform: uppercase;
        }

        .proc-s-val {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
          margin-top: 2px;
        }

        .proc-source-sub {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 14px;
          margin-top: 10px;
          font-size: 12px;
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-seal-tag {
          font-family: monospace;
          background: #E8F5E9;
          color: #1B5E20;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }

        .proc-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .proc-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .proc-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-input, .proc-select, .proc-textarea {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--color-divider, #E5DCCB);
          background: #FFFFFF;
          font-size: 14px;
          color: var(--color-deep-cocoa, #2C1810);
          box-sizing: border-box;
          width: 100%;
        }

        .proc-input:focus, .proc-select:focus, .proc-textarea:focus {
          outline: none;
          border-color: var(--color-primary-honey, #D97706);
          box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.2);
        }

        .proc-helper-text {
          font-size: 11px;
          color: var(--color-warm-gray, #736961);
        }

        .proc-modal-actions {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 10px;
          margin-top: 10px;
        }

        .proc-btn-reject {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #E5C3C3;
          background: #FFF5F5;
          color: #B85450;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
        }

        .proc-btn-reject:hover {
          background: #FEE8E8;
        }

        .proc-btn-accept {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 46px;
          font-size: 14px;
        }

        .proc-btn-confirm-reject {
          background: #B85450;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          padding: 12px;
          cursor: pointer;
        }

        .proc-btn-confirm-reject:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .proc-reject-warning {
          display: flex;
          gap: 10px;
          background: #FFF5F5;
          border: 1px solid #F5C6C6;
          border-radius: 8px;
          padding: 12px;
          font-size: 12.5px;
          color: #7A2826;
        }

        .proc-radio-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .proc-radio-card {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 10px 12px;
          border: 1px solid var(--color-divider, #E5DCCB);
          border-radius: 8px;
          cursor: pointer;
          background: #FFF;
          font-size: 13px;
        }

        .proc-radio-card.active {
          border-color: #B85450;
          background: #FFFBFB;
        }

        .proc-disp-tabs {
          display: flex;
          background: #F4EAD9;
          padding: 4px;
          border-bottom: 1px solid var(--color-divider, #E5DCCB);
          gap: 4px;
        }

        .proc-disp-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-warm-gray, #736961);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .proc-disp-tab.active.accept {
          background: #FFFFFF;
          color: #059669;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        }

        .proc-disp-tab.active.hold {
          background: #FFFFFF;
          color: #D97706;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        }

        .proc-disp-tab.active.reject {
          background: #FFFFFF;
          color: #DC2626;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        }

        .proc-inspection-section {
          background: #FAF7F0;
          border: 1px solid #EAE0CE;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .proc-insp-header {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .proc-hold-notice {
          display: flex;
          gap: 10px;
          background: #FFFBEB;
          border: 1px solid #FCD34D;
          border-radius: 8px;
          padding: 12px;
          font-size: 12.5px;
          color: #92400E;
        }

        .proc-btn-confirm-hold {
          background: #D97706;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          padding: 12px;
          cursor: pointer;
        }

        .proc-btn-confirm-hold:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .proc-radio-card p {
          margin: 2px 0 0;
          font-size: 11.5px;
          color: var(--color-warm-gray, #736961);
        }
      `}</style>
    </div>
  );
};
