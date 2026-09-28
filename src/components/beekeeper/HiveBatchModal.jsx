import React, { useMemo, useState } from 'react';
import { X, Layers, Box, Grid, ShieldCheck, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

/**
 * Field-oriented creation of a beekeeper management cycle.
 * Architectural Hierarchy:
 * 1 Batch -> Multiple Hives -> Multiple Frames per Hive
 */
export const HiveBatchModal = ({ isOpen, onClose }) => {
  const {
    hives = [],
    hiveManagementBatches = [],
    createBatchWithHivesAndFrames
  } = useAppState();

  const [name, setName] = useState('');
  const [hiveCount, setHiveCount] = useState('5');
  const [framesPerHive, setFramesPerHive] = useState('10');
  const [hiveType, setHiveType] = useState('Langstroth');
  const [honeyType, setHoneyType] = useState('Wildflower');
  const [interval, setInterval] = useState('7');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [showExistingSelector, setShowExistingSelector] = useState(false);
  const [selectedExistingIds, setSelectedExistingIds] = useState([]);

  // Active hives already assigned to active management batches
  const activeHiveIds = useMemo(() => {
    return new Set(
      hiveManagementBatches
        .filter(batch => !['COMPLETED', 'HARVESTED'].includes(batch.status))
        .flatMap(batch => (batch.memberships || []).map(member => member.hiveId))
    );
  }, [hiveManagementBatches]);

  // Unassigned available hives
  const availableExistingHives = useMemo(() => {
    return hives.filter(h => !h.isArchived && !activeHiveIds.has(h.id));
  }, [hives, activeHiveIds]);

  if (!isOpen) return null;

  const parsedHiveCount = Math.max(1, parseInt(hiveCount, 10) || 1);
  const parsedFramesPerHive = Math.max(1, parseInt(framesPerHive, 10) || 10);
  const totalFrames = parsedHiveCount * parsedFramesPerHive;

  const toggleExistingHive = (id) => {
    setSelectedExistingIds(current => {
      const next = current.includes(id) ? current.filter(v => v !== id) : [...current, id];
      if (next.length > parsedHiveCount) {
        setHiveCount(String(next.length));
      }
      return next;
    });
  };

  const submit = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for this hive batch cycle.');
      return;
    }
    if (parsedHiveCount < 1) {
      setError('Please specify at least 1 hive for this batch.');
      return;
    }
    if (parsedFramesPerHive < 1) {
      setError('Please specify at least 1 frame per hive box.');
      return;
    }

    const result = createBatchWithHivesAndFrames({
      name: name.trim(),
      hiveCount: parsedHiveCount,
      framesPerHive: parsedFramesPerHive,
      hiveType,
      honeyType,
      inspectionIntervalDays: Math.max(1, Number(interval) || 7),
      notes: notes.trim(),
      selectedExistingHiveIds: selectedExistingIds
    });

    if (!result.success) {
      return setError(result.error);
    }

    // Reset form
    setName('');
    setHiveCount('5');
    setFramesPerHive('10');
    setHiveType('Langstroth');
    setHoneyType('Wildflower');
    setInterval('7');
    setNotes('');
    setError('');
    setSelectedExistingIds([]);
    setShowExistingSelector(false);
    onClose();
  };

  return (
    <div className="bk-hbm-overlay" role="dialog" aria-modal="true" aria-labelledby="hive-batch-title">
      <div className="bk-hbm-backdrop" onClick={onClose} />
      <form className="bk-hbm-card" onSubmit={submit}>
        {/* Header */}
        <div className="bk-hbm-header">
          <div className="bk-hbm-header-left">
            <div className="bk-hbm-icon-wrap">
              <Layers size={20} color="#D97706" />
            </div>
            <div>
              <h2 id="hive-batch-title" className="bk-hbm-title">Create Hive Batch</h2>
              <p className="bk-hbm-sub">Configure batch cycle, colonies, and comb frame capacity</p>
            </div>
          </div>
          <button type="button" className="bk-hbm-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="bk-hbm-body">
          {error && (
            <div className="bk-hbm-alert" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Batch Name */}
          <div className="bk-hbm-field">
            <label className="bk-hbm-label" htmlFor="hbm-name">
              Batch Name <span className="bk-hbm-req">*</span>
            </label>
            <input
              id="hbm-name"
              required
              className="bk-hbm-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Spring Mustard Nectar Cycle or Meadow Harvest Batch #1"
              autoFocus
            />
          </div>

          {/* Hive Count & Frames Per Hive */}
          <div className="bk-hbm-grid-2">
            <div className="bk-hbm-field">
              <label className="bk-hbm-label" htmlFor="hbm-hive-count">
                Hive Count <span className="bk-hbm-req">*</span>
              </label>
              <div className="bk-hbm-input-affix">
                <input
                  id="hbm-hive-count"
                  required
                  type="number"
                  min="1"
                  max="50"
                  className="bk-hbm-input"
                  value={hiveCount}
                  onChange={e => setHiveCount(e.target.value)}
                />
                <span className="bk-hbm-unit">boxes</span>
              </div>
              <span className="bk-hbm-hint">Hives provisioned for this batch</span>
            </div>

            <div className="bk-hbm-field">
              <label className="bk-hbm-label" htmlFor="hbm-frames-per-hive">
                Frames Per Hive <span className="bk-hbm-req">*</span>
              </label>
              <div className="bk-hbm-input-affix">
                <input
                  id="hbm-frames-per-hive"
                  required
                  type="number"
                  min="1"
                  max="30"
                  className="bk-hbm-input"
                  value={framesPerHive}
                  onChange={e => setFramesPerHive(e.target.value)}
                />
                <span className="bk-hbm-unit">frames</span>
              </div>
              <span className="bk-hbm-hint">Capacity per colony box</span>
            </div>
          </div>

          {/* Hive Box Type & Honey Variety */}
          <div className="bk-hbm-grid-2">
            <div className="bk-hbm-field">
              <label className="bk-hbm-label" htmlFor="hbm-hive-type">
                Hive Type <span className="bk-hbm-req">*</span>
              </label>
              <select
                id="hbm-hive-type"
                className="bk-hbm-select"
                value={hiveType}
                onChange={e => setHiveType(e.target.value)}
              >
                <option value="Langstroth">Langstroth (Standard 10-Frame)</option>
                <option value="Top-Bar">Top-Bar (Natural Comb)</option>
                <option value="Warre">Warré (Vertical Tiered)</option>
                <option value="Layens">Layens (Deep Horizontal)</option>
                <option value="Observation">Observation Glass Hive</option>
              </select>
            </div>

            <div className="bk-hbm-field">
              <label className="bk-hbm-label" htmlFor="hbm-honey-variety">
                Forage / Honey Variety <span className="bk-hbm-req">*</span>
              </label>
              <select
                id="hbm-honey-variety"
                className="bk-hbm-select"
                value={honeyType}
                onChange={e => setHoneyType(e.target.value)}
              >
                <option value="Wildflower">Wildflower (Multifloral)</option>
                <option value="Mustard">Mustard (Brassica juncea)</option>
                <option value="Acacia">Acacia (Robinia pseudoacacia)</option>
                <option value="Eucalyptus">Eucalyptus</option>
                <option value="Jamun">Jamun (Syzygium cumini)</option>
                <option value="Sidr">Sidr / Ber (Ziziphus)</option>
                <option value="Kashmir White">Kashmir White Nectar</option>
              </select>
            </div>
          </div>

          {/* Inspection Interval */}
          <div className="bk-hbm-field">
            <label className="bk-hbm-label" htmlFor="hbm-interval">
              Field Inspection Interval <span className="bk-hbm-req">*</span>
            </label>
            <div className="bk-hbm-input-affix">
              <input
                id="hbm-interval"
                required
                min="1"
                max="90"
                type="number"
                className="bk-hbm-input"
                value={interval}
                onChange={e => setInterval(e.target.value)}
              />
              <span className="bk-hbm-unit">days</span>
            </div>
            <span className="bk-hbm-hint">Recommended: 7 days during active nectar flow</span>
          </div>

          {/* Existing Colonies Selection (Optional) */}
          {availableExistingHives.length > 0 && (
            <div className="bk-hbm-existing-wrap">
              <button
                type="button"
                className="bk-hbm-existing-toggle"
                onClick={() => setShowExistingSelector(prev => !prev)}
              >
                <span>
                  Include existing unassigned hives ({selectedExistingIds.length} of {availableExistingHives.length} selected)
                </span>
                {showExistingSelector ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showExistingSelector && (
                <div className="bk-hbm-existing-list">
                  {availableExistingHives.map(hive => {
                    const isChecked = selectedExistingIds.includes(hive.id);
                    const cleanCode = hive.code ? (String(hive.code).startsWith('H') ? hive.code : `H${String(hive.code).padStart(3, '0')}`) : 'H001';
                    return (
                      <label
                        key={hive.id}
                        className={`bk-hbm-hive-card ${isChecked ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="bk-hbm-checkbox"
                          checked={isChecked}
                          onChange={() => toggleExistingHive(hive.id)}
                        />
                        <div className="bk-hbm-hive-info">
                          <div className="bk-hbm-hive-title-row">
                            <span className="bk-hbm-hive-code">{cleanCode}</span>
                            <strong className="bk-hbm-hive-name">{hive.name}</strong>
                          </div>
                          <span className="bk-hbm-hive-sub">{hive.type || 'Langstroth'} • {hive.superFramesTotal || 10} frames</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="bk-hbm-field">
            <label className="bk-hbm-label" htmlFor="hbm-notes">
              Cycle Notes <span className="bk-hbm-opt">(optional)</span>
            </label>
            <textarea
              id="hbm-notes"
              rows={2}
              className="bk-hbm-textarea"
              placeholder="e.g. Focus on brood pattern density, Varroa mite monitoring, and honey super filling"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bk-hbm-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ height: '44px', minWidth: '90px' }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ height: '44px', minWidth: '170px' }}>
            Create Batch ({parsedHiveCount} Hives, {totalFrames} Frames)
          </button>
        </div>
      </form>

      <style>{`
        .bk-hbm-overlay {
          position: fixed;
          inset: 0;
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .bk-hbm-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(36, 24, 16, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .bk-hbm-card {
          position: relative;
          width: 100%;
          max-width: 520px;
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow: hidden;
          animation: hbmPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes hbmPopIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .bk-hbm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px 14px;
          border-bottom: 1px solid var(--color-divider, #EAE4DA);
          background: #FAFAF8;
        }

        .bk-hbm-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bk-hbm-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bk-hbm-title {
          font-size: 17.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2E2015);
          margin: 0;
          line-height: 1.25;
        }

        .bk-hbm-sub {
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
          margin: 2px 0 0;
        }

        .bk-hbm-close-btn {
          background: none;
          border: none;
          padding: 6px;
          color: var(--color-warm-gray, #786D61);
          cursor: pointer;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.15s ease;
        }

        .bk-hbm-close-btn:hover {
          background: rgba(0, 0, 0, 0.06);
          color: #2E2015;
        }

        .bk-hbm-body {
          padding: 18px 22px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .bk-hbm-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          color: #B91C1C;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
        }


        .bk-hbm-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .bk-hbm-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
        }

        .bk-hbm-req {
          color: #DC2626;
        }

        .bk-hbm-opt {
          font-weight: 400;
          color: var(--color-warm-gray, #786D61);
          font-size: 12px;
        }

        .bk-hbm-hint {
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
        }

        .bk-hbm-input, .bk-hbm-select, .bk-hbm-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          font-size: 13.5px;
          border: 1px solid var(--color-card-border, #D5CCC0);
          border-radius: 9px;
          background: #FFFFFF;
          color: #2E2015;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .bk-hbm-input:focus, .bk-hbm-select:focus, .bk-hbm-textarea:focus {
          border-color: #D97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
        }

        .bk-hbm-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .bk-hbm-input-affix {
          position: relative;
          display: flex;
          align-items: center;
        }

        .bk-hbm-input-affix input {
          padding-right: 56px;
        }

        .bk-hbm-unit {
          position: absolute;
          right: 12px;
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
          pointer-events: none;
        }

        .bk-hbm-existing-wrap {
          border: 1px solid var(--color-card-border, #E4DCCF);
          border-radius: 10px;
          background: #FAF8F5;
          padding: 8px 12px;
        }

        .bk-hbm-existing-toggle {
          background: none;
          border: none;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12.5px;
          font-weight: 600;
          color: #92400E;
          cursor: pointer;
          padding: 4px 0;
        }

        .bk-hbm-existing-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 140px;
          overflow-y: auto;
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px dashed #E5DCD1;
        }

        .bk-hbm-hive-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          background: #FFFFFF;
          border: 1px solid #E8E0D5;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .bk-hbm-hive-card:hover {
          border-color: #D97706;
          background: #FFFDF9;
        }

        .bk-hbm-hive-card.selected {
          border-color: #D97706;
          background: #FFFBEB;
        }

        .bk-hbm-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #D97706;
          cursor: pointer;
        }

        .bk-hbm-hive-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .bk-hbm-hive-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bk-hbm-hive-code {
          font-size: 11px;
          font-weight: 700;
          color: #92400E;
          background: rgba(217, 119, 6, 0.12);
          padding: 1px 6px;
          border-radius: 4px;
        }

        .bk-hbm-hive-name {
          font-size: 12.5px;
          color: #2E2015;
        }

        .bk-hbm-hive-sub {
          font-size: 11px;
          color: var(--color-warm-gray, #786D61);
        }

        .bk-hbm-textarea {
          resize: vertical;
          min-height: 52px;
        }

        .bk-hbm-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding: 14px 22px 18px;
          border-top: 1px solid var(--color-divider, #EAE4DA);
          background: #FAFAF8;
        }
      `}</style>
    </div>
  );
};
