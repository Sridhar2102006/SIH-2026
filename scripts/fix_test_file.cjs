const fs = require('fs');
let code = fs.readFileSync('D:/SIH-2026/tests/masterOnboardingAdaptiveEngine.test.js', 'utf8');

// Replace any console.log containing unescaped newline within quotes
code = code.replace(/console\.log\('([^']*)\r?\n([^']*)'\);/g, (match, p1, p2) => {
  return "console.log('" + p1 + "');\nconsole.log('" + p2 + "');";
});

fs.writeFileSync('D:/SIH-2026/tests/masterOnboardingAdaptiveEngine.test.js', code, 'utf8');
console.log('Successfully sanitized test file');
