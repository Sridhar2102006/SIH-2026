/**
 * HoneyChain Adaptive Onboarding Engine
 *
 * Provides a conversational, question-driven capability discovery and
 * workspace synthesis engine that feels genuinely intelligent without
 * relying on an uncontrolled LLM.
 *
 * Flow:
 * Question -> Answer Signal -> Capability Inference -> Conflict & Dependency Resolution
 * -> Natural Designation Suggestions -> Workspace Summary Preview -> User Confirmation
 */

import { CapabilityRegistry } from './capabilityRegistry.js';
import { resolveVisualProfile } from './workspaceVisualIdentityService.js';
import { composeNavigation } from './workspaceNavigationComposer.js';

export const ONBOARDING_ROOT_OPTIONS = [
  {
    id: 'hives_colonies',
    label: 'Bee colonies & apiaries',
    description: 'Manage hives, inspect frames, and check colony health',
    family: 'BEEKEEPER'
  },
  {
    id: 'harvest_extraction',
    label: 'Honey extraction & processing',
    description: 'Intake harvested honey, settle/filter batches, and track lots',
    family: 'PROCESSOR'
  },
  {
    id: 'lab_testing',
    label: 'Laboratory testing & quality',
    description: 'Test honey purity, analyze moisture/HMF, and approve COAs',
    family: 'LAB'
  },
  {
    id: 'dispatch_logistics',
    label: 'Shipment dispatch & distribution',
    description: 'Manage packaged shipments, plan delivery routes, and track drivers',
    family: 'DISTRIBUTOR'
  }
];

export const OnboardingEngine = {
  /**
   * Root Question
   */
  getRootQuestion() {
    return {
      id: 'root_work_focus',
      title: 'What do you work with primarily?',
      subtitle: 'Select one or more areas of your day-to-day operations',
      multiSelect: true,
      options: ONBOARDING_ROOT_OPTIONS
    };
  },

  /**
   * Dynamically determines the next question based on answers gathered so far.
   */
  getNextQuestion(answersSoFar = {}) {
    const rootSelections = answersSoFar.root_work_focus || [];

    // 1. Beekeeper Branching
    if (rootSelections.includes('hives_colonies')) {
      if (!answersSoFar.beekeeper_field_tasks) {
        return {
          id: 'beekeeper_field_tasks',
          title: 'What do you do with your hives?',
          subtitle: 'Select all regular activities in the field',
          multiSelect: true,
          options: [
            { id: 'inspect_colonies', label: 'Inspect colonies & frames', triggers: ['HIVE_INSPECTION', 'HIVE_MANAGEMENT'] },
            { id: 'record_observations', label: 'Record observations & brood notes', triggers: ['BEE_OBSERVATION'] },
            { id: 'bee_health_scan', label: 'Check for queen/pest issues (Varroa/Foulbrood)', triggers: ['BEE_HEALTH_SCAN', 'EVIDENCE_CAPTURE'] },
            { id: 'connected_sensors', label: 'Monitor hives using connected temperature/sound sensors', triggers: ['CONNECTED_HIVE_MONITORING'] },
            { id: 'harvest_honey', label: 'Harvest honey super frames', triggers: ['HONEY_COLLECTION'] }
          ]
        };
      }

      // Cross-designation discovery: If user harvests honey, ask about processing
      const beekeeperTasks = answersSoFar.beekeeper_field_tasks || [];
      if (beekeeperTasks.includes('harvest_honey') && answersSoFar.beekeeper_processes_honey === undefined) {
        return {
          id: 'beekeeper_processes_honey',
          title: 'Do you process the honey after collection?',
          subtitle: 'Extraction, settling, and batch preparation on-site or in facility',
          multiSelect: false,
          options: [
            { id: 'yes', label: 'Yes, I extract and prepare honey batches', triggers: ['PROCESSING_MANAGEMENT', 'COLLECTION_BATCH_LINK', 'BATCH_INTAKE'] },
            { id: 'no', label: 'No, I hand off raw harvest frames to a processor', triggers: ['HONEY_COLLECTION'] }
          ]
        };
      }
    }

    // 2. Processor Branching
    if (rootSelections.includes('harvest_extraction') || answersSoFar.beekeeper_processes_honey === 'yes') {
      if (!answersSoFar.processor_operations) {
        return {
          id: 'processor_operations',
          title: 'What processing operations do you manage?',
          subtitle: 'Configure your processing workspace workflows',
          multiSelect: true,
          options: [
            { id: 'intake_batches', label: 'Intake and log raw harvest batches', triggers: ['BATCH_INTAKE', 'PROCESSING_MANAGEMENT'] },
            { id: 'record_steps', label: 'Record temperature, filtration, and settling steps', triggers: ['PROCESSING_STEP_RECORD', 'PROCESSING_PARAMETERS'] },
            { id: 'capture_evidence', label: 'Capture photos and batch processing evidence', triggers: ['PROCESSING_EVIDENCE'] },
            { id: 'split_merge', label: 'Split large batches or merge extraction runs', triggers: ['BATCH_SPLIT_MERGE'] },
            { id: 'quality_handoff', label: 'Prepare batches for lab sampling & testing handoff', triggers: ['QUALITY_HANDOFF'] },
            { id: 'packaging_handoff', label: 'Prepare bulk tanks for bottling / packaging handoff', triggers: ['PACKAGING_HANDOFF'] }
          ]
        };
      }
    }

    // 3. Laboratory / Quality Branching
    if (rootSelections.includes('lab_testing')) {
      if (!answersSoFar.lab_responsibilities) {
        return {
          id: 'lab_responsibilities',
          title: 'What is your laboratory testing responsibility?',
          subtitle: 'Select your level of quality authority and analytical scope',
          multiSelect: true,
          options: [
            { id: 'sample_intake', label: 'Sample intake, custody verification, and test assignment', triggers: ['LAB_WORKSPACE', 'SAMPLE_INTAKE', 'SAMPLE_IDENTIFICATION'] },
            { id: 'execute_tests', label: 'Execute tests (moisture, HMF, pollen, adulteration)', triggers: ['TEST_EXECUTION', 'TEST_RESULT_ENTRY', 'RESULT_EVIDENCE'] },
            { id: 'review_approve', label: 'Review results and make formal quality recommendations', triggers: ['RESULT_REVIEW', 'QUALITY_RECOMMENDATION'] },
            { id: 'generate_coa', label: 'Generate Certificate of Analysis (COA) reports', triggers: ['REPORT_GENERATION', 'CERTIFICATE_GENERATION'] }
          ]
        };
      }
    }

    // 4. Dispatch / Distributor Branching
    if (rootSelections.includes('dispatch_logistics')) {
      if (!answersSoFar.distributor_tasks) {
        return {
          id: 'distributor_tasks',
          title: 'What distribution tasks do you handle?',
          subtitle: 'Select your logistics and fulfillment responsibilities',
          multiSelect: true,
          options: [
            { id: 'plan_dispatches', label: 'Create dispatches & allocate packaged batches', triggers: ['DISPATCH_PLANNING', 'SHIPMENT_CREATE'] },
            { id: 'plan_routes', label: 'Optimize delivery routes and multi-stop shipments', triggers: ['ROUTE_PLANNING', 'MULTI_STOP_DISPATCH'] },
            { id: 'assign_drivers', label: 'Assign transport drivers and dispatch vehicles', triggers: ['TRANSPORT_MANAGEMENT', 'DRIVER_ASSIGNMENT'] },
            { id: 'track_deliveries', label: 'Track shipments and confirm digital Proof of Delivery', triggers: ['DELIVERY_TRACKING', 'DELIVERY_CONFIRMATION', 'PROOF_OF_DELIVERY'] },
            { id: 'manage_exceptions', label: 'Handle shipment exceptions and return workflows', triggers: ['DELIVERY_EXCEPTION_MANAGEMENT', 'RETURN_MANAGEMENT'] }
          ]
        };
      }
    }

    // No further questions required - ready for synthesis
    return null;
  },

  /**
   * Infers raw capabilities from all collected answers.
   */
  inferCapabilities(answers = {}) {
    const inferred = new Set();

    // Check all answers against triggers
    const rootSelections = answers.root_work_focus || [];
    if (rootSelections.includes('hives_colonies')) {
      inferred.add('HIVE_MANAGEMENT');
    }
    if (rootSelections.includes('harvest_extraction')) {
      inferred.add('PROCESSING_MANAGEMENT');
      inferred.add('BATCH_TRACEABILITY');
    }
    if (rootSelections.includes('lab_testing')) {
      inferred.add('LAB_WORKSPACE');
    }
    if (rootSelections.includes('dispatch_logistics')) {
      inferred.add('DISPATCH_PLANNING');
      inferred.add('DISTRIBUTION_WORKSPACE');
    }

    // Map answer options
    const optionQuestionKeys = [
      'beekeeper_field_tasks',
      'processor_operations',
      'lab_responsibilities',
      'distributor_tasks'
    ];

    optionQuestionKeys.forEach(key => {
      const selected = answers[key] || [];
      selected.forEach(optId => {
        // Find matching option triggers
        const nextQ = this.getNextQuestion({ root_work_focus: rootSelections });
        // Direct map
        if (optId === 'inspect_colonies') { inferred.add('HIVE_INSPECTION'); inferred.add('HIVE_MANAGEMENT'); }
        if (optId === 'record_observations') { inferred.add('BEE_OBSERVATION'); }
        if (optId === 'bee_health_scan') { inferred.add('BEE_HEALTH_SCAN'); inferred.add('EVIDENCE_CAPTURE'); }
        if (optId === 'connected_sensors') { inferred.add('CONNECTED_HIVE_MONITORING'); }
        if (optId === 'harvest_honey') { inferred.add('HONEY_COLLECTION'); }

        if (optId === 'intake_batches') { inferred.add('BATCH_INTAKE'); inferred.add('PROCESSING_MANAGEMENT'); }
        if (optId === 'record_steps') { inferred.add('PROCESSING_STEP_RECORD'); inferred.add('PROCESSING_PARAMETERS'); }
        if (optId === 'capture_evidence') { inferred.add('PROCESSING_EVIDENCE'); }
        if (optId === 'split_merge') { inferred.add('BATCH_SPLIT_MERGE'); }
        if (optId === 'quality_handoff') { inferred.add('QUALITY_HANDOFF'); }
        if (optId === 'packaging_handoff') { inferred.add('PACKAGING_HANDOFF'); }

        if (optId === 'sample_intake') { inferred.add('LAB_WORKSPACE'); inferred.add('SAMPLE_INTAKE'); inferred.add('SAMPLE_IDENTIFICATION'); }
        if (optId === 'execute_tests') { inferred.add('TEST_EXECUTION'); inferred.add('TEST_RESULT_ENTRY'); inferred.add('RESULT_EVIDENCE'); }
        if (optId === 'review_approve') { inferred.add('RESULT_REVIEW'); inferred.add('QUALITY_RECOMMENDATION'); }
        if (optId === 'generate_coa') { inferred.add('REPORT_GENERATION'); inferred.add('CERTIFICATE_GENERATION'); }

        if (optId === 'plan_dispatches') { inferred.add('DISPATCH_PLANNING'); inferred.add('SHIPMENT_CREATE'); }
        if (optId === 'plan_routes') { inferred.add('ROUTE_PLANNING'); inferred.add('MULTI_STOP_DISPATCH'); }
        if (optId === 'assign_drivers') { inferred.add('TRANSPORT_MANAGEMENT'); inferred.add('DRIVER_ASSIGNMENT'); }
        if (optId === 'track_deliveries') { inferred.add('DELIVERY_TRACKING'); inferred.add('DELIVERY_CONFIRMATION'); inferred.add('PROOF_OF_DELIVERY'); }
        if (optId === 'manage_exceptions') { inferred.add('DELIVERY_EXCEPTION_MANAGEMENT'); inferred.add('RETURN_MANAGEMENT'); }
      });
    });

    if (answers.beekeeper_processes_honey === 'yes') {
      inferred.add('PROCESSING_MANAGEMENT');
      inferred.add('COLLECTION_BATCH_LINK');
      inferred.add('BATCH_INTAKE');
      inferred.add('PROCESSING_STEP_RECORD');
    }

    // Resolve dependencies through capability graph
    return CapabilityRegistry.resolveImpliedCapabilities(Array.from(inferred));
  },

  /**
   * Conflict Detection (§ 40)
   */
  detectConflicts(capabilities = []) {
    const conflicts = [];
    const capSet = new Set(capabilities);

    // Policy Rule: A pure driver cannot approve quality results or release batches without lab qualifications
    if (capSet.has('DRIVER_ASSIGNMENT') && capSet.has('RESULT_REVIEW') && !capSet.has('LAB_WORKSPACE')) {
      conflicts.push({
        type: 'CONFLICT_REQUIRES_REVIEW',
        message: 'Driver assignment and laboratory result review require distinct authorized credentials.'
      });
    }

    return conflicts;
  },

  /**
   * Suggests human designations based on inferred capabilities with clear reasoning.
   */
  suggestDesignations(capabilities = [], answers = {}) {
    const capSet = new Set(capabilities);
    const suggestions = [];

    // Beekeeper
    if (capSet.has('HIVE_MANAGEMENT') || capSet.has('HIVE_INSPECTION')) {
      const reasons = [];
      if (capSet.has('HIVE_MANAGEMENT')) reasons.push('manage hives and apiaries');
      if (capSet.has('HIVE_INSPECTION')) reasons.push('inspect colonies and frames');
      if (capSet.has('BEE_HEALTH_SCAN')) reasons.push('screen for pests and brood health');
      if (capSet.has('HONEY_COLLECTION')) reasons.push('harvest honey supers');

      suggestions.push({
        id: 'BEEKEEPER',
        name: 'Beekeeper',
        badge: 'Apiary Operations',
        summary: 'You manage bee colonies, monitor colony health, and record inspections.',
        reasons,
        isPrimary: true
      });
    }

    // Processor
    if (capSet.has('PROCESSING_MANAGEMENT') || capSet.has('PROCESSING_STEP_RECORD')) {
      const reasons = [];
      if (capSet.has('BATCH_INTAKE')) reasons.push('intake harvested honey lots');
      if (capSet.has('PROCESSING_STEP_RECORD')) reasons.push('record settling and filtration steps');
      if (capSet.has('QUALITY_HANDOFF')) reasons.push('prepare lots for laboratory sampling');

      suggestions.push({
        id: 'PROCESSOR',
        name: 'Honey Processor',
        badge: 'Extraction & Processing',
        summary: 'You process harvested honey, maintain extraction parameters, and manage batch traceability.',
        reasons,
        isPrimary: suggestions.length === 0
      });
    }

    // Lab
    if (capSet.has('LAB_WORKSPACE') || capSet.has('SAMPLE_INTAKE') || capSet.has('TEST_EXECUTION')) {
      const reasons = [];
      if (capSet.has('SAMPLE_INTAKE')) reasons.push('manage sample intake and custody');
      if (capSet.has('TEST_EXECUTION')) reasons.push('conduct purity, moisture, and pollen tests');
      if (capSet.has('RESULT_REVIEW')) reasons.push('review and approve analytical results');

      suggestions.push({
        id: 'LAB_ANALYST',
        name: 'Laboratory Analyst',
        badge: 'Quality & Testing',
        summary: 'You conduct analytical testing on honey samples and record verification results.',
        reasons,
        isPrimary: suggestions.length === 0
      });
    }

    // Distributor
    if (capSet.has('DISPATCH_PLANNING') || capSet.has('SHIPMENT_CREATE')) {
      const reasons = [];
      if (capSet.has('SHIPMENT_CREATE')) reasons.push('create and allocate dispatches');
      if (capSet.has('ROUTE_PLANNING')) reasons.push('plan delivery routes');
      if (capSet.has('DELIVERY_TRACKING')) reasons.push('track shipments to destination');

      suggestions.push({
        id: 'DISTRIBUTOR',
        name: 'Distributor / Logistics',
        badge: 'Fulfillment & Transport',
        summary: 'You organize shipments, manage delivery routes, and verify proofs of delivery.',
        reasons,
        isPrimary: suggestions.length === 0
      });
    }

    return suggestions;
  },

  /**
   * Builds the pre-confirmation workspace preview (§ 28)
   */
  buildWorkspacePreview(capabilities = [], designations = []) {
    const primaryDesig = designations[0]?.id || 'BEEKEEPER';
    const visualProfile = resolveVisualProfile(capabilities, primaryDesig);
    const navigation = composeNavigation(capabilities, primaryDesig);

    // Group capabilities into core work and optional work
    const canDoList = [];
    const optionalWork = [];

    const capSet = new Set(capabilities);

    if (capSet.has('HIVE_MANAGEMENT')) canDoList.push('Manage hives and apiary yards');
    if (capSet.has('HIVE_INSPECTION')) canDoList.push('Perform colony frame inspections');
    if (capSet.has('BEE_HEALTH_SCAN')) canDoList.push('Scan frames for bee health and pests');
    if (capSet.has('CONNECTED_HIVE_MONITORING')) canDoList.push('Monitor live hive telemetry and sensors');
    if (capSet.has('HONEY_COLLECTION')) optionalWork.push('Harvest and record honey collections');

    if (capSet.has('PROCESSING_MANAGEMENT')) canDoList.push('Manage honey processing batches');
    if (capSet.has('PROCESSING_STEP_RECORD')) canDoList.push('Record extraction and filtration steps');
    if (capSet.has('QUALITY_HANDOFF')) optionalWork.push('Prepare batches for laboratory testing');

    if (capSet.has('SAMPLE_INTAKE')) canDoList.push('Receive and log laboratory samples');
    if (capSet.has('TEST_EXECUTION')) canDoList.push('Execute analytical honey tests');
    if (capSet.has('RESULT_REVIEW')) optionalWork.push('Review and approve test results');

    if (capSet.has('DISPATCH_PLANNING')) canDoList.push('Create dispatches and allocate packages');
    if (capSet.has('ROUTE_PLANNING')) optionalWork.push('Plan multi-stop delivery routes');
    if (capSet.has('DELIVERY_TRACKING')) canDoList.push('Track active deliveries and proof of delivery');

    return {
      primaryWork: designations[0]?.name || 'Beekeeping',
      designations: designations.map(d => d.name),
      canDoList,
      optionalWork,
      navigationPreview: navigation.map(n => n.label),
      visualProfile: {
        themeId: visualProfile.themeId,
        themeName: visualProfile.name,
        primaryColor: visualProfile.primaryColor
      }
    };
  }
};
