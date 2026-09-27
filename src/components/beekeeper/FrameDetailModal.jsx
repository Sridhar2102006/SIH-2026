import React from 'react';
import {
  X,
  Layers,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Calendar,
  Camera,
  Droplet,
  Send,
  Eye,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { FRAME_STATUS_LABELS } from '../../services/beekeeperDomainService';

const LIFECYCLE_STAGES = [
  { key: 'REGISTERED', label: 'Registered' },
  { key: 'PLACED_IN_HIVE', label: 'In Hive' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'READY_FOR_HARVEST', label: 'Ripe' },
  { key: 'HARVESTED', label: 'Harvested' },
  { key: 'SUBMITTED_TO_PROCESSOR', label: 'Submitted' }
];

export const FrameDetailModal = ({
  isOpen,
  onClose,
  frameId,
  onInspectFrame,
  onHarvestFrame,
  onSubmitToProcessor,
  onViewJourney
}) => {
  const { frames = [], hives = [], apiaries = [] } = useAppState();

  const frame = frames.find(f => f.id === frameId || f.traceabilityCode === frameId) || frames[0];

  if (!isOpen || !frame) return null;

  const currentStatus = frame.status || 'ACTIVE';
  const hive = hives.find(h => h.id === frame.hiveId || (h.code && `H${h.code.padStart ? h.code.padStart(3, '0') : h.code}` === frame.hiveCode));
  const apiary = apiaries.find(a => a.apiaryCode === frame.apiaryCode) || apiaries[0];

  const getStageIndex = (status) => {
    switch (status) {
      case 'REGISTERED': return 0;
      case 'PLACED_IN_HIVE': return 1;
      case 'ACTIVE':
      case 'UNDER_INSPECTION': return 2;
      case 'READY_FOR_HARVEST': return 3;
      case 'HARVESTED': return 4;
      case 'SUBMITTED_TO_PROCESSOR':
      case 'RECEIVED_BY_PROCESSOR': return 5;
      default: return 2;
    }
  };

  const currentStageIdx = getStageIndex(currentStatus);

  return (
    <div className="bk-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bk-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bk-modal-header">
          <div className="bk-header-title-wrap">
            <div className="bk-header-icon-badge">
              <Layers size={20} color="#D99A24" />
            </div>
            <div>
              <h2 className="bk-modal-title">Frame {frame.frameNumber}</h2>
              <p className="bk-modal-sub">{hive?.name || frame.hiveCode} · {apiary?.name || frame.apiaryCode}</p>
            </div>
          </div>
          <button className="bk-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="bk-frame-detail-body">
          {/* Hero Code Banner */}
          <div className="bk-fd-hero">
            <div className="bk-fd-hero-head">
              <span className="bk-fd-hero-lbl">Immutable Traceability Code</span>
              <QrCode size={18} color="#FFF9EF" />
            </div>
            <strong className="bk-fd-hero-code">{frame.traceabilityCode}</strong>
            <p className="bk-fd-hero-sub">
              {frame.apiaryCode} (Apiary) → {frame.hiveCode} (Hive Box) → {frame.frameNumber} (Frame)
            </p>
          </div>

          {/* Lifecycle State Progress */}
          <div className="bk-fd-lifecycle">
            <div className="bk-fd-sec-title">Lifecycle State Progression</div>
            <div className="bk-lifecycle-steps">
              {LIFECYCLE_STAGES.map((stg, idx) => {
                const isPassed = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div key={stg.key} className={`bk-lstep ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="bk-lstep-dot">
                      {isPassed ? <CheckCircle2 size={12} color="#FFFFFF" /> : <span>{idx + 1}</span>}
                    </div>
                    <span className="bk-lstep-label">{stg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bk-fd-grid">
            <div className="bk-fd-stat-card">
              <span className="bk-fd-stat-k">Status</span>
              <strong className="bk-fd-stat-v">{FRAME_STATUS_LABELS[frame.status] || frame.status}</strong>
            </div>
            <div className="bk-fd-stat-card">
              <span className="bk-fd-stat-k">Floral Flow</span>
              <strong className="bk-fd-stat-v">{frame.honeyType || 'Wildflower'}</strong>
            </div>
            <div className="bk-fd-stat-card">
              <span className="bk-fd-stat-k">Capping</span>
              <strong className="bk-fd-stat-v">{frame.cappedPercentage || 80}% capped</strong>
            </div>
            <div className="bk-fd-stat-card">
              <span className="bk-fd-stat-k">Last Inspected</span>
              <strong className="bk-fd-stat-v">{frame.lastInspectedAt || 'Recent'}</strong>
            </div>
          </div>

          {/* Contextual Primary Action based on Lifecycle */}
          <div className="bk-fd-actions-section">
            {currentStatus === 'ACTIVE' || currentStatus === 'UNDER_INSPECTION' ? (
              <div className="bk-fd-action-buttons">
                <button
                  type="button"
                  className="btn btn-primary btn-block bk-btn-lg"
                  onClick={() => {
                    onClose();
                    onInspectFrame?.(frame);
                  }}
                >
                  <Camera size={18} />
                  <span>Inspect Frame with AI Health Scan</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={() => {
                    onClose();
                    onHarvestFrame?.(frame);
                  }}
                >
                  <Droplet size={18} color="#D99A24" />
                  <span>Record Harvest for this Frame</span>
                </button>
              </div>
            ) : currentStatus === 'READY_FOR_HARVEST' ? (
              <div className="bk-fd-action-buttons">
                <button
                  type="button"
                  className="btn btn-primary btn-block bk-btn-lg"
                  onClick={() => {
                    onClose();
                    onHarvestFrame?.(frame);
                  }}
                >
                  <Droplet size={18} />
                  <span>Harvest Frame ({frame.traceabilityCode})</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={() => {
                    onClose();
                    onInspectFrame?.(frame);
                  }}
                >
                  <Camera size={18} />
                  <span>Scan Frame Health</span>
                </button>
              </div>
            ) : currentStatus === 'HARVESTED' ? (
              <div className="bk-fd-action-buttons">
                <button
                  type="button"
                  className="btn btn-primary btn-block bk-btn-lg"
                  onClick={() => {
                    onClose();
                    onSubmitToProcessor?.(frame);
                  }}
                >
                  <Send size={18} />
                  <span>Submit to Processor for Extraction</span>
                </button>
              </div>
            ) : (
              <div className="bk-fd-action-buttons">
                <button
                  type="button"
                  className="btn btn-primary btn-block bk-btn-lg"
                  onClick={() => {
                    onClose();
                    onViewJourney?.(frame);
                  }}
                >
                  <Eye size={18} />
                  <span>Track Downstream Honey Journey</span>
                </button>
              </div>
            )}
          </div>

          {/* History Event Log for Frame */}
          <div className="bk-fd-history-sec">
            <span className="bk-fd-sec-title">Frame Event Log</span>
            <div className="bk-fd-history-list">
              {(frame.history || []).map((h, i) => (
                <div key={i} className="bk-fd-hist-item">
                  <div className="bk-fd-hist-dot" />
                  <div className="bk-fd-hist-content">
                    <div className="bk-fd-hist-top">
                      <strong className="bk-fd-hist-evt">{h.event.replace(/_/g, ' ')}</strong>
                      <span className="bk-fd-hist-time">{h.timestamp}</span>
                    </div>
                    <p className="bk-fd-hist-det">{h.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bk-frame-detail-body {
          padding: 16px 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .bk-fd-hero {
          background: linear-gradient(135deg, #496B45 0%, #355232 100%);
          color: #FFFFFF;
          padding: 18px;
          border-radius: 14px;
        }
        .bk-fd-hero-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .bk-fd-hero-lbl {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          opacity: 0.85;
        }
        .bk-fd-hero-code {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 1px;
          display: block;
          margin-bottom: 4px;
        }
        .bk-fd-hero-sub {
          font-size: 12.5px;
          color: #E2ECD8;
          margin: 0;
        }
        .bk-fd-sec-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          display: block;
          margin-bottom: 10px;
        }
        .bk-lifecycle-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
          padding: 12px 10px;
        }
        .bk-lstep {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex: 1;
        }
        .bk-lstep-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #EDE2D1;
          color: #786D61;
          font-size: 10.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bk-lstep.passed .bk-lstep-dot {
          background: #496B45;
          color: #FFFFFF;
        }
        .bk-lstep.current .bk-lstep-dot {
          background: #D99A24;
          color: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(217, 154, 36, 0.25);
        }
        .bk-lstep-label {
          font-size: 9.5px;
          font-weight: 600;
          color: #786D61;
        }
        .bk-lstep.current .bk-lstep-label {
          color: #34261B;
          font-weight: 700;
        }
        .bk-fd-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .bk-fd-stat-card {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .bk-fd-stat-k {
          font-size: 11.5px;
          color: var(--color-warm-gray);
        }
        .bk-fd-stat-v {
          font-size: 14px;
          color: var(--color-deep-cocoa);
          font-weight: 700;
        }
        .bk-fd-action-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bk-btn-lg {
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14.5px;
        }
        .bk-fd-history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          padding-left: 14px;
        }
        .bk-fd-history-list::before {
          content: '';
          position: absolute;
          top: 6px; bottom: 6px; left: 3px;
          width: 2px;
          background: #EDE2D1;
        }
        .bk-fd-hist-item {
          position: relative;
        }
        .bk-fd-hist-dot {
          position: absolute;
          left: -14px;
          top: 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #71845B;
        }
        .bk-fd-hist-top {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          margin-bottom: 2px;
        }
        .bk-fd-hist-evt {
          color: var(--color-deep-cocoa);
          font-size: 13px;
        }
        .bk-fd-hist-time {
          color: var(--color-warm-gray);
          font-size: 11.5px;
        }
        .bk-fd-hist-det {
          font-size: 12px;
          color: var(--color-warm-gray);
          margin: 0;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};
