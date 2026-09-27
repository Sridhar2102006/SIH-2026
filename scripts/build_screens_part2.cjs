const fs = require('fs');

// 3. AdaptiveWelcomeScreen.jsx
const welcomeCode = `import React from 'react';
import { Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

export const AdaptiveWelcomeScreen = ({
  naturalText = '',
  onChangeNaturalText,
  onSubmitNatural,
  onStartGuided
}) => {
  return (
    <div className="screen-container welcome-screen">
      <div className="welcome-hero-art">
        <div className="hero-icon-bubble">
          <Sparkles size={36} color="var(--color-primary-honey, #D97706)" />
        </div>
      </div>

      <div className="screen-header text-center">
        <span className="micro-badge-step">HoneyChain Intelligence</span>
        <h1 className="screen-title">HoneyChain that fits what you actually do.</h1>
        <p className="screen-subtitle">
          No generic roles or rigid permissions. Tell us about your work, and HoneyChain will compose the right tools, modules, and work identities for you.
        </p>
      </div>

      <div className="natural-input-card">
        <div className="natural-input-header">
          <MessageSquare size={16} color="var(--color-primary-honey, #D97706)" />
          <span className="natural-input-title">Describe your work in your own words</span>
        </div>
        <textarea
          className="natural-textarea"
          rows={3}
          placeholder="e.g. I manage around 30 hives, inspect them weekly and collect honey during harvest..."
          value={naturalText}
          onChange={(e) => onChangeNaturalText(e.target.value)}
        />
        <div className="natural-chips-prompt">
          <span className="prompt-label">Try an example:</span>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => onSubmitNatural("I manage hives, inspect colonies, record observations and collect honey.")}
          >
            Beekeeper field work
          </button>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => onSubmitNatural("I receive harvested material, record processing steps, capture evidence and complete batches.")}
          >
            Facility processing
          </button>
          <button
            type="button"
            className="prompt-chip"
            onClick={() => onSubmitNatural("I receive samples, run tests, record results and review them.")}
          >
            Lab quality analysis
          </button>
        </div>
      </div>

      <div className="screen-bottom-dock">
        <button
          type="button"
          className="btn-primary-action"
          onClick={() => onSubmitNatural()}
        >
          <span>{naturalText.trim() ? "Understand My Work" : "Guide Me Step-by-Step"}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
`;
fs.writeFileSync('D:/SIH-2026/src/components/onboarding/AdaptiveWelcomeScreen.jsx', welcomeCode, 'utf8');
console.log('Wrote AdaptiveWelcomeScreen.jsx');

// 4. AdaptiveTasksScreen.jsx
const tasksCode = `import React, { useState, useMemo } from 'react';
import { Search, X, Check, ArrowRight } from 'lucide-react';
import { CAPABILITY_MAP } from '../../services/capabilityRegistry';

export const AdaptiveTasksScreen = ({
  accessibleCapabilities = [],
  selectedDomains = [],
  selectedCapabilities = [],
  onToggleCapability,
  onContinue
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  const filteredTasks = useMemo(() => {
    return accessibleCapabilities.filter(cap => {
      const matchesSearch = !searchQuery.trim() ||
        cap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cap.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCat = activeCategory === 'ALL' || cap.domain === activeCategory;
      const inSelectedDomains = selectedDomains.length === 0 || selectedDomains.includes(cap.domain);

      return matchesSearch && (activeCategory !== 'ALL' ? matchesCat : inSelectedDomains);
    });
  }, [accessibleCapabilities, searchQuery, activeCategory, selectedDomains]);

  return (
    <div className="screen-container">
      <div className="screen-header">
        <span className="micro-badge-step">03 • Daily Actions</span>
        <h1 className="screen-title">What do you actually do?</h1>
        <p className="screen-subtitle">
          Select your routine activities. HoneyChain derives your workspace modules and permissions directly from these.
        </p>
      </div>

      <div className="tasks-filter-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks, e.g. inspection, batch, refractometry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="category-pills-row">
          <button
            type="button"
            className={"cat-pill " + (activeCategory === 'ALL' ? 'active' : '')}
            onClick={() => setActiveCategory('ALL')}
          >
            All Focused Tasks
          </button>
          {selectedDomains.map(d => (
            <button
              key={d}
              type="button"
              className={"cat-pill " + (activeCategory === d ? 'active' : '')}
              onClick={() => setActiveCategory(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="capabilities-cards-stack">
        {filteredTasks.map(cap => {
          const isSelected = selectedCapabilities.includes(cap.id);
          return (
            <div
              key={cap.id}
              className={"cap-card " + (isSelected ? 'selected' : '')}
              onClick={() => onToggleCapability(cap.id)}
              role="button"
              tabIndex={0}
            >
              <div className={"cap-checkbox " + (isSelected ? 'checked' : '')}>
                {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
              </div>
              <div className="cap-content">
                <div className="cap-header-row">
                  <span className="cap-name">{cap.name}</span>
                  {cap.verificationRequired && (
                    <span className="verification-badge" title="Verification required for privileged execution">
                      Verification Required
                    </span>
                  )}
                </div>
                <p className="cap-desc">{cap.description}</p>
                {cap.prerequisites && cap.prerequisites.length > 0 && (
                  <span className="prereq-note">
                    Requires: {cap.prerequisites.map(p => CAPABILITY_MAP.get(p)?.name || p).join(', ')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="screen-bottom-dock">
        <button
          type="button"
          className="btn-primary-action"
          onClick={onContinue}
        >
          <span>Continue to Workplace</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
`;
fs.writeFileSync('D:/SIH-2026/src/components/onboarding/AdaptiveTasksScreen.jsx', tasksCode, 'utf8');
console.log('Wrote AdaptiveTasksScreen.jsx');

// 5. AdaptiveReviewScreen.jsx
const reviewCode = `import React, { useState, useMemo } from 'react';
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
        <span className="micro-badge-step">05 • HoneyChain Understands</span>
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
                      {cap.domain} • {cap.description}
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
                    <span className="add-item-desc">{cap.domain} • {cap.description}</span>
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
`;
fs.writeFileSync('D:/SIH-2026/src/components/onboarding/AdaptiveReviewScreen.jsx', reviewCode, 'utf8');
console.log('Wrote AdaptiveReviewScreen.jsx');
