/**
 * SCREEN — PROCESSOR QUALITY HANDOFF GATEWAY
 * 
 * Dedicated view for Quality Handover verification, pre-flight readiness,
 * and transmission of finished honey batches to the Certified Testing Laboratory.
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FlaskConical,
  FileText,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Lock,
  Sparkles,
  QrCode,
  Droplet
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { BATCH_STATUSES, BATCH_STATUS_LABELS } from '../../services/processorDomainService';
import { ProcessingEngine } from '../../services/processingEngine';
import { LabReportModal } from '../lab/LabReportModal';

export const ProcessorQualityHandoffView = ({
  onSelectBatch,
  onSubmitToQuality,
  onOpenRecordStep,
  onResolveDeviation
}) => {
  const {
    processingBatches = [],
    labSamples = [],
    setActiveTab,
    setRole,
    showToast
  } = useAppState();

  const [handoverNotes, setHandoverNotes] = useState({});
  const [submittingBatchId, setSubmittingBatchId] = useState(null);
  const [selectedBatchForReport, setSelectedBatchForReport] = useState(null);

  // Categorize batches
  const batchesWithReadiness = processingBatches.map(b => {
    const readiness = ProcessingEngine.validateQualityReadiness(b, { allowAutoDisposition: true });
    const completedSteps = (b.steps || []).filter(s => s.status === 'COMPLETED').length;
    const planSteps = Array.isArray(b.approvedPlan) ? b.approvedPlan : (b.approvedPlan?.steps || []);
    const linkedSample = labSamples.find(s => s.sourceBatchNumber === b.batchNumber || s.sourceBatchId === b.id || s.batchNumber === b.batchNumber);
    return {
      batch: b,
      readiness,
      completedSteps,
      totalPlanSteps: planSteps.length,
      linkedSample
    };
  });

  const certifiedBatches = batchesWithReadiness.filter(item =>
    item.batch.status === BATCH_STATUSES.QUALITY_PASSED || item.batch.labReport || item.batch.coaDocumentId
  );

  const readyBatches = batchesWithReadiness.filter(item => 
    item.batch.status !== BATCH_STATUSES.SUBMITTED_TO_QUALITY &&
    item.batch.status !== BATCH_STATUSES.QUALITY_PASSED &&
    !item.batch.labReport &&
    !item.batch.coaDocumentId &&
    item.readiness.allowed
  );

  const submittedBatches = batchesWithReadiness.filter(item => 
    item.batch.status === BATCH_STATUSES.SUBMITTED_TO_QUALITY &&
    item.batch.status !== BATCH_STATUSES.QUALITY_PASSED &&
    !item.batch.labReport &&
    !item.batch.coaDocumentId
  );

  const inProgressBatches = batchesWithReadiness.filter(item => 
    item.batch.status !== BATCH_STATUSES.SUBMITTED_TO_QUALITY &&
    item.batch.status !== BATCH_STATUSES.QUALITY_PASSED &&
    !item.batch.labReport &&
    !item.batch.coaDocumentId &&
    !item.readiness.allowed
  );

  const handleNotesChange = (batchId, text) => {
    setHandoverNotes(prev => ({ ...prev, [batchId]: text }));
  };

  const handleSubmit = (batchId) => {
    if (!onSubmitToQuality) return;
    setSubmittingBatchId(batchId);
    const notes = handoverNotes[batchId] || '';
    const res = onSubmitToQuality({ batchId, notes });
    setSubmittingBatchId(null);
    if (res?.success) {
      if (showToast) showToast(`Batch successfully transferred to Lab Intake Queue!`);
    }
  };

  return (
    <div className="proc-quality-handoff-container" style={{ padding: '0 0 40px 0' }}>
      {/* 1. Header Banner */}
      <div 
        className="card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #064E3B 0%, #047857 60%, #059669 100%)',
          color: '#FFFFFF',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(4, 120, 87, 0.16)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.16)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
              <ShieldCheck size={14} />
              <span>Certified Analytical Gateway</span>
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>
              Quality Handoff & Lab Transmission Station
            </h2>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#D1FAE5', maxWidth: '640px', lineHeight: 1.5 }}>
              Handover settled honey batches to the Certified Testing Laboratory for moisture refractometry, HMF spectrophotometry, C4 sugar IRMS screening, and official FSSAI regulatory compliance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.12)', padding: '12px 18px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>{readyBatches.length}</div>
              <div style={{ fontSize: '11px', color: '#A7F3D0', fontWeight: 600, textTransform: 'uppercase' }}>Ready to Transfer</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.12)', padding: '12px 18px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>{submittedBatches.length}</div>
              <div style={{ fontSize: '11px', color: '#A7F3D0', fontWeight: 600, textTransform: 'uppercase' }}>In Lab Queue</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.12)', padding: '12px 18px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#34D399' }}>{certifiedBatches.length}</div>
              <div style={{ fontSize: '11px', color: '#A7F3D0', fontWeight: 600, textTransform: 'uppercase' }}>Certified & Released</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION A: BATCHES READY FOR IMMEDIATE LAB HANDOVER */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Batches Ready for Laboratory Transfer</span>
              <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#166534' }}>
                {readyBatches.length} Pending
              </span>
            </h3>
            <span style={{ fontSize: '12.5px', color: '#64748B' }}>
              All mandatory SOP processing steps completed and verified. Ready for analytical accession.
            </span>
          </div>
        </div>

        {readyBatches.length === 0 ? (
          <div 
            className="card"
            style={{
              padding: '32px 20px',
              textAlign: 'center',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1'
            }}
          >
            <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
              No Batches Pending Quality Transfer
            </h4>
            <p style={{ margin: '0 auto', fontSize: '12.5px', color: '#64748B', maxWidth: '440px' }}>
              All completed batches have already been handed over to the laboratory. Complete mandatory steps on active batches to queue new transfers.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {readyBatches.map(({ batch, completedSteps, totalPlanSteps }) => {
              const notesVal = handoverNotes[batch.id] || '';
              const isSubmitting = submittingBatchId === batch.id;
              const sourceCodes = (batch.sourceHarvests || []).map(s => s.traceabilityCode).filter(Boolean);

              return (
                <div
                  key={batch.id}
                  className="card"
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #86EFAC',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                          {batch.name || batch.batchNumber}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}>
                          READY FOR QUALITY
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                          {batch.batchNumber}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span>Floral Type: <strong style={{ color: '#334155' }}>{batch.honeyType || 'Wild Forest'}</strong></span>
                        <span>Net Yield: <strong style={{ color: '#059669' }}>{batch.finalYieldKg || batch.weightKg} kg</strong></span>
                        <span>Facility: <strong style={{ color: '#334155' }}>{batch.facility || 'Extraction Bay 1'}</strong></span>
                        <span>SOP: <strong style={{ color: '#334155' }}>{batch.sopCode || 'SOP-HNY-001'}</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectBatch && onSelectBatch(batch)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      <span>View Batch Details</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Pre-Flight Checklist Chips */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', padding: '10px 14px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                      <CheckCircle2 size={15} color="#16A34A" />
                      <span>All Mandatory Steps Completed ({completedSteps}/{totalPlanSteps})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#166534', fontWeight: 600, marginLeft: '12px' }}>
                      <CheckCircle2 size={15} color="#16A34A" />
                      <span>Source Harvest Lineage Verified ({sourceCodes.length} units linked: {sourceCodes.slice(0, 3).join(', ')}{sourceCodes.length > 3 ? '...' : ''})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#166534', fontWeight: 600, marginLeft: '12px' }}>
                      <CheckCircle2 size={15} color="#16A34A" />
                      <span>Zero Open Holds</span>
                    </div>
                    {batch.deviations?.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#92400E', fontWeight: 600, marginLeft: '12px', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '4px' }}>
                        <AlertTriangle size={14} color="#D97706" />
                        <span>{batch.deviations.length} Deviation(s) (Auto-Authorized on Transfer)</span>
                      </div>
                    )}
                  </div>

                  {/* Handover Form */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '14px', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Quality Handover Memorandum / Target Testing Notes
                      </label>
                      <input
                        type="text"
                        placeholder="Document any special instructions, target export standards, or tank notes for the analytical lab..."
                        value={notesVal}
                        onChange={e => handleNotesChange(batch.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleSubmit(batch.id)}
                      disabled={isSubmitting}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#059669',
                        borderColor: '#059669',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 700,
                        fontSize: '13.5px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Send size={16} />
                      <span>{isSubmitting ? 'Transferring...' : 'Transfer Batch to Lab Intake Station'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. SECTION B: BATCHES ALREADY IN LABORATORY CUSTODY */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Transferred to Laboratory Queue</span>
              <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
                {submittedBatches.length} Batches
              </span>
            </h3>
            <span style={{ fontSize: '12.5px', color: '#64748B' }}>
              Under analytical custody at testing station. You can switch to the Laboratory Workspace to view live assays.
            </span>
          </div>
        </div>

        {submittedBatches.length === 0 ? (
          <div 
            className="card"
            style={{
              padding: '24px 20px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}
          >
            <Clock size={24} color="#94A3B8" style={{ margin: '0 auto 6px' }} />
            <div style={{ fontSize: '13px', color: '#64748B' }}>No batches currently undergoing laboratory certification.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {submittedBatches.map(({ batch, linkedSample }) => (
              <div
                key={batch.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #BFDBFE' }}>
                    <FlaskConical size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14.5px', color: '#0F172A' }}>{batch.name || batch.batchNumber}</strong>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                        SUBMITTED TO LAB
                      </span>
                      {linkedSample && (
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
                          Lab Sample: {linkedSample.id}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                      Batch: {batch.batchNumber} · Net: {batch.finalYieldKg || batch.weightKg} kg · Handed over: {batch.submittedToQualityAt ? new Date(batch.submittedToQualityAt).toLocaleDateString() : 'Today'} · Officer: {batch.qualityHandoffOperator || 'Marcus K.'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onSelectBatch && onSelectBatch(batch)}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    <span>View Batch</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      if (setRole) setRole('lab');
                      if (setActiveTab) setActiveTab('samples');
                    }}
                    style={{ fontSize: '12px', padding: '6px 12px', backgroundColor: '#1D4ED8', borderColor: '#1D4ED8', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    <span>Open in Lab Workspace</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. SECTION B2: CERTIFIED HONEY LOTS — OFFICIAL LAB COA RECEIVED */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#065F46', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#059669" />
              <span>Certified Honey Batches — Official Lab CoA Received</span>
              <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#166534' }}>
                {certifiedBatches.length} Certified
              </span>
            </h3>
            <span style={{ fontSize: '12.5px', color: '#64748B' }}>
              Analytical findings report received from laboratory. Verified conforming to FSSAI/Codex standards and ready for commercial packaging release.
            </span>
          </div>
        </div>

        {certifiedBatches.length === 0 ? (
          <div 
            className="card"
            style={{
              padding: '24px 20px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1'
            }}
          >
            <Clock size={24} color="#94A3B8" style={{ margin: '0 auto 6px' }} />
            <div style={{ fontSize: '13px', color: '#64748B' }}>No certified batches received from laboratory yet. Once the lab signs and transmits a Certificate of Analysis, it will appear here.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {certifiedBatches.map(({ batch, linkedSample }) => (
              <div
                key={batch.id}
                className="card"
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #86EFAC',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', border: '1px solid #A7F3D0' }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '15px', color: '#0F172A' }}>{batch.name || batch.batchNumber}</strong>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}>
                        QUALITY CERTIFIED
                      </span>
                      {batch.coaDocumentId && (
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                          CoA: {batch.coaDocumentId}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px' }}>
                      Batch: <strong>{batch.batchNumber}</strong> · Net Yield: <strong>{batch.finalYieldKg || batch.weightKg} kg</strong> · Certified: <strong>{batch.certifiedAt ? new Date(batch.certifiedAt).toLocaleDateString() : 'Today'}</strong> · Analyst: {batch.certifierName || 'Dr. Elena Vance (Lead Chemist)'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#047857', fontWeight: 600, marginTop: '2px' }}>
                      Compliance: {batch.complianceSummary || 'CONFORMING TO SPECIFICATIONS (FSSAI / AGMARK / CODEX)'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedBatchForReport(batch)}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#059669',
                      borderColor: '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={14} />
                    <span>View Official Lab CoA</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onSelectBatch && onSelectBatch(batch)}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    <span>Inspect Batch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. SECTION C: IN-PROGRESS BATCHES NEEDING MORE STEPS */}
      {inProgressBatches.length > 0 && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#475569' }}>
              Batches in Progress ({inProgressBatches.length})
            </h3>
            <span style={{ fontSize: '12.5px', color: '#64748B' }}>
              These batches require remaining mandatory processing steps before Quality handover.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {inProgressBatches.map(({ batch, completedSteps, totalPlanSteps, readiness }) => (
              <div
                key={batch.id}
                className="card"
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13.5px', color: '#1E293B' }}>{batch.name || batch.batchNumber}</strong>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#D97706', backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>
                    {completedSteps}/{totalPlanSteps} Steps
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {batch.batchNumber} · {batch.weightKg} kg · {batch.honeyType}
                </div>
                {readiness.reasons.length > 0 && (
                  <div style={{ fontSize: '11.5px', color: '#B45309', backgroundColor: '#FFFBEB', padding: '6px 8px', borderRadius: '6px', border: '1px solid #FEF3C7' }}>
                    Pending: {readiness.reasons[0]}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenRecordStep ? onOpenRecordStep(batch) : (onSelectBatch && onSelectBatch(batch))}
                    style={{ fontSize: '11.5px', padding: '4px 10px' }}
                  >
                    <span>Log Step</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onSelectBatch && onSelectBatch(batch)}
                    style={{ fontSize: '11.5px', padding: '4px 10px' }}
                  >
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <LabReportModal
        isOpen={Boolean(selectedBatchForReport)}
        onClose={() => setSelectedBatchForReport(null)}
        report={selectedBatchForReport?.labReport}
      />
    </div>
  );
};
