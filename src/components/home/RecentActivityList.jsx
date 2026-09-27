import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { StatusBadge } from '../common/StatusBadge';
import { CalendarClock, CheckCircle, AlertTriangle, Droplet } from 'lucide-react';

export const RecentActivityList = () => {
  const { activities } = useAppState();

  const getActivityIcon = (type) => {
    switch (type) {
      case 'inspection':
        return <CheckCircle size={15} color="var(--color-healthy)" />;
      case 'alert':
        return <AlertTriangle size={15} color="var(--color-attention)" />;
      case 'honey':
        return <Droplet size={15} color="var(--color-deep-honey)" />;
      default:
        return <CalendarClock size={15} color="var(--color-warm-gray)" />;
    }
  };

  return (
    <section className="activity-section">
      {/* What happens next banner */}
      <div className="card next-up-card">
        <div className="next-up-header">
          <CalendarClock size={16} color="var(--color-deep-honey)" />
          <span className="micro-text" style={{ color: 'var(--color-deep-cocoa)' }}>What happens next</span>
        </div>
        <p className="body-text" style={{ fontSize: '14px', marginTop: '6px' }}>
          <strong>Tomorrow, 09:00 AM:</strong> Follow-up inspection on <em>Hive 02</em> sticky board for Varroa count.
        </p>
        <p className="supporting-text" style={{ marginTop: '4px' }}>
          Batch <strong>#HB-2026-08</strong> lab certification ready for cryptographic packaging seal.
        </p>
      </div>

      {/* Recent Activity Timeline */}
      <div className="section-header" style={{ marginTop: '24px', marginBottom: '12px' }}>
        <span className="micro-text">Audit trail</span>
        <h2 className="heading-section">Recent Field Activity</h2>
      </div>

      <div className="activity-list">
        {activities.slice(0, 4).map((act) => (
          <div key={act.id} className="activity-item">
            <div className="activity-icon-node">
              {getActivityIcon(act.type)}
            </div>
            <div className="activity-content">
              <div className="activity-top">
                <span className="activity-title">{act.title}</span>
                <span className="activity-time">{act.timestamp}</span>
              </div>
              <p className="supporting-text activity-desc">{act.description}</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .activity-section {
          margin-bottom: var(--space-20);
        }

        .next-up-card {
          background-color: #FAF4E9;
          border-left: 3px solid var(--color-deep-honey);
          padding: 14px 16px;
        }

        .next-up-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-card-border);
          border-radius: var(--radius-card);
        }

        .activity-icon-node {
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #FAF2E4;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 3px;
        }

        .activity-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .activity-time {
          font-size: 11px;
          color: var(--color-warm-gray);
          white-space: nowrap;
        }

        .activity-desc {
          font-size: 13px;
          line-height: 1.4;
          color: var(--color-warm-gray);
        }
      `}</style>
    </section>
  );
};
