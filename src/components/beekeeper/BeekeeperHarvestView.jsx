import React, { useState, useMemo } from 'react';
import {
  Droplet,
  Send,
  CheckCircle2,
  Clock,
  QrCode,
  Search,
  Filter,
  X,
  Layers,
  Building2,
  RotateCcw,
  Scale,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { FRAME_STATUS_LABELS } from '../../services/beekeeperDomainService';
import { HarvestModal } from './HarvestModal';
import { SubmitToProcessorModal } from './SubmitToProcessorModal';
import { FrameDetailModal } from './FrameDetailModal';

export const BeekeeperHarvestView = () => {
  const {
    frames = [],
    hives = [],
    hiveManagementBatches = [],
    harvestRecords = [],
    setActiveTab
  } = useAppState();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [selectedHiveFilter, setSelectedHiveFilter] = useState('all');
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all' | 'ready' | 'harvested' | 'submitted'

  // Modals & Harvest Scope States
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [harvestScope, setHarvestScope] = useState('frame');
  const [harvestTargetFrameId, setHarvestTargetFrameId] = useState(null);
  const [harvestTargetHiveId, setHarvestTargetHiveId] = useState(null);
  const [harvestTargetBatchId, setHarvestTargetBatchId] = useState(null);
  const [selectedFrameForSubmit, setSelectedFrameForSubmit] = useState(null);
  const [selectedFrameForDetail, setSelectedFrameForDetail] = useState(null);

  const handleOpenFrameHarvest = (frame) => {
    setHarvestScope('frame');
    setHarvestTargetFrameId(frame.id);
    setHarvestTargetHiveId(frame.hiveId);
    setIsHarvestModalOpen(true);
  };

  // Grouped status counts
  const readyFrames = useMemo(
    () => frames.filter(f => f.status === 'READY_FOR_HARVEST' || (f.status === 'ACTIVE' && f.cappedPercentage >= 85)),
    [frames]
  );
  const harvestedFrames = useMemo(
    () => frames.filter(f => f.status === 'HARVESTED'),
    [frames]
  );
  const submittedFrames = useMemo(
    () => frames.filter(f => f.status === 'SUBMITTED_TO_PROCESSOR' || f.status === 'RECEIVED_BY_PROCESSOR'),
    [frames]
  );

  // Derived Batches from batch state & hive associations
  const availableBatches = useMemo(() => {
    const map = new Map();
    (hiveManagementBatches || []).forEach(b => {
      if (b.id) map.set(b.id, { id: b.id, name: b.name || `Batch ${b.id}` });
    });
    (hives || []).forEach(h => {
      if (h.batchId && !map.has(h.batchId)) {
        map.set(h.batchId, { id: h.batchId, name: h.batchName || `Batch ${h.batchId}` });
      }
    });
    return Array.from(map.values());
  }, [hiveManagementBatches, hives]);

  // Derived Hives (dynamically filtered if a specific batch is chosen)
  const availableHives = useMemo(() => {
    const active = hives.filter(h => !h.isArchived);
    if (!selectedBatchFilter || selectedBatchFilter === 'all') {
      return active;
    }
    return active.filter(h => h.batchId === selectedBatchFilter);
  }, [hives, selectedBatchFilter]);

  // Dynamic search and multi-facet filtering
  const filteredFrames = useMemo(() => {
    return frames.filter(frame => {
      // 1. Status Tab filter
      if (activeTabFilter === 'ready' && !(frame.status === 'READY_FOR_HARVEST' || (frame.status === 'ACTIVE' && frame.cappedPercentage >= 85))) return false;
      if (activeTabFilter === 'harvested' && frame.status !== 'HARVESTED') return false;
      if (activeTabFilter === 'submitted' && !(frame.status === 'SUBMITTED_TO_PROCESSOR' || frame.status === 'RECEIVED_BY_PROCESSOR')) return false;

      // Find associated hive
      const hive = hives.find(h =>
        h.id === frame.hiveId ||
        h.code === frame.hiveCode ||
        `H${String(h.code).padStart(3, '0')}` === frame.hiveCode ||
        frame.traceabilityCode?.includes(String(h.code))
      );

      // 2. Batch filter
      if (selectedBatchFilter !== 'all') {
        if (!hive || hive.batchId !== selectedBatchFilter) return false;
      }

      // 3. Hive filter
      if (selectedHiveFilter !== 'all') {
        const matchesHiveId = hive && hive.id === selectedHiveFilter;
        const matchesHiveCode = frame.hiveCode === selectedHiveFilter || frame.traceabilityCode?.includes(selectedHiveFilter);
        if (!matchesHiveId && !matchesHiveCode) return false;
      }

      // 4. Dynamic keyword search (Frame code, Frame number, Hive code, Hive name, Batch name, Honey type)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = (frame.traceabilityCode || '').toLowerCase().includes(q);
        const matchesFrameNum = `frame ${frame.frameNumber}`.toLowerCase().includes(q) || `f${frame.frameNumber}`.toLowerCase().includes(q);
        const matchesHiveCode = (frame.hiveCode || '').toLowerCase().includes(q) || (hive?.code || '').toLowerCase().includes(q);
        const matchesHiveName = (hive?.name || '').toLowerCase().includes(q);
        const matchesBatchName = (hive?.batchName || '').toLowerCase().includes(q);
        const matchesHoney = (frame.honeyType || '').toLowerCase().includes(q);
        const matchesStatus = (FRAME_STATUS_LABELS[frame.status] || frame.status || '').toLowerCase().includes(q);

        if (!matchesCode && !matchesFrameNum && !matchesHiveCode && !matchesHiveName && !matchesBatchName && !matchesHoney && !matchesStatus) {
          return false;
        }
      }

      return true;
    });
  }, [frames, hives, activeTabFilter, selectedBatchFilter, selectedHiveFilter, searchQuery]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedBatchFilter !== 'all' || selectedHiveFilter !== 'all' || activeTabFilter !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedBatchFilter('all');
    setSelectedHiveFilter('all');
    setActiveTabFilter('all');
  };

  return (
    <div className="bk-harvest-viewport">
      {/* Modern Header */}
      <header className="bk-harv-header">
        <div className="bk-harv-title-row">
          <div className="bk-harv-title-left">
            <div className="bk-harv-icon">
              <Droplet size={22} color="#D97706" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="bk-harv-title">Harvest & Handover</h1>
              <p className="bk-harv-sub">Track honey collection units, search colonies, and submit frames to processor</p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm bk-header-harvest-btn"
            onClick={() => {
              if (selectedHiveFilter !== 'all') {
                setHarvestScope('hive');
                setHarvestTargetHiveId(selectedHiveFilter);
                setHarvestTargetFrameId(null);
              } else if (selectedBatchFilter !== 'all') {
                setHarvestScope('batch');
                setHarvestTargetBatchId(selectedBatchFilter);
                setHarvestTargetFrameId(null);
              } else {
                setHarvestScope('frame');
                setHarvestTargetFrameId(null);
              }
              setIsHarvestModalOpen(true);
            }}
          >
            <Droplet size={14} />
            <span>Record Harvest</span>
          </button>
        </div>

        {/* Modern Interactive Metric Cards */}
        <div className="bk-harv-metrics">
          <div
            className={`bk-hm-card ready ${activeTabFilter === 'ready' ? 'active' : ''}`}
            onClick={() => setActiveTabFilter(activeTabFilter === 'ready' ? 'all' : 'ready')}
          >
            <div className="bk-hm-top">
              <span className="bk-hm-k">Ready to Harvest</span>
              <Droplet size={14} className="bk-hm-icon" />
            </div>
            <strong className="bk-hm-v">{readyFrames.length}</strong>
          </div>

          <div
            className={`bk-hm-card harvested ${activeTabFilter === 'harvested' ? 'active' : ''}`}
            onClick={() => setActiveTabFilter(activeTabFilter === 'harvested' ? 'all' : 'harvested')}
          >
            <div className="bk-hm-top">
              <span className="bk-hm-k">Harvested</span>
              <CheckCircle2 size={14} className="bk-hm-icon" />
            </div>
            <strong className="bk-hm-v">{harvestedFrames.length}</strong>
          </div>

          <div
            className={`bk-hm-card submitted ${activeTabFilter === 'submitted' ? 'active' : ''}`}
            onClick={() => setActiveTabFilter(activeTabFilter === 'submitted' ? 'all' : 'submitted')}
          >
            <div className="bk-hm-top">
              <span className="bk-hm-k">At Processor</span>
              <Send size={14} className="bk-hm-icon" />
            </div>
            <strong className="bk-hm-v">{submittedFrames.length}</strong>
          </div>
        </div>

        {/* Dynamic Modern Search & Filter Command Bar */}
        <div className="bk-harv-search-bar-wrap">
          <div className="bk-harv-search-input-box">
            <Search size={16} className="bk-search-icon" />
            <input
              type="text"
              className="bk-harv-search-input"
              placeholder="Search by Frame (AP71...), Hive (H001), Batch, or Flora..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="bk-search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Selectors for Batch & Hive */}
          <div className="bk-harv-filters-row">
            {/* Batch Filter Dropdown */}
            <div className="bk-filter-select-group">
              <Layers size={13} className="bk-select-icon" />
              <select
                className="bk-filter-select"
                value={selectedBatchFilter}
                onChange={e => {
                  setSelectedBatchFilter(e.target.value);
                  setSelectedHiveFilter('all');
                }}
              >
                <option value="all">All Batches</option>
                {availableBatches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hive Filter Dropdown */}
            <div className="bk-filter-select-group">
              <Building2 size={13} className="bk-select-icon" />
              <select
                className="bk-filter-select"
                value={selectedHiveFilter}
                onChange={e => setSelectedHiveFilter(e.target.value)}
              >
                <option value="all">All Hives ({availableHives.length})</option>
                {availableHives.map(h => {
                  const code = String(h.code || '').startsWith('H') ? h.code : `H${String(h.code).padStart(3, '0')}`;
                  return (
                    <option key={h.id} value={h.id}>
                      Hive {code} {h.name ? `(${h.name})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="bk-reset-filters-btn"
                onClick={clearAllFilters}
                title="Reset all search and filter conditions"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Modern Segmented Status Tabs */}
        <div className="bk-harv-tabs-row">
          <div className="bk-harv-tabs" role="tablist">
            {[
              { id: 'all', label: 'All Units', count: frames.length },
              { id: 'ready', label: 'Ripe', count: readyFrames.length },
              { id: 'harvested', label: 'Harvested', count: harvestedFrames.length },
              { id: 'submitted', label: 'At Processor', count: submittedFrames.length }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`bk-htab-btn ${activeTabFilter === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTabFilter(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="bk-htab-count">{tab.count}</span>
              </button>
            ))}
          </div>

          <span className="bk-results-counter">
            Showing <strong>{filteredFrames.length}</strong> of {frames.length}
          </span>
        </div>
      </header>

      <div className="bk-harv-body">
        {/* Action Callout if frames are harvested */}
        {harvestedFrames.length > 0 && activeTabFilter !== 'submitted' && (
          <div className="bk-action-callout">
            <div className="bk-ac-left">
              <Send size={18} color="#15803D" />
              <div>
                <strong className="bk-ac-title">Ready for Processor Handover</strong>
                <p className="bk-ac-sub">{harvestedFrames.length} frame unit(s) harvested and ready to transfer.</p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setSelectedFrameForSubmit(harvestedFrames[0])}
            >
              Submit Handover
            </button>
          </div>
        )}

        {/* Frames List */}
        {filteredFrames.length === 0 ? (
          <div className="bk-harv-empty-box">
            <div className="bk-empty-icon-wrap">
              <Search size={24} color="#B45309" />
            </div>
            <h3>No frames match your search</h3>
            <p>
              {searchQuery
                ? `No units found matching "${searchQuery}". Try searching by hive code (e.g. H001) or frame number.`
                : 'No units found matching the selected batch, hive, or status filter.'}
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={clearAllFilters}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="bk-harv-frame-list">
            {filteredFrames.map(frame => {
              const isRipe = frame.status === 'READY_FOR_HARVEST' || (frame.status === 'ACTIVE' && frame.cappedPercentage >= 85);
              const isHarvested = frame.status === 'HARVESTED';
              const isSubmitted = frame.status === 'SUBMITTED_TO_PROCESSOR' || frame.status === 'RECEIVED_BY_PROCESSOR';

              const hive = hives.find(h =>
                h.id === frame.hiveId ||
                h.code === frame.hiveCode ||
                `H${String(h.code).padStart(3, '0')}` === frame.hiveCode ||
                frame.traceabilityCode?.includes(String(h.code))
              );

              const cappingPercent = frame.cappedPercentage || (isRipe ? 85 : 10);

              return (
                <div
                  key={frame.id}
                  className="bk-harv-card"
                  onClick={() => setSelectedFrameForDetail(frame)}
                >
                  <div className="bk-hcard-head">
                    <div className="bk-hcard-id-row">
                      <div className="bk-hcard-qr-badge">
                        <QrCode size={15} color="#D97706" />
                      </div>
                      <strong className="bk-hcard-code">{frame.traceabilityCode}</strong>
                      <span className={`bk-hcard-status ${isHarvested ? 'harvested' : isSubmitted ? 'submitted' : isRipe ? 'ripe' : 'active'}`}>
                        {FRAME_STATUS_LABELS[frame.status] || frame.status}
                      </span>
                    </div>

                    <div className="bk-hcard-colony-tags">
                      <span className="bk-hcard-hive">
                        {frame.hiveCode || hive?.code || 'H001'} · Frame F{frame.frameNumber}
                      </span>
                      {hive?.batchName && (
                        <span className="bk-hcard-batch-tag">
                          {hive.batchName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bk-hcard-details">
                    <div className="bk-hcd-col">
                      <span className="bk-hcd-k">Flora Variety</span>
                      <strong className="bk-hcd-v">{frame.honeyType || 'Wildflower'}</strong>
                    </div>

                    <div className="bk-hcd-col">
                      <div className="bk-hcd-capping-row">
                        <span className="bk-hcd-k">Capping</span>
                        <span className="bk-hcd-cap-val">{cappingPercent}%</span>
                      </div>
                      <div className="bk-cap-bar-track">
                        <div
                          className={`bk-cap-bar-fill ${isRipe ? 'ripe' : ''}`}
                          style={{ width: `${Math.min(100, cappingPercent)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bk-hcd-col">
                      <span className="bk-hcd-k">Net Yield</span>
                      <strong className="bk-hcd-v">
                        {frame.harvestQuantityKg ? `${frame.harvestQuantityKg} kg` : 'Est. 2.4 kg'}
                      </strong>
                    </div>
                  </div>

                  <div className="bk-hcard-foot">
                    {isHarvested ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm bk-hcard-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFrameForSubmit(frame);
                        }}
                      >
                        <Send size={13} />
                        <span>Submit for Processing</span>
                      </button>
                    ) : isSubmitted ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm bk-hcard-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('journey');
                        }}
                      >
                        <span>Track in Journey</span>
                        <ArrowRight size={13} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm bk-hcard-action harvest-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFrameHarvest(frame);
                        }}
                      >
                        <Droplet size={13} />
                        <span>Record Harvest</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Harvest Records Section */}
        {harvestRecords.length > 0 && (
          <section className="bk-harv-recent-sec">
            <div className="bk-sec-header">
              <h2 className="bk-sec-title">Recent Harvest Log</h2>
              <span className="bk-sec-count">{harvestRecords.length} recorded</span>
            </div>
            <div className="bk-hr-list">
              {harvestRecords.map(hrv => (
                <div key={hrv.id} className="bk-hr-item">
                  <div className="bk-hr-left">
                    <strong className="bk-hr-code">{hrv.traceabilityCode}</strong>
                    <span className="bk-hr-date">{hrv.harvestDate} · {hrv.harvestTime}</span>
                    <span className="bk-hr-detail">
                      {hrv.quantityKg} kg · {hrv.honeyType} · {hrv.hiveName || hrv.hiveCode}
                    </span>
                  </div>
                  <span className={`bk-hr-status ${hrv.submittedToProcessor ? 'submitted' : 'harvested'}`}>
                    {hrv.submittedToProcessor ? 'Submitted' : 'Harvested'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      <HarvestModal
        isOpen={isHarvestModalOpen}
        onClose={() => {
          setIsHarvestModalOpen(false);
          setHarvestTargetFrameId(null);
          setHarvestTargetHiveId(null);
          setHarvestTargetBatchId(null);
        }}
        initialScope={harvestScope}
        initialFrameId={harvestTargetFrameId}
        initialHiveId={harvestTargetHiveId}
        initialBatchId={harvestTargetBatchId}
        onHarvestSuccess={() => {
          setHarvestTargetFrameId(null);
          setHarvestTargetHiveId(null);
          setHarvestTargetBatchId(null);
        }}
        onProceedToHandover={(frame) => {
          setSelectedFrameForSubmit(frame);
        }}
      />

      <SubmitToProcessorModal
        isOpen={Boolean(selectedFrameForSubmit)}
        onClose={() => setSelectedFrameForSubmit(null)}
        initialFrameId={selectedFrameForSubmit?.traceabilityCode || selectedFrameForSubmit?.id}
        initialFrame={selectedFrameForSubmit}
        onSubmitSuccess={() => {
          setSelectedFrameForSubmit(null);
        }}
      />

      <FrameDetailModal
        isOpen={Boolean(selectedFrameForDetail)}
        onClose={() => setSelectedFrameForDetail(null)}
        frameId={selectedFrameForDetail?.id}
        onHarvestFrame={(f) => handleOpenFrameHarvest(f)}
        onSubmitToProcessor={(f) => setSelectedFrameForSubmit(f)}
      />

      <style>{`
        .bk-harvest-viewport {
          padding-bottom: 90px;
        }
        .bk-harv-header {
          padding: 20px 20px 0;
          background: #FFFFFF;
          border-bottom: 1px solid var(--color-divider, #E8DFD3);
          box-shadow: 0 4px 16px rgba(52, 38, 27, 0.03);
        }
        .bk-harv-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
        }
        .bk-harv-title-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bk-header-harvest-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 14px;
          font-weight: 700;
          border-radius: 9px;
          background-color: #D97706;
          border-color: #D97706;
          color: #FFFFFF;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.25);
        }
        .bk-header-harvest-btn:hover {
          background-color: #B45309;
          border-color: #B45309;
        }
        .bk-harv-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #FEF3C7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bk-harv-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0;
          letter-spacing: -0.01em;
        }
        .bk-harv-sub {
          font-size: 12.5px;
          color: #786D61;
          margin: 2px 0 0;
        }
        .bk-harv-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .bk-hm-card {
          background: #FAF7F2;
          border: 1px solid #E8DFD3;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          transition: all 0.18s ease;
          user-select: none;
        }
        .bk-hm-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(52, 38, 27, 0.06);
        }
        .bk-hm-card.active {
          border-color: #D97706;
          background: #FFFDF8;
          box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.2);
        }
        .bk-hm-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-hm-k {
          font-size: 11px;
          color: #786D61;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .bk-hm-icon {
          color: #B45309;
        }
        .bk-hm-v {
          font-size: 22px;
          color: var(--color-deep-cocoa, #34261B);
          font-weight: 800;
          line-height: 1.1;
        }
        .bk-harv-search-bar-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #FAF7F2;
          border: 1px solid #E8DFD3;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }
        .bk-harv-search-input-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .bk-search-icon {
          position: absolute;
          left: 12px;
          color: #9C9083;
          pointer-events: none;
        }
        .bk-harv-search-input {
          width: 100%;
          height: 40px;
          padding: 0 34px 0 36px;
          border-radius: 9px;
          border: 1px solid #D8C7B0;
          background: #FFFFFF;
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #34261B);
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .bk-harv-search-input:focus {
          border-color: #D97706;
          box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.15);
        }
        .bk-search-clear-btn {
          position: absolute;
          right: 10px;
          background: #E8DFD3;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6B5B4E;
          cursor: pointer;
        }
        .bk-harv-filters-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .bk-filter-select-group {
          position: relative;
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid #D8C7B0;
          border-radius: 8px;
          padding: 0 8px 0 26px;
          height: 32px;
          flex: 1;
          min-width: 130px;
        }
        .bk-select-icon {
          position: absolute;
          left: 8px;
          color: #786D61;
          pointer-events: none;
        }
        .bk-filter-select {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
          outline: none;
          cursor: pointer;
        }
        .bk-reset-filters-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #FFFFFF;
          border: 1px solid #D8C7B0;
          border-radius: 8px;
          height: 32px;
          padding: 0 10px;
          font-size: 12px;
          font-weight: 600;
          color: #B45309;
          cursor: pointer;
        }
        .bk-reset-filters-btn:hover {
          background: #FEF3C7;
          border-color: #F59E0B;
        }
        .bk-harv-tabs-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--color-divider, #E8DFD3);
          padding-top: 10px;
          padding-bottom: 2px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .bk-harv-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }
        .bk-htab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 700;
          color: #786D61;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .bk-htab-btn:hover {
          background: #FAF7F2;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-htab-btn.active {
          background: #FEF3C7;
          color: #92400E;
        }
        .bk-htab-count {
          font-size: 11px;
          background: rgba(120, 109, 97, 0.15);
          color: inherit;
          padding: 1px 6px;
          border-radius: 10px;
        }
        .bk-htab-btn.active .bk-htab-count {
          background: #FDE68A;
          color: #92400E;
        }
        .bk-results-counter {
          font-size: 12px;
          color: #786D61;
        }
        .bk-results-counter strong {
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-harv-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .bk-action-callout {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .bk-ac-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bk-ac-title {
          font-size: 13.5px;
          color: #166534;
          display: block;
          font-weight: 700;
        }
        .bk-ac-sub {
          font-size: 12px;
          color: #15803D;
          margin: 1px 0 0;
        }
        .bk-harv-empty-box {
          padding: 42px 20px;
          text-align: center;
          background: #FFFFFF;
          border: 1.5px dashed #D8C7B0;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .bk-empty-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #FEF3C7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .bk-harv-empty-box h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0;
        }
        .bk-harv-empty-box p {
          font-size: 13px;
          color: #786D61;
          margin: 0 0 8px;
          max-width: 360px;
          line-height: 1.4;
        }
        .bk-harv-frame-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bk-harv-card {
          background: #FFFFFF;
          border: 1px solid #E2DAD0;
          border-radius: 14px;
          padding: 14px 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 2px 8px rgba(52, 38, 27, 0.04);
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .bk-harv-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(52, 38, 27, 0.08);
          border-color: #D97706;
        }
        .bk-hcard-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        .bk-hcard-id-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bk-hcard-qr-badge {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: #FEF3C7;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bk-hcard-code {
          font-size: 14.5px;
          color: var(--color-deep-cocoa, #34261B);
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .bk-hcard-status {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
        }
        .bk-hcard-status.active { background: #F0FDF4; color: #15803D; border: 1px solid #BBF7D0; }
        .bk-hcard-status.ripe { background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; }
        .bk-hcard-status.harvested { background: #EDE2D1; color: #6B4F35; border: 1px solid #D8C7B0; }
        .bk-hcard-status.submitted { background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; }
        .bk-hcard-colony-tags {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .bk-hcard-hive {
          font-size: 12px;
          color: #786D61;
          font-weight: 600;
        }
        .bk-hcard-batch-tag {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          background: #F3ECE1;
          color: #786D61;
        }
        .bk-hcard-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          background: #FAF7F2;
          border: 1px solid #EBE4DA;
          padding: 10px 12px;
          border-radius: 10px;
        }
        .bk-hcd-col {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .bk-hcd-k {
          font-size: 10.5px;
          color: #786D61;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .bk-hcd-v {
          font-size: 13px;
          color: var(--color-deep-cocoa, #34261B);
          font-weight: 700;
        }
        .bk-hcd-capping-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .bk-hcd-cap-val {
          font-size: 11px;
          font-weight: 700;
          color: #B45309;
        }
        .bk-cap-bar-track {
          width: 100%;
          height: 5px;
          background: #E2DAD0;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 2px;
        }
        .bk-cap-bar-fill {
          height: 100%;
          background: #D97706;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .bk-cap-bar-fill.ripe {
          background: #15803D;
        }
        .bk-hcard-foot {
          display: flex;
          justify-content: flex-end;
          padding-top: 4px;
        }
        .bk-hcard-action {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }
        .bk-hcard-action.harvest-btn {
          background-color: #D97706;
          border-color: #D97706;
          color: #FFFFFF;
        }
        .bk-hcard-action.harvest-btn:hover {
          background-color: #B45309;
          border-color: #B45309;
        }
        .bk-harv-recent-sec {
          margin-top: 10px;
          background: #FFFFFF;
          border: 1px solid #E2DAD0;
          border-radius: 14px;
          padding: 16px;
        }
        .bk-sec-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .bk-sec-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0;
        }
        .bk-sec-count {
          font-size: 12px;
          color: #786D61;
        }
        .bk-hr-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .bk-hr-item {
          background: #FAF7F2;
          border: 1px solid #E8DFD3;
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-hr-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .bk-hr-code {
          font-size: 13.5px;
          color: #B45309;
          font-weight: 700;
        }
        .bk-hr-date {
          font-size: 11px;
          color: #786D61;
        }
        .bk-hr-detail {
          font-size: 12px;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-hr-status {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
        }
        .bk-hr-status.harvested { background: #EDE2D1; color: #6B4F35; }
        .bk-hr-status.submitted { background: #EFF6FF; color: #1D4ED8; }
      `}</style>
    </div>
  );
};
