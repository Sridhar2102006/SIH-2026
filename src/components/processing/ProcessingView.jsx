/**
 * SCREEN — MASTER HONEY PROCESSING WORKSPACE
 *
 * Dedicated Canonical Destination for Honey Extraction & Processing
 * Routes: /processing, /intake, /batches, /history
 *
 * Primary Purpose:
 * "What harvested honey material has reached me, what processing stage is it in,
 * what has been done to it, and is it ready for Quality?"
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Cpu,
  Layers,
  MessageSquare,
  Clock,
  Plus,
  Droplet,
  ShieldCheck,
  Send,
  AlertTriangle
} from 'lucide-react';
import { ProcessorIntakeView } from './ProcessorIntakeView';
import { ProcessorBatchesView } from './ProcessorBatchesView';
import { ProcessorLiveFloorView } from './ProcessorLiveFloorView';
import { ProcessorQualityHandoffView } from './ProcessorQualityHandoffView';
import { ProcessorHistoryView } from './ProcessorHistoryView';
import { IntakeVerificationModal } from './IntakeVerificationModal';
import { CreateProcessingBatchModal } from './CreateProcessingBatchModal';
import { ProcessorBatchDetailModal } from './ProcessorBatchDetailModal';
import { RecordProcessingStepModal } from './RecordProcessingStepModal';
import { BatchHoldModal } from './BatchHoldModal';
import { ProcessDeviationModal } from './ProcessDeviationModal';
import { ProcessingPlanModal } from './ProcessingPlanModal';
import { BATCH_STATUSES } from '../../services/processorDomainService';
import { ProcessingEngine } from '../../services/processingEngine';

export const ProcessingView = () => {
  const {
    activeTab,
    setActiveTab,
    handoverRecords = [],
    processingBatches = [],
    harvestRecords = [],
    acceptHarvestIntake,
    rejectHarvestIntake,
    holdHarvestIntake,
    createProcessingBatch,
    recordProcessingStep,
    skipProcessingStep,
    recordBatchDeviation,
    resolveBatchDeviation,
    updateBatchApprovedPlan,
    putBatchOnHold,
    resumeBatchFromHold,
    submitBatchToQuality,
    selectedProcessingBatchId,
    setSelectedProcessingBatchId,
    showToast
  } = useAppState();

  // Determine active view mode based on activeTab
  const [currentSection, setCurrentSection] = useState(() => {
    if (activeTab === 'intake') return 'INTAKE';
    if (activeTab === 'quality' || activeTab === 'quality-handoff') return 'QUALITY_HANDOFF';
    if (activeTab === 'batches') return 'BATCHES';
    if (activeTab === 'history') return 'HISTORY';
    return 'PROCESSING';
  });

  useEffect(() => {
    if (activeTab === 'intake') setCurrentSection('INTAKE');
    else if (activeTab === 'quality' || activeTab === 'quality-handoff') setCurrentSection('QUALITY_HANDOFF');
    else if (activeTab === 'batches') setCurrentSection('BATCHES');
    else if (activeTab === 'history') setCurrentSection('HISTORY');
    else if (activeTab === 'processing') setCurrentSection('PROCESSING');
  }, [activeTab]);

  // Modals state
  const [activeHandoverForVerify, setActiveHandoverForVerify] = useState(null);
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
  const [activeBatchForDetail, setActiveBatchForDetail] = useState(null);
  const [activeBatchForStep, setActiveBatchForStep] = useState(null);
  const [activeBatchForHold, setActiveBatchForHold] = useState(null);
  const [activeBatchForDeviation, setActiveBatchForDeviation] = useState(null);
  const [activeBatchForPlan, setActiveBatchForPlan] = useState(null);
  const [activeDeviationForResolution, setActiveDeviationForResolution] = useState(null);

  // Sync if selectedProcessingBatchId changes from context
  useEffect(() => {
    if (selectedProcessingBatchId) {
      const b = processingBatches.find(x => x.id === selectedProcessingBatchId);
      if (b) setActiveBatchForDetail(b);
    }
  }, [selectedProcessingBatchId, processingBatches]);

  // Counts for pills
  const isAwaitingStatus = (status) => (
    status === 'SUBMITTED_TO_PROCESSOR' ||
    status === 'SUBMITTED_BY_BEEKEEPER' ||
    status === 'AWAITING_INTAKE' ||
    status === 'HARVESTED' ||
    !status
  );
  const awaitingIntakesCount = handoverRecords.filter(h => isAwaitingStatus(h.status)).length +
    (harvestRecords || []).filter(hrv => !(handoverRecords || []).some(h => (hrv.id && h.harvestRecordId === hrv.id) || h.id === hrv.id)).length;
  const inProcessingCount = processingBatches.filter(b => b.status === BATCH_STATUSES.IN_PROCESSING).length;
  const onHoldCount = processingBatches.filter(b => b.status === BATCH_STATUSES.ON_HOLD).length;
  const readyForQualityCount = processingBatches.filter(b => {
    if (b.status === BATCH_STATUSES.SUBMITTED_TO_QUALITY) return false;
    const readiness = ProcessingEngine.validateQualityReadiness(b);
    return readiness.allowed;
  }).length;
  const certifiedBatchesCount = processingBatches.filter(b => b.status === BATCH_STATUSES.QUALITY_PASSED || b.labReport || b.coaDocumentId).length;

  return (
    <div className="processing-workspace-container">
      {/* 1. Processing Sub-Navigation Header */}
      <div className="proc-subnav-bar">
        <button
          className={`proc-subnav-tab ${currentSection === 'INTAKE' ? 'active' : ''}`}
          onClick={() => {
            setCurrentSection('INTAKE');
            if (activeTab !== 'intake') setActiveTab('intake');
          }}
        >
          <div className="proc-wa-icon-wrapper">
            <MessageSquare size={16} />
            {awaitingIntakesCount > 0 && (
              <span className="proc-wa-badge">{awaitingIntakesCount}</span>
            )}
          </div>
          <span>Intake</span>
        </button>

        <button
          className={`proc-subnav-tab ${currentSection === 'PROCESSING' ? 'active' : ''}`}
          onClick={() => {
            setCurrentSection('PROCESSING');
            if (activeTab !== 'processing') setActiveTab('processing');
          }}
        >
          <Cpu size={15} />
          <span>Processing</span>
          {inProcessingCount > 0 && (
            <span className="proc-tab-badge blue">{inProcessingCount}</span>
          )}
        </button>

        <button
          className={`proc-subnav-tab ${currentSection === 'QUALITY_HANDOFF' ? 'active' : ''}`}
          onClick={() => {
            setCurrentSection('QUALITY_HANDOFF');
            if (activeTab !== 'quality') setActiveTab('quality');
          }}
        >
          <div className="proc-wa-icon-wrapper">
            <Send size={15} />
            {readyForQualityCount > 0 && (
              <span className="proc-tab-badge green" title="Ready to submit to Lab">{readyForQualityCount}</span>
            )}
            {certifiedBatchesCount > 0 && (
              <span className="proc-tab-badge blue" title={`${certifiedBatchesCount} Lab CoA Certificates Received`} style={{ backgroundColor: '#059669', color: '#FFFFFF' }}>
                {certifiedBatchesCount} CoA
              </span>
            )}
          </div>
          <span>Quality & Lab CoA</span>
        </button>

        <button
          className={`proc-subnav-tab ${currentSection === 'BATCHES' ? 'active' : ''}`}
          onClick={() => {
            setCurrentSection('BATCHES');
            if (activeTab !== 'batches') setActiveTab('batches');
          }}
        >
          <Layers size={15} />
          <span>All Batches</span>
          <span className="proc-tab-badge gray">{processingBatches.length}</span>
        </button>

        <button
          className={`proc-subnav-tab ${currentSection === 'HISTORY' ? 'active' : ''}`}
          onClick={() => {
            setCurrentSection('HISTORY');
            if (activeTab !== 'history') setActiveTab('history');
          }}
        >
          <Clock size={15} />
          <span>Audit Log</span>
        </button>
      </div>

      {/* 2. Main Section Content */}
      <div className="proc-workspace-main">
        {currentSection === 'INTAKE' && (
          <ProcessorIntakeView
            onOpenVerification={(handover) => setActiveHandoverForVerify(handover)}
            onOpenCreateBatch={() => setIsCreateBatchModalOpen(true)}
          />
        )}

        {currentSection === 'PROCESSING' && (
          <ProcessorLiveFloorView
            onSelectBatch={(batch) => setActiveBatchForDetail(batch)}
            onOpenCreateBatch={() => setIsCreateBatchModalOpen(true)}
            onOpenRecordStep={(batch) => setActiveBatchForStep(batch)}
            onOpenHoldModal={(batch) => setActiveBatchForHold(batch)}
            onResumeFromHold={(payload) => resumeBatchFromHold(payload)}
          />
        )}

        {currentSection === 'QUALITY_HANDOFF' && (
          <ProcessorQualityHandoffView
            onSelectBatch={(batch) => setActiveBatchForDetail(batch)}
            onSubmitToQuality={submitBatchToQuality}
            onOpenRecordStep={(batch) => setActiveBatchForStep(batch)}
            onResolveDeviation={resolveBatchDeviation}
          />
        )}

        {currentSection === 'BATCHES' && (
          <ProcessorBatchesView
            onSelectBatch={(batch) => setActiveBatchForDetail(batch)}
            onOpenCreateBatch={() => setIsCreateBatchModalOpen(true)}
            onSubmitToQuality={(batchId) => submitBatchToQuality({ batchId })}
          />
        )}

        {currentSection === 'HISTORY' && (
          <ProcessorHistoryView />
        )}
      </div>

      {/* 3. Operational Modals */}
      {/* Modal A: Intake Verification */}
      <IntakeVerificationModal
        isOpen={Boolean(activeHandoverForVerify)}
        handover={activeHandoverForVerify}
        onClose={() => setActiveHandoverForVerify(null)}
        onAccept={acceptHarvestIntake}
        onHold={holdHarvestIntake}
        onReject={rejectHarvestIntake}
      />

      {/* Modal B: Create Processing Batch */}
      <CreateProcessingBatchModal
        isOpen={isCreateBatchModalOpen}
        onClose={() => setIsCreateBatchModalOpen(false)}
        handoverRecords={handoverRecords}
        processingBatches={processingBatches}
        onCreateBatch={createProcessingBatch}
      />

      {/* Modal C: Processing Batch Detail (Steps, Source Lineage, Holds, Quality Handover) */}
      <ProcessorBatchDetailModal
        isOpen={Boolean(activeBatchForDetail)}
        batch={activeBatchForDetail}
        allHarvestRecords={harvestRecords}
        onClose={() => {
          setActiveBatchForDetail(null);
          if (setSelectedProcessingBatchId) setSelectedProcessingBatchId(null);
        }}
        onOpenRecordStep={(b) => setActiveBatchForStep(b)}
        onOpenHoldModal={(b) => setActiveBatchForHold(b)}
        onOpenDeviationModal={(b) => setActiveBatchForDeviation(b)}
        onOpenPlanModal={(b) => setActiveBatchForPlan(b)}
        onResolveDeviation={(payload) => {
          const res = resolveBatchDeviation(payload);
          if (res?.success && activeBatchForDetail?.id === payload.batchId) {
            setActiveBatchForDetail(res.batch);
          }
          return res;
        }}
        onSkipStep={(payload) => {
          const res = skipProcessingStep(payload);
          if (res?.success && activeBatchForDetail?.id === payload.batchId) {
            setActiveBatchForDetail(res.batch);
          }
          return res;
        }}
        onSubmitToQuality={submitBatchToQuality}
      />

      {/* Modal D: Record Processing Step */}
      <RecordProcessingStepModal
        isOpen={Boolean(activeBatchForStep)}
        batch={activeBatchForStep}
        onClose={() => setActiveBatchForStep(null)}
        onRecordStep={(payload) => {
          const res = recordProcessingStep(payload);
          if (res?.success && activeBatchForDetail?.id === payload.batchId) {
            setActiveBatchForDetail(res.batch);
          }
          return res;
        }}
      />

      {/* Modal E: Place / Resume Hold */}
      <BatchHoldModal
        isOpen={Boolean(activeBatchForHold)}
        batch={activeBatchForHold}
        onClose={() => setActiveBatchForHold(null)}
        onPutOnHold={(payload) => {
          const res = putBatchOnHold(payload);
          if (res?.success && activeBatchForDetail?.id === payload.batchId) {
            setActiveBatchForDetail(res.batch);
          }
          return res;
        }}
        onResumeFromHold={(payload) => {
          const res = resumeBatchFromHold(payload);
          if (res?.success && activeBatchForDetail?.id === payload.batchId) {
            setActiveBatchForDetail(res.batch);
          }
          return res;
        }}
      />

      {/* Modal F: Process Deviation Logger & Reviewer */}
      <ProcessDeviationModal
        isOpen={Boolean(activeBatchForDeviation)}
        batch={activeBatchForDeviation}
        deviation={activeDeviationForResolution}
        onClose={() => {
          setActiveBatchForDeviation(null);
          setActiveDeviationForResolution(null);
        }}
        onSaveDeviation={(payload) => {
          const res = recordBatchDeviation(payload);
          if (res?.success && activeBatchForDetail?.id === payload.batchId) {
            setActiveBatchForDetail(res.batch);
          }
          return res;
        }}
        onResolveDeviation={(payload) => {
          const res = resolveBatchDeviation(payload);
          if (res?.success && activeBatchForDetail?.id === payload.batchId) {
            setActiveBatchForDetail(res.batch);
          }
          return res;
        }}
      />

      {/* Modal G: Processing Plan Reviewer & Approval */}
      <ProcessingPlanModal
        isOpen={Boolean(activeBatchForPlan)}
        batch={activeBatchForPlan}
        onClose={() => setActiveBatchForPlan(null)}
        onUpdateApprovedPlan={(payload) => {
          const res = updateBatchApprovedPlan(payload);
          if (res?.success && activeBatchForDetail?.id === payload.batchId) {
            setActiveBatchForDetail(res.batch);
          }
          return res;
        }}
      />

      <style>{`
        .processing-workspace-container {
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }

        .proc-subnav-bar {
          display: flex;
          background: #FFFDF8;
          border-bottom: 1px solid var(--color-divider, #E5DCCB);
          padding: 6px 12px;
          gap: 6px;
          overflow-x: auto;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .proc-subnav-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: none;
          color: var(--color-warm-gray, #736961);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .proc-subnav-tab:hover {
          background: rgba(0, 0, 0, 0.03);
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-subnav-tab.active {
          background: #FFFFFF;
          border-color: var(--color-divider, #E5DCCB);
          color: var(--color-deep-cocoa, #2C1810);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .proc-tab-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 10px;
        }

        .proc-tab-badge.amber {
          background: #FEF3C7;
          color: #B45309;
        }

        .proc-tab-badge.blue {
          background: #EFF6FF;
          color: #1D4ED8;
        }

        .proc-tab-badge.gray {
          background: #F3F4F6;
          color: #4B5563;
        }

        .proc-wa-icon-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .proc-wa-badge {
          position: absolute;
          top: -7px;
          right: -9px;
          background: #25D366;
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 800;
          min-width: 17px;
          height: 17px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #FFFFFF;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
          line-height: 1;
        }

        .proc-workspace-main {
          flex: 1;
        }
      `}</style>
    </div>
  );
};
