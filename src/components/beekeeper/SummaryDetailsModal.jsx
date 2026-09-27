import React, { useEffect } from 'react';
import {
  X,
  Layers,
  Building2,
  Camera,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Droplet
} from 'lucide-react';

export const SummaryDetailsModal = ({
  isOpen,
  onClose,
  initialCategory = 'overview', // 'apiaries' | 'hives' | 'frames' | 'attention' | 'overview'
  metrics,
  apiaries = [],
  hives = [],
  frames = [],
  onNavigateTab,
  onOpenAttentionModal
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="bk-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bk-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bk-modal-header">
          <div className="bk-header-title-wrap">
            <div className="bk-header-icon-badge" style={{ background: 'rgba(73, 107, 69, 0.14)' }}>
              <Layers size={20} color="#496B45" />
            </div>
            <div>
              <h2 className="bk-modal-title">Apiary Field Status</h2>
              <p className="bk-modal-sub">Colonies, registered frames & active yards</p>
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
        <div className="bk-sdm-body">
          {/* 1. Apiaries Breakdown */}
          <div className="bk-sdm-section">
            <div className="bk-sdm-sec-head">
              <div className="bk-sdm-sec-left">
                <Building2 size={16} color="#496B45" />
                <strong className="bk-sdm-sec-title">Apiary Yards ({apiaries.length})</strong>
              </div>
              <button
                type="button"
                className="bk-sdm-link-btn"
                onClick={() => {
                  onClose();
                  if (onNavigateTab) onNavigateTab('hives');
                }}
              >
                <span>Manage yards</span>
                <ArrowRight size={12} />
              </button>
            </div>
            <div className="bk-sdm-cards-grid">
              {apiaries.map(apiary => (
                <div key={apiary.id} className="bk-sdm-mini-card">
                  <span className="bk-sdm-mc-name">{apiary.name}</span>
                  <span className="bk-sdm-mc-sub">{apiary.location || 'Meadow'} · {apiary.hivesCount || 3} hives</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Hive Colonies Breakdown */}
          <div className="bk-sdm-section">
            <div className="bk-sdm-sec-head">
              <div className="bk-sdm-sec-left">
                <Layers size={16} color="#D99A24" />
                <strong className="bk-sdm-sec-title">Hive Colonies ({hives.length})</strong>
              </div>
              <button
                type="button"
                className="bk-sdm-link-btn"
                onClick={() => {
                  onClose();
                  if (onNavigateTab) onNavigateTab('hives');
                }}
              >
                <span>View all hives</span>
                <ArrowRight size={12} />
              </button>
            </div>
            <div className="bk-sdm-stats-row">
              <div className="bk-sdm-stat-pill">
                <CheckCircle2 size={14} color="#496B45" />
                <span>{hives.filter(h => h.status === 'healthy').length} Healthy</span>
              </div>
              <div className="bk-sdm-stat-pill attention">
                <AlertTriangle size={14} color="#D9822B" />
                <span>{hives.filter(h => h.status === 'attention').length} Flagged</span>
              </div>
            </div>
          </div>

          {/* 3. Registered Comb Frames */}
          <div className="bk-sdm-section">
            <div className="bk-sdm-sec-head">
              <div className="bk-sdm-sec-left">
                <Camera size={16} color="#6B4F35" />
                <strong className="bk-sdm-sec-title">Frames Registered ({frames.length})</strong>
              </div>
              <button
                type="button"
                className="bk-sdm-link-btn"
                onClick={() => {
                  onClose();
                  if (onNavigateTab) onNavigateTab('hives');
                }}
              >
                <span>Open frames</span>
                <ArrowRight size={12} />
              </button>
            </div>
            <p className="bk-sdm-desc">
              All {frames.length} brood and super frames carry unique cryptographically tracked tamper-evident identities.
            </p>
          </div>

          {/* 4. Attention Quick Review Callout */}
          {metrics?.needsAttention > 0 && (
            <div className="bk-sdm-attn-callout">
              <div className="bk-sdm-attn-left">
                <AlertTriangle size={16} color="#D9822B" />
                <div>
                  <strong>{metrics.needsAttention} items need your attention</strong>
                  <p>Telemetry variances or flagged brood comb patterns require field review.</p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary bk-sdm-attn-btn"
                onClick={() => {
                  onClose();
                  if (onOpenAttentionModal) onOpenAttentionModal();
                }}
              >
                Review Items
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bk-sdm-footer">
          <button
            type="button"
            className="btn btn-secondary bk-sdm-close-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        .bk-sdm-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .bk-sdm-section {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border, #E8DFD1);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .bk-sdm-sec-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-sdm-sec-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bk-sdm-sec-title {
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-sdm-link-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 700;
          color: #496B45;
          cursor: pointer;
        }
        .bk-sdm-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .bk-sdm-mini-card {
          background: #FAF7F2;
          border-radius: 8px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .bk-sdm-mc-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-sdm-mc-sub {
          font-size: 11px;
          color: var(--color-warm-gray, #786D61);
        }
        .bk-sdm-stats-row {
          display: flex;
          gap: 8px;
        }
        .bk-sdm-stat-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(73, 107, 69, 0.1);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #496B45;
        }
        .bk-sdm-stat-pill.attention {
          background: rgba(217, 130, 43, 0.12);
          color: #8C4E0B;
        }
        .bk-sdm-desc {
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
          margin: 0;
          line-height: 1.4;
        }
        .bk-sdm-attn-callout {
          background: rgba(217, 130, 43, 0.12);
          border: 1px solid rgba(217, 130, 43, 0.3);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .bk-sdm-attn-left {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .bk-sdm-attn-left strong {
          display: block;
          font-size: 12.5px;
          color: #8C4E0B;
        }
        .bk-sdm-attn-left p {
          font-size: 11px;
          color: #8C4E0B;
          margin: 2px 0 0;
          line-height: 1.3;
          opacity: 0.9;
        }
        .bk-sdm-attn-btn {
          height: 34px;
          padding: 0 12px;
          font-size: 11.5px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .bk-sdm-footer {
          padding: 12px 20px;
          background: #FFFFFF;
          border-top: 1px solid var(--color-divider, #E8DFD1);
          display: flex;
          justify-content: flex-end;
          border-radius: 0 0 20px 20px;
        }
        .bk-sdm-close-btn {
          height: 38px;
          padding: 0 16px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};
