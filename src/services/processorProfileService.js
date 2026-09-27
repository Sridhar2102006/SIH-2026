/**
 * HONEYCHAIN — PROCESSOR PROFILE & CONFIGURATION SERVICE
 *
 * Manages configuration-driven entities:
 * - Organizations & Multi-Facility Hierarchy
 * - Equipment Registry with Calibration Schedules
 * - Product & Market Profiles
 * - Versioned SOP Catalog
 */

import {
  INITIAL_ORGANIZATIONS,
  INITIAL_FACILITIES,
  INITIAL_EQUIPMENT_REGISTRY,
  INITIAL_PRODUCTS,
  INITIAL_MARKETS,
  WORK_DESCRIPTION_OPTIONS,
  ORGANIZATION_TYPE_OPTIONS
} from '../data/processor/processorSeedData.js';
import {
  PROCESSING_PROFILES,
  INITIAL_SOPS
} from '../data/processor/processingProfiles.js';

const ORG_STORAGE_KEY = 'hc_processor_organizations_v1';
const FACILITY_STORAGE_KEY = 'hc_processor_facilities_v1';
const EQUIPMENT_STORAGE_KEY = 'hc_processor_equipment_v1';
const SOP_STORAGE_KEY = 'hc_processor_sops_v1';

export const ProcessorProfileService = {
  getWorkDescriptionOptions() {
    return WORK_DESCRIPTION_OPTIONS;
  },

  getOrganizationTypeOptions() {
    return ORGANIZATION_TYPE_OPTIONS;
  },

  getOrganizations() {
    try {
      const saved = localStorage.getItem(ORG_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_ORGANIZATIONS;
  },

  getActiveOrganization() {
    const list = this.getOrganizations();
    return list && list.length > 0 ? list[0] : INITIAL_ORGANIZATIONS[0];
  },

  getActiveFacility() {
    const list = this.getFacilities();
    return list && list.length > 0 ? list[0] : INITIAL_FACILITIES[0];
  },

  getActiveSOP() {
    const list = this.getSops();
    return list && list.length > 0 ? list[0] : INITIAL_SOPS[0];
  },

  getFacilities(organizationId = null) {
    try {
      const saved = localStorage.getItem(FACILITY_STORAGE_KEY);
      const list = saved ? JSON.parse(saved) : INITIAL_FACILITIES;
      if (organizationId) {
        return list.filter(f => f.organizationId === organizationId);
      }
      return list;
    } catch (_) {
      return INITIAL_FACILITIES;
    }
  },

  getFacilityById(facilityId) {
    const list = this.getFacilities();
    return list.find(f => f.id === facilityId) || list[0];
  },

  getEquipment(facilityId = null) {
    try {
      const saved = localStorage.getItem(EQUIPMENT_STORAGE_KEY);
      const list = saved ? JSON.parse(saved) : INITIAL_EQUIPMENT_REGISTRY;
      if (facilityId) {
        return list.filter(e => e.facilityId === facilityId);
      }
      return list;
    } catch (_) {
      return INITIAL_EQUIPMENT_REGISTRY;
    }
  },

  getProducts() {
    return INITIAL_PRODUCTS;
  },

  getMarkets() {
    return INITIAL_MARKETS;
  },

  getProcessingProfiles() {
    return PROCESSING_PROFILES;
  },

  getSops(facilityId = null) {
    try {
      const saved = localStorage.getItem(SOP_STORAGE_KEY);
      const list = saved ? JSON.parse(saved) : INITIAL_SOPS;
      if (facilityId) {
        return list.filter(s => !s.facilityId || s.facilityId === facilityId);
      }
      return list;
    } catch (_) {
      return INITIAL_SOPS;
    }
  },

  createSopVersion({ baseSopId, newVersion, updatedParameters, updatedSteps, approvedBy }) {
    const sops = this.getSops();
    const baseSop = sops.find(s => s.id === baseSopId);
    if (!baseSop) return { success: false, error: 'Base SOP not found' };

    const newSop = {
      ...baseSop,
      id: `${baseSop.code}-V${newVersion.replace('.', '_')}`,
      version: newVersion,
      effectiveFrom: new Date().toISOString().split('T')[0],
      approvedBy: approvedBy || 'Plant Quality Lead',
      approvedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      parameters: { ...(baseSop.parameters || {}), ...(updatedParameters || {}) },
      steps: updatedSteps || baseSop.steps
    };

    const updatedList = [newSop, ...sops];
    try {
      localStorage.setItem(SOP_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (_) {}

    return { success: true, sop: newSop };
  },

  saveCustomOrganizationAndFacility({
    organizationName,
    organizationType,
    workDescription,
    businessScale,
    state,
    district,
    facilityName,
    selectedEquipment = [],
    selectedProfileCode = 'COMMERCIAL_RETAIL'
  }) {
    const orgId = `org-${Date.now()}`;
    const facId = `fac-${Date.now()}`;

    const newOrg = {
      id: orgId,
      name: organizationName || 'My Honey Processing Enterprise',
      type: organizationType || 'FPO',
      workDescription: workDescription || 'HONEY_PROCESSING',
      operatingScale: businessScale || 'SMALL',
      primaryState: state || 'Maharashtra',
      primaryDistrict: district || 'Pune',
      facilitiesCount: 1,
      activeBeekeepersLinked: 12,
      status: 'ACTIVE'
    };

    const newFac = {
      id: facId,
      organizationId: orgId,
      name: facilityName || `${organizationName || 'Central'} Processing Facility`,
      code: `FAC-${(state || 'IN').substring(0, 2).toUpperCase()}-01`,
      facilityType: 'PRIMARY_PROCESSING',
      location: {
        country: 'India',
        state: state || 'Maharashtra',
        district: district || 'Pune',
        locality: 'Industrial Zone'
      },
      capacityKgPerDay: 500,
      storageCapacityKg: 10000,
      operatingScale: businessScale || 'SMALL',
      processingCapabilities: ['RECEIVING', 'SOURCE_VERIFICATION', 'INCOMING_INSPECTION', 'SAMPLING', 'COARSE_STRAINING', 'SETTLING', 'QUALITY_CHECK', 'PACKAGING_PREPARATION'],
      laboratoryAccess: 'ON_SITE_SCREENING_PLUS_EXTERNAL_ACCREDITED',
      status: 'ACTIVE',
      leadSupervisor: 'Facility Lead'
    };

    const currentOrgs = this.getOrganizations();
    const currentFacs = this.getFacilities();

    try {
      localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify([newOrg, ...currentOrgs]));
      localStorage.setItem(FACILITY_STORAGE_KEY, JSON.stringify([newFac, ...currentFacs]));
    } catch (_) {}

    return {
      organization: newOrg,
      facility: newFac
    };
  }
};
