const fs = require('fs');
let code = fs.readFileSync('D:/SIH-2026/src/services/onboardingIntelligenceService.js', 'utf8');

const target = `  generateCapabilityCandidates(signals = []) {
    const explicitIds = Array.from(new Set(signals
      .filter(signal => signal.category === 'ACTION' && signal.polarity === 'POSITIVE' && CAPABILITY_MAP.has(signal.value))
      .map(signal => signal.value)));`;

const replacement = `  generateCapabilityCandidates(signals = []) {
    const negative = new Set(signals
      .filter(signal => signal.category === 'ACTION' && signal.polarity === 'NEGATIVE')
      .map(signal => signal.value));
    const explicitIds = Array.from(new Set(signals
      .filter(signal => signal.category === 'ACTION' && signal.polarity === 'POSITIVE' && !negative.has(signal.value) && CAPABILITY_MAP.has(signal.value))
      .map(signal => signal.value)));`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('D:/SIH-2026/src/services/onboardingIntelligenceService.js', code, 'utf8');
  console.log('Successfully updated generateCapabilityCandidates');
} else {
  console.log('Target not found, checking line endings');
  const normalized = code.replace(/\r\n/g, '\n');
  if (normalized.includes(target)) {
    code = normalized.replace(target, replacement);
    fs.writeFileSync('D:/SIH-2026/src/services/onboardingIntelligenceService.js', code, 'utf8');
    console.log('Successfully updated generateCapabilityCandidates with normalized newlines');
  } else {
    console.log('Still not found');
  }
}
