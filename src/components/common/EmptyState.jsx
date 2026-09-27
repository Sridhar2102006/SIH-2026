import React from 'react';
import { Plus } from 'lucide-react';

/**
 * CANONICAL EMPTY STATE (Prompt Section 16 & 33)
 * Answers 3 essential human questions:
 * 1. Why is it empty?
 * 2. What will appear here?
 * 3. What can I do now?
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
  secondaryActionLabel,
  onSecondaryAction,
  style = {}
}) => {
  return (
    <div className="canonical-empty-state" role="status" style={style}>
      {Icon && (
        <div className="empty-state-icon" aria-hidden="true">
          <Icon size={22} strokeWidth={2} />
        </div>
      )}

      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          className="btn btn-primary"
          style={{ minHeight: '40px', padding: '8px 16px', fontSize: '14px' }}
          onClick={onAction}
        >
          {ActionIcon && <ActionIcon size={15} strokeWidth={2.2} />}
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
