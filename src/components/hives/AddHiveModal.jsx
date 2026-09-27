import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Sheet } from '../common/Sheet';
import { PlusCircle, Box, MapPin, Tag, FileText, Cpu, Check } from 'lucide-react';

export const AddHiveModal = ({ isOpen, onClose, onAddHive }) => {
  const { addHive, apiary, showToast } = useAppState();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState(apiary?.name || 'Meadowbrook Apiary');
  const [type, setType] = useState('Langstroth');
  const [notes, setNotes] = useState('');
  const [hasDevice, setHasDevice] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newHiveData = {
      name: name.trim() || undefined,
      code: code.trim() || undefined,
      location: location.trim() || undefined,
      type,
      notes: notes.trim(),
      hasDevice
    };
    addHive(newHiveData);
    if (onAddHive) onAddHive(newHiveData);
    if (showToast) showToast(`Hive ${newHiveData.name || 'colony'} added to apiary`);

    // Reset form
    setName('');
    setCode('');
    setNotes('');
    setHasDevice(false);
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Add Hive">
      <form onSubmit={handleSubmit} className="add-hive-form">
        <p className="form-sub-hint">
          Register a colony in your apiary. You can begin recording inspections immediately.
        </p>

        <div className="input-group">
          <label className="input-label" htmlFor="hive-name">
            Hive name
          </label>
          <div className="input-field-wrap">
            <Box size={16} className="field-icon" />
            <input
              id="hive-name"
              type="text"
              className="text-input"
              placeholder="e.g. Hive A-03 or Heather Ridge"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="input-group">
            <label className="input-label" htmlFor="hive-code">
              Identifier / Code
            </label>
            <div className="input-field-wrap">
              <Tag size={16} className="field-icon" />
              <input
                id="hive-code"
                type="text"
                className="text-input"
                placeholder="e.g. 07"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="hive-type">
              Hive type
            </label>
            <select
              id="hive-type"
              className="select-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Langstroth">Langstroth</option>
              <option value="Top-Bar">Top-Bar</option>
              <option value="Warre">Warré</option>
              <option value="Layens">Layens</option>
              <option value="Observation">Observation</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="hive-location">
            Apiary / Location
          </label>
          <div className="input-field-wrap">
            <MapPin size={16} className="field-icon" />
            <input
              id="hive-location"
              type="text"
              className="text-input"
              placeholder="e.g. North Apiary or Field 2 · North side"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="hive-notes">
            Colony notes (optional)
          </label>
          <div className="input-field-wrap">
            <FileText size={16} className="field-icon" style={{ top: '14px' }} />
            <textarea
              id="hive-notes"
              className="textarea-input"
              rows={2}
              placeholder="e.g. 5-frame nuc transferred in Spring. Queen marked."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Optional monitoring device toggle — NEVER forced */}
        <div className="device-opt-card" onClick={() => setHasDevice(!hasDevice)} role="checkbox" aria-checked={hasDevice} tabIndex={0}>
          <div className="device-opt-info">
            <div className="device-opt-header">
              <Cpu size={16} color="var(--color-primary-honey)" />
              <strong style={{ fontSize: '14px', color: 'var(--color-deep-cocoa)' }}>Connect a monitoring device</strong>
            </div>
            <p className="device-opt-desc">
              Optionally enable live colony observations (temperature & humidity). You can connect or change this anytime later.
            </p>
          </div>
          <div className={`custom-checkbox ${hasDevice ? 'checked' : ''}`}>
            {hasDevice && <Check size={13} strokeWidth={2.6} color="#FFF" />}
          </div>
        </div>

        <div className="modal-cta-row">
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
            <PlusCircle size={16} />
            <span>Create hive</span>
          </button>
        </div>
      </form>
 
      <style>{`
        .add-hive-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .form-sub-hint {
          font-size: 13.5px;
          color: var(--color-warm-gray);
          line-height: 1.45;
          margin: 0 0 4px 0;
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

        .input-field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 12px;
          color: var(--color-warm-gray);
          pointer-events: none;
        }

        .text-input,
        .select-input,
        .textarea-input {
          width: 100%;
          padding: 12px 14px 12px 38px;
          font-size: 14px;
          font-family: inherit;
          color: var(--color-deep-cocoa);
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          border-radius: 10px;
          outline: none;
          transition: border-color 0.15s ease;
          box-sizing: border-box;
        }

        .select-input {
          padding-left: 14px;
          height: 44px;
        }

        .textarea-input {
          padding-top: 10px;
          resize: vertical;
        }

        .text-input:focus,
        .select-input:focus,
        .textarea-input:focus {
          border-color: var(--color-primary-honey);
          background-color: #FFF;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .device-opt-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-radius: 12px;
          background-color: #FAF4E9;
          border: 1px solid var(--color-divider);
          cursor: pointer;
          user-select: none;
          gap: 12px;
          transition: background-color 0.15s ease;
        }

        .device-opt-card:hover {
          background-color: #F4EAD7;
        }

        .device-opt-info {
          flex: 1;
        }

        .device-opt-header {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 3px;
        }

        .device-opt-desc {
          font-size: 12px;
          color: var(--color-warm-gray);
          line-height: 1.35;
          margin: 0;
        }

        .custom-checkbox {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 1.5px solid #CFC1AB;
          background-color: #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }

        .custom-checkbox.checked {
          background-color: var(--color-primary-honey);
          border-color: var(--color-primary-honey);
        }

        .modal-cta-row {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }
      `}</style>
    </Sheet>
  );
};
