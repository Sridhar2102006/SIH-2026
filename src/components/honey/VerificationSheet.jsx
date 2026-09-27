import React from 'react';
import { VerificationView } from './VerificationView';

/**
 * Screen 26 — Verification Compatibility Wrapper
 * Forwards legacy Sheet calls directly to Screen 26 Master VerificationView.
 */
export const VerificationSheet = ({ isOpen, onClose, batch, initialScenario }) => {
  return (
    <VerificationView
      isOpen={isOpen}
      onClose={onClose}
      batch={batch}
      initialScenario={initialScenario}
    />
  );
};

export default VerificationSheet;
