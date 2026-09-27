import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppState } from '../../context/AppStateContext';
import {
  ArrowLeft,
  X,
  Droplets,
  Calendar,
  Scale,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  Info,
  Clock,
  User,
  Layers,
  Edit3,
  Check,
  CheckCircle2,
  FileText,
  Sliders,
  Sparkles,
  FlaskConical,
  FileCheck,
  AlertCircle,
  HelpCircle,
  PauseCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

/**
 * SCREEN 24 — QUALITY CHECK
 * 
 * Master UI/UX + Honey Quality Workflow + Evidence + Decision
 * Transition: Processing → Quality
 * Answers: "What needs to be checked for this honey batch, and is the quality review complete?"
 * Simple professional quality workflow — human evidence first.
 */

export const QualityCheckView = ({ isOpen, onClose, payload }) => {
  const {
    qualityChecks,
    updateQualityCheck,
    completeQualityDecision,
    batches,
    setSelectedBatchId,
    setActiveTab,
    showToast,
    apiary
  } = useAppState();

  // Selected Quality Check Record Resolution
  const [activeQcId, setActiveQcId] = useState(
    payload?.qcId ||
    (payload?.batchId ? (qualityChecks || []).find(q => q.batchId === payload.batchId)?.id : null) ||
    'qc-batch-hc-2409'
  );

  const qc = useMemo(() => {
    const availableQualityChecks = Array.isArray(qualityChecks) ? qualityChecks : [];
    return availableQualityChecks.find(q => q.id === activeQcId) || availableQualityChecks[0];
  }, [qualityChecks, activeQcId]);

  // UI Modal / Dialog States
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [activeTestToEdit, setActiveTestToEdit] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isTechDetailsOpen, setIsTechDetailsOpen] = useState(false);
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isHoldConfirmOpen, setIsHoldConfirmOpen] = useState(false);

  // Result Entry Form State
  const [entryValue, setEntryValue] = useState('');
  const [entryNotes, setEntryNotes] = useState('');
  const [entryTester, setEntryTester] = useState('Elena Vance');
  const [entryReason, setEntryReason] = useState('');

  // Review Form State
  const [reviewNotes, setReviewNotes] = useState('');

  // When opening a test to edit or enter
  const handleOpenTestEntry = (test) => {
    setActiveTestToEdit(test);
    setEntryValue(test.result !== null && test.result !== undefined ? String(test.result) : '');
    setEntryNotes(test.notes || '');
    setEntryTester(test.testedBy || 'Elena Vance');
    setEntryReason('');
    setIsResultModalOpen(true);
  };

  // Rule Evaluation Helper for Current Entry
  const currentValidation = useMemo(() => {
    if (!activeTestToEdit) return { isValid: false, status: 'pending', message: '' };

    if (activeTestToEdit.inputType === 'numeric') {
      const num = parseFloat(entryValue);
      if (isNaN(num)) {
        return { isValid: false, status: 'invalid', message: 'Enter a valid numeric value.' };
      }
      if (activeTestToEdit.acceptableMin !== undefined && num < activeTestToEdit.acceptableMin) {
        return {
          isValid: true,
          status: 'needs_attention',
          message: `Result (${num} ${activeTestToEdit.unit}) is below configured standard (${activeTestToEdit.acceptableMin} - ${activeTestToEdit.acceptableMax} ${activeTestToEdit.unit}).`
        };
      }
      if (activeTestToEdit.acceptableMax !== undefined && num > activeTestToEdit.acceptableMax) {
        return {
          isValid: true,
          status: 'needs_attention',
          message: `Result (${num} ${activeTestToEdit.unit}) exceeds configured requirement (max ${activeTestToEdit.acceptableMax} ${activeTestToEdit.unit}). Review result and supporting evidence.`
        };
      }
      return {
        isValid: true,
        status: 'passed',
        message: `Within configured range (${activeTestToEdit.expectedRangeText || ''})`
      };
    }

    if (activeTestToEdit.inputType === 'selection') {
      if (!entryValue) return { isValid: false, status: 'invalid', message: 'Please select a result.' };
      if (entryValue === 'Pass' || entryValue === 'Meets standard') {
        return { isValid: true, status: 'passed', message: 'Meets configured standard requirement.' };
      }
      return { isValid: true, status: 'needs_attention', message: 'Selected result requires follow-up review.' };
    }

    return { isValid: true, status: 'passed', message: 'Result recorded.' };
  }, [activeTestToEdit, entryValue]);

  // Save Test Result (Sections 21-27, 41, 42)
  const handleSaveResult = (e) => {
    e.preventDefault();
    if (!activeTestToEdit || !currentValidation.isValid) return;

    const isCorrection = activeTestToEdit.result !== null && activeTestToEdit.result !== undefined;
    if (isCorrection && !entryReason.trim()) {
      showToast('A reason is required when adjusting an existing test result');
      return;
    }

    const parsedVal = activeTestToEdit.inputType === 'numeric' ? parseFloat(entryValue) : entryValue;

    const newHistory = [...(activeTestToEdit.history || [])];
    if (isCorrection) {
      newHistory.unshift({
        timestamp: 'Just now',
        action: 'Result corrected',
        value: `${parsedVal} ${activeTestToEdit.unit || ''}`,
        author: entryTester || 'You',
        reason: entryReason.trim()
      });
    } else {
      newHistory.unshift({
        timestamp: 'Just now',
        action: 'Result recorded',
        value: `${parsedVal} ${activeTestToEdit.unit || ''}`,
        author: entryTester || 'You'
      });
    }

    const updatedTests = qc.tests.map((t) => {
      if (t.id === activeTestToEdit.id) {
        return {
          ...t,
          result: parsedVal,
          status: currentValidation.status,
          statusText: currentValidation.message,
          testedAt: 'Today · Just now',
          testedBy: entryTester || 'Elena Vance',
          notes: entryNotes.trim(),
          history: newHistory
        };
      }
      return t;
    });

    // Re-evaluate overall batch quality state
    const requiredTests = updatedTests.filter((t) => t.required);
    const anyIncomplete = requiredTests.some((t) => t.result === null || t.result === undefined || t.result === '');
    const anyAttention = requiredTests.some((t) => t.status === 'needs_attention' || t.status === 'failed');

    let nextOverallStatus = 'in_progress';
    let nextOverallLabel = 'Quality check in progress';

    if (anyIncomplete) {
      nextOverallStatus = 'in_progress';
      nextOverallLabel = 'Quality check in progress';
    } else if (anyAttention) {
      nextOverallStatus = 'needs_attention';
      nextOverallLabel = 'Quality needs attention';
    } else {
      nextOverallStatus = 'ready_for_review';
      nextOverallLabel = 'Ready for review';
    }

    updateQualityCheck(qc.id, {
      tests: updatedTests,
      status: nextOverallStatus,
      statusLabel: nextOverallLabel
    });

    showToast(`Recorded ${activeTestToEdit.name} result: ${parsedVal} ${activeTestToEdit.unit || ''}`);
    setIsResultModalOpen(false);
  };

  // Perform Final Quality Decision (Sections 28-35)
  const handleDecision = (decisionType) => {
    completeQualityDecision(qc.id, decisionType, reviewNotes.trim() || 'All required quality criteria evaluated.');
    setIsReviewModalOpen(false);
    if (decisionType === 'PASSED') {
      showToast('Quality check passed! Batch is certified for packaging.');
    } else if (decisionType === 'NEEDS_ATTENTION') {
      showToast('Batch flagged for quality follow-up and re-testing.');
    } else if (decisionType === 'HOLD') {
      showToast('Batch placed on operational hold.');
    }
  };

  // Quick preset loading for demonstration (§ 54)
  const applyPreset = (presetKey) => {
    if (presetKey === 'ready_for_review') {
      updateQualityCheck(qc.id, {
        status: 'ready_for_review',
        statusLabel: 'Ready for review',
        tests: [
          {
            ...qc.tests[0],
            result: 17.8,
            status: 'passed',
            statusText: 'Within configured range (15.0% - 18.5%)'
          },
          {
            ...qc.tests[1],
            result: 'Pass',
            status: 'passed',
            statusText: 'Meets standard requirement'
          },
          {
            ...qc.tests[2],
            result: 12.4,
            status: 'passed',
            statusText: 'Within configured range (< 40.0 mg/kg)'
          },
          qc.tests[3],
          qc.tests[4]
        ],
        review: { reviewerName: null, reviewedAt: null, decision: null, notes: '' }
      });
      showToast('Preset: Ready for Review (All 3 required tests passed)');
    } else if (presetKey === 'in_progress') {
      updateQualityCheck(qc.id, {
        status: 'in_progress',
        statusLabel: 'Quality check in progress',
        tests: [
          {
            ...qc.tests[0],
            result: 17.8,
            status: 'passed',
            statusText: 'Within configured range'
          },
          {
            ...qc.tests[1],
            result: null,
            status: 'pending',
            statusText: 'Result needed'
          },
          {
            ...qc.tests[2],
            result: null,
            status: 'pending',
            statusText: 'Result needed'
          },
          qc.tests[3],
          qc.tests[4]
        ],
        review: { reviewerName: null, reviewedAt: null, decision: null, notes: '' }
      });
      showToast('Preset: In Progress (1 of 3 complete)');
    } else if (presetKey === 'needs_attention') {
      updateQualityCheck(qc.id, {
        status: 'needs_attention',
        statusLabel: 'Quality needs attention',
        tests: [
          {
            ...qc.tests[0],
            result: 19.2,
            status: 'needs_attention',
            statusText: 'Moisture exceeds configured maximum (18.5%)'
          },
          {
            ...qc.tests[1],
            result: 'Pass',
            status: 'passed',
            statusText: 'Meets standard requirement'
          },
          {
            ...qc.tests[2],
            result: 12.4,
            status: 'passed',
            statusText: 'Within configured range'
          },
          qc.tests[3],
          qc.tests[4]
        ],
        review: { reviewerName: null, reviewedAt: null, decision: null, notes: '' }
      });
      showToast('Preset: Needs Attention (Moisture 19.2% out of range)');
    } else if (presetKey === 'not_started') {
      updateQualityCheck(qc.id, {
        status: 'not_started',
        statusLabel: 'Quality check not started',
        tests: qc.tests.map(t => ({
          ...t,
          result: null,
          status: 'pending',
          statusText: 'Result needed'
        })),
        review: { reviewerName: null, reviewedAt: null, decision: null, notes: '' }
      });
      showToast('Preset: Not Started (Blank quality check)');
    }
    setIsDemoDrawerOpen(false);
  };

  // Quality checks may be empty before a batch enters the quality workflow.
  // Do not calculate or render record details until one is available.
  if (!isOpen || !qc) return null;

  // Progress metrics
  const requiredTests = qc.tests.filter(t => t.required);
  const completedRequiredCount = requiredTests.filter(t => t.result !== null && t.result !== undefined && t.result !== '').length;
  const isAllRequiredDone = completedRequiredCount === requiredTests.length;
  const isPassed = qc.status === 'passed';

  return createPortal(
    <div className="qc-view-overlay" role="dialog" aria-modal="true">
      <div className="qc-view-container">
        {/* TOP BAR / HEADER (Sections 5 & 6) */}
        <header className="qc-header">
          <div className="qc-header-top-row">
            <button
              type="button"
              className="qc-back-btn"
              onClick={onClose}
              aria-label="Back to previous screen"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className="qc-header-right-actions">
              <button
                type="button"
                className="qc-demo-btn"
                onClick={() => setIsDemoDrawerOpen(true)}
                title="Jury Simulation Presets"
              >
                <Sliders size={13} />
                <span>Demo</span>
              </button>
              <button
                type="button"
                className="qc-close-btn"
                onClick={onClose}
                aria-label="Close quality check"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="qc-header-title-row">
            <div>
              <h1 className="qc-title">Quality check</h1>
              <p className="qc-subtitle">
                {qc.batchName} · {qc.batchNumber}
              </p>
            </div>

            <div className={`qc-status-badge ${qc.status}`}>
              <span className="qc-status-dot" />
              <span>
                {qc.status === 'passed' && 'Passed'}
                {qc.status === 'ready_for_review' && 'Ready for review'}
                {qc.status === 'in_progress' && 'In progress'}
                {qc.status === 'needs_attention' && 'Needs attention'}
                {qc.status === 'not_started' && 'Not started'}
                {qc.status === 'awaiting_results' && 'Awaiting'}
                {qc.status === 'failed' && 'Failed'}
              </span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT BODY */}
        <div className="qc-body-scroll">
          {/* PASSED BANNER (Section 31) */}
          {isPassed && (
            <div className="qc-passed-banner">
              <div className="qc-passed-icon">
                <CheckCircle2 size={20} color="#4F7A52" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '14.5px', color: '#4F7A52', fontWeight: 700 }}>
                  Quality check passed
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#34261B', lineHeight: 1.4 }}>
                  All required quality checks meet configured standards. Batch is ready for packaging.
                </p>
                {qc.review?.reviewedAt && (
                  <span style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: '#786D61' }}>
                    Reviewed by {qc.review.reviewerName} · {qc.review.reviewedAt}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ATTENTION BANNER (Section 32) */}
          {qc.status === 'needs_attention' && (
            <div className="qc-attention-banner">
              <AlertTriangle size={18} color="#D9822B" />
              <div>
                <strong style={{ fontSize: '13px', color: '#8F4E0A', display: 'block' }}>
                  One or more test results require review
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#5A3810', lineHeight: 1.35 }}>
                  Moisture or parameter reading is outside the configured range. Review findings or record a retest.
                </p>
              </div>
            </div>
          )}

          {/* BATCH CONTEXT HERO CARD (Section 7) */}
          <section className="qc-hero-card">
            <div className="qc-hero-top">
              <span className="qc-hero-kicker">HONEY BATCH CONTEXT</span>
              <span className="qc-hero-type-tag">{qc.honeyType || 'Wildflower'}</span>
            </div>

            <div className="qc-hero-metric-wrap">
              <span className="qc-hero-metric">{qc.batchName}</span>
            </div>

            <p className="qc-hero-statement">
              Originating from <strong>{qc.sourceHiveName}</strong> at {qc.sourceApiary}.
            </p>

            <div className="qc-hero-grid">
              <div>
                <span className="qc-hg-label">HARVEST WEIGHT</span>
                <span className="qc-hg-val">{qc.collectionQuantityKg} kg net</span>
              </div>
              <div>
                <span className="qc-hg-label">HARVEST DATE</span>
                <span className="qc-hg-val">{qc.collectionDate}</span>
              </div>
              <div>
                <span className="qc-hg-label">BATCH CODE</span>
                <span className="qc-hg-val">{qc.batchNumber}</span>
              </div>
              <div>
                <span className="qc-hg-label">STAGE</span>
                <span className="qc-hg-val" style={{ color: isPassed ? '#4F7A52' : '#B87316' }}>
                  {isPassed ? 'Ready for Packaging' : 'Quality Testing'}
                </span>
              </div>
            </div>
          </section>

          {/* TRACEABILITY MINI-JOURNEY (§ 8) */}
          <section className="qc-card">
            <span className="qc-hg-label" style={{ marginBottom: '8px', display: 'block' }}>
              TRACEABLE HONEY JOURNEY:
            </span>
            <div className="qc-journey-stepper">
              <div className="qc-journey-step completed">
                <div className="qc-step-circle"><Check size={11} /></div>
                <span>Collection</span>
              </div>
              <div className="qc-journey-line completed" />
              <div className="qc-journey-step completed">
                <div className="qc-step-circle"><Check size={11} /></div>
                <span>Processing</span>
              </div>
              <div className="qc-journey-line completed" />
              <div className={`qc-journey-step ${isPassed ? 'completed' : 'active'}`}>
                <div className="qc-step-circle">{isPassed ? <Check size={11} /> : '●'}</div>
                <span>Quality</span>
              </div>
              <div className={`qc-journey-line ${isPassed ? 'active' : ''}`} />
              <div className={`qc-journey-step ${isPassed ? 'active' : ''}`}>
                <div className="qc-step-circle">{isPassed ? '●' : '○'}</div>
                <span>Packaging</span>
              </div>
              <div className="qc-journey-line" />
              <div className="qc-journey-step">
                <div className="qc-step-circle">○</div>
                <span>Verified</span>
              </div>
            </div>
            <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#786D61', textAlign: 'center' }}>
              Current stage: <strong style={{ color: '#34261B' }}>{isPassed ? 'Packaging' : 'Quality'}</strong>
            </div>
          </section>

          {/* SAMPLE RECORD (§ 18 & 19) */}
          <section className="qc-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FlaskConical size={16} color="#B87316" />
                <strong style={{ fontSize: '14px', color: '#34261B' }}>Sample record</strong>
              </div>
              <span className="qc-sample-id-badge">{qc.sample?.sampleId || 'Sample Q-1042'}</span>
            </div>

            <div className="qc-sample-body">
              <p className="qc-sample-desc">
                {qc.sample?.notes || 'Homogenized composite sample drawn from maturation tank #2 after 24h cold settling.'}
              </p>
              <div className="qc-sample-meta">
                <span>Collected: <strong>{qc.sample?.collectedAt}</strong></span>
                <span>Collected by: <strong>{qc.sample?.collectedBy}</strong></span>
                <span>Volume: <strong>{qc.sample?.quantity || '250 ml'}</strong></span>
              </div>
            </div>
          </section>

          {/* REQUIRED QUALITY CHECKS OVERVIEW (§ 9, 10, 11, 15, 16) */}
          <section className="qc-card">
            <div className="qc-section-header">
              <div>
                <strong style={{ fontSize: '14px', color: '#34261B' }}>Required checks</strong>
                <span className="qc-progress-subtext">
                  {completedRequiredCount} of {requiredTests.length} required checks complete
                </span>
              </div>
              <span className={`qc-completion-chip ${isAllRequiredDone ? 'done' : ''}`}>
                {isAllRequiredDone ? 'All Recorded' : `${requiredTests.length - completedRequiredCount} Needed`}
              </span>
            </div>

            <div className="qc-test-list">
              {requiredTests.map((test) => {
                const isComplete = test.result !== null && test.result !== undefined && test.result !== '';
                const isAttention = test.status === 'needs_attention';

                return (
                  <div key={test.id} className={`qc-test-row ${isAttention ? 'attention' : ''}`}>
                    <div className="qc-test-left">
                      <div className="qc-test-icon-slot">
                        {isComplete ? (
                          isAttention ? (
                            <AlertTriangle size={15} color="#D9822B" />
                          ) : (
                            <CheckCircle2 size={15} color="#4F7A52" />
                          )
                        ) : (
                          <div className="qc-pending-circle" />
                        )}
                      </div>
                      <div className="qc-test-info">
                        <div className="qc-test-title-line">
                          <strong className="qc-test-name">{test.name}</strong>
                          <span className="qc-required-pill">Required</span>
                        </div>
                        <p className="qc-test-standard">{test.expectedRangeText}</p>
                        <span className="qc-test-method">Method: {test.referenceStandard}</span>

                        {isComplete && (
                          <div className="qc-test-result-callout">
                            <span className="qc-recorded-val">
                              {test.result} {test.unit && test.unit !== 'standard' ? test.unit : ''}
                            </span>
                            <span className={`qc-eval-label ${test.status}`}>
                              {test.statusText || (isAttention ? 'Needs attention' : 'Passed')}
                            </span>
                          </div>
                        )}
                        {!isComplete && (
                          <span className="qc-result-needed">Result needed</span>
                        )}
                      </div>
                    </div>

                    <div className="qc-test-action">
                      <button
                        type="button"
                        className="btn btn-secondary qc-entry-btn"
                        onClick={() => handleOpenTestEntry(test)}
                      >
                        {isComplete ? 'Edit' : 'Enter'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ADDITIONAL EVIDENCE (OPTIONAL) CHECKS (§ 15 & 20) */}
          <section className="qc-card">
            <div className="qc-section-header">
              <div>
                <strong style={{ fontSize: '14px', color: '#34261B' }}>Additional evidence</strong>
                <span className="qc-progress-subtext">Optional quality benchmarks</span>
              </div>
              <span className="qc-optional-pill">Optional</span>
            </div>

            <div className="qc-test-list">
              {qc.tests.filter(t => !t.required).map((test) => {
                const isComplete = test.result !== null && test.result !== undefined && test.result !== '';

                if (test.inputType === 'document') {
                  return (
                    <div key={test.id} className="qc-test-row">
                      <div className="qc-test-left">
                        <div className="qc-test-icon-slot">
                          <FileText size={15} color="#B87316" />
                        </div>
                        <div className="qc-test-info">
                          <strong className="qc-test-name">{test.name}</strong>
                          <p className="qc-test-standard">{test.documentName} ({test.documentSize})</p>
                          <span className="qc-test-method">Uploaded {test.uploadedAt} by {test.uploadedBy}</span>
                        </div>
                      </div>
                      <div className="qc-test-action">
                        <button
                          type="button"
                          className="btn btn-secondary qc-entry-btn"
                          onClick={() => setIsCertModalOpen(true)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={test.id} className="qc-test-row">
                    <div className="qc-test-left">
                      <div className="qc-test-icon-slot">
                        {isComplete ? (
                          <CheckCircle2 size={15} color="#4F7A52" />
                        ) : (
                          <div className="qc-pending-circle" />
                        )}
                      </div>
                      <div className="qc-test-info">
                        <strong className="qc-test-name">{test.name}</strong>
                        <p className="qc-test-standard">{test.expectedRangeText}</p>
                        {isComplete && (
                          <div className="qc-test-result-callout">
                            <span className="qc-recorded-val">{test.result} {test.unit}</span>
                            <span className="qc-eval-label passed">{test.statusText}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="qc-test-action">
                      <button
                        type="button"
                        className="btn btn-secondary qc-entry-btn"
                        onClick={() => handleOpenTestEntry(test)}
                      >
                        {isComplete ? 'Edit' : 'Enter'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* TRACEABILITY STATEMENT (Section 29) */}
          <section className="qc-trace-box">
            <div className="qc-trace-icon">
              <ShieldCheck size={18} color="#4F7A52" />
            </div>
            <div>
              <strong style={{ fontSize: '13px', color: '#34261B', display: 'block' }}>
                Traceable to {qc.sourceHiveName}
              </strong>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#786D61', lineHeight: 1.35 }}>
                Quality verification evidence cryptographically anchored with harvest and processing logs.
              </p>
            </div>
          </section>

          {/* PROGRESSIVE DISCLOSURE: TECHNICAL DIAGNOSTICS (§ 31 & 40) */}
          <div className="qc-tech-accordion">
            <button
              type="button"
              className="qc-tech-toggle-btn"
              onClick={() => setIsTechDetailsOpen(!isTechDetailsOpen)}
            >
              <span>{isTechDetailsOpen ? 'Hide technical details' : 'View technical details'}</span>
              <ChevronRight
                size={14}
                style={{
                  transform: isTechDetailsOpen ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.15s ease'
                }}
              />
            </button>

            {isTechDetailsOpen && (
              <div className="qc-card qc-tech-card">
                <div className="qc-tech-row">
                  <span className="qc-tlabel">QUALITY RECORD ID</span>
                  <span className="qc-tval mono">{qc.id}</span>
                </div>
                <div className="qc-tech-row">
                  <span className="qc-tlabel">SAMPLE REGISTRATION</span>
                  <span className="qc-tval mono">{qc.sample?.sampleId}</span>
                </div>
                <div className="qc-tech-row">
                  <span className="qc-tlabel">BATCH ID</span>
                  <span className="qc-tval mono">{qc.batchId}</span>
                </div>
                <div className="qc-tech-row">
                  <span className="qc-tlabel">SOURCE COLONY ID</span>
                  <span className="qc-tval mono">{qc.sourceHiveId}</span>
                </div>
                <div className="qc-tech-row">
                  <span className="qc-tlabel">EVIDENCE RECORD HASH</span>
                  <span className="qc-tval mono truncate">{qc.blockchain?.recordHash}</span>
                </div>
                <div className="qc-tech-row">
                  <span className="qc-tlabel">SAMPLE TAMPER SEAL</span>
                  <span className="qc-tval mono">{qc.blockchain?.sampleSeal}</span>
                </div>
                <div className="qc-tech-row">
                  <span className="qc-tlabel">LEDGER NOTARIZATION</span>
                  <span className="qc-tval">{qc.blockchain?.ledgerStatus}</span>
                </div>
                <div className="qc-tech-row">
                  <span className="qc-tlabel">ACTION PERMISSIONS</span>
                  <span className="qc-tval">QUALITY_RECORD · QUALITY_APPROVE</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BAR (§ 32, 33, 34) */}
        <footer className="qc-bottom-bar">
          {isPassed ? (
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, height: '46px' }}
                onClick={() => {
                  setSelectedBatchId(qc.batchId);
                  setActiveTab('honey');
                  onClose();
                }}
              >
                View batch
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1.5, height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => {
                  setSelectedBatchId(qc.batchId);
                  setActiveTab('honey');
                  showToast('Advancing batch to packaging stage');
                  onClose();
                }}
              >
                <span>Continue to packaging</span>
                <ChevronRight size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, height: '46px' }}
                onClick={() => setIsHoldConfirmOpen(true)}
              >
                Put on hold
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  flex: 1.6,
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onClick={() => {
                  if (isAllRequiredDone) {
                    setIsReviewModalOpen(true);
                  } else {
                    const firstIncomplete = requiredTests.find(t => t.result === null || t.result === undefined || t.result === '');
                    if (firstIncomplete) handleOpenTestEntry(firstIncomplete);
                  }
                }}
              >
                <FileCheck size={15} />
                <span>{isAllRequiredDone ? 'Review quality' : 'Enter pending test'}</span>
              </button>
            </div>
          )}
        </footer>

        {/* MODAL 1: TEST RESULT ENTRY / EDIT MODAL (§ 11, 12, 21-27, 41, 42) */}
        {isResultModalOpen && activeTestToEdit && (
          <div className="qc-submodal-overlay" role="dialog" aria-modal="true">
            <div className="qc-submodal-card">
              <div className="qc-submodal-head">
                <div>
                  <strong style={{ fontSize: '15px' }}>{activeTestToEdit.name}</strong>
                  <span style={{ display: 'block', fontSize: '11.5px', color: '#786D61', marginTop: '2px' }}>
                    Standard: {activeTestToEdit.referenceStandard}
                  </span>
                </div>
                <button
                  type="button"
                  className="qc-close-btn"
                  onClick={() => setIsResultModalOpen(false)}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Warning for editing existing result (§ 41 & 42) */}
              {activeTestToEdit.result !== null && activeTestToEdit.result !== undefined && (
                <div className="qc-warning-notice">
                  <AlertTriangle size={15} color="#B87316" />
                  <p>Changes to recorded test results are tracked in the auditable changelog.</p>
                </div>
              )}

              <form onSubmit={handleSaveResult} className="qc-edit-form">
                {activeTestToEdit.inputType === 'numeric' && (
                  <div className="qc-form-group">
                    <label className="qc-flabel" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Result Value ({activeTestToEdit.unit})</span>
                      <span style={{ color: '#786D61', fontWeight: 400, fontSize: '11px' }}>
                        {activeTestToEdit.expectedRangeText}
                      </span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        step="0.1"
                        className="qc-finput"
                        placeholder="e.g. 17.8"
                        value={entryValue}
                        onChange={(e) => setEntryValue(e.target.value)}
                        autoFocus
                        required
                        style={{ fontSize: '16px', fontWeight: 600, paddingRight: '44px' }}
                      />
                      <span className="qc-input-unit-tag">{activeTestToEdit.unit}</span>
                    </div>

                    {/* Dynamic rule engine validation feedback (§ 14 & 22) */}
                    {entryValue !== '' && (
                      <div className={`qc-rule-feedback ${currentValidation.status}`}>
                        {currentValidation.status === 'passed' && <Check size={13} />}
                        {currentValidation.status === 'needs_attention' && <AlertTriangle size={13} />}
                        <span>{currentValidation.message}</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTestToEdit.inputType === 'selection' && (
                  <div className="qc-form-group">
                    <label className="qc-flabel">Sensory & Purity Evaluation</label>
                    <select
                      className="qc-finput"
                      value={entryValue}
                      onChange={(e) => setEntryValue(e.target.value)}
                      required
                    >
                      <option value="">Select finding...</option>
                      <option value="Pass">Pass — Clear amber, zero suspended matter</option>
                      <option value="Needs review">Needs review — Slight cloudiness / suspended particles</option>
                      <option value="Fail">Did not meet raw purity standard</option>
                    </select>

                    <div className="qc-form-group" style={{ marginTop: '10px' }}>
                      <label className="qc-flabel">Visual & Olfactory Observation Notes</label>
                      <textarea
                        className="qc-ftextarea"
                        rows={2}
                        placeholder="Note aroma, color depth, or clarity..."
                        value={entryNotes}
                        onChange={(e) => setEntryNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="qc-form-group">
                  <label className="qc-flabel">Tester / Lab Technician</label>
                  <input
                    type="text"
                    className="qc-finput"
                    value={entryTester}
                    onChange={(e) => setEntryTester(e.target.value)}
                    required
                  />
                </div>

                {/* If modifying existing result, require reason (§ 42) */}
                {activeTestToEdit.result !== null && activeTestToEdit.result !== undefined && (
                  <div className="qc-form-group">
                    <label className="qc-flabel" style={{ color: '#D9822B' }}>
                      Reason for Correction *
                    </label>
                    <input
                      type="text"
                      className="qc-finput"
                      placeholder="e.g. Retest after refractometer recalibration"
                      value={entryReason}
                      onChange={(e) => setEntryReason(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="qc-submodal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, height: '42px' }}
                    onClick={() => setIsResultModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1.4, height: '42px' }}
                  >
                    Save result
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: QUALITY REVIEW & DECISION MODAL (§ 28-37) */}
        {isReviewModalOpen && (
          <div className="qc-submodal-overlay" role="dialog" aria-modal="true">
            <div className="qc-submodal-card qc-review-card">
              <div className="qc-submodal-head">
                <div>
                  <strong style={{ fontSize: '15.5px' }}>Review quality</strong>
                  <span style={{ display: 'block', fontSize: '11.5px', color: '#786D61' }}>
                    {qc.batchName} · {qc.batchNumber}
                  </span>
                </div>
                <button
                  type="button"
                  className="qc-close-btn"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  <X size={15} />
                </button>
              </div>

              <div style={{ marginTop: '10px' }}>
                <span className="qc-hg-label" style={{ marginBottom: '6px', display: 'block' }}>
                  RECORDED PARAMETERS FOR REVIEW:
                </span>
                <div className="qc-review-summary-box">
                  {requiredTests.map((t) => (
                    <div key={t.id} className="qc-review-item-row">
                      <div>
                        <strong style={{ fontSize: '13px' }}>{t.name}</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: '#786D61' }}>
                          Standard: {t.expectedRangeText}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="qc-recorded-val" style={{ fontSize: '13.5px' }}>
                          {t.result} {t.unit && t.unit !== 'standard' ? t.unit : ''}
                        </span>
                        <span className={`qc-eval-label ${t.status}`} style={{ display: 'block', marginTop: '2px' }}>
                          {t.status === 'passed' ? 'Meets rule' : 'Needs attention'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="qc-form-group" style={{ marginTop: '12px' }}>
                  <label className="qc-flabel">Quality Review Notes</label>
                  <textarea
                    className="qc-ftextarea"
                    rows={2}
                    placeholder="Add notes about this review..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>

                <div className="qc-reviewer-callout">
                  <User size={14} color="#34261B" />
                  <span>Reviewing as <strong>You (Certified Quality Lead)</strong> · 25 Sep 2026</span>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ height: '46px', backgroundColor: '#4F7A52', borderColor: '#4F7A52' }}
                    onClick={() => handleDecision('PASSED')}
                  >
                    Quality check passed
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ height: '42px', color: '#D9822B' }}
                    onClick={() => handleDecision('NEEDS_ATTENTION')}
                  >
                    Flag for retest / review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: CERTIFICATE PREVIEW MODAL (§ 20) */}
        {isCertModalOpen && (
          <div className="qc-submodal-overlay" role="dialog" aria-modal="true">
            <div className="qc-submodal-card">
              <div className="qc-submodal-head">
                <div>
                  <strong style={{ fontSize: '15px' }}>BioAgro Certified Lab Report</strong>
                  <span style={{ display: 'block', fontSize: '11.5px', color: '#786D61' }}>
                    Accredited Testing Certificate #BIO-89214
                  </span>
                </div>
                <button
                  type="button"
                  className="qc-close-btn"
                  onClick={() => setIsCertModalOpen(false)}
                >
                  <X size={15} />
                </button>
              </div>

              <div className="qc-cert-doc-preview">
                <div className="qc-cert-header">
                  <ShieldCheck size={24} color="#4F7A52" />
                  <div>
                    <strong style={{ fontSize: '14px', color: '#1B331D' }}>Official Certificate of Analysis</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: '#4F7A52' }}>
                      BioAgro Analytical Laboratories · ISO/IEC 17025 Accredited
                    </span>
                  </div>
                </div>

                <div className="qc-cert-body">
                  <div className="qc-cert-row">
                    <span>Batch Identification:</span>
                    <strong>{qc.batchNumber} ({qc.batchName})</strong>
                  </div>
                  <div className="qc-cert-row">
                    <span>Sample ID:</span>
                    <strong>{qc.sample?.sampleId}</strong>
                  </div>
                  <div className="qc-cert-row">
                    <span>Moisture Content:</span>
                    <strong>17.8% (Pass &lt; 18.5%)</strong>
                  </div>
                  <div className="qc-cert-row">
                    <span>HMF (Freshness):</span>
                    <strong>12.4 mg/kg (Pass &lt; 40 mg/kg)</strong>
                  </div>
                  <div className="qc-cert-row">
                    <span>Diastase Enzyme:</span>
                    <strong>14.8 DN (Pass &gt; 8.0 DN)</strong>
                  </div>
                  <div className="qc-cert-row">
                    <span>Pesticide Residues:</span>
                    <strong style={{ color: '#4F7A52' }}>Zero detected (&lt; LOD)</strong>
                  </div>
                  <div className="qc-cert-row">
                    <span>Cryptographic Seal:</span>
                    <strong className="mono" style={{ fontSize: '10.5px' }}>0x8b3f912c4189e49120bc...</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-block"
                style={{ marginTop: '14px', height: '42px' }}
                onClick={() => setIsCertModalOpen(false)}
              >
                Close certificate
              </button>
            </div>
          </div>
        )}

        {/* MODAL 4: PUT BATCH ON HOLD CONFIRMATION (§ 34) */}
        {isHoldConfirmOpen && (
          <div className="qc-submodal-overlay" role="dialog" aria-modal="true">
            <div className="qc-submodal-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <PauseCircle size={20} color="#D9822B" />
                <strong style={{ fontSize: '15px', color: '#34261B' }}>Put batch on hold?</strong>
              </div>
              <p style={{ fontSize: '13px', color: '#786D61', lineHeight: 1.45, margin: '6px 0 14px' }}>
                This operational action stops <strong>{qc.batchName} ({qc.batchNumber})</strong> from progressing to packaging until quality observations are reviewed.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, height: '42px' }}
                  onClick={() => setIsHoldConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1.2, height: '42px', backgroundColor: '#D9822B', borderColor: '#D9822B' }}
                  onClick={() => {
                    handleDecision('HOLD');
                    setIsHoldConfirmOpen(false);
                  }}
                >
                  Confirm hold
                </button>
              </div>
            </div>
          </div>
        )}

        {/* JURY DEMONSTRATION DRAWER (§ 54) */}
        {isDemoDrawerOpen && (
          <div className="qc-submodal-overlay" role="dialog" aria-modal="true">
            <div className="qc-submodal-card">
              <div className="qc-submodal-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#B87316" />
                  <strong style={{ fontSize: '15px' }}>Jury Demonstration Scenarios</strong>
                </div>
                <button
                  type="button"
                  className="qc-close-btn"
                  onClick={() => setIsDemoDrawerOpen(false)}
                >
                  <X size={15} />
                </button>
              </div>

              <p style={{ fontSize: '12.5px', color: '#786D61', margin: '4px 0 12px' }}>
                Switch between operational states to evaluate the quality verification flow:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ textAlign: 'left', padding: '10px 12px', height: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}
                  onClick={() => applyPreset('ready_for_review')}
                >
                  <strong style={{ fontSize: '13px', color: '#4F7A52' }}>
                    Scenario 1: Ready for Review (Recommended)
                  </strong>
                  <span style={{ fontSize: '11.5px', color: '#786D61' }}>
                    All 3 required tests recorded and passing (17.8% moisture, Pass purity, 12.4 mg/kg HMF).
                  </span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ textAlign: 'left', padding: '10px 12px', height: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}
                  onClick={() => applyPreset('in_progress')}
                >
                  <strong style={{ fontSize: '13px', color: '#B87316' }}>
                    Scenario 2: In Progress (1 of 3 Complete)
                  </strong>
                  <span style={{ fontSize: '11.5px', color: '#786D61' }}>
                    Moisture recorded; Purity and HMF pending result entry.
                  </span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ textAlign: 'left', padding: '10px 12px', height: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}
                  onClick={() => applyPreset('needs_attention')}
                >
                  <strong style={{ fontSize: '13px', color: '#D9822B' }}>
                    Scenario 3: Needs Attention (Out of Range)
                  </strong>
                  <span style={{ fontSize: '11.5px', color: '#786D61' }}>
                    Moisture recorded as 19.2% (exceeds 18.5%). Demonstrates non-alarmist review & retest flow.
                  </span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ textAlign: 'left', padding: '10px 12px', height: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}
                  onClick={() => applyPreset('not_started')}
                >
                  <strong style={{ fontSize: '13px', color: '#34261B' }}>
                    Scenario 4: Fresh Batch (Not Started)
                  </strong>
                  <span style={{ fontSize: '11.5px', color: '#786D61' }}>
                    Initial state awaiting laboratory sample and test entry.
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COMPONENT SCOPED CSS STYLING */}
      <style>{`
        .qc-view-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(52, 38, 27, 0.55);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          animation: qcFadeIn 0.2s ease-out;
        }

        @keyframes qcFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .qc-view-container {
          width: 100%;
          max-width: 520px;
          height: 94vh;
          max-height: 860px;
          background: #FFF9EF;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 -8px 32px rgba(52, 38, 27, 0.16);
          overflow: hidden;
          box-sizing: border-box;
          position: relative;
          animation: qcSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes qcSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        /* Header */
        .qc-header {
          padding: 16px 20px 14px;
          background: #FFFDF8;
          border-bottom: 1px solid #EDE2D1;
          flex-shrink: 0;
        }

        .qc-header-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .qc-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #786D61;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
        }

        .qc-back-btn:hover {
          background: rgba(120, 109, 97, 0.08);
          color: #34261B;
        }

        .qc-header-right-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .qc-demo-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(217, 154, 36, 0.1);
          border: 1px solid rgba(217, 154, 36, 0.3);
          color: #B87316;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
        }

        .qc-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(120, 109, 97, 0.08);
          border: none;
          color: #786D61;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .qc-header-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .qc-title {
          font-size: 20px;
          font-weight: 800;
          color: #34261B;
          margin: 0 0 2px 0;
          line-height: 1.25;
        }

        .qc-subtitle {
          font-size: 13px;
          color: #786D61;
          margin: 0;
          line-height: 1.4;
        }

        .qc-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .qc-status-badge.passed {
          background-color: #EBF3EA;
          color: #4F7A52;
        }

        .qc-status-badge.ready_for_review {
          background-color: #E8F0FE;
          color: #1A73E8;
        }

        .qc-status-badge.in_progress, .qc-status-badge.awaiting_results {
          background-color: #FEF3D6;
          color: #B87316;
        }

        .qc-status-badge.needs_attention {
          background-color: #FEEADB;
          color: #D9822B;
        }

        .qc-status-badge.not_started {
          background-color: #EFECE6;
          color: #786D61;
        }

        .qc-status-badge.failed {
          background-color: #FCE8E6;
          color: #B85450;
        }

        .qc-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Body Scroll */
        .qc-body-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          box-sizing: border-box;
          -webkit-overflow-scrolling: touch;
        }

        .qc-passed-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          background-color: #F0F7EF;
          border: 1px solid #C8E3C5;
          border-radius: 12px;
          margin-bottom: 14px;
        }

        .qc-attention-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          background-color: #FFF4E5;
          border: 1px solid #F5D3A6;
          border-radius: 12px;
          margin-bottom: 14px;
        }

        /* Hero Context Card */
        .qc-hero-card {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-left: 4px solid #D99A24;
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 14px;
        }

        .qc-hero-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .qc-hero-kicker {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #786D61;
        }

        .qc-hero-type-tag {
          font-size: 11.5px;
          font-weight: 700;
          color: #B87316;
          background: rgba(217, 154, 36, 0.12);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .qc-hero-metric-wrap {
          margin-bottom: 2px;
        }

        .qc-hero-metric {
          font-size: 22px;
          font-weight: 800;
          color: #34261B;
          line-height: 1.2;
        }

        .qc-hero-statement {
          font-size: 12.5px;
          color: #786D61;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .qc-hero-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px 12px;
          border-top: 1px solid #EDE2D1;
          padding-top: 10px;
        }

        .qc-hg-label {
          font-size: 10px;
          text-transform: uppercase;
          color: #786D61;
          display: block;
          letter-spacing: 0.04em;
        }

        .qc-hg-val {
          font-size: 12.5px;
          font-weight: 700;
          color: #34261B;
          display: block;
          margin-top: 1px;
        }

        /* Generic QC Card */
        .qc-card {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 14px;
        }

        .qc-sample-id-badge {
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          color: #B87316;
          background-color: #FEF5E7;
          border: 1px solid #FCE5C2;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .qc-sample-desc {
          margin: 0 0 8px;
          font-size: 12.5px;
          color: #34261B;
          line-height: 1.4;
        }

        .qc-sample-meta {
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-size: 11px;
          color: #786D61;
        }

        .qc-journey-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 0;
        }

        .qc-journey-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          font-size: 10.5px;
          color: #786D61;
        }

        .qc-journey-step.completed {
          color: #4F7A52;
          font-weight: 600;
        }

        .qc-journey-step.active {
          color: #B87316;
          font-weight: 700;
        }

        .qc-step-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #EFECE6;
          color: #786D61;
          font-size: 10px;
        }

        .qc-journey-step.completed .qc-step-circle {
          background-color: #EBF3EA;
          color: #4F7A52;
        }

        .qc-journey-step.active .qc-step-circle {
          background-color: #FEF3D6;
          color: #B87316;
          box-shadow: 0 0 0 2px rgba(217, 154, 36, 0.2);
        }

        .qc-journey-line {
          flex: 1;
          height: 2px;
          background-color: #EDE2D1;
          margin: 0 4px 14px;
        }

        .qc-journey-line.completed {
          background-color: #4F7A52;
        }

        .qc-journey-line.active {
          background-color: #B87316;
        }

        .qc-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .qc-progress-subtext {
          font-size: 11.5px;
          color: #786D61;
          display: block;
          margin-top: 1px;
        }

        .qc-completion-chip {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 8px;
          background: #FEF5E7;
          color: #B87316;
        }

        .qc-completion-chip.done {
          background: #EBF3EA;
          color: #4F7A52;
        }

        .qc-optional-pill {
          font-size: 10.5px;
          color: #786D61;
          background: #EFECE6;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .qc-test-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .qc-test-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 10px 12px;
          background-color: #FAF6ED;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          gap: 10px;
        }

        .qc-test-row.attention {
          border-color: #F8D3A8;
          background-color: #FFF8EE;
        }

        .qc-test-left {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          flex: 1;
        }

        .qc-test-icon-slot {
          margin-top: 2px;
        }

        .qc-pending-circle {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #786D61;
        }

        .qc-test-info {
          flex: 1;
        }

        .qc-test-title-line {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .qc-test-name {
          font-size: 13px;
          color: #34261B;
        }

        .qc-required-pill {
          font-size: 9.5px;
          font-weight: 700;
          color: #B87316;
          background: #FEF3D6;
          padding: 1px 5px;
          border-radius: 4px;
        }

        .qc-test-standard {
          margin: 2px 0 0;
          font-size: 11.5px;
          color: #34261B;
        }

        .qc-test-method {
          display: block;
          font-size: 10.5px;
          color: #786D61;
          margin-top: 2px;
        }

        .qc-test-result-callout {
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .qc-recorded-val {
          font-size: 12.5px;
          font-weight: 800;
          color: #34261B;
        }

        .qc-eval-label {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .qc-eval-label.passed {
          background-color: #EBF3EA;
          color: #4F7A52;
        }

        .qc-eval-label.needs_attention {
          background-color: #FEEADB;
          color: #D9822B;
        }

        .qc-result-needed {
          display: inline-block;
          margin-top: 3px;
          font-size: 11px;
          color: #786D61;
          font-style: italic;
        }

        .qc-entry-btn {
          height: 30px;
          padding: 0 10px;
          font-size: 12px;
        }

        .qc-trace-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 14px;
        }

        .qc-trace-icon {
          margin-top: 1px;
        }

        .qc-tech-accordion {
          margin-bottom: 14px;
        }

        .qc-tech-toggle-btn {
          width: 100%;
          background: transparent;
          border: 1px dashed #EDE2D1;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 12.5px;
          font-weight: 700;
          color: #786D61;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        .qc-tech-toggle-btn:hover {
          border-color: #D99A24;
          color: #34261B;
        }

        .qc-tech-card {
          margin-top: 8px;
          font-size: 11.5px;
        }

        .qc-tech-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #EDE2D1;
        }

        .qc-tech-row:last-child {
          border-bottom: none;
        }

        .qc-tlabel {
          color: #786D61;
        }

        .qc-tval {
          font-weight: 600;
          color: #34261B;
        }

        .qc-tval.mono {
          font-family: monospace;
          font-size: 11px;
        }

        .qc-tval.truncate {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Footer */
        .qc-bottom-bar {
          padding: 14px 20px 18px;
          background: #FFFDF8;
          border-top: 1px solid #EDE2D1;
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        /* Submodal styles */
        .qc-submodal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(52, 38, 27, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 10;
        }

        .qc-submodal-card {
          width: 100%;
          max-width: 440px;
          background: #FFFDF8;
          border-radius: 16px;
          padding: 18px 20px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
        }

        .qc-submodal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 15px;
          color: #34261B;
          margin-bottom: 10px;
        }

        .qc-warning-notice {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(217, 154, 36, 0.1);
          border: 1px solid rgba(217, 154, 36, 0.3);
          border-radius: 8px;
          padding: 8px 10px;
          margin-bottom: 12px;
        }

        .qc-warning-notice p {
          margin: 0;
          font-size: 11px;
          color: #B87316;
          font-weight: 600;
        }

        .qc-form-group {
          margin-bottom: 12px;
        }

        .qc-flabel {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #34261B;
          margin-bottom: 4px;
        }

        .qc-finput {
          width: 100%;
          height: 40px;
          border: 1px solid #EDE2D1;
          border-radius: 8px;
          padding: 0 12px;
          font-size: 13.5px;
          color: #34261B;
          background: #FFFFFF;
          box-sizing: border-box;
        }

        .qc-ftextarea {
          width: 100%;
          border: 1px solid #EDE2D1;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12.5px;
          color: #34261B;
          background: #FFFFFF;
          box-sizing: border-box;
          font-family: inherit;
        }

        .qc-input-unit-tag {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          font-weight: 700;
          color: #786D61;
        }

        .qc-rule-feedback {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 5px;
          font-size: 11.5px;
          font-weight: 600;
          padding: 5px 8px;
          border-radius: 6px;
        }

        .qc-rule-feedback.passed {
          background-color: #EBF3EA;
          color: #4F7A52;
        }

        .qc-rule-feedback.needs_attention {
          background-color: #FFF4E5;
          color: #8F4E0A;
          border: 1px solid #F5D3A6;
        }

        .qc-submodal-footer {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }

        .qc-review-summary-box {
          background-color: #FAF6ED;
          border: 1px solid #EDE2D1;
          border-radius: 10px;
          padding: 6px 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .qc-review-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          border-bottom: 1px solid #ECE3D4;
        }

        .qc-review-item-row:last-child {
          border-bottom: none;
        }

        .qc-reviewer-callout {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #786D61;
          margin-top: 8px;
          padding: 6px 10px;
          background: #FAF6ED;
          border-radius: 6px;
        }

        .qc-cert-doc-preview {
          background: #FDFCFA;
          border: 1px solid #EDE2D1;
          border-radius: 10px;
          padding: 12px;
          margin-top: 8px;
        }

        .qc-cert-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #EDE2D1;
          margin-bottom: 8px;
        }

        .qc-cert-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
        }

        .qc-cert-row {
          display: flex;
          justify-content: space-between;
          color: #34261B;
        }

        .qc-cert-row span {
          color: #786D61;
        }
      `}</style>
    </div>,
    document.querySelector('.app-viewport') || document.body
  );
};
