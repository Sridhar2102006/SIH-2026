import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * CANONICAL LOADING STATE (Prompt Section 15 & 33)
 * Human, contextual, calm loading indicator without dizzying loops.
 */
export const LoadingState = ({
  message = 'Checking hive conditions…',
  supporting,
  style = {}
}) => {
  return (
    <div
      className="canonical-empty-state"
      role="status"
      aria-live="polite"
      style={{ borderStyle: 'solid', borderColor: 'var(--color-divider)', ...style }}
    >
      <div className="empty-state-icon" style={{ backgroundColor: 'rgba(120, 109, 97, 0.08)', color: 'var(--color-warm-gray)' }}>
        <RefreshCw size={20} className="pulse-sync" />
      </div>
      <h3 className="empty-state-title" style={{ fontSize: '15px' }}>{message}</h3>
      {supporting && (
        <p className="empty-state-description" style={{ marginBottom: 0 }}>{supporting}</p>
      )}
    </div>
  );
};
