import React, { useState } from 'react';
import {
  ClipboardCheck,
  Camera,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  QrCode,
  ShieldCheck,
  ChevronRight,
  Filter,
  Search,
  Plus,
  Check,
  FileText,
  Sparkles,
  Layers,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { FrameInspectionWorkstation } from './FrameInspectionWorkstation';
import { InspectionDetailModal } from './InspectionDetailModal';
import { HiveInspectionModal } from '../hives/HiveInspectionModal';

const PRESET_NOTE_TAGS = [
  'Active pollen foraging',
  'Queen spotted & solid brood',
  'Calm temperament',
  'Honey super filling nicely',
  'Defensive flight observed',
  'Drawn comb inspection normal'
];

export const BeekeeperInspectionsView = () => {
  const {
    frames = [],
    hives = [],
    hiveHistoryEvents = [],
    setHiveHistoryEvents,
    recordObservation,
    showToast
  } = useAppState();

  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'notes' | 'logs'
  const [isWorkstationOpen, setIsWorkstationOpen] = useState(false);
  const [isHiveInspectOpen, setIsHiveInspectOpen] = useState(false);
  const [selectedInspectionEvent, setSelectedInspectionEvent] = useState(null);

  // Notes state
  const [noteHiveId, setNoteHiveId] = useState(() => hives[0]?.id || '');
  const [noteText, setNoteText] = useState('');
  const [selectedPresetTag, setSelectedPresetTag] = useState('');

  // Logs state
  const [logFilter, setLogFilter] = useState('all'); // 'all' | 'scans' | 'routine' | 'alerts'
  const [logSearch, setLogSearch] = useState('');

  // Synchronize default hive for notes
  React.useEffect(() => {
    if (!noteHiveId && hives.length > 0) {
      setNoteHiveId(hives[0].id);
    }
  }, [hives, noteHiveId]);

  // Event categories (remove demo pre-seeded record 'hist-demo-04' from recent scans)
  const scanEvents = hiveHistoryEvents.filter(
    e => e.eventType === 'HEALTH_SCAN_COMPLETED' && e.id !== 'hist-demo-04' && !e.isDemo
  );
  const noteEvents = hiveHistoryEvents.filter(e => e.eventType === 'OBSERVATION_RECORDED');
  const allInspectionEvents = hiveHistoryEvents.filter(e =>
    (e.eventType === 'HEALTH_SCAN_COMPLETED' ||
     e.eventType === 'INSPECTION_PERFORMED' ||
     e.eventType === 'OBSERVATION_RECORDED' ||
     e.eventType === 'MONITORING_ALERT') &&
    e.id !== 'hist-demo-04'
  );

  // Delete an inspection/scan event
  const handleDeleteEvent = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this record from inspection history?')) {
      if (setHiveHistoryEvents) {
        setHiveHistoryEvents(prev => prev.filter(item => item.id !== id));
      }
      if (showToast) showToast('Record removed');
    }
  };

  // Filtered logs
  const filteredLogs = allInspectionEvents.filter(e => {
    if (logFilter === 'scans' && e.eventType !== 'HEALTH_SCAN_COMPLETED') return false;
    if (logFilter === 'routine' && (e.eventType === 'HEALTH_SCAN_COMPLETED' || e.eventType === 'MONITORING_ALERT')) return false;
    if (logFilter === 'alerts' && e.eventType !== 'MONITORING_ALERT') return false;

    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      const matchTitle = (e.title || '').toLowerCase().includes(q);
      const matchSummary = (e.summary || '').toLowerCase().includes(q);
      const matchCode = (e.traceabilityCode || '').toLowerCase().includes(q);
      const matchHive = (e.hiveCode || '').toLowerCase().includes(q);
      return matchTitle || matchSummary || matchCode || matchHive;
    }
    return true;
  });

  const handleSaveNote = (e) => {
    e.preventDefault();
    const finalNote = noteText.trim() || selectedPresetTag;
    if (!finalNote) {
      if (showToast) showToast('Please enter an observation note');
      return;
    }

    const targetHive = hives.find(h => h.id === noteHiveId) || hives[0];
    if (targetHive) {
      recordObservation({ hiveId: targetHive.id, text: finalNote });
    }

    setNoteText('');
    setSelectedPresetTag('');
  };

  return (
    <div className="bk-inspections-viewport">
      {/* Header */}
      <header className="bk-insp-header">
        <div className="bk-insp-title-row">
          <div className="bk-insp-icon">
            <ClipboardCheck size={22} color="#D99A24" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="bk-insp-title">Field Inspections</h1>
            <p className="bk-insp-sub">Colony frame evaluations & optical health analysis</p>
          </div>
        </div>

        {/* Simplified Segmented Navigation Bar: AI-HEALTH SCAN | NOTES | LOGS */}
        <div className="bk-insp-segmented-nav">
          <button
            type="button"
            className={`bk-insp-seg-btn ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            <Camera size={16} />
            <span>AI - Health Scan</span>
            {scanEvents.length > 0 && <span className="bk-insp-seg-count">{scanEvents.length}</span>}
          </button>

          <button
            type="button"
            className={`bk-insp-seg-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <BookOpen size={16} />
            <span>Notes</span>
            {noteEvents.length > 0 && <span className="bk-insp-seg-count">{noteEvents.length}</span>}
          </button>

          <button
            type="button"
            className={`bk-insp-seg-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <ClipboardCheck size={16} />
            <span>Logs</span>
            <span className="bk-insp-seg-count">{allInspectionEvents.length}</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="bk-insp-body">
        {/* ========================================================= */}
        {/* 1. AI - HEALTH SCAN COMPONENT                             */}
        {/* ========================================================= */}
        {activeTab === 'scan' && (
          <div className="bk-insp-panel">
            {/* Simple Scan Action Card */}
            <div className="bk-scan-hero-card">
              <div className="bk-scan-hero-content">
                <h2 className="bk-scan-hero-title">Inspect Your Frames With AI</h2>
                <p className="bk-scan-hero-desc">
                  PLACE YOUR FRAME AND DETECT YOUR HONEY HEALTH
                </p>
                <div className="bk-scan-actions">
                  <button
                    type="button"
                    className="btn btn-primary bk-scan-launch-btn"
                    onClick={() => setIsWorkstationOpen(true)}
                  >
                    <Camera size={18} />
                    <span>Launch AI Health Scan (Workstation)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent AI Diagnostic Scans Section */}
            <div className="bk-sub-section">
              <div className="bk-sub-sec-head">
                <h3 className="bk-sub-sec-title">Recent AI Diagnostic Scans</h3>
                <span className="bk-sub-sec-sub">Optical comb evaluations with photographic evidence</span>
              </div>

              {scanEvents.length === 0 ? (
                <div className="bk-empty-panel">
                  <Camera size={32} color="#D97706" />
                  <h4>No AI Comb Scans Recorded Yet</h4>
                  <p>Open the inspection workstation to capture a frame and run your first optical AI scan.</p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsWorkstationOpen(true)}
                  >
                    <Camera size={15} />
                    <span>Scan First Frame</span>
                  </button>
                </div>
              ) : (
                <div className="bk-scan-results-list">
                  {scanEvents.map(evt => {
                    const isIssue = (evt.summary || '').toLowerCase().includes('possible') || (evt.summary || '').toLowerCase().includes('flagged');
                    return (
                      <div
                        key={evt.id}
                        className="bk-scan-result-card"
                        onClick={() => setSelectedInspectionEvent(evt)}
                      >
                        <div className="bk-src-left">
                          <div className={`bk-src-badge ${isIssue ? 'attention' : 'healthy'}`}>
                            <Camera size={16} />
                          </div>
                          <div className="bk-src-details">
                            <div className="bk-src-title-row">
                              <strong className="bk-src-title">{evt.title}</strong>
                              <span className={`bk-src-status ${isIssue ? 'attention' : 'healthy'}`}>
                                {isIssue ? 'Needs Attention' : 'Healthy Pattern'}
                              </span>
                            </div>
                            <p className="bk-src-summary">{evt.summary}</p>
                            <div className="bk-src-meta">
                              {evt.traceabilityCode && (
                                <span className="bk-src-code">{evt.traceabilityCode}</span>
                              )}
                              <span>{evt.date} • {evt.time}</span>
                              <span>By {evt.author}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bk-src-right">
                          {evt.evidence && (
                            <img src={evt.evidence} alt="Scan Evidence" className="bk-src-thumb" />
                          )}
                          <button
                            type="button"
                            className="bk-evt-del-btn"
                            title="Delete scan"
                            onClick={(e) => handleDeleteEvent(e, evt.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                          <ChevronRight size={16} color="#A89F91" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. NOTES COMPONENT                                        */}
        {/* ========================================================= */}
        {activeTab === 'notes' && (
          <div className="bk-insp-panel">
            {/* Quick Note Entry Form */}
            <form onSubmit={handleSaveNote} className="bk-note-entry-card">
              <div className="bk-note-entry-head">
                <div className="bk-note-entry-title-wrap">
                  <FileText size={18} color="#D97706" />
                  <h3 className="bk-note-entry-title">Record Field Note</h3>
                </div>
                <div className="bk-note-hive-select-wrap">
                  <label htmlFor="note-hive-select" className="bk-note-hive-label">Colony:</label>
                  <select
                    id="note-hive-select"
                    className="bk-note-hive-select"
                    value={noteHiveId}
                    onChange={e => setNoteHiveId(e.target.value)}
                  >
                    {hives.length === 0 ? (
                      <option value="">No colonies found</option>
                    ) : (
                      hives.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.code ? `H${String(h.code).padStart(3, '0')}` : 'Colony'} — {h.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Quick Preset Tags */}
              <div className="bk-preset-chips-wrap">
                <span className="bk-preset-hint">Quick tag:</span>
                <div className="bk-preset-chips">
                  {PRESET_NOTE_TAGS.map(tag => {
                    const isSelected = selectedPresetTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`bk-preset-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedPresetTag('');
                          } else {
                            setSelectedPresetTag(tag);
                            if (!noteText) setNoteText(tag);
                          }
                        }}
                      >
                        {isSelected && <Check size={12} strokeWidth={2.6} />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note Textarea */}
              <div className="bk-note-textarea-wrap">
                <textarea
                  className="bk-note-textarea"
                  rows={2}
                  placeholder="Record colony observations, brood development, queen markings, or weather conditions..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                />
              </div>

              <div className="bk-note-submit-row">
                <button type="submit" className="btn btn-primary bk-note-save-btn">
                  <Plus size={16} />
                  <span>Save Field Note</span>
                </button>
              </div>
            </form>

            {/* Field Notes List */}
            <div className="bk-sub-section">
              <div className="bk-sub-sec-head">
                <h3 className="bk-sub-sec-title">Field Notes & Observations</h3>
                <span className="bk-sub-sec-sub">Chronological beekeeper log entries</span>
              </div>

              {noteEvents.length === 0 ? (
                <div className="bk-empty-panel">
                  <BookOpen size={32} color="#D97706" />
                  <h4>No Field Notes Recorded Yet</h4>
                  <p>Log your first observation above to track colony behaviors and field conditions.</p>
                </div>
              ) : (
                <div className="bk-notes-list">
                  {noteEvents.map(evt => (
                    <div key={evt.id} className="bk-note-card">
                      <div className="bk-nc-head">
                        <div className="bk-nc-colony">
                          <span className="bk-nc-code">{evt.hiveCode || 'Colony'}</span>
                          <strong className="bk-nc-title">{evt.title}</strong>
                        </div>
                        <div className="bk-nc-actions">
                          <span className="bk-nc-date">{evt.date} • {evt.time}</span>
                          <button
                            type="button"
                            className="bk-evt-del-btn"
                            title="Delete note"
                            onClick={(e) => handleDeleteEvent(e, evt.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <p className="bk-nc-text">{evt.summary}</p>
                      <div className="bk-nc-footer">
                        <span className="bk-nc-author">Logged by {evt.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. LOGS COMPONENT                                         */}
        {/* ========================================================= */}
        {activeTab === 'logs' && (
          <div className="bk-insp-panel">
            {/* Filter & Search Bar */}
            <div className="bk-logs-filter-bar">
              <div className="bk-logs-search-wrap">
                <Search size={16} color="#786D61" />
                <input
                  type="text"
                  className="bk-logs-search-input"
                  placeholder="Search logs by hive, frame, code or keywords..."
                  value={logSearch}
                  onChange={e => setLogSearch(e.target.value)}
                />
              </div>

              <div className="bk-filter-pills">
                {[
                  { id: 'all', label: 'All Records' },
                  { id: 'scans', label: 'AI Scans' },
                  { id: 'routine', label: 'Routine Checks' },
                  { id: 'alerts', label: 'Alerts' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    className={`bk-filter-pill ${logFilter === f.id ? 'active' : ''}`}
                    onClick={() => setLogFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Log Events List */}
            {filteredLogs.length === 0 ? (
              <div className="bk-empty-panel">
                <ClipboardCheck size={32} color="#D97706" />
                <h4>No Log Records Found</h4>
                <p>No field inspection logs match your search or filter.</p>
              </div>
            ) : (
              <div className="bk-insp-event-list">
                {filteredLogs.map(evt => {
                  const isScan = evt.eventType === 'HEALTH_SCAN_COMPLETED';
                  const isAlert = evt.eventType === 'MONITORING_ALERT';
                  const isIssue = (evt.summary || '').toLowerCase().includes('possible') || (evt.summary || '').toLowerCase().includes('flagged');

                  return (
                    <div
                      key={evt.id}
                      className="bk-insp-event-card"
                      onClick={() => setSelectedInspectionEvent(evt)}
                      role="button"
                      tabIndex={0}
                      title="Click to view full inspection record"
                    >
                      <div className="bk-iec-left">
                        <div className={`bk-iec-icon-badge ${isScan ? (isIssue ? 'attention' : 'healthy') : isAlert ? 'attention' : 'routine'}`}>
                          {isScan ? (
                            <Camera size={16} />
                          ) : isAlert ? (
                            <AlertTriangle size={16} />
                          ) : (
                            <ClipboardCheck size={16} />
                          )}
                        </div>
                        <div className="bk-iec-details">
                          <div className="bk-iec-head">
                            <strong className="bk-iec-title">{evt.title}</strong>
                            <span className="bk-iec-date">{evt.date} • {evt.time}</span>
                          </div>
                          <p className="bk-iec-summary">{evt.summary}</p>
                          <div className="bk-iec-meta-row">
                            {evt.traceabilityCode && (
                              <span className="bk-iec-trace">{evt.traceabilityCode}</span>
                            )}
                            <span className="bk-iec-author">By {evt.author}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bk-iec-right">
                        {evt.evidence && (
                          <div className="bk-iec-thumb-wrap">
                            <img src={evt.evidence} alt="Inspection evidence" className="bk-iec-thumb" />
                          </div>
                        )}
                        <button
                          type="button"
                          className="bk-evt-del-btn"
                          title="Delete log record"
                          onClick={(e) => handleDeleteEvent(e, evt.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                        <ChevronRight size={16} className="bk-iec-arrow" color="#A89F91" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Workstation & Modals */}
      <FrameInspectionWorkstation
        isOpen={isWorkstationOpen}
        onClose={() => setIsWorkstationOpen(false)}
      />

      <HiveInspectionModal
        isOpen={isHiveInspectOpen}
        onClose={() => setIsHiveInspectOpen(false)}
        initialHiveId={hives[0]?.id}
      />

      <InspectionDetailModal
        isOpen={Boolean(selectedInspectionEvent)}
        inspectionEvent={selectedInspectionEvent}
        onClose={() => setSelectedInspectionEvent(null)}
        onOpenWorkstation={() => setIsWorkstationOpen(true)}
      />

      <style>{`
        .bk-inspections-viewport {
          padding-bottom: 90px;
        }

        .bk-insp-header {
          padding: 18px 20px 14px;
          background: #FFFFFF;
          border-bottom: 1px solid var(--color-divider);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .bk-insp-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bk-insp-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bk-insp-title {
          font-size: 19px;
          font-weight: 800;
          color: var(--color-deep-cocoa);
          margin: 0;
          line-height: 1.25;
        }

        .bk-insp-sub {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          margin: 2px 0 0;
        }

        /* Segmented Navigation Switcher: AI - Health Scan | Notes | Logs */
        .bk-insp-segmented-nav {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: #F3EFEA;
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
        }

        .bk-insp-seg-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: transparent;
          border: none;
          padding: 10px 8px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 650;
          color: var(--color-warm-gray);
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .bk-insp-seg-btn:hover {
          color: var(--color-deep-cocoa);
        }

        .bk-insp-seg-btn.active {
          background: #FFFFFF;
          color: #92400E;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .bk-insp-seg-count {
          font-size: 10.5px;
          font-weight: 800;
          background: rgba(217, 119, 6, 0.14);
          color: #B45309;
          padding: 1px 6px;
          border-radius: 10px;
        }

        .bk-insp-body {
          padding: 16px 20px;
        }

        .bk-insp-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Scan Hero Card */
        .bk-scan-hero-card {
          background: linear-gradient(135deg, #2A4833 0%, #1E3725 100%);
          border-radius: 16px;
          padding: 20px 22px;
          color: #FFFFFF;
          box-shadow: 0 4px 16px rgba(30, 55, 37, 0.18);
        }

        .bk-scan-hero-title {
          font-size: 18px;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0 0 6px 0;
        }

        .bk-scan-hero-desc {
          font-size: 13px;
          color: #E2E8F0;
          line-height: 1.45;
          margin: 0 0 16px 0;
          max-width: 600px;
          letter-spacing: 0.5px;
        }

        .bk-scan-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .bk-scan-launch-btn {
          height: 42px;
          padding: 0 18px;
          font-size: 13.5px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #F59E0B;
          color: #1E293B;
          border: none;
        }

        .bk-scan-launch-btn:hover {
          background: #D97706;
          color: #FFFFFF;
        }

        /* Sub-sections */
        .bk-sub-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .bk-sub-sec-head {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .bk-sub-sec-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--color-deep-cocoa);
          margin: 0;
        }

        .bk-sub-sec-sub {
          font-size: 12px;
          color: var(--color-warm-gray);
        }

        /* Scan Results List */
        .bk-scan-results-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .bk-scan-result-card {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .bk-scan-result-card:hover {
          border-color: #D97706;
          background: #FFFDF9;
        }

        .bk-src-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        .bk-src-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bk-src-badge.healthy {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
        }

        .bk-src-badge.attention {
          background: rgba(245, 158, 11, 0.14);
          color: #D97706;
        }

        .bk-src-details {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .bk-src-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bk-src-title {
          font-size: 14px;
          color: var(--color-deep-cocoa);
        }

        .bk-src-status {
          font-size: 10.5px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .bk-src-status.healthy {
          background: #ECFDF5;
          color: #047857;
        }

        .bk-src-status.attention {
          background: #FFFBEB;
          color: #B45309;
        }

        .bk-src-summary {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          margin: 0;
          line-height: 1.35;
        }

        .bk-src-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          color: var(--color-warm-gray);
          margin-top: 2px;
        }

        .bk-src-code {
          background: #F3EFEA;
          color: #786D61;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .bk-src-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bk-src-thumb {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--color-divider);
        }

        .bk-evt-del-btn {
          background: none;
          border: 1px solid transparent;
          color: #9CA3AF;
          cursor: pointer;
          padding: 5px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .bk-evt-del-btn:hover {
          color: #DC2626;
          background: #FEF2F2;
          border-color: #FCA5A5;
        }

        /* Note Entry Card */
        .bk-note-entry-card {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bk-note-entry-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .bk-note-entry-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bk-note-entry-title {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          margin: 0;
        }

        .bk-note-hive-select-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bk-note-hive-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-warm-gray);
        }

        .bk-note-hive-select {
          padding: 5px 8px;
          border-radius: 7px;
          border: 1px solid var(--color-card-border);
          font-size: 12.5px;
          color: var(--color-deep-cocoa);
          background: #FAF8F5;
          outline: none;
        }

        .bk-preset-chips-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .bk-preset-hint {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-warm-gray);
        }

        .bk-preset-chips {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .bk-preset-chip {
          background: #FAF7F2;
          border: 1px solid var(--color-card-border);
          border-radius: 14px;
          padding: 4px 9px;
          font-size: 11.5px;
          color: var(--color-warm-gray);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.15s ease;
        }

        .bk-preset-chip:hover {
          border-color: #D97706;
          background: #FFFDF9;
        }

        .bk-preset-chip.active {
          background: #FEF3C7;
          border-color: #F59E0B;
          color: #B45309;
          font-weight: 700;
        }

        .bk-note-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border: 1px solid var(--color-card-border);
          border-radius: 9px;
          font-size: 13.5px;
          font-family: inherit;
          color: var(--color-deep-cocoa);
          resize: vertical;
          min-height: 58px;
          outline: none;
        }

        .bk-note-textarea:focus {
          border-color: #D97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
        }

        .bk-note-submit-row {
          display: flex;
          justify-content: flex-end;
        }

        .bk-note-save-btn {
          height: 38px;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        /* Notes List */
        .bk-notes-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .bk-note-card {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bk-nc-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .bk-nc-colony {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bk-nc-code {
          background: rgba(217, 119, 6, 0.12);
          color: #92400E;
          font-size: 11px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .bk-nc-title {
          font-size: 13.5px;
          color: var(--color-deep-cocoa);
        }

        .bk-nc-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bk-nc-date {
          font-size: 11px;
          color: var(--color-warm-gray);
        }

        .bk-nc-text {
          font-size: 13px;
          color: #3C2E20;
          line-height: 1.4;
          margin: 0;
        }

        .bk-nc-footer {
          font-size: 11px;
          color: var(--color-warm-gray);
        }

        /* Logs Filter Bar */
        .bk-logs-filter-bar {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bk-logs-search-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border, #E2DAD0);
          border-radius: 12px;
          padding: 0 14px;
          height: 44px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .bk-logs-search-wrap:focus-within {
          border-color: #D97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
        }

        .bk-logs-search-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 13.5px;
          color: var(--color-deep-cocoa);
        }

        /* Filter Pills in Logs */
        .bk-filter-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .bk-filter-pill {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border, #E2DAD0);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-warm-gray, #786D61);
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          outline: none;
        }

        .bk-filter-pill:hover {
          border-color: #D97706;
          color: #2E2015;
          background: #FFFDF9;
        }

        .bk-filter-pill.active {
          background: #D97706;
          border-color: #D97706;
          color: #FFFFFF;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(217, 119, 6, 0.2);
        }

        .bk-insp-event-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .bk-insp-event-card {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .bk-insp-event-card:hover {
          border-color: #D97706;
          background: #FFFDF9;
        }

        .bk-iec-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        .bk-iec-icon-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bk-iec-icon-badge.healthy {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
        }

        .bk-iec-icon-badge.attention {
          background: rgba(245, 158, 11, 0.14);
          color: #D97706;
        }

        .bk-iec-icon-badge.routine {
          background: rgba(59, 130, 246, 0.12);
          color: #2563EB;
        }

        .bk-iec-details {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .bk-iec-head {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bk-iec-title {
          font-size: 14px;
          color: var(--color-deep-cocoa);
        }

        .bk-iec-date {
          font-size: 11px;
          color: var(--color-warm-gray);
        }

        .bk-iec-summary {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          margin: 0;
          line-height: 1.35;
        }

        .bk-iec-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }

        .bk-iec-trace {
          background: #F3EFEA;
          color: #786D61;
          font-size: 11px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .bk-iec-author {
          font-size: 11px;
          color: var(--color-warm-gray);
        }

        .bk-iec-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bk-iec-thumb-wrap {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--color-divider);
        }

        .bk-iec-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Empty State */
        .bk-empty-panel {
          background: #FFFFFF;
          border: 1.5px dashed var(--color-card-border);
          border-radius: 14px;
          padding: 32px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .bk-empty-panel h4 {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          margin: 0;
        }

        .bk-empty-panel p {
          font-size: 12.5px;
          color: var(--color-warm-gray);
          margin: 0;
          max-width: 360px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};
