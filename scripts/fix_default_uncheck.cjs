const fs = require('fs');

// 1. Update AdaptiveWelcomeScreen.jsx
let welcomeCode = fs.readFileSync('D:/SIH-2026/src/components/onboarding/AdaptiveWelcomeScreen.jsx', 'utf8');

// Replace default selectedDomains = ['HIVE_OPERATIONS'] with selectedDomains = []
welcomeCode = welcomeCode.replace(
  "selectedDomains = ['HIVE_OPERATIONS'],",
  "selectedDomains = [],"
);

// Update bottom dock button to reflect disabled state when nothing is selected
const oldButton = `<div className="screen-bottom-dock">
        <button
          type="button"
          className="btn-primary-action"
          onClick={onContinue}
        >
          <span>Continue to Daily Tasks</span>
          <ArrowRight size={18} />
        </button>
      </div>`;

const newButton = `<div className="screen-bottom-dock">
        <button
          type="button"
          className="btn-primary-action"
          disabled={selectedDomains.length === 0 && !naturalText.trim()}
          style={{
            opacity: (selectedDomains.length === 0 && !naturalText.trim()) ? 0.55 : 1,
            cursor: (selectedDomains.length === 0 && !naturalText.trim()) ? 'not-allowed' : 'pointer'
          }}
          onClick={() => {
            if (selectedDomains.length > 0 || naturalText.trim()) {
              onContinue();
            }
          }}
        >
          <span>{selectedDomains.length === 0 && !naturalText.trim() ? "Select an area to continue" : "Continue to Daily Tasks"}</span>
          <ArrowRight size={18} />
        </button>
      </div>`;

if (welcomeCode.includes(oldButton)) {
  welcomeCode = welcomeCode.replace(oldButton, newButton);
}

fs.writeFileSync('D:/SIH-2026/src/components/onboarding/AdaptiveWelcomeScreen.jsx', welcomeCode, 'utf8');
console.log('Successfully updated AdaptiveWelcomeScreen.jsx');

// 2. Update OnboardingView.jsx
let viewCode = fs.readFileSync('D:/SIH-2026/src/components/onboarding/OnboardingView.jsx', 'utf8');

// Replace getInitialState defaults
viewCode = viewCode.replace(
  "selectedDomains: parsed.selectedDomains || ['HIVE_OPERATIONS'],",
  "selectedDomains: parsed.selectedDomains || [],"
);
viewCode = viewCode.replace(
  "selectedCapabilities: parsed.selectedCapabilities || ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION'],",
  "selectedCapabilities: parsed.selectedCapabilities || [],"
);
viewCode = viewCode.replace(
  "confirmedDesignations: parsed.confirmedDesignations || ['BEEKEEPER'],",
  "confirmedDesignations: parsed.confirmedDesignations || [],"
);

viewCode = viewCode.replace(
  "selectedDomains: ['HIVE_OPERATIONS'],",
  "selectedDomains: [],"
);
viewCode = viewCode.replace(
  "selectedCapabilities: ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION'],",
  "selectedCapabilities: [],"
);
viewCode = viewCode.replace(
  "confirmedDesignations: ['BEEKEEPER'],",
  "confirmedDesignations: [],"
);

// Update handleReset
viewCode = viewCode.replace(
  "setSelectedDomains(['HIVE_OPERATIONS']);",
  "setSelectedDomains([]);"
);
viewCode = viewCode.replace(
  "setSelectedCapabilities(['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION']);",
  "setSelectedCapabilities([]);"
);
viewCode = viewCode.replace(
  "setConfirmedDesignations(['BEEKEEPER']);",
  "setConfirmedDesignations([]);"
);

// Ensure toggle domain allows clearing all selections
viewCode = viewCode.replace(
  `onToggleDomain={(id) => {
                setSelectedDomains(prev =>
                  prev.includes(id)
                    ? (prev.length > 1 ? prev.filter(x => x !== id) : prev)
                    : [...prev, id]
                );
              }}`,
  `onToggleDomain={(id) => {
                setSelectedDomains(prev =>
                  prev.includes(id)
                    ? prev.filter(x => x !== id)
                    : [...prev, id]
                );
              }}`
);

fs.writeFileSync('D:/SIH-2026/src/components/onboarding/OnboardingView.jsx', viewCode, 'utf8');
console.log('Successfully updated OnboardingView.jsx');
