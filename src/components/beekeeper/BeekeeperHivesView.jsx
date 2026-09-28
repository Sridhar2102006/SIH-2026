import React, { useState, useMemo } from 'react';
import {
  Layers,
  Building2,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Thermometer,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Droplet,
  Sparkles,
  X,
  QrCode
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { HiveDetailView } from './HiveDetailView';
import { RegisterFrameModal } from './RegisterFrameModal';
import { AddHiveModal } from '../hives/AddHiveModal';
import { HiveBatchModal } from './HiveBatchModal';

export const BeekeeperHivesView = () => {
  const {
    hives = [],
    apiaries = [],
    frames = [],
    hiveManagementBatches = [],
    selectedHiveId,
    setSelectedHiveId,
    deleteHive,
    openSheet
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'healthy' | 'attention' | 'ready' | 'harvested'
  const [selectedBatchId, setSelectedBatchId] = useState('all');
  const [isRegisterFrameOpen, setIsRegisterFrameOpen] = useState(false);
  const [isAddHiveOpen, setIsAddHiveOpen] = useState(false);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);

  // Active non-archived hives
  const activeHives = useMemo(() => hives.filter(h => !h.isArchived), [hives]);

  // Derived Batches from batch state & hive associations
  const availableBatches = useMemo(() => {
    const map = new Map();
    (hiveManagementBatches || []).forEach(b => {
      if (b.id) map.set(b.id, { id: b.id, name: b.name || `Batch ${b.id}`, status: b.status || 'ACTIVE' });
    });
    (hives || []).forEach(h => {
      if (h.batchId && !map.has(h.batchId)) {
        map.set(h.batchId, { id: h.batchId, name: h.batchName || `Batch ${h.batchId}`, status: 'ACTIVE' });
      }
    });
    return Array.from(map.values());
  }, [hiveManagementBatches, hives]);

  // Helper to get all frames belonging to a hive
  const getHiveFrames = (hive) => {
    const cleanCode = hive.code ? (String(hive.code).startsWith('H') ? hive.code : `H${String(hive.code).padStart(3, '0')}`) : 'H001';
    return frames.filter(f =>
      f.hiveId === hive.id ||
      f.hiveCode === cleanCode ||
      f.hiveCode === hive.code ||
      (f.traceabilityCode && f.traceabilityCode.includes(cleanCode))
    );
  };

  // Pre-calculate statistics for every hive
  const hivesWithStats = useMemo(() => {
    return activeHives.map(hive => {
      const cleanCode = hive.code ? (String(hive.code).startsWith('H') ? hive.code : `H${String(hive.code).padStart(3, '0')}`) : 'H001';
      const hiveFrames = getHiveFrames(hive);
      const totalFrames = hiveFrames.length || hive.superFramesTotal || 10;
      const harvestedFrames = hiveFrames.filter(f => f.status === 'HARVESTED' || f.status === 'SUBMITTED_TO_PROCESSOR').length;
      const readyFrames = hiveFrames.filter(f => f.status === 'READY_FOR_HARVEST' || (f.status === 'ACTIVE' && f.cappedPercentage >= 85)).length;
      const activeGrowthFrames = totalFrames - harvestedFrames;
      const harvestPercent = totalFrames > 0 ? Math.round((harvestedFrames / totalFrames) * 100) : 0;

      return {
        ...hive,
        cleanCode,
        hiveFrames,
        totalFrames,
        harvestedFrames,
        readyFrames,
        activeGrowthFrames,
        harvestPercent
      };
    });
  }, [activeHives, frames]);

  // Calculate live counts for filter pills
  const counts = useMemo(() => {
    return {
      all: hivesWithStats.length,
      healthy: hivesWithStats.filter(h => h.status === 'healthy').length,
      attention: hivesWithStats.filter(h => h.status === 'attention').length,
      ready: hivesWithStats.filter(h => h.readyFrames > 0).length,
      harvested: hivesWithStats.filter(h => h.harvestedFrames > 0).length
    };
  }, [hivesWithStats]);

  // Filtered hives based on search query, batch, and status
  const filteredHives = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return hivesWithStats.filter(hive => {
      // 1. Batch filter
      if (selectedBatchId !== 'all') {
        const selectedBatch = hiveManagementBatches.find(b => b.id === selectedBatchId);
        const isMember = selectedBatch?.memberships?.some(m => m.hiveId === hive.id) || hive.batchId === selectedBatchId;
        if (!isMember) return false;
      }

      // 2. Status filter
      if (statusFilter === 'healthy' && hive.status !== 'healthy') return false;
      if (statusFilter === 'attention' && hive.status !== 'attention') return false;
      if (statusFilter === 'ready' && hive.readyFrames === 0) return false;
      if (statusFilter === 'harvested' && hive.harvestedFrames === 0) return false;

      // 3. Multi-Entity Dynamic Keyword Search
      if (q) {
        const matchName = (hive.name || '').toLowerCase().includes(q);
        const matchCode = (hive.cleanCode || '').toLowerCase().includes(q) || String(hive.code || '').toLowerCase().includes(q);
        const matchLoc = (hive.location || '').toLowerCase().includes(q);
        const matchBatch = (hive.batchName || '').toLowerCase().includes(q);
        const matchHoney = (hive.honeyType || hive.honeyVariety || hive.forage || '').toLowerCase().includes(q);
        
        // Search inside individual frames of this hive
        const matchedFrame = hive.hiveFrames.find(f =>
          (f.traceabilityCode || '').toLowerCase().includes(q) ||
          (f.frameNumber || '').toLowerCase().includes(q) ||
          (f.honeyType || '').toLowerCase().includes(q) ||
          (f.status || '').toLowerCase().includes(q)
        );

        if (matchedFrame) {
          hive.matchedFrameCode = matchedFrame.traceabilityCode;
          return true;
        }

        hive.matchedFrameCode = null;
        return matchName || matchCode || matchLoc || matchBatch || matchHoney;
      }

      hive.matchedFrameCode = null;
      return true;
    });
  }, [hivesWithStats, selectedBatchId, statusFilter, searchQuery, hiveManagementBatches]);

  // If a specific hive is selected, render the Master Hive Detail Screen (Screen 5) AFTER all hooks have executed
  if (selectedHiveId) {
    return (
      <HiveDetailView
        hiveId={selectedHiveId}
        onBack={() => setSelectedHiveId(null)}
      />
    );
  }

  return (
    <div className="bk-hives-view-viewport">
      {/* Header */}
      <header className="bk-hv-header">
        <div className="bk-hv-title-row">
          <div>
            <h1 className="bk-hv-title">Field Management</h1>
            <p className="bk-hv-sub">Manage Hive boxes, health status, and live harvest progress</p>
          </div>
          <div className="bk-hv-head-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsCreateBatchOpen(true)}
            >
              <Plus size={14} />
              <span>Create Batch</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAddHiveOpen(true)}
            >
              <Plus size={14} />
              <span>Hive Box</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="bk-hv-content">
        {/* Active Management Batches Strip */}
        {availableBatches.length > 0 && (
          <div className="bk-batch-strip-section">
            <div className="bk-batch-strip-header">
              <div className="bk-batch-strip-title-group">
                <Layers size={16} color="#D97706" />
                <span className="bk-batch-strip-title">Management Batches</span>
                <span className="bk-batch-strip-hint">({availableBatches.length} active cycles)</span>
              </div>
              
            </div>

            <div className="bk-batch-cards-row">
              <button
                type="button"
                className={`bk-batch-chip ${selectedBatchId === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedBatchId('all')}
              >
                <div className="bk-batch-chip-head">
                  <span className="bk-batch-chip-name">All Colonies</span>
                  <span className="bk-batch-chip-status">TOTAL</span>
                </div>
                <div className="bk-batch-chip-stats">
                  <span>{activeHives.length} hives</span>
                  <span>•</span>
                  <span>{frames.length} frames</span>
                </div>
              </button>

              {availableBatches.map(batch => {
                const batchHives = activeHives.filter(h =>
                  h.batchId === batch.id || (batch.memberships || []).some(m => m.hiveId === h.id)
                );
                const batchHiveIds = new Set(batchHives.map(h => h.id));
                const batchHiveCodes = new Set(batchHives.map(h => (String(h.code).startsWith('H') ? h.code : `H${String(h.code).padStart(3, '0')}`)));
                const batchFrames = frames.filter(f => batchHiveIds.has(f.hiveId) || batchHiveCodes.has(f.hiveCode));
                const batchHarvested = batchFrames.filter(f => f.status === 'HARVESTED' || f.status === 'SUBMITTED_TO_PROCESSOR').length;
                const batchTotal = batchFrames.length || (batchHives.length * 10);
                const batchPercent = batchTotal > 0 ? Math.round((batchHarvested / batchTotal) * 100) : 0;
                const isSelected = selectedBatchId === batch.id;
                const isFullyHarvested = batchPercent === 100 && batchTotal > 0;

                return (
                  <button
                    key={batch.id}
                    type="button"
                    className={`bk-batch-chip ${isSelected ? 'active' : ''} ${isFullyHarvested ? 'harvested' : ''}`}
                    onClick={() => setSelectedBatchId(isSelected ? 'all' : batch.id)}
                  >
                    <div className="bk-batch-chip-head">
                      <span className="bk-batch-chip-name">{batch.name}</span>
                      <span className={`bk-batch-chip-status ${isFullyHarvested ? 'done' : batchHarvested > 0 ? 'harvesting' : ''}`}>
                        {isFullyHarvested ? 'HARVESTED' : batchHarvested > 0 ? 'HARVESTING' : batch.status || 'ACTIVE'}
                      </span>
                    </div>

                    <div className="bk-batch-chip-stats">
                      <span>{batchHives.length} hives</span>
                      <span>•</span>
                      <span>{batchTotal} frames</span>
                    </div>

                    {/* Live Harvest Progress Bar */}
                    <div className="bk-batch-chip-progress-wrap">
                      <div className="bk-batch-chip-progress-bar">
                        <div
                          className={`bk-batch-chip-progress-fill ${isFullyHarvested ? 'complete' : ''}`}
                          style={{ width: `${batchPercent}%` }}
                        />
                      </div>
                      <div className="bk-batch-chip-harvest-row">
                        <span>Harvest: <strong>{batchHarvested}/{batchTotal}</strong> ({batchPercent}%)</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Modern Multi-Facet Search & Filter Bar */}
        <div className="bk-search-filter-card">
          <div className="bk-search-row">
            <div className="bk-search-wrap">
              <Search size={16} color="#786D61" />
              <input
                type="text"
                className="bk-search-input"
                placeholder="Search by Batch, Hive (H001), Frame (AP71H001F1), Variety..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="bk-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Batch Filter Dropdown */}
            <div className="bk-batch-select-wrap">
              <select
                className="bk-batch-select"
                value={selectedBatchId}
                onChange={e => setSelectedBatchId(e.target.value)}
              >
                <option value="all">📦 All Batches</option>
                {availableBatches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter Pills with Live Counts */}
          <div className="bk-filter-pills-row">
            <button
              type="button"
              className={`bk-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <span>All Hives</span>
              <span className="bk-pill-count">{counts.all}</span>
            </button>

            <button
              type="button"
              className={`bk-filter-pill ${statusFilter === 'healthy' ? 'active' : ''}`}
              onClick={() => setStatusFilter('healthy')}
            >
              <span>Healthy</span>
              <span className="bk-pill-count">{counts.healthy}</span>
            </button>

            <button
              type="button"
              className={`bk-filter-pill attention ${statusFilter === 'attention' ? 'active' : ''}`}
              onClick={() => setStatusFilter('attention')}
            >
              <span>Attention</span>
              <span className="bk-pill-count">{counts.attention}</span>
            </button>

            <button
              type="button"
              className={`bk-filter-pill ready ${statusFilter === 'ready' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ready')}
            >
              <span>Ready to Harvest</span>
              <span className="bk-pill-count">{counts.ready}</span>
            </button>

            <button
              type="button"
              className={`bk-filter-pill harvested ${statusFilter === 'harvested' ? 'active' : ''}`}
              onClick={() => setStatusFilter('harvested')}
            >
              <span>Harvested</span>
              <span className="bk-pill-count">{counts.harvested}</span>
            </button>
          </div>

          {/* Search Result Summary Line */}
          {(searchQuery || selectedBatchId !== 'all' || statusFilter !== 'all') && (
            <div className="bk-search-meta-bar">
              <span className="bk-search-meta-text">
                Showing <strong>{filteredHives.length}</strong> of {activeHives.length} hives
                {searchQuery ? ` matching "${searchQuery}"` : ''}
                {selectedBatchId !== 'all' ? ` in ${availableBatches.find(b => b.id === selectedBatchId)?.name || 'Selected Batch'}` : ''}
              </span>
              <button
                type="button"
                className="bk-search-reset-link"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBatchId('all');
                  setStatusFilter('all');
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Hive Box Cards List */}
        {activeHives.length === 0 ? (
          <div className="bk-empty-hives-card">
            <div className="bk-empty-icon">
              <Layers size={32} color="#D97706" />
            </div>
            <h3 className="bk-empty-title">No Hive Boxes Registered Yet</h3>
            <p className="bk-empty-desc">
              Field management is organized by Batches: <strong>1 Batch</strong> holds multiple <strong>Hive Boxes</strong>, and each Hive Box contains multiple traceable <strong>Frames</strong>.
            </p>
            <div className="bk-empty-actions-row">
              <button
                type="button"
                className="btn btn-primary bk-empty-btn"
                onClick={() => setIsCreateBatchOpen(true)}
              >
                <Plus size={16} />
                <span>Create First Batch</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary bk-empty-btn"
                onClick={() => setIsAddHiveOpen(true)}
              >
                <Plus size={16} />
                <span>Single Hive Box</span>
              </button>
            </div>
          </div>
        ) : filteredHives.length === 0 ? (
          <div className="bk-empty-hives-card" style={{ padding: '32px 16px' }}>
            <p style={{ margin: 0, color: 'var(--color-warm-gray)', fontWeight: 600 }}>No hives match your search/filter.</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '12px' }}
              onClick={() => {
                setSearchQuery('');
                setSelectedBatchId('all');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="bk-hives-grid">
            {filteredHives.map(hive => {
              const isAtt = hive.status === 'attention';
              const isFullyHarvested = hive.harvestPercent === 100 && hive.totalFrames > 0;

              return (
                <div
                  key={hive.id}
                  className={`bk-hive-box-card ${isAtt ? 'attention' : ''} ${isFullyHarvested ? 'harvested' : ''}`}
                  onClick={() => setSelectedHiveId(hive.id)}
                >
                  <div className="bk-hbc-head">
                    <div className="bk-hbc-code-row">
                      <span className="bk-hbc-code">{hive.cleanCode}</span>
                      <strong className="bk-hbc-name">{hive.name}</strong>
                      {hive.batchName && (
                        <span className="bk-hbc-batch-badge" title={`Batch: ${hive.batchName}`}>
                          📦 {hive.batchName}
                        </span>
                      )}
                    </div>
                    <span className={`bk-hbc-status ${isAtt ? 'attention' : 'healthy'}`}>
                      {isAtt ? 'Needs attention' : 'Healthy'}
                    </span>
                  </div>

                  <span className="bk-hbc-location">{hive.location || 'Apiary Yard'}</span>

                  {/* Highlight Matched Frame if search matched one */}
                  {hive.matchedFrameCode && (
                    <div className="bk-hbc-match-alert">
                      <QrCode size={13} color="#D97706" />
                      <span>Matched Frame: <strong>{hive.matchedFrameCode}</strong></span>
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="bk-hbc-stats-row">
                    <div className="bk-hbc-stat">
                      <span className="bk-hbc-stat-k">Frames</span>
                      <strong className="bk-hbc-stat-v">{hive.totalFrames}</strong>
                    </div>
                    <div className="bk-hbc-stat">
                      <span className="bk-hbc-stat-k">Last Inspected</span>
                      <strong className="bk-hbc-stat-v">{hive.lastInspected || 'Recent'}</strong>
                    </div>
                    <div className="bk-hbc-stat">
                      <span className="bk-hbc-stat-k">Telemetry</span>
                      <strong className="bk-hbc-stat-v">{hive.temp ? `${hive.temp}°C` : 'Active'}</strong>
                    </div>
                  </div>

                  {/* Real-time Harvesting Progress Section */}
                  <div className="bk-hbc-harvest-progress-wrap">
                    <div className="bk-hbc-hp-header">
                      <span className="bk-hbc-hp-title">
                        <Droplet size={13} color="#D97706" />
                        <span>Harvest: <strong>{hive.harvestedFrames}/{hive.totalFrames}</strong> frames ({hive.harvestPercent}%)</span>
                      </span>
                      <span className={`bk-hbc-hp-badge ${isFullyHarvested ? 'done' : hive.harvestedFrames > 0 ? 'in-progress' : hive.readyFrames > 0 ? 'ready' : 'active'}`}>
                        {isFullyHarvested
                          ? '✓ Fully Harvested'
                          : hive.harvestedFrames > 0
                          ? `🍯 ${hive.harvestedFrames} Harvested`
                          : hive.readyFrames > 0
                          ? `🟡 ${hive.readyFrames} Ready`
                          : '⚪ Active Growth'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="bk-hbc-hp-bar">
                      <div
                        className={`bk-hbc-hp-fill ${isFullyHarvested ? 'complete' : ''}`}
                        style={{ width: `${hive.harvestPercent}%` }}
                      />
                    </div>

                    {/* Mini Frame Status Chips Strip */}
                    <div className="bk-hbc-frames-mini-strip">
                      {hive.hiveFrames.slice(0, 10).map(f => {
                        const isH = f.status === 'HARVESTED' || f.status === 'SUBMITTED_TO_PROCESSOR';
                        const isR = f.status === 'READY_FOR_HARVEST' || (f.status === 'ACTIVE' && f.cappedPercentage >= 85);
                        return (
                          <span
                            key={f.id}
                            className={`bk-mini-frame-chip ${isH ? 'harvested' : isR ? 'ready' : 'active'}`}
                            title={`${f.traceabilityCode}: ${f.status} (${f.cappedPercentage || 10}% capped)`}
                          >
                            {f.frameNumber || f.traceabilityCode?.slice(-2)}
                            {isH ? ' ✓' : isR ? ' 🍯' : ''}
                          </span>
                        );
                      })}
                      {hive.hiveFrames.length > 10 && (
                        <span className="bk-mini-frame-chip more">+{hive.hiveFrames.length - 10}</span>
                      )}
                    </div>
                  </div>

                  {/* Foot Actions */}
                  <div className="bk-hbc-foot">
                    <span className="bk-hbc-last-note">
                      {isAtt ? 'Attention flag recorded' : isFullyHarvested ? 'Ready for next super placement' : 'Stable colony conditions'}
                    </span>
                    <div className="bk-hbc-actions">
                      <button
                        type="button"
                        className="bk-hbc-trash-btn"
                        title="Trash / Delete Hive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Permanently trash and delete '${hive.name}' (${hive.cleanCode})? This will remove this hive from the database.`)) {
                            deleteHive(hive.id);
                          }
                        }}
                      >
                        <Trash2 size={12} />
                        <span>Trash</span>
                      </button>
                      <span className="bk-hbc-view-link">View details →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <RegisterFrameModal
        isOpen={isRegisterFrameOpen}
        onClose={() => setIsRegisterFrameOpen(false)}
      />

      <AddHiveModal
        isOpen={isAddHiveOpen}
        onClose={() => setIsAddHiveOpen(false)}
      />

      <HiveBatchModal
        isOpen={isCreateBatchOpen}
        onClose={() => setIsCreateBatchOpen(false)}
      />

      <style>{`
        .bk-hives-view-viewport {
          padding-bottom: 90px;
        }
        .bk-hv-header {
          padding: 18px 20px 14px;
          background: #FFFFFF;
          border-bottom: 1px solid var(--color-divider);
        }
        .bk-hv-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-hv-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-deep-cocoa);
          margin: 0;
        }
        .bk-hv-sub {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          margin: 2px 0 0;
        }
        .bk-hv-head-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bk-hv-content {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Modern Search & Filter Card */
        .bk-search-filter-card {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border, #E2DAD0);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 2px 6px rgba(52, 38, 27, 0.04);
        }

        .bk-search-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bk-search-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FAF7F2;
          border: 1.5px solid var(--color-card-border, #E2DAD0);
          border-radius: 10px;
          padding: 0 12px;
          height: 42px;
          transition: all 0.15s ease;
        }
        .bk-search-wrap:focus-within {
          border-color: #D97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
          background: #FFFFFF;
        }

        .bk-search-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #34261B);
          font-family: inherit;
        }

        .bk-search-clear-btn {
          background: none;
          border: none;
          color: #8C7E70;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .bk-search-clear-btn:hover {
          background: #E8DFD1;
          color: #34261B;
        }

        .bk-batch-select-wrap {
          width: 170px;
        }
        .bk-batch-select {
          width: 100%;
          height: 42px;
          padding: 0 10px;
          border-radius: 10px;
          border: 1.5px solid var(--color-card-border, #E2DAD0);
          background: #FAF7F2;
          font-size: 13px;
          font-weight: 600;
          color: #34261B;
          font-family: inherit;
          outline: none;
          cursor: pointer;
        }
        .bk-batch-select:focus {
          border-color: #D97706;
          background: #FFFFFF;
        }

        .bk-filter-pills-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .bk-filter-pill {
          background: #FAF7F2;
          border: 1px solid var(--color-card-border, #E2DAD0);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          color: var(--color-warm-gray, #786D61);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .bk-pill-count {
          font-size: 11px;
          background: #E8DFD1;
          color: #34261B;
          padding: 1px 6px;
          border-radius: 10px;
        }
        .bk-filter-pill.active {
          background: #496B45;
          color: #FFFFFF;
          border-color: #496B45;
        }
        .bk-filter-pill.active .bk-pill-count {
          background: rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
        }
        .bk-filter-pill.attention.active {
          background: #D97706;
          border-color: #D97706;
        }
        .bk-filter-pill.ready.active {
          background: #B45309;
          border-color: #B45309;
        }
        .bk-filter-pill.harvested.active {
          background: #15803D;
          border-color: #15803D;
        }

        .bk-search-meta-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: #786D61;
          border-top: 1px dashed #E8DFD1;
          padding-top: 8px;
          margin-top: 2px;
        }
        .bk-search-reset-link {
          background: none;
          border: none;
          color: #B45309;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          padding: 0;
        }
        .bk-search-reset-link:hover {
          text-decoration: underline;
        }

        /* Hives Grid */
        .bk-hives-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bk-hive-box-card {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border, #E2DAD0);
          border-radius: 14px;
          padding: 14px 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all 0.15s ease;
        }
        .bk-hive-box-card:hover {
          border-color: #D97706;
          box-shadow: 0 4px 14px rgba(52, 38, 27, 0.08);
        }
        .bk-hive-box-card.attention {
          border-color: rgba(217, 130, 43, 0.4);
          background: #FFFDF9;
        }
        .bk-hive-box-card.harvested {
          border-color: #BBF7D0;
        }

        .bk-hbc-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-hbc-code-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bk-hbc-code {
          background: rgba(73, 107, 69, 0.12);
          color: #496B45;
          font-size: 12.5px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 6px;
        }
        .bk-hbc-name {
          font-size: 15.5px;
          color: var(--color-deep-cocoa, #2E2015);
        }
        .bk-hbc-status {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
        }
        .bk-hbc-status.healthy { background: rgba(73, 107, 69, 0.1); color: #496B45; }
        .bk-hbc-status.attention { background: rgba(217, 130, 43, 0.12); color: #D9822B; }
        .bk-hbc-location {
          font-size: 12.5px;
          color: var(--color-warm-gray, #786D61);
          margin-top: -4px;
        }

        .bk-hbc-match-alert {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          color: #92400E;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11.5px;
        }

        .bk-hbc-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background: #FFF9EF;
          padding: 8px 12px;
          border-radius: 8px;
        }
        .bk-hbc-stat {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .bk-hbc-stat-k {
          font-size: 10.5px;
          color: var(--color-warm-gray, #786D61);
        }
        .bk-hbc-stat-v {
          font-size: 13px;
          color: var(--color-deep-cocoa, #2E2015);
          font-weight: 700;
        }

        /* Harvest Progress Section on Hive Card */
        .bk-hbc-harvest-progress-wrap {
          background: #FAF7F2;
          border: 1px solid #E8DFD1;
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .bk-hbc-hp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-hbc-hp-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #34261B;
        }
        .bk-hbc-hp-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: 4px;
        }
        .bk-hbc-hp-badge.done {
          background: #DCFCE7;
          color: #15803D;
          border: 1px solid #BBF7D0;
        }
        .bk-hbc-hp-badge.in-progress {
          background: #FEF3C7;
          color: #B45309;
          border: 1px solid #FDE68A;
        }
        .bk-hbc-hp-badge.ready {
          background: #FEF08A;
          color: #854D0E;
          border: 1px solid #FACC15;
        }
        .bk-hbc-hp-badge.active {
          background: #F3ECE1;
          color: #786D61;
        }

        .bk-hbc-hp-bar {
          width: 100%;
          height: 6px;
          background: #E8DFD1;
          border-radius: 4px;
          overflow: hidden;
        }
        .bk-hbc-hp-fill {
          height: 100%;
          background: linear-gradient(90deg, #D97706, #B45309);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .bk-hbc-hp-fill.complete {
          background: linear-gradient(90deg, #22C55E, #16A34A);
        }

        .bk-hbc-frames-mini-strip {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 2px;
        }
        .bk-mini-frame-chip {
          font-size: 10.5px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          background: #FFFFFF;
          border: 1px solid #D8C7B0;
          color: #5D5044;
          font-family: ui-monospace, SFMono-Regular, monospace;
        }
        .bk-mini-frame-chip.harvested {
          background: #DCFCE7;
          border-color: #86EFAC;
          color: #15803D;
        }
        .bk-mini-frame-chip.ready {
          background: #FEF3C7;
          border-color: #FDE68A;
          color: #B45309;
        }
        .bk-mini-frame-chip.more {
          background: #FAF7F2;
          color: #8C7E70;
        }

        .bk-hbc-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          padding-top: 4px;
        }
        .bk-hbc-last-note {
          color: #71845B;
        }
        .bk-hbc-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bk-hbc-trash-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #FAF7F2;
          border: 1px solid var(--color-card-border, #E2DAD0);
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 700;
          color: var(--color-warm-gray, #786D61);
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .bk-hbc-trash-btn:hover {
          background: #FFF1F0;
          color: #D9383A;
          border-color: rgba(217, 56, 58, 0.35);
        }
        .bk-hbc-view-link {
          font-weight: 700;
          color: #496B45;
        }

        /* Empty State */
        .bk-empty-hives-card {
          background: #FFFFFF;
          border: 1.5px dashed var(--color-card-border, #E2DAD0);
          border-radius: 16px;
          padding: 44px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 8px;
        }
        .bk-empty-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .bk-empty-title {
          font-size: 17px;
          font-weight: 800;
          color: var(--color-deep-cocoa, #2E2015);
          margin: 0;
        }
        .bk-empty-desc {
          font-size: 13.5px;
          color: var(--color-warm-gray, #786D61);
          max-width: 400px;
          line-height: 1.5;
          margin: 0 0 8px;
        }
        .bk-empty-btn {
          height: 42px;
          padding: 0 20px;
          font-size: 14px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .bk-empty-actions-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Batch Strip Styles */
        .bk-batch-strip-section {
          background: #FAF7F2;
          border: 1px solid var(--color-card-border, #E2DAD0);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .bk-batch-strip-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .bk-batch-strip-title-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bk-batch-strip-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2E2015);
        }

        .bk-batch-strip-hint {
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
        }

        .bk-batch-add-btn {
          background: none;
          border: none;
          color: #B45309;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 6px;
          transition: background-color 0.15s ease;
        }
        .bk-batch-add-btn:hover {
          background: rgba(217, 119, 6, 0.1);
        }

        .bk-batch-cards-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .bk-batch-chip {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border, #E2DAD0);
          border-radius: 10px;
          padding: 9px 12px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          min-width: 155px;
          text-align: left;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .bk-batch-chip:hover {
          border-color: #D97706;
          background: #FFFDF9;
        }

        .bk-batch-chip.active {
          border-color: #D97706;
          background: #FFFBEB;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.12);
        }

        .bk-batch-chip.harvested {
          border-color: #86EFAC;
        }

        .bk-batch-chip-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .bk-batch-chip-name {
          font-size: 12px;
          font-weight: 700;
          color: #2E2015;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bk-batch-chip-status {
          font-size: 9.5px;
          font-weight: 800;
          color: #047857;
          background: #ECFDF5;
          padding: 1px 5px;
          border-radius: 4px;
        }
        .bk-batch-chip-status.harvesting {
          color: #B45309;
          background: #FEF3C7;
        }
        .bk-batch-chip-status.done {
          color: #15803D;
          background: #DCFCE7;
        }

        .bk-batch-chip-stats {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #786D61;
        }

        .bk-batch-chip-progress-wrap {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-top: 2px;
        }
        .bk-batch-chip-progress-bar {
          width: 100%;
          height: 4px;
          background: #E8DFD1;
          border-radius: 3px;
          overflow: hidden;
        }
        .bk-batch-chip-progress-fill {
          height: 100%;
          background: #D97706;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .bk-batch-chip-progress-fill.complete {
          background: #16A34A;
        }
        .bk-batch-chip-harvest-row {
          font-size: 10.5px;
          color: #8C7E70;
        }

        .bk-hbc-batch-badge {
          background: rgba(217, 119, 6, 0.1);
          color: #92400E;
          border: 1px solid rgba(217, 119, 6, 0.2);
          font-size: 10.5px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};
