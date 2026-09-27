import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Sheet } from '../common/Sheet';
import { ClipboardEdit, Check } from 'lucide-react';

const PRESET_OBSERVATIONS = [
  "Bees actively foraging and bringing pollen",
  "Normal steady flight activity at entrance",
  "Queen active and solid contiguous brood seen",
  "Colony very calm and steady",
  "Unusual defensive behavior noted",
  "Honey super frames ready for extraction"
];

export const RecordObservationModal = ({ isOpen, onClose, hiveId }) => {
  const { hives, recordObservation } = useAppState();
  const hive = hives.find(h => h.id === hiveId) || hives[0];

  const [selectedPreset, setSelectedPreset] = useState('');
  const [customNote, setCustomNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalObservation = customNote.trim() || selectedPreset || "Conditions observed as healthy & stable.";
    if (hive) {
      recordObservation({ hiveId: hive.id, text: finalObservation });
    }
    setSelectedPreset('');
    setCustomNote('');
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={`Record Observation — ${hive?.name || 'Hive'}`}>
      <form onSubmit={handleSubmit} className="record-obs-form">
        <p className="form-sub-hint">
          Log a field observation. Quick observations keep your colony records up to date.
        </p>

        <div className="preset-chips-wrap">
          <span className="preset-label">Quick select:</span>
          <div className="preset-chips-list">
            {PRESET_OBSERVATIONS.map((preset) => {
              const isSelected = selectedPreset === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  className={`preset-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedPreset('');
                    } else {
                      setSelectedPreset(preset);
                      if (!customNote) setCustomNote(preset);
                    }
                  }}
                >
                  {isSelected && <Check size={12} strokeWidth={2.5} />}
                  <span>{preset}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="obs-note">
            Detailed observation note
          </label>
          <textarea
            id="obs-note"
            className="obs-textarea"
            rows={3}
            placeholder="Type specific colony notes or describe what you observed..."
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
          />
        </div>

        <div className="modal-cta-row">
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
            <ClipboardEdit size={16} />
            <span>Save observation</span>
          </button>
        </div>
      </form>

      <style>{`
        .record-obs-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .form-sub-hint {
          font-size: 13.5px;
          color: var(--color-warm-gray);
          line-height: 1.45;
          margin: 0;
        }

        .preset-chips-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .preset-label {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
        }

        .preset-chips-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .preset-chip {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border-radius: 9px;
          background-color: #FAF4E9;
          border: 1px solid var(--color-divider);
          font-family: inherit;
          font-size: 12.5px;
          color: var(--color-deep-cocoa);
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .preset-chip:hover {
          background-color: #F4EAD7;
          border-color: #D6C7B2;
        }

        .preset-chip.selected {
          background-color: #FAF0DC;
          border-color: var(--color-primary-honey);
          color: var(--color-deep-cocoa);
          font-weight: 650;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 13px;
          font-weight: 650;
          color: var(--color-deep-cocoa);
        }

        .obs-textarea {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          font-family: inherit;
          color: var(--color-deep-cocoa);
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          border-radius: 10px;
          outline: none;
          box-sizing: border-box;
          resize: vertical;
        }

        .obs-textarea:focus {
          border-color: var(--color-primary-honey);
          background-color: #FFF;
        }

        .modal-cta-row {
          display: flex;
          gap: 10px;
          margin-top: 6px;
        }
      `}</style>
    </Sheet>
  );
};
