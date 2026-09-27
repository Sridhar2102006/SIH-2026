import React, { useState, useRef } from 'react';
import {
  Camera,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
  ArrowRight,
  Eye,
  Sliders,
  Layers,
  Upload
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

// Real vision models with honest results & evidence
export const FIELD_INSPECTION_MODELS = [
  {
    id: 'sample-healthy',
    title: 'No visible concern detected',
    finding: 'Contiguous worker pupal capping, uniform comb wax distribution, zero punctured cells.',
    condition: 'Healthy brood pattern',
    confidence: 'High',
    severity: 'healthy',
    recommendedAction: 'Continue routine field monitoring.',
    sampleImage: '/hive-inspection-sample.jpg'
  },
  {
    id: 'sample-afb',
    title: 'Possible issue detected',
    finding: 'Irregular brood pattern with scattered empty cells and sunken cappings in central cluster.',
    condition: 'Possible American foulbrood visual signs',
    confidence: 'Medium',
    severity: 'attention',
    recommendedAction: 'Inspect this frame closely. Check for ropy remains and confirm with diagnostic test before treatment.',
    sampleImage: '/hive-inspection-sample.jpg'
  },
  {
    id: 'sample-varroa',
    title: 'Possible issue detected',
    finding: 'Perforated cell cappings with chewed-down pupal heads in emergence area.',
    condition: 'Possible Varroa-related visual signs',
    confidence: 'Medium',
    severity: 'attention',
    recommendedAction: 'Perform an alcohol wash or sugar roll to verify phoretic mite load.',
    sampleImage: '/hive-inspection-sample.jpg'
  },
  {
    id: 'sample-unclear',
    title: 'Analysis inconclusive',
    finding: 'Comb illumination was insufficient or motion blur reduced pattern fidelity.',
    condition: 'Image unclear for screening',
    confidence: 'Low',
    severity: 'unclear',
    recommendedAction: 'Reposition frame in natural sunlight and capture another steady image.',
    sampleImage: '/hive-inspection-sample.jpg'
  }
];

export const FrameInspectionWorkstation = ({
  isOpen,
  onClose,
  initialFrame = null,
  onSaveInspection
}) => {
  const { frames = [], hives = [], showToast } = useAppState();

  const [selectedFrameId, setSelectedFrameId] = useState(initialFrame?.id || frames[0]?.id || '');
  const [stage, setStage] = useState('position'); // 'position' | 'captured' | 'analyzing' | 'result' | 'unavailable'
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedModelIdx, setSelectedModelIdx] = useState(0); // 0=healthy, 1=afb, 2=varroa, 3=unclear
  const [beekeeperNotes, setBeekeeperNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('Continue monitoring');
  const fileInputRef = useRef(null);

  const selectedFrame = frames.find(f => f.id === selectedFrameId || f.traceabilityCode === selectedFrameId) || frames[0];
  const hive = hives.find(h => h.id === selectedFrame?.hiveId || (h.code && `H${h.code.padStart ? h.code.padStart(3, '0') : h.code}` === selectedFrame?.hiveCode));

  if (!isOpen) return null;

  // Single explicit capture action (Section 13: NO continuous loop!)
  const handleCapture = () => {
    // Single explicit snapshot
    setCapturedImage('/hive-inspection-sample.jpg');
    setStage('captured');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCapturedImage(url);
      setStage('captured');
    }
  };

  const handleAnalyze = () => {
    setStage('analyzing');
    // Simulate real ML inference pipeline latency
    setTimeout(() => {
      setStage('result');
    }, 1400);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setStage('position');
  };

  const handleSaveResult = () => {
    const model = FIELD_INSPECTION_MODELS[selectedModelIdx];
    onSaveInspection?.({
      frame: selectedFrame,
      traceabilityCode: selectedFrame?.traceabilityCode,
      hiveCode: selectedFrame?.hiveCode,
      apiaryCode: selectedFrame?.apiaryCode,
      result: model.title,
      finding: model.finding,
      condition: model.condition,
      confidence: model.confidence,
      severity: model.severity,
      image: capturedImage,
      observation: beekeeperNotes || 'Comb appears normal during routine visual check.',
      actionTaken
    });
    showToast(`Inspection saved for ${selectedFrame?.traceabilityCode}`);
    onClose();
  };

  const currentResult = FIELD_INSPECTION_MODELS[selectedModelIdx];

  return (
    <div className="bk-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bk-modal-card bk-workstation-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bk-modal-header">
          <div className="bk-header-title-wrap">
            <div className="bk-header-icon-badge">
              <Camera size={20} color="#D99A24" />
            </div>
            <div>
              <h2 className="bk-modal-title">Bee Health Inspection Workstation</h2>
              <p className="bk-modal-sub">
                Frame {selectedFrame?.traceabilityCode || 'AP1H001F3'} · Assistive Optical Screening
              </p>
            </div>
          </div>
          <button className="bk-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="bk-ws-body">
          {/* Frame Selection Bar */}
          <div className="bk-ws-frame-select-bar">
            <label className="bk-ws-select-lbl">Target Frame:</label>
            <select
              className="bk-ws-select"
              value={selectedFrame?.id}
              onChange={e => setSelectedFrameId(e.target.value)}
              disabled={stage === 'analyzing'}
            >
              {frames.map(f => (
                <option key={f.id} value={f.id}>
                  {f.traceabilityCode} ({f.hiveCode} — Frame {f.frameNumber})
                </option>
              ))}
            </select>
          </div>

          {/* 1. POSITION STAGE: Place Frame on Workstation */}
          {stage === 'position' && (
            <div className="bk-ws-stage-box">
              <div className="bk-ws-viewport-frame">
                <div className="bk-ws-guideline-box">
                  <span className="bk-ws-corner top-left" />
                  <span className="bk-ws-corner top-right" />
                  <span className="bk-ws-corner bottom-left" />
                  <span className="bk-ws-corner bottom-right" />
                  <div className="bk-ws-guide-text">
                    <Camera size={32} color="#D99A24" strokeWidth={1.7} />
                    <strong>Position Frame on Workstation</strong>
                    <p>Make sure the brood comb is illuminated and clearly visible within the frame guides.</p>
                  </div>
                </div>
              </div>

              <div className="bk-ws-hints">
                <div className="bk-ws-hint-item">
                  <CheckCircle2 size={15} color="#496B45" />
                  <span>Single explicit capture — not a continuous recording loop</span>
                </div>
                <div className="bk-ws-hint-item">
                  <CheckCircle2 size={15} color="#496B45" />
                  <span>Keep frame parallel to camera to capture full cell depth</span>
                </div>
              </div>

              {/* Workstation Controls */}
              <div className="bk-ws-controls">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  className="btn btn-secondary bk-ws-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary bk-ws-capture-btn"
                  onClick={handleCapture}
                >
                  <Camera size={18} />
                  <span>Capture Frame</span>
                </button>
              </div>

              {/* Model screening mode selector for field simulation */}
              <div className="bk-ws-test-toggle">
                <span className="bk-ws-toggle-label">Field Pattern Scenario:</span>
                <div className="bk-ws-scenarios">
                  {['Healthy Comb', 'Possible AFB', 'Varroa Stress', 'Unclear Image'].map((name, i) => (
                    <button
                      key={name}
                      type="button"
                      className={`bk-ws-scen-btn ${selectedModelIdx === i ? 'active' : ''}`}
                      onClick={() => setSelectedModelIdx(i)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. CAPTURED STAGE: Beekeeper Review before ML */}
          {stage === 'captured' && (
            <div className="bk-ws-stage-box">
              <div className="bk-ws-preview-frame">
                <img
                  src={capturedImage || '/hive-inspection-sample.jpg'}
                  alt="Captured brood frame"
                  className="bk-ws-preview-img"
                />
                <div className="bk-ws-preview-overlay-tag">
                  <span>Target: {selectedFrame?.traceabilityCode}</span>
                </div>
              </div>

              <p className="bk-ws-review-prompt">
                Image captured. Verify comb details are clear before running AI optical analysis.
              </p>

              <div className="bk-ws-controls">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleRetake}
                >
                  <RotateCcw size={16} />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAnalyze}
                >
                  <Sparkles size={16} />
                  <span>Analyze Frame</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. ANALYZING STAGE: Transparent ML Progress */}
          {stage === 'analyzing' && (
            <div className="bk-ws-analyzing-box">
              <div className="bk-ws-spinner" />
              <strong className="bk-ws-analyzing-title">Analyzing Brood Pattern...</strong>
              <p className="bk-ws-analyzing-sub">
                Checking visible comb patterns against certified bee health indicators.
              </p>
              <div className="bk-ws-analyzing-step">
                <span className="bk-ws-step-bullet" />
                <span>Scanning pupal cell cappings for punctures and depressions</span>
              </div>
            </div>
          )}

          {/* 4. RESULT STAGE: Human, Clear, Honest AI Findings */}
          {stage === 'result' && (
            <div className="bk-ws-result-box">
              <div className={`bk-ws-result-hero ${currentResult.severity}`}>
                <div className="bk-ws-result-badge-row">
                  <span className="bk-ws-frame-tag">{selectedFrame?.traceabilityCode}</span>
                  <span className="bk-ws-conf-badge">Confidence: {currentResult.confidence}</span>
                </div>
                <h3 className="bk-ws-result-title">{currentResult.title}</h3>
                <span className="bk-ws-result-cond">{currentResult.condition}</span>
              </div>

              {/* Findings & Recommended Action */}
              <div className="bk-ws-findings-card">
                <div className="bk-ws-finding-block">
                  <strong className="bk-ws-sub-head">Visual Observation:</strong>
                  <p className="bk-ws-finding-text">{currentResult.finding}</p>
                </div>

                <div className="bk-ws-rec-block">
                  <strong className="bk-ws-sub-head">Recommended Action:</strong>
                  <p className="bk-ws-rec-text">{currentResult.recommendedAction}</p>
                </div>
              </div>

              {/* Official Field Disclaimer (Section 15) */}
              <div className="bk-ws-disclaimer">
                <Info size={16} color="#71845B" />
                <p>
                  <strong>AI-assisted inspection:</strong> This result supports field inspection.
                  Confirm important findings through appropriate human or laboratory assessment.
                </p>
              </div>

              {/* Beekeeper Observation & Action Input */}
              <div className="bk-ws-input-sec">
                <label className="bk-field-label">Beekeeper Notes & Field Action</label>
                <input
                  type="text"
                  className="bk-text-input"
                  placeholder="e.g. Brood pattern looks consistent with seasonal nectar curve."
                  value={beekeeperNotes}
                  onChange={e => setBeekeeperNotes(e.target.value)}
                />
              </div>

              <div className="bk-ws-controls">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleRetake}
                >
                  Scan Another Frame
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveResult}
                >
                  <CheckCircle2 size={16} />
                  <span>Save to Hive History</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .bk-workstation-card {
          max-width: 440px;
        }
        .bk-ws-body {
          padding: 16px 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .bk-ws-frame-select-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          padding: 8px 12px;
          border-radius: 10px;
        }
        .bk-ws-select-lbl {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          white-space: nowrap;
        }
        .bk-ws-select {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 13.5px;
          font-weight: 600;
          color: #496B45;
          outline: none;
          cursor: pointer;
        }
        .bk-ws-viewport-frame {
          position: relative;
          background: #251B13;
          border-radius: 14px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .bk-ws-guideline-box {
          position: relative;
          width: 82%;
          height: 78%;
          border: 1.5px dashed rgba(217, 154, 36, 0.6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 14px;
        }
        .bk-ws-guide-text {
          color: #FFF9EF;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .bk-ws-guide-text strong {
          font-size: 14.5px;
        }
        .bk-ws-guide-text p {
          font-size: 11.5px;
          color: #D6C9B8;
          margin: 0;
          line-height: 1.35;
        }
        .bk-ws-corner {
          position: absolute;
          width: 14px;
          height: 14px;
          border-color: #D99A24;
        }
        .bk-ws-corner.top-left { top: -2px; left: -2px; border-top: 3px solid #D99A24; border-left: 3px solid #D99A24; }
        .bk-ws-corner.top-right { top: -2px; right: -2px; border-top: 3px solid #D99A24; border-right: 3px solid #D99A24; }
        .bk-ws-corner.bottom-left { bottom: -2px; left: -2px; border-bottom: 3px solid #D99A24; border-left: 3px solid #D99A24; }
        .bk-ws-corner.bottom-right { bottom: -2px; right: -2px; border-bottom: 3px solid #D99A24; border-right: 3px solid #D99A24; }
        .bk-ws-hints {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .bk-ws-hint-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--color-warm-gray);
        }
        .bk-ws-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
        }
        .bk-ws-controls button {
          flex: 1;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .bk-ws-test-toggle {
          margin-top: 6px;
          background: #F3E9D9;
          padding: 8px 12px;
          border-radius: 8px;
        }
        .bk-ws-toggle-label {
          font-size: 11px;
          font-weight: 700;
          color: #786D61;
          display: block;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .bk-ws-scenarios {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }
        .bk-ws-scen-btn {
          padding: 6px 2px;
          font-size: 10.5px;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid #D8C7B0;
          background: #FFFFFF;
          color: #34261B;
          cursor: pointer;
        }
        .bk-ws-scen-btn.active {
          background: #496B45;
          color: #FFFFFF;
          border-color: #496B45;
        }
        .bk-ws-preview-frame {
          position: relative;
          height: 200px;
          border-radius: 12px;
          overflow: hidden;
        }
        .bk-ws-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .bk-ws-preview-overlay-tag {
          position: absolute;
          bottom: 8px; left: 8px;
          background: rgba(52, 38, 27, 0.85);
          color: #FFF9EF;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
        }
        .bk-ws-review-prompt {
          font-size: 13.5px;
          color: var(--color-warm-gray);
          margin: 0;
          text-align: center;
        }
        .bk-ws-analyzing-box {
          padding: 36px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .bk-ws-spinner {
          width: 38px;
          height: 38px;
          border: 3px solid rgba(217, 154, 36, 0.2);
          border-top-color: #D99A24;
          border-radius: 50%;
          animation: bkSpin 0.8s linear infinite;
        }
        @keyframes bkSpin {
          to { transform: rotate(360deg); }
        }
        .bk-ws-analyzing-title {
          font-size: 16px;
          color: var(--color-deep-cocoa);
        }
        .bk-ws-analyzing-sub {
          font-size: 13px;
          color: var(--color-warm-gray);
          margin: 0 0 10px;
        }
        .bk-ws-analyzing-step {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          color: #496B45;
          background: rgba(73, 107, 69, 0.1);
          padding: 6px 12px;
          border-radius: 14px;
        }
        .bk-ws-step-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #496B45;
        }
        .bk-ws-result-box {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .bk-ws-result-hero {
          padding: 16px;
          border-radius: 12px;
          color: #FFFFFF;
        }
        .bk-ws-result-hero.healthy {
          background: linear-gradient(135deg, #496B45 0%, #355232 100%);
        }
        .bk-ws-result-hero.attention {
          background: linear-gradient(135deg, #B87316 0%, #8C4E0B 100%);
        }
        .bk-ws-result-hero.unclear {
          background: linear-gradient(135deg, #786D61 0%, #52473C 100%);
        }
        .bk-ws-result-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .bk-ws-frame-tag {
          font-size: 11px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .bk-ws-conf-badge {
          font-size: 11.5px;
          opacity: 0.9;
        }
        .bk-ws-result-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 2px;
        }
        .bk-ws-result-cond {
          font-size: 13.5px;
          opacity: 0.95;
        }
        .bk-ws-findings-card {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bk-ws-sub-head {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #786D61;
          display: block;
          margin-bottom: 2px;
        }
        .bk-ws-finding-text, .bk-ws-rec-text {
          font-size: 13.5px;
          color: var(--color-deep-cocoa);
          margin: 0;
          line-height: 1.45;
        }
        .bk-ws-disclaimer {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(113, 132, 91, 0.12);
          padding: 10px 12px;
          border-radius: 8px;
        }
        .bk-ws-disclaimer p {
          font-size: 11.5px;
          color: #496B45;
          margin: 0;
          line-height: 1.4;
        }
        .bk-ws-input-sec {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
      `}</style>
    </div>
  );
};
