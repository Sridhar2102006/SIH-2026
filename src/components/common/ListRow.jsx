import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * CANONICAL LIST ROW (Prompt Section 8 & 33)
 * Clean, divider-separated item avoiding repetitive card-wrapping-cards.
 */
export const ListRow = ({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  rightContent,
  badge,
  onClick,
  showArrow = true,
  className = '',
  style = {}
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      className={`list-row ${isClickable ? 'list-row-clickable' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
      style={style}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        {Icon && (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: iconColor ? `${iconColor}15` : 'rgba(120, 109, 97, 0.08)',
              color: iconColor || 'var(--color-deep-cocoa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon size={17} strokeWidth={2.2} />
          </div>
        )}

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <strong
              style={{
                fontSize: '14.5px',
                color: 'var(--color-deep-cocoa)',
                fontWeight: 600,
                lineHeight: 1.3
              }}
            >
              {title}
            </strong>
            {badge}
          </div>

          {subtitle && (
            <p
              style={{
                fontSize: '12.5px',
                color: 'var(--color-warm-gray)',
                margin: '2px 0 0 0',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '10px' }}>
        {rightContent}
        {isClickable && showArrow && (
          <ChevronRight size={16} color="var(--color-warm-gray)" strokeWidth={2} />
        )}
      </div>
    </div>
  );
};
