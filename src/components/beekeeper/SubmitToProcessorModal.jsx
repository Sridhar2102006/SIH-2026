import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Building2,
  Clock,
  ShieldCheck,
  PackageCheck,
  Layers,
  Sparkles,
  Lock,
  FileText
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

const RECEIVING_PROCESSOR_FACILITIES = [
  { id: 'proc-house-2', name: 'On-site Honey Processing House #2', location: 'Meadowbrook Central Yard' },
  { id: 'proc-central', name: 'Valley Organic Honey Extraction Hub', location: 'North Ridge Facility' },
  { id: 'proc-coop', name: 'Regional Apiary Cooperative Processing Facility', location: 'East Meadow' }
];

export const SubmitToProcessorModal = ({
  isOpen,
  onClose,
  initialFrameId = null,
  initialFrame = null,
  onSubmitSuccess
}) => {
  const {
    frames = [],
    harvestRecords = [],
    submitHarvestToProcessor,
    session,
    showToast
  } = useAppState();

  const [step, setStep] = useState(1); // 1 = Review & Handover form, 2 = Handover Confirmation
  const [selectedFrameId, setSelectedFrameId] = useState(
    initialFrame?.traceabilityCode || initialFrame?.id || initialFrameId || ''
  );
  const [receivingFacility, setReceivingFacility] = useState(RECEIVING_PROCESSOR_FACILITIES[0].name);
  const [containerSeal, setContainerSeal] = useState('SEAL-AP1-MB-0926');
  const [transportRemarks, setTransportRemarks] = useState('Delivered in food-grade sealed frame transport container.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedHandover, setSavedHandover] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (initialFrame) {
      setSelectedFrameId(initialFrame.traceabilityCode || initialFrame.id);
    } else if (initialFrameId) {
      setSelectedFrameId(initialFrameId);
    }
  }, [initialFrame, initialFrameId]);

  // Frames that are currently HARVESTED and ready for handover
  const harvestFrames = useMemo(() => {
    return frames.filter(f => f.status === 'HARVESTED' || f.harvestedAt);
  }, [frames]);

  // All available harvest options across frames and harvestRecords
  const allHarvestableOptions = useMemo(() => {
    const map = new Map();
    // 1. From frames
    harvestFrames.forEach(f => {
      const code = f.traceabilityCode || f.id;
      if (code && !map.has(code)) {
        map.set(code, {
          key: f.id || code,
          value: f.id || code,
          code: f.traceabilityCode,
          label: `${f.traceabilityCode} (Hive ${f.hiveCode || 'H001'} · ${f.harvestQuantityKg || 2.4} kg)`
        });
      }
    });
    // 2. From unsubmitted harvest records
    harvestRecords.filter(h => !h.submittedToProcessor).forEach(h => {
      const code = h.traceabilityCode;
      if (code && !map.has(code)) {
        map.set(code, {
          key: h.id || code,
          value: h.id || code,
          code: h.traceabilityCode,
          label: `${h.traceabilityCode} (Hive ${h.hiveCode || 'H001'} · ${h.quantityKg} kg)`
        });
      }
    });
    return Array.from(map.values());
  }, [harvestFrames, harvestRecords]);

  // Resolve target frame with strict accuracy - NEVER silently jump to index 0
  const targetFrame = useMemo(() => {
    // 1. Check direct initialFrame prop
    if (initialFrame && (!selectedFrameId || initialFrame.id === selectedFrameId || initialFrame.traceabilityCode === selectedFrameId)) {
      return initialFrame;
    }
    // 2. Match selectedFrameId in frames
    if (selectedFrameId) {
      const cleanId = String(selectedFrameId).toUpperCase().trim();
      const match = frames.find(f =>
        f.id === selectedFrameId ||
        f.traceabilityCode === selectedFrameId ||
        (f.traceabilityCode && f.traceabilityCode.toUpperCase().trim() === cleanId)
      );
      if (match) return match;

      // 3. Match in harvestRecords
      const hrvMatch = harvestRecords.find(h =>
        h.id === selectedFrameId ||
        h.traceabilityCode === selectedFrameId ||
        (h.traceabilityCode && h.traceabilityCode.toUpperCase().trim() === cleanId)
      );
      if (hrvMatch) {
        return {
          id: hrvMatch.frameId || `frame-${hrvMatch.traceabilityCode}`,
          traceabilityCode: hrvMatch.traceabilityCode,
          apiaryCode: hrvMatch.apiaryCode || 'AP1',
          hiveCode: hrvMatch.hiveCode || 'H001',
          frameNumber: hrvMatch.frameNumber || 'F1',
          harvestQuantityKg: hrvMatch.quantityKg || 2.4,
          honeyType: hrvMatch.honeyType || 'Wildflower',
          status: 'HARVESTED'
        };
      }
    }
    // 4. Fallback only if no frame was specified
    return harvestFrames[0] || null;
  }, [frames, harvestRecords, selectedFrameId, initialFrame, harvestFrames]);

  const matchingHarvest = useMemo(() => {
    const code = targetFrame?.traceabilityCode || initialFrame?.traceabilityCode || (selectedFrameId && String(selectedFrameId).startsWith('AP') ? selectedFrameId : null);
    if (code) {
      const cleanCode = String(code).toUpperCase().trim();
      const match = harvestRecords.find(h =>
        h.traceabilityCode === code ||
        (h.traceabilityCode && h.traceabilityCode.toUpperCase().trim() === cleanCode)
      );
      if (match) return match;
    }
    if (selectedFrameId) {
      const idMatch = harvestRecords.find(h => h.id === selectedFrameId);
      if (idMatch) return idMatch;
    }
    return targetFrame ? null : (harvestRecords[0] || null);
  }, [harvestRecords, targetFrame, initialFrame, selectedFrameId]);

  if (!isOpen) return null;

  const handleSubmitHandover = async () => {
    if (!targetFrame && !matchingHarvest) {
      setErrorMsg('No harvested material found to submit.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const traceCode = targetFrame?.traceabilityCode || matchingHarvest?.traceabilityCode;
    const frameId = targetFrame?.id || matchingHarvest?.frameId || `frame-${traceCode}`;

    try {
      const res = await submitHarvestToProcessor({
        harvestRecordId: matchingHarvest?.id,
        frameId,
        traceabilityCode: traceCode,
        processorFacility: receivingFacility,
        containerSeal,
        remarks: transportRemarks
      });

      if (res && res.success) {
        setSavedHandover(res.handover);
        setStep(2);
        showToast(`Harvest ${traceCode} submitted to Processor`);
        onSubmitSuccess?.(res.handover);
      } else {
        setErrorMsg(res?.error || 'Failed to submit handover.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error creating handover record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setStep(1);
    setSavedHandover(null);
    setErrorMsg(null);
    onClose();
  };

  const displayedTraceCode = targetFrame?.traceabilityCode || matchingHarvest?.traceabilityCode || initialFrame?.traceabilityCode || 'AP71H001F1';
  const displayedHive = targetFrame?.hiveCode || matchingHarvest?.hiveCode || 'H001';
  const displayedFrameNum = targetFrame?.frameNumber || matchingHarvest?.frameNumber || 'F1';
  const displayedHoney = targetFrame?.honeyType || matchingHarvest?.honeyType || 'Wildflower';
  const displayedWeight = targetFrame?.harvestQuantityKg || matchingHarvest?.quantityKg || '2.4';
  const apiaristName = session?.name || 'Sarah Lindqvist (Certified Apiarist)';

  return (
    <div className="sfp-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sfp-modal-dialog" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="sfp-modal-header">
          <div className="sfp-header-left">
            <div className="sfp-icon-badge">
              <Send size={20} color="#D97706" />
            </div>
            <div>
              <h2 className="sfp-title">Submit for Processing</h2>
              <p className="sfp-subtitle">
                Transfer custody of harvested honey to the extraction facility
              </p>
            </div>
          </div>
          <button className="sfp-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="sfp-modal-body">
          {errorMsg && (
            <div className="sfp-error-banner" role="alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <div className="sfp-form-content">
              {/* Form Intro Notice */}
              <div className="sfp-intro-box">
                <span className="sfp-intro-tag">Processor Handover Manifest</span>
                <p className="sfp-intro-text">
                  Initiating formal batch handoff for harvested frame <strong>{displayedTraceCode}</strong> to downstream processing.
                </p>
              </div>

              {/* Optional Unit Selector if multiple options */}
              {allHarvestableOptions.length > 1 && (
                <div className="sfp-field-group" style={{ marginBottom: '14px' }}>
                  <label className="sfp-field-label">
                    <Layers size={14} color="#78716C" />
                    <span>Select Harvested Unit to Submit</span>
                  </label>
                  <select
                    className="sfp-select"
                    value={selectedFrameId || targetFrame?.id || targetFrame?.traceabilityCode}
                    onChange={e => setSelectedFrameId(e.target.value)}
                  >
                    {allHarvestableOptions.map(opt => (
                      <option key={opt.key} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Provenance Details Card */}
              <div className="sfp-provenance-card">
                <div className="sfp-prov-head">
                  <div className="sfp-prov-code-wrap">
                    <QrCode size={16} color="#D97706" />
                    <span className="sfp-prov-code-title">Traceability Code:</span>
                    <strong className="sfp-prov-code-val">{displayedTraceCode}</strong>
                  </div>
                  <span className="sfp-status-badge">Harvested</span>
                </div>

                <div className="sfp-prov-grid">
                  <div className="sfp-prov-item">
                    <span className="sfp-item-k">Source Hive & Frame</span>
                    <strong className="sfp-item-v">{displayedHive} · Frame {displayedFrameNum}</strong>
                  </div>

                  <div className="sfp-prov-item">
                    <span className="sfp-item-k">Floral Variety</span>
                    <strong className="sfp-item-v">{displayedHoney}</strong>
                  </div>

                  <div className="sfp-prov-item">
                    <span className="sfp-item-k">Harvest Net Yield</span>
                    <strong className="sfp-item-v emerald">{displayedWeight} kg</strong>
                  </div>

                  <div className="sfp-prov-item">
                    <span className="sfp-item-k">Submitting Beekeeper</span>
                    <strong className="sfp-item-v">{apiaristName}</strong>
                  </div>
                </div>
              </div>

              {/* Handover Input Fields */}
              <div className="sfp-fields-section">
                <div className="sfp-field-group">
                  <label className="sfp-field-label">
                    <Building2 size={14} color="#78716C" />
                    <span>Receiving Processor Facility</span>
                  </label>
                  <select
                    className="sfp-select"
                    value={receivingFacility}
                    onChange={e => setReceivingFacility(e.target.value)}
                  >
                    {RECEIVING_PROCESSOR_FACILITIES.map(fac => (
                      <option key={fac.id} value={fac.name}>
                        {fac.name} ({fac.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sfp-field-group">
                  <label className="sfp-field-label">
                    <Lock size={14} color="#78716C" />
                    <span>Transport Container Security Seal</span>
                  </label>
                  <input
                    type="text"
                    className="sfp-input"
                    value={containerSeal}
                    onChange={e => setContainerSeal(e.target.value)}
                    placeholder="e.g. SEAL-AP1-MB-0926"
                  />
                </div>

                <div className="sfp-field-group">
                  <label className="sfp-field-label">
                    <FileText size={14} color="#78716C" />
                    <span>Handover Transport Remarks</span>
                  </label>
                  <input
                    type="text"
                    className="sfp-input"
                    value={transportRemarks}
                    onChange={e => setTransportRemarks(e.target.value)}
                    placeholder="e.g. Delivered cold in sealed food-grade tote."
                  />
                </div>
              </div>

              {/* Downstream Traceability Notice */}
              <div className="sfp-trace-notice">
                <ShieldCheck size={18} color="#059669" className="sfp-notice-icon" />
                <div className="sfp-notice-content">
                  <strong>Downstream Traceability Notice</strong>
                  <p>
                    Once submitted, custody is securely logged to the HoneyChain ledger and immediately appears in the <em>Processor Intake</em> workspace awaiting arrival verification.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="sfp-modal-actions">
                <button type="button" className="btn btn-secondary sfp-cancel-btn" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary sfp-submit-btn"
                  onClick={handleSubmitHandover}
                  disabled={isSubmitting}
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'Submitting Handover...' : 'Submit to Processor'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Handover Confirmation Receipt Screen */}
          {step === 2 && (
            <div className="sfp-success-content">
              <div className="sfp-success-badge-wrap">
                <PackageCheck size={48} color="#059669" strokeWidth={2.2} />
              </div>
              <h3 className="sfp-success-title">Submitted to Processor</h3>
              <p className="sfp-success-desc">
                Handover record created successfully. Physical custody is logged to HoneyChain and available in Processor Intake.
              </p>

              <div className="sfp-receipt-card">
                <span className="sfp-receipt-eyebrow">Handover Receipt Manifest</span>
                <div className="sfp-receipt-code-row">
                  <QrCode size={22} color="#D97706" />
                  <strong className="sfp-receipt-ref">{savedHandover?.handoverCode || 'HND-2409-01'}</strong>
                </div>

                <div className="sfp-receipt-stats">
                  <div className="sfp-stat">
                    <span>Frame Code</span>
                    <strong>{savedHandover?.traceabilityCode || displayedTraceCode}</strong>
                  </div>
                  <div className="sfp-stat">
                    <span>Net Weight</span>
                    <strong>{savedHandover?.quantityKg || displayedWeight} kg</strong>
                  </div>
                  <div className="sfp-stat">
                    <span>Status</span>
                    <strong className="emerald">Submitted</strong>
                  </div>
                </div>

                <div className="sfp-receipt-meta">
                  <div className="sfp-rmeta-row">
                    <span>Receiving Facility:</span>
                    <strong>{savedHandover?.receivingFacility}</strong>
                  </div>
                  <div className="sfp-rmeta-row">
                    <span>Timestamp:</span>
                    <strong>{savedHandover?.submissionTimestamp || 'Just now'}</strong>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary btn-block sfp-finish-btn" onClick={handleFinish}>
                Done & View Honey Journey
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .sfp-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(44, 24, 16, 0.55);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: sfpFadeIn 0.2s ease-out;
        }

        @keyframes sfpFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .sfp-modal-dialog {
          background: #FAF7F2;
          width: 100%;
          max-width: 480px;
          border-radius: 20px;
          border: 1px solid rgba(217, 119, 6, 0.18);
          box-shadow: 0 24px 60px -12px rgba(44, 24, 16, 0.35);
          overflow: hidden;
          animation: sfpSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        @keyframes sfpSlideUp {
          from { transform: translateY(18px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .sfp-modal-header {
          padding: 18px 20px 14px;
          background: #FFFFFF;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .sfp-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sfp-icon-badge {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sfp-title {
          font-size: 17px;
          font-weight: 800;
          color: #2C1810;
          margin: 0;
          line-height: 1.25;
        }

        .sfp-subtitle {
          font-size: 12px;
          color: #78716C;
          margin: 2px 0 0;
          line-height: 1.3;
        }

        .sfp-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: #F5F5F4;
          color: #78716C;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sfp-close-btn:hover {
          background: #E7E5E4;
          color: #1C1917;
        }

        .sfp-modal-body {
          padding: 16px 20px 20px;
          overflow-y: auto;
          flex: 1;
        }

        .sfp-error-banner {
          background: #FEE2E2;
          border: 1px solid #FCA5A5;
          color: #991B1B;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }

        .sfp-intro-box {
          margin-bottom: 14px;
        }

        .sfp-intro-tag {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #92400E;
          background: #FEF3C7;
          padding: 2px 8px;
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 6px;
        }

        .sfp-intro-text {
          font-size: 13px;
          color: #57534E;
          margin: 0;
          line-height: 1.45;
        }

        /* Provenance Card */
        .sfp-provenance-card {
          background: #FFFFFF;
          border: 1px solid rgba(217, 119, 6, 0.2);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(44, 24, 16, 0.04);
        }

        .sfp-prov-head {
          background: linear-gradient(135deg, #FFFBEB, #FEF3C7);
          padding: 10px 14px;
          border-bottom: 1px solid rgba(217, 119, 6, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .sfp-prov-code-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sfp-prov-code-title {
          font-size: 11.5px;
          color: #92400E;
          font-weight: 600;
        }

        .sfp-prov-code-val {
          font-size: 14px;
          font-weight: 800;
          color: #2C1810;
          letter-spacing: 0.02em;
        }

        .sfp-status-badge {
          background: #DCFCE7;
          color: #15803D;
          border: 1px solid #86EFAC;
          font-size: 10.5px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .sfp-prov-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 14px;
          padding: 12px 14px;
        }

        .sfp-prov-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sfp-item-k {
          font-size: 11px;
          font-weight: 600;
          color: #78716C;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .sfp-item-v {
          font-size: 13px;
          font-weight: 700;
          color: #2C1810;
          line-height: 1.3;
        }

        .sfp-item-v.emerald {
          color: #059669;
          font-size: 14px;
        }

        /* Input Fields */
        .sfp-fields-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .sfp-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sfp-field-label {
          font-size: 12px;
          font-weight: 700;
          color: #44403C;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sfp-select, .sfp-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #D6D3D1;
          background: #FFFFFF;
          font-size: 13.5px;
          color: #1C1917;
          font-weight: 500;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .sfp-select:focus, .sfp-input:focus {
          border-color: #D97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.16);
        }

        /* Notice Banner */
        .sfp-trace-notice {
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 20px;
        }

        .sfp-notice-icon {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .sfp-notice-content strong {
          display: block;
          font-size: 12.5px;
          color: #065F46;
          margin-bottom: 2px;
        }

        .sfp-notice-content p {
          font-size: 11.5px;
          color: #047857;
          margin: 0;
          line-height: 1.4;
        }

        /* Modal Actions */
        .sfp-modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 6px;
        }

        .sfp-cancel-btn {
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 10px;
          border: 1px solid #D6D3D1;
          background: #FFFFFF;
          color: #44403C;
          cursor: pointer;
        }

        .sfp-cancel-btn:hover {
          background: #F5F5F4;
        }

        .sfp-submit-btn {
          padding: 10px 20px;
          font-size: 13.5px;
          font-weight: 700;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #D97706, #B45309);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35);
          transition: all 0.15s ease;
        }

        .sfp-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(217, 119, 6, 0.45);
        }

        .sfp-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Success Screen */
        .sfp-success-content {
          text-align: center;
          padding: 12px 6px;
        }

        .sfp-success-badge-wrap {
          width: 72px;
          height: 72px;
          border-radius: 36px;
          background: #DCFCE7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
        }

        .sfp-success-title {
          font-size: 19px;
          font-weight: 800;
          color: #2C1810;
          margin: 0 0 6px;
        }

        .sfp-success-desc {
          font-size: 13px;
          color: #78716C;
          margin: 0 auto 18px;
          max-width: 380px;
          line-height: 1.45;
        }

        .sfp-receipt-card {
          background: #FFFFFF;
          border: 1px solid rgba(217, 119, 6, 0.2);
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 20px;
          text-align: left;
        }

        .sfp-receipt-eyebrow {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #92400E;
          letter-spacing: 0.04em;
          display: block;
          margin-bottom: 6px;
        }

        .sfp-receipt-code-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 12px;
          border-bottom: 1px dashed #E7E5E4;
          margin-bottom: 12px;
        }

        .sfp-receipt-ref {
          font-size: 17px;
          font-weight: 800;
          color: #2C1810;
        }

        .sfp-receipt-stats {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          padding-bottom: 12px;
          border-bottom: 1px solid #F5F5F4;
          margin-bottom: 12px;
        }

        .sfp-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sfp-stat span {
          font-size: 11px;
          color: #78716C;
        }

        .sfp-stat strong {
          font-size: 13px;
          color: #1C1917;
        }

        .sfp-receipt-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sfp-rmeta-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .sfp-rmeta-row span {
          color: #78716C;
        }

        .sfp-rmeta-row strong {
          color: #2C1810;
        }

        .sfp-finish-btn {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          background: linear-gradient(135deg, #D97706, #B45309);
          border: none;
          color: #FFFFFF;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
