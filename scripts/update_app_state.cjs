const fs = require('fs');
const path = 'D:/SIH-2026/src/context/AppStateContext.jsx';
let content = fs.readFileSync(path, 'utf8');

// Update completeCapabilityOnboarding signature and assignment
content = content.replace(
  'operatorName = null,\n    apiaryName = null\n  }) => {',
  'operatorName = null,\n    apiaryName = null,\n    userCapabilityProfile = null\n  }) => {'
);

content = content.replace(
  'accessProfile: resolvedProfile,\n      operator: operatorName || session.operator || apiary.operator || \'Apiarist\'',
  'accessProfile: resolvedProfile,\n      userCapabilityProfile: userCapabilityProfile || session.userCapabilityProfile || null,\n      operator: operatorName || session.operator || apiary.operator || \'Apiarist\''
);

// Update context provider export
content = content.replace(
  'userDesignations: session?.designations || [],',
  'userDesignations: session?.designations || [],\n        userCapabilityProfile: session?.userCapabilityProfile || null,'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated AppStateContext.jsx');
