import React from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { SplashScreen } from './components/splash/SplashScreen';
import { WelcomeView } from './components/welcome/WelcomeView';
import { RegisterView } from './components/auth/RegisterView';
import { LoginView } from './components/auth/LoginView';
import { EmailVerificationView } from './components/auth/EmailVerificationView';
import { OnboardingView } from './components/onboarding/OnboardingView';
import { TopBar } from './components/common/TopBar';
import { BottomNav } from './components/common/BottomNav';
import { Toast } from './components/common/Toast';
import { HomeView } from './components/home/HomeView';
import { HivesView } from './components/hives/HivesView';
import { HoneyView } from './components/honey/HoneyView';
import { MoreView } from './components/more/MoreView';
import { InspectionsView } from './components/inspections/InspectionsView';
import { ProcessingView } from './components/processing/ProcessingView';
import { SamplesView } from './components/lab/SamplesView';
import { TestsView } from './components/lab/TestsView';
import { ReviewView } from './components/lab/ReviewView';
import { DispatchView } from './components/dispatch/DispatchView';
import { DispatchHome } from './components/dispatch/DispatchHome';
import { RoutesView } from './components/dispatch/RoutesView';
import { DeliveriesView } from './components/dispatch/DeliveriesView';
import { TraceabilityView } from './components/honey/TraceabilityView';
import { HiveInspectionModal } from './components/hives/HiveInspectionModal';
import { CreateBatchModal } from './components/honey/CreateBatchModal';
import { VerificationSheet } from './components/honey/VerificationSheet';
import { BeeHealthScanModal } from './components/hives/BeeHealthScanModal';
import { AddHiveModal } from './components/hives/AddHiveModal';
import { InspectionResultView } from './components/hives/InspectionResultView';
import { InspectionSavedView } from './components/hives/InspectionSavedView';
import { CollectionDetailsView } from './components/honey/CollectionDetailsView';
import { QualityCheckView } from './components/honey/QualityCheckView';
import { BatchJourneyView } from './components/honey/BatchJourneyView';
import { TechnicalProofView } from './components/honey/TechnicalProofView';
import { PublicVerificationView } from './components/honey/PublicVerificationView';
import { ProductScannerView } from './components/honey/ProductScannerView';
import { ProductQrManagementView } from './components/honey/ProductQrManagementView';
import { ProductPackagingView } from './components/honey/ProductPackagingView';
import { BeekeeperHome } from './components/beekeeper/BeekeeperHome';
import { BeekeeperHivesView } from './components/beekeeper/BeekeeperHivesView';
import { BeekeeperInspectionsView } from './components/beekeeper/BeekeeperInspectionsView';
import { BeekeeperHarvestView } from './components/beekeeper/BeekeeperHarvestView';
import { HoneyJourneyView } from './components/beekeeper/HoneyJourneyView';
import { AccessDeniedView } from './components/common/AccessDeniedView';
import { ProcessorHome } from './components/processing/ProcessorHome';
import { LabHome } from './components/lab/LabHome';
import { RouteRegistry } from './services/routeRegistry';

const MainApp = () => {
  const {
    session,
    currentScreen,
    navigateTo,
    handleStartupComplete,
    activeTab,
    setActiveTab,
    activeSheet,
    sheetPayload,
    closeSheet,
    toastMessage,
    isScanModalOpen,
    closeScanModal,
    scanTargetHiveId,
    selectedHiveId,
    activeInspectionResult,
    closeInspectionResult,
    activeInspectionSaved,
    closeInspectionSaved,
    activeCollectionDetails,
    closeCollectionDetails,
    activeQualityCheck,
    closeQualityCheck,
    activeBatchJourney,
    closeBatchJourney,
    activeVerification,
    closeVerification,
    activeTechnicalProof,
    closeTechnicalProof,
    activePublicVerification,
    openPublicVerification,
    closePublicVerification,
    activeProductScanner,
    openProductScanner,
    closeProductScanner,
    activeProductQrManagement,
    closeProductQrManagement,
    activeProductPackaging,
    closeProductPackaging,
    setSelectedProcessingBatchId
  } = useAppState();

  // Screen 28: Public Verification / Consumer Traceability (Public, zero auth required)
  if (activePublicVerification) {
    return (
      <div className="app-viewport">
        <PublicVerificationView
          isOpen={true}
          onClose={session?.isAuthenticated ? closePublicVerification : () => closePublicVerification()}
          initialReference={typeof activePublicVerification === 'string' ? activePublicVerification : activePublicVerification?.reference || 'HC-2409'}
          onOpenScanner={openProductScanner}
        />
        {activeProductScanner && (
          <ProductScannerView
            isOpen={true}
            onClose={closeProductScanner}
            onResolveVerification={(ref) => {
              closeProductScanner();
              openPublicVerification(ref);
            }}
          />
        )}
      </div>
    );
  }

  // Screen 29: Product Verification Scanner (Standalone full view)
  if (activeProductScanner) {
    return (
      <div className="app-viewport">
        <ProductScannerView
          isOpen={true}
          onClose={closeProductScanner}
          onResolveVerification={(ref) => {
            closeProductScanner();
            openPublicVerification(ref);
          }}
        />
      </div>
    );
  }

  // Screen 30: Product / Package QR Management (Standalone full view)
  if (activeProductQrManagement) {
    return (
      <div className="app-viewport">
        <ProductQrManagementView
          isOpen={true}
          onClose={closeProductQrManagement}
          batchId={activeProductQrManagement?.batchId}
          packageId={activeProductQrManagement?.packageId}
        />
      </div>
    );
  }

  // Screen 31: Product Packaging / Label Generation (Standalone full view)
  if (activeProductPackaging) {
    return (
      <div className="app-viewport">
        <ProductPackagingView
          isOpen={true}
          onClose={closeProductPackaging}
          batchId={activeProductPackaging?.batchId}
          packageId={activeProductPackaging?.packageId}
        />
      </div>
    );
  }

  // Screen 01: Mobile Splash Screen
  if (currentScreen === 'splash') {
    return (
      <div className="app-viewport">
        <SplashScreen
          session={session}
          onReady={handleStartupComplete}
        />
      </div>
    );
  }

  // Screen 02: Mobile Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div className="app-viewport">
        <WelcomeView />
      </div>
    );
  }

  // Register Screen (Destination from Welcome "Get started")
  if (currentScreen === 'register') {
    return (
      <div className="app-viewport">
        <RegisterView />
      </div>
    );
  }

  // Login Screen (Destination from Welcome "I already have an account")
  if (currentScreen === 'login') {
    return (
      <div className="app-viewport">
        <LoginView />
      </div>
    );
  }

  // Authenticated user with pending onboarding setup
  if (currentScreen === 'onboarding') {
    return (
      <div className="app-viewport">
        <OnboardingView />
      </div>
    );
  }

  // Password Recovery flow placeholder
  if (currentScreen === 'forgot-password') {
    return (
      <div className="app-viewport">
        <div style={{ padding: '28px var(--mobile-pad)', backgroundColor: 'var(--color-warm-cream)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-deep-cocoa)', marginBottom: '8px' }}>Password Recovery</h2>
          <p style={{ color: 'var(--color-warm-gray)', fontSize: '14.5px', lineHeight: 1.5, marginBottom: '24px' }}>
            Password reset instructions will be sent to your registered apiarist email.
          </p>
          <button className="btn btn-secondary" onClick={() => navigateTo('login')} style={{ height: '50px' }}>
            Back to Sign in
          </button>
        </div>
      </div>
    );
  }

  // Screen 04: Mobile Email Verification with OTP
  if (currentScreen === 'verification') {
    return (
      <div className="app-viewport">
        <EmailVerificationView />
      </div>
    );
  }

  const userCaps = new Set((session?.capabilities || []).map(c => String(c).toUpperCase()));
  const isProcessorOrLabOrDistributor =
    userCaps.has('PROCESSING_MANAGEMENT') ||
    userCaps.has('LAB_WORKSPACE') ||
    userCaps.has('DISPATCH_PLANNING') ||
    userCaps.has('DISTRIBUTION_WORKSPACE') ||
    userCaps.has('SHIPMENT_DISPATCH') ||
    userCaps.has('PACKAGE_QR_VALIDATE') ||
    userCaps.has('SAMPLE_INTAKE') ||
    userCaps.has('TEST_EXECUTION');
  const isPureBeekeeper = !isProcessorOrLabOrDistributor;
  const isPureProcessor = (userCaps.has('PROCESSING_MANAGEMENT') || userCaps.has('BATCH_INTAKE')) &&
    !userCaps.has('HIVE_MANAGEMENT') &&
    !userCaps.has('LAB_WORKSPACE') &&
    !userCaps.has('DISPATCH_PLANNING') &&
    !userCaps.has('DISTRIBUTION_WORKSPACE');
  const isPureLab = (userCaps.has('LAB_WORKSPACE') || userCaps.has('SAMPLE_INTAKE') || userCaps.has('TEST_EXECUTION')) &&
    !userCaps.has('HIVE_MANAGEMENT') &&
    !userCaps.has('PROCESSING_MANAGEMENT') &&
    !userCaps.has('DISPATCH_PLANNING') &&
    !userCaps.has('DISTRIBUTION_WORKSPACE');
  const isPureDistributor = (userCaps.has('DISTRIBUTION_WORKSPACE') || userCaps.has('DISPATCH_PLANNING') || userCaps.has('SHIPMENT_DISPATCH') || userCaps.has('PACKAGE_QR_VALIDATE')) &&
    !userCaps.has('HIVE_MANAGEMENT') &&
    !userCaps.has('PROCESSING_MANAGEMENT') &&
    !userCaps.has('LAB_WORKSPACE');

  const renderActiveScreen = () => {
    const effectiveCaps = session?.capabilities?.length
      ? session.capabilities
      : ['HIVE_MANAGEMENT', 'HIVE_MONITORING', 'HIVE_INSPECTION', 'BEE_HEALTH_SCAN', 'HONEY_COLLECTION', 'COLLECTION_BATCH_LINK', 'BATCH_TRACEABILITY'];

    const targetRoute = RouteRegistry.getRoute(activeTab);
    if (targetRoute && !RouteRegistry.validateRouteAccess(targetRoute.id, effectiveCaps)) {
      return (
        <AccessDeniedView
          attemptedRoute={targetRoute.title || targetRoute.label}
          requiredCapabilities={targetRoute.requiredCapabilities || []}
          userCapabilities={effectiveCaps}
          onReturn={() => setActiveTab('home')}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        if (isPureBeekeeper) return <BeekeeperHome />;
        if (isPureProcessor) {
          return (
            <ProcessorHome
              onNavigateToIntake={() => setActiveTab('intake')}
              onNavigateToBatches={() => setActiveTab('batches')}
              onOpenCreateBatch={() => setActiveTab('intake')}
              onOpenBatchDetail={(b) => {
                if (setSelectedProcessingBatchId) setSelectedProcessingBatchId(b.id);
                setActiveTab('batches');
              }}
            />
          );
        }
        if (isPureLab) {
          return (
            <LabHome
              onNavigateToSamples={() => setActiveTab('samples')}
              onNavigateToTests={() => setActiveTab('tests')}
              onNavigateToReview={() => setActiveTab('review')}
            />
          );
        }
        if (isPureDistributor) {
          return (
            <DispatchHome
              onNavigateToPackages={() => setActiveTab('dispatch')}
              onNavigateToShipments={() => setActiveTab('shipments')}
              onNavigateToTracking={() => setActiveTab('deliveries')}
            />
          );
        }
        return <HomeView />;
      case 'hives':
        return isPureBeekeeper ? <BeekeeperHivesView /> : <HivesView />;
      case 'inspections':
      case 'health':
        return isPureBeekeeper ? <BeekeeperInspectionsView /> : <InspectionsView />;
      case 'harvest':
        return <BeekeeperHarvestView />;
      case 'journey':
        return <HoneyJourneyView />;
      case 'honey':
        return isPureBeekeeper ? <BeekeeperHarvestView /> : <HoneyView />;
      case 'intake':
      case 'processing':
      case 'batches':
      case 'history':
        return <ProcessingView />;
      case 'samples':
        return <SamplesView />;
      case 'tests':
        return <TestsView />;
      case 'review':
        return <ReviewView />;
      case 'dispatch':
      case 'orders':
        return <DispatchView initialTab="PACKAGES" />;
      case 'shipments':
        return <DispatchView initialTab="SHIPMENTS" />;
      case 'routes':
        return <RoutesView />;
      case 'deliveries':
        return <DeliveriesView />;
      case 'traceability':
        return <TraceabilityView />;
      case 'more':
        return <MoreView />;
      default:
        return isPureBeekeeper ? <BeekeeperHome /> : <HomeView />;
    }
  };

  const getActiveModule = () => {
    if (['samples', 'tests', 'review'].includes(activeTab) || (activeTab === 'home' && isPureLab)) return 'lab';
    if (['intake', 'processing', 'batches', 'history'].includes(activeTab) || (activeTab === 'home' && isPureProcessor)) return 'processor';
    if (['dispatch', 'shipments', 'routes', 'deliveries', 'orders'].includes(activeTab) || (activeTab === 'home' && isPureDistributor)) return 'dispatch';
    return 'beekeeper';
  };
  const activeModule = getActiveModule();

  return (
    <div className={`app-viewport module-${activeModule}`} data-module={activeModule}>
      {/* Toast Feedback */}
      <Toast message={toastMessage} />

      {/* Context Top Bar: "Where am I?" + Connectivity (hidden on detailed hive view) */}
      {!(selectedHiveId && activeTab === 'hives') && <TopBar />}

      {/* Main Screen Content */}
      <main className="app-content" id="main-content">
        {renderActiveScreen()}
      </main>

      {/* Fixed Primary Bottom Navigation */}
      <BottomNav />

      {/* Reusable Contextual Sheets / Modals */}
      <HiveInspectionModal
        isOpen={activeSheet === 'quick-inspect' || activeSheet === 'hive-inspect'}
        onClose={closeSheet}
        initialHiveId={sheetPayload?.hiveId}
      />

      <CreateBatchModal
        isOpen={activeSheet === 'create-batch'}
        onClose={closeSheet}
        initialPayload={sheetPayload}
      />

      <VerificationSheet
        isOpen={activeSheet === 'verify-batch' || Boolean(activeVerification)}
        onClose={() => {
          if (activeSheet === 'verify-batch') closeSheet();
          if (activeVerification) closeVerification();
        }}
        batch={activeVerification?.batch || sheetPayload?.batch}
        initialScenario={activeVerification?.scenario}
      />

      <BeeHealthScanModal
        isOpen={isScanModalOpen}
        onClose={closeScanModal}
        targetHiveId={scanTargetHiveId}
      />

      <AddHiveModal
        isOpen={activeSheet === 'add-hive'}
        onClose={closeSheet}
      />

      {/* Screen 19: Bee Health Inspection Result */}
      <InspectionResultView
        isOpen={Boolean(activeInspectionResult)}
        onClose={closeInspectionResult}
        inspectionData={activeInspectionResult}
      />

      {/* Screen 20: Inspection Saved / Hive History Update */}
      <InspectionSavedView
        isOpen={Boolean(activeInspectionSaved)}
        onClose={closeInspectionSaved}
        savedData={activeInspectionSaved}
      />

      {/* Screen 23: Collection Details */}
      <CollectionDetailsView
        isOpen={Boolean(activeCollectionDetails)}
        onClose={closeCollectionDetails}
        payload={activeCollectionDetails}
      />

      {/* Screen 24: Quality Check */}
      <QualityCheckView
        isOpen={Boolean(activeQualityCheck)}
        onClose={closeQualityCheck}
        payload={activeQualityCheck}
      />

      {/* Screen 25: Honey Journey / Batch Traceability */}
      <BatchJourneyView
        isOpen={Boolean(activeBatchJourney)}
        onClose={closeBatchJourney}
        payload={activeBatchJourney}
      />

      {/* Screen 27: Technical Proof */}
      <TechnicalProofView
        isOpen={Boolean(activeTechnicalProof)}
        onClose={closeTechnicalProof}
        batch={activeTechnicalProof?.batch}
        initialScenario={activeTechnicalProof?.scenario || 'confirmed'}
      />

      {/* Screen 28: Public Verification / Consumer Traceability */}
      <PublicVerificationView
        isOpen={Boolean(activePublicVerification)}
        onClose={closePublicVerification}
        initialReference={typeof activePublicVerification === 'string' ? activePublicVerification : activePublicVerification?.reference || 'HC-2409'}
        onOpenScanner={openProductScanner}
      />

      {/* Screen 29: QR / Product Verification Scanner */}
      <ProductScannerView
        isOpen={Boolean(activeProductScanner)}
        onClose={closeProductScanner}
        onResolveVerification={(ref) => {
          closeProductScanner();
          openPublicVerification(ref);
        }}
      />

      {/* Screen 30: Product / Package QR Management */}
      <ProductQrManagementView
        isOpen={Boolean(activeProductQrManagement)}
        onClose={closeProductQrManagement}
        batchId={activeProductQrManagement?.batchId}
        packageId={activeProductQrManagement?.packageId}
      />

      {/* Screen 31: Product Packaging / Label Generation */}
      <ProductPackagingView
        isOpen={Boolean(activeProductPackaging)}
        onClose={closeProductPackaging}
        batchId={activeProductPackaging?.batchId}
        packageId={activeProductPackaging?.packageId}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppStateProvider>
      <MainApp />
    </AppStateProvider>
  );
}
