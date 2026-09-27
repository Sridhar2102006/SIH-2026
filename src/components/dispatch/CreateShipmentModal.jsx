/**
 * MODAL — CREATE NEW DISPATCH SHIPMENT
 *
 * Generates unique server-generated shipment identifier SHP-YYYY-XXXXX
 * Allocates available packages, captures carrier and logistics metadata.
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  X,
  Truck,
  Package,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PACKAGE_STATUSES } from '../../services/dispatchDomainService';

export const CreateShipmentModal = ({
  isOpen = false,
  onClose,
  initialPackageId = null
}) => {
  const {
    dispatchPackages,
    createDispatchShipment,
    showToast
  } = useAppState();

  const [destination, setDestination] = useState('Apex Organic Wholesalers · Hub B');
  const [destinationAddress, setDestinationAddress] = useState('742 Evergreen Logistics Park, Bay 14, Seattle, WA');
  const [recipientName, setRecipientName] = useState('Apex Inbound Receiving Team');
  const [recipientContact, setRecipientContact] = useState('inbound@apexorganics.example · +1 (555) 234-8901');
  const [carrier, setCarrier] = useState('Cascade Cold Logistics');
  const [transportMethod, setTransportMethod] = useState('Refrigerated Courier Van (18°C Controlled)');
  const [driverName, setDriverName] = useState('Liam Carter');
  const [driverPhone, setDriverPhone] = useState('+1 (555) 345-6789');
  const [vehiclePlate, setVehiclePlate] = useState('WA-HC-9412');
  const [plannedPickup, setPlannedPickup] = useState('Today · 02:30 PM');
  const [expectedDelivery, setExpectedDelivery] = useState('Today · 06:00 PM');
  const [remarks, setRemarks] = useState('Maintain strict 16-20°C ambient transport temperature. Pallet seal checked.');
  
  // Available packages for allocation
  const availablePackages = dispatchPackages.filter(p =>
    p.status === PACKAGE_STATUSES.READY_FOR_DISPATCH ||
    (initialPackageId && p.packageId === initialPackageId)
  );

  const [selectedPackageIds, setSelectedPackageIds] = useState(
    initialPackageId ? [initialPackageId] : (availablePackages.slice(0, 2).map(p => p.packageId))
  );

  if (!isOpen) return null;

  const togglePackageSelection = (pkgId) => {
    if (selectedPackageIds.includes(pkgId)) {
      setSelectedPackageIds(selectedPackageIds.filter(id => id !== pkgId));
    } else {
      setSelectedPackageIds([...selectedPackageIds, pkgId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destination || !destination.trim()) {
      showToast('Destination is required');
      return;
    }

    const res = createDispatchShipment({
      destination,
      destinationAddress,
      recipientName,
      recipientContact,
      carrier,
      transportMethod,
      driverName,
      driverPhone,
      vehiclePlate,
      plannedPickup,
      expectedDelivery,
      remarks,
      packageIds: selectedPackageIds
    });

    if (res.success) {
      onClose();
    }
  };

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
          maxWidth: '560px',
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
                backgroundColor: '#7AA7C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Truck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#34261B' }}>
                Create Dispatch Consignment
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                Server generates unique immutable shipment ID (SHP-YYYY-XXXXX)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            data-test="close-create-shipment"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Destination & Recipient */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Destination Wholesaler / Retail Hub *
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Delivery Address
              </label>
              <input
                type="text"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Recipient Contact Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Recipient Phone / Email
                </label>
                <input
                  type="text"
                  value={recipientContact}
                  onChange={(e) => setRecipientContact(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Carrier & Transport */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Carrier / Transport Service
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  <option value="Cascade Cold Logistics">Cascade Cold Logistics</option>
                  <option value="Pacific Artisan Express">Pacific Artisan Express</option>
                  <option value="Direct HoneyChain Van #03">Direct HoneyChain Van #03</option>
                  <option value="Customer Scheduled Pickup">Customer Scheduled Pickup</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Transport Method
                </label>
                <input
                  type="text"
                  value={transportMethod}
                  onChange={(e) => setTransportMethod(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Schedule */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Planned Carrier Pickup
                </label>
                <input
                  type="text"
                  value={plannedPickup}
                  onChange={(e) => setPlannedPickup(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Expected Delivery
                </label>
                <input
                  type="text"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Package Allocation Selection (§ 17, 51) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                  Allocate Packages to this Consignment ({selectedPackageIds.length} Selected)
                </label>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Every package must be independently QR-validated
                </span>
              </div>

              <div
                style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  backgroundColor: '#F8FAFC'
                }}
              >
                {availablePackages.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center', padding: '12px' }}>
                    No available ready packages.
                  </div>
                ) : (
                  availablePackages.map(p => {
                    const isSelected = selectedPackageIds.includes(p.packageId);
                    return (
                      <div
                        key={p.packageId}
                        onClick={() => togglePackageSelection(p.packageId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                          border: isSelected ? '1px solid #93C5FD' : '1px solid #E2E8F0',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            style={{ cursor: 'pointer' }}
                          />
                          <div>
                            <strong style={{ fontSize: '13px', color: '#34261B' }}>{p.packageId}</strong>
                            <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '6px' }}>
                              {p.productName} ({p.unitDisplay})
                            </span>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', color: '#0369A1', fontWeight: 600 }}>
                          Batch: {p.batchNumber}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Transport Manifest Remarks / Handling Instructions
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#F8FAFC',
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
              style={{ backgroundColor: '#D99A24', borderColor: '#D99A24' }}
            >
              Create Consignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
