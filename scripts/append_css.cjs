const fs = require('fs');

const extraCss = `
/* User-Friendly Work Areas & Quick Presets */
.quick-presets-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #FAF4E9;
  border: 1px solid #EBDCC6;
  border-radius: 10px;
  padding: 8px 12px;
}

.presets-label {
  font-size: 11.5px;
  font-weight: 600;
  color: #8C7B6B;
  white-space: nowrap;
}

.presets-scroll {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.preset-chip-btn {
  background-color: #FFFFFF;
  border: 1px solid #D6C2A7;
  border-radius: 14px;
  padding: 4px 10px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-deep-cocoa, #2E261D);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.preset-chip-btn:hover {
  background-color: #FEF3C7;
  border-color: #D97706;
  color: #B45309;
}

.work-areas-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.work-area-card {
  background-color: #FFFFFF;
  border: 1.5px solid #EBDCC6;
  border-radius: 14px;
  padding: 14px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.15s ease;
}

.work-area-card:hover {
  border-color: #D97706;
}

.work-area-card.selected {
  border-color: #D97706;
  background-color: #FFFDF9;
  box-shadow: 0 4px 14px rgba(217, 119, 6, 0.12);
}

.card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-emoji-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: #FAF4E9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.card-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid #D6C2A7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-checkbox.checked {
  background-color: #D97706;
  border-color: #D97706;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  color: var(--color-deep-cocoa, #2E261D);
}

.card-desc {
  font-size: 12px;
  color: #6C5D4B;
  margin: 0;
  line-height: 1.4;
}

.optional-natural-wrapper {
  background-color: #FAF4E9;
  border: 1px dashed #D6C2A7;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-natural-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 12.5px;
  font-weight: 600;
  color: #8C7B6B;
  cursor: pointer;
  padding: 0;
}

.toggle-natural-btn span {
  flex: 1;
  text-align: left;
  margin-left: 6px;
}

.natural-drawer-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.btn-interpret-text {
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #D97706;
  color: #FFF;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
`;

fs.appendFileSync('D:/SIH-2026/src/components/onboarding/OnboardingView.css', extraCss, 'utf8');
console.log('Appended user-friendly styles to OnboardingView.css');
