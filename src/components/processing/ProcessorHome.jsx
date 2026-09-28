import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  MessageSquare,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Send,
  Droplet,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Factory,
  Package,
  Sliders,
  Settings2,
  AlertCircle
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { INTAKE_STATUSES, BATCH_STATUSES } from '../../services/processorDomainService';
import { ProcessorProfileService } from '../../services/processorProfileService';
import { ProcessorSetupScreen } from '../onboarding/ProcessorSetupScreen';
import { CommonProcessorOnboarding } from '../onboarding/CommonProcessorOnboarding';

export const ProcessorHome = ({
  onNavigateToIntake,
  onNavigateToBatches,
  onOpenCreateBatch,
  onOpenBatchDetail
}) => {
  const {
    session,
    handoverRecords = [],
    harvestRecords = [],
    processingBatches = [],
    setActiveTab,
    showToast
  } = useAppState();

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [setupModalMode, setSetupModalMode] = useState('SIMPLE');

  const operatorName = session?.name || 'Marcus K.';

  // Facility & Organization Context (§8, §16, §17)
  const activeOrg = ProcessorProfileService.getActiveOrganization();
  const activeFacility = ProcessorProfileService.getActiveFacility();
  const activeSOP = ProcessorProfileService.getActiveSOP();

  // Metrics according to §43: Receiving, Processing, Quality handoff, Packaging, Exceptions
  const isAwaitingStatus = (status) => (
    status === 'SUBMITTED_TO_PROCESSOR' ||
    status === INTAKE_STATUSES.SUBMITTED_TO_PROCESSOR ||
    status === 'SUBMITTED_BY_BEEKEEPER' ||
    status === INTAKE_STATUSES.SUBMITTED_BY_BEEKEEPER ||
    status === 'AWAITING_INTAKE' ||
    status === INTAKE_STATUSES.AWAITING_INTAKE ||
    status === 'HARVESTED' ||
    !status
  );
  const pendingIntakes = [
    ...handoverRecords.filter(h => isAwaitingStatus(h.status)),
    ...(harvestRecords || []).filter(hrv => !handoverRecords.some(h => (hrv.id && h.harvestRecordId === hrv.id) || h.id === hrv.id))
  ];
  const inProcessingBatches = processingBatches.filter(b => b.status === BATCH_STATUSES.IN_PROCESSING);
  const onHoldBatches = processingBatches.filter(b => b.status === BATCH_STATUSES.ON_HOLD);
  const readyForQualityBatches = processingBatches.filter(b => b.status === BATCH_STATUSES.READY_FOR_QUALITY || b.status === BATCH_STATUSES.PROCESSING_COMPLETE);
  const certifiedBatches = processingBatches.filter(b => b.status === BATCH_STATUSES.QUALITY_PASSED || b.labReport || b.coaDocumentId);
  const packagingReadyBatches = processingBatches.filter(b => b.status === BATCH_STATUSES.READY_FOR_QUALITY || b.status === BATCH_STATUSES.PROCESSING_COMPLETE || b.status === 'READY_FOR_PACKAGING');

  // Exceptions count: on-hold batches + batches with unresolved deviations + on-hold intakes
  const batchesWithDeviations = processingBatches.filter(b => b.deviations && b.deviations.length > 0 && b.deviations.some(d => d.disposition === 'HOLD' || !d.disposition));
  const heldIntakes = handoverRecords.filter(h => h.status === INTAKE_STATUSES.ON_HOLD);
  const totalExceptionsCount = onHoldBatches.length + batchesWithDeviations.length + heldIntakes.length;

  return (
    <div className="proc-home-container">
      {/* 1. Header Greeting & Organization Context (§8, §43) */}
      <div className="proc-home-header card">
        <div className="proc-hh-top">
          <div className="proc-facility-tag">
            <Factory size={14} color="#D97706" />
            <span>{activeFacility?.name || 'Central Facility #2'}</span>
          </div>
          <button
            type="button"
            className="proc-config-btn"
            onClick={() => setIsSetupModalOpen(true)}
            title="Configure Organization, Facility, Equipment & SOP"
          >
            <Settings2 size={14} />
            <span>Facility & SOP</span>
          </button>
        </div>

        <h1 className="proc-hh-greeting">
          Good morning, {operatorName}
        </h1>
        <p className="proc-hh-sub">
          {activeOrg?.name || 'HoneyChain Processor Network'} · SOP: <code>{activeSOP?.version || 'v2.1'}</code>
        </p>

        {/* 2. Today's Work Hierarchy (§43) */}
        <div className="proc-todays-work-header">
          <span className="proc-tw-label">Today's Work</span>
        </div>

        <div className="proc-attention-grid-5">
          {/* A. Receiving */}
          <div
            className={`proc-att-card ${pendingIntakes.length > 0 ? 'alert' : ''}`}
            onClick={() => {
              if (onNavigateToIntake) onNavigateToIntake();
              else setActiveTab('intake');
            }}
          >
            <div className="proc-att-top">
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <MessageSquare size={18} color="#D97706" />
                {pendingIntakes.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    background: '#25D366',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 800,
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    border: '1.5px solid #FFFFFF',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    lineHeight: 1
                  }}>
                    {pendingIntakes.length}
                  </span>
                )}
              </div>
              <span className="proc-att-count">{pendingIntakes.length}</span>
            </div>
            <span className="proc-att-lbl">Receiving</span>
            <span className="proc-att-sub">{pendingIntakes.length} awaiting</span>
          </div>

          {/* B. Processing */}
          <div
            className="proc-att-card"
            onClick={() => {
              if (onNavigateToBatches) onNavigateToBatches('IN_PROCESSING');
              else setActiveTab('batches');
            }}
          >
            <div className="proc-att-top">
              <Cpu size={17} color="#2563EB" />
              <span className="proc-att-count">{inProcessingBatches.length}</span>
            </div>
            <span className="proc-att-lbl">Processing</span>
            <span className="proc-att-sub">{inProcessingBatches.length} active</span>
          </div>

          {/* C. Quality Handoff */}
          <div
            className={`proc-att-card ${readyForQualityBatches.length > 0 ? 'success' : ''}`}
            onClick={() => {
              setActiveTab('quality');
            }}
          >
            <div className="proc-att-top">
              <Send size={17} color="#059669" />
              <span className="proc-att-count">{readyForQualityBatches.length}</span>
            </div>
            <span className="proc-att-lbl">Quality Handoff</span>
            <span className="proc-att-sub">{readyForQualityBatches.length} pending</span>
          </div>

          {/* D. Certified CoA Received */}
          <div
            className="proc-att-card"
            style={{ borderColor: certifiedBatches.length > 0 ? '#86EFAC' : undefined }}
            onClick={() => {
              if (onNavigateToBatches) onNavigateToBatches('QUALITY_PASSED');
              else setActiveTab('batches');
            }}
          >
            <div className="proc-att-top">
              <ShieldCheck size={17} color="#059669" />
              <span className="proc-att-count" style={{ color: '#059669' }}>{certifiedBatches.length}</span>
            </div>
            <span className="proc-att-lbl">Certified & CoA</span>
            <span className="proc-att-sub">{certifiedBatches.length} reports received</span>
          </div>

          {/* E. Exceptions */}
          <div
            className={`proc-att-card ${totalExceptionsCount > 0 ? 'warning' : ''}`}
            onClick={() => {
              if (onNavigateToBatches) onNavigateToBatches('ON_HOLD');
              else setActiveTab('batches');
            }}
          >
            <div className="proc-att-top">
              <AlertTriangle size={17} color={totalExceptionsCount > 0 ? '#DC2626' : 'var(--color-warm-gray)'} />
              <span className="proc-att-count">{totalExceptionsCount}</span>
            </div>
            <span className="proc-att-lbl">Exceptions</span>
            <span className="proc-att-sub">{totalExceptionsCount} require attention</span>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Bar (Section 26) */}
      <div className="proc-section">
        <h3 className="proc-sec-title">Quick Operational Actions</h3>
        <div className="proc-qa-grid">
          <button
            className="card proc-qa-btn"
            onClick={() => {
              if (onNavigateToIntake) onNavigateToIntake();
              else setActiveTab('intake');
            }}
          >
            <div className="proc-qa-icon inbox">
              <MessageSquare size={20} />
            </div>
            <div className="proc-qa-text">
              <strong>Review Intake</strong>
              <span>Verify incoming harvests</span>
            </div>
            <ChevronRight size={16} className="proc-qa-arr" />
          </button>

          <button
            className="card proc-qa-btn"
            onClick={() => {
              if (onOpenCreateBatch) onOpenCreateBatch();
            }}
          >
            <div className="proc-qa-icon batch">
              <Plus size={20} />
            </div>
            <div className="proc-qa-text">
              <strong>Create Processing Batch</strong>
              <span>Combine source units</span>
            </div>
            <ChevronRight size={16} className="proc-qa-arr" />
          </button>

          <button
            className="card proc-qa-btn"
            onClick={() => {
              if (onNavigateToBatches) onNavigateToBatches();
              else setActiveTab('batches');
            }}
          >
            <div className="proc-qa-icon list">
              <Layers size={20} />
            </div>
            <div className="proc-qa-text">
              <strong>Active Batches</strong>
              <span>Manage extraction steps</span>
            </div>
            <ChevronRight size={16} className="proc-qa-arr" />
          </button>
        </div>
      </div>

      {/* 4. Incoming Harvest Intake Queue Preview */}
      {pendingIntakes.length > 0 && (
        <div className="proc-section">
          <div className="proc-sec-header">
            <h3 className="proc-sec-title">Incoming Harvests Awaiting Intake ({pendingIntakes.length})</h3>
            <button
              className="proc-view-all-link"
              onClick={() => {
                if (onNavigateToIntake) onNavigateToIntake();
                else setActiveTab('intake');
              }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="proc-intake-preview-list">
            {pendingIntakes.slice(0, 3).map(h => (
              <div
                key={h.id}
                className="card proc-intake-prev-card"
                onClick={() => {
                  if (onNavigateToIntake) onNavigateToIntake(h);
                  else setActiveTab('intake');
                }}
              >
                <div className="proc-ipc-left">
                  <div className="proc-ipc-code-row">
                    <Droplet size={14} color="var(--color-primary-honey, #D97706)" />
                    <strong className="proc-ipc-code">{h.traceabilityCode}</strong>
                    <span className="proc-ipc-type">{h.honeyType}</span>
                  </div>
                  <span className="proc-ipc-sub">
                    From {h.apiaryCode} · {h.hiveCode} · {h.frameNumber} (Harvested {h.submissionTimestamp})
                  </span>
                </div>
                <div className="proc-ipc-right">
                  <span className="proc-ipc-qty">{h.quantityKg} kg</span>
                  <span className="proc-btn-sm-review">Verify →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. In-Progress Batches Preview */}
      <div className="proc-section">
        <div className="proc-sec-header">
          <h3 className="proc-sec-title">Active Batches in Production ({processingBatches.length})</h3>
          <button
            className="proc-view-all-link"
            onClick={() => {
              if (onNavigateToBatches) onNavigateToBatches();
              else setActiveTab('batches');
            }}
          >
            <span>All Batches</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="proc-batches-preview-grid">
          {processingBatches.slice(0, 3).map(batch => {
            const totalSteps = batch.approvedPlan?.steps?.length || batch.steps?.length || 5;
            const completedSteps = (batch.steps || []).filter(s => s.status === 'COMPLETED').length || (batch.steps?.length || 0);
            const progressPct = Math.min(100, Math.round((completedSteps / totalSteps) * 100));
            const currentStepName = batch.approvedPlan?.steps?.[completedSteps]?.name || batch.currentStep || 'Processing';
            const hasDeviation = batch.deviations && batch.deviations.length > 0;
            const hasUnresolvedDeviation = hasDeviation && batch.deviations.some(d => d.disposition === 'HOLD' || !d.disposition);

            return (
              <div
                key={batch.id}
                className="card proc-batch-prev-card"
                onClick={() => {
                  if (onOpenBatchDetail) onOpenBatchDetail(batch);
                }}
              >
                <div className="proc-bpc-header">
                  <div>
                    <h4 className="proc-bpc-num">{batch.batchNumber}</h4>
                    <span className="proc-bpc-name">{batch.name}</span>
                  </div>
                  <div className="proc-bpc-badge-col">
                    <StatusBadge
                      status={batch.status === BATCH_STATUSES.ON_HOLD ? 'attention' : 'healthy'}
                      label={batch.statusLabel || batch.status}
                      size="small"
                    />
                    {hasDeviation && (
                      <span className={`proc-bpc-dev-alert ${hasUnresolvedDeviation ? 'unresolved' : 'resolved'}`}>
                        <AlertTriangle size={11} />
                        <span>{batch.deviations.length} Dev</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Dynamic Progress Bar */}
                <div className="proc-bpc-progress-wrap">
                  <div className="proc-bpc-prog-info">
                    <span className="proc-bpc-prog-step">Step {completedSteps}/{totalSteps}: {currentStepName}</span>
                    <span className="proc-bpc-prog-pct">{progressPct}%</span>
                  </div>
                  <div className="proc-bpc-prog-bar">
                    <div className="proc-bpc-prog-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>

                <div className="proc-bpc-stats">
                  <div className="proc-bpc-stat">
                    <span className="proc-bpc-lbl">Batch Weight</span>
                    <span className="proc-bpc-val">{batch.finalYieldKg || batch.weightKg} kg</span>
                  </div>
                  <div className="proc-bpc-stat">
                    <span className="proc-bpc-lbl">Source Lineage</span>
                    <span className="proc-bpc-val">{batch.sourceHarvests?.length || 0} Frames</span>
                  </div>
                  <div className="proc-bpc-stat">
                    <span className="proc-bpc-lbl">SOP Version</span>
                    <span className="proc-bpc-val">{batch.sopVersion || 'v2.1'}</span>
                  </div>
                </div>

                <div className="proc-bpc-footer">
                  <span className="proc-bpc-facility">{batch.facility}</span>
                  <span className="proc-bpc-action">View Workspace →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Facility & Equipment Setup Modal (§8, §9, §17, §28, §49) */}
      {isSetupModalOpen && (
        <div className="proc-modal-backdrop" onClick={() => setIsSetupModalOpen(false)}>
          <div className="proc-modal-fullscreen" onClick={e => e.stopPropagation()} style={{ position: 'relative', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 18px 0' }}>
              <button
                type="button"
                className="close-sheet-icon-btn"
                onClick={() => setIsSetupModalOpen(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
            {setupModalMode === 'SIMPLE' ? (
              <CommonProcessorOnboarding
                onComplete={(data) => {
                  setIsSetupModalOpen(false);
                  showToast('Processor setup successfully updated');
                }}
                onCancel={() => setIsSetupModalOpen(false)}
                onSwitchToAdvanced={() => setSetupModalMode('ADVANCED')}
              />
            ) : (
              <div>
                <div style={{ padding: '8px 20px', borderBottom: '1px solid #EBDCC6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Advanced Technical Configuration</span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#D97706', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => setSetupModalMode('SIMPLE')}
                  >
                    ← Back to Simple Setup
                  </button>
                </div>
                <ProcessorSetupScreen
                  onComplete={(data) => {
                    setIsSetupModalOpen(false);
                    showToast(`Facility ${data.facility?.name || ''} successfully updated`);
                  }}
                  onCancel={() => setIsSetupModalOpen(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .proc-home-container {
          padding: 16px var(--mobile-pad, 16px) 80px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .proc-home-header {
          padding: 20px;
          background: #FFFDF8;
          border: 1px solid var(--color-divider, #E5DCCB);
        }

        .proc-hh-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .proc-hh-greeting {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
          margin: 0;
        }

        .proc-hh-sub {
          font-size: 13px;
          color: var(--color-warm-gray, #736961);
          margin: 4px 0 16px;
        }

        .proc-facility-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FEF3C7;
          border: 1px solid #FCD34D;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #92400E;
        }

        .proc-config-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FAF5EA;
          border: 1px solid #E5DCCB;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #2C1810);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .proc-config-btn:hover {
          background: #F3EBD9;
          border-color: #D97706;
        }

        .proc-todays-work-header {
          margin: 14px 0 8px;
        }

        .proc-tw-label {
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--color-warm-gray, #736961);
        }

        .proc-attention-grid-5 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        @media (min-width: 600px) {
          .proc-attention-grid-5 {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        .proc-attention-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        @media (min-width: 600px) {
          .proc-attention-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .proc-bpc-badge-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .proc-bpc-dev-alert {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .proc-bpc-dev-alert.unresolved {
          background: #FEE2E2;
          color: #DC2626;
          border: 1px solid #FCA5A5;
        }

        .proc-bpc-dev-alert.resolved {
          background: #FEF3C7;
          color: #D97706;
          border: 1px solid #FDE68A;
        }

        .proc-bpc-progress-wrap {
          margin: 10px 0 12px;
          background: #FAF7F0;
          border: 1px solid #EAE0CE;
          border-radius: 8px;
          padding: 8px 10px;
        }

        .proc-bpc-prog-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .proc-bpc-prog-step {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-bpc-prog-pct {
          font-size: 11px;
          font-weight: 700;
          color: #D97706;
        }

        .proc-bpc-prog-bar {
          height: 6px;
          background: #E8DCC8;
          border-radius: 999px;
          overflow: hidden;
        }

        .proc-bpc-prog-fill {
          height: 100%;
          background: linear-gradient(90deg, #D97706, #059669);
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        .proc-modal-fullscreen {
          width: 100%;
          max-width: 800px;
          max-height: 94vh;
          overflow-y: auto;
          background: #FFF;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
        }

        .proc-att-card {
          background: #FFFFFF;
          border: 1px solid var(--color-divider, #E5DCCB);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .proc-att-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(44, 24, 16, 0.06);
        }

        .proc-att-card.alert {
          border-color: #FCD34D;
          background: #FFFBEB;
        }

        .proc-att-card.warning {
          border-color: #FCA5A5;
          background: #FEF2F2;
        }

        .proc-att-card.success {
          border-color: #A7F3D0;
          background: #ECFDF5;
        }

        .proc-att-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .proc-att-count {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-att-lbl {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
          margin-top: 6px;
        }

        .proc-att-sub {
          font-size: 11px;
          color: var(--color-warm-gray, #736961);
        }

        .proc-sec-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
          margin: 0 0 10px;
        }

        .proc-sec-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .proc-view-all-link {
          background: none;
          border: none;
          color: var(--color-primary-honey, #D97706);
          font-size: 12.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        .proc-qa-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        @media (min-width: 600px) {
          .proc-qa-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .proc-qa-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: #FFFFFF;
          border: 1px solid var(--color-divider, #E5DCCB);
          border-radius: 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .proc-qa-btn:hover {
          border-color: var(--color-primary-honey, #D97706);
          background: #FFFDF8;
        }

        .proc-qa-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .proc-qa-icon.inbox {
          background: #FEF3C7;
          color: #B45309;
        }

        .proc-qa-icon.batch {
          background: #EFF6FF;
          color: #2563EB;
        }

        .proc-qa-icon.list {
          background: #F3F4F6;
          color: #4B5563;
        }

        .proc-qa-text {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .proc-qa-text strong {
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-qa-text span {
          font-size: 11px;
          color: var(--color-warm-gray, #736961);
        }

        .proc-qa-arr {
          color: var(--color-warm-gray, #736961);
        }

        .proc-intake-preview-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .proc-intake-prev-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          background: #FFFFFF;
          border: 1px solid var(--color-divider, #E5DCCB);
          border-radius: 10px;
          cursor: pointer;
        }

        .proc-intake-prev-card:hover {
          background: #FFFDF8;
          border-color: #E2D3B8;
        }

        .proc-ipc-left {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .proc-ipc-code-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .proc-ipc-code {
          font-family: monospace;
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-ipc-type {
          font-size: 11px;
          background: #FEF3C7;
          color: #8C5311;
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 600;
        }

        .proc-ipc-sub {
          font-size: 11.5px;
          color: var(--color-warm-gray, #736961);
        }

        .proc-ipc-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .proc-ipc-qty {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-btn-sm-review {
          font-size: 11.5px;
          color: var(--color-primary-honey, #D97706);
          font-weight: 600;
        }

        .proc-batches-preview-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 600px) {
          .proc-batches-preview-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .proc-batch-prev-card {
          padding: 14px;
          background: #FFFFFF;
          border: 1px solid var(--color-divider, #E5DCCB);
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .proc-batch-prev-card:hover {
          border-color: var(--color-primary-honey, #D97706);
          box-shadow: 0 4px 12px rgba(44, 24, 16, 0.05);
        }

        .proc-bpc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .proc-bpc-num {
          font-family: monospace;
          font-size: 15px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
          margin: 0;
        }

        .proc-bpc-name {
          font-size: 12px;
          color: var(--color-warm-gray, #736961);
        }

        .proc-bpc-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background: #F9FAFB;
          padding: 8px;
          border-radius: 8px;
          text-align: center;
        }

        .proc-bpc-stat {
          display: flex;
          flex-direction: column;
        }

        .proc-bpc-lbl {
          font-size: 10px;
          color: var(--color-warm-gray, #736961);
          text-transform: uppercase;
        }

        .proc-bpc-val {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-bpc-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11.5px;
          border-top: 1px solid #F3F4F6;
          padding-top: 8px;
        }

        .proc-bpc-facility {
          color: var(--color-warm-gray, #736961);
        }

        .proc-bpc-action {
          color: var(--color-primary-honey, #D97706);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
