import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Sheet } from '../common/Sheet';
import { PlusCircle, Box, MapPin, Tag, FileText, Cpu, Check, Layers, Grid, Clock } from 'lucide-react';

export const AddHiveModal = ({ isOpen, onClose, onAddHive }) => {
  const { addHive, apiary, hiveManagementBatches = [], showToast } = useAppState();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [frameCount, setFrameCount] = useState('10');
  const [type, setType] = useState('Langstroth');
  const [honeyType, setHoneyType] = useState('Wildflower');
  const [interval, setInterval] = useState('7');
  const [batchId, setBatchId] = useState('none');
  const [location, setLocation] = useState(apiary?.name || 'Meadowbrook Apiary');
  const [notes, setNotes] = useState('');
  const [hasDevice, setHasDevice] = useState(false);

  // Active batches available for mapping
  const activeBatches = hiveManagementBatches.filter(
    b => !['COMPLETED', 'HARVESTED'].includes(b.status)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newHiveData = {
      name: name.trim() || undefined,
      code: code.trim() || undefined,
      frameCount: Math.max(1, parseInt(frameCount, 10) || 10),
      type,
      honeyType,
      inspectionInterval: Math.max(1, parseInt(interval, 10) || 7),
      batchId: batchId !== 'none' ? batchId : undefined,
      location: location.trim() || undefined,
      notes: notes.trim(),
      hasDevice
    };

    const res = addHive(newHiveData);
    if (res && res.success === false) {
      return;
    }

    if (onAddHive) onAddHive(newHiveData);
    if (showToast) {
      showToast(`Hive ${newHiveData.code ? `H${newHiveData.code}` : 'colony'} added to field`);
    }

    // Reset form
    setName('');
    setCode('');
    setFrameCount('10');
    setType('Langstroth');
    setHoneyType('Wildflower');
    setInterval('7');
    setBatchId('none');
    setNotes('');
    setHasDevice(false);
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Add Hive Box">
      <form onSubmit={handleSubmit} className="add-hive-form">
        <p className="form-sub-hint">
          Register an individual colony box or link it into an active field management batch cycle.
        </p>

        {/* Hive Number & Name Row */}
        <div className="form-grid-2">
          <div className="input-group">
            <label className="input-label" htmlFor="hive-code">
              Hive Number / Code <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div className="input-field-wrap">
              <Tag size={16} className="field-icon" />
              <input
                id="hive-code"
                type="text"
                required
                className="text-input"
                placeholder="e.g. 01, H007"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="hive-name">
              Hive Name <span style={{ fontSize: '11px', color: 'var(--color-warm-gray)', fontWeight: 'normal' }}>(optional)</span>
            </label>
            <div className="input-field-wrap">
              <Box size={16} className="field-icon" />
              <input
                id="hive-name"
                type="text"
                className="text-input"
                placeholder="e.g. Heather Ridge"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Frame Count & Hive Type Row */}
        <div className="form-grid-2">
          <div className="input-group">
            <label className="input-label" htmlFor="hive-frames">
              Frame Count <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div className="input-field-wrap">
              <Grid size={16} className="field-icon" />
              <input
                id="hive-frames"
                type="number"
                min="1"
                max="30"
                required
                className="text-input"
                value={frameCount}
                onChange={(e) => setFrameCount(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-warm-gray)' }}>Comb frames in this box</span>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="hive-type">
              Hive Type <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              id="hive-type"
              className="select-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Langstroth">Langstroth (10-Frame)</option>
              <option value="Top-Bar">Top-Bar (Natural Comb)</option>
              <option value="Warre">Warré (Vertical Tiered)</option>
              <option value="Layens">Layens (Deep Horizontal)</option>
              <option value="Observation">Observation Glass Hive</option>
            </select>
          </div>
        </div>

        {/* Forage / Variety & Field Inspection Interval Row */}
        <div className="form-grid-2">
          <div className="input-group">
            <label className="input-label" htmlFor="hive-honey-variety">
              Forage / Honey Variety <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select
              id="hive-honey-variety"
              className="select-input"
              value={honeyType}
              onChange={(e) => setHoneyType(e.target.value)}
            >
              <option value="Wildflower">Wildflower (Multifloral)</option>
              <option value="Mustard">Mustard (Brassica juncea)</option>
              <option value="Acacia">Acacia (Robinia)</option>
              <option value="Eucalyptus">Eucalyptus</option>
              <option value="Jamun">Jamun (Syzygium cumini)</option>
              <option value="Sidr">Sidr / Ber (Ziziphus)</option>
              <option value="Kashmir White">Kashmir White Nectar</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="hive-interval">
              Field Inspection Interval <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div className="input-field-wrap">
              <Clock size={16} className="field-icon" />
              <input
                id="hive-interval"
                type="number"
                min="1"
                max="90"
                required
                className="text-input"
                style={{ paddingRight: '48px' }}
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              />
              <span className="input-affix-unit">days</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-warm-gray)' }}>Inspection cycle frequency</span>
          </div>
        </div>

        {/* Batch Mapping Row */}
        <div className="input-group">
          <label className="input-label" htmlFor="hive-batch-mapping">
            Batch Mapping
          </label>
          <div className="input-field-wrap">
            <Layers size={16} className="field-icon" />
            <select
              id="hive-batch-mapping"
              className="select-input"
              style={{ paddingLeft: '38px' }}
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            >
              <option value="none">Stay as individual hive (No batch)</option>
              {activeBatches.map(b => (
                <option key={b.id} value={b.id}>
                  Batch: {b.name} ({b.status || 'ACTIVE'})
                </option>
              ))}
            </select>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-warm-gray)' }}>
            {batchId === 'none' ? 'Manage as standalone colony' : 'Linked into management cycle'}
          </span>
        </div>

        {/* Colony notes */}
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
              placeholder="e.g. Queen marked green, 8 frames of brood, healthy colony temperament"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Optional monitoring device toggle */}
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
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, height: '44px' }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 2, height: '44px' }}>
            <PlusCircle size={16} />
            <span>Create Hive ({frameCount} frames)</span>
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
          gap: 5px;
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

        .input-affix-unit {
          position: absolute;
          right: 14px;
          font-size: 12px;
          color: var(--color-warm-gray);
          pointer-events: none;
        }

        .text-input,
        .select-input,
        .textarea-input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          font-size: 13.5px;
          font-family: inherit;
          color: var(--color-deep-cocoa);
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          border-radius: 9px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-sizing: border-box;
        }

        .select-input {
          padding-left: 12px;
          height: 42px;
        }

        .textarea-input {
          padding-top: 10px;
          resize: vertical;
          min-height: 52px;
        }

        .text-input:focus,
        .select-input:focus,
        .textarea-input:focus {
          border-color: var(--color-primary-honey);
          background-color: #FFF;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
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
