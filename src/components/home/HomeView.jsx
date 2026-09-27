import React, { useState, useMemo, useCallback } from 'react';
import {
  Bell,
  ChevronRight,
  ClipboardCheck,
  PlusCircle,
  Camera,
  Droplets,
  Package,
  Activity,
  CheckCircle2,
  WifiOff,
  RefreshCw,
  Eye,
  Thermometer,
  ArrowRight,
  ShieldCheck,
  X,
  Plus,
  AlertTriangle,
  Layers,
  Info,
  Lock
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import {
  composeDashboard,
  DASHBOARD_CATEGORIES,
  DASHBOARD_MODULE_IDS,
  DEMO_PERSONAS
} from '../../services/dashboardCompositionEngine';

import { AttentionHero } from './AttentionHero';
import { ContextualQuickActions } from './ContextualQuickActions';
import { FieldWorkModule } from './FieldWorkModule';
import { ProductionModule } from './ProductionModule';
import { QualityModule } from './QualityModule';
import { FulfillmentModule } from './FulfillmentModule';
import { TrustVerificationModule } from './TrustVerificationModule';
import { ZeroPermissionFallback } from './ZeroPermissionFallback';
import { PersonaSwitcherPill } from './PersonaSwitcherPill';

import { AddHiveModal } from '../hives/AddHiveModal';
import { RecordObservationModal } from '../hives/RecordObservationModal';
import { DeviceDiagnosticSheet } from '../hives/DeviceDiagnosticSheet';
import { WorkSetupModal } from '../more/WorkSetupModal';

/* ─────────────────────────────────────────────────────────
   BANNER & NOTICES
───────────────────────────────────────────────────────── */

const OfflineBanner = ({ isOnline, isSyncing, pendingSyncCount }) => {
  if (isOnline && !isSyncing) return null;
  return (
    <div className={`hv-bar ${!isOnline ? 'hv-bar-offline' : 'hv-bar-syncing'}`}>
      {isSyncing ? (
        <>
          <RefreshCw size={13} className="hv-spin" />
          <span>Syncing changes…</span>
        </>
      ) : (
        <>
          <WifiOff size={13} />
          <span>
            You're offline. Some information may be out of date.
            {pendingSyncCount > 0 && ` (${pendingSyncCount} change${pendingSyncCount > 1 ? 's' : ''} queued)`}
          </span>
        </>
      )}
    </div>
  );
};

const PausedMonitoringNotice = ({ pausedHives, onCheckDevice }) => {
  if (!pausedHives || pausedHives.length === 0) return null;
  const hive = pausedHives[0];
  return (
    <div className="hv-paused-notice" role="alert">
      <div className="hv-paused-icon">
        <WifiOff size={16} strokeWidth={2} />
      </div>
      <div className="hv-paused-body">
        <strong className="hv-paused-title">Hive monitoring paused</strong>
        <p className="hv-paused-sub">
          Live observations from {hive.name} aren't available right now.
        </p>
      </div>
      <button className="hv-paused-cta" onClick={() => onCheckDevice(hive)}>
        Check device
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   SMART INSIGHT & RECENT ACTIVITY
───────────────────────────────────────────────────────── */

const SmartInsight = ({ insight, onWhySeeingThis }) => {
  if (!insight) return null;

  return (
    <div className="hv-section">
      <div className="hv-sec-head">
        <span className="hv-sec-title">{insight.title || 'Operational observation'}</span>
        <button className="hv-sec-link hv-why-link" onClick={onWhySeeingThis}>
          <Eye size={11} strokeWidth={2.5} /> Why am I seeing this?
        </button>
      </div>
      <div className="hv-insight-box">
        <p className="hv-insight-text">
          {insight.summary}
        </p>
        {insight.recommendation && (
          <p className="hv-insight-rec">
            <strong>Recommendation:</strong> {insight.recommendation}
          </p>
        )}
        <p className="hv-insight-attr">
          Operational note based on your active duties in {insight.domain ? insight.domain.toLowerCase() : 'field work'}
        </p>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities = [] }) => {
  const getIcon = (type) => {
    if (type === 'inspection') return <CheckCircle2 size={13} color="#71845B" strokeWidth={2} />;
    if (type === 'alert') return <Activity size={13} color="#D9822B" strokeWidth={2} />;
    if (type === 'honey') return <Droplets size={13} color="#D99A24" strokeWidth={2} />;
    return <Activity size={13} color="#786D61" strokeWidth={2} />;
  };

  if (!activities?.length) return null;

  return (
    <div className="hv-section">
      <div className="hv-sec-head">
        <span className="hv-sec-title">Recent activity</span>
      </div>
      <div className="hv-act-list" role="list">
        {activities.slice(0, 4).map(a => (
          <div key={a.id} className="hv-act-item" role="listitem">
            <div className="hv-act-icon">{getIcon(a.type)}</div>
            <div className="hv-act-body">
              <span className="hv-act-title">{a.title}</span>
              <span className="hv-act-time">{a.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   SECONDARY EXPLANATION & PROOF SHEETS
───────────────────────────────────────────────────────── */

const BlockchainProofSheet = ({ isOpen, onClose, batch }) => {
  if (!isOpen) return null;
  return (
    <div className="hv-modal-overlay" onClick={onClose}>
      <div className="hv-modal-card" onClick={e => e.stopPropagation()}>
        <div className="hv-modal-header">
          <div className="hv-modal-title-row">
            <ShieldCheck size={20} color="#71845B" strokeWidth={2} />
            <h3 className="hv-modal-title">Honey Journey Proof</h3>
          </div>
          <button className="hv-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="hv-modal-intro">
          Cryptographic evidence verifying the chronological record of this honey harvest.
        </p>

        <div className="hv-proof-list">
          <div className="hv-proof-item">
            <span className="hv-proof-key">Verification Reference</span>
            <code className="hv-proof-val">{batch?.verification?.certificateId || 'CERT-HC-2026-0925-V1'}</code>
          </div>
          <div className="hv-proof-item">
            <span className="hv-proof-key">Transaction Hash</span>
            <code className="hv-proof-val">{batch?.verification?.txHash || '0xd942b87f619e083a21dc49019b841e2a537f'}</code>
          </div>
          <div className="hv-proof-item">
            <span className="hv-proof-key">Ledger Block</span>
            <span className="hv-proof-text">Block #{batch?.verification?.blockNumber || 54819240}</span>
          </div>
          <div className="hv-proof-item">
            <span className="hv-proof-key">Network</span>
            <span className="hv-proof-text">Polygon / HoneyChain Private Subnet</span>
          </div>
          <div className="hv-proof-item">
            <span className="hv-proof-key">Integrity Merkle Root</span>
            <code className="hv-proof-val">{batch?.verification?.merkleRoot || '0x3f9801a4e5bc1209e86d23fb482b9a710255'}</code>
          </div>
          <div className="hv-proof-item">
            <span className="hv-proof-key">Immutable Record State</span>
            <span className="hv-proof-badge-verified">Verified on-chain</span>
          </div>
        </div>

        <button className="hv-modal-btn" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
};

const WhySeeingThisSheet = ({ isOpen, onClose, insight }) => {
  if (!isOpen) return null;
  return (
    <div className="hv-modal-overlay" onClick={onClose}>
      <div className="hv-modal-card" onClick={e => e.stopPropagation()}>
        <div className="hv-modal-header">
          <div className="hv-modal-title-row">
            <Info size={19} color="#B87316" strokeWidth={2} />
            <h3 className="hv-modal-title">Why am I seeing this?</h3>
          </div>
          <button className="hv-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="hv-modal-intro">
          HoneyChain dynamically composes insights from real operational observations and your confirmed workspace authorization.
        </p>

        <div className="hv-why-reasons">
          <div className="hv-why-box">
            <span className="hv-why-box-title">Operational Domain</span>
            <p className="hv-why-box-desc">
              Surfaced because your confirmed capabilities include active duties in {insight?.domain || 'this operational area'}.
            </p>
          </div>
          <div className="hv-why-box">
            <span className="hv-why-box-title">Data Correlation</span>
            <p className="hv-why-box-desc">
              Correlated across active telemetry feeds, laboratory refractometry samples, and lot timestamps.
            </p>
          </div>
          <div className="hv-why-box">
            <span className="hv-why-box-title">Actionable Recommendation</span>
            <p className="hv-why-box-desc">
              {insight?.recommendation || 'Review pending tasks in your authorized queue.'}
            </p>
          </div>
        </div>

        <button className="hv-modal-btn" onClick={onClose}>
          Understood
        </button>
      </div>
    </div>
  );
};

const NotificationsSheet = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="hv-modal-overlay" onClick={onClose}>
      <div className="hv-modal-card" onClick={e => e.stopPropagation()}>
        <div className="hv-modal-header">
          <div className="hv-modal-title-row">
            <Bell size={18} color="#D99A24" strokeWidth={2} />
            <h3 className="hv-modal-title">Notifications</h3>
          </div>
          <button className="hv-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="hv-notif-list">
          <div className="hv-notif-item unread">
            <span className="hv-notif-dot" />
            <div>
              <strong className="hv-notif-title">Operational alert</strong>
              <p className="hv-notif-sub">Colony condition review flag recorded.</p>
            </div>
          </div>
          <div className="hv-notif-item">
            <div>
              <strong className="hv-notif-title">Sync complete</strong>
              <p className="hv-notif-sub">Offline records successfully synchronized.</p>
            </div>
          </div>
        </div>
        <button className="hv-modal-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   MAIN DYNAMIC CAPABILITY-BASED DASHBOARD
───────────────────────────────────────────────────────── */

export const HomeView = () => {
  const {
    apiary,
    hives,
    batches,
    activities,
    qualityChecks = [],
    collections = [],
    devices = [],
    session,
    userDesignations,
    userCapabilities,
    accessProfile,
    isOnline,
    isSyncing,
    pendingSyncCount,
    openSheet,
    showToast,
    setActiveTab,
    setSelectedHiveId,
    setSelectedBatchId,
    addHive,
    recordObservation,
    captureHiveImage,
    openScanModal,
    openInspectionResult,
    openQualityCheck,
    openVerification,
    openProductPackaging,
    openProductQrManagement,
    openPublicVerification,
    openBatchJourney,
    setPersonaPreset,
    canPerform,
    ACTION_PERMISSIONS
  } = useAppState();

  // Local state for modals and sheets
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [recordObsHiveId, setRecordObsHiveId] = useState(null);
  const [diagHive, setDiagHive] = useState(null);
  const [isWorkSetupOpen, setIsWorkSetupOpen] = useState(false);
  const [isProofOpen, setIsProofOpen] = useState(false);
  const [selectedProofBatch, setSelectedProofBatch] = useState(null);
  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Dynamic Dashboard Composition
  const composed = useMemo(() => {
    return composeDashboard({
      session,
      accessProfile,
      hives,
      batches,
      qualityChecks,
      collections,
      devices,
      activities
    });
  }, [session, accessProfile, hives, batches, qualityChecks, collections, devices, activities]);

  // Operational signals
  const activeHives = useMemo(() => hives.filter(h => !h.isArchived), [hives]);
  const attentionHive = useMemo(() => activeHives.find(h => h.status === 'attention'), [activeHives]);
  const pausedHives = useMemo(() => activeHives.filter(h => h.status === 'paused' || !h.monitoring?.isDeviceOnline), [activeHives]);

  // Module domain visibility
  const canSeeField = useMemo(() => {
    return composed.modules.some(m => m.category === DASHBOARD_CATEGORIES.FIELD.id);
  }, [composed]);

  const canSeeProduction = useMemo(() => {
    return composed.modules.some(m => m.category === DASHBOARD_CATEGORIES.PRODUCTION.id);
  }, [composed]);

  const canSeeQuality = useMemo(() => {
    return composed.modules.some(m => m.category === DASHBOARD_CATEGORIES.QUALITY.id);
  }, [composed]);

  const canSeeFulfillment = useMemo(() => {
    return composed.modules.some(m => m.category === DASHBOARD_CATEGORIES.FULFILLMENT.id);
  }, [composed]);

  const canSeeTrust = useMemo(() => {
    return composed.modules.some(m => m.category === DASHBOARD_CATEGORIES.TRUST.id);
  }, [composed]);

  // Attention Item Action Handler
  const handleAttentionAction = useCallback((item) => {
    if (!item) return;
    if (item.ctaAction === 'inspect_hive' || item.targetType === 'hive') {
      const targetHive = activeHives.find(h => h.id === item.targetId) || activeHives[0];
      if (targetHive) {
        const isScanAlert = (targetHive.statusText || targetHive.conditionSummary || '').toLowerCase().includes('sign');
        if (isScanAlert) {
          openInspectionResult({
            hiveId: targetHive.id,
            hive: targetHive,
            scanData: targetHive.latestScan
          });
        } else {
          openSheet('quick-inspect', { hiveId: targetHive.id });
        }
      }
    } else if (item.ctaAction === 'check_device' || item.targetType === 'device') {
      const targetHive = activeHives.find(h => h.id === item.targetId) || activeHives[0];
      if (targetHive) setDiagHive(targetHive);
    } else if (item.ctaAction === 'review_quality' || item.targetType === 'quality') {
      const targetQc = qualityChecks.find(q => q.id === item.targetId) || qualityChecks[0];
      if (targetQc && openQualityCheck) {
        openQualityCheck(targetQc);
      } else {
        showToast('Reviewing analytical quality check…');
      }
    } else if (item.ctaAction === 'verify_batch') {
      const targetBatch = batches.find(b => b.id === item.targetId) || batches[0];
      if (targetBatch && openVerification) {
        openVerification(targetBatch);
      }
    } else if (item.ctaAction === 'prepare_package') {
      const targetBatch = batches.find(b => b.id === item.targetId) || batches[0];
      if (targetBatch && openProductPackaging) {
        openProductPackaging(targetBatch);
      }
    } else if (item.ctaAction === 'view_batch') {
      setActiveTab('honey');
    }
  }, [activeHives, qualityChecks, batches, openInspectionResult, openSheet, openQualityCheck, openVerification, openProductPackaging, setActiveTab, showToast]);

  // Quick Action Handler
  const handleQuickAction = useCallback((actionId) => {
    const targetHive = attentionHive || activeHives[0];

    switch (actionId) {
      case 'scan_frame':
        openScanModal(targetHive?.id || null);
        break;
      case 'inspect_hive':
        if (targetHive) {
          openSheet('quick-inspect', { hiveId: targetHive.id });
        } else {
          setIsAddModalOpen(true);
        }
        break;
      case 'record_collection':
        openSheet('create-batch');
        break;
      case 'create_batch':
        openSheet('create-batch');
        break;
      case 'review_quality': {
        const pendingQc = qualityChecks.find(q => q.status === 'pending' || q.status === 'needs_attention') || qualityChecks[0];
        if (pendingQc && openQualityCheck) {
          openQualityCheck(pendingQc);
        } else {
          showToast('No pending quality checks to review.');
        }
        break;
      }
      case 'record_quality':
        showToast('Digital refractometer ready: Moisture 17.2% recorded');
        break;
      case 'verify_batch': {
        const targetBatch = batches.find(b => b.status === 'certified' && !b.verification?.isVerified) || batches[0];
        if (targetBatch && openVerification) {
          openVerification(targetBatch);
        }
        break;
      }
      case 'prepare_package':
        if (openProductPackaging) {
          openProductPackaging(batches[0]);
        }
        break;
      case 'create_label':
        if (openProductPackaging) {
          openProductPackaging(batches[0]);
        }
        break;
      case 'manage_qr':
        if (openProductQrManagement) {
          openProductQrManagement(batches[0]);
        }
        break;
      case 'create_shipment':
        showToast('Dispatch manifest generated and queued for transit');
        break;
      case 'view_hives':
        setActiveTab('hives');
        break;
      case 'view_traceability':
        if (openBatchJourney) {
          openBatchJourney(batches[0]);
        } else {
          setActiveTab('honey');
        }
        break;
      default:
        break;
    }
  }, [attentionHive, activeHives, batches, qualityChecks, openScanModal, openSheet, openQualityCheck, openVerification, openProductPackaging, openProductQrManagement, openBatchJourney, setActiveTab, showToast]);

  const handleSelectHive = useCallback((hiveId) => {
    setSelectedHiveId(hiveId);
    setActiveTab('hives');
  }, [setSelectedHiveId, setActiveTab]);

  const handleSelectBatch = useCallback((batchId) => {
    setSelectedBatchId(batchId);
    setActiveTab('honey');
  }, [setSelectedBatchId, setActiveTab]);

  const handleOpenProof = useCallback((batch) => {
    setSelectedProofBatch(batch || batches[0]);
    setIsProofOpen(true);
  }, [batches]);

  // Operational Context Summary (Prompt Section 19)
  const operationalSummary = useMemo(() => {
    const items = [];
    const attentionHives = activeHives.filter(h => h.status === 'attention');
    if (canSeeField && attentionHives.length > 0) {
      items.push(`${attentionHives.length} colony${attentionHives.length > 1 ? 'ies' : ''} need attention`);
    }
    const curingBatches = batches.filter(b => b.status === 'curing');
    if (canSeeProduction && curingBatches.length > 0) {
      items.push(`${curingBatches.length} batch settling in tanks`);
    }
    const pendingQC = qualityChecks.filter(q => q.status === 'pending');
    if (canSeeQuality && pendingQC.length > 0) {
      items.push(`${pendingQC.length} sample${pendingQC.length > 1 ? 's' : ''} awaiting lab results`);
    }
    return items;
  }, [activeHives, canSeeField, batches, canSeeProduction, qualityChecks, canSeeQuality]);

  const greeting = `Good ${composed.greetingPeriod}, ${composed.operatorName}`;

  return (
    <div className="hv-root">
      {/* Offline & Sync State Bar */}
      <OfflineBanner
        isOnline={isOnline}
        isSyncing={isSyncing}
        pendingSyncCount={pendingSyncCount}
      />

      {/* Header — Human, Subtle, Focused */}
      <header className="hv-header">
        <div>
          <h1 className="hv-greeting">{greeting}</h1>
          <p className="hv-header-sub">
            {composed.isZeroPermission
              ? "Your workspace access is being prepared."
              : operationalSummary.length > 0
              ? operationalSummary.join(' · ')
              : "All monitored operations are running smoothly today."}
          </p>
        </div>
        <div className="hv-header-acts">
          <button
            className="hv-icon-btn"
            aria-label="Notifications"
            onClick={() => setIsNotifOpen(true)}
          >
            <Bell size={20} strokeWidth={1.8} />
            <span className="hv-bell-badge" />
          </button>
          <button
            className="hv-avatar-btn"
            aria-label="Profile and Work Setup"
            onClick={() => setIsWorkSetupOpen(true)}
          >
            <span className="hv-avatar-init">
              {composed.operatorName ? composed.operatorName[0].toUpperCase() : 'H'}
            </span>
          </button>
        </div>
      </header>

      {/* Interactive Persona / Work Identity Switcher Bar */}
      <PersonaSwitcherPill
        workIdentity={composed.workIdentity}
        onSelectPersona={(personaId) => setPersonaPreset(personaId)}
      />

      {/* Main Content Scroll View */}
      <div className="hv-scroll">
        {/* Zero-Permission Fallback State (§ 59) */}
        {composed.isZeroPermission ? (
          <ZeroPermissionFallback
            operatorName={composed.operatorName}
            onReviewAccess={() => setIsWorkSetupOpen(true)}
            onSelectDemoPersona={() => setPersonaPreset('PERSONA_H_FULLSTACK_OPERATOR')}
          />
        ) : (
          <>
            {/* Telemetry Paused Notice */}
            {canSeeField && (
              <PausedMonitoringNotice
                pausedHives={pausedHives}
                onCheckDevice={(hive) => setDiagHive(hive)}
              />
            )}

            {/* Section 1: Highest-Priority Operational Attention Hero */}
            <div className="hv-today-block">
              <span className="hv-today-kicker">Today's Focus</span>
              <AttentionHero
                attentionItems={composed.attentionItems}
                onAction={handleAttentionAction}
              />
            </div>

            {/* Section 2: Contextual Quick Actions */}
            <ContextualQuickActions
              actions={composed.quickActions}
              onTriggerAction={handleQuickAction}
              onMoreActions={() => setActiveTab('more')}
            />

            {/* Section 3: Field Work Module (Only if Field capabilities held) */}
            {canSeeField && (
              <FieldWorkModule
                hives={activeHives}
                canInspect={canPerform(ACTION_PERMISSIONS.HIVE_INSPECT)}
                canScan={canPerform(ACTION_PERMISSIONS.HEALTH_SCAN_CREATE)}
                canAddHive={canPerform(ACTION_PERMISSIONS.HIVE_CREATE) || canPerform(ACTION_PERMISSIONS.HIVE_VIEW)}
                onViewAll={() => setActiveTab('hives')}
                onSelectHive={handleSelectHive}
                onAddHive={() => setIsAddModalOpen(true)}
                onScanFrame={(hive) => openScanModal(hive?.id || null)}
                onInspectHive={(hive) => openSheet('quick-inspect', { hiveId: hive?.id })}
              />
            )}

            {/* Section 4: Production & Batches Module (Only if Production capabilities held) */}
            {canSeeProduction && (
              <ProductionModule
                batches={batches}
                collections={collections}
                canCreateBatch={canPerform(ACTION_PERMISSIONS.BATCH_CREATE)}
                canRecordCollection={canPerform(ACTION_PERMISSIONS.COLLECTION_CREATE)}
                onViewBatches={() => setActiveTab('honey')}
                onSelectBatch={handleSelectBatch}
                onCreateBatch={() => openSheet('create-batch')}
                onRecordCollection={() => openSheet('create-batch')}
              />
            )}

            {/* Section 5: Quality & Analytical Purity Module (Only if Quality capabilities held) */}
            {canSeeQuality && (
              <QualityModule
                batches={batches}
                qualityChecks={qualityChecks}
                canRecordResult={canPerform(ACTION_PERMISSIONS.QUALITY_RESULT_CREATE)}
                canReview={canPerform(ACTION_PERMISSIONS.QUALITY_REVIEW)}
                canDecide={canPerform(ACTION_PERMISSIONS.QUALITY_DECISION)}
                onOpenQualityCheck={(qc) => openQualityCheck && openQualityCheck(qc)}
                onRecordResult={() => showToast('Digital Refractometer: 17.2% Moisture recorded')}
              />
            )}

            {/* Section 6: Fulfillment & Logistics Module (Only if Packaging/Distribution held) */}
            {canSeeFulfillment && (
              <FulfillmentModule
                batches={batches}
                canPackage={canPerform(ACTION_PERMISSIONS.PACKAGE_CREATE)}
                canLabel={canPerform(ACTION_PERMISSIONS.LABEL_CREATE)}
                canManageQr={canPerform(ACTION_PERMISSIONS.PUBLIC_QR_CREATE) || canPerform(ACTION_PERMISSIONS.PUBLIC_QR_VIEW)}
                canDistribute={canPerform(ACTION_PERMISSIONS.DISTRIBUTION_VIEW)}
                onOpenPackaging={(b) => openProductPackaging && openProductPackaging(b)}
                onOpenQrManagement={(b) => openProductQrManagement && openProductQrManagement(b)}
                onCreateShipment={() => showToast('Dispatch manifest #DIS-8910 verified and queued')}
              />
            )}

            {/* Section 7: Trust & Verification Module (Only if Verification/Traceability held) */}
            {canSeeTrust && (
              <TrustVerificationModule
                batches={batches}
                canVerify={canPerform(ACTION_PERMISSIONS.BATCH_VERIFY)}
                canViewProof={canPerform(ACTION_PERMISSIONS.PROOF_VIEW)}
                onOpenVerification={(b) => openVerification && openVerification(b)}
                onOpenProof={handleOpenProof}
                onOpenPublicVerification={(ref) => openPublicVerification && openPublicVerification(ref)}
              />
            )}

            {/* Section 8: Capability-Aware Smart Insight */}
            {composed.smartInsight && (
              <SmartInsight
                insight={composed.smartInsight}
                onWhySeeingThis={() => setIsWhyOpen(true)}
              />
            )}

            {/* Section 9: Capability-Aware Recent Activity */}
            <RecentActivity activities={composed.recentActivity} />
          </>
        )}

        <div style={{ height: 28 }} />
      </div>

      {/* Reusable Operational Modals */}
      <AddHiveModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddHive={(newHive) => {
          addHive(newHive);
          setIsAddModalOpen(false);
          showToast(`${newHive.name} created`);
        }}
      />

      <RecordObservationModal
        isOpen={Boolean(recordObsHiveId)}
        onClose={() => setRecordObsHiveId(null)}
        hive={activeHives.find(h => h.id === recordObsHiveId)}
        onSaveObservation={(hiveId, obsText) => {
          recordObservation(hiveId, obsText);
          setRecordObsHiveId(null);
          showToast('Observation recorded');
        }}
      />

      <DeviceDiagnosticSheet
        isOpen={Boolean(diagHive)}
        onClose={() => setDiagHive(null)}
        hive={diagHive}
      />

      <WorkSetupModal
        isOpen={isWorkSetupOpen}
        onClose={() => setIsWorkSetupOpen(false)}
      />

      <BlockchainProofSheet
        isOpen={isProofOpen}
        onClose={() => setIsProofOpen(false)}
        batch={selectedProofBatch || batches[0]}
      />

      <WhySeeingThisSheet
        isOpen={isWhyOpen}
        onClose={() => setIsWhyOpen(false)}
        insight={composed.smartInsight}
      />

      <NotificationsSheet
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      <style>{`
        .hv-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #FFF9EF;
          color: #34261B;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
        }

        /* Banner */
        .hv-bar {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 18px;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .hv-bar-offline {
          background: #34261B;
          color: #FFF9EF;
        }
        .hv-bar-syncing {
          background: #71845B;
          color: #FFF;
        }
        .hv-spin {
          animation: hvSpin 1s linear infinite;
        }
        @keyframes hvSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Header */
        .hv-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px 18px 8px;
          flex-shrink: 0;
        }
        .hv-greeting {
          font-size: 21px;
          font-weight: 800;
          color: #34261B;
          letter-spacing: -0.3px;
          margin: 0;
          line-height: 1.2;
        }
        .hv-header-sub {
          font-size: 13px;
          color: #786D61;
          margin: 3px 0 0;
          font-weight: 500;
        }
        .hv-header-acts {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .hv-icon-btn {
          position: relative;
          background: none;
          border: none;
          color: #34261B;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hv-bell-badge {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #D9822B;
        }
        .hv-avatar-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .hv-avatar-init {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #D99A24;
          color: #FFF;
          font-size: 13px;
          font-weight: 800;
        }

        /* Scroll Body */
        .hv-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 0 18px;
        }

        /* Sections */
        .hv-section {
          padding: 16px 0;
          border-bottom: 1px solid #EDE2D1;
        }
        .hv-today-block {
          padding: 14px 0 16px;
          border-bottom: 1px solid #EDE2D1;
        }
        .hv-today-kicker {
          display: block;
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #786D61;
          margin-bottom: 10px;
        }
        .hv-sec-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .hv-sec-title {
          font-size: 16.5px;
          font-weight: 750;
          color: #34261B;
          letter-spacing: -0.15px;
        }
        .hv-sec-link {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 12.5px;
          font-weight: 650;
          color: #B87316;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 0;
        }
        .hv-why-link {
          color: #786D61;
          font-size: 11.5px;
        }

        /* Paused Notice */
        .hv-paused-notice {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 11px 14px;
          margin-top: 10px;
        }
        .hv-paused-icon {
          color: #786D61;
          flex-shrink: 0;
        }
        .hv-paused-body {
          flex: 1;
        }
        .hv-paused-title {
          font-size: 13.5px;
          font-weight: 750;
          color: #34261B;
          display: block;
        }
        .hv-paused-sub {
          font-size: 11.5px;
          color: #786D61;
          margin: 1px 0 0;
        }
        .hv-paused-cta {
          background: none;
          border: 1px solid #EDE2D1;
          border-radius: 8px;
          color: #34261B;
          font-size: 12px;
          font-weight: 700;
          padding: 5px 10px;
          cursor: pointer;
        }

        /* Empty Box */
        .hv-empty-box {
          background: #FFFDF8;
          border: 1px dashed #EDE2D1;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .hv-empty-title {
          font-size: 14px;
          font-weight: 750;
          color: #34261B;
          margin: 0;
        }
        .hv-empty-sub {
          font-size: 12px;
          color: #786D61;
          margin: 0;
          max-width: 280px;
          line-height: 1.35;
        }
        .hv-empty-cta {
          margin-top: 6px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #D99A24;
          color: #FFF;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 750;
          padding: 7px 12px;
          cursor: pointer;
        }

        /* Smart Insight Box */
        .hv-insight-box {
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-left: 3.5px solid #D99A24;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .hv-insight-text {
          font-size: 13.5px;
          color: #34261B;
          line-height: 1.45;
          margin: 0;
        }
        .hv-insight-rec {
          font-size: 12.5px;
          color: #B87316;
          margin: 0;
          line-height: 1.4;
        }
        .hv-insight-attr {
          font-size: 11px;
          color: #786D61;
          margin: 2px 0 0;
          font-style: italic;
        }

        /* Recent Activity */
        .hv-act-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .hv-act-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: #FFFDF8;
          border: 1px solid #EDE2D1;
          border-radius: 10px;
        }
        .hv-act-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #FAF4E8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hv-act-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hv-act-title {
          font-size: 13px;
          font-weight: 650;
          color: #34261B;
        }
        .hv-act-time {
          font-size: 11.5px;
          color: #786D61;
        }

        /* Modals & Sheets */
        .hv-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(52, 38, 27, 0.45);
          backdrop-filter: blur(2px);
          z-index: 999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .hv-modal-card {
          background: #FFFDF8;
          border-radius: 20px 20px 0 0;
          width: 100%;
          max-width: 480px;
          max-height: 85vh;
          overflow-y: auto;
          padding: 20px 20px 28px;
          box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .hv-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hv-modal-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hv-modal-title {
          font-size: 17px;
          font-weight: 800;
          color: #34261B;
          margin: 0;
        }
        .hv-modal-close {
          background: none;
          border: none;
          color: #786D61;
          cursor: pointer;
          padding: 4px;
        }
        .hv-modal-intro {
          font-size: 13px;
          color: #786D61;
          line-height: 1.45;
          margin: 0;
        }
        .hv-modal-btn {
          width: 100%;
          background: #D99A24;
          color: #FFF;
          border: none;
          border-radius: 12px;
          padding: 13px;
          font-size: 14px;
          font-weight: 750;
          cursor: pointer;
          margin-top: 6px;
        }

        /* Proof Details */
        .hv-proof-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
          padding: 12px 14px;
        }
        .hv-proof-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .hv-proof-key {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #786D61;
        }
        .hv-proof-val {
          font-family: monospace;
          font-size: 12px;
          color: #B87316;
          background: #FFFDF8;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid #EDE2D1;
          word-break: break-all;
        }
        .hv-proof-text {
          font-size: 12.5px;
          color: #34261B;
          font-weight: 600;
        }
        .hv-proof-badge-verified {
          display: inline-block;
          align-self: flex-start;
          background: rgba(79, 122, 82, 0.12);
          color: #4F7A52;
          border: 1px solid rgba(79, 122, 82, 0.3);
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        /* Why Seeing This Reasons */
        .hv-why-reasons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .hv-why-box {
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-radius: 10px;
          padding: 11px 12px;
        }
        .hv-why-box-title {
          font-size: 12px;
          font-weight: 750;
          color: #B87316;
          display: block;
          margin-bottom: 2px;
        }
        .hv-why-box-desc {
          font-size: 12.5px;
          color: #34261B;
          line-height: 1.4;
          margin: 0;
        }

        /* Notifications Sheet */
        .hv-notif-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .hv-notif-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 12px;
          background: #FAF4E8;
          border: 1px solid #EDE2D1;
          border-radius: 12px;
        }
        .hv-notif-item.unread {
          border-left: 3.5px solid #D9822B;
          background: #FFFDF8;
        }
        .hv-notif-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #D9822B;
          margin-top: 5px;
          flex-shrink: 0;
        }
        .hv-notif-title {
          font-size: 13px;
          font-weight: 750;
          color: #34261B;
          display: block;
        }
        .hv-notif-sub {
          font-size: 12px;
          color: #786D61;
          margin: 2px 0 0;
        }
      `}</style>
    </div>
  );
};
