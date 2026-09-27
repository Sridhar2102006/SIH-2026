import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

import { RouteRegistry } from '../../services/routeRegistry';

export const TopBar = () => {
  const {
    apiary,
    activeTab,
    isOnline,
    isSyncing,
    pendingSyncCount,
    toggleOnlineMode,
    triggerSync,
    navigateTo
  } = useAppState();

  const currentRoute = RouteRegistry.getRoute(activeTab);
  const routeTitle = currentRoute?.title || 'HoneyChain Operations';

  return (
    <header className="topbar">
      <div className="topbar-context">
        <span className="micro-text topbar-apiary-name">{apiary?.name ?? 'No Apiary Set Up'}</span>
        <h1 className="topbar-title">{routeTitle}</h1>
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="topbar-processor-btn"
          onClick={() => {
            try {
              sessionStorage.setItem('open_processor_onboarding', 'true');
            } catch (_) {}
            navigateTo('onboarding');
          }}
          title="Open Common-Man Processor Onboarding"
          aria-label="Open Common-Man Processor Onboarding"
        >
          <span style={{ fontSize: '13px' }}>🍯</span>
          <span className="topbar-processor-label">Processor Mode</span>
        </button>

        <button
          className={`topbar-network-btn ${!isOnline ? 'offline' : isSyncing ? 'syncing' : 'online'}`}
          onClick={!isOnline ? toggleOnlineMode : pendingSyncCount > 0 ? triggerSync : toggleOnlineMode}
          title={isOnline ? "Tap to simulate field offline mode" : "Tap to reconnect"}
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
              <span>Offline {pendingSyncCount > 0 && `(${pendingSyncCount})`}</span>
            </>
          ) : (
            <>
              <Wifi size={13} strokeWidth={2} />
              <span>{pendingSyncCount > 0 ? `${pendingSyncCount} pending` : 'Connected'}</span>
            </>
          )}
        </button>
      </div>

      <style>{`
        .topbar {
          padding: 16px var(--mobile-pad) 12px;
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
          gap: 2px;
        }

        .topbar-apiary-name {
          color: var(--theme-text-secondary, var(--color-warm-gray));
          letter-spacing: 0.05em;
        }

        .topbar-title {
          font-size: 19px;
          font-weight: 700;
          color: var(--theme-text-primary, var(--color-deep-cocoa));
          line-height: 1.25;
          letter-spacing: -0.01em;
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .topbar-processor-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-badge, 16px);
          font-size: 12px;
          font-weight: 600;
          border: 1px solid rgba(217, 119, 6, 0.4);
          background-color: #FEF3C7;
          color: #92400E;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .topbar-processor-btn:hover {
          background-color: #FDE68A;
          border-color: #D97706;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(217, 119, 6, 0.15);
        }

        @media (max-width: 520px) {
          .topbar-processor-label {
            display: none;
          }
        }

        .topbar-network-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 11px;
          border-radius: var(--radius-badge);
          font-size: 12px;
          font-weight: 500;
          border: 1px solid var(--theme-border, var(--color-divider));
          background-color: var(--theme-surface, var(--color-soft-ivory));
          color: var(--theme-text-secondary, var(--color-warm-gray));
          cursor: pointer;
          transition: background-color 0.15s ease;
          user-select: none;
        }

        .topbar-network-btn:hover {
          background-color: var(--theme-surface-hover, #FAF2E4);
        }

        .topbar-network-btn.online {
          color: var(--color-healthy);
          border-color: rgba(79, 122, 82, 0.25);
          background-color: rgba(79, 122, 82, 0.08);
        }

        .topbar-network-btn.offline {
          color: var(--color-attention);
          border-color: rgba(217, 130, 43, 0.3);
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
