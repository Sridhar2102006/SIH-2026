/**
 * HONEYCHAIN — CANONICAL HONEY PROCESSING STEP CATALOG
 *
 * Grounded in Indian Food Processing & Apiculture Standards (FSSAI, Agmark, KVIC, ICAR).
 * Defines available canonical processing operations.
 *
 * Each step is configuration-driven data:
 * - defaultRequirement: 'MANDATORY' | 'OPTIONAL' | 'CONDITIONAL'
 * - conditionRule: evaluated against batch data
 * - parameterDefs: field definitions with unit, bounds, target, and authoritative origin
 */

import { RULE_ORIGIN_TYPES } from './regulatoryStandards.js';

export const CANONICAL_STEP_CATEGORIES = {
  INTAKE: { id: 'INTAKE', label: 'Intake & Source Verification' },
  PRIMARY: { id: 'PRIMARY', label: 'Primary Extraction & Separation' },
  REFINING: { id: 'REFINING', label: 'Filtration & De-waxing' },
  STABILIZATION: { id: 'STABILIZATION', label: 'Thermal & Moisture Control' },
  CLARIFICATION: { id: 'CLARIFICATION', label: 'Settling & Clarification' },
  QC_HANDOFF: { id: 'QC_HANDOFF', label: 'Quality Verification & Handoff' }
};

export const CANONICAL_PROCESSING_STEPS = [
  {
    key: 'RECEIVING',
    name: 'Harvest Intake Reception',
    shortLabel: 'Receiving',
    category: CANONICAL_STEP_CATEGORIES.INTAKE.id,
    defaultRequirement: 'MANDATORY',
    description: 'Formal reception of raw honey containers from beekeepers, cooperatives, or collection lots with seal verification.',
    allowedEquipmentTypes: ['Platform Weighing Scale', 'Pallet Truck', 'Barcode Scanner'],
    evidenceRequired: true,
    safetyNotes: 'Inspect container food-grade seal (SS 304/food-grade HDPE) and verify no hydrocarbon fuel or pesticide smell.',
    parameterDefs: [
      {
        key: 'receivedGrossWeightKg',
        label: 'Gross Weight (kg)',
        unit: 'kg',
        type: 'number',
        min: 0.5,
        max: 5000,
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      },
      {
        key: 'containerCount',
        label: 'Container / Canister Count',
        unit: 'units',
        type: 'number',
        min: 1,
        max: 200,
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      },
      {
        key: 'containerSealIntact',
        label: 'Security Seal / Traceability QR Intact',
        type: 'boolean',
        default: true,
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      }
    ]
  },
  {
    key: 'SOURCE_VERIFICATION',
    name: 'Upstream Source & Traceability Check',
    shortLabel: 'Verification',
    category: CANONICAL_STEP_CATEGORIES.INTAKE.id,
    defaultRequirement: 'MANDATORY',
    description: 'Immutable validation of upstream harvest codes (AP<N>H<N>F<N>) against apiary registry before batch integration.',
    allowedEquipmentTypes: ['QR Verification Terminal', 'Traceability Scanner'],
    evidenceRequired: false,
    safetyNotes: 'Prevents untracked or anonymous honey from entering the certified processing chain.',
    parameterDefs: [
      {
        key: 'verifiedSourceLotsCount',
        label: 'Verified Source Lots Linked',
        unit: 'lots',
        type: 'number',
        min: 1,
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      },
      {
        key: 'originAuthenticityConfirmed',
        label: 'Beekeeper & Apiary Origin Confirmed',
        type: 'boolean',
        default: true,
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      }
    ]
  },
  {
    key: 'INCOMING_INSPECTION',
    name: 'Incoming Physical & Sensory Inspection',
    shortLabel: 'Inspection',
    category: CANONICAL_STEP_CATEGORIES.INTAKE.id,
    defaultRequirement: 'MANDATORY',
    description: 'Observation of physical appearance, aroma, foam, comb cleanliness, and field refractometry.',
    allowedEquipmentTypes: ['Digital Honey Refractometer (Atago / Milwaukee)', 'Inspection Light Table', 'Stainless Sampling Spoon'],
    evidenceRequired: true,
    safetyNotes: 'Categorize observed symptoms as OBSERVED, REPORTED, or UNKNOWN. Do not invent diagnoses.',
    parameterDefs: [
      {
        key: 'initialMoisturePercent',
        label: 'Incoming Moisture (%)',
        unit: '%',
        type: 'number',
        min: 12.0,
        max: 28.0,
        target: 18.5,
        required: true,
        originType: RULE_ORIGIN_TYPES.REGULATORY_REQUIREMENT,
        validationRule: 'FSSAI Max 20.0% for certified direct bottling without dehumidification.'
      },
      {
        key: 'ambientTempC',
        label: 'Intake Bay Temperature (°C)',
        unit: '°C',
        type: 'number',
        min: 10,
        max: 45,
        target: 24,
        required: false,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      },
      {
        key: 'fermentationObservation',
        label: 'Fermentation Aroma / Gas Observation',
        type: 'select',
        options: ['NONE_OBSERVED', 'MILD_FERMENTATION_AROMA', 'HIGH_FOAM_ACTIVE_FERMENTATION', 'UNKNOWN'],
        default: 'NONE_OBSERVED',
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      },
      {
        key: 'foreignMaterialObservation',
        label: 'Foreign Material Observation',
        type: 'select',
        options: ['CLEAN_NATURAL_COMB', 'TRACES_OF_PROPOLIS_WAX', 'SMOKE_ASH_RESIDUE', 'FOREIGN_DEBRIS_SUSPECTED'],
        default: 'CLEAN_NATURAL_COMB',
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      }
    ]
  },
  {
    key: 'SAMPLING',
    name: 'Quality Lot Sampling Event',
    shortLabel: 'Sampling',
    category: CANONICAL_STEP_CATEGORIES.INTAKE.id,
    defaultRequirement: 'MANDATORY',
    description: 'Collection of composite sample (min 250g) in sterile amber container for laboratory quality screening.',
    allowedEquipmentTypes: ['Stainless Zone Honey Sampler', 'Sterile Sampling Jars (250ml)', 'Tamper-Evident Tape'],
    evidenceRequired: true,
    safetyNotes: 'Composite sample must be drawn from top, middle, and bottom of container for homogeneous representation.',
    parameterDefs: [
      {
        key: 'sampleWeightGrams',
        label: 'Sample Quantity (g)',
        unit: 'g',
        type: 'number',
        min: 100,
        max: 1000,
        target: 250,
        required: true,
        originType: RULE_ORIGIN_TYPES.ORGANIZATION_CONFIGURED
      },
      {
        key: 'sampleJarBarcode',
        label: 'Sample Container ID / Barcode',
        type: 'string',
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      }
    ]
  },
  {
    key: 'COARSE_STRAINING',
    name: 'Coarse Gravity Straining',
    shortLabel: 'Straining',
    category: CANONICAL_STEP_CATEGORIES.PRIMARY.id,
    defaultRequirement: 'MANDATORY',
    description: 'Initial cold pass through stainless steel food-grade screens to remove bee fragments, cappings, and gross wax particles.',
    allowedEquipmentTypes: ['Double Stainless Sieve (400/200 µm)', 'Rotary Honey Strainer', 'Gravity Straining Trough'],
    evidenceRequired: false,
    safetyNotes: 'Food contact surfaces must be SS 304/316. No galvanized metals.',
    parameterDefs: [
      {
        key: 'coarseMeshMicrons',
        label: 'Coarse Screen Mesh (microns)',
        unit: 'µm',
        type: 'number',
        min: 300,
        max: 1200,
        target: 500,
        required: true,
        originType: RULE_ORIGIN_TYPES.TECHNICAL_GUIDANCE
      },
      {
        key: 'honeyTempDuringStrainingC',
        label: 'Honey Temperature During Straining (°C)',
        unit: '°C',
        type: 'number',
        min: 18,
        max: 38,
        target: 26,
        required: false,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      }
    ]
  },
  {
    key: 'WARMING',
    name: 'Controlled Indirect Warming',
    shortLabel: 'Warming',
    category: CANONICAL_STEP_CATEGORIES.STABILIZATION.id,
    defaultRequirement: 'OPTIONAL',
    description: 'Gentle warming via thermostatically controlled water jacket or hot room to reduce viscosity. Temperature strictly capped <= 45°C.',
    allowedEquipmentTypes: ['Water-Jacketed Warming Tank', 'Thermal Chamber Room', 'Thermostatic Heating Blanket'],
    evidenceRequired: true,
    safetyNotes: 'CRITICAL: Never apply direct flame or immersion heating elements directly into honey. Overheating spikes HMF and kills diastase.',
    parameterDefs: [
      {
        key: 'targetHoneyTempC',
        label: 'Target Honey Temperature (°C)',
        unit: '°C',
        type: 'number',
        min: 25,
        max: 45,
        target: 38,
        required: true,
        originType: RULE_ORIGIN_TYPES.TECHNICAL_GUIDANCE,
        validationRule: 'Must not exceed 45.0°C to preserve natural enzymes.'
      },
      {
        key: 'waterJacketTempC',
        label: 'Jacket Heating Water Temp (°C)',
        unit: '°C',
        type: 'number',
        min: 30,
        max: 55,
        target: 44,
        required: true,
        originType: RULE_ORIGIN_TYPES.ORGANIZATION_CONFIGURED
      },
      {
        key: 'warmingDurationHours',
        label: 'Duration of Warming (hours)',
        unit: 'hrs',
        type: 'number',
        min: 1,
        max: 24,
        target: 6,
        required: true,
        originType: RULE_ORIGIN_TYPES.ORGANIZATION_CONFIGURED
      }
    ]
  },
  {
    key: 'LIQUEFACTION',
    name: 'Controlled Decrystallization Bath',
    shortLabel: 'Liquefaction',
    category: CANONICAL_STEP_CATEGORIES.STABILIZATION.id,
    defaultRequirement: 'OPTIONAL',
    description: 'Controlled hot-room or water bath to dissolve glucose crystals in crystallized cold honey prior to filtration.',
    allowedEquipmentTypes: ['Hot Room Cabinet', 'Drum Decrystallizing Chamber'],
    evidenceRequired: false,
    safetyNotes: 'Air circulation must be maintained to prevent localized hot spots.',
    parameterDefs: [
      {
        key: 'decrystallizationTempC',
        label: 'Chamber Temperature (°C)',
        unit: '°C',
        type: 'number',
        min: 35,
        max: 45,
        target: 40,
        required: true,
        originType: RULE_ORIGIN_TYPES.TECHNICAL_GUIDANCE
      },
      {
        key: 'timeToLiquefyHours',
        label: 'Liquefaction Duration (hours)',
        unit: 'hrs',
        type: 'number',
        min: 2,
        max: 36,
        target: 12,
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      }
    ]
  },
  {
    key: 'MOISTURE_REDUCTION',
    name: 'Low-Temperature Moisture Reduction',
    shortLabel: 'Moisture Reduction',
    category: CANONICAL_STEP_CATEGORIES.STABILIZATION.id,
    defaultRequirement: 'CONDITIONAL',
    conditionRule: 'incomingMoisture > 20.0',
    description: 'Low-temperature vacuum or dehumidified falling film moisture reduction when incoming honey exceeds 20.0% moisture.',
    allowedEquipmentTypes: ['Vacuum Evaporator / Honey Dehumidifier', 'Falling Film Evaporation Unit'],
    evidenceRequired: true,
    safetyNotes: 'Vacuum operating pressure must keep boiling point under 42°C to prevent scorching or carmelization.',
    parameterDefs: [
      {
        key: 'preMoisturePercent',
        label: 'Initial Moisture Before Processing (%)',
        unit: '%',
        type: 'number',
        min: 18.0,
        max: 28.0,
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      },
      {
        key: 'postMoisturePercent',
        label: 'Final Target Moisture Achieved (%)',
        unit: '%',
        type: 'number',
        min: 15.0,
        max: 20.0,
        target: 18.0,
        required: true,
        originType: RULE_ORIGIN_TYPES.REGULATORY_REQUIREMENT,
        validationRule: 'Must achieve <= 20.0% per FSSAI / Agmark Special.'
      },
      {
        key: 'operatingVacuumBar',
        label: 'Operating Vacuum Level (bar)',
        unit: 'bar',
        type: 'number',
        min: -0.9,
        max: -0.3,
        target: -0.7,
        required: false,
        originType: RULE_ORIGIN_TYPES.ORGANIZATION_CONFIGURED
      },
      {
        key: 'productTempDuringDehumidC',
        label: 'Product Temp During Dehumidification (°C)',
        unit: '°C',
        type: 'number',
        min: 30,
        max: 44,
        target: 38,
        required: true,
        originType: RULE_ORIGIN_TYPES.TECHNICAL_GUIDANCE
      }
    ]
  },
  {
    key: 'FINE_FILTRATION',
    name: 'Fine Mesh Filtration (Pollen-Preserving)',
    shortLabel: 'Fine Filtration',
    category: CANONICAL_STEP_CATEGORIES.REFINING.id,
    defaultRequirement: 'OPTIONAL',
    description: 'Secondary filtration through 100–200 µm screens. Pollen grains (15–60 µm) are intentionally preserved for floral authenticity.',
    allowedEquipmentTypes: ['SS Double Sieve 100/200 µm', 'Bag Filter Housing (Food Grade)', 'Cartridge Screen'],
    evidenceRequired: false,
    safetyNotes: 'Ultra-filtration or diatomaceous earth that strips natural pollen grains is strictly prohibited under FSSAI rules.',
    parameterDefs: [
      {
        key: 'fineMeshMicrons',
        label: 'Fine Filter Screen Size (microns)',
        unit: 'µm',
        type: 'number',
        min: 100,
        max: 300,
        target: 150,
        required: true,
        originType: RULE_ORIGIN_TYPES.TECHNICAL_GUIDANCE
      },
      {
        key: 'pumpPressureBar',
        label: 'Positive Transfer Pump Pressure (bar)',
        unit: 'bar',
        type: 'number',
        min: 0.1,
        max: 3.5,
        target: 1.0,
        required: false,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      }
    ]
  },
  {
    key: 'DE_WAXING',
    name: 'Wax & Propolis Separation',
    shortLabel: 'De-waxing',
    category: CANONICAL_STEP_CATEGORIES.REFINING.id,
    defaultRequirement: 'OPTIONAL',
    description: 'Removal of suspended micro-wax flakes and propolis gum to prevent haze in bottled honey.',
    allowedEquipmentTypes: ['Wax Separator Tank', 'Centrifugal Wax Separator', 'Cold Baffle Trough'],
    evidenceRequired: false,
    safetyNotes: 'Collected wax cappings must be segregated for cosmetic or foundation sheet recycling.',
    parameterDefs: [
      {
        key: 'recoveredWaxKg',
        label: 'Recovered Comb Wax Byproduct (kg)',
        unit: 'kg',
        type: 'number',
        min: 0,
        max: 200,
        required: false,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      }
    ]
  },
  {
    key: 'SETTLING',
    name: 'Clarification & Foam Settling Tank',
    shortLabel: 'Settling',
    category: CANONICAL_STEP_CATEGORIES.CLARIFICATION.id,
    defaultRequirement: 'MANDATORY',
    description: 'Standing resting period in jacketed or insulated food-grade tank for 24–72 hours to allow micro-air bubbles and wax froth to rise to the surface.',
    allowedEquipmentTypes: ['Settling Tank (300L/500L/1000L SS 304)', 'Holding Cistern', 'Conical Bottom Settling Vessel'],
    evidenceRequired: true,
    safetyNotes: 'Tank must remain covered with fine lint-free dust seal to prevent particulate entry while allowing air venting.',
    parameterDefs: [
      {
        key: 'settlingDurationHours',
        label: 'Settling Duration (hours)',
        unit: 'hrs',
        type: 'number',
        min: 12,
        max: 120,
        target: 48,
        required: true,
        originType: RULE_ORIGIN_TYPES.TECHNICAL_GUIDANCE,
        validationRule: 'Minimum 24 hours recommended for thorough clarification.'
      },
      {
        key: 'tankHoldingTempC',
        label: 'Tank Holding Room Temperature (°C)',
        unit: '°C',
        type: 'number',
        min: 18,
        max: 32,
        target: 23,
        required: true,
        originType: RULE_ORIGIN_TYPES.ORGANIZATION_CONFIGURED
      },
      {
        key: 'foamSkimmed',
        label: 'Top Surface Wax Froth Skimmed',
        type: 'boolean',
        default: true,
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      }
    ]
  },
  {
    key: 'BLENDING',
    name: 'Controlled Homogenization & Blending',
    shortLabel: 'Blending',
    category: CANONICAL_STEP_CATEGORIES.CLARIFICATION.id,
    defaultRequirement: 'OPTIONAL',
    description: 'Gentle low-shear paddle homogenization of complementary floral lots to achieve standardized sensory/moisture specs.',
    allowedEquipmentTypes: ['Slow-Speed Paddle Blending Tank (20-40 RPM)', 'Recirculation Sanitary Pump'],
    evidenceRequired: true,
    safetyNotes: 'All contributing source batches must be documented to maintain multi-source traceability.',
    parameterDefs: [
      {
        key: 'blendingSpeedRpm',
        label: 'Agitator Paddle Speed (RPM)',
        unit: 'RPM',
        type: 'number',
        min: 10,
        max: 60,
        target: 25,
        required: true,
        originType: RULE_ORIGIN_TYPES.TECHNICAL_GUIDANCE
      },
      {
        key: 'blendingDurationMin',
        label: 'Mixing Duration (minutes)',
        unit: 'min',
        type: 'number',
        min: 10,
        max: 180,
        target: 45,
        required: true,
        originType: RULE_ORIGIN_TYPES.ORGANIZATION_CONFIGURED
      }
    ]
  },
  {
    key: 'QUALITY_CHECK',
    name: 'Final Pre-Release Quality Inspection',
    shortLabel: 'Quality Check',
    category: CANONICAL_STEP_CATEGORIES.QC_HANDOFF.id,
    defaultRequirement: 'MANDATORY',
    description: 'Internal verification of finished clarity, moisture check, net volume, and deviation clearance prior to lab handoff.',
    allowedEquipmentTypes: ['Benchtop Digital Refractometer', 'Color Comparer / Pfund Grader', 'Platform Verification Scale'],
    evidenceRequired: true,
    safetyNotes: 'Batch cannot proceed to Quality Handoff if any critical process deviations remain unreviewed.',
    parameterDefs: [
      {
        key: 'finalMoisturePercent',
        label: 'Final Settled Moisture (%)',
        unit: '%',
        type: 'number',
        min: 14.0,
        max: 20.0,
        target: 17.8,
        required: true,
        originType: RULE_ORIGIN_TYPES.REGULATORY_REQUIREMENT,
        validationRule: 'Must be <= 20.0% for FSSAI compliance.'
      },
      {
        key: 'pfundColorMm',
        label: 'Pfund Color Score (mm)',
        unit: 'mm',
        type: 'number',
        min: 1,
        max: 140,
        required: false,
        originType: RULE_ORIGIN_TYPES.ORGANIZATION_CONFIGURED
      },
      {
        key: 'clarityVisual',
        label: 'Visual Clarity & Polish',
        type: 'select',
        options: ['EXCELLENT_CRYSTAL_CLEAR', 'SLIGHT_NATURAL_HAZE', 'CRYSTALLIZING_NATURAL', 'CLOUDY_NEEDS_MORE_SETTLING'],
        default: 'EXCELLENT_CRYSTAL_CLEAR',
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      }
    ]
  },
  {
    key: 'PACKAGING_PREPARATION',
    name: 'Yield Reconciliation & Packaging Ready',
    shortLabel: 'Packaging Prep',
    category: CANONICAL_STEP_CATEGORIES.QC_HANDOFF.id,
    defaultRequirement: 'MANDATORY',
    description: 'Tare weight reconciliation, calculation of process yield and loss percentage, marking batch ready for packaging queue.',
    allowedEquipmentTypes: ['Certified Platform Scale (Class III)', 'Sanitary Bottom Outlet Valve'],
    evidenceRequired: true,
    safetyNotes: 'Loss must be accounted for (pipe residue, skimming loss, wax cappings separation).',
    parameterDefs: [
      {
        key: 'netYieldKg',
        label: 'Final Net Yield Weight (kg)',
        unit: 'kg',
        type: 'number',
        min: 0.1,
        max: 10000,
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      },
      {
        key: 'processLossKg',
        label: 'Calculated Process Loss (kg)',
        unit: 'kg',
        type: 'number',
        min: 0,
        max: 200,
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      },
      {
        key: 'lossReason',
        label: 'Loss Category',
        type: 'select',
        options: ['NORMAL_TANK_FILTRATION_RESIDUE', 'WAX_FROTH_SKIMMING', 'SPILLAGE_ACCIDENTAL', 'OTHER'],
        default: 'NORMAL_TANK_FILTRATION_RESIDUE',
        required: true,
        originType: RULE_ORIGIN_TYPES.ACTUAL_PROCESS_EVENT
      }
    ]
  }
];

export const PROCESSING_STEP_CATALOG = CANONICAL_PROCESSING_STEPS.reduce((acc, step) => {
  acc[step.key] = step;
  return acc;
}, {});

export function getStepDefinition(stepKey) {
  return CANONICAL_PROCESSING_STEPS.find(s => s.key === stepKey) || null;
}
