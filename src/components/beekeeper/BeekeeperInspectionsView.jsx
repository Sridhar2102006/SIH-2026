import React, { useState } from 'react';
import {
  ClipboardCheck,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  QrCode,
  ShieldCheck,
  ChevronRight,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { FrameInspectionWorkstation } from './FrameInspectionWorkstation';
import { HiveInspectionModal } from '../hives/HiveInspectionModal';
import { InspectionDetailModal } from './InspectionDetailModal';

export const BeekeeperInspectionsView = () => {
  const {
    frames = [],
    hives = [],
    hiveHistoryEvents = [],
    showToast
  } = useAppState();

  const [isWorkstationOpen, setIsWorkstationOpen] = useState(false);
  const [isHiveInspectOpen, setIsHiveInspectOpen] = useState(false);
  const [selectedInspectionEvent, setSelectedInspectionEvent] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'scans' | 'routine'

  // Filter inspection events from hiveHistoryEvents
  const inspectionEvents = hiveHistoryEvents.filter(e =>
    e.eventType === 'HEALTH_SCAN_COMPLETED' ||
    e.eventType === 'INSPECTION_PERFORMED' ||
    e.eventType === 'OBSERVATION_RECORDED' ||
    e.eventType === 'MONITORING_ALERT'
  );

  const filteredEvents = inspectionEvents.filter(e => {
    if (filterType === 'scans') return e.eventType === 'HEALTH_SCAN_COMPLETED';
    if (filterType === 'routine') return e.eventType !== 'HEALTH_SCAN_COMPLETED';
    return true;
  });

  return (
    <div className="bk-inspections-viewport">
      {/* Header */}
      <header className="bk-insp-header">
        <div className="bk-insp-title-row">
          <div className="bk-insp-icon">
            <ClipboardCheck size={22} color="#D99A24" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="bk-insp-title">Field Inspections</h1>
            <p className="bk-insp-sub">Colony frame evaluations & AI optical health scans</p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="bk-insp-actions-row">
          <button
            type="button"
            className="btn btn-primary bk-insp-btn"
            onClick={() => setIsWorkstationOpen(true)}
          >
            <Camera size={18} />
            <span>Bee Health Scan (Workstation)</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary bk-insp-btn"
            onClick={() => setIsHiveInspectOpen(true)}
          >
            <ClipboardCheck size={18} />
            <span>Inspect Hive Colony</span>
          </button>
        </div>
      </header>

      <div className="bk-insp-body">
        {/* Optical Workstation Callout (Section 12 & 13) */}
        <div className="bk-ws-callout-card">
          <div className="bk-ws-cc-head">
            <span className="bk-ws-tag">Inspection Workstation</span>
            <span className="bk-ws-ai-pill">Field Screening Aid</span>
          </div>
          <strong className="bk-ws-cc-title">Frame Brood Comb Health Scan</strong>
          <p className="bk-ws-cc-desc">
            Place frame on the field workstation for a single explicit capture. Screen for American foulbrood visual indicators, Varroa mite stress, or healthy brood capping patterns.
          </p>
          <div className="bk-ws-cc-footer">
            <span className="bk-ws-cc-meta">Single explicit capture · No continuous camera loop</span>
            <button
              type="button"
              className="bk-ws-launch-link"
              onClick={() => setIsWorkstationOpen(true)}
            >
              Open workstation →
            </button>
          </div>
        </div>

        {/* Inspection History (Section 16: Inspection History) */}
        <section className="bk-insp-history-sec">
          <div className="bk-sec-head">
            <div>
              <h2 className="bk-sec-title">Field Inspection Log</h2>
              <span className="bk-sec-sub">Chronological inspection records with linked evidence</span>
            </div>

            <div className="bk-filter-pills small">
              {['all', 'scans', 'routine'].map(f => (
                <button
                  key={f}
                  type="button"
                  className={`bk-filter-pill ${filterType === f ? 'active' : ''}`}
                  onClick={() => setFilterType(f)}
                >
                  {f === 'all' ? 'All' : f === 'scans' ? 'AI Scans' : 'Routine'}
                </button>
              ))}
            </div>
          </div>

          <div className="bk-insp-event-list">
            {filteredEvents.map(evt => {
              const isScan = evt.eventType === 'HEALTH_SCAN_COMPLETED';
              const isIssue = (evt.summary || '').toLowerCase().includes('possible') || (evt.summary || '').toLowerCase().includes('flagged');

              return (
                <div
                  key={evt.id}
                  className="bk-insp-event-card"
                  onClick={() => setSelectedInspectionEvent(evt)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelectedInspectionEvent(evt)}
                  title="Click to view full inspection record"
                >
                  <div className="bk-iec-left">
                    <div className={`bk-iec-icon-badge ${isScan ? (isIssue ? 'attention' : 'healthy') : 'routine'}`}>
                      {isScan ? (
                        <Camera size={16} />
                      ) : (
                        <ClipboardCheck size={16} />
                      )}
                    </div>
                    <div className="bk-iec-details">
                      <div className="bk-iec-head">
                        <strong className="bk-iec-title">{evt.title}</strong>
                        <span className="bk-iec-date">{evt.date} · {evt.time}</span>
                      </div>
                      <p className="bk-iec-summary">{evt.summary}</p>
                      <div className="bk-iec-meta-row">
                        {evt.traceabilityCode && (
                          <span className="bk-iec-trace">{evt.traceabilityCode}</span>
                        )}
                        <span className="bk-iec-author">By {evt.author}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bk-iec-right">
                    {evt.evidence && (
                      <div className="bk-iec-thumb-wrap">
                        <img src={evt.evidence} alt="Inspection evidence" className="bk-iec-thumb" />
                      </div>
                    )}
                    <ChevronRight size={16} className="bk-iec-arrow" color="#A89F91" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Workstation and Modals */}
      <FrameInspectionWorkstation
        isOpen={isWorkstationOpen}
        onClose={() => setIsWorkstationOpen(false)}
      />

      <HiveInspectionModal
        isOpen={isHiveInspectOpen}
        onClose={() => setIsHiveInspectOpen(false)}
        initialHiveId={hives[0]?.id}
      />

      <InspectionDetailModal
        isOpen={Boolean(selectedInspectionEvent)}
        inspectionEvent={selectedInspectionEvent}
        onClose={() => setSelectedInspectionEvent(null)}
        onOpenWorkstation={() => setIsWorkstationOpen(true)}
      />

      <style>{`
        .bk-inspections-viewport {
          padding-bottom: 90px;
        }
        .bk-insp-header {
          padding: 20px 20px 14px;
          background: #FFFFFF;
          border-bottom: 1px solid var(--color-divider);
        }
        .bk-insp-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .bk-insp-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bk-insp-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-deep-cocoa);
          margin: 0;
        }
        .bk-insp-sub {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          margin: 2px 0 0;
        }
        .bk-insp-actions-row {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 10px;
        }
        .bk-insp-btn {
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
        }
        .bk-insp-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .bk-ws-callout-card {
          background: linear-gradient(135deg, #496B45 0%, #355232 100%);
          color: #FFFFFF;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .bk-ws-cc-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .bk-ws-tag {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #E2ECD8;
        }
        .bk-ws-ai-pill {
          background: rgba(217, 154, 36, 0.3);
          color: #FFF9EF;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .bk-ws-cc-title {
          font-size: 16px;
          font-weight: 700;
        }
        .bk-ws-cc-desc {
          font-size: 12.5px;
          color: #E2ECD8;
          margin: 0;
          line-height: 1.45;
        }
        .bk-ws-cc-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }
        .bk-ws-cc-meta {
          font-size: 11px;
          color: #C3D6B5;
        }
        .bk-ws-launch-link {
          background: #D99A24;
          color: #FFFFFF;
          border: none;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
        }
        .bk-filter-pills {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .bk-filter-pill {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border, #E8DFD1);
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-warm-gray, #786D61);
          cursor: pointer;
          transition: all 0.15s ease;
          line-height: 1.2;
        }
        .bk-filter-pill:hover {
          border-color: #496B45;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-filter-pill.active {
          background: #496B45;
          color: #FFFFFF;
          border-color: #496B45;
          box-shadow: 0 2px 6px rgba(73, 107, 69, 0.25);
        }
        .bk-filter-pills.small .bk-filter-pill {
          padding: 4px 10px;
          font-size: 11px;
        }
        .bk-insp-event-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
        }
        .bk-insp-event-card {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border, #E8DFD1);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          user-select: none;
        }
        .bk-insp-event-card:hover {
          transform: translateY(-1.5px);
          border-color: #D99A24;
          box-shadow: 0 4px 14px rgba(52, 38, 27, 0.08);
        }
        .bk-iec-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .bk-iec-arrow {
          transition: transform 0.15s ease;
        }
        .bk-insp-event-card:hover .bk-iec-arrow {
          transform: translateX(2px);
          color: #496B45;
        }
        .bk-iec-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }
        .bk-iec-icon-badge {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
        }
        .bk-iec-icon-badge.healthy { background: rgba(73, 107, 69, 0.12); color: #496B45; }
        .bk-iec-icon-badge.attention { background: rgba(217, 130, 43, 0.15); color: #D9822B; }
        .bk-iec-icon-badge.routine { background: #F4EAD8; color: #6B4F35; }
        .bk-iec-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .bk-iec-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .bk-iec-title {
          font-size: 13.5px;
          color: var(--color-deep-cocoa);
        }
        .bk-iec-date {
          font-size: 11px;
          color: var(--color-warm-gray);
        }
        .bk-iec-summary {
          font-size: 12px;
          color: var(--color-warm-gray);
          margin: 0;
          line-height: 1.4;
        }
        .bk-iec-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }
        .bk-iec-trace {
          font-size: 10.5px;
          font-weight: 700;
          color: #496B45;
          background: rgba(73, 107, 69, 0.1);
          padding: 1px 6px;
          border-radius: 4px;
        }
        .bk-iec-author {
          font-size: 11px;
          color: #8C7E70;
        }
        .bk-iec-thumb-wrap {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .bk-iec-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
};
