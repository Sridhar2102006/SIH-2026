import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  Building2, 
  Send, 
  Download, 
  ExternalLink, 
  Plus, 
  Check, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  FileText,
  FileCheck,
  X
} from 'lucide-react';
import { 
  REGULATORY_SUBMISSION_STATUSES, 
  REGULATORY_SUBMISSION_STATUS_LABELS 
} from '../../services/regulatoryRulesEngine';

export const RegulatorySubmissionsView = () => {
  const {
    labReports = [],
    regulatorySubmissions = [],
    setRegulatorySubmissions,
    showToast
  } = useAppState();

  const [activeSubmission, setActiveSubmission] = useState(null);
  const [isPrepareModalOpen, setIsPrepareModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [authorityRef, setAuthorityRef] = useState('');
  const [authorityStatus, setAuthorityStatus] = useState('ACCEPTED');
  const [authorityRemarks, setAuthorityRemarks] = useState('');

  const handlePrepareSubmission = (e) => {
    e.preventDefault();
    if (!selectedReportId) {
      if (showToast) showToast('Please select a validated laboratory report.');
      return;
    }

    const report = labReports.find(r => r.documentId === selectedReportId) || { documentId: selectedReportId, sample: { id: 'LS-2026-0041' } };
    const submissionId = `FSSAI-SUB-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const timestamp = new Date().toISOString();

    const newSub = {
      id: submissionId,
      reportId: report.documentId,
      sampleId: report.sample?.id || 'LS-2026-0041',
      status: REGULATORY_SUBMISSION_STATUSES.SUBMITTED,
      preparedAt: timestamp,
      targetPortal: 'FSSAI InFoLNeT Portal',
      packageChecksum: `PKG-SHA256-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes: submissionNotes.trim() || 'Standard statutory surveillance testing submission under FSSAI Honey Manual 03.',
      authorityResponse: null
    };

    const updated = [newSub, ...(regulatorySubmissions || [])];
    if (setRegulatorySubmissions) setRegulatorySubmissions(updated);
    if (showToast) showToast(`Submission Dossier ${submissionId} compiled & ready for InFoLNeT.`);

    setIsPrepareModalOpen(false);
    setActiveSubmission(newSub);
    setSubmissionNotes('');
  };

  const handleRecordResponse = (e) => {
    e.preventDefault();
    if (!authorityRef || authorityRef.trim().length < 5) {
      if (showToast) showToast('Official authority reference number is mandatory.');
      return;
    }

    const updatedSub = {
      ...activeSubmission,
      status: authorityStatus,
      authorityResponse: {
        externalReference: authorityRef.trim(),
        authorityStatus,
        remarks: authorityRemarks.trim() || 'Official response recorded from Food Safety Authority.',
        recordedAt: new Date().toISOString()
      }
    };

    const updated = (regulatorySubmissions || []).map(s => s.id === activeSubmission.id ? updatedSub : s);
    if (setRegulatorySubmissions) setRegulatorySubmissions(updated);
    if (showToast) showToast(`Authority status updated to ${authorityStatus} for ${activeSubmission.id}.`);

    setActiveSubmission(updatedSub);
    setIsResponseModalOpen(false);
    setAuthorityRef('');
    setAuthorityRemarks('');
  };

  const handleDownloadPackage = (sub) => {
    const jsonStr = JSON.stringify(sub, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sub.id}_FSSAI_InFoLNeT_Package.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (showToast) showToast(`Downloaded submission dossier ${sub.id}`);
  };

  return (
    <div className="regulatory-submissions-workspace" style={{ maxWidth: '1080px', margin: '0 auto', padding: '16px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header Banner */}
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
            <Building2 size={22} color="#1D4ED8" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
              FSSAI InFoLNeT Regulatory Submissions
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>
            Official statutory reporting interface • Integration adapter for Indian Food Laboratories Network
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsPrepareModalOpen(true)}
          style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          id="prepare-submission-btn"
        >
          <Plus size={15} /> Prepare Regulatory Dossier
        </button>
      </div>

      {/* Critical FSSAI Boundary Notice (§29, §56) */}
      <div 
        style={{
          marginBottom: '20px',
          padding: '14px 18px',
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: '#475569',
          lineHeight: '1.5'
        }}
      >
        <ShieldCheck size={20} color="#1D4ED8" />
        <div>
          <strong>Statutory Integration Boundary Notice:</strong> HoneyChain prepares, cryptographically validates, and packages analytical reports for regulatory handoff. Final acceptance or enforcement orders are rendered strictly by the Food Safety and Standards Authority of India (FSSAI).
        </div>
      </div>

      {/* Submissions Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: activeSubmission ? '1fr 1.3fr' : '1fr', gap: '20px' }}>
        {/* Left Column: Submissions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(regulatorySubmissions && regulatorySubmissions.length > 0) ? (
            regulatorySubmissions.map(sub => {
              const isSelected = activeSubmission?.id === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => setActiveSubmission(sub)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    border: isSelected ? '2px solid #1D4ED8' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  className="regulatory-sub-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#0F172A' }}>{sub.id}</strong>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        Report: {sub.reportId} • Sample: {sub.sampleId}
                      </div>
                    </div>

                    <span 
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: sub.status === 'ACCEPTED' ? '#F0FDF4' : (sub.status === 'SUBMITTED' ? '#EFF6FF' : '#FFFBEB'),
                        color: sub.status === 'ACCEPTED' ? '#15803D' : (sub.status === 'SUBMITTED' ? '#1D4ED8' : '#B45309'),
                        border: sub.status === 'ACCEPTED' ? '1px solid #BBF7D0' : '1px solid #BFDBFE'
                      }}
                    >
                      {REGULATORY_SUBMISSION_STATUS_LABELS[sub.status] || sub.status}
                    </span>
                  </div>

                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                    <span>Target: {sub.targetPortal}</span>
                    <span>{new Date(sub.preparedAt).toLocaleDateString()}</span>
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
              <Building2 size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#334155' }}>
                No Regulatory Submissions Active
              </h4>
              <p style={{ margin: '6px 0 16px 0', fontSize: '13px', color: '#64748B' }}>
                Compile a statutory submission package from a finalized Certificate of Analysis to initiate the InFoLNeT workflow.
              </p>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsPrepareModalOpen(true)}
              >
                Prepare First Dossier
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Submission Details & Authority Response (§30) */}
        {activeSubmission && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase' }}>
                  InFoLNeT Submission Dossier
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                  {activeSubmission.id}
                </h3>
              </div>

              <span 
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: activeSubmission.status === 'ACCEPTED' ? '#F0FDF4' : '#EFF6FF',
                  color: activeSubmission.status === 'ACCEPTED' ? '#15803D' : '#1D4ED8',
                  border: activeSubmission.status === 'ACCEPTED' ? '1px solid #BBF7D0' : '1px solid #BFDBFE'
                }}
              >
                {REGULATORY_SUBMISSION_STATUS_LABELS[activeSubmission.status] || activeSubmission.status}
              </span>
            </div>

            {/* Dossier Metadata */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Associated Lab Report</span>
                <strong>{activeSubmission.reportId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Target Laboratory Network</span>
                <strong>{activeSubmission.targetPortal}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Cryptographic Package Checksum</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '11px' }}>{activeSubmission.packageChecksum}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Prepared Timestamp</span>
                <span>{new Date(activeSubmission.preparedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Authority Official Response Box (§30) */}
            <div 
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: activeSubmission.authorityResponse ? '#F0FDF4' : '#F8FAFC',
                border: activeSubmission.authorityResponse ? '1px solid #BBF7D0' : '1px solid #E2E8F0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} color={activeSubmission.authorityResponse ? '#15803D' : '#64748B'} />
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>Official Authority Response</strong>
                </div>

                {!activeSubmission.authorityResponse && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsResponseModalOpen(true)}
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                  >
                    Record Authority Response
                  </button>
                )}
              </div>

              {activeSubmission.authorityResponse ? (
                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Authority Reference:</strong> {activeSubmission.authorityResponse.externalReference}</div>
                  <div><strong>Official Status:</strong> <span style={{ color: '#15803D', fontWeight: 700 }}>✓ {activeSubmission.authorityResponse.authorityStatus}</span></div>
                  <div><strong>Official Remarks:</strong> {activeSubmission.authorityResponse.remarks}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                    Recorded on: {new Date(activeSubmission.authorityResponse.recordedAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Awaiting formal acknowledgement from FSSAI InFoLNeT authority. You can record official responses upon gazette / portal notification.
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
              <a
                href="https://infolnet.fssai.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ExternalLink size={13} /> Open Official InFoLNeT Portal
              </a>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDownloadPackage(activeSubmission)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <Download size={13} /> Export Package (.json)
                </button>

                {activeSubmission.authorityResponse && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsResponseModalOpen(true)}
                    style={{ fontSize: '12px' }}
                  >
                    Update Response
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prepare Submission Modal */}
      {isPrepareModalOpen && (
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
          onClick={() => setIsPrepareModalOpen(false)}
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
                Prepare InFoLNeT Submission Dossier
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsPrepareModalOpen(false)}
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePrepareSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Select Finalized Certificate of Analysis
                </label>
                <select
                  className="input-select"
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  <option value="">-- Choose Released Report --</option>
                  {(labReports || []).map(r => (
                    <option key={r.documentId} value={r.documentId}>
                      {r.documentId} (v{r.version}) • Sample: {r.sample?.id} • {r.status}
                    </option>
                  ))}
                  {(!labReports || labReports.length === 0) && (
                    <option value="LAB-RPT-2026-00421">LAB-RPT-2026-00421 (Demo Wildflower CoA v1)</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Statutory Submission Purpose / Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="Routine surveillance compliance testing under FSSAI Honey & Beehive Products Manual 03."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPrepareModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' }}
                >
                  Compile Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Authority Response Modal (§30) */}
      {isResponseModalOpen && (
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
          onClick={() => setIsResponseModalOpen(false)}
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
              Record Official Authority Response (§30)
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748B' }}>
              Record official decisions received from the Food Safety and Standards Authority of India (InFoLNeT).
            </p>

            <form onSubmit={handleRecordResponse} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Official Authority Reference Number
                </label>
                <input 
                  type="text"
                  placeholder="e.g. FSSAI-INFOLNET-2026-88192"
                  value={authorityRef}
                  onChange={(e) => setAuthorityRef(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Authority Determination Status
                </label>
                <select
                  className="input-select"
                  value={authorityStatus}
                  onChange={(e) => setAuthorityStatus(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  <option value="ACCEPTED">ACCEPTED — Compliance Verified by Authority</option>
                  <option value="ACTION_REQUIRED">ACTION_REQUIRED — Clarification Requested</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW — Technical Evaluation Ongoing</option>
                  <option value="REJECTED">REJECTED — Non-Compliance Cited</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Official Remarks / Gazette Citations
                </label>
                <textarea
                  rows={2}
                  placeholder="Official notification order number, gazette citation, or inspector remarks."
                  value={authorityRemarks}
                  onChange={(e) => setAuthorityRemarks(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsResponseModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' }}
                >
                  Save Authority Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
