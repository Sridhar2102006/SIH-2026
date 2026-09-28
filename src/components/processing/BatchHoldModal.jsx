import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Play,
  PauseCircle,
  Clock,
  User,
  FileText
} from 'lucide-react';
import { BATCH_HOLD_REASONS } from '../../services/processorDomainService';

export const BatchHoldModal = ({
  isOpen,
  onClose,
  batch,
  onPutOnHold,
  onResumeFromHold
}) => {
  if (!isOpen || !batch) return null;

  const isAlreadyOnHold = batch.status === 'ON_HOLD';

  const [selectedReason, setSelectedReason] = useState('EQUIPMENT_ISSUE');
  const [remarks, setRemarks] = useState('');
  const [resumeRemarks, setResumeRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHoldSubmit = (e) => {
    e.preventDefault();
    if (!remarks || remarks.trim().length < 5) return;

    setIsSubmitting(true);
    const res = onPutOnHold({
      batchId: batch.id,
      reasonId: selectedReason,
      remarks
    });
    setIsSubmitting(false);

    if (res?.success) {
      onClose();
    }
  };

  const handleResumeSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = onResumeFromHold({
      batchId: batch.id,
      remarks: resumeRemarks
    });
    setIsSubmitting(false);

    if (res?.success) {
      onClose();
    }
  };

  return (
    <div className="proc-modal-backdrop" onClick={onClose}>
      <div className="proc-modal-sheet" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="proc-modal-header">
          <div>
            <div className="proc-badge-row">
              <span className="proc-badge-tag">{isAlreadyOnHold ? 'Hold Resolution' : 'Operational Halt'}</span>
              <span className="proc-badge-code">{batch.batchNumber}</span>
            </div>
            <h2 className="proc-modal-title">
              {isAlreadyOnHold ? 'Resume Processing from Hold' : 'Place Batch On Hold'}
            </h2>
          </div>
          <button className="proc-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="proc-modal-body">
          {!isAlreadyOnHold ? (
            <form onSubmit={handleHoldSubmit} className="proc-form">
              <div className="proc-reject-warning">
                <AlertTriangle size={18} color="#D97706" />
                <div>
                  <strong>Processing Halted Notice</strong>
                  <p>Placing batch {batch.batchNumber} on hold halts all further step recordings until the issue is cleared and verified.</p>
                </div>
              </div>

              <div className="proc-form-group">
                <label className="proc-label">Hold Reason Category *</label>
                <div className="proc-radio-list">
                  {BATCH_HOLD_REASONS.map(r => (
                    <label
                      key={r.id}
                      className={`proc-radio-card ${selectedReason === r.id ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="batchHoldReason"
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
                <label className="proc-label">
                  <FileText size={14} />
                  <span>Specific Operational Details *</span>
                </label>
                <textarea
                  className="proc-textarea"
                  rows={3}
                  required
                  placeholder="Describe observed equipment variance, temperature spike, or missing beekeeper paperwork..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>

              <div className="proc-modal-actions-single">
                <button
                  type="submit"
                  className="proc-btn-confirm-hold"
                  disabled={isSubmitting || remarks.trim().length < 5}
                >
                  <PauseCircle size={16} />
                  <span>Confirm Hold for {batch.batchNumber}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResumeSubmit} className="proc-form">
              {/* Existing Hold Details */}
              {batch.holds?.[0] && (
                <div className="proc-existing-hold-card">
                  <div className="proc-eh-header">
                    <Clock size={15} color="#D97706" />
                    <strong>Current Hold Information</strong>
                  </div>
                  <div className="proc-eh-body">
                    <p><strong>Reason:</strong> {batch.holds[0].reasonLabel}</p>
                    <p><strong>Started:</strong> {batch.holds[0].startedAt} by {batch.holds[0].operator}</p>
                    <p><strong>Notes:</strong> {batch.holds[0].remarks}</p>
                  </div>
                </div>
              )}

              <div className="proc-form-group">
                <label className="proc-label">Resolution / Clearance Notes</label>
                <textarea
                  className="proc-textarea"
                  rows={3}
                  placeholder="e.g. Pump recalibrated and verified, tank temperature returned to 22.4°C."
                  value={resumeRemarks}
                  onChange={e => setResumeRemarks(e.target.value)}
                />
              </div>

              <div className="proc-modal-actions-single">
                <button
                  type="submit"
                  className="btn btn-primary proc-submit-btn"
                  disabled={isSubmitting}
                >
                  <Play size={16} />
                  <span>Resume Processing</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .proc-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          width: 100%;
        }

        .proc-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .proc-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 750;
          color: #2E1F14;
          margin: 0;
        }

        .proc-label svg {
          color: #D97706;
          flex-shrink: 0;
        }

        .proc-reject-warning {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          background: #FFFBEB;
          border: 1.5px solid #F59E0B;
          color: #92400E;
        }

        .proc-reject-warning svg {
          color: #D97706;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .proc-reject-warning strong {
          display: block;
          font-size: 13.5px;
          font-weight: 750;
          color: #B45309;
          margin-bottom: 3px;
        }

        .proc-reject-warning p {
          margin: 0;
          font-size: 12.5px;
          line-height: 1.4;
          color: #92400E;
        }

        .proc-radio-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .proc-radio-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1.5px solid #E5DCCB;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 3px rgba(52, 38, 27, 0.04);
          box-sizing: border-box;
        }

        .proc-radio-card:hover {
          border-color: #D97706;
          background: #FFFDF9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.08);
        }

        .proc-radio-card.active {
          border-color: #D97706;
          background: linear-gradient(135deg, #FFFDF8 0%, #FEF9EE 100%);
          box-shadow: 0 3px 12px rgba(217, 119, 6, 0.12);
        }

        .proc-radio-card input[type="radio"] {
          width: 18px;
          height: 18px;
          accent-color: #D97706;
          margin-top: 2px;
          flex-shrink: 0;
          cursor: pointer;
        }

        .proc-radio-card strong {
          display: block;
          font-size: 14px;
          font-weight: 750;
          color: #2E1F14;
          margin-bottom: 2px;
        }

        .proc-radio-card p {
          margin: 0;
          font-size: 12px;
          color: #786D61;
          line-height: 1.35;
        }

        .proc-textarea {
          width: 100%;
          min-height: 84px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1.5px solid #D1C7B7;
          background: #FFFFFF;
          font-size: 13.5px;
          color: #2E1F14;
          line-height: 1.45;
          transition: all 0.18s ease;
          box-sizing: border-box;
          font-family: inherit;
          resize: vertical;
          display: block;
        }

        .proc-textarea:focus {
          outline: none;
          border-color: #D97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.18);
          background: #FFFDF9;
        }

        .proc-modal-actions-single {
          margin-top: 8px;
          width: 100%;
        }

        .proc-btn-confirm-hold {
          width: 100%;
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 750;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);
        }

        .proc-btn-confirm-hold:hover:not(:disabled) {
          background: linear-gradient(135deg, #B45309 0%, #92400E 100%);
          box-shadow: 0 6px 20px rgba(217, 119, 6, 0.4);
          transform: translateY(-1px);
        }

        .proc-btn-confirm-hold:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }

        .proc-existing-hold-card {
          background: #FFFDF8;
          border: 1.5px solid #FCD34D;
          border-radius: 12px;
          padding: 14px 16px;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.06);
        }

        .proc-eh-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #B45309;
          font-size: 13.5px;
          margin-bottom: 8px;
        }

        .proc-eh-body p {
          margin: 4px 0;
          font-size: 12.5px;
          color: var(--color-deep-cocoa, #2C1810);
        }
      `}</style>
    </div>
  );
};
