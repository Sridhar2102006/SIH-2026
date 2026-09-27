/**
 * HONEYCHAIN — INDIA PROCESSOR SEED DATA & REGISTRIES
 *
 * Provides realistic Indian apiculture processor domain entities:
 * Organizations, Facilities, Equipment, Products, Markets, and Onboarding Options.
 */

export const WORK_DESCRIPTION_OPTIONS = [
  { id: 'HONEY_PROCESSING', label: 'Honey processing', description: 'Dedicated extraction, settling and refinement facility' },
  { id: 'COLLECTION_AND_PROCESSING', label: 'Honey collection + processing', description: 'Aggregates from own and partner beekeepers and processes' },
  { id: 'COMMERCIAL_PROCESSING', label: 'Commercial honey processing', description: 'High-throughput commercial processing and packaging' },
  { id: 'FPO_COOPERATIVE', label: 'FPO / cooperative processing', description: 'Farmer Producer Company or beekeeping cooperative cluster' },
  { id: 'SHG_PRODUCER_GROUP', label: 'SHG / producer-group processing', description: 'Self-help group or village-level artisanal processing' },
  { id: 'FAMILY_SMALL_ENTERPRISE', label: 'Family / small enterprise processing', description: 'Single family farm or artisanal small batch setup' },
  { id: 'BULK_PROCESSING', label: 'Bulk honey processing', description: 'Bulk drumming, barrel pooling and wholesale distribution' },
  { id: 'RETAIL_PACKAGING', label: 'Retail honey processing', description: 'Consumer jar packaging, labeling and retail distribution' },
  { id: 'EXPORT_ORIENTED', label: 'Export-oriented processing', description: 'EIC-certified testing, export drum lots and global traceability' },
  { id: 'CONTRACT_PROCESSING', label: 'Contract processing', description: 'Third-party job-work processing for other brands' },
  { id: 'OTHER', label: 'Other processing model', description: 'Custom apiculture processing arrangement' }
];

export const ORGANIZATION_TYPE_OPTIONS = [
  { id: 'INDIVIDUAL', label: 'Individual Enterprise' },
  { id: 'FAMILY_ENTERPRISE', label: 'Family Enterprise' },
  { id: 'SHG', label: 'Self Help Group (SHG)' },
  { id: 'FPO', label: 'Farmer Producer Organization (FPO)' },
  { id: 'FPC', label: 'Farmer Producer Company (FPC)' },
  { id: 'COOPERATIVE', label: 'Beekeepers Cooperative Society' },
  { id: 'PRODUCER_GROUP', label: 'Village Producer Group' },
  { id: 'PROCESSING_UNIT', label: 'Registered Processing Unit' },
  { id: 'PRIVATE_COMPANY', label: 'Private Limited Company' },
  { id: 'ENTERPRISE', label: 'Commercial Agro-Enterprise' },
  { id: 'CONTRACT_PROCESSOR', label: 'Contract Job-Work Processor' },
  { id: 'OTHER', label: 'Other Organization Model' }
];

export const INITIAL_ORGANIZATIONS = [
  {
    id: 'org-sahyadri-01',
    name: 'Sahyadri Bio-Honey Producer Co-operative Ltd.',
    type: 'COOPERATIVE',
    operatingScale: 'MEDIUM',
    registrationNumber: 'MH/COOP/AGRI/2021-9481',
    primaryState: 'Maharashtra',
    primaryDistrict: 'Pune',
    headquarters: 'Baramati, Pune District, Maharashtra 413102',
    facilitiesCount: 2,
    activeBeekeepersLinked: 48,
    status: 'ACTIVE'
  },
  {
    id: 'org-himalayan-02',
    name: 'Himalayan Nectar Apiaries & Processing Unit',
    type: 'PRIVATE_COMPANY',
    operatingScale: 'SMALL',
    registrationNumber: 'JK/AGRO/2019-1142',
    primaryState: 'Jammu and Kashmir',
    primaryDistrict: 'Pulwama',
    headquarters: 'Lethpora Saffron & Apiary Belt, Pulwama 192122',
    facilitiesCount: 1,
    activeBeekeepersLinked: 22,
    status: 'ACTIVE'
  },
  {
    id: 'org-nilgiri-03',
    name: 'Nilgiri Tribal Natural Honey FPC',
    type: 'FPC',
    operatingScale: 'SMALL',
    registrationNumber: 'TN/FPC/2022-7719',
    primaryState: 'Tamil Nadu',
    primaryDistrict: 'The Nilgiris',
    headquarters: 'Kotagiri Tribal Hub, The Nilgiris 643217',
    facilitiesCount: 1,
    activeBeekeepersLinked: 35,
    status: 'ACTIVE'
  }
];

export const INITIAL_FACILITIES = [
  {
    id: 'fac-pune-01',
    organizationId: 'org-sahyadri-01',
    name: 'HoneyHouse Central Processing #2',
    code: 'FAC-MH-PUN-02',
    facilityType: 'CENTRAL_PROCESSING',
    location: {
      country: 'India',
      state: 'Maharashtra',
      district: 'Pune',
      subdistrict: 'Haveli',
      locality: 'Hadapsar Agro-Industrial Zone, Pune',
      pincode: '411028'
    },
    capacityKgPerDay: 800,
    storageCapacityKg: 15000,
    operatingScale: 'COMMERCIAL',
    processingCapabilities: [
      'RECEIVING',
      'SOURCE_VERIFICATION',
      'INCOMING_INSPECTION',
      'SAMPLING',
      'COARSE_STRAINING',
      'WARMING',
      'FINE_FILTRATION',
      'SETTLING',
      'QUALITY_CHECK',
      'PACKAGING_PREPARATION'
    ],
    laboratoryAccess: 'ON_SITE_SCREENING_PLUS_EXTERNAL_ACCREDITED',
    status: 'ACTIVE',
    leadSupervisor: 'Marcus K. (Plant Lead)'
  },
  {
    id: 'fac-pulwama-02',
    organizationId: 'org-himalayan-02',
    name: 'Pulwama Cold Valley Extraction Station',
    code: 'FAC-JK-PUL-01',
    facilityType: 'PRIMARY_PROCESSING',
    location: {
      country: 'India',
      state: 'Jammu and Kashmir',
      district: 'Pulwama',
      subdistrict: 'Pampore',
      locality: 'Lethpora Highway Yard',
      pincode: '192122'
    },
    capacityKgPerDay: 300,
    storageCapacityKg: 5000,
    operatingScale: 'SMALL',
    processingCapabilities: [
      'RECEIVING',
      'SOURCE_VERIFICATION',
      'INCOMING_INSPECTION',
      'SAMPLING',
      'COARSE_STRAINING',
      'SETTLING',
      'QUALITY_CHECK',
      'PACKAGING_PREPARATION'
    ],
    laboratoryAccess: 'PARTNER_LAB_TRANSFER',
    status: 'ACTIVE',
    leadSupervisor: 'Tariq Ahmad Bhat'
  }
];

export const INITIAL_EQUIPMENT_REGISTRY = [
  {
    id: 'eq-ext-01',
    facilityId: 'fac-pune-01',
    name: 'Radial Extractor #1 (24-Frame SS 304)',
    type: 'CENTRIFUGAL_EXTRACTOR',
    manufacturer: 'TechnoBee Processors Pvt Ltd',
    model: 'TB-RAD-24-SS',
    capacity: 60,
    capacityUnit: 'kg/batch',
    status: 'OPERATIONAL',
    installationDate: '2023-04-12',
    calibrationRequired: true,
    calibrationStatus: 'CALIBRATED',
    lastCalibration: '2026-08-15',
    nextCalibration: '2027-02-15',
    location: 'Extraction Bay A'
  },
  {
    id: 'eq-ext-02',
    facilityId: 'fac-pune-01',
    name: 'Radial Extractor #2 (Variable Speed)',
    type: 'CENTRIFUGAL_EXTRACTOR',
    manufacturer: 'TechnoBee Processors Pvt Ltd',
    model: 'TB-RAD-36-VFD',
    capacity: 90,
    capacityUnit: 'kg/batch',
    status: 'OPERATIONAL',
    installationDate: '2024-01-20',
    calibrationRequired: true,
    calibrationStatus: 'CALIBRATED',
    lastCalibration: '2026-08-15',
    nextCalibration: '2027-02-15',
    location: 'Extraction Bay B'
  },
  {
    id: 'eq-flt-01',
    facilityId: 'fac-pune-01',
    name: 'Double Stainless Sieve #1 (400/200 µm)',
    type: 'COARSE_STRAINER',
    manufacturer: 'BeeEquip India',
    model: 'SS-DUO-400-200',
    capacity: 250,
    capacityUnit: 'L/hr',
    status: 'OPERATIONAL',
    installationDate: '2023-04-15',
    calibrationRequired: false,
    calibrationStatus: 'NOT_REQUIRED',
    location: 'Filtration Station 1'
  },
  {
    id: 'eq-tnk-01',
    facilityId: 'fac-pune-01',
    name: 'Settling Tank #1 (300L SS 304 Conical)',
    type: 'SETTLING_TANK',
    manufacturer: 'Fabtech Process Equipment',
    model: 'FT-SET-300',
    capacity: 300,
    capacityUnit: 'L',
    status: 'OPERATIONAL',
    installationDate: '2023-05-10',
    calibrationRequired: false,
    calibrationStatus: 'NOT_REQUIRED',
    location: 'Settling Room East'
  },
  {
    id: 'eq-tnk-02',
    facilityId: 'fac-pune-01',
    name: 'Settling Tank #2 (500L Jacketed Insulated)',
    type: 'SETTLING_TANK',
    manufacturer: 'Fabtech Process Equipment',
    model: 'FT-SET-500-JACKET',
    capacity: 500,
    capacityUnit: 'L',
    status: 'OPERATIONAL',
    installationDate: '2023-09-01',
    calibrationRequired: true,
    calibrationStatus: 'CALIBRATED',
    lastCalibration: '2026-06-10',
    nextCalibration: '2026-12-10',
    location: 'Settling Room North'
  },
  {
    id: 'eq-wrm-01',
    facilityId: 'fac-pune-01',
    name: 'Indirect Water-Jacket Warming Tank #1',
    type: 'HEATING_TANK',
    manufacturer: 'Thermatech Food Systems',
    model: 'TT-WARM-400L',
    capacity: 400,
    capacityUnit: 'L',
    status: 'OPERATIONAL',
    installationDate: '2024-02-15',
    calibrationRequired: true,
    calibrationStatus: 'CALIBRATED',
    lastCalibration: '2026-07-20',
    nextCalibration: '2027-01-20',
    location: 'Thermal Conditioning Area'
  },
  {
    id: 'eq-mcu-01',
    facilityId: 'fac-pune-01',
    name: 'Vacuum Dehumidifier Cabinet (Low-Temp)',
    type: 'MOISTURE_REDUCTION_UNIT',
    manufacturer: 'VacuFoods Engineering',
    model: 'VF-DEHUM-200',
    capacity: 200,
    capacityUnit: 'kg/batch',
    status: 'STANDBY',
    installationDate: '2024-08-01',
    calibrationRequired: true,
    calibrationStatus: 'CALIBRATED',
    lastCalibration: '2026-08-05',
    nextCalibration: '2027-02-05',
    location: 'Dehumidification Bay'
  },
  {
    id: 'eq-scl-01',
    facilityId: 'fac-pune-01',
    name: 'Digital Platform Scale 500kg (Essae Class III)',
    type: 'WEIGHING_SCALE',
    manufacturer: 'Essae Teraoka India',
    model: 'DS-215-500K',
    capacity: 500,
    capacityUnit: 'kg',
    status: 'OPERATIONAL',
    installationDate: '2023-04-10',
    calibrationRequired: true,
    calibrationStatus: 'CALIBRATED',
    lastCalibration: '2026-09-01',
    nextCalibration: '2027-09-01',
    location: 'Intake & Dispatch Scale Area'
  },
  {
    id: 'eq-ref-01',
    facilityId: 'fac-pune-01',
    name: 'Digital Pocket Honey Refractometer (Atago PAL-22S)',
    type: 'REFRACTOMETER',
    manufacturer: 'Atago Co., Ltd.',
    model: 'PAL-22S',
    capacity: 0,
    capacityUnit: '% Brix/Moisture',
    status: 'OPERATIONAL',
    installationDate: '2024-03-10',
    calibrationRequired: true,
    calibrationStatus: 'CALIBRATED',
    lastCalibration: '2026-09-10',
    nextCalibration: '2026-12-10',
    location: 'Intake QC Bench'
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-wild-01',
    name: 'Wildflower & Blackberry Natural Raw Honey',
    category: 'RAW_UNHEATED',
    honeyType: 'Wildflower & Blackberry',
    sourceType: 'APIARY_HARVEST',
    targetMarket: 'DOMESTIC_RETAIL',
    packagingType: 'Glass Jar 500g',
    qualityProfile: 'RAW_ORGANIC',
    active: true
  },
  {
    id: 'prod-acacia-02',
    name: 'Kashmir White Acacia Honey (Single Flora)',
    category: 'PREMIUM_SINGLE_FLORA',
    honeyType: 'Acacia (Robinia pseudoacacia)',
    sourceType: 'APIARY_MIGRATORY',
    targetMarket: 'EXPORT_AND_PREMIUM_RETAIL',
    packagingType: 'Glass Hexagonal 1000g',
    qualityProfile: 'AGMARK_SPECIAL',
    active: true
  },
  {
    id: 'prod-mustard-03',
    name: 'Mustard Bloom Crystallized Cream Honey',
    category: 'CREAM_HONEY',
    honeyType: 'Mustard (Brassica campestris)',
    sourceType: 'APIARY_PLAINS',
    targetMarket: 'DOMESTIC_RETAIL',
    packagingType: 'Wide Mouth PET Jar 500g',
    qualityProfile: 'STANDARD_FSSAI',
    active: true
  },
  {
    id: 'prod-forest-04',
    name: 'Western Ghats Deep Forest Multi-Floral Honey',
    category: 'FOREST_TRIBAL',
    honeyType: 'Forest Wildflower & Jamun',
    sourceType: 'TRIBAL_SUSTAINABLE_HARVEST',
    targetMarket: 'AYURVEDIC_INSTITUTIONAL',
    packagingType: 'Bulk Food Grade Drum 50kg',
    qualityProfile: 'HIGH_POLLEN_MEDICINAL',
    active: true
  }
];

export const INITIAL_MARKETS = [
  { id: 'DOMESTIC_RETAIL', name: 'Domestic Retail (Consumer Packaged Goods)', complianceStandards: ['FSSAI', 'AGMARK'] },
  { id: 'DOMESTIC_BULK', name: 'Domestic Bulk Wholesale (B2B Food & Pharma)', complianceStandards: ['FSSAI'] },
  { id: 'INSTITUTIONAL', name: 'Institutional / Ayurvedic Formulators', complianceStandards: ['AYUSH', 'FSSAI'] },
  { id: 'EXPORT_EU', name: 'Export - European Union', complianceStandards: ['EIC', 'EU_DIRECTIVE_2001_110'] },
  { id: 'EXPORT_US_GCC', name: 'Export - US / GCC Countries', complianceStandards: ['EIC', 'GSO'] }
];
