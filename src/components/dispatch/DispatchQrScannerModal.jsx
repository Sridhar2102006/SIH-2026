/**
 * MODAL — FINAL PHYSICAL DISPATCH QR SCANNER
 *
 * Enforces exactly three sequential checks, each shown as a labelled row:
 *   Check 1 — QR Can Be Scanned      (payload structure is readable)
 *   Check 2 — QR Is Authenticated    (resolves to known, non-revoked, unambiguous package)
 *   Check 3 — Package Authorized     (status ready, quality approved, not re-dispatched)
 *
 * Answers: "Does the QR physically present on this package resolve to the exact
 * package/product record being dispatched?" NOT "Is the honey scientifically safe?"
 *
 * Prevents accidental duplicate scans with state locking.
 * Never displays generic "QR verified" — explicit check states only.
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  X,
  Camera,
  ShieldCheck,
  Package,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import {
  QR_VALIDATION_STATES,
  QR_STATE_DETAILS
} from '../../services/dispatchDomainService';

// ── Three-Check Tier Mapping ─────────────────────────────────────────────────
const FAILING_CHECK = {
  [QR_VALIDATION_STATES.INVALID]:               1,
  [QR_VALIDATION_STATES.NOT_FOUND]:             2,
  [QR_VALIDATION_STATES.REVOKED]:               2,
  [QR_VALIDATION_STATES.EXPIRED]:               2,
  [QR_VALIDATION_STATES.TRACEABILITY_MISMATCH]: 2,
  [QR_VALIDATION_STATES.DUPLICATE_SCAN]:        2,
  [QR_VALIDATION_STATES.ALREADY_DISPATCHED]:    3,
  [QR_VALIDATION_STATES.ALREADY_DELIVERED]:     3,
  [QR_VALIDATION_STATES.PACKAGE_NOT_READY]:     3,
  [QR_VALIDATION_STATES.QUALITY_NOT_FINALIZED]: 3,
};

const CHECK_DEFS = [
  {
    index: 1,
    icon: Camera,
    title: 'QR Can Be Scanned',
    passLabel: 'Payload decoded — structure is readable and conforms to protocol',
    pendingLabel: 'Awaiting scan input…',
  },
  {
    index: 2,
    icon: ShieldCheck,
    title: 'QR Is Authenticated',
    passLabel: 'Identity confirmed — registered package, not revoked, unambiguous match',
    pendingLabel: 'Awaiting Check 1…',
  },
  {
    index: 3,
    icon: Package,
    title: 'Package Authorized for Dispatch',
    passLabel: 'Status ready, quality lot-released, not previously dispatched',
    pendingLabel: 'Awaiting Check 2…',
  },
];

function deriveStatuses(scanResult) {
  if (!scanResult) return { 1: 'pending', 2: 'pending', 3: 'pending' };
  if (scanResult.isValid) return { 1: 'pass', 2: 'pass', 3: 'pass' };
  const failAt = FAILING_CHECK[scanResult.state] || 1;
  const out = {};
  for (let i = 1; i <= 3; i++) {
    out[i] = i < failAt ? 'pass' : i === failAt ? 'fail' : 'pending';
  }
  return out;
}

// ── Single Check Row ─────────────────────────────────────────────────────────
function CheckRow({ check, status, failReason }) {
  const Icon = check.icon;
  const isPass = status === 'pass';
  const isFail = status === 'fail';
  const isPending = status === 'pending';

  const tokenColor = isPass ? '#2E7D32' : isFail ? '#B91C1C' : '#94A3B8';
  const bg = isPass ? '#F5FBF6' : isFail ? '#FFF5F5' : '#FAFAFA';
  const border = isPass ? '#C8E6C9' : isFail ? '#FECACA' : '#E2E8F0';
  const circleBg = isPass ? '#EBF7EE' : isFail ? '#FDF2F2' : '#F1F5F9';
  const circleBorder = isPass ? '#4CAF50' : isFail ? '#EF4444' : '#CBD5E1';

  const bodyText = isPass
    ? check.passLabel
    : isFail
    ? (failReason || 'Validation failed at this check.')
    : check.pendingLabel;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${border}`, backgroundColor: bg, transition: 'all 0.25s ease', opacity: isPending ? 0.5 : 1 }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: circleBg, border: `2px solid ${circleBorder}`, color: tokenColor, transition: 'all 0.25s ease' }}>
        {isPass ? <CheckCircle2 size={17} /> : isFail ? <AlertTriangle size={17} /> : <Icon size={15} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: tokenColor }}>
            Check {check.index}
          </span>
          {(isPass || isFail) && (
            <span style={{ fontSize: '10px', backgroundColor: isPass ? '#C8E6C9' : '#FECACA', color: tokenColor, borderRadius: '4px', padding: '1px 5px', fontWeight: 700 }}>
              {isPass ? 'PASS' : 'FAIL'}
            </span>
          )}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: isPending ? '#94A3B8' : '#34261B' }}>
          {check.title}
        </div>
        <div style={{ fontSize: '11.5px', color: isPass ? '#4CAF50' : isFail ? '#B91C1C' : '#94A3B8', marginTop: '2px', lineHeight: '1.4' }}>
          {bodyText}
        </div>
      </div>
    </div>
  );
}

// ── Main Modal ───────────────────────────────────────────────────────────────
export const DispatchQrScannerModal = ({
  isOpen = false,
  onClose,
  targetPackageId = null,
  activeShipmentId = null,
  onValidationSuccess
}) => {
  const { validatePackageQr, showToast } = useAppState();

  const [scannedInput, setScannedInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const handleExecuteScan = (payloadToScan) => {
    const payload = payloadToScan || scannedInput;
    if (!payload || !payload.trim()) {
      showToast('Please enter or select a package QR code.');
      return;
    }
    const res = validatePackageQr({ scannedPayload: payload.trim(), targetPackageId, activeShipmentId });
    setScanResult(res);
    setIsLocked(true);
    if (res.isValid && onValidationSuccess) onValidationSuccess(res.package);
  };

  const handleResetScan = () => {
    setScannedInput('');
    setScanResult(null);
    setIsLocked(false);
  };

  const checkStatuses = deriveStatuses(scanResult);
  const stateInfo = scanResult ? QR_STATE_DETAILS[scanResult.state] : null;
  const allPassed = scanResult?.isValid === true;
  const failingCheckNo = scanResult && !scanResult.isValid ? (FAILING_CHECK[scanResult.state] || 1) : null;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(52, 38, 27, 0.25)',
          border: '1px solid #CBD5E1',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', backgroundColor: '#FFF9EF', borderBottom: '1px solid #E2D9CC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#7AA7C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
              <QrCode size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#34261B' }}>
                Final Physical QR Validation
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748B' }}>
                {targetPackageId ? `Verifying target: ${targetPackageId}` : '3-check validation before shipment release'}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" data-test="close-dispatch-scanner" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Target banner */}
          {targetPackageId && (
            <div style={{ padding: '9px 13px', backgroundColor: '#F0F6FA', borderRadius: '8px', border: '1px solid #BAE6FD', fontSize: '12.5px', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={15} />
              <span>Preparing: <strong>{targetPackageId}</strong>{activeShipmentId ? ` for Shipment ${activeShipmentId}` : ''}</span>
            </div>
          )}

          {/* Camera viewfinder */}
          <div style={{ position: 'relative', height: '148px', backgroundColor: '#1E293B', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)' }}>
            <div style={{ width: '96px', height: '96px', border: isLocked ? (allPassed ? '3px solid #4ADE80' : '3px solid #F87171') : '2px dashed #7AA7C7', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
              {isLocked ? (
                allPassed ? <CheckCircle2 size={40} color="#4ADE80" /> : <AlertTriangle size={40} color="#F87171" />
              ) : (
                <>
                  <Camera size={28} color="#94A3B8" />
                  <div style={{ position: 'absolute', left: '22%', right: '22%', height: '2px', backgroundColor: '#D99A24', boxShadow: '0 0 8px #D99A24', top: '50%' }} />
                </>
              )}
            </div>
            <span style={{ marginTop: '8px', fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
              {isLocked
                ? (allPassed ? 'All 3 checks passed — package authenticated' : `Failed at Check ${failingCheckNo}`)
                : 'Point camera at physical label QR'}
            </span>
          </div>

          {/* Three-check rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {CHECK_DEFS.map((check, idx) => (
              <React.Fragment key={check.index}>
                <CheckRow
                  check={check}
                  status={checkStatuses[check.index]}
                  failReason={checkStatuses[check.index] === 'fail' && scanResult ? scanResult.reason : null}
                />
                {idx < CHECK_DEFS.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.3 }}>
                    <ChevronRight size={13} color="#64748B" style={{ transform: 'rotate(90deg)' }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Overall result banner */}
          {scanResult && stateInfo && (
            <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: stateInfo.bg, border: `1px solid ${stateInfo.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: scanResult.package ? '10px' : 0 }}>
                {allPassed ? <CheckCircle2 size={17} color={stateInfo.color} /> : <AlertTriangle size={17} color={stateInfo.color} />}
                <span style={{ fontSize: '13px', fontWeight: 700, color: stateInfo.color }}>{stateInfo.label}</span>
              </div>
              {scanResult.package && (
                <div style={{ padding: '10px 12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                  <div><span style={{ color: '#64748B' }}>Package ID: </span><strong style={{ color: '#34261B' }}>{scanResult.package.packageId}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Product: </span><strong>{scanResult.package.productName}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Size: </span><span>{scanResult.package.unitDisplay}</span></div>
                  <div><span style={{ color: '#64748B' }}>Batch: </span><strong style={{ color: '#4D7EA8' }}>{scanResult.package.batchNumber}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Quality: </span><strong style={{ color: scanResult.package.qualityStatus === 'APPROVED' ? '#2E7D32' : '#B91C1C' }}>{scanResult.package.qualityStatus || 'PENDING'}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Tamper Seal: </span><span style={{ fontSize: '11px' }}>{scanResult.package.tamperSealId}</span></div>
                </div>
              )}
            </div>
          )}

          {/* Scan input + simulate (only when unlocked) */}
          {!isLocked && (
            <>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Type / paste QR payload or Package ID…"
                  value={scannedInput}
                  onChange={(e) => setScannedInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteScan(); }}
                  style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
                <button type="button" className="btn btn-primary btn-sm" onClick={() => handleExecuteScan()} style={{ backgroundColor: '#D99A24', borderColor: '#D99A24', whiteSpace: 'nowrap' }}>
                  Validate
                </button>
              </div>
              <div>
                <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Simulate Physical Scans:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {[
                    { label: 'PKG-00125 (All Pass)', id: 'PKG-2026-00125', style: {} },
                    { label: 'PKG-00126 (All Pass)', id: 'PKG-2026-00126', style: {} },
                    { label: 'PKG-00118 (Check 2 — Mismatch)', id: 'PKG-2026-00118', style: { borderColor: '#F59E0B', color: '#B45309' } },
                    { label: 'PKG-00112 (Check 2 — Revoked)', id: 'PKG-2026-00112', style: { borderColor: '#EF4444', color: '#B91C1C' } },
                    { label: 'PKG-00109 (Check 3 — Quality)', id: 'PKG-2026-00109', style: { borderColor: '#EF4444', color: '#B91C1C' } },
                  ].map(({ label, id, style }) => (
                    <button key={id} type="button" className="btn btn-secondary btn-sm" onClick={() => { setScannedInput(id); handleExecuteScan(id); }} style={{ fontSize: '11px', padding: '4px 8px', ...style }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Post-scan action buttons */}
          {isLocked && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetScan} style={{ flex: 1, fontSize: '12px' }}>
                <RefreshCw size={13} style={{ marginRight: '5px' }} />
                <span>Scan Next Package</span>
              </button>
              {allPassed && (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => { showToast(`Package ${scanResult.package?.packageId} confirmed for dispatch`); onClose(); }} style={{ flex: 1, fontSize: '12px', backgroundColor: '#2E7D32', borderColor: '#2E7D32' }}>
                  <CheckCircle2 size={13} style={{ marginRight: '5px' }} />
                  <span>Confirm &amp; Done</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatchQrScannerModal;
