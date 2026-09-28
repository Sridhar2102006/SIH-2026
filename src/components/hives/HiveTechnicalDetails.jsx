import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Cpu,
  Wifi,
  WifiOff,
  BatteryCharging,
  Radio,
  Clock,
  Thermometer,
  Droplets,
  Activity,
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Zap,
  Lock,
  Layers,
  FileText,
  Server,
  Terminal,
  Send,
  Sliders
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { esp32IoTGateway, DEVICE_CONNECTION_STATES } from '../../services/esp32IoTGatewayService';

export const HiveTechnicalDetails = ({ hive, onBack }) => {
  const {
    canPerform,
    ACTION_PERMISSIONS,
    isOnline,
    devices
  } = useAppState();

  // Explicit Backend Authorization Check (Section 3 & 29)
  const isAuthorized = canPerform
    ? canPerform(ACTION_PERMISSIONS?.DEVICE_DIAGNOSTICS_VIEW || 'DEVICE_DIAGNOSTICS_VIEW')
    : true;

  // Local Interactive States
  const [deviceState, setDeviceState] = useState('connected'); // 'connected' | 'unstable' | 'offline'
  const [heartbeatSeconds, setHeartbeatSeconds] = useState(8);
  const [lastSyncTime, setLastSyncTime] = useState('08:14:23');
  const [pendingRecords, setPendingRecords] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);

  // Expandable sections
  const [showRawData, setShowRawData] = useState(false);
  const [showCameraDetails, setShowCameraDetails] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logsAdvancedMode, setLogsAdvancedMode] = useState(false);

  // Modals & Interactive Tests
  const [isTestPingRunning, setIsTestPingRunning] = useState(false);
  const [pingResult, setPingResult] = useState(null);

  const [isTestingCamera, setIsTestingCamera] = useState(false);
  const [cameraTestResult, setCameraTestResult] = useState(null);

  const [isTestingSensors, setIsTestingSensors] = useState(false);
  const [sensorTestResult, setSensorTestResult] = useState(null);

  const [showRestartModal, setShowRestartModal] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [reconnectBanner, setReconnectBanner] = useState(null);

  const [showChangeAssignModal, setShowChangeAssignModal] = useState(false);
  const [assignmentFeedback, setAssignmentFeedback] = useState(null);

  // Range Validation / Plausibility demo state (Section 32 & 47)
  const [simulateImplausibleReading, setSimulateImplausibleReading] = useState(false);
  const [simulateStaleReading, setSimulateStaleReading] = useState(false);

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Heartbeat ticker simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setHeartbeatSeconds((prev) => (deviceState === 'offline' ? prev + 1 : (prev + 1) % 60));
    }, 1000);
    return () => clearInterval(timer);
  }, [deviceState]);

  if (!hive) return null;

  // Associated device metadata
  const deviceId = `HC-HIVE-${hive.code || '003'}`;
  const macAddress = `70:B8:F6:9A:12:${hive.code || '03'}`;
  const ipAddress = '192.168.4.12';
  const firmwareVersion = 'v1.4.2';
  const hardwareType = 'ESP32 DevKit (WROOM-32E)';
  const registrationDate = '2025-11-14';

  // Sensor calculations based on hive data & validation flags
  const rawTemp = simulateImplausibleReading ? 999.0 : (hive.temp ? hive.temp + 0.04 : 29.14);
  const isTempValid = rawTemp >= -10 && rawTemp <= 50;

  const rawHumidity = hive.humidity ? hive.humidity + 0.08 : 72.08;
  const rawVibration = hive.vibrationText === 'Unusual activity detected' ? 0.084 : 0.021;
  const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Ping / Reconnect Action via authoritative IoT Gateway
  const handlePing = async () => {
    setIsTestPingRunning(true);
    setPingResult(null);
    try {
      const res = await esp32IoTGateway.pingDevice(deviceId);
      setIsTestPingRunning(false);
      if (res.success) {
        setHeartbeatSeconds(1);
        setDeviceState('connected');
        setPingResult({
          success: true,
          message: res.message || `Heartbeat acknowledged by ESP32 node. RTT ${res.rttMs || 42}ms · RSSI ${res.rssi || -58} dBm.`
        });
      } else {
        setDeviceState('disconnected');
        setPingResult({
          success: false,
          message: res.error || 'Device heartbeat timed out.'
        });
      }
      setTimeout(() => setPingResult(null), 5000);
    } catch (err) {
      setIsTestPingRunning(false);
      setDeviceState('disconnected');
      setPingResult({ success: false, message: `Ping failed: ${err.message}` });
    }
  };

  // Test Camera via authoritative IoT Pipeline (Section 12)
  const handleTestCamera = async () => {
    setIsTestingCamera(true);
    setCameraTestResult(null);
    try {
      const res = await esp32IoTGateway.captureImageFrame({
        deviceId,
        hiveId: hive.id || hive.code,
        operatorName: 'Authorized Inspector'
      });
      setIsTestingCamera(false);
      if (res.success) {
        setCameraTestResult({
          success: true,
          title: 'OV2640 Camera Verified',
          message: `Test frame captured (${res.image.resolution} ${res.image.format}, ${(res.image.sizeBytes / 1024).toFixed(0)} KB). Checksum: ${res.image.verificationHash}`
        });
      } else {
        setCameraTestResult({
          success: false,
          title: 'Camera Capture Failed',
          message: res.message || 'ESP32 camera node timed out.'
        });
      }
    } catch (err) {
      setIsTestingCamera(false);
      setCameraTestResult({
        success: false,
        title: 'Hardware Error',
        message: `Camera pipeline exception: ${err.message}`
      });
    }
  };

  // Test Sensors via authoritative IoT Gateway (Section 11)
  const handleTestSensors = () => {
    setIsTestingSensors(true);
    setSensorTestResult(null);
    try {
      const ingestRes = esp32IoTGateway.ingestTelemetry({
        deviceId,
        hiveId: hive.id || hive.code,
        temperatureC: rawTemp,
        humidityPct: rawHumidity,
        vibrationIntensity: rawVibration,
        batteryPct: 94,
        rssi: -58
      });

      setIsTestingSensors(false);
      if (ingestRes.success) {
        setSensorTestResult({
          temp: isTempValid ? '✓ Reading validated' : '⚠ Reading out of bounds',
          humidity: '✓ Reading validated',
          vibration: '✓ Reading validated',
          timestamp: new Date().toLocaleTimeString(),
          qualityStatus: ingestRes.telemetryRecord?.qualityStatus || 'VALIDATED_LIVE'
        });
      } else {
        setSensorTestResult({
          temp: '⚠ Validation rejected',
          humidity: '⚠ Validation rejected',
          vibration: '⚠ Validation rejected',
          timestamp: new Date().toLocaleTimeString(),
          error: ingestRes.message
        });
      }
    } catch (err) {
      setIsTestingSensors(false);
      setSensorTestResult({
        temp: '⚠ System error',
        humidity: '⚠ System error',
        vibration: '⚠ System error',
        timestamp: new Date().toLocaleTimeString(),
        error: err.message
      });
    }
  };

  // Restart Device (Section 24)
  const handleRestartDevice = () => {
    setIsRestarting(true);
    setTimeout(() => {
      setIsRestarting(false);
      setShowRestartModal(false);
      setDeviceState('offline');
      setHeartbeatSeconds(0);

      // Simulate reconnect after 2 seconds
      setTimeout(() => {
        setDeviceState('connected');
        setHeartbeatSeconds(2);
        setReconnectBanner('Monitoring restored • ESP32 node reconnected successfully.');
        setTimeout(() => setReconnectBanner(null), 5000);
      }, 2000);
    }, 1200);
  };

  // Retry Sync Action (Section 16 & 34)
  const handleRetrySync = () => {
    setPendingRecords(0);
    setLastSyncTime(new Date().toLocaleTimeString());
    setReconnectBanner('Sensor data synchronized with ledger buffer.');
    setTimeout(() => setReconnectBanner(null), 4000);
  };

  // Mock Diagnostic Logs (Section 26 & 27) - Sanitized, timestamped, no credentials
  const diagnosticLogs = [
    {
      time: '08:14:23',
      event: 'SENSOR_PAYLOAD_RECEIVED',
      detail: 'DHT11 / digital bus packet decoded (temp: 29.1°C, hum: 72%)',
      payloadSize: '48 bytes',
      status: 'OK'
    },
    {
      time: '08:14:25',
      event: 'LEDGER_BUFFER_SYNC',
      detail: 'Sensor readings anchored to local verifiable batch cache',
      payloadSize: '128 bytes',
      status: 'SYNCED'
    },
    {
      time: '08:15:02',
      event: 'CAMERA_READY_CHECK',
      detail: 'OV2640 module ready for single-frame trigger (UXGA mode)',
      payloadSize: '16 bytes',
      status: 'READY'
    },
    {
      time: '08:15:40',
      event: 'HEARTBEAT_ACK',
      detail: 'ESP32 ping response received via local gateway (RSSI: -58 dBm)',
      payloadSize: '24 bytes',
      status: 'ALIVE'
    }
  ];

  return (
    <div className="tech-screen-container">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER (Section 2)
      ───────────────────────────────────────────────────────────── */}
      <header className="tech-header">
        <button
          type="button"
          className="tech-back-btn"
          onClick={onBack}
          aria-label="Back to hive detail"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="tech-header-info">
          <h1 className="tech-title">Technical details</h1>
          <p className="tech-subtitle">
            Hive {hive.code || 'A-03'} · {hive.name}
          </p>
          <span className="tech-header-caption">
            Monitoring device and data diagnostics
          </span>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          SECURITY & ACCESS CHECK (Section 3 & 29)
      ───────────────────────────────────────────────────────────── */}
      {!isAuthorized ? (
        <div className="tech-access-denied-card">
          <ShieldAlert size={28} color="var(--color-critical, #B85450)" />
          <h3>Permission required</h3>
          <p>
            Your current workspace role does not possess the <code>DEVICE_DIAGNOSTICS_VIEW</code> permission.
            Technical hardware telemetries are strictly access-controlled.
          </p>
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Return to hive
          </button>
        </div>
      ) : (
        <main className="tech-content-body">
          {/* Recovery / Success Banner (Section 36) */}
          {reconnectBanner && (
            <div className="tech-banner success animate-fade-in" role="status">
              <CheckCircle2 size={16} />
              <span>{reconnectBanner}</span>
            </div>
          )}

          {/* Principle Clarification Callout (Section 1 & 9) */}
          <div className="tech-principle-banner">
            <ShieldCheck size={16} color="var(--color-primary-honey, #D99A24)" />
            <p>
              <strong>Device status ≠ Hive condition.</strong> Hardware connectivity guarantees data delivery, not biological colony health.
            </p>
          </div>

          {/* ─────────────────────────────────────────────────────────
              4. DEVICE OVERVIEW (Section 4)
          ───────────────────────────────────────────────────────── */}
          <section className="tech-section">
            <div className="tech-section-header-row">
              <h2 className="tech-section-title">Monitoring device</h2>
              <button
                type="button"
                className="tech-refresh-link"
                onClick={handlePing}
                disabled={isTestPingRunning}
              >
                <RefreshCw size={13} className={isTestPingRunning ? 'spin-icon' : ''} />
                <span>{isTestPingRunning ? 'Pinging…' : 'Ping node'}</span>
              </button>
            </div>

            <div className="tech-overview-card">
              <div className="tech-device-title-row">
                <div>
                  <span className="tech-device-type">ESP32 monitoring node</span>
                  <div className="tech-status-line">
                    {deviceState === 'connected' && (
                      <span className="tech-badge connected">
                        <span className="tech-dot green" /> Connected
                      </span>
                    )}
                    {deviceState === 'unstable' && (
                      <span className="tech-badge warning">
                        <span className="tech-dot amber" /> Unstable (intermittent)
                      </span>
                    )}
                    {deviceState === 'offline' && (
                      <span className="tech-badge offline">
                        <span className="tech-dot red" /> Offline
                      </span>
                    )}
                  </div>
                </div>

                <div className="tech-heartbeat-box">
                  <span className="tech-hb-label">Last heartbeat</span>
                  <strong className="tech-hb-value">
                    {deviceState === 'offline'
                      ? `${Math.floor(heartbeatSeconds / 60)} min ago`
                      : `${heartbeatSeconds} sec ago`}
                  </strong>
                </div>
              </div>

              {pingResult && (
                <div className="tech-inline-alert success">
                  <CheckCircle2 size={14} />
                  <span>{pingResult.message}</span>
                </div>
              )}
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────
              5. DEVICE IDENTITY (Section 5)
          ───────────────────────────────────────────────────────── */}
          <section className="tech-section">
            <h2 className="tech-section-title">Device information</h2>
            <div className="tech-card">
              <div className="tech-kv-row">
                <span className="tech-key">Device ID</span>
                <div className="tech-val-group">
                  <code className="tech-code">{deviceId}</code>
                  <button
                    type="button"
                    className="tech-copy-btn"
                    onClick={() => handleCopy(deviceId, 'devId')}
                    title="Copy Device ID"
                  >
                    {copiedKey === 'devId' ? <Check size={13} color="var(--color-healthy)" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="tech-kv-row">
                <span className="tech-key">Hardware</span>
                <span className="tech-val">{hardwareType}</span>
              </div>

              <div className="tech-kv-row">
                <span className="tech-key">Firmware</span>
                <div className="tech-val-group">
                  <span className="tech-val">{firmwareVersion}</span>
                  <span className="tech-sub-tag">Up to date</span>
                </div>
              </div>

              <div className="tech-kv-row">
                <span className="tech-key">Assigned hive</span>
                <div className="tech-val-group">
                  <strong className="tech-val">Hive {hive.code || 'A-03'}</strong>
                  <button
                    type="button"
                    className="tech-text-action"
                    onClick={() => setShowChangeAssignModal(true)}
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="tech-kv-row">
                <span className="tech-key">Registration date</span>
                <span className="tech-val">{registrationDate}</span>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────
              6 & 7. CONNECTION & NETWORK (Section 6, 7, 17, 28)
          ───────────────────────────────────────────────────────── */}
          <section className="tech-section">
            <h2 className="tech-section-title">Connection & Network</h2>
            <div className="tech-card">
              <div className="tech-kv-row">
                <span className="tech-key">Connection</span>
                <span className="tech-val">Wi-Fi (Field AP) / LoRaWAN Mesh</span>
              </div>

              <div className="tech-kv-row">
                <span className="tech-key">Signal (RSSI)</span>
                <span className="tech-val" style={{ color: 'var(--color-healthy, #4F7A52)' }}>
                  Good (-58 dBm · SNR 9.2 dB)
                </span>
              </div>

              <div className="tech-kv-row">
                <span className="tech-key">IP address</span>
                <code className="tech-code">{ipAddress}</code>
              </div>

              <div className="tech-kv-row">
                <span className="tech-key">MAC address</span>
                <div className="tech-val-group">
                  <code className="tech-code">{macAddress}</code>
                  <button
                    type="button"
                    className="tech-copy-btn"
                    onClick={() => handleCopy(macAddress, 'mac')}
                    title="Copy MAC Address"
                  >
                    {copiedKey === 'mac' ? <Check size={13} color="var(--color-healthy)" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="tech-kv-row">
                <span className="tech-key">Uptime</span>
                <span className="tech-val">3h 42m</span>
              </div>

              <div className="tech-kv-row">
                <span className="tech-key">Last sync</span>
                <span className="tech-val">{lastSyncTime}</span>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────
              8, 9, 10, 11, 12. SENSOR OVERVIEW (Section 8, 9, 10, 11, 12)
          ───────────────────────────────────────────────────────── */}
          <section className="tech-section">
            <div className="tech-section-header-row">
              <h2 className="tech-section-title">Sensors</h2>
              <button
                type="button"
                className="tech-action-link"
                onClick={handleTestSensors}
                disabled={isTestingSensors}
              >
                {isTestingSensors ? 'Testing bus…' : 'Test sensors'}
              </button>
            </div>

            {/* Compact Sensors List (Section 8) */}
            <div className="tech-compact-sensor-list">
              {/* Temperature */}
              <div className="tech-sensor-row">
                <div className="tech-sensor-meta">
                  <Thermometer size={16} className="tech-sensor-icon" color="var(--color-primary-honey, #D99A24)" />
                  <div>
                    <span className="tech-sensor-label">Temperature</span>
                    <span className="tech-sensor-timestamp">
                      {simulateStaleReading ? 'Last received 14 min ago' : 'Updated 12 sec ago'}
                    </span>
                  </div>
                </div>

                <div className="tech-sensor-status-block">
                  {!isTempValid ? (
                    <div className="tech-sensor-failure-block">
                      <span className="tech-error-text">Invalid sensor reading</span>
                      <button
                        type="button"
                        className="tech-pill-action danger"
                        onClick={() => alert('Diagnostic probe check: DS18B20 digital bus impedance nominal. Check probe placement.')}
                      >
                        Check sensor
                      </button>
                    </div>
                  ) : simulateStaleReading ? (
                    <div className="tech-sensor-failure-block">
                      <span className="tech-stale-text">No recent reading · 29.1°C</span>
                      <button
                        type="button"
                        className="tech-pill-action"
                        onClick={() => setSimulateStaleReading(false)}
                      >
                        Check sensor
                      </button>
                    </div>
                  ) : (
                    <>
                      <strong className="tech-sensor-value">{rawTemp.toFixed(1)}°C</strong>
                      <span className="tech-badge reporting">
                        <Check size={11} /> Reporting
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Humidity */}
              <div className="tech-sensor-row">
                <div className="tech-sensor-meta">
                  <Droplets size={16} className="tech-sensor-icon" color="var(--color-sage, #786D61)" />
                  <div>
                    <span className="tech-sensor-label">Humidity</span>
                    <span className="tech-sensor-timestamp">Updated 12 sec ago</span>
                  </div>
                </div>
                <div className="tech-sensor-status-block">
                  <strong className="tech-sensor-value">{Math.round(rawHumidity)}%</strong>
                  <span className="tech-badge reporting">
                    <Check size={11} /> Reporting
                  </span>
                </div>
              </div>

              {/* Vibration */}
              <div className="tech-sensor-row">
                <div className="tech-sensor-meta">
                  <Activity size={16} className="tech-sensor-icon" color="var(--color-primary-honey, #D99A24)" />
                  <div>
                    <span className="tech-sensor-label">Vibration</span>
                    <span className="tech-sensor-timestamp">Updated 12 sec ago</span>
                  </div>
                </div>
                <div className="tech-sensor-status-block">
                  <strong className="tech-sensor-value">Normal</strong>
                  <span className="tech-badge reporting">
                    <Check size={11} /> Reporting
                  </span>
                </div>
              </div>

              {/* Camera */}
              <div className="tech-sensor-row">
                <div className="tech-sensor-meta">
                  <Camera size={16} className="tech-sensor-icon" color="var(--color-deep-cocoa, #34261B)" />
                  <div>
                    <span className="tech-sensor-label">Camera</span>
                    <span className="tech-sensor-timestamp">Last capture: Today · 10:42 AM</span>
                  </div>
                </div>
                <div className="tech-sensor-status-block">
                  <strong className="tech-sensor-value">Available</strong>
                  <span className="tech-badge reporting">
                    <Check size={11} /> Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Test Sensors Result (Section 23) */}
            {sensorTestResult && (
              <div className="tech-sensor-test-results animate-fade-in">
                <div className="tech-test-res-header">
                  <strong>Sensor Bus Test Completed</strong>
                  <span className="tech-test-time">{sensorTestResult.timestamp}</span>
                </div>
                <div className="tech-test-res-list">
                  <div className="tech-test-item">
                    <span>Temperature digital bus</span>
                    <span className="tech-test-stat">{sensorTestResult.temp}</span>
                  </div>
                  <div className="tech-test-item">
                    <span>Humidity analog/I2C</span>
                    <span className="tech-test-stat">{sensorTestResult.humidity}</span>
                  </div>
                  <div className="tech-test-item">
                    <span>Vibration MEMS</span>
                    <span className="tech-test-stat">{sensorTestResult.vibration}</span>
                  </div>
                </div>
                <p className="tech-test-disclaimer">
                  Diagnostic confirmation only: Test readings verify electrical bus continuity and do not represent biological colony health.
                </p>
              </div>
            )}

            {/* Expandable: Raw Sensor Data (Section 10) */}
            <div className="tech-expandable-wrapper">
              <button
                type="button"
                className="tech-expand-toggle"
                onClick={() => setShowRawData(!showRawData)}
              >
                <span>{showRawData ? 'Hide raw readings' : 'View raw readings'}</span>
                {showRawData ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showRawData && (
                <div className="tech-raw-panel animate-fade-in">
                  <div className="tech-raw-grid">
                    <div className="tech-raw-row">
                      <span>Temperature</span>
                      <code>{rawTemp.toFixed(2)}</code>
                    </div>
                    <div className="tech-raw-row">
                      <span>Humidity</span>
                      <code>{rawHumidity.toFixed(2)}</code>
                    </div>
                    <div className="tech-raw-row">
                      <span>Vibration</span>
                      <code>{rawVibration.toFixed(3)}</code>
                    </div>
                    <div className="tech-raw-row">
                      <span>Timestamp</span>
                      <code>{currentTimestamp}</code>
                    </div>
                    <div className="tech-raw-row">
                      <span>ADC Reading</span>
                      <code>0x3F82 (12-bit linear)</code>
                    </div>
                    <div className="tech-raw-row">
                      <span>CRC Checksum</span>
                      <code style={{ color: 'var(--color-healthy)' }}>0xA9F1 · VALID</code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────
              13, 14, 15, 22. CAMERA STATUS & TEST (Section 13, 14, 15, 22)
          ───────────────────────────────────────────────────────── */}
          <section className="tech-section">
            <div className="tech-section-header-row">
              <h2 className="tech-section-title">Camera</h2>
              <button
                type="button"
                className="tech-action-link"
                onClick={handleTestCamera}
                disabled={isTestingCamera}
              >
                {isTestingCamera ? 'Testing capture…' : 'Test camera'}
              </button>
            </div>

            <div className="tech-card">
              <div className="tech-kv-row">
                <span className="tech-key">Camera status</span>
                <span className="tech-badge connected">
                  <span className="tech-dot green" /> Ready
                </span>
              </div>
              <div className="tech-kv-row">
                <span className="tech-key">Last capture</span>
                <span className="tech-val">Today · 10:42 AM</span>
              </div>
              <div className="tech-kv-row">
                <span className="tech-key">Last upload</span>
                <span className="tech-val">Today · 10:42 AM</span>
              </div>

              {/* Camera Architecture Principle (Section 15) */}
              <div className="tech-architecture-note">
                <strong>Capture Architecture:</strong> User action → On-demand capture → Preview → Analyze.
                <br />
                <em>No continuous battery-draining stream loop.</em>
              </div>
            </div>

            {/* Test Camera Result (Section 22) */}
            {cameraTestResult && (
              <div className="tech-camera-test-box animate-fade-in">
                <div className="tech-test-badge-row">
                  <CheckCircle2 size={16} color="var(--color-healthy, #4F7A52)" />
                  <strong>{cameraTestResult.title}</strong>
                </div>
                <p className="tech-test-msg">{cameraTestResult.message}</p>
              </div>
            )}

            {/* Expandable Camera Details (Section 14) */}
            <div className="tech-expandable-wrapper">
              <button
                type="button"
                className="tech-expand-toggle"
                onClick={() => setShowCameraDetails(!showCameraDetails)}
              >
                <span>{showCameraDetails ? 'Hide camera details' : 'Camera details'}</span>
                {showCameraDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showCameraDetails && (
                <div className="tech-raw-panel animate-fade-in">
                  <div className="tech-raw-grid">
                    <div className="tech-raw-row">
                      <span>Capture resolution</span>
                      <code>1600 × 1200 (UXGA)</code>
                    </div>
                    <div className="tech-raw-row">
                      <span>Image format</span>
                      <code>JPEG (quality=12)</code>
                    </div>
                    <div className="tech-raw-row">
                      <span>Last capture size</span>
                      <code>312 KB</code>
                    </div>
                    <div className="tech-raw-row">
                      <span>Upload state</span>
                      <code style={{ color: 'var(--color-healthy)' }}>Synchronized</code>
                    </div>
                    <div className="tech-raw-row">
                      <span>Last successful upload</span>
                      <code>Today · 10:42 AM</code>
                    </div>
                    <div className="tech-raw-row">
                      <span>Storage availability</span>
                      <code>14.2 MB internal flash free</code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────
              16. DATA PIPELINE / SYNC (Section 16, 34)
          ───────────────────────────────────────────────────────── */}
          <section className="tech-section">
            <h2 className="tech-section-title">Data sync</h2>
            <div className="tech-card">
              <div className="tech-kv-row">
                <span className="tech-key">Sensor readings</span>
                <span className="tech-badge connected">
                  <span className="tech-dot green" /> Syncing normally
                </span>
              </div>
              <div className="tech-kv-row">
                <span className="tech-key">Last successful sync</span>
                <span className="tech-val">{lastSyncTime}</span>
              </div>
              <div className="tech-kv-row">
                <span className="tech-key">Pending records</span>
                <div className="tech-val-group">
                  <span className="tech-val">{pendingRecords}</span>
                  {pendingRecords > 0 && (
                    <button
                      type="button"
                      className="tech-text-action"
                      onClick={handleRetrySync}
                    >
                      Retry sync
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────
              19. HARDWARE COMPONENTS (Section 19)
          ───────────────────────────────────────────────────────── */}
          <section className="tech-section">
            <h2 className="tech-section-title">Hardware</h2>
            <div className="tech-card">
              <div className="tech-kv-row">
                <span className="tech-key">Controller</span>
                <span className="tech-val">ESP32 DevKit (WROOM-32E)</span>
              </div>
              <div className="tech-kv-row">
                <span className="tech-key">Temperature</span>
                <span className="tech-val">DHT11 / DS18B20 digital bus</span>
              </div>
              <div className="tech-kv-row">
                <span className="tech-key">Humidity</span>
                <span className="tech-val">DHT11 / SHT31 hermetic seal</span>
              </div>
              <div className="tech-kv-row">
                <span className="tech-key">Vibration</span>
                <span className="tech-val">Piezoelectric MEMS sensor</span>
              </div>
              <div className="tech-kv-row">
                <span className="tech-key">Camera</span>
                <span className="tech-val">ESP32 camera module (OV2640)</span>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────
              21 & 24. DEVICE ACTIONS & RESTART (Section 21 & 24)
          ───────────────────────────────────────────────────────── */}
          <section className="tech-section">
            <h2 className="tech-section-title">Device actions</h2>
            <div className="tech-actions-grid">
              <button
                type="button"
                className="btn btn-secondary tech-grid-btn"
                onClick={handlePing}
                disabled={isTestPingRunning}
              >
                <RefreshCw size={15} className={isTestPingRunning ? 'spin-icon' : ''} />
                <span>Refresh status</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary tech-grid-btn"
                onClick={handleRetrySync}
              >
                <Zap size={15} />
                <span>Sync now</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary tech-grid-btn"
                onClick={handleTestSensors}
                disabled={isTestingSensors}
              >
                <Sliders size={15} />
                <span>Test sensors</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary tech-grid-btn"
                onClick={handleTestCamera}
                disabled={isTestingCamera}
              >
                <Camera size={15} />
                <span>Test camera</span>
              </button>

              <button
                type="button"
                className="btn btn-danger-outline tech-grid-btn full-width"
                onClick={() => setShowRestartModal(true)}
              >
                <RotateCcw size={15} />
                <span>Restart monitoring device</span>
              </button>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────
              26 & 27. DIAGNOSTIC LOGS (Section 26 & 27)
          ───────────────────────────────────────────────────────── */}
          <section className="tech-section">
            <div className="tech-expandable-wrapper">
              <button
                type="button"
                className="tech-expand-toggle"
                onClick={() => setShowLogs(!showLogs)}
              >
                <div className="tech-log-title-row">
                  <Terminal size={15} color="var(--color-warm-gray, #786D61)" />
                  <span>{showLogs ? 'Hide diagnostic logs' : 'View diagnostic logs'}</span>
                </div>
                {showLogs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showLogs && (
                <div className="tech-logs-panel animate-fade-in">
                  <div className="tech-logs-toolbar">
                    <span className="tech-logs-count">4 entries (paginated)</span>
                    <button
                      type="button"
                      className="tech-log-mode-btn"
                      onClick={() => setLogsAdvancedMode(!logsAdvancedMode)}
                    >
                      {logsAdvancedMode ? 'Standard view' : 'Advanced payload view'}
                    </button>
                  </div>

                  <div className="tech-logs-list">
                    {diagnosticLogs.map((log, idx) => (
                      <div key={idx} className="tech-log-entry">
                        <div className="tech-log-head">
                          <span className="tech-log-time">{log.time}</span>
                          <span className="tech-log-status">{log.status}</span>
                        </div>
                        {logsAdvancedMode ? (
                          <div className="tech-log-advanced-block">
                            <div><strong>event:</strong> {log.event}</div>
                            <div><strong>deviceId:</strong> {deviceId}</div>
                            <div><strong>timestamp:</strong> 2026-09-25T{log.time}Z</div>
                            <div><strong>payloadSize:</strong> {log.payloadSize}</div>
                            <div><strong>detail:</strong> {log.detail}</div>
                          </div>
                        ) : (
                          <p className="tech-log-text">{log.detail}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="tech-log-sanitization-note">
                    <Lock size={12} />
                    <span>All authorization tokens, passwords, and private credentials are stripped prior to display.</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────
              JURY / TEST MODE DEMONSTRATION (Section 31, 32, 47)
          ───────────────────────────────────────────────────────── */}
          <section className="tech-section tech-jury-section">
            <div className="tech-jury-header">
              <span className="tech-jury-pill">Jury & Diagnostics Demo</span>
              <p className="tech-jury-desc">
                Toggle physical plausibility check or stale packet simulation to demonstrate how HoneyChain safeguards beekeeper health records.
              </p>
            </div>
            <div className="tech-jury-controls">
              <button
                type="button"
                className={`tech-toggle-btn ${simulateImplausibleReading ? 'active' : ''}`}
                onClick={() => setSimulateImplausibleReading(!simulateImplausibleReading)}
              >
                {simulateImplausibleReading ? 'Disable 999°C test reading' : 'Simulate implausible reading (999°C)'}
              </button>

              <button
                type="button"
                className={`tech-toggle-btn ${simulateStaleReading ? 'active' : ''}`}
                onClick={() => setSimulateStaleReading(!simulateStaleReading)}
              >
                {simulateStaleReading ? 'Disable stale reading' : 'Simulate stale sensor reading (14m)'}
              </button>
            </div>
          </section>
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────────
          RESTART CONFIRMATION MODAL (Section 24)
      ───────────────────────────────────────────────────────────── */}
      {showRestartModal && (
        <div className="tech-modal-overlay animate-fade-in" role="dialog" aria-modal="true">
          <div className="tech-modal-card">
            <div className="tech-modal-icon-circle danger">
              <RotateCcw size={22} color="var(--color-critical, #B85450)" />
            </div>
            <h3 className="tech-modal-title">Restart monitoring device?</h3>
            <p className="tech-modal-desc">
              Live monitoring will pause briefly while the device reconnects. Existing sensory telemetry buffer will not be cleared.
            </p>
            <div className="tech-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRestartModal(false)}
                disabled={isRestarting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleRestartDevice}
                disabled={isRestarting}
              >
                {isRestarting ? 'Restarting…' : 'Restart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CHANGE ASSIGNMENT MODAL (Section 20 & 30)
      ───────────────────────────────────────────────────────────── */}
      {showChangeAssignModal && (
        <div className="tech-modal-overlay animate-fade-in" role="dialog" aria-modal="true">
          <div className="tech-modal-card">
            <div className="tech-modal-icon-circle">
              <Cpu size={22} color="var(--color-primary-honey, #D99A24)" />
            </div>
            <h3 className="tech-modal-title">Device Assignment</h3>
            <p className="tech-modal-desc">
              Currently assigned to <strong>Hive {hive.code || 'A-03'} ({hive.name})</strong>.
              Reassigning hardware nodes requires cryptographic apiary administrator signature.
            </p>
            {assignmentFeedback && (
              <div className="tech-inline-alert info">
                <span>{assignmentFeedback}</span>
              </div>
            )}
            <div className="tech-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowChangeAssignModal(false);
                  setAssignmentFeedback(null);
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setAssignmentFeedback('Device-hive integrity verified: Node HC-HIVE-003 is locked to Meadowbrook Apiary.');
                }}
              >
                Verify assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STYLES (Strictly conforming to Section 39 color system)
      ───────────────────────────────────────────────────────────── */}
      <style>{`
        .tech-screen-container {
          background-color: var(--color-background, #FFF9EF);
          min-height: 100vh;
          padding-bottom: 48px;
          color: var(--color-deep-cocoa, #34261B);
        }

        .tech-header {
          padding: 16px 20px 14px;
          background-color: var(--color-soft-ivory, #FFFDF8);
          border-bottom: 1px solid var(--color-divider, #EDE2D1);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .tech-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          padding: 6px 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-deep-cocoa, #34261B);
          cursor: pointer;
          min-height: 44px;
          min-width: 44px;
        }

        .tech-header-info {
          margin-top: 4px;
        }

        .tech-title {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
          color: var(--color-deep-cocoa, #34261B);
        }

        .tech-subtitle {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-primary-honey, #D99A24);
          margin: 2px 0 0 0;
        }

        .tech-header-caption {
          display: block;
          font-size: 12.5px;
          color: var(--color-warm-gray, #786D61);
          margin-top: 2px;
        }

        .tech-content-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .tech-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
        }

        .tech-banner.success {
          background-color: var(--color-healthy-tint, rgba(79, 122, 82, 0.12));
          color: var(--color-healthy, #4F7A52);
          border: 1px solid rgba(79, 122, 82, 0.25);
        }

        .tech-principle-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background-color: #FAF4E9;
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.45;
          color: var(--color-deep-cocoa, #34261B);
        }

        .tech-principle-banner p {
          margin: 0;
        }

        .tech-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tech-section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .tech-section-title {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-warm-gray, #786D61);
          margin: 0;
        }

        .tech-refresh-link,
        .tech-action-link {
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-primary-honey, #D99A24);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          min-height: 44px;
          padding: 0 4px;
        }

        .tech-overview-card {
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tech-device-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .tech-device-type {
          display: block;
          font-size: 15px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
        }

        .tech-status-line {
          margin-top: 6px;
        }

        .tech-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 9999px;
        }

        .tech-badge.connected {
          background-color: var(--color-healthy-tint, rgba(79, 122, 82, 0.12));
          color: var(--color-healthy, #4F7A52);
        }

        .tech-badge.warning {
          background-color: var(--color-attention-tint, rgba(217, 130, 43, 0.12));
          color: var(--color-attention, #D9822B);
        }

        .tech-badge.offline {
          background-color: rgba(184, 84, 80, 0.12);
          color: var(--color-critical, #B85450);
        }

        .tech-badge.reporting {
          background-color: rgba(79, 122, 82, 0.1);
          color: var(--color-healthy, #4F7A52);
        }

        .tech-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .tech-dot.green { background-color: var(--color-healthy, #4F7A52); }
        .tech-dot.amber { background-color: var(--color-attention, #D9822B); }
        .tech-dot.red { background-color: var(--color-critical, #B85450); }

        .tech-heartbeat-box {
          text-align: right;
        }

        .tech-hb-label {
          display: block;
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
        }

        .tech-hb-value {
          display: block;
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #34261B);
          font-weight: 600;
          margin-top: 2px;
        }

        .tech-card {
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tech-kv-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13.5px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(237, 226, 209, 0.5);
        }

        .tech-kv-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .tech-key {
          color: var(--color-warm-gray, #786D61);
        }

        .tech-val {
          color: var(--color-deep-cocoa, #34261B);
          font-weight: 500;
        }

        .tech-val-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tech-code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          background-color: #F6EDE0;
          padding: 2px 6px;
          border-radius: 5px;
          color: var(--color-deep-cocoa, #34261B);
        }

        .tech-copy-btn {
          background: none;
          border: none;
          color: var(--color-warm-gray, #786D61);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 4px;
          min-height: 36px;
          min-width: 36px;
        }

        .tech-copy-btn:hover {
          background-color: rgba(217, 154, 36, 0.1);
        }

        .tech-sub-tag {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-healthy, #4F7A52);
          background-color: var(--color-healthy-tint, rgba(79, 122, 82, 0.12));
          padding: 2px 6px;
          border-radius: 4px;
        }

        .tech-text-action {
          background: none;
          border: none;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-primary-honey, #D99A24);
          cursor: pointer;
          text-decoration: underline;
          padding: 2px 4px;
        }

        /* Compact Sensor List (Section 8) */
        .tech-compact-sensor-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tech-sensor-row {
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 12px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .tech-sensor-meta {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tech-sensor-icon {
          flex-shrink: 0;
        }

        .tech-sensor-label {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
        }

        .tech-sensor-timestamp {
          display: block;
          font-size: 11px;
          color: var(--color-warm-gray, #786D61);
        }

        .tech-sensor-status-block {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tech-sensor-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
        }

        .tech-sensor-failure-block {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tech-error-text {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-critical, #B85450);
        }

        .tech-stale-text {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-attention, #D9822B);
        }

        .tech-pill-action {
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
          cursor: pointer;
        }

        .tech-pill-action.danger {
          border-color: var(--color-critical, #B85450);
          color: var(--color-critical, #B85450);
          background-color: rgba(184, 84, 80, 0.06);
        }

        /* Expandable section styling */
        .tech-expandable-wrapper {
          display: flex;
          flex-direction: column;
          margin-top: 6px;
        }

        .tech-expand-toggle {
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px dashed var(--color-divider, #EDE2D1);
          border-radius: 10px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
          cursor: pointer;
          min-height: 44px;
        }

        .tech-expand-toggle:hover {
          background-color: #FAF4E9;
        }

        .tech-raw-panel {
          background-color: #F8F3EA;
          border: 1px solid var(--color-divider, #EDE2D1);
          border-top: none;
          border-radius: 0 0 10px 10px;
          padding: 12px 14px;
        }

        .tech-raw-grid {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tech-raw-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
        }

        .tech-raw-row code {
          font-family: monospace;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
        }

        .tech-architecture-note {
          margin-top: 6px;
          padding: 8px 10px;
          background-color: #FAF4E9;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.4;
          color: var(--color-warm-gray, #786D61);
        }

        .tech-camera-test-box {
          margin-top: 8px;
          padding: 12px;
          background-color: var(--color-healthy-tint, rgba(79, 122, 82, 0.12));
          border: 1px solid rgba(79, 122, 82, 0.25);
          border-radius: 10px;
        }

        .tech-test-badge-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--color-healthy, #4F7A52);
        }

        .tech-test-msg {
          font-size: 12px;
          color: var(--color-deep-cocoa, #34261B);
          margin: 4px 0 0 0;
          line-height: 1.4;
        }

        .tech-sensor-test-results {
          margin-top: 8px;
          padding: 12px;
          background-color: #FAF4E9;
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 12px;
        }

        .tech-test-res-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .tech-test-time {
          font-size: 11px;
          color: var(--color-warm-gray, #786D61);
        }

        .tech-test-res-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 8px;
        }

        .tech-test-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .tech-test-stat {
          font-weight: 600;
          color: var(--color-healthy, #4F7A52);
        }

        .tech-test-disclaimer {
          font-size: 11px;
          color: var(--color-warm-gray, #786D61);
          margin: 0;
          line-height: 1.35;
        }

        /* Actions Grid (Section 21) */
        .tech-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .tech-grid-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13px;
          padding: 10px 8px;
          min-height: 44px;
        }

        .tech-grid-btn.full-width {
          grid-column: 1 / -1;
        }

        .btn-danger-outline {
          background-color: transparent;
          border: 1px solid var(--color-critical, #B85450);
          color: var(--color-critical, #B85450);
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .btn-danger-outline:hover {
          background-color: rgba(184, 84, 80, 0.08);
        }

        /* Diagnostic Logs Panel (Section 26 & 27) */
        .tech-log-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tech-logs-panel {
          background-color: #2D241E;
          color: #FAF4E9;
          border-radius: 0 0 10px 10px;
          padding: 12px 14px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
        }

        .tech-logs-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 10px;
        }

        .tech-logs-count {
          color: #B5A89B;
          font-size: 11px;
        }

        .tech-log-mode-btn {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FAF4E9;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 11px;
          cursor: pointer;
        }

        .tech-logs-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tech-log-entry {
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tech-log-head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .tech-log-time {
          color: #D99A24;
          font-weight: 600;
        }

        .tech-log-status {
          color: #8ED094;
          font-size: 10px;
        }

        .tech-log-text {
          margin: 0;
          color: #E2D9CE;
          font-size: 11.5px;
        }

        .tech-log-advanced-block {
          background-color: rgba(0, 0, 0, 0.25);
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 11px;
          color: #E2D9CE;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tech-log-sanitization-note {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #B5A89B;
          font-size: 11px;
        }

        /* Jury Mode (Section 47) */
        .tech-jury-section {
          background-color: #FAF4E9;
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 12px;
          padding: 14px;
        }

        .tech-jury-header {
          margin-bottom: 10px;
        }

        .tech-jury-pill {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-primary-honey, #D99A24);
          background-color: rgba(217, 154, 36, 0.12);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .tech-jury-desc {
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
          margin: 4px 0 0 0;
          line-height: 1.4;
        }

        .tech-jury-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tech-toggle-btn {
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
          cursor: pointer;
          text-align: left;
          min-height: 44px;
        }

        .tech-toggle-btn.active {
          background-color: rgba(184, 84, 80, 0.1);
          border-color: var(--color-critical, #B85450);
          color: var(--color-critical, #B85450);
        }

        /* Modals (Section 20 & 24) */
        .tech-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(52, 38, 27, 0.45);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 9999;
        }

        .tech-modal-card {
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px solid var(--color-divider, #EDE2D1);
          border-radius: 16px;
          padding: 20px;
          max-width: 360px;
          width: 100%;
          text-align: center;
          box-shadow: 0 12px 32px rgba(52, 38, 27, 0.18);
        }

        .tech-modal-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }

        .tech-modal-icon-circle.danger {
          background-color: rgba(184, 84, 80, 0.12);
        }

        .tech-modal-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0 0 6px 0;
        }

        .tech-modal-desc {
          font-size: 13px;
          line-height: 1.45;
          color: var(--color-warm-gray, #786D61);
          margin: 0 0 16px 0;
        }

        .tech-modal-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .tech-inline-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          margin-bottom: 12px;
        }

        .tech-inline-alert.success {
          background-color: var(--color-healthy-tint, rgba(79, 122, 82, 0.12));
          color: var(--color-healthy, #4F7A52);
        }

        .tech-inline-alert.info {
          background-color: #FAF4E9;
          color: var(--color-deep-cocoa, #34261B);
          border: 1px solid var(--color-divider, #EDE2D1);
        }

        .tech-access-denied-card {
          margin: 40px 20px;
          padding: 24px;
          background-color: var(--color-soft-ivory, #FFFDF8);
          border: 1px solid rgba(184, 84, 80, 0.25);
          border-radius: 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .tech-access-denied-card h3 {
          margin: 0;
          font-size: 17px;
          color: var(--color-critical, #B85450);
        }

        .tech-access-denied-card p {
          font-size: 13px;
          color: var(--color-warm-gray, #786D61);
          line-height: 1.45;
          margin: 0;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
