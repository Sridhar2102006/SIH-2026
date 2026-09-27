import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Info,
  Maximize2,
  Minimize2,
  Camera,
  Layers,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Thermometer,
  Droplets,
  Activity,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Lock,
  Calendar,
  History
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

// Master Supported ML Screening Results (Section 2, 5, 6)
export const SCREENING_RESULT_PRESETS = {
  STATE_A_POSSIBLE_AFB: {
    stateId: 'STATE_A_POSSIBLE_AFB',
    resultType: 'POSSIBLE_ISSUE',
    severity: 'attention',
    title: 'Possible signs detected',
    supportingText: 'The image contains visual signs that may need closer inspection.',
    condition: 'Possible American foulbrood signs',
    confidenceLabel: 'Strong visual match',
    findings: [
      'Irregular brood pattern with scattered empty cells',
      'Sunken or punctured capped cells on frame center',
      'Visual patterns associated with bacterial brood condition'
    ],
    whatItMeans:
      'The image shows visual signs that can be associated with early-stage American foulbrood. This is an optical pattern match, not a laboratory confirmation.',
    whatToDoNext: [
      'Inspect the surrounding brood area closely and record your observations.',
      'Check for ropy larval remains using a sterile probe or toothpick test.',
      'Compare this comb with previous inspection photos.',
      'Confirm important findings through qualified inspector or laboratory assessment before treatment or management decisions.'
    ],
    showLocalization: true,
    localizationBox: { top: '38%', left: '32%', width: '38%', height: '36%' }
  },
  STATE_B_NO_CONCERNING_SIGNS: {
    stateId: 'STATE_B_NO_CONCERNING_SIGNS',
    resultType: 'NO_CONCERNING_SIGNS',
    severity: 'healthy',
    title: 'No concerning signs detected',
    supportingText: 'We didn\'t identify concerning visual signs in this frame.',
    condition: 'Healthy brood pattern',
    confidenceLabel: 'Solid pattern match',
    findings: [
      'Solid, contiguous worker pupal distribution',
      'Clean, convex wax cappings',
      'No visible capping puncture, depression, or spotting'
    ],
    whatItMeans:
      'The brood distribution and pupal cappings in this captured section appear uniform and typical of active laying.',
    whatToDoNext: [
      'Continue normal hive monitoring and record any observations you notice.',
      'Maintain regular seasonal checkups during active nectar flow.'
    ],
    showLocalization: false
  },
  STATE_C_UNCLEAR: {
    stateId: 'STATE_C_UNCLEAR',
    resultType: 'UNCLEAR',
    severity: 'unclear',
    title: 'Image needs another look',
    supportingText: 'The image didn\'t provide enough visual information for a useful screening result.',
    condition: 'Insufficient focal clarity or lighting',
    confidenceLabel: 'Image is uncertain',
    findings: [
      'Insufficient focal sharpness across brood cells',
      'Cell depth and cappings could not be resolved reliably'
    ],
    whatItMeans:
      'Camera shake or suboptimal lighting prevented the screening model from identifying individual pupal cappings.',
    whatToDoNext: [
      'Retake the frame holding the camera steady.',
      'Ensure natural sunlight shines over your shoulder into the comb face.'
    ],
    showLocalization: false
  },
  STATE_D_OUT_OF_SCOPE: {
    stateId: 'STATE_D_OUT_OF_SCOPE',
    resultType: 'OUT_OF_SCOPE',
    severity: 'unclear',
    title: 'This image can\'t be assessed',
    supportingText: 'The captured frame isn\'t suitable for the current screening model.',
    condition: 'No active brood comb detected',
    confidenceLabel: 'Outside scope',
    findings: [
      'Frame contains honey storage or wooden frames without brood cells'
    ],
    whatItMeans:
      'The screening model is trained specifically on capped worker brood comb. Honey supers or empty foundations are outside the assessment scope.',
    whatToDoNext: [
      'Select a central brood comb frame containing worker pupae cappings.',
      'Position a frame from the brood chamber containing eggs, larvae, or capped brood.'
    ],
    showLocalization: false
  },
  STATE_E_ANALYSIS_FAILED: {
    stateId: 'STATE_E_ANALYSIS_FAILED',
    resultType: 'ANALYSIS_FAILED',
    severity: 'critical',
    title: 'We couldn\'t complete the scan',
    supportingText: 'Your image was captured, but the analysis could not be completed.',
    condition: 'Analysis service timeout',
    confidenceLabel: 'Incomplete',
    findings: [
      'Inspection image captured and cached safely on device',
      'ML screening service was unreachable or connection timed out'
    ],
    whatItMeans:
      'The captured image evidence was preserved, but the screening interpretation service did not respond.',
    whatToDoNext: [
      'Try the analysis again with current cached image.',
      'Save the captured image now to attach to the hive history and review later.'
    ],
    showLocalization: false
  },
  STATE_F_MULTIPLE_ISSUES: {
    stateId: 'STATE_F_MULTIPLE_ISSUES',
    resultType: 'MULTIPLE_POSSIBLE_ISSUES',
    severity: 'attention',
    title: 'Possible signs detected',
    supportingText: 'The image contains visual indicators associated with multiple supported conditions.',
    condition: 'Multiple possible patterns flagged',
    confidenceLabel: 'Multiple candidate matches',
    candidates: [
      {
        name: 'Possible American foulbrood signs',
        reason: 'Perforated and sunken cell cappings in lower comb region',
        nextStep: 'Check for ropy larval remains using toothpick test'
      },
      {
        name: 'Possible Varroa-related brood stress',
        reason: 'Chewed-down worker pupae and spotty emergence cluster',
        nextStep: 'Conduct mite count survey across 300 nurse bees'
      }
    ],
    findings: [
      'Scattered empty cells throughout capped brood pattern',
      'Isolated punctured cappings without uniform emergence'
    ],
    whatItMeans:
      'Visual features overlap across more than one brood irregularity. The system presents candidate patterns without declaring an artificial single diagnosis.',
    whatToDoNext: [
      'Conduct a thorough hands-on inspection of adjacent brood frames.',
      'Perform an alcohol wash or sugar roll to check Varroa mite load.',
      'Confirm important findings before applying treatments or chemical management.'
    ],
    showLocalization: true,
    localizationBox: { top: '30%', left: '25%', width: '48%', height: '42%' }
  }
};

export const InspectionResultView = ({
  isOpen = true,
  onClose,
  hive: propHive,
  inspectionData,
  onRetake,
  onScanAnother
}) => {
  const {
    hives,
    saveScanInspection,
    showToast,
    setSelectedHiveId,
    setActiveTab,
    openInspectionSaved
  } = useAppState();

  // Resolve associated hive
  const currentHive = propHive ||
    hives.find((h) => h.id === inspectionData?.hiveId) ||
    hives[0] || {
      id: 'hive-02',
      name: 'Meadow Sweet',
      code: '02',
      temp: 33.9,
      humidity: 62,
      lastInspected: 'Today, 08:52'
    };

  // State Management
  const [activePresetKey, setActivePresetKey] = useState(
    inspectionData?.presetKey || 'STATE_A_POSSIBLE_AFB'
  );
  const activeResult = SCREENING_RESULT_PRESETS[activePresetKey] || SCREENING_RESULT_PRESETS.STATE_A_POSSIBLE_AFB;

  const [activeImage, setActiveImage] = useState(
    inspectionData?.imageUrl || currentHive?.inspectionImage || '/hive-inspection-sample.jpg'
  );

  const [observerNote, setObserverNote] = useState(inspectionData?.observerNotes || '');
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showJuryDrawer, setShowJuryDrawer] = useState(false);

  // Duplicate Save Protection (Section 21 & 22)
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Metadata Generation (Section 17 & 19)
  const metadata = useMemo(() => {
    const ts = inspectionData?.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      scanId: inspectionData?.scanId || `HC-SCAN-${Date.now().toString().slice(-6)}`,
      imageId: inspectionData?.imageId || `HC-IMG-7821`,
      analysisId: inspectionData?.analysisId || `HC-ANL-4091`,
      modelVersion: 'HoneyChain-Vision-v1.4 (Field Screening)',
      deviceId: `ESP32-HC-${currentHive.code || '02'}`,
      resolution: '1600 × 1200 (UXGA JPEG)',
      pipelineStatus: 'Anchored & Verifiable',
      capturedTime: `Today · ${ts}`,
      isoTime: new Date().toISOString()
    };
  }, [inspectionData, currentHive]);

  // Copy Helper
  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Save Inspection Action (Section 21)
  const handleSaveInspection = () => {
    if (isSaving || isSaved) return; // Idempotency protection
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);

      const isConcerning = activeResult.severity === 'attention';
      const isHealthy = activeResult.severity === 'healthy';

      saveScanInspection({
        hiveId: currentHive.id,
        imageUrl: activeImage,
        scanResult: {
          type: isConcerning ? 'concerning' : isHealthy ? 'healthy' : 'unclear',
          title: activeResult.title,
          condition: activeResult.condition,
          findings: activeResult.findings || []
        },
        notes: activeResult.condition,
        observerNotes: observerNote
      });

      showToast(`Inspection saved for ${currentHive.name}`);

      // Section 2: Seamless transition to Screen 20 (Inspection Saved / Hive History Update)
      if (openInspectionSaved) {
        if (onClose) onClose();
        openInspectionSaved({
          hiveId: currentHive.id,
          hive: currentHive,
          imageUrl: activeImage,
          preset: isConcerning ? 'ATTENTION' : 'HEALTHY',
          condition: activeResult.condition,
          title: activeResult.title,
          observerNote: observerNote,
          savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          capturedAt: metadata.capturedTime,
          isConcerning,
          isHealthy
        });
      }
    }, 900);
  };

  const handleReturnToHive = () => {
    if (onClose) onClose();
    if (setSelectedHiveId) setSelectedHiveId(currentHive.id);
    if (setActiveTab) setActiveTab('hives');
  };

  const handleReturnHome = () => {
    if (onClose) onClose();
    if (setSelectedHiveId) setSelectedHiveId(null);
    if (setActiveTab) setActiveTab('home');
  };

  if (!isOpen) return null;

  return (
    <div className="ir-screen-overlay animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="ir-page-title">
      <div className="ir-screen-container">
        {/* ─────────────────────────────────────────────────────────────
            1. SCREEN HEADER (Section 3)
        ───────────────────────────────────────────────────────────── */}
        <header className="ir-header">
          <button
            type="button"
            className="ir-back-btn"
            onClick={onClose || handleReturnToHive}
            aria-label="Back to hive"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="ir-header-titles">
            <h1 id="ir-page-title" className="ir-title">Inspection result</h1>
            <p className="ir-subtitle">
              Hive {currentHive.code || 'A-03'} · {currentHive.name}
            </p>
            <span className="ir-header-time">{metadata.capturedTime}</span>
          </div>

          <button
            type="button"
            className="ir-demo-toggle-btn"
            onClick={() => setShowJuryDrawer(!showJuryDrawer)}
            title="Demonstrate result states"
          >
            <Sliders size={15} />
            <span>Demo</span>
          </button>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            MAIN SCROLLABLE CONTENT (Hierarchy Levels 1 - 7)
        ───────────────────────────────────────────────────────────── */}
        <main className="ir-content-body">
          {/* LEVEL 1: RESULT HERO (Section 4 & 5) */}
          <section className="ir-hero-section">
            <div className={`ir-hero-card ${activeResult.severity}`}>
              <div className="ir-hero-badge-line">
                <span className={`ir-hero-dot ${activeResult.severity}`} />
                <span className="ir-hero-kicker">Hive {currentHive.code || 'A-03'} · Frame scan</span>
                <span className="ir-hero-conf-pill">{activeResult.confidenceLabel}</span>
              </div>

              <h2 className="ir-hero-main-title">{activeResult.title}</h2>
              <p className="ir-hero-supporting-text">{activeResult.supportingText}</p>

              {/* Possible Condition Section (Section 6) */}
              <div className="ir-condition-box">
                <span className="ir-condition-lbl">Screening observation</span>
                <strong className="ir-condition-val">{activeResult.condition}</strong>
                <small className="ir-condition-sub">
                  This is a screening result based on the captured image.
                </small>
              </div>
            </div>
          </section>

          {/* LEVEL 2: CAPTURED FRAME / EVIDENCE IMAGE (Section 7 & 8) */}
          <section className="ir-section">
            <div className="ir-section-header-row">
              <h3 className="ir-section-title">Captured frame</h3>
              <button
                type="button"
                className="ir-text-action-btn"
                onClick={() => setIsFullscreenImage(true)}
              >
                <Maximize2 size={13} />
                <span>Enlarge</span>
              </button>
            </div>

            <div
              className="ir-frame-viewer"
              onClick={() => setIsFullscreenImage(true)}
              role="button"
              tabIndex={0}
              aria-label="Captured frame evidence. Tap to inspect full size."
            >
              <img
                src={activeImage}
                alt={`Captured inspection comb frame from Hive ${currentHive.name}`}
                className="ir-frame-image"
              />

              {/* Region of Interest Annotation (Section 8: Only when supported) */}
              {activeResult.showLocalization && activeResult.localizationBox && (
                <div
                  className="ir-localization-overlay"
                  style={activeResult.localizationBox}
                  aria-label="Area to inspect"
                >
                  <span className="ir-loc-label">Area to inspect</span>
                </div>
              )}

              <div className="ir-frame-overlay-badge">
                <Camera size={13} />
                <span>Original evidence</span>
              </div>
            </div>
          </section>

          {/* LEVEL 3: WHAT WE NOTICED (Section 9 & 10) */}
          <section className="ir-section">
            <div className="ir-card">
              <h3 className="ir-card-heading">What we noticed</h3>
              <ul className="ir-findings-list">
                {activeResult.findings?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Multiple Candidate Conditions (Section 6 & 22) */}
          {activeResult.candidates && (
            <section className="ir-section">
              <div className="ir-card">
                <h3 className="ir-card-heading">Candidate conditions</h3>
                <div className="ir-candidates-list">
                  {activeResult.candidates.map((cand, i) => (
                    <div key={i} className="ir-candidate-row">
                      <strong className="ir-cand-title">• {cand.name}</strong>
                      <p className="ir-cand-reason">Flagged: {cand.reason}</p>
                      <span className="ir-cand-next">Next: {cand.nextStep}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* LEVEL 4: WHAT THIS MAY MEAN (Section 11) */}
          <section className="ir-section">
            <div className="ir-card">
              <h3 className="ir-card-heading">What this may mean</h3>
              <p className="ir-card-text">{activeResult.whatItMeans}</p>
            </div>
          </section>

          {/* LEVEL 4: WHAT TO DO NEXT (Section 12) */}
          <section className="ir-section">
            <div className="ir-card next-steps">
              <h3 className="ir-card-heading">What to do next</h3>
              <ul className="ir-next-steps-list">
                {activeResult.whatToDoNext?.map((stepItem, sIdx) => (
                  <li key={sIdx}>{stepItem}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* MANDATORY SCREENING AID SAFETY CALLOUT (Section 2) */}
          <section className="ir-section">
            <div className="ir-safety-box" role="note">
              <Info size={16} color="var(--color-primary-honey, #D99A24)" className="ir-safety-icon" />
              <p>
                <strong>Screening aid only:</strong> Image analysis is a decision-support tool, not a veterinary diagnosis. Confirm important findings through closer inspection or qualified professional assessment before treatment or management decisions.
              </p>
            </div>
          </section>

          {/* LEVEL 5: BEEKEEPER OBSERVATION (Section 15 & 16) */}
          <section className="ir-section">
            <div className="ir-card obs-card">
              <div className="ir-card-header-line">
                <span className="ir-card-meta-tag">Your observation</span>
                <small className="ir-card-provenance">Saved separately from screening</small>
              </div>
              <textarea
                className="ir-obs-textarea"
                rows={2}
                placeholder="Add anything you noticed (e.g. unusual activity, odor, brood appearance, queen observed)..."
                value={observerNote}
                onChange={(e) => setObserverNote(e.target.value)}
              />
            </div>
          </section>

          {/* COMPARISON WITH PREVIOUS SCANS (Section 26) */}
          <section className="ir-section">
            <div className="ir-expandable-card">
              <button
                type="button"
                className="ir-expand-trigger"
                onClick={() => setShowComparison(!showComparison)}
              >
                <div className="ir-trigger-left">
                  <History size={16} color="var(--color-warm-gray, #786D61)" />
                  <span>Compare with previous inspection</span>
                </div>
                {showComparison ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showComparison && (
                <div className="ir-comparison-panel animate-fade-in">
                  <div className="ir-comp-grid">
                    <div className="ir-comp-col">
                      <span className="ir-comp-lbl">This inspection (Today)</span>
                      <div className="ir-comp-media">
                        <img src={activeImage} alt="Current inspection comb" />
                      </div>
                      <small className="ir-comp-note">{activeResult.condition}</small>
                    </div>

                    <div className="ir-comp-col">
                      <span className="ir-comp-lbl">Previous (18 Sep)</span>
                      <div className="ir-comp-media">
                        <img src="/hive-inspection-sample.jpg" alt="Previous inspection comb" />
                      </div>
                      <small className="ir-comp-note">Routine checkup · Clean brood</small>
                    </div>
                  </div>
                  <p className="ir-comp-disclaimer">
                    Compare visible changes between inspections. Seasonal progression depends on weather, laying rate, and nectar flow.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* SENSOR TELEMETRY CONTEXT (Section 18) */}
          <section className="ir-section">
            <div className="ir-card sensor-card">
              <span className="ir-card-meta-tag">Hive conditions context</span>
              <div className="ir-sensor-values-row">
                <div className="ir-sensor-chip">
                  <Thermometer size={14} color="var(--color-primary-honey, #D99A24)" />
                  <span>{currentHive.temp ? `${currentHive.temp}°C` : '31.4°C'} Temperature</span>
                </div>
                <div className="ir-sensor-chip">
                  <Droplets size={14} color="var(--color-sage, #71845B)" />
                  <span>{currentHive.humidity ? `${currentHive.humidity}%` : '62%'} Humidity</span>
                </div>
                <div className="ir-sensor-chip">
                  <Activity size={14} color="var(--color-healthy, #4F7A52)" />
                  <span>Stable Activity</span>
                </div>
              </div>
              <small className="ir-sensor-note">
                Sensor readings provide environmental context and do not independently diagnose bee disease.
              </small>
            </div>
          </section>

          {/* COLLAPSED TECHNICAL DETAILS (Section 19 & 20) */}
          <section className="ir-section">
            <div className="ir-expandable-card">
              <button
                type="button"
                className="ir-expand-trigger"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              >
                <div className="ir-trigger-left">
                  <Lock size={15} color="var(--color-warm-gray, #786D61)" />
                  <span>{showTechnicalDetails ? 'Hide technical details' : 'View technical details'}</span>
                </div>
                {showTechnicalDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showTechnicalDetails && (
                <div className="ir-technical-panel animate-fade-in">
                  <div className="ir-tech-row">
                    <span>Scan ID</span>
                    <div className="ir-tech-val-group">
                      <code>{metadata.scanId}</code>
                      <button
                        type="button"
                        className="ir-copy-btn"
                        onClick={() => handleCopy(metadata.scanId, 'scanId')}
                      >
                        {copiedKey === 'scanId' ? <Check size={12} color="var(--color-healthy)" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="ir-tech-row">
                    <span>Image ID</span>
                    <code>{metadata.imageId}</code>
                  </div>

                  <div className="ir-tech-row">
                    <span>Analysis ID</span>
                    <code>{metadata.analysisId}</code>
                  </div>

                  <div className="ir-tech-row">
                    <span>Model version</span>
                    <span className="ir-tech-pill">{metadata.modelVersion}</span>
                  </div>

                  <div className="ir-tech-row">
                    <span>Hardware Device</span>
                    <code>{metadata.deviceId}</code>
                  </div>

                  <div className="ir-tech-row">
                    <span>Resolution</span>
                    <span>{metadata.resolution}</span>
                  </div>

                  <div className="ir-tech-row">
                    <span>Provenance Pipeline</span>
                    <span style={{ color: 'var(--color-healthy, #4F7A52)', fontWeight: 600 }}>
                      {metadata.pipelineStatus}
                    </span>
                  </div>

                  <div className="ir-tech-sanitized-banner">
                    <ShieldCheck size={13} color="var(--color-healthy, #4F7A52)" />
                    <span>Cryptographic audit: Internal keys, tokens, and storage secrets stripped.</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────
              SAVE / SUCCESS / CTAS (Section 13, 14, 21, 23)
          ───────────────────────────────────────────────────────── */}
          <section className="ir-actions-section">
            {isSaved ? (
              <div className="ir-saved-success-card animate-fade-in">
                <CheckCircle2 size={24} color="var(--color-healthy, #4F7A52)" />
                <div>
                  <strong className="ir-saved-title">Inspection saved</strong>
                  <p className="ir-saved-sub">Hive {currentHive.code || 'A-03'} history has been updated.</p>
                </div>
                <div className="ir-saved-btns-row">
                  <button type="button" className="btn btn-primary flex-1" onClick={handleReturnToHive}>
                    View hive
                  </button>
                  <button type="button" className="btn btn-secondary flex-1" onClick={handleReturnHome}>
                    Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <div className="ir-primary-cta-group">
                {activeResult.resultType === 'ANALYSIS_FAILED' ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => setActivePresetKey('STATE_A_POSSIBLE_AFB')}
                  >
                    <RotateCcw size={16} />
                    <span>Try analysis again</span>
                  </button>
                ) : activeResult.resultType === 'UNCLEAR' || activeResult.resultType === 'OUT_OF_SCOPE' ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={onRetake || onClose}
                  >
                    <RotateCcw size={16} />
                    <span>Retake frame</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={handleSaveInspection}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span>Saving inspection…</span>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Save inspection to Hive {currentHive.code || 'A-03'}</span>
                      </>
                    )}
                  </button>
                )}

                <div className="ir-secondary-actions-row">
                  <button
                    type="button"
                    className="btn btn-secondary flex-1"
                    onClick={onScanAnother || onRetake || onClose}
                  >
                    Scan another frame
                  </button>

                  <button
                    type="button"
                    className="btn-tertiary-link"
                    onClick={onClose || handleReturnToHive}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>

        {/* ─────────────────────────────────────────────────────────────
            FULLSCREEN ZOOM MODAL (Section 7)
        ───────────────────────────────────────────────────────────── */}
        {isFullscreenImage && (
          <div className="ir-fullscreen-modal animate-fade-in" onClick={() => setIsFullscreenImage(false)}>
            <div className="ir-fullscreen-head">
              <span>Captured frame evidence · Hive {currentHive.code || 'A-03'}</span>
              <button
                type="button"
                className="ir-fs-close"
                onClick={() => setIsFullscreenImage(false)}
                aria-label="Close fullscreen image"
              >
                <Minimize2 size={18} />
              </button>
            </div>
            <div className="ir-fs-image-wrap">
              <img src={activeImage} alt="Full resolution inspection comb" className="ir-fs-img" />
              {activeResult.showLocalization && activeResult.localizationBox && (
                <div className="ir-localization-overlay fs" style={activeResult.localizationBox}>
                  <span className="ir-loc-label">Area to inspect</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            JURY DEMO DRAWER (Section 41)
        ───────────────────────────────────────────────────────────── */}
        {showJuryDrawer && (
          <div className="ir-jury-drawer animate-fade-in">
            <div className="ir-jury-head">
              <strong>Jury / Inspection Result States (Screen 19)</strong>
              <button
                type="button"
                className="ir-jury-close-btn"
                onClick={() => setShowJuryDrawer(false)}
              >
                ✕
              </button>
            </div>

            <p className="ir-jury-desc">
              Switch across supported safety-first ML screening results:
            </p>

            <div className="ir-jury-buttons-grid">
              {Object.keys(SCREENING_RESULT_PRESETS).map((key) => {
                const preset = SCREENING_RESULT_PRESETS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    data-preset-id={key}
                    className={`ir-jury-chip ${activePresetKey === key ? 'active' : ''}`}
                    onClick={() => {
                      setActivePresetKey(key);
                      setIsSaved(false);
                      setShowJuryDrawer(false);
                    }}
                  >
                    <span>{preset.title}: {preset.condition}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STYLES (Strictly conforming to Section 4 color system)
        ───────────────────────────────────────────────────────────── */}
        <style>{`
          .ir-screen-overlay {
            position: fixed;
            inset: 0;
            background-color: rgba(52, 38, 27, 0.65);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 12px;
          }

          .ir-screen-container {
            background-color: var(--color-background, #FFF9EF);
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 20px;
            width: 100%;
            max-width: 440px;
            height: 94vh;
            max-height: 860px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 16px 40px rgba(52, 38, 27, 0.25);
            color: var(--color-deep-cocoa, #34261B);
            position: relative;
          }

          .ir-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            background-color: var(--color-soft-ivory, #FFFDF8);
            border-bottom: 1px solid var(--color-divider, #EDE2D1);
            flex-shrink: 0;
          }

          .ir-back-btn {
            background: none;
            border: none;
            padding: 6px;
            color: var(--color-deep-cocoa, #34261B);
            cursor: pointer;
            min-height: 44px;
            min-width: 44px;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13.5px;
            font-weight: 500;
          }

          .ir-header-titles {
            text-align: center;
            flex: 1;
            margin: 0 8px;
          }

          .ir-title {
            font-size: 16px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.01em;
          }

          .ir-subtitle {
            font-size: 12px;
            font-weight: 600;
            color: var(--color-primary-honey, #D99A24);
            margin: 1px 0 0 0;
          }

          .ir-header-time {
            display: block;
            font-size: 11px;
            color: var(--color-warm-gray, #786D61);
          }

          .ir-demo-toggle-btn {
            background: none;
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 8px;
            padding: 6px 8px;
            font-size: 11px;
            font-weight: 600;
            color: var(--color-warm-gray, #786D61);
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            min-height: 44px;
          }

          .ir-content-body {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          /* Result Hero (Section 4 & 5) */
          .ir-hero-card {
            background-color: var(--color-soft-ivory, #FFFDF8);
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 14px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .ir-hero-card.attention {
            border-left: 4px solid var(--color-attention, #D9822B);
          }

          .ir-hero-card.healthy {
            border-left: 4px solid var(--color-healthy, #4F7A52);
          }

          .ir-hero-card.unclear {
            border-left: 4px solid var(--color-warm-gray, #786D61);
          }

          .ir-hero-card.critical {
            border-left: 4px solid var(--color-critical, #B85450);
          }

          .ir-hero-badge-line {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
          }

          .ir-hero-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          .ir-hero-dot.attention { background-color: var(--color-attention, #D9822B); }
          .ir-hero-dot.healthy { background-color: var(--color-healthy, #4F7A52); }
          .ir-hero-dot.unclear { background-color: var(--color-warm-gray, #786D61); }
          .ir-hero-dot.critical { background-color: var(--color-critical, #B85450); }

          .ir-hero-kicker {
            font-weight: 600;
            color: var(--color-deep-cocoa, #34261B);
          }

          .ir-hero-conf-pill {
            margin-left: auto;
            font-size: 11px;
            font-weight: 600;
            color: var(--color-warm-gray, #786D61);
            background-color: #FAF4E9;
            padding: 2px 7px;
            border-radius: 4px;
          }

          .ir-hero-main-title {
            font-size: 18px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.01em;
          }

          .ir-hero-supporting-text {
            font-size: 13px;
            color: var(--color-warm-gray, #786D61);
            margin: 0;
            line-height: 1.45;
          }

          .ir-condition-box {
            background-color: #FAF4E9;
            border-radius: 10px;
            padding: 10px 12px;
            margin-top: 4px;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .ir-condition-lbl {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--color-warm-gray, #786D61);
          }

          .ir-condition-val {
            font-size: 14.5px;
            color: var(--color-deep-cocoa, #34261B);
          }

          .ir-condition-sub {
            font-size: 11px;
            color: var(--color-warm-gray, #786D61);
          }

          /* Sections & Cards */
          .ir-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .ir-section-header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .ir-section-title {
            font-size: 12.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--color-warm-gray, #786D61);
            margin: 0;
          }

          .ir-text-action-btn {
            background: none;
            border: none;
            font-size: 12px;
            font-weight: 600;
            color: var(--color-primary-honey, #D99A24);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 2px 4px;
          }

          /* Captured Frame Viewer (Section 7) */
          .ir-frame-viewer {
            position: relative;
            width: 100%;
            height: 180px;
            background-color: #2D241E;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid var(--color-divider, #EDE2D1);
            cursor: pointer;
          }

          .ir-frame-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .ir-localization-overlay {
            position: absolute;
            border: 2px dashed rgba(217, 154, 36, 0.95);
            background-color: rgba(217, 154, 36, 0.15);
            border-radius: 6px;
            pointer-events: none;
          }

          .ir-loc-label {
            position: absolute;
            top: -18px;
            left: 0;
            background-color: rgba(52, 38, 27, 0.85);
            color: #FFF;
            font-size: 10px;
            font-weight: 600;
            padding: 1px 6px;
            border-radius: 3px;
            white-space: nowrap;
          }

          .ir-frame-overlay-badge {
            position: absolute;
            bottom: 8px;
            right: 8px;
            background-color: rgba(52, 38, 27, 0.75);
            color: #FFF;
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .ir-card {
            background-color: var(--color-soft-ivory, #FFFDF8);
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 14px;
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .ir-card-heading {
            font-size: 13.5px;
            font-weight: 700;
            margin: 0;
            color: var(--color-deep-cocoa, #34261B);
          }

          .ir-findings-list,
          .ir-next-steps-list {
            margin: 0;
            padding-left: 18px;
            font-size: 12.5px;
            color: var(--color-deep-cocoa, #34261B);
            line-height: 1.45;
          }

          .ir-findings-list li,
          .ir-next-steps-list li {
            margin-bottom: 4px;
          }

          .ir-card-text {
            font-size: 12.5px;
            line-height: 1.45;
            color: var(--color-deep-cocoa, #34261B);
            margin: 0;
          }

          .ir-candidates-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .ir-candidate-row {
            font-size: 12.5px;
          }

          .ir-cand-title {
            display: block;
            margin-bottom: 2px;
          }

          .ir-cand-reason {
            margin: 0 0 2px 0;
            color: var(--color-warm-gray, #786D61);
          }

          .ir-cand-next {
            font-weight: 600;
            color: var(--color-primary-honey, #D99A24);
          }

          /* Safety Callout (Section 2) */
          .ir-safety-box {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 12px 14px;
            background-color: #FAF4E9;
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 12px;
            font-size: 12px;
            line-height: 1.45;
            color: var(--color-deep-cocoa, #34261B);
          }

          .ir-safety-box p {
            margin: 0;
          }

          .ir-safety-icon {
            flex-shrink: 0;
            margin-top: 1px;
          }

          /* Observation Card (Section 15 & 16) */
          .ir-card.obs-card {
            background-color: var(--color-soft-ivory, #FFFDF8);
          }

          .ir-card-header-line {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .ir-card-meta-tag {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--color-warm-gray, #786D61);
          }

          .ir-card-provenance {
            font-size: 11px;
            color: var(--color-warm-gray, #786D61);
          }

          .ir-obs-textarea {
            width: 100%;
            padding: 8px 10px;
            font-size: 12.5px;
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 8px;
            background-color: #FAF4E9;
            color: var(--color-deep-cocoa, #34261B);
            resize: none;
            box-sizing: border-box;
          }

          .ir-obs-textarea:focus {
            outline: none;
            border-color: var(--color-primary-honey, #D99A24);
          }

          /* Expandable comparison & technical panel (Section 19 & 26) */
          .ir-expandable-card {
            background-color: var(--color-soft-ivory, #FFFDF8);
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 12px;
            overflow: hidden;
          }

          .ir-expand-trigger {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 14px;
            background: none;
            border: none;
            font-size: 13px;
            font-weight: 600;
            color: var(--color-deep-cocoa, #34261B);
            cursor: pointer;
            min-height: 44px;
          }

          .ir-trigger-left {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .ir-comparison-panel {
            padding: 12px 14px;
            background-color: #FAF4E9;
            border-top: 1px solid var(--color-divider, #EDE2D1);
          }

          .ir-comp-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .ir-comp-col {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .ir-comp-lbl {
            font-size: 11px;
            font-weight: 600;
            color: var(--color-warm-gray, #786D61);
          }

          .ir-comp-media {
            width: 100%;
            height: 90px;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--color-divider, #EDE2D1);
          }

          .ir-comp-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .ir-comp-note {
            font-size: 11px;
            color: var(--color-deep-cocoa, #34261B);
          }

          .ir-comp-disclaimer {
            font-size: 11px;
            color: var(--color-warm-gray, #786D61);
            margin: 8px 0 0 0;
            line-height: 1.35;
          }

          /* Sensor Telemetry Context (Section 18) */
          .ir-card.sensor-card {
            background-color: var(--color-soft-ivory, #FFFDF8);
          }

          .ir-sensor-values-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .ir-sensor-chip {
            display: flex;
            align-items: center;
            gap: 6px;
            background-color: #FAF4E9;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            color: var(--color-deep-cocoa, #34261B);
          }

          .ir-sensor-note {
            font-size: 11px;
            color: var(--color-warm-gray, #786D61);
          }

          /* Technical Details Panel (Section 19) */
          .ir-technical-panel {
            padding: 12px 14px;
            background-color: #2D241E;
            color: #FAF4E9;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 11.5px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .ir-tech-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 4px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }

          .ir-tech-val-group {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .ir-tech-row code {
            color: #D99A24;
          }

          .ir-copy-btn {
            background: none;
            border: none;
            color: #B5A89B;
            cursor: pointer;
            padding: 4px;
          }

          .ir-tech-pill {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
          }

          .ir-tech-sanitized-banner {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 6px;
            font-size: 10.5px;
            color: #8ED094;
          }

          /* Primary CTA Actions (Section 13, 14, 21, 23) */
          .ir-actions-section {
            margin-top: auto;
            padding-top: 6px;
          }

          .ir-primary-cta-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .ir-secondary-actions-row {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .btn-tertiary-link {
            background: none;
            border: none;
            font-size: 13px;
            font-weight: 600;
            color: var(--color-warm-gray, #786D61);
            cursor: pointer;
            padding: 8px 12px;
            min-height: 44px;
          }

          .ir-saved-success-card {
            background-color: var(--color-healthy-tint, rgba(79, 122, 82, 0.12));
            border: 1px solid rgba(79, 122, 82, 0.3);
            border-radius: 14px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 8px;
          }

          .ir-saved-title {
            font-size: 16px;
            color: var(--color-healthy, #4F7A52);
          }

          .ir-saved-sub {
            font-size: 12.5px;
            color: var(--color-deep-cocoa, #34261B);
            margin: 2px 0 8px 0;
          }

          .ir-saved-btns-row {
            display: flex;
            gap: 10px;
            width: 100%;
          }

          /* Fullscreen image viewer (Section 7) */
          .ir-fullscreen-modal {
            position: fixed;
            inset: 0;
            background-color: rgba(20, 14, 10, 0.95);
            z-index: 11000;
            display: flex;
            flex-direction: column;
            padding: 16px;
          }

          .ir-fullscreen-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #FFF;
            font-size: 13px;
            font-weight: 500;
            padding-bottom: 12px;
          }

          .ir-fs-close {
            background: none;
            border: none;
            color: #FFF;
            cursor: pointer;
            padding: 6px;
          }

          .ir-fs-image-wrap {
            flex: 1;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .ir-fs-img {
            max-width: 100%;
            max-height: 80vh;
            object-fit: contain;
            border-radius: 8px;
          }

          /* Jury Demo Drawer (Section 41) */
          .ir-jury-drawer {
            position: absolute;
            bottom: 0;
            inset-inline: 0;
            background-color: #2D241E;
            color: #FAF4E9;
            border-top: 1px solid var(--color-primary-honey, #D99A24);
            padding: 14px 16px;
            z-index: 50;
            max-height: 50%;
            overflow-y: auto;
          }

          .ir-jury-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: var(--color-primary-honey, #D99A24);
            margin-bottom: 6px;
          }

          .ir-jury-close-btn {
            background: none;
            border: none;
            color: #FAF4E9;
            font-size: 14px;
            cursor: pointer;
            padding: 4px;
          }

          .ir-jury-desc {
            font-size: 11.5px;
            color: #B5A89B;
            margin: 0 0 10px 0;
          }

          .ir-jury-buttons-grid {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .ir-jury-chip {
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #E2D9CE;
            padding: 8px 10px;
            border-radius: 8px;
            font-size: 11.5px;
            text-align: left;
            cursor: pointer;
          }

          .ir-jury-chip.active {
            background-color: var(--color-primary-honey, #D99A24);
            color: #34261B;
            font-weight: 700;
            border-color: var(--color-primary-honey, #D99A24);
          }

          .animate-fade-in {
            animation: fadeIn 0.2s ease-out forwards;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
};
