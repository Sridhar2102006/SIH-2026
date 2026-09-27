import React from 'react';
import {
  Camera,
  ClipboardCheck,
  Droplets,
  PlusCircle,
  ShieldCheck,
  FlaskConical,
  CheckCircle2,
  Package,
  FileText,
  QrCode,
  Truck,
  Activity,
  ArrowRight
} from 'lucide-react';

const ACTION_ICONS = {
  scan_frame: Camera,
  inspect_hive: ClipboardCheck,
  record_collection: Droplets,
  create_batch: PlusCircle,
  review_quality: ShieldCheck,
  record_quality: FlaskConical,
  verify_batch: CheckCircle2,
  prepare_package: Package,
  create_label: FileText,
  manage_qr: QrCode,
  create_shipment: Truck,
  view_hives: Activity,
  view_traceability: ShieldCheck
};

export const ContextualQuickActions = ({
  actions = [],
  onTriggerAction,
  onMoreActions
}) => {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="hv-section">
      <div className="hv-sec-head">
        <span className="hv-sec-title">Quick actions</span>
        {onMoreActions && (
          <button className="hv-sec-link" onClick={onMoreActions}>
            All actions <ArrowRight size={12} />
          </button>
        )}
      </div>

      <div className="hv-qa-grid">
        {actions.map((act) => {
          const IconComp = ACTION_ICONS[act.id] || Activity;
          return (
            <button
              key={act.id}
              className="hv-qa-btn"
              onClick={() => onTriggerAction(act.id)}
              aria-label={act.label}
            >
              <div
                className="hv-qa-icon"
                style={{
                  color: act.color || '#D99A24',
                  backgroundColor: `${act.color || '#D99A24'}15`
                }}
              >
                <IconComp size={18} strokeWidth={2.2} />
                {act.badge && (
                  <span className="hv-qa-badge">{act.badge}</span>
                )}
              </div>
              <span className="hv-qa-lbl">{act.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .hv-qa-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
          gap: 10px;
        }
        .hv-qa-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 12px 6px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          position: relative;
        }
        .hv-qa-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 38, 27, 0.08);
          border-color: #D99A24;
        }
        .hv-qa-icon {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hv-qa-badge {
          position: absolute;
          top: -4px;
          right: -6px;
          background: #D9822B;
          color: #FFF;
          font-size: 9.5px;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 6px;
          line-height: 1.2;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
        }
        .hv-qa-lbl {
          font-size: 11.5px;
          font-weight: 700;
          color: #34261B;
          text-align: center;
          line-height: 1.25;
        }
      `}</style>
    </div>
  );
};
