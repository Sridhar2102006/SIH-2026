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
  Sparkles,
  Cpu,
  BookOpen,
  Send,
  Lock,
  Calendar,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { SampleDetailModal } from './SampleDetailModal';
import { LabReportModal } from './LabReportModal';
import { LabRegistrationModal } from './LabRegistrationModal';

export const LabHome = ({
  onNavigateToSamples,
  onNavigateToTests,
  onNavigateToReview,
  onNavigateToReports,
  onNavigateToRegulatory,
  onNavigateToEquipment,
  onNavigateToMethods,
  onNavigateToAudit
}) => {
  const {
    session,
    labSamples = [],
    labTests = [],
    can,
    showToast,
    setActiveTab
  } = useAppState();

  const [selectedSample, setSelectedSample] = useState(null);
  const [activeReportSample, setActiveReportSample] = useState(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Operational Queues (§36 TODAY)
  const awaitingIntake = labSamples.filter(s => s.intakeStatus === 'AWAITING_INTAKE');
  const inTesting = labSamples.filter(s => s.intakeStatus === 'IN_TESTING' || s.intakeStatus === 'TEST_ASSIGNED');
  const awaitingReview = labSamples.filter(s => s.intakeStatus === 'AWAITING_REVIEW');
  const completedSamples = labSamples.filter(s => s.intakeStatus === 'COMPLETED');
  const onHoldSamples = labSamples.filter(s => s.intakeStatus === 'ON_HOLD');

  const inProgressTests = labTests.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED');
  const awaitingReviewTests = labTests.filter(t => t.reviewStatus === 'AWAITING_REVIEW');
  const outOfRangeTests = labTests.filter(t => t.isWithinSpecification === false);

  // Navigation helpers fallback
  const navTo = (dest) => {
    if (dest === 'samples' && onNavigateToSamples) onNavigateToSamples();
    else if (dest === 'tests' && onNavigateToTests) onNavigateToTests();
    else if (dest === 'review' && onNavigateToReview) onNavigateToReview();
    else if (dest === 'reports' && onNavigateToReports) onNavigateToReports();
    else if (dest === 'regulatory' && onNavigateToRegulatory) onNavigateToRegulatory();
    else if (dest === 'equipment' && onNavigateToEquipment) onNavigateToEquipment();
    else if (dest === 'methods' && onNavigateToMethods) onNavigateToMethods();
    else if (dest === 'audit' && onNavigateToAudit) onNavigateToAudit();
    else if (setActiveTab) setActiveTab(dest);
  };

  const operatorName = session?.name || session?.operator || 'Dr. Aris Thorne';
  const roleName = session?.role || 'Lead Quality Officer (Food Analyst)';

  return (
    <div className="lab-home-container" style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', backgroundColor: '#FFFFFF', minHeight: '100%' }}>
      {/* 1. Header (Section 36 & 37: Scientific White, Blue, Green, Red) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid #E2E8F0'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                letterSpacing: '0.04em'
              }}
            >
              Laboratory Information & Control System
            </span>
            <span style={{ fontSize: '12px', color: '#15803D', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#15803D', display: 'inline-block' }} />
              ISO/IEC 17025 Protocol Active
            </span>
          </div>

          <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Laboratory Command Console
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            {operatorName} · {roleName} · FSSAI Honey Analysis Manual 03 (v2026.1)
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsRegistrationOpen(true)}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
              fontSize: '13px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={16} color="#1D4ED8" />
            <span>Lab Credentials</span>
          </button>

          <button
            onClick={() => navTo('samples')}
            style={{
              backgroundColor: '#1D4ED8',
              border: '1px solid #1D4ED8',
              color: '#FFFFFF',
              fontSize: '13px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(29, 78, 216, 0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} strokeWidth={2.4} />
            <span>Sample Accession</span>
          </button>
        </div>
      </div>

      {/* Lab Navigation Bar (§38) */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px',
          borderBottom: '1px solid #F1F5F9'
        }}
      >
        {[
          { id: 'samples', label: 'Samples', icon: FlaskConical },
          { id: 'tests', label: 'Tests', icon: TestTube },
          { id: 'review', label: 'Results / Review', icon: CheckCircle2 },
          { id: 'reports', label: 'Reports (CoA)', icon: FileText },
          { id: 'regulatory', label: 'InFoLNeT Submissions', icon: Send },
          { id: 'equipment', label: 'Equipment Register', icon: Cpu },
          { id: 'methods', label: 'Test Methods', icon: BookOpen },
          { id: 'audit', label: 'Audit Trail', icon: Lock }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navTo(item.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                color: '#334155',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EFF6FF';
                e.currentTarget.style.borderColor = '#BFDBFE';
                e.currentTarget.style.color = '#1D4ED8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.color = '#334155';
              }}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. SECTION A: TODAY (§36) */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
            TODAY'S OPERATIONAL WORKFLOW
          </h2>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Auto-refreshed from active analytical ledger
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px'
          }}
        >
          {/* Samples Received */}
          <div
            onClick={() => navTo('samples')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Samples Received</span>
              <FlaskConical size={14} color="#64748B" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>{labSamples.length}</div>
            <div style={{ fontSize: '11px', color: '#1D4ED8', fontWeight: 500, marginTop: '2px' }}>
              {awaitingIntake.length} awaiting verification
            </div>
          </div>

          {/* Tests in Progress */}
          <div
            onClick={() => navTo('tests')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #BFDBFE',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#1D4ED8' }}>Tests in Progress</span>
              <TestTube size={14} color="#1D4ED8" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1D4ED8' }}>
              {inProgressTests.length || inTesting.length}
            </div>
            <div style={{ fontSize: '11px', color: '#1D4ED8', fontWeight: 500, marginTop: '2px' }}>
              Active on bench instruments
            </div>
          </div>

          {/* Results Awaiting Review */}
          <div
            onClick={() => navTo('review')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Awaiting Review</span>
              <CheckCircle2 size={14} color="#64748B" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
              {awaitingReviewTests.length || awaitingReview.length}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
              Pending four-eyes review
            </div>
          </div>

          {/* Reports Awaiting Release */}
          <div
            onClick={() => navTo('reports')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Reports Ready</span>
              <FileText size={14} color="#64748B" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
              {completedSamples.length || 1}
            </div>
            <div style={{ fontSize: '11px', color: '#15803D', fontWeight: 500, marginTop: '2px' }}>
              Awaiting signatory release
            </div>
          </div>

          {/* Regulatory Submissions */}
          <div
            onClick={() => navTo('regulatory')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>InFoLNeT Submissions</span>
              <Send size={14} color="#64748B" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>1</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
              Official portal dossier ready
            </div>
          </div>

          {/* Actions Required (Red) */}
          <div
            onClick={() => navTo('review')}
            style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: onHoldSamples.length > 0 || outOfRangeTests.length > 0 ? '#FEF2F2' : '#FFFFFF',
              border: `1px solid ${onHoldSamples.length > 0 || outOfRangeTests.length > 0 ? '#FECACA' : '#E2E8F0'}`,
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: onHoldSamples.length > 0 ? '#DC2626' : '#64748B' }}>
                Actions Required
              </span>
              <AlertTriangle size={14} color={onHoldSamples.length > 0 ? '#DC2626' : '#94A3B8'} />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: onHoldSamples.length > 0 ? '#DC2626' : '#0F172A' }}>
              {onHoldSamples.length + outOfRangeTests.length}
            </div>
            <div style={{ fontSize: '11px', color: onHoldSamples.length > 0 ? '#DC2626' : '#15803D', fontWeight: 500, marginTop: '2px' }}>
              {onHoldSamples.length > 0 ? 'Quality holds active' : 'Zero critical blocks'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION B: LAB STATUS & CRITICAL ALERTS (§36) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* LAB STATUS CARD */}
        <div style={{ padding: '18px', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#334155' }}>
              LABORATORY ACCREDITATION & STATUS
            </h3>
            <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>
              RECOGNIZED
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>NABL Accreditation:</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>ISO/IEC 17025 (TC-8492)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>FSSAI Recognition:</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Notified Lab #FSSAI-LAB-2026-081</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>Equipment Metrology:</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>4 Active • 1 Calibration Due</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>Standard Methods:</span>
              <span style={{ fontWeight: 600, color: '#1D4ED8' }}>FSSAI Honey Manual 03 (v2026.1)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Identity Verification:</span>
              <span style={{ fontWeight: 600, color: '#15803D' }}>Authoritative Evidence Verified ✓</span>
            </div>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setIsRegistrationOpen(true)}
              style={{ background: 'none', border: 'none', color: '#1D4ED8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Manage Credentials & Scope</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>

        {/* SCIENTIFIC ALERTS CARD (§36 ALERTS) */}
        <div style={{ padding: '18px', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#334155' }}>
              SCIENTIFIC & REGULATORY ALERTS
            </h3>
            <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700, backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '4px' }}>
              2 ATTENTION
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            {/* Alert 1: Calibration Due */}
            <div
              onClick={() => navTo('equipment')}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <AlertTriangle size={15} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#991B1B' }}>Instrument Calibration Due Soon</div>
                <div style={{ fontSize: '11px', color: '#7F1D1D' }}>
                  EQ-COND-003 (Benchtop Conductivity Meter) calibration expires in 4 days.
                </div>
              </div>
            </div>

            {/* Alert 2: Regulatory Response Ready */}
            <div
              onClick={() => navTo('regulatory')}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Send size={15} color="#1D4ED8" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#1E40AF' }}>Regulatory Submission Dossier Prepared</div>
                <div style={{ fontSize: '11px', color: '#1E3A8A' }}>
                  FSSAI InFoLNeT submission ready for export and portal handoff.
                </div>
              </div>
            </div>

            {/* Alert 3: Outdated Method Version */}
            <div
              onClick={() => navTo('methods')}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <BookOpen size={15} color="#64748B" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#334155' }}>Method Versioning Update</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  EA-IRMS C4 protocol tagged as RESEARCH_ONLY scope (outside ISO 17025 CoA).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE SAMPLES & ASSAYS (§37 Primary & Secondary Hierarchy) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Left: Samples Needing Action */}
        <div style={{ padding: '18px', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Samples Needing Action
            </h3>
            <button
              onClick={() => navTo('samples')}
              style={{ background: 'none', border: 'none', color: '#1D4ED8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {awaitingIntake.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px dashed #CBD5E1' }}>
                <CheckCircle2 size={20} color="#15803D" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>All Intake Samples Verified</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Custody chain and seals logged</div>
              </div>
            ) : (
              awaitingIntake.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSample(s)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#0F172A' }}>{s.id}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      Lot {s.sourceBatchId || 'RAW-01'} · {s.sampleType || 'Raw Honey'}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#1D4ED8', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                    Verify Seal
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Test Assays on Bench */}
        <div style={{ padding: '18px', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              Active Test Assays on Bench
            </h3>
            <button
              onClick={() => navTo('tests')}
              style={{ background: 'none', border: 'none', color: '#1D4ED8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {inProgressTests.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px dashed #CBD5E1' }}>
                <CheckCircle2 size={20} color="#15803D" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Analytical Assays Up to Date</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Ready for next sample batch</div>
              </div>
            ) : (
              inProgressTests.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => navTo('tests')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#0F172A' }}>{t.testType || 'Assay'}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      Sample {t.sampleId} · Analyst: {t.analyst || operatorName}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#15803D', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>
                    Record
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SampleDetailModal
        sampleId={selectedSample?.id}
        sample={selectedSample}
        isOpen={Boolean(selectedSample)}
        onClose={() => setSelectedSample(null)}
      />

      <LabReportModal
        sample={activeReportSample}
        isOpen={Boolean(activeReportSample)}
        onClose={() => setActiveReportSample(null)}
      />

      {isRegistrationOpen && (
        <LabRegistrationModal
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          onSuccess={() => {
            setIsRegistrationOpen(false);
            if (showToast) showToast('Laboratory credentials and scope matrix refreshed.');
          }}
        />
      )}
    </div>
  );
};

export default LabHome;
