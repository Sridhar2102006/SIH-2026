import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Layers,
  Play
} from 'lucide-react';

export const ZeroPermissionFallback = ({
  operatorName = 'Apiarist',
  onReviewAccess,
  onSelectDemoPersona
}) => {
  return (
    <div className="hv-zero-perm-container">
      <div className="hv-zero-perm-card">
        <div className="hv-zero-icon-wrap">
          <ShieldAlert size={32} color="#B87316" strokeWidth={1.8} />
        </div>

        <h2 className="hv-zero-title">Your workspace is being prepared</h2>
        <p className="hv-zero-desc">
          Welcome to HoneyChain, {operatorName}. Your workspace access has not been configured for any operational areas yet.
        </p>

        <div className="hv-zero-steps-box">
          <span className="hv-zsb-title">What happens next:</span>
          <div className="hv-zsb-step">
            <span className="hv-zsb-num">1</span>
            <div>
              <strong className="hv-zsb-bold">Declare your work context</strong>
              <p className="hv-zsb-sub">Select your apiary, extraction, laboratory or fulfillment responsibilities.</p>
            </div>
          </div>
          <div className="hv-zsb-step">
            <span className="hv-zsb-num">2</span>
            <div>
              <strong className="hv-zsb-bold">Confirm your work designations</strong>
              <p className="hv-zsb-sub">Beekeeper, Processor, Quality Specialist, Verifier or Distributor.</p>
            </div>
          </div>
          <div className="hv-zsb-step">
            <span className="hv-zsb-num">3</span>
            <div>
              <strong className="hv-zsb-bold">Dynamic workspace unlocks</strong>
              <p className="hv-zsb-sub">Your personalized dashboard will automatically compose around your authorized duties.</p>
            </div>
          </div>
        </div>

        <button className="hv-zero-primary-cta" onClick={onReviewAccess}>
          <UserCheck size={16} />
          <span>Review & Configure Workspace Access</span>
          <ArrowRight size={15} />
        </button>

        {onSelectDemoPersona && (
          <div className="hv-zero-demo-hint">
            <span className="hv-zdh-text">Evaluating HoneyChain?</span>
            <button className="hv-zdh-btn" onClick={onSelectDemoPersona}>
              <Play size={13} color="#D99A24" /> Select an Operational Demo Persona
            </button>
          </div>
        )}
      </div>

      <style>{`
        .hv-zero-perm-container {
          padding: 24px 0;
          display: flex;
          justify-content: center;
        }
        .hv-zero-perm-card {
          background: #FFFDF8;
          border: 1.5px solid #EDE2D1;
          border-radius: 20px;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          box-shadow: 0 4px 20px rgba(52, 38, 27, 0.05);
          width: 100%;
          max-width: 440px;
        }
        .hv-zero-icon-wrap {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .hv-zero-title {
          font-size: 19px;
          font-weight: 800;
          color: #34261B;
          margin: 0;
          letter-spacing: -0.2px;
        }
        .hv-zero-desc {
          font-size: 13.5px;
          color: #786D61;
          line-height: 1.45;
          margin: 0;
        }
        .hv-zero-steps-box {
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-radius: 14px;
          padding: 14px 16px;
          text-align: left;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .hv-zsb-title {
          font-size: 11.5px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #786D61;
        }
        .hv-zsb-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .hv-zsb-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #D99A24;
          color: #FFF;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .hv-zsb-bold {
          font-size: 13px;
          font-weight: 750;
          color: #34261B;
          display: block;
        }
        .hv-zsb-sub {
          font-size: 12px;
          color: #786D61;
          margin: 2px 0 0;
          line-height: 1.35;
        }
        .hv-zero-primary-cta {
          width: 100%;
          background: #D99A24;
          color: #FFF;
          border: none;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 750;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 14px rgba(217, 154, 36, 0.25);
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .hv-zero-primary-cta:hover {
          background: #C4871A;
          transform: translateY(-1px);
        }
        .hv-zero-demo-hint {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }
        .hv-zdh-text {
          font-size: 11.5px;
          color: #786D61;
        }
        .hv-zdh-btn {
          background: none;
          border: 1px dashed #D99A24;
          color: #B87316;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
      `}</style>
    </div>
  );
};
