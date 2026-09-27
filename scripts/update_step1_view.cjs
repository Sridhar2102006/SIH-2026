const fs = require('fs');
let code = fs.readFileSync('D:/SIH-2026/src/components/onboarding/OnboardingView.jsx', 'utf8');

const oldStep1 = `<AdaptiveWelcomeScreen
              naturalText={naturalText}
              onChangeNaturalText={setNaturalText}
              onSubmitNatural={handleNaturalLanguageSubmit}
              onStartGuided={() => setStep(2)}
            />`;

const newStep1 = `<AdaptiveWelcomeScreen
              selectedDomains={selectedDomains}
              onToggleDomain={(id) => {
                setSelectedDomains(prev =>
                  prev.includes(id)
                    ? (prev.length > 1 ? prev.filter(x => x !== id) : prev)
                    : [...prev, id]
                );
              }}
              onApplyPreset={(areas) => {
                setSelectedDomains(areas);
              }}
              naturalText={naturalText}
              onChangeNaturalText={setNaturalText}
              onSubmitNatural={handleNaturalLanguageSubmit}
              onContinue={() => {
                if (naturalText.trim()) {
                  handleNaturalLanguageSubmit(naturalText);
                } else {
                  setStep(3);
                }
              }}
            />`;

code = code.replace(oldStep1, newStep1);
fs.writeFileSync('D:/SIH-2026/src/components/onboarding/OnboardingView.jsx', code, 'utf8');
console.log('Successfully updated Step 1 in OnboardingView.jsx');
