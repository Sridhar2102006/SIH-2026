import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, Hash } from 'lucide-react';

export const TechnicalDetails = ({ title = "View technical & hardware details", icon = "tech", items = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="tech-disclosure">
      <button
        type="button"
        className="tech-disclosure-summary"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon === 'blockchain' ? (
            <Hash size={15} color="var(--color-deep-honey)" />
          ) : (
            <Cpu size={15} color="var(--color-sage)" />
          )}
          <span>{title}</span>
        </span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="tech-disclosure-content">
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '5px 0',
                borderBottom: index < items.length - 1 ? '1px dashed #E0D3C1' : 'none'
              }}
            >
              <span style={{ color: 'var(--color-warm-gray)', fontWeight: 500 }}>{item.label}:</span>
              <span style={{ color: 'var(--color-deep-cocoa)', textAlign: 'right', maxWidth: '65%' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
