import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { HiveDetailView } from './HiveDetailView';
import { ApiaryListView } from './ApiaryListView';
import { RegisterFrameModal } from './RegisterFrameModal';
import { AddHiveModal } from '../hives/AddHiveModal';
import { HiveBatchModal } from './HiveBatchModal';

export const BeekeeperHivesView = () => {
  const {
    hives = [],
    apiaries = [],
    frames = [],
    selectedHiveId,
    setSelectedHiveId,
    openSheet
  } = useAppState();

  const [activeSubTab, setActiveSubTab] = useState('hives'); // 'hives' | 'apiaries'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'healthy' | 'attention'
  const [isRegisterFrameOpen, setIsRegisterFrameOpen] = useState(false);
  const [isAddHiveOpen, setIsAddHiveOpen] = useState(false);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);

  // If a specific hive is selected, render the Master Hive Detail Screen (Screen 5)
  if (selectedHiveId) {
    return (
      <HiveDetailView
        hiveId={selectedHiveId}
        onBack={() => setSelectedHiveId(null)}
      />
    );
  }

  // Filtered hives
  const activeHives = hives.filter(h => !h.isArchived);
  const filteredHives = activeHives.filter(hive => {
    if (statusFilter === 'healthy' && hive.status !== 'healthy') return false;
    if (statusFilter === 'attention' && hive.status !== 'attention') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (hive.name || '').toLowerCase().includes(q);
      const matchCode = (hive.code || '').toLowerCase().includes(q);
      const matchLoc = (hive.location || '').toLowerCase().includes(q);
      return matchName || matchCode || matchLoc;
    }
    return true;
  });

  return (
    <div className="bk-hives-view-viewport">
      {/* Header with Sub-tabs (Hives vs Apiaries) */}
      <header className="bk-hv-header">
        <div className="bk-hv-title-row">
          <div>
            <h1 className="bk-hv-title">Field Management</h1>
            <p className="bk-hv-sub">Manage apiaries, hive boxes, and registered frames</p>
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
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsRegisterFrameOpen(true)}
            >
              <Plus size={14} />
              <span>Register Frame</span>
            </button>
          </div>
        </div>

        {/* Tab switch: Hives vs Apiaries */}
        <div className="bk-hv-subnav" role="tablist">
          <button
            type="button"
            className={`bk-subnav-btn ${activeSubTab === 'hives' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('hives')}
            role="tab"
            aria-selected={activeSubTab === 'hives'}
          >
            <Layers size={16} />
            <span>Hive Boxes ({activeHives.length})</span>
          </button>
          <button
            type="button"
            className={`bk-subnav-btn ${activeSubTab === 'apiaries' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('apiaries')}
            role="tab"
            aria-selected={activeSubTab === 'apiaries'}
          >
            <Building2 size={16} />
            <span>Apiary Yards ({apiaries.length})</span>
          </button>
        </div>
      </header>

      {/* Sub-view Content */}
      {activeSubTab === 'apiaries' ? (
        <ApiaryListView onSelectHive={(hId) => setSelectedHiveId(hId)} />
      ) : (
        <div className="bk-hv-content">
          {/* Search & Filter Bar */}
          <div className="bk-search-filter-bar">
            <div className="bk-search-wrap">
              <Search size={16} color="#786D61" />
              <input
                type="text"
                className="bk-search-input"
                placeholder="Search hives by name, code or yard..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="bk-filter-pills">
              {['all', 'healthy', 'attention'].map(f => (
                <button
                  key={f}
                  type="button"
                  className={`bk-filter-pill ${statusFilter === f ? 'active' : ''}`}
                  onClick={() => setStatusFilter(f)}
                >
                  {f === 'all' ? 'All Hives' : f === 'healthy' ? 'Healthy' : 'Needs Attention'}
                </button>
              ))}
            </div>
          </div>

          {/* Hive Box Cards List (Screen 4: Hive List) */}
          <div className="bk-hives-grid"> 
            {filteredHives.map(hive => {
              const cleanCode = hive.code ? (hive.code.startsWith('H') ? hive.code : `H${String(hive.code).padStart(3, '0')}`) : 'H001';
              const hiveFrameCount = frames.filter(f => f.hiveCode === cleanCode).length;
              const isAtt = hive.status === 'attention';

              return (
                <div
                  key={hive.id}
                  className={`bk-hive-box-card ${isAtt ? 'attention' : ''}`}
                  onClick={() => setSelectedHiveId(hive.id)}
                >
                  <div className="bk-hbc-head">
                    <div className="bk-hbc-code-row">
                      <span className="bk-hbc-code">{cleanCode}</span>
                      <strong className="bk-hbc-name">{hive.name}</strong>
                    </div>
                    <span className={`bk-hbc-status ${isAtt ? 'attention' : 'healthy'}`}>
                      {isAtt ? 'Needs attention' : 'Healthy'}
                    </span>
                  </div>

                  <span className="bk-hbc-location">{hive.location || 'Apiary Yard'}</span>

                  <div className="bk-hbc-stats-row">
                    <div className="bk-hbc-stat">
                      <span className="bk-hbc-stat-k">Frames</span>
                      <strong className="bk-hbc-stat-v">{hiveFrameCount || 6}</strong>
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

                  <div className="bk-hbc-foot">
                    <span className="bk-hbc-last-note">
                      {isAtt ? 'Attention flag recorded' : 'Stable colony conditions'}
                    </span>
                    <span className="bk-hbc-view-link">View details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          padding: 18px 20px 0;
          background: #FFFFFF;
          border-bottom: 1px solid var(--color-divider);
        }
        .bk-hv-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 14px;
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
          gap: 6px;
        }
        .bk-hv-subnav {
          display: flex;
          gap: 16px;
        }
        .bk-subnav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          padding: 10px 0;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-warm-gray);
          cursor: pointer;
          position: relative;
        }
        .bk-subnav-btn.active {
          color: #496B45;
        }
        .bk-subnav-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2.5px;
          background: #496B45;
          border-radius: 2px 2px 0 0;
        }
        .bk-hv-content {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .bk-search-filter-bar {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bk-search-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 10px;
          padding: 0 12px;
          height: 42px;
        }
        .bk-search-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 13.5px;
          color: var(--color-deep-cocoa);
        }
        .bk-filter-pills {
          display: flex;
          gap: 8px;
        }
        .bk-filter-pill {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-warm-gray);
          cursor: pointer;
        }
        .bk-filter-pill.active {
          background: #496B45;
          color: #FFFFFF;
          border-color: #496B45;
        }
        .bk-hives-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bk-hive-box-card {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border);
          border-radius: 14px;
          padding: 14px 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: border-color 0.15s ease;
        }
        .bk-hive-box-card:hover {
          border-color: #D99A24;
        }
        .bk-hive-box-card.attention {
          border-color: rgba(217, 130, 43, 0.4);
          background: #FFFDF9;
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
          color: var(--color-deep-cocoa);
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
          color: var(--color-warm-gray);
          margin-top: -4px;
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
          color: var(--color-warm-gray);
        }
        .bk-hbc-stat-v {
          font-size: 13px;
          color: var(--color-deep-cocoa);
          font-weight: 700;
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
        .bk-hbc-view-link {
          font-weight: 700;
          color: #496B45;
        }
      `}</style>
    </div>
  );
};
