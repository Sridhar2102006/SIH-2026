import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { ClipboardCheck, PlusCircle, ArrowRight, FlaskConical, Truck } from 'lucide-react';

export const QuickInspectionAction = () => {
  const { openSheet, canPerform, ACTION_PERMISSIONS, showToast } = useAppState();

  const canInspect = canPerform(ACTION_PERMISSIONS.HIVE_INSPECT);
  const canBatch = canPerform(ACTION_PERMISSIONS.BATCH_CREATE);
  const canQuality = canPerform(ACTION_PERMISSIONS.QUALITY_RECORD);
  const canDistribute = canPerform(ACTION_PERMISSIONS.SHIPMENT_DISPATCH);

  // Build authorized actions list
  const actions = [];

  if (canInspect) {
    actions.push({
      id: 'inspect',
      title: 'Quick Hive Inspection',
      desc: 'Log colony temper, brood pattern & queen check in 4 taps',
      icon: ClipboardCheck,
      iconClass: '',
      isPrimary: true,
      onClick: () => openSheet('quick-inspect')
    });
  }

  if (canBatch) {
    actions.push({
      id: 'batch',
      title: 'Log Honey Harvest',
      desc: 'Record harvested frames, moisture, and start a traceable batch',
      icon: PlusCircle,
      iconClass: 'secondary-icon',
      isPrimary: actions.length === 0,
      onClick: () => openSheet('create-batch')
    });
  }

  if (canQuality && (!canInspect || actions.length < 2)) {
    actions.push({
      id: 'quality',
      title: 'Record Quality Check',
      desc: 'Conduct refractometer moisture reading & register purity log',
      icon: FlaskConical,
      iconClass: 'quality-icon',
      isPrimary: actions.length === 0,
      onClick: () => showToast("Digital Refractometer reading registered: 17.2% Moisture")
    });
  }

  if (canDistribute && actions.length < 2) {
    actions.push({
      id: 'distribute',
      title: 'Dispatch Shipment',
      desc: 'Generate consignment manifest & seal batch lot with QR label',
      icon: Truck,
      iconClass: 'distrib-icon',
      isPrimary: actions.length === 0,
      onClick: () => showToast("Shipment manifest queued for courier dispatch")
    });
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <section className="actions-section">
      <div className="section-header">
        <span className="micro-text">What can I do</span>
        <h2 className="heading-section">Authorized Actions</h2>
      </div>

      <div className="action-cards-grid">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              className={`action-card ${act.isPrimary ? 'primary' : 'secondary'}`}
              onClick={act.onClick}
            >
              <div className={`action-icon-circle ${act.iconClass}`}>
                <Icon size={21} />
              </div>
              <div className="action-text-block">
                <h3 className="heading-card">{act.title}</h3>
                <p className="supporting-text">{act.desc}</p>
              </div>
              <ArrowRight size={18} className="action-arrow" />
            </button>
          );
        })}
      </div>

      <style>{`
        .actions-section {
          margin-bottom: var(--space-24);
        }

        .section-header {
          margin-bottom: var(--space-12);
        }

        .action-cards-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          border-radius: var(--radius-card);
          text-align: left;
          width: 100%;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          border: 1px solid var(--color-card-border);
          user-select: none;
        }

        .action-card:active {
          transform: scale(0.98);
        }

        .action-card.primary {
          background-color: var(--color-soft-ivory);
          border: 1.5px solid #E2D3BE;
          box-shadow: var(--shadow-card);
        }

        .action-card.primary:hover {
          border-color: var(--color-primary-honey);
        }

        .action-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background-color: var(--color-primary-honey-tint);
          color: var(--color-deep-honey);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .action-card.secondary {
          background-color: #FAF4E9;
          border: 1px dashed var(--color-divider);
        }

        .secondary-icon {
          background-color: rgba(113, 132, 91, 0.14);
          color: var(--color-sage);
        }

        .quality-icon {
          background-color: rgba(113, 132, 91, 0.16);
          color: var(--color-sage);
        }

        .distrib-icon {
          background-color: rgba(52, 38, 27, 0.1);
          color: var(--color-deep-cocoa);
        }

        .action-text-block {
          flex: 1;
        }

        .action-text-block h3 {
          margin-bottom: 2px;
          font-size: 16px;
        }

        .action-arrow {
          color: var(--color-warm-gray);
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }

        .action-card:hover .action-arrow {
          transform: translateX(3px);
          color: var(--color-deep-cocoa);
        }
      `}</style>
    </section>
  );
};
