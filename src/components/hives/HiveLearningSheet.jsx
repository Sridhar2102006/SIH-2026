import React from 'react';
import { Sheet } from '../common/Sheet';
import { Eye, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const HiveLearningSheet = ({ isOpen, onClose }) => {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="How Hive Monitoring Works">
      <div className="learning-container">
        <p className="learning-lead">
          HoneyChain helps you keep track of your bee colonies through gentle, non-invasive observation.
        </p>

        <div className="learning-step">
          <div className="step-num-icon">
            <Eye size={18} color="var(--color-primary-honey)" />
          </div>
          <div className="step-body">
            <strong>1. Your eyes & hands come first</strong>
            <p>
              Perform hands-on brood inspections, note the queen's laying pattern, and check temperament whenever you work in the yard.
            </p>
          </div>
        </div>

        <div className="learning-step">
          <div className="step-num-icon">
            <Activity size={18} color="var(--color-sage)" />
          </div>
          <div className="step-body">
            <strong>2. Continuous subtle rhythm</strong>
            <p>
              Optional non-invasive sensors measure colony temperature, moisture, and worker acoustics between inspections so you know when a hive needs review.
            </p>
          </div>
        </div>

        <div className="learning-step">
          <div className="step-num-icon">
            <ShieldCheck size={18} color="var(--color-healthy)" />
          </div>
          <div className="step-body">
            <strong>3. Traceability from hive to jar</strong>
            <p>
              Every honey harvest links back directly to the hives that produced it, giving you verified origin records and complete batch history.
            </p>
          </div>
        </div>

        <button type="button" className="btn btn-primary btn-block" onClick={onClose} style={{ marginTop: '12px' }}>
          Got it
        </button>
      </div>

      <style>{`
        .learning-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .learning-lead {
          font-size: 14px;
          color: var(--color-deep-cocoa);
          line-height: 1.45;
          margin: 0;
        }

        .learning-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
        }

        .step-num-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background-color: #FAF4E9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-body strong {
          display: block;
          font-size: 14px;
          color: var(--color-deep-cocoa);
          margin-bottom: 2px;
        }

        .step-body p {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          line-height: 1.4;
          margin: 0;
        }
      `}</style>
    </Sheet>
  );
};
