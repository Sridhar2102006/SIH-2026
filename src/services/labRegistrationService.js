/**
 * HONEYCHAIN — LABORATORY REGISTRATION & VERIFICATION SERVICE
 *
 * Implements the controlled, multi-step Laboratory Registration workflow (§3–§12):
 * Step 1: LAB IDENTITY (Name, Lab Type)
 * Step 2: LAB ORGANIZATION (Legal entity, ownership, contact, address, state, district, PIN)
 * Step 3: RESPONSIBLE PERSONS (Lab Owner, Technical Manager, Quality Manager, Food Analyst, Signatory)
 * Step 4: LEGAL & CREDENTIAL DOCUMENTS (Checklist dynamically resolved by lab type & jurisdiction)
 * Step 5: NABL ACCREDITATION & SCOPE MATRIX (Parameter -> Method -> Version -> Accredited flag)
 * Step 6: REGULATORY STATUS (FSSAI InFoLNeT reference, validity, gazette citation)
 * Step 7: FACILITY & CONTROLLED AREAS (Receiving, clean testing rooms, storage)
 * Step 8: INITIAL EQUIPMENT REGISTER (Calibrated instruments, certificates)
 * Step 9: INITIAL TEST METHODS REGISTER (AOAC, Winkler, Phadebas, Louveaux)
 */

export const LAB_TYPES = Object.freeze([
  {
    id: 'FOOD_TESTING_LAB',
    label: 'Food Testing Laboratory',
    description: 'Commercial or specialized food analysis facility operating under ISO/IEC 17025 standards.',
    defaultCategories: ['PHYSICAL', 'CHEMICAL', 'ADULTERATION_RESIDUE']
  },
  {
    id: 'RESEARCH_LAB',
    label: 'Research Laboratory',
    description: 'Independent, scientific, or apicultural research facility performing pure or applied studies.',
    defaultCategories: ['PHYSICAL', 'CHEMICAL', 'MICROSCOPICAL']
  },
  {
    id: 'ACADEMIC_INSTITUTIONAL',
    label: 'Academic / Institutional Laboratory',
    description: 'University, agricultural institute, or government college analytical facility.',
    defaultCategories: ['PHYSICAL', 'MICROSCOPICAL']
  },
  {
    id: 'PRIVATE_TESTING',
    label: 'Private Testing Laboratory',
    description: 'Third-party contract analytical testing facility serving industry clients.',
    defaultCategories: ['PHYSICAL', 'CHEMICAL', 'ADULTERATION_RESIDUE']
  },
  {
    id: 'GOVERNMENT_LAB',
    label: 'Government / State Food Laboratory',
    description: 'Public health, municipal, or state government regulatory testing laboratory.',
    defaultCategories: ['PHYSICAL', 'CHEMICAL', 'ADULTERATION_RESIDUE', 'MICROSCOPICAL']
  },
  {
    id: 'INDUSTRIAL_LAB',
    label: 'Industrial / In-House Processing Lab',
    description: 'Quality assurance laboratory embedded within a honey processing or packaging plant.',
    defaultCategories: ['PHYSICAL', 'CHEMICAL']
  }
]);

export const LAB_ROLES = Object.freeze([
  { id: 'LAB_OWNER', label: 'Laboratory Owner / Entity Head' },
  { id: 'LAB_MANAGER', label: 'Laboratory Director / General Manager' },
  { id: 'TECHNICAL_MANAGER', label: 'Technical Manager (ISO 17025 Clause 5)' },
  { id: 'QUALITY_MANAGER', label: 'Quality Assurance Manager' },
  { id: 'FOOD_ANALYST', label: 'Certified Food Analyst (FSSAI Recognized)' },
  { id: 'ANALYST', label: 'Analytical Testing Chemist / Microbiologist' },
  { id: 'AUTHORIZED_SIGNATORY', label: 'Authorized Certificate Signatory' }
]);

export const REGISTRATION_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
});

export const LabRegistrationService = {
  getLabTypes() {
    return LAB_TYPES;
  },

  getLabRoles() {
    return LAB_ROLES;
  },

  /**
   * Dynamically determines required document checklist based on lab type, activity & regulatory status (§7)
   */
  resolveRequiredDocuments({ labType, isAccredited, hasFssaiRecognition }) {
    const docs = [
      {
        id: 'ORG_REGISTRATION',
        title: 'Organization / Business Registration',
        required: true,
        description: 'Certificate of Incorporation, Trust Deed, or Society Registration.'
      },
      {
        id: 'LAB_AUTHORIZATION',
        title: 'Laboratory Operational Authorization',
        required: true,
        description: 'Board resolution or administrative appointment of laboratory head.'
      },
      {
        id: 'SIGNATORY_CREDENTIALS',
        title: 'Lead Analyst / Signatory Professional Credentials',
        required: true,
        description: 'Postgraduate degree in Chemistry/Biochemistry or Food Analyst certificate.'
      }
    ];

    if (isAccredited) {
      docs.push({
        id: 'NABL_CERTIFICATE',
        title: 'NABL ISO/IEC 17025 Accreditation Certificate & Scope Annexure',
        required: true,
        description: 'Valid certificate with official scope matrix listing accredited honey test methods.'
      });
    }

    if (hasFssaiRecognition || labType === 'FOOD_TESTING_LAB') {
      docs.push({
        id: 'FSSAI_NOTIFICATION',
        title: 'FSSAI InFoLNeT Notification / Gazette Reference',
        required: false,
        description: 'Official gazette notification number or InFoLNeT recognition order.'
      });
    }

    return docs;
  },

  /**
   * Builds canonical Accreditation Scope Matrix (§9)
   */
  buildAccreditationScopeMatrix(selectedMethods = [], isAccredited = true) {
    const standardScope = [
      {
        testKey: 'MOISTURE',
        parameter: 'Moisture Content',
        approvedMethod: 'AOAC 969.38 / ISO 2173 Digital Refractometry',
        standardVersion: '2026.1',
        isAccredited: selectedMethods.includes('MOISTURE') && isAccredited
      },
      {
        testKey: 'HMF',
        parameter: 'Hydroxymethylfurfural (HMF)',
        approvedMethod: 'Winkler Photometric Method / IHC Harmonised',
        standardVersion: '2026.1',
        isAccredited: selectedMethods.includes('HMF') && isAccredited
      },
      {
        testKey: 'DIASTASE',
        parameter: 'Diastase Enzyme Activity',
        approvedMethod: 'Phadebas Spectrophotometric Assay / Schade',
        standardVersion: '2026.1',
        isAccredited: selectedMethods.includes('DIASTASE') && isAccredited
      },
      {
        testKey: 'ELECTRICAL_CONDUCTIVITY',
        parameter: 'Electrical Conductivity',
        approvedMethod: 'IHC Harmonised Conductivity Cell at 20°C',
        standardVersion: '2026.1',
        isAccredited: selectedMethods.includes('ELECTRICAL_CONDUCTIVITY') && isAccredited
      },
      {
        testKey: 'POLLEN',
        parameter: 'Melissopalynology / Botanical Origin',
        approvedMethod: 'Louveaux Microscopic Centrifugation Standard',
        standardVersion: '2026.1',
        isAccredited: selectedMethods.includes('POLLEN') && isAccredited
      },
      {
        testKey: 'C4_SUGARS',
        parameter: 'C4 Sugar Stable Isotope Analysis (EA-IRMS)',
        approvedMethod: 'AOAC 998.12 / FSSAI Honey Manual 03',
        standardVersion: '2026.1',
        isAccredited: selectedMethods.includes('C4_SUGARS') && isAccredited
      }
    ];

    return standardScope;
  },

  /**
   * Validates and constructs the finalized laboratory registration envelope
   */
  submitRegistration(payload) {
    const errors = [];

    if (!payload.labName || payload.labName.trim().length < 3) {
      errors.push('Laboratory name must be at least 3 characters.');
    }
    if (!payload.labType) {
      errors.push('Laboratory classification type is required.');
    }
    if (!payload.officialEmail || !payload.officialEmail.includes('@')) {
      errors.push('A valid official laboratory email address is mandatory.');
    }
    if (!payload.contactPhone || payload.contactPhone.trim().length < 8) {
      errors.push('Contact telephone or mobile number is required.');
    }
    if (!payload.state || !payload.district) {
      errors.push('Operating state and district are mandatory.');
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const registrationId = `LAB-REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const registeredAt = new Date().toISOString();

    const registrationRecord = {
      registrationId,
      status: REGISTRATION_STATUSES.SUBMITTED,
      labName: payload.labName.trim(),
      labType: payload.labType,
      legalEntityName: payload.legalEntityName || payload.labName,
      officialEmail: payload.officialEmail.trim(),
      contactPhone: payload.contactPhone.trim(),
      address: payload.address || '',
      state: payload.state,
      district: payload.district,
      pinCode: payload.pinCode || '',
      responsiblePersons: payload.responsiblePersons || [
        {
          name: payload.contactPerson || 'Dr. Lead Chemist',
          role: 'TECHNICAL_MANAGER',
          email: payload.officialEmail
        }
      ],
      accreditation: {
        status: payload.accreditationStatus || 'APPLICATION_IN_PROGRESS',
        body: payload.accreditationBody || 'NABL',
        certificateNumber: payload.accreditationNumber || '',
        validUntil: payload.accreditationExpiry || '',
        scopeMatrix: this.buildAccreditationScopeMatrix(
          payload.testMethods || ['MOISTURE', 'HMF', 'DIASTASE', 'ELECTRICAL_CONDUCTIVITY'],
          payload.accreditationStatus === 'ACCREDITED'
        )
      },
      regulatory: {
        fssaiStatus: payload.fssaiStatus || 'SUBMITTED',
        infolnetRef: payload.fssaiRef || '',
        recognitionDate: payload.fssaiRecognitionDate || '',
        validUntil: payload.fssaiValidUntil || ''
      },
      facilities: payload.facilities || ['Sample Intake Receiving', 'Spectrophotometry Room', 'Controlled Sample Storage'],
      equipment: payload.equipment || ['EQ-REFR-01', 'EQ-SPEC-02', 'EQ-COND-01', 'EQ-MICR-03'],
      methods: payload.testMethods || ['MOISTURE', 'HMF', 'DIASTASE', 'ELECTRICAL_CONDUCTIVITY'],
      registeredAt
    };

    return {
      success: true,
      registrationRecord,
      message: `Laboratory registration ${registrationId} successfully submitted for verification.`
    };
  }
};

export const LAB_TYPES_MAP = Object.freeze({
  FOOD_TESTING: 'FOOD_TESTING_LAB',
  RESEARCH: 'RESEARCH_LAB',
  ACADEMIC: 'ACADEMIC_INSTITUTIONAL',
  PRIVATE_TESTING: 'PRIVATE_TESTING',
  GOVERNMENT: 'GOVERNMENT_LAB',
  INDUSTRIAL: 'INDUSTRIAL_LAB'
});

export function getRequiredDocumentChecklist(labType, regulatoryStatus) {
  const isAcc = regulatoryStatus === 'RECOGNIZED_NOTIFIED' || regulatoryStatus === 'ACCREDITED';
  const hasFssai = regulatoryStatus === 'RECOGNIZED_NOTIFIED';
  return LabRegistrationService.resolveRequiredDocuments({
    labType,
    isAccredited: isAcc,
    hasFssaiRecognition: hasFssai
  });
}

export function validateLabRegistration(payload, step = 1) {
  const errors = [];
  if (step === 1 || !step) {
    if (!payload?.labName || payload.labName.trim().length < 3) {
      errors.push('Laboratory name must be at least 3 characters.');
    }
    if (!payload?.labType) {
      errors.push('Laboratory classification type is required.');
    }
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}
