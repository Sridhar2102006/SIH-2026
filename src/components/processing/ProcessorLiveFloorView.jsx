import React, { useState, useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Activity,
  Cpu,
  Layers,
  Search,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Filter,
  Droplet,
  X,
  QrCode,
  Building,
  RotateCcw,
  Play,
  Pause,
  Thermometer,
  Gauge,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { BATCH_STATUSES } from '../../services/processorDomainService';

export const ProcessorLiveFloorView = ({
  onSelectBatch,
  onOpenCreateBatch,
  onOpenRecordStep,
  onOpenHoldModal,
  onResumeFromHold
}) => {
  const {
    processingBatches = [],
    handoverRecords = []
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL'); // 'ALL' | 'IN_PROCESSING' | 'ON_HOLD' | 'READY_FOR_NEXT_STEP'
  const [stationFilter, setStationFilter] = useState('ALL');

  // Live floor batches (primarily in-processing or on hold)
  const floorBatches = useMemo(() => {
    return processingBatches.filter(b => 
      b.status === BATCH_STATUSES.IN_PROCESSING || 
      b.status === BATCH_STATUSES.ON_HOLD ||
      b.status === BATCH_STATUSES.READY_FOR_QUALITY
    );
  }, [processingBatches]);

  // Floor stats
  const activeRunsCount = processingBatches.filter(b => b.status === BATCH_STATUSES.IN_PROCESSING).length;
  const holdsCount = processingBatches.filter(b => b.status === BATCH_STATUSES.ON_HOLD).length;
  const totalFloorWeight = floorBatches.reduce((acc, b) => acc + Number(b.finalYieldKg || b.weightKg || 0), 0);
  const totalRemainingSteps = floorBatches.reduce((acc, b) => {
    const total = b.approvedPlan?.length || 5;
    const completed = (b.steps || []).length;
    return acc + Math.max(0, total - completed);
  }, 0);

  // Filtered live runs
  const filteredBatches = useMemo(() => {
    return floorBatches.filter(b => {
      // Stage filter
      if (stageFilter === 'IN_PROCESSING' && b.status !== BATCH_STATUSES.IN_PROCESSING) return false;
      if (stageFilter === 'ON_HOLD' && b.status !== BATCH_STATUSES.ON_HOLD) return false;
      if (stageFilter === 'READY_FOR_QUALITY' && b.status !== BATCH_STATUSES.READY_FOR_QUALITY) return false;

      // Station filter
      if (stationFilter !== 'ALL') {
        if ((b.facility || '').toLowerCase() !== stationFilter.toLowerCase()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = (b.batchNumber || '').toLowerCase().includes(q);
        const matchName = (b.name || '').toLowerCase().includes(q);
        const matchFacility = (b.facility || '').toLowerCase().includes(q);
        const matchHoney = (b.honeyType || '').toLowerCase().includes(q);
        const matchSop = (b.sopCode || '').toLowerCase().includes(q);
        const matchSources = (b.sourceHarvests || []).some(s => 
          (s.traceabilityCode || '').toLowerCase().includes(q) ||
          (s.hiveCode || '').toLowerCase().includes(q) ||
          (s.submittingBeekeeper || '').toLowerCase().includes(q)
        );

        if (!matchNum && !matchName && !matchFacility && !matchHoney && !matchSop && !matchSources) {
          return false;
        }
      }

      return true;
    });
  }, [floorBatches, stageFilter, stationFilter, searchQuery]);

  return (
    <div className="proc-live-floor-container">
      {/* 1. Live Floor Operations Header */}
      <div className="proc-floor-header card">
        <div className="proc-fh-left">
          <div className="proc-fh-live-badge">
            <span className="proc-pulse-dot" />
            <span className="proc-live-text">Live Production Floor</span>
            <span className="proc-fh-sop-tag">SOP Real-Time Execution</span>
          </div>
          <h2 className="proc-fh-title">Extraction & Processing Operations</h2>
          <p className="proc-fh-desc">
            Active centrifugal runs, step parameter telemetry, temperature controls, and inline quality logging.
          </p>
        </div>

        <div className="proc-fh-actions">
          <button
            type="button"
            className="btn btn-primary proc-floor-btn"
            onClick={onOpenCreateBatch}
          >
            <Plus size={16} />
            <span>Initialize Production Run</span>
          </button>
        </div>
      </div>

      {/* 2. Extraction Stations Real-Time Equipment Strip */}
      <div className="proc-equipment-strip">
        <div className="proc-eq-card active">
          <div className="proc-eq-top">
            <div className="proc-eq-icon active">
              <Activity size={16} />
            </div>
            <span className="proc-eq-status-badge running">Running</span>
          </div>
          <strong className="proc-eq-name">Centrifuge Line #1</strong>
          <span className="proc-eq-sub">Apis Mellifera Cold Extraction • 40 RPM</span>
        </div>

        <div className="proc-eq-card active">
          <div className="proc-eq-top">
            <div className="proc-eq-icon active">
              <Thermometer size={16} />
            </div>
            <span className="proc-eq-status-badge running">Stable</span>
          </div>
          <strong className="proc-eq-name">Maturation Tank #2</strong>
          <span className="proc-eq-sub">Settling Chamber • 38.2°C (Max 45.0°C)</span>
        </div>

        <div className="proc-eq-card">
          <div className="proc-eq-top">
            <div className="proc-eq-icon ready">
              <Gauge size={16} />
            </div>
            <span className="proc-eq-status-badge ready">Ready</span>
          </div>
          <strong className="proc-eq-name">Filtration Press #1</strong>
          <span className="proc-eq-sub">Stainless Steel 200 Mesh • Dual Chamber</span>
        </div>
      </div>

      {/* 3. Floor Real-Time Metrics Strip */}
      <div className="proc-floor-metrics">
        <div className="proc-fm-item">
          <span className="proc-fm-icon amber"><Cpu size={16} /></span>
          <div className="proc-fm-meta">
            <span className="proc-fm-val">{activeRunsCount}</span>
            <span className="proc-fm-lbl">Active Extraction Runs</span>
          </div>
        </div>

        <div className="proc-fm-item">
          <span className="proc-fm-icon honey"><Droplet size={16} /></span>
          <div className="proc-fm-meta">
            <span className="proc-fm-val">{totalFloorWeight.toFixed(1)} kg</span>
            <span className="proc-fm-lbl">Honey Currently on Floor</span>
          </div>
        </div>

        <div className="proc-fm-item">
          <span className="proc-fm-icon blue"><Sliders size={16} /></span>
          <div className="proc-fm-meta">
            <span className="proc-fm-val">{totalRemainingSteps}</span>
            <span className="proc-fm-lbl">Pending Operation Steps</span>
          </div>
        </div>

        <div className="proc-fm-item">
          <span className={`proc-fm-icon ${holdsCount > 0 ? 'red' : 'green'}`}>
            <AlertTriangle size={16} />
          </span>
          <div className="proc-fm-meta">
            <span className="proc-fm-val">{holdsCount}</span>
            <span className="proc-fm-lbl">Active Holds / Deviations</span>
          </div>
        </div>
      </div>

      {/* 4. Floor Controls & Stage Filters */}
      <div className="proc-floor-controls card">
        <div className="proc-search-wrap">
          <Search size={18} className="proc-search-icon" />
          <input
            type="text"
            className="proc-search-input"
            placeholder="Search active live runs by batch number, frame QR code, current step, or facility..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="proc-search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="proc-floor-filter-pills">
          <button
            type="button"
            className={`proc-ff-pill ${stageFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStageFilter('ALL')}
          >
            <span>All Floor Operations</span>
            <span className="proc-pill-count">{floorBatches.length}</span>
          </button>

          <button
            type="button"
            className={`proc-ff-pill ${stageFilter === 'IN_PROCESSING' ? 'active' : ''}`}
            onClick={() => setStageFilter('IN_PROCESSING')}
          >
            <Play size={12} />
            <span>Actively Running</span>
            <span className="proc-pill-count">{activeRunsCount}</span>
          </button>

          <button
            type="button"
            className={`proc-ff-pill ${stageFilter === 'ON_HOLD' ? 'active' : ''}`}
            onClick={() => setStageFilter('ON_HOLD')}
          >
            <Pause size={12} />
            <span>On Hold</span>
            <span className="proc-pill-count">{holdsCount}</span>
          </button>
        </div>
      </div>

      {/* 5. Live Production Batch Run Cards */}
      <div className="proc-floor-runs-grid">
        {filteredBatches.length === 0 ? (
          <div className="proc-empty-floor card">
            <div className="proc-empty-icon-wrap">
              <Cpu size={32} color="#D97706" />
            </div>
            <h4 className="proc-empty-title">No Active Batches on Production Floor</h4>
            <p className="proc-empty-text">
              {searchQuery
                ? `No live batches match "${searchQuery}".`
                : 'All batches have completed processing or none have been initialized yet.'}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm proc-empty-action-btn"
              onClick={onOpenCreateBatch}
            >
              <Plus size={15} />
              <span>Initialize Batch from Accepted Intakes</span>
            </button>
          </div>
        ) : (
          filteredBatches.map(batch => {
            const isHold = batch.status === BATCH_STATUSES.ON_HOLD;
            const totalPlanSteps = batch.approvedPlan?.length || 5;
            const completedSteps = (batch.steps || []).length;
            const progressPct = Math.min(100, Math.round((completedSteps / totalPlanSteps) * 100));

            // Current / Next Pending Step
            const completedKeys = (batch.steps || []).map(s => s.stepKey);
            const nextStep = (batch.approvedPlan || []).find(s => !completedKeys.includes(s.stepKey));
            const nextStepLabel = nextStep?.name || (completedSteps === totalPlanSteps ? 'Processing Complete' : `Step ${completedSteps + 1}`);

            return (
              <div
                key={batch.id}
                className={`card proc-live-batch-card ${isHold ? 'on-hold' : ''}`}
              >
                {/* Header */}
                <div className="proc-lbc-header">
                  <div className="proc-lbc-id-col">
                    <div className="proc-lbc-code-row">
                      <QrCode size={16} color="#D97706" />
                      <h3 className="proc-lbc-num">{batch.batchNumber}</h3>
                      <span className="proc-lbc-sop">{batch.sopCode || 'SOP-001'}</span>
                    </div>
                    <span className="proc-lbc-name">{batch.name}</span>
                  </div>

                  <StatusBadge
                    status={isHold ? 'attention' : 'healthy'}
                    label={batch.statusLabel || batch.status}
                    size="small"
                  />
                </div>

                {/* Live Active Step Banner */}
                <div className={`proc-lbc-active-step-bar ${isHold ? 'hold' : ''}`}>
                  <div className="proc-step-indicator">
                    <span className="proc-step-pulse" />
                    <span className="proc-step-heading">CURRENT STEP EXECUTION:</span>
                  </div>
                  <strong className="proc-step-curr-name">{nextStepLabel}</strong>
                </div>

                {/* Interactive Workflow Progress Visualizer */}
                <div className="proc-lbc-progress-box">
                  <div className="proc-lbc-pb-top">
                    <span className="proc-lbc-pb-lbl">SOP Execution Progress</span>
                    <span className="proc-lbc-pb-val">{completedSteps}/{totalPlanSteps} Steps Completed ({progressPct}%)</span>
                  </div>
                  <div className="proc-lbc-track">
                    <div
                      className={`proc-lbc-fill ${isHold ? 'hold' : progressPct === 100 ? 'done' : ''}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Live Telemetry & Floor Specs */}
                <div className="proc-lbc-telemetry-grid">
                  <div className="proc-tele-item">
                    <span className="proc-tele-lbl">Floor Weight</span>
                    <strong className="proc-tele-val">{batch.finalYieldKg || batch.weightKg || 0} kg</strong>
                  </div>
                  <div className="proc-tele-item">
                    <span className="proc-tele-lbl">Source Units</span>
                    <strong className="proc-tele-val">{batch.sourceHarvests?.length || 0} Frames</strong>
                  </div>
                  <div className="proc-tele-item">
                    <span className="proc-tele-lbl">Operating Facility</span>
                    <strong className="proc-tele-val proc-tele-fac">{batch.facility || 'HoneyHouse #2'}</strong>
                  </div>
                </div>

                {/* Source Frames Tags */}
                <div className="proc-lbc-sources">
                  <span className="proc-lbc-src-lbl">Input Frames:</span>
                  <div className="proc-lbc-src-chips">
                    {(batch.sourceHarvests || []).slice(0, 3).map((s, i) => (
                      <span key={i} className="proc-lbc-chip">
                        <QrCode size={11} color="#D97706" />
                        <span>{s.traceabilityCode}</span>
                      </span>
                    ))}
                    {(batch.sourceHarvests || []).length > 3 && (
                      <span className="proc-lbc-more">+{batch.sourceHarvests.length - 3} more</span>
                    )}
                  </div>
                </div>

                {/* Action CTA Bar */}
                <div className="proc-lbc-actions">
                  {/* Step Record Button (Primary Direct Execution) */}
                  <button
                    type="button"
                    className="btn btn-primary proc-lbc-record-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenRecordStep) onOpenRecordStep(batch);
                    }}
                    disabled={isHold}
                    title={isHold ? 'Batch is on hold. Clear hold before recording steps.' : 'Record parameter telemetry and complete step'}
                  >
                    <Activity size={15} />
                    <span>Log Step Execution</span>
                  </button>

                  {/* Hold / Resume Toggle */}
                  {isHold ? (
                    <button
                      type="button"
                      className="btn btn-secondary proc-lbc-resume-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onResumeFromHold) {
                          onResumeFromHold({ batchId: batch.id, remarks: 'Hold resolved on live floor.' });
                        }
                      }}
                    >
                      <Play size={14} />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary proc-lbc-hold-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenHoldModal) onOpenHoldModal(batch);
                      }}
                    >
                      <Pause size={14} />
                      <span>Hold</span>
                    </button>
                  )}

                  {/* Details Link */}
                  <button
                    type="button"
                    className="proc-lbc-detail-link"
                    onClick={() => onSelectBatch(batch)}
                  >
                    <span>Full Plan</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .proc-live-floor-container {
          padding: 18px var(--mobile-pad, 16px) 80px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* 1. Header Card */
        .proc-floor-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #FFFDF8 0%, #FFF7EC 100%);
          border: 1.5px solid #F1ECE1;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 4px 16px rgba(46, 31, 20, 0.04);
        }

        @media (min-width: 640px) {
          .proc-floor-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .proc-fh-left {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .proc-fh-live-badge {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .proc-pulse-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
          animation: procPulse 1.5s infinite;
        }

        @keyframes procPulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .proc-live-text {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #059669;
        }

        .proc-fh-sop-tag {
          font-size: 11px;
          font-weight: 700;
          color: #B45309;
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .proc-fh-title {
          font-size: 20px;
          font-weight: 800;
          color: #2E1F14;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .proc-fh-desc {
          font-size: 13px;
          color: #6B5B4E;
          margin: 0;
        }

        .proc-floor-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          height: 44px;
          padding: 0 18px;
          font-size: 13.5px;
          font-weight: 700;
          border-radius: 12px;
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
          color: #FFFFFF;
          border: none;
          box-shadow: 0 4px 14px rgba(217, 119, 6, 0.25);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .proc-floor-btn:hover {
          background: linear-gradient(135deg, #B45309 0%, #92400E 100%);
          transform: translateY(-1px);
        }

        /* 2. Equipment Strip */
        .proc-equipment-strip {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 12px;
        }

        @media (min-width: 768px) {
          .proc-equipment-strip {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .proc-eq-card {
          background: #FFFFFF;
          border: 1.5px solid #EADBCE;
          border-radius: 14px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 2px 8px rgba(46, 31, 20, 0.03);
        }

        .proc-eq-card.active {
          border-color: #FDE68A;
          background: #FFFCF5;
        }

        .proc-eq-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .proc-eq-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .proc-eq-icon.active {
          background: #FEF3C7;
          color: #D97706;
        }

        .proc-eq-icon.ready {
          background: #ECFDF5;
          color: #059669;
        }

        .proc-eq-status-badge {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 10px;
        }

        .proc-eq-status-badge.running {
          background: #D1FAE5;
          color: #047857;
        }

        .proc-eq-status-badge.ready {
          background: #F3F4F6;
          color: #4B5563;
        }

        .proc-eq-name {
          font-size: 13.5px;
          color: #2E1F14;
          font-weight: 700;
        }

        .proc-eq-sub {
          font-size: 11px;
          color: #786C60;
        }

        /* 3. Floor Metrics */
        .proc-floor-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (min-width: 768px) {
          .proc-floor-metrics {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .proc-fm-item {
          background: #FFFFFF;
          border: 1.5px solid #EADBCE;
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .proc-fm-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .proc-fm-icon.amber { background: #FEF3C7; color: #D97706; }
        .proc-fm-icon.honey { background: #FFFBEB; color: #B45309; }
        .proc-fm-icon.blue { background: #EFF6FF; color: #2563EB; }
        .proc-fm-icon.green { background: #ECFDF5; color: #059669; }
        .proc-fm-icon.red { background: #FEE2E2; color: #DC2626; }

        .proc-fm-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .proc-fm-val {
          font-size: 16px;
          font-weight: 800;
          color: #2E1F14;
          line-height: 1.2;
        }

        .proc-fm-lbl {
          font-size: 11px;
          font-weight: 600;
          color: #8C7E72;
        }

        /* 4. Floor Controls */
        .proc-floor-controls {
          background: #FFFFFF;
          border: 1.5px solid #EADBCE;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .proc-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .proc-search-icon {
          position: absolute;
          left: 14px;
          color: #D97706;
          pointer-events: none;
        }

        .proc-search-input {
          width: 100%;
          height: 44px;
          padding: 0 40px 0 42px;
          border-radius: 12px;
          border: 1.5px solid #D6CEBE;
          background: #FFFCF8;
          font-size: 13.5px;
          color: #2E1F14;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .proc-search-input:focus {
          border-color: #D97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
          background: #FFFFFF;
        }

        .proc-search-clear-btn {
          position: absolute;
          right: 12px;
          background: #F3EDE2;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .proc-floor-filter-pills {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .proc-ff-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: 20px;
          border: 1.5px solid #E5DCCB;
          background: #FFFCF8;
          color: #4A3B32;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.18s ease;
        }

        .proc-ff-pill:hover {
          border-color: #D97706;
          background: #FFFDF8;
        }

        .proc-ff-pill.active {
          background: #2E1F14;
          color: #FFFFFF;
          border-color: #2E1F14;
        }

        .proc-pill-count {
          font-size: 11px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 10px;
          background: #F3EDE2;
          color: #786C60;
        }

        .proc-ff-pill.active .proc-pill-count {
          background: #D97706;
          color: #FFFFFF;
        }

        /* 5. Live Runs Grid */
        .proc-floor-runs-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 680px) {
          .proc-floor-runs-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .proc-live-batch-card {
          padding: 20px;
          background: #FFFFFF;
          border: 1.5px solid #EADBCE;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 4px 14px rgba(46, 31, 20, 0.04);
          transition: all 0.2s ease;
        }

        .proc-live-batch-card:hover {
          border-color: #D97706;
          box-shadow: 0 8px 24px rgba(217, 119, 6, 0.12);
        }

        .proc-live-batch-card.on-hold {
          border-color: #FCA5A5;
          background: #FFFBFB;
        }

        .proc-lbc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .proc-lbc-id-col {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .proc-lbc-code-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .proc-lbc-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          font-weight: 800;
          color: #2E1F14;
          margin: 0;
        }

        .proc-lbc-sop {
          font-size: 10.5px;
          font-weight: 700;
          color: #92400E;
          background: #FEF3C7;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .proc-lbc-name {
          font-size: 13px;
          color: #6B5B4E;
        }

        /* Active Step Banner */
        .proc-lbc-active-step-bar {
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 10px;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .proc-lbc-active-step-bar.hold {
          background: #FEF2F2;
          border-color: #FECACA;
        }

        .proc-step-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .proc-step-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #D97706;
          animation: procPulse 1.2s infinite;
        }

        .proc-lbc-active-step-bar.hold .proc-step-pulse {
          background: #EF4444;
        }

        .proc-step-heading {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #92400E;
        }

        .proc-lbc-active-step-bar.hold .proc-step-heading {
          color: #B91C1C;
        }

        .proc-step-curr-name {
          font-size: 13.5px;
          color: #2E1F14;
          font-weight: 800;
        }

        /* Progress Box */
        .proc-lbc-progress-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .proc-lbc-pb-top {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
        }

        .proc-lbc-pb-lbl {
          font-weight: 700;
          color: #786C60;
          text-transform: uppercase;
        }

        .proc-lbc-pb-val {
          font-weight: 800;
          color: #D97706;
        }

        .proc-lbc-track {
          width: 100%;
          height: 6px;
          background: #EADBCE;
          border-radius: 6px;
          overflow: hidden;
        }

        .proc-lbc-fill {
          height: 100%;
          background: linear-gradient(90deg, #F59E0B 0%, #D97706 100%);
          border-radius: 6px;
          transition: width 0.3s ease;
        }

        .proc-lbc-fill.hold {
          background: #EF4444;
        }

        .proc-lbc-fill.done {
          background: #10B981;
        }

        /* Telemetry Grid */
        .proc-lbc-telemetry-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background: #FAF6ED;
          border: 1px solid #EADBCE;
          border-radius: 10px;
          padding: 8px 10px;
          text-align: center;
        }

        .proc-tele-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .proc-tele-lbl {
          font-size: 10px;
          font-weight: 700;
          color: #8C7E72;
          text-transform: uppercase;
        }

        .proc-tele-val {
          font-size: 13px;
          color: #2E1F14;
          font-weight: 800;
        }

        .proc-tele-fac {
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Sources */
        .proc-lbc-sources {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          font-size: 11px;
        }

        .proc-lbc-src-lbl {
          color: #786C60;
          font-weight: 600;
        }

        .proc-lbc-src-chips {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-wrap: wrap;
        }

        .proc-lbc-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: 'JetBrains Mono', monospace;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          padding: 2px 6px;
          border-radius: 6px;
          color: #92400E;
          font-weight: 700;
          font-size: 10.5px;
        }

        .proc-lbc-more {
          color: #8C7E72;
          font-size: 10.5px;
        }

        /* Action Buttons */
        .proc-lbc-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          border-top: 1px solid #F1ECE1;
          padding-top: 12px;
          margin-top: 2px;
        }

        .proc-lbc-record-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 38px;
          font-size: 12.5px;
          font-weight: 700;
          border-radius: 10px;
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
          color: #FFFFFF;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .proc-lbc-record-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #B45309 0%, #92400E 100%);
        }

        .proc-lbc-record-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .proc-lbc-hold-btn,
        .proc-lbc-resume-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 38px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 700;
          border-radius: 10px;
          border: 1.5px solid #D6CEBE;
          background: #FFFFFF;
          color: #4A3B32;
          cursor: pointer;
        }

        .proc-lbc-resume-btn {
          background: #ECFDF5;
          border-color: #A7F3D0;
          color: #047857;
        }

        .proc-lbc-detail-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: #D97706;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          padding: 6px;
        }

        .proc-lbc-detail-link:hover {
          color: #B45309;
        }

        /* Empty state */
        .proc-empty-floor {
          padding: 40px 24px;
          background: #FFFDF8;
          border: 1.5px dashed #D6CEBE;
          border-radius: 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .proc-empty-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #FEF3C7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .proc-empty-title {
          font-size: 16px;
          font-weight: 800;
          color: #2E1F14;
          margin: 0;
        }

        .proc-empty-text {
          font-size: 13px;
          color: #6B5B4E;
          margin: 0;
          max-width: 400px;
        }

        .proc-empty-action-btn {
          margin-top: 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>
    </div>
  );
};
