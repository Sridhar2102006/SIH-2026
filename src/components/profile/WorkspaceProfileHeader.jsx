import React from 'react';
import { 
  CheckCircle, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  ArrowLeftRight, 
  Edit3, 
  Sparkles,
  Layers,
  Factory,
  FlaskConical,
  Truck
} from 'lucide-react';
import { DESIGNATION_META } from '../../services/workspaceProfileConfig.js';

export { DESIGNATION_META };

const ICON_MAP = {
  Layers,
  Factory,
  FlaskConical,
  Truck
};

export const WorkspaceProfileHeader = ({
  session,
  activeRole = 'BEEKEEPER',
  workspaceName,
  verificationText = 'Identity & Business Verified',
  activeTab = 'profile',
  onTabChange,
  onOpenSwitcher,
  onOpenEdit
}) => {
  const meta = DESIGNATION_META[activeRole] || DESIGNATION_META.BEEKEEPER;
  const RoleIcon = ICON_MAP[meta.iconName] || Layers;

  const operatorName = session?.operator || session?.legalName || 'Sarah Lindqvist';
  const email = session?.email || 'sarah.lindqvist@honeychain.io';
  const phone = session?.phone || '+91 98401 22340';
  const initials = operatorName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'HC';

  const isLab = meta.theme === 'lab';

  return (
    <div 
      className={`card profile-header-container theme-${meta.theme}`}
      style={{
        marginBottom: '20px',
        padding: '24px',
        backgroundColor: isLab ? '#FFFFFF' : 'var(--theme-surface)',
        border: isLab ? '1px solid #CBD5E1' : '1px solid var(--theme-border)',
        boxShadow: isLab ? '0 4px 12px rgba(15, 23, 42, 0.04)' : '0 2px 8px rgba(0,0,0,0.04)',
        borderRadius: '16px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        {/* Left: Avatar & Identity Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '260px' }}>
          <div 
            style={{
              position: 'relative',
              width: '68px',
              height: '68px',
              borderRadius: '16px',
              backgroundColor: meta.bg,
              border: `2px solid ${meta.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: meta.color,
              fontSize: '22px',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}
          >
            {initials}
            <div 
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                width: '24px',
                height: '24px',
                borderRadius: '8px',
                backgroundColor: meta.color,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={meta.label}
            >
              <RoleIcon size={13} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: isLab ? '#0F172A' : 'var(--theme-text-primary)' }}>
                {workspaceName || 'My Honey Workspace'}
              </h2>
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: meta.bg,
                  color: meta.color,
                  border: `1px solid ${meta.border}`
                }}
              >
                <RoleIcon size={12} />
                {meta.label}
              </span>
            </div>

            <div style={{ marginTop: '4px', fontSize: '13px', color: isLab ? '#475569' : 'var(--theme-text-secondary)', fontWeight: 500 }}>
              {operatorName} • {meta.roleName}
            </div>

            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: isLab ? '#64748B' : 'var(--theme-text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={12} /> {email}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} /> {phone}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: isLab ? '#F0FDF4' : '#EBF7EE',
                color: isLab ? '#15803D' : 'var(--color-healthy)',
                border: isLab ? '1px solid #BBF7D0' : '1px solid #C4E9C8'
              }}
            >
              <ShieldCheck size={14} />
              {verificationText}
            </span>

            <span 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: isLab ? '#F8FAFC' : '#FAF6F0',
                color: isLab ? '#334155' : 'var(--theme-text-secondary)',
                border: isLab ? '1px solid #E2E8F0' : '1px solid var(--theme-border)'
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              Workspace Active
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenSwitcher}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              id="switch-workspace-btn"
            >
              <ArrowLeftRight size={14} />
              <span>Switch Workspace</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenEdit}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              id="edit-profile-btn"
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '20px',
          borderTop: isLab ? '1px solid #E2E8F0' : '1px solid var(--theme-border)',
          paddingTop: '14px'
        }}
      >
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => onTabChange('profile')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeTab === 'profile' ? (isLab ? '#2563EB' : meta.color) : 'transparent',
            color: activeTab === 'profile' ? '#FFFFFF' : (isLab ? '#475569' : 'var(--theme-text-secondary)'),
            transition: 'all 0.15s ease'
          }}
          id="profile-tab-workspace"
        >
          {meta.label}
        </button>

        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeTab === 'settings' ? (isLab ? '#2563EB' : meta.color) : 'transparent',
            color: activeTab === 'settings' ? '#FFFFFF' : (isLab ? '#475569' : 'var(--theme-text-secondary)'),
            transition: 'all 0.15s ease'
          }}
          id="profile-tab-security"
        >
          Security & Account Settings
        </button>
      </div>
    </div>
  );
};
