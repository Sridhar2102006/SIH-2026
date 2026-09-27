/**
 * SCREEN — INSPECTIONS WORKSPACE
 *
 * Dedicated Canonical Destination for Field Inspections & Health Scans
 * Route: /inspections
 *
 * Primary Purpose: Perform and review colony inspections, frame scans, and health observations.
 * One User Intent → One Clear Destination.
 */

import React, { useState, useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  ClipboardCheck,
  Search,
  Filter,
  Camera,
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Plus,
  Layers,
  Clock
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';

export const InspectionsView = () => {
  const {
    hives,
    activities,
    openSheet,
    openScanModal,
    openInspectionResult,
    can,
    showToast
  } = useAppState();

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'ATTENTION' | 'ROUTINE' | 'SCANS'
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all inspections across all hives
  const allInspections = useMemo(() => {
    const list = [];
    hives.forEach(hive => {
      if (hive.healthTimeline && hive.healthTimeline.length > 0) {
        hive.healthTimeline.forEach(scan => {
          list.push({
            ...scan,
            hiveId: hive.id,
            hiveName: hive.name,
            hiveLocation: hive.location,
            hiveStatus: hive.status,
            temperament: hive.temperament
          });
        });
      } else {
        // Fallback synthetic inspection from hive last inspected
        list.push({
          id: `insp-${hive.id}`,
          hiveId: hive.id,
          hiveName: hive.name,
          hiveLocation: hive.location,
          hiveStatus: hive.status,
          date: hive.lastInspected || 'Recently',
          time: 'Routine check',
          resultType: hive.status === 'attention' ? 'concerning' : 'healthy',
          title: hive.status === 'attention' ? 'Inspection Follow-up Due' : 'Colony Checked & Stable',
          condition: hive.conditionSummary || 'Inspection completed',
          findings: hive.tags || ['Inspection logged'],
          notes: hive.statusText || '',
          temperament: hive.temperament
        });
      }
    });
    return list;
  }, [hives]);

  // Filtered list
  const filteredInspections = useMemo(() => {
    return allInspections.filter(item => {
      if (activeFilter === 'ATTENTION' && item.resultType !== 'concerning' && item.hiveStatus !== 'attention') return false;
      if (activeFilter === 'ROUTINE' && item.resultType === 'concerning') return false;
      if (activeFilter === 'SCANS' && !item.modelVersion) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchHive = (item.hiveName || '').toLowerCase().includes(q);
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchCondition = (item.condition || '').toLowerCase().includes(q);
        return matchHive || matchTitle || matchCondition;
      }
      return true;
    });
  }, [allInspections, activeFilter, searchQuery]);

  // Due inspections count
  const attentionCount = allInspections.filter(i => i.resultType === 'concerning' || i.hiveStatus === 'attention').length;

  return (
    <div className="inspections-view-container">
      {/* 1. Header Banner */}
      <div className="insp-hero-card card">
        <div className="insp-hero-content">
          <div className="insp-badge-row">
            <span className="badge badge-honey">Field Inspections</span>
            {attentionCount > 0 && (
              <StatusBadge
                status="attention"
                label={`${attentionCount} Colony${attentionCount > 1 ? 'ies' : ''} Need Review`}
              />
            )}
          </div>
          <h2 className="heading-card" style={{ fontSize: '20px', marginTop: '6px' }}>
            Colony Health & Inspection Workspace
          </h2>
          <p className="supporting-text" style={{ fontSize: '13px', marginTop: '4px' }}>
            Review frame checks, track brood development, and schedule preventative hive inspections.
          </p>

          <div className="insp-hero-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => openSheet('quick-inspect')}
            >
              <ClipboardCheck size={15} />
              <span>Log Inspection</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => openScanModal()}
            >
              <Camera size={15} />
              <span>Comb Frame Check</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="insp-filter-bar">
        <div className="insp-search-wrap">
          <Search size={15} className="insp-search-icon" />
          <input
            type="text"
            className="insp-search-input"
            placeholder="Search inspections or hives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="insp-pill-row">
          <button
            className={`filter-pill ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            All Logs ({allInspections.length})
          </button>
          <button
            className={`filter-pill ${activeFilter === 'ATTENTION' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ATTENTION')}
          >
            Needs Attention ({attentionCount})
          </button>
          <button
            className={`filter-pill ${activeFilter === 'ROUTINE' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ROUTINE')}
          >
            Routine Pass
          </button>
          <button
            className={`filter-pill ${activeFilter === 'SCANS' ? 'active' : ''}`}
            onClick={() => setActiveFilter('SCANS')}
          >
            Frame Photo Checks
          </button>
        </div>
      </div>

      {/* 3. Inspections Feed */}
      <div className="insp-list">
        {filteredInspections.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title={searchQuery ? 'No matching inspections' : 'No inspections recorded for this filter'}
            description="Perform a routine comb inspection or clear your active search query."
            actionLabel="Start Hive Inspection"
            onAction={() => openSheet('quick-inspect')}
          />
        ) : (
          filteredInspections.map((insp) => {
            const isAttention = insp.resultType === 'concerning' || insp.hiveStatus === 'attention';
            return (
              <div
                key={insp.id}
                className="card insp-item-card"
                onClick={() => {
                  openInspectionResult({
                    hiveId: insp.hiveId,
                    scanData: insp
                  });
                }}
              >
                <div className="insp-item-top">
                  <div className="insp-hive-badge">
                    <Layers size={13} />
                    <span>{insp.hiveName}</span>
                  </div>
                  <span className="insp-timestamp">
                    <Clock size={11} /> {insp.date} {insp.time ? `· ${insp.time}` : ''}
                  </span>
                </div>

                <div className="insp-item-body">
                  <div className="insp-title-row">
                    <h4 className="insp-item-title">{insp.title}</h4>
                    <StatusBadge
                      status={isAttention ? 'attention' : 'healthy'}
                      label={isAttention ? 'Attention' : 'Healthy'}
                      size="small"
                    />
                  </div>

                  <p className="insp-item-condition">{insp.condition}</p>

                  {insp.findings && insp.findings.length > 0 && (
                    <div className="insp-findings-tags">
                      {insp.findings.slice(0, 3).map((f, i) => (
                        <span key={i} className="finding-tag">{f}</span>
                      ))}
                    </div>
                  )}

                  {insp.notes && (
                    <p className="insp-observer-notes">"{insp.notes}"</p>
                  )}
                </div>

                <div className="insp-item-footer">
                  <span className="insp-meta-text">
                    {insp.modelVersion || 'Field Observation Log'}
                  </span>
                  <div className="insp-action-link">
                    <span>View Inspection Findings</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .inspections-view-container {
          padding: 16px var(--mobile-pad) 80px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .insp-hero-card {
          padding: 20px;
          background: #FFFDF8;
          border: 1px solid var(--color-theme-card-border, #E8DFD1);
        }

        .insp-badge-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .insp-hero-actions {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }

        .insp-filter-bar {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .insp-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .insp-search-icon {
          position: absolute;
          left: 12px;
          color: var(--color-warm-gray);
        }

        .insp-search-input {
          width: 100%;
          height: 42px;
          padding: 0 12px 0 36px;
          background: #FFF;
          border: 1px solid var(--color-divider);
          border-radius: 12px;
          font-size: 13.5px;
          color: var(--color-deep-cocoa);
          box-sizing: border-box;
        }

        .insp-pill-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .filter-pill {
          padding: 6px 12px;
          border-radius: 20px;
          background: #FFF;
          border: 1px solid var(--color-divider);
          font-size: 12px;
          font-weight: 500;
          color: var(--color-warm-gray);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .filter-pill.active {
          background: var(--color-deep-cocoa);
          color: #FFF;
          border-color: var(--color-deep-cocoa);
        }

        .insp-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .insp-item-card {
          padding: 16px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .insp-item-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(52, 38, 27, 0.06);
        }

        .insp-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .insp-hive-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .insp-timestamp {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--color-warm-gray);
        }

        .insp-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .insp-item-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .insp-item-condition {
          font-size: 13px;
          color: var(--color-warm-gray);
          margin-top: 4px;
        }

        .insp-findings-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 8px;
        }

        .finding-tag {
          font-size: 11px;
          padding: 2px 7px;
          background: #F3ECE1;
          color: var(--color-deep-cocoa);
          border-radius: 6px;
        }

        .insp-observer-notes {
          font-size: 12px;
          font-style: italic;
          color: #786B61;
          margin-top: 8px;
          border-left: 2px solid var(--color-primary-honey);
          padding-left: 8px;
        }

        .insp-item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid var(--color-divider);
        }

        .insp-meta-text {
          font-size: 11px;
          color: var(--color-warm-gray);
        }

        .insp-action-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-primary-honey);
        }

        .empty-insp-card {
          padding: 36px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
};
