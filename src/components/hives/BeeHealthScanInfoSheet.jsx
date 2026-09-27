import React from 'react';
import { Sheet } from '../common/Sheet';
import { Camera, ShieldCheck, AlertTriangle, Eye, CheckCircle2, Info } from 'lucide-react';

export const BeeHealthScanInfoSheet = ({ isOpen, onClose }) => {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="How Bee Health Scan Works">
      <div className="scan-info-container">
        <p className="scan-info-lead">
          Bee Health Scan is an assistive field tool that helps you examine brood frames for visual signs of common colony concerns.
        </p>

        <div className="scan-info-card">
          <div className="scan-info-icon-box">
            <Camera size={20} color="#B87316" />
          </div>
          <div className="scan-info-body">
            <strong>1. Capture on demand</strong>
            <p>
              Take a focused, well-lit photo of a brood comb during your regular field inspection. No continuous streaming or intrusive hardware required.
            </p>
          </div>
        </div>

        <div className="scan-info-card">
          <div className="scan-info-icon-box">
            <Eye size={20} color="#71845B" />
          </div>
          <div className="scan-info-body">
            <strong>2. Visual pattern screening</strong>
            <p>
              The system screens for specific visual irregularities such as spotty brood patterns, sunken or punctured cappings, and abnormal larval color.
            </p>
          </div>
        </div>

        <div className="scan-info-card">
          <div className="scan-info-icon-box">
            <ShieldCheck size={20} color="#4F7A52" />
          </div>
          <div className="scan-info-body">
            <strong>3. Supported screening scope</strong>
            <div className="scan-scope-tags">
              <span className="scan-scope-pill">American foulbrood</span>
              <span className="scan-scope-pill">European foulbrood</span>
              <span className="scan-scope-pill">Varroa-related visual signs</span>
              <span className="scan-scope-pill">Healthy brood</span>
            </div>
            <p style={{ marginTop: '6px', fontSize: '11.5px', color: '#786D61' }}>
              The tool does not claim to diagnose all bee ailments. Conditions outside this scope will return an unclear or unusual result.
            </p>
          </div>
        </div>

        <div className="scan-info-disclaimer-box">
          <Info size={16} color="#B87316" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Screening aid, not a definitive diagnosis</strong>
            <p>
              Image analysis cannot replace a complete colony inspection or professional laboratory testing. Never administer hive treatments without qualified confirmation.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={onClose}
          style={{ marginTop: '8px' }}
        >
          Got it
        </button>
      </div>

      <style>{`
        .scan-info-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .scan-info-lead {
          font-size: 13.5px;
          color: #34261B;
          line-height: 1.5;
          margin: 0;
        }
        .scan-info-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 12px 14px;
        }
        .scan-info-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #FFFDF8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #EDE2D1;
        }
        .scan-info-body {
          flex: 1;
        }
        .scan-info-body strong {
          display: block;
          font-size: 13.5px;
          font-weight: 750;
          color: #34261B;
          margin-bottom: 3px;
        }
        .scan-info-body p {
          font-size: 12.5px;
          color: #786D61;
          line-height: 1.4;
          margin: 0;
        }
        .scan-scope-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }
        .scan-scope-pill {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 650;
          color: #34261B;
          padding: 2px 7px;
        }
        .scan-info-disclaimer-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(217, 130, 43, 0.08);
          border: 1px solid rgba(217, 130, 43, 0.25);
          border-radius: 12px;
          padding: 12px 14px;
        }
        .scan-info-disclaimer-box strong {
          display: block;
          font-size: 12.5px;
          font-weight: 750;
          color: #B87316;
          margin-bottom: 2px;
        }
        .scan-info-disclaimer-box p {
          font-size: 12px;
          color: #786D61;
          line-height: 1.4;
          margin: 0;
        }
      `}</style>
    </Sheet>
  );
};
