import React, { useState, useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Plus,
  Search,
  X,
  ChevronRight,
  ClipboardCheck,
  Camera,
  Archive,
  Trash2,
  WifiOff,
  Thermometer,
  Layers,
  Info,
  MoreHorizontal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { AddHiveModal } from './AddHiveModal';
import { RecordObservationModal } from './RecordObservationModal';
import { BeeHealthScanInfoSheet } from './BeeHealthScanInfoSheet';

export const HiveList = () => {
  const {
    hives,
    setSelectedHiveId,
    openSheet,
    archiveHive,
    deleteHive,
    captureHiveImage,
    isOnline,
    showToast,
    isScanModalOpen,
    scanTargetHiveId,
    openScanModal,
    closeScanModal,
    accessProfile,
    userDesignations,
    userCapabilities
  } = useAppState();

  // Simple Segmented Health Filter (Section 5)
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'healthy' | 'attention'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Sheets
  const [recordObsHiveId, setRecordObsHiveId] = useState(null);
  const [isScanInfoOpen, setIsScanInfoOpen] = useState(false);

  // Active (non-archived) hives
  const activeHives = useMemo(() => {
    return hives.filter(h => !h.isArchived);
  }, [hives]);

  // Dynamic counts for compact health summary (Section 4)
  const counts = useMemo(() => {
    const total = activeHives.length;
    const attention = activeHives.filter(h => h.status === 'attention').length;
    const healthy = activeHives.filter(h => h.status === 'healthy').length;
    const recentlyInspected = activeHives.filter(h => {
      const insp = (h.lastInspected || '').toLowerCase();
      return insp.includes('today') || insp.includes('just now') || insp.includes('min');
    }).length;

    return { total, attention, healthy, recentlyInspected };
  }, [activeHives]);

  // Filtering Logic (Section 5)
  const filteredHives = useMemo(() => {
    return activeHives.filter(hive => {
      if (activeFilter === 'healthy' && hive.status !== 'healthy') return false;
      if (activeFilter === 'attention' && hive.status !== 'attention') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = hive.name.toLowerCase().includes(query);
        const matchesCode = (hive.code || '').toLowerCase().includes(query);
        const matchesLocation = (hive.location || '').toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesLocation) return false;
      }
      return true;
    });
  }, [activeHives, activeFilter, searchQuery]);

  // Prioritize attention items first (Section 8)
  const sortedHives = useMemo(() => {
    return [...filteredHives].sort((a, b) => {
      if (a.status === 'attention' && b.status !== 'attention') return -1;
      if (b.status === 'attention' && a.status !== 'attention') return 1;
      return (a.code || '').localeCompare(b.code || '');
    });
  }, [filteredHives]);

  // Check if user has bee scan capability
  const canScanBrood = useMemo(() => {
    const desigs = new Set((userDesignations || []).map(d => String(d).toUpperCase()));
    const caps = new Set((userCapabilities || []).map(c => String(c).toUpperCase()));
    return (
      desigs.has('BEEKEEPER') ||
      caps.has('HIVE_INSPECTION') ||
      caps.has('HIVE_MONITORING') ||
      caps.has('HIVE_IMAGE_CAPTURE') ||
      caps.has('IMAGE_CAPTURE') ||
      !userDesignations || userDesignations.length === 0 // default for field beekeeper
    );
  }, [userDesignations, userCapabilities]);

  const handleCardClick = (hiveId) => {
    setSelectedHiveId(hiveId);
  };

  const handleQuickScan = (e, hiveId) => {
    e.stopPropagation();
    openScanModal(hiveId);
  };

  const handleQuickInspect = (e, hiveId) => {
    e.stopPropagation();
    openSheet('hive-inspect', { hiveId });
  };

  const handleQuickRecord = (e, hiveId) => {
    e.stopPropagation();
    setRecordObsHiveId(hiveId);
  };

  const handleQuickTrash = (e, hive) => {
    e.stopPropagation();
    if (window.confirm(`Permanently trash and delete '${hive.name}' (${hive.code || 'colony'})? This will remove this hive and its frames from your database.`)) {
      deleteHive(hive.id);
    }
  };

  return (
    <div className="hives-viewport">
      {/* Offline Status Notice */}
      {!isOnline && (
        <div className="hives-offline-bar">
          <WifiOff size={13} />
          <span>You're offline. Showing your latest saved hive information.</span>
        </div>
      )}

      {/* Screen 15 Header (Section 2) */}
      <header className="hives-screen-header">
        <div className="hives-header-copy">
          <h1 className="hives-title">Hives</h1>
          <p className="hives-supporting-text">Keep track of your colonies and their activity.</p>
        </div>

        <button
          type="button"
          className="btn-add-hive-header"
          onClick={() => openSheet('add-hive')}
          aria-label="Add hive"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add hive</span>
        </button>
      </header>

      {/* Top-Level Compact Health Summary (Section 4) */}
      {activeHives.length > 0 && (
        <div className="hives-health-summary-row" role="region" aria-label="Colony health overview">
          <span className="summary-stat-item">
            <strong>{counts.total}</strong> monitored
          </span>
          <span className="summary-dot">·</span>
          {counts.attention > 0 ? (
            <span className="summary-stat-item attention">
              <span className="summary-pulse-dot" />
              <strong>{counts.attention}</strong> need attention
            </span>
          ) : null}
          {counts.attention > 0 && <span className="summary-dot">·</span>}
          <span className="summary-stat-item healthy">
            <strong>{counts.healthy}</strong> healthy
          </span>
          {counts.recentlyInspected > 0 && (
            <>
              <span className="summary-dot">·</span>
              <span className="summary-stat-item recent">
                <strong>{counts.recentlyInspected}</strong> recently checked
              </span>
            </>
          )}
        </div>
      )}

      {/* Bee Health Scan Feature Block (Sections 8, 9, 31) */}
      {canScanBrood && activeHives.length > 0 && (
        <div className="bee-scan-card" role="region" aria-label="Bee Health Scan">
          <div className="bee-scan-badge-row">
            <span className="bee-scan-badge">
              <Camera size={13} strokeWidth={2.5} />
              <span>Inspection Screening</span>
            </span>
            <button
              type="button"
              className="bee-scan-how-btn"
              onClick={() => setIsScanInfoOpen(true)}
            >
              How it works
            </button>
          </div>

          <div className="bee-scan-content-row">
            <div className="bee-scan-text-col">
              <strong className="bee-scan-title">Bee Health Scan</strong>
              <p className="bee-scan-sub">
                Capture a frame and check for possible signs of common bee diseases or brood abnormalities.
              </p>
            </div>

            {/* Natural honeycomb frame motif */}
            <div className="bee-scan-visual-art" aria-hidden="true">
              <div className="scan-comb-frame">
                <div className="comb-cell" />
                <div className="comb-cell active" />
                <div className="comb-cell" />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="bee-scan-primary-cta"
            onClick={() => openScanModal(null)}
          >
            <Camera size={16} strokeWidth={2} />
            <span>Scan a frame</span>
            <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
          </button>
        </div>
      )}

      {/* Health Filter: Simple Segmented Control (Section 5) */}
      {activeHives.length > 0 && (
        <div className="hives-filter-container">
          <div className="hives-segmented-control" role="tablist" aria-label="Health filters">
            <button
              type="button"
              className={`seg-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
              role="tab"
              aria-selected={activeFilter === 'all'}
            >
              All ({counts.total})
            </button>
            <button
              type="button"
              className={`seg-tab ${activeFilter === 'healthy' ? 'active' : ''}`}
              onClick={() => setActiveFilter('healthy')}
              role="tab"
              aria-selected={activeFilter === 'healthy'}
            >
              <span className="tab-dot healthy" />
              Healthy ({counts.healthy})
            </button>
            <button
              type="button"
              className={`seg-tab ${activeFilter === 'attention' ? 'active' : ''}`}
              onClick={() => setActiveFilter('attention')}
              role="tab"
              aria-selected={activeFilter === 'attention'}
            >
              <span className="tab-dot attention" />
              Needs attention ({counts.attention})
            </button>
          </div>
        </div>
      )}

      {/* Main Hive Cards List (Section 6, 7) */}
      <div className="hives-cards-scroll">
        {activeHives.length === 0 ? (
          <div className="hives-empty-state">
            <div className="empty-icon-ring">
              <Layers size={32} color="#D99A24" />
            </div>
            <h2 className="empty-title">Start with your first hive</h2>
            <p className="empty-desc">
              Add a hive to begin recording inspections, observations and conditions.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openSheet('add-hive')}
            >
              <Plus size={16} />
              <span>Add hive</span>
            </button>
          </div>
        ) : filteredHives.length === 0 ? (
          <div className="hives-empty-filter">
            <p className="filter-empty-title">No hives match this filter.</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveFilter('all')}
            >
              Show all hives
            </button>
          </div>
        ) : (
          <div className="hives-cards-list">
            {sortedHives.map(hive => {
              const isAttention = hive.status === 'attention';
              const isPaused = hive.status === 'paused' || !hive.monitoring?.isDeviceOnline;

              return (
                <article
                  key={hive.id}
                  className={`hive-clean-card ${isAttention ? 'attention' : ''}`}
                  onClick={() => handleCardClick(hive.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${hive.name}. ${hive.statusText}. Tap to view full hive.`}
                >
                  {/* Card Header: Identity & Status */}
                  <div className="hcard-header">
                    <div className="hcard-title-group">
                      <strong className="hcard-name">{hive.name}</strong>
                      <span className="hcard-location">
                        {hive.location || 'Meadowbrook Apiary'} · {hive.type || 'Langstroth'}
                      </span>
                    </div>

                    <div className={`hcard-status-pill ${isAttention ? 'attention' : isPaused ? 'paused' : 'healthy'}`}>
                      <span className={`hcard-dot ${isAttention ? 'attention' : isPaused ? 'paused' : 'healthy'}`} />
                      <span className="hcard-status-label">
                        {isAttention
                          ? 'Needs attention'
                          : isPaused
                          ? 'Monitoring unavailable'
                          : 'Healthy'}
                      </span>
                    </div>
                  </div>

                  {/* Human Status Explanation (Section 7) */}
                  <p className="hcard-human-condition">
                    {isAttention
                      ? hive.conditionSummary || 'Something changed and may need a closer look.'
                      : isPaused
                      ? 'Live observations aren’t available right now.'
                      : 'Conditions look stable.'}
                  </p>

                  {/* Environmental Observations (if sensor or inspection exists) */}
                  {hive.temp != null && hive.humidity != null && (
                    <div className="hcard-metrics-row">
                      <span className="hcard-metric-item">
                        <Thermometer size={12} color="#786D61" />
                        <strong>{hive.temp}°C</strong> Temperature
                      </span>
                      <span className="hcard-metric-divider">·</span>
                      <span className="hcard-metric-item">
                        <strong>{hive.humidity}%</strong> Humidity
                      </span>
                      <span className="hcard-metric-divider">·</span>
                      <span className="hcard-metric-item">
                        <strong>Stable</strong> Activity
                      </span>
                    </div>
                  )}

                  {/* Footer & Actions */}
                  <div className="hcard-footer">
                    <span className="hcard-inspection-meta">
                      Last inspected {hive.lastInspected || 'Recently'}
                    </span>

                    <div className="hcard-actions-row">
                      <button
                        type="button"
                        className="hcard-btn-scan"
                        onClick={e => handleQuickScan(e, hive.id)}
                        title="Scan frame for signs of disease"
                      >
                        <Camera size={13} strokeWidth={2} />
                        <span>Scan</span>
                      </button>

                      <button
                        type="button"
                        className="hcard-btn-trash"
                        onClick={e => handleQuickTrash(e, hive)}
                        title="Trash / Delete hive"
                        aria-label={`Trash ${hive.name}`}
                      >
                        <Trash2 size={13} />
                      </button>

                      <span className="hcard-view-link">
                        View hive <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Reusable Sheets & Modals */}
      <RecordObservationModal
        isOpen={Boolean(recordObsHiveId)}
        onClose={() => setRecordObsHiveId(null)}
        hiveId={recordObsHiveId}
        onSaveObservation={() => {
          setRecordObsHiveId(null);
        }}
      />

      <BeeHealthScanInfoSheet
        isOpen={isScanInfoOpen}
        onClose={() => setIsScanInfoOpen(false)}
      />

      <style>{`
        .hives-viewport {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          background: #FFF9EF;
          color: #34261B;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          position: relative;
          padding-bottom: 24px;
        }

        .hives-offline-bar {
          background: rgba(217, 130, 43, 0.12);
          color: #B86A10;
          font-size: 12px;
          font-weight: 650;
          padding: 8px 18px;
          display: flex;
          align-items: center;
          gap: 7px;
          border-bottom: 1px solid rgba(217, 130, 43, 0.2);
        }

        /* Screen 15 Header */
        .hives-screen-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 18px 20px 10px;
          flex-shrink: 0;
          background: #FFF9EF;
        }
        .hives-title {
          font-size: 26px;
          font-weight: 800;
          color: #34261B;
          letter-spacing: -0.4px;
          margin: 0;
          line-height: 1.2;
        }
        .hives-supporting-text {
          font-size: 13px;
          color: #786D61;
          margin: 4px 0 0;
          line-height: 1.35;
        }
        .btn-add-hive-header {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #D99A24;
          color: #FFF;
          border: none;
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 750;
          cursor: pointer;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(184, 115, 22, 0.22);
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .btn-add-hive-header:hover {
          background: #B87316;
        }
        .btn-add-hive-header:active {
          transform: scale(0.96);
        }

        /* Top-level Health Summary */
        .hives-health-summary-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          padding: 0 20px 12px;
          font-size: 12.5px;
          color: #786D61;
          flex-shrink: 0;
        }
        .summary-stat-item strong {
          color: #34261B;
          font-weight: 750;
        }
        .summary-stat-item.attention {
          color: #D9822B;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .summary-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #D9822B;
          animation: summaryPulse 2s infinite ease-in-out;
        }
        @keyframes summaryPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .summary-dot {
          color: #EDE2D1;
        }

        /* Bee Health Scan Card */
        .bee-scan-card {
          margin: 0 20px 12px;
          background: #FFFDF8;
          border: 1.5px solid #EDE2D1;
          border-radius: 16px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 2px 8px rgba(52, 38, 27, 0.04);
          flex-shrink: 0;
        }
        .bee-scan-badge-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bee-scan-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(217, 154, 36, 0.12);
          color: #B87316;
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .bee-scan-how-btn {
          background: none;
          border: none;
          color: #786D61;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          padding: 2px 0;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .bee-scan-content-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .bee-scan-text-col {
          flex: 1;
        }
        .bee-scan-title {
          font-size: 16px;
          font-weight: 800;
          color: #34261B;
          display: block;
          margin-bottom: 3px;
        }
        .bee-scan-sub {
          font-size: 12.5px;
          color: #786D61;
          line-height: 1.4;
          margin: 0;
        }
        .bee-scan-visual-art {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .scan-comb-frame {
          display: flex;
          gap: 4px;
        }
        .comb-cell {
          width: 10px;
          height: 10px;
          background: #EDE2D1;
          border-radius: 2px;
        }
        .comb-cell.active {
          background: #D99A24;
        }
        .bee-scan-primary-cta {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13.5px;
          font-weight: 600;
          color: #B87316;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .bee-scan-primary-cta:hover {
          background: #FFFDF8;
          border-color: #D99A24;
        }

        /* Segmented Control */
        .hives-filter-container {
          padding: 0 20px 12px;
          flex-shrink: 0;
        }
        .hives-segmented-control {
          display: flex;
          background: #EDE2D1;
          border-radius: 10px;
          padding: 3px;
          gap: 3px;
        }
        .seg-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 8px;
          background: none;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #786D61;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .seg-tab.active {
          background: #FFFDF8;
          color: #34261B;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .tab-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .tab-dot.healthy { background: #4F7A52; }
        .tab-dot.attention { background: #D9822B; }

        /* Cards list container */
        .hives-cards-scroll {
          padding: 0 20px;
        }
        .hives-cards-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Clean Hive Cards */
        .hive-clean-card {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: border-color 0.15s, transform 0.1s;
        }
        .hive-clean-card:hover {
          border-color: #D99A24;
        }
        .hive-clean-card.attention {
          border-left: 4px solid #D9822B;
          border-color: rgba(217, 130, 43, 0.45);
        }
        .hcard-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }
        .hcard-title-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .hcard-name {
          font-size: 16px;
          font-weight: 750;
          color: #34261B;
        }
        .hcard-location {
          font-size: 12px;
          color: #786D61;
        }
        .hcard-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .hcard-status-pill.healthy {
          background: rgba(79, 122, 82, 0.1);
          color: #4F7A52;
        }
        .hcard-status-pill.attention {
          background: rgba(217, 130, 43, 0.12);
          color: #D9822B;
        }
        .hcard-status-pill.paused {
          background: #FAF4E8;
          color: #786D61;
        }
        .hcard-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .hcard-dot.healthy { background: #4F7A52; }
        .hcard-dot.attention { background: #D9822B; }
        .hcard-dot.paused { background: #786D61; }

        .hcard-human-condition {
          font-size: 13px;
          color: #786D61;
          line-height: 1.4;
          margin: 0;
        }

        .hcard-metrics-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #786D61;
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-radius: 8px;
          padding: 6px 10px;
        }
        .hcard-metric-item {
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
        .hcard-metric-divider {
          color: #EDE2D1;
        }

        .hcard-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
          margin-top: 2px;
          border-top: 1px solid #FAF4E8;
        }
        .hcard-inspection-meta {
          font-size: 11.5px;
          color: #786D61;
        }
        .hcard-actions-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hcard-btn-scan {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11.5px;
          font-weight: 700;
          color: #B87316;
          cursor: pointer;
        }
        .hcard-btn-scan:hover {
          background: #FFFDF8;
          border-color: #D99A24;
        }
        .hcard-btn-trash {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: #FAF7F2;
          border: 1px solid #EDE2D1;
          color: var(--color-warm-gray, #786D61);
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .hcard-btn-trash:hover {
          background: #FFF1F0;
          color: #D9383A;
          border-color: rgba(217, 56, 58, 0.35);
        }
        .hcard-view-link {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 12px;
          font-weight: 700;
          color: #B87316;
        }





        /* Empty state */
        .hives-empty-state, .hives-empty-filter {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px 20px;
          gap: 10px;
        }
        .empty-icon-ring {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .empty-title {
          font-size: 17px;
          font-weight: 800;
          color: #34261B;
          margin: 0;
        }
        .empty-desc {
          font-size: 13px;
          color: #786D61;
          line-height: 1.4;
          margin: 0;
          max-width: 260px;
        }
      `}</style>
    </div>
  );
};
