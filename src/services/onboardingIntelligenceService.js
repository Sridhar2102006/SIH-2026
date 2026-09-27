import { CAPABILITY_MAP, CapabilityRegistry } from './capabilityRegistry.js';
import { evaluateCanonicalDesignationEligibility } from './designationEngine.js';

export const ONBOARDING_ENGINE_VERSION = '13.0.0';
export const CAPABILITY_POLICY_VERSION = 12;

export const ONBOARDING_STATES = Object.freeze({
  STARTED: 'STARTED',
  SIGNALS_COLLECTING: 'SIGNALS_COLLECTING',
  CANDIDATES_GENERATED: 'CANDIDATES_GENERATED',
  CLARIFICATION_REQUIRED: 'CLARIFICATION_REQUIRED',
  CAPABILITY_PROFILE_READY: 'CAPABILITY_PROFILE_READY',
  DESIGNATIONS_READY: 'DESIGNATIONS_READY',
  USER_REVIEW: 'USER_REVIEW',
  CONFIRMATION_PENDING: 'CONFIRMATION_PENDING',
  CONFIRMED: 'CONFIRMED',
  VERIFICATION_PENDING: 'VERIFICATION_PENDING',
  WORKSPACE_COMPOSED: 'WORKSPACE_COMPOSED',
  COMPLETED: 'COMPLETED'
});

export const SIGNAL_CATEGORIES = Object.freeze([
  'WORK_DOMAIN', 'RESPONSIBILITY', 'ACTION', 'DECISION', 'TOOL', 'WORKFLOW',
  'SCALE', 'ENVIRONMENT', 'SUPERVISION', 'EVIDENCE'
]);

export const SIGNAL_SOURCES = Object.freeze([
  'DIRECT_USER_SIGNAL', 'FOLLOW_UP_ANSWER', 'IMPLIED_BY_CAPABILITY', 'DEPENDENCY',
  'WORK_CONTEXT', 'WORKFLOW_CONTEXT', 'DESIGNATION_CONFIRMATION',
  'EXTERNAL_VERIFICATION', 'ADMIN_ASSIGNED', 'MIGRATED_LEGACY'
]);

const ACTION_PATTERNS = [
  { phrase: /\bnever perform (?:laboratory )?testing\b/i, capability: 'TEST_EXECUTION', polarity: 'NEGATIVE' },
  { phrase: /\bmanage(?:\s+(?:my own|my|our|own))?\s+(?:around\s+\d+\s+)?hives?\b/i, capability: 'HIVE_MANAGEMENT' },
  { phrase: /\bprocess(?:ing)? (?:the )?honey\b/i, capability: 'PROCESSING_MANAGEMENT' },
  { phrase: /\b(?:inspect|check)\s+(?:my\s+)?(?:hives?|colonies|frames)\b|\binspect them weekly\b/i, capability: 'HIVE_INSPECTION' },
  { phrase: /\brecord (?:hive )?observations\b|\bwrite (?:field )?observations\b/i, capability: 'BEE_OBSERVATION' },
  { phrase: /\bcapture (?:hive )?images\b|\btake (?:hive )?photos\b/i, capability: 'HIVE_IMAGE_CAPTURE' },
  { phrase: /\b(?:run|perform|execute) (?:laboratory |lab )?tests?\b/i, capability: 'TEST_EXECUTION' },
  { phrase: /\breceive (?:incoming )?(?:lab )?samples?\b/i, capability: 'SAMPLE_INTAKE' },
  { phrase: /\brecord (?:test )?results\b|\benter (?:test )?results\b/i, capability: 'TEST_RESULT_ENTRY' },
  { phrase: /\breview (?:the |test )?results?\b|\breview them\b/i, capability: 'RESULT_REVIEW' },
  { phrase: /\breceive (?:incoming )?(?:harvested )?(?:honey|material|batches|lots)\b|\bintake (?:harvested )?(?:honey|batches|lots)\b/i, capability: 'BATCH_INTAKE' },
  { phrase: /\brecord (?:every )?processing (?:steps?|stages?)\b|\blog (?:the )?processing steps\b/i, capability: 'PROCESSING_STEP_RECORD' },
  { phrase: /\bcapture (?:processing )?evidence\b|\battach (?:processing )?evidence\b/i, capability: 'PROCESSING_EVIDENCE' },
  { phrase: /\bcomplete (?:processing )?batches\b|\bcomplete the batches\b/i, capability: 'PROCESSING_COMPLETION' },
  { phrase: /\b(?:collect|harvest) honey\b|\bcollect honey during harvest\b/i, capability: 'HONEY_COLLECTION' },
  { phrase: /\b(?:plan|prepare|create) (?:the )?(?:dispatches|shipments)\b|\bprepare shipments\b/i, capability: 'DISPATCH_PLANNING' },
  { phrase: /\bscan (?:package )?qr codes?\b|\bvalidate package qr\b/i, capability: 'PACKAGE_QR_VALIDATE' },
  { phrase: /\btrack deliveries\b|\btrack (?:the )?shipments\b/i, capability: 'DELIVERY_TRACKING' },
  { phrase: /\b(?:generate|issue) (?:a )?(?:coa|certificate of analysis|certificates?)\b/i, capability: 'CERTIFICATE_GENERATION' },
  { phrase: /\bpackage (?:and seal )?(?:honey|products?)\b|\bhandle packaging\b/i, capability: 'PACKAGE_HONEY' },
  { phrase: /\bverify traceability\b|\bverify (?:the )?(?:product )?provenance\b/i, capability: 'TRACEABILITY_VERIFICATION' },
  { phrase: /\b(?:audit|review) (?:the )?(?:(?:field|workflow) )?records\b|\binspect field records\b/i, capability: 'RECORD_AUDITING' },
  { phrase: /\bsupervise (?:operators|workers|staff|team members)\b|\bmanage (?:the )?(?:operators|workers|staff)\b/i, capability: 'TEAM_SUPERVISION' },
  { phrase: /\bmanage (?:the )?inventory\b|\bcontrol stock\b/i, capability: 'INVENTORY_MANAGEMENT' }
];

const DOMAIN_PATTERNS = [
  { phrase: /\b(?:hives?|colonies|apiary|apiaries)\b/i, value: 'FIELD' },
  { phrase: /\bhoney\b/i, value: 'HONEY' },
  { phrase: /\b(?:laboratory|laboratories|\blab\b)\b/i, value: 'QUALITY' },
  { phrase: /\b(?:dispatch|shipments?|deliveries|distributor)\b/i, value: 'FULFILLMENT' },
  { phrase: /\bpackaging\b/i, value: 'PRODUCTION' }
];

const QUESTION_BY_DOMAIN = {
  FIELD: {
    id: 'clarify_field_actions',
    title: 'What do you usually do with the hives?',
    options: ['Inspect colonies', 'Record observations', 'Capture images', 'Monitor connected sensors', 'Collect honey'],
    distinguishes: ['HIVE_INSPECTION', 'BEE_OBSERVATION', 'HIVE_IMAGE_CAPTURE', 'CONNECTED_HIVE_MONITORING', 'HONEY_COLLECTION']
  },
  HONEY: {
    id: 'clarify_honey_work',
    title: 'What do you do with the honey?',
    options: ['Collect it', 'Receive incoming batches', 'Record processing steps', 'Package products', 'Hand it off to another team'],
    distinguishes: ['HONEY_COLLECTION', 'BATCH_INTAKE', 'PROCESSING_STEP_RECORD', 'PACKAGE_HONEY', 'PACKAGING_HANDOFF']
  },
  QUALITY: {
    id: 'clarify_quality_work',
    title: 'Which parts of laboratory work do you personally handle?',
    options: ['Receive samples', 'Run tests', 'Record results', 'Review results'],
    distinguishes: ['SAMPLE_INTAKE', 'TEST_EXECUTION', 'TEST_RESULT_ENTRY', 'RESULT_REVIEW']
  },
  FULFILLMENT: {
    id: 'clarify_fulfillment_work',
    title: 'Which delivery tasks do you handle yourself?',
    options: ['Plan shipments', 'Scan package QR codes', 'Track deliveries', 'Confirm delivery'],
    distinguishes: ['DISPATCH_PLANNING', 'PACKAGE_QR_VALIDATE', 'DELIVERY_TRACKING', 'DELIVERY_CONFIRMATION']
  }
};

let signalSequence = 0;

export const createOnboardingSignal = ({
  category,
  value,
  source = 'DIRECT_USER_SIGNAL',
  confidenceInternal = 1,
  questionId = null,
  answerId = null,
  evidence = 'Structured work signal captured',
  polarity = 'POSITIVE'
}) => {
  if (!SIGNAL_CATEGORIES.includes(category)) throw new Error(`Unsupported signal category: ${category}`);
  if (!SIGNAL_SOURCES.includes(source)) throw new Error(`Unsupported signal source: ${source}`);
  return {
    signalId: `sig-${Date.now()}-${++signalSequence}`,
    category,
    value,
    source,
    confidenceInternal,
    timestamp: new Date().toISOString(),
    questionId,
    answerId,
    evidence,
    polarity
  };
};

const isNegated = (text, matchIndex) => {
  const prefix = text.slice(Math.max(0, matchIndex - 42), matchIndex);
  return /\b(?:never|don't|dont|do not|doesn't|does not|not personally)\s+(?:personally\s+)?(?:perform\s+|run\s+|execute\s+)?$/i.test(prefix);
};

const matchedActionSignals = (text, options) => ACTION_PATTERNS.flatMap(rule => {
  const match = rule.phrase.exec(text);
  if (!match) return [];
  const polarity = rule.polarity || (isNegated(text, match.index) ? 'NEGATIVE' : 'POSITIVE');
  return [createOnboardingSignal({
    category: 'ACTION',
    value: rule.capability,
    source: options.source,
    questionId: options.questionId,
    answerId: options.answerId,
    polarity,
    evidence: 'Matched a specific work activity'
  })];
});

export const OnboardingIntelligenceService = {
  interpretAnswer(answer, context = {}) {
    const text = typeof answer === 'string' ? answer : '';
    const source = context.questionId ? 'FOLLOW_UP_ANSWER' : 'DIRECT_USER_SIGNAL';
    const signalOptions = { source, questionId: context.questionId || null, answerId: context.answerId || null };
    const signals = matchedActionSignals(text, signalOptions);

    DOMAIN_PATTERNS.forEach(rule => {
      if (rule.phrase.test(text)) {
        signals.push(createOnboardingSignal({
          ...signalOptions,
          category: 'WORK_DOMAIN',
          value: rule.value,
          evidence: 'Work area explicitly mentioned'
        }));
      }
    });

    if (/\bonly review (?:the )?(?:test )?results?\b/i.test(text)) {
      signals.push(createOnboardingSignal({
        ...signalOptions,
        category: 'ACTION',
        value: 'TEST_EXECUTION',
        polarity: 'NEGATIVE',
        evidence: 'User distinguished review from personally running tests'
      }));
    }

    if (/\b(?:camera|photos?)\b/i.test(text)) signals.push(createOnboardingSignal({ ...signalOptions, category: 'TOOL', value: 'CAMERA' }));
    if (/\b(?:qr scanner|scanner)\b/i.test(text)) signals.push(createOnboardingSignal({ ...signalOptions, category: 'TOOL', value: 'QR_SCANNER' }));
    if (/\b(?:lab instrument|laboratory instrument|refractometer)\b/i.test(text)) signals.push(createOnboardingSignal({ ...signalOptions, category: 'TOOL', value: 'LAB_INSTRUMENT' }));
    if (/\b(?:supervise|supervisor|manage a team)\b/i.test(text)) signals.push(createOnboardingSignal({ ...signalOptions, category: 'SUPERVISION', value: 'TEAM_SUPERVISION' }));
    if (/\b(?:occasionally|regularly|entire process|supervise others)\b/i.test(text)) {
      const scale = /\boccasionally\b/i.test(text) ? 'OCCASIONAL'
        : /\bregularly\b/i.test(text) ? 'REGULAR'
          : /\bentire process\b/i.test(text) ? 'PROCESS_OWNER'
            : 'SUPERVISES_OTHERS';
      signals.push(createOnboardingSignal({ ...signalOptions, category: 'SCALE', value: scale }));
    }

    if (/\b(?:accept|reject|hold|approve|release)\b/i.test(text)) {
      signals.push(createOnboardingSignal({ ...signalOptions, category: 'DECISION', value: 'WORKFLOW_DECISION', evidence: 'Decision responsibility mentioned; no authority inferred' }));
    }

    const positiveCapabilities = new Set(signals.filter(signal => signal.category === 'ACTION' && signal.polarity === 'POSITIVE').map(signal => signal.value));
    const negativeCapabilities = new Set(signals.filter(signal => signal.category === 'ACTION' && signal.polarity === 'NEGATIVE').map(signal => signal.value));
    const contradictions = [...positiveCapabilities].filter(capability => negativeCapabilities.has(capability)).map(capability => ({
      capability,
      question: capability === 'TEST_EXECUTION'
        ? 'Just to clarify, do you personally perform laboratory tests, or do you only review the results?'
        : 'We heard two different things about this task. Do you personally perform it?'
    }));

    return { signals, contradictions };
  },

  extractWorkSignals(signals = []) { return signals.filter(signal => signal.category === 'WORK_DOMAIN'); },
  extractActionSignals(signals = []) { return signals.filter(signal => signal.category === 'ACTION'); },
  extractResponsibilitySignals(signals = []) { return signals.filter(signal => signal.category === 'RESPONSIBILITY'); },
  extractDecisionSignals(signals = []) { return signals.filter(signal => signal.category === 'DECISION'); },
  extractToolSignals(signals = []) { return signals.filter(signal => signal.category === 'TOOL'); },

  generateCapabilityCandidates(signals = []) {
    const negative = new Set(signals
      .filter(signal => signal.category === 'ACTION' && signal.polarity === 'NEGATIVE')
      .map(signal => signal.value));
    const explicitIds = Array.from(new Set(signals
      .filter(signal => signal.category === 'ACTION' && signal.polarity === 'POSITIVE' && !negative.has(signal.value) && CAPABILITY_MAP.has(signal.value))
      .map(signal => signal.value)));
    const graphResult = CapabilityRegistry.resolveCapabilityDependencies(explicitIds);
    const candidates = graphResult.resolved.flatMap(capabilityId => {
      const capability = CAPABILITY_MAP.get(capabilityId);
      if (!capability || ['SYSTEM_ONLY', 'PRIVILEGED'].includes(capability.capabilityClass)) return [];
      const isExplicit = explicitIds.includes(capabilityId);
      const requiresVerification = capability.verificationRequired || capability.capabilityClass === 'VERIFICATION_REQUIRED';
      return [{
        capabilityId,
        source: isExplicit ? signals.find(signal => signal.value === capabilityId && signal.polarity === 'POSITIVE')?.source || 'DIRECT_USER_SIGNAL' : 'DEPENDENCY',
        status: requiresVerification ? 'VERIFICATION_REQUIRED' : 'CANDIDATE',
        evidence: isExplicit ? 'Supported by a specific user-described activity' : 'Required by another candidate capability',
        confidenceInternal: isExplicit ? 0.9 : 1,
        supportingSignals: signals.filter(signal => signal.value === capabilityId && signal.polarity === 'POSITIVE').map(signal => signal.signalId)
      }];
    });

    return { candidates, unknown: graphResult.unknown };
  },

  detectAmbiguity(signals = []) {
    const mentionedDomains = this.extractWorkSignals(signals).map(signal => signal.value);
    const concreteActions = this.extractActionSignals(signals).filter(signal => signal.polarity === 'POSITIVE');
    const seen = new Set();
    return mentionedDomains.filter(domain => {
      if (seen.has(domain)) return false;
      seen.add(domain);
      return !concreteActions.some(signal => CAPABILITY_MAP.get(signal.value)?.domains.includes(domain));
    });
  },

  explainInference(candidate, signals = []) {
    const capability = CAPABILITY_MAP.get(candidate.capabilityId);
    if (!capability) return null;
    if (candidate.source === 'DEPENDENCY') return `${capability.name} is needed for another work activity you described.`;
    const domains = signals.filter(signal => signal.value === candidate.capabilityId && signal.category === 'ACTION');
    return domains.length ? `You described work that includes ${capability.name.toLowerCase()}.` : capability.name;
  },

  generateFollowUpQuestion(context = {}) {
    const { signals = [], contradictions = [], questionCount = 0, askedQuestionIds = [] } = context;
    if (contradictions.length > 0) {
      return { id: 'clarify_contradiction', title: contradictions[0].question, multiSelect: false, distinguishes: [contradictions[0].capability], reason: 'Resolve conflicting statements before updating candidates.' };
    }
    if (questionCount >= 4) return null;
    const domain = this.detectAmbiguity(signals)[0];
    const question = QUESTION_BY_DOMAIN[domain];
    if (!question || askedQuestionIds.includes(question.id)) return null;
    return { ...question, multiSelect: true, reason: 'This answer determines which capabilities match the work you described.' };
  },

  evaluateSession({ signals = [], questionCount = 0, askedQuestionIds = [], confirmed = false } = {}) {
    const actionSignals = this.extractActionSignals(signals);
    const positive = new Set(actionSignals.filter(signal => signal.polarity === 'POSITIVE').map(signal => signal.value));
    const negative = new Set(actionSignals.filter(signal => signal.polarity === 'NEGATIVE').map(signal => signal.value));
    const contradictions = [...positive].filter(id => negative.has(id)).map(capability => ({
      capability,
      question: capability === 'TEST_EXECUTION'
        ? 'Just to clarify, do you personally perform laboratory tests, or do you only review the results?'
        : 'We heard two different things about this task. Do you personally perform it?'
    }));
    const { candidates, unknown } = this.generateCapabilityCandidates(signals);
    const designationResult = evaluateCanonicalDesignationEligibility(candidates.map(candidate => candidate.capabilityId));
    const nextQuestion = this.generateFollowUpQuestion({ signals, contradictions, questionCount, askedQuestionIds });
    const verificationRequired = candidates.filter(candidate => candidate.status === 'VERIFICATION_REQUIRED').map(candidate => candidate.capabilityId);
    const candidateCapabilities = candidates.filter(candidate => candidate.status === 'CANDIDATE').map(candidate => candidate.capabilityId);
    const state = contradictions.length ? ONBOARDING_STATES.CLARIFICATION_REQUIRED
      : nextQuestion ? ONBOARDING_STATES.SIGNALS_COLLECTING
        : candidates.length ? ONBOARDING_STATES.CAPABILITY_PROFILE_READY
          : ONBOARDING_STATES.SIGNALS_COLLECTING;

    return {
      capabilities: [],
      candidateCapabilities,
      candidateDetails: candidates,
      verificationRequired,
      designations: designationResult.suggestions.map(result => ({
        id: result.designationId,
        name: result.name,
        state: result.eligibilityState,
        matchedCapabilities: result.matchedCapabilities,
        explanations: result.explanations,
        verificationRequirements: result.verificationRequirements
      })),
      designationEligibility: designationResult.evaluations,
      missingInformation: nextQuestion ? [nextQuestion.reason] : [],
      nextQuestion,
      workspacePreview: { domains: Array.from(new Set(candidates.map(candidate => CAPABILITY_MAP.get(candidate.capabilityId)?.domain).filter(Boolean))) },
      explanations: candidates.map(candidate => ({ capabilityId: candidate.capabilityId, explanation: this.explainInference(candidate, signals) })),
      policyVersion: CAPABILITY_POLICY_VERSION,
      onboardingVersion: ONBOARDING_ENGINE_VERSION,
      state: confirmed ? ONBOARDING_STATES.CONFIRMED : state,
      unknownCapabilities: unknown,
      events: candidates.map(candidate => ({ eventType: candidate.source === 'DEPENDENCY' ? 'CAPABILITY_IMPLIED' : 'CAPABILITY_CANDIDATE_CREATED', capabilityId: candidate.capabilityId }))
    };
  }
};