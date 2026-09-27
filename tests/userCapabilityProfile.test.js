import assert from 'node:assert/strict';
import { confirmUserCapabilityProfile } from '../src/services/userCapabilityProfileService.js';

const result = confirmUserCapabilityProfile({
  userId: 'user-1',
  workspaceId: 'workspace-1',
  candidateCapabilities: ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'LAB_INSPECTION', 'USER_MANAGE'],
  confirmedCapabilities: ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'LAB_INSPECTION', 'USER_MANAGE'],
  candidateDesignations: ['BEEKEEPER'],
  confirmedDesignations: ['BEEKEEPER', 'FACILITY_MANAGER'],
  sources: [{ capabilityId: 'HIVE_MANAGEMENT', source: 'DIRECT_USER_SIGNAL' }]
});

assert.deepEqual(result.profile.confirmedCapabilities, ['HIVE_MANAGEMENT', 'HIVE_INSPECTION']);
assert.deepEqual(result.profile.verificationRequired, ['LAB_INSPECTION']);
assert.deepEqual(result.profile.confirmedDesignations, ['BEEKEEPER']);
assert.ok(result.access.moduleIds.includes('hive_view'));
assert.ok(!result.access.moduleIds.includes('lab_records'));
assert.deepEqual(result.access.effectiveCapabilities.includes('USER_MANAGE'), false);
assert.equal(result.profile.policyVersion, 12);
assert.equal(typeof result.profile.auditReference, 'string');
assert.ok(result.events.some(event => event.eventType === 'CAPABILITY_REQUIRES_VERIFICATION'));

console.log('User capability profile tests passed.');