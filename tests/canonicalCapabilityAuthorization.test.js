import assert from 'node:assert/strict';
import {
  ACTION_PERMISSIONS,
  canPerformAction,
  resolveCanonicalPermissionsAndModules
} from '../src/services/permissionEngine.js';

const inferredOnly = resolveCanonicalPermissionsAndModules({ candidateCapabilities: ['HIVE_MANAGEMENT'] });
assert.deepEqual(inferredOnly.effectiveCapabilities, [], 'candidate-only input has no authorization effect');
assert.ok(!inferredOnly.moduleIds.includes('hive_view'));

const fieldAccess = resolveCanonicalPermissionsAndModules({ confirmedCapabilities: ['HIVE_MANAGEMENT'] });
assert.ok(fieldAccess.moduleIds.includes('hive_view'));
assert.ok(canPerformAction(fieldAccess, ACTION_PERMISSIONS.HIVE_VIEW));

const unverifiedLab = resolveCanonicalPermissionsAndModules({ confirmedCapabilities: ['LAB_INSPECTION'] });
assert.ok(unverifiedLab.verificationPending.includes('LAB_INSPECTION'));
assert.ok(!unverifiedLab.moduleIds.includes('lab_records'));
assert.ok(!canPerformAction(unverifiedLab, ACTION_PERMISSIONS.LAB_REPORT_CERTIFY));

const verifiedLab = resolveCanonicalPermissionsAndModules({
  confirmedCapabilities: ['LAB_INSPECTION'],
  verifiedCapabilities: ['LAB_INSPECTION']
});
assert.ok(verifiedLab.moduleIds.includes('lab_records'));
assert.ok(!canPerformAction(verifiedLab, ACTION_PERMISSIONS.LAB_REPORT_CERTIFY), 'verification does not grant privileged certification');

const attemptedEscalation = resolveCanonicalPermissionsAndModules({
  confirmedCapabilities: ['USER_MANAGE', 'KEYS_REVOKE', 'LEDGER_AUDIT']
});
assert.deepEqual(attemptedEscalation.effectiveCapabilities, []);
assert.ok(attemptedEscalation.rejectedCapabilities.length === 3);
assert.ok(!canPerformAction(attemptedEscalation, ACTION_PERMISSIONS.USER_MANAGE));

console.log('Canonical authorization tests passed.');