import React, { useState } from 'react';
import {
  Droplet,
  Send,
  CheckCircle2,
  Clock,
  Plus,
  QrCode,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Search,
  Filter,
  Building2,
  Calendar
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { FRAME_STATUS_LABELS } from '../../services/beekeeperDomainService';
import { HarvestModal } from './HarvestModal';
import { SubmitToProcessorModal } from './SubmitToProcessorModal';
import { FrameDetailModal } from './FrameDetailModal';

export const BeekeeperHarvestView = () => {
  const {
    frames = [],
    hives = [],
    harvestRecords = [],
    handoverRecords = [],
    setActiveTab
  } = useAppState();

  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all' | 'ready' | 'harvested' | 'submitted'
  const [selectedFrameForHarvest, setSelectedFrameForHarvest] = useState(null);
  const [selectedFrameForSubmit, setSelectedFrameForSubmit] = useState(null);
  const [selectedFrameForDetail, setSelectedFrameForDetail] = useState(null);

  // Grouped counts
  const readyFrames = frames.filter(f => f.status === 'READY_FOR_HARVEST' || (f.status === 'ACTIVE' && f.cappedPercentage >= 85));
  const harvestedFrames = frames.filter(f => f.status === 'HARVESTED');
  const submittedFrames = frames.filter(f => f.status === 'SUBMITTED_TO_PROCESSOR' || f.status === 'RECEIVED_BY_PROCESSOR');

  const filteredFrames = frames.filter(f => {
    if (activeTabFilter === 'ready') return f.status === 'READY_FOR_HARVEST' || (f.status === 'ACTIVE' && f.cappedPercentage >= 85);
    if (activeTabFilter === 'harvested') return f.status === 'HARVESTED';
    if (activeTabFilter === 'submitted') return f.status === 'SUBMITTED_TO_PROCESSOR' || f.status === 'RECEIVED_BY_PROCESSOR';
    return true;
  });

  return (
    <div className="bk-harvest-viewport">
      {/* Header */}
      <header className="bk-harv-header">
        <div className="bk-harv-title-row">
          <div className="bk-harv-icon">
            <Droplet size={22} color="#D99A24" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="bk-harv-title">Harvest & Handover</h1>
            <p className="bk-harv-sub">Record frame honey collections and submit units to Processor</p>
          </div>
        </div>

        {/* Metric Pills */}
        <div className="bk-harv-metrics">
          <div className="bk-hm-card" onClick={() => setActiveTabFilter('ready')}>
            <span className="bk-hm-k">Ready to Harvest</span>
            <strong className="bk-hm-v">{readyFrames.length}</strong>
          </div>
          <div className="bk-hm-card" onClick={() => setActiveTabFilter('harvested')}>
            <span className="bk-hm-k">Harvested (In Yard)</span>
            <strong className="bk-hm-v">{harvestedFrames.length}</strong>
          </div>
          <div className="bk-hm-card" onClick={() => setActiveTabFilter('submitted')}>
            <span className="bk-hm-k">At Processor</span>
            <strong className="bk-hm-v">{submittedFrames.length}</strong>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="bk-harv-tabs" role="tablist">
          {[
            { id: 'all', label: `All Units (${frames.length})` },
            { id: 'ready', label: `Ripe (${readyFrames.length})` },
            { id: 'harvested', label: `Harvested (${harvestedFrames.length})` },
            { id: 'submitted', label: `At Processor (${submittedFrames.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`bk-htab-btn ${activeTabFilter === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTabFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="bk-harv-body">
        {/* Action Callout if frames are harvested */}
        {harvestedFrames.length > 0 && (
          <div className="bk-action-callout">
            <div className="bk-ac-left">
              <Send size={18} color="#496B45" />
              <div>
                <strong className="bk-ac-title">Ready for Processor Handover</strong>
                <p className="bk-ac-sub">{harvestedFrames.length} frame unit(s) harvested and ready to submit for extraction.</p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setSelectedFrameForSubmit(harvestedFrames[0])}
            >
              Submit to Processor
            </button>
          </div>
        )}

        {/* Frames List */}
        <div className="bk-harv-frame-list">
          {filteredFrames.map(frame => {
            const isRipe = frame.status === 'READY_FOR_HARVEST' || (frame.status === 'ACTIVE' && frame.cappedPercentage >= 85);
            const isHarvested = frame.status === 'HARVESTED';
            const isSubmitted = frame.status === 'SUBMITTED_TO_PROCESSOR';

            return (
              <div
                key={frame.id}
                className="bk-harv-card"
                onClick={() => setSelectedFrameForDetail(frame)}
              >
                <div className="bk-hcard-head">
                  <div className="bk-hcard-id-row">
                    <QrCode size={16} color="#496B45" />
                    <strong className="bk-hcard-code">{frame.traceabilityCode}</strong>
                    <span className={`bk-hcard-status ${isHarvested ? 'harvested' : isSubmitted ? 'submitted' : isRipe ? 'ripe' : 'active'}`}>
                      {FRAME_STATUS_LABELS[frame.status] || frame.status}
                    </span>
                  </div>
                  <span className="bk-hcard-hive">{frame.hiveCode} · Frame {frame.frameNumber}</span>
                </div>

                <div className="bk-hcard-details">
                  <div className="bk-hcd-col">
                    <span className="bk-hcd-k">Honey Type</span>
                    <strong className="bk-hcd-v">{frame.honeyType || 'Wildflower'}</strong>
                  </div>
                  <div className="bk-hcd-col">
                    <span className="bk-hcd-k">Capping</span>
                    <strong className="bk-hcd-v">{frame.cappedPercentage || 85}% capped</strong>
                  </div>
                  <div className="bk-hcd-col">
                    <span className="bk-hcd-k">Net Yield</span>
                    <strong className="bk-hcd-v">{frame.harvestQuantityKg ? `${frame.harvestQuantityKg} kg` : 'Est. 2.4 kg'}</strong>
                  </div>
                </div>

                <div className="bk-hcard-foot">
                  {isHarvested ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm bk-hcard-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFrameForSubmit(frame);
                      }}
                    >
                      <Send size={14} />
                      <span>Submit for Processing</span>
                    </button>
                  ) : isSubmitted ? (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm bk-hcard-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('journey');
                      }}
                    >
                      <span>Track in Journey →</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm bk-hcard-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFrameForHarvest(frame);
                      }}
                    >
                      <Droplet size={14} />
                      <span>Record Harvest</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Harvest Records Section */}
        {harvestRecords.length > 0 && (
          <section className="bk-harv-recent-sec">
            <h2 className="bk-sec-title">Recent Harvest Log</h2>
            <div className="bk-hr-list">
              {harvestRecords.map(hrv => (
                <div key={hrv.id} className="bk-hr-item">
                  <div className="bk-hr-left">
                    <strong className="bk-hr-code">{hrv.traceabilityCode}</strong>
                    <span className="bk-hr-date">{hrv.harvestDate} · {hrv.harvestTime}</span>
                    <span className="bk-hr-detail">
                      {hrv.quantityKg} kg · {hrv.honeyType} · {hrv.hiveName || hrv.hiveCode}
                    </span>
                  </div>
                  <span className={`bk-hr-status ${hrv.submittedToProcessor ? 'submitted' : 'harvested'}`}>
                    {hrv.submittedToProcessor ? 'Submitted' : 'Harvested'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      <HarvestModal
        isOpen={Boolean(selectedFrameForHarvest)}
        onClose={() => setSelectedFrameForHarvest(null)}
        initialFrameId={selectedFrameForHarvest?.id}
        onHarvestSuccess={() => {
          setSelectedFrameForHarvest(null);
        }}
      />

      <SubmitToProcessorModal
        isOpen={Boolean(selectedFrameForSubmit)}
        onClose={() => setSelectedFrameForSubmit(null)}
        initialFrameId={selectedFrameForSubmit?.id}
        onSubmitSuccess={() => {
          setSelectedFrameForSubmit(null);
        }}
      />

      <FrameDetailModal
        isOpen={Boolean(selectedFrameForDetail)}
        onClose={() => setSelectedFrameForDetail(null)}
        frameId={selectedFrameForDetail?.id}
        onHarvestFrame={(f) => setSelectedFrameForHarvest(f)}
        onSubmitToProcessor={(f) => setSelectedFrameForSubmit(f)}
      />

      <style>{`
        .bk-harvest-viewport {
          padding-bottom: 90px;
        }
        .bk-harv-header {
          padding: 20px 20px 0;
          background: #FFFFFF;
          border-bottom: 1px solid var(--color-divider);
        }
        .bk-harv-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .bk-harv-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bk-harv-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-deep-cocoa);
          margin: 0;
        }
        .bk-harv-sub {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          margin: 2px 0 0;
        }
        .bk-harv-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .bk-hm-card {
          background: #FFF9EF;
          border: 1px solid var(--color-divider);
          border-radius: 10px;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          cursor: pointer;
        }
        .bk-hm-k {
          font-size: 10.5px;
          color: var(--color-warm-gray);
          font-weight: 600;
        }
        .bk-hm-v {
          font-size: 18px;
          color: var(--color-deep-cocoa);
          font-weight: 800;
        }
        .bk-harv-tabs {
          display: flex;
          gap: 14px;
          overflow-x: auto;
        }
        .bk-htab-btn {
          background: none;
          border: none;
          padding: 10px 2px;
          font-size: 13px;
          font-weight: 700;
          color: var(--color-warm-gray);
          cursor: pointer;
          white-space: nowrap;
          position: relative;
        }
        .bk-htab-btn.active {
          color: #496B45;
        }
        .bk-htab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2.5px;
          background: #496B45;
          border-radius: 2px 2px 0 0;
        }
        .bk-harv-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .bk-action-callout {
          background: rgba(73, 107, 69, 0.12);
          border: 1.5px solid #496B45;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .bk-ac-left {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .bk-ac-title {
          font-size: 14px;
          color: #2D482A;
          display: block;
        }
        .bk-ac-sub {
          font-size: 12px;
          color: var(--color-warm-gray);
          margin: 2px 0 0;
        }
        .bk-harv-frame-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bk-harv-card {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border);
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bk-hcard-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-hcard-id-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bk-hcard-code {
          font-size: 15px;
          color: #496B45;
          font-weight: 800;
        }
        .bk-hcard-status {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .bk-hcard-status.active { background: rgba(73, 107, 69, 0.1); color: #496B45; }
        .bk-hcard-status.ripe { background: rgba(217, 154, 36, 0.15); color: #B87316; }
        .bk-hcard-status.harvested { background: #EDE2D1; color: #6B4F35; }
        .bk-hcard-status.submitted { background: rgba(73, 107, 69, 0.2); color: #2D482A; }
        .bk-hcard-hive {
          font-size: 12px;
          color: var(--color-warm-gray);
        }
        .bk-hcard-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background: #FFFDF8;
          border: 1px solid var(--color-divider);
          padding: 8px 10px;
          border-radius: 8px;
        }
        .bk-hcd-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .bk-hcd-k {
          font-size: 10.5px;
          color: var(--color-warm-gray);
        }
        .bk-hcd-v {
          font-size: 12.5px;
          color: var(--color-deep-cocoa);
        }
        .bk-hcard-foot {
          display: flex;
          justify-content: flex-end;
          padding-top: 4px;
        }
        .bk-hcard-action {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .bk-harv-recent-sec {
          margin-top: 8px;
        }
        .bk-hr-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }
        .bk-hr-item {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-hr-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .bk-hr-code {
          font-size: 14px;
          color: #496B45;
        }
        .bk-hr-date {
          font-size: 11.5px;
          color: var(--color-warm-gray);
        }
        .bk-hr-detail {
          font-size: 12px;
          color: var(--color-deep-cocoa);
        }
        .bk-hr-status {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .bk-hr-status.harvested { background: #EDE2D1; color: #6B4F35; }
        .bk-hr-status.submitted { background: rgba(73, 107, 69, 0.15); color: #496B45; }
      `}</style>
    </div>
  );
};
