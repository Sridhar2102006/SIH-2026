import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  FlaskConical,
  X,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TestTube,
  Activity,
  ArrowRight,
  Layers,
  Calendar,
  Lock,
  Download,
  AlertCircle
} from 'lucide-react';
import {
  SAMPLE_STATUS_LABELS,
  LAB_TEST_CATALOG,
  QUALITY_RECOMMENDATIONS,
  QUALITY_DECISIONS,
  resolveSampleTraceability
} from '../../services/labDomainService';

export const SampleDetailModal = ({ sampleId, isOpen, onClose, onOpenReport, onAssignTest }) => {
  const {
    labSamples,
    labTests,
    processingBatches,
    harvestRecords,
    frames,
    hives,
    apiaries,
    session,
    can,
    submitQualityRecommendation,
    executeQualityDecision,
    showToast
  } = useAppState();

  const [activeTab, setActiveTab] = useState('TESTS'); // 'TESTS' | 'TRACEABILITY' | 'CUSTODY' | 'RECOMMENDATION'
  const [recommendationKey, setRecommendationKey] = useState('SUITABLE_FOR_REVIEW');
  const [recommendationNotes, setRecommendationNotes] = useState('');
  const [decisionKey, setDecisionKey] = useState('RELEASED_FOR_BOTTLING');
  const [decisionNotes, setDecisionNotes] = useState('');

  if (!isOpen || !sampleId) return null;

  const sample = labSamples.find(s => s.id === sampleId);
  if (!sample) return null;

  const sampleTests = labTests.filter(t => t.sampleId === sample.id);
  const completedTests = sampleTests.filter(t => t.status === 'COMPLETED');
  const inProgressTests = sampleTests.filter(t => t.status === 'IN_PROGRESS');
  const assignedTests = sampleTests.filter(t => t.status === 'ASSIGNED');
  const retestsCount = sampleTests.filter(t => t.status === 'RETEST_REQUIRED').length;

  const traceability = resolveSampleTraceability({
    sample,
    processingBatches,
    harvestRecords,
    frames,
    hives,
    apiaries
  });

  const canMakeQualityDecision = can('QUALITY_DECISION') || (session?.capabilities || []).includes('QUALITY_DECISION');

  const handleRecommendationSubmit = (e) => {
    e.preventDefault();
    const res = submitQualityRecommendation({
      sampleId: sample.id,
      recommendationKey,
      notes: recommendationNotes,
      recommenderName: session?.operator || 'Elena Vance'
    });
    if (res.success) {
      showToast('Quality recommendation submitted');
    }
  };

  const handleDecisionSubmit = (e) => {
    e.preventDefault();
    const res = executeQualityDecision({
      sampleId: sample.id,
      decisionKey,
      notes: decisionNotes,
      certifierName: session?.operator || 'Quality Lead'
    });
    if (res.success) {
      showToast('Final Quality decision executed');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(52, 38, 27, 0.18)',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#FFF9EF',
            borderBottom: '1px solid #E2D9CC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <FlaskConical size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#172033' }}>
                  {sample.id}
                </h3>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #BFDBFE'
                  }}
                >
                  {SAMPLE_STATUS_LABELS[sample.intakeStatus] || sample.intakeStatus}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748B' }}>
                Source: <strong>{sample.sourceBatchNumber}</strong> · Received {new Date(sample.receivedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onOpenReport && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenReport(sample)}
                style={{ fontSize: '12px', padding: '6px 12px', borderColor: '#2563EB', color: '#2563EB' }}
              >
                <FileText size={14} style={{ marginRight: '5px' }} />
                <span>Report</span>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close modal"
              data-test="close-sample-detail"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B',
                padding: '6px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            padding: '0 16px'
          }}
        >
          <button
            onClick={() => setActiveTab('TESTS')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === 'TESTS' ? 700 : 500,
              color: activeTab === 'TESTS' ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 'TESTS' ? '2px solid #2563EB' : '2px solid transparent'
            }}
          >
            Assays ({sampleTests.length})
          </button>
          <button
            onClick={() => setActiveTab('TRACEABILITY')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === 'TRACEABILITY' ? 700 : 500,
              color: activeTab === 'TRACEABILITY' ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 'TRACEABILITY' ? '2px solid #2563EB' : '2px solid transparent'
            }}
          >
            Source Traceability
          </button>
          <button
            onClick={() => setActiveTab('CUSTODY')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === 'CUSTODY' ? 700 : 500,
              color: activeTab === 'CUSTODY' ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 'CUSTODY' ? '2px solid #2563EB' : '2px solid transparent'
            }}
          >
            Chain of Custody ({sample.chainOfCustody?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('RECOMMENDATION')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === 'RECOMMENDATION' ? 700 : 500,
              color: activeTab === 'RECOMMENDATION' ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 'RECOMMENDATION' ? '2px solid #2563EB' : '2px solid transparent'
            }}
          >
            Quality & Decision
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: TESTS & RESULTS */}
          {activeTab === 'TESTS' && (
            <div>
              {/* Multi-Test Progress (Section 35) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#F8FAFC', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#172033' }}>{sampleTests.length}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Total Assays</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#F0FDF4', textAlign: 'center', border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#16A34A' }}>{completedTests.length}</div>
                  <div style={{ fontSize: '11px', color: '#16A34A', textTransform: 'uppercase' }}>Completed</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#EFF6FF', textAlign: 'center', border: '1px solid #BFDBFE' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#2563EB' }}>{inProgressTests.length}</div>
                  <div style={{ fontSize: '11px', color: '#2563EB', textTransform: 'uppercase' }}>In Progress</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#FFF7ED', textAlign: 'center', border: '1px solid #FED7AA' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#C2410C' }}>{assignedTests.length}</div>
                  <div style={{ fontSize: '11px', color: '#C2410C', textTransform: 'uppercase' }}>Pending</div>
                </div>
              </div>

              {/* Sample Context Card */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#FFF9EF',
                  border: '1px solid #F1E5D1',
                  marginBottom: '16px',
                  fontSize: '12.5px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px'
                }}
              >
                <div>
                  <span style={{ color: '#8C7A6B' }}>Container:</span>{' '}
                  <strong style={{ color: '#34261B' }}>{sample.containerType}</strong>
                </div>
                <div>
                  <span style={{ color: '#8C7A6B' }}>Volume:</span>{' '}
                  <strong style={{ color: '#34261B' }}>{sample.quantityMl} mL</strong>
                </div>
                <div>
                  <span style={{ color: '#8C7A6B' }}>Storage:</span>{' '}
                  <strong style={{ color: '#34261B' }}>{sample.storageLocation}</strong>
                </div>
                <div>
                  <span style={{ color: '#8C7A6B' }}>Tamper Seal:</span>{' '}
                  <strong style={{ color: '#2E7D32' }}>{sample.sealCondition}</strong>
                </div>
              </div>

              {/* Assays List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sampleTests.map(test => {
                  const testDef = LAB_TEST_CATALOG[test.testKey];
                  return (
                    <div
                      key={test.id}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '14px', color: '#172033' }}>{test.testName}</strong>
                            <span
                              style={{
                                fontSize: '10.5px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: test.status === 'COMPLETED' ? '#F0FDF4' : '#EFF6FF',
                                color: test.status === 'COMPLETED' ? '#16A34A' : '#2563EB',
                                border: `1px solid ${test.status === 'COMPLETED' ? '#BBF7D0' : '#BFDBFE'}`,
                                fontWeight: 600
                              }}
                            >
                              {test.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            Method: {test.method}
                          </div>
                        </div>

                        {/* Result display */}
                        <div style={{ textAlign: 'right' }}>
                          {test.result !== null ? (
                            <div>
                              <span
                                style={{
                                  fontSize: '16px',
                                  fontWeight: 700,
                                  color: test.isWithinSpecification ? '#2E7D32' : '#B91C1C'
                                }}
                              >
                                {test.result} {test.unit}
                              </span>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>
                                Raw: {test.rawMeasurement} {test.unit}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12.5px', color: '#94A3B8', fontStyle: 'italic' }}>
                              Result pending
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '11.5px',
                          color: '#64748B',
                          display: 'flex',
                          justifyContent: 'space-between',
                          borderTop: '1px dashed #E2E8F0',
                          paddingTop: '6px',
                          marginTop: '4px'
                        }}
                      >
                        <span>Spec: {test.referenceStandard}</span>
                        <span>Equipment: {test.equipmentName || 'Standard Bench'}</span>
                        <span>Analyst: {test.operator || test.assignedAnalyst}</span>
                      </div>

                      {test.corrections?.length > 0 && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#92400E',
                            backgroundColor: '#FEF3C7',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            marginTop: '4px'
                          }}
                        >
                          Correction history: Corrected from {test.corrections[0].previousValue} to {test.corrections[0].newValue} {test.unit} by {test.corrections[0].actor} ({test.corrections[0].reason})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {onAssignTest && (
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onAssignTest(sample)}
                    style={{ fontSize: '12.5px' }}
                  >
                    <TestTube size={14} style={{ marginRight: '6px' }} />
                    <span>Assign Additional Analytical Test</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPLETE TRACEABILITY (Section 8, 49, 85) */}
          {activeTab === 'TRACEABILITY' && (
            <div>
              <h4 style={{ margin: '0 0 12px', fontSize: '14.5px', fontWeight: 700, color: '#34261B' }}>
                Complete 6-Tier Honey Traceability Lineage
              </h4>
              <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>
                HoneyChain preserves unbroken provenance from apiary yard and hive frame to final laboratory specimen.
              </p>

              {/* Lineage Tree */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  paddingLeft: '20px',
                  borderLeft: '2px solid #CBD5E1'
                }}
              >
                {/* 1. Apiary */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-27px',
                      top: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#718F71'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#718F71', fontWeight: 700, textTransform: 'uppercase' }}>
                    1. Origin Apiary Yard
                  </div>
                  <strong style={{ fontSize: '13.5px', color: '#34261B' }}>
                    {traceability?.apiaries[0]?.name || 'Meadowbrook Apiary'} ({traceability?.apiaries[0]?.code || 'AP1'})
                  </strong>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Region: {traceability?.apiaries[0]?.region || 'Cascade Foothills'}
                  </div>
                </div>

                {/* 2. Hive */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-27px',
                      top: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#D99A24'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#D99A24', fontWeight: 700, textTransform: 'uppercase' }}>
                    2. Origin Colony & Hive
                  </div>
                  <strong style={{ fontSize: '13.5px', color: '#34261B' }}>
                    {traceability?.hives[0]?.name || 'Hive 01 (Cedar Queen)'} (Code: {traceability?.hives[0]?.code || 'H001'})
                  </strong>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Yard location: {traceability?.hives[0]?.location || 'South Ridge'}
                  </div>
                </div>

                {/* 3. Harvest Frame & Handover */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-27px',
                      top: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#D99A24'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#D99A24', fontWeight: 700, textTransform: 'uppercase' }}>
                    3. Harvest Material & Frame Code
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                    {(sample.sourceTraceabilityCodes || ['AP1H001F1']).map(code => (
                      <span
                        key={code}
                        style={{
                          fontSize: '12px',
                          padding: '3px 8px',
                          backgroundColor: '#FFF9EF',
                          border: '1px solid #D99A24',
                          borderRadius: '4px',
                          fontWeight: 600,
                          color: '#34261B'
                        }}
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Processing Batch */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-27px',
                      top: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#2563EB'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700, textTransform: 'uppercase' }}>
                    4. Processing Extraction Batch
                  </div>
                  <strong style={{ fontSize: '13.5px', color: '#172033' }}>
                    {sample.sourceBatchNumber}
                  </strong>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Settling tank maturation composite sample (250 mL)
                  </div>
                </div>

                {/* 5. Laboratory Sample */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-27px',
                      top: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#2563EB'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700, textTransform: 'uppercase' }}>
                    5. Laboratory Sample Identity
                  </div>
                  <strong style={{ fontSize: '14px', color: '#2563EB' }}>
                    {sample.id}
                  </strong>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Tamper seal: {sample.sealCondition}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHAIN OF CUSTODY (Section 14, 52) */}
          {activeTab === 'CUSTODY' && (
            <div>
              <h4 style={{ margin: '0 0 12px', fontSize: '14.5px', fontWeight: 700, color: '#34261B' }}>
                Sample Chain of Custody Ledger
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(sample.chainOfCustody || []).map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      fontSize: '12.5px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: '#34261B', fontSize: '13px' }}>{step.action}</strong>
                      <span style={{ color: '#64748B', fontSize: '11.5px' }}>
                        {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ color: '#475569', fontSize: '12px' }}>
                      Transfer: <strong>{step.from}</strong> → <strong>{step.to}</strong>
                    </div>
                    <div style={{ color: '#64748B', fontSize: '11.5px', marginTop: '3px' }}>
                      Actor: {step.actor} · Reason: {step.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: QUALITY RECOMMENDATION VS DECISION (Section 3, 41, 42) */}
          {activeTab === 'RECOMMENDATION' && (
            <div>
              {/* Important Separation Banner */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  marginBottom: '16px',
                  fontSize: '12.5px',
                  color: '#1E40AF',
                  display: 'flex',
                  gap: '8px'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Domain Separation Guard:</strong> Laboratory results and recommendations do NOT constitute a final Quality Decision. Only authorized Quality personnel can release or reject a lot.
                </div>
              </div>

              {/* 1. Laboratory Quality Recommendation Section */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  marginBottom: '16px'
                }}
              >
                <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#34261B' }}>
                  Laboratory Quality Recommendation
                </h4>
                {sample.qualityRecommendation ? (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      fontSize: '13px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <CheckCircle2 size={16} color="#2E7D32" />
                      <strong>{QUALITY_RECOMMENDATIONS[sample.qualityRecommendation]?.label || sample.qualityRecommendation}</strong>
                    </div>
                    <p style={{ margin: '4px 0', color: '#475569', fontSize: '12.5px' }}>
                      {sample.recommendationNotes || 'Standard analytical recommendation.'}
                    </p>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>
                      Recommended by {sample.recommenderName} · {new Date(sample.recommendedAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRecommendationSubmit}>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 10px' }}>
                      Submit an analytical recommendation based on executed laboratory test findings:
                    </p>
                    <div style={{ marginBottom: '10px' }}>
                      <select
                        value={recommendationKey}
                        onChange={(e) => setRecommendationKey(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px'
                        }}
                      >
                        {Object.values(QUALITY_RECOMMENDATIONS).map(r => (
                          <option key={r.key} value={r.key}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <textarea
                        value={recommendationNotes}
                        onChange={(e) => setRecommendationNotes(e.target.value)}
                        placeholder="Analytical observation remarks (e.g. moisture within Grade A specification)..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Submit Recommendation
                    </button>
                  </form>
                )}
              </div>

              {/* 2. Final Quality Decision Section (Guarded) */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#34261B' }}>
                    Final Quality Disposition
                  </h4>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: canMakeQualityDecision ? '#EBF7EE' : '#F1F5F9',
                      color: canMakeQualityDecision ? '#2E7D32' : '#64748B',
                      fontWeight: 600
                    }}
                  >
                    {canMakeQualityDecision ? 'Quality Authority Granted' : 'Read-Only Lab Mode'}
                  </span>
                </div>

                {sample.qualityDecision ? (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: sample.qualityDecision === 'RELEASED_FOR_BOTTLING' ? '#EBF7EE' : '#FEF2F2',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px'
                    }}
                  >
                    <strong style={{ color: sample.qualityDecision === 'RELEASED_FOR_BOTTLING' ? '#2E7D32' : '#B91C1C' }}>
                      {QUALITY_DECISIONS[sample.qualityDecision]?.label || sample.qualityDecision}
                    </strong>
                    <p style={{ margin: '4px 0', fontSize: '12.5px', color: '#334155' }}>
                      {sample.qualityDecisionNotes || 'Formal disposition recorded.'}
                    </p>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>
                      Signed by {sample.certifierName} · {new Date(sample.certifiedAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : canMakeQualityDecision ? (
                  <form onSubmit={handleDecisionSubmit}>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 10px' }}>
                      Authorize formal Quality lot disposition:
                    </p>
                    <div style={{ marginBottom: '10px' }}>
                      <select
                        value={decisionKey}
                        onChange={(e) => setDecisionKey(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px'
                        }}
                      >
                        {Object.values(QUALITY_DECISIONS).map(d => (
                          <option key={d.key} value={d.key}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <textarea
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        placeholder="Formal quality disposition notes and certificate reference..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Execute Quality Decision
                    </button>
                  </form>
                ) : (
                  <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', fontSize: '12.5px', color: '#64748B' }}>
                    <Lock size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Awaiting final release decision by authorized Quality Officer. Lab analysts cannot self-approve lots without the <code>QUALITY_DECISION</code> capability.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
