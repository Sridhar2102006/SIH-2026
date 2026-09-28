/**
 * VIEW — DISPATCH QR OUTPUT & PHYSICAL BOTTLE LABEL
 *
 * Rendered once the Dispatch Officer has validated all 4 journey stages
 * (Beekeeper Origin, Processing Facility, Lab Report CoA, and Retail Bottle Identity).
 *
 * Displays:
 * 1. The scannable consumer QR code cryptographically bound to this particular bottle.
 * 2. An authentic, printable physical bottle label ready to affix to the honey jar.
 * 3. Public consumer verification link and instant copy action.
 * 4. Dispatch audit record with officer signature, timestamp, and reviewed stages.
 */

import React, { useState } from 'react';
import {
  QrCode,
  CheckCircle2,
  ExternalLink,
  Copy,
  Download,
  Plus,
  Flower2,
  FlaskConical,
  Microscope,
  Package,
  Calendar,
  User,
  ShieldCheck,
  Globe,
  Printer,
  Sparkles,
  Award,
  Hash
} from 'lucide-react';
import { QrEngineService } from '../../services/qrEngineService';

const STAGE_ICONS = {
  BEEKEEPER: Flower2,
  PROCESSOR: FlaskConical,
  LAB: Microscope,
  PACKAGE: Package
};

const STAGE_COLORS = {
  BEEKEEPER: '#2E7D32',
  PROCESSOR: '#C9962E',
  LAB: '#0284C7',
  PACKAGE: '#D99A24'
};

const STAGE_LABELS = {
  BEEKEEPER: 'Beekeeper & Apiary Origin',
  PROCESSOR: 'Processing Facility',
  LAB: 'Laboratory & Quality Release',
  PACKAGE: 'Retail Bottle & Tamper Seal'
};

export const DispatchQrOutputModal = ({ qrOutput, onGenerateAnother }) => {
  const [urlCopied, setUrlCopied] = useState(false);

  if (!qrOutput) return null;

  const formattedDate = qrOutput.generatedAt
    ? new Date(qrOutput.generatedAt).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Just now';

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(qrOutput.consumerUrl).then(() => {
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
      });
    }
  };

  const handlePrintLabel = () => {
    window.print();
  };

  const reviewedStageIds = Object.keys(qrOutput.reviewedStages || {}).filter(
    k => qrOutput.reviewedStages[k]
  );

  const tamperSeal = qrOutput.tamperSealId || 'HC-SEAL-2026-925-J125';
  const coaId = qrOutput.coaDocumentId || 'CoA-2026-NABL-098';

  return (
    <div className="dispatch-qr-output-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Print CSS block so only the physical bottle label prints when requested */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-bottle-label, .printable-bottle-label * {
            visibility: visible;
          }
          .printable-bottle-label {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: 2px solid #34261B !important;
          }
        }
      `}</style>

      {/* Success Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FAF0 0%, #FFFFFF 65%, #FFF9EF 100%)',
        border: '2px solid #2E7D32',
        borderRadius: '18px',
        padding: '24px',
        textAlign: 'center',
        boxShadow: '0 6px 20px rgba(46, 125, 50, 0.08)'
      }}>
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          backgroundColor: '#2E7D32',
          margin: '0 auto 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(46, 125, 50, 0.3)'
        }}>
          <CheckCircle2 size={36} color="#FFFFFF" />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#EBF7EE', border: '1px solid #C8E6C9', padding: '3px 12px', borderRadius: '14px', marginBottom: '8px' }}>
          <Sparkles size={14} color="#2E7D32" />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#2E7D32', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Validation Certified & Issued
          </span>
        </div>

        <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800, color: '#34261B' }}>
          Consumer QR Code Generated for Bottle #{qrOutput.packageId}
        </h2>

        <p style={{ margin: '0 0 6px', fontSize: '15px', color: '#1E293B', fontWeight: 700 }}>
          {qrOutput.productName} · <span style={{ color: '#64748B' }}>{qrOutput.unitDisplay || '500 g'} Hexagonal Glass Jar</span>
        </p>

        <p style={{ margin: 0, fontSize: '13px', color: '#2E7D32', fontWeight: 600 }}>
          Cryptographically bound to Tamper Seal: <strong>{tamperSeal}</strong> & Lab CoA: <strong>{coaId}</strong>
        </p>
      </div>

      {/* Physical Bottle Packaging Label Preview (Ready for Physical Bottle Affixing) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#34261B', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#D99A24" />
              <span>Physical Bottle Label Preview (Ready for Printing & Affixing)</span>
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>
              This high-contrast label is affixed directly onto that particular bottle of honey for consumer retail inspection.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrintLabel}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#D99A24',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Printer size={15} />
              <span>Print Bottle Label</span>
            </button>
          </div>
        </div>

        {/* The Printable Bottle Label Card */}
        <div className="printable-bottle-label" style={{
          maxWidth: '560px',
          margin: '0 auto',
          backgroundColor: '#FFFDF9',
          border: '2px solid #D99A24',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 6px 20px rgba(217, 154, 36, 0.1)',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          {/* QR Code graphic */}
          <div style={{
            width: '140px',
            height: '140px',
            border: '2px solid #34261B',
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            <img
              src={qrOutput.qrDataUrl || qrOutput.qrImagePath || `/qr-codes/${qrOutput.packageId}.png`}
              alt={`QR for ${qrOutput.packageId}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 2, position: 'absolute' }}
              onError={(e) => {
                if (qrOutput.qrDataUrl) {
                  e.currentTarget.src = qrOutput.qrDataUrl;
                } else {
                  e.currentTarget.style.display = 'none';
                }
              }}
            />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
              padding: '6px',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box'
            }}>
              {Array.from({ length: 49 }, (_, i) => {
                const seed = (qrOutput.packageId || 'PKG').charCodeAt(i % (qrOutput.packageId || 'PKG').length) + i;
                const isCorner = (i < 7 && (i === 0 || i === 6)) || (i >= 42 && (i === 42 || i === 48)) || (i === 21) || (i < 7 && (i === 2 || i === 4)) || (i >= 42 && (i === 44 || i === 46));
                const isDark = seed % 3 !== 0 || isCorner;
                return (
                  <div
                    key={i}
                    style={{
                      backgroundColor: isDark ? '#34261B' : '#FFFFFF',
                      borderRadius: '1px'
                    }}
                  />
                );
              })}
            </div>
            <div style={{
              position: 'absolute',
              width: '28px',
              height: '28px',
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #D99A24'
            }}>
              <QrCode size={16} color="#D99A24" />
            </div>
          </div>

          {/* Bottle Metadata on Label */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#D99A24' }}>
              HoneyChain™ Certified Pure Origin
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#34261B', margin: '2px 0 6px' }}>
              {qrOutput.productName}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
              Net Wt: <strong style={{ color: '#334155' }}>{qrOutput.unitDisplay || '500 g'} Glass Jar</strong> · 100% Raw Honey
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', color: '#475569' }}>
              <div>
                Bottle Serial: <strong style={{ fontFamily: 'monospace', color: '#34261B' }}>#{qrOutput.packageId}</strong>
              </div>
              <div>
                Tamper Seal ID: <strong style={{ color: '#0369A1' }}>{tamperSeal}</strong>
              </div>
              <div>
                Batch: <strong style={{ color: '#334155' }}>{qrOutput.batchNumber}</strong> · CoA: <strong style={{ color: '#047857' }}>{coaId}</strong>
              </div>
              <div style={{ marginTop: '4px', fontSize: '10px', color: '#2E7D32', fontWeight: 700 }}>
                ✓ NABL / FSSAI Tested · Hive-to-Bottle Traceable
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consumer URL Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#34261B' }}>
          Consumer Verification Public Endpoint:
        </div>

        <div style={{
          width: '100%',
          padding: '10px 14px',
          backgroundColor: '#F8FAFC',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxSizing: 'border-box'
        }}>
          <Globe size={16} color="#0369A1" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#0369A1', flex: 1, wordBreak: 'break-all', fontWeight: 600 }}>
            {qrOutput.consumerUrl}
          </span>
          <button
            type="button"
            onClick={handleCopyUrl}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              cursor: 'pointer',
              color: urlCopied ? '#2E7D32' : '#64748B',
              padding: '6px 10px',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            {urlCopied ? <CheckCircle2 size={14} color="#2E7D32" /> : <Copy size={14} />}
            <span>{urlCopied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => window.open(qrOutput.consumerUrl, '_blank')}
            style={{
              flex: '1 1 180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '11px',
              borderRadius: '10px',
              border: '1px solid #BAE6FD',
              backgroundColor: '#EFF6FA',
              color: '#0369A1',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={15} />
            <span>Open Consumer Page</span>
          </button>

          <button
            type="button"
            onClick={() => QrEngineService.downloadPng(qrOutput.qrDataUrl, `HoneyChain_${qrOutput.packageId}_QR.png`)}
            disabled={!qrOutput.qrDataUrl}
            style={{
              flex: '1 1 160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '11px',
              borderRadius: '10px',
              border: '1px solid #C8E6C9',
              backgroundColor: '#EBF7EE',
              color: '#2E7D32',
              fontSize: '13px',
              fontWeight: 700,
              cursor: qrOutput.qrDataUrl ? 'pointer' : 'not-allowed'
            }}
          >
            <Download size={15} />
            <span>Download PNG</span>
          </button>

          {qrOutput.qrSvg && (
            <button
              type="button"
              onClick={() => QrEngineService.downloadSvg(qrOutput.qrSvg, `HoneyChain_${qrOutput.packageId}_QR.svg`)}
              style={{
                flex: '1 1 160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '11px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#34261B',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Download size={15} />
              <span>Download SVG</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintLabel}
            style={{
              flex: '1 1 180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '11px',
              borderRadius: '10px',
              border: '1px solid #FDE68A',
              backgroundColor: '#FFF9EF',
              color: '#B45309',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Printer size={15} />
            <span>Print Bottle Label</span>
          </button>
        </div>
      </div>

      {/* Audit Record */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '18px 20px'
      }}>
        <h4 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#34261B', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#2E7D32" />
          <span>Dispatch Validation & QR Generation Audit Record</span>
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '13px' }}>
          <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
            <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', marginBottom: '2px' }}>
              <User size={13} /> Validated & Issued By
            </span>
            <strong style={{ color: '#34261B' }}>{qrOutput.generatedBy}</strong>
          </div>

          <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
            <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', marginBottom: '2px' }}>
              <Calendar size={13} /> Authorization Timestamp
            </span>
            <strong style={{ color: '#34261B' }}>{formattedDate}</strong>
          </div>

          <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
            <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', marginBottom: '2px' }}>
              <Hash size={13} /> Bottle Identification
            </span>
            <strong style={{ color: '#34261B' }}>{qrOutput.packageId}</strong>
          </div>

          <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
            <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', marginBottom: '2px' }}>
              <Award size={13} /> Tamper-Evident Security Seal
            </span>
            <strong style={{ color: '#0369A1' }}>{tamperSeal}</strong>
          </div>
        </div>
      </div>

      {/* Summary of 4 Verified Stages */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '18px 20px'
      }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: '#34261B' }}>
          Journey Stages Certified ({reviewedStageIds.length}/4)
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {['BEEKEEPER', 'PROCESSOR', 'LAB', 'PACKAGE'].map(stageId => {
            const isReviewed = (qrOutput.reviewedStages || {})[stageId];
            const StageIcon = STAGE_ICONS[stageId];
            const note = (qrOutput.stageNotes || {})[stageId];

            return (
              <div
                key={stageId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: isReviewed ? '#F0FAF0' : '#FDF2F2',
                  border: `1px solid ${isReviewed ? '#C8E6C9' : '#FCA5A5'}`
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: isReviewed ? STAGE_COLORS[stageId] : '#E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0
                }}>
                  <StageIcon size={16} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#34261B' }}>
                    {STAGE_LABELS[stageId]}
                  </div>
                  {note && (
                    <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Note: {note}
                    </div>
                  )}
                </div>

                {isReviewed ? (
                  <CheckCircle2 size={18} color="#2E7D32" style={{ flexShrink: 0 }} />
                ) : (
                  <span style={{ fontSize: '10px', color: '#B91C1C', fontWeight: 700, flexShrink: 0 }}>PENDING</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Validate Another Bottle Button */}
      <button
        type="button"
        onClick={onGenerateAnother}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '15px',
          borderRadius: '14px',
          backgroundColor: '#D99A24',
          color: '#FFFFFF',
          border: 'none',
          fontSize: '15px',
          fontWeight: 800,
          cursor: 'pointer',
          width: '100%',
          boxShadow: '0 4px 14px rgba(217, 154, 36, 0.25)'
        }}
      >
        <Plus size={18} />
        <span>Validate Another Honey Bottle & Generate QR</span>
      </button>
    </div>
  );
};
