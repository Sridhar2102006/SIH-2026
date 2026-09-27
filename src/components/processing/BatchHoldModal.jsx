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
      <div className="proc-modal-sheet card" onClick={e => e.stopPropagation()}>
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
        .proc-btn-confirm-hold {
          width: 100%;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #D97706;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }

        .proc-btn-confirm-hold:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .proc-existing-hold-card {
          background: #FFFDF8;
          border: 1px solid #FCD34D;
          border-radius: 8px;
          padding: 12px 14px;
        }

        .proc-eh-header {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #B45309;
          font-size: 13px;
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
