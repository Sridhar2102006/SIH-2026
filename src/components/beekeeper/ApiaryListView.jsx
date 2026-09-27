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

export const ApiaryListView = ({ onSelectHive }) => {
  const {
    apiaries = [],
    hives = [],
    frames = [],
    addApiary,
    showToast
  } = useAppState();

  const [selectedApiaryId, setSelectedApiaryId] = useState(null);
  const [isAddApiaryOpen, setIsAddApiaryOpen] = useState(false);
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
      showToast('Please provide an Apiary name and unique code (e.g. AP3).');
      return;
    }
    const cleanCode = newApiaryCode.toUpperCase().trim();
    if (apiaries.some(a => a.apiaryCode === cleanCode)) {
      showToast(`Apiary code ${cleanCode} is already registered.`);
      return;
    }

    addApiary?.({
      name: newApiaryName,
      apiaryCode: cleanCode,
      location: newLocation || 'Regional Apiary Yard',
      notes: newNotes
    });

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
      <header className="bk-ap-header">
        <div className="bk-ap-head-title">
          <div className="bk-ap-icon-wrap">
            <Building2 size={22} color="#D99A24" />
          </div>
          <div>
            <h1 className="bk-ap-title">Registered Apiaries</h1>
            <p className="bk-ap-sub">Root geographical units for HoneyChain traceability</p>
          </div>
        </div>
      </header>

      <div className="bk-ap-body">
        <div className="bk-ap-list-controls">
          <span className="bk-ap-count-lbl">{apiaries.length} Active Apiaries</span>
          <button
            type="button"
            className="btn btn-primary btn-sm bk-ap-add-btn"
            onClick={() => setIsAddApiaryOpen(true)}
          >
            <Plus size={15} />
            <span>Add Apiary</span>
          </button>
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
                  <strong className="bk-ap-stat-v">{ap.hiveBoxesCount || 4}</strong>
                </div>
                <div className="bk-ap-stat">
                  <span className="bk-ap-stat-k">Active Frames</span>
                  <strong className="bk-ap-stat-v">{ap.activeFramesCount || 26}</strong>
                </div>
                <div className="bk-ap-stat">
                  <span className="bk-ap-stat-k">Registered</span>
                  <strong className="bk-ap-stat-v">{ap.registrationDate || '2024'}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Apiary Modal */}
      {isAddApiaryOpen && (
        <div className="bk-modal-overlay" onClick={() => setIsAddApiaryOpen(false)}>
          <div className="bk-modal-card" onClick={e => e.stopPropagation()}>
            <div className="bk-modal-header">
              <h2 className="bk-modal-title">Register New Apiary</h2>
              <button className="bk-close-btn" onClick={() => setIsAddApiaryOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="bk-sub-label">Apiary Name</label>
                <input
                  type="text"
                  className="bk-text-input"
                  placeholder="e.g. Sunny Brook Apiary"
                  value={newApiaryName}
                  onChange={e => setNewApiaryName(e.target.value)}
                />
              </div>
              <div>
                <label className="bk-sub-label">Unique Apiary Code (Traceability Prefix)</label>
                <input
                  type="text"
                  className="bk-text-input"
                  placeholder="e.g. AP3"
                  value={newApiaryCode}
                  onChange={e => setNewApiaryCode(e.target.value.toUpperCase())}
                  maxLength={5}
                />
                <span className="bk-input-hint">Will prefix all frames in this apiary (e.g. AP3H001F1).</span>
              </div>
              <div>
                <label className="bk-sub-label">Geographical Location</label>
                <input
                  type="text"
                  className="bk-text-input"
                  placeholder="e.g. East Valley, Parcel 12"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="bk-sub-label">Notes & Organic Certifications</label>
                <input
                  type="text"
                  className="bk-text-input"
                  placeholder="e.g. Wildflower and clover buffer zone."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                />
              </div>

              <div className="bk-modal-actions" style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary bk-back-btn"
                  onClick={() => setIsAddApiaryOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary bk-submit-btn"
                  onClick={handleCreateApiary}
                >
                  Register Apiary
                </button>
              </div>
            </div>
          </div>
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
        }
        .bk-ap-list-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bk-ap-count-lbl {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-warm-gray);
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
      `}</style>
    </div>
  );
};
