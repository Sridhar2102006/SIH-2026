import React, { useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Camera,
  Layers,
  ArrowRight,
  CheckCircle2,
  Thermometer,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export const AttentionDetailsModal = ({
  isOpen,
  onClose,
  attentionHives = [],
  attentionFrames = [],
  onInspectHive,
  onInspectFrame,
  onResolveItem
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalCount = attentionHives.length + attentionFrames.length;

  return (
    <div className="bk-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bk-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bk-modal-header">
          <div className="bk-header-title-wrap">
            <div className="bk-header-icon-badge" style={{ background: 'rgba(217, 130, 43, 0.15)' }}>
              <AlertTriangle size={20} color="#D9822B" />
            </div>
            <div>
              <h2 className="bk-modal-title">Colony Attention Required</h2>
              <p className="bk-modal-sub">
                {totalCount} item{totalCount === 1 ? '' : 's'} flagged for apiary review
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

        {/* Content Body */}
        <div className="bk-adm-body">
          {totalCount === 0 ? (
            <div className="bk-adm-empty">
              <CheckCircle2 size={36} color="#496B45" />
              <strong>All Colonies Stable</strong>
              <p>No abnormal telemetry, pest indicators, or flagged frames detected.</p>
            </div>
          ) : (
            <div className="bk-adm-list">
              {/* Flagged Frames */}
              {attentionFrames.map(frame => (
                <div key={frame.id || frame.traceabilityCode} className="bk-adm-card frame-card">
                  <div className="bk-adm-card-head">
                    <div className="bk-adm-card-tag">
                      <Camera size={13} color="#D9822B" />
                      <span>Flagged Comb Frame</span>
                    </div>
                    <span className="bk-adm-badge attention">Brood Review</span>
                  </div>

                  <strong className="bk-adm-title">
                    Frame {frame.traceabilityCode || 'AP1H002F3'}
                  </strong>
                  <span className="bk-adm-sub">
                    Assigned to Hive {frame.hiveCode || 'H002'} · Super Position 3
                  </span>

                  <p className="bk-adm-desc">
                    {frame.healthCondition ||
                      'AI optical scan identified irregular brood capping and potential Varroa stress. Recommended: Open workstation capture.'}
                  </p>

                  <div className="bk-adm-card-footer">
                    <span className="bk-adm-meta">Optical AI Scan #842</span>
                    <button
                      type="button"
                      className="btn btn-primary bk-adm-btn"
                      onClick={() => {
                        onClose();
                        if (onInspectFrame) onInspectFrame(frame);
                      }}
                    >
                      <Camera size={14} />
                      <span>Inspect Frame</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Attention Hives */}
              {attentionHives.map(hive => {
                const cleanCode = hive.code
                  ? hive.code.startsWith('H')
                    ? hive.code
                    : `H${String(hive.code).padStart(3, '0')}`
                  : 'H002';
                return (
                  <div key={hive.id} className="bk-adm-card hive-card">
                    <div className="bk-adm-card-head">
                      <div className="bk-adm-card-tag">
                        <Layers size={13} color="#D9822B" />
                        <span>Colony Box</span>
                      </div>
                      <span className="bk-adm-badge attention">Telemetry Variance</span>
                    </div>

                    <strong className="bk-adm-title">
                      {hive.name} ({cleanCode})
                    </strong>
                    <span className="bk-adm-sub">
                      {hive.location || 'Meadow Apiary Yard 1'} · Queen: {hive.queenStatus || 'Marked 2025'}
                    </span>

                    <p className="bk-adm-desc">
                      {hive.conditionSummary ||
                        hive.statusText ||
                        'Internal temperature reading (31.4°C) differs from yard baseline. Check ventilation and comb density.'}
                    </p>

                    <div className="bk-adm-card-footer">
                      <span className="bk-adm-meta">Last checked {hive.lastInspected || 'Yesterday'}</span>
                      <button
                        type="button"
                        className="btn btn-secondary bk-adm-btn"
                        onClick={() => {
                          onClose();
                          if (onInspectHive) onInspectHive(hive.id);
                        }}
                      >
                        <span>View Hive Details</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bk-adm-footer">
          <button
            type="button"
            className="btn btn-secondary bk-adm-close-btn"
            onClick={onClose}
          >
            Dismiss
          </button>
        </div>
      </div>

      <style>{`
        .bk-adm-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 70vh;
          overflow-y: auto;
        }
        .bk-adm-empty {
          text-align: center;
          padding: 32px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .bk-adm-empty strong {
          font-size: 16px;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-adm-empty p {
          font-size: 13px;
          color: var(--color-warm-gray, #786D61);
          margin: 0;
        }
        .bk-adm-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bk-adm-card {
          background: #FFFFFF;
          border: 1.5px solid rgba(217, 130, 43, 0.3);
          border-radius: 14px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .bk-adm-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        .bk-adm-card-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #D9822B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .bk-adm-badge {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
        }
        .bk-adm-badge.attention {
          background: rgba(217, 130, 43, 0.15);
          color: #8C4E0B;
        }
        .bk-adm-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-adm-sub {
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
        }
        .bk-adm-desc {
          font-size: 12.5px;
          color: var(--color-deep-cocoa, #34261B);
          line-height: 1.45;
          margin: 6px 0;
          background: #FFFDF9;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(217, 130, 43, 0.15);
        }
        .bk-adm-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
          padding-top: 8px;
          border-top: 1px solid var(--color-divider, #E8DFD1);
        }
        .bk-adm-meta {
          font-size: 11px;
          color: var(--color-warm-gray, #786D61);
        }
        .bk-adm-btn {
          height: 36px;
          padding: 0 12px;
          font-size: 12px;
          gap: 6px;
        }
        .bk-adm-footer {
          padding: 12px 20px;
          background: #FFFFFF;
          border-top: 1px solid var(--color-divider, #E8DFD1);
          display: flex;
          justify-content: flex-end;
          border-radius: 0 0 20px 20px;
        }
        .bk-adm-close-btn {
          height: 38px;
          padding: 0 16px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};
