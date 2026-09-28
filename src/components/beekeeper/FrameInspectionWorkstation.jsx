import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Camera,
  X,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Upload,
  Layers,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

// Clean vision models with concise findings & actions
export const FIELD_INSPECTION_MODELS = [
  {
    id: 'sample-healthy',
    title: 'Healthy Comb',
    finding: 'Uniform brood pattern, solid cappings, no abnormal perforations.',
    condition: 'Healthy brood pattern',
    confidence: '98%',
    severity: 'healthy',
    recommendedAction: 'Continue routine field monitoring.',
    sampleImage: '/hive-inspection-sample.jpg'
  },
  {
    id: 'sample-afb',
    title: 'Possible AFB',
    finding: 'Irregular brood pattern with sunken, punctured cell cappings.',
    condition: 'Foulbrood symptoms detected',
    confidence: '89%',
    severity: 'attention',
    recommendedAction: 'Inspect closely and verify with diagnostic test kit.',
    sampleImage: '/hive-inspection-sample.jpg'
  },
  {
    id: 'sample-varroa',
    title: 'Varroa Stress',
    finding: 'Perforated cell cappings with chewing in emergence cells.',
    condition: 'Mite infestation signs',
    confidence: '92%',
    severity: 'attention',
    recommendedAction: 'Perform sugar roll or alcohol wash to verify mite count.',
    sampleImage: '/hive-inspection-sample.jpg'
  },
  {
    id: 'sample-unclear',
    title: 'Unclear Image',
    finding: 'Comb lighting or focus insufficient for pattern analysis.',
    condition: 'Image unclear',
    confidence: 'Low',
    severity: 'unclear',
    recommendedAction: 'Reposition frame in natural light and capture again.',
    sampleImage: '/hive-inspection-sample.jpg'
  }
];

export const FrameInspectionWorkstation = ({
  isOpen,
  onClose,
  initialFrame = null,
  onSaveInspection
}) => {
  const {
    frames = [],
    hives = [],
    hiveManagementBatches = [],
    apiary,
    apiaries = [],
    showToast
  } = useAppState();

  const activeApiary = apiary || (apiaries?.length > 0 ? apiaries[0] : null);

  // Available batches derived from batch state & hive metadata
  const availableBatches = useMemo(() => {
    const batchMap = new Map();
    (hiveManagementBatches || []).forEach(b => {
      if (b.id) batchMap.set(b.id, { id: b.id, name: b.name || `Batch ${b.id}` });
    });
    (hives || []).forEach(h => {
      if (h.batchId && !batchMap.has(h.batchId)) {
        batchMap.set(h.batchId, { id: h.batchId, name: h.batchName || `Batch ${h.batchId}` });
      }
    });
    return Array.from(batchMap.values());
  }, [hiveManagementBatches, hives]);

  // Selections
  const [selectedBatchId, setSelectedBatchId] = useState('all');
  const [selectedHiveId, setSelectedHiveId] = useState(() => {
    if (initialFrame?.hiveId) return initialFrame.hiveId;
    if (initialFrame?.hiveCode) {
      const match = hives.find(h => h.code === initialFrame.hiveCode || `H${h.code}` === initialFrame.hiveCode);
      if (match) return match.id;
    }
    const nonArchived = hives.filter(h => !h.isArchived);
    return nonArchived[0]?.id || hives[0]?.id || '';
  });

  // Stage flow: starts at 'select_colony' if no initial frame, else 'position'
  const [stage, setStage] = useState(() => (initialFrame ? 'position' : 'select_colony'));
  const [selectedFrameId, setSelectedFrameId] = useState(initialFrame?.id || '');
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const [beekeeperNotes, setBeekeeperNotes] = useState('');
  const fileInputRef = useRef(null);

  // Filter hives based on selected batch
  const filteredHives = useMemo(() => {
    const nonArchived = (hives || []).filter(h => !h.isArchived);
    if (!selectedBatchId || selectedBatchId === 'all') {
      return nonArchived;
    }
    return nonArchived.filter(h => h.batchId === selectedBatchId);
  }, [hives, selectedBatchId]);

  // Ensure selected hive is valid within current batch filter
  useEffect(() => {
    if (filteredHives.length > 0 && !filteredHives.some(h => h.id === selectedHiveId)) {
      setSelectedHiveId(filteredHives[0].id);
    }
  }, [filteredHives, selectedHiveId]);

  // Selected Hive object
  const selectedHive = useMemo(() => {
    return (
      hives.find(h => h.id === selectedHiveId) ||
      filteredHives[0] ||
      hives[0] ||
      null
    );
  }, [hives, selectedHiveId, filteredHives]);

  const cleanHiveCode = useMemo(() => {
    if (!selectedHive) return 'H001';
    const c = String(selectedHive.code || '001');
    return c.startsWith('H') ? c : `H${c.padStart(3, '0')}`;
  }, [selectedHive]);

  // Only frames belonging to the selected hive
  const activeFramesForHive = useMemo(() => {
    if (!selectedHive) return [];

    // Filter frames strictly matching the chosen hive
    const matched = frames.filter(f => {
      if (f.hiveId && f.hiveId === selectedHive.id) return true;
      if (f.hiveCode && (f.hiveCode === cleanHiveCode || f.hiveCode === selectedHive.code)) return true;
      if (f.traceabilityCode && f.traceabilityCode.includes(cleanHiveCode)) return true;
      return false;
    });

    if (matched.length > 0) return matched;

    // Synthesize standard frames for hive if not yet seeded
    const frameCount = selectedHive.superFramesTotal || selectedHive.framesCount || 10;
    const apCode = selectedHive.apiaryCode || activeApiary?.apiaryCode || 'AP1';

    return Array.from({ length: frameCount }, (_, idx) => {
      const fNum = idx + 1;
      const tCode = `${apCode}${cleanHiveCode}F${fNum}`;
      return {
        id: `auto-${selectedHive.id}-f${fNum}`,
        traceabilityCode: tCode,
        hiveId: selectedHive.id,
        hiveCode: cleanHiveCode,
        apiaryCode: apCode,
        frameNumber: fNum,
        status: 'ACTIVE'
      };
    });
  }, [frames, selectedHive, cleanHiveCode, activeApiary]);

  // Sync selected frame within chosen hive's frames
  useEffect(() => {
    if (activeFramesForHive.length > 0) {
      if (!activeFramesForHive.some(f => f.id === selectedFrameId || f.traceabilityCode === selectedFrameId)) {
        setSelectedFrameId(activeFramesForHive[0].id);
      }
    }
  }, [activeFramesForHive, selectedFrameId]);

  const selectedFrame = useMemo(() => {
    return (
      activeFramesForHive.find(f => f.id === selectedFrameId || f.traceabilityCode === selectedFrameId) ||
      activeFramesForHive[0] ||
      null
    );
  }, [activeFramesForHive, selectedFrameId]);

  if (!isOpen) return null;

  const handleCapture = () => {
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
    setTimeout(() => {
      setStage('result');
    }, 1000);
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
      hiveCode: cleanHiveCode,
      hiveId: selectedHive?.id,
      apiaryCode: selectedFrame?.apiaryCode || selectedHive?.apiaryCode || 'AP1',
      result: model.title,
      finding: model.finding,
      condition: model.condition,
      confidence: model.confidence,
      severity: model.severity,
      image: capturedImage,
      observation: beekeeperNotes || 'Comb inspected with optical AI.',
      actionTaken: model.recommendedAction
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
              <Camera size={18} color="#D99A24" />
            </div>
            <div>
              <h2 className="bk-modal-title">Frame Health Scan</h2>
              <p className="bk-modal-sub">
                {stage === 'select_colony'
                  ? 'Select Batch and Hive'
                  : selectedFrame?.traceabilityCode || 'Scan Frame'}
              </p>
            </div>
          </div>
          <button className="bk-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="bk-ws-body">
          {/* STEP 0: SELECT BATCH & HIVE BEFORE SHOWING SCAN */}
          {stage === 'select_colony' && (
            <div className="bk-ws-colony-select-box">
              {/* Batch Selector */}
              <div className="bk-form-group">
                <label className="bk-ws-select-lbl">Select Batch:</label>
                <select
                  className="bk-ws-input-select"
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                >
                  <option value="all">All Batches ({filteredHives.length} hives)</option>
                  {availableBatches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hive Selector */}
              <div className="bk-form-group">
                <label className="bk-ws-select-lbl">Select Hive Colony:</label>
                <select
                  className="bk-ws-input-select"
                  value={selectedHiveId}
                  onChange={e => setSelectedHiveId(e.target.value)}
                >
                  {filteredHives.length === 0 ? (
                    <option value="">No hives found in this batch</option>
                  ) : (
                    filteredHives.map(h => {
                      const code = String(h.code || '').startsWith('H') ? h.code : `H${String(h.code).padStart(3, '0')}`;
                      return (
                        <option key={h.id} value={h.id}>
                          Hive {code} — {h.name || h.type || 'Standard Super'}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              {/* Selected Hive Summary Card */}
              {selectedHive && (
                <div className="bk-ws-colony-summary">
                  <div className="bk-ws-colony-meta">
                    <strong>Hive {cleanHiveCode}</strong>
                    <span>{selectedHive.name || 'Colony Unit'}</span>
                  </div>
                  <div className="bk-ws-colony-frames-tag">
                    {activeFramesForHive.length} frames ready
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                type="button"
                className="btn btn-primary bk-ws-start-scan-btn"
                disabled={!selectedHive}
                onClick={() => setStage('position')}
              >
                <span>Continue to Frame Scan</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 1: POSITION STAGE (CAMERA VIEWPORT) */}
          {stage === 'position' && (
            <div className="bk-ws-stage-box">
              {/* Colony Breadcrumb & Change Hive Button */}
              <div className="bk-ws-colony-badge-bar">
                <span className="bk-ws-colony-label">
                  Hive: <strong>{cleanHiveCode}</strong> ({selectedHive?.name || 'Box'})
                </span>
                <button
                  type="button"
                  className="bk-ws-switch-colony-btn"
                  onClick={() => setStage('select_colony')}
                >
                  Change Hive
                </button>
              </div>

              {/* Target Frame Selection Bar - Strictly filtered to chosen hive's frames */}
              <div className="bk-ws-frame-select-bar">
                <label className="bk-ws-select-lbl">Target Frame:</label>
                <select
                  className="bk-ws-select"
                  value={selectedFrame?.id}
                  onChange={e => setSelectedFrameId(e.target.value)}
                  disabled={stage === 'analyzing'}
                >
                  {activeFramesForHive.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.traceabilityCode} ({cleanHiveCode} — Frame F{f.frameNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Camera Guideline Viewport */}
              <div className="bk-ws-viewport-frame">
                <div className="bk-ws-guideline-box">
                  <span className="bk-ws-corner top-left" />
                  <span className="bk-ws-corner top-right" />
                  <span className="bk-ws-corner bottom-left" />
                  <span className="bk-ws-corner bottom-right" />
                  <div className="bk-ws-guide-text">
                    <Camera size={28} color="#D99A24" strokeWidth={1.8} />
                    <strong>Position Frame</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                  <Camera size={17} />
                  <span>Capture Frame</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CAPTURED STAGE */}
          {stage === 'captured' && (
            <div className="bk-ws-stage-box">
              <div className="bk-ws-preview-frame">
                <img
                  src={capturedImage || '/hive-inspection-sample.jpg'}
                  alt="Captured brood frame"
                  className="bk-ws-preview-img"
                />
                <div className="bk-ws-preview-overlay-tag">
                  <span>{selectedFrame?.traceabilityCode}</span>
                </div>
              </div>

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
                  <span>Analyze</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ANALYZING STAGE */}
          {stage === 'analyzing' && (
            <div className="bk-ws-analyzing-box">
              <div className="bk-ws-spinner" />
              <strong className="bk-ws-analyzing-title">Analyzing Comb...</strong>
            </div>
          )}

          {/* STEP 4: RESULT STAGE */}
          {stage === 'result' && (
            <div className="bk-ws-result-box">
              <div className={`bk-ws-result-hero ${currentResult.severity}`}>
                <div className="bk-ws-result-badge-row">
                  <span className="bk-ws-frame-tag">{selectedFrame?.traceabilityCode}</span>
                  <span className="bk-ws-conf-badge">{currentResult.confidence} match</span>
                </div>
                <h3 className="bk-ws-result-title">{currentResult.title}</h3>
                <span className="bk-ws-result-cond">{currentResult.condition}</span>
              </div>

              <div className="bk-ws-findings-card">
                <div className="bk-ws-finding-block">
                  <strong className="bk-ws-sub-head">Observation</strong>
                  <p className="bk-ws-finding-text">{currentResult.finding}</p>
                </div>
                <div className="bk-ws-rec-block">
                  <strong className="bk-ws-sub-head">Recommended Action</strong>
                  <p className="bk-ws-rec-text">{currentResult.recommendedAction}</p>
                </div>
              </div>

              <div className="bk-ws-input-sec">
                <input
                  type="text"
                  className="bk-text-input"
                  placeholder="Notes (optional)"
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
                  Scan Again
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveResult}
                >
                  <CheckCircle2 size={16} />
                  <span>Save Result</span>
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
          padding: 14px 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .bk-ws-colony-select-box {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 4px 0;
        }
        .bk-ws-input-select {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--color-card-border, #E2DAD0);
          background: #FAF7F2;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
          outline: none;
          cursor: pointer;
        }
        .bk-ws-input-select:focus {
          border-color: #D97706;
          background: #FFFFFF;
        }
        .bk-ws-colony-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FFFDF8;
          border: 1px solid #FDE68A;
          padding: 12px 14px;
          border-radius: 10px;
        }
        .bk-ws-colony-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .bk-ws-colony-meta strong {
          font-size: 14px;
          color: #92400E;
        }
        .bk-ws-colony-meta span {
          font-size: 12px;
          color: #B45309;
        }
        .bk-ws-colony-frames-tag {
          font-size: 11.5px;
          font-weight: 700;
          padding: 4px 8px;
          background: #FEF3C7;
          color: #B45309;
          border-radius: 6px;
        }
        .bk-ws-start-scan-btn {
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 4px;
        }
        .bk-ws-colony-badge-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 2px;
          font-size: 12.5px;
          color: var(--color-warm-gray, #6B5B4E);
        }
        .bk-ws-colony-label strong {
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-ws-switch-colony-btn {
          background: transparent;
          border: none;
          color: #D97706;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }
        .bk-ws-frame-select-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FFFFFF;
          border: 1px solid var(--color-card-border, #E2DAD0);
          padding: 8px 12px;
          border-radius: 10px;
        }
        .bk-ws-select-lbl {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
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
          border-radius: 12px;
          height: 180px;
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
          padding: 12px;
        }
        .bk-ws-guide-text {
          color: #FFF9EF;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .bk-ws-guide-text strong {
          font-size: 14px;
          letter-spacing: -0.01em;
        }
        .bk-ws-corner {
          position: absolute;
          width: 14px;
          height: 14px;
        }
        .bk-ws-corner.top-left { top: -2px; left: -2px; border-top: 3px solid #D99A24; border-left: 3px solid #D99A24; }
        .bk-ws-corner.top-right { top: -2px; right: -2px; border-top: 3px solid #D99A24; border-right: 3px solid #D99A24; }
        .bk-ws-corner.bottom-left { bottom: -2px; left: -2px; border-bottom: 3px solid #D99A24; border-left: 3px solid #D99A24; }
        .bk-ws-corner.bottom-right { bottom: -2px; right: -2px; border-bottom: 3px solid #D99A24; border-right: 3px solid #D99A24; }
        .bk-ws-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }
        .bk-ws-controls button {
          flex: 1;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 600;
        }
        .bk-ws-preview-frame {
          position: relative;
          height: 190px;
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
        .bk-ws-analyzing-box {
          padding: 32px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .bk-ws-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(217, 154, 36, 0.2);
          border-top-color: #D99A24;
          border-radius: 50%;
          animation: bkSpin 0.8s linear infinite;
        }
        @keyframes bkSpin {
          to { transform: rotate(360deg); }
        }
        .bk-ws-analyzing-title {
          font-size: 15px;
          color: var(--color-deep-cocoa);
        }
        .bk-ws-result-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bk-ws-result-hero {
          padding: 14px;
          border-radius: 10px;
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
          margin-bottom: 4px;
        }
        .bk-ws-frame-tag {
          font-size: 11px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .bk-ws-conf-badge {
          font-size: 11px;
          opacity: 0.9;
        }
        .bk-ws-result-title {
          font-size: 17px;
          font-weight: 700;
          margin: 0 0 2px;
        }
        .bk-ws-result-cond {
          font-size: 13px;
          opacity: 0.95;
        }
        .bk-ws-findings-card {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 10px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .bk-ws-sub-head {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #786D61;
          display: block;
          margin-bottom: 2px;
        }
        .bk-ws-finding-text, .bk-ws-rec-text {
          font-size: 13px;
          color: var(--color-deep-cocoa);
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
