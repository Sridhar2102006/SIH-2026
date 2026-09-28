import React, { useState } from 'react';
import { 
  Truck, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Package, 
  Sliders, 
  QrCode, 
  Check, 
  Compass, 
  Sparkles, 
  Navigation, 
  Radio, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export const DistributorProfile = ({
  dispatchPackages = [],
  dispatchShipments = [],
  session,
  onNavigateTo,
  onSaveSettings
}) => {
  const [autoManifest, setAutoManifest] = useState(
    session?.workspaceSettings?.DISTRIBUTOR?.autoManifest ?? true
  );
  const [qrStrictness, setQrStrictness] = useState(
    session?.workspaceSettings?.DISTRIBUTOR?.qrStrictness || 'STRICT'
  );
  const [transportUnit, setTransportUnit] = useState(
    session?.workspaceSettings?.DISTRIBUTOR?.transportUnit || 'PACKAGES'
  );
  const [transitAlerts, setTransitAlerts] = useState(
    session?.workspaceSettings?.DISTRIBUTOR?.transitAlerts ?? true
  );
  const [isSaved, setIsSaved] = useState(false);

  // Compute live dispatch/logistics metrics
  const activeShipmentsCount = dispatchShipments.filter(
    s => s.status !== 'DELIVERED' && s.status !== 'CANCELLED'
  ).length;
  const inTransitCount = dispatchShipments.filter(
    s => s.status === 'IN_TRANSIT' || s.status === 'DISPATCHED'
  ).length;
  const deliveredCount = dispatchShipments.filter(
    s => s.status === 'DELIVERED'
  ).length;
  const packagesInHub = dispatchPackages.length;

  const handleSaveSettings = () => {
    if (onSaveSettings) {
      onSaveSettings('DISTRIBUTOR', {
        autoManifest,
        qrStrictness,
        transportUnit,
        transitAlerts
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="distributor-profile-workspace" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Contextual Workspace Readiness Prompt (§ 16) */}
      <div 
        className="card"
        style={{
          padding: '16px 20px',
          backgroundColor: '#F0F9FF',
          border: '1px solid #BAE6FD',
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
              backgroundColor: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Truck size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#075985' }}>
              Your Distribution Hub is Active
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#0369A1' }}>
              Central Hub • {activeShipmentsCount} active outbound shipments • {packagesInHub} packages ready.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateTo('dispatch')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <QrCode size={14} /> Validate Package QR
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onNavigateTo('shipments')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Truck size={14} /> View Shipments
          </button>
        </div>
      </div>

      {/* Grid: Business Identity & Logistics Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* 1. Distribution Business Identity */}
        <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Building2 size={18} color="#0284C7" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Logistics Business Identity</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <span className="supporting-text">Business Name</span>
              <strong style={{ color: 'var(--theme-text-primary)' }}>HoneyChain Logistics Hub South</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <span className="supporting-text">Business Type</span>
              <strong style={{ color: 'var(--theme-text-primary)' }}>Authorized Regional Distribution Center</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <span className="supporting-text">Operating Region</span>
              <strong style={{ color: 'var(--theme-text-primary)' }}>Tamil Nadu, Kerala & Karnataka</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <span className="supporting-text">Central Hub Address</span>
              <strong style={{ color: 'var(--theme-text-primary)' }}>Warehouse 4B, Logistics Park, Coimbatore</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="supporting-text">Fleet Status</span>
              <strong style={{ color: '#15803D' }}>● 12 Dedicated Temp-Controlled Vans</strong>
            </div>
          </div>
        </div>

        {/* 2. Logistics & Delivery Performance */}
        <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} color="#0284C7" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Logistics & Delivery Pipeline</h3>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateTo('shipments')}
              style={{ padding: '2px 8px', fontSize: '12px' }}
            >
              Shipments
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '12px', backgroundColor: '#F0F9FF', borderRadius: '10px', border: '1px solid #BAE6FD' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0284C7' }}>{activeShipmentsCount}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#0369A1' }}>Active Shipments</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '10px', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#B45309' }}>{inTransitCount}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#92400E' }}>Vehicles In Transit</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803D' }}>{deliveredCount}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#166534' }}>Delivered & Verified</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#FAF5FF', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#7E22CE' }}>{packagesInHub}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#6B21A8' }}>Packages in Hub</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Distribution Profile & Warehouse Specs */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Package size={18} color="#0284C7" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Distribution Profile & Facility Infrastructure</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '10px', border: '1px solid var(--theme-border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '6px' }}>
              Distribution Capabilities
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span className="badge badge-secondary" style={{ fontSize: '11px' }}>Cold-Chain Transit (18-24°C)</span>
              <span className="badge badge-secondary" style={{ fontSize: '11px' }}>Ambient FMCG Courier</span>
              <span className="badge badge-secondary" style={{ fontSize: '11px' }}>Multi-Stop Routing</span>
              <span className="badge badge-secondary" style={{ fontSize: '11px' }}>Cryptographic QR Release</span>
              <span className="badge badge-secondary" style={{ fontSize: '11px' }}>Electronic Proof of Delivery</span>
            </div>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '10px', border: '1px solid var(--theme-border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-text-primary)', marginBottom: '6px' }}>
              Warehouse & Capacity
            </div>
            <div style={{ fontSize: '13px', color: 'var(--theme-text-primary)', fontWeight: 500 }}>
              Capacity: 45 Pallet Positions • Dedicated Climate-Controlled Storage
            </div>
            <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)', marginTop: '4px' }}>
              2 High-Speed Physical QR Scanning Terminals • Realtime Handover Confirmation
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Business Verification & Connected Hardware */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* 4. Verification Details (§ 14, § 15) */}
        <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldCheck size={18} color="#16A34A" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Commercial & Logistics Verification</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Commercial Carrier Permit</div>
                <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)' }}>Permit: TN-COMM-TRANS-9921</div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', backgroundColor: '#F0FDF4', padding: '3px 8px', borderRadius: '6px' }}>
                ✓ Authorized
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 500 }}>GSTIN Registration</div>
                <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)' }}>GSTIN: 33AAACH1234F1Z5</div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', backgroundColor: '#F0FDF4', padding: '3px 8px', borderRadius: '6px' }}>
                ✓ Verified
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>FSSAI Distribution License</div>
                <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)' }}>License: 20021042000889 (Storage & Dist.)</div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', backgroundColor: '#F0FDF4', padding: '3px 8px', borderRadius: '6px' }}>
                ✓ Compliant
              </span>
            </div>
          </div>
        </div>

        {/* 5. Connected Logistics Hardware */}
        <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={18} color="#0284C7" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Connected Logistics Tools</h3>
            </div>
            <span style={{ fontSize: '11px', color: '#15803D', backgroundColor: '#F0FDF4', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
              All Terminals Online
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Bluetooth 2D QR Scanner #01</div>
                <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>Zebra DS2278 • Ready for package release</div>
              </div>
              <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>● Paired</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Fleet Telematics GPS Gateway</div>
                <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>12 Vehicles active • Temperature logging online</div>
              </div>
              <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>● Syncing</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Warehouse Thermal Monitor</div>
                <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>Cold Room: 18.2°C • Humidity: 48% • In Spec</div>
              </div>
              <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>● Normal</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Distributor Workspace Settings */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="#0284C7" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Dispatch & Logistics Preferences</h3>
          </div>
          {isSaved && (
            <span style={{ fontSize: '12px', color: '#15803D', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Check size={14} /> Dispatch Preferences Saved
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              QR Validation Strictness
            </label>
            <select
              className="input-select"
              value={qrStrictness}
              onChange={(e) => setQrStrictness(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
            >
              <option value="STRICT">Strict (Quality approval & tamper seal mandatory)</option>
              <option value="STANDARD">Standard (Release allowed if QA passed)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Shipment Metrics Unit
            </label>
            <select
              className="input-select"
              value={transportUnit}
              onChange={(e) => setTransportUnit(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
            >
              <option value="PACKAGES">Individual Package Units</option>
              <option value="PALLETS">Standard Pallets (600 jars/pallet)</option>
              <option value="KG">Total Weight (kg)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Transit Exception Notifications
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '38px' }}>
              <input
                type="checkbox"
                id="transit-alert-check"
                checked={transitAlerts}
                onChange={(e) => setTransitAlerts(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0284C7', cursor: 'pointer' }}
              />
              <label htmlFor="transit-alert-check" style={{ fontSize: '13px', cursor: 'pointer' }}>
                Alert immediately on delivery delay or rerouting
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Auto-Manifest Generation
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '38px' }}>
              <input
                type="checkbox"
                id="auto-manifest-check"
                checked={autoManifest}
                onChange={(e) => setAutoManifest(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0284C7', cursor: 'pointer' }}
              />
              <label htmlFor="auto-manifest-check" style={{ fontSize: '13px', cursor: 'pointer' }}>
                Generate signed PDF manifest when release passes
              </label>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleSaveSettings}
          >
            Save Dispatch Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
