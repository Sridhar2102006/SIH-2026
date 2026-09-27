import React, { useState, useMemo } from 'react';
import { Search, X, Check, ArrowRight, Sparkles } from 'lucide-react';
import { CAPABILITY_MAP } from '../../services/capabilityRegistry';

const WORK_AREA_DISPLAY_NAMES = {
  HIVE_OPERATIONS: 'Hives & Colonies',
  HONEY_OPERATIONS: 'Honey & Processing',
  QUALITY_OPERATIONS: 'Quality & Lab',
  LOGISTICS_OPERATIONS: 'Products & Delivery'
};

const SUGGESTED_ROUTINE_MODULES = {
  HIVE_OPERATIONS: [
    'HIVE_MANAGEMENT',
    'BEE_HEALTH_SCAN',
    'HIVE_INSPECTION',
    'CONNECTED_HIVE_MONITORING'
  ],
  HONEY_OPERATIONS: [
    'PROCESSING_MANAGEMENT',
    'BATCH_INTAKE',
    'PROCESSING_STEP_RECORD',
    'BATCH_TRACEABILITY'
  ],
  QUALITY_OPERATIONS: [
    'SAMPLE_INTAKE',
    'LAB_WORKSPACE',
    'TEST_EXECUTION',
    'RESULT_REVIEW'
  ],
  LOGISTICS_OPERATIONS: [
    'INVENTORY_MANAGEMENT',
    'PACKAGE_ALLOCATION',
    'SHIPMENT_CREATE',
    'PACKAGE_QR_VALIDATE'
  ]
};

// Maps work-area IDs → designationFamily strings used in CAPABILITY_CATALOG
const WORK_AREA_TO_DESIGNATION_FAMILIES = {
  HIVE_OPERATIONS: ['BEEKEEPER'],
  HONEY_OPERATIONS: ['PROCESSOR'],
  QUALITY_OPERATIONS: ['LAB', 'QUALITY'],
  LOGISTICS_OPERATIONS: ['DISTRIBUTOR', 'LOGISTICS']
};

// Keep alias for backward compat with category-pill filter
const WORK_AREA_TO_CATALOG_DOMAINS = WORK_AREA_TO_DESIGNATION_FAMILIES;

const BEEKEEPER_EXCLUSIVE_TASKS = [
  'HIVE_MANAGEMENT',
  'BEE_HEALTH_SCAN',
  'HIVE_INSPECTION',
  'CONNECTED_HIVE_MONITORING'
];

export const AdaptiveTasksScreen = ({
  accessibleCapabilities = [],
  selectedDomains = [],
  selectedCapabilities = [],
  onToggleCapability,
  onBatchSelectCapabilities,
  onClearCapabilities,
  onContinue
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  const chosenAreaNames = useMemo(() => {
    if (!selectedDomains || selectedDomains.length === 0) return '';
    return selectedDomains.map(d => WORK_AREA_DISPLAY_NAMES[d] || d).join(', ');
  }, [selectedDomains]);

  const allowedCatalogDomains = useMemo(() => {
    if (!selectedDomains || selectedDomains.length === 0) return null;
    const set = new Set();
    selectedDomains.forEach(areaId => {
      const families = WORK_AREA_TO_DESIGNATION_FAMILIES[areaId] || [];
      families.forEach(f => set.add(f));
    });
    return set;
  }, [selectedDomains]);

  const suggestedCapIds = useMemo(() => {
    const ids = new Set();
    if (selectedDomains && selectedDomains.length > 0) {
      selectedDomains.forEach(dom => {
        const caps = SUGGESTED_ROUTINE_MODULES[dom] || [];
        caps.forEach(c => ids.add(c));
      });
    } else {
      // If no domain explicitly chosen, suggest all CORE capabilities
      accessibleCapabilities.forEach(c => {
        if (c.capabilityClass === 'CORE') ids.add(c.id);
      });
    }
    return ids;
  }, [selectedDomains, accessibleCapabilities]);

  const filteredTasks = useMemo(() => {
    let list;
    const isBeekeeperOnly = selectedDomains.length === 1 && selectedDomains[0] === 'HIVE_OPERATIONS';
    
    if (isBeekeeperOnly) {
      const map = new Map(accessibleCapabilities.map(c => [c.id, c]));
      list = BEEKEEPER_EXCLUSIVE_TASKS.map(id => map.get(id) || CAPABILITY_MAP.get(id)).filter(Boolean);
    } else {
      list = accessibleCapabilities.filter(cap => {
        let matchesCat = true;
        if (activeCategory !== 'ALL') {
          // Filter by designationFamily for the selected work-area category
          const families = WORK_AREA_TO_DESIGNATION_FAMILIES[activeCategory] || [activeCategory];
          matchesCat = families.includes(cap.domain) || families.includes(cap.designationFamily);
        }

        const inSelectedDomains = !allowedCatalogDomains ||
          allowedCatalogDomains.has(cap.domain) ||
          allowedCatalogDomains.has(cap.designationFamily);
        return activeCategory !== 'ALL' ? matchesCat : inSelectedDomains;
      });
    }

    if (!searchQuery.trim()) return list;

    return list.filter(cap => {
      return cap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cap.description && cap.description.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [accessibleCapabilities, searchQuery, activeCategory, allowedCatalogDomains, selectedDomains]);

  const suggestedTasks = useMemo(() => {
    return filteredTasks.filter(t => suggestedCapIds.has(t.id));
  }, [filteredTasks, suggestedCapIds]);

  const additionalTasks = useMemo(() => {
    return filteredTasks.filter(t => !suggestedCapIds.has(t.id));
  }, [filteredTasks, suggestedCapIds]);

  const suggestedSelectedCount = suggestedTasks.filter(t => selectedCapabilities.includes(t.id)).length;
  const allSuggestedSelected = suggestedTasks.length > 0 && suggestedSelectedCount === suggestedTasks.length;

  const renderCapCard = (cap, isSuggested = false) => {
    const isSelected = selectedCapabilities.includes(cap.id);
    return (
      <div
        key={cap.id}
        className={"cap-card " + (isSuggested ? "suggested " : "") + (isSelected ? "selected" : "")}
        onClick={() => onToggleCapability && onToggleCapability(cap.id)}
        role="button"
        tabIndex={0}
      >
        <div className={"cap-checkbox " + (isSelected ? "checked" : "")}>
          {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
        </div>
        <div className="cap-content">
          <div className="cap-header-row">
            <span className="cap-name">{cap.name}</span>
            <div className="cap-badges-row">
              {isSuggested && <span className="suggested-badge">✨ Suggested</span>}
              {cap.verificationRequired && (
                <span className="verification-badge" title="Verification required for privileged execution">
                  Verification Required
                </span>
              )}
            </div>
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
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1 className="screen-title">
          {chosenAreaNames ? "Suggested routine modules for your work" : "What do you actually do?"}
        </h1>
        <p className="screen-subtitle">
          {chosenAreaNames
            ? `Based on your focus on ${chosenAreaNames}, HoneyChain suggested the routine work modules below. Tap each module you perform routine actions for.`
            : "Select your routine activities. HoneyChain derives your workspace modules and permissions directly from these."}
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
        {selectedDomains.length > 1 && (
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
                {WORK_AREA_DISPLAY_NAMES[d] || d}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-tasks-notice" style={{ padding: '32px 16px', textAlign: 'center', color: '#6C5D4B' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>No routine tasks found matching your search.</p>
          <p style={{ margin: '6px 0 16px 0', fontSize: '13px' }}>Try clearing your search query.</p>
          <button
            type="button"
            className="cat-pill active"
            onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); }}
          >
            Show all routine tasks
          </button>
        </div>
      ) : (
        <div className="capabilities-sections-wrapper">
          {/* Suggested Routine Modules Section */}
          {suggestedTasks.length > 0 && (
            <div className="suggested-section-block">
              <div className="suggested-toolbar">
                <div className="suggested-toolbar-left">
                  <Sparkles size={14} color="#D97706" />
                  <span className="suggested-toolbar-title">
                    Suggested Routine Modules ({suggestedSelectedCount}/{suggestedTasks.length} selected)
                  </span>
                </div>
                <div className="suggested-toolbar-actions">
                  {allSuggestedSelected ? (
                    <button
                      type="button"
                      className="btn-text-action"
                      onClick={() => onClearCapabilities && onClearCapabilities(suggestedTasks.map(t => t.id))}
                    >
                      Deselect all
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-suggest-all"
                      onClick={() => onBatchSelectCapabilities && onBatchSelectCapabilities(suggestedTasks.map(t => t.id))}
                    >
                      <Check size={13} strokeWidth={3} />
                      <span>Select all suggested</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="capabilities-cards-stack">
                {suggestedTasks.map(cap => renderCapCard(cap, true))}
              </div>
            </div>
          )}

          {/* Additional Capabilities Section */}
          {additionalTasks.length > 0 && (
            <div className="additional-section-block">
              <div className="section-divider-row">
                <span className="section-divider-title">Additional Capabilities ({additionalTasks.length})</span>
                <span className="section-divider-desc">Optional specialized tools & advanced tracking</span>
              </div>
              <div className="capabilities-cards-stack">
                {additionalTasks.map(cap => renderCapCard(cap, false))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="screen-bottom-dock">
        <button
          type="button"
          className="btn-primary-action"
          disabled={selectedCapabilities.length === 0}
          style={{
            opacity: selectedCapabilities.length === 0 ? 0.55 : 1,
            cursor: selectedCapabilities.length === 0 ? 'not-allowed' : 'pointer'
          }}
          onClick={() => {
            if (selectedCapabilities.length > 0) {
              onContinue();
            }
          }}
        >
          <span>
            {selectedCapabilities.length === 0
              ? 'Select your routine tasks to continue'
              : `Continue to Workplace (${selectedCapabilities.length} selected)`}
          </span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
