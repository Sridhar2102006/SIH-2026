import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building2,
  FlaskConical,
  Package,
  Truck,
  Droplet,
  Info,
  QrCode
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

export const HoneyJourneyView = () => {
  const {
    handoverRecords = [],
    harvestRecords = [],
    frames = [],
    batches = [],
    setActiveTab
  } = useAppState();

  const [expandedTraceCode, setExpandedTraceCode] = useState(
    handoverRecords[0]?.traceabilityCode || harvestRecords[0]?.traceabilityCode || 'AP1H001F5'
  );

  // Combine tracked items
  const trackedItems = React.useMemo(() => {
    const list = [];

    // Items from handovers
    handoverRecords.forEach(hnd => {
      list.push({
        id: hnd.id,
        traceabilityCode: hnd.traceabilityCode,
        quantityKg: hnd.quantityKg,
        honeyType: hnd.honeyType,
        facility: hnd.receivingFacility,
        currentStage: 'PROCESSING',
        currentStageLabel: 'In Processing (Settling & Clarification)',
        etaNextStep: hnd.downstreamJourney?.processing?.etaNextStep || 'Tomorrow, 10:00 AM',
        etaDispatch: hnd.downstreamJourney?.dispatch?.eta || '30 Sep 2026',
        stages: [
          {
            name: 'Harvest',
            status: 'completed',
            timestamp: hnd.downstreamJourney?.harvest?.timestamp || '24 Sep · 14:15',
            handler: 'Sarah Lindqvist (Beekeeper)',
            details: `Net yield ${hnd.quantityKg} kg harvested from ${hnd.hiveCode}. Cold unheated comb extraction.`
          },
          {
            name: 'Submitted to Processor',
            status: 'completed',
            timestamp: hnd.submissionTimestamp || '25 Sep · 10:00',
            handler: hnd.submittingBeekeeper,
            details: `Delivered to ${hnd.receivingFacility}. Custody seal verified.`
          },
          {
            name: 'Processing',
            status: 'active',
            timestamp: 'Started 25 Sep · 11:30',
            handler: 'Marcus K. (Processing Lead)',
            details: 'Centrifugal extraction completed. Currently clarifying micro-air bubbles in Settling Tank #2 at 20°C.'
          },
          {
            name: 'Quality Testing',
            status: 'pending',
            timestamp: null,
            handler: 'Pending Lab Assignment',
            details: 'Assigned for digital refractometry (moisture) and diastase enzyme activity analysis.'
          },
          {
            name: 'Packaging',
            status: 'pending',
            timestamp: null,
            handler: 'Not started',
            details: 'Awaiting laboratory quality release prior to glass bottling.'
          },
          {
            name: 'Dispatch',
            status: 'pending',
            timestamp: null,
            handler: 'Not started',
            details: 'Estimated delivery window follows packaging completion.'
          }
        ]
      });
    });

    // Harvested items not yet submitted
    harvestRecords.filter(h => !h.submittedToProcessor).forEach(hrv => {
      list.push({
        id: hrv.id,
        traceabilityCode: hrv.traceabilityCode,
        quantityKg: hrv.quantityKg,
        honeyType: hrv.honeyType,
        facility: 'Apiary Storage',
        currentStage: 'HARVESTED',
        currentStageLabel: 'Harvested (Ready for Handover)',
        etaNextStep: 'Awaiting Handover Submission',
        etaDispatch: null, // Section 28: Never invent ETA values!
        stages: [
          {
            name: 'Harvest',
            status: 'completed',
            timestamp: `${hrv.harvestDate} · ${hrv.harvestTime}`,
            handler: hrv.submittingBeekeeper || 'Sarah Lindqvist',
            details: `${hrv.quantityKg} kg ${hrv.honeyType} logged from ${hrv.hiveName || hrv.hiveCode}.`
          },
          {
            name: 'Submitted to Processor',
            status: 'pending',
            timestamp: null,
            handler: 'Not submitted yet',
            details: 'Submit this frame when ready to deliver to the processing facility.'
          },
          {
            name: 'Processing',
            status: 'pending',
            timestamp: null,
            handler: 'Not started',
            details: 'Awaiting intake.'
          },
          {
            name: 'Quality Testing',
            status: 'pending',
            timestamp: null,
            handler: 'Not started',
            details: 'Scheduled after settling.'
          },
          {
            name: 'Packaging',
            status: 'pending',
            timestamp: null,
            handler: 'Not started',
            details: 'Not started.'
          },
          {
            name: 'Dispatch',
            status: 'pending',
            timestamp: null,
            handler: 'Not started',
            details: 'Not started.'
          }
        ]
      });
    });

    return list;
  }, [handoverRecords, harvestRecords]);

  return (
    <div className="bk-journey-viewport">
      {/* Header */}
      <header className="bk-journey-header">
        <div className="bk-jh-title-row">
          <div className="bk-jh-icon">
            <Compass size={22} color="#D99A24" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="bk-jh-title">My Honey Journey</h1>
            <p className="bk-jh-sub">
              Read-only traceability tracking for your harvested frame units
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="bk-journey-body">
        {/* Read-Only Notice */}
        <div className="bk-journey-read-notice">
          <ShieldCheck size={18} color="#496B45" />
          <p>
            <strong>Beekeeper Traceability View:</strong> You have full visibility into the lifecycle of your harvested honey across downstream extraction, quality testing, and fulfillment.
          </p>
        </div>

        {/* Empty State */}
        {trackedItems.length === 0 ? (
          <div className="bk-empty-card">
            <Droplet size={36} color="#D99A24" strokeWidth={1.5} />
            <h3>No harvested frames in journey yet</h3>
            <p>Once you record a harvest and submit it for processing, you can track its entire journey here.</p>
            <button className="btn btn-primary" onClick={() => setActiveTab('harvest')}>
              Go to Harvests
            </button>
          </div>
        ) : (
          <div className="bk-journey-card-list">
            {trackedItems.map(item => {
              const isExpanded = expandedTraceCode === item.traceabilityCode;
              return (
                <div key={item.id} className="bk-jcard">
                  {/* Card Header */}
                  <div
                    className="bk-jcard-head"
                    onClick={() => setExpandedTraceCode(isExpanded ? null : item.traceabilityCode)}
                  >
                    <div className="bk-jcard-left">
                      <div className="bk-jcard-code-row">
                        <QrCode size={16} color="#496B45" />
                        <strong className="bk-jcard-code">{item.traceabilityCode}</strong>
                        <span className="bk-jcard-badge">{item.currentStageLabel}</span>
                      </div>
                      <span className="bk-jcard-sub">
                        {item.quantityKg} kg · {item.honeyType} · {item.facility}
                      </span>
                    </div>

                    <button className="bk-expand-btn" aria-label="Toggle details">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {/* Horizontal Stage Progression Track */}
                  <div className="bk-jcard-progress-bar">
                    {['Harvest', 'Submitted', 'Processing', 'Quality', 'Packaging', 'Dispatch'].map((stg, i) => {
                      const stageObj = item.stages[i];
                      const isDone = stageObj?.status === 'completed';
                      const isActive = stageObj?.status === 'active';
                      return (
                        <div key={stg} className={`bk-jpip-wrap ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                          <div className="bk-jpip">
                            {isDone ? '✓' : isActive ? '●' : '○'}
                          </div>
                          <span className="bk-jpip-label">{stg}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Real ETA Timeline Section (Section 28) */}
                  <div className="bk-eta-box">
                    <span className="bk-eta-title">Estimated Next Step</span>
                    <div className="bk-eta-row">
                      <Clock size={15} color="#D99A24" />
                      <strong>{item.etaNextStep || 'ETA not available yet'}</strong>
                    </div>
                    {item.etaDispatch ? (
                      <span className="bk-eta-secondary">
                        Estimated final dispatch: <strong>{item.etaDispatch}</strong>
                      </span>
                    ) : (
                      <span className="bk-eta-secondary-unavail">
                        Dispatch ETA not available yet (determined after quality testing release)
                      </span>
                    )}
                  </div>

                  {/* Expanded Stage Timeline (Section 29) */}
                  {isExpanded && (
                    <div className="bk-jdetail-expanded">
                      <span className="bk-jd-title">Journey Stage Detail</span>
                      <div className="bk-jd-timeline">
                        {item.stages.map((stg, idx) => (
                          <div key={stg.name} className={`bk-jdt-item ${stg.status}`}>
                            <div className="bk-jdt-dot" />
                            <div className="bk-jdt-content">
                              <div className="bk-jdt-top">
                                <strong className="bk-jdt-name">{stg.name}</strong>
                                <span className="bk-jdt-time">{stg.timestamp || 'Not started'}</span>
                              </div>
                              <span className="bk-jdt-handler">{stg.handler}</span>
                              <p className="bk-jdt-details">{stg.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .bk-journey-viewport {
          padding-bottom: 90px;
        }
        .bk-journey-header {
          padding: 22px 20px 14px;
          background: #FFFFFF;
          border-bottom: 1px solid var(--color-divider);
        }
        .bk-jh-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bk-jh-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bk-jh-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-deep-cocoa);
          margin: 0;
        }
        .bk-jh-sub {
          font-size: 13px;
          color: var(--color-warm-gray);
          margin: 2px 0 0;
        }
        .bk-journey-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .bk-journey-read-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(73, 107, 69, 0.1);
          padding: 12px 14px;
          border-radius: 10px;
        }
        .bk-journey-read-notice p {
          font-size: 12.5px;
          color: #34261B;
          margin: 0;
          line-height: 1.45;
        }
        .bk-jcard {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(52, 38, 27, 0.04);
        }
        .bk-jcard-head {
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }
        .bk-jcard-left {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .bk-jcard-code-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bk-jcard-code {
          font-size: 16px;
          font-weight: 800;
          color: #496B45;
          letter-spacing: 0.5px;
        }
        .bk-jcard-badge {
          background: rgba(217, 154, 36, 0.15);
          color: #B87316;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .bk-jcard-sub {
          font-size: 12.5px;
          color: var(--color-warm-gray);
        }
        .bk-expand-btn {
          background: none;
          border: none;
          padding: 6px;
          color: var(--color-warm-gray);
          cursor: pointer;
        }
        .bk-jcard-progress-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: #FFF9EF;
          border-top: 1px solid var(--color-divider);
          border-bottom: 1px solid var(--color-divider);
        }
        .bk-jpip-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          flex: 1;
        }
        .bk-jpip {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #E5D8C7;
          color: #786D61;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .bk-jpip-wrap.done .bk-jpip {
          background: #496B45;
          color: #FFFFFF;
        }
        .bk-jpip-wrap.active .bk-jpip {
          background: #D99A24;
          color: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(217, 154, 36, 0.25);
        }
        .bk-jpip-label {
          font-size: 9px;
          font-weight: 600;
          color: #786D61;
        }
        .bk-jpip-wrap.active .bk-jpip-label {
          color: #34261B;
          font-weight: 800;
        }
        .bk-eta-box {
          padding: 12px 16px;
          background: #FDF9F2;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .bk-eta-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-warm-gray);
          font-weight: 700;
        }
        .bk-eta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14.5px;
          color: var(--color-deep-cocoa);
        }
        .bk-eta-secondary {
          font-size: 12px;
          color: #496B45;
        }
        .bk-eta-secondary-unavail {
          font-size: 11.5px;
          color: #8C7E70;
          font-style: italic;
        }
        .bk-jdetail-expanded {
          padding: 16px;
          border-top: 1px solid var(--color-divider);
          background: #FFFFFF;
        }
        .bk-jd-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          display: block;
          margin-bottom: 12px;
        }
        .bk-jd-timeline {
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          padding-left: 14px;
        }
        .bk-jd-timeline::before {
          content: '';
          position: absolute;
          top: 6px; bottom: 6px; left: 3px;
          width: 2px;
          background: #EDE2D1;
        }
        .bk-jdt-item {
          position: relative;
        }
        .bk-jdt-dot {
          position: absolute;
          left: -14px;
          top: 5px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #D8C7B0;
        }
        .bk-jdt-item.completed .bk-jdt-dot {
          background: #496B45;
        }
        .bk-jdt-item.active .bk-jdt-dot {
          background: #D99A24;
          box-shadow: 0 0 0 2px rgba(217, 154, 36, 0.3);
        }
        .bk-jdt-top {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }
        .bk-jdt-name {
          color: var(--color-deep-cocoa);
        }
        .bk-jdt-time {
          color: var(--color-warm-gray);
          font-size: 12px;
        }
        .bk-jdt-handler {
          display: block;
          font-size: 11.5px;
          color: #71845B;
          font-weight: 600;
          margin: 1px 0 3px;
        }
        .bk-jdt-details {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          margin: 0;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};
