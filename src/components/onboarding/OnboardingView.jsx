/**
 * HONEYCHAIN — FOUR-DESIGNATION ONBOARDING VIEW (v17)
 *
 * Architecture: Role-selection gateway → role-specific onboarding flow.
 *
 * Four primary designation paths:
 *   BEEKEEPER     → BeekeeperOnboarding (5-step field onboarding)
 *   PROCESSOR     → CommonProcessorOnboarding (12-question human flow)
 *   LAB_SPECIALIST → LabOnboarding (6-step professional flow)
 *   DISTRIBUTOR   → DispatchOnboarding (5-step business flow)
 *
 * Advanced fallback: 7-step generic capability onboarding (for admin/power users).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  CAPABILITY_CATALOG,
  CAPABILITY_MAP,
  CapabilityRegistry
} from '../../services/capabilityRegistry';
import {
  CANONICAL_DESIGNATION_POLICY,
  evaluateCanonicalDesignationEligibility
} from '../../services/designationEngine';
import {
  OnboardingIntelligenceService,
  createOnboardingSignal,
  CAPABILITY_POLICY_VERSION,
  ONBOARDING_ENGINE_VERSION
} from '../../services/onboardingIntelligenceService';
import { confirmUserCapabilityProfile } from '../../services/userCapabilityProfileService';
import { resolvePermissionsAndModules } from '../../services/permissionEngine';

// Role-specific onboarding flows (NEW)
import { RoleSelectionScreen } from './RoleSelectionScreen';
import { BeekeeperOnboarding } from './BeekeeperOnboarding';
import { LabOnboarding } from './LabOnboarding';
import { DispatchOnboarding } from './DispatchOnboarding';

// Processor flows (existing)
import { CommonProcessorOnboarding } from './CommonProcessorOnboarding';
import { ProcessorSetupScreen } from './ProcessorSetupScreen';

// Generic / advanced flow screens (kept as fallback)
import { AdaptiveWelcomeScreen } from './AdaptiveWelcomeScreen';
import { AdaptiveTasksScreen } from './AdaptiveTasksScreen';
import { AdaptiveReviewScreen } from './AdaptiveReviewScreen';
import { AdaptiveDesignationsScreen } from './AdaptiveDesignationsScreen';
import { AdaptiveWorkspacePreviewScreen } from './AdaptiveWorkspacePreviewScreen';
import { AdaptiveConfirmationScreen } from './AdaptiveConfirmationScreen';
import { AdaptiveClarificationModal } from './AdaptiveClarificationModal';
import { OnboardingDiagnosticDrawer } from './OnboardingDiagnosticDrawer';

import { CommonProcessorOnboardingService } from '../../services/commonProcessorOnboardingService';

import './OnboardingView.css';
import './RoleOnboarding.css';

import { ArrowLeft, RotateCcw, Cpu, ArrowRight, Settings } from 'lucide-react';

const DRAFT_STORAGE_KEY = 'honeychain_onboarding_draft_v17';
const ROLE_KEY = 'honeychain_selected_role_v1';

const WORK_ENVIRONMENTS = [
  { id: 'apiary', label: 'Apiary / outdoor farm', desc: 'Field yards, hives & open apiaries' },
  { id: 'processing', label: 'Processing facility', desc: 'Extraction room, settling tanks & bottling' },
  { id: 'laboratory', label: 'Testing laboratory', desc: 'Refractometry, enzyme & purity analysis' },
  { id: 'warehouse', label: 'Warehouse & stock hub', desc: 'Carton inventory, lot storage & dispatch' },
  { id: 'roaming', label: 'Multiple locations', desc: 'Roaming across yards and supply locations' }
];

// ─── View Mode Constants ──────────────────────────────────────────────────────
const VIEW = {
  ROLE_SELECT: 'ROLE_SELECT',     // Initial role picker
  BEEKEEPER: 'BEEKEEPER',         // Simple field onboarding
  PROCESSOR: 'PROCESSOR',         // Common-man processor onboarding
  PROCESSOR_ADVANCED: 'PROCESSOR_ADVANCED', // Technical processor
  LAB: 'LAB',                     // Lab specialist onboarding
  DISPATCH: 'DISPATCH',           // Distributor onboarding
  ADVANCED: 'ADVANCED'            // Legacy 7-step generic flow (power users)
};

export const OnboardingView = () => {
  const { completeCapabilityOnboarding, apiary, session } = useAppState();

  // ── Primary view routing ─────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState(() => {
    // Check if processor onboarding was triggered from TopBar/More
    try {
      if (sessionStorage.getItem('open_processor_onboarding') === 'true') {
        sessionStorage.removeItem('open_processor_onboarding');
        return VIEW.PROCESSOR;
      }
      // Restore previously selected role if navigating back
      const savedRole = sessionStorage.getItem(ROLE_KEY);
      if (savedRole && Object.values(VIEW).includes(savedRole)) {
        sessionStorage.removeItem(ROLE_KEY);
        return savedRole;
      }
    } catch (_) {}
    return VIEW.ROLE_SELECT;
  });

  // ── Advanced / generic flow state (kept for fallback) ────────────────────
  const getInitialAdvancedState = () => {
    try {
      ['honeychain_onboarding_draft_v15', 'honeychain_onboarding_draft_v16',
        'honeychain_onboarding_draft_v14', 'honeychain_onboarding_draft'].forEach(k => {
        try { localStorage.removeItem(k); } catch (_) {}
      });
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          step: parsed.step || 1,
          naturalText: parsed.naturalText || '',
          signals: parsed.signals || [],
          selectedDomains: Array.isArray(parsed.selectedDomains) ? parsed.selectedDomains : [],
          selectedCapabilities: Array.isArray(parsed.selectedCapabilities) ? parsed.selectedCapabilities : [],
          selectedEnvironments: Array.isArray(parsed.selectedEnvironments) ? parsed.selectedEnvironments : [],
          confirmedDesignations: parsed.confirmedDesignations || [],
          operatorName: parsed.operatorName || session?.operator || apiary?.operator || '',
          apiaryName: parsed.apiaryName || apiary?.name || ''
        };
      }
    } catch (_) {}
    return {
      step: 1, naturalText: '', signals: [],
      selectedDomains: [], selectedCapabilities: [],
      selectedEnvironments: [], confirmedDesignations: [],
      operatorName: session?.operator || apiary?.operator || '',
      apiaryName: apiary?.name || ''
    };
  };

  const initial = getInitialAdvancedState();
  const [step, setStep] = useState(initial.step);
  const [naturalText, setNaturalText] = useState(initial.naturalText);
  const [signals, setSignals] = useState(initial.signals);
  const [selectedDomains, setSelectedDomains] = useState(initial.selectedDomains);
  const [selectedCapabilities, setSelectedCapabilities] = useState(initial.selectedCapabilities);
  const [selectedEnvironments, setSelectedEnvironments] = useState(initial.selectedEnvironments);
  const [confirmedDesignations, setConfirmedDesignations] = useState(initial.confirmedDesignations);
  const [operatorName, setOperatorName] = useState(initial.operatorName);
  const [apiaryName, setApiaryName] = useState(initial.apiaryName);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [activeClarificationQuestion, setActiveClarificationQuestion] = useState(null);
  const [askedQuestionIds, setAskedQuestionIds] = useState([]);

  // Persist advanced draft
  useEffect(() => {
    if (currentView !== VIEW.ADVANCED) return;
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        step, naturalText, signals, selectedDomains,
        selectedCapabilities, selectedEnvironments, confirmedDesignations,
        operatorName, apiaryName
      }));
    } catch (_) {}
  }, [currentView, step, naturalText, signals, selectedDomains,
    selectedCapabilities, selectedEnvironments, confirmedDesignations, operatorName, apiaryName]);

  // ── Role Selection Handler ───────────────────────────────────────────────
  const handleRoleSelect = (roleId) => {
    const viewMap = {
      BEEKEEPER: VIEW.BEEKEEPER,
      PROCESSOR: VIEW.PROCESSOR,
      LAB_SPECIALIST: VIEW.LAB,
      DISTRIBUTOR: VIEW.DISPATCH
    };
    setCurrentView(viewMap[roleId] || VIEW.ADVANCED);
  };

  // ── Shared completion handler ────────────────────────────────────────────
  const handleRoleComplete = (config) => {
    try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch (_) {}
    completeCapabilityOnboarding({
      capabilities: config.capabilities || [],
      designations: config.designations || [],
      workContexts: config.workContexts || { areas: [], handles: [] },
      operatorName: config.operatorName || session?.operator || '',
      apiaryName: config.apiaryName || apiary?.name || '',
      userCapabilityProfile: config.userCapabilityProfile || null
    });
  };

  // ── Advanced flow helpers (kept for fallback 7-step) ────────────────────
  const accessibleCapabilities = useMemo(() =>
    CAPABILITY_CATALOG.filter(c => !['SYSTEM_ONLY', 'PRIVILEGED'].includes(c.capabilityClass)),
    []);

  const sessionEvaluation = useMemo(() =>
    OnboardingIntelligenceService.evaluateSession({ signals, questionCount: askedQuestionIds.length, askedQuestionIds }),
    [signals, askedQuestionIds]);

  const designationEvaluation = useMemo(() => {
    const capsToEvaluate = selectedCapabilities.length > 0 ? selectedCapabilities : sessionEvaluation.candidateCapabilities;
    return evaluateCanonicalDesignationEligibility(capsToEvaluate);
  }, [selectedCapabilities, sessionEvaluation.candidateCapabilities]);

  const workspacePreview = useMemo(() =>
    resolvePermissionsAndModules({ capabilities: selectedCapabilities, designations: confirmedDesignations }),
    [selectedCapabilities, confirmedDesignations]);

  const resolveConfirmedDesignations = (desigResult) => {
    if (!desigResult) return [];
    const strong = (desigResult.evaluations || []).filter(
      e => e.eligibilityState === 'STRONG_MATCH' || e.eligibilityState === 'REQUIRES_VERIFICATION'
    );
    if (strong.length > 0) return strong.map(s => s.designationId);
    if (desigResult.suggestions?.length > 0) return [desigResult.suggestions[0].designationId];
    return [];
  };

  const handleNaturalLanguageSubmit = (textToProcess) => {
    const text = typeof textToProcess === 'string' ? textToProcess : naturalText;
    if (!text.trim()) { setStep(2); return; }
    const interp = OnboardingIntelligenceService.interpretAnswer(text);
    const newSignals = [...signals, ...interp.signals];
    setSignals(newSignals);
    const domains = OnboardingIntelligenceService.extractWorkSignals(newSignals).map(s => s.value);
    if (domains.length > 0) {
      const mapped = domains.map(d => {
        if (d === 'FIELD') return 'HIVE_OPERATIONS';
        if (d === 'HONEY') return 'HONEY_OPERATIONS';
        if (d === 'QUALITY') return 'QUALITY_OPERATIONS';
        if (d === 'FULFILLMENT') return 'LOGISTICS_OPERATIONS';
        return d;
      });
      setSelectedDomains(Array.from(new Set(mapped)));
    }
    const candidateResult = OnboardingIntelligenceService.generateCapabilityCandidates(newSignals);
    const candidateIds = candidateResult.candidates.map(c => c.capabilityId);
    if (candidateIds.length > 0) {
      setSelectedCapabilities(candidateIds);
      const desigResult = evaluateCanonicalDesignationEligibility(candidateIds);
      const autoConfirmed = resolveConfirmedDesignations(desigResult);
      if (autoConfirmed.length > 0) setConfirmedDesignations(autoConfirmed);
    }
    const followUp = OnboardingIntelligenceService.generateFollowUpQuestion({
      signals: newSignals, contradictions: interp.contradictions,
      questionCount: askedQuestionIds.length, askedQuestionIds
    });
    if (followUp) setActiveClarificationQuestion(followUp);
    else setStep(2);
  };

  const handleClarificationAnswer = (selectedOption) => {
    if (!activeClarificationQuestion) return;
    const answerInterp = OnboardingIntelligenceService.interpretAnswer(selectedOption, { questionId: activeClarificationQuestion.id });
    const updatedSignals = [...signals, ...answerInterp.signals];
    setSignals(updatedSignals);
    setAskedQuestionIds(prev => [...prev, activeClarificationQuestion.id]);
    setActiveClarificationQuestion(null);
    const candidateResult = OnboardingIntelligenceService.generateCapabilityCandidates(updatedSignals);
    const candidateIds = candidateResult.candidates.map(c => c.capabilityId);
    if (candidateIds.length > 0) {
      setSelectedCapabilities(prev => Array.from(new Set([...prev, ...candidateIds])));
    }
    if (step === 1) setStep(2);
  };

  const toggleCapability = (capId) => {
    setSelectedCapabilities(prev => {
      let updated;
      if (prev.includes(capId)) {
        updated = prev.filter(c => c !== capId);
      } else {
        const depResult = CapabilityRegistry.resolveCapabilityDependencies([capId]);
        updated = Array.from(new Set([...prev, capId, ...depResult.dependencies]));
      }
      const cap = CAPABILITY_MAP.get(capId);
      if (cap) {
        const signal = createOnboardingSignal({ category: 'ACTION', value: capId, source: 'DIRECT_USER_SIGNAL', evidence: 'User selected ' + cap.name });
        setSignals(s => [...s, signal]);
      }
      const desigRes = evaluateCanonicalDesignationEligibility(updated);
      const autoConfirmed = resolveConfirmedDesignations(desigRes);
      if (autoConfirmed.length > 0) setConfirmedDesignations(autoConfirmed);
      return updated;
    });
  };

  const removeCapability = (capId) => {
    setSelectedCapabilities(prev => {
      const updated = prev.filter(c => c !== capId);
      const desigRes = evaluateCanonicalDesignationEligibility(updated);
      setConfirmedDesignations(resolveConfirmedDesignations(desigRes));
      return updated;
    });
  };

  const batchSelectCapabilities = (capIds) => {
    setSelectedCapabilities(prev => {
      const depResult = CapabilityRegistry.resolveCapabilityDependencies(capIds);
      const updated = Array.from(new Set([...prev, ...capIds, ...depResult.dependencies]));
      const desigRes = evaluateCanonicalDesignationEligibility(updated);
      const autoConfirmed = resolveConfirmedDesignations(desigRes);
      if (autoConfirmed.length > 0) setConfirmedDesignations(autoConfirmed);
      return updated;
    });
  };

  const clearCapabilities = (capIdsToClear) => {
    setSelectedCapabilities(prev => {
      const updated = prev.filter(id => !capIdsToClear.includes(id));
      const desigRes = evaluateCanonicalDesignationEligibility(updated);
      setConfirmedDesignations(resolveConfirmedDesignations(desigRes));
      return updated;
    });
  };

  const addCapability = (capId) => {
    const depResult = CapabilityRegistry.resolveCapabilityDependencies([capId]);
    const updated = Array.from(new Set([...selectedCapabilities, capId, ...depResult.dependencies]));
    setSelectedCapabilities(updated);
    const desigRes = evaluateCanonicalDesignationEligibility(updated);
    const autoConfirmed = resolveConfirmedDesignations(desigRes);
    if (autoConfirmed.length > 0) setConfirmedDesignations(autoConfirmed);
  };

  const toggleDesignation = (desigId) => {
    setConfirmedDesignations(prev =>
      prev.includes(desigId) ? (prev.length > 1 ? prev.filter(d => d !== desigId) : prev) : [...prev, desigId]
    );
  };

  const handleAdvancedNext = () => {
    if (step === 3 && confirmedDesignations.length === 0) {
      const autoConfirmed = resolveConfirmedDesignations(designationEvaluation);
      if (autoConfirmed.length > 0) setConfirmedDesignations(autoConfirmed);
    }
    if (step < 7) {
      setStep(prev => prev + 1);
    } else {
      const sourceMap = selectedCapabilities.map(id => ({
        capabilityId: id,
        source: signals.find(s => s.value === id)?.source || 'DIRECT_USER_SIGNAL'
      }));
      const { profile } = confirmUserCapabilityProfile({
        userId: session?.userId || 'usr-current',
        workspaceId: session?.workspaceId || 'ws-default',
        candidateCapabilities: selectedCapabilities,
        confirmedCapabilities: selectedCapabilities,
        candidateDesignations: designationEvaluation.suggestions.map(s => s.designationId),
        confirmedDesignations,
        sources: sourceMap
      });
      completeCapabilityOnboarding({
        capabilities: profile.confirmedCapabilities,
        designations: profile.confirmedDesignations,
        workContexts: { areas: selectedEnvironments, handles: selectedDomains },
        operatorName,
        apiaryName,
        userCapabilityProfile: profile
      });
    }
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      CommonProcessorOnboardingService.clearDraft();
    } catch (_) {}
    setCurrentView(VIEW.ROLE_SELECT);
    setStep(1);
    setNaturalText(''); setSignals([]);
    setSelectedDomains([]); setSelectedCapabilities([]);
    setSelectedEnvironments([]); setConfirmedDesignations([]);
    setAskedQuestionIds([]);
  };

  const getAdvancedStepTitle = () => {
    switch (step) {
      case 1: return 'Work Focus'; case 2: return 'Daily Actions';
      case 3: return 'Workplace'; case 4: return 'Profile Review';
      case 5: return 'Work Identities'; case 6: return 'Workspace Preview';
      case 7: return 'Confirmation'; default: return 'Setup';
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // ── ROLE SELECTION ─────────────────────────────────────────────────────
  if (currentView === VIEW.ROLE_SELECT) {
    return (
      <div className="onboarding-viewport">
        {/* Minimal header */}
        <header className="onboarding-header-nav">
          <div className="nav-action-col" />
          <div className="nav-center-col">
            <span className="step-title-text" style={{ fontSize: '13px', fontWeight: 700 }}>
              HoneyChain Setup
            </span>
          </div>
          <div className="nav-action-col right">
            <button
              type="button"
              className="nav-diag-btn"
              title="Advanced setup (for technical users)"
              onClick={() => setCurrentView(VIEW.ADVANCED)}
              style={{ fontSize: '11px', gap: '4px' }}
            >
              <Settings size={13} />
              Advanced
            </button>
          </div>
        </header>
        <main className="onboarding-body-scroll">
          <RoleSelectionScreen onSelectRole={handleRoleSelect} />
        </main>
      </div>
    );
  }

  // ── BEEKEEPER ONBOARDING ───────────────────────────────────────────────
  if (currentView === VIEW.BEEKEEPER) {
    return (
      <div className="onboarding-viewport">
        <header className="onboarding-header-nav">
          <div className="nav-action-col">
            <button type="button" className="nav-icon-btn" onClick={() => setCurrentView(VIEW.ROLE_SELECT)}>
              <ArrowLeft size={18} />
            </button>
          </div>
          <div className="nav-center-col">
            <div className="step-indicator-wrap">
              <span style={{ fontSize: '16px' }}>🐝</span>
              <span className="step-title-text">Beekeeper Setup</span>
            </div>
          </div>
          <div className="nav-action-col right">
            <button type="button" className="nav-icon-btn reset" onClick={handleReset} title="Start over">
              <RotateCcw size={15} />
            </button>
          </div>
        </header>
        <main className="onboarding-body-scroll">
          <BeekeeperOnboarding
            onComplete={handleRoleComplete}
            onBack={() => setCurrentView(VIEW.ROLE_SELECT)}
          />
        </main>
      </div>
    );
  }

  // ── PROCESSOR ONBOARDING (Simple) ──────────────────────────────────────
  if (currentView === VIEW.PROCESSOR) {
    return (
      <div className="onboarding-viewport">
        <header className="onboarding-header-nav">
          <div className="nav-action-col">
            <button type="button" className="nav-icon-btn" onClick={() => setCurrentView(VIEW.ROLE_SELECT)}>
              <ArrowLeft size={18} />
            </button>
          </div>
          <div className="nav-center-col">
            <div className="step-indicator-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🍯</span>
              <span className="step-title-text" style={{ fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                Processor Setup
              </span>
              <span className="badge badge-honey" style={{ fontSize: '11px', padding: '2px 8px' }}>
                Simple Mode
              </span>
            </div>
          </div>
          <div className="nav-action-col right" style={{ gap: '6px' }}>
            <button
              type="button"
              className="nav-diag-btn"
              onClick={() => setCurrentView(VIEW.PROCESSOR_ADVANCED)}
              title="Switch to Advanced Mode"
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Advanced Mode
            </button>
            <button type="button" className="nav-icon-btn reset" onClick={handleReset} title="Start over">
              <RotateCcw size={15} />
            </button>
          </div>
        </header>
        <main className="onboarding-body-scroll">
          <CommonProcessorOnboarding
            initialData={{ activity: 'PROCESS' }}
            onComplete={(config) => {
              if (config.capabilities) batchSelectCapabilities(config.capabilities);
              handleRoleComplete({
                capabilities: config.capabilities || [
                  'PROCESSING_MANAGEMENT', 'BATCH_INTAKE',
                  'PROCESSING_STEP_RECORD', 'BATCH_TRACEABILITY'
                ],
                designations: ['PROCESSOR'],
                workContexts: {
                  areas: ['Processing facility'],
                  handles: ['Honey batches', 'Processing steps'],
                  ...config.workContexts
                },
                operatorName: config.operatorName || config.organization?.name || '',
                apiaryName: config.facility?.name || config.organization?.name || ''
              });
            }}
            onCancel={() => setCurrentView(VIEW.ROLE_SELECT)}
            onSwitchToAdvanced={() => setCurrentView(VIEW.PROCESSOR_ADVANCED)}
          />
        </main>
      </div>
    );
  }

  // ── PROCESSOR ONBOARDING (Advanced Technical) ──────────────────────────
  if (currentView === VIEW.PROCESSOR_ADVANCED) {
    return (
      <div className="onboarding-viewport">
        <header className="onboarding-header-nav">
          <div className="nav-action-col">
            <button type="button" className="nav-icon-btn" onClick={() => setCurrentView(VIEW.PROCESSOR)}>
              <ArrowLeft size={18} />
            </button>
          </div>
          <div className="nav-center-col">
            <div className="step-indicator-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🍯</span>
              <span className="step-title-text" style={{ fontWeight: 700 }}>Advanced Technical Setup</span>
              <span className="badge badge-honey" style={{ fontSize: '11px', padding: '2px 8px' }}>Industrial</span>
            </div>
          </div>
          <div className="nav-action-col right">
            <button
              type="button"
              className="nav-diag-btn"
              onClick={() => setCurrentView(VIEW.PROCESSOR)}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Simple Mode
            </button>
          </div>
        </header>
        <main className="onboarding-body-scroll">
          <ProcessorSetupScreen
            onComplete={(config) => {
              setCurrentView(VIEW.ROLE_SELECT);
              handleRoleComplete({
                capabilities: ['PROCESSING_MANAGEMENT', 'BATCH_INTAKE', 'PROCESSING_STEP_RECORD', 'BATCH_TRACEABILITY'],
                designations: ['PROCESSOR'],
                workContexts: { areas: ['Processing facility'], handles: ['Honey batches'] }
              });
            }}
            onCancel={() => setCurrentView(VIEW.PROCESSOR)}
          />
        </main>
      </div>
    );
  }

  // ── LAB SPECIALIST ONBOARDING ──────────────────────────────────────────
  if (currentView === VIEW.LAB) {
    return (
      <div className="onboarding-viewport" style={{ background: 'var(--color-lab-neutral-50, #F7F9FB)' }}>
        <header className="onboarding-header-nav" style={{ background: 'var(--color-lab-neutral-50, #F7F9FB)', borderColor: 'var(--color-lab-neutral-200, #E2E8F0)' }}>
          <div className="nav-action-col">
            <button type="button" className="nav-icon-btn" onClick={() => setCurrentView(VIEW.ROLE_SELECT)}>
              <ArrowLeft size={18} />
            </button>
          </div>
          <div className="nav-center-col">
            <div className="step-indicator-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🔬</span>
              <span className="step-title-text" style={{ fontWeight: 700, color: 'var(--color-lab-neutral-900, #172033)' }}>
                Lab Specialist Setup
              </span>
            </div>
          </div>
          <div className="nav-action-col right">
            <button type="button" className="nav-icon-btn reset" onClick={handleReset} title="Start over">
              <RotateCcw size={15} />
            </button>
          </div>
        </header>
        <main className="onboarding-body-scroll">
          <LabOnboarding
            onComplete={handleRoleComplete}
            onBack={() => setCurrentView(VIEW.ROLE_SELECT)}
          />
        </main>
      </div>
    );
  }

  // ── DISPATCH / DISTRIBUTOR ONBOARDING ──────────────────────────────────
  if (currentView === VIEW.DISPATCH) {
    return (
      <div className="onboarding-viewport" style={{ background: 'var(--color-dispatch-tint, #F0F9FF)' }}>
        <header className="onboarding-header-nav" style={{ background: 'var(--color-dispatch-tint, #F0F9FF)', borderColor: 'var(--color-dispatch-border, #BAE6FD)' }}>
          <div className="nav-action-col">
            <button type="button" className="nav-icon-btn" onClick={() => setCurrentView(VIEW.ROLE_SELECT)}>
              <ArrowLeft size={18} />
            </button>
          </div>
          <div className="nav-center-col">
            <div className="step-indicator-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🚚</span>
              <span className="step-title-text" style={{ fontWeight: 700, color: '#075985' }}>
                Distributor Setup
              </span>
            </div>
          </div>
          <div className="nav-action-col right">
            <button type="button" className="nav-icon-btn reset" onClick={handleReset} title="Start over">
              <RotateCcw size={15} />
            </button>
          </div>
        </header>
        <main className="onboarding-body-scroll">
          <DispatchOnboarding
            onComplete={handleRoleComplete}
            onBack={() => setCurrentView(VIEW.ROLE_SELECT)}
          />
        </main>
      </div>
    );
  }

  // ── ADVANCED GENERIC FLOW (7-step, for power users / admin) ───────────
  return (
    <div className="onboarding-viewport">
      <header className="onboarding-header-nav">
        <div className="nav-action-col">
          {step > 1 ? (
            <button type="button" className="nav-icon-btn" onClick={() => step > 1 ? setStep(prev => prev - 1) : setCurrentView(VIEW.ROLE_SELECT)} aria-label="Previous step">
              <ArrowLeft size={18} />
            </button>
          ) : (
            <button type="button" className="nav-icon-btn" onClick={() => setCurrentView(VIEW.ROLE_SELECT)} title="Back to role selection">
              <ArrowLeft size={18} />
            </button>
          )}
        </div>
        <div className="nav-center-col">
          <div className="step-indicator-wrap">
            <span className="step-counter-text">Step {step} of 7</span>
            <span className="step-divider-dot">·</span>
            <span className="step-title-text">{getAdvancedStepTitle()}</span>
          </div>
          <div className="progress-segmented-track" role="progressbar" aria-valuenow={step} aria-valuemin="1" aria-valuemax="7">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className={'progress-segment ' + (i === step ? 'active' : '') + (i < step ? ' completed' : '')} />
            ))}
          </div>
        </div>
        <div className="nav-action-col right" style={{ gap: '6px' }}>
          <button
            type="button"
            className={'nav-diag-btn ' + (showDiagnostics ? 'active' : '')}
            onClick={() => setShowDiagnostics(prev => !prev)}
            title="Inspect Capability Intelligence Engine"
          >
            <Cpu size={15} />
            <span className="diag-btn-label">Engine</span>
          </button>
          <button type="button" className="nav-icon-btn reset" onClick={handleReset} title="Reset setup">
            <RotateCcw size={15} />
          </button>
        </div>
      </header>

      <main className="onboarding-body-scroll">
        {step === 1 && (
          <AdaptiveWelcomeScreen
            selectedDomains={selectedDomains}
            onToggleDomain={(id) => setSelectedDomains(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
            naturalText={naturalText}
            onContinue={(target) => {
              if (target === 'PROCESS' || selectedDomains.includes('HONEY_OPERATIONS') || selectedDomains.includes('PACKAGING_OPERATIONS')) {
                setCurrentView(VIEW.PROCESSOR);
                return;
              }
              if (naturalText.trim()) handleNaturalLanguageSubmit(naturalText);
              else setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <AdaptiveTasksScreen
            accessibleCapabilities={accessibleCapabilities}
            selectedDomains={selectedDomains}
            selectedCapabilities={selectedCapabilities}
            onToggleCapability={toggleCapability}
            onBatchSelectCapabilities={batchSelectCapabilities}
            onClearCapabilities={clearCapabilities}
            onContinue={handleAdvancedNext}
          />
        )}
        {step === 3 && (
          <div className="screen-container">
            <div className="screen-header">
              <h1 className="screen-title">Where do you work?</h1>
              <p className="screen-subtitle">This configures network resilience, telemetry options, and field offline caching.</p>
            </div>
            <div className="env-options-list">
              {WORK_ENVIRONMENTS.map(env => {
                const isSelected = selectedEnvironments.includes(env.id);
                return (
                  <div key={env.id} className={'env-row ' + (isSelected ? 'selected' : '')}
                    onClick={() => setSelectedEnvironments(prev => prev.includes(env.id) ? prev.filter(e => e !== env.id) : [...prev, env.id])}
                    role="button" tabIndex={0}
                  >
                    <div className={'env-radio ' + (isSelected ? 'checked' : '')}>
                      {isSelected && <div className="env-radio-inner" />}
                    </div>
                    <div className="env-info">
                      <span className="env-label">{env.label}</span>
                      <span className="env-desc">{env.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="screen-bottom-dock">
              <button type="button" className="btn-primary-action"
                disabled={selectedEnvironments.length === 0}
                style={{ opacity: selectedEnvironments.length === 0 ? 0.55 : 1, cursor: selectedEnvironments.length === 0 ? 'not-allowed' : 'pointer' }}
                onClick={handleAdvancedNext}
              >
                <span>{selectedEnvironments.length === 0 ? 'Select an environment to continue' : 'Continue to Profile Review'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
        {step === 4 && (
          <AdaptiveReviewScreen
            accessibleCapabilities={accessibleCapabilities}
            selectedCapabilities={selectedCapabilities}
            onRemoveCapability={removeCapability}
            onAddCapability={addCapability}
            onContinue={handleAdvancedNext}
          />
        )}
        {step === 5 && (
          <AdaptiveDesignationsScreen
            designationEvaluation={designationEvaluation}
            confirmedDesignations={confirmedDesignations}
            onToggleDesignation={toggleDesignation}
            onContinue={handleAdvancedNext}
          />
        )}
        {step === 6 && (
          <AdaptiveWorkspacePreviewScreen
            workspacePreview={workspacePreview}
            onContinue={handleAdvancedNext}
          />
        )}
        {step === 7 && (
          <AdaptiveConfirmationScreen
            confirmedDesignations={confirmedDesignations}
            workspacePreview={workspacePreview}
            operatorName={operatorName}
            apiaryName={apiaryName}
            onComplete={handleAdvancedNext}
            onChangeSetup={() => setStep(1)}
          />
        )}
      </main>

      {activeClarificationQuestion && (
        <AdaptiveClarificationModal
          question={activeClarificationQuestion}
          onAnswer={handleClarificationAnswer}
          onSkip={() => setActiveClarificationQuestion(null)}
        />
      )}

      <OnboardingDiagnosticDrawer
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
        state={sessionEvaluation.state}
        signals={signals}
        candidateCapabilities={sessionEvaluation.candidateCapabilities}
        designationEvaluation={designationEvaluation}
        workspacePreview={workspacePreview}
        policyVersion={CAPABILITY_POLICY_VERSION}
        engineVersion={ONBOARDING_ENGINE_VERSION}
      />
    </div>
  );
};
