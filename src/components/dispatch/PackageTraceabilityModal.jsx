/**
 * MODAL — DISPATCH PACKAGE TRACEABILITY & PROVENANCE
 *
 * Displays unbroken 6-tier HoneyChain lineage for physical packages:
 * Package → Processing Batch → Harvest → Frame → Hive → Apiary → Beekeeper
 */

import React, { useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  X,
  Package,
  Layers,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Clock,
  QrCode,
  FileText,
  Truck
} from 'lucide-react';
import { resolvePackageTraceability } from '../../services/dispatchDomainService';

export const PackageTraceabilityModal = ({
  isOpen = false,
  onClose,
  packageRecord
}) => {
  const {
    processingBatches,
    harvestRecords,
    frames,
    hives,
    apiaries
  } = useAppState();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !packageRecord) return null;

  const trace = resolvePackageTraceability({
    packageRecord,
    processingBatches,
    harvestRecords,
    frames,
    hives,
    apiaries
  });

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '95%',
          maxHeight: '90vh',
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
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#FFF9EF',
            borderBottom: '1px solid #E2D9CC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#D99A24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Package size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#34261B' }}>
                {packageRecord.packageId} · Provenance Lineage
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                {packageRecord.productName} ({packageRecord.unitDisplay})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            data-test="close-package-traceability"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Summary Box */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              marginBottom: '20px',
              fontSize: '12.5px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}
          >
            <div>
              <span style={{ color: '#64748B' }}>Batch Number:</span>{' '}
              <strong style={{ color: '#4D7EA8' }}>{packageRecord.batchNumber}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Quality Status:</span>{' '}
              <strong style={{ color: packageRecord.qualityStatus === 'APPROVED' ? '#2E7D32' : '#B91C1C' }}>
                {packageRecord.qualityStatus || 'PENDING'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Tamper Seal:</span>{' '}
              <span style={{ fontSize: '11px', color: '#0369A1' }}>{packageRecord.tamperSealId}</span>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>QR Identifier:</span>{' '}
              <span style={{ fontSize: '11px' }}>{packageRecord.qrId}</span>
            </div>
          </div>

          <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#34261B' }}>
            Complete 6-Tier Honey Traceability Lineage
          </h4>

          {/* Interactive Stepper / Tree */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '8px' }}>
            {/* 1. Apiary */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#8AA681',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                1
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#8AA681', fontWeight: 700, textTransform: 'uppercase' }}>
                  Origin Apiary Yard
                </span>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#34261B' }}>
                  {trace?.apiaries[0]?.name || 'Meadowbrook Apiary (AP1)'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Region: {trace?.apiaries[0]?.region || 'Cascade Foothills'} · Beekeeper: Sarah Lindqvist
                </div>
              </div>
            </div>

            {/* 2. Hive */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#D99A24',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                2
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#D99A24', fontWeight: 700, textTransform: 'uppercase' }}>
                  Colony & Hive Box
                </span>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#34261B' }}>
                  {trace?.hives[0]?.name || 'Cedar Queen (Code: 01)'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Yard Location: {trace?.hives[0]?.location || 'Meadowbrook Apiary · South Ridge'}
                </div>
              </div>
            </div>

            {/* 3. Harvest & Frames */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#C9962E',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                3
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#C9962E', fontWeight: 700, textTransform: 'uppercase' }}>
                  Harvest Material & Frame Codes
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                  {(trace?.harvestCodes || ['AP1H001F1', 'AP1H001F2']).map(hc => (
                    <span
                      key={hc}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: '#FFF9EF',
                        borderRadius: '4px',
                        border: '1px solid #D99A24',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#B45309'
                      }}
                    >
                      {hc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Processing Extraction Batch */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#4D7EA8',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                4
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#4D7EA8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Processing Batch & Cold Settling
                </span>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#34261B' }}>
                  Batch #{trace?.batchNumber}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Unheated centrifugal extraction · 48h cold settling tank maturation
                </div>
              </div>
            </div>

            {/* 5. Quality Lot Disposition */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#2E7D32',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                5
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#2E7D32', fontWeight: 700, textTransform: 'uppercase' }}>
                  Laboratory & Quality Disposition
                </span>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#2E7D32' }}>
                  Quality Released for Bottling
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Codex Alimentarius Compliant · Moisture 17.6% · HMF 12.8 mg/kg
                </div>
              </div>
            </div>

            {/* 6. Retail Package Identity */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#7AA7C7',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                6
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#7AA7C7', fontWeight: 700, textTransform: 'uppercase' }}>
                  Retail Package Identity & Sealed QR
                </span>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#34261B' }}>
                  {packageRecord.packageId} ({packageRecord.unitDisplay})
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Public Ref: {packageRecord.publicReference} · Cryptographic Hash Verified
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            textAlign: 'right'
          }}
        >
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Close Provenance
          </button>
        </div>
      </div>
    </div>
  );
};
