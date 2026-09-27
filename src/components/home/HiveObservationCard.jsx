import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { StatusBadge } from '../common/StatusBadge';
import { TechnicalDetails } from '../common/TechnicalDetails';
import { Sun, Wind, Droplets, Thermometer, ShieldCheck } from 'lucide-react';

export const HiveObservationCard = () => {
  const { apiary, hives, openSheet } = useAppState();

  const attentionCount = hives.filter((h) => h.status === 'attention').length;
  const healthyCount = hives.length - attentionCount;

  return (
    <section className="observation-section">
      {/* Calm human summary card */}
      <div className="card observation-card">
        <div className="observation-header">
          <div>
            <span className="micro-text">What matters now</span>
            <h2 className="heading-section" style={{ marginTop: '2px' }}>Colony Conditions</h2>
          </div>
          <StatusBadge
            status={attentionCount > 0 ? 'attention' : 'healthy'}
            label={attentionCount > 0 ? `${attentionCount} Attention` : 'All Healthy'}
          />
        </div>

        <p className="body-text observation-summary">
          {attentionCount === 0
            ? "All 6 colonies are calm and actively foraging. Net nectar intake is positive across the south ridge."
            : `5 colonies are calm and thriving. Hive 02 shows slight restlessness—Varroa board check scheduled.`}
        </p>

        {/* Calm Evidence Bar: Human-meaningful indicators */}
        <div className="observation-metrics">
          <div className="metric-pill">
            <Thermometer size={14} color="var(--color-sage)" />
            <span>Avg Brood: <strong>34.4°C</strong></span>
          </div>
          <div className="metric-pill">
            <Droplets size={14} color="var(--color-sage)" />
            <span>Apiary Hum: <strong>56%</strong></span>
          </div>
          <div className="metric-pill">
            <Sun size={14} color="var(--color-primary-honey)" />
            <span>Forage: <strong>Active</strong></span>
          </div>
        </div>

        {/* Progressive Disclosure for IoT Telemetry */}
        <TechnicalDetails
          title="Field Telemetry & Mesh Gateway Status"
          icon="tech"
          items={[
            { label: 'Gateway Node', value: 'ESP32-WROVER-E (Station 1)' },
            { label: 'Active BLE Beacons', value: `${hives.length} of ${hives.length} Nodes Online` },
            { label: 'Mesh Protocol', value: 'BLE 5.0 Mesh / CoAP to MQTT-SN' },
            { label: 'Telemetry Sync', value: 'Continuous 15-min burst transmission' },
            { label: 'Signal Quality', value: 'Average RSSI -63 dBm' }
          ]}
        />
      </div>

      <style>{`
        .observation-section {
          margin-bottom: var(--space-20);
        }

        .observation-card {
          background-color: var(--color-soft-ivory);
          border-left: 4px solid var(--color-primary-honey);
        }

        .observation-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-12);
        }

        .observation-summary {
          font-size: 15px;
          line-height: 1.55;
          color: var(--color-deep-cocoa);
          margin-bottom: var(--space-16);
        }

        .observation-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding-bottom: 4px;
        }

        .metric-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background-color: #FAF4E8;
          border: 1px solid var(--color-divider);
          border-radius: var(--radius-button);
          font-size: 13px;
          color: var(--color-deep-cocoa);
        }
      `}</style>
    </section>
  );
};
