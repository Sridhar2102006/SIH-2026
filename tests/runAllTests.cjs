const { execSync } = require('child_process');

const testFiles = [
  'tests/canonicalCapabilityFoundation.test.js',
  'tests/canonicalCapabilityAuthorization.test.js',
  'tests/onboardingIntelligence.test.js',
  'tests/userCapabilityProfile.test.js',
  'tests/capabilitySystem.test.js',
  'tests/masterOnboardingAdaptiveEngine.test.js',
  'tests/beekeeperMasterProductionSuite.test.js',
  'tests/processorMasterProductionSuite.test.js',
  'tests/labMasterProductionSuite.test.js',
  'tests/dispatchMasterProductionSuite.test.js',
  'tests/indiaApicultureDomain.test.js',
  'tests/indiaProcessorEngineSuite.test.js',
  'tests/commonProcessorOnboarding.test.js',
  'tests/goldenPathEndToEnd.test.js',
  'tests/capabilityReconciliationAudit.test.js'
];

console.log('====================================================');
console.log('RUNNING ALL HONEYCHAIN PRODUCTION & CAPABILITY SUITES');
console.log('====================================================\n');

let failedCount = 0;

testFiles.forEach((file, index) => {
  const label = `[${index + 1}/${testFiles.length}] ${file}`;
  process.stdout.write(`${label}... `);
  try {
    execSync(`node ${file}`, { stdio: 'pipe' });
    console.log('PASSED');
  } catch (err) {
    console.log('FAILED');
    console.error(`\n--- Error in ${file} ---`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    failedCount++;
  }
});

console.log('\n====================================================');
if (failedCount === 0) {
  console.log(`ALL ${testFiles.length} TEST SUITES PASSED CLEANLY!`);
  console.log('====================================================');
  process.exit(0);
} else {
  console.error(`${failedCount} of ${testFiles.length} TEST SUITES FAILED!`);
  console.log('====================================================');
  process.exit(1);
}
