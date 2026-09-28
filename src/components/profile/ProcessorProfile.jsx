import React, { useState } from 'react';
import { 
  Factory, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Wrench, 
  Sliders, 
  FileText, 
  Check, 
  Plus, 
  ExternalLink, 
  Layers, 
  Sparkles,
  Thermometer,
  Package,
  Award
} from 'lucide-react';
import { ProcessorProfileService } from '../../services/processorProfileService';

function formatLocation(loc, fallback = 'Coimbatore Industrial Cluster, TN') {
  if (!loc) return fallback;
  if (typeof loc === 'string') return loc;
  if (typeof loc === 'object') {
    const parts = [loc.locality, loc.subdistrict, loc.district, loc.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : (loc.district || loc.state || fallback);
  }
  return String(loc);
}

export const ProcessorProfile = ({
  processingBatches = [],
  session,
  onNavigateTo,
  onSaveSettings
}) => {
  const activeOrg = ProcessorProfileService.getActiveOrganization();
  const activeFacility = ProcessorProfileService.getActiveFacility();
  const equipmentList = ProcessorProfileService.getEquipment();
  const activeSOP = ProcessorProfileService.getActiveSOP();

  const [thermalLimit, setThermalLimit] = useState(
    session?.workspaceSettings?.PROCESSOR?.thermalLimit || '45'
  );
  const [batchCapKg, setBatchCapKg] = useState(
    session?.workspaceSettings?.PROCESSOR?.batchCapKg || '500'
  );
  const [unitSystem, setUnitSystem] = useState(
    session?.workspaceSettings?.PROCESSOR?.unitSystem || 'KG'
  );
  const [autoTamperSeal, setAutoTamperSeal] = useState(
    session?.workspaceSettings?.PROCESSOR?.autoTamperSeal ?? true
  );
  const [isSaved, setIsSaved] = useState(false);

  // Compute live batch metrics
  const activeBatchesCount = processingBatches.filter(
    b => b.status === 'INTAKE_ACCEPTED' || b.status === 'PROCESSING_ACTIVE' || b.status === 'STEP_RECORDED'
  ).length;
  const completedBatchesCount = processingBatches.filter(b => b.status === 'PROCESSING_COMPLETED').length;
  const onHoldBatchesCount = processingBatches.filter(b => b.status === 'BATCH_ON_HOLD').length;

  const handleSaveSettings = () => {
    if (onSaveSettings) {
      onSaveSettings('PROCESSOR', {
        thermalLimit,
        batchCapKg,
        unitSystem,
        autoTamperSeal
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="processor-profile-workspace" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Contextual Workspace Readiness Prompt (§ 16) */}
      <div 
        className="card"
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFF7ED',
          border: '1px solid #FFEDD5',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#FFEDD5',
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Factory size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#7C2D12' }}>
              Your Processing Facility is Operational
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#9A3412' }}>
              {activeFacility?.name || 'Kaveri Facility'} • {activeBatchesCount} active processing batches running.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateTo('intake')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Package size={14} /> Intake Raw Honey
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onNavigateTo('batches')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Layers size={14} /> Manage Batches
          </button>
        </div>
      </div>

      {/* Grid: Facility Identity & Processing Live Batch Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* 1. Facility & Business Identity */}
        <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Building2 size={18} color="#B45309" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Facility & Business Identity</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <span className="supporting-text">Operating Entity</span>
              <strong style={{ color: 'var(--theme-text-primary)' }}>{activeOrg?.name || 'Kaveri Natural Products Ltd.'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <span className="supporting-text">Facility Name</span>
              <strong style={{ color: 'var(--theme-text-primary)' }}>{activeFacility?.name || 'Kaveri Honey Processing Facility'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <span className="supporting-text">Plant Location</span>
              <strong style={{ color: 'var(--theme-text-primary)' }}>{formatLocation(activeFacility?.location)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <span className="supporting-text">Facility Type</span>
              <strong style={{ color: 'var(--theme-text-primary)' }}>Cold Processing & Micro-Filtration Hub</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="supporting-text">Operational Status</span>
              <strong style={{ color: '#15803D' }}>● Active / Level 2 HACCP Compliant</strong>
            </div>
          </div>
        </div>

        {/* 2. Batch Operations Summary */}
        <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#B45309" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Production Floor Summary</h3>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateTo('batches')}
              style={{ padding: '2px 8px', fontSize: '12px' }}
            >
              Floor
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '10px', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#B45309' }}>{activeBatchesCount}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#92400E' }}>Active Batches</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803D' }}>{completedBatchesCount}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#166534' }}>Completed Batches</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#FEE2E2', borderRadius: '10px', border: '1px solid #FECACA' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#B91C1C' }}>{onHoldBatchesCount}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#991B1B' }}>Quarantine / Hold</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1D4ED8' }}>{processingBatches.length}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#1E40AF' }}>Total Recorded</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Processing Profile & Configured SOP */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <FileText size={18} color="#B45309" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Standard Processing Profile & SOP</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '10px', border: '1px solid var(--theme-border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '6px' }}>
              Core Operations & Activities
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span className="badge badge-secondary" style={{ fontSize: '11px' }}>Raw Intake Verification</span>
              <span className="badge badge-secondary" style={{ fontSize: '11px' }}>Cold Settling</span>
              <span className="badge badge-secondary" style={{ fontSize: '11px' }}>Gentle Moisture Reduction</span>
              <span className="badge badge-secondary" style={{ fontSize: '11px' }}>Micro-Filtration (100μm)</span>
              <span className="badge badge-secondary" style={{ fontSize: '11px' }}>Tamper-Evident Packaging</span>
            </div>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '10px', border: '1px solid var(--theme-border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '6px' }}>
              Active Standard Operating Procedure (SOP)
            </div>
            <div style={{ fontSize: '13px', color: 'var(--theme-text-primary)', fontWeight: 500 }}>
              {activeSOP?.name || 'SOP-2026-COLD-EXT-01: Low Temperature Honey Processing'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)', marginTop: '4px' }}>
              Version 2.4 • Maximum Thermal Ceiling: 45.0°C • Retention Time: 48h
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Regulatory Verification & Equipment Registry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* 4. Verification & Regulatory Information (§ 14, § 15) */}
        <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldCheck size={18} color="#16A34A" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Business & Regulatory Verification</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 500 }}>FSSAI Processing License</div>
                <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)' }}>Lic: 10019042000123 (State Manufacturing)</div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', backgroundColor: '#F0FDF4', padding: '3px 8px', borderRadius: '6px' }}>
                ✓ Authorized
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 500 }}>GSTIN Business Registration</div>
                <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)' }}>GSTIN: 33AAACH1234F1Z5</div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', backgroundColor: '#F0FDF4', padding: '3px 8px', borderRadius: '6px' }}>
                ✓ Verified
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>FoSTaC Food Safety Supervisor</div>
                <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)' }}>Cert: FSSAI-FOSTAC-TN-88210</div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', backgroundColor: '#F0FDF4', padding: '3px 8px', borderRadius: '6px' }}>
                ✓ Certified
              </span>
            </div>
          </div>
        </div>

        {/* 5. Processing Equipment Registry */}
        <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wrench size={18} color="#B45309" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Equipment & Machinery</h3>
            </div>
            <span style={{ fontSize: '11px', color: '#15803D', backgroundColor: '#F0FDF4', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
              {equipmentList.length || 3} Machines Calibrated
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {equipmentList.slice(0, 3).map((item, idx) => (
              <div 
                key={item.id || idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: 'var(--theme-surface-hover)',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>
                    Type: {item.type} • Status: {item.status || 'OPERATIONAL'}
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>
                  ● Calibrated
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Processor Workspace Settings */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="#B45309" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Processing Facility Preferences</h3>
          </div>
          {isSaved && (
            <span style={{ fontSize: '12px', color: '#15803D', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Check size={14} /> Facility Preferences Saved
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Maximum Thermal Ceiling (°C)
            </label>
            <input
              type="number"
              className="input-select"
              value={thermalLimit}
              onChange={(e) => setThermalLimit(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>
              Warning triggers if honey temperature exceeds 45°C
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Standard Batch Size Cap
            </label>
            <input
              type="number"
              className="input-select"
              value={batchCapKg}
              onChange={(e) => setBatchCapKg(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>
              Target kilograms per standard production lot
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Batch Weight Unit
            </label>
            <select
              className="input-select"
              value={unitSystem}
              onChange={(e) => setUnitSystem(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
            >
              <option value="KG">Kilograms (kg)</option>
              <option value="TONS">Metric Tons (MT)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Tamper-Evident QR Enforcement
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '38px' }}>
              <input
                type="checkbox"
                id="auto-tamper-check"
                checked={autoTamperSeal}
                onChange={(e) => setAutoTamperSeal(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#B45309', cursor: 'pointer' }}
              />
              <label htmlFor="auto-tamper-check" style={{ fontSize: '13px', cursor: 'pointer' }}>
                Require physical seal ID before step sign-off
              </label>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleSaveSettings}
          >
            Save Facility Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
