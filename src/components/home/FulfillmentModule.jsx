import React from 'react';
import {
  Package,
  FileText,
  QrCode,
  Truck,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  PlusCircle,
  Printer,
  ScanLine,
  ClipboardCheck,
  Send
} from 'lucide-react';

export const FulfillmentModule = ({
  batches = [],
  canPackage = false,
  canLabel = false,
  canManageQr = false,
  canDistribute = false,
  onOpenPackaging,
  onOpenQrManagement,
  onCreateShipment
}) => {
  const bottledBatches = batches.filter(b => b.status === 'bottled' || b.status === 'certified');
  const totalBottledJars = 780; // Packaged Inventory

  return (
    <div className="hv-section">
      <div className="hv-sec-head">
        <div className="hv-sec-title-wrap">
          <span className="hv-sec-title">Fulfillment & Packaging</span>
          <span className="hv-sec-tagline">Physical jar packaging, verified labels & dispatches</span>
        </div>
      </div>

      <div className="hv-ful-grid">
        <div className="hv-ful-card">
          <div className="hv-ful-icon-badge">
            <Package size={16} color="#786D61" />
          </div>
          <div>
            <strong className="hv-ful-num">{totalBottledJars} Jars</strong>
            <span className="hv-ful-lbl">Packaged Inventory</span>
          </div>
        </div>

        <div className="hv-ful-card">
          <div className="hv-ful-icon-badge">
            <Truck size={16} color="#34261B" />
          </div>
          <div>
            <strong className="hv-ful-num">2 Consignments</strong>
            <span className="hv-ful-lbl">In Transit to Co-ops</span>
          </div>
        </div>
      </div>

      {/* Packaging & Label Operation Trigger */}
      {(canPackage || canLabel) && (
        <div className="hv-ful-action-card">
          <div className="hv-ful-action-left">
            <FileText size={18} color="#8C6D4F" />
            <div>
              <strong className="hv-fa-title">Product Packaging & Labels</strong>
              <p className="hv-fa-sub">Allocate honey volume into jars and generate verified labels.</p>
            </div>
          </div>
          <button
            className="hv-fa-cta"
            onClick={() => onOpenPackaging && onOpenPackaging(bottledBatches[0])}
          >
            <span>Package batch</span>
            <ArrowRight size={12} strokeWidth={2.2} />
          </button>
        </div>
      )}

      {/* QR Management Trigger */}
      {canManageQr && (
        <div className="hv-ful-action-card">
          <div className="hv-ful-action-left">
            <QrCode size={18} color="var(--color-primary-honey)" />
            <div>
              <strong className="hv-fa-title">Product QR Codes</strong>
              <p className="hv-fa-sub">Link jar QR codes to product verification records.</p>
            </div>
          </div>
          <button
            className="hv-fa-cta secondary"
            onClick={() => onOpenQrManagement && onOpenQrManagement(bottledBatches[0])}
          >
            <span>Manage QR codes</span>
            <ArrowRight size={12} strokeWidth={2.2} />
          </button>
        </div>
      )}

      {/* Daily Actions Grid */}
      <div className="hv-daily-actions-section">
        <span className="hv-daily-actions-title">Daily Actions</span>
        <div className="hv-da-grid">
          <button
            className="hv-da-card honey"
            onClick={() => onOpenPackaging && onOpenPackaging(bottledBatches[0])}
          >
            <div className="hv-da-icon"><Package size={18} /></div>
            <strong className="hv-da-label">Package Batch</strong>
            <span className="hv-da-sub">Allocate jars & volume</span>
          </button>
          <button
            className="hv-da-card warm"
            onClick={() => onOpenPackaging && onOpenPackaging(bottledBatches[0])}
          >
            <div className="hv-da-icon"><Printer size={18} /></div>
            <strong className="hv-da-label">Print Labels</strong>
            <span className="hv-da-sub">Verified label sheets</span>
          </button>
          <button
            className="hv-da-card sage"
            onClick={onCreateShipment}
          >
            <div className="hv-da-icon"><Send size={18} /></div>
            <strong className="hv-da-label">Create Shipment</strong>
            <span className="hv-da-sub">Dispatch manifest</span>
          </button>
          <button
            className="hv-da-card brown"
            onClick={() => onOpenQrManagement && onOpenQrManagement(bottledBatches[0])}
          >
            <div className="hv-da-icon"><ScanLine size={18} /></div>
            <strong className="hv-da-label">Scan & Dispatch</strong>
            <span className="hv-da-sub">Link QR to consignment</span>
          </button>
        </div>
      </div>

      <style>{`
        .hv-ful-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 10px;
        }
        .hv-ful-card {
          background: #FAF4E9;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .hv-ful-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #FFFDF8;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #EDE2D1;
        }
        .hv-ful-num {
          font-size: 13.5px;
          font-weight: 750;
          color: #34261B;
          display: block;
        }
        .hv-ful-lbl {
          font-size: 10.5px;
          color: #786D61;
        }
        .hv-ful-action-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 10px 12px;
          margin-top: 8px;
          gap: 10px;
        }
        .hv-ful-action-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .hv-fa-title {
          font-size: 13px;
          font-weight: 750;
          color: #34261B;
          display: block;
        }
        .hv-fa-sub {
          font-size: 11.5px;
          color: #786D61;
          margin: 1px 0 0;
        }
        .hv-fa-cta {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #34261B;
          color: #FFF;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 750;
          padding: 6px 11px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .hv-fa-cta.secondary {
          background: #FFFDF8;
          color: #34261B;
          border: 1px solid #EDE2D1;
        }
      `}</style>
    </div>
  );
};
