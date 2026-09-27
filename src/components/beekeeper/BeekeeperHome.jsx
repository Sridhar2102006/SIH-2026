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
import { RegisterFrameModal } from './RegisterFrameModal';
import { FrameInspectionWorkstation } from './FrameInspectionWorkstation';
import { HarvestModal } from './HarvestModal';
import { RecordObservationModal } from '../hives/RecordObservationModal';
import { AttentionDetailsModal } from './AttentionDetailsModal';
import { FieldNotebookModal } from './FieldNotebookModal';
import { SummaryDetailsModal } from './SummaryDetailsModal';
import { InspectionDetailModal } from './InspectionDetailModal';

export const BeekeeperHome = () => {
  const {
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
          <span className="bk-qh-apiary-tag">
            <Building2 size={13} />
            <span>Meadow Apiary Yard #2</span>
          </span>
          <h1 className="bk-qh-greeting">{greeting}</h1>
          <p className="bk-qh-subtitle">
            All 6 colonies active · Field sync online
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
            onClick={() => handleOpenSummary('apiaries')}
            title="View apiary details"
          >
            <span className="bk-mc-val">{metrics.apiaries}</span>
            <span className="bk-mc-lbl">Yards</span>
          </button>

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
              <div className="bk-ac-icon">
                <Camera size={20} />
              </div>
              <strong className="bk-ac-title">Scan Comb</strong>
              <span className="bk-ac-sub">AI Optical Workstation</span>
            </button>

            <button
              type="button"
              className="bk-qh-action-card honey"
              onClick={() => setIsRegisterOpen(true)}
            >
              <div className="bk-ac-icon">
                <Plus size={20} />
              </div>
              <strong className="bk-ac-title">Register Frame</strong>
              <span className="bk-ac-sub">Cryptographic Identity</span>
            </button>

            <button
              type="button"
              className="bk-qh-action-card warm"
              onClick={() => {
                setSelectedObsHiveId(activeHives[0]?.id);
                setIsRecordObsOpen(true);
              }}
            >
              <div className="bk-ac-icon">
                <MessageSquarePlus size={20} />
              </div>
              <strong className="bk-ac-title">Add Note</strong>
              <span className="bk-ac-sub">Colony Observation</span>
            </button>

            <button
              type="button"
              className="bk-qh-action-card brown"
              onClick={() => setIsHarvestOpen(true)}
            >
              <div className="bk-ac-icon">
                <Droplet size={20} />
              </div>
              <strong className="bk-ac-title">Harvest</strong>
              <span className="bk-ac-sub">Log Super Extraction</span>
            </button>
          </div>
        </section>

        {/* 5. Colony Snapshot (Short Linked Section) */}
        <section className="bk-qh-section">
          <div className="bk-sec-head">
            <div>
              <span className="bk-sec-title">Colony Colonies</span>
              <span className="bk-sec-sub" style={{ display: 'block', fontSize: '11px', color: '#786D61' }}>
                {activeHives.length} boxes · {activeHives.filter(h => h.status === 'healthy').length} healthy
              </span>
            </div>
            <button
              type="button"
              className="bk-sec-link"
              onClick={() => setActiveTab('hives')}
            >
              Manage all ({activeHives.length}) →
            </button>
          </div>

          <div className="bk-qh-colony-capsules">
            {activeHives.slice(0, 2).map(hive => {
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
            })}
          </div>
        </section>

        {/* 6. Field Activity & Journey Hub (Short Linked Section) */}
        <section className="bk-qh-section">
          <div className="bk-sec-head">
            <span className="bk-sec-title">Field Activity & Journey</span>
            <button
              type="button"
              className="bk-sec-link"
              onClick={() => setIsNotebookModalOpen(true)}
            >
              Open Notebook (Pop-up)
            </button>
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
      <RegisterFrameModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

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
          padding-bottom: 90px;
          background: #FAF7F2;
          min-height: 100%;
        }
        .bk-qh-header {
          padding: 18px 20px 14px;
          background: #FFFFFF;
          border-bottom: 1px solid var(--color-divider, #E8DFD1);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .bk-qh-greeting-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
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
          border-radius: 10px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
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
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .bk-qh-metric-chip {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border, #E8DFD1);
          border-radius: 12px;
          padding: 10px 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }
        .bk-qh-metric-chip:hover {
          transform: translateY(-1px);
          border-color: #496B45;
        }
        .bk-qh-metric-chip.attention {
          background: #FFFDF8;
          border-color: rgba(217, 130, 43, 0.4);
        }
        .bk-qh-metric-chip.attention .bk-mc-val {
          color: #D9822B;
        }
        .bk-mc-val {
          font-size: 17px;
          font-weight: 800;
          color: var(--color-deep-cocoa, #34261B);
          line-height: 1.1;
        }
        .bk-mc-lbl {
          font-size: 10.5px;
          color: var(--color-warm-gray, #786D61);
          text-transform: uppercase;
          letter-spacing: 0.4px;
          font-weight: 600;
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
        .bk-qh-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .bk-qh-action-card {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border, #E8DFD1);
          border-radius: 14px;
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 4px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .bk-qh-action-card:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 4px 12px rgba(52, 38, 27, 0.06);
          border-color: #496B45;
        }
        .bk-ac-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .bk-qh-action-card.green .bk-ac-icon { background: rgba(73, 107, 69, 0.12); color: #496B45; }
        .bk-qh-action-card.honey .bk-ac-icon { background: rgba(217, 154, 36, 0.14); color: #D99A24; }
        .bk-qh-action-card.warm .bk-ac-icon { background: rgba(140, 126, 112, 0.14); color: #6B4F35; }
        .bk-qh-action-card.brown .bk-ac-icon { background: rgba(107, 79, 53, 0.14); color: #8C4E0B; }
        .bk-ac-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-ac-sub {
          font-size: 11px;
          color: var(--color-warm-gray, #786D61);
        }
        /* 5. Colony Capsules */
        .bk-qh-colony-capsules {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .bk-qh-colony-capsule {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border, #E8DFD1);
          border-radius: 12px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }
        .bk-qh-colony-capsule:hover {
          border-color: #496B45;
        }
        .bk-qh-colony-capsule.attention {
          border-color: rgba(217, 130, 43, 0.35);
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
