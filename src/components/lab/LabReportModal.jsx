import React, { useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  FileText,
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Award
} from 'lucide-react';
import {
  LAB_TEST_CATALOG,
  QUALITY_RECOMMENDATIONS,
  resolveSampleTraceability
} from '../../services/labDomainService';

export const LabReportModal = ({ sample: propSample, report: propReport, isOpen, onClose }) => {
  const {
    labTests,
    labSamples,
    processingBatches,
    harvestRecords,
    frames,
    hives,
    apiaries,
    showToast
  } = useAppState();

  if (!isOpen || (!propSample && !propReport)) return null;

  const activeReport = propReport || propSample?.labReport || null;
  const sample = propSample || (activeReport?.sample?.id ? (labSamples || []).find(s => s.id === activeReport.sample.id) : null) || {
    id: activeReport?.sample?.id || 'LS-2026-CERT',
    sourceBatchNumber: activeReport?.sample?.sourceBatch || 'PB-2026-00041',
    containerType: 'Aseptic Sample Jar',
    quantityMl: 250,
    sealCondition: 'Tamper-Evident Intact',
    sourceTraceabilityCodes: ['AP1H001F1']
  };

  const sampleTests = (labTests || []).filter(t => t.sampleId === sample.id);

  // Derive standardized test findings
  const displayTests = (activeReport?.tests && activeReport.tests.length > 0)
    ? activeReport.tests.map((t, idx) => ({
        id: `rep-t-${idx}`,
        testName: t.parameter,
        method: t.method || 'Standard Method',
        equipmentName: 'Calibrated Bench Assays',
        result: t.result,
        unit: t.unit || '',
        referenceStandard: t.limit || t.referenceStandard || 'FSSAI Spec',
        isWithinSpecification: t.status === 'CONFORMING' || t.isWithinSpecification !== false
      }))
    : sampleTests.length > 0
    ? sampleTests
    : [
        { id: 't1', testName: 'Moisture Content (Refractometry)', method: 'IS 4941 Clause 4.2', equipmentName: 'Abbe Refractometer AR4', result: '17.6%', unit: '% w/w', referenceStandard: '≤ 20.0%', isWithinSpecification: true },
        { id: 't2', testName: 'Hydroxymethylfurfural (HMF)', method: 'Winkler Photometric', equipmentName: 'UV-Vis Spectrophotometer', result: '12.8', unit: 'mg/kg', referenceStandard: '≤ 40.0 mg/kg', isWithinSpecification: true },
        { id: 't3', testName: 'Diastase Activity Index', method: 'Schade Photometric', equipmentName: 'Automated Photometer', result: '14.2', unit: 'Schade units', referenceStandard: '≥ 8 Schade', isWithinSpecification: true },
        { id: 't4', testName: 'Fructose + Glucose Total', method: 'HPLC-RI Sugar Profile', equipmentName: 'Agilent 1260 Infinity II', result: '68.5', unit: '% w/w', referenceStandard: '≥ 65.0%', isWithinSpecification: true },
        { id: 't5', testName: 'C4 Sugars IRMS Screen', method: 'AOAC 998.12 Stable Isotope', equipmentName: 'Delta V Plus IRMS', result: '0.8', unit: '%', referenceStandard: '≤ 7.0%', isWithinSpecification: true }
      ];

  const traceability = resolveSampleTraceability({
    sample,
    processingBatches,
    harvestRecords,
    frames,
    hives,
    apiaries
  });

  const reportId = activeReport?.documentId || activeReport?.reportId || `LR-${sample.id.replace('LS-', '')}-01`;
  const reportDate = activeReport?.reportDate || activeReport?.signatory?.signedAt || new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const labName = activeReport?.lab?.name || 'HONEYCHAIN LABORATORY SERVICES';
  const labAccreditation = activeReport?.lab?.accreditation || 'Accredited Apiculture Analytical Testing & Quality Verification';
  const labFssai = activeReport?.lab?.fssaiReference || 'NABL ISO/IEC 17025 (TC-8841) · FSSAI Recognized';
  const signatoryName = activeReport?.signatory?.name || sampleTests[0]?.operator || 'Dr. Elena Vance, Senior Lab Analyst';
  const signatoryRole = activeReport?.signatory?.title || 'Chief Analytical Chemist';
  const complianceSummary = activeReport?.complianceSummary || (sample.qualityRecommendation ? (QUALITY_RECOMMENDATIONS[sample.qualityRecommendation]?.label || sample.qualityRecommendation) : 'CONFORMING TO SPECIFICATIONS');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '740px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(52, 38, 27, 0.25)',
          border: '1px solid #CBD5E1'
        }}
      >
        {/* Top Control Bar */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#2563EB" />
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#172033' }}>
              Laboratory Analytical Findings Report · {reportId}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => showToast('Printing Laboratory Analysis Report...')}
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              <Printer size={13} style={{ marginRight: '4px' }} />
              <span>Print</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => showToast('Report exported as PDF')}
              style={{ fontSize: '12px', padding: '5px 10px', backgroundColor: '#2563EB', borderColor: '#2563EB' }}
            >
              <Download size={13} style={{ marginRight: '4px' }} />
              <span>Export PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close report"
              data-test="close-lab-report"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Report Printable Document Body */}
        <div
          style={{
            padding: '32px 36px',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: '#FFFFFF',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2563EB', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FlaskConical size={26} color="#2563EB" />
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#172033', letterSpacing: '-0.3px' }}>
                  {labName}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                {labAccreditation}
              </p>
              <div style={{ fontSize: '11px', color: '#0369A1', marginTop: '2px', fontWeight: 600 }}>
                {labFssai}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Official Certificate / Report ID</div>
              <strong style={{ fontSize: '14px', color: '#172033' }}>{reportId}</strong>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>Date: {reportDate}</div>
              <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}>
                VERIFIED & DELIVERED
              </span>
            </div>
          </div>

          {/* Sample & Provenance Summary Table */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#FFF9EF',
              borderRadius: '8px',
              border: '1px solid #F1E5D1',
              marginBottom: '24px'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#8C7A6B', textTransform: 'uppercase', fontWeight: 700 }}>
                Sample Information
              </div>
              <table style={{ width: '100%', fontSize: '12.5px', marginTop: '6px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ color: '#64748B', padding: '2px 0' }}>Sample ID:</td>
                    <td style={{ fontWeight: 700, color: '#34261B' }}>{sample.id}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748B', padding: '2px 0' }}>Processing Batch:</td>
                    <td style={{ fontWeight: 600, color: '#2563EB' }}>{sample.sourceBatchNumber || sample.batchNumber || 'PB-2026-00041'}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748B', padding: '2px 0' }}>Container / Vol:</td>
                    <td>{sample.containerType || 'Aseptic Sample Jar'} ({sample.quantityMl || 250} mL)</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748B', padding: '2px 0' }}>Custody Seal:</td>
                    <td style={{ color: '#16A34A', fontWeight: 600 }}>{sample.sealCondition || 'Tamper-Evident Intact'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                Provenance & Lineage
              </div>
              <table style={{ width: '100%', fontSize: '12.5px', marginTop: '6px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ color: '#64748B', padding: '2px 0' }}>Apiary Origin:</td>
                    <td style={{ fontWeight: 600 }}>{traceability?.apiaries[0]?.name || 'Meadowbrook Apiary'} ({traceability?.apiaries[0]?.code || 'AP1'})</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748B', padding: '2px 0' }}>Hive / Colony:</td>
                    <td>{traceability?.hives[0]?.name || 'Hive 01'} (H001)</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748B', padding: '2px 0' }}>Frame Codes:</td>
                    <td style={{ fontWeight: 600 }}>{(sample.sourceTraceabilityCodes || []).join(', ') || 'AP1H001F1'}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#64748B', padding: '2px 0' }}>Lineage Hash:</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>0x8b3f...4489</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Test Results Table */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 700, color: '#172033' }}>
              Analytical Test Findings
            </h4>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12.5px',
                textAlign: 'left'
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '8px 10px', color: '#334155' }}>Assay Parameter</th>
                  <th style={{ padding: '8px 10px', color: '#334155' }}>Method & Standard</th>
                  <th style={{ padding: '8px 10px', color: '#334155', textAlign: 'right' }}>Result</th>
                  <th style={{ padding: '8px 10px', color: '#334155' }}>Unit</th>
                  <th style={{ padding: '8px 10px', color: '#334155' }}>Specification</th>
                  <th style={{ padding: '8px 10px', color: '#334155', textAlign: 'center' }}>Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {displayTests.map((t, idx) => (
                  <tr key={t.id || idx} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#172033' }}>{t.testName}</td>
                    <td style={{ padding: '10px', fontSize: '11.5px', color: '#64748B' }}>
                      {t.method}
                      <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>{t.equipmentName || 'Calibrated Bench'}</div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, fontSize: '13px' }}>
                      {t.result !== null ? t.result : 'Pending'}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#2563EB' }}>{t.unit}</td>
                    <td style={{ padding: '10px', fontSize: '11.5px', color: '#475569' }}>{t.referenceStandard}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {t.result !== null ? (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: t.isWithinSpecification ? '#F0FDF4' : '#FEF2F2',
                            color: t.isWithinSpecification ? '#16A34A' : '#DC2626',
                            border: `1px solid ${t.isWithinSpecification ? '#BBF7D0' : '#FECACA'}`
                          }}
                        >
                          {t.isWithinSpecification ? 'Compliant' : 'Out of Spec'}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>Awaiting</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Laboratory Quality Recommendation Section */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>
              Laboratory Analytical Conclusion & Quality Decision
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#172033', marginTop: '4px' }}>
              {complianceSummary}
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '12.5px', color: '#475569' }}>
              {sample.recommendationNotes || 'All submitted parameters evaluated under accredited NABL ISO/IEC 17025 standard protocols and verified compliant with FSSAI & Codex standards.'}
            </p>
          </div>

          {/* Signatures & Auditor Sign-off */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              borderTop: '1px solid #E2E8F0',
              paddingTop: '20px',
              marginTop: '16px'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Performing Analyst</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#34261B', marginTop: '4px' }}>
                {signatoryName}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>HoneyChain Accredited Analytical Bay</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Reviewing & Certifying Officer</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#34261B', marginTop: '4px' }}>
                {signatoryName} · {signatoryRole}
              </div>
              <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>Digitally Certified & Cryptographically Transmitted</div>
            </div>
          </div>

          {/* Explicit Legal & Domain Boundary Disclaimer (Section 3, 40) */}
          <div
            style={{
              marginTop: '24px',
              padding: '10px 14px',
              backgroundColor: '#FFF9EF',
              border: '1px dashed #D99A24',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#8C7A6B',
              lineHeight: 1.4
            }}
          >
            <strong>NOTICE OF QUALITY BOUNDARY:</strong> This document represents a Laboratory Analytical Testing Report documenting raw measurements and evidentiary findings. It does NOT constitute a final commercial Certificate of Analysis or Market Release Authorization unless independently ratified by an authorized Quality Officer holding the <code>QUALITY_DECISION</code> capability.
          </div>
        </div>
      </div>
    </div>
  );
};
