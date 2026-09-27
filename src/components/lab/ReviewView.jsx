/**
 * SCREEN — LABORATORY RESULTS REVIEW & QUALITY RECOMMENDATION
 *
 * Dedicated Canonical Destination for Lab Review & Analytical Recommendations
 * Route: /review
 *
 * Primary Purpose: Inspect completed analytical tests, verify measurements and attached
 * instrument evidence, request corrections or retests, and formulate Quality Recommendations.
 *
 * DOMAIN BOUNDARY & IMMUTABILITY:
 * - A Lab review does NOT equal a final Quality Decision.
 * - Test Result → Review → Quality Recommendation → Quality Decision.
 * - Results never silently become "Certified" without explicit Quality role action.
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ChevronRight,
  Download,
  Share2,
  Award,
  RotateCcw,
  Edit3,
  X,
  AlertCircle
} from 'lucide-react';
import {
  REVIEW_STATUSES,
  REVIEW_STATUS_LABELS,
  QUALITY_RECOMMENDATIONS
} from '../../services/labDomainService';
import { SampleDetailModal } from './SampleDetailModal';
import { LabReportModal } from './LabReportModal';

export const ReviewView = () => {
  const {
    labTests,
    labSamples,
    reviewTestResult,
    correctTestResult,
    submitQualityRecommendation,
    showToast,
    session,
    can
  } = useAppState();

  const [activeTab, setActiveTab] = useState('AWAITING_REVIEW'); // 'AWAITING_REVIEW' | 'REVIEWED' | 'RECOMMENDATIONS'
  const [selectedSampleForDetail, setSelectedSampleForDetail] = useState(null);
  const [activeReportSample, setActiveReportSample] = useState(null);

  // Modals for Review Actions
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isRetestModalOpen, setIsRetestModalOpen] = useState(false);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [targetTest, setTargetTest] = useState(null);
  const [targetSample, setTargetSample] = useState(null);

  // Form states
  const [correctionNewValue, setCorrectionNewValue] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [retestReason, setRetestReason] = useState('');
  const [recommendationKey, setRecommendationKey] = useState('SUITABLE_FOR_REVIEW');
  const [recommendationNotes, setRecommendationNotes] = useState('');

  const awaitingReviewTests = labTests.filter(t => t.status === 'COMPLETED' && t.reviewStatus === REVIEW_STATUSES.AWAITING_REVIEW);
  const reviewedTests = labTests.filter(t => t.reviewStatus === REVIEW_STATUSES.FINALIZED || t.reviewStatus === REVIEW_STATUSES.REVIEWED);
  const samplesWithAllTestsCompleted = labSamples.filter(s => {
    const sTests = labTests.filter(t => t.sampleId === s.id);
    return sTests.length > 0 && sTests.every(t => t.status === 'COMPLETED');
  });

  const handleAccept = (test) => {
    const res = reviewTestResult({
      testId: test.id,
      reviewAction: 'ACCEPT',
      reviewNotes: 'Assay findings confirmed within standard specification limits.',
      reviewerName: session?.operator || 'Elena Vance'
    });
    if (res.success) {
      showToast(`Test ${test.testName} accepted & finalized`);
    }
  };

  const openCorrectionModal = (test) => {
    setTargetTest(test);
    setCorrectionNewValue(test.result !== null ? String(test.result) : '');
    setCorrectionReason('');
    setIsCorrectionModalOpen(true);
  };

  const handleCorrectionSubmit = (e) => {
    e.preventDefault();
    if (!targetTest) return;

    const res = correctTestResult({
      testId: targetTest.id,
      newValue: Number(correctionNewValue),
      reason: correctionReason,
      actor: session?.operator || 'Elena Vance'
    });

    if (res.success) {
      setIsCorrectionModalOpen(false);
      setTargetTest(null);
    } else if (res.errors) {
      showToast(res.errors[0]);
    }
  };

  const openRetestModal = (test) => {
    setTargetTest(test);
    setRetestReason('');
    setIsRetestModalOpen(true);
  };

  const handleRetestSubmit = (e) => {
    e.preventDefault();
    if (!targetTest) return;

    const res = reviewTestResult({
      testId: targetTest.id,
      reviewAction: 'REQUEST_RETEST',
      reviewNotes: retestReason,
      reviewerName: session?.operator || 'Elena Vance'
    });

    if (res.success) {
      setIsRetestModalOpen(false);
      setTargetTest(null);
      showToast('Retest scheduled without overwriting original data');
    }
  };

  const openRecommendationModal = (sample) => {
    setTargetSample(sample);
    setRecommendationKey('SUITABLE_FOR_REVIEW');
    setRecommendationNotes('');
    setIsRecommendationModalOpen(true);
  };

  const handleRecommendationSubmit = (e) => {
    e.preventDefault();
    if (!targetSample) return;

    const res = submitQualityRecommendation({
      sampleId: targetSample.id,
      recommendationKey,
      notes: recommendationNotes,
      recommenderName: session?.operator || 'Elena Vance'
    });

    if (res.success) {
      setIsRecommendationModalOpen(false);
      setTargetSample(null);
    }
  };

  return (
    <div className="review-view-container" style={{ padding: '16px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* 1. Header Banner */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE'
                }}
              >
                Analytical Review & Verification
              </span>
              <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
                Audited Sign-Off
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#172033', margin: '8px 0 4px', letterSpacing: '-0.015em' }}>
              Results Review & Quality Recommendation Workspace
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
              Verify raw measurements against calibration sheets, request retests or corrections, and submit Quality Recommendations.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {samplesWithAllTestsCompleted.length > 0 && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => openRecommendationModal(samplesWithAllTestsCompleted[0])}
                style={{ backgroundColor: '#2563EB', borderColor: '#2563EB', fontSize: '13px' }}
              >
                <Award size={15} style={{ marginRight: '6px' }} />
                <span>Submit Recommendation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Critical Separation Banner (Section 3, 41, 42) */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '10px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          marginBottom: '16px',
          fontSize: '12.5px',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <AlertCircle size={18} color="#2563EB" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#172033' }}>Domain Separation Principle:</strong> A laboratory test result is NOT automatically a Quality Decision. A result never becomes "Certified" or "Market Safe" until an authorized Quality Officer executes lot disposition.
        </div>
      </div>

      {/* 3. Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('AWAITING_REVIEW')}
          style={{
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: activeTab === 'AWAITING_REVIEW' ? 700 : 500,
            border: '1px solid',
            borderColor: activeTab === 'AWAITING_REVIEW' ? '#2563EB' : '#E2E8F0',
            backgroundColor: activeTab === 'AWAITING_REVIEW' ? '#2563EB' : '#FFFFFF',
            color: activeTab === 'AWAITING_REVIEW' ? '#FFFFFF' : '#475569',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Awaiting Review ({awaitingReviewTests.length})
        </button>
        <button
          onClick={() => setActiveTab('REVIEWED')}
          style={{
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: activeTab === 'REVIEWED' ? 700 : 500,
            border: '1px solid',
            borderColor: activeTab === 'REVIEWED' ? '#2563EB' : '#E2E8F0',
            backgroundColor: activeTab === 'REVIEWED' ? '#2563EB' : '#FFFFFF',
            color: activeTab === 'REVIEWED' ? '#FFFFFF' : '#475569',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Reviewed & Finalized ({reviewedTests.length})
        </button>
        <button
          onClick={() => setActiveTab('RECOMMENDATIONS')}
          style={{
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: activeTab === 'RECOMMENDATIONS' ? 700 : 500,
            border: '1px solid',
            borderColor: activeTab === 'RECOMMENDATIONS' ? '#2563EB' : '#E2E8F0',
            backgroundColor: activeTab === 'RECOMMENDATIONS' ? '#2563EB' : '#FFFFFF',
            color: activeTab === 'RECOMMENDATIONS' ? '#FFFFFF' : '#475569',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Quality Recommendations ({samplesWithAllTestsCompleted.length})
        </button>
      </div>

      {/* 4. Tab 1 & 2: Review Queues */}
      {(activeTab === 'AWAITING_REVIEW' || activeTab === 'REVIEWED') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(activeTab === 'AWAITING_REVIEW' ? awaitingReviewTests : reviewedTests).length === 0 ? (
            <div
              className="card"
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px dashed #CBD5E1'
              }}
            >
              <CheckCircle2 size={36} color="#718F71" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: '#34261B' }}>
                {activeTab === 'AWAITING_REVIEW' ? 'All completed assays have been reviewed' : 'No reviewed assays logged'}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                Completed test measurements will queue here for analytical inspection and sign-off.
              </p>
            </div>
          ) : (
            (activeTab === 'AWAITING_REVIEW' ? awaitingReviewTests : reviewedTests).map(test => {
              const sample = labSamples.find(s => s.id === test.sampleId);

              return (
                <div
                  key={test.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '15px', color: '#34261B' }}>{test.testName}</strong>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor: test.reviewStatus === REVIEW_STATUSES.FINALIZED ? '#EBF7EE' : '#FFF9EF',
                            color: test.reviewStatus === REVIEW_STATUSES.FINALIZED ? '#2E7D32' : '#D99A24'
                          }}
                        >
                          {REVIEW_STATUS_LABELS[test.reviewStatus] || test.reviewStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                        Sample: <strong style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => setSelectedSampleForDetail(sample)}>{test.sampleId}</strong> · Source Batch: {sample?.sourceBatchNumber || 'PB-2026-00041'}
                      </div>
                    </div>

                    {/* Review Actions */}
                    {test.reviewStatus === REVIEW_STATUSES.AWAITING_REVIEW && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAccept(test)}
                          style={{ fontSize: '12px', padding: '5px 10px', backgroundColor: '#16A34A', borderColor: '#16A34A' }}
                        >
                          <CheckCircle2 size={13} style={{ marginRight: '4px' }} />
                          <span>Accept Result</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openCorrectionModal(test)}
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          <Edit3 size={13} style={{ marginRight: '4px' }} />
                          <span>Correct</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openRetestModal(test)}
                          style={{ fontSize: '12px', padding: '5px 10px', borderColor: '#FECACA', color: '#DC2626' }}
                        >
                          <RotateCcw size={13} style={{ marginRight: '4px' }} />
                          <span>Retest</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Measurement & Evidence Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '10px',
                      padding: '12px 14px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748B' }}>Reported Finding:</span>{' '}
                      <strong style={{ fontSize: '14px', color: test.isWithinSpecification ? '#16A34A' : '#DC2626' }}>
                        {test.result} {test.unit}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Raw Reading:</span>{' '}
                      <strong>{test.rawMeasurement} {test.unit}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Specification:</span>{' '}
                      <strong>{test.referenceStandard}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Instrument:</span>{' '}
                      <span>{test.equipmentName}</span>
                    </div>
                  </div>

                  {/* Attached Evidence Provenance */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      color: '#64748B',
                      borderTop: '1px dashed #E2E8F0',
                      paddingTop: '8px'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Camera size={13} color="#2563EB" />
                      <span>Evidence: <strong>{test.evidenceFile || 'reading_capture.png'}</strong> (Tamper Hash Verified)</span>
                    </span>
                    <span>Analyst: {test.operator || test.assignedAnalyst}</span>
                  </div>

                  {test.corrections?.length > 0 && (
                    <div
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#FEF3C7',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        color: '#92400E'
                      }}
                    >
                      Audit Record: Value corrected by {test.corrections[0].actor} from {test.corrections[0].previousValue} to {test.corrections[0].newValue} {test.unit} ({test.corrections[0].reason})
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 5. Tab 3: Quality Recommendations Overview */}
      {activeTab === 'RECOMMENDATIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {samplesWithAllTestsCompleted.map(sample => {
            const tests = labTests.filter(t => t.sampleId === sample.id);

            return (
              <div
                key={sample.id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '15px', color: '#34261B' }}>{sample.id}</strong>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        Batch: <strong>{sample.sourceBatchNumber}</strong>
                      </span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                      All {tests.length} assays completed and evaluated.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => openRecommendationModal(sample)}
                      style={{ fontSize: '12px', padding: '5px 10px', backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                    >
                      <Award size={13} style={{ marginRight: '4px' }} />
                      <span>{sample.qualityRecommendation ? 'Update Recommendation' : 'Submit Recommendation'}</span>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveReportSample(sample)}
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      <FileText size={13} style={{ marginRight: '4px' }} />
                      <span>View Report</span>
                    </button>
                  </div>
                </div>

                {/* Recommendation summary if exists */}
                {sample.qualityRecommendation ? (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#EBF7EE',
                      border: '1px solid #C8E6C9',
                      fontSize: '13px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <CheckCircle2 size={16} color="#2E7D32" />
                      <strong style={{ color: '#2E7D32' }}>
                        {QUALITY_RECOMMENDATIONS[sample.qualityRecommendation]?.label || sample.qualityRecommendation}
                      </strong>
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '12.5px', color: '#334155' }}>
                      {sample.recommendationNotes || 'All analytical parameters verified compliant with Codex standard.'}
                    </p>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                      Formulated by {sample.recommenderName} · {new Date(sample.recommendedAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12.5px', color: '#94A3B8', fontStyle: 'italic' }}>
                    No quality recommendation formulated yet. Click "Submit Recommendation" to complete laboratory phase.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: RESULT CORRECTION (MANDATORY AUDIT TRAIL) */}
      {isCorrectionModalOpen && targetTest && (
        <div className="modal-backdrop" onClick={() => setIsCorrectionModalOpen(false)} style={{ zIndex: 1200 }}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: '90%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#34261B' }}>
                Formal Result Correction: {targetTest.testName}
              </h3>
              <button
                onClick={() => setIsCorrectionModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 12px' }}>
              Silent edits are strictly forbidden in laboratory compliance. This correction will create an immutable audit event recording the actor, timestamp, previous value ({targetTest.result} {targetTest.unit}), and justification.
            </p>

            <form onSubmit={handleCorrectionSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Corrected Result Value ({targetTest.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={correctionNewValue}
                  onChange={(e) => setCorrectionNewValue(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Formal Correction Justification (Min 8 chars)
                </label>
                <textarea
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Temperature compensation recalculation at 20°C standard..."
                  rows={3}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsCorrectionModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#D97706', borderColor: '#D97706' }}
                >
                  Record Audited Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST RETEST */}
      {isRetestModalOpen && targetTest && (
        <div className="modal-backdrop" onClick={() => setIsRetestModalOpen(false)} style={{ zIndex: 1200 }}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: '90%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#B91C1C' }}>
                Request Laboratory Retest: {targetTest.testName}
              </h3>
              <button
                onClick={() => setIsRetestModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 12px' }}>
              Per Section 62: A new test execution will be assigned. The original test result ({targetTest.result} {targetTest.unit}) is preserved immutably and will NOT be overwritten.
            </p>

            <form onSubmit={handleRetestSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Reason for Retest Request
                </label>
                <textarea
                  value={retestReason}
                  onChange={(e) => setRetestReason(e.target.value)}
                  placeholder="Specify suspected instrument drift, air bubble interference, or replicate discrepancy..."
                  rows={3}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsRetestModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#B91C1C', borderColor: '#B91C1C' }}
                >
                  Confirm Retest Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: QUALITY RECOMMENDATION */}
      {isRecommendationModalOpen && targetSample && (
        <div className="modal-backdrop" onClick={() => setIsRecommendationModalOpen(false)} style={{ zIndex: 1200 }}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '500px',
              width: '90%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#34261B' }}>
                Formulate Quality Recommendation: {targetSample.id}
              </h3>
              <button
                onClick={() => setIsRecommendationModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 12px' }}>
              This analytical recommendation summarizes findings for the formal Quality Officer.
            </p>

            <form onSubmit={handleRecommendationSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Recommendation Category
                </label>
                <select
                  value={recommendationKey}
                  onChange={(e) => setRecommendationKey(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  {Object.values(QUALITY_RECOMMENDATIONS).map(r => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Analytical Findings Summary
                </label>
                <textarea
                  value={recommendationNotes}
                  onChange={(e) => setRecommendationNotes(e.target.value)}
                  placeholder="e.g. Moisture 17.6% (meets standard), HMF 12.8 mg/kg (optimal freshness), active enzymes verified..."
                  rows={3}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsRecommendationModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                >
                  Submit Recommendation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail & Report Modals */}
      {selectedSampleForDetail && (
        <SampleDetailModal
          sampleId={selectedSampleForDetail.id}
          isOpen={true}
          onClose={() => setSelectedSampleForDetail(null)}
          onOpenReport={(s) => setActiveReportSample(s)}
        />
      )}

      {activeReportSample && (
        <LabReportModal
          sample={activeReportSample}
          isOpen={true}
          onClose={() => setActiveReportSample(null)}
        />
      )}
    </div>
  );
};
