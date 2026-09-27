import React, { useState } from 'react';
import { Sheet } from '../common/Sheet';
import {
  Cpu,
  Wifi,
  BatteryCharging,
  Radio,
  Clock,
  Thermometer,
  Droplets,
  Activity,
  Camera,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const HiveTechnicalSheet = ({ isOpen, onClose, hive }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!hive) return null;

  const esp = hive.esp32 || {
    deviceId: `ESP32-HC-${hive.code || '01'}`,
    macAddress: `E8:6B:EA:91:2C:${hive.code || '01'}`,
    firmware: 'v2.4.1-honey-field',
    protocol: 'LoRaWAN 868MHz + Cellular Mesh',
    rssi: '-68 dBm (Good)',
    battery: 92,
    lastTelemetry: '2 min ago'
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('Colony observations verified. Sensor bus and camera link responsive.');
    }, 1200);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Technical Details & Hardware">
      <div className="tech-sheet-body">
        {/* Notice explaining device vs hive health */}
        <div className="tech-notice-box">
          <ShieldCheck size={16} color="#B87316" className="tech-notice-icon" />
          <p className="tech-notice-text">
            <strong>Device status ≠ Colony health.</strong> Hardware telemetry provides supporting environmental context, not a diagnosis.
          </p>
        </div>

        {/* Monitoring Device Summary */}
        <div className="tech-section-block">
          <span className="tech-section-label">Monitoring Device</span>
          <div className="tech-card">
            <div className="tech-row">
              <span className="tech-label">Hardware Controller</span>
              <strong className="tech-val">ESP32-WROOM-32E (Solar)</strong>
            </div>
            <div className="tech-row">
              <span className="tech-label">Device Identifier</span>
              <code className="tech-code">{esp.deviceId}</code>
            </div>
            <div className="tech-row">
              <span className="tech-label">Hardware MAC</span>
              <code className="tech-code">{esp.macAddress}</code>
            </div>
            <div className="tech-row">
              <span className="tech-label">Firmware</span>
              <span className="tech-val">{esp.firmware}</span>
            </div>
          </div>
        </div>

        {/* Sensor Array Status */}
        <div className="tech-section-block">
          <span className="tech-section-label">Sensor Array Status</span>
          <div className="tech-sensors-list">
            <div className="tech-sensor-item">
              <div className="tech-sensor-left">
                <Thermometer size={16} color="var(--color-sage)" />
                <div>
                  <strong className="tech-sensor-name">Core Temperature Probe</strong>
                  <span className="tech-sensor-sub">DS18B20 digital bus</span>
                </div>
              </div>
              <span className="tech-badge healthy">
                <CheckCircle2 size={12} /> Active ({hive.temp || 29.1}°C)
              </span>
            </div>

            <div className="tech-sensor-item">
              <div className="tech-sensor-left">
                <Droplets size={16} color="var(--color-sage)" />
                <div>
                  <strong className="tech-sensor-name">Hive Humidity Sensor</strong>
                  <span className="tech-sensor-sub">SHT31 hermetic seal</span>
                </div>
              </div>
              <span className="tech-badge healthy">
                <CheckCircle2 size={12} /> Active ({hive.humidity || 56}%)
              </span>
            </div>

            <div className="tech-sensor-item">
              <div className="tech-sensor-left">
                <Activity size={16} color="var(--color-primary-honey)" />
                <div>
                  <strong className="tech-sensor-name">Acoustic & Vibration</strong>
                  <span className="tech-sensor-sub">Piezoelectric MEMS</span>
                </div>
              </div>
              <span className="tech-badge healthy">
                <CheckCircle2 size={12} /> Resonant ({hive.vibrationText || 'Stable'})
              </span>
            </div>

            <div className="tech-sensor-item">
              <div className="tech-sensor-left">
                <Camera size={16} color="var(--color-deep-honey)" />
                <div>
                  <strong className="tech-sensor-name">Frame Vision Module</strong>
                  <span className="tech-sensor-sub">On-demand macro focus</span>
                </div>
              </div>
              <span className="tech-badge healthy">
                <CheckCircle2 size={12} /> Ready
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry & Connection */}
        <div className="tech-section-block">
          <span className="tech-section-label">Connection & Power</span>
          <div className="tech-card">
            <div className="tech-row">
              <span className="tech-label">Transmission Mode</span>
              <span className="tech-val">{esp.protocol}</span>
            </div>
            <div className="tech-row">
              <span className="tech-label">Signal Strength (RSSI)</span>
              <span className="tech-val">{esp.rssi}</span>
            </div>
            <div className="tech-row">
              <span className="tech-label">Battery Level</span>
              <span className="tech-val" style={{ color: 'var(--color-healthy)', fontWeight: 600 }}>
                {esp.battery}% (LiFePO4 Solar)
              </span>
            </div>
            <div className="tech-row">
              <span className="tech-label">Last Communication</span>
              <span className="tech-val">{hive.lastUpdate || esp.lastTelemetry || '2 min ago'}</span>
            </div>
            <div className="tech-row">
              <span className="tech-label">Ledger Sync</span>
              <span className="tech-val" style={{ color: 'var(--color-healthy)' }}>
                Anchored & Verifiable
              </span>
            </div>
          </div>
        </div>

        {/* Hardware Reconnection Test */}
        {testResult ? (
          <div className="tech-test-success">
            <CheckCircle2 size={16} color="var(--color-healthy)" />
            <span>{testResult}</span>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={handleTestConnection}
            disabled={isTesting}
          >
            {isTesting ? (
              <>
                <RefreshCw size={15} className="spin-icon" />
                <span>Pinging ESP32 controller…</span>
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                <span>Test device ping</span>
              </>
            )}
          </button>
        )}
      </div>

      <style>{`
        .tech-sheet-body {
          padding: 8px 4px 16px;
        }

        .tech-notice-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background-color: #FAF4E9;
          border: 1px solid var(--color-divider);
          border-radius: 12px;
          margin-bottom: 18px;
        }

        .tech-notice-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .tech-notice-text {
          font-size: 13px;
          line-height: 1.45;
          color: var(--color-deep-cocoa);
        }

        .tech-section-block {
          margin-bottom: 18px;
        }

        .tech-section-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-warm-gray);
          margin-bottom: 8px;
        }

        .tech-card {
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tech-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13.5px;
          border-bottom: 1px solid rgba(237, 226, 209, 0.4);
          padding-bottom: 6px;
        }

        .tech-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .tech-label {
          color: var(--color-warm-gray);
        }

        .tech-val {
          color: var(--color-deep-cocoa);
          font-weight: 500;
        }

        .tech-code {
          font-family: monospace;
          font-size: 12px;
          background-color: #F8EFE0;
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--color-deep-cocoa);
        }

        .tech-sensors-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tech-sensor-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          border-radius: 12px;
          padding: 10px 14px;
        }

        .tech-sensor-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tech-sensor-name {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .tech-sensor-sub {
          display: block;
          font-size: 11.5px;
          color: var(--color-warm-gray);
        }

        .tech-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 9999px;
        }

        .tech-badge.healthy {
          background-color: var(--color-healthy-tint);
          color: var(--color-healthy);
        }

        .tech-test-success {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background-color: var(--color-healthy-tint);
          border: 1px solid rgba(79, 122, 82, 0.2);
          border-radius: 10px;
          font-size: 13px;
          color: var(--color-healthy);
          font-weight: 500;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Sheet>
  );
};
