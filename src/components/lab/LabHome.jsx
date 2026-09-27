import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  FlaskConical,
  TestTube,
  ShieldCheck,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  SAMPLE_STATUS_LABELS,
  LAB_TEST_CATALOG
} from '../../services/labDomainService';
import { SampleDetailModal } from './SampleDetailModal';
import { LabReportModal } from './LabReportModal';
import { StatusBadge } from '../common/StatusBadge';

export const LabHome = ({
  onNavigateToSamples,
  onNavigateToTests,
  onNavigateToReview
}) => {
  const {
    session,
    labSamples = [],
    labTests = [],
    can,
    showToast
  } = useAppState();

  const [selectedSample, setSelectedSample] = useState(null);
  const [activeReportSample, setActiveReportSample] = useState(null);

  // Filter queues
  const awaitingIntake = labSamples.filter(s => s.intakeStatus === 'AWAITING_INTAKE');
  const inTesting = labSamples.filter(s => s.intakeStatus === 'IN_TESTING' || s.intakeStatus === 'TEST_ASSIGNED');
  const awaitingReview = labSamples.filter(s => s.intakeStatus === 'AWAITING_REVIEW');
  const completedSamples = labSamples.filter(s => s.intakeStatus === 'COMPLETED');
  const onHoldSamples = labSamples.filter(s => s.intakeStatus === 'ON_HOLD');

  const inProgressTests = labTests.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED');
  const awaitingReviewTests = labTests.filter(t => t.reviewStatus === 'AWAITING_REVIEW');
  const outOfRangeTests = labTests.filter(t => t.isWithinSpecification === false);

  const greetingTime = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const operatorName = session?.operator || 'Dr. Elena Vance';

  return (
    <div className="lab-home-container" style={{ padding: '20px', maxWidth: '1040px', margin: '0 auto', backgroundColor: '#FFFFFF', minHeight: '100%' }}>
      {/* 1. Header (Section 11: Lab Workspace · Samples • Tests • Results) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid #E2E8F0'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
                letterSpacing: '0.04em'
              }}
            >
              Lab Workspace
            </span>
            <span style={{ fontSize: '12px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
              Calibrated Instruments Online
            </span>
          </div>

          <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 700, color: '#172033', letterSpacing: '-0.02em' }}>
            Samples • Tests • Results
          </h1>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#64748B' }}>
            {greetingTime()}, {operatorName} · ISO 17025 Compliant Analytical Protocol
          </p>
        </div>

        {/* Primary Action Button (Section 11) */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-primary"
            onClick={onNavigateToSamples}
            style={{
              backgroundColor: '#2563EB',
              borderColor: '#2563EB',
              fontSize: '13.5px',
              padding: '10px 16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)'
            }}
          >
            <Plus size={16} strokeWidth={2.4} />
            <span>+ New Sample Intake</span>
          </button>
        </div>
      </div>

      {/* 2. Canonical Status Bar (Section 11 & 44: White=Space, Blue=Work, Green=Good, Red=Attention) */}
      <div
        className="responsive-grid-4"
        style={{ marginBottom: '28px' }}
      >
        {/* Status A: Total Samples */}
        <div
          className="lab-stat-box"
          onClick={onNavigateToSamples}
          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="lab-stat-lbl">Total Samples</span>
            <FlaskConical size={16} color="#64748B" />
          </div>
          <span className="lab-stat-val">{labSamples.length}</span>
          <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>
            {awaitingIntake.length} awaiting intake
          </span>
        </div>

        {/* Status B: In Testing (Blue = Active Work) */}
        <div
          className="lab-stat-box"
          onClick={onNavigateToTests}
          style={{ cursor: 'pointer', borderColor: '#BFDBFE', backgroundColor: '#F8FAFF', transition: 'all 0.15s ease' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="lab-stat-lbl" style={{ color: '#2563EB', fontWeight: 600 }}>In Testing</span>
            <TestTube size={16} color="#2563EB" />
          </div>
          <span className="lab-stat-val" style={{ color: '#2563EB' }}>
            {inTesting.length || inProgressTests.length}
          </span>
          <span style={{ fontSize: '11.5px', color: '#2563EB', fontWeight: 600 }}>
            {inProgressTests.length} assays active on bench
          </span>
        </div>

        {/* Status C: Reviewed (Green = Complete / Good) */}
        <div
          className="lab-stat-box"
          onClick={onNavigateToReview}
          style={{ cursor: 'pointer', borderColor: '#BBF7D0', backgroundColor: '#F9FEFA', transition: 'all 0.15s ease' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="lab-stat-lbl" style={{ color: '#16A34A', fontWeight: 600 }}>Reviewed</span>
            <CheckCircle2 size={16} color="#16A34A" />
          </div>
          <span className="lab-stat-val" style={{ color: '#16A34A' }}>
            {completedSamples.length + awaitingReview.length}
          </span>
          <span style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: 500 }}>
            {awaitingReviewTests.length} awaiting final signoff
          </span>
        </div>

        {/* Status D: Need Attention (Red = Attention only) */}
        <div
          className="lab-stat-box"
          onClick={onNavigateToReview}
          style={{
            cursor: 'pointer',
            borderColor: onHoldSamples.length > 0 || outOfRangeTests.length > 0 ? '#FECACA' : '#E2E8F0',
            backgroundColor: onHoldSamples.length > 0 || outOfRangeTests.length > 0 ? '#FEF2F2' : '#FFFFFF',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="lab-stat-lbl"
              style={{ color: onHoldSamples.length > 0 || outOfRangeTests.length > 0 ? '#DC2626' : '#64748B', fontWeight: 600 }}
            >
              Need Attention
            </span>
            <AlertTriangle
              size={16}
              color={onHoldSamples.length > 0 || outOfRangeTests.length > 0 ? '#DC2626' : '#94A3B8'}
            />
          </div>
          <span
            className="lab-stat-val"
            style={{ color: onHoldSamples.length > 0 || outOfRangeTests.length > 0 ? '#DC2626' : '#172033' }}
          >
            {onHoldSamples.length + outOfRangeTests.length}
          </span>
          <span
            style={{
              fontSize: '11.5px',
              color: onHoldSamples.length > 0 || outOfRangeTests.length > 0 ? '#DC2626' : '#64748B',
              fontWeight: 500
            }}
          >
            {onHoldSamples.length > 0 ? `${onHoldSamples.length} samples on hold` : 'Zero critical variances'}
          </span>
        </div>
      </div>

      {/* 3. Section Hierarchy (Section 37: Primary = Samples Needing Action, Secondary = Tests In Progress) */}
      <div className="responsive-grid-2" style={{ gap: '20px', marginBottom: '28px' }}>
        {/* Left Column: Samples Needing Action */}
        <div className="lab-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                Samples Needing Action
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Awaiting intake verification or protocol assignment
              </span>
            </div>
            <button
              onClick={onNavigateToSamples}
              style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {awaitingIntake.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #E2E8F0' }}>
                <CheckCircle2 size={24} color="#16A34A" style={{ margin: '0 auto 6px' }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  All intake vials verified and cataloged.
                </p>
              </div>
            ) : (
              awaitingIntake.slice(0, 3).map(sample => (
                <div
                  key={sample.id}
                  onClick={() => setSelectedSample(sample)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#2563EB'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '13.5px', color: '#172033' }}>{sample.id}</strong>
                      <span className="badge badge-neutral" style={{ fontSize: '10.5px', padding: '2px 6px' }}>
                        Batch: {sample.sourceBatchNumber}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                      {sample.quantityMl} mL · {sample.containerType || 'Amber glass'}
                    </div>
                  </div>
                  <span style={{ fontSize: '12.5px', color: '#2563EB', fontWeight: 600 }}>
                    Verify →
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Tests In Progress */}
        <div className="lab-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                Assays In Progress
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Active bench measurements & calibrations
              </span>
            </div>
            <button
              onClick={onNavigateToTests}
              style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <span>Bench</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {labTests.slice(0, 3).map(test => (
              <div
                key={test.id}
                onClick={onNavigateToTests}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '13.5px', color: '#172033' }}>{test.testName}</strong>
                    <StatusBadge
                      status={test.status === 'COMPLETED' ? 'within_expected_range' : 'testing'}
                      label={test.status === 'COMPLETED' ? 'Completed' : 'Bench Active'}
                      size="small"
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                    Sample: {test.sampleId} · {test.method}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {test.result !== null ? (
                    <span style={{ fontSize: '14px', fontWeight: 700, color: test.isWithinSpecification ? '#16A34A' : '#DC2626' }}>
                      {test.result} {test.unit}
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600 }}>
                      Enter Value →
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Results Awaiting Review & Attention Section */}
      <div className="lab-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#172033' }}>
              Results Awaiting Supervisory Review
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Completed spectrophotometer & refractometer evidence awaiting signoff
            </span>
          </div>
          <button
            onClick={onNavigateToReview}
            style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <span>Review Queue</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {labTests.filter(t => t.result !== null).slice(0, 4).map(test => {
            const isGood = test.isWithinSpecification !== false;
            return (
              <div
                key={test.id}
                onClick={onNavigateToReview}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid',
                  borderColor: isGood ? '#E2E8F0' : '#FECACA',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '13.5px', color: '#172033' }}>{test.testName}</strong>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>Sample {test.sampleId}</span>
                    {!isGood && (
                      <span className="badge badge-lab-red" style={{ fontSize: '10px', padding: '1px 6px' }}>
                        Out of Range
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                    Method: {test.method} · Instrument: {test.equipmentName}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: isGood ? '#16A34A' : '#DC2626' }}>
                    {test.result} {test.unit}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {isGood ? 'Within Codex Spec' : 'Requires Re-check'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail & Report Modals */}
      {selectedSample && (
        <SampleDetailModal
          sampleId={selectedSample.id}
          isOpen={true}
          onClose={() => setSelectedSample(null)}
          onOpenReport={(s) => setActiveReportSample(s)}
          onAssignTest={() => {
            setSelectedSample(null);
            if (onNavigateToTests) onNavigateToTests();
          }}
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
