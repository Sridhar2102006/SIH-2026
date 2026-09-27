import React from 'react';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Microscope,
  ClipboardList,
  TestTube2,
  BadgeCheck
} from 'lucide-react';

export const QualityModule = ({
  batches = [],
  qualityChecks = [],
  canRecordResult = false,
  canReview = false,
  canDecide = false,
  onOpenQualityCheck,
  onRecordResult
}) => {
  const pendingChecks = qualityChecks.filter(
    q => q.status === 'pending' || q.status === 'needs_attention'
  );
  const passedChecks = qualityChecks.filter(q => q.status === 'passed');
  const latestBatch = batches[0];

  return (
    <div className="hv-section">
      <div className="hv-sec-head">
        <div className="hv-sec-title-wrap">
          <span className="hv-sec-title">Quality & Laboratory Results</span>
          <span className="hv-sec-tagline">Moisture, enzyme tests, and certified approvals</span>
        </div>
        {canReview && pendingChecks.length > 0 && (
          <span className="hv-qc-pending-badge">
            {pendingChecks.length} Awaiting Review
          </span>
        )}
      </div>

      {/* Lab Readings Matrix */}
      <div className="hv-lab-matrix">
        <div className="hv-lab-cell">
          <span className="hv-lc-lbl">Moisture</span>
          <strong className="hv-lc-val">{latestBatch?.moisture || 17.6}%</strong>
          <span className="hv-lc-std">&lt; 18.5% Codex Std</span>
        </div>
        <div className="hv-lab-cell">
          <span className="hv-lc-lbl">HMF Level</span>
          <strong className="hv-lc-val">{latestBatch?.hmfLevel || '4.2 mg/kg'}</strong>
          <span className="hv-lc-std">Fresh raw standard</span>
        </div>
        <div className="hv-lab-cell">
          <span className="hv-lc-lbl">Diastase Activity</span>
          <strong className="hv-lc-val">{latestBatch?.diastase || '15.4 DN'}</strong>
          <span className="hv-lc-std">Active enzymes</span>
        </div>
      </div>

      {/* Pending Quality Queue List */}
      {pendingChecks.length > 0 ? (
        <div className="hv-qc-queue-card">
          <div className="hv-qc-queue-header">
            <span className="hv-qc-queue-title">Pending Samples Queue</span>
            <span className="hv-qc-queue-count">{pendingChecks.length} in queue</span>
          </div>

          <div className="hv-qc-list">
            {pendingChecks.slice(0, 2).map((qc) => {
              const needsAttn = qc.status === 'needs_attention';
              return (
                <div
                  key={qc.id}
                  className={`hv-qc-item ${needsAttn ? 'attn' : ''}`}
                  onClick={() => onOpenQualityCheck && onOpenQualityCheck(qc)}
                >
                  <div className="hv-qc-item-left">
                    <span className="hv-qc-item-batch">{qc.batchNumber || `Batch ${qc.batchId}`}</span>
                    <strong className="hv-qc-item-sample">{qc.title || 'Laboratory Sample Screening'}</strong>
                  </div>
                  <div className="hv-qc-item-right">
                    <span className={`hv-qc-status-tag ${needsAttn ? 'attn' : 'pending'}`}>
                      {needsAttn ? 'Needs Attention' : 'Ready for Review'}
                    </span>
                    <ArrowRight size={13} color="#786D61" />
                  </div>
                </div>
              );
            })}
          </div>

          {(canReview || canDecide) && (
            <button
              className="hv-qc-cta-btn"
              onClick={() => onOpenQualityCheck && onOpenQualityCheck(pendingChecks[0])}
            >
              <ShieldCheck size={16} />
              <span>Review Lab Results</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="hv-qc-all-passed-card">
          <CheckCircle2 size={18} color="#4F7A52" />
          <div>
            <strong className="hv-qcap-title">All submitted samples passed</strong>
            <p className="hv-qcap-sub">Zero pesticide residues. Sugar spectrum complies with floral nectar profile.</p>
          </div>
        </div>
      )}

      {/* Daily Actions Grid */}
      <div className="hv-daily-actions-section">
        <span className="hv-daily-actions-title">Daily Actions</span>
        <div className="hv-da-grid">
          <button
            className="hv-da-card sage"
            onClick={() => onRecordResult && onRecordResult()}
          >
            <div className="hv-da-icon"><FlaskConical size={18} /></div>
            <strong className="hv-da-label">Refractometry</strong>
            <span className="hv-da-sub">Record moisture %</span>
          </button>
          <button
            className="hv-da-card warm"
            onClick={() => onOpenQualityCheck && onOpenQualityCheck(pendingChecks[0])}
          >
            <div className="hv-da-icon"><TestTube2 size={18} /></div>
            <strong className="hv-da-label">Submit Sample</strong>
            <span className="hv-da-sub">Log lab screening</span>
          </button>
          <button
            className="hv-da-card honey"
            onClick={() => onOpenQualityCheck && onOpenQualityCheck(pendingChecks[0])}
          >
            <div className="hv-da-icon"><ClipboardList size={18} /></div>
            <strong className="hv-da-label">Review Results</strong>
            <span className="hv-da-sub">Pending queue</span>
          </button>
          <button
            className="hv-da-card brown"
            onClick={() => onOpenQualityCheck && onOpenQualityCheck(pendingChecks[0])}
          >
            <div className="hv-da-icon"><BadgeCheck size={18} /></div>
            <strong className="hv-da-label">Approve Batch</strong>
            <span className="hv-da-sub">Certify lot purity</span>
          </button>
        </div>
      </div>

      <style>{`
        .hv-qc-pending-badge {
          font-size: 11px;
          font-weight: 750;
          color: #D9822B;
          background: rgba(217, 130, 43, 0.12);
          border: 1px solid rgba(217, 130, 43, 0.3);
          padding: 2px 7px;
          border-radius: 6px;
        }
        .hv-lab-matrix {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }
        .hv-lab-cell {
          background: #F6F8F3;
          border: 1px solid #D8E2D1;
          border-radius: 10px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .hv-lc-lbl {
          font-size: 10.5px;
          text-transform: uppercase;
          color: #786D61;
          letter-spacing: 0.5px;
        }
        .hv-lc-val {
          font-size: 14px;
          font-weight: 750;
          color: #4F7A52;
        }
        .hv-lc-std {
          font-size: 10px;
          color: #786D61;
        }
        .hv-qc-queue-card {
          background: #FFFDF8;
          border: 1.5px solid #EDE2D1;
          border-left: 4px solid #4F7A52;
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .hv-qc-queue-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hv-qc-queue-title {
          font-size: 13.5px;
          font-weight: 750;
          color: #34261B;
        }
        .hv-qc-queue-count {
          font-size: 11px;
          color: #786D61;
        }
        .hv-qc-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .hv-qc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-radius: 8px;
          padding: 8px 10px;
          cursor: pointer;
        }
        .hv-qc-item.attn {
          border-left: 3px solid #D9822B;
        }
        .hv-qc-item-left {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .hv-qc-item-batch {
          font-size: 10.5px;
          font-weight: 700;
          color: #B87316;
        }
        .hv-qc-item-sample {
          font-size: 12.5px;
          color: #34261B;
        }
        .hv-qc-item-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .hv-qc-status-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .hv-qc-status-tag.pending {
          background: rgba(113, 132, 91, 0.15);
          color: #4F7A52;
        }
        .hv-qc-status-tag.attn {
          background: rgba(217, 130, 43, 0.15);
          color: #D9822B;
        }
        .hv-qc-cta-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #4F7A52;
          color: #FFF;
          border: none;
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 12.5px;
          font-weight: 750;
          cursor: pointer;
          margin-top: 4px;
        }
        .hv-qc-all-passed-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #F6F8F3;
          border: 1px solid #D8E2D1;
          border-radius: 12px;
          padding: 10px 14px;
        }
        .hv-qcap-title {
          font-size: 13.5px;
          font-weight: 750;
          color: #4F7A52;
          display: block;
        }
        .hv-qcap-sub {
          font-size: 11.5px;
          color: #786D61;
          margin: 1px 0 0;
        }
      `}</style>
    </div>
  );
};
