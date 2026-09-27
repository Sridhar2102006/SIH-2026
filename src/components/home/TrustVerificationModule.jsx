import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const TrustVerificationModule = ({
  batches = [],
  canVerify = false,
  canViewProof = false,
  onOpenVerification,
  onOpenProof,
  onOpenPublicVerification
}) => {
  const verifiedBatches = batches.filter(b => b.verification?.isVerified || b.status === 'certified');
  const readyToVerify = batches.filter(b => b.status === 'certified' && !b.verification?.isVerified);
  const targetBatch = readyToVerify[0] || verifiedBatches[0] || batches[0];

  return (
    <div className="hv-section">
      <div className="hv-sec-head">
        <div className="hv-sec-title-wrap">
          <span className="hv-sec-title">Verified Records & Sealing</span>
          <span className="hv-sec-tagline">Permanent batch records and public consumer transparency</span>
        </div>
      </div>

      {/* Verification Status Card */}
      {readyToVerify.length > 0 ? (
        <div className="hv-trust-card ready">
          <div className="hv-tc-header">
            <span className="hv-tc-badge ready">Ready to Seal</span>
            <span className="hv-tc-lot">{readyToVerify[0].batchNumber || 'Batch HC-2409'}</span>
          </div>

          <strong className="hv-tc-title">{readyToVerify[0].name}</strong>
          <p className="hv-tc-desc">
            All laboratory tests passed. Ready for final verification and record sealing.
          </p>

          <div className="hv-tc-footer">
            {canVerify ? (
              <button
                className="hv-tc-cta-btn"
                onClick={() => onOpenVerification && onOpenVerification(readyToVerify[0])}
              >
                <CheckCircle2 size={15} />
                <span>Verify & Seal Batch</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <span className="hv-tc-observer-note">
                <Lock size={13} /> Quality supervisor authority required to seal this batch record.
              </span>
            )}
          </div>
        </div>
      ) : targetBatch?.verification?.isVerified ? (
        <div className="hv-trust-card sealed">
          <div className="hv-tc-header">
            <span className="hv-tc-badge sealed">
              <CheckCircle2 size={12} /> Verified & Sealed
            </span>
            <span className="hv-tc-lot">{targetBatch.batchNumber}</span>
          </div>

          <strong className="hv-tc-title">{targetBatch.name}</strong>
          <p className="hv-tc-desc">
            Harvest-to-jar chain of custody is permanently recorded and secured.
          </p>

          <div className="hv-tc-proof-row">
            <button
              className="hv-tc-proof-btn"
              onClick={() => onOpenProof && onOpenProof(targetBatch)}
            >
              <Lock size={13} color="#4F7A52" />
              <span>Technical Proof</span>
            </button>
            <button
              className="hv-tc-public-btn"
              onClick={() => onOpenPublicVerification && onOpenPublicVerification(targetBatch.displayId || targetBatch.id)}
            >
              <span>Public Consumer View</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div className="hv-empty-box">
          <p className="hv-empty-title">No batches waiting to be sealed</p>
          <p className="hv-empty-sub">Once batches pass laboratory testing, they appear here to be verified and sealed.</p>
        </div>
      )}

      <style>{`
        .hv-trust-card {
          background: #FFFDF8;
          border: 1.5px solid #EDE2D1;
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .hv-trust-card.ready {
          border-left: 4px solid #D99A24;
        }
        .hv-trust-card.sealed {
          border-left: 4px solid #4F7A52;
          background: #F8FAF6;
        }
        .hv-tc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hv-tc-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 750;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .hv-tc-badge.ready {
          background: rgba(217, 154, 36, 0.15);
          color: #B87316;
        }
        .hv-tc-badge.sealed {
          background: rgba(79, 122, 82, 0.15);
          color: #4F7A52;
        }
        .hv-tc-lot {
          font-size: 11px;
          font-weight: 700;
          color: #786D61;
        }
        .hv-tc-title {
          font-size: 14.5px;
          font-weight: 750;
          color: #34261B;
        }
        .hv-tc-desc {
          font-size: 12.5px;
          color: #786D61;
          margin: 0;
          line-height: 1.4;
        }
        .hv-tc-footer {
          margin-top: 4px;
        }
        .hv-tc-cta-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #2B5E3B;
          color: #FFF;
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 750;
          cursor: pointer;
        }
        .hv-tc-observer-note {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #786D61;
          font-style: italic;
        }
        .hv-tc-proof-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }
        .hv-tc-proof-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #FFFDF8;
          border: 1px solid #D8E2D1;
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 700;
          color: #4F7A52;
          cursor: pointer;
        }
        .hv-tc-public-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 700;
          color: #34261B;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
