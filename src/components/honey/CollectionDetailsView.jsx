import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppState } from '../../context/AppStateContext';
import {
  ArrowLeft,
  X,
  Droplets,
  Calendar,
  Scale,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  Info,
  Clock,
  User,
  Thermometer,
  Layers,
  Edit3,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  FileText,
  Sliders
} from 'lucide-react';

/**
 * SCREEN 23 — COLLECTION DETAILS
 * 
 * Master UI/UX + Harvest Record + Hive-to-Batch Traceability
 * Physical harvest event connecting: Hive → Collection → Honey Batch
 * Answers: "What was collected, when, from where, and what happened to it afterward?"
 * Evidence and reference screen — human workflow first.
 */

export const CollectionDetailsView = ({ isOpen, onClose, initialCollectionId, payload }) => {
  const {
    collections,
    updateCollection,
    setSelectedHiveId,
    setSelectedBatchId,
    setActiveTab,
    openSheet,
    showToast,
    apiary
  } = useAppState();

  // Active Collection Resolution
  const [activeId, setActiveId] = useState(
    initialCollectionId || payload?.collectionId || payload?.id || 'col-2026-0925-01'
  );

  const collection = useMemo(() => {
    const availableCollections = Array.isArray(collections) ? collections : [];
    return availableCollections.find((c) => c.id === activeId) || availableCollections[0];
  }, [collections, activeId]);

  // UI State
  const [isTechDetailsOpen, setIsTechDetailsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);

  // Edit form state
  const [editNotes, setEditNotes] = useState(collection?.notes || '');
  const [editHoneyType, setEditHoneyType] = useState(collection?.honeyType || 'Wildflower');
  const [editQuantity, setEditQuantity] = useState(String(collection?.quantityKg || '18.5'));
  const [editReason, setEditReason] = useState('');

  // Sync edit form when collection changes
  React.useEffect(() => {
    if (collection) {
      setEditNotes(collection.notes || '');
      setEditHoneyType(collection.honeyType || 'Wildflower');
      setEditQuantity(String(collection.quantityKg || '18.5'));
      setEditReason('');
    }
  }, [collection]);

  // Handle Edit Submit (Section 18, 19, 20)
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const newQty = parseFloat(editQuantity);
    const hasQtyChanged = newQty !== collection.quantityKg;

    if (hasQtyChanged && !editReason.trim()) {
      showToast('A reason is required when adjusting harvest quantity');
      return;
    }

    const newHistory = [...(collection.history || [])];
    if (hasQtyChanged) {
      newHistory.unshift({
        timestamp: 'Just now',
        action: 'Quantity updated',
        author: 'You (Apiary Operator)',
        details: `${collection.quantityKg} kg → ${newQty} kg (${editReason.trim()})`
      });
    }

    updateCollection(collection.id, {
      notes: editNotes.trim(),
      honeyType: editHoneyType,
      quantityKg: newQty,
      history: newHistory
    });

    showToast('Collection record updated');
    setIsEditModalOpen(false);
  };

  // Switch to Preset for Jury Demonstration (Section 46)
  const handleSelectPreset = (id) => {
    setActiveId(id);
    setIsDemoDrawerOpen(false);
    showToast(`Loaded collection ${id}`);
  };

  // Collections can be empty while workspace data is still loading or before the
  // first harvest is recorded. Avoid rendering a detail view without a record.
  if (!isOpen || !collection) return null;

  const content = (
    <div className="cd-view-overlay animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="cd-header-title">
      <div className="cd-view-container">
        {/* ─────────────────────────────────────────────────────────────
            HEADER (Section 3)
            Title: Collection details
            Subtitle: Hive 01 (Cedar Queen) · 25 Sep 2026
        ───────────────────────────────────────────────────────────── */}
        <header className="cd-header">
          <div className="cd-header-top-row">
            <button
              type="button"
              className="cd-back-btn"
              onClick={onClose}
              aria-label="Back to previous view"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>

            <div className="cd-header-right-actions">
              <button
                type="button"
                className="cd-demo-btn"
                onClick={() => setIsDemoDrawerOpen(!isDemoDrawerOpen)}
                title="Switch demo presets"
              >
                <Sliders size={14} />
                <span>Demo</span>
              </button>

              <button
                type="button"
                className="cd-close-btn"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="cd-header-title-row">
            <div>
              <h1 id="cd-header-title" className="cd-title">Collection details</h1>
              <p className="cd-subtitle">
                Hive {collection.hiveCode} ({collection.hiveName}) · {collection.date}
              </p>
            </div>

            {/* Status Badge (Section 4) */}
            <div className={`cd-status-badge ${collection.status}`}>
              <span className="cd-status-dot" />
              <span>{collection.statusLabel || 'Recorded'}</span>
            </div>
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            JURY DEMONSTRATION DRAWER (Section 46)
        ───────────────────────────────────────────────────────────── */}
        {isDemoDrawerOpen && (
          <div className="cd-demo-drawer animate-slide-down">
            <div className="cd-demo-head">
              <strong>Screen 23 — Collection Presets</strong>
              <button
                type="button"
                className="cd-demo-x"
                onClick={() => setIsDemoDrawerOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="cd-demo-sub">Select scenario for jury demonstration:</p>
            <div className="cd-demo-pills">
              {collections.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={`cd-demo-pill ${activeId === c.id ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(c.id)}
                >
                  <span>Hive {c.hiveCode}: {c.statusLabel} ({c.quantityKg} kg)</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            BODY SCROLLER
        ───────────────────────────────────────────────────────────── */}
        <div className="cd-body-scroll">
          {/* Needs Review Alert Banner (Section 4) */}
          {collection.status === 'needs_review' && (
            <div className="cd-review-alert-card">
              <div className="cd-ralert-head">
                <AlertTriangle size={16} color="#D9822B" />
                <strong>Needs operational review</strong>
              </div>
              <p className="cd-ralert-text">{collection.reviewReason}</p>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              1. HARVEST SUMMARY (Section 5)
              Prominent information: 18.5 kg from Hive 01 on 25 September
          ───────────────────────────────────────────────────────────── */}
          <section className="cd-card cd-summary-hero-card">
            <div className="cd-hero-top">
              <span className="cd-hero-kicker">Harvest Collection</span>
              <span className="cd-hero-type-tag">{collection.honeyType}</span>
            </div>

            <div className="cd-hero-metric-wrap">
              <strong className="cd-hero-metric">{collection.quantityKg}</strong>
              <span className="cd-hero-unit">{collection.unit || 'kg'}</span>
            </div>

            <p className="cd-hero-statement">
              Cold extracted from <strong>Hive {collection.hiveCode} ({collection.hiveName})</strong> at {collection.apiaryName}.
            </p>

            <div className="cd-hero-grid">
              <div className="cd-hgrid-item">
                <span className="cd-hg-label">Date & Time</span>
                <strong className="cd-hg-val">{collection.formattedTimestamp}</strong>
              </div>

              <div className="cd-hgrid-item">
                <span className="cd-hg-label">Source Colony</span>
                <strong className="cd-hg-val">Hive {collection.hiveCode}</strong>
              </div>

              <div className="cd-hgrid-item">
                <span className="cd-hg-label">Recorded by</span>
                <strong className="cd-hg-val">{collection.recordedBy}</strong>
              </div>

              <div className="cd-hgrid-item">
                <span className="cd-hg-label">Workspace</span>
                <strong className="cd-hg-val">{collection.apiaryName}</strong>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              2. SOURCE SECTION (Section 6 & 7)
              Collected from Hive 01 + Hive condition at collection
          ───────────────────────────────────────────────────────────── */}
          <section className="cd-section">
            <span className="cd-section-title">Collected from</span>

            <div className="cd-card cd-source-card">
              <div className="cd-source-top">
                <div className="cd-source-info">
                  <div className="cd-source-code-tag">Hive {collection.hiveCode}</div>
                  <div>
                    <h3 className="cd-source-name">{collection.hiveName}</h3>
                    <p className="cd-source-loc">
                      <MapPin size={12} />
                      <span>{collection.location}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm cd-view-hive-btn"
                  onClick={() => {
                    setSelectedHiveId(collection.hiveId);
                    if (setActiveTab) setActiveTab('hives');
                    onClose();
                  }}
                >
                  <span>View hive</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Hive Condition at collection context block (Section 7) */}
              {collection.hiveConditionAtCollection && (
                <div className="cd-hive-context-box">
                  <div className="cd-hcontext-head">
                    <span className="cd-hcontext-kicker">Hive condition at collection</span>
                    <span className={`cd-hcontext-pill ${collection.hiveConditionAtCollection.isConcerning ? 'attention' : 'healthy'}`}>
                      {collection.hiveConditionAtCollection.isConcerning ? 'Needs attention' : 'Healthy'}
                    </span>
                  </div>

                  <p className="cd-hcontext-cond">
                    {collection.hiveConditionAtCollection.condition}
                  </p>
                  <p className="cd-hcontext-sub">
                    {collection.hiveConditionAtCollection.findings} · Last inspected {collection.hiveConditionAtCollection.lastInspection}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              3. LINKED HONEY BATCH (Section 12, 13, 16)
              Hive → Collection → Honey Batch
          ───────────────────────────────────────────────────────────── */}
          <section className="cd-section">
            <span className="cd-section-title">Honey batch</span>

            {collection.linkedBatch ? (
              <div className="cd-card cd-batch-link-card">
                <div className="cd-blink-head">
                  <div>
                    <span className="cd-blink-kicker">Linked Batch</span>
                    <span className="cd-blink-id">{collection.linkedBatch.batchNumber}</span>
                  </div>
                  <span className="cd-blink-stage-badge">
                    <span className="cd-bstage-dot" />
                    {collection.linkedBatch.currentStage}
                  </span>
                </div>

                <strong className="cd-blink-title">{collection.linkedBatch.name}</strong>

                {/* Batch Journey Progress Stepper (Section 13) */}
                <div className="cd-bjourney-wrap">
                  <span className="cd-bjourney-label">Traceable Honey Journey:</span>
                  <div className="cd-bjourney-stepper">
                    <div className="cd-bstep done">
                      <div className="cd-bdot"><Check size={10} strokeWidth={3} /></div>
                      <span>Collection</span>
                    </div>
                    <div className="cd-bline done" />
                    <div className="cd-bstep current">
                      <div className="cd-bdot" />
                      <span>Processing</span>
                    </div>
                    <div className="cd-bline" />
                    <div className="cd-bstep">
                      <div className="cd-bdot" />
                      <span>Quality</span>
                    </div>
                    <div className="cd-bline" />
                    <div className="cd-bstep">
                      <div className="cd-bdot" />
                      <span>Packaging</span>
                    </div>
                    <div className="cd-bline" />
                    <div className="cd-bstep">
                      <div className="cd-bdot" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>

                <div className="cd-blink-footer">
                  <span className="cd-blink-flow-statement">
                    Hive {collection.hiveCode} → Collection → {collection.linkedBatch.batchNumber}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm cd-view-batch-btn"
                    onClick={() => {
                      if (collection.linkedBatch?.id) {
                        setSelectedBatchId(collection.linkedBatch.id);
                        if (setActiveTab) setActiveTab('honey');
                      }
                      onClose();
                    }}
                  >
                    <span>View batch</span>
                    <ArrowLeft size={13} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="cd-card cd-unlinked-card">
                <div className="cd-unlinked-icon">
                  <Droplets size={22} color="var(--color-primary-honey, #D99A24)" />
                </div>
                <div>
                  <strong className="cd-unlinked-title">No batch linked yet</strong>
                  <p className="cd-unlinked-sub">
                    This collection can be used to create a traceable honey batch.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-honey btn-sm cd-create-batch-btn"
                  onClick={() => {
                    openSheet('create-batch', {
                      hiveCode: collection.hiveCode,
                      hiveName: collection.hiveName,
                      collection
                    });
                    onClose();
                  }}
                >
                  <span>Create batch</span>
                </button>
              </div>
            )}
          </section>

          {/* ─────────────────────────────────────────────────────────────
              4. COLLECTION NOTES (Section 11)
              Human observation note labeled clearly
          ───────────────────────────────────────────────────────────── */}
          <section className="cd-section">
            <div className="cd-section-head-row">
              <span className="cd-section-title">Collection notes</span>
              <span className="cd-human-tag">Human observation</span>
            </div>

            <div className="cd-card cd-notes-card">
              {collection.notes ? (
                <p className="cd-notes-text">"{collection.notes}"</p>
              ) : (
                <p className="cd-notes-empty">No collection notes recorded for this harvest.</p>
              )}
              <span className="cd-notes-author">
                Recorded by {collection.recordedBy} ({collection.userRole})
              </span>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              5. COLLECTION EVIDENCE (Section 23, 24, 25)
              Thumbnail image + environmental conditions near collection
          ───────────────────────────────────────────────────────────── */}
          <section className="cd-section">
            <span className="cd-section-title">Collection evidence</span>

            <div className="cd-card cd-evidence-card">
              {collection.evidence?.hasImage && collection.evidence?.imageUrl ? (
                <div className="cd-evidence-thumb-row">
                  <div
                    className="cd-evidence-thumb"
                    onClick={() => setIsImageLightboxOpen(true)}
                    role="button"
                    tabIndex={0}
                    title="Click to view full image"
                  >
                    <img
                      src={collection.evidence.imageUrl}
                      alt="Collection comb extraction frame"
                      className="cd-thumb-img"
                    />
                    <div className="cd-thumb-overlay">
                      <ImageIcon size={14} />
                      <span>View</span>
                    </div>
                  </div>
                  <div className="cd-evidence-caption-box">
                    <span className="cd-ecaption-label">Harvest Frame Photo</span>
                    <p className="cd-ecaption-text">
                      {collection.evidence.imageCaption || 'Cold extraction frame photo.'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="cd-evidence-none">No collection photograph attached.</p>
              )}

              {/* Environmental readings near collection (Section 25) */}
              <div className="cd-evidence-env-strip">
                <span className="cd-eenv-kicker">Hive conditions near collection:</span>
                <div className="cd-eenv-chips">
                  <div className="cd-eenv-chip">
                    <Thermometer size={13} color="#D99A24" />
                    <span>Temp: {collection.evidence?.temperature || '29.1°C'}</span>
                  </div>
                  <div className="cd-eenv-chip">
                    <Droplets size={13} color="#71845B" />
                    <span>Humidity: {collection.evidence?.humidity || '56%'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              6. TRACEABILITY INTEGRITY (Section 29)
          ───────────────────────────────────────────────────────────── */}
          <section className="cd-section">
            <div className="cd-trace-card">
              <div className="cd-trace-left">
                <ShieldCheck size={20} color="var(--color-healthy, #4F7A52)" />
                <div>
                  <strong className="cd-trace-title">
                    Traceable to Hive {collection.hiveCode} ({collection.hiveName})
                  </strong>
                  <p className="cd-trace-sub">
                    Source record preserved on HoneyChain immutable ledger.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              7. AUDIT & CHANGE HISTORY (Section 20 & 40)
          ───────────────────────────────────────────────────────────── */}
          {collection.history && collection.history.length > 0 && (
            <section className="cd-section">
              <span className="cd-section-title">Record history</span>
              <div className="cd-card cd-history-card">
                {collection.history.map((hist, idx) => (
                  <div key={idx} className="cd-history-item">
                    <div className="cd-hist-dot" />
                    <div>
                      <div className="cd-hist-head">
                        <strong className="cd-hist-action">{hist.action}</strong>
                        <span className="cd-hist-time">{hist.timestamp}</span>
                      </div>
                      <p className="cd-hist-details">{hist.details}</p>
                      <span className="cd-hist-author">By {hist.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─────────────────────────────────────────────────────────────
              8. TECHNICAL DETAILS (Section 30 & 31)
              Collapsible behind progressive disclosure button
          ───────────────────────────────────────────────────────────── */}
          <section className="cd-section">
            <button
              type="button"
              className="cd-tech-toggle-btn"
              onClick={() => setIsTechDetailsOpen(!isTechDetailsOpen)}
            >
              <span>{isTechDetailsOpen ? 'Hide technical details' : 'View technical details'}</span>
              <ChevronRight
                size={15}
                style={{
                  transform: isTechDetailsOpen ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.15s ease'
                }}
              />
            </button>

            {isTechDetailsOpen && (
              <div className="cd-card cd-tech-card animate-fade-in">
                <div className="cd-tech-row">
                  <span className="cd-tlabel">Collection ID</span>
                  <span className="cd-tval mono">{collection.id}</span>
                </div>
                <div className="cd-tech-row">
                  <span className="cd-tlabel">Source Hive ID</span>
                  <span className="cd-tval mono">{collection.hiveId}</span>
                </div>
                <div className="cd-tech-row">
                  <span className="cd-tlabel">Linked Batch ID</span>
                  <span className="cd-tval mono">
                    {collection.linkedBatch ? collection.linkedBatch.id : 'None (Unallocated)'}
                  </span>
                </div>
                <div className="cd-tech-row">
                  <span className="cd-tlabel">Workspace ID</span>
                  <span className="cd-tval mono">{apiary?.id || 'ap-meadowbrook'}</span>
                </div>
                <div className="cd-tech-row">
                  <span className="cd-tlabel">Recorded Timestamp</span>
                  <span className="cd-tval mono">{collection.timestamp}</span>
                </div>
                <div className="cd-tech-row">
                  <span className="cd-tlabel">Ledger Network</span>
                  <span className="cd-tval">
                    {collection.traceabilityProof?.ledgerNetwork || 'HoneyChain Ledger'}
                  </span>
                </div>
                <div className="cd-tech-row">
                  <span className="cd-tlabel">Record Hash</span>
                  <span className="cd-tval mono truncate">
                    {collection.traceabilityProof?.recordHash || '0x8f4c2810a97b41e9389f...'}
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            FOOTER ACTIONS (Section 19 & 32)
        ───────────────────────────────────────────────────────────── */}
        <footer className="cd-footer">
          <button
            type="button"
            className="btn btn-secondary cd-edit-btn"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit3 size={15} />
            <span>Edit collection</span>
          </button>

          {collection.linkedBatch ? (
            <button
              type="button"
              className="btn btn-honey cd-primary-action-btn"
              onClick={() => {
                if (collection.linkedBatch?.id) {
                  setSelectedBatchId(collection.linkedBatch.id);
                  if (setActiveTab) setActiveTab('honey');
                }
                onClose();
              }}
            >
              <span>View batch</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-honey cd-primary-action-btn"
              onClick={() => {
                openSheet('create-batch', {
                  hiveCode: collection.hiveCode,
                  hiveName: collection.hiveName,
                  collection
                });
                onClose();
              }}
            >
              <span>Create batch</span>
              <ChevronRight size={16} />
            </button>
          )}
        </footer>

        {/* ─────────────────────────────────────────────────────────────
            EDIT COLLECTION MODAL (Section 18 & 19)
        ───────────────────────────────────────────────────────────── */}
        {isEditModalOpen && (
          <div className="cd-submodal-overlay animate-fade-in" role="dialog" aria-modal="true">
            <div className="cd-submodal-card">
              <div className="cd-submodal-head">
                <strong>Edit collection</strong>
                <button
                  type="button"
                  className="cd-close-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="cd-warning-notice">
                <AlertTriangle size={15} color="#B87316" />
                <p>Changes to this record may affect honey traceability.</p>
              </div>

              <form onSubmit={handleSaveEdit} className="cd-edit-form">
                <div className="cd-form-group">
                  <label className="cd-flabel">Quantity (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="500"
                    className="cd-finput"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    required
                  />
                </div>

                {parseFloat(editQuantity) !== collection.quantityKg && (
                  <div className="cd-form-group">
                    <label className="cd-flabel" style={{ color: '#D9822B' }}>
                      Reason for quantity adjustment *
                    </label>
                    <input
                      type="text"
                      className="cd-finput"
                      placeholder="e.g. Tare weight calibration adjustment"
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="cd-form-group">
                  <label className="cd-flabel">Honey type</label>
                  <select
                    className="cd-finput"
                    value={editHoneyType}
                    onChange={(e) => setEditHoneyType(e.target.value)}
                  >
                    <option value="Wildflower">Wildflower</option>
                    <option value="Highland Lavender & Sage">Highland Lavender & Sage</option>
                    <option value="Sweet Clover & Blackberry">Sweet Clover & Blackberry</option>
                    <option value="Forest Blend">Forest Blend</option>
                    <option value="Not specified">Not specified</option>
                  </select>
                </div>

                <div className="cd-form-group">
                  <label className="cd-flabel">Collection notes</label>
                  <textarea
                    rows={3}
                    className="cd-ftextarea"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>

                <div className="cd-submodal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-honey" style={{ flex: 1 }}>
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            IMAGE LIGHTBOX MODAL (Section 24)
        ───────────────────────────────────────────────────────────── */}
        {isImageLightboxOpen && collection.evidence?.imageUrl && (
          <div className="cd-lightbox-overlay" onClick={() => setIsImageLightboxOpen(false)}>
            <div className="cd-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="cd-lightbox-close"
                onClick={() => setIsImageLightboxOpen(false)}
              >
                <X size={20} />
              </button>
              <img
                src={collection.evidence.imageUrl}
                alt="Full collection evidence frame"
                className="cd-lightbox-img"
              />
              <p className="cd-lightbox-caption">{collection.evidence.imageCaption}</p>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STYLES (Strictly conforming to Section 44)
      ───────────────────────────────────────────────────────────── */}
      <style>{`
        .cd-view-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background: rgba(52, 38, 27, 0.55);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0;
          box-sizing: border-box;
        }

        @media (min-width: 640px) {
          .cd-view-overlay {
            align-items: center;
            padding: 20px;
          }
        }

        .cd-view-container {
          width: 100%;
          max-width: 520px;
          height: 94vh;
          max-height: 860px;
          background: #FFF9EF;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 -8px 32px rgba(52, 38, 27, 0.16);
          overflow: hidden;
          box-sizing: border-box;
          position: relative;
        }

        @media (min-width: 640px) {
          .cd-view-container {
            border-radius: 20px;
            height: 90vh;
          }
        }

        /* Header */
        .cd-header {
          padding: 16px 20px 14px;
          background: #FFFDF8;
          border-bottom: 1px solid #EDE2D1;
          flex-shrink: 0;
        }

        .cd-header-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .cd-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #786D61;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          transition: background-color 0.15s ease;
        }

        .cd-back-btn:hover {
          background: rgba(120, 109, 97, 0.08);
          color: #34261B;
        }

        .cd-header-right-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cd-demo-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(217, 154, 36, 0.1);
          border: 1px solid rgba(217, 154, 36, 0.3);
          color: #B87316;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
        }

        .cd-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(120, 109, 97, 0.08);
          border: none;
          color: #786D61;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .cd-header-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .cd-title {
          font-size: 20px;
          font-weight: 800;
          color: #34261B;
          margin: 0 0 2px 0;
          line-height: 1.25;
        }

        .cd-subtitle {
          font-size: 13px;
          color: #786D61;
          margin: 0;
          line-height: 1.4;
        }

        .cd-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .cd-status-badge.linked {
          background: rgba(217, 154, 36, 0.12);
          color: #B87316;
        }

        .cd-status-badge.unlinked {
          background: rgba(120, 109, 97, 0.1);
          color: #786D61;
        }

        .cd-status-badge.needs_review {
          background: rgba(217, 130, 43, 0.12);
          color: #D9822B;
        }

        .cd-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Demo Drawer */
        .cd-demo-drawer {
          background: #34261B;
          color: #FFFDF8;
          padding: 12px 16px;
          border-bottom: 1px solid #786D61;
        }

        .cd-demo-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .cd-demo-x {
          background: transparent;
          border: none;
          color: #EDE2D1;
          cursor: pointer;
        }

        .cd-demo-sub {
          font-size: 11.5px;
          color: #EDE2D1;
          margin: 0 0 8px 0;
        }

        .cd-demo-pills {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cd-demo-pill {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #FFFDF8;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          text-align: left;
          cursor: pointer;
        }

        .cd-demo-pill.active {
          background: #D99A24;
          border-color: #D99A24;
        }

        /* Body Scroll */
        .cd-body-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          box-sizing: border-box;
          -webkit-overflow-scrolling: touch;
        }

        .cd-section {
          margin-bottom: 16px;
        }

        .cd-section-title {
          display: block;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #786D61;
          margin-bottom: 8px;
        }

        .cd-section-head-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .cd-human-tag {
          font-size: 10.5px;
          font-weight: 600;
          color: #71845B;
          background: rgba(113, 132, 91, 0.12);
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* Cards */
        .cd-card {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 14px;
          padding: 14px 16px;
          box-sizing: border-box;
        }

        /* Review Alert */
        .cd-review-alert-card {
          background: rgba(217, 130, 43, 0.08);
          border: 1px solid rgba(217, 130, 43, 0.35);
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }

        .cd-ralert-head {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #D9822B;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .cd-ralert-text {
          font-size: 12px;
          color: #786D61;
          margin: 0;
          line-height: 1.4;
        }

        /* Hero Summary */
        .cd-summary-hero-card {
          border-left: 4px solid #D99A24;
          margin-bottom: 16px;
        }

        .cd-hero-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .cd-hero-kicker {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #786D61;
        }

        .cd-hero-type-tag {
          font-size: 11.5px;
          font-weight: 700;
          color: #B87316;
          background: rgba(217, 154, 36, 0.12);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .cd-hero-metric-wrap {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 4px;
        }

        .cd-hero-metric {
          font-size: 32px;
          font-weight: 800;
          color: #34261B;
          line-height: 1;
        }

        .cd-hero-unit {
          font-size: 18px;
          font-weight: 700;
          color: #786D61;
        }

        .cd-hero-statement {
          font-size: 13px;
          color: #786D61;
          margin: 0 0 14px 0;
          line-height: 1.4;
        }

        .cd-hero-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px 14px;
          border-top: 1px solid #EDE2D1;
          padding-top: 12px;
        }

        .cd-hg-label {
          font-size: 10.5px;
          text-transform: uppercase;
          color: #786D61;
          display: block;
        }

        .cd-hg-val {
          font-size: 13px;
          font-weight: 700;
          color: #34261B;
          display: block;
          margin-top: 1px;
        }

        /* Source Section */
        .cd-source-card {
          padding: 14px;
        }

        .cd-source-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .cd-source-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cd-source-code-tag {
          font-size: 12px;
          font-weight: 700;
          color: #B87316;
          background: rgba(217, 154, 36, 0.12);
          padding: 4px 8px;
          border-radius: 6px;
        }

        .cd-source-name {
          font-size: 14.5px;
          font-weight: 700;
          color: #34261B;
          margin: 0;
        }

        .cd-source-loc {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #786D61;
          margin: 2px 0 0 0;
        }

        .cd-view-hive-btn {
          font-size: 12px;
          padding: 6px 10px;
          white-space: nowrap;
        }

        .cd-hive-context-box {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px dashed #EDE2D1;
        }

        .cd-hcontext-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .cd-hcontext-kicker {
          font-size: 11px;
          font-weight: 600;
          color: #786D61;
        }

        .cd-hcontext-pill {
          font-size: 10.5px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .cd-hcontext-pill.healthy {
          background: rgba(113, 132, 91, 0.12);
          color: #71845B;
        }

        .cd-hcontext-pill.attention {
          background: rgba(217, 130, 43, 0.12);
          color: #D9822B;
        }

        .cd-hcontext-cond {
          font-size: 12.5px;
          font-weight: 700;
          color: #34261B;
          margin: 0 0 2px 0;
        }

        .cd-hcontext-sub {
          font-size: 11.5px;
          color: #786D61;
          margin: 0;
          line-height: 1.35;
        }

        /* Linked Batch */
        .cd-batch-link-card {
          padding: 14px;
        }

        .cd-blink-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .cd-blink-kicker {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #786D61;
          margin-right: 6px;
        }

        .cd-blink-id {
          font-size: 12px;
          font-weight: 700;
          color: #B87316;
          background: rgba(217, 154, 36, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .cd-blink-stage-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          color: #B87316;
          background: rgba(217, 154, 36, 0.12);
          padding: 2px 8px;
          border-radius: 12px;
        }

        .cd-bstage-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .cd-blink-title {
          font-size: 15px;
          font-weight: 800;
          color: #34261B;
          display: block;
          margin-bottom: 12px;
        }

        .cd-bjourney-wrap {
          background: rgba(217, 154, 36, 0.05);
          border: 1px solid #EDE2D1;
          border-radius: 10px;
          padding: 10px 12px;
          margin-bottom: 12px;
        }

        .cd-bjourney-label {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: #786D61;
          display: block;
          margin-bottom: 8px;
        }

        .cd-bjourney-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cd-bstep {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }

        .cd-bstep span {
          font-size: 9.5px;
          font-weight: 600;
          color: #786D61;
        }

        .cd-bdot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #EDE2D1;
          color: #786D61;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cd-bstep.done .cd-bdot {
          background: #71845B;
          color: #FFFFFF;
        }

        .cd-bstep.done span {
          color: #71845B;
          font-weight: 700;
        }

        .cd-bstep.current .cd-bdot {
          background: #D99A24;
          box-shadow: 0 0 0 2px rgba(217, 154, 36, 0.25);
        }

        .cd-bstep.current span {
          color: #B87316;
          font-weight: 700;
        }

        .cd-bline {
          flex: 1;
          height: 2px;
          background: #EDE2D1;
          margin: 0 4px 12px;
        }

        .cd-bline.done {
          background: #71845B;
        }

        .cd-blink-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #EDE2D1;
          padding-top: 10px;
        }

        .cd-blink-flow-statement {
          font-size: 11.5px;
          color: #786D61;
        }

        .cd-view-batch-btn {
          font-size: 12px;
          padding: 6px 10px;
        }

        /* Unlinked */
        .cd-unlinked-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
        }

        .cd-unlinked-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cd-unlinked-title {
          font-size: 14px;
          color: #34261B;
          display: block;
        }

        .cd-unlinked-sub {
          font-size: 12px;
          color: #786D61;
          margin: 2px 0 0 0;
          line-height: 1.35;
        }

        .cd-create-batch-btn {
          margin-left: auto;
          white-space: nowrap;
          font-size: 12px;
        }

        /* Notes Card */
        .cd-notes-card {
          padding: 12px 14px;
        }

        .cd-notes-text {
          font-size: 13.5px;
          color: #34261B;
          margin: 0 0 8px 0;
          line-height: 1.45;
          font-style: italic;
        }

        .cd-notes-empty {
          font-size: 12.5px;
          color: #786D61;
          margin: 0 0 6px 0;
          font-style: italic;
        }

        .cd-notes-author {
          font-size: 11px;
          color: #786D61;
          display: block;
        }

        /* Evidence Card */
        .cd-evidence-thumb-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .cd-evidence-thumb {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
          border: 1px solid #EDE2D1;
        }

        .cd-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cd-thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(52, 38, 27, 0.4);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .cd-evidence-thumb:hover .cd-thumb-overlay {
          opacity: 1;
        }

        .cd-evidence-caption-box {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .cd-ecaption-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #786D61;
        }

        .cd-ecaption-text {
          font-size: 12.5px;
          color: #34261B;
          margin: 2px 0 0 0;
          line-height: 1.35;
        }

        .cd-evidence-none {
          font-size: 12.5px;
          color: #786D61;
          margin: 0 0 10px 0;
          font-style: italic;
        }

        .cd-evidence-env-strip {
          border-top: 1px solid #EDE2D1;
          padding-top: 10px;
        }

        .cd-eenv-kicker {
          font-size: 11px;
          color: #786D61;
          display: block;
          margin-bottom: 6px;
        }

        .cd-eenv-chips {
          display: flex;
          gap: 8px;
        }

        .cd-eenv-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: #34261B;
          background: rgba(217, 154, 36, 0.08);
          padding: 3px 8px;
          border-radius: 6px;
        }

        /* Traceability Card */
        .cd-trace-card {
          background: rgba(113, 132, 91, 0.08);
          border: 1px solid rgba(113, 132, 91, 0.3);
          border-radius: 12px;
          padding: 12px 14px;
        }

        .cd-trace-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cd-trace-title {
          font-size: 13.5px;
          color: #71845B;
          display: block;
        }

        .cd-trace-sub {
          font-size: 12px;
          color: #786D61;
          margin: 2px 0 0 0;
        }

        /* History Card */
        .cd-history-card {
          padding: 12px 14px;
        }

        .cd-history-item {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #EDE2D1;
        }

        .cd-history-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .cd-hist-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #D99A24;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .cd-hist-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .cd-hist-action {
          font-size: 13px;
          color: #34261B;
        }

        .cd-hist-time {
          font-size: 11px;
          color: #786D61;
        }

        .cd-hist-details {
          font-size: 12px;
          color: #786D61;
          margin: 2px 0;
        }

        .cd-hist-author {
          font-size: 10.5px;
          color: #B87316;
          display: block;
        }

        /* Tech Details */
        .cd-tech-toggle-btn {
          width: 100%;
          background: transparent;
          border: 1px dashed #EDE2D1;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 12.5px;
          font-weight: 700;
          color: #786D61;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        .cd-tech-toggle-btn:hover {
          border-color: #D99A24;
          color: #34261B;
        }

        .cd-tech-card {
          margin-top: 8px;
          font-size: 12px;
        }

        .cd-tech-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #EDE2D1;
        }

        .cd-tech-row:last-child {
          border-bottom: none;
        }

        .cd-tlabel {
          color: #786D61;
        }

        .cd-tval {
          font-weight: 600;
          color: #34261B;
        }

        .cd-tval.mono {
          font-family: monospace;
          font-size: 11.5px;
        }

        .cd-tval.truncate {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Footer */
        .cd-footer {
          padding: 14px 20px 18px;
          background: #FFFDF8;
          border-top: 1px solid #EDE2D1;
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        .cd-edit-btn {
          height: 48px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
          font-weight: 600;
          padding: 0 16px;
        }

        .cd-primary-action-btn {
          flex: 1;
          height: 48px;
          font-size: 14.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* Submodal Edit */
        .cd-submodal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(52, 38, 27, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 10;
        }

        .cd-submodal-card {
          width: 100%;
          max-width: 440px;
          background: #FFFDF8;
          border-radius: 16px;
          padding: 18px 20px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        .cd-submodal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 16px;
          color: #34261B;
          margin-bottom: 10px;
        }

        .cd-warning-notice {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(217, 154, 36, 0.1);
          border: 1px solid rgba(217, 154, 36, 0.3);
          border-radius: 8px;
          padding: 8px 10px;
          margin-bottom: 14px;
        }

        .cd-warning-notice p {
          margin: 0;
          font-size: 11.5px;
          color: #B87316;
          font-weight: 600;
        }

        .cd-form-group {
          margin-bottom: 12px;
        }

        .cd-flabel {
          display: block;
          font-size: 12.5px;
          font-weight: 700;
          color: #34261B;
          margin-bottom: 4px;
        }

        .cd-finput {
          width: 100%;
          height: 40px;
          border: 1.5px solid #EDE2D1;
          border-radius: 8px;
          padding: 0 10px;
          font-size: 13.5px;
          color: #34261B;
          background: #FFF9EF;
          box-sizing: border-box;
          outline: none;
        }

        .cd-ftextarea {
          width: 100%;
          border: 1.5px solid #EDE2D1;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 13px;
          color: #34261B;
          background: #FFF9EF;
          box-sizing: border-box;
          outline: none;
          font-family: inherit;
        }

        .cd-submodal-footer {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }

        /* Lightbox */
        .cd-lightbox-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 20;
        }

        .cd-lightbox-content {
          position: relative;
          max-width: 90%;
          max-height: 80%;
          text-align: center;
        }

        .cd-lightbox-close {
          position: absolute;
          top: -34px;
          right: 0;
          background: transparent;
          border: none;
          color: #FFFFFF;
          cursor: pointer;
        }

        .cd-lightbox-img {
          max-width: 100%;
          max-height: 70vh;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .cd-lightbox-caption {
          color: #EDE2D1;
          font-size: 12.5px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );

  const mountTarget = typeof document !== 'undefined'
    ? (document.querySelector('.app-viewport') || document.body)
    : null;

  return mountTarget ? createPortal(content, mountTarget) : content;
};
