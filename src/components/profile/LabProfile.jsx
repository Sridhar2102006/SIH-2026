import React, { useState } from 'react';
import { 
  FlaskConical, 
  ShieldCheck, 
  TestTube, 
  FileCheck, 
  Check, 
  Sliders, 
  AlertCircle, 
  Sparkles, 
  Compass, 
  Cpu, 
  Clock, 
  Lock,
  Layers,
  ChevronRight,
  Award
} from 'lucide-react';
import { 
  LAB_TEST_CATALOG, 
  LAB_EQUIPMENT_CATALOG 
} from '../../services/labDomainService';

export const LabProfile = ({
  labSamples = [],
  labTests = [],
  session,
  onNavigateTo,
  onSaveSettings
}) => {
  const [outOfSpecAlert, setOutOfSpecAlert] = useState(
    session?.workspaceSettings?.LAB_SPECIALIST?.outOfSpecAlert ?? true
  );
  const [coaTemplate, setCoaTemplate] = useState(
    session?.workspaceSettings?.LAB_SPECIALIST?.coaTemplate || 'ISO_17025_NABL'
  );
  const [precisionDecimals, setPrecisionDecimals] = useState(
    session?.workspaceSettings?.LAB_SPECIALIST?.precisionDecimals || '2'
  );
  const [digitalSignatory, setDigitalSignatory] = useState(
    session?.workspaceSettings?.LAB_SPECIALIST?.digitalSignatory ?? true
  );
  const [isSaved, setIsSaved] = useState(false);

  // Compute live lab operational metrics
  const activeSamplesCount = labSamples.filter(
    s => s.status !== 'COMPLETED' && s.status !== 'REJECTED'
  ).length;
  const inProgressTestsCount = labTests.filter(
    t => t.status === 'IN_PROGRESS' || t.status === 'STARTED'
  ).length;
  const pendingReviewCount = labSamples.filter(
    s => s.status === 'AWAITING_REVIEW'
  ).length;
  const completedSamplesCount = labSamples.filter(
    s => s.status === 'COMPLETED'
  ).length;

  const handleSaveSettings = () => {
    if (onSaveSettings) {
      onSaveSettings('LAB_SPECIALIST', {
        outOfSpecAlert,
        coaTemplate,
        precisionDecimals,
        digitalSignatory
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div 
      className="lab-profile-workspace"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* Contextual Workspace Readiness Prompt (§ 16) */}
      <div 
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #BFDBFE',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FlaskConical size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1E3A8A' }}>
              Analytical Laboratory Workspace Active
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#3B82F6' }}>
              ISO/IEC 17025 accredited analytical facility • {activeSamplesCount} active samples in testing pipeline.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateTo('samples')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', borderColor: '#BFDBFE', color: '#1D4ED8' }}
          >
            <TestTube size={14} /> Sample Intake
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onNavigateTo('tests')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' }}
          >
            <FlaskConical size={14} /> Active Assays
          </button>
        </div>
      </div>

      {/* Grid: Lab Identity & Operations Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* 1. Laboratory Scientific Identity */}
        <div 
          style={{
            padding: '20px',
            borderRadius: '14px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FlaskConical size={18} color="#1D4ED8" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
              Laboratory Scientific Identity
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748B' }}>Institution Name</span>
              <strong style={{ color: '#0F172A' }}>Apex Honey Analytical Laboratory</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748B' }}>Facility Type</span>
              <strong style={{ color: '#0F172A' }}>Chemical & Microbiological Testing Facility</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748B' }}>Accreditation Standard</span>
              <strong style={{ color: '#1D4ED8' }}>ISO/IEC 17025:2017 (NABL TC-8841)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748B' }}>Location</span>
              <strong style={{ color: '#0F172A' }}>Chennai Analytical Science Park, TN</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Operating Status</span>
              <strong style={{ color: '#16A34A' }}>● Calibrated & Operational</strong>
            </div>
          </div>
        </div>

        {/* 2. Operations Live Summary */}
        <div 
          style={{
            padding: '20px',
            borderRadius: '14px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TestTube size={18} color="#1D4ED8" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                Active Testing Pipeline
              </h3>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateTo('samples')}
              style={{ padding: '2px 8px', fontSize: '12px', borderColor: '#E2E8F0' }}
            >
              Registry
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1D4ED8' }}>{activeSamplesCount}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#1E40AF' }}>Samples in Testing</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803D' }}>{inProgressTestsCount}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#166534' }}>Assays Running</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '10px', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#B45309' }}>{pendingReviewCount}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#92400E' }}>Pending Review</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#475569' }}>{completedSamplesCount}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>Finalized CoA</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lab Credentials & Regulatory Standing (§ 6: Clear states, Never false FSSAI Approved) */}
      <div 
        style={{
          padding: '20px',
          borderRadius: '14px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <ShieldCheck size={18} color="#16A34A" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
            Accreditations, Signatories & Regulatory Standing
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ fontSize: '13px', color: '#0F172A' }}>NABL Accreditation (ISO/IEC 17025)</strong>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#15803D', backgroundColor: '#F0FDF4', padding: '2px 8px', borderRadius: '6px' }}>
                ✓ Verified
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#475569' }}>
              Certificate Ref: TC-8841 • Chemical & Biological Discipline
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
              Valid through: 31-Dec-2027 • Regular Surveillance Audited
            </div>
          </div>

          <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ fontSize: '13px', color: '#0F172A' }}>FSSAI Recognition Standing</strong>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#15803D', backgroundColor: '#F0FDF4', padding: '2px 8px', borderRadius: '6px' }}>
                ✓ Recognized Testing Lab
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#475569' }}>
              Gazette Notification Ref: FSSAI/LAB/REC/2026/TN-09
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
              Authorized testing for Honey, Bee Pollen & Royal Jelly
            </div>
          </div>

          <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ fontSize: '13px', color: '#0F172A' }}>Authorized Lead Signatories</strong>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#1D4ED8', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '6px' }}>
                2 Personnel Active
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#475569' }}>
              Dr. Elena Vance, Ph.D. (Chief Analytical Chemist)
            </div>
            <div style={{ fontSize: '12px', color: '#475569' }}>
              Marcus K., M.Sc. (Senior Quality Reviewer)
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Testing Capabilities & Calibrated Equipment */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* 4. Testing Methods & Capabilities */}
        <div 
          style={{
            padding: '20px',
            borderRadius: '14px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#1D4ED8" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                Authorized Testing Methods
              </h3>
            </div>
            <span style={{ fontSize: '11px', color: '#1D4ED8', fontWeight: 600 }}>
              6 Methods Active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.values(LAB_TEST_CATALOG).map((test) => (
              <div 
                key={test.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              >
                <div>
                  <strong style={{ color: '#0F172A' }}>{test.shortName}</strong>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{test.standardMethod}</div>
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#1D4ED8', fontWeight: 600 }}>
                  {test.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Calibrated Scientific Instruments */}
        <div 
          style={{
            padding: '20px',
            borderRadius: '14px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="#1D4ED8" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                Calibrated Instrument Catalog
              </h3>
            </div>
            <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>
              {LAB_EQUIPMENT_CATALOG.length} Instruments
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {LAB_EQUIPMENT_CATALOG.map((eq) => (
              <div 
                key={eq.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              >
                <div>
                  <strong style={{ color: '#0F172A' }}>{eq.name}</strong>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>SN: {eq.serialNumber} • Cal: {eq.lastCalibrationDate}</div>
                </div>
                <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>
                  ● {eq.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Scientific Laboratory Workspace Settings */}
      <div 
        style={{
          padding: '20px',
          borderRadius: '14px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="#1D4ED8" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
              Laboratory Precision & Audit Preferences
            </h3>
          </div>
          {isSaved && (
            <span style={{ fontSize: '12px', color: '#15803D', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Check size={14} /> Laboratory Preferences Saved
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#334155' }}>
              Standard CoA Report Format
            </label>
            <select
              className="input-select"
              value={coaTemplate}
              onChange={(e) => setCoaTemplate(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
            >
              <option value="ISO_17025_NABL">ISO/IEC 17025:2017 Standard CoA (NABL)</option>
              <option value="CODEX_STAN_12">Codex Alimentarius Standard 12-1981</option>
              <option value="FSSAI_COMPLIANT">FSSAI Honey Standards (Gazette 2020)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#334155' }}>
              Measurement Decimal Precision
            </label>
            <select
              className="input-select"
              value={precisionDecimals}
              onChange={(e) => setPrecisionDecimals(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
            >
              <option value="1">1 Decimal Place (e.g. 17.4 %)</option>
              <option value="2">2 Decimal Places (e.g. 17.42 %)</option>
              <option value="3">3 Decimal Places (Trace Analysis)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#334155' }}>
              Out-of-Spec Realtime Alerts
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '38px' }}>
              <input
                type="checkbox"
                id="out-of-spec-check"
                checked={outOfSpecAlert}
                onChange={(e) => setOutOfSpecAlert(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#1D4ED8', cursor: 'pointer' }}
              />
              <label htmlFor="out-of-spec-check" style={{ fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                Flag immediate critical alerts on limit exceedance
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#334155' }}>
              Cryptographic Digital Signatures
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '38px' }}>
              <input
                type="checkbox"
                id="signatory-pin-check"
                checked={digitalSignatory}
                onChange={(e) => setDigitalSignatory(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#1D4ED8', cursor: 'pointer' }}
              />
              <label htmlFor="signatory-pin-check" style={{ fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                Require Analyst PIN for final Certificate of Analysis
              </label>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleSaveSettings}
            style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' }}
          >
            Save Laboratory Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
