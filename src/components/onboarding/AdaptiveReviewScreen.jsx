import React, { useState, useMemo } from 'react';
import { CheckCircle2, Plus, X, Search, PlusCircle, ArrowRight } from 'lucide-react';
import { CAPABILITY_MAP } from '../../services/capabilityRegistry';

export const AdaptiveReviewScreen = ({
  accessibleCapabilities = [],
  selectedCapabilities = [],
  onRemoveCapability,
  onAddCapability,
  onContinue
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');

  const modalAvailableTasks = useMemo(() => {
    return accessibleCapabilities.filter(cap => {
      const alreadyHas = selectedCapabilities.includes(cap.id);
      const matchesSearch = !addSearchQuery.trim() ||
        cap.name.toLowerCase().includes(addSearchQuery.toLowerCase()) ||
        cap.description.toLowerCase().includes(addSearchQuery.toLowerCase());
      return !alreadyHas && matchesSearch;
    });
  }, [accessibleCapabilities, selectedCapabilities, addSearchQuery]);

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1 className="screen-title">Here is what we understood about your work.</h1>
        <p className="screen-subtitle">
          You can review, remove items, or add additional responsibilities.
        </p>
      </div>

      <div className="capabilities-review-card">
        <div className="review-card-header">
          <span className="review-card-title">Confirmed Capabilities ({selectedCapabilities.length})</span>
          <button
            type="button"
            className="add-cap-btn"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={14} />
            <span>Add responsibility</span>
          </button>
        </div>

        <div className="review-caps-list">
          {selectedCapabilities.map(capId => {
            const cap = CAPABILITY_MAP.get(capId);
            if (!cap) return null;
            return (
              <div key={capId} className="review-cap-item">
                <div className="cap-item-left">
                  <CheckCircle2 size={16} color="var(--color-healthy, #10B981)" />
                  <div className="cap-item-names">
                    <span className="cap-item-title">{cap.name}</span>
                    <span className="cap-item-reason">
                      {cap.domain} · {cap.description}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="remove-cap-btn"
                  onClick={() => onRemoveCapability(capId)}
                  title="Remove responsibility"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="screen-bottom-dock">
        <button
          type="button"
          className="btn-primary-action"
          onClick={onContinue}
        >
          <span>View Matching Work Identities</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {showAddModal && (
        <div className="add-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="add-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="add-modal-header">
              <h3 className="add-modal-title">Add a responsibility</h3>
              <button type="button" className="close-sheet-icon-btn" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="add-search-wrap">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search all HoneyChain capabilities..."
                value={addSearchQuery}
                onChange={(e) => setAddSearchQuery(e.target.value)}
              />
            </div>
            <div className="add-modal-list">
              {modalAvailableTasks.map(cap => (
                <div
                  key={cap.id}
                  className="add-modal-item"
                  onClick={() => {
                    onAddCapability(cap.id);
                    setShowAddModal(false);
                    setAddSearchQuery('');
                  }}
                >
                  <div className="add-item-details">
                    <span className="add-item-name">{cap.name}</span>
                    <span className="add-item-desc">{cap.domain} · {cap.description}</span>
                  </div>
                  <PlusCircle size={18} color="var(--color-primary-honey, #D97706)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
