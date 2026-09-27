import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export const AccessDeniedView = ({
  attemptedRoute = 'Restricted Workspace',
  requiredCapabilities = [],
  userCapabilities = [],
  onReturn
}) => {
  return (
    <div className="access-denied-viewport">
      <div className="access-denied-card">
        <div className="access-denied-icon-wrap">
          <ShieldAlert size={36} color="#B85450" />
        </div>

        <span className="access-denied-badge">403 FORBIDDEN</span>
        <h1 className="access-denied-title">Access Restricted</h1>

        <p className="access-denied-text">
          Your active session lacks the required operational capabilities to access{' '}
          <strong>{attemptedRoute}</strong>.
        </p>

        {requiredCapabilities.length > 0 && (
          <div className="access-caps-box">
            <span className="access-caps-label">Required Capability:</span>
            <div className="access-caps-pills">
              {requiredCapabilities.map(cap => (
                <span key={cap} className="access-cap-pill">
                  <Lock size={11} />
                  <span>{cap}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="access-denied-actions">
          <button
            type="button"
            className="btn btn-primary access-return-btn"
            onClick={onReturn}
          >
            <ArrowLeft size={16} />
            <span>Return to Authorized Workspace</span>
          </button>
        </div>
      </div>

      <style>{`
        .access-denied-viewport {
          padding: 24px var(--mobile-pad, 16px);
          height: 100%;
          min-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-warm-cream, #FFF9EF);
          box-sizing: border-box;
        }
        .access-denied-card {
          background: #FFFFFF;
          border: 1.5px solid rgba(184, 84, 80, 0.3);
          border-radius: 20px;
          padding: 32px 20px;
          max-width: 420px;
          width: 100%;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 8px 24px rgba(52, 38, 27, 0.08);
        }
        .access-denied-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(184, 84, 80, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .access-denied-badge {
          font-size: 11px;
          font-weight: 800;
          color: #B85450;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .access-denied-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0 0 8px;
        }
        .access-denied-text {
          font-size: 13.5px;
          color: var(--color-warm-gray, #786D61);
          line-height: 1.45;
          margin: 0 0 16px;
        }
        .access-caps-box {
          background: #FFFDF9;
          border: 1px solid var(--color-card-border, #E8DFD1);
          border-radius: 12px;
          padding: 10px 14px;
          width: 100%;
          margin-bottom: 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
        }
        .access-caps-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-warm-gray, #786D61);
          text-transform: uppercase;
        }
        .access-caps-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .access-cap-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(184, 84, 80, 0.1);
          color: #B85450;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }
        .access-denied-actions {
          width: 100%;
        }
        .access-return-btn {
          width: 100%;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};
