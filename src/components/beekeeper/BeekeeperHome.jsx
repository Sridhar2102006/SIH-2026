import React, { useState, useMemo } from 'react';
import {
  Bell,
  Layers,
  ClipboardCheck,
  Camera,
  Droplet,
  Compass,
  MessageSquarePlus,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  Activity,
  ArrowRight,
  ChevronRight,
  Plus,
  QrCode,
  ShieldCheck,
  BookOpen,
  Building2
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { FrameInspectionWorkstation } from './FrameInspectionWorkstation';
import { HarvestModal } from './HarvestModal';
import { RecordObservationModal } from '../hives/RecordObservationModal';
import { AttentionDetailsModal } from './AttentionDetailsModal';
import { FieldNotebookModal } from './FieldNotebookModal';
import { SummaryDetailsModal } from './SummaryDetailsModal';
import { InspectionDetailModal } from './InspectionDetailModal';

export const BeekeeperHome = () => {
  const {
    apiary,
    apiaries = [],
    hives = [],
    frames = [],
    hiveHistoryEvents = [],
    handoverRecords = [],
    session,
    setActiveTab,
    setSelectedHiveId,
    showToast
  } = useAppState();

  const activeApiary = useMemo(() => {
    return apiary || (apiaries?.length > 0 ? apiaries[0] : null);
  }, [apiary, apiaries]);

  // Dialog & Workstation states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isInspectWsOpen, setIsInspectWsOpen] = useState(false);
  const [isHarvestOpen, setIsHarvestOpen] = useState(false);
  const [isRecordObsOpen, setIsRecordObsOpen] = useState(false);
  const [selectedObsHiveId, setSelectedObsHiveId] = useState(null);

  // Pop-up states for quiet dashboard
  const [isAttentionModalOpen, setIsAttentionModalOpen] = useState(false);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryCategory, setSummaryCategory] = useState('overview');
  const [selectedInspectionForDetail, setSelectedInspectionForDetail] = useState(null);

  // Active non-archived hives
  const activeHives = useMemo(() => hives.filter(h => !h.isArchived), [hives]);

  // Real data metrics
  const metrics = useMemo(() => {
    const apiaryCount = apiaries.length;
    const hiveCount = activeHives.length;
    const frameCount = frames.length;
    const attentionHives = activeHives.filter(h => h.status === 'attention' || h.status === 'paused');
    const attentionFrames = frames.filter(f => f.status === 'UNDER_INSPECTION' || f.isConcerning);
    const attentionTotal = attentionHives.length + attentionFrames.length;

    return {
      apiaries: apiaryCount,
      activeHives: hiveCount,
      frames: frameCount,
      needsAttention: attentionTotal,
      attentionHives,
      attentionFrames
    };
  }, [apiaries, activeHives, frames]);

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const userName = session?.name ? session.name.split(' ')[0] : 'Sarah';
    return `${timeGreeting}, ${userName}`;
  }, [session]);

  const handleOpenSummary = (category) => {
    setSummaryCategory(category);
    setIsSummaryModalOpen(true);
  };

  const handleInspectAttentionHive = (hiveId) => {
    setSelectedHiveId(hiveId);
    setActiveTab('hives');
  };

  const handleInspectAttentionFrame = (frame) => {
    setIsInspectWsOpen(true);
  };

  const latestEvent = hiveHistoryEvents[0] || null;
  const activeJourney = handoverRecords[0] || null;

  return (
    <div className="bk-quiet-home">
      {/* 1. Calm Minimal Header */}
      <header className="bk-qh-header">
        <div className="bk-qh-greeting-wrap">
          <span className={`bk-qh-apiary-tag ${!activeApiary ? 'unconfigured' : ''}`}>
            <Building2 size={13} />
            <span>{activeApiary ? activeApiary.name : 'No Apiary Set Up'}</span>
          </span>
          <h1 className="bk-qh-greeting">{greeting}</h1>
          <p className="bk-qh-subtitle">
            {activeApiary
              ? `${activeHives.length} active colon${activeHives.length === 1 ? 'y' : 'ies'} · Field sync online`
              : 'No active colonies registered · Set up your first yard'}
          </p>
        </div>

        <button
          type="button"
          className="bk-qh-notif-btn"
          onClick={() => {
            if (metrics.needsAttention > 0) {
              setIsAttentionModalOpen(true);
            } else {
              showToast('All offline records synchronized');
            }
          }}
          aria-label="Field Notifications"
        >
          <Bell size={18} color="#6B4F35" />
          {metrics.needsAttention > 0 && (
            <span className="bk-qh-notif-badge">{metrics.needsAttention}</span>
          )}
        </button>
      </header>

      <div className="bk-qh-body">
        {/* 2. Quiet Compact Metric Bar (Tappable Pop-up) */}
        <section className="bk-qh-metric-bar" aria-label="Field Summary">
          <button
            type="button"
            className="bk-qh-metric-chip"
            onClick={() => handleOpenSummary('hives')}
            title="View hive details"
          >
            <span className="bk-mc-val">{metrics.activeHives}</span>
            <span className="bk-mc-lbl">Hives</span>
          </button>

          <button
            type="button"
            className="bk-qh-metric-chip"
            onClick={() => handleOpenSummary('frames')}
            title="View frame inventory"
          >
            <span className="bk-mc-val">{metrics.frames}</span>
            <span className="bk-mc-lbl">Frames</span>
          </button>

          <button
            type="button"
            className={`bk-qh-metric-chip ${metrics.needsAttention > 0 ? 'attention' : ''}`}
            onClick={() => setIsAttentionModalOpen(true)}
            title="Review attention items"
          >
            <span className="bk-mc-val">{metrics.needsAttention}</span>
            <span className="bk-mc-lbl">Attention</span>
          </button>
        </section>

        {/* 3. Quiet Attention Banner (Compact & Pop-up Driven) */}
        {metrics.needsAttention > 0 && (
          <div
            className="bk-qh-attention-banner"
            onClick={() => setIsAttentionModalOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setIsAttentionModalOpen(true)}
          >
            <div className="bk-ab-left">
              <div className="bk-ab-icon">
                <AlertTriangle size={16} color="#D9822B" />
              </div>
              <div className="bk-ab-text">
                <strong className="bk-ab-title">
                  {metrics.needsAttention} item{metrics.needsAttention > 1 ? 's' : ''} need colony attention
                </strong>
                <span className="bk-ab-sub">
                  Flagged brood comb & telemetry variance detected
                </span>
              </div>
            </div>

            <button
              type="button"
              className="bk-ab-action-btn"
              onClick={e => {
                e.stopPropagation();
                setIsAttentionModalOpen(true);
              }}
            >
              <span>Review ({metrics.needsAttention})</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* 4. Quick Field Actions (Compact 4-Action Grid) */}
        <section className="bk-qh-section">
          <div className="bk-sec-head">
            <span className="bk-sec-title">Quick Field Actions</span>
          </div>

          <div className="bk-qh-actions-grid">
            <button
              type="button"
              className="bk-qh-action-card green"
              onClick={() => setIsInspectWsOpen(true)}
            >
              <div className="bk-ac-top">
                <div className="bk-ac-icon">
                  <Camera size={18} />
                </div>
                <ChevronRight size={14} className="bk-ac-arrow" />
              </div>
              <div className="bk-ac-content">
                <strong className="bk-ac-title">Scan Comb</strong>
                <span className="bk-ac-sub">AI Optical Workstation</span>
              </div>
            </button>

            <button
              type="button"
              className="bk-qh-action-card honey"
              onClick={() => setActiveTab('hives')}
            >
              <div className="bk-ac-top">
                <div className="bk-ac-icon">
                  <Layers size={18} />
                </div>
                <ChevronRight size={14} className="bk-ac-arrow" />
              </div>
              <div className="bk-ac-content">
                <strong className="bk-ac-title">Manage Hives</strong>
                <span className="bk-ac-sub">Yards & Colonies</span>
              </div>
            </button>

            <button
              type="button"
              className="bk-qh-action-card warm"
              onClick={() => {
                setSelectedObsHiveId(activeHives[0]?.id);
                setIsRecordObsOpen(true);
              }}
            >
              <div className="bk-ac-top">
                <div className="bk-ac-icon">
                  <MessageSquarePlus size={18} />
                </div>
                <ChevronRight size={14} className="bk-ac-arrow" />
              </div>
              <div className="bk-ac-content">
                <strong className="bk-ac-title">Add Note</strong>
                <span className="bk-ac-sub">Colony Observation</span>
              </div>
            </button>

            <button
              type="button"
              className="bk-qh-action-card brown"
              onClick={() => setIsHarvestOpen(true)}
            >
              <div className="bk-ac-top">
                <div className="bk-ac-icon">
                  <Droplet size={18} />
                </div>
                <ChevronRight size={14} className="bk-ac-arrow" />
              </div>
              <div className="bk-ac-content">
                <strong className="bk-ac-title">Harvest</strong>
                <span className="bk-ac-sub">Log Super Extraction</span>
              </div>
            </button>
          </div>
        </section>

        {/* 5. Colony Snapshot (Short Linked Section) */}
        <section className="bk-qh-section">
          <div className="bk-sec-head">
            <div>
              <span className="bk-sec-title">Active Colonies</span>
              <span className="bk-sec-sub">
                {activeHives.length} boxes · {activeHives.filter(h => h.status === 'healthy').length} healthy
              </span>
            </div>
          </div>

          <div className="bk-qh-colony-capsules">
            {activeHives.length === 0 ? (
              <div
                className="bk-qh-colony-empty"
                onClick={() => setActiveTab('hives')}
                role="button"
                tabIndex={0}
              >
                <Layers size={18} color="#786D61" />
                <span>No active colonies registered · Tap to configure hives</span>
              </div>
            ) : (
              activeHives.slice(0, 2).map(hive => {
                const cleanCode = hive.code
                  ? hive.code.startsWith('H')
                    ? hive.code
                    : `H${String(hive.code).padStart(3, '0')}`
                  : 'H001';
                const isAtt = hive.status === 'attention';

                return (
                  <div
                    key={hive.id}
                    className={`bk-qh-colony-capsule ${isAtt ? 'attention' : ''}`}
                    onClick={() => {
                      setSelectedHiveId(hive.id);
                      setActiveTab('hives');
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="bk-cc-top">
                      <span className="bk-cc-code">{cleanCode}</span>
                      <span className={`bk-cc-pill ${hive.status}`}>
                        {hive.status === 'healthy' ? 'Healthy' : 'Check'}
                      </span>
                    </div>
                    <strong className="bk-cc-name">{hive.name}</strong>
                    <div className="bk-cc-bottom">
                      <span className="bk-cc-meta">{hive.temp ? `${hive.temp}°C` : '29.1°C'}</span>
                      <span className="bk-cc-frames">6 frames</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 6. Field Activity & Journey Hub (Short Linked Section) */}
        <section className="bk-qh-section">
          <div className="bk-sec-head">
            <div>
              <span className="bk-sec-title">Field Activity & Journey</span>
              <span className="bk-sec-sub">Telemetry & field records</span>
            </div>
          </div>

          <div className="bk-qh-hub-card">
            {/* Latest Field Note Preview */}
            {latestEvent && (
              <div
                className="bk-qh-hub-item"
                onClick={() => {
                  setSelectedInspectionForDetail(latestEvent);
                }}
              >
                <div className="bk-hi-icon">
                  <BookOpen size={16} color="#496B45" />
                </div>
                <div className="bk-hi-text">
                  <div className="bk-hi-top">
                    <strong className="bk-hi-title">{latestEvent.title}</strong>
                    <span className="bk-hi-date">{latestEvent.date}</span>
                  </div>
                  <p className="bk-hi-desc">{latestEvent.summary}</p>
                </div>
                <ChevronRight size={14} color="#A89F91" />
              </div>
            )}

            {/* Honey Journey Link Item */}
            {activeJourney && (
              <div
                className="bk-qh-hub-item journey"
                onClick={() => setActiveTab('journey')}
              >
                <div className="bk-hi-icon journey-icon">
                  <QrCode size={16} color="#D99A24" />
                </div>
                <div className="bk-hi-text">
                  <div className="bk-hi-top">
                    <strong className="bk-hi-title">Active Harvest Batch</strong>
                    <span className="bk-hi-stage">Processing</span>
                  </div>
                  <p className="bk-hi-desc">
                    {activeJourney.quantityKg} kg wildflower honey in settling facility.
                  </p>
                </div>
                <span className="bk-hi-journey-link">Track →</span>
              </div>
            )}

            {!latestEvent && !activeJourney && (
              <div
                className="bk-qh-hub-item empty"
                onClick={() => {
                  setSelectedObsHiveId(activeHives[0]?.id);
                  setIsRecordObsOpen(true);
                }}
              >
                <div className="bk-hi-icon" style={{ background: 'rgba(120, 109, 97, 0.1)' }}>
                  <BookOpen size={16} color="#786D61" />
                </div>
                <div className="bk-hi-text">
                  <div className="bk-hi-top">
                    <strong className="bk-hi-title">No field records yet</strong>
                  </div>
                  <p className="bk-hi-desc">Tap to record your first colony observation</p>
                </div>
                <ChevronRight size={14} color="#A89F91" />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Pop-up Modals */}
      <AttentionDetailsModal
        isOpen={isAttentionModalOpen}
        onClose={() => setIsAttentionModalOpen(false)}
        attentionHives={metrics.attentionHives}
        attentionFrames={metrics.attentionFrames}
        onInspectHive={handleInspectAttentionHive}
        onInspectFrame={handleInspectAttentionFrame}
      />

      <FieldNotebookModal
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
        events={hiveHistoryEvents}
        onAddNewObservation={() => {
          setSelectedObsHiveId(activeHives[0]?.id);
          setIsRecordObsOpen(true);
        }}
        onSelectInspection={(evt) => {
          setSelectedInspectionForDetail(evt);
        }}
      />

      <SummaryDetailsModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        initialCategory={summaryCategory}
        metrics={metrics}
        apiaries={apiaries}
        hives={activeHives}
        frames={frames}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenAttentionModal={() => setIsAttentionModalOpen(true)}
      />

      <InspectionDetailModal
        isOpen={Boolean(selectedInspectionForDetail)}
        inspectionEvent={selectedInspectionForDetail}
        onClose={() => setSelectedInspectionForDetail(null)}
        onOpenWorkstation={() => setIsInspectWsOpen(true)}
      />

      {/* Primary Action Modals */}
      <FrameInspectionWorkstation
        isOpen={isInspectWsOpen}
        onClose={() => setIsInspectWsOpen(false)}
        onSaveInspection={() => setIsInspectWsOpen(false)}
      />

      <HarvestModal
        isOpen={isHarvestOpen}
        onClose={() => setIsHarvestOpen(false)}
        onHarvestSuccess={() => setIsHarvestOpen(false)}
      />

      <RecordObservationModal
        isOpen={isRecordObsOpen}
        onClose={() => setIsRecordObsOpen(false)}
        hiveId={selectedObsHiveId}
      />

      <style>{`
        .bk-quiet-home {
          padding-bottom: 120px;
          background: linear-gradient(180deg, #FAF7F2 0%, #F5F0E8 100%);
          min-height: 100%;
        }
        .bk-qh-header {
          padding: 16px 20px 14px;
          background: #FFFFFF;
          border-bottom: 1px solid var(--color-divider, #E8DFD1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .bk-qh-greeting-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .bk-qh-apiary-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #496B45;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .bk-qh-apiary-tag.unconfigured {
          color: var(--color-warm-gray, #786D61);
        }
        .bk-qh-greeting {
          font-size: 21px;
          font-weight: 800;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0;
          line-height: 1.2;
        }
        .bk-qh-subtitle {
          font-size: 12.5px;
          color: var(--color-warm-gray, #786D61);
          margin: 2px 0 0;
        }
        .bk-qh-notif-btn {
          position: relative;
          background: #FAF7F2;
          border: 1px solid var(--color-card-border, #E8DFD1);
          border-radius: 12px;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          align-self: center;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .bk-qh-notif-btn:hover {
          background: #F3ECE1;
          border-color: #D6C8B5;
        }
        .bk-qh-notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #D9822B;
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 800;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FFFFFF;
        }
        .bk-qh-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        /* 2. Compact Metric Bar */
        .bk-qh-metric-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .bk-qh-metric-chip {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border, #E8DFD1);
          border-radius: 14px;
          padding: 14px 8px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          min-height: 68px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          box-shadow: 0 1px 3px rgba(52, 38, 27, 0.04);
        }
        .bk-qh-metric-chip::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #71845B, #496B45);
          border-radius: 14px 14px 0 0;
        }
        .bk-qh-metric-chip:nth-child(2)::before {
          background: linear-gradient(90deg, #D99A24, #B87316);
        }
        .bk-qh-metric-chip:nth-child(3)::before {
          background: linear-gradient(90deg, #A89F91, #786D61);
        }
        .bk-qh-metric-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(52, 38, 27, 0.1);
          border-color: #71845B;
        }
        .bk-qh-metric-chip.attention::before {
          background: linear-gradient(90deg, #D9822B, #B86A1A);
        }
        .bk-qh-metric-chip.attention {
          border-color: rgba(217, 130, 43, 0.4);
          background: #FFFDF8;
        }
        .bk-qh-metric-chip.attention:hover {
          border-color: #D9822B;
        }
        .bk-qh-metric-chip.attention .bk-mc-val {
          color: #D9822B;
        }
        .bk-mc-val {
          font-size: 22px;
          font-weight: 800;
          color: var(--color-deep-cocoa, #34261B);
          line-height: 1.1;
          letter-spacing: -0.5px;
        }
        .bk-mc-lbl {
          font-size: 10px;
          color: var(--color-warm-gray, #786D61);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
        }
        /* 3. Quiet Attention Banner */
        .bk-qh-attention-banner {
          background: #FFF9EF;
          border: 1.5px solid rgba(217, 130, 43, 0.35);
          border-radius: 12px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .bk-qh-attention-banner:hover {
          background: #FFF5E2;
        }
        .bk-ab-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }
        .bk-ab-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(217, 130, 43, 0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bk-ab-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .bk-ab-title {
          font-size: 12.5px;
          color: #8C4E0B;
        }
        .bk-ab-sub {
          font-size: 11px;
          color: var(--color-warm-gray, #786D61);
        }
        .bk-ab-action-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #D9822B;
          color: #FFFFFF;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        /* 4. Quick Actions Grid */
        .bk-qh-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .bk-sec-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding: 2px 0 4px;
        }
        .bk-sec-title {
          font-size: 14.5px;
          font-weight: 800;
          color: var(--color-deep-cocoa, #34261B);
          letter-spacing: -0.2px;
          display: block;
        }
        .bk-sec-sub {
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
          margin-top: 1px;
          display: block;
        }
        .bk-qh-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 680px) {
          .bk-qh-actions-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }
        }
        .bk-qh-action-card {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border, #E8DFD1);
          border-radius: 16px;
          padding: 13px 14px 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
          gap: 10px;
          min-height: 104px;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.2s ease, border-color 0.18s ease;
          box-shadow: 0 1px 3px rgba(52, 38, 27, 0.04);
        }
        .bk-qh-action-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(52, 38, 27, 0.1);
        }
        .bk-qh-action-card.green:hover { border-color: #496B45; }
        .bk-qh-action-card.honey:hover { border-color: #D99A24; }
        .bk-qh-action-card.warm:hover  { border-color: #786D61; }
        .bk-qh-action-card.brown:hover { border-color: #8C4E0B; }
        .bk-ac-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .bk-ac-arrow {
          color: var(--color-warm-gray, #786D61);
          opacity: 0.35;
          transition: transform 0.18s ease, opacity 0.18s ease;
        }
        .bk-qh-action-card:hover .bk-ac-arrow {
          opacity: 1;
          transform: translateX(3px);
        }
        .bk-ac-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .bk-ac-icon {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.18s ease;
        }
        .bk-qh-action-card:hover .bk-ac-icon {
          transform: scale(1.1);
        }
        .bk-qh-action-card.green .bk-ac-icon {
          background: linear-gradient(135deg, rgba(73,107,69,0.16) 0%, rgba(73,107,69,0.1) 100%);
          color: #3a6137;
          box-shadow: 0 2px 6px rgba(73,107,69,0.15);
        }
        .bk-qh-action-card.honey .bk-ac-icon {
          background: linear-gradient(135deg, rgba(217,154,36,0.2) 0%, rgba(217,154,36,0.1) 100%);
          color: #B87316;
          box-shadow: 0 2px 6px rgba(217,154,36,0.18);
        }
        .bk-qh-action-card.warm .bk-ac-icon {
          background: linear-gradient(135deg, rgba(120,109,97,0.18) 0%, rgba(120,109,97,0.1) 100%);
          color: #5C4A38;
          box-shadow: 0 2px 6px rgba(120,109,97,0.15);
        }
        .bk-qh-action-card.brown .bk-ac-icon {
          background: linear-gradient(135deg, rgba(140,78,11,0.18) 0%, rgba(140,78,11,0.08) 100%);
          color: #7A3D08;
          box-shadow: 0 2px 6px rgba(140,78,11,0.15);
        }
        .bk-ac-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          line-height: 1.2;
        }
        .bk-ac-sub {
          font-size: 10.5px;
          color: var(--color-warm-gray, #786D61);
          line-height: 1.3;
        }
        /* 5. Colony Capsules */
        .bk-qh-colony-capsules {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .bk-qh-colony-empty {
          grid-column: 1 / -1;
          background: #FFFFFF;
          border: 1.5px dashed var(--color-card-border, #E8DFD1);
          border-radius: 12px;
          padding: 16px 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--color-warm-gray, #786D61);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .bk-qh-colony-empty:hover {
          border-color: #496B45;
          background: #FFFDF8;
          color: #496B45;
        }
        .bk-qh-colony-capsule {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border, #E8DFD1);
          border-radius: 14px;
          padding: 12px 13px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 1px 3px rgba(52, 38, 27, 0.04);
          position: relative;
          overflow: hidden;
        }
        .bk-qh-colony-capsule::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #71845B, #496B45);
          border-radius: 14px 0 0 14px;
          opacity: 0.7;
        }
        .bk-qh-colony-capsule:hover {
          border-color: #496B45;
          box-shadow: 0 4px 14px rgba(73,107,69,0.12);
          transform: translateY(-2px);
        }
        .bk-qh-colony-capsule.attention {
          border-color: rgba(217, 130, 43, 0.4);
        }
        .bk-qh-colony-capsule.attention::after {
          background: linear-gradient(180deg, #D9822B, #B86A1A);
          opacity: 0.8;
        }
        .bk-cc-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-cc-code {
          font-size: 12px;
          font-weight: 800;
          color: #496B45;
        }
        .bk-cc-pill {
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
        }
        .bk-cc-pill.healthy {
          background: rgba(73, 107, 69, 0.1);
          color: #496B45;
        }
        .bk-cc-pill.attention {
          background: rgba(217, 130, 43, 0.12);
          color: #D9822B;
        }
        .bk-cc-name {
          font-size: 13px;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-cc-bottom {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--color-warm-gray, #786D61);
          margin-top: 2px;
        }
        /* 6. Hub Card */
        .bk-qh-hub-card {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border, #E8DFD1);
          border-radius: 14px;
          overflow: hidden;
        }
        .bk-qh-hub-item {
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .bk-qh-hub-item:hover {
          background: #FFFDF8;
        }
        .bk-qh-hub-item + .bk-qh-hub-item {
          border-top: 1px solid var(--color-divider, #E8DFD1);
        }
        .bk-hi-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(73, 107, 69, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bk-hi-icon.journey-icon {
          background: rgba(217, 154, 36, 0.12);
        }
        .bk-hi-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .bk-hi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-hi-title {
          font-size: 12.5px;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-hi-date {
          font-size: 10.5px;
          color: var(--color-warm-gray, #786D61);
        }
        .bk-hi-stage {
          font-size: 10px;
          font-weight: 700;
          color: #D99A24;
          background: rgba(217, 154, 36, 0.12);
          padding: 1px 5px;
          border-radius: 4px;
        }
        .bk-hi-desc {
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
          margin: 0;
          line-height: 1.35;
        }
        .bk-hi-journey-link {
          font-size: 11.5px;
          font-weight: 700;
          color: #496B45;
        }
      `}</style>
    </div>
  );
};
