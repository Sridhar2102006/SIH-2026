const fs = require('fs');
let code = fs.readFileSync('D:/SIH-2026/tests/masterOnboardingAdaptiveEngine.test.js', 'utf8');

code = code.replace(
  'assert.ok(scE_workspace.navigation.items.length >= 3);',
  'assert.ok(Array.isArray(scE_workspace.navigation) && scE_workspace.navigation.length >= 3);'
);
code = code.replace(
  "assert.ok(scE_workspace.dashboard.categories.includes('YOUR HIVES'));",
  "assert.ok(scE_workspace.dashboard.modules.some(m => m.category === 'FIELD'));"
);
code = code.replace(
  "assert.ok(scE_workspace.dashboard.categories.includes('YOUR HONEY'));",
  "assert.ok(scE_workspace.dashboard.modules.some(m => m.category === 'PRODUCTION'));"
);

fs.writeFileSync('D:/SIH-2026/tests/masterOnboardingAdaptiveEngine.test.js', code, 'utf8');
console.log('Successfully updated workspace assertions');
