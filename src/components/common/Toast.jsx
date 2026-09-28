import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const Toast = ({ message }) => {
  if (!message) return null;

  return (
    <div className="toast-notification">
      <CheckCircle2 size={16} color="var(--color-healthy)" />
      <span>{message}</span>

      <style>{`
        .toast-notification {
          position: absolute;
          top: 72px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--color-deep-cocoa);
          color: #FFFDF8;
          padding: 10px 18px;
          border-radius: var(--radius-badge);
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(52, 38, 27, 0.25);
          z-index: 100000;
          animation: slideDownFade 0.25s ease-out;
          white-space: nowrap;
        }

        @keyframes slideDownFade {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
};
