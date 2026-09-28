/**
 * HONEYCHAIN — ROLE-DIRECTED ONBOARDING VIEW
 *
 * Flow:
 * 1. Role Selection Screen: "What do you do?"
 *    (Beekeeper, Processor, Lab Specialist, Distributor)
 * 2. On selecting a designation, the user immediately enters the dedicated
 *    onboarding flow for THAT PARTICULAR DESIGNATION ONLY:
 *    - BEEKEEPER     → BeekeeperOnboarding (Field yard, hive boxes, honey collection)
 *    - PROCESSOR     → CommonProcessorOnboarding (Facility, processing scale, methods)
 *    - LAB_SPECIALIST → LabOnboarding (Lab accreditation, honey testing parameters, instruments)
 *    - DISTRIBUTOR   → DispatchOnboarding (Logistics hub, fleet, buyer channels, QR dispatch)
 *
 * No generic questions or unrelated details from the other three designations are shown.
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';

// Role-specific onboarding flows
import { RoleSelectionScreen } from './RoleSelectionScreen';
import { BeekeeperOnboarding } from './BeekeeperOnboarding';
import { LabOnboarding } from './LabOnboarding';
import { DispatchOnboarding } from './DispatchOnboarding';
import { CommonProcessorOnboarding } from './CommonProcessorOnboarding';

import './RoleOnboarding.css';
import './CommonProcessorOnboarding.css';

const VIEW = {
  ROLE_SELECT: 'ROLE_SELECT',
  BEEKEEPER: 'BEEKEEPER',
  PROCESSOR: 'PROCESSOR',
  LAB: 'LAB',
  DISPATCH: 'DISPATCH'
};

export const OnboardingView = () => {
  const { completeCapabilityOnboarding, apiary, session } = useAppState();

  const [currentView, setCurrentView] = useState(VIEW.ROLE_SELECT);

  const handleRoleSelect = (roleId) => {
    switch (roleId) {
      case 'BEEKEEPER':
        setCurrentView(VIEW.BEEKEEPER);
        break;
      case 'PROCESSOR':
        setCurrentView(VIEW.PROCESSOR);
        break;
      case 'LAB_SPECIALIST':
      case 'LAB':
        setCurrentView(VIEW.LAB);
        break;
      case 'DISTRIBUTOR':
      case 'DISPATCH':
        setCurrentView(VIEW.DISPATCH);
        break;
      default:
        setCurrentView(VIEW.BEEKEEPER);
        break;
    }
  };

  const handleRoleComplete = (config) => {
    try {
      localStorage.removeItem('honeychain_onboarding_draft');
    } catch (_) {}

    completeCapabilityOnboarding({
      capabilities: config.capabilities || [],
      designations: config.designations || [],
      workContexts: config.workContexts || { areas: [], handles: [] },
      operatorName: config.operatorName || session?.operator || '',
      apiaryName: config.apiaryName || apiary?.name || '',
      userCapabilityProfile: config.userCapabilityProfile || null
    });
  };

  return (
    <div className="onboarding-viewport-clean">
      {/* 1. Role Selection: Choose between Beekeeper, Processor, Lab, Distributor */}
      {currentView === VIEW.ROLE_SELECT && (
        <RoleSelectionScreen onSelectRole={handleRoleSelect} />
      )}

      {/* 2. Beekeeper: Beekeeper-specific details only */}
      {currentView === VIEW.BEEKEEPER && (
        <BeekeeperOnboarding
          onComplete={handleRoleComplete}
          onBack={() => setCurrentView(VIEW.ROLE_SELECT)}
        />
      )}

      {/* 3. Processor: Processor-specific details only */}
      {currentView === VIEW.PROCESSOR && (
        <CommonProcessorOnboarding
          initialData={{ activity: 'PROCESS' }}
          onComplete={(config) => {
            handleRoleComplete({
              capabilities: config.capabilities || [
                'PROCESSING_MANAGEMENT', 'BATCH_INTAKE',
                'PROCESSING_STEP_RECORD', 'PROCESSING_COMPLETION',
                'BATCH_TRACEABILITY', 'QUALITY_HANDOFF', 'PACKAGING_HANDOFF'
              ],
              designations: ['PROCESSOR'],
              workContexts: {
                areas: ['Processing facility'],
                handles: ['Honey batches', 'Processing steps'],
                ...config.workContexts
              },
              operatorName: config.operatorName || config.organization?.name || '',
              apiaryName: config.facility?.name || config.organization?.name || ''
            });
          }}
          onCancel={() => setCurrentView(VIEW.ROLE_SELECT)}
        />
      )}

      {/* 4. Lab Specialist: Lab-specific details only */}
      {currentView === VIEW.LAB && (
        <LabOnboarding
          onComplete={handleRoleComplete}
          onBack={() => setCurrentView(VIEW.ROLE_SELECT)}
        />
      )}

      {/* 5. Distributor: Distribution-specific details only */}
      {currentView === VIEW.DISPATCH && (
        <DispatchOnboarding
          onComplete={handleRoleComplete}
          onBack={() => setCurrentView(VIEW.ROLE_SELECT)}
        />
      )}

      <style>{`
        .onboarding-viewport-clean {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          background-color: var(--color-warm-cream, #FAF7F2);
          color: var(--color-deep-cocoa, #2E261D);
          overflow-y: auto;
          z-index: 50;
        }
      `}</style>
    </div>
  );
};

export default OnboardingView;
