import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { WorkspaceProfileHeader } from './WorkspaceProfileHeader';
import { BeekeeperProfile } from './BeekeeperProfile';
import { ProcessorProfile } from './ProcessorProfile';
import { LabProfile } from './LabProfile';
import { DistributorProfile } from './DistributorProfile';
import { SharedSecuritySection } from './SharedSecuritySection';
import { SharedAccountSettings } from './SharedAccountSettings';
import { WorkspaceSwitcherModal } from './WorkspaceSwitcherModal';
import { ProfileEditModal } from './ProfileEditModal';
import { AddApiaryModal } from '../apiary/AddApiaryModal';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw 
} from 'lucide-react';

export const ProfileView = () => {
  const {
    session,
    activeDesignation,
    switchActiveDesignation,
    updateUserIdentity,
    updateWorkspaceSettings,
    apiary,
    apiaries,
    hives,
    devices,
    addApiary,
    processingBatches,
    labSamples,
    labTests,
    dispatchPackages,
    dispatchShipments,
    isOnline,
    isSyncing,
    pendingSyncCount,
    toggleOnlineMode,
    triggerSync,
    setActiveTab,
    logout,
    showToast
  } = useAppState();

  const [activeTab, setActiveTabLocal] = useState('profile'); // 'profile' | 'settings'
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddApiaryOpen, setIsAddApiaryOpen] = useState(false);

  // Authoritative role resolution for the workspace profile (§ 11)
  const rawRole = (activeDesignation || session?.activeDesignation || session?.designations?.[0] || 'BEEKEEPER').toUpperCase();
  const activeRole = rawRole === 'LAB' ? 'LAB_SPECIALIST' : (rawRole === 'DISPATCH' ? 'DISTRIBUTOR' : rawRole);

  const isBeekeeper = activeRole === 'BEEKEEPER';
  const isProcessor = activeRole === 'PROCESSOR';
  const isLab = activeRole === 'LAB_SPECIALIST';
  const isDistributor = activeRole === 'DISTRIBUTOR';

  // Workspace Name resolution
  const workspaceName = isBeekeeper
    ? (apiary?.name || 'Valley Apiary 01')
    : isProcessor
    ? 'Kaveri Honey Processing Facility'
    : isLab
    ? 'Apex Honey Analytical Laboratory'
    : 'HoneyChain Logistics Hub South';

  // Verification text resolution
  const verificationText = isBeekeeper
    ? 'Identity & NBB Registered'
    : isProcessor
    ? 'FSSAI Manufacturing Licensed'
    : isLab
    ? 'NABL Accredited (TC-8841)'
    : 'Commercial Transport Licensed';

  const handleOpenAddApiary = () => {
    setIsAddApiaryOpen(true);
  };

  return (
    <div className="workspace-profile-container" style={{ maxWidth: '1080px', margin: '0 auto', padding: '16px' }}>
      {/* 1. Common Unified Profile Header (§ 3) */}
      <WorkspaceProfileHeader
        session={session}
        activeRole={activeRole}
        workspaceName={workspaceName}
        verificationText={verificationText}
        activeTab={activeTab}
        onTabChange={setActiveTabLocal}
        onOpenSwitcher={() => setIsSwitcherOpen(true)}
        onOpenEdit={() => setIsEditOpen(true)}
      />

      {/* Field Sync & Network Status Box */}
      <div 
        className="card sync-control-card"
        style={{
          marginBottom: '20px',
          padding: '16px 20px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: isLab ? '#FFFFFF' : 'var(--theme-surface)',
          border: isLab ? '1px solid #E2E8F0' : '1px solid var(--theme-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isOnline ? (
            <Wifi size={18} color="var(--color-healthy)" />
          ) : (
            <WifiOff size={18} color="var(--color-attention)" />
          )}
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
              {isOnline ? 'Cellular & Mesh Connected' : 'Offline Field Mode'}
            </h4>
            <p className="supporting-text" style={{ margin: 0, fontSize: '12px' }}>
              {isOnline
                ? pendingSyncCount > 0
                  ? `${pendingSyncCount} local changes ready to sync`
                  : 'All workspace records securely anchored to HoneyChain ledger'
                : `${pendingSyncCount} logs queued in secure device storage`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={toggleOnlineMode}
          >
            {isOnline ? 'Simulate Offline' : 'Reconnect Online'}
          </button>
          {isOnline && (
            <button
              className="btn btn-primary btn-sm"
              onClick={triggerSync}
              disabled={isSyncing}
            >
              <RefreshCw size={14} className={isSyncing ? 'spin-icon' : ''} />
              <span>{isSyncing ? 'Anchoring...' : 'Sync to Ledger'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Content: Workspace Profile vs Security & Account Settings */}
      {activeTab === 'profile' ? (
        <div className="active-workspace-profile-view">
          {/* 2. Beekeeper Profile View (§ 4) */}
          {isBeekeeper && (
            <BeekeeperProfile
              apiary={apiary}
              apiaries={apiaries}
              hives={hives}
              devices={devices}
              session={session}
              onNavigateTo={setActiveTab}
              onOpenAddApiary={handleOpenAddApiary}
              onSaveSettings={updateWorkspaceSettings}
            />
          )}

          {/* 3. Processor Profile View (§ 5) */}
          {isProcessor && (
            <ProcessorProfile
              processingBatches={processingBatches}
              session={session}
              onNavigateTo={setActiveTab}
              onSaveSettings={updateWorkspaceSettings}
            />
          )}

          {/* 4. Laboratory Profile View (§ 6) */}
          {isLab && (
            <LabProfile
              labSamples={labSamples}
              labTests={labTests}
              session={session}
              onNavigateTo={setActiveTab}
              onSaveSettings={updateWorkspaceSettings}
            />
          )}

          {/* 5. Distributor Profile View (§ 7) */}
          {isDistributor && (
            <DistributorProfile
              dispatchPackages={dispatchPackages}
              dispatchShipments={dispatchShipments}
              session={session}
              onNavigateTo={setActiveTab}
              onSaveSettings={updateWorkspaceSettings}
            />
          )}
        </div>
      ) : (
        <div className="security-account-settings-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 6. Shared Security Section (§ 8) */}
          <SharedSecuritySection
            session={session}
            onLogout={logout}
            showToast={showToast}
          />

          {/* 7. Shared Account Settings (§ 9) */}
          <SharedAccountSettings
            session={session}
            onUpdateIdentity={updateUserIdentity}
            showToast={showToast}
          />
        </div>
      )}

      {/* Workspace Switcher Modal (§ 10, § 24) */}
      <WorkspaceSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        activeRole={activeRole}
        onSwitchWorkspace={(roleId) => {
          switchActiveDesignation(roleId);
        }}
      />

      {/* Sectional Profile Edit Modal (§ 13) */}
      <ProfileEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        activeRole={activeRole}
        session={session}
        apiary={apiary}
        onUpdateIdentity={updateUserIdentity}
        onUpdateWorkspace={(updates) => {
          if (isBeekeeper && updates.name) {
            // Update apiary name
          }
          if (showToast) showToast('Workspace profile details updated');
        }}
      />

      {/* Add Apiary Modal for Workspace Identity & Settings */}
      <AddApiaryModal
        isOpen={isAddApiaryOpen}
        onClose={() => setIsAddApiaryOpen(false)}
      />
    </div>
  );
};
