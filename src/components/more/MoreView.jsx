import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { StatusBadge } from '../common/StatusBadge';
import { TechnicalDetails } from '../common/TechnicalDetails';
import { WorkSetupModal } from './WorkSetupModal';
import { DESIGNATIONS } from '../../services/capabilityEngine';
import {
  User,
  Shield,
  Cpu,
  Bell,
  Sliders,
  HelpCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Compass,
  LogOut,
  Briefcase,
  Factory
} from 'lucide-react';
import { ProcessorSetupScreen } from '../onboarding/ProcessorSetupScreen';
import { CommonProcessorOnboarding } from '../onboarding/CommonProcessorOnboarding';

export const MoreView = () => {
  const {
    apiary,
    devices,
    isOnline,
    isSyncing,
    pendingSyncCount,
    toggleOnlineMode,
    triggerSync,
    showToast,
    replaySplash,
    logout,
    navigateTo,
    userDesignations,
    userCapabilities,
    resetOnboardingForTesting
  } = useAppState();

  const [activeSection, setActiveSection] = useState(null); // null | 'devices' | 'permissions' | 'help' | 'settings'
  const [isWorkSetupOpen, setIsWorkSetupOpen] = useState(false);
  const [isProcessorSetupOpen, setIsProcessorSetupOpen] = useState(false);
  const [moreSetupMode, setMoreSetupMode] = useState('SIMPLE');

  // Format designations string
  const activeDesigNames = (userDesignations || [])
    .map(id => DESIGNATIONS.find(d => d.id === id))
    .filter(Boolean)
    .map(d => `${d.icon} ${d.name}`)
    .join(' • ');

  return (
    <div className="more-view-container">
      {/* 1. Profile Summary Card */}
      <div className="card profile-card">
        <div className="profile-avatar">
          <span>SL</span>
        </div>
        <div className="profile-info">
          <h2 className="heading-card" style={{ fontSize: '18px' }}>{apiary?.operator ?? 'No Apiary'}</h2>
          <span className="supporting-text">{apiary?.certification ?? '—'}</span>
          <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <StatusBadge status="healthy" label="Certified Master Apiarist" size="small" />
            {activeDesigNames && (
              <span className="badge badge-honey" style={{ fontSize: '11px', padding: '3px 8px' }}>
                {activeDesigNames}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Field Sync & Network Status Box */}
      <div className="card sync-control-card">
        <div className="sync-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isOnline ? (
              <Wifi size={18} color="var(--color-healthy)" />
            ) : (
              <WifiOff size={18} color="var(--color-attention)" />
            )}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600 }}>
                {isOnline ? 'Cellular & Mesh Connected' : 'Offline Field Mode'}
              </h4>
              <p className="supporting-text" style={{ fontSize: '12px' }}>
                {isOnline
                  ? pendingSyncCount > 0
                    ? `${pendingSyncCount} local changes ready to sync`
                    : 'All field records are securely up to date'
                  : `${pendingSyncCount} logs queued in device storage`}
              </p>
            </div>
          </div>
        </div>

        <div className="sync-actions-row">
          <button
            className="btn btn-secondary btn-sm"
            onClick={toggleOnlineMode}
          >
            {isOnline ? 'Simulate Offline' : 'Reconnect Online'}
          </button>
          {isOnline && (
            <button
              className="btn btn-primary btn-sm"
              onClick={triggerSync}
              disabled={isSyncing}
            >
              <RefreshCw size={14} className={isSyncing ? 'spin-icon' : ''} />
              <span>{isSyncing ? 'Anchoring...' : 'Sync to Ledger'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu List */}
      <div className="menu-group">
        {/* Work Setup & Capabilities Profile */}
        <button
          className="menu-row card"
          onClick={() => setIsWorkSetupOpen(true)}
          style={{ borderLeft: '4px solid var(--color-primary-honey)' }}
        >
          <div className="menu-icon-wrap" style={{ color: 'var(--color-deep-honey)', backgroundColor: '#FAF0DE' }}>
            <Briefcase size={18} />
          </div>
          <div className="menu-text">
            <span className="menu-title">Work Setup & Capabilities</span>
            <span className="supporting-text">
              {activeDesigNames || 'Customize roles'} • {userCapabilities.length} declared capabilities
            </span>
          </div>
          <ChevronRight size={18} className="menu-arrow" />
        </button>

        {/* Processing Facility & Equipment Setup */}
        {(userCapabilities?.includes('PROCESSING_MANAGEMENT') || userDesignations?.includes('PROCESSOR')) && (
          <button
            className="menu-row card"
            onClick={() => setIsProcessorSetupOpen(true)}
          >
            <div className="menu-icon-wrap" style={{ color: '#D97706' }}>
              <Factory size={18} />
            </div>
            <div className="menu-text">
              <span className="menu-title">Processing Facility, Equipment & SOPs</span>
              <span className="supporting-text">India facility registry, equipment calibration, active SOP</span>
            </div>
            <ChevronRight size={18} className="menu-arrow" />
          </button>
        )}

        {/* Devices */}
        <button
          className="menu-row card"
          onClick={() => setActiveSection(activeSection === 'devices' ? null : 'devices')}
        >
          <div className="menu-icon-wrap" style={{ color: 'var(--color-primary-honey)' }}>
            <Cpu size={18} />
          </div>
          <div className="menu-text">
            <span className="menu-title">Field Devices & ESP32 Nodes</span>
            <span className="supporting-text">{devices.length} active sensor scales & gateway</span>
          </div>
          <ChevronRight size={18} className={`menu-arrow ${activeSection === 'devices' ? 'open' : ''}`} />
        </button>

        {activeSection === 'devices' && (
          <div className="sub-panel">
            {devices.map((dev) => (
              <div key={dev.id} className="device-item card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 600 }}>{dev.name}</h5>
                    <span className="supporting-text" style={{ fontSize: '12px' }}>{dev.assignedTo}</span>
                  </div>
                  <StatusBadge status="healthy" label={dev.battery} size="small" />
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-warm-gray)' }}>
                  Signal: <strong style={{ color: 'var(--color-deep-cocoa)' }}>{dev.signal}</strong> • {dev.hardware}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Permissions */}
        <button
          className="menu-row card"
          onClick={() => setActiveSection(activeSection === 'permissions' ? null : 'permissions')}
        >
          <div className="menu-icon-wrap" style={{ color: 'var(--color-sage)' }}>
            <Shield size={18} />
          </div>
          <div className="menu-text">
            <span className="menu-title">Access & Cryptographic Keys</span>
            <span className="supporting-text">Role: Apiary Master Keyholder</span>
          </div>
          <ChevronRight size={18} className={`menu-arrow ${activeSection === 'permissions' ? 'open' : ''}`} />
        </button>

        {activeSection === 'permissions' && (
          <div className="sub-panel card">
            <div className="perm-row">
              <CheckCircle size={15} color="var(--color-healthy)" />
              <div>
                <strong style={{ fontSize: '13px' }}>Harvest Notarization</strong>
                <p className="supporting-text" style={{ fontSize: '12px' }}>Authorized to sign honey batch origin hash</p>
              </div>
            </div>
            <div className="perm-row">
              <CheckCircle size={15} color="var(--color-healthy)" />
              <div>
                <strong style={{ fontSize: '13px' }}>Colony Inspection Logging</strong>
                <p className="supporting-text" style={{ fontSize: '12px' }}>Authorized for health records & treatment logs</p>
              </div>
            </div>
            <div className="perm-row">
              <CheckCircle size={15} color="var(--color-healthy)" />
              <div>
                <strong style={{ fontSize: '13px' }}>IoT Device Provisioning</strong>
                <p className="supporting-text" style={{ fontSize: '12px' }}>Authorized to pair new ESP32 Bluetooth nodes</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications & Alert Thresholds */}
        <button
          className="menu-row card"
          onClick={() => showToast("Alert notifications configured for acoustic shifts & weight loss")}
        >
          <div className="menu-icon-wrap" style={{ color: 'var(--color-attention)' }}>
            <Bell size={18} />
          </div>
          <div className="menu-text">
            <span className="menu-title">Colony Alert Thresholds</span>
            <span className="supporting-text">Acoustic pitch shifts, sudden weight loss, frost warning</span>
          </div>
          <ChevronRight size={18} className="menu-arrow" />
        </button>

        {/* Apiary Guide & Help */}
        <button
          className="menu-row card"
          onClick={() => setActiveSection(activeSection === 'help' ? null : 'help')}
        >
          <div className="menu-icon-wrap" style={{ color: 'var(--color-deep-honey)' }}>
            <BookOpen size={18} />
          </div>
          <div className="menu-text">
            <span className="menu-title">Field Guide & Hotline</span>
            <span className="supporting-text">Disease ID reference & regional bee hotline</span>
          </div>
          <ChevronRight size={18} className={`menu-arrow ${activeSection === 'help' ? 'open' : ''}`} />
        </button>

        {activeSection === 'help' && (
          <div className="sub-panel card">
            <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              Pacific Northwest Apiary Advisory Hotline
            </h5>
            <p className="supporting-text" style={{ fontSize: '12.5px', marginBottom: '8px' }}>
              Direct line to state apiculturist extension for suspected brood disease or queen failure:
            </p>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-deep-honey)' }}>
              +1 (800) 555-BEE-HEALTH
            </div>
          </div>
        )}

        {/* Screen 01: Startup & Splash Demonstration */}
        <button
          className="menu-row card"
          onClick={() => setActiveSection(activeSection === 'startup' ? null : 'startup')}
        >
          <div className="menu-icon-wrap" style={{ color: 'var(--color-primary-honey)' }}>
            <Compass size={18} />
          </div>
          <div className="menu-text">
            <span className="menu-title">App Startup & Splash Screen</span>
            <span className="supporting-text">Preview Screen 01 & test routing transitions</span>
          </div>
          <ChevronRight size={18} className={`menu-arrow ${activeSection === 'startup' ? 'open' : ''}`} />
        </button>

        {activeSection === 'startup' && (
          <div className="sub-panel card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="supporting-text" style={{ fontSize: '12px', marginBottom: '2px' }}>
              Test the startup screen transition with different session states:
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => replaySplash('authenticated')}
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              ▶ Replay Splash (Authenticated → Home)
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => replaySplash('first-time')}
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              ▶ Test First-Time Launch (Splash → Welcome)
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => replaySplash('pending-onboarding')}
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              ▶ Test New Apiarist (Splash → Onboarding)
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={resetOnboardingForTesting}
              style={{ justifyContent: 'flex-start', textAlign: 'left', backgroundColor: 'var(--color-primary-honey)' }}
            >
              ▶ Launch Modern Capability Onboarding Flow
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                navigateTo('verification');
              }}
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              ▶ Preview Screen 04 (Email Verification OTP)
            </button>
          </div>
        )}

        {/* Sign Out Action: Returns to Screen 02 Welcome Screen */}
        <button
          className="menu-row card"
          onClick={logout}
          style={{ marginTop: '8px' }}
        >
          <div className="menu-icon-wrap" style={{ color: 'var(--color-critical)' }}>
            <LogOut size={18} />
          </div>
          <div className="menu-text">
            <span className="menu-title" style={{ color: 'var(--color-critical)' }}>Sign Out</span>
            <span className="supporting-text">Return to HoneyChain Welcome Screen</span>
          </div>
          <ChevronRight size={18} className="menu-arrow" />
        </button>
      </div>

      {/* Reusable Work Setup & Capabilities Modal */}
      <WorkSetupModal
        isOpen={isWorkSetupOpen}
        onClose={() => setIsWorkSetupOpen(false)}
      />

      {/* Facility, Equipment & SOP Configuration Modal */}
      {isProcessorSetupOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsProcessorSetupOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(44, 24, 16, 0.65)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '94vh',
              overflowY: 'auto',
              background: '#FFF',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid #EBDCC6' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-deep-cocoa)' }}>
                {moreSetupMode === 'SIMPLE' ? '🍯 Simple Processor Setup' : '⚙️ Advanced Facility & SOP Configuration'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setMoreSetupMode(prev => prev === 'SIMPLE' ? 'ADVANCED' : 'SIMPLE')}
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  {moreSetupMode === 'SIMPLE' ? 'Switch to Advanced' : 'Switch to Simple'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsProcessorSetupOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: 'var(--color-warm-gray)' }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {moreSetupMode === 'SIMPLE' ? (
              <CommonProcessorOnboarding
                onComplete={(data) => {
                  setIsProcessorSetupOpen(false);
                  showToast('Processor setup successfully updated');
                }}
                onCancel={() => setIsProcessorSetupOpen(false)}
                onSwitchToAdvanced={() => setMoreSetupMode('ADVANCED')}
              />
            ) : (
              <ProcessorSetupScreen
                onComplete={(data) => {
                  setIsProcessorSetupOpen(false);
                  showToast(`Facility ${data.facility?.name || ''} successfully configured`);
                }}
                onCancel={() => setIsProcessorSetupOpen(false)}
              />
            )}
          </div>
        </div>
      )}

      <style>{`
        .more-view-container {
          padding: 16px var(--mobile-pad) 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .profile-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 16px;
          background-color: var(--color-soft-ivory);
        }

        .profile-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background-color: #FAF0DC;
          border: 2px solid var(--color-primary-honey);
          color: var(--color-deep-honey);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .profile-info {
          flex: 1;
        }

        .sync-control-card {
          background-color: #FAF4E9;
          border: 1px solid var(--color-card-border);
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sync-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sync-actions-row {
          display: flex;
          gap: 10px;
        }

        .btn-sm {
          min-height: 36px;
          padding: 6px 12px;
          font-size: 12.5px;
          flex: 1;
        }

        .menu-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .menu-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          text-align: left;
          width: 100%;
          cursor: pointer;
        }

        .menu-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background-color: #FAF2E4;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .menu-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .menu-title {
          font-size: 14.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .menu-arrow {
          color: var(--color-warm-gray);
          transition: transform 0.2s ease;
        }

        .menu-arrow.open {
          transform: rotate(90deg);
        }

        .sub-panel {
          margin-top: -4px;
          margin-bottom: 6px;
          padding: 12px;
          background-color: #FAF6EE;
          border-radius: var(--radius-card);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .device-item {
          padding: 12px;
          background-color: var(--color-soft-ivory);
        }

        .perm-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 6px 0;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
