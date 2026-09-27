import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * CANONICAL SECTION HEADER (Prompt Section 10 & 33)
 * Human information hierarchy: Title (20-22px), subtle supporting context, clear action.
 */
export const SectionHeader = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = ChevronRight,
  style = {}
}) => {
  return (
    <div className="section-header-block" style={style}>
      <div className="section-header-left">
        <h2 className="section-header-title">{title}</h2>
        {subtitle && <p className="section-header-subtitle">{subtitle}</p>}
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          className="section-header-action"
          onClick={onAction}
          aria-label={actionLabel}
        >
          <span>{actionLabel}</span>
          {ActionIcon && <ActionIcon size={14} strokeWidth={2.2} />}
        </button>
      )}
    </div>
  );
};
