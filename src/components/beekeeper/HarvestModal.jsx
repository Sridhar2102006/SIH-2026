import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Droplet,
  CheckCircle2,
  Calendar,
  Clock,
  QrCode,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Layers,
  Building2,
  Sparkles,
  Scale,
  Lock,
  Flower2,
  Send
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { HONEY_TYPES } from '../../services/beekeeperDomainService';

export const HarvestModal = ({
  isOpen,
  onClose,
  initialFrameId = null,
  initialHiveId = null,
  initialBatchId = null,
  initialScope = 'frame',
  onHarvestSuccess,
  onProceedToHandover
}) => {
  const {
    frames = [],
    hives = [],
    hiveManagementBatches = [],
    apiary,
    apiaries = [],
    recordHarvest,
    showToast
  } = useAppState();

  const activeApiary = apiary || (apiaries?.length > 0 ? apiaries[0] : null);

  // Available batches derived from batch state & hive metadata
  const availableBatches = useMemo(() => {
    const map = new Map();
    (hiveManagementBatches || []).forEach(b => {
      if (b.id) map.set(b.id, { id: b.id, name: b.name || `Batch ${b.id}` });
    });
    (hives || []).forEach(h => {
      if (h.batchId && !map.has(h.batchId)) {
        map.set(h.batchId, { id: h.batchId, name: h.batchName || `Batch ${h.batchId}` });
      }
    });
    return Array.from(map.values());
  }, [hiveManagementBatches, hives]);

  // Harvest Scope: 'frame' | 'hive' | 'batch'
  const [scope, setScope] = useState(initialScope || 'frame');
  const [step, setStep] = useState(1); // 1 = Scope & Selection, 2 = Harvest Details, 3 = Confirmation, 4 = Success

  // Selected Scope Targets
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId || availableBatches[0]?.id || 'all');
  const [selectedHiveId, setSelectedHiveId] = useState(() => {
    if (initialHiveId) return initialHiveId;
    if (initialFrameId) {
      const match = frames.find(f => f.id === initialFrameId);
      if (match?.hiveId) return match.hiveId;
    }
    const nonArchived = hives.filter(h => !h.isArchived);
    return nonArchived[0]?.id || hives[0]?.id || '';
  });
  const [selectedFrameId, setSelectedFrameId] = useState(initialFrameId || '');

  // Harvest Parameters
  const [harvestDate, setHarvestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [harvestTime, setHarvestTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [honeyType, setHoneyType] = useState('Wildflower');
  const [quantityKg, setQuantityKg] = useState('2.4');
  const [beeActivity, setBeeActivity] = useState('Calm and steady foraging');
  const [remarks, setRemarks] = useState('');
  const [evidencePhoto] = useState('/hive-inspection-sample.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedHarvestCount, setSavedHarvestCount] = useState(0);
  const [committedHarvestSnapshot, setCommittedHarvestSnapshot] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Sync state when props change
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMsg(null);
      setCommittedHarvestSnapshot(null);
      if (initialFrameId) {
        setScope('frame');
        setSelectedFrameId(initialFrameId);
        const match = frames.find(f => f.id === initialFrameId);
        if (match?.hiveId) setSelectedHiveId(match.hiveId);
        if (match?.honeyType) setHoneyType(match.honeyType);
      } else if (initialHiveId) {
        setScope('hive');
        setSelectedHiveId(initialHiveId);
      } else if (initialBatchId) {
        setScope('batch');
        setSelectedBatchId(initialBatchId);
      }
    }
  }, [isOpen, initialFrameId, initialHiveId, initialBatchId, initialScope, frames]);

  // Eligible un-harvested frames
  const eligibleFrames = useMemo(() => {
    return frames.filter(f => f.status !== 'HARVESTED' && f.status !== 'SUBMITTED_TO_PROCESSOR');
  }, [frames]);

  // Filtered Hives by Batch
  const filteredHives = useMemo(() => {
    const nonArchived = hives.filter(h => !h.isArchived);
    if (!selectedBatchId || selectedBatchId === 'all') return nonArchived;
    return nonArchived.filter(h => h.batchId === selectedBatchId);
  }, [hives, selectedBatchId]);

  // Selected Hive Object & Clean Code
  const targetHive = useMemo(() => {
    return hives.find(h => h.id === selectedHiveId) || filteredHives[0] || hives[0] || null;
  }, [hives, selectedHiveId, filteredHives]);

  const targetHiveCode = useMemo(() => {
    if (!targetHive) return 'H001';
    const c = String(targetHive.code || '001');
    return c.startsWith('H') ? c : `H${c.padStart(3, '0')}`;
  }, [targetHive]);

  // Selected Batch Object
  const targetBatch = useMemo(() => {
    if (selectedBatchId === 'all') return null;
    return availableBatches.find(b => b.id === selectedBatchId) || null;
  }, [availableBatches, selectedBatchId]);

  const targetBatchName = useMemo(() => {
    return targetBatch?.name || 'All Colonies';
  }, [targetBatch]);

  // Target Frames based on Scope - STRICT TARGETING, NO FALLBACK JUMPING
  const targetFrames = useMemo(() => {
    if (scope === 'frame') {
      const match = frames.find(f => f.id === selectedFrameId || f.traceabilityCode === selectedFrameId)
        || eligibleFrames.find(f => f.id === selectedFrameId || f.traceabilityCode === selectedFrameId);
      if (match) return [match];
      return eligibleFrames.length > 0 ? [eligibleFrames[0]] : [];
    }

    if (scope === 'hive') {
      if (!targetHive) return [];
      const hiveFrames = eligibleFrames.filter(f => {
        if (f.hiveId && f.hiveId === targetHive.id) return true;
        if (f.hiveCode && (f.hiveCode === targetHiveCode || f.hiveCode === targetHive.code)) return true;
        if (f.traceabilityCode && f.traceabilityCode.includes(targetHiveCode)) return true;
        return false;
      });
      return hiveFrames;
    }

    if (scope === 'batch') {
      const batchHiveIds = new Set(filteredHives.map(h => h.id));
      const batchHiveCodes = new Set(
        filteredHives.map(h => (String(h.code).startsWith('H') ? h.code : `H${String(h.code).padStart(3, '0')}`))
      );
      return eligibleFrames.filter(f => {
        if (f.hiveId && batchHiveIds.has(f.hiveId)) return true;
        if (f.hiveCode && batchHiveCodes.has(f.hiveCode)) return true;
        return false;
      });
    }

    return [];
  }, [scope, selectedFrameId, eligibleFrames, targetHive, targetHiveCode, filteredHives]);

  const targetFrame = targetFrames[0] || null;

  // Resolved Honey / Flora Variety inherited from frame, hive, or batch setup
  const resolvedHoneyVariety = useMemo(() => {
    if (scope === 'frame') {
      return (
        targetFrame?.honeyType ||
        targetHive?.honeyType ||
        targetHive?.honeyVariety ||
        targetHive?.forage ||
        targetBatch?.honeyType ||
        'Wildflower'
      );
    }
    if (scope === 'hive') {
      return (
        targetHive?.honeyType ||
        targetHive?.honeyVariety ||
        targetHive?.forage ||
        targetBatch?.honeyType ||
        targetFrame?.honeyType ||
        'Wildflower'
      );
    }
    if (scope === 'batch') {
      return (
        targetBatch?.honeyType ||
        targetHive?.honeyType ||
        targetHive?.honeyVariety ||
        targetFrame?.honeyType ||
        'Wildflower'
      );
    }
    return targetFrame?.honeyType || targetHive?.honeyType || targetBatch?.honeyType || 'Wildflower';
  }, [scope, targetFrame, targetHive, targetBatch]);

  // Keep state synchronized with resolved variety
  useEffect(() => {
    if (resolvedHoneyVariety) {
      setHoneyType(resolvedHoneyVariety);
    }
  }, [resolvedHoneyVariety]);

  // Auto-calculate suggested yield when target frames change
  useEffect(() => {
    if (targetFrames.length > 0) {
      const estTotal = (targetFrames.length * 2.4).toFixed(1);
      setQuantityKg(estTotal);
    }
  }, [targetFrames.length, scope]);

  if (!isOpen) return null;

  const handleNext = () => {
    setErrorMsg(null);
    if (targetFrames.length === 0) {
      setErrorMsg(`No eligible frames found for this ${scope} to harvest.`);
      return;
    }
    if (step === 2) {
      if (!quantityKg || isNaN(parseFloat(quantityKg)) || parseFloat(quantityKg) <= 0) {
        setErrorMsg('Please specify a valid harvest quantity in kg.');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep(s => s - 1);
  };

  const handleConfirmHarvest = async () => {
    if (targetFrames.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const totalQty = parseFloat(quantityKg);
      const perFrameQty = (totalQty / targetFrames.length).toFixed(2);
      let successCount = 0;
      let lastError = null;

      // Exact snapshot of confirmed harvest parameters
      const committedSnapshot = {
        scope,
        primaryCode: targetFrames[0]?.traceabilityCode || selectedFrameId,
        targetFrames: targetFrames.map(f => ({ ...f })),
        count: targetFrames.length,
        totalYield: totalQty,
        perFrameYield: parseFloat(perFrameQty),
        variety: honeyType,
        timestamp: `${harvestDate} · ${harvestTime}`,
        hiveCode: targetHiveCode,
        batchName: targetBatchName
      };

      for (const f of targetFrames) {
        const res = await recordHarvest({
          frameId: f.id,
          traceabilityCode: f.traceabilityCode,
          hiveId: f.hiveId,
          hiveCode: f.hiveCode,
          apiaryCode: f.apiaryCode || activeApiary?.apiaryCode || 'AP1',
          honeyType,
          quantityKg: parseFloat(perFrameQty),
          harvestDate,
          harvestTime,
          beeActivity,
          remarks: remarks || `${scope.toUpperCase()} harvest operation`,
          evidencePhoto
        });
        if (res && res.success) {
          successCount++;
        } else if (res && !res.success) {
          lastError = res.error;
        }
      }

      if (successCount === 0 && lastError) {
        throw new Error(lastError);
      }

      setCommittedHarvestSnapshot(committedSnapshot);
      setSavedHarvestCount(successCount);
      setStep(4);
      const summaryMsg =
        scope === 'frame'
          ? `Harvest recorded for ${committedSnapshot.primaryCode}`
          : scope === 'hive'
          ? `Harvest recorded for Hive ${targetHiveCode} (${successCount} frames, ${totalQty} kg)`
          : `Harvest recorded for Batch ${targetBatchName} (${successCount} frames, ${totalQty} kg)`;
      showToast(summaryMsg);
    } catch (err) {
      console.error('[HarvestModal] Error:', err);
      setErrorMsg(err.message || 'Error recording harvest.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    const snapshot = committedHarvestSnapshot;
    setStep(1);
    setErrorMsg(null);
    setCommittedHarvestSnapshot(null);
    onHarvestSuccess?.(snapshot);
    onClose();
  };

  return (
    <div className="bk-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bk-modal-card bk-harvest-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bk-modal-header">
          <div className="bk-header-title-wrap">
            <div className="bk-header-icon-badge">
              <Droplet size={22} color="#D97706" />
            </div>
            <div>
              <h2 className="bk-modal-title">Record Harvest</h2>
              <p className="bk-modal-sub">
                {scope === 'frame'
                  ? `Harvesting Frame ${targetFrame?.traceabilityCode || ''}`
                  : scope === 'hive'
                  ? `Harvesting Hive ${targetHiveCode} (${targetFrames.length} frames)`
                  : `Harvesting Batch ${targetBatchName} (${targetFrames.length} frames)`}
              </p>
            </div>
          </div>
          <button className="bk-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        {step < 4 && (
          <div className="bk-harvest-step-track">
            <div className={`bk-harvest-step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
              <span className="bk-step-num">1</span>
              <span className="bk-step-text">Target Scope</span>
            </div>
            <div className={`bk-step-connector ${step > 1 ? 'filled' : ''}`} />
            <div className={`bk-harvest-step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
              <span className="bk-step-num">2</span>
              <span className="bk-step-text">Yield & Details</span>
            </div>
            <div className={`bk-step-connector ${step > 2 ? 'filled' : ''}`} />
            <div className={`bk-harvest-step-item ${step === 3 ? 'active' : ''}`}>
              <span className="bk-step-num">3</span>
              <span className="bk-step-text">Confirmation</span>
            </div>
          </div>
        )}

        <div className="bk-stepper-body">
          {errorMsg && (
            <div className="bk-alert-error" role="alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: SCOPE & SELECTION */}
          {step === 1 && (
            <div className="bk-step-content">
              {/* Scope Segmented Controller */}
              <div className="bk-harvest-scope-toggle">
                <button
                  type="button"
                  className={`bk-scope-btn ${scope === 'frame' ? 'active' : ''}`}
                  onClick={() => setScope('frame')}
                >
                  <QrCode size={14} />
                  <span>Single Frame</span>
                </button>
                <button
                  type="button"
                  className={`bk-scope-btn ${scope === 'hive' ? 'active' : ''}`}
                  onClick={() => setScope('hive')}
                >
                  <Building2 size={14} />
                  <span>Entire Hive</span>
                </button>
                <button
                  type="button"
                  className={`bk-scope-btn ${scope === 'batch' ? 'active' : ''}`}
                  onClick={() => setScope('batch')}
                >
                  <Layers size={14} />
                  <span>Entire Batch</span>
                </button>
              </div>

              {/* Dynamic Readiness Confirmation Hero */}
              <div className="bk-harvest-prompt-hero">
                <div className="bk-prompt-badge">
                  <Sparkles size={20} color="#B45309" />
                </div>
                <div className="bk-prompt-text-block">
                  <h3 className="bk-prompt-title">
                    {scope === 'frame'
                      ? `Are you ready to harvest Frame ${targetFrame?.traceabilityCode || ''}?`
                      : scope === 'hive'
                      ? `Are you ready to harvest Hive ${targetHiveCode} (${targetFrames.length} frames)?`
                      : `Are you ready to harvest Batch ${targetBatchName} (${targetFrames.length} frames)?`}
                  </h3>
                  <p className="bk-prompt-sub">
                    {scope === 'frame'
                      ? `Hive ${targetFrame?.hiveCode || targetHiveCode} · ${targetFrame?.cappedPercentage || 85}% capped · ${targetFrame?.honeyType || honeyType}`
                      : scope === 'hive'
                      ? `${targetFrames.length} harvestable frames in super · Est. yield: ${(targetFrames.length * 2.4).toFixed(1)} kg`
                      : `${targetFrames.length} harvestable frames across ${filteredHives.length} hives · Est. yield: ${(targetFrames.length * 2.4).toFixed(1)} kg`}
                  </p>
                </div>
              </div>

              {/* Scope-Specific Selectors */}
              {scope === 'batch' && (
                <div className="bk-form-group">
                  <label className="bk-sub-label">Select Batch to Harvest</label>
                  <select
                    className="bk-select-input"
                    value={selectedBatchId}
                    onChange={e => setSelectedBatchId(e.target.value)}
                  >
                    <option value="all">All Batches &amp; Colonies</option>
                    {availableBatches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(scope === 'hive' || scope === 'frame') && (
                <div className="bk-form-group">
                  <label className="bk-sub-label">Select Hive Colony</label>
                  <select
                    className="bk-select-input"
                    value={selectedHiveId}
                    onChange={e => setSelectedHiveId(e.target.value)}
                  >
                    {filteredHives.map(h => {
                      const code = String(h.code || '').startsWith('H') ? h.code : `H${String(h.code).padStart(3, '0')}`;
                      return (
                        <option key={h.id} value={h.id}>
                          Hive {code} — {h.name || h.type || 'Super'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {scope === 'frame' && (
                <div className="bk-form-group">
                  <label className="bk-sub-label">Select Specific Frame (in Hive {targetHiveCode})</label>
                  <select
                    className="bk-select-input"
                    value={selectedFrameId}
                    onChange={e => setSelectedFrameId(e.target.value)}
                  >
                    {eligibleFrames
                      .filter(f => f.hiveId === targetHive?.id || f.hiveCode === targetHiveCode || f.traceabilityCode?.includes(targetHiveCode))
                      .map(f => (
                        <option key={f.id} value={f.id}>
                          {f.traceabilityCode} (Frame F{f.frameNumber} — {f.cappedPercentage || 85}% capped)
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Target Frames Preview Box */}
              <div className="bk-target-frames-preview">
                <div className="bk-tf-head">
                  <span className="bk-tf-title">Units Included in this Harvest</span>
                  <span className="bk-tf-count">{targetFrames.length} frame(s)</span>
                </div>
                <div className="bk-tf-chips-wrap">
                  {targetFrames.slice(0, 10).map(f => (
                    <span key={f.id} className="bk-tf-chip">
                      {f.traceabilityCode}
                    </span>
                  ))}
                  {targetFrames.length > 10 && (
                    <span className="bk-tf-chip more">+{targetFrames.length - 10} more</span>
                  )}
                </div>
              </div>

              <div className="bk-modal-actions">
                <button type="button" className="btn btn-secondary bk-back-btn" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary bk-next-btn"
                  onClick={handleNext}
                  disabled={targetFrames.length === 0}
                >
                  <span>Proceed to Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: RECORD DETAILS */}
          {step === 2 && (
            <div className="bk-step-content">
              <div className="bk-step-heading">
                <label className="bk-field-label">Harvest Parameters &amp; Yield</label>
                <p className="bk-field-hint">
                  Recording parameters for {targetFrames.length} frame(s) ({scope === 'frame' ? targetFrame?.traceabilityCode : scope === 'hive' ? `Hive ${targetHiveCode}` : `Batch ${targetBatchName}`}).
                </p>
              </div>

              <div className="bk-form-group">
                <div className="bk-label-with-badge">
                  <label className="bk-sub-label" style={{ marginBottom: 0 }}>Floral Source / Honey Variety</label>
                  <span className="bk-inherited-badge">
                    <Lock size={11} />
                    <span>Defined at Colony Setup</span>
                  </span>
                </div>
                <div className="bk-locked-field">
                  <div className="bk-locked-content">
                    <Flower2 size={16} color="#D97706" />
                    <span className="bk-locked-val">{resolvedHoneyVariety}</span>
                  </div>
                  <span className="bk-locked-tag">Immutable Provenance</span>
                </div>
              </div>

              <div className="bk-form-group">
                <label className="bk-sub-label">
                  Total Harvested Net Quantity (kg)
                  <span className="bk-opt"> (~2.4 kg / frame estimated)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="bk-text-input"
                  value={quantityKg}
                  onChange={e => setQuantityKg(e.target.value)}
                  placeholder="e.g. 2.4"
                />
              </div>

              <div className="bk-grid-2">
                <div className="bk-form-group">
                  <label className="bk-sub-label">Harvest Date</label>
                  <input
                    type="date"
                    className="bk-text-input"
                    value={harvestDate}
                    onChange={e => setHarvestDate(e.target.value)}
                  />
                </div>
                <div className="bk-form-group">
                  <label className="bk-sub-label">Harvest Time</label>
                  <input
                    type="time"
                    className="bk-text-input"
                    value={harvestTime}
                    onChange={e => setHarvestTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="bk-form-group">
                <label className="bk-sub-label">Bee Activity Observation</label>
                <input
                  type="text"
                  className="bk-text-input"
                  value={beeActivity}
                  onChange={e => setBeeActivity(e.target.value)}
                  placeholder="e.g. Calm, gentle foraging during harvest"
                />
              </div>

              <div className="bk-form-group">
                <label className="bk-sub-label">Remarks / Extraction Method <span className="bk-opt">(optional)</span></label>
                <input
                  type="text"
                  className="bk-text-input"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Cold uncapped with warm knife. Clean combs."
                />
              </div>

              <div className="bk-modal-actions">
                <button type="button" className="btn btn-secondary bk-back-btn" onClick={handleBack}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="button" className="btn btn-primary bk-next-btn" onClick={handleNext}>
                  <span>Review &amp; Confirm</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION */}
          {step === 3 && (
            <div className="bk-step-content">
              <div className="bk-step-heading">
                <label className="bk-field-label">Review Harvest Commitment</label>
                <p className="bk-field-hint">
                  Committing immutable harvest log to HoneyChain ledger for {targetFrames.length} unit(s).
                </p>
              </div>

              <div className="bk-confirmation-card">
                <div className="bk-conf-hero harvest">
                  <span className="bk-conf-id-label">Harvest Scope: {scope.toUpperCase()}</span>
                  <strong className="bk-conf-id-val">
                    {scope === 'frame'
                      ? targetFrame?.traceabilityCode
                      : scope === 'hive'
                      ? `Hive ${targetHiveCode} (${targetFrames.length} frames)`
                      : `Batch ${targetBatchName} (${targetFrames.length} frames)`}
                  </strong>
                </div>

                <div className="bk-conf-rows">
                  <div className="bk-conf-row">
                    <span className="bk-conf-key">Units Count</span>
                    <span className="bk-conf-val bold">{targetFrames.length} frame(s)</span>
                  </div>
                  <div className="bk-conf-row">
                    <span className="bk-conf-key">Total Quantity</span>
                    <span className="bk-conf-val bold" style={{ color: '#D97706', fontSize: '15px' }}>
                      {quantityKg} kg
                    </span>
                  </div>
                  <div className="bk-conf-row">
                    <span className="bk-conf-key">Honey Variety</span>
                    <span className="bk-conf-val">{honeyType}</span>
                  </div>
                  <div className="bk-conf-row">
                    <span className="bk-conf-key">Harvest Timestamp</span>
                    <span className="bk-conf-val">{harvestDate} · {harvestTime}</span>
                  </div>
                  {remarks && (
                    <div className="bk-conf-row">
                      <span className="bk-conf-key">Remarks</span>
                      <span className="bk-conf-val">{remarks}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bk-field-guarantee">
                <ShieldCheck size={18} color="#15803D" />
                <span>
                  Confirming will update all {targetFrames.length} frame(s) to <strong>HARVESTED</strong> status and record cryptographic lot provenance.
                </span>
              </div>

              <div className="bk-modal-actions">
                <button type="button" className="btn btn-secondary bk-back-btn" onClick={handleBack} disabled={isSubmitting}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary bk-submit-btn"
                  onClick={handleConfirmHarvest}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Recording Harvest...' : `Confirm Harvest (${targetFrames.length} Units)`}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT */}
          {step === 4 && (
            <div className="bk-success-body">
              <div className="bk-success-icon-wrap">
                <CheckCircle2 size={46} color="#15803D" strokeWidth={2.3} />
              </div>
              <h3 className="bk-success-title">Harvest Recorded Successfully</h3>
              <p className="bk-success-desc">
                {savedHarvestCount} frame unit(s) logged and updated to <strong>HARVESTED</strong>.
              </p>

              <div className="bk-code-hero-card">
                <span className="bk-code-label">Harvest Receipt Details</span>
                <div className="bk-code-row">
                  <QrCode size={20} color="#D97706" />
                  <span className="bk-code-value">
                    {scope === 'frame'
                      ? (committedHarvestSnapshot?.primaryCode || targetFrame?.traceabilityCode)
                      : `${committedHarvestSnapshot?.count || savedHarvestCount} Units (${scope.toUpperCase()})`}
                  </span>
                </div>
                <div className="bk-code-breakdown">
                  <span>Total Yield: <strong>{committedHarvestSnapshot?.totalYield || quantityKg} kg</strong></span>
                  <span>Variety: <strong>{committedHarvestSnapshot?.variety || honeyType}</strong></span>
                  <span>Status: <strong>Harvested</strong></span>
                </div>
              </div>

              <p className="bk-next-step-hint">
                These harvested units can now be submitted to the processor for extraction and settling.
              </p>

              <div className="bk-success-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                {onProceedToHandover && (
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => {
                      const snapshot = committedHarvestSnapshot;
                      handleClose();
                      onProceedToHandover(snapshot?.targetFrames?.[0] || targetFrame);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                      color: '#FFF',
                      fontWeight: 700,
                      padding: '11px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Send size={15} />
                    <span>Submit for Processing Now</span>
                  </button>
                )}
                <button className="btn btn-secondary btn-block bk-finish-btn" onClick={handleClose}>
                  Done &amp; Return to Harvest Log
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .bk-harvest-modal-card {
          width: 100%;
          max-width: 500px;
          background: #FAF7F2;
          border: 1px solid rgba(217, 119, 6, 0.16);
          border-radius: 20px;
          box-shadow: 0 20px 50px -10px rgba(52, 38, 27, 0.28);
          overflow: hidden;
        }

        .bk-harvest-step-track {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: #F4EAD8;
          border-bottom: 1px solid #E8DFD1;
        }
        .bk-harvest-step-item {
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0.55;
          transition: all 0.2s ease;
        }
        .bk-harvest-step-item.active {
          opacity: 1;
        }
        .bk-harvest-step-item.completed {
          opacity: 0.85;
        }
        .bk-step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #D8C7B0;
          color: #34261B;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bk-harvest-step-item.active .bk-step-num {
          background: #D97706;
          color: #FFFFFF;
        }
        .bk-harvest-step-item.completed .bk-step-num {
          background: #15803D;
          color: #FFFFFF;
        }
        .bk-step-text {
          font-size: 12px;
          font-weight: 700;
          color: #34261B;
        }
        .bk-step-connector {
          flex: 1;
          height: 2px;
          background: #D8C7B0;
          margin: 0 10px;
          border-radius: 2px;
        }
        .bk-step-connector.filled {
          background: #15803D;
        }

        .bk-stepper-body {
          padding: 20px 24px 24px;
        }

        .bk-step-content {
          display: flex;
          flex-direction: column;
        }

        .bk-step-heading {
          margin-bottom: 14px;
        }

        .bk-harvest-scope-toggle {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          background: #EFE6D8;
          padding: 4px;
          border-radius: 12px;
          border: 1px solid #DFD2BF;
          margin-bottom: 16px;
        }
        .bk-scope-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 8px;
          border: none;
          background: transparent;
          border-radius: 9px;
          font-size: 12.5px;
          font-weight: 700;
          color: #786D61;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .bk-scope-btn:hover {
          color: #34261B;
        }
        .bk-scope-btn.active {
          background: #FFFFFF;
          color: #92400E;
          box-shadow: 0 2px 8px rgba(52, 38, 27, 0.12);
          border: 1px solid #FCD34D;
        }

        .bk-harvest-prompt-hero {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: linear-gradient(135deg, #FFFDF7 0%, #FEF3C7 100%);
          border: 1.5px solid #FCD34D;
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.08);
        }
        .bk-prompt-badge {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #FDE68A;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .bk-prompt-text-block {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .bk-prompt-title {
          font-size: 14.5px;
          font-weight: 800;
          color: #78350F;
          margin: 0;
          line-height: 1.35;
        }
        .bk-prompt-sub {
          font-size: 12.5px;
          color: #92400E;
          margin: 0;
          line-height: 1.4;
          font-weight: 500;
        }

        .bk-form-group {
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
        }
        .bk-sub-label {
          display: block;
          font-size: 12.5px;
          font-weight: 700;
          color: #34261B;
          margin-bottom: 6px;
        }

        .bk-select-input, .bk-text-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1.5px solid #D8C7B0;
          background: #FFFFFF;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }
        .bk-select-input:focus, .bk-text-input:focus {
          border-color: #D97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
        }

        .bk-label-with-badge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .bk-inherited-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #15803D;
          background: #DCFCE7;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid #BBF7D0;
        }
        .bk-locked-field {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #F4EEDF;
          border: 1.5px solid #E2D5C3;
          border-radius: 10px;
          padding: 10px 14px;
          box-sizing: border-box;
        }
        .bk-locked-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bk-locked-val {
          font-size: 14px;
          font-weight: 700;
          color: #34261B;
        }
        .bk-locked-tag {
          font-size: 10.5px;
          font-weight: 700;
          color: #92400E;
          background: #FEF3C7;
          padding: 3px 7px;
          border-radius: 4px;
          border: 1px solid #FDE68A;
          letter-spacing: 0.3px;
        }

        .bk-target-frames-preview {
          background: #FFFFFF;
          border: 1.5px solid #E8DFD3;
          border-radius: 12px;
          padding: 12px 14px;
          margin-top: 6px;
          margin-bottom: 4px;
        }
        .bk-tf-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .bk-tf-title {
          font-size: 11px;
          font-weight: 800;
          color: #6B5E51;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .bk-tf-count {
          font-size: 11.5px;
          font-weight: 800;
          color: #B45309;
          background: #FEF3C7;
          padding: 2px 8px;
          border-radius: 10px;
        }
        .bk-tf-chips-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          max-height: 80px;
          overflow-y: auto;
          padding: 2px 0;
        }
        .bk-tf-chip {
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          background: #FAF7F2;
          border: 1px solid #D8C7B0;
          color: #34261B;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .bk-tf-chip.more {
          background: #FEF3C7;
          color: #92400E;
          border-color: #FCD34D;
          font-family: inherit;
        }

        .bk-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .bk-opt {
          font-size: 11px;
          color: #9C9083;
          font-weight: 400;
        }

        .bk-conf-hero {
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-bottom: 12px;
          border: 1px solid #FCD34D;
        }
        .bk-conf-id-label {
          font-size: 11px;
          font-weight: 800;
          color: #B45309;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .bk-conf-id-val {
          font-size: 16px;
          font-weight: 800;
          color: #78350F;
        }
        .bk-conf-rows {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #FFFFFF;
          border: 1px solid #E8DFD3;
          border-radius: 12px;
          padding: 14px;
        }
        .bk-conf-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }
        .bk-conf-key {
          color: #786D61;
        }
        .bk-conf-val {
          color: var(--color-deep-cocoa, #34261B);
          font-weight: 600;
        }

        .bk-field-guarantee {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 12.5px;
          color: #15803D;
          margin-top: 14px;
          line-height: 1.4;
        }

        .bk-modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #EDE2D1;
        }
        .bk-modal-actions button {
          height: 42px;
          padding: 0 18px;
          font-size: 13.5px;
          font-weight: 700;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .bk-back-btn {
          background: #EFE6D8;
          border: 1px solid #D8C7B0;
          color: #5D5044;
        }
        .bk-back-btn:hover {
          background: #E5DAC8;
          color: #34261B;
        }
        .bk-next-btn, .bk-submit-btn {
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
          border: none;
          color: #FFFFFF;
          box-shadow: 0 3px 10px rgba(217, 119, 6, 0.3);
        }
        .bk-next-btn:hover, .bk-submit-btn:hover {
          background: linear-gradient(135deg, #B45309 0%, #92400E 100%);
          box-shadow: 0 4px 14px rgba(180, 83, 9, 0.4);
        }
        .bk-next-btn:disabled, .bk-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .bk-success-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 12px 0 6px;
        }
        .bk-success-icon-wrap {
          width: 62px;
          height: 62px;
          border-radius: 50%;
          background: #DCFCE7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .bk-success-title {
          font-size: 19px;
          font-weight: 800;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0 0 4px;
        }
        .bk-success-desc {
          font-size: 13.5px;
          color: #786D61;
          margin: 0 0 16px;
        }
        .bk-code-hero-card {
          width: 100%;
          background: #FFFFFF;
          border: 1.5px solid #E8DFD3;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-sizing: border-box;
          text-align: left;
        }
        .bk-code-label {
          font-size: 11px;
          font-weight: 800;
          color: #786D61;
          text-transform: uppercase;
        }
        .bk-code-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bk-code-value {
          font-size: 17px;
          font-weight: 800;
          color: #92400E;
        }
        .bk-code-breakdown {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          color: var(--color-deep-cocoa, #34261B);
          border-top: 1px dashed #D8C7B0;
          padding-top: 10px;
          margin-top: 2px;
        }
        .bk-next-step-hint {
          font-size: 12.5px;
          color: #786D61;
          margin: 14px 0 18px;
          max-width: 340px;
          line-height: 1.4;
        }
        .bk-finish-btn {
          width: 100%;
          height: 44px;
          font-size: 14px;
          font-weight: 800;
          border-radius: 10px;
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
          color: #FFFFFF;
          border: none;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
        }
      `}</style>
    </div>
  );
};
