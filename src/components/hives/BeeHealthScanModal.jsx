import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Camera,
  X,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Info,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Sliders,
  Image as ImageIcon,
  RotateCcw,
  Check,
  Maximize2,
  Lock,
  WifiOff,
  HelpCircle
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

// Model-supported conditions (Strictly adhering to Section 2 & 18: No fabricated diseases)
export const SUPPORTED_SCREENING_CONDITIONS = [
  {
    id: 'sample-afb',
    key: 'afb',
    name: 'American foulbrood visual signs',
    label: 'Comb with spotty pattern (Possible AFB signs)',
    url: '/hive-inspection-sample.jpg',
    quality: 'good',
    confidenceLabel: 'Strong visual match',
    result: {
      type: 'POSSIBLE_ISSUE',
      severity: 'attention',
      title: 'Possible signs detected',
      condition: 'Possible American foulbrood signs',
      findings: [
        'Irregular brood pattern with scattered empty cells',
        'Sunken or punctured capped cells on frame center',
        'Visual patterns associated with bacterial brood condition'
      ],
      whatToLookFor: 'Abnormal brood pattern, sunken or punctured cappings, and darkened cell contents.',
      whatToDoNext: 'Inspect the surrounding brood area closely and record your observations. Confirm important findings through closer inspection or qualified professional assessment before treatment.'
    }
  },
  {
    id: 'sample-healthy',
    key: 'healthy',
    name: 'Healthy brood pattern',
    label: 'Healthy contiguous brood comb',
    url: '/hive-inspection-sample.jpg',
    quality: 'good',
    confidenceLabel: 'Strong visual match',
    result: {
      type: 'NO_CONCERNING_SIGNS',
      severity: 'healthy',
      title: 'No concerning signs detected',
      condition: 'Healthy brood pattern',
      findings: [
        'Solid, contiguous worker pupal distribution',
        'Clean, convex wax cappings',
        'No visible capping puncture, depression, or spotting'
      ],
      whatToLookFor: 'Continue regular visual monitoring during warm foraging weather.',
      whatToDoNext: 'Continue normal hive monitoring and record any observations you notice.'
    }
  },
  {
    id: 'sample-varroa',
    key: 'varroa',
    name: 'Varroa-related visual signs',
    label: 'Comb with Varroa-related visual indicators',
    url: '/hive-inspection-sample.jpg',
    quality: 'good',
    confidenceLabel: 'Some signs match',
    result: {
      type: 'POSSIBLE_ISSUE',
      severity: 'attention',
      title: 'Possible signs detected',
      condition: 'Possible Varroa-related visual signs',
      findings: [
        'Perforated cell cappings in central brood cluster',
        'Chewed-down pupal heads visible in scattered cells',
        'Visual indicators associated with parasitic mite stress'
      ],
      whatToLookFor: 'Perform a standard alcohol wash or sugar roll to measure current mite count per 300 bees.',
      whatToDoNext: 'Check seasonal mite threshold level before selecting appropriate management strategy.'
    }
  },
  {
    id: 'sample-multiple',
    key: 'multiple',
    name: 'Multiple candidate conditions',
    label: 'Mixed indicators (Brood irregularity & mite signs)',
    url: '/hive-inspection-sample.jpg',
    quality: 'good',
    confidenceLabel: 'Some signs match',
    result: {
      type: 'MULTIPLE_POSSIBLE_ISSUES',
      severity: 'attention',
      title: 'Possible signs detected',
      condition: 'Multiple possible issues flagged',
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
      whatToLookFor: 'Inspect multiple brood combs across the brood nest to determine if pattern is localized.',
      whatToDoNext: 'Conduct thorough hands-on inspection. Confirm findings before applying treatments.'
    }
  },
  {
    id: 'sample-unclear',
    key: 'unclear',
    name: 'Unclear / Low Information Frame',
    label: 'Blurry or poorly illuminated frame',
    url: '/hive-inspection-sample.jpg',
    quality: 'blurry',
    confidenceLabel: 'Image is uncertain',
    result: {
      type: 'UNCLEAR_IMAGE',
      severity: 'unclear',
      title: 'We couldn’t determine this from the image',
      condition: 'Image unclear or insufficient detail',
      findings: [
        'Insufficient focal sharpness across brood cells',
        'Cell depth and cappings could not be resolved reliably'
      ],
      whatToLookFor: 'A steadier frame capture with clear natural sunlight over the shoulder.',
      whatToDoNext: 'Capture another frame holding the camera steadier.'
    }
  },
  {
    id: 'sample-outofscope',
    key: 'outofscope',
    name: 'Out of scope frame',
    label: 'Honey super / wooden hardware only',
    url: '/hive-inspection-sample.jpg',
    quality: 'good',
    confidenceLabel: 'Outside scope',
    result: {
      type: 'OUT_OF_SCOPE',
      severity: 'unclear',
      title: 'This image is outside the supported analysis scope',
      condition: 'No active brood comb detected',
      findings: [
        'Frame contains honey storage or wooden bars without brood cells'
      ],
      whatToLookFor: 'Select a central brood comb frame containing worker pupae cappings.',
      whatToDoNext: 'Position a frame from the brood chamber containing eggs, larvae, or capped brood.'
    }
  }
];

export const BeeHealthScanModal = ({ isOpen, onClose, targetHiveId }) => {
  const {
    hives,
    saveScanInspection,
    showToast,
    canPerform,
    ACTION_PERMISSIONS,
    isOnline,
    openInspectionResult
  } = useAppState();

  // Authoritative permission check (Section 29)
  const isAuthorized = canPerform
    ? canPerform(ACTION_PERMISSIONS?.HEALTH_SCAN_CREATE || 'HEALTH_SCAN_CREATE')
    : true;

  const activeHives = useMemo(() => hives.filter((h) => !h.isArchived), [hives]);
  const [selectedHiveId, setSelectedHiveId] = useState(targetHiveId || activeHives[0]?.id || '');

  // Master UI Flow Steps:
  // 'permission' | 'capture' | 'capturing' | 'validation' | 'review' | 'analyzing' | 'result' | 'saved'
  const [step, setStep] = useState('capture');

  // Connection & Camera States (Section 10)
  // 'ready' | 'connecting' | 'unavailable' | 'offline' | 'timeout'
  const [cameraState, setCameraState] = useState('ready');

  // Camera Guidance Cue (Section 7)
  const [guidanceCue, setGuidanceCue] = useState('Position the brood frame inside the guide');

  // Quality Validation Result (Section 13)
  // 'good' | 'dark' | 'blurry' | 'no_frame' | 'unsupported'
  const [qualityStatus, setQualityStatus] = useState('good');

  // Active Frame & ML Model Target
  const [selectedSample, setSelectedSample] = useState(SUPPORTED_SCREENING_CONDITIONS[0]);
  const [customImage, setCustomImage] = useState(null);
  const [observerNote, setObserverNote] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isTipsExpanded, setIsTipsExpanded] = useState(false);
  const [showJuryDrawer, setShowJuryDrawer] = useState(false);

  // Capture debouncing & idempotency guard (Section 11)
  const [isCapturing, setIsCapturing] = useState(false);
  const captureLockRef = useRef(false);

  // Video / WebRTC Stream Ref
  const videoRef = useRef(null);
  const [hasWebcamStream, setHasWebcamStream] = useState(false);

  // Sync selectedHiveId if targetHiveId changes
  useEffect(() => {
    if (targetHiveId) {
      setSelectedHiveId(targetHiveId);
    } else if (activeHives.length > 0 && !selectedHiveId) {
      setSelectedHiveId(activeHives[0].id);
    }
  }, [targetHiveId, activeHives]);

  // Contextual guidance rotation during capture view
  useEffect(() => {
    if (step !== 'capture' || cameraState !== 'ready') return;
    const cues = [
      'Position the brood frame inside the guide',
      'Hold steady and keep the frame well lit',
      'Keep capped brood area centered in viewfinder'
    ];
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % cues.length;
      setGuidanceCue(cues[idx]);
    }, 4000);
    return () => clearInterval(timer);
  }, [step, cameraState]);

  if (!isOpen) return null;

  const currentHive = activeHives.find((h) => h.id === selectedHiveId) || activeHives[0] || {
    id: 'hive-03',
    name: 'Hive A-03',
    code: 'A-03',
    temp: 31.4,
    humidity: 68
  };

  const activeImage = customImage || selectedSample.url;
  const currentResult = selectedSample.result;

  // ─────────────────────────────────────────────────────────────
  // 1. CAPTURE ACTION (Section 11 & 12)
  // ─────────────────────────────────────────────────────────────
  const handleTriggerCapture = () => {
    if (captureLockRef.current || isCapturing) return; // Prevent duplicate taps
    captureLockRef.current = true;
    setIsCapturing(true);
    setStep('capturing');

    // Simulate explicit one-shot capture request (Section 9)
    setTimeout(() => {
      setIsCapturing(false);
      captureLockRef.current = false;

      // Determine quality based on sample or custom
      if (selectedSample.quality === 'blurry') {
        setQualityStatus('blurry');
      } else {
        setQualityStatus('good');
      }
      setStep('validation');
    }, 1100);
  };

  // ─────────────────────────────────────────────────────────────
  // 2. QUALITY VALIDATION & REVIEW (Section 13 & 14)
  // ─────────────────────────────────────────────────────────────
  const handleProceedToReview = () => {
    setStep('review');
  };

  const handleStartAnalysis = () => {
    // Check if offline (Section 30)
    if (!isOnline) {
      showToast('Image saved offline • Analysis will sync when connected');
      setStep('result');
      return;
    }

    setStep('analyzing');
    setTimeout(() => {
      onClose();
      const presetMap = {
        afb: 'STATE_A_POSSIBLE_AFB',
        healthy: 'STATE_B_NO_CONCERNING_SIGNS',
        unclear: 'STATE_C_UNCLEAR',
        outofscope: 'STATE_D_OUT_OF_SCOPE',
        varroa: 'STATE_A_POSSIBLE_VARROA',
        multiple: 'STATE_F_MULTIPLE_ISSUES'
      };
      const presetKey = presetMap[selectedSample.key] || 'STATE_A_POSSIBLE_AFB';
      openInspectionResult({
        hiveId: currentHive.id,
        hive: currentHive,
        imageUrl: activeImage,
        presetKey,
        findings: currentResult.findings,
        whatItMeans: currentResult.whatToLookFor,
        whatToDoNext: currentResult.whatToDoNext,
        observerNotes: observerNote
      });
    }, 1800);
  };

  // ─────────────────────────────────────────────────────────────
  // 3. RETAKE ACTION
  // ─────────────────────────────────────────────────────────────
  const handleRetake = () => {
    setStep('capture');
    setCustomImage(null);
    setQualityStatus('good');
    captureLockRef.current = false;
  };

  // ─────────────────────────────────────────────────────────────
  // 4. SAVE INSPECTION (Section 24)
  // ─────────────────────────────────────────────────────────────
  const handleSaveInspection = () => {
    if (!currentHive) return;

    saveScanInspection({
      hiveId: currentHive.id,
      imageUrl: activeImage,
      scanResult: {
        type: currentResult.severity === 'attention' ? 'concerning' : currentResult.severity === 'healthy' ? 'healthy' : 'unclear',
        title: currentResult.title,
        condition: currentResult.condition,
        findings: currentResult.findings || []
      },
      notes: currentResult.condition,
      observerNotes: observerNote
    });

    setStep('saved');
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  // Custom File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImage(url);
      setQualityStatus('good');
      setStep('validation');
    }
  };

  return (
    <div className="bhs-overlay animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="bhs-title">
      <div className="bhs-viewport-shell" onClick={(e) => e.stopPropagation()}>
        {/* ─────────────────────────────────────────────────────────────
            HEADER (Section 5)
        ───────────────────────────────────────────────────────────── */}
        <header className="bhs-screen-header">
          <button
            type="button"
            className="bhs-back-btn"
            onClick={step === 'result' ? handleRetake : onClose}
            aria-label="Back or cancel"
          >
            {step === 'result' ? <ArrowLeft size={20} /> : <X size={20} />}
          </button>

          <div className="bhs-header-titles">
            <h1 id="bhs-title" className="bhs-main-title">
              {step === 'capture' && 'Scan a frame'}
              {step === 'capturing' && 'Capturing frame…'}
              {step === 'validation' && 'Check image quality'}
              {step === 'review' && 'Review frame'}
              {step === 'analyzing' && 'Checking this frame'}
              {step === 'result' && 'Screening result'}
              {step === 'saved' && 'Inspection saved'}
              {step === 'permission' && 'Camera access'}
            </h1>
            <span className="bhs-hive-context">
              Hive {currentHive.code || 'A-03'} · {currentHive.name}
            </span>
          </div>

          <button
            type="button"
            className="bhs-jury-toggle-btn"
            onClick={() => setShowJuryDrawer(!showJuryDrawer)}
            title="Demonstration state switcher"
          >
            <Sliders size={16} />
            <span>Demo</span>
          </button>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            SECURITY / AUTHORIZATION BLOCK (Section 29)
        ───────────────────────────────────────────────────────────── */}
        {!isAuthorized ? (
          <div className="bhs-unauthorized-card">
            <ShieldAlert size={32} color="var(--color-critical, #B85450)" />
            <h3>Permission required</h3>
            <p>
              Your workspace profile requires the <code>HEALTH_SCAN_CREATE</code> permission to initiate frame health scans.
            </p>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Return to hives
            </button>
          </div>
        ) : (
          <main className="bhs-body-scroll">
            {/* ─────────────────────────────────────────────────────────
                STEP: CAMERA PERMISSION DENIED (Section 8)
            ───────────────────────────────────────────────────────── */}
            {step === 'permission' && (
              <div className="bhs-permission-card animate-fade-in">
                <Camera size={36} color="var(--color-primary-honey, #D99A24)" />
                <h2 className="bhs-perm-title">Camera access needed</h2>
                <p className="bhs-perm-desc">
                  HoneyChain needs camera access to capture a brood frame for health screening. Images are stored securely with this colony’s history.
                </p>
                <div className="bhs-perm-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => setStep('capture')}
                  >
                    Allow camera
                  </button>
                  <label className="btn btn-secondary btn-block bhs-file-btn">
                    <span>Choose from gallery</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                STEP: CAMERA VIEWFINDER & CAPTURE (Section 6, 7, 9, 10, 11)
            ───────────────────────────────────────────────────────── */}
            {(step === 'capture' || step === 'capturing') && (
              <div className="bhs-capture-view animate-fade-in">
                {/* Connection Status Pill (Section 10) */}
                <div className="bhs-conn-bar">
                  {cameraState === 'ready' && (
                    <span className="bhs-conn-pill ready">
                      <span className="bhs-dot green" /> Camera ready
                    </span>
                  )}
                  {cameraState === 'connecting' && (
                    <span className="bhs-conn-pill connecting">
                      <RefreshCw size={11} className="spin-icon" /> Connecting to camera…
                    </span>
                  )}
                  {cameraState === 'unavailable' && (
                    <span className="bhs-conn-pill unavailable">
                      <AlertTriangle size={12} color="#D9822B" /> Camera unavailable
                    </span>
                  )}
                  {cameraState === 'offline' && (
                    <span className="bhs-conn-pill offline">
                      <WifiOff size={12} color="#B85450" /> Camera offline
                    </span>
                  )}
                  {cameraState === 'timeout' && (
                    <span className="bhs-conn-pill timeout">
                      <AlertCircle size={12} color="#B85450" /> Camera timed out
                    </span>
                  )}
                </div>

                {/* Camera Viewfinder with Realistic Physical Frame Guide (Section 6) */}
                <div className="bhs-viewfinder-frame">
                  <img
                    src={activeImage}
                    alt="Physical honeybee brood frame viewfinder"
                    className="bhs-viewfinder-image"
                  />

                  {/* Clean Physical Frame Guide (No sci-fi glow/lasers) */}
                  <div className="bhs-frame-reticle" aria-hidden="true">
                    <div className="bhs-corner-bracket top-left" />
                    <div className="bhs-corner-bracket top-right" />
                    <div className="bhs-corner-bracket bottom-left" />
                    <div className="bhs-corner-bracket bottom-right" />
                    <div className="bhs-frame-center-hint">
                      <span>Brood comb area</span>
                    </div>
                  </div>

                  {/* Contextual Guidance Pill (Section 7) */}
                  <div className="bhs-guidance-pill" role="status">
                    <span>{guidanceCue}</span>
                  </div>

                  {/* Capturing Overlay (Section 12) */}
                  {step === 'capturing' && (
                    <div className="bhs-capturing-overlay">
                      <div className="bhs-capture-shutter-flash" />
                      <div className="bhs-capture-status-box">
                        <RefreshCw size={18} className="spin-icon" color="#FFF" />
                        <strong>Capturing frame…</strong>
                        <span>Checking image clarity</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Architecture Principle Callout (Section 9) */}
                <p className="bhs-capture-subtext">
                  Single-frame on-demand capture. Hold the camera steady in natural daylight.
                </p>

                {/* Shutter Button & Direct Gallery Control (Section 11) */}
                <div className="bhs-shutter-container">
                  <button
                    type="button"
                    className="bhs-shutter-button"
                    onClick={handleTriggerCapture}
                    disabled={cameraState !== 'ready' || isCapturing}
                    aria-label="Capture frame"
                  >
                    <div className="bhs-shutter-inner">
                      <Camera size={26} color="#FFF" />
                    </div>
                  </button>

                  <div className="bhs-shutter-alt-row">
                    <label className="bhs-gallery-link">
                      <ImageIcon size={15} />
                      <span>Choose from gallery</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                STEP: QUALITY VALIDATION (Section 13)
            ───────────────────────────────────────────────────────── */}
            {step === 'validation' && (
              <div className="bhs-validation-view animate-fade-in">
                <div className="bhs-preview-container">
                  <img src={activeImage} alt="Captured frame" className="bhs-preview-image" />
                </div>

                {qualityStatus === 'good' && (
                  <div className="bhs-quality-card good">
                    <CheckCircle2 size={18} color="var(--color-healthy, #4F7A52)" />
                    <div>
                      <strong className="bhs-q-title">Image looks ready</strong>
                      <p className="bhs-q-desc">The brood area is well lit and sharply in focus.</p>
                    </div>
                  </div>
                )}

                {qualityStatus === 'dark' && (
                  <div className="bhs-quality-card warning">
                    <AlertTriangle size={18} color="var(--color-attention, #D9822B)" />
                    <div>
                      <strong className="bhs-q-title">The frame is too dark to inspect clearly</strong>
                      <p className="bhs-q-desc">Try positioning the frame with natural sunlight behind your shoulder.</p>
                    </div>
                  </div>
                )}

                {qualityStatus === 'blurry' && (
                  <div className="bhs-quality-card warning">
                    <AlertTriangle size={18} color="var(--color-attention, #D9822B)" />
                    <div>
                      <strong className="bhs-q-title">The image is too blurry</strong>
                      <p className="bhs-q-desc">Rest your elbows or brace against the hive body to hold steady.</p>
                    </div>
                  </div>
                )}

                {qualityStatus === 'no_frame' && (
                  <div className="bhs-quality-card warning">
                    <AlertCircle size={18} color="var(--color-critical, #B85450)" />
                    <div>
                      <strong className="bhs-q-title">We couldn't clearly see the frame</strong>
                      <p className="bhs-q-desc">Make sure the physical comb is centered within the guide brackets.</p>
                    </div>
                  </div>
                )}

                <div className="bhs-cta-row">
                  {qualityStatus === 'good' ? (
                    <>
                      <button type="button" className="btn btn-secondary" onClick={handleRetake}>
                        Retake
                      </button>
                      <button type="button" className="btn btn-primary flex-1" onClick={handleProceedToReview}>
                        <span>Review frame</span>
                        <ArrowRight size={15} />
                      </button>
                    </>
                  ) : (
                    <button type="button" className="btn btn-primary btn-block" onClick={handleRetake}>
                      <RotateCcw size={15} />
                      <span>Retake frame</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                STEP: REVIEW SCREEN (Section 14 & 15)
            ───────────────────────────────────────────────────────── */}
            {step === 'review' && (
              <div className="bhs-review-view animate-fade-in">
                <div className="bhs-review-image-frame" onClick={() => setIsZoomed(!isZoomed)}>
                  <img
                    src={activeImage}
                    alt="Captured brood comb preview"
                    className={`bhs-review-image ${isZoomed ? 'zoomed' : ''}`}
                  />
                  <div className="bhs-zoom-badge">
                    <Maximize2 size={13} />
                    <span>{isZoomed ? 'Tap to fit' : 'Tap to zoom'}</span>
                  </div>
                </div>

                <div className="bhs-review-prompt-card">
                  <h3 className="bhs-review-heading">Does the frame look clear enough to inspect?</h3>
                  <p className="bhs-review-sub">
                    Verify that worker pupae cappings and brood comb cells are distinct before submitting.
                  </p>
                </div>

                <div className="bhs-cta-row">
                  <button type="button" className="btn btn-secondary" onClick={handleRetake}>
                    Retake
                  </button>
                  <button type="button" className="btn btn-primary flex-1" onClick={handleStartAnalysis}>
                    <span>Analyze frame</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                STEP: ANALYSIS PROGRESS (Section 16 & 17)
            ───────────────────────────────────────────────────────── */}
            {step === 'analyzing' && (
              <div className="bhs-analyzing-view animate-fade-in">
                <div className="bhs-analyzing-icon-ring">
                  <div className="bhs-analyzing-spinner" />
                  <Camera size={26} color="var(--color-primary-honey, #D99A24)" />
                </div>
                <h2 className="bhs-analyzing-title">Checking this frame</h2>
                <p className="bhs-analyzing-desc">
                  We're looking for visual signs that may need attention.
                </p>
                <span className="bhs-analyzing-note">
                  Screening against validated honeybee brood conditions…
                </span>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                STEP: RESULT SCREEN (Section 2, 18, 19, 20, 21, 22, 23)
            ───────────────────────────────────────────────────────── */}
            {step === 'result' && (
              <div className="bhs-result-view animate-fade-in">
                {/* Result Image Header */}
                <div className="bhs-result-media-card">
                  <img src={activeImage} alt="Analyzed frame" className="bhs-result-img" />
                  <div className="bhs-result-media-overlay">
                    <span>Hive {currentHive.code || 'A-03'} · Inspection Today</span>
                  </div>
                </div>

                {/* Primary Result Banner */}
                <div className={`bhs-result-card ${currentResult.severity}`}>
                  <div className="bhs-res-head">
                    <span className={`bhs-res-indicator ${currentResult.severity}`} />
                    <strong className="bhs-res-title">{currentResult.title}</strong>
                    <span className="bhs-confidence-tag">{selectedSample.confidenceLabel}</span>
                  </div>

                  <h3 className="bhs-condition-title">{currentResult.condition}</h3>

                  {/* Multiple Candidate Conditions (Section 22) */}
                  {currentResult.candidates && (
                    <div className="bhs-candidates-box">
                      <span className="bhs-box-label">Candidate visual patterns:</span>
                      <div className="bhs-candidates-list">
                        {currentResult.candidates.map((c, i) => (
                          <div key={i} className="bhs-candidate-item">
                            <strong className="bhs-cand-name">• {c.name}</strong>
                            <p className="bhs-cand-reason">Flagged: {c.reason}</p>
                            <span className="bhs-cand-next">Next: {c.nextStep}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Plain Language Observations: What we noticed (Section 21) */}
                  {currentResult.findings?.length > 0 && (
                    <div className="bhs-findings-section">
                      <span className="bhs-box-label">What we noticed:</span>
                      <ul className="bhs-findings-list">
                        {currentResult.findings.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What to check / do next (Section 21) */}
                  {currentResult.whatToLookFor && (
                    <div className="bhs-guidance-section">
                      <span className="bhs-box-label">What to inspect next:</span>
                      <p className="bhs-guidance-text">{currentResult.whatToLookFor}</p>
                    </div>
                  )}

                  {currentResult.whatToDoNext && (
                    <div className="bhs-guidance-section">
                      <span className="bhs-box-label">Recommended practice:</span>
                      <p className="bhs-guidance-text">{currentResult.whatToDoNext}</p>
                    </div>
                  )}
                </div>

                {/* Mandatory Screening Aid Safety Rule (Section 2) */}
                <div className="bhs-safety-callout" role="note">
                  <Info size={16} color="var(--color-primary-honey, #D99A24)" className="bhs-safety-icon" />
                  <p>
                    <strong>Screening aid:</strong> This scan is a decision-support aid, not a definitive diagnosis.
                    Confirm important findings through closer inspection or qualified professional assessment before treatment or management decisions.
                  </p>
                </div>

                {/* Contextual Environmental Telemetry (Section 26) */}
                <div className="bhs-sensor-context-box">
                  <span className="bhs-sensor-ctx-label">Hive telemetry context</span>
                  <div className="bhs-sensor-ctx-data">
                    <span>Temperature: {currentHive.temp ? `${currentHive.temp}°C` : '31.4°C'}</span>
                    <span>•</span>
                    <span>Humidity: {currentHive.humidity ? `${currentHive.humidity}%` : '68%'}</span>
                    <span>•</span>
                    <span>Activity: Stable</span>
                  </div>
                  <small>Environmental telemetry provides context and does not independently diagnose bee disease.</small>
                </div>

                {/* Beekeeper Human Observation Input (Section 25) */}
                <div className="bhs-obs-card">
                  <label htmlFor="bhs-obs-note" className="bhs-obs-label">
                    Your observation (optional)
                  </label>
                  <textarea
                    id="bhs-obs-note"
                    className="bhs-obs-input"
                    rows={2}
                    placeholder="Add anything you noticed (e.g. brood pattern looks unusual near lower frame)..."
                    value={observerNote}
                    onChange={(e) => setObserverNote(e.target.value)}
                  />
                </div>

                {/* Actions (Section 24) */}
                <div className="bhs-result-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={handleSaveInspection}
                  >
                    <CheckCircle2 size={16} />
                    <span>Save inspection to Hive {currentHive.code || 'A-03'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-block"
                    onClick={() => {
                      onClose();
                      const presetMap = {
                        afb: 'STATE_A_POSSIBLE_AFB',
                        healthy: 'STATE_B_NO_CONCERNING_SIGNS',
                        unclear: 'STATE_C_UNCLEAR',
                        outofscope: 'STATE_D_OUT_OF_SCOPE',
                        varroa: 'STATE_A_POSSIBLE_VARROA',
                        multiple: 'STATE_F_MULTIPLE_ISSUES'
                      };
                      openInspectionResult({
                        hiveId: currentHive.id,
                        hive: currentHive,
                        imageUrl: activeImage,
                        presetKey: presetMap[selectedSample.key] || 'STATE_A_POSSIBLE_AFB',
                        findings: currentResult.findings,
                        whatItMeans: currentResult.whatToLookFor,
                        whatToDoNext: currentResult.whatToDoNext,
                        observerNotes: observerNote
                      });
                    }}
                  >
                    <span>View inspection record</span>
                    <ArrowRight size={14} />
                  </button>

                  <div className="bhs-result-subactions">
                    <button type="button" className="btn btn-secondary flex-1" onClick={handleRetake}>
                      Scan another frame
                    </button>
                    <button type="button" className="btn-tertiary-link" onClick={onClose}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                STEP: SAVED CONFIRMATION (Section 24)
            ───────────────────────────────────────────────────────── */}
            {step === 'saved' && (
              <div className="bhs-saved-view animate-fade-in">
                <div className="bhs-saved-icon-circle">
                  <CheckCircle2 size={36} color="var(--color-healthy, #4F7A52)" />
                </div>
                <h2>Inspection saved</h2>
                <p>Attached to Hive {currentHive.code || 'A-03'} timeline and health history.</p>
              </div>
            )}
          </main>
        )}

        {/* ─────────────────────────────────────────────────────────────
            DEMO / JURY 24-STATE SWITCHER (Section 37 & 38)
        ───────────────────────────────────────────────────────────── */}
        {showJuryDrawer && (
          <div className="bhs-jury-drawer animate-fade-in">
            <div className="bhs-jury-bar">
              <strong>Jury / Inspection State Simulator (24 States)</strong>
              <button
                type="button"
                className="bhs-jury-close"
                onClick={() => setShowJuryDrawer(false)}
              >
                ✕
              </button>
            </div>

            <div className="bhs-jury-grid">
              <div>
                <span className="bhs-jury-group-lbl">Flow Steps:</span>
                <div className="bhs-chips-wrap">
                  <button type="button" className={step === 'permission' ? 'active' : ''} onClick={() => setStep('permission')}>1. Permission</button>
                  <button type="button" className={step === 'capture' && cameraState === 'ready' ? 'active' : ''} onClick={() => { setStep('capture'); setCameraState('ready'); }}>2. Camera ready</button>
                  <button type="button" className={cameraState === 'connecting' ? 'active' : ''} onClick={() => { setStep('capture'); setCameraState('connecting'); }}>3. Connecting</button>
                  <button type="button" className={cameraState === 'unavailable' ? 'active' : ''} onClick={() => { setStep('capture'); setCameraState('unavailable'); }}>4. Camera unavailable</button>
                  <button type="button" className={cameraState === 'offline' ? 'active' : ''} onClick={() => { setStep('capture'); setCameraState('offline'); }}>5. Device offline</button>
                  <button type="button" className={step === 'capturing' ? 'active' : ''} onClick={() => setStep('capturing')}>6. Capturing</button>
                  <button type="button" className={step === 'validation' && qualityStatus === 'good' ? 'active' : ''} onClick={() => { setStep('validation'); setQualityStatus('good'); }}>7. Good image</button>
                  <button type="button" className={qualityStatus === 'dark' ? 'active' : ''} onClick={() => { setStep('validation'); setQualityStatus('dark'); }}>8. Poor lighting</button>
                  <button type="button" className={qualityStatus === 'blurry' ? 'active' : ''} onClick={() => { setStep('validation'); setQualityStatus('blurry'); }}>9. Blurry image</button>
                  <button type="button" className={step === 'review' ? 'active' : ''} onClick={() => setStep('review')}>10. Review frame</button>
                  <button type="button" className={step === 'analyzing' ? 'active' : ''} onClick={() => setStep('analyzing')}>11. Analyzing</button>
                </div>
              </div>

              <div>
                <span className="bhs-jury-group-lbl">Screening Results (Safety-First):</span>
                <div className="bhs-chips-wrap">
                  {SUPPORTED_SCREENING_CONDITIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={step === 'result' && selectedSample.id === s.id ? 'active' : ''}
                      onClick={() => {
                        setSelectedSample(s);
                        setCustomImage(null);
                        setStep('result');
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STYLES (Strictly conforming to Section 4 color system)
        ───────────────────────────────────────────────────────────── */}
        <style>{`
          .bhs-overlay {
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

          .bhs-viewport-shell {
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

          .bhs-screen-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            background-color: var(--color-soft-ivory, #FFFDF8);
            border-bottom: 1px solid var(--color-divider, #EDE2D1);
            flex-shrink: 0;
          }

          .bhs-back-btn {
            background: none;
            border: none;
            padding: 6px;
            color: var(--color-deep-cocoa, #34261B);
            cursor: pointer;
            min-height: 44px;
            min-width: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
          }

          .bhs-header-titles {
            text-align: center;
            flex: 1;
            margin: 0 8px;
          }

          .bhs-main-title {
            font-size: 16px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.01em;
          }

          .bhs-hive-context {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: var(--color-primary-honey, #D99A24);
            margin-top: 1px;
          }

          .bhs-jury-toggle-btn {
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

          .bhs-body-scroll {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
          }

          /* Connection status bar (Section 10) */
          .bhs-conn-bar {
            display: flex;
            justify-content: center;
            margin-bottom: 10px;
          }

          .bhs-conn-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 600;
            padding: 3px 10px;
            border-radius: 9999px;
            background-color: var(--color-soft-ivory, #FFFDF8);
            border: 1px solid var(--color-divider, #EDE2D1);
          }

          .bhs-conn-pill.ready {
            color: var(--color-healthy, #4F7A52);
          }

          .bhs-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
          }

          .bhs-dot.green { background-color: var(--color-healthy, #4F7A52); }

          /* Viewfinder Frame (Section 6) */
          .bhs-viewfinder-frame {
            position: relative;
            width: 100%;
            aspect-ratio: 4 / 3;
            background-color: #2D241E;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid var(--color-divider, #EDE2D1);
            box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.4);
          }

          .bhs-viewfinder-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          /* Physical frame reticle brackets */
          .bhs-frame-reticle {
            position: absolute;
            inset: 16px;
            border-radius: 8px;
            pointer-events: none;
          }

          .bhs-corner-bracket {
            position: absolute;
            width: 22px;
            height: 22px;
            border-color: rgba(255, 255, 255, 0.85);
            border-style: solid;
          }

          .bhs-corner-bracket.top-left {
            top: 0; left: 0;
            border-width: 2.5px 0 0 2.5px;
            border-top-left-radius: 6px;
          }

          .bhs-corner-bracket.top-right {
            top: 0; right: 0;
            border-width: 2.5px 2.5px 0 0;
            border-top-right-radius: 6px;
          }

          .bhs-corner-bracket.bottom-left {
            bottom: 0; left: 0;
            border-width: 0 0 2.5px 2.5px;
            border-bottom-left-radius: 6px;
          }

          .bhs-corner-bracket.bottom-right {
            bottom: 0; right: 0;
            border-width: 0 2.5px 2.5px 0;
            border-bottom-right-radius: 6px;
          }

          .bhs-frame-center-hint {
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(52, 38, 27, 0.65);
            backdrop-filter: blur(2px);
            color: #FFF;
            font-size: 11px;
            font-weight: 500;
            padding: 3px 8px;
            border-radius: 4px;
          }

          .bhs-guidance-pill {
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(52, 38, 27, 0.8);
            backdrop-filter: blur(4px);
            color: #FFF;
            font-size: 12px;
            font-weight: 500;
            padding: 5px 12px;
            border-radius: 9999px;
            white-space: nowrap;
          }

          .bhs-capturing-overlay {
            position: absolute;
            inset: 0;
            background-color: rgba(52, 38, 27, 0.65);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFF;
          }

          .bhs-capture-status-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
          }

          .bhs-capture-status-box strong {
            font-size: 15px;
          }

          .bhs-capture-status-box span {
            font-size: 12px;
            color: #E2D9CE;
          }

          .bhs-capture-subtext {
            font-size: 12px;
            color: var(--color-warm-gray, #786D61);
            text-align: center;
            margin: 10px 0 16px 0;
            line-height: 1.4;
          }

          /* Shutter container (Section 11) */
          .bhs-shutter-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            margin-top: auto;
          }

          .bhs-shutter-button {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background-color: var(--color-soft-ivory, #FFFDF8);
            border: 3.5px solid var(--color-primary-honey, #D99A24);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(217, 154, 36, 0.35);
            transition: transform 0.15s ease;
          }

          .bhs-shutter-button:active {
            transform: scale(0.94);
          }

          .bhs-shutter-inner {
            width: 54px;
            height: 54px;
            border-radius: 50%;
            background-color: var(--color-primary-honey, #D99A24);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .bhs-shutter-alt-row {
            margin-top: 4px;
          }

          .bhs-gallery-link {
            font-size: 13px;
            font-weight: 600;
            color: var(--color-primary-honey, #D99A24);
            display: inline-flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            min-height: 44px;
            padding: 0 8px;
          }

          /* Validation & Preview */
          .bhs-preview-container,
          .bhs-review-image-frame {
            position: relative;
            width: 100%;
            aspect-ratio: 4 / 3;
            background-color: #2D241E;
            border-radius: 14px;
            overflow: hidden;
            margin-bottom: 14px;
            border: 1px solid var(--color-divider, #EDE2D1);
          }

          .bhs-preview-image,
          .bhs-review-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.25s ease;
          }

          .bhs-review-image.zoomed {
            transform: scale(1.6);
            cursor: zoom-out;
          }

          .bhs-zoom-badge {
            position: absolute;
            bottom: 10px;
            right: 10px;
            background-color: rgba(52, 38, 27, 0.75);
            color: #FFF;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .bhs-quality-card {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px 14px;
            border-radius: 12px;
            margin-bottom: 16px;
          }

          .bhs-quality-card.good {
            background-color: var(--color-healthy-tint, rgba(79, 122, 82, 0.1));
            border: 1px solid rgba(79, 122, 82, 0.25);
          }

          .bhs-quality-card.warning {
            background-color: var(--color-attention-tint, rgba(217, 130, 43, 0.1));
            border: 1px solid rgba(217, 130, 43, 0.25);
          }

          .bhs-q-title {
            display: block;
            font-size: 13.5px;
            color: var(--color-deep-cocoa, #34261B);
            margin-bottom: 2px;
          }

          .bhs-q-desc {
            font-size: 12px;
            color: var(--color-warm-gray, #786D61);
            margin: 0;
            line-height: 1.4;
          }

          .bhs-review-prompt-card {
            background-color: var(--color-soft-ivory, #FFFDF8);
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 16px;
          }

          .bhs-review-heading {
            font-size: 14px;
            font-weight: 700;
            margin: 0 0 4px 0;
          }

          .bhs-review-sub {
            font-size: 12.5px;
            color: var(--color-warm-gray, #786D61);
            margin: 0;
            line-height: 1.4;
          }

          .bhs-cta-row {
            display: flex;
            gap: 10px;
            margin-top: auto;
          }

          /* Analyzing view (Section 16) */
          .bhs-analyzing-view {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 48px 20px;
            margin: auto 0;
          }

          .bhs-analyzing-icon-ring {
            position: relative;
            width: 72px;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 18px;
          }

          .bhs-analyzing-spinner {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 3px solid rgba(217, 154, 36, 0.2);
            border-top-color: var(--color-primary-honey, #D99A24);
            animation: spin 1s linear infinite;
          }

          .bhs-analyzing-title {
            font-size: 18px;
            font-weight: 700;
            margin: 0 0 6px 0;
          }

          .bhs-analyzing-desc {
            font-size: 13.5px;
            color: var(--color-warm-gray, #786D61);
            margin: 0 0 8px 0;
            line-height: 1.45;
          }

          .bhs-analyzing-note {
            font-size: 12px;
            color: var(--color-primary-honey, #D99A24);
            font-weight: 500;
          }

          /* Result View (Section 18, 19, 20, 21, 22) */
          .bhs-result-view {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .bhs-result-media-card {
            position: relative;
            width: 100%;
            height: 140px;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid var(--color-divider, #EDE2D1);
          }

          .bhs-result-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .bhs-result-media-overlay {
            position: absolute;
            bottom: 0;
            inset-inline: 0;
            background: linear-gradient(to top, rgba(52, 38, 27, 0.75), transparent);
            color: #FFF;
            padding: 8px 12px;
            font-size: 11.5px;
            font-weight: 500;
          }

          .bhs-result-card {
            background-color: var(--color-soft-ivory, #FFFDF8);
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 14px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .bhs-result-card.attention {
            border-left: 4px solid var(--color-attention, #D9822B);
          }

          .bhs-result-card.healthy {
            border-left: 4px solid var(--color-healthy, #4F7A52);
          }

          .bhs-result-card.unclear {
            border-left: 4px solid var(--color-warm-gray, #786D61);
          }

          .bhs-res-head {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .bhs-res-indicator {
            width: 9px;
            height: 9px;
            border-radius: 50%;
          }

          .bhs-res-indicator.attention { background-color: var(--color-attention, #D9822B); }
          .bhs-res-indicator.healthy { background-color: var(--color-healthy, #4F7A52); }
          .bhs-res-indicator.unclear { background-color: var(--color-warm-gray, #786D61); }

          .bhs-res-title {
            font-size: 14.5px;
            font-weight: 700;
            color: var(--color-deep-cocoa, #34261B);
          }

          .bhs-confidence-tag {
            margin-left: auto;
            font-size: 11px;
            font-weight: 600;
            color: var(--color-warm-gray, #786D61);
            background-color: #F8EFE0;
            padding: 2px 7px;
            border-radius: 4px;
          }

          .bhs-condition-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--color-deep-cocoa, #34261B);
            margin: 0;
          }

          .bhs-candidates-box {
            background-color: #FAF4E9;
            border-radius: 10px;
            padding: 12px;
          }

          .bhs-candidates-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 6px;
          }

          .bhs-candidate-item {
            font-size: 12.5px;
          }

          .bhs-cand-name {
            display: block;
            color: var(--color-deep-cocoa, #34261B);
            margin-bottom: 2px;
          }

          .bhs-cand-reason {
            margin: 0 0 2px 0;
            color: var(--color-warm-gray, #786D61);
          }

          .bhs-cand-next {
            display: block;
            font-weight: 600;
            color: var(--color-primary-honey, #D99A24);
          }

          .bhs-box-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--color-warm-gray, #786D61);
            margin-bottom: 4px;
          }

          .bhs-findings-list {
            margin: 0;
            padding-left: 18px;
            font-size: 12.5px;
            color: var(--color-deep-cocoa, #34261B);
            line-height: 1.45;
          }

          .bhs-guidance-text {
            font-size: 12.5px;
            color: var(--color-deep-cocoa, #34261B);
            margin: 0;
            line-height: 1.45;
          }

          /* Screening safety callout (Section 2) */
          .bhs-safety-callout {
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

          .bhs-safety-callout p {
            margin: 0;
          }

          .bhs-safety-icon {
            flex-shrink: 0;
            margin-top: 1px;
          }

          /* Sensor Telemetry context (Section 26) */
          .bhs-sensor-context-box {
            background-color: var(--color-soft-ivory, #FFFDF8);
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 12px;
            padding: 10px 14px;
          }

          .bhs-sensor-ctx-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--color-warm-gray, #786D61);
            margin-bottom: 4px;
          }

          .bhs-sensor-ctx-data {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12.5px;
            font-weight: 600;
            color: var(--color-deep-cocoa, #34261B);
            margin-bottom: 4px;
          }

          .bhs-sensor-context-box small {
            display: block;
            font-size: 11px;
            color: var(--color-warm-gray, #786D61);
            line-height: 1.35;
          }

          /* Human Observation Input (Section 25) */
          .bhs-obs-card {
            background-color: var(--color-soft-ivory, #FFFDF8);
            border: 1px solid var(--color-divider, #EDE2D1);
            border-radius: 12px;
            padding: 12px 14px;
          }

          .bhs-obs-label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: var(--color-deep-cocoa, #34261B);
            margin-bottom: 6px;
          }

          .bhs-obs-input {
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

          .bhs-obs-input:focus {
            outline: none;
            border-color: var(--color-primary-honey, #D99A24);
          }

          .bhs-result-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 6px;
          }

          .bhs-result-subactions {
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

          /* Saved Confirmation (Section 24) */
          .bhs-saved-view {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 48px 20px;
            margin: auto 0;
          }

          .bhs-saved-icon-circle {
            width: 68px;
            height: 68px;
            border-radius: 50%;
            background-color: var(--color-healthy-tint, rgba(79, 122, 82, 0.12));
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
          }

          .bhs-saved-view h2 {
            font-size: 18px;
            margin: 0 0 6px 0;
          }

          .bhs-saved-view p {
            font-size: 13px;
            color: var(--color-warm-gray, #786D61);
            margin: 0;
          }

          /* Jury / Demo State Switcher Drawer (Section 37 & 38) */
          .bhs-jury-drawer {
            position: absolute;
            bottom: 0;
            inset-inline: 0;
            background-color: #2D241E;
            color: #FAF4E9;
            border-top: 1px solid var(--color-primary-honey, #D99A24);
            padding: 14px 16px;
            z-index: 50;
            max-height: 48%;
            overflow-y: auto;
          }

          .bhs-jury-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            margin-bottom: 10px;
            color: var(--color-primary-honey, #D99A24);
          }

          .bhs-jury-close {
            background: none;
            border: none;
            color: #FAF4E9;
            font-size: 14px;
            cursor: pointer;
            padding: 4px;
          }

          .bhs-jury-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .bhs-jury-group-lbl {
            display: block;
            font-size: 11px;
            color: #B5A89B;
            margin-bottom: 6px;
            text-transform: uppercase;
          }

          .bhs-chips-wrap {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .bhs-chips-wrap button {
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #E2D9CE;
            padding: 5px 9px;
            border-radius: 6px;
            font-size: 11px;
            cursor: pointer;
          }

          .bhs-chips-wrap button.active {
            background-color: var(--color-primary-honey, #D99A24);
            color: #34261B;
            font-weight: 700;
            border-color: var(--color-primary-honey, #D99A24);
          }

          .spin-icon {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
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
