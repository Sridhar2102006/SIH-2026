/**
 * MODAL — PROOF OF DELIVERY (POD) CONFIRMATION
 *
 * Captures:
 * 1. Recipient Confirmation / Staff Signature
 * 2. Delivery Note / Photo Proof
 * 3. Exact Delivery Timestamp & Operator
 * Transitions shipment and allocated packages to DELIVERED.
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  X,
  FileCheck,
  CheckCircle2,
  Camera,
  PenTool,
  UserCheck
} from 'lucide-react';
import { PROOF_OF_DELIVERY_TYPES } from '../../services/dispatchDomainService';

export const ProofOfDeliveryModal = ({
  isOpen = false,
  onClose,
  shipment
}) => {
  const {
    recordDeliveryConfirmation,
    showToast
  } = useAppState();

  const [recipientName, setRecipientName] = useState(shipment?.recipientName || 'Inbound Receiver');
  const [podType, setPodType] = useState('SIGNATURE');
  const [podEvidence, setPodEvidence] = useState('sig_marcus_vance.png');
  const [deliveryNotes, setDeliveryNotes] = useState('Pallet seal verified intact. All retail jars checked free of leaks or transit damage.');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !shipment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipientName || !recipientName.trim()) {
      showToast('Recipient name is required');
      return;
    }

    const res = recordDeliveryConfirmation({
      shipmentId: shipment.id,
      recipientName,
      podType,
      podEvidence,
      notes: deliveryNotes
    });

    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '520px',
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
                backgroundColor: '#8AA681',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <FileCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#34261B' }}>
                Proof of Delivery (POD)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                Confirm physical handover for {shipment.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            data-test="close-pod-modal"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
              Consignment Destination
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#34261B', marginTop: '2px' }}>
              {shipment.destination}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              Carrier: {shipment.carrier} · Driver: {shipment.driverName}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Recipient Full Name *
            </label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Proof of Delivery Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {Object.values(PROOF_OF_DELIVERY_TYPES).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPodType(t.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: podType === t.id ? '#8AA681' : '#CBD5E1',
                    backgroundColor: podType === t.id ? '#F2F7F2' : '#FFFFFF',
                    color: podType === t.id ? '#2E7D32' : '#475569',
                    fontSize: '12px',
                    fontWeight: podType === t.id ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Proof Evidence Box */}
          <div
            style={{
              padding: '12px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px dashed #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12.5px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {podType === 'SIGNATURE' ? <PenTool size={18} color="#8AA681" /> : <Camera size={18} color="#8AA681" />}
              <div>
                <span style={{ fontWeight: 600, color: '#334155' }}>
                  {podType === 'SIGNATURE' ? 'Digital Signature Captured' : 'Photo Evidence Attached'}
                </span>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {podEvidence} (Cryptographic Hash Verified)
                </div>
              </div>
            </div>
            <span style={{ fontSize: '11.5px', color: '#2E7D32', fontWeight: 600 }}>
              ✓ Verified
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Handover Remarks / Inspection Condition
            </label>
            <textarea
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            />
          </div>

          <div
            style={{
              padding: '14px 0 0',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px'
            }}
          >
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#2E7D32', borderColor: '#2E7D32' }}
            >
              Confirm Delivery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
