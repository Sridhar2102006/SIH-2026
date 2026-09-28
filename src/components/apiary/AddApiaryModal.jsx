import React, { useState } from 'react';
import { Building2, X, AlertCircle } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

export const AddApiaryModal = ({ isOpen, onClose }) => {
  const { apiaries = [], addApiary, showToast } = useAppState();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const getNextCode = () => {
    let n = 1;
    while (apiaries.some(a => a.apiaryCode === `AP${n}`)) {
      n++;
    }
    return `AP${n}`;
  };

  const defaultCode = getNextCode();

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (!name.trim()) {
      const err = 'Please enter an apiary yard name.';
      setError(err);
      showToast?.(err);
      return;
    }

    // Auto-normalize yard code
    let cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      cleanCode = defaultCode;
    } else {
      const digitMatch = cleanCode.match(/^AP[-_\s]*0*([1-9][0-9]*)$/) || cleanCode.match(/^0*([1-9][0-9]*)$/);
      if (digitMatch) {
        cleanCode = `AP${digitMatch[1]}`;
      } else if (!cleanCode.startsWith('AP')) {
        cleanCode = `AP${cleanCode.replace(/[^A-Z0-9]/g, '')}`;
      }
    }

    try {
      const res = addApiary?.({
        name: name.trim(),
        apiaryCode: cleanCode,
        location: location.trim() || 'Regional Apiary Yard',
        notes: notes.trim()
      });

      if (res && res.success === false) {
        setError(res.error || 'Failed to register apiary yard.');
        return;
      }

      setName('');
      setCode('');
      setLocation('');
      setNotes('');
      setError('');
      onClose();
    } catch (err) {
      console.error('[AddApiaryModal] registration error:', err);
      setError(err.message || 'Error registering apiary yard.');
    }
  };

  return (
    <div className="bk-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-apiary-title">
      <div className="bk-modal-backdrop" onClick={onClose} />
      <form className="bk-modal-card" onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
        <div className="bk-modal-header">
          <div className="bk-modal-header-left">
            <div className="bk-modal-icon-wrap">
              <Building2 size={20} color="#D97706" />
            </div>
            <div>
              <h2 id="modal-apiary-title" className="bk-modal-title">Register Apiary Yard</h2>
              <p className="bk-modal-sub">Geographical and operational yard unit for honey traceability</p>
            </div>
          </div>
          <button type="button" className="bk-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="bk-modal-body">
          {error && (
            <div className="bk-form-error-banner">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="bk-form-group">
            <label className="bk-form-label" htmlFor="apiary-name-input">
              Apiary Yard Name <span className="bk-req">*</span>
            </label>
            <input
              id="apiary-name-input"
              type="text"
              className="bk-form-input"
              placeholder="e.g. Meadowbrook Apiary Yard #2"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError('');
              }}
              required
              autoFocus
            />
          </div>

          <div className="bk-form-group">
            <label className="bk-form-label" htmlFor="apiary-code-input">
              Yard Code <span className="bk-opt">(auto-generated)</span>
            </label>
            <input
              id="apiary-code-input"
              type="text"
              className="bk-form-input"
              placeholder={`e.g. ${defaultCode}`}
              value={code}
              onChange={e => {
                setCode(e.target.value.toUpperCase());
                if (error) setError('');
              }}
              maxLength={8}
            />
            <span className="bk-input-hint">Format: AP1, AP2. Leave blank to auto-assign <strong>{defaultCode}</strong>.</span>
          </div>

          <div className="bk-form-group">
            <label className="bk-form-label" htmlFor="apiary-location-input">
              Location / Coordinates <span className="bk-opt">(optional)</span>
            </label>
            <input
              id="apiary-location-input"
              type="text"
              className="bk-form-input"
              placeholder="e.g. Coimbatore, Western Ghats Buffer Zone"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>

          <div className="bk-form-group">
            <label className="bk-form-label" htmlFor="apiary-notes-input">
              Flora & Notes <span className="bk-opt">(optional)</span>
            </label>
            <textarea
              id="apiary-notes-input"
              rows={2}
              className="bk-form-textarea"
              placeholder="e.g. Wildflower and clover forage reserve."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="bk-modal-footer">
          <button type="button" className="btn btn-secondary bk-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary bk-btn-submit"
            onClick={handleSubmit}
          >
            Register Apiary Yard
          </button>
        </div>
      </form>

      <style>{`
        .bk-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
        }
        .bk-modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(52, 38, 27, 0.45);
          backdrop-filter: blur(3px);
        }
        .bk-modal-card {
          position: relative;
          background: #FFFFFF;
          border: 1px solid var(--color-card-border, #E2DAD0);
          border-radius: 16px;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 16px 36px rgba(52, 38, 27, 0.18);
          z-index: 10;
          overflow: hidden;
          animation: bkModalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes bkModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .bk-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-card-border, #E2DAD0);
          background: #FAF7F2;
        }
        .bk-modal-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bk-modal-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #FEF3C7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bk-modal-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #34261B);
          margin: 0;
        }
        .bk-modal-sub {
          font-size: 11.5px;
          color: #786D61;
          margin: 2px 0 0;
        }
        .bk-close-btn {
          background: transparent;
          border: none;
          color: #786D61;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 6px;
        }
        .bk-close-btn:hover {
          background: rgba(52, 38, 27, 0.08);
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-modal-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .bk-form-error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          color: #B91C1C;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
        }
        .bk-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .bk-form-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #34261B);
        }
        .bk-req {
          color: #DC2626;
          font-weight: 700;
        }
        .bk-opt {
          color: #9C9083;
          font-weight: 400;
          font-size: 11.5px;
        }
        .bk-form-input, .bk-form-textarea {
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1px solid #D8C7B0;
          background: #FAF7F2;
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #34261B);
          font-family: inherit;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .bk-form-input:focus, .bk-form-textarea:focus {
          border-color: #D97706;
          background: #FFFFFF;
          box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.15);
        }
        .bk-input-hint {
          font-size: 11.5px;
          color: #786D61;
          margin-top: 2px;
        }
        .bk-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid var(--color-card-border, #E2DAD0);
          background: #FAF7F2;
        }
        .bk-btn-cancel {
          height: 38px;
          padding: 0 16px;
          font-size: 13px;
        }
        .bk-btn-submit {
          height: 38px;
          padding: 0 18px;
          font-size: 13px;
          font-weight: 600;
          background-color: #D97706;
          border-color: #D97706;
          color: #FFFFFF;
          cursor: pointer;
        }
        .bk-btn-submit:hover {
          background-color: #B45309;
          border-color: #B45309;
        }
      `}</style>
    </div>
  );
};
