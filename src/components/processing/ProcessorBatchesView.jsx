import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Layers,
  Search,
  Plus,
  Cpu,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Filter,
  Droplet
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { BATCH_STATUSES } from '../../services/processorDomainService';

export const ProcessorBatchesView = ({
  onSelectBatch,
  onOpenCreateBatch
}) => {
  const {
    processingBatches = [],
    handoverRecords = []
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'IN_PROCESSING' | 'ON_HOLD' | 'READY_FOR_QUALITY' | 'SUBMITTED_TO_QUALITY'

  const filteredBatches = processingBatches.filter(b => {
    // Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'READY_FOR_QUALITY') {
        if (b.status !== BATCH_STATUSES.READY_FOR_QUALITY && b.status !== BATCH_STATUSES.PROCESSING_COMPLETE) {
          return false;
        }
      } else if (b.status !== statusFilter) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = (b.batchNumber || '').toLowerCase().includes(q);
      const matchName = (b.name || '').toLowerCase().includes(q);
      const matchHoney = (b.honeyType || '').toLowerCase().includes(q);
      const matchSource = (b.sourceHarvests || []).some(s => (s.traceabilityCode || '').toLowerCase().includes(q));
      if (!matchNum && !matchName && !matchHoney && !matchSource) {
        return false;
      }
    }

    return true;
  });

  const inProcessingCount = processingBatches.filter(b => b.status === BATCH_STATUSES.IN_PROCESSING).length;
  const onHoldCount = processingBatches.filter(b => b.status === BATCH_STATUSES.ON_HOLD).length;
  const readyCount = processingBatches.filter(b => b.status === BATCH_STATUSES.READY_FOR_QUALITY || b.status === BATCH_STATUSES.PROCESSING_COMPLETE).length;

  return (
    <div className="proc-batches-container">
      {/* 1. Header & Create Button */}
      <div className="proc-batches-header card">
        <div className="proc-bh-left">
          <div className="proc-bh-badge-row">
            <span className="badge badge-honey">Production Line</span>
            <span className="proc-bh-count-pill">{processingBatches.length} Total Batches</span>
          </div>
          <h2 className="proc-bh-title">Processing Batches & Lineage</h2>
          <p className="proc-bh-desc">
            Centrifugal extraction runs, settling maturation tanks, and certified laboratory handoffs.
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm proc-new-batch-btn"
          onClick={onOpenCreateBatch}
        >
          <Plus size={15} />
          <span>New Processing Batch</span>
        </button>
      </div>

      {/* 2. Search & Status Filter */}
      <div className="proc-intake-controls">
        <div className="proc-search-wrap">
          <Search size={15} className="proc-search-icon" />
          <input
            type="text"
            className="proc-search-input"
            placeholder="Search batch (PB-2026-00041), source frame code, floral type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="proc-filter-pills">
          <button
            className={`proc-f-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All ({processingBatches.length})
          </button>
          <button
            className={`proc-f-pill ${statusFilter === 'IN_PROCESSING' ? 'active' : ''}`}
            onClick={() => setStatusFilter('IN_PROCESSING')}
          >
            In Processing ({inProcessingCount})
          </button>
          <button
            className={`proc-f-pill ${statusFilter === 'ON_HOLD' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ON_HOLD')}
          >
            On Hold ({onHoldCount})
          </button>
          <button
            className={`proc-f-pill ${statusFilter === 'READY_FOR_QUALITY' ? 'active' : ''}`}
            onClick={() => setStatusFilter('READY_FOR_QUALITY')}
          >
            Ready for QC ({readyCount})
          </button>
          <button
            className={`proc-f-pill ${statusFilter === 'SUBMITTED_TO_QUALITY' ? 'active' : ''}`}
            onClick={() => setStatusFilter('SUBMITTED_TO_QUALITY')}
          >
            Submitted
          </button>
        </div>
      </div>

      {/* 3. Batches Grid */}
      <div className="proc-batches-grid">
        {filteredBatches.length === 0 ? (
          <div className="proc-empty-card card">
            <Layers size={32} color="var(--color-warm-gray)" />
            <h4 className="proc-empty-title">No Batches Found</h4>
            <p className="proc-empty-text">No processing batches matching the selected filter.</p>
          </div>
        ) : (
          filteredBatches.map(batch => {
            const isHold = batch.status === BATCH_STATUSES.ON_HOLD;
            const isReady = batch.status === BATCH_STATUSES.READY_FOR_QUALITY || batch.status === BATCH_STATUSES.PROCESSING_COMPLETE;
            const isSubmitted = batch.status === BATCH_STATUSES.SUBMITTED_TO_QUALITY;

            return (
              <div
                key={batch.id}
                className="card proc-batch-card"
                onClick={() => onSelectBatch(batch)}
              >
                <div className="proc-bc-header">
                  <div>
                    <h3 className="proc-bc-num">{batch.batchNumber}</h3>
                    <span className="proc-bc-name">{batch.name}</span>
                  </div>
                  <StatusBadge
                    status={isSubmitted ? 'healthy' : isHold ? 'attention' : isReady ? 'healthy' : 'healthy'}
                    label={batch.statusLabel || batch.status}
                    size="small"
                  />
                </div>

                <div className="proc-bc-stats">
                  <div className="proc-bc-stat">
                    <span className="proc-bc-lbl">Tare / Net</span>
                    <span className="proc-bc-val">{batch.finalYieldKg || batch.weightKg} kg</span>
                  </div>
                  <div className="proc-bc-stat">
                    <span className="proc-bc-lbl">Contributing</span>
                    <span className="proc-bc-val">{batch.sourceHarvests?.length || 0} Frames</span>
                  </div>
                  <div className="proc-bc-stat">
                    <span className="proc-bc-lbl">Steps Logged</span>
                    <span className="proc-bc-val">{batch.steps?.length || 0}/5</span>
                  </div>
                </div>

                {/* Source Units Lineage Chips */}
                <div className="proc-bc-sources">
                  <span className="proc-bc-src-label">Source Frames:</span>
                  <div className="proc-bc-src-chips">
                    {(batch.sourceHarvests || []).slice(0, 3).map((s, i) => (
                      <span key={i} className="proc-bc-src-chip">
                        {s.traceabilityCode}
                      </span>
                    ))}
                    {(batch.sourceHarvests || []).length > 3 && (
                      <span className="proc-bc-src-more">
                        +{batch.sourceHarvests.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="proc-bc-footer">
                  <span className="proc-bc-facility">{batch.facility}</span>
                  <div className="proc-bc-arrow">
                    <span>Manage Batch</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .proc-batches-container {
          padding: 16px var(--mobile-pad, 16px) 80px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .proc-batches-header {
          padding: 18px 20px;
          background: #FFFDF8;
          border: 1px solid var(--color-divider, #E5DCCB);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        @media (min-width: 600px) {
          .proc-batches-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .proc-bh-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .proc-bh-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .proc-bh-count-pill {
          font-size: 11px;
          font-weight: 700;
          color: #B45309;
          background: #FEF3C7;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .proc-bh-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
          margin: 4px 0 0;
        }

        .proc-bh-desc {
          font-size: 12.5px;
          color: var(--color-warm-gray, #736961);
          margin: 0;
        }

        .proc-new-batch-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .proc-batches-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 600px) {
          .proc-batches-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .proc-batch-card {
          padding: 16px;
          background: #FFFFFF;
          border: 1px solid var(--color-divider, #E5DCCB);
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.15s ease;
        }

        .proc-batch-card:hover {
          border-color: var(--color-primary-honey, #D97706);
          box-shadow: 0 4px 14px rgba(44, 24, 16, 0.06);
        }

        .proc-bc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .proc-bc-num {
          font-family: monospace;
          font-size: 16px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
          margin: 0;
        }

        .proc-bc-name {
          font-size: 12px;
          color: var(--color-warm-gray, #736961);
        }

        .proc-bc-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background: #F9FAFB;
          padding: 8px;
          border-radius: 8px;
          text-align: center;
        }

        .proc-bc-stat {
          display: flex;
          flex-direction: column;
        }

        .proc-bc-lbl {
          font-size: 10px;
          color: var(--color-warm-gray, #736961);
          text-transform: uppercase;
        }

        .proc-bc-val {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-bc-sources {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          font-size: 11px;
        }

        .proc-bc-src-label {
          color: var(--color-warm-gray, #736961);
        }

        .proc-bc-src-chips {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .proc-bc-src-chip {
          font-family: monospace;
          background: #FFFDF8;
          border: 1px solid #E5DCCB;
          padding: 1px 6px;
          border-radius: 4px;
          color: var(--color-deep-cocoa, #2C1810);
          font-size: 10.5px;
        }

        .proc-bc-src-more {
          color: var(--color-warm-gray, #736961);
          font-size: 10.5px;
        }

        .proc-bc-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11.5px;
          border-top: 1px solid #F3F4F6;
          padding-top: 8px;
        }

        .proc-bc-facility {
          color: var(--color-warm-gray, #736961);
        }

        .proc-bc-arrow {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--color-primary-honey, #D97706);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
