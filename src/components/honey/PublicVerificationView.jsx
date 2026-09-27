import React, { useState, useEffect, useCallback } from 'react';
import { publicVerificationService } from '../../data/publicVerificationService';

/**
 * Screen 28 — Public Verification / Consumer Traceability
 * 
 * Standalone consumer-grade verification certificate.
 * Zero internal navigation, zero secrets, zero blockchain jargon overload.
 * Answers: "Can I understand where this honey came from and whether its HoneyChain verification record is valid?"
 */
export const PublicVerificationView = ({
  isOpen = true,
  onClose,
  initialReference = 'HC-2409',
  isEmbedded = false,
  onOpenScanner
}) => {
  // State hooks MUST all be declared at the top before any returns
  const [currentReference, setCurrentReference] = useState(initialReference);
  const [loading, setLoading] = useState(true);
  const [recordData, setRecordData] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [errorType, setErrorType] = useState(null);

  // Modals & Panels
  const [isProofExpanded, setIsProofExpanded] = useState(false);
  const [isVerifyAnotherOpen, setIsVerifyAnotherOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isFullHashModalOpen, setIsFullHashModalOpen] = useState(false);
  const [selectedHashData, setSelectedHashData] = useState({ label: '', value: '' });
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);
  const [isScanningSim, setIsScanningSim] = useState(false);

  // Input for lookup
  const [manualInput, setManualInput] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // Load public record from service
  const loadRecord = useCallback(async (ref, offlineFlag = false) => {
    setLoading(true);
    setErrorType(null);
    try {
      const data = await publicVerificationService.getPublicRecord(ref, offlineFlag);
      if (!data.found) {
        setErrorType('NOT_FOUND');
        setRecordData(data);
      } else {
        setRecordData(data);
      }
    } catch (err) {
      if (err.message === 'OFFLINE_ERROR') {
        setErrorType('OFFLINE');
      } else {
        setErrorType('GENERIC_ERROR');
      }
      setRecordData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadRecord(currentReference, isOffline);
  }, [currentReference, isOffline, loadRecord]);

  // Support global inspection trigger for automated testing & jury demo
  useEffect(() => {
    window.__setPublicVerificationScenario = (ref, offlineMode = false) => {
      setIsOffline(offlineMode);
      setCurrentReference(ref);
      loadRecord(ref, offlineMode);
    };
    return () => {
      delete window.__setPublicVerificationScenario;
    };
  }, [loadRecord]);

  // Copy to clipboard handler
  const handleCopy = (text, key) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Switch scenario preset
  const handleSelectPreset = (ref, offline = false) => {
    setIsOffline(offline);
    setCurrentReference(ref);
    setIsDemoDrawerOpen(false);
    setIsVerifyAnotherOpen(false);
  };

  // Trigger QR Scanner or simulation fallback
  const handleSimulateScan = () => {
    if (onOpenScanner) {
      setIsVerifyAnotherOpen(false);
      onOpenScanner();
    } else {
      setIsScanningSim(true);
      setTimeout(() => {
        setIsScanningSim(false);
        setIsVerifyAnotherOpen(false);
        setCurrentReference('HC-2409');
        setIsOffline(false);
        loadRecord('HC-2409', false);
      }, 1200);
    }
  };

  // Truncate hashes safely
  const truncateHash = (hash, front = 8, back = 6) => {
    if (!hash || hash.length <= front + back) return hash || '';
    return `${hash.slice(0, front)}...${hash.slice(-back)}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="public-verification-root"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#FFF9EF',
        color: '#34261B',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div
        className="public-container"
        style={{
          width: '100%',
          maxWidth: '520px',
          minHeight: '100vh',
          backgroundColor: '#FFFDF8',
          borderLeft: '1px solid #EDE2D1',
          borderRight: '1px solid #EDE2D1',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          paddingBottom: '60px',
          boxShadow: '0 4px 30px rgba(52, 38, 27, 0.08)'
        }}
      >
        {/* PUBLIC TOP HEADER BAR */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            backgroundColor: '#FFFDF8',
            borderBottom: '1px solid #EDE2D1',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#D99A24',
                color: '#FFFDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 800,
                boxShadow: '0 2px 6px rgba(217, 154, 36, 0.3)'
              }}
            >
              ⬡
            </div>
            <div>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  letterSpacing: '-0.3px',
                  color: '#34261B',
                  display: 'block',
                  lineHeight: 1.1
                }}
              >
                HoneyChain
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#D99A24',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px'
                }}
              >
                Public Registry
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Jury Demo Trigger */}
            <button
              onClick={() => setIsDemoDrawerOpen(!isDemoDrawerOpen)}
              style={{
                padding: '6px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid #D99A24',
                backgroundColor: '#FFF9EF',
                color: '#B87316',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Switch demo scenarios for jury inspection"
            >
              <span>Demo</span>
              <span style={{ fontSize: '9px' }}>▾</span>
            </button>

            {/* Verify Another */}
            <button
              onClick={() => setIsVerifyAnotherOpen(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid #EDE2D1',
                backgroundColor: '#FFFDF8',
                color: '#786D61',
                cursor: 'pointer'
              }}
            >
              Look up
            </button>

            {/* In-app Close (if embedded in app) */}
            {onClose && (
              <button
                className="public-header-close-btn"
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #EDE2D1',
                  backgroundColor: '#FFFDF8',
                  color: '#786D61',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600
                }}
                aria-label="Close public view"
              >
                ✕
              </button>
            )}
          </div>
        </header>

        {/* DEMO PRESETS DRAWER FOR JURY EVALUATION */}
        {isDemoDrawerOpen && (
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#FFF9EF',
              borderBottom: '1px solid #EDE2D1',
              boxShadow: 'inset 0 2px 4px rgba(52, 38, 27, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#34261B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Jury Demo Presets (Screen 28 States)
              </span>
              <button
                onClick={() => setIsDemoDrawerOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '12px', color: '#786D61', cursor: 'pointer' }}
              >
                Close ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                onClick={() => handleSelectPreset('HC-2409', false)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: currentReference === 'HC-2409' && !isOffline ? '#4F7A52' : '#FFFDF8',
                  color: currentReference === 'HC-2409' && !isOffline ? '#FFF' : '#34261B',
                  border: '1px solid #EDE2D1',
                  cursor: 'pointer'
                }}
              >
                ✓ HC-2409 (Verified)
              </button>
              <button
                onClick={() => handleSelectPreset('HC-2408', false)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: currentReference === 'HC-2408' && !isOffline ? '#D9822B' : '#FFFDF8',
                  color: currentReference === 'HC-2408' && !isOffline ? '#FFF' : '#34261B',
                  border: '1px solid #EDE2D1',
                  cursor: 'pointer'
                }}
              >
                ⚠ HC-2408 (Needs Review)
              </button>
              <button
                onClick={() => handleSelectPreset('HC-2412', false)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: currentReference === 'HC-2412' && !isOffline ? '#786D61' : '#FFFDF8',
                  color: currentReference === 'HC-2412' && !isOffline ? '#FFF' : '#34261B',
                  border: '1px solid #EDE2D1',
                  cursor: 'pointer'
                }}
              >
                ◌ HC-2412 (In Progress)
              </button>
              <button
                onClick={() => handleSelectPreset('HC-2401', false)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: currentReference === 'HC-2401' && !isOffline ? '#B85450' : '#FFFDF8',
                  color: currentReference === 'HC-2401' && !isOffline ? '#FFF' : '#34261B',
                  border: '1px solid #EDE2D1',
                  cursor: 'pointer'
                }}
              >
                ✕ HC-2401 (Stale / Invalid)
              </button>
              <button
                onClick={() => handleSelectPreset('INVALID-REF', false)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: currentReference === 'INVALID-REF' && !isOffline ? '#B85450' : '#FFFDF8',
                  color: currentReference === 'INVALID-REF' && !isOffline ? '#FFF' : '#34261B',
                  border: '1px solid #EDE2D1',
                  cursor: 'pointer'
                }}
              >
                ? Not Found State
              </button>
              <button
                onClick={() => handleSelectPreset(currentReference, !isOffline)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: isOffline ? '#34261B' : '#FFFDF8',
                  color: isOffline ? '#FFF' : '#34261B',
                  border: '1px solid #EDE2D1',
                  cursor: 'pointer'
                }}
              >
                {isOffline ? '⚡ Offline: Active' : '⚡ Simulate Offline'}
              </button>
            </div>
          </div>
        )}

        {/* MAIN BODY CONTENT */}
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TITLE & HEADER COPY */}
          <div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#D99A24',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                display: 'block',
                marginBottom: '4px'
              }}
            >
              Public Certificate
            </span>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#34261B',
                lineHeight: 1.25,
                margin: '0 0 6px 0',
                letterSpacing: '-0.4px'
              }}
            >
              Verified honey journey
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: '#786D61',
                lineHeight: 1.5,
                margin: 0
              }}
            >
              Trace the recorded journey of this honey from source to verification.
            </p>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: '#FFF9EF',
                borderRadius: '16px',
                border: '1px solid #EDE2D1'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '3px solid #EDE2D1',
                  borderTopColor: '#D99A24',
                  margin: '0 auto 16px',
                  animation: 'spin 0.8s linear infinite'
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#34261B', margin: '0 0 6px' }}>
                Loading verification record…
              </h3>
              <p style={{ fontSize: '13px', color: '#786D61', margin: 0 }}>
                Querying HoneyChain public registry for reference {currentReference}
              </p>
            </div>
          )}

          {/* ERROR: OFFLINE */}
          {!loading && errorType === 'OFFLINE' && (
            <div
              style={{
                padding: '24px 20px',
                backgroundColor: 'rgba(217, 130, 43, 0.08)',
                borderRadius: '16px',
                border: '1.5px solid #D9822B',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#34261B', margin: '0 0 6px' }}>
                We can't verify this record right now
              </h3>
              <p style={{ fontSize: '13.5px', color: '#786D61', lineHeight: 1.5, margin: '0 0 16px' }}>
                A network connection is required to authenticate digital records against the HoneyChain public registry.
              </p>
              <button
                onClick={() => loadRecord(currentReference, false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  backgroundColor: '#D9822B',
                  color: '#FFF',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Try again
              </button>
            </div>
          )}

          {/* ERROR: RECORD NOT FOUND */}
          {!loading && errorType === 'NOT_FOUND' && (
            <div
              style={{
                padding: '28px 20px',
                backgroundColor: '#FFF9EF',
                borderRadius: '16px',
                border: '1px solid #EDE2D1',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(184, 84, 80, 0.1)',
                  color: '#B85450',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 700,
                  margin: '0 auto 12px'
                }}
              >
                ?
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#34261B', margin: '0 0 8px' }}>
                Verification record not found
              </h3>
              <p style={{ fontSize: '13.5px', color: '#786D61', lineHeight: 1.5, margin: '0 0 20px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
                We couldn't find a public HoneyChain verification record for reference <code style={{ backgroundColor: '#EDE2D1', padding: '2px 6px', borderRadius: '4px', color: '#34261B' }}>{currentReference}</code>. Please check the code on your product label.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  onClick={() => setIsVerifyAnotherOpen(true)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    backgroundColor: '#D99A24',
                    color: '#FFF',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Enter another reference
                </button>
                <button
                  onClick={() => handleSelectPreset('HC-2409', false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    backgroundColor: '#FFFDF8',
                    color: '#34261B',
                    border: '1px solid #EDE2D1',
                    cursor: 'pointer'
                  }}
                >
                  View Sample Batch
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE RECORD CONTENT */}
          {!loading && recordData && recordData.found && (
            <>
              {/* 1. PRIMARY VERIFICATION STATUS HERO */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor:
                    recordData.status === 'VERIFIED'
                      ? 'rgba(79, 122, 82, 0.08)'
                      : recordData.status === 'NEEDS_REVIEW'
                      ? 'rgba(217, 130, 43, 0.08)'
                      : recordData.status === 'INVALIDATED'
                      ? 'rgba(184, 84, 80, 0.08)'
                      : 'rgba(120, 109, 97, 0.08)',
                  border: `1.5px solid ${
                    recordData.status === 'VERIFIED'
                      ? '#4F7A52'
                      : recordData.status === 'NEEDS_REVIEW'
                      ? '#D9822B'
                      : recordData.status === 'INVALIDATED'
                      ? '#B85450'
                      : '#786D61'
                  }`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  {/* Status Badge Pill */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      backgroundColor:
                        recordData.status === 'VERIFIED'
                          ? '#4F7A52'
                          : recordData.status === 'NEEDS_REVIEW'
                          ? '#D9822B'
                          : recordData.status === 'INVALIDATED'
                          ? '#B85450'
                          : '#786D61',
                      color: '#FFFDF8',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.2px'
                    }}
                  >
                    <span>
                      {recordData.status === 'VERIFIED'
                        ? '✓'
                        : recordData.status === 'NEEDS_REVIEW'
                        ? '⚠'
                        : recordData.status === 'INVALIDATED'
                        ? '✕'
                        : '◌'}
                    </span>
                    <span>{recordData.statusLabel}</span>
                  </div>

                  {/* Public Reference Token */}
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#786D61',
                      backgroundColor: '#FFFDF8',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #EDE2D1'
                    }}
                  >
                    {recordData.publicReference}
                  </span>
                </div>

                {/* Status Title */}
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#34261B',
                    margin: '0 0 6px',
                    lineHeight: 1.3
                  }}
                >
                  {recordData.status === 'VERIFIED' && 'Verification confirmed'}
                  {recordData.status === 'NEEDS_REVIEW' && 'Verification needs review'}
                  {recordData.status === 'NOT_VERIFIED' && 'Verification not confirmed'}
                  {recordData.status === 'INVALIDATED' && 'Verification no longer current'}
                </h2>

                {/* Explanation text */}
                <p
                  style={{
                    fontSize: '13.5px',
                    color: '#786D61',
                    lineHeight: 1.5,
                    margin: '0 0 14px'
                  }}
                >
                  {recordData.statusExplanation}
                </p>

                {/* Verified Timestamp Info */}
                {recordData.verifiedAt && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#34261B',
                      borderTop: '1px solid rgba(0,0,0,0.06)',
                      paddingTop: '10px'
                    }}
                  >
                    <span style={{ color: '#D99A24' }}>●</span>
                    <span>Verified on:</span>
                    <span style={{ fontWeight: 700 }}>{recordData.verifiedAt}</span>
                  </div>
                )}

                {/* Action if Stale */}
                {recordData.status === 'INVALIDATED' && (
                  <button
                    onClick={() => handleSelectPreset('HC-2409', false)}
                    style={{
                      marginTop: '12px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#34261B',
                      color: '#FFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    View current active verification (HC-2409) →
                  </button>
                )}
              </div>

              {/* 2. PRODUCT IDENTITY CARD */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor: '#FFFDF8',
                  border: '1px solid #EDE2D1',
                  boxShadow: '0 2px 8px rgba(52, 38, 27, 0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#D99A24', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      Honey Product
                    </span>
                    <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#34261B', margin: '2px 0 0' }}>
                      {recordData.productName}
                    </h3>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#B87316',
                      backgroundColor: '#FFF9EF',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid #EDE2D1'
                    }}
                  >
                    {recordData.batchReference}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    marginTop: '16px',
                    paddingTop: '14px',
                    borderTop: '1px solid #EDE2D1'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', color: '#786D61', display: 'block', marginBottom: '2px' }}>
                      Honey Type
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#34261B' }}>
                      {recordData.honeyType}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#786D61', display: 'block', marginBottom: '2px' }}>
                      Tamper Seal
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#34261B' }}>
                      {recordData.tamperSeal}
                    </span>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '11px', color: '#786D61', display: 'block', marginBottom: '2px' }}>
                      Source Region
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#34261B' }}>
                      {recordData.sourceArea}
                    </span>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '11px', color: '#786D61', display: 'block', marginBottom: '2px' }}>
                      Packaging / Lot
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#34261B' }}>
                      {recordData.packagingDetails}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. PUBLIC HONEY JOURNEY TIMELINE */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor: '#FFFDF8',
                  border: '1px solid #EDE2D1',
                  boxShadow: '0 2px 8px rgba(52, 38, 27, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#34261B', margin: 0 }}>
                      Honey journey
                    </h3>
                    <span style={{ fontSize: '12px', color: '#786D61' }}>
                      Documented stages from hive to jar
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#4F7A52',
                      backgroundColor: 'rgba(79, 122, 82, 0.1)',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    6 Milestones
                  </span>
                </div>

                {/* Timeline Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                  {recordData.journey.map((step, idx) => {
                    const isLast = idx === recordData.journey.length - 1;
                    const isComplete = step.status === 'COMPLETED' || step.status === 'VERIFIED';
                    const isPending = step.status === 'PENDING' || step.status === 'NOT_VERIFIED';
                    const isInvalid = step.status === 'NEEDS_REVIEW' || step.status === 'INVALIDATED';

                    return (
                      <div
                        key={step.id || idx}
                        style={{
                          display: 'flex',
                          gap: '14px',
                          position: 'relative',
                          paddingBottom: isLast ? '0px' : '22px'
                        }}
                      >
                        {/* Connecting Line */}
                        {!isLast && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '13px',
                              top: '26px',
                              bottom: '0px',
                              width: '2px',
                              backgroundColor: isComplete ? '#4F7A52' : '#EDE2D1'
                            }}
                          />
                        )}

                        {/* Step Icon / Circle */}
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: isComplete
                              ? '#4F7A52'
                              : isInvalid
                              ? '#D9822B'
                              : isPending
                              ? '#FFFDF8'
                              : '#786D61',
                            border: `2px solid ${
                              isComplete
                                ? '#4F7A52'
                                : isInvalid
                                ? '#D9822B'
                                : isPending
                                ? '#EDE2D1'
                                : '#786D61'
                            }`,
                            color: isPending ? '#786D61' : '#FFFDF8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 800,
                            zIndex: 1,
                            flexShrink: 0
                          }}
                        >
                          {isComplete ? '✓' : isInvalid ? '!' : step.stepNumber || idx + 1}
                        </div>

                        {/* Step Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#34261B' }}>
                              {step.stage}
                            </span>
                            <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#786D61' }}>
                              {step.date}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#B87316', margin: '0 0 3px' }}>
                            {step.title}
                          </h4>

                          <p style={{ fontSize: '12.5px', color: '#786D61', lineHeight: 1.45, margin: 0 }}>
                            {step.summary}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. "WHAT DOES VERIFIED MEAN?" EDUCATIONAL CARD (§ 22) */}
              <div
                style={{
                  padding: '18px 20px',
                  borderRadius: '16px',
                  backgroundColor: '#FFF9EF',
                  border: '1px solid #EDE2D1'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px' }}>💡</span>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#34261B', margin: 0 }}>
                    What does verified mean?
                  </h3>
                </div>
                <p style={{ fontSize: '13px', color: '#786D61', lineHeight: 1.5, margin: '0 0 8px' }}>
                  HoneyChain verification means the required production records, inspection evidence, and laboratory checks configured for this honey journey were recorded and validated in the system.
                </p>
                <p style={{ fontSize: '12.5px', color: '#34261B', fontWeight: 600, lineHeight: 1.45, margin: 0 }}>
                  It certifies the procedural integrity and digital traceability of the record according to HoneyChain standards. It does not by itself mean HoneyChain independently guarantees every physical characteristic of the product.
                </p>
              </div>

              {/* 5. SECONDARY TECHNICAL PROOF (COLLAPSIBLE) (§ 17-20) */}
              {recordData.proof && (
                <div
                  style={{
                    borderRadius: '16px',
                    backgroundColor: '#FFFDF8',
                    border: '1px solid #EDE2D1',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    className="public-proof-toggle-btn"
                    onClick={() => setIsProofExpanded(!isProofExpanded)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          backgroundColor: '#FFF9EF',
                          border: '1px solid #EDE2D1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          color: '#B87316'
                        }}
                      >
                        🔒
                      </span>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#34261B', display: 'block' }}>
                          Technical proof
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#786D61' }}>
                          {recordData.proof.statusLabel}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '14px', color: '#786D61', transform: isProofExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      ▾
                    </span>
                  </button>

                  {isProofExpanded && (
                    <div
                      style={{
                        padding: '0 20px 20px 20px',
                        borderTop: '1px solid #EDE2D1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                      }}
                    >
                      <p style={{ fontSize: '12.5px', color: '#786D61', lineHeight: 1.45, margin: '14px 0 0' }}>
                        Technical proof helps preserve the integrity and timing of the digital verification record. It proves the digital record has not been altered since anchoring. It does not by itself prove the physical quality or safety of the honey.
                      </p>

                      {/* Technical Fields Grid */}
                      <div
                        style={{
                          backgroundColor: '#FFF9EF',
                          padding: '14px',
                          borderRadius: '12px',
                          border: '1px solid #EDE2D1',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          fontSize: '12.5px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#786D61' }}>Ledger Network</span>
                          <span style={{ fontWeight: 700, color: '#34261B' }}>{recordData.proof.network}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#786D61' }}>Block Reference</span>
                          <span style={{ fontWeight: 700, color: '#34261B' }}>{recordData.proof.blockReference}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#786D61' }}>Anchored On</span>
                          <span style={{ fontWeight: 600, color: '#34261B' }}>{recordData.proof.anchoredAt}</span>
                        </div>

                        {/* Transaction Reference with One-Tap Copy */}
                        <div style={{ borderTop: '1px solid #EDE2D1', paddingTop: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ color: '#786D61', fontSize: '11.5px', fontWeight: 600 }}>
                              Public Proof Reference
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => handleCopy(recordData.proof.transactionReference, 'txHash')}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  backgroundColor: copiedKey === 'txHash' ? '#4F7A52' : '#FFFDF8',
                                  color: copiedKey === 'txHash' ? '#FFF' : '#34261B',
                                  border: '1px solid #EDE2D1',
                                  cursor: 'pointer'
                                }}
                              >
                                {copiedKey === 'txHash' ? 'Copied ✓' : 'Copy'}
                              </button>
                              <button
                                className="public-hash-expand-btn"
                                onClick={() => {
                                  setSelectedHashData({
                                    label: 'Public Proof Reference (Transaction Hash)',
                                    value: recordData.proof.transactionReference
                                  });
                                  setIsFullHashModalOpen(true);
                                }}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: '10.5px',
                                  fontWeight: 600,
                                  backgroundColor: '#FFFDF8',
                                  color: '#786D61',
                                  border: '1px solid #EDE2D1',
                                  cursor: 'pointer'
                                }}
                              >
                                Expand
                              </button>
                            </div>
                          </div>
                          <code
                            style={{
                              display: 'block',
                              fontSize: '11.5px',
                              fontFamily: 'monospace',
                              backgroundColor: '#FFFDF8',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #EDE2D1',
                              color: '#B87316',
                              wordBreak: 'break-all'
                            }}
                          >
                            {truncateHash(recordData.proof.transactionReference, 14, 10)}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. VERIFICATION RECORD SUMMARY BOX (§ 21) */}
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  backgroundColor: '#FFFDF8',
                  border: '1px solid #EDE2D1',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px'
                }}
              >
                <div>
                  <span style={{ color: '#786D61', display: 'block' }}>Public Reference</span>
                  <strong style={{ color: '#34261B', fontSize: '13px' }}>{recordData.publicReference}</strong>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ color: '#786D61', display: 'block' }}>Record Version</span>
                  <strong style={{ color: '#34261B', fontSize: '13px' }}>{recordData.recordVersion}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#786D61', display: 'block' }}>Registry Status</span>
                  <strong style={{ color: '#4F7A52', fontSize: '13px' }}>Authoritative</strong>
                </div>
              </div>

              {/* 7. FOOTER BUTTONS & TRUST ACTIONS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => setIsVerifyAnotherOpen(true)}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    backgroundColor: '#D99A24',
                    color: '#FFFDF8',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(217, 154, 36, 0.25)'
                  }}
                >
                  Verify another product
                </button>

                <button
                  onClick={() => setIsAboutOpen(true)}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    color: '#786D61',
                    border: '1px solid #EDE2D1',
                    cursor: 'pointer'
                  }}
                >
                  About HoneyChain verification
                </button>
              </div>
            </>
          )}

        </div>

        {/* BOTTOM COPYRIGHT NOTE */}
        <footer
          style={{
            marginTop: 'auto',
            padding: '24px 20px',
            textAlign: 'center',
            fontSize: '11.5px',
            color: '#786D61',
            borderTop: '1px solid #EDE2D1'
          }}
        >
          <span>HoneyChain Public Trust Architecture · Protecting Authentic Beekeeping</span>
        </footer>
      </div>

      {/* MODAL 1: VERIFY ANOTHER PRODUCT (§ 34) */}
      {isVerifyAnotherOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(52, 38, 27, 0.6)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#FFFDF8',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              border: '1px solid #EDE2D1'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#34261B', margin: 0 }}>
                Verify product
              </h3>
              <button
                className="public-lookup-modal-close-btn"
                onClick={() => setIsVerifyAnotherOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '16px', color: '#786D61', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#786D61', lineHeight: 1.5, margin: '0 0 16px' }}>
              Scan product QR code or enter the verification code printed on the jar seal.
            </p>

            {/* Simulated Camera Scan CTA */}
            <button
              onClick={handleSimulateScan}
              disabled={isScanningSim}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#FFF9EF',
                border: '1.5px dashed #D99A24',
                color: '#B87316',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              <span>📷</span>
              <span>{isScanningSim ? 'Scanning QR code…' : 'Scan Product QR Code'}</span>
            </button>

            {/* Input Form */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#34261B', display: 'block', marginBottom: '6px' }}>
                Or enter verification reference
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. HC-2409 or HC-PUB-..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  style={{
                    flex: 1,
                    height: '44px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: '1px solid #EDE2D1',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    backgroundColor: '#FFFDF8',
                    color: '#34261B'
                  }}
                />
                <button
                  onClick={() => {
                    if (manualInput.trim()) {
                      setCurrentReference(manualInput.trim());
                      setIsOffline(false);
                      setIsVerifyAnotherOpen(false);
                    }
                  }}
                  style={{
                    padding: '0 16px',
                    borderRadius: '10px',
                    backgroundColor: '#D99A24',
                    color: '#FFF',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Verify
                </button>
              </div>
            </div>

            {/* Sample References for Evaluators */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#786D61', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Quick Test References
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {publicVerificationService.getSampleReferences().map((sample) => (
                  <button
                    key={sample.key}
                    onClick={() => {
                      setCurrentReference(sample.key);
                      setIsOffline(false);
                      setIsVerifyAnotherOpen(false);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      backgroundColor: '#FFF9EF',
                      border: '1px solid #EDE2D1',
                      color: '#34261B',
                      cursor: 'pointer'
                    }}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ABOUT HONEYCHAIN */}
      {isAboutOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(52, 38, 27, 0.6)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#FFFDF8',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              border: '1px solid #EDE2D1'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>⬡</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#34261B', margin: 0 }}>
                  About HoneyChain
                </h3>
              </div>
              <button
                onClick={() => setIsAboutOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '16px', color: '#786D61', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#786D61', lineHeight: 1.5 }}>
              <p style={{ margin: 0 }}>
                <strong>HoneyChain</strong> is a digital traceability and origin-verification network built to support artisanal, ethical beekeeping.
              </p>
              <p style={{ margin: 0 }}>
                Every verified batch connects the physical work of genuine apiarists with tamper-evident digital records—from harvest inspection to independent laboratory quality review.
              </p>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FFF9EF', border: '1px solid #EDE2D1' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#34261B', display: 'block', marginBottom: '4px' }}>
                  Our Public Trust Standard
                </span>
                <span style={{ fontSize: '12px', color: '#786D61' }}>
                  We believe consumers deserve honest traceability without misleading marketing claims. Our cryptographic technical proofs anchor records permanently, ensuring records cannot be silently altered or falsified.
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsAboutOpen(false)}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#34261B',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                marginTop: '18px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: FULL CRYPTOGRAPHIC HASH VIEWER */}
      {isFullHashModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(52, 38, 27, 0.65)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#FFFDF8',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              border: '1px solid #EDE2D1'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#34261B', margin: 0 }}>
                {selectedHashData.label}
              </h3>
              <button
                className="public-hash-modal-close-btn"
                onClick={() => setIsFullHashModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '16px', color: '#786D61', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#786D61', margin: '0 0 12px' }}>
              Full authoritative cryptographic identifier recorded on the public consortium ledger:
            </p>

            <div
              style={{
                backgroundColor: '#FFF9EF',
                border: '1px solid #EDE2D1',
                borderRadius: '10px',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#B87316',
                wordBreak: 'break-all',
                lineHeight: 1.5,
                marginBottom: '16px',
                userSelect: 'all'
              }}
            >
              {selectedHashData.value}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleCopy(selectedHashData.value, 'modalHash')}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: copiedKey === 'modalHash' ? '#4F7A52' : '#D99A24',
                  color: '#FFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {copiedKey === 'modalHash' ? 'Copied to clipboard ✓' : 'Copy complete reference'}
              </button>
              <button
                onClick={() => setIsFullHashModalOpen(false)}
                style={{
                  padding: '0 18px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFDF8',
                  color: '#34261B',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid #EDE2D1',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicVerificationView;
