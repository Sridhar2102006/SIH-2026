/**
 * SCREEN — SHIPMENTS & CONSIGNMENT MANIFESTS
 *
 * Dedicated Canonical Destination for Shipment Lifecycle & Release Guard
 * Route: /shipments or #shipments
 *
 * Enforces:
 * - Unique Server ID: SHP-YYYY-XXXXX
 * - Every package must independently pass physical QR validation before release
 * - Release Guard Checklist blocks release if even 1 package is unauthenticated
 * - Transitions: READY → VALIDATING → READY_FOR_PICKUP → PICKED_UP → IN_TRANSIT → DELIVERED
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Truck,
  Plus,
  Package,
  QrCode,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Calendar,
  FileCheck,
  Search,
  ExternalLink
} from 'lucide-react';
import { CreateShipmentModal } from './CreateShipmentModal';
import { DispatchQrScannerModal } from './DispatchQrScannerModal';
import {
  SHIPMENT_STATUSES,
  SHIPMENT_STATUS_LABELS,
  validateShipmentRelease
} from '../../services/dispatchDomainService';

export const ShipmentsView = () => {
  const {
    session,
    dispatchShipments,
    dispatchPackages,
    releaseDispatchShipment,
    updateShipmentStatus,
    showToast
  } = useAppState();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'VALIDATING' | 'READY_FOR_PICKUP' | 'IN_TRANSIT' | 'DELIVERED'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [scanningShipment, setScanningShipment] = useState(null);
  const [scanningPackageId, setScanningPackageId] = useState(null);

  const userCaps = new Set((session?.capabilities || []).map(c => String(c).toUpperCase()));
  const canRelease = userCaps.has('SHIPMENT_RELEASE') || userCaps.has('DISTRIBUTION_WORKSPACE');

  const filteredShipments = dispatchShipments.filter(s => {
    if (activeTab === 'VALIDATING' && s.status !== SHIPMENT_STATUSES.READY && s.status !== SHIPMENT_STATUSES.VALIDATING) return false;
    if (activeTab === 'READY_FOR_PICKUP' && s.status !== SHIPMENT_STATUSES.READY_FOR_PICKUP) return false;
    if (activeTab === 'IN_TRANSIT' && s.status !== SHIPMENT_STATUSES.IN_TRANSIT && s.status !== SHIPMENT_STATUSES.PICKED_UP && s.status !== SHIPMENT_STATUSES.OUT_FOR_DELIVERY) return false;
    if (activeTab === 'DELIVERED' && s.status !== SHIPMENT_STATUSES.DELIVERED) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = s.id.toLowerCase().includes(q);
      const matchDest = s.destination.toLowerCase().includes(q);
      const matchCarrier = s.carrier.toLowerCase().includes(q);
      const matchTrk = (s.trackingNumber || '').toLowerCase().includes(q);
      return matchId || matchDest || matchCarrier || matchTrk;
    }
    return true;
  });

  const handleOpenScannerForShipment = (shipment, pkgId = null) => {
    setScanningShipment(shipment);
    setScanningPackageId(pkgId);
  };

  const handleReleaseShipment = (shipment) => {
    const res = releaseDispatchShipment({ shipmentId: shipment.id });
    if (!res.success) {
      // Toast already shown
    }
  };

  return (
    <div className="shipments-view-container" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            Transport Manifests & Consignments
          </span>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            {dispatchShipments.length} Active Shipments
          </span>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#34261B', margin: '4px 0' }}>
          Consignment Preparation & Release Guard
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 14px', lineHeight: 1.4 }}>
          Audit physical QR scans across every allocated retail package. Enforce complete verification before carrier handover.
        </p>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsCreateOpen(true)}
          style={{
            backgroundColor: '#D99A24',
            borderColor: '#D99A24',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px'
          }}
        >
          <Plus size={16} />
          <span>Create New Shipment</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search Shipment ID, Destination, Carrier, or Tracking..."
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

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'ALL', label: `All (${dispatchShipments.length})` },
            { id: 'VALIDATING', label: `Validating (${dispatchShipments.filter(s => s.status === 'READY' || s.status === 'VALIDATING').length})` },
            { id: 'READY_FOR_PICKUP', label: `Ready for Pickup (${dispatchShipments.filter(s => s.status === 'READY_FOR_PICKUP').length})` },
            { id: 'IN_TRANSIT', label: `In Transit (${dispatchShipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'PICKED_UP' || s.status === 'OUT_FOR_DELIVERY').length})` },
            { id: 'DELIVERED', label: `Delivered (${dispatchShipments.filter(s => s.status === 'DELIVERED').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                border: '1px solid',
                borderColor: activeTab === tab.id ? '#7AA7C7' : '#CBD5E1',
                backgroundColor: activeTab === tab.id ? '#7AA7C7' : '#FFFFFF',
                color: activeTab === tab.id ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Shipments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredShipments.length === 0 ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1'
            }}
          >
            <Truck size={32} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ margin: 0, fontSize: '15px', color: '#475569' }}>No consignments found</h4>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#94A3B8' }}>
              Adjust search or filter pills.
            </p>
          </div>
        ) : (
          filteredShipments.map(shipment => {
            const releaseCheck = validateShipmentRelease({
              shipment,
              packages: dispatchPackages,
              userCapabilities: session?.capabilities || []
            });

            const allocatedCount = (shipment.allocatedPackageIds || []).length;
            const validatedCount = (shipment.validatedPackages || []).length;
            const isReleased = shipment.status === SHIPMENT_STATUSES.READY_FOR_PICKUP ||
              shipment.status === SHIPMENT_STATUSES.PICKED_UP ||
              shipment.status === SHIPMENT_STATUSES.IN_TRANSIT ||
              shipment.status === SHIPMENT_STATUSES.DELIVERED;

            return (
              <div
                key={shipment.id}
                style={{
                  padding: '18px',
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
                      <strong style={{ fontSize: '16px', color: '#34261B' }}>{shipment.id}</strong>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: 600,
                          backgroundColor: shipment.status === 'DELIVERED' ? '#EBF7EE' : shipment.status === 'READY_FOR_PICKUP' ? '#EFF6FA' : '#FFF9EF',
                          color: shipment.status === 'DELIVERED' ? '#2E7D32' : shipment.status === 'READY_FOR_PICKUP' ? '#0369A1' : '#B45309'
                        }}
                      >
                        {SHIPMENT_STATUS_LABELS[shipment.status] || shipment.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                      {shipment.destination}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      {shipment.destinationAddress}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Carrier Service</div>
                    <strong style={{ fontSize: '13px', color: '#34261B' }}>{shipment.carrier}</strong>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>ETA: {shipment.expectedDelivery}</div>
                  </div>
                </div>

                {/* Progress Bar for QR Authentication (§ 17, 21: Every package must independently pass) */}
                <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      Physical QR Verification: {validatedCount} of {allocatedCount} Packages
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: validatedCount === allocatedCount && allocatedCount > 0 ? '#2E7D32' : '#B45309' }}>
                      {validatedCount === allocatedCount && allocatedCount > 0 ? '✓ Ready to Release' : `${allocatedCount - validatedCount} Pending`}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${allocatedCount > 0 ? (validatedCount / allocatedCount) * 100 : 0}%`,
                        height: '100%',
                        backgroundColor: validatedCount === allocatedCount && allocatedCount > 0 ? '#2E7D32' : '#D99A24',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Allocated Packages Chips */}
                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                    Allocated Package Units:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(shipment.allocatedPackageIds || []).map(pid => {
                      const isValidated = (shipment.validatedPackages || []).some(vp => vp.packageId === pid);
                      return (
                        <div
                          key={pid}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: isValidated ? '#EBF7EE' : '#FFF9EF',
                            border: isValidated ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                            fontSize: '11.5px'
                          }}
                        >
                          {isValidated ? (
                            <CheckCircle2 size={12} color="#2E7D32" />
                          ) : (
                            <Clock size={12} color="#B45309" />
                          )}
                          <strong style={{ color: '#334155' }}>{pid}</strong>
                          {!isReleased && !isValidated && (
                            <button
                              type="button"
                              onClick={() => handleOpenScannerForShipment(shipment, pid)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0 2px',
                                color: '#0369A1',
                                fontSize: '11px',
                                textDecoration: 'underline'
                              }}
                            >
                              Scan
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Release Checklist Alert (§ 21, 22) */}
                {!isReleased && (
                  <div
                    data-test="release-guard-box"
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: releaseCheck.isEligible ? '#EBF7EE' : '#FFF9EF',
                      border: releaseCheck.isEligible ? '1px solid #C8E6C9' : '1px solid #FCD34D',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: releaseCheck.isEligible ? '#2E7D32' : '#B45309' }}>
                      {releaseCheck.isEligible ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                      <span>
                        {releaseCheck.isEligible ? 'Final Release Checklist Complete' : 'Shipment Release Guard Active'}
                      </span>
                    </div>
                    {!releaseCheck.isEligible && (
                      <div style={{ marginTop: '4px', color: '#64748B' }}>
                        {releaseCheck.errors[0]}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {!isReleased && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenScannerForShipment(shipment)}
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        <QrCode size={13} style={{ marginRight: '4px' }} />
                        <span>Scan Packages</span>
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Release Button (Guard enforces checklist) */}
                    {!isReleased && (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={!releaseCheck.isEligible}
                        onClick={() => handleReleaseShipment(shipment)}
                        style={{
                          fontSize: '12px',
                          padding: '6px 14px',
                          backgroundColor: releaseCheck.isEligible ? '#2E7D32' : '#94A3B8',
                          borderColor: releaseCheck.isEligible ? '#2E7D32' : '#94A3B8',
                          cursor: releaseCheck.isEligible ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <ShieldCheck size={14} style={{ marginRight: '4px' }} />
                        <span>Release Shipment</span>
                      </button>
                    )}

                    {/* Operational Lifecycle Progress for Released Shipments */}
                    {shipment.status === SHIPMENT_STATUSES.READY_FOR_PICKUP && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => updateShipmentStatus({ shipmentId: shipment.id, targetStatus: SHIPMENT_STATUSES.IN_TRANSIT, notes: 'Carrier picked up pallet.' })}
                        style={{ fontSize: '12px', padding: '5px 12px', backgroundColor: '#0369A1', borderColor: '#0369A1' }}
                      >
                        <Truck size={13} style={{ marginRight: '4px' }} />
                        <span>Mark Picked Up / In Transit</span>
                      </button>
                    )}

                    {shipment.status === SHIPMENT_STATUSES.IN_TRANSIT && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => updateShipmentStatus({ shipmentId: shipment.id, targetStatus: SHIPMENT_STATUSES.OUT_FOR_DELIVERY, notes: 'Vehicle arrived in neighborhood.' })}
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        <span>Mark Out for Delivery</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <CreateShipmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <DispatchQrScannerModal
        isOpen={Boolean(scanningShipment)}
        onClose={() => setScanningShipment(null)}
        activeShipmentId={scanningShipment?.id}
        targetPackageId={scanningPackageId}
      />
    </div>
  );
};
