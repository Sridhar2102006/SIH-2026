import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * ROLE SELECTION SCREEN
 * 
 * The VERY FIRST screen a new user sees after authentication.
 * Presents 4 clear, human-language role options — no technical jargon.
 * 
 * Design Philosophy: "Do not make the common person learn the architecture.
 * Make the architecture understand the common person."
 */

const ROLES = [
  {
    id: 'BEEKEEPER',
    emoji: '🐝',
    title: 'I keep bees',
    subtitle: 'Beekeeper / Apiarist',
    description: 'You have bee colonies, manage apiaries, inspect hives, and collect honey.',
    examples: 'Hive inspection • Honey harvest • Batch recording',
    gradient: 'linear-gradient(135deg, #FFF9EF 0%, #FEF3C7 100%)',
    accentColor: '#D97706',
    borderColor: '#FCD34D',
    textColor: '#92400E',
    badgeColor: 'rgba(217, 119, 6, 0.12)',
    badgeText: '#92400E',
    glyph: '🌸',
    complexity: 'simple'
  },
  {
    id: 'PROCESSOR',
    emoji: '🍯',
    title: 'I process honey',
    subtitle: 'Processor / Producer',
    description: 'You extract, filter, settle, or bottle honey — in a facility or at home.',
    examples: 'Batch processing • Filtering • Packaging',
    gradient: 'linear-gradient(135deg, #FAF6F0 0%, #FEF0DC 100%)',
    accentColor: '#B87316',
    borderColor: '#FCA928',
    textColor: '#7C2D12',
    badgeColor: 'rgba(184, 115, 22, 0.12)',
    badgeText: '#7C2D12',
    glyph: '🏭',
    complexity: 'simple'
  },
  {
    id: 'LAB_SPECIALIST',
    emoji: '🔬',
    title: 'I test honey',
    subtitle: 'Lab Specialist / Analyst',
    description: 'You test honey quality in a laboratory — moisture, purity, enzyme levels.',
    examples: 'Quality testing • Lab reports • Certification',
    gradient: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
    accentColor: '#2563EB',
    borderColor: '#BFDBFE',
    textColor: '#1E40AF',
    badgeColor: 'rgba(37, 99, 235, 0.10)',
    badgeText: '#1E40AF',
    glyph: '🧪',
    complexity: 'advanced'
  },
  {
    id: 'DISTRIBUTOR',
    emoji: '🚚',
    title: 'I distribute honey',
    subtitle: 'Distributor / Dispatch',
    description: 'You move honey from producers to buyers — dispatch, supply chain, logistics.',
    examples: 'Shipment planning • QR validation • Delivery',
    gradient: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
    accentColor: '#0284C7',
    borderColor: '#BAE6FD',
    textColor: '#075985',
    badgeColor: 'rgba(2, 132, 199, 0.10)',
    badgeText: '#075985',
    glyph: '📦',
    complexity: 'business'
  }
];

export const RoleSelectionScreen = ({ onSelectRole }) => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="role-select-screen">
      {/* Header */}
      <div className="role-select-header">
        <h1 className="role-select-title">
          What do you do?
        </h1>
        <p className="role-select-subtitle">
          Choose what fits you best. HoneyChain will set up your workspace accordingly.
        </p>
      </div>

      {/* Role Cards */}
      <div className="role-cards-list">
        {ROLES.map((role) => {
          const isHovered = hoveredId === role.id;
          return (
            <button
              key={role.id}
              type="button"
              className="role-card-btn"
              style={{
                background: role.gradient,
                border: `1.5px solid ${isHovered ? role.accentColor : role.borderColor}`,
                transform: isHovered ? 'translateY(-1px)' : 'none',
                boxShadow: isHovered
                  ? `0 6px 24px ${role.accentColor}22`
                  : '0 1px 4px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={() => setHoveredId(role.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectRole && onSelectRole(role.id)}
            >
              {/* Left: Emoji + Content */}
              <div className="role-card-left">
                <div
                  className="role-card-emoji-ring"
                  style={{ background: role.badgeColor, borderColor: role.borderColor }}
                >
                  <span className="role-card-emoji">{role.emoji}</span>
                </div>
                <div className="role-card-content">
                  <div className="role-card-top">
                    <h3
                      className="role-card-title"
                      style={{ color: role.textColor }}
                    >
                      {role.title}
                    </h3>
                    <span
                      className="role-card-badge"
                      style={{
                        background: role.badgeColor,
                        color: role.badgeText,
                        borderColor: role.borderColor
                      }}
                    >
                      {role.subtitle}
                    </span>
                  </div>
                  <p className="role-card-desc">
                    {role.description}
                  </p>
                  <p className="role-card-examples">
                    {role.examples}
                  </p>
                </div>
              </div>

              {/* Right: Arrow */}
              <div
                className="role-card-arrow"
                style={{ color: role.accentColor }}
              >
                <ArrowRight size={18} strokeWidth={2.5} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="role-select-footer-note">
        You can adjust this later — your workspace grows with you.
      </p>
    </div>
  );
};

export default RoleSelectionScreen;
