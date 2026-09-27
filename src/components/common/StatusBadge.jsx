import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  AlertCircle,
  XCircle,
  HelpCircle,
  Check,
  FlaskConical,
  TestTube
} from 'lucide-react';

/**
 * CANONICAL STATUS TAXONOMY (Prompt Section 5, 9, 22)
 * Healthy | Needs attention | In progress | Waiting | Completed | Verified | Not verified | Failed | Unavailable
 * Lab: Testing | Within Expected Range | Out of Range | Retest Required | Accepted | Rejected | On Hold
 */
export const StatusBadge = ({
  status = 'healthy',
  label,
  size = 'normal',
  showDot = false,
  showIcon = true
}) => {
  const normalized = String(status || '').toLowerCase().replace(/[\s-]/g, '_');

  const getStatusConfig = () => {
    switch (normalized) {
      case 'testing':
      case 'in_testing':
      case 'test_assigned':
      case 'assigned':
        return {
          cssClass: 'badge-lab-blue',
          defaultLabel: 'In Testing',
          Icon: TestTube,
          iconColor: '#2563EB'
        };
      case 'within_expected_range':
      case 'accepted':
      case 'reviewed':
      case 'passed':
        return {
          cssClass: 'badge-lab-green',
          defaultLabel: 'Within Range',
          Icon: CheckCircle2,
          iconColor: '#16A34A'
        };
      case 'out_of_range':
      case 'rejected':
      case 'on_hold':
      case 'retest_required':
        return {
          cssClass: 'badge-lab-red',
          defaultLabel: 'Needs Attention',
          Icon: AlertTriangle,
          iconColor: '#DC2626'
        };
      case 'healthy':
      case 'active':
        return {
          cssClass: 'badge-healthy',
          defaultLabel: 'Healthy',
          Icon: CheckCircle2,
          iconColor: 'var(--color-healthy, #4F7A52)'
        };
      case 'needs_attention':
      case 'attention':
      case 'warning':
        return {
          cssClass: 'badge-attention',
          defaultLabel: 'Needs attention',
          Icon: AlertTriangle,
          iconColor: 'var(--color-attention, #D9822B)'
        };
      case 'in_progress':
      case 'curing':
      case 'processing':
      case 'in_transit':
      case 'staged':
        return {
          cssClass: 'badge-honey',
          defaultLabel: 'In progress',
          Icon: Clock,
          iconColor: 'var(--color-deep-honey, #B87316)'
        };
      case 'waiting':
      case 'pending':
      case 'queued':
      case 'awaiting_intake':
      case 'awaiting_review':
        return {
          cssClass: 'badge-neutral',
          defaultLabel: 'Waiting',
          Icon: Clock,
          iconColor: 'var(--color-warm-gray, #786D61)'
        };
      case 'completed':
      case 'done':
      case 'delivered':
        return {
          cssClass: 'badge-sage',
          defaultLabel: 'Completed',
          Icon: Check,
          iconColor: 'var(--color-sage, #71845B)'
        };
      case 'verified':
      case 'certified':
        return {
          cssClass: 'badge-healthy',
          defaultLabel: 'Verified',
          Icon: ShieldCheck,
          iconColor: 'var(--color-healthy, #4F7A52)'
        };
      case 'not_verified':
      case 'unverified':
      case 'unlinked':
        return {
          cssClass: 'badge-neutral',
          defaultLabel: 'Not verified',
          Icon: AlertCircle,
          iconColor: 'var(--color-warm-gray, #786D61)'
        };
      case 'failed':
      case 'critical':
        return {
          cssClass: 'badge-critical',
          defaultLabel: 'Critical',
          Icon: XCircle,
          iconColor: 'var(--color-critical, #B85450)'
        };
      case 'unavailable':
      case 'offline':
        return {
          cssClass: 'badge-neutral',
          defaultLabel: 'Unavailable',
          Icon: HelpCircle,
          iconColor: 'var(--color-warm-gray, #786D61)'
        };
      default:
        return {
          cssClass: 'badge-neutral',
          defaultLabel: label || status,
          Icon: CheckCircle2,
          iconColor: 'var(--color-warm-gray, #786D61)'
        };
    }
  };

  const config = getStatusConfig();
  const displayText = label || config.defaultLabel;
  const IconComp = config.Icon;
  const iconSize = size === 'small' ? 11 : 13;

  return (
    <span className={`badge ${config.cssClass} ${size === 'small' ? 'badge-sm' : ''}`}>
      {showIcon && IconComp && (
        <IconComp size={iconSize} strokeWidth={2.2} style={{ flexShrink: 0 }} />
      )}
      {showDot && !showIcon && <span className="badge-dot" />}
      <span>{displayText}</span>

      <style>{`
        .badge-sm {
          padding: 2px 7px;
          font-size: 11px;
        }
      `}</style>
    </span>
  );
};
