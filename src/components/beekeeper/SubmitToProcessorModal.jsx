import React, { useState, useMemo } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  PackageCheck
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
  const [selectedFrameId, setSelectedFrameId] = useState(initialFrameId || '');
  const [receivingFacility, setReceivingFacility] = useState(RECEIVING_PROCESSOR_FACILITIES[0].name);
  const [containerSeal, setContainerSeal] = useState('SEAL-AP1-MB-0926');
  const [transportRemarks, setTransportRemarks] = useState('Delivered in food-grade sealed frame transport container.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedHandover, setSavedHandover] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Frames that are currently HARVESTED and ready for handover
  const harvestFrames = useMemo(() => {
    return frames.filter(f => f.status === 'HARVESTED' || f.harvestedAt);
  }, [frames]);

  const targetFrame = useMemo(() => {
    return frames.find(f => f.id === selectedFrameId || f.traceabilityCode === selectedFrameId) || harvestFrames[0];
  }, [frames, selectedFrameId, harvestFrames]);

  const matchingHarvest = useMemo(() => {
    return harvestRecords.find(h => h.traceabilityCode === targetFrame?.traceabilityCode) || harvestRecords[0];
  }, [harvestRecords, targetFrame]);

  if (!isOpen) return null;

  const handleSubmitHandover = async () => {
    if (!targetFrame) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await submitHarvestToProcessor({
        harvestRecordId: matchingHarvest?.id,
        frameId: targetFrame.id,
        traceabilityCode: targetFrame.traceabilityCode,
        processorFacility: receivingFacility,
        containerSeal,
        remarks: transportRemarks
      });

      if (res && res.success) {
        setSavedHandover(res.handover);
        setStep(2);
        showToast(`Harvest ${targetFrame.traceabilityCode} submitted to Processor`);
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

  return (
    <div className="bk-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bk-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bk-modal-header">
          <div className="bk-header-title-wrap">
            <div className="bk-header-icon-badge">
              <Send size={20} color="#496B45" />
            </div>
            <div>
              <h2 className="bk-modal-title">Submit for Processing</h2>
              <p className="bk-modal-sub">
                Hand over harvested frame honey to the extraction facility
              </p>
            </div>
          </div>
          <button className="bk-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="bk-stepper-body">
          {errorMsg && (
            <div className="bk-alert-error" role="alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <div className="bk-step-content">
              <label className="bk-field-label">Processor Handover Form</label>
              <p className="bk-field-hint">
                You are transferring custody of harvested frame <strong>{targetFrame?.traceabilityCode}</strong> to the processing workspace.
              </p>

              {/* Harvest Provenance Card */}
              <div className="bk-confirmation-card">
                <div className="bk-conf-hero" style={{ background: '#496B45' }}>
                  <span className="bk-conf-id-label">Traceability Identity</span>
                  <strong className="bk-conf-id-val">{targetFrame?.traceabilityCode}</strong>
                </div>
                <div className="bk-conf-rows">
                  <div className="bk-conf-row">
                    <span className="bk-conf-key">Source Hive & Frame</span>
                    <span className="bk-conf-val">{targetFrame?.hiveCode} · Frame {targetFrame?.frameNumber}</span>
                  </div>
                  <div className="bk-conf-row">
                    <span className="bk-conf-key">Honey Floral Type</span>
                    <span className="bk-conf-val">{targetFrame?.honeyType || 'Wildflower'}</span>
                  </div>
                  <div className="bk-conf-row">
                    <span className="bk-conf-key">Harvest Net Yield</span>
                    <span className="bk-conf-val green">{targetFrame?.harvestQuantityKg || matchingHarvest?.quantityKg || '2.4'} kg</span>
                  </div>
                  <div className="bk-conf-row">
                    <span className="bk-conf-key">Submitting Beekeeper</span>
                    <span className="bk-conf-val">{session?.name || 'Sarah Lindqvist (Certified Apiarist)'}</span>
                  </div>
                </div>
              </div>

              {/* Handover Details */}
              <div className="bk-input-group" style={{ marginTop: '14px' }}>
                <label className="bk-sub-label">Receiving Processor Facility</label>
                <select
                  className="bk-select-input"
                  value={receivingFacility}
                  onChange={e => setReceivingFacility(e.target.value)}
                >
                  {RECEIVING_PROCESSOR_FACILITIES.map(fac => (
                    <option key={fac.id} value={fac.name}>{fac.name} ({fac.location})</option>
                  ))}
                </select>
              </div>

              <div className="bk-input-group" style={{ marginTop: '14px' }}>
                <label className="bk-sub-label">Transport Container Security Seal</label>
                <input
                  type="text"
                  className="bk-text-input"
                  value={containerSeal}
                  onChange={e => setContainerSeal(e.target.value)}
                  placeholder="e.g. SEAL-AP1-MB-0926"
                />
              </div>

              <div className="bk-input-group" style={{ marginTop: '14px' }}>
                <label className="bk-sub-label">Handover Transport Remarks</label>
                <input
                  type="text"
                  className="bk-text-input"
                  value={transportRemarks}
                  onChange={e => setTransportRemarks(e.target.value)}
                  placeholder="e.g. Delivered cold in sealed food-grade tote."
                />
              </div>

              {/* Authorization Boundary Note (Section 26) */}
              <div className="bk-boundary-notice">
                <ShieldCheck size={18} color="#496B45" />
                <p>
                  <strong>Downstream Traceability Notice:</strong> After submission, you will be able to track your honey’s progress (settling, quality testing, packaging, dispatch) in <em>My Honey Journey</em> with read-only visibility.
                </p>
              </div>

              <div className="bk-modal-actions">
                <button type="button" className="btn btn-secondary bk-back-btn" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary bk-submit-btn"
                  onClick={handleSubmitHandover}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting Handover...' : 'Submit to Processor'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Handover Confirmation Screen */}
          {step === 2 && (
            <div className="bk-success-body">
              <div className="bk-success-icon-wrap">
                <PackageCheck size={48} color="#496B45" strokeWidth={2.2} />
              </div>
              <h3 className="bk-success-title">Submitted to Processor</h3>
              <p className="bk-success-desc">
                Handover record created successfully. Custody has been recorded in the HoneyChain ledger.
              </p>

              <div className="bk-code-hero-card">
                <span className="bk-code-label">Handover Reference</span>
                <div className="bk-code-row">
                  <QrCode size={22} color="#496B45" />
                  <span className="bk-code-value">{savedHandover?.handoverCode || 'HND-2409-01'}</span>
                </div>
                <div className="bk-code-breakdown">
                  <span>Code: <strong>{savedHandover?.traceabilityCode}</strong></span>
                  <span>Yield: <strong>{savedHandover?.quantityKg} kg</strong></span>
                  <span>Status: <strong>Submitted</strong></span>
                </div>
              </div>

              <div className="bk-handover-meta-card">
                <div className="bk-conf-row">
                  <span className="bk-conf-key">Receiving Facility:</span>
                  <span className="bk-conf-val">{savedHandover?.receivingFacility}</span>
                </div>
                <div className="bk-conf-row">
                  <span className="bk-conf-key">Timestamp:</span>
                  <span className="bk-conf-val">{savedHandover?.submissionTimestamp || 'Just now'}</span>
                </div>
              </div>

              <button className="btn btn-primary btn-block bk-finish-btn" onClick={handleFinish}>
                Done & View Honey Journey
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .bk-boundary-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(73, 107, 69, 0.1);
          padding: 12px 14px;
          border-radius: 10px;
          margin-top: 16px;
        }
        .bk-boundary-notice p {
          font-size: 12px;
          color: #34261B;
          margin: 0;
          line-height: 1.45;
        }
        .bk-handover-meta-card {
          background: #FFFFFF;
          border: 1px solid var(--color-card-border);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
          text-align: left;
        }
      `}</style>
    </div>
  );
};
