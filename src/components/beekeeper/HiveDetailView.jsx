import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ClipboardCheck,
  Camera,
  MessageSquarePlus,
  Droplet,
  Thermometer,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  QrCode,
  Plus,
  ChevronRight,
  ShieldCheck,
  WifiOff,
  Sliders,
  MoreVertical
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { FRAME_STATUS_LABELS } from '../../services/beekeeperDomainService';
import { RegisterFrameModal } from './RegisterFrameModal';
import { FrameDetailModal } from './FrameDetailModal';
import { FrameInspectionWorkstation } from './FrameInspectionWorkstation';
import { HarvestModal } from './HarvestModal';
import { SubmitToProcessorModal } from './SubmitToProcessorModal';
import { RecordObservationModal } from '../hives/RecordObservationModal';

export const HiveDetailView = ({ hiveId, onBack }) => {
  const {
    hives = [],
    apiaries = [],
    frames = [],
    hiveHistoryEvents = [],
    activities = [],
    openSheet,
    showToast
  } = useAppState();

  const hive = useMemo(() => {
    return hives.find(h => h.id === hiveId || h.code === hiveId) || hives[0];
  }, [hives, hiveId]);

  const cleanHiveCode = useMemo(() => {
    if (!hive?.code) return 'H001';
    return hive.code.startsWith('H') ? hive.code : `H${String(hive.code).padStart(3, '0')}`;
  }, [hive]);

  const apiary = useMemo(() => {
    return apiaries.find(a => (hive?.location || '').includes(a.name) || a.apiaryCode === 'AP1') || apiaries[0];
  }, [apiaries, hive]);

  // Frames belonging to this hive
  const hiveFrames = useMemo(() => {
    return frames.filter(f => f.hiveId === hive?.id || f.hiveCode === cleanHiveCode);
  }, [frames, hive, cleanHiveCode]);

  // History events for this hive
  const historyEvents = useMemo(() => {
    return hiveHistoryEvents.filter(e => e.hiveCode === cleanHiveCode || e.hiveCode === hive?.code);
  }, [hiveHistoryEvents, cleanHiveCode, hive]);

  // Modals state
  const [isRegisterFrameOpen, setIsRegisterFrameOpen] = useState(false);
  const [selectedFrameForDetail, setSelectedFrameForDetail] = useState(null);
  const [inspectTargetFrame, setInspectTargetFrame] = useState(null);
  const [harvestTargetFrame, setHarvestTargetFrame] = useState(null);
  const [handoverTargetFrame, setHandoverTargetFrame] = useState(null);
  const [isRecordObsOpen, setIsRecordObsOpen] = useState(false);

  if (!hive) return null;

  const isHealthy = hive.status === 'healthy';
  const isAttention = hive.status === 'attention';

  const handleFrameClick = (frame) => {
    setSelectedFrameForDetail(frame);
  };

  return (
    <div className="bk-hd-viewport">
      {/* 1. Header (← All hives | HIVE H001 | Subtitle) */}
      <header className="bk-hd-header">
        <button type="button" className="bk-hd-back" onClick={onBack} aria-label="Back to hives">
          <ArrowLeft size={18} />
          <span>All hives</span>
        </button>

        <div className="bk-hd-title-wrap">
          <div className="bk-hd-code-pill">{cleanHiveCode}</div>
          <div>
            <h1 className="bk-hd-name">{hive.name}</h1>
            <p className="bk-hd-apiary-sub">
              {apiary.apiaryCode} — {apiary.name} · {hive.breed || 'Italian Apis mellifera'}
            </p>
          </div>
        </div>
      </header>

      <div className="bk-hd-body">
        {/* Health Status Banner */}
        <section className={`bk-hd-status-banner ${isAttention ? 'attention' : 'healthy'}`}>
          <div className="bk-hd-sb-left">
            <span className={`bk-hd-sb-dot ${isAttention ? 'attention' : 'healthy'}`} />
            <div>
              <strong className="bk-hd-sb-title">
                {isHealthy ? 'Healthy Colony' : 'Needs Attention'}
              </strong>
              <p className="bk-hd-sb-desc">
                {hive.statusText || hive.conditionSummary || 'Conditions look stable.'}
              </p>
            </div>
          </div>
          <span className="bk-hd-sb-meta">Last checked: {hive.lastInspected || 'Today'}</span>
        </section>

        {/* Primary Action Buttons (Section 18: [Inspect hive] [Inspect frame] [Record observation] [Harvest]) */}
        <section className="bk-hd-actions-grid">
          <button
            type="button"
            className="bk-hd-btn primary"
            onClick={() => openSheet('hive-inspect', { hiveId: hive.id })}
          >
            <ClipboardCheck size={18} strokeWidth={2.2} />
            <span>Inspect Hive</span>
          </button>

          <button
            type="button"
            className="bk-hd-btn honey"
            onClick={() => setInspectTargetFrame(hiveFrames[0] || null)}
          >
            <Camera size={18} strokeWidth={2.2} />
            <span>Inspect Frame</span>
          </button>

          <button
            type="button"
            className="bk-hd-btn secondary"
            onClick={() => setIsRecordObsOpen(true)}
          >
            <MessageSquarePlus size={18} strokeWidth={2.2} />
            <span>Record Observation</span>
          </button>

          <button
            type="button"
            className="bk-hd-btn forest"
            onClick={() => setHarvestTargetFrame(hiveFrames.find(f => f.status === 'READY_FOR_HARVEST') || hiveFrames[0] || null)}
          >
            <Droplet size={18} strokeWidth={2.2} />
            <span>Harvest</span>
          </button>
        </section>

        {/* Frames Section (Section 6 & 18: Frames List F1, F2, F3...) */}
        <section className="bk-hd-section">
          <div className="bk-hd-sec-header">
            <div>
              <h2 className="bk-hd-sec-title">Hive Frames ({hiveFrames.length})</h2>
              <p className="bk-hd-sec-sub">First-class traceability units in {cleanHiveCode}</p>
            </div>
            <button
              type="button"
              className="bk-hd-add-frame-btn"
              onClick={() => setIsRegisterFrameOpen(true)}
            >
              <Plus size={15} />
              <span>Register Frame</span>
            </button>
          </div>

          {hiveFrames.length === 0 ? (
            <div className="bk-empty-frames-card">
              <Layers size={28} color="#D99A24" />
              <strong>No frames registered yet</strong>
              <p>Register your first frame in this hive box to start tracking its journey.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsRegisterFrameOpen(true)}
              >
                Register Frame
              </button>
            </div>
          ) : (
            <div className="bk-hd-frame-list">
              {hiveFrames.map(frame => {
                const isFrameAttention = frame.status === 'UNDER_INSPECTION' || frame.isConcerning;
                const isReadyHarvest = frame.status === 'READY_FOR_HARVEST';
                const isHarvested = frame.status === 'HARVESTED';
                const isSubmitted = frame.status === 'SUBMITTED_TO_PROCESSOR';

                return (
                  <div
                    key={frame.id}
                    className="bk-hd-frame-card"
                    onClick={() => handleFrameClick(frame)}
                  >
                    <div className="bk-hd-fc-left">
                      <span className="bk-hd-fc-num">{frame.frameNumber}</span>
                      <div className="bk-hd-fc-info">
                        <div className="bk-hd-fc-code-row">
                          <strong className="bk-hd-fc-code">{frame.traceabilityCode}</strong>
                          <span className={`bk-hd-fc-badge ${isFrameAttention ? 'attention' : isReadyHarvest ? 'ripe' : isHarvested ? 'harvested' : isSubmitted ? 'submitted' : 'active'}`}>
                            {FRAME_STATUS_LABELS[frame.status] || frame.status}
                          </span>
                        </div>
                        <span className="bk-hd-fc-detail">
                          {frame.honeyType || 'Wildflower'} · {frame.cappedPercentage || 85}% capped
                        </span>
                      </div>
                    </div>

                    <div className="bk-hd-fc-right">
                      <span className="bk-hd-fc-check">{frame.lastInspectedAt || 'Recent'}</span>
                      <ChevronRight size={16} color="#8C7E70" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Latest Conditions Section (Section 17 & 18: Temperature, Humidity, Vibration) */}
        <section className="bk-hd-section">
          <div className="bk-hd-sec-header">
            <div>
              <h2 className="bk-hd-sec-title">Latest Conditions</h2>
              <p className="bk-hd-sec-sub">
                {hive.monitoring?.enabled ? 'ESP32 continuous hive telemetry' : 'Manual inspection logs'}
              </p>
            </div>
            {hive.esp32 && (
              <span className="bk-hd-telemetry-badge">
                <span className="bk-live-pulse" />
                <span>{hive.esp32.deviceId}</span>
              </span>
            )}
          </div>

          <div className="bk-hd-conditions-grid">
            <div className="bk-hd-cond-card">
              <div className="bk-hd-cond-head">
                <Thermometer size={16} color="#B87316" />
                <span className="bk-hd-cond-k">Temperature</span>
              </div>
              <strong className="bk-hd-cond-v">
                {hive.temp ? `${hive.temp}°C` : '29.1°C'}
              </strong>
              <span className="bk-hd-cond-sub">Optimal brood nest range (28–34°C)</span>
            </div>

            <div className="bk-hd-cond-card">
              <div className="bk-hd-cond-head">
                <Activity size={16} color="#496B45" />
                <span className="bk-hd-cond-k">Humidity</span>
              </div>
              <strong className="bk-hd-cond-v">
                {hive.humidity ? `${hive.humidity}%` : '56%'}
              </strong>
              <span className="bk-hd-cond-sub">Normal colony humidity</span>
            </div>

            <div className="bk-hd-cond-card full">
              <div className="bk-hd-cond-head">
                <Activity size={16} color="#D99A24" />
                <span className="bk-hd-cond-k">Colony Activity & Vibration</span>
              </div>
              <strong className="bk-hd-cond-v-sm">
                {hive.vibrationText || 'Activity appears stable'}
              </strong>
              <span className="bk-hd-cond-sub">
                Acoustic Frequency: {hive.acousticFreq ? `${hive.acousticFreq} Hz` : '182 Hz (Calm worker tone)'}
              </span>
            </div>
          </div>
        </section>

        {/* Hive History / Field Notebook (Section 30 & 31: Chronological field log) */}
        <section className="bk-hd-section">
          <div className="bk-hd-sec-header">
            <div>
              <h2 className="bk-hd-sec-title">Hive Field Notebook</h2>
              <p className="bk-hd-sec-sub">Chronological event log for {cleanHiveCode}</p>
            </div>
          </div>

          <div className="bk-hd-history-log">
            {historyEvents.map((evt, idx) => (
              <div key={evt.id || idx} className="bk-hd-history-item">
                <div className="bk-hd-hist-date-col">
                  <span className="bk-hd-hist-date">{evt.date}</span>
                  <span className="bk-hd-hist-time">{evt.time}</span>
                </div>
                <div className="bk-hd-hist-line" />
                <div className="bk-hd-hist-body">
                  <div className="bk-hd-hist-top">
                    <strong className="bk-hd-hist-title">{evt.title}</strong>
                    {evt.traceabilityCode && (
                      <span className="bk-hd-hist-trace">{evt.traceabilityCode}</span>
                    )}
                  </div>
                  <p className="bk-hd-hist-summary">{evt.summary}</p>
                  <span className="bk-hd-hist-author">Logged by {evt.author}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Reusable Modals & Workstations */}
      <RegisterFrameModal
        isOpen={isRegisterFrameOpen}
        onClose={() => setIsRegisterFrameOpen(false)}
        initialHiveId={hive.id}
      />

      <FrameDetailModal
        isOpen={Boolean(selectedFrameForDetail)}
        onClose={() => setSelectedFrameForDetail(null)}
        frameId={selectedFrameForDetail?.id}
        onInspectFrame={(f) => setInspectTargetFrame(f)}
        onHarvestFrame={(f) => setHarvestTargetFrame(f)}
        onSubmitToProcessor={(f) => setHandoverTargetFrame(f)}
      />

      <FrameInspectionWorkstation
        isOpen={Boolean(inspectTargetFrame)}
        onClose={() => setInspectTargetFrame(null)}
        initialFrame={inspectTargetFrame}
        onSaveInspection={(res) => {
          showToast(`Inspection saved for ${res.traceabilityCode}`);
          setInspectTargetFrame(null);
        }}
      />

      <HarvestModal
        isOpen={Boolean(harvestTargetFrame)}
        onClose={() => setHarvestTargetFrame(null)}
        initialFrameId={harvestTargetFrame?.id}
        onHarvestSuccess={(h) => {
          setHarvestTargetFrame(null);
        }}
      />

      <SubmitToProcessorModal
        isOpen={Boolean(handoverTargetFrame)}
        onClose={() => setHandoverTargetFrame(null)}
        initialFrameId={handoverTargetFrame?.id}
        onSubmitSuccess={(h) => {
          setHandoverTargetFrame(null);
        }}
      />

      <RecordObservationModal
        isOpen={isRecordObsOpen}
        onClose={() => setIsRecordObsOpen(false)}
        hiveId={hive.id}
      />

      <style>{`
        .bk-hd-viewport {
          padding-bottom: 90px;
        }
        .bk-hd-header {
          padding: 18px 20px 14px;
          background: #FFFFFF;
          border-bottom: 1px solid var(--color-divider);
        }
        .bk-hd-back {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-warm-gray);
          cursor: pointer;
          padding: 0 0 10px;
        }
        .bk-hd-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bk-hd-code-pill {
          background: #496B45;
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 800;
          padding: 6px 10px;
          border-radius: 8px;
          letter-spacing: 0.5px;
        }
        .bk-hd-name {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-deep-cocoa);
          margin: 0;
        }
        .bk-hd-apiary-sub {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          margin: 2px 0 0;
        }
        .bk-hd-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .bk-hd-status-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-radius: 12px;
        }
        .bk-hd-status-banner.healthy {
          background: rgba(73, 107, 69, 0.12);
          border: 1px solid rgba(73, 107, 69, 0.3);
        }
        .bk-hd-status-banner.attention {
          background: rgba(217, 130, 43, 0.12);
          border: 1px solid rgba(217, 130, 43, 0.3);
        }
        .bk-hd-sb-left {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .bk-hd-sb-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 4px;
        }
        .bk-hd-sb-dot.healthy { background: #496B45; }
        .bk-hd-sb-dot.attention { background: #D9822B; }
        .bk-hd-sb-title {
          font-size: 14px;
          color: var(--color-deep-cocoa);
          display: block;
        }
        .bk-hd-sb-desc {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          margin: 1px 0 0;
        }
        .bk-hd-sb-meta {
          font-size: 11.5px;
          color: #786D61;
          white-space: nowrap;
        }
        .bk-hd-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .bk-hd-btn {
          height: 52px;
          border-radius: 10px;
          border: none;
          font-size: 13.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          padding: 0 10px;
        }
        .bk-hd-btn.primary {
          background: #496B45;
          color: #FFFFFF;
        }
        .bk-hd-btn.honey {
          background: #D99A24;
          color: #FFFFFF;
        }
        .bk-hd-btn.secondary {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border);
          color: var(--color-deep-cocoa);
        }
        .bk-hd-btn.forest {
          background: #6B4F35;
          color: #FFFFFF;
        }
        .bk-hd-sec-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .bk-hd-sec-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--color-deep-cocoa);
          margin: 0;
        }
        .bk-hd-sec-sub {
          font-size: 12px;
          color: var(--color-warm-gray);
          margin: 2px 0 0;
        }
        .bk-hd-add-frame-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
          color: #496B45;
          cursor: pointer;
        }
        .bk-empty-frames-card {
          background: #FFFFFF;
          border: 1.5px dashed var(--color-card-border);
          border-radius: 12px;
          padding: 24px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .bk-empty-frames-card p {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          margin: 0 0 8px;
        }
        .bk-hd-frame-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .bk-hd-frame-card {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }
        .bk-hd-frame-card:hover {
          border-color: #D99A24;
        }
        .bk-hd-fc-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bk-hd-fc-num {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #F4EAD8;
          color: #34261B;
          font-weight: 800;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bk-hd-fc-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .bk-hd-fc-code-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bk-hd-fc-code {
          font-size: 13.5px;
          color: #496B45;
          letter-spacing: 0.3px;
        }
        .bk-hd-fc-badge {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .bk-hd-fc-badge.active { background: rgba(73, 107, 69, 0.12); color: #496B45; }
        .bk-hd-fc-badge.ripe { background: rgba(217, 154, 36, 0.15); color: #B87316; }
        .bk-hd-fc-badge.attention { background: rgba(217, 130, 43, 0.15); color: #D9822B; }
        .bk-hd-fc-badge.harvested { background: #EDE2D1; color: #6B4F35; }
        .bk-hd-fc-badge.submitted { background: rgba(73, 107, 69, 0.2); color: #2D482A; }
        .bk-hd-fc-detail {
          font-size: 12px;
          color: var(--color-warm-gray);
        }
        .bk-hd-fc-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bk-hd-fc-check {
          font-size: 11.5px;
          color: #8C7E70;
        }
        .bk-hd-conditions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .bk-hd-cond-card {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .bk-hd-cond-card.full {
          grid-column: span 2;
        }
        .bk-hd-cond-head {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .bk-hd-cond-k {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-warm-gray);
        }
        .bk-hd-cond-v {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-deep-cocoa);
        }
        .bk-hd-cond-v-sm {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
        }
        .bk-hd-cond-sub {
          font-size: 11px;
          color: #8C7E70;
        }
        .bk-live-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #496B45;
          animation: bkPulse 1.5s infinite;
        }
        @keyframes bkPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        .bk-hd-telemetry-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #496B45;
          background: rgba(73, 107, 69, 0.1);
          padding: 3px 8px;
          border-radius: 6px;
        }
        .bk-hd-history-log {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
        }
        .bk-hd-history-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 10px;
          padding: 12px 14px;
        }
        .bk-hd-hist-date-col {
          display: flex;
          flex-direction: column;
          min-width: 65px;
        }
        .bk-hd-hist-date {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
        }
        .bk-hd-hist-time {
          font-size: 10.5px;
          color: #8C7E70;
        }
        .bk-hd-hist-line {
          width: 2px;
          background: #EDE2D1;
          align-self: stretch;
        }
        .bk-hd-hist-body {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
        }
        .bk-hd-hist-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .bk-hd-hist-title {
          font-size: 13.5px;
          color: var(--color-deep-cocoa);
        }
        .bk-hd-hist-trace {
          font-size: 11px;
          font-weight: 700;
          color: #496B45;
          background: rgba(73, 107, 69, 0.1);
          padding: 1px 5px;
          border-radius: 4px;
        }
        .bk-hd-hist-summary {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          margin: 0;
          line-height: 1.4;
        }
        .bk-hd-hist-author {
          font-size: 11px;
          color: #8C7E70;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
};
