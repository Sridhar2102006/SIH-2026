/**
 * SCREEN — MASTER DISPATCH & DISTRIBUTOR HOME DASHBOARD
 *
 * Core Responsibility: "What needs to leave today?"
 *
 * Visual Palette:
 * Pure Honey (#D99A24) · Light Blue (#7AA7C7) · Light Green (#8AA681) · Golden (#C9962E) · Warm Cream (#FFF9EF) · Deep Cocoa (#34261B)
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Package,
  QrCode,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus,
  Compass,
  FileCheck
} from 'lucide-react';
import { DispatchQrScannerModal } from './DispatchQrScannerModal';
import { CreateShipmentModal } from './CreateShipmentModal';
import {
  PACKAGE_STATUSES,
  SHIPMENT_STATUSES,
  SHIPMENT_STATUS_LABELS
} from '../../services/dispatchDomainService';

export const DispatchHome = ({
  onNavigateToPackages,
  onNavigateToShipments,
  onNavigateToTracking
}) => {
  const {
    session,
    dispatchPackages,
    dispatchShipments,
    dispatchAuditLog,
    showToast
  } = useAppState();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCreateShipmentOpen, setIsCreateShipmentOpen] = useState(false);

  // Operational Metrics
  const readyPackages = dispatchPackages.filter(p =>
    p.status === PACKAGE_STATUSES.READY_FOR_DISPATCH || p.status === PACKAGE_STATUSES.ALLOCATED
  );
  const qrValidatedPackages = readyPackages.filter(p => p.isQrValidated);
  const activeShipments = dispatchShipments.filter(s =>
    s.status !== SHIPMENT_STATUSES.DELIVERED && s.status !== SHIPMENT_STATUSES.CANCELLED
  );
  const inTransitShipments = dispatchShipments.filter(s =>
    s.status === SHIPMENT_STATUSES.IN_TRANSIT || s.status === SHIPMENT_STATUSES.OUT_FOR_DELIVERY
  );
  const deliveryExceptions = dispatchShipments.filter(s =>
    s.status === SHIPMENT_STATUSES.DELIVERY_EXCEPTION || (s.exceptions && s.exceptions.length > 0)
  );

  return (
    <div className="dispatch-home-container" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            Fulfillment & Physical Release
          </span>
          <span style={{ fontSize: '12px', color: '#8AA681', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#8AA681' }} />
            Bay 3 Active · Cold Staging (18°C)
          </span>
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#34261B', margin: '6px 0 4px' }}>
          Good morning, {session?.name || session?.operator || 'Jordan Hayes'}
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px', lineHeight: 1.4 }}>
          Final Package Verification · Physical QR Authentication · Shipment Staging & Delivery Tracking
        </p>

        {/* Primary Action Row */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => setIsScannerOpen(true)}
            style={{
              backgroundColor: '#D99A24',
              borderColor: '#D99A24',
              flex: 1,
              minWidth: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px'
            }}
          >
            <QrCode size={18} />
            <span>Scan Package QR</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setIsCreateShipmentOpen(true)}
            style={{
              flex: 1,
              minWidth: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderColor: '#7AA7C7',
              color: '#0369A1'
            }}
          >
            <Plus size={18} />
            <span>Create Shipment</span>
          </button>
        </div>
      </div>

      {/* 2. Operational Hierarchy — "What Needs to Leave Today?" */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#34261B', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Compass size={17} color="#D99A24" />
          <span>Fulfillment Operations Overview</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {/* Card 1: Ready to Dispatch */}
          <div
            onClick={onNavigateToPackages}
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Ready to Dispatch</span>
              <Package size={18} color="#D99A24" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#34261B', margin: '8px 0 2px' }}>
              {readyPackages.length}
            </div>
            <div style={{ fontSize: '11.5px', color: '#B45309' }}>
              {readyPackages.filter(p => p.status === 'READY_FOR_DISPATCH').length} unassigned
            </div>
          </div>

          {/* Card 2: QR Validation Pending */}
          <div
            onClick={onNavigateToPackages}
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>QR Validation</span>
              <QrCode size={18} color="#7AA7C7" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#34261B', margin: '8px 0 2px' }}>
              {qrValidatedPackages.length} / {readyPackages.length}
            </div>
            <div style={{ fontSize: '11.5px', color: readyPackages.length - qrValidatedPackages.length > 0 ? '#B91C1C' : '#2E7D32' }}>
              {readyPackages.length - qrValidatedPackages.length} validation pending
            </div>
          </div>

          {/* Card 3: In Transit */}
          <div
            onClick={onNavigateToTracking}
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>In Transit</span>
              <Truck size={18} color="#8AA681" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#34261B', margin: '8px 0 2px' }}>
              {inTransitShipments.length}
            </div>
            <div style={{ fontSize: '11.5px', color: '#2E7D32' }}>
              Active on delivery route
            </div>
          </div>

          {/* Card 4: Delivery Issues */}
          <div
            onClick={onNavigateToTracking}
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: deliveryExceptions.length > 0 ? '#FDF2F2' : '#FFFFFF',
              border: deliveryExceptions.length > 0 ? '1px solid #FCA5A5' : '1px solid #E2E8F0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: deliveryExceptions.length > 0 ? '#B91C1C' : '#64748B' }}>
                Delivery Issues
              </span>
              <AlertTriangle size={18} color={deliveryExceptions.length > 0 ? '#DC2626' : '#94A3B8'} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: deliveryExceptions.length > 0 ? '#B91C1C' : '#34261B', margin: '8px 0 2px' }}>
              {deliveryExceptions.length}
            </div>
            <div style={{ fontSize: '11.5px', color: deliveryExceptions.length > 0 ? '#B91C1C' : '#64748B' }}>
              {deliveryExceptions.length > 0 ? 'Action required' : 'No active alerts'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Today's Scheduled Shipments */}
      <div
        className="card"
        style={{
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '18px',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#34261B' }}>
              Today's Shipments ({dispatchShipments.length})
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Physical manifests scheduled for dispatch & transport
            </span>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onNavigateToShipments}
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            <span>View All</span>
            <ArrowRight size={13} style={{ marginLeft: '4px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dispatchShipments.slice(0, 3).map(shipment => {
            const isReleased = shipment.status === SHIPMENT_STATUSES.READY_FOR_PICKUP ||
              shipment.status === SHIPMENT_STATUSES.IN_TRANSIT ||
              shipment.status === SHIPMENT_STATUSES.DELIVERED;
            const validatedCount = (shipment.validatedPackages || []).length;
            const totalCount = (shipment.allocatedPackageIds || []).length;

            return (
              <div
                key={shipment.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '14px', color: '#34261B' }}>{shipment.id}</strong>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        backgroundColor: shipment.status === 'DELIVERED' ? '#EBF7EE' : shipment.status === 'DELIVERY_EXCEPTION' ? '#FDF2F2' : '#EFF6FA',
                        color: shipment.status === 'DELIVERED' ? '#2E7D32' : shipment.status === 'DELIVERY_EXCEPTION' ? '#B91C1C' : '#0369A1'
                      }}
                    >
                      {SHIPMENT_STATUS_LABELS[shipment.status] || shipment.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#334155', marginTop: '2px' }}>
                    {shipment.destination}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                    Carrier: {shipment.carrier} · ETA: {shipment.expectedDelivery}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: validatedCount === totalCount && totalCount > 0 ? '#2E7D32' : '#B45309' }}>
                    {validatedCount} / {totalCount} QR Validated
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={onNavigateToShipments}
                    style={{ fontSize: '11px', padding: '4px 8px', marginTop: '4px' }}
                  >
                    Open Manifest
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Dispatch Audit Activity */}
      <div
        className="card"
        style={{
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '18px',
          backgroundColor: '#FFFFFF'
        }}
      >
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#34261B' }}>
          Recent Dispatch Audit Log
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {dispatchAuditLog.slice(0, 3).map(log => (
            <div
              key={log.id}
              style={{
                fontSize: '12px',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong style={{ color: '#0369A1' }}>{log.action}</strong>
                <span style={{ color: '#64748B', marginLeft: '6px' }}>{log.details}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Modals */}
      <DispatchQrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <CreateShipmentModal
        isOpen={isCreateShipmentOpen}
        onClose={() => setIsCreateShipmentOpen(false)}
      />
    </div>
  );
};
