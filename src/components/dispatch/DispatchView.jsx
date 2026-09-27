/**
 * SCREEN — MASTER DISPATCH & CONSIGNMENT WORKSPACE
 *
 * Dedicated Canonical Destination for Final Package Check & Shipments
 * Route: /dispatch
 *
 * Bridges:
 * - Ready to Dispatch Package Queue (Physical QR Validation & Traceability)
 * - Shipment Consignments & Manifests (Allocation & Release Guard)
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Package,
  Truck,
  QrCode
} from 'lucide-react';
import { DispatchPackagesView } from './DispatchPackagesView';
import { ShipmentsView } from './ShipmentsView';

export const DispatchView = ({ initialTab = 'PACKAGES' }) => {
  const { activeTab: globalTab } = useAppState();
  const [subTab, setSubTab] = useState(
    globalTab === 'shipments' ? 'SHIPMENTS' : (initialTab || 'PACKAGES')
  );

  useEffect(() => {
    if (globalTab === 'shipments') {
      setSubTab('SHIPMENTS');
    } else if (globalTab === 'dispatch') {
      setSubTab('PACKAGES');
    }
  }, [globalTab]);

  return (
    <div className="dispatch-master-view">
      {/* Top Segment Control */}
      <div
        style={{
          padding: '12px 16px 0',
          backgroundColor: '#FFF9EF',
          borderBottom: '1px solid #E2D9CC',
          display: 'flex',
          gap: '8px'
        }}
      >
        <button
          type="button"
          onClick={() => setSubTab('PACKAGES')}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: subTab === 'PACKAGES' ? 700 : 500,
            border: 'none',
            borderBottom: subTab === 'PACKAGES' ? '3px solid #D99A24' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: subTab === 'PACKAGES' ? '#34261B' : '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Package size={15} color={subTab === 'PACKAGES' ? '#D99A24' : '#64748B'} />
          <span>Ready Packages</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('SHIPMENTS')}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: subTab === 'SHIPMENTS' ? 700 : 500,
            border: 'none',
            borderBottom: subTab === 'SHIPMENTS' ? '3px solid #7AA7C7' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: subTab === 'SHIPMENTS' ? '#34261B' : '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Truck size={15} color={subTab === 'SHIPMENTS' ? '#7AA7C7' : '#64748B'} />
          <span>Shipment Manifests</span>
        </button>
      </div>

      {/* Active Tab View */}
      {subTab === 'PACKAGES' ? (
        <DispatchPackagesView />
      ) : (
        <ShipmentsView />
      )}
    </div>
  );
};
