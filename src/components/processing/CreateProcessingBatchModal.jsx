import React, { useState } from 'react';
import {
  X,
  Plus,
  Layers,
  Scale,
  Building,
  CheckCircle2,
  ShieldCheck,
  Droplet,
  Info,
  Cpu,
  FileCheck,
  ChevronRight,
  Eye
} from 'lucide-react';
import { ProcessorDomainService, INTAKE_STATUSES } from '../../services/processorDomainService';
import { PROCESSING_PROFILES, INITIAL_SOPS, getProfileByCode, getSopById } from '../../data/processor/processingProfiles';
import { ProcessorProfileService } from '../../services/processorProfileService';

export const CreateProcessingBatchModal = ({
  isOpen,
  onClose,
  handoverRecords = [],
  processingBatches = [],
  onCreateBatch
}) => {
  if (!isOpen) return null;

  // Filter only accepted intakes (status === RECEIVED) that have not been assigned to a batch yet
  const availableIntakes = handoverRecords.filter(h => h.status === INTAKE_STATUSES.RECEIVED);

  const [selectedIds, setSelectedIds] = useState(
    availableIntakes.length > 0 ? [availableIntakes[0].id] : []
  );
  const [batchName, setBatchName] = useState('');
  const [facility, setFacility] = useState('HoneyHouse Central Processing #2');
  const [profileCode, setProfileCode] = useState('COMMERCIAL_RETAIL');
  const [productId, setProductId] = useState('prod-wild-01');
  const [marketId, setMarketId] = useState('DOMESTIC_RETAIL');
  const [showPlanPreview, setShowPlanPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate preview of next batch code
  const nextBatchCode = ProcessorDomainService.generateBatchCode(processingBatches);

  const selectedIntakes = availableIntakes.filter(h => selectedIds.includes(h.id));
  const totalWeight = selectedIntakes.reduce((sum, h) => sum + (Number(h.receivedQuantityKg || h.quantityKg) || 0), 0);
  const dominantHoneyType = selectedIntakes[0]?.honeyType || 'Wildflower';

  const products = ProcessorProfileService.getProducts();
  const markets = ProcessorProfileService.getMarkets();
  const activeProfile = getProfileByCode(profileCode);
  const activeSop = getSopById(activeProfile.defaultSopId);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === availableIntakes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableIntakes.map(h => h.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    setIsSubmitting(true);
    const chosenProduct = products.find(p => p.id === productId);
    const chosenMarket = markets.find(m => m.id === marketId);

    const res = onCreateBatch({
      sourceHandoverIds: selectedIds,
      batchName: batchName.trim() || `${dominantHoneyType} Lot ${nextBatchCode.split('-').pop()}`,
      facility,
      profileCode,
      sopId: activeSop.id,
      product: chosenProduct,
      market: chosenMarket
    });
    setIsSubmitting(false);

    if (res?.success) {
      onClose();
    }
  };

  return (
    <div className="proc-modal-backdrop" onClick={onClose}>
      <div className="proc-modal-sheet proc-modal-lg card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="proc-modal-header">
          <div>
            <div className="proc-badge-row">
              <span className="proc-badge-tag">Many-to-One Traceability</span>
              <span className="proc-badge-sop">{activeSop.code} (v{activeSop.version})</span>
            </div>
            <h2 className="proc-modal-title">Create Processing Batch</h2>
          </div>
          <button className="proc-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="proc-modal-body">
          {/* Batch Code Preview */}
          <div className="proc-batch-preview-card">
            <div className="proc-bp-left">
              <span className="proc-bp-lbl">Assigned Batch Identifier</span>
              <span className="proc-bp-code">{nextBatchCode}</span>
            </div>
            <div className="proc-bp-right">
              <span className="proc-bp-lbl">Combined Units & Net Input</span>
              <span className="proc-bp-val">{selectedIds.length} frames · {totalWeight.toFixed(1)} kg</span>
            </div>
          </div>

          {/* Section 1: Processing Profile Selection */}
          <div className="proc-form-group">
            <label className="proc-label">
              <Cpu size={14} />
              <span>Operating Processing Profile & SOP *</span>
            </label>
            <div className="proc-profile-pill-grid">
              {PROCESSING_PROFILES.map(prof => {
                const isSelected = profileCode === prof.code;
                return (
                  <div
                    key={prof.id}
                    className={`proc-prof-pill-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setProfileCode(prof.code)}
                  >
                    <div className="proc-ppc-header">
                      <strong>{prof.name}</strong>
                      {isSelected && <CheckCircle2 size={15} color="#D97706" />}
                    </div>
                    <span className="proc-ppc-tagline">{prof.tagline}</span>
                    <span className="proc-ppc-steps-count">{prof.steps.length} dynamic steps</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Source Intakes Selector */}
          <div className="proc-form-group">
            <div className="proc-intake-sel-header">
              <label className="proc-label">
                <Droplet size={14} />
                <span>Select Accepted Harvest Material ({selectedIds.length} selected) *</span>
              </label>
              {availableIntakes.length > 1 && (
                <button type="button" className="proc-link-btn" onClick={selectAll}>
                  {selectedIds.length === availableIntakes.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {availableIntakes.length === 0 ? (
              <div className="proc-empty-box">
                <Info size={18} color="var(--color-warm-gray)" />
                <p>No unassigned accepted intakes available.</p>
                <span>Accept incoming harvest material in the Intake tab before assembling a batch.</span>
              </div>
            ) : (
              <div className="proc-intake-pick-list">
                {availableIntakes.map(item => {
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`proc-intake-pick-card ${isChecked ? 'active' : ''}`}
                      onClick={() => toggleSelect(item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        aria-label={`Select ${item.traceabilityCode}`}
                      />
                      <div className="proc-intake-pick-details">
                        <div className="proc-ip-row">
                          <strong className="proc-ip-code">{item.traceabilityCode}</strong>
                          <span className="proc-ip-qty">{item.receivedQuantityKg || item.quantityKg} kg</span>
                        </div>
                        <div className="proc-ip-sub">
                          <span>{item.apiaryCode} · {item.hiveCode} · {item.frameNumber}</span>
                          <span>{item.honeyType}</span>
                          <span>Beekeeper: {item.submittingBeekeeper || 'Apiarist'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Product & Target Market */}
          <div className="proc-field-row">
            <div className="proc-field-col">
              <label className="proc-label">Product Registry Spec</label>
              <select
                className="proc-select"
                value={productId}
                onChange={e => setProductId(e.target.value)}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.packagingType})
                  </option>
                ))}
              </select>
            </div>

            <div className="proc-field-col">
              <label className="proc-label">Target Market & Regulatory Compliance</label>
              <select
                className="proc-select"
                value={marketId}
                onChange={e => setMarketId(e.target.value)}
              >
                {markets.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.complianceStandards.join(', ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: Operational Name & Facility */}
          <div className="proc-field-row">
            <div className="proc-field-col">
              <label className="proc-label">Batch Operational Name</label>
              <input
                type="text"
                className="proc-input"
                placeholder={`e.g. ${dominantHoneyType} Lot ${nextBatchCode.split('-').pop()}`}
                value={batchName}
                onChange={e => setBatchName(e.target.value)}
              />
            </div>

            <div className="proc-field-col">
              <label className="proc-label">
                <Building size={14} />
                <span>Processing Facility Asset</span>
              </label>
              <select
                className="proc-select"
                value={facility}
                onChange={e => setFacility(e.target.value)}
              >
                <option value="HoneyHouse Central Processing #2">HoneyHouse Central Processing #2</option>
                <option value="Apiary Yard #1 Extraction Facility">Apiary Yard #1 Extraction Facility</option>
                <option value="Pulwama Cold Valley Extraction Station">Pulwama Cold Valley Extraction Station</option>
              </select>
            </div>
          </div>

          {/* Section 5: Plan Preview Toggle */}
          <div className="proc-plan-preview-toggle-bar">
            <button
              type="button"
              className="proc-preview-btn"
              onClick={() => setShowPlanPreview(!showPlanPreview)}
            >
              <Eye size={15} />
              <span>{showPlanPreview ? 'Hide Suggested Plan Sequence' : 'Preview Suggested Plan Steps'} ({activeProfile.steps.length} steps)</span>
            </button>
          </div>

          {showPlanPreview && (
            <div className="proc-plan-preview-box">
              <span className="proc-ppb-title">SOP Workflow Execution Sequence ({activeSop.code}):</span>
              <div className="proc-ppb-grid">
                {activeProfile.steps.map((st, i) => (
                  <div key={st.stepKey} className="proc-ppb-item">
                    <span className="proc-ppb-idx">{i + 1}</span>
                    <div className="proc-ppb-info">
                      <strong>{st.stepKey.replace(/_/g, ' ')}</strong>
                      <span className={`proc-ppb-req ${st.requirement.toLowerCase()}`}>{st.requirement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="proc-modal-actions-single">
            <button
              type="submit"
              className="btn btn-primary proc-submit-btn"
              disabled={isSubmitting || selectedIds.length === 0}
            >
              <Plus size={16} />
              <span>Initialize Batch {nextBatchCode} ({selectedIds.length} source units)</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .proc-badge-sop {
          background: #FEF3C7;
          color: #92400E;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .proc-profile-pill-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 10px;
          margin-top: 6px;
        }

        .proc-prof-pill-card {
          border: 1.5px solid #E5DCCB;
          border-radius: 10px;
          padding: 10px 12px;
          background: #FFF;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .proc-prof-pill-card:hover {
          border-color: #D97706;
          background: #FFFDF8;
        }

        .proc-prof-pill-card.active {
          border-color: #D97706;
          background: #FFFBEB;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.1);
        }

        .proc-ppc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .proc-ppc-header strong {
          font-size: 13px;
          color: var(--color-deep-cocoa, #2E1F14);
        }

        .proc-ppc-tagline {
          font-size: 11.5px;
          color: var(--color-warm-gray, #6B5B4E);
        }

        .proc-ppc-steps-count {
          font-size: 11px;
          font-weight: 700;
          color: #D97706;
          margin-top: 4px;
        }

        .proc-plan-preview-toggle-bar {
          margin: 6px 0;
        }

        .proc-preview-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #D97706;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          padding: 4px 0;
        }

        .proc-plan-preview-box {
          background: #FAF6ED;
          border: 1px solid #E5DCCB;
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 12px;
        }

        .proc-ppb-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2E1F14);
          display: block;
          margin-bottom: 8px;
        }

        .proc-ppb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 6px;
        }

        .proc-ppb-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FFF;
          border: 1px solid #E5DCCB;
          padding: 6px 8px;
          border-radius: 6px;
        }

        .proc-ppb-idx {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #FAF6ED;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          color: #5C4033;
          flex-shrink: 0;
        }

        .proc-ppb-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .proc-ppb-info strong {
          font-size: 11.5px;
          color: var(--color-deep-cocoa, #2E1F14);
        }

        .proc-ppb-req {
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .proc-ppb-req.mandatory {
          color: #DC2626;
        }

        .proc-ppb-req.optional {
          color: #0284C7;
        }

        .proc-ppb-req.conditional {
          color: #D97706;
        }
      `}</style>
    </div>
  );
};
