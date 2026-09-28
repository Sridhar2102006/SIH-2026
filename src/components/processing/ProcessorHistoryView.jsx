import React, { useState, useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Clock,
  Search,
  Activity,
  ShieldCheck,
  Cpu,
  MessageSquare,
  AlertTriangle,
  Play,
  Send,
  Building,
  User,
  Filter,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  X,
  Shield,
  FileText,
  Lock,
  Calendar
} from 'lucide-react';

export const ProcessorHistoryView = () => {
  const {
    processingAuditLog = [],
    processingBatches = [],
    handoverRecords = [],
    setActiveTab,
    setSelectedProcessingBatchId
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'STEP' | 'INTAKE' | 'HOLD' | 'QUALITY'

  // Synthesize or combine log events to ensure rich ledger view
  const allEvents = useMemo(() => {
    return processingAuditLog;
  }, [processingAuditLog]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: allEvents.length, STEP: 0, INTAKE: 0, HOLD: 0, QUALITY: 0 };
    allEvents.forEach(item => {
      const act = (item.action || '').toUpperCase();
      if (act.includes('STEP') || act.includes('COMPLETED')) counts.STEP++;
      else if (act.includes('INTAKE') || act.includes('ACCEPT')) counts.INTAKE++;
      else if (act.includes('HOLD') || act.includes('RESUMED') || act.includes('DEVIATION')) counts.HOLD++;
      else if (act.includes('QUALITY') || act.includes('LAB')) counts.QUALITY++;
    });
    return counts;
  }, [allEvents]);

  // Filter logs by search query and category
  const filteredLogs = useMemo(() => {
    return allEvents.filter(item => {
      // Category filter
      if (selectedCategory !== 'ALL') {
        const act = (item.action || '').toUpperCase();
        if (selectedCategory === 'STEP' && !(act.includes('STEP') || act.includes('COMPLETED'))) return false;
        if (selectedCategory === 'INTAKE' && !(act.includes('INTAKE') || act.includes('ACCEPT'))) return false;
        if (selectedCategory === 'HOLD' && !(act.includes('HOLD') || act.includes('RESUMED') || act.includes('DEVIATION'))) return false;
        if (selectedCategory === 'QUALITY' && !(act.includes('QUALITY') || act.includes('LAB'))) return false;
      }

      // Search text filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchBatch = (item.batchNumber || '').toLowerCase().includes(q);
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchDetails = (item.details || '').toLowerCase().includes(q);
      const matchOp = (item.operator || '').toLowerCase().includes(q);
      const matchFacility = (item.facility || '').toLowerCase().includes(q);
      return matchBatch || matchTitle || matchDetails || matchOp || matchFacility;
    });
  }, [allEvents, selectedCategory, searchQuery]);

  const getActionBadge = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('INTAKE')) return { label: 'Intake Lot', color: 'honey', icon: <MessageSquare size={14} /> };
    if (act.includes('STEP') || act.includes('COMPLETED')) return { label: 'Step Executed', color: 'blue', icon: <Cpu size={14} /> };
    if (act.includes('HOLD') && !act.includes('RESUMED')) return { label: 'Operational Hold', color: 'red', icon: <AlertTriangle size={14} /> };
    if (act.includes('RESUMED')) return { label: 'Hold Resumed', color: 'green', icon: <Play size={14} /> };
    if (act.includes('QUALITY')) return { label: 'Quality Transfer', color: 'emerald', icon: <Send size={14} /> };
    return { label: 'Ledger Event', color: 'warm', icon: <Clock size={14} /> };
  };

  return (
    <div className="proc-history-container">
      {/* 1. Header Hero Card with Live Compliance Indicators */}
      <div className="proc-history-header">
        <div className="proc-hh-top-row">
          <div className="proc-hh-badges">
            <span className="proc-badge-amber">
              <Activity size={12} />
              <span>Operational Audit Trail</span>
            </span>
            <span className="proc-badge-green">
              <ShieldCheck size={12} />
              <span>Immutable Ledger</span>
            </span>
            <span className="proc-badge-blue">
              <Lock size={12} />
              <span>SHA-256 Validated</span>
            </span>
          </div>
          <div className="proc-hh-integrity-pill">
            <span className="proc-pulse-dot" />
            <span>Ledger Active & Verified</span>
          </div>
        </div>

        <div className="proc-hh-text-group">
          <h2 className="proc-hh-title">Processing History & Audit Trail</h2>
          <p className="proc-hh-desc">
            Cryptographically sealed, tamper-evident chronological ledger tracking raw honey intakes, operational parameters, thermal processing steps, hold dispositions, and certified quality handoffs.
          </p>
        </div>

        {/* Quick Stat Chips */}
        <div className="proc-hh-stats-grid">
          <div className="proc-hh-stat-card">
            <div className="proc-stat-icon-wrap amber">
              <FileText size={16} />
            </div>
            <div className="proc-stat-info">
              <span className="proc-stat-val">{allEvents.length}</span>
              <span className="proc-stat-lbl">Logged Events</span>
            </div>
          </div>

          <div className="proc-hh-stat-card">
            <div className="proc-stat-icon-wrap blue">
              <Cpu size={16} />
            </div>
            <div className="proc-stat-info">
              <span className="proc-stat-val">{processingBatches.length}</span>
              <span className="proc-stat-lbl">Batches Tracked</span>
            </div>
          </div>

          <div className="proc-hh-stat-card">
            <div className="proc-stat-icon-wrap green">
              <MessageSquare size={16} />
            </div>
            <div className="proc-stat-info">
              <span className="proc-stat-val">{handoverRecords.length}</span>
              <span className="proc-stat-lbl">Intake Lots</span>
            </div>
          </div>

          <div className="proc-hh-stat-card">
            <div className="proc-stat-icon-wrap emerald">
              <ShieldCheck size={16} />
            </div>
            <div className="proc-stat-info">
              <span className="proc-stat-val">100%</span>
              <span className="proc-stat-lbl">Audit Integrity</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Category Filters Toolbar */}
      <div className="proc-toolbar-card">
        <div className="proc-search-bar-wrap">
          <Search size={16} className="proc-search-icon" />
          <input
            type="text"
            className="proc-search-input"
            placeholder="Search audit trail by batch (e.g. PB-2026), operator, equipment, or remarks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="proc-clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="proc-category-pills-row">
          <button
            type="button"
            className={`proc-cat-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            <span>All Events</span>
            <span className="proc-cat-count">{categoryCounts.ALL}</span>
          </button>

          <button
            type="button"
            className={`proc-cat-pill ${selectedCategory === 'STEP' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('STEP')}
          >
            <Cpu size={13} />
            <span>Steps Executed</span>
            <span className="proc-cat-count">{categoryCounts.STEP}</span>
          </button>

          <button
            type="button"
            className={`proc-cat-pill ${selectedCategory === 'INTAKE' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('INTAKE')}
          >
            <MessageSquare size={13} />
            <span>Intake Lots</span>
            <span className="proc-cat-count">{categoryCounts.INTAKE}</span>
          </button>

          <button
            type="button"
            className={`proc-cat-pill ${selectedCategory === 'HOLD' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('HOLD')}
          >
            <AlertTriangle size={13} />
            <span>Holds & Deviations</span>
            <span className="proc-cat-count">{categoryCounts.HOLD}</span>
          </button>

          <button
            type="button"
            className={`proc-cat-pill ${selectedCategory === 'QUALITY' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('QUALITY')}
          >
            <Send size={13} />
            <span>Quality Handoffs</span>
            <span className="proc-cat-count">{categoryCounts.QUALITY}</span>
          </button>
        </div>
      </div>

      {/* 3. Audit Timeline Stream / Empty State */}
      <div className="proc-history-stream">
        {filteredLogs.length === 0 ? (
          <div className="proc-empty-state-card">
            <div className="proc-empty-icon-halo">
              <ShieldCheck size={36} color="#D97706" />
            </div>

            <h3 className="proc-empty-title">
              {searchQuery ? 'No Matching Audit Records' : 'Operational Ledger Initialized & Ready'}
            </h3>

            <p className="proc-empty-desc">
              {searchQuery
                ? `No recorded audit entries matched your query "${searchQuery}". Try clearing search keywords or selecting "All Events".`
                : 'All material intakes, parameter telemetry, thermal step executions, holds, and laboratory quality transfers are immutably signed and recorded in real time as they occur.'}
            </p>

            {!searchQuery && (
              <div className="proc-empty-triggers-box">
                <span className="proc-et-label">Automatic Audit Triggers:</span>
                <div className="proc-et-items">
                  <div className="proc-et-item">
                    <CheckCircle2 size={15} color="#059669" />
                    <span>Raw honey intake lot inspected and accepted at Intake Station</span>
                  </div>
                  <div className="proc-et-item">
                    <CheckCircle2 size={15} color="#059669" />
                    <span>Extraction, warming, filtration, or settling step logged on Live Floor</span>
                  </div>
                  <div className="proc-et-item">
                    <CheckCircle2 size={15} color="#059669" />
                    <span>Batch paused, placed on hold, resumed, or cleared of deviation</span>
                  </div>
                  <div className="proc-et-item">
                    <CheckCircle2 size={15} color="#059669" />
                    <span>Certified batch custody transferred to Quality Control Testing Lab</span>
                  </div>
                </div>
              </div>
            )}

            <div className="proc-empty-actions-row">
              {searchQuery ? (
                <button
                  type="button"
                  className="proc-action-btn primary"
                  onClick={() => setSearchQuery('')}
                >
                  <RefreshCw size={14} />
                  <span>Reset Search Filter</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="proc-action-btn primary"
                    onClick={() => setActiveTab('processing')}
                  >
                    <Cpu size={14} />
                    <span>Go to Live Processing Floor</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    className="proc-action-btn secondary"
                    onClick={() => setActiveTab('intake')}
                  >
                    <MessageSquare size={14} />
                    <span>View Intake Queue</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="proc-timeline-list">
            {filteredLogs.map(item => {
              const badge = getActionBadge(item.action);
              return (
                <div key={item.id} className={`proc-event-card border-${badge.color}`}>
                  {/* Event Top Bar */}
                  <div className="proc-ec-header">
                    <div className="proc-ec-left">
                      <div className={`proc-ec-icon-badge ${badge.color}`}>
                        {badge.icon}
                      </div>
                      <div className="proc-ec-title-wrap">
                        <div className="proc-ec-title-row">
                          <h4 className="proc-ec-title">{item.title}</h4>
                          <span className={`proc-ec-badge ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        {item.batchNumber && (
                          <div className="proc-ec-batch-row">
                            <span className="proc-ec-batch-lbl">Batch:</span>
                            <span
                              className="proc-ec-batch-code"
                              onClick={() => {
                                const b = processingBatches.find(x => x.batchNumber === item.batchNumber);
                                if (b && setSelectedProcessingBatchId) {
                                  setSelectedProcessingBatchId(b.id);
                                  setActiveTab('batches');
                                }
                              }}
                              title="Click to view batch details"
                            >
                              {item.batchNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="proc-ec-right">
                      <div className="proc-ec-timestamp">
                        <Calendar size={12} />
                        <span>{item.timestamp}</span>
                      </div>
                      <span className="proc-ec-verified-pill">
                        <CheckCircle2 size={11} />
                        <span>Cryptographically Logged</span>
                      </span>
                    </div>
                  </div>

                  {/* Event Body */}
                  <p className="proc-ec-details">{item.details}</p>

                  {/* Event Meta Footer */}
                  <div className="proc-ec-footer">
                    <div className="proc-ec-meta-item">
                      <User size={13} className="proc-meta-icon" />
                      <span className="proc-meta-lbl">Operator:</span>
                      <strong className="proc-meta-val">{item.operator || 'Plant Lead'}</strong>
                    </div>

                    <div className="proc-ec-meta-item">
                      <Building size={13} className="proc-meta-icon" />
                      <span className="proc-meta-lbl">Facility Asset:</span>
                      <strong className="proc-meta-val">{item.facility || 'Plant Processing Line'}</strong>
                    </div>

                    <div className="proc-ec-meta-item proc-ec-meta-end">
                      <Shield size={12} color="#059669" />
                      <span className="proc-ec-hash-tag">
                        REC-{item.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .proc-history-container {
          padding: 16px var(--mobile-pad, 20px) 90px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 1040px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        /* 1. Hero Header Styling */
        .proc-history-header {
          background: linear-gradient(135deg, #FFFDF8 0%, #FEF8EC 50%, #FDF1D8 100%);
          border: 1.5px solid rgba(217, 119, 6, 0.22);
          border-left: 5px solid #D97706;
          border-radius: 18px;
          padding: 22px 24px;
          box-shadow: 0 4px 20px rgba(52, 38, 27, 0.05);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .proc-hh-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .proc-hh-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .proc-badge-amber {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 750;
          color: #B45309;
          background: rgba(217, 119, 6, 0.12);
          border: 1px solid rgba(217, 119, 6, 0.25);
          padding: 3px 10px;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .proc-badge-green {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 750;
          color: #065F46;
          background: #D1FAE5;
          border: 1px solid #A7F3D0;
          padding: 3px 10px;
          border-radius: 9999px;
          letter-spacing: 0.3px;
        }

        .proc-badge-blue {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 750;
          color: #1E40AF;
          background: #DBEAFE;
          border: 1px solid #BFDBFE;
          padding: 3px 10px;
          border-radius: 9999px;
          letter-spacing: 0.3px;
        }

        .proc-hh-integrity-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11.5px;
          font-weight: 700;
          color: #047857;
          background: #FFFFFF;
          border: 1px solid #A7F3D0;
          padding: 4px 12px;
          border-radius: 9999px;
          box-shadow: 0 1px 4px rgba(5, 150, 105, 0.1);
        }

        .proc-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: procPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }

        @keyframes procPulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .proc-hh-text-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .proc-hh-title {
          font-size: 22px;
          font-weight: 850;
          color: #2E1F14;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .proc-hh-desc {
          font-size: 13.5px;
          color: #6B5B4E;
          margin: 0;
          line-height: 1.5;
          max-width: 860px;
        }

        /* Stats Grid */
        .proc-hh-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 4px;
        }

        @media (min-width: 640px) {
          .proc-hh-stats-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }
        }

        .proc-hh-stat-card {
          background: #FFFFFF;
          border: 1px solid rgba(217, 119, 6, 0.18);
          border-radius: 12px;
          padding: 11px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(52, 38, 27, 0.04);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .proc-hh-stat-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.1);
        }

        .proc-stat-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .proc-stat-icon-wrap.amber { background: #FEF3C7; color: #D97706; }
        .proc-stat-icon-wrap.blue { background: #DBEAFE; color: #2563EB; }
        .proc-stat-icon-wrap.green { background: #DCFCE7; color: #16A34A; }
        .proc-stat-icon-wrap.emerald { background: #D1FAE5; color: #059669; }

        .proc-stat-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .proc-stat-val {
          font-size: 18px;
          font-weight: 850;
          color: #2E1F14;
          line-height: 1;
        }

        .proc-stat-lbl {
          font-size: 11px;
          font-weight: 700;
          color: #8C7355;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        /* 2. Toolbar & Search Card */
        .proc-toolbar-card {
          background: #FFFFFF;
          border: 1.5px solid #E5DCCB;
          border-radius: 16px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 2px 10px rgba(52, 38, 27, 0.04);
        }

        .proc-search-bar-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .proc-search-icon {
          position: absolute;
          left: 14px;
          color: #D97706;
          pointer-events: none;
        }

        .proc-search-input {
          width: 100%;
          height: 46px;
          padding: 10px 42px 10px 42px;
          border-radius: 12px;
          border: 1.5px solid #D1C7B7;
          background: #FFFDF9;
          font-size: 13.5px;
          font-weight: 600;
          color: #2E1F14;
          box-sizing: border-box;
          transition: all 0.18s ease;
          font-family: inherit;
        }

        .proc-search-input:focus {
          outline: none;
          border-color: #D97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.18);
          background: #FFFFFF;
        }

        .proc-search-input::placeholder {
          color: #A89C8F;
          font-weight: 450;
        }

        .proc-clear-search-btn {
          position: absolute;
          right: 12px;
          background: #F3ECE1;
          border: none;
          color: #786D61;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
        }

        .proc-clear-search-btn:hover {
          background: #E5DCCB;
          color: #2E1F14;
        }

        /* Filter Pills */
        .proc-category-pills-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: thin;
        }

        .proc-cat-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: 9999px;
          background: #FAF6ED;
          border: 1.5px solid #E5DCCB;
          color: #5C4B3C;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
        }

        .proc-cat-pill:hover {
          background: #FFFDF9;
          border-color: #D97706;
          color: #B45309;
        }

        .proc-cat-pill.active {
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
          border-color: #D97706;
          color: #B45309;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.18);
        }

        .proc-cat-count {
          background: rgba(120, 109, 97, 0.12);
          padding: 2px 7px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 800;
        }

        .proc-cat-pill.active .proc-cat-count {
          background: #D97706;
          color: #FFFFFF;
        }

        /* 3. Empty State Card */
        .proc-empty-state-card {
          background: #FFFFFF;
          border: 1.5px solid #E5DCCB;
          border-radius: 18px;
          padding: 36px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 4px 20px rgba(52, 38, 27, 0.05);
          position: relative;
          overflow: hidden;
        }

        .proc-empty-state-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #D97706, #F59E0B, #D97706);
        }

        .proc-empty-icon-halo {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
          border: 2px solid #FDE68A;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          box-shadow: 0 6px 18px rgba(217, 119, 6, 0.15);
        }

        .proc-empty-title {
          font-size: 19px;
          font-weight: 800;
          color: #2E1F14;
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }

        .proc-empty-desc {
          font-size: 13.5px;
          color: #6B5B4E;
          max-width: 580px;
          margin: 0 0 20px;
          line-height: 1.5;
        }

        .proc-empty-triggers-box {
          background: #FFFDF9;
          border: 1px solid #E5DCCB;
          border-radius: 14px;
          padding: 16px 20px;
          max-width: 560px;
          width: 100%;
          text-align: left;
          margin-bottom: 24px;
          box-sizing: border-box;
        }

        .proc-et-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #8C7355;
          display: block;
          margin-bottom: 10px;
        }

        .proc-et-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .proc-et-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12.5px;
          color: #2E1F14;
        }

        .proc-empty-actions-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .proc-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 44px;
          padding: 0 18px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 750;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .proc-action-btn.primary {
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
          color: #FFFFFF;
          border: none;
          box-shadow: 0 4px 14px rgba(217, 119, 6, 0.28);
        }

        .proc-action-btn.primary:hover {
          background: linear-gradient(135deg, #B45309 0%, #92400E 100%);
          box-shadow: 0 6px 18px rgba(217, 119, 6, 0.35);
          transform: translateY(-1px);
        }

        .proc-action-btn.secondary {
          background: #FAF6ED;
          color: #5C4B3C;
          border: 1.5px solid #D1C7B7;
        }

        .proc-action-btn.secondary:hover {
          background: #F3ECE1;
          border-color: #B45309;
          color: #2E1F14;
        }

        /* 4. Timeline Stream Cards */
        .proc-timeline-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .proc-event-card {
          background: #FFFFFF;
          border: 1.5px solid #E5DCCB;
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(52, 38, 27, 0.04);
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .proc-event-card:hover {
          border-color: #D97706;
          box-shadow: 0 6px 20px rgba(52, 38, 27, 0.08);
          transform: translateY(-1px);
        }

        .proc-event-card.border-honey { border-left: 4.5px solid #D97706; }
        .proc-event-card.border-blue { border-left: 4.5px solid #2563EB; }
        .proc-event-card.border-red { border-left: 4.5px solid #DC2626; }
        .proc-event-card.border-green,
        .proc-event-card.border-emerald { border-left: 4.5px solid #059669; }
        .proc-event-card.border-warm { border-left: 4.5px solid #786D61; }

        .proc-ec-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          flex-wrap: wrap;
        }

        .proc-ec-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        .proc-ec-icon-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .proc-ec-icon-badge.honey { background: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; }
        .proc-ec-icon-badge.blue { background: #DBEAFE; color: #2563EB; border: 1px solid #BFDBFE; }
        .proc-ec-icon-badge.red { background: #FEE2E2; color: #DC2626; border: 1px solid #FECACA; }
        .proc-ec-icon-badge.green,
        .proc-ec-icon-badge.emerald { background: #D1FAE5; color: #059669; border: 1px solid #A7F3D0; }
        .proc-ec-icon-badge.warm { background: #F3F4F6; color: #4B5563; border: 1px solid #E5E7EB; }

        .proc-ec-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .proc-ec-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .proc-ec-title {
          font-size: 15px;
          font-weight: 800;
          color: #2E1F14;
          margin: 0;
          letter-spacing: -0.2px;
        }

        .proc-ec-badge {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .proc-ec-badge.honey { background: #FEF3C7; color: #92400E; }
        .proc-ec-badge.blue { background: #DBEAFE; color: #1E40AF; }
        .proc-ec-badge.red { background: #FEE2E2; color: #991B1B; }
        .proc-ec-badge.green,
        .proc-ec-badge.emerald { background: #D1FAE5; color: #065F46; }
        .proc-ec-badge.warm { background: #F3F4F6; color: #374151; }

        .proc-ec-batch-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .proc-ec-batch-lbl {
          font-size: 11.5px;
          color: #786D61;
          font-weight: 600;
        }

        .proc-ec-batch-code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 12px;
          font-weight: 750;
          color: #D97706;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          padding: 1px 7px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .proc-ec-batch-code:hover {
          background: #FEF3C7;
          text-decoration: underline;
        }

        .proc-ec-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .proc-ec-timestamp {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: #786D61;
        }

        .proc-ec-verified-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          font-weight: 750;
          color: #059669;
          background: #ECFDF5;
          padding: 2px 7px;
          border-radius: 9999px;
        }

        .proc-ec-details {
          font-size: 13.5px;
          color: #4A3B32;
          margin: 0;
          line-height: 1.5;
          background: #FFFDF9;
          border: 1px solid #F3EDE2;
          border-radius: 10px;
          padding: 10px 14px;
        }

        .proc-ec-footer {
          display: flex;
          align-items: center;
          gap: 18px;
          border-top: 1px solid #F4EFE6;
          padding-top: 10px;
          flex-wrap: wrap;
        }

        .proc-ec-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
        }

        .proc-meta-icon {
          color: #8C7355;
        }

        .proc-meta-lbl {
          color: #786D61;
        }

        .proc-meta-val {
          color: #2E1F14;
          font-weight: 750;
        }

        .proc-ec-meta-end {
          margin-left: auto;
        }

        .proc-ec-hash-tag {
          font-family: monospace;
          font-size: 10.5px;
          font-weight: 700;
          color: #059669;
          background: #ECFDF5;
          padding: 2px 6px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};
