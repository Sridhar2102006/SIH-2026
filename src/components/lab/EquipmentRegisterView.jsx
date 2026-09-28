import React, { useState } from 'react';
import { 
  Wrench, 
  Cpu, 
  ShieldCheck, 
  Plus, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  X,
  Sparkles
} from 'lucide-react';
import { 
  LAB_EQUIPMENT_CATALOG, 
  EQUIPMENT_STATUSES, 
  EQUIPMENT_STATUS_LABELS 
} from '../../services/labDomainService';

export const EquipmentRegisterView = () => {
  const [equipmentList, setEquipmentList] = useState(LAB_EQUIPMENT_CATALOG);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEquip, setNewEquip] = useState({
    name: '',
    type: 'Spectrophotometer',
    serialNumber: '',
    location: 'Analytical Bench 02',
    lastCalibrationDate: '2026-09-20',
    nextCalibrationDate: '2026-10-20',
    calibrationCertificate: 'CAL-2026-NEW',
    status: EQUIPMENT_STATUSES.ACTIVE
  });

  const handleAddEquipment = (e) => {
    e.preventDefault();
    if (!newEquip.name.trim() || !newEquip.serialNumber.trim()) {
      return;
    }
    const item = {
      id: `EQ-AUTO-${Math.floor(100 + Math.random() * 900)}`,
      name: newEquip.name.trim(),
      type: newEquip.type,
      serialNumber: newEquip.serialNumber.trim(),
      status: newEquip.status,
      lastCalibrationDate: newEquip.lastCalibrationDate,
      nextCalibrationDate: newEquip.nextCalibrationDate,
      calibrationCertificate: newEquip.calibrationCertificate,
      location: newEquip.location,
      operatorEligibility: ['Dr. Elena Vance', 'Marcus K.']
    };
    setEquipmentList(prev => [...prev, item]);
    setIsAddModalOpen(false);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setEquipmentList(prev => prev.map(eq => eq.id === id ? { ...eq, status: newStatus } : eq));
  };

  return (
    <div className="equipment-register-workspace" style={{ maxWidth: '1080px', margin: '0 auto', padding: '16px', fontFamily: "'Inter', sans-serif" }}>
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
            <Cpu size={22} color="#1D4ED8" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
              Calibrated Scientific Equipment Register
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>
            ISO/IEC 17025 Metrological Traceability & Equipment Calibration Lifecycle (§13, §14)
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddModalOpen(true)}
          style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} /> Add Scientific Instrument
        </button>
      </div>

      {/* Equipment Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {equipmentList.map(eq => {
          const isDue = eq.status === EQUIPMENT_STATUSES.CALIBRATION_DUE;
          const isOut = eq.status === EQUIPMENT_STATUSES.OUT_OF_SERVICE;

          return (
            <div
              key={eq.id}
              style={{
                padding: '18px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: isDue ? '2px solid #F59E0B' : (isOut ? '2px solid #DC2626' : '1px solid #E2E8F0'),
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#1D4ED8', fontWeight: 700 }}>
                      {eq.id}
                    </span>
                    <h4 style={{ margin: '2px 0 0 0', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                      {eq.name}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Type: {eq.type} • Serial: {eq.serialNumber}
                    </div>
                  </div>

                  <span 
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: isDue ? '#FFFBEB' : (isOut ? '#FEF2F2' : '#F0FDF4'),
                      color: isDue ? '#B45309' : (isOut ? '#B91C1C' : '#15803D'),
                      border: isDue ? '1px solid #FDE68A' : (isOut ? '1px solid #FECACA' : '1px solid #BBF7D0')
                    }}
                  >
                    {EQUIPMENT_STATUS_LABELS[eq.status] || eq.status}
                  </span>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#475569', backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
                  <div><strong>Location:</strong> {eq.location}</div>
                  <div><strong>Calibration Certificate:</strong> {eq.calibrationCertificate}</div>
                  <div><strong>Last Calibrated:</strong> {eq.lastCalibrationDate}</div>
                  <div><strong>Next Due Date:</strong> <span style={{ color: isDue ? '#B45309' : '#0F172A', fontWeight: isDue ? 700 : 400 }}>{eq.nextCalibrationDate}</span></div>
                </div>
              </div>

              {/* Status Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Eligible: {eq.operatorEligibility?.join(', ') || 'Authorized Staff'}
                </span>

                <select
                  value={eq.status}
                  onChange={(e) => handleUpdateStatus(eq.id, e.target.value)}
                  style={{ fontSize: '11px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                >
                  <option value={EQUIPMENT_STATUSES.ACTIVE}>ACTIVE</option>
                  <option value={EQUIPMENT_STATUSES.CALIBRATION_DUE}>CALIBRATION_DUE</option>
                  <option value={EQUIPMENT_STATUSES.UNDER_CALIBRATION}>UNDER_CALIBRATION</option>
                  <option value={EQUIPMENT_STATUSES.OUT_OF_SERVICE}>OUT_OF_SERVICE</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Equipment Modal */}
      {isAddModalOpen && (
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
          onClick={() => setIsAddModalOpen(false)}
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
                Register Scientific Instrument
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsAddModalOpen(false)}
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Instrument Name & Model
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Mettler Toledo FiveEasy pH/Conductivity Meter"
                  value={newEquip.name}
                  onChange={(e) => setNewEquip({ ...newEquip, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Type
                  </label>
                  <select
                    value={newEquip.type}
                    onChange={(e) => setNewEquip({ ...newEquip, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Refractometer">Refractometer</option>
                    <option value="Spectrophotometer">Spectrophotometer</option>
                    <option value="Conductivity Meter">Conductivity Meter</option>
                    <option value="Microscope">Microscope</option>
                    <option value="EA-IRMS">EA-IRMS</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Serial Number
                  </label>
                  <input 
                    type="text"
                    placeholder="SN-MT-99410"
                    value={newEquip.serialNumber}
                    onChange={(e) => setNewEquip({ ...newEquip, serialNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Last Calibration
                  </label>
                  <input 
                    type="date"
                    value={newEquip.lastCalibrationDate}
                    onChange={(e) => setNewEquip({ ...newEquip, lastCalibrationDate: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Next Due Date
                  </label>
                  <input 
                    type="date"
                    value={newEquip.nextCalibrationDate}
                    onChange={(e) => setNewEquip({ ...newEquip, nextCalibrationDate: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' }}
                >
                  Register Instrument
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
