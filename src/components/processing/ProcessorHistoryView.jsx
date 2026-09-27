import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Clock,
  Search,
  Activity,
  ShieldCheck,
  Cpu,
  Inbox,
  AlertTriangle,
  Play,
  Send,
  Building,
  User,
  Filter
} from 'lucide-react';

export const ProcessorHistoryView = () => {
  const { processingAuditLog = [] } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = processingAuditLog.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchBatch = (item.batchNumber || '').toLowerCase().includes(q);
    const matchTitle = (item.title || '').toLowerCase().includes(q);
    const matchDetails = (item.details || '').toLowerCase().includes(q);
    const matchOp = (item.operator || '').toLowerCase().includes(q);
    return matchBatch || matchTitle || matchDetails || matchOp;
  });

  const getActionIcon = (action) => {
    if (action.includes('INTAKE')) return <Inbox size={15} color="#D97706" />;
    if (action.includes('STEP') || action.includes('COMPLETED')) return <Cpu size={15} color="#2563EB" />;
    if (action.includes('HOLD')) return <AlertTriangle size={15} color="#DC2626" />;
    if (action.includes('RESUMED')) return <Play size={15} color="#059669" />;
    if (action.includes('QUALITY')) return <Send size={15} color="#059669" />;
    return <Clock size={15} color="var(--color-warm-gray)" />;
  };

  return (
    <div className="proc-history-container">
      {/* 1. Header */}
      <div className="proc-history-header card">
        <div className="proc-hh-badge-row">
          <span className="badge badge-honey">Operational Audit Trail</span>
          <span className="proc-audit-immutable-tag">Immutable Ledger</span>
        </div>
        <h2 className="proc-hh-title">Processing History & Audit Trail</h2>
        <p className="proc-hh-desc">
          Chronological record of all material intakes, equipment extractions, parameters, holds, and laboratory quality handoffs.
        </p>
      </div>

      {/* 2. Search */}
      <div className="proc-search-wrap">
        <Search size={15} className="proc-search-icon" />
        <input
          type="text"
          className="proc-search-input"
          placeholder="Search by batch, operator, or event details..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 3. Audit Timeline */}
      <div className="proc-history-list">
        {filteredLogs.length === 0 ? (
          <div className="proc-empty-card card">
            <Clock size={32} color="var(--color-warm-gray)" />
            <h4 className="proc-empty-title">No Audit Records Found</h4>
            <p className="proc-empty-text">No recorded events matching search criteria.</p>
          </div>
        ) : (
          filteredLogs.map(item => (
            <div key={item.id} className="card proc-history-card">
              <div className="proc-hc-top">
                <div className="proc-hc-title-row">
                  <div className="proc-hc-icon-wrap">
                    {getActionIcon(item.action)}
                  </div>
                  <div>
                    <h4 className="proc-hc-title">{item.title}</h4>
                    {item.batchNumber && (
                      <span className="proc-hc-batch-code">{item.batchNumber}</span>
                    )}
                  </div>
                </div>
                <span className="proc-hc-time">{item.timestamp}</span>
              </div>

              <p className="proc-hc-details">{item.details}</p>

              <div className="proc-hc-meta-bar">
                <div className="proc-hc-meta-item">
                  <User size={12} />
                  <span>{item.operator}</span>
                </div>
                <div className="proc-hc-meta-item">
                  <Building size={12} />
                  <span>{item.facility}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .proc-history-container {
          padding: 16px var(--mobile-pad, 16px) 80px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .proc-history-header {
          padding: 18px 20px;
          background: #FFFDF8;
          border: 1px solid var(--color-divider, #E5DCCB);
        }

        .proc-audit-immutable-tag {
          font-size: 11px;
          font-weight: 700;
          color: #059669;
          background: #D1FAE5;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .proc-history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .proc-history-card {
          padding: 14px 16px;
          background: #FFFFFF;
          border: 1px solid var(--color-divider, #E5DCCB);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .proc-hc-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .proc-hc-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .proc-hc-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #FFFDF8;
          border: 1px solid #E5DCCB;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .proc-hc-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2C1810);
          margin: 0;
        }

        .proc-hc-batch-code {
          font-family: monospace;
          font-size: 11.5px;
          color: var(--color-primary-honey, #D97706);
          font-weight: 600;
        }

        .proc-hc-time {
          font-size: 11.5px;
          color: var(--color-warm-gray, #736961);
        }

        .proc-hc-details {
          font-size: 12.5px;
          color: var(--color-deep-cocoa, #2C1810);
          margin: 0;
          line-height: 1.45;
        }

        .proc-hc-meta-bar {
          display: flex;
          gap: 16px;
          border-top: 1px solid #F3F4F6;
          padding-top: 6px;
          font-size: 11px;
          color: var(--color-warm-gray, #736961);
        }

        .proc-hc-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
    </div>
  );
};
