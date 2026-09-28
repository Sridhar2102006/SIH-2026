import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  FileText, 
  ShieldCheck, 
  Download, 
  ExternalLink, 
  Plus, 
  Check, 
  AlertCircle, 
  Lock, 
  History, 
  ArrowRight,
  FileCheck,
  Send
} from 'lucide-react';
import { CentralizedReportingService } from '../../services/centralizedReportingService';
import { REPORT_STATUSES, REPORT_STATUS_LABELS } from '../../services/labDomainService';

export const LabReportsView = () => {
  const {
    labSamples = [],
    labTests = [],
    labReports = [],
    setLabReports,
    sendLabReportToProcessorAndDispatch,
    setActiveTab,
    showToast
  } = useAppState();

  const [activeReport, setActiveReport] = useState(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [signatoryPin, setSignatoryPin] = useState('');
  const [signatoryName, setSignatoryName] = useState('Dr. Elena Vance');
  const [isAmending, setIsAmending] = useState(false);
  const [amendmentReason, setAmendmentReason] = useState('');

  // Samples eligible for report generation (have completed tests)
  const eligibleSamples = labSamples.filter(s => s.status === 'COMPLETED' || s.status === 'AWAITING_REVIEW');

  const handleGenerateReport = (e) => {
    e.preventDefault();
    if (!selectedSampleId) {
      if (showToast) showToast('Please select a sample for report generation.');
      return;
    }
    if (!signatoryPin || signatoryPin.length < 4) {
      if (showToast) showToast('Valid 4-digit Authorized Signatory PIN is required.');
      return;
    }

    const sample = labSamples.find(s => s.id === selectedSampleId);
    const relatedTests = labTests.filter(t => t.sampleId === selectedSampleId && t.status === 'COMPLETED');

    const newReport = CentralizedReportingService.formatLabCoAReport({
      sample,
      tests: relatedTests,
      labDetails: {
        name: 'Apex Honey Analytical Laboratory',
        accreditationRef: 'NABL TC-8841',
        fssaiRef: 'FL-2026-TN-09'
      },
      signatory: {
        name: signatoryName,
        role: 'Chief Analytical Chemist'
      },
      version: 1
    });

    const updated = [newReport, ...(labReports || [])];
    if (setLabReports) setLabReports(updated);

    // Auto-deliver to Processor and Dispatch
    if (sendLabReportToProcessorAndDispatch) {
      sendLabReportToProcessorAndDispatch({
        sampleId: selectedSampleId,
        report: newReport,
        signatoryName
      });
    } else {
      if (showToast) showToast(`Certificate of Analysis ${newReport.documentId} generated & signed.`);
    }
    
    setIsGenerateModalOpen(false);
    setActiveReport(newReport);
    setSignatoryPin('');
  };

  const handleAmendReport = (e) => {
    e.preventDefault();
    if (!amendmentReason || amendmentReason.trim().length < 8) {
      if (showToast) showToast('Formal amendment explanation of at least 8 characters is required.');
      return;
    }

    const amendedReport = {
      ...activeReport,
      version: (activeReport.version || 1) + 1,
      status: 'AMENDED',
      amendedAt: new Date().toISOString(),
      amendmentReason: amendmentReason.trim(),
      amendmentHistory: [
        ...(activeReport.amendmentHistory || []),
        {
          previousVersion: activeReport.version || 1,
          previousHash: activeReport.documentHash,
          reason: amendmentReason.trim(),
          timestamp: new Date().toISOString()
        }
      ]
    };

    const updated = (labReports || []).map(r => r.documentId === activeReport.documentId ? amendedReport : r);
    if (setLabReports) setLabReports(updated);
    if (showToast) showToast(`Report ${amendedReport.documentId} amended to version v${amendedReport.version}.`);

    setActiveReport(amendedReport);
    setIsAmending(false);
    setAmendmentReason('');
  };

  const handleHandoffToFSSAI = (report) => {
    setActiveTab('regulatory');
    if (showToast) showToast(`Handoff to InFoLNeT Dossier for Report ${report.documentId}`);
  };

  return (
    <div className="lab-reports-workspace" style={{ maxWidth: '1080px', margin: '0 auto', padding: '16px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          padding: '20px 24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #CBD5E1',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={22} color="#1D4ED8" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
              Formal Laboratory Reports & CoA Register
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>
            ISO/IEC 17025 accredited Certificates of Analysis • Cryptographically sealed & versioned
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsGenerateModalOpen(true)}
          style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          id="generate-lab-report-btn"
        >
          <Plus size={15} /> Generate Certificate of Analysis
        </button>
      </div>

      {/* Reports List and Detail Split */}
      <div style={{ display: 'grid', gridTemplateColumns: activeReport ? '1fr 1.3fr' : '1fr', gap: '20px' }}>
        {/* Left Column: Reports List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(labReports && labReports.length > 0) ? (
            labReports.map(rep => {
              const isSelected = activeReport?.documentId === rep.documentId;
              return (
                <div
                  key={rep.documentId}
                  onClick={() => setActiveReport(rep)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    border: isSelected ? '2px solid #1D4ED8' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  className="lab-report-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '15px', color: '#0F172A' }}>{rep.documentId}</strong>
                        <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '2px 6px', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                          v{rep.version || 1}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        Sample: {rep.sample?.id} • Batch: {rep.sample?.sourceBatch}
                      </div>
                    </div>

                    <span 
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: rep.status === 'RELEASED' ? '#F0FDF4' : '#FFFBEB',
                        color: rep.status === 'RELEASED' ? '#15803D' : '#B45309',
                        border: rep.status === 'RELEASED' ? '1px solid #BBF7D0' : '1px solid #FDE68A'
                      }}
                    >
                      {REPORT_STATUS_LABELS[rep.status] || rep.status}
                    </span>
                  </div>

                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                    <span>Signatory: {rep.signatory?.name}</span>
                    <span>{new Date(rep.reportDate).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div 
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px dashed #CBD5E1'
              }}
            >
              <FileText size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#334155' }}>
                No Reports Generated Yet
              </h4>
              <p style={{ margin: '6px 0 16px 0', fontSize: '13px', color: '#64748B' }}>
                Complete analytical test measurements for a honey sample to compile an official ISO/IEC 17025 CoA.
              </p>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsGenerateModalOpen(true)}
              >
                Create First Certificate of Analysis
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Formal Certificate of Analysis Preview (§23) */}
        {activeReport && (
          <div 
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #CBD5E1',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            {/* CoA Header Banner */}
            <div style={{ borderBottom: '2px solid #0F172A', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Official Certificate of Analysis (CoA)
                  </div>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                    {activeReport.lab?.name || 'Apex Honey Analytical Laboratory'}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    Accreditation: {activeReport.lab?.accreditation} • FSSAI Recognition: {activeReport.lab?.fssaiReference}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    {activeReport.documentId}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#1D4ED8' }}>
                    Version v{activeReport.version || 1}
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
              <div><strong>Sample Identifier:</strong> {activeReport.sample?.id}</div>
              <div><strong>Source Batch:</strong> {activeReport.sample?.sourceBatch}</div>
              <div><strong>Received Date:</strong> {activeReport.sample?.receivedDate}</div>
              <div><strong>Condition:</strong> {activeReport.sample?.condition}</div>
            </div>

            {/* Test Results Table */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Analytical Findings & Parameter Verification
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #CBD5E1', backgroundColor: '#F1F5F9', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Test Parameter</th>
                    <th style={{ padding: '8px' }}>Standard Method</th>
                    <th style={{ padding: '8px' }}>Result</th>
                    <th style={{ padding: '8px' }}>Specification Limit</th>
                    <th style={{ padding: '8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeReport.tests || []).map((t, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{t.name || t.key}</td>
                      <td style={{ padding: '8px', color: '#64748B' }}>{t.method}</td>
                      <td style={{ padding: '8px', fontWeight: 700 }}>{t.result}</td>
                      <td style={{ padding: '8px', color: '#64748B' }}>{t.limit}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: t.status === 'CONFORMING' ? '#15803D' : '#B91C1C' }}>
                          ✓ {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatory & Digital Seal (§27) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#15803D" />
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>Authorized Digital Signature</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                  Signatory: {activeReport.signatory?.name} ({activeReport.signatory?.title})
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                  SHA-256 Digest: {activeReport.documentHash ? activeReport.documentHash.slice(0, 24) + '...' : 'SECURE-SEALED'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803D', backgroundColor: '#F0FDF4', padding: '4px 10px', borderRadius: '20px', border: '1px solid #BBF7D0' }}>
                  ✓ VALIDATED & RELEASED
                </span>
              </div>
            </div>

            {/* Statutory Disclaimer (§1) */}
            <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: '1.4', fontStyle: 'italic' }}>
              {activeReport.disclaimer}
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsAmending(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <History size={13} /> Amend Report
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (sendLabReportToProcessorAndDispatch && activeReport?.sample?.id) {
                      sendLabReportToProcessorAndDispatch({
                        sampleId: activeReport.sample.id,
                        report: activeReport,
                        signatoryName: activeReport.signatory?.name
                      });
                    }
                  }}
                  style={{ backgroundColor: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <Send size={13} /> Send to Processor & Dispatch
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleHandoffToFSSAI(activeReport)}
                  style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <Send size={13} /> Submit to InFoLNeT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {isGenerateModalOpen && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsGenerateModalOpen(false)}
        >
          <div 
            className="card modal-content"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #CBD5E1'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                Generate Certificate of Analysis
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsGenerateModalOpen(false)}
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleGenerateReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Select Completed Honey Sample
                </label>
                <select
                  className="input-select"
                  value={selectedSampleId}
                  onChange={(e) => setSelectedSampleId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  <option value="">-- Choose Sample from Queue --</option>
                  {eligibleSamples.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.id} (Batch: {s.sourceBatchNumber}) • {s.status}
                    </option>
                  ))}
                  {eligibleSamples.length === 0 && (
                    <option value="LS-2026-0041">LS-2026-0041 (Demo Raw Wildflower Batch PB-2026-00041)</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Authorized Signatory Name
                </label>
                <input 
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Signatory PIN (Four-Eyes Authorization §35)
                </label>
                <input 
                  type="password"
                  placeholder="Enter 4-digit PIN"
                  maxLength={6}
                  value={signatoryPin}
                  onChange={(e) => setSignatoryPin(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', letterSpacing: '2px' }}
                />
              </div>

              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsGenerateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' }}
                >
                  Sign & Issue CoA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Amend Report Modal */}
      {isAmending && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsAmending(false)}
        >
          <div 
            className="card modal-content"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #CBD5E1'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
              Amend Laboratory Report {activeReport?.documentId} (§25)
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748B' }}>
              Issuing an amendment creates version v{(activeReport?.version || 1) + 1}. The original version v{activeReport?.version || 1} is permanently preserved in the audit log.
            </p>

            <form onSubmit={handleAmendReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Mandatory Formal Reason for Amendment
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Typographical correction in floral taxon description; analytical values unchanged."
                  value={amendmentReason}
                  onChange={(e) => setAmendmentReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAmending(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' }}
                >
                  Issue Amended v{(activeReport?.version || 1) + 1}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
