import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  ChevronRight,
  ArrowLeft,
  Plus,
  Calendar,
  CloudSun,
  ShieldCheck,
  Building2,
  X
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

export const ApiaryListView = ({
  onSelectHive,
  isAddApiaryOpen: extIsAddApiaryOpen,
  setIsAddApiaryOpen: extSetIsAddApiaryOpen
}) => {
  const {
    apiaries = [],
    hives = [],
    frames = [],
    addApiary,
    showToast
  } = useAppState();

  const [selectedApiaryId, setSelectedApiaryId] = useState(null);
  const [internalIsAddApiaryOpen, setInternalIsAddApiaryOpen] = useState(false);
  const isAddApiaryOpen = extIsAddApiaryOpen !== undefined ? extIsAddApiaryOpen : internalIsAddApiaryOpen;
  const setIsAddApiaryOpen = extSetIsAddApiaryOpen || setInternalIsAddApiaryOpen;
  const [newApiaryName, setNewApiaryName] = useState('');
  const [newApiaryCode, setNewApiaryCode] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const selectedApiary = apiaries.find(a => a.id === selectedApiaryId || a.apiaryCode === selectedApiaryId);

  // Hives in selected apiary
  const apiaryHives = selectedApiary
    ? hives.filter(h => (h.location || '').includes(selectedApiary.name) || (selectedApiary.apiaryCode === 'AP1' ? h.code <= '02' : h.code > '02'))
    : [];

  const handleCreateApiary = () => {
    if (!newApiaryName.trim() || !newApiaryCode.trim()) {
      showToast('Please provide an Apiary name and unique code (e.g. AP1, AP2).');
      return;
    }
    const cleanCode = newApiaryCode.toUpperCase().trim();
    if (apiaries.some(a => a.apiaryCode === cleanCode)) {
      showToast(`Apiary code ${cleanCode} is already registered.`);
      return;
    }

    const res = addApiary?.({
      name: newApiaryName,
      apiaryCode: cleanCode,
      location: newLocation || 'Regional Apiary Yard',
      notes: newNotes
    });

    if (res && res.success === false) {
      return;
    }

    setIsAddApiaryOpen(false);
    setNewApiaryName('');
    setNewApiaryCode('');
    setNewLocation('');
    setNewNotes('');
    showToast(`Apiary ${cleanCode} registered successfully`);
  };

  // Screen 3: Apiary Detail View
  if (selectedApiary) {
    return (
      <div className="bk-ap-viewport">
        <header className="bk-ap-header">
          <button
            type="button"
            className="bk-ap-back"
            onClick={() => setSelectedApiaryId(null)}
          >
            <ArrowLeft size={16} />
            <span>All apiaries</span>
          </button>
          <div className="bk-ap-head-title">
            <span className="bk-ap-code-badge large">{selectedApiary.apiaryCode}</span>
            <div>
              <h1 className="bk-ap-title">{selectedApiary.name}</h1>
              <p className="bk-ap-sub">{selectedApiary.location}</p>
            </div>
          </div>
        </header>

        <div className="bk-ap-body">
          {/* Weather & Operator Card */}
          <div className="bk-ap-meta-card">
            <div className="bk-ap-meta-row">
              <div className="bk-ap-meta-item">
                <CloudSun size={18} color="#D99A24" />
                <div>
                  <span className="bk-ap-meta-k">Field Weather</span>
                  <strong className="bk-ap-meta-v">
                    {selectedApiary.weather?.temp || '23.5°C'} · {selectedApiary.weather?.condition || 'Gentle sunshine'}
                  </strong>
                </div>
              </div>
              <div className="bk-ap-meta-item">
                <ShieldCheck size={18} color="#496B45" />
                <div>
                  <span className="bk-ap-meta-k">Certification</span>
                  <strong className="bk-ap-meta-v">{selectedApiary.certification || 'Certified Organic Apiary'}</strong>
                </div>
              </div>
            </div>
            {selectedApiary.notes && (
              <p className="bk-ap-notes">{selectedApiary.notes}</p>
            )}
          </div>

          {/* Hive Boxes in this Apiary */}
          <section className="bk-ap-section">
            <div className="bk-ap-sec-head">
              <h2 className="bk-ap-sec-title">Hive Boxes in {selectedApiary.apiaryCode} ({apiaryHives.length})</h2>
              <span className="bk-ap-sec-sub">Traceability prefix: {selectedApiary.apiaryCode}H...</span>
            </div>

            <div className="bk-ap-hive-list">
              {apiaryHives.map(hive => {
                const cleanCode = hive.code ? (hive.code.startsWith('H') ? hive.code : `H${hive.code.padStart(3, '0')}`) : 'H001';
                const hiveFrameCount = frames.filter(f => f.hiveCode === cleanCode).length;
                return (
                  <div
                    key={hive.id}
                    className="bk-ap-hive-card"
                    onClick={() => onSelectHive?.(hive.id)}
                  >
                    <div className="bk-ap-hc-left">
                      <span className="bk-ap-hc-code">{cleanCode}</span>
                      <div>
                        <strong className="bk-ap-hc-name">{hive.name}</strong>
                        <span className="bk-ap-hc-sub">{hive.breed} · {hiveFrameCount} frames registered</span>
                      </div>
                    </div>
                    <div className="bk-ap-hc-right">
                      <span className={`bk-ap-status-pill ${hive.status}`}>
                        {hive.status === 'healthy' ? 'Healthy' : 'Attention'}
                      </span>
                      <ChevronRight size={16} color="#8C7E70" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <style>{`
          .bk-ap-viewport { padding-bottom: 90px; }
          .bk-ap-header { padding: 18px 20px 14px; background: #FFFFFF; border-bottom: 1px solid var(--color-divider); }
          .bk-ap-back { display: flex; align-items: center; gap: 6px; background: none; border: none; font-size: 13px; font-weight: 600; color: var(--color-warm-gray); cursor: pointer; padding: 0 0 10px; }
          .bk-ap-head-title { display: flex; align-items: center; gap: 12px; }
          .bk-ap-code-badge.large { font-size: 16px; padding: 6px 12px; border-radius: 8px; background: #496B45; color: #FFFFFF; font-weight: 800; }
          .bk-ap-title { font-size: 20px; font-weight: 800; color: var(--color-deep-cocoa); margin: 0; }
          .bk-ap-sub { font-size: 13px; color: var(--color-warm-gray); margin: 2px 0 0; }
          .bk-ap-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 16px; }
          .bk-ap-meta-card { background: #FFFFFF; border: 1px solid var(--color-card-border); border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }
          .bk-ap-meta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .bk-ap-meta-item { display: flex; align-items: flex-start; gap: 8px; }
          .bk-ap-meta-k { display: block; font-size: 11px; text-transform: uppercase; color: var(--color-warm-gray); font-weight: 700; margin-bottom: 2px; }
          .bk-ap-meta-v { font-size: 13px; color: var(--color-deep-cocoa); }
          .bk-ap-notes { font-size: 12.5px; color: var(--color-warm-gray); margin: 0; padding-top: 8px; border-top: 1px solid var(--color-divider); line-height: 1.4; }
          .bk-ap-sec-head { margin-bottom: 12px; }
          .bk-ap-sec-title { font-size: 16px; font-weight: 800; color: var(--color-deep-cocoa); margin: 0; }
          .bk-ap-sec-sub { font-size: 12px; color: var(--color-warm-gray); }
          .bk-ap-hive-list { display: flex; flex-direction: column; gap: 10px; }
          .bk-ap-hive-card { background: #FFFFFF; border: 1px solid var(--color-card-border); border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
          .bk-ap-hc-left { display: flex; align-items: center; gap: 12px; }
          .bk-ap-hc-code { width: 44px; height: 32px; border-radius: 6px; background: rgba(73, 107, 69, 0.12); color: #496B45; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
          .bk-ap-hc-name { font-size: 14.5px; color: var(--color-deep-cocoa); display: block; }
          .bk-ap-hc-sub { font-size: 12px; color: var(--color-warm-gray); }
          .bk-ap-hc-right { display: flex; align-items: center; gap: 8px; }
          .bk-ap-status-pill { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
          .bk-ap-status-pill.healthy { background: rgba(73, 107, 69, 0.12); color: #496B45; }
          .bk-ap-status-pill.attention { background: rgba(217, 130, 43, 0.12); color: #D9822B; }
        `}</style>
      </div>
    );
  }

  // Screen 2: Apiary List View
  return (
    <div className="bk-ap-viewport">
      <div className="bk-ap-body">
        {apiaries.length === 0 ? (
          <div className="bk-ap-empty-card">
            <div className="bk-ap-empty-icon">
              <Building2 size={32} color="#D97706" />
            </div>
            <h3 className="bk-ap-empty-title">No Apiary Yards Registered Yet</h3>
            <p className="bk-ap-empty-desc">
              Apiary yards represent the physical geographical locations where your hives and colonies reside. Register your first apiary site to start managing colonies with HoneyChain traceability.
            </p>
            <button
              type="button"
              className="btn btn-primary bk-ap-empty-btn"
              onClick={() => setIsAddApiaryOpen(true)}
            >
              <Plus size={16} />
              <span>Register First Apiary</span>
            </button>
          </div>
        ) : (
          <>
            <div className="bk-ap-list-controls">
              <span className="bk-ap-count-lbl">{apiaries.length} {apiaries.length === 1 ? 'Registered Apiary' : 'Registered Apiaries'}</span>
            </div>
          <div className="bk-ap-card-list">
            {apiaries.map(ap => (
              <div
                key={ap.id}
                className="bk-ap-card"
                onClick={() => setSelectedApiaryId(ap.apiaryCode)}
              >
                <div className="bk-ap-card-head">
                  <div className="bk-ap-code-pill">{ap.apiaryCode}</div>
                  <div className="bk-ap-card-title-wrap">
                    <strong className="bk-ap-card-name">{ap.name}</strong>
                    <span className="bk-ap-card-loc">
                      <MapPin size={12} />
                      <span>{ap.location}</span>
                    </span>
                  </div>
                  <ChevronRight size={18} color="#8C7E70" />
                </div>

                <div className="bk-ap-card-stats">
                  <div className="bk-ap-stat">
                    <span className="bk-ap-stat-k">Hive Boxes</span>
                    <strong className="bk-ap-stat-v">{ap.hiveBoxesCount || 0}</strong>
                  </div>
                  <div className="bk-ap-stat">
                    <span className="bk-ap-stat-k">Active Frames</span>
                    <strong className="bk-ap-stat-v">{ap.activeFramesCount || 0}</strong>
                  </div>
                  <div className="bk-ap-stat">
                    <span className="bk-ap-stat-k">Registered</span>
                    <strong className="bk-ap-stat-v">{ap.registrationDate || 'Recent'}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
        )}
      </div>

      {/* Add Apiary Modal */}
      {isAddApiaryOpen && (
        <div className="bk-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-apiary-title">
          <div className="bk-modal-backdrop" onClick={() => setIsAddApiaryOpen(false)} />
          <form
            className="bk-modal-card"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateApiary();
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="bk-modal-header">
              <div className="bk-modal-header-left">
                <div className="bk-modal-icon-wrap">
                  <Building2 size={20} color="#D97706" />
                </div>
                <div>
                  <h2 id="modal-apiary-title" className="bk-modal-title">Register New Apiary</h2>
                  <p className="bk-modal-sub">Root geographical unit for HoneyChain traceability</p>
                </div>
              </div>
              <button
                type="button"
                className="bk-close-btn"
                onClick={() => setIsAddApiaryOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bk-modal-body">
              <div className="bk-form-group">
                <label className="bk-form-label" htmlFor="apiary-name">
                  Apiary Name <span className="bk-req">*</span>
                </label>
                <input
                  id="apiary-name"
                  type="text"
                  className="bk-form-input"
                  placeholder="e.g. Sunny Brook Apiary"
                  value={newApiaryName}
                  onChange={e => setNewApiaryName(e.target.value)}
                  required
                />
              </div>

              <div className="bk-form-group">
                <label className="bk-form-label" htmlFor="apiary-code">
                  Unique Apiary Code (Traceability Prefix) <span className="bk-req">*</span>
                </label>
                <input
                  id="apiary-code"
                  type="text"
                  className="bk-form-input"
                  placeholder="e.g. AP1"
                  value={newApiaryCode}
                  onChange={e => setNewApiaryCode(e.target.value.toUpperCase())}
                  maxLength={5}
                  required
                />
                <span className="bk-input-hint">Format: AP&lt;number&gt; (e.g. AP1). Will prefix all hives and frames in this apiary.</span>
              </div>

              <div className="bk-form-group">
                <label className="bk-form-label" htmlFor="apiary-location">
                  Geographical Location
                </label>
                <input
                  id="apiary-location"
                  type="text"
                  className="bk-form-input"
                  placeholder="e.g. East Valley, Parcel 12"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                />
              </div>

              <div className="bk-form-group">
                <label className="bk-form-label" htmlFor="apiary-notes">
                  Notes & Organic Certifications (optional)
                </label>
                <textarea
                  id="apiary-notes"
                  rows={2}
                  className="bk-form-textarea"
                  placeholder="e.g. Wildflower and clover buffer zone. USDA Organic certified."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="bk-modal-footer">
              <button
                type="button"
                className="btn btn-secondary bk-btn-cancel"
                onClick={() => setIsAddApiaryOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary bk-btn-submit"
              >
                Register Apiary
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .bk-ap-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bk-ap-list-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .bk-ap-count-lbl {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-warm-gray);
        }
        .bk-ap-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
        }
        .bk-ap-card-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bk-ap-card {
          background: #FFFFFF;
          border: 1.5px solid var(--color-card-border);
          border-radius: 14px;
          padding: 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .bk-ap-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .bk-ap-card-head {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bk-ap-code-pill {
          background: #496B45;
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 800;
          padding: 6px 10px;
          border-radius: 8px;
        }
        .bk-ap-card-title-wrap {
          flex: 1;
        }
        .bk-ap-card-name {
          font-size: 16px;
          color: var(--color-deep-cocoa);
          display: block;
        }
        .bk-ap-card-loc {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--color-warm-gray);
          margin-top: 2px;
        }
        .bk-ap-card-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          border-top: 1px solid var(--color-divider);
          padding-top: 10px;
        }
        .bk-ap-stat {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .bk-ap-stat-k {
          font-size: 11px;
          color: var(--color-warm-gray);
        }
        .bk-ap-stat-v {
          font-size: 14px;
          color: var(--color-deep-cocoa);
          font-weight: 700;
        }

        /* Empty State */
        .bk-ap-empty-card {
          background: #FFFFFF;
          border: 1.5px dashed var(--color-card-border, #E2DAD0);
          border-radius: 16px;
          padding: 44px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 8px;
        }
        .bk-ap-empty-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .bk-ap-empty-title {
          font-size: 17px;
          font-weight: 800;
          color: var(--color-deep-cocoa, #2E2015);
          margin: 0;
        }
        .bk-ap-empty-desc {
          font-size: 13.5px;
          color: var(--color-warm-gray, #786D61);
          max-width: 400px;
          line-height: 1.5;
          margin: 0 0 8px;
        }
        .bk-ap-empty-btn {
          height: 42px;
          padding: 0 20px;
          font-size: 14px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        /* Modal Overlay & Dialog */
        .bk-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .bk-modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(36, 24, 16, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        .bk-modal-card {
          position: relative;
          width: 100%;
          max-width: 480px;
          background: #FFFFFF;
          border-radius: 18px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow: hidden;
          animation: apPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes apPopIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .bk-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px 14px;
          border-bottom: 1px solid var(--color-divider, #EAE4DA);
          background: #FAFAF8;
        }
        .bk-modal-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bk-modal-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(217, 154, 36, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bk-modal-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2E2015);
          margin: 0;
          line-height: 1.25;
        }
        .bk-modal-sub {
          font-size: 12px;
          color: var(--color-warm-gray, #786D61);
          margin: 2px 0 0;
        }
        .bk-close-btn {
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
        .bk-close-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        .bk-modal-body {
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow-y: auto;
        }
        .bk-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .bk-form-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2E2015);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .bk-req {
          color: #DC2626;
          font-weight: 700;
        }
        .bk-opt {
          font-weight: 400;
          color: var(--color-warm-gray, #786D61);
          font-size: 11.5px;
        }
        .bk-form-input, .bk-form-textarea {
          width: 100%;
          padding: 10px 14px;
          font-size: 14px;
          border: 1.5px solid var(--color-card-border, #E2DAD0);
          border-radius: 10px;
          background: #FFFFFF;
          color: var(--color-deep-cocoa, #2E2015);
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          font-family: inherit;
        }
        .bk-form-input:focus, .bk-form-textarea:focus {
          outline: none;
          border-color: #D97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
        }
        .bk-input-hint {
          font-size: 11.5px;
          color: var(--color-warm-gray, #786D61);
          margin-top: 2px;
          line-height: 1.35;
        }
        .bk-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid var(--color-divider, #EAE4DA);
          background: #FAFAF8;
        }
        .bk-btn-cancel {
          height: 42px;
          min-width: 90px;
        }
        .bk-btn-submit {
          height: 42px;
          min-width: 140px;
        }
      `}</style>
    </div>
  );
};
