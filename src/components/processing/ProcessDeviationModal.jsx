import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  User,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { DEVIATION_SEVERITIES, DEVIATION_DISPOSITIONS } from '../../services/processingEngine';

export const ProcessDeviationModal = ({
  isOpen,
  onClose,
  batch,
  deviation = null,
  onSaveDeviation,
  onResolveDeviation
}) => {
  if (!isOpen || !batch) return null;

  const isResolving = Boolean(deviation && deviation.id);

  // New Deviation State
  const [stepKey, setStepKey] = useState(batch.steps?.[0]?.stepKey || 'WARMING');
  const [parameterKey, setParameterKey] = useState('warmingTempC');
  const [parameterName, setParameterName] = useState('Honey Process Temperature');
  const [expectedValue, setExpectedValue] = useState('<= 45.0°C');
  const [actualValue, setActualValue] = useState('47.8°C');
  const [severity, setSeverity] = useState(DEVIATION_SEVERITIES.MEDIUM);
  const [reason, setReason] = useState('');

  // Disposition State
  const [disposition, setDisposition] = useState(deviation?.disposition || 'HOLD');
  const [dispositionNotes, setDispositionNotes] = useState(deviation?.dispositionNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 5) return;

    setIsSubmitting(true);
    const newDev = {
      id: `dev-${Date.now()}`,
      batchId: batch.id,
      stepKey,
      stepName: stepKey.replace(/_/g, ' '),
      parameter: parameterName,
      expected: expectedValue,
      actual: actualValue,
      severity,
      reason,
      operator: 'Marcus K.',
      disposition: 'HOLD',
      dispositionNotes: 'Awaiting formal supervisor disposition',
      recordedAt: new Date().toISOString(),
      resolvedAt: null,
      reviewedBy: null
    };

    if (onSaveDeviation) {
      onSaveDeviation({ batchId: batch.id, deviation: newDev });
    }
    setIsSubmitting(false);
    onClose();
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!dispositionNotes || dispositionNotes.trim().length < 5) return;

    setIsSubmitting(true);
    if (onResolveDeviation) {
      onResolveDeviation({
        batchId: batch.id,
        deviationId: deviation.id,
        disposition,
        notes: dispositionNotes,
        reviewerName: 'Plant Lead Inspector'
      });
    }
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="proc-modal-backdrop" onClick={onClose}>
      <div className="proc-modal-sheet card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="proc-modal-header">
          <div>
            <div className="proc-badge-row">
              <span className="proc-badge-tag">Process Quality Control</span>
              <span className="proc-badge-code">{batch.batchNumber}</span>
            </div>
            <h2 className="proc-modal-title">
              {isResolving ? 'Review Process Deviation Disposition' : 'Record Process Deviation'}
            </h2>
          </div>
          <button className="proc-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="proc-modal-body">
          {isResolving ? (
            /* DISPOSITION RESOLUTION FORM */
            <form onSubmit={handleResolveSubmit} className="proc-form">
              <div className="proc-dev-summary-card">
                <div className="proc-dev-sc-top">
                  <span className={`proc-sev-tag ${deviation.severity.toLowerCase()}`}>
                    {deviation.severity} SEVERITY
                  </span>
                  <span className="proc-dev-date">
                    {new Date(deviation.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="proc-dev-title">{deviation.parameter}</h4>
                <div className="proc-dev-vals">
                  <span><strong>Expected:</strong> {deviation.expected}</span>
                  <span><strong>Recorded Actual:</strong> <span className="text-red">{deviation.actual}</span></span>
                </div>
                <p className="proc-dev-reason"><strong>Operator Note:</strong> {deviation.reason}</p>
              </div>

              <div className="proc-form-group">
                <label className="proc-label">Select Authorized Disposition *</label>
                <div className="proc-radio-list">
                  {Object.entries(DEVIATION_DISPOSITIONS).map(([key, label]) => (
                    <label
                      key={key}
                      className={`proc-radio-card ${disposition === key ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="deviationDisposition"
                        value={key}
                        checked={disposition === key}
                        onChange={() => setDisposition(key)}
                      />
                      <div>
                        <strong>{label}</strong>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="proc-form-group">
                <label className="proc-label">
                  <FileText size={14} />
                  <span>Technical Disposition Justification & Review Notes *</span>
                </label>
                <textarea
                  className="proc-textarea"
                  rows={3}
                  required
                  placeholder="Document corrective action, additional settling buffer, or reason for accepting variance..."
                  value={dispositionNotes}
                  onChange={e => setDispositionNotes(e.target.value)}
                />
              </div>

              <div className="proc-modal-actions-single">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || dispositionNotes.trim().length < 5}
                >
                  <CheckCircle2 size={16} />
                  <span>Authorize Disposition</span>
                </button>
              </div>
            </form>
          ) : (
            /* RECORD NEW DEVIATION FORM */
            <form onSubmit={handleRecordSubmit} className="proc-form">
              <div className="proc-dev-notice">
                <AlertTriangle size={18} color="#D97706" />
                <div>
                  <strong>Operating SOP Variance Logging</strong>
                  <p>A deviation does not necessarily mean the honey is damaged; it records that process parameters diverged from SOP limits.</p>
                </div>
              </div>

              <div className="proc-field-row">
                <div className="proc-field-col">
                  <label>Parameter</label>
                  <input
                    type="text"
                    value={parameterName}
                    onChange={e => setParameterName(e.target.value)}
                    placeholder="e.g. Tank Warming Temp"
                    required
                  />
                </div>

                <div className="proc-field-col">
                  <label>Severity Level</label>
                  <select value={severity} onChange={e => setSeverity(e.target.value)}>
                    <option value={DEVIATION_SEVERITIES.LOW}>LOW (Minor duration shift)</option>
                    <option value={DEVIATION_SEVERITIES.MEDIUM}>MEDIUM (SOP tolerance exceeded)</option>
                    <option value={DEVIATION_SEVERITIES.HIGH}>HIGH (Significant variance)</option>
                    <option value={DEVIATION_SEVERITIES.CRITICAL}>CRITICAL (Regulatory threshold breached)</option>
                  </select>
                </div>
              </div>

              <div className="proc-field-row">
                <div className="proc-field-col">
                  <label>Expected Target / SOP Limit</label>
                  <input
                    type="text"
                    value={expectedValue}
                    onChange={e => setExpectedValue(e.target.value)}
                    placeholder="e.g. <= 45.0°C"
                    required
                  />
                </div>

                <div className="proc-field-col">
                  <label>Actual Recorded Value</label>
                  <input
                    type="text"
                    value={actualValue}
                    onChange={e => setActualValue(e.target.value)}
                    placeholder="e.g. 47.8°C"
                    required
                  />
                </div>
              </div>

              <div className="proc-form-group">
                <label className="proc-label">Cause / Observed Reason *</label>
                <textarea
                  className="proc-textarea"
                  rows={3}
                  required
                  placeholder="Describe root cause: thermostat calibration drift, ambient heatwave, power interruption..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>

              <div className="proc-modal-actions-single">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || reason.trim().length < 5}
                >
                  <ShieldAlert size={16} />
                  <span>Log Process Deviation</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .proc-dev-notice {
          display: flex;
          gap: 12px;
          background: #FFFBEB;
          border: 1px solid #FCD34D;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }

        .proc-dev-notice strong {
          font-size: 13.5px;
          color: #92400E;
          display: block;
          margin-bottom: 2px;
        }

        .proc-dev-notice p {
          font-size: 12px;
          color: #B45309;
          line-height: 1.4;
          margin: 0;
        }

        .proc-dev-summary-card {
          background: #FAF6ED;
          border: 1.5px solid #E5DCCB;
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 16px;
        }

        .proc-dev-sc-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .proc-sev-tag {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .proc-sev-tag.critical {
          background: #FEE2E2;
          color: #DC2626;
        }

        .proc-sev-tag.high {
          background: #FFEDD5;
          color: #EA580C;
        }

        .proc-sev-tag.medium {
          background: #FEF3C7;
          color: #D97706;
        }

        .proc-sev-tag.low {
          background: #ECFDF5;
          color: #059669;
        }

        .proc-dev-title {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2E1F14);
          margin-bottom: 6px;
        }

        .proc-dev-vals {
          display: flex;
          gap: 16px;
          font-size: 12.5px;
          color: var(--color-deep-cocoa, #2E1F14);
          margin-bottom: 6px;
        }

        .text-red {
          color: #DC2626;
          font-weight: 700;
        }

        .proc-dev-reason {
          font-size: 12px;
          color: var(--color-warm-gray, #6B5B4E);
          line-height: 1.4;
          margin: 0;
        }

        .proc-radio-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .proc-radio-card {
          border: 1px solid #E5DCCB;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FFF;
          cursor: pointer;
        }

        .proc-radio-card.active {
          border-color: #D97706;
          background: #FFFDF5;
        }
      `}</style>
    </div>
  );
};
