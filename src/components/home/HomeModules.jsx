import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { StatusBadge } from '../common/StatusBadge';
import { TechnicalDetails } from '../common/TechnicalDetails';
import {
  Droplet,
  FlaskConical,
  Package,
  Truck,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileCheck
} from 'lucide-react';

/**
 * Processing & Honey Batches Card for Home
 */
export const BatchMonitoringCard = () => {
  const { batches, openSheet } = useAppState();
  const activeBatches = batches.filter(b => b.status === 'curing');
  const certifiedBatches = batches.filter(b => b.status === 'certified');

  return (
    <section className="home-module-section">
      <div className="card home-module-card">
        <div className="module-header">
          <div>
            <span className="micro-text" style={{ color: 'var(--color-primary-honey)' }}>
              Extraction & Curing
            </span>
            <h2 className="heading-section" style={{ marginTop: '2px' }}>Active Batches</h2>
          </div>
          <StatusBadge
            status={activeBatches.length > 0 ? 'attention' : 'healthy'}
            label={`${activeBatches.length} Curing in Tank`}
          />
        </div>

        <p className="body-text" style={{ fontSize: '14.5px', marginBottom: '12px' }}>
          {activeBatches.length > 0
            ? `Batch #${activeBatches[0].batchNumber} (${activeBatches[0].name}) is currently settling in stainless tanks. Moisture registered at ${activeBatches[0].moisture}%.`
            : "All extracted batches have completed settling and are ready for lab certification or bottling."}
        </p>

        {/* Quick Batch Metrics */}
        <div className="batch-quick-metrics">
          <div className="quick-metric-item">
            <span className="metric-label">Curing Tank</span>
            <strong className="metric-val">{activeBatches.length} Lots</strong>
          </div>
          <div className="quick-metric-item">
            <span className="metric-label">Certified Safe</span>
            <strong className="metric-val">{certifiedBatches.length} Lots</strong>
          </div>
          <div className="quick-metric-item">
            <span className="metric-label">Total Volume</span>
            <strong className="metric-val">{batches.reduce((sum, b) => sum + (b.weightKg || 0), 0).toFixed(0)} kg</strong>
          </div>
        </div>

        {/* Action to create batch */}
        <button
          type="button"
          className="btn btn-secondary btn-block"
          style={{ marginTop: '12px', justifyContent: 'space-between' }}
          onClick={() => openSheet('create-batch')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={16} color="var(--color-deep-honey)" />
            <span style={{ fontSize: '13.5px' }}>Log New Harvest Batch</span>
          </div>
          <ArrowRight size={15} color="var(--color-warm-gray)" />
        </button>
      </div>

      <style>{`
        .home-module-section {
          margin-bottom: var(--space-20);
        }
        .home-module-card {
          background-color: var(--color-soft-ivory);
          border-left: 4px solid var(--color-deep-honey);
        }
        .module-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .batch-quick-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin: 10px 0;
        }
        .quick-metric-item {
          background-color: #FAF4E8;
          border: 1px solid var(--color-card-border);
          border-radius: var(--radius-button);
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .metric-label {
          font-size: 11px;
          color: var(--color-warm-gray);
          text-transform: uppercase;
        }
        .metric-val {
          font-size: 14px;
          color: var(--color-deep-cocoa);
          font-weight: 700;
        }
      `}</style>
    </section>
  );
};

/**
 * Quality & Laboratory Analysis Card for Home
 */
export const QualityMonitoringCard = () => {
  const { batches, showToast } = useAppState();
  const latestBatch = batches[0];

  return (
    <section className="home-module-section">
      <div className="card home-module-card quality-card">
        <div className="module-header">
          <div>
            <span className="micro-text" style={{ color: 'var(--color-sage)' }}>
              Analytical Purity
            </span>
            <h2 className="heading-section" style={{ marginTop: '2px' }}>Quality & Lab Checks</h2>
          </div>
          <StatusBadge status="healthy" label="Certified Purity" />
        </div>

        <p className="body-text" style={{ fontSize: '14.5px', marginBottom: '12px' }}>
          Batch <strong>#{latestBatch?.batchNumber}</strong> passed C4 sugar analysis. Diastase active at {latestBatch?.diastase || '15.0 DN'} with zero pesticide residues.
        </p>

        <div className="lab-readings-row">
          <div className="lab-reading-pill">
            <span className="lab-reading-lbl">Moisture</span>
            <strong className="lab-reading-val">{latestBatch?.moisture}%</strong>
            <span className="lab-standard-lbl">&lt; 18.5% Std</span>
          </div>
          <div className="lab-reading-pill">
            <span className="lab-reading-lbl">HMF Level</span>
            <strong className="lab-reading-val">{latestBatch?.hmfLevel || '3.5 mg/kg'}</strong>
            <span className="lab-standard-lbl">Fresh raw</span>
          </div>
          <div className="lab-reading-pill">
            <span className="lab-reading-lbl">Diastase</span>
            <strong className="lab-reading-val">{latestBatch?.diastase || '15.0 DN'}</strong>
            <span className="lab-standard-lbl">Active enzymes</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-block"
          style={{ marginTop: '12px', justifyContent: 'space-between' }}
          onClick={() => showToast("Digital Refractometer reading recorded: 17.2% Moisture")}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FlaskConical size={16} color="var(--color-sage)" />
            <span style={{ fontSize: '13.5px' }}>Conduct Refractometry Check</span>
          </div>
          <ArrowRight size={15} color="var(--color-warm-gray)" />
        </button>
      </div>

      <style>{`
        .quality-card {
          border-left: 4px solid var(--color-sage);
        }
        .lab-readings-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .lab-reading-pill {
          background-color: #F6F8F3;
          border: 1px solid #D8E2D1;
          border-radius: var(--radius-button);
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lab-reading-lbl {
          font-size: 11px;
          color: var(--color-warm-gray);
          text-transform: uppercase;
        }
        .lab-reading-val {
          font-size: 14px;
          color: var(--color-healthy);
          font-weight: 700;
        }
        .lab-standard-lbl {
          font-size: 10.5px;
          color: var(--color-warm-gray);
        }
      `}</style>
    </section>
  );
};

/**
 * Distribution & Supply Chain Inventory Card for Home
 */
export const DistributionMonitoringCard = () => {
  const { showToast } = useAppState();

  return (
    <section className="home-module-section">
      <div className="card home-module-card distribution-card">
        <div className="module-header">
          <div>
            <span className="micro-text" style={{ color: 'var(--color-deep-cocoa)' }}>
              Logistics & Fulfillment
            </span>
            <h2 className="heading-section" style={{ marginTop: '2px' }}>Inventory & Dispatches</h2>
          </div>
          <StatusBadge status="healthy" label="Dispatches On Time" />
        </div>

        <p className="body-text" style={{ fontSize: '14.5px', marginBottom: '12px' }}>
          780 jars bottled and sealed with cryptographic NFC labels. 2 consignments scheduled for local organic co-op delivery.
        </p>

        <div className="distrib-metrics-grid">
          <div className="distrib-stat-box">
            <Package size={16} color="var(--color-primary-honey)" />
            <div>
              <strong className="dist-num">780 Jars</strong>
              <span className="dist-label">Packaged Inventory</span>
            </div>
          </div>
          <div className="distrib-stat-box">
            <Truck size={16} color="var(--color-sage)" />
            <div>
              <strong className="dist-num">2 Dispatches</strong>
              <span className="dist-label">In Transit Today</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-block"
          style={{ marginTop: '12px', justifyContent: 'space-between' }}
          onClick={() => showToast("Dispatch manifest #DIS-8910 verified and synced")}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={16} color="var(--color-deep-cocoa)" />
            <span style={{ fontSize: '13.5px' }}>Verify Dispatch Manifest</span>
          </div>
          <ArrowRight size={15} color="var(--color-warm-gray)" />
        </button>
      </div>

      <style>{`
        .distribution-card {
          border-left: 4px solid var(--color-deep-cocoa);
        }
        .distrib-metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .distrib-stat-box {
          background-color: #FAF4E9;
          border: 1px solid var(--color-card-border);
          border-radius: var(--radius-button);
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dist-num {
          display: block;
          font-size: 14px;
          color: var(--color-deep-cocoa);
        }
        .dist-label {
          font-size: 11px;
          color: var(--color-warm-gray);
        }
      `}</style>
    </section>
  );
};
