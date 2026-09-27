const fs = require('fs');
let code = fs.readFileSync('D:/SIH-2026/src/services/capabilityRegistry.js', 'utf8');

// Update CAPABILITY_DEPENDENCIES
code = code.replace(
  "// Field\n  BEE_HEALTH_SCAN: ['HIVE_INSPECTION'],",
  "// Field\n  HIVE_INSPECTION: ['HIVE_MANAGEMENT'],\n  BEE_HEALTH_SCAN: ['HIVE_INSPECTION'],"
);

fs.writeFileSync('D:/SIH-2026/src/services/capabilityRegistry.js', code, 'utf8');
console.log('Successfully updated HIVE_INSPECTION dependency');
