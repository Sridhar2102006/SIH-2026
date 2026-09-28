import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  initialApiary,
  initialHives,
  initialBatches,
  initialActivities,
  initialDevices,
  initialCollections,
  initialQualityChecks
} from '../data/mockData';
import {
  getDefaultSession,
  persistSession,
  StartupDestination,
  resolveStartupDestination
} from '../services/startupRouter';
import {
  validateAndResolveProfile,
  resolveAccessProfile,
  DESIGNATIONS,
  canPerformAction,
  getAuditLog,
  ACTION_PERMISSIONS,
  ACCESS_POLICY_VERSION
} from '../services/capabilityEngine';
import { DEMO_PERSONAS } from '../services/dashboardCompositionEngine';
import { composeWorkspace } from '../services/workspaceComposer';
import { WorkspaceVisualIdentityService } from '../services/workspaceVisualIdentityService';
import { AuthorizationService } from '../services/authorizationService';
import { RouteRegistry } from '../services/routeRegistry';
import {
  initialApiaries,
  initialFrames,
  initialHarvestRecords,
  initialHandoverRecords,
  initialHiveHistoryEvents,
  generateTraceabilityCode,
  validateTraceabilityCode,
  validateApiaryCode,
  validateHiveCode,
  validateFrameNumber,
  isCodeUnique,
  canTransitionFrame,
  FRAME_STATUSES,
  FRAME_STATUS_LABELS
} from '../services/beekeeperDomainService';
import {
  createHiveManagementBatch as buildHiveManagementBatch,
  deriveHiveManagementBatchStatus,
  getInspectionSchedule,
  HIVE_BATCH_STATUS,
  HIVE_CYCLE_STATUS
} from '../services/hiveManagementBatchDomain';
import {
  ProcessorDomainService,
  INTAKE_STATUSES,
  INTAKE_STATUS_LABELS,
  BATCH_STATUSES,
  BATCH_STATUS_LABELS,
  PROCESSING_STEPS,
  INTAKE_REJECTION_REASONS,
  BATCH_HOLD_REASONS,
  initialProcessingBatches,
  initialProcessingAuditLog
} from '../services/processorDomainService';
import { ProcessingEngine, STEP_STATUSES, DEVIATION_SEVERITIES } from '../services/processingEngine';
import { ProcessorProfileService } from '../services/processorProfileService';
import {
  SAMPLE_STATUSES,
  SAMPLE_STATUS_LABELS,
  CUSTODY_ACTIONS,
  TEST_STATUSES,
  TEST_PRIORITIES,
  REVIEW_STATUSES,
  REPORT_STATUSES,
  QUALITY_RECOMMENDATIONS,
  QUALITY_DECISIONS,
  LAB_TEST_CATALOG,
  LAB_EQUIPMENT_CATALOG,
  generateSampleId,
  generateTestId,
  validateSampleIntake,
  validateSampleRejection,
  validateTestAssignment,
  validateTestMeasurement,
  validateResultCorrection,
  initialLabSamples,
  initialLabTests,
  initialLabAuditLog
} from '../services/labDomainService';
import {
  PACKAGE_STATUSES,
  QR_VALIDATION_STATES,
  SHIPMENT_STATUSES,
  DELIVERY_EXCEPTION_TYPES,
  generateShipmentId,
  validateScannedQr,
  validateShipmentRelease,
  initialDispatchPackages,
  initialDispatchShipments,
  initialDispatchAuditLog
} from '../services/dispatchDomainService';
import {
  honeyDatabaseGateway,
  TABLE_NAMES
} from '../services/honeyDatabaseGateway';
import { productQrService } from '../data/productQrService';
import { CentralizedReportingService } from '../services/centralizedReportingService';
import { QrEngineService } from '../services/qrEngineService';

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  // Startup Lifecycle: 'splash' -> ('welcome' | 'onboarding' | 'home')
  const [session, setSession] = useState(getDefaultSession);
  const [currentScreen, setCurrentScreen] = useState('splash');

  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'hives' | 'inspections' | 'harvest' | 'journey' | 'intake' | 'processing' | 'batches' | 'history' | 'more'
  const [apiary, setApiary] = useState(null);
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [frames, setFrames] = useState([]);
  const [harvestRecords, setHarvestRecords] = useState([]);
  const [handoverRecords, setHandoverRecords] = useState([]);
  const [hiveHistoryEvents, setHiveHistoryEvents] = useState([]);
  // This is a beekeeper field-management cycle. It is deliberately not the
  // `batches` state used for processor-side honey batches.
  const [hiveManagementBatches, setHiveManagementBatches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [processingBatches, setProcessingBatches] = useState([]);
  const [processingAuditLog, setProcessingAuditLog] = useState([]);
  const [selectedProcessingBatchId, setSelectedProcessingBatchId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [devices, setDevices] = useState([]);
  const [collections, setCollections] = useState([]);
  const [qualityChecks, setQualityChecks] = useState([]);
  const [labSamples, setLabSamples] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [labAuditLog, setLabAuditLog] = useState([]);
  const [selectedLabSampleId, setSelectedLabSampleId] = useState(null);
  const [selectedLabTestId, setSelectedLabTestId] = useState(null);
  const [activeLabReportSample, setActiveLabReportSample] = useState(null);
  const [labReports, setLabReports] = useState([]);

  // Dispatch & Distributor State
  const [dispatchPackages, setDispatchPackages] = useState([]);
  const [dispatchShipments, setDispatchShipments] = useState([]);
  const [dispatchAuditLog, setDispatchAuditLog] = useState([]);
  const [revokedQrs, setRevokedQrs] = useState([]);
  const [selectedDispatchShipmentId, setSelectedDispatchShipmentId] = useState(null);
  const [selectedDispatchPackageId, setSelectedDispatchPackageId] = useState(null);

  // Field Connectivity States (Supports Offline, Syncing, Normal)
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Detail / Navigation Selection
  const [selectedHiveId, setSelectedHiveId] = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  // Modal / Bottom Sheet
  const [activeSheet, setActiveSheet] = useState(null); // null | 'quick-inspect' | 'create-batch' | 'verify-batch' | 'sensor-sheet' | 'hive-detail'
  const [sheetPayload, setSheetPayload] = useState(null);

  // Success toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Database Gate Health & Connection State (§4, §5, §25)
  const [databaseHealth, setDatabaseHealth] = useState(() => honeyDatabaseGateway.getDatabaseDiagnostics());
  const [databaseConnected, setDatabaseConnected] = useState(true);
  const [dbHydrated, setDbHydrated] = useState(false);

  // Initialize and Hydrate from Database Gateway on Mount
  useEffect(() => {
    let active = true;
    honeyDatabaseGateway.connect().then(() => {
      honeyDatabaseGateway.hydrateInitialDefaults(false);
      if (!active) return;
      setDatabaseHealth(honeyDatabaseGateway.getDatabaseDiagnostics());
      setDatabaseConnected(true);

      const dbApiaries = honeyDatabaseGateway.getTable(TABLE_NAMES.APIARIES);
      if (dbApiaries && dbApiaries.length > 0) {
        setApiaries(dbApiaries);
        setApiary(prev => prev || dbApiaries[0]);
      } else {
        setApiaries([]);
        setApiary(null);
      }

      const dbHives = honeyDatabaseGateway.getTable(TABLE_NAMES.HIVES);
      setHives(dbHives || []);

      const dbFrames = honeyDatabaseGateway.getTable(TABLE_NAMES.FRAMES);
      setFrames(dbFrames || []);

      const dbHarvests = honeyDatabaseGateway.getTable(TABLE_NAMES.HARVEST_RECORDS) || [];
      setHarvestRecords(dbHarvests);

      const dbHandovers = honeyDatabaseGateway.getTable(TABLE_NAMES.HANDOVER_RECORDS) || [];
      // Clean up any handovers that have duplicate IDs or duplicate codes
      const uniqueHandovers = [];
      const seenHandoverKeys = new Set();
      (dbHandovers || []).forEach(h => {
        const key = `${h.traceabilityCode || ''}_${h.handoverCode || h.id}`.toUpperCase().trim();
        if (!seenHandoverKeys.has(key)) {
          seenHandoverKeys.add(key);
          uniqueHandovers.push(h);
        }
      });
      setHandoverRecords(uniqueHandovers);
      if (uniqueHandovers.length !== dbHandovers.length) {
        honeyDatabaseGateway.saveTable(TABLE_NAMES.HANDOVER_RECORDS, uniqueHandovers);
      }

      const dbBatches = honeyDatabaseGateway.getTable(TABLE_NAMES.PROCESSING_BATCHES);
      const realBatches = (dbBatches || []).filter(b => !String(b.id || '').includes('demo'));
      setProcessingBatches(realBatches);
      if (dbBatches && dbBatches.length !== realBatches.length) {
        honeyDatabaseGateway.saveTable(TABLE_NAMES.PROCESSING_BATCHES, realBatches);
      }

      const dbSamples = honeyDatabaseGateway.getTable(TABLE_NAMES.LAB_SAMPLES);
      setLabSamples(dbSamples || []);

      const dbTests = honeyDatabaseGateway.getTable(TABLE_NAMES.LAB_TESTS);
      setLabTests(dbTests || []);

      const dbPackages = honeyDatabaseGateway.getTable(TABLE_NAMES.DISPATCH_PACKAGES);
      const realPackages = (dbPackages || []).filter(p => !String(p.id || '').includes('demo'));
      setDispatchPackages(realPackages);
      if (dbPackages && dbPackages.length !== realPackages.length) {
        honeyDatabaseGateway.saveTable(TABLE_NAMES.DISPATCH_PACKAGES, realPackages);
      }

      const dbShipments = honeyDatabaseGateway.getTable(TABLE_NAMES.DISPATCH_SHIPMENTS);
      setDispatchShipments(dbShipments || []);

      setDbHydrated(true);
    }).catch(err => {
      if (!active) return;
      console.error('[DATABASE BOOT GATE] Connection failed:', err);
      setDatabaseConnected(false);
      setDatabaseHealth({
        connectionHealth: { status: 'UNAVAILABLE', error: err.message, connected: false }
      });
    });

    return () => {
      active = false;
    };
  }, []);

  // Reactive State Persistence Synchronizers (Survives Refresh & Navigation (§25))
  useEffect(() => {
    if (dbHydrated && Array.isArray(harvestRecords)) {
      honeyDatabaseGateway.saveTable(TABLE_NAMES.HARVEST_RECORDS, harvestRecords);
    }
  }, [harvestRecords, dbHydrated]);

  useEffect(() => {
    if (dbHydrated && Array.isArray(handoverRecords)) {
      honeyDatabaseGateway.saveTable(TABLE_NAMES.HANDOVER_RECORDS, handoverRecords);
    }
  }, [handoverRecords, dbHydrated]);

  useEffect(() => {
    if (dbHydrated && Array.isArray(frames)) {
      honeyDatabaseGateway.saveTable(TABLE_NAMES.FRAMES, frames);
    }
  }, [frames, dbHydrated]);

  useEffect(() => {
    if (dbHydrated && Array.isArray(hives)) {
      honeyDatabaseGateway.saveTable(TABLE_NAMES.HIVES, hives);
    }
  }, [hives, dbHydrated]);

  useEffect(() => {
    if (dbHydrated && Array.isArray(apiaries)) {
      honeyDatabaseGateway.saveTable(TABLE_NAMES.APIARIES, apiaries);
    }
  }, [apiaries, dbHydrated]);

  useEffect(() => {
    if (dbHydrated && Array.isArray(processingBatches)) {
      honeyDatabaseGateway.saveTable(TABLE_NAMES.PROCESSING_BATCHES, processingBatches);
    }
  }, [processingBatches, dbHydrated]);

  useEffect(() => {
    if (dbHydrated && Array.isArray(labSamples)) {
      honeyDatabaseGateway.saveTable(TABLE_NAMES.LAB_SAMPLES, labSamples);
    }
  }, [labSamples, dbHydrated]);

  useEffect(() => {
    if (dbHydrated && Array.isArray(labTests)) {
      honeyDatabaseGateway.saveTable(TABLE_NAMES.LAB_TESTS, labTests);
    }
  }, [labTests, dbHydrated]);

  useEffect(() => {
    if (dbHydrated && Array.isArray(dispatchPackages)) {
      honeyDatabaseGateway.saveTable(TABLE_NAMES.DISPATCH_PACKAGES, dispatchPackages);
    }
  }, [dispatchPackages, dbHydrated]);

  useEffect(() => {
    if (dbHydrated && Array.isArray(dispatchShipments)) {
      honeyDatabaseGateway.saveTable(TABLE_NAMES.DISPATCH_SHIPMENTS, dispatchShipments);
    }
  }, [dispatchShipments, dbHydrated]);

  // Canonical Route & Navigation Intent Handler (One User Intent → One Clear Destination)
  const setTab = (tabId) => {
    const route = RouteRegistry.getRoute(tabId);
    if (!route) {
      setActiveTab('home');
      return;
    }
    const effectiveCaps = session?.capabilities?.length
      ? session.capabilities
      : ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'BEE_HEALTH_SCAN', 'HONEY_COLLECTION', 'COLLECTION_BATCH_LINK', 'BATCH_TRACEABILITY'];
    const isAllowed = RouteRegistry.validateRouteAccess(route.id, effectiveCaps);
    if (!isAllowed) {
      setActiveTab(route.id);
      showToast(`Access Restricted: You don't have access to ${route.label}.`);
      return;
    }
    if (route.id !== 'hives') {
      setSelectedHiveId(null);
    }
    setActiveTab(route.id);
    try {
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `#${route.id}`);
      }
    } catch (_) {}
  };

  // Browser Deep Link & Hash Synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash) {
        const route = RouteRegistry.getRoute(hash);
        if (route) {
          const effectiveCaps = session?.capabilities?.length
            ? session.capabilities
            : ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'BEE_HEALTH_SCAN', 'HONEY_COLLECTION', 'COLLECTION_BATCH_LINK', 'BATCH_TRACEABILITY'];
          setActiveTab(route.id);
          if (!RouteRegistry.validateRouteAccess(route.id, effectiveCaps)) {
            showToast(`Access Restricted: You don't have access to ${route.label}.`);
          }
        }
      }
    };
    handleHash();
    window.addEventListener('popstate', handleHash);
    window.addEventListener('hashchange', handleHash);
    return () => {
      window.removeEventListener('popstate', handleHash);
      window.removeEventListener('hashchange', handleHash);
    };
  }, [session?.capabilities]);

  const openSheet = (sheetType, payload = null) => {
    setActiveSheet(sheetType);
    setSheetPayload(payload);
  };

  const closeSheet = () => {
    setActiveSheet(null);
    setSheetPayload(null);
  };

  // Bee Health Scan Modal
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanTargetHiveId, setScanTargetHiveId] = useState(null);

  const openScanModal = (hiveId = null) => {
    setScanTargetHiveId(hiveId);
    setIsScanModalOpen(true);
  };

  const closeScanModal = () => {
    setIsScanModalOpen(false);
    setScanTargetHiveId(null);
  };

  // Screen 19: Inspection Result State
  const [activeInspectionResult, setActiveInspectionResult] = useState(null);

  const openInspectionResult = (payload) => {
    setActiveInspectionResult(payload);
  };

  const closeInspectionResult = () => {
    setActiveInspectionResult(null);
  };

  // Screen 20: Inspection Saved / Hive History Update State
  const [activeInspectionSaved, setActiveInspectionSaved] = useState(null);

  const openInspectionSaved = (payload) => {
    setActiveInspectionSaved(payload);
  };

  const closeInspectionSaved = () => {
    setActiveInspectionSaved(null);
  };

  // Screen 23: Collection Details State
  const [activeCollectionDetails, setActiveCollectionDetails] = useState(null);

  const openCollectionDetails = (payload) => {
    setActiveCollectionDetails(payload);
  };

  const closeCollectionDetails = () => {
    setActiveCollectionDetails(null);
  };

  const updateCollection = (id, updatedFields) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  // Screen 24: Quality Check State
  const [activeQualityCheck, setActiveQualityCheck] = useState(null);

  const openQualityCheck = (payload) => {
    setActiveQualityCheck(payload);
  };

  const closeQualityCheck = () => {
    setActiveQualityCheck(null);
  };

  const updateQualityCheck = (id, updatedFields) => {
    setQualityChecks((prev) =>
      prev.map((qc) => (qc.id === id ? { ...qc, ...updatedFields } : qc))
    );
  };

  const completeQualityDecision = (qcId, decision, reviewerNotes = '') => {
    setQualityChecks((prev) =>
      prev.map((qc) => {
        if (qc.id !== qcId) return qc;
        const newStatus = decision === 'PASSED' ? 'passed' : decision === 'NEEDS_ATTENTION' ? 'needs_attention' : 'failed';
        const newStatusLabel = decision === 'PASSED' ? 'Quality check passed' : decision === 'NEEDS_ATTENTION' ? 'Quality needs attention' : 'Quality check did not pass';
        return {
          ...qc,
          status: newStatus,
          statusLabel: newStatusLabel,
          review: {
            reviewerName: 'You (Certified Quality Lead)',
            reviewedAt: 'Today, Just now',
            decision,
            notes: reviewerNotes
          },
          blockchain: {
            ...qc.blockchain,
            ledgerStatus: decision === 'PASSED' ? 'Secured to HoneyChain Ledger' : 'On hold / Pending resolution',
            blockNumber: decision === 'PASSED' ? 54819240 : null
          }
        };
      })
    );

    const targetQc = qualityChecks.find((q) => q.id === qcId);
    if (targetQc && decision === 'PASSED') {
      setBatches((prev) =>
        prev.map((b) => {
          if (b.id === targetQc.batchId) {
            const hasQualityJourney = b.journey.some((j) => j.stage.includes('Quality') || j.stage.includes('Purity'));
            const updatedJourney = hasQualityJourney
              ? b.journey
              : [
                  ...b.journey,
                  {
                    stage: 'Quality & Purity Testing',
                    title: 'Certified Quality Passed',
                    location: 'BioAgro Analysis Lab',
                    date: 'Today, Just now',
                    handler: 'Elena Vance / Lead Quality Analyst',
                    details: 'Moisture 17.8%, HMF 12.4 mg/kg, Diastase 14.8 DN verified. Meets raw honey standard.'
                  }
                ];
            return {
              ...b,
              status: 'bottled',
              statusLabel: 'Quality Passed (Packaging)',
              journey: updatedJourney
            };
          }
          return b;
        })
      );
    }
  };

  // Screen 25: Honey Journey / Batch Traceability State
  const [activeBatchJourney, setActiveBatchJourney] = useState(null);

  const openBatchJourney = (payload) => {
    setActiveBatchJourney(payload);
  };

  const closeBatchJourney = () => {
    setActiveBatchJourney(null);
  };

  // Screen 26: Verification State
  const [activeVerification, setActiveVerification] = useState(null);

  const openVerification = (payload) => {
    setActiveVerification(payload);
  };

  const closeVerification = () => {
    setActiveVerification(null);
  };

  // Screen 27: Technical Proof State
  const [activeTechnicalProof, setActiveTechnicalProof] = useState(null);

  const openTechnicalProof = (payload) => {
    setActiveTechnicalProof(payload);
  };

  const closeTechnicalProof = () => {
    setActiveTechnicalProof(null);
  };

  // Screen 28: Public Verification / Consumer Traceability State (sync initialized from URL if QR scanned)
  const [activePublicVerification, setActivePublicVerification] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const verifyParam = urlParams.get('verify') || urlParams.get('publicRef') || urlParams.get('b') || urlParams.get('ref') || urlParams.get('packageId');
      if (verifyParam) {
        return verifyParam === 'true' ? 'HC-2409' : verifyParam;
      }
      const pathname = window.location.pathname;
      if (pathname.startsWith('/verify/') || pathname.startsWith('/b/')) {
        const pathRef = pathname.split('/')[2];
        if (pathRef) return decodeURIComponent(pathRef);
      }
    } catch (e) {}
    return null;
  });

  useEffect(() => {
    const handleUrlCheck = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const verifyParam = urlParams.get('verify') || urlParams.get('publicRef') || urlParams.get('b') || urlParams.get('ref') || urlParams.get('packageId');
        if (verifyParam) {
          setActivePublicVerification(verifyParam === 'true' ? 'HC-2409' : verifyParam);
        }
      } catch (e) {}
    };

    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, []);

  const openPublicVerification = (payload) => {
    setActivePublicVerification(payload || 'HC-2409');
  };

  const closePublicVerification = () => {
    setActivePublicVerification(null);
    if (currentScreen === 'splash') {
      setCurrentScreen(session?.isAuthenticated ? 'home' : 'welcome');
    }
  };

  // Screen 29: Product Verification Scanner (QR Scan to Verify)
  const [activeProductScanner, setActiveProductScanner] = useState(false);

  const openProductScanner = () => {
    setActiveProductScanner(true);
  };

  const closeProductScanner = () => {
    setActiveProductScanner(false);
  };

  // Screen 30: Product / Package QR Management State (§ 3)
  const [activeProductQrManagement, setActiveProductQrManagement] = useState(null);

  const openProductQrManagement = (payload) => {
    setActiveProductQrManagement(payload || { batchId: 'batch-hc-2409' });
  };

  const closeProductQrManagement = () => {
    setActiveProductQrManagement(null);
  };

  // Screen 31: Product Packaging / Label Generation State (§ 3)
  const [activeProductPackaging, setActiveProductPackaging] = useState(null);

  const openProductPackaging = (payload) => {
    setActiveProductPackaging(payload || { batchId: 'batch-hc-2409', packageId: 'PKG-0042' });
  };

  const closeProductPackaging = () => {
    setActiveProductPackaging(null);
  };

  useEffect(() => {
    window.__openProductQrManagement = openProductQrManagement;
    window.__closeProductQrManagement = closeProductQrManagement;
    window.__openProductPackaging = openProductPackaging;
    window.__closeProductPackaging = closeProductPackaging;
    return () => {
      delete window.__openProductPackaging;
      delete window.__closeProductPackaging;
    };
  }, []);

  const verifyBatch = (batchId, verificationData = {}) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        const verifiedAt = verificationData.verifiedAt || 'Today · 13:45 UTC';
        const verifierName = verificationData.verifierName || 'Elena Vance (Lead Quality Inspector)';
        const verificationLotId = verificationData.verificationLotId || 'Lot HC-2409-P01';

        const updatedJourney = b.journey.some((j) => j.stage === 'Verification' || j.title === 'Batch Verified & Sealed')
          ? b.journey
          : [
              ...b.journey,
              {
                stage: 'Verification',
                title: 'Batch Verified & Sealed',
                location: 'HoneyChain Trust Network',
                date: verifiedAt,
                handler: verifierName,
                details: `All workflow prerequisites completed. Cryptographically anchored to block #54819240. ${verificationLotId}`
              }
            ];

        return {
          ...b,
          status: 'certified',
          statusLabel: 'Tested & Certified',
          verification: {
            isVerified: true,
            verifiedAt,
            verifierName,
            verificationLotId,
            certificateId: 'CERT-HC-2026-0925-V1',
            blockNumber: 54819240,
            txHash: '0xd942b87f619e083a21dc49019b841e2a537f',
            merkleRoot: '0x3f9801a4e5bc1209e86d23fb482b9a710255'
          },
          journey: updatedJourney
        };
      })
    );
  };

  useEffect(() => {


    window.__openInspectionResult = openInspectionResult;
    window.__openInspectionSaved = openInspectionSaved;
    window.__openCreateBatch = (payload) => openSheet('create-batch', payload);
    window.__openCollectionDetails = (payload) => openCollectionDetails(payload);
    window.__openQualityCheck = (payload) => openQualityCheck(payload);
    window.__openBatchJourney = (payload) => openBatchJourney(payload);
    window.__openVerification = (payload) => openVerification(payload);
    window.__openTechnicalProof = (payload) => openTechnicalProof(payload);
    window.__openPublicVerification = (payload) => openPublicVerification(payload);
    window.__closePublicVerification = () => closePublicVerification();
    window.__openProductScanner = () => openProductScanner();
    window.__closeProductScanner = () => closeProductScanner();
    window.__openProductQrManagement = (payload) => openProductQrManagement(payload);
    window.__closeProductQrManagement = () => closeProductQrManagement();
  }, []);

  // Add a new inspection log
  const logInspection = ({
    hiveId,
    temperament,
    broodPattern,
    queenSeen,
    notes,
    weightKg
  }) => {
    const hive = hives.find((h) => h.id === hiveId);
    if (!hive) return;

    const newActivity = {
      id: `act-${Date.now()}`,
      timestamp: "Just now",
      title: `Field Inspection — ${hive.name}`,
      description: `${temperament} temper • Queen ${queenSeen ? 'sighted' : 'unseen'} • ${notes || 'Colony looking sound.'}`,
      type: "inspection",
      badge: "Field Log"
    };

    setActivities((prev) => [newActivity, ...prev]);

    setHives((prev) =>
      prev.map((h) => {
        if (h.id === hiveId) {
          return {
            ...h,
            temperament: temperament || h.temperament,
            broodPattern: broodPattern || h.broodPattern,
            queenStatus: queenSeen ? "Queen sighted & active" : h.queenStatus,
            lastInspected: "Just now",
            weight: weightKg ? parseFloat(weightKg) : h.weight,
            status: temperament === "Defensive" ? "attention" : "healthy",
            statusText: temperament === "Defensive" ? "High defensive activity" : "Healthy & calm"
          };
        }
        return h;
      })
    );

    if (!isOnline) {
      setPendingSyncCount((c) => c + 1);
      showToast("Saved offline • Will anchor when connected");
    } else {
      showToast("Inspection recorded & verified");
    }

    closeSheet();
  };

  // Create a new honey batch (Screen 22)
  const createBatch = ({
    name,
    sourceHives,
    sourceHiveIds,
    collectionId,
    collectionDate,
    honeyType,
    notes,
    weightKg,
    moisture,
    lotJarsCount,
    jarVolume,
    shouldCloseSheet = false
  }) => {
    const nextIdx = batches.length + 1;
    const batchNumber = `HB-2026-${String(nextIdx + 8).padStart(2, '0')}`;
    const displayId = `Batch HC-24${String(nextIdx + 8).padStart(2, '0')}`;
    const formattedDate = collectionDate || new Date().toISOString().split('T')[0];
    const sourceList = sourceHives && sourceHives.length ? sourceHives : ["Hive 01"];

    const newBatch = {
      id: `batch-${Date.now()}`,
      batchNumber,
      displayId,
      name: name || `${honeyType || 'Wildflower'} Harvest · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
      sourceHives: sourceList,
      sourceHiveIds: sourceHiveIds || [],
      collectionId: collectionId || null,
      harvestDate: formattedDate,
      honeyType: honeyType || "Wildflower",
      collectionNotes: notes || "",
      weightKg: parseFloat(weightKg) || 18.5,
      status: "collected", // Section 34: Initial state is 'collected'
      statusLabel: "Harvest Collected",
      moisture: parseFloat(moisture) || 17.2,
      moistureStandard: "< 18.5% (Good)",
      hmfLevel: "2.8 mg/kg",
      diastase: "16.4 DN",
      pollenAnalysis: honeyType ? `${honeyType} botanical profile` : "Native Flora blend (Apiary perimeter)",
      lotJarsCount: parseInt(lotJarsCount, 10) || Math.round((parseFloat(weightKg) || 18.5) * 2),
      jarVolume: jarVolume || "500g Glass",
      sealHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
      blockchain: {
        network: "HoneyChain Ledger (Draft Anchor)",
        blockNumber: 54819300 + batches.length,
        blockTime: "Pending settling confirmation",
        merkleRoot: "0xpending...",
        txHash: `0x${Math.random().toString(16).substring(2, 34)}`,
        verificationUrl: `https://verify.honeychain.org/b/${batchNumber}`
      },
      journey: [
        {
          stage: "Apiary Harvest",
          title: "Cold Frame Harvesting",
          location: apiary?.name || "Meadowbrook Apiary",
          date: formattedDate,
          handler: apiary?.operator || "Beekeeper",
          details: `Harvested from ${sourceList.join(', ')}. Net yield ${weightKg || '18.5'} kg. ${notes ? notes : ''}`
        }
      ]
    };

    setBatches((prev) => [newBatch, ...prev]);

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: "Just now",
        title: `Harvest Batch Created — ${newBatch.batchNumber}`,
        description: `${newBatch.weightKg} kg ${newBatch.honeyType} logged from ${newBatch.sourceHives.join(', ')}.`,
        type: "honey",
        badge: "Harvest"
      },
      ...prev
    ]);

    if (!isOnline) {
      setPendingSyncCount((c) => c + 1);
      showToast("Batch saved locally • Offline queue active");
    } else {
      showToast(`Batch ${newBatch.batchNumber} created successfully`);
    }

    if (shouldCloseSheet) {
      closeSheet();
    }

    return newBatch;
  };

  // Add a new hive to colonies
  const addHive = ({
    name,
    code,
    location,
    type = 'Langstroth',
    notes,
    hasDevice,
    apiaryCode,
    apiaryId,
    frameCount = 10,
    honeyType = 'Wildflower',
    batchId = 'none',
    inspectionInterval = 7
  }) => {
    const nextNum = hives.length + 1;
    let cleanCode = code ? String(code).trim().toUpperCase() : String(nextNum);
    if (!cleanCode.startsWith('H')) {
      cleanCode = `H${cleanCode.padStart(3, '0')}`;
    }
    if (!validateHiveCode(cleanCode)) {
      const err = `Invalid hive code: ${cleanCode}. Format must be H<number>, e.g. H001, H002.`;
      showToast(err);
      return { success: false, error: err };
    }
    const hiveName = (name && name.trim()) ? name.trim() : `Hive ${cleanCode}`;
    // Duplicate check
    const isDup = hives.some(h => !h.isArchived && ((h.code && `H${String(h.code).padStart(3, '0')}` === cleanCode) || h.code === cleanCode));
    if (isDup) {
      const err = `Duplicate hive code: Colony ${cleanCode} already exists.`;
      showToast(err);
      return { success: false, error: err };
    }

    const assignedApiaryCode = apiaryCode || 'AP1';
    const targetApiary = apiaries.find(a => a.apiaryCode === assignedApiaryCode);
    if (targetApiary && targetApiary.status === 'inactive') {
      const err = `Cannot add hive to inactive apiary ${assignedApiaryCode}.`;
      showToast(err);
      return { success: false, error: err };
    }

    const targetApiaryId = apiaryId || targetApiary?.id || 'apiary-01';
    const parsedFrameCount = Math.max(1, Math.min(30, Number(frameCount) || 10));
    const intervalDays = Math.max(1, Math.min(90, Number(inspectionInterval) || 7));
    const nowIso = new Date().toISOString();

    // Check batch mapping
    let mappedBatch = null;
    if (batchId && batchId !== 'none') {
      mappedBatch = hiveManagementBatches.find(b => b.id === batchId);
    }

    const hiveId = `hive-${Date.now()}`;

    const newHive = {
      id: hiveId,
      code: cleanCode.replace(/^H/, ''),
      name: hiveName,
      batchId: mappedBatch ? mappedBatch.id : null,
      batchName: mappedBatch ? mappedBatch.name : null,
      location: location || targetApiary?.name || apiary?.name || 'Meadowbrook Apiary',
      apiaryCode: assignedApiaryCode,
      apiaryId: targetApiaryId,
      type: type || 'Langstroth',
      breed: 'Italian (Apis mellifera ligustica)',
      status: 'healthy',
      statusText: 'Conditions look stable.',
      conditionSummary: 'Conditions look stable.',
      temperament: 'Calm',
      queenStatus: 'New colony registered',
      broodPattern: 'Pending first inspection',
      weight: 38.5,
      weightDelta: '+0.0 kg',
      temp: hasDevice ? 29.2 : null,
      humidity: hasDevice ? 58 : null,
      vibrationText: hasDevice ? 'Activity appears stable' : null,
      lastUpdate: hasDevice ? 'Just now' : null,
      lastInspected: 'No inspection recorded',
      inspectionIntervalDays: intervalDays,
      inspectionImage: null,
      monitoring: {
        enabled: Boolean(hasDevice),
        isDeviceOnline: Boolean(hasDevice),
        lastUpdate: hasDevice ? 'Just now' : null
      },
      notes: notes || '',
      superFramesCapped: 0,
      superFramesTotal: parsedFrameCount,
      linkedHoneyBatches: [],
      isArchived: false,
      esp32: hasDevice ? {
        deviceId: `ESP32-MB-${cleanCode}`,
        firmware: 'v2.4.3-prod',
        protocol: 'BLE Mesh / MQTT-SN',
        rssi: '-62 dBm (Good)',
        battery: 98,
        lastTelemetry: 'Just now',
        macAddress: `70:B8:F6:9A:12:${cleanCode}`
      } : null
    };

    // Auto-generate frames for this hive
    const createdFrames = [];
    for (let f = 1; f <= parsedFrameCount; f++) {
      const cleanFrame = `F${f}`;
      const traceabilityCode = generateTraceabilityCode(assignedApiaryCode, cleanCode, cleanFrame);
      createdFrames.push({
        id: `frame-${Date.now()}-${f}`,
        frameNumber: cleanFrame,
        hiveId: newHive.id,
        hiveCode: cleanCode,
        apiaryId: targetApiaryId,
        apiaryCode: assignedApiaryCode,
        traceabilityCode,
        status: FRAME_STATUSES.ACTIVE,
        statusLabel: FRAME_STATUS_LABELS.ACTIVE,
        registeredAt: nowIso,
        placedAt: nowIso,
        lastInspectedAt: 'Just now',
        honeyType: honeyType || 'Wildflower',
        cappedPercentage: 10,
        observationsCount: 1,
        healthCondition: 'Placed in hive box',
        notes: notes || '',
        history: [
          { timestamp: 'Just now', event: 'FRAME_REGISTERED', details: `Frame registered with unique ID ${traceabilityCode}` },
          { timestamp: 'Just now', event: 'FRAME_PLACED', details: `Placed in Hive ${cleanCode} position ${cleanFrame}` }
        ]
      });
    }

    setHives((prev) => [newHive, ...prev]);

    if (createdFrames.length > 0) {
      setFrames((prev) => [...createdFrames, ...prev]);
    }

    // If mapped to a batch, append membership to the batch
    if (mappedBatch) {
      const newMember = {
        hiveId: newHive.id,
        cycleStatus: HIVE_CYCLE_STATUS.ACTIVE,
        inspectionIntervalDays: mappedBatch.inspectionIntervalDays || 7,
        joinedAt: nowIso
      };
      setHiveManagementBatches((prev) =>
        prev.map((b) => {
          if (b.id === mappedBatch.id) {
            const updatedMemberships = [...(b.memberships || []), newMember];
            return {
              ...b,
              memberships: updatedMemberships,
              hiveCount: updatedMemberships.length,
              totalFrames: (b.totalFrames || 0) + parsedFrameCount,
              status: deriveHiveManagementBatchStatus(updatedMemberships)
            };
          }
          return b;
        })
      );
    }

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        title: `Colony Added — ${newHive.name}`,
        description: `${newHive.type} (${parsedFrameCount} frames) registered at ${newHive.location}${mappedBatch ? ` in ${mappedBatch.name}` : ''}.`,
        type: 'inspection',
        badge: mappedBatch ? 'Batch Colony' : 'New Colony'
      },
      ...prev
    ]);

    if (!isOnline) {
      setPendingSyncCount((c) => c + 1);
      showToast(`Hive ${newHive.name} saved offline`);
    } else {
      showToast(`Hive ${newHive.name} added to your colonies`);
    }

    closeSheet();
    return { success: true, hive: newHive };
  };

  // Archive a hive safely without breaking honey traceability
  const archiveHive = (hiveId) => {
    const hive = hives.find((h) => h.id === hiveId);
    setHives((prev) =>
      prev.map((h) => (h.id === hiveId ? { ...h, isArchived: true } : h))
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        title: `Hive Archived — ${hive?.name || 'Colony'}`,
        description: 'Colony archived. Historical records and honey traceability retained.',
        type: 'inspection',
        badge: 'Archived'
      },
      ...prev
    ]);

    showToast(`Hive archived • History preserved for traceability`);
    if (selectedHiveId === hiveId) {
      setSelectedHiveId(null);
    }
  };

  // Permanently trash / delete a hive
  const deleteHive = (hiveId) => {
    const hive = hives.find((h) => h.id === hiveId || h.code === hiveId);
    const updatedHives = hives.filter((h) => h.id !== hiveId && h.code !== hiveId);
    setHives(updatedHives);
    setFrames((prev) => prev.filter((f) => f.hiveId !== hiveId));

    if (honeyDatabaseGateway) {
      honeyDatabaseGateway.saveTable(TABLE_NAMES.HIVES, updatedHives);
    }

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        title: `Hive Trashed — ${hive?.name || 'Colony'}`,
        description: `Hive ${hive?.code || hiveId} was permanently deleted from apiary.`,
        type: 'inspection',
        badge: 'Deleted'
      },
      ...prev
    ]);

    showToast(`Hive '${hive?.name || hiveId}' trashed successfully`);
    if (selectedHiveId === hiveId) {
      setSelectedHiveId(null);
    }
    return { success: true };
  };

  const trashHive = deleteHive;

  // Record field observation
  const recordObservation = ({ hiveId, text }) => {
    const hive = hives.find((h) => h.id === hiveId);
    if (!hive) return;

    setHives((prev) =>
      prev.map((h) => {
        if (h.id === hiveId) {
          return {
            ...h,
            lastObservation: text,
            conditionSummary: text,
            lastUpdate: 'Just now',
            observations: [
              {
                id: `obs-${Date.now()}`,
                timestamp: 'Just now',
                author: apiary?.operator || 'Sarah L.',
                text: text,
                category: 'Field note'
              },
              ...(h.observations || [])
            ]
          };
        }
        return h;
      })
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        title: `Observation Logged — ${hive.name}`,
        description: text,
        type: 'inspection',
        badge: 'Observation'
      },
      ...prev
    ]);

    const cleanHiveCode = hive.code ? (String(hive.code).startsWith('H') ? hive.code : `H${String(hive.code).padStart(3, '0')}`) : 'H001';
    setHiveHistoryEvents((prev) => [
      {
        id: `hist-${Date.now()}`,
        hiveCode: cleanHiveCode,
        apiaryCode: hive.apiaryCode || 'AP1',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        eventType: 'OBSERVATION_RECORDED',
        title: `Field Note — ${hive.name}`,
        summary: text,
        author: session?.name || apiary?.operator || 'Sarah Lindqvist',
        evidence: null,
        metadata: { hiveId: hive.id, hiveCode: cleanHiveCode }
      },
      ...prev
    ]);

    showToast(`Observation recorded for ${hive.name}`);
    closeSheet();
  };

  // ─────────────────────────────────────────────────────────
  // BEEKEEPER MASTER MODULE DOMAIN OPERATIONS
  // ─────────────────────────────────────────────────────────

  const createHiveManagementBatch = (input) => {
    try {
      const selectedHives = (input.hiveIds || []).map(id => hives.find(hive => hive.id === id));
      if (selectedHives.some(hive => !hive || hive.isArchived)) {
        throw new Error('Each selected hive must exist and be active.');
      }
      if (input.apiaryId && selectedHives.some(hive => hive.apiaryId && hive.apiaryId !== input.apiaryId)) {
        throw new Error('All selected hives must belong to the selected apiary.');
      }
      const targetApiaryId = input.apiaryId || selectedHives[0]?.apiaryId || apiary?.id || apiaries[0]?.id || 'apiary-01';
      const targetApiaryCode = input.apiaryCode || selectedHives[0]?.apiaryCode || apiary?.apiaryCode || apiaries[0]?.apiaryCode || 'AP1';
      const batch = buildHiveManagementBatch({ ...input, apiaryId: targetApiaryId, apiaryCode: targetApiaryCode, actor: session?.name || 'Beekeeper' }, hiveManagementBatches);
      setHiveManagementBatches(previous => [batch, ...previous]);
      showToast(`Hive batch ${batch.name} created.`);
      return { success: true, batch };
    } catch (error) {
      showToast(error.message);
      return { success: false, error: error.message };
    }
  };

  const createBatchWithHivesAndFrames = ({
    name,
    hiveCount = 1,
    framesPerHive = 10,
    hiveType = 'Langstroth',
    honeyType = 'Wildflower',
    inspectionIntervalDays = 7,
    notes = '',
    selectedExistingHiveIds = []
  }) => {
    try {
      if (!name || !name.trim()) {
        throw new Error('Batch name is required.');
      }
      const count = Math.max(1, Math.min(50, Number(hiveCount) || 1));
      const frameCount = Math.max(1, Math.min(30, Number(framesPerHive) || 10));
      const interval = Math.max(1, Math.min(90, Number(inspectionIntervalDays) || 7));

      const targetApiary = apiary || apiaries[0] || { id: 'apiary-01', apiaryCode: 'AP1', name: 'Main Apiary' };
      const apiaryCode = targetApiary.apiaryCode || 'AP1';
      const apiaryId = targetApiary.id || 'apiary-01';

      // Find valid selected existing hives
      const validExistingHives = (selectedExistingHiveIds || [])
        .map(id => hives.find(h => h.id === id && !h.isArchived))
        .filter(Boolean);

      const existingCount = validExistingHives.length;
      const hivesNeeded = Math.max(0, count - existingCount);

      const newHives = [];
      const newFrames = [];
      const nowIso = new Date().toISOString();
      const batchId = `bk-batch-${Date.now()}`;

      // Calculate existing numerical codes to avoid collision
      const usedCodes = new Set(
        hives.map(h => {
          const match = String(h.code || '').match(/\d+/);
          return match ? parseInt(match[0], 10) : 0;
        })
      );

      let nextNum = 1;
      for (let i = 0; i < hivesNeeded; i++) {
        while (usedCodes.has(nextNum)) {
          nextNum++;
        }
        usedCodes.add(nextNum);

        const cleanCode = `H${String(nextNum).padStart(3, '0')}`;
        const hiveId = `hive-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;
        const hiveName = `${name.trim()} — Box ${i + 1}`;

        const newHive = {
          id: hiveId,
          code: cleanCode.replace(/^H/, ''),
          name: hiveName,
          batchId,
          batchName: name.trim(),
          location: targetApiary.name || 'Main Apiary',
          apiaryCode,
          apiaryId,
          type: hiveType || 'Langstroth',
          breed: 'Italian (Apis mellifera ligustica)',
          status: 'healthy',
          statusText: 'Conditions look stable.',
          conditionSummary: 'Conditions look stable.',
          temperament: 'Calm',
          queenStatus: 'Active colony registered in batch',
          broodPattern: 'Pending first inspection',
          weight: 38.5,
          weightDelta: '+0.0 kg',
          temp: null,
          humidity: null,
          vibrationText: null,
          lastUpdate: null,
          lastInspected: 'No inspection recorded',
          inspectionImage: null,
          monitoring: {
            enabled: false,
            isDeviceOnline: false,
            lastUpdate: null
          },
          notes: notes || '',
          superFramesCapped: 0,
          superFramesTotal: frameCount,
          linkedHoneyBatches: [],
          isArchived: false,
          esp32: null
        };
        newHives.push(newHive);

        // Generate frames for this new hive
        for (let f = 1; f <= frameCount; f++) {
          const cleanFrame = `F${f}`;
          const traceabilityCode = generateTraceabilityCode(apiaryCode, cleanCode, cleanFrame);
          newFrames.push({
            id: `frame-${Date.now()}-${i}-${f}`,
            frameNumber: cleanFrame,
            hiveId,
            hiveCode: cleanCode,
            apiaryId,
            apiaryCode,
            traceabilityCode,
            status: FRAME_STATUSES.ACTIVE,
            statusLabel: FRAME_STATUS_LABELS.ACTIVE,
            registeredAt: nowIso,
            placedAt: nowIso,
            lastInspectedAt: 'Just now',
            honeyType: honeyType || 'Wildflower',
            cappedPercentage: 10,
            observationsCount: 1,
            healthCondition: 'Placed in hive batch',
            notes: `Batch ${name.trim()} comb frame`,
            history: [
              { timestamp: 'Just now', event: 'FRAME_REGISTERED', details: `Frame registered in batch ${name.trim()} with unique code ${traceabilityCode}` },
              { timestamp: 'Just now', event: 'FRAME_PLACED', details: `Placed in Hive ${cleanCode} position ${cleanFrame}` }
            ]
          });
        }
      }

      // Combine existing and new hive IDs
      const allBatchHiveIds = [...validExistingHives.map(h => h.id), ...newHives.map(h => h.id)];

      if (allBatchHiveIds.length === 0) {
        throw new Error('At least one hive must be included in the batch.');
      }

      const memberships = allBatchHiveIds.map(hId => ({
        hiveId: hId,
        cycleStatus: HIVE_CYCLE_STATUS.ACTIVE,
        inspectionIntervalDays: interval,
        joinedAt: nowIso
      }));

      const newBatch = {
        id: batchId,
        kind: 'BEEKEEPER_HIVE_MANAGEMENT_BATCH',
        name: name.trim(),
        apiaryId,
        apiaryCode,
        startDate: nowIso.slice(0, 10),
        inspectionIntervalDays: interval,
        notes: notes.trim(),
        hiveType,
        honeyType,
        hiveCount: allBatchHiveIds.length,
        framesPerHive: frameCount,
        totalFrames: allBatchHiveIds.length * frameCount,
        memberships,
        status: deriveHiveManagementBatchStatus(memberships),
        activityLog: [{
          id: `batch-log-${Date.now()}`,
          at: nowIso,
          actor: session?.name || 'Beekeeper',
          eventType: 'BATCH_CREATED',
          status: HIVE_BATCH_STATUS.ACTIVE,
          details: `Batch initialized with ${allBatchHiveIds.length} hives and ${newFrames.length} frames.`
        }]
      };

      // Atomic updates
      if (newHives.length > 0) {
        setHives(prev => [...newHives, ...prev]);
      }
      if (newFrames.length > 0) {
        setFrames(prev => [...newFrames, ...prev]);
      }
      setHiveManagementBatches(prev => [newBatch, ...prev]);

      setActivities(prev => [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          title: `Hive Batch Created — ${newBatch.name}`,
          description: `${allBatchHiveIds.length} colonies provisioned with ${newFrames.length} traceable frames.`,
          type: 'inspection',
          badge: 'Batch Cycle'
        },
        ...prev
      ]);

      showToast(`Batch "${newBatch.name}" created (${allBatchHiveIds.length} hives, ${newFrames.length} frames).`);
      return {
        success: true,
        batch: newBatch,
        hivesCreated: newHives.length,
        framesCreated: newFrames.length
      };
    } catch (err) {
      showToast(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateHiveBatchMember = (batchId, hiveId, changes) => {
    const batch = hiveManagementBatches.find(item => item.id === batchId);
    if (!batch) return { success: false, error: 'Hive batch not found.' };
    const member = batch.memberships.find(item => item.hiveId === hiveId);
    if (!member) return { success: false, error: 'Hive is not in this batch.' };
    const updatedMemberships = batch.memberships.map(item => item.hiveId === hiveId ? { ...item, ...changes } : item);
    const status = deriveHiveManagementBatchStatus(updatedMemberships);
    const event = { id: `batch-log-${Date.now()}`, at: new Date().toISOString(), actor: session?.name || 'Beekeeper', eventType: 'HIVE_MEMBER_UPDATED', hiveId, status };
    setHiveManagementBatches(previous => previous.map(item => item.id === batchId ? { ...item, memberships: updatedMemberships, status, activityLog: [event, ...(item.activityLog || [])] } : item));
    return { success: true, status };
  };

  const getHiveInspectionSchedule = (batchId, hiveId) => {
    const batch = hiveManagementBatches.find(item => item.id === batchId);
    const member = batch?.memberships?.find(item => item.hiveId === hiveId);
    const hive = hives.find(item => item.id === hiveId);
    if (!batch || !member || !hive) return null;
    return getInspectionSchedule({ lastInspectionAt: hive.lastInspectionAt, intervalDays: member.inspectionIntervalDays || batch.inspectionIntervalDays });
  };

  // 1. Register Frame (Guided workflow with collision prevention)
  const registerFrame = ({ apiaryCode, hiveCode, frameNumber, honeyType, notes }) => {
    const cleanApiary = String(apiaryCode || 'AP1').toUpperCase().trim();
    if (!validateApiaryCode(cleanApiary)) {
      const err = `Invalid apiary code: ${cleanApiary}. Must follow AP<number> format.`;
      showToast(err);
      return { success: false, error: err };
    }
    const targetApiary = apiaries.find(a => a.apiaryCode === cleanApiary);
    if (!targetApiary || targetApiary.status === 'inactive') {
      const err = `Apiary ${cleanApiary} does not exist or is inactive.`;
      showToast(err);
      return { success: false, error: err };
    }

    let cleanHive = String(hiveCode || 'H001').toUpperCase().trim();
    if (!cleanHive.startsWith('H')) cleanHive = `H${cleanHive.padStart(3, '0')}`;
    if (!validateHiveCode(cleanHive)) {
      const err = `Invalid hive code: ${cleanHive}. Must follow H<number> format.`;
      showToast(err);
      return { success: false, error: err };
    }
    const targetHive = hives.find(h => !h.isArchived && ((h.code && `H${String(h.code).padStart(3, '0')}` === cleanHive) || h.id === cleanHive || h.code === cleanHive));
    if (!targetHive) {
      const err = `Hive ${cleanHive} does not exist or is archived.`;
      showToast(err);
      return { success: false, error: err };
    }

    if (!validateFrameNumber(frameNumber)) {
      const err = `Invalid frame number: ${frameNumber}. Must be a valid positive integer between 1 and 100.`;
      showToast(err);
      return { success: false, error: err };
    }
    let cleanFrame = String(frameNumber || '1').toUpperCase().trim();
    if (!cleanFrame.startsWith('F')) cleanFrame = `F${cleanFrame}`;

    const traceabilityCode = generateTraceabilityCode(cleanApiary, cleanHive, cleanFrame);

    if (!validateTraceabilityCode(traceabilityCode)) {
      const err = `Malformed traceability code: ${traceabilityCode}`;
      showToast(err);
      return { success: false, error: err };
    }

    // Collision Check: UNIQUE(traceability_code)
    if (!isCodeUnique(traceabilityCode, frames)) {
      const err = `Duplicate Traceability Identity: ${traceabilityCode} is already registered.`;
      showToast(err);
      return { success: false, error: err };
    }

    const newFrame = {
      id: `frame-${Date.now()}`,
      frameNumber: cleanFrame,
      hiveId: hives.find(h => (h.code && `H${String(h.code).padStart(3, '0')}` === cleanHive) || h.id === cleanHive)?.id || 'hive-01',
      hiveCode: cleanHive,
      apiaryId: apiaries.find(a => a.apiaryCode === cleanApiary)?.id || 'apiary-01',
      apiaryCode: cleanApiary,
      traceabilityCode,
      status: FRAME_STATUSES.ACTIVE,
      statusLabel: FRAME_STATUS_LABELS.ACTIVE,
      registeredAt: new Date().toISOString(),
      placedAt: new Date().toISOString(),
      lastInspectedAt: 'Just now',
      honeyType: honeyType || 'Wildflower',
      cappedPercentage: 10,
      observationsCount: 1,
      healthCondition: 'Newly placed in hive',
      notes: notes || '',
      history: [
        { timestamp: 'Just now', event: 'FRAME_REGISTERED', details: `Frame registered and assigned unique ID ${traceabilityCode}` },
        { timestamp: 'Just now', event: 'FRAME_PLACED', details: `Placed in Hive ${cleanHive} position ${cleanFrame}` }
      ]
    };

    setFrames(prev => [newFrame, ...prev]);

    // Append to Digital Field Notebook (Hive History)
    const newHistEvent = {
      id: `hist-${Date.now()}`,
      hiveCode: cleanHive,
      apiaryCode: cleanApiary,
      traceabilityCode,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eventType: 'FRAME_REGISTERED',
      title: 'Frame registered & placed',
      summary: `Frame ${cleanFrame} registered with unique identity ${traceabilityCode} and placed in hive super.`,
      author: session?.name || 'Sarah Lindqvist',
      evidence: null,
      metadata: { frame: cleanFrame, code: traceabilityCode }
    };

    setHiveHistoryEvents(prev => [newHistEvent, ...prev]);

    // Update hive super frames count
    setHives(prev => prev.map(h => {
      const match = (h.code && `H${String(h.code).padStart(3, '0')}` === cleanHive);
      if (match) {
        return { ...h, superFramesTotal: (h.superFramesTotal || 10) + 1 };
      }
      return h;
    }));

    return { success: true, frame: newFrame };
  };

  // 2. Update Frame Status with State Machine Validation
  const updateFrameStatus = (frameId, newStatus) => {
    const target = frames.find(f => f.id === frameId || f.traceabilityCode === frameId);
    if (!target) return false;

    if (!canTransitionFrame(target.status, newStatus)) {
      showToast(`Invalid transition from ${target.status} to ${newStatus}`);
      return false;
    }

    setFrames(prev => prev.map(f => {
      if (f.id === target.id) {
        return {
          ...f,
          status: newStatus,
          statusLabel: FRAME_STATUS_LABELS[newStatus] || newStatus,
          history: [
            { timestamp: 'Just now', event: `STATUS_${newStatus}`, details: `State transitioned to ${newStatus}` },
            ...(f.history || [])
          ]
        };
      }
      return f;
    }));
    return true;
  };

  // 3. Record Frame Health Scan / Inspection
  const recordFrameInspection = ({
    frame,
    traceabilityCode,
    hiveCode,
    apiaryCode,
    result,
    finding,
    condition,
    confidence,
    severity,
    image,
    observation,
    actionTaken
  }) => {
    const code = traceabilityCode || frame?.traceabilityCode;
    const hCode = hiveCode || frame?.hiveCode || 'H001';
    const aCode = apiaryCode || frame?.apiaryCode || 'AP1';

    // Update frame
    setFrames(prev => prev.map(f => {
      if (f.traceabilityCode === code || f.id === frame?.id) {
        return {
          ...f,
          lastInspectedAt: 'Just now',
          healthCondition: condition || result,
          isConcerning: severity === 'attention',
          history: [
            { timestamp: 'Just now', event: 'HEALTH_SCAN_COMPLETED', details: `AI scan: ${result}. Finding: ${finding}` },
            ...(f.history || [])
          ]
        };
      }
      return f;
    }));

    // Add to Hive History
    const histEvent = {
      id: `hist-${Date.now()}`,
      hiveCode: hCode,
      apiaryCode: aCode,
      traceabilityCode: code,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eventType: 'HEALTH_SCAN_COMPLETED',
      title: 'AI frame health scan completed',
      summary: `AI scan completed on frame ${code}. Finding: ${finding}. Observation: ${observation || 'Normal'}.`,
      author: session?.name || 'Sarah Lindqvist',
      evidence: image || '/hive-inspection-sample.jpg',
      metadata: { finding, confidence, actionTaken }
    };

    setHiveHistoryEvents(prev => [histEvent, ...prev]);
    return histEvent;
  };

  // 4. Record Frame Harvest
  const recordHarvest = ({
    frameId,
    traceabilityCode,
    hiveId,
    hiveCode,
    apiaryCode,
    honeyType,
    quantityKg,
    harvestDate,
    harvestTime,
    beeActivity,
    remarks,
    evidencePhoto
  }) => {
    const code = traceabilityCode;
    const targetFrame = frames.find(f => f.id === frameId || f.traceabilityCode === code);
    if (!targetFrame) {
      const err = `Frame not found for traceability code ${code}.`;
      showToast(err);
      return { success: false, error: err };
    }

    // Double Harvest Prevention
    if (targetFrame.status === FRAME_STATUSES.HARVESTED || targetFrame.status === FRAME_STATUSES.SUBMITTED_TO_PROCESSOR || targetFrame.status === FRAME_STATUSES.RECEIVED_BY_PROCESSOR) {
      const err = `Double harvest rejected: Frame ${code} has already been harvested (current status: ${targetFrame.status}).`;
      showToast(err);
      return { success: false, error: err };
    }

    // State Machine Check: Allow harvesting from ACTIVE, READY_FOR_HARVEST, or UNDER_INSPECTION frames
    const harvestableStatuses = [
      FRAME_STATUSES.READY_FOR_HARVEST,
      FRAME_STATUSES.ACTIVE,
      FRAME_STATUSES.UNDER_INSPECTION
    ];
    if (!harvestableStatuses.includes(targetFrame.status) && !canTransitionFrame(targetFrame.status, FRAME_STATUSES.HARVESTED)) {
      const err = `Invalid lifecycle transition: Frame in '${targetFrame.status}' cannot be harvested.`;
      showToast(err);
      return { success: false, error: err };
    }

    // Quantity validation (0.01 to 500 kg total/bulk range)
    const qty = parseFloat(quantityKg);
    if (isNaN(qty) || qty <= 0 || qty > 500) {
      const err = `Invalid harvest yield: ${quantityKg} kg. Must be between 0.01 and 500.0 kg.`;
      showToast(err);
      return { success: false, error: err };
    }

    // Date/time validation: tolerance for same-day timezone differences
    if (harvestDate) {
      const hTime = harvestTime || '12:00';
      const parsedTime = new Date(`${harvestDate}T${hTime}`);
      if (!isNaN(parsedTime.getTime()) && parsedTime.getTime() > Date.now() + 86400000) {
        const err = 'Harvest date/time cannot be in the future.';
        showToast(err);
        return { success: false, error: err };
      }
    }

    const newHarvest = {
      id: `hrv-${Date.now()}`,
      traceabilityCode: code,
      apiaryCode: apiaryCode || targetFrame.apiaryCode || 'AP1',
      apiaryName: apiaries.find(a => a.apiaryCode === (apiaryCode || targetFrame.apiaryCode))?.name || 'Meadowbrook Apiary',
      hiveCode: hiveCode || targetFrame.hiveCode || 'H001',
      hiveName: hives.find(h => h.id === hiveId || h.code === (hiveCode || targetFrame.hiveCode))?.name || 'Cedar Queen',
      frameNumber: targetFrame.frameNumber || 'F3',
      harvestDate: harvestDate || new Date().toISOString().split('T')[0],
      harvestTime: harvestTime || '08:30',
      honeyType: honeyType || targetFrame.honeyType || 'Wildflower',
      quantityKg: qty,
      condition: 'Harvested from capped super frame',
      beeActivity: beeActivity || 'Calm foraging during harvest',
      remarks: remarks || '',
      evidencePhoto: evidencePhoto || '/hive-inspection-sample.jpg',
      submittingBeekeeper: session?.name || 'Sarah Lindqvist',
      status: 'HARVESTED',
      submittedToProcessor: false,
      timestamp: new Date().toISOString()
    };

    setHarvestRecords(prev => [newHarvest, ...prev]);

    // Update frame status to HARVESTED
    setFrames(prev => prev.map(f => {
      if (f.id === targetFrame.id || f.traceabilityCode === code) {
        return {
          ...f,
          status: FRAME_STATUSES.HARVESTED,
          statusLabel: FRAME_STATUS_LABELS.HARVESTED,
          harvestedAt: newHarvest.timestamp,
          harvestQuantityKg: newHarvest.quantityKg,
          honeyType: newHarvest.honeyType,
          history: [
            { timestamp: 'Just now', event: 'HARVEST_RECORDED', details: `${newHarvest.quantityKg} kg ${newHarvest.honeyType} harvested from frame ${code}` },
            ...(f.history || [])
          ]
        };
      }
      return f;
    }));

    // Update parent Hive stats
    setHives(prev => prev.map(h => {
      const isMatch = h.id === newHarvest.hiveId ||
        h.code === newHarvest.hiveCode ||
        `H${String(h.code).padStart(3, '0')}` === newHarvest.hiveCode ||
        (newHarvest.traceabilityCode && newHarvest.traceabilityCode.includes(String(h.code)));
      if (isMatch) {
        return {
          ...h,
          lastHarvestDate: newHarvest.harvestDate,
          lastHarvestKg: newHarvest.quantityKg,
          harvestedFramesCount: (h.harvestedFramesCount || 0) + 1
        };
      }
      return h;
    }));

    // Update parent Management Batch stats
    setHiveManagementBatches(prev => prev.map(b => {
      const containsHive = (b.memberships || []).some(m => m.hiveId === newHarvest.hiveId) ||
        hives.some(h => (h.id === newHarvest.hiveId || h.code === newHarvest.hiveCode) && h.batchId === b.id);
      if (containsHive) {
        return {
          ...b,
          harvestedFramesCount: (b.harvestedFramesCount || 0) + 1,
          lastHarvestAt: newHarvest.timestamp
        };
      }
      return b;
    }));

    // Append to Hive History
    const histEvent = {
      id: `hist-${Date.now()}`,
      hiveCode: newHarvest.hiveCode,
      apiaryCode: newHarvest.apiaryCode,
      traceabilityCode: code,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eventType: 'HARVEST_RECORDED',
      title: 'Harvest recorded',
      summary: `${newHarvest.quantityKg} kg ${newHarvest.honeyType} harvested from frame ${code}.`,
      author: session?.name || 'Sarah Lindqvist',
      evidence: evidencePhoto || '/hive-inspection-sample.jpg',
      metadata: { quantity: `${newHarvest.quantityKg} kg`, honeyType: newHarvest.honeyType }
    };

    setHiveHistoryEvents(prev => [histEvent, ...prev]);

    return { success: true, harvest: newHarvest };
  };

  // 5. Submit Harvest to Processor Handover
  const submitHarvestToProcessor = ({
    harvestRecordId,
    frameId,
    traceabilityCode,
    processorFacility,
    containerSeal,
    remarks
  }) => {
    const cleanTraceCode = String(traceabilityCode || '').toUpperCase().trim();
    const cleanFrameId = String(frameId || '').trim();
    const matchingHarvest = harvestRecords.find(h => 
      (harvestRecordId && h.id === harvestRecordId) || 
      (cleanTraceCode && (h.traceabilityCode || '').toUpperCase().trim() === cleanTraceCode)
    );
    let targetFrame = frames.find(f => 
      (cleanFrameId && f.id === cleanFrameId) || 
      (cleanTraceCode && (f.traceabilityCode || '').toUpperCase().trim() === cleanTraceCode)
    );

    if (!targetFrame && matchingHarvest) {
      targetFrame = {
        id: frameId || `frame-${matchingHarvest.traceabilityCode}`,
        traceabilityCode: matchingHarvest.traceabilityCode,
        apiaryCode: matchingHarvest.apiaryCode || 'AP1',
        hiveCode: matchingHarvest.hiveCode || 'H001',
        frameNumber: matchingHarvest.frameNumber || 'F1',
        harvestQuantityKg: matchingHarvest.quantityKg,
        honeyType: matchingHarvest.honeyType,
        status: FRAME_STATUSES.HARVESTED
      };
    }

    if (!targetFrame) {
      const err = `Target frame ${traceabilityCode} not found for processor submission.`;
      showToast(err);
      return { success: false, error: err };
    }

    // Handover Duplication / Idempotency Check
    if (matchingHarvest?.submittedToProcessor || targetFrame.status === FRAME_STATUSES.SUBMITTED_TO_PROCESSOR || targetFrame.status === FRAME_STATUSES.RECEIVED_BY_PROCESSOR) {
      const err = `Duplicate handover rejected: Harvest for ${traceabilityCode} has already been submitted to processor.`;
      showToast(err);
      return { success: false, error: err };
    }

    // State machine check
    if (targetFrame.status !== FRAME_STATUSES.HARVESTED && !canTransitionFrame(targetFrame.status, FRAME_STATUSES.SUBMITTED_TO_PROCESSOR)) {
      const err = `Invalid transition: Frame in '${targetFrame.status}' cannot be submitted to processor. Must be HARVESTED first.`;
      showToast(err);
      return { success: false, error: err };
    }

    const nextIdx = handoverRecords.length + 1;
    const handoverCode = `HND-2409-${String(nextIdx).padStart(2, '0')}`;

    const newHandover = {
      id: `handover-${Date.now()}`,
      handoverCode,
      traceabilityCode,
      harvestRecordId: matchingHarvest?.id || null,
      apiaryCode: targetFrame?.apiaryCode || 'AP1',
      hiveCode: targetFrame?.hiveCode || 'H001',
      frameNumber: targetFrame?.frameNumber || 'F3',
      quantityKg: targetFrame?.harvestQuantityKg || matchingHarvest?.quantityKg || 2.4,
      honeyType: targetFrame?.honeyType || matchingHarvest?.honeyType || 'Wildflower',
      submissionTimestamp: 'Just now',
      submittingBeekeeper: session?.name || 'Sarah Lindqvist',
      receivingFacility: processorFacility || 'On-site Honey Processing House #2',
      status: 'SUBMITTED_TO_PROCESSOR',
      statusLabel: 'Submitted for Processing',
      remarks: remarks || 'Delivered in food-grade sealed frame transport container.',
      evidence: {
        containerSeal: containerSeal || 'SEAL-AP1-MB-0926',
        photo: '/hive-inspection-sample.jpg'
      },
      downstreamJourney: {
        harvest: { completed: true, timestamp: matchingHarvest ? `${matchingHarvest.harvestDate} · ${matchingHarvest.harvestTime}` : '25 Sep', handler: session?.name || 'Sarah Lindqvist' },
        submission: { completed: true, timestamp: 'Just now', handler: session?.name || 'Sarah Lindqvist' },
        processing: { status: 'pending', currentStep: 'Awaiting Processor Intake Acceptance', startedAt: null, facility: processorFacility || 'On-site Honey Processing House #2', etaNextStep: 'Awaiting Intake Verification' },
        quality: { status: 'pending', eta: '28 Sep 2026' },
        packaging: { status: 'pending', eta: '29 Sep 2026' },
        dispatch: { status: 'pending', eta: '01 Oct 2026' }
      }
    };

    setHandoverRecords(prev => {
      const updated = [newHandover, ...prev];
      honeyDatabaseGateway.saveTable(TABLE_NAMES.HANDOVER_RECORDS, updated);
      return updated;
    });

    // Update harvest record
    setHarvestRecords(prev => {
      const updated = prev.map(h => {
        if (h.traceabilityCode === traceabilityCode || h.id === harvestRecordId) {
          return { ...h, submittedToProcessor: true, handoverId: newHandover.id };
        }
        return h;
      });
      honeyDatabaseGateway.saveTable(TABLE_NAMES.HARVEST_RECORDS, updated);
      return updated;
    });

    // Update frame status to SUBMITTED_TO_PROCESSOR
    setFrames(prev => {
      const updated = prev.map(f => {
        if (f.traceabilityCode === traceabilityCode || f.id === targetFrame.id) {
          return {
            ...f,
            status: FRAME_STATUSES.SUBMITTED_TO_PROCESSOR,
            statusLabel: FRAME_STATUS_LABELS.SUBMITTED_TO_PROCESSOR,
            submittedAt: new Date().toISOString(),
            handoverId: newHandover.id,
            history: [
              { timestamp: 'Just now', event: 'HARVEST_SUBMITTED', details: `Submitted to ${newHandover.receivingFacility}` },
              ...(f.history || [])
            ]
          };
        }
        return f;
      });
      honeyDatabaseGateway.saveTable(TABLE_NAMES.FRAMES, updated);
      return updated;
    });

    // Append to Hive History
    const histEvent = {
      id: `hist-${Date.now()}`,
      hiveCode: newHandover.hiveCode,
      apiaryCode: newHandover.apiaryCode,
      traceabilityCode,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eventType: 'HARVEST_SUBMITTED',
      title: 'Harvest submitted to Processor',
      summary: `Frame ${traceabilityCode} submitted to ${newHandover.receivingFacility}. Handover ref: ${handoverCode}.`,
      author: session?.name || 'Sarah Lindqvist',
      evidence: null,
      metadata: { handoverCode, facility: newHandover.receivingFacility }
    };

    setHiveHistoryEvents(prev => [histEvent, ...prev]);
    return { success: true, handover: newHandover };
  };

  // 6. Add Apiary
  const addApiary = ({ name, apiaryCode, location, notes }) => {
    if (!name || !name.trim()) {
      const err = 'Apiary name is required.';
      showToast(err);
      return { success: false, error: err };
    }

    // Auto-normalize code: handles "1", "01", "AP01", "AP 1", "AP-1", or blank
    let cleanCode = String(apiaryCode || '').toUpperCase().trim();
    const digitMatch = cleanCode.match(/^AP[-_\s]*0*([1-9][0-9]*)$/) || cleanCode.match(/^0*([1-9][0-9]*)$/);
    if (digitMatch) {
      cleanCode = `AP${digitMatch[1]}`;
    }

    // If invalid or empty, find next available code
    if (!cleanCode || !validateApiaryCode(cleanCode)) {
      let nextNum = 1;
      while (apiaries.some(a => a.apiaryCode === `AP${nextNum}`)) {
        nextNum++;
      }
      cleanCode = `AP${nextNum}`;
    }

    // If code exists, find next available code
    if (apiaries.some(a => a.apiaryCode === cleanCode)) {
      let nextNum = 1;
      while (apiaries.some(a => a.apiaryCode === `AP${nextNum}`)) {
        nextNum++;
      }
      cleanCode = `AP${nextNum}`;
    }
    const newAp = {
      id: `apiary-${Date.now()}`,
      apiaryCode: cleanCode,
      name: name.trim(),
      location: location?.trim() || 'Regional Apiary Yard',
      hiveBoxesCount: 0,
      activeFramesCount: 0,
      registrationDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'active',
      operator: session?.name || 'Sarah Lindqvist',
      notes: notes || '',
      weather: {
        temp: '22.0°C',
        condition: 'Clear foraging weather',
        humidity: '50%',
        wind: '6 km/h NW'
      }
    };

    setApiaries(prev => {
      const updated = [...prev, newAp];
      if (honeyDatabaseGateway) {
        honeyDatabaseGateway.saveTable(TABLE_NAMES.APIARIES, updated);
      }
      return updated;
    });

    if (!apiary) {
      setApiary(newAp);
    }

    showToast(`Apiary yard ${newAp.name} registered`);
    return { success: true, apiary: newAp };
  };

  // Delete an Apiary Yard
  const deleteApiary = (apiaryId) => {
    const target = apiaries.find(a => a.id === apiaryId || a.apiaryCode === apiaryId);
    const updated = apiaries.filter(a => a.id !== apiaryId && a.apiaryCode !== apiaryId);
    setApiaries(updated);
    if (apiary?.id === apiaryId || apiary?.apiaryCode === apiaryId) {
      setApiary(updated[0] || null);
    }
    if (honeyDatabaseGateway) {
      honeyDatabaseGateway.saveTable(TABLE_NAMES.APIARIES, updated);
    }
    showToast(`Apiary yard '${target?.name || apiaryId}' removed`);
    return { success: true };
  };

  // ==========================================
  // MASTER PROCESSOR DOMAIN WORKFLOW ACTIONS
  // ==========================================

  // 1. Accept Harvest Intake
  const acceptHarvestIntake = ({
    handoverId,
    traceabilityCode,
    receivedQuantityKg,
    conditionOnArrival = 'Good / Sealed',
    storageLocation = 'Intake Bay #1',
    remarks = '',
    operator = null
  }) => {
    const activeOperator = operator || session?.name || 'Marcus K.';
    const validation = ProcessorDomainService.validateIntakeAcceptance({
      receivedQuantityKg,
      conditionOnArrival,
      operator: activeOperator
    });

    if (!validation.isValid) {
      showToast(validation.errors[0]);
      return { success: false, error: validation.errors[0], errors: validation.errors };
    }

    let existingHandover = handoverRecords.find(h => h.id === handoverId || h.traceabilityCode === traceabilityCode);
    if (!existingHandover) {
      const hrvMatch = harvestRecords.find(h => h.id === handoverId || h.traceabilityCode === traceabilityCode);
      if (hrvMatch) {
        const nextIdx = handoverRecords.length + 1;
        existingHandover = {
          id: `handover-${hrvMatch.id || Date.now()}`,
          handoverCode: `HND-2409-${String(nextIdx).padStart(2, '0')}`,
          traceabilityCode: hrvMatch.traceabilityCode,
          harvestRecordId: hrvMatch.id,
          apiaryCode: hrvMatch.apiaryCode || 'AP1',
          hiveCode: hrvMatch.hiveCode || 'H001',
          frameNumber: hrvMatch.frameNumber || 'F1',
          quantityKg: hrvMatch.quantityKg || Number(receivedQuantityKg) || 2.4,
          honeyType: hrvMatch.honeyType || 'Wildflower',
          submissionTimestamp: 'Recently',
          submittingBeekeeper: hrvMatch.submittingBeekeeper || 'Sarah Lindqvist',
          receivingFacility: 'On-site Honey Processing House #2',
          status: INTAKE_STATUSES.SUBMITTED_TO_PROCESSOR,
          statusLabel: 'Submitted for Processing',
          remarks: hrvMatch.remarks || 'Delivered from apiary harvest.'
        };
      }
    }

    if (!existingHandover) {
      const err = `Incoming harvest ${traceabilityCode || handoverId} not found.`;
      showToast(err);
      return { success: false, error: err };
    }

    if (existingHandover.status === INTAKE_STATUSES.RECEIVED || existingHandover.status === INTAKE_STATUSES.ASSIGNED_TO_BATCH) {
      const err = `Intake for ${existingHandover.traceabilityCode} has already been accepted.`;
      showToast(err);
      return { success: false, error: err };
    }

    if (existingHandover.status === INTAKE_STATUSES.REJECTED) {
      const err = `Intake for ${existingHandover.traceabilityCode} was previously rejected.`;
      showToast(err);
      return { success: false, error: err };
    }

    const updatedHandover = {
      ...existingHandover,
      status: INTAKE_STATUSES.RECEIVED,
      statusLabel: INTAKE_STATUS_LABELS.RECEIVED,
      receivedAt: new Date().toISOString(),
      receivedQuantityKg: Number(receivedQuantityKg),
      conditionOnArrival,
      storageLocation,
      intakeOperator: activeOperator,
      intakeRemarks: remarks,
      downstreamJourney: {
        ...(existingHandover.downstreamJourney || {}),
        harvest: existingHandover.downstreamJourney?.harvest || { completed: true, timestamp: 'Recently', handler: 'Sarah Lindqvist' },
        submission: existingHandover.downstreamJourney?.submission || { completed: true, timestamp: 'Recently', handler: 'Sarah Lindqvist' },
        intake: {
          completed: true,
          timestamp: 'Just now',
          handler: activeOperator,
          receivedKg: Number(receivedQuantityKg)
        },
        processing: {
          status: 'active',
          currentStep: 'Centrifugal Extraction & Settling',
          startedAt: 'Just now',
          facility: existingHandover.receivingFacility || 'On-site Honey Processing House #2',
          etaNextStep: 'Tomorrow, 10:00 AM'
        }
      }
    };

    setHandoverRecords(prev => {
      const exists = prev.some(h => h.id === existingHandover.id);
      const updated = exists
        ? prev.map(h => h.id === existingHandover.id ? updatedHandover : h)
        : [updatedHandover, ...prev];
      honeyDatabaseGateway.saveTable(TABLE_NAMES.HANDOVER_RECORDS, updated);
      return updated;
    });

    // Update harvest records
    setHarvestRecords(prev => {
      const updated = prev.map(h => {
        if (h.traceabilityCode === existingHandover.traceabilityCode || h.id === existingHandover.harvestRecordId) {
          return { ...h, submittedToProcessor: true, handoverId: updatedHandover.id };
        }
        return h;
      });
      honeyDatabaseGateway.saveTable(TABLE_NAMES.HARVEST_RECORDS, updated);
      return updated;
    });

    // Update frames to RECEIVED_BY_PROCESSOR
    setFrames(prev => {
      const updated = prev.map(f => {
        if (f.traceabilityCode === existingHandover.traceabilityCode || f.id === existingHandover.frameId) {
          return {
            ...f,
            status: FRAME_STATUSES.RECEIVED_BY_PROCESSOR,
            statusLabel: FRAME_STATUS_LABELS.RECEIVED_BY_PROCESSOR,
            receivedAt: new Date().toISOString(),
            history: [
              {
                timestamp: 'Just now',
                event: 'INTAKE_ACCEPTED',
                details: `Intake verified by Processor (${activeOperator}). Stored at ${storageLocation}.`
              },
              ...(f.history || [])
            ]
          };
        }
        return f;
      });
      honeyDatabaseGateway.saveTable(TABLE_NAMES.FRAMES, updated);
      return updated;
    });

    const auditEvent = {
      id: `proc-aud-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      batchNumber: null,
      action: 'INTAKE_ACCEPTED',
      title: 'Harvest Intake Accepted',
      details: `Received & verified frame ${existingHandover.traceabilityCode} (${receivedQuantityKg} kg). Stored at ${storageLocation}.`,
      operator: activeOperator,
      facility: existingHandover.receivingFacility || 'HoneyHouse Central Processing #2'
    };

    setProcessingAuditLog(prev => [auditEvent, ...prev]);
    showToast(`Accepted intake for ${existingHandover.traceabilityCode}`);
    return { success: true, handover: updatedHandover };
  };

  // 2. Reject Harvest Intake
  const rejectHarvestIntake = ({
    handoverId,
    traceabilityCode,
    reasonId,
    remarks,
    operator = null
  }) => {
    const activeOperator = operator || session?.name || 'Marcus K.';
    const validation = ProcessorDomainService.validateIntakeRejection({
      reasonId,
      remarks,
      operator: activeOperator
    });

    if (!validation.isValid) {
      showToast(validation.errors[0]);
      return { success: false, error: validation.errors[0], errors: validation.errors };
    }

    const existingHandover = handoverRecords.find(h => h.id === handoverId || h.traceabilityCode === traceabilityCode);
    if (!existingHandover) {
      const err = `Incoming harvest ${traceabilityCode || handoverId} not found.`;
      showToast(err);
      return { success: false, error: err };
    }

    if (existingHandover.status === INTAKE_STATUSES.RECEIVED || existingHandover.status === INTAKE_STATUSES.ASSIGNED_TO_BATCH) {
      const err = `Cannot reject intake: ${existingHandover.traceabilityCode} was already accepted.`;
      showToast(err);
      return { success: false, error: err };
    }

    const reasonObj = INTAKE_REJECTION_REASONS.find(r => r.id === reasonId);

    const updatedHandover = {
      ...existingHandover,
      status: INTAKE_STATUSES.REJECTED,
      statusLabel: INTAKE_STATUS_LABELS.REJECTED,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reasonObj?.label || reasonId,
      rejectionRemarks: remarks,
      rejectionOperator: activeOperator
    };

    setHandoverRecords(prev => prev.map(h => h.id === existingHandover.id ? updatedHandover : h));

    const auditEvent = {
      id: `proc-aud-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      batchNumber: null,
      action: 'INTAKE_REJECTED',
      title: 'Harvest Intake Rejected',
      details: `Intake for ${existingHandover.traceabilityCode} REJECTED. Reason: ${reasonObj?.label || reasonId}. Notes: ${remarks}`,
      operator: activeOperator,
      facility: existingHandover.receivingFacility || 'HoneyHouse Central Processing #2'
    };

    setProcessingAuditLog(prev => [auditEvent, ...prev]);
    showToast(`Intake for ${existingHandover.traceabilityCode} rejected`);
    return { success: true, handover: updatedHandover };
  };

  // 2b. Hold Harvest Intake (Uncertainty / Pending verification)
  const holdHarvestIntake = ({
    handoverId,
    traceabilityCode,
    reason = 'Pending Quality or Physical Inspection',
    remarks = '',
    operator = null
  }) => {
    const activeOperator = operator || session?.name || 'Marcus K.';
    const existingHandover = handoverRecords.find(h => h.id === handoverId || h.traceabilityCode === traceabilityCode);
    if (!existingHandover) {
      const err = `Incoming harvest ${traceabilityCode || handoverId} not found.`;
      showToast(err);
      return { success: false, error: err };
    }

    if (existingHandover.status === INTAKE_STATUSES.ASSIGNED_TO_BATCH) {
      const err = `Cannot place on hold: ${existingHandover.traceabilityCode} is already assigned to a batch.`;
      showToast(err);
      return { success: false, error: err };
    }

    const updatedHandover = {
      ...existingHandover,
      status: INTAKE_STATUSES.ON_HOLD,
      statusLabel: INTAKE_STATUS_LABELS.ON_HOLD,
      heldAt: new Date().toISOString(),
      holdReason: reason,
      holdRemarks: remarks,
      holdOperator: activeOperator
    };

    setHandoverRecords(prev => prev.map(h => h.id === existingHandover.id ? updatedHandover : h));

    const auditEvent = {
      id: `proc-aud-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      batchNumber: null,
      action: 'INTAKE_HELD',
      title: 'Harvest Intake Placed On Hold',
      details: `Intake for ${existingHandover.traceabilityCode} placed ON HOLD. Reason: ${reason}. Notes: ${remarks}`,
      operator: activeOperator,
      facility: existingHandover.receivingFacility || 'HoneyHouse Central Processing #2'
    };

    setProcessingAuditLog(prev => [auditEvent, ...prev]);
    showToast(`Intake for ${existingHandover.traceabilityCode} placed on hold`);
    return { success: true, handover: updatedHandover };
  };

  // 3. Create Processing Batch from Accepted Intakes (Configuration-Driven Engine)
  const createProcessingBatch = ({
    sourceHandoverIds = [],
    batchName = '',
    facility = 'HoneyHouse Central Processing #2',
    profileCode = 'COMMERCIAL_RETAIL',
    sopId = null,
    product = null,
    market = null,
    operator = null
  }) => {
    const activeOperator = operator || session?.name || 'Marcus K.';

    if (!sourceHandoverIds || sourceHandoverIds.length === 0) {
      const err = 'Select at least one accepted harvest intake to create a processing batch.';
      showToast(err);
      return { success: false, error: err };
    }

    const selectedHandovers = handoverRecords.filter(h => sourceHandoverIds.includes(h.id));
    if (selectedHandovers.length === 0) {
      const err = 'None of the selected intake items were found.';
      showToast(err);
      return { success: false, error: err };
    }

    // Verify all selected intakes are in RECEIVED state
    const invalidState = selectedHandovers.find(h => h.status !== INTAKE_STATUSES.RECEIVED);
    if (invalidState) {
      const err = `Intake ${invalidState.traceabilityCode} cannot be assigned. It is in status: ${invalidState.statusLabel || invalidState.status}. Must be ACCEPTED first.`;
      showToast(err);
      return { success: false, error: err };
    }

    const batchCode = ProcessorDomainService.generateBatchCode(processingBatches);
    const availableEquipment = ProcessorProfileService.getEquipment();

    const newBatch = ProcessingEngine.createProcessingBatch({
      batchCode,
      batchName,
      facilityName: facility,
      profileCode,
      sopId,
      sourceHandovers: selectedHandovers,
      leadOperator: activeOperator,
      product,
      market,
      availableEquipment
    });

    setProcessingBatches(prev => [newBatch, ...prev]);

    // Mark handovers as ASSIGNED_TO_BATCH
    setHandoverRecords(prev => prev.map(h => {
      if (sourceHandoverIds.includes(h.id)) {
        return {
          ...h,
          status: INTAKE_STATUSES.ASSIGNED_TO_BATCH,
          statusLabel: INTAKE_STATUS_LABELS.ASSIGNED_TO_BATCH,
          processingBatchId: newBatch.id,
          processingBatchNumber: batchCode
        };
      }
      return h;
    }));

    const auditEvent = {
      id: `proc-aud-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      batchNumber: batchCode,
      action: 'BATCH_CREATED',
      title: 'Processing Batch Created',
      details: `Created processing batch ${batchCode} (${newBatch.profileName}) from ${newBatch.sourceHarvests.length} harvest units (${newBatch.weightKg} kg). Active SOP: ${newBatch.sopCode} v${newBatch.sopVersion}.`,
      operator: activeOperator,
      facility
    };

    setProcessingAuditLog(prev => [auditEvent, ...prev]);
    showToast(`Created batch ${batchCode} (${newBatch.profileName})`);
    return { success: true, batch: newBatch };
  };

  // 4. Record Processing Step (Dynamic Parameters, Real-time Regulatory Checks, Deviations)
  const recordProcessingStep = ({
    batchId,
    stepKey,
    parameters = {},
    equipment = '',
    evidence = null,
    remarks = '',
    operator = null
  }) => {
    const activeOperator = operator || session?.name || 'Marcus K.';
    const targetBatch = processingBatches.find(b => b.id === batchId || b.batchNumber === batchId);

    if (!targetBatch) {
      const err = `Processing batch ${batchId} not found.`;
      showToast(err);
      return { success: false, error: err };
    }

    if (targetBatch.status === BATCH_STATUSES.ON_HOLD) {
      const err = `Batch ${targetBatch.batchNumber} is currently ON HOLD. Resume batch before recording steps.`;
      showToast(err);
      return { success: false, error: err };
    }

    if (targetBatch.status === BATCH_STATUSES.SUBMITTED_TO_QUALITY || targetBatch.status === BATCH_STATUSES.QUALITY_PASSED) {
      const err = `Batch ${targetBatch.batchNumber} has already been finalized and handed to Quality.`;
      showToast(err);
      return { success: false, error: err };
    }

    const executionResult = ProcessingEngine.recordStepExecution({
      batch: targetBatch,
      stepKey,
      parameters,
      equipment,
      operator: activeOperator,
      remarks,
      evidence
    });

    if (!executionResult.success) {
      showToast(executionResult.error || 'Failed to record step');
      return executionResult;
    }

    const updatedBatch = executionResult.batch;
    setProcessingBatches(prev => prev.map(b => b.id === targetBatch.id ? updatedBatch : b));

    const auditEvent = {
      id: `proc-aud-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      batchNumber: targetBatch.batchNumber,
      action: `${stepKey}_COMPLETED`,
      title: `${executionResult.step.name} Recorded`,
      details: `Step ${executionResult.step.name} logged by ${activeOperator}. Equipment: ${equipment}. ${executionResult.newDeviations?.length > 0 ? `(${executionResult.newDeviations.length} deviation logged)` : ''}`,
      operator: activeOperator,
      facility: targetBatch.facility
    };

    setProcessingAuditLog(prev => [auditEvent, ...prev]);
    showToast(`Recorded ${executionResult.step.shortLabel} for ${targetBatch.batchNumber}`);
    return { success: true, step: executionResult.step, batch: updatedBatch, deviations: executionResult.newDeviations };
  };

  // 4b. Skip Optional Processing Step with Audited Justification
  const skipProcessingStep = ({ batchId, stepKey, reason, operator = null }) => {
    const activeOperator = operator || session?.name || 'Marcus K.';
    const targetBatch = processingBatches.find(b => b.id === batchId || b.batchNumber === batchId);
    if (!targetBatch) return { success: false, error: 'Batch not found' };

    const res = ProcessingEngine.skipOptionalStep({
      batch: targetBatch,
      stepKey,
      reason,
      operator: activeOperator
    });

    if (res.success) {
      setProcessingBatches(prev => prev.map(b => b.id === targetBatch.id ? res.batch : b));
      const auditEvent = {
        id: `proc-aud-${Date.now()}`,
        timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        batchNumber: targetBatch.batchNumber,
        action: `${stepKey}_SKIPPED`,
        title: `Optional Step ${stepKey} Skipped`,
        details: `Optional step ${stepKey} skipped by ${activeOperator}. Reason: ${reason}`,
        operator: activeOperator,
        facility: targetBatch.facility
      };
      setProcessingAuditLog(prev => [auditEvent, ...prev]);
      showToast(`Skipped ${stepKey} with audited justification`);
    }
    return res;
  };

  // 4c. Record Process Deviation
  const recordBatchDeviation = ({ batchId, deviation }) => {
    const targetBatch = processingBatches.find(b => b.id === batchId || b.batchNumber === batchId);
    if (!targetBatch) return { success: false, error: 'Batch not found' };

    const updatedBatch = {
      ...targetBatch,
      deviations: [deviation, ...(targetBatch.deviations || [])],
      lastUpdated: 'Just now'
    };

    setProcessingBatches(prev => prev.map(b => b.id === targetBatch.id ? updatedBatch : b));
    showToast(`Logged deviation: ${deviation.parameter}`);
    return { success: true, batch: updatedBatch };
  };

  // 4d. Resolve Process Deviation Disposition
  const resolveBatchDeviation = ({ batchId, deviationId, disposition, notes, reviewerName }) => {
    const targetBatch = processingBatches.find(b => b.id === batchId || b.batchNumber === batchId);
    if (!targetBatch) return { success: false, error: 'Batch not found' };

    const activeReviewer = reviewerName || session?.name || session?.operator || 'Plant Lead';
    const res = ProcessingEngine.resolveDeviation({
      batch: targetBatch,
      deviationId,
      disposition,
      notes,
      reviewerName: activeReviewer
    });

    if (res.success) {
      const updatedBatches = processingBatches.map(b => b.id === targetBatch.id ? res.batch : b);
      setProcessingBatches(updatedBatches);
      honeyDatabaseGateway.saveTable(TABLE_NAMES.PROCESSING_BATCHES, updatedBatches);

      const auditEvent = {
        id: `proc-aud-${Date.now()}`,
        timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        batchNumber: targetBatch.batchNumber,
        action: 'DEVIATION_RESOLVED',
        title: `Process Deviation Dispositioned: ${disposition}`,
        details: `Deviation ${deviationId} dispositioned as ${disposition} by ${activeReviewer}. Notes: ${notes || 'Variance approved under SOP.'}`,
        operator: activeReviewer,
        facility: targetBatch.facility
      };
      setProcessingAuditLog(prev => [auditEvent, ...prev]);
      showToast(`Deviation disposition recorded: ${disposition}`);
    }
    return res;
  };

  // 4e. Update Batch Approved Plan
  const updateBatchApprovedPlan = ({ batchId, approvedPlan }) => {
    const targetBatch = processingBatches.find(b => b.id === batchId || b.batchNumber === batchId);
    if (!targetBatch) return { success: false, error: 'Batch not found' };

    const updatedBatch = {
      ...targetBatch,
      approvedPlan,
      lastUpdated: 'Just now'
    };

    setProcessingBatches(prev => prev.map(b => b.id === targetBatch.id ? updatedBatch : b));
    showToast(`Approved plan updated for ${targetBatch.batchNumber}`);
    return { success: true, batch: updatedBatch };
  };

  // 5. Put Batch On Hold
  const putBatchOnHold = ({
    batchId,
    reasonId,
    remarks = '',
    operator = null
  }) => {
    const activeOperator = operator || session?.name || 'Marcus K.';
    const targetBatch = processingBatches.find(b => b.id === batchId || b.batchNumber === batchId);

    if (!targetBatch) {
      const err = `Processing batch ${batchId} not found.`;
      showToast(err);
      return { success: false, error: err };
    }

    if (targetBatch.status === BATCH_STATUSES.ON_HOLD) {
      const err = `Batch ${targetBatch.batchNumber} is already on hold.`;
      showToast(err);
      return { success: false, error: err };
    }

    const reasonObj = BATCH_HOLD_REASONS.find(r => r.id === reasonId);
    if (!reasonObj) {
      const err = 'A valid hold reason must be selected.';
      showToast(err);
      return { success: false, error: err };
    }

    if (!remarks || remarks.trim().length < 5) {
      const err = 'Remarks explaining the hold condition are required.';
      showToast(err);
      return { success: false, error: err };
    }

    const holdEntry = {
      id: `hold-${Date.now()}`,
      reasonId,
      reasonLabel: reasonObj.label,
      remarks,
      operator: activeOperator,
      startedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resolvedAt: null
    };

    const updatedBatch = {
      ...targetBatch,
      status: BATCH_STATUSES.ON_HOLD,
      statusLabel: `On Hold (${reasonObj.label})`,
      lastUpdated: 'Just now',
      holds: [holdEntry, ...(targetBatch.holds || [])]
    };

    setProcessingBatches(prev => prev.map(b => b.id === targetBatch.id ? updatedBatch : b));

    const auditEvent = {
      id: `proc-aud-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      batchNumber: targetBatch.batchNumber,
      action: 'BATCH_ON_HOLD',
      title: 'Batch Placed on Hold',
      details: `Batch ${targetBatch.batchNumber} placed ON HOLD. Reason: ${reasonObj.label}. Remarks: ${remarks}`,
      operator: activeOperator,
      facility: targetBatch.facility
    };

    setProcessingAuditLog(prev => [auditEvent, ...prev]);
    showToast(`Batch ${targetBatch.batchNumber} placed ON HOLD`);
    return { success: true, batch: updatedBatch };
  };

  // 6. Resume Batch from Hold
  const resumeBatchFromHold = ({
    batchId,
    remarks = '',
    operator = null
  }) => {
    const activeOperator = operator || session?.name || 'Marcus K.';
    const targetBatch = processingBatches.find(b => b.id === batchId || b.batchNumber === batchId);

    if (!targetBatch) {
      const err = `Processing batch ${batchId} not found.`;
      showToast(err);
      return { success: false, error: err };
    }

    if (targetBatch.status !== BATCH_STATUSES.ON_HOLD) {
      const err = `Batch ${targetBatch.batchNumber} is not currently on hold.`;
      showToast(err);
      return { success: false, error: err };
    }

    const updatedHolds = (targetBatch.holds || []).map((h, i) => {
      if (i === 0 && !h.resolvedAt) {
        return {
          ...h,
          resolvedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resumeRemarks: remarks,
          resumedBy: activeOperator
        };
      }
      return h;
    });

    const updatedBatch = {
      ...targetBatch,
      status: BATCH_STATUSES.IN_PROCESSING,
      statusLabel: 'In Processing (Resumed)',
      lastUpdated: 'Just now',
      holds: updatedHolds
    };

    setProcessingBatches(prev => prev.map(b => b.id === targetBatch.id ? updatedBatch : b));

    const auditEvent = {
      id: `proc-aud-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      batchNumber: targetBatch.batchNumber,
      action: 'BATCH_RESUMED',
      title: 'Batch Hold Resumed',
      details: `Batch ${targetBatch.batchNumber} resumed from hold by ${activeOperator}. Resolution: ${remarks || 'Hold condition cleared.'}`,
      operator: activeOperator,
      facility: targetBatch.facility
    };

    setProcessingAuditLog(prev => [auditEvent, ...prev]);
    showToast(`Batch ${targetBatch.batchNumber} resumed to In Processing`);
    return { success: true, batch: updatedBatch };
  };

  // 7. Submit Batch to Quality Handover (Guarded with Incomplete Batch Protection)
  const submitBatchToQuality = (arg) => {
    const payload = typeof arg === 'string' ? { batchId: arg } : (arg || {});
    const { batchId, notes = '', operator = null } = payload;
    const activeOperator = operator || session?.name || session?.operator || 'Marcus K.';
    const targetBatch = processingBatches.find(b => b.id === batchId || b.batchNumber === batchId);

    if (!targetBatch) {
      const err = `Processing batch ${batchId} not found.`;
      showToast(err);
      return { success: false, error: err };
    }

    // Auto-disposition any open process deviations as supervisor release to Quality Lab
    const resolvedDeviations = (targetBatch.deviations || []).map(d => {
      if (!d.resolvedAt || d.disposition === 'HOLD') {
        return {
          ...d,
          disposition: 'RELEASE_TO_QUALITY',
          dispositionNotes: notes ? `Supervisor release to QC Lab: ${notes}` : 'Supervisor release for laboratory analytical testing and certification',
          reviewedBy: activeOperator,
          resolvedAt: new Date().toISOString()
        };
      }
      return d;
    });

    const batchForCheck = {
      ...targetBatch,
      deviations: resolvedDeviations
    };

    // Incomplete Batch Protection using ProcessingEngine
    const check = ProcessingEngine.validateQualityReadiness(batchForCheck, { allowAutoDisposition: true });
    if (!check.allowed) {
      const reasonMsg = check.reasons.join(' ');
      showToast(`Cannot submit to Quality: ${reasonMsg}`);
      return {
        success: false,
        error: reasonMsg,
        missingSteps: check.missingSteps,
        reasons: check.reasons
      };
    }

    const updatedBatch = {
      ...batchForCheck,
      status: BATCH_STATUSES.SUBMITTED_TO_QUALITY,
      statusLabel: BATCH_STATUS_LABELS.SUBMITTED_TO_QUALITY,
      submittedToQualityAt: new Date().toISOString(),
      qualityHandoffNotes: notes,
      qualityHandoffOperator: activeOperator,
      lastUpdated: 'Just now'
    };

    const updatedBatches = processingBatches.map(b => b.id === targetBatch.id ? updatedBatch : b);
    setProcessingBatches(updatedBatches);
    honeyDatabaseGateway.saveTable(TABLE_NAMES.PROCESSING_BATCHES, updatedBatches);

    const auditEvent = {
      id: `proc-aud-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      batchNumber: targetBatch.batchNumber,
      action: 'SUBMITTED_TO_QUALITY',
      title: 'Batch Submitted to Quality Lab',
      details: `Handed over batch ${targetBatch.batchNumber} (${targetBatch.weightKg} kg, ${targetBatch.profileName || 'Commercial'}) to Quality Lab. Notes: ${notes || 'Standard protocol.'}`,
      operator: activeOperator,
      facility: targetBatch.facility
    };

    // Auto-create or reactivate incoming laboratory sample awaiting intake with rich context
    const existingLabSample = labSamples.find(s => s.sourceBatchNumber === targetBatch.batchNumber || s.sourceBatchId === targetBatch.id);
    let updatedLabSamples;
    let targetSampleId;

    const sourceTraceabilityCodes = [
      ...new Set([
        ...((targetBatch.sourceHarvests || []).map(s => s.traceabilityCode).filter(Boolean)),
        ...(targetBatch.sourceHarvestCodes || [])
      ])
    ];

    if (existingLabSample) {
      targetSampleId = existingLabSample.id;
      const updatedSample = {
        ...existingLabSample,
        sourceBatchId: targetBatch.id,
        sourceBatchNumber: targetBatch.batchNumber,
        sourceTraceabilityCodes: sourceTraceabilityCodes.length > 0 ? sourceTraceabilityCodes : (existingLabSample.sourceTraceabilityCodes || []),
        intakeStatus: SAMPLE_STATUSES.AWAITING_INTAKE,
        receivedAt: new Date().toISOString(),
        receivedBy: activeOperator,
        quantityMl: existingLabSample.quantityMl || 250,
        containerType: existingLabSample.containerType || 'Food-Grade Amber Glass Jar (250 mL)',
        sealCondition: 'Tamper tape sealed from processing facility',
        storageLocation: 'Awaiting intake bench',
        remarks: `Re-submitted from batch handoff: ${targetBatch.name || targetBatch.batchNumber} (${targetBatch.profileName || 'SOP compliant'}). Notes: ${notes || 'Standard quality testing.'}`,
        chainOfCustody: [
          ...(existingLabSample.chainOfCustody || []),
          {
            timestamp: new Date().toISOString(),
            action: 'Sample Re-dispatched to Lab',
            from: `Processing Facility (${targetBatch.facility || 'Extraction Bay 1'})`,
            to: 'Lab Intake Station',
            actor: activeOperator,
            reason: `Re-submitted for Quality & Analytical certification under ${targetBatch.sopCode || 'SOP-HNY-001'}`,
            condition: 'Sealed container'
          }
        ]
      };
      updatedLabSamples = labSamples.map(s => s.id === existingLabSample.id ? updatedSample : s);
    } else {
      targetSampleId = generateSampleId(labSamples);
      const incomingLabSample = {
        id: targetSampleId,
        sourceBatchId: targetBatch.id,
        sourceBatchNumber: targetBatch.batchNumber,
        sourceTraceabilityCodes,
        intakeStatus: SAMPLE_STATUSES.AWAITING_INTAKE,
        receivedAt: new Date().toISOString(),
        receivedBy: activeOperator,
        acceptedAt: null,
        acceptedBy: null,
        quantityMl: 250,
        containerType: 'Food-Grade Amber Glass Jar (250 mL)',
        sealCondition: 'Tamper tape sealed from processing facility',
        storageLocation: 'Awaiting intake bench',
        ambientTempAtIntakeC: 22.0,
        remarks: `Auto-registered from batch handoff: ${targetBatch.name || targetBatch.batchNumber} (${targetBatch.profileName || 'SOP compliant'}). Notes: ${notes || 'Standard quality testing.'}`,
        chainOfCustody: [
          {
            timestamp: new Date().toISOString(),
            action: 'Sample Dispatched to Lab',
            from: `Processing Facility (${targetBatch.facility || 'Extraction Bay 1'})`,
            to: 'Lab Intake Station',
            actor: activeOperator,
            reason: `Submitted for Quality & Analytical certification under ${targetBatch.sopCode || 'SOP-HNY-001'} v${targetBatch.sopVersion || '3.2'}`,
            condition: 'Sealed container'
          }
        ],
        qualityRecommendation: null,
        recommendationNotes: '',
        recommenderName: null,
        recommendedAt: null,
        qualityDecision: null,
        qualityDecisionNotes: '',
        certifierName: null,
        certifiedAt: null
      };
      updatedLabSamples = [incomingLabSample, ...labSamples];
    }

    setLabSamples(updatedLabSamples);
    honeyDatabaseGateway.saveTable(TABLE_NAMES.LAB_SAMPLES, updatedLabSamples);

    setProcessingAuditLog(prev => [auditEvent, ...prev]);
    showToast(`Batch ${targetBatch.batchNumber} submitted to Quality! Sample ${targetSampleId} logged in Lab.`);
    return { success: true, batch: updatedBatch, sampleId: targetSampleId };
  };

  // -------------------------------------------------------------
  // MASTER LABORATORY DOMAIN ACTIONS
  // -------------------------------------------------------------

  // Intake a new incoming sample
  const receiveSampleIntake = ({
    sourceBatchNumber,
    sourceTraceabilityCodes = [],
    sampleCondition,
    quantityMl = 250,
    containerType = 'Food-Grade Amber Glass Jar (250 mL)',
    sealCondition = 'Tamper seal intact',
    storageLocation = 'Specimen Cabinet B · Shelf 02',
    ambientTempAtIntakeC = 22.0,
    remarks = '',
    receivedBy = null
  }) => {
    const activeOperator = receivedBy || session?.operator || 'Elena Vance';
    const validation = validateSampleIntake({
      sourceBatchNumber,
      sampleCondition,
      quantityMl,
      storageLocation,
      receivedBy: activeOperator
    });

    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const newSampleId = generateSampleId(labSamples);
    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newSample = {
      id: newSampleId,
      sourceBatchNumber,
      sourceTraceabilityCodes,
      intakeStatus: SAMPLE_STATUSES.RECEIVED,
      receivedAt: nowIso,
      receivedBy: activeOperator,
      acceptedAt: null,
      acceptedBy: null,
      quantityMl: Number(quantityMl),
      containerType,
      sealCondition,
      storageLocation,
      ambientTempAtIntakeC: Number(ambientTempAtIntakeC),
      remarks,
      chainOfCustody: [
        {
          timestamp: nowIso,
          action: 'Sample Received at Lab',
          from: 'Extraction Room / Processing Bay',
          to: storageLocation,
          actor: activeOperator,
          reason: 'Sample intake for analytical profiling',
          condition: sampleCondition
        }
      ],
      qualityRecommendation: null,
      recommendationNotes: '',
      recommenderName: null,
      recommendedAt: null,
      qualityDecision: null,
      qualityDecisionNotes: '',
      certifierName: null,
      certifiedAt: null
    };

    const updatedLabSamples = [newSample, ...labSamples];
    setLabSamples(updatedLabSamples);
    honeyDatabaseGateway.saveTable(TABLE_NAMES.LAB_SAMPLES, updatedLabSamples);

    setLabAuditLog(prev => [
      {
        id: `lal-${Date.now()}`,
        timestamp: formattedTimestamp,
        sampleId: newSampleId,
        testId: null,
        action: 'SAMPLE_RECEIVED',
        actor: activeOperator,
        details: `Sample ${newSampleId} received from batch ${sourceBatchNumber} (${quantityMl} mL)`,
        previousState: SAMPLE_STATUSES.AWAITING_INTAKE,
        newState: SAMPLE_STATUSES.RECEIVED
      },
      ...prev
    ]);

    showToast(`Sample ${newSampleId} received and registered`);
    return { success: true, sample: newSample };
  };

  // Accept a sample into active laboratory custody
  const acceptSampleIntake = ({
    sampleId,
    verifiedStorageLocation = null,
    operator = null,
    remarks = ''
  }) => {
    const activeOperator = operator || session?.operator || 'Elena Vance';
    const sample = labSamples.find(s => s.id === sampleId);
    if (!sample) return { success: false, errors: ['Sample not found.'] };

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const storage = verifiedStorageLocation || sample.storageLocation || 'Specimen Cabinet A · Shelf 01';

    const updatedSample = {
      ...sample,
      intakeStatus: SAMPLE_STATUSES.ACCEPTED,
      acceptedAt: nowIso,
      acceptedBy: activeOperator,
      storageLocation: storage,
      remarks: remarks ? `${sample.remarks ? sample.remarks + ' | ' : ''}${remarks}` : sample.remarks,
      chainOfCustody: [
        ...sample.chainOfCustody,
        {
          timestamp: nowIso,
          action: 'Sample Accepted & Logged into Custody',
          from: 'Lab Intake Station',
          to: storage,
          actor: activeOperator,
          reason: 'Tamper seal and volume verified',
          condition: sample.sealCondition || 'Verified intact'
        }
      ]
    };

    const updatedLabSamples = labSamples.map(s => s.id === sampleId ? updatedSample : s);
    setLabSamples(updatedLabSamples);
    honeyDatabaseGateway.saveTable(TABLE_NAMES.LAB_SAMPLES, updatedLabSamples);

    setLabAuditLog(prev => [
      {
        id: `lal-${Date.now()}`,
        timestamp: formattedTimestamp,
        sampleId,
        testId: null,
        action: 'SAMPLE_ACCEPTED',
        actor: activeOperator,
        details: `Sample ${sampleId} accepted into laboratory custody at ${storage}`,
        previousState: sample.intakeStatus,
        newState: SAMPLE_STATUSES.ACCEPTED
      },
      ...prev
    ]);

    showToast(`Sample ${sampleId} accepted into custody`);
    return { success: true, sample: updatedSample };
  };

  // Reject a sample (Reason + remarks mandatory)
  const rejectSampleIntake = ({
    sampleId,
    reason,
    remarks,
    operator = null
  }) => {
    const activeOperator = operator || session?.operator || 'Elena Vance';
    const sample = labSamples.find(s => s.id === sampleId);
    if (!sample) return { success: false, errors: ['Sample not found.'] };

    const validation = validateSampleRejection({ reason, remarks });
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedSample = {
      ...sample,
      intakeStatus: SAMPLE_STATUSES.REJECTED,
      rejectionReason: reason,
      rejectionRemarks: remarks,
      rejectedAt: nowIso,
      rejectedBy: activeOperator,
      chainOfCustody: [
        ...sample.chainOfCustody,
        {
          timestamp: nowIso,
          action: 'Sample Rejected at Intake',
          from: sample.storageLocation,
          to: 'Quarantine / Discard Staging',
          actor: activeOperator,
          reason: `Rejected: ${reason} - ${remarks}`,
          condition: 'Rejected'
        }
      ]
    };

    const updatedLabSamples = labSamples.map(s => s.id === sampleId ? updatedSample : s);
    setLabSamples(updatedLabSamples);
    honeyDatabaseGateway.saveTable(TABLE_NAMES.LAB_SAMPLES, updatedLabSamples);

    setLabAuditLog(prev => [
      {
        id: `lal-${Date.now()}`,
        timestamp: formattedTimestamp,
        sampleId,
        testId: null,
        action: 'SAMPLE_REJECTED',
        actor: activeOperator,
        details: `Sample ${sampleId} rejected. Reason: ${reason} (${remarks})`,
        previousState: sample.intakeStatus,
        newState: SAMPLE_STATUSES.REJECTED
      },
      ...prev
    ]);

    showToast(`Sample ${sampleId} rejected: ${reason}`);
    return { success: true, sample: updatedSample };
  };

  // Place sample on hold
  const putSampleOnHold = ({
    sampleId,
    reason,
    remarks,
    operator = null
  }) => {
    const activeOperator = operator || session?.operator || 'Elena Vance';
    const sample = labSamples.find(s => s.id === sampleId);
    if (!sample) return { success: false, errors: ['Sample not found.'] };

    if (!reason || !remarks || remarks.trim().length < 5) {
      return { success: false, errors: ['Hold reason and remarks (minimum 5 chars) are mandatory.'] };
    }

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedSample = {
      ...sample,
      intakeStatus: SAMPLE_STATUSES.ON_HOLD,
      holdReason: reason,
      holdRemarks: remarks,
      chainOfCustody: [
        ...sample.chainOfCustody,
        {
          timestamp: nowIso,
          action: 'Placed on Analytical Hold',
          from: sample.storageLocation,
          to: 'Quarantine Holding Cabinet Q-1',
          actor: activeOperator,
          reason: `Hold: ${reason} - ${remarks}`,
          condition: 'Quarantine'
        }
      ]
    };

    const updatedLabSamples = labSamples.map(s => s.id === sampleId ? updatedSample : s);
    setLabSamples(updatedLabSamples);
    honeyDatabaseGateway.saveTable(TABLE_NAMES.LAB_SAMPLES, updatedLabSamples);

    setLabAuditLog(prev => [
      {
        id: `lal-${Date.now()}`,
        timestamp: formattedTimestamp,
        sampleId,
        testId: null,
        action: 'SAMPLE_HELD',
        actor: activeOperator,
        details: `Sample ${sampleId} placed on hold. Reason: ${reason}`,
        previousState: sample.intakeStatus,
        newState: SAMPLE_STATUSES.ON_HOLD
      },
      ...prev
    ]);

    showToast(`Sample ${sampleId} placed on hold`);
    return { success: true, sample: updatedSample };
  };

  // Assign a test to sample
  const assignLabTest = ({
    sampleId,
    testKey,
    priority = TEST_PRIORITIES.ROUTINE,
    assignedAnalyst = null,
    dueDate = null,
    customMethod = null,
    equipmentId = null
  }) => {
    const activeAnalyst = assignedAnalyst || session?.operator || 'Elena Vance';
    const validation = validateTestAssignment({
      sampleId,
      testKey,
      priority,
      assignedAnalyst: activeAnalyst
    });

    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const testDef = LAB_TEST_CATALOG[testKey];
    const newTestId = generateTestId(labTests);
    const equip = LAB_EQUIPMENT_CATALOG.find(e => e.id === (equipmentId || testDef.recommendedEquipment));

    const newTest = {
      id: newTestId,
      sampleId,
      testKey,
      testName: testDef.name,
      category: testDef.category,
      method: customMethod || testDef.standardMethod,
      priority,
      assignedAnalyst: activeAnalyst,
      dueDate: dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: TEST_STATUSES.ASSIGNED,
      equipmentId: equip?.id || null,
      equipmentName: equip?.name || null,
      operator: null,
      startedAt: null,
      completedAt: null,
      rawMeasurement: null,
      result: null,
      unit: testDef.unit,
      referenceStandard: testDef.referenceLimitText,
      isWithinSpecification: null,
      evidenceFile: null,
      evidenceType: null,
      remarks: '',
      reviewStatus: REVIEW_STATUSES.DRAFT,
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: '',
      corrections: []
    };

    setLabTests(prev => [newTest, ...prev]);

    // Update sample state to TEST_ASSIGNED if in ACCEPTED
    setLabSamples(prev => prev.map(s => {
      if (s.id === sampleId && (s.intakeStatus === SAMPLE_STATUSES.ACCEPTED || s.intakeStatus === SAMPLE_STATUSES.RECEIVED)) {
        return { ...s, intakeStatus: SAMPLE_STATUSES.TEST_ASSIGNED };
      }
      return s;
    }));

    setLabAuditLog(prev => [
      {
        id: `lal-${Date.now()}`,
        timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sampleId,
        testId: newTestId,
        action: 'TEST_ASSIGNED',
        actor: activeAnalyst,
        details: `Assigned test ${testDef.shortName} (${testDef.unit}) to ${sampleId}`,
        previousState: 'UNASSIGNED',
        newState: TEST_STATUSES.ASSIGNED
      },
      ...prev
    ]);

    showToast(`Test ${testDef.shortName} assigned to ${sampleId}`);
    return { success: true, test: newTest };
  };

  // Start test execution
  const startLabTest = ({ testId, equipmentId = null, operator = null }) => {
    const activeOperator = operator || session?.operator || 'Elena Vance';
    const test = labTests.find(t => t.id === testId);
    if (!test) return { success: false, errors: ['Test not found.'] };

    const equip = LAB_EQUIPMENT_CATALOG.find(e => e.id === equipmentId) ||
      LAB_EQUIPMENT_CATALOG.find(e => e.id === test.equipmentId);

    const nowIso = new Date().toISOString();
    const updatedTest = {
      ...test,
      status: TEST_STATUSES.IN_PROGRESS,
      equipmentId: equip?.id || test.equipmentId,
      equipmentName: equip?.name || test.equipmentName,
      operator: activeOperator,
      startedAt: nowIso
    };

    setLabTests(prev => prev.map(t => t.id === testId ? updatedTest : t));

    // Update parent sample state to IN_TESTING
    setLabSamples(prev => prev.map(s => {
      if (s.id === test.sampleId && s.intakeStatus !== SAMPLE_STATUSES.IN_TESTING) {
        return { ...s, intakeStatus: SAMPLE_STATUSES.IN_TESTING };
      }
      return s;
    }));

    showToast(`Started ${test.testName}`);
    return { success: true, test: updatedTest };
  };

  // -------------------------------------------------------------
  // SEND LAB REPORT & CERTIFICATE OF ANALYSIS TO PROCESSOR & DISPATCH
  // Dual-Dispatch Engine: Automatically transmits authoritative CoA and clearance to both
  // 1. Processor Unit (marks batch Quality Certified, attaches CoA, records audit trail)
  // 2. Dispatch Unit (marks consumer packages APPROVED & READY_FOR_DISPATCH, embeds CoA & tamper seals)
  // -------------------------------------------------------------
  const sendLabReportToProcessorAndDispatch = ({
    sampleId,
    reportId = null,
    report = null,
    signatoryName = null,
    notes = '',
    decision = 'RELEASED_FOR_BOTTLING',
    completedTests = null
  }) => {
    let sample = labSamples.find(s => s.id === sampleId);
    if (!sample && report?.sample?.id) {
      sample = labSamples.find(s => s.id === report.sample.id);
    }
    if (!sample && report?.sample?.sourceBatch) {
      sample = labSamples.find(s => s.sourceBatchNumber === report.sample.sourceBatch || s.batchNumber === report.sample.sourceBatch);
    }
    if (!sample) {
      // Create resilient fallback sample if not yet existing
      const fallbackBatch = processingBatches[0];
      sample = {
        id: sampleId || report?.sample?.id || `LS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        sourceBatchNumber: report?.sample?.sourceBatch || fallbackBatch?.batchNumber || 'PB-2026-00041',
        sourceBatchId: fallbackBatch?.id || 'pb-current',
        containerType: 'Aseptic Sample Jar',
        quantityMl: 250,
        sealCondition: 'Tamper-Evident Intact',
        intakeStatus: SAMPLE_STATUSES.COMPLETED
      };
    }

    const relatedTests = (completedTests && completedTests.length > 0)
      ? completedTests
      : labTests.filter(t => t.sampleId === sample.id && (t.status === TEST_STATUSES.COMPLETED || t.status === 'COMPLETED'));

    const activeSignatory = signatoryName || report?.signatory?.name || session?.operator || session?.name || 'Dr. Elena Vance (Lead Chemist)';
    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Format or use the official Certificate of Analysis
    const finalizedReport = report || CentralizedReportingService.formatLabCoAReport({
      reportId: reportId || `LAB-CoA-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      sample,
      tests: relatedTests,
      labDetails: {
        name: 'Apex Honey Analytical Laboratory',
        accreditationRef: 'NABL ISO/IEC 17025 (TC-8841)',
        fssaiRef: 'FL-2026-TN-09'
      },
      signatory: {
        name: activeSignatory,
        role: 'Chief Analytical Chemist'
      },
      version: 1
    });

    // 2. Persist in labReports state and HoneyDatabaseGateway
    setLabReports(prev => {
      const filtered = (prev || []).filter(r => r.documentId !== finalizedReport.documentId);
      const updated = [finalizedReport, ...filtered];
      honeyDatabaseGateway.saveTable(TABLE_NAMES.LAB_REPORTS, updated);
      return updated;
    });

    // 3. Update lab sample status
    const updatedSample = {
      ...sample,
      intakeStatus: SAMPLE_STATUSES.COMPLETED,
      qualityRecommendation: sample.qualityRecommendation || 'SUITABLE_FOR_BOTTLING',
      labReport: finalizedReport,
      coaDocumentId: finalizedReport.documentId,
      qualityDecision: decision,
      qualityDecisionNotes: notes || finalizedReport.complianceSummary,
      certifierName: activeSignatory,
      certifiedAt: nowIso
    };
    const updatedLabSamples = labSamples.some(s => s.id === sample.id)
      ? labSamples.map(s => s.id === sample.id ? updatedSample : s)
      : [updatedSample, ...labSamples];
    setLabSamples(updatedLabSamples);
    honeyDatabaseGateway.saveTable(TABLE_NAMES.LAB_SAMPLES, updatedLabSamples);

    // 4. DELIVER TO PROCESSOR UNIT
    const batchNum = sample.sourceBatchNumber || sample.batchNumber || report?.sample?.sourceBatch;
    const batchId = sample.sourceBatchId || sample.batchId;
    let targetBatch = processingBatches.find(b =>
      (batchNum && b.batchNumber === batchNum) ||
      (batchId && b.id === batchId) ||
      (batchNum && b.batchNumber && b.batchNumber.toLowerCase() === batchNum.toLowerCase()) ||
      (batchNum && b.name && b.name.toLowerCase().includes(batchNum.toLowerCase()))
    );

    if (!targetBatch) {
      targetBatch = processingBatches.find(b =>
        b.status === BATCH_STATUSES.SUBMITTED_TO_QUALITY ||
        b.status === BATCH_STATUSES.READY_FOR_QUALITY ||
        b.status === BATCH_STATUSES.PROCESSING_COMPLETE
      ) || (processingBatches.length > 0 ? processingBatches[0] : null);
    }

    if (targetBatch) {
      const updatedBatch = {
        ...targetBatch,
        status: BATCH_STATUSES.QUALITY_PASSED,
        statusLabel: BATCH_STATUS_LABELS.QUALITY_PASSED || 'Quality Certified',
        qualityStatus: 'CERTIFIED',
        labReport: finalizedReport,
        coaDocumentId: finalizedReport.documentId,
        certifiedAt: nowIso,
        certifierName: activeSignatory,
        complianceSummary: finalizedReport.complianceSummary,
        qualityHandoffNotes: notes || `Analytical CoA received from ${finalizedReport.lab?.name || 'Analytical Laboratory'}. Conforming to FSSAI/Agmark specifications.`,
        lastUpdated: 'Just now'
      };

      const updatedBatches = processingBatches.map(b => b.id === targetBatch.id ? updatedBatch : b);
      setProcessingBatches(updatedBatches);
      honeyDatabaseGateway.saveTable(TABLE_NAMES.PROCESSING_BATCHES, updatedBatches);

      const procAudit = {
        id: `proc-aud-${Date.now()}`,
        timestamp: formattedTimestamp,
        batchNumber: targetBatch.batchNumber,
        action: 'LAB_REPORT_RECEIVED',
        title: 'Laboratory CoA Received & Verified',
        details: `Official Certificate of Analysis ${finalizedReport.documentId} received from Laboratory. Compliance: ${finalizedReport.complianceSummary}. Batch certified for packaging & release.`,
        operator: activeSignatory,
        facility: targetBatch.facility
      };
      setProcessingAuditLog(prev => [procAudit, ...prev]);
    } else {
      // Create certified batch if processor had no batches yet
      const fallbackBatchNumber = batchNum || 'PB-2026-00041';
      const newCertifiedBatch = {
        id: `batch-${Date.now()}`,
        batchNumber: fallbackBatchNumber,
        name: `Processing Batch ${fallbackBatchNumber}`,
        honeyType: 'Wildflower Honey',
        status: BATCH_STATUSES.QUALITY_PASSED,
        statusLabel: BATCH_STATUS_LABELS.QUALITY_PASSED || 'Quality Certified',
        qualityStatus: 'CERTIFIED',
        weightKg: 50,
        finalYieldKg: 48.5,
        facility: 'Central Honey Facility Bay 2',
        sourceHarvests: [],
        labReport: finalizedReport,
        coaDocumentId: finalizedReport.documentId,
        certifiedAt: nowIso,
        certifierName: activeSignatory,
        complianceSummary: finalizedReport.complianceSummary,
        qualityHandoffNotes: notes || 'Analytical CoA verified and certified for bottling.',
        lastUpdated: 'Just now'
      };
      targetBatch = newCertifiedBatch;
      const updatedBatches = [newCertifiedBatch, ...processingBatches];
      setProcessingBatches(updatedBatches);
      honeyDatabaseGateway.saveTable(TABLE_NAMES.PROCESSING_BATCHES, updatedBatches);

      const procAudit = {
        id: `proc-aud-${Date.now()}`,
        timestamp: formattedTimestamp,
        batchNumber: targetBatch.batchNumber,
        action: 'LAB_REPORT_RECEIVED',
        title: 'Laboratory CoA Received & Verified',
        details: `Official Certificate of Analysis ${finalizedReport.documentId} received from Laboratory. Compliance: ${finalizedReport.complianceSummary}. Batch certified for packaging & release.`,
        operator: activeSignatory,
        facility: targetBatch.facility
      };
      setProcessingAuditLog(prev => [procAudit, ...prev]);
    }

    // 5. DELIVER TO DISPATCH UNIT
    const resolvedBatchNum = targetBatch?.batchNumber || batchNum || 'PB-2026-00001';
    const resolvedBatchId = targetBatch?.id || batchId || 'pb-current';
    const existingPkgs = dispatchPackages.filter(p => p.batchNumber === resolvedBatchNum || p.batchId === resolvedBatchId);

    let updatedPackages = [...dispatchPackages];
    if (existingPkgs.length > 0) {
      updatedPackages = dispatchPackages.map(p => {
        if (p.batchNumber === resolvedBatchNum || p.batchId === resolvedBatchId) {
          return {
            ...p,
            qualityStatus: 'APPROVED',
            status: PACKAGE_STATUSES.READY_FOR_DISPATCH,
            labReport: finalizedReport,
            coaDocumentId: finalizedReport.documentId,
            labCertifiedAt: nowIso
          };
        }
        return p;
      });
    } else {
      const netKg = Number(targetBatch?.finalYieldKg || targetBatch?.weightKg || 4.8);
      const totalUnits = Math.max(2, Math.round(netKg / 0.5));
      const cleanBatchSuffix = String(resolvedBatchNum).replace(/[^a-zA-Z0-9]/g, '').slice(-5);

      const newPackages = Array.from({ length: totalUnits }).map((_, i) => {
        const seq = String(100 + i + 1);
        const pkgId = `PKG-2026-${cleanBatchSuffix}-${seq}`;
        return {
          id: `pkg-${Date.now()}-${i}`,
          packageId: pkgId,
          productName: `${targetBatch?.honeyType || 'Wildflower'} Honey (Certified)`,
          unitGrams: 500,
          unitDisplay: '500 g Glass Jar',
          qrId: `QR-${pkgId}`,
          status: PACKAGE_STATUSES.READY_FOR_DISPATCH,
          qualityStatus: 'APPROVED',
          batchId: resolvedBatchId,
          batchNumber: resolvedBatchNum,
          sourceTraceabilityCodes: sample.sourceTraceabilityCodes || [],
          labReport: finalizedReport,
          coaDocumentId: finalizedReport.documentId,
          tamperSealId: `HC-SEAL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          labCertifiedAt: nowIso,
          createdDate: new Date().toISOString().split('T')[0]
        };
      });
      updatedPackages = [...newPackages, ...dispatchPackages];
    }

    setDispatchPackages(updatedPackages);
    honeyDatabaseGateway.saveTable(TABLE_NAMES.DISPATCH_PACKAGES, updatedPackages);

    const dispatchAudit = {
      id: `dal-${Date.now()}`,
      timestamp: formattedTimestamp,
      packageId: `Batch-${resolvedBatchNum}`,
      action: 'LAB_COA_LINKED',
      actor: activeSignatory,
      details: `Lab Certificate of Analysis ${finalizedReport.documentId} linked to Batch ${resolvedBatchNum}. Packaging inventory unlocked for dispatch order allocation.`
    };
    setDispatchAuditLog(prev => [dispatchAudit, ...prev]);

    // 6. LAB AUDIT ENTRY
    setLabAuditLog(prev => [
      {
        id: `lal-${Date.now()}`,
        timestamp: formattedTimestamp,
        sampleId,
        testId: null,
        action: 'COA_DISPATCHED_TO_PROCESSOR_AND_DISPATCH',
        actor: activeSignatory,
        details: `Certificate of Analysis ${finalizedReport.documentId} transmitted to Processor Facility and Dispatch Distribution Unit.`,
        previousState: sample.intakeStatus,
        newState: SAMPLE_STATUSES.COMPLETED
      },
      ...prev
    ]);

    showToast(`✅ Lab Report ${finalizedReport.documentId} sent to Processor & Dispatch Unit!`);

    return {
      success: true,
      report: finalizedReport,
      batchNumber: resolvedBatchNum,
      packageCount: existingPkgs.length > 0 ? existingPkgs.length : updatedPackages.length
    };
  };

  // Record test measurement and result
  const recordTestMeasurement = ({
    testId,
    rawMeasurement,
    calculatedResult = null,
    evidenceFile = null,
    evidenceType = 'INSTRUMENT_READING',
    equipmentId = null,
    remarks = '',
    operator = null
  }) => {
    const activeOperator = operator || session?.operator || 'Elena Vance';
    const test = labTests.find(t => t.id === testId);
    if (!test) return { success: false, errors: ['Test not found.'] };

    const validation = validateTestMeasurement({
      testKey: test.testKey,
      rawMeasurement,
      equipmentId: equipmentId || test.equipmentId,
      operator: activeOperator
    });

    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const testDef = LAB_TEST_CATALOG[test.testKey];
    const numRaw = Number(rawMeasurement);
    const numCalculated = calculatedResult !== null && calculatedResult !== '' ? Number(calculatedResult) : numRaw;

    // Check specification
    let isWithinSpec = true;
    if (testDef.standardMin !== undefined && numCalculated < testDef.standardMin) isWithinSpec = false;
    if (testDef.standardMax !== undefined && numCalculated > testDef.standardMax) isWithinSpec = false;

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedTest = {
      ...test,
      status: TEST_STATUSES.COMPLETED,
      completedAt: nowIso,
      operator: activeOperator,
      rawMeasurement: numRaw,
      result: numCalculated,
      unit: testDef.unit,
      isWithinSpecification: isWithinSpec,
      evidenceFile: evidenceFile || (test.testKey === 'MOISTURE' ? 'refractometer_reading_opt.png' : 'spectrophotometer_curve.png'),
      evidenceType,
      remarks,
      reviewStatus: REVIEW_STATUSES.AWAITING_REVIEW
    };

    setLabTests(prev => prev.map(t => t.id === testId ? updatedTest : t));

    // Check if all tests for this sample are now completed
    const siblingTests = labTests.filter(t => t.sampleId === test.sampleId && t.id !== testId);
    const allSiblingsCompleted = siblingTests.every(t => t.status === TEST_STATUSES.COMPLETED);

    if (allSiblingsCompleted) {
      setLabSamples(prev => prev.map(s => {
        if (s.id === test.sampleId) {
          return { ...s, intakeStatus: SAMPLE_STATUSES.AWAITING_REVIEW };
        }
        return s;
      }));
    }

    setLabAuditLog(prev => [
      {
        id: `lal-${Date.now()}`,
        timestamp: formattedTimestamp,
        sampleId: test.sampleId,
        testId,
        action: 'MEASUREMENT_RECORDED',
        actor: activeOperator,
        details: `Recorded result ${numCalculated} ${testDef.unit} for ${test.testName} (Raw: ${numRaw})`,
        previousState: test.status,
        newState: TEST_STATUSES.COMPLETED
      },
      ...prev
    ]);

    // Dual-dispatch: Automatically deliver updated official Lab Report & CoA to Processor and Dispatch Unit
    sendLabReportToProcessorAndDispatch({
      sampleId: test.sampleId,
      signatoryName: activeOperator,
      notes: `Test completed: ${test.testName} (${numCalculated} ${testDef.unit}). Certificate of Analysis dispatched to Processor & Dispatch Unit.`,
      completedTests: [updatedTest, ...siblingTests.filter(t => t.status === TEST_STATUSES.COMPLETED || t.status === 'COMPLETED')]
    });

    showToast(`Result recorded: ${numCalculated} ${testDef.unit}`);
    return { success: true, test: updatedTest };
  };

  // Review a test result
  const reviewTestResult = ({
    testId,
    reviewAction, // 'ACCEPT' | 'REQUEST_CORRECTION' | 'REQUEST_RETEST'
    reviewNotes = '',
    reviewerName = null
  }) => {
    const activeReviewer = reviewerName || session?.operator || 'Elena Vance';
    const test = labTests.find(t => t.id === testId);
    if (!test) return { success: false, errors: ['Test not found.'] };

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let newReviewStatus = REVIEW_STATUSES.REVIEWED;
    let newTestStatus = test.status;
    let createdRetest = null;

    if (reviewAction === 'ACCEPT') {
      newReviewStatus = REVIEW_STATUSES.FINALIZED;
    } else if (reviewAction === 'REQUEST_CORRECTION') {
      newReviewStatus = REVIEW_STATUSES.CORRECTION_REQUESTED;
    } else if (reviewAction === 'REQUEST_RETEST') {
      newReviewStatus = REVIEW_STATUSES.RETEST_REQUIRED;
      newTestStatus = TEST_STATUSES.RETEST_REQUIRED;

      // Section 62: Retests do NOT overwrite the original result!
      const newRetestId = generateTestId(labTests);
      createdRetest = {
        ...test,
        id: newRetestId,
        status: TEST_STATUSES.ASSIGNED,
        rawMeasurement: null,
        result: null,
        evidenceFile: null,
        reviewStatus: REVIEW_STATUSES.DRAFT,
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: `Retest spawned from ${testId}: ${reviewNotes}`,
        remarks: `Retest execution. Original test was ${testId}.`,
        startedAt: null,
        completedAt: null,
        corrections: []
      };
    }

    const updatedTest = {
      ...test,
      status: newTestStatus,
      reviewStatus: newReviewStatus,
      reviewedBy: activeReviewer,
      reviewedAt: nowIso,
      reviewNotes
    };

    setLabTests(prev => {
      const updated = prev.map(t => t.id === testId ? updatedTest : t);
      if (createdRetest) {
        return [createdRetest, ...updated];
      }
      return updated;
    });

    setLabAuditLog(prev => [
      {
        id: `lal-${Date.now()}`,
        timestamp: formattedTimestamp,
        sampleId: test.sampleId,
        testId,
        action: `RESULT_${reviewAction}`,
        actor: activeReviewer,
        details: `Reviewed ${test.testName}: ${reviewAction}. Notes: ${reviewNotes || 'Approved without deviations.'}`,
        previousState: test.reviewStatus,
        newState: newReviewStatus
      },
      ...prev
    ]);

    showToast(`Result reviewed: ${reviewAction}`);
    return { success: true, test: updatedTest, retest: createdRetest };
  };

  // Correct a test result with mandatory audit trail
  const correctTestResult = ({
    testId,
    newValue,
    reason,
    actor = null
  }) => {
    const activeActor = actor || session?.operator || 'Elena Vance';
    const test = labTests.find(t => t.id === testId);
    if (!test) return { success: false, errors: ['Test not found.'] };

    const validation = validateResultCorrection({
      previousValue: test.result,
      newValue: Number(newValue),
      reason,
      actor: activeActor
    });

    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const testDef = LAB_TEST_CATALOG[test.testKey];
    const numNew = Number(newValue);

    let isWithinSpec = true;
    if (testDef.standardMin !== undefined && numNew < testDef.standardMin) isWithinSpec = false;
    if (testDef.standardMax !== undefined && numNew > testDef.standardMax) isWithinSpec = false;

    const correctionRecord = {
      timestamp: new Date().toISOString(),
      previousValue: test.result,
      newValue: numNew,
      reason,
      actor: activeActor
    };

    const updatedTest = {
      ...test,
      result: numNew,
      rawMeasurement: numNew,
      isWithinSpecification: isWithinSpec,
      reviewStatus: REVIEW_STATUSES.REVIEWED,
      corrections: [...(test.corrections || []), correctionRecord]
    };

    setLabTests(prev => prev.map(t => t.id === testId ? updatedTest : t));

    setLabAuditLog(prev => [
      {
        id: `lal-${Date.now()}`,
        timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sampleId: test.sampleId,
        testId,
        action: 'RESULT_CORRECTED',
        actor: activeActor,
        details: `Corrected result from ${test.result} to ${numNew} ${test.unit}. Reason: ${reason}`,
        previousState: `${test.result} ${test.unit}`,
        newState: `${numNew} ${test.unit}`
      },
      ...prev
    ]);

    showToast(`Result corrected with immutable audit record`);
    return { success: true, test: updatedTest };
  };

  // Submit Laboratory Quality Recommendation (Separate from Quality Decision)
  const submitQualityRecommendation = ({
    sampleId,
    recommendationKey,
    notes = '',
    recommenderName = null
  }) => {
    const activeRecommender = recommenderName || session?.operator || 'Elena Vance';
    const sample = labSamples.find(s => s.id === sampleId);
    if (!sample) return { success: false, errors: ['Sample not found.'] };

    if (!QUALITY_RECOMMENDATIONS[recommendationKey]) {
      return { success: false, errors: [`Unrecognized recommendation key: ${recommendationKey}`] };
    }

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedSample = {
      ...sample,
      intakeStatus: SAMPLE_STATUSES.COMPLETED,
      qualityRecommendation: recommendationKey,
      recommendationNotes: notes,
      recommenderName: activeRecommender,
      recommendedAt: nowIso
    };

    setLabSamples(prev => prev.map(s => s.id === sampleId ? updatedSample : s));

    setLabAuditLog(prev => [
      {
        id: `lal-${Date.now()}`,
        timestamp: formattedTimestamp,
        sampleId,
        testId: null,
        action: 'QUALITY_RECOMMENDATION_SUBMITTED',
        actor: activeRecommender,
        details: `Quality recommendation submitted: ${QUALITY_RECOMMENDATIONS[recommendationKey].label}. Notes: ${notes || 'Ready for formal Quality disposition.'}`,
        previousState: sample.qualityRecommendation || 'NONE',
        newState: recommendationKey
      },
      ...prev
    ]);

    showToast(`Quality recommendation submitted: ${QUALITY_RECOMMENDATIONS[recommendationKey].label}`);
    
    // Auto-deliver Lab Report & Clearance to both Processor and Dispatch Unit
    sendLabReportToProcessorAndDispatch({
      sampleId,
      notes,
      signatoryName: activeRecommender,
      decision: recommendationKey === 'SUITABLE_FOR_BOTTLING' ? 'RELEASED_FOR_BOTTLING' : 'CONDITIONAL_RELEASE'
    });

    return { success: true, sample: updatedSample };
  };

  // Execute Final Quality Decision (Strictly guarded by QUALITY_DECISION capability)
  const executeQualityDecision = ({
    sampleId,
    decisionKey, // 'RELEASED_FOR_BOTTLING' | 'REJECTED_NON_COMPLIANT' | 'CONDITIONAL_RELEASE'
    notes = '',
    certifierName = null
  }) => {
    // SECURITY GUARD: Check that the user possesses QUALITY_DECISION
    const userCaps = new Set((session?.capabilities || []).map(c => String(c).toUpperCase()));
    if (!userCaps.has('QUALITY_DECISION') && !userCaps.has('QUALITY_APPROVE') && !userCaps.has('LAB_REPORT_CERTIFY')) {
      showToast('ACCESS DENIED: Quality Decision requires authorized Quality Role.');
      return {
        success: false,
        errors: ['Unauthorized: User does not possess the privileged QUALITY_DECISION capability.']
      };
    }

    const sample = labSamples.find(s => s.id === sampleId);
    if (!sample) return { success: false, errors: ['Sample not found.'] };

    if (!QUALITY_DECISIONS[decisionKey]) {
      return { success: false, errors: [`Unrecognized quality decision: ${decisionKey}`] };
    }

    const activeCertifier = certifierName || session?.operator || 'Quality Lead';
    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedSample = {
      ...sample,
      qualityDecision: decisionKey,
      qualityDecisionNotes: notes,
      certifierName: activeCertifier,
      certifiedAt: nowIso
    };

    setLabSamples(prev => prev.map(s => s.id === sampleId ? updatedSample : s));

    setLabAuditLog(prev => [
      {
        id: `lal-${Date.now()}`,
        timestamp: formattedTimestamp,
        sampleId,
        testId: null,
        action: 'FINAL_QUALITY_DECISION',
        actor: activeCertifier,
        details: `Final Quality Decision executed: ${QUALITY_DECISIONS[decisionKey].label}. Notes: ${notes}`,
        previousState: sample.qualityDecision || 'PENDING_DECISION',
        newState: decisionKey
      },
      ...prev
    ]);

    // Transmit Lab Report & Quality Decision to both Processor and Dispatch Unit
    sendLabReportToProcessorAndDispatch({
      sampleId,
      notes,
      signatoryName: activeCertifier,
      decision: decisionKey
    });

    showToast(`Final Quality Decision: ${QUALITY_DECISIONS[decisionKey].label}`);
    return { success: true, sample: updatedSample };
  };

  // (sendLabReportToProcessorAndDispatch is centrally defined above recordTestMeasurement)

  // =========================================================================
  // MASTER DISPATCH & DISTRIBUTOR DOMAIN LIFECYCLE
  // =========================================================================

  /**
   * 1. Final Physical QR Code Validation Engine (§ 4, 5, 6, 7, 8, 9, 23, 26)
   * Answers: "Does the physical QR present on this package resolve to the exact package being dispatched?"
   */
  const validatePackageQr = ({
    scannedPayload,
    targetPackageId = null,
    activeShipmentId = null,
    operator = null
  }) => {
    const activeOperator = operator || session?.operator || session?.name || 'Jordan Hayes (Dispatch Lead)';
    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Enforce Capability Check (§ 36, 38: PACKAGE_QR_VALIDATE)
    const userCaps = new Set((session?.capabilities || []).map(c => String(c).toUpperCase()));
    if (!userCaps.has('PACKAGE_QR_VALIDATE') && !userCaps.has('DISTRIBUTION_WORKSPACE') && !userCaps.has('DISPATCH_PLANNING')) {
      showToast('ACCESS RESTRICTED: Requires PACKAGE_QR_VALIDATE capability.');
      return {
        isValid: false,
        state: QR_VALIDATION_STATES.INVALID,
        reason: 'Unauthorized: User does not possess PACKAGE_QR_VALIDATE capability.'
      };
    }

    const validationResult = validateScannedQr({
      scannedPayload,
      targetPackageId,
      activeShipmentId,
      packages: dispatchPackages,
      revokedQrs,
      shipments: dispatchShipments,
      auditLog: dispatchAuditLog
    });

    const targetPkg = validationResult.package;

    // Record Immutable Audit Log (§ 26)
    const auditRecord = {
      id: `dal-${Date.now()}`,
      timestamp: formattedTimestamp,
      action: 'PACKAGE_QR_SCANNED',
      entityId: targetPkg?.packageId || scannedPayload,
      entityType: 'PACKAGE',
      shipmentId: activeShipmentId,
      actor: activeOperator,
      result: validationResult.state,
      details: validationResult.reason
    };
    setDispatchAuditLog(prev => [auditRecord, ...prev]);

    if (!validationResult.isValid) {
      showToast(`${QR_STATE_DETAILS[validationResult.state]?.label || 'QR Rejected'}: ${validationResult.reason}`);
      return validationResult;
    }

    // Success: Update Package Validation State
    const updatedPackage = {
      ...targetPkg,
      isQrValidated: true,
      validatedAt: nowIso,
      validatedBy: activeOperator,
      lastValidatedShipmentId: activeShipmentId
    };

    setDispatchPackages(prev => prev.map(p => p.packageId === targetPkg.packageId ? updatedPackage : p));

    // If linked to active shipment, record validation in shipment record
    if (activeShipmentId) {
      setDispatchShipments(prev => prev.map(s => {
        if (s.id === activeShipmentId) {
          const existing = (s.validatedPackages || []).filter(vp => vp.packageId !== targetPkg.packageId);
          return {
            ...s,
            validatedPackages: [
              ...existing,
              {
                packageId: targetPkg.packageId,
                qrId: targetPkg.qrId,
                validatedAt: nowIso,
                validatedBy: activeOperator
              }
            ]
          };
        }
        return s;
      }));
    }

    showToast(`QR Validated: ${targetPkg.packageId} (${targetPkg.productName})`);
    return {
      ...validationResult,
      package: updatedPackage
    };
  };

  /**
   * 2. Create Dispatch Shipment (§ 18, 19, 20)
   */
  const createDispatchShipment = ({
    destination,
    destinationAddress = '',
    recipientName = '',
    recipientContact = '',
    carrier = 'Cascade Cold Logistics',
    transportMethod = 'Refrigerated Transport (18°C Controlled)',
    driverName = '',
    driverPhone = '',
    vehiclePlate = '',
    plannedPickup = 'Today · 02:00 PM',
    expectedDelivery = 'Today · 06:00 PM',
    remarks = '',
    packageIds = [],
    operator = null
  }) => {
    const activeOperator = operator || session?.operator || session?.name || 'Jordan Hayes';
    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!destination || !destination.trim()) {
      return { success: false, errors: ['Destination is required.'] };
    }

    const newShipmentId = generateShipmentId(dispatchShipments);
    const consignmentCode = `DSP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    const newShipment = {
      id: newShipmentId,
      consignmentCode,
      destination: destination.trim(),
      destinationAddress: destinationAddress.trim() || destination.trim(),
      recipientName: recipientName.trim() || 'Logistics Inbound Team',
      recipientContact: recipientContact.trim() || 'logistics@recipient.example',
      carrier: carrier.trim(),
      transportMethod: transportMethod.trim(),
      driverName: driverName.trim() || 'Assigned Driver',
      driverPhone: driverPhone.trim(),
      vehiclePlate: vehiclePlate.trim(),
      status: SHIPMENT_STATUSES.READY,
      allocatedPackageIds: packageIds,
      validatedPackages: [],
      plannedPickup,
      expectedDelivery,
      trackingNumber: `TRK-${newShipmentId.replace('SHP-', '')}`,
      remarks,
      createdAt: nowIso,
      releasedAt: null,
      releasedBy: null,
      pickedUpAt: null,
      deliveredAt: null,
      deliveryProof: null,
      exceptions: []
    };

    setDispatchShipments(prev => [newShipment, ...prev]);

    // Mark allocated packages as ALLOCATED
    if (packageIds.length > 0) {
      setDispatchPackages(prev => prev.map(p => {
        if (packageIds.includes(p.packageId)) {
          return {
            ...p,
            status: PACKAGE_STATUSES.ALLOCATED,
            assignedShipmentId: newShipmentId
          };
        }
        return p;
      }));
    }

    // Audit log
    setDispatchAuditLog(prev => [
      {
        id: `dal-${Date.now()}`,
        timestamp: formattedTimestamp,
        action: 'SHIPMENT_CREATED',
        entityId: newShipmentId,
        entityType: 'SHIPMENT',
        shipmentId: newShipmentId,
        actor: activeOperator,
        result: 'SUCCESS',
        details: `Shipment created for ${destination}. ${packageIds.length} packages allocated.`
      },
      ...prev
    ]);

    showToast(`Shipment ${newShipmentId} created successfully`);
    return { success: true, shipment: newShipment };
  };

  /**
   * 3. Allocate / Deallocate Package to Shipment (§ 51)
   */
  const allocatePackageToShipment = ({ packageId, shipmentId, operator = null }) => {
    const activeOperator = operator || session?.operator || session?.name || 'Jordan Hayes';
    const pkg = dispatchPackages.find(p => p.packageId === packageId);
    const shipment = dispatchShipments.find(s => s.id === shipmentId);

    if (!pkg || !shipment) {
      return { success: false, errors: ['Package or shipment not found.'] };
    }

    if (pkg.assignedShipmentId && pkg.assignedShipmentId !== shipmentId) {
      return {
        success: false,
        errors: [`Package ${packageId} is already allocated to shipment ${pkg.assignedShipmentId}.`]
      };
    }

    setDispatchPackages(prev => prev.map(p => p.packageId === packageId ? {
      ...p,
      status: PACKAGE_STATUSES.ALLOCATED,
      assignedShipmentId: shipmentId
    } : p));

    setDispatchShipments(prev => prev.map(s => {
      if (s.id === shipmentId) {
        const allocated = s.allocatedPackageIds.includes(packageId)
          ? s.allocatedPackageIds
          : [...s.allocatedPackageIds, packageId];
        return { ...s, allocatedPackageIds: allocated };
      }
      return s;
    }));

    setDispatchAuditLog(prev => [
      {
        id: `dal-${Date.now()}`,
        timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        packageId,
        shipmentId,
        action: 'PACKAGE_ALLOCATED',
        actor: activeOperator,
        details: `Package ${packageId} allocated to shipment ${shipmentId}`
      },
      ...prev
    ]);

    showToast(`Package ${packageId} allocated to ${shipmentId}`);
    return { success: true };
  };

  const removePackageFromShipment = ({ packageId, shipmentId }) => {
    setDispatchPackages(prev => prev.map(p => p.packageId === packageId ? {
      ...p,
      status: PACKAGE_STATUSES.READY_FOR_DISPATCH,
      assignedShipmentId: null,
      isQrValidated: false
    } : p));

    setDispatchShipments(prev => prev.map(s => {
      if (s.id === shipmentId) {
        return {
          ...s,
          allocatedPackageIds: s.allocatedPackageIds.filter(id => id !== packageId),
          validatedPackages: (s.validatedPackages || []).filter(vp => vp.packageId !== packageId)
        };
      }
      return s;
    }));

    showToast(`Package ${packageId} removed from ${shipmentId}`);
    return { success: true };
  };

  /**
   * 4. Release Shipment (§ 21, 22: Check all packages validated before release)
   */
  const releaseDispatchShipment = ({ shipmentId, operator = null }) => {
    const activeOperator = operator || session?.operator || session?.name || 'Jordan Hayes';
    const shipment = dispatchShipments.find(s => s.id === shipmentId);

    if (!shipment) return { success: false, errors: ['Shipment not found.'] };

    const validationCheck = validateShipmentRelease({
      shipment,
      packages: dispatchPackages,
      userCapabilities: session?.capabilities || []
    });

    if (!validationCheck.isEligible) {
      showToast(`Cannot release shipment: ${validationCheck.errors[0]}`);
      return { success: false, errors: validationCheck.errors };
    }

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedShipment = {
      ...shipment,
      status: SHIPMENT_STATUSES.READY_FOR_PICKUP,
      releasedAt: nowIso,
      releasedBy: activeOperator
    };

    setDispatchShipments(prev => prev.map(s => s.id === shipmentId ? updatedShipment : s));

    // Update allocated packages to DISPATCHED
    setDispatchPackages(prev => prev.map(p => {
      if (shipment.allocatedPackageIds.includes(p.packageId)) {
        return {
          ...p,
          status: PACKAGE_STATUSES.DISPATCHED
        };
      }
      return p;
    }));

    setDispatchAuditLog(prev => [
      {
        id: `dal-${Date.now()}`,
        timestamp: formattedTimestamp,
        action: 'SHIPMENT_RELEASED',
        entityId: shipmentId,
        entityType: 'SHIPMENT',
        shipmentId,
        actor: activeOperator,
        result: 'SUCCESS',
        details: `Shipment ${shipmentId} released for carrier pickup. All ${validationCheck.allocatedCount} packages verified.`
      },
      ...prev
    ]);

    showToast(`Shipment ${shipmentId} released for pickup`);
    return { success: true, shipment: updatedShipment };
  };

  /**
   * 5. Update Shipment Status Transition (§ 20)
   */
  const updateShipmentStatus = ({ shipmentId, targetStatus, operator = null, notes = '' }) => {
    const activeOperator = operator || session?.operator || session?.name || 'Jordan Hayes';
    const shipment = dispatchShipments.find(s => s.id === shipmentId);
    if (!shipment) return { success: false, errors: ['Shipment not found.'] };

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let pickedUpAt = shipment.pickedUpAt;
    let deliveredAt = shipment.deliveredAt;

    if (targetStatus === SHIPMENT_STATUSES.PICKED_UP || targetStatus === SHIPMENT_STATUSES.IN_TRANSIT) {
      if (!pickedUpAt) pickedUpAt = nowIso;
    }

    const updatedShipment = {
      ...shipment,
      status: targetStatus,
      pickedUpAt,
      deliveredAt
    };

    setDispatchShipments(prev => prev.map(s => s.id === shipmentId ? updatedShipment : s));

    // Update package statuses to match shipment
    if (targetStatus === SHIPMENT_STATUSES.IN_TRANSIT || targetStatus === SHIPMENT_STATUSES.OUT_FOR_DELIVERY) {
      setDispatchPackages(prev => prev.map(p => {
        if (shipment.allocatedPackageIds.includes(p.packageId)) {
          return { ...p, status: PACKAGE_STATUSES.IN_TRANSIT };
        }
        return p;
      }));
    }

    setDispatchAuditLog(prev => [
      {
        id: `dal-${Date.now()}`,
        timestamp: formattedTimestamp,
        action: `SHIPMENT_${targetStatus}`,
        entityId: shipmentId,
        entityType: 'SHIPMENT',
        shipmentId,
        actor: activeOperator,
        result: targetStatus,
        details: `Shipment moved to ${SHIPMENT_STATUS_LABELS[targetStatus] || targetStatus}. ${notes}`
      },
      ...prev
    ]);

    showToast(`Shipment status: ${SHIPMENT_STATUS_LABELS[targetStatus] || targetStatus}`);
    return { success: true, shipment: updatedShipment };
  };

  /**
   * 6. Delivery Confirmation with Proof of Delivery (§ 29, 30)
   */
  const recordDeliveryConfirmation = ({
    shipmentId,
    recipientName = '',
    podType = 'SIGNATURE',
    podEvidence = 'sig_confirmation.png',
    notes = '',
    operator = null
  }) => {
    const activeOperator = operator || session?.operator || session?.name || 'Driver Liam Carter';
    const shipment = dispatchShipments.find(s => s.id === shipmentId);
    if (!shipment) return { success: false, errors: ['Shipment not found.'] };

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const proof = {
      type: podType,
      recipientName: recipientName || shipment.recipientName,
      evidenceFile: podEvidence,
      timestamp: nowIso,
      notes: notes || 'Delivery completed with physical customer confirmation.'
    };

    const updatedShipment = {
      ...shipment,
      status: SHIPMENT_STATUSES.DELIVERED,
      deliveredAt: nowIso,
      deliveryProof: proof
    };

    setDispatchShipments(prev => prev.map(s => s.id === shipmentId ? updatedShipment : s));

    // Update packages to DELIVERED
    setDispatchPackages(prev => prev.map(p => {
      if (shipment.allocatedPackageIds.includes(p.packageId)) {
        return {
          ...p,
          status: PACKAGE_STATUSES.DELIVERED,
          deliveredAt: nowIso
        };
      }
      return p;
    }));

    setDispatchAuditLog(prev => [
      {
        id: `dal-${Date.now()}`,
        timestamp: formattedTimestamp,
        action: 'DELIVERY_CONFIRMED',
        entityId: shipmentId,
        entityType: 'SHIPMENT',
        shipmentId,
        actor: activeOperator,
        result: 'DELIVERED',
        details: `Delivered to ${proof.recipientName}. Proof type: ${podType}.`
      },
      ...prev
    ]);

    showToast(`Shipment ${shipmentId} marked as DELIVERED`);
    return { success: true, shipment: updatedShipment };
  };

  /**
   * 7. Record Delivery Exception (§ 28)
   */
  const recordDeliveryException = ({
    shipmentId,
    exceptionType = 'OTHER',
    remarks = '',
    evidence = 'exception_photo.png',
    operator = null
  }) => {
    const activeOperator = operator || session?.operator || session?.name || 'Driver Liam Carter';
    const shipment = dispatchShipments.find(s => s.id === shipmentId);
    if (!shipment) return { success: false, errors: ['Shipment not found.'] };

    if (!remarks || remarks.trim().length < 5) {
      return { success: false, errors: ['Descriptive remarks (minimum 5 chars) are required for delivery exceptions.'] };
    }

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newException = {
      id: `EXC-${Date.now()}`,
      type: exceptionType,
      timestamp: nowIso,
      operator: activeOperator,
      remarks,
      evidenceFile: evidence
    };

    const updatedShipment = {
      ...shipment,
      status: SHIPMENT_STATUSES.DELIVERY_EXCEPTION,
      exceptions: [newException, ...(shipment.exceptions || [])]
    };

    setDispatchShipments(prev => prev.map(s => s.id === shipmentId ? updatedShipment : s));

    setDispatchAuditLog(prev => [
      {
        id: `dal-${Date.now()}`,
        timestamp: formattedTimestamp,
        action: 'DELIVERY_EXCEPTION_LOGGED',
        entityId: shipmentId,
        entityType: 'SHIPMENT',
        shipmentId,
        actor: activeOperator,
        result: exceptionType,
        details: `Exception reported: ${DELIVERY_EXCEPTION_TYPES[exceptionType]?.label || exceptionType}. ${remarks}`
      },
      ...prev
    ]);

    showToast(`Delivery Exception recorded: ${DELIVERY_EXCEPTION_TYPES[exceptionType]?.label || exceptionType}`);
    return { success: true, shipment: updatedShipment };
  };

  /**
   * 8. Record Return Request Lifecycle (§ 31)
   * DELIVERED → RETURN_REQUESTED → RETURN_IN_TRANSIT → RETURNED
   */
  const recordReturnRequest = ({
    shipmentId,
    packageId = null,
    reason = '',
    remarks = '',
    operator = null
  }) => {
    const activeOperator = operator || session?.operator || session?.name || 'Jordan Hayes';
    const shipment = dispatchShipments.find(s => s.id === shipmentId);
    if (!shipment) return { success: false, errors: ['Shipment not found.'] };

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedShipment = {
      ...shipment,
      status: SHIPMENT_STATUSES.RETURNED,
      returnDetails: {
        reason,
        remarks,
        requestedAt: nowIso,
        operator: activeOperator
      }
    };

    setDispatchShipments(prev => prev.map(s => s.id === shipmentId ? updatedShipment : s));

    if (packageId) {
      setDispatchPackages(prev => prev.map(p => p.packageId === packageId ? {
        ...p,
        status: PACKAGE_STATUSES.RETURNED
      } : p));
    }

    setDispatchAuditLog(prev => [
      {
        id: `dal-${Date.now()}`,
        timestamp: formattedTimestamp,
        action: 'SHIPMENT_RETURNED',
        entityId: shipmentId,
        entityType: 'SHIPMENT',
        shipmentId,
        actor: activeOperator,
        result: 'RETURNED',
        details: `Return processed. Reason: ${reason} (${remarks})`
      },
      ...prev
    ]);

    showToast(`Return recorded for shipment ${shipmentId}`);
    return { success: true, shipment: updatedShipment };
  };

  /**
   * 9. Exceptional Dispatch QR Override (§ 9)
   * Requires DISPATCH_QR_OVERRIDE permission; never a hidden bypass.
   */
  const executeDispatchQrOverride = ({
    packageId,
    shipmentId = null,
    overrideReason = '',
    approvedBy = 'Station Supervisor',
    operator = null
  }) => {
    const activeOperator = operator || session?.operator || session?.name || 'Jordan Hayes';
    const userCaps = new Set((session?.capabilities || []).map(c => String(c).toUpperCase()));

    if (!userCaps.has('DISPATCH_QR_OVERRIDE') && !userCaps.has('DISTRIBUTION_WORKSPACE')) {
      showToast('ACCESS DENIED: DISPATCH_QR_OVERRIDE capability required.');
      return { success: false, errors: ['Unauthorized: DISPATCH_QR_OVERRIDE capability required.'] };
    }

    if (!overrideReason || overrideReason.trim().length < 10) {
      return { success: false, errors: ['Audited override reason must be at least 10 characters.'] };
    }

    const pkg = dispatchPackages.find(p => p.packageId === packageId);
    if (!pkg) return { success: false, errors: ['Package not found.'] };

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedPackage = {
      ...pkg,
      isQrValidated: true,
      isOverridden: true,
      overrideDetails: {
        reason: overrideReason.trim(),
        approvedBy: approvedBy.trim(),
        operator: activeOperator,
        timestamp: nowIso
      }
    };

    setDispatchPackages(prev => prev.map(p => p.packageId === packageId ? updatedPackage : p));

    setDispatchAuditLog(prev => [
      {
        id: `dal-${Date.now()}`,
        timestamp: formattedTimestamp,
        action: 'DISPATCH_QR_OVERRIDE_EXECUTED',
        entityId: packageId,
        entityType: 'PACKAGE',
        shipmentId,
        actor: activeOperator,
        result: 'OVERRIDE_APPROVED',
        details: `Privileged QR override approved by ${approvedBy}. Reason: ${overrideReason}`
      },
      ...prev
    ]);

    showToast(`QR Override granted for ${packageId}`);
    return { success: true, package: updatedPackage };
  };

  /**
   * 8. Generate Consumer-Facing Traceability QR
   *
   * Core Dispatch Mandate: After manually reviewing all 4 journey stages
   * (Beekeeper → Processor → Lab → Package), the dispatch operator generates
   * the consumer-facing QR code with a full audit record.
   *
   * This is the ONLY action that creates a consumer QR for a package.
   * It requires explicit manual review of all stages — cannot be auto-generated.
   */
  const generateDispatchQr = ({
    packageId,
    reviewedStages = {},
    stageNotes = {},
    operator = null
  }) => {
    const activeOperator = operator || session?.operator || session?.name || 'Dispatch Operator';

    // Validate all 4 stages reviewed
    const requiredStages = ['BEEKEEPER', 'PROCESSOR', 'LAB', 'PACKAGE'];
    const missingStages = requiredStages.filter(s => !reviewedStages[s]);
    if (missingStages.length > 0) {
      return {
        success: false,
        errors: [`${missingStages.length} journey stage(s) not reviewed: ${missingStages.join(', ')}`]
      };
    }

    const pkg = dispatchPackages.find(p => p.packageId === packageId);
    if (!pkg) return { success: false, errors: ['Package not found.'] };

    if (pkg.qualityStatus !== 'APPROVED') {
      return { success: false, errors: ['Package quality status must be APPROVED before QR generation.'] };
    }

    if (pkg.consumerQrGenerated) {
      return { success: false, errors: ['Consumer QR already generated for this package.'] };
    }

    const nowIso = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const year = new Date().getFullYear();
    const publicRef = pkg.publicReference || `HC-${year}-${packageId.replace('PKG-', '').replace(/-/g, '')}`;
    const consumerUrl = QrEngineService.resolveConsumerVerificationUrl(publicRef);
    const qrCodeValue = `HONEYCHAIN:${packageId}:${publicRef}:${Date.now()}`;

    const qrData = {
      publicReference: publicRef,
      consumerUrl,
      qrCodeValue,
      qrImagePath: `/qr-codes/${packageId}.png`,
      generatedAt: nowIso,
      generatedBy: activeOperator,
      bottleSerial: pkg.packageId,
      tamperSealId: pkg.tamperSealId || 'HC-SEAL-2026-925-J125',
      batchNumber: pkg.batchNumber,
      productName: pkg.productName,
      unitDisplay: pkg.unitDisplay || '500 g',
      coaDocumentId: pkg.coaDocumentId || pkg.labReport?.documentId || 'CoA-2026-NABL-098'
    };

    // Mark package as QR generated
    setDispatchPackages(prev => prev.map(p => p.packageId === packageId ? {
      ...p,
      consumerQrGenerated: true,
      consumerQrData: qrData,
      publicReference: publicRef,
      journeyValidation: {
        completedAt: nowIso,
        completedBy: activeOperator,
        reviewedStages,
        stageNotes
      }
    } : p));

    // Write comprehensive audit log entry
    setDispatchAuditLog(prev => [
      {
        id: `dal-${Date.now()}`,
        timestamp: formattedTimestamp,
        action: 'CONSUMER_QR_GENERATED',
        entityId: packageId,
        entityType: 'PACKAGE',
        actor: activeOperator,
        result: 'QR_ISSUED',
        details: `Consumer traceability QR generated for ${packageId} (${pkg.productName}). All 4 journey stages manually reviewed and confirmed by dispatch operator. Public reference: ${publicRef}. Beekeeper note: "${stageNotes.BEEKEEPER || 'None'}". Lab note: "${stageNotes.LAB || 'None'}".`,
        qrData
      },
      ...prev
    ]);

    showToast(`Consumer QR generated for ${packageId} · Ref: ${publicRef}`);
    return { success: true, qrData };
  };

  const captureHiveImage = ({ hiveId, imageUrl }) => {
    const img = imageUrl || '/hive-inspection-sample.jpg';
    setHives((prev) =>
      prev.map((h) => {
        if (h.id === hiveId) {
          return {
            ...h,
            inspectionImage: img,
            lastInspected: 'Today',
            lastUpdate: 'Just now'
          };
        }
        return h;
      })
    );

    showToast('Inspection image captured & attached to hive');
    closeSheet();
  };

  // Save Bee Health Scan inspection record
  const saveScanInspection = ({ hiveId, imageUrl, scanResult, notes, observerNotes }) => {
    const hive = hives.find((h) => h.id === hiveId);
    if (!hive) return;

    const isConcerning = scanResult?.type === 'concerning';
    const isHealthy = scanResult?.type === 'healthy';

    const newScanRecord = {
      id: `scan-${Date.now()}`,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isoDate: new Date().toISOString(),
      resultType: scanResult?.type || 'healthy', // 'concerning' | 'healthy' | 'unclear'
      title: scanResult?.title || (isConcerning ? 'Possible signs detected' : 'No concerning signs detected'),
      condition: scanResult?.condition || (isConcerning ? 'Possible brood issue' : 'Healthy brood pattern'),
      findings: scanResult?.findings || [],
      image: imageUrl || '/hive-inspection-sample.jpg',
      notes: notes || '',
      observerNotes: observerNotes || '',
      modelVersion: 'HoneyChain-Vision-v1.4 (Field Screening)'
    };

    setHives((prev) =>
      prev.map((h) => {
        if (h.id === hiveId) {
          return {
            ...h,
            status: isConcerning ? 'attention' : isHealthy ? 'healthy' : h.status,
            statusText: isConcerning
              ? (scanResult?.condition || 'Possible brood issue detected')
              : isHealthy
              ? 'Conditions look stable.'
              : h.statusText,
            conditionSummary: isConcerning
              ? (scanResult?.condition ? `${scanResult.condition} found in latest frame.` : 'Recent scan found possible signs that need review.')
              : 'Conditions look stable.',
            inspectionImage: imageUrl || h.inspectionImage || '/hive-inspection-sample.jpg',
            lastInspected: 'Today, Just now',
            lastUpdate: 'Just now',
            healthTimeline: [newScanRecord, ...(h.healthTimeline || [])]
          };
        }
        return h;
      })
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        title: `Frame Scan — ${hive.name}`,
        description: `${newScanRecord.title}: ${newScanRecord.condition}`,
        type: 'inspection',
        badge: isConcerning ? 'Needs Attention' : 'Healthy'
      },
      ...prev
    ]);

    showToast(`Inspection saved for ${hive.name}`);
    closeScanModal();
  };

  // Manual Trigger Sync
  const triggerSync = () => {
    if (!isOnline) {
      showToast("Cannot sync while in offline mode");
      return;
    }
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setPendingSyncCount(0);
      showToast("All field logs synced to HoneyChain ledger");
    }, 1400);
  };

  // Toggle Offline mode for field demonstration
  const toggleOnlineMode = () => {
    if (isOnline) {
      setIsOnline(false);
      showToast("Switched to Offline Mode (Local Storage active)");
    } else {
      setIsOnline(true);
      if (pendingSyncCount > 0) {
        triggerSync();
      } else {
        showToast("Connected to cellular network");
      }
    }
  };

  // Startup Lifecycle Transitions
  const handleStartupComplete = (destination) => {
    setCurrentScreen(destination);
  };

  const handleLoginSuccess = (userSession) => {
    const updated = {
      ...session,
      ...userSession,
      isAuthenticated: true
    };
    if (updated.operator) {
      setApiary((prev) => ({ ...prev, operator: updated.operator }));
    }
    setSession(updated);
    persistSession(updated);

    const destination = resolveStartupDestination(updated);
    setCurrentScreen(destination);

    if (destination === StartupDestination.HOME) {
      showToast(`Welcome back, ${updated.operator || 'Apiarist'}`);
    } else if (destination === StartupDestination.ONBOARDING) {
      showToast("Account signed in • Please set up your apiary profile");
    } else if (destination === StartupDestination.VERIFICATION) {
      showToast("Verification required for your account");
    }
  };

  const handleRegisterAccount = ({ fullName, email }) => {
    const pendingSession = {
      ...session,
      email: email,
      pendingEmail: email,
      operator: fullName,
      isAuthenticated: false,
      requiresVerification: true,
      isOnboardingComplete: false
    };
    if (fullName) {
      setApiary((prev) => ({ ...prev, operator: fullName }));
    }
    setSession(pendingSession);
    persistSession(pendingSession);
    setCurrentScreen(StartupDestination.VERIFICATION);
  };

  const handleVerificationSuccess = (verifiedSession = {}) => {
    const updated = {
      ...session,
      ...verifiedSession,
      isAuthenticated: true,
      requiresVerification: false
    };
    setSession(updated);
    persistSession(updated);

    const destination = resolveStartupDestination(updated);
    setCurrentScreen(destination);

    if (destination === StartupDestination.HOME) {
      showToast(`Welcome to HoneyChain, ${updated.operator || 'Apiarist'}`);
    } else {
      showToast("Email verified • Let's set up your apiary profile");
    }
  };

  const completeWelcome = () => {
    const updated = { ...session, isAuthenticated: true };
    setSession(updated);
    persistSession(updated);
    if (!updated.isOnboardingComplete) {
      setCurrentScreen(StartupDestination.ONBOARDING);
    } else {
      setCurrentScreen(StartupDestination.HOME);
    }
  };

  // Authoritative capability-based onboarding completion
  const completeCapabilityOnboarding = ({
    capabilities = [],
    designations = [],
    workContexts = { areas: [], handles: [] },
    operatorName = null,
    apiaryName = null,
    userCapabilityProfile = null
  }) => {
    // Authoritatively resolve and sanitize access profile
    const resolvedProfile = validateAndResolveProfile({
      capabilities,
      designations,
      workContexts
    });

    if (apiaryName) {
      setApiary((prev) => ({ ...(prev || {}), name: apiaryName }));
    }
    if (operatorName) {
      setApiary((prev) => ({ ...(prev || {}), operator: operatorName }));
    }

    const updatedSession = {
      ...session,
      isAuthenticated: true,
      isOnboardingComplete: true,
      capabilities: resolvedProfile.capabilities,
      designations: resolvedProfile.designations,
      workContexts: resolvedProfile.workContexts,
      accessProfile: resolvedProfile,
      userCapabilityProfile: userCapabilityProfile || session.userCapabilityProfile || null,
      operator: operatorName || session.operator || apiary?.operator || 'Apiarist'
    };

    setSession(updatedSession);
    persistSession(updatedSession);

    // Clear any progressive onboarding drafts
    try {
      localStorage.removeItem('honeychain_onboarding_draft');
    } catch (e) {
      // Ignore
    }

    setCurrentScreen(StartupDestination.HOME);

    // Contextual confirmation toast
    const desigNames = (resolvedProfile.designations || [])
      .map(id => DESIGNATIONS.find(d => d.id === id)?.name)
      .filter(Boolean)
      .join(' + ');

    showToast(desigNames ? `Setup complete • Active as ${desigNames}` : 'Workspace setup complete & ready');
  };

  // Update capabilities & designations after onboarding from Profile / More
  const updateWorkSetup = ({
    capabilities = [],
    designations = [],
    workContexts = { areas: [], handles: [] }
  }) => {
    const resolvedProfile = validateAndResolveProfile({
      capabilities,
      designations,
      workContexts
    });

    const updatedSession = {
      ...session,
      capabilities: resolvedProfile.capabilities,
      designations: resolvedProfile.designations,
      workContexts: resolvedProfile.workContexts,
      accessProfile: resolvedProfile
    };

    setSession(updatedSession);
    persistSession(updatedSession);

    showToast("Work capabilities & workspace access updated");
  };

  // Dynamic Workspace Switching (§ 10, § 11, § 24)
  const switchActiveDesignation = (targetDesignation) => {
    if (!targetDesignation) return;
    const raw = String(targetDesignation).toUpperCase();
    const normalized = raw === 'LAB' ? 'LAB_SPECIALIST' : (raw === 'DISPATCH' ? 'DISTRIBUTOR' : raw);

    const currentDesignations = (session?.designations || []).map(d => String(d).toUpperCase());
    const updatedDesignations = currentDesignations.includes(normalized)
      ? currentDesignations
      : [...currentDesignations, normalized];

    const defaultCapsByRole = {
      BEEKEEPER: ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION', 'BEE_OBSERVATION', 'CONNECTED_HIVE_MONITORING'],
      PROCESSOR: ['PROCESSING_MANAGEMENT', 'BATCH_INTAKE', 'PROCESSING_STEP_RECORD', 'PROCESSING_COMPLETION', 'PROCESSING_EVIDENCE'],
      LAB_SPECIALIST: ['LAB_WORKSPACE', 'SAMPLE_INTAKE', 'TEST_EXECUTION', 'RESULT_REVIEW', 'TEST_RESULT_ENTRY'],
      DISTRIBUTOR: ['DISPATCH_PLANNING', 'PACKAGE_QR_VALIDATE', 'DELIVERY_TRACKING', 'SHIPMENT_CREATE', 'DELIVERY_CONFIRMATION']
    };

    const roleCaps = defaultCapsByRole[normalized] || defaultCapsByRole.BEEKEEPER;
    const mergedCaps = Array.from(new Set([...(session?.capabilities || []), ...roleCaps]));

    const updatedSession = {
      ...session,
      activeDesignation: normalized,
      designations: updatedDesignations,
      capabilities: mergedCaps
    };

    setSession(updatedSession);
    persistSession(updatedSession);
    showToast(`Active Workspace: ${normalized.replace('_', ' ')}`);
  };

  // User Account Identity Update (§ 1, § 13, § 18)
  const updateUserIdentity = (updates = {}) => {
    const updatedSession = {
      ...session,
      ...updates,
      operator: updates.legalName || updates.displayName || updates.operator || session?.operator || 'Field Operator',
      email: updates.email !== undefined ? updates.email : session?.email,
      phone: updates.phone !== undefined ? updates.phone : (updates.mobile !== undefined ? updates.mobile : session?.phone),
      avatar: updates.avatar !== undefined ? updates.avatar : session?.avatar,
      language: updates.language || session?.language || 'en'
    };
    setSession(updatedSession);
    persistSession(updatedSession);
    showToast('Profile updated');
  };

  // Designation-Specific Workspace Settings Update (§ 1, § 9, § 23)
  const updateWorkspaceSettings = (designationKey, settingsUpdates = {}) => {
    const key = (designationKey || session?.activeDesignation || 'BEEKEEPER').toUpperCase();
    const prevSettings = session?.workspaceSettings || {};
    const updatedSettings = {
      ...prevSettings,
      [key]: {
        ...(prevSettings[key] || {}),
        ...settingsUpdates
      }
    };
    const updatedSession = {
      ...session,
      workspaceSettings: updatedSettings
    };
    setSession(updatedSession);
    persistSession(updatedSession);
    showToast(`${key.replace('_', ' ')} settings saved`);
  };

  // Switch demo persona preset dynamically for evaluation & testing
  const setPersonaPreset = (personaId) => {
    const persona = DEMO_PERSONAS.find(p => p.id === personaId);
    if (!persona) return;

    if (persona.id === 'PERSONA_I_ZERO_PERMISSIONS') {
      const zeroProfile = {
        capabilities: [],
        designations: [],
        workContexts: { areas: [], handles: [] },
        moduleIds: ['traceability_journeys'],
        resolvedModules: [],
        groupedModules: {},
        permissionIds: [ACTION_PERMISSIONS.TRACEABILITY_VIEW],
        moduleJustifications: {},
        policyVersion: ACCESS_POLICY_VERSION,
        isSystemAdmin: false,
        resolvedAt: new Date().toISOString()
      };
      const updatedSession = {
        ...session,
        capabilities: [],
        designations: [],
        workContexts: { areas: [], handles: [] },
        accessProfile: zeroProfile
      };
      setSession(updatedSession);
      persistSession(updatedSession);
      showToast('Switched to Zero-Permission State (Setup Pending)');
      return;
    }

    const resolvedProfile = validateAndResolveProfile({
      capabilities: persona.capabilities,
      designations: persona.designations,
      workContexts: {
        areas: ['Processing facility', 'Apiary / farm'],
        handles: ['Hive operations', 'Honey batches', 'Quality & purity']
      }
    });

    const updatedSession = {
      ...session,
      capabilities: persona.capabilities,
      designations: persona.designations,
      accessProfile: resolvedProfile
    };

    setSession(updatedSession);
    persistSession(updatedSession);
    showToast(`Switched persona: ${persona.name}`);
  };

  const completeOnboarding = ({ name, operator, capabilities, designations, workContexts }) => {
    if (capabilities && designations) {
      completeCapabilityOnboarding({ capabilities, designations, workContexts, operatorName: operator, apiaryName: name });
      return;
    }
    if (name) {
      setApiary((prev) => ({ ...prev, name }));
    }
    if (operator) {
      setApiary((prev) => ({ ...prev, operator }));
    }
    const updated = {
      ...session,
      isAuthenticated: true,
      isOnboardingComplete: true,
      designations: session.designations?.length ? session.designations : ['beekeeper'],
      capabilities: session.capabilities?.length ? session.capabilities : ['monitor_hives', 'inspect_hives']
    };
    setSession(updated);
    persistSession(updated);
    setCurrentScreen(StartupDestination.HOME);
    showToast("Apiary profile saved & companion active");
  };

  // Reset onboarding for testing
  const resetOnboardingForTesting = () => {
    try {
      localStorage.removeItem('honeychain_onboarding_draft');
    } catch (e) {}
    const updated = {
      ...session,
      isOnboardingComplete: false,
      capabilities: [],
      designations: [],
      workContexts: { areas: [], handles: [] },
      accessProfile: null
    };
    setSession(updated);
    persistSession(updated);
    setCurrentScreen(StartupDestination.ONBOARDING);
    showToast("Onboarding reset • Welcome to capability setup");
  };

  // Truncate all records from the app for manual feeding and checking honey traceability
  const truncateAllRecords = () => {
    // 1. Clear database gateway tables
    if (honeyDatabaseGateway) {
      honeyDatabaseGateway.truncateAllData();
      setDatabaseHealth(honeyDatabaseGateway.getDatabaseDiagnostics());
    }

    // 2. Clear QR store
    try {
      productQrService?.truncateQrStore?.();
    } catch (_) {}

    // 3. Clear all React state
    setApiaries([]);
    setApiary(null);
    setHives([]);
    setFrames([]);
    setHarvestRecords([]);
    setHandoverRecords([]);
    setHiveHistoryEvents([]);
    setHiveManagementBatches([]);
    setBatches([]);
    setProcessingBatches([]);
    setProcessingAuditLog([]);
    setSelectedProcessingBatchId(null);
    setActivities([]);
    setDevices([]);
    setCollections([]);
    setQualityChecks([]);
    setLabSamples([]);
    setLabTests([]);
    setLabAuditLog([]);
    setSelectedLabSampleId(null);
    setSelectedLabTestId(null);
    setActiveLabReportSample(null);
    setDispatchPackages([]);
    setDispatchShipments([]);
    setDispatchAuditLog([]);
    setRevokedQrs([]);
    setSelectedDispatchShipmentId(null);
    setSelectedDispatchPackageId(null);
    setSelectedHiveId(null);
    setSelectedBatchId(null);

    // 4. Mark manual empty mode in localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('honeychain_db_truncated_manual_mode', 'true');
      }
    } catch (_) {}

    showToast("All records truncated. Ready for manual data feeding!");
  };

  // Replay splash screen or simulate destination testing
  const replaySplash = (simulateSessionType = null) => {
    if (simulateSessionType === 'first-time') {
      const s = { isAuthenticated: false, isOnboardingComplete: false };
      setSession(s);
      persistSession(s);
    } else if (simulateSessionType === 'pending-onboarding') {
      const s = { isAuthenticated: true, isOnboardingComplete: false, operator: 'New Beekeeper' };
      setSession(s);
      persistSession(s);
    } else if (simulateSessionType === 'authenticated') {
      const s = {
        isAuthenticated: true,
        isOnboardingComplete: true,
        operator: 'Sarah Lindqvist',
        designations: ['beekeeper', 'processor'],
        capabilities: ['monitor_hives', 'inspect_hives', 'capture_hive_images', 'collect_honey', 'create_batches', 'process_honey']
      };
      setSession(s);
      persistSession(s);
    }
    setCurrentScreen('splash');
  };

  const logout = () => {
    try {
      localStorage.removeItem('honeychain_onboarding_draft');
    } catch (e) {}
    const s = { isAuthenticated: false, isOnboardingComplete: false, operator: null, capabilities: [], designations: [] };
    setSession(s);
    persistSession(s);
    setCurrentScreen('welcome');
    showToast("Signed out of HoneyChain");
  };

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };

  // Live authoritative access profile
  const activeAccessProfile = session?.accessProfile || resolveAccessProfile({
    capabilities: session?.capabilities?.length ? session.capabilities : ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HIVE_IMAGE_CAPTURE', 'HONEY_COLLECTION'],
    designations: session?.designations?.length ? session.designations : ['BEEKEEPER'],
    workContexts: session?.workContexts || { areas: ['Apiary / farm'], handles: ['Hive operations'] }
  });

  // Action-level authorization checker
  const canPerform = (actionId) => {
    return canPerformAction(activeAccessProfile, actionId);
  };

  // Master Capability-Driven Workspace Composition (§ 15, § 35)
  const workspace = useMemo(() => {
    return composeWorkspace({
      user: session,
      capabilities: session?.capabilities?.length ? session.capabilities : ['HIVE_MANAGEMENT', 'HIVE_INSPECTION', 'HONEY_COLLECTION'],
      designations: session?.designations?.length ? session.designations : ['BEEKEEPER'],
      operationalData: {
        hives,
        batches,
        qualityChecks,
        collections,
        devices,
        activities,
        handoverRecords,
        harvestRecords,
        pendingIntakeCount: (handoverRecords || []).filter(h => 
          h.status === 'SUBMITTED_TO_PROCESSOR' || 
          h.status === 'SUBMITTED_BY_BEEKEEPER' || 
          h.status === 'AWAITING_INTAKE' || 
          h.status === 'HARVESTED' || 
          !h.status
        ).length + (harvestRecords || []).filter(hrv => !(handoverRecords || []).some(h => (hrv.id && h.harvestRecordId === hrv.id) || h.id === hrv.id)).length
      },
      workflowState: {
        isOnline,
        isSyncing,
        pendingSyncCount
      }
    });
  }, [session, hives, batches, qualityChecks, collections, devices, activities, handoverRecords, harvestRecords, isOnline, isSyncing, pendingSyncCount]);

  // Dynamically apply the 20-palette visual identity to the document
  useEffect(() => {
    if (workspace?.visualProfile) {
      WorkspaceVisualIdentityService.applyWorkspaceTheme(workspace.visualProfile);
    }
  }, [workspace?.visualProfile]);

  return (
    <AppStateContext.Provider
      value={{
        session,
        workspace,
        composedWorkspace: workspace,
        visualProfile: workspace?.visualProfile,
        can: (permissionId, resource = null, wsId = null) => AuthorizationService.can(session, permissionId, resource, wsId),
        canAny: (permissionIds = [], resource = null, wsId = null) => AuthorizationService.canAny(session, permissionIds, resource, wsId),
        canAll: (permissionIds = [], resource = null, wsId = null) => AuthorizationService.canAll(session, permissionIds, resource, wsId),
        AuthorizationService,
        currentScreen,
        navigateTo,
        handleStartupComplete,
        handleLoginSuccess,
        handleRegisterAccount,
        handleVerificationSuccess,
        completeWelcome,
        completeOnboarding,
        completeCapabilityOnboarding,
        updateWorkSetup,
        switchActiveDesignation,
        updateUserIdentity,
        updateWorkspaceSettings,
        activeDesignation: session?.activeDesignation || session?.designations?.[0] || 'BEEKEEPER',
        setPersonaPreset,
        demoPersonas: DEMO_PERSONAS,
        resetOnboardingForTesting,
        accessProfile: activeAccessProfile,
        userCapabilities: session?.capabilities || [],
        userDesignations: session?.designations || [],
        userCapabilityProfile: session?.userCapabilityProfile || null,
        userWorkContexts: session?.workContexts || { areas: [], handles: [] },
        canPerform,
        policyVersion: ACCESS_POLICY_VERSION,
        getAuditLog,
        ACTION_PERMISSIONS,
        logout,
        replaySplash,
        activeTab,
        setActiveTab: setTab,
        rawSetActiveTab: setActiveTab,
        apiary,
        hives,
        batches,
        activities,
        devices,
        setDevices,
        isOnline,
        isSyncing,
        pendingSyncCount,
        selectedHiveId,
        setSelectedHiveId,
        selectedBatchId,
        setSelectedBatchId,
        activeSheet,
        sheetPayload,
        openSheet,
        closeSheet,
        logInspection,
        createBatch,
        addHive,
        archiveHive,
        deleteHive,
        trashHive,
        recordObservation,
        captureHiveImage,
        isScanModalOpen,
        scanTargetHiveId,
        openScanModal,
        closeScanModal,
        saveScanInspection,
        triggerSync,
        toggleOnlineMode,
        activeInspectionResult,
        openInspectionResult,
        closeInspectionResult,
        activeInspectionSaved,
        openInspectionSaved,
        closeInspectionSaved,
        collections,
        activeCollectionDetails,
        openCollectionDetails,
        closeCollectionDetails,
        updateCollection,
        qualityChecks,
        activeQualityCheck,
        openQualityCheck,
        closeQualityCheck,
        updateQualityCheck,
        completeQualityDecision,
        activeBatchJourney,
        openBatchJourney,
        closeBatchJourney,
        activeVerification,
        openVerification,
        closeVerification,
        verifyBatch,
        activeTechnicalProof,
        openTechnicalProof,
        closeTechnicalProof,
        activePublicVerification,
        openPublicVerification,
        closePublicVerification,
        activeProductScanner,
        openProductScanner,
        closeProductScanner,
        activeProductQrManagement,
        openProductQrManagement,
        closeProductQrManagement,
        activeProductPackaging,
        openProductPackaging,
        closeProductPackaging,
        toastMessage,
        showToast,
        // Beekeeper Domain State & Actions
        apiaries,
        setApiaries,
        frames,
        setFrames,
        harvestRecords,
        setHarvestRecords,
        handoverRecords,
        setHandoverRecords,
        hiveHistoryEvents,
        setHiveHistoryEvents,
        hiveManagementBatches,
        setHiveManagementBatches,
        createHiveManagementBatch,
        createBatchWithHivesAndFrames,
        updateHiveBatchMember,
        getHiveInspectionSchedule,
        registerFrame,
        updateFrameStatus,
        recordFrameInspection,
        recordHarvest,
        submitHarvestToProcessor,
        addApiary,
        setApiary,
        deleteApiary,
        // Master Processor Domain State & Actions
        processingBatches,
        setProcessingBatches,
        processingAuditLog,
        setProcessingAuditLog,
        selectedProcessingBatchId,
        setSelectedProcessingBatchId,
        acceptHarvestIntake,
        rejectHarvestIntake,
        holdHarvestIntake,
        createProcessingBatch,
        recordProcessingStep,
        skipProcessingStep,
        recordBatchDeviation,
        resolveBatchDeviation,
        updateBatchApprovedPlan,
        putBatchOnHold,
        resumeBatchFromHold,
        submitBatchToQuality,
        // Master Laboratory Domain State & Actions
        labSamples,
        setLabSamples,
        labTests,
        setLabTests,
        labAuditLog,
        setLabAuditLog,
        selectedLabSampleId,
        setSelectedLabSampleId,
        selectedLabTestId,
        setSelectedLabTestId,
        activeLabReportSample,
        setActiveLabReportSample,
        labReports,
        setLabReports,
        sendLabReportToProcessorAndDispatch,
        receiveSampleIntake,
        acceptSampleIntake,
        rejectSampleIntake,
        putSampleOnHold,
        assignLabTest,
        startLabTest,
        recordTestMeasurement,
        reviewTestResult,
        correctTestResult,
        submitQualityRecommendation,
        executeQualityDecision,
        // Master Dispatch & Distributor Domain State & Actions
        dispatchPackages,
        setDispatchPackages,
        dispatchShipments,
        setDispatchShipments,
        dispatchAuditLog,
        setDispatchAuditLog,
        revokedQrs,
        setRevokedQrs,
        selectedDispatchShipmentId,
        setSelectedDispatchShipmentId,
        selectedDispatchPackageId,
        setSelectedDispatchPackageId,
        validatePackageQr,
        createDispatchShipment,
        allocatePackageToShipment,
        removePackageFromShipment,
        releaseDispatchShipment,
        updateShipmentStatus,
        recordDeliveryConfirmation,
        recordDeliveryException,
        recordReturnRequest,
        executeDispatchQrOverride,
        generateDispatchQr,
        databaseHealth,
        databaseConnected,
        truncateAllRecords
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
