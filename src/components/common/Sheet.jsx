import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Sheet = ({ isOpen, onClose, title, subtitle, children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sheetContent = (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet-container" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <div>
            <h3 className="heading-card">{title}</h3>
            {subtitle && <p className="supporting-text" style={{ marginTop: '2px' }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="sheet-close-btn"
            aria-label="Close sheet"
          >
            <X size={18} />
          </button>
        </div>
        <div className="sheet-body">
          {children}
        </div>
      </div>

      <style>{`
        .sheet-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(43, 27, 23, 0.65);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 1200;
          padding: 0;
          box-sizing: border-box;
          animation: fadeInModal 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (min-width: 480px) {
          .sheet-backdrop {
            align-items: center;
            padding: 16px;
          }
        }

        .sheet-container {
          width: 100%;
          max-width: 440px;
          background-color: var(--theme-surface, var(--color-warm-cream, #FBF8F2));
          border-radius: 20px 20px 0 0;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 -8px 36px rgba(0, 0, 0, 0.22);
          overflow: hidden;
          animation: slideUpModal 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (min-width: 480px) {
          .sheet-container {
            border-radius: 20px;
            max-height: 85vh;
          }
        }

        .sheet-handle {
          width: 38px;
          height: 4px;
          background: var(--color-divider, #E8DFD1);
          border-radius: 2px;
          margin: 10px auto 4px;
          flex-shrink: 0;
        }

        .sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px 14px;
          border-bottom: 1px solid var(--theme-border, var(--color-divider, #E8DFD1));
          flex-shrink: 0;
        }

        .sheet-body {
          padding: 16px 20px 24px;
          overflow-y: auto;
          flex: 1;
          -webkit-overflow-scrolling: touch;
        }

        .sheet-close-btn {
          background: rgba(120, 109, 97, 0.08);
          border: none;
          color: var(--color-warm-gray);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .sheet-close-btn:hover {
          background: rgba(120, 109, 97, 0.16);
          color: var(--color-deep-cocoa);
        }
      `}</style>
    </div>
  );

  const mountTarget = typeof document !== 'undefined'
    ? (document.querySelector('.app-viewport') || document.body)
    : null;

  return mountTarget ? createPortal(sheetContent, mountTarget) : sheetContent;
};
