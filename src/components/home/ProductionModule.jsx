import React from 'react';
import {
  Droplets,
  ChevronRight,
  PlusCircle,
  Clock,
  ArrowRight,
  Layers,
  Thermometer,
  FileText,
  Gauge,
  FlaskConical,
  SlidersHorizontal,
  CalendarCheck
} from 'lucide-react';

export const ProductionModule = ({
  batches = [],
  collections = [],
  canCreateBatch = false,
  canRecordCollection = false,
  onViewBatches,
  onSelectBatch,
  onCreateBatch,
  onRecordCollection
}) => {
  const activeBatches = batches.filter(b => b.status === 'curing');
  const bottledBatches = batches.filter(b => b.status === 'bottled');
  const certifiedBatches = batches.filter(b => b.status === 'certified');

  const totalVolumeKg = batches.reduce((sum, b) => sum + (b.weightKg || 0), 0);
  const primaryBatch = activeBatches[0] || batches[0];

  return (
    <div className="hv-section">
      <div className="hv-sec-head">
        <div className="hv-sec-title-wrap">
          <span className="hv-sec-title">Production & Batches</span>
          <span className="hv-sec-tagline">Extraction tanks, moisture levels, and lot records</span>
        </div>
        <button className="hv-sec-link" onClick={onViewBatches}>
          View all <ChevronRight size={13} />
        </button>
      </div>

      <div className="hv-batch-metrics-strip">
        <div className="hv-metric-cell">
          <span className="hv-bp-num">{activeBatches.length} Lots</span>
          <span className="hv-bp-lbl">Curing in Tank</span>
        </div>
        <div className="hv-metric-cell">
          <span className="hv-bp-num">{bottledBatches.length} Lots</span>
          <span className="hv-bp-lbl">Ready for Packaging</span>
        </div>
        <div className="hv-metric-cell">
          <span className="hv-bp-num">{totalVolumeKg.toFixed(0)} kg</span>
          <span className="hv-bp-lbl">Total Volume</span>
        </div>
      </div>

      {/* Primary Batch Card */}
      {primaryBatch ? (
        <div className="hv-batch-primary-card" onClick={() => onSelectBatch && onSelectBatch(primaryBatch.id)}>
          <div className="hv-bpc-header">
            <div>
              <span className="hv-bpc-tag">Lot {primaryBatch.batchNumber || primaryBatch.displayId}</span>
              <strong className="hv-bpc-name">{primaryBatch.name}</strong>
            </div>
            <span className={`hv-bpc-status-badge ${primaryBatch.status}`}>
              {primaryBatch.status === 'curing' ? 'Settling in tank' : primaryBatch.statusLabel || primaryBatch.status}
            </span>
          </div>

          <div className="hv-bpc-meta-grid">
            <div className="hv-bpc-col">
              <span className="hv-bpc-meta-val">{primaryBatch.moisture || 17.6}%</span>
              <span className="hv-bpc-meta-lbl">Moisture</span>
            </div>
            <div className="hv-bpc-col">
              <span className="hv-bpc-meta-val">{primaryBatch.weightKg || 240} kg</span>
              <span className="hv-bpc-meta-lbl">Batch Weight</span>
            </div>
            <div className="hv-bpc-col">
              <span className="hv-bpc-meta-val">{primaryBatch.honeyType || 'Raw Wildflower'}</span>
              <span className="hv-bpc-meta-lbl">Floral Origin</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="hv-empty-box">
          <p className="hv-empty-title">No extraction batches yet</p>
          <p className="hv-empty-sub">Create a new batch to track settling tanks, clarifying and refractometer purity.</p>
          {canCreateBatch && (
            <button className="hv-empty-cta" onClick={onCreateBatch}>
              <PlusCircle size={14} strokeWidth={2} /> Create harvest batch
            </button>
          )}
        </div>
      )}

      {/* Daily Actions Grid */}
      <div className="hv-daily-actions-section">
        <span className="hv-daily-actions-title">Daily Actions</span>
        <div className="hv-da-grid">
          <button
            className="hv-da-card honey"
            onClick={onCreateBatch}
          >
            <div className="hv-da-icon"><PlusCircle size={18} /></div>
            <strong className="hv-da-label">Log Extraction</strong>
            <span className="hv-da-sub">New harvest batch</span>
          </button>
          <button
            className="hv-da-card warm"
            onClick={() => onRecordCollection && onRecordCollection()}
          >
            <div className="hv-da-icon"><Gauge size={18} /></div>
            <strong className="hv-da-label">Moisture Check</strong>
            <span className="hv-da-sub">Refractometer reading</span>
          </button>
          <button
            className="hv-da-card brown"
            onClick={() => onSelectBatch && primaryBatch && onSelectBatch(primaryBatch.id)}
          >
            <div className="hv-da-icon"><SlidersHorizontal size={18} /></div>
            <strong className="hv-da-label">Tank Status</strong>
            <span className="hv-da-sub">Settling progress</span>
          </button>
          <button
            className="hv-da-card sage"
            onClick={() => onSelectBatch && primaryBatch && onSelectBatch(primaryBatch.id)}
          >
            <div className="hv-da-icon"><CalendarCheck size={18} /></div>
            <strong className="hv-da-label">Batch Review</strong>
            <span className="hv-da-sub">Check lot records</span>
          </button>
        </div>
      </div>

      <style>{`
        .hv-batch-metrics-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }
        .hv-metric-cell {
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-radius: 8px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .hv-bp-num {
          font-size: 13.5px;
          font-weight: 600;
          color: #34261B;
        }
        .hv-bp-lbl {
          font-size: 11px;
          color: #786D61;
        }
        .hv-batch-primary-card {
          background: #FFFDF8;
          border: 1.5px solid #EDE2D1;
          border-left: 4px solid #D99A24;
          border-radius: 14px;
          padding: 12px 14px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .hv-batch-primary-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(52, 38, 27, 0.06);
        }
        .hv-bpc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .hv-bpc-tag {
          font-size: 10.5px;
          font-weight: 750;
          color: #D99A24;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
        }
        .hv-bpc-name {
          font-size: 14.5px;
          font-weight: 750;
          color: #34261B;
        }
        .hv-bpc-status-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .hv-bpc-status-badge.curing {
          background: rgba(217, 130, 43, 0.12);
          color: #D9822B;
          border: 1px solid rgba(217, 130, 43, 0.3);
        }
        .hv-bpc-status-badge.certified {
          background: rgba(79, 122, 82, 0.12);
          color: #4F7A52;
          border: 1px solid rgba(79, 122, 82, 0.3);
        }
        .hv-bpc-meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background: #FAF4E8;
          border-radius: 8px;
          padding: 8px 10px;
        }
        .hv-bpc-col {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .hv-bpc-meta-val {
          font-size: 13px;
          font-weight: 700;
          color: #34261B;
        }
        .hv-bpc-meta-lbl {
          font-size: 10px;
          color: #786D61;
        }
        .hv-daily-actions-section {
          margin-top: 14px;
        }
        .hv-daily-actions-title {
          font-size: 11.5px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #786D61;
          display: block;
          margin-bottom: 8px;
        }
        .hv-da-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .hv-da-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          border-radius: 12px;
          padding: 11px 12px;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: transform 0.13s ease, box-shadow 0.13s ease;
        }
        .hv-da-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(52, 38, 27, 0.08);
        }
        .hv-da-card.honey {
          background: rgba(217, 154, 36, 0.12);
          border: 1px solid rgba(217, 154, 36, 0.25);
        }
        .hv-da-card.honey .hv-da-icon { color: #D99A24; }
        .hv-da-card.warm {
          background: rgba(217, 130, 43, 0.10);
          border: 1px solid rgba(217, 130, 43, 0.2);
        }
        .hv-da-card.warm .hv-da-icon { color: #D9822B; }
        .hv-da-card.brown {
          background: rgba(140, 109, 79, 0.1);
          border: 1px solid rgba(140, 109, 79, 0.2);
        }
        .hv-da-card.brown .hv-da-icon { color: #8C6D4F; }
        .hv-da-card.sage {
          background: rgba(79, 122, 82, 0.10);
          border: 1px solid rgba(79, 122, 82, 0.2);
        }
        .hv-da-card.sage .hv-da-icon { color: #4F7A52; }
        .hv-da-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: rgba(255,255,255,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2px;
        }
        .hv-da-label {
          font-size: 12.5px;
          font-weight: 750;
          color: #34261B;
          display: block;
        }
        .hv-da-sub {
          font-size: 10.5px;
          color: #786D61;
        }
      `}</style>
    </div>
  );
};
