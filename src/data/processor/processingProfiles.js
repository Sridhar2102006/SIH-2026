/**
 * HONEYCHAIN — INDIA PROCESSING PROFILES & STANDARD OPERATING PROCEDURES (SOP)
 *
 * Pre-configured, India-first processing profiles tailored to:
 * 1. Raw / Cold-Processed Honey (Artisanal, Organic, Small Farm)
 * 2. FPO / Cooperative Processing (Cluster aggregation, Gentle refinement)
 * 3. Commercial Retail Line (FSSAI / Agmark Grade A standard packaging)
 * 4. Export-Oriented Processing (EIC compliant, high-resolution traceability)
 * 5. Forest / Tribal Gathered Honey (TRIFED / Van Dhan Apis dorsata natural comb)
 */

export const PROCESSING_PROFILES = [
  {
    id: 'PROFILE_RAW_UNHEATED',
    code: 'RAW_UNHEATED',
    name: 'Raw Cold-Processed Honey (Artisanal / Organic)',
    tagline: 'Zero thermal damage, live enzymes and natural pollen preserved',
    description: 'Designed for single-source apiaries and natural honey producers. Gravity-fed or low-pressure cold straining, food-grade settling tank clarification, zero thermal degradation.',
    applicableProducts: ['Raw Wildflower Honey', 'Forest Multi-Floral', 'Mustard Raw Crystallized', 'Kashmir Acacia Raw'],
    targetMarkets: ['Domestic Organic Retail', 'Direct-to-Consumer', 'Artisanal Specialty'],
    defaultSopId: 'SOP-RAW-2026-V1',
    steps: [
      { stepKey: 'RECEIVING', requirement: 'MANDATORY', order: 1 },
      { stepKey: 'SOURCE_VERIFICATION', requirement: 'MANDATORY', order: 2 },
      { stepKey: 'INCOMING_INSPECTION', requirement: 'MANDATORY', order: 3 },
      { stepKey: 'SAMPLING', requirement: 'MANDATORY', order: 4 },
      { stepKey: 'COARSE_STRAINING', requirement: 'MANDATORY', order: 5 },
      { stepKey: 'SETTLING', requirement: 'MANDATORY', order: 6 },
      { stepKey: 'QUALITY_CHECK', requirement: 'MANDATORY', order: 7 },
      { stepKey: 'PACKAGING_PREPARATION', requirement: 'MANDATORY', order: 8 }
    ]
  },
  {
    id: 'PROFILE_FPO_COOPERATIVE',
    code: 'FPO_COOPERATIVE',
    name: 'FPO / Primary Cooperative Aggregation Line',
    tagline: 'Multi-village collection lot blending and hygienic stabilization',
    description: 'Standard operational model for Indian Farmer Producer Organizations (FPOs) and KVIC beekeeping co-operatives aggregating comb and bucket lots across multiple apiary clusters.',
    applicableProducts: ['FPO Blossom Honey', 'Village Cluster Multifloral', 'Neem Honey Blend'],
    targetMarkets: ['Domestic Bulk Wholesale', 'Cooperative Retail Stores', 'Institutional Buyers'],
    defaultSopId: 'SOP-FPO-2026-V2',
    steps: [
      { stepKey: 'RECEIVING', requirement: 'MANDATORY', order: 1 },
      { stepKey: 'SOURCE_VERIFICATION', requirement: 'MANDATORY', order: 2 },
      { stepKey: 'INCOMING_INSPECTION', requirement: 'MANDATORY', order: 3 },
      { stepKey: 'SAMPLING', requirement: 'MANDATORY', order: 4 },
      { stepKey: 'COARSE_STRAINING', requirement: 'MANDATORY', order: 5 },
      { stepKey: 'WARMING', requirement: 'OPTIONAL', order: 6, maxTempC: 40.0 },
      { stepKey: 'FINE_FILTRATION', requirement: 'MANDATORY', order: 7 },
      { stepKey: 'SETTLING', requirement: 'MANDATORY', order: 8 },
      { stepKey: 'QUALITY_CHECK', requirement: 'MANDATORY', order: 9 },
      { stepKey: 'PACKAGING_PREPARATION', requirement: 'MANDATORY', order: 10 }
    ]
  },
  {
    id: 'PROFILE_COMMERCIAL_RETAIL',
    code: 'COMMERCIAL_RETAIL',
    name: 'Commercial Indian Retail (FSSAI / Agmark Standard)',
    tagline: 'High-throughput clarified honey with automated quality controls',
    description: 'Engineered for commercial bottling plants processing batches over 100 kg. Features gentle liquefaction, conditional vacuum moisture stabilization, dual-stage filtration, and long-dwell clarification.',
    applicableProducts: ['Pure Natural Honey 500g Glass', 'Squeezy Multifloral 250g', 'Eucalyptus Blossom Honey'],
    targetMarkets: ['National Modern Trade', 'E-Commerce Retail', 'Agmark Certified Retail'],
    defaultSopId: 'SOP-COMM-2026-V3',
    steps: [
      { stepKey: 'RECEIVING', requirement: 'MANDATORY', order: 1 },
      { stepKey: 'SOURCE_VERIFICATION', requirement: 'MANDATORY', order: 2 },
      { stepKey: 'INCOMING_INSPECTION', requirement: 'MANDATORY', order: 3 },
      { stepKey: 'SAMPLING', requirement: 'MANDATORY', order: 4 },
      { stepKey: 'COARSE_STRAINING', requirement: 'MANDATORY', order: 5 },
      { stepKey: 'WARMING', requirement: 'MANDATORY', order: 6, maxTempC: 42.0 },
      { stepKey: 'LIQUEFACTION', requirement: 'OPTIONAL', order: 7 },
      { stepKey: 'MOISTURE_REDUCTION', requirement: 'CONDITIONAL', condition: 'incomingMoisture > 20.0', order: 8 },
      { stepKey: 'FINE_FILTRATION', requirement: 'MANDATORY', order: 9 },
      { stepKey: 'SETTLING', requirement: 'MANDATORY', order: 10 },
      { stepKey: 'QUALITY_CHECK', requirement: 'MANDATORY', order: 11 },
      { stepKey: 'PACKAGING_PREPARATION', requirement: 'MANDATORY', order: 12 }
    ]
  },
  {
    id: 'PROFILE_EXPORT_GRADE',
    code: 'EXPORT_GRADE',
    name: 'Export Consignment Processing (EIC / International)',
    tagline: 'Stringent C4 sugar, antibiotic residue and pollen traceability compliance',
    description: 'Strict regime fulfilling Export Inspection Council (EIC) directives, EU/US residue limits, and EA/LC-IRMS C4 adulteration testing. Complete drum-to-frame traceability.',
    applicableProducts: ['Export Grade Light Amber Honey', 'White Acacia Export Lot', 'Certified Organic Export'],
    targetMarkets: ['Export - European Union', 'Export - North America', 'Export - Middle East'],
    defaultSopId: 'SOP-EXP-2026-V1',
    steps: [
      { stepKey: 'RECEIVING', requirement: 'MANDATORY', order: 1 },
      { stepKey: 'SOURCE_VERIFICATION', requirement: 'MANDATORY', order: 2 },
      { stepKey: 'INCOMING_INSPECTION', requirement: 'MANDATORY', order: 3 },
      { stepKey: 'SAMPLING', requirement: 'MANDATORY', order: 4 },
      { stepKey: 'COARSE_STRAINING', requirement: 'MANDATORY', order: 5 },
      { stepKey: 'DE_WAXING', requirement: 'MANDATORY', order: 6 },
      { stepKey: 'WARMING', requirement: 'OPTIONAL', order: 7, maxTempC: 38.0 },
      { stepKey: 'FINE_FILTRATION', requirement: 'MANDATORY', order: 8 },
      { stepKey: 'SETTLING', requirement: 'MANDATORY', order: 9 },
      { stepKey: 'QUALITY_CHECK', requirement: 'MANDATORY', order: 10 },
      { stepKey: 'PACKAGING_PREPARATION', requirement: 'MANDATORY', order: 11 }
    ]
  },
  {
    id: 'PROFILE_FOREST_TRIBAL',
    code: 'FOREST_TRIBAL',
    name: 'Forest / Tribal Gathered Honey (TRIFED / Van Dhan)',
    tagline: 'Apis dorsata / florea comb extraction and smoke residue mitigation',
    description: 'Designed for tribal gatherers and Van Dhan Vikas Kendras harvesting Apis dorsata or stingless dammer bee honey from forest canopies. Special emphasis on clean comb separation, smoke residue inspection, and gentle clarification.',
    applicableProducts: ['Western Ghats Wild Honey', 'Sundarbans Mangrove Honey', 'Dammer Bee Cheruthen'],
    targetMarkets: ['Tribal Cooperative (TRIFED)', 'Ayurvedic & Medicinal Formulations', 'Specialty GI Stores'],
    defaultSopId: 'SOP-TRI-2026-V1',
    steps: [
      { stepKey: 'RECEIVING', requirement: 'MANDATORY', order: 1 },
      { stepKey: 'SOURCE_VERIFICATION', requirement: 'MANDATORY', order: 2 },
      { stepKey: 'INCOMING_INSPECTION', requirement: 'MANDATORY', order: 3 },
      { stepKey: 'SAMPLING', requirement: 'MANDATORY', order: 4 },
      { stepKey: 'DE_WAXING', requirement: 'MANDATORY', order: 5 },
      { stepKey: 'COARSE_STRAINING', requirement: 'MANDATORY', order: 6 },
      { stepKey: 'SETTLING', requirement: 'MANDATORY', order: 7 },
      { stepKey: 'QUALITY_CHECK', requirement: 'MANDATORY', order: 8 },
      { stepKey: 'PACKAGING_PREPARATION', requirement: 'MANDATORY', order: 9 }
    ]
  }
];

export const INITIAL_SOPS = [
  {
    id: 'SOP-RAW-2026-V1',
    code: 'SOP-HNY-RAW-001',
    version: '3.2',
    name: 'Standard Cold-Processed Raw Honey Protocol',
    organizationId: 'org-sahyadri-01',
    facilityId: 'fac-pune-01',
    profileCode: 'RAW_UNHEATED',
    status: 'ACTIVE',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2027-12-31',
    approvedBy: 'Dr. V. N. Rao (Food Technologist)',
    approvedAt: '2026-01-02 · 10:00 AM',
    parameters: {
      maxAllowableTempC: 36.0,
      minSettlingHours: 48,
      maxFinalMoisturePercent: 19.0,
      fineFilterMeshMicrons: 200
    },
    equipmentRequirements: [
      'Double Stainless Sieve (400/200 µm)',
      'Jacketed SS Settling Tank (500L)',
      'Digital Refractometer'
    ],
    qualityGates: [
      'Moisture <= 20.0%',
      'HMF <= 30.0 mg/kg',
      'Diastase >= 10.0 DN'
    ]
  },
  {
    id: 'SOP-COMM-2026-V3',
    code: 'SOP-HNY-COMM-003',
    version: '2.4',
    name: 'Commercial Retail Line Standard Operating Procedure',
    organizationId: 'org-sahyadri-01',
    facilityId: 'fac-pune-01',
    profileCode: 'COMMERCIAL_RETAIL',
    status: 'ACTIVE',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2027-12-31',
    approvedBy: 'Sunil Patil (Plant Operations Lead)',
    approvedAt: '2026-01-10 · 02:30 PM',
    parameters: {
      maxAllowableTempC: 42.0,
      minSettlingHours: 48,
      maxFinalMoisturePercent: 20.0,
      fineFilterMeshMicrons: 150
    },
    equipmentRequirements: [
      'Water-Jacketed Warming Tank',
      'Dual Mesh Sieve System',
      'Vacuum Dehumidifier',
      'Platform Scale 500kg'
    ],
    qualityGates: [
      'FSSAI Compulsory Standards Satisfied',
      'Agmark Special Grade Thresholds Checked',
      'Zero Fermentation Gas'
    ]
  }
];

export function getProfileByCode(code) {
  return PROCESSING_PROFILES.find(p => p.code === code) || PROCESSING_PROFILES[0];
}

export function getSopById(sopId) {
  return INITIAL_SOPS.find(s => s.id === sopId) || INITIAL_SOPS[0];
}
