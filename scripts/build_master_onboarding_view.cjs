const fs = require('fs');

const masterViewCode = `import React, { useState, useEffect, useMemo } from 'react';
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

import { AdaptiveWelcomeScreen } from './AdaptiveWelcomeScreen';
import { WorkContextScreen } from './WorkContextScreen';
import { AdaptiveTasksScreen } from './AdaptiveTasksScreen';
import { AdaptiveReviewScreen } from './AdaptiveReviewScreen';
import { AdaptiveDesignationsScreen } from './AdaptiveDesignationsScreen';
import { AdaptiveWorkspacePreviewScreen } from './AdaptiveWorkspacePreviewScreen';
import { AdaptiveConfirmationScreen } from './AdaptiveConfirmationScreen';
import { AdaptiveClarificationModal } from './AdaptiveClarificationModal';
import { OnboardingDiagnosticDrawer } from './OnboardingDiagnosticDrawer';

import './OnboardingView.css';

import {
  ArrowLeft,
  RotateCcw,
  Cpu,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'honeychain_onboarding_draft_v13';

const WORK_ENVIRONMENTS = [
  { id: 'apiary', label: 'Apiary / outdoor farm', desc: 'Field yards, hives & open apiaries' },
  { id: 'processing', label: 'Processing facility', desc: 'Extraction room, settling tanks & bottling' },
  { id: 'laboratory', label: 'Testing laboratory', desc: 'Refractometry, enzyme & purity analysis' },
  { id: 'warehouse', label: 'Warehouse & stock hub', desc: 'Carton inventory, lot storage & dispatch' },
  { id: 'roaming', label: 'Multiple locations', desc: 'Roaming across yards and supply locations' }
];

export const OnboardingView = () => {
  const { completeCapabilityOnboarding, apiary, session } = useAppState();

  const getInitialState = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          step: parsed.step || 1,
          naturalText: parsed.naturalText || '',
          signals: parsed.signals || [],
          selectedDomains: parsed.selectedDomains || ['HIVE_OPERATIONS'],
          selectedCapabilities: parsed.selectedCapabilities || ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION'],
          selectedEnvironments: parsed.selectedEnvironments || ['apiary'],
          confirmedDesignations: parsed.confirmedDesignations || ['BEEKEEPER'],
          operatorName: parsed.operatorName || session?.operator || apiary?.operator || 'Sarah Lindqvist',
          apiaryName: parsed.apiaryName || apiary?.name || 'Meadowbrook Apiary'
        };
      }
    } catch (_) {}

    return {
      step: 1,
      naturalText: '',
      signals: [],
      selectedDomains: ['HIVE_OPERATIONS'],
      selectedCapabilities: ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION'],
      selectedEnvironments: ['apiary'],
      confirmedDesignations: ['BEEKEEPER'],
      operatorName: session?.operator || apiary?.operator || 'Sarah Lindqvist',
      apiaryName: apiary?.name || 'Meadowbrook Apiary'
    };
  };

  const initial = getInitialState();
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

  const accessibleCapabilities = useMemo(() => {
    return CAPABILITY_CATALOG.filter(c => !['SYSTEM_ONLY', 'PRIVILEGED'].includes(c.capabilityClass));
  }, []);

  useEffect(() => {
    try {
      const draft = {
        step,
        naturalText,
        signals,
        selectedDomains,
        selectedCapabilities,
        selectedEnvironments,
        confirmedDesignations,
        operatorName,
        apiaryName
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (_) {}
  }, [step, naturalText, signals, selectedDomains, selectedCapabilities, selectedEnvironments, confirmedDesignations, operatorName, apiaryName]);

  const sessionEvaluation = useMemo(() => {
    return OnboardingIntelligenceService.evaluateSession({
      signals,
      questionCount: askedQuestionIds.length,
      askedQuestionIds
    });
  }, [signals, askedQuestionIds]);

  const designationEvaluation = useMemo(() => {
    const capsToEvaluate = selectedCapabilities.length > 0
      ? selectedCapabilities
      : sessionEvaluation.candidateCapabilities;
    return evaluateCanonicalDesignationEligibility(capsToEvaluate);
  }, [selectedCapabilities, sessionEvaluation.candidateCapabilities]);

  const workspacePreview = useMemo(() => {
    return resolvePermissionsAndModules({
      capabilities: selectedCapabilities,
      designations: confirmedDesignations
    });
  }, [selectedCapabilities, confirmedDesignations]);

  const handleNaturalLanguageSubmit = (textToProcess) => {
    const text = typeof textToProcess === 'string' ? textToProcess : naturalText;
    if (!text.trim()) {
      setStep(2);
      return;
    }

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
      if (desigResult.suggestions.length > 0) {
        setConfirmedDesignations(desigResult.suggestions.map(s => s.designationId));
      }
    }

    const followUp = OnboardingIntelligenceService.generateFollowUpQuestion({
      signals: newSignals,
      contradictions: interp.contradictions,
      questionCount: askedQuestionIds.length,
      askedQuestionIds
    });

    if (followUp) {
      setActiveClarificationQuestion(followUp);
    } else {
      setStep(2);
    }
  };

  const handleClarificationAnswer = (selectedOption) => {
    if (!activeClarificationQuestion) return;

    const answerInterp = OnboardingIntelligenceService.interpretAnswer(selectedOption, {
      questionId: activeClarificationQuestion.id
    });

    const updatedSignals = [...signals, ...answerInterp.signals];
    setSignals(updatedSignals);
    setAskedQuestionIds(prev => [...prev, activeClarificationQuestion.id]);
    setActiveClarificationQuestion(null);

    const candidateResult = OnboardingIntelligenceService.generateCapabilityCandidates(updatedSignals);
    const candidateIds = candidateResult.candidates.map(c => c.capabilityId);
    if (candidateIds.length > 0) {
      setSelectedCapabilities(Array.from(new Set([...selectedCapabilities, ...candidateIds])));
    }

    if (step === 1) setStep(2);
  };

  const toggleCapability = (capId) => {
    setSelectedCapabilities(prev => {
      let updated;
      if (prev.includes(capId)) {
        updated = prev.length > 1 ? prev.filter(c => c !== capId) : prev;
      } else {
        const depResult = CapabilityRegistry.resolveCapabilityDependencies([capId]);
        updated = Array.from(new Set([...prev, capId, ...depResult.dependencies]));
      }

      const cap = CAPABILITY_MAP.get(capId);
      if (cap) {
        const signal = createOnboardingSignal({
          category: 'ACTION',
          value: capId,
          source: 'DIRECT_USER_SIGNAL',
          evidence: "User selected " + cap.name
        });
        setSignals(s => [...s, signal]);
      }

      const desigRes = evaluateCanonicalDesignationEligibility(updated);
      if (desigRes.suggestions.length > 0) {
        setConfirmedDesignations(desigRes.suggestions.map(s => s.designationId));
      }

      return updated;
    });
  };

  const removeCapability = (capId) => {
    setSelectedCapabilities(prev => {
      if (prev.length <= 1) return prev;
      const updated = prev.filter(c => c !== capId);
      const desigRes = evaluateCanonicalDesignationEligibility(updated);
      if (desigRes.suggestions.length > 0) {
        setConfirmedDesignations(desigRes.suggestions.map(s => s.designationId));
      }
      return updated;
    });
  };

  const addCapability = (capId) => {
    const depResult = CapabilityRegistry.resolveCapabilityDependencies([capId]);
    const updated = Array.from(new Set([...selectedCapabilities, capId, ...depResult.dependencies]));
    setSelectedCapabilities(updated);

    const desigRes = evaluateCanonicalDesignationEligibility(updated);
    if (desigRes.suggestions.length > 0) {
      setConfirmedDesignations(desigRes.suggestions.map(s => s.designationId));
    }
  };

  const toggleDesignation = (desigId) => {
    setConfirmedDesignations(prev => {
      return prev.includes(desigId)
        ? (prev.length > 1 ? prev.filter(d => d !== desigId) : prev)
        : [...prev, desigId];
    });
  };

  const handleNext = () => {
    if (step === 4) {
      if (designationEvaluation.suggestions.length > 0) {
        setConfirmedDesignations(designationEvaluation.suggestions.map(s => s.designationId));
      }
    }

    if (step < 8) {
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

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (_) {}
    setStep(1);
    setNaturalText('');
    setSignals([]);
    setSelectedDomains(['HIVE_OPERATIONS']);
    setSelectedCapabilities(['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION']);
    setSelectedEnvironments(['apiary']);
    setConfirmedDesignations(['BEEKEEPER']);
    setAskedQuestionIds([]);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Welcome';
      case 2: return 'Work Focus';
      case 3: return 'Your Tasks';
      case 4: return 'Workplace';
      case 5: return 'Your Profile';
      case 6: return 'Work Identities';
      case 7: return 'Workspace Preview';
      case 8: return 'Confirmation';
      default: return 'Setup';
    }
  };

  return (
    <div className="onboarding-viewport">
      <header className="onboarding-header-nav">
        <div className="nav-action-col">
          {step > 1 && (
            <button
              type="button"
              className="nav-icon-btn"
              onClick={handleBack}
              aria-label="Previous step"
            >
              <ArrowLeft size={18} />
            </button>
          )}
        </div>

        <div className="nav-center-col">
          <span className="step-phase-label">Step {step} of 8 • {getStepTitle()}</span>
          <div className="progress-track-dots">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div
                key={i}
                className={"progress-dot " + (i === step ? 'active' : '') + (i < step ? ' completed' : '')}
              />
            ))}
          </div>
        </div>

        <div className="nav-action-col right" style={{ gap: '6px' }}>
          <button
            type="button"
            className={"nav-diag-btn " + (showDiagnostics ? 'active' : '')}
            onClick={() => setShowDiagnostics(prev => !prev)}
            title="Inspect Capability Intelligence Engine"
          >
            <Cpu size={15} />
            <span className="diag-btn-label">Engine</span>
          </button>
          <button
            type="button"
            className="nav-icon-btn reset"
            onClick={handleReset}
            title="Reset setup"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </header>

      {step >= 2 && step <= 4 && (
        <div className="live-summary-bar">
          <Sparkles size={14} color="var(--color-deep-honey, #B45309)" />
          <span className="live-summary-text">
            <strong>Your work so far:</strong> {selectedCapabilities.length} capabilities selected
            {' • '}
            {selectedCapabilities.slice(0, 3).map(id => CAPABILITY_MAP.get(id)?.name).filter(Boolean).join(', ')}
            {selectedCapabilities.length > 3 ? " + " + (selectedCapabilities.length - 3) + " more" : ''}
          </span>
        </div>
      )}

      {step === 2 ? (
        <WorkContextScreen
          selectedContexts={selectedDomains}
          onToggleContext={(id) => {
            setSelectedDomains(prev =>
              prev.includes(id)
                ? (prev.length > 1 ? prev.filter(x => x !== id) : prev)
                : [...prev, id]
            );
          }}
          onContinue={() => setStep(3)}
          onBack={handleBack}
          progress="2/8"
        />
      ) : (
        <main className="onboarding-body-scroll">
          {step === 1 && (
            <AdaptiveWelcomeScreen
              naturalText={naturalText}
              onChangeNaturalText={setNaturalText}
              onSubmitNatural={handleNaturalLanguageSubmit}
              onStartGuided={() => setStep(2)}
            />
          )}

          {step === 3 && (
            <AdaptiveTasksScreen
              accessibleCapabilities={accessibleCapabilities}
              selectedDomains={selectedDomains}
              selectedCapabilities={selectedCapabilities}
              onToggleCapability={toggleCapability}
              onContinue={handleNext}
            />
          )}

          {step === 4 && (
            <div className="screen-container">
              <div className="screen-header">
                <span className="micro-badge-step">04 • Environment</span>
                <h1 className="screen-title">Where do you work?</h1>
                <p className="screen-subtitle">
                  This configures network resilience, telemetry options, and field offline caching.
                </p>
              </div>

              <div className="env-options-list">
                {WORK_ENVIRONMENTS.map(env => {
                  const isSelected = selectedEnvironments.includes(env.id);
                  return (
                    <div
                      key={env.id}
                      className={"env-row " + (isSelected ? 'selected' : '')}
                      onClick={() => {
                        setSelectedEnvironments(prev =>
                          prev.includes(env.id)
                            ? (prev.length > 1 ? prev.filter(e => e !== env.id) : prev)
                            : [...prev, env.id]
                        );
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={"env-radio " + (isSelected ? 'checked' : '')}>
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
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={handleNext}
                >
                  <span>Review HoneyChain Understanding</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <AdaptiveReviewScreen
              accessibleCapabilities={accessibleCapabilities}
              selectedCapabilities={selectedCapabilities}
              onRemoveCapability={removeCapability}
              onAddCapability={addCapability}
              onContinue={handleNext}
            />
          )}

          {step === 6 && (
            <AdaptiveDesignationsScreen
              designationEvaluation={designationEvaluation}
              confirmedDesignations={confirmedDesignations}
              onToggleDesignation={toggleDesignation}
              onContinue={handleNext}
            />
          )}

          {step === 7 && (
            <AdaptiveWorkspacePreviewScreen
              workspacePreview={workspacePreview}
              onContinue={handleNext}
            />
          )}

          {step === 8 && (
            <AdaptiveConfirmationScreen
              confirmedDesignations={confirmedDesignations}
              workspacePreview={workspacePreview}
              operatorName={operatorName}
              apiaryName={apiaryName}
              onComplete={handleNext}
              onChangeSetup={() => setStep(2)}
            />
          )}
        </main>
      )}

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
`;

fs.writeFileSync('D:/SIH-2026/src/components/onboarding/OnboardingView.jsx', masterViewCode, 'utf8');
console.log('Successfully wrote master OnboardingView.jsx');
