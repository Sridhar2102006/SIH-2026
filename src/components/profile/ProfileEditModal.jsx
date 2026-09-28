import React, { useState } from 'react';
import { 
  X, 
  Check, 
  User, 
  Building2, 
  ShieldCheck, 
  Sliders, 
  Save 
} from 'lucide-react';

export const ProfileEditModal = ({
  isOpen,
  onClose,
  activeRole = 'BEEKEEPER',
  session,
  apiary,
  onUpdateIdentity,
  onUpdateWorkspace
}) => {
  if (!isOpen) return null;

  const [activeSection, setActiveSection] = useState('identity'); // 'identity' | 'workspace' | 'verification'

  // User Identity fields
  const [operatorName, setOperatorName] = useState(session?.operator || 'Sarah Lindqvist');
  const [email, setEmail] = useState(session?.email || 'sarah.lindqvist@honeychain.io');
  const [phone, setPhone] = useState(session?.phone || '+91 98401 22340');

  // Workspace fields (varies by role)
  const [workspaceName, setWorkspaceName] = useState(
    activeRole === 'BEEKEEPER' ? (apiary?.name || 'Valley Apiary 01') :
    activeRole === 'PROCESSOR' ? 'Kaveri Honey Processing Facility' :
    activeRole === 'LAB_SPECIALIST' || activeRole === 'LAB' ? 'Apex Honey Analytical Laboratory' :
    'HoneyChain Logistics Hub South'
  );
  const [workspaceLocation, setWorkspaceLocation] = useState(
    activeRole === 'BEEKEEPER' ? (apiary?.location || 'Coimbatore, Western Ghats') :
    activeRole === 'PROCESSOR' ? 'Coimbatore Industrial Cluster, TN' :
    activeRole === 'LAB_SPECIALIST' || activeRole === 'LAB' ? 'Chennai Analytical Science Park, TN' :
    'Warehouse 4B, Logistics Park, Coimbatore'
  );
  const [operatingContext, setOperatingContext] = useState(
    activeRole === 'BEEKEEPER' ? 'Organic Multifloral Reserve' :
    activeRole === 'PROCESSOR' ? 'Cold Processing & Micro-Filtration' :
    activeRole === 'LAB_SPECIALIST' || activeRole === 'LAB' ? 'ISO/IEC 17025 Chemical Testing' :
    'Cold-Chain & Courier Transit'
  );

  const handleSave = (e) => {
    e.preventDefault();
    if (onUpdateIdentity) {
      onUpdateIdentity({
        legalName: operatorName,
        displayName: operatorName,
        email,
        phone
      });
    }
    if (onUpdateWorkspace) {
      onUpdateWorkspace({
        name: workspaceName,
        location: workspaceLocation,
        context: operatingContext
      });
    }
    onClose();
  };

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="card modal-content"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--theme-surface)',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--theme-border)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
              Edit Workspace Profile
            </h3>
            <p className="supporting-text" style={{ margin: '2px 0 0 0', fontSize: '13px' }}>
              Update your account identity and professional workspace details
            </p>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--theme-border)', paddingBottom: '12px', marginBottom: '16px' }}>
          <button
            type="button"
            className={`btn ${activeSection === 'identity' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSection('identity')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <User size={14} /> Identity
          </button>
          <button
            type="button"
            className={`btn ${activeSection === 'workspace' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSection('workspace')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Building2 size={14} /> Workspace
          </button>
          <button
            type="button"
            className={`btn ${activeSection === 'verification' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveSection('verification')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={14} /> Verification
          </button>
        </div>

        <form onSubmit={handleSave}>
          {activeSection === 'identity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Full Legal / Professional Name
                </label>
                <input 
                  type="text"
                  className="input-select"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Official Email Address
                </label>
                <input 
                  type="email"
                  className="input-select"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Mobile / Field Contact Number
                </label>
                <input 
                  type="tel"
                  className="input-select"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
                />
              </div>
            </div>
          )}

          {activeSection === 'workspace' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  {activeRole === 'BEEKEEPER' ? 'Primary Apiary Name' :
                   activeRole === 'PROCESSOR' ? 'Facility Name' :
                   activeRole === 'LAB_SPECIALIST' || activeRole === 'LAB' ? 'Laboratory Name' :
                   'Distribution Business Name'}
                </label>
                <input 
                  type="text"
                  className="input-select"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Geographic Location / Address
                </label>
                <input 
                  type="text"
                  className="input-select"
                  value={workspaceLocation}
                  onChange={(e) => setWorkspaceLocation(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Operating Context / Specialization
                </label>
                <input 
                  type="text"
                  className="input-select"
                  value={operatingContext}
                  onChange={(e) => setOperatingContext(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
                />
              </div>
            </div>
          )}

          {activeSection === 'verification' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#15803D" />
                  <strong style={{ fontSize: '14px', color: '#15803D' }}>Identity & Credential Status</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px' }}>
                  Your primary account identity is verified and cryptographically anchored to HoneyChain.
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--theme-text-secondary)', lineHeight: '1.5' }}>
                To upload updated regulatory renewals or request audit re-verification, submit a cryptographic verification package via the regulatory portal.
              </div>
            </div>
          )}

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={15} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
