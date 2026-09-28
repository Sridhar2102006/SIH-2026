/**
 * SCREEN — READY TO DISPATCH PACKAGE QUEUE
 *
 * Dedicated Canonical Destination for Package Identification & QR Check
 * Route: /dispatch
 *
 * Primary Purpose: Inspect finalized honey packages, verify physical QR codes,
 * check Quality release status, and allocate packages to shipment manifests.
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Package,
  QrCode,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Truck,
  Plus,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Clock,
  ExternalLink
} from 'lucide-react';
import { DispatchQrScannerModal } from './DispatchQrScannerModal';
import { PackageTraceabilityModal } from './PackageTraceabilityModal';
import { CreateShipmentModal } from './CreateShipmentModal';
import { LabReportModal } from '../lab/LabReportModal';
import {
  PACKAGE_STATUSES,
  PACKAGE_STATUS_LABELS
} from '../../services/dispatchDomainService';

export const DispatchPackagesView = () => {
  const {
    session,
    dispatchPackages,
    dispatchShipments,
    executeDispatchQrOverride,
    showToast
  } = useAppState();

  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'COA_APPROVED' | 'READY_FOR_DISPATCH' | 'ALLOCATED' | 'DISPATCHED' | 'DELIVERED'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [targetPackageForScan, setTargetPackageForScan] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedPackageForTrace, setSelectedPackageForTrace] = useState(null);
  const [packageForShipment, setPackageForShipment] = useState(null);
  const [isCreateShipmentOpen, setIsCreateShipmentOpen] = useState(false);
  const [selectedPackageForReport, setSelectedPackageForReport] = useState(null);

  // Override Modal
  const [overridePackage, setOverridePackage] = useState(null);
  const [overrideReason, setOverrideReason] = useState('Physical scanner lens smudged; barcode manual serial verified by supervisor.');
  const [overrideApprover, setOverrideApprover] = useState('Marcus Vance (Shift Supervisor)');

  const userCaps = new Set((session?.capabilities || []).map(c => String(c).toUpperCase()));
  const canOverride = userCaps.has('DISPATCH_QR_OVERRIDE') || userCaps.has('DISTRIBUTION_WORKSPACE');

  // Filter & Search Logic
  const filteredPackages = dispatchPackages.filter(p => {
    if (filterStatus === 'COA_APPROVED' && !p.coaDocumentId && !p.labReport) return false;
    if (filterStatus === 'READY_FOR_DISPATCH' && p.status !== PACKAGE_STATUSES.READY_FOR_DISPATCH) return false;
    if (filterStatus === 'ALLOCATED' && p.status !== PACKAGE_STATUSES.ALLOCATED) return false;
    if (filterStatus === 'DISPATCHED' && p.status !== PACKAGE_STATUSES.DISPATCHED && p.status !== PACKAGE_STATUSES.IN_TRANSIT) return false;
    if (filterStatus === 'DELIVERED' && p.status !== PACKAGE_STATUSES.DELIVERED) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = p.packageId.toLowerCase().includes(q);
      const matchProd = p.productName.toLowerCase().includes(q);
      const matchBatch = p.batchNumber.toLowerCase().includes(q);
      const matchSeal = (p.tamperSealId || '').toLowerCase().includes(q);
      const matchQr = (p.qrId || '').toLowerCase().includes(q);
      return matchId || matchProd || matchBatch || matchSeal || matchQr;
    }
    return true;
  });

  const handleOpenScanner = (pkg) => {
    setTargetPackageForScan(pkg);
    setIsScannerOpen(true);
  };

  const handleOpenCreateShipment = (pkg) => {
    setPackageForShipment(pkg);
    setIsCreateShipmentOpen(true);
  };

  const handleExecuteOverride = (e) => {
    e.preventDefault();
    if (!overridePackage) return;
    const res = executeDispatchQrOverride({
      packageId: overridePackage.packageId,
      overrideReason,
      approvedBy: overrideApprover
    });
    if (res.success) {
      setOverridePackage(null);
    }
  };

  return (
    <div className="dispatch-packages-container" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #FFF9EF 0%, #FFFFFF 100%)',
          border: '1px solid #E2D9CC',
          borderRadius: '16px',
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: '#EFF6FA',
              color: '#0369A1',
              border: '1px solid #BAE6FD'
            }}
          >
            Finished Product Inventory & Physical QR Check
          </span>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            {dispatchPackages.length} Total Registered Packages
          </span>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#34261B', margin: '4px 0' }}>
          Ready for Dispatch Package Queue
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 14px', lineHeight: 1.4 }}>
          Perform final physical QR validation, verify batch lineage, and allocate approved retail units to carrier consignments.
        </p>

        {/* Universal Scan Button */}
        <div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenScanner(null)}
            style={{
              backgroundColor: '#D99A24',
              borderColor: '#D99A24',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px'
            }}
          >
            <QrCode size={16} />
            <span>Launch Physical QR Scanner</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search Package ID, Product, Batch, or Tamper Seal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              backgroundColor: '#FFFFFF'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'ALL', label: `All (${dispatchPackages.length})` },
            { id: 'COA_APPROVED', label: `🛡️ CoA Approved (${dispatchPackages.filter(p => p.coaDocumentId || p.labReport).length})` },
            { id: 'READY_FOR_DISPATCH', label: `Ready (${dispatchPackages.filter(p => p.status === PACKAGE_STATUSES.READY_FOR_DISPATCH).length})` },
            { id: 'ALLOCATED', label: `Allocated (${dispatchPackages.filter(p => p.status === PACKAGE_STATUSES.ALLOCATED).length})` },
            { id: 'DISPATCHED', label: `Dispatched (${dispatchPackages.filter(p => p.status === PACKAGE_STATUSES.DISPATCHED || p.status === PACKAGE_STATUSES.IN_TRANSIT).length})` },
            { id: 'DELIVERED', label: `Delivered (${dispatchPackages.filter(p => p.status === PACKAGE_STATUSES.DELIVERED).length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: filterStatus === tab.id ? 700 : 500,
                border: '1px solid',
                borderColor: filterStatus === tab.id ? '#D99A24' : '#CBD5E1',
                backgroundColor: filterStatus === tab.id ? '#D99A24' : '#FFFFFF',
                color: filterStatus === tab.id ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Package Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredPackages.length === 0 ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1'
            }}
          >
            <Package size={32} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ margin: 0, fontSize: '15px', color: '#475569' }}>No packages match criteria</h4>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#94A3B8' }}>
              Adjust search query or filter pills to view packages.
            </p>
          </div>
        ) : (
          filteredPackages.map(pkg => {
            const isAllocated = pkg.status === PACKAGE_STATUSES.ALLOCATED;
            const isDispatched = pkg.status === PACKAGE_STATUSES.DISPATCHED || pkg.status === PACKAGE_STATUSES.IN_TRANSIT;
            const isDelivered = pkg.status === PACKAGE_STATUSES.DELIVERED;
            const isReady = pkg.status === PACKAGE_STATUSES.READY_FOR_DISPATCH;

            return (
              <div
                key={pkg.packageId}
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
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '16px', color: '#34261B' }}>{pkg.packageId}</strong>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: 600,
                          backgroundColor: isDelivered ? '#EBF7EE' : isDispatched ? '#EFF6FA' : isAllocated ? '#FFF9EF' : '#F1F5F9',
                          color: isDelivered ? '#2E7D32' : isDispatched ? '#0369A1' : isAllocated ? '#B45309' : '#475569'
                        }}
                      >
                        {PACKAGE_STATUS_LABELS[pkg.status] || pkg.status}
                      </span>
                      {pkg.isQrRevoked && (
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#FDF2F2', color: '#B91C1C', fontWeight: 700 }}>
                          QR REVOKED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginTop: '2px' }}>
                      {pkg.productName} · <span style={{ fontWeight: 400, color: '#64748B' }}>{pkg.unitDisplay}</span>
                    </div>
                  </div>

                  {/* QR Validation Status Badge */}
                  <div>
                    {pkg.isQrValidated ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          backgroundColor: '#EBF7EE',
                          color: '#2E7D32',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: '1px solid #C8E6C9'
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>QR Authenticated</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          backgroundColor: '#FFF9EF',
                          color: '#B45309',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: '1px solid #FCD34D'
                        }}
                      >
                        <Clock size={13} />
                        <span>Scan Validation Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '10px',
                    padding: '12px 14px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    border: '1px solid #F1F5F9'
                  }}
                >
                  <div>
                    <span style={{ color: '#64748B' }}>Batch Number:</span>{' '}
                    <strong style={{ color: '#4D7EA8' }}>{pkg.batchNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Quality Status:</span>{' '}
                    <strong style={{ color: pkg.qualityStatus === 'APPROVED' ? '#2E7D32' : '#B91C1C' }}>
                      {pkg.qualityStatus || 'PENDING'}
                    </strong>
                    {pkg.coaDocumentId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPackageForReport(pkg);
                        }}
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#15803D',
                          backgroundColor: '#DCFCE7',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid #BBF7D0',
                          marginLeft: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title="Click to view official Laboratory Certificate of Analysis"
                      >
                        <ShieldCheck size={12} />
                        <span>CoA: {pkg.coaDocumentId}</span>
                      </button>
                    )}
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Tamper Seal:</span>{' '}
                    <span style={{ fontSize: '11.5px', color: '#0369A1' }}>{pkg.tamperSealId}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Consignment:</span>{' '}
                    <span>{pkg.assignedShipmentId || 'Not Allocated'}</span>
                  </div>
                </div>

                {/* Actions Row */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(pkg.labReport || pkg.coaDocumentId) && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedPackageForReport(pkg)}
                        style={{ fontSize: '12px', padding: '5px 10px', borderColor: '#86EFAC', color: '#047857', backgroundColor: '#F0FDF4', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <ShieldCheck size={13} />
                        <span>View Lab CoA</span>
                      </button>
                    )}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedPackageForTrace(pkg)}
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      <Layers size={13} style={{ marginRight: '4px' }} />
                      <span>Trace Lineage</span>
                    </button>
                    {isReady && !pkg.assignedShipmentId && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenCreateShipment(pkg)}
                        style={{ fontSize: '12px', padding: '5px 10px', borderColor: '#7AA7C7', color: '#0369A1' }}
                      >
                        <Truck size={13} style={{ marginRight: '4px' }} />
                        <span>Allocate to Shipment</span>
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {/* Scan QR button */}
                    {!isDispatched && !isDelivered && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenScanner(pkg)}
                        style={{
                          fontSize: '12px',
                          padding: '5px 12px',
                          backgroundColor: pkg.isQrValidated ? '#2E7D32' : '#D99A24',
                          borderColor: pkg.isQrValidated ? '#2E7D32' : '#D99A24'
                        }}
                      >
                        <QrCode size={13} style={{ marginRight: '4px' }} />
                        <span>{pkg.isQrValidated ? 'Re-Validate QR' : 'Scan & Validate QR'}</span>
                      </button>
                    )}

                    {/* Privileged Override if scanner fails */}
                    {canOverride && !pkg.isQrValidated && !isDispatched && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setOverridePackage(pkg)}
                        title="Authorized Supervisor QR Override"
                        style={{ fontSize: '11px', padding: '5px 8px', borderColor: '#F59E0B', color: '#B45309' }}
                      >
                        <ShieldAlert size={12} style={{ marginRight: '3px' }} />
                        <span>Override</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Modals */}
      <DispatchQrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        targetPackageId={targetPackageForScan?.packageId}
        activeShipmentId={targetPackageForScan?.assignedShipmentId}
      />

      <PackageTraceabilityModal
        isOpen={Boolean(selectedPackageForTrace)}
        onClose={() => setSelectedPackageForTrace(null)}
        packageRecord={selectedPackageForTrace}
      />

      <CreateShipmentModal
        isOpen={isCreateShipmentOpen}
        onClose={() => setIsCreateShipmentOpen(false)}
        initialPackageId={packageForShipment?.packageId}
      />

      {/* Exceptional Override Modal (§ 9) */}
      {overridePackage && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }}>
          <div
            className="modal-card"
            style={{
              maxWidth: '480px',
              width: '95%',
              padding: 0,
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 25px 50px rgba(52, 38, 27, 0.25)',
              border: '1px solid #CBD5E1'
            }}
          >
            <div style={{ padding: '16px 20px', backgroundColor: '#FFF9EF', borderBottom: '1px solid #E2D9CC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="#B45309" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#34261B' }}>
                  Audited QR Override: {overridePackage.packageId}
                </h3>
              </div>
              <button onClick={() => setOverridePackage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteOverride} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.4 }}>
                This action bypasses optical QR scanning and records an audited supervisory override under standard protocol.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Mandatory Override Reason (min 10 chars) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Supervisor / Approver *
                </label>
                <input
                  type="text"
                  required
                  value={overrideApprover}
                  onChange={(e) => setOverrideApprover(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOverridePackage(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ backgroundColor: '#D99A24', borderColor: '#D99A24' }}>
                  Authorize Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LabReportModal
        isOpen={Boolean(selectedPackageForReport)}
        onClose={() => setSelectedPackageForReport(null)}
        report={selectedPackageForReport?.labReport}
      />
    </div>
  );
};
