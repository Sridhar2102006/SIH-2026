import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Info,
  ChevronRight
} from 'lucide-react';

export const AttentionHero = ({
  attentionItems = [],
  onAction,
  onViewAll
}) => {
  if (!attentionItems || attentionItems.length === 0) {
    return (
      <div className="hv-caught-up" role="status">
        <div className="hv-cu-icon-wrap">
          <CheckCircle2 size={20} color="#4F7A52" strokeWidth={2.2} />
        </div>
        <div>
          <strong className="hv-cu-title">You're all caught up</strong>
          <p className="hv-cu-sub">No urgent attention items in your authorized operational domains.</p>
        </div>
      </div>
    );
  }

  // Primary top-priority attention item
  const primary = attentionItems[0];
  const remainingCount = attentionItems.length - 1;

  const isCritical = primary.severity === 'CRITICAL';
  const isAttention = primary.severity === 'ATTENTION';

  const borderColor = isCritical ? '#B85450' : isAttention ? '#D9822B' : '#71845B';
  const bgColor = isCritical ? '#FDF5F5' : isAttention ? '#FFFDF8' : '#F6F8F3';
  const dotColor = isCritical ? '#B85450' : isAttention ? '#D9822B' : '#4F7A52';

  return (
    <div className="hv-attn-wrapper">
      <div
        className="hv-attention-card"
        style={{
          backgroundColor: bgColor,
          borderColor: isCritical ? 'rgba(184, 84, 80, 0.4)' : 'rgba(217, 130, 43, 0.35)',
          borderLeftColor: borderColor
        }}
        role="alert"
      >
        <div className="hv-attention-lbl" style={{ color: dotColor }}>
          <span
            className="hv-attn-dot"
            style={{
              backgroundColor: dotColor,
              animation: isCritical ? 'hvPulseFast 1.2s ease-in-out infinite' : 'hvPulse 2s ease-in-out infinite'
            }}
          />
          {isCritical ? 'Critical Attention Required' : isAttention ? 'Needs Attention' : 'Operational Update'}
        </div>

        <strong className="hv-attention-name">{primary.title}</strong>
        <p className="hv-attention-desc">{primary.description}</p>

        <div className="hv-attention-footer">
          <button
            className="hv-attention-cta"
            style={{ borderColor, color: borderColor }}
            onClick={() => onAction(primary)}
          >
            {primary.ctaLabel} <ArrowRight size={13} strokeWidth={2.5} />
          </button>

          {remainingCount > 0 && (
            <span className="hv-attn-more-badge">
              +{remainingCount} more operational item{remainingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <style>{`
        .hv-attn-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .hv-attention-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
        }
        .hv-attn-more-badge {
          font-size: 11.5px;
          color: #786D61;
          font-weight: 600;
          background: #FAF4E8;
          padding: 4px 9px;
          border-radius: 6px;
          border: 1px solid #EDE2D1;
        }
        @keyframes hvPulseFast {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};
