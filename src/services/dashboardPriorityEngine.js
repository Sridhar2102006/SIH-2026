/**
 * HoneyChain Human-Centered Dashboard Priority Engine
 *
 * Dynamically resolves personalized dashboard layout and section hierarchy based on:
 * User Access Profile + Active Alerts + Batch Status + Designation Weights
 *
 * Strict Rule: Never exposes technical RBAC or module IDs.
 */

export const DASHBOARD_SECTIONS = {
  HIVE_HEALTH: 'HIVE_HEALTH',
  ACTIVE_BATCHES: 'ACTIVE_BATCHES',
  QUALITY_CHECKS: 'QUALITY_CHECKS',
  DISTRIBUTION: 'DISTRIBUTION',
  FIELD_ACTIONS: 'FIELD_ACTIONS',
  ACTIVITY_TRAIL: 'ACTIVITY_TRAIL'
};

/**
 * Resolves the human-centered dashboard layout and section hierarchy.
 *
 * @param {Object} params
 * @param {Object} params.accessProfile - Authoritative access profile
 * @param {Array<string>} params.userDesignations - Confirmed designation IDs
 * @param {Array<Object>} params.hives - Live hive records
 * @param {Array<Object>} params.batches - Live batch records
 * @param {Array<Object>} params.activities - Recent activities
 * @returns {Array<Object>} Sorted list of prioritized dashboard sections
 */
export const resolveDashboardLayout = ({
  accessProfile = {},
  userDesignations = [],
  hives = [],
  batches = [],
  activities = []
} = {}) => {
  const moduleIds = accessProfile?.moduleIds || [];
  const desigsSet = new Set(userDesignations.map(d => typeof d === 'string' ? d.toUpperCase() : ''));

  // Access capability checks
  const canViewHives = moduleIds.includes('hive_view');
  const canViewBatches = moduleIds.includes('honey_batches') || moduleIds.includes('processing_records');
  const canViewQuality = moduleIds.includes('quality_checks') || moduleIds.includes('lab_records');
  const canViewDistribution = moduleIds.includes('inventory_stock') || moduleIds.includes('shipment_handling');

  // Operational signals
  const attentionHivesCount = hives.filter(h => h.status === 'attention').length;
  const curingBatchesCount = batches.filter(b => b.status === 'curing').length;
  const hasRecentAlert = activities.some(a => a.type === 'alert');

  const sectionCandidates = [];

  // 1. Hive Conditions / My Hives Section
  if (canViewHives) {
    let score = 50;
    if (desigsSet.has('BEEKEEPER')) score += 40;
    if (desigsSet.has('INSPECTOR')) score += 35;
    if (attentionHivesCount > 0) score += 25; // Urgent colony health alert boost
    if (hasRecentAlert) score += 10;

    sectionCandidates.push({
      id: DASHBOARD_SECTIONS.HIVE_HEALTH,
      humanTitle: 'Colony Conditions',
      category: 'YOUR HIVES',
      priorityScore: score,
      badgeText: attentionHivesCount > 0 ? `${attentionHivesCount} Colony Alert` : 'All Calm',
      badgeStatus: attentionHivesCount > 0 ? 'attention' : 'healthy',
      reason: attentionHivesCount > 0
        ? 'Prioritized due to colony attention alert'
        : 'Prioritized for beekeeping & field inspections'
    });
  }

  // 2. Active Curing Batches Section
  if (canViewBatches) {
    let score = 50;
    if (desigsSet.has('PROCESSOR')) score += 45;
    if (curingBatchesCount > 0) score += 20; // In-tank settling requires monitoring
    if (desigsSet.has('BEEKEEPER') && !canViewHives) score += 30;

    sectionCandidates.push({
      id: DASHBOARD_SECTIONS.ACTIVE_BATCHES,
      humanTitle: 'Active Batches',
      category: 'YOUR HONEY',
      priorityScore: score,
      badgeText: `${curingBatchesCount} Settling in Tank`,
      badgeStatus: curingBatchesCount > 0 ? 'attention' : 'healthy',
      reason: curingBatchesCount > 0
        ? 'Active extraction tanks require monitoring'
        : 'Honey extraction and lot traceability'
    });
  }

  // 3. Quality & Laboratory Purity Section
  if (canViewQuality) {
    let score = 50;
    if (desigsSet.has('LAB_SPECIALIST')) score += 50;
    if (desigsSet.has('INSPECTOR')) score += 25;
    if (desigsSet.has('PROCESSOR')) score += 20;

    sectionCandidates.push({
      id: DASHBOARD_SECTIONS.QUALITY_CHECKS,
      humanTitle: 'Quality & Lab Checks',
      category: 'QUALITY',
      priorityScore: score,
      badgeText: 'Purity Certified',
      badgeStatus: 'healthy',
      reason: 'Prioritized for laboratory purity and refractometry analysis'
    });
  }

  // 4. Inventory & Dispatches Section
  if (canViewDistribution) {
    let score = 50;
    if (desigsSet.has('DISTRIBUTOR')) score += 50;
    if (desigsSet.has('FACILITY_MANAGER')) score += 30;

    sectionCandidates.push({
      id: DASHBOARD_SECTIONS.DISTRIBUTION,
      humanTitle: 'Inventory & Dispatches',
      category: 'OPERATIONS',
      priorityScore: score,
      badgeText: 'Logistics Active',
      badgeStatus: 'healthy',
      reason: 'Prioritized for inventory tracking and retailer dispatches'
    });
  }

  // Sort sections by calculated multi-factor priorityScore in descending order
  const sortedSections = sectionCandidates.sort((a, b) => b.priorityScore - a.priorityScore);

  return sortedSections;
};
