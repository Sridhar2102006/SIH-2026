import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Droplet,
  Filter,
  Search,
  ArrowRight,
  Plus,
  Clock,
  Package,
  Layers
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { INTAKE_STATUSES, INTAKE_STATUS_LABELS } from '../../services/processorDomainService';

export const ProcessorIntakeView = ({
  onOpenVerification,
  onOpenCreateBatch
}) => {
  const {
    handoverRecords = [],
    harvestRecords = [],
    frames = [],
    acceptHarvestIntake,
    rejectHarvestIntake
  } = useAppState();

  const [statusFilter, setStatusFilter] = useState('AWAITING'); // 'AWAITING' | 'ACCEPTED' | 'ASSIGNED' | 'REJECTED' | 'ALL'
  const [searchQuery, setSearchQuery] = useState('');

  const isAwaitingStatus = (status) => {
    return (
      status === 'SUBMITTED_TO_PROCESSOR' ||
      status === INTAKE_STATUSES.SUBMITTED_TO_PROCESSOR ||
      status === 'SUBMITTED_BY_BEEKEEPER' ||
      status === INTAKE_STATUSES.SUBMITTED_BY_BEEKEEPER ||
      status === 'AWAITING_INTAKE' ||
      status === INTAKE_STATUSES.AWAITING_INTAKE ||
      status === 'HARVESTED' ||
      !status
    );
  };

  const effectiveHandovers = React.useMemo(() => {
    const map = new Map();

    // 1. Official Handover Records take top priority
    (handoverRecords || []).forEach(hnd => {
      const code = String(hnd.traceabilityCode || '').toUpperCase().trim();
      if (!code) return;
      map.set(code, { ...hnd });
    });

    // 2. Harvest records that have submittedToProcessor flag
    (harvestRecords || []).filter(h => h.submittedToProcessor).forEach((hrv, idx) => {
      const code = String(hrv.traceabilityCode || '').toUpperCase().trim();
      if (!code || map.has(code)) return;
      map.set(code, {
        id: hrv.handoverId || hrv.id || `handover-hrv-${idx}`,
        handoverCode: `HND-2409-${String(map.size + 1).padStart(2, '0')}`,
        traceabilityCode: hrv.traceabilityCode,
        harvestRecordId: hrv.id,
        frameId: hrv.frameId,
        apiaryCode: hrv.apiaryCode || 'AP1',
        hiveCode: hrv.hiveCode || 'H001',
        frameNumber: hrv.frameNumber || 'F1',
        quantityKg: hrv.quantityKg || 2.4,
        honeyType: hrv.honeyType || 'Wildflower',
        submissionTimestamp: hrv.harvestDate ? `${hrv.harvestDate} · ${hrv.harvestTime || '12:00'}` : 'Recently',
        submittingBeekeeper: hrv.submittingBeekeeper || 'Sarah Lindqvist',
        receivingFacility: 'On-site Honey Processing House #2',
        status: INTAKE_STATUSES.SUBMITTED_TO_PROCESSOR,
        statusLabel: 'Submitted for Processing',
        remarks: hrv.remarks || 'Delivered from apiary harvest.',
        evidence: {
          containerSeal: 'SEAL-AP1-MB-0926',
          photo: hrv.evidencePhoto || '/hive-inspection-sample.jpg'
        }
      });
    });

    // 3. Frames with status SUBMITTED_TO_PROCESSOR
    (frames || []).filter(f => f.status === 'SUBMITTED_TO_PROCESSOR').forEach((frm, idx) => {
      const code = String(frm.traceabilityCode || '').toUpperCase().trim();
      if (!code || map.has(code)) return;
      map.set(code, {
        id: frm.handoverId || frm.id || `handover-frm-${idx}`,
        handoverCode: `HND-2409-${String(map.size + 1).padStart(2, '0')}`,
        traceabilityCode: frm.traceabilityCode,
        frameId: frm.id,
        apiaryCode: frm.apiaryCode || 'AP1',
        hiveCode: frm.hiveCode || 'H001',
        frameNumber: frm.frameNumber || 'F1',
        quantityKg: frm.harvestQuantityKg || 2.4,
        honeyType: frm.honeyType || 'Wildflower',
        submissionTimestamp: 'Recently',
        submittingBeekeeper: 'Sarah Lindqvist',
        receivingFacility: 'On-site Honey Processing House #2',
        status: INTAKE_STATUSES.SUBMITTED_TO_PROCESSOR,
        statusLabel: 'Submitted for Processing',
        remarks: 'Delivered from hive harvest.',
        evidence: {
          containerSeal: 'SEAL-AP1-MB-0926',
          photo: '/hive-inspection-sample.jpg'
        }
      });
    });

    return Array.from(map.values());
  }, [handoverRecords, harvestRecords, frames]);

  const filteredHandovers = effectiveHandovers.filter(h => {
    // Status filter
    if (statusFilter === 'AWAITING') {
      if (!isAwaitingStatus(h.status)) {
        return false;
      }
    } else if (statusFilter === 'ACCEPTED') {
      if (h.status !== INTAKE_STATUSES.RECEIVED && h.status !== 'RECEIVED') return false;
    } else if (statusFilter === 'HOLD') {
      if (h.status !== INTAKE_STATUSES.ON_HOLD && h.status !== 'ON_HOLD') return false;
    } else if (statusFilter === 'ASSIGNED') {
      if (h.status !== INTAKE_STATUSES.ASSIGNED_TO_BATCH && h.status !== 'ASSIGNED_TO_BATCH') return false;
    } else if (statusFilter === 'REJECTED') {
      if (h.status !== INTAKE_STATUSES.REJECTED && h.status !== 'REJECTED') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCode = (h.traceabilityCode || '').toLowerCase().includes(q);
      const matchApiary = (h.apiaryCode || '').toLowerCase().includes(q);
      const matchHive = (h.hiveCode || '').toLowerCase().includes(q);
      const matchHoney = (h.honeyType || '').toLowerCase().includes(q);
      const matchBeekeeper = (h.submittingBeekeeper || '').toLowerCase().includes(q);
      if (!matchCode && !matchApiary && !matchHive && !matchHoney && !matchBeekeeper) {
        return false;
      }
    }
    return true;
  });

  const awaitingCount = effectiveHandovers.filter(h => isAwaitingStatus(h.status)).length;
  const acceptedUnassignedCount = effectiveHandovers.filter(h => h.status === 'RECEIVED' || h.status === INTAKE_STATUSES.RECEIVED).length;
  const heldCount = effectiveHandovers.filter(h => h.status === 'ON_HOLD' || h.status === INTAKE_STATUSES.ON_HOLD).length;

  return (
    <div className="proc-intake-container">
      {/* 1. Header Banner */}
      <div className="proc-intake-header card">
        <div className="proc-ih-left">
          <div className="proc-ih-badge-row">
            <span className="badge badge-honey">Harvest Inflow & Intake</span>
            <span className="proc-ih-count-pill">{awaitingCount} Awaiting Verification</span>
          </div>
          <h2 className="proc-ih-title">Harvest Inflow & Source Intake</h2>
          <p className="proc-ih-desc">
            Verify source provenance seals, inspect physical comb condition, and record verified arrival tare weights.
          </p>
        </div>

        {acceptedUnassignedCount > 0 && (
          <div className="proc-ih-action-box">
            <div className="proc-ih-ab-text">
              <strong>{acceptedUnassignedCount} Accepted Units Ready</strong>
              <span>Combine into a unified processing batch</span>
            </div>
            <button
              className="btn btn-primary btn-sm proc-create-batch-btn"
              onClick={() => {
                if (onOpenCreateBatch) onOpenCreateBatch();
              }}
            >
              <Plus size={14} />
              <span>Create Processing Batch</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="proc-intake-controls">
        <div className="proc-search-wrap">
          <Search size={15} className="proc-search-icon" />
          <input
            type="text"
            className="proc-search-input"
            placeholder="Search code (e.g. AP1H001F3), hive, honey type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="proc-filter-pills">
          <button
            className={`proc-f-pill ${statusFilter === 'AWAITING' ? 'active' : ''}`}
            onClick={() => setStatusFilter('AWAITING')}
          >
            Awaiting ({awaitingCount})
          </button>
          <button
            className={`proc-f-pill ${statusFilter === 'ACCEPTED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ACCEPTED')}
          >
            Accepted ({acceptedUnassignedCount})
          </button>
          {heldCount > 0 && (
            <button
              className={`proc-f-pill ${statusFilter === 'HOLD' ? 'active' : ''}`}
              onClick={() => setStatusFilter('HOLD')}
            >
              On Hold ({heldCount})
            </button>
          )}
          <button
            className={`proc-f-pill ${statusFilter === 'ASSIGNED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ASSIGNED')}
          >
            In Batches
          </button>
          <button
            className={`proc-f-pill ${statusFilter === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('REJECTED')}
          >
            Rejected
          </button>
          <button
            className={`proc-f-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All ({effectiveHandovers.length})
          </button>
        </div>
      </div>

      {/* 3. Harvest Inflow Cards List */}
      <div className="proc-intake-list">
        {filteredHandovers.length === 0 ? (
          <div className="proc-empty-card card">
            <MessageSquare size={36} color="#059669" />
            <h4 className="proc-empty-title">No Harvest Records Found</h4>
            <p className="proc-empty-text">
              {statusFilter === 'AWAITING'
                ? 'No pending harvests awaiting intake verification. When a beekeeper submits a harvest, it will appear here.'
                : 'No intake records matching current filter or search criteria.'}
            </p>
          </div>
        ) : (
          filteredHandovers.map(handover => {
            const isAwaiting = handover.status === INTAKE_STATUSES.SUBMITTED_TO_PROCESSOR || handover.status === INTAKE_STATUSES.AWAITING_INTAKE;
            const isAccepted = handover.status === INTAKE_STATUSES.RECEIVED;
            const isHeld = handover.status === INTAKE_STATUSES.ON_HOLD;
            const isAssigned = handover.status === INTAKE_STATUSES.ASSIGNED_TO_BATCH;
            const isRejected = handover.status === INTAKE_STATUSES.REJECTED;

            return (
              <div key={handover.id} className="card proc-intake-card">
                {/* Top Row: Code, Honey Type, Status Badge */}
                <div className="proc-ic-top">
                  <div className="proc-ic-id-wrap">
                    <div className="proc-ic-code-line">
                      <Droplet size={15} color="var(--color-primary-honey, #D97706)" />
                      <strong className="proc-ic-code">{handover.traceabilityCode}</strong>
                      <span className="proc-ic-type">{handover.honeyType}</span>
                    </div>
                    <span className="proc-ic-sub">
                      Harvested by {handover.submittingBeekeeper || 'Beekeeper'} · {handover.submissionTimestamp}
                    </span>
                  </div>

                  <StatusBadge
                    status={isAccepted ? 'healthy' : isRejected ? 'critical' : isHeld ? 'attention' : isAssigned ? 'healthy' : 'attention'}
                    label={handover.statusLabel || handover.status}
                    size="small"
                  />
                </div>

                {/* Middle: Provenance Grid */}
                <div className="proc-ic-provenance">
                  <div className="proc-ic-prov-item">
                    <span className="proc-ic-p-lbl">Source Yard</span>
                    <span className="proc-ic-p-val">{handover.apiaryCode || 'AP1'}</span>
                  </div>
                  <div className="proc-ic-prov-item">
                    <span className="proc-ic-p-lbl">Colony Hive</span>
                    <span className="proc-ic-p-val">{handover.hiveCode || 'H001'}</span>
                  </div>
                  <div className="proc-ic-prov-item">
                    <span className="proc-ic-p-lbl">Frame Code</span>
                    <span className="proc-ic-p-val">{handover.frameNumber || 'F3'}</span>
                  </div>
                  <div className="proc-ic-prov-item">
                    <span className="proc-ic-p-lbl">Verified Weight</span>
                    <span className="proc-ic-p-val">{handover.receivedQuantityKg || handover.quantityKg} kg</span>
                  </div>
                </div>

                {/* Additional Metadata / Rejection / Hold Notes */}
                {isRejected && (
                  <div className="proc-ic-rejection-box">
                    <XCircle size={15} color="#DC2626" />
                    <div>
                      <strong>Rejected: {handover.rejectionReason}</strong>
                      <p>"{handover.rejectionRemarks}"</p>
                    </div>
                  </div>
                )}

                {isHeld && (
                  <div className="proc-ic-hold-box">
                    <AlertTriangle size={15} color="#D97706" />
                    <div>
                      <strong>Intake Quarantine: {handover.holdReason}</strong>
                      <p>"{handover.holdRemarks}"</p>
                    </div>
                  </div>
                )}

                {isAssigned && (
                  <div className="proc-ic-assigned-box">
                    <Layers size={14} color="#059669" />
                    <span>Assigned to Processing Batch: <strong>{handover.processingBatchNumber}</strong></span>
                  </div>
                )}

                {/* Actions Row */}
                <div className="proc-ic-actions">
                  <div className="proc-ic-seal">
                    <ShieldCheck size={14} color="var(--color-warm-gray)" />
                    <span>Seal: {handover.evidence?.containerSeal || 'SEAL-INTACT'}</span>
                  </div>

                  {isAwaiting && (
                    <button
                      className="btn btn-primary btn-sm proc-verify-btn"
                      onClick={() => onOpenVerification(handover)}
                    >
                      <span>Verify & Inspect Intake</span>
                      <ArrowRight size={13} />
                    </button>
                  )}

                  {isHeld && (
                    <button
                      className="btn btn-secondary btn-sm proc-hold-btn"
                      onClick={() => onOpenVerification(handover)}
                    >
                      <span>Review / Release</span>
                      <ArrowRight size={13} />
                    </button>
                  )}

                  {isAccepted && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onOpenVerification(handover)}
                    >
                      <span>View Intake Record</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .proc-intake-container {
          padding: 16px var(--mobile-pad, 16px) 80px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .proc-intake-header {
          padding: 18px 20px;
          background: #FFFDF8;
          border: 1px solid var(--color-divider, #E5DCCB);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        @media (min-width: 600px) {
          .proc-intake-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .proc-ih-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .proc-ih-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .proc-ih-count-pill {
          font-size: 11px;
          font-weight: 700;
          color: #B45309;
          background: #FEF3C7;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .proc-ih-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
          margin: 4px 0 0;
        }

        .proc-ih-desc {
          font-size: 12.5px;
          color: var(--color-warm-gray, #736961);
          margin: 0;
          max-width: 480px;
        }

        .proc-ih-action-box {
          background: #FFF9EF;
          border: 1px solid #EAD8B8;
          border-radius: 10px;
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }

        .proc-ih-ab-text strong {
          display: block;
          font-size: 12.5px;
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-ih-ab-text span {
          font-size: 11px;
          color: var(--color-warm-gray, #736961);
        }

        .proc-intake-controls {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .proc-search-wrap {
          position: relative;
          width: 100%;
        }

        .proc-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-warm-gray, #736961);
        }

        .proc-search-input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          border-radius: 10px;
          border: 1px solid var(--color-divider, #E5DCCB);
          background: #FFFFFF;
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #2C1810);
          box-sizing: border-box;
        }

        .proc-filter-pills {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .proc-f-pill {
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid var(--color-divider, #E5DCCB);
          background: #FFFFFF;
          color: var(--color-deep-cocoa, #2C1810);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .proc-f-pill.active {
          background: var(--color-deep-cocoa, #2C1810);
          color: #FFFFFF;
          border-color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-intake-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .proc-intake-card {
          padding: 16px;
          background: #FFFFFF;
          border: 1px solid var(--color-divider, #E5DCCB);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .proc-intake-card:hover {
          border-color: #E2D3B8;
        }

        .proc-ic-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .proc-ic-id-wrap {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .proc-ic-code-line {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .proc-ic-code {
          font-family: monospace;
          font-size: 15px;
          color: var(--color-deep-cocoa, #2C1810);
        }

        .proc-ic-type {
          font-size: 11.5px;
          background: #FEF3C7;
          color: #8C5311;
          padding: 1px 7px;
          border-radius: 4px;
          font-weight: 600;
        }

        .proc-ic-sub {
          font-size: 12px;
          color: var(--color-warm-gray, #736961);
        }

        .proc-ic-provenance {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          background: #FFFDF8;
          border: 1px solid var(--color-divider, #E5DCCB);
          border-radius: 8px;
          padding: 8px 12px;
          text-align: center;
        }

        .proc-ic-prov-item {
          display: flex;
          flex-direction: column;
        }

        .proc-ic-p-lbl {
          font-size: 10px;
          color: var(--color-warm-gray, #736961);
          text-transform: uppercase;
        }

        .proc-ic-p-val {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
          margin-top: 2px;
        }

        .proc-ic-rejection-box {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          background: #FFF5F5;
          border: 1px solid #FCA5A5;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px;
          color: #991B1B;
        }

        .proc-ic-rejection-box p {
          margin: 2px 0 0;
          font-style: italic;
        }

        .proc-ic-hold-box {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #FFFBEB;
          border: 1px solid #FCD34D;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px;
          color: #92400E;
        }

        .proc-ic-hold-box p {
          margin: 2px 0 0;
          font-style: italic;
        }

        .proc-ic-assigned-box {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 12px;
          color: #166534;
        }

        .proc-ic-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #F3F4F6;
          padding-top: 10px;
        }

        .proc-ic-seal {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--color-warm-gray, #736961);
          font-family: monospace;
        }

        .proc-verify-btn {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .proc-empty-card {
          padding: 36px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .proc-empty-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
          margin: 0;
        }

        .proc-empty-text {
          font-size: 13px;
          color: var(--color-warm-gray, #736961);
          margin: 0;
          max-width: 380px;
        }
      `}</style>
    </div>
  );
};
