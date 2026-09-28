import React, { useState, useMemo } from 'react';
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
  Droplet,
  X,
  QrCode,
  Building,
  ArrowUpDown,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  FlaskConical,
  Award,
  Globe,
  FileCheck2
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { BATCH_STATUSES } from '../../services/processorDomainService';
import { LabReportModal } from '../lab/LabReportModal';

export const ProcessorBatchesView = ({
  onSelectBatch,
  onOpenCreateBatch,
  onSubmitToQuality
}) => {
  const {
    processingBatches = [],
    handoverRecords = []
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'IN_PROCESSING' | 'ON_HOLD' | 'READY_FOR_QUALITY' | 'SUBMITTED_TO_QUALITY' | 'QUALITY_PASSED'
  const [floralFilter, setFloralFilter] = useState('ALL');
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST'); // 'NEWEST' | 'YIELD_DESC' | 'STEPS_DESC' | 'CODE_ASC'
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'TABLE'
  const [selectedBatchForReport, setSelectedBatchForReport] = useState(null);

  // Extract all unique floral types from batches
  const availableFloralTypes = useMemo(() => {
    const types = new Set();
    processingBatches.forEach(b => {
      if (b.honeyType) types.add(b.honeyType);
      (b.sourceHarvests || []).forEach(s => {
        if (s.honeyType) types.add(s.honeyType);
      });
    });
    return Array.from(types).filter(Boolean);
  }, [processingBatches]);

  // Overall metrics summary
  const totalVolumeKg = useMemo(() => {
    return processingBatches.reduce((acc, b) => acc + Number(b.finalYieldKg || b.weightKg || 0), 0);
  }, [processingBatches]);

  const totalFramesCount = useMemo(() => {
    return processingBatches.reduce((acc, b) => acc + (b.sourceHarvests?.length || 0), 0);
  }, [processingBatches]);

  // Strong multi-dimensional search & filtering
  const filteredBatches = useMemo(() => {
    return processingBatches.filter(b => {
      // 1. Status Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'READY_FOR_QUALITY') {
          if (b.status !== BATCH_STATUSES.READY_FOR_QUALITY && b.status !== BATCH_STATUSES.PROCESSING_COMPLETE) {
            return false;
          }
        } else if (statusFilter === 'QUALITY_PASSED') {
          if (b.status !== BATCH_STATUSES.QUALITY_PASSED && !b.labReport && !b.coaDocumentId) {
            return false;
          }
        } else if (b.status !== statusFilter) {
          return false;
        }
      }

      // 2. Floral Filter
      if (floralFilter !== 'ALL') {
        const matchesBatchHoney = (b.honeyType || '').toLowerCase() === floralFilter.toLowerCase();
        const matchesSourceHoney = (b.sourceHarvests || []).some(
          s => (s.honeyType || '').toLowerCase() === floralFilter.toLowerCase()
        );
        if (!matchesBatchHoney && !matchesSourceHoney) {
          return false;
        }
      }

      // 3. Market Filter
      if (marketFilter !== 'ALL') {
        const mktName = (b.market?.name || '').toLowerCase();
        if (marketFilter === 'EXPORT' && !mktName.includes('export') && !mktName.includes('international') && !mktName.includes('eic')) {
          return false;
        }
        if (marketFilter === 'DOMESTIC' && !mktName.includes('domestic') && !mktName.includes('retail') && !mktName.includes('fssai')) {
          return false;
        }
      }

      // 4. Multi-field Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();

        const matchNum = (b.batchNumber || '').toLowerCase().includes(q);
        const matchName = (b.name || '').toLowerCase().includes(q);
        const matchFacility = (b.facility || '').toLowerCase().includes(q);
        const matchHoney = (b.honeyType || '').toLowerCase().includes(q);
        const matchSop = (b.sopCode || '').toLowerCase().includes(q);
        const matchProduct = (b.product?.name || '').toLowerCase().includes(q);
        const matchMarket = (b.market?.name || '').toLowerCase().includes(q);
        const matchOperator = (b.leadOperator || '').toLowerCase().includes(q);
        const matchStatus = (b.statusLabel || b.status || '').toLowerCase().includes(q);

        const matchSources = (b.sourceHarvests || []).some(s => {
          const codeMatch = (s.traceabilityCode || '').toLowerCase().includes(q);
          const hiveMatch = (s.hiveCode || '').toLowerCase().includes(q);
          const apiaryMatch = (s.apiaryCode || '').toLowerCase().includes(q);
          const frameMatch = String(s.frameNumber || '').toLowerCase().includes(q);
          const beekeeperMatch = (s.submittingBeekeeper || s.beekeeperName || '').toLowerCase().includes(q);
          const honeyMatch = (s.honeyType || '').toLowerCase().includes(q);
          return codeMatch || hiveMatch || apiaryMatch || frameMatch || beekeeperMatch || honeyMatch;
        });

        if (
          !matchNum &&
          !matchName &&
          !matchFacility &&
          !matchHoney &&
          !matchSop &&
          !matchProduct &&
          !matchMarket &&
          !matchOperator &&
          !matchStatus &&
          !matchSources
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'YIELD_DESC') {
        const yA = Number(a.finalYieldKg || a.weightKg || 0);
        const yB = Number(b.finalYieldKg || b.weightKg || 0);
        return yB - yA;
      }
      if (sortBy === 'STEPS_DESC') {
        const sA = (a.steps || []).length;
        const sB = (b.steps || []).length;
        return sB - sA;
      }
      if (sortBy === 'CODE_ASC') {
        return (a.batchNumber || '').localeCompare(b.batchNumber || '');
      }
      // Default: NEWEST first
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [processingBatches, statusFilter, floralFilter, marketFilter, searchQuery, sortBy]);

  const inProcessingCount = processingBatches.filter(b => b.status === BATCH_STATUSES.IN_PROCESSING).length;
  const onHoldCount = processingBatches.filter(b => b.status === BATCH_STATUSES.ON_HOLD).length;
  const readyCount = processingBatches.filter(
    b => b.status === BATCH_STATUSES.READY_FOR_QUALITY || b.status === BATCH_STATUSES.PROCESSING_COMPLETE
  ).length;
  const submittedCount = processingBatches.filter(b => b.status === BATCH_STATUSES.SUBMITTED_TO_QUALITY).length;
  const certifiedCount = processingBatches.filter(b => b.status === BATCH_STATUSES.QUALITY_PASSED || b.labReport || b.coaDocumentId).length;

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'ALL' || floralFilter !== 'ALL' || marketFilter !== 'ALL' || sortBy !== 'NEWEST';

  const resetAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setFloralFilter('ALL');
    setMarketFilter('ALL');
    setSortBy('NEWEST');
  };

  return (
    <div className="proc-batches-container">
      {/* 1. Header & Create Button */}
      <div className="proc-batches-header card">
        <div className="proc-bh-left">
          <div className="proc-bh-badge-row">
            <span className="badge badge-honey">Master Registry</span>
            <span className="proc-bh-count-pill">{processingBatches.length} Archived Batches</span>
            <span className="proc-bh-ledger-pill">Many-to-One Traceability</span>
          </div>
          <h2 className="proc-bh-title">Master Batch Registry & Traceability Ledger</h2>
          <p className="proc-bh-desc">
            Complete lifetime production archive, many-to-one lineage audits, certified quality handoffs, and packaging inventory.
          </p>
        </div>

        <button
          className="btn btn-primary proc-new-batch-btn"
          onClick={onOpenCreateBatch}
        >
          <Plus size={16} />
          <span>New Processing Batch</span>
        </button>
      </div>

      {/* 2. Key Metrics Summary Strip */}
      <div className="proc-metrics-strip">
        <div className="proc-metric-pill">
          <span className="proc-mp-icon amber"><Cpu size={15} /></span>
          <div className="proc-mp-info">
            <span className="proc-mp-val">{processingBatches.length}</span>
            <span className="proc-mp-lbl">Lifetime Batches</span>
          </div>
        </div>

        <div className="proc-metric-pill">
          <span className="proc-mp-icon honey"><Droplet size={15} /></span>
          <div className="proc-mp-info">
            <span className="proc-mp-val">{totalVolumeKg.toFixed(1)} kg</span>
            <span className="proc-mp-lbl">Total Net Volume Traced</span>
          </div>
        </div>

        <div className="proc-metric-pill">
          <span className="proc-mp-icon green"><Layers size={15} /></span>
          <div className="proc-mp-info">
            <span className="proc-mp-val">{totalFramesCount}</span>
            <span className="proc-mp-lbl">Source Harvest Frames</span>
          </div>
        </div>

        <div className="proc-metric-pill">
          <span className="proc-mp-icon blue"><ShieldCheck size={15} /></span>
          <div className="proc-mp-info">
            <span className="proc-mp-val">{readyCount + submittedCount}</span>
            <span className="proc-mp-lbl">Certified / QC Handoff</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Comprehensive Controls Card */}
      <div className="proc-controls-card card">
        {/* Search Bar with Instant Clear */}
        <div className="proc-search-row">
          <div className="proc-search-wrap">
            <Search size={18} className="proc-search-icon" />
            <input
              type="text"
              className="proc-search-input"
              placeholder="Search batch registry (PB-2026-00001), frame QR (AP1H001F1), floral type, beekeeper, or market..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="proc-search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Primary Status Filter Tabs */}
        <div className="proc-filter-row">
          <div className="proc-filter-pills" role="tablist">
            <button
              type="button"
              className={`proc-f-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              <span>All Batches</span>
              <span className="proc-pill-count">{processingBatches.length}</span>
            </button>
            <button
              type="button"
              className={`proc-f-pill ${statusFilter === 'IN_PROCESSING' ? 'active' : ''}`}
              onClick={() => setStatusFilter('IN_PROCESSING')}
            >
              <span>In Production</span>
              <span className="proc-pill-count">{inProcessingCount}</span>
            </button>
            <button
              type="button"
              className={`proc-f-pill ${statusFilter === 'ON_HOLD' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ON_HOLD')}
            >
              <span>On Hold</span>
              <span className="proc-pill-count">{onHoldCount}</span>
            </button>
            <button
              type="button"
              className={`proc-f-pill ${statusFilter === 'READY_FOR_QUALITY' ? 'active' : ''}`}
              onClick={() => setStatusFilter('READY_FOR_QUALITY')}
            >
              <span>Ready for Quality</span>
              <span className="proc-pill-count">{readyCount}</span>
            </button>
            <button
              type="button"
              className={`proc-f-pill ${statusFilter === 'SUBMITTED_TO_QUALITY' ? 'active' : ''}`}
              onClick={() => setStatusFilter('SUBMITTED_TO_QUALITY')}
            >
              <span>Submitted to Lab</span>
              <span className="proc-pill-count">{submittedCount}</span>
            </button>
            <button
              type="button"
              className={`proc-f-pill ${statusFilter === 'QUALITY_PASSED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('QUALITY_PASSED')}
              style={{
                borderColor: statusFilter === 'QUALITY_PASSED' ? '#059669' : undefined,
                color: statusFilter === 'QUALITY_PASSED' ? '#059669' : undefined
              }}
            >
              <ShieldCheck size={13} style={{ color: '#059669', marginRight: '4px' }} />
              <span>Certified (CoA)</span>
              <span className="proc-pill-count" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>{certifiedCount}</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter & Sort Bar */}
        <div className="proc-subcontrols-bar">
          <div className="proc-subc-left">
            {availableFloralTypes.length > 0 && (
              <div className="proc-select-wrapper">
                <span className="proc-select-label">Floral Variety:</span>
                <select
                  className="proc-dropdown-select"
                  value={floralFilter}
                  onChange={e => setFloralFilter(e.target.value)}
                >
                  <option value="ALL">All Varieties</option>
                  {availableFloralTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="proc-select-wrapper">
              <span className="proc-select-label">Market Spec:</span>
              <select
                className="proc-dropdown-select"
                value={marketFilter}
                onChange={e => setMarketFilter(e.target.value)}
              >
                <option value="ALL">All Markets</option>
                <option value="DOMESTIC">Domestic Retail (FSSAI)</option>
                <option value="EXPORT">Export Consignment (EIC)</option>
              </select>
            </div>

            <div className="proc-select-wrapper">
              <span className="proc-select-label">Sort:</span>
              <select
                className="proc-dropdown-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="NEWEST">Newest First</option>
                <option value="YIELD_DESC">Net Volume (High → Low)</option>
                <option value="STEPS_DESC">Steps Progress</option>
                <option value="CODE_ASC">Batch Code (A → Z)</option>
              </select>
            </div>
          </div>

          <div className="proc-subc-right">
            {/* View Mode Toggle Switch */}
            <div className="proc-view-toggle">
              <button
                type="button"
                className={`proc-vt-btn ${viewMode === 'GRID' ? 'active' : ''}`}
                onClick={() => setViewMode('GRID')}
                title="Card Grid View"
              >
                <LayoutGrid size={14} />
                <span>Cards</span>
              </button>
              <button
                type="button"
                className={`proc-vt-btn ${viewMode === 'TABLE' ? 'active' : ''}`}
                onClick={() => setViewMode('TABLE')}
                title="Traceability Table View"
              >
                <TableIcon size={14} />
                <span>Ledger Table</span>
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="proc-reset-btn"
                onClick={resetAllFilters}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Batches Grid or Ledger Table */}
      {filteredBatches.length === 0 ? (
        <div className="proc-empty-card card">
          <div className="proc-empty-icon-wrap">
            <Search size={32} color="#D97706" />
          </div>
          <h4 className="proc-empty-title">No Matching Batches in Registry</h4>
          <p className="proc-empty-text">
            {searchQuery
              ? `No batches matching "${searchQuery}" in registry.`
              : 'No processing batches found matching the selected filters.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary btn-sm proc-empty-reset-btn"
              onClick={resetAllFilters}
            >
              <RotateCcw size={14} />
              <span>Clear Search & Filters</span>
            </button>
          )}
        </div>
      ) : viewMode === 'TABLE' ? (
        /* TABLE / LEDGER VIEW */
        <div className="proc-ledger-table-wrap card">
          <table className="proc-ledger-table">
            <thead>
              <tr>
                <th>Batch Code & Name</th>
                <th>Floral Type</th>
                <th>Tare / Net Weight</th>
                <th>Source Lineage</th>
                <th>SOP Compliance</th>
                <th>Status</th>
                <th>Market & Spec</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map(batch => {
                const isReady = batch.status === BATCH_STATUSES.READY_FOR_QUALITY || batch.status === BATCH_STATUSES.PROCESSING_COMPLETE;
                const isHold = batch.status === BATCH_STATUSES.ON_HOLD;
                const isSubmitted = batch.status === BATCH_STATUSES.SUBMITTED_TO_QUALITY;

                return (
                  <tr
                    key={batch.id}
                    className="proc-table-row"
                    onClick={() => onSelectBatch(batch)}
                  >
                    <td>
                      <div className="proc-td-batch-id">
                        <QrCode size={14} color="#D97706" />
                        <strong>{batch.batchNumber}</strong>
                      </div>
                      <span className="proc-td-batch-name">{batch.name}</span>
                    </td>
                    <td>
                      <span className="proc-td-honey-tag">{batch.honeyType || 'Wildflower'}</span>
                    </td>
                    <td>
                      <strong className="proc-td-weight">{batch.finalYieldKg || batch.weightKg || 0} kg</strong>
                    </td>
                    <td>
                      <span className="proc-td-sources-count">{batch.sourceHarvests?.length || 0} Frames</span>
                      <div className="proc-td-sources-chips">
                        {(batch.sourceHarvests || []).slice(0, 2).map((s, i) => (
                          <span key={i} className="proc-td-chip">{s.traceabilityCode}</span>
                        ))}
                        {(batch.sourceHarvests || []).length > 2 && (
                          <span className="proc-td-more">+{batch.sourceHarvests.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="proc-td-sop">{batch.sopCode || 'SOP-001'}</span>
                    </td>
                    <td>
                      <StatusBadge
                        status={isSubmitted ? 'healthy' : isHold ? 'attention' : isReady ? 'healthy' : 'healthy'}
                        label={batch.statusLabel || batch.status}
                        size="small"
                      />
                    </td>
                    <td>
                      <span className="proc-td-market">{batch.market?.name || 'Domestic Retail'}</span>
                    </td>
                    <td className="text-right">
                      {batch.labReport || batch.coaDocumentId ? (
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            padding: '4px 9px',
                            fontSize: '11.5px',
                            backgroundColor: '#ECFDF5',
                            color: '#047857',
                            border: '1px solid #A7F3D0',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBatchForReport(batch);
                          }}
                        >
                          <ShieldCheck size={13} />
                          <span>View CoA</span>
                        </button>
                      ) : isReady && !isSubmitted ? (
                        <button
                          type="button"
                          className="proc-table-action-btn qc"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSubmitToQuality) onSubmitToQuality(batch.id);
                          }}
                        >
                          <FlaskConical size={13} />
                          <span>Submit QC</span>
                        </button>
                      ) : (
                        <div className="proc-table-arrow">
                          <span>Inspect</span>
                          <ChevronRight size={13} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div className="proc-batches-grid">
          {filteredBatches.map(batch => {
            const isHold = batch.status === BATCH_STATUSES.ON_HOLD;
            const isReady = batch.status === BATCH_STATUSES.READY_FOR_QUALITY || batch.status === BATCH_STATUSES.PROCESSING_COMPLETE;
            const isSubmitted = batch.status === BATCH_STATUSES.SUBMITTED_TO_QUALITY;
            const isCertified = batch.status === BATCH_STATUSES.QUALITY_PASSED || Boolean(batch.labReport || batch.coaDocumentId);

            const totalPlanSteps = batch.approvedPlan?.length || 5;
            const completedSteps = (batch.steps || []).length;
            const progressPct = Math.min(100, Math.round((completedSteps / totalPlanSteps) * 100));

            return (
              <div
                key={batch.id}
                className="card proc-batch-card"
                onClick={() => onSelectBatch(batch)}
              >
                {/* Batch Card Header */}
                <div className="proc-bc-header">
                  <div className="proc-bc-id-block">
                    <div className="proc-bc-code-row">
                      <QrCode size={16} color="#D97706" />
                      <h3 className="proc-bc-num">{batch.batchNumber}</h3>
                    </div>
                    <span className="proc-bc-name">{batch.name}</span>
                  </div>

                  <StatusBadge
                    status={isCertified ? 'healthy' : isSubmitted ? 'healthy' : isHold ? 'attention' : isReady ? 'healthy' : 'healthy'}
                    label={batch.statusLabel || batch.status}
                    size="small"
                  />
                </div>

                {/* Lineage & Spec Pill Bar */}
                <div className="proc-bc-spec-bar">
                  <span className="proc-spec-tag floral">{batch.honeyType || 'Wildflower'}</span>
                  <span className="proc-spec-tag market">{batch.market?.name || 'Domestic Retail'}</span>
                  <span className="proc-spec-tag sop">{batch.sopCode || 'SOP-001'}</span>
                  {isCertified && (
                    <span className="proc-spec-tag" style={{ backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <ShieldCheck size={11} /> CoA Certified
                    </span>
                  )}
                </div>

                {/* 3-Column Stats Grid */}
                <div className="proc-bc-stats">
                  <div className="proc-bc-stat">
                    <span className="proc-bc-lbl">Tare / Net Volume</span>
                    <strong className="proc-bc-val">{batch.finalYieldKg || batch.weightKg || 0} kg</strong>
                  </div>
                  <div className="proc-bc-stat">
                    <span className="proc-bc-lbl">Source Provenance</span>
                    <strong className="proc-bc-val">{batch.sourceHarvests?.length || 0} Frames</strong>
                  </div>
                  <div className="proc-bc-stat">
                    <span className="proc-bc-lbl">Steps Completed</span>
                    <strong className="proc-bc-val">{completedSteps}/{totalPlanSteps}</strong>
                  </div>
                </div>

                {/* Source Units Lineage Chips */}
                <div className="proc-bc-sources">
                  <span className="proc-bc-src-label">Traceability Tree:</span>
                  <div className="proc-bc-src-chips">
                    {(batch.sourceHarvests || []).slice(0, 3).map((s, i) => (
                      <span key={i} className="proc-bc-src-chip" title={`${s.honeyType || 'Honey'} from Hive ${s.hiveCode || 'H001'}`}>
                        <QrCode size={11} color="#D97706" />
                        <span>{s.traceabilityCode}</span>
                      </span>
                    ))}
                    {(batch.sourceHarvests || []).length > 3 && (
                      <span className="proc-bc-src-more">
                        +{batch.sourceHarvests.length - 3} more frames
                      </span>
                    )}
                  </div>
                </div>

                {/* Batch Card Footer & Actions */}
                <div className="proc-bc-footer">
                  <div className="proc-bc-facility">
                    <Building size={13} color="#8C7E72" />
                    <span>{batch.facility || 'Central Facility #2'}</span>
                  </div>

                  <div className="proc-bc-card-actions">
                    {isCertified && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          backgroundColor: '#059669',
                          color: '#FFFFFF',
                          borderColor: '#059669',
                          padding: '5px 11px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBatchForReport(batch);
                        }}
                      >
                        <FileCheck2 size={13} />
                        <span>View Lab Report</span>
                      </button>
                    )}
                    {isReady && !isSubmitted && !isCertified && (
                      <button
                        type="button"
                        className="proc-bc-submit-qc-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSubmitToQuality) onSubmitToQuality(batch.id);
                        }}
                      >
                        <FlaskConical size={13} />
                        <span>Submit QC</span>
                      </button>
                    )}
                    <div className="proc-bc-arrow">
                      <span>View Lineage</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LabReportModal
        isOpen={Boolean(selectedBatchForReport)}
        onClose={() => setSelectedBatchForReport(null)}
        report={selectedBatchForReport?.labReport}
      />

      {/* Comprehensive Scoped Modern Styling */}
      <style>{`
        .proc-batches-container {
          padding: 18px var(--mobile-pad, 16px) 80px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* 1. Header Card */
        .proc-batches-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #FFFCF8 0%, #FFF8EE 100%);
          border: 1.5px solid #F1ECE1;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 4px 16px rgba(46, 31, 20, 0.04);
        }

        @media (min-width: 640px) {
          .proc-batches-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .proc-bh-left {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .proc-bh-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .proc-bh-count-pill {
          font-size: 11px;
          font-weight: 700;
          color: #B45309;
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          padding: 2px 9px;
          border-radius: 20px;
        }

        .proc-bh-ledger-pill {
          font-size: 11px;
          font-weight: 700;
          color: #047857;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          padding: 2px 9px;
          border-radius: 20px;
        }

        .proc-bh-title {
          font-size: 20px;
          font-weight: 800;
          color: #2E1F14;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .proc-bh-desc {
          font-size: 13px;
          color: #6B5B4E;
          margin: 0;
          line-height: 1.4;
        }

        .proc-new-batch-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
          height: 44px;
          padding: 0 18px;
          font-size: 13.5px;
          font-weight: 700;
          border-radius: 12px;
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
          color: #FFFFFF;
          border: none;
          box-shadow: 0 4px 14px rgba(217, 119, 6, 0.25);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .proc-new-batch-btn:hover {
          background: linear-gradient(135deg, #B45309 0%, #92400E 100%);
          transform: translateY(-1px);
        }

        /* 2. Key Metrics Strip */
        .proc-metrics-strip {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (min-width: 768px) {
          .proc-metrics-strip {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .proc-metric-pill {
          background: #FFFFFF;
          border: 1.5px solid #EADBCE;
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(46, 31, 20, 0.03);
          transition: transform 0.15s ease, border-color 0.15s ease;
        }

        .proc-metric-pill:hover {
          border-color: #D97706;
          transform: translateY(-1px);
        }

        .proc-mp-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .proc-mp-icon.amber {
          background: #FEF3C7;
          color: #D97706;
        }

        .proc-mp-icon.honey {
          background: #FFFBEB;
          color: #B45309;
        }

        .proc-mp-icon.green {
          background: #ECFDF5;
          color: #059669;
        }

        .proc-mp-icon.blue {
          background: #EFF6FF;
          color: #2563EB;
        }

        .proc-mp-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .proc-mp-val {
          font-size: 16px;
          font-weight: 800;
          color: #2E1F14;
          line-height: 1.2;
        }

        .proc-mp-lbl {
          font-size: 11px;
          font-weight: 600;
          color: #8C7E72;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* 3. Controls Card */
        .proc-controls-card {
          background: #FFFFFF;
          border: 1.5px solid #EADBCE;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 4px 16px rgba(46, 31, 20, 0.04);
        }

        .proc-search-row {
          width: 100%;
        }

        .proc-search-wrap {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .proc-search-icon {
          position: absolute;
          left: 14px;
          color: #D97706;
          pointer-events: none;
        }

        .proc-search-input {
          width: 100%;
          height: 44px;
          padding: 0 40px 0 42px;
          border-radius: 12px;
          border: 1.5px solid #D6CEBE;
          background: #FFFCF8;
          font-size: 13.5px;
          color: #2E1F14;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .proc-search-input:focus {
          border-color: #D97706;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
        }

        .proc-search-clear-btn {
          position: absolute;
          right: 12px;
          background: #F3EDE2;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6B5B4E;
          cursor: pointer;
        }

        /* Filter Pills */
        .proc-filter-row {
          overflow-x: auto;
          scrollbar-width: none;
        }

        .proc-filter-row::-webkit-scrollbar {
          display: none;
        }

        .proc-filter-pills {
          display: flex;
          gap: 8px;
          padding: 2px 0;
        }

        .proc-f-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 20px;
          border: 1.5px solid #E5DCCB;
          background: #FFFCF8;
          color: #4A3B32;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.18s ease;
        }

        .proc-f-pill:hover {
          border-color: #D97706;
          background: #FFFDF8;
        }

        .proc-f-pill.active {
          background: #2E1F14;
          color: #FFFFFF;
          border-color: #2E1F14;
          box-shadow: 0 3px 10px rgba(46, 31, 20, 0.2);
        }

        .proc-pill-count {
          font-size: 11px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 10px;
          background: #F3EDE2;
          color: #786C60;
        }

        .proc-f-pill.active .proc-pill-count {
          background: #D97706;
          color: #FFFFFF;
        }

        /* Subcontrols Bar */
        .proc-subcontrols-bar {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 10px;
          border-top: 1px solid #F1ECE1;
        }

        @media (min-width: 640px) {
          .proc-subcontrols-bar {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .proc-subc-left {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
        }

        .proc-select-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .proc-select-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #6B5B4E;
          text-transform: uppercase;
        }

        .proc-dropdown-select {
          height: 32px;
          padding: 0 10px;
          border-radius: 8px;
          border: 1.5px solid #D6CEBE;
          background: #FFFFFF;
          font-size: 12px;
          font-weight: 600;
          color: #2E1F14;
          outline: none;
          cursor: pointer;
        }

        .proc-subc-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* View Toggle */
        .proc-view-toggle {
          display: flex;
          background: #FAF6ED;
          border: 1px solid #E5DCCB;
          border-radius: 8px;
          padding: 2px;
          gap: 2px;
        }

        .proc-vt-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 6px;
          border: none;
          background: transparent;
          font-size: 11.5px;
          font-weight: 700;
          color: #6B5B4E;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .proc-vt-btn.active {
          background: #FFFFFF;
          color: #D97706;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        }

        .proc-reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          color: #92400E;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
        }

        /* 4. Ledger Table View */
        .proc-ledger-table-wrap {
          background: #FFFFFF;
          border: 1.5px solid #EADBCE;
          border-radius: 16px;
          overflow-x: auto;
          box-shadow: 0 4px 16px rgba(46, 31, 20, 0.04);
        }

        .proc-ledger-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
          text-align: left;
        }

        .proc-ledger-table th {
          background: #FAF6ED;
          color: #6B5B4E;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          padding: 12px 16px;
          border-bottom: 1.5px solid #EADBCE;
          white-space: nowrap;
        }

        .proc-ledger-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #F1ECE1;
          color: #2E1F14;
          vertical-align: middle;
        }

        .proc-table-row {
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .proc-table-row:hover {
          background: #FFFDF8;
        }

        .proc-td-batch-id {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13.5px;
        }

        .proc-td-batch-name {
          font-size: 11.5px;
          color: #786C60;
          display: block;
        }

        .proc-td-honey-tag {
          background: #FEF3C7;
          color: #92400E;
          font-weight: 700;
          font-size: 11px;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .proc-td-weight {
          font-weight: 800;
          color: #B45309;
        }

        .proc-td-sources-count {
          font-weight: 700;
          font-size: 11.5px;
          display: block;
        }

        .proc-td-sources-chips {
          display: flex;
          gap: 4px;
          margin-top: 2px;
        }

        .proc-td-chip {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          background: #FAF6ED;
          border: 1px solid #E5DCCB;
          padding: 1px 4px;
          border-radius: 4px;
        }

        .proc-td-more {
          font-size: 10px;
          color: #8C7E72;
        }

        .proc-td-sop {
          font-size: 11px;
          font-weight: 700;
          color: #4A3B32;
        }

        .proc-td-market {
          font-size: 11.5px;
          color: #6B5B4E;
        }

        .proc-table-action-btn.qc {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
          color: #FFFFFF;
          border: none;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .proc-table-arrow {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: #D97706;
          font-size: 11.5px;
          font-weight: 700;
        }

        .text-right {
          text-align: right;
        }

        /* 5. Cards Grid View */
        .proc-batches-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        @media (min-width: 680px) {
          .proc-batches-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .proc-batch-card {
          padding: 18px;
          background: #FFFFFF;
          border: 1.5px solid #EADBCE;
          border-radius: 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(46, 31, 20, 0.04);
        }

        .proc-batch-card:hover {
          border-color: #D97706;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(217, 119, 6, 0.12);
        }

        .proc-bc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .proc-bc-id-block {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .proc-bc-code-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .proc-bc-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          font-weight: 800;
          color: #2E1F14;
          margin: 0;
        }

        .proc-bc-name {
          font-size: 13px;
          color: #6B5B4E;
        }

        /* Spec Bar */
        .proc-bc-spec-bar {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .proc-spec-tag {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .proc-spec-tag.floral {
          background: #FEF3C7;
          color: #92400E;
          border: 1px solid #FDE68A;
        }

        .proc-spec-tag.market {
          background: #EFF6FF;
          color: #1E40AF;
          border: 1px solid #BFDBFE;
        }

        .proc-spec-tag.sop {
          background: #FAF6ED;
          color: #5C4D42;
          border: 1px solid #E5DCCB;
        }

        /* 3-Column Stats Grid */
        .proc-bc-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background: #FAF6ED;
          border: 1px solid #EADBCE;
          padding: 10px 12px;
          border-radius: 10px;
          text-align: center;
        }

        .proc-bc-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .proc-bc-lbl {
          font-size: 10px;
          font-weight: 700;
          color: #8C7E72;
          text-transform: uppercase;
        }

        .proc-bc-val {
          font-size: 13.5px;
          font-weight: 800;
          color: #2E1F14;
        }

        /* Sources */
        .proc-bc-sources {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          font-size: 11.5px;
        }

        .proc-bc-src-label {
          color: #786C60;
          font-weight: 600;
        }

        .proc-bc-src-chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          align-items: center;
        }

        .proc-bc-src-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: 'JetBrains Mono', monospace;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          padding: 2px 7px;
          border-radius: 6px;
          color: #92400E;
          font-size: 11px;
          font-weight: 700;
        }

        .proc-bc-src-more {
          color: #8C7E72;
          font-size: 11px;
        }

        /* Footer */
        .proc-bc-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          border-top: 1px solid #F1ECE1;
          padding-top: 10px;
        }

        .proc-bc-facility {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6B5B4E;
          font-weight: 500;
        }

        .proc-bc-card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .proc-bc-submit-qc-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          color: #92400E;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
        }

        .proc-bc-arrow {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #D97706;
          font-weight: 700;
        }

        /* Empty State */
        .proc-empty-card {
          padding: 40px 24px;
          background: #FFFDF8;
          border: 1.5px dashed #D6CEBE;
          border-radius: 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .proc-empty-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #FEF3C7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .proc-empty-title {
          font-size: 16px;
          font-weight: 800;
          color: #2E1F14;
          margin: 0;
        }

        .proc-empty-text {
          font-size: 13px;
          color: #6B5B4E;
          margin: 0;
          max-width: 380px;
        }

        .proc-empty-reset-btn {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>
    </div>
  );
};
