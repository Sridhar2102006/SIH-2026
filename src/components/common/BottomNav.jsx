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
  MoreHorizontal,
  MessageSquare
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
  MoreHorizontal,
  MessageSquare
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
          box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.06);
          transition: background-color 0.2s ease, border-color 0.2s ease;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .bottom-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-around;
          height: 68px;
          padding: 0 4px;
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
          transition: all 0.2s ease;
          border-radius: var(--radius-button);
          font-family: inherit;
        }

        .nav-item:active {
          transform: scale(0.92);
        }

        .nav-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 28px;
          border-radius: 14px;
          transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nav-badge {
          position: absolute;
          top: -5px;
          right: -6px;
          min-width: 17px;
          height: 17px;
          border-radius: 9px;
          background: #25D366;
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.28);
          line-height: 1;
          letter-spacing: -0.2px;
          z-index: 2;
        }

        .nav-label {
          font-size: 10.5px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.01em;
          transition: all 0.2s ease;
        }

        /* Active state */
        .nav-item.active {
          color: var(--theme-nav-active, var(--color-deep-honey));
        }

        .nav-item.active .nav-icon-wrapper {
          background-color: var(--color-primary-honey-tint, rgba(217, 154, 36, 0.14));
          transform: translateY(-1px);
        }

        .nav-item.active .nav-label {
          font-weight: 700;
          color: var(--theme-nav-active, var(--color-deep-honey));
        }

        /* Lab Specific BottomNav Overrides */
        .module-lab .bottom-nav {
          background-color: rgba(255, 255, 255, 0.98);
          border-top: 1px solid #E2E8F0;
          box-shadow: 0 -2px 16px rgba(15, 23, 42, 0.05);
        }
        .module-lab .nav-item {
          color: #64748B;
        }
        .module-lab .nav-item.active {
          color: #2563EB;
        }
        .module-lab .nav-item.active .nav-icon-wrapper {
          background-color: #EFF6FF;
          color: #2563EB;
        }
        .module-lab .nav-item.active .nav-label {
          color: #2563EB;
          font-weight: 700;
        }

        /* Processor-specific active color */
        .module-processor .nav-item.active {
          color: var(--color-processor-amber, #D97706);
        }
        .module-processor .nav-item.active .nav-icon-wrapper {
          background-color: rgba(217, 119, 6, 0.12);
        }
        .module-processor .nav-item.active .nav-label {
          color: var(--color-processor-amber, #D97706);
        }

        /* Dispatch-specific active color */
        .module-dispatch .nav-item.active {
          color: var(--color-dispatch-blue, #0284C7);
        }
        .module-dispatch .nav-item.active .nav-icon-wrapper {
          background-color: rgba(2, 132, 199, 0.1);
        }
        .module-dispatch .nav-item.active .nav-label {
          color: var(--color-dispatch-blue, #0284C7);
        }
      `}</style>
    </nav>
  );
};
