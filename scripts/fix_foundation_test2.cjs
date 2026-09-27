const fs = require('fs');
let code = fs.readFileSync('D:/SIH-2026/tests/canonicalCapabilityFoundation.test.js', 'utf8');

code = code.replace(
  "assert.deepEqual(resolved.resolved, ['BEE_HEALTH_SCAN', 'HIVE_INSPECTION']);",
  "assert.deepEqual(resolved.resolved, ['BEE_HEALTH_SCAN', 'HIVE_INSPECTION', 'HIVE_MANAGEMENT']);"
);
code = code.replace(
  "assert.deepEqual(resolved.dependencies, ['HIVE_INSPECTION']);",
  "assert.deepEqual(resolved.dependencies, ['HIVE_INSPECTION', 'HIVE_MANAGEMENT']);"
);

fs.writeFileSync('D:/SIH-2026/tests/canonicalCapabilityFoundation.test.js', code, 'utf8');
console.log('Successfully updated canonicalCapabilityFoundation.test.js lines');
