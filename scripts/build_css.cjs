const fs = require('fs');

const css = `
.onboarding-viewport {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background-color: var(--color-warm-cream, #FAF7F2);
  color: var(--color-deep-cocoa, #2E261D);
  font-family: var(--font-family, sans-serif);
  overflow: hidden;
  z-index: 50;
}

.onboarding-header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-bottom: 1px solid var(--color-divider, #EBDCC6);
  background-color: var(--color-warm-cream, #FAF7F2);
  flex-shrink: 0;
}

.nav-action-col {
  width: 80px;
  display: flex;
  align-items: center;
}

.nav-action-col.right {
  justify-content: flex-end;
}

.nav-icon-btn {
  background: none;
  border: none;
  color: var(--color-deep-cocoa, #2E261D);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #FAF4E9;
  cursor: pointer;
}

.nav-diag-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  background-color: #FAF4E9;
  border: 1px solid #EBDCC6;
  color: var(--color-deep-cocoa, #2E261D);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.nav-diag-btn.active {
  background-color: var(--color-primary-honey, #D97706);
  color: #FFF;
  border-color: var(--color-primary-honey, #D97706);
}

.nav-center-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step-phase-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-deep-honey, #B45309);
}

.progress-track-dots {
  display: flex;
  gap: 5px;
}

.progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #EBDCC6;
  transition: all 0.2s ease;
}

.progress-dot.active {
  width: 18px;
  border-radius: 3px;
  background-color: var(--color-primary-honey, #D97706);
}

.progress-dot.completed {
  background-color: var(--color-deep-honey, #B45309);
}

.live-summary-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background-color: #FAF4E9;
  border-bottom: 1px solid #EBDCC6;
  font-size: 12px;
  color: var(--color-deep-cocoa, #2E261D);
  flex-shrink: 0;
}

.onboarding-body-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px 18px 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.screen-container {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.screen-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.screen-header.text-center {
  align-items: center;
  text-align: center;
}

.micro-badge-step {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-primary-honey, #D97706);
  letter-spacing: 0.05em;
}

.screen-title {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
  margin: 0;
  color: var(--color-deep-cocoa, #2E261D);
}

.screen-subtitle {
  font-size: 13.5px;
  line-height: 1.5;
  color: #6C5D4B;
  margin: 0;
}

.welcome-hero-art {
  display: flex;
  justify-content: center;
  margin: 10px 0 16px;
}

.hero-icon-bubble {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.25);
}

.natural-input-card {
  background-color: #FFFFFF;
  border: 1px solid #EBDCC6;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.natural-input-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.natural-input-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-deep-cocoa, #2E261D);
}

.natural-textarea {
  width: 100%;
  border: 1px solid #EBDCC6;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  background-color: #FAF4E9;
  color: var(--color-deep-cocoa, #2E261D);
}

.natural-textarea:focus {
  border-color: var(--color-primary-honey, #D97706);
  background-color: #FFFFFF;
}

.natural-chips-prompt {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.prompt-label {
  font-size: 11px;
  color: #8C7B6B;
}

.prompt-chip {
  background-color: #FAF4E9;
  border: 1px solid #EBDCC6;
  border-radius: 12px;
  padding: 3px 8px;
  font-size: 11px;
  cursor: pointer;
  color: var(--color-deep-cocoa, #2E261D);
}

.prompt-chip:hover {
  background-color: #F3E7D3;
}

.tasks-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #9C8C7C;
}

.search-input-wrap input {
  width: 100%;
  padding: 9px 32px 9px 32px;
  border-radius: 8px;
  border: 1px solid #EBDCC6;
  background-color: #FFFFFF;
  font-size: 13px;
  font-family: inherit;
  outline: none;
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9C8C7C;
}

.category-pills-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.cat-pill {
  padding: 4px 10px;
  border-radius: 12px;
  background-color: #FAF4E9;
  border: 1px solid #EBDCC6;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-deep-cocoa, #2E261D);
  cursor: pointer;
  white-space: nowrap;
}

.cat-pill.active {
  background-color: var(--color-primary-honey, #D97706);
  color: #FFF;
  border-color: var(--color-primary-honey, #D97706);
}

.capabilities-cards-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cap-card {
  background-color: #FFFFFF;
  border: 1.5px solid #EBDCC6;
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.15s ease;
}

.cap-card.selected {
  border-color: var(--color-primary-honey, #D97706);
  background-color: #FFFDF9;
}

.cap-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid #D6C2A7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  flex-shrink: 0;
}

.cap-checkbox.checked {
  background-color: var(--color-primary-honey, #D97706);
  border-color: var(--color-primary-honey, #D97706);
}

.cap-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cap-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cap-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-deep-cocoa, #2E261D);
}

.verification-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #FEF3C7;
  color: #B45309;
}

.cap-desc {
  font-size: 12px;
  color: #6C5D4B;
  margin: 0;
}

.prereq-note {
  font-size: 10.5px;
  color: #9C8C7C;
  font-style: italic;
}

.env-options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.env-row {
  background-color: #FFFFFF;
  border: 1.5px solid #EBDCC6;
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
}

.env-row.selected {
  border-color: var(--color-primary-honey, #D97706);
  background-color: #FFFDF9;
}

.env-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #D6C2A7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.env-radio.checked {
  border-color: var(--color-primary-honey, #D97706);
}

.env-radio-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-primary-honey, #D97706);
}

.env-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.env-label {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-deep-cocoa, #2E261D);
}

.env-desc {
  font-size: 11.5px;
  color: #6C5D4B;
}

.capabilities-review-card {
  background-color: #FFFFFF;
  border: 1px solid #EBDCC6;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.review-card-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-deep-cocoa, #2E261D);
}

.add-cap-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #FAF4E9;
  border: 1px solid #EBDCC6;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-deep-cocoa, #2E261D);
  cursor: pointer;
}

.review-caps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-cap-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background-color: #FAF4E9;
  border-radius: 8px;
}

.cap-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cap-item-names {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cap-item-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-deep-cocoa, #2E261D);
}

.cap-item-reason {
  font-size: 11px;
  color: #7C6D5B;
}

.remove-cap-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9C8C7C;
  padding: 4px;
}

.designations-cards-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.designation-match-card {
  background-color: #FFFFFF;
  border: 1.5px solid #EBDCC6;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.15s ease;
}

.designation-match-card.selected {
  border-color: var(--color-primary-honey, #D97706);
  background-color: #FFFDF9;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.12);
}

.desig-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.desig-title-col {
  display: flex;
  align-items: center;
  gap: 8px;
}

.desig-name {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: var(--color-deep-cocoa, #2E261D);
}

.desig-state-pill {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #E0F2FE;
  color: #0369A1;
}

.desig-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid #D6C2A7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.desig-checkbox.checked {
  background-color: var(--color-primary-honey, #D97706);
  border-color: var(--color-primary-honey, #D97706);
}

.desig-reasons-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reasons-label {
  font-size: 11px;
  font-weight: 600;
  color: #8C7B6B;
  text-transform: uppercase;
}

.reasons-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  color: #5C4D3B;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.desig-verification-alert {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background-color: #FEF3C7;
  border-radius: 6px;
  font-size: 11px;
  color: #92400E;
}

.workspace-tools-accordion {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workspace-group-card {
  background-color: #FFFFFF;
  border: 1px solid #EBDCC6;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.workspace-cat-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-primary-honey, #D97706);
  letter-spacing: 0.05em;
}

.workspace-modules-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.workspace-mod-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.mod-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mod-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mod-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-deep-cocoa, #2E261D);
}

.mod-desc {
  font-size: 11px;
  color: #7C6D5B;
}

.final-check-bubble {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #DEF7EC;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.final-summary-card {
  background-color: #FFFFFF;
  border: 1px solid #EBDCC6;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #8C7B6B;
}

.summary-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.final-desig-chip {
  background-color: #FAF4E9;
  border: 1px solid #EBDCC6;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--color-deep-cocoa, #2E261D);
}

.summary-modules-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.module-pill-tag {
  background-color: #FAF4E9;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  color: var(--color-deep-cocoa, #2E261D);
}

.module-pill-tag.more {
  font-weight: 600;
  color: var(--color-primary-honey, #D97706);
}

.summary-divider {
  height: 1px;
  background-color: #EBDCC6;
}

.summary-apiary-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-deep-cocoa, #2E261D);
}

.screen-bottom-dock {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(250, 244, 233, 0) 0%, rgba(250, 244, 233, 0.95) 20%, #FAF4E9 100%);
  padding: 14px 18px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 40;
}

.btn-primary-action {
  width: 100%;
  max-width: 520px;
  height: 48px;
  background-color: var(--color-primary-honey, #D97706);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
  transition: transform 0.1s ease;
}

.btn-primary-action:active {
  transform: scale(0.98);
}

.btn-tertiary-link {
  background: none;
  border: none;
  font-size: 12px;
  color: #8C7B6B;
  cursor: pointer;
}

.clarification-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 90;
}

.clarification-card {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 20px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.clarification-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.clarification-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: var(--color-deep-cocoa, #2E261D);
}

.clarification-prompt {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-deep-cocoa, #2E261D);
  margin: 0;
}

.clarification-reason {
  font-size: 11.5px;
  color: #8C7B6B;
}

.clarification-options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.clarification-opt-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #EBDCC6;
  background-color: #FAF4E9;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-deep-cocoa, #2E261D);
  cursor: pointer;
  text-align: left;
}

.clarification-opt-btn:hover {
  background-color: #F3E7D3;
  border-color: var(--color-primary-honey, #D97706);
}

.add-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 90;
}

.add-modal-card {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 18px;
  max-width: 460px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.add-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-modal-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: var(--color-deep-cocoa, #2E261D);
}

.close-sheet-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9C8C7C;
}

.add-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #FAF4E9;
  border-radius: 8px;
  border: 1px solid #EBDCC6;
}

.add-search-wrap input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 13px;
  font-family: inherit;
}

.add-modal-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 340px;
}

.add-modal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background-color: #FAF4E9;
  border-radius: 8px;
  cursor: pointer;
}

.add-modal-item:hover {
  background-color: #F3E7D3;
}

.add-item-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.add-item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-deep-cocoa, #2E261D);
}

.add-item-desc {
  font-size: 11px;
  color: #7C6D5B;
}

.diagnostic-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  max-width: 90vw;
  background-color: #1E1E24;
  color: #E5E7EB;
  box-shadow: -5px 0 25px rgba(0,0,0,0.3);
  z-index: 100;
  display: flex;
  flex-direction: column;
  font-family: monospace;
}

.diagnostic-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background-color: #141418;
  border-bottom: 1px solid #2D2D36;
}

.diag-header-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.diag-title {
  font-size: 13px;
  font-weight: 700;
  margin: 0;
  color: #F3F4F6;
}

.diag-close-btn {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
}

.diagnostic-drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.diag-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.diag-section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #F59E0B;
  letter-spacing: 0.05em;
}

.diag-value-pill {
  display: inline-block;
  padding: 3px 8px;
  background-color: #2D2D36;
  border-radius: 4px;
  font-size: 12px;
  color: #10B981;
}

.diag-micro {
  font-size: 10px;
  color: #9CA3AF;
}

.diag-table-wrap {
  border: 1px solid #2D2D36;
  border-radius: 6px;
  overflow: hidden;
}

.diag-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.diag-table th {
  background-color: #141418;
  padding: 4px 6px;
  text-align: left;
  color: #9CA3AF;
}

.diag-table td {
  padding: 4px 6px;
  border-top: 1px solid #2D2D36;
  color: #D1D5DB;
}

.diag-caps-list, .diag-desig-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.diag-cap-row, .diag-desig-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 6px;
  background-color: #2D2D36;
  border-radius: 4px;
  font-size: 11px;
}

.diag-cap-code {
  color: #60A5FA;
}

.diag-badge {
  background-color: #374151;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 9px;
  color: #FBBF24;
}

.diag-modules-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.diag-mod-tag {
  background-color: #2D2D36;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 10px;
  color: #A7F3D0;
}
`;

fs.writeFileSync('D:/SIH-2026/src/components/onboarding/OnboardingView.css', css, 'utf8');
console.log('Wrote OnboardingView.css');
