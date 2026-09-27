import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  X,
  Zap,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  Keyboard,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { publicVerificationService } from '../../data/publicVerificationService';

/**
 * Screen 29 — QR / Product Verification Scanner
 * 
 * Connects physical honey packages to digital verification records.
 * Workflow: Physical package → QR → Scan → Validate → Public verification (Screen 28)
 */
export const ProductScannerView = ({
  isOpen = true,
  onClose,
  onResolveVerification
}) => {
  // State Machine: 'PERMISSION_REQUIRED' | 'PERMISSION_DENIED' | 'SCANNING' | 'QR_DETECTED' | 'VALIDATING' | 'ERROR' | 'SUCCESS'
  const [scannerState, setScannerState] = useState('SCANNING');
  const [cameraPermission, setCameraPermission] = useState('granted'); // 'prompt' | 'granted' | 'denied'
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Point at the QR code on the jar or seal.');
  const [validationError, setValidationError] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isJuryDrawerOpen, setIsJuryDrawerOpen] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);

  // Stop camera tracks cleanly (§ 42)
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Request & start camera stream
  const startCameraStream = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraPermission('granted');
        setScannerState('SCANNING');
        setStatusMessage('Point at the QR code on the jar or seal.');
      } else {
        // Fallback to simulation mode if browser doesn't support getUserMedia
        setCameraPermission('granted');
        setScannerState('SCANNING');
      }
    } catch (err) {
      console.warn('Camera access not granted or unavailable:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraPermission('denied');
        setScannerState('PERMISSION_DENIED');
      } else {
        // Hardware unavailable or headless; proceed in simulation mode
        setCameraPermission('granted');
        setScannerState('SCANNING');
      }
    }
  }, []);

  // Initialize camera when view opens
  useEffect(() => {
    if (isOpen) {
      startCameraStream();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, [isOpen, startCameraStream, stopCameraStream]);

  // Pause camera if user leaves app (§ 41)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCameraStream();
      } else if (isOpen && cameraPermission === 'granted') {
        startCameraStream();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, cameraPermission, startCameraStream, stopCameraStream]);

  // Toggle torch / flashlight
  const handleToggleTorch = async () => {
    const nextTorch = !isTorchOn;
    setIsTorchOn(nextTorch);
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.applyConstraints) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: nextTorch }]
          });
        } catch (e) {
          // Torch not supported on device
        }
      }
    }
  };

  // Process detected QR code payload (§ 11, 12, 17, 18)
  const handleProcessQr = useCallback(
    async (rawQrString, force = false) => {
      if (!force && scanLocked) return;
      setScanLocked(true);
      setValidationError(null);
      setScannerState('QR_DETECTED');
      setStatusMessage('QR code detected. Validating…');

      // 1. Validate domain and token structure
      const validation = publicVerificationService.validateAndParseQr(rawQrString);

      if (!validation.valid) {
        setValidationError({
          title: validation.title,
          message: validation.message,
          errorType: validation.errorType
        });
        setScannerState('ERROR');
        setStatusMessage(validation.title);
        return;
      }

      // 2. Resolve public verification record
      setScannerState('VALIDATING');
      setStatusMessage('Checking verification record…');

      try {
        const record = await publicVerificationService.getPublicRecord(validation.reference);
        setScannerState('SUCCESS');
        setStatusMessage('Verification record resolved.');

        // Pause briefly for confirmation feedback before routing to Screen 28
        scanTimerRef.current = setTimeout(() => {
          stopCameraStream();
          if (onResolveVerification) {
            onResolveVerification(validation.reference);
          } else if (window.__openPublicVerification) {
            window.__openPublicVerification(validation.reference);
          }
          if (onClose) onClose();
        }, 600);
      } catch (err) {
        setValidationError({
          title: 'Verification service unavailable',
          message: "We couldn't connect to the verification service right now. Check your internet connection.",
          errorType: 'NETWORK_ERROR'
        });
        setScannerState('ERROR');
      }
    },
    [scanLocked, onResolveVerification, onClose, stopCameraStream]
  );

  // Resume scanning after error
  const handleResumeScan = () => {
    setScanLocked(false);
    setValidationError(null);
    setScannerState('SCANNING');
    setStatusMessage('Point at the QR code on the jar or seal.');
  };

  // Submit manual code entry (§ 15, 16)
  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    if (!manualCodeInput.trim()) return;

    setIsManualModalOpen(false);
    handleProcessQr(manualCodeInput.trim());
    setManualCodeInput('');
  };

  // Global trigger for automated testing & evaluation
  useEffect(() => {
    window.__simulateQrScan = (rawString) => {
      handleProcessQr(rawString, true);
    };
    window.__setScannerDenied = () => {
      setCameraPermission('denied');
      setScannerState('PERMISSION_DENIED');
    };
    window.__setScannerGranted = () => {
      setCameraPermission('granted');
      setScannerState('SCANNING');
    };
    return () => {
      delete window.__simulateQrScan;
      delete window.__setScannerDenied;
      delete window.__setScannerGranted;
    };
  }, [handleProcessQr]);

  if (!isOpen) return null;

  return (
    <div className="product-scanner-overlay" role="dialog" aria-modal="true">
      <div className="product-scanner-container">
        
        {/* TOP SCANNER HEADER BAR (§ 3) */}
        <header className="scanner-header">
          <div className="scanner-header-left">
            <button
              type="button"
              className="scanner-icon-btn scanner-close-btn"
              onClick={onClose}
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="scanner-titles">
              <span className="scanner-eyebrow">Screen 29 · Product Verification</span>
              <h1 className="scanner-title">Scan to verify</h1>
            </div>
          </div>

          <div className="scanner-header-right">
            {/* Flashlight / Torch Toggle */}
            <button
              type="button"
              className={`scanner-icon-btn scanner-torch-btn ${isTorchOn ? 'active' : ''}`}
              onClick={handleToggleTorch}
              title={isTorchOn ? 'Turn off light' : 'Turn on light'}
              aria-label="Toggle flashlight"
            >
              <Zap size={16} />
            </button>

            {/* Jury Demo Drawer Toggle */}
            <button
              type="button"
              className="scanner-demo-pill"
              onClick={() => setIsJuryDrawerOpen(!isJuryDrawerOpen)}
              title="Open test scenarios for jury inspection"
            >
              <Sparkles size={12} />
              <span>Demo</span>
            </button>
          </div>
        </header>

        {/* JURY DEMO PRESETS DRAWER (§ 51) */}
        {isJuryDrawerOpen && (
          <div className="scanner-demo-drawer">
            <div className="scanner-demo-drawer-top">
              <span className="scanner-demo-drawer-title">
                Physical Jar QR Test Targets
              </span>
              <button
                type="button"
                className="scanner-demo-close-btn"
                onClick={() => setIsJuryDrawerOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="scanner-demo-drawer-sub">
              Tap any test jar to simulate optical camera scanning and validation:
            </p>
            <div className="scanner-demo-chips">
              {publicVerificationService.getSampleQrTargets().map((target) => (
                <button
                  key={target.id}
                  type="button"
                  className={`scanner-target-chip ${target.status}`}
                  onClick={() => {
                    setIsJuryDrawerOpen(false);
                    handleProcessQr(target.payload, true);
                  }}
                >
                  <span className="chip-badge">{target.badge}</span>
                  <span className="chip-label">{target.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAIN SCANNER BODY */}
        <div className="scanner-body">
          
          {/* CAMERA DENIED STATE (§ 6) */}
          {scannerState === 'PERMISSION_DENIED' ? (
            <div className="scanner-card permission-denied-card">
              <div className="denied-icon-wrap">
                <Camera size={32} color="#B85450" />
              </div>
              <h2 className="denied-title">Camera access is off</h2>
              <p className="denied-desc">
                To scan a HoneyChain QR code, allow camera access in your device settings, or enter the printed verification code manually.
              </p>
              <div className="denied-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setCameraPermission('granted');
                    setScannerState('SCANNING');
                  }}
                >
                  Simulate Camera Feed
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsManualModalOpen(true)}
                >
                  Enter code manually
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE CAMERA VIEWFINDER (§ 7, 8) */
            <div className="scanner-viewfinder-zone">
              {/* Background Video / Simulated Feed */}
              <div className="camera-feed-viewport">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-video-elem"
                />
                
                {/* Simulated Ambient Honeycomb Background if physical camera is offline */}
                <div className="simulated-camera-bg">
                  <div className="simulated-pattern">
                    <div className="sim-hex hex-1">⬡</div>
                    <div className="sim-hex hex-2">⬡</div>
                    <div className="sim-hex hex-3">⬡</div>
                  </div>
                  <div className="simulated-jar-silhouette">
                    <span className="jar-badge">Physical Honey Jar Label</span>
                    <div className="jar-seal-qr-mock">
                      <div className="mock-qr-matrix">
                        <div className="qr-corner tl" />
                        <div className="qr-corner tr" />
                        <div className="qr-corner bl" />
                        <div className="qr-dots" />
                      </div>
                      <span className="mock-qr-text">HC-2409</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Viewfinder Targeting Reticle */}
              <div className={`viewfinder-reticle ${scannerState.toLowerCase()}`}>
                {/* Corner Brackets */}
                <div className="corner-bracket top-left" />
                <div className="corner-bracket top-right" />
                <div className="corner-bracket bottom-left" />
                <div className="corner-bracket bottom-right" />

                {/* Clean Optical Frame Reticle */}
                {scannerState === 'SCANNING' && <div className="scan-guide-reticle" />}

                {/* Detecting / Validating Spinner */}
                {(scannerState === 'QR_DETECTED' || scannerState === 'VALIDATING') && (
                  <div className="scan-detect-overlay">
                    <div className="scan-pulse-ring" />
                    <span className="scan-detect-text">Validating QR…</span>
                  </div>
                )}

                {/* Success Checkmark */}
                {scannerState === 'SUCCESS' && (
                  <div className="scan-success-overlay">
                    <CheckCircle2 size={44} color="#4F7A52" />
                    <span className="scan-success-text">Verified Record Found</span>
                  </div>
                )}
              </div>

              {/* DYNAMIC SCAN GUIDANCE (§ 8) */}
              <div className="scanner-guidance-pill">
                <span className="guidance-dot" />
                <span className="guidance-text">{statusMessage}</span>
              </div>

              {/* ERROR ALERT BANNER IF INVALID OR UNTRUSTED (§ 28, 29) */}
              {validationError && (
                <div className="scanner-error-card">
                  <div className="scanner-error-top">
                    <AlertTriangle size={18} color="#B85450" />
                    <h3 className="scanner-error-title">{validationError.title}</h3>
                  </div>
                  <p className="scanner-error-msg">{validationError.message}</p>
                  <div className="scanner-error-actions">
                    <button
                      type="button"
                      className="btn-retry-scan"
                      onClick={handleResumeScan}
                    >
                      Scan again
                    </button>
                    <button
                      type="button"
                      className="btn-enter-manual"
                      onClick={() => setIsManualModalOpen(true)}
                    >
                      Enter code manually
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QUICK TARGETS STRIP FOR TOUCH TESTING */}
          {scannerState === 'SCANNING' && (
            <div className="quick-scan-strip">
              <span className="quick-scan-label">Test Scan Targets:</span>
              <div className="quick-scan-buttons">
                <button
                  type="button"
                  className="quick-target-btn verified"
                  onClick={() => handleProcessQr('https://verify.honeychain.org/b/HC-2409', true)}
                >
                  ✓ Jar HC-2409 (Verified)
                </button>
                <button
                  type="button"
                  className="quick-target-btn attention"
                  onClick={() => handleProcessQr('https://verify.honeychain.org/b/HC-2408', true)}
                >
                  ⚠ Jar HC-2408 (Needs Review)
                </button>
                <button
                  type="button"
                  className="quick-target-btn untrusted"
                  onClick={() => handleProcessQr('https://phishing-fake-honey.com/verify?id=999', true)}
                >
                  ✕ Untrusted QR
                </button>
              </div>
            </div>
          )}

          {/* BOTTOM MANUAL ENTRY CTA (§ 15) */}
          <div className="scanner-footer-actions">
            <button
              type="button"
              className="scanner-manual-btn"
              onClick={() => setIsManualModalOpen(true)}
            >
              <Keyboard size={16} />
              <span>Enter verification code manually</span>
            </button>
          </div>
        </div>

        {/* MODAL: MANUAL CODE ENTRY (§ 15, 16) */}
        {isManualModalOpen && (
          <div className="scanner-modal-backdrop" onClick={() => setIsManualModalOpen(false)}>
            <div className="scanner-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="scanner-modal-header">
                <h3 className="scanner-modal-title">Enter verification code</h3>
                <button
                  type="button"
                  className="scanner-modal-close"
                  onClick={() => setIsManualModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <p className="scanner-modal-desc">
                Enter the verification token or batch number printed on the honey jar seal.
              </p>

              <form onSubmit={handleManualSubmit}>
                <div className="scanner-input-wrap">
                  <label className="scanner-input-label">Verification Code</label>
                  <input
                    type="text"
                    className="scanner-manual-input"
                    placeholder="e.g. HC-2409 or HC-PUB-7F82K9"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="scanner-modal-buttons">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsManualModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!manualCodeInput.trim()}
                  >
                    Verify Record
                  </button>
                </div>
              </form>

              {/* Sample suggestions for quick entry */}
              <div className="scanner-modal-samples">
                <span className="samples-title">Sample Batch Tokens:</span>
                <div className="samples-pills">
                  {publicVerificationService.getSampleReferences().map((sample) => (
                    <button
                      key={sample.key}
                      type="button"
                      className="sample-pill"
                      onClick={() => {
                        setManualCodeInput(sample.key);
                      }}
                    >
                      {sample.key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCOPED STYLES */}
        <style>{`
          .product-scanner-overlay {
            position: fixed;
            inset: 0;
            z-index: 100050;
            background-color: #2B2117;
            display: flex;
            justify-content: center;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          }

          .product-scanner-container {
            width: 100%;
            max-width: 440px;
            min-height: 100vh;
            background-color: #34261B;
            display: flex;
            flex-direction: column;
            position: relative;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.4);
            color: #FFFDF8;
          }

          /* Header */
          .scanner-header {
            position: sticky;
            top: 0;
            z-index: 20;
            background: rgba(52, 38, 27, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(237, 226, 209, 0.15);
            padding: 14px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .scanner-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .scanner-icon-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 1px solid rgba(237, 226, 209, 0.2);
            background: rgba(255, 253, 248, 0.1);
            color: #FFFDF8;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .scanner-icon-btn:hover {
            background: rgba(255, 253, 248, 0.2);
          }

          .scanner-torch-btn.active {
            background: #D99A24;
            color: #34261B;
            border-color: #D99A24;
          }

          .scanner-titles {
            display: flex;
            flex-direction: column;
          }

          .scanner-eyebrow {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #D99A24;
          }

          .scanner-title {
            font-size: 17px;
            font-weight: 800;
            color: #FFFDF8;
            margin: 0;
            line-height: 1.2;
          }

          .scanner-header-right {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .scanner-demo-pill {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 6px 10px;
            border-radius: 999px;
            background: rgba(217, 154, 36, 0.2);
            border: 1px solid #D99A24;
            color: #D99A24;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
          }

          /* Demo Drawer */
          .scanner-demo-drawer {
            background: #FFF9EF;
            color: #34261B;
            padding: 14px 16px;
            border-bottom: 2px solid #D99A24;
            animation: slideDown 0.2s ease-out;
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .scanner-demo-drawer-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
          }

          .scanner-demo-drawer-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #B87316;
          }

          .scanner-demo-close-btn {
            background: none;
            border: none;
            font-size: 14px;
            color: #786D61;
            cursor: pointer;
          }

          .scanner-demo-drawer-sub {
            font-size: 12px;
            color: #786D61;
            margin: 0 0 10px 0;
          }

          .scanner-demo-chips {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .scanner-target-chip {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 8px;
            background: #FFFDF8;
            border: 1px solid #EDE2D1;
            font-size: 12px;
            font-weight: 600;
            color: #34261B;
            cursor: pointer;
            text-align: left;
            transition: all 0.15s ease;
          }

          .scanner-target-chip:hover {
            border-color: #D99A24;
            background: #FFF;
          }

          .chip-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(0,0,0,0.06);
          }

          .scanner-target-chip.VERIFIED .chip-badge {
            background: #4F7A52;
            color: #FFF;
          }

          .scanner-target-chip.NEEDS_REVIEW .chip-badge {
            background: #D9822B;
            color: #FFF;
          }

          .scanner-target-chip.UNTRUSTED_DOMAIN .chip-badge {
            background: #B85450;
            color: #FFF;
          }

          /* Scanner Body */
          .scanner-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
            padding: 20px 16px;
          }

          /* Viewfinder Zone */
          .scanner-viewfinder-zone {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justifyContent: center;
            min-height: 420px;
            position: relative;
          }

          .camera-feed-viewport {
            position: absolute;
            inset: 0;
            border-radius: 20px;
            overflow: hidden;
            background: #1F1710;
          }

          .camera-video-elem {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .simulated-camera-bg {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justifyContent: center;
            background: linear-gradient(180deg, #241A12 0%, #1A130D 100%);
          }

          .simulated-pattern {
            position: absolute;
            inset: 0;
            opacity: 0.08;
            font-size: 80px;
            color: #D99A24;
            display: flex;
            justify-content: space-around;
            align-items: center;
          }

          .simulated-jar-silhouette {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            z-index: 1;
          }

          .jar-badge {
            font-size: 11px;
            font-weight: 600;
            color: #D99A24;
            background: rgba(217, 154, 36, 0.15);
            padding: 4px 10px;
            border-radius: 999px;
            border: 1px solid rgba(217, 154, 36, 0.3);
          }

          .jar-seal-qr-mock {
            width: 110px;
            height: 110px;
            background: #FFFDF8;
            border-radius: 12px;
            padding: 10px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justifyContent: space-between;
          }

          .mock-qr-matrix {
            width: 70px;
            height: 70px;
            border: 2px solid #34261B;
            position: relative;
            background: #FFF;
          }

          .qr-corner {
            width: 16px;
            height: 16px;
            border: 3px solid #34261B;
            position: absolute;
          }
          .qr-corner.tl { top: 2px; left: 2px; }
          .qr-corner.tr { top: 2px; right: 2px; }
          .qr-corner.bl { bottom: 2px; left: 2px; }

          .qr-dots {
            position: absolute;
            inset: 22px;
            background: repeating-linear-gradient(45deg, #34261B, #34261B 2px, transparent 2px, transparent 4px);
          }

          .mock-qr-text {
            font-size: 10px;
            font-family: monospace;
            font-weight: 800;
            color: #34261B;
          }

          /* Targeting Reticle */
          .viewfinder-reticle {
            width: 230px;
            height: 230px;
            position: relative;
            z-index: 5;
            box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.45);
            border-radius: 16px;
          }

          .corner-bracket {
            position: absolute;
            width: 28px;
            height: 28px;
            border-color: #D99A24;
            border-style: solid;
            border-width: 0;
          }

          .corner-bracket.top-left {
            top: 0;
            left: 0;
            border-top-width: 4px;
            border-left-width: 4px;
            border-top-left-radius: 12px;
          }
          .corner-bracket.top-right {
            top: 0;
            right: 0;
            border-top-width: 4px;
            border-right-width: 4px;
            border-top-right-radius: 12px;
          }
          .corner-bracket.bottom-left {
            bottom: 0;
            left: 0;
            border-bottom-width: 4px;
            border-left-width: 4px;
            border-bottom-left-radius: 12px;
          }
          .corner-bracket.bottom-right {
            bottom: 0;
            right: 0;
            border-bottom-width: 4px;
            border-right-width: 4px;
            border-bottom-right-radius: 12px;
          }

          .scan-guide-reticle {
            position: absolute;
            left: 14px;
            right: 14px;
            height: 1px;
            background: rgba(217, 154, 36, 0.45);
            top: 50%;
          }

          .scan-detect-overlay, .scan-success-overlay {
            position: absolute;
            inset: 0;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justifyContent: center;
            gap: 10px;
            background: rgba(52, 38, 27, 0.85);
            backdrop-filter: blur(4px);
          }

          .scan-pulse-ring {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid #D99A24;
            border-top-color: transparent;
            animation: spin 0.8s linear infinite;
          }

          .scan-detect-text, .scan-success-text {
            font-size: 13px;
            font-weight: 700;
            color: #FFFDF8;
          }

          /* Guidance Pill */
          .scanner-guidance-pill {
            margin-top: 24px;
            z-index: 5;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(52, 38, 27, 0.85);
            backdrop-filter: blur(6px);
            border-radius: 999px;
            border: 1px solid rgba(237, 226, 209, 0.2);
            font-size: 13px;
            font-weight: 600;
            color: #FFFDF8;
            max-width: 90%;
            text-align: center;
          }

          .guidance-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #D99A24;
            animation: blink 1.4s infinite;
          }

          @keyframes blink {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }

          /* Error Card */
          .scanner-error-card {
            margin-top: 16px;
            z-index: 10;
            width: 100%;
            max-width: 320px;
            background: #FFFDF8;
            color: #34261B;
            border-radius: 14px;
            border: 1.5px solid #B85450;
            padding: 14px 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          }

          .scanner-error-top {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
          }

          .scanner-error-title {
            font-size: 14px;
            font-weight: 800;
            color: #B85450;
            margin: 0;
          }

          .scanner-error-msg {
            font-size: 12.5px;
            color: #786D61;
            line-height: 1.4;
            margin: 0 0 12px 0;
          }

          .scanner-error-actions {
            display: flex;
            gap: 8px;
          }

          .btn-retry-scan {
            flex: 1;
            height: 34px;
            border-radius: 8px;
            background: #B85450;
            color: #FFF;
            border: none;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          }

          .btn-enter-manual {
            flex: 1;
            height: 34px;
            border-radius: 8px;
            background: #FFF9EF;
            color: #34261B;
            border: 1px solid #EDE2D1;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          }

          /* Permission Denied Card */
          .permission-denied-card {
            background: #FFFDF8;
            color: #34261B;
            border-radius: 20px;
            padding: 28px 20px;
            text-align: center;
            border: 1px solid #EDE2D1;
            margin: auto 0;
          }

          .denied-icon-wrap {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: rgba(184, 84, 80, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
          }

          .denied-title {
            font-size: 19px;
            font-weight: 800;
            margin: 0 0 8px;
          }

          .denied-desc {
            font-size: 13.5px;
            color: #786D61;
            line-height: 1.5;
            margin: 0 0 20px;
          }

          .denied-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          /* Quick Scan Strip */
          .quick-scan-strip {
            margin-top: 14px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .quick-scan-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: rgba(255, 253, 248, 0.6);
          }

          .quick-scan-buttons {
            display: flex;
            gap: 6px;
            overflow-x: auto;
            padding-bottom: 4px;
          }

          .quick-target-btn {
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 11.5px;
            font-weight: 700;
            white-space: nowrap;
            border: 1px solid rgba(255, 253, 248, 0.2);
            background: rgba(255, 253, 248, 0.08);
            color: #FFFDF8;
            cursor: pointer;
          }

          .quick-target-btn.verified:hover {
            background: #4F7A52;
            border-color: #4F7A52;
          }
          .quick-target-btn.attention:hover {
            background: #D9822B;
            border-color: #D9822B;
          }
          .quick-target-btn.untrusted:hover {
            background: #B85450;
            border-color: #B85450;
          }

          /* Footer Actions */
          .scanner-footer-actions {
            margin-top: 16px;
          }

          .scanner-manual-btn {
            width: 100%;
            height: 46px;
            border-radius: 12px;
            background: rgba(255, 253, 248, 0.12);
            border: 1px solid rgba(237, 226, 209, 0.25);
            color: #FFFDF8;
            font-size: 13.5px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .scanner-manual-btn:hover {
            background: rgba(255, 253, 248, 0.2);
          }

          /* Modal: Manual Entry */
          .scanner-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 1080;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .scanner-modal-card {
            width: 100%;
            max-width: 400px;
            background: #FFFDF8;
            color: #34261B;
            border-radius: 20px;
            padding: 22px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
            border: 1px solid #EDE2D1;
          }

          .scanner-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
          }

          .scanner-modal-title {
            font-size: 18px;
            font-weight: 800;
            margin: 0;
          }

          .scanner-modal-close {
            background: none;
            border: none;
            font-size: 16px;
            color: #786D61;
            cursor: pointer;
          }

          .scanner-modal-desc {
            font-size: 13px;
            color: #786D61;
            line-height: 1.45;
            margin: 0 0 16px;
          }

          .scanner-input-wrap {
            margin-bottom: 16px;
          }

          .scanner-input-label {
            font-size: 12px;
            font-weight: 700;
            color: #34261B;
            display: block;
            margin-bottom: 6px;
          }

          .scanner-manual-input {
            width: 100%;
            height: 46px;
            border-radius: 10px;
            border: 1.5px solid #EDE2D1;
            background: #FFF;
            padding: 0 14px;
            font-size: 15px;
            font-family: monospace;
            font-weight: 700;
            color: #34261B;
            box-sizing: border-box;
          }

          .scanner-manual-input:focus {
            border-color: #D99A24;
            outline: none;
          }

          .scanner-modal-buttons {
            display: flex;
            gap: 10px;
            margin-bottom: 16px;
          }

          .scanner-modal-buttons .btn {
            flex: 1;
            height: 44px;
            border-radius: 10px;
            font-size: 13.5px;
            font-weight: 700;
            cursor: pointer;
          }

          .scanner-modal-samples {
            border-top: 1px solid #EDE2D1;
            padding-top: 12px;
          }

          .samples-title {
            font-size: 11px;
            font-weight: 700;
            color: #786D61;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: block;
            margin-bottom: 6px;
          }

          .samples-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .sample-pill {
            padding: 4px 8px;
            border-radius: 6px;
            background: #FFF9EF;
            border: 1px solid #EDE2D1;
            color: #34261B;
            font-size: 11px;
            font-family: monospace;
            font-weight: 700;
            cursor: pointer;
          }

          .sample-pill:hover {
            border-color: #D99A24;
            background: #FFF;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ProductScannerView;
