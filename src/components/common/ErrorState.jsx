import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

/**
 * CANONICAL ERROR STATE (Prompt Section 14 & 33)
 * Communicates:
 * 1. What happened
 * 2. Whether work was saved
 * 3. What to do next
 */
export const ErrorState = ({
  title = "We couldn't complete this action",
  description = 'Your previous information is still on this screen.',
  actionLabel = 'Try again',
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style = {}
}) => {
  return (
    <div
      className="canonical-empty-state"
      role="alert"
      style={{
        borderStyle: 'solid',
        borderColor: 'rgba(184, 84, 80, 0.3)',
        backgroundColor: '#FFFDFD',
        ...style
      }}
    >
      <div
        className="empty-state-icon"
        style={{
          backgroundColor: 'var(--color-critical-tint)',
          color: 'var(--color-critical)'
        }}
      >
        <AlertCircle size={22} strokeWidth={2} />
      </div>

      <h3 className="empty-state-title" style={{ color: 'var(--color-critical)' }}>
        {title}
      </h3>
      <p className="empty-state-description">{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          className="btn btn-primary"
          style={{
            backgroundColor: 'var(--color-critical)',
            minHeight: '40px',
            padding: '8px 16px',
            fontSize: '14px'
          }}
          onClick={onAction}
        >
          <RotateCcw size={14} strokeWidth={2.2} />
          <span>{actionLabel}</span>
        </button>
      )}

      {secondaryActionLabel && onSecondaryAction && (
        <button
          type="button"
          className="btn btn-subtle"
          style={{ marginTop: '8px', fontSize: '13px' }}
          onClick={onSecondaryAction}
        >
          {secondaryActionLabel}
        </button>
      )}
    </div>
  );
};
