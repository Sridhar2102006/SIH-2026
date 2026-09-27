import React from 'react';
import {
  X,
  Camera,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export const InspectionDetailModal = ({
  isOpen,
  onClose,
  inspectionEvent,
  onOpenWorkstation
}) => {
  if (!isOpen || !inspectionEvent) return null;

  const isScan = inspectionEvent.eventType === 'HEALTH_SCAN_COMPLETED';
  const isAttention =
    (inspectionEvent.summary || '').toLowerCase().includes('possible') ||
    (inspectionEvent.summary || '').toLowerCase().includes('flagged') ||
    (inspectionEvent.title || '').toLowerCase().includes('flagged');

  return (
    <div className="bk-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bk-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bk-modal-header">
          <div className="bk-header-title-wrap">
            <div className={`bk-header-icon-badge ${isScan ? 'scan' : 'routine'}`}>
              {isScan ? (
                <Camera size={20} color="#D99A24" />
              ) : (
                <ClipboardCheck size={20} color="#496B45" />
              )}
            </div>
            <div>
              <h2 className="bk-modal-title">{inspectionEvent.title || 'Inspection Record'}</h2>
              <p className="bk-modal-sub">
                {isScan ? 'AI Optical Comb Analysis' : 'Manual Field Log'} · {inspectionEvent.date}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="bk-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="bk-idm-body">
          {/* Status Capsule */}
          <div className={`bk-idm-status-banner ${isAttention ? 'attention' : 'healthy'}`}>
            <div className="bk-idm-status-left">
              {isAttention ? (
                <AlertTriangle size={18} className="bk-idm-status-icon" />
              ) : (
                <CheckCircle2 size={18} className="bk-idm-status-icon" />
              )}
              <div>
                <strong className="bk-idm-status-heading">
                  {isAttention ? 'Action Required / Under Review' : 'Verified Normal & Stable'}
                </strong>
                <p className="bk-idm-status-text">
                  {isAttention
                    ? 'Discrepancy or potential health flag noted during comb inspection.'
                    : 'Colony comb pattern meets all standard apiary quality parameters.'}
                </p>
              </div>
            </div>
          </div>

          {/* Traceability and Hive Box Meta */}
          <div className="bk-idm-meta-card">
            <div className="bk-idm-meta-item">
              <span className="bk-idm-meta-label">Hive Colony</span>
              <strong className="bk-idm-meta-val">
                {inspectionEvent.hiveCode || 'Hive Box H001'}
              </strong>
            </div>
            {inspectionEvent.traceabilityCode && (
              <div className="bk-idm-meta-item">
                <span className="bk-idm-meta-label">Frame Identity</span>
                <span className="bk-idm-code-badge">
                  <QrCode size={12} />
                  <span>{inspectionEvent.traceabilityCode}</span>
                </span>
              </div>
            )}
            <div className="bk-idm-meta-item">
              <span className="bk-idm-meta-label">Recorded By</span>
              <span className="bk-idm-meta-val">{inspectionEvent.author || 'Sarah Lindqvist'}</span>
            </div>
            <div className="bk-idm-meta-item">
              <span className="bk-idm-meta-label">Timestamp</span>
              <span className="bk-idm-meta-val">
                {inspectionEvent.date} · {inspectionEvent.time || '08:30 AM'}
              </span>
            </div>
          </div>

          {/* Evidence Comb Photo */}
          {inspectionEvent.evidence && (
            <div className="bk-idm-evidence-wrap">
              <div className="bk-idm-evidence-header">
                <span className="bk-idm-section-label">High-Resolution Comb Evidence</span>
                <span className="bk-idm-verified-tag">
                  <ShieldCheck size={12} />
                  <span>Tamper-evident</span>
                </span>
              </div>
              <div className="bk-idm-img-container">
                <img
                  src={inspectionEvent.evidence}
                  alt="Inspection Comb Frame Evidence"
                  className="bk-idm-img"
                />
                <div className="bk-idm-img-overlay">
                  <span>Single explicit frame capture</span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Observations / Summary */}
          <div className="bk-idm-section">
            <span className="bk-idm-section-label">Field Notes & Assessment</span>
            <p className="bk-idm-summary-box">
              {inspectionEvent.summary}
            </p>
          </div>

          {/* AI Optical Breakdown if Scan */}
          {isScan && (
            <div className="bk-idm-ai-breakdown">
              <span className="bk-idm-section-label">AI Diagnostic Screening Model v2.4</span>
              <div className="bk-idm-ai-grid">
                <div className="bk-idm-ai-cell">
                  <span className="bk-ai-lbl">Capping Uniformity</span>
                  <strong className="bk-ai-val">{isAttention ? '74% (Irregular)' : '98% (Dense & Uniform)'}</strong>
                </div>
                <div className="bk-idm-ai-cell">
                  <span className="bk-ai-lbl">Varroa Mite Signs</span>
                  <strong className="bk-ai-val">{isAttention ? 'Low-Medium stress' : '0 detected'}</strong>
                </div>
                <div className="bk-idm-ai-cell">
                  <span className="bk-ai-lbl">Foulbrood Risk</span>
                  <strong className="bk-ai-val" style={{ color: isAttention ? '#D9822B' : '#496B45' }}>
                    {isAttention ? 'Elevated (Inspect comb)' : 'Nominal (< 0.2%)'}
                  </strong>
                </div>
                <div className="bk-idm-ai-cell">
                  <span className="bk-ai-lbl">Model Confidence</span>
                  <strong className="bk-ai-val">
                    {inspectionEvent.metadata?.confidence || (isAttention ? 'Medium (86%)' : 'High (97%)')}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bk-idm-footer">
          {onOpenWorkstation && (
            <button
              type="button"
              className="btn btn-primary bk-idm-action-btn"
              onClick={() => {
                onClose();
                onOpenWorkstation(inspectionEvent);
              }}
            >
              <Camera size={16} />
              <span>Rescan in Workstation</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary bk-idm-close-footer-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        .bk-idm-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .bk-idm-status-banner {
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-idm-status-banner.healthy {
          background: rgba(73, 107, 69, 0.1);
          border: 1px solid rgba(73, 107, 69, 0.25);
          color: #2D4829;
        }
        .bk-idm-status-banner.attention {
          background: rgba(217, 130, 43, 0.12);
          border: 1px solid rgba(217, 130, 43, 0.3);
          color: #8C4E0B;
        }
        .bk-idm-status-left {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .bk-idm-status-heading {
          font-size: 13.5px;
          font-weight: 700;
          display: block;
        }
        .bk-idm-status-text {
          font-size: 12px;
          margin: 2px 0 0;
          opacity: 0.9;
          line-height: 1.35;
        }
        .bk-idm-meta-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          background: #FFFFFF;
          border: 1px solid var(--color-card-border, #E8DFD1);
          border-radius: 12px;
          padding: 12px 14px;
        }
        .bk-idm-meta-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .bk-idm-meta-label {
          font-size: 11px;
          color: var(--color-warm-gray, #786D61);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .bk-idm-meta-val {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-idm-code-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(73, 107, 69, 0.12);
          color: #496B45;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          width: fit-content;
        }
        .bk-idm-evidence-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .bk-idm-evidence-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-idm-section-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-warm-gray, #786D61);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .bk-idm-verified-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #496B45;
          font-weight: 600;
        }
        .bk-idm-img-container {
          position: relative;
          width: 100%;
          height: 180px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--color-card-border, #E8DFD1);
        }
        .bk-idm-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .bk-idm-img-overlay {
          position: absolute;
          bottom: 8px;
          left: 8px;
          background: rgba(0, 0, 0, 0.65);
          color: #FFFFFF;
          font-size: 10.5px;
          padding: 3px 8px;
          border-radius: 6px;
          backdrop-filter: blur(2px);
        }
        .bk-idm-summary-box {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border, #E8DFD1);
          border-radius: 10px;
          padding: 12px;
          font-size: 13px;
          color: var(--color-deep-cocoa, #34261B);
          line-height: 1.5;
          margin: 6px 0 0;
        }
        .bk-idm-ai-breakdown {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .bk-idm-ai-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .bk-idm-ai-cell {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border, #E8DFD1);
          border-radius: 10px;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .bk-ai-lbl {
          font-size: 11px;
          color: var(--color-warm-gray, #786D61);
        }
        .bk-ai-val {
          font-size: 12.5px;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-idm-footer {
          padding: 14px 20px;
          background: #FFFFFF;
          border-top: 1px solid var(--color-divider);
          display: flex;
          gap: 10px;
          border-radius: 0 0 20px 20px;
        }
        .bk-idm-action-btn {
          flex: 1;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13.5px;
        }
        .bk-idm-close-footer-btn {
          height: 44px;
          padding: 0 18px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};
