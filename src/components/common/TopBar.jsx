import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Wifi, WifiOff, RefreshCw, Trash2 } from 'lucide-react';

import { RouteRegistry } from '../../services/routeRegistry';

export const TopBar = () => {
  const {
    session,
    apiary,
    apiaries = [],
    activeTab,
    isOnline,
    isSyncing,
    pendingSyncCount,
    toggleOnlineMode,
    triggerSync,
    truncateAllRecords,
  } = useAppState();

  const currentRoute = RouteRegistry.getRoute(activeTab);
  const routeTitle = currentRoute?.title || 'HoneyChain Operations';
  const activeApiary = apiary || (apiaries && apiaries.length > 0 ? apiaries[0] : null);

  const isBeekeeper = !session?.activeRole || session?.activeRole === 'BEEKEEPER';

  const handleTruncateClick = () => {
    const ok = window.confirm(
      'TRUNCATE ALL APP RECORDS?\n\nThis will wipe all existing apiaries, hives, harvests, handovers, batches, lab tests, packages, and QRs from the local database.\n\nYou can then feed fresh data manually and test complete end-to-end honey traceability.'
    );
    if (ok && truncateAllRecords) {
      truncateAllRecords();
    }
  };

  // Compute workspace-aware title
  const activeRoleStr = (
    session?.activeRole ||
    session?.activeDesignation ||
    session?.designations?.[0] ||
    ''
  ).toUpperCase();

  const workspaceDisplayName = (() => {
    if (activeRoleStr === 'PROCESSOR') return 'Processing Facility';
    if (activeRoleStr === 'LAB_SPECIALIST' || activeRoleStr === 'LAB') return 'Analytical Laboratory';
    if (activeRoleStr === 'DISTRIBUTOR' || activeRoleStr === 'DISPATCH') return 'Logistics Hub';
    return null; // Beekeeper → use apiary name
  })();

  const topbarTitle = workspaceDisplayName || activeApiary?.name || 'HoneyChain';
  // Beekeeper shows apiary name with no subtitle; others show route context when not on home
  const topbarSubtitle = (!workspaceDisplayName)
    ? null
    : (activeTab !== 'home' ? routeTitle : null);

  return (
    <header className="topbar">
      <div className="topbar-context">
        {topbarSubtitle && (
          <span className="topbar-apiary-name">{topbarSubtitle}</span>
        )}
        <h1 className="topbar-title">{topbarTitle}</h1>
      </div>

      <div className="topbar-actions">
        <button
          className="topbar-truncate-btn"
          onClick={handleTruncateClick}
          title="Truncate all records to test manual data feeding"
          aria-label="Truncate all records"
        >
          <Trash2 size={13} strokeWidth={2} />
          <span>Truncate</span>
        </button>

        <button
          className={`topbar-network-btn ${!isOnline ? 'offline' : isSyncing ? 'syncing' : 'online'}`}
          onClick={!isOnline ? toggleOnlineMode : pendingSyncCount > 0 ? triggerSync : toggleOnlineMode}
          title={isOnline ? 'Tap to simulate field offline mode' : 'Tap to reconnect'}
          aria-label="Network status"
        >
          {isSyncing ? (
            <>
              <RefreshCw size={13} className="spin-icon" />
              <span>Syncing</span>
            </>
          ) : !isOnline ? (
            <>
              <WifiOff size={13} strokeWidth={2} />
              <span>Offline{pendingSyncCount > 0 ? ` (${pendingSyncCount})` : ''}</span>
            </>
          ) : (
            <>
              <Wifi size={13} strokeWidth={2} />
              <span>{pendingSyncCount > 0 ? `${pendingSyncCount} pending` : 'Online'}</span>
            </>
          )}
        </button>
      </div>

      <style>{`
        .topbar {
          padding: 13px var(--mobile-pad) 11px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--theme-header-bg, var(--color-warm-cream));
          border-bottom: 1px solid var(--theme-border, var(--color-divider));
          z-index: 10;
          flex-shrink: 0;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        .topbar-context {
          display: flex;
          flex-direction: column;
          gap: 1px;
          flex: 1;
          min-width: 0;
        }

        .topbar-apiary-name {
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--theme-text-secondary, var(--color-warm-gray));
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .topbar-title {
          font-size: 17px;
          font-weight: 800;
          color: var(--theme-text-primary, var(--color-deep-cocoa));
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          margin-left: 12px;
        }

        .topbar-truncate-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 9px;
          border-radius: var(--radius-badge, 6px);
          font-size: 11px;
          font-weight: 600;
          font-family: inherit;
          border: 1px solid rgba(220, 53, 69, 0.3);
          background-color: rgba(220, 53, 69, 0.07);
          color: #c62828;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
          white-space: nowrap;
        }

        .topbar-truncate-btn:hover {
          background-color: rgba(220, 53, 69, 0.15);
          border-color: rgba(220, 53, 69, 0.5);
          transform: translateY(-1px);
        }

        .topbar-network-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: var(--radius-badge, 6px);
          font-size: 11.5px;
          font-weight: 500;
          font-family: inherit;
          border: 1px solid var(--theme-border, var(--color-divider));
          background-color: var(--theme-surface, var(--color-soft-ivory));
          color: var(--theme-text-secondary, var(--color-warm-gray));
          cursor: pointer;
          transition: background-color 0.15s ease;
          user-select: none;
          white-space: nowrap;
        }

        .topbar-network-btn:hover {
          background-color: var(--theme-surface-hover, #FAF2E4);
        }

        .topbar-network-btn.online {
          color: #3a7040;
          border-color: rgba(79, 122, 82, 0.3);
          background-color: rgba(79, 122, 82, 0.08);
        }

        .topbar-network-btn.offline {
          color: #b45309;
          border-color: rgba(217, 130, 43, 0.35);
          background-color: rgba(217, 130, 43, 0.1);
        }

        .topbar-network-btn.syncing {
          color: var(--theme-accent-primary, var(--color-deep-honey));
          border-color: rgba(217, 154, 36, 0.3);
          background-color: rgba(217, 154, 36, 0.1);
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};
