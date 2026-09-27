import React from 'react';
import {
  Activity,
  ChevronRight,
  PlusCircle,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Thermometer,
  Layers,
  ArrowRight
} from 'lucide-react';

export const FieldWorkModule = ({
  hives = [],
  canInspect = false,
  canScan = false,
  canAddHive = false,
  onViewAll,
  onSelectHive,
  onAddHive,
  onScanFrame,
  onInspectHive
}) => {
  const activeHives = hives.filter(h => !h.isArchived);
  const attentionCount = activeHives.filter(h => h.status === 'attention').length;
  const healthyCount = activeHives.filter(h => h.status === 'healthy').length;

  if (activeHives.length === 0) {
    return (
      <div className="hv-section">
        <div className="hv-sec-head">
          <span className="hv-sec-title">Field & Colonies</span>
        </div>
        <div className="hv-empty-box">
          <p className="hv-empty-title">Start your first colony</p>
          <p className="hv-empty-sub">Add a hive to begin recording inspections, frame scans and acoustic observations.</p>
          {canAddHive && (
            <button className="hv-empty-cta" onClick={onAddHive}>
              <PlusCircle size={14} strokeWidth={2} /> Add hive
            </button>
          )}
        </div>
      </div>
    );
  }

  const representative = activeHives[0];
  const latestScan = activeHives.find(h => h.healthTimeline && h.healthTimeline.length > 0)?.healthTimeline?.[0];

  return (
    <div className="hv-section">
      <div className="hv-sec-head">
        <div className="hv-sec-title-wrap">
          <span className="hv-sec-title">Field & Colonies</span>
          <span className="hv-sec-tagline">Colony stewardship & acoustic telemetry</span>
        </div>
        <button className="hv-sec-link" onClick={onViewAll}>
          View all <ChevronRight size={13} />
        </button>
      </div>

      <div className="hv-hive-meta-bar">
        <span>{activeHives.length} colonies monitored</span>
        <span className="hv-meta-dot">·</span>
        {attentionCount > 0 ? (
          <span className="hv-attn-text">{attentionCount} need attention</span>
        ) : (
          <span className="hv-healthy-text">{healthyCount} healthy</span>
        )}
      </div>

      {/* Observation Telemetry Summary */}
      {representative && (
        <div className="hv-obs-panel">
          <div className="hv-obs-panel-head">
            <span className="hv-obs-kicker">{representative.name} Conditions</span>
            <span className="hv-obs-live-badge">
              Latest reading
            </span>
          </div>

          <div className="hv-obs-grid">
            <div className="hv-obs-col">
              <span className="hv-obs-val">{representative.temp || 34.5}°C</span>
              <span className="hv-obs-lbl">Internal Temp</span>
            </div>
            <div className="hv-obs-col">
              <span className="hv-obs-val">{representative.weight || 48.2} kg</span>
              <span className="hv-obs-lbl">Total Weight</span>
            </div>
            <div className="hv-obs-col">
              <span className="hv-obs-val">{representative.acoustics || '210 Hz'}</span>
              <span className="hv-obs-lbl">Acoustics</span>
            </div>
          </div>
        </div>
      )}

      {/* Frame Diagnostic Scan Preview if scan capability exists */}
      {canScan && (
        <div className="hv-scan-strip">
          <div className="hv-scan-strip-left">
            <div className="hv-scan-icon-badge">
              <Camera size={16} color="var(--color-primary-honey)" />
            </div>
            <div>
              <strong className="hv-scan-strip-title">Comb Frame Health Check</strong>
              <p className="hv-scan-strip-sub">
                {latestScan
                  ? `Last checked: ${latestScan.title} (${latestScan.date})`
                  : 'Photograph comb frame to check brood pattern and health'}
              </p>
            </div>
          </div>
          <button className="hv-scan-strip-btn" onClick={() => onScanFrame(representative)}>
            <span>Check frame</span>
            <ArrowRight size={12} strokeWidth={2.2} />
          </button>
        </div>
      )}

      <style>{`
        .hv-sec-title-wrap {
          display: flex;
          flex-direction: column;
        }
        .hv-sec-tagline {
          font-size: 11px;
          color: #786D61;
          font-weight: 500;
          margin-top: 1px;
        }
        .hv-obs-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .hv-obs-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          font-weight: 700;
          color: #4F7A52;
          background: rgba(79, 122, 82, 0.1);
          padding: 2px 7px;
          border-radius: 6px;
        }
        .hv-live-pulse {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #4F7A52;
        }
        .hv-scan-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 10px 12px;
          margin-top: 10px;
          gap: 10px;
        }
        .hv-scan-strip-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .hv-scan-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hv-scan-strip-title {
          font-size: 13px;
          font-weight: 750;
          color: #34261B;
          display: block;
        }
        .hv-scan-strip-sub {
          font-size: 11.5px;
          color: #786D61;
          margin: 1px 0 0;
        }
        .hv-scan-strip-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #D99A24;
          color: #FFF;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 750;
          padding: 6px 10px;
          cursor: pointer;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};
