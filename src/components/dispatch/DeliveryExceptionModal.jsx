/**
 * MODAL — REPORT DELIVERY EXCEPTION
 *
 * Captures:
 * 1. Exception Type (Wrong Address, Recipient Unavailable, Damaged, Transport Issue, etc.)
 * 2. Mandatory Detailed Remarks (Minimum 5 characters)
 * 3. Evidence File / Photo
 * Transitions shipment to DELIVERY_EXCEPTION.
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  X,
  AlertTriangle,
  Camera,
  FileWarning
} from 'lucide-react';
import { DELIVERY_EXCEPTION_TYPES } from '../../services/dispatchDomainService';

export const DeliveryExceptionModal = ({
  isOpen = false,
  onClose,
  shipment
}) => {
  const {
    recordDeliveryException,
    showToast
  } = useAppState();

  const [exceptionType, setExceptionType] = useState('RECIPIENT_UNAVAILABLE');
  const [remarks, setRemarks] = useState('Store closed early for private quarterly inventory. Scheduled re-delivery for tomorrow morning.');
  const [evidence, setEvidence] = useState('storefront_closed_notice.png');

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
    if (!remarks || remarks.trim().length < 5) {
      showToast('Remarks must be at least 5 characters');
      return;
    }

    const res = recordDeliveryException({
      shipmentId: shipment.id,
      exceptionType,
      remarks,
      evidence
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
                backgroundColor: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#34261B' }}>
                Report Delivery Exception
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                Shipment {shipment.id} · {shipment.destination}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            data-test="close-exception-modal"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Exception Category *
            </label>
            <select
              value={exceptionType}
              onChange={(e) => setExceptionType(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            >
              {Object.values(DELIVERY_EXCEPTION_TYPES).map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Detailed Operational Remarks (Min 5 chars) *
            </label>
            <textarea
              required
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="State reason, contact attempt, resolution plan..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            />
          </div>

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
              <Camera size={18} color="#DC2626" />
              <div>
                <span style={{ fontWeight: 600, color: '#334155' }}>
                  Exception Proof Attachment
                </span>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {evidence}
                </div>
              </div>
            </div>
            <span style={{ fontSize: '11.5px', color: '#DC2626', fontWeight: 600 }}>
              Attached
            </span>
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
              style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
            >
              Log Exception
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
