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
  Eye,
  QrCode
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
      <div className="proc-modal-sheet proc-modal-lg" onClick={e => e.stopPropagation()}>
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
                        className="proc-checkbox-custom"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        aria-label={`Select ${item.traceabilityCode}`}
                      />
                      <div className="proc-intake-pick-details">
                        <div className="proc-ip-row">
                          <strong className="proc-ip-code">
                            <QrCode size={15} color="#D97706" />
                            <span>{item.traceabilityCode}</span>
                          </strong>
                          <span className="proc-ip-qty">{item.receivedQuantityKg || item.quantityKg} kg</span>
                        </div>
                        <div className="proc-ip-sub">
                          <span className="proc-sub-badge">Hive {item.hiveCode || 'H001'} · Frame {item.frameNumber || 'F1'}</span>
                          <span className="proc-sub-badge amber">{item.honeyType || 'Wildflower'}</span>
                          <span className="proc-sub-beekeeper">Beekeeper: {item.submittingBeekeeper || 'Apiarist'}</span>
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
        @keyframes procFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes procSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .proc-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(26, 17, 8, 0.65);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 16px;
          animation: procFadeIn 0.2s ease-out;
        }

        .proc-modal-sheet.proc-modal-lg {
          background: #FFFFFF;
          width: 100%;
          max-width: 820px;
          max-height: 88vh;
          border-radius: 24px;
          box-shadow: 0 28px 70px -12px rgba(28, 17, 8, 0.42), 0 0 0 1px rgba(217, 119, 6, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          animation: procSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .proc-modal-sheet.proc-modal-lg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #D97706 0%, #F59E0B 45%, #FBBF24 70%, #B45309 100%);
          z-index: 20;
          box-shadow: 0 1px 6px rgba(217, 119, 6, 0.35);
        }

        .proc-modal-header {
          padding: 20px 26px 18px;
          border-bottom: 1px solid rgba(217, 119, 6, 0.14);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: linear-gradient(180deg, #FFFDF9 0%, #FAF6EE 100%);
          flex-shrink: 0;
          position: relative;
          z-index: 5;
        }

        .proc-badge-row {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 6px;
        }

        .proc-badge-tag {
          background: rgba(217, 119, 6, 0.12);
          color: #B45309;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .proc-badge-sop {
          background: #FEF3C7;
          color: #92400E;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid #FDE68A;
        }

        .proc-modal-title {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          color: #2E1F14;
          letter-spacing: -0.3px;
        }

        .proc-close-btn {
          background: transparent;
          border: none;
          color: #8C7E72;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .proc-close-btn:hover {
          background: #F3EDE2;
          color: #2E1F14;
        }

        .proc-modal-body {
          padding: 20px 24px 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
          scrollbar-width: thin;
          scrollbar-color: #D97706 transparent;
        }

        .proc-modal-body::-webkit-scrollbar {
          width: 6px;
        }
        .proc-modal-body::-webkit-scrollbar-thumb {
          background: #E5DCCB;
          border-radius: 4px;
        }
        .proc-modal-body::-webkit-scrollbar-thumb:hover {
          background: #D97706;
        }

        .proc-batch-preview-card {
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
          border: 1.5px solid #FDE68A;
          border-radius: 14px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.06);
          flex-shrink: 0;
        }

        .proc-bp-left, .proc-bp-right {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .proc-bp-right {
          align-items: flex-end;
          text-align: right;
        }

        .proc-bp-lbl {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #92400E;
        }

        .proc-bp-code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 17px;
          font-weight: 800;
          color: #B45309;
          letter-spacing: -0.3px;
        }

        .proc-bp-val {
          font-size: 13.5px;
          font-weight: 700;
          color: #78350F;
        }

        .proc-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .proc-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 700;
          color: #4A3B32;
        }

        .proc-intake-sel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .proc-link-btn {
          background: none;
          border: none;
          color: #D97706;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          transition: background 0.15s;
        }

        .proc-link-btn:hover {
          background: #FEF3C7;
          text-decoration: underline;
        }

        .proc-profile-pill-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 10px;
        }

        .proc-prof-pill-card {
          border: 1.5px solid #E5DCCB;
          border-radius: 12px;
          padding: 12px 14px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.18s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .proc-prof-pill-card:hover {
          border-color: #D97706;
          background: #FFFDF8;
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(217, 119, 6, 0.08);
        }

        .proc-prof-pill-card.active {
          border-color: #D97706;
          background: #FFFBEB;
          box-shadow: 0 3px 12px rgba(217, 119, 6, 0.12);
        }

        .proc-ppc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .proc-ppc-header strong {
          font-size: 13.5px;
          color: #2E1F14;
          font-weight: 700;
        }

        .proc-ppc-tagline {
          font-size: 11.5px;
          color: #6B5B4E;
          line-height: 1.35;
        }

        .proc-ppc-steps-count {
          font-size: 11px;
          font-weight: 800;
          color: #D97706;
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .proc-empty-box {
          padding: 24px;
          text-align: center;
          background: #FAF6ED;
          border: 1.5px dashed #D6CEBE;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .proc-empty-box p {
          margin: 0;
          font-weight: 700;
          color: #4A3B32;
          font-size: 13.5px;
        }

        .proc-empty-box span {
          font-size: 11.5px;
          color: #8C7E72;
        }

        .proc-intake-pick-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 220px;
          overflow-y: auto;
          padding-right: 4px;
          scrollbar-width: thin;
        }

        .proc-intake-pick-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: #FFFFFF;
          border: 1.5px solid #E5DCCB;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .proc-intake-pick-card:hover {
          border-color: #D97706;
          background: #FFFDF8;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.08);
        }

        .proc-intake-pick-card.active {
          border-color: #D97706;
          background: #FFFBEB;
          box-shadow: 0 2px 10px rgba(217, 119, 6, 0.12);
        }

        .proc-checkbox-custom {
          width: 18px;
          height: 18px;
          accent-color: #D97706;
          cursor: pointer;
          flex-shrink: 0;
        }

        .proc-intake-pick-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .proc-ip-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .proc-ip-code {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13.5px;
          font-weight: 700;
          color: #2E1F14;
        }

        .proc-ip-qty {
          font-size: 12.5px;
          font-weight: 800;
          color: #B45309;
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          padding: 2px 9px;
          border-radius: 20px;
        }

        .proc-ip-sub {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
          font-size: 11.5px;
        }

        .proc-sub-badge {
          background: #F3EDE2;
          color: #5C4D42;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .proc-sub-badge.amber {
          background: #FDF6E2;
          color: #92400E;
          font-weight: 700;
          border: 1px solid #FDE68A;
        }

        .proc-sub-beekeeper {
          color: #786C60;
          font-size: 11px;
          margin-left: auto;
        }

        .proc-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        @media (max-width: 600px) {
          .proc-field-row {
            grid-template-columns: 1fr;
          }
        }

        .proc-field-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .proc-input,
        .proc-select {
          width: 100%;
          box-sizing: border-box;
          height: 42px;
          padding: 0 12px;
          font-size: 13px;
          color: #2E1F14;
          background: #FFFFFF;
          border: 1.5px solid #D6CEBE;
          border-radius: 10px;
          transition: all 0.15s ease;
          outline: none;
        }

        .proc-input:focus,
        .proc-select:focus {
          border-color: #D97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
        }

        .proc-plan-preview-toggle-bar {
          margin: 2px 0;
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
          transition: color 0.15s;
        }

        .proc-preview-btn:hover {
          color: #B45309;
        }

        .proc-plan-preview-box {
          background: #FAF6ED;
          border: 1px solid #E5DCCB;
          border-radius: 10px;
          padding: 12px 14px;
        }

        .proc-ppb-title {
          font-size: 11px;
          font-weight: 700;
          color: #2E1F14;
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
          color: #2E1F14;
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

        .proc-modal-actions-single {
          margin-top: 4px;
          flex-shrink: 0;
        }

        .proc-submit-btn {
          width: 100%;
          height: 48px;
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
          color: #FFFFFF;
          font-size: 14.5px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(217, 119, 6, 0.25);
          transition: all 0.2s ease;
        }

        .proc-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #B45309 0%, #92400E 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(217, 119, 6, 0.35);
        }

        .proc-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
      `}</style>
    </div>
  );
};
