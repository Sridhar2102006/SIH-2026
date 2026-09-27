const fs = require('fs');
let code = fs.readFileSync('D:/SIH-2026/src/services/onboardingIntelligenceService.js', 'utf8');

code = code.replace(
  `  generateCapabilityCandidates(signals = []) {
    const explicitIds = Array.from(new Set(signals
      .filter(signal => signal.category === 'ACTION' && signal.polarity === 'POSITIVE' && CAPABILITY_MAP.has(signal.value))
      .map(signal => signal.value)));`,
  `  generateCapabilityCandidates(signals = []) {
    const negative = new Set(signals
      .filter(signal => signal.category === 'ACTION' && signal.polarity === 'NEGATIVE')
      .map(signal => signal.value));
    const explicitIds = Array.from(new Set(signals
      .filter(signal => signal.category === 'ACTION' && signal.polarity === 'POSITIVE' && !negative.has(signal.value) && CAPABILITY_MAP.has(signal.value))
      .map(signal => signal.value)));`
);

fs.writeFileSync('D:/SIH-2026/src/services/onboardingIntelligenceService.js', code, 'utf8');
console.log('Successfully updated generateCapabilityCandidates to respect negative polarity signals');
