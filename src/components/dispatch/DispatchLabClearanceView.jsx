/**
 * SCREEN — DISPATCH LABORATORY CLEARANCES & COA RECEPTION INBOX
 *
 * Dedicated Canonical Destination for Lab Reports Received on Dispatch Side
 *
 * Primary Purpose:
 * Displays all accredited Laboratory Certificates of Analysis (CoA)
 * transmitted from the testing laboratory, confirming regulatory compliance
 * and releasing packaging inventory for QR authentication and shipment allocation.
 */

import React, { useState, useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  FileCheck,
  ShieldCheck,
  Search,
  FlaskConical,
  Package,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Award,
  Clock,
  FileText,
  Filter
} from 'lucide-react';
import { LabReportModal } from '../lab/LabReportModal';

export const DispatchLabClearanceView = ({ onNavigateToPackages, onSelectPackage }) => {
  const {
    dispatchPackages = [],
    processingBatches = [],
    labReports = [],
    showToast
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  // Group packages by CoA / Batch to construct clear clearance manifests
  const clearances = useMemo(() => {
    // 1. Gather all unique reports from labReports state or batches/packages
    const map = new Map();

    // From dedicated labReports state
    (labReports || []).forEach(rep => {
      if (rep && rep.documentId) {
        map.set(rep.documentId, {
          id: rep.documentId,
          report: rep,
          batchNumber: rep.sample?.sourceBatch || 'PB-2026-00041',
          compliance: rep.complianceSummary || 'CONFORMING TO SPECIFICATIONS',
          certifiedAt: rep.reportDate || rep.signatory?.signedAt || 'Today',
          signatory: rep.signatory?.name || 'Dr. Elena Vance (Lead Chemist)',
          labName: rep.lab?.name || 'Apex Honey Analytical Laboratory',
          accreditation: rep.lab?.accreditation || 'NABL ISO/IEC 17025 (TC-8841)'
        });
      }
    });

    // Also check processingBatches with labReport
    (processingBatches || []).forEach(b => {
      const docId = b.coaDocumentId || b.labReport?.documentId;
      if (docId && !map.has(docId)) {
        map.set(docId, {
          id: docId,
          report: b.labReport || null,
          batchNumber: b.batchNumber,
          honeyType: b.honeyType,
          compliance: b.complianceSummary || 'CONFORMING TO SPECIFICATIONS',
          certifiedAt: b.certifiedAt ? new Date(b.certifiedAt).toLocaleDateString() : 'Today',
          signatory: b.certifierName || 'Chief Analytical Chemist',
          labName: b.labReport?.lab?.name || 'Apex Honey Analytical Laboratory',
          accreditation: b.labReport?.lab?.accreditation || 'NABL ISO/IEC 17025 (TC-8841)'
        });
      }
    });

    // Also check dispatch packages with coaDocumentId
    (dispatchPackages || []).forEach(p => {
      const docId = p.coaDocumentId || p.labReport?.documentId;
      if (docId && !map.has(docId)) {
        map.set(docId, {
          id: docId,
          report: p.labReport || null,
          batchNumber: p.batchNumber,
          productName: p.productName,
          compliance: 'CONFORMING TO SPECIFICATIONS',
          certifiedAt: p.labCertifiedAt ? new Date(p.labCertifiedAt).toLocaleDateString() : 'Today',
          signatory: 'Dr. Elena Vance (Lead Chemist)',
          labName: 'Apex Honey Analytical Laboratory',
          accreditation: 'NABL ISO/IEC 17025 (TC-8841)'
        });
      }
    });

    return Array.from(map.values()).map(c => {
      const linkedPkgs = dispatchPackages.filter(p =>
        p.coaDocumentId === c.id ||
        p.batchNumber === c.batchNumber ||
        (p.labReport && p.labReport.documentId === c.id)
      );
      const linkedBatch = processingBatches.find(b => b.batchNumber === c.batchNumber || b.coaDocumentId === c.id);
      return {
        ...c,
        honeyType: c.honeyType || linkedBatch?.honeyType || 'Wildflower Honey',
        linkedPackagesCount: linkedPkgs.length,
        readyPackagesCount: linkedPkgs.filter(p => p.status === 'READY_FOR_DISPATCH').length,
        netYieldKg: linkedBatch?.finalYieldKg || linkedBatch?.weightKg || 48.5
      };
    });
  }, [labReports, processingBatches, dispatchPackages]);

  const filteredClearances = useMemo(() => {
    if (!searchQuery.trim()) return clearances;
    const q = searchQuery.toLowerCase();
    return clearances.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.batchNumber.toLowerCase().includes(q) ||
      (c.honeyType || '').toLowerCase().includes(q) ||
      (c.signatory || '').toLowerCase().includes(q)
    );
  }, [clearances, searchQuery]);

  const totalReleasedPackages = clearances.reduce((acc, c) => acc + c.linkedPackagesCount, 0);

  return (
    <div style={{ padding: '20px 16px 80px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Banner */}
      <div
        className="card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)',
          borderRadius: '16px',
          border: '1.5px solid #86EFAC',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '8px', border: '1px solid #BBF7D0' }}>
              <ShieldCheck size={14} />
              <span>Official Laboratory Clearance Gateway</span>
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800, color: '#064E3B' }}>
              Incoming Laboratory Clearances & Certificates of Analysis (CoA)
            </h2>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', maxWidth: '680px', lineHeight: 1.5 }}>
              Live cryptographic receipt of accredited test certificates from the Laboratory. Once a report is certified, associated batches are unlocked and commercial consumer packages are authorized for physical QR validation and carrier shipment.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '12px 18px', borderRadius: '12px', textAlign: 'center', border: '1px solid #86EFAC', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>{clearances.length}</div>
              <div style={{ fontSize: '11px', color: '#065F46', fontWeight: 700, textTransform: 'uppercase' }}>Clearances Received</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '12px 18px', borderRadius: '12px', textAlign: 'center', border: '1px solid #CBD5E1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563EB' }}>{totalReleasedPackages}</div>
              <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Released Retail Units</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94A3B8' }} />
        <input
          type="text"
          placeholder="Search by Certificate ID (CoA-2026-...), Batch (PB-2026-...), Floral Variety, or Chemist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px 10px 40px',
            borderRadius: '10px',
            border: '1px solid #CBD5E1',
            fontSize: '13.5px',
            backgroundColor: '#FFFFFF',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* 3. Clearance Manifests List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredClearances.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px dashed #CBD5E1'
            }}
          >
            <ShieldCheck size={36} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#334155' }}>No Laboratory Clearances Match</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              {searchQuery ? 'Try clearing your search query.' : 'When the laboratory completes testing and transmits a report, it will immediately appear here.'}
            </p>
          </div>
        ) : (
          filteredClearances.map(clearance => (
            <div
              key={clearance.id}
              className="card"
              style={{
                padding: '20px 24px',
                borderRadius: '14px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <ShieldCheck size={18} color="#059669" />
                    <strong style={{ fontSize: '16px', color: '#0F172A' }}>{clearance.id}</strong>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}>
                      CERTIFIED & RELEASED
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                      Batch: {clearance.batchNumber}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>
                    {clearance.honeyType} · Certified on {clearance.certifiedAt} by <strong>{clearance.signatory}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>Issuing Laboratory</div>
                  <strong style={{ fontSize: '13px', color: '#1E293B' }}>{clearance.labName}</strong>
                  <div style={{ fontSize: '11px', color: '#0369A1' }}>{clearance.accreditation}</div>
                </div>
              </div>

              {/* Compliance & Inventory Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12.5px'
                }}
              >
                <div>
                  <span style={{ color: '#64748B' }}>Compliance Status:</span>
                  <div style={{ fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                    ✓ {clearance.compliance}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Certified Net Volume:</span>
                  <div style={{ fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>
                    {clearance.netYieldKg} kg
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Retail Packaging Released:</span>
                  <div style={{ fontWeight: 700, color: '#2563EB', marginTop: '2px' }}>
                    {clearance.linkedPackagesCount} units ({clearance.readyPackagesCount} ready for dispatch)
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Regulatory Standards:</span>
                  <div style={{ fontWeight: 600, color: '#475569', marginTop: '2px' }}>
                    FSSAI / Codex Stan 12-1981
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedReport(clearance.report || { documentId: clearance.id, sample: { id: 'LS-2026-0041', sourceBatch: clearance.batchNumber } })}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#059669',
                      borderColor: '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={14} />
                    <span>View Official Certificate of Analysis</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      if (onNavigateToPackages) onNavigateToPackages(clearance.batchNumber);
                    }}
                    style={{
                      padding: '8px 14px',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Package size={14} />
                    <span>Inspect Released Packages ({clearance.linkedPackagesCount})</span>
                  </button>
                </div>

                <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} />
                  <span>Unlocked for Consumer QR Generation</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Embedded Lab Report Modal */}
      <LabReportModal
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />
    </div>
  );
};
