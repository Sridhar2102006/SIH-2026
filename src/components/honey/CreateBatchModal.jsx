import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppState } from '../../context/AppStateContext';
import {
  ArrowLeft,
  X,
  Search,
  Check,
  CheckCircle2,
  Calendar,
  Layers,
  Scale,
  Droplets,
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock,
  Plus
} from 'lucide-react';

/**
 * SCREEN 22 — CREATE HONEY BATCH
 * 
 * Master UI/UX + Collection Linking + Traceability + Data Integrity
 * Creates the connection: Hive → Collection → Honey Batch
 * Answers: "What honey did I collect, where did it come from, and how much did I collect?"
 * Human workflow first — no raw blockchain or technical database form.
 */

// Configured Honey Types Taxonomy (Section 15 & 27)
export const CONFIGURED_HONEY_TYPES = [
  'Wildflower',
  'Highland Lavender & Sage',
  'Sweet Clover & Blackberry',
  'Forest Blend',
  'Acacia Blossom',
  'Polyfloral Meadow',
  'Not specified'
];

// Mock recent collections recorded at the apiary (Section 7 & 8)
export const RECENT_HARVEST_COLLECTIONS = [
  {
    id: 'col-2026-0925-01',
    hiveCode: '01',
    hiveName: 'Cedar Queen',
    hiveId: 'hive-01',
    quantityKg: 18.5,
    date: '2026-09-25',
    dateLabel: 'Today · 08:30 AM',
    honeyType: 'Wildflower',
    notes: 'Cold extraction from 8 capped super frames. Strong clover aroma.'
  },
  {
    id: 'col-2026-0924-02',
    hiveCode: '04',
    hiveName: 'Lavender Crest',
    hiveId: 'hive-04',
    quantityKg: 24.0,
    date: '2026-09-24',
    dateLabel: 'Yesterday · 04:15 PM',
    honeyType: 'Highland Lavender & Sage',
    notes: 'Very clean comb capping. Delicate pale golden clarity.'
  }
];

export const CreateBatchModal = ({ isOpen, onClose, initialPayload }) => {
  const {
    hives,
    createBatch,
    setSelectedBatchId,
    setActiveTab,
    showToast,
    isOnline,
    accessProfile,
    apiary
  } = useAppState();

  // Wizard Steps: 1: SOURCE, 2: COLLECTION, 3: REVIEW, 4: SUCCESS
  const [currentStep, setCurrentStep] = useState(1); // 1 | 2 | 3 | 4

  // Step 1: Source Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHives, setSelectedHives] = useState(['Hive 01']);
  const [selectedHiveObjects, setSelectedHiveObjects] = useState([]);
  const [isMultiSourceMode, setIsMultiSourceMode] = useState(false);
  const [isFromExistingCollection, setIsFromExistingCollection] = useState(false);
  const [linkedCollectionId, setLinkedCollectionId] = useState(null);

  // Step 2: Collection Details State
  const [collectionDate, setCollectionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [quantity, setQuantity] = useState('18.5');
  const [unit, setUnit] = useState('kg'); // 'kg' | 'g'
  const [honeyType, setHoneyType] = useState('Wildflower');
  const [collectionNotes, setCollectionNotes] = useState('');

  // Step 3: Batch Details State
  const [batchName, setBatchName] = useState('Wildflower Honey · 25 Sep');
  const [jarVolume, setJarVolume] = useState('500g Glass');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // Success State details (Section 24)
  const [createdBatch, setCreatedBatch] = useState(null);

  // Prepopulate from initialPayload if provided (Section 8)
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setCreatedBatch(null);
      setSubmissionError(null);
      if (initialPayload?.hiveCode || initialPayload?.hiveName) {
        const hLabel = initialPayload.hiveName || `Hive ${initialPayload.hiveCode}`;
        setSelectedHives([hLabel]);
      }
      if (initialPayload?.collection) {
        setIsFromExistingCollection(true);
        setLinkedCollectionId(initialPayload.collection.id);
        if (initialPayload.collection.quantityKg) {
          setQuantity(String(initialPayload.collection.quantityKg));
        }
        if (initialPayload.collection.date) {
          setCollectionDate(initialPayload.collection.date);
        }
        if (initialPayload.collection.honeyType) {
          setHoneyType(initialPayload.collection.honeyType);
        }
        if (initialPayload.collection.notes) {
          setCollectionNotes(initialPayload.collection.notes);
        }
      }
    }
  }, [isOpen, initialPayload]);

  // Sync selected hive objects
  useEffect(() => {
    const matched = hives.filter((h) => {
      const label = `Hive ${h.code}`;
      return selectedHives.includes(label) || selectedHives.includes(h.name);
    });
    setSelectedHiveObjects(matched);
  }, [selectedHives, hives]);

  // Update default suggested batch name when honeyType or date changes (Section 17 & 18)
  useEffect(() => {
    if (!createdBatch) {
      try {
        const d = new Date(collectionDate);
        const dayMonth = !isNaN(d.getTime())
          ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
          : 'Today';
        const typeLabel = honeyType !== 'Not specified' ? honeyType : 'Honey';
        setBatchName(`${typeLabel} Harvest · ${dayMonth}`);
      } catch (e) {
        setBatchName(`${honeyType} Harvest · Today`);
      }
    }
  }, [honeyType, collectionDate, createdBatch]);

  // Filtered hives for Step 1 search (Section 6)
  const filteredHives = useMemo(() => {
    if (!searchQuery.trim()) return hives;
    const q = searchQuery.toLowerCase();
    return hives.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.code.toLowerCase().includes(q) ||
        (h.location && h.location.toLowerCase().includes(q))
    );
  }, [hives, searchQuery]);

  // Handle Hive Toggle (Section 9)
  const handleToggleHive = (hive) => {
    const label = `Hive ${hive.code}`;
    if (isMultiSourceMode) {
      if (selectedHives.includes(label)) {
        if (selectedHives.length > 1) {
          setSelectedHives(selectedHives.filter((h) => h !== label));
        } else {
          showToast('A batch must have at least one source hive');
        }
      } else {
        setSelectedHives([...selectedHives, label]);
      }
    } else {
      setSelectedHives([label]);
    }
    // If user explicitly changes hive, clear preselected collection record flag
    setIsFromExistingCollection(false);
  };

  // Quick Action: Pre-fill from existing collection record (Section 7 & 8)
  const handleUseCollectionRecord = (col) => {
    setSelectedHives([`Hive ${col.hiveCode}`]);
    setQuantity(String(col.quantityKg));
    setCollectionDate(col.date);
    setHoneyType(col.honeyType);
    setCollectionNotes(col.notes || '');
    setIsFromExistingCollection(true);
    setLinkedCollectionId(col.id);
    showToast(`Pre-filled recorded harvest from Hive ${col.hiveCode}`);
    setCurrentStep(2); // advance to review collection
  };

  // Validate Step 1
  const handleStep1Continue = () => {
    if (selectedHives.length === 0) {
      showToast('Please select at least one source hive');
      return;
    }
    setCurrentStep(2);
  };

  // Validate Step 2
  const handleStep2Continue = () => {
    const num = parseFloat(quantity);
    if (isNaN(num) || num <= 0) {
      showToast('Please enter a valid positive honey harvest quantity');
      return;
    }
    if (num > 500) {
      showToast('Quantity exceeds normal field harvest limit (500 kg)');
      return;
    }
    if (!collectionDate) {
      showToast('Please specify a collection date');
      return;
    }
    setCurrentStep(3);
  };

  // Handle Final Submission (Section 21, 22, 23)
  const handleCreateBatchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submission

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Internal normalized weight in kg (Section 14)
      const numericQty = parseFloat(quantity) || 18.5;
      const normalizedWeightKg = unit === 'g' ? numericQty / 1000 : numericQty;
      const calculatedJars = Math.round(normalizedWeightKg * 2);

      const newBatchData = {
        name: batchName.trim() || 'Harvest Batch',
        sourceHives: selectedHives,
        sourceHiveIds: selectedHiveObjects.map((h) => h.id),
        collectionId: linkedCollectionId,
        collectionDate,
        honeyType,
        notes: collectionNotes,
        weightKg: normalizedWeightKg,
        moisture: 17.2, // standard fresh field reading
        lotJarsCount: calculatedJars,
        jarVolume,
        shouldCloseSheet: false
      };

      // Atomic batch creation via AppStateContext (Section 22)
      const result = createBatch(newBatchData);

      setCreatedBatch(result || {
        ...newBatchData,
        batchNumber: 'HB-2026-10',
        displayId: 'Batch HC-2409'
      });

      // Transition to Success View (Section 24)
      setCurrentStep(4);
    } catch (err) {
      console.error('Batch creation error:', err);
      setSubmissionError('We could not create the batch. Check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset modal state
  const handleResetForm = () => {
    setCurrentStep(1);
    setSelectedHives(['Hive 01']);
    setIsMultiSourceMode(false);
    setIsFromExistingCollection(false);
    setLinkedCollectionId(null);
    setQuantity('18.5');
    setUnit('kg');
    setHoneyType('Wildflower');
    setCollectionNotes('');
    setCreatedBatch(null);
    setSubmissionError(null);
  };

  if (!isOpen) return null;

  const content = (
    <div className="cb-modal-overlay animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="cb-modal-title">
      <div className="cb-modal-container">
        {/* ─────────────────────────────────────────────────────────────
            HEADER (Section 2)
            Title: Create honey batch
            Supporting: Record where this honey came from and start its journey.
        ───────────────────────────────────────────────────────────── */}
        <header className="cb-header">
          <div className="cb-header-nav">
            {currentStep > 1 && currentStep < 4 ? (
              <button
                type="button"
                className="cb-nav-back-btn"
                onClick={() => setCurrentStep(currentStep - 1)}
                aria-label="Back to previous step"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
            ) : (
              <span className="cb-nav-tag">HoneyChain Journey</span>
            )}

            <button
              type="button"
              className="cb-close-btn"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          <div className="cb-header-title-box">
            <h1 id="cb-modal-title" className="cb-title">
              {currentStep === 4 ? 'Batch created' : 'Create honey batch'}
            </h1>
            <p className="cb-subtitle">
              {currentStep === 4
                ? 'Your honey is ready for the next step.'
                : 'Record where this honey came from and start its journey.'}
            </p>
          </div>

          {/* Progress Indicator (Section 3) */}
          {currentStep < 4 && (
            <div className="cb-progress-bar-wrap" aria-label="Creation progress">
              <div className={`cb-progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <div className="cb-pdot">{currentStep > 1 ? <Check size={11} strokeWidth={3} /> : '1'}</div>
                <span className="cb-plabel">Source</span>
              </div>
              <div className={`cb-pline ${currentStep >= 2 ? 'active' : ''}`} />
              <div className={`cb-progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="cb-pdot">{currentStep > 2 ? <Check size={11} strokeWidth={3} /> : '2'}</div>
                <span className="cb-plabel">Collection</span>
              </div>
              <div className={`cb-pline ${currentStep >= 3 ? 'active' : ''}`} />
              <div className={`cb-progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="cb-pdot">3</div>
                <span className="cb-plabel">Batch</span>
              </div>
            </div>
          )}
        </header>

        {/* ─────────────────────────────────────────────────────────────
            BODY SCROLLER
        ───────────────────────────────────────────────────────────── */}
        <div className="cb-body-scroll">
          {/* STEP 1: SELECT SOURCE (Section 4 - 10) */}
          {currentStep === 1 && (
            <div className="cb-step-panel animate-fade-in">
              <div className="cb-question-box">
                <h2 className="cb-question-title">Where did this honey come from?</h2>
                <p className="cb-question-sub">
                  Choose the hive or collection record linked to this harvest.
                </p>
              </div>

              {/* Jury Demonstration Helper Shortcut (Section 49) */}
              <div className="cb-jury-shortcut-bar">
                <div className="cb-jshortcut-left">
                  <Sparkles size={14} color="#D99A24" />
                  <span>Jury Demo Shortcut:</span>
                </div>
                <button
                  type="button"
                  className="cb-jshortcut-btn"
                  onClick={() => handleUseCollectionRecord(RECENT_HARVEST_COLLECTIONS[0])}
                >
                  Load Hive 01 Recorded Collection (18.5 kg)
                </button>
              </div>

              {/* Recent Collections Priority Block (Section 7) */}
              {RECENT_HARVEST_COLLECTIONS.length > 0 && (
                <section className="cb-section">
                  <span className="cb-section-label">Recent collections</span>
                  <div className="cb-recent-collections-stack">
                    {RECENT_HARVEST_COLLECTIONS.map((col) => (
                      <div key={col.id} className="cb-recent-col-card">
                        <div className="cb-rcol-left">
                          <div className="cb-rcol-icon">
                            <Droplets size={16} color="var(--color-primary-honey, #D99A24)" />
                          </div>
                          <div>
                            <strong className="cb-rcol-title">Hive {col.hiveCode} ({col.hiveName})</strong>
                            <p className="cb-rcol-meta">
                              {col.quantityKg} kg · {col.dateLabel} · {col.honeyType}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm cb-use-col-btn"
                          onClick={() => handleUseCollectionRecord(col)}
                        >
                          Use this collection
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Multi-Source Toggle (Section 9 & 25) */}
              <div className="cb-multisource-toggle-bar">
                <label className="cb-toggle-label">
                  <input
                    type="checkbox"
                    checked={isMultiSourceMode}
                    onChange={(e) => {
                      setIsMultiSourceMode(e.target.checked);
                      if (!e.target.checked && selectedHives.length > 1) {
                        setSelectedHives([selectedHives[0]]);
                      }
                    }}
                  />
                  <span>Combine honey from multiple hives</span>
                </label>
              </div>

              {/* Multi-source warning banner if enabled (Section 9) */}
              {isMultiSourceMode && (
                <div className="cb-warning-banner">
                  <AlertTriangle size={15} color="#D9822B" />
                  <p>
                    Combining sources creates a blended batch. Traceability will link back to all selected hives.
                  </p>
                </div>
              )}

              {/* Hive Search Bar (Section 6) */}
              <div className="cb-search-box">
                <Search size={15} color="var(--color-warm-gray, #786D61)" />
                <input
                  type="text"
                  className="cb-search-input"
                  placeholder="Search hives by code, name, or apiary…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="cb-clear-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Available Hives List (Section 5, 31, 32) */}
              <section className="cb-section">
                <span className="cb-section-label">
                  Available hives ({filteredHives.length})
                </span>

                <div className="cb-hives-grid">
                  {filteredHives.map((hive) => {
                    const hiveLabel = `Hive ${hive.code}`;
                    const isSelected = selectedHives.includes(hiveLabel);
                    const isAttention = hive.status === 'attention';

                    return (
                      <div
                        key={hive.id}
                        className={`cb-hive-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleHive(hive)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                      >
                        <div className="cb-hcard-top">
                          <div className="cb-hcard-id-row">
                            <span className="cb-hcard-code">Hive {hive.code}</span>
                            <span className="cb-hcard-name">{hive.name}</span>
                          </div>

                          <div className={`cb-select-indicator ${isSelected ? 'selected' : ''}`}>
                            {isSelected && <Check size={13} strokeWidth={3} />}
                          </div>
                        </div>

                        {/* Health Status Context (Section 5 & 31) */}
                        <div className="cb-hcard-health-row">
                          <span className={`cb-health-pill ${isAttention ? 'attention' : 'healthy'}`}>
                            <span className="cb-health-dot" />
                            {isAttention ? 'Needs attention' : 'Healthy'}
                          </span>
                          <span className="cb-inspect-time">
                            Inspected {hive.lastInspected || 'recently'}
                          </span>
                        </div>

                        {/* Subtle inspection finding context if attention (Section 32) */}
                        {isAttention && (
                          <div className="cb-hcard-context-note">
                            <Info size={12} color="#D9822B" />
                            <span>Brood pattern flagged for observation</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Source Confirmation Bar (Section 10) */}
              <div className="cb-source-summary-card">
                <div>
                  <span className="cb-ssummary-label">Selected Source:</span>
                  <strong className="cb-ssummary-val">{selectedHives.join(', ')}</strong>
                </div>
                <span className="cb-ssummary-badge">Traceable</span>
              </div>
            </div>
          )}

          {/* STEP 2: COLLECTION DETAILS (Section 11 - 16) */}
          {currentStep === 2 && (
            <div className="cb-step-panel animate-fade-in">
              <div className="cb-question-box">
                <h2 className="cb-question-title">Tell us about the collection</h2>
                <p className="cb-question-sub">
                  Harvest details for {selectedHives.join(', ')}
                </p>
              </div>

              {/* Prepopulated Collection Notification (Section 8) */}
              {isFromExistingCollection && (
                <div className="cb-prepopulated-notice">
                  <CheckCircle2 size={16} color="var(--color-healthy, #4F7A52)" />
                  <div>
                    <strong>Collection already recorded</strong>
                    <p>Details prepopulated from harvest log #{linkedCollectionId}.</p>
                  </div>
                </div>
              )}

              {/* Field 1: Collection Date (Section 12) */}
              <div className="cb-form-group">
                <div className="cb-field-head">
                  <label htmlFor="cb-date-input" className="cb-field-label">
                    Collection date
                  </label>
                  {isFromExistingCollection && (
                    <span className="cb-recorded-tag">Using recorded date</span>
                  )}
                </div>
                <div className="cb-input-wrap">
                  <Calendar size={16} className="cb-input-icon" />
                  <input
                    id="cb-date-input"
                    type="date"
                    className="cb-text-input"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Field 2: Quantity Collected (Section 13 & 14) */}
              <div className="cb-form-group">
                <label htmlFor="cb-quantity-input" className="cb-field-label">
                  How much honey was collected?
                </label>
                <div className="cb-quantity-row">
                  <div className="cb-input-wrap" style={{ flex: 1 }}>
                    <Scale size={16} className="cb-input-icon" />
                    <input
                      id="cb-quantity-input"
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="500"
                      className="cb-text-input cb-qty-input"
                      placeholder="e.g. 18.5"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="cb-unit-toggle" role="group" aria-label="Unit selection">
                    <button
                      type="button"
                      className={`cb-unit-btn ${unit === 'kg' ? 'active' : ''}`}
                      onClick={() => setUnit('kg')}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      className={`cb-unit-btn ${unit === 'g' ? 'active' : ''}`}
                      onClick={() => setUnit('g')}
                    >
                      g
                    </button>
                  </div>
                </div>
                <span className="cb-field-hint">
                  Realistic field harvest yield typically ranges between 5 kg to 80 kg per colony.
                </span>
              </div>

              {/* Field 3: Honey Type (Section 15 & 27) */}
              <div className="cb-form-group">
                <label className="cb-field-label">What kind of honey is this?</label>
                <div className="cb-honey-types-grid">
                  {CONFIGURED_HONEY_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type}
                      className={`cb-type-pill ${honeyType === type ? 'active' : ''}`}
                      onClick={() => setHoneyType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: Collection Notes (Section 16) */}
              <div className="cb-form-group">
                <label htmlFor="cb-notes-input" className="cb-field-label">
                  Collection notes (optional)
                </label>
                <textarea
                  id="cb-notes-input"
                  className="cb-textarea"
                  rows={3}
                  placeholder="Anything useful about this harvest? (e.g. weather conditions, frame observations, flora in bloom...)"
                  value={collectionNotes}
                  onChange={(e) => setCollectionNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 3: BATCH DETAILS & REVIEW (Section 17 - 23) */}
          {currentStep === 3 && (
            <div className="cb-step-panel animate-fade-in">
              <div className="cb-question-box">
                <h2 className="cb-question-title">Create your batch</h2>
                <p className="cb-question-sub">
                  Review the harvest details and name your batch.
                </p>
              </div>

              {/* Batch Name Field (Section 17 & 18) */}
              <div className="cb-form-group">
                <div className="cb-field-head">
                  <label htmlFor="cb-batch-name-input" className="cb-field-label">
                    Batch name
                  </label>
                  <span className="cb-field-hint-tag">Human friendly</span>
                </div>
                <input
                  id="cb-batch-name-input"
                  type="text"
                  className="cb-text-input cb-batch-name-input"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="e.g. Wildflower Harvest · 25 Sep"
                  required
                />
                <p className="cb-field-hint">
                  The permanent batch ID will be generated automatically by HoneyChain.
                </p>
              </div>

              {/* Planned Packaging Selection (Section 28) */}
              <div className="cb-form-group">
                <label className="cb-field-label">Planned packaging</label>
                <div className="cb-packaging-chips">
                  {['500g Glass', '250g Glass', '1kg Pail'].map((pkg) => (
                    <button
                      type="button"
                      key={pkg}
                      className={`cb-pkg-chip ${jarVolume === pkg ? 'active' : ''}`}
                      onClick={() => setJarVolume(pkg)}
                    >
                      {pkg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Your Batch Summary Card (Section 20) */}
              <div className="cb-review-card">
                <div className="cb-review-head">
                  <span className="cb-review-kicker">Review your batch</span>
                  <span className="cb-review-type-badge">{honeyType}</span>
                </div>

                <div className="cb-review-body">
                  <strong className="cb-review-batch-name">{batchName}</strong>

                  <div className="cb-review-grid">
                    <div className="cb-rgrid-item">
                      <span className="cb-rg-label">Source</span>
                      <strong className="cb-rg-val">{selectedHives.join(', ')}</strong>
                    </div>

                    <div className="cb-rgrid-item">
                      <span className="cb-rg-label">Collection</span>
                      <strong className="cb-rg-val">{collectionDate}</strong>
                    </div>

                    <div className="cb-rgrid-item">
                      <span className="cb-rg-label">Harvest yield</span>
                      <strong className="cb-rg-val">{quantity} {unit}</strong>
                    </div>

                    <div className="cb-rgrid-item">
                      <span className="cb-rg-label">Planned output</span>
                      <strong className="cb-rg-val">
                        ~{Math.round(parseFloat(quantity || 0) * 2)} sealed jars
                      </strong>
                    </div>
                  </div>

                  {collectionNotes && (
                    <div className="cb-review-notes">
                      <span className="cb-rg-label">Harvest Notes:</span>
                      <p className="cb-rn-text">{collectionNotes}</p>
                    </div>
                  )}
                </div>

                <div className="cb-review-footer">
                  <span className="cb-review-trust-note">
                    <ShieldCheck size={14} color="var(--color-healthy, #4F7A52)" />
                    <span>Permanent source attribution will be locked upon creation.</span>
                  </span>
                </div>
              </div>

              {/* Error feedback if creation failed (Section 35 & 36) */}
              {submissionError && (
                <div className="cb-error-banner">
                  <AlertTriangle size={16} color="#B85450" />
                  <div>
                    <strong>We couldn't create the batch</strong>
                    <p>{submissionError}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SUCCESS STATE (Section 24, 25, 26, 33, 34) */}
          {currentStep === 4 && createdBatch && (
            <div className="cb-success-panel animate-fade-in">
              <div className="cb-success-icon-wrap">
                <div className="cb-success-icon-circle">
                  <Check size={36} strokeWidth={3} color="#FFFFFF" />
                </div>
              </div>

              <span className="cb-success-badge">Batch created</span>
              <h2 className="cb-success-title">{createdBatch.name}</h2>
              <div className="cb-success-id-pill">
                <span>{createdBatch.displayId || createdBatch.batchNumber}</span>
              </div>

              <p className="cb-success-sub">
                Your honey is ready for the next step.
              </p>

              {/* Initial Honey Journey Stepper (Section 34) */}
              <div className="cb-success-journey-box">
                <span className="cb-sjourney-label">Initial Honey Journey State:</span>
                <div className="cb-sjourney-track">
                  <div className="cb-sj-node done">
                    <Check size={12} strokeWidth={3} />
                    <span>Collection</span>
                  </div>
                  <div className="cb-sj-line" />
                  <div className="cb-sj-node pending">
                    <span className="cb-sj-dot" />
                    <span>Processing</span>
                  </div>
                  <div className="cb-sj-line" />
                  <div className="cb-sj-node pending">
                    <span className="cb-sj-dot" />
                    <span>Quality</span>
                  </div>
                  <div className="cb-sj-line" />
                  <div className="cb-sj-node pending">
                    <span className="cb-sj-dot" />
                    <span>Packaging</span>
                  </div>
                  <div className="cb-sj-line" />
                  <div className="cb-sj-node pending">
                    <span className="cb-sj-dot" />
                    <span>Verified</span>
                  </div>
                </div>
                <span className="cb-sjourney-status-text">
                  Current state: <strong>Collected</strong> · Awaiting settling & moisture test
                </span>
              </div>

              {/* Source snapshot confirmation (Section 30) */}
              <div className="cb-success-snapshot-card">
                <div className="cb-snap-row">
                  <span className="cb-snap-kicker">Source preserved</span>
                  <span className="cb-snap-val">{createdBatch.sourceHives.join(', ')}</span>
                </div>
                <div className="cb-snap-row">
                  <span className="cb-snap-kicker">Harvest quantity</span>
                  <span className="cb-snap-val">{createdBatch.weightKg} kg</span>
                </div>
                <div className="cb-snap-row">
                  <span className="cb-snap-kicker">Harvest date</span>
                  <span className="cb-snap-val">{createdBatch.harvestDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            FOOTER ACTIONS (Section 21, 24, 25)
        ───────────────────────────────────────────────────────────── */}
        <footer className="cb-footer">
          {currentStep === 1 && (
            <button
              type="button"
              className="btn btn-honey btn-block cb-primary-cta"
              onClick={handleStep1Continue}
            >
              <span>Continue to collection details</span>
              <ChevronRight size={17} />
            </button>
          )}

          {currentStep === 2 && (
            <div className="cb-footer-dual-btn">
              <button
                type="button"
                className="btn btn-secondary cb-secondary-btn"
                onClick={() => setCurrentStep(1)}
              >
                <span>Edit source</span>
              </button>
              <button
                type="button"
                className="btn btn-honey cb-primary-cta"
                style={{ flex: 1 }}
                onClick={handleStep2Continue}
              >
                <span>Review batch</span>
                <ChevronRight size={17} />
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="cb-footer-dual-btn">
              <button
                type="button"
                className="btn btn-secondary cb-secondary-btn"
                onClick={() => setCurrentStep(2)}
                disabled={isSubmitting}
              >
                <span>Edit</span>
              </button>
              <button
                type="button"
                className="btn btn-honey cb-primary-cta"
                style={{ flex: 1 }}
                onClick={handleCreateBatchSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Securing batch record…</span>
                ) : (
                  <>
                    <Check size={18} />
                    <span>Create batch</span>
                  </>
                )}
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="cb-footer-dual-btn">
              <button
                type="button"
                className="btn btn-secondary cb-secondary-btn"
                onClick={() => {
                  if (createdBatch?.id) {
                    setSelectedBatchId(createdBatch.id);
                    if (setActiveTab) setActiveTab('honey');
                  }
                  onClose();
                }}
              >
                <span>View batch</span>
                <ExternalLink size={14} />
              </button>
              <button
                type="button"
                className="btn btn-honey cb-primary-cta"
                style={{ flex: 1 }}
                onClick={() => {
                  onClose();
                  handleResetForm();
                }}
              >
                <span>Continue</span>
              </button>
            </div>
          )}
        </footer>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STYLES (Strictly conforming to Section 41 & 44)
      ───────────────────────────────────────────────────────────── */}
      <style>{`
        .cb-modal-overlay {
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
          .cb-modal-overlay {
            align-items: center;
            padding: 20px;
          }
        }

        .cb-modal-container {
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
        }

        @media (min-width: 640px) {
          .cb-modal-container {
            border-radius: 20px;
            height: 90vh;
          }
        }

        /* Header */
        .cb-header {
          padding: 16px 20px 14px;
          background: #FFFDF8;
          border-bottom: 1px solid #EDE2D1;
          flex-shrink: 0;
        }

        .cb-header-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .cb-nav-back-btn {
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

        .cb-nav-back-btn:hover {
          background: rgba(120, 109, 97, 0.08);
          color: #34261B;
        }

        .cb-nav-tag {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #B87316;
          background: rgba(217, 154, 36, 0.12);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .cb-close-btn {
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

        .cb-close-btn:hover {
          background: rgba(120, 109, 97, 0.16);
          color: #34261B;
        }

        .cb-header-title-box {
          margin-bottom: 12px;
        }

        .cb-title {
          font-size: 20px;
          font-weight: 800;
          color: #34261B;
          margin: 0 0 2px 0;
          line-height: 1.25;
        }

        .cb-subtitle {
          font-size: 13px;
          color: #786D61;
          margin: 0;
          line-height: 1.4;
        }

        /* Progress Stepper */
        .cb-progress-bar-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
        }

        .cb-progress-step {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cb-pdot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #EDE2D1;
          color: #786D61;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .cb-progress-step.active .cb-pdot {
          background: #D99A24;
          color: #FFFFFF;
        }

        .cb-progress-step.completed .cb-pdot {
          background: #71845B;
          color: #FFFFFF;
        }

        .cb-plabel {
          font-size: 12px;
          font-weight: 600;
          color: #786D61;
        }

        .cb-progress-step.active .cb-plabel {
          color: #34261B;
          font-weight: 700;
        }

        .cb-pline {
          flex: 1;
          height: 2px;
          background: #EDE2D1;
          margin: 0 8px;
          transition: background 0.2s ease;
        }

        .cb-pline.active {
          background: #D99A24;
        }

        /* Body Scroll */
        .cb-body-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          box-sizing: border-box;
          -webkit-overflow-scrolling: touch;
        }

        .cb-question-box {
          margin-bottom: 16px;
        }

        .cb-question-title {
          font-size: 17px;
          font-weight: 700;
          color: #34261B;
          margin: 0 0 4px 0;
        }

        .cb-question-sub {
          font-size: 13px;
          color: #786D61;
          margin: 0;
          line-height: 1.4;
        }

        /* Jury Shortcut */
        .cb-jury-shortcut-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(217, 154, 36, 0.08);
          border: 1px dashed #D99A24;
          border-radius: 10px;
          padding: 8px 12px;
          margin-bottom: 16px;
          gap: 8px;
        }

        .cb-jshortcut-left {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          color: #B87316;
        }

        .cb-jshortcut-btn {
          background: #D99A24;
          color: #FFFFFF;
          border: none;
          font-size: 11.5px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
        }

        .cb-jshortcut-btn:hover {
          background: #B87316;
        }

        /* Section */
        .cb-section {
          margin-bottom: 16px;
        }

        .cb-section-label {
          display: block;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #786D61;
          margin-bottom: 8px;
        }

        /* Recent Collections */
        .cb-recent-collections-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cb-recent-col-card {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .cb-rcol-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cb-rcol-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cb-rcol-title {
          font-size: 13.5px;
          color: #34261B;
          display: block;
        }

        .cb-rcol-meta {
          font-size: 12px;
          color: #786D61;
          margin: 1px 0 0 0;
        }

        .cb-use-col-btn {
          font-size: 12px;
          padding: 6px 10px;
          white-space: nowrap;
        }

        /* Multi-source toggle */
        .cb-multisource-toggle-bar {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 10px;
          padding: 8px 12px;
          margin-bottom: 12px;
        }

        .cb-toggle-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #34261B;
          cursor: pointer;
        }

        .cb-warning-banner {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: rgba(217, 130, 43, 0.08);
          border: 1px solid rgba(217, 130, 43, 0.25);
          border-radius: 10px;
          padding: 8px 12px;
          margin-bottom: 14px;
        }

        .cb-warning-banner p {
          margin: 0;
          font-size: 12px;
          color: #B87316;
          line-height: 1.4;
        }

        /* Search */
        .cb-search-box {
          position: relative;
          display: flex;
          align-items: center;
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 10px;
          padding: 8px 12px;
          margin-bottom: 14px;
        }

        .cb-search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 13px;
          color: #34261B;
          outline: none;
          margin-left: 8px;
        }

        .cb-clear-btn {
          background: transparent;
          border: none;
          color: #786D61;
          cursor: pointer;
          padding: 2px;
        }

        /* Hives Grid */
        .cb-hives-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cb-hive-card {
          background: #FFFDF8;
          border: 1.5px solid #EDE2D1;
          border-radius: 12px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .cb-hive-card:hover {
          border-color: #D99A24;
        }

        .cb-hive-card.selected {
          border-color: #D99A24;
          background: #FFFDF8;
          box-shadow: 0 2px 8px rgba(217, 154, 36, 0.12);
        }

        .cb-hcard-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .cb-hcard-id-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cb-hcard-code {
          font-size: 12px;
          font-weight: 700;
          color: #B87316;
          background: rgba(217, 154, 36, 0.12);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .cb-hcard-name {
          font-size: 14px;
          font-weight: 700;
          color: #34261B;
        }

        .cb-select-indicator {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1.5px solid #EDE2D1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
        }

        .cb-select-indicator.selected {
          background: #D99A24;
          border-color: #D99A24;
          color: #FFFFFF;
        }

        .cb-hcard-health-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cb-health-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .cb-health-pill.healthy {
          background: rgba(113, 132, 91, 0.12);
          color: #71845B;
        }

        .cb-health-pill.attention {
          background: rgba(217, 130, 43, 0.12);
          color: #D9822B;
        }

        .cb-health-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .cb-inspect-time {
          font-size: 11.5px;
          color: #786D61;
        }

        .cb-hcard-context-note {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: #D9822B;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px dashed #EDE2D1;
        }

        /* Source Summary Bar */
        .cb-source-summary-card {
          margin-top: 14px;
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cb-ssummary-label {
          font-size: 11px;
          text-transform: uppercase;
          color: #786D61;
          display: block;
        }

        .cb-ssummary-val {
          font-size: 13.5px;
          color: #34261B;
        }

        .cb-ssummary-badge {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: #71845B;
          background: rgba(113, 132, 91, 0.12);
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* Step 2 Form Elements */
        .cb-form-group {
          margin-bottom: 16px;
        }

        .cb-field-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .cb-field-label {
          font-size: 13px;
          font-weight: 700;
          color: #34261B;
          display: block;
        }

        .cb-field-hint {
          font-size: 11.5px;
          color: #786D61;
          margin-top: 4px;
          line-height: 1.35;
        }

        .cb-field-hint-tag {
          font-size: 11px;
          color: #B87316;
          background: rgba(217, 154, 36, 0.1);
          padding: 1px 6px;
          border-radius: 4px;
        }

        .cb-recorded-tag {
          font-size: 10.5px;
          font-weight: 600;
          color: #71845B;
          background: rgba(113, 132, 91, 0.12);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .cb-prepopulated-notice {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: rgba(113, 132, 91, 0.08);
          border: 1px solid rgba(113, 132, 91, 0.25);
          border-radius: 10px;
          padding: 10px 12px;
          margin-bottom: 16px;
        }

        .cb-prepopulated-notice strong {
          font-size: 13px;
          color: #71845B;
          display: block;
        }

        .cb-prepopulated-notice p {
          font-size: 12px;
          color: #786D61;
          margin: 2px 0 0 0;
        }

        .cb-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .cb-input-icon {
          position: absolute;
          left: 12px;
          color: #786D61;
          pointer-events: none;
        }

        .cb-text-input {
          width: 100%;
          height: 44px;
          background: #FFFDF8;
          border: 1.5px solid #EDE2D1;
          border-radius: 10px;
          padding: 0 12px 0 36px;
          font-size: 14px;
          color: #34261B;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .cb-text-input:focus {
          border-color: #D99A24;
        }

        .cb-batch-name-input {
          padding-left: 14px;
          font-weight: 600;
        }

        .cb-quantity-row {
          display: flex;
          gap: 8px;
        }

        .cb-qty-input {
          font-size: 16px;
          font-weight: 700;
        }

        .cb-unit-toggle {
          display: flex;
          background: #EDE2D1;
          border-radius: 10px;
          padding: 2px;
          height: 44px;
          box-sizing: border-box;
        }

        .cb-unit-btn {
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 700;
          color: #786D61;
          padding: 0 14px;
          border-radius: 8px;
          cursor: pointer;
        }

        .cb-unit-btn.active {
          background: #FFFDF8;
          color: #34261B;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .cb-honey-types-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }

        .cb-type-pill {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          color: #786D61;
          font-size: 12.5px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .cb-type-pill.active {
          background: #D99A24;
          border-color: #D99A24;
          color: #FFFFFF;
        }

        .cb-textarea {
          width: 100%;
          background: #FFFDF8;
          border: 1.5px solid #EDE2D1;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13.5px;
          color: #34261B;
          box-sizing: border-box;
          outline: none;
          resize: vertical;
          font-family: inherit;
        }

        .cb-textarea:focus {
          border-color: #D99A24;
        }

        .cb-packaging-chips {
          display: flex;
          gap: 8px;
          margin-top: 6px;
        }

        .cb-pkg-chip {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          color: #786D61;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
        }

        .cb-pkg-chip.active {
          border-color: #B87316;
          background: rgba(217, 154, 36, 0.12);
          color: #B87316;
        }

        /* Review Card */
        .cb-review-card {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 14px;
          padding: 16px;
          margin-top: 12px;
        }

        .cb-review-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid #EDE2D1;
          margin-bottom: 12px;
        }

        .cb-review-kicker {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #786D61;
        }

        .cb-review-type-badge {
          font-size: 11.5px;
          font-weight: 700;
          color: #B87316;
          background: rgba(217, 154, 36, 0.12);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .cb-review-batch-name {
          font-size: 16px;
          font-weight: 800;
          color: #34261B;
          display: block;
          margin-bottom: 12px;
        }

        .cb-review-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px 16px;
        }

        .cb-rg-label {
          font-size: 11px;
          color: #786D61;
          display: block;
          text-transform: uppercase;
        }

        .cb-rg-val {
          font-size: 14px;
          font-weight: 700;
          color: #34261B;
          margin-top: 2px;
          display: block;
        }

        .cb-review-notes {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px dashed #EDE2D1;
        }

        .cb-rn-text {
          font-size: 12.5px;
          color: #786D61;
          margin: 4px 0 0 0;
          font-style: italic;
        }

        .cb-review-footer {
          margin-top: 14px;
          padding-top: 10px;
          border-top: 1px solid #EDE2D1;
        }

        .cb-review-trust-note {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #71845B;
        }

        .cb-error-banner {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: rgba(184, 84, 80, 0.08);
          border: 1px solid #B85450;
          border-radius: 10px;
          padding: 10px 12px;
          margin-top: 14px;
        }

        .cb-error-banner strong {
          font-size: 13px;
          color: #B85450;
          display: block;
        }

        .cb-error-banner p {
          font-size: 12px;
          color: #786D61;
          margin: 2px 0 0 0;
        }

        /* Success Panel */
        .cb-success-panel {
          text-align: center;
          padding: 16px 8px;
        }

        .cb-success-icon-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }

        .cb-success-icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #71845B;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(113, 132, 91, 0.35);
        }

        .cb-success-badge {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #71845B;
        }

        .cb-success-title {
          font-size: 21px;
          font-weight: 800;
          color: #34261B;
          margin: 4px 0 6px 0;
        }

        .cb-success-id-pill {
          display: inline-block;
          font-size: 12.5px;
          font-weight: 700;
          color: #B87316;
          background: rgba(217, 154, 36, 0.12);
          border: 1px solid rgba(217, 154, 36, 0.3);
          padding: 3px 10px;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .cb-success-sub {
          font-size: 13.5px;
          color: #786D61;
          margin: 0 0 20px 0;
        }

        /* Success Journey Box */
        .cb-success-journey-box {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 14px;
          text-align: left;
        }

        .cb-sjourney-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #786D61;
          display: block;
          margin-bottom: 12px;
        }

        .cb-sjourney-track {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .cb-sj-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .cb-sj-node span {
          font-size: 10px;
          font-weight: 600;
          color: #786D61;
        }

        .cb-sj-node.done {
          color: #71845B;
        }

        .cb-sj-node.done span {
          color: #71845B;
          font-weight: 700;
        }

        .cb-sj-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #EDE2D1;
        }

        .cb-sj-line {
          flex: 1;
          height: 2px;
          background: #EDE2D1;
          margin: 0 4px 14px 4px;
        }

        .cb-sjourney-status-text {
          font-size: 12px;
          color: #786D61;
          display: block;
          border-top: 1px solid #EDE2D1;
          padding-top: 8px;
        }

        .cb-sjourney-status-text strong {
          color: #B87316;
        }

        /* Success Snapshot Card */
        .cb-success-snapshot-card {
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 12px 14px;
          text-align: left;
        }

        .cb-snap-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 12.5px;
        }

        .cb-snap-kicker {
          color: #786D61;
        }

        .cb-snap-val {
          font-weight: 700;
          color: #34261B;
        }

        /* Footer */
        .cb-footer {
          padding: 14px 20px 18px;
          background: #FFFDF8;
          border-top: 1px solid #EDE2D1;
          flex-shrink: 0;
        }

        .cb-primary-cta {
          height: 48px;
          font-size: 14.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .cb-secondary-btn {
          height: 48px;
          font-size: 14px;
          font-weight: 600;
          padding: 0 16px;
        }

        .cb-footer-dual-btn {
          display: flex;
          gap: 10px;
        }
      `}</style>
    </div>
  );

  const mountTarget = typeof document !== 'undefined'
    ? (document.querySelector('.app-viewport') || document.body)
    : null;

  return mountTarget ? createPortal(content, mountTarget) : content;
};
