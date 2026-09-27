/**
 * HoneyChain Work Organization Taxonomy & Relevance Engine
 *
 * Defines normalized models and dynamic relevance rules for Screen 08 ("How do you work?").
 * Separates human operational context from designation eligibility logic.
 */

// -------------------------------------------------------------
// 1. COLLABORATION / WORK STYLE OPTIONS
// -------------------------------------------------------------
export const COLLABORATION_OPTIONS = [
  {
    id: 'INDEPENDENT',
    title: 'Just me',
    description: 'I manage most of the work myself.',
    icon: 'User',
    badge: 'Solo Operator'
  },
  {
    id: 'TEAM',
    title: 'My team',
    description: 'I work with other people on shared operations.',
    icon: 'Users',
    badge: 'Cooperative'
  },
  {
    id: 'ORGANIZATION',
    title: 'A business or organization',
    description: 'I work as part of an established organization.',
    icon: 'Building2',
    badge: 'Structured Enterprise'
  },
  {
    id: 'PARTNERS',
    title: 'Different teams or partners',
    description: 'My work involves multiple people, teams or external partners.',
    icon: 'Network',
    badge: 'Multi-Stakeholder'
  }
];

// -------------------------------------------------------------
// 2. HANDLED ITEMS TAXONOMY (Contextual to Screen 06 & Screen 07)
// -------------------------------------------------------------
export const HANDLED_ITEMS_TAXONOMY = {
  HIVE_OPERATIONS: {
    contextId: 'HIVE_OPERATIONS',
    groupLabel: 'Hive Operations',
    items: [
      {
        id: 'HIVES_ONE_OR_MORE',
        title: 'One or more hives',
        description: 'Routine colony care, feeding, and observation',
        icon: 'Layers'
      },
      {
        id: 'APIARIES_MULTIPLE',
        title: 'Multiple apiaries',
        description: 'Managing yard sites, outlying yards, and land permits',
        icon: 'MapPin'
      },
      {
        id: 'HIVE_INSPECTIONS',
        title: 'Hive inspections',
        description: 'Brood patterns, queen health, varroa mite sampling',
        icon: 'Search'
      },
      {
        id: 'HIVE_MONITORING',
        title: 'Hive monitoring',
        description: 'Telemetry scales, internal sensors, temperature and acoustics',
        icon: 'Activity'
      }
    ]
  },

  HONEY_OPERATIONS: {
    contextId: 'HONEY_OPERATIONS',
    groupLabel: 'Honey Operations',
    items: [
      {
        id: 'HONEY_BATCHES',
        title: 'Individual honey batches',
        description: 'Tracking discrete harvest lots and extraction sessions',
        icon: 'Package'
      },
      {
        id: 'PROCESSING_OPS',
        title: 'Processing operations',
        description: 'Uncapping, centrifugal spinning, filtration, and settling tanks',
        icon: 'Filter'
      },
      {
        id: 'COLLECTION_RECORDS',
        title: 'Collection records',
        description: 'Supers harvested, scale weights, and apiary provenance logs',
        icon: 'FileText'
      },
      {
        id: 'BATCH_MOVEMENT',
        title: 'Batch movement',
        description: 'Curing drums, transfer manifolds, and tank-to-jar custody',
        icon: 'Truck'
      }
    ]
  },

  QUALITY_OPERATIONS: {
    contextId: 'QUALITY_OPERATIONS',
    groupLabel: 'Quality Operations',
    items: [
      {
        id: 'SAMPLES_COLLECTION',
        title: 'Samples',
        description: 'Test vials, pollen smears, moisture refractometry drops',
        icon: 'FlaskConical'
      },
      {
        id: 'QUALITY_RECORDS',
        title: 'Quality records',
        description: 'Lab certificates, moisture thresholds, compliance audits',
        icon: 'ClipboardCheck'
      },
      {
        id: 'TEST_RESULTS',
        title: 'Test results',
        description: 'HMF levels, diastase activity, sugar profile assays',
        icon: 'FileCheck'
      },
      {
        id: 'BATCH_VERIFICATION',
        title: 'Batch verification',
        description: 'Authenticity validation, purity grades, and seal sign-offs',
        icon: 'ShieldCheck'
      }
    ]
  },

  LOGISTICS_OPERATIONS: {
    contextId: 'LOGISTICS_OPERATIONS',
    groupLabel: 'Products & Delivery',
    items: [
      {
        id: 'PRODUCT_INVENTORY',
        title: 'Product inventory',
        description: 'Packaged jars, comb sections, bulk drums, wax products',
        icon: 'Boxes'
      },
      {
        id: 'PACKAGING_SEALS',
        title: 'Packaging',
        description: 'Tamper-evident seals, lot barcodes, nutritional labels',
        icon: 'Tag'
      },
      {
        id: 'SHIPMENTS_DISPATCH',
        title: 'Shipments',
        description: 'Courier pickups, pallet manifests, temperature-controlled transit',
        icon: 'Truck'
      },
      {
        id: 'DELIVERIES_DISPATCH',
        title: 'Deliveries',
        description: 'Direct-to-consumer farmgate, local markets, retail distribution',
        icon: 'ShoppingBag'
      }
    ]
  }
};

// -------------------------------------------------------------
// 3. OPERATIONAL SCALE OPTIONS (Contextual)
// -------------------------------------------------------------
export const SCALE_TAXONOMY = {
  HIVE: {
    title: 'How many hives do you typically oversee?',
    subtitle: 'Approximate colony counts help tailor sensor and yard lists.',
    options: [
      {
        id: 'SCALE_FEW_HIVES',
        title: 'A few hives',
        description: '1 to 10 colonies • Backyard or boutique apiary'
      },
      {
        id: 'SCALE_SEVERAL_HIVES',
        title: 'Several hives',
        description: '10 to 50 colonies • Expanding commercial or sideliner apiary'
      },
      {
        id: 'SCALE_MULTIPLE_APIARIES',
        title: 'Multiple apiaries',
        description: '50+ colonies • Distributed across regional yards or pollination routes'
      },
      {
        id: 'SCALE_VARIES_SEASON',
        title: 'Varies by season',
        description: 'Colony counts shift with seasonal splits, swarms, and flow'
      }
    ]
  },

  HONEY: {
    title: 'What batch volume do you typically handle?',
    subtitle: 'Helps configure tank capacities and lot numbering conventions.',
    options: [
      {
        id: 'SCALE_SMALL_BATCH',
        title: 'Small batches',
        description: 'Handcrafted artisan yields (under 100 kg / harvest)'
      },
      {
        id: 'SCALE_REGULAR_BATCH',
        title: 'Regular batches',
        description: '100 to 1,000 kg seasonal batches • Dedicated settling tanks'
      },
      {
        id: 'SCALE_LARGE_BATCH',
        title: 'Large-scale batches',
        description: '1,000+ kg commercial volumes • Bulk storage drums'
      },
      {
        id: 'SCALE_VARIES_BATCH',
        title: 'Varies',
        description: 'Yields fluctuate significantly depending on floral forage'
      }
    ]
  },

  DISTRIBUTION: {
    title: 'What distribution range do you handle?',
    subtitle: 'Helps adapt shipping documents and delivery confirmation workflows.',
    options: [
      {
        id: 'SCALE_LOCAL',
        title: 'Local deliveries',
        description: 'Direct farmgate, farmers markets, local village retailers'
      },
      {
        id: 'SCALE_REGIONAL',
        title: 'Regional distribution',
        description: 'Cooperative warehouses, specialty grocers, supermarkets'
      },
      {
        id: 'SCALE_MULTI_DEST',
        title: 'Multiple destinations',
        description: 'National freight, online direct dispatch, export orders'
      },
      {
        id: 'SCALE_VARIES_DIST',
        title: 'Varies',
        description: 'Mixed distribution channels across seasons'
      }
    ]
  }
};

// -------------------------------------------------------------
// 4. WORK LOCATION OPTIONS
// -------------------------------------------------------------
export const LOCATION_OPTIONS = [
  {
    id: 'APIARY',
    title: 'At the apiary',
    description: 'Out in the bee yard, pasture, and open floral fields.',
    icon: 'Sun'
  },
  {
    id: 'PROCESSING_LOCATION',
    title: 'At a processing location',
    description: 'Honey house, centrifugal extraction bay, or bottling facility.',
    icon: 'Home'
  },
  {
    id: 'LAB',
    title: 'In a lab',
    description: 'Quality analysis testing bench, optical refractometer station.',
    icon: 'FlaskConical'
  },
  {
    id: 'WAREHOUSE',
    title: 'At a warehouse',
    description: 'Dry product inventory depot, pallet racking, or shipping dock.',
    icon: 'Package'
  },
  {
    id: 'MULTI_LOCATION',
    title: 'Across multiple locations',
    description: 'Mobile workflow alternating between fields, plants, and transit.',
    icon: 'Compass'
  }
];

// -------------------------------------------------------------
// 5. SMART QUESTION RELEVANCE ENGINE
// -------------------------------------------------------------

/**
 * Computes which questions and options are relevant for the current user,
 * based on selected work contexts and capabilities from Screens 06 & 07.
 *
 * @param {Object} params
 * @param {Array<string>} params.selectedContexts - e.g. ['HIVE_OPERATIONS', 'HONEY_OPERATIONS']
 * @param {Array<string>} params.selectedCapabilities - e.g. ['HIVE_MONITORING', 'HONEY_PROCESSING']
 * @returns {Object} Structured relevance plan
 */
export const resolveRelevantWorkQuestions = ({
  selectedContexts = [],
  selectedCapabilities = []
}) => {
  const activeContexts = selectedContexts.length > 0
    ? selectedContexts
    : ['HIVE_OPERATIONS', 'HONEY_OPERATIONS'];

  // 1. Resolve Handled Items for Question 2
  const handledGroups = [];
  activeContexts.forEach((ctxId) => {
    const group = HANDLED_ITEMS_TAXONOMY[ctxId];
    if (group) {
      handledGroups.push(group);
    }
  });

  // 2. Resolve Scale Question (Question 3)
  let scaleCategory = null;
  if (activeContexts.includes('HIVE_OPERATIONS')) {
    scaleCategory = 'HIVE';
  } else if (activeContexts.includes('HONEY_OPERATIONS')) {
    scaleCategory = 'HONEY';
  } else if (activeContexts.includes('LOGISTICS_OPERATIONS')) {
    scaleCategory = 'DISTRIBUTION';
  }

  const scaleQuestion = scaleCategory ? SCALE_TAXONOMY[scaleCategory] : null;

  return {
    collaborationOptions: COLLABORATION_OPTIONS,
    handledGroups,
    hasHandledItems: handledGroups.length > 0,
    scaleQuestion,
    hasScaleQuestion: Boolean(scaleQuestion),
    locationOptions: LOCATION_OPTIONS
  };
};

/**
 * Normalizes user work organization responses into canonical data structure.
 *
 * @param {Object} raw
 * @returns {Object} Normalized profile
 */
export const normalizeWorkOrganizationProfile = (raw = {}) => {
  return {
    workStyle: Array.isArray(raw.workStyle) ? raw.workStyle : (raw.workStyle ? [raw.workStyle] : []),
    collaborationContext: Array.isArray(raw.collaborationContext)
      ? raw.collaborationContext
      : (raw.workStyle ? (Array.isArray(raw.workStyle) ? raw.workStyle : [raw.workStyle]) : []),
    handledItems: Array.isArray(raw.handledItems) ? raw.handledItems : [],
    operationalScale: raw.operationalScale || null,
    workLocations: Array.isArray(raw.workLocations) ? raw.workLocations : []
  };
};
