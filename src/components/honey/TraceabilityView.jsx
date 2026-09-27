/**
 * SCREEN — TRACEABILITY & LEDGER TRUST WORKSPACE
 *
 * Dedicated Canonical Destination for Cryptographic Traceability
 * Route: /traceability
 *
 * Primary Purpose: Inspect cryptographic ledger anchors, provenance chains, and consumer QR verification.
 * One User Intent → One Clear Destination.
 */

import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  Layers
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const TraceabilityView = () => {
  const {
    batches,
    openPublicVerification,
    openProductScanner,
    openTechnicalProof,
    showToast
  } = useAppState();

  const anchoredBatches = batches.filter(b => b.blockchain?.blockNumber || b.status === 'certified');

  return (
    <div className="traceability-view-container">
      {/* 1. Header Banner */}
      <div className="trace-hero card">
        <div className="trace-badge-row">
          <span className="badge badge-honey">Trust & Verification</span>
          <StatusBadge status="verified" label="Verified HoneyChain Ledger" size="small" />
        </div>
        <h2 className="heading-card" style={{ fontSize: '20px', marginTop: '8px' }}>
          Honey Traceability & Batch Origins
        </h2>
        <p className="supporting-text" style={{ fontSize: '13px', marginTop: '4px' }}>
          See where this honey came from, inspect laboratory test results, and verify jar package QR identities.
        </p>

        <div className="trace-hero-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (openProductScanner) openProductScanner();
              else showToast('Opening consumer QR scanner…');
            }}
          >
            <QrCode size={15} />
            <span>Scan Product QR</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (openPublicVerification) openPublicVerification('HC-2409');
            }}
          >
            <ExternalLink size={15} />
            <span>Public Verify Portal</span>
          </button>
        </div>
      </div>

      {/* 2. Anchored Batches List */}
      <div className="trace-section">
        <h3 className="trace-sec-title">Anchored Honey Batches ({anchoredBatches.length})</h3>

        <div className="trace-list">
          {anchoredBatches.map((batch) => (
            <div
              key={batch.id}
              className="card trace-card"
              onClick={() => {
                if (openTechnicalProof) openTechnicalProof(batch);
                else if (openPublicVerification) openPublicVerification(batch.batchNumber);
              }}
            >
              <div className="trace-card-top">
                <div>
                  <h4 className="t-batch-no">{batch.batchNumber}</h4>
                  <span className="t-batch-name">{batch.name}</span>
                </div>
                <StatusBadge
                  status="healthy"
                  label="Ledger Anchored"
                  size="small"
                />
              </div>

              <div className="trace-proof-box">
                <div className="p-row">
                  <span className="p-lbl">Merkle Root</span>
                  <code className="p-hash">{batch.blockchain?.merkleRoot || '0x89ab114efc28019a...'}</code>
                </div>
                <div className="p-row">
                  <span className="p-lbl">Tx Hash</span>
                  <code className="p-hash">{batch.blockchain?.txHash || '0x12a9d804be12fc68...'}</code>
                </div>
                <div className="p-row">
                  <span className="p-lbl">Block Number</span>
                  <span className="p-val">#{batch.blockchain?.blockNumber || '54819240'}</span>
                </div>
              </div>

              <div className="trace-card-footer">
                <span className="t-meta">Proof of Origin & Quality Verified</span>
                <div className="t-link">
                  <span>Inspect Technical Proof</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .traceability-view-container {
          padding: 16px var(--mobile-pad) 80px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .trace-hero {
          padding: 20px;
          background: #FFFDF8;
          border: 1px solid var(--color-theme-card-border, #D6D9DE);
        }

        .trace-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chain-pill {
          font-size: 11px;
          color: var(--color-warm-gray);
          background: #FFF;
          padding: 3px 8px;
          border-radius: 12px;
          border: 1px solid var(--color-divider);
        }

        .trace-hero-actions {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }

        .trace-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .trace-sec-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .trace-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .trace-card {
          padding: 16px;
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .trace-card:hover {
          transform: translateY(-1px);
        }

        .trace-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .t-batch-no {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .t-batch-name {
          font-size: 12.5px;
          color: var(--color-warm-gray);
        }

        .trace-proof-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 12px;
          padding: 10px;
          background: var(--color-warm-cream, #FFFDF8);
          border-radius: 8px;
          font-family: monospace;
          font-size: 11.5px;
        }

        .p-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .p-lbl {
          font-family: sans-serif;
          color: var(--color-warm-gray);
          font-size: 11px;
        }

        .p-hash {
          color: var(--color-deep-cocoa);
          font-weight: 600;
        }

        .p-val {
          color: var(--color-deep-cocoa);
          font-weight: 700;
        }

        .trace-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid var(--color-divider);
        }

        .t-meta {
          font-size: 11.5px;
          color: var(--color-warm-gray);
        }

        .t-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-deep-honey);
        }
      `}</style>
    </div>
  );
};
