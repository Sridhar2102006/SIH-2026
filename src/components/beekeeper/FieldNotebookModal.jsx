import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Camera,
  ClipboardCheck,
  Droplet,
  Plus,
  QrCode,
  Calendar,
  Filter
} from 'lucide-react';

export const FieldNotebookModal = ({
  isOpen,
  onClose,
  events = [],
  onAddNewObservation,
  onSelectInspection
}) => {
  if (!isOpen) return null;

  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = events.filter(e => {
    if (activeFilter === 'scans') return e.eventType === 'HEALTH_SCAN_COMPLETED';
    if (activeFilter === 'observations') return e.eventType === 'OBSERVATION_RECORDED';
    if (activeFilter === 'harvests') return e.eventType === 'HARVEST_RECORDED';
    return true;
  });

  return (
    <div className="bk-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bk-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bk-modal-header">
          <div className="bk-header-title-wrap">
            <div className="bk-header-icon-badge" style={{ background: 'rgba(73, 107, 69, 0.14)' }}>
              <BookOpen size={20} color="#496B45" />
            </div>
            <div>
              <h2 className="bk-modal-title">Field Notebook</h2>
              <p className="bk-modal-sub">
                {events.length} chronological field notes & records
              </p>
            </div>
          </div>
          <button
            type="button"
            className="bk-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="bk-fnm-filter-bar">
          <div className="bk-filter-pills small">
            {[
              { id: 'all', label: 'All Records' },
              { id: 'scans', label: 'AI Scans' },
              { id: 'observations', label: 'Notes' },
              { id: 'harvests', label: 'Harvests' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                className={`bk-filter-pill ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {onAddNewObservation && (
            <button
              type="button"
              className="bk-fnm-add-note-btn"
              onClick={() => {
                onClose();
                onAddNewObservation();
              }}
            >
              <Plus size={13} />
              <span>New Note</span>
            </button>
          )}
        </div>

        {/* Body list */}
        <div className="bk-fnm-body">
          {filtered.length === 0 ? (
            <div className="bk-fnm-empty">
              <p>No records match the selected filter.</p>
            </div>
          ) : (
            <div className="bk-fnm-list">
              {filtered.map((evt, idx) => {
                const isScan = evt.eventType === 'HEALTH_SCAN_COMPLETED';
                const isHarvest = evt.eventType === 'HARVEST_RECORDED';
                const isIssue = (evt.summary || '').toLowerCase().includes('possible') || (evt.summary || '').toLowerCase().includes('flagged');

                return (
                  <div
                    key={evt.id || idx}
                    className="bk-fnm-entry"
                    onClick={() => {
                      if (onSelectInspection) {
                        onClose();
                        onSelectInspection(evt);
                      }
                    }}
                  >
                    <div className="bk-fnm-left">
                      <div className={`bk-fnm-icon ${isHarvest ? 'harvest' : isScan ? (isIssue ? 'attention' : 'healthy') : 'obs'}`}>
                        {isHarvest ? (
                          <Droplet size={15} />
                        ) : isScan ? (
                          <Camera size={15} />
                        ) : (
                          <ClipboardCheck size={15} />
                        )}
                      </div>
                      <div className="bk-fnm-content">
                        <div className="bk-fnm-head">
                          <strong className="bk-fnm-title">{evt.title}</strong>
                          <span className="bk-fnm-date">{evt.date}</span>
                        </div>
                        <p className="bk-fnm-summary">{evt.summary}</p>
                        <div className="bk-fnm-meta">
                          {evt.traceabilityCode && (
                            <span className="bk-fnm-code-badge">{evt.traceabilityCode}</span>
                          )}
                          <span className="bk-fnm-author">{evt.author || 'Sarah Lindqvist'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bk-fnm-footer">
          <button
            type="button"
            className="btn btn-secondary bk-fnm-close-btn"
            onClick={onClose}
          >
            Close Notebook
          </button>
        </div>
      </div>

      <style>{`
        .bk-fnm-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          background: #FAF7F2;
          border-bottom: 1px solid var(--color-divider, #E8DFD1);
        }
        .bk-fnm-add-note-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #496B45;
          color: #FFFFFF;
          border: none;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
        }
        .bk-fnm-body {
          padding: 16px 20px;
          max-height: 65vh;
          overflow-y: auto;
        }
        .bk-fnm-empty {
          text-align: center;
          padding: 24px;
          color: var(--color-warm-gray, #786D61);
          font-size: 13px;
        }
        .bk-fnm-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bk-fnm-entry {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border, #E8DFD1);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }
        .bk-fnm-entry:hover {
          border-color: #496B45;
        }
        .bk-fnm-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          width: 100%;
        }
        .bk-fnm-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .bk-fnm-icon.healthy { background: rgba(73, 107, 69, 0.12); color: #496B45; }
        .bk-fnm-icon.attention { background: rgba(217, 130, 43, 0.15); color: #D9822B; }
        .bk-fnm-icon.obs { background: #F4EAD8; color: #6B4F35; }
        .bk-fnm-icon.harvest { background: rgba(217, 154, 36, 0.15); color: #D99A24; }
        .bk-fnm-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
        }
        .bk-fnm-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-fnm-title {
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-fnm-date {
          font-size: 11px;
          color: var(--color-warm-gray, #786D61);
        }
        .bk-fnm-summary {
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
          margin: 0;
          line-height: 1.4;
        }
        .bk-fnm-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }
        .bk-fnm-code-badge {
          font-size: 10.5px;
          font-weight: 700;
          color: #496B45;
          background: rgba(73, 107, 69, 0.1);
          padding: 1px 6px;
          border-radius: 4px;
        }
        .bk-fnm-author {
          font-size: 11px;
          color: #8C7E70;
        }
        .bk-fnm-footer {
          padding: 12px 20px;
          background: #FFFFFF;
          border-top: 1px solid var(--color-divider, #E8DFD1);
          display: flex;
          justify-content: flex-end;
          border-radius: 0 0 20px 20px;
        }
        .bk-fnm-close-btn {
          height: 38px;
          padding: 0 16px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};
