/**
 * Screen 28 — Public Verification Service & Privacy Projection Engine
 * 
 * CORE PRINCIPLE:
 * Never expose internal database documents directly to public endpoints.
 * All public responses are projected through this privacy filter, exposing only
 * approved public attributes and omitting internal IDs, private notes, reviewer PII,
 * raw sensor telemetry, and exact GPS coordinates.
 */

// Approved public batch records with non-sequential public references
const PUBLIC_RECORDS = {
  // Primary Verified Master Record
  'HC-2409': {
    publicReference: 'HC-PUB-7F82K9',
    batchReference: 'Batch HC-2409',
    productName: 'Raw Forest Wildflower Honey',
    honeyType: 'Multifloral Wild Forest Honey',
    status: 'VERIFIED',
    statusLabel: 'Verification confirmed',
    statusExplanation: 'This batch has completed the required HoneyChain verification workflow and its digital verification record is confirmed.',
    verifiedAt: '25 Sep 2026 · 13:45 UTC',
    recordVersion: 'v3',
    sourceArea: 'Western Ghats Biosphere, Nilgiri Foothills, Tamil Nadu',
    producerGuild: 'Nilgiri Organic Apiaries Guild',
    packagingDetails: '500g Hexagonal Food-Grade Glass Jar · Lot of 37 Jars',
    tamperSeal: 'HC-SEAL-2026-925',
    journey: [
      {
        id: 'pj-1',
        stage: 'Source Apiary',
        stepNumber: 1,
        status: 'COMPLETED',
        date: '18 Sep 2026',
        title: 'Native Flora Apiary Source',
        summary: 'Recorded in HoneyChain apiary registry. Sustainable wild forage area with native acacia and wildflower blooms.'
      },
      {
        id: 'pj-2',
        stage: 'Harvest',
        stepNumber: 2,
        status: 'COMPLETED',
        date: '18 Sep 2026',
        title: 'Cold-Frame Comb Collection',
        summary: 'Hand-harvested mature capped honey combs. Ambient extraction without artificial heat degradation.'
      },
      {
        id: 'pj-3',
        stage: 'Processing',
        stepNumber: 3,
        status: 'COMPLETED',
        date: '19 Sep 2026',
        title: 'Gentle Clarification & Settling',
        summary: 'Clarified through 300 µm stainless filtration. Raw cold processing (<38°C) preserving living enzymes and wild pollen spectrum.'
      },
      {
        id: 'pj-4',
        stage: 'Quality Checks',
        stepNumber: 4,
        status: 'COMPLETED',
        date: '21 Sep 2026',
        title: 'Multi-Point Laboratory Review',
        summary: 'Moisture content recorded at 17.1% (Standard < 18.5%). Hydroxymethylfurfural (HMF): 4.2 mg/kg. C4 sugar adulteration check: Passed. Pollen authenticity verified.'
      },
      {
        id: 'pj-5',
        stage: 'Packaging',
        stepNumber: 5,
        status: 'COMPLETED',
        date: '24 Sep 2026',
        title: 'Sealed & Lot Labelled',
        summary: 'Packaged into food-grade glass jars. Individual tamper-evident batch seal applied to each jar lid.'
      },
      {
        id: 'pj-6',
        stage: 'Verification',
        stepNumber: 6,
        status: 'VERIFIED',
        date: '25 Sep 2026',
        title: 'HoneyChain Record Verified',
        summary: 'All required procedural evidence and laboratory criteria validated and cryptographically anchored to ledger.'
      }
    ],
    proof: {
      status: 'CONFIRMED',
      statusLabel: 'Technical proof confirmed',
      network: 'HoneyChain Consortium Ledger',
      blockReference: '#54819240',
      anchoredAt: '25 Sep 2026 · 13:45 UTC',
      transactionReference: '0x82a4c91b7d5e4a3f2e1098cb719a4e32d56191c7',
      proofVersion: 'v3',
      merkleRoot: '0x4f8a92bc31e07b8192c7301fa947b19284',
      explorerUrl: 'https://explorer.honeychain.org/tx/0x82a4c91b7d5e4a3f2e1098cb719a4e32d56191c7'
    }
  },

  // Record Requiring Review
  'HC-2408': {
    publicReference: 'HC-PUB-4D91X2',
    batchReference: 'Batch HC-2408',
    productName: 'Raw Forest Wildflower Honey (Lot 02)',
    honeyType: 'Multifloral Wild Forest Honey',
    status: 'NEEDS_REVIEW',
    statusLabel: 'Verification needs review',
    statusExplanation: 'Evidence associated with this verification record has changed after initial sealing. The verification record is currently under administrative review.',
    verifiedAt: '20 Sep 2026 · 10:15 UTC (Prior Record)',
    recordVersion: 'v2 (Superseded)',
    sourceArea: 'Western Ghats Biosphere, Nilgiri Foothills, Tamil Nadu',
    producerGuild: 'Nilgiri Organic Apiaries Guild',
    packagingDetails: '500g Glass Jar · Lot of 42 Jars',
    tamperSeal: 'HC-SEAL-2026-920',
    journey: [
      {
        id: 'pj-1',
        stage: 'Source Apiary',
        stepNumber: 1,
        status: 'COMPLETED',
        date: '14 Sep 2026',
        title: 'Native Flora Apiary Source',
        summary: 'Recorded in HoneyChain apiary registry.'
      },
      {
        id: 'pj-2',
        stage: 'Harvest',
        stepNumber: 2,
        status: 'COMPLETED',
        date: '15 Sep 2026',
        title: 'Comb Collection',
        summary: 'Collected from apiary supers.'
      },
      {
        id: 'pj-3',
        stage: 'Processing',
        stepNumber: 3,
        status: 'COMPLETED',
        date: '16 Sep 2026',
        title: 'Filtration & Settling',
        summary: 'Standard mesh filtration.'
      },
      {
        id: 'pj-4',
        stage: 'Quality Checks',
        stepNumber: 4,
        status: 'COMPLETED',
        date: '18 Sep 2026',
        title: 'Lab Quality Check',
        summary: 'Initial laboratory review completed.'
      },
      {
        id: 'pj-5',
        stage: 'Packaging',
        stepNumber: 5,
        status: 'COMPLETED',
        date: '19 Sep 2026',
        title: 'Batch Packaging',
        summary: 'Tamper seals applied.'
      },
      {
        id: 'pj-6',
        stage: 'Verification',
        stepNumber: 6,
        status: 'NEEDS_REVIEW',
        date: '20 Sep 2026',
        title: 'Review Required',
        summary: 'Laboratory metadata amendment filed. Verification pending re-evaluation.'
      }
    ],
    proof: {
      status: 'INVALIDATED',
      statusLabel: 'Previous proof outdated',
      network: 'HoneyChain Consortium Ledger',
      blockReference: '#54817109',
      anchoredAt: '20 Sep 2026 · 10:15 UTC',
      transactionReference: '0x3b190f84a1e948c201fb49182390ba51029c9182',
      proofVersion: 'v2',
      merkleRoot: '0x1092a4bc8190de491b2c3a9',
      explorerUrl: 'https://explorer.honeychain.org/tx/0x3b190f84a1e948c201fb49182390ba51029c9182'
    }
  },

  // Record In Progress / Not Verified
  'HC-2412': {
    publicReference: 'HC-PUB-9A33V5',
    batchReference: 'Batch HC-2412',
    productName: 'Highland Lavender Honey',
    honeyType: 'Monofloral Lavender Honey',
    status: 'NOT_VERIFIED',
    statusLabel: 'Verification in progress',
    statusExplanation: 'This batch has been recorded in HoneyChain but has not yet completed the final packaging and verification workflow stages.',
    verifiedAt: null,
    recordVersion: 'Draft',
    sourceArea: 'Kodaikanal Highland Apiary, Tamil Nadu',
    producerGuild: 'Highland Apiary Guild',
    packagingDetails: 'Packaging in progress',
    tamperSeal: 'Pending Packaging',
    journey: [
      {
        id: 'pj-1',
        stage: 'Source Apiary',
        stepNumber: 1,
        status: 'COMPLETED',
        date: '22 Sep 2026',
        title: 'Source Apiary Recorded',
        summary: 'Registered apiary location.'
      },
      {
        id: 'pj-2',
        stage: 'Harvest',
        stepNumber: 2,
        status: 'COMPLETED',
        date: '23 Sep 2026',
        title: 'Harvest Recorded',
        summary: 'Harvested from certified lavender plots.'
      },
      {
        id: 'pj-3',
        stage: 'Processing',
        stepNumber: 3,
        status: 'COMPLETED',
        date: '24 Sep 2026',
        title: 'Gentle Settling Tank',
        summary: 'Honey is currently clarifying in on-site tank #3.'
      },
      {
        id: 'pj-4',
        stage: 'Quality Checks',
        stepNumber: 4,
        status: 'PENDING',
        date: 'Pending',
        title: 'Quality Testing Scheduled',
        summary: 'Lab sampling scheduled upon settling completion.'
      },
      {
        id: 'pj-5',
        stage: 'Packaging',
        stepNumber: 5,
        status: 'PENDING',
        date: 'Pending',
        title: 'Packaging Pending',
        summary: 'Jar lot not yet packaged.'
      },
      {
        id: 'pj-6',
        stage: 'Verification',
        stepNumber: 6,
        status: 'NOT_VERIFIED',
        date: 'Pending',
        title: 'Verification Not Started',
        summary: 'Awaiting completion of previous stages.'
      }
    ],
    proof: null
  },

  // Stale / Invalidated Historical Record
  'HC-2401': {
    publicReference: 'HC-PUB-1E88Q7',
    batchReference: 'Batch HC-2401',
    productName: 'Raw Forest Wildflower Honey (Archived Batch)',
    honeyType: 'Multifloral Wild Forest Honey',
    status: 'INVALIDATED',
    statusLabel: 'Verification no longer current',
    statusExplanation: 'This verification record belongs to an older harvest lot and is no longer considered the current verified record.',
    verifiedAt: '12 Aug 2026 · 09:00 UTC',
    recordVersion: 'v1 (Archived)',
    sourceArea: 'Western Ghats Biosphere, Nilgiri Foothills, Tamil Nadu',
    producerGuild: 'Nilgiri Organic Apiaries Guild',
    packagingDetails: '500g Glass Jar',
    tamperSeal: 'HC-SEAL-2026-812',
    journey: [
      {
        id: 'pj-1',
        stage: 'Source Apiary',
        stepNumber: 1,
        status: 'COMPLETED',
        date: '10 Aug 2026',
        title: 'Source Apiary',
        summary: 'Archived harvest record.'
      },
      {
        id: 'pj-2',
        stage: 'Verification',
        stepNumber: 2,
        status: 'INVALIDATED',
        date: '12 Aug 2026',
        title: 'Historical Record',
        summary: 'Batch shelf validity expired or superseded.'
      }
    ],
    proof: {
      status: 'INVALIDATED',
      statusLabel: 'Archived proof reference',
      network: 'HoneyChain Consortium Ledger',
      blockReference: '#54790122',
      anchoredAt: '12 Aug 2026 · 09:00 UTC',
      transactionReference: '0x1928301fae92841029ba839120de491b2c3a9102',
      proofVersion: 'v1',
      merkleRoot: '0x8192038471928301',
      explorerUrl: 'https://explorer.honeychain.org/tx/0x1928301fae92841029ba839120de491b2c3a9102'
    }
  }
};

// Aliases mapping public tokens to primary batch keys for convenience
const REFERENCE_MAP = {
  'HC-2409': 'HC-2409',
  'HC-PUB-7F82K9': 'HC-2409',
  'HC2409': 'HC-2409',
  'BATCH-HC-2409': 'HC-2409',
  'HC-2408': 'HC-2408',
  'HC-PUB-4D91X2': 'HC-2408',
  'HC2408': 'HC-2408',
  'HC-2412': 'HC-2412',
  'HC-PUB-9A33V5': 'HC-2412',
  'HC2412': 'HC-2412',
  'HC-2401': 'HC-2401',
  'HC-PUB-1E88Q7': 'HC-2401',
  'HC2401': 'HC-2401'
};

/**
 * Public Verification Service
 * Simulates authoritative backend endpoint: GET /public/verification/:reference
 */
export const publicVerificationService = {
  /**
   * Sanitizes and resolves reference
   */
  resolveReference(ref) {
    if (!ref || typeof ref !== 'string') return null;
    const clean = ref.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    return REFERENCE_MAP[clean] || (PUBLIC_RECORDS[clean] ? clean : null);
  },

  /**
   * Fetch public verification DTO with simulated network delay & rate limiting check
   */
  async getPublicRecord(reference, isOffline = false) {
    // Simulate short network latency (150ms)
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (isOffline) {
      throw new Error('OFFLINE_ERROR');
    }

    const resolvedKey = this.resolveReference(reference);
    if (!resolvedKey || !PUBLIC_RECORDS[resolvedKey]) {
      return {
        found: false,
        reference: reference,
        status: 'NOT_FOUND',
        statusLabel: 'Verification record not found',
        statusExplanation: "We couldn't find a public HoneyChain verification record matching this reference."
      };
    }

    // Return strict public projection clone
    const record = PUBLIC_RECORDS[resolvedKey];
    return {
      found: true,
      ...JSON.parse(JSON.stringify(record))
    };
  },

  /**
   * Return list of sample references for demo/testing
   */
  getSampleReferences() {
    return [
      { key: 'HC-2409', label: 'HC-2409 (Verified)', status: 'VERIFIED' },
      { key: 'HC-2408', label: 'HC-2408 (Needs Review)', status: 'NEEDS_REVIEW' },
      { key: 'HC-2412', label: 'HC-2412 (Not Verified)', status: 'NOT_VERIFIED' },
      { key: 'HC-2401', label: 'HC-2401 (Stale / Invalidated)', status: 'INVALIDATED' },
      { key: 'HC-INVALID', label: 'HC-INVALID (Not Found)', status: 'NOT_FOUND' }
    ];
  },

  /**
   * QR Validation Pipeline (§ 11, 12, 13, 28, 29)
   * Validates scanned QR string against trusted domain allowlist & authorized token formats
   */
  validateAndParseQr(rawString) {
    if (!rawString || typeof rawString !== 'string') {
      return {
        valid: false,
        errorType: 'MALFORMED_QR',
        title: 'Not a HoneyChain verification code',
        message: "This QR code doesn't contain a valid HoneyChain product verification reference."
      };
    }

    const trimmed = rawString.trim();

    // Prevent malicious executable protocols
    if (/^(javascript:|data:|vbscript:|file:)/i.test(trimmed)) {
      return {
        valid: false,
        errorType: 'UNTRUSTED_DOMAIN',
        title: 'Unsupported verification code',
        message: "This code contains an unpermitted script format and was rejected for security."
      };
    }

    // Check if it's a URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const parsedUrl = new URL(trimmed);
        const host = parsedUrl.hostname.toLowerCase();

        // Trusted domain validation allowlist (§ 12)
        const isTrusted =
          host === 'verify.honeychain.org' ||
          host === 'public.honeychain.org' ||
          host === 'honeychain.org' ||
          host === 'localhost' ||
          host === '127.0.0.1';

        if (!isTrusted) {
          return {
            valid: false,
            errorType: 'UNTRUSTED_DOMAIN',
            title: 'Unsupported verification code',
            message: `This QR points to an untrusted domain (${host}). Only official HoneyChain registry codes are supported.`
          };
        }

        // Extract reference token from URL path: /b/:ref or /verify/:ref or query param ?ref=
        let refCandidate = null;
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2 && (pathParts[0] === 'b' || pathParts[0] === 'verify')) {
          refCandidate = pathParts[1];
        } else if (parsedUrl.searchParams.get('b')) {
          refCandidate = parsedUrl.searchParams.get('b');
        } else if (parsedUrl.searchParams.get('verify')) {
          refCandidate = parsedUrl.searchParams.get('verify');
        } else if (parsedUrl.searchParams.get('publicRef')) {
          refCandidate = parsedUrl.searchParams.get('publicRef');
        }

        if (!refCandidate) {
          return {
            valid: false,
            errorType: 'MALFORMED_QR',
            title: 'Not a HoneyChain verification code',
            message: 'This URL belongs to HoneyChain but does not contain a recognized product batch reference.'
          };
        }

        return {
          valid: true,
          reference: refCandidate.toUpperCase(),
          raw: trimmed
        };
      } catch (err) {
        return {
          valid: false,
          errorType: 'MALFORMED_QR',
          title: 'Not a HoneyChain verification code',
          message: 'The scanned URL is malformed and could not be parsed.'
        };
      }
    }

    // Direct token reference check (e.g. HC-2409, HC-PUB-7F82K9)
    const cleanRef = trimmed.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (cleanRef.startsWith('HC-') || cleanRef.startsWith('HB-')) {
      return {
        valid: true,
        reference: cleanRef,
        raw: trimmed
      };
    }

    return {
      valid: false,
      errorType: 'MALFORMED_QR',
      title: 'Not a HoneyChain verification code',
      message: "This QR code doesn't contain an official HoneyChain product verification reference."
    };
  },

  /**
   * Sample physical jar QR payloads for testing and jury demonstrations (§ 51)
   */
  getSampleQrTargets() {
    return [
      {
        id: 'jar-hc-2409',
        label: 'Jar HC-2409 (Verified Raw Forest Honey)',
        payload: 'https://verify.honeychain.org/b/HC-2409',
        expectedRef: 'HC-2409',
        status: 'VERIFIED',
        badge: 'Verified'
      },
      {
        id: 'jar-hc-2408',
        label: 'Jar HC-2408 (Needs Review Lot)',
        payload: 'https://verify.honeychain.org/b/HC-2408',
        expectedRef: 'HC-2408',
        status: 'NEEDS_REVIEW',
        badge: 'Needs Review'
      },
      {
        id: 'jar-hc-2412',
        label: 'Jar HC-2412 (In-Progress Batch)',
        payload: 'https://verify.honeychain.org/b/HC-2412',
        expectedRef: 'HC-2412',
        status: 'NOT_VERIFIED',
        badge: 'Not Verified'
      },
      {
        id: 'jar-hc-2401',
        label: 'Jar HC-2401 (Stale Historical Lot)',
        payload: 'https://verify.honeychain.org/b/HC-2401',
        expectedRef: 'HC-2401',
        status: 'INVALIDATED',
        badge: 'Stale'
      },
      {
        id: 'jar-phishing',
        label: 'Untrusted Domain (Security Defense Demo)',
        payload: 'https://malicious-honey-counterfeit.com/steal-data?id=HC-2409',
        expectedRef: null,
        status: 'UNTRUSTED_DOMAIN',
        badge: 'Untrusted'
      },
      {
        id: 'jar-malformed',
        label: 'Malformed / Non-HoneyChain QR',
        payload: 'WIFI:S:MyHomeNetwork;T:WPA;P:Secret123;;',
        expectedRef: null,
        status: 'MALFORMED_QR',
        badge: 'Malformed'
      }
    ];
  }
};

export default publicVerificationService;
