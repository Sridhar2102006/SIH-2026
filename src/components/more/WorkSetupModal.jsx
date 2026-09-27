import React, { useState, useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  CAPABILITY_CATALOG,
  CapabilityRegistry
} from '../../services/capabilityRegistry';
import {
  CANONICAL_DESIGNATION_POLICY,
  evaluateCanonicalDesignationEligibility
} from '../../services/designationEngine';
import {
  WORKSPACE_MODULE_REGISTRY,
  resolveAccessProfile,
  ACCESS_POLICY_VERSION
} from '../../services/capabilityEngine';
import {
  X,
  Check,
  Compass,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Plus,
  Minus,
  Activity,
  Search,
  Camera,
  Cpu,
  Layers,
  PlusCircle,
  Filter,
  CheckCircle2,
  FlaskConical,
  Package,
  Box,
  Truck,
  Users,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Icon mapper
const renderCapabilityIcon = (iconName, size = 16) => {
  switch (iconName) {
    case 'Activity': return <Activity size={size} />;
    case 'Search': return <Search size={size} />;
    case 'Camera': return <Camera size={size} />;
    case 'Cpu': return <Cpu size={size} />;
    case 'Layers': return <Layers size={size} />;
    case 'PlusCircle': return <PlusCircle size={size} />;
    case 'Filter': return <Filter size={size} />;
    case 'CheckCircle2': return <CheckCircle2 size={size} />;
    case 'FlaskConical': return <FlaskConical size={size} />;
    case 'ShieldCheck': return <ShieldCheck size={size} />;
    case 'Package': return <Package size={size} />;
    case 'Box': return <Box size={size} />;
    case 'Truck': return <Truck size={size} />;
    case 'Users': return <Users size={size} />;
    case 'FileText': return <FileText size={size} />;
    default: return <CheckCircle2 size={size} />;
  }
};

export const WorkSetupModal = ({ isOpen, onClose }) => {
  const {
    userCapabilities,
    userDesignations,
    userWorkContexts,
    updateWorkSetup,
    resetOnboardingForTesting
  } = useAppState();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedCaps, setSelectedCaps] = useState(userCapabilities || []);
  const [confirmedDesigs, setConfirmedDesigs] = useState(userDesignations || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showRemovalConfirm, setShowRemovalConfirm] = useState(false);
  const [showPermissionsList, setShowPermissionsList] = useState(false);

  // Sync when modal opens or closes & handle Escape key
  React.useEffect(() => {
    if (isOpen) {
      setSelectedCaps(userCapabilities || []);
      setConfirmedDesigs(userDesignations || []);
      setIsEditing(false);
      setShowRemovalConfirm(false);
      setSearchTerm('');
      setActiveCategory('ALL');

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, userCapabilities, userDesignations]);

  // Dynamic evaluation based on currently selected capabilities in edit mode
  const evaluation = useMemo(() => {
    const res = evaluateCanonicalDesignationEligibility(selectedCaps);
    return {
      contextMessage: res.suggestions.length > 0 ? "Matches " + res.suggestions.map(s => s.name).join(' + ') : 'Select tasks to establish your workspace profile',
      suggestedDesignations: res.suggestions,
      suggestedDesignationIds: res.suggestions.map(s => s.designationId),
      evaluations: res.evaluations
    };
  }, [selectedCaps]);

  // Compute pending access profile
  const pendingProfile = useMemo(() => {
    return resolveAccessProfile({
      capabilities: selectedCaps,
      designations: confirmedDesigs,
      workContexts: userWorkContexts
    });
  }, [selectedCaps, confirmedDesigs, userWorkContexts]);

  // Current access profile for comparison
  const currentProfile = useMemo(() => {
    return resolveAccessProfile({
      capabilities: userCapabilities,
      designations: userDesignations,
      workContexts: userWorkContexts
    });
  }, [userCapabilities, userDesignations, userWorkContexts]);

  // Access Diff calculation (modules added or removed)
  const currentModuleSet = new Set(currentProfile.moduleIds);
  const pendingModuleSet = new Set(pendingProfile.moduleIds);

  const addedModules = pendingProfile.moduleIds
    .filter(id => !currentModuleSet.has(id))
    .map(id => WORKSPACE_MODULE_REGISTRY.find(m => m.id === id))
    .filter(Boolean);

  const removedModules = currentProfile.moduleIds
    .filter(id => !pendingModuleSet.has(id))
    .map(id => WORKSPACE_MODULE_REGISTRY.find(m => m.id === id))
    .filter(Boolean);

  // Filtered capabilities list
  const accessibleCapabilities = useMemo(() => CAPABILITY_CATALOG.filter(c => !["SYSTEM_ONLY", "PRIVILEGED"].includes(c.capabilityClass)), []);
  const filteredCapabilities = useMemo(() => {
    return accessibleCapabilities.filter(cap => {
      const matchesSearch =
        searchTerm.trim() === '' ||
        cap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cap.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cap.aliases && cap.aliases.some(a => a.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesCat = activeCategory === 'ALL' || cap.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchTerm, activeCategory, accessibleCapabilities]);

  const toggleCap = (id) => {
    setSelectedCaps(prev => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.length > 1 ? prev.filter(c => c !== id) : prev;
      } else {
        const depResult = CapabilityRegistry.resolveCapabilityDependencies([id]);
        updated = Array.from(new Set([...prev, id, ...depResult.dependencies]));
      }
      const evalRes = evaluateCanonicalDesignationEligibility(updated);
      if (evalRes.suggestions && evalRes.suggestions.length > 0) {
        setConfirmedDesigs(evalRes.suggestions.map(s => s.designationId));
      }
      return updated;
    });
  };

  const toggleDesig = (id) => {
    setConfirmedDesigs(prev =>
      prev.includes(id)
        ? (prev.length > 1 ? prev.filter(d => d !== id) : prev)
        : [...prev, id]
    );
  };

  const handleInitiateSave = () => {
    // Check if any modules are being removed (No silent access removal)
    if (removedModules.length > 0) {
      setShowRemovalConfirm(true);
    } else {
      finalizeSave();
    }
  };

  const finalizeSave = () => {
    updateWorkSetup({
      capabilities: selectedCaps,
      designations: confirmedDesigs,
      workContexts: userWorkContexts
    });
    setShowRemovalConfirm(false);
    setIsEditing(false);
    onClose();
  };

  const handleReset = () => {
    onClose();
    resetOnboardingForTesting();
  };

  if (!isOpen) return null;

  return (
    <div className="sheet-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="sheet-container work-setup-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="micro-text" style={{ color: 'var(--color-primary-honey)' }}>
                Capability Profile
              </span>
              <span className="policy-badge">
                Policy v{ACCESS_POLICY_VERSION}
              </span>
            </div>
            <h2 className="heading-card" style={{ fontSize: '18px', marginTop: '2px' }}>
              Work Setup & Workspace Access
            </h2>
          </div>
          <button
            type="button"
            className="close-sheet-btn"
            onClick={onClose}
            aria-label="Close work setup modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sheet-body work-setup-body">
          {/* Active Designations Display */}
          <div className="setup-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="section-label">Active Designations</span>
              {!isEditing && (
                <button
                  type="button"
                  className="btn-edit-trigger"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Capabilities
                </button>
              )}
            </div>

            <div className="desig-pill-tags-row">
              {(isEditing ? confirmedDesigs : userDesignations).map(desigId => {
                const d = CANONICAL_DESIGNATION_POLICY.find(item => item.id === desigId);
                if (!d) return null;
                return (
                  <div key={d.id} className="active-desig-chip">
                    <span>{d.icon}</span>
                    <strong>{d.name}</strong>
                    <span className="desig-chip-badge">{d.badge}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edit Mode Content */}
          {isEditing ? (
            <div className="edit-capabilities-flow">
              {/* Context Feedback phrase */}
              <div className="smart-feedback-pill">
                <Compass size={15} color="var(--color-deep-honey)" />
                <span>"{evaluation.contextMessage}"</span>
              </div>

              {/* Designations Picker with Explainable Status */}
              <div className="setup-section" style={{ marginTop: '12px' }}>
                <span className="section-label">Designation Eligibility Reasoning</span>
                <p className="supporting-text" style={{ fontSize: '11.5px', marginBottom: '8px' }}>
                  Designations are derived from your required and core capabilities. Multiple can be active.
                </p>
                <div className="desig-edit-grid">
                  {CANONICAL_DESIGNATION_POLICY.map(d => {
                    const isSelected = confirmedDesigs.includes(d.id);
                    const evalObj = evaluation.evaluations ? evaluation.evaluations[d.id] : null;
                    const isEligible = evalObj ? evalObj.eligible : false;
                    const matchState = evalObj ? evalObj.state : 'NOT_ELIGIBLE';

                    return (
                      <div
                        key={d.id}
                        className={`desig-eval-card ${isSelected ? 'selected' : ''} ${!isEligible ? 'ineligible' : ''}`}
                        onClick={() => {
                          if (isEligible) toggleDesig(d.id);
                        }}
                        style={{ cursor: isEligible ? 'pointer' : 'not-allowed' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>{d.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <strong style={{ fontSize: '13px' }}>{d.name}</strong>
                              <span className={`eval-state-tag ${matchState.toLowerCase()}`}>
                                {matchState === 'STRONG_MATCH' && 'Strong Match'}
                                {matchState === 'POSSIBLE_MATCH' && 'Candidate'}
                                {matchState === 'REQUIRES_VERIFICATION' && 'Needs Verification'}
                                {matchState === 'NOT_ELIGIBLE' && 'Missing Requirements'}
                              </span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-warm-gray)', display: 'block', marginTop: '2px' }}>
                              {d.tagline}
                            </span>

                            {/* Explainability Breakdown */}
                            {evalObj && evalObj.explanation && (
                              <p className="eval-explanation-text">
                                {evalObj.explanation}
                              </p>
                            )}
                          </div>

                          <div className={`checkbox-circle ${isSelected ? 'checked' : ''} ${!isEligible ? 'disabled' : ''}`}>
                            <Check size={12} strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Capability Filter & Toggles */}
              <div className="setup-section" style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="section-label">Select Capabilities ({selectedCaps.length} active)</span>
                </div>

                {/* Search Bar */}
                <div className="search-bar-wrap" style={{ marginBottom: '8px' }}>
                  <Search size={14} color="var(--color-warm-gray)" />
                  <input
                    type="text"
                    placeholder="Search capabilities or synonyms (e.g. check hives)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="modal-search-input"
                  />
                  {searchTerm && (
                    <button type="button" onClick={() => setSearchTerm('')} className="clear-search-btn">
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="caps-list-edit">
                  {filteredCapabilities.map(cap => {
                    const isSelected = selectedCaps.includes(cap.id);
                    return (
                      <button
                        key={cap.id}
                        type="button"
                        className={`cap-row-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleCap(cap.id)}
                      >
                        <div className="cap-icon-mini">
                          {renderCapabilityIcon(cap.icon, 15)}
                        </div>
                        <div className="cap-text-mini">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ fontSize: '13px' }}>{cap.name}</strong>
                            {cap.verificationRequired && (
                              <span className="micro-badge-risk">Verified</span>
                            )}
                          </div>
                          <span style={{ fontSize: '11.5px', color: 'var(--color-warm-gray)' }}>
                            {cap.description}
                          </span>
                        </div>
                        <div className={`cap-check-mini ${isSelected ? 'checked' : ''}`}>
                          <Check size={12} strokeWidth={2.5} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Access Diff Communication: Warns before applying changes */}
              {(addedModules.length > 0 || removedModules.length > 0) && (
                <div className="card access-diff-card" style={{ marginTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <AlertTriangle size={15} color={removedModules.length > 0 ? 'var(--color-attention)' : 'var(--color-healthy)'} />
                    <span className="micro-text" style={{ color: 'var(--color-deep-cocoa)', fontWeight: 700 }}>
                      Workspace Preview
                    </span>
                  </div>

                  {addedModules.length > 0 && (
                    <div className="diff-group">
                      <span className="diff-header add">
                        <Plus size={12} /> Tools You Will Gain ({addedModules.length})
                      </span>
                      <div className="diff-tags-row">
                        {addedModules.map(m => (
                          <span key={m.id} className="diff-tag add">
                            +{m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {removedModules.length > 0 && (
                    <div className="diff-group" style={{ marginTop: '8px' }}>
                      <span className="diff-header remove">
                        <Minus size={12} /> Tools You Will Lose ({removedModules.length})
                      </span>
                      <div className="diff-tags-row">
                        {removedModules.map(m => (
                          <span key={m.id} className="diff-tag remove">
                            -{m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Save / Cancel Actions */}
              <div className="edit-modal-actions" style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedCaps(userCapabilities || []);
                    setConfirmedDesigs(userDesignations || []);
                    setIsEditing(false);
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleInitiateSave}
                  style={{ flex: 1.5 }}
                >
                  Save Access Setup
                </button>
              </div>
            </div>
          ) : (
            /* View Mode: Shows confirmed modules & action permissions */
            <div className="view-mode-stack">
              <div className="setup-section" style={{ marginTop: '8px' }}>
                <span className="section-label">Your Workspace Tools ({currentProfile.resolvedModules.length} Modules)</span>
                <div className="modules-compact-grid">
                  {Object.entries(currentProfile.groupedModules).map(([category, mods]) => (
                    <div key={category} className="card compact-cat-card">
                      <span className="micro-text" style={{ color: 'var(--color-deep-cocoa)', marginBottom: '6px', display: 'block', fontWeight: 700 }}>
                        {category}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {mods.map(m => {
                          const justification = currentProfile.moduleJustifications ? currentProfile.moduleJustifications[m.id] : null;
                          return (
                            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}>
                                <Check size={13} color="var(--color-healthy)" strokeWidth={2.4} />
                                <strong>{m.name}</strong>
                              </div>
                              {justification && (
                                <span style={{ fontSize: '11px', color: 'var(--color-warm-gray)', paddingLeft: '19px' }}>
                                  {justification}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Granular Action Permissions Accordion */}
              <div className="setup-section" style={{ marginTop: '14px' }}>
                <button
                  type="button"
                  className="accordion-trigger-btn"
                  onClick={() => setShowPermissionsList(!showPermissionsList)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="var(--color-primary-honey)" />
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>Authorized Operational Actions ({currentProfile.permissionIds.length})</span>
                  </div>
                  {showPermissionsList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showPermissionsList && (
                  <div className="permissions-preview-box">
                    <div className="perms-grid">
                      {currentProfile.permissionIds.map(permId => (
                        <div key={permId} className="perm-item-chip">
                          <Check size={10} color="var(--color-healthy)" />
                          <span>{permId.toLowerCase().replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reset / Re-run Onboarding Test Action */}
              <div className="setup-section" style={{ marginTop: '18px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={handleReset}
                  style={{ justifyContent: 'center', gap: '8px', color: 'var(--color-deep-cocoa)' }}
                >
                  <RotateCcw size={15} />
                  <span>Restart Capability Onboarding</span>
                </button>
                <p className="supporting-text" style={{ fontSize: '11.5px', textAlign: 'center', marginTop: '6px' }}>
                  Resets capability evaluation and re-runs the conversational onboarding setup.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* No Silent Access Removal Confirmation Dialog */}
        {showRemovalConfirm && (
          <div className="confirm-removal-overlay">
            <div className="confirm-removal-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-attention)', marginBottom: '8px' }}>
                <AlertTriangle size={20} />
                <h3 style={{ fontSize: '15px', margin: 0, fontWeight: 700 }}>
                  Confirm Tool Removal
                </h3>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--color-deep-cocoa)', lineHeight: '1.4', marginBottom: '10px' }}>
                Modifying your capabilities will remove access to the following <strong>{removedModules.length}</strong> workspace tools:
              </p>

              <div className="removal-list">
                {removedModules.map(m => (
                  <div key={m.id} className="removal-item">
                    <Minus size={12} color="var(--color-attention)" />
                    <div>
                      <strong style={{ fontSize: '12px' }}>{m.name}</strong>
                      <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--color-warm-gray)' }}>
                        {m.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '11.5px', color: 'var(--color-warm-gray)', marginTop: '8px' }}>
                Are you sure you want to proceed with updating your workspace tools?
              </p>

              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRemovalConfirm(false)}
                  style={{ flex: 1, fontSize: '12.5px' }}
                >
                  Keep Current Tools
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={finalizeSave}
                  style={{ flex: 1, fontSize: '12.5px', backgroundColor: 'var(--color-attention)', borderColor: 'var(--color-attention)' }}
                >
                  Confirm & Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .work-setup-sheet {
          max-height: 90%;
          position: relative;
        }

        .policy-badge {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-warm-gray);
          background-color: #F0E6D2;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .close-sheet-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #FAF4E9;
          border: 1px solid var(--color-divider);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-warm-gray);
          cursor: pointer;
        }

        .work-setup-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .btn-edit-trigger {
          background: none;
          border: none;
          font-family: var(--font-family);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-primary-honey);
          cursor: pointer;
          text-decoration: underline;
        }

        .desig-pill-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .active-desig-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background-color: #FAF2E4;
          border: 1px solid var(--color-primary-honey);
          border-radius: var(--radius-button);
          font-size: 13px;
        }

        .desig-chip-badge {
          font-size: 10.5px;
          color: var(--color-warm-gray);
          background-color: #FFFDF8;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .smart-feedback-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: #FAF2E2;
          border: 1px solid #E8D7B8;
          border-radius: var(--radius-button);
          font-size: 12.5px;
          color: var(--color-deep-cocoa);
          font-weight: 500;
        }

        .desig-edit-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 6px;
        }

        .desig-eval-card {
          padding: 10px 12px;
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-card-border);
          border-radius: var(--radius-button);
          transition: all 0.15s ease;
        }

        .desig-eval-card.selected {
          border-color: var(--color-primary-honey);
          background-color: #FAF4E9;
        }

        .desig-eval-card.ineligible {
          opacity: 0.65;
          background-color: #F8F5EE;
        }

        .eval-state-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .eval-state-tag.strong_match {
          background-color: var(--color-healthy-tint);
          color: var(--color-healthy);
        }

        .eval-state-tag.possible_match {
          background-color: #FFF6DD;
          color: #B57F1B;
        }

        .eval-state-tag.requires_verification {
          background-color: var(--color-attention-tint);
          color: var(--color-attention);
        }

        .eval-state-tag.not_eligible {
          background-color: #EEE9DE;
          color: var(--color-warm-gray);
        }

        .eval-explanation-text {
          font-size: 11px;
          color: var(--color-deep-cocoa);
          margin-top: 4px;
          line-height: 1.35;
        }

        .checkbox-circle {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 1.5px solid #D6C7B4;
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
        }

        .checkbox-circle.checked {
          background-color: var(--color-primary-honey);
          border-color: var(--color-primary-honey);
          color: #FFFFFF;
        }

        .checkbox-circle.disabled {
          background-color: #EEE7DA;
          border-color: #D6C7B4;
        }

        .search-bar-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background-color: #FAF4E8;
          border: 1px solid var(--color-card-border);
          border-radius: var(--radius-button);
        }

        .modal-search-input {
          border: none;
          background: none;
          outline: none;
          font-family: var(--font-family);
          font-size: 12px;
          flex: 1;
          color: var(--color-deep-cocoa);
        }

        .clear-search-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-warm-gray);
          display: flex;
          align-items: center;
        }

        .caps-list-edit {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 220px;
          overflow-y: auto;
          margin-top: 6px;
          padding-right: 4px;
        }

        .cap-row-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-card-border);
          border-radius: var(--radius-button);
          cursor: pointer;
          text-align: left;
          font-family: var(--font-family);
          transition: all 0.15s ease;
        }

        .cap-row-item.selected {
          border-color: var(--color-primary-honey);
          background-color: #FAF4E9;
        }

        .cap-icon-mini {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background-color: #FAF0DE;
          color: var(--color-deep-honey);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cap-row-item.selected .cap-icon-mini {
          background-color: var(--color-primary-honey);
          color: #FFFFFF;
        }

        .cap-text-mini {
          flex: 1;
        }

        .micro-badge-risk {
          font-size: 9.5px;
          font-weight: 700;
          color: #B57F1B;
          background-color: #FFF6DD;
          padding: 1px 4px;
          border-radius: 3px;
        }

        .cap-check-mini {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 1.5px solid #D6C7B4;
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          flex-shrink: 0;
        }

        .cap-check-mini.checked {
          background-color: var(--color-primary-honey);
          border-color: var(--color-primary-honey);
          color: #FFFFFF;
        }

        /* Access Diff Styles */
        .access-diff-card {
          padding: 12px 14px;
          background-color: #FAF5EB;
          border: 1px solid #E8DCBE;
        }

        .diff-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .diff-header {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 700;
        }

        .diff-header.add {
          color: var(--color-healthy);
        }

        .diff-header.remove {
          color: var(--color-attention);
        }

        .diff-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .diff-tag {
          font-size: 11px;
          padding: 2px 7px;
          border-radius: 4px;
        }

        .diff-tag.add {
          background-color: var(--color-healthy-tint);
          color: var(--color-healthy);
          border: 1px solid rgba(79, 122, 82, 0.25);
        }

        .diff-tag.remove {
          background-color: var(--color-attention-tint);
          color: var(--color-attention);
          border: 1px solid rgba(217, 130, 43, 0.25);
        }

        .edit-modal-actions {
          display: flex;
          gap: 10px;
        }

        .modules-compact-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 6px;
        }

        .compact-cat-card {
          padding: 10px 12px;
          background-color: var(--color-soft-ivory);
        }

        .accordion-trigger-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background-color: #FAF5EB;
          border: 1px solid #E8DCBE;
          padding: 8px 12px;
          border-radius: var(--radius-button);
          cursor: pointer;
          color: var(--color-deep-cocoa);
          font-family: var(--font-family);
        }

        .permissions-preview-box {
          background-color: #FAF6ED;
          border: 1px solid #E8DEC6;
          border-top: none;
          padding: 10px 12px;
          border-bottom-left-radius: var(--radius-button);
          border-bottom-right-radius: var(--radius-button);
        }

        .perms-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .perm-item-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          background-color: #FFFDF8;
          border: 1px solid #DEC8A2;
          border-radius: 4px;
          font-size: 10.5px;
          color: var(--color-deep-cocoa);
          text-transform: capitalize;
        }

        /* Confirmation dialog */
        .confirm-removal-overlay {
          position: absolute;
          inset: 0;
          background-color: rgba(43, 27, 23, 0.55);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 100;
          border-radius: 20px 20px 0 0;
        }

        .confirm-removal-card {
          background-color: #FFFFFF;
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          max-width: 340px;
          width: 100%;
        }

        .removal-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 140px;
          overflow-y: auto;
          background-color: #FAF4EC;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #EBDCC6;
        }

        .removal-item {
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }
      `}</style>
    </div>
  );
};

