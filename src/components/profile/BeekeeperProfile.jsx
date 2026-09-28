import React, { useState } from 'react';
import { 
  Layers, 
  MapPin, 
  ShieldCheck, 
  Cpu, 
  Sliders, 
  Calendar, 
  Bell, 
  Plus, 
  ExternalLink, 
  Activity, 
  Camera, 
  Wifi, 
  Check, 
  Compass, 
  Sparkles,
  Droplet,
  ClipboardCheck,
  Building2,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

export const BeekeeperProfile = ({
  apiary,
  apiaries = [],
  hives = [],
  devices = [],
  session,
  onNavigateTo,
  onOpenAddApiary,
  onSaveSettings
}) => {
  const { setApiary, deleteApiary, showToast } = useAppState();
  const [inspectionInterval, setInspectionInterval] = useState(
    session?.workspaceSettings?.BEEKEEPER?.inspectionInterval || '7'
  );
  const [beeSpecies, setBeeSpecies] = useState(
    session?.workspaceSettings?.BEEKEEPER?.beeSpecies || 'Apis cerana indica (Indian Honey Bee)'
  );
  const [aiAssistEnabled, setAiAssistEnabled] = useState(
    session?.workspaceSettings?.BEEKEEPER?.aiAssistEnabled ?? true
  );
  const [telemetrySyncMins, setTelemetrySyncMins] = useState(
    session?.workspaceSettings?.BEEKEEPER?.telemetrySyncMins || '15'
  );
  const [unitSystem, setUnitSystem] = useState(
    session?.workspaceSettings?.BEEKEEPER?.unitSystem || 'METRIC'
  );
  const [isSaved, setIsSaved] = useState(false);

  // Compute hive status breakdown
  const activeHives = hives.filter(h => !h.status || h.status === 'ACTIVE' || h.status === 'HEALTHY').length;
  const monitoringHives = hives.filter(h => h.status === 'MONITORING' || h.status === 'ATTENTION').length;
  const harvestReadyHives = hives.filter(h => h.status === 'HARVEST_READY').length;
  const inactiveHives = hives.filter(h => h.status === 'INACTIVE' || h.status === 'ARCHIVED').length;

  const handleSaveSettings = () => {
    if (onSaveSettings) {
      onSaveSettings('BEEKEEPER', {
        inspectionInterval,
        beeSpecies,
        aiAssistEnabled,
        telemetrySyncMins,
        unitSystem
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="beekeeper-profile-workspace" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Contextual Workspace Readiness Prompt (§ 16) */}
      <div 
        className="card"
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
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
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#92400E' }}>
              {apiary?.name || 'Apiary Yard'} is Active
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#B45309' }}>
              Connected to {apiaries.length} apiary locations with {hives.length} active colonies in the field.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenAddApiary}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Plus size={14} /> Add Apiary
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onNavigateTo('hives')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Layers size={14} /> View All Hives
          </button>
        </div>
      </div>

      {/* Grid: 2 columns on desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* 1. Beekeeping Identity & Operating Context */}
        <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <MapPin size={18} color="#D97706" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Apiary & Field Identity</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <span className="supporting-text">Primary Apiary</span>
              <strong style={{ color: 'var(--theme-text-primary)' }}>{apiary?.name || 'Valley Apiary 01'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <span className="supporting-text">Field Location</span>
              <strong style={{ color: 'var(--theme-text-primary)' }}>
                {typeof apiary?.location === 'object' && apiary?.location !== null
                  ? ([apiary.location.locality, apiary.location.district, apiary.location.state].filter(Boolean).join(', ') || 'Coimbatore, Western Ghats')
                  : (apiary?.location || 'Coimbatore, Western Ghats')}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <span className="supporting-text">Bee Species</span>
              <strong style={{ color: 'var(--theme-text-primary)' }}>{beeSpecies}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <span className="supporting-text">Operating Context</span>
              <strong style={{ color: 'var(--theme-text-primary)' }}>Organic Multifloral Reserve</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="supporting-text">Experience Level</span>
              <strong style={{ color: 'var(--theme-text-primary)' }}>Master Apiarist (8+ Years)</strong>
            </div>
          </div>
        </div>

        {/* 2. Hive Summary Breakdown */}
        <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#D97706" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Colony & Hive Status</h3>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateTo('hives')}
              style={{ padding: '2px 8px', fontSize: '12px' }}
            >
              Manage
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803D' }}>{activeHives}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#166534' }}>Active Colonies</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '10px', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#B45309' }}>{monitoringHives}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#92400E' }}>Monitoring Required</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1D4ED8' }}>{harvestReadyHives}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#1E40AF' }}>Harvest Ready</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#64748B' }}>{inactiveHives}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#475569' }}>Inactive / Standby</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Apiary Yard Management Section */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#D97706" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Apiary Yards & Field Sites</h3>
            </div>
            <p className="supporting-text" style={{ margin: '2px 0 0 0', fontSize: '13px' }}>
              Manage apiary yards, geographic boundaries, and root traceability units
            </p>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={onOpenAddApiary}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} /> Register Apiary Yard
          </button>
        </div>

        {apiaries.length === 0 ? (
          <div 
            style={{
              padding: '32px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--theme-surface-hover)',
              borderRadius: '12px',
              border: '1.5px dashed var(--theme-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <div 
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}
            >
              <Building2 size={22} />
            </div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
              No Apiary Yards Registered
            </h4>
            <p className="supporting-text" style={{ margin: 0, fontSize: '13px', maxWidth: '360px' }}>
              Apiary yards anchor your geographic coordinates, root traceability codes (e.g. AP1), and group your colonies.
            </p>
            <button 
              className="btn btn-primary btn-sm"
              onClick={onOpenAddApiary}
              style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Register First Apiary Yard
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {apiaries.map((site, idx) => {
              const yardCode = site.apiaryCode || site.code || `AP${idx + 1}`;
              const isPrimary = (apiary?.id && site.id && apiary.id === site.id) || 
                                (apiary?.apiaryCode && site.apiaryCode && apiary.apiaryCode === site.apiaryCode) ||
                                (idx === 0 && !apiary);
              const yardHives = hives.filter(h => (h.location || '').includes(site.name) || h.apiaryId === site.id);

              return (
                <div 
                  key={site.id || yardCode || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: isPrimary ? '#FFFDF8' : 'var(--theme-surface-hover)',
                    border: isPrimary ? '1.5px solid #D97706' : '1px solid var(--theme-border)',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                    <div 
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: isPrimary ? '#FEF3C7' : '#F3ECE1',
                        color: isPrimary ? '#B45309' : '#6B4F35',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '13px',
                        flexShrink: 0
                      }}
                    >
                      {yardCode}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--theme-text-primary)' }}>
                          {site.name}
                        </span>
                        {isPrimary && (
                          <span 
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              backgroundColor: '#EBF7EE',
                              color: '#15803D',
                              fontWeight: 700
                            }}
                          >
                            ★ Primary Yard
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--theme-text-secondary)', marginTop: '2px' }}>
                        {site.region || site.location || 'Regional Field Yard'} • {yardHives.length} colonies assigned
                      </div>
                      {site.notes && (
                        <div style={{ fontSize: '11.5px', color: '#786D61', marginTop: '2px', fontStyle: 'italic' }}>
                          "{site.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!isPrimary && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setApiary(site);
                          showToast(`Set '${site.name}' as primary active apiary`);
                        }}
                        style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onNavigateTo('hives')}
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                    >
                      View Hives
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        if (window.confirm(`Permanently remove apiary yard '${site.name}' (${yardCode})?`)) {
                          deleteApiary(site.id || yardCode);
                        }
                      }}
                      style={{ padding: '4px 8px', color: '#D9383A', borderColor: 'rgba(217, 56, 58, 0.3)' }}
                      title="Remove Apiary Yard"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Verification & IoT Connected Devices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* 4. Verification Details (§ 14, § 15: No sensitive government docs exposed) */}
        <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldCheck size={18} color="#16A34A" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Field Verification & Identity</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Operator Identity</div>
                <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)' }}>Government Photo ID verified</div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', backgroundColor: '#F0FDF4', padding: '3px 8px', borderRadius: '6px' }}>
                ✓ Verified
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--theme-border)', paddingBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 500 }}>National Bee Board (NBB)</div>
                <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)' }}>Registration Ref: NBB-TN-2026-084</div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', backgroundColor: '#F0FDF4', padding: '3px 8px', borderRadius: '6px' }}>
                ✓ Active Record
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>KVIC / Honey Mission</div>
                <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)' }}>Apiculture Registry Ref: KVIC-API-4491</div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', backgroundColor: '#F0FDF4', padding: '3px 8px', borderRadius: '6px' }}>
                ✓ Enrolled
              </span>
            </div>
          </div>
        </div>

        {/* 5. Device Connections & ESP32 Telemetry */}
        <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="#D97706" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Connected Field Devices</h3>
            </div>
            <span style={{ fontSize: '11px', color: '#15803D', backgroundColor: '#F0FDF4', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
              {devices.length || 3} Active Nodes
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wifi size={16} color="#15803D" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>ESP32 Mesh Gateway #01</div>
                  <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>LoRa 868MHz • Battery 94% • Sync: 2m ago</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>● Online</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="#D97706" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Brood Acoustic & Temp Node #04</div>
                  <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>Temp: 34.8°C • Humidity: 62% • Normal</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>● Streaming</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--theme-surface-hover)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={16} color="#6366F1" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Hive Entrance Vision Node #02</div>
                  <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>Bee Traffic: 184/min • Varroa Scanner: Active</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>● Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Beekeeper Workspace Settings */}
      <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="#D97706" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Beekeeper Field Preferences</h3>
          </div>
          {isSaved && (
            <span style={{ fontSize: '12px', color: '#15803D', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Check size={14} /> Preferences Saved
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Mandatory Inspection Schedule
            </label>
            <select
              className="input-select"
              value={inspectionInterval}
              onChange={(e) => setInspectionInterval(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
            >
              <option value="5">Every 5 Days (High Season)</option>
              <option value="7">Every 7 Days (Standard)</option>
              <option value="14">Every 14 Days (Routine)</option>
              <option value="21">Every 21 Days (Dormancy)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Telemetry Sync Interval
            </label>
            <select
              className="input-select"
              value={telemetrySyncMins}
              onChange={(e) => setTelemetrySyncMins(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
            >
              <option value="5">Every 5 Minutes (High Precision)</option>
              <option value="15">Every 15 Minutes (Recommended)</option>
              <option value="60">Every 1 Hour (Battery Saver)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Measurement Units
            </label>
            <select
              className="input-select"
              value={unitSystem}
              onChange={(e) => setUnitSystem(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
            >
              <option value="METRIC">Metric (kg, °C, mm)</option>
              <option value="IMPERIAL">Imperial (lbs, °F, in)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              AI Computer Vision Assistant
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '38px' }}>
              <input
                type="checkbox"
                id="ai-assist-check"
                checked={aiAssistEnabled}
                onChange={(e) => setAiAssistEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#D97706', cursor: 'pointer' }}
              />
              <label htmlFor="ai-assist-check" style={{ fontSize: '13px', cursor: 'pointer' }}>
                Auto-detect Queen & Varroa during scan
              </label>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleSaveSettings}
          >
            Save Field Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
