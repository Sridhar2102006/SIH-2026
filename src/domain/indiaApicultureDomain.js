/**
 * HONEYCHAIN — INDIA-FIRST DOMAIN FOUNDATION & APICULTURE SYSTEM
 *
 * Grounded in the National Beekeeping & Honey Mission (NBHM), scientific beekeeping,
 * ICAR-AICRP (Honey Bees and Pollinators), KVIC, and Indian agro-ecological realities.
 *
 * Living Agricultural Hierarchy:
 * BEE COLONY -> APIARY -> HIVE -> FRAMES/COMB -> SEASONAL CONDITIONS -> FORAGE/FLOWERING
 * -> REGULAR INSPECTION -> BEE HEALTH -> PESTS/PREDATORS -> PESTICIDE EXPOSURE RISK
 * -> HYGIENE WORKFLOW -> HONEY COLLECTION -> POST-HARVEST LOT -> PROCESSING BATCH
 * -> QUALITY LAB TEST (FSSAI/AGMARK) -> PACKAGING -> CONSUMER TRACEABILITY
 */

// ============================================================================
// 1. BEE SPECIES & BIOLOGICAL TAXONOMY (India Apiculture Context)
// ============================================================================

export const BEE_SPECIES = {
  APIS_CERANA_INDICA: {
    code: 'APIS_CERANA_INDICA',
    scientificName: 'Apis cerana indica',
    commonName: 'Indian Hive Bee',
    vernacularHindi: 'भारतीय मौना (देशी मधुमक्खी)',
    vernacularTamil: 'இந்திய தேனீ',
    origin: 'INDIGENOUS',
    temperament: 'Generally gentle, prone to absconding and swarming under dearth',
    averageHoneyYieldKgPerYear: '5 - 10 kg',
    recommendedHiveStandard: 'BIS Type A (8-frame) or BIS Type B (10-frame)',
    foragingRangeMeters: 800,
    pestResistance: 'High natural resistance to Varroa destructor; vulnerable to Thai Sacbrood Virus (TSBV)',
    isDomesticated: true
  },
  APIS_MELLIFERA: {
    code: 'APIS_MELLIFERA',
    scientificName: 'Apis mellifera',
    commonName: 'Italian / European Honey Bee',
    vernacularHindi: 'इटैलियन मधुमक्खी',
    vernacularTamil: 'இத்தாலிய தேனீ',
    origin: 'EXOTIC_ESTABLISHED',
    temperament: 'Prolific, stable comb tenure, lower swarming tendency, high forage drive',
    averageHoneyYieldKgPerYear: '25 - 45 kg',
    recommendedHiveStandard: 'Langstroth Standard 10-frame hive',
    foragingRangeMeters: 2000,
    pestResistance: 'Vulnerable to Varroa destructor, Tropilaelaps clareae, and European foulbrood',
    isDomesticated: true
  },
  APIS_DORSATA: {
    code: 'APIS_DORSATA',
    scientificName: 'Apis dorsata',
    commonName: 'Rock Bee / Giant Honey Bee',
    vernacularHindi: 'सारंग / डम्भर / भौंरा',
    vernacularTamil: 'மலைத் தேனீ',
    origin: 'WILD_INDIGENOUS',
    temperament: 'Fierce, aggressive, open-air single comb cliff/tall tree builder',
    averageHoneyYieldKgPerYear: '15 - 40 kg (wild harvested)',
    recommendedHiveStandard: 'Not hiveable (Sustainable tree/cliff harvesting protocols)',
    foragingRangeMeters: 5000,
    pestResistance: 'Robust wild immunity',
    isDomesticated: false
  },
  APIS_FLOREA: {
    code: 'APIS_FLOREA',
    scientificName: 'Apis florea',
    commonName: 'Little Honey Bee / Dwarf Bee',
    vernacularHindi: 'छोटी मधुमक्खी / लघू',
    vernacularTamil: 'கொம்புத் தேனீ',
    origin: 'WILD_INDIGENOUS',
    temperament: 'Gentle, builds tiny single comb on bushes and hedges',
    averageHoneyYieldKgPerYear: '0.5 - 1 kg (medicinal)',
    recommendedHiveStandard: 'Not hiveable (Wild conservation focus)',
    foragingRangeMeters: 400,
    pestResistance: 'Resilient in tropical thorn and scrublands',
    isDomesticated: false
  },
  TETRAGONULA_IRIDIPENNIS: {
    code: 'TETRAGONULA_IRIDIPENNIS',
    scientificName: 'Tetragonula iridipennis',
    commonName: 'Stingless Bee / Dammer Bee',
    vernacularHindi: 'डामर मधुमक्खी (डंकहीन)',
    vernacularTamil: 'கொசுத் தேனீ',
    vernacularMalayalam: 'ചെറുതേനീച്ച (ചെറുതേൻ)',
    origin: 'INDIGENOUS',
    temperament: 'Completely stingless, constructs propolis/cerumen pots',
    averageHoneyYieldKgPerYear: '300 - 800 grams (highly priced medicinal Cheruthen)',
    recommendedHiveStandard: 'KAU / TNAU Stingless Box or Bamboo/Pot Hive',
    foragingRangeMeters: 300,
    pestResistance: 'High resilience to honey bee pathogens; propolis protects hive',
    isDomesticated: true
  }
};

// ============================================================================
// 2. INDIA ADMINISTRATIVE & AGRO-CLIMATIC LOCATION MODEL
// ============================================================================

export const INDIA_AGRO_CLIMATIC_REGIONS = {
  HIMALAYAN_TEMPERATE: {
    code: 'HIMALAYAN_TEMPERATE',
    name: 'Western & Eastern Himalayan Temperate Zone',
    states: ['Jammu and Kashmir', 'Himachal Pradesh', 'Uttarakhand', 'Sikkim'],
    primaryFlora: ['Apple', 'Wild Clover', 'Plectranthus (Solai)', 'Acacia modesta', 'Litchi', 'Cherry'],
    climateCharacteristics: 'Sub-zero winters, heavy snowfall, mild spring and summer'
  },
  INDO_GANGETIC_PLAINS: {
    code: 'INDO_GANGETIC_PLAINS',
    name: 'Indo-Gangetic Alluvial Agricultural Plains',
    states: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Bihar', 'West Bengal'],
    primaryFlora: ['Mustard (Rape & Mustard)', 'Berseem', 'Eucalyptus', 'Shahi Litchi', 'Jamun', 'Sesame'],
    climateCharacteristics: 'Hot summer, monsoonal rains, cool winter with intense mustard nectar flow'
  },
  DECCAN_CENTRAL_PLATEAU: {
    code: 'DECCAN_CENTRAL_PLATEAU',
    name: 'Central & Deccan Plateau Zone',
    states: ['Maharashtra', 'Madhya Pradesh', 'Telangana', 'Andhra Pradesh', 'Karnataka'],
    primaryFlora: ['Jamun', 'Sunflower', 'Cotton', 'Neem', 'Pigeonpea', 'Hirda', 'Karvi'],
    climateCharacteristics: 'Semi-arid to tropical, heavy post-monsoon and winter floral pulse'
  },
  WESTERN_GHATS_SOUTHERN: {
    code: 'WESTERN_GHATS_SOUTHERN',
    name: 'Western Ghats & Coastal Humid Tropical Zone',
    states: ['Kerala', 'Tamil Nadu', 'Goa', 'Coastal Karnataka'],
    primaryFlora: ['Rubber (Hevea brasiliensis)', 'Cardamom', 'Coffee', 'Coconut', 'Tamarind', 'Stingless Flora'],
    climateCharacteristics: 'High humidity, heavy South-West & North-East monsoon, year-round warmth'
  },
  NORTH_EASTERN_SUBTROPICAL: {
    code: 'NORTH_EASTERN_SUBTROPICAL',
    name: 'North-Eastern Subtropical Hill Zone',
    states: ['Assam', 'Meghalaya', 'Arunachal Pradesh', 'Manipur', 'Nagaland', 'Tripura', 'Mizoram'],
    primaryFlora: ['Mustard', 'Wild Citrus', 'Rubber', 'Litchi', 'Forest Canopy'],
    climateCharacteristics: 'Extremely high rainfall, monsoonal dearth, lush forest forage'
  }
};

export function resolveAgroClimaticRegion(stateName) {
  if (!stateName) return INDIA_AGRO_CLIMATIC_REGIONS.INDO_GANGETIC_PLAINS;
  const s = stateName.toLowerCase();
  for (const reg of Object.values(INDIA_AGRO_CLIMATIC_REGIONS)) {
    if (reg.states.some(st => s.includes(st.toLowerCase()) || st.toLowerCase().includes(s))) {
      return reg;
    }
  }
  return INDIA_AGRO_CLIMATIC_REGIONS.INDO_GANGETIC_PLAINS;
}

// ============================================================================
// 3. SEASONAL CONTEXT ENGINE (Agro-Ecological Calendar, Not One National Form)
// ============================================================================

export const SEASONAL_PATTERNS = {
  HIMALAYAN_TEMPERATE: {
    WINTER_DORMANCY: {
      months: [11, 12, 1, 2],
      seasonName: 'Shishir / Winter Dormancy',
      activityState: 'CLUSTER_CONSERVATION',
      recommendations: [
        'Insulate hive against snow and frosty draughts',
        'Avoid opening the brood chamber during cold spells',
        'Provide dry sugar candy or thick 2:1 sugar syrup on bright midday hours if stores are low',
        'Check entrance reduction to prevent rodent/mouse entry'
      ],
      floweringStatus: 'Dormant; minimal hazelnut/alder pollen only',
      keyRisks: ['Chilling of brood', 'Starvation if stores depleted', 'Mouse predation']
    },
    SPRING_BUILDUP: {
      months: [3, 4],
      seasonName: 'Vasant / Spring Colony Build-up',
      activityState: 'ACTIVE_BROOD_EXPANSION',
      recommendations: [
        'Inspect queen laying pattern and stimulate with 1:1 sugar syrup',
        'Add fresh comb foundation sheets for drone and worker comb building',
        'Monitor for early swarm cells as colony strength peaks',
        'Equalize strong and weak colonies'
      ],
      floweringStatus: 'Apple, Plum, Peach, Pear, Willow, Dandelion, Wild Mustard',
      keyRisks: ['Unmanaged swarming', 'Chilled brood during sudden spring rain']
    },
    SUMMER_HONEY_FLOW: {
      months: [5, 6],
      seasonName: 'Grishma / Major Honey Flow',
      activityState: 'SURPLUS_NECTAR_STORAGE',
      recommendations: [
        'Add honey supers above queen excluder',
        'Provide shade and ensure continuous fresh water nearby',
        'Harvest sealed/capped frames (at least 75% capping) in morning hours'
      ],
      floweringStatus: 'Plectranthus (Solai), Clover, Robinia, Wild multifloral',
      keyRisks: ['Overheating in afternoon sun', 'Robbing between colonies']
    },
    MONSOON_DEARTH: {
      months: [7, 8],
      seasonName: 'Varsha / Monsoon Dearth & Pest Vigil',
      activityState: 'DEARTH_MAINTENANCE',
      recommendations: [
        'Elevate hive stands above ground water splash and install ant-wells',
        'Check bottom board weekly for wax moth debris',
        'Provide emergency sugar feeding during continuous rain',
        'Watch for yellow-banded predatory hornets (Vespa species)'
      ],
      floweringStatus: 'Scattered maize/corn pollen; severe nectar dearth',
      keyRisks: ['Greater wax moth infestation', 'Vespa wasp attacks', 'Colony absconding']
    },
    AUTUMN_RECOVERY: {
      months: [9, 10],
      seasonName: 'Sharad / Autumn Honey & Pre-Winter Preparation',
      activityState: 'HONEY_HARVEST_AND_PACKING',
      recommendations: [
        'Extract autumn multifloral honey',
        'Ensure each colony retains at least 8-10 kg honey reserve for overwintering',
        'Treat for Varroa mites before winter clustering',
        'Unite weak colonies with queenright units'
      ],
      floweringStatus: 'Plectranthus rugosus, Autumn forest flora',
      keyRisks: ['Robbing by strong colonies', 'Mite population peak']
    }
  },

  INDO_GANGETIC_PLAINS: {
    WINTER_MUSTARD_FLOW: {
      months: [11, 12, 1],
      seasonName: 'Shishir / Peak Mustard (Sarson) Honey Flow',
      activityState: 'SURPLUS_NECTAR_STORAGE',
      recommendations: [
        'Place colonies directly adjacent to Brassica (Mustard/Toria/Raya) fields',
        'Add honey supers rapidly as mustard nectar flow is rapid and intense',
        'Harvest capped mustard honey promptly before in-comb granulation/crystallization',
        'Protect against early morning pesticide spray drifts'
      ],
      floweringStatus: 'Mustard (Brassica campestris/juncea), Toria, Berseem',
      keyRisks: ['Pesticide spray exposure (aphid sprays on mustard)', 'Rapid honey granulation in comb']
    },
    SPRING_LITCHI_EUCALYPTUS: {
      months: [2, 3, 4],
      seasonName: 'Vasant / Litchi & Eucalyptus Honey Flow',
      activityState: 'ACTIVE_FORAGING_AND_EXTRACTION',
      recommendations: [
        'Migrate colonies to litchi orchard clusters (Muzaffarpur, Saharanpur, Ramnagar)',
        'Collect delicate monofloral Litchi honey',
        'Monitor for swarming tendencies in Apis mellifera',
        'Begin colony division / queen rearing'
      ],
      floweringStatus: 'Shahi Litchi, Eucalyptus, Jamun, Citrus',
      keyRisks: ['Swarming', 'Insecticide sprays during fruit set']
    },
    SUMMER_HEAT_DEARTH: {
      months: [5, 6],
      seasonName: 'Grishma / Extreme Heat & Dearth',
      activityState: 'HEAT_STRESS_MANAGEMENT',
      recommendations: [
        'Provide thatched shade (chhappar) or shift apiary under dense tree canopy',
        'Keep gunny bags moist on hive roofs without wetting the inner covers',
        'Ensure fresh water with floating sticks within 20 meters to prevent drowning',
        'Do not open hives during peak afternoon sun (11 AM - 4 PM)'
      ],
      floweringStatus: 'Severe floral dearth; scattered neem or shisham pollen only',
      keyRisks: ['Comb melting inside hive', 'Colony absconding', 'Dehydration']
    },
    MONSOON_MAINTENANCE: {
      months: [7, 8],
      seasonName: 'Varsha / Monsoon High Humidity & Wax Moth Vigil',
      activityState: 'PEST_DEFENSE_AND_FEEDING',
      recommendations: [
        'Keep hives slightly tilted forward so rain does not enter entrance',
        'Scrape bottom board clean of cappings and wax debris weekly',
        'Provide 1:1 sugar syrup feeding with thymol or medicinal support if required',
        'Deploy hornet/wasp traps around apiary perimeter'
      ],
      floweringStatus: 'Maize pollen, scattered weeds',
      keyRisks: ['Greater wax moth (Galleria mellonella)', 'Vespa orientalis & Vespa cincta', 'Ants']
    },
    AUTUMN_BUILDUP: {
      months: [9, 10],
      seasonName: 'Sharad / Pre-Mustard Multiplication & Build-up',
      activityState: 'COLONY_BUILDUP',
      recommendations: [
        'Feed stimulative sugar syrup to accelerate queen egg-laying',
        'Replace old, black, irregular combs with fresh foundation sheets',
        'Prepare transport and migration logistics towards early mustard belts'
      ],
      floweringStatus: 'Torai, Sesame, Early Toria, Weeds',
      keyRisks: ['Robbing', 'Ectoparasitic mite surge']
    }
  },

  WESTERN_GHATS_SOUTHERN: {
    RUBBER_HONEY_FLOW: {
      months: [1, 2, 3],
      seasonName: 'Rubber Plantation Extra-Floral Honey Flow',
      activityState: 'SURPLUS_NECTAR_STORAGE',
      recommendations: [
        'Migrate colonies to mature rubber estates (Hevea brasiliensis) as new leaves flush',
        'Nectar exudes from extra-floral nectaries at base of tender leaflets',
        'Extract honey frequently (every 4-6 days) due to high volume flow and ambient humidity',
        'Use refractometer: ensure moisture is under 20% or ripen in solar drying sheds'
      ],
      floweringStatus: 'Rubber tender leaves, Coffee, Cardamom, Tamarind',
      keyRisks: ['High honey moisture content due to coastal/ghat humidity']
    },
    SUMMER_DEARTH: {
      months: [4, 5],
      seasonName: 'Pre-Monsoon Dry Dearth',
      activityState: 'MAINTENANCE',
      recommendations: [
        'Provide shade from scorching coastal/ghat sun',
        'Maintain continuous fresh water sources',
        'Prevent robbing by narrowing hive entrance flight-gate'
      ],
      floweringStatus: 'Scattered forest flora, Coconut',
      keyRisks: ['Robbing', 'Ant attacks (Oecophylla smaragdina weaver ants)']
    },
    HEAVY_SOUTHWEST_MONSOON: {
      months: [6, 7, 8],
      seasonName: 'Heavy South-West Monsoon Dearth & Rain Protection',
      activityState: 'SEVERE_DEARTH_SURVIVAL',
      recommendations: [
        'Protect hives with waterproof rain covers / plastic sheets without suffocating ventilation',
        'Artificial sugar syrup feeding is mandatory to prevent starvation and mass absconding of Apis cerana',
        'Inspect weekly for Thai Sacbrood Virus (TSBV) and European Foulbrood (EFB)',
        'Check ant wells (oil-filled cups on hive stand legs)'
      ],
      floweringStatus: 'Continuous torrential rains; zero foraging flight possible',
      keyRisks: ['Mass absconding (especially Apis cerana)', 'Starvation', 'Fungal mold on combs']
    },
    POST_MONSOON_FOREST_FLOW: {
      months: [9, 10, 11, 12],
      seasonName: 'Post-Monsoon Forest Multifloral Flow',
      activityState: 'AUTUMN_HARVEST_AND_STINGLESS_FLOW',
      recommendations: [
        'Harvest medicinal forest honey and stingless bee Cheruthen',
        'Multiply colonies and rear young queens',
        'Inspect brood chamber for healthy contiguous brood'
      ],
      floweringStatus: 'Wild forest trees, Strobilanthes (Kurunji), Coconut, Banana',
      keyRisks: ['Pest wasps', 'Drone culling if flow tapers']
    }
  }
};

export function evaluateSeasonalContext({ state, district, month = new Date().getMonth() + 1, customFlora = null }) {
  const region = resolveAgroClimaticRegion(state);
  const regionPattern = SEASONAL_PATTERNS[region.code] || SEASONAL_PATTERNS.INDO_GANGETIC_PLAINS;

  let activeSeasonKey = null;
  let activeSeasonData = null;

  for (const [key, data] of Object.entries(regionPattern)) {
    if (data.months.includes(month)) {
      activeSeasonKey = key;
      activeSeasonData = data;
      break;
    }
  }

  if (!activeSeasonData) {
    const firstKey = Object.keys(regionPattern)[0];
    activeSeasonKey = firstKey;
    activeSeasonData = regionPattern[firstKey];
  }

  return {
    month,
    state: state || 'National Context',
    district: district || 'Cluster Area',
    agroClimaticRegion: region.name,
    agroClimaticRegionCode: region.code,
    seasonKey: activeSeasonKey,
    seasonName: activeSeasonData.seasonName,
    activityState: activeSeasonData.activityState,
    floweringStatus: customFlora || activeSeasonData.floweringStatus,
    recommendations: activeSeasonData.recommendations,
    keyRisks: activeSeasonData.keyRisks,
    isHoneyFlowSeason: activeSeasonData.activityState === 'SURPLUS_NECTAR_STORAGE'
  };
}

// ============================================================================
// 4. COLONY BIOLOGICAL ENTITY (Strictly Distinct from Physical Hive Housing)
// ============================================================================

export const COLONY_LIFECYCLE_STATES = {
  INTRODUCED: 'INTRODUCED',
  ESTABLISHED: 'ESTABLISHED',
  DIVIDED: 'DIVIDED',
  STRENGTHENED: 'STRENGTHENED',
  WEAKENED: 'WEAKENED',
  SWARM_PREPARATION: 'SWARM_PREP',
  MIGRATED: 'MIGRATED',
  ABSCONDED: 'ABSCONDED',
  LOST: 'LOST',
  TRANSFERRED: 'TRANSFERRED'
};

export const QUEEN_LAYING_STATUSES = {
  MATED_PROLIFIC: 'MATED_PROLIFIC',
  MATED_NORMAL: 'MATED_NORMAL',
  VIRGIN_UNMATED: 'VIRGIN_UNMATED',
  DRONE_LAYER: 'DRONE_LAYER',
  SUPERSEDURE_IN_PROGRESS: 'SUPERSEDURE',
  QUEENLESS: 'QUEENLESS'
};

export function createColonyEntity({
  colonyId,
  colonyCode,
  hiveId,
  apiaryId,
  beeSpecies = 'APIS_CERANA_INDICA',
  queen = {},
  strength = {},
  temperament = 'CALM',
  status = 'ESTABLISHED'
}) {
  return {
    colonyId: colonyId || `col-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    colonyCode: colonyCode || `COL-${Math.floor(1000 + Math.random() * 9000)}`,
    hiveId: hiveId || null,
    apiaryId: apiaryId || null,
    beeSpecies,
    queen: {
      queenId: queen.queenId || `qn-${Date.now()}`,
      markedColor: queen.markedColor || 'GREEN_2025',
      layingStatus: queen.layingStatus || QUEEN_LAYING_STATUSES.MATED_NORMAL,
      origin: queen.origin || 'NATURAL_EMERGENCY_CELL',
      introductionDate: queen.introductionDate || new Date().toISOString().split('T')[0]
    },
    strength: {
      adultBeeCoveragePercent: strength.adultBeeCoveragePercent || 75,
      broodFramesCount: strength.broodFramesCount || 6,
      honeyFramesCount: strength.honeyFramesCount || 2,
      pollenFramesCount: strength.pollenFramesCount || 1,
      overallRating: strength.overallRating || 'STRONG'
    },
    temperament,
    status,
    biologicalEvents: [
      {
        timestamp: new Date().toISOString(),
        eventType: status,
        notes: 'Colony biological record initialized'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ============================================================================
// 5. APIARY AS A FIRST-CLASS ENTITY
// ============================================================================

export const APIARY_SITE_EVALUATION_FACTORS = {
  WATER_AVAILABILITY: ['EXCELLENT_WITHIN_50M', 'MODERATE_WITHIN_200M', 'POOR_REQUIRES_ARTIFICIAL_SOURCE'],
  FORAGE_DENSITY: ['HIGH_DIVERSE_FLOW', 'MODERATE_SEASONAL_FLOW', 'DEARTH_LOW_FORAGE'],
  PESTICIDE_RISK: ['ORGANIC_REMOTE_BUFFER', 'LOW_INTENSITY_FARMING', 'HIGH_INTENSIVE_CROP_SPRAY_ZONE'],
  WIND_AND_SHADE: ['EXCELLENT_NATURAL_WINDBREAK_SHADE', 'MODERATE', 'EXPOSED_HIGH_HEAT_OR_WIND'],
  DRAINAGE_AND_FLOOD_SAFETY: ['WELL_DRAINED_SLOPE', 'LEVEL_GROUND', 'WATERLOG_PRONE_RISK']
};

export function createApiaryEntity({
  apiaryId,
  apiaryCode,
  name,
  ownerId = null,
  operatorName,
  organizationId = null,
  location = {},
  siteAssessment = {},
  nbhmRegistrationNumber = null,
  hiveCount = 0,
  activeHiveCount = 0,
  status = 'ACTIVE'
}) {
  if (!apiaryCode || typeof apiaryCode !== 'string' || !apiaryCode.trim()) {
    throw new Error('Apiary requires a non-empty, unique apiaryCode (e.g. AP1, AP-PULWAMA-01)');
  }

  return {
    apiaryId: apiaryId || `ap-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    apiaryCode: apiaryCode.trim().toUpperCase(),
    name: name || `Apiary ${apiaryCode}`,
    ownerId,
    operatorName: operatorName || 'Certified Apiarist',
    organizationId,
    location: {
      country: 'India',
      state: location.state || 'Punjab',
      district: location.district || 'Hoshiarpur',
      taluk: location.taluk || location.block || 'Dasuya',
      village: location.village || location.locality || 'Village Central',
      pincode: location.pincode || null,
      latitude: location.latitude != null ? parseFloat(location.latitude) : null,
      longitude: location.longitude != null ? parseFloat(location.longitude) : null,
      elevationMeters: location.elevationMeters != null ? parseFloat(location.elevationMeters) : null
    },
    siteAssessment: {
      waterAvailability: siteAssessment.waterAvailability || 'OBSERVED',
      waterDistanceMeters: siteAssessment.waterDistanceMeters || 40,
      forageContext: siteAssessment.forageContext || 'Surrounding mustard & eucalyptus fields',
      nearbyAgriculture: siteAssessment.nearbyAgriculture || ['Mustard', 'Wheat', 'Berseem'],
      pesticideRiskContext: siteAssessment.pesticideRiskContext || 'REPORTED_LOW_SPRAY',
      drainageQuality: siteAssessment.drainageQuality || 'GOOD',
      observationStatus: siteAssessment.observationStatus || 'OBSERVED',
      lastAssessedAt: new Date().toISOString()
    },
    nbhmRegistrationNumber: nbhmRegistrationNumber || null,
    hiveCount: parseInt(hiveCount, 10) || 0,
    activeHiveCount: parseInt(activeHiveCount, 10) || 0,
    seasonalNotes: 'Seasonal honey flow monitoring active',
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ============================================================================
// 6. HIVE AS A FIRST-CLASS ENTITY & STRICT UNIQUENESS
// ============================================================================

export const HIVE_BOX_STANDARDS = {
  LANGSTROTH_STANDARD: 'Langstroth 10-Frame (Mellifera standard)',
  BIS_TYPE_A: 'BIS Type A (8-Frame Indian Hive Bee Cerana standard)',
  BIS_TYPE_B: 'BIS Type B (10-Frame Indian Hive Bee Cerana standard)',
  NEWTON_HIVE: 'Newton Hive (Classic Southern Cerana standard)',
  STINGLESS_BEE_BOX: 'TNAU/KAU Stingless Cerumen Box',
  TOP_BAR_HIVE: 'Kenyan / Indian Top Bar Movable Comb Hive'
};

export function validateHiveCodeUniqueness(hiveCode, apiaryId, existingHives = []) {
  if (!hiveCode || !hiveCode.trim()) {
    return { valid: false, error: 'Hive code is required and cannot be empty' };
  }
  const cleanCode = hiveCode.trim().toUpperCase();
  const collision = existingHives.find(h => 
    h.apiaryId === apiaryId && 
    h.status !== 'RETIRED' && 
    h.status !== 'DECOMMISSIONED' && 
    (h.hiveCode?.toUpperCase() === cleanCode || h.code?.toUpperCase() === cleanCode)
  );

  if (collision) {
    return {
      valid: false,
      error: `Hive code '${cleanCode}' is already registered and active in Apiary ${apiaryId}. No two active hives within the same apiary scope can have the same identifier.`
    };
  }
  return { valid: true };
}

export function createHiveEntity({
  hiveId,
  hiveCode,
  apiaryId,
  colonyId = null,
  hiveType = 'LANGSTROTH_STANDARD',
  beeSpecies = 'APIS_MELLIFERA',
  boxTiersCount = 2,
  installationDate = null,
  locationContext = 'Row 1, Box 4',
  status = 'OCCUPIED',
  notes = ''
}, existingHives = []) {
  const uniqueness = validateHiveCodeUniqueness(hiveCode, apiaryId, existingHives);
  if (!uniqueness.valid) {
    throw new Error(uniqueness.error);
  }

  return {
    hiveId: hiveId || `hive-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    hiveCode: hiveCode.trim().toUpperCase(),
    apiaryId,
    colonyId,
    hiveType,
    beeSpecies,
    boxTiersCount: parseInt(boxTiersCount, 10) || 2,
    installationDate: installationDate || new Date().toISOString().split('T')[0],
    locationContext,
    status,
    notes,
    lastInspectionDate: null,
    lastHealthObservationDate: null,
    lastHarvestDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ============================================================================
// 7. FRAME / COMB TRACKING & TRACEABILITY
// ============================================================================

export const FRAME_TYPES = {
  BROOD_FRAME: 'BROOD_FRAME',
  SUPER_HONEY_FRAME: 'SUPER_HONEY_FRAME',
  COMB_FOUNDATION: 'COMB_FOUNDATION',
  DRAWN_EMPTY_COMB: 'DRAWN_EMPTY_COMB',
  DRONE_COMB: 'DRONE_COMB'
};

export const FRAME_LIFECYCLE_STATES = {
  REGISTERED: 'REGISTERED',
  IN_HIVE: 'IN_HIVE',
  UNDER_INSPECTION: 'UNDER_INSPECTION',
  READY_FOR_HARVEST: 'READY_FOR_HARVEST',
  HARVESTED: 'HARVESTED',
  TRANSFERRED: 'TRANSFERRED'
};

export function createFrameEntity({
  frameId,
  frameNumber,
  hiveId,
  hiveCode,
  apiaryId,
  apiaryCode,
  frameType = 'SUPER_HONEY_FRAME',
  status = 'IN_HIVE',
  cappingPercent = 0
}) {
  const cleanApiary = (apiaryCode || 'AP1').toUpperCase();
  const cleanHive = (hiveCode || 'H001').toUpperCase();
  const cleanFrame = (frameNumber || 'F1').toUpperCase();
  const traceabilityCode = `${cleanApiary}${cleanHive}${cleanFrame}`;

  return {
    frameId: frameId || `frame-${cleanApiary.toLowerCase()}-${cleanHive.toLowerCase()}-${cleanFrame.toLowerCase()}`,
    frameNumber: cleanFrame,
    traceabilityCode,
    hiveId,
    hiveCode: cleanHive,
    apiaryId,
    apiaryCode: cleanApiary,
    frameType,
    status,
    cappingPercent: parseInt(cappingPercent, 10) || 0,
    inspectionHistory: [],
    observationHistory: [],
    harvestHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ============================================================================
// 8. HEALTH, PEST, DISEASE & BIOSECURITY DOMAIN
// ============================================================================

export const THREAT_CATEGORIES = {
  DISEASE: 'DISEASE',
  PARASITE: 'PARASITE',
  PEST: 'PEST',
  PREDATOR: 'PREDATOR',
  ENVIRONMENTAL_STRESS: 'ENVIRONMENTAL_STRESS',
  PESTICIDE_EXPOSURE: 'PESTICIDE_EXPOSURE',
  OTHER_HEALTH_CONCERN: 'OTHER_HEALTH_CONCERN'
};

export const HEALTH_FINDING_LEVELS = {
  OBSERVATION: 'OBSERVATION',
  POSSIBLE_CONCERN: 'POSSIBLE_CONCERN',
  AI_ASSISTED_FINDING: 'AI_ASSISTED_FINDING',
  CONFIRMED_DIAGNOSIS: 'CONFIRMED_DIAGNOSIS'
};

export const COMMON_INDIAN_APICULTURE_THREATS = [
  {
    id: 'VARROA_MITE',
    category: 'PARASITE',
    scientificName: 'Varroa destructor / Varroa jacobsoni',
    commonName: 'Varroa Mite',
    targetSpecies: ['APIS_MELLIFERA'],
    typicalSymptoms: ['Deformed wings in newly emerged bees', 'Spotty brood pattern', 'Reddish-brown oval mites visible on thorax'],
    seasonalPrevalence: 'Post-monsoon and autumn buildup'
  },
  {
    id: 'THAI_SACBROOD_VIRUS',
    category: 'DISEASE',
    scientificName: 'Thai Sacbrood Virus (TSBV)',
    commonName: 'Thai Sacbrood Disease',
    targetSpecies: ['APIS_CERANA_INDICA'],
    typicalSymptoms: ['Larvae die inside sealed cells and turn into pointed fluid-filled sacs', 'Head of pupa turns dark brown/black', 'Sunken cappings with pinholes'],
    seasonalPrevalence: 'Early spring build-up and monsoon dearth'
  },
  {
    id: 'EUROPEAN_FOULBROOD',
    category: 'DISEASE',
    scientificName: 'Melissococcus plutonius',
    commonName: 'European Foulbrood (EFB)',
    targetSpecies: ['APIS_MELLIFERA', 'APIS_CERANA_INDICA'],
    typicalSymptoms: ['Larvae die in coiled/C-shaped stage before capping', 'Larval color turns from pearly white to dull yellow and brown', 'Sour fermentation odor'],
    seasonalPrevalence: 'Monsoon dearth and stress periods'
  },
  {
    id: 'GREATER_WAX_MOTH',
    category: 'PEST',
    scientificName: 'Galleria mellonella',
    commonName: 'Greater Wax Moth',
    targetSpecies: ['APIS_CERANA_INDICA', 'APIS_MELLIFERA'],
    typicalSymptoms: ['Silken webbing tunnels through combs', 'Fecal pellets (frass) in comb bottom', 'Combs reduced to mass of webbing'],
    seasonalPrevalence: 'Extremely severe during warm, humid monsoon months (July - September)'
  },
  {
    id: 'YELLOW_BANDED_WASPS',
    category: 'PREDATOR',
    scientificName: 'Vespa cincta / Vespa magnifica / Vespa orientalis',
    commonName: 'Yellow-Banded Predatory Hornet / Wasp',
    targetSpecies: ['APIS_CERANA_INDICA', 'APIS_MELLIFERA'],
    typicalSymptoms: ['Hornets hover at hive entrance catching returning foragers', 'Severed bee thoraxes at entrance', 'Bees stop foraging and cluster inside entrance'],
    seasonalPrevalence: 'Late monsoon through autumn (August - November)'
  }
];

export function createHealthObservation({
  observationId,
  hiveId,
  colonyId,
  apiaryId,
  category = THREAT_CATEGORIES.OBSERVATION,
  threatId = null,
  threatName = 'General colony condition check',
  findingLevel = HEALTH_FINDING_LEVELS.OBSERVATION,
  observedSymptoms = [],
  aiVisionConfidence = null,
  recommendedAction = '',
  evidence = []
}) {
  if (findingLevel === HEALTH_FINDING_LEVELS.CONFIRMED_DIAGNOSIS && (!evidence || evidence.length === 0)) {
    throw new Error('CONFIRMED_DIAGNOSIS requires formal diagnostic lab evidence or certified specialist inspection');
  }

  let presentationTitle = threatName;
  let presentationBadge = 'Observation';

  if (findingLevel === HEALTH_FINDING_LEVELS.AI_ASSISTED_FINDING) {
    presentationTitle = `Possible concern detected: ${threatName}`;
    presentationBadge = 'AI-Assisted Screening (Check Recommended)';
  } else if (findingLevel === HEALTH_FINDING_LEVELS.POSSIBLE_CONCERN) {
    presentationTitle = `Signs worth checking: ${threatName}`;
    presentationBadge = 'Field Concern Flagged';
  } else if (findingLevel === HEALTH_FINDING_LEVELS.CONFIRMED_DIAGNOSIS) {
    presentationTitle = `Confirmed: ${threatName}`;
    presentationBadge = 'Verified Diagnosis';
  }

  return {
    observationId: observationId || `obs-hlth-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    hiveId,
    colonyId,
    apiaryId,
    timestamp: new Date().toISOString(),
    category,
    threatId,
    threatName,
    findingLevel,
    presentationTitle,
    presentationBadge,
    observedSymptoms: Array.isArray(observedSymptoms) ? observedSymptoms : [observedSymptoms],
    aiVisionConfidence: aiVisionConfidence != null ? parseFloat(aiVisionConfidence) : null,
    recommendedAction: recommendedAction || 'Continue routine surveillance and inspect bottom board',
    evidence: Array.isArray(evidence) ? evidence : [],
    createdAt: new Date().toISOString()
  };
}

// ============================================================================
// 9. HYGIENE & SANITATION OPERATIONAL WORKFLOW
// ============================================================================

export const HYGIENE_OPERATION_TYPES = {
  HIVE_TOOL_DISINFECTION: 'Hive tool flaming & soda-ash washing',
  BOTTOM_BOARD_CLEANING: 'Bottom board scraping & debris disposal',
  SOLAR_WAX_MELTING: 'Extraction of discarded old combs in solar melter',
  BOX_SCORCHING_FLAMING: 'Blowlamp scorching of wooden boxes prior to restocking',
  EQUIPMENT_SANITATION: 'Centrifugal extractor & honey tank hot water sanitization',
  PERSONNEL_HYGIENE_CHECK: 'Veil, overall and glove cleanliness inspection'
};

export function createHygieneObservation({
  recordId,
  apiaryId,
  hiveId = null,
  operationType = 'HIVE_TOOL_DISINFECTION',
  performedBy = 'Beekeeper',
  methodUsed = 'Flame sterilization',
  notes = '',
  evidence = []
}) {
  return {
    recordId: recordId || `hyg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    apiaryId,
    hiveId,
    timestamp: new Date().toISOString(),
    operationType,
    operationDescription: HYGIENE_OPERATION_TYPES[operationType] || operationType,
    performedBy,
    methodUsed,
    notes,
    evidence,
    createdAt: new Date().toISOString()
  };
}

// ============================================================================
// 10. PESTICIDE EXPOSURE RISK MONITORING
// ============================================================================

export const PESTICIDE_EXPOSURE_STAGES = {
  REPORTED_EXPOSURE: 'REPORTED_EXPOSURE',
  RISK_OBSERVATION: 'RISK_OBSERVATION',
  MANAGEMENT_ACTION_TAKEN: 'MANAGEMENT_ACTION_TAKEN',
  FOLLOW_UP_COMPLETED: 'FOLLOW_UP_COMPLETED'
};

export function createPesticideExposureObservation({
  exposureId,
  apiaryId,
  nearbyCrop = 'Mustard / Apple',
  suspectedChemicalClass = 'UNKNOWN',
  symptomSeverity = 'MILD_DISORIENTATION',
  observedSigns = [],
  actionTaken = 'Provided 1:1 sugar syrup to detoxify foragers and closed entrance with mesh',
  evidence = []
}) {
  return {
    exposureId: exposureId || `pest-exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    apiaryId,
    timestamp: new Date().toISOString(),
    nearbyCrop,
    suspectedChemicalClass,
    symptomSeverity,
    observedSigns: Array.isArray(observedSigns) ? observedSigns : [observedSigns],
    actionTaken,
    status: PESTICIDE_EXPOSURE_STAGES.REPORTED_EXPOSURE,
    evidence,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ============================================================================
// 11. POLLINATION SERVICE CONTEXT
// ============================================================================

export function createPollinationContext({
  pollinationId,
  apiaryId,
  cropName = 'Apple',
  orchardistFarmerName = 'Orchard Farmer',
  locationDescription = 'Upper Orchard Basin',
  startDate,
  endDate,
  hivesDeployedCount = 10,
  observations = 'Active blossom foraging noted; good fruit set anticipated'
}) {
  return {
    pollinationId: pollinationId || `pol-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    apiaryId,
    cropName,
    orchardistFarmerName,
    locationDescription,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || null,
    hivesDeployedCount: parseInt(hivesDeployedCount, 10) || 1,
    observations,
    createdAt: new Date().toISOString()
  };
}

// ============================================================================
// 12. HIVE PRODUCTS EXTENSIBILITY
// ============================================================================

export const HIVE_PRODUCT_TYPES = {
  HONEY: { id: 'HONEY', label: 'Honey (Raw / Monofloral / Multifloral)', fssaiCategory: '11.1 - Honey & Hive Products' },
  BEESWAX: { id: 'BEESWAX', label: 'Pure Beeswax (Cappings wax / Comb wax)', fssaiCategory: 'Industrial / Cosmetic' },
  BEE_POLLEN: { id: 'BEE_POLLEN', label: 'Bee Pollen Granules', fssaiCategory: 'Nutraceutical' },
  PROPOLIS: { id: 'PROPOLIS', label: 'Raw Propolis / Tincture', fssaiCategory: 'Medicinal / Herbal' },
  ROYAL_JELLY: { id: 'ROYAL_JELLY', label: 'Fresh Royal Jelly', fssaiCategory: 'High-Value Nutraceutical' },
  LIVE_COLONIES: { id: 'LIVE_COLONIES', label: 'Nucleus / Division Colony Sales', fssaiCategory: 'Live Biological Stock' },
  BEE_VENOM: { id: 'BEE_VENOM', label: 'Apitoxin (Bee Venom)', fssaiCategory: 'Pharmaceutical' }
};

// ============================================================================
// 13. HONEY COLLECTION ≠ DOWNSTREAM PROCESSING (UNBROKEN SOURCE LINEAGE)
// ============================================================================

export function createHarvestRecord({
  harvestId,
  harvestCode,
  apiaryId,
  apiaryCode,
  hiveId,
  hiveCode,
  frameIds = [],
  colonyId = null,
  tareWeightKg = 1.2,
  grossWeightKg = 14.8,
  floralSource = 'Mustard',
  fieldRefractometerMoisture = 18.2,
  harvestingBeekeeper = 'Apiarist',
  notes = ''
}) {
  const netHoneyKg = Math.max(0, parseFloat((grossWeightKg - tareWeightKg).toFixed(2)));
  const cleanCode = harvestCode || `HAR-${(apiaryCode || 'AP1')}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    harvestId: harvestId || `har-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    harvestCode: cleanCode,
    apiaryId,
    apiaryCode,
    hiveId,
    hiveCode,
    frameIds: Array.isArray(frameIds) ? frameIds : [frameIds],
    colonyId,
    harvestTimestamp: new Date().toISOString(),
    tareWeightKg: parseFloat(tareWeightKg),
    grossWeightKg: parseFloat(grossWeightKg),
    netHoneyKg,
    floralSource,
    fieldRefractometerMoisture: parseFloat(fieldRefractometerMoisture),
    isMoistureCompliant: fieldRefractometerMoisture <= 20.0,
    harvestingBeekeeper,
    notes,
    status: 'HARVESTED_AT_APIARY',
    createdAt: new Date().toISOString()
  };
}

export function createCollectionLot({
  lotId,
  lotCode,
  fpoId = null,
  collectionCenterName = 'FPO Primary Aggregation Depot',
  sourceHarvests = []
}) {
  const cleanCode = lotCode || `LOT-${Math.floor(10000 + Math.random() * 90000)}`;
  const totalWeightKg = sourceHarvests.reduce((acc, h) => acc + (parseFloat(h.netHoneyKg) || 0), 0);
  const sourceApiaries = Array.from(new Set(sourceHarvests.map(h => h.apiaryCode || h.apiaryId).filter(Boolean)));
  const sourceHives = Array.from(new Set(sourceHarvests.map(h => h.hiveCode || h.hiveId).filter(Boolean)));

  return {
    lotId: lotId || `lot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    lotCode: cleanCode,
    fpoId,
    collectionCenterName,
    sourceHarvests: sourceHarvests.map(h => ({
      harvestId: h.harvestId,
      harvestCode: h.harvestCode,
      apiaryCode: h.apiaryCode,
      hiveCode: h.hiveCode,
      netHoneyKg: h.netHoneyKg,
      floralSource: h.floralSource
    })),
    sourceApiaries,
    sourceHives,
    totalWeightKg: parseFloat(totalWeightKg.toFixed(2)),
    intakeTimestamp: new Date().toISOString(),
    status: 'AGGREGATED_AT_COLLECTION_DEPOT'
  };
}

export function createProcessingBatch({
  batchId,
  batchCode,
  facilityId,
  facilityName = 'Honey Processing Facility',
  sourceCollectionLots = [],
  sourceDirectHarvests = [],
  processingParameters = {}
}) {
  const cleanCode = batchCode || `PB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const allHarvestReferences = [];
  const allApiaryCodes = new Set();
  const allHiveCodes = new Set();

  sourceCollectionLots.forEach(lot => {
    (lot.sourceHarvests || []).forEach(h => {
      allHarvestReferences.push(h);
      if (h.apiaryCode) allApiaryCodes.add(h.apiaryCode);
      if (h.hiveCode) allHiveCodes.add(h.hiveCode);
    });
  });

  sourceDirectHarvests.forEach(h => {
    allHarvestReferences.push(h);
    if (h.apiaryCode) allApiaryCodes.add(h.apiaryCode);
    if (h.hiveCode) allHiveCodes.add(h.hiveCode);
  });

  return {
    batchId: batchId || `pb-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    batchCode: cleanCode,
    facilityId,
    facilityName,
    lineageSources: {
      collectionLotCodes: sourceCollectionLots.map(l => l.lotCode),
      sourceHarvestCodes: allHarvestReferences.map(h => h.harvestCode),
      apiaryCodes: Array.from(allApiaryCodes),
      hiveCodes: Array.from(allHiveCodes),
      sourceCount: allHarvestReferences.length
    },
    processingSteps: [
      {
        stepName: 'INTAKE_AND_INSPECTION',
        timestamp: new Date().toISOString(),
        temperatureCelsius: processingParameters.intakeTemp || 28.0,
        meshSizeMicrons: null,
        operator: 'Processing In-charge'
      }
    ],
    qualityStatus: 'PENDING_LAB_ANALYSIS',
    status: 'IN_PROCESSING',
    createdAt: new Date().toISOString()
  };
}

// ============================================================================
// 14. QUALITY TESTING (FSSAI, AGMARK & CODEX COMPLIANCE)
// ============================================================================

export const FSSAI_HONEY_STANDARDS = {
  MOISTURE_PERCENT_MAX: 20.0,
  HMF_MG_PER_KG_MAX: 80.0,
  SUCROSE_PERCENT_MAX: 5.0,
  FRUCTOSE_GLUCOSE_RATIO_MIN: 0.95,
  POLLEN_COUNT_MIN_PER_10G: 25000,
  C4_SUGARS_PERCENT_MAX: 7.0
};

export function evaluateHoneyQualityCompliance(metrics = {}) {
  const moisture = parseFloat(metrics.moisture);
  const hmf = parseFloat(metrics.hmf);
  const fgRatio = parseFloat(metrics.fructoseGlucoseRatio);
  const sucrose = parseFloat(metrics.sucrose);
  const c4Sugars = parseFloat(metrics.c4Sugars);

  const violations = [];
  if (!isNaN(moisture) && moisture > FSSAI_HONEY_STANDARDS.MOISTURE_PERCENT_MAX) {
    violations.push(`Moisture exceeds FSSAI threshold (${moisture}% > 20.0%)`);
  }
  if (!isNaN(hmf) && hmf > FSSAI_HONEY_STANDARDS.HMF_MG_PER_KG_MAX) {
    violations.push(`HMF exceeds maximum limit (${hmf} mg/kg > 80.0 mg/kg)`);
  }
  if (!isNaN(fgRatio) && fgRatio < FSSAI_HONEY_STANDARDS.FRUCTOSE_GLUCOSE_RATIO_MIN) {
    violations.push(`Fructose/Glucose ratio below FSSAI standard (${fgRatio} < 0.95)`);
  }
  if (!isNaN(sucrose) && sucrose > FSSAI_HONEY_STANDARDS.SUCROSE_PERCENT_MAX) {
    violations.push(`Sucrose content higher than permitted (${sucrose}% > 5.0%)`);
  }
  if (!isNaN(c4Sugars) && c4Sugars > FSSAI_HONEY_STANDARDS.C4_SUGARS_PERCENT_MAX) {
    violations.push(`C4 added sugar adulteration detected (${c4Sugars}% > 7.0%)`);
  }

  const isCompliant = violations.length === 0;
  return {
    isCompliant,
    violations,
    agmarkGrade: isCompliant && moisture <= 18.0 ? 'SPECIAL_GRADE_A' : (isCompliant ? 'STANDARD_GRADE' : 'NON_COMPLIANT'),
    summary: isCompliant ? 'Meets FSSAI Raw Honey Quality Specifications' : `Non-compliant: ${violations.join(', ')}`
  };
}

// ============================================================================
// 15. OFFLINE SYNCHRONIZATION ARCHITECTURE
// ============================================================================

export const SYNC_STATES = {
  PENDING_SYNC: 'PENDING_SYNC',
  SYNCED: 'SYNCED',
  SYNC_FAILED: 'SYNC_FAILED',
  CONFLICT: 'CONFLICT'
};

export class OfflineSyncManager {
  constructor(storageKey = 'honeychain_offline_sync_queue_v1') {
    this.storageKey = storageKey;
    this.inMemoryQueue = [];
  }

  getQueue() {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
      }
      return this.inMemoryQueue;
    } catch (_) {
      return this.inMemoryQueue;
    }
  }

  enqueue(operation) {
    const queue = this.getQueue();
    const item = {
      queueId: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      entityType: operation.entityType,
      entityId: operation.entityId,
      action: operation.action || 'CREATE',
      payload: operation.payload,
      timestamp: new Date().toISOString(),
      syncState: SYNC_STATES.PENDING_SYNC,
      retryCount: 0,
      conflictDetails: null
    };

    queue.push(item);
    this._saveQueue(queue);
    return item;
  }

  markSynced(queueId) {
    const queue = this.getQueue();
    const updated = queue.filter(item => item.queueId !== queueId);
    this._saveQueue(updated);
  }

  markFailed(queueId, errorMsg) {
    const queue = this.getQueue();
    const item = queue.find(i => i.queueId === queueId);
    if (item) {
      item.syncState = SYNC_STATES.SYNC_FAILED;
      item.retryCount += 1;
      item.lastError = errorMsg;
      item.lastAttemptAt = new Date().toISOString();
      this._saveQueue(queue);
    }
  }

  markConflict(queueId, conflictDetails) {
    const queue = this.getQueue();
    const item = queue.find(i => i.queueId === queueId);
    if (item) {
      item.syncState = SYNC_STATES.CONFLICT;
      item.conflictDetails = conflictDetails;
      this._saveQueue(queue);
    }
  }

  getPendingCount() {
    return this.getQueue().filter(i => i.syncState === SYNC_STATES.PENDING_SYNC).length;
  }

  clearQueue() {
    this._saveQueue([]);
  }

  _saveQueue(queue) {
    this.inMemoryQueue = queue;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(queue));
      }
    } catch (_) {}
  }
}

// ============================================================================
// 16. LOCAL LANGUAGE READINESS (Domain Dictionary for i18n)
// ============================================================================

export const APICULTURE_I18N_DICTIONARY = {
  en: {
    apiary: 'Apiary (Bee Farm)',
    hive: 'Hive Box',
    colony: 'Bee Colony',
    frame: 'Comb Frame',
    inspection: 'Colony Inspection',
    harvest: 'Honey Harvest',
    healthObservation: 'Bee Health Observation',
    pesticideRisk: 'Pesticide Risk Alert',
    hygiene: 'Sanitation & Hygiene',
    processing: 'Honey Processing Facility',
    quality: 'Quality & Traceability',
    fpo: 'Farmer Producer Organization (FPO)',
    queen: 'Queen Bee',
    worker: 'Worker Bee',
    drone: 'Drone Bee',
    brood: 'Brood Comb'
  },
  hi: {
    apiary: 'मधुमक्खी शाला (एपियरी)',
    hive: 'मधुमक्खी का डिब्बा (छत्ता)',
    colony: 'मक्खी परिवार (कॉलोनी)',
    frame: 'फ्रेम (कॉम्ब)',
    inspection: 'कालोनी निरीक्षण',
    harvest: 'शहद की कटाई / निष्कासन',
    healthObservation: 'स्वास्थ्य व रोग अवलोकन',
    pesticideRisk: 'कीटनाशक जोखिम चेतावनी',
    hygiene: 'स्वच्छता व सैनिटेशन',
    processing: 'शहद प्रसंस्करण इकाई',
    quality: 'गुणवत्ता व ट्रैसेबिलिटी',
    fpo: 'किसान उत्पादक संगठन (FPO)',
    queen: 'रानी मक्खी',
    worker: 'श्रमिक मक्खी',
    drone: 'नर मक्खी (ड्रोन)',
    brood: 'शिशु कोष्ठ (अंडे-बच्चे)'
  },
  ta: {
    apiary: 'தேனீப் பண்ணை',
    hive: 'தேனீப் பெட்டி',
    colony: 'தேனீக் குடும்பம் (கூட்டம்)',
    frame: 'தேனீ சட்டம் (பிரேம்)',
    inspection: 'பெட்டி ஆய்வு',
    harvest: 'தேன் அறுவடை',
    healthObservation: 'தேனீ நலம் & நோய் கண்காணிப்பு',
    pesticideRisk: 'பூச்சிக்கொல்லி எச்சரிக்கை',
    hygiene: 'சுகாதாரம் & தூய்மை',
    processing: 'தேன் பதப்படுத்தும் நிலையம்',
    quality: 'தரம் மற்றும் சுவடு அறிதல்',
    fpo: 'விவசாயிகள் உற்பத்தியாளர் அமைப்பு (FPO)',
    queen: 'ராணித் தேனீ',
    worker: 'வேலைக்காரத் தேனீ',
    drone: 'ஆண் தேனீ',
    brood: 'புழுக்கள் / அடை'
  }
};

export function getDomainTerm(key, lang = 'en') {
  const dict = APICULTURE_I18N_DICTIONARY[lang] || APICULTURE_I18N_DICTIONARY.en;
  return dict[key] || APICULTURE_I18N_DICTIONARY.en[key] || key;
}
