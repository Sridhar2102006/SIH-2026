import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { StatusBadge } from '../common/StatusBadge';
import { TechnicalDetails } from '../common/TechnicalDetails';
import {
  ArrowLeft,
  ShieldCheck,
  QrCode,
  Package,
  Droplet,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  FileCheck,
  ChevronRight
} from 'lucide-react';

export const BatchDetail = ({ batchId, onBack }) => {
  const { batches, openSheet, openCollectionDetails, openQualityCheck, openBatchJourney, openProductQrManagement, openProductPackaging } = useAppState();
  const batch = batches.find((b) => b.id === batchId) || batches[0];
  const [activeTab, setActiveTab] = useState('journey'); // 'journey' | 'quality' | 'collection'

  return (
    <div className="batch-detail-view">
      {/* Back button */}
      <button className="back-nav-btn" onClick={onBack}>
        <ArrowLeft size={16} />
        <span>All Batches</span>
      </button>

      {/* Main Header */}
      <div className="batch-detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="batch-number-badge">{batch.batchNumber}</span>
          <StatusBadge
            status={batch.status === 'certified' ? 'healthy' : batch.status === 'bottled' ? 'honey' : 'sage'}
            label={batch.statusLabel}
          />
        </div>
        <h2 className="title-large" style={{ marginTop: '8px', fontSize: '24px' }}>{batch.name}</h2>
        <p className="supporting-text">Harvested on {batch.harvestDate} • {batch.weightKg} kg net yield</p>
      </div>

      {/* Verification & Consumer QR Button */}
      <div className="card qr-cta-card">
        <div className="qr-cta-left">
          <ShieldCheck size={24} color="var(--color-healthy)" />
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Origin Verification Certificate</h4>
            <p className="supporting-text" style={{ fontSize: '12px' }}>
              Cryptographically signed with tamper-evident seal
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary qr-btn"
            onClick={() => openProductPackaging({ batchId: batch.id })}
            title="Prepare product packaging and traceability label"
          >
            <Package size={15} />
            <span>Packaging</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary qr-btn"
            onClick={() => openProductQrManagement({ batchId: batch.id })}
            title="Manage product QR code"
          >
            <QrCode size={15} />
            <span>QR</span>
          </button>
          <button
            type="button"
            className="btn btn-primary qr-btn"
            onClick={() => openSheet('verify-batch', { batch })}
            title="Review verification record"
          >
            <ShieldCheck size={15} />
            <span>Verify</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="segmented-control" style={{ marginTop: '16px' }}>
        <button
          className={`segment-btn ${activeTab === 'journey' ? 'active' : ''}`}
          onClick={() => setActiveTab('journey')}
        >
          Provenance Journey
        </button>
        <button
          className={`segment-btn ${activeTab === 'quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality')}
        >
          Quality & Purity
        </button>
        <button
          className={`segment-btn ${activeTab === 'collection' ? 'active' : ''}`}
          onClick={() => setActiveTab('collection')}
        >
          Collection
        </button>
      </div>

      {activeTab === 'journey' && (
        <div className="journey-timeline">
          <div className="card" style={{ marginBottom: '14px', background: '#FFFDF8', border: '1px solid #EDE2D1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
            <div>
              <strong style={{ fontSize: '13.5px', color: '#34261B', display: 'block' }}>Traceable Batch Journey</strong>
              <span style={{ fontSize: '11.5px', color: '#786D61' }}>Follow from source hive to certified verification</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '12px', height: '32px', padding: '0 10px', gap: '4px' }}
              onClick={() => openBatchJourney && openBatchJourney({ batchId: batch.id })}
            >
              <span>Full journey</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {batch.journey.map((step, idx) => (
            <div key={idx} className="timeline-node">
              <div className="node-marker">
                <CheckCircle2 size={16} color="var(--color-primary-honey)" />
                {idx < batch.journey.length - 1 && <div className="node-line" />}
              </div>
              <div className="node-content card">
                <div className="node-header">
                  <span className="micro-text" style={{ color: 'var(--color-deep-honey)' }}>
                    {step.stage}
                  </span>
                  <span className="supporting-text" style={{ fontSize: '11px' }}>
                    {step.date}
                  </span>
                </div>
                <h4 className="heading-card" style={{ fontSize: '15px', marginTop: '2px' }}>
                  {step.title}
                </h4>
                <p className="supporting-text" style={{ margin: '4px 0 6px', fontSize: '12.5px' }}>
                  <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {step.location}
                </p>
                <p className="body-text" style={{ fontSize: '13px' }}>
                  {step.details}
                </p>
                <span className="supporting-text" style={{ fontSize: '11px', display: 'block', marginTop: '6px' }}>
                  Verified by: <strong>{step.handler}</strong>
                </span>

                {step.stage === 'Apiary Harvest' && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '8px', fontSize: '11.5px', gap: '4px' }}
                    onClick={() => {
                      if (openCollectionDetails) {
                        openCollectionDetails({ collectionId: batch.collectionId || 'col-2026-0925-01' });
                      }
                    }}
                  >
                    <span>View harvest collection record</span>
                    <ChevronRight size={13} />
                  </button>
                )}

                {(step.stage === 'Purity & Lab Testing' || step.stage.toLowerCase().includes('quality')) && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '8px', fontSize: '11.5px', gap: '4px' }}
                    onClick={() => {
                      if (openQualityCheck) {
                        openQualityCheck({ batchId: batch.id });
                      }
                    }}
                  >
                    <FileCheck size={13} />
                    <span>View quality check record</span>
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Progressive Disclosure: Blockchain Cryptographic Proof */}
          <TechnicalDetails
            title="Cryptographic Ledger Proof (HoneyChain)"
            icon="blockchain"
            items={[
              { label: 'Blockchain Network', value: batch.blockchain.network },
              { label: 'Block Number', value: batch.blockchain.blockNumber ? `#${batch.blockchain.blockNumber}` : 'Draft Block' },
              { label: 'Anchor Timestamp', value: batch.blockchain.blockTime },
              { label: 'Transaction Hash', value: batch.blockchain.txHash },
              { label: 'Batch Merkle Root', value: batch.blockchain.merkleRoot },
              { label: 'Seal Hash', value: batch.sealHash },
              { label: 'Explorer Verification', value: batch.blockchain.verificationUrl }
            ]}
          />
        </div>
      )}

      {activeTab === 'quality' && (
        <div className="quality-view">
          <div className="card quality-overview-card">
            <span className="micro-text">Certified Purity Test</span>
            <div className="moisture-callout">
              <div className="moisture-number">{batch.moisture}%</div>
              <div>
                <strong style={{ fontSize: '14px', display: 'block', color: 'var(--color-healthy)' }}>
                  Moisture Pass (Optimal)
                </strong>
                <span className="supporting-text">Standard requirement is below 18.5%</span>
              </div>
            </div>

            <div className="divider" />

            <div className="quality-specs-grid">
              <div className="spec-item">
                <span className="supporting-text">HMF Level</span>
                <span className="spec-value">{batch.hmfLevel}</span>
                <span className="micro-text" style={{ color: 'var(--color-healthy)' }}>Raw Standard Passed</span>
              </div>
              <div className="spec-item">
                <span className="supporting-text">Diastase Activity</span>
                <span className="spec-value">{batch.diastase}</span>
                <span className="micro-text" style={{ color: 'var(--color-healthy)' }}>Active Enzymes</span>
              </div>
            </div>

            <div className="divider" />

            <div>
              <span className="supporting-text" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Pollen & Botanical Origin Analysis:
              </span>
              <p className="body-text" style={{ fontSize: '13.5px' }}>{batch.pollenAnalysis}</p>
            </div>

            <div style={{ marginTop: '14px', borderTop: '1px solid var(--color-card-border)', paddingTop: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-block"
                style={{ fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => {
                  if (openQualityCheck) {
                    openQualityCheck({ batchId: batch.id });
                  }
                }}
              >
                <FileCheck size={16} />
                <span>Open quality check workflow</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'collection' && (
        <div className="collection-view">
          <div className="card">
            <span className="micro-text">Extraction & Processing Log</span>
            <div style={{ marginTop: '10px' }}>
              <div className="detail-row">
                <span className="supporting-text">Source Apiary:</span>
                <span className="detail-val">Meadowbrook Apiary, South Ridge</span>
              </div>
              <div className="detail-row">
                <span className="supporting-text">Source Colonies:</span>
                <span className="detail-val">{batch.sourceHives.join(', ')}</span>
              </div>
              <div className="detail-row">
                <span className="supporting-text">Net Extracted Weight:</span>
                <span className="detail-val">{batch.weightKg} kg</span>
              </div>
              <div className="detail-row">
                <span className="supporting-text">Target Jar Packaging:</span>
                <span className="detail-val">{batch.lotJarsCount} units ({batch.jarVolume})</span>
              </div>
              <div className="detail-row">
                <span className="supporting-text">Processing Method:</span>
                <span className="detail-val">Cold-centrifugal, unheated, unpasteurized</span>
              </div>
              <div className="detail-row">
                <span className="supporting-text">Filter Specification:</span>
                <span className="detail-val">Dual 300 µm stainless food-grade mesh</span>
              </div>
            </div>

            <div style={{ marginTop: '14px', borderTop: '1px solid var(--color-card-border)', paddingTop: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-block"
                style={{ fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => {
                  if (openCollectionDetails) {
                    openCollectionDetails({ collectionId: batch.collectionId || 'col-2026-0925-01' });
                  }
                }}
              >
                <span>View full harvest collection record</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .batch-detail-view {
          padding: 16px var(--mobile-pad) 28px;
        }

        .back-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-warm-gray);
          cursor: pointer;
          margin-bottom: var(--space-12);
        }

        .batch-number-badge {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-deep-honey);
          background-color: var(--color-primary-honey-tint);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .qr-cta-card {
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #FAF4E9;
          border: 1px solid var(--color-card-border);
          padding: 14px 16px;
        }

        .qr-cta-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .qr-btn {
          min-height: 38px;
          padding: 6px 12px;
          font-size: 13px;
          gap: 6px;
        }

        .segmented-control {
          display: flex;
          background-color: #EFE4D3;
          padding: 4px;
          border-radius: 12px;
          margin-bottom: var(--space-16);
        }

        .segment-btn {
          flex: 1;
          padding: 8px 10px;
          border: none;
          background: none;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-warm-gray);
          border-radius: 9px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .segment-btn.active {
          background-color: var(--color-soft-ivory);
          color: var(--color-deep-cocoa);
          box-shadow: 0 1px 4px rgba(52, 38, 27, 0.08);
        }

        .journey-timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .timeline-node {
          display: flex;
          gap: 12px;
          position: relative;
        }

        .node-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 20px;
          padding-top: 12px;
        }

        .node-line {
          width: 2px;
          flex: 1;
          background-color: var(--color-divider);
          margin-top: 6px;
        }

        .node-content {
          flex: 1;
          padding: 12px 14px;
        }

        .node-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .moisture-callout {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 8px;
        }

        .moisture-number {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          line-height: 1;
        }

        .quality-specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .spec-value {
          font-size: 17px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--color-divider);
          font-size: 13.5px;
        }

        .detail-val {
          font-weight: 600;
          color: var(--color-deep-cocoa);
          text-align: right;
        }
      `}</style>
    </div>
  );
};
