import React from 'react';
import { 
  X, 
  Check, 
  Layers, 
  Factory, 
  FlaskConical, 
  Truck, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const WORKSPACE_OPTIONS = [
  {
    id: 'BEEKEEPER',
    name: 'Beekeeper Workspace',
    roleTitle: 'Apiary Management & Hive Operations',
    description: 'Field inspections, hive frames, colony health, and honey collection.',
    icon: Layers,
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A'
  },
  {
    id: 'PROCESSOR',
    name: 'Processor Workspace',
    roleTitle: 'Honey Processing & Facility Operations',
    description: 'Harvest intake, multi-step processing, batch controls, and packaging handoff.',
    icon: Factory,
    color: '#B45309',
    bg: '#FFEDD5',
    border: '#FED7AA'
  },
  {
    id: 'LAB_SPECIALIST',
    name: 'Laboratory Workspace',
    roleTitle: 'Scientific Analytical Testing',
    description: 'Sample intake, analytical assays (Moisture, HMF, Diastase), and CoA generation.',
    icon: FlaskConical,
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#BFDBFE'
  },
  {
    id: 'DISTRIBUTOR',
    name: 'Distributor Workspace',
    roleTitle: 'Logistics, QR Validation & Dispatch',
    description: 'Physical QR authentication, shipment dispatch, carrier routing, and delivery.',
    icon: Truck,
    color: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD'
  }
];

export const WorkspaceSwitcherModal = ({
  isOpen,
  onClose,
  activeRole = 'BEEKEEPER',
  onSwitchWorkspace
}) => {
  if (!isOpen) return null;

  const normalizedActiveRole = activeRole === 'LAB' ? 'LAB_SPECIALIST' : (activeRole === 'DISPATCH' ? 'DISTRIBUTOR' : activeRole);

  const handleSelect = (roleId) => {
    if (onSwitchWorkspace) {
      onSwitchWorkspace(roleId);
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
          maxWidth: '560px',
          backgroundColor: 'var(--theme-surface)',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--theme-border)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--theme-text-primary)' }}>
              Switch Professional Workspace
            </h3>
            <p className="supporting-text" style={{ margin: '2px 0 0 0', fontSize: '13px' }}>
              One HoneyChain account • Switch your active professional domain instantly
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {WORKSPACE_OPTIONS.map((ws) => {
            const isCurrent = normalizedActiveRole === ws.id;
            const Icon = ws.icon;

            return (
              <div
                key={ws.id}
                onClick={() => handleSelect(ws.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: isCurrent ? ws.bg : 'var(--theme-surface-hover)',
                  border: isCurrent ? `2px solid ${ws.color}` : '1px solid var(--theme-border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                className="workspace-switch-card"
                id={`switch-to-${ws.id.toLowerCase()}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: ws.bg,
                      color: ws.color,
                      border: `1px solid ${ws.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '15px', color: 'var(--theme-text-primary)' }}>
                        {ws.name}
                      </strong>
                      {isCurrent && (
                        <span 
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: ws.color,
                            color: '#FFFFFF',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--theme-text-secondary)', marginTop: '2px' }}>
                      {ws.description}
                    </div>
                  </div>
                </div>

                <div>
                  {isCurrent ? (
                    <div 
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: ws.color,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Check size={16} />
                    </div>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(ws.id);
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>Switch</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '18px', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--theme-surface-hover)', fontSize: '12px', color: 'var(--theme-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="var(--color-healthy)" />
          <span>Switching workspaces adjusts navigation and role permissions without creating another login session.</span>
        </div>
      </div>
    </div>
  );
};
