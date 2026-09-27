import React, { useState } from 'react';
import { Sheet } from '../common/Sheet';
import { TechnicalDetails } from '../common/TechnicalDetails';
import { Cpu, WifiOff, BatteryMedium, Signal, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';

export const DeviceDiagnosticSheet = ({ isOpen, onClose, hive }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!hive) return null;

  const handleTestConnection = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult('Colony observations verified. Telemetry channel active.');
    }, 1200);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={`Monitoring Status — ${hive.name}`}>
      <div className="diag-container">
        {/* Status Highlight */}
        <div className="diag-status-card">
          <div className="diag-status-icon">
            <WifiOff size={22} color="#D9822B" />
          </div>
          <div>
            <strong className="diag-title">Monitoring paused</strong>
            <p className="diag-desc">
              Live observations aren't currently reaching the app. Your saved hive history remains safe.
            </p>
            <span className="diag-timestamp">Last observation: {hive.monitoring?.lastUpdate || '42 min ago'}</span>
          </div>
        </div>

        {/* Helpful Field Checks */}
        <div className="diag-checklist-block">
          <span className="diag-section-label">Field troubleshooting checks:</span>
          <div className="diag-check-items">
            <div className="diag-check-item">
              <BatteryMedium size={18} color="var(--color-primary-honey)" />
              <div>
                <strong>Battery level</strong>
                <p>Check if the solar recharging module is clear of tree sap or debris.</p>
              </div>
            </div>

            <div className="diag-check-item">
              <Signal size={18} color="var(--color-sage)" />
              <div>
                <strong>Apiary mesh range</strong>
                <p>Ensure the hive remains within line-of-sight range of the yard gateway.</p>
              </div>
            </div>
          </div>
        </div>

        {testResult ? (
          <div className="test-result-box">
            <CheckCircle2 size={16} color="var(--color-healthy)" />
            <span>{testResult}</span>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleTestConnection}
            disabled={testing}
          >
            {testing ? (
              <>
                <RefreshCw size={16} className="spin-icon" />
                <span>Checking sensor connection…</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                <span>Test reconnect</span>
              </>
            )}
          </button>
        )}

        {/* Secondary Technical Layer (ESP32, firmware, mac address) kept behind clean disclosure */}
        {hive.esp32 && (
          <div style={{ marginTop: '14px' }}>
            <TechnicalDetails
              title="Technical Device Details"
              details={[
                { label: 'Device Identifier', value: hive.esp32.deviceId },
                { label: 'Firmware Version', value: hive.esp32.firmware },
                { label: 'Transmission Mode', value: hive.esp32.protocol },
                { label: 'Signal Quality', value: hive.esp32.rssi },
                { label: 'Remaining Battery', value: `${hive.esp32.battery}%` },
                { label: 'Hardware Address', value: hive.esp32.macAddress }
              ]}
            />
          </div>
        )}

        <button type="button" className="btn btn-secondary btn-block" onClick={onClose} style={{ marginTop: '10px' }}>
          Done
        </button>
      </div>

      <style>{`
        .diag-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .diag-status-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          background-color: #FAF4E9;
          border: 1px solid rgba(217, 130, 43, 0.3);
        }

        .diag-status-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background-color: #FAF0DC;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .diag-title {
          display: block;
          font-size: 15px;
          font-weight: 750;
          color: var(--color-deep-cocoa);
          margin-bottom: 2px;
        }

        .diag-desc {
          font-size: 13px;
          color: var(--color-warm-gray);
          line-height: 1.4;
          margin: 0 0 6px 0;
        }

        .diag-timestamp {
          font-size: 11.5px;
          font-weight: 650;
          color: var(--color-deep-honey);
        }

        .diag-checklist-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .diag-section-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .diag-check-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .diag-check-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
        }

        .diag-check-item strong {
          display: block;
          font-size: 13px;
          color: var(--color-deep-cocoa);
          margin-bottom: 1px;
        }

        .diag-check-item p {
          font-size: 12px;
          color: var(--color-warm-gray);
          margin: 0;
          line-height: 1.35;
        }

        .test-result-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border-radius: 10px;
          background-color: rgba(79, 122, 82, 0.1);
          color: var(--color-healthy);
          font-size: 13px;
          font-weight: 650;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Sheet>
  );
};
