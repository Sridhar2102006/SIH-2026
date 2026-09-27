import { CAPABILITY_MAP } from './capabilityRegistry.js';
import { evaluateCanonicalDesignationEligibility } from './designationEngine.js';
import { resolveCanonicalPermissionsAndModules } from './permissionEngine.js';
import { logAccessEvent } from './authoritativeAccessService.js';
import { CAPABILITY_POLICY_VERSION, ONBOARDING_ENGINE_VERSION } from './onboardingIntelligenceService.js';

export const confirmUserCapabilityProfile = ({
  userId = 'usr-current',
  workspaceId = 'ws-default',
  candidateCapabilities = [],
  confirmedCapabilities = [],
  verifiedCapabilities = [],
  candidateDesignations = [],
  confirmedDesignations = [],
  sources = [],
  previousProfile = null
} = {}) => {
  const knownCandidates = new Set(candidateCapabilities.filter(id => {
    const capability = CAPABILITY_MAP.get(id);
    return capability && !['SYSTEM_ONLY', 'PRIVILEGED'].includes(capability.capabilityClass);
  }));
  const verified = new Set(verifiedCapabilities.filter(id => knownCandidates.has(id)));
  const requested = new Set(confirmedCapabilities.filter(id => knownCandidates.has(id)));
  const verificationRequired = Array.from(requested).filter(id =>
    CAPABILITY_MAP.get(id)?.verificationRequired && !verified.has(id)
  );
  const finalCapabilities = Array.from(requested).filter(id => !verificationRequired.includes(id));

  const eligibility = evaluateCanonicalDesignationEligibility(Array.from(knownCandidates));
  const eligibleDesignations = new Set(eligibility.suggestions.map(result => result.designationId));
  const candidateDesignationSet = new Set(candidateDesignations);
  const finalDesignations = Array.from(new Set(confirmedDesignations)).filter(id =>
    candidateDesignationSet.has(id) && eligibleDesignations.has(id)
  );

  const access = resolveCanonicalPermissionsAndModules({
    confirmedCapabilities: finalCapabilities,
    verifiedCapabilities: Array.from(verified)
  });
  const now = new Date().toISOString();
  const eventTypes = [
    ...Array.from(knownCandidates, capabilityId => ({ eventType: 'CAPABILITY_CANDIDATE_CREATED', capabilityId })),
    ...finalCapabilities.map(capabilityId => ({ eventType: 'CAPABILITY_CONFIRMED', capabilityId })),
    ...verificationRequired.map(capabilityId => ({ eventType: 'CAPABILITY_REQUIRES_VERIFICATION', capabilityId })),
    ...finalDesignations.map(designationId => ({ eventType: 'DESIGNATION_CONFIRMED', designationId }))
  ];
  const events = eventTypes.map(({ eventType, capabilityId, designationId }) => logAccessEvent({
    eventType,
    actor: 'SELF_CONFIRMATION',
    targetUserId: userId,
    previousState: previousProfile ? { policyVersion: previousProfile.policyVersion } : null,
    newState: capabilityId ? { capabilityId } : { designationId },
    reason: 'Explicit onboarding confirmation evaluated by deterministic policy'
  }));

  const profile = {
    userId,
    workspaceId,
    confirmedCapabilities: finalCapabilities,
    candidateCapabilities: Array.from(knownCandidates),
    verificationRequired,
    verifiedCapabilities: Array.from(verified),
    confirmedDesignations: finalDesignations,
    source: sources.filter(source => knownCandidates.has(source.capabilityId)),
    policyVersion: CAPABILITY_POLICY_VERSION,
    onboardingVersion: ONBOARDING_ENGINE_VERSION,
    createdAt: previousProfile?.createdAt || now,
    updatedAt: now,
    auditReference: events.at(-1)?.eventId || null
  };

  return { profile, eligibility, access, events };
};