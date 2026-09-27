import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Home,
  Layers,
  ClipboardCheck,
  Activity,
  Droplet,
  Cpu,
  Workflow,
  FlaskConical,
  TestTube,
  ShieldCheck,
  Package,
  PackageCheck,
  MapPin,
  ShoppingBag,
  Truck,
  QrCode,
  Compass,
  MoreHorizontal
} from 'lucide-react';

const ICON_MAP = {
  Home,
  Layers,
  ClipboardCheck,
  Activity,
  Droplet,
  Compass,
  Cpu,
  Workflow,
  FlaskConical,
  TestTube,
  ShieldCheck,
  Package,
  PackageCheck,
  MapPin,
  ShoppingBag,
  Truck,
  QrCode,
  MoreHorizontal
};

export const BottomNav = () => {
  const { activeTab, setActiveTab, workspace } = useAppState();

  // Dynamic navigation items from the capability workspace, fallback to default 4
  const navItems = (workspace?.navigation && workspace.navigation.length > 0)
    ? workspace.navigation
    : [
        { id: 'home', label: 'Home', iconName: 'Home' },
        { id: 'hives', label: 'Hives', iconName: 'Layers' },
        { id: 'honey', label: 'Honey', iconName: 'Droplet' },
        { id: 'more', label: 'More', iconName: 'MoreHorizontal' },
      ];

  return (
    <nav className="bottom-nav" aria-label="Main Navigation">
      <div className="bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.iconName] || Home;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              aria-selected={isActive}
              role="tab"
            >
              <div className="nav-icon-wrapper">
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.7} />
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .bottom-nav {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: var(--theme-nav-bg, var(--color-soft-ivory));
          border-top: 1px solid var(--theme-border, var(--color-divider));
          z-index: 50;
          padding-bottom: var(--safe-bottom);
          box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        .bottom-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-around;
          height: 64px;
          padding: 0 8px;
        }

        .nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--theme-text-secondary, var(--color-warm-gray));
          cursor: pointer;
          padding: 6px 0;
          height: 100%;
          transition: all 0.15s ease;
          border-radius: var(--radius-button);
        }

        .nav-item:active {
          transform: scale(0.94);
        }

        .nav-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 26px;
          border-radius: 14px;
          transition: all 0.2s ease;
        }

        .nav-badge {
          position: absolute;
          top: -2px;
          right: -4px;
          min-width: 14px;
          height: 14px;
          border-radius: 7px;
          background: #DC2626;
          color: #FFF;
          font-size: 9px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
        }

        .nav-label {
          font-size: 11px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.01em;
        }

        .nav-item.active {
          color: var(--theme-text-primary, var(--color-deep-cocoa));
        }

        .nav-item.active .nav-icon-wrapper {
          color: var(--theme-nav-active, var(--color-deep-honey));
          background-color: var(--color-primary-honey-tint);
        }

        .nav-item.active .nav-label {
          font-weight: 700;
          color: var(--theme-text-primary, var(--color-deep-cocoa));
        }

        /* Lab Specific BottomNav Overrides */
        .module-lab .bottom-nav {
          background-color: #FFFFFF;
          border-top: 1px solid #E2E8F0;
          box-shadow: 0 -2px 10px rgba(15, 23, 42, 0.04);
        }
        .module-lab .nav-item {
          color: #64748B;
        }
        .module-lab .nav-item.active {
          color: #2563EB;
        }
        .module-lab .nav-item.active .nav-icon-wrapper {
          color: #2563EB;
          background-color: #EFF6FF;
        }
        .module-lab .nav-item.active .nav-label {
          color: #2563EB;
          font-weight: 700;
        }
      `}</style>
    </nav>
  );
};
