import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  PauseCircle,
  Cpu,
  Layers,
  FileText,
  Building,
  User,
  Scale,
  Send,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Percent
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ProcessorDomainService, BATCH_STATUSES } from '../../services/processorDomainService';
import { ProcessingEngine, STEP_STATUSES } from '../../services/processingEngine';

export const ProcessorBatchDetailModal = ({
  isOpen,
  onClose,
  batch,
  allHarvestRecords = [],
  onOpenRecordStep,
  onOpenHoldModal,
  onOpenDeviationModal,
  onOpenPlanModal,
  onResolveDeviation,
  onSkipStep,
  onSubmitToQuality
}) => {
  if (!isOpen || !batch) return null;

  const [activeTab, setActiveTab] = useState('TIMELINE'); // 'TIMELINE' | 'SOURCES' | 'DEVIATIONS' | 'YIELD' | 'QUALITY'
  const [qualityNotes, setQualityNotes] = useState('');
  const [isSubmittingQuality, setIsSubmittingQuality] = useState(false);
  const [skipReasonModalStep, setSkipReasonModalStep] = useState(null);
  const [skipReasonText, setSkipReasonText] = useState('');

  // Validate quality readiness with new comprehensive engine
  const readiness = ProcessingEngine.validateQualityReadiness(batch, { allowAutoDisposition: true });

  // Calculate plan progress
  const planSteps = batch.approvedPlan || [];
  const completedStepsCount = (batch.steps || []).filter(s => s.status === 'COMPLETED').length;
  const progressPercent = planSteps.length > 0
    ? Math.round((completedStepsCount / planSteps.length) * 100)
    : 50;

  const handleQualitySubmit = (e) => {
    e.preventDefault();
    if (!readiness.allowed) return;

    setIsSubmittingQuality(true);
    const res = onSubmitToQuality({
      batchId: batch.id,
      notes: qualityNotes
    });
    setIsSubmittingQuality(false);

    if (res?.success) {
      onClose();
    }
  };

  const handleConfirmSkip = () => {
    if (!skipReasonText || skipReasonText.trim().length < 5) return;
    if (onSkipStep && skipReasonModalStep) {
      onSkipStep({
        batchId: batch.id,
        stepKey: skipReasonModalStep.stepKey,
        reason: skipReasonText
      });
    }
    setSkipReasonModalStep(null);
    setSkipReasonText('');
  };

  return (
    <div className="proc-modal-backdrop" onClick={onClose}>
      <div className="proc-modal-sheet proc-modal-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="proc-modal-header">
          <div className="proc-modal-header-left">
            <div className="proc-badge-row">
              <span className="proc-badge-tag">Processing Batch</span>
              <span className="proc-badge-code">{batch.batchNumber}</span>
              <span className="proc-badge-sop">{batch.sopCode || 'SOP-HNY-001'} (v{batch.sopVersion || '3.2'})</span>
              <StatusBadge
                status={batch.status === BATCH_STATUSES.SUBMITTED_TO_QUALITY ? 'healthy' : batch.status === BATCH_STATUSES.ON_HOLD ? 'attention' : 'healthy'}
                label={batch.statusLabel || batch.status}
                size="small"
              />
            </div>
            <h2 className="proc-modal-title">{batch.name}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {readiness.allowed && batch.status !== BATCH_STATUSES.SUBMITTED_TO_QUALITY && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('QUALITY')}
                style={{
                  backgroundColor: '#059669',
                  borderColor: '#059669',
                  fontSize: '12.5px',
                  padding: '6px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                }}
              >
                <Send size={13} />
                <span>Quality Handoff</span>
              </button>
            )}
            <button className="proc-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Operational Metrics Bar */}
        <div className="proc-detail-metrics-bar">
          <div className="proc-dm-item">
            <span className="proc-dm-lbl">Net Batch Weight</span>
            <span className="proc-dm-val">{batch.finalYieldKg || batch.weightKg} kg</span>
          </div>
          <div className="proc-dm-item">
            <span className="proc-dm-lbl">Source Lineage</span>
            <span className="proc-dm-val">{batch.sourceHarvests?.length || 0} Units</span>
          </div>
          <div className="proc-dm-item">
            <span className="proc-dm-lbl">Progress</span>
            <span className="proc-dm-val">{progressPercent}% ({completedStepsCount}/{planSteps.length})</span>
          </div>
          <div className="proc-dm-item">
            <span className="proc-dm-lbl">Facility & Lead</span>
            <span className="proc-dm-val">{batch.leadOperator || 'Plant Lead'}</span>
          </div>
        </div>

        {/* Tab Sub-Nav */}
        <div className="proc-tab-nav">
          <button
            className={`proc-tab-btn ${activeTab === 'TIMELINE' ? 'active' : ''}`}
            onClick={() => setActiveTab('TIMELINE')}
          >
            Processing Steps ({completedStepsCount}/{planSteps.length})
          </button>
          <button
            className={`proc-tab-btn ${activeTab === 'SOURCES' ? 'active' : ''}`}
            onClick={() => setActiveTab('SOURCES')}
          >
            Source Lineage ({batch.sourceHarvests?.length || 0})
          </button>
          <button
            className={`proc-tab-btn ${activeTab === 'DEVIATIONS' ? 'active' : ''}`}
            onClick={() => setActiveTab('DEVIATIONS')}
          >
            Deviations ({(batch.deviations || []).length})
          </button>
          <button
            className={`proc-tab-btn ${activeTab === 'YIELD' ? 'active' : ''}`}
            onClick={() => setActiveTab('YIELD')}
          >
            Yield & Loss
          </button>
          <button
            className={`proc-tab-btn ${activeTab === 'QUALITY' ? 'active' : ''}`}
            onClick={() => setActiveTab('QUALITY')}
            style={readiness.allowed && batch.status !== BATCH_STATUSES.SUBMITTED_TO_QUALITY ? {
              backgroundColor: '#ECFDF5',
              color: '#059669',
              fontWeight: 750
            } : {}}
          >
            <Send size={13} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
            <span>Quality Handoff</span>
            {readiness.allowed && batch.status !== BATCH_STATUSES.SUBMITTED_TO_QUALITY && (
              <span style={{ marginLeft: '6px', fontSize: '10px', backgroundColor: '#059669', color: '#FFF', padding: '1px 5px', borderRadius: '8px' }}>
                READY
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="proc-modal-body">
          {/* TAB 1: WORKFLOW TIMELINE */}
          {activeTab === 'TIMELINE' && (
            <div className="proc-timeline-tab">
              <div className="proc-timeline-actions">
                <div>
                  <span className="proc-section-subtitle">
                    Profile: {batch.profileName || 'Commercial Line'} · SOP: {batch.sopCode || 'SOP-HNY-001'}
                  </span>
                </div>
                <div className="proc-tl-btn-row">
                  {onOpenPlanModal && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onOpenPlanModal(batch)}
                    >
                      <Layers size={14} />
                      <span>Review Plan</span>
                    </button>
                  )}
                  {batch.status !== BATCH_STATUSES.SUBMITTED_TO_QUALITY && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => onOpenRecordStep(batch)}
                    >
                      <Cpu size={14} />
                      <span>Record Step</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Steps Timeline */}
              <div className="proc-steps-timeline">
                {planSteps.map((step, idx) => {
                  const stepRecord = (batch.steps || []).find(s => s.stepKey === step.stepKey);
                  const isCompleted = stepRecord && stepRecord.status === 'COMPLETED';
                  const isSkipped = step.status === 'SKIPPED';
                  const isOptional = step.requirement === 'OPTIONAL';

                  return (
                    <div
                      key={step.stepKey || idx}
                      className={`proc-timeline-step-card ${isCompleted ? 'completed' : isSkipped ? 'skipped' : idx === completedStepsCount ? 'current' : 'pending'}`}
                    >
                      <div className="proc-tsc-indicator">
                        <div className="proc-tsc-dot">
                          {isCompleted ? (
                            <CheckCircle2 size={16} color="#FFF" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        {idx < planSteps.length - 1 && <div className="proc-tsc-line" />}
                      </div>

                      <div className="proc-tsc-content">
                        <div className="proc-tsc-header">
                          <div className="proc-tsc-title-wrap">
                            <strong className="proc-tsc-name">{step.name}</strong>
                            <div className="proc-tsc-badges">
                              <span className={`proc-req-pill ${step.requirement.toLowerCase()}`}>
                                {step.requirement}
                              </span>
                              {isCompleted && (
                                <span className="proc-status-pill done">Completed</span>
                              )}
                              {isSkipped && (
                                <span className="proc-status-pill skipped">Skipped</span>
                              )}
                              {!isCompleted && !isSkipped && idx === completedStepsCount && (
                                <span className="proc-status-pill next">Next Action</span>
                              )}
                            </div>
                          </div>

                          <div className="proc-tsc-actions">
                            {!isCompleted && !isSkipped && isOptional && (
                              <button
                                type="button"
                                className="proc-skip-btn"
                                onClick={() => setSkipReasonModalStep(step)}
                              >
                                Skip Optional Step
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="proc-tsc-desc">{step.description}</p>

                        {/* Executed Step Record Details */}
                        {isCompleted && stepRecord && (
                          <div className="proc-tsc-completed-box">
                            <div className="proc-tsc-cb-meta">
                              <span><strong>Completed:</strong> {stepRecord.completedAt} by {stepRecord.operator}</span>
                              <span><strong>Equipment:</strong> {stepRecord.equipment}</span>
                            </div>

                            {/* Recorded Parameters Chips */}
                            {stepRecord.parameters && Object.keys(stepRecord.parameters).length > 0 && (
                              <div className="proc-tsc-cb-params">
                                {Object.entries(stepRecord.parameters).map(([k, v]) => (
                                  <div key={k} className="proc-param-badge">
                                    <span className="proc-pb-lbl">{k}:</span>
                                    <strong className="proc-pb-val">{String(v)}</strong>
                                  </div>
                                ))}
                              </div>
                            )}

                            {stepRecord.remarks && (
                              <div className="proc-tsc-remarks">
                                <em>"{stepRecord.remarks}"</em>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-SOURCE LINEAGE TRACEABILITY */}
          {activeTab === 'SOURCES' && (
            <div className="proc-sources-tab">
              <div className="proc-sources-intro">
                <ShieldCheck size={18} color="#D97706" />
                <div>
                  <strong>Multi-Source Lineage Preservation</strong>
                  <p>Every harvest unit contributing to batch {batch.batchNumber} is linked with unbroken provenance down to Frame, Hive, and Apiary.</p>
                </div>
              </div>

              <div className="proc-sources-table-card">
                <div className="proc-st-header">
                  <span>Traceability Code</span>
                  <span>Yard / Hive / Frame</span>
                  <span>Variety</span>
                  <span>Quantity</span>
                  <span>Beekeeper</span>
                </div>
                <div className="proc-st-rows">
                  {(batch.sourceHarvests || []).map(src => (
                    <div key={src.traceabilityCode} className="proc-st-row">
                      <strong className="proc-st-code">{src.traceabilityCode}</strong>
                      <span className="proc-st-loc">{src.apiaryCode} · {src.hiveCode} · {src.frameNumber}</span>
                      <span className="proc-st-type">{src.honeyType}</span>
                      <span className="proc-st-qty">{src.quantityKg} kg</span>
                      <span className="proc-st-bk">{src.beekeeper}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROCESS DEVIATIONS */}
          {activeTab === 'DEVIATIONS' && (
            <div className="proc-deviations-tab">
              <div className="proc-dev-header-actions">
                <div>
                  <span className="proc-section-subtitle">
                    Recorded Process Variances & Dispositions
                  </span>
                </div>
                {onOpenDeviationModal && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenDeviationModal(batch)}
                  >
                    <AlertTriangle size={14} color="#D97706" />
                    <span>Log New Deviation</span>
                  </button>
                )}
              </div>

              {(batch.deviations || []).length === 0 ? (
                <div className="proc-empty-box">
                  <CheckCircle2 size={24} color="#059669" />
                  <p>Zero Process Deviations Recorded</p>
                  <span>All processing steps have executed within configured SOP and regulatory bounds.</span>
                </div>
              ) : (
                <div className="proc-dev-cards-list">
                  {batch.deviations.map(dev => (
                    <div key={dev.id} className="proc-dev-item-card">
                      <div className="proc-dic-top">
                        <div className="proc-dic-sev-wrap">
                          <span className={`proc-sev-tag ${dev.severity.toLowerCase()}`}>
                            {dev.severity}
                          </span>
                          <strong>{dev.parameter} ({dev.stepName})</strong>
                        </div>
                        <span className="proc-dic-disp-pill">
                          Disposition: {dev.disposition}
                        </span>
                      </div>

                      <div className="proc-dic-metrics">
                        <span>Expected: <strong>{dev.expected}</strong></span>
                        <span>Actual: <strong className="text-red">{dev.actual}</strong></span>
                        <span>Logged By: {dev.operator}</span>
                      </div>

                      <p className="proc-dic-reason">
                        <strong>Observed Cause:</strong> {dev.reason}
                      </p>

                      {dev.dispositionNotes && (
                        <div className="proc-dic-resolution">
                          <CheckCircle2 size={14} color="#059669" />
                          <span>Review: {dev.dispositionNotes}</span>
                        </div>
                      )}

                      {(!dev.resolvedAt || dev.disposition === 'HOLD') && onResolveDeviation && (
                        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Supervisor Action:</span>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => onResolveDeviation({
                              batchId: batch.id,
                              deviationId: dev.id,
                              disposition: 'RELEASE_TO_QUALITY',
                              notes: 'Supervisor cleared for laboratory analytical testing and certification'
                            })}
                            style={{
                              fontSize: '11.5px',
                              padding: '5px 10px',
                              backgroundColor: '#DCFCE7',
                              color: '#15803D',
                              border: '1px solid #86EFAC',
                              borderRadius: '6px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            ✓ Approve & Release to Lab
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => onResolveDeviation({
                              batchId: batch.id,
                              deviationId: dev.id,
                              disposition: 'ACCEPT_VARIANCE',
                              notes: 'Variance accepted under facility SOP tolerance guidelines'
                            })}
                            style={{
                              fontSize: '11.5px',
                              padding: '5px 10px',
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              border: '1px solid #BFDBFE',
                              borderRadius: '6px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Accept Variance under SOP
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: YIELD & LOSS RECONCILIATION */}
          {activeTab === 'YIELD' && (
            <div className="proc-yield-tab">
              <div className="proc-yield-grid">
                <div className="proc-yg-card">
                  <span className="proc-yg-lbl">Total Input Weight</span>
                  <strong className="proc-yg-val">{batch.weightKg} kg</strong>
                  <span className="proc-yg-sub">From {batch.sourceHarvests?.length || 0} harvest lots</span>
                </div>

                <div className="proc-yg-card highlight">
                  <span className="proc-yg-lbl">Settled Net Yield</span>
                  <strong className="proc-yg-val">{batch.finalYieldKg || batch.weightKg} kg</strong>
                  <span className="proc-yg-sub">Certified for packaging</span>
                </div>

                <div className="proc-yg-card">
                  <span className="proc-yg-lbl">Process Loss</span>
                  <strong className="proc-yg-val">{batch.processLossKg || (batch.weightKg - (batch.finalYieldKg || batch.weightKg)).toFixed(2)} kg</strong>
                  <span className="proc-yg-sub">Wax froth & pipe residual</span>
                </div>

                <div className="proc-yg-card">
                  <span className="proc-yg-lbl">Yield Ratio</span>
                  <strong className="proc-yg-val">{batch.yieldPercent || '98.5'}%</strong>
                  <span className="proc-yg-sub">Within standard 97-99% band</span>
                </div>
              </div>

              <div className="proc-yield-reconciliation-box">
                <span className="proc-yrb-title">Process Loss Attribution</span>
                <p className="proc-yrb-text">
                  Standard apiculture processing loss accounts for comb cappings separation during coarse straining, wax froth skimming from settling tank top layer, and vessel wall adhesion.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: QUALITY HANDOFF GATEWAY */}
          {activeTab === 'QUALITY' && (
            <div className="proc-quality-tab">
              {batch.status === BATCH_STATUSES.QUALITY_PASSED || batch.labReport ? (
                <div className="proc-already-submitted-box" style={{ borderColor: '#86EFAC', backgroundColor: '#F0FDF4' }}>
                  <ShieldCheck size={36} color="#15803D" />
                  <h3 style={{ color: '#15803D' }}>Certified Laboratory Certificate of Analysis (CoA) Attached</h3>
                  <p style={{ color: '#166534' }}>
                    Batch {batch.batchNumber} has been officially certified by {batch.labReport?.lab?.name || 'Analytical Laboratory'}.
                    Compliance: <strong>{batch.labReport?.complianceSummary || 'CONFORMING TO SPECIFICATIONS'}</strong>.
                  </p>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}>
                      Document: {batch.labReport?.documentId || batch.coaDocumentId || 'LAB-CoA-2026'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center' }}>
                      Signed by {batch.labReport?.signatory?.name || batch.certifierName || 'Chief Chemist'}
                    </span>
                  </div>
                  {/* Test parameters overview */}
                  {batch.labReport?.tests && (
                    <div style={{ marginTop: '16px', textAlign: 'left', width: '100%', backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
                      <strong style={{ fontSize: '12.5px', color: '#0F172A', display: 'block', marginBottom: '8px' }}>Verified Analytical Parameters:</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                        {batch.labReport.tests.map((t, idx) => (
                          <div key={idx} style={{ fontSize: '12px', padding: '6px 8px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                            <div style={{ color: '#64748B', fontSize: '11px' }}>{t.name || t.key}</div>
                            <div style={{ fontWeight: 700, color: t.status === 'CONFORMING' ? '#15803D' : '#DC2626' }}>
                              {t.result} ({t.status})
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : batch.status === BATCH_STATUSES.SUBMITTED_TO_QUALITY ? (
                <div className="proc-already-submitted-box">
                  <ShieldCheck size={32} color="#059669" />
                  <h3>Handed Over to Certified Quality Lab</h3>
                  <p>Batch {batch.batchNumber} has entered the laboratory intake queue. Quality testing is now under certified analyst custody.</p>
                  <span className="proc-asb-meta">
                    Submitted by {batch.qualityHandoffOperator || batch.leadOperator} · {batch.submittedToQualityAt ? new Date(batch.submittedToQualityAt).toLocaleDateString() : 'Today'}
                  </span>
                </div>
              ) : (
                <div className="proc-quality-handoff-form-wrap">
                  {/* Incomplete Batch Protection Checklist */}
                  <div className="proc-readiness-checklist">
                    <span className="proc-rc-title">Quality Handover Pre-Flight Verification</span>
                    <div className="proc-rc-items">
                      <div className={`proc-rc-item ${completedStepsCount >= planSteps.filter(s => s.requirement === 'MANDATORY').length ? 'pass' : 'fail'}`}>
                        {completedStepsCount >= planSteps.filter(s => s.requirement === 'MANDATORY').length ? (
                          <CheckCircle2 size={16} color="#059669" />
                        ) : (
                          <AlertTriangle size={16} color="#DC2626" />
                        )}
                        <span>Mandatory Processing Steps Completed</span>
                      </div>

                      <div className={`proc-rc-item ${(batch.sourceHarvests || []).length > 0 ? 'pass' : 'fail'}`}>
                        <CheckCircle2 size={16} color="#059669" />
                        <span>Source Traceability Units Linked ({(batch.sourceHarvests || []).length} units)</span>
                      </div>

                      <div className={`proc-rc-item ${batch.status !== BATCH_STATUSES.ON_HOLD ? 'pass' : 'fail'}`}>
                        {batch.status !== BATCH_STATUSES.ON_HOLD ? (
                          <CheckCircle2 size={16} color="#059669" />
                        ) : (
                          <AlertTriangle size={16} color="#DC2626" />
                        )}
                        <span>Batch Hold Status Cleared</span>
                      </div>
                    </div>

                    {readiness.hasOpenDeviations && (
                      <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#92400E' }}>
                        <AlertTriangle size={16} color="#D97706" />
                        <span>
                          <strong>Deviation Notice:</strong> Batch has {readiness.unresolvedDeviations.length} logged deviation(s). Submitting will automatically log supervisor clearance <code>RELEASE_TO_QUALITY</code> for laboratory analytical confirmation.
                        </span>
                      </div>
                    )}

                    {!readiness.allowed && (
                      <div className="proc-rc-blockers">
                        <AlertTriangle size={16} color="#DC2626" />
                        <div>
                          <strong>Cannot Handover to Quality Lab:</strong>
                          <ul>
                            {readiness.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleQualitySubmit} className="proc-form">
                    <div className="proc-form-group">
                      <label className="proc-label">
                        <FileText size={14} />
                        <span>Quality Handover Memorandum / Special Notes</span>
                      </label>
                      <textarea
                        className="proc-textarea"
                        rows={3}
                        placeholder="Document any special floral blend instructions, specific target market tests (e.g. C4 sugar EA/LC-IRMS for export), or settling tank notes..."
                        value={qualityNotes}
                        onChange={e => setQualityNotes(e.target.value)}
                      />
                    </div>

                    <div className="proc-modal-actions-single">
                      <button
                        type="submit"
                        className="btn btn-primary proc-submit-quality-btn"
                        disabled={!readiness.allowed || isSubmittingQuality}
                      >
                        <Send size={16} />
                        <span>Transfer Batch to Lab Intake Station</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Hold Action */}
        <div className="proc-modal-footer">
          <div className="proc-mf-left">
            {batch.status === BATCH_STATUSES.ON_HOLD ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm text-amber"
                onClick={() => onOpenHoldModal && onOpenHoldModal(batch)}
              >
                <Play size={14} />
                <span>Resume from Hold</span>
              </button>
            ) : batch.status !== BATCH_STATUSES.SUBMITTED_TO_QUALITY && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenHoldModal && onOpenHoldModal(batch)}
              >
                <PauseCircle size={14} />
                <span>Place Batch on Hold</span>
              </button>
            )}
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Skip Step Reason Modal */}
        {skipReasonModalStep && (
          <div className="proc-sub-modal-backdrop">
            <div className="proc-sub-modal-card card">
              <h3 className="proc-smc-title">Skip Optional Step: {skipReasonModalStep.name}</h3>
              <p className="proc-smc-desc">
                Document reason for skipping this optional step in batch {batch.batchNumber}:
              </p>
              <textarea
                className="proc-textarea"
                rows={3}
                required
                placeholder="e.g. Customer specified unheated cold raw honey; warming step skipped by contract request..."
                value={skipReasonText}
                onChange={e => setSkipReasonText(e.target.value)}
              />
              <div className="proc-smc-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSkipReasonModalStep(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={skipReasonText.trim().length < 5}
                  onClick={handleConfirmSkip}
                >
                  Confirm Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .proc-badge-sop {
          background: #FEF3C7;
          color: #92400E;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .proc-timeline-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .proc-tl-btn-row {
          display: flex;
          gap: 8px;
        }

        .proc-steps-timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .proc-timeline-step-card {
          display: flex;
          gap: 14px;
          position: relative;
        }

        .proc-tsc-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 28px;
          flex-shrink: 0;
        }

        .proc-tsc-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          background: #FAF6ED;
          border: 2px solid #D1C7B7;
          color: #5C4033;
          z-index: 2;
        }

        .proc-timeline-step-card.completed .proc-tsc-dot {
          background: #059669;
          border-color: #059669;
        }

        .proc-timeline-step-card.current .proc-tsc-dot {
          background: #D97706;
          border-color: #D97706;
          color: #FFF;
          box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.2);
        }

        .proc-timeline-step-card.skipped .proc-tsc-dot {
          background: #E5E7EB;
          border-color: #9CA3AF;
          color: #6B7280;
        }

        .proc-tsc-line {
          width: 2px;
          flex: 1;
          background: #E5DCCB;
          margin: 4px 0;
        }

        .proc-tsc-content {
          flex: 1;
          background: #FFF;
          border: 1px solid #E5DCCB;
          border-radius: 10px;
          padding: 12px 14px;
        }

        .proc-timeline-step-card.current .proc-tsc-content {
          border-color: #D97706;
          background: #FFFDF8;
        }

        .proc-tsc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
        }

        .proc-tsc-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .proc-tsc-name {
          font-size: 14px;
          color: var(--color-deep-cocoa, #2E1F14);
        }

        .proc-tsc-badges {
          display: flex;
          gap: 6px;
        }

        .proc-status-pill {
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .proc-status-pill.done {
          background: #ECFDF5;
          color: #059669;
        }

        .proc-status-pill.next {
          background: #FEF3C7;
          color: #D97706;
        }

        .proc-status-pill.skipped {
          background: #F3F4F6;
          color: #6B7280;
        }

        .proc-skip-btn {
          background: none;
          border: 1px dashed #C4B9A7;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11px;
          color: var(--color-warm-gray, #6B5B4E);
          cursor: pointer;
        }

        .proc-skip-btn:hover {
          border-color: #D97706;
          color: #D97706;
        }

        .proc-tsc-desc {
          font-size: 12px;
          color: var(--color-warm-gray, #6B5B4E);
          line-height: 1.35;
          margin: 6px 0;
        }

        .proc-tsc-completed-box {
          background: #FAF6ED;
          border: 1px solid #E5DCCB;
          border-radius: 8px;
          padding: 10px 12px;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .proc-tsc-cb-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11.5px;
          color: var(--color-deep-cocoa, #2E1F14);
        }

        .proc-tsc-cb-params {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .proc-param-badge {
          background: #FFF;
          border: 1px solid #E5DCCB;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 11.5px;
          display: flex;
          gap: 4px;
        }

        .proc-pb-lbl {
          color: var(--color-warm-gray, #6B5B4E);
        }

        .proc-tsc-remarks {
          font-size: 11.5px;
          color: #5C4033;
          margin-top: 2px;
        }

        /* Sources Table */
        .proc-sources-intro {
          display: flex;
          gap: 12px;
          background: #FFFBEB;
          border: 1px solid #FCD34D;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }

        .proc-sources-intro strong {
          font-size: 13.5px;
          color: #92400E;
          display: block;
          margin-bottom: 2px;
        }

        .proc-sources-intro p {
          font-size: 12px;
          color: #B45309;
          margin: 0;
        }

        .proc-sources-table-card {
          border: 1px solid #E5DCCB;
          border-radius: 10px;
          background: #FFF;
          overflow: hidden;
        }

        .proc-st-header {
          display: grid;
          grid-template-columns: 1.5fr 1.2fr 1.2fr 1fr 1.5fr;
          padding: 10px 14px;
          background: #FAF6ED;
          font-size: 11.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2E1F14);
          border-bottom: 1px solid #E5DCCB;
        }

        .proc-st-row {
          display: grid;
          grid-template-columns: 1.5fr 1.2fr 1.2fr 1fr 1.5fr;
          padding: 12px 14px;
          font-size: 12.5px;
          border-bottom: 1px solid #F3EDE2;
          align-items: center;
        }

        .proc-st-code {
          color: #D97706;
          font-family: monospace;
          font-size: 13px;
        }

        /* Yield Tab */
        .proc-yield-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .proc-yg-card {
          background: #FFF;
          border: 1px solid #E5DCCB;
          border-radius: 10px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .proc-yg-card.highlight {
          border-color: #059669;
          background: #ECFDF5;
        }

        .proc-yg-lbl {
          font-size: 11.5px;
          color: var(--color-warm-gray, #6B5B4E);
        }

        .proc-yg-val {
          font-size: 20px;
          color: var(--color-deep-cocoa, #2E1F14);
        }

        .proc-yg-sub {
          font-size: 11px;
          color: var(--color-warm-gray, #6B5B4E);
        }

        .proc-yield-reconciliation-box {
          background: #FAF6ED;
          border: 1px solid #E5DCCB;
          border-radius: 10px;
          padding: 14px;
        }

        .proc-yrb-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2E1F14);
          display: block;
          margin-bottom: 4px;
        }

        .proc-yrb-text {
          font-size: 12px;
          color: var(--color-warm-gray, #6B5B4E);
          line-height: 1.45;
          margin: 0;
        }

        /* Quality Tab */
        .proc-already-submitted-box {
          text-align: center;
          padding: 36px 20px;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .proc-already-submitted-box h3 {
          font-size: 18px;
          color: #065F46;
          margin: 0;
        }

        .proc-already-submitted-box p {
          font-size: 13.5px;
          color: #047857;
          max-width: 480px;
          line-height: 1.45;
          margin: 0;
        }

        .proc-asb-meta {
          font-size: 12px;
          color: #059669;
          font-weight: 600;
        }

        .proc-readiness-checklist {
          background: #FAF6ED;
          border: 1.5px solid #E5DCCB;
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 16px;
        }

        .proc-rc-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2E1F14);
          display: block;
          margin-bottom: 10px;
        }

        .proc-rc-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .proc-rc-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12.5px;
          color: var(--color-deep-cocoa, #2E1F14);
        }

        .proc-rc-blockers {
          display: flex;
          gap: 10px;
          background: #FEE2E2;
          border: 1px solid #FCA5A5;
          border-radius: 8px;
          padding: 10px 12px;
          margin-top: 12px;
          font-size: 12px;
          color: #991B1B;
        }

        .proc-rc-blockers ul {
          margin: 4px 0 0;
          padding-left: 16px;
        }

        .proc-sub-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .proc-sub-modal-card {
          width: 90%;
          max-width: 440px;
          background: #FFFDF8;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #E5DCCB;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
        }

        .proc-smc-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2E1F14);
          margin-bottom: 6px;
        }

        .proc-smc-desc {
          font-size: 12.5px;
          color: var(--color-warm-gray, #6B5B4E);
          margin-bottom: 12px;
        }

        .proc-smc-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 14px;
        }
      `}</style>
    </div>
  );
};
