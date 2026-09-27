import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Sheet } from '../common/Sheet';
import { Check, ShieldCheck, AlertCircle } from 'lucide-react';

export const HiveInspectionModal = ({ isOpen, onClose, initialHiveId }) => {
  const { hives, logInspection } = useAppState();

  const [selectedHiveId, setSelectedHiveId] = useState(initialHiveId || hives[0]?.id || 'hive-01');
  const [temperament, setTemperament] = useState('Calm');
  const [queenSeen, setQueenSeen] = useState(true);
  const [broodPattern, setBroodPattern] = useState('Solid & Contiguous');
  const [notes, setNotes] = useState('');

  const currentHive = hives.find((h) => h.id === selectedHiveId) || hives[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    logInspection({
      hiveId: selectedHiveId,
      temperament,
      queenSeen,
      broodPattern,
      notes,
      weightKg: currentHive.weight
    });
    onClose?.();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Field Inspection Log"
      subtitle="4-tap colony health assessment"
    >
      <form onSubmit={handleSubmit} className="inspection-form">
        {/* Hive Selector */}
        <div className="form-group">
          <label className="form-label">Inspecting Colony</label>
          <div className="hive-chips-row">
            {hives.map((h) => (
              <button
                type="button"
                key={h.id}
                className={`chip-btn ${selectedHiveId === h.id ? 'active' : ''}`}
                onClick={() => setSelectedHiveId(h.id)}
              >
                Hive #{h.code}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Colony Temperament */}
        <div className="form-group">
          <label className="form-label">1. Colony Temperament</label>
          <div className="pill-options-grid">
            {['Very Calm', 'Calm', 'Defensive'].map((t) => (
              <button
                type="button"
                key={t}
                className={`pill-choice-btn ${temperament === t ? 'active' : ''}`}
                onClick={() => setTemperament(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Queen Status */}
        <div className="form-group">
          <label className="form-label">2. Queen Verification</label>
          <div className="pill-options-grid">
            <button
              type="button"
              className={`pill-choice-btn ${queenSeen ? 'active' : ''}`}
              onClick={() => setQueenSeen(true)}
            >
              Queen Sighted
            </button>
            <button
              type="button"
              className={`pill-choice-btn ${!queenSeen ? 'active' : ''}`}
              onClick={() => setQueenSeen(false)}
            >
              Eggs / Larvae Only
            </button>
          </div>
        </div>

        {/* 3. Brood Pattern */}
        <div className="form-group">
          <label className="form-label">3. Brood Comb Pattern</label>
          <div className="pill-options-grid">
            {['Solid & Contiguous', 'Moderate', 'Spotty'].map((bp) => (
              <button
                type="button"
                key={bp}
                className={`pill-choice-btn ${broodPattern === bp ? 'active' : ''}`}
                onClick={() => setBroodPattern(bp)}
              >
                {bp}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Field Notes */}
        <div className="form-group">
          <label className="form-label">Field Notes (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Added empty super; clean white wax comb"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary btn-block submit-btn">
          <Check size={18} />
          <span>Save Field Inspection</span>
        </button>
      </form>

      <style>{`
        .inspection-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .hive-chips-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .chip-btn {
          padding: 8px 14px;
          border-radius: var(--radius-badge);
          border: 1px solid var(--color-divider);
          background-color: var(--color-soft-ivory);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-warm-gray);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .chip-btn.active {
          border-color: var(--color-deep-honey);
          background-color: var(--color-primary-honey-tint);
          color: var(--color-deep-honey);
        }

        .pill-options-grid {
          display: flex;
          gap: 8px;
        }

        .pill-choice-btn {
          flex: 1;
          padding: 10px 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
          background-color: #FAF4E8;
          border: 1px solid var(--color-divider);
          border-radius: var(--radius-button);
          cursor: pointer;
          text-align: center;
          transition: all 0.15s ease;
        }

        .pill-choice-btn.active {
          background-color: var(--color-primary-honey);
          border-color: var(--color-primary-honey);
          color: #FFFFFF;
        }

        .form-input {
          padding: 12px 14px;
          border: 1px solid var(--color-divider);
          border-radius: var(--radius-button);
          background-color: var(--color-soft-ivory);
          font-size: 14px;
          font-family: var(--font-family);
          color: var(--color-deep-cocoa);
          outline: none;
        }

        .form-input:focus {
          border-color: var(--color-primary-honey);
        }

        .submit-btn {
          margin-top: 8px;
        }
      `}</style>
    </Sheet>
  );
};
