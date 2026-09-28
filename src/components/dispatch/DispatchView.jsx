/**
 * SCREEN — MASTER DISPATCH & CONSIGNMENT WORKSPACE
 *
 * Dedicated Canonical Destination for Final Package Check & Shipments
 * Route: /dispatch
 *
 * Tabs:
 * - Validate & QR: Honey Journey Validation → Consumer QR Generation (CORE DISPATCH TASK)
 * - Ready Packages: Physical QR Validation Queue
 * - Shipment Manifests: Carrier Consignment Management
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Package,
  Truck,
  QrCode,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { HoneyJourneyValidationView } from './HoneyJourneyValidationView';
import { DispatchPackagesView } from './DispatchPackagesView';
import { ShipmentsView } from './ShipmentsView';
import { DispatchLabClearanceView } from './DispatchLabClearanceView';

export const DispatchView = ({ initialTab = 'VALIDATE_QR' }) => {
  const { activeTab: globalTab, dispatchPackages = [], labReports = [] } = useAppState();
  const [subTab, setSubTab] = useState(
    globalTab === 'shipments' ? 'SHIPMENTS' :
    globalTab === 'dispatch' ? 'VALIDATE_QR' :
    (initialTab || 'VALIDATE_QR')
  );

  useEffect(() => {
    if (globalTab === 'shipments') {
      setSubTab('SHIPMENTS');
    } else if (globalTab === 'dispatch' || globalTab === 'orders') {
      setSubTab('VALIDATE_QR');
    }
  }, [globalTab]);

  const labClearancesCount = (dispatchPackages || []).filter(p => p.coaDocumentId || p.labReport).length || labReports.length;

  const tabs = [
    {
      id: 'VALIDATE_QR',
      label: 'Validate & QR',
      icon: ShieldCheck,
      activeColor: '#D99A24',
      description: 'Review honey journey & generate consumer QR'
    },
    {
      id: 'LAB_REPORTS',
      label: 'Lab Clearances & CoA',
      icon: FileCheck,
      activeColor: '#059669',
      count: labClearancesCount,
      description: 'Accredited laboratory certificates and releases'
    },
    {
      id: 'PACKAGES',
      label: 'Ready Packages',
      icon: Package,
      activeColor: '#8AA681',
      description: 'Physical QR scan validation queue'
    },
    {
      id: 'SHIPMENTS',
      label: 'Shipments',
      icon: Truck,
      activeColor: '#7AA7C7',
      description: 'Carrier manifests & delivery tracking'
    }
  ];

  return (
    <div className="dispatch-master-view">
      {/* Top Segment Control */}
      <div
        style={{
          padding: '10px 16px 0',
          backgroundColor: '#FFF9EF',
          borderBottom: '1px solid #E2D9CC',
          display: 'flex',
          gap: '4px',
          overflowX: 'auto'
        }}
      >
        {tabs.map(tab => {
          const TabIcon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                border: 'none',
                borderBottom: isActive ? `3px solid ${tab.activeColor}` : '3px solid transparent',
                backgroundColor: 'transparent',
                color: isActive ? '#34261B' : '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <TabIcon size={14} color={isActive ? tab.activeColor : '#94A3B8'} />
              <span>{tab.label}</span>
              {tab.id === 'VALIDATE_QR' && isActive && (
                <span style={{
                  fontSize: '9px', padding: '1px 5px', borderRadius: '8px',
                  backgroundColor: '#D99A24', color: '#FFFFFF', fontWeight: 700
                }}>CORE</span>
              )}
              {tab.id === 'LAB_REPORTS' && tab.count > 0 && (
                <span style={{
                  fontSize: '10px', padding: '1px 6px', borderRadius: '10px',
                  backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 700,
                  border: '1px solid #BBF7D0'
                }}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      {subTab === 'VALIDATE_QR' && <HoneyJourneyValidationView />}
      {subTab === 'LAB_REPORTS' && <DispatchLabClearanceView onNavigateToPackages={() => setSubTab('PACKAGES')} />}
      {subTab === 'PACKAGES' && <DispatchPackagesView />}
      {subTab === 'SHIPMENTS' && <ShipmentsView />}
    </div>
  );
};
